import React, { useState } from 'react'
import { Button, Card, Grid, TextField, Typography } from '@mui/material'
import { useDispatch } from 'react-redux'
import { createRenewalsLovAction } from 'redux/actions/renewals_actions'
import { OpenalertActions } from 'redux/actions/alert_actions'
import { requiredFieldsAlertMessage } from 'utils/content'

const RenewalForm = (props) => {

    const dispatch = useDispatch()

    const [renewals, setRenwals] = useState(null)
    const [error, setError] = useState(null)

    const handleChange = (event) => {
        const value = event.target.value

        if(value !== null && value !== '') {
            setRenwals(value)
            setError(null)
        }
        else {
            setRenwals(null)
            setError('Renewals is Required!')
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        if(renewals !== null && renewals !== '') {
            const capitalizeFirstLetter = (str) => str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
            const payload = {
                type : capitalizeFirstLetter(renewals)
            }
            await dispatch(createRenewalsLovAction(payload))
            props.closeDialog()
        }
        else {
            setError('Renewals is Required!')
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
                      Add Renewals
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
                      label = 'Renewals'
                      variant = 'filled'
                      value = {renewals}
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

export default RenewalForm