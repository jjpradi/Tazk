import React, {useState, useEffect, useMemo} from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  TextField,
  Button,
  MenuItem,
  Typography,
  Box,
  Divider,
  IconButton,
  Autocomplete,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {capitalize} from 'lodash';
import {useDispatch, useSelector} from 'react-redux';
import CommonUserAutoCompleteForSingleUser from 'utils/commonAutoCompleteForSingleUser';
import {createEpicAction} from 'redux/actions/payrollDashboard_actions';
import {listUserCreationAction} from 'redux/actions/userCreation_actions';
import PayrollDashboardServices from 'services/payrollDashboard_services';

import {
  getEmpbasecompanyAction,
  get_search_company_based_employee,
  set_search_company_based_employee,
} from 'redux/actions/attendance_actions';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />;
});

const taskStatusVal = [
  {id: 1, value: 'TO DO'},
  {id: 2, value: 'IN PROGRESS'},
  {id: 3, value: 'COMPLETED'},
];

const toStatusKey = (statusLabel) =>
  String(statusLabel || '')
    .toLowerCase()
    .replace(/\s+/g, '');

const initialState = {
  project_id: '',
  name: '',
  epic_key: '',
  description: '',
  status: null,
  reporter: '',
  assignee: '',
  goal: '',
};

const EpicCreation = ({open, onClose, initialData, projectId, onSaved}) => {
  const dispatch = useDispatch();

  const {
    PayrolldashboardReducers: {get_projects},
    attendanceReducer: {get_empbasecompany, searchCompanyBasedEmployeeFilter},
    UserCreationReducer: {createUser},
  } = useSelector((state) => state);

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [reporterValue, setReporterValue] = useState(null);
  const [assigneeValue, setAssigneeValue] = useState(null);
  const [searchValAssigneeFilter, setSearchValAssigneeFilter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const adminEmployees = useMemo(
    () =>
      (createUser || []).filter((emp) =>
        ['Administrator', 'Admin'].includes(emp?.role_name),
      ),
    [createUser],
  );

  const epicId =
    initialData?.epic_id ?? initialData?.id ?? initialData?.epicId ?? null;
  const isEdit = Boolean(epicId);

  useEffect(() => {
    if (open) {
      if (!get_empbasecompany.length) dispatch(getEmpbasecompanyAction());
      if (!createUser.length) dispatch(listUserCreationAction());
    }
  }, [dispatch, get_empbasecompany.length, createUser.length, open]);

  const requestSearchAssigneeFilter = (val) => {
    const trimmed = typeof val === 'string' ? val.trimStart() : '';

    setSearchValAssigneeFilter(trimmed);
    dispatch(set_search_company_based_employee([]));

    if (!trimmed) return;

    dispatch(get_search_company_based_employee({searchString: trimmed}));
  };

  const handleReporterSelect = (value) => {
    const normalizedValue = Array.isArray(value) ? null : value;

    setReporterValue(normalizedValue);

    setFormData((prev) => ({
      ...prev,
      reporter: normalizedValue?.employee_id || '',
    }));
  };

  const handleAssigneeSelect = (value) => {
    const normalizedValue = Array.isArray(value) ? null : value;

    setAssigneeValue(normalizedValue);

    setFormData((prev) => ({
      ...prev,
      assignee: normalizedValue?.employee_id || '',
    }));
  };

  const resolveStatusId = (statusValue) => {
    if (statusValue === null || statusValue === undefined || statusValue === '') {
      return null;
    }
    if (Number.isFinite(Number(statusValue))) {
      return Number(statusValue);
    }
    const key = toStatusKey(statusValue);
    return taskStatusVal.find((status) => toStatusKey(status.value) === key)?.id ?? null;
  };

  const findEmployeeById = (list, id) => {
    if (!id) return null;
    return (list || []).find(
      (emp) => String(emp?.employee_id) === String(id),
    );
  };

  useEffect(() => {
    if (!open) return;
    if (!initialData && !projectId) {
      setFormData(initialState);
      return;
    }

    const epicProjectId =
      initialData?.project_id ?? initialData?.projectId ?? projectId ?? '';
    const nextForm = {
      project_id: epicProjectId,
      name:
        initialData?.epic_name ??
        initialData?.epic_title ??
        initialData?.name ??
        initialData?.title ??
        '',
      epic_key: initialData?.epic_key ?? initialData?.key ?? '',
      description: initialData?.description ?? '',
      status: resolveStatusId(
        initialData?.status_name ?? initialData?.status ?? initialData?.STATUS,
      ),
      reporter: initialData?.reporter ?? '',
      assignee: initialData?.assignee ?? initialData?.assigned_staff ?? '',
      goal: initialData?.goal ?? initialData?.objective ?? '',
    };

    setFormData((prev) => ({
      ...prev,
      ...nextForm,
    }));
  }, [open, initialData, projectId]);

  useEffect(() => {
    if (!open) return;
    const reporterId =
      formData?.reporter ?? initialData?.reporter ?? initialData?.reporter_id;
    const assigneeId =
      formData?.assignee ?? initialData?.assignee ?? initialData?.assignee_id;

    const reporterMatch = findEmployeeById(createUser, reporterId);
    const assigneeMatch = findEmployeeById(get_empbasecompany, assigneeId);

    if (reporterMatch) {
      setReporterValue(reporterMatch);
    }
    if (assigneeMatch) {
      setAssigneeValue(assigneeMatch);
    }
  }, [open, formData?.reporter, formData?.assignee, initialData, createUser, get_empbasecompany]);

  const handleChange = (e) => {
    const {name, value} = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (e) => {
    const {value} = e.target;

    setFormData((prev) => ({
      ...prev,
      status:
        taskStatusVal.find((status) => toStatusKey(status.value) === value)
          ?.id ?? null,
    }));
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.project_id) newErrors.project_id = 'Project is required';
    if (!formData.name) newErrors.name = 'Epic name is required';
    if (!formData.status) newErrors.status = 'Status is required';

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
  if (!validateForm()) return;
  setSubmitting(true);
  setSubmitError('');
  try {
    if (isEdit && epicId) {
      const res = await PayrollDashboardServices.updateEpicData(epicId, formData);
      if (res?.status !== 200) {
        throw new Error(res?.data?.message || 'Failed to update epic');
      }
    } else {
      await dispatch(createEpicAction(formData));
    }
    if (onSaved) onSaved(formData);
    onClose();
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.message ||
      (isEdit ? 'Failed to update epic. Please try again.' : 'Failed to create epic. Please try again.');
    setSubmitError(message);
  } finally {
    setSubmitting(false);
  }
};


  useEffect(() => {
    if (!open) {
      setFormData(initialState);
      setErrors({});
      setReporterValue(null);
      setAssigneeValue(null);
      setSearchValAssigneeFilter('');
      setSubmitError('');    
      setSubmitting(false);
      dispatch(set_search_company_based_employee([]));
    }
  }, [dispatch, open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth='md'
      TransitionComponent={Transition}
      PaperProps={{sx: {borderRadius: 2}}}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant='h6' sx={{fontWeight: 600}}>
          {isEdit ? 'Edit Epic' : 'Create Epic'}
        </Typography>

        <IconButton onClick={onClose} size='small'>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent dividers sx={{p: 3}}>
        <Typography variant='caption' sx={{mb: 2, display: 'block'}}>
          Fields marked with <span style={{color: 'red'}}>*</span> are required
        </Typography>

        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
          {/* Project */}
          <TextField
            select
            label='Project'
            name='project_id'
            value={formData.project_id}
            onChange={handleChange}
            required
            size='small'
            error={!!errors.project_id}
            helperText={errors.project_id}
            disabled={isEdit}
          >
            {get_projects?.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.project_name}
              </MenuItem>
            ))}
          </TextField>

          <Divider />

          <Divider />
          
          <TextField
          label='Epic Name'
          name='name'
          value={formData.name}
          onChange={handleChange}
          size='small'
          required
          error={!!errors.name}
          helperText={errors.name}
          />

          {/* Epic Key + Goal */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexDirection: {xs: 'column', md: 'row'},
            }}
          >
            {/* <TextField
              label='Epic Key'
              name='epic_key'
              value={formData.epic_key}
              onChange={handleChange}
              size='small'
              fullWidth
            /> */}

            <TextField
              label='Goal'
              name='goal'
              value={formData.goal}
              onChange={handleChange}
              size='small'
              fullWidth
            />
          </Box>
          {/* Meta Fields */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {xs: '1fr', md: '1fr 1fr 1fr'},
              gap: 2,
            }}
          >
            {/* Status */}
            <TextField
              select
              label='Status'
              name='status'
              value={
                formData.status === 1
                  ? 'todo'
                  : formData.status === 2
                  ? 'inprogress'
                  : formData.status === 3
                  ? 'completed'
                  : ''
              }
              onChange={handleStatusChange}
              size='small'
              error={!!errors.status}
              helperText={errors.status}
            >
              {taskStatusVal.map((status) => (
                <MenuItem key={status.id} value={toStatusKey(status.value)}>
                  {status.value}
                </MenuItem>
              ))}
            </TextField>

            {/* Reporter */}
            <Autocomplete
              options={adminEmployees}
              getOptionLabel={(option) =>
                `${capitalize(option.first_name || '')} ${capitalize(option.last_name || '')}${option.employee_code ? ' - ' + option.employee_code : ''}`.trim()
              }
              ListboxProps={{style: {maxHeight: '170px'}}}
              value={reporterValue}
              onChange={(_, newValue) => handleReporterSelect(newValue ?? null)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Reporter'
                  placeholder='Select Admin'
                  size='small'
                />
              )}
            />

            {/* Assignee */}
            <CommonUserAutoCompleteForSingleUser
              searchVal={searchValAssigneeFilter}
              setSearchValEmployeeFilter={(value) =>
                setSearchValAssigneeFilter((value || '').trimStart())
              }
              requestSearch={requestSearchAssigneeFilter}
              value={assigneeValue}
              setValue={handleAssigneeSelect}
              type={get_empbasecompany || []}
              searchType={searchCompanyBasedEmployeeFilter}
              labelName='Assignee'
            />
          </Box>

          {/* Description */}
          <TextField
            label='Description'
            name='description'
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            fullWidth
          />
        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions sx={{p: 2}}>
        <Button onClick={onClose}>Cancel</Button>

       <Button
       variant='contained'
       onClick={handleSubmit}
      disabled={!formData.name || !formData.project_id}>
        {isEdit ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EpicCreation;
