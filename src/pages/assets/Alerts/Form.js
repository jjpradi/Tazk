import React, { useState, useEffect, useContext } from 'react';
import { Button, TextField, Grid, Typography, FormControlLabel, Card, Checkbox, FormHelperText, Switch } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { useDispatch, useSelector } from 'react-redux';
import { CreateAlertsAction, getAlertsEmployeeFilterAction, getSearchAlertsEmployeeFilterAction, setSearchAlertsEmployeeFilterAction } from 'redux/actions/asst_alerts_actions';
import { capitalize } from 'lodash';
import { ListAssetTimeline, getAllAssetAction } from 'redux/actions/asset_actions';
import PropTypes from 'prop-types'
import { getRenewalsLovAction } from 'redux/actions/renewals_actions';
import CommonUserAutoComplete from 'utils/commonAutoCompleteForUser';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { maxHeight } from 'utils/pageSize';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';

function AlertsForm(props) {

    const dispatch = useDispatch()

    const {
        setModalTypeHandler,
        setLoaderStatusHandler
    } = useContext(CreateNewButtonContext)

    const [formData, setFormData] = useState({
        renewalType : null,
        assetName: null,
        title : null,
        alertReceiver : null,
        dueMessage : null,
        alertsBefore : null,
        days : null,
        time : null,
        email : false,
        sms : false,
        repeat : false
    })

    const [formErrors, setFormErrors] = useState({
        renewalType : null,
        assetName: null,
        alertReceiver : null,
        alertsBefore : null,
        email : null,
        sms : null,
        days : null,
        time : null
    })

    const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('')
    const [value, setValue] = useState([])
    const [selectedAll, setSelectedAll] = useState(false)
    const [assetId, setAssetId] = useState(null)
    const compactFormWidth = { width: '100%', maxWidth: { xs: '100%', md: 920, lg: 1020 } }

    const requiredFields = [
        'renewalType',
        'assetName',
        'alertReceiver',
        'alertsBefore'
    ]

    const requiredFieldsRepeat = [
        'renewalType',
        'assetName',
        'alertReceiver',
        'alertsBefore',
        'days',
        'time'
    ]

    const requiredFieldsSubscription = [
        'renewalType',
        'alertReceiver',
        'alertsBefore'
    ]

    const requiredFieldsSubscriptionRepeat = [
        'renewalType',
        'alertReceiver',
        'alertsBefore',
        'days',
        'time'
    ]

    const alertsBeforeDays = [
        { label : '10 Days' },
        { label : '15 Days' },
        { label : '30 Days' },
        { label : '60 Days' }
    ]

    const alertsDays = [
        { label : '1 Day Once' },
        { label : '2 Days Once' }
    ]

    const { 
        AssetReducers : { getAssetName },
        RenewalsReducers : { getRenewalsLov },
        AlertsReducers : { getAlertsEmployeeFilter, getSearchAlertsEmployeeFilter }
    } = useSelector((state) => state)

    useEffect(() => {
        const data = {
            searchString : ''
        }
        dispatch(getAllAssetAction())
        dispatch(getRenewalsLovAction())
        dispatch(getAlertsEmployeeFilterAction(data))
    }, [])

    useEffect(() => {
        if(props?.type === 'alertsDetail') {
            setFormData({...formData, assetName : props?.assetData})
        }
        else if(props?.type === 'renewalAlert' && getRenewalsLov?.length > 0 && getAssetName?.length > 0) {
            const type = getRenewalsLov.find((e) => e.type_id === props.data.type_id)
            const asset = getAssetName.find((e) => e.asset_id === props.data.asset_id)

            setFormData((prev) => ({
                ...prev,
                renewalType : type,
                assetName : asset,
                title : type ? `${props.data.type} Renewal Due` : null,
                dueMessage : type ? `Your ${props.data.type} expire soon. Please renew the insurance.` : null
            }))
        }
    }, [props, getRenewalsLov, getAssetName])

    const requestSearchEmployeeFilter = (val) => {
        setSearchValEmployeeFilter(val)
        dispatch(setSearchAlertsEmployeeFilterAction([]))

        if(!val) {
            return
        }

        let data = {
            searchString : val,
        }
        dispatch(getSearchAlertsEmployeeFilterAction(
            data,
            setModalTypeHandler,
            setLoaderStatusHandler
        ))
    }

    const handleChangeEmployeeName = (val) =>{
        setValue(val)
        setFormData((prev) => ({
            ...prev,
            alertReceiver: val || null
        }))

        if(val?.length > 0) {
            setFormErrors({...formErrors, alertReceiver : null})
        }
    }
  
    const handleChange = (name, value) => {
        setFormData((prev) => {
            const updatedData = {...prev, [name] : value}

            if(name === 'renewalType') {
                updatedData.title = value ? `${value?.renewal_types} Renew Due` : null
                updatedData.dueMessage = value ? `Your ${value.renewal_types} expire soon. Please renew the insurance.` : null

                if (value?.renewal_types !== prev.renewalType?.renewal_types && props.type !== 'alertsDetail') {
                    updatedData.assetName = null
                    updatedData.alertReceiver = null
                    updatedData.alertsBefore = null
                    updatedData.days = null
                    updatedData.time = null
                    updatedData.email = false
                    updatedData.sms = false
                }
            }
            return updatedData
        })
        validateForm(name, value)
    }

    const handleEmailSmsChange = (name, value) => {
        setFormData((prev) => ({...prev, [name] : value}))
        setFormErrors((prev) => ({...prev, email : null, sms : null}))
    }

    const validateForm = (name, value) => {
        if(!Object.keys(formErrors).includes(name)) return

        const isInsuranceOrWarranty = formData.renewalType?.renewal_types === 'Insurance' || formData.renewalType?.renewal_types === 'Warranty' || formData.renewalType === null
        let activeRequired
        if (isInsuranceOrWarranty) {
            activeRequired = formData.repeat ? requiredFieldsRepeat : requiredFields
        } else {
            activeRequired = formData.repeat ? requiredFieldsSubscriptionRepeat : requiredFieldsSubscription
        }

        if (activeRequired.includes(name) && (value === null || value === '')) {
            setFormErrors({
                ...formErrors,
                [name] : capitalize(name.replace(/_/g, '')) + ' is Required!'
            })
        } else {
            setFormErrors({...formErrors, [name] : null})
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        let isValid = true;
        let formErrorsObj = {...formErrors}
        Object.keys(formData).forEach((key, i) => {
            if(formData.renewalType?.renewal_types === 'Insurance' || formData.renewalType?.renewal_types === 'Warranty' || formData.renewalType === null) {
                if(formData.repeat) {
                    if(requiredFieldsRepeat.includes(key) && (formData[key] === null || formData[key] === 'null' || formData[key] === '')) {  
                        isValid = false;
                        formErrorsObj[key] = capitalize(key) + ' is required'
                    }
                }
                else {
                    if(requiredFields.includes(key) && (formData[key] === null || formData[key] === 'null' || formData[key] === '')) {  
                        isValid = false;
                        formErrorsObj[key] = capitalize(key) + ' is required'
                    }
                }
            }
            else {
                if(formData.repeat) {
                    if(requiredFieldsSubscriptionRepeat.includes(key) && (formData[key] === null || formData[key] === 'null' || formData[key] === '')) {  
                        isValid = false;
                        formErrorsObj[key] = capitalize(key) + ' is required'
                    }
                }
                else {
                    if(requiredFieldsSubscription.includes(key) && (formData[key] === null || formData[key] === 'null' || formData[key] === '')) {  
                        isValid = false;
                        formErrorsObj[key] = capitalize(key) + ' is required'
                    }
                }
            }
        })

        if(formData.email === false && formData.sms === false) {
            isValid = false
            formErrorsObj.email = 'EMAIL is Required!'
            formErrorsObj.sms = 'SMS is Required!'
        }
        
        setFormErrors(formErrorsObj)

        if(isValid) {
            const data = {
                renewalType : formData.renewalType?.type_id || null,
                asset_id : formData.assetName ? formData.assetName.asset_id : null,
                title : formData.title,
                alertReceiver : formData.alertReceiver && Array.isArray(value)
                    ? JSON.stringify(value.map((d) => d.employee_id))
                    : null,
                dueMessage : formData.dueMessage,
                alertsBefore : formData.alertsBefore,
                days : formData.repeat ? formData.days : null,
                repeat : formData.repeat ? 1 : 0,
                date : formData.repeat ? formData.days : null,
                time : formData.repeat ? formData.time : null,
                email : formData.email ? 1 : 0,
                sms : formData.sms ? 1 : 0
            }

            const result = await dispatch(CreateAlertsAction(data))
            if (result === 'API_FINISHED_ERROR') return

            if (props.handleFormClose) {
                props.handleFormClose(null)
            }
            else if (props.handleCancel) {
                props.handleCancel()
            }
        }
        else {
            dispatch(OpenalertActions({ msg : requiredFieldsAlertMessage, severity : 'warning' }))
        }
    }

  return (
      <Card 
          sx = {{
              p : 5,
              '& .MuiTextField-root': {
                  width: '100%'
              },
              '& .MuiInputBase-root': {
                  minHeight: 58
              },
              '& .MuiInputBase-input': {
                  fontSize: '0.95rem'
              },
              minHeight : props?.type === 'renewalAlert' || props?.type === 'alertsDetail' ? '' : maxHeight,
              maxHeight : props?.type === 'renewalAlert' || props?.type === 'alertsDetail' ? '': maxHeight,
              overflowY:'auto',

          }}
      >
         
              <Grid
                  size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                  }}>
                  <Typography variant='h6' align='left' style={{ paddingBottom: '20px' }}>
                      Alerts Reminder
                  </Typography>
              </Grid>
        
             
                 
                  <Grid container spacing={3} sx={{ ...compactFormWidth, pb: '16px' }}>
                          <Grid
                              size={{
                                  lg: 4,
                                  md: 4,
                                  sm: 12,
                                  xs: 12
                              }}
                              >
                              <Autocomplete
                                  fullWidth
                                  options = {getRenewalsLov || []}
                                  getOptionLabel = {(option) => option.renewal_types || ''}
                                  value = {formData.renewalType}
                                  onChange = {(name, value) => handleChange('renewalType', value)}
                                  disabled = {props.type === 'renewalAlert' ? true : false}
                                  renderInput = {(params) => (
                                      <TextField
                                          {...params}
                                          required
                                          label = 'Renewal Type'
                                          variant = 'filled'
                                          error = {formErrors.renewalType !== null}
                                          helperText = {formErrors.renewalType === null ? '' : 'Renewal Type is Required!'}
                                      />
                                  )}
                              />
                          </Grid>
                          
                          {
                                  <Grid
                                      size={{
                                          lg: 4,
                                          md: 4,
                                          sm: 12,
                                          xs: 12
                                      }}>
                                      <Autocomplete
                                          fullWidth
                                          options = {getAssetName || []}
                                          getOptionLabel={(option) => {
                                              if (!option) return ''
                                              return typeof option === 'string' ? option : `${option.Name} - ${option.Code}`
                                          }}
                                          renderOption={(props, option) => (
                                              <li {...props}>
                                                  {`${option.Name} - ${option.Code} - ${option['Asset Owner']} - ${option.Location}`}
                                              </li>
                                          )}
                                          value = {formData.assetName}
                                          onChange = {(name, value) => handleChange('assetName', value)}
                                          isOptionEqualToValue={(option, value) => option?.asset_id === value?.asset_id}
                                          disabled = {props.type === 'alertsDetail' || props.type === 'renewalAlert' ? true : false}
                                          renderInput = {(params) => (
                                              <TextField 
                                                  {...params}
                                                  required
                                                  label = 'Asset Name'
                                                  variant = 'filled'
                                                  error = {formErrors.assetName !== null}
                                                  helperText = {formErrors.assetName === null ? '' : 'Asset Name is required'}
                                              />
                                          )}
                                      />
                                  </Grid>
                              
                          }

                          <Grid
                              size={{
                                  lg: 4,
                                  md: 4,
                                  sm: 12,
                                  xs: 12
                              }}>
                              <TextField 
                                  fullWidth
                                  label = 'Title'
                                  name = 'title'
                                  variant = 'filled'
                                  value = {formData.title || ''}
                                  onChange = {(e) => e.preventDefault()}
                                  disabled = {props.type === 'renewalAlert' ? true : false}
                              />
                          </Grid>

                      </Grid>

                      <Grid container  spacing={2} sx={{ mt: 0.5, ...compactFormWidth,paddingBottom:'12px'}}>
                          <Grid
                              size={{
                                  lg: 4,
                                  md: 4,
                                  sm: 12,
                                  xs: 12
                              }}
                              sx={{
                                  '& .MuiAutocomplete-root .MuiInputBase-root': {
                                      minHeight: '58px !important',
                                      maxHeight: '58px !important',
                                      alignItems: 'center'
                                  }
                              }}>
                              <CommonUserAutoComplete 
                                  searchVal = {searchValEmployeeFilter}
                                  requestSearch = {requestSearchEmployeeFilter}
                                  value = {value}
                                  setValue = {handleChangeEmployeeName}
                                  error = {formErrors.alertReceiver}
                                  type = {getAlertsEmployeeFilter}
                                  searchType = {getSearchAlertsEmployeeFilter}
                                  selectedAll = {selectedAll}
                                  setSelectedAll = {setSelectedAll}
                                  isMandatory = {true}
                                  labelName = 'Alert Receiver'
                              />
                          </Grid>
                      </Grid>
              
                      <Grid container spacing={2} sx={{ mt: 0.5, ...compactFormWidth,paddingBottom:'12px'}}>
                          <Grid
                              size={{
                                  lg: 8,
                                  md: 12,
                                  sm: 12,
                                  xs: 12
                              }}
                          >
                              <TextField
                                  fullWidth
                                  multiline
                                  label = 'Description'
                                  name = 'dueMessage'
                                  variant = 'filled'
                                  rows = {5}
                                  value = {formData.dueMessage || ''}
                                  onChange = {(event) => handleChange('dueMessage', event.target.value)}
                              />

                          </Grid>
                      </Grid>
              
                      <Grid container spacing={3}  sx={{ mt: 1  , ...compactFormWidth,paddingBottom:'16px'}}alignItems='center'>                       
                                  <Grid
                                      size={{
                                          lg: 4,
                                          md: 4,
                                          sm:6,
                                          xs: 12
                                      }}>
                              <Autocomplete
                                  fullWidth
                                  options = {alertsBeforeDays}
                                  value = {formData.alertsBefore ? `${formData.alertsBefore} Days` : ''}
                                  onChange = {(name, value) => {
                                      const numericValue = value ? parseInt(value.label.split(' ')[0], 10) : null
                                      handleChange('alertsBefore', numericValue)
                                  }}
                                  renderInput = {(params) => (
                                      <TextField
                                          {...params}
                                          required
                                          label = 'Alerts Before'
                                          variant = 'filled'
                                          error = {formErrors.alertsBefore !== null}
                                          helperText = {formErrors.alertsBefore === null ? '' : 'Alerts Before is Required'}
                                          onChange = {(event) => {
                                              const numericValue = event.target.value ? parseInt(event.target.value.split(' ')[0], 10) : null
                                              handleChange('alertsBefore', numericValue)
                                          }}
                                      />
                                  )}
                              />
                          </Grid>

                          <Grid
                              size={{
                                  lg: 3,
                                  md: 4,
                                  sm: 6,
                                  xs: 12
                              }}>
                              <FormControlLabel
                                  label = 'Repeat'
                                  control = {
                                      <Switch
                                          checked = {formData.repeat}
                                          onChange = {() => setFormData({...formData, repeat: !formData.repeat})}
                                      />
                                  }
                              />
                          </Grid>
                          
                          {
                              formData.repeat &&
                                  <>
                          <Grid
                              size={{
                                  lg: 3,
                                  md: 4,
                                  sm:6,
                                  xs: 12
                              }}>
                                          <Autocomplete
                                              fullWidth
                                              options = {alertsDays}
                                              value = {formData.days ? `${formData.days} Days Once` : ''}
                                              onChange = {(event, value) => {
                                                  const numericValue = value ? parseInt(value.label.split(' ')[0], 10) : null
                                                  handleChange('days', numericValue)
                                              }}
                                              renderInput = {(params) => (
                                                  <TextField
                                                      {...params}
                                                 
                                                      required
                                                      variant = 'filled'
                                                      label = 'Days'
                                                      onChange = {(event) => {
                                                          const numericValue = event.target.value ? parseInt(event.target.value.split(' ')[0], 10) : null
                                                          handleChange('days', numericValue)
                                                      }}
                                                      error = {formErrors.days !== null}
                                                      helperText = {formErrors.days === null ? '' : 'Days is Required!'}
                                                  />
                                              )}
                                          />
                                      </Grid>

                                      <Grid
                                          size={{
                                              lg: 3,
                                              md: 4,
                                              sm: 6,
                                              xs: 12
                                          }}>
                                          <TextField
                                              fullWidth
                                              required
                                              label = 'Time'
                                              name = 'time'
                                              type = 'time'
                                              variant = 'filled' 
                                              value = {formData.time || ''}
                                              onChange = {(event) => handleChange('time', event.target.value)}
                                              error = {formErrors.time !== null}
                                              helperText = {formErrors.time === null ? '' : 'Time is Required!'}
                                          />
                                      </Grid>
                                  </>
                          }
                      </Grid>
                    <Grid container sx={{ mt: 1  , ...compactFormWidth,paddingBottom:'16px'}}>
                      <Grid
                          size={{
                              lg: 12,
                              md: 12,
                              sm: 12,
                              xs: 12
                          }}
                          >
                          <Typography variant='h6' align='left'>
                              Send Alerts Through
                          </Typography>
                      </Grid>
                     </Grid>
              
                     
                          <Grid container  sx={{ mt: 1, ...compactFormWidth,paddingBottom:'16px'}} spacing={2} alignItems="center">
                              <Grid
                                  size={{
                                      lg: 3,
                                      md: 4,
                                      sm: 6,
                                      xs: 12
                                  }}>
                                  <FormControlLabel 
                                      control = {
                                          <Checkbox 
                                              required
                                              checked = {formData.email}
                                              onChange = {() => handleEmailSmsChange('email', !formData.email)}
                                          />
                                      }
                                      label = 'EMAIL'
                                      labelPlacement = 'end'
                                        sx={{
                                            '& .MuiFormControlLabel-asterisk': {
                                                color: 'red'
                                            }
                                        }}
                                  />
                                  {
                                      formErrors.email !== null &&  (
                                          <FormHelperText sx={{ color : '#d32f2f' }}>
                                              EMAIL is Required!
                                          </FormHelperText>
                                      )
                                  }
                              </Grid>

                              <Grid
                                  size={{
                                      lg: 3,
                                      md: 4,
                                      sm: 6,
                                      xs: 12
                                  }}>
                                  <FormControlLabel 
                                      control = {
                                          <Checkbox 
                                              required
                                              checked = {formData.sms}
                                              onChange = {() => handleEmailSmsChange('sms', !formData.sms)}
                                          />
                                      }
                                      label = 'SMS'
                                      labelPlacement = 'end'
                                    sx={{
                                        '& .MuiFormControlLabel-asterisk': {
                                            color: 'red'
                                        }
                                    }}
                                  />
                                  {
                                      formErrors.sms !== null && (
                                          <FormHelperText sx={{ color : '#d32f2f' }}>
                                              SMS is Required!
                                          </FormHelperText>
                                      )
                                  }
                              </Grid>
                          </Grid>

              
                  <Grid container justifyContent='flex-end' spacing={1.5} sx={{ width: '100%', maxWidth: '100%', pb: '16px' }}>
                      <Grid size="auto">
                          <Button 
                              variant = 'contained' 
                              color = 'error' 
                              size = 'large'
                              sx = {{ minWidth: 100, px: 3, py: 2, borderRadius: '12px' }}
                              onClick = {() => props.handleCancel()}
                          >
                              Cancel
                          </Button>
                      </Grid>

                      <Grid size="auto">
                          <Button 
                              variant = 'contained' 
                              color = 'primary' 
                              size = 'large'
                              sx = {{ minWidth: 100, px: 3, py: 2, borderRadius: '12px' }}
                              onClick = {handleSubmit}
                          >
                              Submit
                          </Button>
                      </Grid>
                  </Grid>
             

       
      </Card>
  );
}

AlertsForm.propTypes = {
  type : PropTypes.string,
  assetData : PropTypes.object,
  handleFormClose : PropTypes.func,
  handleCancel : PropTypes.func
}


export default AlertsForm;
