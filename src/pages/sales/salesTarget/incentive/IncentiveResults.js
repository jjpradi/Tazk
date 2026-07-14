import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { DataGrid } from '@mui/x-data-grid';
import CalculateIcon from '@mui/icons-material/Calculate';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { titleURL } from 'http-common';
import {
  computeIncentivesAction,
  getIncentiveResultsAction,
  approveResultAction,
  rejectResultAction,
  bulkApproveAction,
} from '../../../../redux/actions/salesTarget_actions';
import AchievementGauge from '../components/AchievementGauge';
import PeriodSelector from '../components/PeriodSelector';
import { getPeriodsAction } from '../../../../redux/actions/salesTarget_actions';

const STATUS_CONFIG = {
  computed: { label: 'Computed', color: '#1565C0', bg: '#E3F2FD' },
  submitted: { label: 'Submitted', color: '#ED6C02', bg: '#FFF3E0' },
  manager_approved: { label: 'Mgr Approved', color: '#2E7D32', bg: '#E8F5E9' },
  hr_approved: { label: 'HR Approved', color: '#1B5E20', bg: '#C8E6C9' },
  rejected: { label: 'Rejected', color: '#D32F2F', bg: '#FFEBEE' },
  paid: { label: 'Paid', color: '#616161', bg: '#F5F5F5' },
};

const GATE_CONFIG = {
  pass: { label: 'Pass', color: '#2E7D32', bg: '#E8F5E9' },
  fail: { label: 'Fail', color: '#D32F2F', bg: '#FFEBEE' },
};

const StatusChip = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, color: '#616161', bg: '#F5F5F5' };
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: 11 }}
    />
  );
};

const GateChip = ({ status }) => {
  const cfg = GATE_CONFIG[status] || GATE_CONFIG.fail;
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: 11 }}
    />
  );
};

function SummaryCard({ label, value, color }) {
  return (
    <Box sx={{ px: 2, py: 1.5, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E8EDF5', textAlign: 'center', minWidth: 120 }}>
      <Typography sx={{ fontSize: 11, color: '#8C8C8C', fontWeight: 500, mb: 0.3 }}>{label}</Typography>
      <Typography sx={{ fontSize: 16, fontWeight: 700, color: color || '#1A2027' }}>{value}</Typography>
    </Box>
  );
}

export default function IncentiveResults() {
  const dispatch = useDispatch();
  const { incentiveResults, loading } = useSelector((state) => state.salesTargetReducer);

  const [periodId, setPeriodId] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [rejectDialog, setRejectDialog] = useState({ open: false, resultId: null });
  const [rejectReason, setRejectReason] = useState('');
  const [computing, setComputing] = useState(false);

  const results = Array.isArray(incentiveResults) ? incentiveResults : [];

  useEffect(() => {
    dispatch(getPeriodsAction());
  }, [dispatch]);

  const fetchResults = useCallback(() => {
    if (periodId) {
      dispatch(getIncentiveResultsAction(periodId));
    }
  }, [dispatch, periodId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleCompute = () => {
    if (!periodId) return;
    setComputing(true);
    dispatch(
      computeIncentivesAction(periodId, () => {
        setComputing(false);
        fetchResults();
      })
    );
  };

  const handleApprove = (resultId) => {
    dispatch(
      approveResultAction(resultId, () => {
        fetchResults();
      })
    );
  };

  const handleRejectSubmit = () => {
    if (!rejectDialog.resultId) return;
    dispatch(
      rejectResultAction(rejectDialog.resultId, { reason: rejectReason }, () => {
        setRejectDialog({ open: false, resultId: null });
        setRejectReason('');
        fetchResults();
      })
    );
  };

  const handleBulkApprove = () => {
    if (!selectedIds.length) return;
    dispatch(
      bulkApproveAction({ ids: selectedIds }, () => {
        setSelectedIds([]);
        fetchResults();
      })
    );
  };

  const formatCurrency = (val) => {
    if (val == null) return '-';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  // Summary
  const totalLiability = results.reduce((s, r) => s + (r.total_incentive || 0), 0);
  const statusCounts = results.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const columns = [
    {
      field: 'salesman_name',
      headerName: 'Salesman',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{params.value || '-'}</Typography>
      ),
    },
    { field: 'location_name', headerName: 'Location', width: 130 },
    {
      field: 'achievement_pct',
      headerName: 'Achievement',
      width: 110,
      renderCell: (params) => (
        <AchievementGauge percentage={params.value || 0} size="sm" />
      ),
    },
    {
      field: 'base_incentive',
      headerName: 'Base Incentive',
      width: 130,
      valueFormatter: (value) => formatCurrency(value),
    },
    {
      field: 'addon_new_customer',
      headerName: 'New Cust.',
      width: 110,
      valueFormatter: (value) => formatCurrency(value),
    },
    {
      field: 'addon_collection',
      headerName: 'Collection',
      width: 110,
      valueFormatter: (value) => formatCurrency(value),
    },
    {
      field: 'total_incentive',
      headerName: 'Total',
      width: 120,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#1A2027' }}>
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'gate_status',
      headerName: 'Gate',
      width: 80,
      renderCell: (params) => <GateChip status={params.value} />,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => <StatusChip status={params.value} />,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const row = params.row;
        const canApprove = ['computed', 'submitted'].includes(row.status);
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {canApprove && (
              <Tooltip title="Approve">
                <IconButton size="small" color="success" onClick={() => handleApprove(row._id || row.id)}>
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canApprove && (
              <Tooltip title="Reject">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setRejectDialog({ open: true, resultId: row._id || row.id })}
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => setExpandedRow(expandedRow === (row._id || row.id) ? null : (row._id || row.id))}
              >
                {expandedRow === (row._id || row.id) ? (
                  <ExpandLessIcon fontSize="small" />
                ) : (
                  <ExpandMoreIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  const rows = results.map((r, idx) => ({
    ...r,
    id: r._id || r.id || idx,
  }));

  return (
    <>
      <Helmet>
        <title>Incentive Results | {titleURL}</title>
      </Helmet>

      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1A2027', mb: 3 }}>
          Incentive Results
        </Typography>

        {/* Controls */}
        <Card sx={{ borderRadius: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', mb: 3 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                <PeriodSelector value={periodId} onChange={(e) => setPeriodId(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 8, md: 9 }}>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={computing ? <CircularProgress size={16} color="inherit" /> : <CalculateIcon />}
                    onClick={handleCompute}
                    disabled={!periodId || computing}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    {computing ? 'Computing...' : 'Compute Incentives'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DoneAllIcon />}
                    onClick={handleBulkApprove}
                    disabled={!selectedIds.length}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    Approve Selected ({selectedIds.length})
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Summary Footer */}
        {results.length > 0 && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            <SummaryCard label="Total Liability" value={formatCurrency(totalLiability)} color="#1565C0" />
            <SummaryCard label="Total Results" value={results.length} />
            {Object.entries(statusCounts).map(([status, count]) => {
              const cfg = STATUS_CONFIG[status] || {};
              return <SummaryCard key={status} label={cfg.label || status} value={count} color={cfg.color} />;
            })}
          </Box>
        )}

        {/* Results Table */}
        <Card sx={{ borderRadius: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              autoHeight
              checkboxSelection
              disableRowSelectionOnClick
              onRowSelectionModelChange={(ids) => setSelectedIds(ids)}
              rowSelectionModel={selectedIds}
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
              getRowClassName={(params) =>
                expandedRow === (params.row._id || params.row.id) ? 'row-expanded' : ''
              }
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
                '& .row-expanded': { bgcolor: '#F0F7FF' },
              }}
              slots={{
                noRowsOverlay: () => (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', py: 6 }}>
                    <Typography sx={{ color: '#919EAB', fontSize: 14, mb: 0.5 }}>
                      {periodId ? 'No results found for this period' : 'Enter a period ID to load results'}
                    </Typography>
                    {periodId && (
                      <Button size="small" startIcon={<CalculateIcon />} onClick={handleCompute}>
                        Compute Incentives
                      </Button>
                    )}
                  </Box>
                ),
                loadingOverlay: () => (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <CircularProgress size={28} />
                  </Box>
                ),
              }}
            />

            {/* Expanded Row Detail */}
            {expandedRow && (() => {
              const row = results.find((r) => (r._id || r.id) === expandedRow);
              if (!row) return null;
              return (
                <Collapse in={!!expandedRow}>
                  <Box sx={{ px: 4, py: 3, bgcolor: '#F8FAFC', borderTop: '1px solid #E8EDF5' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                      Incentive Breakdown - {row.salesman_name}
                    </Typography>
                    <Grid container spacing={3}>
                      {/* Slab Details */}
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#637381' }}>
                          Slab Applied
                        </Typography>
                        {row.slab_applied ? (
                          <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 1.5, border: '1px solid #E0E0E0' }}>
                            <Typography variant="body2">
                              Range: {row.slab_applied.from_pct}% - {row.slab_applied.to_pct}%
                            </Typography>
                            <Typography variant="body2">
                              Type: {row.slab_applied.incentive_type} | Value: {row.slab_applied.value}
                            </Typography>
                            {row.slab_applied.label && (
                              <Chip label={row.slab_applied.label} size="small" sx={{ mt: 1 }} />
                            )}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">No slab data</Typography>
                        )}
                      </Grid>

                      {/* Gate Check Details */}
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#637381' }}>
                          Gate Check Details
                        </Typography>
                        <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 1.5, border: '1px solid #E0E0E0' }}>
                          {row.gate_details ? (
                            <>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2">Achievement:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {row.gate_details.achievement_pct ?? '-'}%
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2">Collection:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {row.gate_details.collection_pct ?? '-'}%
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2">Returns:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {row.gate_details.returns_pct ?? '-'}%
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">Concentration:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {row.gate_details.concentration_pct ?? '-'}%
                                </Typography>
                              </Box>
                            </>
                          ) : (
                            <Typography variant="body2" color="text.secondary">No gate data</Typography>
                          )}
                        </Box>
                      </Grid>

                      {/* Add-on Breakdown */}
                      <Grid size={12}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#637381' }}>
                          Add-on Breakdown
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <SummaryCard label="Base" value={formatCurrency(row.base_incentive)} color="#1565C0" />
                          <SummaryCard label="New Customer" value={formatCurrency(row.addon_new_customer)} color="#2E7D32" />
                          <SummaryCard label="Focus Product" value={formatCurrency(row.addon_focus_product)} color="#ED6C02" />
                          <SummaryCard label="Collection" value={formatCurrency(row.addon_collection)} color="#1565C0" />
                          <SummaryCard label="Quality" value={formatCurrency(row.addon_quality)} color="#7B1FA2" />
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Collapse>
              );
            })()}
          </CardContent>
        </Card>
      </Box>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialog.open}
        onClose={() => { setRejectDialog({ open: false, resultId: null }); setRejectReason(''); }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Reject Incentive</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: '#637381' }}>
            Please provide a reason for rejecting this incentive result.
          </Typography>
          <TextField
            label="Rejection Reason"
            fullWidth
            multiline
            minRows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            required
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setRejectDialog({ open: false, resultId: null }); setRejectReason(''); }}>
            Cancel
          </Button>
          <Button
            onClick={handleRejectSubmit}
            color="error"
            variant="contained"
            disabled={!rejectReason.trim()}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
