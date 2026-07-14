import { Card } from '@mui/material'

import {
  Autocomplete,
  Button,
  Container,
  Grid,
  Switch,
  TextField,
  Typography,
  FormControlLabel,
  FormControl,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import {useContext, useEffect, useState} from 'react';
import {capitalize} from 'lodash';
import moment from 'moment';
import {useDispatch, useSelector} from 'react-redux';
import {
  createLeadTaskAction,
  getLeadstaskCreationAction,
  listLeadsAccountsAction,
} from 'redux/actions/leads_task_actions';
import {
  get_search_company_based_employee,
  getEmpbasecompanyFilterAction,
  getEmpbasecompanyAction,
  set_search_company_based_employee,
} from 'redux/actions/attendance_actions';
import CommonUserAutoCompleteForSingleUser from 'utils/commonAutoCompleteForSingleUser';
import context from '../../../context/CreateNewButtonContext';
import { getAllLeadAccountsAction, getAllLeadsAction } from 'redux/actions/leadManagement_actions';
import { maxHeight } from 'utils/pageSize';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import { getsessionStorage } from 'pages/common/login/cookies';
import toMomentOrNull from 'utils/DateFixer';


const TaskCreation = (props) => {
  const [reminder, setReminder] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [validRegex, setValidRegex] = useState({
    dateValid: false,
  });

  const {
    LeadsTaskReducer: {getTaskLeads, getLeadsAccounts},
    leadManagementReducers: {allLeads, getAllAccounts}
  } = useSelector((state) => state);

  const {
    attendanceReducer: {get_empbasecompany, searchCompanyBasedEmployeeFilter},
  } = useSelector((state) => state);
  const {
    attendanceReducer: {getCompanyBasedEmployeeFilter},
  } = useSelector((state) => state);

  const storage = getsessionStorage();
  const fallbackCurrentUserOption =
    storage?.employee_id
      ? [
          {
            employee_id: storage.employee_id,
            first_name: storage.first_name || storage.username || 'Current User',
            last_name: storage.last_name || '',
            full_name: `${storage.first_name || storage.username || 'Current User'}${
              storage.last_name ? ` ${storage.last_name}` : ''
            }`,
            employee_code: storage.employee_code || '',
          },
        ]
      : [];

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getEmpbasecompanyAction({}));
    dispatch(getEmpbasecompanyFilterAction({searchString: ''}));
    dispatch(getLeadstaskCreationAction());
    allLeads.length === 0 && dispatch(getAllLeadsAction())
    dispatch(getAllLeadAccountsAction())
    if (props?.data) {
      setFormData((prevData) => ({
        ...prevData,
        lead: props?.data['Lead Name'],
      }));
    }
  }, []);

  const defaultOwnerOptions = getCompanyBasedEmployeeFilter?.length
    ? getCompanyBasedEmployeeFilter
    : get_empbasecompany;

  const taskOwnerOptions = defaultOwnerOptions?.length
    ? defaultOwnerOptions
    : fallbackCurrentUserOption;

  const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');
  const [searchValLeadFilter, setSearchValLeadFilter] = useState('');

  const [value, setValue] = useState([]);
  const [lead, setLead] = useState([]);

  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
  } = useContext(context);

  const [formData, setFormData] = useState({
    taskOwner: null,
    subject: null,
    dueDate: null,
    lead: null,
    account: null,
    status: null,
    priority: null,
    description: null,
    reminder: null,
    repeat: null,
    empName: null,
  });

  const [formErrors, setFormErrors] = useState({
    // taskOwner: null,
    subject: null,
    dueDate: null,
    lead: null,
    account: null,
    status: null,
    priority: null,
    description: null,
    reminder: null,
    repeat: null,
    empName: null,
  });

  const requiredFields = [
    // 'taskOwner',
    'subject',
    'dueDate',
    'lead',
    'account',
    'status',
    'priority',
    'description',
    'empName',
  ];

  if (repeat) {
    requiredFields.push('repeat');
  }

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    let isValid = true;
    let formErrorsObj = {...formErrors};
    requiredFields.forEach((key) => {
      if (
        formData[key] === null ||
        formData[key] === 'null' ||
        formData[key] === '' ||
        value === null ||
        value === '' ||
        value === 'null' ||
        (Array.isArray(value) && value.length === 1 && value[0] === null)
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' is required';
      } else {
        formErrorsObj[key] = null;
      }
    });

    setFormErrors(formErrorsObj);

    if (isValid) {
      const data = {
        task_owner: value && value[0]?.full_name,
        subject: formData.subject,
        due_date: formData.dueDate,
        lead_name:
          props.type === 'details'
            ? props.data['Lead Name']
            : formData.lead['Lead Name'],
        lead_id:
          props.type === 'details' ? props.data.lead_id : formData.lead.lead_id,
        account: formData.account.contactPersonFirstName || formData.account.company_name,
        status: formData.status.status,
        priority: formData.priority.priority,
        reminder: reminder ? 1 : 0,
        repeat: repeat ? 1 : 0,
        duration: repeat ? formData.repeat.repeat : null,
        description: formData.description,
      };

      await dispatch(createLeadTaskAction(data));

      if (type === 'save') {
        setFormData({
          subject: null,
          dueDate: null,
          lead: null,
          account: null,
          status: null,

          priority: null,
          description: null,
          reminder: null,
          repeat: null,
        });
        setRepeat(false);
        setReminder(false);
        setValue(null);
        setLead(null);
      }
      
      if(type !== 'save'){
        setFormData({
          account: null,
        })
         props.handleClose();
      }
    }
    else{
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
    }
  };

  const setStateHandler = (name, value) => {
    const formObj = {...formData}
    if(name === 'lead'){
      if(value !== null){
        const account = getAllAccounts.find(e => e.customer_id === value.customer_id)
        formObj[name] = value === '' ? null : value
        formObj.account = account
      }
      else{
        formObj[name] = value === '' ? null : value
        formObj.account = null
      }
    }
    else{
      formObj[name] = value === '' ? null : value
    }
    setFormData(formObj);
    validateForm(name, value);
  };

  const validateForm = (name, value) => {
    if (requiredFields.includes(name) && (value === null || value === '')) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]: capitalize(name.replace(/_/g, ' ')) + ' is required',
      }));
    } else {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]: null,
      }));
    }

    if (name === 'dueDate' && value !== null) {
      if (!moment(value, moment.ISO_8601).isValid()) {
        setValidRegex({...validRegex, dateValid: false});
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          [name]: ' Due Date is Invalid!',
        }));
      } else {
        setValidRegex({...validRegex, dateValid: true});
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          [name]: null,
        }));
      }
    }

    if(name === 'lead' && (value === null || value === '')){
      setFormErrors((prev) => ({
        ...prev,
        lead: 'Lead is Required',
        account: 'Account is Required'
      }))
    }
    else{
      setFormErrors((prev) => ({
        ...prev,
        lead: null,
        account: null
      }))
    }
  };

  const priority = [
    {priority: 'Highest'},
    {priority: 'High'},
    {priority: 'Lowest'},
    {priority: 'Low'},
  ];

  const repeatLead = [
    {repeat: 'Every Week'},
    {repeat: 'Every Month'},
    {repeat: 'Every Year'},
  ];

  const status = [
    {status: 'Not Started'},
    {status: 'Deferred'},
    {status: 'In Progress'},
    {status: 'Completed'},
    {status: 'Waiting for input'},
  ];

  const handleChangeEmployeeName = (val) => {
    setValue(val);

    if (val?.length > 0) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        empName: null,
      }));
      setStateHandler('empName', val[0]?.full_name);
    } else {
      setStateHandler('empName', null);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        empName: 'Task Owner is required',
      }));
    }
  };


  const requestSearchEmployeeFilter = (val) => {
    setSearchValEmployeeFilter(val);
    dispatch(set_search_company_based_employee([]));

    if (!val) {
      return;
    }

    let data = {
      searchString: val,
    };

    dispatch(
      get_search_company_based_employee(
        data,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    );
  };

  useEffect(() => {
    if (props.type === 'details' && getAllAccounts.length > 0) {
      const account = getAllAccounts.find(
        e => e.customer_id === props.data.customer_id
      );

      setFormData(prev => ({
        ...prev,
        lead: props.data,
        account: account || null,
      }));
    }
  }, [props.type, props.data, getAllAccounts]);


  // useEffect(() => {
  //   if (getLeadsAccounts?.length > 0 && formData.lead !== null) {
  //     console.log('running');
  //     const account = getLeadsAccounts[0];
  //     setFormData((prevData) => ({
  //       ...prevData,
  //       account: account,
  //     }));
  //   }
  // }, [getLeadsAccounts, formData.lead]);

  let options2 =
    props.type === 'details'
      ? allLeads?.map(
          (item) =>
            item.lead_id == props?.data.lead_id,
        )
      : allLeads?.map((item) => ({
          value: item['lead_id'],
          label: item.customerLastName && item.customerLastName !== '' ? `${item['Lead Name']} - ${item.customerFirstName} ${item.customerLastName}` : `${item['Lead Name']} - ${item.customerFirstName}`,
        }));

        console.log(allLeads,'formdatasaasD')

  // console.log('propsscsd',getTaskLeads)

  return (
    // <Container>
    // </Container>
    <Card sx={{
        p: 5,
        minHeight:maxHeight,
        maxHeight:maxHeight,
        // maxWidth:'100%'
    }}
    >
      {/* <Container sx={{p: 3}}> */}
      <Typography sx={{pb:4}}>Task Information</Typography>
      <Grid container spacing={5}>
        <Grid
          size={{
            lg: props.type === 'details' ? 0 : 10,
            md: props.type === 'details' ? 0 : 10,
            sm: props.type === 'details' ? 0 : 10,
            xs: props.type === 'details' ? 0 : 10
          }}>
          <Grid container spacing={3}>
              <Grid
                size={{
                  lg: props.type === 'details' ? 4 : 3,
                  md: props.type === 'details' ? 4 : 4,
                  sm: props.type === 'details' ? 4 : 6,
                  xs: props.type === 'details' ? 6 : 12
                }}>
                <FormControl fullWidth variant='filled'>
                  
                  <CommonUserAutoCompleteForSingleUser
                    error={formErrors.empName}
                    searchVal={searchValEmployeeFilter}
                    setSearchValEmployeeFilter={setSearchValEmployeeFilter}
                    requestSearch={requestSearchEmployeeFilter}
                    value={value && value[0]}
                    setValue={(d) => {
                      handleChangeEmployeeName([d]);
                    }}
                    type={taskOwnerOptions}
                    searchType={searchCompanyBasedEmployeeFilter}
                    labelName='Select Task Owner'
                    isMandatory={true}
                  />
                </FormControl>
                {/* <Autocomplete
                    disablePortal
                    options={sampleData}
                    getOptionLabel={(option) => option.label || ''}
                    value={formData.taskOwner}
                    onChange={(event, newValue) =>
                      setStateHandler('taskOwner', newValue)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label='Task Owner'
                        required
                        variant='filled'
                        error={formErrors.taskOwner !== null}
                        helperText={formErrors.taskOwner}
                      />
                    )}
                  /> */}
              </Grid>
              <Grid
                size={{
                  lg: props.type === 'details' ? 4 : 3,
                  md: props.type === 'details' ? 4 : 4,
                  sm: props.type === 'details' ? 4 : 6,
                  xs: props.type === 'details' ? 6 : 12
                }}>
                <TextField
                  fullWidth
                  value={formData.subject || ''}
                  required
                  label='Subject'
                  name='subject'
                  variant='filled'
                  onChange={(e) => setStateHandler('subject', e.target.value)}
                  error={formErrors.subject !== null}
                  helperText={formErrors.subject}
                />
              </Grid>
              <Grid
                size={{
                  lg: props.type === 'details' ? 4 : 3,
                  md: props.type === 'details' ? 4 : 4,
                  sm: props.type === 'details' ? 4 : 6,
                  xs: props.type === 'details' ? 6 : 12
                }}>
                <LocalizationProvider dateAdapter={DateAdapter}>
                  <DatePicker
                    label='Due Date'
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: 'filled',
                        required: true,
                        error: formErrors.dueDate !== null,
                        helperText: formErrors.dueDate,
                      },
                    }}
                    value={toMomentOrNull(formData.dueDate)}
                    format='DD/MM/YYYY'
                    onChange={(date) => {
                      setStateHandler('dueDate', moment(date).format('YYYY-MM-DD'));
                    }}
                    views={['year', 'month', 'day']}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid
                size={{
                  lg: props.type === 'details' ? 4 : 3,
                  md: props.type === 'details' ? 4 : 4,
                  sm: props.type === 'details' ? 4 : 6,
                  xs: props.type === 'details' ? 6 : 12
                }}>
                {/* <FormControl fullWidth variant='filled'>
                                <CommonUserAutoCompleteForSingleUser
                                  error={formErrors.lead}
                                  searchVal={searchValLeadFilter}
                                  setSearchValEmployeeFilter={setSearchValLeadFilter}
                                  requestSearch={requestSearchLeadFilter}
                                  value={lead && lead[0]}
                                  setValue={(d) => {
                                    handleChangeLead([d])
                                  }}
                                  type={getLeads.data}
                                  searchType={getLeads.data}
                                  labelName = "Select Lead"
                                  isMandatory={true}
                                
                                />
                  
                  </FormControl>  */}

             <Autocomplete
                disablePortal
                disabled={props.type === 'details'}
                options={allLeads || []}
                getOptionLabel={(option) =>
                  option ? `${option['Lead Name']} - ${option.company_name}` : ''
                }
                value={formData.lead}
                onChange={(event, newValue) => setStateHandler('lead', newValue)}
                isOptionEqualToValue={(option, value) =>
                  option?.lead_id === value?.lead_id
                }
                renderOption={(props, option) => (
                  <li {...props}>
                    {option['Lead Name']} — {option.company_name}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Lead"
                    required
                    variant="filled"
                    error={Boolean(formErrors.lead)}
                    helperText={formErrors.lead}
                  />
                )}
              />

              </Grid>

              {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                  <Autocomplete
                  
                    disablePortal
                    options={getLeadsAccounts}
                    getOptionLabel={(option) => option.first_name|| ''}
                    value={formData.account}
                    onChange={(event, newValue) =>
                      setStateHandler('account', newValue)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label='Account'
                        required
                        variant='filled'
                        error={formErrors.account !== null}
                        helperText={formErrors.account}
                      />
                    )}
                  />
                </Grid> */}
              <Grid
                size={{
                  lg: props.type === 'details' ? 4 : 3,
                  md: props.type === 'details' ? 4 : 4,
                  sm: props.type === 'details' ? 4 : 6,
                  xs: props.type === 'details' ? 6 : 12
                }}>
                <Autocomplete
                  disablePortal
                  disabled
                  options={getAllAccounts}
                  getOptionLabel={(option) => {
                    if ((!option.first_name || option.first_name.trim() === '') && (!option.last_name || option.last_name.trim() === '')) {
                      return option.contactPersonLastName
                        ? `${option.contactPersonFirstName || ''} ${option.contactPersonLastName}`.trim()
                        : option.contactPersonFirstName || '';
                    }
                    return option.last_name
                      ? `${option.first_name} ${option.last_name}`.trim()
                      : option.first_name || '';
                  }}
                  value={formData.account || null}
                  onChange={(event, newValue) => {
                    setStateHandler('account', newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='Account'
                      required
                      variant='filled'
                      error={formErrors.account !== null}
                      helperText={formErrors.account}
                    />
                  )}
                />
              </Grid>
              <Grid
                size={{
                  lg: props.type === 'details' ? 4 : 3,
                  md: props.type === 'details' ? 4 : 4,
                  sm: props.type === 'details' ? 4 : 6,
                  xs: props.type === 'details' ? 6 : 12
                }}>
                <Autocomplete
                  disablePortal
                  options={status}
                  getOptionLabel={(option) => option.status || ''}
                  value={formData.status}
                  onChange={(event, newValue) =>
                    setStateHandler('status', newValue)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='Status'
                      required
                      variant='filled'
                      error={formErrors.status !== null}
                      helperText={formErrors.status}
                    />
                  )}
                />
              </Grid>

              <Grid
                size={{
                  lg: props.type === 'details' ? 4 : 3,
                  md: props.type === 'details' ? 4 : 4,
                  sm: props.type === 'details' ? 4 : 6,
                  xs: props.type === 'details' ? 6 : 12
                }}>
                <Autocomplete
                  disablePortal
                  options={priority}
                  getOptionLabel={(option) => option.priority || ''}
                  value={formData.priority}
                  onChange={(event, newValue) =>
                    setStateHandler('priority', newValue)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='Priority'
                      required
                      variant='filled'
                      error={formErrors.priority !== null}
                      helperText={formErrors.priority}
                    />
                  )}
                />
              </Grid>

              <Grid
                size={{
                  lg: props.type === 'details' ? 4 : 3,
                  md: props.type === 'details' ? 4 : 4,
                  sm: props.type === 'details' ? 4 : 6,
                  xs: props.type === 'details' ? 6 : 12
                }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={reminder}
                      onChange={(e) => setReminder(e.target.checked)}
                    />
                  }
                  label='Reminder'
                />
              </Grid>

              <Grid
                size={{
                  lg: props.type === 'details' ? 4 : 3,
                  md: props.type === 'details' ? 4 : 4,
                  sm: props.type === 'details' ? 4 : 6,
                  xs: props.type === 'details' ? 6 : 12
                }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={repeat}
                      onChange={(e) => setRepeat(e.target.checked)}
                    />
                  }
                  label='Repeat'
                />
              </Grid>

              {/* {
                      reminder === true && (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                
                        <LocalizationProvider dateAdapter={DateAdapter}>
                          <DateTimePicker
                            renderInput={(params) => (
                              <TextField {...params} variant='filled'
                              fullWidth
                              name='reminder'
                              required 
                              // onKeyDown={onKeyDown} 
                              error={formErrors.reminder !== null}
                              helperText={formErrors.reminder}
                              />
                            )}
                            label='Reminder'
                            
                            value={formData.reminder}
                            onChange={(val) => {
                              if(!val) {
                                setFormErrors((prev) => ({...prev, reminder : 'Reminder is Required'}))
                                setFormData((prev) => ({...prev, reminder : null}))
                              }
                              else{
                                const formattedDate = moment(val).format('YYYY-MM-DD HH:mm');
                                setFormErrors((prev) => ({ ...prev, reminder: null }));
                                setFormData((prev) => ({ ...prev, reminder: formattedDate }));
                              
                            }
                            }}
                            inputFormat='DD/MM/YYYY hh:mm a'
                            
                            
                          />
                        </LocalizationProvider>
                        
                      </Grid>
                      )
                    } */}

              {repeat === true && (
                <Grid
                  size={{
                    lg: props.type === 'details' ? 4 : 3,
                    md: props.type === 'details' ? 4 : 4,
                    sm: props.type === 'details' ? 4 : 6,
                    xs: props.type === 'details' ? 6 : 12
                  }}>
                  <Autocomplete
                    disablePortal
                    options={repeatLead}
                    getOptionLabel={(option) => option.repeat || ''}
                    value={formData.repeat}
                    onChange={(event, newValue) =>
                      setStateHandler('repeat', newValue)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        label='Repeat'
                        required
                        variant='filled'
                        error={formErrors.repeat !== null}
                        helperText={formErrors.repeat}
                      />
                    )}
                  />
                </Grid>
              )}

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Typography m={'15px 0px 5px 0px'}>
                Description Information
              </Typography>
            </Grid>

            <Grid
              size={{
                lg: 8,
                md: 8,
                sm: 8,
                xs: 12
              }}>
              <TextField
                fullWidth
                label='Description'
                required
                rows={4}
                variant='filled'
                value={formData.description || ''}
                onChange={(e) => setStateHandler('description', e.target.value)}
                multiline
                error={formErrors.description !== null}
                helperText={formErrors.description}
              />
            </Grid>

          </Grid>
        </Grid>

        <Grid
          size={{
            lg: props.type === 'details' ? 0 : 2,
            md: props.type === 'details' ? 0 : 2,
            sm: props.type === 'details' ? 0 : 2,
            xs: props.type === 'details' ? 0 : 2
          }}>
        </Grid>

        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Grid container justifyContent='flex-end' spacing={2}>
            <Grid>
              <Button
                variant = 'contained'
                color = 'error'
                onClick = {() => props.handleClose()}
              >
                Cancel
              </Button>
            </Grid>

            <Grid>
              <Button
                variant = 'contained'
                color = 'primary'
                onClick = {handleSubmit}
              >
                Save
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {/* <Grid container>
        <Grid size={{ xs: 12, sm: 8, md: 8, lg: 8 }}>
          <Typography m={'15px 0px 5px 0px'}>
            Description Information
          </Typography>
          <TextField
            fullWidth
            label='Description'
            required
            rows={4}
            variant='filled'
            value={formData.description || ''}
            onChange={(e) => setStateHandler('description', e.target.value)}
            multiline
            error={formErrors.description !== null}
            helperText={formErrors.description}
          />
        </Grid>
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
        <Grid container justifyContent='flex-end' spacing={2}>
          <Grid>
            <Button
              variant = 'contained'
              color = 'error'
              onClick = {() => props.handleClose()}
            >
              Cancel
            </Button>
          </Grid>

          <Grid>
            <Button
              variant = 'contained'
              color = 'primary'
              onClick = {handleSubmit}
            >
              Save
            </Button>
          </Grid>
        </Grid>
      </Grid> */}
      {/* </Container> */}
    </Card>
  );
};



export default TaskCreation;
