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
  CardMedia,
} from '@mui/material';
import {Form, FormikProvider, useFormik} from 'formik';
import React, {useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  EmployeeVerificationDetail,
  completedIndexValue,
  createEmpVerificationAction,
  updateEmpVerificationAction,
} from 'redux/actions/userCreation_actions';
import * as Yup from 'yup';
import AddIcon from '@mui/icons-material/Add';
import UploadIcon from '@mui/icons-material/Upload';
import DropZone from './dropZone';
import moment from 'moment';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import ZoomInBox from 'utils/zoomInBox';
import VerifiedIcon from '@mui/icons-material/Verified';
import CheckIcon from '@mui/icons-material/Check';
import VerificationBadge from '../verificationBadge';
import apiCalls from 'utils/apiCalls';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import toMomentOrNull from 'utils/DateFixer';

const Wrapper = styled(Card)(({theme}) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

const BoxItem = styled(Box)(({theme}) => ({
  padding: 24,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  [theme.breakpoints.up('sm')]: {
    borderRight: `1px dashed ${theme.palette.divider}`,
  },
}));

function LicenseVerification(props) {
  const {
    index,
    verificationType,
    data,
    userId,
    edit,
    setEdit,
    handleClose,
    handleDialogOpen,
  } = props;
  const dispatch = useDispatch();

  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(CreateNewButtonContext);

  const {
    UserCreationReducer: {empVerificationDetail},
  } = useSelector((s) => s);

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
      setFieldValue('attachment', docFile)
      setPreview(true);
    }
  }, [docFile]);

  const licenseSchema = Yup.object().shape({
    verificationType : Yup.string('Select Type').required('License Type is Required!'),
    issued_by : Yup.string('Type').required('Issuing Authority is Required!'),
    dlNumber : Yup.string('Type').required('Number is Required!'),
    expiryDate : Yup.string('Type').required('Expiry Date is Required!'),
    attachment : Yup.array()
      .min(1, 'Upload Document!')
      .required('Upload Document!')
  });

  const formik = useFormik({
    initialValues: {
      verificationType: '',
      dlNumber: '',
      issued_by: '',
      expiry_date: '',
      remarks: '',
      document_name: '',
      url: '',
      fileType: '',
      id: null,
      expiryDate: '',
      verifiedBy: '',
      isVerified: false,
      attachment : []
    },

    enableReinitialize: true,
    validationSchema: licenseSchema,

    onSubmit: () => {
      let values = {...formik.values};

      let formData = new FormData();

      if(!docFile) {
        setErrors({ attachment : 'Upload Document!' })
      }
      else {
        formData.append('fileType', docType);
        for (const single_file of docFile) {
          formData.append('index_value', index);
          formData.append('files', single_file);
          formData.append('emp_id', userId);
          formData.append('dlNumber', values.dlNumber);
          formData.append('issued_by', values.issued_by);
          formData.append('document_type', values.verificationType);
          formData.append('expiry_date', values.expiryDate);
          formData.append('remarks', values.remarks);
          formData.append('reason', null);
          formData.append('dl_number', null);
          formData.append('latitude', null);
          formData.append('longitude', null);
          formData.append('issued_date', null);
        }

        if (empVerificationDetail[0]?.id) {
          apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(
              updateEmpVerificationAction(
                formData,
                empVerificationDetail[0]?.id,
                () => {},
              ),
            ),
          );
        } else {
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
        }
        handleClose();
        formik.resetForm();
      }
    },
  });

  useEffect(() => {
    if (empVerificationDetail.length) {
      setFieldValue(
        'verificationType',
        empVerificationDetail[0]?.document_type,
      );
      setFieldValue('dlNumber', empVerificationDetail[0]?.dl_number);
      setFieldValue('issued_by', empVerificationDetail[0]?.issued_by);
      setFieldValue('document_name', empVerificationDetail[0]?.document_name);
      setFieldValue('expiry_date', empVerificationDetail[0]?.expiry_date);
      setFieldValue('fileType', empVerificationDetail[0]?.type);
      setFieldValue('url', empVerificationDetail[0]?.url);
      setFieldValue('verifiedBy', empVerificationDetail[0]?.verifiedByName);
      setFieldValue('remarks', empVerificationDetail[0]?.remarks);
      setFieldValue('id', empVerificationDetail[0]?.id);
    } else {
      setFieldValue('verificationType', '');
      setFieldValue('dlNumber', '');
      setFieldValue('document_name', '');
      setFieldValue('expiry_date', '');
      setFieldValue('issued_by', '');
      setFieldValue('id', null);
      setEdit(true);
    }
  }, [empVerificationDetail]);

  const handleVerification = () => {
    setFieldValue('isVerified', !values.isVerified);
  };

  const {
    errors,
    touched,
    getFieldProps,
    setFieldValue,
    handleBlur,
    handleSubmit,
    setErrors,
    values,
    validateForm,
  } = formik;

  return (
    <>
      {edit ? (
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
                      label='LICENSE TYPE'
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
                        touched[`verificationType`] &&
                        errors[`verificationType`]
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
                  label='ISSUING AUTHORITY '
                  name='issued_by'
                  type='text'
                  {...getFieldProps('issued_by')}
                  error={Boolean(touched.issued_by && errors.issued_by)}
                  helperText={touched.issued_by && errors.issued_by}
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
                  label='NUMBER'
                  name='dlNumber'
                  type='text'
                  {...getFieldProps('dlNumber')}
                  error={Boolean(touched.dlNumber && errors.dlNumber)}
                  helperText={touched.dlNumber && errors.dlNumber}
                />
              </Grid>

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
                        error: Boolean(touched.expiryDate && errors.expiryDate),
                        helperText: touched.expiryDate && errors.expiryDate,
                      },
                    }}
                    value={toMomentOrNull(values.expiryDate)}
                    format='DD/MM/YYYY'
                    onChange={(e) =>
                      setFieldValue(
                        'expiryDate',
                        moment(e._d).format('YYYY-MM-DD'),
                      )
                    }
                    label='Expiry Date'
                  />
                </LocalizationProvider>
              </Grid>
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
                      {
                        errors.attachment && touched.attachment && (
                          <Typography
                            sx = {{
                              color : '#D42F36',
                              margin : '4px 14px 0px',
                              fontSize : 12
                            }}
                          >
                            {errors.attachment}
                          </Typography>
                        )
                      }
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
                  <Button
                    onClick={() => {
                      dispatch(completedIndexValue(userId));
                      dispatch(
                        EmployeeVerificationDetail({
                          employee_id: userId,
                          index_value: index,
                        }),
                      );
                      handleClose();
                    }}
                  >
                    Cancel
                  </Button>
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
      ) : (
        <>
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
              LICENSE TYPE - {values.document_name}
            </Grid>

            <Grid
              size={{
                md: 6,
                xs: 12
              }}>
              ISSUING AUTHORITY - {values.issued_by}
            </Grid>

            <Grid
              size={{
                md: 6,
                xs: 12
              }}>
              NUMBER - {values.dlNumber}
            </Grid>

            <Grid
              size={{
                md: 6,
                xs: 12
              }}>
              EXPIRY DATE - {values.expiry_date === null || values.expiry_date === '0000-00-00' ? 'NA' : moment(values.expiry_date).format('DD/MM/yyyy')}
            </Grid>

            <Grid
              size={{
                md: 12,
                xs: 12
              }}>
              {values.fileType === 'image' ? (
                <ZoomInBox>
                  <CardMedia
                    component='img'
                    image={values?.url}
                    width='100%'
                    height='100%'
                  />
                </ZoomInBox>
              ) : (
                <object
                  data={values?.url}
                  type='application/pdf'
                  width='100%'
                  height='100%'
                  style={{borderRadius: 10}}
                >
                  PDF cannot be displayed.
                </object>
              )}
            </Grid>

            <Grid
              display='flex'
              justifyContent='flex-end'
              alignItems='flex-end'
              size={{
                md: 12,
                xs: 12
              }}>
              <VerificationBadge
                verifiedBy={values.verifiedBy}
                verification_date={empVerificationDetail[0]?.verification_date}
                verification_time={empVerificationDetail[0]?.verification_time}
              />
            </Grid>

            <Grid
              display='flex'
              justifyContent='flex-end'
              size={{
                md: 12,
                xs: 12
              }}>
              <Button
                onClick={() => {
                  setEdit(true);
                  formik.resetForm();
                }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
}

export default LicenseVerification;
