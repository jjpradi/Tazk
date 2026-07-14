import React, { useEffect, useState, useRef, useContext } from 'react';
// import PropTypes from 'prop-types';
import { Box, Grid, CardContent, Card, Chip, Dialog, DialogTitle, DialogActions, DialogContent, List, ListItem, ListItemIcon, ListItemText, Link, useTheme, useMediaQuery } from '@mui/material';
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
import HomeIcon from '@mui/icons-material/Home';
import  "../../../index.css"
import {
  SalesAdvanceEntry,
  deleteReceipts,
  getReceiptsByIdAction,
  get_searchcompletedSalesOutstandingAction,
  listSalesOutstandingAction,
  listcompletedSalesOutstandingAction,
  sendMail,
  setReceiptsByIdAction,
  set_searchcompletedSalesOutstandingAction,
  updateReceiptEntry,
} from '../../../redux/actions/sales_actions';
// import { Alert } from '@mui/material';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import {
  listSalesAction,
  receiptEntry,
  consolidatedReceivings,
} from '../../../redux/actions/sales_actions';
import { listCustomerAction, getbyidCustomerAction, customerAsCompanyAction } from '../../../redux/actions/customer_actions';
import { listProductAction } from '../../../redux/actions/product_actions';
import PaymentDialog from '../paymentSalesPurchase/Dialog';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import NoRecordFound from '../../../components/Layout/NoRecordFound';
import { getAppConfigDataAction } from '../../../redux/actions/app_config_actions';
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
import totalIcon from '../../../assets/dashboardIcons/rupee.svg';
import creditIcon from '../../../assets/dashboardIcons/due-dates.svg';
import dueIcon from '../../../assets/dashboardIcons/due-date.svg';
import apiCalls from 'utils/apiCalls';
import { Helmet } from "react-helmet-async";
import { getsessionStorage } from 'pages/common/login/cookies';
import { getManualNoteSchemesByIdAction } from 'redux/actions/manualNotes_actions';
import AddIcon from '@mui/icons-material/Add';
import NewPayments from 'pages/sales/payments/newpayment';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import { maxBodyHeight, maxHeight, pageSize, headerStyle, cellStyle, font14_500 } from 'utils/pageSize';
import CommonSearch from 'utils/commonSearch';
import FilterSalesOrder from 'pages/sales/sales/FilterSalesOrder';
import moment from 'moment';
import { listStockLocationAction, listStockLocationSequenceAction } from 'redux/actions/stock_Location_actions';
import { completedpaymentview } from 'redux/actions/purchase_actions';
import PaymentPage from '../paymentSalesPurchase/receiptpayment';
import { useCustomFetch } from 'utils/useCustomFetch';
import LocationAlert from 'pages/assets/alert/LocationAlert';
import { titleURL } from 'http-common';
import { roleType } from 'utils/roleType';
import CloseIcon from '@mui/icons-material/Close';
import AlertDialog from '../../common/Dialog';
import { ReceiptTemp } from './receipt';
import ArrowLeftRoundedIcon from '@mui/icons-material/ArrowLeftRounded';
import ArrowRightRoundedIcon from '@mui/icons-material/ArrowRightRounded';
import ReactToPrint, { useReactToPrint } from 'react-to-print';
import ReceiptDetails from './ReceiptDetails';
import ReceiptPayments from 'components/ReceiptPayments/ReceiptPayments';
import { FilterAlt } from '@mui/icons-material';
import ReceiptPaymentFilter from './ReceiptPaymentFilter';
import { listPaymentTypeDetails } from 'redux/actions/payment_method_actions';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import { setInvoiceTempAction } from 'redux/actions/vendor_actions';
import ReceiptsLanding from './ReceiptsLanding'
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import { OpenCustomerLandingPage } from '@crema/utility/helper/RouteHelper';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { ExportCsv } from '@material-table/exporters';
import { useNavigate } from 'react-router-dom';
import { UserRightsAuthorization } from '../../../@crema/utility/helper/UserRightsHelper';

export default function ReceiptReport(props) {
  const dispatch = useDispatch();
    const receiptRef = useRef(null)
  const theme = useTheme()
  const navigate = useNavigate()
  const isLargerScreen = useMediaQuery(theme.breakpoints.up('lg'))
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(Context);
  const {
    salesReducer: { completed_sale_outstanding, consolidated_data, completed_count },
    customerReducer: { customer, customerAsCompany },
    productReducer: { product },
    salesReducer: { sales },
    appConfigReducer: { app_config_data },
    ChartOfAccountsReducer: { chartOfAccounts },
    UserCreationReducer: { createUser },
    ConfigurationReducer: { mail_configuration },
    paymentMethodReducer: { list_payment_type },
    stockLocationReducer: { stocklocation },
    // roleReducer : { user_rights }
    rbacReducer: {menuAccess = []}
  } = useSelector((state) => state);

  const tempinitsform = useRef(null);
  const [receiptDetailOpen, setReceiptDetailOpen] = useState(false);
  const [receiptDetailOpenForSmallerScreen, setReceiptDetailOpenForSmallerScreen] = useState(false);
  const [receiptData, setReceiptData] = useState('');
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [Tdata, setTdata] = useState([]);
  const [entryvalue, setHandleEntry] = useState(false)
  const [received_amount, setReceived_amount] = useState(0);
  const [paymentOpen, setPaymentOpen] = useState(false);
  // const [sale_id,setSale_id] = useState("")
  const [sales_items, setSalesItems] = useState([]);
  const [getCustomer, setGetCustomer] = useState([]);
  const [selectionModel, setSelectionModel] = useState([]);
  const [openExcessPaymentDialog, setOpenExcessPaymentDialog] = useState(false);
  const [getPay, setgetPay] = useState([]);
  const [appConfigData, setAppConfigData] = useState({});
  // const [resData,setResdata] = useState([]);
  const [recData, setReceData] = useState([]);
  const [isAddingAdvance, setIsAddingAdvance] = useState(false);
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
  const [newopen, setNewOpen] = useState(props.newopen || false)
  const tempinitsformVal = useRef(null);
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [page, setPage] = useState(0)
  const [searchVal, setSearchval] = useState('')
  const [filtedValue, setFiltedValue] = useState({
    name: '',
    brand: '',
    category: '',
    location_id: 'null',
    payment_type: '',
    max_price: '',
    min_price: '',
  })
  const [from, setFrom] = useState(null)
  const [to, setTo] = useState(null)
  const [errormsg, seterrormsg] = useState({ from: '', to: '' })
  const [rowPopup, setrowpopup] = useState({ open: false, rowIndex: '', receivings_items: [] })
  const [filterOpen, setFilterOpen] = useState(false)
  const [count, setCount] = useState(0)

  const [editData, setEditData] = useState({})
  const addAdvanceAmount = useRef(null)

  const customFetch = useCustomFetch()
  const [openAlert, setOpenAlert] = useState(false);
  const [clickedInvoice, setclickedInvoice] = useState(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletedata, setdeleteData] = useState({});
  const [entryType, setEntryType] = useState('new');
  const [advanceAmount, setAdvanceAmount] = useState(0)
  const [disableSubmit, setDisableSubmit] = useState(false)
  const [openCustomerDetails, setOpenCustomerDetails] = useState(false)
  const [customerDetails, setCustomerDetails] = useState('')
  const [rowData, setRowData] = useState({})
  const [rowDataIndex, setRowDataIndex] = useState(null)
  const [isExporting, setIsExporting] = useState(false);
  const [pendingCols, setPendingCols] = useState([]);

    let storage = getsessionStorage()
 
  const Dispatch1 = () => {
    const data = { ...exportValue(), ...{ pageCount: page || 0, numPerPage: pageSize || 0 }, };
    if (typeof data.location_id !== 'object') {
      data.location_id = headerLocationId;
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        listcompletedSalesOutstandingAction(
          commoncookie,
          headerLocationId,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      ).finally((res) => setIsApiFinished(true))
      
    );
  };
  const initsform = () => {
    
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    // Dispatch1();
    tempinitsform.current();
    dispatch(listPaymentTypeDetails())
    dispatch(listStockLocationAction(commoncookie, headerLocationId))
    dispatch(getUserRightsByRoleIdAction())
    dispatch(customerAsCompanyAction())
  }, []);
  useEffect(() => {
    Dispatch1();
  }, [headerLocationId, page, pageSize]);

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

  const initsformVal = () => {
    getAppConfigData();
  };
  tempinitsformVal.current = initsformVal;
  useEffect(() => {
    tempinitsformVal.current();
  }, [app_config_data]);

  useEffect(() => {
    if (isExporting && completed_sale_outstanding.length === completed_count) {
      ExportCsv(pendingCols, completed_sale_outstanding, "Receipt Report");

      setIsExporting(false);
      setPendingCols([]);
    }
  }, [completed_sale_outstanding]);

  const setpaymentOpen = (data) => {
    // console.log("caecsaefcf", data);

    setPaymentOpen(data);
    setTdata([]);
  };

  const notifyFunction = (resData) => {
    // const cookies = new Cookies();
    let storage = getsessionStorage()
    console.log(storage,"storage")
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
            let content_body = `${customerName} \n ₹${amount_value} \n${locationName} \n${paymentRefid}`;
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

  const paymentValidate = async (mode, receiptDate) => {
    setDisableSubmit(true)
   let isAddingAdvance = mode;
    if (headerLocationId === 'null') {
      setOpenAlert(true)
      setDisableSubmit(false)
      return
    }
    // console.log("fvevvd", Tdata, selectionModel);

    const hasExcessPayment = Tdata.some((item) => item.payment_amount > item.due);
    let receivedAmount =
      Tdata.reduce(function (acc, obj) {
        return acc + +obj.payment_amount;
      }, (0));
    //}, (getCustomer.creditNote_balance + (getCustomer.advance_amount ?? 0)) ) + received_amount;
    receivedAmount = manualNoteSchemes.filter(i => i.selected).reduce((a, c) => a + +c.new_adjusted_amount, receivedAmount)
    const creditNotePayables = selectionModel
      .filter(item => ['Credit Note', 'Unused Credit'].includes(item.type) && item.payable)
      .reduce((sum, note) => sum + parseFloat(note.adjustedAmount || 0), 0);

    let indiviTotal = receivedAmount;
    const invoiceSelections = selectionModel.filter(item => !['Credit Note', 'Unused Credit'].includes(item.type));
    const receivables = invoiceSelections.map((d) => {
      const newObj = {};
      const sub = indiviTotal - (+d.originalRow.total - +d.originalRow.paid_amount);
      const totalPaymentAmount = Tdata.reduce((sum, item) => sum + item.payment_amount, 0);


// console.log("indiviTotaldcdcc",hasExcessPayment,!isAddingAdvance);
  if (hasExcessPayment && !isAddingAdvance) {
    // console.log("cerverergegerff");
    
    setOpenExcessPaymentDialog(true);
    return;
  }



      if (Math.sign(sub) === 1 || Math.sign(sub) === 0) {
        // console.log("ererererere",totalPaymentAmount,creditNotePayables);

        // newObj.received_amount = +d?.originalRow?.total;
        newObj.received_amount = +d?.originalRow?.paid_amount + totalPaymentAmount + creditNotePayables;
        newObj.saleType = d?.originalRow?.saleType;
        newObj.receivable_amount = d?.originalRow?.due_amount;
        newObj.paymentAmount = d?.paymentAmount;

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
        indiviTotal = sub;
      } else {
        // console.log("fvdvdfvfvdf",totalPaymentAmount,creditNotePayables, d?.originalRow?.paid_amount);

        newObj.received_amount = totalPaymentAmount + (d?.originalRow?.paid_amount || 0) + creditNotePayables,
        newObj.saleType = d?.originalRow?.saleType;
        newObj.receivable_amount = d?.originalRow?.due_amount;
        newObj.paymentAmount = d?.paymentAmount;
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
        indiviTotal = 0;
      }
      newObj.sale_id = d.id;
      newObj.location_id = headerLocationId !== 'null' ? headerLocationId : d?.originalRow?.location_id;

      return newObj;
    });

    if (hasExcessPayment && !isAddingAdvance) {
      return;
    }

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

    let calculatedAdvanceAmount = 0;
    const totalDue = selectionModel.reduce((sum, row) => {
      return sum + Number(row?.originalRow?.due_amount ?? 0);
    }, 0);
    const total_paid_amount = Tdata.reduce((sum, row) => {
      return sum + Number(row?.payment_amount ?? 0);
    }, 0);
// console.log(total_paid_amount,totalDue,"rtytry");

    const updatedTdata = Tdata.map((item) => {
      // console.log(item.payment_amount,totalDue,"bvcnmxss");
      
      if (item.payment_amount > totalDue) {
        // console.log(item.payment_amount,totalDue,"totalDuefdsfd");
        
        calculatedAdvanceAmount += item.payment_amount - totalDue;
        return { ...item };
      }
      return item;
    });
    calculatedAdvanceAmount = total_paid_amount - totalDue

    let remainingPaidAmount = total_paid_amount;

    const sortedReceivables = [...receivables].sort(
      (a, b) => Number(a.receivable_amount ?? 0) - Number(b.receivable_amount ?? 0)
    );
// console.log(sortedReceivables,total_paid_amount,totalDue,"fdgdtrtt");

const saleUpdate = sortedReceivables.map((r) => {
  const receivable = Number(r.receivable_amount ?? 0);
  const paymentAmount = Number(r.paymentAmount ?? 0);
  let receivedAmount = 0;



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
    received_amount: receivedAmount,

  };
});

    const data = {
      // saleUpdate: receivables.map((r) => ({ ...r, received_amount: hasExcessPayment && isAddingAdvance ? +r.received_amount - calculatedAdvanceAmount : +r.received_amount })),
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
        sale_id: receivables[0]?.sale_id,
        customer_id: getCustomer.customer_id,
        // payment_amount: hasExcessPayment && isAddingAdvance ? +(Number(receivables[0]?.paymentAmount)) - calculatedAdvanceAmount : +(Number(receivables[0]?.paymentAmount)),
        payment_amount: +(Number(receivables[0]?.paymentAmount)),
        receiptDate: receiptDate
      },
      location_id: headerLocationId,
      specialNumber: receivables.map((d) => d?.sale_id).join(','),
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
      ...(Object.keys(editData).length && { oldData: editData }),
      addAdvanceAmount: addAdvanceAmount.current ? { ...addAdvanceAmount.current, location_id: headerLocationId } : null,
      advanceAmount: calculatedAdvanceAmount > 0 ? calculatedAdvanceAmount : 0,
    };


    setReceData(receivables);
    console.log("data111", data);

    const callback = (response, resdata) => {
      if (response === 200) {
        // return
        setNewOpen(false)
        setTdata([]);
        setGetCustomer([]);
        setgetPay([]);
        setEditData({})
        setDisableSubmit(false)
        addAdvanceAmount.current = null
        const datas = { ...exportValue(), ...{ pageCount: page || 0, numPerPage: pageSize }, };
        if (typeof data.location_id !== 'object') {
          data.location_id = headerLocationId;
        }
        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(listcompletedSalesOutstandingAction(
            commoncookie,
            headerLocationId,
            datas,
            setModalTypeHandler,
            setLoaderStatusHandler,
          ),),
          dispatch(
            consolidatedReceivings(
              setModalTypeHandler,
              setLoaderStatusHandler,
            ),
          )
        );
        notifyFunction(resdata.data);
      }
    }


    if (Object.keys(editData).length) {
      // update
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(updateReceiptEntry(data, callback))
      )

    } else {
      // new
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        await dispatch(
          receiptEntry(
            data,
            () => { },
            setModalTypeHandler,
            setLoaderStatusHandler,
            callback
          ),
        )
      );
    }
    setIsAddingAdvance(false);
    setSelectionModel([]);
    // this.setState({paymentOpen: false, Tdata: []})
  };

  const getSalesDetails = (id) => {
    if (id !== '' && typeof id !== 'undefined') {
      let salesDetail = sales.filter((s) => s.sale_id === id);
      return salesDetail.length > 0 ? salesDetail[0] : {};
    } else {
      return {};
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

  const pendingPayment = (data, childRow) => {
    if (headerLocationId === 'null') {
      setOpenAlert(true)
      return
    }
    const {
      customer_id,
      sales_items: old_sales,
      received_amount,
      sale_id,
    } = data;

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
        ledger_id: c.ledger_id
      });
    });


    dispatch(getbyidCustomerAction(customer_id, (response) => {
      setGetCustomer(response);

      dispatch(getManualNoteSchemesByIdAction('customer', customer_id, (response) => {
        setManualNoteSchemes(response.map(i => ({ ...i, selected: false })));

        setgetPay(payData);
        setReceived_amount(received_amount);
        setSalesItems(sales_items);
        setPaymentOpen(true);

      }))

    }))


    // this.setState({ sales_items, getCustomer, paymentOpen: true, received_amount: +received_amount, sale_id })
  };
  const invoiceFunction = async (data) => {

    const custData = await customer.filter(
      (d) => data.customer_id === d.customer_id,
    );
    const sales_items = await sales?.filter((f) => f.sale_id === data.sale_id)[0]?.sales_items?.map((d) => {
      const taxes =
        product?.filter((t) => t.item_id === d.item_id)[0]?.taxes || [];
      d.taxes = taxes;
      return d;
    });
    await setPopupData({
      invoice: data.invoice_number,
      custData: custData[0],
      soDate: data.sale_time,
      sales_items: sales_items,
      Dopen: true,
      customer_id: data.customer_id,
      sale_id: data.sale_id,
      note: data.note,
      sales_payments: data.sales_payments,
    });
  };
  const createMail = () => {
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

  const NewHandleclose = (value) => {
    setEntryType('new')
    setNewOpen(value)
    setTdata([]);
    setGetCustomer([]);
    setgetPay([])
    setEditData({})
    setSelectionModel([]);
    const getApiPayload = { ...exportValue(), ...{ pageCount: 0, numPerPage: 20 }, }
    dispatch(listcompletedSalesOutstandingAction(commoncookie, headerLocationId, getApiPayload, setModalTypeHandler, setLoaderStatusHandler))
    dispatch(consolidatedReceivings(setModalTypeHandler, setLoaderStatusHandler))
    if(props.handleClose){
      props.handleClose()
    }
  }

  const AdvanceSubmit = (id, name, receiptDate) => {


    if (headerLocationId === 'null') {
      setOpenAlert(true)
      return
    }
    const receiptData = Tdata.filter(i => 'paymentLedgerId' in i && 'ledger_id' in i);

    const amount = Number(advanceAmount ?? 0);
    const totalAmtInTData = receiptData.reduce((a, c) => a + +c.payment_amount, 0)
    // console.log("rtfgrtgrt", totalAmtInTData, amount, receiptData);
    if (amount !== totalAmtInTData) {
      return alert("Advance amount doesn't match with Total amount in table");
    }

    let customerId = id
    let data = {
      receiptData: [{...receiptData[0], receiptDate}],
      customerId,
      amount,
      name,
      location_id: headerLocationId,
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(SalesAdvanceEntry(data,
        (response) => {
          if (response === 200) {
            setNewOpen(false)
            setTdata([]);
            setGetCustomer([]);
            setgetPay([])
            const datas = { ...exportValue(), ...{ pageCount: page || 0, numPerPage: pageSize }, };
            if (typeof data.location_id !== 'object') {
              data.location_id = headerLocationId;
            }
            apiCalls(
              setModalTypeHandler,
              setLoaderStatusHandler,
              dispatch(listcompletedSalesOutstandingAction(
                commoncookie,
                headerLocationId,
                datas,
                setModalTypeHandler,
                setLoaderStatusHandler,
              ),)
            );
          }
        }
      ))
    );
  }

  const exportValue = () => {
    const { brand, category, location_id, payment_type, max_price, min_price } =
      filtedValue;
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

    }
    return data;
  }

  const commonFilterMapping = (array, columnName) => {
    if (typeof array === 'object') {
      let Data = array.map((a) => a[columnName]);
      return Data;
    } else {
      return array;
    }
  };

  const cancelSearch = (e) => {
    setSearchval('')
    const data = { ...exportValue(), searchString: '', ...{ pageCount: 0, numPerPage: pageSize }, };
    if (typeof data.location_id !== 'object') {
      data.location_id = headerLocationId;
    }

    dispatch(set_searchcompletedSalesOutstandingAction({data : [], numRows:0}))

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(listcompletedSalesOutstandingAction(
        commoncookie,
        headerLocationId,
        data,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),)
    );
  };

  const requestSearch = (e) => {
    let val = e.target.value;
    setSearchval(val)
    setPage(0)
    const data = { ...exportValue(), searchString: val, ...{ pageCount: 0, numPerPage: pageSize }, };
    if (typeof data.location_id !== 'object') {
      data.location_id = headerLocationId;
    }

    dispatch(set_searchcompletedSalesOutstandingAction({data : [], numRows:0}))

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(get_searchcompletedSalesOutstandingAction(
        commoncookie,
        headerLocationId,
        data,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),)
    );


  };

  const handlePageSizeChange = async (size) => {
    setPageSize(size)
  }


  const handlePageChange = async (page) => {
    setPage(page)
  }

  const handleCustomerDetail = async (data) => {
    const customerIndex = customerAsCompany.findIndex(c => c.customer_id === data.customer_id);

    let openData = {
      rowIndex: customerIndex,
      sales_customer_id: data.customer_id,
      routeFrom: "SALES",
      salesOrder: "salesOrder",
      mail_configuration: mail_configuration,
      setOnbackClick: false,
      backToSales: handleCustomerDetailClose,
    };
    setCustomerDetails(openData)
    setOpenCustomerDetails(true)
  }

  const handleCustomerDetailClose = () => {

    setOpenCustomerDetails(false)
  }

  const setFilter = (data) => setFilter(data);

  const handleFilter = (data) => {

    setFilterOpen(data)
    !stocklocation.length && apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        listStockLocationSequenceAction(
          { sequence_type: ['SO', 'DC'] },
          null,
          commoncookie,
          headerLocationId,
        )
      ))
    !product.length && apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler, dispatch(
        listProductAction(
          setModalTypeHandler,
          setLoaderStatusHandler,
        ))

    );
  };

  const brandSearch = (event, key) => {
    let values = event ? event[key] : false;

  };

  const handleChange = async (data) => {
    var date_val = data.target.value._d;
    // await this.setState({[data.target.name]: date_val});
    let inputval = data.target.name
    if (inputval === 'from') {
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

          seterrormsg({ ...errormsg, inputval: 'Invalid Date 1' })
        }
      } else {

        seterrormsg({ ...errormsg, inputval: 'Invalid Date 2' })
      }
    } else {

      seterrormsg({ ...errormsg, inputval: 'Invalid Date 3' })
    }
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


    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        listcompletedSalesOutstandingAction(
          commoncookie,
          headerLocationId,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      )
    );

    setFilterOpen(false)
  };

  const clearButton = () => {
    let firstDay = null;
    let lastDay = null;
    const data = {
      from: null,
      to: null,
      brand: "",
      category: "",
      user_id: commoncookie,
      location_id: "null",
      payment_type: "",
      pageCount: 0,
      max_price: "",
      min_price: "",
      searchString: "",
      numPerPage: 20
    }
    setFiltedValue({
      name: '',
      brand: '',
      category: '',
      location_id: 'null',
      payment_type: '',
      max_price: '',
      min_price: ''
    })
    dispatch(
      listcompletedSalesOutstandingAction(
        commoncookie,
        headerLocationId,
        data,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ))

    setFrom(firstDay);
    setTo(lastDay);
    
    setFilterOpen(false)
  };
  console.log(Tdata, "completed_sale_outstanding")

  const Deletedhandle = async(delreceiptId) => {
    
    console.log('deletehandle',delreceiptId,deletedata  )
    setReceiptDetailOpen(false)
    setReceiptDetailOpenForSmallerScreen(false)
  
    setReceiptData('')
    const data = { ...exportValue(), ...{ pageCount: page || 0, numPerPage: pageSize }, };
    if (typeof data.location_id !== 'object') {
      data.location_id = headerLocationId;
    }

  // if (!deletedata || !deletedata.receipt_id || delreceiptId) {
  //   alert("Refresh and try.");
  //   return;
  // }
    let receiptId = { receipt_id : deletedata.receipt_id ||  delreceiptId}
    await apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(deleteReceipts(receiptId,'Receipts', (response) => {
        if (response === 200) {
          apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(
              listcompletedSalesOutstandingAction(
                commoncookie,
                headerLocationId,
                data,
                setModalTypeHandler,
                setLoaderStatusHandler,
              ),
            ).finally((res) => setIsApiFinished(true))

          );
        }
      })))
      setDeleteDialogOpen(false)
      setdeleteData({})
      }


  //   useEffect(() => {
  //     setTimeout(() => {
  //     if (receiptRef.current) {
  //       receiptRef.current.innerHTML = ReceiptTemp(ReceiptData[currentPageIndex])
  //     }
  //   },50)
  // });

  const handleDetailClick = async (rowData, internalCall, initialCall) => {
    setRowData(rowData)
    if(isLargerScreen || internalCall){
      const id = rowData.id
      await apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(getReceiptsByIdAction(id, 'Receipts')),
      )
      if(!internalCall){
        setReceiptDetailOpen(true)
      }
      else if(!initialCall){
        setReceiptDetailOpenForSmallerScreen(true)
      }
    }
    else{
      const index = completed_sale_outstanding.findIndex(item => item.id === rowData.id)
      setRowDataIndex(index)
    }
  }

  // const userRights = storage.company_type === 3 ? getRoleAuthorization(user_rights, 'ReceiptsAdd') : true;

  const handleDelete = () => {
    if(!headerLocationId || headerLocationId === 'null') {
      setOpenAlert(true)
      return
    }
    setDeleteDialogOpen(true)
    setdeleteData(rowData)
  }

  const handleEdit = () => {
    if (!headerLocationId || headerLocationId === 'null') {
      setOpenAlert(true)
      return
    }
    setEntryType('edit')
    setEditData(rowData)
    setNewOpen(true)
  }

  useEffect(() => {
    dispatch(setReceiptsByIdAction({}))
    if(completed_sale_outstanding && completed_sale_outstanding?.length > 0 && isLargerScreen) {
      handleDetailClick(completed_sale_outstanding[0], !isLargerScreen, true)
    }
  }, [completed_sale_outstanding])

  useEffect(() => {
    if(rowDataIndex !== null){
      const indexedRowData = completed_sale_outstanding[rowDataIndex]
      handleDetailClick(indexedRowData, true)
    }
  }, [rowDataIndex])
    const [anchorEl, setAnchorEl] = useState(null);
  
    const handleExportClose = () => {
      setAnchorEl(null);
    };

  const loadAllDataForExport = async () => {
    const payload = {
      ...exportValue(),
      pageCount: 0,
      numPerPage: completed_count,
    };

    if (typeof payload.location_id !== "object") {
      payload.location_id = headerLocationId;
    }

    await dispatch(
      listcompletedSalesOutstandingAction(
        commoncookie,
        headerLocationId,
        payload,
        setModalTypeHandler,
        setLoaderStatusHandler
      )
    );

    return completed_sale_outstanding;
  };

  const exportColumns = [
    { label: "Receipt", key: "receipt_number" },
    { label: "Invoice Number", key: "invoice_number" },
    { label: "Date", key: "receipt_date" },
    { label: "Entry Date", key: "createdAt" },
    { label: "Customer", key: "company_name" },
    { label: "Reference", key: "note" },
    { label: "Payment Method", key: "payment_type" },
    { label: "Amount", key: "paid_amount" },
    { label: "Advance Received", key: "advanceReceivedAmount" },
  ];
  
  const handleExportCSV = async (cols) => {
    setPendingCols(cols);
    setIsExporting(true);

    const payload = {
      ...exportValue(),
      pageCount: 0,
      numPerPage: completed_count,
    };

    if (typeof payload.location_id !== "object") {
      payload.location_id = headerLocationId;
    }

    dispatch(
      listcompletedSalesOutstandingAction(
        commoncookie,
        headerLocationId,
        payload,
        setModalTypeHandler,
        setLoaderStatusHandler
      )
    );
  };
  const selectedRole = storage?.role_name;
  const reportExport = UserRightsAuthorization(menuAccess[selectedRole], 'reports__transactions__receipt_reports', 'can_export')
  return (
    <>
      {openCustomerDetails === true ? (
        OpenCustomerLandingPage(customerDetails)
      ) : (
        <>
          <Helmet>
            <meta charSet='utf-8' />
            <title> {titleURL} | SalesReceipt </title>
          </Helmet>
          <AlertDialog
            delete={isDeleteDialogOpen}
            handleDelete={Deletedhandle}
            handleClose={() => setDeleteDialogOpen(false)}
          ></AlertDialog>

          {!receiptDetailOpenForSmallerScreen && (
            <Grid container spacing={1}>
              <Grid size={12}>
                {newopen === false && (
                  <CreateNewButtonContext.Consumer>
                    {({loaderStatus}) => (
                      // !Receipt ? (
                      (<div>
                        <InvoiceDialog
                          appConfigData={appConfigData}
                          createMail={createMail}
                          custType={'CUSTOMER'}
                          custData={popUpdata.custData}
                          invoice={popUpdata.invoice}
                          soDate={popUpdata.soDate}
                          sales_items={popUpdata.sales_items}
                          open={popUpdata.Dopen}
                          handleClose={() =>
                            setPopupData({...popUpdata, Dopen: false})
                          }
                          setModalTypeHandler={setModalTypeHandler}
                          setLoaderStatusHandler={setLoaderStatusHandler}
                          mail_configuration={mail_configuration}
                          posSale={true}
                        />
                        {/* <style>
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


                          `}
                        </style> */}

                        <MaterialTable
                          style={{height: 'calc(100vh - 100px)',overflow:"hidden"}}
                          totalCount={completed_count}
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
                                <div>
                                  <CommonSearch
                                    searchVal={searchVal}
                                    cancelSearch={cancelSearch}
                                    requestSearch={requestSearch}
                                  />
                                </div>
                              </div>
                            ),
                          }}
                          actions={[
                            {
                              icon: () => <FilterAlt />,
                              tooltip: 'Filter',
                              isFreeAction: true,
                              onClick: () => {
                                setFilterOpen(true);
                              },
                            },
                            
                            // userRights
                            //   ? {
                            //       icon: 'add',
                            //       tooltip: 'add',
                            //       isFreeAction: true,
                            //       onClick: (event, rowData) => {
                            //         if (
                            //           !headerLocationId ||
                            //           headerLocationId === 'null'
                            //         ) {
                            //           setOpenAlert(true);
                            //           return;
                            //         }
                            //         setNewOpen(true);
                            //       },
                            //     }
                            //   : null,
                          ]}
                          //onRowClick={(event, rowData) => handleDetailClick(rowData)}
                          page={page}
                          onPageChange={(page) => handlePageChange(page)}
                          onRowsPerPageChange={(size) =>
                            handlePageSizeChange(size)
                          }
                          options={{
                            showEmptyDataSourceMessage: isApiFinished,
                            headerStyle,
                            cellStyle,
                            exportButton: reportExport,
                            filtering: false,
                            actionsColumnIndex: -1,
                            maxBodyHeight: maxBodyHeight,
                            minBodyHeight: maxBodyHeight,
                            pageSize: pageSize,
                            pageSizeOptions: [20, 50, 100],
                            totalCount: completed_count,
                            initialPage: currentPage,
                            search: false,
                            // overflowY: 'auto',
                            // rowStyle: (row) => ({
                            //   backgroundColor: rowData.id === row.tableData.id ? '#D5DEF9' : '#FFFFFF'
                            // })
                            exportMenu: reportExport ? [{
                                                  label: 'Export CSV',
                                                  exportFunc: (cols, datas) => handleExportCSV(cols, datas, 'Receipt Report')
                                                }] : []
                          }}
                          columns={[
                            {
                              title: 'Receipt',
                              field: 'receipt_number',
                              editable: false,
                              width: '10%',
                            },
                            {
                              title: 'Invoice Number',
                              field: 'invoice_number',
                            },
                            {
                              title: 'Date',
                              field: 'receipt_date',
                              editable: false,
                              width: '10%',
                            },
                            {
                              title: 'Entry Date',
                              field: 'entry_date',
                            },
                            {
                              title: 'Customer',
                              field: 'company_name',
                              editable: false,
                              width: '15%',
                              render: (rowData) => (
                                <>
                                  {
                                    <div>
                                      <List
                                        component='nav'
                                        aria-label='main mailbox folders'
                                        disablePadding
                                      >
                                        <ListItem sx={{pl: 0}}>
                                          <ListItemIcon sx={{minWidth: 30}}>
                                            {rowData.customer_type === '0' ? (
                                              <PersonIcon />
                                            ) : (
                                              <BusinessIcon />
                                            )}
                                          </ListItemIcon>
                                          <ListItemText
                                            primary={
                                              <span
                                                style={{
                                                  fontSize: cellStyle.fontSize,
                                                  fontWeight:
                                                    cellStyle.fontWeight,
                                                }}
                                              >
                                                <Link
                                                  onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleCustomerDetail(
                                                      rowData,
                                                    );
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
                                              </span>
                                            }
                                          />
                                        </ListItem>
                                      </List>
                                    </div>
                                  }
                                </>
                              ),
                            },
                            {
                              title: 'Reference',
                              field: 'reference',
                              width: '20%',
                            },

                            // {
                            //   title: 'Location',
                            //   field: 'location_name',
                            //   editable: false,
                            // },
                            {
                              title: 'Note',
                              field: 'note',
                              width: '30%',
                              render: (rowData) => rowData.note ?? '',
                            },
                            // {
                            //   title: 'Invoice Amount',
                            //   field: 'total',
                            //   cellStyle: {
                            //     textAlign: 'right',
                            //     paddingRight: '130px',
                            //     fontSize: cellStyle.fontSize,
                            //   },
                            //   render: (rowData) => parseFloat(rowData.total).toFixed(2),
                            //   validate: (rowData) => parseFloat(rowData.total) >= 0,
                            // },
                            {
                              title: 'Payment Method',
                              field: 'payment_type',
                            },
                            {
                              title: 'Amount',
                              field: 'paid_amount',
                              align: 'right',
                              width: '10%',
                              cellStyle: {
                                textAlign: 'right',
                                paddingRight: '10px',
                                fontSize: cellStyle.fontSize,
                              },
                              render: (rowData) =>
                                parseFloat(rowData.paid_amount).toFixed(2),
                              validate: (rowData) =>
                                parseFloat(rowData.paid_amount) >= 0,
                            },
                            {
                              title: 'Advance Received',
                              field: 'advanceReceivedAmount',
                              render: (rowData) =>
                                rowData.advanceReceivedAmount === 0
                                  ? ''
                                  : parseFloat(
                                      rowData.advanceReceivedAmount,
                                    ).toFixed(2),
                              align: 'right',
                              width: '10%',
                              cellStyle: {
                                textAlign: 'right',
                                paddingRight: '10px',
                                fontSize: cellStyle.fontSize,
                              },
                            },
                          ]}
                          data={completed_sale_outstanding}
                          title={
                            <Typography
                              variant='h6'
                              style={{padding: '10px 0'}}
                            >
                              {/* <Link href='/report' underline='hover'>
                                <HomeIcon sx={{mr: 0.5}} fontSize='inherit' />
                                Home
                              </Link>
                              / Receipt Report */}
                              <Box style={{ display: 'flex' }}>
                                <Box sx={{ color: '#0A8FDC', cursor: 'pointer', fontSize: '12px', fontWeight: 400, '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate('/report')}>
                                  <HomeIcon sx={{mr: 0.5}} fontSize='inherit' />
                                  Home
                                </Box>
                                &nbsp;/&nbsp;DayBooks Report
                              </Box>
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
                      </div>)
                    )}
                  </CreateNewButtonContext.Consumer>
                )}
              </Grid>
            </Grid>
          )}

          {!isLargerScreen && receiptDetailOpenForSmallerScreen && (
            <Grid container spacing={3}>
              <Grid size={12}>
                <Grid container spacing={3} justifyContent='flex-end'>
                  <Grid>
                    <Button
                      variant='contained'
                      onClick={() =>
                        setReceiptDetailOpenForSmallerScreen(false)
                      }
                    >
                      Back
                    </Button>
                  </Grid>

                  <Grid>
                    <IconButton
                      onClick={() => setRowDataIndex(rowDataIndex - 1)}
                      disabled={rowDataIndex === 0}
                    >
                      <ArrowBackIosIcon />
                    </IconButton>
                  </Grid>

                  <Grid>
                    <IconButton
                      onClick={() => setRowDataIndex(rowDataIndex + 1)}
                      disabled={
                        rowDataIndex === completed_sale_outstanding.length - 1
                      }
                    >
                      <ArrowForwardIosIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size={12}>
                <ReceiptsLanding
                  handleDelete={handleDelete}
                  handleEdit={handleEdit}
                  type='Receipts'
                  rowData={rowData}
                />
              </Grid>
            </Grid>
          )}

          {newopen === true && (
            <ReceiptPayments
              paymentOpen={newopen}
              inline
              custType='CUSTOMER'
              handleClose={NewHandleclose}
              editData={editData}
              responseType={'cashIn'}
              entryType={entryType}
              sales_items={sales_items}
              selectedInvoice={null}
              selectedCustomer={{}}
            />
          )}
          <PaymentDialog
            getPay={getPay}
            status={'edit'}
            activeINV={'INV'}
            selectionModel={selectionModel}
            setSelectionModel={setSelectionModel}
            entryvalue={entryvalue}
            handleEntry={setHandleEntry}
            received_amount={received_amount}
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
          />
          <LocationAlert open={openAlert} onClose={() => setOpenAlert(false)} />

          <Dialog
            open={openExcessPaymentDialog}
            onClose={handleCloseExcessPaymentDialog}
          >
            <DialogTitle
              sx={{
                m: 0,
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography id='alert-dialog-title'>
                Advance Confirmation
              </Typography>
              <IconButton
                aria-label='close'
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
              The given amount is greater than the Due amount! Would you like to
              add the Difference Amount as Advance ?
            </DialogContent>
            <DialogActions>
              <Button
                variant='contained'
                onClick={handleProceedWithAdvance}
                color='success'
              >
                Yes
              </Button>
              <Button
                variant='contained'
                onClick={handleDoNotAddAdvance}
                color='error'
              >
                No
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </>
  );
}

