import React, {useContext, useEffect} from 'react';
import DataGridTemp from 'components/dataGridTemp';
import {
  getWorkDurationReportAction,
  getWorkDurationTotalHoursReportAction,
  get_search_location_based_employee,
  get_workdurationReportAction,
  setWorkdurationReportAction,
  set_search_location_based_employee,
  workDurationAction,
} from 'redux/actions/attendance_actions';
import {useDispatch, useSelector} from 'react-redux';
import {useState} from 'react';
import FilterPossale from 'pages/pointofsale/posSale/FilterPossale';
import CommonFilter from 'components/pos/payment_section/CommonFilter';
import moment from 'moment';
import {Helmet} from 'react-helmet-async';
import {titleURL} from 'http-common';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  Chip,
  Fade,
  Grid,
  IconButton,
  Link,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {DataGrid} from '@mui/x-data-grid';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {useCustomFetch} from 'utils/useCustomFetch';
import * as XLSX from 'xlsx-js-style';
import {saveAs} from 'file-saver';
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { departmentListAction } from 'redux/actions/userCreation_actions';
import CommonSearch from 'utils/commonSearch';
import { column } from 'stylis';
import { listDepartment } from 'redux/actions/shifts.actions';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { maxBodyHeight, maxHeight } from 'utils/pageSize';
import API_URLS from '../../../utils/customFetchApiUrls';
import apiCalls from 'utils/apiCalls';
import { formatName } from 'utils/nameFormatter';
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

const WorkDurationReportTest = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const customFetch = useCustomFetch();
  const date = new Date();

  const {
    attendanceReducer: {
      workDurationReport,
      workDurationTotalHoursReport,
      workReport,
      workReportCount,
      getLocationBasedEmployee,
      searchLocationBasedEmployee
    },stockLocationReducer: { stocklocation }, 
    ShiftsReducer: { list_department }, rbacReducer: {menuAccess = []}
  } = useSelector((state) => state);

  const storage = getsessionStorage();
  const [empLogData, setEmpLogData] = useState([]);
  const [companyBasedEmpDetailsData, setCompanyBasedEmpDetailsData] =
    useState();
  const [count, setCount] = useState(0);
  const [filterOpen, handleFilter] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [selectedAll, setSelectedAll] = useState(false);
  const [button, setButton] = useState('4');
  const [filterDate, setFilterDate] = useState(() => {
    const currentDate = new Date();
    const from = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastDayOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    
    return {
      from,
      to: lastDayOfPreviousMonth,
    };
  });
  
  const [filterMonthDate, setFilterMonthDate] = useState(() => {
    const from = new Date(date.getFullYear(), date.getMonth(), 1);
    const to = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { from, to };
  });
  const [previousMonthClicked, setPreviousMonthClicked] = useState(false);
  const [errMsg, setErrMsg] = useState({
    from: '',
    to: '',
  });
  const [pageSize, setPageSize] = useState(20)
  const [page, setPage] = useState(0)
  const [value, setValue] = React.useState([]);
  const currentMonth = moment().startOf('month');
  const firstDateOfMonth = currentMonth.format('YYYY-MM-DD');
  const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');
  const lastDateOfMonth = currentMonth.endOf('month').format('YYYY-MM-DD');
  const [isApiFinished, setIsApiFinished] = useState(false);
  const [monthYear, setMonthYear] = React.useState({
    empName: [''],
    location: [''],
    department: [''],
    from: moment(firstDateOfMonth),
    to: moment(lastDateOfMonth),
  });
  console.log('empLogData',monthYear.department[0] === '')
  const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(
    CreateNewButtonContext,
  );

  const [departmentLists, setDepartmentList] = useState(false);
  const [departmentListsArray, setDepartmentListArray] = useState([]);

  useEffect(() => {

    let data = {
      searchString:''
     }
       setIsApiFinished(false);
      setLoaderStatusHandler(true);

    apiCalls(dispatch(listDepartment(data, (response) => {
      // console.log("response",response)
      if (response.length) {
        //  console.log("response.length",response.length)
        setDepartmentList(true)
        setDepartmentListArray(response)
      }

    }))).finally(() => setIsApiFinished(true));
  
  }, []);

  useEffect(() => { (async () => {
    if(departmentLists){

    
    let payLoad = {
      fromDate: moment(filterDate.from, 'year', 'month', 'day').format(
        'YYYY-MM-DD',
      ),
      toDate: moment(filterDate.to, 'year', 'month', 'day').format(
        'YYYY-MM-DD',
      ),
      searchString: '',
      pageCount: page,
      numPerPage: pageSize,
      department: monthYear.department[0] === ''  ? list_department.map((d) => d.department)  : monthYear.department,
    };

    const dataWithDayName = (employees) => {
      console.log('employees', employees);
      // Pre-calculate day names if they are repetitive and static
      const dayNamesCache = {};

      return employees?.map((employee) => {
        const transformedLogData = {};

        if (Array.isArray(employee?.log_data)) {
          employee?.log_data?.forEach((log) => {
            const dateKey = log.log_date; // Assuming log_date is a string in "YYYY-MM-DD" format

            // Use dateKey to cache day and dayName calculations
            if (!dayNamesCache[dateKey]) {
              const date = new Date(log.log_date);
              const day = date.getDate();
              const dayName = date.toLocaleString('default', {
                weekday: 'short',
              });
              dayNamesCache[dateKey] = `${day}${dayName}`;
            }

            // Direct assignment for performance
            transformedLogData[dayNamesCache[dateKey]] = log.work_hours || null;
          });
        }

        // Efficiently combining objects without spread operator in a hot path
        const result = Object.assign(employee, transformedLogData);
        delete result.log_data; // Consider whether you need to mutate the original data
        console.log('result',result)
        return result;
      });
    };
      setIsApiFinished(false);
      setLoaderStatusHandler(true);

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
      workDurationAction(payLoad, async (response) => {
        const finalRows = await dataWithDayName(response.data);
        console.log('finalRows',finalRows)
        const finalData = await finalRows?.map((row, index) => ({
          id: index,
          ...row,
        }));
        console.log('finalData',finalData)
        setEmpLogData(finalData);
      }),
    )).finally(() =>
        { 
          setIsApiFinished(true)
          setLoaderStatusHandler(false)
        })
  }
    // dispatch(listStockLocationAction(commoncookie, headerLocationId))
    // dispatch(departmentListAction())
  })();
}, [page, pageSize, filterDate,departmentLists]);

  useEffect(() => {
    const dataWithDayName = (employees) => {
      console.log('employees', employees);
      // Pre-calculate day names if they are repetitive and static
      const dayNamesCache = {};

      return employees?.map((employee) => {
        const transformedLogData = {};

        if (Array.isArray(employee?.log_data)) {
          employee?.log_data?.forEach((log) => {
            const dateKey = log.log_date; // Assuming log_date is a string in "YYYY-MM-DD" format

            // Use dateKey to cache day and dayName calculations
            if (!dayNamesCache[dateKey]) {
              const date = new Date(log.log_date);
              const day = date.getDate();
              const dayName = date.toLocaleString('default', {
                weekday: 'short',
              });
              dayNamesCache[dateKey] = `${day}${dayName}`;
            }

            // Direct assignment for performance
            transformedLogData[dayNamesCache[dateKey]] = log.work_hours || null;
          });
        }

        // Efficiently combining objects without spread operator in a hot path
        const result = Object.assign(employee, transformedLogData);
        delete result.log_data; // Consider whether you need to mutate the original data
        console.log('result',result)
        return result;
      });
    };
    const finalRows = dataWithDayName(workReport);
        console.log('finalRows',finalRows)
        const finalData = finalRows?.map((row, index) => ({
          id: index,
          ...row,
        }));
        console.log('finalData',finalData)
        setEmpLogData(finalData);
  },[workReport])

  const requestSearchEmployeeFilter = (val) => {

    // let allDept = list_department.map((d) => d.department);

    setSearchValEmployeeFilter(val);
    dispatch(set_search_location_based_employee([]));

    if (!val) {
      return
    }

    let data = {
      ...monthYear,
      searchString: val
    }



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

  const handleChangeEmployeeName =(val)=>{
    setValue(val)
}

const commonCellStyle = {
  fontFamily: "poppins",
  fontSize: "11px",
  fontWeight: "400",
  color: 'rgba(0, 0, 0, 0.7)',
};

const sharedColumnProps = {
  flex: 1,
  minWidth: 140,
};

  const columns = [
    {field: 'employee_code', headerName: 'Emp Code',...sharedColumnProps ,cellStyle: commonCellStyle,},
    // {field: 'employee_id', headerName: 'Emp.id', width: 100 },
    {field: 'full_name', headerName: 'Name', ...sharedColumnProps,cellStyle: commonCellStyle, renderCell: (params) => formatName(params.row.full_name),},
    {field: 'totalWorkHours', headerName: 'Duration', ...sharedColumnProps , cellStyle: commonCellStyle,},
    {field: 'present', headerName: 'P', ...sharedColumnProps ,  cellStyle: commonCellStyle, },
    {field: 'absent', headerName: 'A', ...sharedColumnProps ,  cellStyle: commonCellStyle, },
    {field: 'leaves', headerName: 'PL', ...sharedColumnProps ,  cellStyle: commonCellStyle,},
    {field: 'halfDay', headerName: 'HD', ...sharedColumnProps, cellStyle: commonCellStyle,},
    {field: 'halfPermission', headerName: 'HP', ...sharedColumnProps ,  cellStyle: commonCellStyle,},
    {field: 'weekOff', headerName: 'WO', ...sharedColumnProps,  cellStyle: commonCellStyle,},
  ];

  const addDateColumns = (startDate, endDate, baseColumns) => {
    const dayAbbreviations = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let currentDate = new Date(startDate);
    endDate = new Date(endDate);

    while (currentDate <= endDate) {
      const dayOfMonth = currentDate.getDate();
      const dayOfWeek = dayAbbreviations[currentDate.getDay()];
      const columnKey = `${dayOfMonth} ${dayOfWeek}`;
      const column = {
        field: dayOfMonth+dayOfWeek,
        headerName: columnKey,
        width: 70,
        align: 'center'
      };
      baseColumns.push(column);
      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
 
    return baseColumns;
  };

  const finalHeader = addDateColumns(filterDate.from, filterDate.to, columns);

  const dataMap = new Map();

  const rowData = Array.from(dataMap.values());
  if (companyBasedEmpDetailsData) {
    companyBasedEmpDetailsData.forEach((log) => {
      const employeeData = dataMap.get(log.employee_id);
      if (employeeData) {
        employeeData[log.log_date] = log.work_hours;
      }
    });
  }

  if (companyBasedEmpDetailsData) {
    companyBasedEmpDetailsData.forEach((log) => {
      const logDate = log.log_date;

      const dateObj = new Date(logDate);
      const date = dateObj.getDate();
      const days = ['S', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
      const dayIndex = dateObj.getDay();
      const day = days[dayIndex];
      const dateDay = date + ' ' + day;

      const column = {field: logDate, headerName: dateDay, width: 60};
      if (!columns.some((col) => col.field === logDate)) {
        columns.push(column);
      }
    });
  }

  columns.sort((a, b) => new Date(a.field) - new Date(b.field));

  const finalColumns = columns.map((column) => ({
    field: column.field,
    headerName: column.headerName,
    width: column.width,
  }));

  const handleChange = (data) => {
    var date_val = data?.target?.value?._d;
    console.log(data?.target?.name,data?.target?.value,'targettednaess');
    if(data?.target?.name == "location") {
      setMonthYear({...monthYear, location : data.target.value});
    }
    if(data?.target?.name == "department") {
      setMonthYear({...monthYear, department : data.target.value});
    }
    setFilterDate({...filterDate, [data.target.name]: date_val});
    if (moment(filterDate.from, 'year') <= moment(filterDate.to, 'year')) {
      if (moment(filterDate.from, 'month') <= moment(filterDate.to, 'month')) {
        if (moment(filterDate.from, 'day') <= moment(filterDate.to, 'day')) {
          setErrMsg({...errMsg, from: '', to: ''});
        } else {
          setErrMsg({...errMsg, [data.target.name]: 'Invalid Date 1'});
        }
      } else {
        setErrMsg({...errMsg, [data.target.name]: 'Invalid Date 2'});
      }
    } else {
      setErrMsg({...errMsg, [data.target.name]: 'Invalid Date 3'});
    }
  };

  const handlePageChange = async (page) => {
    setPage(page)
    console.log(page, "HIH")
  }

  const handlePageSizeChange = async (size) => {
    setPageSize(size)
    console.log(size, "HIHi")
  }

  const ApplyButton = async (value) => {
    setMonthYear({...monthYear,empName:value?.map(v => v?.employee_id)})
    console.log('filterDate.from',typeof filterDate.from);
    const FROM_DATE = moment(filterDate.from, 'year', 'month', 'day').format(
      'YYYY-MM-DD',
    )
    const TO_DATE =moment(filterDate.to, 'year', 'month', 'day').format(
      'YYYY-MM-DD',
    )
if((FROM_DATE === "Invalid date" || TO_DATE === "Invalid date")){
  return alert('Please enter a valid date')
}

    let payLoad = {
      fromDate: FROM_DATE,
      toDate: TO_DATE,
      searchString: '',
      department: monthYear.department[0] === ''  ? list_department.map((d) => d.department)  : monthYear.department,
      location: monthYear.location,
      employee_id: value?.map(v => v?.employee_id)
    };

    const dataWithDayName = (employees) => {
      console.log('employees', employees);
      // Pre-calculate day names if they are repetitive antoDated static
      const dayNamesCache = {};

      return employees?.map((employee) => {
        const transformedLogData = {};

        if (Array.isArray(employee?.log_data)) {
          employee?.log_data?.forEach((log) => {
            const dateKey = log.log_date; // Assuming log_date is a string in "YYYY-MM-DD" format

            // Use dateKey to cache day and dayName calculations
            if (!dayNamesCache[dateKey]) {
              const date = new Date(log.log_date);
              const day = date.getDate();
              const dayName = date.toLocaleString('default', {
                weekday: 'short',
              });
              dayNamesCache[dateKey] = `${day} ${dayName}`;
            }

            // Direct assignment for performance
            transformedLogData[dayNamesCache[dateKey]] = log.work_hours || null;
          });
        }

        // Efficiently combining objects without spread operator in a hot path
        const result = Object.assign(employee, transformedLogData);
        delete result.log_data; // Consider whether you need to mutate the original data
        return result;
      });
    };

    dispatch(
      workDurationAction(payLoad, async (response) => {
        const finalRows = await dataWithDayName(response.data);

        const finalData = await finalRows?.map((row, index) => ({
          id: index,
          ...row,
        }));
        setEmpLogData(finalData);
      }),
    );

    handleFilter(false);
    setSearchVal('');
    setButton()
  };

  const clearButton = () => {
    setSearchVal('')
    handleFilter(false);
    const defaultFrom = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    const lastDayOfPreviousMonth = new Date(date.getFullYear(), date.getMonth(), 0);
    const defaultTo = new Date(lastDayOfPreviousMonth.getFullYear(), lastDayOfPreviousMonth.getMonth(), lastDayOfPreviousMonth.getDate());
    let firstDay = defaultFrom;
    let lastDay = defaultTo;
   
    setFilterDate({
      ...filterDate,
      from: firstDay,
      to: lastDay,
    })
    setMonthYear({
      ...monthYear,
      empName: [''],
     location: [''],
     department: ['']
  })

  };
  const onLocationchange = (e) => {
    const { value } = e.target;
    setMonthYear((prevMonthYear) => ({
      ...prevMonthYear,
      location: value.includes('') ? [''] : value,
    }));
  }
  function ExportCsv(columnHead, rowData, fileName) {
    let csvContent = 'data:text/csv;charset=utf-8,';

    const ignoreFields = [
      'employee_code',
      'full_name',
      'totalWorkHours',
      'present',
      'absent',
      'leaves',
      'halfDay',
      'halfPermission',
      'weekOff',
    ];

    let head = columnHead.filter((item) => !ignoreFields.includes(item.field));
    head.unshift({headerName: 'Days'});

    // Add the headers
    const headers = head.map((h) => h.headerName).join(',');
    csvContent += headers + '\n\n';

    // csvContent += 'Employee Code,,Full Name,,Total Work Hours\n';

    // Loop through each employee
    rowData.forEach((employee) => {
      console.log('employee_logData', employee.log_data);
      // Add employee specific data
      csvContent += `Employee Code - ${employee.employee_code},,, Name - ${employee.full_name},,, Total Work Hours - ${employee.totalWorkHours}\n\n\n`;

      // Add headers for the lod_data head
      const logDataHeaders = [
        'Status',
        'In Time',
        'Out Time',
        'Work Hours',
        'Late By',
        'Early Out By',
        'OT',
        'Shift Name',
      ];
      let logDataRows = logDataHeaders.map(() => []); // Creating an array of arrays to hold data under each heading

      // Process log_data if available
      if (employee.log_data && Array.isArray(employee.log_data)) {
        employee.log_data.forEach((log) => {
          logDataRows[0].push(log.status || ' ');
          logDataRows[1].push(log.in_time || ' ');
          logDataRows[2].push(log.out_time || ' ');
          logDataRows[3].push(log.work_hours || ' ');
          logDataRows[4].push(log.late_in_by || ' ');
          logDataRows[5].push(log.early_out_by || ' ');
          logDataRows[6].push(log.ot || ' ');
          logDataRows[7].push(log.shift_name || ' ');
        });
      }

      // Combining and formatting the log data for CSV output
      logDataHeaders.forEach((header, index) => {
        csvContent += `${header}, ${logDataRows[index].join(',')}\n`;
      });

      // Add a separator for clarity
      csvContent += `\n`;
    });

    // Encode and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', fileName + '.csv');
    document.body.appendChild(link); // Required for FF
    link.click(); // This will download the file
  }

  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // console.log(rowData, "mmmm")
  // const exportToXlsx = async (columnHead, rowData, fileName) => {
  //   // Filter out ignored fields and add 'Days' at the beginning

  //   const ignoreFields = [
  //     'employee_code',
  //     'full_name',
  //     'totalWorkHours',
  //     'present',
  //     'absent',
  //     'leaves',
  //     'halfDay',
  //     'halfPermission',
  //     'weekOff',
  //   ];

  //   let headers = await columnHead.filter(
  //     (item) => !ignoreFields.includes(item.field),
  //   );
  //   headers.unshift({headerName: 'Days', field: 'days'});

  //   let ws_data = [['Monthly Status Report (Detailed Work Duration)']];

  //   // ws_data.push([]);
  //   ws_data.push(headers.map((h) => h.headerName));
  //   ws_data.push([]);

  //   // Loop through each employee and their log_data
  //   rowData.forEach((employee) => {
  //     // Employee's basic info row
  //     ws_data.push([
  //       `Employee Code: ${employee.employee_code}`,
  //       [],
  //       `Name: ${employee.full_name}`,
  //       [],
  //       `Total Work Hours: ${employee.totalWorkHours}`,
  //     ]);
  //     ws_data.push([]);
  //     ws_data.push([]);

  //     // Prepare headers for the log data
  //     const logDataHeaders = [
  //       'Status',
  //       'In Time',
  //       'Out Time',
  //       'Work Hours',
  //       'Late By',
  //       'Early Out By',
  //       'OT',
  //       'Shift Name',
  //     ];

  //     // If there is log data, process each log entry
  //     if (employee.log_data && Array.isArray(employee.log_data)) {
  //       // For each log entry, iterate over logDataHeaders and append the value to ws_data
  //       logDataHeaders.forEach((header) => {
  //         let logRow = [header]; // Start with the header

  //         employee.log_data.forEach((log) => {
  //           // According to the header, push the corresponding log data
  //           switch (header) {
  //             case 'Status':
  //               logRow.push(log.status || '');
  //               break;
  //             case 'In Time':
  //               logRow.push(log.in_time || '');
  //               break;
  //             case 'Out Time':
  //               logRow.push(log.out_time || '');
  //               break;
  //             case 'Work Hours':
  //               logRow.push(log.work_hours || '');
  //               break;
  //             case 'Late By':
  //               logRow.push(log.late_in_by || '');
  //               break;
  //             case 'Early Out By':
  //               logRow.push(log.early_out_by || '');
  //               break;
  //             case 'OT':
  //               logRow.push(log.ot || '');
  //               break;
  //             case 'Shift Name':
  //               logRow.push(log.shift_name || '');
  //               break;
  //             default:
  //               logRow.push('');
  //           }
  //         });

  //         // Append the compiled logRow for this header
  //         ws_data.push(logRow);
  //       });
  //     }

  //     // Add an empty row after each employee's data for better readability
  //     ws_data.push([]);
  //   });

  //   // Create a workbook and add the worksheet
  //   const wb = XLSX.utils.book_new();
  //   const ws = XLSX.utils.aoa_to_sheet(ws_data);

  //   console.log(`ws['A1']`, ws['A1']);

  //   if (ws['A1']) {
  //     if (!ws['A1'].s) {
  //       ws['A1'].s = {};
  //     }
  //     // Apply bold style
  //     ws['A1'].s.font = {bold: true};
  //   } else {
  //     // If A1 doesn't exist, there's a larger issue at play.
  //     console.error('Cell A1 does not exist.');
  //   }

  //   XLSX.utils.book_append_sheet(wb, ws, 'Report');

  //   // Write workbook to binary string and initiate download
  //   const wbout = XLSX.write(wb, {bookType: 'xlsx', type: 'binary'});

  //   function s2ab(s) {
  //     const buf = new ArrayBuffer(s.length);
  //     const view = new Uint8Array(buf);
  //     for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
  //     return buf;
  //   }

  //   saveAs(
  //     new Blob([s2ab(wbout)], {type: 'application/octet-stream'}),
  //     `${fileName}.xlsx`,
  //   );
  // };
 
//  

  function formatTime(time) {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const parsedHours = parseInt(hours, 10);
    const suffix = parsedHours >= 12 ? 'PM' : 'AM';
    const formattedHours = parsedHours % 12 === 0 ? 12 : parsedHours % 12;
    return `${formattedHours}:${minutes} ${suffix}`;
}
const exportToXlsx = async (columnHead, rowData, fileName) => {
  // Filter out ignored fields and add 'Days' at the beginning
  const ignoreFields = [
      'employee_code',
      'full_name',
      'totalWorkHours',
      'present',
      'absent',
      'leaves',
      'halfDay',
      'halfPermission',
      'weekOff',
  ];

  let headers = await columnHead.filter(
    (item) => !ignoreFields.includes(item.field),
);

// Modify headers to include the bold property
headers = headers.map(header => ({
    ...header,
    bold: true,
}));
console.log(headers,'headers');

// Add the "Days" header with bold property
headers.unshift({ headerName: 'Days', field: 'days', bold: true });

  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const reportTitle = `Detailed Work Duration Report  ${formatDate(filterDate.from)} - ${formatDate(filterDate.to)}`;

  const boldStyle = { font: { bold: true } }; 

  let ws_data = [
      [reportTitle],
      [],
      headers.map((h) => ({ t: 's', v: h.headerName, s: { alignment: { horizontal: 'center' }, font: { bold: true } } })),
      [],
  ];

  // Loop through each employee and their log_data
  rowData.forEach((employee) => {
      // Employee's basic info row
      const boldStyle = { font: { bold: true } }; // Style for bold text
      ws_data.push([
          { t: 's', v: `Employee Code: ${employee.employee_code}`, s: boldStyle },
          { t: 's', v: `Name: ${employee.full_name}`, s: boldStyle },
        {},
        {},
          { t: 's', v: `Total Work Hours: ${employee.totalWorkHours  || '00:00'}`, s: boldStyle },
      ]);

      // Prepare headers for the log data
      const logDataHeaders = [
          'Status',
          'In Time',
          'Out Time',
          'Work Hours',
          'Late By',
          'Early Out By',
          'OT',
          'Shift Name',
      ];

      // If there is log data, process each log entry
      if (employee.log_data && Array.isArray(employee.log_data)) {
          logDataHeaders.forEach((header) => {
              let logRow = []; // Start with an empty row

              // According to the header, push the corresponding log data
              switch (header) {
                  case 'Status':
                      logRow.push({ t: 's', v: 'Status', s: { alignment: { horizontal: 'left' } } });
                      employee.log_data.forEach((log) => {
                          logRow.push({ t: 's', v: log.status || '', s: { alignment: { horizontal: 'center' } } });
                      });
                      break;
                  case 'In Time':
                      logRow.push({ t: 's', v: 'In Time', s: { alignment: { horizontal: 'left' } } });
                      employee.log_data.forEach((log) => {
                          logRow.push({ t: 's', v: formatTime(log.in_time) || '', s: { alignment: { horizontal: 'right' } } });
                      });
                      break;
                  case 'Out Time':
                      logRow.push({ t: 's', v: 'out_time', s: { alignment: { horizontal: 'left' } } });
                      employee.log_data.forEach((log) => {
                          logRow.push({ t: 's', v: formatTime(log.out_time) || '', s: { alignment: { horizontal: 'right' } } });
                      });
                      break;
                  case 'Work Hours':
                      logRow.push({ t: 's', v: 'Work Hours', s: { alignment: { horizontal: 'left' } } });
                      employee.log_data.forEach((log) => {
                          logRow.push({ t: 's', v: log.work_hours  || '', s: { alignment: { horizontal: 'right' } } });
                      });
                      break;
                      case 'Late By':
                        logRow.push({ t: 's', v: 'Late By', s: { alignment: { horizontal: 'left' } } });
                        employee.log_data.forEach((log) => {
                            const lateTime = log.late_in_by ? log.late_in_by.slice(0, 5) : ''; // Extract hh:mm from hh:mm:ss
                            logRow.push({
                                t: 's',
                                v: lateTime,
                                s: { alignment: { horizontal: 'right' }, font: { color: { rgb: 'ff4d4d' } } }
                            });
                        });
                  break;
                  case 'Early Out By':
                    logRow.push({ t: 's', v: 'Early Out By', s: { alignment: { horizontal: 'left' } } });
                    employee.log_data.forEach((log) => {
                        const lateTime1 = log.early_out_by ? log.early_out_by.slice(0, 5) : ''; // Extract hh:mm from hh:mm:ss
                        logRow.push({
                            t: 's',
                            v: lateTime1,
                            s: { alignment: { horizontal: 'right' }, font: { color: { rgb: 'ff4d4d' } } }
                        });
                    });
                  break;
                  case 'OT':
                      logRow.push({ t: 's', v: 'OT', s: { alignment: { horizontal: 'left' } } });
                      employee.log_data.forEach((log) => {
                          logRow.push({ t: 's', v: log.ot   || '', s: { alignment: { horizontal: 'right' } } });
                      });
                      break;
                  case 'Shift Name':
                      logRow.push({ t: 's', v: header, s: { alignment: { horizontal: 'left' } } }); // Add header aligned to right
                      employee.log_data.forEach((log) => {
                          logRow.push({ t: 's', v: log[header.toLowerCase()] || '', s: { alignment: { horizontal: 'left' } } });
                      });
                      break;
                  default:
                      logRow.push('');
              }

              // Append the compiled logRow for this header
              ws_data.push(logRow);
          });
      }

      // Add empty rows after each employee's data for better readability
      ws_data.push([]);
      // ws_data.push([]);
  });

  // Create a workbook and add the worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  
  const headerRange = XLSX.utils.encode_range({s: {c: 0, r: 0}, e: {c: headers.length - 1, r: 0}});
  ws["!merges"] = [{s: {c: 0, r: 0}, e: {c: headers.length - 1, r: 0}}]; // Merge the first row
  
  // Center alignment and bold for the merged cell
  const mergedCellAddress = XLSX.utils.encode_cell({ c: 0, r: 0 }); // Merged cell A1
  if (!ws[mergedCellAddress]) ws[mergedCellAddress] = {};
  if (!ws[mergedCellAddress].s) ws[mergedCellAddress].s = {};
  ws[mergedCellAddress].s.alignment = { horizontal: 'center', vertical: 'center' };
  ws[mergedCellAddress].s.font = { bold: true };
  
  // Apply font size and style to the entire worksheet
  ws['!cols'] = [{ wch: 25 }, ...headers.map(_ => ({ wch: 9 }))]; // Set column widths
  ws['!rows'] = [{ hpx: 25 }, ...Array(ws_data.length - 1).fill({ hpx: 14 })]; // Set row heights
  
  // Set font size and type for the entire worksheet
  const defaultFont = { size: 10, name: 'Calibri' };
  ws['!rows'].forEach(row => row.s = { font: defaultFont });
  
  // Set font size, type, and style for the header row
  ws['!rows'][2].s = { font: { ...defaultFont, bold: true } };
  
  // Align A3 cell text to the left
  const cellA3 = XLSX.utils.encode_cell({ c: 0, r: 2 }); // Cell A3
  if (!ws[cellA3]) ws[cellA3] = {};
  if (!ws[cellA3].s) ws[cellA3].s = {};
  ws[cellA3].s.alignment = { horizontal: 'left' };
  
  XLSX.utils.book_append_sheet(wb, ws, 'Report');
  
  // Write workbook to binary string and initiate download
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
  
  function s2ab(s) {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
      return buf;
  }

  function formatDate(date) {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString();
      return `${day}/${month}/${year}`;
  }
  
  saveAs(
      new Blob([s2ab(wbout)], { type: 'application/octet-stream' }),
      `${fileName}.xlsx`,
  );
};

  console.log(empLogData,"empLogData")
    
  const monthMap = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonthIndex = currentDate.getMonth();
const previousMonths = [];
for (let i = 1; i <= 4; i++) {
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

console.log(thirdPrevMonth.slice(0,3),secondPrevMonth, firstPrevMonth, PrevMonth,'mayankkk');

const getPreviousMonthRange = () => {
  const currentDate = new Date();
  const firstDayOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const lastDayOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
  return { from: firstDayOfPreviousMonth, to: lastDayOfPreviousMonth };
};

const handlePreviousMonthClick = (data) => {
  setSearchVal("");
  console.log(data,'datahandle');
  const month = data.split(' ')[0];
  const year = data.split(' ')[1];
  const  {startDate,endDate}=getStartAndEndDate(month,year)
  console.log(startDate,'startdateee');
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  // setButton(startDateObj.getMonth())
  // startDateObj.setDate(startDateObj.getDate() + 1);
  // const formattedStartDate = startDateObj.toISOString().split('T')[0];
  // const formattedEndDate = endDateObj.toISOString().split('T')[0];
  // console.log(formattedStartDate,formattedEndDate,'sedddd');
  let payLoad = {
    fromDate: moment(startDateObj, 'year', 'month', 'day').format(
      'YYYY-MM-DD',
    ),
    toDate: moment(endDateObj, 'year', 'month', 'day').format(
      'YYYY-MM-DD',
    ),
    searchString: '',
    pageCount: 0,
    numPerPage: pageSize
  };
  setPage(0)
  setFilterDate({
    from: startDateObj,
    to: endDateObj
  })
  // const dataWithDayName = (employees) => {
  //   console.log('employees', employees);
  //   // Pre-calculate day names if they are repetitive and static
  //   const dayNamesCache = {}; 

  //   return employees?.map((employee) => {
  //     const transformedLogData = {};

  //     if (Array.isArray(employee?.log_data)) {
  //       employee?.log_data?.forEach((log) => {
  //         const dateKey = log.log_date; // Assuming log_date is a string in "YYYY-MM-DD" format

  //         // Use dateKey to cache day and dayName calculations
  //         if (!dayNamesCache[dateKey]) {
  //           const date = new Date(log.log_date);
  //           const day = date.getDate();
  //           const dayName = date.toLocaleString('default', {
  //             weekday: 'short',
  //           });
  //           dayNamesCache[dateKey] = `${day} ${dayName}`;
  //         }

  //         // Direct assignment for performance
  //         transformedLogData[dayNamesCache[dateKey]] = log.work_hours || null;
  //       });
  //     }

  //     // Efficiently combining objects without spread operator in a hot path
  //     const result = Object.assign(employee, transformedLogData);
  //     delete result.log_data; // Consider whether you need to mutate the original data
  //     console.log('result',result)
  //     return result;
  //   });
  // };
  // dispatch(
  //   workDurationAction(payLoad, async (response) => {
  //     const finalRows = await dataWithDayName(response.data);
  //     console.log('finalRows',finalRows)
  //     const finalData = await finalRows?.map((row, index) => ({
  //       id: index,
  //       ...row,
  //     }));
  //     console.log('finalData',finalData)
  //     setEmpLogData(finalData);
  //   }),
  // );
};

const getStartAndEndDate = (monthName, year) => {

  const monthMap = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };
  
  const monthNumber = monthMap[monthName.toLowerCase()];
  const startDate = new Date(year, monthNumber, 1);
 
  const endDate = new Date(year, monthNumber + 1, 0);

  return { startDate, endDate };
}

  const cancelSearch = (e) => {
    setSearchVal("");
    dispatch(setWorkdurationReportAction({ data: [], numRows: 0 }))
    setPage(0)
    setPageSize(20)
    let payLoad = {
      fromDate: moment(filterDate.from, 'year', 'month', 'day').format(
        'YYYY-MM-DD',
      ),
      toDate: moment(filterDate.to, 'year', 'month', 'day').format(
        'YYYY-MM-DD',
      ),
      searchString: "",
      pageCount: page,
      numPerPage: pageSize,
      department: monthYear.department[0] === ''  ? list_department.map((d) => d.department)  : monthYear.department,
    };
    dispatch(get_workdurationReportAction(
      payLoad,
      setModalTypeHandler,
      setLoaderStatusHandler
    )
    )
  };
const requestSearch = (e) => {
  let val = e.target.value;
  setSearchVal(val);
  setPage(0)
  setPageSize(20)
  setIsApiFinished(false);
  setLoaderStatusHandler(true);
  dispatch(setWorkdurationReportAction({ data: [], numRows: 0 }))
  let payLoad = {
    fromDate: moment(filterDate.from, 'year', 'month', 'day').format(
      'YYYY-MM-DD',
    ),
    toDate: moment(filterDate.to, 'year', 'month', 'day').format(
      'YYYY-MM-DD',
    ),
    searchString: val,
    pageCount: page,
    numPerPage: pageSize,
    department: monthYear.department[0] === ''  ? list_department.map((d) => d.department)  : monthYear.department,
  };
  dispatch(get_workdurationReportAction(
    payLoad,
    setModalTypeHandler,
    (loaderStatus) => {
        setLoaderStatusHandler(loaderStatus);
        // when your loader turns false => API done
        if (loaderStatus === false) {
          setIsApiFinished(true);
        }
      },
  )
  )
};
  const selectedRole = storage?.role_name;
  const reportExport = UserRightsAuthorization(menuAccess[selectedRole], 'reports__attendance__work_duration_report', 'can_export')
  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | Work Duration Reports </title>
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
            Work Duration Reports
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
              {/* <IconButton size='small'> */}
                <CommonFilter
                  fromTo={true}
                  from={filterDate.from}
                  to={filterDate.to}
                  count={count}
                  monthYear={monthYear}
                  onLocationchange={onLocationchange}
                  stocklocation={stocklocation}
                  departmentList={list_department}
                  handleChange={handleChange}
                  handleClose={handleFilter}
                  open={filterOpen}
                  clearButton={clearButton}
                  ApplyButton={ApplyButton}
                  companySearch={false}
                  locationFilter={true}
                  shouldFetchData={true}
                />
              {/* </IconButton> */}
            </Tooltip>
            {reportExport && (
              <Tooltip title='Export' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement='top'>
                <IconButton
                  size='small'
                  onClick={async () => {
                    let formData = {
                      fromDate: moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
                      toDate: moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
                      searchString: searchVal,
                      exportData: true,
                      department: monthYear.department[0] === '' ? list_department.map((d) => d.department) : monthYear.department,
                      employee_id: monthYear.empName,
                    };
                    const { data: resData } = await customFetch(
                      API_URLS.ATTENDANCE_WORK_DURATION_REPORTS,
                      'POST',
                      formData,
                    );
                    await exportToXlsx(finalHeader, resData.data, 'Work Duration Reports');
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
              rows={empLogData}
              columns={finalHeader}
              pageSizeOptions={[20, 50, 100]}
              paginationMode='server'
              density='compact'
              disableRowSelectionOnClick
              disableExtendRowFullWidth
              rowCount={workReportCount}
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
    </>
  );
};

export default WorkDurationReportTest;