import {
  Autocomplete,
  Box,
  Button,
  Card,
  Grid,
  IconButton,
  MenuItem,
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
import UploadIcon from '@mui/icons-material/Upload';
import DropZone from '../documents/dropZone';
import VerifiedIcon from '@mui/icons-material/Verified';
import moment from 'moment';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import apiCalls from 'utils/apiCalls';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import toMomentOrNull from 'utils/DateFixer';

const BoxItem = styled(Box)(({theme}) => ({
  padding: 24,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  [theme.breakpoints.up('sm')]: {
    borderRight: `1px dashed ${theme.palette.divider}`,
  },
}));

function NewForm(props) {
  const {index, userId, handleClose, handleDialogOpen} = props;
  const dispatch = useDispatch();

  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(CreateNewButtonContext);

  const [doc, setDoc] = useState(null);
  const [docType, setDocType] = useState(null);
  const [docFile, setDocFile] = useState(null);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    setDoc(null);
    setDocType(null);
    setDocFile(null);
    setFieldValue('isVerified', false);
  }, [index]);

  useEffect(() => {
    if (docFile !== null) {
      setFieldValue('attachment', docFile);
      setPreview(true);
    }
  }, [docFile]);

  const handleVerification = () => {
    setFieldValue('isVerified', !values.isVerified);
  };

  const {
    UserCreationReducer: {verificationType},
  } = useSelector((s) => s);

  const docSchema = Yup.object().shape({
    verificationType: Yup.string('Select Type').required('Type is required!'),
    d_number: Yup.string('Type').required('Number is required!'),
    expiry_date : Yup.string().when('verificationType', {
      is : 'Passport',
      then : Yup.string().required('Expiry Date is Required!'),
      otherwise : Yup.string().notRequired()
    }),
    attachment: Yup.array()
      .min(1, 'Upload Document!')
      .required('Upload Document!'),
  });

  const formik = useFormik({
    initialValues: {
      verificationType: '',
      d_number: '',
      remarks: '',
      attachment: [],
      expiry_date: '',
    },

    enableReinitialize: true,
    validationSchema: docSchema,

    onSubmit: () => {
      let values = {...formik.values};

      let formData = new FormData();

      formData.append('fileType', docType);
      for (const single_file of docFile) {
        formData.append('index_value', index);
        formData.append('files', single_file);
        formData.append('emp_id', userId);
        formData.append('remarks', values.remarks);
        formData.append('d_number', values.d_number);
        formData.append('document_type', values.verificationType);
        formData.append('reason', null);
        formData.append('dl_number', null);
        formData.append('latitude', null);
        formData.append('longitude', null);
        formData.append('expiry_date', values.expiry_date);
        formData.append('report', null);
        formData.append('issued_by', null);
        formData.append('issued_date', null);
      }

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
    validateForm,
    values,
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
          {/* <Grid size={{ xs: 12, md: 6 }}>
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
          </Grid> */}
          
          <Grid
            size={{
              md: 6,
              xs: 12
            }}>
            <TextField
              select
              fullWidth
              label='Type'
              name='verificationType'
              value={values.verificationType}
              onChange={(event) =>
                setFieldValue('verificationType', event.target.value)
              }
              onBlur={handleBlur}
              error={
                touched.verificationType && Boolean(errors.verificationType)
              }
              helperText={touched.verificationType && errors.verificationType}
            >
              <MenuItem value='Aadhar'>Aadhar</MenuItem>
              <MenuItem value='Passport'>Passport</MenuItem>
            </TextField>
          </Grid>

          <Grid
            size={{
              md: 6,
              xs: 12
            }}>
            <TextField
              required
              fullWidth
              label='Reference Number'
              name='d_number'
              type='text'
              {...getFieldProps('d_number')}
              error={Boolean(touched.d_number && errors.d_number)}
              helperText={touched.d_number && errors.d_number}
            />
          </Grid>
{values.verificationType === 'Passport' ? (
          <Grid
            size={{
              md: 6,
              xs: 12
            }}>
            <LocalizationProvider dateAdapter={DateAdapter}>
              <DatePicker
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: Boolean(touched.expiry_date && errors.expiry_date),
                    helperText: touched.expiry_date && errors.expiry_date,
                  },
                }}
                value={toMomentOrNull(values.expiry_date)}
                format='DD/MM/YYYY'
                onChange={(e) =>
                  setFieldValue(
                    'expiry_date',
                    moment(e?._d).format('YYYY-MM-DD'),
                  )
                }
                label='Expiry Date'
              />
            </LocalizationProvider>
          </Grid>
          ) : ''}

          <Grid
            size={{
              md: 12,
              xs: 12
            }}>
            <Card>
              <BoxItem>
                <Box>
                  <Box
                    display='flex'
                    direction='row'
                    justifyContent='space-between'
                    alignItems='center'
                  >
                    <Stack
                      direction='row'
                      display='flex'
                      alignItems='center'
                      gap={1}
                      pb='15px'
                    >
                      <UploadIcon
                        sx={{
                          fontSize: 18,
                          color: 'text.secondary',
                        }}
                      />
                      <Typography fontSize={18} fontWeight={500}>
                        Upload File
                      </Typography>
                    </Stack>
                    {values.isVerified ? (
                      <VerifiedIcon color='primary' />
                    ) : null}
                  </Box>
                  <DropZone
                    onDrop={() => {}}
                    setUpload={setDoc}
                    upload={doc}
                    file={docFile}
                    setFile={setDocFile}
                    setDocType={setDocType}
                    setPreview={setPreview}
                    preview={preview}
                    handleVerification={handleVerification}
                    isVerified={values.isVerified}
                    getFieldProps={getFieldProps}
                  />
                  {errors.attachment && touched.attachment && (
                    <Typography
                      sx={{
                        color: '#D42F36',
                        margin: '4px 14px 0px',
                        fontSize: 12,
                      }}
                    >
                      {errors.attachment}
                    </Typography>
                  )}
                </Box>
              </BoxItem>
            </Card>
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

export default NewForm;
