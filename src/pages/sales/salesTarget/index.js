import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, Typography, Button, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, CircularProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Helmet } from 'react-helmet-async';
import AddIcon from '@mui/icons-material/Add';
import PublishIcon from '@mui/icons-material/Publish';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import moment from 'moment';
import { titleURL } from 'http-common';
import {
  getPeriodsAction,
  createPeriodAction,
  publishPeriodAction,
  lockPeriodAction,
} from '../../../redux/actions/salesTarget_actions';
import SalesTargetService from '../../../services/salesTarget_services';
import { OpenalertActions } from '../../../redux/actions/alert_actions';

const STATUS_MAP = {
  draft: { label: 'Draft', color: 'default' },
  published: { label: 'Published', color: 'info' },
  locked: { label: 'Locked', color: 'warning' },
  closed: { label: 'Closed', color: 'success' },
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function SalesTargetPeriods() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { periods, loading } = useSelector((state) => state.salesTargetReducer);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPeriod, setNewPeriod] = useState({ month: moment().month() + 1, year: moment().year() });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    dispatch(getPeriodsAction());
  }, [dispatch]);

  const handleCreate = useCallback(() => {
    setCreating(true);
    dispatch(createPeriodAction(
      { month: newPeriod.month, year: newPeriod.year },
      () => {
        setDialogOpen(false);
        setCreating(false);
        dispatch(getPeriodsAction());
      },
    ));
    // Reset on error
    setTimeout(() => setCreating(false), 5000);
  }, [dispatch, newPeriod]);

  const handleStatusChange = useCallback((id, action) => {
    const actionMap = {
      publish: publishPeriodAction,
      lock: lockPeriodAction,
    };
    const fn = actionMap[action];
    if (fn) {
      dispatch(fn(id, () => dispatch(getPeriodsAction())));
    } else if (action === 'close') {
      SalesTargetService.updatePeriodStatus(id, { status: 'closed' }).then(() => {
        dispatch(OpenalertActions({ msg: 'Period closed', severity: 'success' }));
        dispatch(getPeriodsAction());
      }).catch(() => {
        dispatch(OpenalertActions({ msg: 'Failed to close period', severity: 'error' }));
      });
    } else if (action === 'reopen') {
      SalesTargetService.updatePeriodStatus(id, { status: 'draft' }).then(() => {
        dispatch(OpenalertActions({ msg: 'Period reopened', severity: 'info' }));
        dispatch(getPeriodsAction());
      }).catch(() => {
        dispatch(OpenalertActions({ msg: 'Failed to reopen period', severity: 'error' }));
      });
    }
  }, [dispatch]);

  const columns = [
    {
      field: 'period_name',
      headerName: 'Period Name',
      flex: 1.2,
      minWidth: 180,
      renderCell: (params) => (
        <Typography
          sx={{ fontWeight: 500, fontSize: 13, color: '#1976d2', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => navigate(`/sales/targetPeriods/${params.row.id}/assign`)}
        >
          {params.value || `${MONTHS[(params.row.period_month || params.row.month || 1) - 1]} ${params.row.period_year || params.row.year}`}
        </Typography>
      ),
    },
    {
      field: 'month',
      headerName: 'Month / Year',
      flex: 0.8,
      minWidth: 130,
      renderCell: (params) => (
        <Typography sx={{ fontSize: 13 }}>
          {MONTHS[(params.row.period_month || params.row.month || 1) - 1]} {params.row.period_year || params.row.year}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.6,
      minWidth: 110,
      renderCell: (params) => {
        const cfg = STATUS_MAP[params.value] || STATUS_MAP.draft;
        return <Chip label={cfg.label} color={cfg.color} size="small" variant="outlined" />;
      },
    },
    {
      field: 'published_by_name',
      headerName: 'Created By',
      flex: 0.8,
      minWidth: 130,
      renderCell: (params) => (
        <Typography sx={{ fontSize: 13 }}>{params.value || '-'}</Typography>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      flex: 0.7,
      minWidth: 110,
      renderCell: (params) => (
        <Typography sx={{ fontSize: 12, color: '#666' }}>
          {params.value ? moment(params.value).format('DD MMM YYYY') : '-'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.8,
      minWidth: 130,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const { status } = params.row;
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {status === 'draft' && (
              <Tooltip title="Publish">
                <IconButton
                  size="small"
                  color="info"
                  onClick={(e) => { e.stopPropagation(); handleStatusChange(params.row.id, 'publish'); }}
                >
                  <PublishIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {status === 'published' && (
              <Tooltip title="Lock">
                <IconButton
                  size="small"
                  color="warning"
                  onClick={(e) => { e.stopPropagation(); handleStatusChange(params.row.id, 'lock'); }}
                >
                  <LockIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {(status === 'locked' || status === 'published') && (
              <Tooltip title="Close">
                <IconButton
                  size="small"
                  color="success"
                  onClick={(e) => { e.stopPropagation(); handleStatusChange(params.row.id, 'close'); }}
                >
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {(status === 'closed' || status === 'locked') && (
              <Tooltip title="Reopen as Draft">
                <IconButton
                  size="small"
                  color="default"
                  onClick={(e) => { e.stopPropagation(); handleStatusChange(params.row.id, 'reopen'); }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ];

  const rows = (Array.isArray(periods) ? periods : []).map((p, idx) => ({
    ...p,
    id: p.id || p.period_id || idx,
  }));

  return (
    <>
      <Helmet><title>{titleURL} | Sales Target</title></Helmet>
      <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#2E3A59' }}>
            Sales Target
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{ textTransform: 'none', fontWeight: 500 }}
          >
            New Period
          </Button>
        </Box>

        {/* Data Grid */}
        <Box sx={{ flex: 1 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            onRowClick={(params) => navigate(`/sales/targetPeriods/${params.row.id}/assign`)}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            sx={{
              border: 'none',
              cursor: 'pointer',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#F5F7FA',
                borderBottom: '1px solid #E8EDF5',
              },
              '& .MuiDataGrid-row:hover': { backgroundColor: '#F8FAFC' },
              '& .MuiDataGrid-cell': { fontSize: 13 },
            }}
            slots={{
              noRowsOverlay: () => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography sx={{ color: '#999', fontSize: 14 }}>
                    No target periods found. Click "New Period" to create one.
                  </Typography>
                </Box>
              ),
            }}
          />
        </Box>
      </Card>

      {/* Create Period Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 15 }}>Create New Period</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <TextField
              select
              label="Month"
              value={newPeriod.month}
              onChange={(e) => setNewPeriod((p) => ({ ...p, month: e.target.value }))}
              fullWidth
              size="small"
            >
              {MONTHS.map((m, i) => {
                const monthVal = i + 1;
                const isPast = newPeriod.year < moment().year() || (newPeriod.year === moment().year() && monthVal < moment().month() + 1);
                const exists = (Array.isArray(periods) ? periods : []).some(p => (p.period_month || p.month) === monthVal && (p.period_year || p.year) === newPeriod.year);
                const disabled = isPast || exists;
                return <MenuItem key={m} value={monthVal} disabled={disabled}>{m}{isPast ? ' (past)' : exists ? ' (exists)' : ''}</MenuItem>;
              })}
            </TextField>
            <TextField
              label="Year"
              type="number"
              value={newPeriod.year}
              onChange={(e) => setNewPeriod((p) => ({ ...p, year: Number(e.target.value) }))}
              fullWidth
              size="small"
              inputProps={{ min: 2020, max: 2040 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} size="small" sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={creating}
            size="small"
            sx={{ textTransform: 'none' }}
            startIcon={creating ? <CircularProgress size={16} /> : null}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
