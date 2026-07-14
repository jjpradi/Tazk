import {
    Autocomplete,
  Breadcrumbs,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import DataGridTemp from '../../../components/dataGridTemp';
import {
  DeviceDeRegisterAction,
  DeviceRegisterReportAction,
  fraudLogsAction,
  getDeviceRegisterReportAction,
  getfraudLogsAction,
  setDeviceRegisterReportAction,
  setfraudLogsAction,
} from '../../../redux/actions/reports_actions';
import {useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import CommonFilter from '../../../components/pos/payment_section/CommonFilter';
import moment from 'moment';
import API_URLS from '../../../utils/customFetchApiUrls';
import {useCustomFetch} from 'utils/useCustomFetch';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
// import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import CommonUserAutoCompleteForSingleUser from 'utils/commonAutoCompleteForSingleUser';
import {
  get_search_company_based_employee,
  getEmpbasecompanyFilterAction,
  set_search_company_based_employee,
} from '../../../redux/actions/attendance_actions';
import CommonUserAutoComplete from '../../../utils/commonAutoCompleteForUser';
import toMomentOrNull from '../../../utils/DateFixer'
import { formatName } from 'utils/nameFormatter';



const FraudLogsReport = () => {
  const [isApiFinished, setIsApiFinished] = useState(false);

  const {
    reportsReducer: {getFraudLogs},
    attendanceReducer: {get_empbasecompany,getCompanyBasedEmployeeFilter, searchCompanyBasedEmployeeFilter},
  } = useSelector((state) => state);

  const data = getFraudLogs.data;

  const customFetch = useCustomFetch();

  const dataWithId = data?.length
    ? data?.map((row, index) => ({...row, id: index}))
    : [];

  const [page, setPage] = useState(0);
  const [searchVal, setSearchVal] = useState('');
  const [pageSize, setPageSize] = useState(20);
  const [register, setDeRegister] = useState(false);
  const [id, setId] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');
  const [value1, setValue1] = useState([]);
    const [userSelectError, setUserSelectError] = useState('');
      const [selectedAll, setSelectedAll] = useState(false);

  const [filterValues, setFilterValues] = useState({
    fromDate: null,
    toDate: null,
  });

  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(CreateNewButtonContext);

  const dispatch = useDispatch();

  const handleDeRegister = (data) => {
    setDeRegister(true);
    console.log(data.device_id, 'dsjfvjnhkjdks');
    setId(data.device_id);
  };

 const columns = [
  {
    field: 'name',
    headerName: 'Full Name',
    width: 220,
     flex: 1,
    renderCell: (params) => formatName(params.row.name),
  },
  {
    field: 'code',
    headerName: 'Emp Code',
    width: 220,
     flex: 1,
    renderCell: (params) =>
      params.value
        ? params.value
        : '-',
  },
  {
    field: 'username',
    headerName: 'UserName',
    flex: 1,
    width: 220,
  },
  {
    field: 'error_message',
    headerName: 'Error',
    flex: 1,
    width: 220,
  },
  {
    field: 'createdAt',
    headerName: 'Date',
    width: 220,
    flex: 1,
    renderCell: (params) =>
        params.value
          ? moment(params.value).format('DD/MM/YYYY hh:mm A')
          : '-',
  },

];


  const handlePageChange = (page) => {
    setPage(page);
  };

  const handlePageSizeChange = (size) => {
    setPage(0);
    setPageSize(size);
  };

  const status = [
    {key : '1',status : 'Active'},
    {key : '2',status :'InActive'}
  ]

  const requestSearch = (e) => {
    let val = e;
    setSearchVal(val);
    dispatch(getfraudLogsAction({data: [], numRows: 0}));
    let payLoad = {
      pageCount: page,
      numPerPage: pageSize,
      searchString: val,
    };
    dispatch(
      setfraudLogsAction(
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
    setPage(0);
    setSearchVal('');

    let payLoad = {
      // fromDate: moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
      // toDate: moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
      pageCount: page,
      numPerPage: pageSize,
      searchString: '',
    };
    dispatch(fraudLogsAction(payLoad));
  };

  useEffect(() => {
    let payLoad = {
      // fromDate: moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
      // toDate: moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
      pageCount: page,
      numPerPage: pageSize,
      searchString: '',
    };
    dispatch(fraudLogsAction(payLoad));
  }, [page, pageSize]);

  const exportColumns = columns
    .map((col) => ({
      ...col,
      exportValue: (row) => {

        if (col.field === 'createdAt') {
          return row.createdAt
            ? moment(row.createdAt).format('DD/MM/YYYY')
            : '';
        }

        return row[col.field] ?? '';
      },
    }));

  const handleExport = async () => {
    const formData = {
      pageCount: page,
      numPerPage: pageSize,
      exportData: true,
      searchString: searchVal,
    };

    const {data: resData} = await customFetch(
      API_URLS.GET_FRAUD_LOGS,
      'POST',
      formData,
    );

    if (!resData?.data?.length) {
      alert('No data');
      return;
    }

    // CSV Headers
    const columnHeaders = exportColumns.map((col) => col.headerName);

    // CSV Rows with transformed values
    const rows = resData.data.map((row) =>
      exportColumns.map((col) => col.exportValue(row)),
    );

    // Build CSV
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += columnHeaders.join(',') + '\n';
    csvContent += rows.map((row) => row.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = 'fraud Logs Report.csv';
    document.body.appendChild(link);
    link.click();
  };

  const handleConfirmDeRegister = async () => {
    dispatch(DeviceDeRegisterAction({device_id: id}));
    let payLoad = {
      // fromDate: moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
      // toDate: moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
      pageCount: page,
      numPerPage: pageSize,
      searchString: '',
    };
    await dispatch(DeviceRegisterReportAction(payLoad));
    setDeRegister(false);
  };

  const handleChange = (name, value) => {
    setFilterValues((prevData) => {
      const newFormData = {...prevData, [name]: value || null};
      return newFormData;
    });
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
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    );
    // }
    // }),
    // );
  };

  const handleChangeEmployeeName = (val) => {
    setValue1(val);

  };

  useEffect(()=>{
    
    if(filterOpen){
        dispatch(getEmpbasecompanyFilterAction({searchString : ''}))
    }  
  },[filterOpen])

  const handleApply = async()=>{

    const payload =  {
        from : filterValues.fromDate || null,
        to : filterValues.toDate || null ,
        pageCount: page,
        numPerPage: pageSize,
        searchString: '',
    }

    await dispatch(fraudLogsAction(payload));
    setFilterOpen(false);

  }

  const handleClear = async()=>{
        setFilterValues((prev)=> ({...prev,fromDate:null,toDate:null}))
        const payload =  {
        pageCount: page,
        numPerPage: pageSize,
        searchString: '',
    }

    await dispatch(fraudLogsAction(payload));
    setFilterOpen(false);
  }
  const safeRowCount = Number.isFinite(Number(getFraudLogs?.numRows)) ? Number(getFraudLogs.numRows) : 0;

  return (
    <div>
      <DataGridTemp
        columns={columns}
        columnData={columns}
        isApiFinished={true}
        rowData={dataWithId}
        exportData={true}
        data={dataWithId}
        pageSize={pageSize}
        pageType='deregister'
        page={page}
        type='latestPayrollReport'
        onPageChange={(page) => handlePageChange(page)}
        onPageSizeChange={(size) => handlePageSizeChange(size)}
        requestSearch={(e) => requestSearch(e.target.value)}
        cancelSearch={cancelSearch}
        title={
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize='small' />}
            aria-label='breadcrumb'
          >
            {/* <Link
              href='/report'
              underline='hover'
              sx={{display: 'flex', alignItems: 'center'}}
            >
              <HomeIcon sx={{mr: 0.5}} fontSize='inherit' />
              Home
            </Link> */}
            <Typography className='page-title'>
              Fraud Logs Report
            </Typography>
          </Breadcrumbs>
        }
        rowCount={safeRowCount}
        handleExport={handleExport}
        searchVal={searchVal}
        filter={
          <div style={{display: 'flex', alignItems: 'center'}}>
            <IconButton onClick={() => setFilterOpen(true)}>
              <FilterAltIcon />
            </IconButton>
          </div>
        }
      />
      <Dialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogContent>
          <Grid container spacing={3} justifyContent='center' sx={{padding: 2}}>
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  label='From Date'
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'filled',
                    },
                  }}
                  format='DD/MM/YYYY'
                  value={toMomentOrNull(filterValues.fromDate)}
                  onChange={(date) =>
                    handleChange(
                      'fromDate',(moment(date).format('YYYY-MM-DD')),
                    )
                  }
                />
              </LocalizationProvider>
            </Grid>

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  label='To Date'
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'filled',
                    },
                  }}
                  format='DD/MM/YYYY'
                  value={toMomentOrNull(filterValues.toDate || null)}
                  onChange={(date) =>
                    handleChange('toDate', moment(date).format('YYYY-MM-DD'))
                  }
                />
              </LocalizationProvider>
            </Grid>

          </Grid>
        </DialogContent>

        <DialogActions sx={{justifyContent: 'flex-end', paddingBottom: 2}}>
          <Button variant='contained' color='error' onClick={handleClear}>
            Clear
          </Button>
          <Button variant='contained' color='primary' onClick={handleApply}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FraudLogsReport;
