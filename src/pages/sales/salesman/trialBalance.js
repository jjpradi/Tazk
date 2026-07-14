
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import moment from "moment";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  CircularProgress,
  Chip,
  Divider,
  Card,
  Grid,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FilterAlt } from "@mui/icons-material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment as DateAdapter } from "@mui/x-date-pickers/AdapterMoment";
import toMomentOrNull from "utils/DateFixer";
import { useNavigate } from "react-router-dom";
import { titleURL } from "http-common";
import { useCustomFetch } from "utils/useCustomFetch";

const rangeOptions = [
  'Today',
  'Yesterday',
  'This Week',
  'Last Week',
  'Last 7 Days',
  'This Month',
  'Last Month',
  'This Quarter',
  'Last Quarter',
  'Current Fiscal Year',
  'Previous Fiscal Year',
  'Last 365 days',
  'Custom',
];

const getFiscalYearRange = () => {
  const start = moment().month() >= 3
    ? moment().month(3).startOf('month')
    : moment().subtract(1, 'year').month(3).startOf('month');
  const end = start.clone().add(1, 'year').subtract(1, 'day');
  return { start, end };
};

const TrialBalanceReport = () => {
  const fetcher = useCustomFetch();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [calculated, setCalculated] = useState({
    openingBalanceAdjustment: null,
    cogsTotal: null,
    cogsBreakdown: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  const [filterOpen, setFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Today');
  const today = moment().format('YYYY-MM-DD');
  const [filterDetails, setFilterDetails] = useState({
    rangeOption: 'Today',
    fromDate: today,
    toDate: today,
    status: 'active',
    includeZero: true,
  });
  const [appliedFilters, setAppliedFilters] = useState({
    fromDate: today,
    toDate: today,
    status: 'active',
    includeZero: true,
  });

  const didFetchRef = useRef(false);


  /* ---------------- Debounce Search ---------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  /* ---------------- API Call ---------------- */
  const fetchTrialBalance = useCallback(async () => {
    setLoading(true);
    setError(null);

    const config = {
      params: {
        status: appliedFilters.status,
        includeZero: appliedFilters.includeZero,
        fromDate: appliedFilters.fromDate,
        toDate: appliedFilters.toDate,
        search: debouncedSearch,
      },
    };

    const { data, error: fetchError } = await fetcher(
      '/accountsservice/api/trialbalance/reports/trial-balance',
      'GET',
      {},
      config
    );

    if (fetchError) {
      setError(fetchError);
      setRows([]);
      setCalculated({
        openingBalanceAdjustment: null,
        cogsTotal: null,
        cogsBreakdown: null,
      });
    } else {
      setRows(Array.isArray(data?.rows) ? data.rows : []);
      setCalculated({
        openingBalanceAdjustment: data?.calculated?.openingBalanceAdjustment ?? null,
        cogsTotal: data?.calculated?.cogsTotal ?? null,
        cogsBreakdown: data?.calculated?.cogsBreakdown ?? null,
      });
    }

    setExpandedIds(new Set());
    setLoading(false);
  }, [fetcher, debouncedSearch, appliedFilters]);

  const handleFilterApply = () => {
    setAppliedFilters({
      fromDate: moment(filterDetails.fromDate).format('YYYY-MM-DD'),
      toDate: moment(filterDetails.toDate).format('YYYY-MM-DD'),
      status: filterDetails.status,
      includeZero: filterDetails.includeZero,
    });
    setFilterOpen(false);
  };

  const quickTabs = useMemo(() => {
    const fy = getFiscalYearRange();
    const prevFyStart = moment().month() >= 3
      ? moment().subtract(1, 'year').month(3).startOf('month')
      : moment().subtract(2, 'year').month(3).startOf('month');
    return [
      { label: 'Current FY', from: fy.start.format('YYYY-MM-DD'), to: fy.end.format('YYYY-MM-DD') },
      { label: 'Last FY', from: prevFyStart.format('YYYY-MM-DD'), to: prevFyStart.clone().add(1, 'year').subtract(1, 'day').format('YYYY-MM-DD') },
      { label: 'This Month', from: moment().startOf('month').format('YYYY-MM-DD'), to: moment().endOf('month').format('YYYY-MM-DD') },
      { label: 'Today', from: today, to: today },
    ];
  }, [today]);

  const handleQuickTab = (tab) => {
    setActiveTab(tab.label);
    setFilterDetails((prev) => ({
      ...prev,
      rangeOption: tab.label === 'Current FY' ? 'Current Fiscal Year'
        : tab.label === 'Last FY' ? 'Previous Fiscal Year'
        : tab.label === 'This Month' ? 'This Month'
        : 'Today',
      fromDate: tab.from,
      toDate: tab.to,
    }));
    setAppliedFilters((prev) => ({
      ...prev,
      fromDate: tab.from,
      toDate: tab.to,
    }));
  };

  const handleFilterClear = () => {
    const resetDate = moment().format('YYYY-MM-DD');
    const reset = {
      rangeOption: 'Today',
      fromDate: resetDate,
      toDate: resetDate,
      status: 'active',
      includeZero: true,
    };
    setFilterDetails(reset);
    setAppliedFilters({
      fromDate: reset.fromDate,
      toDate: reset.toDate,
      status: reset.status,
      includeZero: reset.includeZero,
    });
    setFilterOpen(false);
  };

  const handleRangeChange = (newValue) => {
    if (newValue === 'Custom') {
      setFilterDetails((prev) => ({
        ...prev,
        rangeOption: 'Custom',
        fromDate: null,
        toDate: null,
      }));
      return;
    }
    let startDate = null;
    let endDate = null;
    switch (newValue) {
      case 'Today':
        startDate = endDate = moment().startOf('day');
        break;
      case 'Yesterday':
        startDate = endDate = moment().subtract(1, 'day').startOf('day');
        break;
      case 'This Week':
        startDate = moment().startOf('week');
        endDate = moment().endOf('week');
        break;
      case 'Last Week':
        startDate = moment().subtract(1, 'week').startOf('week');
        endDate = moment().subtract(1, 'week').endOf('week');
        break;
      case 'Last 7 Days':
        startDate = moment().subtract(6, 'days').startOf('day');
        endDate = moment().endOf('day');
        break;
      case 'This Month':
        startDate = moment().startOf('month');
        endDate = moment().endOf('month');
        break;
      case 'Last Month':
        startDate = moment().subtract(1, 'month').startOf('month');
        endDate = moment().subtract(1, 'month').endOf('month');
        break;
      case 'This Quarter':
        startDate = moment().startOf('quarter');
        endDate = moment().endOf('quarter');
        break;
      case 'Last Quarter':
        startDate = moment().subtract(1, 'quarter').startOf('quarter');
        endDate = moment().subtract(1, 'quarter').endOf('quarter');
        break;
      case 'Current Fiscal Year': {
        const fy = getFiscalYearRange();
        startDate = fy.start;
        endDate = fy.end;
        break;
      }
      case 'Previous Fiscal Year': {
        const fyStart = moment().month() >= 3
          ? moment().subtract(1, 'year').month(3).startOf('month')
          : moment().subtract(2, 'year').month(3).startOf('month');
        startDate = fyStart;
        endDate = fyStart.clone().add(1, 'year').subtract(1, 'day');
        break;
      }
      case 'Last 365 days':
        startDate = moment().subtract(364, 'days').startOf('day');
        endDate = moment().endOf('day');
        break;
      default:
        return;
    }
    setFilterDetails((prev) => ({
      ...prev,
      rangeOption: newValue,
      fromDate: startDate.format('YYYY-MM-DD'),
      toDate: endDate.format('YYYY-MM-DD'),
    }));
  };

 /* ---------------- Initial Load (StrictMode Safe) ---------------- */
  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    fetchTrialBalance();
  }, [fetchTrialBalance]);

  /* ---------------- Re-fetch on filter apply / clear ---------------- */
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    fetchTrialBalance();
  }, [appliedFilters]);

  const getRowDebit = useCallback((row) => {
    if (row?.debitAmount !== undefined || row?.creditAmount !== undefined) {
      return Number(row?.debitAmount || 0);
    }
    const closingDebit = Number(row?.closingDebit || 0);
    const closingCredit = Number(row?.closingCredit || 0);
    const net = closingDebit - closingCredit;
    return net > 0 ? net : 0;
  }, []);

  const getRowCredit = useCallback((row) => {
    if (row?.debitAmount !== undefined || row?.creditAmount !== undefined) {
      return Number(row?.creditAmount || 0);
    }
    const closingDebit = Number(row?.closingDebit || 0);
    const closingCredit = Number(row?.closingCredit || 0);
    const net = closingDebit - closingCredit;
    return net < 0 ? Math.abs(net) : 0;
  }, []);

  /* ---------------- Tree Build ---------------- */
  const { rootsByType, typeOrder } = useMemo(() => {
    const byId = new Map();
    const roots = new Map();
    const order = [];

    rows.forEach((row) => {
      if (!byId.has(row.accountId)) {
        byId.set(row.accountId, { ...row, children: [] });
      }
    });

    rows.forEach((row) => {
      const node = byId.get(row.accountId);
      const isRoundOff = /^round\s*off$/i.test(String(row.accountName || '').trim());
      const parentName = String(row.parentAccountName || '').toLowerCase();
      const underAdministrative = /administrative/.test(parentName);
      const parentId = isRoundOff && underAdministrative ? null : row.parentAccountId;

      if (parentId && byId.has(parentId)) {
        byId.get(parentId).children.push(node);
      } else {
        const typeName = row.accountTypeName || 'Other';
        if (!roots.has(typeName)) {
          roots.set(typeName, []);
          order.push(typeName);
        }
        roots.get(typeName).push(node);
      }
    });

    // Backend exposes only each row's OWN postings on parents; roll children up here
    // so a parent row displays its subtree total and the grand total ties.
    const computeSubtree = (node) => {
      let debit = Number(node.debitAmount || 0);
      let credit = Number(node.creditAmount || 0);
      for (const child of node.children) {
        const sub = computeSubtree(child);
        debit += sub.debit;
        credit += sub.credit;
      }
      node._subtreeDebit = debit;
      node._subtreeCredit = credit;
      return { debit, credit };
    };
    roots.forEach((nodeList) => nodeList.forEach(computeSubtree));

    // Put "Round Off" right after "Indirect Expenses" in root ordering.
    roots.forEach((nodeList) => {
      nodeList.sort((a, b) => {
        const aName = String(a.accountName || '').toLowerCase();
        const bName = String(b.accountName || '').toLowerCase();
        if (aName === bName) return 0;
        if (aName === 'indirect expenses' && /^round\s*off$/.test(bName)) return -1;
        if (bName === 'indirect expenses' && /^round\s*off$/.test(aName)) return 1;
        if (/^round\s*off$/.test(aName)) return 1;
        if (/^round\s*off$/.test(bName)) return -1;
        return 0;
      });
    });

    return { rootsByType: roots, typeOrder: order };
  }, [rows]);

  const toggleExpanded = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const roundTo2 = (v) => Number(Number(v || 0).toFixed(2));
  const formatNumber = (v) => roundTo2(v).toFixed(2);

  const getNodeDisplayAmounts = useCallback((node, depth) => {
    const hasChildren = node?.children?.length > 0;
    let debit;
    let credit;
    if (hasChildren) {
      const subDebit = Number(node._subtreeDebit || 0);
      const subCredit = Number(node._subtreeCredit || 0);
      const net = subDebit - subCredit;
      debit = net > 0 ? net : 0;
      credit = net < 0 ? Math.abs(net) : 0;
    } else {
      debit = getRowDebit(node);
      credit = getRowCredit(node);
    }

    const isTopLevelPurchase = depth === 0 && /purchase/i.test(String(node.accountName || ""));
    const isCurrentAssetsOthers =
      depth === 0 && /^current assets \(others\)$/i.test(String(node.accountName || ""));

    if (isTopLevelPurchase && calculated?.cogsTotal !== null && calculated?.cogsTotal !== undefined) {
      const cogsNet = Number(calculated.cogsTotal || 0);
      debit = cogsNet >= 0 ? cogsNet : 0;
      credit = cogsNet < 0 ? Math.abs(cogsNet) : 0;
    }

    return {
      debit: roundTo2(debit),
      credit: roundTo2(credit),
      isCurrentAssetsOthers
    };
  }, [calculated, getRowCredit, getRowDebit]);

  const displayTotals = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;

    typeOrder.forEach((typeName) => {
      const roots = rootsByType.get(typeName) || [];
      roots.forEach((node) => {
        const amounts = getNodeDisplayAmounts(node, 0);
        totalDebit += Number(amounts.debit || 0);
        totalCredit += Number(amounts.credit || 0);

        if (
          amounts.isCurrentAssetsOthers &&
          calculated?.cogsBreakdown?.closingStockValue !== undefined &&
          calculated?.cogsBreakdown?.closingStockValue !== null
        ) {
          totalDebit += roundTo2(calculated.cogsBreakdown.closingStockValue || 0);
        }
      });
    });

    const difference = roundTo2(totalDebit - totalCredit);
    const isBalanced = Math.abs(difference) < 0.01;
    return { totalDebit, totalCredit, difference, isBalanced };
  }, [calculated, getNodeDisplayAmounts, rootsByType, typeOrder]);

  const renderNodeRows = (node, depth) => {
    const rowsOut = [];
    const hasChildren = node.children?.length > 0;
    const isExpanded = expandedIds.has(node.accountId);
    const childNames = (node.children || []).map((c) => String(c.accountName || '').toLowerCase());
    const isTaxReceivableGroup =
      String(node.accountName || '').toLowerCase() === 'loans & advances (asset)' &&
      childNames.some((n) => /(igst|sgst|cgst|tcs|tds)\s+receivable/.test(n));
    const isTopLevelPurchaseLabel = depth === 0 && /purchase/i.test(String(node.accountName || ''));
    const displayName = isTaxReceivableGroup
      ? 'GST Receivable'
      : (isTopLevelPurchaseLabel ? 'Cost of Goods Sold' : node.accountName);

    const { debit, credit, isCurrentAssetsOthers } = getNodeDisplayAmounts(node, depth);

    rowsOut.push(
      <tr key={node.accountId}>
        <td style={{ padding: '10px', paddingLeft: depth * 16 + 12 }}>
          {hasChildren && (
            <span onClick={() => toggleExpanded(node.accountId)} style={{ cursor: 'pointer', marginRight: 6 }}>
              {isExpanded ? '▼' : '▶'}
            </span>
          )}
          {displayName}
        </td>
        <td align="right">{formatNumber(debit)}</td>
        <td align="right">{formatNumber(credit)}</td>
      </tr>
    );

    if (hasChildren && isExpanded) {
      node.children.forEach((c) => rowsOut.push(...renderNodeRows(c, depth + 1)));
    }

    if (isCurrentAssetsOthers && calculated?.cogsBreakdown?.closingStockValue !== undefined && calculated?.cogsBreakdown?.closingStockValue !== null) {
      const closingStockDisplay = roundTo2(calculated.cogsBreakdown.closingStockValue);
      rowsOut.push(
        <tr key={`${node.accountId}-closing-stock`}>
          <td style={{ padding: '10px', paddingLeft: (depth + 1) * 16 + 12 }}>
            Closing Stock (Computed)
          </td>
          <td align="right">{formatNumber(closingStockDisplay)}</td>
          <td align="right">{formatNumber(0)}</td>
        </tr>
      );
    }

    return rowsOut;
  };

  const errorMessage =
    error?.response?.data?.message || error?.message || 'Failed to load trial balance.';

  const disableApply = filterDetails.fromDate === null || filterDetails.toDate === null

  return (
    <Card
      sx={{
        p: 3,
        width: "100%",
        height: "calc(100vh - 80px)",
        overflow: "auto"
      }}
    >
      <Helmet>
        <title>{titleURL} | Trial Balance Reports</title>
      </Helmet>

      <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography fontSize={13}>Trial Balance Reports</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {quickTabs.map((tab) => (
            <Chip
              key={tab.label}
              label={tab.label}
              size="small"
              variant={activeTab === tab.label ? 'filled' : 'outlined'}
              color={activeTab === tab.label ? 'primary' : 'default'}
              onClick={() => handleQuickTab(tab)}
              sx={{ fontSize: 10, height: 22 }}
            />
          ))}
          <Tooltip title="Filter">
            <IconButton onClick={() => setFilterOpen(true)}>
              <FilterAlt />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton onClick={() => navigate("/report")}>
              <CloseIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Title */}

      <Typography variant="h5" align="center" fontWeight="bold">
        Trial Balance
      </Typography>

      <Typography align="center" sx={{ mb: 2 }}>
        As of {appliedFilters.fromDate === appliedFilters.toDate
          ? moment(appliedFilters.fromDate).format('DD/MM/YYYY')
          : `${moment(appliedFilters.fromDate).format('DD/MM/YYYY')} to ${moment(appliedFilters.toDate).format('DD/MM/YYYY')}`}
      </Typography>

      {/* Filters */}

      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <Button fullWidth variant="contained" onClick={fetchTrialBalance}>
            Refresh
          </Button>
        </Grid>
      </Grid>

      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Filter</Typography>
          <IconButton onClick={() => setFilterOpen(false)}>
            <CloseIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                options={rangeOptions}
                value={filterDetails.rangeOption}
                onChange={(event, newValue) => handleRangeChange(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Select Range" fullWidth variant="filled" />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  label="From Date"
                  format="DD/MM/YYYY"
                  value={toMomentOrNull(filterDetails.fromDate)}
                  onChange={(date) =>
                    setFilterDetails((prev) => ({
                      ...prev,
                      rangeOption: 'Custom',
                      fromDate: moment(date).format('YYYY-MM-DD'),
                    }))
                  }
                  views={['year', 'month', 'day']}
                  slotProps={{
                    textField: { fullWidth: true, variant: 'filled' },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  label="To Date"
                  format="DD/MM/YYYY"
                  value={toMomentOrNull(filterDetails.toDate)}
                  onChange={(date) =>
                    setFilterDetails((prev) => ({
                      ...prev,
                      rangeOption: 'Custom',
                      toDate: moment(date).format('YYYY-MM-DD'),
                    }))
                  }
                  views={['year', 'month', 'day']}
                  slotProps={{
                    textField: { fullWidth: true, variant: 'filled' },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth variant="filled">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterDetails.status}
                  label="Status"
                  onChange={(e) =>
                    setFilterDetails((prev) => ({ ...prev, status: e.target.value }))
                  }
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="all">All</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filterDetails.includeZero}
                    onChange={(e) =>
                      setFilterDetails((prev) => ({
                        ...prev,
                        includeZero: e.target.checked,
                      }))
                    }
                  />
                }
                label="Include Zero"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Grid container spacing={2} display="flex" justifyContent="flex-end">
            <Grid>
              <Button variant="contained" color="error" onClick={handleFilterClear}>
                Clear
              </Button>
            </Grid>
            <Grid>
              <Button variant="contained" onClick={handleFilterApply} disabled={disableApply}>
                Apply
              </Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>

      <Divider sx={{ my: 3 }} />

      {/* Table */}

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{errorMessage}</Typography>
      ) : (
        <table
          width="100%"
          style={{
            borderCollapse: "collapse",
            marginTop: 10
          }}
        >
          <thead style={{ background: "#f5f5f5" }}>
            <tr>
              <th style={{ textAlign: "left", padding: "12px" }}>
                Account
              </th>
              <th style={{ textAlign: "right", padding: "12px" }}>
                Debit
              </th>
              <th style={{ textAlign: "right", padding: "12px" }}>
                Credit
              </th>
            </tr>
          </thead>

          <tbody>
            {typeOrder.map((t) => (
              <React.Fragment key={t}>
                <tr style={{ background: "#fafafa" }}>
                  <td colSpan={3} style={{ padding: 10 }}>
                    <strong>{t}</strong>
                  </td>
                </tr>

                {rootsByType
                  .get(t)
                  .map((r) => renderNodeRows(r, 0))}
              </React.Fragment>
            ))}
          </tbody>

          <tfoot>
            <tr style={{ background: "#f5f5f5" }}>
              <td style={{ textAlign: "left", padding: "12px", fontWeight: 700 }}>
                Grand Total
              </td>
              <td style={{ textAlign: "right", padding: "12px", fontWeight: 700 }}>
                {formatNumber(displayTotals.totalDebit)}
              </td>
              <td style={{ textAlign: "right", padding: "12px", fontWeight: 700 }}>
                {formatNumber(displayTotals.totalCredit)}
              </td>
            </tr>
          </tfoot>
        </table>
      )}

      {!loading && !error && (
        <>
          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
            <Typography fontSize={14}>
              Difference: <strong>{formatNumber(displayTotals.difference)}</strong>
            </Typography>
            {calculated?.cogsTotal !== null && calculated?.cogsTotal !== undefined && (
              <Typography fontSize={14}>
                COGS (Computed): <strong>{formatNumber(calculated.cogsTotal)}</strong>
              </Typography>
            )}
            {calculated?.cogsBreakdown?.closingStockValue !== undefined && calculated?.cogsBreakdown?.closingStockValue !== null && (
              <Typography fontSize={14}>
                Closing Stock (Computed): <strong>{formatNumber(calculated.cogsBreakdown.closingStockValue)}</strong>
              </Typography>
            )}
          </Box>

          {/* Balance Status */}

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Chip
              label={displayTotals.isBalanced ? "Balanced" : "Not Balanced"}
              color={displayTotals.isBalanced ? "success" : "error"}
            />
          </Box>
        </>
      )}
    </Card>
  );
};

export default TrialBalanceReport;

