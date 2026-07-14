import React, {useContext, useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';

import {useDispatch, useSelector} from 'react-redux';
import {
  getEmpbasecompanyAction,
  ApproveAttendance_Action,
  searchAttendanceCorAction,
  setsearchAttendanceCorAction,
  getLocBaseEmpAction,
  getLocBaseEmpFilterAction,

} from 'redux/actions/attendance_actions';
import apiCalls from 'utils/apiCalls';
import moment from 'moment';


import Correction from './correction';
import context from '../../../context/CreateNewButtonContext';

import {listStockLocationAction} from 'redux/actions/stock_Location_actions';
import {Helmet} from 'react-helmet-async';

import {getsessionStorage} from 'pages/common/login/cookies';

import {titleURL} from 'http-common';

import { LOCATION_BASE_DEP_FILTER} from 'redux/actionTypes';

import {useCustomFetch} from 'utils/useCustomFetch';
import CommonFilter from 'components/pos/payment_section/CommonFilter';
import CommonSearch from 'utils/commonSearch';
import { Box, Card, Chip, Fade, IconButton, Tooltip, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import API_URLS from '../../../utils/customFetchApiUrls';
import { formatName } from 'utils/nameFormatter';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

export default function index() {
  const navigate = useNavigate();
  const yesterday = new Date();

  yesterday.setDate(yesterday.getDate() - 1);

  const date = new Date();
  const customFetch = useCustomFetch();
  const defaultFrom = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const lastDayOfPreviousMonth = new Date(date.getFullYear(), date.getMonth(), 0);
  const defaultTo = new Date(lastDayOfPreviousMonth.getFullYear(), lastDayOfPreviousMonth.getMonth(), lastDayOfPreviousMonth.getDate());
  const currentMonthFirstDate = new Date(date.getFullYear(), date.getMonth(), 1);
  // console.log(defaultFrom, defaultTo, 'overcheck');
  const [filterDate, setFilterDate] = useState({
      from: defaultFrom,
      to: defaultTo
  });
  const [previousDate, setPreviousDate] = useState({
    from: '',
    to: ''
});
  const [selectedAll, setSelectedAll] = useState(false);
  const [button, setButton] = useState('4');
  const [Matopen, setMatopen] = useState(false);
  const [isApiFinished, setIsApiFinished] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(0);

  const [flag, setFlag] = useState(false);

  const dispatch = useDispatch();
  const {
    attendanceReducer: {  attendance_process,searchAttendanceCor, searchAttendanceCorCount},
    stockLocationReducer: {stocklocation},
    UserCreationReducer: { departmentList },
    rbacReducer: {menuAccess = []}
  } = useSelector((state) => state);
  const storage = getsessionStorage();
  // console.log("asfasf",searchAttendanceCor)
  const {
    commoncookie,
    headerLocationId,
    setLoaderStatusHandler,
    setModalTypeHandler,
  } = useContext(context);

 

  const currentDate = new Date();
  const firstDayOfPreviousMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    1,
  );

  




const [count, setCount] = useState(0)
  const [regex] = useState({});
  const [open, setOpen] = useState(false);
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [edit_data, setedit_data] = useState({});
  const [searchVal, setSearchVal] = useState('');
  const [openFilter, setOpenFilter] = useState(false);
  const [searchPageData, setSearchPageData] = useState([])
  const currentMonth = moment().startOf('month');
  const firstDateOfMonth = currentMonth.format('YYYY-MM-DD');
  const lastDateOfMonth = currentMonth.endOf('month').format('YYYY-MM-DD');
  const [monthYear, setMonthYear] = React.useState({
      empName: [''],
      location: [''],
      // department: [''],
      from: moment(firstDateOfMonth),
      to: moment(lastDateOfMonth),
  });
  const [filterOpen, handleFilter] = useState(false);

  const onLocationchange = (e) => {
    const { value } = e.target;
    setMonthYear((prevMonthYear) => ({
        ...prevMonthYear,
        location: value.includes('') ? [''] : value,
    }));
}

const [errMsg, setErrMsg] = useState({
  from: '',
  to: '',
});


useEffect(() => {
  // dispatch(getEmpbasecompanyAction())
  setsearchAttendanceCorAction({ data: [], numRows: 0 });
  let payLoad
  if (!flag) {
      payLoad = {
          fromDate: moment(filterDate.from).format('YYYY-MM-DD'),
          toDate: moment(filterDate.to).format('YYYY-MM-DD'),
          pageCount: page,
          numPerPage: pageSize,
          searchString: "",
          employee_id: [],
          // department: [],
          location: []
      }
  }
  else {
      payLoad = {
          fromDate: moment(previousDate.from, 'year', 'month', 'day').format('YYYY-MM-DD',),
          toDate: moment(previousDate.to, 'year', 'month', 'day').format('YYYY-MM-DD',),
          pageCount: page,
          numPerPage: pageSize,
          searchString: "",
          employee_id: [],
          // department: [],
          location: []
      }
  }
  apiCalls(
    setModalTypeHandler,
    setLoaderStatusHandler,
  // console.log(payLoad, "load");
  dispatch(searchAttendanceCorAction(payLoad)),
  dispatch(listStockLocationAction(commoncookie, headerLocationId)),
  // dispatch(departmentListAction())
  ).finally(() => setIsApiFinished(true))
}, [page, pageSize])

const handleChange = (data) => {
  var date_val = data?.target?.value?._d;
  if (data?.target?.name == "location") {
      setMonthYear({ ...monthYear, location: data.target.value });
  }
  // if (data?.target?.name == "department") {
  //     setMonthYear({ ...monthYear, department: data.target.value });
  // }
  // console.log('sdsadfasef', date_val, data.target.name)
  setFilterDate({ ...filterDate, [data.target.name]: date_val });
  // console.log('sdfsdgdfgre', filterDate.from)
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
  setButton('')
  setMonthYear({...monthYear,empName:val?.map(v => v?.employee_id)})
  // console.log("fdsbjb",monthYear);

  let payLoad = {
      fromDate: moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
      toDate: moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
      pageCount: 0,
      numPerPage: pageSize,
      searchString: "",
      employee_id: val?.map(v => v?.employee_id),
      // department: monthYear.department,
      location: monthYear.location
  }
  setPage(0)
  // console.log(payLoad, "load");
  dispatch(searchAttendanceCorAction(payLoad))


  handleFilter(false)
  setSearchVal('')
};

const clearButton = () => {
  setButton('4')
  handleFilter(false)
  let firstDay = defaultFrom;
  let lastDay = defaultTo;
  setFilterDate({
      ...filterDate,
      from: firstDay,
      to: lastDay,
  });
  setMonthYear({
      ...monthYear,
      empName: [''],
  location: [''],
  // department: ['']
  })
 let payLoad = {
  fromDate: moment(defaultFrom).format('YYYY-MM-DD'),
  toDate: moment(defaultTo).format('YYYY-MM-DD'),
  pageCount: page,
  numPerPage: pageSize,
  searchString: "",
  employee_id: [],
  // department: [],
  location: []
  }
dispatch(searchAttendanceCorAction(payLoad))
dispatch(listStockLocationAction(commoncookie, headerLocationId))
// dispatch(departmentListAction((res)=>{
        
// }))
  
}

  const correctionClose = () => {
    setCorrectionOpen(false);
  };

  const requestSearch = (e) => {
    let val = e;
    setSearchVal(val)
    setIsApiFinished(false);
    setLoaderStatusHandler(true);

    dispatch(setsearchAttendanceCorAction({ data: [], numRows: 0 }));

    let payLoad = {
        fromDate: moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
        toDate: moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
        pageCount: page,
        numPerPage: pageSize,
        searchString: val,
        employee_id: [],
        // department: [],
        location: []
    }
    // console.log(payLoad, "load");
    dispatch(searchAttendanceCorAction(payLoad,
      setModalTypeHandler,
      (loaderStatus) => {
        setLoaderStatusHandler(loaderStatus);
        // when your loader turns false => API done
        if (loaderStatus === false) {
          setIsApiFinished(true);
        }
      }
    ))


   
  };

  const cancelSearch = () => {

        //const context = context;
        setSearchPageData([])
        setPage(0)
        setSearchVal('')

        let payLoad = {
            fromDate: moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
            toDate: moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
            pageCount: page,
            numPerPage: pageSize,
            searchString: "",
            employee_id: [],
            // department: [],
            location: []
        }
        // console.log(payLoad, "load");
        dispatch(searchAttendanceCorAction(payLoad))
  };

  const handlePageSizeChange = async (size) => {
    setPage(0);
    setPageSize(size);
  };

  const handlePageChange = async (page) => {
    setPage(page);
  };


  const originalData = searchAttendanceCor;
  // console.log("dsfsd",originalData)
  const dataWithId = originalData?.length ? originalData?.map((row, index) => ({ ...row, id: index })) : []
  // console.log(originalData, 'ss');

  const columns = [
    {field: 'first_name',headerName: 'Name',width: 110, renderCell: (params) => formatName(params?.row?.first_name),},
    {field: 'shift_name', headerName: 'Shift Name', width: 150},
    {field: 'creationDate', headerName: 'Date',
      renderCell: (params) => {
        const rawDate = params?.row?.creationDate || params?.row?.fromDate;
        return rawDate ? moment(rawDate).format('DD/MM/YYYY') : '-';
      },
      width: 150},
   
    {field: 'first_in_time', headerName: 'Check-IN', width: 130,
      renderCell: (params) => {
        const checkIn = params?.row?.checkInTime || params?.row?.first_in_time;
        return checkIn ? moment(checkIn, ['HH:mm:ss', 'HH:mm']).format('hh:mm A') : '-';
      }
    },
   
    {field: 'last_out_time', headerName: 'Check-OUT', width: 130,
      renderCell: (params) => {
        const checkOut = params?.row?.checkOutTime || params?.row?.last_out_time;
        return checkOut ? moment(checkOut, ['HH:mm:ss', 'HH:mm']).format('hh:mm A') : '-';
      }
    },
    {field: 'correctionStart', headerName: 'Corrected Check In',
      renderCell: (params) => {
        const correctedIn = params?.row?.correctionStart;
        return correctedIn ? moment(correctedIn, ['HH:mm:ss', 'HH:mm']).format('hh:mm A') : '-';
      },
      width: 160},
    {field: 'correctionEnd', headerName: 'Corrected Check Out',
      renderCell: (params) => {
        const correctedOut = params?.row?.correctionEnd;
        return correctedOut ? moment(correctedOut, ['HH:mm:ss', 'HH:mm']).format('hh:mm A') : '-';
      },
      width: 160},
    {
      field: 'approvedBy',
      headerName: 'Approved By',
      width: 150,
      renderCell: (params) => params?.row?.approvedBy || '-',
    },
  
    // {field: 'creationDate', headerName: 'Created at', width: 120},
  ];
  // console.log('searchAttendanceCor',searchAttendanceCor)


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

  const handlePreviousMonthClick = (data,btn) => {
    setSearchVal('')
    setButton(btn)
    // console.log("handlePreviousMonthClick",data)
    setFlag(true)
    // console.log(data, 'datahandlereport');
    const month = data.split(' ')[0];
    const year = data.split(' ')[1];
    const { startDate, endDate } = getStartAndEndDate(month, year)
    // console.log(startDate, 'startdateee');
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    setPage(0)
    setPreviousDate({ ...previousDate, from: startDateObj, to: endDateObj })
    setFilterDate({...filterDate,from: startDate,
      to: endDate})
    let payLoad = {
        fromDate: moment(startDateObj, 'year', 'month', 'day').format(
            'YYYY-MM-DD',
        ),
        toDate: moment(endDateObj, 'year', 'month', 'day').format(
            'YYYY-MM-DD',
        ),
        pageCount: 0,
        numPerPage: pageSize,
        searchString: "",
        // department: [],
        location: [],
        employee_id: []
    }
    // console.log(payLoad, "load");
    dispatch(searchAttendanceCorAction(payLoad))
}
const selectedRole = storage?.role_name;
const reportExport = UserRightsAuthorization(menuAccess[selectedRole], 'reports__attendance__attendance_correction', 'can_export')
const handleExport = async () => {
  if (!reportExport) return;
    let formData = {
        fromDate: moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
        toDate: moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
        exportData: true,
        searchString: searchVal,
        employee_id: [],
        department: [],
        location: []
    }

  const { data: resData } = await customFetch(
    API_URLS.SEARCH_ATTENDANCE_COR,
    'POST',
    formData
  );

    const columnHeaders = columns.map(column => column.headerName); // Extract column headers
    const rows = resData?.data?.map(row => columns.map(column => row[column.field])); // Extract row data

    // Construct CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += columnHeaders.join(",") + "\n"; // Add column headers
    csvContent += rows.map(row => row.join(",")).join("\n"); // Add row data

    // Create a temporary anchor element and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", 'Approved Attendance Details' + ".csv");
    document.body.appendChild(link);
    link.click();
}

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const curYear = currentDate.getFullYear();
  const curMonthIndex = currentDate.getMonth();
  const prevMonthLabels = [];
  for (let i = 1; i <= 4; i++) {
    const idx = (curMonthIndex - i + 12) % 12;
    let yr = curYear;
    if (idx > curMonthIndex) yr--;
    prevMonthLabels.push(`${months[idx]} ${yr}`);
  }

  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | AttendanceCorrection </title>
      </Helmet>
      {!correctionOpen ? (
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
              Approved Attendance Details
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CommonSearch
                searchVal={searchVal}
                cancelSearch={cancelSearch}
                requestSearch={(e) => requestSearch(e.target.value)}
              />
              <Tooltip title='Filter' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement='top'>
                {/* <IconButton size='small'> */}
                  <CommonFilter
                    from={filterDate.from}
                    to={filterDate.to}
                    locationOnlyFilter={true}
                    count={count}
                    monthYear={monthYear}
                    onLocationchange={onLocationchange}
                    stocklocation={stocklocation}
                    handleChange={handleChange}
                    handleClose={handleFilter}
                    open={filterOpen}
                    clearButton={clearButton}
                    ApplyButton={ApplyButton}
                    companySearch={false}
                    shouldFetchData={true}
                  />
                {/* </IconButton> */}
              </Tooltip>
              {reportExport && (
                <Tooltip title='Export' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement='top'>
                  <IconButton size='small' onClick={handleExport}>
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
                rows={dataWithId}
                columns={columns}
                pageSizeOptions={[20, 50, 100]}
                paginationMode='server'
                density='compact'
                disableRowSelectionOnClick
                disableExtendRowFullWidth
                rowCount={searchAttendanceCorCount || 0}
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
      ) : (
        <Correction
          rowData={edit_data}
          handleClose={correctionClose}
          attendance_process={attendance_process}
          from={filterDate.from}
          to={filterDate.to}
        />
      )}
    </>
  );
}
