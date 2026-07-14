import { useTheme } from '@emotion/react';
import { Autocomplete, Box, Button, Card, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, FormHelperText, Grid, InputLabel, MenuItem, OutlinedInput, Paper, Select, Stack, Table, TableBody, TableContainer, TableRow, TextField, Typography, Tabs, Tab, AppBar } from '@mui/material'
import React, { useContext, useEffect, useRef, useState } from 'react'
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { useDispatch, useSelector } from 'react-redux';
import { AttendanceProcessAction, AttendanceViewAction, ManualCorrectionGet, attendanceProcessBackgroundJobAction, getDeptBaseEmpAction, getDeptBaseEmpFilterAction, getEmpbasecompanyAction, getLocBaseEmpAction, get_search_department_based_employee, searchAttendanceViewAction, set_search_department_based_employee, setsearchAttendanceViewAction } from 'redux/actions/attendance_actions';
import { font14_500, headerStyle, maxBodyHeight, cellStyle, formatTime12Hour, maxHeight } from 'utils/pageSize';
import CancelIcon from '@mui/icons-material/Cancel';
import moment from 'moment';
import apiCalls from 'utils/apiCalls';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import { ExportCsv, ExportPdf } from '@material-table/exporters';
import { Link } from 'react-router-dom';
import context from '../../../context/CreateNewButtonContext'
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import _ from 'lodash';
import { Helmet } from "react-helmet-async";
import CommonToolTip from 'components/ToolTip';
import CommonSearch from 'utils/commonSearch';
import { commonDateFormat, commonDateFormat1 } from 'utils/getTimeFormat';
import AttendanceProcessDialog from './attendanceProcessDialog'
import { titleURL } from 'http-common';
import { ATTENDANCE_VIEW, GET_EMP_BASECOMPANY, LOCATION_BASE_DEP } from 'redux/actionTypes';
import { departmentListAction } from 'redux/actions/userCreation_actions';
import CommonUserAutoComplete from 'utils/commonAutoCompleteForUser';
import { listDepartment } from 'redux/actions/shifts.actions';
import EmployeeTable from './manualEdit';
import PropTypes from 'prop-types';
import { PeopleAltIcon, PinDropIcon } from 'pages/routesIcons';
import PersonIcon from '@mui/icons-material/Person';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import socketManager from 'utils/socketManager';
import {
  getSinglePageScrollLayoutSx,
  singlePageScrollContentSx,
} from 'utils/pageScrollLayout';
import {
  getStickyTableOptions,
  stickyTableComponents,
} from 'utils/stickyTableLayout';
// import { useTheme } from '@mui/material/styles';



const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8',
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}


export default function index() {
  const dispatch = useDispatch();
  const tableRef = useRef(null);
  const [searchVal, setSearchVal] = useState('');
  const [searchData, setSearchData] = useState([]);
  const [paginationData, setPaginationData] = useState({
    headerupdate: 'null',
    currentPage: 0,
    page: 0,
    pageSizes: 5,
    searchVal: '',
    searchPageData: [],
    searchData: []
  })
  const [tableError, setTableError] = useState(false);
  const [value, setValue] = React.useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [salaryconfirm, setSalaryConfirm] = useState(false);
  const [tabvalue, setTabvalue] = useState(0)
  const [submit, setSubmit] = useState(0)
  const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');

  // const [option,setOption] = useState(false)

  const [selectedAll, setSelectedAll] = useState(false);

  console.log(value,'valuevalue')


  const {
    ShiftsReducer: { list_department },
    attendanceReducer: { attendance_view, get_empbasecompany, attendance_process, attendanceViewExist, getDepartmentBasedEmployeeFilter
      , searchDepartmentBasedEmployee, getDeptBaseEmp },
    stockLocationReducer: { stocklocation },
    UserCreationReducer: { departmentList }
  } = useSelector((state) => state);


  const { setModalTypeHandler,
    setLoaderStatusHandler, setModalStatusHandler, commoncookie, headerLocationId } = useContext(context);

  const theme = useTheme();
  const currentDate = new Date();
  const currentYear = new Date().getFullYear();
  const previousYears = Array.from({ length: 4 }, (v, i) => currentYear - i);

  const generatePastMonthArray = () => {
    const currentMonth = moment().month();
    const months = [];
    for (let i = 0; i <= currentMonth; i++) {
      const monthName = moment().month(i).format('MMM');
      const monthNumber = moment().month(i).format('MM');
      months.push({ month: monthName, num: monthNumber });
    }
    return months;
  };



  const pastMonths = generatePastMonthArray();

  const currentMonth = `${currentDate.getMonth() + 1}`;
  const currentMonthAlfa = currentDate.toLocaleString('en-US', { month: 'long' })
  const [progress, setProgress] = useState(10);
  const [buffer, setBuffer] = useState(10);
  const [processField, setprocessField] = React.useState({
    empName: null,
    department: null,
    month: currentMonth,
    year: currentYear,
  });
  const [backGroundJobsStatus, setBackGroundJobsStatus] = useState(null);

  const [formErrors, setFormErrors] = useState({
    month: null,
    year: null,
    department: null,
    empName: null,
  });


  const [isApiFinished, setIsApiFinished] = useState(false);
  const [page, setPage] = useState(0)
  const [pageSize,setPageSize] = useState(50)

  const handleChange = (e) => {
    const { name, value } = e.target;
    setprocessField((prevValues) => ({
      ...prevValues,
      [name]: value
    }));
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [name]: value ? null : 'Field is required'
    }));
  };

  const handlePageChange = async (newPage, newPageSize) => {
  const body = {
    pageCount: newPage,
    numPerPage: newPageSize,
  };

  await dispatch(attendanceProcessBackgroundJobAction(body, (resData) => {
    if ('data' in resData) {
      setPage(newPage); 
    }
  }));
};

  useEffect(() => {
    const rootSocket = socketManager.getSocket("/");
    if (!rootSocket) {
      return;
    }

    const handleAttendanceProgress = (data = {}) => {
      if (data?.module && data.module !== 'attendance') {
        return;
      }

      const wsProgress = Number(data?.progress);
      if (!Number.isNaN(wsProgress)) {
        setProgress(wsProgress);
      }

      const status = data?.status || data?.job_status;
      if (status) {
        setBackGroundJobsStatus(status);
      }

      if (status === 'FAILED') {
        setOpen(false);
        dispatch(OpenalertActions({ msg: data?.message || 'Attendance process failed', severity: 'error' }));
        return;
      }

      if (status === 'DONE' || wsProgress >= 100) {
        setOpen(false);
        setBackGroundJobsStatus('DONE');
        if (tableRef.current) {
          tableRef.current.onQueryChange();
        }
      }
    };

    rootSocket.on("AttendanceProcessProgress", handleAttendanceProgress);
    rootSocket.on("UploadProgress", handleAttendanceProgress);

    return () => {
      rootSocket.off("AttendanceProcessProgress", handleAttendanceProgress);
      rootSocket.off("UploadProgress", handleAttendanceProgress);
    };
  }, [dispatch]);

console.log('backGroundJobsStatus', backGroundJobsStatus)

  console.log('salaryconfirm', typeof (salaryconfirm), salaryconfirm),
    useEffect(() => {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        commoncookie, headerLocationId,
        // backGroundJobPolling(),
        dispatch(getEmpbasecompanyAction()),
        dispatch(departmentListAction((res)=>{
        
        })),
        dispatch(listStockLocationAction(commoncookie, headerLocationId)),



      ).finally(() => setIsApiFinished(true));
    }, []);


  // useEffect(() => {

  //   if(attendanceViewExist.length){
  //     // setDialogOpen(true)
  //     setSalaryConfirm(attendanceViewExist)
  //   }
  // }, [attendanceViewExist])

  // useEffect(()=>{

  // }, [selectedDepartment])


  const [checked, setChecked] = useState(false);
  const [selectedNames, setSelectedNames] = useState(['']);
  const [selectedDepartment, setSelectedDepartment] = useState(['']);
  const [open, setOpen] = useState(false);
  const [Matopen, setMatopen] = useState(false)
  const [flag, setFlag] = useState(false)

  const [filteredValue, setFilteredValue] = useState({
    searchString: '',
    numPerPage: 20,
    pageCount: 0,
    employee_id: selectedNames[0] === '' ? 'null' : selectedNames,
    location_id: selectedDepartment[0] === '' ? 'null' : selectedDepartment,
    month: processField.month,
    year: processField.year,
  });
  const handleCheckChange = (e) => {
    setChecked(e.target.checked);
  };


  const handleClose = () => {
    setOpen(false);
    setBackGroundJobsStatus('Done')

  };

  useEffect(() => {

    const data = {
      searchString: ''
    }

    // console.log("1111")
    setValue([])
    dispatch(

      listDepartment(data, (response) => {
        console.log("response.length", response.length)
        if (response.length) {
          let allDept = response.map((d) => d.department);
          let data = {
            department: selectedDepartment.includes('') || selectedDepartment.length === 0 ? allDept : selectedDepartment,

            searchString: '',type:'attendance'
          };
          dispatch(getDeptBaseEmpFilterAction(data));
        }
      }),
    );


  }, [selectedDepartment]);


  const requestSearchEmployeeFilter = (val) => {

   
    let allDept = list_department.map((d) => d.department);

    setSearchValEmployeeFilter(val);
    dispatch(set_search_department_based_employee([]));

    if (!val) {
      return
    }



    // dispatch(
    //   listDepartment((response) => {
    //     if (response.length) {
    // let allDept = response.map((d) => d.department);
    let data = {
      department: selectedDepartment.includes('') || selectedDepartment.length === 0 ? allDept : selectedDepartment,

      searchString: val ,type:'attendance'
    };
    dispatch(
      get_search_department_based_employee(
        data,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    );
    // }
    // }),
    // );

  };




  // useEffect (() => {
  //   if(selectedDepartment?.length > 0) {
  //     let data = {
  //       department: selectedDepartment[0] === '' ? [] : selectedDepartment,
  //     }
  //     dispatch(getLocBaseEmpAction(data,(res)=> {
  //        if(res.data?.employees){
  //         dispatch({
  //           type: GET_EMP_BASECOMPANY,
  //           payload: res.data?.employees,
  //         });
  //         setSelectedNames(res?.data?.employees?.map(v=> v?.employee_id))
  //       }
  //     }))
  //   }
  //   },[selectedDepartment])

  // useEffect(() => {
  //    if (selectedDepartment[0] !== '') {
  //     var locaemp = get_empbasecompany.filter((f) => {
  //       let isLocation = f.location_id.filter((f1) =>
  //         selectedDepartment.includes(f1)).length > 0
  //         if(!f.dateOfJoining) return isLocation
  //       const d =  new Date(f.dateOfJoining)
  //       const m = d.getMonth() + 1 <= parseInt(processField.month)
  //       const y = d.getFullYear() <= processField.year
  //       return isLocation && m && y
  //     });
  //     let val = locaemp.map((d) => d.employee_id)
  //     if (val.length > 0) {
  //       setSelectedNames(val);
  //     }
  //   }

  // }, [selectedDepartment, processField.month, processField.year])

  const handleChangeEmployeeName = (val) => {
    setValue(val)
    if (val?.length > 0) {
      setFormErrors({ ...formErrors, empName: null })
    }

  }
  const handleOpen = (e) => {

    if (selectedAll || value) {
      let allDept = list_department.map((d) => d.department);

      let data = {
        department: selectedDepartment.includes('') || selectedDepartment.length === 0 ? allDept : selectedDepartment,
        type:'attendance'
      };

      dispatch(getDeptBaseEmpAction(data, (res) => {

        processFunction(res)
      }));
    }
    else {
      setFormErrors({ ...formErrors, empName: 'Please select employee' })
      processFunction(value)
    }



  };



  const handlesetdata = (data) => {
    console.log(value.length,'saasdas')
    // Check if all required fields are filled
    if ( processField.month === null || !processField.year || selectedDepartment.length === 0 || value.length === 0) {
      console.log('errrrorrrrrrrr',value.length)
      setFormErrors({
        month: processField.month === null ? 'Field is required' : null,
        year: !processField.year ? 'Field is required' : null,
        empName: value.length === 0 ? 'Employee is required' : null,
        department: selectedDepartment.length === 0 ? 'Field is required' : null
      });
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
      setFlag(false)
      return;
    }

    // Check if month and year are valid dates
    if (!moment(processField.month).isValid() || !moment(processField.year).isValid()) {
      setFormErrors({
        month: !moment(processField.month).isValid() ? 'Select Month' : null,
        year: !moment(processField.year).isValid() ? 'Select Year' : null,
        empName: null,
        department: null
      });
      setFlag(false)
      return;
    }
    setTabvalue(0);
    setSubmit(1)
    //  if (processField.month.length > 0 && value.length > 0 && selectedDepartment.length > 0) {
    //   setTabvalue(0)
    //  }else{
    //   alert('Fields Enter correctly')
    //  }
  }

  const processFunction = (val) => {

    // Check if all required fields are filled
    if (val?.length === 0 || processField.month === null || !processField.year || selectedDepartment.length === 0) {
      setFormErrors({
        month: processField.month === null ? 'Field is required' : null,
        year: !processField.year ? 'Field is required' : null,
        empName: val.length === 0 ? 'Employee is required' : null,
        department: selectedDepartment.length === 0 ? 'Field is required' : null
      });
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
      setFlag(false)
      return;
    }

    // Check if month and year are valid dates
    if (!moment(processField.month).isValid() || !moment(processField.year).isValid()) {
      setFormErrors({
        month: !moment(processField.month).isValid() ? 'Select Month' : null,
        year: !moment(processField.year).isValid() ? 'Select Year' : null,
        empName: null,
        department: null
      });
      setFlag(false)
      return;
    }

    // All required fields have values and are valid, proceed with the API call
    if (processField.month.length > 0 && val.length > 0 && selectedDepartment.length > 0) {


      let data = {
        employee_id: value ? value?.map((v)=> v.employee_id) : val.filter((f) => {
          if (f.dateOfJoining !== null) {
            const d = new Date(f.dateOfJoining)
            const y1 = d.getFullYear() < processField.year
            const m = d.getMonth() + 1 <= parseInt(processField.month)
            const y = d.getFullYear() <= processField.year
            return y1 || m && y
          } else {
            return f
          }
        }).map((d) => d.employee_id),
        location_id: selectedDepartment[0] === '' ? 'null' : selectedDepartment,
        month: processField.month,
        year: processField.year,
      };

      if (!data?.employee_id?.length) {
        return alert('No Employee Exist This Month')
      } else {
        setOpen(true);
        setProgress(0);
        setMatopen(true);
        // setBackGroundJobsStatus('PROCESSING')
        setFlag(true)
        // Start the progress
        setProgress(0);
        // const timer = setInterval(() => {
        //   setProgress(progress >= 100 ? setOpen(false) : progress + 10);
        // }, 600);

        // Make the API call
        
        const apiPromise = apiCalls(dispatch(AttendanceViewAction(data, (resExist) => {
          // if (resExist === 200) {
          //   console.log('20000000000', backGroundJobsStatus )

          //   // setOpen(false)
          // }
          // else 
          if (resExist === 500) {
            setDialogOpen(true)
            setProgress(100)
            setOpen(false)
            setMatopen(false)
            setSalaryConfirm(true)
          } else {
            setBackGroundJobsStatus('PROCESSING')
          }
        })));

        // Delay the closing of the progress indicator
        // setTimeout(() => {
        //   // Wait for the API call to complete
        //   apiPromise
        //     .then(() => {
        //       // API call completed, stop the progress
        //       clearInterval(timer);
        //       setOpen(false);
        //     })
        //     .catch((error) => {
        //       // Handle error if needed
        //       clearInterval(timer);
        //       setOpen(false);
        //     });
        // }, 1000); // Adjust the delay as needed
      }
    }
  }

  useEffect(() => {
    if (backGroundJobsStatus === 'PROCESSING') {
      setProgress((pre) => (pre > 0 ? pre : 5));
      setOpen(true)
    }
    else if (backGroundJobsStatus === 'DONE') {
      setProgress(100);
      setOpen(false)
    }
    else if (backGroundJobsStatus === 'IDLE') {
      setProgress(0);
      setOpen(false)
    }
 
  }, [backGroundJobsStatus])

  useEffect(() => {
    if (tabvalue === 0 && submit === 1) {
      let data = {
        employee_id: value.filter((f) => {
          if (f.dateOfJoining !== null) {
            const d = new Date(f.dateOfJoining)
            const y1 = d.getFullYear() < processField.year
            const m = d.getMonth() + 1 <= parseInt(processField.month)
            const y = d.getFullYear() <= processField.year
            return y1 || m && y
          } else {
            return f
          }
        }).map((d) => d.employee_id),
        location_id: selectedDepartment[0] === '' ? 'null' : selectedDepartment,
        month: processField.month,
        year: processField.year,
      };
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        commoncookie, headerLocationId,
        // backGroundJobPolling(),
        dispatch(ManualCorrectionGet(data)),
      )
      setSubmit(0)
    }

  }, [tabvalue, submit])

  const requestSearch = (e) => {
    let val = e.target.value;
    console.log("shdkjshdj",val)
    const payload = {
    pageCount: page,
    numPerPage: pageSize,
    searchString:val
    };
    setSearchVal(val)

    dispatch(attendanceProcessBackgroundJobAction(payload))
  }


  const cancelSearch = () => {
    const payload = {
    pageCount: page,
    numPerPage: pageSize,
    searchString:''
    };
    setSearchVal('')
  dispatch(attendanceProcessBackgroundJobAction(payload))
  }
  

  const commonCellStyle = {
    fontFamily: "poppins",
    fontSize: "11px",
    fontWeight: "400",
    color: 'rgba(0, 0, 0, 0.7)',
  };
  const pageScrollSx = getSinglePageScrollLayoutSx(95);
  const handleTabChange = (event, newValue) => {
    console.log('newValueee', newValue)
    setTabvalue(newValue);
  };

  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | Attendance Process </title>
      </Helmet>
      <Card
        elevation={3}
        sx={{
          ...pageScrollSx,
          p: { xs: 2, sm: 2.5, md: 3 },
          borderRadius: '20px',
        }}
      >
        <Grid
          container
          display={'flex'}
          flexDirection={'row'}
          alignItems={'center'}
          rowSpacing={2}
          columnSpacing={2}
          sx={{ flex: 1, minHeight: 0, alignContent: 'flex-start' }}
        >
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Typography className='page-title'>{'Attendance Period'}</Typography>
          </Grid>
          <Grid
            display={'flex'}
            size={{
              lg: 2,
              md: 2,
              sm: 6,
              xs: 12
            }}>
            <FormControl fullWidth variant='filled'>
              <InputLabel>Month</InputLabel>
              <Select
                value={processField.month}
                name='month'
                onChange={handleChange}
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
                {(processField.year === currentYear ? pastMonths : months).map((m) => (
                  <MenuItem key={m.num} value={m.num}>
                    {m.month}
                    
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText sx={{ color: 'red' }}>
                {formErrors.month}
              </FormHelperText>
            </FormControl>
          </Grid>

          <Grid
            display={'flex'}
            justifyContent={'center'}
            size={{
              lg: 2,
              md: 2,
              sm: 6,
              xs: 12
            }}>
            <FormControl variant='filled' fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                value={processField.year || currentYear}
                name='year'
                onChange={handleChange}
                label='Year'
                required
              >
                {previousYears.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
                <MenuItem value={previousYears}>{ }</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
              <Typography>{'User Selection'}</Typography>
            </Grid> */}
          <Grid
            display={'flex'}
            size={{
              lg: 3,
              md: 3,
              sm: 6,
              xs: 12
            }}>
            <FormControl fullWidth variant='filled'>
              <InputLabel id='demo-multiple-name-label'>
                Select Department <span style={{ color: 'red' }}>*</span>
              </InputLabel>
              <Select
                sx={{ minHeight: '65px' }}
                name='department'
                required={true}
                multiple
                value={selectedDepartment}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                      overflowY: 'auto',
                    },
                  },
                }}
                onChange={(e) => {
                  const { value } = e.target;
                  setSelectedDepartment(value.includes('') ? [''] : value);
                  handleChange(e);
                }}
                error={formErrors.department !== null}
                helperText={formErrors.empName}
                //input={<OutlinedInput label="Multiple Select" />}
                renderValue={(selected) => {
                  return (
                    <Stack gap={1} direction='row' flexWrap='wrap'>
                      {selected.includes('') ? (
                        <Chip
                          key=''
                          label='All Department'
                          onDelete={() => {
                            setSelectedDepartment([]);
                            handleChange({
                              target: { name: 'department', value: [] },
                            });
                          }}
                          deleteIcon={
                            <CommonToolTip title='Cancel'>
                              <CancelIcon
                                onMouseDown={(event) =>
                                  event.stopPropagation()
                                }
                              />
                            </CommonToolTip>
                          }
                        />
                      ) : (
                        selected.map((value) => {
                          const locate = departmentList.find(
                            (emp) => emp.department === value,
                          );
                          return (
                            <Chip
                              key={value}
                              label={locate ? locate.department : ''}
                              onDelete={() => {
                                setSelectedDepartment(
                                  selectedDepartment.filter(
                                    (item) => item !== value,
                                  ),
                                );
                                handleChange({
                                  target: {
                                    name: 'department',
                                    value: selectedDepartment.filter(
                                      (item) => item !== value,
                                    ),
                                  },
                                });
                              }}
                              deleteIcon={
                                <CancelIcon
                                  onMouseDown={(event) =>
                                    event.stopPropagation()
                                  }
                                />
                              }
                            />
                          );
                        })
                      )}
                    </Stack>
                  );
                }}
              >
                <MenuItem value=''>All Department</MenuItem>
                {departmentList.map((m) => (
                  <MenuItem
                    key={m.department}
                    value={m.department}
                    disabled={selectedDepartment.includes('')}
                  >
                    {m.department}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText sx={{ color: 'red' }}>
                {formErrors.department}
              </FormHelperText>
            </FormControl>
          </Grid>

          <Grid
            display={'flex'}
            size={{
              lg: 4,
              md: 3,
              sm: 6,
              xs: 12
            }}>
            <FormControl fullWidth variant='filled'>
              <CommonUserAutoComplete
                searchVal={searchValEmployeeFilter}
                pageType={'attendance'}
                requestSearch={requestSearchEmployeeFilter}
                value={value}
                setValue={handleChangeEmployeeName}
                error={formErrors.empName}
                type={getDepartmentBasedEmployeeFilter}
                searchType={searchDepartmentBasedEmployee}
                selectedAll={selectedAll}
                setSelectedAll={setSelectedAll}
                isMandatory={true}
              />

            </FormControl>
          </Grid>
          <Grid
            display={'flex'}
            justifyContent={'flex-end'}
            size={{
              lg: 1,
              md: 2,
              sm: 4,
              xs: 4
            }}>
            {/* <Button
              variant='contained'
              onClick={handlesetdata}
              style={{ height: '56px', width: '100%', backgroundColor: 'green' }}
            >
              <Typography>Submit</Typography>
            </Button> */}
            {
              tabvalue === 0 && <Button color="success" onClick={handlesetdata} size="large" variant='contained'>Submit</Button>
            }

            {
              tabvalue === 1 && <Button
              variant='contained'
              onClick={handleOpen}
              style={{ backgroundColor: backGroundJobsStatus === 'PROCESSING' ? '#799cb5' : '#2196F3', color: 'white' }}
              disabled={backGroundJobsStatus === 'PROCESSING'}
            >
             <Typography>{backGroundJobsStatus === 'PROCESSING' ? 'Processing...' : 'Process'}</Typography>
            </Button>
            }
            

          </Grid>
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}
            sx={{ minHeight: 0, display: 'flex', flexDirection: 'column' }}
          >
          <Box
            sx={{
              ...singlePageScrollContentSx,
              bgcolor: 'background.paper',
              width: '100%',
              height: '100%',
              overflowX: 'hidden',
              px: { xs: 1.5, sm: 2, md: 2.5 },
              pt: 1,
              pb: 0.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            {/* <AppBar position="static"> */}
            <Tabs
              value={tabvalue}
              onChange={handleTabChange}
              aria-label="tabs example"
              sx={{ flexShrink: 0 }}
            >
              <Tab icon={<PersonIcon />} label="Attendance Correction" />
              <Tab icon={<PeopleAltIcon style={{ color: 'black' }} />} label="Process Attendance" />
            </Tabs>
            {/* <Tabs
                  value={tabvalue}
                  onChange={handleTabChange}
                  indicatorColor="secondary"
                  textColor="inherit"
                  variant="fullWidth"
                  aria-label="full width tabs example"
                >
                  <Tab label="Attendance Correction" {...a11yProps(0)} />
                  <Tab label="Attendance Process" {...a11yProps(1)} />
                  {/* <Tab label="Item Three" {...a11yProps(2)} /> */}
            {/* </Tabs>  */}
            {/* </AppBar> */} 
            {/* <TabPanel value={tabvalue} index={0} dir={theme.direction}> */}
            {tabvalue === 0 &&
              <EmployeeTable processField = {processField}></EmployeeTable>
            }
            {/* </TabPanel> */}
            {/* <TabPanel value={tabvalue} index={1} dir={theme.direction}> */}
            {tabvalue === 1 &&
              <>
                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <MaterialTable
                  tableRef={tableRef}
                  localization={{
  body: {
    emptyDataSourceMessage: tableError
      ? 'Something went wrong, please try after sometime'
      : 'No records found',
  },
}}
                    style={{
                      borderRadius: '15px',
                    }}
                    components={{
                      ...stickyTableComponents,
                      Toolbar: (props) => (
                        <>
                          <div
                            style={{
                              display: 'flex',
                              width: '100%',
                              alignItems: 'center',
                            }}
                          >
                            <div style={{ width: '100%' }}>
                              <MTableToolbar {...props} />
                            </div>
                            <div>
                                                <CommonSearch
                                                        searchVal={searchVal}
                                                        cancelSearch={cancelSearch}
                                                        requestSearch={requestSearch}
                                                    />
                                                </div>
                          </div>
                        </>
                      ),
                    }}
                    options={getStickyTableOptions({
                      bodyOffset: 410,
                      headerStyle,
                      options: {
                        cellStyle,
                        search: false,
                        exportButton: false,
                        filtering: false,
                        actionsColumnIndex: -1,
                        pageSize: pageSize,
                        pageSizeOptions: [50, 100, 200],
                        paging: true,
                        toolbar: true,
                        tableLayout: 'auto',
                        exportMenu: [
                        {
                          label: 'Export PDF',
                          exportFunc: (cols, datas) =>
                          // ExportPdf(cols, attendance_view, 'AttendanceProcess'),
                          {
                            const payload = {
                              numPerPage: 1000,
                              pageCount: 0
                            }
                            apiCalls(
                              setModalTypeHandler,
                              setLoaderStatusHandler,
                              dispatch(attendanceProcessBackgroundJobAction(payload,
                                (exportData) => {
                                  console.log("exportData",exportData)
                                  ExportPdf(
                                    cols,
                                    exportData.data,
                                    'AttendanceProcess',
                                  );
                                },
                              ))

                            );
                          }
                        },
                        {
                          label: 'Export CSV',
                          exportFunc: (cols, dta) =>
                            // ExportCsv(cols, attendance_view, 'AttendanceProcess'),
                          {
                            const payload = {
                              numPerPage: 1000,
                              pageCount: 0
                            }
                            apiCalls(
                              setModalTypeHandler,
                              setLoaderStatusHandler,
                              dispatch(attendanceProcessBackgroundJobAction(payload,
                                (exportData) => {
                                  console.log("exportData", exportData)
                                  ExportCsv(
                                    cols,
                                    exportData.data,
                                    'AttendanceProcess',
                                  );
                                },
                              ))

                            );
                          }
                        },
                      ],
                      },
                    })}
                    columns={[
                      // {
                      //   title: 'User ID',
                      //   field: 'user_id',
                      // },
                      {
                        title: 'Name',
                        field: 'full_name',
                        cellStyle: { textTransform: 'capitalize' },

                      },
                      // {
                      //   title: 'Location Name',
                      //   field: 'location_name',
                      // },
                      {
                        title: 'Check-In Date',
                        field: 'log_date1',
                        render: (rowData) =>
                          rowData.log_date ? commonDateFormat
                            (rowData.log_date) : '-',
                      },
                      {
                        title: 'Status',
                        field: 'status',
                        render: (rowData) =>
                          rowData.status ? rowData.status : '-',
                      },
                      // {
                      //   title: 'Check-In Time',
                      //   field: 'in_time',
                      //   render: (rowData) => (
                      //     <div>
                      //       {rowData.in_time !== null
                      //         ? formatTime12Hour(rowData.in_time)
                      //         : '-'}
                      //     </div>
                      //   ),
                      // },

                      // {
                      //   title: 'Check-Out Time',
                      //   field: 'out_time',
                      //   render: (rowData) => (
                      //     <div>
                      //       {rowData.out_time !== null
                      //         ? formatTime12Hour(rowData.out_time)
                      //         : '-'}
                      //     </div>
                      //   ),
                      // },
                      // {
                      //   title: 'Break -IN',
                      //   field: 'break_start_time',
                      //   render: (rowData) => (
                      //     <div>
                      //       {rowData.break_start_time
                      //         ? formatTime12Hour(rowData.break_start_time)
                      //         : '-'}
                      //     </div>
                      //   ),
                      // },
                      // {
                      //   title: 'Break -OUT',
                      //   field: 'break_end_time',
                      //   render: (rowData) => (
                      //     <div>
                      //       {rowData.break_end_time
                      //         ? formatTime12Hour(rowData.break_end_time)
                      //         : '-'}
                      //     </div>
                      //   ),
                      // },
                      // {
                      //   title: '1st Half',
                      //   field: '1st_half',
                      //   render: (rowData) =>
                      //     rowData['1st_half'] ? rowData['1st_half'] : '-',
                      // },
                      // {
                      //   title: '2st Half',
                      //   field: '2nd_half',
                      //   render: (rowData) =>
                      //     rowData['2nd_half'] ? rowData['2nd_half'] : '-',
                      // },
                      {
                        title: 'Late -IN',
                        field: 'late_in_by',
                        render: (rowData) =>
                          rowData.late_in_by ? rowData.late_in_by : '-',
                      },
                      {
                        title: 'Early -OUT',
                        field: 'early_out_by',
                        render: (rowData) =>
                          rowData.early_out_by ? rowData.early_out_by : '-',
                      },
                      // {
                      //   title: 'Hourly Paid Leave',
                      //   field: 'hourly_paid_leave',
                      //   render: (rowData) =>
                      //     rowData.hourly_paid_leave
                      //       ? rowData.hourly_paid_leave
                      //       : '-',
                      // },
                      // {
                      //   title: 'Hourly Unpaid Leave',
                      //   field: 'hourly_unpaid_leave',
                      //   render: (rowData) =>
                      //     rowData.hourly_unpaid_leave
                      //       ? rowData.hourly_unpaid_leave
                      //       : '-',
                      // },
                      {
                        title: 'Over Time',
                        field: 'ot',
                        render: (rowData) =>
                          rowData.ot ? rowData.ot : '-',
                      },
                      // {
                      //   title: 'Auth OT',
                      //   field: 'payName',
                      //   render: (rowData) =>
                      //     rowData.payName ? rowData.payName : '-',
                      // },
                      // {
                      //   title: 'AUth C-OFF',
                      //   field: 'payName',
                      //   render: (rowData) =>
                      //     rowData.payName ? rowData.payName : '-',
                      // },
                      {
                        title: 'Work Hrs',
                        field: 'work_hours',
                        render: (rowData) =>
                        (
                          rowData.work_hours ? rowData.work_hours.substring(0, 5) : '-'
                        ),
                      },
                      // {
                      //   title: 'Man Entry',
                      //   field: 'payName',
                      //   render: (rowData) =>
                      //     rowData.payName ? rowData.payName : '-',
                      // },
                      // {
                      //   title: 'Reason',
                      //   field: 'reason',
                      //   render: (rowData) =>
                      //     rowData.reason ? rowData.reason : '-',
                      // },
                    ]}
data={(query) =>
  new Promise((resolve) => {
    dispatch(
      attendanceProcessBackgroundJobAction(
        {
          pageCount: query.page,
          numPerPage: query.pageSize,
        },
        (res) => {
          if (res?.job_status) {
            setBackGroundJobsStatus(res.job_status);
            if (res.job_status === 'DONE') {
              setProgress(100);
              setOpen(false);
            } else if (res.job_status === 'PROCESSING') {
              setOpen(true);
              setProgress((prev) => (prev > 0 ? prev : Number(res?.progress || 5)));
            }
            else if (res.job_status === 'IDLE') {
              setProgress(0);
              setOpen(false);
            }
          }

          if (!res || !Array.isArray(res.data)) {
            setTableError(true);
            resolve({
              data: [],
              page: 0,
              totalCount: 0,
            });
            return;
          }

          setTableError(false);
          resolve({
            data: res.data,
            page: query.page,
            totalCount: res.numRows || 0,
          });
        },
        () => {
          if (!isMounted.current) return;

          setTableError(true);
          resolve({
            data: [],
            page: 0,
            totalCount: 0,
          });
        }
      )
    );
  })
}



                  //   data={(query) =>
                  //   new Promise((resolve) => {
                  //     const page = query.page; 
                  //     const pageSize = query.pageSize; 

                  //     dispatch(attendanceProcessBackgroundJobAction(
                  //       { pageCount: page, numPerPage: pageSize },
                  //       (res) => {
                  //         resolve({
                  //           data: res.data, 
                  //           page: page, 
                  //           totalCount: res.numRows
                  //         });
                  //       }
                  //     ));
                  //   })
                  // }
                  title={
                    <Typography
                      className='page-title'
                      variant='h6'
                      align='left'
                      style={{ paddingTop: '10px', paddingBottom: '10px' }}
                    >
                      Attendance Process Report
                    </Typography>
                  }
                  />
                </Grid>
                <br />
                <Grid
                  display={'flex'}
                  justifyContent={'flex-end'}
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  {/* <Button
                    variant='contained'
                    onClick={handleOpen}
                    style={{ backgroundColor: backGroundJobsStatus === 'DONE' || backGroundJobsStatus === null ? '#2196F3' : '#799cb5', color: 'white' }}
                    disabled={backGroundJobsStatus === 'PROCESSING'}
                  >
                    <Typography>{backGroundJobsStatus === 'DONE' || backGroundJobsStatus === null ? 'Process' : 'Processing...'}</Typography>
                  </Button> */}
                  <Dialog open={open} fullWidth={true} maxWidth={'sm'}>
                    <DialogTitle id='alert-dialog-title'>
                      {'Processing User'}
                    </DialogTitle>
                    <DialogContent>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <BorderLinearProgress
                            variant='determinate'
                            value={progress}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography
                            variant='body2'
                            color='text.secondary'
                          >{`${Math.round(progress)}%`}</Typography>
                        </Box>
                      </Box>
                    </DialogContent>
                    <DialogActions>
                      <Button
                        onClick={() => {
                          handleClose();
                        }}
                      >
                        {'Cancel'}
                      </Button>
                    </DialogActions>
                  </Dialog>
                </Grid>
              </>
            }
            {/* </TabPanel> */}
          </Box>
          </Grid>

          {dialogOpen && <AttendanceProcessDialog dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} />}
        </Grid>
      </Card>
    </>
  );
}

const months = [
  { month: 'Jan', num: '1' },
  { month: 'Feb', num: '2' },
  { month: 'Mar', num: '3' },
  { month: 'Apr', num: '4' },
  { month: 'May', num: '5' },
  { month: 'Jun', num: '6' },
  { month: 'Jul', num: '7' },
  { month: 'Aug', num: '8' },
  { month: 'Sep', num: '9' },
  { month: 'Oct', num: '10' },
  { month: 'Nov', num: '11' },
  { month: 'Dec', num: '12' },
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

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

