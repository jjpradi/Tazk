import {Box, Breadcrumbs, Button, Card, Chip, FormControlLabel, Grid, IconButton, InputAdornment, Link, Stack, Switch, TextField, Tooltip, Typography, useTheme} from '@mui/material';
import React, {useContext, useEffect, useMemo, useState} from 'react';
import Tree from 'react-accessible-treeview';
import {useDispatch, useSelector} from 'react-redux';
import {getaccTypeAction} from 'redux/actions/chartOfAccounts';
import apiCalls from 'utils/apiCalls';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CommonSearch from 'utils/commonSearch';
import LedgerMonthlySummary from '../GeneralLedger/ledgerMonthlySummary';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {listGeneralLedgerMonthlySummaryAction} from 'redux/actions/generalLedger';
import {listAllLedgerVouchersAction} from 'redux/actions/ledger_actions';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getFYPresets } from '../reports/reportUtils';

const StatCard = ({ label, value, color }) => (
  <Card
    variant='outlined'
    sx={{
      padding: '10px 12px', width: '100%', borderRadius: '6px', textAlign: 'center',
      bgcolor: `${color}14`, borderColor: `${color}40`, borderWidth: 1,
    }}
  >
    <Typography sx={{ fontSize: 12, fontWeight: 500, color: 'text.secondary', mb: 0.3 }}>{label}</Typography>
    <Typography sx={{ fontSize: 15, fontWeight: 700, color }}>{value}</Typography>
  </Card>
);

const ChartOfAccounts = () => {
  const theme = useTheme();
  const {
    ChartOfAccountsReducer: {acctypes},
    generalLedgerReducer: {generalLedger_monthly_summary},
    ledgerReducer: {all_ledger_vouchers},
    rbacReducer: { menuAccess }
  } = useSelector((state) => state);

  const {setModalTypeHandler, setLoaderStatusHandler} = useContext(CreateNewButtonContext);
  const storage = getsessionStorage();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [ledgerName, setledgerName] = useState();
  const [voucherOpen, setVoucherOpen] = useState(false);
  const [ledger_id, setLedgerid] = useState();
  const [searchVal, setSearchVal] = useState('');
  const [expandAll, setExpandAll] = useState(false);
  const [treeKey, setTreeKey] = useState(0);
  const [hideZero, setHideZero] = useState(false);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [savedExpandedIds, setSavedExpandedIds] = useState(null);
  const fyPresets = getFYPresets()

  useEffect(() => {
    apiCalls(
      setModalTypeHandler, setLoaderStatusHandler,
      dispatch(getaccTypeAction(setModalTypeHandler, setLoaderStatusHandler)),
    );
  }, []);

  const selectedRole = storage.role_name
  useEffect(() => {
    if (!selectedRole) return;
    apiCalls(setModalTypeHandler, setLoaderStatusHandler, dispatch(getMenuAccessAction(selectedRole)));
  }, [selectedRole, dispatch]);

  const exportRights = UserRightsAuthorization(menuAccess[selectedRole], 'accounts__ledgers', 'can_export')

  const buildTree = (rows) => {
    let id = 1;
    const nodeMap = {};
    const root = {id: 0, name: 'Root', children: [], parent: null};

    // Pre-compute consolidated totals from rollup rows + parent's own direct transactions
    // Rollup rows: parentAccountName set, accountName NULL — children's subtotal
    // Direct rows: accountName matches a parentAccountName, no parentAccountName — parent's own amount
    const parentRollupAmounts = {};
    const parentDirectAmounts = {};
    const allParentNames = new Set();

    // Collect all parent account names
    rows.forEach(row => {
      if (row.parentAccountName && row.accountName) allParentNames.add(row.parentAccountName);
    });

    rows.forEach(row => {
      // Rollup row: children subtotal
      if (row.parentAccountName && !row.accountName) {
        const key = `${row.accountGroupName}::${row.parentAccountName}`;
        parentRollupAmounts[key] = Number(row.sumAmount) || 0;
      }
      // Direct transactions on the parent account itself (appears as accountName with no parentAccountName)
      if (row.accountName && !row.parentAccountName && allParentNames.has(row.accountName)) {
        const key = row.accountName;
        parentDirectAmounts[key] = (parentDirectAmounts[key] || 0) + (Number(row.sumAmount) || 0);
      }
    });

    function getOrCreateNode(level, key, parentId, label, amount, accountId, accountCode) {
      const nodeKey = `${level}:${key}:${parentId}`;
      if (!nodeMap[nodeKey]) {
        nodeMap[nodeKey] = {
          id: id++,
          name: label,
          children: [],
          parent: parentId,
          metadata: {amount, accountCode},
          acc_id: accountId,
        };
      }
      return nodeMap[nodeKey];
    }

    rows.forEach((row) => {
      let parent = root;

      if (row.accountTypeName) {
        parent = getOrCreateNode(1, row.accountTypeName, root.id, row.accountTypeName, row.sumAmount, row.accountId, null);
        if (!root.children.includes(parent.id)) root.children.push(parent.id);
      }

      if (row.accountGroupName) {
        const node = getOrCreateNode(2, row.accountGroupName, parent.id, row.accountGroupName, row.sumAmount, row.accountId, null);
        if (!parent.children.includes(node.id)) parent.children.push(node.id);
        parent = node;
      }

      if (row.parentAccountName) {
        // Use rollup consolidated amount + parent's own direct transactions
        const rollupKey = `${row.accountGroupName}::${row.parentAccountName}`;
        const rollupAmt = parentRollupAmounts[rollupKey] !== undefined ? parentRollupAmounts[rollupKey] : 0;
        const directAmt = parentDirectAmounts[row.parentAccountName] || 0;
        const consolidatedAmount = rollupAmt + directAmt;
        const node = getOrCreateNode(3, row.parentAccountName, parent.id, row.parentAccountName, consolidatedAmount || row.sumAmount, row.accountId, null);
        if (!parent.children.includes(node.id)) parent.children.push(node.id);
        parent = node;
      }

      if (row.accountName) {
        // Skip if this account also exists as a parent (its amount is already consolidated into the parent node)
        if (!row.parentAccountName && allParentNames.has(row.accountName)) return;
        const node = getOrCreateNode(4, row.accountName, parent.id, row.accountName, row.sumAmount, row.accountId, row.accountCode);
        if (!parent.children.includes(node.id)) parent.children.push(node.id);
        parent = node;
      }
    });

    return [root, ...Object.values(nodeMap)];
  };

  const getLevelOneNodeIds = (data) => {
    const rootNodes = data.filter((node) => !node.parent);
    let levelOneIds = [];
    for (const root of rootNodes) {
      if (Array.isArray(root.children)) levelOneIds.push(root.id);
    }
    return levelOneIds;
  };

  const getAllNodeIds = (data) => data.map(n => n.id);

  const data = buildTree(acctypes || []);
  const expandedIds = savedExpandedIds || (expandAll ? getAllNodeIds(data) : getLevelOneNodeIds(data));

  // Compute summary totals from level-1 nodes
  const summaryTotals = useMemo(() => {
    const totals = { assets: 0, liabilities: 0, equity: 0, revenue: 0, expense: 0 };
    data.forEach(node => {
      if (node.parent === 0 && node.name) {
        const amt = Number(node.metadata?.amount) || 0;
        const key = node.name.toLowerCase();
        if (key.includes('asset')) totals.assets = amt;
        else if (key.includes('liabilit')) totals.liabilities = amt;
        else if (key.includes('equity')) totals.equity = amt;
        else if (key.includes('revenue') || key.includes('income')) totals.revenue = amt;
        else if (key.includes('expense') || key.includes('cost')) totals.expense = amt;
      }
    });
    totals.netWorth = totals.assets + totals.liabilities + totals.equity;
    return totals;
  }, [data]);

  // Count leaf nodes per group
  const leafCounts = useMemo(() => {
    const counts = {};
    const countLeaves = (nodeId) => {
      const node = data.find(n => n.id === nodeId);
      if (!node) return 0;
      if (!node.children || node.children.length === 0) return 1;
      let total = 0;
      node.children.forEach(childId => { total += countLeaves(childId); });
      return total;
    };
    data.forEach(node => {
      if (node.id !== 0 && node.children && node.children.length > 0) {
        counts[node.id] = countLeaves(node.id);
      }
    });
    return counts;
  }, [data]);

  const handleToggleExpandAll = () => {
    setExpandAll(prev => !prev);
    setTreeKey(prev => prev + 1);
  };

  const getAncestorIds = (element) => {
    const ids = [];
    let current = element;
    while (current && current.id !== 0) {
      ids.push(current.id);
      current = data.find(n => n.id === current.parent);
    }
    ids.push(0);
    return ids;
  };

  const handleMonthlySummayOpen = (id, trail, element) => {
    if (id) {
      // Save expanded path so tree restores on back
      if (element) {
        const ancestorIds = getAncestorIds(element);
        const currentExpanded = expandAll ? getAllNodeIds(data) : getLevelOneNodeIds(data);
        setSavedExpandedIds([...new Set([...currentExpanded, ...ancestorIds])]);
      }
      apiCalls(
        setModalTypeHandler, setLoaderStatusHandler,
        dispatch(listGeneralLedgerMonthlySummaryAction(id, fyPresets[0]?.fromDate, fyPresets[0]?.toDate, setModalTypeHandler, setLoaderStatusHandler)),
      );
      setOpen(true);
      setVoucherOpen(false);
      setLedgerid(id);
      if (trail) setBreadcrumb(trail);
    }
  };

  const handleBackBtn = () => {
    setOpen(false);
    setBreadcrumb([]);
    setTreeKey(prev => prev + 1);
  };

  const handleVoucherOpen = (bol, data) => {
    if (bol === true && data.month) {
      let payload = { ledger_id, monthStart: data.monthStart, monthEnd: data.monthEnd };
      apiCalls(
        setModalTypeHandler, setLoaderStatusHandler,
        dispatch(listAllLedgerVouchersAction(payload, setModalTypeHandler, setLoaderStatusHandler)),
      );
    }
    setVoucherOpen(bol);
  };

  const matchesSearch = (name) => {
    if (!searchVal) return true;
    return name?.toLowerCase().includes(searchVal.toLowerCase());
  };

  // Build breadcrumb trail for a node
  const buildBreadcrumb = (element) => {
    const trail = [];
    let current = element;
    while (current && current.id !== 0) {
      trail.unshift(current.name);
      current = data.find(n => n.id === current.parent);
    }
    return trail;
  };

  const formatAmount = (val) => `₹${Number(Math.round(val)).toLocaleString('en-IN')}`;

  const primary = theme.palette.primary.main;

  return (
    <div style={{fontFamily: 'sans-serif'}}>
      <Helmet>
        <meta charSet="utf-8" />
        <title> {titleURL} | Chart Of Accounts </title>
      </Helmet>
      {!open && (
        <Card sx={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
          {/* ---- Header ---- */}
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: 2.5, py: 1,
            borderBottom: `2px solid ${primary}`,
            bgcolor: `${primary}08`,
            flexShrink: 0,
          }}>
            <Typography component="span" sx={{ fontWeight: 600, fontSize: 14, color: primary }}>
              Chart of Accounts
            </Typography>

            <Stack direction="row" alignItems="center" spacing={1}>
              <FormControlLabel
                control={<Switch size="small" checked={hideZero} onChange={(e) => { setHideZero(e.target.checked); setTreeKey(prev => prev + 1); }} />}
                label={<Typography sx={{ fontSize: 11, color: 'text.secondary' }}>Hide zero</Typography>}
                sx={{ mr: 0 }}
              />
              <CommonSearch
                searchVal={searchVal}
                requestSearch={(e) => setSearchVal(e.target.value)}
                cancelSearch={() => setSearchVal('')}
              />
              <Tooltip title={expandAll ? 'Collapse All' : 'Expand All'}>
                <IconButton size="small" onClick={handleToggleExpandAll}>
                  {expandAll ? <UnfoldLessIcon fontSize="small" /> : <UnfoldMoreIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          {/* ---- Summary Stat Cards ---- */}
          <Box sx={{ px: 2.5, pt: 1.5, pb: 1, flexShrink: 0 }}>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6, sm: 2.4 }}>
                <StatCard label="Total Assets" value={formatAmount(summaryTotals.assets)} color={theme.palette.success.main} />
              </Grid>
              <Grid size={{ xs: 6, sm: 2.4 }}>
                <StatCard label="Total Liabilities" value={formatAmount(summaryTotals.liabilities)} color={theme.palette.error.main} />
              </Grid>
              <Grid size={{ xs: 6, sm: 2.4 }}>
                <StatCard label="Equity" value={formatAmount(summaryTotals.equity)} color={theme.palette.info.main} />
              </Grid>
              <Grid size={{ xs: 6, sm: 2.4 }}>
                <StatCard label="Revenue - Expense" value={formatAmount(summaryTotals.revenue + summaryTotals.expense)} color={theme.palette.warning.main} />
              </Grid>
              <Grid size={{ xs: 12, sm: 2.4 }}>
                <StatCard label="Net Worth" value={formatAmount(summaryTotals.netWorth)} color={primary} />
              </Grid>
            </Grid>
          </Box>

          {/* ---- Tree Content ---- */}
          <Box sx={{ flex: 1, overflow: 'auto', px: 1 }}>
            {data.length > 1 ? (
              <Tree
                key={treeKey}
                data={data}
                aria-label='Chart of Accounts'
                openByDefault={(node) => expandAll || node.level <= 1}
                defaultExpandedIds={expandedIds}
                nodeRenderer={({element, getNodeProps, level}) => {
                  const isTotalLine = element.name?.toLowerCase().includes('total');
                  const hasAmount = element.metadata?.amount !== undefined;
                  const accountCode = element.metadata?.accountCode;

                  const nodeProps = getNodeProps();
                  const isExpanded = nodeProps['aria-expanded'] === 'true';
                  const hasChildren = Array.isArray(element.children) && element.children.length > 0;
                  const isLeafNode = !hasChildren;
                  const childCount = leafCounts[element.id];

                  if (searchVal && isLeafNode && !matchesSearch(element.name) && !matchesSearch(accountCode)) {
                    return null;
                  }

                  if (hideZero && isLeafNode && (!element.metadata?.amount || Number(element.metadata.amount) === 0)) {
                    return null;
                  }

                  const levelColors = {
                    1: primary,
                    2: theme.palette.info.main,
                    3: theme.palette.warning.dark,
                  };

                  return (
                    <Grid
                      {...getNodeProps()}
                      container
                      sx={{
                        borderBottom: hasAmount ? '1px solid #f0f0f0' : 'none',
                        fontSize: '13px',
                        py: 0.3,
                        px: 0.5,
                        alignItems: 'center',
                        bgcolor: level === 1 ? `${primary}06` : 'transparent',
                        '&:hover': { bgcolor: `${primary}08` },
                      }}
                    >
                      <Grid size={{ lg: 7, md: 7, sm: 11, xs: 11 }}>
                        <Button
                          fullWidth
                          sx={{
                            display: 'flex', justifyContent: 'start', textTransform: 'none',
                            minHeight: 0, py: 0.25,
                          }}
                          onClick={() => {
                            if (isLeafNode) {
                              setledgerName(element?.name);
                              const trail = buildBreadcrumb(element);
                              handleMonthlySummayOpen(element?.acc_id, trail, element);
                            }
                          }}
                        >
                          <div style={{
                            display: 'flex', alignItems: 'center',
                            fontWeight: isTotalLine || level <= 2 ? 700 : level === 3 ? 600 : 400,
                            color: isTotalLine ? theme.palette.warning.dark : (levelColors[level] || 'text.primary'),
                            fontSize: level === 1 ? 14 : 13,
                          }}>
                            {hasChildren || level <= 2 ? (
                              isExpanded ? (
                                <RemoveCircleOutlineIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              ) : (
                                <AddCircleOutlineIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              )
                            ) : (
                              <ArrowRightIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                            )}
                            <span style={{marginLeft: 4}}>{element.name}</span>
                            {accountCode && isLeafNode && (
                              <Typography component="span" sx={{ ml: 1, fontSize: 11, color: 'text.secondary', fontWeight: 400 }}>
                                {accountCode}
                              </Typography>
                            )}
                            {childCount > 0 && (
                              <Typography component="span" sx={{ ml: 0.75, fontSize: 10, color: 'text.disabled', fontWeight: 400 }}>
                                ({childCount})
                              </Typography>
                            )}
                          </div>
                        </Button>
                      </Grid>
                      <Grid size={{ lg: 5, md: 5, sm: 1, xs: 1 }}>
                        {hasAmount && (
                          <div style={{
                            display: 'flex', justifyContent: 'flex-end',
                            height: '100%', paddingRight: '40px',
                          }}>
                            <Typography sx={{
                              fontWeight: level <= 2 || isTotalLine ? 700 : 500,
                              fontSize: 13,
                              color: isTotalLine
                                ? theme.palette.warning.dark
                                : Number(element.metadata.amount) < 0
                                  ? theme.palette.error.main
                                  : theme.palette.success.main,
                            }}>
                              {formatAmount(element.metadata.amount)}
                            </Typography>
                          </div>
                        )}
                      </Grid>
                    </Grid>
                  );
                }}
              />
            ) : (
              data.length === 0 && (
                <div style={{display: 'flex', justifyContent: 'center', padding: 40}}>
                  <Typography color="text.secondary">No Records to display.</Typography>
                </div>
              )
            )}
          </Box>
        </Card>
      )}
      {open && (
        <>
          {/* ---- Breadcrumb ---- */}
          {breadcrumb.length > 0 && (
            <Box sx={{ px: 2.5, py: 1, bgcolor: `${primary}04`, borderBottom: '1px solid #f0f0f0' }}>
              <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ fontSize: 12 }}>
                <Link
                  underline="hover"
                  sx={{ fontSize: 12, cursor: 'pointer', color: primary, fontWeight: 500 }}
                  onClick={handleBackBtn}
                >
                  Chart of Accounts
                </Link>
                {breadcrumb.map((crumb, idx) => (
                  idx === breadcrumb.length - 1 ? (
                    <Typography key={idx} sx={{ fontSize: 12, fontWeight: 600, color: 'text.primary' }}>
                      {crumb}
                    </Typography>
                  ) : (
                    <Typography key={idx} sx={{ fontSize: 12, color: 'text.secondary' }}>
                      {crumb}
                    </Typography>
                  )
                ))}
              </Breadcrumbs>
            </Box>
          )}
          <LedgerMonthlySummary
            handleBackBtn={handleBackBtn}
            generalLedger_monthly_summary={generalLedger_monthly_summary}
            voucherOpen={voucherOpen}
            handleVoucherOpen={handleVoucherOpen}
            ledgerName={ledgerName}
            ledger_id={ledger_id}
            all_ledger_vouchers={all_ledger_vouchers}
            exportRights={exportRights}
            onLedgerClick={(contraId, contraName) => {
              setledgerName(contraName);
              handleMonthlySummayOpen(contraId, ['...', contraName]);
            }}
          />
        </>
      )}
    </div>
  );
};

export default ChartOfAccounts;
