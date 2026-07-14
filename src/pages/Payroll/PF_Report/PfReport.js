import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get_search_company_based_employee, getEmpbasecompanyAction, getEmpbasecompanyFilterAction, getSearchPfReportAction, lateAndEarlyReportAction, pfReportAction, set_search_company_based_employee, setSearchPfReportAction } from 'redux/actions/attendance_actions';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { FilterAlt } from '@mui/icons-material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import moment from 'moment';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { useCustomFetch } from 'utils/useCustomFetch';
import apiCalls from 'utils/apiCalls';
import { Box, Button, Card, Dialog, DialogContent, Fade, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Tooltip, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import CommonUserAutoComplete from 'utils/commonAutoCompleteForUser';
import CommonSearch from 'utils/commonSearch';
import { formatName } from 'utils/nameFormatter';
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';


const pfReport = (props) => {
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
    const [month, setMonth] = useState();
    const [year, setYear] = useState(0);
    console.log("ddd")
  const [selectedNames, setSelectedNames] = useState(['']);
  const [open,setOpen] = useState(false)

  const [userSelectError, setUserSelectError] = useState('');
  const [selectedAll, setSelectedAll] = useState(false);
  const [month1, setMonth1] = useState(date.getMonth());
  const [isSelectUserEmpty, setIsSelectUserEmpty] = useState(false)

  const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');
  const [value, setValue] = React.useState([]);
  const getCurrentYear = date.getFullYear(); // current year

  const [selectedDepartment, setSelectedDepartment] = useState([]);

    const [searchPageData, setSearchPageData] = useState([])
  const [page1, setPage1] = useState(0)
  const [isApiFinished, setIsApiFinished] = useState(false);

    const [flag, setFlag] = useState(false)
    const [previousDate, setPreviousDate] = useState({
        from: '',
        to: ''
    });

    const [data, setData] = useState({
        page: 0,
        pageSize: 20,
        searchVal: '',
      });

    const monthNames = [
        { id: 1, name: 'January' },
        { id: 2, name: 'February' },
        { id: 3, name: 'March' },
        { id: 4, name: 'April' },
        { id: 5, name: 'May' },
        { id: 6, name: 'June' },
        { id: 7, name: 'July' },
        { id: 8, name: 'August' },
        { id: 9, name: 'September' },
        { id: 10, name: 'October' },
        { id: 11, name: 'November' },
        { id: 12, name: 'December' },
      ];
    const getCurrentMonth = date.getMonth(); // current month - 1

    const filteredMonths = monthNames.filter(
        (month) => month.id <= getCurrentMonth,
      );

    const { attendanceReducer: {   pfReport ,searchCompanyBasedEmployeeFilter,get_empbasecompany}, 
            stockLocationReducer: { stocklocation }, 
            UserCreationReducer: { departmentList },
            rbacReducer: {menuAccess = []}
          } = useSelector((state) => state);

    const dispatch = useDispatch();
    const storage = getsessionStorage();
    const currentMonth = moment().startOf('month');
    const firstDateOfMonth = currentMonth.format('YYYY-MM-DD');
    const lastDateOfMonth = currentMonth.endOf('month').format('YYYY-MM-DD');
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

    console.log(pageCount,'pagecount')

  useEffect(() => {
    dispatch(listStockLocationAction(commoncookie, headerLocationId));
    // Fetch your data or perform other actions here
    const month1 = moment(monthYear.from).month();
    const year2 = moment(monthYear.from).year();

    let previousMonthNumber = date.getMonth() - 1;
    if (previousMonthNumber === -1) { 
        previousMonthNumber = 11
    }
    
    const getPreviousYear = date => {
      const clone = new Date(date.getTime())
      clone.setMonth(date.getMonth() - 1)
      const year = clone.getFullYear()
      
      return year
    }
    const lastMonthYear = getPreviousYear(date)
    setYear(lastMonthYear)
    setMonth(previousMonthNumber + 1)

    const payLoad = {
      salary_month: previousMonthNumber + 1 ,  // Adding 1 as months are 0-based in moment
      salary_year: lastMonthYear,
      pageCount: pageCount,
      numPerPage: pageSize,
      searchString: searchVal,
      selectedEmployees: null,
      headerLocationId: null
    };
     apiCalls(dispatch(pfReportAction(payLoad))).finally(() => setIsApiFinished(true));
  }, []);

  useEffect(() => {
    if (open === true && get_empbasecompany?.length === 0) {
      dispatch(getEmpbasecompanyAction());
    }
  }, [open])

console.log(value,'cc',get_empbasecompany);

    function generateArrayOfYears() {
        var max = new Date().getFullYear();
        var min = max - 9;
        var years = [];
      
        for (var i = max; i >= min; i--) {
          years.push(i);
        }
        return years;
      }

    // useEffect(() => {
    //     const month1 = moment(monthYear.from).month();
    //     const year2 = moment(monthYear.from).year();
    //     if (flag) {
    //         // Construct the payload when previousDate changes
    //         const month1 = moment(previousDate.from).month() + 1;  // Convert to 1-based month
    //         const year2 = moment(previousDate.from).year();
         
    //     const payLoad = {
    //         salary_month: month1,
    //         salary_year: year2,
    //         pageCount: pageCount,
    //         numPerPage: pageSize,
    //         searchString:searchVal ,
    //         selectedEmployees: null,
    //         headerLocationId: null
    //     };


    //     dispatch(pfReportAction(payLoad));
    // }

    // }, [ pageCount, pageSize, searchVal, previousDate]);

    const columns = [
        { field: 'uan_number', headerName: 'UAN Number', width: 180 },
        { field: 'name', headerName: 'Name', width: 180, renderCell: (params) => formatName(params.row.name) },
        { field: 'gross_pay', headerName: 'Gross', width: 120 },
        { field: 'epf', headerName: 'EPF', width: 100 },
        { field: 'eps', headerName: 'EPS', width: 100 },
        { field: 'edli', headerName: 'EDLI', width: 100 },
        { field: 'ee', headerName: 'EE', width: 100 },
        { field: 'epsc', headerName: 'EPSC', width: 100 },
        { field: 'er', headerName: 'ER', width: 100 },
        { field: 'ncp', headerName: 'NCP DAYS', width: 120 },
        { field: 'refunds', headerName: 'Refund', width: 120 },
    ];

    const onLocationchange = (e) => {
        const { value } = e.target;
        setMonthYear((prevMonthYear) => ({
            ...prevMonthYear,
            location: value.includes('') ? [''] : value,
        }));
    }


    const handleMonthChange = (e) => {
        setMonth1(e.target.value);
        setIsApiFinished(false);
      };

   



    const requestSearch = (e) => {
        let val = e.target.value;
        setSearchVal(val)


        dispatch(setSearchPfReportAction({ data: [], numRows: 0 }));
        const payLoad = {
            salary_month: month,
            salary_year: year,
            pageCount: 0,
            numPerPage: pageSize,
            searchString:searchVal ,
            selectedEmployees: null,
            headerLocationId: null
        };
       
        console.log(payLoad, "load");
        dispatch(getSearchPfReportAction(payLoad,setModalTypeHandler,
             (loaderStatus) => {
        setLoaderStatusHandler(loaderStatus);
        // when your loader turns false => API done
        if (loaderStatus === false) {
          setIsApiFinished(true);
        }
      }));
    };

    const cancelSearch = () => {
        setSearchPageData([])
        setPageCount(0)
        setSearchVal('')

        const payLoad = {
            salary_month: month,
            salary_year: year,
            pageCount: 0,
            numPerPage: pageSize,
            searchString:searchVal ,
            selectedEmployees: null,
            headerLocationId: null
        };
        console.log(payLoad, "load");
        dispatch(getSearchPfReportAction(payLoad))
    };

    const handlePageChange = async (page) => {
        setPageCount(page)
        console.log(page,'pagecount',pageCount)
        // const month = moment(monthYear.from).month();
        // const year = moment(monthYear.from).year();
        const payLoad = {
            salary_month: month,
            salary_year: year,
            pageCount: page,
            numPerPage: pageSize,
            searchString:searchVal ,
            selectedEmployees: null,
            headerLocationId: null
        };
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            commoncookie, headerLocationId,
        dispatch(pfReportAction(payLoad))

          ).then(() => {setPage1(page)}).finally(() =>{ 
            
            setIsApiFinished(true)});

    }

    const handlePageSizeChange = async (size) => {
        setPageSize(size)
        setPageCount(0)
        // const month = moment(monthYear.from).month();
        // const payloadYear = moment(monthYear.from).year();
        const payLoad = {
            salary_month: month,
            salary_year: year,
            pageCount: pageCount,
            numPerPage: size,
            searchString:searchVal ,
            selectedEmployees: null,
            headerLocationId: null
        };
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            commoncookie, headerLocationId,
        dispatch(pfReportAction(payLoad))

          ).then(() => {setPage1(size)}).finally(() =>{ 
            
            setIsApiFinished(true)});
    };
    const originalData =   pfReport?.data;
    const dataWithId = originalData?.length ? originalData?.map((row, index) => ({ ...row, id: index })) : []
    const exportdataWithId = pfReport?.export?.length ? pfReport?.export?.map((row, index) => ({ ...row, id: index })) : []
    console.log(  pfReport, 'ss');

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

    const getMonthNumber = (monthName) => {
        const monthMap = {
            Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
            Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12
        };
        return monthMap[monthName];
    };

    const handlePreviousMonthClick = (data,btn) => {
      setSearchVal('')
        setFlag(true)
        setButton(btn)
        console.log(data, 'datahandlereport');
        const month = data.split(' ')[0];
        const year = data.split(' ')[1];
        const monthNumber = getMonthNumber(month); 
        console.log(month,'month',year,'dfsdfsdf',monthNumber)

        const { startDate, endDate } = getStartAndEndDate(month, year)
        console.log(startDate, 'startdateee');
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        setPageCount(0)
        setPreviousDate({ ...previousDate, from: startDateObj, to: endDateObj })
        const year2 = parseInt(year);
        console.log(year2, 'year2 datahandlereport')
        setYear(year2)
        setMonth(monthNumber)
        const payLoad = {
            salary_month: monthNumber,
            salary_year: year,
            pageCount: page1,
            numPerPage: pageSize,
            searchString:searchVal ,
            selectedEmployees: null,
            headerLocationId: null
        };
        

        console.log(payLoad, "load");
        dispatch(getSearchPfReportAction(payLoad))
    }
     const selectedRole = storage?.role_name;
     const reportExport = UserRightsAuthorization(menuAccess[selectedRole], 'reports__salary__pf_report', 'can_export')
    const handleExport = async () => {
      if (!reportExport) return;
        

    //   const formData = {
    //     salary_month: month1,
    //     salary_year: year,
    //     pageCount: 0,
    //     numPerPage: pageSize,
    //     searchString: '',
    //     selectedEmployees:value.map((d)=> d.employee_id),
    //     headerLocationId: null,
    // };
        

    //     const { data: resData } = await customFetch(
    //         `/salary/pfReport`,
    //         'POST',
    //         formData,
    //     );
        // const resData = {data:pfReport}
        const columnHeaders = columns.map(column => column.headerName);
        const rows = pfReport?.data?.map(row => columns.map(column => row[column.field]));


        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += columnHeaders.join(",") + "\n";
        csvContent += rows.map(row => row.join(",")).join("\n");

        // Create a temporary anchor element and trigger download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", 'PF Report' + ".csv");
        document.body.appendChild(link);
        link.click();
    }

    const requestSearchEmployeeFilter = (val) => {

        // let allDept = list_department.map((d) => d.department);
      
        setSearchValEmployeeFilter(val);
        dispatch(set_search_company_based_employee([]));
      
        if (!val) {
          return
        }
      
        let data = {
          
          searchString: val
        }
      
      
      
        dispatch(
          get_search_company_based_employee(
            data,
            // setModalTypeHandler,
            // setLoaderStatusHandler,
          ),
        );
        // }
        // }),
        // );
      
      };

      const handleChangeEmployeeName =(val)=>{
        setValue(val)
        if(val?.length > 0){
          setUserSelectError('');
         
        }
    
    }


    const handleFilterClear = () => {
    
    const firstDay = defaultFrom;
    const lastDay = defaultTo;
     setButton('4')
    setOpen(false)
    setMonthYear({
        empName: [''],
        location: [''],
        department: [''],
        from: moment(firstDay),
        to: moment(lastDay),
    });

   
    setSearchValEmployeeFilter(''); 
    setValue([]); 
    setSelectedDepartment([]); 
    setSelectedNames(['']); 

    setMonth1(null); 
    setYear(null); 
    const month1 = moment(monthYear.from).month();
    const year2 = moment(monthYear.from).year();
    const payLoad = {
      salary_month: month1,  // Adding 1 as months are 0-based in moment
      salary_year: year2,
      pageCount: pageCount,
      numPerPage: pageSize,
      searchString: searchVal,
      selectedEmployees: null,
      headerLocationId: null
    };
    dispatch(pfReportAction(payLoad));
};


      const submitAction = () => {

        if (selectedAll) {
          dispatch(getEmpbasecompanyAction({}, (res) => {
            if (res) {
              processFunction(res)
            }
          }))
        }
        else {
          processFunction(value)
        }
        // setMonth(0);
        // setYear(0);
        setSelectedDepartment([]);
        
      };

      const  processFunction = (value) =>{
          setButton('')
        console.log("value",value)
      //   if (value?.length === 0  ) {
      //     setUserSelectError('Employee is required');
      //     setIsSelectUserEmpty(true);
      //     return;
      // }
        setSelectedNames(value.map((d)=> d.employee_id))
        setUserSelectError('');
        setIsSelectUserEmpty(false);
        const body = {
          salary_month: month1,
          salary_year: year,
          pageCount: 0,
          numPerPage: pageSize,
          searchString: '',
          selectedEmployees:value.map((d)=> d.employee_id),
          headerLocationId: null,
      };
      apiCalls(
          // setModalTypeHandler,
          // setLoaderStatusHandler,
          dispatch(pfReportAction(body)),
      ).finally(() => setIsApiFinished(true));
        // setFilterOpen(false)
        setData({...data, page: 0, searchVal: '' });
        setOpen(false)

      }
      
   

    return (
      <>
        <Helmet>
            <meta charSet='utf-8' />
            <title> {titleURL} | PF Report </title>
        </Helmet>

        {/* Filter Dialog */}
        <Dialog open={open} fullWidth maxWidth="xs">
          <DialogContent>
            <Grid container display='flex' flexDirection='row' alignItems='center' spacing={2}>
              <Grid display={'flex'} justifyContent={'flex-end'} size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
                <Tooltip title='Close' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement='left'>
                  <IconButton aria-label="close" onClick={() => setOpen(false)}>
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
                <FormControl fullWidth error={isSelectUserEmpty}>
                  <CommonUserAutoComplete
                    searchVal={searchValEmployeeFilter}
                    requestSearch={requestSearchEmployeeFilter}
                    value={value}
                    setValue={handleChangeEmployeeName}
                    type={get_empbasecompany}
                    searchType={searchCompanyBasedEmployeeFilter}
                    error={userSelectError}
                    selectedAll={selectedAll}
                    setSelectedAll={setSelectedAll}
                    isMandatory={true}
                  />
                </FormControl>
              </Grid>
              <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Select Month</InputLabel>
                  <Select
                    autoFocus
                    value={month1}
                    label='Select Month'
                    onChange={handleMonthChange}
                    sx={{ height: '42px' }}
                  >
                    {(year === getCurrentYear ? filteredMonths : monthNames).map((m) => (
                      <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
                <FormControl variant='outlined' fullWidth>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={year === 0 ? setYear(getCurrentYear) : year}
                    onChange={(e) => setYear(e.target.value)}
                    sx={{ height: '42px' }}
                    label='Year'
                    required
                  >
                    {generateArrayOfYears().map((year) => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid display={'flex'} justifyContent={'center'} size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
                <Button color='secondary' variant='contained' style={{ marginRight: '20px' }} onClick={handleFilterClear}>
                  Clear
                </Button>
                <Button color='primary' variant='contained' style={{ marginRight: '20px' }} onClick={submitAction}>
                  Submit
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>

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
              PF Report
            </Typography>

            {/* Right: Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CommonSearch
                searchVal={searchVal}
                cancelSearch={cancelSearch}
                requestSearch={requestSearch}
              />
              <Tooltip title='Filter' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement='top'>
                <IconButton size='small' onClick={() => setOpen(true)}>
                  <FilterAlt sx={{ fontSize: 20 }} />
                </IconButton>
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
                rowCount={pfReport?.numRows || 0}
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

export default pfReport;