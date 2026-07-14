import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Avatar, Chip, Grid, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
} from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  createLifecycleEventAction,
  getProbationEmployeesAction,
  getDashboardStatsAction,
} from 'redux/actions/employeeLifecycle.actions';

const probationStatusConfig = {
  confirmed: { label: 'Confirmed', color: 'success', icon: <CheckCircleIcon /> },
  overdue: { label: 'Overdue', color: 'error', icon: <ErrorOutlineIcon /> },
  due_soon: { label: 'Due Soon', color: 'warning', icon: <WarningAmberIcon /> },
  on_probation: { label: 'On Probation', color: 'info', icon: <HourglassBottomIcon /> },
};

export default function ProbationTab() {
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [confirmDate, setConfirmDate] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [filter, setFilter] = useState('all');

  const dispatch = useDispatch();
  const { EmployeeLifecycleReducer: { probationEmployees } } = useSelector((s) => s);
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  const employees = (probationEmployees || []).filter((e) => {
    if (filter === 'all') return true;
    return e.probation_status === filter;
  });

  const counts = {
    all: (probationEmployees || []).length,
    overdue: (probationEmployees || []).filter((e) => e.probation_status === 'overdue').length,
    due_soon: (probationEmployees || []).filter((e) => e.probation_status === 'due_soon').length,
    on_probation: (probationEmployees || []).filter((e) => e.probation_status === 'on_probation').length,
    confirmed: (probationEmployees || []).filter((e) => e.probation_status === 'confirmed').length,
  };

  const handleConfirm = (emp) => {
    setSelectedEmployee(emp);
    setConfirmDate(new Date());
    setRemarks('');
    setConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    const data = {
      employee_id: selectedEmployee.employee_id,
      event_type: 'confirmation',
      event_date: new Date().toISOString().split('T')[0],
      effective_date: confirmDate ? confirmDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      remarks,
      status: 'completed',
    };
    await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
      dispatch(createLifecycleEventAction(data, setModalTypeHandler, setLoaderStatusHandler)));
    setConfirmDialog(false);
    // Refresh
    await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
      dispatch(getProbationEmployeesAction(setModalTypeHandler, setLoaderStatusHandler)));
    await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
      dispatch(getDashboardStatsAction(setModalTypeHandler, setLoaderStatusHandler)));
  };

  return (
    <Box>
      {/* Filter Chips */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'overdue', label: 'Overdue' },
          { key: 'due_soon', label: 'Due Soon' },
          { key: 'on_probation', label: 'On Probation' },
          { key: 'confirmed', label: 'Confirmed' },
        ].map((f) => (
          <Chip
            key={f.key}
            label={`${f.label} (${counts[f.key]})`}
            size='small'
            variant={filter === f.key ? 'filled' : 'outlined'}
            color={filter === f.key ? 'primary' : 'default'}
            onClick={() => setFilter(f.key)}
            sx={{ fontSize: 11, cursor: 'pointer' }}
          />
        ))}
      </Box>

      {employees.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <TimerIcon sx={{ fontSize: 48, mb: 1, opacity: 0.4 }} />
          <Typography variant='body2'>No employees matching the filter</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {employees.map((emp) => {
            const ps = probationStatusConfig[emp.probation_status] || probationStatusConfig.on_probation;
            return (
              <Grid key={emp.employee_id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                    borderLeft: '3px solid',
                    borderLeftColor: emp.probation_status === 'overdue' ? 'error.main'
                      : emp.probation_status === 'due_soon' ? 'warning.main'
                      : emp.probation_status === 'confirmed' ? 'success.main' : 'info.main',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Avatar
                      src={emp.image}
                      sx={{ width: 40, height: 40, fontSize: 14, bgcolor: 'primary.main' }}
                    >
                      {(emp.first_name || '?')[0]}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {emp.full_name}
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                        {emp.employee_code} &bull; {emp.designation}
                      </Typography>
                    </Box>
                    <Chip
                      icon={ps.icon}
                      label={ps.label}
                      size='small'
                      color={ps.color}
                      sx={{ fontSize: 10 }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>DOJ</Typography>
                      <Typography sx={{ fontSize: 10, fontWeight: 500 }}>{emp.doj_formatted}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Probation Ends</Typography>
                      <Typography sx={{ fontSize: 10, fontWeight: 500 }}>{emp.probation_end_formatted}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Days Remaining</Typography>
                      <Typography sx={{
                        fontSize: 10, fontWeight: 600,
                        color: emp.days_remaining < 0 ? 'error.main' : emp.days_remaining <= 15 ? 'warning.main' : 'text.primary',
                      }}>
                        {emp.days_remaining < 0 ? `${Math.abs(emp.days_remaining)} days overdue` : `${emp.days_remaining} days`}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {emp.department_name && (
                      <Chip label={emp.department_name} size='small' variant='outlined' sx={{ fontSize: 9 }} />
                    )}
                    {emp.employment_type && (
                      <Chip label={emp.employment_type} size='small' variant='outlined' sx={{ fontSize: 9, textTransform: 'capitalize' }} />
                    )}
                  </Box>

                  {emp.probation_status !== 'confirmed' && (
                    <Button
                      variant='contained' size='small' fullWidth
                      sx={{ mt: 1.5, fontSize: 11, textTransform: 'none' }}
                      onClick={() => handleConfirm(emp)}
                    >
                      Confirm Employee
                    </Button>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600 }}>
          Confirm Employee
        </DialogTitle>
        <DialogContent>
          {selectedEmployee && (
            <Box sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: 13, mb: 2 }}>
                Confirming <strong>{selectedEmployee.full_name}</strong> ({selectedEmployee.employee_code})
              </Typography>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <DatePicker
                    label='Confirmation Date'
                    value={confirmDate}
                    onChange={setConfirmDate}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    label='Remarks' size='small' fullWidth multiline rows={2}
                    value={remarks} onChange={(e) => setRemarks(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDialog(false)} color='error'>Cancel</Button>
          <Button onClick={handleConfirmSave} variant='contained'>Confirm</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
