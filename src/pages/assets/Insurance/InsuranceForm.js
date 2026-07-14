import { Autocomplete, Button, Card, Grid, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import AttachmentField from 'pages/common/Timesheet/Attachment';
import { capitalize } from 'lodash';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { CreateInsurance, getInsuranceByIdAction, renewInsuranceAction } from 'redux/actions/insurance_actions';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { getAllAssetAction } from 'redux/actions/asset_actions';
import PropTypes from 'prop-types'

const InsuranceForm = (props) => {

    const dispatch = useDispatch()

    const [insuranceImage, setInsuranceImage] = useState([])
    const [assetId, setAssetId] = useState(null)

    const[insuranceDynamicProp, setInsuranceDynamicProp] = useState([])

    const [formData, setFormData] = useState({
        insurance_agent	: null,
        insurance_assetName : null,
        insurance_startDateAndTime : null,
        insurance_endDateAndTime : null,
        insurance_dynamicPropValues : []
    })

    const [formErrors, setFormErrors] = useState({
        insurance_agent	: null,
        insurance_assetName : null,
        insurance_startDateAndTime : null,
        insurance_endDateAndTime : null,
        insuranceImage : null,
        insurance_dynamicPropErrors : []
    })

    const requiredFields = [
        'insurance_agent',
        'insurance_assetName',
        'insurance_startDateAndTime',
        'insurance_endDateAndTime',
        'insuranceImage'
    ]

    const { 
        AssetReducers  : {getAssetName},
        InsuranceReducers: { insuranceById } 
    } = useSelector((state) => state)

    useEffect(() => {
        dispatch(getAllAssetAction())
    }, [])


    useEffect(() => {
        if(props?.type === 'renewForm') {
            const asset = getAssetName.find((e) => e.asset_id === props?.data.asset_id)
            const newFormData = {...formData, insurance_agent : props?.data.insurance_agent, insurance_assetName : asset}
            
            if(props?.data.dynamic_fields !== null){
                const fields = JSON.parse(props?.data.dynamic_fields)
                setInsuranceDynamicProp(fields)
    
                const values = JSON.parse(props?.data.properties)
                setFormData({...formData, insurance_dynamicPropValues: values})
            }
            setFormData(newFormData)
        }
        else if(props?.type === 'Renewals'){
            const asset = getAssetName.find((e) => e.asset_id == props?.data.asset_id)
            assetId !== props.data.asset_id && dispatch(getInsuranceByIdAction(props?.data.id, async(response) => {
                const res =  response[0]
                console.log(res, 'renewal')
                setFormData((prev) => ({
                    ...prev,
                    insurance_agent: res.insurance_agent,
                    insurance_assetName: asset,
                    insurance_dynamicPropValues: res.insurance_dynamicPropValues ? JSON.parse(res.insurance_dynamicPropValues) : null
                }))
                setInsuranceDynamicProp(res.dynamic_fields ? JSON.parse(res.dynamic_fields) : null)
                setInsuranceImage(res.image ? res.image.map((e => e.imageUrl)) : null)
            }))
            setAssetId(props?.data.asset_id)
        }
        else {
        setFormData({
            insurance_agent: null,
            insurance_assetName: null,
            insurance_startDateAndTime: null,
            insurance_endDateAndTime: null,
            insurance_dynamicPropValues: []
        })
        setFormErrors({
            insurance_agent: null,
            insurance_assetName: null,
            insurance_startDateAndTime: null,
            insurance_endDateAndTime: null,
            insuranceImage: null,
            insurance_dynamicPropErrors: []
        })
        setInsuranceImage([])
        setInsuranceDynamicProp([])
        setAssetId(null)
        }

}, [props?.type, props?.data?.id, getAssetName])


    useEffect(() => {
        if(insuranceImage.length > 1) {
            setFormErrors({...formErrors, insuranceImage : 'Only one Images are Required'})
        }
        else {
            setFormErrors({...formErrors, insuranceImage : null})
        }
        
        if(props?.type === 'assetInsuranceNewForm') {
            props?.imageChange(insuranceImage)
        }
    },[insuranceImage])

    const handleChange = async (e) => {
        const {name, value} = e.target
        setStateHandler(name, value)
    }

    const setConditionChange = (name, val) => {
        if(val !== '' && val !== null){
            setFormData({
                ...formData,
                [name]: val
            })
            setFormErrors({
                ...formErrors,
                [name]: null
            })
        }
      
        else{
            setFormData({
                ...formData,
                [name]: null
            })
            setFormErrors({
                ...formErrors,
                [name]: `${name} is Required`
            })
        }
      }


    const setStateHandler = async (name, value) => {
        let formObj = {
            ...formData,
            [name]: value === '' ? null : value
        }

        setFormErrors({...formErrors, [name] : null})
        setFormData(formObj)

        if(props?.type !== 'assetInsuranceNewForm') {
            validateForm(name, value)
        }
    }

    const validateForm = (name, value) => {
        if(!Object.keys(formErrors).includes(name)) return

        if(requiredFields.includes(name) && value === null || value === 'null' || value === '' || Object.keys(value) && value.value === null) {
            setFormErrors({
                ...formErrors,
                [name] : capitalize(name.replace(/_/g, '')) + ' is Required'
            })
        }
        else {
            setFormErrors({
                ...formErrors, [name] : null
            })
        }
    }

    const insuranceStartAndEndDate = (key) => {
        switch(key) {
            case 'insurance_startDateAndTime' :
                return 'Start Date And Time is Required'
            
            case 'insurance_endDateAndTime' :
                return 'End Date And Time is Required'

            default : 
                return capitalize(key) + ' is required'
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        
        let isValid = true
        let formErrorsObj = {...formErrors}
        Object.keys(formData).forEach((key, i) => {
            if(requiredFields.includes(key) && (formData[key] === null || formData[key] === 'null' || formData[key] === '')) {
                isValid = false
                formErrorsObj[key] = insuranceStartAndEndDate(key)
            }
            if(insuranceImage.length === 0) {
                isValid = false
                formErrorsObj.insuranceImage = 'Image is Required'
            }
            if(insuranceImage.length > 1) {
                isValid = false
                formErrorsObj.insuranceImage = 'Only one Images are Required'
            }
            return null
        })
        setFormErrors(formErrorsObj)
        if(isValid) {
            const data = {
                insurance_agent : formData.insurance_agent,
                start_date : formData.insurance_startDateAndTime ? moment(formData.insurance_startDateAndTime).format('YYYY-MM-DD HH:mm') : null,
                end_date : formData.insurance_endDateAndTime ? moment(formData.insurance_endDateAndTime).format('YYYY-MM-DD HH:mm') : null,
                image : insuranceImage,
                asset_id : formData.insurance_assetName.asset_id,
                properties : formData.insurance_dynamicPropValues,
                dynamic_fields : insuranceDynamicProp   
            }
            if(props?.type === 'Renewals'){
                await dispatch(renewInsuranceAction(data, props?.data.id))
                props.handleCancel()
            }
            else{
                await dispatch(CreateInsurance(data))
                props.handleCancel()
            }

         }
    }


  return (
      <Card sx={{p: 3}}>
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
                      <Typography variant='h6' align='left' style={{ paddingBottom: '20px' }}>
                          {props?.type === 'Renewals' ? 'Renew Insurance' : 'Insurance'} 
                      </Typography>
                      </Grid>
                  </Grid>
              </Grid>
              
              {props?.type !== 'assetInsuranceNewForm' &&
              <Grid
                  size={{
                      lg: 3,
                      md: 4,
                      sm: 4,
                      xs: 12
                  }}>
                  <Autocomplete 
                      disablePortal
                      options={getAssetName}
                      getOptionLabel={(option) => option.Name || ''}
                      value={formData.insurance_assetName}
                      onChange={(name, value) => setConditionChange('insurance_assetName', value)}
                      renderInput={(params) => (
                          <TextField 
                              {...params}
                              label='Asset Name'
                              required
                              variant='filled'
                              error={formErrors.insurance_assetName !== null}
                              helperText={formErrors.insurance_assetName === null ? '' : 'Asset Name is Required'}
                          />
                      )}
                  />
              </Grid>
              }

              <Grid
                  size={{
                      lg: 3,
                      md: 4,
                      sm: 4,
                      xs: 12
                  }}>
                  <TextField
                      fullWidth
                      required = {props?.type !== 'assetInsuranceNewForm'}
                      label = 'Insurance Provider'
                      name = 'insurance_agent'
                      variant='filled'
                      value={formData.insurance_agent || ''}
                      onChange={handleChange}
                      error = {formErrors.insurance_agent !== null}
                      helperText = {formErrors.insurance_agent === null ? '' : 'Insurance Provider is Required'}
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
                      <DateTimePicker
                          label="Start Date & Time"
                          format="DD/MM/YYYY hh:mm A"
                          slotProps={{
                              textField: {
                                  fullWidth: true,
                                  onKeyDown: (e) => e.preventDefault(),
                                  variant: 'filled',
                                  required: props?.type !== 'assetInsuranceNewForm',
                                  error: formErrors.insurance_startDateAndTime !== null,
                                  helperText: formErrors.insurance_startDateAndTime === null ? '' : formErrors.insurance_startDateAndTime,
                              },
                          }}
                          value={formData.insurance_startDateAndTime || null}
                          onChange={(e) => {
                              if(!e) {
                                  setFormErrors((prev) => ({...prev, insurance_startDateAndTime : 'Start Date And Time is Required'}))
                                  setFormData((prev) => ({...prev, insurance_startDateAndTime : null}))
                              }
                              else{
                                  setFormErrors((prev) => ({ ...prev, insurance_startDateAndTime: null }));
                                  setFormData((prev) => ({ ...prev, insurance_startDateAndTime: e }));
                                  if(props?.type === 'assetInsuranceNewForm') {
                                      props?.valueChange('insurance_startDateAndTime', e)
                                  }
                              }
                          }}
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
                      <DateTimePicker
                          label="End Date & Time"
                          format="DD/MM/YYYY hh:mm A"
                          slotProps={{
                              textField: {
                                  fullWidth: true,
                                  onKeyDown: (e) => e.preventDefault(),
                                  variant: 'filled',
                                  required: props?.type !== 'assetInsuranceNewForm',
                                  error: formErrors.insurance_endDateAndTime !== null,
                                  helperText: formErrors.insurance_endDateAndTime === null ? '' : formErrors.insurance_endDateAndTime,
                              },
                          }}
                          value={formData.insurance_endDateAndTime || null}
                          onChange={(e) => {
                              if(!e) {
                                  setFormErrors((prev) => ({...prev, insurance_endDateAndTime : 'End Date And Time is Required'}))
                                  setFormData((prev) => ({...prev, insurance_endDateAndTime : null}))
                              }
                              else{
                                  setFormErrors((prev) => ({ ...prev, insurance_endDateAndTime: null }));
                                  setFormData((prev) => ({ ...prev, insurance_endDateAndTime: e }));
                                  if(props?.type === 'assetInsuranceNewForm') {
                                      props?.valueChange('insurance_endDateAndTime', e)
                                  }
                              }
                          }}
                      />
                  </LocalizationProvider>
              </Grid>

              <Grid
                  size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                  }}>
                      <AttachmentField 
                          insurance ='insurance'
                          previews={insuranceImage}
                          setPreviews={setInsuranceImage}
                      />
                      <Typography color='error'>
                          {formErrors.insuranceImage !== null ? formErrors.insuranceImage : ''}
                      </Typography>
              </Grid>
      {props?.type !== 'assetInsuranceNewForm' &&
              <Grid
                  size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                  }}>
                  <Grid container justifyContent='flex-end' spacing={2}>
                      <Grid>
                          <Button variant='contained' color='error'
                              onClick={() => props.handleCancel()}
                          >
                              Cancel
                          </Button>
                      </Grid>

                      <Grid>
                          <Button variant='contained' color='primary'
                          onClick = {handleSubmit}
                          >
                              Submit
                          </Button>
                      </Grid>
                  </Grid>
              </Grid>
      }
          </Grid>
      </Card>
  );
}

InsuranceForm.propTypes = {
    type : PropTypes.string,
    data : PropTypes.object,
    imageChange : PropTypes.func,
    valueChange : PropTypes.func,
    handleCancel : PropTypes.func,
}

export default InsuranceForm