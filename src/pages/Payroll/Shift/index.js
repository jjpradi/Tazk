import React, {useEffect, useState, useContext} from 'react';
import MaterialTable from 'utils/SafeMaterialTable';
import {useNavigate} from 'react-router-dom';
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
  FormHelperText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {useDispatch, useSelector} from 'react-redux';
import {attendancePolicyAction, getShiftListAction, listCompanyNameAction, shiftListPaginationAction, updateShiftDetails} from 'redux/actions/shifts.actions';
import context from '../../../context/CreateNewButtonContext';
import {createShiftsAction} from 'redux/actions/shifts.actions';
import CloseIcon from '@mui/icons-material/Close';
import apiCalls from 'utils/apiCalls';
import ShiftList from './shiftList';
import { getsessionStorage } from 'pages/common/login/cookies';
import { pageSize } from 'utils/pageSize';
import moment from 'moment';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import { LocalizationProvider, TimePicker, DatePicker } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import toMomentOrNull from 'utils/DateFixer';

export default function AddShift(props) {

  const { open, handleClose, mode, editRowData } = props;
  
  const [openg,setOpen] = useState(false)
  const [close, setClose] = useState(true);
  const dispatch = useDispatch();
  const {setModalTypeHandler, setLoaderStatusHandler} = useContext(context);
  const storage = getsessionStorage()
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [offDay, setOffDay] = useState(false);
  const [compensationOff, setCompensationOff] = useState(false);
  const [originalShiftShortCode, setOriginalShiftShortCode] = useState('');

  const {
    ShiftsReducer: {shifts, companyName,attendancePolicyList, shiftList},
  } = useSelector((state) => state);

  useEffect(() => {
      if (!companyName.length) {
        dispatch(
          listCompanyNameAction(setModalTypeHandler, setLoaderStatusHandler),
      )
    }
  }, []);
  useEffect(()=>{
    const payload = {
        type: 'Get'
    }
    dispatch(attendancePolicyAction(payload))
  },[])
  let navigate = useNavigate();
  const handleNavigate = () => {
    navigate('/payroll/shiftlist');

  };
  const {
    commoncookie,
    headerLocationId,
  } = useContext(context);

  const handleDetailPageCreateEdit = shiftList.length > 1 ? "EditDetailPageShift" : "CreateDetailPageShift"

  useEffect(() => {
    dispatch(getShiftListAction());
    if (props.pageType === 'detailpage') {
      if (handleDetailPageCreateEdit === "EditDetailPageShift") {
        setFormValues({
          ...formValues,
          id: shiftList[0]?.id,
          shift_name: shiftList[0]?.shift_name,
          shift_short_code: shiftList[0]?.shift_short_code,
          start_shift_time: shiftList[0]?.start_shift_time,
          end_shift_time: shiftList[0]?.end_shift_time,
          start_break_time: shiftList[0]?.start_break_time,
          end_break_time: shiftList[0]?.end_break_time,
          start_break1_time: shiftList[0]?.start_break1_time,
          end_break1_time: shiftList[0]?.end_break1_time,
          start_break2_time: shiftList[0]?.start_break2_time,
          end_break2_time: shiftList[0]?.end_break2_time,
        })
      }
    }
  }, [dispatch]);

  useEffect(() => {
    if (props.shiftDetails && props.pageType !== 'detailpage') {
      setOriginalShiftShortCode(props.shiftDetails.shift_short_code);
      setFormValues(props.shiftDetails); // Assuming you set form values based on the prop
    }
  }, [props.shiftDetails]);

  useEffect(() => {
    if (mode === 'edit' && props.pageType !== 'detailpage') {
      const temp = {
        shift_name: '',
        shift_short_code: '',
        start_shift_time: null,
        end_shift_time: null,
      }

      const editTempData = {
        shift_name: editRowData.shift_name,
        shift_short_code: editRowData.shift_short_code,
        start_shift_time: editRowData.start_shift_time,
        end_shift_time: editRowData.end_shift_time,
        start_break_time: editRowData.start_break_time,
        end_break_time: editRowData.end_break_time,
        start_break1_time: editRowData.start_break1_time,
        end_break1_time: editRowData.end_break1_time,
        start_break2_time: editRowData.start_break2_time,
        end_break2_time: editRowData.end_break2_time,
        over_time: editRowData.over_time,
      }

      setCompensationOff(editRowData.combo_off === 1 ? true : false)
      setOffDay(editRowData.combo_off === 1 ? false : true)
      setFormValues(editTempData)
      setFormErrors(temp)
    }

  }, [])

  const Days = [
    {id: 1, day: 'Sunday'},
    {id: 2, day: 'Monday'},
    {id: 3, day: 'Tuesday'},
    {id: 4, day: 'Wednesday'},
    {id: 5, day: 'Thursday'},
    {id: 6, day: 'Friday'},
    {id: 7, day: 'Saturday'},
  ];
  const [formValues, setFormValues] = useState({
    shift_name: props?.pageType === 'detailpage' ? 'General Shift' : null,
    shift_short_code: props?.pageType === 'detailpage' ? 'GS' : '',
    start_shift_time: null,
    end_shift_time: null,
    start_break_time: null,
    end_break_time: null,
    start_break1_time: null,
    end_break1_time: null,
    start_break2_time: null,
    end_break2_time: null,
    over_time: null,
    paid_leaves: null,
    company_name: storage?.company_name
  });

  const [formErrors, setFormErrors] = useState({
    shift_name: '',
    shift_short_code: '',
    start_shift_time: null,
    end_shift_time: null,
  });

  const [requiredFields] = useState([
    'shift_name',
    'shift_short_code'
  ]);

  const handleReset = () => {
    setIsFormSubmitted(false);
    setOffDay(false);
    setFormValues({
      shift_name: '',
      shift_short_code: '',
      start_shift_time: '',
      end_shift_time: '',
      start_break_time: '',
      end_break_time: '',
      start_break1_time: '',
      end_break1_time: '',
      start_break2_time: '',
      end_break2_time: '',
      over_time: '',
    });
    setFormErrors({
      shift_name: '',
      shift_short_code: '',
      start_shift_time: null,
      end_shift_time: null,
    });
  };

  const handleChange = async (e) => {
    let { name, value, checked } = e.target;
    if(name !== '') {
      if (name === 'combo_off') {
        setStateHandler(null)
        setCompensationOff(checked)
      } else if (name === 'shift_short_code') {
        const uppercaseRegex = /^[a-zA-Z0-9]{2,4}$/; // Allows 2 to 4 letters or digits
      
        if (!uppercaseRegex.test(value)) {
          setFormErrors({
            ...formErrors,
            shift_short_code: 'Shift Short Code must be 2 to 4 characters long!',
          });
        } else {
          setFormErrors({ ...formErrors, shift_short_code: '' });
        }
        setStateHandler(name, value);
      }  else {
        setStateHandler(name, value);
        validationHandler(name, value);
      }

    }


  };

  const handleCheck = (e) => {
    let { name, checked } = e.target;
    let obj = { ...formValues, [name]: checked }
    
    setFormValues(obj)
  }

  const setStateHandler = (name, value) => {
    let formObj = {};
    formObj = {
      ...formValues,
      [name]: value === '' ? '' : value,
    };
    setFormValues(formObj);
  };

  const handleTimeChange = (name) => (value) => {
    if (value && typeof value.toDate === 'function') {
      const jsDate = value.toDate();
      const hours = String(jsDate.getHours()).padStart(2, '0');
      const minutes = String(jsDate.getMinutes()).padStart(2, '0');
      handleChange({ target: { name, value: `${hours}:${minutes}` } });
    } else if (value instanceof Date) {
      const hours = String(value.getHours()).padStart(2, '0');
      const minutes = String(value.getMinutes()).padStart(2, '0');
      handleChange({ target: { name, value: `${hours}:${minutes}` } });
    } else {
      handleChange({ target: { name, value: '' } });
    }
  };

  const validationRules = {
    shift_name: { type: 'required', msg: 'Shift is Required!' },
    shift_short_code: { type: 'required', msg: 'Short Code is Required!' },
    mark_halfday_leave_hours: { type: 'numericMax', max: 5, numericMsg: 'Please enter numeric values only.', msg: 'Hours should be within 5 hours!' },
    mark_halfday_leave_minutes: { type: 'numericMax', max: 59, numericMsg: 'Please enter numeric values only.', msg: 'Minutes should be within 59 minutes!' },
    calculate_latedays_hours: { type: 'max', max: 12, msg: 'Hours should be with in 12 hr!' },
    calculate_leave_hours: { type: 'max', max: 12, msg: 'Hours should be with in 12 hr!' },
    calculate_halfday_hours: { type: 'max', max: 12, msg: 'Hours should be with in 12 hr!' },
    ot_min_hours: { type: 'max', max: 12, msg: 'Hours should be with in 12 hr!' },
    ot_max_hours: { type: 'max', max: 12, msg: 'Hours should be with in 12 hr!' },
    calculate_halfday_minutes: { type: 'max', max: 59, msg: 'Minutes should be with in 59 mins!' },
    calculate_leave_minutes: { type: 'max', max: 59, msg: 'Minutes should be with in 59 mins!' },
    calculate_latedays_minutes: { type: 'max', max: 59, msg: 'Minutes should be with in 59 mins!' },
    ot_min_minutes: { type: 'max', max: 59, msg: 'Minutes should be with in 59 mins!' },
    ot_max_minutes: { type: 'max', max: 59, msg: 'Minutes should be with in 59 mins!' },
  };

  const validationHandler = (name, value) => {
    if (!Object.keys(formErrors).includes(name)) return;
    const rule = validationRules[name];
    if (!rule) return;

    let error = null;
    if (rule.type === 'required') {
      error = value.length === 0 ? rule.msg : '';
    } else if (rule.type === 'numericMax') {
      if (value !== '' && !/^\d+$/.test(value)) {
        error = rule.numericMsg;
      } else if (value <= rule.max) {
        error = null;
      } else {
        error = rule.msg;
      }
    } else if (rule.type === 'max') {
      error = value > rule.max ? rule.msg : null;
    }
    setFormErrors({ ...formErrors, [name]: error });
  };
  let arr2 = ['mark_halfday_leave_minutes', 'mark_halfday_leave_hours', 'calculate_latedays_hours', 'calculate_leave_hours', 'calculate_halfday_minutes', 'calculate_halfday_hours', 'calculate_latedays_minutes', 'calculate_leave_minutes', 'ot_min_hours',
  'ot_min_minutes',
  'ot_max_hours',
  'ot_max_minutes',];

  const checkFormErrors = () => {
        let keys = arr2.some(key => formErrors[key] !== null );
        return keys
        }

  const handleSubmit = async () => {
    setIsFormSubmitted(true);
    let isValid = true;
    let formErrorsObj = {...formErrors};

    const originalShiftShortCode = mode === 'edit' ? editRowData.shift_short_code : '';

    Object.keys(formValues).forEach((key, i) => {
      if (requiredFields.includes(key) && (formValues[key] === null || formValues[key] === '') ) {
        isValid = false;
        formErrorsObj[key]= capitalize(key) + ' is Required!'; 
      }
    });

    const shiftCodeRegex =/^[a-zA-Z0-9]{2,4}$/;
    const lowercaseRegex = /[a-z]/;
      
    if (!shiftCodeRegex.test(formValues.shift_short_code)) {
      isValid = false;
      formErrorsObj.shift_short_code = 'Shift Short Code must be 2 to 4 characters long!';
    } else {
      formErrorsObj.shift_short_code = ''; 
    }

    const existingShiftCodes = shiftList.map(shift => shift.shift_short_code);
    if(props.pageType !== 'detailpage') {
      if (formValues.shift_short_code !== originalShiftShortCode && existingShiftCodes.includes(formValues.shift_short_code)) {
      formErrorsObj.shift_short_code = 'Shift short code already exists. Please enter a unique code.';
      isValid = false;
    }}

    // if (formValues.shift_short_code?.toLowerCase() !== 'nos') {
    //   if (!formValues.start_shift_time) {
    //     isValid = false;
    //     formErrorsObj.start_shift_time = 'Shift Start Time is Required!';
    //   }
    //   if (!formValues.end_shift_time) {
    //     isValid = false;
    //     formErrorsObj.end_shift_time = 'Shift End Time is Required!';
    //   }
    // }
    
    if (!formValues.start_shift_time) {
      isValid = false;
      formErrorsObj.start_shift_time = 'Shift Start Time is Required!';
    }
    if (!formValues.end_shift_time) {
      isValid = false;
      formErrorsObj.end_shift_time = 'Shift End Time is Required!';
    }

    // console.log("formValues",formValues)
    // console.log("formErrorsObj",formErrorsObj)

    if (formValues.start_shift_time && formValues.end_shift_time) {
      const start = new Date(`2000-01-01T${formValues.start_shift_time}`);
      let end = new Date(`2000-01-01T${formValues.end_shift_time}`);

      // If end time is less than start time, assume it's the next day
      if (end <= start) {
        end = new Date(`2000-01-02T${formValues.end_shift_time}`);
      }

      // Calculate time difference in hours
      const diffInHours = (end - start) / (1000 * 60 * 60);

      if (diffInHours >= 14) {
        isValid = false
        formErrorsObj.end_shift_time = 'Shift must be less than 14hr!';
      } else {
        setFormErrors({ ...formErrors, end_shift_time: '' });
      }
    }

    const toMinutes = (timeValue) => {
      if (!timeValue || typeof timeValue !== 'string') return null;
      const parts = timeValue.split(':');
      if (parts.length < 2) return null;
      const hours = Number(parts[0]);
      const minutes = Number(parts[1]);
      if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
      return (hours * 60) + minutes;
    };

    const isTimeWithinShift = (timeValue, shiftStart, shiftEnd) => {
      const timeMinutes = toMinutes(timeValue);
      const startMinutes = toMinutes(shiftStart);
      const endMinutes = toMinutes(shiftEnd);

      if (timeMinutes === null || startMinutes === null || endMinutes === null) return true;

      if (endMinutes > startMinutes) {
        return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
      }

      return timeMinutes >= startMinutes || timeMinutes <= endMinutes;
    };

    const breakFieldsToCheck = [
      { startKey: 'start_break_time', endKey: 'end_break_time', label: 'Meal time' },
      { startKey: 'start_break1_time', endKey: 'end_break1_time', label: 'Break 1 time' },
      { startKey: 'start_break2_time', endKey: 'end_break2_time', label: 'Break 2 time' },
    ];

    if (formValues.start_shift_time && formValues.end_shift_time) {
      const invalidBreak = breakFieldsToCheck.find(({ startKey, endKey }) => {
        const startBreakValue = formValues[startKey];
        const endBreakValue = formValues[endKey];

        return (
          (startBreakValue && !isTimeWithinShift(startBreakValue, formValues.start_shift_time, formValues.end_shift_time)) ||
          (endBreakValue && !isTimeWithinShift(endBreakValue, formValues.start_shift_time, formValues.end_shift_time))
        );
      });

      if (invalidBreak) {
        isValid = false;
        formErrorsObj.end_shift_time = `${invalidBreak.label} must be between shift start and end time.`;
      }
    }
    // if (formValues.end_shift_time < formValues.start_shift_time) {
    //   isValid = false;
    //   formErrorsObj.end_shift_time = 'End Shift Time must be after Start Shift Time!';
    // }
    setFormErrors(formErrorsObj);
    const padWithZero = (value) => value ? value.toString().padStart(2, '0') : '00';
  const submitData = { ...formValues };
  delete submitData.policy_name
  delete submitData.no_of_leave_per_week
  delete submitData.combo_off
  delete submitData.mark_halfday_leave_hours
  delete submitData.mark_halfday_leave_minutes
  delete submitData.calculate_halfday_hours
  delete submitData.calculate_halfday_minutes
  delete submitData.calculate_leave_hours
  delete submitData.calculate_leave_minutes
  delete submitData.calculate_latedays_hours
  delete submitData.calculate_latedays_minutes
  delete submitData.ot_min_hours
  delete submitData.ot_min_minutes
  delete submitData.ot_max_hours
  delete submitData.ot_max_minutes
  delete submitData.off_day1
  delete submitData.off_day2
  delete submitData.w1
  delete submitData.w2
  delete submitData.w3
  delete submitData.w4
  delete submitData.w5
  delete submitData.w6
  delete submitData.no_of_leave_per_week
  delete submitData.combo_off
  delete submitData.mark_halfday_leave
  delete submitData.calculate_halfday
  delete submitData.calculate_leave
  delete submitData.calculate_latedays
  delete submitData.ot_min
  delete submitData.ot_max
  const tempData = {
    ...submitData,
    shift_short_code: submitData.shift_short_code.toUpperCase(),
  };

    const body = {
      searchString:'',
      employeeId:commoncookie,
      headerLocationId: headerLocationId,
      pageCount:0,
      numPerPage: pageSize,
    }

      if(isValid ){
        if (props.pageType === 'detailpage') {
          if (handleDetailPageCreateEdit === "EditDetailPageShift") {
            dispatch(
              updateShiftDetails(
                tempData,
                shiftList[0]?.id,
                setModalTypeHandler,
                setLoaderStatusHandler,
                'detailpage'
              )
    
            ).then(() => {
          apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(shiftListPaginationAction(body))
          );
        });
            props.handleSubmit()
          } else {
            dispatch(
              createShiftsAction(
                tempData,
                setModalTypeHandler,
                setLoaderStatusHandler,
                'detailpage'
              ),
            ).then(() => {
          apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(shiftListPaginationAction(body))
          );
        });
            props.handleSubmit()
          }

        }
        if (mode === 'add' && props.pageType !== 'detailpage') {
          apiCalls(
           setModalTypeHandler,
           setLoaderStatusHandler,
        dispatch(
          createShiftsAction(
            tempData,
            setModalTypeHandler,
            setLoaderStatusHandler
          ),
        ).then(() => {
          apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(shiftListPaginationAction(body))
          );
        })
      );

      } else if (mode === 'edit' && props.pageType !== 'detailpage') {
        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
       dispatch(
          updateShiftDetails(
            tempData,
            editRowData?.id,
            setModalTypeHandler,
            setLoaderStatusHandler
          )

        )
      )
      }
      if(props.pageType !== 'detailpage') {
      handleClose(false)
      handleNavigate();
      }
      if(props.pageType === 'detailpage') {
        props.handleSubmit()
      }
    }
    else{
      const errorMessages = Object.values(formErrorsObj).filter(
        (val) => val !== null && val !== ""
      );

      if (errorMessages.length > 0) {
        dispatch(OpenalertActions({ msg: errorMessages[0], severity: 'warning' }));
      } else {
        dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }));
      }

    }
  if (props.setSearchString) {
    props.setSearchString('');
  }
  };


  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  function isPastTime(start, end) {
    const checkStart = start ? start : formValues.start_shift_time
    const checkEnd = end ? end : formValues.end_shift_time
    
    return checkStart < checkEnd
  };

  return (
    <>
      <Card sx={{padding: '20px',height : 'calc(100vh - 80px)', display: 'flex',flexDirection: 'column',justifyContent: 'space-between'}}>
        <Grid container spacing={3} display='flex' alignItems={'center'}>
          <Grid
            display='flex'
            justifyContent={'flex-start'}
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 6
            }}>
            <Typography  className='page-title'>{mode === 'edit' ? 'Update Shift' : 'Add Shift'}</Typography>
          </Grid>
          <Grid
            display='flex'
            justifyContent={'flex-end'}
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 6
            }}>
            {props.pageType !== 'detailpage' && <IconButton
              aria-label='close'
              onClick={() => props.handleClose(false)}
            >
              <CloseIcon />
            </IconButton>}
          </Grid>
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Divider />
          </Grid>
          <Grid
            size={{
              lg: 10,
              md: 10,
              sm: 10,
              xs: 10
            }}>
            <Grid container spacing={3} display='flex' alignItems={'center'}>
            </Grid>
            <Grid
              container
              spacing={3}
              display='flex'
              alignItems={'center'}
              paddingTop='20px'
            >
              {/* <Grid size={{ sm: 3, md: 3, lg: 3 }}>
                <Typography variant='h6'>Shift Name</Typography>
              </Grid> */}
              <Grid
                size={{
                  lg: 6,
                  md: 6,
                  sm: 12,
                  xs: 12
                }}>
                <TextField
                  variant='filled'
                  fullWidth={true}
                  required={true}
                  label='Shift Name'
                  name='shift_name'
                  value={props.pageType === 'detailpage' ? 'General Shift' : formValues.shift_name}
                  onChange={handleChange}
                  error={formErrors.shift_name}
                  helperText={
                    formErrors.shift_name === '' ? '' : 'Shift Name is Required!'
                  }
                ></TextField>
              </Grid>
              {/* <Grid size={{ sm: 3, md: 3, lg: 3 }}>
                <Typography variant='h6'>Shift Short Code</Typography>
              </Grid> */}
              <Grid
                size={{
                  lg: 6,
                  md: 6,
                  sm: 12,
                  xs: 12
                }}>
                <TextField
                  variant='filled'
                  fullWidth={true}
                  required={true}
                  label='Shift Short Code'
                  name='shift_short_code'
                  value={props.pageType === 'detailpage' ? 'GS' : formValues.shift_short_code}
                  onChange={handleChange}
                  error={!!formErrors.shift_short_code}
                  helperText={
                    formErrors.shift_short_code || ''
                  }
                ></TextField>
              </Grid>
            </Grid>
            <Grid
              container
              spacing={3}
              display='flex'
              alignItems={'center'}
              paddingTop='20px'
            >
              {/* <Grid size={{ sm: 3, md: 3, lg: 3 }}>
              </Grid> */}
              <Grid
                // paddingTop={3}
                // paddingLeft={3}
                size={{
                  lg: 3,
                  md: 3,
                  sm: 12,
                  xs: 12
                }}>
                <Button fullWidth variant="contained" onClick={()=>{setFormValues({...formValues,start_shift_time: "10:00",end_shift_time:"19:00"})}}>General Shift</Button>
              </Grid>
              <Grid
                // paddingTop={3}
                // paddingLeft={3}
                size={{
                  lg: 3,
                  md: 3,
                  sm: 12,
                  xs: 12
                }}>
              <Button fullWidth variant="contained" onClick={()=>{setFormValues({...formValues,start_shift_time: "06:00",end_shift_time:"14:00"})}}>First Shift</Button>
              </Grid>
              <Grid
                // paddingTop={3}
                // paddingLeft={3}
                size={{
                  lg: 3,
                  md: 3,
                  sm: 12,
                  xs: 12
                }}>
              <Button fullWidth variant="contained" onClick={()=>{setFormValues({...formValues,start_shift_time: "14:00",end_shift_time:"22:00"})}}>Second Shift</Button>
              </Grid>
              <Grid
                // paddingTop={3}
                // paddingLeft={3}
                size={{
                  lg: 3,
                  md: 3,
                  sm: 12,
                  xs: 12
                }}>
              <Button fullWidth variant="contained" onClick={()=>{setFormValues({...formValues,start_shift_time: "22:00",end_shift_time:"06:00"})}}>Third Shift</Button>
              </Grid>
            </Grid>
            <Grid
              container
              spacing={3}
              display='flex'
              alignItems={'center'}
              paddingTop='20px'
            >
              {/* <Grid size={{ sm: 3, md: 3, lg: 3 }} container item>
                <Typography variant='h6'> Shift Time </Typography>
              </Grid> */}
              <Grid
                // paddingTop={3}
                // paddingLeft={3}
                size={{
                  lg: 6,
                  md: 6,
                  sm: 12,
                  xs: 12
                }}>
      {/* <TextField
        fullWidth
        label="Shift Start Time"
        required={formValues.start_shift_time?.toLowerCase() !== 'nos'}
        onChange={handleChange}
        name="start_shift_time"
        type="time"
        variant="filled"
        value={formValues.start_shift_time}
        error={
          formValues.start_shift_time?.toLowerCase() !== 'nos' &&
          !formValues.start_shift_time && 
          !!formErrors.start_shift_time
        }
        helperText={
          formValues.start_shift_time?.toLowerCase() !== 'nos' &&
          !formValues.start_shift_time && 
          formErrors.start_shift_time
            ? 'Shift Start Time is Required!'
            : ''
        }
        InputLabelProps={{ style: { transform: 'translateY(2px)', paddingLeft: '12px' } }}
      /> */}
                <LocalizationProvider dateAdapter={DateAdapter}>
                  <TimePicker
                    label="Shift Start Time"
                    // value={formValues.start_shift_time}
                    value={
                      formValues.start_shift_time
                        ? toMomentOrNull(`1970-01-01T${formValues.start_shift_time}`)
                        : null
                    }
                    onChange={handleTimeChange('start_shift_time')}

                    required={formValues.start_shift_time?.toLowerCase?.() !== 'nos'}
                    slotProps={{ textField: { fullWidth: true, required: true, name: "start_shift_time", variant: "filled", error: formValues.start_shift_time?.toLowerCase() !== 'nos' &&
                          !formValues.start_shift_time &&
                          !!formErrors.start_shift_time, helperText: formValues.start_shift_time?.toLowerCase() !== 'nos' &&
                            !formValues.start_shift_time &&
                            formErrors.start_shift_time
                            ? 'Shift Start Time is Required!'
                            : '', InputLabelProps: {
                          style: { transform: 'translateY(2px)', paddingLeft: '12px' },
                        } } }}
                  />
                </LocalizationProvider>
    </Grid>

    <Grid
      direction='row'
      size={{
        lg: 6,
        md: 6,
        sm: 12,
        xs: 12
      }}>
      {/* <TextField
        fullWidth
        label='Shift End Time'
        required={formValues.end_shift_time?.toLowerCase() !== 'nos'}
        onChange={handleChange}
        name='end_shift_time'
        type='time'
        variant='filled'
        value={formValues.end_shift_time}
        error={
          formValues.end_shift_time?.toLowerCase() !== 'nos' &&
          !formValues.end_shift_time &&
          !!formErrors.end_shift_time
        }
        helperText={
          formValues.end_shift_time?.toLowerCase() !== 'nos' &&
          !formValues.end_shift_time &&
          formErrors.end_shift_time
            ? 'Shift End Time is Required!'
            : ''
        }
        InputLabelProps={{ style: { transform: 'translateY(2px)', paddingLeft: '12px' } }}
      /> */}
                  <LocalizationProvider dateAdapter={DateAdapter}>
                    <TimePicker
                      label="Shift End Time"
                      // value={formValues.end_shift_time}
                      value={
                        formValues.end_shift_time
                          ? toMomentOrNull(`1970-01-01T${formValues.end_shift_time}`)
                          : null
                      }
                      onChange={handleTimeChange('end_shift_time')}

                      required={formValues.end_shift_time?.toLowerCase?.() !== 'nos'}
                      slotProps={{ textField: { fullWidth: true, required: true, name: "end_shift_time", variant: "filled", error: formValues.end_shift_time?.toLowerCase?.() !== 'nos' &&
                            !formValues.end_shift_time &&
                            !!formErrors.end_shift_time, helperText: formValues.end_shift_time?.toLowerCase?.() !== 'nos' &&
                              !formValues.end_shift_time &&
                              formErrors.end_shift_time
                              ? 'Shift End Time is Required!'
                              : '', InputLabelProps: {
                            style: { transform: 'translateY(2px)', paddingLeft: '12px' },
                          } } }}
                    />
                  </LocalizationProvider>
    </Grid>

              </Grid> 
              <Grid
              container
              spacing={3}
              display='flex'
              alignItems={'center'}
              paddingTop='20px'
            >
              {/* <Grid size={{ sm: 3, md: 3, lg: 3 }} container item>
                <Typography variant='h6'> Meal Time</Typography>
              </Grid> */}

              <Grid
                // paddingTop={3}
                // paddingLeft={3}
                size={{
                  lg: 6,
                  md: 6,
                  sm: 12,
                  xs: 12
                }}>
                {/* <TextField
                  fullWidth={true}
                  onChange={handleChange}
                  name='start_break_time'
                  type='time'
                  variant='filled'
                  label='Meal Start Time'
                  value={formValues.start_break_time === '00:00:00' ? null : formValues.start_break_time}
                  InputLabelProps={{ style: { transform: 'translateY(2px)', paddingLeft: '12px' } }}
                ></TextField> */}
                <LocalizationProvider dateAdapter={DateAdapter}>
                  <TimePicker
                    label="Meal Start Time"
                    value={
                      formValues.start_break_time
                        ? toMomentOrNull(`1970-01-01T${formValues.start_break_time}`)
                        : null
                    }
                    onChange={handleTimeChange('start_break_time')}

                    // required={formValues.start_break_time?.toLowerCase?.() !== 'nos'}
                    slotProps={{ textField: { fullWidth: true, name: "start_break_time", variant: "filled", InputLabelProps: {
                          style: { transform: 'translateY(2px)', paddingLeft: '12px' },
                        } } }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid
                size={{
                  lg: 6,
                  md: 6,
                  sm: 12,
                  xs: 12
                }}>
                {/* <TextField
                  fullWidth={true}
                  required={true}
                  onChange={handleChange}
                  name='end_break_time'
                  type='time'
                  value={formValues.end_break_time === '00:00:00' ? null : formValues.end_break_time }
                  InputLabelProps={{ style: { transform: 'translateY(2px)', paddingLeft: '12px' } }}
                  variant='filled'
                  label='Meal End Time'
                ></TextField> */}
                <LocalizationProvider dateAdapter={DateAdapter}>
                  <TimePicker
                    label="Meal End Time"
                    value={
                      formValues.end_break_time
                        ? toMomentOrNull(`1970-01-01T${formValues.end_break_time}`)
                        : null
                    }
                    onChange={handleTimeChange('end_break_time')}

                    // required={formValues.end_break_time?.toLowerCase?.() !== 'nos'}
                    slotProps={{ textField: { fullWidth: true, name: "end_break_time", variant: "filled", InputLabelProps: {
                          style: { transform: 'translateY(2px)', paddingLeft: '12px' },
                        } } }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
              {attendancePolicyList[0]?.tea1_break !== "00:00:00" && <Grid
              container
              spacing={3}
              display='flex'
              alignItems={'center'}
              paddingTop='20px'
            >
              {/* <Grid size={{ sm: 3, md: 3, lg: 3 }} container item>
                <Typography variant='h6'> Break 1 Time</Typography>
              </Grid> */}

              <Grid
                // paddingTop={3}
                // paddingLeft={3}
                size={{
                  lg: 6,
                  md: 6,
                  sm: 12,
                  xs: 12
                }}>
                {/* <TextField
                  fullWidth={true}
                  onChange={handleChange}
                  name='start_break1_time'
                  type='time'
                  variant='filled'
                  label='Break 1 Start Time'
                  value={formValues.start_break1_time === '00:00:00' ? null : formValues.start_break1_time}
                  InputLabelProps={{ style: { transform: 'translateY(2px)', paddingLeft: '12px' } }}
                ></TextField> */}
                <LocalizationProvider dateAdapter={DateAdapter}>
                  <TimePicker
                    label="Break 1 Start Time"
                    value={
                      formValues.start_break1_time
                        ? toMomentOrNull(`1970-01-01T${formValues.start_break1_time}`)
                        : null
                    }
                    onChange={handleTimeChange('start_break1_time')}

                    // required={formValues.start_break1_time?.toLowerCase?.() !== 'nos'}
                    slotProps={{ textField: { fullWidth: true, name: "start_break1_time", variant: "filled", InputLabelProps: {
                          style: { transform: 'translateY(2px)', paddingLeft: '12px' },
                        } } }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid
                size={{
                  lg: 6,
                  md: 6,
                  sm: 12,
                  xs: 12
                }}>
                {/* <TextField
                  fullWidth={true}
                  required={true}
                  onChange={handleChange}
                  name='end_break1_time'
                  type='time'
                  value={formValues.end_break1_time === '00:00:00' ? null : formValues.end_break1_time }
                  variant='filled'
                  label='Break 1 End Time'
                  InputLabelProps={{ style: { transform: 'translateY(2px)', paddingLeft: '12px' } }}
                ></TextField> */}
                 <LocalizationProvider dateAdapter={DateAdapter}>
                  <TimePicker
                    label="Break 1 End Time"
                    value={
                      formValues.end_break1_time
                        ? toMomentOrNull(`1970-01-01T${formValues.end_break1_time}`)
                        : null
                    }
                    onChange={handleTimeChange('end_break1_time')}

                    // required={formValues.end_break1_time?.toLowerCase?.() !== 'nos'}
                    slotProps={{ textField: { fullWidth: true, name: "end_break1_time", variant: "filled", InputLabelProps: {
                          style: { transform: 'translateY(2px)', paddingLeft: '12px' },
                        } } }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>}
            {attendancePolicyList[0]?.tea2_break !== "00:00:00" && <Grid
              container
              spacing={3}
              display='flex'
              alignItems={'center'}
              paddingTop='20px'
            >
              {/* <Grid size={{ sm: 3, md: 3, lg: 3 }} container item>
                <Typography variant='h6'> Break 2 Time</Typography>
              </Grid> */}

              <Grid
                // paddingTop={3}
                // paddingLeft={3}
                size={{
                  lg: 6,
                  md: 6,
                  sm: 12,
                  xs: 12
                }}>
                {/* <TextField
                  fullWidth={true}
                  onChange={handleChange}
                  name='start_break2_time'
                  type='time'
                  variant='filled'
                  label='Break 2 Start Time'
                  value={formValues.start_break2_time === '00:00:00' ? null : formValues.start_break2_time}
                  InputLabelProps={{ style: { transform: 'translateY(2px)', paddingLeft: '12px' } }}
                ></TextField> */}
                <LocalizationProvider dateAdapter={DateAdapter}>
                  <TimePicker
                    label="Break 2 Start Time"
                    value={
                      formValues.start_break2_time
                        ? toMomentOrNull(`1970-01-01T${formValues.start_break2_time}`)
                        : null
                    }
                    onChange={handleTimeChange('start_break2_time')}

                    // required={formValues.start_break2_time?.toLowerCase?.() !== 'nos'}
                    slotProps={{ textField: { fullWidth: true, name: "start_break2_time", variant: "filled", InputLabelProps: {
                          style: { transform: 'translateY(2px)', paddingLeft: '12px' },
                        } } }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid
                size={{
                  lg: 6,
                  md: 6,
                  sm: 12,
                  xs: 12
                }}>
                {/* <TextField
                  fullWidth={true}
                  required={true}
                  onChange={handleChange}
                  name='end_break2_time'
                  type='time'
                  value={formValues.end_break2_time === '00:00:00' ? null : formValues.end_break2_time }
                  variant='filled'
                  label='Break 2 End Time'
                  InputLabelProps={{ style: { transform: 'translateY(2px)', paddingLeft: '12px' } }}
                ></TextField> */}
                 <LocalizationProvider dateAdapter={DateAdapter}>
                  <TimePicker
                    label="Break 2 End Time"
                    value={
                      formValues.end_break2_time
                        ? toMomentOrNull(`1970-01-01T${formValues.end_break2_time}`)
                        : null
                    }
                    onChange={handleTimeChange('end_break2_time')}

                    // required={formValues.end_break2_time?.toLowerCase?.() !== 'nos'}
                    slotProps={{ textField: { fullWidth: true, name: "end_break2_time", variant: "filled", InputLabelProps: {
                          style: { transform: 'translateY(2px)', paddingLeft: '12px' },
                        } } }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>}

            </Grid>
          </Grid>
        <Grid
          spacing={5}
          container={true}
          direction='row'
          display='flex'
          justifyContent='flex-end'
          pt={'20px'}
        >
          <Grid>
           {props.pageType === 'detailpage' ? <Button
              onClick={props.handleBack}
              style={{}}
              name='Submit'
              variant='contained'
              color='secondary'
              size='medium'
              text='button'
              fullWidth={false}
              type='submit'
            >
              Back
            </Button> : <Button
              onClick={handleReset}
              style={{}}
              name='Submit'
              variant='contained'
              color='secondary'
              size='medium'
              text='button'
              fullWidth={false}
              type='submit'
            >
              Reset
            </Button>}
          </Grid>

          <Grid>
            <Button
              onClick={() => handleSubmit()}
              style={{}}
              name='Cancel'
              variant='contained'
              color='primary'
              size='medium'
              text='button'
              fullWidth={false}
              type='cancel'
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </Card>
      {close === false && <ShiftList close={close} />}
    </>
  );
}

