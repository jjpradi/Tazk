import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Button, TextField, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Typography, Chip, Grid, Card, CardContent,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment as DateAdapter } from '@mui/x-date-pickers/AdapterMoment';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TranslateIcon from '@mui/icons-material/Translate';
import moment from 'moment';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import {
  createQualificationAction,
  updateQualificationAction,
  deleteQualificationAction,
} from 'redux/actions/employeeProfile.actions';

const TYPES = [
  { value: 'education', label: 'Education', icon: <SchoolIcon fontSize='small' />, color: 'primary' },
  { value: 'certification', label: 'Certification', icon: <CardMembershipIcon fontSize='small' />, color: 'success' },
  { value: 'skill', label: 'Skill', icon: <PsychologyIcon fontSize='small' />, color: 'warning' },
  { value: 'language', label: 'Language', icon: <TranslateIcon fontSize='small' />, color: 'info' },
];

const initialForm = {
  qualification_type: 'education',
  title: '',
  institution: '',
  grade: '',
  from_date: null,
  to_date: null,
  remarks: '',
};

export default function QualificationsTab({ employeeId }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState('add');
  const [formValues, setFormValues] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const dispatch = useDispatch();
  const { EmployeeProfileReducer: { qualifications } } = useSelector((state) => state);
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
      qualification_type: item.qualification_type,
      title: item.title || '',
      institution: item.institution || '',
      grade: item.grade || '',
      from_date: item.from_date || null,
      to_date: item.to_date || null,
      remarks: item.remarks || '',
    });
    setEditId(item.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    await apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(deleteQualificationAction(id, employeeId, setModalTypeHandler, setLoaderStatusHandler)),
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
    };

    if (mode === 'edit') {
      payload.id = editId;
      await apiCalls(
        setModalTypeHandler, setLoaderStatusHandler,
        dispatch(updateQualificationAction(payload, employeeId, setModalTypeHandler, setLoaderStatusHandler)),
      );
    } else {
      await apiCalls(
        setModalTypeHandler, setLoaderStatusHandler,
        dispatch(createQualificationAction(payload, employeeId, setModalTypeHandler, setLoaderStatusHandler)),
      );
    }
    setDialogOpen(false);
  };

  const getTypeConfig = (type) => TYPES.find((t) => t.value === type) || TYPES[0];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button size='small' startIcon={<AddIcon />} onClick={handleAdd} variant='contained'>
          Add Qualification
        </Button>
      </Box>

      {(!qualifications || qualifications.length === 0) && (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <SchoolIcon sx={{ fontSize: 40, mb: 1, opacity: 0.4 }} />
          <Typography variant='body2'>No qualifications added yet</Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        {(qualifications || []).map((item) => {
          const typeConf = getTypeConfig(item.qualification_type);
          return (
            <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card variant='outlined' sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent sx={{ pb: '12px !important' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Chip
                      icon={typeConf.icon}
                      label={typeConf.label}
                      size='small'
                      color={typeConf.color}
                      variant='outlined'
                      sx={{ fontSize: 10 }}
                    />
                    <Box>
                      <IconButton size='small' onClick={() => handleEdit(item)}>
                        <EditIcon fontSize='small' />
                      </IconButton>
                      <IconButton size='small' onClick={() => handleDelete(item.id)} color='error'>
                        <DeleteIcon fontSize='small' />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography sx={{ fontWeight: 600, fontSize: 13, mb: 0.3 }}>
                    {item.title}
                  </Typography>
                  {item.institution && (
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                      {item.institution}
                    </Typography>
                  )}
                  {item.grade && (
                    <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                      Grade: {item.grade}
                    </Typography>
                  )}
                  {(item.from_date || item.to_date) && (
                    <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5 }}>
                      {item.from_date ? moment(item.from_date).format('MMM YYYY') : ''}
                      {item.from_date && item.to_date ? ' - ' : ''}
                      {item.to_date ? moment(item.to_date).format('MMM YYYY') : 'Present'}
                    </Typography>
                  )}
                  {item.remarks && (
                    <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5, fontStyle: 'italic' }}>
                      {item.remarks}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600 }}>
          {mode === 'edit' ? 'Edit Qualification' : 'Add Qualification'}
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={DateAdapter}>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select name='qualification_type' label='Type' size='small' fullWidth
                  value={formValues.qualification_type} onChange={handleChange}
                >
                  {TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name='title' label='Title' size='small' fullWidth required
                  value={formValues.title} onChange={handleChange}
                  placeholder='e.g. B.Tech Computer Science'
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name='institution' label='Institution' size='small' fullWidth
                  value={formValues.institution} onChange={handleChange}
                  placeholder='e.g. Anna University'
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name='grade' label='Grade / Score' size='small' fullWidth
                  value={formValues.grade} onChange={handleChange}
                  placeholder='e.g. First Class, 8.5 CGPA'
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label='From Date' views={['year', 'month']}
                  value={formValues.from_date ? moment(formValues.from_date) : null}
                  onChange={(date) => setFormValues((prev) => ({ ...prev, from_date: date }))}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label='To Date' views={['year', 'month']}
                  value={formValues.to_date ? moment(formValues.to_date) : null}
                  onChange={(date) => setFormValues((prev) => ({ ...prev, to_date: date }))}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  name='remarks' label='Remarks' size='small' fullWidth multiline rows={2}
                  value={formValues.remarks} onChange={handleChange}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color='error'>Cancel</Button>
          <Button onClick={handleSave} variant='contained' disabled={!formValues.title}>
            {mode === 'edit' ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
