import { Button, Card, Collapse, Divider, Grid, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import React, { useEffect, useRef, useState,useContext } from 'react';
import dayjs from 'dayjs';
import { useDispatch } from 'react-redux';
import { ApproveAttendance_Action, AttendanceProcessAction, updateAttendanceAction } from 'redux/actions/attendance_actions';
import { Duration } from 'components/regexFunction';
import context from '../../../context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import moment from 'moment';
import CommonDialog from 'components/commonDialog';
import ReasonDialog from 'pages/Payroll/LeaveRequest/reasonDialog';
import { ApproveLeaveRequestAction } from 'redux/actions/leaveRequest_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import toMomentOrNull from '../../../utils/DateFixer';

export default function Correction(props) {
  const { rowData, attendance_process, fromDate, toDate, locationName, empName } = props;
  const [initialState, setInitialState] = useState({});
  const tempedits = useRef(null);
  const dispatch = useDispatch();

  const storage = getsessionStorage()


  const [formValues, setFormValues] = useState({
    first_in_date: null,
    first_in_time: null,
    last_out_time: null,
    last_out_date: null,
    break_start_date: null,
    break_start_time: null,
    break_end_date: null,
    break_end_time: null,
    work_hours: '',
    break_hours: '',
    network_hours: '',
    early_duration: '',
    overstay_duration: '',
    extrawork: '',
    latein_duration: '',
    id: null,
    break_id: null,
    user_id: null,
    leaveId: null,
    attendance_log_id: null
  });


    const a = new Date('2000-01-01 ' + rowData.correctionStart);
    const b = new Date('2000-01-01 ' +  rowData.correctionEnd);
    
    // Use toLocaleTimeString to format the time in 24-hour format
    const CorrectionStartTime = a.toLocaleTimeString('en-US', { hour12: false });
    const CorrectionEndTime = b.toLocaleTimeString('en-US', { hour12: false });
 
  
  const [formErrors, setFormErrors] = useState({
    first_in_date: null,
    first_in_time: null,
    last_out_time: null,
    last_out_date: null,
    break_start_date: null,
    break_start_time: null,
    break_end_date: null,
    break_end_time: null,
    id: null,
    break_id: null,
    attendance_log_id: null
  });


  const handleChange = async (e) => {
    let { name, value } = e.target;
    console.log('namesdds',name, value)
    setStateHandler(name, value);
  };

  const [inputValue, setInputValue] = useState({
    work_hours: '',
    break_hours: '',
    network_hours: '',
    early_duration: '',
    overstay_duration: '',
    extrawork: '',
    latein_duration: ''
  });
  const [regex] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState('attendanceCorrection');
  const netWorkHours = calculateNetWorkHours(rowData.work_hours || '', rowData.break_hours ? rowData.break_hours : '00:00:00' || '');
  const earlyInDuration = calculateEarlyInDuration(rowData.start_shift_time || '', rowData.first_in_time || '');
  const lateInDuration = calculateLateInDuration(rowData.start_shift_time || '', rowData.first_in_time || '');
  const extraWorkDuration = calculateExtraWorkDuration(rowData.end_shift_time || '', rowData.last_out_time || '');
  const lateInDurationDisplay = lateInDuration > 0 ? `${lateInDuration} min` : '-';
  const earlyInDurationDisplay = earlyInDuration > 0 ? `${earlyInDuration} min` : '-';
  const extraWorkDurationDisplay = extraWorkDuration > 0 ? `${extraWorkDuration} min` : '-';
  const [requiredFields] = useState(selectedSection === 'attendanceCorrection' ?
    [
      'break_end_time',
      'break_start_time',
      'break_end_date',
      'break_start_date'
    ]
    :
    [
      'last_out_time',
      'first_in_time',
      'last_out_date',
      'first_in_date'
    ]
  );
  const handleSectionChange = (event, newSection) => {
    if (newSection !== null) {
      setSelectedSection(newSection);
    }
  };



  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);

  // console.log('rowData',rowData)

  const handleSubmit = async (event) => {
    const { id,attendance_log_id, break_id, first_in_date, first_in_time, last_out_date, last_out_time, break_start_time, break_end_time, user_id, leaveId } = formValues;

    const dateString = first_in_time;
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    // const seconds = String(date.getSeconds()).padStart(2, '0');
    const firstInTimeString = `${hours}:${minutes}`;
    console.log('firstInTimeString', firstInTimeString)

    const dateString1 = last_out_time;
    const date1 = new Date(dateString1);
    const hours1 = String(date1.getHours()).padStart(2, '0');
    const minutes1 = String(date1.getMinutes()).padStart(2, '0');
    // const seconds = String(date.getSeconds()).padStart(2, '0');
    const lastOutTimeString = `${hours1}:${minutes1}`;
    console.log('lastOutTimeString', lastOutTimeString)

    let data = {
      id: rowData.attendance_log_id,
      break_id: 'break_id' in formValues ? break_id : 'null',
      user_id: rowData.user_id,
      leaveId: leaveId,
      Attendance_correction: {
        start_time: `${first_in_date} ${firstInTimeString}`,
        end_time: `${last_out_date} ${lastOutTimeString}`,
      },
      Break_punches: {
        start_time: break_start_time,
        end_time: break_end_time,
      },
      old_time : {
        start_time: `${first_in_date} ${CorrectionStartTime}`,
        end_time: `${last_out_date} ${CorrectionEndTime}`,
      },
      shift_id: rowData.shidt_id
    }
    event.preventDefault();
    let isValid = true;
    let formErrorsObj = { ...formErrors };
    await Object.keys(formValues).map((key, i) => {
      if (
        requiredFields.includes(key) &&
        (formValues[key] === null || formValues[key] === '' || formValues[key].length === 0)
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' is Required!';
      } else if (regex[key]) {
        if (!regex[key].test(formValues[key])) {
          isValid = false;
          formErrorsObj[key] = capitalize(key) + ' is Invalid!';
        }
      }
      return null;
    });
    const approvedBy = { approvedBy: storage?.first_name }
    await setFormErrors(formErrorsObj);
    if (isValid){
      let data1 = {
        employee_id: empName === '' ? 'null' : empName,
        location_id: locationName === '' ? 'null' : locationName,
        from: moment(fromDate).format('yyyy-MM-DD'),
        to: moment(toDate).format('yyyy-MM-DD'),
      };
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
       dispatch(updateAttendanceAction(data.id, data.break_id, data, () => {
          dispatch(ApproveAttendance_Action(data1)),
          dispatch(ApproveLeaveRequestAction(storage.employee_id,data.leaveId, approvedBy))
       })),
      //  dispatch(AttendanceProcessAction(data1)),
      //  dispatch(ApproveAttendance_Action(data1))
      )
    props.handleClose();
    //props.handleOpen();
    }
  }

  const setStateHandler = async (name, value) => {
    let formObj = {};

    formObj = {
      ...formValues,
      [name]: value === '' ? null : value,
    };

    await setFormValues(formObj);
    validationHandler(name, value);
  };
  const validationHandler = (name, value) => {
    if (!Object.keys(formErrors).includes(name)) return;
    if (
      requiredFields.includes(name) &&
      (value === null ||
        value === 'null' ||
        value === '' ||
        value === false ||
        (Object.keys(value) && value.value === null))
    ) {
      setFormErrors({
        ...formErrors,
        [name]: capitalize(name) + ' is Required!',
      });
    } else if (regex[name]) {
      if (!regex[name].test(value)) {
        setFormErrors({
          ...formErrors,
          [name]: capitalize(name) + ' is Invalid!',
        });
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
      }
    } else {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const edits = () => {
    if (rowData) {
      console.log('rowData',rowData)
      setFormValues(rowData);
      setInitialState(rowData);
    }
  };
  tempedits.current = edits;
  useEffect(() => {
    tempedits.current();
  }, [rowData]);

  function calculateNetWorkHours(workHours, breakHours) {
    // Assuming workHours and breakHours are in the format HH:MM
    // Parse hours and minutes from the strings
    const [workHoursValue, workMinutes] = workHours?.split(':').map(Number);
    const [breakHoursValue, breakMinutes] = breakHours?.split(':').map(Number);

    // Calculate netWorkHours by subtracting breakHours from workHours
    const netWorkHoursValue = workHoursValue - breakHoursValue;
    const netWorkMinutes = workMinutes - breakMinutes;

    // Format the resulting value as HH:MM
    const formattedHours = String(netWorkHoursValue).padStart(2, '0');
    const formattedMinutes = String(netWorkMinutes).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
  }

  function calculateEarlyInDuration(shiftStartTime, actualCheckInTime) {
    // Assuming shiftStartTime and actualCheckInTime are in the format HH:MM:SS
    const [shiftHours, shiftMinutes, shiftSeconds] = shiftStartTime?.split(':').map(Number);
    const [actualHours, actualMinutes, actualSeconds] = actualCheckInTime?.split(':').map(Number);

    // Convert hours and minutes to total minutes
    const shiftTotalMinutes = shiftHours * 60 + shiftMinutes;
    const actualTotalMinutes = actualHours * 60 + actualMinutes;

    // Calculate the difference in minutes
    const diffMinutes = actualTotalMinutes - shiftTotalMinutes;

    // Check if the actual check-in time is early compared to the shift start time
    if (diffMinutes < 0) {
      return Math.abs(diffMinutes); // Return the absolute difference in minutes
    }

    return 0; // Return 0 if the actual check-in time is not early
  }

  function calculateLateInDuration(shiftEndTime, actualCheckInTime) {
    // Assuming shiftEndTime and actualCheckInTime are in the format HH:MM:SS
    const [shiftHours, shiftMinutes, shiftSeconds] = shiftEndTime.split(':').map(Number);
    const [actualHours, actualMinutes, actualSeconds] = actualCheckInTime.split(':').map(Number);

    // Convert hours and minutes to total minutes
    const shiftTotalMinutes = shiftHours * 60 + shiftMinutes;
    const actualTotalMinutes = actualHours * 60 + actualMinutes;

    // Calculate the difference in minutes
    const diffMinutes = actualTotalMinutes - shiftTotalMinutes;

    // Check if the actual check-in time is late compared to the shift end time
    if (diffMinutes > 0) {
      return diffMinutes; // Return the difference in minutes
    }

    return 0; // Return 0 if the actual check-in time is not late
  }

  function calculateExtraWorkDuration(startTime, endTime) {
    const [startHours, startMinutes, startSeconds] = startTime?.split(':').map(Number);
    const [endHours, endMinutes, endSeconds] = endTime?.split(':').map(Number);

    // Create Date objects for start and end times
    const startDate = new Date();
    startDate.setHours(startHours, startMinutes, startSeconds);

    const endDate = new Date();
    endDate.setHours(endHours, endMinutes, endSeconds);

    // Calculate the time difference in milliseconds
    const timeDiff = endDate - startDate;

    // Convert milliseconds to hours, minutes, and seconds
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    // Return the extra work duration as a formatted string
    return `${hours}:${minutes}:${seconds}`;
  }

  useEffect(() => {
    const date = new Date();     
    const date1 = new Date(); 
    const timeStringStartTime = CorrectionStartTime; 
    const [hours, minutes, seconds] = timeStringStartTime.split(':')
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(seconds);
    const timeStringEndTime = CorrectionEndTime; 
    const [hours1, minutes1, seconds1] = timeStringEndTime.split(':')
    date1.setHours(hours1);
    date1.setMinutes(minutes1);
    date1.setSeconds(seconds1);
    const formattedStartTime = date.toDateString() + ' ' + date.toLocaleTimeString('en-US', {timeZoneName: 'short'});
    const formattedEndTime = date1.toDateString() + ' ' + date1.toLocaleTimeString('en-US', {timeZoneName: 'short'});
    // console.log('dddddokwf',formattedEndTime)
    setFormValues({
        ...formValues,
        first_in_time: formattedStartTime || '', //data?.startTime || '', //formattedStartTime || '',
        last_out_time: formattedEndTime || '', //data?.endTime || '', //formattedEndTime || ''
        first_in_date: rowData.first_in_date,
        last_out_date: rowData.last_out_date,
    });
}, [CorrectionEndTime, CorrectionStartTime])

  function convertTo12HourFormat(time24) {
    const [hours, minutes] = time24.split(':');
    let suffix = 'AM';
    let hours12 = parseInt(hours, 10);
    
    if (hours12 >= 12) {
        suffix = 'PM';
        hours12 -= 12;
    }
    
    if (hours12 === 0) {
        hours12 = 12;
    }
    
    return `${hours12}:${minutes} ${suffix}`;
  }

// Example usage:
const time24 = "14:30"; // 24-hour format
const time12 = convertTo12HourFormat(time24);

  function convertTo24HourFormat(time) {
    const is12HourFormat = moment(time, ['h:mm A', 'hh:mm A'], true).isValid();
    if (is12HourFormat) {
      return moment(time, 'h:mm A').format('HH:mm');
    }
  
    return time; // Already in 24-hour format
  }

  console.log('CorrectionTime', formValues.first_in_date)
  return (
    <>
      <Card sx={{ display: 'flex' }}>
        <Grid container spacing={6} display='flex' flexDirection='row' padding={'20px'}>


          {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}> */}
            {/* <ToggleButtonGroup
              value={selectedSection}
              exclusive
              onChange={handleSectionChange}
              aria-label="attendance-section-toggle"
              fullWidth
            >
              <ToggleButton value="attendanceCorrection" aria-label="attendance-correction-toggle" color="primary">
                Attendance Correction
              </ToggleButton>
              <ToggleButton value="breakPunches" aria-label="break-punches-toggle" color="primary">
                Break Punches
              </ToggleButton>
              <ToggleButton value="attendanceDetails" aria-label="attendance-details-toggle" color="primary">
                Attendance Details
              </ToggleButton>
            </ToggleButtonGroup> */}
          {/* </Grid> */}


          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            {selectedSection === 'attendanceCorrection' && (
              <Grid container display={'flex'} flexDirection='row' spacing={5}>
                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <Typography variant='h6'>Attendance Correction</Typography>
                </Grid>

                <Grid
                  display={'flex'}
                  justifyContent={"center"}
                  size={{
                    lg: 6,
                    md: 6,
                    sm: 6,
                    xs: 12
                  }}>
                  <Grid container display={'flex'} justifyContent={"center"} flexDirection='row' spacing={5}>
                    <Grid
                      display={'flex'}
                      justifyContent={"center"}
                      size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                      }}>
                      <Typography variant='h6'>Check in</Typography>
                    </Grid>

                    <Grid
                      display={'flex'}
                      justifyContent={"center"}
                      size={{
                        lg: 11.5,
                        md: 11.5,
                        sm: 11,
                        xs: 12
                      }}>
                      <TextField
                        fullWidth={true}
                        required={true}
                        onChange={handleChange}
                        name='first_in_date'
                        type='date'
                        value={formValues.first_in_date}
                        InputProps={{
                          readOnly: formValues.first_in_date === formValues.last_out_date,
                        }}
                        error={formErrors.first_in_date}
                        helperText={formErrors.first_in_date === null ? '' : 'In date is Required!'}
                      ></TextField>
                    </Grid>
                    <Grid
                      size={{
                        lg: 0.5,
                        md: 0.5,
                        sm: 1,
                        xs: 1
                      }}>
                <Divider orientation='vertical' />
                    </Grid>
                    

                    

                    <Grid
                      display={'flex'}
                      justifyContent={"center"}
                      size={{
                        lg: 11.5,
                        md: 11.5,
                        sm: 11,
                        xs: 12
                      }}>
                      <TextField
                        fullWidth={true}
                        disabled
                        onChange={handleChange}
                        label="Check-IN"
                        name='first_in_time'
                        regex=''
                        value={rowData.first_in_time ? moment(rowData.first_in_time, 'HH:mm:ss').format('hh:mm A') : ''}
                      ></TextField>
                    </Grid>
                    <Grid
                      size={{
                        lg: 0.5,
                        md: 0.5,
                        sm: 1,
                        xs: 1
                      }}>
                      <Divider orientation='vertical' />
                    </Grid>

                <Grid
                  display={'flex'}
                  justifyContent={"center"}
                  size={{
                    lg: 11.5,
                    md: 11.5,
                    sm: 11,
                    xs: 12
                  }}>
                      <TextField
                        fullWidth={true}
                        label="Requested Start time"
                        value={moment(CorrectionStartTime, 'HH:mm:ss').format('hh:mm A')}
                        disabled
                      ></TextField>
                    </Grid>
                    <Grid
                      size={{
                        lg: 0.5,
                        md: 0.5,
                        sm: 1,
                        xs: 1
                      }}>
                      <Divider orientation='vertical' />
                    </Grid>
                    <Grid
                      display={'flex'}
                      justifyContent={"center"}
                      size={{
                        lg: 11.5,
                        md: 11.5,
                        sm: 11,
                        xs: 12
                      }}>
                      {/* <TextField
                        fullWidth={true}
                        onChange={handleChange}
                        label="Correction Start time"
                        name='first_in_time'
                        type='time'
                        format="h:mm a"
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        regex=''
                        value={formValues.first_in_time}
                        error={formErrors.first_in_time}
                        helperText={formErrors.first_in_time === null ? '' : 'Start Time is Required!'}
                      ></TextField> */}
                      <LocalizationProvider dateAdapter={DateAdapter}>                            
                        <TimePicker
                        
                          name='first_in_time'
                          label="Corrected Start time"
                          value={toMomentOrNull(formValues.first_in_time)}
                          onChange={(time) =>{
                              handleChange({
                              target: {value: time, name: 'first_in_time'},
                              });
                              // setFormValues({...formValues,first_in_time:time})
                          }}
                          // onChange={handleChange}
                          slotProps={{ textField: { fullWidth: true, required: true, variant: "outlined", type: "time", error: formErrors.first_in_time !== null ? true : false, helperText: formErrors.first_in_time !== null ? "Start Time is Required!" : "" } }}
                        />
                              
                      </LocalizationProvider>
                    </Grid>
                    <Grid
                      size={{
                        lg: 0.5,
                        md: 0.5,
                        sm: 1,
                        xs: 1
                      }}>
                      <Divider orientation='vertical' />
                    </Grid>
                  </Grid>
                </Grid>
                    
                  

                <Grid
                  display={'flex'}
                  justifyContent={"center"}
                  size={{
                    lg: 6,
                    md: 6,
                    sm: 6,
                    xs: 12
                  }}>
                  <Grid container display={'flex'} justifyContent={"center"} flexDirection='row' spacing={5}>
                    <Grid
                      display={'flex'}
                      justifyContent={"center"}
                      size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                      }}>
                      <Typography variant='h6'>Check out</Typography>
                    </Grid>
                    <Grid
                      display={'flex'}
                      justifyContent={"center"}
                      size={{
                        lg: 11.5,
                        md: 11.5,
                        sm: 11,
                        xs: 12
                      }}>
                      <TextField
                        fullWidth={true}
                        // required={true}
                        onChange={handleChange}
                        name='last_out_date'
                        type='date'
                        value={formValues.last_out_date}
                        InputProps={{
                          readOnly: formValues.last_out_date === formValues.first_in_date,
                        }}
                        error={formErrors.last_out_date}
                        helperText={formErrors.last_out_date === null ? '' : 'out date is Required!'}
                      ></TextField>
                    </Grid>





                    <Grid
                      display={'flex'}
                      justifyContent={"center"}
                      size={{
                        lg: 11.5,
                        md: 11.5,
                        sm: 11,
                        xs: 12
                      }}>
                      <TextField
                        fullWidth={true}
                        // required={true}
                        onChange={handleChange}
                        label="Check-Out"
                        name='last_out_time'
                        regex=''
                        disabled
                        value={rowData.last_out_time ? moment(rowData.last_out_time, 'HH:mm:ss').format('hh:mm A') : ''}
                      ></TextField>
                    </Grid>

                    <Grid
                      display={'flex'}
                      justifyContent={"center"}
                      size={{
                        lg: 11.5,
                        md: 11.5,
                        sm: 11,
                        xs: 12
                      }}>
                      <TextField
                        fullWidth={true}
                        onChange={handleChange}
                        label="Requested End time"
                        name='last_out_time'
                        value={moment(CorrectionEndTime, 'HH:mm:ss').format('hh:mm A')}
                        disabled
                      ></TextField>
                    </Grid>
                    <Grid
                      display={'flex'}
                      justifyContent={"center"}
                      size={{
                        lg: 11.5,
                        md: 11.5,
                        sm: 11,
                        xs: 12
                      }}>
                      {/* <TextField
                        fullWidth={true}
                        required={true}
                        onChange={handleChange}
                        label="Correction End time"
                        name='last_out_time'
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        type='time'
                        regex=''
                        value={convertTo24HourFormat(formValues.last_out_time)}
                        error={formErrors.last_out_time}
                        helperText={formErrors.last_out_time === null ? '' : 'End Time is Required!'}
                      ></TextField> */}
                      <LocalizationProvider dateAdapter={DateAdapter}>                            
                        <TimePicker
                        
                          name='last_out_time'
                          label="Corrected End time"
                          value={toMomentOrNull(formValues.last_out_time)}
                          onChange={(time) =>{
                              handleChange({
                              target: {value: time, name: 'last_out_time'},
                              });
                              // setFormValues({...formValues,last_out_time:time})
                          }}
                          // onChange={handleChange}
                          slotProps={{ textField: { fullWidth: true, required: true, variant: "outlined", error: formErrors.last_out_time !== null ? true : false, helperText: formErrors.last_out_time !== null ? "End Time is Required!" : "" } }}
                        />
                              
                      </LocalizationProvider>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid >
            )}
          </Grid>

        
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            {selectedSection === 'breakPunches' && (
              <Grid container display={'flex'} flexDirection='row' spacing={5}>
                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <Typography variant='h6'>Break Punches</Typography>
                </Grid>

                <Grid
                  display={'flex'}
                  justifyContent={"center"}
                  size={{
                    lg: 6,
                    md: 6,
                    sm: 6,
                    xs: 12
                  }}>
                  <Grid container display={'flex'} justifyContent={"center"} flexDirection='row' spacing={5}>
                    <Grid
                      display={'flex'}
                      justifyContent={"center"}
                      size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                      }}>
                      <Typography variant='h6'>Break-IN</Typography>
                    </Grid>

                    <Grid
                      display={'flex'}
                      justifyContent={"center"}
                      size={{
                        lg: 11.5,
                        md: 11.5,
                        sm: 11,
                        xs: 12
                      }}>
                      <TextField
                        fullWidth={true}
                        required={true}
                        onChange={handleChange}
                        name='first_in_date'
                        type='date'
                        value={formValues.first_in_date}
                        InputProps={{
                          readOnly: formValues.first_in_date === formValues.last_out_date,
                        }}
                      ></TextField>
                    </Grid>
                    <Grid
                      size={{
                        lg: 0.5,
                        md: 0.5,
                        sm: 1,
                        xs: 1
                      }}>
                      <Divider orientation='vertical' />
                    </Grid>




                    <Grid
                      display={'flex'}
                      justifyContent={"center"}
                      size={{
                        lg: 11.5,
                        md: 11.5,
                        sm: 11,
                        xs: 12
                      }}>
                      <TextField
                        fullWidth={true}
                        required={true}
                        onChange={handleChange}
                        label="Break start"
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        name='break_start_time'
                        type='time'
                        regex=''
                        value={formValues.break_start_time}
                        error={formErrors.break_start_time}
                        helperText={formErrors.break_start_time === null ? '' : 'Start Time is Required!'}
                      // error={false}
                      // helperText={formErrors.start_shift_time === null || formValues.start_shift_time !== null ? '' : 'Start Time is Required!'}
                      ></TextField>
                    </Grid>
                    <Grid
                      size={{
                        lg: 0.5,
                        md: 0.5,
                        sm: 1,
                        xs: 1
                      }}>
                <Divider orientation='vertical' />
              </Grid>
                  </Grid>
                </Grid>



                <Grid
                  display={'flex'}
                  justifyContent={"center"}
                  size={{
                    lg: 6,
                    md: 6,
                    sm: 6,
                    xs: 12
                  }}>
                  <Grid container display={'flex'} justifyContent={"center"} flexDirection='row' spacing={5}>
                    <Grid
                      display={'flex'}
                      justifyContent={"center"}
                      size={{
                        lg: 11.5,
                        md: 12,
                        sm: 12,
                        xs: 12
                      }}>
                      <Typography variant='h6'>Break-IN</Typography>
                    </Grid>
                    <Grid
                      display={'flex'}
                      justifyContent={"center"}
                      size={{
                        lg: 11.5,
                        md: 11.5,
                        sm: 11,
                        xs: 12
                      }}>
                      <TextField
                        fullWidth={true}
                        required={true}
                        onChange={handleChange}
                        name='first_in_date'
                        type='date'
                        value={formValues.first_in_date}
                        InputProps={{
                          readOnly: formValues.last_out_date === formValues.first_in_date,
                        }}
                      // error={formErrors.start_shift_time}
                      // helperText={formErrors.start_shift_time === null || formValues.start_shift_time !== null ? '' : 'Start Time is Required!'}
                      ></TextField>
                    </Grid>
                    <Grid
                      display={'flex'}
                      justifyContent={"center"}
                      size={{
                        lg: 11.5,
                        md: 11.5,
                        sm: 11,
                        xs: 12
                      }}>
                      <TextField
                        fullWidth={true}
                        required={true}
                        onChange={handleChange}
                        label="Break End"
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        name='break_end_time'
                        type='time'
                        regex=''
                        value={formValues.break_end_time}
                        error={formErrors.break_end_time}
                        helperText={formErrors.break_end_time === null ? '' : 'End Time is Required!'}
                      // error={false}
                      // helperText={formErrors.start_shift_time === null || formValues.start_shift_time !== null ? '' : 'Start Time is Required!'}
                      ></TextField>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid >
            )}
          </Grid>


          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            {selectedSection === 'attendanceDetails' && (
              <Grid container display={'flex'} flexDirection='row' spacing={5}>
                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <Typography variant='h6'>Break Punches</Typography>
                </Grid>

                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <Grid containercontainer display={'flex'} justifyContent={"center"} flexDirection='row' spacing={5}>
                    <Grid
                      size={{
                        lg: 4,
                        md: 12,
                        sm: 12,
                        xs: 12
                      }}>
                      <Typography variant='h6' >Work Hours</Typography>

                    </Grid>
                    <Grid
                      size={{
                        lg: 7,
                        md: 12,
                        sm: 12,
                        xs: 12
                      }}>
                      <TextField
                        name='work_hours'
                        label="hh:mm"
                        value={rowData.work_hours}
                        inputProps={{
                          maxLength: 5, // Set maximum length to 5 (e.g., "HH:MM")
                          pattern: '[0-9]{2}:[0-9]{2}', // Pattern attribute for HTML5 validation
                          title: 'Enter time in the format HH:MM', // Title attribute for HTML5 validation error message
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
                  <Grid containercontainer display={'flex'} justifyContent={"center"} flexDirection='row' spacing={5}>
                    <Grid
                      size={{
                        lg: 4,
                        md: 12,
                        sm: 12,
                        xs: 12
                      }}>
                      <Typography variant='h6' >Break Hours</Typography>

                    </Grid>
                    <Grid
                      size={{
                        lg: 7,
                        md: 12,
                        sm: 12,
                        xs: 12
                      }}>
                      <TextField
                        name='break_hours'
                        label="hh:mm"
                        value={rowData.break_hours}
                        inputProps={{
                          minLength: 5, // Set minimum length to 5 characters
                          maxLength: 5, // Set maximum length to 5 (e.g., "HH:MM")
                          pattern: '[0-9]{2}:[0-9]{2}', // Pattern attribute for HTML5 validation
                          title: 'Enter time in the format HH:MM', // Title attribute for HTML5 validation error message
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
                  <Grid containercontainer display={'flex'} justifyContent={"center"} flexDirection='row' spacing={5}>
                    <Grid
                      size={{
                        lg: 4,
                        md: 12,
                        sm: 12,
                        xs: 12
                      }}>
                      <Typography variant='h6' >Net-Work Hours</Typography>

                    </Grid>
                    <Grid
                      size={{
                        lg: 7,
                        md: 12,
                        sm: 12,
                        xs: 12
                      }}>
                      <TextField
                        name='network_hours'
                        label="hh:mm"
                        value={netWorkHours}
                        inputProps={{
                          maxLength: 5, // Set maximum length to 5 (e.g., "HH:MM")
                          pattern: '[0-9]{2}:[0-9]{2}', // Pattern attribute for HTML5 validation
                          title: 'Enter time in the format HH:MM', // Title attribute for HTML5 validation error message
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
                  <Grid containercontainer display={'flex'} justifyContent={"center"} flexDirection='row' spacing={5}>
                    <Grid
                      size={{
                        lg: 4,
                        md: 12,
                        sm: 12,
                        xs: 12
                      }}>
                      <Typography variant='h6' >Early-IN Duration </Typography>

                    </Grid>
                    <Grid
                      size={{
                        lg: 7,
                        md: 12,
                        sm: 12,
                        xs: 12
                      }}>
                      <TextField
                        name='early_duration'
                        label="hh:mm"
                        value={earlyInDurationDisplay}
                        inputProps={{
                          maxLength: 5, // Set maximum length to 5 (e.g., "HH:MM")
                          pattern: '[0-9]{2}:[0-9]{2}', // Pattern attribute for HTML5 validation
                          title: 'Enter time in the format HH:MM', // Title attribute for HTML5 validation error message
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
                  <Grid containercontainer display={'flex'} justifyContent={"center"} flexDirection='row' spacing={5}>
                    <Grid
                      size={{
                        lg: 4,
                        md: 12,
                        sm: 12,
                        xs: 12
                      }}>
                      <Typography variant='h6' >Late-IN Duration</Typography>

                    </Grid>
                    <Grid
                      size={{
                        lg: 7,
                        md: 12,
                        sm: 12,
                        xs: 12
                      }}>
                      <TextField
                        name='latein_duration'
                        label="hh:mm"
                        value={lateInDurationDisplay}
                        inputProps={{
                          maxLength: 5, // Set maximum length to 5 (e.g., "HH:MM")
                          pattern: '[0-9]{2}:[0-9]{2}', // Pattern attribute for HTML5 validation
                          title: 'Enter time in the format HH:MM', // Title attribute for HTML5 validation error message
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
                  <Grid containercontainer display={'flex'} justifyContent={"center"} flexDirection='row' spacing={5}>
                    <Grid
                      size={{
                        lg: 4,
                        md: 12,
                        sm: 12,
                        xs: 12
                      }}>
                      <Typography variant='h6' >Overstay Duration</Typography>

                    </Grid>
                    <Grid
                      size={{
                        lg: 7,
                        md: 12,
                        sm: 12,
                        xs: 12
                      }}>
                      <TextField
                        name='overstay_duration'
                        // label="hh:mm"
                        value={inputValue.overstay_duration}
                        inputProps={{
                          maxLength: 5, // Set maximum length to 5 (e.g., "HH:MM")
                          pattern: '[0-9]{2}:[0-9]{2}', // Pattern attribute for HTML5 validation
                          title: 'Enter time in the format HH:MM', // Title attribute for HTML5 validation error message
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
                  <Grid containercontainer display={'flex'} justifyContent={"center"} flexDirection='row' spacing={5}>
                    <Grid
                      size={{
                        lg: 4,
                        md: 12,
                        sm: 12,
                        xs: 12
                      }}>
                      <Typography variant='h6' >Extra Work Duration</Typography>

                    </Grid> 
                    <Grid
                      size={{
                        lg: 7,
                        md: 12,
                        sm: 12,
                        xs: 12
                      }}>
                      <TextField
                        name='extrawork'
                        label="hh:mm:ss"
                        value={extraWorkDurationDisplay}
                        inputProps={{
                          maxLength: 5, // Set maximum length to 5 (e.g., "HH:MM")
                          pattern: '[0-9]{2}:[0-9]{2}', // Pattern attribute for HTML5 validation
                          title: 'Enter time in the format HH:MM', // Title attribute for HTML5 validation error message
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid >
            )}
          </Grid>

          {selectedSection !== 'attendanceDetails' && (
            <Grid style={{width:'100%', display:'flex', justifyContent:'space-between', margin:'0px 20px'}}>
              <Grid display='flex' gap={2}>
                <Button
                  onClick={(e) => {
                    if(rowData.status === 'Approved'){
                      setDialogOpen(true)
                    }else{
                      handleSubmit(e)
                    }
                  }}
                  variant='contained'
                  color={rowData.status === 'Approved' ? 'secondary' : 'primary'}
                  size='medium'
                >
                  {rowData.status === 'Approved' ? 'Reject' : 'Approve'}
                </Button>
              </Grid>
              <Grid display='flex' gap={2}>
                  <Button
                    onClick={() => props.handleClose()}
                    style={{}}
                    name='Cancel'
                    variant='contained'
                    color='secondary'
                    size='medium'
                    text='button'
                    fullWidth={false}
                    type='cancel'
                  >
                    cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    style={{}}
                    name='SUBMIT'
                    variant='contained'
                    color='primary'
                    size='medium'
                    text='button'
                    fullWidth={false}
                    type='submit'
                  >
                    Submit
                  </Button>
                </Grid>
            </Grid>
          )}
        </Grid>
      </Card>
      {dialogOpen && (
        <ReasonDialog
          open={dialogOpen}
          handleClose={() => {
            setDialogOpen(false)
            props.handleClose();
          }}
          data={rowData}
        />
      )}
    </>
  );
}
