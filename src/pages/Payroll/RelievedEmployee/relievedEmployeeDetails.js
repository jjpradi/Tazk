import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import CommonFilter from 'components/pos/payment_section/CommonFilter';
import moment from 'moment';
import {useCustomFetch} from 'utils/useCustomFetch';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import CommonSearch from 'utils/commonSearch';
import { getRelievedEmployeeDetailsAction, getSearchRelievedEmployeeDetails, setSearchRelievedEmployeeDetails } from 'redux/actions/reports_actions';
import { Box, Card, Fade, IconButton, Tooltip, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import apiCalls from 'utils/apiCalls';
import API_URLS from '../../../utils/customFetchApiUrls';
import { formatName } from 'utils/nameFormatter';
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

const RelievedEmployeeDetails = (props) => {
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

    const [searchVal, setSearchVal] = useState('')
    const [pageSize, setPageSize] = useState(20);
    const [open,setOpen] = useState(false);
    const [button, setButton] = useState('4');
    const [page, setPage] = useState(0);
    const [filterOpen, handleFilter] = useState(false);
    const [searchPageData, setSearchPageData] = useState([])
    const [count, setCount] = useState(0)
    const currentMonth = moment().startOf('month');
    const firstDateOfMonth = currentMonth.format('YYYY-MM-DD');
    const lastDateOfMonth = currentMonth.endOf('month').format('YYYY-MM-DD');
    const [flag, setFlag] = useState(false);
    const [isApiFinished, setIsApiFinished] = useState(false);
    const [previousDate, setPreviousDate] = useState({
        from: '',
        to: ''
    });
    const [monthYear, setMonthYear] = React.useState({
        empName: [''],
        location: [''],
        from: moment(firstDateOfMonth),
        to: moment(lastDateOfMonth),
    });

    const { reportsReducer: {relievedEmpDetails},
            attendanceReducer:{get_empbasecompany},
            stockLocationReducer: {stocklocation}, rbacReducer: {menuAccess = []} } = useSelector((state) => state);

    const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(CreateNewButtonContext);

    const dispatch = useDispatch();
    const storage = getsessionStorage()

    useEffect(() => {
        setSearchRelievedEmployeeDetails({ data: [], numRows: 0 });

    let payLoad
    if (!flag) {
        payLoad = {
            fromDate: moment(filterDate.from).format('YYYY-MM-DD'),
            toDate: moment(filterDate.to).format('YYYY-MM-DD'),
            pageCount: page,
            numPerPage: pageSize,
            searchString: "",
            employee_id: [],
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
            location: []
        }
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
    dispatch(getRelievedEmployeeDetailsAction(payLoad)),
    dispatch(listStockLocationAction(commoncookie, headerLocationId)),
    ).finally(() =>
        { 
          setIsApiFinished(true)
          setLoaderStatusHandler(false)
        })
    }, [page, pageSize])

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const columns = [
        { field: 'employeeId', headerName: 'Emp Code', width: 220 },
        { field: 'full_name', headerName: 'Name', width: 220,  renderCell: (params) => formatName(params.row.full_name),},
        { field: 'designation', headerName: 'Designation', width: 220 },
        { field: 'department', headerName: 'Department', width: 230 },
        {
            field: 'dateOfJoining',
            headerName: 'Join Date',
            width: 230,
            renderCell: (params) => formatDate(params.row.dateOfJoining)
        },
        {
            field: 'releiving_date',
            headerName: 'Relieve Date',
            width: 230,
            renderCell: (params) => formatDate(params.row.releiving_date)
        }
    ];
    
    const handlePageChange = async (page) => {
        setPage(page)
    }

    const handlePageSizeChange = async (size) => {
        setPage(0);
        setPageSize(size)
    };

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
        setFilterDate({ ...filterDate, [data.target.name]: date_val });
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

    const cancelSearch = () =>{
    
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
            location: []
        }
        dispatch(getRelievedEmployeeDetailsAction(payLoad))
      };

      const requestSearch = (e) => {
        let val = e.target.value;
        setSearchVal(val)
        dispatch(setSearchRelievedEmployeeDetails({data:[], numRows:0}));
        let payLoad = {
          fromDate: moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
          toDate: moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
          pageCount: page,
          numPerPage: pageSize,
          searchString: val,
          employee_id: [],
          location: []
        }
        dispatch(getSearchRelievedEmployeeDetails(payLoad, setModalTypeHandler, (loaderStatus) => {
        setLoaderStatusHandler(loaderStatus);
        // when your loader turns false => API done
        if (loaderStatus === false) {
          setIsApiFinished(true);
        }
      }))
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
        from: moment(defaultFrom).format('YYYY-MM-DD'),
        to: moment(defaultTo).format('YYYY-MM-DD'),
        })
       let payLoad = {
        fromDate: moment(defaultFrom).format('YYYY-MM-DD'),
        toDate: moment(defaultTo).format('YYYY-MM-DD'),
        pageCount: page,
        numPerPage: pageSize,
        searchString: "",
        employee_id: [],
        location: []
        }
      dispatch(getSearchRelievedEmployeeDetails(payLoad, setModalTypeHandler, setLoaderStatusHandler))
      dispatch(listStockLocationAction(commoncookie, headerLocationId))
        
      }

      const ApplyButton = async (val) => {
        setSearchVal('')
        setButton('')
        setFlag(false)
        setMonthYear({...monthYear,empName:val?.map(v => v?.employee_id)})
      
        let payLoad = {
            fromDate: moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
            toDate: moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
            pageCount: 0,
            numPerPage: pageSize,
            searchString: "",
            employee_id: val?.map(v => v?.employee_id),
            location: monthYear.location
        }
        setPage(0)
        dispatch(getRelievedEmployeeDetailsAction(payLoad))
        handleFilter(false)
      
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
        setSearchPageData([])
        setPage(0)
        setSearchVal('')
        setFlag(true)
        const month = data.split(' ')[0];
        const year = data.split(' ')[1];
        const { startDate, endDate } = getStartAndEndDate(month, year)
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
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
            location: [],
            employee_id: []
        }

        dispatch(getRelievedEmployeeDetailsAction(payLoad))
    }
    const selectedRole = storage?.role_name;
    const reportExport = UserRightsAuthorization(menuAccess[selectedRole], 'reports__referance__relieved_employee', 'can_export')
    const handleExport = async () => {
        if (!reportExport) return;
        let formData = {
            fromDate: moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
            toDate: moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
            exportData: true,
            searchString: searchVal,
            employee_id: monthYear.empName,
            location: []
        }
    
        const { data: resData } = await customFetch(
            API_URLS.GET_RELIEVED_EMPLOYEE_DETAILS,
            'POST',
            formData
        );

          if (!resData || !resData.data) {
            console.error("Unexpected", resData);
            alert("No data ");
            return;
        }
    
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
        link.setAttribute("download", 'Relieved Employee Reports' + ".csv");
        document.body.appendChild(link);
        link.click();
    }
    // console.log('Data in relievedEmpDetails:', relievedEmpDetails);
    const finalData = relievedEmpDetails.data
    const dataWithId = finalData?.length ? finalData?.map((row, index) => ({ ...row, id: index })) : []

    return (
        <>
            <Helmet>
                <meta charSet='utf-8' />
                <title> {titleURL} | Relieved Employee Reports </title>
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
                        Relieved Employee Reports
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <CommonSearch
                            searchVal={searchVal}
                            cancelSearch={cancelSearch}
                            requestSearch={requestSearch}
                        />
                        <Tooltip title='Filter' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement='top'>
                            {/* <IconButton size='small'> */}
                                <CommonFilter
                                    type='ReleivingEmployee'
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
                                    reportType={'releivedEmp'}
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
                            rowCount={relievedEmpDetails?.numRows || 0}
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

export default RelievedEmployeeDetails;