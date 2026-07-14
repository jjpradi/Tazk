import { TextField, Grid, FormLabel, Typography, FormControl, InputLabel, Select, MenuItem, FormHelperText, ListItem, ListItemText } from '@mui/material';
import { LocalizationProvider, TimePicker, DatePicker } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { useEffect, useState } from 'react';
import moment from 'moment';
import { useCustomFetch } from 'utils/useCustomFetch';
import { getDateFormat } from 'utils/getTimeFormat';
import { formatWithCursor } from 'prettier';
import { List } from 'react-content-loader';
import API_URLS from 'utils/customFetchApiUrls';
import toMomentOrNull from 'utils/DateFixer';

export default function CorrectionRequest(props) {
    const customFetch = useCustomFetch()
    const { fromDate, toDate, startTime, endTime, reason, note, handleInputChange, handleTimeChange, shiftDetailsByEmployeeId, correctiomFormErrors ,formErrors , handleLogTime, isNightShift} = props;
    const curDate = moment()
    const yesterday = curDate.subtract(1, 'days')
    console.log(yesterday,formErrors,"yesterday");
    const [attendance, setAttendance] = useState({})
    const [shifts,setShifts] = useState();
    const [shiftid,setShiftid] = useState();
    const [cdate,setcDate]= useState();
    const [logdata, setlogData] = useState()
    //const response = []

    console.log("sdfsdf",shifts)
    // const startShiftTime = shiftDetailsByEmployeeId.map((d) => d.start_shift_time)
    // const endShiftTime = shiftDetailsByEmployeeId.map((d) => d.end_shift_time)
    let stHour
    let stMinute
    let etHour
    let etMinute
    let data = shiftDetailsByEmployeeId.map((d) => {
        stHour = d.sHour,
            stMinute = d.sMinute
        etHour = d.eHour,
            etMinute = d.eMinute
    }
    )
    const startDate = attendance[0]?.checkIn ? attendance[0]?.checkIn  : ''
    const endDate = attendance[0]?.checkOut ? attendance[0]?.checkOut : ''
    
    useEffect(() => {
        handleLogTime(attendance)
    },[attendance])

    const onKeyDown = (e) => {
      e.preventDefault();
    };
   
    useEffect(() => { (async () => {
      const fetchLogData = async () => {
        try {
          const body = {
            shift_id: shiftid,
            date: cdate,
          };
          const response = await customFetch(
            API_URLS.LEAVE_LOG_BASE_SHIFT,
            'POST',
            body
          );
          setlogData(response);
        } catch (error) {
          console.log('Error fetching log data:', error);
        }
      };
    
      fetchLogData();
    })();
}, [shiftid,cdate]);

    console.log('EWE',attendance);
    let startTimeNew = moment()
    startTimeNew.set('hour', stHour);
    startTimeNew.set('minute', stMinute);
    startTimeNew.set('second', 0);
    startTimeNew.set('millisecond', 0);

    let endTimeNew = moment()
    endTimeNew.set('hour', etHour);
    endTimeNew.set('minute', etMinute);
    endTimeNew.set('second', 0);
    endTimeNew.set('millisecond', 0);

 
    // useEffect(() => {
    //     const date = getDateFormat(new Date());

    //     let body = {
    //         att_date: moment(date).format('YYYY-MM-DD')
    //     }
    //     await handleInputChange({ target: { name: 'date', value:date } })
    //     const { data: customerData } = await customFetch(`/attendance/attendanceByDate`, 'POST', body)
    //     await setAttendance(customerData)

    // },[])

    console.log('correctiomFormErrors',logdata);
    const styles = {
      logContainer: {
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
        marginBottom: '16px',
      },
      title: {
        fontWeight: 'bold',
        marginBottom: '8px',
        color: '#333',
      },
      logEntry: {
        color: '#555',
        lineHeight: '1.5',
      },
    };
    return (
      <div>
        <Grid container spacing={4}>
          <Grid size={isNightShift ? 6 : 12}>
            <LocalizationProvider dateAdapter={DateAdapter}>
              <DatePicker
                name='fromDate'
                // label={
                //   <span>
                //     Date<span style={{color: 'red'}}> *</span>
                //   </span>
                // }
                inputVariant='outlined'
                format='DD/MM/YYYY'
                maxDate={yesterday}
                value={toMomentOrNull(fromDate)}
                onChange={async (value) => {
                  let body = {
                    att_date: moment(value).format('YYYY-MM-DD'),
                  };
                  setcDate(moment(value).format('YYYY-MM-DD')),
                  await handleInputChange({target: {name: 'fromDate', value}});
                  // if (!isNightShift) {
                  //   await handleInputChange({target: {name: 'toDate', value}});
                  // }
                  const { data: customerData } = await customFetch(
                    API_URLS.ATTENDANCE_BY_DATE,
                    'POST',
                    body
                  );
                  await setAttendance(customerData);
                  const response = await customFetch(
                    API_URLS.GET_SHIFTS_BASED_ON_EMP,
                    'POST',
                    body
                  );
                  console.log(response,'3333');
                  await setShifts(response?.data);
                }}
                slotProps={{ textField: { variant: 'filled', label: isNightShift ? "From Date" : "Date", fullWidth: true, required: true, error: formErrors.from === null ? '' : formErrors.from, helperText: formErrors.from === null ? '' : formErrors.from, onKeyDown: onKeyDown } }}
              />
            </LocalizationProvider>
          </Grid>
          {isNightShift &&
          <Grid size={6}>
            <LocalizationProvider dateAdapter={DateAdapter}>
              <DatePicker
                name='toDate'
                // label={
                //   <span>
                //     Date<span style={{color: 'red'}}> *</span>
                //   </span>
                // }
                inputVariant='outlined'
                format='DD/MM/YYYY'
                maxDate={yesterday}
                value={toMomentOrNull(toDate)}
                onChange={async (value) => {
                  let body = {
                    att_date: moment(value).format('YYYY-MM-DD'),
                  };
                  setcDate(moment(value).format('YYYY-MM-DD')),
                  await handleInputChange({target: {name: 'toDate', value}});
                  // const {data: customerData} = await customFetch(
                  //   `/attendance/attendanceByDate`,
                  //   'POST',
                  //   body,
                  // );
                  // await setAttendance(customerData);
                  // const response = await customFetch('/Shifts/getShiftsBasedEmp', 'POST', body);
                  // console.log(response,'3333');
                  // await setShifts(response?.data);
                }}
                slotProps={{ textField: { variant: 'filled', label: "To Date", fullWidth: true, required: true, error: formErrors.to === null ? '' : formErrors.to, helperText: formErrors.to === null ? '' : formErrors.to, onKeyDown: onKeyDown } }}
              />
            </LocalizationProvider>
          </Grid>
          }
{/* 
          <Grid size={6}>
            <TextField
              fullWidth
              label='Clocked-In Time'
              variant='filled'
              value={startDate}
              // InputProps={{
              //   readOnly: true,
              // }}

              disabled={true}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              fullWidth
              variant='filled'
              label='Clocked-Out Time'
              value={endDate}
              // InputProps={{
              //     readOnly: true,
              // }}
              disabled={true}
            />
          </Grid> */}
          <Grid size={12}>
          <FormControl fullWidth variant="filled" required>
          <InputLabel id='select-shift-label'>Select Shift</InputLabel>
                <Select
                  labelId='select-shift-label'
                  id='select-shift'
                  label='Select Shift'
                  variant='filled'
                  name='shiftId'
                  //disabled={!shifts?.length}
                  regex=''
                  required
                  fullWidth
                  onChange={(e)=>{
                    setShiftid(e.target.value);
                    handleTimeChange(e.target.value, 'shiftId')
                  }}
                >
                  {shifts?.length && shifts?.map((v)=>
                  <MenuItem value={v?.id}>{v?.shift_name}</MenuItem>)}
                </Select>
                <FormHelperText style={{color: '#f44336'}}>{formErrors.shiftId === null ? '' : 'ShiftId is Required!'}</FormHelperText>
            </FormControl>
          </Grid>
          {/* {logdata?.data && logdata.data.map((v, index) => (
          <Grid size={12}>
               <span style={{fontWeight:'bold'}}>Shift Logs</span>
              <Typography>start_time: {v.startDate} end_time: {v.endDate} </Typography>
          </Grid>))} */}
          <Grid container spacing={2} padding={3}>
            {logdata?.data && logdata.data.map((v, index) => (
              <Grid key={index} size={12}>
                <div style={styles.logContainer}>
                  <Typography variant="h6" style={styles.title}>
                    Shift Logs
                  </Typography>
                  <Typography variant="body1" style={styles.logEntry}>
                    <strong>Start Time:</strong> {v.startDate ? moment(v.startDate).format('hh:mm A') : "-"} &nbsp;|&nbsp;
                    <strong>End Time:</strong> {v.endDate ? moment(v.endDate).format('hh:mm A') : "-"}
                  </Typography>
                </div>
              </Grid>
            ))}
          </Grid>
        <Grid container size={12}>
         <Grid   size={{
                                lg: 6,
                                md: 6,
                                sm: 6,
                                xs: 12
                            }}>
            <LocalizationProvider dateAdapter={DateAdapter}>
              <TimePicker
                name='startTime'
                label={
                    <span>
                        Correct Clock-In Time<span style={{ color: 'red' }}> *</span>
                    </span>
                }
                required
                value={toMomentOrNull(startTime)}
                // maxTime={endTime}
                // minTime={startTime}
                onChange={(value) => handleTimeChange(value, 'startTime')}
                slotProps={{ textField: { variant: 'filled', fullWidth: true, error: formErrors.startTime === null ? '' : formErrors.startTime, helperText: formErrors.startTime === null ? '' : formErrors.startTime } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid   size={{
                                lg: 6,
                                md: 6,
                                sm: 6,
                                xs: 12
                            }}>
            <LocalizationProvider dateAdapter={DateAdapter}>
              <TimePicker
                name='endTime'
                label={
                    <span>
                       Correct Clock-Out Time<span style={{ color: 'red' }}> *</span>
                    </span>
                }
                value={toMomentOrNull(endTime)}
                // maxTime={curDate}
                onChange={(value) => handleTimeChange(value, 'endTime')}
                required
                slotProps={{ textField: { variant: 'filled', fullWidth: true,  
                  error: formErrors.endTime === null ? '' : formErrors.endTime, helperText: formErrors.endTime === null ? '' : formErrors.endTime } }}
              />
            </LocalizationProvider>
          </Grid>
         </Grid>
          <Grid size={12}>
            <TextField
              focused
              name='reason'
              fullWidth
              id='filled-multiline-static'
              label='Reason'
              multiline
              value={reason}
              onChange={handleInputChange}
              variant='filled'
              // disabled
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              focused
              name='note'
              fullWidth
              id='filled-multiline-static'
              label='Note'
              multiline
              rows={4}
              value={note}
              onChange={handleInputChange}
              placeholder='Add a note (optional)'
              variant='filled'
            />
          </Grid>
        </Grid>
      </div>
    );
}
