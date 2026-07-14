import React,{useContext, useEffect, useState} from 'react'
import { Dialog, IconButton , Menu, Typography,Grid,FormControl,Button, TextField, Autocomplete, Box, Link, DialogTitle, DialogContent, DialogActions, Chip} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import CommonSearch from 'utils/commonSearch';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { get_paymentCollectionAction, getAllSalesManListAction, paymentCollectionAction, paymentCollectionApproveAction, paymentCollectionFilterAction, paymentReportBasedEmpAction, set_paymentCollectionAction } from 'redux/actions/sales_actions';
import context from 'context/CreateNewButtonContext';
import { useNavigate } from 'react-router-dom';
import { DatePicker, DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import CloseIcon from '@mui/icons-material/Close';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import dayjs from "dayjs";
import moment from 'moment';
import { getsessionStorage } from 'pages/common/login/cookies';
import HomeIcon from '@mui/icons-material/Home';
import apiCalls from 'utils/apiCalls';
import CommonSchedule from 'pages/sales/salesReport/CommonSchedule';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ShareReport from 'pages/sales/salesReport/ShareReport';
import ShareIcon from '@mui/icons-material/Share';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import toMomentOrNull from '../../../../utils/DateFixer';

const PaymentCollectionReport = (props) => {
  const storage = getsessionStorage()
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [ openDetailsPage, setOpenDetailsPage ] = useState(false);
  const [ filteropen, setFilterOpen ] = useState(false)
  const [ searchString, setSearchString ] = useState('')
  const [ paymentData, setPaymentData ] = useState([])
  const [ pageCount, setPageCount ] = useState(0);
  const [ pageSize, setPageSize ] = useState(10);
  const [ selectedSalesman, setSelectedSalesman ] = useState(null);
  const [ selectedInvoice, setSelectedInvoice ] = useState(null);
  const [fromDate, setFromDate] = useState(moment());
  const [ toDate, setToDate ] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);
  const [scheduleOpen,setScheduleOpen] =  useState(false)
  const [shareOpen,setShareOpen] =  useState(false)
  const [Schedulecolumns,setSchedulecolumns] =  useState([
  { name: "Date", key: "Date" },
  { name: "Salesman Name", key: "salesman_name" },
  { name: "Count", key: "entry_count" },
  { name: "Collection Amount", key: "collection_amount" },
  { name: "Invoice Amount", key: "invoice_amount" },
  { name: "Mode of Payment", key: "paymentName" }
]
,) 
const [ page, setPage ] = useState(0);
const [ rowsPerPage, setRowsPerPage ] = useState(20);

  const {
    setLoaderStatusHandler,
    setModalStatusHandler,
    setModalTypeHandler,
    commoncookie,
  } = useContext(context);

  const { salesManReducer: { paymentCollectionReport,paymentCollectionReportCount, getAllSalesManList, paymentCollectionFilter, setPaymentCollectionFilter } } = useSelector(state => state)

  useEffect(() => {
    const data = {
      pageCount: page,
      numPerPage: rowsPerPage,
      searchString: searchString,
      employee_id:null,
      fromDate:null,
      payment_type:null
      // toDate:null
    };
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
    dispatch(paymentCollectionAction(
      data,
      commoncookie,
      setModalTypeHandler,
      setLoaderStatusHandler
    )))
  }, [ page, rowsPerPage,dispatch]);


  // console.log(paymentData, "data")

  const applyFilter = async () => {
    setSearchString('');
    setFilterOpen(false);
    const fromDateFormatted = moment(fromDate, 'YYYY-MM-DD', true).isValid()
      ? moment(fromDate).format('YYYY-MM-DD')
      : null;

    const toDateFormatted = moment(toDate, 'YYYY-MM-DD', true).isValid()
      ? moment(toDate).format('YYYY-MM-DD')
      : null;

    const filterPayload = {
      page,
      numPerPage: rowsPerPage,
      searchString: '',
      employee_id: selectedSalesman ? selectedSalesman.employee_id : null,
      fromDate: fromDateFormatted,
      // toDate: toDateFormatted,
    };

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
    dispatch(paymentCollectionAction(
      filterPayload,
      commoncookie,
      setModalTypeHandler,
      setLoaderStatusHandler
    )))
  };


  const handleClear = () => {
    setSearchString('');
    setFromDate(null);
    // setToDate(null);
    setSelectedSalesman(null);
    setSelectedInvoice(null);
    setFilterOpen(false);
    dispatch(paymentCollectionAction({
      pageCount: page,
      numPerPage: rowsPerPage,
      searchString: '',
      employee_id:null,
      fromDate:null,
      // toDate:null
    }));
  };

  const cancelSearch = () => {
    setSearchString('');
    setFromDate(null);
    // setToDate(null);
    dispatch(set_paymentCollectionAction({ data: [], numRows: 0 }));
    const body = {
      searchString: '',
      pageCount: page,
      numPerPage: rowsPerPage,
      employee_id:null,
      fromDate:null,
      // toDate:null
    };
    dispatch(get_paymentCollectionAction(
      body, setModalTypeHandler, setLoaderStatusHandler
    ))
  };

  const requestSearch = (e) => {
    let val = e.target.value;
    setSearchString(val)
    if(val.length >=3 || val.length ===0){
      dispatch(set_paymentCollectionAction({ data: [], numRows: 0 }))
    }
    const body = {
      searchString: val,
      pageCount: page,
      numPerPage: rowsPerPage,
      employee_id:null,
      fromDate:null,
      // toDate:null
    };
    dispatch(get_paymentCollectionAction(
      body, setModalTypeHandler, setLoaderStatusHandler
    ))
    console.log(setPaymentCollectionFilter, "setPaymentCollectionFilter")
  }



  const Rowdata = (rowData) => {
    console.log(rowData, "hj")
    navigate('/PaymentCollectionReport')
    dispatch(paymentReportBasedEmpAction(rowData?.employee_id))
  };



  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleApprove = (selectedItem) => {
    // console.log("selectedItem",selectedItem)
    let data= {
      payment_id:selectedItem.id
    }
    dispatch(paymentCollectionApproveAction(data,(res)=>{
      // console.log("ssss",res)
      if(res){
        const data = {
          pageCount: page,
          numPerPage: rowsPerPage,
          searchString: searchString,
          employee_id:null,
          fromDate:null,
          // toDate:null
        };
        dispatch(paymentCollectionAction(
          data,
          commoncookie,
          setModalTypeHandler,
          setLoaderStatusHandler
        ));
      }
    }))

  };

  // const sortedPaymentData = [...paymentData].sort((a, b) => {
  //   const aVerified = a.verified === 1 ? 1 : 0;
  //   const bVerified = b.verified === 1 ? 1 : 0;
  //   return aVerified - bVerified;
  // });

  const sortedPaymentData = paymentCollectionReport
  console.log("paymentCollectionReport",paymentCollectionReport)

  const paymentmodeSearch = (paymentType = null) => {
    const payload = {
      pageCount: 0,
      numPerPage: 20,
      searchString :"",
      fromDate:null,
      toDate:null,
      employee_id:null,
      payment_type: paymentType
    };
  
    dispatch(paymentCollectionAction(payload));
  };
  
  const formatLabel = (str) => {
    return str
      .replace(/_/g, ' ')                 
      .replace(/\w\S*/g, (txt) =>        
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
  };

  return (
    <div>
      <Helmet>
        <meta charSet="utf-8" />
        <title> {titleURL} | Payment Collection </title>
      </Helmet>
      <Paper
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 80px)",
          padding: 2,
        }}
      >
        <Grid
          container
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 2,
          }}
        >
          <Grid
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 6
            }}>
          <Typography variant="h6" style={{ padding: '10px 0' }}>
            {/* <Link href="/report" underline="hover">
      <HomeIcon sx={{mr: 0.5}} fontSize='inherit' />
            Home 
            </Link>
             / Payment Collection Report */}
             <Box style={{ display: 'flex' }}>
                <Box sx={{ color: '#0A8FDC', cursor: 'pointer', fontSize: '12px', fontWeight: 400, '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate('/report')}>
                  <HomeIcon sx={{mr: 0.5}} fontSize='inherit' />
                  Home
                </Box>
                &nbsp;/&nbsp;Payment Collection Report
              </Box>
          </Typography>
        </Grid>
            {/* <Typography variant='h6' align='left' style={{ paddingTop: '10px', paddingBottom: '10px' }}>
            <Link href='/report' underline="hover">Home</Link> / Payment Collection Report</Typography> */}
          <Grid
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 6
            }}>
            <Grid container spacing={3} display='flex' justifyContent='flex-end'>
          <Grid>
            {[ ...new Set(
              paymentCollectionReport?.flatMap(item =>
                item.payment_type.map(type => Object.keys(type)[ 0 ])
              )
            ) ]?.map((mode, index) => {
              const label = mode.replace(/___/g, '/');
              const isSelected = selectedPaymentType === mode;

              return (
                <Chip
                  key={index}
                  label={formatLabel(label)}
                  color={isSelected ? 'primary' : 'default'}
                  variant={isSelected ? 'filled' : 'filled'}
                  onClick={() => {
                    const newValue = isSelected ? null : mode;
                    setSelectedPaymentType(newValue);
                    paymentmodeSearch(newValue);
                  }}
                  sx={{
                    transition: 'all 0.3s ease-in-out',
                    mr: '10px',
                  }}
                />
              );
            })}
          </Grid>
          

          <Grid>
            <CommonSearch
              searchVal={searchString}
              cancelSearch={cancelSearch}
              requestSearch={requestSearch}
            />
            <IconButton
              onClick={() => {
                setFilterOpen(true);
                dispatch(getAllSalesManListAction());
              }}
            >
              <FilterAltIcon />
            </IconButton>
               <IconButton 
                  onClick={()=> setScheduleOpen(true)}
                >
                  <ScheduleIcon/>
                </IconButton>
               <IconButton 
                  onClick={()=> setShareOpen(true)}
                >
                  <ShareIcon/>
                </IconButton>
          </Grid>
          </Grid>
          </Grid>
        </Grid>

        <TableContainer
          sx={{
            flexGrow: 1,
            overflow: "auto",
          }}
        >

          <Table>

            <TableHead>
              <TableRow>
                <TableCell align="center">Date</TableCell>
                <TableCell align="center">Salesman Name</TableCell>
                <TableCell align="right">Count</TableCell>
                <TableCell align="right">
                  <Box sx={{ textAlign: 'right', width: '100%' }}>
                    Collection Amount
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ textAlign: 'right', width: '100%' }}>
                    Invoice Amount
                  </Box>
                </TableCell>
                <TableCell align="center">Mode of Payment</TableCell>
                <TableCell align="center">Action</TableCell>
                <TableCell align="center">Verified By</TableCell>
              </TableRow>
            </TableHead>


            <TableBody>
              {sortedPaymentData?.length > 0 ? (
                sortedPaymentData?.map((item, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell align="center">{item.Date ? dayjs(item.Date).format("DD/MM/YYYY") : "-"}</TableCell>
                      <TableCell align="center">{item.salesman_name}</TableCell>
                      <TableCell align="right">{item.entry_count}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ textAlign: 'right', width: '100%', paddingRight: '10px' }}>
                          {item.collection_amount}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ textAlign: 'right', width: '100%', paddingRight: '10px'  }}>
                          {item.invoice_amount}
                        </Box>
                      </TableCell>
                      <TableCell align="center">{item.paymentName || "-"}</TableCell>
                      {/* <TableCell align="center">
                        <IconButton
                          onClick={() => {
                            Rowdata(item);
                            setOpenDetailsPage(true);
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell> */}
                      <TableCell align="center">
                        {item.approverId === null ? (
                          <Typography variant="body2">
                            Not Approved
                          </Typography>
                        ) : (
                          <Typography variant="body2">
                            Approved
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {item.approver_name === null ? "Not Verified" : item.approver_name}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
      <TableCell colSpan={13} rowSpan={13} sx={{ height: "calc(68vh + 2px)" }}>
        <Typography align="center" sx={{ fontSize: '11px' }}>No Data Available</Typography>
      </TableCell>
    </TableRow>
  )}

            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[ 20, 50, 100 ]}
          component="div"
          count={paymentCollectionReportCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              borderTop: 'none',
            }}
          />

        {filteropen === true && (
          <Dialog
            open={filteropen}
            onClose={() => setFilterOpen(false)}
          >
            <div style={{ display: 'flex', justifyContent: 'end' }}>
              <IconButton onClick={() => setFilterOpen(false)}>
                <CloseIcon />
              </IconButton>
            </div>

            <Grid container gap={2} padding='20px'>
              <Grid container spacing={2} size={12}>

                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <LocalizationProvider dateAdapter={DateAdapter}>
                    <DatePicker
                      label='Date'
                      value={toMomentOrNull(fromDate)}
                      format='DD/MM/YYYY'
                      disableFuture
                      onChange={(date) => setFromDate(date)}
                      slotProps={{
                        textField: {
                          variant: 'filled',
                          fullWidth: true,
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>

                {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                  <LocalizationProvider dateAdapter={DateAdapter}>
                    <DatePicker
                      label='TO Date'
                      value={toDate}
                      disableFuture
                      onChange={(date) => setToDate(date)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant='filled'
                          fullWidth
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid> */}
                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <Autocomplete
                    options={getAllSalesManList}
                    getOptionLabel={(option) => option.salesman_name}
                    value={selectedSalesman}
                    onChange={(event, newValue) => setSelectedSalesman(newValue)}
                    ListboxProps={{
                      style: {
                        maxHeight: "170px",
                      },
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Salesman Name"
                        variant="filled"
                        fullWidth
                      />
                    )}
                  />
                </Grid>

                <Grid
                  container
                  spacing={2}
                  justifyContent='center'
                  alignItems='center'
                  gap={2}
                  style={{ marginTop: '20px' }}
                  size={12}>
                  <Grid
                    size={{
                      sm: 3,
                      xs: 12
                    }}>
                    <Button
                      fullWidth
                      onClick={handleClear}
                      variant='contained'
                      color='warning'
                    >
                      Clear
                    </Button>
                  </Grid>
                  <Grid
                    size={{
                      sm: 3,
                      xs: 12
                    }}>
                    <Button
                      fullWidth
                      onClick={applyFilter}
                      variant='contained'
                    >
                      Apply
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Dialog>
        )}

        <Dialog open={scheduleOpen} onClose={() => setScheduleOpen(false)}>
                  <CommonSchedule
                    report_name="Payment Collection"
                    handleClose={() => setScheduleOpen(false)}
                    open={scheduleOpen}
                    columns={Schedulecolumns}
                  />
        </Dialog>

        <Dialog open={shareOpen}>
          <ShareReport
          report_name  = {'Payment Collection Report'}
          handleClose = {()=> setShareOpen(false)}
          open={shareOpen}
          columns = {Schedulecolumns}
          data = {sortedPaymentData}
          fromDate = {moment(fromDate, 'year', 'month', 'day').format('yyyy-MM-DD')}
          toDate = {moment(toDate, 'year', 'month', 'day').format('yyyy-MM-DD')}
        />
        </Dialog>
        
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Confirm Approval</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to approve this entry?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={() => {
            
                handleApprove(selectedItem)
                setOpenDialog(false);
              }}
              color="primary"
              variant="contained"
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>


      </Paper>
    </div>
  );
}

export default PaymentCollectionReport
