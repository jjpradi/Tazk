import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Switch,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { titleURL } from 'http-common';
import { getPlansAction, updatePlanAction } from '../../../../redux/actions/salesTarget_actions';

const PLAN_TYPE_CONFIG = {
  base: { label: 'Base', color: 'primary' },
  addon_new_customer: { label: 'New Customer', chipColor: '#2E7D32', bg: '#E8F5E9' },
  addon_focus_product: { label: 'Focus Product', chipColor: '#ED6C02', bg: '#FFF3E0' },
  addon_collection: { label: 'Collection', chipColor: '#1565C0', bg: '#E3F2FD' },
  addon_quality: { label: 'Quality', chipColor: '#7B1FA2', bg: '#F3E5F5' },
};

const PlanTypeChip = ({ type }) => {
  const cfg = PLAN_TYPE_CONFIG[type];
  if (!cfg) return <Chip label={type} size="small" />;
  if (cfg.color) return <Chip label={cfg.label} size="small" color={cfg.color} />;
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{ bgcolor: cfg.bg, color: cfg.chipColor, fontWeight: 600, fontSize: 11 }}
    />
  );
};

export default function IncentivePlanList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { plans, loading } = useSelector((state) => state.salesTargetReducer);

  const [deleteDialog, setDeleteDialog] = useState({ open: false, plan: null });

  useEffect(() => {
    dispatch(getPlansAction());
  }, [dispatch]);

  const handleToggleActive = (plan) => {
    dispatch(
      updatePlanAction(plan._id || plan.id, { is_active: !plan.is_active }, () => {
        dispatch(getPlansAction());
      })
    );
  };

  const handleDelete = () => {
    if (!deleteDialog.plan) return;
    const planId = deleteDialog.plan._id || deleteDialog.plan.id;
    dispatch(
      updatePlanAction(planId, { is_deleted: true }, () => {
        setDeleteDialog({ open: false, plan: null });
        dispatch(getPlansAction());
      })
    );
  };

  const columns = [
    {
      field: 'plan_name',
      headerName: 'Plan Name',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{params.value}</Typography>
      ),
    },
    {
      field: 'plan_type',
      headerName: 'Type',
      width: 160,
      renderCell: (params) => <PlanTypeChip type={params.value} />,
    },
    {
      field: 'effective_from',
      headerName: 'Effective From',
      width: 130,
      valueFormatter: (value) => (value ? new Date(value).toLocaleDateString('en-IN') : '-'),
    },
    {
      field: 'effective_to',
      headerName: 'Effective To',
      width: 130,
      valueFormatter: (value) => (value ? new Date(value).toLocaleDateString('en-IN') : '-'),
    },
    {
      field: 'is_active',
      headerName: 'Active',
      width: 90,
      renderCell: (params) => (
        <Switch
          size="small"
          checked={!!params.value}
          onChange={() => handleToggleActive(params.row)}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              color="primary"
              onClick={() => navigate(`/sales/incentivePlans/${params.row._id || params.row.id}/edit`)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => setDeleteDialog({ open: true, plan: params.row })}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const rows = (Array.isArray(plans) ? plans : []).map((p, idx) => ({
    ...p,
    id: p._id || p.id || idx,
  }));

  return (
    <>
      <Helmet>
        <title>Incentive Plans | {titleURL}</title>
      </Helmet>

      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1A2027' }}>
            Incentive Plans
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/sales/incentivePlans/new')}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Add Plan
          </Button>
        </Box>

        {/* Table */}
        <Card sx={{ borderRadius: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              autoHeight
              disableRowSelectionOnClick
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: '#F8FAFC',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#637381',
                },
                '& .MuiDataGrid-cell': { fontSize: 13 },
                '& .MuiDataGrid-row:hover': { bgcolor: '#F8FAFC' },
              }}
              slots={{
                noRowsOverlay: () => (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', py: 6 }}>
                    <Typography sx={{ color: '#919EAB', fontSize: 14, mb: 1 }}>No incentive plans found</Typography>
                    <Button size="small" startIcon={<AddIcon />} onClick={() => navigate('/sales/incentivePlans/new')}>
                      Create your first plan
                    </Button>
                  </Box>
                ),
                loadingOverlay: () => (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <CircularProgress size={28} />
                  </Box>
                ),
              }}
            />
          </CardContent>
        </Card>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, plan: null })}>
        <DialogTitle>Delete Plan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the plan &quot;{deleteDialog.plan?.plan_name}&quot;? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, plan: null })}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
