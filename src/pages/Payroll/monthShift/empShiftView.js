import {
    Button,
    Card,
    Divider,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography,
  } from '@mui/material';
  import React, { useContext, useEffect, useState } from 'react';
  import { useDispatch, useSelector } from 'react-redux';
  import apiCalls from 'utils/apiCalls';
  import context from '../../../context/CreateNewButtonContext'
  import { dayShiftAction, getSearchdayShift, getSearchmonthShiftScheduleShift, monthShiftScheduleShiftAction, setSearchdayShift, setSearchmonthShiftScheduleShift } from 'redux/actions/shifts.actions';
  import { headerStyle } from 'utils/pageSize';
  import ToggleButton from '@mui/material/ToggleButton';
  import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
  import moment from 'moment';
  import { getLocBaseEmpAction, searchAttendanceCorAction, viewSelfieAttendanceImagesAction } from 'redux/actions/attendance_actions';
  import Filter from './dayViewFilter';
  import CommonSearch from 'utils/commonSearch';
  
  
 export default function MonthView() {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
    const [toggleView, setToggleView] = useState('month');

    const storage = sessionStorage.getItem('login')
    let jsonData;
    try {
      jsonData = JSON.parse(storage);
    } catch (e) {
      jsonData = {};
    }

      const previousYears = Array.from({ length: 4 }, (v, i) => currentYear - i);
      const [headerMonthYear, setHeaderMonthYear] = useState({
          month: currentMonth,
          year: currentYear
        })
    const [processField, setprocessField] = React.useState({
        month: currentMonth, // Set the default value for the month field
        year: currentYear
      });



    const { commoncookie, headerLocationId, setLoaderStatusHandler, setModalTypeHandler } = useContext(context)
    const dispatch = useDispatch()
  
    const { ShiftsReducer: { monthShiftSchedule } } = useSelector(state => state)
    const daysInMonth = new Date(headerMonthYear.year, headerMonthYear.month, 0).getDate();
    const finalData = monthShiftSchedule?.data === 'No Data found' ? [] : monthShiftSchedule?.data
  
    const [rowsPerPage, setRowsPerPage] = React.useState(20);
    const [page, setPage] = React.useState(0);
    const [isApiFinished, setIsApiFinished] = useState(false);
  
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
      setprocessField({...processField,page:newPage})
    };
  
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
      setprocessField({...processField,numPerPage:parseInt(event.target.value, 10)})
    };
    const [formErrors, setFormErrors] = useState({
      month: null,
      year: null,
    });
    useEffect(() => {
        const payload = {
            employee_id : jsonData.employee_id,
            month: processField?.month, // Set the default value for the month field
            year: currentYear,
            page:0,
            numPerPage:20,
            searchString: ""
          }
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(monthShiftScheduleShiftAction(payload))
      )
  
    }, [page,rowsPerPage,processField.month,processField.year,toggleView])
    const monthData = [];
  
    for (let i = 1; i <= daysInMonth; i++) {
      monthData.push({
        day: i,
      });
    }
  
    const handleView = (event, view) => {
        let month = view === 'nextMonth' ? currentMonth + 1 : view === 'prevMonth' ? currentMonth -1 : currentMonth;
        setprocessField({...processField, month :month});
        setToggleView(view);
      };
  
    const months = [
      { id: 1, name: 'January' },
      { id: 2, name: 'February' },
      { id: 3, name: 'March' },
      { id: 4, name: 'April' },
      { id: 5, name: 'May' },
      { id: 6, name: 'June' },
      { id: 7, name: 'July' },
      { id: 8, name: 'August' },
      { id: 9, name: 'September' },
      { id: 10, name: 'October' },
      { id: 11, name: 'November' },
      { id: 12, name: 'December' },
    ];
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setprocessField((prevValues) => ({
        ...prevValues,
        [name]: value
      }));
    };
  
  
    const handleGetShifts = () => {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(monthShiftScheduleShiftAction(processField))
          .then(() => {
            setHeaderMonthYear({
              month: processField.month,
              year: processField.year
            })
          })

      )
    }
  
    const handleMonthChange = (event) => {
      const { name, value } = event.target;
      setprocessField(prevState => ({
        ...prevState,
        [name]: value,
      }));
  
      if (formErrors.month) {
        setFormErrors(prevState => ({
          ...prevState,
          month: null,
        }));
      }
    };
  
  
    const handleYearChange = (event) => {
      const { name, value } = event.target;
      setprocessField(prevState => ({
        ...prevState,
        [name]: value,
      }));
    };
  
  
  
    return (
      <>
        {/* <Typography sx={{ padding: '10px 0px 15px 0px', fontSize: headerStyle.fontSize, fontWeight: headerStyle.fontWeight }}>Monthly Shift Schedule</Typography> */}
        <Card>
        <Card style={{padding:'15px'}}>
        <Grid style={{display:'flex', justifyContent:'space-between'}}>
          <Typography hy sx={{ padding: '10px 0px 15px 0px', fontSize: headerStyle.fontSize, fontWeight: headerStyle.fontWeight }} fontSize="13px" fontWeight="600" color='rgba(0, 0, 0, 0.7)'> {toggleView === 'month' ? 'Current Month ' : toggleView === 'prevMonth' ? 'Previous Month ' : 'Next Month ' }</Typography>
          <ToggleButtonGroup
            color="primary"
            value={toggleView}
            exclusive
            onChange={handleView}
            aria-label="Platform"
          >
            <ToggleButton value="prevMonth">Prev View</ToggleButton>
            <ToggleButton value="month">Current View</ToggleButton>
            <ToggleButton value="nextMonth">Next View</ToggleButton>
            {/* <ToggleButton value="day">Day View</ToggleButton> */}
          </ToggleButtonGroup>
        </Grid>
  
        {/* {toggleView === 'month' ? (
          <MonthView />
        ) : (
          <DayView />
        )} */}

        {/* {
            toggleView === 'month' ? <MonthView/> : toggleView === 'prevMonth' ? <MonthView month={'prevMonth'}/> : <MonthView month={'nextMonth'}/>
        } */}
      </Card>

        <Card sx={{ mt: '20px',minHeight:'74vh',display: 'flex', flexDirection: 'column' }}>
          <TableContainer sx={{  flex: 1, overflowY: 'auto' }}>
            <Table
              aria-label='collapsible table'
              sx={{
                minWidth: '800px',
                tableLayout: 'fixed',
                // height: '100%',
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    className='table-title'
                    style={{
                      fontSize: '10px',
                      paddingLeft: '10px',
                      width: '100px',
                    }}
                  >
                    Employee
                  </TableCell>
                  {[...Array(daysInMonth)].map((_, index) => (
                    <TableCell
                      className='table-title'
                      style={{
                        minWidth: '60px',
                        textAlign: 'center',
                      }}
                      key={`header-${index + 1}`}
                    >
                      {index + 1}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {finalData?.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell
                      className='table-content'
                      style={{
                        minWidth: '200px',
                        fontSize: '12px',
                        whiteSpace: 'wrap',
                        paddingLeft: '10px',
                      }}
                    >
                      {employee.full_name}
                    </TableCell>
                    {[...Array(daysInMonth)].map((_, index) => {
                      const combinedShifts = [];
                      employee.shift.forEach((shift) => {
                        const existingShift = combinedShifts.find((s) => s.date === shift.date);
                        if (existingShift) {
                          existingShift.shift_short_code += `, ${shift.shift_short_code}`;
                        } else {
                          combinedShifts.push({ ...shift });
                        }
                      });
                      const shift = combinedShifts.find((s) => new Date(s.date).getDate() === index + 1);
                      return (
                        <TableCell
                          className='table-content'
                          key={`cell-${index + 1}`}
                          style={{
                            minWidth: '60px',
                            wordWrap: 'break-word',
                          }}
                        >
                          {shift ? shift.shift_short_code : ''}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Divider />
       
        </Card>
</Card>
      </>
    );
  }
  
