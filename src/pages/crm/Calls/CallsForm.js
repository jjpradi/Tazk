import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { capitalize } from 'lodash'
import { Autocomplete, Button, Card, Grid, TextField, Typography } from '@mui/material'
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DataAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment'
import { CreateCalls, getCallPurposeAction, getCallResultAction, getLeadCompanyNameAction } from 'redux/actions/calls_actions'
import PropTypes from 'prop-types'
import { getLeadUserNameAction } from 'redux/actions/meetings_actions'
import { getAllLeadsAction } from 'redux/actions/leadManagement_actions';
import { maxHeight } from 'utils/pageSize';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';

const CallsForm = (props) => {

    const dispatch = useDispatch()

    const {
        CallsReducers : {callPurposeList, callResultList, leadCompanyNameList},
        MeetingsReducers : {getLeadUserNameList},
        leadManagementReducers: {allLeads}
    } = useSelector((state) => state)

    useEffect(() => {
        dispatch(getCallPurposeAction())
        dispatch(getCallResultAction())
        dispatch(getLeadCompanyNameAction())
        dispatch(getLeadUserNameAction())
        dispatch(getAllLeadsAction())
        if(props?.data){
            setFormData((prevData)=> ({
                ...prevData,call_to: props?.data['Lead Name'],subject:`Outgoing call to ${props?.data['Lead Name']}`
            }))
        }
    }, [])

    const [formData, setFormData] = useState({
        call_to : null,
        related_to : null,
        call_type : null,
        call_status : 'Completed',
        call_startTime : null,
        call_duration : null,
        subject : '',
        voice_record : null,
        call_purpose : null,
        call_agenda : null,
        call_result : null,
        call_description : null,
        remarks : null,

    })

    const [formErrors, setFormErrors] = useState({
        call_to : null,
        call_startTime : null,
        subject : null,
    })

    const requiredFields = [
        'call_to',
        'call_startTime',
        'subject',
    ]

    const callType = [
        { label : 'Outbound' },
        { label : 'Inbound' },
        { label : 'Missed' }
    ]

    const handleDurationChange = (e) => {
        const value = e.target.value
        if (value.match(/^\d{0,2}:\d{0,2}$/)) {
          setFormData({...formData, call_duration : value})
          setFormErrors({...formErrors, call_duration : null})
        }
        else {
          setFormData({...formData, call_duration : value})
          setFormErrors({...formErrors, call_duration : 'Call Duration Invalid'})
        }
    }

    const handleChange = (name, value) => {
        setFormData((prev) => {
            const updatedData = { ...prev, [name]: value };

            console.log(name,value,'handle')

            console.log(formData,'formData')
          
            if (name === 'call_to' && value) {
                console.log('handle',formData?.call_to)
                updatedData.subject = `Outgoing call to ${value?.label}`
            }
            return updatedData
        });
        if (value === 'Missed') {
            setFormData((prev) => ({ ...prev, call_status: 'Incomplete' })); 
        }
        validateForm(name, value)
    }

    const validateForm = (name, value) => {
        if(!Object.keys(formErrors).includes(name)) return

        if(requiredFields.includes(name) && value === null || value === '') {
            setFormErrors({
                ...formErrors,
                [name] : capitalize(name.replace(/_/g, '')) + ' is Required'
            })
        }
        else{
            setFormErrors({...formErrors, [name] : null})
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        let isValid = true
        let formErrorsObj = {...formErrors}
        Object.keys(formData).forEach((key, i) => {
            if(requiredFields.includes(key) && (formData[key] === null || formData[key] === 'null' || formData[key] === '')) {
                isValid = false
                formErrorsObj[key] = key === 'call_startTime' ? 'Call Start Time is Required' : capitalize(key) + ' is required'
            }
            return null
        })
        setFormErrors(formErrorsObj)

        if(isValid) {
            const data = {
                call_to :  props?.type === 'details' ? props?.data.lead_id : formData.call_to.value,
                call_type : formData.call_type,
                call_status : formData.call_status,
                call_startTime : formData.call_startTime,
                call_duration : formData.call_duration,
                subject : formData.subject,
                remarks : formData.remarks,
                voice_record : formData.voice_record,
                call_purpose : formData?.call_purpose?.callPurpose_id,
                call_agenda : formData.call_agenda,
                call_result : formData?.call_result?.callResult_id,
                description : formData.call_description
            }
            await dispatch(CreateCalls(data))
            props.handleClose()
        }
        else{
            dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
        }
    }

    let options2 =
    props.type === 'details'
      ? allLeads?.map(
          (item) =>
            item.lead_id == props?.data.lead_id,
        )
      : allLeads?.map((item) => ({
          value: item['lead_id'],
          label: item.contactPersonLastName && item.contactPersonLastName !== 'null' && item.contactPersonLastName !== null 
          ? `${item['Lead Name']} - ${item.contactPersonFirstName} ${item.contactPersonLastName}`
          : `${item['Lead Name']} - ${item.contactPersonFirstName}`
        }));

    

  return (
      <Card sx={{
          p: 5,
          minHeight:maxHeight,
          maxHeight:maxHeight
      }}
      >
          <Grid container spacing={2}>
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
                                  lg: 12,
                                  md: 12,
                                  sm: 12,
                                  xs: 12
                              }}>
                              <Grid container display='flex' justifyContent='space-between'>
                                  <Grid>
                                      <Typography variant='h6' align='left' style={{ paddingBottom : '20px' }}>
                                          Log a call
                                      </Typography>
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
                              <Grid container display='flex' justifyContent='space-between'>
                                  <Grid>
                                      <Typography variant='h6' align='left' style={{ paddingBottom : '20px' }}>
                                          Call Information
                                      </Typography>
                                  </Grid>
                              </Grid> 
                          </Grid>

                          <Grid
                              size={{
                                  lg: 3,
                                  md: 4,
                                  sm: 4,
                                  xs: 12
                              }}>
                              <Autocomplete 
                                  disablePortal
                                  // disabled={props?.type}
                                  options={options2}
                                  // getOptionLabel={(option) => option['Lead Owner']}
                                  value={formData.call_to}
                                  onChange={(name, value) => handleChange('call_to', value)}
                                  renderInput={(params) => (
                                      <TextField
                                          {...params}
                                          label = 'Lead Name'
                                          required
                                          variant = 'filled'
                                          error = {formErrors.call_to !== null}
                                          helperText = {formErrors.call_to === null ? '' : 'Lead Name is Required'}
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
                                  label = 'Subject'
                                  name = 'subject'
                                  variant = 'filled'
                                  required
                                  value = {formData.subject}
                                  onChange = {(e) =>  e.preventDefault()}
                                  error = {formErrors.subject !== null}
                                  helperText = {formErrors.subject === null ? '' : 'Subject is Required'}
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
                                  label = 'Remarks'
                                  name = 'remarks'
                                  variant = 'filled'
                                  value = {formData.remarks}
                                  onChange = {(event) => handleChange('remarks', event.target.value)}
                              />
                          </Grid>

                          {/* <Grid size={{ xs: 12, sm: 4, md: 4, lg: 3 }}>
                              <Autocomplete 
                                  disablePortal
                                  options={leadCompanyNameList}
                                  getOptionLabel={(option) => option.last_name === null && option.last_name === '' ? `${option.first_name} ${option.last_name} - ${option.company_name}` : `${option.first_name} - ${option.company_name}`}
                                  value={formData.related_to}
                                  onChange={(name, value) => handleChange('related_to', value)}
                                  renderInput={(params) => (
                                      <TextField 
                                          {...params}
                                          label = 'Related To'
                                          required
                                          variant = 'filled'
                                          error = {formErrors.related_to !== null}
                                          helperText = {formErrors.related_to === null ? '' : 'Related To is Required'}
                                      />
                                  )}
                              />
                          </Grid> */}

                          <Grid
                              size={{
                                  lg: 3,
                                  md: 4,
                                  sm: 4,
                                  xs: 12
                              }}>
                              <Autocomplete 
                                  disablePortal
                                  options={callType}
                                  value={formData.call_type}
                                  onChange={(name, value) => handleChange('call_type', value ? value.label : null)}
                                  renderInput={(params) => (
                                      <TextField 
                                          {...params}
                                          label = 'Call Type'
                                          variant = 'filled'
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
                                  label = 'Outgoing Call Status'
                                  name = 'call_status'
                                  variant = 'filled'
                                  value = {formData.call_status}
                                  onChange = {(e) => e.preventDefault()}
                              />
                          </Grid>

                          <Grid
                              size={{
                                  lg: 3,
                                  md: 4,
                                  sm: 4,
                                  xs: 12
                              }}>
                              <LocalizationProvider dateAdapter={DataAdapter}>
                                  <DateTimePicker 
                                      label = 'Call Start Date & Time'
                                      format='DD/MM/YYYY hh:mm A'
                                      value = {formData.call_startTime ? moment(formData.call_startTime) : null}
                                      onChange = {(e) => {
                                          if(!e) {
                                              setFormErrors((prev) => ({...prev, call_startTime : 'Call Start Time is Required'}))
                                              setFormData((prev) => ({...prev, call_startTime : null}))
                                          }
                                          else {
                                              const formattedDate = moment(e).format('YYYY-MM-DD HH:mm')
                                              setFormErrors((prev) => ({...prev, call_startTime : null}))
                                              setFormData((prev) => ({...prev, call_startTime : formattedDate}))
                                          }
                                      }}
                                      views={['year', 'month', 'day']}
                                      slotProps={{ textField: { fullWidth: true, required: true, variant: 'filled', error: formErrors.call_startTime !== null, helperText: formErrors.call_startTime === null ? '' : formErrors.call_startTime } }}
                                  />
                              </LocalizationProvider>
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
                                  label = 'Call Duration'
                                  name = 'call_duration'
                                  variant = 'filled'
                                  value = {formData.call_duration}
                                  onChange = {handleDurationChange}
                                  placeholder = "mm:ss"
                                  InputProps={{
                                      inputProps: {
                                          maxLength: 5,
                                      },
                                  }}
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
                                  label = 'Voice Recording'
                                  name = 'voice_record'
                                  variant = 'filled'
                                  value = {formData.voice_record}
                                  onChange = {(event) => handleChange('voice_record', event.target.value)}
                              />
                          </Grid>

                          <br></br>
                          <br></br>
                          <br></br>
                          <br></br>

                          <Grid
                              size={{
                                  lg: 12,
                                  md: 12,
                                  sm: 12,
                                  xs: 12
                              }}>
                              <Grid container display='flex' justifyContent='space-between'>
                                  <Grid>
                                      <Typography variant='h6' align='left' style={{ paddingBottom : '20px' }}>
                                          Purpose Of Outgoing Call 
                                      </Typography>
                                  </Grid>
                              </Grid> 
                          </Grid>

                          <Grid
                              size={{
                                  lg: 3,
                                  md: 4,
                                  sm: 4,
                                  xs: 12
                              }}>
                              <Autocomplete 
                                  disablePortal
                                  options={callPurposeList}
                                  getOptionLabel={(option) => option.call_purpose || ''}
                                  value={formData.call_purpose}
                                  onChange={(name, value) => handleChange('call_purpose', value)}
                                  renderInput = {(params) => (
                                      <TextField 
                                          {...params}
                                          label = 'Call Purpose'
                                          variant = 'filled'
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
                                  label = 'Call Agenda'
                                  name = 'call_agenda'
                                  variant = 'filled'
                                  value = {formData.call_agenda}
                                  onChange = {(event) => handleChange('call_agenda', event.target.value)}
                              />
                          </Grid>

                          <br></br>
                          <br></br>
                          <br></br>
                          <br></br>

                          <Grid
                              size={{
                                  lg: 12,
                                  md: 12,
                                  sm: 12,
                                  xs: 12
                              }}>
                              <Grid container display='flex' justifyContent='space-between'>
                                  <Grid>
                                      <Typography variant='h6' align='left' style={{ paddingBottom : '20px' }}>
                                          Outcome Of Outgoing Call 
                                      </Typography>
                                  </Grid>
                              </Grid> 
                          </Grid>

                          <Grid
                              size={{
                                  lg: 3,
                                  md: 4,
                                  sm: 4,
                                  xs: 12
                              }}>
                              <Autocomplete 
                                  disablePortal
                                  options = {callResultList}
                                  getOptionLabel = {(option) => option.call_result || ''}
                                  value = {formData.call_result}
                                  onChange = {(name, value) => handleChange('call_result', value)}
                                  renderInput = {(params) => (
                                      <TextField 
                                          {...params}
                                          label = 'Call Result'
                                          variant = 'filled'
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
                                  label = 'Description'
                                  name = 'call_description'
                                  variant = 'filled'
                                  value = {formData.call_description}
                                  onChange = {(event) => handleChange('call_description', event.target.value)}
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

              {/* <br></br>
              <br></br> */}

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
  );
}

CallsForm.propTypes = {
    handleClose : PropTypes.func,
    data : PropTypes.object,
    type : PropTypes.string
}

export default CallsForm
