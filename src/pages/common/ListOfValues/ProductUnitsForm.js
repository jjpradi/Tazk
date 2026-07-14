import React, { useState } from 'react'
import { Button, Card, Grid, TextField, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { capitalize } from 'lodash'
import { CreateUnitsLovAction } from 'redux/actions/termsConditions_actions'
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';

const ProductUnitsForm = (props) => {

    const dispatch = useDispatch()

    const [formData, setFormData] = useState({
        unit : null,
        unitCode : null
    })

    const [formErrors, setFormErrors] = useState({
        unit : null,
        unitCode : null
    })

    const requiredFields = [
        'unit',
        'unitCode'
    ]

    const handleChange = (name, value) => {
        setFormData({...formData, [name] : value})
        validateForm(name, value)
    }

    const validateForm = (name, value) => {
        if(!Object.keys(formErrors).includes(name)) return

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

    const handleSubmit = async (event) => {
        event.preventDefault()

        let isValid = true
        let formErrorsObj = {...formErrors}
        Object.keys(formData).forEach((key, i) => {
            if(requiredFields.includes(key) && (formData[key] === null || formData[key] === 'null' || formData[key] === '')) {
                isValid = false
                formErrorsObj[key] = capitalize(key) + ' is Required!'
            }
            return null
        })
        setFormErrors(formErrorsObj)

        if(isValid) {
            const data = {
                unit : formData.unit,
                unitCode : formData.unitCode
            }
            await dispatch(CreateUnitsLovAction(data))
            props.handleDialogClose()
        }
        else{
            dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
        }
    }
    console.log('ycwtcdtwegd', formData)

  return (
      <Card sx={{ p : 4 }}>
          <Grid container spacing={2}>
              <Grid
                  size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                  }}>
                  <Typography variant='h6' align='left'>
                      Add Units & Code
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
                      label = 'Unit'
                      variant = 'filled'
                      value = {formData.unit}
                      onChange = {(event) => handleChange('unit', event.target.value)}
                      error = {formErrors.unit !== null}
                      helperText = {formErrors.unit === null ? '' : 'Unit is Required!'}
                  />
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
                      label = 'Code'
                      variant = 'filled'
                      value = {formData.unitCode}
                      onChange = {(event) => handleChange('unitCode', event.target.value.toUpperCase())}
                      error = {formErrors.unitCode !== null}
                      helperText = {formErrors.unitCode === null ? '' : 'Unit Code is Required!'}
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
                              onClick =  {() => props.handleDialogClose()}
                          >
                              Cancel
                          </Button>
                      </Grid>

                      <Grid>
                          <Button
                              variant = 'contained'
                              onClick =  {handleSubmit}
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

ProductUnitsForm.propTypes = {
    handleDialogClose : PropTypes.func
}

export default ProductUnitsForm