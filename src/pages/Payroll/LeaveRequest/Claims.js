import React, { useContext, useEffect, useState } from 'react';
import {
  Autocomplete,
  Grid,
  Paper,
  Card,
  TextField,
  Divider,
  IconButton,
  Button,
  Dialog,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  CardContent,
  Box,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {FileUpload} from '@mui/icons-material';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import {AdapterDateFns as AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker, DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import apiCalls from 'utils/apiCalls';
import context from '../../../../src/context/CreateNewButtonContext';
import { getEmpbasecompanyAction } from 'redux/actions/attendance_actions';
import { useDispatch, useSelector } from 'react-redux';
import {createClaimsAction, getClaimsCategoryAction, searchClaimAndOthersAction} from 'redux/actions/loan_actions';
import { format } from 'date-fns';
import { RequestClaimAlert } from 'redux/actions/load';
import AttachmentField from 'pages/common/Timesheet/Attachment';
import { headerStyle } from 'utils/pageSize';
import { CreateNotificationAction, getNotificationTokenAction } from 'redux/actions/notification_actions';
import { getDateTimeFormat } from 'utils/getTimeFormat';
import { getsessionStorage } from 'pages/common/login/cookies';
import toMomentOrNull from 'utils/DateFixer';
import moment from 'moment';

const ClaimForm = (props) => {
  const { onBack } = props;
  const curDate = new Date();
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const dispatch = useDispatch();
  const [isApiFinished, setIsApiFinished] = useState(false);
  const { LoanReducer: { claimsCategory , createClaim} } = useSelector(state => state)
  const [previews, setPreviews] = useState([]);
  const [imgName, setImgName] = useState('');
  const [imgType, setImgType] = useState(null);
  const [imageStatus, setimageStatus] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [open, setOpen] = useState(false);
  const [imageKey,setImageKey]=useState([]);
  const storage = getsessionStorage()
  const {
    attendanceReducer: { get_empbasecompany },
  } = useSelector((state) => state);
  const {
    commoncookie,
    headerLocationId,
    setModalStatusHandler,
    setLoaderStatusHandler, setModalTypeHandler } = useContext(context);

  const monthOptions = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  

  const [formValues, setFormValues] = useState({
    category: null,
    category_id:null,
    sub_category: null,
    bill_date: null,
    bill_no: '',
    bill_amount: '',
    claim_amount: '',
    remarks: '',
    attachment: null
  });

  console.log(formValues,'formvallll')

  
  const [formErrors, setFormErrors] = useState({
    category: '',
    sub_category: '',
    bill_date: '',
    bill_no: '',
    bill_amount: '',
    claim_amount: '',
    remarks: '',
    attachment: null
  });

  const [requiredFields] = useState([
    'bill_date',
    'bill_no',
    'bill_amount',
    'claim_amount',
    'remarks'
  ]);

  const closeFunction = () => {
    setFormValues({
      ...formValues,
    })
    props.handleClose()
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const handleDateChange = (date) => {
    setFormValues({ ...formValues, bill_date: date });

    // Clear the error when a date is selected
    if (formErrors.bill_date) {
      setFormErrors({ ...formErrors, bill_date: '' });
    }
  };

  const encodeImageFileAsURL = (element) => {
    var file = element.target.files[0];
    // var name = element.target.files[0].name;
    if (file) {
      if (imgName !== file.name) {
        setImgName(file.name);
        setImgType(file.type);
      }
    }
    setFormValues({...formValues, attachment: element.target.files[0]});
    var reader = new FileReader();
    reader.onloadend = function () {
      setFormValues({...formValues, attachment: reader.result});
      setimageStatus(false);
    };
    reader.readAsDataURL(file);
  };

  const deleteFile = (e) => {
    setFormValues({...formValues, attachment: null});
    setImgName('');
    setImgType(null);
    setOpen(false);
  }

  const handleImageDelete = (index) => {
        const updatedImages = [...previews];
        updatedImages.splice(index, 1);
        setPreviews(updatedImages);
  
        const updatedImageKeys = [...imageKey]
        updatedImageKeys.splice(index, 1)
        setImageKey(updatedImageKeys)
  };

  const handleReset = () => {
    setIsFormSubmitted(false);
    setFormValues({
      category: null,
      sub_category: null,
      bill_date: null,
      bill_no: '',
      bill_amount: '',
      claim_amount: '',
      remarks: '',
      attachment: []
    });
    setFormErrors({
      category: '',
      sub_category: '',
      bill_date: '',
      bill_no: '',
      bill_amount: '',
      claim_amount: '',
      remarks: '',
      attachment: []
    });
  };

  const handleClaimSubmit = async (event) => {
    event.preventDefault();
  
    let isValid = true;
    let formErrorsObj = { ...formErrors };
  
Object.keys(formValues).forEach((key) => {
      if (requiredFields.includes(key) && (formValues[key] === null || formValues[key] === '')) {
      isValid = false;
      formErrorsObj[key] = 'This Field is Required!';
    }
});
  
    await setFormErrors(formErrorsObj);
  
    if (isValid) {
      const { date, ...updateData } = formValues;
  
      updateData.category = formValues.category.category_name;
      updateData.category_id = formValues.category.id;
      updateData.sub_category = formValues.sub_category;
      updateData.bill_date = formValues.bill_date ? format(formValues.bill_date.toDate(), 'yyyy-MM-dd') : '';
      updateData.bill_no = formValues.bill_no;
      updateData.bill_amount = formValues.bill_amount;
      updateData.claim_amount = formValues.claim_amount;
      updateData.remarks = formValues.remarks;
      updateData.attachment = formValues.attachment;
      updateData.request_type=6
      console.log('updateData', updateData);

      
      let type = 'Claim Request';
      let employee_id = storage?.employee_id || '';
      let data1 = {
        type,
        request_type_id : 6,
        employee_id,
        category_name : formValues.category.category_name,
        claim_amount : formValues.claim_amount
      };
      let payload = {
        searchString: '',
          fromdate: '',
          todate: '',
          employeeId: null,
          pageCount: page,
          numPerPage: pageSize,
          type:"claimsAndOthers"
      };
  
      try {
        await apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(RequestClaimAlert),
          dispatch(createClaimsAction({ ...updateData }))
        );
       await dispatch(
        getNotificationTokenAction(data1, (res) => {
          if (res?.status === 200) {
            dispatch(
              CreateNotificationAction({
                content_body: res?.data.body,
                receiver:res?.data.receiver_id,
                title: res?.data?.title,
                time: getDateTimeFormat(new Date()),
                active: '1',
                type_id : createClaim?.notifyData?.[0]?.insertId
              }),
            );
          }
        }),
      );
      await dispatch(searchClaimAndOthersAction(payload));
  
        props.handleClose();
        setFormValues({
          category: '',
          sub_category: '',
          bill_date: null,
          bill_no: '',
          bill_amount: '',
          claim_amount: '',
          remarks: '',
          attachment: [],
        });
      } catch (error) {
        console.error('Error', error);
      }
    }
  };
  
  console.log("claimsCategory",previews)

  return (
    <>
      <Grid
        container
        display='flex'
        flexDirection='row'
        alignItems='center'
        spacing={3}
      >
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <FormControl fullWidth variant='filled'>
            <Autocomplete
              options={claimsCategory}
              getOptionLabel={(option) => option.category_name}
              value={formValues.category}
              onChange={(event, value) =>
                setFormValues({...formValues, category: value})
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  name='category'
                  label='Category'
                  variant='filled'
                />
              )}
            />
          </FormControl>
        </Grid>
        {/* <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
              <FormControl fullWidth variant='filled'>
                <Autocomplete
                  options={monthOptions}
                  value={formValues.sub_category}
                  onChange={(event, newValue) => setFormValues({ ...formValues, sub_category: newValue })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label = "Sub Category"
                      name='sub_category'
                      variant="filled"
                    />
                  )}
                />
              </FormControl>
            </Grid> */}
      </Grid>
      <Grid
        container
        display='flex'
        flexDirection='row'
        alignItems='center'
        spacing={3}
        sx={{marginTop: '16px'}}
      >
        <Grid
          size={{
            lg: 6,
            md: 6,
            sm: 6,
            xs: 12
          }}>
          {/* <LocalizationProvider dateAdapter={DateAdapter}>
            <DatePicker
              format='DD/MM/YYYY'
              name='bill_date'
              label='Bill Date'
              value={toMomentOrNull(formValues.bill_date)}
              onChange={handleDateChange}
              maxDate={curDate}
              slotProps={{ textField: { variant: 'filled', fullWidth: true, required: true, error: !!formErrors.bill_date, helperText: formErrors.bill_date } }}
            />
          </LocalizationProvider> */}
        <LocalizationProvider dateAdapter={DateAdapter}>
          <DatePicker
            label='Bill Date'
            name='bill_date'
            value={formValues.bill_date ? toMomentOrNull(formValues.bill_date) : null}
            onChange={handleDateChange}
            views={['year', 'month', 'day']}
            maxDate={moment()}
            slotProps={{
              textField: {
                variant: 'filled',
                fullWidth: true,
                error: false,
              },
            }}
          />
        </LocalizationProvider>
        </Grid>
        <Grid
          size={{
            lg: 6,
            md: 6,
            sm: 6,
            xs: 12
          }}>
          <TextField
            fullWidth
            required
            name='bill_no'
            label='Bill No'
            variant='filled'
            type='number'
            onChange={handleChange}
            value={formValues.bill_no || ''} // Ensure value is set properly
            inputProps={{min: '0', pattern: '[0-9]*'}}
            error={!!formErrors.bill_no}
            helperText={formErrors.bill_no}
          />
        </Grid>
      </Grid>
      <Grid
        container
        display='flex'
        flexDirection='row'
        alignItems='center'
        spacing={3}
        sx={{marginTop: '16px'}}
      >
        <Grid
          size={{
            lg: 6,
            md: 6,
            sm: 6,
            xs: 12
          }}>
          <TextField
            fullWidth
            required
            name='bill_amount'
            label='Bill Amount'
            variant='filled'
            type='number'
            value={formValues.bill_amount || ''}
            onChange={(e) => {
              const {name, value} = e.target;
              const numericValue = parseFloat(value);

              if (numericValue <= 0 || isNaN(numericValue)) {
                setFormErrors((prevErrors) => ({
                  ...prevErrors,
                  [name]: 'Bill Amount must be greater than zero',
                }));
              } else {
                setFormErrors((prevErrors) => ({
                  ...prevErrors,
                  [name]: '',
                }));
                setFormValues((prevValues) => ({
                  ...prevValues,
                  [name]: numericValue,
                }));
              }
            }}
            inputProps={{min: '1', pattern: '[0-9]*'}}
            error={!!formErrors.bill_amount}
            helperText={formErrors.bill_amount}
          />
        </Grid>

        <Grid
          size={{
            lg: 6,
            md: 6,
            sm: 6,
            xs: 12
          }}>
          <TextField
            fullWidth
            required
            name='claim_amount'
            label='Claim Amount'
            variant='filled'
            type='number'
            value={formValues.claim_amount || ''} // Ensure value is set properly
            onChange={(e) => {
              const {name, value} = e.target;
              const numericValue = parseFloat(value);

              if (numericValue <= 0 || isNaN(numericValue)) {
                setFormErrors((prevErrors) => ({
                  ...prevErrors,
                  [name]: 'Claim Amount must be greater than zero',
                }));
              } else {
                setFormErrors((prevErrors) => ({
                  ...prevErrors,
                  [name]: '',
                }));
                setFormValues((prevValues) => ({
                  ...prevValues,
                  [name]: numericValue,
                }));
              }
            }}
            inputProps={{min: '1', pattern: '[0-9]*'}}
            error={!!formErrors.claim_amount}
            helperText={formErrors.claim_amount}
          />
        </Grid>
      </Grid>
      <Grid
        container
        display='flex'
        flexDirection='row'
        alignItems='center'
        spacing={3}
        sx={{marginTop: '16px'}}
      >
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <TextField
            fullWidth
            required
            name='remarks'
            label='Remarks'
            variant='filled'
            value={formValues.remarks || ''} // Ensure value is set properly
            onChange={handleChange}
            error={!!formErrors.remarks}
            helperText={formErrors.remarks}
          />
        </Grid>
      </Grid>
      <Grid
        container
        display='flex'
        alignItems='center'
        spacing={3}
        sx={{marginTop: '16px'}}
      >
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <label htmlFor='contained-button-file'>
            <input
              style={{display: 'none'}}
              accept='image/*'
              id='contained-button-file'
              type='file'
              name='attachment'
              onChange={encodeImageFileAsURL}
            />
            <Box display={'flex'} direction='row'>
              <Button
                sx={{}}
                variant='contained'
                color='primary'
                component='span'
                fullWidth
              >
                {imgName === '' ? (
                  'Image Upload'
                ) : (
                  <span
                    style={{
                      display: 'inline-block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {imgName}
                  </span>
                )}
                <FileUpload />
              </Button>

              {imgName === '' ? (
                ''
              ) : (
                <Button
                  disabled={imgName === '' ? true : false}
                  onClick={() => {
                    setOpen(true);
                  }}
                  variant='outlined'
                  color='secondary'
                >
                  preview
                </Button>
              )}
            </Box>
          </label>

          <Dialog
            open={open}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
          >
            <DialogTitle>
              <Typography variant='h1'>{'Image preview'}</Typography>
            </DialogTitle>
            <DialogContent style={{width: 500}}>
              {imgName === '' ? (
                ''
              ) : (
                <>
                  <span>
                    <img
                      style={{
                        width: '450px',
                        height: '400px',
                        borderRadius: '10px',
                      }}
                      src={
                        imageStatus
                          ? `${base_url}${formValues.attachment}`
                          : formValues.attachment
                      }
                      alt=''
                    />
                  </span>
                  {/* <Close  /> */}
                </>
              )}
              <DialogActions>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={() => setOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant='contained'
                  color='secondary'
                  onClick={deleteFile}
                >
                  Delete
                </Button>
              </DialogActions>
            </DialogContent>
          </Dialog>

          <div style={{color: 'red', fontSize: headerStyle.fontSize}}>
            {imgType === null ||
            imgType === 'image/jpeg' ||
            imgType === 'image/png'
              ? ''
              : 'Invalid Image Format'}
          </div>
        </Grid>
      </Grid>
      <Grid
        container
        justifyContent='flex-end'
        alignItems='center'
        sx={{marginTop: '16px'}}
        spacing={2}
      >
        <Grid>
          <Button variant='outlined' onClick={closeFunction}>
            Cancel
          </Button>
        </Grid>
        <Grid>
          <Button
            variant='contained'
            color='primary'
            onClick={handleClaimSubmit}
          >
            Send request
          </Button>
        </Grid>
      </Grid>
    </>
  );
}
export default ClaimForm;