import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MaterialTable, { MTableToolbar } from '@material-table/core';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { useDispatch, useSelector } from 'react-redux';
import {Helmet} from "react-helmet-async";
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
  LinearProgress,
  Stack,
  Card,
  Chip,
  OutlinedInput,
  FormHelperText,
  Dialog,
  DialogContent,
  DialogTitle,
  Tooltip,
  Fade,
  IconButton,
  Link,
  Breadcrumbs,
} from '@mui/material';
import { ListSalaryAction, getSearchSalaryAction, setSearchSalaryState } from 'redux/actions/salary_actions';
import { AttendanceLogReport, getEmpbasecompanyAction, getLocBaseEmpAction, getLocBaseEmpFilterAction, get_search_location_based_employee, set_search_location_based_employee ,setSearchAttendanceListAction,SearchAttendanceAction, setSearchAttendanceLogReportAction, SearchAttendanceLogReportAction } from 'redux/actions/attendance_actions';
import apiCalls from 'utils/apiCalls';
import { maxBodyHeight, maxHeight, pageSize, headerStyle, cellStyle, font14_500, formatTime12Hour } from 'utils/pageSize';
import { formatName } from 'utils/nameFormatter';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { ExportCsv } from '@material-table/exporters';
import CancelIcon from '@mui/icons-material/Cancel';
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import { commonDateFormat } from 'utils/getTimeFormat';
import CommonToolTip from '../../../components/ToolTip';
import { titleURL } from 'http-common';
import CommonUserAutoComplete from 'utils/commonAutoCompleteForUser';
import { GET_EMP_BASECOMPANY, LOCATION_BASE_DEP, LOCATION_BASE_DEP_FILTER } from 'redux/actionTypes';
import CommonSearch from 'utils/commonSearch';
import { CloseOutlined, FilterAlt } from '@mui/icons-material';
import { departmentListAction } from 'redux/actions/userCreation_actions';
import {DataGrid} from '@mui/x-data-grid';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx-js-style';
import CloseIcon from '@mui/icons-material/Close';
import { listDepartment } from 'redux/actions/shifts.actions';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import toMomentOrNull from 'utils/DateFixer';
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

const Index = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    SalaryReducers: {salarylist, searchSalaryData},
    attendanceReducer: {
      attendance_log_process,
      get_empbasecompany,
      attendanceLogCount,
      getLocationBasedEmployee,
      searchLocationBasedEmployee,
    },
    stockLocationReducer: {stocklocation},
    UserCreationReducer: {departmentList},
    ShiftsReducer: {list_department},
    rbacReducer: {menuAccess = []},
  } = useSelector((state) => state);
  console.log(attendance_log_process, 'process');
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(CreateNewButtonContext);
  const storage = getsessionStorage();
  const [regex] = useState({});
  const [selectedReport, setSelectedReport] = useState('attendanceReport');
  const currentMonth = moment().startOf('month');
  const firstDateOfMonth = currentMonth.format('YYYY-MM-DD');
  const lastDateOfMonth = currentMonth.endOf('month').format('YYYY-MM-DD');
  const currentDate = new Date();
  const firstDayOfPreviousMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );
  const lastDayOfPreviousMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  );
console.log("stocklocation",stocklocation)
  const [monthYear, setMonthYear] = React.useState({
    empName: [''],
    location: [''],
    from: moment(firstDayOfPreviousMonth),
    to: moment(lastDayOfPreviousMonth),
    department: [''],
  });

  console.log(monthYear, 'fromtooo');
  const [value, setValue] = React.useState([]);
  const [formErrors, setFormErrors] = useState({
    empName: null,
    location: null,
    from: null,
    to: null,
    department: null,
  });

  const [tableData, setTableData] = useState([]);
  const [button, setButton] = useState('4');
  const [requiredFields] = useState(['location', 'from', 'to']);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [searchVal, setSearchVal] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState(['']);
  const [flag, setFlage] = useState(false);
  const [open, setOpen] = useState(false);

  const [departmentLists, setDepartmentList] = useState(false);
  const [departmentListsArray, setDepartmentListArray] = useState([]);
  
  console.log(page, 'page');
 

  const updatedAttendanceProcess = attendance_log_process.map(
    (item, index) => ({
      ...item,
      id: `generated-id-${index}`,
      uniqueId: index,
    }),
  );

  useEffect(() => {
    let data = {
      searchString: '',
    };

    dispatch(getEmpbasecompanyAction());
    dispatch(
      listDepartment(data, (response) => {
        // console.log("response",response)
        if (response.length) {
          //  console.log("response.length",response.length)
          setDepartmentListArray(response);
        }
      }),
    ),
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        commoncookie,
        headerLocationId,
        dispatch(listStockLocationAction(commoncookie, headerLocationId)),
      ).finally(() => setIsApiFinished(true));
  }, []);

  useEffect(() => {
    // if (departmentLists) {
  
      let data = {
        employee_id:
          value.length === 0
            ? get_empbasecompany.map((d) => d.employee_id)
            : value.map((d) => d.employee_id),
        location_id: monthYear.location[0] === '' ? 'null' : monthYear.location,
        department:
          monthYear.department[0] === ''
            ? list_department.map((d) => d.department)
            : monthYear.department,
        from: moment(monthYear.from).format('yyyy-MM-DD'),
        to: moment(monthYear.to).format('yyyy-MM-DD'),
        pageCount: page,
        numPerPage: pageSize,
        searchString: searchVal,
      };
      setIsApiFinished(false);
      setLoaderStatusHandler(true);
      console.log('usecheckeffect', data);
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        commoncookie,
        headerLocationId,
        dispatch(AttendanceLogReport(data)),
      ).finally(() =>
        { 
          setIsApiFinished(true)
          setLoaderStatusHandler(false)
        })
    // }
  }, [pageSize, departmentLists]);
  console.log('pageSizepageSize', pageSize);

  const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');


  const [selectedAll, setSelectedAll] = useState(false);

  useEffect(() => {
    setValue([]);
    // if (departmentLists) {
      if (
        monthYear?.location?.length > 0 ||
        monthYear?.department?.length > 0
      ) {
        let data = {
          ...monthYear,
          location: monthYear.location[0] === '' ? [] : monthYear.location,
          department:
            monthYear.department[0] === ''
              ? list_department.map((d) => d.department)
              : monthYear.department,
          empName: monthYear.empName[0] === '' ? [] : monthYear.empName,
          searchString: '',
        };
        dispatch(
          getLocBaseEmpFilterAction(data, (res) => {
            if (res.data?.department) {
              dispatch({
                type: LOCATION_BASE_DEP,
                payload: res.data?.department,
              });
            }
            if (res.data?.employees) {
              console.log(res?.data, 'correction');
              dispatch({
                type: LOCATION_BASE_DEP_FILTER,
                payload: res.data?.employees,
              });
            }
          }),
        );
      // }
    }
  }, [monthYear?.location, departmentLists, monthYear?.department]);

  useEffect(() => {
  if (stocklocation.length === 1) {
    setMonthYear(prev => ({
      ...prev,
      location: [stocklocation[0].location_id]
    }));
  }
}, [stocklocation]);


  const requestSearchEmployeeFilter = (val) => {
    // let allDept = list_department.map((d) => d.department);

    setSearchValEmployeeFilter(val);
    dispatch(set_search_location_based_employee([]));

    if (!val) {
      return;
    }

    let data = {
      ...monthYear,
      searchString: val,
      department:
        monthYear.department[0] === ''
          ? list_department.map((d) => d.department)
          : monthYear.department,
    };

    dispatch(
      get_search_location_based_employee(
        data,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    );
    // }
    // }),
    // );
  };

  const [reportTypes, setReportTypes] = useState({
    attendanceReport: 'Attendance Log Report',
  });

  const [isApiFinished, setIsApiFinished] = useState(false);

  const handleChangeEmployeeName = (val) => {
    setValue(val);
    if (val?.length > 0) {
      setFormErrors({...formErrors, empName: null});
    }
  };

  const handleChange = async (e) => {
    let {name, value} = e.target;
    setStateHandler(name, value);
  };

  const setStateHandler = async (name, value) => {
    let formObj = {};

    formObj = {
      ...monthYear,
      [name]: value === '' ? null : value,
    };

    await setMonthYear(formObj);
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
      // Clear the error for the 'from' field when a value is selected
      if (name === 'from') {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
      }
    }
  };

  const handlePageChange = async (page) => {
    let data = {
      employee_id: value.length === 0 ? get_empbasecompany.map((d) => d.employee_id) : value.map((d) => d.employee_id),
      location_id: monthYear.location[0] === '' ? 'null' : monthYear.location,
      department:
        monthYear.department[0] === ''
          ? list_department.map((d) => d.department)
          : monthYear.department,
      from: moment(monthYear.from).format('yyyy-MM-DD'),
      to: moment(monthYear.to).format('yyyy-MM-DD'),
      pageCount: page,
      numPerPage: pageSize,
      searchString: searchVal,
    };
    console.log('usecheckeffect', data);
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      commoncookie,
      headerLocationId,
      dispatch(AttendanceLogReport(data)),
    )
      .then(() => {
        setPage(page);
      })
      .finally(() => {
        setIsApiFinished(true);
      });
  };

  const handlePageSizeChange = async (size) => {
    setPageSize(size);
  };

  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const commonCellStyle = {
    fontFamily: 'poppins',
    fontSize: '11px',
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.7)',
  };
  
  const sharedColumnProps = {
    flex: 1,
    minWidth: 140,
  };

 const handleDeleteChip = (value) => {
  let updatedDepartments;

  if (value === '') {
    // If "All Department" chip is deleted → clear everything
    updatedDepartments = [];
  } else {
    // Otherwise, remove just that specific department
    updatedDepartments = monthYear.department.filter((item) => item !== value);
  }

  setMonthYear((prevState) => ({
    ...prevState,
    department: updatedDepartments,
  }));

  handleChange({
    target: {
      name: 'department',
      value: updatedDepartments,
    },
  });
};


  const columns = [
    {
      field: 'tappedDate',
      headerName: 'Date',
      ...sharedColumnProps,
      renderCell: (params) => {
        const tappedDate = params.row.tappedDate;
        return (
          <div style={commonCellStyle}>
            {tappedDate === '0000-00-00' || tappedDate === null
              ? '-'
              : tappedDate}
          </div>
        );
      },
    },
    {
      field: 'employeeName',
      headerName: 'Employee',
      ...sharedColumnProps,
      renderCell: (params) => (
        <div style={commonCellStyle}>
          {params.row.employeeName ? formatName(params.row.employeeName) : '-'}
        </div>
      ),
      cellClassName: 'capitalize-text',
    },
    {
      field: 'departmentName',
      headerName: 'Department',
      ...sharedColumnProps,
      renderCell: (params) => (
        <div style={commonCellStyle}>
          {params.row.departmentName ? params.row.departmentName : '-'}
        </div>
      ),
      cellClassName: 'capitalize-text',
    },
    {
      field: 'employeeCode',
      headerName: 'Emp Code',
      ...sharedColumnProps,
      cellClassName: 'capitalize-text',
      renderCell: (params) => (
        <div style={commonCellStyle}>{params.row.employeeCode}</div>
      ),
    },

    {
      field: 'tappedTime',
      headerName: 'Time',
      ...sharedColumnProps,
      renderCell: (params) => (
        <div style={commonCellStyle}>
          {params.row.tappedTime ? params.row.tappedTime : '-'}
        </div>
      ),
    },
    {
      field: 'locationName',
      headerName: 'Location Name',
      ...sharedColumnProps,
      renderCell: (params) => (
        <div style={commonCellStyle}>
          {params.row.locationName ? params.row.locationName : '-'}
        </div>
      ),
    },
   {
      field: 'inOutType',
      headerName: 'Type',
      ...sharedColumnProps,
      renderCell: (params) => (
        <div style={commonCellStyle}>
          {params.row.inOutType ? params.row.inOutType : '-'}
        </div>
      ),
    },
    {
      field: 'attendanceType',
      headerName: 'AttendanceType',
      ...sharedColumnProps,
      renderCell: (params) => (
        <div style={commonCellStyle}>
          {params.row.attendanceType
            ? params.row.attendanceType.charAt(0).toUpperCase() + params.row.attendanceType.slice(1)
            : '-'}
        </div>
      ),
    }

  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedAll) {
      dispatch(
        getLocBaseEmpAction(monthYear, (res) => {
          if (res.data?.employees) {
            processFunction(res.data?.employees);
          }
        }),
      );
    } else {
      processFunction(value);
    }
    setButton();
  };

  const processFunction = async (value) => {
    setFlage(true);
    setSearchVal('');
    setTableData([]);
    let isValid = true;
    let formErrorsObj = {...formErrors};

    await Promise.all(
      Object.keys(monthYear).map(async (key) => {
        if (
          requiredFields.includes(key) &&
          (monthYear[key] === null ||
            monthYear[key] === '' ||
            monthYear[key].length === 0)
        ) {
          isValid = false;
          formErrorsObj[key] = capitalize(key) + ' is Required!';
        } else if (key === 'location' && monthYear[key].length === 0) {
          isValid = false;
          formErrorsObj[key] = 'Please select a location!';
        } else if (regex[key]) {
          if (!regex[key].test(monthYear[key])) {
            isValid = false;
            formErrorsObj[key] = capitalize(key) + ' is Invalid!';
          }
        }
      }),
    );

    await setFormErrors(formErrorsObj);

    if (isValid) {
      console.log('monthFiltersfd');

      let data = {
       employee_id: value.length === 0 ? get_empbasecompany.map((d) => d.employee_id) : value.map((d) => d.employee_id),
        location_id: monthYear.location[0] === '' ? 'null' : monthYear.location,
        from: moment(monthYear.from).format('yyyy-MM-DD'),
        to: moment(monthYear.to).format('yyyy-MM-DD'),
        department:
          monthYear.department[0] === ''
            ? list_department.map((d) => d.department)
            : monthYear.department,
        pageCount: page,
        numPerPage: pageSize,
        searchString: '',
      };

      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(AttendanceLogReport(data)),
      );
      setOpen(false);
    }
  };

 const requestSearch = (e) => {
  const val = e.target.value;
  setSearchVal(val);
  console.log('value', val);

  // Start: set loading
  setIsApiFinished(false);
  setLoaderStatusHandler(true);

  dispatch(setSearchAttendanceLogReportAction({ data: [], numRows: 0 }));

  const payLoad = {
    department:
      monthYear.department[0] === ''
        ? list_department.map((d) => d.department)
        : monthYear.department,
    employee_id: monthYear.empName[0] === '' ? [] : monthYear.empName,
    location_id: monthYear.location[0] === '' ? 'null' : monthYear.location,
    from: moment(monthYear.from).format('yyyy-MM-DD'),
    to: moment(monthYear.to).format('yyyy-MM-DD'),
    pageCount: 0,
    numPerPage: pageSize,
    searchString: val,
  };

  // Dispatch async action (non-promise)
  dispatch(
    SearchAttendanceLogReportAction(
      payLoad,
      setModalTypeHandler,
      (loaderStatus) => {
        setLoaderStatusHandler(loaderStatus);
        // when your loader turns false => API done
        if (loaderStatus === false) {
          setIsApiFinished(true);
        }
      },
    ),
  );
};

  const cancelSearch = () => {
    setSearchVal('');

    dispatch(setSearchAttendanceLogReportAction({data: [], numRows: 0}));
    let payLoad = {
           department: monthYear.department[0] === ''  ? list_department.map((d) => d.department)  : monthYear.department,
           employee_id: monthYear.empName[0] === '' ? [] : monthYear.empName,
           location_id: monthYear.location[0] === '' ? 'null' : monthYear.location,
           from: moment(monthYear.from).format('yyyy-MM-DD'),
           to: moment(monthYear.to).format('yyyy-MM-DD'),
           pageCount: 0,
           numPerPage: pageSize,
           searchString: ''
    };
    dispatch(
      SearchAttendanceLogReportAction(
        payLoad,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    );
  };

  const handleClose = () => {
    setOpen(false);
    setFormErrors({
      ...formErrors,
      empName: null,
      location: null,
      from: null,
      to: null,
      department: null
    })
  };
  console.log(monthYear, 'monthyear');

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth();
  const previousMonths = [];
  for (let i = 0; i <= 5; i++) {
    const prevMonthIndex = (currentMonthIndex - i + 12) % 12;
    let prevMonthYear = currentYear;
    if (prevMonthIndex > currentMonthIndex) {
      prevMonthYear--;
    }
    const prevMonthString = `${months[prevMonthIndex]} ${prevMonthYear}`;
    previousMonths.push(prevMonthString);
  }
  const PrevMonth = previousMonths[0];
  const firstPrevMonth = previousMonths[1];
  const secondPrevMonth = previousMonths[2];
  const thirdPrevMonth = previousMonths[3];

  const getStartAndEndDate = (monthName, year) => {
    const monthMap = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    };
    const monthNumber = monthMap[monthName.toLowerCase()];
    const startDate = new Date(year, monthNumber, 1);
    const endDate = new Date(year, monthNumber + 1, 0);
    return {startDate, endDate};
  };

  const handlePreviousMonthClick = (data) => {
    // console.log("data",data)
    setPage(0);
    setSearchVal('');
    const month = data.split(' ')[0];
    const year = data.split(' ')[1];
    const {startDate, endDate} = getStartAndEndDate(month, year);
    // console.log(startDate,'startdateee');
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    let payload = {
      employee_id: value.length === 0 ? get_empbasecompany.map((d) => d.employee_id) : value.map((d) => d.employee_id),
      location_id: monthYear.location[0] === '' ? 'null' : monthYear.location,
      department:
        monthYear.department[0] === ''
          ? list_department.map((d) => d.department)
          : monthYear.department,
      from: moment(startDate).format('yyyy-MM-DD'),
      to: moment(endDate).format('yyyy-MM-DD'),
      pageCount: 0,
      numPerPage: pageSize,
      searchString: '',
    };
    setMonthYear({...monthYear, from: startDate, to: endDate});
    console.log(
      monthYear.department[0] === '' ? 'null' : monthYear.department,
      'departmentt',
    );
    dispatch(AttendanceLogReport(payload));
    
  };

  const exportToExcel = useCallback((columns, data) => {
    const columnNames = {
      // creationDate1: 'Date',
      // shift_name: 'Shift',
      // full_name: 'Employee Name',
      // type: 'Check In type',
      // end_type: 'Check out type',
      // actual_start_time: 'Actual Check In',
      // actual_end_time: 'Actual Check Out',
      // first_in_time: 'Check In',
      // last_out_time: 'Check Out',
      // start_shift_time: 'Start Shift Time',
      // end_shift_time: 'End Shift Time',
      // work_hours: 'Work Hours',
      // break_hours: 'Break Hours',
      tappedDate: 'Date',
      employeeName: 'Employee',
      departmentName: 'Department',
      employeeCode: 'Emp Code',
      tappedTime: 'Time',
      locationName: 'Location Name',
      inOutType: 'Type',
      attendanceType: 'AttendanceType'
    };
    const selectedColumns = [
      // 'creationDate1',
      // 'shift_name',
      // 'full_name',
      // 'type',
      // 'end_type',
      // 'actual_start_time',
      // 'actual_end_time',
      // 'first_in_time',
      // 'last_out_time',
      // 'start_shift_time',
      // 'end_shift_time',
      // 'work_hours',
      // 'break_hours',
      'tappedDate',
      'employeeName',
      'departmentName',
      'employeeCode',
      'tappedTime',
      'locationName',
      'inOutType',
      'attendanceType'
    ];
    const headers = selectedColumns.map((col) => columnNames[col] || col);
    const sheetData = [
      headers,
      ...data.map((row) => selectedColumns.map((col) => row[col] || '')),
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    const excelBuffer = XLSX.write(wb, {bookType: 'xlsx', type: 'array'});
    const blob = new Blob([excelBuffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Attendance_Report.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, []);

  const handleFilterClear = () => {
    setSearchVal('');
    setOpen(false);
    setMonthYear({
      ...monthYear,
      empName: [''],
      location: stocklocation.length === 1 ? [] : [''],
      from: moment(firstDayOfPreviousMonth),
      to: moment(lastDayOfPreviousMonth),
      department: [''],
    });
    setValue([]);
    setSearchVal('');
    setButton('4');
    setFormErrors({
      ...formErrors,
      empName: null,
      location: null,
      from: null,
      to: null,
      department: null
    })
    let data = {
      employee_id: [],
      location_id: 'null',
      from: moment(firstDayOfPreviousMonth).format('yyyy-MM-DD'),
      to: moment(lastDayOfPreviousMonth).format('yyyy-MM-DD'),
      department:
        monthYear.department[0] === ''
          ? list_department.map((d) => d.department)
          : monthYear.department,
      pageCount: 0,
      numPerPage: pageSize,
      searchString: searchVal,
    };

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      commoncookie,
      headerLocationId,
      dispatch(AttendanceLogReport(data)),
    ).finally(() => setIsApiFinished(true));
  };
  const selectedRole = storage?.role_name;
  const reportExport = UserRightsAuthorization(menuAccess[selectedRole], 'reports__attendance__attendance_log_report', 'can_export')

  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | Attendance Log Report</title>
      </Helmet>
      <Card
        sx={{
          width: '100%',
          height: 'calc(100vh - 75px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header Row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
            borderBottom: '1px solid #eee',
            flexShrink: 0,
          }}
        >
          {/* Left: Title */}
          <Typography sx={{ fontWeight: 600, fontSize: '15px', whiteSpace: 'nowrap' }}>
            Attendance Log Report
          </Typography>

          {/* Right: Month Buttons + Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Month Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#f5f5f5', borderRadius: '20px', p: '3px' }}>
              {[
                { label: thirdPrevMonth, val: '1' },
                { label: secondPrevMonth, val: '2' },
                { label: firstPrevMonth, val: '3' },
                { label: PrevMonth, val: '4' },
              ].map((m) => (
                <Chip
                  key={m.val}
                  label={m.label}
                  size='small'
                  clickable
                  onClick={() => {
                    handlePreviousMonthClick(m.label);
                    setButton(m.val);
                  }}
                  sx={{
                    fontWeight: button === m.val ? 600 : 400,
                    fontSize: '0.75rem',
                    height: 26,
                    bgcolor: button === m.val ? 'primary.main' : 'transparent',
                    color: button === m.val ? '#fff' : 'text.secondary',
                    '&:hover': {
                      bgcolor: button === m.val ? 'primary.dark' : '#e0e0e0',
                    },
                  }}
                />
              ))}
            </Box>
            <CommonSearch
              searchVal={searchVal}
              cancelSearch={cancelSearch}
              requestSearch={requestSearch}
            />
            <Tooltip title='Filter' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement='top'>
              <IconButton size='small' onClick={() => setOpen(true)}>
                <FilterAlt sx={{ color: '#757575', fontSize: 20 }} />
              </IconButton>
            </Tooltip>
            {reportExport && (
              <Tooltip title='Export' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement='top'>
                <IconButton
                  size='small'
                  onClick={async () => {
                    const data = {
                      employee_id:
                        value.length === 0
                          ? get_empbasecompany.map((d) => d.employee_id)
                          : value.map((d) => d.employee_id),
                      location_id:
                        monthYear.location[0] === ''
                          ? 'null'
                          : monthYear.location,
                      department:
                        monthYear.department[0] === ''
                          ? list_department.map((d) => d.department)
                          : monthYear.department,
                      from: moment(monthYear.from).format('yyyy-MM-DD'),
                      to: moment(monthYear.to).format('yyyy-MM-DD'),
                      exportData: true,
                      searchString: searchVal,
                    };
                    try {
                      dispatch(
                        AttendanceLogReport(data, (res) => {
                          exportToExcel(Object.keys(res[0] || {}), res);
                        }),
                      );
                    } catch (error) {
                      console.error('Error exporting data:', error);
                    }
                  }}
                >
                  <FileDownloadIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title='Close'>
              <IconButton size='small' onClick={() => navigate('/report')}>
                <CloseIcon sx={{ fontSize: 22 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Table */}
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {isApiFinished ? (
            <DataGrid
              rows={updatedAttendanceProcess}
              columns={columns}
              pageSizeOptions={[20, 50, 100]}
              paginationMode='server'
              density='compact'
              disableRowSelectionOnClick
              disableExtendRowFullWidth
              rowCount={attendanceLogCount}
              paginationModel={{ page: page, pageSize: pageSize }}
              onPaginationModelChange={(model) => {
                if (model.page !== page) handlePageChange(model.page);
                if (model.pageSize !== pageSize) handlePageSizeChange(model.pageSize);
              }}
              sx={{
                height: '100%',
                border: 0,
                '& .MuiDataGrid-main': { overflow: 'hidden' },
                '& .MuiDataGrid-virtualScroller': { overflowY: 'auto' },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#F4F7FE',
                  fontSize: 12,
                  fontWeight: 700,
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: '#f5faf8',
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #f0f0f0',
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: '1px solid #eee',
                },
              }}
            />
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant='body2' color='text.secondary'>
                Loading...
              </Typography>
            </Box>
          )}
        </Box>
      </Card>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogContent
          sx={{
            width: {
              xs: '100%',
              sm: '200px',
              md: '300px',
              lg: '400px',
              xl: '500px',
            },
            maxWidth: '95%',
            margin: 'auto',
          }}
        >
          <Grid
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <Grid display={'flex'} justifyContent={'flex-end'} sx={{mb: '5px'}}>
              <Tooltip
                title='Close'
                TransitionComponent={Fade}
                TransitionProps={{timeout: 600}}
                placement='left'
              >
                <IconButton aria-label='close' onClick={() => handleClose()}>
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            {/* <div style={{ minHeight: '40px', maxHeight: '50px' }}> */}
            <FormControl fullWidth variant='filled' required>
              <InputLabel id='demo-multiple-name-label'>
                Select Location
              </InputLabel>
              <Select
                name='location'
                multiple
                // sx={{ height: '55px' }}
                value={monthYear.location}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 250,
                      overflowY: 'auto',
                    },
                  },
                }}
                onChange={(e) => {
                  const { value } = e.target;
                  if (stocklocation.length > 1) {
                    if (value.includes("")) {
                      setMonthYear(prev => ({
                        ...prev,
                        location: [""]
                      }));
                    } else {
                      setMonthYear(prev => ({
                        ...prev,
                        location: value
                      }));
                    }
                    return;
                  }

                  setMonthYear(prev => ({
                    ...prev,
                    location: value.filter(v => v !== "")
                  }));
                }}


                error={formErrors.location === null ? false : true}
                helperText={
                  formErrors.location === null ? '' : 'Location is Required!'
                }
                renderValue={(selected) => {
                  if (selected.length === 0) return "";

                  if (stocklocation.length > 1 && selected.includes("")) {
                    return (
                      <Chip
                        label="All Locations"
                        onDelete={() =>
                          setMonthYear(prev => ({
                            ...prev,
                            location: []
                          }))
                        }
                        onMouseDown={(e) => e.stopPropagation()}
                      />
                    );
                  }

                  return (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((id) => {
                        const name =
                          stocklocation.find((loc) => loc.location_id === id)?.location_name ??
                          id;

                        return (
                          <Chip
                            key={id}
                            label={name}
                            onDelete={() => {
                              const updated = selected.filter((x) => x !== id);
                              setMonthYear((prev) => ({
                                ...prev,
                                location: updated,
                              }));
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                          />
                        );
                      })}
                    </Box>
                  );
                }}

              >
                {/* <MenuItem value=''>All Location</MenuItem> */}
                {stocklocation.length > 1 && (
                  <MenuItem value=''>All Location</MenuItem>
                )}
                {stocklocation.map((m) => (
                  <MenuItem
                    key={m.location_id}
                    value={m.location_id}
                    disabled={monthYear.location.includes('')}
                  >
                    {m.location_name}
                  </MenuItem>
                ))}
              </Select>

              {formErrors.location !== null && (
                <FormHelperText sx={{color: 'red'}}>
                  Location is Required!
                </FormHelperText>
              )}
            </FormControl>
            {/* </div> */}
          </Grid>
          <br />

            <Grid
              size={{
                lg: 6,
                md: 6,
                sm: 6,
                xs: 12
              }}>

            <FormControl fullWidth variant='filled'>

              <CommonUserAutoComplete
                searchVal={searchValEmployeeFilter}
                requestSearch={requestSearchEmployeeFilter}
                value={value}
                setValue={handleChangeEmployeeName}
                type={getLocationBasedEmployee}
                searchType={searchLocationBasedEmployee}
                selectedAll={selectedAll}
                setSelectedAll={setSelectedAll}
              />

            </FormControl>
          </Grid>
          <br />
          <Grid
            display={'flex'}
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <FormControl fullWidth variant='filled'>
              <InputLabel id='demo-multiple-name-label'>
                Select Department <span style={{color: 'red'}}>*</span>
              </InputLabel>
              <Select
                sx={{minHeight: '65px'}}
                name='department'
                required={true}
                multiple
                value={monthYear.department}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 200,
                      overflowY: 'auto',
                    },
                  },
                }}
                onChange={(e) => {
                  const {value} = e.target;
                  setMonthYear((prevMonthYear) => ({
                    ...prevMonthYear,
                    department: value.includes('') ? [''] : value,
                  }));
                  setFormErrors((prevFormErrors) => ({
                    ...prevFormErrors,
                    department: null,
                  }));
                }}
                error={formErrors.department !== null}
                helperText={formErrors.department}
                //input={<OutlinedInput label="Multiple Select" />}
                renderValue={(selected) => {
                  return (
                    <Stack gap={1} direction='row' flexWrap='wrap'>
                      {selected.includes('') ? (
                        <Chip
                          key=''
                          label='All Department'
                          onDelete={() => handleDeleteChip('')}
                          deleteIcon={
                            <CommonToolTip title='Cancel'>
                              <CancelIcon
                                onMouseDown={(event) => event.stopPropagation()}
                              />
                            </CommonToolTip>
                          }
                        />
                      ) : (
                        selected.map((value) => {
                          const locate = list_department.find(
                            (emp) => emp.department === value,
                          );
                          return (
                            <Chip
                              key={value}
                              label={locate ? locate.department : ''}
                              onDelete={() => handleDeleteChip(value)}
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
                {list_department.map((m) => (
                  <MenuItem
                    key={m.department}
                    value={m.department}
                    disabled={monthYear.department[0] === ''}
                  >
                    {m.department}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText sx={{color: 'red'}}>
                {formErrors.department}
              </FormHelperText>
            </FormControl>
          </Grid>
          <br />
          <Grid
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <Stack direction='row' diaplay='flex' alignItems='center' gap={1}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  name='from'
                  label='From Date'
                  inputVariant='outlined'
                  format='DD/MM/YYYY'
                  value={toMomentOrNull(monthYear.from)}
                  required={true}
                  onChange={(date) =>
                    handleChange({
                      target: {value: date, name: 'from'},
                    })
                  }
                  fullWidth={true}
                  error={formErrors.from === null ? false : true}
                  helperText={
                    formErrors.from === null ? '' : 'FromDate is Required!'
                  }
                  disableFuture
                  slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
                />
              </LocalizationProvider>
            </Stack>
          </Grid>
          <br />
          <Grid
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <Stack
              direction='row'
              diaplay='flex'
              alignItems='end'
              gap={1}
              // sx={{m: 1}}
            >
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  name='to'
                  label='To Date'
                  inputVariant='outlined'
                  //  format="DD/MM/yyyy"
                  format='DD/MM/YYYY'
                  required={true}
                  value={toMomentOrNull(monthYear.to)}
                  onChange={(date) =>
                    handleChange({
                      target: {value: date, name: 'to'},
                    })
                  }
                  // disableFuture
                  fullWidth={true}
                  error={formErrors.to === null ? false : true}
                  helperText={
                    formErrors.to === null ? '' : 'toDate is Required!'
                  }
                  shouldDisableDate={(date) =>
                    monthYear.from !== null && date < monthYear.from
                  }
                  slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
                />
              </LocalizationProvider>
            </Stack>
            {/* </Box> */}
          </Grid>
          <br />

          <Grid
            // pb='20px'
            display={'flex'}
            justifyContent={'flex-end'}
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Button
              color='secondary'
              variant='contained'
              //disabled={formErrors.from !== null || formErrors.to !== null || formErrors.empName !== null}
              style={{marginRight: '20px'}}
              onClick={handleFilterClear}
            >
              Clear
            </Button>
            <Button
              color='primary'
              variant='contained'
              style={{marginRight: '20px'}}
              onClick={handleSubmit}
            >
              Apply
            </Button>
          </Grid>
        </DialogContent>
      </Dialog>
      {/* </Card> */}
    </>
  );
};


export default Index;