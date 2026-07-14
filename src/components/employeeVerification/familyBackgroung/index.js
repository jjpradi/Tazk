import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardMedia,
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
  EmployeeVerificationDetail,
  completedIndexValue,
  createEmpVerificationAction,
  updateEmpVerificationAction,
} from 'redux/actions/userCreation_actions';
import * as Yup from 'yup';
import AddIcon from '@mui/icons-material/Add';
import UploadIcon from '@mui/icons-material/Upload';
import DropZone from '../documents/dropZone';
import ZoomInBox from 'utils/zoomInBox';
import VerifiedIcon from '@mui/icons-material/Verified';
import moment from 'moment';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import VerificationBadge from '../verificationBadge';
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

function FamilyBackgroundVerification(props) {
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
      setFieldValue('attachment', docFile);
      setPreview(true);
    }
  }, [docFile]);

  const docSchema = Yup.object().shape({
    report: Yup.string('Type').required('Agency/Person is Required!'),
    issued_by : Yup.string('Type').required('Reported By is Required!'),
    issued_date : Yup.string('Type').required('Reported On is Required!'),
    attachment: Yup.array()
      .min(1, 'Upload Document!')
      .required('Upload Document!'),
  });

  const formik = useFormik({
    initialValues: {
      verificationType: '',
      remarks: '',
      document_name: '',
      d_number: '',
      report: '',
      issued_by: '',
      issued_date: '',
      id: null,
      verifiedBy: null,
      isVerified: false,
      url: null,
      fileType: null,
      attachment: [],
    },

    enableReinitialize: true,
    validationSchema: docSchema,

    onSubmit: () => {
      let values = {...formik.values};

      let formData = new FormData();

      if (!docFile) {
        setErrors({attachment: 'Upload Document!'});
      } else {
        formData.append('fileType', docType);
        for (const single_file of docFile) {
          formData.append('index_value', index);
          formData.append('files', single_file);
          formData.append('emp_id', userId);
          formData.append('remarks', values.remarks);
          formData.append('document_type', null);
          formData.append('verifiedBy', values.verifiedBy);
          formData.append('d_number', null);
          formData.append('report', values.report);
          formData.append('issued_by', values.issued_by);
          formData.append('issued_date', values.issued_date);
          formData.append('reason', null);
          formData.append('dl_number', null);
          formData.append('latitude', null);
          formData.append('longitude', null);
          formData.append('expiry_date', null);
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
        parseInt(empVerificationDetail[0]?.document_type),
      );
      setFieldValue('remarks', empVerificationDetail[0]?.remarks);
      setFieldValue('document_name', empVerificationDetail[0]?.document_name);
      setFieldValue('id', empVerificationDetail[0]?.id);
      setFieldValue('verifiedBy', empVerificationDetail[0]?.verifiedByName);
      setFieldValue('url', empVerificationDetail[0]?.url);
      setFieldValue('fileType', empVerificationDetail[0]?.type);
      setFieldValue('report', empVerificationDetail[0]?.report);
      setFieldValue('issued_by', empVerificationDetail[0]?.issued_by);
      setFieldValue('issued_date', empVerificationDetail[0]?.issued_date);
    } else {
      setFieldValue('verificationType', '');
      setFieldValue('remarks', '');
      setFieldValue('document_name', '');
      setFieldValue('report', '');
      setFieldValue('issued_by', '');
      setFieldValue('issued_date', '');
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
    validateForm,
    setErrors,
    values,
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
                <TextField
                  required
                  fullWidth
                  label='AGENCY / PERSON'
                  name='report'
                  type='text'
                  {...getFieldProps('report')}
                  error={touched[`report`] && Boolean(errors[`report`])}
                  helperText={touched[`report`] && errors[`report`]}
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
                  label='REPORTED BY'
                  name='issued_by'
                  type='text'
                  {...getFieldProps('issued_by')}
                  error={touched[`issued_by`] && Boolean(errors[`issued_by`])}
                  helperText={touched[`issued_by`] && errors[`issued_by`]}
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
                        error: touched['issued_date'] && Boolean(errors['issued_date']),
                        helperText: touched['issued_date'] && errors['issued_date'],
                      },
                    }}
                    value={toMomentOrNull(values.issued_date)}
                    format='DD/MM/YYYY'
                    onChange={(e) =>
                      setFieldValue(
                        'issued_date',
                        moment(e._d).format('YYYY-MM-DD'),
                      )
                    }
                    label='REPORTED ON'
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
            spacing={7}
            sx={{p: '10px'}}
          >
            <Grid
              size={{
                md: 6,
                xs: 12
              }}>
              AGENCY / PERSON - {values.report}
            </Grid>

            <Grid
              size={{
                md: 6,
                xs: 12
              }}>
              REPORTED BY - {values.issued_by}
            </Grid>

            <Grid
              size={{
                md: 6,
                xs: 12
              }}>
              REPORTED ON - {moment(values.issued_date).format('DD/MM/yyyy')}
            </Grid>

            <Grid
              size={{
                md: 6,
                xs: 12
              }}>
              REMARKS - {values.remarks}
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

export default FamilyBackgroundVerification;
