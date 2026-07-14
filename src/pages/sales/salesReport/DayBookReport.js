import {
  Button,
  Card,
  Chip,
  Dialog,
  DialogContent,
  Fade,
  Grid,
  IconButton,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  TableContainer,
  Collapse,
  Box,
} from '@mui/material';
import DataGridTemp from 'components/dataGridTemp';
import {titleURL} from 'http-common';
import React, {useContext, useEffect, useState} from 'react';
import {Helmet} from 'react-helmet-async';
import {ExpandLess, ExpandMore, FilterAlt} from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import {useDispatch, useSelector} from 'react-redux';
import {
  dayBookConsolidateAction,
  dayBookReportAction,
  setdayBookAction,
} from 'redux/actions/sales_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import moment from 'moment';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CommonSchedule from './CommonSchedule';
import ShareIcon from '@mui/icons-material/Share';
import ShareReport from './ShareReport';
import { useCustomFetch } from 'utils/useCustomFetch';
import apiCalls from 'utils/apiCalls';
import { clearInvoiceTempAction, getSupplierDetailsByIdreceivings_itemsAction, setInvoiceTempAction } from 'redux/actions/vendor_actions';
import { ManualSalesPurchase } from 'redux/actions/manualNotes_actions';
import ReceiptTempDialog from 'pages/sales/Receipt/ReceiptTemp'
import _ from 'lodash';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { maxBodyHeight } from 'utils/pageSize';
import API_URLS from '../../../utils/customFetchApiUrls';
import { useNavigate } from 'react-router-dom';
import toMomentOrNull from '../../../utils/DateFixer';
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

const DayBookReport = () => {
  const {
    salesManReducer: {getDayBookData, daybookConsolidate}, rbacReducer: {menuAccess = []}
  } = useSelector((state) => state);

  const dispatch = useDispatch();
  const storage = getsessionStorage();
  const customFetch = useCustomFetch();
  const navigate = useNavigate()

  const [filter, setFilter] = useState(false);

  const currentMonth = moment().startOf('month');
  const currentDate = moment().format('YYYY-MM-DD');
  const lastDateOfMonth = currentMonth.endOf('month').format('YYYY-MM-DD');
  const [invoicePopup, setInvoicePopup] = useState(false)
  const [termsAndCondition, setTermsAndConditions]=  useState([])
  const [invoiceData, setInvoiceData] = useState([])
  const [type, setType] = useState('')
  const [pageType, setPageType] = useState('description')
  const [expandedRows, setExpandedRows] = useState({})
  const [selectedParticularChip, setSelectedParticularChip] = useState(null)

  const [formValues, setFormValues] = useState({
    fromDate: currentDate,
    scheduleOpen: false,
    shareOpen: false,
    toDate: currentDate,
  });

  const [formErrors, setFormErrors] = useState({
    fromDate: null,
    toDate: null,
  });

  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(CreateNewButtonContext);

  const [paginateData, setPaginateData] = useState({
    searchVal: '',
    pageSize: 20,
    pageCount: 0,
  });

  const rows = getDayBookData.data?.length
    ? getDayBookData.data.map((row, index) => ({id: index, ...row}))
    : [];

  const shareReportColumns = [
    { name: 'Entry Date & Time', key: 'entryDateTime' },
    { name: 'Type', key: 'note' },
    { name: 'Method', key: 'payment_details' },
    { name: 'Particular', key: 'particular' },
    { name: 'Reference #', key: 'reference' },
    { name: 'Amount', key: 'amount' }
  ]

  const shareReportData = getDayBookData.data?.length ? getDayBookData.data.map((data) => {
    const returnData = {
      transactionDate: data.transactionDate,
      entryDateTime: data.entryDateTime,
      note: data.note,
      payment_details: data.payment_details,
      particular: data.particular,
      reference: data.reference,
      amount: data.amount
    }
    // if(data.note === 'Sales Payment'){
    //   returnData.sale_invoice = data.sale_invoice
    //   returnData.customer_name = data.customer_name 
    // }
    // else if(data.note === 'Purchase Payment'){
    //   returnData.sale_invoice = data.purchase_invoice
    //   returnData.customer_name = data.supplier_name 
    // }
    // else if(data.note === 'Expenses Entry'){
    //   returnData.sale_invoice = data.expense_invoice
    //   returnData.customer_name = data.supplier_name 
    // }
    // else{
    //   returnData.sale_invoice = ''
    //   returnData.customer_name = '' 
    // }
    return returnData

  })  : []

  const handlePageChange = (page) => {
    setPaginateData({...paginateData, pageCount: page});
  };

  const handleSizeChange = (size) => {
    setPaginateData({...paginateData, pageSize: size});
  };

  const requestSearch = (e) => {
    const val = e.target.value;
    setPaginateData({...paginateData, searchVal: val});

    const payload = {
      searchString: val,
      numPerPage: paginateData.pageSize,
      pageCount: paginateData.pageCount,
      fromDate: formValues.fromDate,
      toDate: formValues.toDate,
      type: pageType,
      headerLocationId : headerLocationId
    };

    dispatch(
      setdayBookAction(payload, setModalTypeHandler, setLoaderStatusHandler),
    );
  };

  const cancelSearch = () => {
    setPaginateData({...paginateData, searchVal: ''});

    const payload = {
      searchString: '',
      numPerPage: paginateData.pageSize,
      pageCount: paginateData.pageCount,
      fromDate: formValues.fromDate,
      toDate: formValues.toDate,
      type: pageType,
      headerLocationId : headerLocationId
    };

    dispatch(
      setdayBookAction(payload, setModalTypeHandler, setLoaderStatusHandler),
    );
  };

  // const handleExport = async () => {
  //   const columnHeaders = columns.map((column) => column.headerName);
  //   const payload = {
  //     searchString: '',
  //     numPerPage: null,
  //     pageCount: null,
  //     fromDate: formValues.fromDate,
  //     toDate: formValues.toDate,
  //     type: 'export'
  //   }
  //   const { data } = await customFetch('/sales/dayBookReport', 'POST', payload)
  //   console.log(data,'dataaaaa')
  //   // dispatch(dayBookReportAction(data,async(response) => {
  //   //                 const res = await response.data
  //   //                 if(res.length > 0){
                        
  //   //                 }
  //   //             }))
  //   const exportRows = data?.map((row) =>
  //     columns.map((column) => column.renderCell ? column.renderCell({row: row}) : row[column.field]),
  //   );

  //   console.log(exportRows,'exportRows',data.length)

  //   let csvContent = 'data:text/csv;charset=utf-8,';
  //   csvContent += columnHeaders.join(',') + '\n';
  //   csvContent += exportRows.map((row) => row.join(',')).join('\n');

  //   const encodedUri = encodeURI(csvContent);
  //   const link = document.createElement('a');
  //   link.setAttribute('href', encodedUri);
  //   link.setAttribute('download', 'DayBook Report' + '.csv');
  //   document.body.appendChild(link);
  //   link.click();
  // };


 const handleExport = async () => {
  const columnHeaders = columns.map((column) => column.headerName);

  const columns1 = [
    {
      field: 'transactionDate',
      headerName: 'Date',
      width: 150,
    },
    {
      field: 'entryDateTime',
      headerName: 'Entry Date & Time',
      width: 150,
    },
    {
      field: 'note',
      headerName: 'Type'
    }
    ,
    {
      field: 'amount',
      headerName: 'Amount',
      width: 150,
      align: 'right',
      headerAlign: 'right'
    },
    {
      field: 'payment_details',
      headerName: 'Method',
      width: 306,
    },
    {
      field: 'particular',
      headerName: 'Particular',
      width: 306,
    },
    {
      field: 'reference',
      headerName: 'Reference',
      width: 306
    }
  ];

  const payload = {
    searchString: '',
    numPerPage: null,
    pageCount: null,
    fromDate: formValues.fromDate,
    toDate: formValues.toDate,
    type: 'export',
    headerLocationId : headerLocationId
  };

  console.log(columnHeaders,'columnHeaders')

   const { data } = await customFetch(
     API_URLS.DAY_BOOK_REPORT,
     'POST',
     payload
   );
const exportRows = data.map((row) =>
  columns1.map((column) => {
    let value = row[column.field];
    if (value === null || value === undefined) value = '';
    return `"${value}"`; // wrap everything in quotes
  })
);

let csvContent = 'data:text/csv;charset=utf-8,';
csvContent += columns1.map(c => `"${c.headerName}"`).join(',') + '\n'; // wrap headers too
csvContent += exportRows.map(row => row.join(',')).join('\n');

const encodedUri = encodeURI(csvContent);
const link = document.createElement('a');
link.setAttribute('href', encodedUri);
link.setAttribute('download', 'DayBook Report.csv');
document.body.appendChild(link);
link.click();
};



  const handleReferenceClick = async(params) => {
    if(params.row.note === 'Sales'){
      const id= params.row.sale_id
      const type =  'sales' 
            const poptype = 'invoice'
            const { data } = await customFetch(
                API_URLS.GET_SALES_INVOICE_DETAILS(id, type,poptype),
                'POST'
            );
      await apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(setInvoiceTempAction(data))
      )
      setInvoicePopup(true)
    }
    else if(params.row.note === 'Purchase'){
      const payload = {
          receiving_id: params.row.receiving_id
      }

      await apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(getSupplierDetailsByIdreceivings_itemsAction(params.row.supplier_id, payload))
      )
      setInvoicePopup(true)
    }
    else if(params.row.note === 'Return CN' || params.row.note === 'CN' || params.row.note === 'Return DN' || params.row.note === 'DN'){
      const dataCN = {
        id: params.row.return_id ? params.row.return_id : '',
        type: 'C',
        status: '4',
        mn_id: params.row.credit_debit_note_id
      };

      const dataDN = {
        id: params.row.return_id ? params.row.return_id : '',
        type: 'D',
        status: null,
        mc_id: params.row.credit_debit_note_id,
        sequence : params.row?.credit_note || null
      };

      const data = params.row.type === 'VENDOR' ? dataDN : dataCN

      // setType(params.row.type);
      apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(
            ManualSalesPurchase(data, (response) => {
              if (response) {
                dispatch(setInvoiceTempAction(response))
                setInvoicePopup(true); 
              }
            })
          )    
      )
    }
    else if(params.row.note === 'Receipt' || params.row.note === 'Payment' || params.row.note === 'Customer Advance' || params.row.note === 'Vendor Advance'){
      let types = ''
      if(params.row.note === 'Receipt' || params.row.note === 'Customer Advance'){
        types = 'Receipts'
      }
      else{
        types = 'Payments'
      }
      const { data } = await customFetch(
        API_URLS.GET_RECEIPTS_BY_ID(params.row.receipt_id, types),
        'GET'
      );
      await apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(setInvoiceTempAction(data))
      )
      setInvoicePopup(true)
    }
  }

  const handleInvoiceClose = () => {
    setInvoicePopup(false)
    dispatch(clearInvoiceTempAction([]))
  }

  const handleExpandRows = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const columns = [
    {
      field: 'transactionDate',
      headerName: 'Date',
      width: 150,
    },
    {
      field: 'entryDateTime',
      headerName: 'Entry Date & Time',
      width: 150,
    },
    {
      field: 'note',
      headerName: 'Type'
    }
    ,
    {
      field: 'amount',
      headerName: 'Amount',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => {
        console.log(params, 'params')
        return Number(params?.value ?? 0).toFixed(2)
      }
    },
    {
      field: 'payment_details',
      headerName: 'Method',
      width: 306,
    },
    {
      field: 'particular',
      headerName: 'Particular',
      width: 306,
    },
    {
      field: 'reference',
      headerName: 'Reference #',
      width: 306,
      renderCell: (params) => {
        return(
        <div
          style={{
            textDecoration: 'none',
            cursor: 'pointer',
            color: '#03adfc',
            display: 'inline-block'
          }}
          onClick={() => handleReferenceClick(params)}
        >
          {params.value}
        </div>
      )
      }
    },
  ];

  useEffect(() => {
    const payload = {
      searchString: paginateData.searchVal,
      numPerPage: paginateData.pageSize,
      pageCount: paginateData.pageCount,
      fromDate: formValues.fromDate,
      type: pageType,
      toDate: formValues.toDate,
      headerLocationId : headerLocationId,
    };
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(dayBookConsolidateAction({fromDate: formValues.fromDate, toDate: formValues.toDate})),
      dispatch(dayBookReportAction(payload))
    )
  }, [paginateData.pageSize, paginateData.pageCount, pageType, headerLocationId]);

  const filterSubmit = async () => {
    const payload = {
      searchString: paginateData.searchVal,
      numPerPage: paginateData.pageSize,
      pageCount: paginateData.pageCount,
      fromDate: formValues.fromDate,
      type: pageType,
      toDate: formValues.toDate,
      headerLocationId: headerLocationId,
    };
    dispatch(dayBookConsolidateAction({fromDate: formValues.fromDate, toDate: formValues.toDate}))
    await dispatch(dayBookReportAction(payload));
    setFilter(false);
  };

  const handleClear = () => {
    setFormValues({
      ...formValues,
      fromDate: currentDate,
      toDate: currentDate,
    });
    setFilter(false);
    const payload = {
      searchString: paginateData.searchVal,
      numPerPage: paginateData.pageSize,
      pageCount: paginateData.pageCount,
      fromDate: currentDate,
      type: pageType,
      toDate: currentDate,
      headerLocationId : headerLocationId
    };
    dispatch(dayBookConsolidateAction({fromDate: currentDate}))
    dispatch(dayBookReportAction(payload));
  };

    const handleChange = (value, name) => {
       if (value) {
         setFormValues({
           ...formValues,
           [name]: moment(value).format('YYYY-MM-DD'),
         });
       }
     };

  const handleChipSelect = (chipType, particular) => {
    const particularChip = selectedParticularChip ? null : particular
    const particularChipType = selectedParticularChip ? null : chipType
    if(selectedParticularChip){
      setSelectedParticularChip(null)
    }
    else{
      setSelectedParticularChip(particularChip)
    }
    const payload = {
      searchString: "",
      numPerPage: 20,
      pageCount: 0,
      fromDate: formValues.fromDate,
      toDate: formValues.toDate,
      type: pageType,
      chip: particularChip,
      chipType: particularChipType,
      headerLocationId : headerLocationId
    }
    dispatch(dayBookReportAction(payload));
  }

  const handleTypeChange = (type) => {
    setPageType(type)
  }

  const summaryTableData = getDayBookData.length > 0 ? getDayBookData.map((d, i) => ({...d, id: i})) : []
  const selectedRole = storage?.role_name;
  const reportExport = UserRightsAuthorization(menuAccess[selectedRole], 'reports__transactions__daybook', 'can_export')
  return (
    <div style={{
      padding: '0 10px',
      height: '100dvh',
      overflow: 'hidden',
      msOverflowStyle: 'none',
      scrollbarWidth: 'none',  
    }}
    className="hide-scrollbar"
  >
    <style>
      {`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}
    </style>
      <Helmet>
        <meta charSet='utf-8' />
        <title>{titleURL} | DayBook Report</title>
      </Helmet>
      {
        pageType === 'description' &&
        <Box
          sx={{
            padding: '0 10px',
            height: 'calc(100dvh - 80px)',
            overflowY: 'auto',
            '> .MuiCard-root': {
              height: 'auto !important',
              minHeight: 'auto !important',
            },
            '& .MuiDataGrid-root': {
              height: {
                xs: 'calc(100dvh - 470px) !important',
                sm: 'calc(100dvh - 430px) !important',
                md: 'calc(100dvh - 390px) !important',
                lg: 'calc(100dvh - 360px) !important',
                xl: 'calc(100dvh - 340px) !important',
              },
              minHeight: '260px !important',
              maxHeight: {
                xs: 'calc(100dvh - 470px) !important',
                sm: 'calc(100dvh - 430px) !important',
                md: 'calc(100dvh - 390px) !important',
                lg: 'calc(100dvh - 360px) !important',
                xl: 'calc(100dvh - 340px) !important',
              },
            },
            '& .MuiDataGrid-main': {
              overflow: 'hidden !important',
            },
            '& .MuiDataGrid-virtualScroller': {
              overflowY: 'auto !important',
            },
          }}
        >
        <DataGridTemp
          title={
            <Typography
              variant='h6'
              align='left'
              style={{paddingTop: '10px', paddingBottom: '10px'}}
            >
              {/* <Link href='/report' underline='hover'>
                Home
              </Link>{' '}
              / DayBook Report */}
              <Box style={{ display: 'flex' }}>
                <Box sx={{ color: '#0A8FDC', cursor: 'pointer', fontSize: '12px', fontWeight: 400, '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate('/report')}>Home</Box>
                &nbsp;/&nbsp;DayBook Report
              </Box>
            </Typography>
          }
          pageType='task'
          searchtype='closingstock'
          report = 'dayBook'
          columns={columns}
          columnData={columns}
          rowData={rows}
          filename={"DayBook Report"}
          data={rows}
          rowPerPageOptions={[20, 50, 100]}
          rowsPerPage={[10]}
          exportDayBook={true}
          pageSize={paginateData.pageSize}
          page={paginateData.pageCount}
          onPageChange={(page) => handlePageChange(page)}
          onPageSizeChange={(size) => handleSizeChange(size)}
          rowCount={getDayBookData.numRows}
          requestSearch={(e) => requestSearch(e)}
          cancelSearch={cancelSearch}
          searchVal={paginateData.searchVal}
          type={'filter'}
          isApiFinished = {true}
          handleExport={handleExport}
          filter={
            <>
              <IconButton onClick={() => setFilter(true)} sx={{ paddingTop: '4px' }}>
                <FilterAlt />
              </IconButton>
            </>
          }
          scheduleReport = {
            <div style={{display:'flex'}}>
                <IconButton 
                  onClick={()=> setFormValues((prev) => ({...prev, scheduleOpen:true}))}
                >
                  <ScheduleIcon/>
                </IconButton>
                <Dialog open={formValues.scheduleOpen}>
                  <CommonSchedule
                  report_name  = {'DayBook Report'}
                  handleClose = {() => setFormValues((prev) => ({...prev, scheduleOpen:false}))}
                  open={formValues.scheduleOpen}
                  columns = {shareReportColumns}
                  // data = {this.props.searchSalesReportData}
                />
                </Dialog>
                </div>
          }

          shareReport = {
            <div style={{display:'flex'}}>
                <IconButton 
                  onClick={()=> setFormValues((prev) => ({...prev, shareOpen:true}))}
                >
                  <ShareIcon/>
                </IconButton>
                <Dialog open={formValues.shareOpen}>
                  <ShareReport
                  report_name  = {'DayBook Report'}
                  handleClose = {() => setFormValues((prev) => ({...prev, shareOpen:false}))}
                  open={formValues.shareOpen}
                  columns = {shareReportColumns}
                  data = {shareReportData}
                  fromDate = {moment(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'year', 'month', 'day').format('yyyy-MM-DD')}
                  toDate = {moment(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), 'year', 'month', 'day').format('yyyy-MM-DD')}
                />
                </Dialog>
                </div>
          }
          summaryChip={true}
          summaryChipData={_.groupBy(daybookConsolidate, "paymentMode")}
          handleChipSelect={handleChipSelect}
          selectedParticularChip={selectedParticularChip}
          summaryDescriptionButton={true}
          handleTypeChange={handleTypeChange}
          chipData={pageType}
        />
        </Box>
      }
      {
        pageType === 'summary' &&
        <Card sx={{p:3}}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Grid container display='flex' justifyContent='space-between'>
                <Grid>
                  <Typography
                    variant='h6'
                    align='left'
                    style={{paddingTop: '10px', paddingBottom: '10px'}}
                  >
                    <Link href='/report' underline='hover'>
                      Home
                    </Link>{' '}
                    / DayBook Report
                  </Typography>
                </Grid>

                <Grid>
                  <Grid container spacing={3}>
                    <Grid>
                      <Grid container spacing={3} display='flex' justifyContent='flex-end' alignItems='center'>
                        <Grid>
                          <Chip 
                            label="Summary" 
                            color="primary" 
                            variant={pageType === 'summary' ? "filled" : "outlined"}
                            onClick={() => handleTypeChange('summary')} 
                          />
                        </Grid>
                        <Grid>
                          <Chip 
                            label="Description" 
                            color="primary" 
                            variant={pageType === 'description' ? "filled" : "outlined"}
                            onClick={() => handleTypeChange('description')} 
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid>
                      {reportExport && (
                      <Tooltip title='Export' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }}>
                        <IconButton 
                        // onClick={() => ExportCsv(columnData, rowData, filename)}
                        >
                          <FileDownloadIcon />
                        </IconButton>
                      </Tooltip>
                      )}
                    </Grid>

                    <Grid>
                      <Tooltip title='Filter'>
                        <IconButton onClick={() => setFilter(true)}>
                          <FilterAlt />
                        </IconButton>
                      </Tooltip>
                    </Grid>

                    <Grid>
                      <Tooltip title='Schedule Report'>
                        <IconButton 
                          onClick={()=> setFormValues((prev) => ({...prev, scheduleOpen:true}))}
                        >
                          <ScheduleIcon/>
                        </IconButton>
                      </Tooltip>
                      <Dialog open={formValues.scheduleOpen}>
                        <CommonSchedule
                        report_name  = {'DayBook Report'}
                        handleClose = {() => setFormValues((prev) => ({...prev, scheduleOpen:false}))}
                        open={formValues.scheduleOpen}
                        columns = {shareReportColumns}
                        // data = {this.props.searchSalesReportData}
                      />
                      </Dialog>
                    </Grid>

                    <Grid>
                      <Tooltip title='Share Report'>
                        <IconButton 
                          onClick={()=> setFormValues((prev) => ({...prev, shareOpen:true}))}
                        >
                          <ShareIcon/>
                        </IconButton>
                      </Tooltip>
                      <Dialog open={formValues.shareOpen}>
                        <ShareReport
                        report_name  = {'DayBook Report'}
                        handleClose = {() => setFormValues((prev) => ({...prev, shareOpen:false}))}
                        open={formValues.shareOpen}
                        columns = {shareReportColumns}
                        data = {shareReportData}
                        fromDate = {moment(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'year', 'month', 'day').format('yyyy-MM-DD')}
                        toDate = {moment(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), 'year', 'month', 'day').format('yyyy-MM-DD')}
                      />
                      </Dialog>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid size={12}></Grid>

            <Grid size={12}>
              <TableContainer style={{ maxHeight : maxBodyHeight, minHeight : maxBodyHeight }} component={Paper}>
                <Table >
                  <TableHead>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Particular</TableCell>
                      <TableCell>Count</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {
                      summaryTableData.length > 0 ? (
                        <>
                        {
                          summaryTableData.map((row, i) => (
                            <>
                              <TableRow>
                                <TableCell>
                                  <IconButton
                                    onClick={() => {setExpandedRows((prev) => ({...prev, [row.id]: !prev[row.id]}))}}
                                  >
                                    {expandedRows[row.id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                  </IconButton>
                                </TableCell>
                                <TableCell>{moment(formValues.fromDate).format('DD/MM/YYYY')}</TableCell>
                                <TableCell>{row.particular}</TableCell>
                                <TableCell>{row.count + (row?.bankCount ?? 0)}</TableCell>
                                <TableCell>
                                  <Box sx={{ textAlign: 'center' }}>
                                                        {row.total + (row?.bankTotal ?? 0)}
                                                      </Box>
                                </TableCell>
                              </TableRow>
    
                              {
                                expandedRows[row.id] && (
                                  <TableRow>
                                    <TableCell colSpan={5}>
                                      <Collapse in={expandedRows[row.id]} timeout='auto' unmountOnExit>
                                        <Box sx={{ margin: 1 }}>
                                          <Typography variant='h6' gutterBottom component='div'>
                                              {row.particular}
                                          </Typography>
    
                                          <Table>
                                            <TableHead>
                                              <TableRow>
                                                <TableCell>Date</TableCell>
                                                <TableCell>Time</TableCell>
                                                <TableCell>Particular</TableCell>
                                                <TableCell>Payment Method - Bank Name</TableCell>
                                                <TableCell>Reference</TableCell>
                                                <TableCell>To Whom</TableCell>
                                                <TableCell>Amount</TableCell>
                                                <TableCell>User</TableCell>
                                              </TableRow>
                                            </TableHead>
    
                                            <TableBody>
                                              {
                                                row.childRow.map((row, rowIndex) => (
                                                  <TableRow key={rowIndex}>
                                                    <TableCell>{row.transactionDate}</TableCell>
                                                    <TableCell>{row.transactionTime}</TableCell>
                                                    <TableCell>{row.note}</TableCell>
                                                    <TableCell>{row.payment_details}</TableCell>
                                                    <TableCell>
                                                      <div
                                                        style={{
                                                          textDecoration: 'none',
                                                          cursor: 'pointer',
                                                          color: '#03adfc',
                                                          display: 'inline-block'
                                                        }}
                                                        onClick={() => handleReferenceClick({row: row})}
                                                      >
                                                        {row.reference}
                                                      </div>
                                                    </TableCell>
                                                    <TableCell>{row.to_whom}</TableCell>
                                                    <TableCell>
                                                      <Box sx={{ textAlign: 'right' }}>
                                                        {row.amount}
                                                      </Box>
                                                    </TableCell>
                                                    <TableCell>{row.username}</TableCell>
                                                  </TableRow>
                                                ))
                                              }
                                            </TableBody>
                                          </Table>
                                        </Box>
                                      </Collapse>
                                    </TableCell>
                                  </TableRow>
                                )
                              }
                            
                            </>
                          ))
                          
                        }
                        </>
                      ) : (
                       <TableRow >
                        <TableCell colSpan={5}>
                          <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            height="100%"
                          >
                            No Records Found
                          </Box>
                        </TableCell>
                      </TableRow>
                      )
                    }
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Card>
      }
      <Dialog
        open={filter}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        maxWidth='sm'
        fullWidth
      >
        {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}> */}
          <DialogContent>
            <Grid container display={'flex'} alignItems={'center'} spacing={5}>
              <Grid
                container
                display={'flex'}
                justifyContent={'flex-end'}
                pt={'10px'}
              >
                <IconButton aria-label='close' onClick={() => setFilter(false)}>
                  <CloseIcon />
                </IconButton>
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
                    name='from'
                    label='Date'
                    inputVariant='outlined'
                    value={toMomentOrNull(formValues.fromDate)}
                    format='DD/MM/YYYY'
                    onChange={(e) => handleChange(e, 'fromDate')}
                    fullWidth
                    slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
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
                    name='to'
                    label='To Date'
                    inputVariant='outlined'
                    value={toMomentOrNull(formValues.toDate)}
                    format='DD/MM/YYYY'
                    onChange={(e) => handleChange(e, 'toDate')}
                    fullWidth
                    slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid
                container
                spacing={5}
                display={'flex'}
                justifyContent={'center'}
                pt={'20px'}
              >
                <Grid>
                  <Button
                    color='secondary'
                    variant='contained'
                    onClick={handleClear}
                  >
                    Clear
                  </Button>
                </Grid>

                <Grid>
                  <Button variant='contained' onClick={filterSubmit}>
                    Submit
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
        {/* </Grid> */}
      </Dialog>
      <ReceiptTempDialog 
          open={invoicePopup}
          handleClose={handleInvoiceClose}
          type='Bills'
          onClick={() => {}}
      />
    </div>
  );
};

export default DayBookReport;
