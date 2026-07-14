import { TextField, Grid, FormLabel, Typography, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { LocalizationProvider, TimePicker, DatePicker } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { useEffect, useState } from 'react';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { updateManualAttendanceAction } from 'redux/actions/attendance_actions';
import { getManualAttendanceEmpActions } from 'redux/actions/app_config_actions';
import { useCustomFetch } from 'utils/useCustomFetch';
import API_URLS from '../../../utils/customFetchApiUrls';
import apiCalls from 'utils/apiCalls';
import { useContext } from 'react';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import toMomentOrNull from 'utils/DateFixer';

export default function ManualCorrectionRequest(props) {
  const { appConfigReducer: { getManualAttEmp } } = useSelector((state) => state);
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext)

  const { date, startTime, endTime, reason, handleInputChange, handleTimeChange, correctiomFormErrors, handleLogTime, handleEmployeeId } = props;
  const curDate = moment();
  const customFetch = useCustomFetch()
  const yesterday = curDate.subtract(1, 'days');
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState();
  const [attendance, setAttendance] = useState({})
  const [shifts, setShifts] = useState();
  const [shiftid, setShiftid] = useState();
  const [cdate, setcDate] = useState();
  const [logdata, setlogData] = useState()
  const [prevLogs, setPrevLogs] = useState()



  const employeesData = getManualAttEmp || [];

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

  useEffect(() => {
    dispatch(getManualAttendanceEmpActions())
      .then((res) => {
        setEmployees(res.data);
      })
      .catch((err) => {
        console.error('Error fetching employees:', err);
      });
  }, [dispatch]);


 const handleEmployeeChange = (event) => {
  const empId = event.target.value;

  setSelectedEmployee(empId);

  setShiftid(null);
  setAttendance({});
  setShifts([]);
  setPrevLogs([]);
  setcDate(null);

  handleEmployeeId(empId);
};



  useEffect(() => {
    handleLogTime(attendance)
  }, [attendance])


  useEffect(() => {
    const payload = {
      user_id: selectedEmployee,
      date: cdate,
      shift_id: shiftid,
      updateLog: {
        start_time: startTime ? moment(startTime).format('HH:mm:ss') : null,
        end_time: endTime ? moment(endTime).format('HH:mm:ss') : null,
      },
    };

    if (selectedEmployee && cdate && shiftid) {
      apiCalls(  setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(updateManualAttendanceAction(payload))
        .then((response) => {
          setPrevLogs(response);
        })
        .catch((error) => {
          console.error(error, "Error while updating manual attendance");
        })
      )
    }

   apiCalls(setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(updateManualAttendanceAction(payload))
      ) 
  }, [selectedEmployee, date, shiftid, startTime, endTime, dispatch]);

  const onKeyDown = (e) => {
    e.preventDefault();
  };

  return (
    <div>
      <Grid container spacing={4}>
        <Grid size={12}>
          <FormControl fullWidth variant="filled" required>
            <InputLabel>Select Employee </InputLabel>
            <Select
              value={selectedEmployee}
              onChange={handleEmployeeChange}
              label="Select Employee"
              name="user_id"
              required
              error={correctiomFormErrors.user_id ? true : false}
              helperText={correctiomFormErrors.user_id}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300, 
                    overflowY: 'auto',
                  },
                },
              }}
            >
              {employeesData?.data?.map((employee) => (
                <MenuItem key={employee.employeeId} value={employee.employee_id}>
                  {employee.full_name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText style={{ color: '#f44336' }}>{correctiomFormErrors.user_id === null ? '' : 'Employee is Required!'}</FormHelperText>
          </FormControl>
        </Grid>

        <Grid size={12}>
          <LocalizationProvider dateAdapter={DateAdapter}>
            <DatePicker
              name='date'
              inputVariant='outlined'
              format='DD/MM/YYYY'              
              maxDate={yesterday}
              value={toMomentOrNull(date)}
              onChange={async (value) => {
                let body = {
                  att_date: moment(value).format('YYYY-MM-DD'),
                  employee_id: selectedEmployee
                };
                setcDate(moment(value).format('YYYY-MM-DD')),
                  await handleInputChange({ target: { name: 'date', value } });

                //  await handleInputChange({target: {name: 'user_id', value:selectedEmployee}});
                const { data: customerData } = await customFetch(
                  API_URLS.ATTENDANCE_BY_DATE,
                  'POST',
                  body
                );
                await setAttendance(customerData);
                const response = await customFetch(
                  API_URLS.GET_SHIFTS_FOR_MANUAL_ATT,
                  'POST',
                  body
                );
                await setShifts(response?.data);
              }}
              views={['year', 'month', 'day']}
              slotProps={{ textField: { variant: 'filled', label: "Date", fullWidth: true, required: true, error: correctiomFormErrors.date ? true : false, helperText: correctiomFormErrors.date } }}
            />
          </LocalizationProvider>
        </Grid>

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
              onChange={(e) => {
                setShiftid(e.target.value);
                handleTimeChange(e.target.value, 'shiftId')
              }}
              error={correctiomFormErrors.shiftId ? true : false}
              helperText={correctiomFormErrors.shiftId}
            >
              {shifts?.length > 0 ? (
                shifts.map((shift) => (
                  <MenuItem key={shift.id} value={shift.id}>
                    {shift.shift_name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled value="">
                  No shifts available
                </MenuItem>
              )}
            </Select>
            <FormHelperText style={{ color: '#f44336' }}>{correctiomFormErrors.shiftId === null ? '' : 'Shift Id is Required!'}</FormHelperText>
          </FormControl>
        </Grid>

        {prevLogs?.data?.length ? (
          <Grid container spacing={2} padding={3}>
            {prevLogs.data.map((v, index) => (
              <Grid key={index} size={12}>
                <div style={styles.logContainer}>
                  <Typography variant="h6" style={styles.title}>
                    Shift Logs
                  </Typography>
                  <Typography variant="body1" style={styles.logEntry}>
                   <strong>Start Time:</strong> {v.startDate ? moment.utc(v.startDate).format('hh:mm A') : "-"} &nbsp;|&nbsp;
                  <strong>End Time:</strong> {v.endDate ? moment.utc(v.endDate).format('hh:mm A') : "-"}

                  </Typography>
                </div>
              </Grid>
            ))}
          </Grid>
        ) : null}
        <Grid size={12}>
  <Grid container spacing={2}>

        <Grid   size={{
                                lg: 6,
                                md: 6,
                                sm: 6,
                                xs: 12
                            }}>
          <LocalizationProvider dateAdapter={DateAdapter}>
            <TimePicker
              name='startTime'
              label={<span>Correct Clock-In Time<span style={{ color: 'red' }}> *</span></span>}
              required
              value={toMomentOrNull(startTime)}
              onChange={(value) => handleTimeChange(value, 'startTime')}
              slotProps={{ textField: { variant: 'filled', fullWidth: true, error: correctiomFormErrors.startTime ? true : false, helperText: correctiomFormErrors.startTime } }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid  size={{
                                lg: 6,
                                md: 6,
                                sm: 6,
                                xs: 12
                            }}>
          <LocalizationProvider dateAdapter={DateAdapter}>
            <TimePicker
              name='endTime'
              label={<span>Correct Clock-Out Time<span style={{ color: 'red' }}> *</span></span>}
              value={toMomentOrNull(endTime)}
              onChange={(value) => handleTimeChange(value, 'endTime')}
              required
              slotProps={{ textField: { variant: 'filled', fullWidth: true, error: correctiomFormErrors.endTime ? true : false, helperText: correctiomFormErrors.endTime } }}
            />
          </LocalizationProvider>
        </Grid>
</Grid>
</Grid>
        <Grid size={12}>
          <TextField
            focused
            name='reason'
            fullWidth
            label='Reason'
            multiline
            value={reason}
            onChange={handleInputChange}
            variant='filled'
            InputProps={{ readOnly: true }}
          />
        </Grid>

        {/* <Grid size={12}>
          <TextField
            focused
            name='note'
            fullWidth
            label='Note'
            multiline
            rows={4}
            value={note}
            onChange={handleInputChange}
            placeholder='Add a note (optional)'
            variant='filled'
          />
        </Grid> */}
      </Grid>
    </div>
  );
}
