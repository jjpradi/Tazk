import React, { useContext, useEffect } from 'react';
import DataGridTemp from 'components/dataGridTemp';
import { getCompanyBasedEmpAction, getCompanyBasedEmpDetailsAction, get_CompanyBasedEmpAction, get_CompanyBasedEmpDetailsAction, setCompanyBasedEmpAction, setCompanyBasedEmpDetailsAction } from 'redux/actions/attendance_actions';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import FilterPossale from 'pages/pointofsale/posSale/FilterPossale';
import CommonFilter from 'components/pos/payment_section/CommonFilter';
import moment from 'moment';
import { Helmet } from 'react-helmet-async';
import {titleURL} from 'http-common';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import { departmentListAction } from 'redux/actions/userCreation_actions';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    Chip,
    Button,
    Fade,
    Grid,
    IconButton,
    Stack,
    Tooltip,
    Typography,
    Breadcrumbs,
    Link,
  } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
  import {DataGrid} from '@mui/x-data-grid';
  import FileDownloadIcon from '@mui/icons-material/FileDownload';
  import {useCustomFetch} from 'utils/useCustomFetch';
  import * as XLSX from 'xlsx-js-style';
  import {saveAs} from 'file-saver';
import CommonSearch from 'utils/commonSearch';
import { listDepartment } from 'redux/actions/shifts.actions';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { maxHeight } from 'utils/pageSize';
import API_URLS from '../../../utils/customFetchApiUrls';
import apiCalls from 'utils/apiCalls';
import { formatName } from 'utils/nameFormatter';
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';


const AttendanceReports = () => {
    const navigate = useNavigate();

    const [companyBasedEmpData, setCompanyBasedEmpData] = useState()
    const customFetch = useCustomFetch();
    const [companyBasedEmpDetailsData, setCompanyBasedEmpDetailsData] = useState()
    const date = new Date();
    const defaultFrom = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    const lastDayOfPreviousMonth = new Date(date.getFullYear(), date.getMonth(), 0);
    const defaultTo = new Date(lastDayOfPreviousMonth.getFullYear(), lastDayOfPreviousMonth.getMonth(), lastDayOfPreviousMonth.getDate());
    const [filterDate, setFilterDate] = useState({
        from: defaultFrom,
        to: defaultTo
    });
    const [errMsg, setErrMsg] = useState({
        from: '',
        to: '',
    });
    const [count, setCount] = useState(0)
    const [filterOpen, handleFilter] = useState(false);
    const [searchVal, setSearchVal] = useState('')
    const [page, setPage] = useState(0)
    const [button, setButton] = useState('4')
    const [pageSize, setPageSize] = useState(20)
    const [departmentLists, setDepartmentList] = useState(false);
    const [departmentListsArray, setDepartmentListArray] = useState([]);
    const currentMonth = moment().startOf('month');
    const firstDateOfMonth = currentMonth.format('YYYY-MM-DD');
    const lastDateOfMonth = currentMonth.endOf('month').format('YYYY-MM-DD');
     const [isApiFinished, setIsApiFinished] = useState(false);
    const [monthYear, setMonthYear] = React.useState({
        empName: [''],
        location: [''],
        department: [''],
        from: moment(firstDateOfMonth),
        to: moment(lastDateOfMonth),
    });


  

    const dispatch = useDispatch();
    const storage = getsessionStorage();

    const { attendanceReducer : {companyBasedEmp, companyBasedEmpDetails, companyBasedEmpCount},
    stockLocationReducer: { stocklocation },
     UserCreationReducer: {departmentList} ,ShiftsReducer: { list_department }, rbacReducer: {menuAccess = []} } = useSelector((state) => state);

    useEffect(() => {

      let data = {
        searchString:''
       }
  
        apiCalls(dispatch(listDepartment(data, (response) => {
        // console.log("response",response)
        if (response.length) {
          //  console.log("response.length",response.length)
          setDepartmentList(true)
          setDepartmentListArray(response)
        }
  
      })));

    }, []);

    useEffect(() => {
      if(departmentLists){
        setIsApiFinished(false);
        //console.log('ddd',page,pageSize)
        let payLoad = {
            fromDate : moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD') ,
            toDate : moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
            searchString: '',
            pageCount: page,
            numPerPage: pageSize,
            employee_id: [],
            department: monthYear.department[0] === ''  ? list_department.map((d) => d.department)  : monthYear.department,
            location: []
        }
        setIsApiFinished(false);
        setLoaderStatusHandler(true);
         apiCalls(
        dispatch(getCompanyBasedEmpAction(payLoad, (response, resData) => {
            if (response === 200) {
                setCompanyBasedEmpData(resData.data)
                dispatch(getCompanyBasedEmpDetailsAction(payLoad,(response, resData) => {
                    if (response === 200) {
                        setCompanyBasedEmpDetailsData(resData)
                    }
                }))
            }
        }))
      ).finally(() =>
        { 
          setIsApiFinished(true)
          setLoaderStatusHandler(false)
        })
        dispatch(listStockLocationAction(commoncookie, headerLocationId))
      }
    },[page, pageSize,departmentLists])

    useEffect(() => {
      setCompanyBasedEmpData(companyBasedEmp)
      setCompanyBasedEmpDetailsData(companyBasedEmpDetails)
    }, [companyBasedEmp, companyBasedEmpDetails])



    const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(
        CreateNewButtonContext,
      );

    const onLocationchange = (e) => {
        const { value } = e.target;
        setMonthYear((prevMonthYear) => ({
            ...prevMonthYear,
            location: value.includes('') ? [''] : value,
        }));
    }
    
    const commonCellStyle = {
      fontFamily: "poppins",
      fontSize: "11px",
      fontWeight: "400",
      color: 'rgba(0, 0, 0, 0.7)',
    };
    
    console.log(companyBasedEmpDetailsData,'companyBasedEmpDetailsData');
    
    const columns = [
        // { field: 'employee_id', headerName: 'Emp.Id', width: 100 },
        { field: 'id', headerName: 'S. No', width: 100,cellStyle: commonCellStyle, },
        { field: 'employee_code', headerName: 'Emp Code', width: 100,cellStyle: commonCellStyle, },
        {
            field: 'full_name',
            headerName: 'Name',
            width: 120,
            cellStyle: commonCellStyle,
            renderCell: (params) => formatName(params.row.full_name),
        },
        { field: 'pl_balance', headerName: 'PL Balance', width: 100 ,cellStyle: commonCellStyle,},
        { field: 'attendancePercentage', headerName: 'Att %', width: 150,cellStyle: commonCellStyle, },
        { field: 'present', headerName: 'P', width: 50 ,cellStyle: commonCellStyle,},
        { field: 'absent', headerName: 'A', width: 50 ,cellStyle: commonCellStyle,},
        { field: 'leaves', headerName: 'PL', width: 50 ,cellStyle: commonCellStyle,},
        { field: 'halfDay', headerName: '1/2P', width: 50 ,cellStyle: commonCellStyle,},
        // { field: 'halfPermission', headerName: 'HP', width: 50 },
        { field: 'weekOff', headerName: 'WO', width: 50 ,cellStyle: commonCellStyle,},
        { field: 'holidays', headerName: 'H', width: 50 ,cellStyle: commonCellStyle,},
        { field: 'pay_days', headerName: 'Pay Days', width: 50 ,cellStyle: commonCellStyle,}
        // Add additional columns for log dates
    ];
    
    // Create a map to store data for each employee
    const dataMap = new Map();
    // Initialize the map with employee data
    if (companyBasedEmpData) {
        companyBasedEmpData?.forEach(employee => {
           if (employee.deleted === 1 && employee.present === 0) return;
            dataMap.set(employee.employee_id, {
                employee_id: employee.employee_id,
                employee_code: employee.employee_code,
                full_name: employee.full_name,
                pl_balance: employee.pl_balance,
                present: employee.present,
                absent: employee.absent,
                leaves: employee.leaves,
                halfDay: employee.halfDay,
                halfPermission: employee.halfPermission,
                weekOff: employee.weekOff,
                holidays: employee.holidays,
                pay_days: employee.pay_days,
                deleted: employee.deleted,
            });
        });
    }
    
    // Populate the map with log data
    if(Array.isArray(companyBasedEmpDetailsData)) {
      companyBasedEmpDetailsData.forEach(log => {
          const employeeData = dataMap.get(log.employee_id);
          if (employeeData) {
              employeeData[log.log_date] = log.status;
          }
      });
  }
    
    // Convert map values to an array
    const rowData = Array.from(dataMap.values());
    
    // Add additional columns for log dates
    if(Array.isArray(companyBasedEmpDetailsData)){
        companyBasedEmpDetailsData?.forEach(log => {
            const logDate = log.log_date;

            const dateObj = new Date(logDate);
            const date = dateObj.getDate(); 
            const days = ['S', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
            const dayIndex = dateObj.getDay();
            const day = days[dayIndex];
            const dateDay = date+ ' ' +day

            const column = { field: logDate, headerName: dateDay, width: 60 };
            if (!columns.some(col => col.field === logDate)) {
                columns.push(column);
            }
        });
    }
    
    // Sort the columns by date
    columns.sort((a, b) => new Date(a.field) - new Date(b.field));


    
    const finalColumns = columns.map(column => ({
        field: column.field,
        headerName: column.headerName,
        width: column.width
    }));
    
      
    const finalRows = rowData.map((row, index) => ({
    id: index + 1, // Each row requires a unique id
    ...row
    }));
  let attendanceData = []
  if (!companyBasedEmpDetailsData || companyBasedEmpDetailsData.length === 0) {
    const attendanceData = finalRows.map(emp => {
      return {
        ...emp,
        attendancePercentage: 0
      };
    });
  } else {
    const logDates = companyBasedEmpDetailsData?.map(item => new Date(item?.log_date));

    // console.log("logDates",logDates)
    if (logDates.length) {
      const maxLogDate = new Date(Math.max(...logDates));
      console.log(maxLogDate, 'totalDays');

      const totalDays = maxLogDate.getDate();

      // console.log("totalDays",totalDays)
      attendanceData = finalRows.map(emp => {
        // console.log("finalRows",finalRows)
//         const attendedDays = companyBasedEmpDetailsData.filter(log => log.employee_code === emp.employee_code && log.status === 'P'  ).length;
//         console.log("companyBasedEmpDetailsData",companyBasedEmpDetailsData)
// console.log("attendedDays",attendedDays)
        const attendancePercentage = totalDays > 0 ? (emp.pay_days / totalDays) * 100 : 0;

        return {
          ...emp,
          attendancePercentage: attendancePercentage > 100 ? 100 : attendancePercentage.toFixed(2)
        };
      });
    }
  }
    

    const handleChange = (data) => {
        if(data?.target?.name == "location") {
            setMonthYear({...monthYear, location : data.target.value});
          }
          if(data?.target?.name == "department") {
            setMonthYear({...monthYear, department : data.target.value});
          }
        var date_val = data?.target?.value?._d;
        setFilterDate({ ...filterDate, [data.target.name]: date_val });
        if (moment(filterDate.from, 'year') <= moment(filterDate.to, 'year')) {
            if (moment(filterDate.from, 'month') <= moment(filterDate.to, 'month')) {
            if (moment(filterDate.from, 'day') <= moment(filterDate.to, 'day')) {    
                setErrMsg({ ...errMsg, from: '', to: '' });
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

    const ApplyButton = async (val) => {
      setMonthYear({...monthYear,empName:val?.map(v => v?.employee_id)})
        setButton()
        setSearchVal('')
        let payLoad = {
          fromDate : moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD') ,
          toDate : moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
          searchString: '',
          pageCount: 0,
          numPerPage: pageSize,
          employee_id: val?.map(v => v?.employee_id),
          department: monthYear.department[0] === ''  ? list_department.map((d) => d.department)  : monthYear.department,
          location: monthYear.location
        }

        dispatch(getCompanyBasedEmpAction(payLoad, (response, resData) => {
            if (response === 200) {
                setCompanyBasedEmpData(resData.data)
                dispatch(getCompanyBasedEmpDetailsAction(payLoad,(response, resData) => {
                    if (response === 200) {
                        setCompanyBasedEmpDetailsData(resData)
                    }
                }))
            }
        }))

        handleFilter(false)
        setSearchVal('')
        setButton()
    };

    const clearButton = () => {
      setButton('4')
      setSearchVal('')
      handleFilter(false)
        setFilterDate({
          ...filterDate,
          from: defaultFrom,
          to: defaultTo,
        });
        setMonthYear({
          ...monthYear,
          empName: [''],
          location: [''],
          department: [''],
          fromDate: moment(defaultFrom).format('YYYY-MM-DD'),
          toDate: moment(defaultTo).format('YYYY-MM-DD'),
      })

        let payLoad = {
          fromDate : moment(defaultFrom, 'year', 'month', 'day').format('YYYY-MM-DD') ,
          toDate : moment(defaultTo, 'year', 'month', 'day').format('YYYY-MM-DD'),
          searchString: '',
          pageCount: page,
          numPerPage: pageSize,
          employee_id: [],
          department: monthYear.department[0] === ''  ? list_department.map((d) => d.department)  : monthYear.department,
          location: []
      }
      
      dispatch(getCompanyBasedEmpAction(payLoad, (response, resData) => {
          if (response === 200) {
              setCompanyBasedEmpData(resData.data)
              dispatch(getCompanyBasedEmpDetailsAction(payLoad,(response, resData) => {
                  if (response === 200) {
                      setCompanyBasedEmpDetailsData(resData)
                  }
              }))
          }
      }))
      dispatch(listStockLocationAction(commoncookie, headerLocationId))
    }

    const handlePageChange = async (page) => {
        setPage(page)
    }

    const handlePageSizeChange = async (size) => {
        setPageSize(size)
    }


    const exportToXlsx = async (columns, rows, fileName) => {
        console.log("Columns:", columns);
        console.log("Rows:", rows);
    
        const data = [];
    
        // Create first row with "Attendance Report" text
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const reportTitle = `Attendance Reports  ${formatDate(filterDate.from)} - ${formatDate(filterDate.to)}`;
        const titleCellStyle = { font: { bold: true }, alignment: { horizontal: 'center', vertical: 'center' } };
        data.push([{ v: reportTitle, s: titleCellStyle }]);
        for (let i = 1; i < columns.length; i++) {
            data[0].push({ v: '', s: titleCellStyle });
        }
    
        // Create header row
        const headerRow = columns.map((column, index) => {
            let alignment;
            if (index === 0 || index === 1) {
                alignment = { horizontal: 'left', vertical: 'center' };
            } else {
                alignment = { horizontal: 'center', vertical: 'center' };
            }
            return { v: column.headerName, s: { font: { bold: true }, alignment } };
        });
        data.push(headerRow);
    
        if (rows) {
            // Create data rows
            rows.forEach((row, rowIndex) => {
                const rowData = [];
                columns.forEach((column, columnIndex) => {
                    const cellValue = row[column.field] !== undefined ? row[column.field] : '';
                    let alignment;
                    if (columnIndex === 0 || columnIndex === 1) {
                        alignment = { horizontal: 'left', vertical: 'center' };
                    } else {
                        alignment = { horizontal: 'center', vertical: 'center' };
                    }
                    const cellStyle = { alignment, font: {} }; // Initialize font property
                    if (columnIndex === 3) { // Check if it's the D column
                        Object.assign(cellStyle.font, { bold: true }); // Assign bold to font property
                    }
                    if (rowIndex > -1 && (cellValue === "A" || cellValue === "1/2P" || cellValue === "P1/2P")) {
                        // fixed parentheses
                        Object.assign(cellStyle.font, { color: { rgb: "ff4d4d" } }); // Apply red color if needed
                    }
                    rowData.push({ v: cellValue, s: cellStyle });
                });
                data.push(rowData);
            });
        }
    
        // Create worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(data);
    
        // Set column widths
        const columnWidths = columns.map((column, index) => {
            if (index === 0) { // A and B columns
                return { wch: 12 }; // Adjust the width as needed
            } else if (index === 1) {
                return { wch: 15 };
            } else if (index === 2 || index === 3 || index === 4 || index === 5 || index === 6 || index === 7) {
                return { wch: 4 };
            } else {
                return { wch: 6.3 }; // Fixed width for all other columns
            }
        });
        worksheet['!cols'] = columnWidths;
    
        // Increase height of first row
        worksheet['!rows'] = [{ hpt: 20 }]; // Adjust the value of 'hpt' as per your requirement
    
        // Merge the first cell across all columns
        const range = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } });
        worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } }];
    
        // Generate Excel file
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
        function formatDate(date) {
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear().toString();
            return `${day}/${month}/${year}`;
        }
    
        // Write workbook to binary string and initiate download
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, fileName + '.xlsx');
    };
    
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
    setSearchVal('')
    setPage(0)
    // setPageSize(20)
    console.log(data,'datahandle');
    const month = data.split(' ')[0];
    const year = data.split(' ')[1];
    const  {startDate,endDate}=getStartAndEndDate(month,year)
    console.log(startDate,'startdateee');
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    setFilterDate({...filterDate,from: startDate,
      to: endDate})
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
      numPerPage: pageSize,
      employee_id: [],
      department: monthYear.department[0] === ''  ? list_department.map((d) => d.department)  : monthYear.department,
      location: []
    };
    dispatch(getCompanyBasedEmpAction(payLoad, (response, resData) => {
      if (response === 200) {
          setCompanyBasedEmpData(resData.data)
          dispatch(getCompanyBasedEmpDetailsAction(payLoad,(response, resData) => {
              if (response === 200) {
                  setCompanyBasedEmpDetailsData(resData)
              }
          }))
      }
  }))
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

  const requestSearch = (e) => {
    let val = e.target.value;
    setSearchVal(val)

    setIsApiFinished(false);
    setLoaderStatusHandler(true);

    dispatch(setCompanyBasedEmpAction({ data: [], numRows: 0 }));
    dispatch(setCompanyBasedEmpDetailsAction([]))
    let payLoad = {
      fromDate: moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
      toDate: moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
      searchString: val,
      pageCount: page,
      numPerPage: pageSize,
      employee_id: [],
     department: monthYear.department[0] === ''  ? list_department.map((d) => d.department)  : monthYear.department,
      location: []
    }
    dispatch(get_CompanyBasedEmpAction(payLoad, setModalTypeHandler, 
        (loaderStatus) => {
        setLoaderStatusHandler(loaderStatus);
        // when your loader turns false => API done
        if (loaderStatus === false) {
          setIsApiFinished(true);
        }
      },
    ))
    dispatch(get_CompanyBasedEmpDetailsAction(payLoad, setModalTypeHandler, setLoaderStatusHandler))

  };

  const cancelSearch = () => {
    setSearchVal('')
    dispatch(setCompanyBasedEmpAction({ data: [], numRows: 0 }));
    dispatch(setCompanyBasedEmpDetailsAction([]))
    let payLoad = {
      fromDate: moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
      toDate: moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
      searchString: '',
      pageCount: page,
      numPerPage: pageSize,
      employee_id: [],
      department: monthYear.department[0] === ''  ? list_department.map((d) => d.department)  : monthYear.department,
      location: []
    }
    dispatch(get_CompanyBasedEmpAction(payLoad, setModalTypeHandler, setLoaderStatusHandler))
    dispatch(get_CompanyBasedEmpDetailsAction(payLoad, setModalTypeHandler, setLoaderStatusHandler))

  };
    const selectedRole = storage?.role_name;
    const reportExport = UserRightsAuthorization(menuAccess[selectedRole], 'reports__attendance__attendance_reports', 'can_export')
    
    return (
      // <>
      // <Helmet>
      //   <meta charSet='utf-8' />
      //   <title> {titleURL} | Attendance Reports </title>
      // </Helmet>
      //     <DataGridTemp 
      //         // data={row} 
      //         // columns={columns1}
      //         data={finalRows}
      //         columns={finalColumns}
      //         rowData={finalRows}
      //         columnData={finalColumns}
      //         exportData={true}
      //         pageSize={pageSize}
      //         page={page}
      //         title={'Attendance Reports'}
      //         attendanceReports='attendanceReports'
      //         type='filter'
      //         handlePreviousMonthClick={handlePreviousMonthClick}
      //         filter={
      //             <div style={{ display: 'flex' }}>
      //                 <CommonFilter
      //                     fromTo={true}
      //                     from={filterDate.from}
      //                     to={filterDate.to}
      //                     count={count}
      //                     handleChange={handleChange}
      //                     handleClose={handleFilter}
      //                     open={filterOpen}
      //                     monthYear={monthYear}
      //                     onLocationchange={onLocationchange}
      //                     stocklocation={stocklocation}
      //                     departmentList={list_department}
      //                     clearButton = {clearButton}
      //                     ApplyButton={ApplyButton}
      //                 />
      //             </div>
      //         }
      //         onPageChange={(page) => handlePageChange(page)}
      //         onPageSizeChange={(size) => handlePageSizeChange(size)}
      //         rowCount={companyBasedEmpCount}
      //     />
      // </>
      <>
        <Helmet>
          <meta charSet='utf-8' />
          <title> {titleURL} | Attendance Reports </title>
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
            <Typography sx={{ fontWeight: 600, fontSize: '15px', whiteSpace: 'nowrap' }}>
              Attendance Reports
            </Typography>

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
                    locationFilter={true}
                    count={count}
                    handleChange={handleChange}
                    handleClose={handleFilter}
                    open={filterOpen}
                    monthYear={monthYear}
                    onLocationchange={onLocationchange}
                    stocklocation={stocklocation}
                    departmentList={list_department}
                    clearButton={clearButton}
                    ApplyButton={ApplyButton}
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
                        employee_id: monthYear.empName,
                        department: monthYear.department[0] === '' ? list_department.map((d) => d.department) : monthYear.department,
                        location: [],
                        exportData: true,
                      };
                      const { data: resData } = await customFetch(
                        API_URLS.GET_COMPANY_BASED_EMPLOYEE,
                        'POST',
                        formData,
                      );
                      await exportToXlsx(finalColumns, attendanceData, 'Attendance Reports');
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
                rows={attendanceData}
                columns={finalColumns}
                pageSizeOptions={[20, 50, 100]}
                paginationMode='server'
                density='compact'
                disableRowSelectionOnClick
                disableExtendRowFullWidth
                rowCount={companyBasedEmpCount || 0}
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

export default AttendanceReports;