import {
  Autocomplete,
  Box,
  Button,
  Card,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
  styled,
} from '@mui/material';
import {Form, FormikProvider, useFormik} from 'formik';
import React, {useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  completedIndexValue,
  createEmpVerificationAction,
} from 'redux/actions/userCreation_actions';
import * as Yup from 'yup';
import AddIcon from '@mui/icons-material/Add';
import apiCalls from 'utils/apiCalls';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';

function NewAccount(props) {
  const {index, userId, handleClose, handleDialogOpen} = props;
  const dispatch = useDispatch();

  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(CreateNewButtonContext);

  const {
    UserCreationReducer: {verificationType},
  } = useSelector((s) => s);

  const docSchema = Yup.object().shape({
    verificationType: Yup.string().required('Type is required'),
    userName: Yup.string().required('User Name is required'),
  });

  const formik = useFormik({
    initialValues: {
      verificationType: '',
      userName: '',
    },

    enableReinitialize: true,
    validationSchema: docSchema,

    onSubmit: () => {
      let values = {...formik.values};

      let formData = {
        document_type: values.verificationType,
        remarks: values.userName,
        index_value: index,
        emp_id: userId,
      };

      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          createEmpVerificationAction(formData, (response) => {
            if (response) {
              dispatch(completedIndexValue(userId));
            }
          }),
        ),
      );
      handleClose();
      formik.resetForm();
    },
  });

  const {
    errors,
    touched,
    getFieldProps,
    setFieldValue,
    handleBlur,
    handleSubmit,
    values,
    validateForm,
  } = formik;

  return (
    <FormikProvider value={formik}>
      <Form autoComplete='off' noValidate onSubmit={formik.handleSubmit}>
        <Grid
          container
          display='flex'
          flexDirection='row'
          alignItems='center'
          spacing={3}
          sx={{p: '10px'}}
        >
          <Grid
            size={{
              md: 6,
              xs: 12
            }}>
            <Autocomplete
              value={
                values.verificationType
                  ? verificationType.find(
                      (f) => f.id === values.verificationType,
                    )
                  : null
              }
              name={`verificationType`}
              clearOnEscape
              options={verificationType}
              getOptionLabel={(option) => option.name}
              autoHighlight
              onBlur={handleBlur}
              onChange={(event, value) => {
                if (value === null) {
                  setFieldValue(`verificationType`, '');
                } else {
                  setFieldValue(`verificationType`, value.id);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  name={`verificationType`}
                  label='Type'
                  placeholder='Select Type'
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {params.InputProps.endAdornment}
                        <IconButton onClick={handleDialogOpen}>
                          <AddIcon fontSize='small' />
                        </IconButton>
                      </>
                    ),
                  }}
                  error={
                    touched[`verificationType`] &&
                    Boolean(errors[`verificationType`])
                  }
                  helperText={
                    touched[`verificationType`] && errors[`verificationType`]
                  }
                />
              )}
            />
          </Grid>

          <Grid
            size={{
              md: 6,
              xs: 12
            }}>
            <TextField
              required
              fullWidth
              label='User Name'
              name='userName'
              type='text'
              {...getFieldProps('userName')}
              error={Boolean(touched.userName && errors.userName)}
              helperText={touched.userName && errors.userName}
            />
          </Grid>
          <Grid
            size={{
              md: 12,
              xs: 12
            }}>
            <Box
              display='flex'
              flexDirection='row'
              justifyContent='flex-end'
              width='100%'
              gap={3}
            >
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={async() => {
                  const ValidationErrors = await validateForm()
                  if(Object.keys(ValidationErrors).length > 0){
                    dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
                    handleSubmit() 
                  }
                  else{
                    handleSubmit() 
                  }
                }}>Submit</Button>
            </Box>
          </Grid>
        </Grid>
      </Form>
    </FormikProvider>
  );
}

export default NewAccount;
