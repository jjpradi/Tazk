import React, { useState, useContext } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box, Grid, Typography, TextField, Button, MenuItem, Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import { updatePersonalInfoAction, getProfileAction } from 'redux/actions/employeeProfile.actions';

const InfoRow = ({ label, value }) => (
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 500, mb: 0.3 }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: 13, fontWeight: 400, minHeight: 20 }}>
      {value || '-'}
    </Typography>
  </Grid>
);

const SectionTitle = ({ title }) => (
  <Grid size={12}>
    <Typography sx={{ fontSize: 14, fontWeight: 600, mt: 2, mb: 1, color: 'primary.main' }}>
      {title}
    </Typography>
    <Divider />
  </Grid>
);

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const MARITAL_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
];

export default function PersonalInfoTab({ profile, employeeId }) {
  const [editMode, setEditMode] = useState(false);
  const [formValues, setFormValues] = useState({});
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  const handleEdit = () => {
    setFormValues({
      blood_group: profile?.blood_group || '',
      marital_status: profile?.marital_status || '',
      nationality: profile?.nationality || '',
      aadhar_number: profile?.aadhar_number || '',
      pan_number: profile?.pan_number || '',
      father_name: profile?.father_name || '',
      spouse_name: profile?.spouse_name || '',
    });
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormValues({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    await apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(updatePersonalInfoAction(
        { ...formValues, employee_id: employeeId },
        setModalTypeHandler,
        setLoaderStatusHandler,
      )),
    );
    dispatch(getProfileAction(employeeId, setModalTypeHandler, setLoaderStatusHandler));
    setEditMode(false);
  };

  if (!profile) return null;

  return (
    <Box>
      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 1 }}>
        {!editMode ? (
          <Button size='small' startIcon={<EditIcon />} onClick={handleEdit} variant='outlined'>
            Edit
          </Button>
        ) : (
          <>
            <Button size='small' startIcon={<CancelIcon />} onClick={handleCancel} color='error'>
              Cancel
            </Button>
            <Button size='small' startIcon={<SaveIcon />} onClick={handleSave} variant='contained'>
              Save
            </Button>
          </>
        )}
      </Box>

      <Grid container spacing={2.5}>
        {/* Basic Info (read-only) */}
        <SectionTitle title='Basic Information' />
        <InfoRow label='Full Name' value={profile.full_name} />
        <InfoRow label='Employee Code' value={profile.employee_code} />
        <InfoRow label='Email' value={profile.email} />
        <InfoRow label='Phone' value={profile.phone_number} />
        <InfoRow label='Date of Birth' value={profile.dob_formatted} />
        <InfoRow label='Gender'   value={profile.gender === 1 ? 'Male' : profile.gender === 2? 'Female' : '-'}/>

        {/* Extended Personal (editable) */}
        <SectionTitle title='Personal Details' />
        {!editMode ? (
          <>
            <InfoRow label='Blood Group' value={profile.blood_group} />
            <InfoRow label='Marital Status' value={profile.marital_status ? profile.marital_status.charAt(0).toUpperCase() + profile.marital_status.slice(1) : '-'} />
            <InfoRow label='Nationality' value={profile.nationality} />
            <InfoRow label='Aadhar Number' value={profile.aadhar_number ? '****' + String(profile.aadhar_number).slice(-4) : '-'} />
            <InfoRow label='PAN Number' value={profile.pan_number} />
            <InfoRow label="Father's Name" value={profile.father_name} />
            <InfoRow label="Spouse's Name" value={profile.spouse_name} />
          </>
        ) : (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                select name='blood_group' label='Blood Group' size='small' fullWidth
                value={formValues.blood_group} onChange={handleChange}
              >
                <MenuItem value=''>None</MenuItem>
                {BLOOD_GROUPS.map((bg) => <MenuItem key={bg} value={bg}>{bg}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                select name='marital_status' label='Marital Status' size='small' fullWidth
                value={formValues.marital_status} onChange={handleChange}
              >
                <MenuItem value=''>None</MenuItem>
                {MARITAL_OPTIONS.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField name='nationality' label='Nationality' size='small' fullWidth
                value={formValues.nationality} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField name='aadhar_number' label='Aadhar Number' size='small' fullWidth
                value={formValues.aadhar_number} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField name='pan_number' label='PAN Number' size='small' fullWidth
                value={formValues.pan_number} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField name='father_name' label="Father's Name" size='small' fullWidth
                value={formValues.father_name} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField name='spouse_name' label="Spouse's Name" size='small' fullWidth
                value={formValues.spouse_name} onChange={handleChange} />
            </Grid>
          </>
        )}

        {/* Address (read-only, managed via user creation) */}
        <SectionTitle title='Address' />
        <InfoRow label='Address' value={profile.address} />
        <InfoRow label='Area' value={profile.area} />
        <InfoRow label='City' value={profile.city} />
        <InfoRow label='State' value={profile.state} />
        <InfoRow label='Country' value={profile.country} />
        <InfoRow label='PIN Code' value={profile.zip} />
      </Grid>
    </Box>
  );
}
