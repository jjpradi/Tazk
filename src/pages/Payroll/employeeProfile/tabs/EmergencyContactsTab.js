import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Button, TextField, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Typography, Chip, Grid, Card, CardContent, Switch,
  FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import StarIcon from '@mui/icons-material/Star';
import PhoneIcon from '@mui/icons-material/Phone';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import {
  createEmergencyContactAction,
  updateEmergencyContactAction,
  deleteEmergencyContactAction,
} from 'redux/actions/employeeProfile.actions';

const RELATIONSHIPS = ['Spouse', 'Parent', 'Father', 'Mother', 'Sibling', 'Brother', 'Sister', 'Child', 'Friend', 'Relative', 'Guardian', 'Other'];

const initialForm = {
  contact_name: '',
  relationship: '',
  phone_primary: '',
  phone_secondary: '',
  email: '',
  address: '',
  is_primary: false,
};

export default function EmergencyContactsTab({ employeeId }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState('add');
  const [formValues, setFormValues] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const dispatch = useDispatch();
  const { EmployeeProfileReducer: { emergencyContacts } } = useSelector((state) => state);
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
      contact_name: item.contact_name || '',
      relationship: item.relationship || '',
      phone_primary: item.phone_primary || '',
      phone_secondary: item.phone_secondary || '',
      email: item.email || '',
      address: item.address || '',
      is_primary: !!item.is_primary,
    });
    setEditId(item.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    await apiCalls(
      setModalTypeHandler, setLoaderStatusHandler,
      dispatch(deleteEmergencyContactAction(id, employeeId, setModalTypeHandler, setLoaderStatusHandler)),
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const payload = { ...formValues, employee_id: employeeId };

    if (mode === 'edit') {
      payload.id = editId;
      await apiCalls(
        setModalTypeHandler, setLoaderStatusHandler,
        dispatch(updateEmergencyContactAction(payload, employeeId, setModalTypeHandler, setLoaderStatusHandler)),
      );
    } else {
      await apiCalls(
        setModalTypeHandler, setLoaderStatusHandler,
        dispatch(createEmergencyContactAction(payload, employeeId, setModalTypeHandler, setLoaderStatusHandler)),
      );
    }
    setDialogOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button size='small' startIcon={<AddIcon />} onClick={handleAdd} variant='contained'>
          Add Contact
        </Button>
      </Box>

      {(!emergencyContacts || emergencyContacts.length === 0) && (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <ContactPhoneIcon sx={{ fontSize: 40, mb: 1, opacity: 0.4 }} />
          <Typography variant='body2'>No emergency contacts added yet</Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        {(emergencyContacts || []).map((item) => (
          <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card variant='outlined' sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ pb: '12px !important' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {item.is_primary ? (
                      <Chip icon={<StarIcon />} label='Primary' size='small' color='warning' sx={{ fontSize: 10 }} />
                    ) : (
                      <Chip label={item.relationship} size='small' variant='outlined' sx={{ fontSize: 10 }} />
                    )}
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
                <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.3 }}>
                  {item.contact_name}
                </Typography>
                {item.is_primary && item.relationship && (
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {item.relationship}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                  <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography sx={{ fontSize: 12 }}>{item.phone_primary}</Typography>
                </Box>
                {item.phone_secondary && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{item.phone_secondary}</Typography>
                  </Box>
                )}
                {item.email && (
                  <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5 }}>
                    {item.email}
                  </Typography>
                )}
                {item.address && (
                  <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5 }}>
                    {item.address}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600 }}>
          {mode === 'edit' ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name='contact_name' label='Contact Name' size='small' fullWidth required
                value={formValues.contact_name} onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select name='relationship' label='Relationship' size='small' fullWidth required
                value={formValues.relationship} onChange={handleChange}
              >
                {RELATIONSHIPS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name='phone_primary' label='Primary Phone' size='small' fullWidth required
                value={formValues.phone_primary} onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name='phone_secondary' label='Secondary Phone' size='small' fullWidth
                value={formValues.phone_secondary} onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name='email' label='Email' size='small' fullWidth
                value={formValues.email} onChange={handleChange}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                name='address' label='Address' size='small' fullWidth multiline rows={2}
                value={formValues.address} onChange={handleChange}
              />
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formValues.is_primary}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, is_primary: e.target.checked }))}
                    size='small'
                  />
                }
                label='Set as primary emergency contact'
                slotProps={{ typography: { fontSize: 13 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color='error'>Cancel</Button>
          <Button onClick={handleSave} variant='contained' disabled={!formValues.contact_name || !formValues.phone_primary}>
            {mode === 'edit' ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
