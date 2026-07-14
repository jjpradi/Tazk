import React, {useEffect, useRef, useState, useContext} from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { IconButton, Tooltip } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import {blue} from '@mui/material/colors';
import ReturnDialog from './returnDialog';
import {ContactsOutlined} from '@mui/icons-material';
import PaymentDialog from '../../../pages/sales/paymentSalesPurchase/Dialog';
import {
  listSalesAction,
  receiptEntry,
  consolidatedReceivings,
  listSalesPaginateAction,
} from '../../../redux/actions/sales_actions';
import {listCustomerAction} from '../../../redux/actions/customer_actions';
import {useDispatch, useSelector} from 'react-redux';
import Context from '../../../context/CreateNewButtonContext';
import {sendNtfy} from '../../../firebase/firebase.service';
import {getLoginRoleAction} from '../../../redux/actions/userRole_actions';
import Cookies from 'universal-cookie';
import notificationType from '../../../firebase/notify_type';
import {createTransactionAction} from '../../../redux/actions/transaction_actions';
import {listChartOfAccountsAction} from '../../../redux/actions/chartOfAccounts';
import { CreateNotificationAction } from 'redux/actions/notification_actions';
import { getDateTimeFormat } from 'utils/getTimeFormat';
import apiCalls from 'utils/apiCalls';
import { getsessionStorage } from 'pages/common/login/cookies';
import { useCustomFetch } from 'utils/useCustomFetch';
import LocationAlert from 'pages/assets/alert/LocationAlert';
import { roleType } from 'utils/roleType';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import ReceiptPayments from 'components/ReceiptPayments/ReceiptPayments';
import { useLocation } from 'react-router-dom';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import API_URLS from '../../../utils/customFetchApiUrls';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

const options = ['EDIT', 'DELETE'];

export default function OptionButton(props) {
  const {sale_status, payment, salesData,soToInvoiceId} = props;
  // console.log("asdad",salesData)
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const dispatch = useDispatch();
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
    commoncookie,
  } = useContext(Context);
  const {
    salesReducer: {sale_outstanding, consolidated_data},
    customerReducer: {customer},
    productReducer: {product},
    salesReducer: {sales},
    appConfigReducer: {app_config_data},
    ChartOfAccountsReducer: {chartOfAccounts},
    roleReducer: { user_rights },
    rbacReducer: {menuAccess}
  } = useSelector((state) => state);
    let storage = getsessionStorage()
    const selectedRole = storage.role_name
  const tempinitsform = useRef(null);

  const soDeleteBtn = UserRightsAuthorization(menuAccess[selectedRole], 'sales__sales_orders', 'can_delete')
  const soEditBtn = UserRightsAuthorization(menuAccess[selectedRole], 'sales__sales_orders', 'can_edit')
  const invoiceCreateBtn = UserRightsAuthorization(menuAccess[selectedRole], 'sales__invoices', 'can_create')
  const receiptCreateBtn = UserRightsAuthorization(menuAccess[selectedRole], 'sales__receipts', 'can_create')
  const cnCreateBtn = UserRightsAuthorization(menuAccess[selectedRole], 'sales__credit_notes', 'can_create')

  // console.log("salesData",salesData)
  const pageSize = 20

  const page = 0
   
  const {pathname} = useLocation();
  
  const addAdvanceAmount = useRef(null)
  const [Tdata, setTdata] = useState([]);
  const [received_amount, setReceived_amount] = useState(0);
  const [paymentOpen, setPaymentOpen] = useState(false);
  // const [sale_id,setSale_id] = useState("")
  const [sales_items, setSalesItems] = useState([]);
  const [getCustomer, setGetCustomer] = useState([]);
  const [selectionModel, setSelectionModel] = useState([]);
  const [getPay, setgetPay] = useState([]);
  const [entryvalue, setHandleEntry] = useState(false)
  const [appConfigData, setAppConfigData] = useState({});
  const [recData, setReceData] = useState([]);

  const [manualNoteSchemes, setManualNoteSchemes] = useState([]);
  const [openAlert,setOpenAlert] = useState(false);
  const [clickedInvoice, setclickedInvoice] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedActionIndex, setSelectedActionIndex] = useState(null);
  const [disableSubmit, setDisableSubmit] = useState(false)


  const customFetch = useCustomFetch()

  const initsform = () => {
    // dispatch(listSalesOutstandingAction(setModalTypeHandler,setLoaderStatusHandler))

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      // dispatch(
      //   listSalesAction(
      //     commoncookie,
      //     headerLocationId,
      //     setModalTypeHandler,
      //     setLoaderStatusHandler,
      //   ),
      // ),
      // !customer.length && dispatch(
      //    listCustomerAction(
      //     () => {},
      //     () => {},
      //   ),
      // ),
      dispatch(
        consolidatedReceivings(
          () => {},
          () => {},
        ),
      ),
      // !chartOfAccounts.length && dispatch(listChartOfAccountsAction())
    );
    //  dispatch(listProductAction(()=>{},()=>{}))
    //  dispatch(getAppConfigDataAction())
    // if(!chartOfAccounts.length){
    //   dispatch(listChartOfAccountsAction())
    // }
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();
  }, []);

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

  // const initsformVal = () =>{
  //   getAppConfigData()
  // }
  // tempinitsformVal.current = initsformVal
  // useEffect(() => {
  //  tempinitsformVal.current();
  // }, [app_config_data])

  const setpaymentOpen = (data) => {
    setPaymentOpen(data);
    setTdata([]);
    const paginationData = {
      brand: "",
      category: "",
      location_id: headerLocationId,
      max_price: "",
      min_price: "",
      payment_type: "",
      from: null,
      to: null,
      user_id: commoncookie,
      pageCount: 0,
      numPerPage: 20,
      searchString: "",
      sale_status: "All"
    }
    dispatch(listSalesPaginateAction(
      paginationData,
      commoncookie,
      headerLocationId,
      setModalTypeHandler,
      setLoaderStatusHandler
    ))
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
          let paymentData =
          resData.data.find((m) => m.sale_id === recData[0].sale_id) || {};
          if (notify_content.length) {
            let paymentRefid = paymentData.customer_id || '';
            let customerName = paymentData.companyName || '';
            let amount_value = paymentData.received_amount || '';
            let locationName = paymentData.location_name || '';
            let content_body = `${customerName} \n₹${amount_value} \n${locationName} \n${paymentRefid}`;
            sendNtfy(token, notify_content[0]?.title, content_body);
            dispatch(CreateNotificationAction({content_body:content_body,title:notify_content[0]?.title,time:getDateTimeFormat(new Date()),"active":"1"}))
          }
        }
      }),
    );
  };
  // const ledgerApi = (salesData) => {
    
  //   const data = {
  //     // "code": "234",
  //     // "entity": "324",
  //     location_id:headerLocationId,
  //     specialNumber: '324',
  //     note: 'POS',
  //     referenceNumber:  salesData[0]?.sales_payment,
  //     voucherTypeId: 1,
  //   };
  //   const accountTransaction = [];
  //   salesData.map(sD => {
  //     const { received_amount, sales_payment } = sD
  //     chartOfAccounts.forEach((d) => {
  //       const { id, creditSign, debitSign } = d;
  //       const dd = { accountId: id, description: "salesPayment Entry" };
  //       if (sales_payment.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id ).length) {
  //         let Recevable = sales_payment.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id )?.[0] || {}

  //         dd.amount = debitSign * Recevable?.payment_amount || 0
  //         accountTransaction.push(dd);
  //       }else if(sales_payment.filter(f => f.ledger_id === id).length){
  //         let Recevable = sales_payment.filter(f =>  f.ledger_id === id)?.[0] || {}
  //         dd.amount = creditSign * Recevable?.payment_amount || 0
  //         accountTransaction.push(dd);
  //       }
  //     });
  //   })
  //   data.accountTransaction = accountTransaction;
  //   dispatch(createTransactionAction(data, true, setLoaderStatusHandler))
  // };


  //payment validate old
  // const paymentValidate = () => {
  //   const receivedAmount =
  //     Tdata.reduce(function (acc, obj) {
  //       return acc + +obj.payment_amount;
  //     }, getCustomer.creditNote_balance) + received_amount;

  //   let indiviTotal = receivedAmount;
  //   const receivables = selectionModel.map((d) => {
  //     const newObj = {};
  //     const sub = indiviTotal - (+d.total - +d.paid_amount);

  //     if (Math.sign(sub) === 1 || Math.sign(sub) === 0) {
  //       newObj.received_amount = +d.total;
  //       newObj.ledger_id = getCustomer.ledger_id
  //       newObj.sales_payment = [
  //         {...Tdata[0], payment_amount: +d.total - +d.paid_amount, ledger_id: getCustomer.ledger_id},
  //       ];
  //       indiviTotal = sub;
  //     } else {
  //       newObj.received_amount = +d.paid_amount + indiviTotal;
  //       newObj.sales_payment = [
  //         {...Tdata[0], payment_amount: +d.total - +d.paid_amount, ledger_id: getCustomer.ledger_id},
  //       ];
  //       indiviTotal = 0;
  //     }
  //     newObj.sale_id = d.id;
  //     newObj.location_id = headerLocationId !== 'null' ? headerLocationId : d.location_id;
  //     return newObj;
  //   });
  //   const data = {
  //     saleUpdate: receivables,
  //     updateCreditNote: {
  //       customer_id: getCustomer.customer_id,
  //       amount: entryvalue === true ? getCustomer.creditNote_balance : 0,
  //     },
  //     userConfig: {user_id: commoncookie, location_id: headerLocationId},
  //     location_id:headerLocationId,
  //     specialNumber: '',
  //     note: 'Sales',
  //     referenceNumber:  receivables[0]?.sales_payment,
  //     voucherTypeId: 1,
  //   };
    
  //   // const accountTransaction = [];
  //   // receivables.map(sD => {
  //   //   const { received_amount, sales_payment } = sD
  //   //   chartOfAccounts.forEach((d) => {
  //   //     const { id, creditSign, debitSign } = d;
  //   //     const dd = { accountId: id, description: "salesPayment Entry" };
  //   //     if (sales_payment.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id ).length) {
  //   //       let Recevable = sales_payment.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id )?.[0] || {}

  //   //       dd.amount = debitSign * Recevable?.payment_amount || 0
  //   //       accountTransaction.push(dd);
  //   //     }else if(sales_payment.filter(f => f.ledger_id === id).length){
  //   //       let Recevable = sales_payment.filter(f =>  f.ledger_id === id)?.[0] || {}
  //   //       dd.amount = creditSign * Recevable?.payment_amount || 0
  //   //       accountTransaction.push(dd);
  //   //     }
  //   //   });
  //   // })
  //   // data.accountTransaction = accountTransaction;
  //   setReceData(receivables);
  //   apiCalls(
  //     setModalTypeHandler,
  //     setLoaderStatusHandler,
  //     dispatch(
  //       receiptEntry(
  //         data,
  //         () => {},
  //         setModalTypeHandler,
  //         setLoaderStatusHandler,
  //         (response, resdata) => {
  //           // const cookies = new Cookies();
  //           let storage = getsessionStorage()
  //           let emp_id = storage?.employee_id || '';
  //           if (response === 200) {
  //             setpaymentOpen(false);
  //             setTdata([]);
  //             notifyFunction(resdata.data);
  //             // lklk sales order payment action button";
  //             // ledgerApi(data.saleUpdate)
  //           }
  //         },
  //       ),
  //     )
  //   );
  //   // this.setState({paymentOpen: false, Tdata: []})
  // };



  console.log("salesData",salesData)

  const shouldDisableConvertToInvoice =
    (sale_status === 1 && salesData?.updated_status === 15) ||
    (sale_status === 8 && salesData?.status === 10) ||
    (
      Array.isArray(salesData?.sales_items) &&
      salesData.sales_items.every(
        item => item.return_quantity >= item.actual_quantity
      )
    )  || salesData?.status === 'Waiting Approval' || (
      Array.isArray(salesData?.sales_items) &&
      salesData.sales_items.every(
        item => item.invoice_quantity >= item.qty
      )
    )

  const isDirectChallan = sale_status === 8;
  const hasConvertedInvoices = salesData?.status === 9 || salesData?.status === 10 || 
    (
      Array.isArray(salesData?.sales_items) &&
      salesData.sales_items.every(
        item => item.return_quantity >= item.actual_quantity
      )
    ) || salesData?.status === 11 || salesData?.status === 12 || salesData?.status === 13 |  salesData?.status === 14


  const paymentValidate = (type, receiptDate) => {
    setDisableSubmit(true)
    const receivedAmount =
      Tdata.reduce(function (acc, obj) {
        return acc + +obj.payment_amount;
      }, getCustomer.creditNote_balance) + (typeof received_amount === 'object' ? received_amount.received_amount : received_amount);
    let indiviTotal = receivedAmount;
    const receivables = selectionModel.map((d) => {
      const newObj = {};
      const sub = indiviTotal - (+d.originalRow.total - +d.originalRow.paid_amount);
      


      if (Math.sign(sub) === 1 || Math.sign(sub) === 0) {
        newObj.received_amount = (+d?.originalRow.total || 0);
        newObj.saleType = d?.originalRow?.saleType;
        newObj.receivable_amount = d?.originalRow?.due_amount;
        newObj.paymentAmount = d?.paymentAmount;
        // newObj.sales_payment = Tdata.map((payment) => ({
        //   ...payment,
        //   payment_amount: d?.originalRow?.balance_amount ? d?.originalRow?.balance_amount : (+d?.originalRow?.total - +d?.originalRow?.paid_amount),
        //   ...(!Tdata.length && {
        //     employee_id: commoncookie,
        //     payment_type: 'Credit Note',
        //     reference_code: '',
        //     cash_refund:0
        //   })
          
        // }));
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
        newObj.received_amount = +d?.originalRow?.paid_amount + indiviTotal;
        newObj.saleType = d?.originalRow?.saleType;
        newObj.receivable_amount = d?.originalRow?.due_amount;
        newObj.paymentAmount = d?.paymentAmount;
        // newObj.sales_payment = Tdata.map((payment) => ({
        //   ...payment,
        //   ...(!Tdata.length && {
        //     employee_id: commoncookie,
        //     payment_type: 'Credit Note',
        //     reference_code: '',
        //     cash_refund:0
        //   })
        // }));
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
      newObj.sale_id = d?.originalRow.id;
      newObj.location_id = headerLocationId !== 'null' ? headerLocationId : d?.originalRow.location_id;

      return newObj;
    });

    let calculatedAdvanceAmount = 0;
    const totalDue = selectionModel.reduce((sum, row) => {
      return sum + Number(row?.paymentAmount ?? 0);
    }, 0);
    const total_paid_amount = Tdata.reduce((sum, row) => {
      return sum + Number(row?.payment_amount ?? 0);
    }, 0);
console.log(total_paid_amount,totalDue,"rtytry");

    const updatedTdata = Tdata.map((item) => {
      console.log(item.payment_amount,totalDue,"bvcnmxss");
      
      if (item.payment_amount > totalDue) {
        console.log(item.payment_amount,totalDue,"totalDuefdsfd");
        
        calculatedAdvanceAmount += item.payment_amount - totalDue;
        return { ...item };
      }
      return item;
    });
    calculatedAdvanceAmount = total_paid_amount - totalDue
console.log(calculatedAdvanceAmount,receivables,"calculatedAdvanceAmount");

    let remainingPaidAmount = total_paid_amount;

    const sortedReceivables = [...receivables].sort(
      (a, b) => Number(a.receivable_amount ?? 0) - Number(b.receivable_amount ?? 0)
    );
console.log(sortedReceivables,total_paid_amount,totalDue,"fdgdtrtt");

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
    received_amount: receivedAmount,
    sales_payment: [{
      ...r.sales_payment[0],
      due: r.receivable_amount,
      payment_amount: receivedAmount
    }]
  };
});

const hasExcessPayment = Tdata.some((item) => item.payment_amount > item.due);
    // let receivedAmount =
    //   Tdata.reduce(function (acc, obj) {
    //     return acc + +obj.payment_amount;
    //   }, 0);

    const data = {
      saleUpdate: saleUpdate.filter(s => s.saleType !== undefined),
      updateCreditNote: {
        manualNoteSchemes : manualNoteSchemes.filter(i => i.selected && i.advance_id === undefined),
        advanceledger : manualNoteSchemes.filter(i => i.selected && i.advance_id !== undefined),
        customer_id: getCustomer.customer_id,
        customer_ledger_id: getCustomer.ledger_id,
        company_name : getCustomer.company_name || `${getCustomer.first_name} ${getCustomer.last_name}`
      },
      userConfig: { user_id: commoncookie, location_id: headerLocationId },
      receiptDataEntry: {
        sale_id: receivables[0].sale_id,
        customer_id: getCustomer.customer_id,
        // payment_amount: receivables[0].received_amount,
        payment_amount: Tdata.length > 0
          ? hasExcessPayment && type == 'advance'
            ? +Tdata.reduce((sum, item) => sum + item.payment_amount, 0) - calculatedAdvanceAmount
            : +Tdata.reduce((sum, item) => sum + item.payment_amount, 0)
          : saleUpdate.reduce((sum, item) => sum + (item.received_amount || 0), 0),
          receiptDate: receiptDate
      },
      location_id: headerLocationId,
      specialNumber:  receivables.map((d)=> d.sale_id).join(','),
      note: 'Sales Payment',
      // referenceNumber: Tdata,
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

    const paginationData = {
      brand: "",
      category: "",
      location_id: headerLocationId,
      max_price: "",
      min_price: "",
      payment_type: "",
      from: null,
      to: null,
      user_id: commoncookie,
      pageCount: 0,
      numPerPage: 20,
      searchString: "",
      sale_status: "All"
    };


    setReceData(receivables);
    console.log(data,"dsfdata");
    
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        receiptEntry(
          data,
          () => {},
          setModalTypeHandler,
          setLoaderStatusHandler,
          (response, resdata) => {
            // const cookies = new Cookies();
            // let storage = getsessionStorage()
            // let emp_id = storage?.employee_id || '';
            if (response === 200) {
              setDisableSubmit(false)
              setpaymentOpen(false);
              setTdata([]);
              setSelectionModel([]);
              notifyFunction(resdata.data);
              dispatch(listSalesPaginateAction(
                paginationData,
                commoncookie,
                headerLocationId,
                setModalTypeHandler,
                setLoaderStatusHandler
              ));
              // lklk sales order payment action button";
              // ledgerApi(data.saleUpdate)
            }
          },
        ),
      )
    );
    
    //this.setState({paymentOpen: false, Tdata: []})
  };

  // const getSalesDetails = (id) => {
  //   if (id !== '' && typeof id !== 'undefined') {
  //     let salesDetail = sales.filter((s) => s.sale_id === id);
  //     return salesDetail.length > 0 ? salesDetail[0] : {};
  //   } else {
  //     return {};
  //   }
  // };
  
  
  const pendingPayment = async (data) => {
    if(headerLocationId === 'null'){
      setOpenAlert(true)
      return
    }
    
    const { customer_id, sales_items, received_amount, sale_id } = data;
    const { data: customerPendingPaymentData } = await customFetch(
      API_URLS.GET_CUSTOMER_PENDING_PAYMENT(data.customer_id, headerLocationId),
      'GET',
      {}
    );

    const { data: customerData } = await customFetch(
      API_URLS.GET_CUSTOMER_BY_ID(customer_id),
      'GET',
      {}
    );

    const { data: mData } = await customFetch(
      API_URLS.GET_MANUAL_SCHEMES_BY_CUSTOMER(customer_id),
      'POST',
      {}
    );
    // const getCustomer = await customer.filter(
    //   (d) => customer_id === d.customer_id,
    // )[0];
    const getCustomer = customerData;
    // await sales_items.map((d) => {
    //   const taxes =
    //     product.filter((t) => t.item_id === d.item_id)[0].taxes || [];
    //   d.taxes = taxes;
    //   return d;
    // });
    let payData = [];
    payData.push({
      id: salesData.sale_id,
      po_number: salesData.invoice_number,
      paid_amount: salesData.received_amount,
      total: salesData.total,
      location_id: headerLocationId === 'null' ? salesData.location_id : headerLocationId,
      ledger_id : data.ledger_id
    });
    const targetSaleId = data.sale_id;
    const updatedChildRow = customerPendingPaymentData[0]?.childRow?.map(row => ({
      ...row,
      id: row.sale_id,
      po_number: row.invoice_number, 
      paid_amount: row.received_amount 
    }))?.sort((a, b) => (a.sale_id === targetSaleId ? -1 : b.sale_id === targetSaleId ? 1 : 0));
    customerPendingPaymentData[0].childRow = updatedChildRow;

    setclickedInvoice(salesData.sale_id)
    await setgetPay(customerPendingPaymentData[0].childRow);
    await setReceived_amount(received_amount);
    // setSale_id(sale_id)
    await setGetCustomer(getCustomer);
    await setManualNoteSchemes(mData)
    await setSalesItems(sales_items);
    await setPaymentOpen(true);

    // this.setState({ sales_items, getCustomer, paymentOpen: true, received_amount: +received_amount, sale_id })
  };

  const handleMenuItemClick = (event, index) => {
    if(index === 7) {
      setSelectedActionIndex(index); 
      setConfirmDialogOpen(true);   
    }
    else {
      props.handleChange(index);
      setOpen(false)
    }
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };
  return (
    <React.Fragment>
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirm Cancellation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this invoice? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="secondary">
            No
          </Button>
          <Button
            onClick={() => {
              props.handleChange(selectedActionIndex);
              setConfirmDialogOpen(false);
              setOpen(false); 
            }}
            color="primary"
            variant="contained"
          >
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>

{(sale_status !== 7 ) &&
      <Tooltip title="Actions">
        <IconButton
          size='small'
          ref={anchorRef}
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup='menu'
          onClick={handleToggle}
        >
          <MoreVertIcon fontSize='small' />
        </IconButton>
      </Tooltip>
      }
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({TransitionProps, placement}) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id='split-button-menu'>
                  {/* <MenuItem  value={1}
                      onClick={(event) => handleMenuItemClick(event, 1)}

                    >
                    Send SO
                  </MenuItem> */}
                  { salesData?.invoice_number === null && (sale_status === 1 || sale_status === 3) && (
                    <MenuItem
                      value={2}
                      onClick={(event) => handleMenuItemClick(event, 2)}
                      disabled={salesData?.status === 'Waiting Approval' ? true : false}
                    >
                      Create Invoice
                    </MenuItem>
                  )}
                  {
                    (sale_status === 1) && soToInvoiceId == null && soEditBtn &&(
                    <MenuItem
                      value={3}
                      onClick={(event) => handleMenuItemClick(event, 10)}
                    >
                      Edit
                    </MenuItem>
                    )
                  }
                    {(sale_status === 8 || sale_status === 1) && invoiceCreateBtn && (
                      
                    <MenuItem
                      value={2}
                      onClick={(event) => handleMenuItemClick(event, 2)}
                      disabled={shouldDisableConvertToInvoice}
                    >
                      {(sale_status === 1 || sale_status === 8) ? 'Convert to Invoice' : 'Edit'}
                    </MenuItem>
                  )}
                  {(
                    pathname !== '/sales/invoices' &&
                    (
                    ![3,1,8].includes(sale_status) ||
                    sale_status === 4 )) && (
                    <MenuItem
                      value={1}
                      onClick={(event) => handleMenuItemClick(event, 3)}
                      disabled={salesData?.status === 'Waiting Approval' ? true : false}
                    >
                      On Hold
                    </MenuItem>
                  )}
                  {sale_status > 1 && sale_status <= 3  && salesData?.sale_status_name !== "Return" &&(
                    <MenuItem
                      value={1}
                      onClick={(event) => handleMenuItemClick(event, 4)}
                    >
                      Ready to Ship
                    </MenuItem>
                  )}
                  {sale_status > 1 && sale_status <= 4 &&  salesData?.sale_status_name !== "Return" &&  pathname !== '/sales/invoices' &&(
                    <MenuItem
                      value={1}
                      onClick={(event) => handleMenuItemClick(event, 5)}
                    >
                      In Transit
                    </MenuItem>
                  )}
                  {sale_status > 1 && sale_status < 6 &&  salesData?.sale_status_name !== "Return" &&(
                    <MenuItem
                      value={1}
                      onClick={(event) => handleMenuItemClick(event, 6)}
                    >
                      Delivered
                    </MenuItem>
                  )}
                  {sale_status > 1  && (sale_status < 6 || sale_status === 8 ) && props.getData[0]?.due_amount !== "PaymentCompleted" &&  props.salesData.sale_status_name !== "Return"  && (
                    <MenuItem
                      value={1}
                       disabled={(isDirectChallan && hasConvertedInvoices) || salesData.updated_label === 'Partially Returned' ||  (salesData.collection_id !== null && salesData.collection_id !== undefined) }
                      onClick={(event) =>  handleMenuItemClick(event, 7)}
                    >
                   {props.selectedSaleStatus === 'Delivery Challan' ? 'Cancel DC' : 'Cancel Invoice'}
                    </MenuItem>
                  ) }

                  {/* { sale_status === 8 && (
                     <MenuItem
                     value={1}
                     
                     onClick={(event) =>  handleMenuItemClick(event, 7)}
                   >
                     Cancel
                   </MenuItem>
                  )} */}
                
                  { (sale_status === 7) &&(
                    <MenuItem
                      value={1}
                      disabled
                      onClick={(event) =>  handleMenuItemClick(event, 7)}
                    >
                     Cancelled
                    </MenuItem>
                  )}
                 {!(sale_status === 1 || sale_status === 3 || sale_status === 8) ? (<MenuItem
                    value={1}
                    disabled
                    onClick={(event) => handleMenuItemClick(event, 8)}
                  >
                    Delete
                  </MenuItem>
                  ) : sale_status !== 8 && soDeleteBtn && (
                  <MenuItem                    
                    value={1}
                    onClick={(event) => handleMenuItemClick(event, 8)}
                     disabled={sale_status === 1 && !!salesData?.convertedInvoiceOrderId}
                  >
                    Delete
                  </MenuItem>)}
                  {(payment !== 0 && sale_status !== 1 && sale_status !==8) && receiptCreateBtn && (
                    <MenuItem
                      value={1}
                      onClick={(event) => pendingPayment(salesData)}
                      disabled={salesData?.status === 'Waiting Approval' || sale_status === 7 || sale_status === 8}
                    >
                      Receipt
                    </MenuItem>
                  )}

                  {/* <ReturnDialog allFunctionsReturn={props.allFunctionsReturn} salesData={props.salesData} sales_items={props.sales_items} /> */}
                  {
                    sale_status !== 1 && salesData?.sale_status_name !== "Return" && cnCreateBtn   &&
                    <MenuItem
                      value={1}
                      onClick={(event) => handleMenuItemClick(event, 9)}
                      disabled={salesData?.status === 'Waiting Approval' || sale_status === 7 || salesData?.status === 10 || (
                        Array.isArray(salesData?.sales_items) &&
                        salesData.sales_items.length > 0 &&
                        salesData.sales_items.every(
                          item => item.return_quantity >= item.actual_quantity
                        )
                      ) || (salesData.collection_id !== null && salesData.collection_id !== undefined)}
                    >
                      Return
                    </MenuItem>
                  }
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
      {/* <PaymentDialog
        getPay={getPay}
        status={'edit'}
        activeINV={'INV'}
        selectionModel={selectionModel}
        setSelectionModel={setSelectionModel}
        entryvalue = {entryvalue}
        handleEntry = {setHandleEntry}
        received_amount={received_amount}
        // setReceived_amount={setReceived_amount}
        handleSubmit={paymentValidate}
        custType={'CUSTOMER'}
        pageType={"SALES"}
        type={0}
        Tdata={Tdata}
        setTdata={setTdata}
        custData={getCustomer}
        sales_items={sales_items}
        paymentOpen={paymentOpen}
        setpaymentOpen={setpaymentOpen}
        responseType={props.responseType}
        manualNoteSchemes={manualNoteSchemes}
        setManualNoteSchemes={setManualNoteSchemes}
        setReceived_amount = {(data) => setReceived_amount({received_amount:data})}
        clickedInvoice={clickedInvoice}
        disableSubmit={disableSubmit}
        addAdvanceAmount={addAdvanceAmount}
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
      <LocationAlert open={openAlert} onClose={()=>setOpenAlert(false)}/>
    </React.Fragment>
  );
}
