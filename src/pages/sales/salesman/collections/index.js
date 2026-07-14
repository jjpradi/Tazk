import React, { useState, useEffect, useContext } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import {LocalizationProvider} from '@mui/x-date-pickers';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import apiCalls from 'utils/apiCalls';
import { CollectionsReconAction, CollectionsReportsAction, listSalesDateAction, receiptEntry } from 'redux/actions/sales_actions';
import { useDispatch, useSelector } from 'react-redux';
import context from '../../../../context/CreateNewButtonContext';
import moment from 'moment';
import { Box, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Paper, Select, Stack, Table, TableBody, TableContainer, TableHead, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { maxBodyHeight, cellStyle, headerStyle, formatTime12Hour, formatDate12Hr } from 'utils/pageSize';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import { getsessionStorage } from 'pages/common/login/cookies';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { roleType } from 'utils/roleType';
import { deleteSalesmanCollectionByIdAction, getAllCollectionsBySalesmanAction, getSalesmanCollectionAction, getSearchSalesmanCollectionAction, salesmanCollectionReconciliateAction, setSearchSalesmanCollectionAction } from 'redux/actions/salesMan_action';
import CommonSearch from 'utils/commonSearch';
import { ExportCsv, ExportPdf } from '@material-table/exporters';
import PaymentMethodServices from '../../../../services/payment_method_services';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { handleSearchBrandReport } from 'redux/sagas/handlers/searchHandlers';
import jsPDF from 'jspdf';
import { maxHeight } from 'utils/pageSize';
import { getSalesManListAction } from 'redux/actions/fuelAllowance_actions';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SalesManVisitsFilter from '../SalesManVisitsFilter';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import {
    getStickyTableOptions,
    stickyTableComponents,
  } from '../../../../utils/stickyTableLayout';

function DashboardPage() {
  const dispatch = useDispatch();
  const [selectedSection, setSelectedSection] = useState('DateSelection');
  const [collectionDate, setCollectionDate] = useState();
  const [filtereddata, setFiltereddata] = useState([]);
  const {
    salesReducer: { list_sale_filter_date },
    salesManReducer: { collection_report, salesmanCollections, collectionsBySalesman },
    fuelAllowanceReducer: { salesManList }
  } = useSelector((state) => state);
  const { setLoaderStatusHandler, setModalTypeHandler, commoncookie, headerLocationId } = useContext(context);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageCount: 0,
    numPerPage: 20,
    searchString: ''
  })
  const [salesmanName, setSalesmanName] = useState('')
  const [allPaymentModes, setAllPaymentModes] = useState([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null)
  const [employeeId, setEmployeeId] = useState('');
  const [selectedDaysAgo, setSelectedDaysAgo] = useState(0);
  const [openFilter, setOpenFilter] = useState(false);
  const handleReconciliation = async () => {
    const savedPayloads = selectedData.map((data) => (JSON.parse(data.payload_json)))
    const paymentCollection = selectedData.map(data => data.id)

    const finalPayload = {
      ...savedPayloads[0].table_data,
      collection: {
        date: moment(collectionDate).format('YYYY-MM-DD'),
        employee_id: selectedEmployeeId,
        headerLocationId: headerLocationId,
        collectionId: paymentCollection
      }
    }

    setOpenDialog(false);
    await dispatch(receiptEntry(finalPayload, null, null, null, null, 'collection'))

    const payload = {
      employee_id: selectedEmployeeId,
      headerLocationId: headerLocationId,
      date: moment(collectionDate).format('YYYY-MM-DD')
    }
    await dispatch(getAllCollectionsBySalesmanAction(payload))

    setSelectedRows([]);
    setSelectedData([]);
  }

  useEffect(() => {
      if (salesManList && salesManList.length > 0 && !employeeId) {
        setEmployeeId(salesManList[0].empId);
        setCollectionDate(moment().format('YYYY-MM-DD'));
      }
    }, [salesManList]);

  useEffect(() => {
    const payload = {
      searchString: ''
    };
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        getSalesManListAction(payload, setModalTypeHandler, setLoaderStatusHandler),
      )
    );
  }, []);

  const handleSubmit = (event, item) => {
    if (item !== null) {
      if (item.isReconciliated === 0) {
        setSelectedData((prev) => ([...prev, item]))
        setOpenDialog(true);
      }
      else {
        event.preventDefault()
      }
    }
    else {
      if (selectedData.length === 0) {
        alert('No checked data found.');
      } else {
        setOpenDialog(true);
      }
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  useEffect(() => {
    let convertedDate = collectionDate === 'Invalid date' ? null : moment(collectionDate).format('YYYY-MM-DD')
    const payload = {
      pageCount: pagination.pageCount,
      numPerPage: pagination.numPerPage,
      searchString: pagination.searchString,
      date: convertedDate,
      employee_id: employeeId
    }
    console.log('selectedDAtee2', convertedDate)
    dispatch(getSalesmanCollectionAction(payload, headerLocationId))
  }, [collectionDate, pagination.pageCount, pagination.numPerPage, employeeId])

  useEffect(() => {
    if (selectedSection === 'SalesManList') {
      PaymentMethodServices.getAllPaymentModeForPaymentPage()
        .then((res) => {
          setAllPaymentModes(res.data);
        })
        .catch((err) => { })
    }
  }, [selectedSection])

  const handleBack = () => {
    let convertedDate = collectionDate === 'Invalid date' ? null : moment(collectionDate).format('YYYY-MM-DD')
    const payload = {
      pageCount: 0,
      numPerPage: 20,
      searchString: '',
      date: convertedDate,
      employee_id: employeeId
    }
    dispatch(getSalesmanCollectionAction(payload, headerLocationId))
    setSelectedSection('DateSelection');
    setSelectedRows([]);
    setSelectedData([]);
  };

  const isNextDisabled = selectedSection === 'Reconcilate';
  const isBackDisabled = selectedSection === 'DateSelection';
  const filteredData = list_sale_filter_date?.filter(item => item?.payment_data[0]?.reconcilate_status === 1);

  const handleRowClick = async (event, rowData) => {
    setSelectedEmployeeId(rowData.employee_id)
    const payload = {
      employee_id: rowData.employee_id,
      headerLocationId: headerLocationId,
      date: moment(collectionDate).format('YYYY-MM-DD')
    }
    await dispatch(getAllCollectionsBySalesmanAction(payload))
    setSalesmanName(`${rowData.first_name} ${rowData.last_name || ''}`)
    setSelectedSection('SalesManList')
  }

  const requestSearch = (event) => {
    setPagination((prev) => ({ ...prev, searchString: event.target.value }))
    if(event.target.value.length >= 3 || event.target.value.length === 0) {
      dispatch(setSearchSalesmanCollectionAction({ data: [], numRows: 0 }))
    }

    const payload = {
      pageCount: 0,
      numPerPage: pagination.numPerPage,
      searchString: event.target.value,
      date: collectionDate === 'Invalid date' ? null : moment(collectionDate).format('YYYY-MM-DD'),
      employee_id: employeeId
    }
    dispatch(getSalesManListAction(payload))
    dispatch(getSearchSalesmanCollectionAction({ payload: payload, location_id: headerLocationId }))
  }

  const cancelSearch = () => {
    setPagination((prev) => ({ ...prev, searchString: "" }))

    const payload = {
      pageCount: 0,
      numPerPage: pagination.numPerPage,
      searchString: "",
      date: collectionDate === 'Invalid date' ? null : moment(collectionDate).format('YYYY-MM-DD'),
      employee_id: employeeId
    }
    dispatch(getSalesManListAction(payload))
    dispatch(setSearchSalesmanCollectionAction({ data: [], numRows: 0 }))
    dispatch(getSearchSalesmanCollectionAction({ payload: payload, location_id: headerLocationId }))
  }

  function convertMultiplePaymentsStringToJson(paymentsString) {
    const paymentPairs = paymentsString.split(", ");
    const jsonObject = {};

    for (const pair of paymentPairs) {
      const parts = pair.split(" - ");
      if (parts.length === 2) {
        const paymentType = parts[0].trim();
        const amount = parseFloat(parts[1]);
        if (!isNaN(amount)) {
          jsonObject[paymentType] = amount;
        }
      }
    }

    return jsonObject;
  }

  const handleExport = async (event, rowData) => {
    const payload = {
      employee_id: rowData.employee_id,
      headerLocationId: headerLocationId,
      date: moment(collectionDate).format('YYYY-MM-DD')
    };
    let paymentModes = []

    await PaymentMethodServices.getAllPaymentModeForPaymentPage()
      .then((res) => {
        paymentModes = res.data
        setAllPaymentModes(res.data);
      })
      .catch((err) => { })

    dispatch(getAllCollectionsBySalesmanAction(payload, async (response) => {
      const data = await response;
      const collectionData = data.map((item) => ({
        ...item,
        payment_type: convertMultiplePaymentsStringToJson(item.payment_type),
      }));

      const doc = new jsPDF({ orientation: 'landscape' });

      doc.setFontSize(10)
      doc.text(`Name : ${rowData.first_name} ${rowData.last_name || ''}`, 14, 10)

      doc.setFontSize(10)
      doc.text(`COLLECTIONS REPORT :`, 14, 17)
      doc.text(`Date : ${moment(collectionDate).format('DD/MM/YYYY')}`, 270, 10, { align: 'right' })

      const headers = [
        [
          { content: 'Customer', rowSpan: 2 },
          { content: 'Invoice Number', rowSpan: 2 },
          { content: 'Invoice Amount', rowSpan: 2 },
          { content: 'Received', rowSpan: 2 },
          { content: 'Mode of Payment', colSpan: paymentModes.length },
          { content: 'Acknowledgement', rowSpan: 2 },
        ],
        paymentModes.map((mode) => mode.paymentName),
      ];

      const rows = collectionData.map((item) => {
        console.log(item, 'exportRows item')
        console.log(paymentModes, 'exportRows paymentModes')
        const paymentValues = paymentModes.map(
          (mode) => item.payment_type?.[mode.paymentName] || '-'
        );

        console.log(paymentValues, salesManList, 'exportRows')

        return [
          item.company_name || '',
          item.invoice_number || '',
          item.total || '',
          item.collected || '',
          ...paymentValues,
          '',
        ];
      });

      const invoiceTotal = collectionData.reduce((sum, acc) => sum + acc.total, 0)
      const collectedTotal = collectionData.reduce((sum, acc) => sum + acc.collected, 0)
      const paymentValueTotal = paymentModes.map((mode) => {
        return collectionData.reduce((sum, item) => {
          const paymentType = item.payment_type || {};
          return sum + (paymentType[mode.paymentName] || 0);
        }, 0);
      });
      console.log(paymentValueTotal, 'exportRows paymentValueTotal')

      const totals = [
        { content: 'Total', colSpan: 2 },
        invoiceTotal, collectedTotal, ...paymentValueTotal
      ]

      console.log(rows, 'exportRows')

      doc.autoTable({
        head: headers,
        body: rows,
        startY: 20,
        theme: 'grid',
        styles: { fontSize: 10, valign: 'middle', halign: 'center', lineColor: [0, 0, 0] },
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineColor: [0, 0, 0], lineWidth: 0.1 },
        foot: [totals],
        footStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineColor: [0, 0, 0], lineWidth: 0.1 },
        didDrawPage: function (page) {
          const pageHeight = doc.internal.pageSize.height

          doc.setFontSize(10)
          doc.setFont('helvetica', 'bold')
          doc.text("Signature", 40, pageHeight - 20)
          doc.text("Checked By", doc.internal.pageSize.width - 60, pageHeight - 20)
        }
      });

      doc.save(`${rowData.first_name} ${rowData.last_name || ''} Collections.pdf`);
    }));
  };

   const quickDates = [
      { label: 'Today', daysAgo: 0 },
      { label: 'Yesterday', daysAgo: 1 },
      { label: moment().subtract(2, 'days').format('DD MMM'), daysAgo: 2 },
      { label: moment().subtract(3, 'days').format('DD MMM'), daysAgo: 3 },
      { label: moment().subtract(4, 'days').format('DD MMM'), daysAgo: 4 },
      { label: moment().subtract(5, 'days').format('DD MMM'), daysAgo: 5 },
    ];

  const handleDelete = (item) => {
    const payload = {
      employee_id: item.employee_id,
      headerLocationId: headerLocationId,
      date: moment(collectionDate).format('YYYY-MM-DD')
    }
    dispatch(deleteSalesmanCollectionByIdAction(item.id, payload))
  }

  const handleQuickDate = (daysAgo) => {
    const selectedDate = moment().subtract(daysAgo, 'days').format('YYYY-MM-DD');
    setCollectionDate(selectedDate);
    console.log(selectedDate, 'selectedDAtee')
    setSelectedDaysAgo(daysAgo);
    if (employeeId) {
      setEmployeeId(employeeId);
    }
  };

  const handleSalesmanClick = (empId) => {
  setEmployeeId(empId);
  const selectedDate = collectionDate || moment().format('YYYY-MM-DD');
  setCollectionDate(selectedDate);
  console.log(selectedDate, empId, selectedDaysAgo, 'selectedDAtee1')
};
 
  const handleApply = (selectedDate) => {
      setCollectionDate(selectedDate);
      const matched = quickDates.find(({ daysAgo }) =>
        moment().subtract(daysAgo, 'days').format('YYYY-MM-DD') === selectedDate
      );
      if (matched) {
        setSelectedDaysAgo(matched.daysAgo);
      } else {
        setSelectedDaysAgo(null);
      }
      setOpenFilter(false);
    }

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title> {titleURL} | Salesman Collections </title>
      </Helmet>
      {/* <Card sx={{ maxHeight: `calc(${maxHeight} - 0.5px)`, minHeight: `calc(${maxHeight} - 0.5px)` }}> */}
      {selectedSection === 'DateSelection' && (
        <Grid container spacing={1} sx={{ display: 'flex', alignItems: 'center' }}>
          <Grid
            size={{
              lg: 3,
              md: 3,
              sm: 3,
              xs: 12
            }}>
            <Card sx={{ height: 'calc(100vh - 80px)', padding: '20px' }}>
              {/* <LocalizationProvider dateAdapter={DateAdapter}
              >
                <DatePicker
                  label="Collection Date"
                  value={collectionDate}
                  onChange={(newDate) => setCollectionDate(newDate)}
                  renderInput={(params) => <TextField {...params} variant="filled" fullWidth />}
                  disableFuture
                />
              </LocalizationProvider> */}
              <Grid
                marginBottom='20px'
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  Salesman Collections
                </Typography>
              </Grid>
              
              <div>
                <CommonSearch
                  searchVal={pagination.searchString}
                  requestSearch={requestSearch}
                  cancelSearch={cancelSearch}
                />
              </div>
              <Box
                sx={{
                  height: 'calc(100vh - 220px)',
                  overflowY: 'auto',
                  pr: 1
                }}
              >
              <Stack spacing={1} marginTop='20px'>
                {salesManList?.map((item) => {
                  const isActive = employeeId === item.empId;
                  console.log('isactiveee', isActive, employeeId, item, salesManList)
                  return (
                    <Box key={item.empId} onClick={() => handleSalesmanClick(item.empId)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#0288d1' : '#000',
                        backgroundColor: isActive ? '#e3f2fd' : 'transparent',
                        '&:hover': {
                          backgroundColor: '#f5f5f5',
                        },
                      }}
                    >
                      <Box>
                        <Typography fontSize={14} textTransform="capitalize">
                          {item.first_name} {item.last_name || ''}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Employee Code: {item.employeeId}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
              </Box>
            </Card>
          </Grid>

          <Grid
            size={{
              lg: 9,
              md: 9,
              sm: 9,
              xs: 12
            }}>
            <Card sx={{ height: 'calc(100vh - 80px)' }}>
              <MaterialTable
                style={{
                  borderRadius: "5px"
                }}
                options={getStickyTableOptions({
                   bodyOffset: 200,
                  options:{
                     search: false,
                  exportButton: false,
                  filtering: false,
                  paging: true,
                  pageSizeOptions: [20, 50, 100],
                  pageSize: pagination.numPerPage,
                  actionsColumnIndex: -1,
                  // maxBodyHeight:maxBodyHeight,
                  // minBodyHeight:maxBodyHeight,
                   tableLayout: "auto",
                   toolbar: true,
                  }
                })}
                columns={[
                  {
                    title: 'Date',
                    field: 'createdAt',
                    render: (rowData) => moment(rowData.createdAt).format('DD/MM/YYYY')
                  },
                  {
                    title: 'Name',
                    field: 'first_name',
                    render: (rowData) => `${rowData.first_name} ${rowData.last_name || ''}`
                  },
                  {
                    title: 'Total',
                    field: 'total_collected',
                    cellStyle: {
                      textAlign: 'left',
                      paddingRight: '10px',
                      fontSize: cellStyle.fontSize,
                    },
                    headerStyle: {
                      textAlign: 'left',
                      paddingRight: '10px'
                    }
                  },
                  {
                    title: 'Count',
                    field: 'invoice_count'
                  },
                  // {
                  //   title: 'Action',
                  //   field: 'action',
                  //   render: (rowData) => (
                  //     <>
                  //       <Tooltip title='View'>
                  //         <IconButton onClick={(event) => handleRowClick(event, rowData)}>
                  //           <VisibilityIcon />
                  //         </IconButton>
                  //       </Tooltip>

                  //       <Tooltip title='Export'>
                  //         <IconButton onClick={(event) => handleExport(event, rowData)}>
                  //           <FileDownloadOutlinedIcon />
                  //         </IconButton>
                  //       </Tooltip>
                  //     </>
                  //   )
                  // }
                ]}
                data={salesmanCollections.data}
                totalCount={salesmanCollections.numRows}
                title={<Typography variant='h6'>Salesman Collections</Typography>}
                onRowClick={handleRowClick}
                page={pagination.pageCount}
                onPageChange={(page) => setPagination((prev) => ({ ...prev, pageCount: page }))}
                onRowsPerPageChange={(size) => setPagination((prev) => ({ ...prev, numPerPage: size }))}
                components={{
                  ...stickyTableComponents,
                  Toolbar: (props) => (
                    (<div>
                      {/* <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}> */}
                      <Grid container spacing={2}>
                                    <Grid
                                      display='flex'
                                      alignContent='center'
                                      size={{
                                        lg: 3.5,
                                        md: 3.5,
                                        sm: 3.5,
                                        xs: 12
                                      }}>
                                      <div style={{ width: '100%' }}>
                                                <MTableToolbar {...props} />
                                              </div>
                                    </Grid>

                                    <Grid
                                      display='flex'
                                      justifyContent='end'
                                      size={{
                                        lg: 8,
                                        md: 8,
                                        sm: 8,
                                        xs: 12
                                      }}>
                                      <Box display="flex" gap={1} flexWrap="wrap" mt={3}>
                                        {quickDates.map(({ label, daysAgo }) => {
                                          const isSelected = selectedDaysAgo !== null && selectedDaysAgo === daysAgo;
                                          return (
                                            <Button
                                              key={label}
                                              variant={isSelected ? "contained" : "outlined"}
                                              size="small"
                                              onClick={() => handleQuickDate(daysAgo)}
                                              sx={{
                                                borderRadius: '20px',
                                                textTransform: 'none',
                                                fontWeight: 500,
                                                px: 2,
                                                color: isSelected ? '#fff' : '#0288d1',
                                                backgroundColor: isSelected ? '#0288d1' : 'transparent',
                                                height: '35px',
                                                borderColor: '#0288d1',
                                                '&:hover': {
                                                  backgroundColor: isSelected ? '#0288d1' : '#e1f5fe',
                                                  color: isSelected ? '#fff' : '#0288d1',
                                                },
                                              }}
                                            >
                                              {label}
                                            </Button>
                                          );
                                        })}
                                      </Box>
                                    </Grid>

                                    <Grid
                                      display='flex'
                                      justifyContent='end'
                                      size={{
                                        lg: 0.5,
                                        md: 0.5,
                                        sm: 0.5,
                                        xs: 12
                                      }}>
                                      <IconButton onClick={() => setOpenFilter(true)} size="large">
                                        <FilterAltIcon />
                                      </IconButton>
                                    </Grid>
                                    </Grid>
                    </div>)
                        

                      // </div>
                  )
                }}
                actions={[
                  {
                    icon: () => <VisibilityIcon />,
                    tooltip: 'View',
                    position: 'row',
                    onClick: (event, rowData) => handleRowClick(event, rowData)
                  },
                  {
                    icon: () => <FileDownloadOutlinedIcon />,
                    tooltip: 'Export',
                    position: 'row',
                    onClick: (event, rowData) => handleExport(event, rowData)
                  },
                ]}
              />
            </Card>

          </Grid>
        </Grid>
      )}
      {selectedSection === 'SalesManList' && (
        <Grid container spacing={3}>
          <Grid
            size={{
              lg: 3,
              md: 3,
              sm: 6,
              xs: 6
            }}>
            <Card elevation={3} style={{ backgroundColor: '#F5F5F5', border: '1px solid #E0E0E0' }}>
              <CardContent sx={{ padding: '10px !important', paddingBottom: '10px !important' }}>
                <Typography variant="h6" style={{ color: '#00796B', fontSize: '13px' }}>
                  {`Date`}
                </Typography>
                <Typography style={{ color: '#009688', fontSize: '13px' }}>
                  {moment(collectionDate).format('DD/MM/YYYY')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid
            size={{
              lg: 3,
              md: 3,
              sm: 6,
              xs: 6
            }}>
            <Card elevation={3} style={{ backgroundColor: '#F5F5F5', border: '1px solid #E0E0E0' }}>
              <CardContent sx={{ padding: '10px !important', paddingBottom: '10px !important' }}>
                <Typography variant="h6" style={{ color: '#00796B', fontSize: '13px' }}>
                  {`Salesman Name`}
                </Typography>
                <Typography style={{ color: '#009688', fontSize: '13px' }}>
                  {salesmanName}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid
            size={{
              lg: 3,
              md: 3,
              sm: 6,
              xs: 6
            }}>
            <Card elevation={3} style={{ backgroundColor: '#F5F5F5', border: '1px solid #E0E0E0' }}>
              <CardContent sx={{ padding: '10px !important', paddingBottom: '10px !important' }}>
                <Typography variant="h6" style={{ color: '#00796B', fontSize: '13px' }}>
                  {`Total Amount Collected`}
                </Typography>
                <Typography style={{ color: '#009688', fontSize: '13px' }}>
                  ₹ {collectionsBySalesman.reduce((sum, item) => sum + parseFloat(item.collected), 0).toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid
            size={{
              lg: 3,
              md: 3,
              sm: 6,
              xs: 6
            }}>
            <Card elevation={3} style={{ backgroundColor: '#F5F5F5', border: '1px solid #E0E0E0' }}>
              <CardContent sx={{ padding: '10px !important', paddingBottom: '10px !important' }}>
                <Typography variant="h6" style={{ color: '#00796B', fontSize: '13px' }}>
                  {`Collection Count`}
                </Typography>
                <Typography style={{ color: '#009688', fontSize: '13px' }}>
                  {collectionsBySalesman.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={12}>
            {/* <MaterialTable
              title = 'Collections'
              data = {collectionsBySalesman}
              columns = {[
                {
                  field: 'invoice_number',
                  title: 'Invoice Number'
                },
                {
                  field: 'company_name',
                  title: 'Customer'
                },
                {
                  field: 'collected',
                  title: 'Amount'
                },
                {
                  field: 'payment_type',
                  title: 'Payment Type'
                },
                {
                  field: 'status',
                  title: 'Approval Status'
                },
                {
                  field: 'isReconciliated',
                  title: 'Reconciliation Status',
                  render: (rowData) => rowData.isReconciliated === 0 ? 'Not Reconciliated' : 'Reconciliated'
                }
              ]}
              options = {{
                selection: true,
                selectionProps: (rowData) => ({
                  disabled: rowData.isReconciliated === 1
                }),
                exportButton: true,
                exportMenu: [
                  {
                    label: 'Export PDF',
                    exportFunc: (col, data) => {
                      const finalData = data.map(d => ({ ...d, isReconciliated: d.isReconciliated === 0 ? 'Not Reconciliated' : 'Reconciliated' }))
                      ExportPdf(col, finalData, 'Salesman Collections')
                    }
                  },
                  {
                    label: 'Export CSV',
                    exportFunc: (col, data) => {
                      const finalData = data.map(d => ({ ...d, isReconciliated: d.isReconciliated === 0 ? 'Not Reconciliated' : 'Reconciliated' }))
                      ExportCsv(col, finalData, 'Salesman Collections')
                    }
                  }
                ],
                maxBodyHeight,
                minBodyHeight: 'calc(100vh - 320px)',
              }}
              onSelectionChange={(rows) => setSelectedData(rows.filter(row => row.isReconciliated === 0))}
            /> */}
            <Card sx={{ p: 2 }}>
              <Grid container>
                <Grid size={12}>
                  <Typography variant='h6'>Collections</Typography>
                </Grid>

                <Grid size={12}>
                  <TableContainer sx={{ minHeight: 'calc(100vh - 235px)', maxHeight: 'calc(100vh - 235px)' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell rowSpan={2} align="center">Actions</TableCell>
                          <TableCell rowSpan={2} align="center">Invoice Number</TableCell>
                          <TableCell rowSpan={2} align="center">Customer</TableCell>
                          <TableCell rowSpan={2} align="center">Amount</TableCell>
                          <TableCell rowSpan={2} align="center">Reference</TableCell>
                          <TableCell colSpan={allPaymentModes.length} align="center">Mode of Payment</TableCell>
                          <TableCell rowSpan={2} align="center">Reconciliation Status</TableCell>
                        </TableRow>

                        <TableRow>
                          {
                            allPaymentModes.map((paymentMode) => (
                              <TableCell key={paymentMode.paymentId} align="center">{paymentMode.paymentName}</TableCell>
                            ))
                          }
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {
                          collectionsBySalesman.length > 0 ? collectionsBySalesman.map((item) => {
                            const paymentType = convertMultiplePaymentsStringToJson(item.payment_type)

                            return (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <Grid container spacing={3} display='flex'>
                                    <Grid size={6}>
                                      {
                                        item.isReconciliated === 0 ?
                                          <Tooltip title='Reconciliate'>
                                            <IconButton onClick={(event) => handleSubmit(event, item)}>
                                              <AssignmentLateIcon color='warning' />
                                            </IconButton>
                                          </Tooltip>
                                          :
                                          <Tooltip title='Reconciliated'>
                                            <IconButton onClick={(event) => event.preventDefault()}>
                                              <AssignmentTurnedInIcon color='success' />
                                            </IconButton>
                                          </Tooltip>
                                      }
                                    </Grid>

                                    <Grid size={6}>
                                      <Tooltip title='Delete'>
                                        <IconButton onClick={() => handleDelete(item)} disabled={item.isReconciliated === 1}>
                                          <DeleteIcon />
                                        </IconButton>
                                      </Tooltip>
                                    </Grid>
                                  </Grid>
                                </TableCell>
                                <TableCell>{item.invoice_number}</TableCell>
                                <TableCell>{item.company_name}</TableCell>
                                <TableCell>{item.collected}</TableCell>
                                <TableCell>{item.reference}</TableCell>
                                {
                                  allPaymentModes.map((paymentMode) => (
                                    <TableCell key={paymentMode.paymentId}>{paymentType[paymentMode.paymentName] || '-'}</TableCell>
                                  ))
                                }
                                <TableCell>{item.isReconciliated === 0 ? 'Not Reconciliated' : 'Reconciliated'}</TableCell>
                              </TableRow>
                            );
                          }) : (
                            <TableRow>
                              <TableCell>No Records Available</TableCell>
                            </TableRow>
                          )
                        }
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          <Grid size={12}>
            <Grid container spacing={3} display='flex' justifyContent='flex-end'>
              <Grid>
                <Button
                  onClick={handleBack}
                  disabled={isBackDisabled}
                  variant="contained"
                  color="error"
                >
                  Back
                </Button>
              </Grid>

              {/* <Grid>
                <Button variant="contained" color="primary" disabled={selectedData.length === 0} onClick={(event) => handleSubmit(event, null)}>
                  Submit
                </Button>
              </Grid> */}
            </Grid>
          </Grid>
        </Grid>
      )}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Confirm Reconciliation</DialogTitle>
        <DialogContent>
          The checked data will be reconciled. Are you sure you want to proceed?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleReconciliation} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      {/* </Card> */}
      <SalesManVisitsFilter
        open={openFilter}
        onClose={() => {
          const today = moment().format('YYYY-MM-DD');
          setOpenFilter(false)
          setCollectionDate(today)
          setSelectedDaysAgo(0)
        }}
        onApply={handleApply}
        date={collectionDate}
        setDate={setCollectionDate}
      />
    </>
  );
}

export default DashboardPage;

