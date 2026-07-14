import React, { useEffect, useState } from 'react'
import { Autocomplete, Button, Card, Grid, TextField, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { createCompliancesAction, getComplianceLovAction } from 'redux/actions/compliances_actions'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import AttachmentField from 'pages/common/Timesheet/Attachment'
import { capitalize } from 'lodash'
import moment from 'moment'
import { emailValidation, phoneValidation } from 'components/regexFunction'
import PropTypes from 'prop-types'
import { maxHeight } from 'utils/pageSize'
import { OpenalertActions } from 'redux/actions/alert_actions'
import { requiredFieldsAlertMessage } from 'utils/content'

const CompliancesForm = (props) => {

    const dispatch = useDispatch()

    const [formData, setFormData] = useState({
        compliances : null,
        complianceType : null,
        customerName : null,
        description : null,
        startDate : null,
        endDate : null,
        contactPerson : null,
        email : null,
        phoneNumber : null,
        comments : null
    })

    const [formErrors, setFormErrors] = useState({
        compliances : null,
        complianceType : null,
        customerName : null,
        startDate : null,
        endDate : null,
        contactPerson : null,
        email : null,
        phoneNumber : null,
        files : null
    })

    const requiredFields = [
        'compliances',
        'complianceType',
        'customerName',
        'startDate',
        'endDate',
        'contactPerson',
        'email',
        'phoneNumber'
    ]

    const [compliancesFiles, setCompliancesFiles] = useState({
        compliancesFiles : [],
        compliancesFilePreviews : []
    })

    const {
        compliancesReducers : { compliancesLov }
    } = useSelector((state) => state)

    useEffect(() => {
        dispatch(getComplianceLovAction())
    }, [])

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
    
    const compliances = [
        { label : 'Statutory Compliance' },
        { label : 'HR Compliance' }
    ]

    const handleChange = (name, value) => {
        const updateFormData = {...formData, [name] : value}
        setFormData(updateFormData)
        validateForm(name, value)
    }

    const validateForm = (name, value) => {
        if(!Object.keys(formErrors).includes(name)) return

        if(name === 'email') {
            if(!emailValidation(value)) {
                setFormErrors({...formErrors, [name] : 'Invalid Email!'})
            }
            else {
                setFormErrors({...formErrors, [name] : null})
            }
            return
        }

        if(name === 'phoneNumber') {
            if(!phoneValidation(value)) {
                setFormErrors({...formErrors, [name] : 'Invalid Phone Number!'})
            }
            else {
                setFormErrors({...formErrors, [name] : null})
            }
            return
        }

        if(requiredFields.includes(name) && value === null || value === '') {
            setFormErrors({
                ...formErrors,
                [name] : capitalize(name.replace(/_/g, '')) + ' is Required!'
            })
        }
        else {
            setFormErrors({...formErrors, [name] : null})
        }
    }

    const handleDateChange = (date, field) => {
        if(!date) {
            setFormErrors((prev) => ({
                ...prev,
                [field] : `${field === 'startDate' ? 'Start Date' : 'End Date'} is Required!`
            }))
            setFormData((prev) => ({
                ...prev,
                [field] : null
            }))
        }
        else {
            const formattedDate = moment(date).format('YYYY-MM-DD')
            setFormErrors((prev) => ({
                ...prev,
                [field] : null
            }))
            setFormData((prev) => ({
                ...prev,
                [field] : formattedDate
            }))
        }
    }

    const compliancesStartDateAndEndDate = (key) => {
        switch(key) {
            case 'startDate' :
                return 'Start Date is Required!'

            case 'endDate' : 
                return 'End Date is Required!'

            case 'phoneNumber' :
                return 'Phone Number is Required!'

            default :
                return capitalize(key) + ' is Required!'
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        let isValid = true
        let formErrorObj = {...formErrors}
        
        Object.keys(formData).forEach((key, i) => {
            if(requiredFields.includes(key) && (formData[key] === null || formData[key] === 'null' || formData[key] === '')) {
                isValid = false
                formErrorObj[key] = compliancesStartDateAndEndDate(key)
            }
            if(compliancesFiles.compliancesFilePreviews.length > 1) {
                isValid = false
                formErrorObj.files = 'Only 1 Files are allowed!'
            }
            return null
        })
        setFormErrors(formErrorObj)

        if(isValid) {
            const formValues = new FormData()
            let compliancesFile = []
            compliancesFiles.compliancesFiles.map((file) => {
                formValues.append('compliancesFiles', file)
                compliancesFile.push({
                    fileName : file.name,
                    type : file.type
                })
            })
            formValues.append('compliancesName', formData.compliances)
            formValues.append('complianceType', formData.complianceType.compliance_id)
            formValues.append('customerName', formData.customerName)
            formValues.append('description', formData.description ? formData.description : null)
            formValues.append('startDate', formData.startDate)
            formValues.append('endDate', formData.endDate)
            formValues.append('contactPerson', formData.contactPerson)
            formValues.append('email', formData.email)
            formValues.append('phoneNumber', formData.phoneNumber)
            formValues.append('comments', formData.comments)
            formValues.append('image', JSON.stringify(compliancesFile))

            await dispatch(createCompliancesAction(formValues))
            props.handleClose()
        }
        else {
            dispatch(OpenalertActions({ msg : requiredFieldsAlertMessage, severity : 'warning' }))
        }
    }

  return (
      <Card 
          sx = {{
              p : 5,
              minHeight : maxHeight,
              maxHeight : maxHeight
          }}
      >
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
                              Compliances
                          </Typography>
                      </Grid>
                  </Grid>
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
                          <Autocomplete
                              options = {compliances}
                              value = {formData.compliances}
                              onChange = {(name, value) => handleChange('compliances', value ? value.label : null)}
                              renderInput = {(params) => (
                                  <TextField 
                                      {...params}
                                      required
                                      label = 'Compliances'
                                      variant = 'filled'
                                      error = {formErrors.compliances !== null}
                                      helperText = {formErrors.compliances === null ? '' : 'Compliances is Required!'}
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
                              options = {compliancesLov}
                              getOptionLabel = {(option) => option.compliance_name || ''}
                              value = {formData.complianceType}
                              onChange = {(name, value) => handleChange('complianceType', value)}
                              renderInput = {(params) => (
                                  <TextField 
                                      {...params}
                                      required
                                      label = 'Compliance Type'
                                      variant = 'filled'
                                      error = {formErrors.complianceType !== null}
                                      helperText = {formErrors.complianceType === null ? '' : 'Compliance Type is Required!'}
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
                              label = 'Customer'
                              variant = 'filled'
                              value = {formData.customerName}
                              onChange = {(event) => handleChange('customerName', event.target.value)}
                              error = {formErrors.customerName !== null}
                              helperText = {formErrors.customerName === null ? '' : 'Customer is Required!'}
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
                              variant = 'filled'
                              value = {formData.description}
                              onChange = {(event) => handleChange('description', event.target.value)}
                          />
                      </Grid>

                      <Grid
                          size={{
                              lg: 3,
                              md: 4,
                              sm: 4,
                              xs: 12
                          }}>
                          <LocalizationProvider dateAdapter={DateAdapter}>
                              <DatePicker 
                                  label = 'Start Date'
                                  value = {formData.startDate}
                                  onChange = {(date) => handleDateChange(date, 'startDate')}
                                  shouldDisableDate = {(date) => formData.endDate && moment(date).isAfter(moment(formData.endDate), 'day')}
                                  slotProps={{ textField: { fullWidth: true, required: true, variant: 'filled', onKeyDown: (e) => e.preventDefault(), error: formErrors.startDate !== null, helperText: formErrors.startDate === null ? '' : formErrors.startDate } }}
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
                          <LocalizationProvider dateAdapter={DateAdapter}>
                              <DatePicker 
                                  label = 'End Date'
                                  value = {formData.endDate}
                                  onChange = {(date) => handleDateChange(date, 'endDate')}
                                  shouldDisableDate = {(date) => formData.startDate && moment(date).isBefore(moment(formData.startDate), 'day')}
                                  slotProps={{ textField: { fullWidth: true, required: true, variant: 'filled', onKeyDown: (e) => e.preventDefault(), error: formErrors.endDate !== null, helperText: formErrors.endDate === null ? '' : formErrors.endDate } }}
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
                              label = 'Contact Person'
                              variant = 'filled'
                              value = {formData.contactPerson}
                              onChange = {(event) => handleChange('contactPerson', event.target.value)}
                              error = {formErrors.contactPerson !== null}
                              helperText = {formErrors.contactPerson === null ? '' : 'Contact Person is Required!'}
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
                              label = 'Email'
                              variant = 'filled'
                              value = {formData.email}
                              onChange = {(event) => handleChange('email', event.target.value)}
                              error = {formErrors.email !== null}
                              helperText = {formErrors.email === null ? '' : formErrors.email}
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
                              label = 'Phone Number'
                              variant = 'filled'
                              type = 'number'
                              value = {formData.phoneNumber}
                              onChange = {(event) => handleChange('phoneNumber', event.target.value)}
                              error = {formErrors.phoneNumber !== null}
                              helperText = {formErrors.phoneNumber === null ? '' : formErrors.phoneNumber}
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
                              label = 'Comments'
                              variant = 'filled'
                              value = {formData.comments}
                              onChange = {(event) => handleChange('comments', event.target.value)}
                          />
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
                              Submit
                          </Button>
                      </Grid>
                  </Grid>
              </Grid>

          </Grid>
      </Card>
  );
}

CompliancesForm.propTypes = {
    handleClose : PropTypes.func
}

export default CompliancesForm