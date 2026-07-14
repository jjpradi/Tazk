import { DatePicker, DateTimePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import {
  Grid,
  Button,
  Container,
  Autocomplete,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  IconButton,
  Tooltip,
  Fade,
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import toMomentOrNull from '../../../utils/DateFixer';


export default function ProductDetail({ productDynamicProp, setFormData, handleChange, formValues, formData, setProductDynamicProp, formErrors, setFormErrors, ...props }) {
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDeliveryDate, setselectedDeliveryDate] = useState(null);
  console.log("formvalurre", formValues)
  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  useEffect(() => {
    setSelectedOption(formValues.warranty)
  }, [formValues])

  const handleDateChange = (e) => {
    const date = e ? moment(e).format('YYYY-MM-DD') : null;
    setSelectedDate(e);
    console.log(date);
  };

  const handleDynamicPropChange = (name, value, required) => {

    if (required) {
      if (value !== null && value !== '' && value !== undefined) {
        setFormData({
          ...formData,
          service_dynamicPropValues: { ...formData.service_dynamicPropValues, [name]: value }
        })
        setFormErrors({
          ...formErrors,
          service_dynamicPropErrors: { ...formErrors.service_dynamicPropErrors, [name]: null }
        })
      }
      else {
        setFormData({
          ...formData,
          service_dynamicPropValues: { ...formData.service_dynamicPropValues, [name]: null }
        })
        setFormErrors({
          ...formErrors,
          service_dynamicPropErrors: { ...formErrors.service_dynamicPropErrors, [name]: `${name} is Required` }
        })
      }
    }
    else {
      setFormData({
        ...formData,
        service_dynamicPropValues: { ...formData.service_dynamicPropValues, [name]: value ? value : null }
      })
      setFormErrors({
        ...formErrors,
        service_dynamicPropErrors: { ...formErrors.service_dynamicPropErrors, [name]: null }
      })
    }
  }
  return (
    <div>
      {/* <Grid container> */}
      <Grid container spacing={3} padding='10px'>
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
            sm: 6,
            xs: 12
          }}>
          <TextField
            style={{ fontSize: '12px' }}
            fullWidth={true}
            placeholder='Brand'
            value={
              formValues.brand === null ? '' : formValues.brand
            }
            onChange={handleChange}
            onBlur={handleChange}
            label='Brand'
            name='brand'
            color='primary'
            type='text'
            regex=''
            variant='filled'
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
            style={{ fontSize: '12px' }}
            fullWidth={true}
            onChange={handleChange}
            onBlur={handleChange}
            value={
              formValues.model === null ? '' : formValues.model
            }
            placeholder='Model'
            label='Model'
            name='model'
            color='primary'
            type='text'
            regex=''
            variant='filled'
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
            style={{ fontSize: '12px' }}
            fullWidth={true}
            onChange={handleChange}
            onBlur={handleChange}
            value={
              formValues.serial === null ? '' : formValues.serial
            }
            placeholder='Serial'
            label='Serial'
            name='serial'
            color='primary'
            type='text'
            regex=''
            variant='filled'
          />
        </Grid>
        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <LocalizationProvider dateAdapter={DateAdapter}>
            <DatePicker
              label='Date Of Purchase'
              name='date_of_purchase'
              format='DD/MM/YYYY'
              value={
                toMomentOrNull(formValues.date_of_purchase)
              }
              onChange={(date) => {
                const formattedDate = date ? moment(date).format('YYYY-MM-DD') : null;
                setSelectedDate(date);
                const event = {
                  target: {
                    name: 'date_of_purchase',
                    value: formattedDate,
                  },
                };
                handleChange(event);
              }}
              slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <TextField
            style={{ fontSize: '12px' }}
            fullWidth={true}
            onChange={handleChange}
            onBlur={handleChange}
            value={
              formValues.approx_estimate === null ? '' : formValues.approx_estimate
            }
            placeholder='Approx Estimate'
            label='Approx Estimate'
            name='approx_estimate'
            color='primary'
            type='text'
            regex=''
            variant='filled'
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
            style={{ fontSize: '12px' }}
            fullWidth={true}
            onChange={handleChange}
            onBlur={handleChange}
            value={
              formValues.product_condition === null ? '' : formValues.product_condition
            }
            placeholder='Product Condition'
            label='Product Condition'
            name='product_condition'
            color='primary'
            type='text'
            regex=''
            variant='filled'
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
            style={{ fontSize: '12px' }}
            fullWidth={true}
            onChange={handleChange}
            onBlur={handleChange}
            value={
              formValues.advance_amount === null ? '' : formValues.advance_amount
            }
            placeholder='Advance Amount'
            label='Advance Amount'
            name='advance_amount'
            color='primary'
            type='text'
            regex=''
            variant='filled'
          />
        </Grid>
        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <LocalizationProvider dateAdapter={DateAdapter}>
            <DatePicker
              label='Target Delivery'
              name='target_delivery'
              value={
                toMomentOrNull(formValues.target_delivery)
              }
              format='DD/MM/YYYY'
              onChange={(date) => {
                const formattedDate = date ? moment(date).format('YYYY-MM-DD') : null;
                setselectedDeliveryDate(date);
                const event = {
                  target: {
                    name: 'target_delivery',
                    value: formattedDate,
                  },
                };
                handleChange(event);
              }}
              slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid
          display='flex'
          flexDirection='row'
          margin='15px 10px'
          size={{
            lg: 5.9,
            md: 5.9,
            sm: 5.9,
            xs: 5.9
          }}>
          {/* <Typography display='flex' alignItems='center' paddingRight='20px'> Warranty </Typography> */}
          <form style={{ display: 'flex', flexDirection: 'row' }}>
            <label style={{ fontSize: '14px', paddingRight: '10px' }}>
              <input
                type="radio"
                name="warranty"
                value={
                  formValues.warranty === null ? 'available' : formValues.warranty
                }
                checked={selectedOption === 'available'}
                onChange={(event) => {
                  setSelectedOption(event.target.value);
                  const events = {
                    target: {
                      name: 'warranty',
                      value: 'available',
                    },
                  };
                  handleChange(events);
                }}
              />
              In Warranty
            </label>
            <br />
            <label style={{ fontSize: '14px' }}>
              <input
                type="radio"
                name="warranty"
                value={
                  formValues.warranty === null ? 'out-of-warranty' : formValues.warranty
                }
                checked={selectedOption === 'out-of-warranty'}
                onChange={(event) => {
                  setSelectedOption(event.target.value);
                  const events = {
                    target: {
                      name: 'warranty',
                      value: 'out-of-warranty',
                    },
                  };
                  handleChange(events);
                }}
              />
              Out Warranty
            </label>
          </form>
        </Grid>
        <Grid
          margin='10px'
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <TextField
            style={{}}
            onChange={handleChange}
            onBlur={handleChange}
            fullWidth={true}
            placeholder='Important Note'
            label='Important Note'
            name='notes'
            minRows={3}
            multiline
            value={
              formValues.notes === null ? '' : formValues.notes
            }
            color='primary'
            type='text'
            regex=''
            variant='filled'
            InputProps={{
              style: { fontSize: '12px' }
            }}
          />
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
          {productDynamicProp?.length > 0
            ? productDynamicProp.map((prop) => {
              return prop.type === 'List' ? (
                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 4,
                    xs: 12
                  }}>
                  <Autocomplete
                    options={prop.property.options}
                    value={formData.service_dynamicPropValues[props.name] || ''}
                    onChange={(event, value) =>
                      handleDynamicPropChange(prop.name, value, prop.property.required)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required={prop.property.required}
                        label={prop.name}
                        variant='filled'
                        error={formErrors?.service_dynamicPropErrors[prop.name] &&
                          formErrors.service_dynamicPropErrors[prop.name] !== null ? true : false
                        }
                        helperText={formErrors?.service_dynamicPropErrors[prop.name] &&
                          formErrors.service_dynamicPropErrors[prop.name] !== null
                          ? formErrors.service_dynamicPropErrors[prop.name] : ''
                        }
                      />
                    )}
                  />
                </Grid>
              ) : prop.type === 'Text Field' ? (

                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 4,
                    xs: 12
                  }}>
                  <TextField
                    required={prop.property.required}
                    value={formData.service_dynamicPropValues[prop.name] || ''}
                    label={prop.name}
                    fullWidth
                    variant='filled'
                    // onBlur={() => handleBlur(prop.name)}
                    onChange={(event) => handleDynamicPropChange(prop.name, event.target.value, prop.property.required)}
                    error={formErrors?.service_dynamicPropErrors[prop.name] && formErrors.service_dynamicPropErrors[prop.name] !== null ? true : false}
                    helperText={formErrors?.service_dynamicPropErrors[prop.name] && formErrors.service_dynamicPropErrors[prop.name] !== null ? formErrors.service_dynamicPropErrors[prop.name] : ''}
                  />
                </Grid>
              ) : prop.type === 'Date' ?

                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 4,
                    xs: 12
                  }}>
                  <LocalizationProvider dateAdapter={DateAdapter}>
                    <DatePicker
                      label={prop.name}
                      value={toMomentOrNull(formData.service_dynamicPropValues[prop.name])}
                      format='DD/MM/YYYY'
                      required={prop.property.required}
                      onChange={(e) => {
                        if (e?._d) {
                          handleDynamicPropChange(prop.name, moment(e._d).format(prop.property.dateFormat), prop.property.required)
                        }
                        else {
                          handleDynamicPropChange(prop.name, null, prop.property.required)
                        }
                      }}
                      slotProps={{ textField: { fullWidth: true, variant: 'filled', required: prop.property.required, error: formErrors?.service_dynamicPropErrors[prop.name] && formErrors.service_dynamicPropErrors[prop.name] !== null ? true : false, helperText: formErrors?.service_dynamicPropErrors[prop.name] && formErrors.service_dynamicPropErrors[prop.name] !== null ? formErrors.service_dynamicPropErrors[prop.name] : '' } }}
                    />
                  </LocalizationProvider>
                </Grid>
                : prop.type === 'Date' ? (

                  <Grid
                    size={{
                      lg: 3,
                      md: 4,
                      sm: 4,
                      xs: 12
                    }}>
                    <LocalizationProvider dateAdapter={DateAdapter}>
                      <DatePicker
                        label={prop.name}
                        value={toMomentOrNull(formData.service_dynamicPropValues[prop.name])}
                        format='DD/MM/YYYY'
                        required={prop.property.required}
                        onChange={(e) => {
                          if (e?._d) {
                            handleDynamicPropChange(
                              prop.name,
                              moment(e._d).format('YYYY-MM-DD'),
                              prop.property.required,
                            );
                          } else {
                            handleDynamicPropChange(
                              prop.name,
                              null,
                              prop.property.required,
                            );
                          }
                        }}
                        slotProps={{ textField: { fullWidth: true, variant: 'filled', required: prop.property.required, error: formErrors?.service_dynamicPropErrors[prop.name] &&
                                formErrors.service_dynamicPropErrors[prop.name] !== null
                                ? true
                                : false, helperText: formErrors?.service_dynamicPropErrors[prop.name] &&
                                formErrors.service_dynamicPropErrors[prop.name] !== null
                                ? formErrors.service_dynamicPropErrors[prop.name]
                                : '' } }}
                      />
                    </LocalizationProvider>
                  </Grid>
                ) : prop.type === 'CheckBox' ? (

                  <Grid
                    size={{
                      lg: 3,
                      md: 4,
                      sm: 4,
                      xs: 12
                    }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.service_dynamicPropValues[prop.name]}
                          onChange={() =>
                            setFormData({
                              ...formData,
                              service_dynamicPropValues: {
                                ...formData.service_dynamicPropValues,
                                [prop.name]:
                                  !formData.service_dynamicPropValues[prop.name],
                              },
                            })
                          }
                        />
                      }
                      label={prop.name}
                    />
                  </Grid>
                ) : prop.type === 'Radio' ? (

                  <Grid
                    size={{
                      lg: 3,
                      md: 4,
                      sm: 4,
                      xs: 12
                    }}>
                    <FormControl>
                      <FormLabel>{prop.name}</FormLabel>
                      <RadioGroup
                        value={formData.service_dynamicPropValues[prop.name]}
                        onChange={(event) =>
                          handleDynamicPropChange(
                            prop.name,
                            event.target.value,
                            false,
                          )
                        }
                      >
                        {prop.property.options.map((option, index) => (
                          <FormControlLabel
                            key={index}
                            value={option}
                            control={<Radio />}
                            label={option}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                ) : prop.type === 'Text Area' ?

                  <Grid
                    size={{
                      lg: 3,
                      md: 4,
                      sm: 4,
                      xs: 12
                    }}>
                    <TextField
                      fullWidth
                      required={prop.property.required}
                      value={formData.service_dynamicPropValues[prop.name] || ''}
                      label={prop.name}
                      variant='filled'
                      multiline={true}
                      //   onBlur={() => handleBlur(prop.name)}
                      onChange={(event) => handleDynamicPropChange(prop.name, event.target.value, prop.property.required)}
                      error={formErrors?.service_dynamicPropErrors[prop.name] && formErrors.service_dynamicPropErrors[prop.name] !== null ? true : false}
                      helperText={formErrors?.service_dynamicPropErrors[prop.name] && formErrors.service_dynamicPropErrors[prop.name] !== null ? formErrors.service_dynamicPropErrors[prop.name] : ''}
                    />
                  </Grid>
                  : prop.type === 'Time' ?

                    <Grid
                      size={{
                        lg: 3,
                        md: 4,
                        sm: 4,
                        xs: 12
                      }}>
                      <LocalizationProvider dateAdapter={DateAdapter}>
                        <TimePicker
                          label={prop.name}
                          value={toMomentOrNull(formData.service_dynamicPropValues[prop.name]) ? moment(formData.service_dynamicPropValues[prop.name]) : null}
                          onChange={(e) => {
                            if (e?._d) {
                              handleDynamicPropChange(prop.name, moment(e._d).format(prop.property.timeFormat), prop.property.required)
                            }
                            else {
                              handleDynamicPropChange(prop.name, null, prop.property.required)
                            }
                          }}
                          slotProps={{ textField: { required: prop.property.required, variant: 'filled', fullWidth: true, error: formErrors?.service_dynamicPropErrors[prop.name] && formErrors.service_dynamicPropErrors[prop.name] !== null ? true : false, helperText: formErrors?.service_dynamicPropErrors[prop.name] && formErrors.service_dynamicPropErrors[prop.name] !== null ? formErrors.service_dynamicPropErrors[prop.name] : '' } }}
                        />
                      </LocalizationProvider>
                    </Grid>
                    : prop.type === 'Date & Time' ?

                      <Grid
                        size={{
                          lg: 3,
                          md: 4,
                          sm: 4,
                          xs: 12
                        }}>
                        <LocalizationProvider dateAdapter={DateAdapter}>
                          <DateTimePicker
                            label={prop.name}
                            value={formData.service_dynamicPropValues[prop.name] ? moment(formData.service_dynamicPropValues[prop.name]) : null}
                            onChange={(e) => {
                              if (e?._d) {
                                handleDynamicPropChange(prop.name, moment(e._d).format(prop.property.dateTimeFormat), prop.property.required)
                              }
                              else {
                                handleDynamicPropChange(prop.name, null, prop.property.required)
                              }
                            }}
                            slotProps={{ textField: { required: prop.property.required, variant: 'filled', fullWidth: true, error: formErrors?.service_dynamicPropErrors[prop.name] && formErrors.service_dynamicPropErrors[prop.name] !== null ? true : false, helperText: formErrors?.service_dynamicPropErrors[prop.name] && formErrors.service_dynamicPropErrors[prop.name] !== null ? formErrors.service_dynamicPropErrors[prop.name] : '' } }}
                          />
                        </LocalizationProvider>
                      </Grid>
                      : null;
            }) : null}
        </Grid>
      </Grid>
      {/* </Grid> */}
    </div>
  );
}
