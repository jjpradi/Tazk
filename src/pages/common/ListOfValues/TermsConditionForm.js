import React, { useEffect, useState } from 'react'
import { Autocomplete, Button, Container, FormControl, FormHelperText, Grid, InputLabel, TextareaAutosize, TextField, Typography } from '@mui/material'
import { capitalize } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { CreateTermsConditionsAction, InvoiceTypesAction, updateTermsConditionsAction } from 'redux/actions/termsConditions_actions'
import PropTypes from 'prop-types'
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';

const TermsConditionForm = (props) => {

    const dispatch = useDispatch()

    const {
        TermsConditionsReducers : { invoiceTypesList }
    } = useSelector((state) => state)

    useEffect(() => {
        dispatch(InvoiceTypesAction())
    }, [])

    const [formData, setFormData] = useState({
        invoiceType : null,
        termsConditions : null
    })

    const [formErrors, setFormErrors] = useState({
        invoiceType : null,
        termsConditions : null
    })

    const requiredFields = [
        'invoiceType',
        'termsConditions'
    ]

    useEffect(() => {
    if (props.editData && Object.keys(props.editData).length > 0) {
        const matchedTypes = invoiceTypesList.filter(
        (item) => item.invoice_types === props.editData.invoice_types
        )

        setFormData({
        invoiceType: matchedTypes.length ? matchedTypes : [],
        termsConditions: Array.isArray(props.editData.terms_conditions)
            ? props.editData.terms_conditions.join('\n')
            : props.editData.terms_conditions || ''
        })
    } else {
        setFormData({
        invoiceType: [],
        termsConditions: ''
        })
        setFormErrors({
        invoiceType: null,
        termsConditions: null
        })
    }
    }, [props.editData, invoiceTypesList])


    const handleChange = (name, value) => {
        setFormData({...formData, [name] : value})
        validateForm(name, value)
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
        setFormData({
            ...formData,
            termsConditions : numberedLines.join('\n')
        })
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

    const handleSubmit = async (event) => {
        event.preventDefault()

        let isValid = true
        let formErrorsObj = {...formErrors}
        Object.keys(formData).forEach((key, i) => {
            if(requiredFields.includes(key) && (formData[key] === null || formData[key] === 'null' || formData[key] === '')) {
                isValid = false
                formErrorsObj[key] = capitalize(key) + ' is Required'
            }
            return null
        })
        setFormErrors(formErrorsObj)

        if(isValid) {
            const data = {
                type_id : formData.invoiceType[0]?.type_id,
                terms_conditions : formData.termsConditions.split('\n')
            }
            if (props.editData) {
                await dispatch(updateTermsConditionsAction(data))
            } else {
                await dispatch(CreateTermsConditionsAction(data))
            }
            props.handleClose()
        }
        else{
            dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
        }
    }
// console.log("invoiceTypesList",invoiceTypesList)
  return (
      <Container sx = {{ p : 5 }}>
          <Grid container spacing = {5}>
              <Grid
                  size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                  }}>
                  <Typography variant='h6' align='left'>
                      Add Terms & Conditions
                  </Typography>
              </Grid>

              <Grid
                  size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                  }}>
                  <Autocomplete
                      multiple
                      disablePortal
                      disabled={!!props.editData}
                      options={ invoiceTypesList? invoiceTypesList.filter((item) => item.is_created !== 1): [] }
                      getOptionLabel = {(option) => option.invoice_types || ''} 
                      value = {formData.invoiceType || []}
                      onChange = {(name, value) => handleChange('invoiceType', value)}
                      renderInput = {(params) => (
                          <TextField 
                              {...params}
                              label = 'Invoice Type'
                              required
                              variant = 'filled'
                              error = {formErrors.invoiceType !== null}
                              helperText = {formErrors.invoiceType === null ? '' : 'Invoice Type is Required'}
                          />
                      )}
                  />
              </Grid>

              <Grid
                  size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                  }}>
                    <FormControl fullWidth variant="filled" error={formErrors.termsConditions !== null} required>
                        <InputLabel shrink htmlFor="terms-conditions">
                            Terms & Conditions
                        </InputLabel>
                        <TextareaAutosize
                            id="terms-conditions"
                            minRows={4}
                            value={formData.termsConditions}
                            onChange={(event) => handleTermsChange('termsConditions', event.target.value)}
                            style={{
                                width: '100%',
                                padding: '16.5px 14px',
                                fontFamily: 'inherit',
                                fontSize: '16px',
                                borderRadius: '4px',
                                borderColor: formErrors.termsConditions ? '#d32f2f' : '#c4c4c4'
                            }}
                        />
                        {formErrors.termsConditions && (
                            <FormHelperText>Terms & Conditions is Required</FormHelperText>
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
                          <Button variant='contained' onClick={() => props.handleClose()}>
                              Cancel
                          </Button>
                      </Grid>

                      <Grid>
                          <Button variant='contained' onClick={handleSubmit}>
                              Add
                          </Button>
                      </Grid>
                  </Grid>
              </Grid>
          </Grid>
      </Container>
  );
}

TermsConditionForm.propTypes = {
    handleClose : PropTypes.func
}

export default TermsConditionForm