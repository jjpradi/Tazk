import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmpbasecompanyAction, getSearchLateAndEarlyReportAction, lateAndEarlyReportAction, setSearchLateAndEarlyReportAction } from 'redux/actions/attendance_actions';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import CommonFilter from 'components/pos/payment_section/CommonFilter';
import moment from 'moment';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { useCustomFetch } from 'utils/useCustomFetch';
import { formatTime12Hour } from 'utils/pageSize';
import { commonDateFormat } from 'utils/getTimeFormat';
import { listDepartment } from 'redux/actions/shifts.actions';
import { Box, Card, Fade, IconButton, Tooltip, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import CommonSearch from 'utils/commonSearch';
import API_URLS from '../../../utils/customFetchApiUrls';
import apiCalls from 'utils/apiCalls';
import { formatName } from 'utils/nameFormatter';
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

const LateAndEalyReport = (props) => {
    const navigate = useNavigate();
    const yesterday = new Date();

    yesterday.setDate(yesterday.getDate() - 1);

    const date = new Date();
    const customFetch = useCustomFetch();
    const defaultFrom = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    const lastDayOfPreviousMonth = new Date(date.getFullYear(), date.getMonth(), 0);
    const defaultTo = new Date(lastDayOfPreviousMonth.getFullYear(), lastDayOfPreviousMonth.getMonth(), lastDayOfPreviousMonth.getDate());
    const currentMonthFirstDate = new Date(date.getFullYear(), date.getMonth(), 1);
    console.log(defaultFrom, defaultTo, 'overcheck');
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
    const [pageCount, setPageCount] = useState(0)
    const [pageSize, setPageSize] = useState(20)
    const [button, setButton] = useState('4');
    const [searchPageData, setSearchPageData] = useState([])
    const [flag, setFlag] = useState(false)
    const [previousDate, setPreviousDate] = useState({
        from: '',
        to: ''
    });

    const [departmentLists, setDepartmentList] = useState(false);
    const [departmentListsArray, setDepartmentListArray] = useState([]);

    const { attendanceReducer: { lateLoginEarlyCheckoutReport }, 
    stockLocationReducer: { stocklocation },
     UserCreationReducer: { departmentList },
     ShiftsReducer: { list_department },
     rbacReducer: {menuAccess = []}
    } = useSelector((state) => state);

    const dispatch = useDispatch();
    const storage = getsessionStorage();
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
    const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(
        CreateNewButtonContext,
    );

    const commonCellStyle = {
        fontFamily: "poppins",
        fontSize: "11px",
        fontWeight: "400",
        color: 'rgba(0, 0, 0, 0.7)',
    };

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
        dispatch(getEmpbasecompanyAction());
        dispatch(listStockLocationAction(commoncookie, headerLocationId));
        setLoaderStatusHandler(true);
        const payLoad = {
            fromDate: moment(filterDate.from).format('YYYY-MM-DD'),
            toDate: moment(filterDate.to).format('YYYY-MM-DD'),
            pageCount,
            numPerPage: pageSize,
            searchString: searchVal,
            employee_id: monthYear.empName,
            department: monthYear.department[0] === ''  ? list_department.map((d) => d.department)  : monthYear.department,
            location: monthYear.location
        };

        if (flag) {
            payLoad.fromDate = moment(previousDate.from).format('YYYY-MM-DD');
            payLoad.toDate = moment(previousDate.to).format('YYYY-MM-DD');
        }
        apiCalls(
        dispatch(lateAndEarlyReportAction(payLoad))
        ).finally(() =>
        { 
          setIsApiFinished(true)
          setLoaderStatusHandler(false)
        })
    }
    }, [filterDate, pageCount, pageSize, monthYear, flag, previousDate,departmentLists]);

    const columns = [
        {
            field: 'date', headerName: 'Date', width: 100,
            renderCell: (params) => {
                const creationDate = params.row.date;
                return (
                    <div style={commonCellStyle}>
                        {creationDate === '0000-00-00' || creationDate === null ? '-' : commonDateFormat(creationDate)}
                    </div>
                );
            },
        },
        { field: 'employee_code', headerName: 'Emp Code', width: 180 },
        {
            field: 'full_name',
            headerName: 'Name',
            width: 180,
            renderCell: (params) => formatName(params.row.full_name),
        },
        { field: 'shift_name', headerName: 'Shift Name', width: 180 },
        {
            field: 'shift_start_time', headerName: 'Shift Start Time', width: 180,
            renderCell: (params) => (
                <div style={commonCellStyle}>
                    {params.row.shift_start_time ? formatTime12Hour(params.row.shift_start_time) : '-'}
                </div>
            ),
        },
       
        { field: 'actual_login_time', headerName : 'Actual Login time',width: 180,
            renderCell : (params)=>(
                <div style={commonCellStyle}>
                {params.row.actual_login_time ? formatTime12Hour(params.row.actual_login_time) : '-'}
            </div>
            )
        },
        { field: 'late_login_duration', headerName: 'Late Login Diff', width: 180 },
        {
            field: 'shift_end_time', headerName: 'Shift End Time', width: 180,
            renderCell: (params) => (
                <div style={commonCellStyle}>
                    {params.row.shift_end_time ? formatTime12Hour(params.row.shift_end_time) : '-'}
                </div>
            ),
        },
        { field: 'actual_logout_time', headerName : 'Actual Logout time',width: 180,
            renderCell : (params)=>(
                <div style={commonCellStyle}>
                {params.row.actual_logout_time ? formatTime12Hour(params.row.actual_logout_time) : '-'}
            </div>
            )
        },
        { field: 'early_logout_duration', headerName: 'Early Out Time Diff', width: 180 },
       
        // { field: 'total_late_login_duration', headerName: 'Total Late Diff', width: 230 },
        
     
        // { field: 'total_early_logout_duration', headerName: 'Total Early Out Diff', width: 230 },
    ];

    const onLocationchange = (e) => {
        const { value } = e.target;
        setMonthYear((prevMonthYear) => ({
            ...prevMonthYear,
            location: value.includes('') ? [''] : value,
        }));
    }

    const handleChange = (data) => {
        var date_val = data?.target?.value?._d;
        if (data?.target?.name == "location") {
            setMonthYear({ ...monthYear, location: data.target.value });
        }
        if (data?.target?.name == "department") {
            setMonthYear({ ...monthYear, department: data.target.value });
        }
        console.log('sdsadfasef', date_val, data.target.name)
        setFilterDate({ ...filterDate, [data.target.name]: date_val });
        console.log('sdfsdgdfgre', filterDate.from)
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
        setSearchVal('')
        setButton()
        setFlag(false)
        setMonthYear({ ...monthYear, empName: val?.map(v => v?.employee_id) })
        console.log("fdsbjb", monthYear);

        let payLoad = {
            fromDate: moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
            toDate: moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
            pageCount: 0,
            numPerPage: pageSize,
            searchString: "",
            employee_id: val?.map(v => v?.employee_id),
            department: monthYear.department[0] === ''  ? list_department.map((d) => d.department)  : monthYear.department,
            location: monthYear.location
        }
        setPageCount(0)
        console.log(payLoad, "load");
        dispatch(lateAndEarlyReportAction(payLoad))


        handleFilter(false)
        setSearchVal('')
    };

    const clearButton = () => {
        setSearchVal('')
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
            department: [''],
            fromDate: moment(defaultFrom).format('YYYY-MM-DD'),
            toDate: moment(defaultTo).format('YYYY-MM-DD'),
        })
        let payLoad = {
            fromDate: moment(defaultFrom).format('YYYY-MM-DD'),
            toDate: moment(defaultTo).format('YYYY-MM-DD'),
            pageCount: pageCount,
            numPerPage: pageSize,
            searchString: "",
            employee_id: [],
            department: monthYear.department[0] === ''  ? list_department.map((d) => d.department)  : monthYear.department,
            location: []
        }
        dispatch(lateAndEarlyReportAction(payLoad))
        dispatch(listStockLocationAction(commoncookie, headerLocationId))

    }

    const requestSearch = (e) => {
        let val = e;
        setSearchVal(val)
        setIsApiFinished(false);
        setLoaderStatusHandler(true);

        dispatch(setSearchLateAndEarlyReportAction({ data: [], numRows: 0 }));
        let payLoad = {
            fromDate: moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
            toDate: moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
            pageCount: pageCount,
            numPerPage: pageSize,
            searchString: val,
            employee_id: [],
            department: monthYear.department[0] === ''  ? list_department.map((d) => d.department)  : monthYear.department,
            location: []
        }
        dispatch(getSearchLateAndEarlyReportAction(payLoad,
            setModalTypeHandler,
        (loaderStatus) => {
        setLoaderStatusHandler(loaderStatus);
        // when your loader turns false => API done
        if (loaderStatus === false) {
          setIsApiFinished(true);
        }
      }
        ));
    };

    const cancelSearch = () => {
        setSearchPageData([])
        setPageCount(0)
        setSearchVal('')
        dispatch(setSearchLateAndEarlyReportAction({data:[], numRows:0}));
        let payLoad = {
            fromDate: moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
            toDate: moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
            pageCount: pageCount,
            numPerPage: pageSize,
            searchString: "",
            employee_id: [],
            department: monthYear.department[0] === ''  ? list_department.map((d) => d.department)  : monthYear.department,
            location: []
        }
        console.log(payLoad, "load");
        dispatch(getSearchLateAndEarlyReportAction(payLoad))
    };

    const handlePageChange = async (page) => {
        setPageCount(page)
        let payLoad = {
            fromDate: moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
            toDate: moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
            pageCount: page,
            numPerPage: pageSize,
            searchString: searchVal
        }
    }

    const handlePageSizeChange = async (size) => {
        setPageSize(size)
        setPageCount(0)
        let payLoad = {
            fromDate: moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
            toDate: moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
            pageCount: size,
            numPerPage: pageSize,
            searchString: searchVal
        }
    };
    const originalData = lateLoginEarlyCheckoutReport?.data;
    const dataWithId = originalData?.length ? originalData?.map((row, index) => ({ ...row, id: index })) : []
    console.log(lateLoginEarlyCheckoutReport, 'ss');

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
        setFlag(true)
        setButton(btn)
        console.log(data, 'datahandlereport');
        const month = data.split(' ')[0];
        const year = data.split(' ')[1];
        const { startDate, endDate } = getStartAndEndDate(month, year)
        console.log(startDate, 'startdateee');
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        setPageCount(0)
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
            department: monthYear.department[0] === ''  ? list_department.map((d) => d.department)  : monthYear.department,
            location: [],
            employee_id: []
        }
        console.log(payLoad, "load");
        dispatch(lateAndEarlyReportAction(payLoad))
    }
    const selectedRole = storage?.role_name;
    const reportExport = UserRightsAuthorization(menuAccess[selectedRole], 'reports__attendance__late_early_report', 'can_export')
    const handleExport = async () => {
        if (!reportExport) return;
        let formData = {
            fromDate: moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
            toDate: moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
            exportData: true,
            searchString: searchVal,
            employee_id: [],
            department: monthYear.department[0] === ''  ? list_department.map((d) => d.department)  : monthYear.department,
            location: []
        }

        const { data: resData } = await customFetch(
            API_URLS.LATE_LOGIN_EARLY_CHECKOUT_REPORT,
            'POST',
            formData
        );

        const columnHeaders = columns.map(column => column.headerName);
        const rows = resData?.data?.map(row => columns.map(column => row[column.field]));


        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += columnHeaders.join(",") + "\n";
        csvContent += rows.map(row => row.join(",")).join("\n");

        // Create a temporary anchor element and trigger download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", 'Late Login & Early Out Report' + ".csv");
        document.body.appendChild(link);
        link.click();
    }

    return (
        <>
            <Helmet>
                <meta charSet='utf-8' />
                <title> {titleURL} | Late Login & Early Check Out Report </title>
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
                        Late Login & Early Check Out Report
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
                                    fromTo={true}
                                    from={filterDate.from}
                                    to={filterDate.to}
                                    locationFilter={true}
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
                            rowCount={lateLoginEarlyCheckoutReport?.numRows || 0}
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

export default LateAndEalyReport;