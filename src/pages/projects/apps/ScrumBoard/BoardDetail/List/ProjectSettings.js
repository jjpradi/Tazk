import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { getsessionStorage } from 'pages/common/login/cookies';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getProjectLanesAction,
  getProjectsAction,
  ProjectSettingsAction,
  projectTypesaction,
} from 'redux/actions/payrollDashboard_actions';
import { userRolePaginationAction } from 'redux/actions/role_actions';
import { listUserCreationAction } from 'redux/actions/userCreation_actions';
import { listEmployeeCategoryAction } from '../../../../../../redux/actions/shifts.actions';

const BoardTypes = [
  { id: 1, type: 'Scrum' },
  { id: 2, type: 'Kanban' },
];

const assigneOptions = [
  { key: 1, assigne: 'Unassigned' },
  { key: 2, assigne: 'Project Lead' },
];

const requiredFields = ['name', 'key'];

const modernFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1.5,
    backgroundColor: '#FFFFFF',
    fontSize: 14,
    '& fieldset': { borderColor: '#E2E8F0' },
    '&:hover fieldset': { borderColor: '#CBD5E1' },
    '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: 1.5 },
  },
  '& .MuiInputLabel-root': { fontSize: 13.5, color: '#64748B' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#2563EB' },
};

const sectionCardSx = {
  border: '1px solid #E2E8F0',
  borderRadius: 2,
  p: 2.25,
  bgcolor: '#FFFFFF',
};

const sectionTitleSx = {
  fontSize: 13.5,
  fontWeight: 600,
  color: '#0F172A',
  mb: 1.25,
};

const ProjectSettings = (props) => {
  const { data, project_id } = props;
  const dispatch = useDispatch();
  const storage = getsessionStorage();

  const {
    stockLocationReducer: { stocklocation },
    PayrolldashboardReducers: { getprojectTypes },
    UserCreationReducer: { createUser },
  } = useSelector((state) => state);

  const [isData, setIsData] = useState([]);

  const currentProject = useMemo(
    () => (data || []).find((p) => Number(p.id) === Number(project_id)) || null,
    [data, project_id],
  );

  const capitalize = (s) =>
    typeof s === 'string' && s.length ? s.charAt(0).toUpperCase() + s.slice(1) : '';

  const adminEmployees = useMemo(
    () =>
      (createUser || [])
        .map((emp) => ({
          ...emp,
          role_name: emp?.role_name?.toLowerCase(),
        }))
        .filter((emp) =>
          ['administrator', 'admin', 'manager'].includes(emp?.role_name),
        ),
    [createUser],
  );

  const [formData, setFormData] = useState({
    name: '',
    key: '',
    url: '',
    projectType: '',
    projectLead: '',
    assigne: 'Unassigned',
    category_id: null,
    board: '',
    location_name: '',
    locationMethod: 'dropdown',
    latitude: '',
    longitude: '',
    location_restriction: 0,
    time_tracking: 0,
    live_location: 0,
    backlog: 1,
    todo: 1,
    inProgress: 1,
    testing: 1,
    completed: 1,
  });

  const [formErrors, setFormErrors] = useState({ name: null, key: null });

  useEffect(() => {
    dispatch(
      listEmployeeCategoryAction({ type: 'LIST_CATEGORY' }, async (response) => {
        const res = await response;
        setIsData(res);
      }),
    );
    dispatch(projectTypesaction({ company_id: storage?.company_id }));
    dispatch(
      userRolePaginationAction({
        company_id: storage?.company_id,
        type: 'SEARCH',
        search: '',
      }),
    );
    if (!createUser?.length) dispatch(listUserCreationAction());
  }, []);

  useEffect(() => {
    if (!currentProject) return;
    const e = currentProject;
    setFormData((prev) => ({
      ...prev,
      name: e.project_name || '',
      key: e.project_key || '',
      url: e.url || '',
      projectType:
        e.project_type !== null && e.project_type !== undefined && e.project_type !== ''
          ? Number(e.project_type)
          : '',
      projectLead: e.project_lead_id || e.user_name || e.project_lead_name || '',
      assigne: e.assigne || 'Unassigned',
      category_id: e.category_id ?? null,
      board: e.board ?? e.boardType ?? '',
      location_name: e.location_id || e.location_name || '',
      locationMethod: e.latitude || e.longitude ? 'coordinates' : 'dropdown',
      latitude: e.latitude || '',
      longitude: e.longitude || '',
      location_restriction: Number(e.location_restriction) || 0,
      time_tracking: Number(e.time_tracking) || 0,
      live_location: Number(e.live_location) || 0,
      backlog: Number(e.backlog ?? 1),
      todo: Number(e.todo ?? 1),
      inProgress: Number(e.inProgress ?? 1),
      testing: Number(e.testing ?? 1),
      completed: Number(e.completed ?? 1),
    }));
  }, [currentProject]);

  const validateField = (name, value) => {
    if (requiredFields.includes(name) && (!value || String(value).trim() === '')) {
      return `${name} is required`;
    }
    return null;
  };

  const setStateHandler = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value ?? '' }));
    setFormErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const normalizedValue = name === 'projectType' ? Number(value) : value;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: normalizedValue,
    }));

    if (name === 'projectType') {
      if (normalizedValue === 1) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          location_restriction: 0,
          live_location: null,
          latitude: null,
          longitude: null,
          location_id: null,
          location_name: null,
        }));
      } else if (normalizedValue === 2) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          live_location: 0,
        }));
      } else if (normalizedValue === 3) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          live_location: 0,
          location_id: null,
          latitude: null,
          longitude: null,
          location_name: null,
        }));
      } else if (normalizedValue === 4) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          latitude: null,
          longitude: null,
          location_id: null,
          location_name: null,
        }));
      }
      if (normalizedValue === 2 || normalizedValue === 3) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          location_restriction: 1,
        }));
      }
    }
  };

  useEffect(() => {
    if (formData.projectType === 4) {
      setFormData({ ...formData, time_tracking: 1, live_location: 1 });
    }
  }, [formData.projectType]);

  const validateAll = () => {
    const errors = {};
    let valid = true;
    requiredFields.forEach((f) => {
      const err = validateField(f, formData[f]);
      if (err) {
        errors[f] = err;
        valid = false;
      }
    });
    setFormErrors(errors);
    return valid;
  };

  const handleSave = async () => {
    if (!validateAll()) return;

    const payload = {
      project_id,
      project_name: formData.name,
      project_key: formData.key,
      url: formData.url,
      project_type: formData.projectType,
      category_id: formData.category_id,
      project_lead_id: formData.projectLead,
      assigne: formData.assigne === 'Unassigned' ? 'Unassigned' : storage.employee_id,
      boardType: formData.board,
      location_id:
        formData.locationMethod === 'dropdown' ? formData.location_name : '',
      latitude: formData.locationMethod === 'coordinates' ? formData.latitude : '',
      longitude: formData.locationMethod === 'coordinates' ? formData.longitude : '',
      location_restriction: formData.location_restriction,
      time_tracking: formData.time_tracking,
      live_location: formData.live_location,
      backlog: formData.backlog,
      todo: formData.todo,
      inProgress: formData.inProgress,
      testing: formData.testing,
      completed: formData.completed,
    };

    await dispatch(ProjectSettingsAction(payload));
    await dispatch(getProjectsAction());
    await dispatch(getProjectLanesAction({ project_id }));
    props.handleClose();
  };

  const showLocationBlock = Number(formData.projectType) === 2;

  const workflowToggles = [
    { key: 'backlog', label: 'Backlog', disabled: false },
    { key: 'todo', label: 'To Do', disabled: true },
    { key: 'inProgress', label: 'In Progress', disabled: false },
    { key: 'testing', label: 'Testing', disabled: false },
    { key: 'completed', label: 'Completed', disabled: true },
  ];

  return (
    <Box sx={{ maxHeight: '80vh', overflowY: 'auto', bgcolor: '#F8FAFC', p: 3, borderRadius: 2 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography
          sx={{
            fontSize: 20,
            fontWeight: 700,
            color: '#0F172A',
            letterSpacing: '-0.01em',
          }}
        >
          Project Settings
        </Typography>
        <Typography sx={{ fontSize: 13, color: '#64748B', mt: 0.5 }}>
          Review and update the configuration applied at creation time.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid
          size={{ xs: 12, md: 3 }}
          display='flex'
          justifyContent='center'
          alignItems='flex-start'
          flexDirection='column'
        >
          <Box
            sx={{
              ...sectionCardSx,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Typography sx={sectionTitleSx}>Project Icon</Typography>
            <Box
              sx={{
                height: 100,
                width: 100,
                border: '1px solid #E2E8F0',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#F8FAFC',
              }}
            >
              <img src='' alt='Update' />
            </Box>
            <Button
              variant='outlined'
              sx={{
                textTransform: 'none',
                borderColor: '#E2E8F0',
                color: '#0F172A',
                borderRadius: 1.5,
                '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
              }}
            >
              Change Icon
            </Button>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          <Box sx={{ ...sectionCardSx, mb: 2 }}>
            <Typography sx={sectionTitleSx}>General</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label='Name'
                  value={formData.name}
                  fullWidth
                  size='small'
                  onChange={(e) => setStateHandler('name', e.target.value)}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  sx={modernFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label='Project Key'
                  value={formData.key}
                  fullWidth
                  size='small'
                  onChange={(e) => setStateHandler('key', e.target.value)}
                  error={!!formErrors.key}
                  helperText={formErrors.key}
                  sx={modernFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  options={getprojectTypes || []}
                  getOptionLabel={(option) => option.project_type || ''}
                  value={
                    (getprojectTypes || []).find(
                      (t) => Number(t.id) === Number(formData.projectType),
                    ) || null
                  }
                  onChange={(event, newValue) =>
                    handleChange({
                      target: {
                        name: 'projectType',
                        value: newValue ? newValue.id : '',
                      },
                    })
                  }
                  isOptionEqualToValue={(option, value) =>
                    Number(option.id) === Number(value.id)
                  }
                  size='small'
                  fullWidth
                  sx={modernFieldSx}
                  renderInput={(params) => (
                    <TextField {...params} label='Project Type' required fullWidth />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  options={BoardTypes}
                  getOptionLabel={(o) => o.type || ''}
                  value={
                    BoardTypes.find(
                      (b) => Number(b.id) === Number(formData.board),
                    ) || null
                  }
                  onChange={(_, newValue) =>
                    setStateHandler('board', newValue ? newValue.id : '')
                  }
                  isOptionEqualToValue={(o, v) => Number(o.id) === Number(v.id)}
                  size='small'
                  sx={modernFieldSx}
                  renderInput={(params) => (
                    <TextField {...params} label='Methodology' fullWidth />
                  )}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label='URL'
                  value={formData.url}
                  fullWidth
                  size='small'
                  onChange={(e) => setStateHandler('url', e.target.value)}
                  sx={modernFieldSx}
                />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ ...sectionCardSx, mb: 2 }}>
            <Typography sx={sectionTitleSx}>Classification & People</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  options={isData}
                  getOptionLabel={(option) => option.category_name || ''}
                  value={
                    isData.find((item) => item.id === formData.category_id) ||
                    null
                  }
                  onChange={(_, newValue) =>
                    setStateHandler('category_id', newValue ? newValue.id : null)
                  }
                  size='small'
                  sx={modernFieldSx}
                  renderInput={(params) => (
                    <TextField {...params} label='Category' fullWidth />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  options={adminEmployees}
                  getOptionLabel={(option) =>
                    `${capitalize(option.first_name || '')} ${capitalize(option.last_name || '')}${option.employee_code ? ' - ' + option.employee_code : ''}`.trim()
                  }
                  value={
                    adminEmployees.find(
                      (u) => String(u.employee_id || '').trim().toLowerCase() === String(formData.projectLead || '').trim().toLowerCase(),
                    ) ||
                    adminEmployees.find(
                      (u) => `${u.first_name || ''} ${u.last_name || ''}`.trim().toLowerCase() === String(formData.projectLead || '').trim().toLowerCase(),
                    ) ||
                    null
                  }
                  onChange={(_, newValue) =>
                    setStateHandler(
                      'projectLead',
                      newValue ? newValue.employee_id : '',
                    )
                  }
                  isOptionEqualToValue={(o, v) =>
                    Number(o.employee_id) === Number(v.employee_id)
                  }
                  size='small'
                  sx={modernFieldSx}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='Project Lead'
                      placeholder='Assign a lead'
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  options={assigneOptions}
                  getOptionLabel={(option) => option.assigne || ''}
                  value={
                    assigneOptions.find(
                      (o) => o.assigne === formData.assigne,
                    ) || null
                  }
                  onChange={(_, newValue) =>
                    setStateHandler('assigne', newValue ? newValue.assigne : '')
                  }
                  size='small'
                  sx={modernFieldSx}
                  renderInput={(params) => (
                    <TextField {...params} label='Default Assignee' fullWidth />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          {showLocationBlock && (
            <Box sx={{ ...sectionCardSx, mb: 2 }}>
              <Typography sx={sectionTitleSx}>Location</Typography>
              <FormControl component='fieldset' fullWidth>
                <FormLabel sx={{ fontSize: 12, color: '#64748B', mb: 0.5 }}>
                  Input method
                </FormLabel>
                <RadioGroup
                  row
                  value={formData.locationMethod}
                  onChange={(e) =>
                    setStateHandler('locationMethod', e.target.value)
                  }
                >
                  <FormControlLabel
                    value='dropdown'
                    control={<Radio size='small' />}
                    label={
                      <Typography sx={{ fontSize: 13 }}>Select Location</Typography>
                    }
                  />
                  <FormControlLabel
                    value='coordinates'
                    control={<Radio size='small' />}
                    label={
                      <Typography sx={{ fontSize: 13 }}>
                        Latitude / Longitude
                      </Typography>
                    }
                  />
                </RadioGroup>
                {formData.locationMethod === 'dropdown' ? (
                  <Autocomplete
                    options={stocklocation || []}
                    getOptionLabel={(o) => o.location_name || ''}
                    value={
                      (stocklocation || []).find(
                        (l) =>
                          Number(l.location_id) ===
                          Number(formData.location_name),
                      ) || null
                    }
                    onChange={(_, newValue) =>
                      setStateHandler(
                        'location_name',
                        newValue ? newValue.location_id : '',
                      )
                    }
                    isOptionEqualToValue={(o, v) =>
                      Number(o.location_id) === Number(v.location_id)
                    }
                    size='small'
                    sx={{ ...modernFieldSx, mt: 1 }}
                    renderInput={(params) => (
                      <TextField {...params} label='Project Location' fullWidth />
                    )}
                  />
                ) : (
                  <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid size={6}>
                      <TextField
                        label='Latitude'
                        type='number'
                        fullWidth
                        size='small'
                        value={formData.latitude}
                        onChange={(e) =>
                          setStateHandler('latitude', e.target.value)
                        }
                        sx={modernFieldSx}
                      />
                    </Grid>
                    <Grid size={6}>
                      <TextField
                        label='Longitude'
                        type='number'
                        fullWidth
                        size='small'
                        value={formData.longitude}
                        onChange={(e) =>
                          setStateHandler('longitude', e.target.value)
                        }
                        sx={modernFieldSx}
                      />
                    </Grid>
                  </Grid>
                )}
              </FormControl>
            </Box>
          )}

          <Box sx={{ ...sectionCardSx, mb: 2 }}>
            <Typography sx={sectionTitleSx}>Policies</Typography>
            <Typography sx={{ fontSize: 12, color: '#64748B', mb: 1.5 }}>
              Control how tracking and location rules apply to this project.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {formData.projectType !== 1 && formData.projectType !== 4 && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={
                        formData.projectType === 2 ||
                        formData.projectType === 3 ||
                        formData.location_restriction === 1
                      }
                      disabled={
                        formData.projectType === 2 ||
                        formData.projectType === 3
                      }
                      onChange={(e) =>
                        setStateHandler(
                          'location_restriction',
                          e.target.checked ? 1 : 0,
                        )
                      }
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: 13.5, color: '#0F172A' }}>
                      Location Restriction
                    </Typography>
                  }
                />
              )}
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.time_tracking === 1}
                    disabled={formData.projectType === 4}
                    onChange={(e) =>
                      setStateHandler('time_tracking', e.target.checked ? 1 : 0)
                    }
                  />
                }
                label={
                  <Typography sx={{ fontSize: 13.5, color: '#0F172A' }}>
                    Time Tracking
                  </Typography>
                }
              />
              {formData.projectType === 4 && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!formData.live_location}
                      disabled={formData.projectType === 4}
                      onChange={(e) =>
                        setStateHandler(
                          'live_location',
                          e.target.checked ? 1 : 0,
                        )
                      }
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: 13.5, color: '#0F172A' }}>
                      Live Location
                    </Typography>
                  }
                />
              )}
            </Box>
          </Box>

          <Box sx={{ ...sectionCardSx, mb: 2 }}>
            <Typography sx={sectionTitleSx}>Workflow Segments</Typography>
            <Typography sx={{ fontSize: 12, color: '#64748B', mb: 1.5 }}>
              Default states enabled for issues in this project.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5 }}>
              {workflowToggles.map((seg) => (
                <FormControlLabel
                  key={seg.key}
                  control={
                    <Switch
                      checked={Number(formData[seg.key]) === 1}
                      disabled={seg.disabled}
                      onChange={(e) =>
                        setStateHandler(seg.key, e.target.checked ? 1 : 0)
                      }
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: 13.5, color: '#0F172A' }}>
                      {seg.label}
                    </Typography>
                  }
                />
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1.5,
              mt: 1,
            }}
          >
            <Button
              variant='outlined'
              onClick={props.handleClose}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                borderColor: '#E2E8F0',
                color: '#64748B',
                borderRadius: 1.5,
                '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant='contained'
              disableElevation
              sx={{
                bgcolor: '#2563EB',
                textTransform: 'none',
                fontWeight: 600,
                px: 2.5,
                borderRadius: 1.5,
                '&:hover': { bgcolor: '#1D4ED8' },
              }}
            >
              Save Changes
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectSettings;
