import React, { useState } from 'react'
import { Button, Card, Grid, TextField, Typography } from '@mui/material'
import { useDispatch } from 'react-redux'
import { createRenewalsLovAction } from 'redux/actions/renewals_actions'
import { OpenalertActions } from 'redux/actions/alert_actions'
import { requiredFieldsAlertMessage } from 'utils/content'
import { createInsuranceLovAction } from '../../../redux/actions/insurance_actions'

const ServiceForm = (props) => {

    const dispatch = useDispatch()

    const [serviceType, setServiceType] = useState(null)
    const [error, setError] = useState(null)

    const handleChange = (event) => {
        const value = event.target.value

        if(value !== null && value !== '') {
            setServiceType(value)
            setError(null)
        }
        else {
            setServiceType(null)
            setError('Service Type is Required!')
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        if(serviceType !== null && serviceType !== '') {

            await dispatch(createInsuranceLovAction({name:serviceType}))
            props.closeDialog()
        }
        else {
            setError('Service Type is Required!')
            dispatch(OpenalertActions({ msg : requiredFieldsAlertMessage, severity : 'warning' }))
        }
    }

  return (
      <Card sx={{ p : 4 }}>
          <Grid container spacing = {2}>
              <Grid
                  size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                  }}>
                  <Typography variant='h6' align='left'>
                      Add Service Type
                  </Typography>
              </Grid>

              <Grid
                  size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                  }}>
                  <TextField 
                      fullWidth
                      required
                      label = 'Service Type'
                      variant = 'filled'
                      value = {serviceType}
                      onChange = {handleChange}
                      error = {error !== null}
                      helperText = {error !== null ? error : ''}
                  />
              </Grid>

              <Grid
                  size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                  }}>
                  <Grid
                      container
                      display = 'flex'
                      justifyContent = 'flex-end'
                      spacing = {2}
                  >
                      <Grid>
                          <Button
                              variant = 'contained'
                              color = 'error'
                              onClick = {() => props.closeDialog()}
                          >
                              Cancel
                          </Button>
                      </Grid>

                      <Grid>
                          <Button
                              variant = 'contained'
                              onClick = {handleSubmit}
                          >
                              Add
                          </Button>
                      </Grid>
                  </Grid>
              </Grid>
          </Grid>
      </Card>
  );
}

export default ServiceForm