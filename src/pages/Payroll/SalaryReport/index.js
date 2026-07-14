import React, { useEffect, useState, useContext } from 'react';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { useDispatch, useSelector } from 'react-redux';

import {
  Grid,
  Typography,
  Box,
  Paper,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
  Button,
  TextField,
  InputAdornment,
  FormHelperText,
} from '@mui/material';
import { ListSalaryAction, getSearchSalaryAction, setSearchSalaryState } from 'redux/actions/salary_actions';
import SalaryReducers from './../../../redux/reducers/salary_reducers';
import apiCalls from 'utils/apiCalls';
import { maxBodyHeight, maxHeight, pageSize, headerStyle, cellStyle, font14_500 } from 'utils/pageSize';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { AttendanceProcessAction, overtimeReportAction, filterSalaryReportAction } from 'redux/actions/attendance_actions';
// import {  pageSize} from 'utils/pageSize'
import moment from 'moment';
import { Helmet } from 'react-helmet-async';
import { commonDateFormat1 } from 'utils/getTimeFormat';
import { titleURL } from 'http-common';

const SalaryReport = () => {
  const dispatch = useDispatch();
  const {
    SalaryReducers: { salarylist, searchSalaryData }, attendanceReducer: { attendance_process, overtime_report, filter_salary },
  } = useSelector((state) => state);

  const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(
    CreateNewButtonContext,
  );
  var date = new Date();
  let firstDay = date.getMonth() <= 2 ? new Date(date.getFullYear() - 1, 3, 1) : new Date(date.getFullYear(), 3, 1);
  var lastDay = new Date();

  // useEffect(() => {
  //   let data = {
  //     employee_id: "null",
  //     location_id: "null",
  //     from: moment(firstDay, 'year', 'month', 'day').format('yyyy-MM-DD'),
  //     to: moment(lastDay, 'year', 'month', 'day').format('yyyy-MM-DD'),
  //   }
  //   dispatch(setSearchSalaryState({ data: [], numRows: 0 }));
  //   apiCalls(
  //     setModalTypeHandler,
  //     setLoaderStatusHandler,
  //     commoncookie, headerLocationId,
  //     dispatch(ListSalaryAction(setModalTypeHandler, setLoaderStatusHandler)),
  //     dispatch(AttendanceProcessAction(data)),
  //     dispatch(overtimeReportAction())
  //   )
  // }, []);
  const [searchVal, setsearchVal] = useState('');
  const [reportTypes, setReportTypes] = useState({
    bankReport: 'Bank Report',
    attendanceReport: 'Attendance Report',
    overTimeReport: 'Over Time Report',
  });
  const [helperText, setHelperText] = useState('');
  const [selectedReport, setSelectedReport] = useState('bankReport');
  const [monthYear, setMonthYear] = React.useState({
    month: null,
    year: null,
  });
  const [isFilter,setIsFilter ] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;


    if (name == "month" && !value) {
      setHelperText('1')
    }
    else if (name == "year" && !value) {
      setHelperText('2')
    } else {
      setHelperText('')
    }
    setMonthYear({ ...monthYear, [name]: value });
  };


  const [columns, setColumns] = useState({
    bankReport: [
      { title: 'Name', field: 'name',
      cellStyle: {textTransform:"capitalize"} },
      { title: 'Code', field: 'code' },
      { title: 'Basic', field: 'BASIC' },
      { title: 'HRA', field: 'HRA' },
      { title: 'Conveyance', field: 'CONV' },
      { title: 'DA', field: 'DA' },
      //{title: 'Medical', field: 'medical'},
      //{title: 'Leave Travel', field: 'leaveTravel'},
      //{title: 'Special', field: 'special'},
      { title: 'PF', field: 'EPF' },
      { title: 'ESI', field: 'ESI' },
      { title: 'OT', field: 'OT' },
      { title: 'Incentive', field: 'INC' },
      // { title: 'PT', field: 'pt' },
    //   { title: 'Fixed', field: 'fixed' },
    //   { title: 'Lop detail', field: 'lop_detail' },
    ],
    attendanceReport: [
      { title: 'Name', field: 'first_name', render: rowData => rowData.first_name ? (rowData.first_name + (rowData.last_name && rowData.last_name.length > 0 ? ' ' + rowData.last_name : '')) : '-' },
      {
        title: 'Date', field: 'creationDate',
        render: (rowData) => (commonDateFormat1(rowData?.creationDate?.split(" ")[0])),
      },
      { 
        title: 'Check In', 
        field: 'first_in_time',
        render: (rowData) =>
        <div>
          {rowData.first_in_time
            ? moment(rowData.first_in_time, 'HH:mm:ss').format('hh:mm A')
            : ''}
        </div>
      },
      { 
        title: 'Check Out', 
        field: 'last_out_time',
        render: (rowData) =>
        <div>
          {rowData.last_out_time
            ? moment(rowData.last_out_time, 'HH:mm:ss').format('hh:mm A')
            : ''}
        </div> 
      },
      { title: 'Break Time', field: 'break_hours' },
      { title: 'Shift Time', field: 'shiftTime' },
    ],
    overTimeReport: [
      { title: 'Name', field: 'first_name',cellStyle: {textTransform:"capitalize"}, render: rowData => rowData.first_name ? (rowData.first_name + (rowData.last_name && rowData.last_name.length > 0 ? ' ' + rowData.last_name : '')) : '-' },
      { title: 'Office Name', field: 'company_name',cellStyle: {textTransform:"capitalize"} },
      { title: 'Shift Name', field: 'shift_name',cellStyle: {textTransform:"capitalize"} },
      { 
        title: 'Check In', 
        field: 'start_time',
        render: (rowData) =>
        <div>
          {rowData.start_time
            ? moment(rowData.start_time, 'HH:mm:ss').format('hh:mm A')
            : ''}
        </div> 
      },
      { 
        title: 'Check Out',
        field: 'end_time',
        render: (rowData) =>
        <div>
          {rowData.end_time
            ? moment(rowData.end_time, 'HH:mm:ss').format('hh:mm A')
            : ''}
        </div> 
      },
      //{title: 'Break Time', field: 'breakTime'},
      //{title: 'Shift Time', field: 'shiftTime'},
      { title: 'OT', field: 'OverTime' },
    ],
  });

  const requestSearch = (e) => {

    let val = e.target.value;
    //setSearchData({...searchData, searchVal: val});
    setsearchVal(val)
    // if(val.trim() !== ''){
    dispatch(setSearchSalaryState({ data: [], numRows: 0 }))
    // }
    const body = {
      numPerPage: pageSize,
      pageCount: 0,
      searchString: val,
      employeeId: commoncookie,
      headerLocationId: headerLocationId
    }
    dispatch(getSearchSalaryAction(
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    )
    )
  };

  const cancelSearch = (e) => {
    setsearchVal('')
    dispatch(setSearchSalaryState({ data: [], numRows: 0 }))
  };
  const Tdata = () => {
    console.log({isFilter, filter_salary})
    if(isFilter === true){
      return filter_salary
    }
    else{
    switch (selectedReport) {
      case 'bankReport': {
        return salarylist
      }
      case 'attendanceReport': {
        return attendance_process
      }
      case 'overTimeReport': {
        return overtime_report
      }
      default: {
        return []
      }
    }
  }
  }
  // useEffect(() => {
  //   let date1 = `${monthYear.year}-${monthYear.month}-01`
  //   let date2 = `${monthYear.year}-${monthYear.month}-30`
  //   const data = {
  //     from_date: moment(date1).format('YYYY-MM-DD'),
  //     to_date: moment(date2).format('YYYY-MM-DD'),
  //     type: selectedReport
  //   }
  //   if (monthYear.year === null) {
  //     return []
  //   } else {
  //     dispatch(filterSalaryReportAction(data))
  //   }
  // }, [selectedReport])

  const  handleSubmit = () => {
    let isValid = true;
    if (monthYear.month === null && monthYear.year === null) {
      isValid = false;
      setHelperText('0');
    }
    else if (monthYear.month === null) {
      isValid = false;
      setHelperText('1');
    }
    else if (monthYear.year === null) {
      isValid = false;
      setHelperText('2');
    }
    else {
      setHelperText('')
    }
    if (isValid) {
      setIsFilter(true)
      let date1 = `${monthYear.year}-${monthYear.month}-01`
      let date2 = `${monthYear.year}-${monthYear.month}-30`
      const data = {
        from_date: moment(date1).format('YYYY-MM-DD'),
        to_date: moment(date2).format('YYYY-MM-DD'),
        type: selectedReport
      }
      dispatch(filterSalaryReportAction(data))
    }
  };

// const filter=(value)=>{
//   if (monthYear.month !== null && monthYear.year !== null) {
//     setIsFilter(true)
//     let date1 = `${monthYear.year}-${monthYear.month}-01`
//     let date2 = `${monthYear.year}-${monthYear.month}-30`
//     const data = {
//       from_date: moment(date1).format('YYYY-MM-DD'),
//       to_date: moment(date2).format('YYYY-MM-DD'),
//       type: selectedReport
//     }
//     dispatch(filterSalaryReportAction(data))
//   } 
// }

  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <title>{titleURL} | Salary Report </title>
      </Helmet>
      <Box>
        <Paper elevation={3} style={{ padding: '20px', borderRadius: '0px' }}>
          <Grid
            style={{
              display: 'flex',
              gap: '20px',
              alignItems: 'flex-start',
              flexDirection: 'column',
            }}
          >
            <Grid>
              <FormControl variant='standard' sx={{ m: 1, minWidth: 260 }}>
                <InputLabel>Month <span style={{ color: 'red' }}>*</span> </InputLabel>
                <Select
                  value={monthYear.month}
                  name='month'
                  onChange={handleChange}
                  label='Month'
                >
                  {months.map((m) => {
                    return (
                      <MenuItem key={m.num} value={m.num}>
                        {m.month}
                      </MenuItem>
                    );
                  })}
                </Select>
                <FormHelperText style={{ color: 'red' }}>
                  {helperText === "" ? "" : ((helperText === '1' || helperText === '0') ? "month required" : '')}</FormHelperText>
              </FormControl>
              <FormControl variant='standard' sx={{ m: 1, minWidth: 260 }}>
                <InputLabel>Year <span style={{ color: 'red' }}>*</span> </InputLabel>
                <Select
                  value={monthYear.year}
                  name='year'
                  onChange={handleChange}
                  label='Year'
                >
                  {generateArrayOfYears().map((year) => {
                    return (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    );
                  })}
                </Select>
                <FormHelperText
                  style={{ color: 'red' }}
                >{helperText === "" ? "" : ((helperText === '2' || helperText === '0') ? "year required" : '')}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid style={{}}>
              <FormControl>
                <FormLabel>Reports</FormLabel>
                <RadioGroup
                  row
                  name='reports'
                  value={selectedReport}
                  onChange={(e) => {
                    setSelectedReport(e.target.value);
                    setIsFilter(false)
                    //filter(e.target.value)
                  }}
                >
                  <FormControlLabel
                    value={'bankReport'}
                    style={{ fontSize: '20px' }}
                    control={<Radio />}
                    label={reportTypes.bankReport}
                  />
                  <FormControlLabel
                    value={'attendanceReport'}
                    control={<Radio />}
                    label={reportTypes.attendanceReport}
                  />
                  <FormControlLabel
                    value={'overTimeReport'}
                    control={<Radio />}
                    label={reportTypes.overTimeReport}
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Button
              variant='contained'
              style={{}}
              onClick={handleSubmit}
            >
              Apply
            </Button>
          </Grid>
        </Paper>
      </Box>
      <MaterialTable
        style={{height:'52vh',overflow:'auto'}}
        components={{
          Toolbar: (props) => (
            <>
              <div
                style={{ display: 'flex', width: '100%', alignItems: 'center' }}
              >
                <div style={{ width: '100%' }}>
                  <MTableToolbar {...props} />
                </div>
                {/* <div style={{paddingRight:'10px'}}>
                  <TextField
                    autoFocus={searchVal ? true : false}
                    fullWidth
                    sx={{
                      borderRadius: 5,
                      backgroundColor: '#F4F7FE',
                      mr: '10px',
                      '& .MuiOutlinedInput-root': {
                          height: '42px',
                      },
                      '& fieldset': { border: 'none', borderRadius: 5 },
                  }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <SearchIcon />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position='end'>
                          <ClearIcon
                            onClick={cancelSearch}
                            sx={{ cursor: 'pointer', visibility: searchVal ? 'visible' : 'hidden' }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    placeholder='Search'
                    value={searchVal}
                    onChange={requestSearch}
                  />
                </div> */}
              </div>
            </>
          ),
        }}
        options={{
          headerStyle,
          cellStyle,
          search: true,
          exportButton: false,
          filtering: false,
          actionsColumnIndex: -1,
          maxBodyHeight: maxBodyHeight,
          pageSizeOptions: [20, 50, 100],
        }}
        columns={columns[selectedReport]}
        data={Tdata()}
        title={
          <Typography
            variant='h6'
            align='left'
            style={{ paddingTop: '10px', paddingBottom: '10px' }}
          >
            {reportTypes[selectedReport]}
          </Typography>
        }
      />
    </>
  );
};

const months = [
  { month: 'Jan', num: 1 },
  { month: 'Feb', num: 2 },
  { month: 'Mar', num: 3 },
  { month: 'Apr', num: 4 },
  { month: 'May', num: 5 },
  { month: 'Jun', num: 6 },
  { month: 'Jul', num: 7 },
  { month: 'Aug', num: 8 },
  { month: 'Sep', num: 9 },
  { month: 'Oct', num: 10 },
  { month: 'Nov', num: 11 },
  { month: 'Dec', num: 12 },
];

function generateArrayOfYears() {
  var max = new Date().getFullYear();
  var min = max - 9;
  var years = [];

  for (var i = max; i >= min; i--) {
    years.push(i);
  }
  return years;
}

export default SalaryReport;

