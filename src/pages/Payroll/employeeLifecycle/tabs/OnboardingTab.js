import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Avatar, Chip, LinearProgress, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  MenuItem, Grid,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import {
  getEmployeeChecklistAction,
  updateChecklistItemStatusAction,
  getOnboardingDashboardAction,
} from 'redux/actions/employeeLifecycle.actions';

const statusConfig = {
  pending: { label: 'Pending', color: 'default', icon: <HourglassEmptyIcon /> },
  in_progress: { label: 'In Progress', color: 'warning', icon: <AutorenewIcon /> },
  completed: { label: 'Completed', color: 'success', icon: <CheckCircleIcon /> },
  skipped: { label: 'Skipped', color: 'default', icon: <SkipNextIcon /> },
};

const categoryColors = {
  documentation: '#1976d2',
  it_setup: '#9c27b0',
  hr_formalities: '#2e7d32',
  training: '#ed6c02',
  compliance: '#d32f2f',
};

export default function OnboardingTab() {
  const [detailDialog, setDetailDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [statusItem, setStatusItem] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: '', remarks: '' });

  const dispatch = useDispatch();
  const { EmployeeLifecycleReducer: { onboardingDashboard, employeeChecklist } } = useSelector((s) => s);
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  const handleViewChecklist = async (emp) => {
    setSelectedEmployee(emp);
    await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
      dispatch(getEmployeeChecklistAction(emp.employee_id, setModalTypeHandler, setLoaderStatusHandler)));
    setDetailDialog(true);
  };

  const handleStatusClick = (item) => {
    setStatusItem(item);
    setStatusForm({ status: item.status, remarks: item.remarks || '' });
    setStatusDialog(true);
  };

  const handleStatusSave = async () => {
    await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
      dispatch(updateChecklistItemStatusAction(
        { id: statusItem.id, status: statusForm.status, remarks: statusForm.remarks },
        setModalTypeHandler, setLoaderStatusHandler,
      )));
    setStatusDialog(false);
    // Refresh checklist
    if (selectedEmployee) {
      await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
        dispatch(getEmployeeChecklistAction(selectedEmployee.employee_id, setModalTypeHandler, setLoaderStatusHandler)));
    }
    // Refresh dashboard
    await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
      dispatch(getOnboardingDashboardAction(setModalTypeHandler, setLoaderStatusHandler)));
  };

  const dashboard = onboardingDashboard || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
          Onboarding Progress ({dashboard.length} employees)
        </Typography>
      </Box>

      {dashboard.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <PlaylistAddCheckIcon sx={{ fontSize: 48, mb: 1, opacity: 0.4 }} />
          <Typography variant='body2'>No pending onboarding checklists</Typography>
          <Typography sx={{ fontSize: 11, mt: 0.5 }}>
            Initialize checklists for new employees from the Lifecycle Events tab
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {dashboard.map((emp) => (
            <Grid key={emp.employee_id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Avatar
                    src={emp.image}
                    sx={{ width: 40, height: 40, fontSize: 14, bgcolor: 'primary.main' }}
                  >
                    {(emp.employee_name || '?')[0]}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {emp.employee_name}
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                      {emp.employee_code} &bull; {emp.designation}
                    </Typography>
                  </Box>
                  <IconButton size='small' onClick={() => handleViewChecklist(emp)}>
                    <VisibilityIcon fontSize='small' />
                  </IconButton>
                </Box>

                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                      {emp.completed_items}/{emp.total_items} completed
                    </Typography>
                    <Typography sx={{ fontSize: 10, fontWeight: 600, color: 'primary.main' }}>
                      {emp.progress_pct}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant='determinate'
                    value={Number(emp.progress_pct) || 0}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {emp.department_name && (
                    <Chip label={emp.department_name} size='small' variant='outlined' sx={{ fontSize: 9 }} />
                  )}
                  <Chip label={`DOJ: ${emp.doj_formatted}`} size='small' variant='outlined' sx={{ fontSize: 9 }} />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Checklist Detail Dialog */}
      <Dialog open={detailDialog} onClose={() => setDetailDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600 }}>
          Onboarding Checklist — {selectedEmployee?.employee_name}
        </DialogTitle>
        <DialogContent>
          {(employeeChecklist || []).length === 0 ? (
            <Typography sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
              No checklist items found
            </Typography>
          ) : (
            <Box sx={{ mt: 1 }}>
              {['documentation', 'it_setup', 'hr_formalities', 'training', 'compliance'].map((cat) => {
                const items = (employeeChecklist || []).filter((i) => i.category === cat);
                if (items.length === 0) return null;
                return (
                  <Box key={cat} sx={{ mb: 2 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 1, textTransform: 'capitalize', color: categoryColors[cat] }}>
                      {cat.replace('_', ' ')}
                    </Typography>
                    {items.map((item) => {
                      const sc = statusConfig[item.status] || statusConfig.pending;
                      return (
                        <Paper
                          key={item.id}
                          elevation={0}
                          sx={{
                            p: 1.5, mb: 0.5, borderRadius: 1.5,
                            border: '1px solid', borderColor: 'divider',
                            display: 'flex', alignItems: 'center', gap: 1.5,
                            cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' },
                          }}
                          onClick={() => handleStatusClick(item)}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                              {item.item_name}
                              {item.is_mandatory ? <span style={{ color: '#d32f2f' }}> *</span> : ''}
                            </Typography>
                            {item.item_description && (
                              <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                                {item.item_description}
                              </Typography>
                            )}
                          </Box>
                          <Chip
                            label={item.responsible_type?.toUpperCase()}
                            size='small'
                            variant='outlined'
                            sx={{ fontSize: 9, minWidth: 40 }}
                          />
                          <Chip
                            icon={sc.icon}
                            label={sc.label}
                            size='small'
                            color={sc.color}
                            sx={{ fontSize: 10 }}
                          />
                        </Paper>
                      );
                    })}
                  </Box>
                );
              })}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDetailDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontSize: 14, fontWeight: 600 }}>
          Update: {statusItem?.item_name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <TextField
                select name='status' label='Status' size='small' fullWidth
                value={statusForm.status}
                onChange={(e) => setStatusForm((p) => ({ ...p, status: e.target.value }))}
              >
                {Object.entries(statusConfig).map(([key, val]) => (
                  <MenuItem key={key} value={key}>{val.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField
                name='remarks' label='Remarks' size='small' fullWidth multiline rows={2}
                value={statusForm.remarks}
                onChange={(e) => setStatusForm((p) => ({ ...p, remarks: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setStatusDialog(false)} color='error'>Cancel</Button>
          <Button onClick={handleStatusSave} variant='contained'>Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
