import React, { useEffect, useState } from 'react'
import { Autocomplete, Button, Card, Grid, TextField, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { getsessionStorage } from 'pages/common/login/cookies'
import { listUserCreationAction } from 'redux/actions/userCreation_actions'
import { CreateCampaignAction, getCampaignStatusAction, getCampaignTypeAction, updateCampaignAction } from 'redux/actions/campaign_actions'
import { capitalize } from 'lodash'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment'
import PropTypes from 'prop-types'
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import toMomentOrNull from 'utils/DateFixer'

const CampaignForm = (props) => {

    const dispatch = useDispatch()

    let user = getsessionStorage()

    const {
        UserCreationReducer : { createUser },
        CampaignReducers : { campaignTypeList, campaignStatusList }
    } = useSelector((state) => state)

    const [formData, setFormData] = useState({
        campaign_owner : null,
        campaign_name : null,
        campaign_type : null,
        campaign_status : null,
        campaign_start : null,
        campaign_end : null,
        campaign_cost : null,
        campaign_expRevenue : null,
        campaign_description : null
    })

    const [formErrors, setFormErrors] = useState({
        campaign_owner : null,
        campaign_name : null,
        campaign_type : null,
        campaign_status : null,
        campaign_start : null,
        campaign_end : null,
        campaign_cost : null
    })

    const requiredFields = [
        'campaign_owner',
        'campaign_name',
        'campaign_type',
        'campaign_status',
        'campaign_start',
        'campaign_end',
        'campaign_cost'
    ]

    useEffect(() => {
        dispatch(listUserCreationAction())
        dispatch(getCampaignTypeAction())
        dispatch(getCampaignStatusAction())
    }, [])

    useEffect(() => {
        if(createUser.length > 0){
          const userObj = createUser.find((e) => e.employee_id === user.employee_id)
          setFormData((prev) => ({...prev, campaign_owner: userObj}))
        }
      }, [createUser])

    useEffect(() => {
        if(props.type === 'edit'){
            setFormData({
                campaign_owner : createUser.find((d) => d.employee_id === props.data.campaign_owner),
                campaign_name : props.data.campaign_name,
                campaign_type : campaignTypeList.find((d) => d.campaign_type === props.data.campaign_type),
                campaign_status : campaignStatusList.find((d) => d.campaign_status === props.data.campaign_status),
                campaign_start : props.data.start_date,
                campaign_end : props.data.end_date,
                campaign_cost : props.data.actual_cost,
                campaign_expRevenue : props.data.expected_revenue,
                campaign_description : props.data.description
            })
        }
    }, [props.type, campaignTypeList])

    const handleChange = (name, value) => {
        setFormData({...formData, [name] : value})
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
        else {
            setFormErrors({...formErrors, [name] : null})
        }
    }

    const campaignStartAndEndDate = (key) => {
        switch(key) {
            case 'campaign_start' :
                return 'Start Date is Required'

            case 'campaign_end' :
                return 'End Date is Required'

            default :
                return capitalize(key) + ' is Required'
        }
    }

    const getCampaignTimelineMessage = (key) => {
        let oldVal
        let newVal
        let name
        switch(key) {
            case 'campaign_owner' :
                oldVal = props.data.campaign_ownerLastName ? `${props.data.campaign_ownerFirstName} ${props.data.campaign_ownerLastName}` : `${props.data.campaign_ownerFirstName}`
                newVal = formData[key]?.last_name ? `${formData[key]?.first_name} ${formData[key]?.last_name}` : `${formData[key]?.first_name}`
                name = 'Campaign Owner'
                break

            case 'campaign_name' :
                oldVal = props.data.campaign_name
                newVal = formData[key]
                name = 'Campaign Name'
                break
            
            case 'campaign_type' :
                oldVal = props.data.campaign_type
                newVal = formData[key]?.campaign_type
                name = 'Campaign Type'
                break

            case 'campaign_status' :
                oldVal = props.data.campaign_status
                newVal = formData[key]?.campaign_status
                name = 'Campaign Status'
                break

            case 'campaign_start' :
                oldVal = props.data.start_date
                newVal = formData[key]
                name = 'Start Date'
                break

            case 'campaign_end' : 
                oldVal = props.data.end_date
                newVal = formData[key]
                name = 'End Date'
                break

            case 'campaign_cost' :
                oldVal = props.data.actual_cost
                newVal = formData[key]
                name = 'Cost'
                break
            
            case 'campaign_expRevenue' :
                oldVal = props.data.expected_revenue === null ? '-' : props.data.expected_revenue
                newVal = formData[key] === null ? '-' : formData[key]
                name = 'Expected Revenue'
                break

            case 'campaign_description' :
                oldVal = props.data.description === null ? '-' : props.data.description
                newVal = formData[key] === null ? '-' : formData[key]
                name = 'Description'
                break

            default :
                oldVal = ''
                newVal = ''
                name = ''
                break
        }

        if(oldVal !== newVal) {
            let message = `${name} changed from ${oldVal} to ${newVal}`
            return message
        }
        else {
            return null
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        let isValid = true
        let formErrorsObj = {...formErrors}

        Object.keys(formData).forEach((key, i) => {
            if(requiredFields.includes(key) && (formData[key] === null || formData[key] === 'null' || formData[key] === '')) {
                isValid = false
                formErrorsObj[key] = campaignStartAndEndDate(key)
            }
            return null
        })
        setFormErrors(formErrorsObj)

        if(isValid) {
            const data = {
                campaign_owner : formData.campaign_owner.employee_id,
                campaign_name : formData.campaign_name,
                campaign_type : formData.campaign_type.type_id,
                campaign_status : formData.campaign_status.status_id,
                start_date : formData.campaign_start,
                end_date : formData.campaign_end,
                actual_cost : formData.campaign_cost,
                expected_revenue : formData.campaign_expRevenue ? formData.campaign_expRevenue : null,
                description : formData.campaign_description ? formData.campaign_description : null
            }

            if(props.type === 'edit'){
                let campaignTimelineMsg = []
                await Object.keys(formData).forEach(async (key) => {
                    const messages = await getCampaignTimelineMessage(key)
                    if(messages !== null) {
                        campaignTimelineMsg.push(messages)
                    }
                })
                
                await dispatch(updateCampaignAction({data : data, timeline_message : campaignTimelineMsg}, props.data.campaign_id))
                props.handleClose()
            }
            else{
                await dispatch(CreateCampaignAction(data))
                props.handleClose()
            }
        }
        else{
          dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
        }
    }

  return (
      <Card sx={{ p : 3 }}>
          <Grid container spacing={2}>
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
                              Campaign
                          </Typography>
                      </Grid>
                  </Grid>
              </Grid>

              <Grid
                  size={{
                      lg: 10,
                      md: 10,
                      sm: 10,
                      xs: 12
                  }}>
                  <Grid container spacing={3}>
                      <Grid
                          size={{
                              lg: 3,
                              md: 4,
                              sm: 4,
                              xs: 12
                          }}>
                          <Autocomplete 
                              disablePortal
                              defaultValue = {user}
                              options = {createUser}
                              getOptionLabel = {(option) => option.last_name ? option.first_name + option.last_name : option.first_name || ''}
                              value = {formData.campaign_owner}
                              onChange = {(name, value) => handleChange('campaign_owner', value)}
                              renderInput = {(params) => (
                                  <TextField 
                                      {...params}
                                      required
                                      label = 'Campaign Owner'
                                      variant = 'filled'
                                      error = {formErrors.campaign_owner !== null}
                                      helperText = {formErrors.campaign_owner === null ? '' : 'Campaign Owner is Required'}
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
                              required
                              label = 'Campaign Name'
                              variant = 'filled'
                              value = {formData.campaign_name}
                              onChange = {(event) => handleChange('campaign_name', event.target.value)}
                              error = {formErrors.campaign_name !== null}
                              helperText = {formErrors.campaign_name === null ? '' : 'Campaign Name is Required'}
                          />
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
                              options = {campaignTypeList}
                              getOptionLabel = {(option) => option.campaign_type || ''}
                              value = {formData.campaign_type}
                              onChange = {(name, value) => handleChange('campaign_type', value)}
                              renderInput = {(params) => (
                                  <TextField 
                                      {...params}
                                      required
                                      label = 'Campaign Type'
                                      variant = 'filled'
                                      error = {formErrors.campaign_type !== null}
                                      helperText = {formErrors.campaign_type === null ? '' : 'Campaign Type is Required'}
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
                          <Autocomplete 
                              disablePortal
                              options = {campaignStatusList}
                              getOptionLabel = {(option) => option.campaign_status || ''}
                              value = {formData.campaign_status}
                              onChange = {(name, value) => handleChange('campaign_status', value)}
                              renderInput = {(params) => (
                                  <TextField 
                                      {...params}
                                      required
                                      label = 'Campaign Status'
                                      variant = 'filled'
                                      error = {formErrors.campaign_status !== null}
                                      helperText = {formErrors.campaign_status === null ? '' : 'Campaign Status is Required'}
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
                          <LocalizationProvider dateAdapter = {DateAdapter}>
                              <DatePicker 
                                  label = 'Start Date'
                                  format='DD/MM/YYYY'
                                  value = {toMomentOrNull(formData.campaign_start)}
                                  onChange = {(e) => {
                                      if(!e) {
                                          setFormErrors((prev) => ({...prev, campaign_start : 'Start Date is Required'}))
                                          setFormData((prev) => ({...prev, campaign_start : null}))
                                      }
                                      else {
                                          const formattedDate = moment(e).format('YYYY-MM-DD')
                                          setFormErrors((prev) => ({...prev, campaign_start : null}))
                                          setFormData((prev) => ({...prev, campaign_start : formattedDate}))
                                      }
                                  }}
                                  views={['year', 'month', 'day']}
                                  shouldDisableDate = {(date) => formData.campaign_end && moment(date).isAfter(moment(formData.campaign_end), 'day')}
                                  slotProps={{ textField: { fullWidth: true, required: true, variant: 'filled', error: formErrors.campaign_start !== null, helperText: formErrors.campaign_start === null ? '' : formErrors.campaign_start } }}
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
                          <LocalizationProvider dateAdapter = {DateAdapter}>
                              <DatePicker 
                                  label = 'End Date'
                                  value = {toMomentOrNull(formData.campaign_end)}
                                  format='DD/MM/YYYY'
                                  onChange = {(e) => {
                                      if(!e) {
                                          setFormErrors((prev) => ({...prev, campaign_end : 'End Date is Required'}))
                                          setFormData((prev) => ({...prev, campaign_end : null}))
                                      }
                                      else {
                                          const formattedDate = moment(e).format('YYYY-MM-DD')
                                          setFormErrors((prev) => ({...prev, campaign_end : null}))
                                          setFormData((prev) => ({...prev, campaign_end : formattedDate}))
                                      }
                                  }}
                                  views={['year', 'month', 'day']}
                                  shouldDisableDate = {(date) => formData.campaign_start && moment(date).isBefore(moment(formData.campaign_start), 'day')}
                                  slotProps={{ textField: { fullWidth: true, required: true, variant: 'filled', error: formErrors.campaign_end !== null, helperText: formErrors.campaign_end === null ? '' : formErrors.campaign_end } }}
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
                              required
                              type = 'number'
                              label = 'Cost'
                              variant = 'filled'
                              value = {formData.campaign_cost}
                              onChange = {(event) => handleChange('campaign_cost', event.target.value)}
                              error = {formErrors.campaign_cost !== null}
                              helperText = {formErrors.campaign_cost === null ? '' : 'Cost is Required'}
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
                              type = 'number'
                              label = 'Expected Revenue'
                              variant = 'filled'
                              value = {formData.campaign_expRevenue}
                              onChange = {(event) => handleChange('campaign_expRevenue', event.target.value)}
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
                                      Description Information
                                  </Typography>
                              </Grid>
                          </Grid>
                      </Grid>

                      <Grid
                          size={{
                              lg: 6,
                              md: 6,
                              sm: 6,
                              xs: 12
                          }}>
                          <TextField 
                              fullWidth
                              multiline
                              label = 'Description'
                              variant = 'filled'
                              value = {formData.campaign_description}
                              onChange = {(event) => handleChange('campaign_description', event.target.value)}
                          />
                      </Grid>
                      
                  </Grid>
              </Grid>

              <Grid
                  size={{
                      lg: 2,
                      md: 2,
                      sm: 2,
                      xs: 2
                  }}></Grid>

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
      </Card>
  );
}

CampaignForm.propTypes = {
    handleClose : PropTypes.func,
    type : PropTypes.string,
    data : PropTypes.object,
}

export default CampaignForm
