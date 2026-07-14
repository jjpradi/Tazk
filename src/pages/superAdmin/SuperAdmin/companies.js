import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, Chip, Tab, Tabs, Typography, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, IconButton, Tooltip, Button, Checkbox,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import RestoreIcon from '@mui/icons-material/Restore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExtensionIcon from '@mui/icons-material/Extension';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import superAdminService from '../../../services/superAdmin_services';
import SubscriptionPlanService from '../../../services/subscriptionPlan_services';
import DateDialog from './dateDialog';
import context from '../../../context/CreateNewButtonContext';
import { useHasRight } from '../../../hooks/useUserRights';

const STATUS_COLORS = {
  Active: '#4caf50',
  Expired: '#f44336',
  Trial: '#ff9800',
  Pending: '#9e9e9e',
};

function getStatus(row) {
  if (!row.isApproved || row.isApproved === null) return 'Pending';
  if (row.sIsExpired === 1) return 'Expired';
  if (row.sRemainingDays !== null && row.sRemainingDays <= 14 && row.plan_name && row.plan_name.toLowerCase().includes('starter')) return 'Trial';
  if (row.isApproved === 'Approved') return 'Active';
  return row.isApproved || 'Pending';
    const [appConfigData, setAppConfigData] = useState({});
    const [openAlert, setOpenAlert] = useState(false)
    const [isApiFinished, setIsAiFinished] = useState(false);
    const [pageCount, setPageCount] = useState(0);
    const [pageSize, setPageSize] = useState(20)
    const [searchString, setSearchString] = useState('')
    const tempinitsformVal = useRef();
    const [rowData, setRowData] = useState({})

    // useEffect(() => {
    //     let data = {
    //         pageCount : 0,
    //         numPerPage : pageSize
    //     }
    //     apiCalls(           
    //         dispatch(companyListAction(
    //             data,
    //             setModalTypeHandler,
    //             setLoaderStatusHandler))
    //     ).then(() => {
    //         setIsAiFinished(true)
    //     })
    // }, []);

    useEffect(() => {
        let data = {
            pageCount : pageCount,
            numPerPage : pageSize,
            searchString: ''
        }
        apiCalls(
            dispatch(getCompanyDetailsAction(
                data,
                commoncookie,
                setModalTypeHandler,
                setLoaderStatusHandler))
        )
        // .then(() => {
        //     setIsAiFinished(true)
        // })
    }, [pageCount,pageSize]);

    const getAppConfigData = () => {
        const companyName = CompanySubscriptionList.filter((f) => f.key_name == 'company.name');
        const fullAddress = CompanySubscriptionList.filter(
            (f) => f.key_name == 'address.fulladdress',
        );
        const emailData = CompanySubscriptionList.filter((f) => f.key_name == 'company.email');

        const companyMobile = CompanySubscriptionList.filter(
            (f) => f.key_name == 'company.mobile',
        );


        setAppConfigData({
            companyName: companyName.length > 0 ? companyName[0].value : '',
            companyAddress: fullAddress.length > 0 ? fullAddress[0].value : '',
            companyEmail: emailData.length > 0 ? emailData[0].value : '',
            companyMobile: companyMobile.length > 0 ? companyMobile[0].value : '',

        });
    };


    const initsformVal = () => {
        getAppConfigData();
    };
    tempinitsformVal.current = initsformVal;
    useEffect(() => {
        tempinitsformVal.current();
    }, [CompanySubscriptionList]);
    // const companies = CompanySubscriptionList

    // const combinedCompanies = companies.map(company => ({
    //     company_name: company.company_name,
    //     company_id: company.company_id,
    //     fulladdress: company.companyDetails.find(detail => detail.key_name === 'address.fulladdress')?.value,
    //     email: company.companyDetails.find(detail => detail.key_name === 'company.email')?.value,
    //     mobile: company.companyDetails.find(detail => detail.key_name === 'company.mobile')?.value,
    // }));

    const companies = Array.isArray(CompanySubscriptionList)
        ? CompanySubscriptionList
        : [];

    const combinedCompanies = companies.map(company => {

        const details = Array.isArray(company.companyDetails)
            ? company.companyDetails
            : [];

        return {
            company_name: company.company_name,
            company_id: company.company_id,
            fulladdress: details.find(d => d.key_name === 'address.fulladdress')?.value || '',
            email: details.find(d => d.key_name === 'company.email')?.value || '',
            mobile: details.find(d => d.key_name === 'company.mobile')?.value || '',
        };
    });


    const finalRes = combinedCompanies.map(d => {
        const res = CompanySubscriptionList.find(f => f.company_id === d.company_id)
        return {
            ...d,
            subStart: res.sStartDate,
            subEnd: res.sEndDate,
            status: res.isApproved,
            expiry: res.expiryDate,
            daysLeft: res.sRemainingDays,
            isExpired: res.sIsExpired,
            isApproved : res.isApproved

        }
    })

    const handleSubscribe =async (rowData) => {
        setRowData(rowData)
        setOpenAlert(true)
    }

    const handlePageChange = async (page) => {
        setPageCount(page);
    }
    const handlePageSizeChange = async (size) => {
        setPageSize(size);
    };
    const closeAlert = () => {
        setOpenAlert(false)
    }

    const cancelSearch = () => {
        setSearchString('')
        const body = {
                pageCount : pageCount,
                numPerPage : pageSize,
            searchString: ''
        }
        dispatch(getCompanyDetailsAction(
            body,
            commoncookie,
            setModalTypeHandler,
            setLoaderStatusHandler,
        ))
    }

    const requestSearch = (e) => {
        let val = e.target.value;
        setSearchString(val)

        dispatch(setCompanyDetailsState({ data: [], numRows: 0 }))
        //  }
        const body = {
                pageCount : 0,
                numPerPage : 20,
            searchString: val
        }
        dispatch(getCompanyDetailsAction(
            body,
            commoncookie,
            setModalTypeHandler,
            setLoaderStatusHandler,
        ))
    }

    return (
        <Card style={{ height: '100%' }}>
            <MaterialTable
                totalCount= { CompanySubscriptionCount }
                components={{
                    Toolbar: (props) => (
                        <div>
                            {/* <span style={{ paddingLeft: "100px" }}> */}
                            <div
                                style={{
                                    display: 'flex',
                                    width: '100%',
                                    alignItems: 'center',
                                }}
                            >
                                <div style={{ width: '100%' }}>
                                    <MTableToolbar {...props} />
                                </div>
                                <div>
                                    <CommonSearch
                                        searchVal={searchString}
                                        cancelSearch={cancelSearch}
                                        requestSearch={requestSearch}
                                    />
                                </div>
                            </div>
                        </div>
                    ),
                }}
                style={{ minHeight: '100%' }}
                options={{
                    pageSizeOptions: [20, 50, 100],
                    pageSize: pageSize,
                    rowStyle: {
                        height: "50px"
                    },
                    showEmptyDataSourceMessage: isApiFinished,
                    search: false
                }}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handlePageSizeChange}
                page={pageCount}
                columns={[
                    { title: 'Company Name', field: 'company_name' },
                    { title: 'Location', field: 'fulladdress' },
                    { title: 'Contact Number', field: 'mobile' },
                    { title: 'Company ID', field: 'company_id' },
                    // { title: 'Subscription Start Date', field: 'subStart' },
                    // { title: 'Subscription End Date', field: 'subEnd' },
                    {
                        title: 'Subscription Start Date',
                        field: 'subStart',
                        render: rowData => rowData.subStart && new Date(rowData.subStart).toLocaleDateString('en-GB')
                    },
                    {
                        title: 'Subscription End Date',
                        field: 'subEnd',
                        render: rowData => rowData.subEnd && new Date(rowData.subEnd).toLocaleDateString('en-GB')
                    },
                    {
                        title: 'Status',
                        field: 'status',
                        render: (rowData) => (rowData.status ? rowData.status : 'Pending')
                    },
                    // { title: 'Expiry Date', field: 'expiry' },
                    {
                        title: 'Expiry Date',
                        field: 'expiry',
                        render: rowData => rowData.expiry && new Date(rowData.expiry).toLocaleDateString('en-GB')
                    },
                    { title: 'Days Left', field: 'daysLeft' },
                    {
                        title: 'Subscribe',
                        field: 'subscription',
                        render: (rowData) => (
                            <Chip
                                label="Renew"
                                color="primary"
                                onClick={() => handleSubscribe(rowData)}
                                avatar={<Avatar><RestoreIcon /></Avatar>}
                                disabled = {rowData.isApproved === null}
                            />
                        ),
                    },

                ]}
                data={finalRes}
                title="Subscriptions"
            />
            {openAlert && <DateDialog

                rowData={rowData}
                alertOpen = {openAlert}
                setOpenAlert={() => closeAlert()} />}
        </Card>

    )
}

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-GB');
}

function exportToCSV(companies, typeName) {
  const headers = ['ID', 'Company Name', 'Contact', 'Email', 'Plan', 'Employees', 'Start Date', 'End Date', 'Days Left', 'Status'];
  const rows = companies.map(r => [
    r.company_id,
    `"${(r.company_name || '').replace(/"/g, '""')}"`,
    r.phone || '',
    r.email || '',
    r.plan_name || '',
    r.employee_count || 0,
    formatDate(r.sStartDate),
    formatDate(r.sEndDate),
    r.sRemainingDays != null ? Math.max(0, r.sRemainingDays) : '',
    getStatus(r),
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${typeName || 'companies'}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Companies() {
  const navigate = useNavigate();
  const {
    setLoaderStatusHandler,
    setModalTypeHandler,
    commoncookie,
  } = useContext(context);

  const canViewDetail = useHasRight('view_company_detail');
  const canManageSubscriptions = useHasRight('manage_subscriptions');

  const [companyTypes, setCompanyTypes] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [companies, setCompanies] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [searchString, setSearchString] = useState('');
  const [searchTimer, setSearchTimer] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Selection
  const [selected, setSelected] = useState([]);

  // Renew dialog
  const [openAlert, setOpenAlert] = useState(false);
  const [rowData, setRowData] = useState({});

  // Bulk extend dialog
  const [bulkExtendOpen, setBulkExtendOpen] = useState(false);
  const [bulkExtendDays, setBulkExtendDays] = useState('');

  // Bulk change plan dialog
  const [bulkPlanOpen, setBulkPlanOpen] = useState(false);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');

  useEffect(() => {
    loadCompanyTypeCounts();
  }, []);

  useEffect(() => {
    if (companyTypes.length > 0) loadCompanies();
  }, [activeTab, page, rowsPerPage, companyTypes, statusFilter]);

  const loadCompanyTypeCounts = async () => {
    try {
      const res = await superAdminService.getCompanyTypeCounts();
      if (res.status === 200 && res.data) {
        const types = res.data.filter(t => t.company_count > 0 || [1, 2, 3, 5, 9, 10, 11, 12].includes(t.company_type_id));
        setCompanyTypes(types);
      }
    } catch (err) {
      console.error('Error loading company type counts:', err);
    }
  };

  const loadCompanies = useCallback(async (search) => {
    if (companyTypes.length === 0) return;
    const currentType = companyTypes[activeTab];
    if (!currentType) return;

    setLoading(true);
    setSelected([]);
    try {
      const res = await superAdminService.getCompaniesByType({
        company_type_id: currentType.company_type_id,
        pageCount: page,
        numPerPage: rowsPerPage,
        searchString: search !== undefined ? search : searchString,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      if (res.status === 200 && res.data) {
        setCompanies(res.data.data || []);
        setTotalCount(res.data.numRows || 0);
      }
    } catch (err) {
      console.error('Error loading companies:', err);
      setCompanies([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [companyTypes, activeTab, page, rowsPerPage, searchString, statusFilter]);

  const handleTabChange = (e, newValue) => {
    setActiveTab(newValue);
    setPage(0);
    setSearchString('');
    setSelected([]);
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchString(val);
    setPage(0);
    if (searchTimer) clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => { loadCompanies(val); }, 400));
  };

  const clearSearch = () => {
    setSearchString('');
    setPage(0);
    loadCompanies('');
  };

  const handleRenew = (row) => {
    setRowData(row);
    setOpenAlert(true);
  };

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(companies.map(c => c.company_id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (companyId) => {
    setSelected(prev =>
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  const isSelected = (id) => selected.includes(id);
  const allSelected = companies.length > 0 && selected.length === companies.length;
  const someSelected = selected.length > 0 && selected.length < companies.length;

  // Bulk extend
  const handleBulkExtend = async () => {
    if (!bulkExtendDays || parseInt(bulkExtendDays) <= 0) return;
    try {
      await superAdminService.bulkExtend({ company_ids: selected, days: parseInt(bulkExtendDays) });
      setBulkExtendOpen(false);
      setBulkExtendDays('');
      setSelected([]);
      loadCompanies();
    } catch (err) { console.error(err); }
  };

  // Bulk change plan
  const openBulkPlanDialog = async () => {
    const currentType = companyTypes[activeTab];
    if (currentType) {
      try {
        const res = await SubscriptionPlanService.getPlansByCompanyType(currentType.company_type_id);
        if (res.status === 200) setAvailablePlans(res.data || []);
      } catch (err) { console.error(err); }
    }
    setBulkPlanOpen(true);
  };

  const handleBulkChangePlan = async () => {
    if (!selectedPlan) return;
    try {
      await superAdminService.bulkChangePlan({ company_ids: selected, plan_id: selectedPlan });
      setBulkPlanOpen(false);
      setSelectedPlan('');
      setSelected([]);
      loadCompanies();
    } catch (err) { console.error(err); }
  };

  // CSV export
  const handleExport = () => {
    const toExport = selected.length > 0
      ? companies.filter(c => selected.includes(c.company_id))
      : companies;
    exportToCSV(toExport, companyTypes[activeTab]?.company_type_name);
  };

  const columns = [
    { label: 'ID', key: 'company_id', width: 60 },
    { label: 'Company Name', key: 'company_name', width: 200 },
    { label: 'Contact', key: 'phone', width: 130 },
    { label: 'Email', key: 'email', width: 180 },
    { label: 'Plan', key: 'plan_name', width: 120 },
    { label: 'Employees', key: 'employee_count', width: 90, align: 'center' },
    { label: 'Start Date', key: 'sStartDate', width: 100, render: (r) => formatDate(r.sStartDate) },
    { label: 'End Date', key: 'sEndDate', width: 100, render: (r) => formatDate(r.sEndDate) },
    { label: 'Days Left', key: 'sRemainingDays', width: 80, align: 'center',
      render: (r) => {
        const days = r.sRemainingDays;
        if (days === null || days === undefined) return '-';
        const color = days <= 0 ? '#f44336' : days <= 30 ? '#ff9800' : '#4caf50';
        return <span style={{ color, fontWeight: 600 }}>{Math.max(0, days)}</span>;
      }
    },
    { label: 'Status', key: 'status', width: 90,
      render: (r) => {
        const status = getStatus(r);
        return (
          <Chip
            label={status}
            size="small"
            sx={{ bgcolor: STATUS_COLORS[status] || '#9e9e9e', color: '#fff', fontWeight: 500, fontSize: '0.75rem', height: 24 }}
          />
        );
      }
    },
    { label: 'Actions', key: 'actions', width: 120, align: 'center',
      render: (r) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          {canViewDetail && (
            <Tooltip title="View Details">
              <IconButton size="small" color="info" onClick={(e) => { e.stopPropagation(); navigate(`/superadmin/companies/${r.company_id}`); }}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Renew Subscription">
            <span>
              <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleRenew(r); }} disabled={r.isApproved === null}>
                <RestoreIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )
    },
  ];

  return (
    <Card sx={{ height: 'calc(100vh - 75px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Company Type Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#fafafa' }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" sx={{ minHeight: 48 }}>
          {companyTypes.map((ct, i) => (
            <Tab
              key={ct.company_type_id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{ct.company_type_name}</span>
                  <Chip label={ct.company_count} size="small" color={activeTab === i ? 'primary' : 'default'} sx={{ height: 20, fontSize: '0.7rem', minWidth: 28 }} />
                </Box>
              }
              sx={{ textTransform: 'none', minHeight: 48, py: 0 }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Toolbar: Search + Bulk Actions */}
      <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {companyTypes[activeTab]?.company_type_name || 'Companies'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ({totalCount})
          </Typography>
          {selected.length > 0 && canManageSubscriptions && (
            <>
              <Chip label={`${selected.length} selected`} size="small" color="primary" onDelete={() => setSelected([])} sx={{ ml: 1 }} />
              <Button size="small" variant="outlined" startIcon={<ExtensionIcon />} onClick={() => setBulkExtendOpen(true)} sx={{ textTransform: 'none' }}>
                Extend
              </Button>
              <Button size="small" variant="outlined" startIcon={<SwapHorizIcon />} onClick={openBulkPlanDialog} sx={{ textTransform: 'none' }}>
                Change Plan
              </Button>
            </>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              displayEmpty
              sx={{ fontSize: '0.85rem' }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
              <MenuItem value="expiring">Expiring (30d)</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title={selected.length > 0 ? `Export ${selected.length} selected` : 'Export current page'}>
            <Button size="small" variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExport} sx={{ textTransform: 'none' }}>
              CSV
            </Button>
          </Tooltip>
          <TextField
            size="small"
            placeholder="Search..."
            value={searchString}
            onChange={handleSearch}
            sx={{ width: 260 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment>,
              endAdornment: searchString ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={clearSearch}><CloseIcon fontSize="small" /></IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </Box>
      </Box>

      {/* Table */}
      <TableContainer sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ bgcolor: '#f5f5f5', py: 0 }}>
                <Checkbox
                  size="small"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={handleSelectAll}
                />
              </TableCell>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  align={col.align || 'left'}
                  sx={{ fontWeight: 600, fontSize: '0.8rem', bgcolor: '#f5f5f5', whiteSpace: 'nowrap', width: col.width, minWidth: col.width, py: 1.2 }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No companies found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              companies.map((row) => {
                const checked = isSelected(row.company_id);
                return (
                  <TableRow
                    key={row.company_id}
                    hover
                    selected={checked}
                    onDoubleClick={() => navigate(`/superadmin/companies/${row.company_id}`)}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f0f7ff' }, height: 48 }}
                  >
                    <TableCell padding="checkbox" sx={{ py: 0 }}>
                      <Checkbox size="small" checked={checked} onChange={() => handleSelectOne(row.company_id)} onClick={(e) => e.stopPropagation()} />
                    </TableCell>
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        align={col.align || 'left'}
                        sx={{ fontSize: '0.82rem', py: 0.8, whiteSpace: col.key === 'email' ? 'normal' : 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: col.width }}
                      >
                        {col.render ? col.render(row) : (row[col.key] ?? '-')}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={(e, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[20, 50, 100]}
        sx={{ borderTop: '1px solid #eee', flexShrink: 0 }}
      />

      {/* Renew Dialog */}
      {openAlert && (
        <DateDialog
          rowData={rowData}
          alertOpen={openAlert}
          setOpenAlert={() => { setOpenAlert(false); loadCompanies(); }}
        />
      )}

      {/* Bulk Extend Dialog */}
      <Dialog open={bulkExtendOpen} onClose={() => setBulkExtendOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Bulk Extend Subscription</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Extend subscription for {selected.length} selected {selected.length === 1 ? 'company' : 'companies'}.
          </Typography>
          <TextField
            label="Number of days to extend"
            type="number"
            fullWidth
            value={bulkExtendDays}
            onChange={(e) => setBulkExtendDays(e.target.value)}
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkExtendOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleBulkExtend} disabled={!bulkExtendDays || parseInt(bulkExtendDays) <= 0}>
            Extend {selected.length} {selected.length === 1 ? 'Company' : 'Companies'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Change Plan Dialog */}
      <Dialog open={bulkPlanOpen} onClose={() => setBulkPlanOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Bulk Change Plan</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Change plan for {selected.length} selected {selected.length === 1 ? 'company' : 'companies'}.
          </Typography>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Select Plan</InputLabel>
            <Select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} label="Select Plan">
              {availablePlans.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.plan_name} {p.Price ? `- Rs. ${p.Price}` : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkPlanOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleBulkChangePlan} disabled={!selectedPlan}>
            Apply to {selected.length} {selected.length === 1 ? 'Company' : 'Companies'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
