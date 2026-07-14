import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Typography, Grid, Card, CardContent,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment as DateAdapter } from '@mui/x-date-pickers/AdapterMoment';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import BusinessIcon from '@mui/icons-material/Business';
import moment from 'moment';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import {
  createWorkHistoryAction,
  updateWorkHistoryAction,
  deleteWorkHistoryAction,
} from 'redux/actions/employeeProfile.actions';

const initialForm = {
  company_name: '',
  designation: '',
  department: '',
  from_date: null,
  to_date: null,
  last_ctc: '',
  reason_for_leaving: '',
  reference_name: '',
  reference_phone: '',
};

export default function WorkHistoryTab({ employeeId }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState('add');
  const [formValues, setFormValues] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const dispatch = useDispatch();
  const { EmployeeProfileReducer: { workHistory } } = useSelector((state) => state);
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  const handleAdd = () => {
    setMode('add');
    setFormValues(initialForm);
    setEditId(null);
    setDialogOpen(true);
  };

  const handleEdit = (item) => {
    setMode('edit');
    setFormValues({
      company_name: item.company_name || '',
      designation: item.designation || '',
      department: item.department || '',
      from_date: item.from_date || null,
      to_date: item.to_date || null,
      last_ctc: item.last_ctc || '',
      reason_for_leaving: item.reason_for_leaving || '',
      reference_name: item.reference_name || '',
      reference_phone: item.reference_phone || '',
    });
    setEditId(item.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    await apiCalls(
      setModalTypeHandler, setLoaderStatusHandler,
      dispatch(deleteWorkHistoryAction(id, employeeId, setModalTypeHandler, setLoaderStatusHandler)),
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const payload = {
      ...formValues,
      employee_id: employeeId,
      from_date: formValues.from_date ? moment(formValues.from_date).format('YYYY-MM-DD') : null,
      to_date: formValues.to_date ? moment(formValues.to_date).format('YYYY-MM-DD') : null,
      last_ctc: formValues.last_ctc || null,
    };

    if (mode === 'edit') {
      payload.id = editId;
      await apiCalls(
        setModalTypeHandler, setLoaderStatusHandler,
        dispatch(updateWorkHistoryAction(payload, employeeId, setModalTypeHandler, setLoaderStatusHandler)),
      );
    } else {
      await apiCalls(
        setModalTypeHandler, setLoaderStatusHandler,
        dispatch(createWorkHistoryAction(payload, employeeId, setModalTypeHandler, setLoaderStatusHandler)),
      );
    }
    setDialogOpen(false);
  };

  const formatDuration = (from, to) => {
    if (!from) return '';
    const start = moment(from);
    const end = to ? moment(to) : moment();
    const years = end.diff(start, 'years');
    const months = end.diff(start, 'months') % 12;
    const parts = [];
    if (years > 0) parts.push(`${years}y`);
    if (months > 0) parts.push(`${months}m`);
    return parts.join(' ') || '< 1m';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button size='small' startIcon={<AddIcon />} onClick={handleAdd} variant='contained'>
          Add Work History
        </Button>
      </Box>

      {(!workHistory || workHistory.length === 0) && (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <WorkHistoryIcon sx={{ fontSize: 40, mb: 1, opacity: 0.4 }} />
          <Typography variant='body2'>No work history added yet</Typography>
        </Box>
      )}

      {/* Timeline-style cards */}
      <Box sx={{ position: 'relative' }}>
        {(workHistory || []).map((item, idx) => (
          <Box key={item.id} sx={{ display: 'flex', gap: 2, mb: 2 }}>
            {/* Timeline line */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 36 }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: '50%', bgcolor: 'primary.main',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BusinessIcon sx={{ fontSize: 18, color: 'white' }} />
              </Box>
              {idx < (workHistory || []).length - 1 && (
                <Box sx={{ width: 2, flex: 1, bgcolor: 'divider', mt: 0.5 }} />
              )}
            </Box>
            {/* Card */}
            <Card variant='outlined' sx={{ borderRadius: 2, flex: 1 }}>
              <CardContent sx={{ pb: '12px !important' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                      {item.company_name}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                      {item.designation}{item.department ? ` | ${item.department}` : ''}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton size='small' onClick={() => handleEdit(item)}>
                      <EditIcon fontSize='small' />
                    </IconButton>
                    <IconButton size='small' onClick={() => handleDelete(item.id)} color='error'>
                      <DeleteIcon fontSize='small' />
                    </IconButton>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                    {item.from_date ? moment(item.from_date).format('MMM YYYY') : ''}
                    {item.from_date && item.to_date ? ' - ' : ''}
                    {item.to_date ? moment(item.to_date).format('MMM YYYY') : ''}
                    {item.from_date && ` (${formatDuration(item.from_date, item.to_date)})`}
                  </Typography>
                  {item.last_ctc && (
                    <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                      Last CTC: {Number(item.last_ctc).toLocaleString('en-IN')}
                    </Typography>
                  )}
                </Box>
                {item.reason_for_leaving && (
                  <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5 }}>
                    Reason: {item.reason_for_leaving}
                  </Typography>
                )}
                {item.reference_name && (
                  <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.3 }}>
                    Reference: {item.reference_name}{item.reference_phone ? ` (${item.reference_phone})` : ''}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600 }}>
          {mode === 'edit' ? 'Edit Work History' : 'Add Work History'}
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={DateAdapter}>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  name='company_name' label='Company Name' size='small' fullWidth required
                  value={formValues.company_name} onChange={handleChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name='designation' label='Designation' size='small' fullWidth
                  value={formValues.designation} onChange={handleChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name='department' label='Department' size='small' fullWidth
                  value={formValues.department} onChange={handleChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label='From Date'
                  value={formValues.from_date ? moment(formValues.from_date) : null}
                  onChange={(date) => setFormValues((prev) => ({ ...prev, from_date: date }))}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label='To Date'
                  value={formValues.to_date ? moment(formValues.to_date) : null}
                  onChange={(date) => setFormValues((prev) => ({ ...prev, to_date: date }))}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name='last_ctc' label='Last CTC (Annual)' size='small' fullWidth type='number'
                  value={formValues.last_ctc} onChange={handleChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name='reason_for_leaving' label='Reason for Leaving' size='small' fullWidth
                  value={formValues.reason_for_leaving} onChange={handleChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name='reference_name' label='Reference Name' size='small' fullWidth
                  value={formValues.reference_name} onChange={handleChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name='reference_phone' label='Reference Phone' size='small' fullWidth
                  value={formValues.reference_phone} onChange={handleChange}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color='error'>Cancel</Button>
          <Button onClick={handleSave} variant='contained' disabled={!formValues.company_name}>
            {mode === 'edit' ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
