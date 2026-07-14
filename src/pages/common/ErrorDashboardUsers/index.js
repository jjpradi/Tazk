import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  listErrorDashboardAction,
  removeAssign,
  statusChange,
  updateAssignerror,
} from 'redux/actions/errorDashboard_actions';
import apiCalls from 'utils/apiCalls';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { getsessionStorage } from 'pages/common/login/cookies';
import { listCompanyNameErrorDBoard } from 'redux/actions/company_actions';
import errorDashboardService from 'services/errorDashboard_services';
import { getEmpbasecompanyAction } from 'redux/actions/attendance_actions';
import moment from 'moment';
import { DataGrid } from '@mui/x-data-grid';
import {
  Autocomplete, Box, Button, Card, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, FormControl, Grid, IconButton, MenuItem,
  Paper, Select, TextField, Tooltip, Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const CATEGORY_COLORS = {
  'uncaughtException': { bg: '#fff3e0', color: '#e65100', label: 'Uncaught Exception' },
  'unhandledRejection': { bg: '#f3e5f5', color: '#7b1fa2', label: 'Unhandled Rejection' },
  'ROUTE NOT FOUND': { bg: '#e3f2fd', color: '#1565c0', label: 'Route Not Found' },
  'Internal Server Error': { bg: '#ffebee', color: '#c62828', label: 'Internal Server Error' },
  'frontend_error': { bg: '#e0f7fa', color: '#00838f', label: 'Frontend Error' },
  'Request timed out. Please try again later.': { bg: '#fce4ec', color: '#ad1457', label: 'Timeout' },
  'API takes more than 2 seconds': { bg: '#fff8e1', color: '#f57f17', label: 'Slow API' },
  'Network-error': { bg: '#fbe9e7', color: '#bf360c', label: 'Network Error' },
};

const PRIORITY_CONFIG = {
  'Critical': { bg: '#b71c1c', color: '#ffffff' },
  'Highest': { bg: '#ffebee', color: '#c62828' },
  'High': { bg: '#fff3e0', color: '#e65100' },
  'Medium': { bg: '#fff8e1', color: '#f57f17' },
  'Low': { bg: '#e8f5e9', color: '#2e7d32' },
};

const STATUS_CONFIG = {
  'pending': { bg: '#fff3e0', color: '#e65100', label: 'Pending' },
  'TO DO': { bg: '#e3f2fd', color: '#1565c0', label: 'To Do' },
  'IN PROGRESS': { bg: '#fff8e1', color: '#f57f17', label: 'In Progress' },
  'COMPLETED': { bg: '#e8f5e9', color: '#2e7d32', label: 'Completed' },
};

function getCategoryChip(meta) {
  const cfg = CATEGORY_COLORS[meta] || { bg: '#f5f5f5', color: '#616161', label: meta || '-' };
  return <Chip label={cfg.label} size="small" sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: '0.7rem', height: 22 }} />;
}

function getPriorityChip(priority) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG['Low'];
  return <Chip label={priority || '-'} size="small" sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: '0.7rem', height: 22, minWidth: 60 }} />;
}

function getStatusChip(status) {
  const s = status || 'pending';
  const cfg = STATUS_CONFIG[s] || STATUS_CONFIG['pending'];
  return <Chip label={cfg.label} size="small" sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: '0.7rem', height: 22 }} />;
}

function ErrorDashboardUsers() {
  const storage = getsessionStorage();
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  const {
    // CompanyReducers: { companyName },
    ErrorDashboardReducer: { error_dashboard_list, error_dashboard_list_count },
    attendanceReducer: { get_empbasecompany },
  } = useSelector((state) => state);

  const [searchData, setSearchData] = useState({ page: 0, pageSize: 20 });
  const [formValues, setFormValues] = useState({  filter_company_id: 'all', filter_company_type: 'all', filter_category: 'all', filter_from_date: '', filter_to_date: '', });
  const [filterOptions, setFilterOptions] = useState({company_ids: [], company_types: [], categories: [],});
  const [openFilter, setOpenFilter] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [assignData, setAssignData] = useState({ assignee: '', assigned_name: '' });
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    dispatch(getEmpbasecompanyAction());
     fetchFilterOptions({
      filter_company_id: 'all',
      filter_company_type: 'all',
      filter_category: 'all',
      filter_from_date: '', 
      filter_to_date: '',
     });
  }, []);

  useEffect(() => {
    fetchErrors();
  }, [searchData.page, searchData.pageSize]);

  // const fetchErrors = () => {
  //   const body = { company_id: formValues.company_id, pageCount: searchData.page, numPerPage: searchData.pageSize };
  //   apiCalls(
  //     setModalTypeHandler, setLoaderStatusHandler,
  //     dispatch(listErrorDashboardAction(body, setModalTypeHandler, setLoaderStatusHandler)),
  //     dispatch(listCompanyNameErrorDBoard(body, setModalTypeHandler, setLoaderStatusHandler)),
  //   );
  // };

  const handleAssignSubmit = () => {
    const body = { company_id: formValues.company_id };
    apiCalls(
      setModalTypeHandler, setLoaderStatusHandler,
      dispatch(updateAssignerror({
        assignee: assignData.assignee,
        assignedBy: storage.employee_id,
        errorId: selectedRow,
        assigned_name: assignData.assigned_name,
        current_status: 0,
      })),
      dispatch(listErrorDashboardAction(body, setModalTypeHandler, setLoaderStatusHandler)),
    );
    setOpenAssign(false);
    setAssignData({ assignee: '', assigned_name: '' });
  };

  const handleStatusChange = (event) => {
    const body = { id: selectedRow, company_id: formValues.company_id, error_status: event.target.value };
    apiCalls(
      setModalTypeHandler, setLoaderStatusHandler,
      dispatch(statusChange(body, setModalTypeHandler, setLoaderStatusHandler)),
      dispatch(listErrorDashboardAction(body, setModalTypeHandler, setLoaderStatusHandler)),
    );
    setOpenStatus(false);
  };

  const handleRemove = (id) => {
    const body = { id, company_id: formValues.company_id };
    apiCalls(
      setModalTypeHandler, setLoaderStatusHandler,
      dispatch(removeAssign(body, setModalTypeHandler, setLoaderStatusHandler)),
      dispatch(listErrorDashboardAction(body, setModalTypeHandler, setLoaderStatusHandler)),
    );
  };

  const handleFilterSubmit = () => {
    if (searchData.page === 0) {
    fetchErrors();
    } else {
    setSearchData((s) => ({ ...s, page: 0 }));
    }
    setOpenFilter(false);
  };

  const handleFilterClear = () => {
    const cleared = {
      filter_company_id: 'all',
      filter_company_type: 'all',
      filter_category: 'all',
      filter_from_date: '', 
      filter_to_date: '',
    };

    setFormValues(cleared);
    fetchFilterOptions(cleared);

    if (searchData.page === 0) {
      fetchErrors(cleared);
    } else {
      setSearchData((s) => ({ ...s, page: 0 }));
    }
    setOpenFilter(false);
  };

    const fetchFilterOptions = async (filters = formValues) => {
    try {
      const res = await errorDashboardService.getFilterOptions(filters);
      setFilterOptions(res.data || { company_ids: [], company_types: [], categories: [] });
    } catch (err) {
      setFilterOptions({ company_ids: [], company_types: [], categories: [] });
    }
  };

  const handleFilterValueChange = async (key, value) => {
    const next = { ...formValues, [key]: value };

    if (key === 'filter_company_type') {
      next.filter_company_id = 'all';
      next.filter_category = 'all';
    }

    if (key === 'filter_company_id') {
      next.filter_category = 'all';
    }

    setFormValues(next);
    await fetchFilterOptions(next);
  };

  const fetchErrors = (filters = formValues) => {
    const body = {
      ...filters,
      pageCount: searchData.page,
      numPerPage: searchData.pageSize,
    };

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(listErrorDashboardAction(body, setModalTypeHandler, setLoaderStatusHandler)),
    );
  };

  const COMPANY_TYPE_LABELS = {
    1: 'Grow Retail',
    2: 'Point of Sale',
    3: 'Sales',
    4: 'Service',
    5: 'Payroll',
    6: 'Developer Console',
    7: 'Retail Shop',
    8: 'Super Admin',
    9: 'Asset Management',
    10: 'Lead Management',
    11: 'Projects',
    12: 'Stact',
    13: 'Partner Portal',
  };
  const columns = [
    {
      headerName: 'ID', field: 'id', width: 85,
      renderCell: (p) => <Typography variant="caption" fontWeight={600} color="text.secondary">#{p.value}</Typography>,
    },
    {
      headerName: 'Company ID', field: 'company_id', width: 100,
      renderCell: (p) => (
        <Tooltip title={p.value || ''} arrow>
          <Typography variant="body2" noWrap sx={{ maxWidth: 140 }}>{p.value || `ID:${p.row.company_id}`}</Typography>
        </Tooltip>
      ),
    },
    {
      headerName: 'Company Type',
      field: 'company_type',
      width: 130,
      renderCell: (p) => (
      <Chip
        label={COMPANY_TYPE_LABELS[p.value] || p.value}
        size="small"
      />
      ),
    },
    {
      headerName: 'Category', field: 'meta', width: 160,
      renderCell: (p) => getCategoryChip(p.value),
    },
    {
      headerName: 'Message', field: 'message', flex: 1, minWidth: 250,
      renderCell: (p) => {
        const isExpanded = expandedRow === p.row.id;
        const msg = p.value || '';
        const isLong = msg.length > 120;
        return (
          <Box sx={{ py: 0.5, display: 'flex', alignItems: 'flex-start', gap: 0.5, width: '100%' }}>
            <Typography variant="body2" sx={{
              whiteSpace: isExpanded ? 'pre-wrap' : 'nowrap',
              overflow: isExpanded ? 'visible' : 'hidden',
              textOverflow: isExpanded ? 'unset' : 'ellipsis',
              wordBreak: 'break-all',
              fontSize: '0.78rem',
              lineHeight: 1.4,
              flex: 1,
            }}>
              {msg}
            </Typography>
            {isLong && (
              <IconButton size="small" onClick={() => setExpandedRow(isExpanded ? null : p.row.id)} sx={{ mt: -0.3 }}>
                {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </IconButton>
            )}
          </Box>
        );
      },
    },
    {
      headerName: 'Occurrences', field: 'occurance', width: 100, align: 'center', headerAlign: 'center',
      renderCell: (p) => (
        <Chip
          label={p.value || 0}
          size="small"
          sx={{
            fontWeight: 700, fontSize: '0.75rem', height: 24, minWidth: 40,
            bgcolor: (p.value || 0) > 5 ? '#ffebee' : (p.value || 0) > 2 ? '#fff8e1' : '#f5f5f5',
            color: (p.value || 0) > 5 ? '#c62828' : (p.value || 0) > 2 ? '#f57f17' : '#616161',
          }}
        />
      ),
    },
    {
      headerName: 'Priority', field: 'priority', width: 90, align: 'center', headerAlign: 'center',
      renderCell: (p) => getPriorityChip(p.value),
    },
    {
      headerName: 'Last Seen', field: 'last_occured', width: 140,
      renderCell: (p) => (
        <Typography variant="caption" color="text.secondary">
          {p.value ? moment(p.value).format('DD MMM YYYY HH:mm') : '-'}
        </Typography>
      ),
    },
    {
      headerName: 'Status', field: 'current_status', width: 110, align: 'center', headerAlign: 'center',
      renderCell: (p) => {
        const status = p.value?.length > 0 ? p.value : 'pending';
        return (
          <Box sx={{ cursor: 'pointer' }} onClick={() => { setSelectedRow(p.row.id); setOpenStatus(true); }}>
            {getStatusChip(status)}
          </Box>
        );
      },
    },
    {
      headerName: 'Assignee', field: 'assigned_name', width: 130,
      renderCell: (p) => {
        const name = p.value?.length > 0 ? p.value : null;
        return name ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" fontSize="0.8rem">{name}</Typography>
            <IconButton size="small" onClick={() => handleRemove(p.row.id)} sx={{ color: '#bbb', '&:hover': { color: '#c62828' } }}>
              <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        ) : (
          <Button size="small" variant="text" sx={{ fontSize: '0.72rem', textTransform: 'none' }}
            onClick={() => { setSelectedRow(p.row.id); setOpenAssign(true); }}>
            + Assign
          </Button>
        );
      },
    },
  ];

  const rows = (error_dashboard_list || []).map((v) => ({
    ...v,
    current_status: v.current_status?.length > 0 ? v.current_status : 'pending',
    assigned_name: v.assigned_name?.length > 0 ? v.assigned_name : '',
  }));
  const activeFilterLabel = [
    formValues.filter_company_type !== 'all'
      ? `Type: ${COMPANY_TYPE_LABELS[formValues.filter_company_type] || formValues.filter_company_type}`
      : null,
    formValues.filter_company_id !== 'all'
      ? `Company ID: ${formValues.filter_company_id}`
      : null,
    formValues.filter_category !== 'all'
      ? `Category: ${formValues.filter_category}`
      : null,
    formValues.filter_from_date
      ? `From: ${moment(formValues.filter_from_date).format('DD MMM YYYY')}`
      : null,
    formValues.filter_to_date
      ? `To: ${moment(formValues.filter_to_date).format('DD MMM YYYY')}`
      : null,
  ].filter(Boolean).join(' | ');
  
  return (
    <Box sx={{ p: 2, height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="h6" fontWeight={700}>Error List</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={fetchErrors}>Refresh</Button>
          <Button size="small" variant="outlined" startIcon={<FilterAltIcon />} onClick={() => setOpenFilter(true)}>Filter</Button>
        </Box>
      </Box>

      {/* Summary chips */}
            <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
        <Chip label={`${error_dashboard_list_count || 0} total errors`} size="small" variant="outlined" />
        {activeFilterLabel && (
          <Chip
            label={activeFilterLabel}
            size="small"
            color="primary"
            variant="outlined"
            onDelete={handleFilterClear}
          />
        )}
      </Box>

      {/* DataGrid */}
      <Paper variant="outlined" sx={{ flex: 1, overflow: 'hidden' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          rowCount={error_dashboard_list_count || 0}
          paginationMode="server"
          pageSizeOptions={[20, 50, 100]}
          paginationModel={{ page: searchData.page, pageSize: searchData.pageSize }}
          onPaginationModelChange={(model) => {
            if (model.page !== searchData.page) setSearchData(s => ({ ...s, page: model.page }));
            if (model.pageSize !== searchData.pageSize) setSearchData(s => ({ ...s, pageSize: model.pageSize }));
          }}
          density="compact"
          disableRowSelectionOnClick
          getRowHeight={() => 'auto'}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': { py: 1, alignItems: 'flex-start' },
            '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8f9fa', fontWeight: 700 },
            '& .MuiDataGrid-row:hover': { bgcolor: '#f5f8ff' },
          }}
        />
      </Paper>

      {/* Assign Dialog */}
      <Dialog open={openAssign} onClose={() => setOpenAssign(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Assign Error</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={get_empbasecompany || []}
            getOptionLabel={(o) => o.username || ''}
            onChange={(_, val) => val && setAssignData({ assignee: val.developer_id, assigned_name: val.developer_name })}
            renderInput={(params) => <TextField {...params} label="Select assignee" size="small" sx={{ mt: 1 }} />}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssign(false)}>Cancel</Button>
          <Button variant="contained" disabled={!assignData.assignee} onClick={handleAssignSubmit}>Assign</Button>
        </DialogActions>
      </Dialog>

      {/* Status Dialog */}
      <Dialog open={openStatus} onClose={() => setOpenStatus(false)} maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Change Status</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <FormControl fullWidth size="small">
            <Select defaultValue="TO DO" onChange={handleStatusChange}>
              <MenuItem value="TO DO">To Do</MenuItem>
              <MenuItem value="IN PROGRESS">In Progress</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={openFilter} onClose={() => setOpenFilter(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Filter by Company</DialogTitle>
        <DialogContent>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <Select
              value={formValues.filter_company_type}
              onChange={(e) => handleFilterValueChange('filter_company_type', e.target.value)}
            >
              <MenuItem value="all"><em>All Company Types</em></MenuItem>
              {(filterOptions.company_types || []).map((s) => (
                <MenuItem value={s} key={s}>
                  {COMPANY_TYPE_LABELS[s] || s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mt: 2 }}>
            <Select
              value={formValues.filter_company_id}
              onChange={(e) => handleFilterValueChange('filter_company_id', e.target.value)}
            >
              <MenuItem value="all"><em>All Company IDs</em></MenuItem>
              {(filterOptions.company_ids || []).map((s) => (
                <MenuItem value={s} key={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small" sx={{ mt: 2 }}>
            <Select
              value={formValues.filter_category}
              onChange={(e) => handleFilterValueChange('filter_category', e.target.value)}
            >
              <MenuItem value="all"><em>All Categories</em></MenuItem>
              {(filterOptions.categories || []).map((s) => (
                <MenuItem value={s} key={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="From Date"
            value={formValues.filter_from_date}
            onChange={(e) => handleFilterValueChange('filter_from_date', e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: formValues.filter_to_date || undefined }}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            size="small"
            type="date"
            label="To Date"
            value={formValues.filter_to_date}
            onChange={(e) => handleFilterValueChange('filter_to_date', e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: formValues.filter_from_date || undefined }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFilterClear}>Clear</Button>
          <Button variant="contained" onClick={handleFilterSubmit}>Apply</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ErrorDashboardUsers;
