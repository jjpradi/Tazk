import React, {useContext, useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogContent,
  Fade,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@mui/material';
import {DataGrid} from '@mui/x-data-grid';
import {useDispatch, useSelector} from 'react-redux';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {FilterAlt} from '@mui/icons-material';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import CloseIcon from '@mui/icons-material/Close';
import CommonSearch from 'utils/commonSearch';
import {
  salaryStatementAction,
  setSalaryStatement,
} from 'redux/actions/salary_actions';
import moment from 'moment';
import {Helmet} from 'react-helmet-async';
import {titleURL} from 'http-common';
import apiCalls from 'utils/apiCalls';
import {
  get_search_company_based_employee,
  getEmpbasecompanyAction,
  set_search_company_based_employee,
} from 'redux/actions/attendance_actions';
import CommonUserAutoComplete from 'utils/commonAutoCompleteForUser';
import { formatName } from 'utils/nameFormatter';
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

const SalaryStatement = () => {
  const navigate = useNavigate();
  const [paginateData, setPaginateData] = useState({
    searchString: '',
    pageSize: 20,
    pageCount: 0,
  });

  const dispatch = useDispatch();
  const storage = getsessionStorage();
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(CreateNewButtonContext);

  const yesterday = new Date();

  const [isApiFinished, setIsApiFinished] = useState(false);

  yesterday.setDate(yesterday.getDate() - 1);

  const date = new Date();
  // const customFetch = useCustomFetch();
  // const defaultFrom = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const lastDayOfPreviousMonth = new Date(
    date.getFullYear(),
    date.getMonth(),
    0,
  );
  // const defaultTo = new Date(lastDayOfPreviousMonth.getFullYear(), lastDayOfPreviousMonth.getMonth(), lastDayOfPreviousMonth.getDate());

  const {
    SalaryReducers: {salaryStatement},
    attendanceReducer: {searchCompanyBasedEmployeeFilter, get_empbasecompany},
    rbacReducer: {menuAccess = []}
  } = useSelector((state) => state);

  const [button, setButton] = useState('4');

  const columns = [
    {field: 'employee_code', headerName: 'E.Code', width: 180},
    {field: 'name', headerName: 'Employee', width: 180, renderCell: (params) => formatName(params.row.name)},
    {
      field: 'date_of_joining',
      headerName: 'Joining Date',
      width: 180,
      valueFormatter: (params) => params.value ? moment(params.value).format("DD/MM/YYYY") : ''
    },
    {field: 'ctc', headerName: 'CTC', width: 180},
    {field: 'basic_pay', headerName: 'BASIC', width: 180},
    {field: 'house_rent_allowance', headerName: 'HRA', width: 180},
    {field: 'conveyance_allowance', headerName: 'Conv.All', width: 180},
    {field: 'medical_allowance', headerName: 'Med.All', width: 180},
    {field: 'special_allowance', headerName: 'Spe.All', width: 180},
    {field: 'gross_salary', headerName: 'Gross Salary', width: 180},
    {field: 'emp_pf', headerName: 'Emee PF', width: 180},
    {field: 'net_pay', headerName: 'Net Pay', width: 180},
  ];

  const handlePageChange = async (page) => {
    await setPaginateData({...paginateData, pageCount: page});

    const payload = {
      salary_month: month,
      salary_year: year,
      searchString: paginateData.searchString,
      numPerPage: paginateData.pageSize,
      pageCount: page,
      selectedEmployees: null,
      headerLocationId: null,
    };
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      commoncookie,
      headerLocationId,
      dispatch(salaryStatementAction(payload)),
    );
    // dispatch(salaryStatementAction(payload));
  };

  const handleSizeChange = (size) => {
    setPaginateData({...paginateData, pageSize: size});
  };

  const requestSearch = (e) => {
    const val = e.target.value;
    setPaginateData({...paginateData, searchString: val});
    setLoaderStatusHandler(true);

    const payload = {
      salary_month: month,
      salary_year: year,
      searchString: val,
      numPerPage: paginateData.pageSize,
      pageCount: paginateData.pageCount,
      selectedEmployees: null,
      headerLocationId: null,
    };
    dispatch(
      setSalaryStatement(payload, setModalTypeHandler,         
        (loaderStatus) => {
        setLoaderStatusHandler(loaderStatus);
        if (loaderStatus === false) {
          setIsApiFinished(true);
        }
      }),
    );
  };

  const cancelSearch = () => {
    setPaginateData({...paginateData, searchString: ''});

    const payload = {
      salary_month: month,
      salary_year: year,
      searchString: '',
      numPerPage: paginateData.pageSize,
      pageCount: paginateData.pageCount,
      selectedEmployees: null,
      headerLocationId: null,
    };
    dispatch(
      setSalaryStatement(payload, setModalTypeHandler, setLoaderStatusHandler),
    );
  };

  const [previousDate, setPreviousDate] = useState({
    from: '',
    to: '',
  });

  console.log(previousDate, 'previousDate');

  const [month, setMonth] = useState('');
  const [year, setYear] = useState('0');

  console.log(month, year, '1234gggg');

  const getMonthNumber = (monthName) => {
    const monthMap = {
      Jan: 1,
      Feb: 2,
      Mar: 3,
      Apr: 4,
      May: 5,
      Jun: 6,
      Jul: 7,
      Aug: 8,
      Sep: 9,
      Oct: 10,
      Nov: 11,
      Dec: 12,
    };
    return monthMap[monthName];
  };

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
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth();

  const currentMonth = moment().startOf('month');
  const firstDateOfMonth = currentMonth.format('YYYY-MM-DD');
  const lastDateOfMonth = currentMonth.endOf('month').format('YYYY-MM-DD');
  const [isSelectUserEmpty, setIsSelectUserEmpty] = useState(false);
  const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');
  const [value, setValue] = useState([]);
  const [userSelectError, setUserSelectError] = useState('');
  const [selectedAll, setSelectedAll] = useState(false);
  const [month1, setMonth1] = useState(currentDate.getMonth());
  const defaultTo = new Date(
    lastDayOfPreviousMonth.getFullYear(),
    lastDayOfPreviousMonth.getMonth(),
    lastDayOfPreviousMonth.getDate(),
  );
  const defaultFrom = new Date(date.getFullYear(), date.getMonth() - 1, 1);

  const [open, setOpen] = useState();
  const [monthYear, setMonthYear] = React.useState({
    empName: [''],
    location: [''],
    department: [''],
    from: moment(firstDateOfMonth),
    to: moment(lastDateOfMonth),
  });
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

  const requestSearchEmployeeFilter = (val) => {
    // let allDept = list_department.map((d) => d.department);

    setSearchValEmployeeFilter(val);
    dispatch(set_search_company_based_employee([]));

    if (!val) {
      return;
    }

    let data = {
      searchString: val,
    };

    dispatch(
      get_search_company_based_employee(
        data,
        // setModalTypeHandler,
        // setLoaderStatusHandler,
      ),
    );
  };

  const handleChangeEmployeeName = (val) => {
    setValue(val);
    if (val?.length > 0) {
      setUserSelectError('');
    }
  };

  const handlePreviousMonthClick = (data, btn) => {
    setButton(btn);

    const [monthName, yearStr] = data.split(' ');
    let year = parseInt(yearStr, 10);
    const monthNumber = getMonthNumber(monthName);
    const currentMonthNumber = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    console.log('tryyyyyyyyy');

    const {startDate, endDate} = getStartAndEndDate(monthName, year);
    setPreviousDate({...previousDate, from: startDate, to: endDate});
    setYear(year);
    setMonth(monthNumber);

    const payload = {
      salary_month: monthNumber,
      salary_year: year,
      searchString: '',
      numPerPage: 20,
      pageCount: 0,
      selectedEmployees: null,
      headerLocationId: null,
    };

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      commoncookie,
      headerLocationId,
      dispatch(salaryStatementAction(payload)),
    );
  };

  const monthNames = [
    {id: 1, name: 'January'},
    {id: 2, name: 'February'},
    {id: 3, name: 'March'},
    {id: 4, name: 'April'},
    {id: 5, name: 'May'},
    {id: 6, name: 'June'},
    {id: 7, name: 'July'},
    {id: 8, name: 'August'},
    {id: 9, name: 'September'},
    {id: 10, name: 'October'},
    {id: 11, name: 'November'},
    {id: 12, name: 'December'},
  ];

  const rows = salaryStatement.data?.length
    ? salaryStatement.data.map((row, index) => ({id: index, ...row}))
    : [];

  useEffect(() => {
    if (open === true && get_empbasecompany?.length === 0) {
      dispatch(getEmpbasecompanyAction());
    }
  }, [open]);

  useEffect(() => {
    let previousMonthNumber = date.getMonth();
    let previousYear = date.getFullYear();
    if (previousMonthNumber === -1) {
      previousMonthNumber = 11;
      previousYear -= 1;
    }

    // const getPreviousYear = date => {
    //   const clone = new Date(date.getTime())
    //   clone.setMonth(date.getMonth() - 1)
    //   const year = clone.getFullYear()

    //   return year
    // }
    // const lastMonthYear = getPreviousYear(date)
    setYear(previousYear);
    setMonth(previousMonthNumber + 1);
    const payload = {
      salary_month: previousMonthNumber + 1,
      salary_year: previousYear,
      searchString: paginateData.searchString,
      numPerPage: paginateData.pageSize,
      pageCount: paginateData.pageCount,
      selectedEmployees: null,
      headerLocationId: null,
    };
        apiCalls(
          dispatch(salaryStatementAction(payload)).finally(() => setIsApiFinished(true))
        )
  }, []);

  console.log(button, 'butt00000');

  useEffect(() => {
    setPaginateData({
      ...paginateData,
      pageCount: 0,
      pageSize: 20,
      searchString: '',
    });
  }, [button]);

  const handleMonthChange = (e) => {
    setMonth1(e.target.value);
  };

  const filteredMonths = monthNames.filter(
    (month) => month.id <= currentMonthIndex,
  );

  function generateArrayOfYears() {
    var max = new Date().getFullYear();
    var min = max - 9;
    var years = [];

    for (var i = max; i >= min; i--) {
      years.push(i);
    }
    return years;
  }

  const submitAction = () => {
    if (selectedAll) {
      dispatch(
        getEmpbasecompanyAction({}, (res) => {
          if (res) {
            processFunction(res);
          }
        }),
      );
    } else {
      processFunction(value);
    }
    // setMonth(0);
    // setYear(0);
  };

  const processFunction = (value) => {
    setButton('');
    console.log('value', value);
    if (value?.length === 0) {
      setUserSelectError('Employee is required');
      setIsSelectUserEmpty(true);
      return;
    }
    setUserSelectError('');
    setIsSelectUserEmpty(false);
    const body = {
      salary_month: month1,
      salary_year: year,
      pageCount: 0,
      numPerPage: paginateData.pageSize,
      searchString: '',
      selectedEmployees: value.map((d) => d.employee_id),
      headerLocationId: null,
    };
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(salaryStatementAction(body)),
    );
    setOpen(false);
  };

  const handleFilterClear = () => {
    const firstDay = defaultFrom;
    const lastDay = defaultTo;
    setButton('4');
    setOpen(false);
    setMonthYear({
      empName: [''],
      location: [''],
      department: [''],
      from: moment(firstDay),
      to: moment(lastDay),
    });

    setSearchValEmployeeFilter('');
    setValue([]);

    setMonth1(null);
    setYear(null);
    const month1 = moment(monthYear.from).month();
    const year2 = moment(monthYear.from).year();
    const payLoad = {
      salary_month: month, // Adding 1 as months are 0-based in moment
      salary_year: year,
      pageCount: paginateData.pageCount,
      numPerPage: paginateData.pageSize,
      searchString: paginateData.searchString,
      selectedEmployees: null,
      headerLocationId: null,
    };
    dispatch(salaryStatementAction(payLoad));
  };
  const selectedRole = storage?.role_name;
  const reportExport = UserRightsAuthorization(menuAccess[selectedRole], 'reports__salary__salary_structure_report', 'can_export')
  const handleExport = async () => {
    if (!reportExport) return;
    const columnHeaders = columns.map((column) => column.headerName);
    const rows = salaryStatement?.data?.map((row) =>
      columns.map((column) => row[column.field]),
    );

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += columnHeaders.join(',') + '\n';
    csvContent += rows.map((row) => row.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Salary Structure Report' + '.csv');
    document.body.appendChild(link);
    link.click();
  };

  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | Salary Structure Report</title>
      </Helmet>

      {/* Filter Dialog */}
      <Dialog open={open} fullWidth maxWidth="xs">
        <DialogContent>
          <Grid container display='flex' flexDirection='row' alignItems='center' spacing={2}>
            <Grid display={'flex'} justifyContent={'flex-end'} size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
              <Tooltip title='Close' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement='left'>
                <IconButton aria-label='close' onClick={() => setOpen(false)}>
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
                  sx={{height: '42px'}}
                >
                  {(year === currentYear ? filteredMonths : monthNames).map((m) => (
                    <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
              <FormControl variant='outlined' fullWidth>
                <InputLabel>Year</InputLabel>
                <Select
                  value={year === 0 ? setYear(currentYear) : year}
                  onChange={(e) => setYear(e.target.value)}
                  sx={{height: '42px'}}
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
              <Button color='secondary' variant='contained' style={{marginRight: '20px'}} onClick={handleFilterClear}>
                Clear
              </Button>
              <Button color='primary' variant='contained' style={{marginRight: '20px'}} onClick={submitAction}>
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
          <Typography sx={{ fontWeight: 600, fontSize: '15px', whiteSpace: 'nowrap' }}>
            Salary Structure Report
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CommonSearch
              searchVal={paginateData.searchString}
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
              rows={rows}
              columns={columns}
              pageSizeOptions={[20, 50, 100]}
              paginationMode='server'
              density='compact'
              disableRowSelectionOnClick
              disableExtendRowFullWidth
              rowCount={salaryStatement?.numRows || 0}
              paginationModel={{ page: paginateData.pageCount, pageSize: paginateData.pageSize }}
              onPaginationModelChange={(model) => {
                if (model.page !== paginateData.pageCount) handlePageChange(model.page);
                if (model.pageSize !== paginateData.pageSize) handleSizeChange(model.pageSize);
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

export default SalaryStatement;
