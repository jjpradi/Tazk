import {
    Autocomplete,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fade,
  FormControl,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  DeviceDeRegisterAction,
  DeviceRegisterReportAction,
  getDeviceRegisterReportAction,
  setDeviceRegisterReportAction,
} from '../../../redux/actions/reports_actions';
import {useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import CommonSearch from 'utils/commonSearch';
import moment from 'moment';
import API_URLS from '../../../utils/customFetchApiUrls';
import {useCustomFetch} from 'utils/useCustomFetch';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import CommonUserAutoCompleteForSingleUser from 'utils/commonAutoCompleteForSingleUser';
import {
  get_search_company_based_employee,
  getEmpbasecompanyFilterAction,
  set_search_company_based_employee,
} from '../../../redux/actions/attendance_actions';
import CommonUserAutoComplete from '../../../utils/commonAutoCompleteForUser';
import _ from "lodash";
import toMomentOrNull from 'utils/DateFixer';
import { formatName } from 'utils/nameFormatter';
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';

const DeviceRegisterReport = () => {
  const navigate = useNavigate();
  const [isApiFinished, setIsApiFinished] = useState(false);

  const {
    reportsReducer: {deviceRegister},
    attendanceReducer: {get_empbasecompany,getCompanyBasedEmployeeFilter, searchCompanyBasedEmployeeFilter},
    rbacReducer: {menuAccess = []}
  } = useSelector((state) => state);

  const data = deviceRegister.data;

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
    status: null,
    name: null,
  });

  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(CreateNewButtonContext);

  const dispatch = useDispatch();
  const storage = getsessionStorage();

  const handleDeRegister = (data) => {
    setDeRegister(true);
    console.log(data.device_id, 'dsjfvjnhkjdks');
    setId(data.device_id);
  };

 const columns = [
  {
    field: 'device_id',
    headerName: 'Device ID',
    width: 220,
  },
  {
    field: 'name',
    headerName: 'Name',
    width: 220,
    renderCell: (params) => formatName(params.row.name),
  },
  {
    field: 'registerDevice_withId',
    headerName: 'Status',
    width: 220,
    renderCell: (params) =>
      params.value === 1 ? 'Active' : 'Inactive',
  },
  {
    field: 'last_active_date',
    headerName: 'Last Active Date',
    width: 220,
    renderCell: (params) =>
      params.value
        ? moment(params.value).format('DD/MM/YYYY')
        : '-',
  },
  {
    field: 'deRegister',
    headerName: 'Action',
    width: 220,
    renderCell: (params) => {
      const isActive = params.row.registerDevice_withId === 1;
      return (
        <Button
          variant="outlined"
          size="small"
          color="error"
          onClick={() => handleDeRegister(params.row)}
          disabled={!isActive}
          sx={{
            textTransform: 'none',
            fontSize: '12px',
            fontWeight: 500,
            borderRadius: '6px',
            px: 2,
            py: 0.5,
            ...(isActive
              ? {
                  borderColor: '#ef5350',
                  color: '#ef5350',
                  '&:hover': {
                    backgroundColor: '#fbe9e7',
                    borderColor: '#d32f2f',
                  },
                }
              : {
                  borderColor: '#bdbdbd',
                  color: '#bdbdbd',
                }),
          }}
        >
          DeRegister
        </Button>
      );
    },
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
    let val = e.target.value;
    setSearchVal(val);
    dispatch(getDeviceRegisterReportAction({data: [], numRows: 0}));
    let payLoad = {
      //   fromDate: moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
      //   toDate: moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
      pageCount: page,
      numPerPage: pageSize,
      searchString: val,
    };
    dispatch(
      setDeviceRegisterReportAction(
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
    dispatch(DeviceRegisterReportAction(payLoad));
  };

  useEffect(() => {
    let payLoad = {
      // fromDate: moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
      // toDate: moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
      pageCount: page,
      numPerPage: pageSize,
      searchString: '',
    };
    dispatch(DeviceRegisterReportAction(payLoad));
  }, [page, pageSize]);

  const exportColumns = columns
    .filter((col) => col.headerName !== 'DeRegister') // remove DeRegister
    .map((col) => ({
      ...col,
      exportValue: (row) => {
        if (col.field === 'registerDevice_withId') {
          return row.device_id === 1 ? 'Active' : 'Inactive';
        }

        if (col.field === 'last_active_date') {
          return row.last_active_date
            ? moment(row.last_active_date).format('DD/MM/YYYY')
            : '';
        }

        return row[col.field] ?? '';
      },
    }));
  const selectedRole = storage?.role_name;
  const reportExport = UserRightsAuthorization(menuAccess[selectedRole], 'reports__attendance__device_register_report', 'can_export')
  const handleExport = async () => {
    if (!reportExport) return;
    const formData = {
      pageCount: page,
      numPerPage: pageSize,
      exportData: true,
      searchString: searchVal,
    };

    const {data: resData} = await customFetch(
      API_URLS.GET_DEVICE_REGISTERED_DETAILS,
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
    link.download = 'Device Register Report.csv';
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
    
    let emp;

    if(value1?.length > 0){
      emp = value1
  .map(emp => emp.employee_id)
  .filter(id => id != null)
  .join(',');
    }

    const payload =  {
        from : filterValues.fromDate || null,
        to : filterValues.toDate || null ,
        status : filterValues.status?.status || null,
        employee : [emp] || [],
        pageCount: page,
        numPerPage: pageSize,
        searchString: '',
    }

    await dispatch(DeviceRegisterReportAction(payload));
    setFilterOpen(false);

  }

  const handleClear = async()=>{
        setFilterValues((prev)=> ({...prev,fromDate:null,toDate:null,status:null}))
        setValue1([])
        const payload =  {
        pageCount: page,
        numPerPage: pageSize,
        searchString: '',
    }

    await dispatch(DeviceRegisterReportAction(payload));
    setFilterOpen(false);
  }

  return (
    <div>
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | Device Register Report</title>
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
            Device Register Report
          </Typography>

          {/* Right: Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CommonSearch
              searchVal={searchVal}
              cancelSearch={cancelSearch}
              requestSearch={requestSearch}
            />
            <Tooltip title='Filter' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement='top'>
              <IconButton size='small' onClick={() => setFilterOpen(true)}>
                <FilterAltIcon sx={{ fontSize: 20 }} />
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
          <DataGrid
            rows={dataWithId}
            columns={columns}
            pageSizeOptions={[20, 50, 100]}
            paginationMode='server'
            density='compact'
            disableRowSelectionOnClick
            disableExtendRowFullWidth
            rowCount={deviceRegister?.numRows || 0}
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
        </Box>
      </Card>
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
                  value={toMomentOrNull(filterValues.fromDate)}
                  format='DD/MM/YYYY'
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
                  value={toMomentOrNull(filterValues.toDate)}
                  format='DD/MM/YYYY'
                  onChange={(date) =>
                    handleChange('toDate', moment(date).format('YYYY-MM-DD'))
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
            <Autocomplete
                
                fullWidth
                options={_.uniqBy(status, "status")}
                getOptionLabel={(option) => option?.status?.toString() || ''}
                value={filterValues.status || []}
                onChange={(event, newValue) => handleChange('status', newValue)}
                renderInput={(params) => (
                    <TextField
                    {...params}
                    label="Status"
                    variant="filled"
                    />
                )}
            />
            </Grid>
          

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <FormControl fullWidth variant='filled'>
                <CommonUserAutoComplete
                    searchVal={searchValEmployeeFilter}


                    requestSearch={requestSearchEmployeeFilter}
                    value={value1}
                    setValue={handleChangeEmployeeName}
                    type={getCompanyBasedEmployeeFilter}
                    searchType={searchCompanyBasedEmployeeFilter}

                    error={userSelectError}
                    selectedAll={selectedAll}
                    setSelectedAll={setSelectedAll}
                    isMandatory={true}
                    />
              </FormControl>
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
      <Dialog
        open={Boolean(register)}
        onClose={() => setDeRegister(false)}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle sx={{pb: 1}}>Deregister Device</DialogTitle>

        <DialogContent>
          <DialogContentText sx={{mb: 1.5}}>
            This device will be removed from active registration and marked as
            inactive.
          </DialogContentText>
          <DialogContentText sx={{mb: 1.5}}>
            Device ID: <strong>{id || '-'}</strong>
          </DialogContentText>
          <DialogContentText>
            You can continue only if you are sure this device should no longer
            stay registered.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeRegister(false)} color='primary'>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDeRegister}
            color='error'
            variant='contained'
          >
            Deregister
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DeviceRegisterReport;
