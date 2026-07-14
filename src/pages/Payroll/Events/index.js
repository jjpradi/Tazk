import React, {useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import context from '../../../context/CreateNewButtonContext';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Fab,
  Grid,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Modal,
  Table,
  TextField,
  Typography,
} from '@mui/material';
import List from '@mui/material/List';
import {
  addNewEventAction,
  deleteEventAction,
  eventNameAction,
  listEventAction,
  updateEventAction,
} from 'redux/actions/userCreation_actions';
import {getsessionStorage} from 'pages/common/login/cookies';
import {Form, FormikProvider, useFormik} from 'formik';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {getEventNameAction} from 'redux/actions/userRole_actions';
import {useTheme} from '@mui/material';
import * as Yup from 'yup';
import apiCalls from 'utils/apiCalls';
import toMomentOrNull from 'utils/DateFixer';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';

const validationSchema = Yup.object({
  event_id: Yup.string().required('Event Name is required'),
  value: Yup.date().required('Event Date is required').nullable(),
});

const Events = () => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [mode, setMode] = useState('ADD');
  const [editData, setEditData] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [filterOpen, setFilterOpen] = useState(false);
  const {
    setLoaderStatusHandler,
    setModalStatusHandler,
    setModalTypeHandler,
    commoncookie,
  } = useContext(context);

  const storage = getsessionStorage();
  const selectedRole = storage?.role_name;


  const {
    UserCreationReducer: {listEvent},
    UserRoleReducer: {eventName},
    rbacReducer: { menuAccess },
  } = useSelector((state) => state);
  console.log(listEvent,'listevent')
  const BASE_URL = 'https://devserver.tazk.in';

  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

  useEffect(() => {
    console.log('fdsff', storage.employee_id);
    dispatch(listEventAction(storage.employee_id));
    dispatch(getMenuAccessAction(selectedRole))
    console.log('opedndd', open);
  }, []);

  const initializeFormValues = () => {
    console.log('sdfsfsdd', mode, editData);
    if (mode === 'EDIT' || mode === 'DELETE') {
      console.log('comedgfdg');
      return {
        event_id: editData.event_id,
        value: editData.value,
      };
    } else {
      return {
        event_id: '',
        value: null,
      };
    }
  };

  const [initialValues, setInitialValues] = useState(initializeFormValues());

  useEffect(() => {
    // if (mode === 'EDIT') {
    setInitialValues(initializeFormValues());
    // }
  }, [mode]);

  const formik = useFormik({
    initialValues: initialValues,
    enableReinitialize: true,
    validationSchema: validationSchema,

    onSubmit: async() => {
      let values = {...formik.values};

      console.log('submitting', values);
      const body = {
        event_id: values.event_id,
        value: values.value,
        employee_id: storage.employee_id,
      };
      console.log("felete",editData.id);
      if (mode === 'EDIT') {
        const body = {
          event_id:values.event_id,
          value: values.value,
        };
        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          await dispatch(updateEventAction(editData.id, body)),
          await dispatch(listEventAction(storage.employee_id)),
        )
       
      } else if (mode === 'DELETE') {
        await apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          await dispatch(deleteEventAction(editData.id)),
          await dispatch(listEventAction(storage.employee_id)),
        )
        
      } else {
        await apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          await dispatch(addNewEventAction(body)),
          await dispatch(listEventAction(storage.employee_id)),
        )
       
      }
      
      setMode('ADD');
      setOpen(false);
      setDeleteOpen(false);
      setEditData('')
      formik.resetForm();
      close(false);
    },
    validateOnBlur: true,
    validateOnChange: true,
  });

  const {
    errors,
    touched,
    getFieldProps,
    setFieldValue,
    handleBlur,
    handleSubmit,
    setErrors,
    values,
    setFieldTouched,
  } = formik;

  const handleClose = () => {
    setOpen(false);
    setMode('ADD');
    setEditData('');
  };

  const handleOpen = () => {
    setOpen(true);
    // if(open === true ){
    dispatch(getEventNameAction());
    //  }
  };

  const disableEditDelete = (eventName) => {
    return eventName === 'Join Date' || eventName === 'Birthday';
  };

  const handleEditOpen = (item) => {
    console.log('roedataa', item);
    setMode('EDIT');
    setOpen(true);
    setEditData(item);
    dispatch(getEventNameAction());
  };

  const handleDeleteDialog = (item) => {
    setMode('DELETE');
    setDeleteOpen(true);
    setEditData(item);
  };

  const handleDeleteClose = () => {
    setMode('ADD');
    setDeleteOpen(false);
  };

  console.log('values', values);

  console.log(
    'thiis',listEvent
  );
  const canEdit = storage ?.company_type === 5 ? UserRightsAuthorization(menuAccess[selectedRole], 'events', 'can_edit') : true ;
  const canDelete = storage ?.company_type === 5 ? UserRightsAuthorization(menuAccess[selectedRole], 'events', 'can_delete') : true ;
  const canAdd = storage?.company_type === 5 ? UserRightsAuthorization(menuAccess[selectedRole], 'events', 'can_create') : true;
  return (
    <div>
      <Card sx={{p: 4, margin: 'auto',minHeight: '100vh'}}>
        <Grid container justifyContent='space-between' sx={{mt: '10px'}}>
          <Grid
            size={{
              xs: 6,
              sm: 3,
              md: 3,
              lg: 3
            }}>
            <Typography variant='h5' component='div'>
              Events
            </Typography>
          </Grid>
          <Grid
            container
            justifyContent='flex-end'
            sx={{mb: '-10px'}}
            size={{
              xs: 6,
              sm: 9,
              md: 9,
              lg: 9
            }}>
            {canAdd && (
            <Fab size="large" color="primary" onClick={handleOpen}>Add</Fab>
            )}
          </Grid>
        </Grid>
        <Grid container spacing={6} sx={{mt: '1px'}}>
          {listEvent.length > 0 ? (
            listEvent.map((item, key) => (
              <Grid
                key={key}
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4
                }}>
                <Card
                  sx={{
                    height: '100px',
                    // boxShadow: `0px 4px 20px ${blackx}`
                    boxShadow: 8,
                  }}
                >
                  <List
                    sx={{
                      width: '100%',
                      bgcolor: 'background.paper',
                      boxShadow: 'inherit',
                      height: '100%',
                    }}
                  >
                    {/* <Grid size={{ xs: 12, sm: 6, md: 4 }} key={key}> */}
                    <ListItem alignItems='flex-start'>
                      <ListItemAvatar>
                        <Avatar
                          alt={item.event_name}
                          src={BASE_URL + item.event_image_name}
                        />
                      </ListItemAvatar>

                      <ListItemText
                        primary={item.event_name}
                        secondary={
                          <React.Fragment>
                            {/* <Typography
                          sx={{ display: 'inline' }}
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {item.value}
                        </Typography> */}
                            {` ${moment(item.value).format('DD-MM-YYYY')}`}
                          </React.Fragment>
                        }
                      />
                      {/* <Grid  > */}
                      <Grid>
                        {canEdit && (
                        <IconButton
                        // size="small"
                        color="primary"
                          onClick={() => handleEditOpen(item)}
                          disabled={disableEditDelete(item.event_name)}
                        >
                          <EditIcon fontSize='small' />
                        </IconButton>
                        )}
                      </Grid>
                      <Grid>
                        {canDelete && (
                        <IconButton
                        // size="small"
                        color="secondary"
                          onClick={() => handleDeleteDialog(item)}
                          disabled={disableEditDelete(item.event_name)}
                        >
                          <DeleteIcon fontSize='small' />
                        </IconButton>
                        )}
                      </Grid>
                      {/* </Grid> */}
                    </ListItem>
                    {/* </Grid> */}
                  </List>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography>No Records Found</Typography>
          )}
          <Grid>
            <Dialog
              sx={{
                '& .MuiDialog-container': {
                  '& .MuiPaper-root': {
                    width: '100%',
                    maxWidth: '700',
                  },
                },
              }}
              open={open}
              onClose={handleClose}
              aria-labelledby='alert-dialog-title'
              aria-describedby='alert-dialog-description'
            >
              <DialogTitle id='alert-dialog-title'>
                {mode === 'EDIT' ? 'Edit Event' : 'New Event'}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id='alert-dialog-description'>
                  <FormikProvider value={formik}>
                    <Form onSubmit={formik.handleSubmit}>
                      <Grid
                        spacing={3}
                        // lg={12}
                        // md={12}
                        // sm={12}
                        // xs={12}
                        container
                        direction='row'
                        //
                      >
                        <Grid
                          size={{
                            lg: 6,
                            md: 6,
                            sm: 6,
                            xs: 12
                          }}>
                          <Autocomplete
                            options={eventName}
                            name='event_id'
                            // required={true}
                            fullWidth={true}
                            type='text'
                            onChange={(event, value) =>
                              formik.setFieldValue(
                                'event_id',
                                value ? value.id : null,
                              )
                            }
                            value={
                              formik.values.event_id
                                ? eventName.find(
                                    (option) =>
                                      option.id === formik.values.event_id,
                                  )
                                : null
                            }
                            getOptionLabel={(option) => option.event_name}
                            // error={errors.event_id}
                            //           helperText={
                            //             errors.event_id === null ? '' : errors.event_id
                            //           }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label='Select'
                                variant='filled'
                                error={formik.touched.event_id && Boolean(formik.errors.event_id)}
                                helperText={formik.touched.event_id && formik.errors.event_id && (
                                  <div style={{ color: 'red' }}>{"Event Name is required"}</div>
                                )}
                              />
                            )}
                          />
                        </Grid>
                        <Grid
                          size={{
                            lg: 6,
                            md: 6,
                            sm: 6,
                            xs: 12
                          }}>
                          <LocalizationProvider dateAdapter={DateAdapter}>
                            <DatePicker
                              label='Event Date'
                              format='DD/MM/YYYY'
                              value={toMomentOrNull(values.value)}
                              onChange={(date) =>
                                setFieldValue(
                                  'value',
                                  date
                                    ? moment(date?._d).format('YYYY-MM-DD')
                                    : null,
                                )
                              }
                              slotProps={{ textField: { variant: 'filled', error: formik.touched.value && Boolean(formik.errors.value), helperText: formik.touched.value && formik.errors.value && (
                                    <div style={{ color: 'red' }}>{"Event Date is required"}</div>
                                  ) } }}
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
                          <Grid
                            spacing={7}
                            container
                            direction='row'
                            display='flex'
                            justifyContent='flex-start'
                            paddingTop='25px'
                          ></Grid>
                        </Grid>
                      </Grid>
                      <DialogActions>
                        <Button
                          // onClick={handleSubmit}
                          style={{}}
                          name='Submit'
                          variant='contained'
                          color='primary'
                          size='medium'
                          text='button'
                          fullWidth={false}
                          type='submit'
                        >
                          Submit
                        </Button>
                        <Button onClick={handleClose} autoFocus>
                          Close
                        </Button>
                      </DialogActions>
                    </Form>
                  </FormikProvider>
                </DialogContentText>
              </DialogContent>
            </Dialog>
          </Grid>
          <Grid>
            <Dialog
              sx={{
                '& .MuiDialog-container': {
                  '& .MuiPaper-root': {
                    width: '100%',
                    maxWidth: '700',
                  },
                },
              }}
              open={deleteOpen}
              onClose={handleClose}
              aria-labelledby='alert-dialog-title'
              aria-describedby='alert-dialog-description'
            >
              <DialogTitle id='alert-dialog-title'>
                Are you sure you want to delete this event?
              </DialogTitle>
              {/* <DialogContent>
                <DialogContentText id='alert-dialog-description'>
                  <FormikProvider value={formik}>
                    <Form onSubmit={formik.handleSubmit}>
                      <Grid
                        spacing={3}
                        container
                        direction='row'
                        //
                      >
                        <Grid
                          size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                          }}>
                          <Grid
                            spacing={7}
                            container
                            direction='row'
                            display='flex'
                            justifyContent='flex-start'
                            paddingTop='25px'
                          ></Grid>
                        </Grid>
                      </Grid>
  
                    </Form>
                  </FormikProvider>
                </DialogContentText>
              </DialogContent> */}
                      <DialogActions>
                        <Button
                          // onClick={handleSubmit}
                          style={{}}
                          name='Submit'
                          variant='contained'
                          color='primary'
                          size='medium'
                          text='button'
                          fullWidth={false}
                          type='submit'
                        >
                          Yes
                        </Button>
                        <Button onClick={handleDeleteClose} autoFocus>
                          No
                        </Button>
                      </DialogActions>
            </Dialog>
          </Grid>
        </Grid>
      </Card>
    </div>
  );
};

export default Events;
