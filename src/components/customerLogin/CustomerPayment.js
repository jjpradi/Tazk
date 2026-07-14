import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import {
  Autocomplete,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  TextField,
} from '@mui/material';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import React, {useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import CommonSearch from 'utils/commonSearch';
import {headerStyle, cellStyle, maxBodyHeight} from 'utils/pageSize';
import moment from 'moment';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import {
  CustomerpaymentAction,
  getCustomerpaymentAction,
  listCustomerAction,
  setCustomerpaymentAction,
} from 'redux/actions/customer_actions';
import {getsessionStorage} from 'pages/common/login/cookies';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import toMomentOrNull from 'utils/DateFixer';

const Customerpayment = (props) => {
  const dispatch = useDispatch();

  const [customerIndex, setCustomerIndex] = useState(15208);

  const [filter, setFilter] = useState(false);

  const [fromDate, setFromDate] = useState(
    moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD'),
  );
  const [toDate, setToDate] = useState(
    moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD'),
  );

  const [rangeOption, setRangeOption] = useState(null);

  const rangeOptions = ['This Week', 'This Year'];

  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(CreateNewButtonContext);

  const {
    customerReducer: {customerPayment},
  } = useSelector((state) => state);

  const storage = getsessionStorage();

  useEffect(() => { (async () => {
    await dispatch(
      listCustomerAction(
        null,
        null,
        () => {},
        (response) => {
          const index = response.find((e) => e.person_id === storage.person_id);
          console.log(index, response, 'responssddd555');
          setCustomerIndex(15208);
        },
      ),
    );
  })();
}, []);

  const [paginateData, setPaginateData] = useState({
    searchString: '',
    pageCount: 0,
    pageSize: 20,
  });

  // console.log(rowData)

  const requestSearch = (e) => {
    const val = e.target.value;

    setPaginateData({...paginateData, searchString: val});

    dispatch(
        setCustomerpaymentAction({
        data: [],
        numRows: 0,
      }),
    );

    const payload = {
      searchString: val,
      pageCount: 0,
      numPerPage: paginateData.pageSize,
      customerId: customerIndex,
      from: moment(fromDate).format('YYYY-MM-DD'),
      to: moment(toDate).format('YYYY-MM-DD'),
    };
    dispatch(
        getCustomerpaymentAction(
        payload,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    );
  };

  const cancelSearch = () => {
    setPaginateData({...paginateData, searchString: ''});

    dispatch(
        setCustomerpaymentAction({
        data: [],
        numRows: 0,
      }),
    );

    const payload = {
      searchString: '',
      pageCount: paginateData.pageCount,
      numPerPage: paginateData.pageSize,
      customerId: customerIndex,
      from: moment(fromDate).format('YYYY-MM-DD'),
      to: moment(toDate).format('YYYY-MM-DD'),
    };
    dispatch(
        CustomerpaymentAction(
        payload,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    );
  };

  const columns = [
    {
        title: 'Payment Date',
        field: 'payment_date'
    },
    {
        title: 'Invoice Number',
        field: 'invoice_number'
    },
    {
        title: 'Amount',
        field: 'payment_amount'
    },
    {
        title: 'Mode of Payment',
        field: 'payment_type'
    },
    {
        title: 'Reference Number',
        field: 'reference_code'
    }
  ];

  const handlePageChange = (page) => {
    setPaginateData({...paginateData, pageCount: page});
  };

  const handleSizeChange = (size) => {
    setPaginateData({...paginateData, pageSize: size});
  };

  useEffect(() => {
    const payload = {
      searchString: paginateData.searchString,
      pageCount: paginateData.pageCount,
      numPerPage: paginateData.pageSize,
      customerId: customerIndex,
      from: moment(fromDate).format('YYYY-MM-DD'),
      to: moment(toDate).format('YYYY-MM-DD'),
    };
    dispatch(CustomerpaymentAction(payload));
  }, [paginateData.pageCount, paginateData.pageSize]);

  const handleSubmit = async () => {
    const payload = {
      searchString: paginateData.searchString,
      pageCount: paginateData.pageCount,
      numPerPage: paginateData.pageSize,
      from: moment(fromDate).format('YYYY-MM-DD'),
      to: moment(toDate).format('YYYY-MM-DD'),
      customerId: customerIndex,
    };

    await dispatch(CustomerpaymentAction(payload));
    setFilter(false);
  };

  const handleClear = async () => {
    setFromDate(
      moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD'),
    );
    setToDate(
      moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD'),
    );
    setRangeOption(null);
    const fromDate = moment()
      .subtract(1, 'months')
      .startOf('month')
      .format('YYYY-MM-DD');
    const toDate = moment()
      .subtract(1, 'months')
      .endOf('month')
      .format('YYYY-MM-DD');

    const payload = {
      from: fromDate,
      to: toDate,
      searchString: paginateData.searchString,
      pageCount: paginateData.pageCount,
      numPerPage: paginateData.pageSize,
      customerId: customerIndex,
    };
    dispatch(CustomerpaymentAction(payload));

    setFilter(false);
  };

  console.log(customerIndex, 'customerIndex');

  return (
    <>
      <Card>
        <MaterialTable
          columns={columns}
          data={customerPayment.data}
          title={'Customer Payments'}
          totalCount={customerPayment.numRows}
          options={{
            actionsColumnIndex: -1,
            filtering: false,
            search: false,
            paging: true,
            pageSize: paginateData.pageSize,
            pageSizeOptions: [20, 50, 100],
            maxBodyHeight: maxBodyHeight,
            minBodyHeight: maxBodyHeight,
            overflowY: 'visible',
            headerStyle: headerStyle,
            cellStyle: cellStyle,
          }}
          page={paginateData.pageCount}
          onPageChange={(page) => {
            handlePageChange(page);
          }}
          onRowsPerPageChange={(size) => {
            handleSizeChange(size);
          }}
          components={{
            Toolbar: (props) => (
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  alignItems: 'center',
                }}
              >
                <div style={{width: '100%'}}>
                  <MTableToolbar {...props} />
                </div>
                <IconButton onClick={() => setFilter(true)}>
                  <FilterAltIcon />
                </IconButton>
                <div>
                  <CommonSearch
                    searchVal={paginateData.searchString}
                    cancelSearch={cancelSearch}
                    requestSearch={requestSearch}
                  />
                </div>
              </div>
            ),
          }}
        />
      </Card>
      <Dialog
        open={filter}
        onClose={() => setFilter(false)}
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
              <Autocomplete
                options={rangeOptions}
                value={rangeOption}
                onChange={(event, newValue) => {
                  setRangeOption(newValue);
                  // Set fromDate and toDate based on selected option
                  if (newValue === 'This Week') {
                    const startOfWeek = moment()
                      .startOf('week')
                      .format('YYYY-MM-DD');
                    const endOfWeek = moment()
                      .endOf('week')
                      .format('YYYY-MM-DD');
                    setFromDate(startOfWeek);
                    setToDate(endOfWeek);
                  } else if (newValue === 'This Year') {
                    const startOfYear = moment()
                      .startOf('year')
                      .format('YYYY-MM-DD');
                    const endOfYear = moment()
                      .endOf('year')
                      .format('YYYY-MM-DD');
                    setFromDate(startOfYear);
                    setToDate(endOfYear);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Select Range'
                    fullWidth
                    variant='outlined'
                  />
                )}
              />
            </Grid>

            <Grid
              size={{
                lg: 6,
                md: 6,
                sm: 12,
                xs: 12
              }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  label='From Date'
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                    },
                  }}
                  value={toMomentOrNull(fromDate)}
                  format='DD/MM/YYYY'
                  onChange={(date) =>
                    setFromDate(moment(date).format('YYYY-MM-DD'))
                  }
                />
              </LocalizationProvider>
            </Grid>

            <Grid
              size={{
                lg: 6,
                md: 6,
                sm: 12,
                xs: 12
              }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  label='To Date'
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                    },
                  }}
                  value={toMomentOrNull(toDate)}
                  format='DD/MM/YYYY'
                  onChange={(date) =>
                    setToDate(moment(date).format('YYYY-MM-DD'))
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
          <Button variant='contained' color='primary' onClick={handleSubmit}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// LeadTasksTable.propTypes = {
//   handleClose : PropTypes.func,
//   data : PropTypes.object,
//   type : PropTypes.string
// }

export default Customerpayment;

