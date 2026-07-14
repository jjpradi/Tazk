import React, { useState, useEffect, useContext } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, IconButton,
  Typography, TablePagination
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useDispatch, useSelector } from 'react-redux';
import apiCalls from 'utils/apiCalls';
import { ManualCorrection, ManualeditAlert } from 'redux/actions/attendance_actions';
import context from '../../../context/CreateNewButtonContext'
import { commonDateFormat } from 'utils/getTimeFormat';
import { formatTime12Hour } from 'utils/pageSize';


const EmployeeTable = (props) => {
  const {month, year} = props.processField
  const [data, setData] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [groupedData, setGroupedData] = useState({});
  const [page, setPage] = useState(0); // For pagination
  const [rowsPerPage, setRowsPerPage] = useState(50); // Default 10 rows per page
  const { setModalTypeHandler,
    setLoaderStatusHandler, setModalStatusHandler, commoncookie, headerLocationId } = useContext(context);

    const dispatch = useDispatch();
  
  const {
    attendanceReducer: { manualEntryget },
  } = useSelector((state) => state);


  const [duration, setDuration] = useState('');
  const [showHelperText, setShowHelperText] = useState(true);

  function convertToTimeFormat(value) {
    let hours = 0, minutes = 0, seconds = 0;

    // Match "1h" or "30m" using regex
    if (value.includes('h')) {
        hours = parseInt(value.replace('h', '')) || 0;
    } else if (value.includes('m')) {
        minutes = parseInt(value.replace('m', '')) || 0;
    }

    // Format into hh:mm:ss
    const formattedTime = [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
    ].join(':');

    return formattedTime;
}
  // const convertToTimeFormat = (input) => {
  //   // Regex to extract hours and minutes from the input
  //   const regex = /(\d+)\s*h\s*(\d*)\s*m?/;
  //   const match = input.match(regex);

  //   if (match) {
  //     const hours = match[1] || '00';
  //     const minutes = match[2] || '00';
  //     return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
  //   }

  //   return '00:00:00'; // Default return in case of invalid input
  // };
  useEffect(() => {
  const fetchData = async () => {
    try {
      const result = manualEntryget;

      // Set unique shift names
      const shiftNames = Array.from(
        new Set(result.map(row => row.shift_name).filter(shift => shift !== null && shift !== undefined))
      );

      setShifts(shiftNames);

      // Group data by both id and log_date
      const grouped = result.reduce((acc, row) => {
        const key = `${row.employee_id}_${row.log_date}`; // Use both id and log_date as key
        if (!acc[key]) {
          acc[key] = {
            // id: row.id,
            name: row.name,
            log_date: row.log_date,
            emp_id: row.emp_id,
            employee_id: row.employee_id,
            shifts: {},
          };
        }
        acc[key].shifts[row.shift_name] = row;
        return acc;
      }, {});

      setGroupedData(grouped);
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  fetchData();
}, [manualEntryget]);


const handleTimeChange = (id, shiftName, field, value, employee_id, log_date) => {
  // const value = e.target.value;
  console.log('handletime', value)
  
  setDuration(value);

 

  // Hide helper text once a valid value is entered
  if (value.trim()) {
    setShowHelperText(false);
  } else {
    setShowHelperText(true);
  }

  // Validate and format the time input here
  const formattedTime = convertToTimeFormat(value);
  console.log('hendletime',id, shiftName, field, formattedTime, employee_id, log_date)
  handleChange(
    id, shiftName, field, formattedTime, employee_id, log_date
  );
};

function formatbreakTime(timeStr) {
  console.log('formattime', timeStr)
  // Split the time string into hours and minutes
  if (!timeStr) return '--';

  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Format the time as "1hr 30m"
  const formattedHours = hours > 0 ? `${hours}hr` : '';
  const formattedMinutes = minutes > 0 ? `${minutes}m` : '';

  // Join the hours and minutes with a space
  return `${formattedHours} ${formattedMinutes}`.trim();
}
  const handleChange = (id, shiftName, field, value, employee_id, log_date) => {
    const updatedData = { ...groupedData };
    if(employee_id == 'unknown' || log_date == 'unknown'){
      alert("Canot Edit this log");
    }
    const key = `${employee_id}_${log_date}`
    updatedData[key].shifts[shiftName][field] = value;
    setGroupedData(updatedData);
  };
 
  // const handleEdit = (id, shiftName, log_date, employee_id) => {

  //   const updatedData = { ...groupedData };
  
  //   const key = `${employee_id}_${log_date}`
  //   // let value = updatedData[key]?.shifts
  //   const employeeShifts = updatedData[key]?.shifts;
 
  //   // Get the shift or create a new one if it doesn't exist
  //   const shift = employeeShifts[shiftName] || {
  //     in_time: '--',  // Set your default value for in_time
  //     out_time: '--', // Set your default value for out_time
  //     break_hours: '--', // Set your default value for break hours
  //     isEditing: true,   // Enable editing mode immediately
  //     isNewShift : true
  //   };

  //   if (!shift.isEditing) {
  //     shift.initialValues = {
  //       in_time: shift.in_time,
  //       out_time: shift.out_time,
  //       break_hours: shift.break_hours,
  //     };
  //   }
  
  //   // If it already exists, make sure it's set to editing mode
  //   shift.isEditing = true;
  
  //   // Update the shifts in the groupedData state
  //   employeeShifts[shiftName] = shift;
  //   setGroupedData(updatedData);
  // };
  
  const handleEdit = (id, shiftName, log_date, employee_id) => {
    // Clone the groupedData object to maintain immutability
    const updatedData = { ...groupedData };

    // Construct the key to locate the employee's shifts
    const key = `${employee_id}_${log_date}`;
    const employeeShifts = updatedData[key]?.shifts || {};

    // Get the specific shift or create a new one if it doesn't exist
    const shift = employeeShifts[shiftName] || {
        in_time: '--',          // Default in_time value
        out_time: '--',         // Default out_time value
        break_hours: '--',      // Default break_hours value
        isEditing: true,        // Enable editing mode
        isNewShift: true        // Mark as a new shift
    };

    // If the shift is not in editing mode, store its initial values
    if (!shift.isEditing) {
        shift.initialValues = {
            in_time: shift.in_time,
            out_time: shift.out_time,
            break_hours: shift.break_hours,
        };
    }

    // Enable editing mode for the shift
    shift.isEditing = true;

    // Update the shifts and set the updated data in the state
    employeeShifts[shiftName] = shift;
    updatedData[key] = { ...updatedData[key], shifts: employeeShifts };
    setGroupedData(updatedData);
};
  const handleSave = async (id, shiftName, log_date, employee_id) => {
    const updatedData = { ...groupedData };
     const key = `${employee_id}_${log_date}`
    const shift = updatedData[key].shifts[shiftName];
  
    // Compare current values with initial values
    const { in_time, out_time, break_hours } = shift;
    const { initialValues } = shift || {}; // Handle undefined initialValues
    console.log('in_time', in_time, out_time)
    // Check if there are any changes or if this is a new shift

    if(in_time == '00:00:00' || in_time =='--'  && out_time == '00:00:00' || out_time == '--'){
      shift.isEditing = false;
      setGroupedData(updatedData);
      alert('Not Update Break Hours, Not Time In_time and Out_time Fields');
      return;
    }

  //   if (in_time && out_time) {
  //     const [inHours, inMinutes] = in_time.split(":").map(Number);
  //     const [outHours, outMinutes] = out_time.split(":").map(Number);

  //     const inTotalMinutes = inHours * 60 + inMinutes;
  //     let outTotalMinutes = outHours * 60 + outMinutes;

  //     // console.log("Converted times (minutes):", inTotalMinutes, outTotalMinutes);
  //      if (outTotalMinutes < inTotalMinutes) {
  //         alert("In Time cannot be greater than Out Time!");
  //         return; 
  //     }
  // }

    const hasChanges =
      in_time !== initialValues?.in_time ||
      out_time !== initialValues?.out_time ||
      break_hours !== initialValues?.break_hours;
  
    const isNewShift = shift.isNewShift;
  
    // If no changes and it's not a new shift, skip the API call
    if (!hasChanges && !isNewShift) {
      shift.isEditing = false;
      setGroupedData(updatedData);
      return;
    }
    
    // Prepare the data to send to the API
    const startDate =  `${log_date} ${in_time}`;
    const endDate =  `${log_date} ${out_time}`;
  
    const data = {
      id: shift.id,
      startDate : startDate,
      endDate,
      break_hours,
      shift_name: shiftName,
      employeeid: employee_id,
      start_shift_time: in_time,
      end_shift_time: out_time,
      shift_id: shift.shift_id,
      month: month,
      year: year,
      isNewShift
    };
  
    // Call the API
    await apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      commoncookie,
      headerLocationId,
      dispatch(ManualCorrection(data))
    );
  
    // Clear the new shift flag after saving
    shift.isNewShift = false;
  
    // Toggle editing mode off after saving
    shift.isEditing = false;
    setGroupedData(updatedData);
  };
  
  // Helper function to format break hours
  // const formatBreakHours = (breakHours) => {
  //   console.log('break_hours', breakHours)
  //   if (!breakHours) return '--'; // If breakHours is missing, return '--'
  //   const [hours, minutes, seconds] = breakHours.split(':');
  //   return `${hours || '00'}:${minutes || '00'}`; // Default to '00' if part is missing
  // };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page when changing rows per page
  };

  // const AlertFun = ()=>{
  //   console.log('functionn')
  //   dispatch(ManualeditAlert()) ;
  //   return;
  // }


  const paginatedData = Object.values(groupedData).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <TableContainer component={Paper} style={{  height:'50vh', borderRadius: '15px' }}>
        {/* <Typography style={{ paddingLeft: '20px' }}>Attendance Correction</Typography> */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>EmpID</TableCell>
              <TableCell>Date</TableCell>
              {shifts.filter((shift) => shift !== null && shift !== undefined).map((shift, index) => (
                <React.Fragment key={index}>
                  <TableCell colSpan={5} align="center">{shift}</TableCell>
                </React.Fragment>
              ))}
              {/* <TableCell>Edit</TableCell> */}
              
              {/* <TableCell>Edit</TableCell> */}
            </TableRow>
            <TableRow>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              
              {shifts.filter((shift) => shift !== null && shift !== undefined).map((shift, index) => (
                <React.Fragment key={index}>
                  <TableCell>In Time</TableCell>
                  <TableCell>Out Time</TableCell>
                  <TableCell>Break Hours</TableCell>
                  <TableCell>Edit</TableCell>
                </React.Fragment>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((employee, rowIndex) => (
              <>
              
              <TableRow key={rowIndex}>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.emp_id}</TableCell> {/* Use only id here */}
                <TableCell>{commonDateFormat(employee.log_date) || '--'}</TableCell>
                {shifts.filter((shift) => shift !== null && shift !== undefined).map((shift, colIndex) => {
                  const shiftData = {
                    ...employee.shifts[shift],
                    employee_id: employee.shifts[shift]?.employee_id || employee.employee_id || 'unknown',
                    log_date: employee.shifts[shift]?.log_date || employee.log_date || 'unknown', // Use fallback log_date
                  }

                  console.log("shiftData",shiftData)
                  
                  return (
                    <React.Fragment key={colIndex}>
                      <TableCell>
                        {shiftData.isEditing ? (
                          <TextField
                            type="time"
                            value={shiftData.in_time || '--'}
                            onChange={(e) => handleChange(employee.id, shift, 'in_time', e.target.value, shiftData.employee_id, shiftData.log_date)} // Use only id here
                          />
                        ) : (
                          shiftData.in_time !== '--' ?  formatTime12Hour(shiftData.in_time) || '--' : '--'
                        )}
                      </TableCell>
                      <TableCell>
                        {shiftData.isEditing ? (
                          <TextField
                            type="time"
                            value={shiftData.out_time || '--'}
                            onChange={(e) => handleChange(employee.id, shift, 'out_time', e.target.value,shiftData.employee_id, shiftData.log_date)} // Use only id here
                          />
                        ) : (
                          shiftData.in_time !== '--' ? formatTime12Hour(shiftData.out_time) || '--' : '--'
                        )}
                      </TableCell>
                      <TableCell>
                        {shiftData.isEditing ? (
                            <TextField
                            type="text"
                            value={duration || formatbreakTime(shiftData.break_hours)}
                            placeholder="e.g., 5h 30m"
                            onChange={(e) => handleTimeChange(employee.id, shift, 'break_hours', e.target.value,shiftData.employee_id, shiftData.log_date)}
                            helperText={showHelperText ? '(e.g., 5h 30m)' : ''}
                          />
                        ) : (
                          formatbreakTime(shiftData.break_hours) ||'--'
                        )}
                      </TableCell>
                      <TableCell>
                      <IconButton 
                          onClick={() => {
                            // Prevent editing if log_date is today's date and not in editing mode
                            if (!shiftData.isEditing && new Date(employee.log_date).toDateString() === new Date().toDateString()) {
                              dispatch(ManualeditAlert()) ;
                              return;
                              // return; // Do nothing
                            }
                            // Toggle between edit and save
                            shiftData.isEditing
                              ? handleSave(employee.id, shift, employee.log_date, employee.employee_id) // Save action
                              : handleEdit(employee.id, shift, employee.log_date, employee.employee_id); // Edit action
                          }}
                        >
                          {shiftData.isEditing ? <SaveIcon /> : <EditIcon />}
                        </IconButton>
                        {/* <IconButton onClick={() => {
                           if (!shiftData.isEditing && new Date(employee.log_date).toDateString() === new Date().toDateString()) {
                            return; // Disable handleEdit if log_date is today's date
                          }
                          shiftData.isEditing
                            ? handleSave(employee.id, shift, employee.log_date, employee.employee_id) // Save the specific shift
                            : handleEdit(employee.id, shift, employee.log_date, employee.employee_id ); // Edit the specific shift
                        }}>
                          {shiftData.isEditing ? <SaveIcon /> : <EditIcon />}
                        </IconButton> */}
                      </TableCell>
                    </React.Fragment>
                  );
                })}
                {/* <TableCell>
                  <IconButton onClick={() => {
                    const editingShift = shifts.find(shift => employee.shifts[shift]?.isEditing);
                    editingShift
                      ? handleSave(employee.id, editingShift) // Use only id here
                      : handleEdit(employee.id, shifts[0]); // Use only id here
                  }}>
                    {shifts.some(shift => employee.shifts[shift]?.isEditing) ? <SaveIcon /> : <EditIcon />}
                  </IconButton>
                </TableCell> */}
              </TableRow>
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={Object.keys(groupedData).length} // Total number of records
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[50, 100, 150]} // Options for rows per page
      />
    </>
  );
};

export default EmployeeTable;
