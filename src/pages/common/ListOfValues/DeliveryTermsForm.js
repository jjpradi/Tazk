import React, { useState } from 'react';
import { useDispatch } from "react-redux"
import { Button, Container, FormControl, Grid, InputLabel, TextareaAutosize, TextField, Typography } from "@mui/material"
import { createDeliveryTermsAction, createPaymentTermsAction } from 'redux/actions/termsConditions_actions';
import { capitalize } from 'lodash';
import { OpenalertActions } from 'redux/actions/alert_actions';

const PaymentTermsForm = (props) => {
    const dispatch = useDispatch()

    const[values, setValues] = useState({
        DeliveryTerms: null
    })

    const[errors, setErrors] = useState({
        DeliveryTerms: null
    })

    const requiredFields = [
        'DeliveryTerms'
    ]

        const validateForm = (name, value) => {
            if(!Object.keys(errors).includes(name)) return
    
            if(requiredFields.includes(name) && value === null || value === '') {
                setErrors({
                    ...errors,
                    [name] : capitalize(name.replace(/_/g, '')) + ' is Required'
                })
            }
            else {
                setErrors({...errors, [name] : null})
            }
        }

    const handleTermsChange = (name, value) => {
        const lines = value.split('\n')
        const numberedLines = lines.map((line, index) => {
            const strippedLine = line.replace(/^\d+\.\s*/, '')

            if(strippedLine !== '') {
                return `${index + 1}. ${strippedLine}`
            }
            else {
                return ''
            }
        })
        setValues({
            ...values,
            DeliveryTerms : numberedLines.join('\n')
        })
        validateForm(name, value)
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        let isValid = true
        let formErrorsObj = {...errors}
        Object.keys(values).forEach((key, i) => {
            if(requiredFields.includes(key) && (values[key] === null || values[key] === 'null' || values[key] === '')) {
                isValid = false
                formErrorsObj[key] = capitalize(key) + ' is Required'
            }
            return null
        })
        setErrors(formErrorsObj)

        if(isValid) {
            const data = {
                DeliveryTerms : values.DeliveryTerms.split('\n')
            }
            await dispatch(createDeliveryTermsAction(data))
            props.handleClose()
        }
        else{
            dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
        }
    }

  return (
      <>
          <Container sx={{p: 5}}>
              <Grid container spacing={5}>
                  <Grid
                      size={{
                          lg: 12,
                          md: 12,
                          sm: 12,
                          xs: 12
                      }}>
                      <Typography variant="h6" align='left'>Add Delivery Terms</Typography>
                  </Grid>

                        <Grid
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                            <FormControl fullWidth variant="filled" error={errors.DeliveryTerms !== null} required>
                                <InputLabel shrink htmlFor="DeliveryTerms">
                                    Delivery Terms
                                </InputLabel>
                                <TextareaAutosize
                                    id="DeliveryTerms"
                                    minRows={4}
                                    value={values.DeliveryTerms}
                                    onChange={(event) => handleTermsChange('DeliveryTerms',event.target.value )}
                                    style={{
                                        width: '100%',
                                        padding: '16.5px 14px',
                                        fontFamily: 'inherit',
                                        fontSize: '16px',
                                        borderRadius: '4px',
                                        borderColor: errors.DeliveryTerms ? '#d32f2f' : '#c4c4c4'
                                    }}
                                />
                                {errors.DeliveryTerms && (
                                    <FormHelperText>Delivery Terms is Required</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>

                  <Grid
                      size={{
                          lg: 12,
                          md: 12,
                          sm: 12,
                          xs: 12
                      }}>
                      <Grid container gap={2} display='flex' justifyContent='end'>
                          <Grid>
                              <Button variant='contained'onClick={() => props.handleClose()}>Cancel</Button>
                          </Grid>

                          <Grid>
                              <Button variant='contained'onClick={handleSubmit}>Add</Button>
                          </Grid>
                      </Grid>
                  </Grid>
              </Grid>
          </Container>
      </>
  );
}

export default PaymentTermsForm