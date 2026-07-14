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
  Dialog,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {Form, FormikProvider, useFormik} from 'formik';
import React, {useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  completedIndexValue,
  createEmpVerificationAction,
  updateEmpVerificationAction,
} from 'redux/actions/userCreation_actions';
import * as Yup from 'yup';
import AddIcon from '@mui/icons-material/Add';
import UploadIcon from '@mui/icons-material/Upload';
import DropZone from '../documents/dropZone';
import moment from 'moment';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import VerifiedIcon from '@mui/icons-material/Verified';
import OpenStreetMap from '../map/index';
import apiCalls from 'utils/apiCalls';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';

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
  const {index, userId, edit, setEdit, handleClose, handleDialogOpen} = props;
  const dispatch = useDispatch();

  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(CreateNewButtonContext);

  const {
    UserCreationReducer: {empVerificationDetail, verificationType},
  } = useSelector((s) => s);

  const [openMap, setOpenMap] = useState(false);
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

  const handleVerification = () => {
    setFieldValue('isVerified', !values.isVerified);
  };

  const licenseSchema = Yup.object().shape({
    verificationType : Yup.string('Select Type').required('Type is Required!'),
    latitude : Yup.string('Type').required('Latitude is Required!'),
    longitude : Yup.string('Type').required('Longitude is Required!'),
    attachment : Yup.array()
      .min(1, 'Upload Document!')
      .required('Upload Document!')
  });

  const formik = useFormik({
    initialValues: {
      verificationType: '',
      latitude: '',
      longitude: '',
      remarks: '',
      document_name: '',
      id: null,
      expiryDate: null,
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
          formData.append('remarks', values.remarks);
          formData.append('document_type', values.verificationType);
          formData.append('expiry_date', null);
          formData.append('reason', null);
          formData.append('dl_number', null);
          formData.append('latitude', values.latitude);
          formData.append('longitude', values.longitude);
        }

        if (values.id) {
          apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(updateEmpVerificationAction(formData, values.id, () => {})),
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
      setFieldValue('latitude', empVerificationDetail[0]?.latitude);
      setFieldValue('longitude', empVerificationDetail[0]?.longitude);
      setFieldValue('remarks', empVerificationDetail[0]?.remarks);
      setFieldValue('document_name', empVerificationDetail[0]?.document_name);
      setFieldValue('id', empVerificationDetail[0]?.id);
    } else {
      setFieldValue('verificationType', '');
      setFieldValue('latitude', '');
      setFieldValue('longitude', '');
      setFieldValue('remarks', '');
      setFieldValue('document_name', '');
      setFieldValue('id', null);
      setEdit(true);
    }
  }, [empVerificationDetail]);

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

  const h = '700px';
  const w = '100%';
  const location = {lat: 12.991023, lng: 80.218278};

  const handleNumberOnly = (e, fieldName) => {
  const value = e.target.value;
  const regex = /^-?\d*\.?\d*$/;

  if (regex.test(value)) {
    setFieldValue(fieldName, value);
  }
};


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
            label="Latitude"
            name="latitude"
            value={values.latitude}
            onChange={(e) => handleNumberOnly(e, "latitude")}
            error={Boolean(touched.latitude && errors.latitude)}
            helperText={touched.latitude && errors.latitude}
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
            label="Longitude"
            name="longitude"
            value={values.longitude}
            onChange={(e) => handleNumberOnly(e, "longitude")}
            error={Boolean(touched.longitude && errors.longitude)}
            helperText={touched.longitude && errors.longitude}
          />
          </Grid>


          <Grid
            size={{
              md: 6,
              xs: 12
            }}>
            <Button onClick={() => setOpenMap(true)}>Open map</Button>
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

        <Dialog open={openMap} onClose={() => setOpenMap(false)} fullScreen>
          <DialogContent>
            <OpenStreetMap
              zoom={14}
              style={{height: h, width: w}}
              location={location}
              setFieldValue={setFieldValue}
              setOpenMap={setOpenMap}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenMap(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Form>
    </FormikProvider>
  );
}

export default NewForm;
