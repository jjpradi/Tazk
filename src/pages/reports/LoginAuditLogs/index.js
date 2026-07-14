import {
  Autocomplete,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Fade,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  loginAuditLogsAction,
  getLoginAuditLogsAction,
  setLoginAuditLogsAction,
} from '../../../redux/actions/reports_actions';
import {useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import CommonSearch from 'utils/commonSearch';
import moment from 'moment';
import API_URLS from '../../../utils/customFetchApiUrls';
import {useCustomFetch} from 'utils/useCustomFetch';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import toMomentOrNull from '../../../utils/DateFixer';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

const statusOptions = [
  {label: 'Success', value: 'success'},
  {label: 'Failed', value: 'failed'},
  {label: 'Locked', value: 'locked'},
  {label: 'MFA Required', value: 'mfa_required'},
  {label: 'MFA Verified', value: 'mfa_verified'},
  {label: 'MFA Failed', value: 'mfa_failed'},
  {label: 'Logout', value: 'logout'},
  {label: 'Password Change', value: 'password_change'},
  {label: 'Password Change Failed', value: 'password_change_failed'},
  {label: 'Password Reset Request', value: 'password_reset_request'},
  {label: 'Password Reset Complete', value: 'password_reset_complete'},
  {label: 'Token Refresh', value: 'token_refresh'},
  {label: 'Token Refresh Failed', value: 'token_refresh_failed'},
];

const loginTypeOptions = [
  {label: 'Web', value: 'WEB'},
  {label: 'Mobile', value: 'MOBILE'},
  {label: 'Auto Login', value: 'AUTO_LOGIN'},
  {label: 'API', value: 'API'},
];

const getStatusStyle = (status) => {
  if (status === 'success' || status === 'mfa_verified' || status === 'password_change' || status === 'password_reset_complete') {
    return { bgcolor: '#e8f5e9', color: '#2e7d32', dotColor: '#4caf50' };
  }
  if (status === 'failed' || status === 'mfa_failed' || status === 'locked' || status === 'password_change_failed' || status === 'token_refresh_failed') {
    return { bgcolor: '#ffeef0', color: '#c62828', dotColor: '#ef5350' };
  }
  if (status === 'mfa_required' || status === 'password_reset_request') {
    return { bgcolor: '#fff8e1', color: '#e65100', dotColor: '#ff9800' };
  }
  if (status === 'logout') {
    return { bgcolor: '#f5f5f5', color: '#616161', dotColor: '#9e9e9e' };
  }
  return { bgcolor: '#e3f2fd', color: '#1565c0', dotColor: '#42a5f5' };
};

const parseBrowser = (ua) => {
  if (!ua) return '-';
  let browser = 'Unknown';
  if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('OPR/') || ua.includes('Opera')) browser = 'Opera';
  else if (ua.includes('SamsungBrowser')) browser = 'Samsung Browser';
  else if (ua.includes('UCBrowser')) browser = 'UC Browser';
  else if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Chrome/') && !ua.includes('Edg/')) browser = 'Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari';
  else if (ua.includes('MSIE') || ua.includes('Trident/')) browser = 'IE';

  let os = '';
  if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'Mac';
  else if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone')) os = 'iPhone';
  else if (ua.includes('iPad')) os = 'iPad';
  else if (ua.includes('Linux')) os = 'Linux';

  return os ? `${browser} / ${os}` : browser;
};

const LoginAuditLogs = () => {
  const navigate = useNavigate();
  const {
    reportsReducer: {getLoginAuditLogs},
    rbacReducer: {menuAccess = []}
  } = useSelector((state) => state);

  const data = getLoginAuditLogs?.data || [];
  const customFetch = useCustomFetch();

  const dataWithId = data.length
    ? data.map((row, index) => ({...row, id: index}))
    : [];
  const storage = getsessionStorage();
  const [page, setPage] = useState(0);
  const [searchVal, setSearchVal] = useState('');
  const [pageSize, setPageSize] = useState(20);
  const [filterOpen, setFilterOpen] = useState(false);

  const [filterValues, setFilterValues] = useState({
    fromDate: null,
    toDate: null,
    status: null,
    login_type: null,
    ip_address: '',
  });

  const {setModalTypeHandler, setLoaderStatusHandler} =
    useContext(CreateNewButtonContext);

  const dispatch = useDispatch();

  const columns = [
    { field: 'username', headerName: 'Username', width: 150, renderCell: (params) => params.value || '-' },
    { field: 'ip_address', headerName: 'IP Address', width: 140, renderCell: (params) => params.value || '-' },
    { field: 'login_type', headerName: 'Login Type', width: 120, renderCell: (params) => params.value || '-' },
    {
      field: 'status', headerName: 'Status', width: 170,
      renderCell: (params) => {
        if (!params.value) return '-';
        const style = getStatusStyle(params.value);
        return (
          <Chip
            size='small'
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: style.dotColor, flexShrink: 0 }} />
                {params.value.replace(/_/g, ' ')}
              </Box>
            }
            sx={{
              bgcolor: style.bgcolor,
              color: style.color,
              fontWeight: 500,
              fontSize: '0.72rem',
              textTransform: 'capitalize',
              border: 'none',
              height: 24,
              '& .MuiChip-label': { px: 1 },
            }}
          />
        );
      },
    },
    { field: 'failure_reason', headerName: 'Failure Reason', width: 200, renderCell: (params) => params.value || '-' },
    { field: 'employee_id', headerName: 'Emp ID', width: 100, renderCell: (params) => params.value || '-' },
    { field: 'user_agent', headerName: 'Browser', width: 170, renderCell: (params) => parseBrowser(params.value) },
    {
      field: 'created_at', headerName: 'Date & Time', width: 180,
      renderCell: (params) => params.value ? moment(params.value).format('DD/MM/YYYY hh:mm A') : '-',
    },
  ];

  const buildPayload = (overrides = {}) => ({
    pageCount: page,
    numPerPage: pageSize,
    searchString: searchVal,
    from: filterValues.fromDate || null,
    to: filterValues.toDate || null,
    status: filterValues.status || null,
    login_type: filterValues.login_type || null,
    ip_address: filterValues.ip_address || null,
    ...overrides,
  });

  const handlePageChange = (p) => setPage(p);
  const handlePageSizeChange = (size) => {
    setPage(0);
    setPageSize(size);
  };

  const requestSearch = (e) => {
    const val = e.target.value;
    setSearchVal(val);
    dispatch(getLoginAuditLogsAction({data: [], numRows: 0}));
    dispatch(
      setLoginAuditLogsAction(
        buildPayload({searchString: val}),
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    );
  };

  const cancelSearch = () => {
    setPage(0);
    setSearchVal('');
    dispatch(loginAuditLogsAction(buildPayload({searchString: ''})));
  };

  useEffect(() => {
    dispatch(loginAuditLogsAction(buildPayload({searchString: searchVal})));
  }, [page, pageSize]);

  const exportColumns = columns.map((col) => ({
    ...col,
    exportValue: (row) => {
      if (col.field === 'created_at') {
        return row.created_at
          ? moment(row.created_at).format('DD/MM/YYYY hh:mm A')
          : '';
      }
      return row[col.field] ?? '';
    },
  }));
  const selectedRole = storage?.role_name;
  const reportExport = UserRightsAuthorization(menuAccess[selectedRole], 'reports__logs__login_audit_logs', 'can_export')
  const handleExport = async () => {
    if (!reportExport) return;
    const formData = buildPayload({exportData: true});

    const {data: resData} = await customFetch(
      API_URLS.GET_LOGIN_AUDIT_LOGS,
      'POST',
      formData,
    );

    if (!resData?.data?.length) {
      alert('No data');
      return;
    }

    const columnHeaders = exportColumns.map((col) => col.headerName);
    const rows = resData.data.map((row) =>
      exportColumns.map((col) => {
        const val = col.exportValue(row);
        // Escape commas in CSV
        if (typeof val === 'string' && val.includes(','))
          return `"${val}"`;
        return val;
      }),
    );

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += columnHeaders.join(',') + '\n';
    csvContent += rows.map((row) => row.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = 'Login_Audit_Logs.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleChange = (name, value) => {
    setFilterValues((prev) => ({...prev, [name]: value || null}));
  };

  const handleApply = async () => {
    setPage(0);
    await dispatch(loginAuditLogsAction(buildPayload({pageCount: 0})));
    setFilterOpen(false);
  };

  const handleClear = async () => {
    const clearedFilters = {fromDate: null, toDate: null, status: null, login_type: null, ip_address: ''};
    setFilterValues(clearedFilters);
    setPage(0);
    await dispatch(
      loginAuditLogsAction({
        pageCount: 0,
        numPerPage: pageSize,
        searchString: '',
      }),
    );
    setFilterOpen(false);
  };

  return (
    <div>
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | Login Audit Logs</title>
      </Helmet>

      {/* Filter Dialog */}
      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)} maxWidth='sm' fullWidth>
        <DialogContent>
          <Grid container spacing={3} justifyContent='center' sx={{padding: 2}}>
            <Grid size={{lg: 12, md: 12, sm: 12, xs: 12}}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  label='From Date'
                  slotProps={{ textField: {fullWidth: true, variant: 'filled'} }}
                  format='DD/MM/YYYY'
                  value={toMomentOrNull(filterValues.fromDate)}
                  onChange={(date) => handleChange('fromDate', moment(date).format('YYYY-MM-DD'))}
                />
              </LocalizationProvider>
            </Grid>
            <Grid size={{lg: 12, md: 12, sm: 12, xs: 12}}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  label='To Date'
                  slotProps={{ textField: {fullWidth: true, variant: 'filled'} }}
                  format='DD/MM/YYYY'
                  value={toMomentOrNull(filterValues.toDate)}
                  onChange={(date) => handleChange('toDate', moment(date).format('YYYY-MM-DD'))}
                />
              </LocalizationProvider>
            </Grid>
            <Grid size={{lg: 12, md: 12, sm: 12, xs: 12}}>
              <Autocomplete
                options={statusOptions}
                getOptionLabel={(opt) => opt.label}
                value={statusOptions.find((o) => o.value === filterValues.status) || null}
                onChange={(e, val) => handleChange('status', val?.value)}
                renderInput={(params) => <TextField {...params} label='Status' variant='filled' fullWidth />}
              />
            </Grid>
            <Grid size={{lg: 12, md: 12, sm: 12, xs: 12}}>
              <Autocomplete
                options={loginTypeOptions}
                getOptionLabel={(opt) => opt.label}
                value={loginTypeOptions.find((o) => o.value === filterValues.login_type) || null}
                onChange={(e, val) => handleChange('login_type', val?.value)}
                renderInput={(params) => <TextField {...params} label='Login Type' variant='filled' fullWidth />}
              />
            </Grid>
            <Grid size={{lg: 12, md: 12, sm: 12, xs: 12}}>
              <TextField
                label='IP Address'
                variant='filled'
                fullWidth
                value={filterValues.ip_address || ''}
                onChange={(e) => handleChange('ip_address', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{justifyContent: 'flex-end', paddingBottom: 2}}>
          <Button variant='contained' color='error' onClick={handleClear}>Clear</Button>
          <Button variant='contained' color='primary' onClick={handleApply}>Apply</Button>
        </DialogActions>
      </Dialog>

      <Card
        sx={{
          width: '100%',
          height: 'calc(100vh - 75px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header Row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
            borderBottom: '1px solid #eee',
            flexShrink: 0,
          }}
        >
          <Typography sx={{ fontWeight: 600, fontSize: '15px', whiteSpace: 'nowrap' }}>
            Login Audit Logs
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CommonSearch
              searchVal={searchVal}
              cancelSearch={cancelSearch}
              requestSearch={requestSearch}
            />
            <Tooltip title='Filter' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement='top'>
              <IconButton size='small' onClick={() => setFilterOpen(true)}>
                <FilterAltIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
            {reportExport && (
              <Tooltip title='Export' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement='top'>
                <IconButton size='small' onClick={handleExport}>
                  <FileDownloadIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title='Close'>
              <IconButton size='small' onClick={() => navigate('/report')}>
                <CloseIcon sx={{ fontSize: 22 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Table */}
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <DataGrid
            rows={dataWithId}
            columns={columns}
            pageSizeOptions={[20, 50, 100]}
            paginationMode='server'
            density='compact'
            disableRowSelectionOnClick
            disableExtendRowFullWidth
            rowCount={getLoginAuditLogs?.numRows || 0}
            paginationModel={{ page: page, pageSize: pageSize }}
            onPaginationModelChange={(model) => {
              if (model.page !== page) handlePageChange(model.page);
              if (model.pageSize !== pageSize) handlePageSizeChange(model.pageSize);
            }}
            sx={{
              height: '100%',
              border: 0,
              '& .MuiDataGrid-main': { overflow: 'hidden' },
              '& .MuiDataGrid-virtualScroller': { overflowY: 'auto' },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#F4F7FE',
                fontSize: 12,
                fontWeight: 700,
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: '#f5faf8',
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #f0f0f0',
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: '1px solid #eee',
              },
            }}
          />
        </Box>
      </Card>
    </div>
  );
};

export default LoginAuditLogs;
