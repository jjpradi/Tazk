import {
  Button,
  Box,
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
import { getsessionStorage } from 'pages/common/login/cookies';
import { singlePageScrollContentSx } from 'utils/pageScrollLayout';
import { stickyMuiTableHeadCellSx } from 'utils/stickyTableLayout';

const storage = getsessionStorage()

export default function ShiftView(){
  const [toggleView, setToggleView] = useState('month');

  const handleView = (event, view) => {
    if(!view) return;
    setToggleView(view);
  };
  return (
    <Card
      sx={{
        p: 2.5,
        height: 'calc(100dvh - 80px)',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Grid style={{display:'flex', justifyContent:'space-between'}}>
        <Typography hy sx={{ padding: '10px 0px 15px 0px', fontSize: headerStyle.fontSize, fontWeight: headerStyle.fontWeight }}  fontSize="13px" fontWeight="600" color='rgba(0, 0, 0, 0.7)'> {toggleView === 'month' ? 'Monthly Shift schedule' : 'Day View' }</Typography>
        <ToggleButtonGroup
          color="primary"
          value={toggleView}
          exclusive
          onChange={handleView}
          aria-label="Platform"
          size="small"
          sx={{
            height: '36px',
            '& .MuiToggleButton-root': {
              textTransform: 'none',
              fontSize: '13px',
              fontFamily: 'Poppins',
              fontWeight: 500,
              px: 2,
              border: '1px solid #e0e0e0',
              color: 'rgba(0, 0, 0, 0.6)',
              '&.Mui-selected': {
                backgroundColor: '#1976d2',
                color: '#fff',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
              },
            },
          }}
        >
          <ToggleButton value="month">Month View</ToggleButton>
          <ToggleButton value="day">Day View</ToggleButton>
        </ToggleButtonGroup>
      </Grid>
      <Box sx={{ ...singlePageScrollContentSx, pt: 1 }}>
        {toggleView === 'month' ? (
          <MonthView />
        ) : (
          <DayView />
        )}
      </Box>
    </Card>
  )
}


function MonthView() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const previousYears = Array.from({ length: 4 }, (v, i) => currentYear - i);
  const [headerMonthYear, setHeaderMonthYear] = useState({
    month: currentMonth,
    year: currentYear
  })
  const [processField, setprocessField] = React.useState({
    month: currentMonth, // Set the default value for the month field
    year: currentYear,
    page:0,
    numPerPage:20,
    searchString: "",
    employee_id: 'null'
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
    setRowsPerPage(parseInt(event.target.value));
    setPage(0);
    setprocessField({...processField,numPerPage:parseInt(event.target.value, 10)})
  };
  //  console.log(processField,'processField');
  //  console.log('finalData', finalData)
  const [formErrors, setFormErrors] = useState({
    month: null,
    year: null,
  });
  useEffect(() => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(monthShiftScheduleShiftAction(processField))
    )

  }, [processField.page, processField.numPerPage, processField.month, processField.year])
  const monthData = [];

  for (let i = 1; i <= daysInMonth; i++) {
    monthData.push({
      day: i,
    });
  }

  // let dateTemp = [];

  // for (let i = 1; i <= daysInMonth; i++) {
  //   // Format the date components to get YYYY-MM-DD format
  //   const formattedDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
  //   dateTemp.push({
  //     shiftName: '-',
  //     date: formattedDate // Full date in YYYY-MM-DD format
  //   });
  // }
  
  // console.log(aaa);
  

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
    // setFormErrors((prevErrors) => ({
    //   ...prevErrors,
    //   [name]: value ? null : 'Field is required'
    // }));
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

  const requestSearch = async (e) => {
    let val = e.target.value;
    // setData({...data, searchVal: val});
    setprocessField({...processField,searchString:val})
    await setIsApiFinished(false);
  
    dispatch(setSearchmonthShiftScheduleShift({data: [], numRows: 0}));
    const body = {
      month: processField.month, 
      year: processField.year,
      page: 0,
      numPerPage:processField.numPerPage,
      searchString: val,
      employee_id: processField.employee_id
    };
    await apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        getSearchmonthShiftScheduleShift(
          body,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      ),
    ).finally(() => setIsApiFinished(true));
    
  };

  const cancelSearch =  () => {
    setprocessField({...processField,searchString:""})
  
    dispatch(setSearchmonthShiftScheduleShift({data: [], numRows: 0}));
    const body = {
      month: processField.month, 
      year: processField.year,
      page: 0,
      numPerPage:processField.numPerPage,
      searchString: "",
      employee_id: processField.employee_id
    };
     apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        monthShiftScheduleShiftAction(
          body,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      ),
    )
    
  };

  return (
    <>
      {/* <Typography sx={{ padding: '10px 0px 15px 0px', fontSize: headerStyle.fontSize, fontWeight: headerStyle.fontWeight }}>Monthly Shift Schedule</Typography> */}
      <Card sx={{ padding: '15px',boxShadow: 'none', border: 'none',}}>
        <Grid container display={'flex'} alignItems={'center'} spacing={3}>
          <Grid
            display={'flex'}
            size={{
              lg: 3,
              md: 4,
              sm: 6,
              xs: 12
            }}>
            <FormControl variant='outlined' fullWidth>
              <InputLabel>Month</InputLabel>
              <Select
                value={processField.month}
                name='month'
                onChange={handleMonthChange}
                label='Month'
                required
                error={formErrors.month !== null}
                helperText={formErrors.month}
                sx={{
                  '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline':
                    {
                      borderColor: 'red', // Set the border color to red when error is true
                    },
                  '& .MuiFormHelperText-root.Mui-error': {
                    color: 'red', // Set the helper text color to red when error is true
                  },
                }}
              >
                {months.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText sx={{color: 'red'}}>
                {formErrors.month}
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid
            display={'flex'}
            justifyContent={'center'}
            size={{
              lg: 3,
              md: 2,
              sm: 4.5,
              xs: 12
            }}>
            <FormControl variant='outlined' fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                value={processField.year || currentYear}
                name='year'
                onChange={handleYearChange}
                label='Year'
                required
              >
                {previousYears.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid
            display={'flex'}
            justifyContent={'flex-end'}
            size={{
              lg: 6,
              md: 4,
              sm: 4,
              xs: 12
            }}>
            <CommonSearch
              searchVal={processField.searchString}
              cancelSearch={cancelSearch}
              requestSearch={requestSearch}
            />
          </Grid>
        </Grid>
      </Card>
      <Card sx={{ mt: '10px',height: 'calc(100vh - 230px)',display: 'flex', flexDirection: 'column', boxShadow: 'none', border: 'none', }}>
        <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
          <Table
            aria-label='collapsible table'
            sx={{
              minWidth: 'max-content',
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  sx={stickyMuiTableHeadCellSx}
                  className='table-title'
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    fontFamily: 'Poppins',
                    color: 'rgba(0, 0, 0, 0.7)',
                    paddingLeft: '10px',
                    width: '100px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Employee
                </TableCell>
                {[...Array(daysInMonth)].map((_, index) => (
                  <TableCell
                    sx={stickyMuiTableHeadCellSx}
                    className='table-title'
                    style={{
                      minWidth: '40px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      fontSize: '12px',
                      fontWeight: '600',
                      fontFamily: 'Poppins',
                      color: 'rgba(0, 0, 0, 0.7)',
                      padding: '6px 4px',
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
                      minWidth: '120px',
                      fontSize: '12px',
                      fontFamily: 'Poppins',
                      whiteSpace: 'nowrap',
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
                          minWidth: '40px',
                          whiteSpace: 'nowrap',
                          fontSize: '12px',
                          fontFamily: 'Poppins',
                          textAlign: 'center',
                          padding: '6px 4px',
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
        <TablePagination
        sx={{ flexShrink: 0 }}
          rowsPerPageOptions={[20, 50, 100]}
          component='div'
          count={monthShiftSchedule?.numRows || 0}
          rowsPerPage={rowsPerPage || 0}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </>
  );
}


function DayView(){
  const currentDate = new Date();
  const currentDay = currentDate.getDate()
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const previousYears = Array.from({ length: 4 }, (v, i) => currentYear - i);
  const formatCurDate = moment(currentDate).format('YYYY-MM-DD')
  const [headerMonthYear, setHeaderMonthYear] = useState({
    month: currentMonth,
    year: currentYear,
    day: currentDay,
  })
  const [formValues, setFormValues] = useState({
    employee_id: [''],
    location: [''],
    department: [''],
    date: moment().format('YYYY-MM-DD'),
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedAll, setSelectedAll] = useState(false);
  const [value, setValue] = React.useState([]);
  const dispatch = useDispatch();
  const [formErrors,setFormErrors] = useState({
    empName: null,
  })
  const [timeFormat, setTimeFormat] = useState('12h');

  const [pages, setPages] = useState(0)
  const [sizes, setSizes] = useState(20)
  const [searchString, setSearchString] = useState("")
  // const [open,setOpen] = useState(false)
  const { commoncookie, headerLocationId, setLoaderStatusHandler, setModalTypeHandler } = useContext(context)
  const { ShiftsReducer: { dayShift, dayShiftCount } } = useSelector(state => state)

  console.log("dayShift",dayShiftCount);
  

  useEffect(() => {
    let payload = {
      employee_id : formValues.employee_id[0] === '' ? 'null' : formValues.employee_id,
      dateVal : moment(formValues.date).format('YYYY-MM-DD'),
      location_id: formValues.location[0] === '' ? 'null' : formValues.location,
      department: formValues.department === '' ? 'null' : formValues.department,
      pageCount : pages,
      numPerPage : sizes,
      searchString: "",
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(dayShiftAction(payload))
    )
  }, [pages, sizes, filterOpen === false])

  const handlePageChange = (event, value) => {
    setPages(value);
  };

  const handlePageSizeChange = (event, value) => {
    setPages(0);
    setSizes(parseInt(event.target.value, 10));
  }
  console.log('sdfwwas', pages, sizes)
  console.log('dayShift',dayShift)

  const handleFormat = (event,format) => {
    if(!format) return
    setTimeFormat(format);
  };

  console.log({timeFormat});

  const ApplyButton = async (event) => {
    event.preventDefault();
      if (selectedAll) {
  
        dispatch(getLocBaseEmpAction(formValues, (res) => {
          if (res.data?.employees) {
            processFunction(res.data?.employees)
          }
        }))
      }
  
      else {  
        processFunction(value)
      }
  };

  const processFunction = async (value) =>{
    if (value?.length === 0  ) {
      setFormErrors({
        ...formErrors,
          empName: value.length === 0  ? 'Employee is required' : null,
        
      });
      return;
    }
    setFormValues({ ...formValues, employee_id : value.map((d)=> d.employee_id)})
    let data = {
      employee_id:value.map((d)=> d.employee_id),
      dateVal : moment(formValues.date).format('YYYY-MM-DD'),
      location_id: formValues.location[0] === '' ? 'null' : formValues.location,
      department: formValues.department === '' ? 'null' : formValues.department,
      pageCount : 0,
      numPerPage : sizes,
      searchString: "",
    };
    setPages(0)
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(dayShiftAction(data))
    );
    setFilterOpen(false)
  }

  const ClearButton = async() => {
    await setFormValues({
      employee_id: [''],
      location: [''],
      department: [''],
      dateVal: moment().format('YYYY-MM-DD'),
    });
    // let data = {
    //   employee_id : 'null',
    //   dateVal : moment().format('YYYY-MM-DD'),
    //   location_id : 'null',
    //   department: 'null',
    //   pageCount : 0,
    //   numPerPage : sizes
    // };
    // setPages(0)
    // apiCalls(
    //   setModalTypeHandler,
    //   setLoaderStatusHandler,
    //   dispatch(dayShiftAction(data))
    // );
    setFilterOpen(false)
  };

  const handleChangeEmployeeName =(val)=>{
    console.log('akjdjfe', val)
    setValue(val)
    let datVal = val.map((d) => {
      setFormValues({ ...formValues, empName : d.employee_id})
    })
  }

  const hours = Array.from({length:24}, ((v,i) => {
    let obj = {'24h' : i};

    if(i <= 11){
      obj['12h'] = `${i} am`
    }else if(i == 12){
      obj['12h'] = `${i} pm`
    } else {
      obj['12h'] = `${i - 12} pm`
    }

    return obj

  }))

  console.log({hours});

  const { ShiftsReducer: { monthShiftSchedule } } = useSelector(state => state)
  const daysInMonth = new Date(headerMonthYear.year, headerMonthYear.month, 0).getDate();
  const finalData = monthShiftSchedule === 'No Data found' ? [] : monthShiftSchedule


  const arr = [];

  hours.forEach(i => {
      arr.push(i);
      arr.push({ 
          '24h': i['24h'] + 0.5, 
          '12h': (+i['12h'].split(' ')[0] + 0.5) + ' ' + i['12h'].split(' ')[1]          
      })
      
  })

  // console.log(arr)
  const predefinedColors = [
    '#FFDDDD',  // Light red
    '#DDFFDD',  // Light green
    '#DDDDFF',  // Light blue
    '#CCCCFF',  // Light purple
  ];

  const shiftColorMap = new Map();
  let colorIndex = 0;

  function generateColorForShift(shiftCode, hasNoShift = false) {
    if (shiftCode === '' || hasNoShift) {
      return '#FFFFFF';
    }
    if (!shiftCode) {
      return '#FFFFFF'; // Default color for empty or undefined shift codes
    }

    if (!shiftColorMap.has(shiftCode)) {
      const color = predefinedColors[colorIndex % predefinedColors.length];
      shiftColorMap.set(shiftCode, color);
      colorIndex++;
    }

    return shiftColorMap.get(shiftCode);
  }
  
  const resultData = Array.isArray(dayShift) && dayShift.map((d) => {
    function timeStringToDecimal(timeString) {
      if (!timeString || typeof timeString !== 'string') {
        return '';
      }
      const [hours, minutes] = timeString.split(':').map(Number);
      return hours + minutes / 60;
    }
  
    let obj = {};
    for (let i = 0; i <= 23.5; i += 0.5) {
      obj[i] = { status: '', span: 1, index: -1 };
    }
  
    if (d.shift_details[0].shift_name === "") {
      obj[12] = { status: '', span: 1, index: -1 };
    }else {
      d.shift_details.forEach((shift, index) => {
        const shiftStart = timeStringToDecimal(shift.start_shift_time);
        let shiftEnd = timeStringToDecimal(shift.end_shift_time) + 0.5;
  
        if (shiftEnd <= shiftStart) {
          for (let i = shiftStart; i <= 23.5; i += 0.5) {
            markShift(i, shift.shift_short_code, index);
          }
          for (let i = 0; i <= shiftEnd; i += 0.5) {
            markShift(i, shift.shift_short_code, index);
          }
        } else {
          for (let i = shiftStart; i < shiftEnd; i += 0.5) {
            markShift(i, shift.shift_short_code, index);
          }
        }
      });
  
      handleTimeBlocks(d.permissions, 'P');
      handleTimeBlocks(d.leave, 'L');
    }
  
    function markShift(time, status, index) {
      if (!obj[time]) {
        obj[time] = { status: '', span: 1, index: -1 };
      }
      if (obj[time].status === '') {
        obj[time].status = status;
        obj[time].index = index;
      }
    }
  
    function handleTimeBlocks(blocks, type) {
      blocks.forEach((block) => {
        const start = timeStringToDecimal(block.start_shift_time);
        const end = timeStringToDecimal(block.end_shift_time);
        for (let i = start; i < end; i += 0.5) {
          if (!obj[i]) {
            obj[i] = { status: '', span: 1, index: -1 };
          }
          if (obj[i].status === '') {
            obj[i].status = type;
          }
        }
      });
    }
  
    const res = [];
    for (const [key, value] of Object.entries(obj)) {
      res.push({ hours: key, status: value.status, span: value.span, index: value.index });
    }
  
    return { ...d, shiftDetails: res };
  });
  

  console.log("resultData1", resultData);
  
  const requestSearch = async (e) => {
    let val = e.target.value;

setSearchString(val)
  
    dispatch(setSearchdayShift({data: [], numRows: 0}));
    let body = {
      employee_id : formValues.employee_id[0] === '' ? 'null' : formValues.employee_id,
      dateVal : moment(formValues.date).format('YYYY-MM-DD'),
      location_id: formValues.location[0] === '' ? 'null' : formValues.location,
      department: formValues.department === '' ? 'null' : formValues.department,
      pageCount : pages,
      numPerPage : sizes,
      searchString: val
    }
    await apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        getSearchdayShift(
          body,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      ),
    )
    
  };

  const cancelSearch =  () => {
    setSearchString("")
  
    dispatch(setSearchdayShift({data: [], numRows: 0}));
     let body = {
      employee_id : formValues.employee_id[0] === '' ? 'null' : formValues.employee_id,
      dateVal : moment(formValues.date).format('YYYY-MM-DD'),
      location_id: formValues.location[0] === '' ? 'null' : formValues.location,
      department: formValues.department === '' ? 'null' : formValues.department,
      pageCount : 0,
      numPerPage : sizes,
      searchString: ""
    }
     apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        dayShiftAction(
          body,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      ),
    )
    
  };

  console.log('sdfg', resultData)
  
  console.log('asdasfasf', arr)

  return (
    <>
      <Card sx={{ boxShadow: 'none', overflow: 'hidden' }}>
        <Card
          sx={{
            mt: '10px',
            overflow: 'hidden',
            boxShadow: 'none',
            height: 'calc(100dvh - 220px)',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
>
  <Grid container justifyContent="flex-end" paddingBottom={3}>
    <CommonSearch
      searchVal={searchString}
      cancelSearch={cancelSearch}
      requestSearch={requestSearch}
    />
    <Filter
      open={filterOpen}
      handleClose={() => setFilterOpen(false)}
      handleOpen={() => setFilterOpen(true)}
      formValues={formValues}
      setFormValues={setFormValues}
      ApplyButton={ApplyButton}
      ClearButton={ClearButton}
      selectedAll={selectedAll}
      setSelectedAll={setSelectedAll}
      value={value}
      setValue={handleChangeEmployeeName}
      formErrors={formErrors}
      reqType={true}
    />
    <ToggleButtonGroup
      size="small"
      value={timeFormat}
      exclusive
      onChange={handleFormat}
      aria-label="text formatting"
      style={{ height: '40px' }}
    >
      <ToggleButton value="12h" aria-label="12 hour">
        12 H
      </ToggleButton>
      <ToggleButton value="24h" aria-label="24 hour">
        24 H
      </ToggleButton>
    </ToggleButtonGroup>
  </Grid>
  <TableContainer
    sx={{
      flex: 1,
      minHeight: 0,
      overflow: 'auto',
    }}
  >
    <Table aria-label="collapsible table" sx={{ width: '100%' }}>
          <TableHead>
        <TableRow>
          <TableCell
            sx={stickyMuiTableHeadCellSx}
            style={{
              fontFamily: 'Poppins',
              fontSize: '12px',
              fontWeight: '600',
              color: 'rgba(0, 0, 0, 0.7)',
              whiteSpace: 'nowrap',
              width: '100px',
              padding: '6px 8px',
            }}
          >
            Employee
          </TableCell>
          {arr.map((s) => {
            const isHalfHour = parseFloat(s[timeFormat]) % 1 === 0.5;
            return (
            <TableCell
              sx={stickyMuiTableHeadCellSx}
              key={s[timeFormat]}
              style={{
                whiteSpace: 'nowrap',
                padding: '6px 0',
                textAlign: 'center',
                fontFamily: 'Poppins',
                fontSize: '12px',
                fontWeight: '600',
                color: 'rgba(0, 0, 0, 0.7)',
                width: isHalfHour ? '20px' : 'auto',
              }}
            >
              {isHalfHour ? '' : s[timeFormat]}
            </TableCell>
            );
          })}
        </TableRow>
      </TableHead>
            <TableBody>
              {Array.isArray(resultData) &&
                resultData.map((t) => {
                  const hasNoShift = t.shiftDetails.some(detail => detail.status === 'No Shift');

                  return (
                    <TableRow key={t.id} sx={{ '& > *': { borderBottom: 'unset' } }}>
                      <TableCell style={{ fontSize: '12px', fontFamily: 'Poppins' }}>{t.full_name}</TableCell>
                      {arr.map((a) => {
                        const match = t.shiftDetails.find((b) => b.hours == a['24h']);

                        if (!match || match.span === 0) return null;

                        const backgroundColor = generateColorForShift(match.status, hasNoShift);

                        return (
                          <TableCell
                            key={`${t.id}-${a['24h']}`}
                            colSpan={match.span}
                            style={{
                              backgroundColor,
                              color: backgroundColor === '#F0F0F0' ? '#000' : '',
                              padding: '0 4px',
                              textAlign: 'center',
                              borderBottom: '1px solid #ddd',
                              fontSize: '12px',
                              fontFamily: 'Poppins',
                            }}
                          >
                            {match.status}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
            </TableBody>
    </Table>
  </TableContainer>
 <Divider sx={{ border: 'none', height: '10px' }} />

  
</Card>

<TablePagination
    sx={{
      flexShrink: 0,
      border: 'none',
      boxShadow: 'none',
      borderBottom: 'none',
      '& .MuiTablePagination-toolbar': { border: 'none' },
      '& .MuiTablePagination-root': { borderBottom: 'none' },
      mt: 1,
    }}
  rowsPerPageOptions={[20, 50, 100]}
  component="div"
  count={dayShiftCount}
  rowsPerPage={sizes}
  page={pages}
  onPageChange={handlePageChange}
  onRowsPerPageChange={handlePageSizeChange}
/>
  </Card>

    </>
  );
}
