import React, { useEffect, useState, useRef, useContext } from 'react';
// import PropTypes from 'prop-types';
import { Box, Grid, CardContent, Card, Stack, TablePagination, Tooltip, Dialog, Modal, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress, Snackbar, Divider, Chip, TableSortLabel, Link, MenuItem, Menu } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import { Table, Button } from '@mui/material';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useDispatch, useSelector } from 'react-redux';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import ShareIcon from '@mui/icons-material/Share';
import {
  SalesAdvanceEntry,
  approvalUserRightsAction,
  createSalesApproval,
  listSalesOutstandingAction,
  listSalesPendingAction,
  salesApprovalsAction,
  sendMail,
  saleIdGET,
  salesGetById,
  listSalesOutstandingActionExport
} from '../../../redux/actions/sales_actions';
// import { Alert } from '@mui/material';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import {
  // listSalesAction,
  receiptEntry,
  consolidatedReceivings,
  getbyidReceivableAction,
  set_searchReceivableAction,
  searchReceivableAction
} from '../../../redux/actions/sales_actions';
import { listCustomerAction, getbyidCustomerAction, customerAsCompanyAction } from '../../../redux/actions/customer_actions';
import { listProductAction } from '../../../redux/actions/product_actions';
import PaymentDialog from '../paymentSalesPurchase/Dialog';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import NoRecordFound from '../../../components/Layout/NoRecordFound';
import { getAppConfigDataAction, getAppConfigDataBasedOnTypeAction } from '../../../redux/actions/app_config_actions';
import InvoiceDialog from '../sales/InvoiceDialog';
import Context from '../../../context/CreateNewButtonContext';
import CardTemplate from '../../../components/customer_erpDesign/cardTemplate';
import { getDateTime, getDateTimeFormat } from '../../../utils/getTimeFormat';
import { sendNtfy } from '../../../firebase/firebase.service';
import { getLoginRoleAction } from '../../../redux/actions/userRole_actions';
import Cookies from 'universal-cookie';
import notificationType from '../../../firebase/notify_type';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { listChartOfAccountsAction } from '../../../redux/actions/chartOfAccounts';
import { createTransactionAction } from '../../../redux/actions/transaction_actions';
import { CreateNotificationAction } from 'redux/actions/notification_actions';
import { getByIdMailConfigurationAction } from '../../../redux/actions/configuration_actions';
import { listUserCreationAction } from '../../../redux/actions/userCreation_actions';
import AddchartIcon from '@mui/icons-material/Addchart';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import DateRangeIcon from '@mui/icons-material/DateRange';
import Cards from '../../../components/dynamicCards/index';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import PriceCheckOutlinedIcon from '@mui/icons-material/PriceCheckOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import apiCalls from 'utils/apiCalls';
import { Helmet } from "react-helmet-async";
import { getsessionStorage } from 'pages/common/login/cookies';
import { headerStyle, maxBodyHeight, maxHeight, pageSize, tabHeight } from 'utils/pageSize';
import { getManualNoteSchemesByIdAction } from 'redux/actions/manualNotes_actions';
import LocationAlert from 'pages/assets/alert/LocationAlert';
import CommonSearch from 'utils/commonSearch';
import { titleURL } from 'http-common';
import { roleType } from 'utils/roleType';
import { getOpeningBalActions } from 'redux/actions/ledger_actions';
import OpeningBalPayment from './openingBalPayment';
import CommonToolTip from '../../../components/ToolTip';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SyncIcon from '@mui/icons-material/Sync';
import ReminderForm from 'pages/common/Calender/ReminderForm';
import moment from 'moment';
import { useCustomFetch } from 'utils/useCustomFetch';
import { billReceivablesAction, lastSyncAction, getUnmatchedRecordsAction } from '../../../redux/actions/payment_method_actions';
import {
  getCalenderHolidaysAction,
  getEventsAction,
  getPayablesDueAction,
  getReceivablesDueAction,
  getRemindersAction,
  ListPayrollCalender,
} from 'redux/actions/calender_actions';
import { GridTableRowsIcon } from '@mui/x-data-grid';
import { Form, Formik } from 'formik';
import App from 'components/customer_erpDesign';
import CloseIcon from '@mui/icons-material/Close';
import { useLocation, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import jsPDF from "jspdf";
import ReceiptPayments from '../../../components/ReceiptPayments/ReceiptPayments';
import ContactPage from '../../../../src/@crema/services/db/Contact/index';
import { setInvoiceTempAction } from 'redux/actions/vendor_actions';
import { OpenCustomerLandingPage } from '@crema/utility/helper/RouteHelper';
import ShareReport from '../salesReport/ShareReport';
import { unparse } from 'papaparse';
import { saveAs } from 'file-saver';
import ReceivablesLandingPage from './ReceivablesLandingPage'
import API_URLS from 'utils/customFetchApiUrls';
import KpiStrip from './shared/KpiStrip';
import AgingChips from './shared/AgingChips';
import ViewToggleChips from './shared/ViewToggleChips';
import ExportMenu from './shared/ExportMenu';
import OutstandingPagination from './shared/OutstandingPagination';
import OutstandingTable from './shared/OutstandingTable';
import CollapsibleGroupRow from './shared/CollapsibleGroupRow';
import OpeningBalanceTable from './shared/OpeningBalanceTable';
import SortableHeader from './shared/SortableHeader';
import { formatRupeesCompact } from './shared/formatRupees';
import useChipState from './shared/useChipState';
import usePagination from './shared/usePagination';
import useTableSort from './shared/useTableSort';
import { getMenuAccessAction } from '../../../redux/actions/rbac_actions';
// import { UserRightsAuthorization } from '../../../src/creama/utility/helper/UserRightsHelper';
import { UserRightsAuthorization } from '../../../@crema/utility/helper/UserRightsHelper'

function Row(props) {
  const { row, invoiceFunction, sales_data, handleMailConfiguration, handleRowData } = props;
  const [entryvalue, sethandleEntry] = useState(false)
  const roundToTwo = (value) => Number((value || 0).toFixed(2));
  const {
    productReducer: { product },
    salesReducer: { sales },
    appConfigReducer: { app_config_data },
    customerReducer: { customer,customerAsCompany },
  } = useSelector((state) => state);
  const dispatch = useDispatch()
  const GetTotal = (row) => {
    let total = 0;
    if (row.childRow) {
      row.childRow.forEach((val) => {
        total = roundToTwo(total + (Number(val.total) || 0));
      });
    }
    return roundToTwo(total);
  };

  const [rowData, setRowData] = useState({})
  const storage = getsessionStorage()

  useEffect(() => {
    if (Object.keys(rowData).length > 0) {
      handleRowData(rowData); // Send updated rowData to parent
    }
  }, [rowData]);

  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
    employee_id,
  } = useContext(Context);
  const apiCAll = () => {

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      !product?.length && dispatch(listProductAction(setModalTypeHandler, setLoaderStatusHandler)),
      !app_config_data?.length && dispatch(getAppConfigDataAction()),
    )
  }

  const openingBal = props.openingBalanceLedgers.find(j => j.ledger_id === row.ledger_id);


  const exportColumns = [
    { label: "Invoice Date", key: "invoice_date" },
    { label: "Invoice", key: "invoice_number_or_dc_number" },
    { label: "Delivered Date", key: "delivered_date" },
    { label: "Invoice Amount", key: "total" },
    { label: "Due Amount", key: "due_amount" },
    { label: "Receipt", key: "received_amount" },
    { label: "Due Date", key: "due_date" },
    { label: "Due Days", key: "due_days" },
    { label: "Reminder", key: "reminder" },
  ];
  
  const getFormattedExportData = (rows) => {
    // console.log("asdasd",rows)
    return rows.map((item) => ({
      invoice_date: item.invoice_date ? moment(item.invoice_date).format("DD/MM/YYYY") : "-",
      invoice_number_or_dc_number: item.invoice_number || item.dc_number || "-",
      delivered_date: item.delivered_date ? moment(item.delivered_date).format("DD/MM/YYYY : hh:mm A") : "-",
      total: item.total ?? 0,
      due_amount: item.due_amount ?? 0,
      received_amount:   item.total && item.received_amount != null && item.total > item.received_amount
              ? "Pending"
              : "Paid",
      due_date: item.due_date ? moment(item.due_date).format("DD/MM/YYYY") : "-",
      due_days: item.due_days ?? 0,
      reminder: item.reminder ?? "-",
    }));
  };

  const handleExportPDF = () => {
    const data = getFormattedExportData(row?.childRow || []);
    const fileName = `${row?.companyName || row?.customerName || "SalesOutstanding"}`;
    ExportPdf(exportColumns, data, fileName);
  };

  const handleExportCSV = () => {
    const data = getFormattedExportData(row?.childRow || []);
    const fileName = `${row?.companyName || row?.customerName || "SalesOutstanding"}`;
    ExportCsv(exportColumns, data, fileName);
  };

const ExportPdf = (columns, data, fileName = "Export") => {
  const doc = new jsPDF();

  const tableColumnHeaders = columns.map(col => col.label);
  const tableRows = data.map(row =>
    columns.map(col => row[col.key])
  );

  doc.text(fileName, 14, 15);
  doc.autoTable({
    head: [tableColumnHeaders],
    body: tableRows,
    startY: 20,
    styles: { fontSize: 8 }
  });

  doc.save(`${fileName}.pdf`);
};

const ExportCsv = (columns, data, fileName = "Export") => {
  const csvData = data.map(row => {
    const newRow = {};
    columns.forEach(col => {
      newRow[col.label] = row[col.key];
    });
    return newRow;
  });

  const csv = unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${fileName}.csv`);
};
  

  return (
    <React.Fragment>
      <Helmet>
        <meta charSet="utf-8" />
        <title> {titleURL} | Receivables </title>
      </Helmet>
      <CollapsibleGroupRow
        colSpan={6}
        onToggle={() => apiCAll()}
        parent={(() => {
          const dimmed = Number(row.total_due_amount) === 0;
          const cellSx = dimmed ? { color: 'text.disabled' } : undefined;
          return (
            <>
              <TableCell
                component='th'
                scope='row'
                sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 280, ...(cellSx || {}) }}
              >
                {row.companyName ? row.companyName : row.customerName ? row.customerName : ' '}
              </TableCell>
              <TableCell align="right" sx={cellSx}>{row?.childRow?.length}</TableCell>
              <TableCell align="right" sx={cellSx}>{row?.averageDueDays}</TableCell>
              <TableCell align="right" sx={cellSx}>{row?.total_invoice_amount}</TableCell>
              <TableCell align="right" sx={cellSx}>{row.total_due_amount}</TableCell>
            </>
          );
        })()}
        expanded={
          <>
            <>
              {props.receivablesExport && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
                  <ExportMenu
                    items={[
                      { label: 'Export PDF', onClick: handleExportPDF },
                      { label: 'Export CSV', onClick: handleExportCSV },
                    ]}
                  />
                </Box>
              )}
                <Table size='small' aria-label='purchases'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice Date</TableCell>
                      <TableCell>Invoice</TableCell>
                      <TableCell>Delivered Date</TableCell>
                      {/* <TableCell>Description</TableCell> */}
                      {/* <TableCell>Delivered qty</TableCell> */}
                      {/* <TableCell align="right">discount_type</TableCell> */}
                      <TableCell align='right'>
                          <Box sx={{ textAlign: 'right', width: '100%' }}>
                            Invoice Amount
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ textAlign: 'right', width: '100%' }}>
                            Due Amount
                          </Box>
                        </TableCell>
                      <TableCell>Receipt</TableCell>
                      {/* <TableCell>Due Days</TableCell> */}
                      <TableCell>Due Date</TableCell>
                      <TableCell>Due Days</TableCell>
                      <TableCell>Reminder</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.childRow?.map((historyRow) => (
                      <TableRow 
                      style={{cursor : 'pointer'}}
                      onClick={() => props.landingOpen(historyRow)}
                      key={historyRow.description}>
                        <TableCell>{moment(historyRow.invoice_date).format('DD/MM/YYYY')}</TableCell>
                        {historyRow?.saleType != 'Outstanding Invoice' ?
                          <TableCell component='th' scope='row'>
                            <div
                              style={{
                                textDecoration: 'none',
                                cursor: 'pointer',
                                color: '#03adfc',
                                display: 'inline-block',
                              }}
                              onClick={(e) => { e.stopPropagation(); invoiceFunction(historyRow); handleMailConfiguration(); }}
                            >
                              {historyRow.invoice_number ?? historyRow.dc_number}
                            </div>
                          </TableCell> :
                          <TableCell>
                            {historyRow.invoice_number ?? historyRow.dc_number}
                          </TableCell>}

                        {/* <TableCell>{historyRow.description}</TableCell> */}
                        <TableCell>{historyRow.delivered_date ? moment(historyRow.delivered_date).format('DD/MM/YYYY : hh:mm A') : '-'}</TableCell>
                        {/* <TableCell>{historyRow.delivered_qty}</TableCell> */}
                        {/* <TableCell align="right">{historyRow.discount_type}</TableCell> */}
                        <TableCell align='right'>
                          <Box sx={{ textAlign: 'right', width: '100%', paddingRight: '20px' }}>
                          {historyRow.total}
                          </Box>
                          </TableCell>
                        <TableCell>
                           <Box sx={{ textAlign: 'right', width: '100%', paddingRight: '20px' }}>
                            {historyRow.due_amount}
                            </Box>
                            </TableCell>
                        <TableCell>
                          {historyRow.saleType === 'DC' ? null : (historyRow.total !== historyRow.received_amount &&
                              historyRow.total > historyRow.received_amount) ? (
                            props.receiptCreate ? (
                              <Tooltip title="Record payment">
                                <IconButton
                                  size="small"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    props.pendingPayment(historyRow.sale_id, [historyRow]);
                                    setRowData(row);
                                  }}
                                  sx={{ p: 0.25 }}
                                >
                                  <AssignmentLateIcon fontSize="small" color="warning" />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Pending">
                                <AssignmentLateIcon fontSize="small" color="warning" />
                              </Tooltip>
                            )
                          ) : (
                            <Tooltip title="Paid">
                              <AssignmentTurnedInIcon fontSize="small" color="success" />
                            </Tooltip>
                          )}
                        </TableCell>
                        {/* <TableCell>{historyRow.due_days}</TableCell> */}
                        {/* <TableCell>{historyRow.due_days_credit}</TableCell> */}
                        <TableCell>{moment(historyRow.due_date).format('DD/MM/YYYY')}</TableCell>
                        <TableCell>
                         {historyRow.due_days}
                        </TableCell>
                        <TableCell>{historyRow.reminder ? moment(historyRow.reminder).format('DD/MM/YYYY : hh:mm A') : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
              {/* ) : null} */}
            <OpeningBalanceTable
              title={row.companyName ? row.companyName : row.customerName ? row.customerName : ''}
              ledgers={props.openingBalanceLedgers.filter((j) => j.ledger_id === row.ledger_id)}
              getAmount={(j) => (j.debit ?? 0) - (j.credit ?? 0)}
              renderPayment={(j) => (
                <div style={{ display: 'flex', cursor: 'pointer' }}>
                  <CommonToolTip title="Make payment">
                    <AssignmentLateIcon
                      onClick={() => props.handleOpeningBalPayment(j)}
                      color="warning"
                    />
                  </CommonToolTip>
                </div>
              )}
            />
          </>
        }
      />
    </React.Fragment>
  );
}

export default function CollapsibleTable() {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const location = useLocation();
  const pageType = location.state?.pageType;
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(Context);
  const {
    salesReducer: { sale_outstanding, consolidated_data, sale_outstanding_count, setReceivable, salesApprovals, getApprovalRights,sharedData },
    customerReducer: { customer,customerAsCompany  },
    productReducer: { product },
    salesReducer: { sales, salesgetbyid },
    appConfigReducer: { app_config_data ,app_config_data_based_on_type},
    ChartOfAccountsReducer: { chartOfAccounts },
    UserCreationReducer: { createUser },
    ConfigurationReducer: { mail_configuration },
    ledgerReducer: { openingBalanceLedgers },
    rbacReducer: {menuAccess}
  } = useSelector((state) => state);


  let storage = getsessionStorage()
  const selectedRole = storage.role_name
  const tempinitsform = useRef(null);

  const [openAlert, setOpenAlert] = useState(false);
  const [Tdata, setTdata] = useState([]);
  const [entryvalue, setHandleEntry] = useState(false)
  const [received_amount, setReceived_amount] = useState(0);
  const [paymentOpen, setPaymentOpen] = useState(false);
  // const [sale_id,setSale_id] = useState("")
  const [sales_items, setSalesItems] = useState([]);
  const [getCustomer, setGetCustomer] = useState([]);
  const [selectionModel, setSelectionModel] = useState([]);
  const [getPay, setgetPay] = useState([]);
  const [appConfigData, setAppConfigData] = useState({});
  // const [resData,setResdata] = useState([]);
  const [recData, setReceData] = useState([]);
  const [popUpdata, setPopupData] = useState({
    invoice: '',
    custData: {},
    soDate: '',
    sales_items: [],
    Dopen: false,
    customer_id: '',
    sale_id: '',
  });
  const [isApiFinished, setIsApiFinished] = useState(false)
  const [manualNoteSchemes, setManualNoteSchemes] = useState([]);
  // const [rowsPerPage] = useState(1);
  const { page, size, setPage, setSize, handleChangePage, handleChangeRowsPerPage } = usePagination({ initialSize: 20 });
  const [searchVal, setSearchVal] = useState("")
  const [searchData, setSearchData] = useState([]);
  const tempinitsformVal = useRef(null);
  const addAdvanceAmount = useRef(null)
  const [openingBalPaymentOpen, setOpeningBalPaymentOpen] = useState(false)
  const [openingBalData, setOpeningBalData] = useState({})
  const [reminder, setReminder] = useState(false)
  const [unmatchedRecords, setUnmatchedRecords] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [receivablesLastSync, setReceivablesLastSync] = useState(null);
  const [insertedData, setInsertedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openError, setOpenError] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [openAlertMsg, setOpenAlertMsg] = useState(false);
  const [handleAlert, setHandleAlert] = useState(false);
  const [invoiceData, setInvoiceData] = useState([]);
  const { sortConfig, setSortConfig, handleSort } = useTableSort({ key: "due_days", order: "desc" });
  const { sortConfig: sortConfigParent, setSortConfig: setSortConfigParent, handleSort: handleSortParent } = useTableSort({ key: "companyName", order: "asc" });
  const [openExcessPaymentDialog, setOpenExcessPaymentDialog] = useState(false);
  const [isAddingAdvance, setIsAddingAdvance] = useState(false);
  const initialState = {
    "Overdue": false,
    "Due Today": false,
    Customers: false,
    Value: true,
    "1-15 Days": false,
    "16-30 Days": false,
    "31-45 Days": false,
    "46-60 Days": false,
    "> 61 Days": false,
    "Critical": false
  };
  const { selectedChip, activeChip, selectChip, setSelectedChip, setActiveChip } = useChipState(initialState);
  const [rowData, setRowData] = useState()
  const [totalDue, setTotalDue] = useState(null);
  const [chipDataTotals, setChipDataTotals] = useState({});
  const [onrowclick, setOnrowclick] = useState(false)
  const [data, setData] = useState()
  const [invoiceValue, setInvoiceValue] = useState({});
  const [clickedInvoice, setclickedInvoice] = useState(null);
  const [disableSubmit, setDisableSubmit] = useState(false)
  const [shareOpen,setShareOpen] =  useState(false)
  const [Schedulecolumns,setSchedulecolumns] =  useState([
  { name: "Customer Name", key: "companyName" },
  { name: "Invoice Date", key: "invoice_date" },
  { name: "Invoice", key: "invoice_number" },
  { name: "Invoice Amount", key: "total" },
  { name: "Due Amount", key: "due_amount" },
  { name: "Due Date", key: "due_date" },
  { name: "Due Days", key: "credit_exceeded" }
  ]
  ,)

  const [open,setOpen] = useState(false)
  const [rowIndex,setRowIndex] = useState([])

  // console.log(initialState, "initialState")
  // console.log(totalDue, "totalDuevvv")
  // console.log(getCustomer, "getCustomer")

  //   useEffect(() => {
  //     dispatch(listSalesOutstandingAction())
  //     dispatch(listSalesAction(()=>{},()=>{}))
  //     dispatch(listProductAction(()=>{},()=>{}))
  //     dispatch(listCustomerAction(()=>{},()=>{}))
  // }, [])
  // useEffect(() => {
  //   setModalTypeHandler()
  //   setLoaderStatusHandler()
  // }, [listSalesOutstandingAction])

  const customFetch = useCustomFetch()

  // useEffect(() => {
  //   apiCalls(
  //     setModalTypeHandler,
  //     setLoaderStatusHandler,
  //     !product?.length && dispatch(listProductAction(setModalTypeHandler, setLoaderStatusHandler)),
  //     // !app_config_data?.length && dispatch(getAppConfigDataAction())
  //   );
  // }, []);
//   console.log("11111",headerLocationId,activeChip)
// console.log('headerLocationId:', headerLocationId, 'Type:', typeof headerLocationId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const body = {
          pageCount: page,
          numPerPage: size,
          searchString: searchVal,
          key: activeChip,
          order: activeChip === "Customers" ? sortConfigParent.order || "desc" : sortConfig.order || "desc",
          val: activeChip === "Customers" ? sortConfigParent.key || "" : sortConfig.key || "",
          pageType : pageType
        }

        dispatch(
          listSalesOutstandingAction(
            body,
            commoncookie,
            headerLocationId,
            setModalTypeHandler,
            setLoaderStatusHandler
          )
        )
        dispatch(getOpeningBalActions('sundryDebtors'));
        dispatch(getMenuAccessAction(selectedRole))
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [headerLocationId, page, size, activeChip, sortConfig, sortConfigParent])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const body = {
          key: "Value",
          searchString: searchVal,
          pageType : pageType
        }

        dispatch(
          listSalesPendingAction(
            body,
            commoncookie,
            headerLocationId,
            setModalTypeHandler,
            setLoaderStatusHandler
          )
        ).then(response => {
          //console.log('rrsdssss',response);
          if (response && response?.totalPendingAmountData) {
            const chipTotals = {};
            response?.totalPendingAmountData?.forEach(item => {
              chipTotals[item.filter] = item.data;
            });
            setChipDataTotals(chipTotals);

            // Optional: setTotalDue based on activeChip
            if (chipTotals[activeChip]) {
              setTotalDue(chipTotals[activeChip]);
            } else {
              setTotalDue(0);
            }
          }

          if (response.invoiceValue) {
            setInvoiceValue(response.invoiceValue);
          }
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [headerLocationId])


  const { receivables_lastSync } = useSelector((state) => state.paymentMethodReducer);
  // console.log(receivables_lastSync, "receivables_lastSync")

  useEffect(() => {
    const exportDataCallBack = (data) => {
    };
    const setModalTypeHandler = () => { };
    const setLoaderStatusHandler = () => { };
    dispatch(lastSyncAction(setModalTypeHandler, setLoaderStatusHandler, exportDataCallBack));
    // dispatch(customerAsCompanyAction())
    // dispatch(getUnmatchedRecordsAction(setModalTypeHandler, setLoaderStatusHandler, exportDataCallBack));
  }, [dispatch]);

  // console.log(receivablesLastSync,"receivables_lastSync")

  const Dispatch1 = () => {
    // const body = {
    //   pageCount : page,
    //   numPerPage : size
    // }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      // dispatch(
      //   listSalesOutstandingAction(
      //     body,
      //     commoncookie,
      //     headerLocationId,
      //     setModalTypeHandler,
      //     setLoaderStatusHandler,
      //   ),
      // ),
      // dispatch(
      //   listSalesAction(
      //     commoncookie,
      //     headerLocationId,
      //     setModalTypeHandler,
      //     setLoaderStatusHandler,
      //   ),
      // ),
    );
  };
  const initsform = () => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      // dispatch(
      //   listSalesOutstandingAction(
      //     commoncookie,
      //     headerLocationId,
      //     setModalTypeHandler,
      //     setLoaderStatusHandler,
      //   ),
      // ),
      dispatch(consolidatedReceivings(setModalTypeHandler, setLoaderStatusHandler)),
    ).finally(() => setIsApiFinished(true));

    // dispatch(
    //   listSalesAction(
    //     commoncookie,
    //     headerLocationId,
    //     setModalTypeHandler,
    //     setLoaderStatusHandler,
    //   ),
    // )
    // dispatch(listProductAction(setModalTypeHandler, setLoaderStatusHandler)),
    // dispatch(listCustomerAction(setModalTypeHandler, setLoaderStatusHandler)),
    // dispatch(getAppConfigDataAction()),
    //dispatch(listUserCreationAction(setModalTypeHandler, setLoaderStatusHandler)),
    //!chartOfAccounts.length && dispatch(listChartOfAccountsAction())
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    // Dispatch1();
    tempinitsform.current();
  }, []);
  useEffect(() => {
    Dispatch1();
  }, [headerLocationId]);

  const getAppConfigData = () => {
    const companyName = app_config_data.filter((f) => f.key_name == 'company.name');
    const fullAddress = app_config_data.filter(
      (f) => f.key_name == 'address.fulladdress',
    );
    const emailData = app_config_data.filter((f) => f.key_name == 'company.email');
    const gstinData = app_config_data.filter(
      (f) => f.key_name == 'company.gstin/uin',
    );
    const companyMobile = app_config_data.filter(
      (f) => f.key_name == 'company.mobile',
    );
    const state = app_config_data.filter((f) => f.key_name == 'address.state');

    setAppConfigData({
      companyName: companyName.length > 0 ? companyName[0].value : '',
      companyAddress: fullAddress.length > 0 ? fullAddress[0].value : '',
      companyEmail: emailData.length > 0 ? emailData[0].value : '',
      gstin: gstinData.length > 0 ? gstinData[0].value : '',
      companyMobile: companyMobile.length > 0 ? companyMobile[0].value : '',
      state: state.length > 0 ? state[0].value : '',
    });
  };
  // useEffect(() =>{
  //   getAppConfigData()
  // },[app_config_data])

  // const initsformVal = () => {
  //   getAppConfigData();
  // };
  // tempinitsformVal.current = initsformVal;
  // useEffect(() => {
  //   tempinitsformVal.current();
  // }, [app_config_data]);

  const setpaymentOpen = (data) => {
    setPaymentOpen(data);
    setTdata([]);
    const body = {
      pageCount: page,
      numPerPage: size,
      searchString: searchVal,
      key: activeChip,
      order: activeChip === "Customers" ? sortConfigParent.order || "desc" : sortConfig.order || "desc",
      val: activeChip === "Customers" ? sortConfigParent.key || "" : sortConfig.key || "",
      pageType : pageType
    }
    dispatch(
      listSalesOutstandingAction(
        body,
        commoncookie,
        headerLocationId,
        setModalTypeHandler,
        setLoaderStatusHandler
      )
    )
    dispatch(
      consolidatedReceivings(
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    )
  };

  const notifyFunction = (resData) => {
    // const cookies = new Cookies();
    let storage = getsessionStorage()
    let emp_id = storage?.employee_id || '';
    dispatch(
      getLoginRoleAction(emp_id, (role_name, token, content) => {
        if (!roleType.includes(role_name)) {
          let notify_type = notificationType('sales payment');
          let notify_content = content?.filter(
            (m) => m.notification_type === notify_type,
          );
          let paymentData = resData.data.find(
            (m) => m.sale_id === recData[0]?.sale_id,
          );
          if (notify_content.length) {
            let paymentRefid = paymentData?.customer_id || resData?.customer_id;
            let customerName = paymentData?.companyName || resData?.companyName;
            let amount_value = paymentData?.received_amount || resData?.received_amount;
            let locationName = paymentData?.location_name || resData?.location_name;
            let content_body = `${customerName} \n₹${amount_value} \n${locationName} \n${paymentRefid}`;
            sendNtfy(token, notify_content[0]?.title, content_body);
            dispatch(CreateNotificationAction({ content_body: content_body, title: notify_content[0]?.title, time: getDateTimeFormat(new Date()), "active": "1" }))
          }
        }
      }),
    );
  };

  const handleMailConfiguration = async () => {
    const roleIdData = createUser.filter(f => f.employee_id === commoncookie)
    if (roleIdData.length > 0) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        await dispatch(getByIdMailConfigurationAction('Sale Order', roleIdData[0]?.role_id))
      );
    }
  }

  const ledgerApi = (salesData) => {
    // let ledgerData =  salesData.map(sD => {
    //   const { received_amount, sales_payment } = sD
    //            })
    const data = {
      // "code": "234",
      // "entity": "324",
      location_id: headerLocationId,
      specialNumber: '324',
      note: 'Sales Payment',
      referenceNumber: salesData[0]?.sales_payment,
      voucherTypeId: 1,
    };
    const accountTransaction = [];
    salesData.map(sD => {
      const { received_amount, sales_payment } = sD
      chartOfAccounts.forEach((d) => {
        const { id, creditSign, debitSign } = d;
        const dd = { accountId: id, description: "salesPayment Entry" };
        if (sales_payment.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id).length) {
          let Recevable = sales_payment.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id)?.[0] || {}

          dd.amount = debitSign * Recevable?.payment_amount || 0
          accountTransaction.push(dd);
        } else if (sales_payment.filter(f => f.ledger_id === id).length) {
          let Recevable = sales_payment.filter(f => f.ledger_id === id)?.[0] || {}
          dd.amount = creditSign * Recevable?.payment_amount || 0
          accountTransaction.push(dd);
        }
      });
    })
    data.accountTransaction = accountTransaction;
    dispatch(createTransactionAction(data, true, setLoaderStatusHandler))
  };
  const paymentValidate = (type, receiptDate) => {
    setDisableSubmit(true)
    if (type == 'advance') setIsAddingAdvance(true)
    const hasExcessPayment = Tdata.some((item) => item.payment_amount > item.due);
    let receivedAmount =
      Tdata.reduce(function (acc, obj) {
        return acc + +obj.payment_amount;
      }, 0);

    receivedAmount = manualNoteSchemes.filter(i => i.selected).reduce((a, c) => a + +c.new_adjusted_amount, receivedAmount)

    const creditNotePayables = selectionModel
      .filter(item => ['Credit Note', 'Unused Credit'].includes(item.type) && item.payable)
      .reduce((sum, note) => sum + parseFloat(note.payable || 0), 0);

    let indiviTotal = receivedAmount;
    const invoiceSelections = selectionModel.filter(item => !['Credit Note', 'Unused Credit'].includes(item.type));
    const receivablesArray = Array.isArray(invoiceSelections) ? invoiceSelections : [invoiceSelections];
    const receivables = receivablesArray.map((acc, d) => {

      const newObj = {};
      const sub = indiviTotal - (+acc?.originalRow?.total - +acc?.originalRow?.paid_amount);
      const totalPaymentAmount = Tdata.reduce((sum, item) => sum + item.payment_amount, 0);

      //  if (hasExcessPayment && !isAddingAdvance && selectionModel.length > 0) {
      //     console.log("cerverergegerff");

      //     setOpenExcessPaymentDialog(true);
      //     return acc;
      //   }

      if (Math.sign(sub) === 1 || Math.sign(sub) === 0) {

        newObj.received_amount = +acc?.originalRow?.paid_amount + totalPaymentAmount + creditNotePayables;
        newObj.saleType = acc?.originalRow?.saleType;
        newObj.receivable_amount = acc?.originalRow?.due_amount;
        newObj.paymentAmount = acc?.paymentAmount;

        newObj.sales_payment = [
          {
            ...Tdata[0],
            payment_amount: Number(d?.paymentAmount ?? 0),
            ...(!Tdata.length && {
              employee_id: commoncookie,
              payment_type: 'Credit Note',
              reference_code: '',
              cash_refund: 0
            }),
            ...(addAdvanceAmount.current && {
              change: [],
              cash_adjustment: 0
            })
          },
        ];

        !Tdata.length && newObj.sales_payment.push({
          employee_id: commoncookie,
          payment_type: 'Credit Note',
          reference_code: '',
          cash_refund: 0
        });

        indiviTotal = sub;
      } else {

        newObj.received_amount = +acc?.originalRow?.paid_amount + indiviTotal + creditNotePayables;
        newObj.saleType = acc?.originalRow?.saleType;
        newObj.receivable_amount = acc?.originalRow?.due_amount;
        newObj.paymentAmount = acc?.paymentAmount;

        newObj.sales_payment = [
          {
            ...Tdata[0],
            payment_amount: Number(d?.paymentAmount ?? 0),
            ...(!Tdata.length && {
              employee_id: commoncookie,
              payment_type: 'Credit Note',
              reference_code: '',
              cash_refund: 0
            }),
            ...(addAdvanceAmount.current && {
              change: [],
              cash_adjustment: 0
            })
          },
        ];

        !Tdata.length && newObj.sales_payment.push({
          employee_id: commoncookie,
          payment_type: 'Credit Note',
          reference_code: '',
          cash_refund: 0
        });

        indiviTotal = 0;
      }
      newObj.sale_id = acc?.originalRow?.id;
      newObj.location_id = headerLocationId !== 'null' ? headerLocationId : acc?.originalRow?.location_id;

      return newObj;
    });

    let calculatedAdvanceAmount = 0;
    const totalDue = selectionModel.reduce((sum, row) => {
      return sum + Number(row?.originalRow?.due_amount ?? 0);
    }, 0);
    const total_paid_amount = Tdata.reduce((sum, row) => {
      return sum + Number(row?.payment_amount ?? 0);
    }, 0);

    const updatedTdata = Tdata.map((item) => {
      
      if (item.payment_amount > totalDue) {        
        calculatedAdvanceAmount += item.payment_amount - totalDue;
        return { ...item };
      }
      return item;
    });
    calculatedAdvanceAmount = total_paid_amount - totalDue

    // const saleUpdate = receivables.map((r) => ({
    //   ...r,
    //   received_amount:
    //     hasExcessPayment && type === 'advance'
    //       ? +r.received_amount - calculatedAdvanceAmount
    //       : +r.received_amount,
    //   // paid_amount: total_paid_amount
    // }));
    let remainingPaidAmount = total_paid_amount;

    const sortedReceivables = [...receivables].sort(
      (a, b) => Number(a.receivable_amount ?? 0) - Number(b.receivable_amount ?? 0)
    );

const saleUpdate = sortedReceivables.map((r) => {
  const receivable = Number(r.receivable_amount ?? 0);
  const paymentAmount = Number(r.paymentAmount ?? 0);
  let receivedAmount = 0;

  // if (total_paid_amount >= totalDue) {

  //   receivedAmount = paymentAmount;
  // } else if (remainingPaidAmount > 0) {
  //   if (remainingPaidAmount >= paymentAmount) {
  //     receivedAmount = paymentAmount;
  //     remainingPaidAmount -= paymentAmount;
  //   } else {
  //     receivedAmount = remainingPaidAmount;
  //     remainingPaidAmount = 0;
  //   }
  // }

  if(total_paid_amount <= paymentAmount){
    receivedAmount = paymentAmount
  }
  else{
    if(remainingPaidAmount > 0 && remainingPaidAmount >= paymentAmount){
      receivedAmount = paymentAmount
      remainingPaidAmount -=  paymentAmount
    }
    else{
      receivedAmount = remainingPaidAmount
      remainingPaidAmount = 0
    }
  }

  return {
    ...r,
    received_amount: receivedAmount,sales_payment: [{
      ...r.sales_payment[0],
      due: r.receivable_amount,
      payment_amount: receivedAmount
    }]
  };
});

    const data = {
      saleUpdate,
      updateCreditNote: {
        manualNoteSchemes: manualNoteSchemes.filter(i => i.selected && i.advance_id === undefined),
        advanceledger: manualNoteSchemes.filter(i => i.selected && i.advance_id !== undefined),
        customer_id: getCustomer.customer_id,
        customer_ledger_id: getCustomer.ledger_id,
        company_name: getCustomer.company_name || `${getCustomer.first_name} ${getCustomer.last_name}`
      },
      userConfig: { user_id: commoncookie, location_id: headerLocationId },
      receiptDataEntry: {
        sale_id: selectionModel[0]?.id, // Use the id from the first receivable
        customer_id: getCustomer.customer_id,
        payment_amount: Tdata.length > 0
          ? hasExcessPayment && type == 'advance'
            ? +Tdata.reduce((sum, item) => sum + item.payment_amount, 0) - calculatedAdvanceAmount
            : +Tdata.reduce((sum, item) => sum + item.payment_amount, 0)
          : saleUpdate.reduce((sum, item) => sum + (item.received_amount || 0), 0),
          receiptDate: receiptDate
      },
      location_id: headerLocationId,
      specialNumber: receivables.map((d) => d.sale_id).join(','),
      note: 'Sales Payment',
      referenceNumber: addAdvanceAmount.current
        ? updatedTdata
          .filter((i) => 'paymentLedgerId' in i && 'ledger_id' in i)
          .map((i) => ({
            ...i,
            change: [],
            cash_adjustment: 0,
            due: +i?.due,
            payment_amount: +i?.payment_amount,
          }))
        : updatedTdata
          .filter((i) => 'paymentLedgerId' in i && 'ledger_id' in i)
          .map((i) => ({ ...i, due: +i?.due, payment_amount: +i?.payment_amount })),
      voucherTypeId: 1,
      addAdvanceAmount: addAdvanceAmount.current ? { ...addAdvanceAmount.current, location_id: headerLocationId } : null,
      advanceAmount: calculatedAdvanceAmount > 0 ? calculatedAdvanceAmount : 0,
    };

    // const accountTransaction = [];
    // receivables.map(sD => {
    //   const { received_amount, sales_payment } = sD
    //   chartOfAccounts.forEach((d) => {
    //     const { id, creditSign, debitSign } = d;
    //     const dd = { accountId: id, description: "salesPayment Entry" };
    //     if (sales_payment.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id).length) {
    //       let Recevable = sales_payment.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id)?.[0] || {}

    //       dd.amount = debitSign * Recevable?.payment_amount || 0
    //       accountTransaction.push(dd);
    //     } else if (sales_payment.filter(f => f.ledger_id === id).length) {
    //       let Recevable = sales_payment.filter(f => f.ledger_id === id)?.[0] || {}
    //       dd.amount = creditSign * Recevable?.payment_amount || 0
    //       accountTransaction.push(dd);
    //     }
    //   });
    // })
    // data.accountTransaction = accountTransaction;
    setReceData(receivables);
    addAdvanceAmount.current = null

    // if (hasExcessPayment && !isAddingAdvance) {
    //     return;
    //   }

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        receiptEntry(
          data,
          () => { },
          setModalTypeHandler,
          setLoaderStatusHandler,
          (response, resdata) => {
            const body = {
              pageCount: page,
              numPerPage: size,
              searchString: searchVal,
              key: activeChip,
              order: activeChip === "Customers" ? sortConfigParent.order || "desc" : sortConfig.order || "desc",
              val: activeChip === "Customers" ? sortConfigParent.key || "" : sortConfig.key || ""
            }
            if (response === 200) {
              setDisableSubmit(false)
              //  setResdata(resdata)
              setpaymentOpen(false);
              setTdata([]);
              setSelectionModel([]);
              addAdvanceAmount.current = null
              dispatch(
                consolidatedReceivings(
                  setModalTypeHandler,
                  setLoaderStatusHandler,
                ),
              );
              notifyFunction(resdata.data);
              //ledgerApi(data.saleUpdate);
              dispatch(
                listSalesOutstandingAction(
                  body,
                  commoncookie,
                  headerLocationId,
                  setModalTypeHandler,
                  setLoaderStatusHandler
                )
              );
            }
          },
        ),
      )
    );

    if (getApprovalRights?.rights === false && salesApprovals?.length > 0) {
      const payload = {
        id: salesApprovals[0].id,
        type: 'paymentStatus'
      }

      dispatch(createSalesApproval(payload))
    }
    // this.setState({paymentOpen: false, Tdata: []})
    setIsAddingAdvance(false)
  };


  let receivedAmount =
    Tdata.reduce(function (acc, obj) {
      return acc + +obj.payment_amount;
    }, 0);

  receivedAmount = manualNoteSchemes.filter(i => i.selected).reduce((a, c) => a + +c.new_adjusted_amount, receivedAmount)

  let indiviTotal = receivedAmount;
  const receivables = selectionModel.map((d) => {
    const newObj = {};
    const sub = indiviTotal - (+d.total - +d.paid_amount);


    if (Math.sign(sub) === 1 || Math.sign(sub) === 0) {
      newObj.received_amount = +d.total;
      newObj.saleType = d.saleType;
      newObj.sales_payment = Tdata.filter((i) => 'paymentLedgerId' in i && 'ledger_id' in i).map((payment) => ({
        ...payment,
        payment_amount: +payment.total - +payment.paid_amount,
        ...(addAdvanceAmount.current && {
          change: [],
          cash_adjustment: 0
        })
      }));

      !Tdata.length && newObj.sales_payment.push({
        employee_id: commoncookie,
        payment_type: 'Credit Note',
        reference_code: '',
        cash_refund: 0
      });

      indiviTotal = sub;
    } else {
      newObj.received_amount = +d.paid_amount + indiviTotal;
      newObj.saleType = d.saleType;
      newObj.sales_payment = Tdata.filter((i) => 'paymentLedgerId' in i && 'ledger_id' in i).map((payment) => ({
        ...payment,
        // payment_amount: +d.total - +d.paid_amount,
        payment_amount: (Number(d.total) || 0) - (Number(d.paid_amount) || 0),
        ...(addAdvanceAmount.current && {
          change: [],
          cash_adjustment: 0
        })
      }));

      !Tdata.length && newObj.sales_payment.push({
        employee_id: commoncookie,
        payment_type: 'Credit Note',
        reference_code: '',
        cash_refund: 0
      });

      indiviTotal = 0;
    }
    newObj.sale_id = d.id;
    newObj.location_id = headerLocationId !== 'null' ? headerLocationId : d.location_id;

    return newObj;
  });

  const getSalesDetails = async (id) => {
  if (id && typeof id !== 'undefined') {
   const salesResponse = await new Promise((resolve) => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        salesGetById(id, (response) => {
          resolve(response);
        })
      )
    );
  });
    return salesResponse?.length ? salesResponse[0] : {};
  } else {
    return {};
  }
};

  // const getSalesDetails = (id) => {
    
  //   if (id !== '' && typeof id !== 'undefined') {
  //     let salesDetail = sales.filter((s) => s.sale_id === id);
  //     return salesDetail.length > 0 ? salesDetail[0] : {};
  //   } else {
  //     return {};
  //   }
  // };

  const getAllSalesDetails = async (customerId) => {
    try {

	    const { data: customerData, loading, error } = await customFetch(
                API_URLS.GET_CUSTOMER_PENDING_PAYMENT(customerId, headerLocationId),
                'GET',
                {}
            );
  

      const datas = customerData || [];

      if (datas.length > 0) {
        dispatch(
          saleIdGET(
            customerId,
            setModalTypeHandler,
            setLoaderStatusHandler,
            (response) => {
              if (response.length) {
                pendingPaymentChild(response[0], datas[0]?.childRow);
              } else {
                dispatch(
                  getbyidCustomerAction(customerId, (response) => {
                    if (pageType !== 'SALES') {
                      setGetCustomer(response);
                    }
                  })
                );
              }
            }
          )
        );
      }
    } catch (error) {
      console.error("Error in getAllSalesDetails:", error);
    }
  };


  const handleProceedWithAdvance = () => {
    setIsAddingAdvance(true);
    setOpenExcessPaymentDialog(false);
    paymentValidate();
  };

  const handleDoNotAddAdvance = () => {
    setIsAddingAdvance(false);
    setOpenExcessPaymentDialog(false);
  };

  const handleCloseExcessPaymentDialog = () => {
    setOpenExcessPaymentDialog(false);
  };

  const pendingPayment = async(data, childRow) => {
    // console.log("data, childRow",childRow[0]?.customer_id)
    if (headerLocationId === 'null') {
      setOpenAlert(true)
      return
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      !product?.length && (await dispatch(listProductAction(setModalTypeHandler, setLoaderStatusHandler))),
    );

    // console.log(data, childRow.length, "length")
    if (childRow.length > 0 && childRow[0]?.saleType !== undefined && childRow[0]?.saleType == 'Outstanding Invoice') {
      // console.log("AAA1")
      // const {
      //   customer_id ,
      //   sales_items: [],
      //   received_amount,
      //   sale_id,
      // } = childRow;

      const sales_items = []
      let payData = [];
      childRow.map((c) => {
        return payData.push({
          id: c.sale_id,
          po_number: c.invoice_number,
          paid_amount: c.received_amount,
          total: c.total,
          location_id: headerLocationId === 'null' ? c.location_id : headerLocationId,
          ledger_id: c.ledger_id,
          saleType: c.saleType,
          customer_id:c.customer_id
        });
      });

      // console.log(payData, "payData1")

      dispatch(getbyidCustomerAction(childRow[0]?.customer_id, (response) => {
        setGetCustomer(response);
        // console.log(response, "oo1")


        dispatch(getManualNoteSchemesByIdAction('customer', childRow[0]?.customer_id, (response) => {
          setManualNoteSchemes(response.map(i => ({ ...i, selected: false })));

          setgetPay(payData);
          setReceived_amount(received_amount);
          setSalesItems([]);
          setPaymentOpen(true);

        }))

      }))
    } else {
      // console.log("AAA2")
      // console.log('customeridd', data, childRow)
      const {
        customer_id,
        sales_items: old_sales,
        received_amount,
        sale_id,
      } = data;
      // console.log("customer_id",customer_id)

      const sales_items = old_sales || [].map((d) => {
        const taxes =
          product.filter((t) => t.item_id === d.item_id)[0].taxes || [];
        d.taxes = taxes;
        return d;
      });
      let payData = [];
      childRow.map((c) => {
        return payData.push({
          id: c.sale_id,
          po_number: c.invoice_number,
          paid_amount: c.received_amount,
          total: c.total,
          location_id: headerLocationId === 'null' ? c.location_id : headerLocationId,
          ledger_id: c.ledger_id,
          invoice_date: c.invoice_date,
          due_date: c.due_date,
          saleType: c.saleType,
          customer_id:c.customer_id
        });
      });
       dispatch(getbyidCustomerAction(customer_id, async(response) => {
        setGetCustomer(response);

       dispatch(getManualNoteSchemesByIdAction('customer', customer_id, (response) => {
          setManualNoteSchemes(response.map(i => ({ ...i, selected: false })));

          setgetPay(payData);
          setReceived_amount(received_amount);
          setSalesItems(sales_items);
          setPaymentOpen(true);

        }))

      }))

    }



    // this.setState({ sales_items, getCustomer, paymentOpen: true, received_amount: +received_amount, sale_id })
  };

  const pendingPaymentChild = async (id, invoiceData) => {
    const data =  await getSalesDetails(id);
                                                           
    
    if (headerLocationId === 'null') {
      setOpenAlert(true);
      return;
    }

    if (!invoiceData || invoiceData.length === 0) {
      return;
    }

    const selectedInvoice = invoiceData[0];
     const { data: customerPendingPaymentData} = await customFetch(
                API_URLS.GET_CUSTOMER_PENDING_PAYMENT(data.customer_id, headerLocationId),
                'GET',
                {}
            );
    //  console.log(customerPendingPaymentData[0]?.childRow,"customerPendingPaymentData");

    // let payData = invoiceData.map((invoice) => ({
    //   id: invoice.sale_id,
    //   po_number: invoice.invoice_number,
    //   paid_amount: invoice.received_amount,
    //   total: invoice.total,
    //   location_id: headerLocationId !== 'null' ? headerLocationId : invoice.location_id,
    //   ledger_id: invoice.ledger_id,
    //   saleType: invoice.saleType,
    // }));
    const targetSaleId = data.sale_id;
    const updatedChildRow = customerPendingPaymentData[0]?.childRow?.map(row => ({
      ...row,
      id: row.sale_id,
      po_number: row.invoice_number,
      paid_amount: row.received_amount
    }))?.sort((a, b) => (a.sale_id === targetSaleId ? -1 : b.sale_id === targetSaleId ? 1 : 0));
    customerPendingPaymentData[0].childRow = updatedChildRow;

    if (selectedInvoice.saleType === 'Outstanding Invoice') {

      dispatch(getbyidCustomerAction(selectedInvoice.customer_id, (response) => {
        setGetCustomer(response);

        dispatch(getManualNoteSchemesByIdAction('customer', selectedInvoice.customer_id, (response) => {
          setManualNoteSchemes(response.map(i => ({ ...i, selected: false })));

          setclickedInvoice(data.sale_id)
          setgetPay(customerPendingPaymentData[0].childRow);
          setReceived_amount(received_amount);
          setSalesItems([]);
          setPaymentOpen(true);
        }));
      }));
    } else {
      const { customer_id, sales_items: old_sales = [], received_amount } = data;

      const sales_items = old_sales.map((d) => ({
        ...d,
        taxes: product.find((t) => t.item_id === d.item_id)?.taxes || [],
      }));

      dispatch(getbyidCustomerAction(customer_id, (response) => {
        setGetCustomer(response);

        dispatch(getManualNoteSchemesByIdAction('customer', customer_id, (response) => {
          setManualNoteSchemes(response.map(i => ({ ...i, selected: false })));

          setclickedInvoice(data.sale_id)
          setgetPay(customerPendingPaymentData[0].childRow);
          setReceived_amount(received_amount);
          setSalesItems(sales_items);
          setPaymentOpen(true);
        }));
      }));
    }
  };


const invoiceFunction = async (data) => {
  const custData = await customer.filter(
    (d) => data.customer_id === d.customer_id,
  );

  let sales_items;

  const salesResponse = await new Promise((resolve) => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        salesGetById(data.sale_id, (response) => {
          resolve(response);
        })
      )
    );
  });
  const type = 'sales'
  const poptype = 'invoice'
  const { data: invoice } = await customFetch(
    API_URLS.GET_SALES_INVOICE_DETAILS(data.sale_id, type, poptype),
    'POST'
  );	
  
  dispatch(setInvoiceTempAction(invoice))

  if (salesResponse.length) {
    sales_items = salesResponse[0]?.sales_items?.map((d) => {
      const taxes =
        product?.filter((t) => t.item_id === d.item_id)[0]?.taxes || [];
      d.taxes = taxes;
      return d;
    });
  }

  if (!app_config_data_based_on_type?.length) {
     let type='sales'
     await dispatch(getAppConfigDataBasedOnTypeAction(type));
  }

  await getAppConfigData()


  await setPopupData({
    invoice: data.invoice_number,
    custData: custData[0] || null,
    soDate: data.sale_time || null,
    sales_items: sales_items,
    Dopen: true,
    customer_id: data.customer_id,
    sale_id: data.sale_id,
    note: data.note || "",
    sales_payments: data.sales_payments || [],
  });
};

  // const invoiceFunction = async (data) => {
  //   const custData = await customer.filter(
  //     (d) => data.customer_id === d.customer_id,
  //   );
  //   let sales_items;
  //   console.log('data.sale_id', data.sale_id)
  //   apiCalls(
  //    setModalTypeHandler,
  //     setLoaderStatusHandler,
      
  //     dispatch(
  //       salesGetById(data.sale_id, (response) => {
  //         console.log('responseeee', response, salesgetbyid)
  //         if (response.length) {
  //           sales_items = response[0]?.sales_items?.map((d) => {
  //             const taxes =
  //               product?.filter((t) => t.item_id === d.item_id)[0]?.taxes || [];
  //             d.taxes = taxes;
  //             return d;
  //           });
  //         }
  //       })
  //     )
  //   )
  //   // const sales_items = await sales?.filter((f) => f.sale_id === data.sale_id)[0]?.sales_items?.map((d) => {
  //   //   const taxes =
  //   //     product?.filter((t) => t.item_id === d.item_id)[0]?.taxes || [];
  //   //   d.taxes = taxes;
  //   //   return d;
  //   // });
  //   await setPopupData({
  //     invoice: data.invoice_number,
  //     custData: custData[0] || null,
  //     soDate: data.sale_time || null,
  //     sales_items: sales_items,
  //     Dopen: true,
  //     customer_id: data.customer_id,
  //     sale_id: data.sale_id,
  //     note: data.note || "",
  //     sales_payments: data.sales_payments || [],
  //   });
  // };
  const createMail = async() => {

    if (!app_config_data?.length) {
     await dispatch(getAppConfigDataAction());
     }

    const data = {
      custData: popUpdata.custData,
      invoice_number: popUpdata.invoice,
      sales_items: popUpdata.sales_items,
      email: popUpdata.custData.email,
      appConfigData: app_config_data,
    };
    dispatch(
      sendMail(data, () => { }, setModalTypeHandler, setLoaderStatusHandler),
    );
    setPopupData({ ...popUpdata, Dopen: false });
  };


  const cancelSearch = (e) => {
    setSearchVal('')
    setSearchData([])
    setPage(0); // Reset page to the first page

    const body = {
      //  searchString: ""
      //  rowsPerPage: size,
      //  pageNum: page,
      //  employeeId:commoncookie,
      //  headerLocationId:headerLocationId
      pageCount: 0, // Reset to the first page
      numPerPage: size,
      searchString: ' ',
      key: activeChip,
      order: activeChip === "Customers" ? sortConfigParent.order || "desc" : sortConfig.order || "desc",
      val: activeChip === "Customers" ? sortConfigParent.key || "" : sortConfig.key || "",
      pageType :  pageType
    };
    dispatch(
      listSalesOutstandingAction(
        body,
        commoncookie,
        headerLocationId,
        setModalTypeHandler,
        setLoaderStatusHandler
      )
    );

    // apiCalls(
    //   setModalTypeHandler,
    //   setLoaderStatusHandler,
    //   dispatch(
    //     listSalesOutstandingAction(
    //       body,
    //       commoncookie,
    //       headerLocationId,
    //       setModalTypeHandler,
    //       setLoaderStatusHandler,
    //     ),
    //   ),
    // )

  }

  const requestSearch = (e) => {
    let val = e.target.value;
    setSearchVal(val)
    setPage(0)


    const body = {
      key : activeChip,
      searchString: val.toLowerCase(),
      numPerPage: size,
      pageCount: 0,
      employeeId: commoncookie,
      headerLocationId: headerLocationId,
      val :activeChip === "Customers"
        ? sortConfigParent.key || ""
        : sortConfig.key || "",
        pageType : pageType
    }

    if(val.length >= 3 || val.length === 0) {
      dispatch(set_searchReceivableAction({ data: [], numRows: 0 }))
    }

    dispatch(searchReceivableAction(
      body,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ));

    // dispatch(
    //   listSalesOutstandingAction(
    //     body,
    //     commoncookie,
    //     headerLocationId,
    //     setModalTypeHandler,
    //     setLoaderStatusHandler
    //   )
    // );

  }

  const handleOpeningBalPayment = (data) => {
    if (headerLocationId === 'null') {
      setOpenAlert(true)
      return
    }
    setOpeningBalData(data)
    setOpeningBalPaymentOpen(true)
  }

  let handleRowData = (data) => {
    setRowData(data)
  }

  const handleReminder = () => {
    setReminder(true)
  }

  const handleClose = () => {
    setReminder(false)
  }

  const handleSyncBillsReceivables = async () => {
    try {
      if (headerLocationId !== "null") {
        // console.log("PPPPP")
        setLoading(true);
        setHandleAlert(true)

        const dataPayload = {
          locationId: headerLocationId,
        };


        const response = await dispatch(
          billReceivablesAction(
            dataPayload,
            setModalTypeHandler,
            setLoaderStatusHandler,
          )
        );

        const unmatchedRecords = response?.unmatchedRecords;
        const insertedData = response?.insertedData;

        if (unmatchedRecords && unmatchedRecords.length > 0) {
          setUnmatchedRecords(unmatchedRecords);
          setOpenDialog(true);
        } else {
          setOpenDialog(true);
          console.error('No unmatched records found or error occurred');
        }

        setInsertedData(insertedData || []);

        dispatch(lastSyncAction(setModalTypeHandler, setLoaderStatusHandler, exportDataCallBack));

        const body = {
          pageCount: 0,
          numPerPage: 2,
          searchString: searchVal,
          key: activeChip,
          order: activeChip === "Customers" ? sortConfigParent.order || "desc" : sortConfig.order || "desc",
          val: activeChip === "Customers" ? sortConfigParent.key || "" : sortConfig.key || "",
          pageType : pageType
        };

        dispatch(
          listSalesOutstandingAction(
            body,
            commoncookie,
            headerLocationId,
            setModalTypeHandler,
            setLoaderStatusHandler
          )
        );

      } else {
        setAlertMessage("Please Select a Company");
        setOpenAlert(true);
        // console.log("KKKKKK")
      }

    } catch (error) {
      let message = "An unexpected error occurred. Please try again.";

      if (error.response) {
        if (error.response.status === 504) {
          message = "The request to the Tally server timed out. Please try again later.";
        } else {
          message = error.response.data?.message || `Error: ${error.response.status}`;
        }
      }
      console.error("Error syncing bills receivables:", message);

      setErrorMessage(message);
      setOpenError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (receivables_lastSync !== 'No Records') {
      setActiveChip("Value");
      setSelectedChip({ ...initialState, Value: true, Customers: false });
    }
  }, [receivables_lastSync]);


  const handleCloseAlert = () => {
    setOpenAlertMsg(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setLoading(false);
    setHandleAlert(false)
    setUnmatchedRecords([]);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const fetchUnmatchedRecords = async () => {
    try {
      setLoading(true);

      const exportDataCallBack = (data) => {
        if (data && data.data.unmatchedData) {
          setUnmatchedRecords(data.data.unmatchedData);
          handleOpenDialog();
          setInsertedData([]);
        }
      };

      await dispatch(getUnmatchedRecordsAction(() => { }, () => { }, exportDataCallBack));
    } catch (error) {
      console.error("Error fetching unmatched records:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return { date: 'Not Synchronization', time: '' };

    const dateObj = new Date(dateTimeString);

    const date = dateObj.toLocaleDateString('en-GB');

    const time = dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return { date, time };
  };

  const { date, time } = formatDateTime(receivables_lastSync);



  const handleChipClick = (chip) => {
    setPage(0);
    setTotalDue(null);
    selectChip(chip);
  };

  const today = new Date();

  // const sortedData = invoiceData.length > 0 
  // ? [...invoiceData]
  //     .filter((row) => {
  //       const invoiceDateParts = row.invoice_date.split("/");
  //       const invoiceDate = new Date(invoiceDateParts[2], invoiceDateParts[1] - 1, invoiceDateParts[0]); 

  //       const fifteenDaysAgo = new Date(today);
  //       fifteenDaysAgo.setDate(today.getDate() - 15);

  //       const sixteenDaysAgo = new Date(today);
  //       sixteenDaysAgo.setDate(today.getDate() - 16);

  //       const thirtyDaysAgo = new Date(today);
  //       thirtyDaysAgo.setDate(today.getDate() - 30);

  //       const thirtyOneDaysAgo = new Date(today);
  //       thirtyOneDaysAgo.setDate(today.getDate() - 31);

  //       const fortyFiveDaysAgo = new Date(today);
  //       fortyFiveDaysAgo.setDate(today.getDate() - 45);

  //       const fortySixDaysAgo = new Date(today);
  //       fortySixDaysAgo.setDate(today.getDate() - 46);

  //       const sixtyDaysAgo = new Date(today);
  //       sixtyDaysAgo.setDate(today.getDate() - 60);

  //       if (selectedChip["1-15 Days"]) {
  //         return invoiceDate >= fifteenDaysAgo && invoiceDate <= today;
  //       }
  //       if (selectedChip["16-30 Days"]) {
  //         return invoiceDate >= thirtyDaysAgo && invoiceDate < sixteenDaysAgo;
  //       }
  //       if (selectedChip["31-45 Days"]) {
  //         return invoiceDate >= fortyFiveDaysAgo && invoiceDate < thirtyOneDaysAgo;
  //       }
  //       if (selectedChip["46-60 Days"]) {
  //         return invoiceDate >= sixtyDaysAgo && invoiceDate < fortySixDaysAgo;
  //       }
  //       if (selectedChip["> 61 Days"]) {
  //         return invoiceDate < sixtyDaysAgo;
  //       }

  //       return true; // If no filter selected, return all records
  //     })
  //     .sort((a, b) => {
  //       if (selectedChip["Value"]) {
  //         return b.total - a.total; 
  //       }
  //       return new Date(b.invoice_date) - new Date(a.invoice_date);
  //     })
  //   : [];


  // const sortedDataByColumn = [...sale_outstanding]?.sort((a, b) => {
  //   if (!sortConfig.key) return 0;

  //   let aValue = a[sortConfig.key];
  //   let bValue = b[sortConfig.key];

  //   const isDateColumn = ["invoice_date", "due_date"].includes(sortConfig.key);
  //   if (isDateColumn) {
  //     const convertDate = (dateStr) => {
  //       if (!dateStr) return new Date(0);
  //       const [day, month, year] = dateStr.split("-");  // Updated for "DD-MM-YYYY" format
  //       return new Date(`${year}-${month}-${day}`);
  //     };
  //     aValue = convertDate(aValue);
  //     bValue = convertDate(bValue);
  //   }

  //   return sortConfig.order === "asc"
  //     ? aValue > bValue
  //       ? 1
  //       : -1
  //     : aValue < bValue
  //       ? 1
  //       : -1;
  // });



  //   const sortedDataParent = [...sale_outstanding, ...openingBalanceLedgers]
  // .filter(
  //   (value, index, self) =>
  //     index === self.findIndex((t) => t.ledger_id === value.ledger_id)
  // )
  // .sort((a, b) => {
  //   if (a[sortConfigParent.key] < b[sortConfigParent.key]) {
  //     return sortConfigParent.order === "asc" ? -1 : 1;
  //   }
  //   if (a[sortConfigParent.key] > b[sortConfigParent.key]) {
  //     return sortConfigParent.order === "asc" ? 1 : -1;
  //   }
  //   return 0;
  // });

  const handleCustomerDetail = (rowData) => {
    // this.setState({
    //   setData : rowData,
    //   onrowclick :true
    // });
    setData(rowData)
    setOnrowclick(true)

  }

  const rowPopupClose1 = () => {
    setOnrowclick(false)
  }

  const [rowsWithSalesDetails, setRowsWithSalesDetails] = useState([]);
  useEffect(() => {
  const fetchSalesDetailsForRows = async () => {
     const outstanding = Array.isArray(sale_outstanding) ? sale_outstanding : [];
    const opening = Array.isArray(openingBalanceLedgers) ? openingBalanceLedgers : [];
    
      const combinedRows = [...outstanding];

    const uniqueRows = combinedRows.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.ledger_id === value.ledger_id)
    );

    // const resolvedRows = await Promise.all(
    //   uniqueRows.map(async (row) => {
    //     const salesDetails = row.sale_id
    //       ? await getSalesDetails(row.sale_id)
    //       : null;
    //     return {
    //       ...row,
    //       salesDetails,
    //     };
    //   })
    // );

    setRowsWithSalesDetails(uniqueRows);
  };

  fetchSalesDetailsForRows();
}, [sale_outstanding]);

const prepareExportData = (data, pageType) => {
  const rows = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : [];

  if (!rows.length) {
    console.warn("No valid rows to export:", data);
    return [];
  }
  const parseDate = (date) => {
    const parsed = moment(date, ['DD/MM/YYYY', 'YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss'], true);
    return parsed.isValid() ? parsed.format('DD/MM/YYYY') : '';
  };
  const mapped = rows.map((row, i) => {
    try {
      return {
        "Customer Name": row.companyName ?? row.customerName,
        "Invoice Date": parseDate(row.invoice_date),
        "Invoice Number": row.invoice_number || "",
        ...(pageType !== "reportPage" && {
          "Delivered Date": parseDate(row.delivered_date)
        }),
        "Invoice Amount": parseFloat(row.total || 0).toFixed(2),
        "Due Amount": parseFloat(row.due_amount || 0).toFixed(2),
        ...(pageType !== "reportPage" && {
          "Receipt":
            row.total && row.received_amount != null && row.total > row.received_amount
              ? "Pending"
              : "Paid"
        }),
        "Due Date": parseDate(row.due_date),
        "Due Days": row.credit_exceeded ?? ""
      };
    } catch (err) {
      console.error(`Error mapping row ${i}:`, err, row);
      return null;
    }
  }).filter(Boolean);

  return mapped;
};





const ExportPdf = (data, pageType) => {
  const exportData = prepareExportData(data, pageType);
  const doc = new jsPDF();

  if (!exportData.length) {
    doc.text("No data to export.", 10, 10);
    doc.save("sales_outstanding.pdf");
    return;
  }

  const headers = Object.keys(exportData[0]);
  const rows = exportData.map(row => headers.map(h => row[h]));

  doc.autoTable({
    head: [headers],
    body: rows,
    margin: { top: 20 },
  });

  doc.save("sales_outstanding.pdf");
};


const ExportCsv = (data, pageType) => {

  const exportData = prepareExportData(data, pageType);

  if (!exportData.length) {
    return;
  }

  const headers = Object.keys(exportData[0]);
  const csvRows = [
    headers.join(","), // headers
    ...exportData.map(row =>
      headers.map(k => `"${(row[k] ?? "").toString().replace(/"/g, '""')}"`).join(",")
    )
  ];

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "sales_outstanding.csv";
  link.click();
};

  const exportValue = () => {
  const data = {
    pageCount: page,
    numPerPage: "all",
    searchString: searchVal,
    pageType : pageType,
    key: activeChip,
    order:
      activeChip === "Customers"
        ? sortConfigParent.order || "desc"
        : sortConfig.order || "desc",
    val:
      activeChip === "Customers"
        ? sortConfigParent.key || ""
        : sortConfig.key || "",
    export: true,
  };
  return data
};

const handleExportPDFLocal = () => {
  const body = exportValue();
dispatch(
  listSalesOutstandingAction(
    body,
    commoncookie,
    headerLocationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
    (exportData) => {
      const combined = Array.isArray(exportData)
        ? exportData
        : Array.isArray(exportData?.data)
        ? exportData.data
        : [];    
      ExportPdf(combined, pageType);
    }
  )
).catch(err => {
  console.error("API call failed:", err);
});
};

const handleExportCSVLocal = async () => {
  const body = exportValue();

  await dispatch(
    listSalesOutstandingActionExport(
      body,
      commoncookie,
      headerLocationId,
      setModalTypeHandler,
      setLoaderStatusHandler,
      (exportData) => {
        const combined = Array.isArray(exportData?.data) ? exportData.data : [];
        ExportCsv(combined, pageType);
      }
    )
  );

  const body1 = {
    pageCount: page,
    numPerPage: size,
    searchString: searchVal,
    key: activeChip,
    order:
      activeChip === "Customers"
        ? sortConfigParent.order || "desc"
        : sortConfig.order || "desc",
    val:
      activeChip === "Customers"
        ? sortConfigParent.key || ""
        : sortConfig.key || "",
    export: false,
    pageType: pageType,
  };

  dispatch(
    listSalesOutstandingAction(
      body1,
      commoncookie,
      headerLocationId,
      setModalTypeHandler,
      setLoaderStatusHandler
    )
  );
};

 const customerIndex =  customerAsCompany.findIndex(c => c.customer_id === data?.customer_id);

  let openData = {
    rowIndex: customerIndex,
    sales_customer_id: data?.customer_id,
    routeFrom: "SALES",
    salesOrder: "salesOrder",
    mail_configuration: mail_configuration,
    setOnbackClick: false,
    backToSales: rowPopupClose1,
  };
 const landingOpen = (row) => {
   setOpen(true);
   setRowIndex(row);
 };

 const receivablesExport = UserRightsAuthorization(menuAccess[selectedRole], 'sales__receivables', 'can_export')
 const receiptCreate = UserRightsAuthorization(menuAccess[selectedRole], 'sales__receipts', 'can_create')

  return (
    <>
      {onrowclick === true ? 
      // <App
      //   // statementOfAccount={Get_customer_statement}
      //   rowIndex={data.customer_id}
      //   handleEdit={false}
      //   backToSales={rowPopupClose1}
      //   handleDelete={false}
      //   type={'customer'}
      //   mail_configuration={mail_configuration}
      //   customertype={1}
      //   setEditfind={false}
      //   setOnbackClick={false}
      //   employeeSetState={false}
      //   salesOrder={'salesOrder'}
      // />
      // <ContactPage
      //   rowIndex={customerIndex}
      //   sales_customer_id = {data.customer_id}
      //   routeFrom = {"SALES"}
      //   salesOrder = {'salesOrder'}
      //   mail_configuration={mail_configuration}
      //   setOnbackClick={false}
      //   backToSales={rowPopupClose1}
      //   />
      OpenCustomerLandingPage(openData)
        :
        <>

          <Helmet>
            <meta charSet='utf-8' />
            <title> {titleURL} | Receivables </title>
          </Helmet>
          <Snackbar
            open={openError}
            autoHideDuration={6000}
            onClose={() => setOpenError(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert severity='error' onClose={() => setOpenError(false)}>
              {errorMessage}
            </Alert>
          </Snackbar>

          <CreateNewButtonContext.Consumer>
            {({ loaderStatus }) => (

              <>



                {
                  !open && 
                  <Grid
                  container
                  display='flex'
                  flexDirection='row'
                  alignItems='center'
                  spacing={3}
                >



                  <>
                  {pageType !== "reportPage" && <>
                    {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                      <Typography variant='h6'>Receivable</Typography>
                    </Grid> */}
                     
                    <Grid size={12}>
                      <KpiStrip
                        items={[
                          {
                            icon: AccountBalanceWalletOutlinedIcon,
                            label: 'Total',
                            prefix: '₹',
                            value: parseFloat(invoiceValue?.totalDues ?? 0).toFixed(2),
                          },
                          {
                            icon: PriceCheckOutlinedIcon,
                            label: 'Average Due Value',
                            prefix: '₹',
                            value: parseFloat(invoiceValue?.averageCreditValue ?? 0).toFixed(2),
                          },
                          {
                            icon: EventBusyOutlinedIcon,
                            iconColor: (Number(invoiceValue?.dueDateExceeded) || 0) > 0 ? 'error.main' : undefined,
                            label: 'Due Date Exceeded',
                            prefix: '₹',
                            value: invoiceValue?.dueDateExceeded ?? 0,
                          },
                          {
                            icon: ScheduleOutlinedIcon,
                            label: 'Average Due Days',
                            value: invoiceValue?.averageCreditDays ?? '0',
                            suffix: ' Days',
                          },
                          {
                            icon: CalendarMonthOutlinedIcon,
                            label: 'Days Receivable',
                            value: invoiceValue?.daysReceivables ?? '0',
                            suffix: ' Days',
                          },
                        ]}
                      />
                    </Grid>

                    <>
                      <Grid size={12}>
                        <AgingChips
                          buckets={Object.keys(initialState)
                            .filter((label) => label !== "Customers" && label !== "Value")
                            .map((label) => ({
                              key: label,
                              label,
                              color: {
                                // WCAG AA against white background (chip text/border is colored on white card)
                                "1-15 Days": "#57811f",
                                "16-30 Days": "#b45309",
                                "31-45 Days": "#c2410c",
                                "46-60 Days": "#d32313",
                                "> 61 Days": "#903128",
                                "Critical": "#7b0000",
                                "Due Today": "#0c7eac",
                                "Overdue": "#6B6B6B",
                              }[label],
                              displayValue: formatRupeesCompact(chipDataTotals[label] ?? 0),
                            }))}
                          selectedKey={activeChip}
                          onSelect={handleChipClick}
                        />
                      </Grid>
                    </>
                    </>}
                    {/* <Grid size={12}></Grid> */}
                    <Box sx={{
                      width: "100%", display: 'flex', flexDirection: 'column', borderRadius: 0, mt: 1,
                    }}>
                     <Card sx={{ width: '100%', borderRadius: 0, height: 'calc(100vh - 205px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <Grid
                          size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                          }}
                          sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                          <TableContainer
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              flex: 1,
                              minHeight: 0,
                              '&::-webkit-scrollbar': {
                                width: 4,
                              },
                              '&::-webkit-scrollbar-thumb': {
                                backgroundColor: '#B2B2B2',
                                borderRadius: 2,
                                border: '2px solid white',
                              },
                            }}
                          >

                            <Grid
                              size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                              }}
                              sx={{ flexShrink: 0 }}>
                              <Grid container alignItems="center" sx={{ p: 1 }} justifyContent="space-between">
                                <Grid
                                  display="flex"
                                  justifyContent="flex-end"
                                  alignItems="center"
                                  sx={{ gap: 1 }}
                                  size={12}>
                                  {/* Receivables List Title */}
                                  {pageType == "reportPage" ? <Grid display="flex" justifyContent="flex-start" size={12}>
                                    <Typography variant="h6">
                                      {/* <Link href="/report" underline="hover">
                                        <HomeIcon sx={{ mr: 0.5 }} fontSize='inherit' />
                                        Home
                                      </Link>
                                      / Outstanding Report */}
                                      <Box style={{ display: 'flex' }}>
                                        <Box sx={{ color: '#0A8FDC', cursor: 'pointer', fontSize: '12px', fontWeight: 400, '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate('/report')}>
                                          <HomeIcon sx={{ mr: 0.5 }} fontSize='inherit' />
                                          Home
                                        </Box>
                                        <Typography variant="h6">Outstanding Report</Typography>
                                      </Box>
                                    </Typography>
                                  </Grid> : <Grid display="flex" justifyContent="flex-start" size={12}>
                                    <Typography variant="h6">Receivables</Typography>
                                  </Grid>}

                                  {receivables_lastSync !== 'No Records' && receivables_lastSync !== null && (
                                    <Grid
                                      display="flex"
                                      justifyContent="flex-end"
                                      alignItems="center"
                                      sx={{ gap: 2 }}
                                      size={{
                                        lg: 4,
                                        md: 4,
                                        sm: 5.5,
                                        xs: 12
                                      }}>
                                      {loading ? (
                                        <CircularProgress size={25} />
                                      ) : (
                                        <>
                                          {receivables_lastSync !== 'No Records' && receivables_lastSync !== null && (
                                            <Grid container alignItems="center" justifyContent="flex-end" sx={{ gap: 1 }}>
                                              <Tooltip title="Unmatched Datas">
                                                <IconButton size="small" color="primary" onClick={fetchUnmatchedRecords}>
                                                  <GridTableRowsIcon fontSize="small" />
                                                </IconButton>
                                              </Tooltip>
                                            </Grid>
                                          )}
                                          {/* {receivables_lastSync !== 'No Records' && receivables_lastSync !== null && (
                                            <Tooltip title="Sync Bills Receivables">
                                              <Button
                                                variant="contained"
                                                size="small"
                                                color="primary"
                                                onClick={handleSyncBillsReceivables}
                                                sx={{
                                                  minWidth: 120,
                                                  textTransform: "none",
                                                  display: "flex",
                                                  flexDirection: "column",
                                                  alignItems: "center",
                                                  paddingY: 0.2,
                                                  gap: "2px",
                                                }}
                                              >
                                                <Box display="flex" alignItems="center" gap="4px">
                                                  <SyncIcon sx={{ fontSize: "1rem" }} />
                                                  <Typography variant="body2" fontWeight="bold" sx={{ fontSize: "0.7rem", opacity: 0.7 }}>
                                                    Sync
                                                  </Typography>
                                                </Box>
                                                <Typography variant="caption" sx={{ fontSize: "0.6rem", opacity: 0.7 }}>
                                                  {date} {time}
                                                </Typography>
                                              </Button>
                                            </Tooltip>
                                          )} */}
                                        </>
                                      )}
                                      <Dialog
                                        open={openDialog}
                                        onClose={handleCloseDialog}
                                        maxWidth='md'
                                        fullWidth
                                      >
                                        {handleAlert && (
                                          <DialogTitle>
                                            {insertedData.length > 0 ? (
                                              <Alert severity='success' sx={{ mb: 2 }}>
                                                Successfully uploaded the matched records.
                                              </Alert>
                                            ) : (
                                              <Alert severity='warning' sx={{ mb: 2 }}>
                                                No Records Uploaded.
                                              </Alert>
                                            )}
                                          </DialogTitle>
                                        )}
                                        {unmatchedRecords?.length > 0 ? (
                                          <>
                                            <DialogTitle>
                                              Records with unmatched customer names were not
                                              uploaded.
                                            </DialogTitle>
                                            <DialogContent>
                                              <TableContainer component={Paper}>
                                                <Table
                                                  sx={{ minWidth: 650 }}
                                                  aria-label='unmatched records table'
                                                >
                                                  <TableHead>
                                                    <TableRow>
                                                      <TableCell>Bill Ref</TableCell>
                                                      <TableCell>Bill Date</TableCell>
                                                      <TableCell>Bill Party</TableCell>
                                                      <TableCell>Bill Cl</TableCell>
                                                      <TableCell>Bill Due</TableCell>
                                                      <TableCell>Bill Overdue Days</TableCell>
                                                    </TableRow>
                                                  </TableHead>
                                                  <TableBody>
                                                    {unmatchedRecords.map((record, index) => (
                                                      <TableRow key={index} sx={{
                                                        '&:hover': {
                                                          backgroundColor: '#f5f5f5',
                                                          cursor: 'pointer',
                                                        },
                                                      }}>
                                                        <TableCell>
                                                          {record.billRef}
                                                        </TableCell>
                                                        <TableCell>
                                                          {record.billDate}
                                                        </TableCell>
                                                        <TableCell>
                                                          {record.billParty}
                                                        </TableCell>
                                                        <TableCell>{record.billCl}</TableCell>
                                                        <TableCell>
                                                          {record.billDue}
                                                        </TableCell>
                                                        <TableCell>
                                                          {record.billOverdueDays}
                                                        </TableCell>
                                                      </TableRow>
                                                    ))}
                                                  </TableBody>
                                                </Table>
                                              </TableContainer>
                                            </DialogContent>
                                          </>
                                        ) :
                                          <DialogTitle>
                                            No unmatched records found.
                                          </DialogTitle>}

                                        <DialogActions>
                                          <Button
                                            onClick={handleCloseDialog}
                                            color='primary'
                                          >
                                            Close
                                          </Button>
                                        </DialogActions>
                                      </Dialog>
                                    </Grid>
                                  )}

                                  {pageType !== 'reportPage' && <>
                                    <ViewToggleChips
                                      options={[{ key: 'Value', label: 'Value' }, { key: 'Customers', label: 'Customers' }]}
                                      selectedKey={activeChip}
                                      onSelect={handleChipClick}
                                    />
                                    <Tooltip title="Reminder">
                                      <IconButton size="medium" onClick={handleReminder}>
                                        <NotificationsActiveIcon fontSize="medium" />
                                      </IconButton>
                                    </Tooltip>
                                  </>}
                                  
                                    {pageType === "reportPage" && <IconButton 
                                      onClick={()=> setShareOpen(true)}
                                    >
                                      <ShareIcon/>
                                    </IconButton>}
                                {(activeChip === "Value" && receivablesExport) && (
                                  <ExportMenu
                                    items={[
                                      ...(pageType !== 'reportPage' ? [{ label: 'Export PDF', onClick: handleExportPDFLocal }] : []),
                                      { label: 'Export CSV', onClick: handleExportCSVLocal },
                                    ]}
                                  />
                                )}



                                  {/* Search Component */}
                                  <Box sx={{ minWidth: 220, flexShrink: 0 }}>
                                    <CommonSearch searchVal={searchVal} cancelSearch={cancelSearch} requestSearch={requestSearch} />
                                  </Box>
                                </Grid>
                              </Grid>
                            </Grid>

                            <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            {selectedChip.Customers && (
                                (<TableContainer component={Paper} sx={{ flex: 1, minHeight: 0, overflow: 'auto', border: 'none', boxShadow: 'none' }}>
                                  <Table size="small" aria-label='collapsible table'>
                                    <TableHead>
                                      <TableRow>
                                        <TableCell />
                                        <TableCell><b> <SortableHeader active={sortConfigParent.key === "companyName"} direction={sortConfigParent.order} onClick={() => handleSortParent("companyName")}> Customer Name </SortableHeader></b></TableCell>
                                        {/* <TableCell align="right">Payment Type</TableCell> */}
                                        {/* <TableCell align="right">Receiving Time</TableCell> */}
                                        <TableCell align="right">No. of Bills</TableCell>
                                        <TableCell align="right">Average Due Days</TableCell>
                                        <TableCell align="right">Total Invoice Amount</TableCell>
                                        <TableCell align="right">Total Due Amount</TableCell>
                                        {/* <TableCell align="right">Due Days</TableCell> */}
                                       
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {rowsWithSalesDetails.map((row, i) => {
                                        return (
                                          <Row
                                            key={i}
                                            row={row}
                                            salesDetails={row.salesDetails}
                                            getSalesDetails={getSalesDetails}
                                            pendingPayment={pendingPaymentChild}
                                            invoiceFunction={invoiceFunction}
                                            handleMailConfiguration={handleMailConfiguration}
                                            openingBalanceLedgers={openingBalanceLedgers}
                                            handleOpeningBalPayment={handleOpeningBalPayment}
                                            handleRowData={handleRowData}
                                            landingOpen={landingOpen}
                                            receivablesExport={receivablesExport}
                                            receiptCreate={receiptCreate}
                                          />
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </TableContainer>)
                              /* </Card> */
                            )}

                            {!selectedChip.Customers && (
                              <Formik initialValues={{}}>
                                {() => (
                                  <Form style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                                    <OutstandingTable
                                      maxHeight="100%"
                                      columns={[
                                        {
                                          key: 'companyName',
                                          label: 'Customer Name',
                                          sortable: true,
                                          cellSx: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 240 },
                                          render: (row) => (
                                            <Link
                                              onClick={(event) => {
                                                event.stopPropagation();
                                                handleCustomerDetail(row);
                                              }}
                                              style={{
                                                textDecoration: 'none',
                                                cursor: 'pointer',
                                                color: '#03adfc',
                                              }}
                                            >
                                              {row.companyName}
                                            </Link>
                                          ),
                                        },
                                        {
                                          key: 'invoice_date',
                                          label: 'Invoice Date',
                                          sortable: true,
                                          render: (row) => moment(row.invoice_date).format('DD-MM-YYYY'),
                                        },
                                        {
                                          key: 'invoice_number',
                                          label: 'Invoice',
                                          cellSx: { minWidth: 150, maxWidth: 250, whiteSpace: 'nowrap' },
                                          render: (row) =>
                                            row?.saleType !== 'Outstanding Invoice' ? (
                                              <div
                                                style={{
                                                  cursor: 'pointer',
                                                  color: '#03adfc',
                                                  overflow: 'hidden',
                                                  textOverflow: 'ellipsis',
                                                }}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  invoiceFunction(row);
                                                  handleMailConfiguration();
                                                }}
                                              >
                                                {row.invoice_number ?? row.dc_number}
                                              </div>
                                            ) : (
                                              <span>{row.invoice_number ?? row.dc_number}</span>
                                            ),
                                        },
                                        ...(pageType !== 'reportPage'
                                          ? [
                                              {
                                                key: 'delivered_date',
                                                label: 'Delivered Date',
                                                render: (row) =>
                                                  row.delivered_date
                                                    ? moment(row.delivered_date).format('DD/MM/YYYY hh:mm A')
                                                    : '-',
                                              },
                                            ]
                                          : []),
                                        {
                                          key: 'total',
                                          label: 'Invoice Amount',
                                          sortable: true,
                                          align: 'right',
                                          render: (row) => parseFloat(row.total).toFixed(2) || 0,
                                        },
                                        {
                                          key: 'due_amount',
                                          label: 'Due Amount',
                                          sortable: true,
                                          align: 'right',
                                          render: (row) =>
                                            isNaN(row.due_amount) || row.due_amount === null
                                              ? '0.00'
                                              : row.due_amount,
                                        },
                                        ...(pageType !== 'reportPage'
                                          ? [
                                              {
                                                key: 'receipt',
                                                label: 'Receipt',
                                                render: (row) => {
                                                  if (row.saleType === 'DC') return null;
                                                  const pending =
                                                    row.total !== row.received_amount &&
                                                    row.total > row.received_amount;
                                                  if (pending) {
                                                    return receiptCreate ? (
                                                      <Tooltip title="Record payment">
                                                        <IconButton
                                                          size="small"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            pendingPaymentChild(row.sale_id, [row]);
                                                          }}
                                                          sx={{ p: 0.25 }}
                                                        >
                                                          <AssignmentLateIcon fontSize="small" color="warning" />
                                                        </IconButton>
                                                      </Tooltip>
                                                    ) : (
                                                      <Tooltip title="Pending">
                                                        <AssignmentLateIcon fontSize="small" color="warning" />
                                                      </Tooltip>
                                                    );
                                                  }
                                                  return (
                                                    <Tooltip title="Paid">
                                                      <AssignmentTurnedInIcon fontSize="small" color="success" />
                                                    </Tooltip>
                                                  );
                                                },
                                              },
                                            ]
                                          : []),
                                        {
                                          key: 'due_date',
                                          label: 'Due Date',
                                          sortable: true,
                                          render: (row) => moment(row.due_date).format('DD-MM-YYYY'),
                                        },
                                        {
                                          key: 'due_days',
                                          label: 'Due Days',
                                          sortable: true,
                                          align: 'right',
                                          render: (row) => row.due_days,
                                        },
                                      ]}
                                      rows={Array.isArray(sale_outstanding) ? sale_outstanding : []}
                                      sortKey={sortConfig.key}
                                      sortOrder={sortConfig.order}
                                      onSort={handleSort}
                                      onRowClick={
                                        pageType !== 'reportPage'
                                          ? (row) => {
                                              setOpen(true);
                                              setRowIndex(row);
                                            }
                                          : undefined
                                      }
                                      loading={!isApiFinished && (!Array.isArray(sale_outstanding) || sale_outstanding.length === 0)}
                                      emptyState={
                                        <Typography variant="h6" color="text.secondary">
                                          No Records Found
                                        </Typography>
                                      }
                                    />
                                  </Form>
                                )}
                              </Formik>
                            )}
                            </Box>
                            <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }} sx={{ flexShrink: 0 }}>
                              <OutstandingPagination
                                count={sale_outstanding_count}
                                page={page}
                                rowsPerPage={size}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                              />
                            </Grid>


                          </TableContainer>
                          {/* {Array.isArray(sale_outstanding)  && !sale_outstanding.length &&
                            loaderStatus === false &&
                            (isApiFinished ? <NoRecordFound /> : '')} */}
                          {/* </Card> */}


                          {/* </Card> */}
                        </Grid>

                      </Card>
                      </Box>
                     

                    

                    <InvoiceDialog
                      appConfigData={appConfigData}
                      createMail={createMail}
                      custType={'CUSTOMER'}
                      custData={popUpdata.custData}
                      invoice={popUpdata.invoice}
                      soDate={popUpdata.soDate}
                      sales_items={popUpdata.sales_items}
                      open={popUpdata.Dopen}
                      handleClose={() => setPopupData({ ...popUpdata, Dopen: false })}
                      setModalTypeHandler={setModalTypeHandler}
                      setLoaderStatusHandler={setLoaderStatusHandler}
                      mail_configuration={mail_configuration}
                      posSale={true}
                    />

                      <Dialog open={shareOpen}>
                          <ShareReport
                          report_name  = {'Outstanding Report'}
                          handleClose = {()=> setShareOpen(false)}
                          open={shareOpen}
                          columns = {Schedulecolumns}
                          data = {sharedData}
                        />
                        </Dialog>

                    {/* <PaymentDialog
                      getPay={getPay}
                      setgetPay={setgetPay}
                      status={'edit'}
                      activeINV={'INV'}
                      selectionModel={selectionModel}
                      setSelectionModel={setSelectionModel}
                      entryvalue={entryvalue}
                      handleEntry={setHandleEntry}
                      received_amount={received_amount}
                      setReceived_amount={setReceived_amount}
                      handleSubmit={paymentValidate}
                      custType={'CUSTOMER'}
                      Tdata={Tdata}
                      setTdata={setTdata}
                      custData={getCustomer}
                      sales_items={sales_items}
                      paymentOpen={paymentOpen}
                      setpaymentOpen={setpaymentOpen}
                      responseType={'cashIn'}
                      manualNoteSchemes={manualNoteSchemes}
                      setManualNoteSchemes={setManualNoteSchemes}
                      addAdvanceAmount={addAdvanceAmount}
                      rowData={rowData}
                      receivables={receivables}
                      pageType={"SALES"}
                      type={0}
                      clickedInvoice={clickedInvoice}
                      disableSubmit={disableSubmit}
                    /> */}
                    {
                      paymentOpen &&
                      <ReceiptPayments
                        paymentOpen={paymentOpen}
                        custType = 'CUSTOMER'
                        handleClose={setpaymentOpen}
                        editData={{}}
                        responseType={'cashIn'}
                        sales_items={sales_items}
                        selectedInvoice={clickedInvoice}
                        selectedCustomer={getCustomer}
                      />
                    }
                    <LocationAlert
                      open={openAlert}
                      onClose={() => setOpenAlert(false)}
                    />

                    <OpeningBalPayment
                      open={openingBalPaymentOpen}
                      handleClose={() => setOpeningBalPaymentOpen(false)}
                      openingBalData={openingBalData}
                    />

                    <Dialog open={reminder}>
                      <ReminderForm
                        handleClose={handleClose}
                        datas={sale_outstanding}
                        type={'receivable'}
                      />
                    </Dialog>
                  </>

                  </Grid>
                }
                {
                  open && 
                  <ReceivablesLandingPage
                  rowData = {rowIndex}
                    rowPopupClose={() => setOpen(false)}
                />
                }

              </>
            )}
          </CreateNewButtonContext.Consumer>

          {/* <Dialog
        open={openExcessPaymentDialog}
        onClose={handleCloseExcessPaymentDialog}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography id="receivable-dialog-title">Advance Confirmation</Typography>
          <IconButton
            aria-label="close"
            onClick={handleCloseExcessPaymentDialog}
            sx={{
              padding: 0,
              width: 32,
              height: 32,
              marginLeft: (theme) => theme.spacing(1),
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <br />
        <DialogContent>
          The given amount is greater than the Due amount! Would you like to add the Difference Amount as Advance ?
        </DialogContent>
        <DialogActions>
          <Button variant='contained' onClick={handleProceedWithAdvance} color="success">
            Yes
          </Button>
          <Button variant='contained' onClick={handleDoNotAddAdvance} color="error">
            No
          </Button>
        </DialogActions>
      </Dialog> */}

        </>
      }
    </>
  );
}
