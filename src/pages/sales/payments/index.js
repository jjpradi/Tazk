import React, { useEffect, useContext, useRef, useState } from 'react';
// import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useDispatch, useSelector } from 'react-redux';
import AddIcon from '@mui/icons-material/Add';
import {
  completedpaymentview,
  createPurchasesAction,
  updatePurchasesAction,
  receivingsPayments,
  consolidatedPayables,
  getbyidPurchasesAction,
  PurchaseAdvanceEntry,
  updatePayablePaymentEntry,
  get_completedpaymentview,
  set_completedpaymentview
} from '../../../redux/actions/purchase_actions';
import { getSupplierDetailsByIdAction, listVendorAction, listVendorIdAndNameAction, setInvoiceTempAction } from '../../../redux/actions/vendor_actions';
import { payablesPaymentEntry } from '../../../redux/actions/purchase_actions';
import { listStockLocationAction, listStockLocationSequenceAction } from '../../../redux/actions/stock_Location_actions';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PaymentDialog from '../paymentSalesPurchase/Dialog';
import context from '../../../context/CreateNewButtonContext';
// import Chip from '@mui/material/Chip';
// import ArticleIcon from '@mui/icons-material/Article';
import Popup from '../purchases/Popup';
import InvoiceDialog from '../sales/InvoiceDialog';
import { deleteReceipts, getReceiptsByIdAction, sendMail, setReceiptsByIdAction } from '../../../redux/actions/sales_actions';
import { getAppConfigDataAction } from '../../../redux/actions/app_config_actions';
import { getDateTime, getDateTimeFormat } from '../../../utils/getTimeFormat';
import { Grid, CardContent, Card, Stack, Link, Dialog, List, ListItem, ListItemIcon, ListItemText, useTheme, useMediaQuery, Button, TablePagination } from '@mui/material';
import CardTemplate from '../../../components/customer_erpDesign/cardTemplate';
import { sendNtfy } from '../../../firebase/firebase.service';
import {
  getLoginRoleAction,
  getLoginTokenAction,
} from '../../../redux/actions/userRole_actions';
import Cookies from 'universal-cookie';
import notificationType from '../../../firebase/notify_type';
import NoRecordFound from '../../../components/Layout/NoRecordFound';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { createTransactionAction } from '../../../redux/actions/transaction_actions';
import { listChartOfAccountsAction } from '../../../redux/actions/chartOfAccounts';
import { getByIdMailConfigurationAction } from '../../../redux/actions/configuration_actions';
import { listUserCreationAction } from '../../../redux/actions/userCreation_actions';
import AddchartIcon from '@mui/icons-material/Addchart';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import DateRangeIcon from '@mui/icons-material/DateRange';
import Cards from '../../../components/dynamicCards/index';
import totalIcon from '../../../assets/dashboardIcons/rupee.svg';
import deadlineIcon from '../../../assets/dashboardIcons/deadline.svg';
import duedateIcon from '../../../assets/dashboardIcons/due-date.svg';
import apiCalls from 'utils/apiCalls';
import { Helmet } from "react-helmet-async";
import { CreateNotificationAction } from 'redux/actions/notification_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import { maxBodyHeight, maxHeight, pageSize, headerStyle, cellStyle, font14_500 } from 'utils/pageSize';
import { getManualNoteSchemesByIdAction } from 'redux/actions/manualNotes_actions';
import NewPayments from './newpayment'
import CommonSearch from 'utils/commonSearch';
import { Chip } from '@mui/material';
import moment from 'moment';
import FilterPurchases from 'pages/sales/purchases/FilterPurchases';
import PaymentPage from '../paymentSalesPurchase/receiptpayment';
import { InventoryProductAction } from 'redux/actions/product_actions';
import LocationAlert from 'pages/assets/alert/LocationAlert';
import { titleURL } from 'http-common';
import { roleType } from 'utils/roleType';
import CommonSchedule from 'pages/sales/salesReport/CommonSchedule';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ShareIcon from '@mui/icons-material/Share';
import ShareReport from 'pages/sales/salesReport/ShareReport';
import AlertDialog from '../../common/Dialog';
import ReceiptPayments from 'components/ReceiptPayments/ReceiptPayments';
import { useLocation, useNavigate } from 'react-router-dom';
import ReceiptDetails from 'pages/sales/Receipt/ReceiptDetails';
import { FilterAlt } from '@mui/icons-material';
  import {
    getStickyTableOptions,
    stickyTableComponents,
  } from '../../../utils/stickyTableLayout';
import ReceiptPaymentFilter from 'pages/sales/Receipt/ReceiptPaymentFilter';
import { listPaymentTypeDetails } from 'redux/actions/payment_method_actions';
import { useCustomFetch } from 'utils/useCustomFetch';
import ReceiptsLanding from 'pages/sales/Receipt/ReceiptsLanding';
import VoucherPdfDialog from 'pages/sales/Receipt/VoucherPdfDialog';
import docTemplateService from 'services/docTemplate_services';
import Salesservice from 'services/sales_services';
import { getCompanyLogo } from 'redux/actions/company_actions';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import { OpenCustomerLandingPage } from '@crema/utility/helper/RouteHelper';
import { customerAsCompanyAction } from 'redux/actions/customer_actions';
import { ExportCsv, ExportPdf } from '@material-table/exporters';
import * as XLSX from 'xlsx-js-style';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

// const poStatus = {
//   New: 'primary',
//   Open: 'secondary',
//   'Pending Payment': 'warning',
//   'Pending Goods': 'warning',
//   Completed: 'success'
// }

// function Row(props) {
//   const {row, pendingPayment, setedit_data, handleMailConfiguration} = props;
//   const [open, setOpen] = React.useState(false);


//   return (
//     <React.Fragment>
//       <TableRow sx={{'& > *': {borderBottom: 'unset'}}}>
//         <TableCell>
//           <IconButton
//             aria-label='expand row'
//             size='small'
//             onClick={() => setOpen(!open)}
//           >
//             {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
//           </IconButton>
//         </TableCell>
//         <TableCell component='th' scope='row'>
//           {row.vendorName}
//         </TableCell>
//         <TableCell align='right'>{row.count}</TableCell>
//         {/* <TableCell align='right'>{row.avgDue_days}</TableCell> */}
//         <TableCell align='right'>{row.total.toFixed(2)}</TableCell>
//         {/* <TableCell style={{textAlign: 'right'}}>
//           {row.total.toFixed(2)}
//         </TableCell> */}
//       </TableRow>
//       <TableRow>
//         <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={6}>
//           <Collapse in={open} timeout='auto' unmountOnExit>
//             <Box sx={{margin: 1}}>
//               <Typography variant='h6' gutterBottom component='div'>
//                 {row.vendorName}
//               </Typography>
//               <Table size='small' aria-label='purchases'>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell>PO Number</TableCell>
//                     <TableCell>Reference</TableCell>
//                     <TableCell>PO Date</TableCell>
//                     <TableCell>Received Date</TableCell>
//                     <TableCell>Location</TableCell>
//                     {/* <TableCell>Payment Type</TableCell> */}
//                     <TableCell>Amount</TableCell>
//                     {/* <TableCell>Payment</TableCell> */}
//                     {/* <TableCell>Due Amount</TableCell>
//                     {/* <TableCell>Due Days</TableCell> */}
//                     {/* <TableCell>Due Date</TableCell> */}
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {row.childRow?.map((historyRow) => (
//                     <TableRow key={historyRow.receiving_id}>
//                       <TableCell
//                         onClick={() => {setedit_data(historyRow); handleMailConfiguration();}}
//                         sx={{cursor: 'pointer', textDecoration: 'underline'}}
//                       >
//                         {historyRow.po_number}
//                       </TableCell>
//                       <TableCell>
//                         {typeof historyRow.invoice_number !== 'string'
//                           ? historyRow.invoice_number
//                               .map((i) => i.invoice_number)
//                               .join(', ')
//                           : historyRow.invoice_number}
//                       </TableCell>
//                       <TableCell>{historyRow.receiving_time}</TableCell>
//                       <TableCell>{historyRow.invoice_date}</TableCell>
//                       <TableCell>{historyRow.location_name}</TableCell>
//                       {/* <TableCell >
//                         {historyRow.payment_type}
//                       </TableCell> style={{textAlign:'right'}} */}
//                       <TableCell>
//                         {+historyRow.paid_amount}
//                       </TableCell>
//                       {/* <TableCell>
//                         <div style={{display: 'flex', cursor: 'pointer'}}>
//                           {+historyRow.paid_amount >= +historyRow.total ? (
//                             <AssignmentTurnedInIcon color='success' />
//                           ) : (
//                             <AssignmentLateIcon
//                               onClick={() => pendingPayment(historyRow)}
//                               color='warning'
//                             />
//                           )}
//                         </div>
//                       </TableCell> */}
//                       {/* <TableCell>{historyRow.due_amount}</TableCell> */}
//                       {/* <TableCell>{historyRow.due_days}</TableCell> */} 
//                       {/* <TableCell>{historyRow.due_days_credit}</TableCell> */}
//                       {/* <TableCell>{historyRow.due_date_credit}</TableCell> */}
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </Box>
//           </Collapse>
//         </TableCell>
//       </TableRow>
//     </React.Fragment>
//   );
// }
const poStatus = {
  New: 'primary',
  Open: 'secondary',
  'Pending Payment': 'warning',
  'Pending Goods': 'warning',
  Completed: 'success',
};
export default function CollapsibleTable(props) {
  const dispatch = useDispatch();
  const customFetch = useCustomFetch()
  const navigate = useNavigate()
  const theme = useTheme()
  const isLargerScreen = useMediaQuery(theme.breakpoints.up('lg'))
  let storage = getsessionStorage()
  const selectedRole = storage.role_name

  const {
    purchasesReducer: { completed_purchase_outstanding, purchase_outstanding, purchases, consolidated_data, purchasesByPaginationCount1 },
    vendorReducer: { vendorIdAndName },
    stockLocationReducer: { stocklocation },
    paymentMethodReducer: { list_payment_type },
    appConfigReducer: { app_config_data },
    ChartOfAccountsReducer: { chartOfAccounts },
    UserCreationReducer: { createUser },
    ConfigurationReducer: { mail_configuration },
    productReducer: { inventory_product },
    customerReducer: { customerAsCompany },
    rbacReducer: { menuAccess },
    CompanyReducers: { company_logo }
  } = useSelector((state) => state);
  const [PayData, setPayData] = React.useState({
    paymentOpen: false,
    itemsData: [],
    Tdata: [],
    getVendor: {},
    paid_amount: 0,
  });
  const [manualNoteSchemes, setManualNoteSchemes] = useState([]);
  const [isEdit, setisEdit] = React.useState(false);
  const [edit_data, setedit_data] = React.useState({});
  const [status, setstatus] = React.useState('');
  const [selectionModel, setSelectionModel] = React.useState([]);
  const [entryvalue, setHandleEntry] = useState(false)
  const [getPay, setgetPay] = React.useState([]);
  const tempinitsform = useRef(null);
  const [newopen, setNewOpen] = useState(props.newopen || false)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [page, setPage] = useState(0)
  const [searchVal, setSearchval] = useState('')
  const [filtedValue, setFiltedValue] = useState({
    name: '',
    brand: '',
    category: '',
    location_id: 'null',
    supplier_id: '',
    statusfilter: '',
    max_price: '',
    min_price: '',
    payment_type: ''
  })
  const [from, setFrom] = useState(null)
  const [to, setTo] = useState(null)
  const [dateRange,setDateRange] = useState(null)
  const [errormsg, seterrormsg] = useState({ from: '', to: '' })
  const [rowPopup, setrowpopup] = useState({ open: false, rowIndex: '', receivings_items: [] })
  const [filterOpen, setFilterOpen] = useState(false)
  const [isApiFinished, setIsApiFinished] = useState(false)
  const [editData, setEditData] = useState({})
  const [openAlert, setOpenAlert] = useState(false);
  const [scheduleOpen,setScheduleOpen] =  useState(false)
  const [open,setOpen] =  useState(false)
  const [click,setClick] =  useState(false)
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletedata, setdeleteData] = useState({});
  const [Schedulecolumns,setSchedulecolumns] =  useState([
        { name: "PO Number", key: "po_number" },
        { name: "Vendor Name", key: "company_name" },
        { name: "Reference", key: "invoice_number" },
        { name: "PO Date", key: "invoice_date" },
        { name: "Receiving Time", key: "receiving_time" },
        { name: "Location", key: "location_name" },
        { name: "Payment Type", key: "payment_type" },
        { name: "Amount", key: "total" }
      ],)

  const [advanceAmount, setAdvanceAmount] = useState(0)
  const [paymentDetailOpen, setPaymentDetailOpen] = useState(false)
  const [paymentData, setPaymentData] = useState('')
  const [rowData, setRowData] = useState({})
  const [entryType, setEntryType] = useState('new')
  const [paymentDetailOpenForSmallerScreen, setPaymentDetailOpenForSmallerScreen] = useState(false);
  const [landingOpen, setLandingOpen] = useState(false);
  const [rowDataIndex, setRowDataIndex] = useState(null)
  const [voucherPdfOpen, setVoucherPdfOpen] = useState(false)
  const [voucherPdfBase64, setVoucherPdfBase64] = useState('')
  const [voucherPdfNumber, setVoucherPdfNumber] = useState('')

  const location = useLocation()
  const isReportPage = location?.state?.pageType === 'reportPage'
  const refreshVendor = useRef(null);

  const { paymentOpen, itemsData, Tdata, getVendor, paid_amount, receiving_id } =
    PayData;
  const [appConfigData, setAppConfigData] = useState({});
  const [Dopen, setDopen] = React.useState(false);
  const [openVendorDetails, setOpenVendorDetails] = useState(false)
  const [vendorDetails, setVendorDetails] = useState('')
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(context);
  let date = new Date();
  let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);


  const handleEdit = (data) => {
    setedit_data(data);
    setstatus('edit');
    setisEdit(true);

    // const getVendor = vendor.filter(
    //   (d) => data.supplier_id === d.supplier_id,
    // )[0];
    // setPayData({...PayData, getVendor});
    // setDopen(true);

    dispatch(getSupplierDetailsByIdAction(data.supplier_id, (supplierDetails) => {
      const getVendor = supplierDetails || {};
      setPayData({ ...PayData, getVendor });
      setDopen(true);
    }))


  };
  const handleMailConfiguration = async () => {
    const roleIdData = createUser.filter(f => f.employee_id === commoncookie)
    if (roleIdData.length > 0) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(getByIdMailConfigurationAction('Purchase Order', roleIdData[0]?.role_id))
      );
    }
  }

  // useEffect(() => {
  //   dispatch(consolidatedPayables(setModalTypeHandler, setLoaderStatusHandler))

  // }, [completed_purchase_outstanding])



  const sample = (value) => {
    setisEdit(value);
  };

  const createPurchases = (
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
    sample,
  ) => {
    dispatch(
      createPurchasesAction(
        data,
        setModalTypeHandler,
        setLoaderStatusHandler,
        sample,
        null,
        null,
        null,
        commoncookie,
        headerLocationId,
      ),
    );
  };

  const updatePurchases = (
    id,
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
    sample,
    employee_id,
    headerLocationId,
  ) => {
    dispatch(
      updatePurchasesAction(
        id,
        data,
        setModalTypeHandler,
        setLoaderStatusHandler,
        sample,
        null,
        employee_id,
        headerLocationId,
      ),
    );
  };

  // useEffect(() => {
  //   dispatch(paymentview())
  //   if(!vendor.length)
  //   dispatch(listVendorAction(true, setLoaderStatusHandler))
  //   if(!stocklocation.length)
  //   dispatch(listStockLocationAction(true, setLoaderStatusHandler))
  // }, [])

  const initsform = () => {

    // const data = {
    //   brand: '',
    //   category: '',
    //   location_id: headerLocationId,
    //   supplier_id:'',
    //   statusfilter:'',
    //   max_price: '',
    //   min_price: '',
    //   product_name: '',
    //   searchString: searchVal,
    //   from: null,
    //   to: null,
    //   user_id: commoncookie,
    //   pageCount: 0, 
    //   numPerPage:  pageSize
    // };
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      // dispatch(completedpaymentview(commoncookie,headerLocationId,data, setModalTypeHandler,setLoaderStatusHandler)),
      !createUser.length && dispatch(listUserCreationAction(setModalTypeHandler, setLoaderStatusHandler)),
      !app_config_data.length && dispatch(getAppConfigDataAction(setModalTypeHandler, setLoaderStatusHandler)),
      dispatch(consolidatedPayables(headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
      // !vendor.length && dispatch(listVendorAction(true, setModalTypeHandler, setLoaderStatusHandler)),
      // !stocklocation.length && dispatch(listStockLocationAction(commoncookie,headerLocationId,setModalTypeHandler,setLoaderStatusHandler)),
      // !chartOfAccounts.length && dispatch(listChartOfAccountsAction())
    );
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();
    dispatch(listPaymentTypeDetails())
    dispatch(listStockLocationAction(commoncookie, headerLocationId))
    dispatch(getMenuAccessAction(selectedRole))
    !company_logo?.length && dispatch(getCompanyLogo())
    // dispatch(customerAsCompanyAction())
  }, [headerLocationId]);


  const setpaymentOpen = (data) => {
    setPayData({ ...PayData, paymentOpen: data, Tdata: [] });
  };

  const setTdata = (data) => {
    setPayData({ ...PayData, Tdata: data });
  };

  const paymentValidate = (type, receiptDate, addAdvanceAmount) => {
    if (headerLocationId === 'null') {
      setOpenAlert(true)
      return
    }
    let paid_amount = Tdata.reduce(function (acc, obj) {
      return acc + +obj.payment_amount;
    }, 0);
    paid_amount = manualNoteSchemes.filter(i => i.selected).reduce((a, c) => a + +c.new_adjusted_amount, paid_amount)
    // }, getVendor.debitNote_balance);
    let due_paid_amount = Tdata.reduce(function (acc, obj) {
      return acc + +obj.due;
    }, 0);
    due_paid_amount = manualNoteSchemes.filter(i => i.selected).reduce((a, c) => a + +c.new_adjusted_amount, due_paid_amount)

    const payment_type = Tdata.filter((d) => d.payment_type)
      .map((d) => d.payment_type.split(' ')[0])
      .join(', ');

    let indiviTotal = paid_amount;
    const payables = selectionModel.filter(d => d.type === 'Invoice').map((d) => {
      const newObj = {...d};
      const sub = indiviTotal - (+d.originalRow.total - +d.originalRow.paid_amount);
      if (Math.sign(sub) === 1 || Math.sign(sub) === 0) {
        newObj.paid_amount = indiviTotal;
        newObj.payment_type = payment_type;

        let inventory = false;
        let status = d.originalRow.status ? d.originalRow.status : 'New';

        if (d.receive_goods === 'received') {
          // inventory = true
          status = 'Completed';
        }
        newObj.inventory = inventory;
        newObj.status = status;
        indiviTotal = sub;
      } else {
        newObj.paid_amount = indiviTotal;
        newObj.payment_type = payment_type;
        indiviTotal = 0;
      }
      newObj.receiving_id = d?.originalRow?.receiving_id;
      newObj.receivings_items = d?.originalRow?.receivings_items;
      return newObj;
    });



    // let ledgeramount = paid_amount > due_paid_amount ? due_paid_amount : paid_amount
    // const accountTransaction = [];
    //  chartOfAccounts.forEach((d) => {
    //   const {id, creditSign, debitSign} = d;
    //   const dd = {accountId: id, description: ""};
    //   if (Tdata.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id ).length) {
    //     let payables = Tdata.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id )?.[0] || {}

    //     dd.amount = creditSign * payables?.payment_amount || 0
    //     dd.description = "Payment Mode"

    //     accountTransaction.push(dd);
    //   }else if(Tdata.filter(f => f.ledger_id === id).length){
    //     dd.amount = debitSign * ledgeramount || 0
    //     dd.description = PayData?.getVendor?.company_name
    //     accountTransaction.push(dd);
    //   }
    // });
    let ledger = {
      location_id: headerLocationId,
      // specialNumber: '00',
      note: 'Purchase Payment',
      referenceNumber: Tdata.filter(i => 'paymentLedgerId' in i && 'ledger_id' in i),
      // voucherTypeId: 1,
      // accountTransaction: accountTransaction
    }

    ledger.receiving_id = payables.map((d) => d.receiving_id).join(',')

    const temp_manualNoteSchemes = manualNoteSchemes.filter(i => i.selected && i.advance_id === undefined).map(i => {
      const a = JSON.parse(i.used_for)
      const b = i.temp_used_for
      const c = JSON.stringify({ ...a, ...b })
      return {
        ...i,
        used_for: c
      }
    })

    const temp_advance = manualNoteSchemes.filter(i => i.selected && i.advance_id !== undefined).map(i => {
      const a = JSON.parse(i.used_for)
      const b = i.temp_used_for
      const c = JSON.stringify({ ...a, ...b })
      return {
        ...i,
        used_for: c
      }
    })

    const data = {
      payables,
      updateDebitNote: {
        manualNoteSchemes: temp_manualNoteSchemes,
        advanceledger: temp_advance,
        supplier_id: getVendor.supplier_id,
        supplier_ledger_id: getVendor.ledger_id,
        company_name: getVendor.company_name
      },
      receiptDataEntry: {
        purchase_id: ledger?.receiving_id,
        vendor_id: getVendor.supplier_id,
        payment_amount: Number(ledger?.referenceNumber[0]?.payment_amount),
        receiptDate: receiptDate
      },
      ledger,
      addAdvanceAmount: addAdvanceAmount.amount > 0 ? { ...addAdvanceAmount, location_id: headerLocationId } : null,
    };
    // return
    const callback = (response) => {
      // const cookies = new Cookies();

      let storage = getsessionStorage()
      let emp_id = storage?.employee_id || '';
      if (response) {
        // return
        setPayData({ Tdata: [], itemsData: [] });
        setgetPay([]);
        setNewOpen(false)
        setEditData({})
        const list = { ...exportValue(), ...{ pageCount: page || 0, numPerPage: pageSize }, };
        if (typeof data.location_id !== 'object') {
          data.location_id = headerLocationId;
        }
        dispatch(
          completedpaymentview(
            commoncookie,
            headerLocationId,
            list,
            setModalTypeHandler,
            setLoaderStatusHandler,
          ),
        );

        dispatch(consolidatedPayables(headerLocationId, setModalTypeHandler, setLoaderStatusHandler))

        dispatch(
          getLoginRoleAction(emp_id, (role_name, token, content) => {
            if (!roleType.includes(role_name)) {
              let notify_type = notificationType('purchase payment');
              let notify_content = content?.filter(
                (m) => m.notification_type === notify_type,
              );
              if (notify_content.length) {
                dispatch(getbyidPurchasesAction(data.payables[0].receiving_id, (res) => {
                  // const paymentData =
                  //   purchases.find(
                  //     (m) => m.receiving_id === data.payables[0].receiving_id,
                  //   ) || {};
                  const paymentData = res;

                  let paymentRefid = paymentData.user_id || '';
                  let vendorName = paymentData.company_name || '';
                  let amount_value = paid_amount > due_paid_amount ? due_paid_amount : paid_amount || '';
                  let locationName = paymentData.location_name || '';
                  let content_body = `${paymentRefid} \n${vendorName} \n ₹ ${amount_value} \n${locationName} `;
                  sendNtfy(token, notify_content[0]?.title, content_body);
                  dispatch(CreateNotificationAction({ content_body: content_body, title: notify_content[0]?.title, time: getDateTimeFormat(new Date()), "active": "1" }))

                }))
              }
            }
          }),
        );
      }
    }
    if (Object.keys(editData).length) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          updatePayablePaymentEntry(data, callback),
        )
      )
    } else {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          payablesPaymentEntry(data, null, null, callback),
        )
      )
    }

  };

  const AdvanceSubmit = (id, name, receiptDate) => {
    // console.log('11');
    
    if (headerLocationId === 'null') {
      setOpenAlert(true)
      return
    }
    const receiptData = Tdata.filter(i => 'paymentLedgerId' in i && 'ledger_id' in i);
    // const amount = receiptData[0].due;
    const amount = Number(advanceAmount ?? 0);
    const totalAmtInTData = receiptData.reduce((a, c) => a + +c.payment_amount, 0)

    if (amount !== totalAmtInTData) {
      return alert("Advance amount doesn't match with Total amount in table");
    }

    let supplierId = id
    let data = {
      receiptData : [{...receiptData[0], receiptDate}],
      supplierId,
      amount,
      name,
      location_id: headerLocationId,
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(PurchaseAdvanceEntry(data,
        (response) => {
          if (response === 200) {
            setNewOpen(false)
            setPayData({ Tdata: [], itemsData: [] });
            setgetPay([]);
            const list = { ...exportValue(), ...{ pageCount: page || 0, numPerPage: pageSize }, };
            if (typeof data.location_id !== 'object') {
              data.location_id = headerLocationId;
            }
            apiCalls(
              setModalTypeHandler,
              setLoaderStatusHandler,
              dispatch(
                completedpaymentview(
                  commoncookie,
                  headerLocationId,
                  list,
                  setModalTypeHandler,
                  setLoaderStatusHandler,
                ),
              ))
          }
        }))
    );
  }

  const NewHandleclose = (value) => {
    setNewOpen(value)
    setPayData({ Tdata: [], itemsData: [] });
    setLandingOpen(false)
    setgetPay([]);
    setEntryType('new')
    setEditData({})
    const list = { ...exportValue(), ...{ pageCount: page || 0, numPerPage: pageSize }, };
    dispatch(
      completedpaymentview(
        commoncookie,
        headerLocationId,
        list,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    );

    dispatch(consolidatedPayables(headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
    if(props.handleClose){
      props.handleClose()
    }
  }

  const commonMapping = (array, columnName) => {
    if (typeof array === 'object') {
      let Data = array.map((a) => a[columnName]);
      return Data;
    } else if (typeof array === 'string') {
      return array;
    }
  };

  const exportValue = () => {
    const { name, brand, category, location_id, supplier_id, statusfilter, max_price, min_price, payment_type } = filtedValue;

    const data = {
          from:
            from === null
              ? null
              : moment(from).format(
                'yyyy-MM-DD',
              ),
          to:
            from === null
              ? null
              : moment(to).format('yyyy-MM-DD'),
          user_id: commoncookie,
          location_id: location_id || headerLocationId,
          payment_type: payment_type || '',
          pageCount: 0,
          max_price: max_price || '',
          min_price: min_price || '',
          searchString: searchVal,
          export: false
    
        }
    return data;
  }

  useEffect(() => {

    // if (searchVal) {

    //   const body = {
    //     numPerPage: pageSize,
    //     pageCount: page,
    //     searchString: searchVal,
    //     employeeId: commoncookie,
    //     headerLocationId: headerLocationId
    //   };
    //   // apiCalls(
    //   //   context.setModalTypeHandler,
    //   //   context.setLoaderStatusHandler,
    //   //   this.props.searchPaginationAction(body)
    //   // );

    // } else {
    const data = { ...exportValue(), ...{ pageCount: page || 0, numPerPage: pageSize }, };
    if (typeof data.location_id !== 'object') {
      data.location_id = headerLocationId;
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(completedpaymentview(commoncookie, headerLocationId, data, setModalTypeHandler, setLoaderStatusHandler)),
    ).finally((res) => setIsApiFinished(true));

  }, [pageSize, page, headerLocationId])


  const handlePageSizeChange = async (size) => {
    setPageSize(size)
  }

  const handlePageChange = async (page) => {
    setPage(page)
  }

  const pendingPayment = (data) => {

    if (headerLocationId === 'null') {
      setOpenAlert(true)
      return
    }

    const {
      supplier_id,
      receivings_items: itemsData = [],
      paid_amount,
      receiving_id,
      status: oldStatus,
      receive_goods,
      total,
    } = data;
    dispatch(getSupplierDetailsByIdAction(data.supplier_id, (supplierDetails) => {
      const getVendor = supplierDetails || {};

      const getPay = purchase_outstanding.filter(
        (d) => d.supplier_id === supplier_id,
      )[0]?.childRow;

      dispatch(getManualNoteSchemesByIdAction('supplier', data.supplier_id, (response) => {
        setManualNoteSchemes(response.map(i => ({ ...i, selected: false })))

        setPayData({
          ...PayData,
          itemsData,
          getVendor,
          paid_amount: +paid_amount,
          receiving_id,
          oldStatus,
          receive_goods,
          total: +total,
          paymentOpen: true,
        });
        setstatus('edit');
        setgetPay(getPay);

      }));

    }))

  };

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

  useEffect(() => {
    getAppConfigData();
  }, [app_config_data]);

  const createMail = () => {
    const custData = getVendor;

    let data = {
      custData,
      appConfigData: appConfigData,
      invoice_number: edit_data.po_number,
      sales_items: edit_data.receivings_items,
      email: custData.email,
      custType: 'VENDOR',
    };

    dispatch(sendMail(data, setModalTypeHandler, setLoaderStatusHandler));
    setDopen(false);
  };

  const cancelSearch = (e) => {
    // const context = this.context;
    // this.setState({searchData: [], searchPageData: [], page: 0, searchVal: ''});

    // const body = {
    //   pageCount:0,
    //   numPerPage: pageSize,
    //   searchString:"",
    //   employee_id: context.commoncookie,
    //   headerLocationId: context.headerLocationId,
    //   from: null,
    //   to: null
    // }
    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   this.props.listManualNotesPaginationAction(body),
    // )
    setSearchval('')
    const data = { ...exportValue(), searchString: '', ...{ pageCount: 0, numPerPage: pageSize }, };
    if (typeof data.location_id !== 'object') {
      data.location_id = headerLocationId;
    }

    dispatch(set_completedpaymentview({data : [], numRows : 0}))

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(completedpaymentview(commoncookie, headerLocationId, data, setModalTypeHandler, setLoaderStatusHandler)),
    );
  };

  // const requestSearch = (e) => {
  //   let val = e.target.value;
  //    setSearchval(val)
  //   setPage(0)
  //   const data = { ...exportValue(), searchString: val, ...{ pageCount: 0, numPerPage: pageSize }, };
  //   if (typeof data.location_id !== 'object') {
  //     data.location_id = headerLocationId;
  //   }

  //     apiCalls(
  //       setModalTypeHandler,
  //       setLoaderStatusHandler,
  //       dispatch(completedpaymentview(commoncookie,headerLocationId,data, setModalTypeHandler,setLoaderStatusHandler)),
  //     );


  // };

  const requestSearch = (e) => {
    let val = e.target.value;
    setSearchval(val)
    const data = { ...exportValue(), searchString: val, ...{ pageCount: 0, numPerPage: pageSize }, };
    
    if (typeof data.location_id !== 'object') {
      data.location_id = headerLocationId;
    }
    
    if(val.length >= 3 || val.length === 0) {
      setPage(0)
      dispatch(set_completedpaymentview({data : [], numRows : 0}))
    }

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(get_completedpaymentview(commoncookie, headerLocationId, data, setModalTypeHandler, setLoaderStatusHandler)),
    );

  };

  const handleChange = async (data) => {
    var date_val = data.target.value._d;
    // await this.setState({[data.target.name]: date_val});
    let inputval = data.target.name
      if(data.target.name === 'dateRange'){
      var date_val = data.target.value;
      var date_val1 = data.target.value1;
      var date_val2 = data.target.value2;
      console.log(date_val,'date_val1',date_val1)
      await setFrom(date_val)
      await setTo(date_val1)
      await setDateRange(date_val2)
    }
    else if (inputval === 'from') {
      setFrom(date_val)
    } else {
      setTo(date_val)
    }

    if (moment(from, 'year') <= moment(to, 'year')) {
      if (moment(from, 'month') <= moment(to, 'month')) {
        if (moment(from, 'day') <= moment(to, 'day')) {
          // this.setState({errormsg: {from: '', to: ''}}); // balancesheet_data: filterData ,
          seterrormsg({ from: '', to: '' })
        } else {
          // this.setState({
          //   errormsg: {
          //     ...this.state.errormsg,
          //     [data.target.name]: 'Invalid Date 1',
          //   },
          // });
          seterrormsg({ ...errormsg, inputval: 'Invalid Date 1' })
        }
      } else {
        // this.setState({
        //   errormsg: {
        //     ...this.state.errormsg,
        //     [data.target.name]: 'Invalid Date 2',
        //   },
        // });
        seterrormsg({ ...errormsg, inputval: 'Invalid Date 2' })
      }
    } else {
      // this.setState({
      //   errormsg: {
      //     ...this.state.errormsg,
      //     [data.target.name]: 'Invalid Date 3',
      //   },
      // });
      seterrormsg({ ...errormsg, inputval: 'Invalid Date 3' })
    }
  };

  const handleFilterClose = (data) => {
    // this.setState({ filterOpen: data, open: false, rowPopup : {open:false}})
    // this.setState({
    //   filterOpen: data,
    //   open: false,
    //   dialog: false,
    //   delete: false,
    //   rowPopup: {open: false, rowIndex: ''},
    //   status: '',
    // });
    setFilterOpen(data)
    setrowpopup({ open: false, rowIndex: '' })
    !vendorIdAndName.length && dispatch(listVendorIdAndNameAction(setModalTypeHandler, setLoaderStatusHandler))
    !stocklocation.length && dispatch(listStockLocationSequenceAction(
      { sequence_type: 'PO' },
      null,
      commoncookie,
      headerLocationId,
    ));
    !inventory_product.length && dispatch(InventoryProductAction(setModalTypeHandler, setLoaderStatusHandler))

  };
  const ApplyButton = async (formValue) => {
    setSearchval('')
    setFiltedValue(formValue)
    const data = {
      from: formValue.from ? formValue.from : null,
      to: formValue.to ? formValue.to : null,
      payment_type: formValue.payment_type ? formValue.payment_type : '',
      min_price: formValue.min_price ? formValue.min_price : '',
      max_price: formValue.max_price ? formValue.max_price : '',
      user_id: 1145,
      location_id: formValue.location_id ? formValue.location_id : headerLocationId,
      pageCount: 0,
      searchString: "",
      numPerPage: pageSize
    };

    setPage(0);

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      dispatch(completedpaymentview(commoncookie, headerLocationId, data, setModalTypeHandler, setLoaderStatusHandler)),
    );
    setFilterOpen(false)
  };

  const clearButton = () => {
    let firstDay = null;
    let lastDay = null;
    const data = {
      brand: "",
      category: "",
      location_id: "null",
      supplier_id: "",
      statusfilter: "",
      max_price: "",
      min_price: "",
      product_name: "",
      searchString: "",
      from: null,
      to: null,
      user_id: commoncookie,
      pageCount: 0,
      numPerPage: 20
    }

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(completedpaymentview(commoncookie, headerLocationId, data, setModalTypeHandler, setLoaderStatusHandler)),
    ).finally((res) => setIsApiFinished(true));
    setFiltedValue({
      name: '',
      brand: '',
      category: '',
      location_id: 'null',
      supplier_id: '',
      statusfilter: '',
      max_price: '',
      min_price: '',
    })
    setFrom(firstDay)
    setTo(lastDay)
    setFilterOpen(false)
  };

  const filterHandler = (name, value) => {
    setFiltedValue({ ...filtedValue, name: value })
  };

  const handleClose = () =>{
     setScheduleOpen(false)
  }

  const Deletedhandle = (deletePaymentId) => {
    setLandingOpen(false)
      console.log('deletedata', deletedata)
      setPaymentDetailOpen(false)
      setPaymentDetailOpenForSmallerScreen(false)
      setPaymentData('')
      const data = { ...exportValue(), ...{ pageCount: page || 0, numPerPage: pageSize }, };
      if (typeof data.location_id !== 'object') {
        data.location_id = headerLocationId;
      }
      let receiptId = { receipt_id : deletedata.receipt_id || deletePaymentId}
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(deleteReceipts(receiptId,'Payments', (response) => {
          if (response === 200) {
            apiCalls(
              setModalTypeHandler,
              setLoaderStatusHandler,
              dispatch(
                completedpaymentview(
                  commoncookie,
                  headerLocationId,
                  data,
                  setModalTypeHandler,
                  setLoaderStatusHandler,
                ),
              ).finally((res) => {
      setIsApiFinished(true);
      setLandingOpen(false); 
      setClick(false) 
      console.log(landingOpen,'checkthestate')
    })
  
            );
          }
        })))
        setDeleteDialogOpen(false)
        setLandingOpen(false)
        }

    const getConfigValue = (key) => {
      const item = app_config_data?.find(f => f.key_name === key)
      return item?.value || ''
    }

    const numberToWordsUtil = (num) => {
      const a = [
        '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
        'Seventeen', 'Eighteen', 'Nineteen'
      ]
      const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
      const numToWords = (n) => {
        if (n < 20) return a[n]
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '')
        if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + numToWords(n % 100) : '')
        if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '')
        if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '')
        return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '')
      }
      if (!num || isNaN(num)) return ''
      return numToWords(Math.floor(Number(num))) + ' Only'
    }

    const handleVoucherPdfClick = async (rowData) => {
      try {
        setVoucherPdfNumber(rowData.receipt_number || '')

        const res = await Salesservice.getReceiptsById(rowData.id, 'Payments')
        const data = res.data?.data || res.data

        const receipt = data?.receiptDetails?.[0] || {}
        const cust = data?.cust?.[0] || {}
        const receipts = data?.receipts || []
        const totalAmount = receipts.reduce((sum, r) => sum + Number(r?.payment_amount || 0), 0)

        const payload = {
          company: {
            name: getConfigValue('company.name'),
            address: getConfigValue('address.fulladdress'),
            city: getConfigValue('address.city'),
            state: getConfigValue('address.state'),
            zip: getConfigValue('address.pincode'),
            gstin: getConfigValue('company.gstin/uin'),
            phone: getConfigValue('company.mobile'),
            email: getConfigValue('company.email'),
            logo: company_logo?.[0]?.image || '',
          },
          document: {
            title: 'PAYMENT VOUCHER',
            number: receipt.receipt_number || '',
            date: receipt.receipt_date || '',
            party_label: 'Paid To',
          },
          party: {
            name: (cust.company_name || '').toUpperCase(),
            address: [cust.address, cust.area].filter(Boolean).join(', '),
            city: cust.city || '',
            state: cust.state || '',
            zip: cust.zip || '',
            gstin: cust.tax_id || '',
            phone: cust.phone || '',
          },
          payment: {
            mode: (data?.receiptDetails || []).map(d => d.payment_type).filter(Boolean).join(', '),
            reference: receipt.reference || '',
            amount_in_words: numberToWordsUtil(totalAmount),
            note: receipt.note || '',
            entry_date: receipt.entry_date || '',
            currency: '₹',
            total_amount: totalAmount.toFixed(2),
          },
          items: receipts.map((r, i) => ({
            index: i + 1,
            doc_number: r.invoice_number || 'Advance',
            doc_date: r.invoice_date || '',
            doc_amount: r.total ? Number(r.total).toFixed(2) : '',
            due_amount: r.due_amount ? Number(r.due_amount).toFixed(2) : '',
            paid_amount: r.payment_amount ? Number(r.payment_amount).toFixed(2) : '',
          })),
        }

        const renderRes = await docTemplateService.renderPreview({
          document_type: 'payment_voucher',
          paper_size: 'A4_portrait',
          output_type: 'print',
          location_id: rowData.location_id || headerLocationId,
          company_id: storage.company_id,
          payload,
        })

        if (renderRes.data?.pdfBase64) {
          setVoucherPdfBase64(renderRes.data.pdfBase64)
          setVoucherPdfOpen(true)
        }
      } catch (err) {
        console.error('Payment Voucher PDF error:', err)
      }
    }

    const handleRowClick = async (rowData, internalCall, initialCall) => {
      // OPEN UI FIRST
      // if (!internalCall) {
      //   setPaymentDetailOpen(true)
      // } else if (!initialCall) {
      //   setPaymentDetailOpenForSmallerScreen(true)
      // }

      setRowData(rowData)
      setLandingOpen(true)

      const index = completed_purchase_outstanding.findIndex(
        item => item.id === rowData.id
      )
      setRowDataIndex(index)

      // THEN FETCH DATA
      const id = rowData.id
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(getReceiptsByIdAction(id, 'Payments'))
      )
    }

  const handlePayementDelete = () => {
    if (!headerLocationId || headerLocationId === 'null') {
      setOpenAlert(true)
      return
    }
    setDeleteDialogOpen(true)
    setdeleteData(rowData)
  }

  // useEffect(() => {
  //   dispatch(setReceiptsByIdAction({}))
  //   if(completed_purchase_outstanding && completed_purchase_outstanding?.length > 0) {
  //     handleRowClick(completed_purchase_outstanding[0], !isLargerScreen, true)
  //   }
  // }, [completed_purchase_outstanding])

  useEffect(() => {
    if(rowDataIndex !== null){
      const indexedRowData = completed_purchase_outstanding[rowDataIndex]
      handleRowClick(indexedRowData, true)
    }
  }, [rowDataIndex])
  
  const handlePaymentEdit = () => {
    if (!headerLocationId || headerLocationId === 'null') {
      setOpenAlert(true)
      return
    }
    setEntryType('edit')
    setEditData(rowData)
    setNewOpen(true)
  }

  const handleVendorDetail = async (data) => {
    const supplierIndex = customerAsCompany.findIndex(c => c.supplier_id === data.supplier_id);
    let openData = {
      rowIndex: supplierIndex,
      sales_customer_id: data.supplier_id,
      routeFrom: "PAYABLES",
      payable: "payables",
      mail_configuration: mail_configuration,
      setOnbackClick: false,
      backToSales: handleVendorDetailClose,
      purchaseOrder: "purchaseOrder"
    };
    setVendorDetails(openData)
    setOpenVendorDetails(true)
  }

  const handleVendorDetailClose = () => {
    setOpenVendorDetails(false)
  }

  const exportExcel = (cols, data, filename) => {
  // Create worksheet from data
  const wsData = data.map(row => {
    const obj = {};
    cols.forEach(col => {
      obj[col.title] = row[col.field];
    });
    return obj;
  });

  const ws = XLSX.utils.json_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

    const paymentCreate = UserRightsAuthorization(menuAccess[selectedRole], 'purchases__payments', 'can_create')
    const paymentExport = UserRightsAuthorization(menuAccess[selectedRole], 'reports__transactions__payments_report', 'can_export')

  return (
    <>
      {openVendorDetails === true ? (
         OpenCustomerLandingPage(vendorDetails)
       ) :
       <>
       
       <Helmet>
         <meta charSet="utf-8" />
         <title> {titleURL} | Payments </title>
       </Helmet>
         <AlertDialog
               delete={isDeleteDialogOpen}
               handleDelete={Deletedhandle}
               handleClose={() => setDeleteDialogOpen(false)}
             ></AlertDialog>

             {
               !landingOpen &&
               <Grid container spacing={1}>
                 <Grid size={12}>
                   {
                     newopen === false &&
                       <CreateNewButtonContext.Consumer>
                         {({ loaderStatus }) => (
                           <div style={{height: 'calc(100vh - 80px)'}}>
                             {/*             
                           <Typography variant='h6'>Payments</Typography>
                           <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} style={{ paddingTop: '15px' }}>
                               <Grid spacing={7} container direction='row' display='flex' justifyContent='flex-end'>
                                 <Grid
                                  
                                 >
                                   <AddIcon sx={{ cursor: 'pointer', align: 'right' }} onClick={() => setNewOpen(true)} />
                                 </Grid>
                               </Grid>
                             </Grid>
                         <br/> */}
                         
                         <style>
                           {`
                             ::-webkit-scrollbar {
                               width: 6px !important;
                               height: 6px !important;
                             }

                             ::-webkit-scrollbar-thumb {
                               background-color: rgba(100, 100, 100, 0.7) !important;
                               border-radius: 6px !important;
                             }

                             ::-webkit-scrollbar-track {
                               background: transparent !important;
                             }
                               .MuiToolbar-root .MuiButtonBase-root[title="Export"] {
                               padding-top: 4px;
                               padding-bottom: 0;
                             }
                           `}
                         </style>

                             <MaterialTable
                               style={{height: 'calc(100vh - 91px)'}}
                               totalCount={purchasesByPaginationCount1}
                               components={{
                                ...stickyTableComponents,
                                Pagination: (props) => (
                                  <TablePagination
                                    {...props}
                                    count={Number(purchasesByPaginationCount1)} // Force the total count here
                                    page={page}
                                    onPageChange={(e, newPage) => setPage(newPage)}
                                    onRowsPerPageChange={(e) => {
                                      setPageSize(parseInt(e.target.value, 10));
                                      setPage(0);
                                    }}
                                  />
                                ),
                                 Toolbar: (props) => (
                                   <div
                                     style={{
                                       display: 'flex',
                                       width: '100%',
                                       alignItems: 'center',
                                     }}
                                   >
                                     
                                     <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                                       <Box sx={{ width: '100%', '& button[aria-label="Export"]': { mt: '10px' } }}>
                                       <MTableToolbar {...props} />
                                       </Box>
                                       <CommonSearch
                                         searchVal={searchVal}
                                         cancelSearch={cancelSearch}
                                         requestSearch={requestSearch}
                                       />
                                       {/* <TextField
                                                     autoFocus={this.state.searchVal ? true : false}
                                                     sx={{
                                                       borderRadius: '8px',
                                                       pr: '10px',
                                                       '& .MuiOutlinedInput-root': {
                                                         height: '42px',
                                                       },
                                                     }}
                                                     InputProps={{
                                                       startAdornment: (
                                                         <InputAdornment position='start'>
                                                           <SearchIcon />
                                                         </InputAdornment>
                                                       ),
                                                       endAdornment: (
                                                         <InputAdornment position='end'>
                                                           <ClearIcon
                                                             onClick={this.cancelSearch}
                                                             sx={{cursor: 'pointer'}}
                                                           />
                                                         </InputAdornment>
                                                       ),
                                                     }}
                                                     placeholder='Search'
                                                     value={this.state.searchVal}
                                                     onChange={this.requestSearch}
                                                   /> */}
                                     </div>
                                   </div>
                                 ),
                                 ExportButton: (props) => (
                                   <div style={{ display: 'flex', alignItems: 'center' }}>
                                     <props.exportButton {...props} style={{ minHeight: 'unset' }} />
                                   </div>
                                 )
                               }}

                               actions={[
                                 {
                                   // icon: () => (
                                   //   <div style={{ display: 'flex' }}>
                                   //     <FilterPurchases
                                   //       fromTo={true}
                                   //       from={from}
                                   //       to={to}
                                   //       dateRange = {dateRange}
                                   //       stocklocation={stocklocation}
                                   //       // product={this.props.product}
                                   //       vendor={vendorIdAndName}
                                   //       statusfilter={purchases}
                                   //       inventory_product={inventory_product}
                                   //       handleChange={handleChange}
                                   //       handleFilterClose={handleFilterClose}
                                   //       open={filterOpen}
                                   //       ApplyButton={ApplyButton}
                                   //       clearButton={clearButton}
                                   //       filterHandler={filterHandler}
                                   //       filtedValue={filtedValue}
                                   //       setFiltedValue={setFiltedValue}
                                   //     />
                                   //   </div>
                                   // ),
                                   icon: () => <FilterAlt />,
                                   tooltip: 'Filter',
                                   isFreeAction: true,
                                   onClick: () => {
                                     setFilterOpen(true)
                                   }
                                 },
                                 ...(isReportPage
                                   ? [
                                       {
                                         icon: () => (
                                           <IconButton onClick={() => setScheduleOpen(true)}>
                                             <ScheduleIcon />
                                           </IconButton>
                                         ),
                                         tooltip: 'Schedule',
                                         isFreeAction: true,
                                       },
                                       {
                                         icon: () => (
                                           <IconButton onClick={() => setOpen(true)}>
                                             <ShareIcon />
                                           </IconButton>
                                         ),
                                         tooltip: 'Share',
                                         isFreeAction: true,
                                       },
                                     ]
                                   : []),
                                 ...(!isReportPage && paymentCreate
                                   ? [
                                     {
                                       icon: 'add',
                                       tooltip: 'Add',
                                       isFreeAction: true,
                                       onClick: (event, rowData) => {
                                         if (!headerLocationId || headerLocationId === 'null') {
                                           setOpenAlert(true);
                                           return;
                                         }
                                         setNewOpen(true);
                                       },
                                     },
                                   ]
                                   : []),
                                 // {
                                 //   icon: 'edit',
                                 //   tooltip: 'edit',
                                 //   position: 'row',
                                 //   onClick: (event, rowData) => {
                                 //     if (!headerLocationId || headerLocationId === 'null') {
                                 //       setOpenAlert(true);
                                 //       return;
                                 //     }
                                 //     setNewOpen(true)
                                 //     setEditData(rowData)
                                 //   }
                                 // },

                                 // {
                                 //   icon: 'edit',
                                 //   tooltip: 'edit',
                                 //   position: 'row',
                                 //   onClick: (event, rowData) =>
                                 //     this.handleEdit(rowData.id),
                                 // },
                                   //   {
                                   //   icon: 'delete',
                                   //   tooltip : 'delete',
                                   //   onClick: (event, rowData) => {
                                   //     if (!headerLocationId || headerLocationId === 'null') {
                                   //       setOpenAlert(true);
                                   //       return;
                                   //     }
                                   //     setDeleteDialogOpen(true)
                                   //     setdeleteData(rowData)
                                   //   }

                                   // },
                               ]}
                               page={page}
                               onPageChange={(page) => handlePageChange(page)}
                               onRowsPerPageChange={(size) => handlePageSizeChange(size)}
                               onRowClick = {!isReportPage ? (event, rowData) =>{handleRowClick(rowData)} : undefined}
                               options={getStickyTableOptions({
                                   headerStyle,
                                    bodyOffset: 200,
                                options:{
                                    cellStyle,
                                    showEmptyDataSourceMessage: isApiFinished,
                                 //selection: true,
                                   exportButton: paymentExport ? true : false,
                                 filtering: false,
                                 actionsColumnIndex: -1,
                                 maxBodyHeight: maxBodyHeight,
                                 minBodyHeight: maxBodyHeight,
                                paging: true,
                                 pageSize: pageSize,
                                 pageSizeOptions: [20, 50, 100],
                                //  totalCount: purchasesByPaginationCount1,
                                //  initialPage: currentPage,
                                 search: false,
                                  tableLayout: "auto",
                                  toolbar: true,
                                //  overflowY: 'auto',
                                 ...(!isReportPage ? {
                                   rowStyle: (row) => ({
                                     backgroundColor: rowData.id === row.tableData.id ? '#D5DEF9' : '#FFFFFF',
                                     height: '40px'
                                   })
                                 }: {}),
                                 
                                 ...(isReportPage
                                   ? {
                                       exportMenu: paymentExport ? [
                                                               // {
                                                               //   label: 'Export PDF',
                                                               //   exportFunc: (cols, datas) =>
                                                               //     ExportPdf(cols, completed_purchase_outstanding, 'Payment Reports'),
                                                               // },
                                                               {
                                                                 label: 'Export CSV',
                                                                 exportFunc: (cols, dta) =>
                                                                   ExportCsv(cols, completed_purchase_outstanding, 'Payment Reports'),
                                                               },
                                                             ] : [],
                                     }
                                   : {}),
                                },
                               })}
                               columns={[
                                 {
                                   title: 'Voucher#',
                                   field: 'receipt_number',
                                   width: !isReportPage ?  '10%' : '',
                                   render: (rowData) => (
                                     <div
                                       style={{
                                         textDecoration: 'none',
                                         cursor: 'pointer',
                                         color: '#03adfc',
                                         display: 'inline-block',
                                       }}
                                       onClick={(event) => {
                                         event.stopPropagation()
                                         handleVoucherPdfClick(rowData)
                                       }}
                                     >
                                       {rowData.receipt_number}
                                     </div>
                                   )
                                 },
                                 {
                                   title: 'Vendor',
                                   field: 'company_name',
                                   width: !isReportPage ? '15%' : '15%',
                                   render: (rowData) => (<>
                                     {
                                       <div>
                                       <List component='nav' aria-label='main mailbox folders' disablePadding>
                                         <ListItem sx={{ pl: 0, py: 0 }}>
                                           <ListItemIcon  sx={{ minWidth: 30 }}>
                                             {rowData.customer_type === '0' ? (
                                               <PersonIcon />
                                             ) : (
                                               <BusinessIcon />
                                             )}
                                           </ListItemIcon>
                                           <ListItemText primary={<span style={{ fontSize: cellStyle.fontSize, fontWeight: cellStyle.fontWeight }} >
                                                       <Link
                                                         onClick={(event) => {
                                                           event.stopPropagation();
                                                           handleVendorDetail(rowData);
                                                         }}
                                                         style={{
                                                           textDecoration: 'none',
                                                           cursor: 'pointer',
                                                           color: '#03adfc',
                                                           display: 'inline-block',
                                                         }}
                                                       >
                                                         {rowData.company_name}
                                                       </Link>
                                           </span>} />
                                         </ListItem>
                                       </List>
                                     </div>
                                   }
                                 </>
                                 ),
                                 },
                                 ...(isReportPage ? [
                                   {
                                     title: 'Invoice Adjusted',
                                     field: 'invoiceNumber_report',
                                     width: '15%'
                                   },
                                 ] : []),
                                 {
                                   title: 'Date',
                                   field: 'receipt_date',
                                   width: !isReportPage ? '10%' : ''
                                 },
                                 ...(isReportPage ? [
                                   {
                                     title: 'Location',
                                     field: 'location_name',
                                     width: '10%'
                                   },
                                 ] : []),
                                 {
                                   title: 'Reference',
                                   field: 'reference',
                                   width: !isReportPage ? '12%' : '12%'
                                 },
                                 {
                                   title: 'Note',
                                   field: 'note',
                                   width: !isReportPage ? '30%' : '15%',
                                   render: (rowData) => rowData.note ?? ''
                                 },
                                 {
                                   title: 'Amount',
                                   field: 'paid_amount',
                                   width: !isReportPage ? '10%' : '',
                                   // align: 'right', 
                                   // cellStyle: {
                                   //   textAlign: 'right',
                                   //   paddingRight: '10px',
                                   //   fontSize: cellStyle.fontSize
                                   // },
                                   render: (rowData) => (
                                     <div
                                       style={{
                                         textAlign: 'right',
                                         minWidth: '60px',
                                         maxWidth: '80px',
                                         width: '100%',
                                         overflow: 'hidden',
                                         textOverflow: 'ellipsis',
                                         whiteSpace: 'nowrap',
                                       }}
                                     >
                                       {rowData.paid_amount ? rowData.paid_amount.toFixed(2) : ''}
                                     </div>
                                   ),
                                 },
                                 {
                                   title: 'Advance Paid',
                                   field: 'advancePaidAmount',
                                   width: !isReportPage ? '10%' : '10%',
                                   // align: 'right', 
                                   // cellStyle: {
                                   //   textAlign: 'right',
                                   //   paddingRight: '10px',
                                   //   fontSize: cellStyle.fontSize
                                   // },
                                   render: (rowData) => (
                                     <div
                                       style={{
                                         textAlign: 'right',
                                         minWidth: '60px',
                                         maxWidth: '80px',
                                         width: '100%',
                                         overflow: 'hidden',
                                         textOverflow: 'ellipsis',
                                         whiteSpace: 'nowrap',
                                       }}
                                     >
                                       {rowData.advancePaidAmount === 0 ? '' : rowData.advancePaidAmount.toFixed(2)}
                                     </div>
                                   ),
                                 },
                                 ...(isReportPage ? [
                                   {
                                     title: 'Payment Method',
                                     field: 'paymentName',
                                     width: '12%'
                                   },
                                   {
                                     title: 'Entry Date',
                                     field: 'entry_date',
                                     width: '8%'
                                   },
                                   {
                                     title: 'Entry Time',
                                     field: 'entry_time',
                                     width: '8%'
                                   },
                                 ] : []),
                               
                               ]}
                               data={
                                 completed_purchase_outstanding
                               }
                               title={
                                 isReportPage ?
                                   <Typography variant='h6' align='left' style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                                     {/* <Link href='/report' underline="hover">Home</Link> / Payments */}
                                     <Box style={{ display: 'flex' }}>
                                       <Box sx={{ color: '#0A8FDC', cursor: 'pointer', fontSize: '12px', fontWeight: 400, '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate('/report')}>Home</Box>
                                       &nbsp;/&nbsp;Payments
                                     </Box>
                                   </Typography>
                                 : <Typography variant='h6' align='left' style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                                     Payments
                                   </Typography>
                               }
                             />
                             <ReceiptPaymentFilter
                               open={filterOpen}
                               handleApply={ApplyButton}
                               handleClose={() => setFilterOpen(false)}
                               stockLocation={stocklocation}
                               listPaymentType={list_payment_type}
                             />
                             {/* <TableContainer component={Paper}>
                             <Table aria-label='collapsible table'>
                               <TableHead>
                                 <TableRow>
                                 <TableCell />
                                   <TableCell>Vendor Name</TableCell>
                                   <TableCell align='right'>No.of Bills</TableCell>
                                   <TableCell align='right'>Total</TableCell>
                                 </TableRow>
                               </TableHead>
                               <TableBody>
                                 {completed_purchase_outstanding.map((row,i) => (
                                   <Row
                                     key={i}
                                     pendingPayment={pendingPayment}
                                     setedit_data={handleEdit}
                                     row={row}
                                     handleMailConfiguration={handleMailConfiguration}
                                   />
                                 ))}
                               </TableBody>
                             </Table>
                           </TableContainer> */}
                             {/* {!completed_purchase_outstanding.length && loaderStatus === false && (
                             <NoRecordFound />
                           )} */}


                             <InvoiceDialog
                               appConfigData={appConfigData}
                               createMail={createMail}
                               custData={getVendor}
                               custType={'VENDOR'}
                               invoice={edit_data.po_number}
                               soDate={edit_data.receiving_time}
                               sales_items={edit_data.receivings_items}
                               open={Dopen}
                               handleClose={() => setDopen(false)}
                               mail_configuration={mail_configuration}
                               tableHandleClose={() => { }}
                             />


                           </div>
                         )}
                       </CreateNewButtonContext.Consumer>
                   }
                 </Grid>

                   {/* {
                     newopen === false && !isReportPage && completed_purchase_outstanding && completed_purchase_outstanding?.length > 0 && isLargerScreen &&
                     <Grid size={5}>
                           <ReceiptsLanding
                             handleDelete = {handlePayementDelete}
                             handleEdit = {handlePaymentEdit}
                             type='Payments'
                             rowData={rowData}
                           />
                     </Grid>
                   } */}
               </Grid>
             }

             { landingOpen && !newopen &&
               <ReceiptsLanding
                 handleDelete={handlePayementDelete}
                 handleEdit={handlePaymentEdit}
                 type={rowData?.isRefund === 1 ? 'Vendor Refund' : 'Payments'}
                 rowData={rowData}
                 onClose={() => { setClick(false); setLandingOpen(false); }}
                 onPrev={() => setRowDataIndex(rowDataIndex - 1)}
                 onNext={() => setRowDataIndex(rowDataIndex + 1)}
                 prevDisabled={rowDataIndex === 0}
                 nextDisabled={rowDataIndex === completed_purchase_outstanding.length - 1}
               />
             }

       {newopen === true &&
         // <NewPayments
         //   pendingPayment={pendingPayment}
         //   type={1}
         //   handleClose={NewHandleclose}
         //   getPay={getPay}
         //   status={status}
         //   setSelectionModel={setSelectionModel}
         //   entryvalue={entryvalue}
         //   handleEntry={setHandleEntry}
         //   selectionModel={selectionModel}
         //   received_amount={paid_amount}
         //   handleSubmit={paymentValidate}
         //   custType={'VENDOR'}
         //   Tdata={Tdata}
         //   setTdata={setTdata}
         //   custData={getVendor}
         //   sales_items={itemsData}
         //   paymentOpen={paymentOpen}
         //   setpaymentOpen={setpaymentOpen}
         //   responseType={'cashOut'}
         //   manualNoteSchemes={manualNoteSchemes}
         //   setManualNoteSchemes={setManualNoteSchemes}
         // />
         // <PaymentDialog
         //   getPay={getPay}
         //   status={status}
         //   setSelectionModel={setSelectionModel}
         //   entryvalue={entryvalue}
         //   handleEntry={setHandleEntry}
         //   selectionModel={selectionModel}
         //   received_amount={paid_amount}
         //   handleSubmit={paymentValidate}
         //   custType={'VENDOR'}
         //   Tdata={Tdata}
         //   setTdata={setTdata}
         //   custData={getVendor}
         //   sales_items={itemsData}
         //   paymentOpen={newopen}
         //   setpaymentOpen={setNewOpen}
         //   responseType={'cashOut'}
         //   manualNoteSchemes={manualNoteSchemes}
         //   setManualNoteSchemes={setManualNoteSchemes}
         //   type={1}
         //   PayData={PayData}
         //   setPayData={setPayData}
         //   setstatus={setstatus}
         //   setgetPay={setgetPay}
         //   handleClose={NewHandleclose}
         //   AdvanceSubmit={AdvanceSubmit}
         //   editData={editData}
         //   setAdvanceAmount={setAdvanceAmount}
         // />
         <ReceiptPayments
           paymentOpen={newopen}
           inline
           custType = 'VENDOR'
           handleClose={NewHandleclose}
           editData={editData}
           responseType={'cashOut'}
           sales_items={itemsData}
           selectedInvoice={null}
           selectedCustomer={{}}
           entryType = {entryType}
         />
       }
       <PaymentDialog
         getPay={getPay}
         status={status}
         setSelectionModel={setSelectionModel}
         entryvalue={entryvalue}
         handleEntry={setHandleEntry}
         selectionModel={selectionModel}
         received_amount={paid_amount}
         handleSubmit={paymentValidate}
         custType={'VENDOR'}
         Tdata={Tdata}
         setTdata={setTdata}
         custData={getVendor}
         sales_items={itemsData}
         paymentOpen={paymentOpen}
         setpaymentOpen={setpaymentOpen}
         responseType={'cashOut'}
         manualNoteSchemes={manualNoteSchemes}
         setManualNoteSchemes={setManualNoteSchemes}
       />
       <LocationAlert open={openAlert} onClose={() => setOpenAlert(false)} />

         <Dialog open={scheduleOpen} onClose={() => setScheduleOpen(false)}>
           <CommonSchedule
             report_name="Payment Report"
             handleClose={() => setScheduleOpen(false)}
             open={scheduleOpen}
             columns={Schedulecolumns}
           />
         </Dialog>

         <Dialog open={open}>
           <ShareReport
           report_name  = {'Payment Report'}
           handleClose = {()=> setOpen(false)}
           open={open}
           columns = {Schedulecolumns}
           data = {completed_purchase_outstanding}
           fromDate = {moment(from, 'year', 'month', 'day').format('yyyy-MM-DD')}
           toDate = {moment(to, 'year', 'month', 'day').format('yyyy-MM-DD')}
         />
         </Dialog>
         </>
      }

      <VoucherPdfDialog
        open={voucherPdfOpen}
        onClose={() => { setVoucherPdfOpen(false); setVoucherPdfBase64(''); }}
        pdfBase64={voucherPdfBase64}
        voucherNumber={voucherPdfNumber}
        title={voucherPdfNumber}
      />
    </>
  );
}