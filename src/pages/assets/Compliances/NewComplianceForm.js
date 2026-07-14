import React, { useEffect, useState } from 'react';
import {
  Grid,
  TextField,
  Box,
  IconButton,
  Tooltip,
  Typography,
  Button,
  Card,
  Dialog,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  Switch,
} from '@mui/material';
import { DatePicker, TimePicker,LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import {padding, Stack, styled} from '@mui/system';
import dayjs from 'dayjs';
import moment from 'moment';
import {useDispatch, useSelector} from 'react-redux';
import AttachmentField from 'pages/common/Timesheet/Attachment'
import { maxBodyHeight, maxHeight } from 'utils/pageSize';
import {
  asstGeneralContactAction,
  createComplianceAction
} from 'redux/actions/asset_actions';
import { getComplianceByIdAction, getComplianceLovAction, renewComplianceAction, updateComplianceAction } from '../../../redux/actions/compliances_actions';
import { phoneValidation, emailValidation } from 'components/regexFunction';
import _ from 'lodash';
import { getDateTimeFormat } from 'utils/getTimeFormat';
import toMomentOrNull from '../../../utils/DateFixer'
import { OpenalertActions } from '../../../redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from '../../../utils/content';
import { GetFrequencyTypeAction } from 'redux/actions/insurance_actions'


const NewComplianceForm = (props) => {
  const dispatch = useDispatch();

  const normalizeDateForSubmit = (value) => {
    if (!value || value === 'null') return '';
    const parsed = moment(
      value,
      [moment.ISO_8601, 'YYYY-MM-DD', 'DD/MM/YYYY', 'DD-MM-YYYY'],
      true
    );
    return parsed.isValid() ? parsed.format('YYYY-MM-DD') : '';
  };

  const normalizeBackendDateForForm = (value) => {
    if (!value || value === 'null' || value === '0000-00-00') return null;
    const parsed = moment(
      value,
      [moment.ISO_8601, 'YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss', 'DD/MM/YYYY', 'DD-MM-YYYY'],
      true
    );
    if (!parsed.isValid()) return null;
    if (parsed.year() <= 1900) return null;
    return parsed.format('YYYY-MM-DD');
  };

  const initialFormValues = {
    title: null,
    priority: null,
    dueDate: null,
    description: null,
    amount: null,
    regulation: null,
    jurisdication: null,
    authority: null,
    requirement: null,
    frequency: null,
    winStart: null,
    winEnd: null,
    portalUrl: null,
    day_penalty: null,
    max_penalty: null,
    email_notification: null,
    sms_notification: null,
    whatsApp_notification: null,
    regulation_type : null,
    reminder : null,
    repeat: null,
    provider_name: null,
    provider_email: null,
    provider_contact: null,
  }

  const initialFormErrors = {
    title: null,
    priority: null,
    dueDate: null,
    description: null,
    amount: null,
    regulation: null,
    jurisdication: null,
    authority: null,
    requirement: null,
    frequency: null,
    winStart: null,
    winEnd: null,
    portalUrl: null,
    day_penalty: null,
    max_penalty: null,
    files: null,
    regulation_type: null,
  }

  const [formValues, setFormValues] = useState(initialFormValues)
  const [formErrors, setFormErrors] = useState(initialFormErrors)

  const priority = [
    {id: 1, priority: 'LOW'},
    {id: 2, priority: 'MEDIUM'},
    {id: 3, priority: 'HIGH'},
    {id: 4, priority: 'CRITICAL'},
  ];


  let requiredFieldsInsuranceAndWarranty = [
    'title',
    'priority',
    'dueDate',
    'regulation',
    'frequency',
    'amount',
    'regulation_type',
  ];

      const requiredFields = [
  ...requiredFieldsInsuranceAndWarranty,
  ...(formValues.provider_name ? ['provider_contact'] : []),
];

     const [compliancesFiles, setCompliancesFiles] = useState({
        compliancesFiles : [],
        compliancesFilePreviews : [] ,
        existingImageKey : []
    })

      const {
        compliancesReducers: {compliancesLov , getComplianceById} ,
        AssetReducers : {get_asst_general},
        InsuranceReducers: { getFrequencyType },
      } = useSelector((state)=> state)
      

  const handleChange = (name, value) => {
    setFormValues((prevData) => {
      const newFormData = {...prevData, [name]: value || null};
      validateForm(name, value);
      return newFormData;
    });
  };

  const resetForm = () => {
    setFormValues(initialFormValues)
    setFormErrors(initialFormErrors)
    setCompliancesFiles({
      compliancesFiles : [],
      compliancesFilePreviews : []
    })
  }


  console.log(formValues.dueDate)

  const validateForm = (name, value) => {
    if (requiredFields.includes(name) && (value === null || value === '')) {
      setFormErrors((prevErr) => ({
        ...prevErr,
        [name]: `${name} is Required`,
      }));
    } else {
      setFormErrors((prevErr) => ({
        ...prevErr,
        [name]: null,
      }));
    }

    if (name === 'date' && value !== null) {
      if (!moment(value, moment.ISO_8601).isValid()) {
        setValidRegex({...validRegex, dateValid: false});
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          [name]: 'Date is Invalid!',
        }));
      } else {
        setValidRegex({...validRegex, dateValid: true});
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          [name]: null,
        }));
      }
    }
  };

  console.log( formValues.regulation_type,'ckajshjsdj')

  const handleSubmit = async (e) => {
    e.preventDefault();

    let isValid = true;
    let formErrObj = {...formErrors};

    requiredFields.forEach((key) => {
      if (
        formValues[key] === null ||
        formValues[key] === 'null' ||
        formValues[key] === ''
      ) {
        isValid = false;
        formErrObj[key] = `${key} is required`;
      }
       else {
        formErrObj[key] = null;
      }
      if(compliancesFiles.compliancesFilePreviews.length > 1) {
                isValid = false
                formErrObj.files = 'Only 1 Files are allowed!'
            }
    });
    if (
        formValues.provider_email &&
        !emailValidation(formValues.provider_email)
      ) {
        isValid = false;
        formErrObj.provider_email = "Invalid Email Address!";
      }

    setFormErrors(formErrObj);

    if(isValid){
      const formData = new FormData()
            let compliancesFile = []
              if (compliancesFiles.compliancesFiles?.length > 0) {
                compliancesFiles.compliancesFiles.map((file) => {
                  formData.append('compliancesFiles', file)
                  compliancesFile.push({
                    fileName: file.name,
                    type: file.type
                  })
                })
              } else if (compliancesFiles.existingImageKey?.length > 0) {
                compliancesFile = compliancesFiles.existingImageKey.map((url) => ({
                  fileName: url,
                  type: 'existing'
                }))
              }

            formData.append('title', formValues.title || '')
            formData.append('priority', formValues.priority.priority || '')
            formData.append('due_date', normalizeDateForSubmit(formValues.dueDate))
            formData.append('description', formValues.description || '')
            formData.append('amount', formValues.amount || '') 
            formData.append('regulation', formValues.regulation || '')
            formData.append('jurisdication', formValues.jurisdication || '')
            formData.append('authority', formValues.authority || '')
            formData.append('requirement', formValues.requirement || '')
            formData.append('frequency', formValues.frequency ? formValues.frequency?.id : '')
            formData.append('window_start', normalizeDateForSubmit(formValues.winStart))
            formData.append('window_end', normalizeDateForSubmit(formValues.winEnd))
            formData.append('portal_url', formValues.portalUrl || '')
            formData.append('day_penalty', formValues.day_penalty || '')
            formData.append('max_penalty', formValues.max_penalty || '')
            formData.append('consultant_name', formValues.provider_name?.id ? formValues.provider_name.id : formValues.provider_name )
            formData.append('consultant_email', formValues.provider_email || '')
            formData.append('consultant_contact', formValues.provider_contact || '')
            formData.append('regulation_type', formValues.regulation_type?.compliance_name || '')
            formData.append('compliances_type', formValues.regulation_type?.compliance_id || '')
            formData.append('email_notification', formValues.email_notification ? 1 : 0 )
            formData.append('sms_notification', formValues.sms_notification ? 1 : 0 )
            formData.append('whatsApp_notification', formValues.whatsApp_notification ? 1 : 0 )
            formData.append('files', JSON.stringify(compliancesFile) || '')
            formData.append('reminder', JSON.stringify(formValues.reminder) || '')
            formData.append('repeat',formValues.repeat ? 1 : 0)

      if (props?.type === 'edit') {
           await dispatch(updateComplianceAction(formData , props?.rowData?.id))
           props.handleClose()
      } else if (props?.type === 'Renew') {
          await dispatch(renewComplianceAction(formData, props?.rowData?.id))
          if (props.handleSubmitClose) {
              props.handleSubmitClose()
          } else {
              props.handleClose()
          }
      }

      else {
        await dispatch(createComplianceAction(formData))
        props.handleClose()
      }
    }else{
      dispatch(OpenalertActions( {msg : requiredFieldsAlertMessage ,severity : 'warning' } ))
    }
  };

      useEffect(() => {
        if(compliancesFiles.compliancesFilePreviews.length > 1) {
            setFormErrors({
                ...formErrors,
                files : 'Only 1 Files are allowed!'
            })
        }
        else {
            setFormErrors({
                ...formErrors,
                files : null
            })
        }
    }, [compliancesFiles.compliancesFilePreviews])

      const handleEmailSmsChange = (name, value) => {
      console.log(name,value,'sdfdsfsdsdf')
        setFormValues((prev) => ({...prev, [name] : value}))
    }

    useEffect(()=>{
      dispatch(getComplianceLovAction())
      dispatch(asstGeneralContactAction())
      dispatch(GetFrequencyTypeAction())
    },[])

    const reminderDaysBefore = [
    {reminder : '2'},
    {reminder : '5'},
    {reminder : '7'},
  ]

  useEffect(()=>{
    if(formValues.provider_name !== null && formValues.provider_name !== "" ){
      setFormValues((prev)=>({
          ...prev ,
          provider_contact : formValues.provider_name?.contact || "",
          provider_email: formValues.provider_name?.email || ""

      }))
    }
  } , [formValues.provider_name?.id])

  useEffect(()=>{
    if(props.type === 'edit' || props.type === 'Renew'){
      dispatch(getComplianceByIdAction(props?.rowData?.id))
    }
  },[props?.type])

useEffect(() => {
  if (props.type !== 'edit' && props.type !== 'Renew') return
  if (!getComplianceById || !getComplianceById.length) return;

  const record = getComplianceById[0];
  const generalConatct = get_asst_general?.data?.find((item) => Number(item.id === Number(record.consultant_name)))
  const frequency = getFrequencyType.find((item) => Number(item.id) === Number(record?.frequency))

  setFormValues({
    
    title: record.title || "",
    priority: priority.find(p => p.priority === record.priority) || null,
    dueDate: normalizeBackendDateForForm(record.due_date),
    description: record.description || "",
    amount: record.amount || "",
    regulation: record.regulation || "",
    jurisdication: record.jurisdication !== "null" ? record.jurisdication : "",
    authority: record.authority || "",
    requirement: record.requirement || "",
    frequency: frequency,
    winStart: normalizeBackendDateForForm(record.window_start),
    winEnd: normalizeBackendDateForForm(record.window_end),
    portalUrl: record.portal_url || "",
    day_penalty: record.day_penalty || "",
    max_penalty: record.max_penalty || "",
    email_notification: record.email_notification === 1,
    sms_notification: record.sms_notification === 1,
    whatsApp_notification: record.whatsApp_notification === 1,
    regulation_type: compliancesLov?.find(
      (item) => item.compliance_name === record.regulation_type
    ) || null,
    reminder: record.reminder !== "null" ? JSON.parse(record.reminder) : [],
    repeat: record.repeat === 1,
    provider_name: generalConatct?.name,
    provider_email: generalConatct?.email,
    provider_contact: generalConatct?.contact,
  })
  setCompliancesFiles({
    compliancesFiles : [],
    compliancesFilePreviews : record.image?.map(img => img.imageUrl) ||  [],
    existingImageKey : record.imageKeys ? JSON.parse(record.imageKeys) : []
  })

}, [getComplianceById])

useEffect(() => {
  if (props.type !== 'edit' && props.type !== 'Renew') {
    resetForm()
  }
}, [props.type])

  return (
    <div>
      <Card
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          minHeight: maxHeight,
          maxHeight: 'calc(100vh - 80px)',
          padding : '15px',
          overflow : 'auto'
        }}
      >
       
        <Grid container spacing={3} sx={{pb: 3}}>
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
              <Typography sx={{pt: 2, pb: 2}}>{ props?.type === "Renew" ? "Renew Fillings" : props?.type === "edit" ? "Edit Fillings" : "New Fillings"}</Typography>
          </Grid>
          <Grid
            size={{
              lg: 4,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <TextField
              label={'Title'}
              fullWidth
              name='title'
              variant='filled'
              required
              onChange={(e) => handleChange('title', e.target.value)}
              value={formValues.title || ''}
              error={formErrors.title !== null}
              helperText={formErrors.title !== null ? 'Title is required' : ''}
            />
          </Grid>

          <Grid
            size={{
              lg: 4,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <Autocomplete
              // disablePortal
              options={priority || []}
              getOptionLabel={(option) => option.priority}
              value={formValues.priority || null}
              onChange={(e, newValue) => handleChange('priority', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  label={'Select Type'}
                  required
                  variant='filled'
                  error={formErrors.priority !== null}
                  helperText={formErrors.priority !== null ? 'Priority is required' : ''}
                />
              )}
            />
          </Grid>

          <Grid
            size={{
              lg: 4,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <LocalizationProvider dateAdapter={DateAdapter}>
              <DatePicker
                label='Due Date'
                value={toMomentOrNull(formValues.dueDate)}
                minDate={moment()}
                onChange={(date) =>
                  handleChange(
                    'dueDate',
                    date && moment(date).isValid() ? moment(date).format('YYYY-MM-DD') : null
                  )
                }
                // onChange={(dates) => {
                //   handleChange({
                //     target: { value: getDateTimeFormat(dates?.toDate()), name: 'dueDate' },
                //   })
                // }
                // }
 
                views={['year', 'month', 'day']}
                format="DD/MM/YYYY"
                slotProps={{ textField: { fullWidth: true, variant: 'filled', required: true, error: formErrors.dueDate !== null, helperText: formErrors.dueDate !== null ? 'Due Date is required' 
                      : '' } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid
            size={{
              lg: 4,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <TextField
              label={'Description'}
              multiline
              rows={6}
              fullWidth
              name='description'
              variant='filled'
              onChange={(e) => handleChange('description', e.target.value)}
              value={formValues.description || ''}
            />
          </Grid>

          <Grid
            size={{
              lg: 4,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <TextField
              label={'Amount'}
              type='number'
              fullWidth
              required
              name='amount'
              variant='filled'
              onChange={(e) => handleChange('amount', e.target.value)}
              value={formValues.amount || ''}
              error={formErrors.amount !== null}
              helperText={formErrors.amount !== null ? 'Amount is required' : ''}
            />
          </Grid>

                <Grid
                  size={{
                    lg: 10,
                    md: 10,
                    sm: 10,
                    xs: 10
                  }}>
          <Typography variant='h6'>Provider</Typography>
        </Grid>

        <Grid
          size={{
            lg: 10,
            md: 10,
            sm: 10,
            xs: 10
          }}>
          <Grid container spacing={3}>
            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              {/* <TextField
                fullWidth
                label='Provider Name'
                variant='filled'
                value={formData.provider_name}
                onChange={(event) =>
                  handleChange('provider_name', event.target.value)
                }
              /> */}

              <Autocomplete
                fullWidth
                freeSolo
                options={get_asst_general?.data || []}
                getOptionLabel={(option) =>
                  typeof option === 'string' ? option : option?.name || ''
                }
                value={formValues.provider_name || null}
                onInputChange={(event, newInputValue, reason) => {
                                      if (reason === 'input') {
                                      handleChange('provider_name', newInputValue);
                                      }
                                  }}

                onChange={(event, newValue) => {
                  handleChange ('provider_name' , newValue)
                }}

                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Consultant Name"
                    variant="filled"
                  />
                )}
              />

            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <TextField
                fullWidth
                label='Consultant Email'
                variant='filled'
                value={formValues.provider_email || ''} 
                onChange={(event) =>
                  handleChange('provider_email', event.target.value)
                }
                error={formValues.provider_email && !emailValidation(formValues.provider_email)
                }
                helperText={
                        formValues.provider_email && !emailValidation(formValues.provider_email)
                         ? 'Invalid Email Address!'
                         : ''
                }              
              />
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <TextField
                fullWidth
                label='Consultant Contact'
                variant='filled'
                value={formValues.provider_contact || ''}
                type='number'
                required = { (formValues.provider_name && !formValues.provider_contact) || 
                                    (formValues.provider_contact && !phoneValidation(formValues.provider_contact))}
                onChange={(event) =>
                  handleChange('provider_contact', event.target.value)
                }
                
                error={
                  (formValues.provider_name && !formValues.provider_contact) || 
                  (formValues.provider_contact && !phoneValidation(formValues.provider_contact))
                  }
                  helperText={
                      formValues.provider_name && !formValues.provider_contact
                      ? 'Provider contact is required'
                      : formValues.provider_contact && !phoneValidation(formValues.provider_contact)
                      ? 'Invalid Contact No!'
                      : ''
                  }
              />
            </Grid>
          </Grid>
        </Grid>

          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Typography sx={{pt: 3, pb: 3}}>Regulation</Typography>
          </Grid>

          <Grid
            size={{
              lg: 4,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <TextField
              label={'Regulation Name'}
              fullWidth
              name='regulation'
              variant='filled'
              required
              onChange={(e) => handleChange('regulation', e.target.value)}
              value={formValues.regulation || ''}
              error={formErrors.regulation !== null}
              helperText={formErrors.regulation !== null ? 'Regulation is required' : ''}
            />
          </Grid>
            <Grid
              size={{
                lg: 4,
                md: 6,
                sm: 6,
                xs: 12
              }}>
           <Autocomplete
              // disablePortal
              options={compliancesLov || []}
              getOptionLabel={(option) => option.compliance_name}
              value={formValues.regulation_type || null}
              onChange={(e, newValue) => handleChange('regulation_type', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  required
                  label={'Regulation Type'}
                  variant='filled'
                  error={formErrors.regulation_type !== null}
                helperText={formErrors.regulation_type !== null ? 'Regulation Type is required' : ''}
                />
              )}
            />
            </Grid>

          <Grid
            size={{
              lg: 4,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <TextField
              label={'Authority'}
              fullWidth
              name='authority'
              variant='filled'
              onChange={(e) => handleChange('authority', e.target.value)}
              value={formValues.authority || ''}
            />
          </Grid>

          <Grid
            size={{
              lg: 4,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <TextField
              label={'Requirement ID'}
              fullWidth
              name='requirement'
              variant='filled'
              onChange={(e) => handleChange('requirement', e.target.value)}
              value={formValues.requirement || ''}
            />
          </Grid>

          <Grid
            size={{
              lg: 4,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <Autocomplete
              // disablePortal
              options={getFrequencyType || []}
              getOptionLabel={(option) => option?.frequency_type || ''}
              value={formValues.frequency || getFrequencyType?.find(f => f.frequency_type === "MONTHLY") || null}
              onChange={(e, newValue) => handleChange('frequency', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  label={'Select Frequency'}
                  required
                  variant='filled'
                  error={formErrors.frequency !== null}
                  helperText={formErrors.frequency !== null ? 'Frequency is required' : ''}
                />
              )}
            />
          </Grid>

          <Grid
            size={{
              lg: 4,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <LocalizationProvider dateAdapter={DateAdapter}>
              <DatePicker
                label='Window Start'
                value={toMomentOrNull(formValues.winStart ?? '')}
                // onChange={(date) =>
                //   handleChange('winStart', moment(date).format('YYYY-MM-DD'))
                // }
                onChange={(date) =>
                  handleChange(
                    "winStart",
                    date && moment(date).isValid() ? moment(date).format("YYYY-MM-DD") : null
                  )
                }
                shouldDisableDate={(date) =>
                  formValues.winEnd && moment(date).isAfter(moment(formValues.winEnd), "day")
                } 
                views={['year', 'month', 'day']}
                format="DD/MM/YYYY"
                slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid
            size={{
              lg: 4,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <LocalizationProvider dateAdapter={DateAdapter}>
              <DatePicker
                label='Window End'
                value={toMomentOrNull(formValues.winEnd)}
                onChange={(date) =>
                  handleChange(
                    "winEnd",
                    date && moment(date).isValid() ? moment(date).format("YYYY-MM-DD") : null
                  )
                }
                shouldDisableDate={(date) =>
                  formValues.winStart && moment(date).isBefore(moment(formValues.winStart), "day")
                } 
                views={['year', 'month', 'day']}
                format="DD/MM/YYYY"
                slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid
            size={{
              lg: 4,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <TextField
              label={'Filing portal URL'}
              fullWidth
              name='portalUrl'
              variant='filled'
              onChange={(e) => handleChange('portalUrl', e.target.value)}
              value={formValues.portalUrl || ''}
            />
          </Grid>

          <Grid
            size={{
              lg: 4,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <TextField
              label={'Penality / day'}
              fullWidth
              type='number'
              name='day_penalty'
              variant='filled'
              onChange={(e) => handleChange('day_penalty', e.target.value)}
              value={formValues.day_penalty || ''}
            />
          </Grid>

          <Grid
            size={{
              lg: 4,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <TextField
              label={'Max / Penality'}
              fullWidth
              type='number'
              name='max_penalty'
              variant='filled'
              onChange={(e) => handleChange('max_penalty', e.target.value)}
              value={formValues.max_penalty || 's'}
            />
          </Grid>

          <Grid
  size={{
    lg: 3,
    md: 4,
    sm: 4,
    xs: 12
  }}
>
  <Autocomplete
    multiple
    disableCloseOnSelect
    fullWidth
    options={_.uniqBy(reminderDaysBefore, "reminder")}
    getOptionLabel={(option) => option?.reminder?.toString() || ""}
    value={Array.isArray(formValues.reminder) ? formValues.reminder : []}
    onChange={(event, newValue) =>
      handleChange("reminder", newValue || [])
    }
    isOptionEqualToValue={(option, value) =>
      option?.reminder === value?.reminder
    }
    renderInput={(params) => (
      <TextField
        {...params}
        label="Send Reminder Before"
        variant="filled"
      />
    )}
  />
</Grid>


        <Grid
          size={{
            lg: 4,
            md: 6,
            sm: 6,
            xs: 12
          }}>
                            <FormControlLabel
                                label = 'Repeat'
                                control = {
                                    <Switch
                                        checked = {formValues.repeat}
                                        onChange = {() => setFormValues({...formValues, repeat: !formValues.repeat})}
                                    />
                                }
                            />
                            </Grid>

          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
                                            <Grid container>
                                              <Grid
                                                size={{
                                                  lg: 12,
                                                  md: 12,
                                                  sm: 12,
                                                  xs: 12
                                                }}>
                                                                      <Typography>Send Reminders Through : </Typography>
                                                                      </Grid>
                                              
                                                <Grid
                                                  size={{
                                                    lg: 3,
                                                    md: 4,
                                                    sm: 4,
                                                    xs: 12
                                                  }}>
                                                    <FormControlLabel 
                                                        control = {
                                                            <Checkbox 
                                                                checked = {formValues.email_notification}
                                                                onChange = {(e) => handleEmailSmsChange('email_notification', e.target.checked)}
                                                            />
                                                        }
                                                        label = 'EMAIL'
                                                        labelPlacement = 'end'
                                                    />
                                                    {/* {
                                                        formErrors.formValues !== null &&  (
                                                            <FormHelperText sx={{ color : '#d32f2f' }}>
                                                                EMAIL is Required!
                                                            </FormHelperText>
                                                        )
                                                    } */}
                                                </Grid>
                    
                                                <Grid
                                                  size={{
                                                    lg: 3,
                                                    md: 4,
                                                    sm: 4,
                                                    xs: 12
                                                  }}>
                                                    <FormControlLabel 
                                                        control = {
                                                            <Checkbox 
                                                                checked = {formValues.sms_notification}
                                                                onChange = {(e) => handleEmailSmsChange('sms_notification', e.target.checked)}
                                                            />
                                                        }
                                                        label = 'SMS'
                                                        labelPlacement = 'end'
                                                    />
                                                    {/* {
                                                        formErrors.sms_notification !== null && (
                                                            <FormHelperText sx={{ color : '#d32f2f' }}>
                                                                SMS is Required!
                                                            </FormHelperText>
                                                        )
                                                    } */}
                                                </Grid>
          
                                                <Grid
                                                  size={{
                                                    lg: 3,
                                                    md: 4,
                                                    sm: 4,
                                                    xs: 12
                                                  }}>
                                                    <FormControlLabel 
                                                        control = {
                                                            <Checkbox 
                                                                checked = {formValues.whatsApp_notification}
                                                                onChange = {(e) => handleEmailSmsChange('whatsApp_notification', e.target.checked)}
                                                            />
                                                        }
                                                        label = 'Whatsapp'
                                                        labelPlacement = 'end'
                                                    />
                                                    {/* {
                                                        formErrors.whatsApp_notification !== null && (
                                                            <FormHelperText sx={{ color : '#d32f2f' }}>
                                                                Whatsapp is Required!
                                                            </FormHelperText>
                                                        )
                                                    } */}
                                                </Grid>
                                            </Grid>
                                        </Grid>

           <Grid
             size={{
               lg: 12,
               md: 12,
               sm: 12,
               xs: 12
             }}>
                        <AttachmentField 
                            asset = 'Compliances'
                            previews = {compliancesFiles.compliancesFilePreviews}
                            setPreviews = {setCompliancesFiles}
                        />
                        <Typography color='error'>{formErrors.files === null ? '' : formErrors.files}</Typography>
                    </Grid>

          <Grid
            mb={5}
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Grid container justifyContent='flex-end' spacing={2} mb={2}>
              <Grid>
                <Button
                  variant='contained'
                  color='error'
                  onClick={() => props.handleClose()}
                >
                  Cancel
                </Button>
              </Grid>

              <Grid>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={handleSubmit}
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>
    </div>
  );
};

export default NewComplianceForm;
