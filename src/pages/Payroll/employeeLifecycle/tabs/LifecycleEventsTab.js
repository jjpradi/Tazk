import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Chip, Button, TextField, MenuItem, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, Avatar, Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TimelineIcon from '@mui/icons-material/Timeline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import RestoreIcon from '@mui/icons-material/Restore';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import {
  getLifecycleEventsByTypeAction,
  createLifecycleEventAction,
  approveLifecycleEventAction,
  completeLifecycleEventAction,
  cancelLifecycleEventAction,
  updateLifecycleEventAction,
  getDashboardStatsAction,
} from 'redux/actions/employeeLifecycle.actions';
import { searchEmployeesAction } from 'redux/actions/employeeProfile.actions';
import toMomentOrNull from 'utils/DateFixer';

const eventTypeConfig = {
  onboarding: { label: 'Onboarding', color: '#1976d2', icon: <PersonAddIcon /> },
  confirmation: { label: 'Confirmation', color: '#2e7d32', icon: <CheckCircleIcon /> },
  promotion: { label: 'Promotion', color: '#ed6c02', icon: <TrendingUpIcon /> },
  transfer: { label: 'Transfer', color: '#9c27b0', icon: <SwapHorizIcon /> },
  increment: { label: 'Increment', color: '#0288d1', icon: <MonetizationOnIcon /> },
  separation: { label: 'Separation', color: '#d32f2f', icon: <ExitToAppIcon /> },
  rehire: { label: 'Rehire', color: '#388e3c', icon: <RestoreIcon /> },
};

const statusColors = {
  draft: 'default', pending: 'warning', approved: 'info', completed: 'success', cancelled: 'error',
};

export default function LifecycleEventsTab() {
  const [eventType, setEventType] = useState('promotion');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [localEvents, setLocalEvents] = useState([]);

  const dispatch = useDispatch();
  const {
    EmployeeLifecycleReducer: { eventsByType },
    EmployeeProfileReducer: { employeeList },
  } = useSelector((s) => s);
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  const loadEvents = async (type) => {
    await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
      dispatch(getLifecycleEventsByTypeAction(type, setModalTypeHandler, setLoaderStatusHandler)));
  };

  const handleTypeChange = (type) => {
    setEventType(type);
    loadEvents(type);
  };
  useEffect(() => {
  setLocalEvents(eventsByType || []);
}, [eventsByType]);
  const normalizeDateValue = (value) => {
    if (!value) return null;
    if (typeof value === 'string') return new Date(value);
    if (value._isAMomentObject) return value.toDate();
    if (value instanceof Date) return value;
    return new Date(value);
  };

  const calculateConfirmationDate = (joiningDate, probationaryMonths) => {
    const dateObj = normalizeDateValue(joiningDate);
    if (!dateObj || Number.isNaN(dateObj.getTime())) return '';
    dateObj.setMonth(dateObj.getMonth() + Number(probationaryMonths || 0));
    return dateObj.toISOString().split('T')[0];
  };

  const handleAdd = async () => {
    // Load employee list for autocomplete
    await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
      dispatch(searchEmployeesAction(setModalTypeHandler, setLoaderStatusHandler)));
    setFormValues({
      event_type: eventType,
      event_date: new Date(),
      effective_date: new Date(),
      status: 'draft',
      date_of_joining: new Date(),
      date_of_training: new Date(),
      probationary_months: 3,
      date_of_confirmation: calculateConfirmationDate(new Date(), 3),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      ...formValues,
      event_date: formValues.event_date ? (typeof formValues.event_date === 'string' ? formValues.event_date : formValues.event_date.toISOString().split('T')[0]) : null,
      effective_date: formValues.effective_date ? (typeof formValues.effective_date === 'string' ? formValues.effective_date : formValues.effective_date.toISOString().split('T')[0]) : null,
      date_of_joining: formValues.date_of_joining ? (typeof formValues.date_of_joining === 'string' ? formValues.date_of_joining : formValues.date_of_joining.toISOString().split('T')[0]) : null,
      date_of_training: formValues.date_of_training ? (typeof formValues.date_of_training === 'string' ? formValues.date_of_training : formValues.date_of_training.toISOString().split('T')[0]) : null,
      date_of_confirmation: formValues.date_of_confirmation ? (typeof formValues.date_of_confirmation === 'string' ? formValues.date_of_confirmation : formValues.date_of_confirmation.toISOString().split('T')[0]) : null,
      last_working_date: formValues.last_working_date ? (typeof formValues.last_working_date === 'string' ? formValues.last_working_date : formValues.last_working_date.toISOString().split('T')[0]) : null,
    };
    await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
      dispatch(createLifecycleEventAction(payload, setModalTypeHandler, setLoaderStatusHandler)));
    setDialogOpen(false);
    loadEvents(eventType);
    await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
      dispatch(getDashboardStatsAction(setModalTypeHandler, setLoaderStatusHandler)));
  };

  const handleApprove = async (id) => {
    await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
      dispatch(approveLifecycleEventAction({ id }, setModalTypeHandler, setLoaderStatusHandler)));
    loadEvents(eventType);
  };

  const handleComplete = async (id) => {
    await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
      dispatch(completeLifecycleEventAction({ id }, setModalTypeHandler, setLoaderStatusHandler)));
    loadEvents(eventType);
    await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
      dispatch(getDashboardStatsAction(setModalTypeHandler, setLoaderStatusHandler)));
  };

  const handleCancel = async (id) => {
    await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
      dispatch(cancelLifecycleEventAction({ id, cancel_reason: 'Cancelled by HR' }, setModalTypeHandler, setLoaderStatusHandler)));
    loadEvents(eventType);
  };

  const events = localEvents;
  const cfg = eventTypeConfig[eventType] || eventTypeConfig.promotion;

const handleSubmitForApproval = async (id) => {
  setLocalEvents((prev) =>
    prev.map((evt) =>
      evt.id === id ? { ...evt, status: 'pending' } : evt
    )
  );
  try {
    await apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        updateLifecycleEventAction(
          { id, status: 'pending' },
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      ),
    );
  } catch (error) {
    setLocalEvents((prev) =>
      prev.map((evt) =>
        evt.id === id ? { ...evt, status: 'draft' } : evt
      )
    );
  }
};

  const handleFieldChange = (field, value) => {
    setFormValues((p) => {
      const updated = { ...p, [field]: value };
      if (field === 'date_of_joining' || field === 'probationary_months') {
        updated.date_of_confirmation = calculateConfirmationDate(
          field === 'date_of_joining' ? value : p.date_of_joining,
          field === 'probationary_months' ? value : p.probationary_months,
        );
      }
      return updated;
    });
  };
const employeeOptions = useMemo(() => {
  const seen = new Set();
  return (employeeList || []).filter((emp) => {
    const uniqueId = emp.employee_id;
    if (!uniqueId || seen.has(uniqueId)) {
      return false;
    }
    seen.add(uniqueId);
    return true;
  });
}, [employeeList]);

  return (
    <Box>
      {/* Event Type Selector */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        {Object.entries(eventTypeConfig).map(([key, val]) => (
          <Chip
            key={key}
            icon={val.icon}
            label={val.label}
            size='small'
            variant={eventType === key ? 'filled' : 'outlined'}
            sx={{
              fontSize: 11, cursor: 'pointer',
              bgcolor: eventType === key ? val.color : 'transparent',
              color: eventType === key ? '#fff' : 'text.primary',
              '& .MuiChip-icon': { color: eventType === key ? '#fff' : val.color },
            }}
            onClick={() => handleTypeChange(key)}
          />
        ))}
        <Box sx={{ flex: 1 }} />
        <Button size='small' startIcon={<AddIcon />} variant='contained' onClick={handleAdd}
          sx={{ fontSize: 11, textTransform: 'none' }}>
          New {cfg.label}
        </Button>
      </Box>

      {/* Events List */}
      {events.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <TimelineIcon sx={{ fontSize: 48, mb: 1, opacity: 0.4 }} />
          <Typography variant='body2'>No {cfg.label.toLowerCase()} events found</Typography>
          <Typography sx={{ fontSize: 11, mt: 0.5 }}>Click the button above to filter or create events</Typography>
        </Box>
      ) : (
        <Box
        sx={{
          color: 'text.secondary',
          height: '70vh',
          overflowY: 'auto',
          msOverflowStyle: 'none',   
          scrollbarWidth: 'none',    
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          }}>
          {events.map((evt) => (
            <Paper
              key={evt.id}
              elevation={0}
              sx={{
                p: 2, mb: 1, borderRadius: 2,
                border: '1px solid', borderColor: 'divider',
                borderLeft: '3px solid', borderLeftColor: cfg.color,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar src={evt.image} sx={{ width: 36, height: 36, fontSize: 13, bgcolor: cfg.color }}>
                  {(evt.employee_name || '?')[0]}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                    {evt.employee_name} <Typography component='span' sx={{ fontSize: 10, color: 'text.secondary' }}>({evt.employee_code})</Typography>
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                    {evt.designation} &bull; {evt.department_name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                  <Chip label={evt.status} size='small' color={statusColors[evt.status]} sx={{ fontSize: 9, textTransform: 'capitalize' }} />
                  <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                    Effective: {evt.effective_date_formatted}
                  </Typography>
                </Box>
              </Box>

              {/* Event-specific details */}
              {(evt.to_designation || evt.to_ctc || evt.separation_type) && (
                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {evt.to_designation && <Chip label={`To: ${evt.to_designation}`} size='small' variant='outlined' sx={{ fontSize: 9 }} />}
                  {evt.to_ctc && <Chip label={`New CTC: ${Number(evt.to_ctc).toLocaleString()}`} size='small' variant='outlined' sx={{ fontSize: 9 }} />}
                  {evt.increment_percentage && <Chip label={`+${evt.increment_percentage}%`} size='small' color='success' sx={{ fontSize: 9 }} />}
                  {evt.separation_type && <Chip label={evt.separation_type} size='small' color='error' variant='outlined' sx={{ fontSize: 9, textTransform: 'capitalize' }} />}
                  {evt.lwd_formatted && <Chip label={`LWD: ${evt.lwd_formatted}`} size='small' variant='outlined' sx={{ fontSize: 9 }} />}
                </Box>
              )}

              {/* Action buttons */}
              {evt.status !== 'completed' && evt.status !== 'cancelled' && (
                <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  {evt.status === 'draft' && (
                    <Button
                    size='small'
                    variant='outlined'
                    sx={{ fontSize: 10, textTransform: 'none' }}
                    onClick={() => handleSubmitForApproval(evt.id)}>
                      Submit for Approval
                      </Button>
                    )}
                  {evt.status === 'pending' && (
                    <Button size='small' variant='outlined' color='success' sx={{ fontSize: 10, textTransform: 'none' }}
                      onClick={() => handleApprove(evt.id)}>
                      Approve
                    </Button>
                  )}
                  {evt.status === 'approved' && (
                    <Button size='small' variant='contained' color='success' sx={{ fontSize: 10, textTransform: 'none' }}
                      onClick={() => handleComplete(evt.id)}>
                      Mark Completed
                    </Button>
                  )}
                  {(evt.status === 'draft' || evt.status === 'pending') && (
                    <Button size='small' variant='outlined' color='error' sx={{ fontSize: 10, textTransform: 'none' }}
                      onClick={() => handleCancel(evt.id)}>
                      Cancel
                    </Button>
                  )}
                </Box>
              )}
            </Paper>
          ))}
        </Box>
      )}

      {/* Create Event Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600 }}>
          New {cfg.label} Event
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <Autocomplete
              options={employeeOptions}
              getOptionLabel={(o) => `${o.full_name} (${o.employee_code})`}
              isOptionEqualToValue={(option, value) => option.employee_id === value.employee_id}
              size='small'
              onChange={(_, val) => handleFieldChange('employee_id', val?.employee_id || null)}
              renderOption={(props, option) => (
              <li {...props} key={option.employee_id}>
                {option.full_name} ({option.employee_code})
                </li>
                )}
                renderInput={(params) => (
                <TextField {...params} label='Employee' required />
                )}/>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
              <DatePicker
                label='Event Date'
                value={toMomentOrNull(formValues.event_date)}
                onChange={(v) => handleFieldChange('event_date', v)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
              </LocalizationProvider>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
              <DatePicker
                label='Effective Date'
                value={toMomentOrNull(formValues.effective_date)}
                onChange={(v) => handleFieldChange('effective_date', v)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
              </LocalizationProvider>
            </Grid>

            {eventType === 'onboarding' && (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <LocalizationProvider dateAdapter={DateAdapter}>
                    <DatePicker
                      label='Date of Joining'
                      value={toMomentOrNull(formValues.date_of_joining)}
                      onChange={(v) => handleFieldChange('date_of_joining', v)}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <LocalizationProvider dateAdapter={DateAdapter}>
                    <DatePicker
                      label='Date of Training Period'
                      value={toMomentOrNull(formValues.date_of_training)}
                      onChange={(v) => handleFieldChange('date_of_training', v)}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    name='probationary_months'
                    label='Probationary Period (months)'
                    size='small'
                    fullWidth
                    type='number'
                    value={formValues.probationary_months || 0}
                    onChange={(e) => handleFieldChange('probationary_months', e.target.value)}
                    inputProps={{ min: 0, max: 24 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    name='date_of_confirmation'
                    label='Date of Confirmation'
                    size='small'
                    fullWidth
                    type='date'
                    value={formValues.date_of_confirmation || ''}
                    disabled
                    InputLabelProps={{ shrink: true }}
                    helperText='Calculated from joining date + probation period'
                  />
                </Grid>
              </>
            )}

            {/* Promotion / Transfer fields */}
            {(eventType === 'promotion' || eventType === 'transfer') && (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField name='from_designation' label='From Designation' size='small' fullWidth
                    value={formValues.from_designation || ''} onChange={(e) => handleFieldChange('from_designation', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField name='to_designation' label='To Designation' size='small' fullWidth
                    value={formValues.to_designation || ''} onChange={(e) => handleFieldChange('to_designation', e.target.value)} />
                </Grid>
              </>
            )}

            {/* Transfer fields */}
            {(eventType === 'transfer') && (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField name='from_department_id' label='From Department' size='small' fullWidth
                    value={formValues.from_department_id || ''} onChange={(e) => handleFieldChange('from_department_id', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField name='to_department_id' label='To Department' size='small' fullWidth
                    value={formValues.to_department_id || ''} onChange={(e) => handleFieldChange('to_department_id', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField name='from_location_id' label='From Location' size='small' fullWidth
                    value={formValues.from_location_id || ''} onChange={(e) => handleFieldChange('from_location_id', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField name='to_location_id' label='To Location' size='small' fullWidth
                    value={formValues.to_location_id || ''} onChange={(e) => handleFieldChange('to_location_id', e.target.value)} />
                </Grid>
                <Grid size={12}>
                  <TextField name='unitOrbranch' label='Unit/Branch' size='small' fullWidth
                    value={formValues.unitOrbranch || ''} onChange={(e) => handleFieldChange('unitOrbranch', e.target.value)} />
                </Grid>
              </>
            )}

            {/* Increment fields */}
            {(eventType === 'increment' || eventType === 'promotion') && (
              <>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField name='from_ctc' label='Current CTC' size='small' fullWidth type='number'
                    value={formValues.from_ctc || ''} onChange={(e) => handleFieldChange('from_ctc', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField name='to_ctc' label='New CTC' size='small' fullWidth type='number'
                    value={formValues.to_ctc || ''} onChange={(e) => handleFieldChange('to_ctc', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField name='increment_percentage' label='Increment %' size='small' fullWidth type='number'
                    value={formValues.increment_percentage || ''} onChange={(e) => handleFieldChange('increment_percentage', e.target.value)} />
                </Grid>
              </>
            )}

            {/* Separation fields */}
            {eventType === 'separation' && (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField select name='separation_type' label='Separation Type' size='small' fullWidth
                    value={formValues.separation_type || ''} onChange={(e) => handleFieldChange('separation_type', e.target.value)}>
                    {['resignation', 'termination', 'retirement', 'absconding', 'contract_end'].map((t) => (
                      <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize' }}>{t.replace('_', ' ')}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <LocalizationProvider dateAdapter={DateAdapter}>
                  <DatePicker
                    label='Last Working Date'
                    value={toMomentOrNull(formValues.last_working_date)}
                    onChange={(v) => handleFieldChange('last_working_date', v)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                  </LocalizationProvider>
                </Grid>
                <Grid size={12}>
                  <TextField name='separation_reason' label='Reason' size='small' fullWidth multiline rows={2}
                    value={formValues.separation_reason || ''} onChange={(e) => handleFieldChange('separation_reason', e.target.value)} />
                </Grid>
              </>
            )}

            <Grid size={12}>
              <TextField name='remarks' label='Remarks' size='small' fullWidth multiline rows={2}
                value={formValues.remarks || ''} onChange={(e) => handleFieldChange('remarks', e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select name='status' label='Status' size='small' fullWidth
                value={formValues.status || 'draft'} onChange={(e) => handleFieldChange('status', e.target.value)}>
                <MenuItem value='draft'>Draft</MenuItem>
                <MenuItem value='pending'>Pending Approval</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color='error'>Cancel</Button>
          <Button onClick={handleSave} variant='contained' disabled={!formValues.employee_id}>
            Create Event
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
