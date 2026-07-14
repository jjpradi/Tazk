// import React, { useEffect, useState, useContext, useCallback } from 'react';
// import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
// import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
// import { useDispatch, useSelector } from 'react-redux';
// import {Helmet} from "react-helmet-async";
// import {
//   Grid,
//   Typography,
//   Box,
//   Paper,
//   InputLabel,
//   MenuItem,
//   FormControl,
//   Select,
//   FormLabel,
//   FormControlLabel,
//   RadioGroup,
//   Radio,
//   Button,
//   TextField,
//   InputAdornment,
//   LinearProgress,
//   Stack,
//   Card,
//   Chip,
//   OutlinedInput,
//   FormHelperText,
//   Dialog,
//   DialogContent,
//   DialogTitle,
//   Tooltip,
//   Fade,
//   IconButton,
// } from '@mui/material';
// import { ListSalaryAction, getSearchSalaryAction, setSearchSalaryState } from 'redux/actions/salary_actions';
// import { AttendanceProcessAction, AttendanceViewAction, getEmpbasecompanyAction, getLocBaseEmpAction, getLocBaseEmpFilterAction, get_search_location_based_employee, set_search_location_based_employee ,setSearchAttendanceListAction,SearchAttendanceAction } from 'redux/actions/attendance_actions';
// import apiCalls from 'utils/apiCalls';
// import { maxBodyHeight, maxHeight, pageSize, headerStyle, cellStyle, font14_500, formatTime12Hour } from 'utils/pageSize';
// import { DatePicker, LocalizationProvider } from '@mui/lab';
// import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
// import moment from 'moment';
// import { ExportCsv } from '@material-table/exporters';
// import CancelIcon from '@mui/icons-material/Cancel';
// import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
// import { commonDateFormat } from 'utils/getTimeFormat';
// import CommonToolTip from '../../../components/ToolTip';
// import { titleURL } from 'http-common';
// import CommonUserAutoComplete from 'utils/commonAutoCompleteForUser';
// import { GET_EMP_BASECOMPANY, LOCATION_BASE_DEP_FILTER } from 'redux/actionTypes';
// import CommonSearch from 'utils/commonSearch';
// import { CloseOutlined, FilterAlt } from '@mui/icons-material';
// import { departmentListAction } from 'redux/actions/userCreation_actions';
// import {DataGrid} from '@mui/x-data-grid';
// import FileDownloadIcon from '@mui/icons-material/FileDownload';
// import * as XLSX from 'xlsx-js-style';
// import CloseIcon from '@mui/icons-material/Close';

// const LateInEarlyOut = () => {
//   const dispatch = useDispatch();
//   const {
//     SalaryReducers: { salarylist, searchSalaryData }, attendanceReducer: { attendance_process, get_empbasecompany, attendanceProcessCount,getLocationBasedEmployee, searchLocationBasedEmployee},
//     stockLocationReducer: { stocklocation }, UserCreationReducer: {departmentList}
//   } = useSelector((state) => state);
// console.log(attendance_process,'process');
//   const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(
//     CreateNewButtonContext,
//   );
//   const [regex] = useState({});
//   const [selectedReport, setSelectedReport] = useState('attendanceReport');
//   const currentMonth = moment().startOf('month');
//   const firstDateOfMonth = currentMonth.format('YYYY-MM-DD');
//   const lastDateOfMonth = currentMonth.endOf('month').format('YYYY-MM-DD');
//   const currentDate = new Date();
//   const firstDayOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
//   const lastDayOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
//   const [monthYear, setMonthYear] = React.useState({
//     empName: [''],
//     location: [''],
//     from: moment(firstDayOfPreviousMonth),
//     to: moment(lastDayOfPreviousMonth),
//     department: ['']
//   });
//   console.log(monthYear,'fromtooo');
//   const [value, setValue] = React.useState([]);
//   const [formErrors, setFormErrors] = useState({
//     empName: null,
//     location: null,
//     from: null,
//     to: null,
//     department: null
//   });
//   const [Data1,setData1]=useState([])
//   const [tableData, setTableData] = useState([]);
//   const [button, setButton] = useState('4');
//   const [requiredFields] = useState([
    
//     'location',
//     'from',
//     'to'
//   ]);
//   const [page, setPage] = useState(0)
//   const [pageSize, setPageSize] = useState(20)
//   const [searchVal,setSearchVal] = useState('')
//   const [selectedDepartment, setSelectedDepartment] = useState(['']);
//   const [flag, setFlage] = useState(false)
//   const [open,setOpen] = useState(false)
//   console.log(page,'page')
//   // useEffect(()=>{
//   //   setTableData(attendance_process)
//   // },[attendance_process])

//   // const updatedAttendanceProcess = attendance_process.map((item, index) => ({
//   //   ...item,
//   //   uniqueId: index,
//   // }));

  
//   const updatedAttendanceProcess = attendance_process.map((item, index) => ({
//     ...item,
//     id:  `generated-id-${index}`,  // Generate a unique id if id is null or undefined
//     uniqueId: index,
//   }));
//   console.log(attendance_process,'attendance_process')
//   console.log(updatedAttendanceProcess,'updatedAttendanceProcess')

//   const dataWithId = attendance_process.map((row) => ({
//     ...row,
//     id: row.employee_id, // Use employee_id as the unique id
// }));

//   useEffect(() => {
//     let data = {
//       empName: null,
//       location: null,
//       from: null,
//       to: null,
//       pageCount: page,
//       numPerPage: pageSize,
      
//     }

//     dispatch(getEmpbasecompanyAction())
//     dispatch(departmentListAction())
//     apiCalls(
//       setModalTypeHandler,
//       setLoaderStatusHandler,
//       commoncookie, headerLocationId,
//       dispatch(listStockLocationAction(commoncookie, headerLocationId)),
//       // dispatch(AttendanceProcessAction(data))
//     ).finally(() => setIsApiFinished(true));
//     // setValue(get_empbasecompany)
//   }, []);

//   useEffect(() => {
//     // if(value){
//       // setTimeout(() => {
//       let data = {
//         employee_id: value.length === 0 ? get_empbasecompany.map((d) => d.employee_id) : value.map((d) => d.employee_id),
//         location_id: monthYear.location[0] === '' ? 'null' : monthYear.location,
//         department: monthYear.department[0] === '' ? [] : monthYear.department,
//         from: moment(monthYear.from).format('yyyy-MM-DD'),
//         to: moment(monthYear.to).format('yyyy-MM-DD'),
//         pageCount: page,
//         numPerPage: pageSize,
//         searchString: searchVal,
//         type:'LateInEarlyOut'
//       };      
//     console.log('usecheckeffect', data);
//     setData1(data)
//       apiCalls(
//         setModalTypeHandler,
//         setLoaderStatusHandler,
//         commoncookie, headerLocationId,
//         dispatch(AttendanceProcessAction(data))
//       ).finally(() => setIsApiFinished(true));
//     // }
//   // }, 2000);
//   },[pageSize])
  



//   const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');

//   // const [option,setOption] = useState(false)

//   const [selectedAll, setSelectedAll] = useState(false);


//   useEffect (() => {
//     setValue([])
//     if(monthYear?.location?.length > 0) {

        
//   let data = {
//     ...monthYear,
//     location: monthYear.location[0] === '' ? [] : monthYear.location,
//     department: monthYear.department[0] === '' ? [] : monthYear.department,
//     empName: monthYear.empName[0] === '' ? [] : monthYear.empName,
//     searchString:''
//    }
//       dispatch(getLocBaseEmpFilterAction(data,(res)=> {
//          if(res.data?.employees){
//           console.log(res?.data,'correction');
//           dispatch({
//             type: LOCATION_BASE_DEP_FILTER,
//             payload: res.data?.employees,
//           });
//         }
//       }))
//     }
//     },[monthYear?.location])

    
//   const requestSearchEmployeeFilter = (val) => {

//     // let allDept = list_department.map((d) => d.department);

//     setSearchValEmployeeFilter(val);
//     dispatch(set_search_location_based_employee([]));

//     if (!val) {
//       return
//     }

//     let data = {
//       ...monthYear,
//       searchString: val
//     }



//     dispatch(
//       get_search_location_based_employee(
//         data,
//         setModalTypeHandler,
//         setLoaderStatusHandler,
//       ),
//     );
//     // }
//     // }),
//     // );

//   };
 
//   const [reportTypes, setReportTypes] = useState({
//     attendanceReport: 'Attendance View Report',
//   });

//   const [isApiFinished, setIsApiFinished] = useState(false);


//   const handleChangeEmployeeName =(val)=>{
//     setValue(val)
//     if(val?.length > 0){
//      setFormErrors({...formErrors,empName:null})
//     }

// }

//   const handleChange = async (e) => {
//     let { name, value } = e.target;
//     setStateHandler(name, value);
//   };

//   const setStateHandler = async (name, value) => {
//     let formObj = {};

//     formObj = {
//       ...monthYear,
//       [name]: value === '' ? null : value,
//     };

//     await setMonthYear(formObj);
//     validationHandler(name, value);
//   };

//   const validationHandler = (name, value) => {
//     if (!Object.keys(formErrors).includes(name)) return;

//     if (
//       requiredFields.includes(name) &&
//       (value === null ||
//         value === 'null' ||
//         value === '' ||
//         value === false ||
//         (Object.keys(value) && value.value === null))
//     ) {
//       setFormErrors({
//         ...formErrors,
//         [name]: capitalize(name) + ' is Required!',
//       });
//     } else if (regex[name]) {
//       if (!regex[name].test(value)) {
//         setFormErrors({
//           ...formErrors,
//           [name]: capitalize(name) + ' is Invalid!',
//         });
//       } else {
//         setFormErrors({
//           ...formErrors,
//           [name]: null,
//         });
//       }
//     } else {
//       // Clear the error for the 'from' field when a value is selected
//       if (name === 'from') {
//         setFormErrors({
//           ...formErrors,
//           [name]: null,
//         });
//       } else {
//         setFormErrors({
//           ...formErrors,
//           [name]: null,
//         });
//       }
//     }
//   };

//   const handlePageChange = async (page) => {
//     let data = {
//       employee_id: value.length === 0 ? get_empbasecompany.map((d) => d.employee_id) : value.map((d) => d.employee_id),
//       location_id: monthYear.location[0] === '' ? 'null' : monthYear.location,
//       department: monthYear.department[0] === '' ? [] : monthYear.department,
//       from: moment(monthYear.from).format('yyyy-MM-DD'),
//       to: moment(monthYear.to).format('yyyy-MM-DD'),
//       pageCount: page,
//       numPerPage: pageSize,
//       searchString: searchVal,
//       type:'LateInEarlyOut'

//     };      
//   console.log('usecheckeffect', data);
//     apiCalls(
//       setModalTypeHandler,
//       setLoaderStatusHandler,
//       commoncookie, headerLocationId,
//       dispatch(AttendanceProcessAction(data))
//     ).then(() => {setPage(page)}).finally(() =>{ 
      
//       setIsApiFinished(true)});
//   }
  
//   const handlePageSizeChange = async (size) => {
//     setPageSize(size)
//   }

//   const capitalize = (s) => {
//     if (typeof s !== 'string') return '';
//     return s.charAt(0).toUpperCase() + s.slice(1);
//   };

//   const commonCellStyle = {
//     fontFamily: "poppins",
//     fontSize: "11px",
//     fontWeight: "400",
//     color: 'rgba(0, 0, 0, 0.7)',
//   };

//   const columns = [
//     {
//       field: 'creationDate1',
//       headerName: 'Date',
//       width: 100,
//       renderCell: (params) => {
//         const creationDate = params.row.creationDate1;
//         const shiftDate = params.row.shift_date
//         return (
//         <div style={commonCellStyle}>
//           {creationDate ?  commonDateFormat(creationDate) : shiftDate}
//         </div>
//       );
//       },
//     },
//     {
//       field: 'shift_name',
//       headerName: 'Shift',
//       width: 100,
//       renderCell: (params) => (
//         <div style={commonCellStyle}>
//           {params.row.shift_name ? params.row.shift_name : '-'}
//         </div>
//       ),
//       cellClassName: 'capitalize-text',
//     },
//     {
//       field: 'full_name',
//       headerName: 'Employee Name',
//       width: 100,
//       cellClassName: 'capitalize-text',
//       renderCell: (params) => (
//         <div style={commonCellStyle}>
//           {params.row.full_name}
//         </div>
//       ),
//     },
//     {
//       field: 'type',
//       headerName: 'Check In type',
//       width: 100,
//       renderCell: (params) => (
//         <div style={commonCellStyle}>
//           {params.row.type === 'no_restriction' ? 'No restriction' : params.row.type}
//         </div>
//       ),
//       cellClassName: 'capitalize-text',
//     },
//     {
//       field: 'end_type',
//       headerName: 'Check out type',
//       width: 100,
//       renderCell: (params) => (
//         <div style={commonCellStyle}>
//           {params.row.end_type === 'no_restriction' ? 'No restriction' : params.row.end_type}
//         </div>
//       ),
//       cellClassName: 'capitalize-text',
//     },
//     {
//       field: 'actual_start_time',
//       headerName: 'Actual Check In',
//       width: 100,
//       renderCell: (params) => (
//         <div style={commonCellStyle}>
//           {params.row.actual_start_time ? formatTime12Hour(params.row.actual_start_time) : '-'}
//         </div>
//       ),
//     },
//     {
//       field: 'actual_end_time',
//       headerName: 'Actual Check Out',
//       width: 100,
//       renderCell: (params) => (
//         <div style={commonCellStyle}>
//           {params.row.actual_end_time ? formatTime12Hour(params.row.actual_end_time) : '-'}
//         </div>
//       )
//     },
//     {
//       field: 'first_in_time',
//       headerName: 'Check In',
//       width: 100,
//       renderCell: (params) => (
//         <div style={commonCellStyle}>
//           {params.row.first_in_time ? formatTime12Hour(params.row.first_in_time) : '-'}
//         </div>
//       ),
//     },
//     {
//       field: 'last_out_time',
//       headerName: 'Check Out',
//       width: 100,
//       renderCell: (params) => (
//         <div style={commonCellStyle}>
//           {params.row.last_out_time ? formatTime12Hour(params.row.last_out_time) : '-'}
//         </div>
//       ),
//     },
//     {
//       field: 'start_shift_time',
//       headerName: 'Shift Start Time',
//       width: 100,
//       renderCell: (params) => (
//         <div style={commonCellStyle}>
//           {params.row.start_shift_time ? formatTime12Hour(params.row.start_shift_time) : '-'}
//         </div>
//       ),
//     },
//     {
//       field: 'end_shift_time',
//       headerName: 'Shift End Time',
//       width: 100,
//       renderCell: (params) => (
//         <div style={commonCellStyle}>
//           {params.row.end_shift_time ? formatTime12Hour(params.row.end_shift_time) : '-'}
//         </div>
//       ),
//     },
//     {
//       field: 'work_hours',
//       headerName: 'Work Hour',
//       width: 100,
//       renderCell: (params) => (
//         <div style={commonCellStyle}>
//           {params.row.work_hours ? params.row.work_hours : '-'}
//         </div>
//       ),
//     },
//     {
//       field: 'break_hours',
//       headerName: 'Break Hour',
//       width: 100,
//       renderCell: (params) => (
//         <div style={commonCellStyle}>
//           {params.row.break_hours ? params.row.break_hours : '-'}
//         </div>
//       ),
//     },
//   ];
  
 
  

//     const handleSubmit = async (event) => {
//       event.preventDefault();
//       if (selectedAll) {
  
//         dispatch(getLocBaseEmpAction(monthYear, (res) => {
//           if (res.data?.employees) {
//             processFunction(res.data?.employees)
//           }
//         }))
//       }
  
//       else {
  
//         processFunction(value)
//       }
//       setButton()
//     };


//   const processFunction = async (value) =>{
//     if (value?.length === 0  ) {
//       setFormErrors({
//         ...formErrors,
//           empName: value.length === 0  ? 'Employee is required' : null,
        
//       });
//       return;
//   }

//     setFlage(true)

//     setTableData([])
//     let isValid = true;
//     let formErrorsObj = { ...formErrors };
   
//     await Promise.all(
//       Object.keys(monthYear).map(async (key) => {
//         if (
//           requiredFields.includes(key) &&
//           (monthYear[key] === null || monthYear[key] === '' || monthYear[key].length === 0)
//         ) {
//           isValid = false;
//           formErrorsObj[key] = capitalize(key) + ' is Required!';
//         } else if (key === 'location' && monthYear[key].length === 0) {
//           isValid = false;
//           formErrorsObj[key] = 'Please select a location!';
//         } else if (regex[key]) {
//           if (!regex[key].test(monthYear[key])) {
//             isValid = false;
//             formErrorsObj[key] = capitalize(key) + ' is Invalid!';
//           }
//         }
//       })
//     );

//     await setFormErrors(formErrorsObj);

//     if (isValid) {
//       let data = {
//         employee_id:value.map((d)=> d.employee_id),
//         location_id: monthYear.location[0] === '' ? 'null' : monthYear.location,
//         from: moment(monthYear.from).format('yyyy-MM-DD'),
//         to: moment(monthYear.to).format('yyyy-MM-DD'),
//         department: monthYear.department === '' ? 'null' : monthYear.department,
//         pageCount: page,
//         numPerPage: pageSize,
//         searchString: '',
//         type:'LateInEarlyOut'

//       };

//       apiCalls(
//         setModalTypeHandler,
//         setLoaderStatusHandler,
//         dispatch(AttendanceProcessAction(data))
//       );
//     setOpen(false)
//     }
//   }

//   const requestSearch = (e) => {
//     let val = e.target.value;
//     // let val = e;
//     setSearchVal(val)

//     console.log("value",val);

//     dispatch(setSearchAttendanceListAction({data:[], numRows:0}));
//     let payLoad = {
//       department: monthYear.department === '' ? [] : monthYear.department,
//       employee_id: monthYear.empName[0] === '' ? [] : monthYear.empName,
//       location_id: monthYear.location[0] === '' ? 'null' : monthYear.location,
//       from: moment(monthYear.from).format('yyyy-MM-DD'),
//       to: moment(monthYear.to).format('yyyy-MM-DD'),
//       pageCount: 0,
//       numPerPage: pageSize,
//       searchString: val,
//       type:'LateInEarlyOut'

//     }
//     dispatch(SearchAttendanceAction(
//       payLoad,
//       setModalTypeHandler,
//       setLoaderStatusHandler
//     )
//     )
//   };

//   console.log(button,'butttttooonnnn')
//   const cancelSearch = () =>{
    
    
//     setSearchVal('')

//     dispatch(setSearchAttendanceListAction({data:[], numRows:0}));
//     let payLoad = {
//       department: monthYear.department === '' ? [] : monthYear.department,
//       employee_id: monthYear.empName[0] === '' ? [] : monthYear.empName,
//       location_id: monthYear.location[0] === '' ? 'null' : monthYear.location,
//       from: moment(monthYear.from).format('yyyy-MM-DD'),
//       to: moment(monthYear.to).format('yyyy-MM-DD'),
//       pageCount: 0,
//       numPerPage: pageSize,
//       searchString: '',
//     type:'LateInEarlyOut'

//     }
//     dispatch(SearchAttendanceAction(
//       payLoad,
//       setModalTypeHandler,
//       setLoaderStatusHandler
//     )
//     )
//   };

// const handleClose = () =>{
//   setOpen(false)
// }
// console.log(monthYear,'monthyear');

// const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// const currentYear = currentDate.getFullYear();
// const currentMonthIndex = currentDate.getMonth();
// const previousMonths = [];
// for (let i = 0; i <= 4; i++) {
//   const prevMonthIndex = (currentMonthIndex - i + 12) % 12;
//   let prevMonthYear = currentYear;
//   if (prevMonthIndex > currentMonthIndex) {
//     prevMonthYear--;
//   }
//   const prevMonthString = `${months[prevMonthIndex]} ${prevMonthYear}`;
//   previousMonths.push(prevMonthString);
// }
// const CurMonth = previousMonths[4];
// const PrevMonth = previousMonths[0];
// const firstPrevMonth = previousMonths[1];
// const secondPrevMonth = previousMonths[2];
// const thirdPrevMonth = previousMonths[3];

// const getStartAndEndDate = (monthName, year) => {
//   const monthMap = {
//       jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
//       jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
//   };
//   const monthNumber = monthMap[monthName.toLowerCase()];
//   const startDate = new Date(year, monthNumber, 1);
//   const endDate = new Date(year, monthNumber + 1, 0);
//   return { startDate, endDate };
// }

// const handlePreviousMonthClick = (data,btn) => {
//   const month = data.split(' ')[0];
//   const year = data.split(' ')[1];
//   const  {startDate,endDate}=getStartAndEndDate(month,year)
//   console.log(startDate,'startdateee');
//   const startDateObj = new Date(startDate);
//   const endDateObj = new Date(endDate);
//   let payload = {
//     employee_id: get_empbasecompany.length === 0 ? 'null' : get_empbasecompany.map((d) => d.employee_id),
//     location_id: monthYear.location[0] === '' ? 'null' : monthYear.location,
//     department: monthYear.department[0] === '' ? [] : monthYear.department,
//     from: moment(startDate).format('yyyy-MM-DD'),
//     to: btn == '4' ? moment(currentDate).format('yyyy-MM-DD') : moment(endDate).format('yyyy-MM-DD'),
//     pageCount: 0,
//     numPerPage: 20,
//     searchString: '',
//     type:'LateInEarlyOut'

//   };
//   setMonthYear({...monthYear,from: startDate, to: endDate})
//   console.log( monthYear.department[0] === '' ? 'null' : monthYear.department,'departmentt');
//   dispatch(AttendanceProcessAction(payload))
//   // setButton(startDateObj.getMonth())
//   // startDateObj.setDate(startDateObj.getDate() + 1);
//   // const formattedStartDate = startDateObj.toISOString().split('T')[0];
//   // const formattedEndDate = endDateObj.toISOString().split('T')[0];
//   // console.log(formattedStartDate,formattedEndDate,'sedddd');

// };

// const exportToExcel = useCallback((columns, data) => {
//   const columnNames = {
//     creationDate1: 'Date',
//     shift_name: 'Shift',
//     full_name: 'Employee Name',
//     type: 'Check In type',
//     end_type: 'Check out type',
//     actual_start_time: 'Actual Check In',
//     actual_end_time: 'Actual Check Out',
//     first_in_time: 'Check In',
//     last_out_time: 'Check Out',
//     start_shift_time: 'Start Shift Time',
//     end_shift_time: 'End Shift Time',
//     work_hours: 'Work Hours',
//     break_hours: 'Break Hours'
// };
// const selectedColumns = [
//   'creationDate1',
//   'shift_name',
//   'full_name',
//   'type',
//   'end_type',
//   'actual_start_time',
//   'actual_end_time',
//   'first_in_time',
//   'last_out_time',
//   'start_shift_time',
//   'end_shift_time',
//   'work_hours',
//   'break_hours'
// ];
//   const headers = selectedColumns.map(col => columnNames[col] || col);
//   const sheetData = [headers, ...data.map(row => selectedColumns.map(col => row[col] || ''))];

//   const wb = XLSX.utils.book_new();
//   const ws = XLSX.utils.aoa_to_sheet(sheetData);

//   XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

//   const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
//   const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
//   saveAs(blob, 'Attendance Log.xlsx');
// }, []);

// const handleFilterClear = () =>{

//   setMonthYear({...monthYear,empName: [''],
//     location: [''],
//     from: moment(firstDayOfPreviousMonth),
//     to: moment(lastDayOfPreviousMonth),
//     department: ['']})
//     setValue([])
//     setSearchVal('')

//   let data = {
//     employee_id: [],
//     location_id:'null' ,
//     from: moment(firstDayOfPreviousMonth).format('yyyy-MM-DD'),
//     to: moment(lastDayOfPreviousMonth).format('yyyy-MM-DD'),
//     department: [],
//     pageCount: 0,
//     numPerPage: pageSize,
//     searchString: searchVal,
//     type:'LateInEarlyOut'

//   };      

//   apiCalls(
//     setModalTypeHandler,
//     setLoaderStatusHandler,
//     commoncookie, headerLocationId,
//     dispatch(AttendanceProcessAction(data))
//   ).finally(() => setIsApiFinished(true));
// }

//   return (
//     <>
//      <Helmet>
//                 <meta charSet="utf-8" />
//                 <title> {titleURL} | Attendance Log </title>
//       </Helmet>
//       <Card sx={{p: '20px', width: '100%', height: '100%'}}>
//       {/* <Card elevation={3} style={{padding: '20px'}}> */}
//         <Grid
//           container
//           display={'flex'}
//           flexDirection={'row'}
//           alignItems={'center'}
//           spacing={5}
//            pb='15px'
//         >

//           {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} style={{display: 'flex', flexDirection: 'row'}}> */}
//           <Grid size={{ xs: 12, sm: 3, md: 3, lg: 3 }}>
//             <Typography className='page-title'>
//               {'LateIn EarlyOut View Report'}
//             </Typography>
//           </Grid>
//           {/* <Grid size={{ xs: 12, sm: 9, md: 9, lg: 9 }} gap={1} style={{display: 'flex', justifyContent: 'end'}}> */}
//             {/* <Grid size={{ xs: 12, sm: 5, md: 5, lg: 5 }} gap={1} style={{display: 'flex', justifyContent: 'end'}}> */}
//             <Grid size={{ xs: 12, sm: 9, md: 9, lg: 9 }} gap={1} display='flex' flexDirection='row' justifyContent='flex-end'>
//             <Grid>
//               <Button
//                 variant={button === '1' ? "contained" : "outlined"}
//                 color='primary'
//                 sx={{
//                   height: '30px',
//                   padding: '4px 8px',
//                   borderRadius: 8,
//                   marginRight: '8px',
//                   '& .MuiSvgIcon-root': {
//                     fontSize: 26,
//                   },
//                 }}
//                 onClick={() => {
//                   setButton('1');
//                   handlePreviousMonthClick(thirdPrevMonth,'1');
//                 }}
//               >
//                 {thirdPrevMonth}
//               </Button>
//               <Button
//                 variant={button === '2' ? "contained" : "outlined"}
//                 color='primary'
//                 sx={{
//                   height: '30px',
//                   padding: '4px 8px',
//                   borderRadius: 8,
//                   marginRight: '8px',
//                   '& .MuiSvgIcon-root': {
//                     fontSize: 26,
//                   },
//                 }}
//                 onClick={() => {
//                   setButton('2');
//                   handlePreviousMonthClick(secondPrevMonth,'2');
//                 }}
//               >
//                 {secondPrevMonth}
//               </Button>
//               <Button
//                 variant={button === '3' ? "contained" : "outlined"}
//                 color='primary'
//                 sx={{
//                   height: '30px',
//                   padding: '4px 8px',
//                   borderRadius: 8,
//                   marginRight: '8px',
//                   '& .MuiSvgIcon-root': {
//                     fontSize: 26,
//                   },
//                 }}
//                 onClick={() => {
//                   setButton('3');
//                   handlePreviousMonthClick(firstPrevMonth,'3');
//                 }}
//               >
//                 {firstPrevMonth}
//               </Button>
//               <Button
//                 variant={button === '4' ? "contained" : "outlined"}
//                 color='primary'
//                 sx={{
//                   height: '30px',
//                   padding: '4px 8px',
//                   borderRadius: 8,
//                   '& .MuiSvgIcon-root': {
//                     fontSize: 26,
//                   },
//                 }}
//                 onClick={() => {
//                   setButton('4');
//                   handlePreviousMonthClick(PrevMonth,'4');
//                 }}
//               >
//                 {PrevMonth}
//               </Button>

//               <Button
//                 variant={button === '5' ? "contained" : "outlined"}
//                 color='primary'
//                 sx={{
//                   height: '30px',
//                   padding: '4px 8px',
//                   borderRadius: 8,
//                   '& .MuiSvgIcon-root': {
//                     fontSize: 26,
//                   },
//                 }}
//                 onClick={() => {
//                   setButton('5');
//                   handlePreviousMonthClick(CurMonth,'5');
//                 }}
//               >
//                 {CurMonth}
//               </Button>

//               </Grid>
//               <Stack direction='row' display='flex' alignItems='center' gap={1}>
//               <Tooltip
//                   title='Export'
//                   TransitionComponent={Fade}
//                   TransitionProps={{ timeout: 600 }}
//                   placement='top'
//                 >
//                   <IconButton
//                     onClick={async () => {
//                       const data = {
//                         employee_id: value.length === 0 ? get_empbasecompany.map((d) => d.employee_id) : value.map((d) => d.employee_id),
//                         location_id: monthYear.location[0] === '' ? 'null' : monthYear.location,
//                         department: monthYear.department[0] === '' ? [] : monthYear.department,
//                         from: moment(monthYear.from).format('yyyy-MM-DD'),
//                         to: moment(monthYear.to).format('yyyy-MM-DD'),
//                         // pageCount: page,
//                         // numPerPage: pageSize,
//                         exportData: true,
//                         searchString: searchVal,
//                         type:'LateInEarlyOut'

//                       };

//                       try {
//                         dispatch(AttendanceProcessAction(data, (res) => {
//                           exportToExcel(Object.keys(res[0] || {}), res);
//                         }));
//                       } catch (error) {
//                         console.error('Error exporting data:', error);
//                       }
//                     }}
//                   >
//                     <FileDownloadIcon />
//                   </IconButton>
//                 </Tooltip>





//                 {/* <div style={{ display: 'flex' }}> */}
//                 <Tooltip
//                   title='Filter'
//                   TransitionComponent={Fade}
//                   TransitionProps={{timeout: 600}}
//                   placement='top'
//                 >
//                   <IconButton>
//                     <FilterAlt sx={{ color: '#757575' }} onClick={() => setOpen(true)} />
//                   </IconButton>
//                 </Tooltip>
//                 {/* </div> */}
//                 <CommonSearch
//                   searchVal={searchVal}
//                   cancelSearch={cancelSearch}
//                   requestSearch={requestSearch}
//                 />
//               </Stack>
//               </Grid>
//           {/* </Grid> */}
//         {/* </Grid> */}
//           <Box
//             style={{ cursor: 'pointer' }}
//             p='20px'
//             margin= '20px'
//             sx={{
//               backgroundColor: '#F4F7FE',
//               width: '100%',
//               height: 750,
//               // border: '2px solid black'
//             }}
//           >
//           <DataGrid
//             rows={updatedAttendanceProcess}
//             // rows={dataWithId}
//             columns={columns}
//             hideScrollbar={true}
//             rowsPerPageOptions={[20, 50, 100]}
//             rowsPerPage={[10]}
//             paginationMode='server'
//             density='compact'
//             disableSelectionOnClick
//             disableExtendRowFullWidth='true'
//             sx={{
//               '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': {width: 10},
//               '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb': {
//                 backgroundColor: '#B2B2B2',
//                 borderRadius: 2,
//                 border: '2px solid white',
//               },
//               '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb:hover': {
//                 background: '#999',
//               },
//               '& .MuiDataGrid-columnHeaders': {
//                 fontFamily: 'Poppins',
//                 fontSize: '12px',
//                 fontWeight: '600',
//                 color: 'rgba(0, 0, 0, 0.7)',
//               },
//             }}
//             onPageChange={(page) => handlePageChange(page)}
//             onPageSizeChange={(size) => handlePageSizeChange(size)}
//             rowCount={attendanceProcessCount}
//             pageSize={pageSize}
//             page={page}
//           />
//         </Box>
//         </Grid>
//         </Card>
//         <Dialog
//             open={open}
//             onClose={handleClose}
//             aria-labelledby='alert-dialog-title'
//             aria-describedby='alert-dialog-description'
//           >
//              <DialogContent style={{width: '30vw'}}>
             
//             <Grid
//               item
//               lg={6} md={6} sm={6}
//               xs={12}
//             >
//               <Grid display={'flex'} justifyContent={'flex-end'} sx={{mb:'5px'}}>
//               <Tooltip
//                   title='Close'
//                   TransitionComponent={Fade}
//                   TransitionProps={{ timeout: 600 }}
//                   placement='left'
//                 >
//                 <IconButton aria-label="close" onClick={() => handleClose()}>
//                   <CloseIcon />
//                 </IconButton>
//                 </Tooltip>
//               </Grid>
//               {/* <div style={{ minHeight: '40px', maxHeight: '50px' }}> */}
//               <FormControl fullWidth variant='filled' required>
//                 <InputLabel id='demo-multiple-name-label'>
//                   Select Location
//                 </InputLabel>
//                 <Select
//                   name='location'
//                   multiple
//                   // sx={{ height: '55px' }}
//                   value={monthYear.location}
//                   onChange={(e) => {
//                     const { value } = e.target;
//                     setMonthYear((prevMonthYear) => ({
//                       ...prevMonthYear,
//                       location: value.includes('') ? [''] : value,
//                     }));
//                     setFormErrors((prevFormErrors) => ({
//                       ...prevFormErrors,
//                       location: null,
//                     }));
//                   }}
//                   error={formErrors.location === null ? false : true}
//                   helperText={
//                     formErrors.location === null ? '' : 'Location is Required!'
//                   }
//                   renderValue={(selected) => {
//                     let displayText = '';

//                     if (selected.includes('')) {
//                       displayText = 'All Locations';
//                     } else if (selected.length <= 2) {
//                       displayText = selected
//                         .map((value) => {
//                           const locate = stocklocation.find(
//                             (emp) => emp.location_id === value,
//                           );
//                           return locate ? locate.location_name : '';
//                         })
//                         .join(', ');
//                     } else {
//                       const firstTwoLocations = selected
//                         .slice(0, 2)
//                         .map((value) => {
//                           const locate = stocklocation.find(
//                             (emp) => emp.location_id === value,
//                           );
//                           return locate ? locate.location_name : '';
//                         })
//                         .join(', ');

//                       displayText = `${firstTwoLocations} ...`;
//                     }

//                     return (
//                       <Stack gap={1} direction='row' flexWrap='wrap'>
//                         <Chip
//                           title={displayText === "All Locations" ? displayText : selected.map((value) => {
//                             const locate = stocklocation.find(
//                               (emp) => emp.location_id === value,
//                             );
//                             return locate ? locate.location_name : '';
//                           })
//                             .join(', ')}
//                           label={displayText}
//                           onDelete={() => {
//                             setMonthYear((prevMonthYear) => ({
//                               ...prevMonthYear,
//                               location: [],
//                             }));
//                             handleChange({
//                               target: { name: 'location', value: [] },
//                             });
//                           }}
//                           deleteIcon={
//                             <CancelIcon
//                               onMouseDown={(event) => event.stopPropagation()}
//                             />
//                           }
//                         />
//                       </Stack>
//                     );
//                   }}
//                 >
//                   <MenuItem value=''>All Location</MenuItem>
//                   {stocklocation.map((m) => (
//                     <MenuItem
//                       key={m.location_id}
//                       value={m.location_id}
//                       disabled={monthYear.location.includes('')}
//                     >
//                       {m.location_name}
//                     </MenuItem>
//                   ))}
//                 </Select>

//                 {formErrors.location !== null && (
//                   <FormHelperText sx={{ color: 'red' }}>
//                     Location is Required!
//                   </FormHelperText>
//                 )}
//               </FormControl>
//               {/* </div> */}
//             </Grid>
//             <br/>

//             <Grid
//               item
//               lg={6} md={6} sm={6}
//               xs={12}
//             >

//               <FormControl fullWidth variant='filled'>

//                 <CommonUserAutoComplete
//                   searchVal={searchValEmployeeFilter}

//                   requestSearch={requestSearchEmployeeFilter}
//                   value={value}
//                   error={formErrors.empName}
//                   setValue={handleChangeEmployeeName}
//                   type={getLocationBasedEmployee}
//                   searchType={searchLocationBasedEmployee}
//                   selectedAll={selectedAll}
//                   setSelectedAll={setSelectedAll}
//                   isMandatory={true}
//                 />

//               </FormControl>
//             </Grid>
//             <br/>
//             <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }} display={'flex'}>
//               <FormControl fullWidth variant='filled'>
//                 <InputLabel id='demo-multiple-name-label'>
//                   Select Department <span style={{ color: 'red' }}>*</span>
//                 </InputLabel>
//                 <Select
//                   sx={{minHeight: '65px'}}
//                   name='department'
//                   required = {true}
//                   multiple
//                   value={monthYear.department}
//                   onChange={(e) => {
//                     const { value } = e.target;
//                     setMonthYear((prevMonthYear) => ({
//                       ...prevMonthYear,
//                       department: value.includes('') ? [''] : value,
//                     }));
//                     setFormErrors((prevFormErrors) => ({
//                       ...prevFormErrors,
//                       department: null,
//                     }));
//                   }}
//                   error={formErrors.department !== null}
//                   helperText={formErrors.department}
//                   //input={<OutlinedInput label="Multiple Select" />}
//                   renderValue={(selected) => {
//                     return (
//                       <Stack gap={1} direction='row' flexWrap='wrap'>
//                         {selected.includes('') ? (
//                           <Chip
//                             key=''
//                             label='All Department'
//                             onDelete={() => {
//                               setSelectedDepartment([]);
//                               handleChange({
//                                 target: {name: 'department', value: []},
//                               });
//                             }}
//                             deleteIcon={
//                               <CommonToolTip title='Cancel'>
//                                 <CancelIcon
//                                   onMouseDown={(event) =>
//                                     event.stopPropagation()
//                                   }
//                                 />
//                               </CommonToolTip>
//                             }
//                           />
//                         ) : (
//                           selected.map((value) => {
//                             const locate = departmentList.find(
//                               (emp) => emp.department === value,
//                             );
//                             return (
//                               <Chip
//                                 key={value}
//                                 label={locate ? locate.department : ''}
//                                 onDelete={() => {
//                                   setSelectedDepartment(
//                                     selectedDepartment.filter(
//                                       (item) => item !== value,
//                                     ),
//                                   );
//                                   handleChange({
//                                     target: {
//                                       name: 'department',
//                                       value: selectedDepartment.filter(
//                                         (item) => item !== value,
//                                       ),
//                                     },
//                                   });
//                                 }}
//                                 deleteIcon={
//                                   <CancelIcon
//                                     onMouseDown={(event) =>
//                                       event.stopPropagation()
//                                     }
//                                   />
//                                 }
//                               />
//                             );
//                           })
//                         )}
//                       </Stack>
//                     );
//                   }}
//                 >
//                   <MenuItem value=''>All Department</MenuItem>
//                   {departmentList.map((m) => (
//                     <MenuItem
//                       key={m.department}
//                       value={m.department}
//                       disabled={selectedDepartment.includes('')}
//                     >
//                       {m.department}
//                     </MenuItem>
//                   ))}
//                 </Select>
//                 <FormHelperText sx={{color: 'red'}}>
//                   {formErrors.department}
//                 </FormHelperText>
//               </FormControl>
//             </Grid>
//             <br/>
//             <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
//               <Stack direction='row' diaplay='flex' alignItems='center' gap={1}>
//                 <LocalizationProvider dateAdapter={DateAdapter}>
//                   <DatePicker
//                     name='from'
//                     label='From Date'
//                     inputVariant='outlined'
//                     inputFormat='DD/MM/yyyy'
//                     value={monthYear.from}
//                     required={true}
//                     onChange={(date) =>
//                       handleChange({
//                         target: { value: date, name: 'from' },
//                       })
//                     }
//                     fullWidth={true}
//                     error={formErrors.from === null ? false : true}
//                     helperText={
//                       formErrors.from === null ? '' : 'FromDate is Required!'
//                     }
//                    disableFuture
//                     renderInput={(params) => (
//                       <TextField {...params} fullWidth={true} variant='filled' />
//                     )}
//                   />
//                 </LocalizationProvider>
//               </Stack>
//             </Grid>
//             <br/>
//             <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
//               <Stack
//                 direction='row'
//                 diaplay='flex'
//                 alignItems='end'
//                 gap={1}
//               // sx={{m: 1}}
//               >
//                 <LocalizationProvider dateAdapter={DateAdapter}>
//                   <DatePicker
//                     name='to'
//                     label='To Date'
//                     inputVariant='outlined'
//                     //  format="DD/MM/yyyy"
//                     inputFormat='DD/MM/yyyy'
//                     required={true}
//                     value={monthYear.to}
//                     onChange={(date) =>
//                       handleChange({
//                         target: { value: date, name: 'to' },
//                       })
//                     }
//                     disableFuture
//                     fullWidth={true}
//                     error={formErrors.to === null ? false : true}
//                     helperText={
//                       formErrors.to === null ? '' : 'toDate is Required!'
//                     }
//                     shouldDisableDate={(date) =>
//                       monthYear.from !== null && date < monthYear.from
//                     }
//                     renderInput={(params) => (
//                       <TextField {...params} fullWidth={true} variant='filled' />
//                     )}
//                   />
//                 </LocalizationProvider>
//               </Stack>
//               {/* </Box> */}
//             </Grid>
//             <br/>
            
//             <Grid
//               item
//               lg={12}
//               md={12}
//               sm={12}
//               xs={12}
//               // pb='20px'
//               display={'flex'}
//               justifyContent={'flex-end'}
//             >
//               <Button color="secondary"
//                 variant="contained"
//                 //disabled={formErrors.from !== null || formErrors.to !== null || formErrors.empName !== null}
//                 style={{ marginRight: '20px' }} onClick={handleFilterClear}>
//                 Clear
//               </Button>
//               <Button color="primary"
//                 variant="contained"
//                 disabled={formErrors.from !== null || formErrors.to !== null || formErrors.empName !== null}
//                 style={{ marginRight: '20px' }} onClick={handleSubmit}>
//                 Apply
//               </Button>
//             </Grid>
//             </DialogContent>
//           </Dialog>
//       {/* </Card> */}
//     </>
//   );
// };


// export default LateInEarlyOut;

const LateInEarlyOut = () => {
  return null;
};

export default LateInEarlyOut;
