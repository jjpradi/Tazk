import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  InputAdornment,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import React, {useState} from 'react';
import {Fonts} from '../../shared/constants/AppEnums';
import * as Yup from 'yup';
import {FormikProvider, useFormik, Form} from 'formik';
import {useNavigate} from 'react-router-dom';
import IOSSwitch from 'utils/cssSwitch';
import AppCard from '../../@crema/core/AppCard';
import { useDispatch } from 'react-redux';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';

const category = [
  {id: 1, name: 'Marketing'},
  {id: 2, name: 'Utility'},
  {id: 3, name: 'Authentication'},
];

const NewTemp = ({handleClose}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const [charCount, setCharCount] = useState(0);

  const initialValues = {
    temp_name: '',
    temp_body: '',
    temp_category: '',
    temp_header: '',
    temp_footer: '',
    header: 'NONE',
    temp_btn: false,
    temp_img: false,
  };
  const [selectedCategory, setSelectedCategory] = useState(null);
  const validationSchema = Yup.object({
    temp_name: Yup.string()
      .min(3, 'Must be greater then 3 characters')
      .required('Template Name is Required!'),
    temp_body: Yup.string()
      .min(3, 'Must be greater then 1 characters')
      .required('Template Body is Required!'),
    temp_category: Yup.string().required('Category is Required!'),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: () => {
      let values = {...formik.values};
      handleClose()

      console.log('values', values);
      //   navigate(`/wassup`);
    },
  });



  const {
    values,
    errors,
    handleChange,
    handleBlur,
    touched,
    setFieldValue,
    handleSubmit,
    getFieldProps,
    validateForm,
  } = formik;
console.log(errors,'errors',handleSubmit);
  return (
    <FormikProvider value={formik}>
      <Form autoComplete='off' noValidate onSubmit={handleSubmit}>
        <Grid
          container
          display='flex'
          flexDirection='row'
          alignItems='center'
          spacing={5}
          padding={5}
        >
          <Grid size={12}>
            <Typography
             className='page-title'
            >
              New Template
            </Typography>
          </Grid>

          <Grid size={4}>
            <TextField
              fullWidth
              required
              // multiline
              // rows={4}
              name='temp_name'
              label='Template Name'
              {...getFieldProps('temp_name')}
              error={Boolean(errors.temp_name && touched.temp_name)}
              helperText={touched.temp_name && errors.temp_name}
            />
          </Grid>

          <Grid size={4}>
          <Autocomplete
          options={category}
          getOptionLabel={(option) => option.name}
          value={selectedCategory}
          onChange={(event, newValue) => {
            setSelectedCategory(newValue);
            formik.setFieldValue('temp_category', newValue ? newValue.name : '');
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              {...formik.getFieldProps('temp_category')}
              fullWidth
              required
              name="temp_category"
              label="Category"
              error={Boolean(errors.temp_category && touched.temp_category)}
              helperText={touched.temp_category && errors.temp_category}
            />
          )}
        />
          </Grid>

          <Grid size={12}>
            <Box sx={{p: 7, bgcolor: '#F4F7FE'}}>
              <Grid container display='flex' flexDirection='row' spacing={7}>
                <Grid size={12}>
                  <AppCard title={'Header (Optional)'} sxStyle={{height: 1}}>
                    <Box display='flex' flexDirection='column' gap={2}>
                      <FormControl>
                        <RadioGroup
                          row
                          aria-labelledby='demo-controlled-radio-buttons-group'
                          name='header'
                          value={values.header}
                          onChange={(e) =>
                            setFieldValue('header', e.target.value)
                          }
                        >
                          <FormControlLabel
                            value='NONE'
                            control={<Radio />}
                            label='None'
                          />
                          <FormControlLabel
                            value='TEXT'
                            control={<Radio />}
                            label='Text'
                          />
                        </RadioGroup>
                      </FormControl>

                      {values.header === 'TEXT' ? (
                        <Box position='relative'>
                          <TextField
                            fullWidth
                            name='temp_header'
                            inputProps={{maxLength: 60}}
                            {...getFieldProps('temp_header')}
                          />
                          <Box
                            position='absolute'
                            bottom={8}
                            right={8}
                            pointerEvents='none'
                          >
                            <InputAdornment position='end'>
                              <Box color='textSecondary' fontSize={12}>
                                {values.temp_header.length} / 60
                              </Box>
                            </InputAdornment>
                          </Box>
                        </Box>
                      ) : null}
                    </Box>
                  </AppCard>
                </Grid>

                <Grid size={12}>
                  <AppCard title={'Body'} sxStyle={{height: 1}}>
                    <Box position='relative'>
                      <TextField
                        fullWidth
                        required
                        multiline
                        rows={4}
                        name='temp_body'
                        {...getFieldProps('temp_body')}
                        inputProps={{maxLength: 1024}}
                        error={Boolean(errors.temp_body && touched.temp_body)}
                        helperText={touched.temp_body && errors.temp_body}
                      />
                      <Box
                        position='absolute'
                        bottom={8}
                        right={8}
                        pointerEvents='none'
                      >
                        <InputAdornment position='end'>
                          <Box color='textSecondary' fontSize={12}>
                            {values.temp_body.length} / 1024
                          </Box>
                        </InputAdornment>
                      </Box>
                    </Box>
                  </AppCard>
                </Grid>

                <Grid size={12}>
                  <AppCard title={'Footer (Optional)'} sxStyle={{height: 1}}>
                    <TextField
                      fullWidth
                      required
                      name='temp_footer'
                      {...getFieldProps('temp_footer')}
                    />
                  </AppCard>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* <Grid size={4}>
            <FormGroup>
              <FormControlLabel
                control={
                  <IOSSwitch
                    sx={{m: 2}}
                    name='temp_btn'
                    default
                    onChange={(e) => setFieldValue('temp_btn', e)}
                  />
                }
                label='Include Button'
              />
            </FormGroup>
          </Grid>

          <Grid size={4}>
            <FormGroup>
              <FormControlLabel
                control={
                  <IOSSwitch
                    sx={{m: 2}}
                    name='temp_img'
                    default
                    onChange={(e) => setFieldValue('temp_img', e)}
                  />
                }
                label='Include Image'
              />
            </FormGroup>
          </Grid> */}

          <Grid display='flex' justifyContent='flex-end' size={12} sx={{pb: 4}}>
            <Box display='flex' flexDirection='row' gap={2}>
              <Button variant='contained' color='inherit' onClick={handleClose}>
                {'Cancel'}
              </Button>
              <Button type='submit' variant='contained' onClick={async() => {
                  const ValidationErrors = await validateForm()
                  if(Object.keys(ValidationErrors).length > 0){
                    dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
                  }
                  else{
                    handleSubmit()
                  }
                }
              }>
                {'Submit'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Form>
    </FormikProvider>
  );
};

export default NewTemp;
