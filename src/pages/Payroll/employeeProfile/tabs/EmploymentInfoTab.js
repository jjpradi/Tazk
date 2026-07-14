import React, { useState, useContext } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box, Grid, Typography, TextField, Button, MenuItem, Divider,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment as DateAdapter } from '@mui/x-date-pickers/AdapterMoment';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import moment from 'moment';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import { updateEmployeeProfileAction, getProfileAction } from 'redux/actions/employeeProfile.actions';

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

const EMPLOYMENT_TYPES = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'contract', label: 'Contract' },
  { value: 'probation', label: 'Probation' },
  { value: 'intern', label: 'Intern' },
  { value: 'consultant', label: 'Consultant' },
];

export default function EmploymentInfoTab({ profile, employeeId, grades }) {
  const [editMode, setEditMode] = useState(false);
  const [formValues, setFormValues] = useState({});
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  const handleEdit = () => {
    setFormValues({
      grade_id: profile?.grade_id || '',
      probation_end_date: profile?.probation_end_date || null,
      confirmation_date: profile?.confirmation_date || null,
      notice_period_days: profile?.notice_period_days || 30,
      employment_type: profile?.employment_type || 'permanent',
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
    const payload = {
      ...formValues,
      employee_id: employeeId,
      probation_end_date: formValues.probation_end_date ? moment(formValues.probation_end_date).format('YYYY-MM-DD') : null,
      confirmation_date: formValues.confirmation_date ? moment(formValues.confirmation_date).format('YYYY-MM-DD') : null,
    };
    await apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(updateEmployeeProfileAction(payload, setModalTypeHandler, setLoaderStatusHandler)),
    );
    dispatch(getProfileAction(employeeId, setModalTypeHandler, setLoaderStatusHandler));
    setEditMode(false);
  };

  if (!profile) return null;

  return (
    <Box>
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
        <SectionTitle title='Employment Details' />
        <InfoRow label='Date of Joining' value={profile.doj_formatted} />
        <InfoRow label='Designation' value={profile.designation} />
        <InfoRow label='Department' value={profile.department_name} />
        <InfoRow label='Reporting Manager' value={profile.reporting_manager_name} />
        <InfoRow label='Category' value={profile.category_name} />
        <InfoRow label='Username' value={profile.username} />

        <SectionTitle title='Grade & Probation' />
        {!editMode ? (
          <>
            <InfoRow label='Grade' value={profile.grade_name ? `${profile.grade_code} - ${profile.grade_name}` : '-'} />
            <InfoRow label='Employment Type' value={profile.employment_type ? profile.employment_type.charAt(0).toUpperCase() + profile.employment_type.slice(1) : '-'} />
            <InfoRow label='Probation End Date' value={profile.probation_end_formatted} />
            <InfoRow label='Confirmation Date' value={profile.confirmation_formatted} />
            <InfoRow label='Notice Period (Days)' value={profile.notice_period_days} />
          </>
        ) : (
          <LocalizationProvider dateAdapter={DateAdapter}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                select name='grade_id' label='Grade' size='small' fullWidth
                value={formValues.grade_id} onChange={handleChange}
              >
                <MenuItem value=''>None</MenuItem>
                {(grades || []).map((g) => (
                  <MenuItem key={g.id} value={g.id}>{g.grade_code} - {g.grade_name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                select name='employment_type' label='Employment Type' size='small' fullWidth
                value={formValues.employment_type} onChange={handleChange}
              >
                {EMPLOYMENT_TYPES.map((et) => (
                  <MenuItem key={et.value} value={et.value}>{et.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DatePicker
                label='Probation End Date'
                value={formValues.probation_end_date ? moment(formValues.probation_end_date) : null}
                onChange={(date) => setFormValues((prev) => ({ ...prev, probation_end_date: date }))}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DatePicker
                label='Confirmation Date'
                value={formValues.confirmation_date ? moment(formValues.confirmation_date) : null}
                onChange={(date) => setFormValues((prev) => ({ ...prev, confirmation_date: date }))}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                name='notice_period_days' label='Notice Period (Days)' size='small' fullWidth type='number'
                value={formValues.notice_period_days} onChange={handleChange}
              />
            </Grid>
          </LocalizationProvider>
        )}

        {/* Relieving Info (read-only) */}
        {profile.releiving_date && (
          <>
            <SectionTitle title='Separation' />
            <InfoRow label='Relieving Date' value={profile.releiving_date} />
          </>
        )}
      </Grid>
    </Box>
  );
}
