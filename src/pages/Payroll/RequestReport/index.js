import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { Box, Breadcrumbs, Button, Card, Chip, Fade, Grid, IconButton, InputAdornment, Link, Stack, TextField, Tooltip, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import {
  filterRequestReportAction,
  getRequestHistoryAction, listDepartment, SearchrequestReportAction, setSearchrequestReportAction
} from '../../../redux/actions/shifts.actions';
import apiCalls from 'utils/apiCalls';
import {  maxHeight} from 'utils/pageSize';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { commonDateFormat, commonDateFormat1 } from 'utils/getTimeFormat';
import { formatName } from 'utils/nameFormatter';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import CommonFilter from 'components/pos/payment_section/CommonFilter';
import moment from 'moment';
import CommonSearch from 'utils/commonSearch';
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import { departmentListAction } from 'redux/actions/userCreation_actions';
import { ExportCsv } from '@material-table/exporters';
import GetAppIcon from '@mui/icons-material/GetApp';
import { FilterAlt } from '@mui/icons-material';
import {DataGrid} from '@mui/x-data-grid';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx-js-style';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

const RequestReport = () => {
  const navigate = useNavigate();
  const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(
    CreateNewButtonContext,
  );
  const dispatch = useDispatch();
  const {
    ShiftsReducer: { requestHistory, search_request_reportData, search_request_reportCount ,list_department}, stockLocationReducer: { stocklocation }, UserCreationReducer: { departmentList }, rbacReducer: {menuAccess = []}
  } = useSelector((state) => state);
  console.log('requestttt', search_request_reportCount);

  const Updatedsearch_request_reportData = search_request_reportData?.map((item) => ({
    ...item,
    id: item.leaveId, 
  }));

  const storage = getsessionStorage();
  const [searchVal, setsearchVal] = useState("")
  const yesterday = new Date();
  const [page, setPage] = useState(0)
  yesterday.setDate(yesterday.getDate() - 1);
  const date = new Date();
  const defaultFrom = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const lastDayOfPreviousMonth = new Date(date.getFullYear(), date.getMonth(), 0);
  const defaultTo = new Date(lastDayOfPreviousMonth.getFullYear(), lastDayOfPreviousMonth.getMonth(), lastDayOfPreviousMonth.getDate());
  console.log(defaultFrom, defaultTo, 'reqreport');
  yesterday.setDate(yesterday.getDate() - 1);

  const [filterDate, setFilterDate] = useState({
    from: defaultFrom,
    to: defaultTo
  })
  const [errMsg, setErrMsg] = useState({
    from: '',
    to: '',
  });
  const [pageCount, setPageCount] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [button, setButton] = useState('4');
  const [filterOpen, handleFilter] = useState(false);
  const currentMonth = moment().startOf('month');
  const firstDateOfMonth = currentMonth.format('YYYY-MM-DD');
  const lastDateOfMonth = currentMonth.endOf('month').format('YYYY-MM-DD');
  const [isApiFinished, setIsApiFinished] = useState(false);
  const [monthYear, setMonthYear] = React.useState({
    empName: [],
    location: stocklocation.length === 1 ? [''] : [''],
    department: [''],
    from: moment(firstDateOfMonth),
    to: moment(lastDateOfMonth),
  });
  // const [count, setCount] = useState(0)
  const [flag, setFlag] = useState(false)
  const [previousDate, setPreviousDate] = useState({
    from: defaultFrom,
    to: defaultTo
  });

  const [departmentLists, setDepartmentList] = useState(false);
  const [departmentListsArray, setDepartmentListArray] = useState([]);

  useEffect(() => {

    let data = {
      searchString:''
     }
     apiCalls(
    dispatch(listDepartment(data, (response) => {
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
      const startDateOfMonth = moment().startOf('month').format('YYYY-MM-DD');
      const endDateOfMonth = moment().endOf('month').format('YYYY-MM-DD');
      console.log(startDateOfMonth, endDateOfMonth, 'startendddd');
      dispatch(setSearchrequestReportAction({ data: [], numRows: 0 }));
      let data
      if (!flag) {
        data = {
          fromDate: moment(filterDate.from).format('YYYY-MM-DD'),
          toDate: moment(filterDate.to).format('YYYY-MM-DD'),
          pageCount: pageCount,
          numPerPage: pageSize,
          searchString: searchVal,
          employee_id: monthYear.empName,
          department: monthYear.department.length === 0 ? list_department.map((d) => d.department)  : monthYear.department,
         location: monthYear.location > 0 ? monthYear.location : []
        }
      }
      else {
        data = {
          fromDate: defaultFrom,
          toDate: defaultTo,
          pageCount: pageCount,
          numPerPage: pageSize,
          searchString: searchVal,
          employee_id: [],
          department: monthYear.department.length === 0 ? list_department.map((d) => d.department)  : monthYear.department,
          location: []
        }
      }
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(filterRequestReportAction(data, setModalTypeHandler, setLoaderStatusHandler))
      ).finally(() => setIsApiFinished(true));
      dispatch(listStockLocationAction(commoncookie, headerLocationId))
    }
   
  }, [pageCount, pageSize,departmentLists]);

  //request
  const requestSearch = (e) => {
    let val = e.target.value;
    setsearchVal(val)
    setPageCount(0)

    setIsApiFinished(false);
    setLoaderStatusHandler(true);
    // setFlag(false)
    dispatch(setSearchrequestReportAction({ data: [], numRows: 0 }));
    let data
    if (!flag) {
      data = {
        fromDate: moment(filterDate.from).format('YYYY-MM-DD'),
        toDate: moment(filterDate.to).format('YYYY-MM-DD'),
        pageCount: pageCount,
        numPerPage: pageSize,
        searchString: val,
        employee_id: [],
        department: monthYear.department.length === 0 ? list_department.map((d) => d.department)  : monthYear.department,
        location: []
      }
    }
    else {
      data = {
        fromDate: moment(filterDate.from).format('YYYY-MM-DD'),
        toDate: moment(filterDate.to).format('YYYY-MM-DD'),
        pageCount: pageCount,
        numPerPage: pageSize,
        searchString: val,
        employee_id: [],
        department: monthYear.department.length === 0 ? list_department.map((d) => d.department)  : monthYear.department,
        location: monthYear.location > 0 ? monthYear.location : []
      }
    }

    dispatch(SearchrequestReportAction(
      data,
      setModalTypeHandler,
      (loaderStatus) => {
        setLoaderStatusHandler(loaderStatus);
        // when your loader turns false => API done
        if (loaderStatus === false) {
          setIsApiFinished(true);
        }
      }
    )
    )
  };

  const onLocationchange = (e) => {
    const { value } = e.target;
    setMonthYear((prevMonthYear) => ({
      ...prevMonthYear,
      location: value.includes('') ? [''] : value,
    }));
  }

  const cancelSearch = () => {
  console.log("jj",monthYear.department.length)
    setPageCount(0)
    setsearchVal("")

    dispatch(setSearchrequestReportAction({ data: [], numRows: 0 }));
    let data
    if (!flag) {
      data = {
        fromDate: moment(filterDate.from).format('YYYY-MM-DD'),
        toDate: moment(filterDate.to).format('YYYY-MM-DD'),
        pageCount: pageCount,
        numPerPage: pageSize,
        searchString: '',
        employee_id: [],
       department: monthYear.department.length === 0 ? list_department.map((d) => d.department)  : monthYear.department,
        location: []
      }
    }
    else {
      data = {
        fromDate: moment(filterDate.from).format('YYYY-MM-DD'),
        toDate: moment(filterDate.to).format('YYYY-MM-DD'),
        pageCount: pageCount,
        numPerPage: pageSize,
        searchString: '',
        employee_id: [],
        department: monthYear.department.length === 0 ? list_department.map((d) => d.department)  : monthYear.department,
                location: monthYear.location > 0 ? monthYear.location : []
      }
    }

    dispatch(SearchrequestReportAction(
      data,
      setModalTypeHandler,
      setLoaderStatusHandler
    )
    )
  }

  const handleChange = (data) => {
    if (data?.target?.name == "location") {
      setMonthYear({ ...monthYear, location: data.target.value });
    }
    if (data?.target?.name == "department") {
      setMonthYear({ ...monthYear, department: data.target.value });
    }
    var date_val = data?.target?.value?._d;
    // console.log('sdsadfasef',date_val, data.target.name)
    setFilterDate({ ...filterDate, [data.target.name]: date_val });
    // console.log('sdfsdgdfgre',filterDate.from)
    if (moment(filterDate.from, 'year') <= moment(filterDate.to, 'year')) {
      if (moment(filterDate.from, 'month') <= moment(filterDate.to, 'month')) {
        if (moment(filterDate.from, 'day') <= moment(filterDate.to, 'day')) {
          setErrMsg({ ...errMsg, from: '', to: '' });
        } else {
          setErrMsg({ ...errMsg, [data.target.name]: 'Invalid Date 1' });
        }
      } else {
        setErrMsg({ ...errMsg, [data.target.name]: 'Invalid Date 2' });
      }
    } else {
      setErrMsg({ ...errMsg, [data.target.name]: 'Invalid Date 3' });
    }
  };

  const ApplyButton = async (val) => {
    setFlag(false)
    setMonthYear({...monthYear,empName: val?.map(v => v?.employee_id)})
    console.log("monthYear",monthYear,monthYear.location.length ? monthYear.location : []);
    let payLoad = {
      fromDate: moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
      toDate: moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
      pageCount: 0,
      numPerPage: pageSize,
      searchString: "",
      employee_id: val?.map(v => v?.employee_id),
     department: monthYear.department.length === 0 ? list_department.map((d) => d.department)  : monthYear.department,
      location: monthYear.location  ? monthYear.location : []
    }
    setPageCount(0)
    console.log(payLoad, "load");
    dispatch(filterRequestReportAction(payLoad))


    handleFilter(false)
    setButton()
    setsearchVal('')
  };

  const clearButton = () => {
    setsearchVal('')
    setButton('4');
  handleFilter(false)
    setFilterDate({
      ...filterDate,
      from: defaultFrom,
      to: defaultTo,
    });
    setMonthYear({
      ...monthYear,
      empName: [],
     location: [],
    department: [],
    fromDate: moment(defaultFrom).format('YYYY-MM-DD'),
    toDate: moment(defaultTo).format('YYYY-MM-DD'),
  })
    let payload = {
      fromDate: moment(defaultFrom).format('YYYY-MM-DD'),
      toDate: moment(defaultTo).format('YYYY-MM-DD'),
      pageCount: 0,
      numPerPage: pageSize,
      searchString: "",
      employee_id: [],
      department: [''],
      location: []
    }
  apiCalls(
    setModalTypeHandler,
    setLoaderStatusHandler,
    dispatch(filterRequestReportAction(payload, setModalTypeHandler, setLoaderStatusHandler))
  );
  dispatch(listStockLocationAction(commoncookie, headerLocationId))
  };

  const handlePageChange = async (page) => {
    setPageCount(page)
    // console.log(payLoad,"load");
    //   let payLoad = {
    //     fromDate : moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD') ,
    //     toDate : moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
    //     pageCount : page,
    //     numPerPage  : pageSize,
    //     searchString: searchVal
    // }
    // dispatch(filterRequestReportAction(payLoad));
    // let payLoad = {
    //   fromDate : moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD') ,
    //   toDate : moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
    //   pageCount : page,
    //   numPerPage  : pageSize,
    //   searchString: searchVal
    // }
    // dispatch(filterRequestReportAction(payLoad));
  }

  const handlePageSizeChange = async (size) => {
    setPageSize(size)
    setPageCount(0)
    // console.log(payLoad,"load");
    //   let payLoad = {
    //     fromDate : moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD') ,
    //     toDate : moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
    //     pageCount : pageCount,
    //     numPerPage  : size,
    //     searchString: searchVal
    // }
    // dispatch(filterRequestReportAction(payLoad));
    // let payLoad = {
    //   fromDate : moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD') ,
    //   toDate : moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
    //   pageCount : pageCount,
    //   numPerPage  : size,
    //   searchString: searchVal
    // }
    // dispatch(filterRequestReportAction(payLoad));
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

  const handlePreviousMonthClick = (data) => {
    setsearchVal('')
    setFlag(true)
    console.log(data, 'datahandlereport');
    const month = data.split(' ')[0];
    const year = data.split(' ')[1];
    const { startDate, endDate } = getStartAndEndDate(month, year)
    console.log(startDate, 'startdateee');
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    setFilterDate(prevState => ({
      ...prevState,
      from: startDateObj,
      to: endDateObj
    }));
    setPageCount(0)
    setPreviousDate({ ...previousDate, from: startDateObj, to: endDateObj })
    let payLoad = {
      fromDate: moment(startDateObj, 'year', 'month', 'day').format(
        'YYYY-MM-DD',
      ),
      toDate: moment(endDateObj, 'year', 'month', 'day').format(
        'YYYY-MM-DD',
      ),
      pageCount: 0,
      numPerPage: pageSize,
      searchString: '',
     department: monthYear.department.length === 0 ? list_department.map((d) => d.department)  : monthYear.department,
      location: [],
      employee_id: []
    }
    console.log("ythat", payLoad);
    dispatch(filterRequestReportAction(payLoad))
  }

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

  console.log(thirdPrevMonth.slice(0, 3), secondPrevMonth, firstPrevMonth, PrevMonth, 'reqrep');

  // console.log("thisss", filterDate)

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

  const columns=[
    // {title: 'Id', field: 'leaveId',
    // render:(rowData) =>
    // rowData.leaveId ? rowData.leaveId : '-',},
    {
      headerName: 'Type', field: 'final_leave_type' , flex: 1,
      ...sharedColumnProps,
    render:(rowData) =>
    rowData.final_leave_type,
    cellStyle: {textTransform:"capitalize"}
    },

    {
      headerName: 'Status', field: 'status', flex: 1,
      ...sharedColumnProps,
    render:(rowData) =>
    rowData.status ? rowData.status : '-',
    cellStyle: {textTransform:"capitalize"} 
    },

      {
        headerName: 'Name',
        field: 'first_name',
        flex: 1,
        ...sharedColumnProps,
        render: (rowData) => {
          const fullName = [rowData.first_name, rowData.last_name].filter(Boolean).join(' ');
          return formatName(fullName);
        },
      },

     {
      headerName: 'Start Date',
      field: 'formatted_fromDate',
      ...sharedColumnProps,
      flex: 1,
      // render: (r) => {
      //   if (r.fromDate === '0000-00-00') {
      //     return '-'; 
      //   }
      //  return  commonDateFormat(r.fromDate)
      
      // }
      // renderCell:(r) => moment(r.fromDate).format('DD-MM-YYYY')
    },
    {
      headerName: 'End Date',
      field: 'formatted_toDate',
      ...sharedColumnProps,
      flex: 1,
      // render: (r) => {
      //   if (r.toDate === '0000-00-00') {
      //     return '-'; 
      //   }
      //  return  commonDateFormat(r.toDate)
      
      // }
      // renderCell:(r) => moment(r.toDate).format('DD-MM-YYYY')
    },
    {
      headerName: 'Start Time', field: 'formatted_startTime' , flex: 1,
      ...sharedColumnProps,
    render:(rowData) =>
    rowData.formatted_startTime ?  rowData.formatted_startTime : '-',
    },

    {
      headerName: 'End Time', field: 'formatted_endTime' , flex: 1,
      ...sharedColumnProps, 
    render:(rowData) =>
    rowData.formatted_endTime ? formatted_endTime: '-',
    },

    {
      headerName: 'Reason', field: 'note' , flex: 1,
    cellStyle: {textTransform:"capitalize"},
    ...sharedColumnProps,
    render:(rowData) =>
    rowData.request_type === 3 ? rowData.note : rowData.reason
    },
    ];

  const exportToExcel = useCallback((columns, data) => {
    const columnNames = {
      final_leave_type: 'Type',
      status: 'Status',
      first_name: 'Name',
      fromDate: 'Start Date',
      toDate: 'End Date',
      startTime: 'Start Time',
      endTime: 'End Time',
      note: 'Reason',
  };
  const selectedColumns = [
     "final_leave_type",
      "status", 
      "first_name", 
      "fromDate", 
      "toDate", 
      "startTime", 
      "endTime",
      "note"
  ];
    const headers = selectedColumns.map(col => columnNames[col] || col);
    const sheetData = [
    headers,
    ...data.map(row =>
      selectedColumns.map(col => {
        
        if (
          (col === 'fromDate' || col === 'toDate') &&
          row[col]
        ) {
          return moment(row[col]).format('DD/MM/YYYY');
        }

        return row[col] || '';
      })
    )
  ];
  
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
  
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'Request Report export.xlsx');
  }, []);

  console.log("gdfsgfdg",filterOpen);
  
  const selectedRole = storage?.role_name;
  const reportExport = UserRightsAuthorization(menuAccess[selectedRole], 'reports__attendance__request_report', 'can_export')
  return (
    <>
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
            Request Report
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
                  locationFilter={true}
                  type={"request"}
                  handleChange={handleChange}
                  handleClose={handleFilter}
                  open={filterOpen}
                  monthYear={monthYear}
                  onLocationchange={onLocationchange}
                  stocklocation={stocklocation}
                  departmentList={list_department}
                  clearButton={clearButton}
                  ApplyButton={ApplyButton}
                  companySearch={false}
                  shouldFetchData={true}
                  setMonthYear={setMonthYear}
                />
              {/* </IconButton> */}
            </Tooltip>
            {reportExport && (
              <Tooltip title='Export' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement='top'>
                <IconButton
                  size='small'
                  onClick={async () => {
                    let data = {
                      fromDate: moment(filterDate.from).format('YYYY-MM-DD'),
                      toDate: moment(filterDate.to).format('YYYY-MM-DD'),
                      exportData: true,
                      searchString: searchVal,
                      employee_id: monthYear.empName,
                      department: monthYear.department.length === 0 ? list_department.map((d) => d.department) : monthYear.department,
                      location: [],
                    };
                    try {
                      await apiCalls(
                        setModalTypeHandler,
                        setLoaderStatusHandler,
                        dispatch(filterRequestReportAction(data, setModalTypeHandler, setLoaderStatusHandler, (res) => {
                          exportToExcel(Object.keys(res[0] || {}), res);
                        }))
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
              rows={Updatedsearch_request_reportData}
              columns={columns}
              pageSizeOptions={[20, 50, 100]}
              paginationMode='server'
              density='compact'
              disableRowSelectionOnClick
              disableExtendRowFullWidth
              rowCount={search_request_reportCount}
              paginationModel={{ page: pageCount, pageSize: pageSize }}
              onPaginationModelChange={(model) => {
                if (model.page !== pageCount) handlePageChange(model.page);
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

export default RequestReport;
