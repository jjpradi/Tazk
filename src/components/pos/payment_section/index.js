import React, {useEffect, useState, useRef, useContext, useMemo} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {getSalesCustomersByIdAction, listCustomerAction, listPickCustomerAction} from '../../../redux/actions/customer_actions';
import {createSalesAction} from '../../../redux/actions/sales_actions';
import {
  SetCustomer,
  SetPaymentData,
  SetPaymentRedirect,
  SetCustomerPreOrder,
  SetPaymentDataPreOrder,
  SetPaymentRedirectPreOrder,
} from '../../../redux/actions/pos_product_list';
import {listPosSessionAction} from '../../../redux/actions/pos_session';
import {
  Grid,
  Divider,
  Card,
  Button,
  Typography,
  TextField,
  FormControl,
  Checkbox,
  FormControlLabel,
  Table,
  TableHead,
  TableCell,
  TableBody,
  TableRow,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import context from '../../../context/CreateNewButtonContext';
import {listStockLocationSequenceAction} from '../../../redux/actions/stock_Location_actions';
import {listPosCreationAction} from '../../../redux/actions/pos_creations_actions';
import PaymentPage from './NewPayment';
import {useNavigate} from 'react-router-dom';
import Customer from './Customer';
import {Remarks} from './Types/Remarks';
import DB from '../../../db';
import Keyboard from './Keyboard';
import {getAppConfigDataAction} from '../../../redux/actions/app_config_actions';
// import app_config_sevices from "../../../services/app_config_sevices";
// import posSale from "../../../pages/pointofsale/posSale";
import {taxes, getIgst, totalCost,totalCostPrice, disTax, taxForCommonDiscount, calculateRoundOffforPOS, splitTax} from '../checkout_products/commonTax';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import EditCustomer from './EditCustomer';
import EditEmail from './EditEmail';
import {createTransactionAction} from '../../../redux/actions/transaction_actions';
import {
  createPreOrderAction,
  CancelPreOrderAction,
} from '../../../redux/actions/preOrder_actions';
import {sendNtfy} from '../../../firebase/firebase.service';
import {
  getLoginRoleAction,
  getLoginTokenAction,
} from '../../../redux/actions/userRole_actions';
import Cookies from 'universal-cookie';
import notificationType from '../../../firebase/notify_type';
import {PreOrderConvertDataAction} from '../../../redux/actions/pos_product_list';
import PosContext from '../../../context/PosContext';
import { listChartOfAccountsAction} from '../../../redux/actions/chartOfAccounts'
import { CreateNotificationAction } from 'redux/actions/notification_actions';
import { getDateTimeFormat } from 'utils/getTimeFormat';
import {getDenominationValidationByIdAction} from '../../../redux/actions/cashOutIn_actions'
import apiCalls from 'utils/apiCalls';
import { getsessionStorage } from 'pages/common/login/cookies';
import { headerStyle } from 'utils/pageSize';
import { getManualNoteSchemesByIdAction } from 'redux/actions/manualNotes_actions';
import Creditdebit from 'pages/sales/paymentSalesPurchase/Creditdebit';
import { roleType } from 'utils/roleType';
import { subtract } from 'lodash';
import moment from 'moment';

const Cust = ({posId, s_id, setConvertData, preOrder,mail_configuration,sms_configuration,handleSmsMailConfiguration,cashOutIn_denomination,responseType, location_id}) => {
  const {
    customerReducer: {customer, pickCustomer},
    productListReducer: {
      tab_count,
      product_lists,
      paymentModes,
      pre_order_list,
      pre_order_status,
    },
    productReducer: {product},
    stockLocationReducer: {stocklocation},
    posSessionReducer: {pos_session},
    posCreationReducer: {pos_creation},
    appConfigReducer: {app_config_data},
    ChartOfAccountsReducer: {chartOfAccounts},
    UserRoleReducer: {loginToken, loginRole},
  } = useSelector((state) => state); //stockLocationReducer:{stocklocation}
  const [setpayment] = React.useState('card');
  const [open, setopen] = React.useState(false);
  const [taxtype, settaxtype] = React.useState(false);
  const [pos_session_id, setPosSessionId] = useState(null);
  const tempdis = useRef(null);
  const tempinitsformVal = useRef(null);
  const setPreOrderCustomerRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [isEntered, setEntered] = useState(false);
  const [appConfigData, setAppConfigData] = useState({});
  const [note, setNote] = useState('');
  const [editCust, setEditCust] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [disable, setDisable] = useState(0);
  const [smsDisable, setSmsDisable] = useState(0);
  const [manualNoteSchemes, setManualNoteSchemes] = useState([]);
  const [creditnote, setCreditNote] = useState(false)
  const {setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId} =
    useContext(context);
  const {
    activePosLocationId,
    activePosSessionId,
    setActivePosSessionIdHandler,
  } = useContext(PosContext);
  const [comment, setComment] = useState('');
  
  const [enable, setEnable] = useState(false);
  const [customerTransactionDetails, setCustomerTransactionDetails] = useState({
    productInfo: '',
    reference: '',
    type: '',
  });
  const [pageCount, setPageCount] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  // const cookies = new Cookies();
  let storage = getsessionStorage()

  const employee_id = storage?.employee_id || 0;

  const PreOrderConvertData =
    pre_order_status === false
      ? product_lists?.[tab_count]?.preOrderConvertData || {}
      : {};
  // const [one,SetCustomer] = useState({})
  // const [Tdata,SetTData] = useState([])
  // const [list,SetList] = useState([])

  var db = new DB('pos_session');

  const dispatch = useDispatch();
  const history = useNavigate();

  const one =
    pre_order_status === false
      ? product_lists?.[tab_count]?.customer || {}
      : pre_order_list['pre_order'].customer || {};
  const Tdata =
    pre_order_status === false
      ? product_lists[tab_count].paymentData
      : pre_order_list['pre_order'].paymentData || [];
  const list =
    pre_order_status === false
      ? product_lists[tab_count].productData
      : pre_order_list['pre_order'].productData || [];
  const discount =
    pre_order_status === false
      ? product_lists[tab_count].discount
      : pre_order_list['pre_order'].discount || [];


      // console.log('yuiopppp',one, )
  useEffect(() => {
    const data = {
      pageCount: pageCount,
      numPerPage: pageSize,
      searchString:''
    }
    apiCalls(
      setModalTypeHandler, 
      setLoaderStatusHandler,
      dispatch(listPickCustomerAction(data, true, setLoaderStatusHandler)),
      // dispatch(listCustomerAction(data, true, setLoaderStatusHandler)),
    );
  }, [pageCount, pageSize])

  const dis = () => {
    
    apiCalls(
      setModalTypeHandler, 
      setLoaderStatusHandler,
      // !customer?.length && dispatch(listCustomerAction(true, setLoaderStatusHandler)),
      !pos_session?.length && dispatch(listPosSessionAction(commoncookie,headerLocationId,true,setLoaderStatusHandler)),
      dispatch(listStockLocationSequenceAction({sequence_type: 'SO'},setLoaderStatusHandler,commoncookie,headerLocationId)),
      dispatch(getAppConfigDataAction()),
      !chartOfAccounts?.length && dispatch(listChartOfAccountsAction())
    );
  };

  const setone = (data) => {
    if (pre_order_status) {
      dispatch(SetCustomerPreOrder(data));
      // SetCustomer(data)
    } else {
      dispatch(SetCustomer(data, posId));
      //customerClick()
      // SetCustomer(data)
    }
  };

  useEffect(() => {
  setManualNoteSchemes([]);

  if (one?.creditNote_balance > 0 && one?.customer_id) {
    dispatch(
      getManualNoteSchemesByIdAction(
        'customer',
        one.customer_id,
        (response) => {
          setManualNoteSchemes(
            response?.map(i => ({ ...i, selected: false }))
          );
        }
      )
    );
  }
}, [one?.customer_id,one?.creditNote_balance]);


  // console.log('getcustomerrrrr',app_config_data, one, manualNoteSchemes, creditnote)
  const setTdata = (data) => {
    if (pre_order_status === false) {
      dispatch(SetPaymentData(data, posId));
    } else {
      dispatch(SetPaymentDataPreOrder(data, posId));
    }
  };

  const updateCustomerTransactionDetailes = (e) => {
    const {name, value} = e.target;
    setCustomerTransactionDetails({
      ...customerTransactionDetails,
      [name]: value,
    });
  };
  const setPaymentRedirectFunction = () => {
    if (pre_order_status === false) {
      if (Object.keys(PreOrderConvertData).length > 0) {
        if (PreOrderConvertData.order_status === 'Canceled') {
          setConvertData({});
          dispatch(PreOrderConvertDataAction({}, posId));
          dispatch(SetCustomer({}, posId));
        }
      }
      dispatch(SetPaymentRedirect(false, posId));
    } else {
      dispatch(SetPaymentRedirectPreOrder(false, posId));
    }
  };

  tempdis.current = dis;
  tempdis.current.setTdata = setTdata;
  useEffect(() => {
    // if(!customer.length){
    tempdis.current();
    setPreOrderCustomerRef.current();
    tempinitsformVal.current();
    // }
  }, []);
  

  useEffect(() => {
    tempdis.current?.setTdata([]);
  }, []);

  // const disCost = () => {
  //   let total = 0;
  //   list.forEach((d) => {
  //     total += (((d.quantity || 1) * d.unit_price) / 100) * (d.discount || 0);
  //   });
  //   return total;
  // };
  // const totalPrice = () => {
  //   let total = 0;
  //   list.forEach((d) => {
  //     total += ((d.quantity || 1) * d.unit_price);
  //   });
  //   return total;
  // };

  const customerClick = () => {
    // console.log('customerclick', open)
    setopen(!open);
  };

  useEffect(() => {
    if(mail_configuration[0]?.mail_name === 'POS'){
      setDisable(mail_configuration[0]?.isActive)
    } else{
      setDisable(0)
    }

  },[mail_configuration])

  useEffect(() =>{
    if(sms_configuration[0]?.sms_role_name === 'POS'){
      setSmsDisable(sms_configuration[0]?.isActive)
    } else{
      setSmsDisable(0)
    }
  },[sms_configuration])

  const lastFetchedCustomerId = useRef(null);

  useEffect(() => {
    if (!pickCustomer?.length || !Object.keys(one).length || !appConfigData.state) return;

    const selectedCustomerId = Number(one.customer_id || one.id || 0);
    const mappedCustomer = pickCustomer.find((d) => {
      const rowCustomerId = Number(d.customer_id || d.id || 0);
      return rowCustomerId === selectedCustomerId;
    });

    const applyTaxType = (cust) => {
      const sameState = appConfigData.state?.toLowerCase() === cust?.state?.toLowerCase();
      settaxtype(!!sameState);
      const mappedCustomerId = Number(cust?.customer_id || cust?.id || 0);
      if (mappedCustomerId !== selectedCustomerId) return;
      if (mappedCustomerId !== Number(one.customer_id || one.id || 0)) {
        setone(cust);
      }
    };

    if (mappedCustomer) {
      applyTaxType(mappedCustomer);
    } else if (lastFetchedCustomerId.current !== selectedCustomerId) {
      lastFetchedCustomerId.current = selectedCustomerId;
      dispatch(getSalesCustomersByIdAction(selectedCustomerId, (response) => {
        applyTaxType(response?.[0] || {});
      }));
    }
  }, [one, pickCustomer, appConfigData.state]);

  // console.log(customer,'dss888',one)

  useEffect(() => {
    console.log(app_config_data, 'app_config_data')
    let sessionId = pos_session.filter(
      (f) => f.posId === posId && f.active === 'A',
    );
    const companyName = app_config_data.filter((f) => f.key_name === 'company.name');
    const fullAddress =
      sessionId[0]?.address ||
      app_config_data.filter((f) => f.key_name === 'address.fulladdress');
    const city = sessionId[0]?.city || '';
    const emailData = sessionId[0]?.email || '';
    const gstinData = app_config_data.filter(
      (f) => f.key_name == 'company.gstin/uin',
    );
    const companyMobile = sessionId[0]?.phone_number || '';
    const state =
      sessionId[0]?.state ||
      app_config_data.filter((f) => f.key_name === 'address.state');
    const web = app_config_data.filter((f) => f.key_name == 'web.base.url');
      if(companyName.length > 0){
        handleSmsMailConfiguration()
      }
    const roundedOffEnabled = app_config_data.filter(f => f.key_name === 'company.applyRoundOff')
    setAppConfigData({
      companyName: companyName?.length > 0 ? companyName[0].value : '',
      companyAddress:
        fullAddress?.length > 0 && typeof fullAddress === 'object'
          ? fullAddress[0].value
          : fullAddress,
      companyEmail:
        emailData?.length > 0 && typeof emailData === 'object'
          ? emailData[0].value
          : emailData,
      companyMobile:
        companyMobile?.length > 0 && typeof companyMobile === 'object'
          ? companyMobile[0].value
          : companyMobile,
      gstin: gstinData?.length > 0 ? gstinData[0].value : '',
      city: city?.length > 0 && typeof city === 'object' ? city[0].value : city,
      state:
        state?.length > 0 && typeof state === 'object' ? state[0].value : state,
      web: web?.length > 0 ? web[0].value : '',
      roundedOffEnabled: roundedOffEnabled.length > 0 ? roundedOffEnabled[0].value : 'false'
    });
  }, [app_config_data]);

  // useEffect(()=>{

  // let sessionId= pos_session.filter(f=>f.posId ===posId&&f.active=="A")
  // if(sessionId.length>0){
  //   setPosSessionId(sessionId[0].id)
  // }
  // dispatch(listPosCreationAction(true, setLoaderStatusHandler))
  // },[posId])

  useEffect(() => {
    apiCalls(
      setModalTypeHandler, 
      setLoaderStatusHandler,
      dispatch(listPosCreationAction(true, setLoaderStatusHandler))
      );
  },[])

  const initsformVal = () => {
    let sessionId = pos_session.filter(
      (f) => f.posId === posId && f.active === 'A',
    );
    if (sessionId.length > 0) {
      setActivePosSessionIdHandler(sessionId[0].id);
    }
    apiCalls(
      setModalTypeHandler, 
      setLoaderStatusHandler,
      sessionId.length > 0 && dispatch(getDenominationValidationByIdAction(sessionId[0].cashBox)),
      );
    
  };
  tempinitsformVal.current = initsformVal;
  useEffect(() => {
    tempinitsformVal.current();
    return () => {
      setPosSessionId({});
    };
  }, [posId, pos_session]);

  // console.log(Tdata, 'Tdata')

  const setPreOrderCustomer = async() => {
    if (
      Object.keys(PreOrderConvertData).length > 0 &&
      Object.keys(product_lists[tab_count].customer).length === 0
    ) {
      const preOrderCustomer = pickCustomer.filter(
        (f) => f.customer_id === PreOrderConvertData.customer_id,
      );
      if (preOrderCustomer.length > 0) {
        await dispatch(SetCustomer(preOrderCustomer[0], posId));
      }
    }
  };
  setPreOrderCustomerRef.current = setPreOrderCustomer;

  // const randomNum = () => {
  //   var val = Math.floor(1000 + Math.random() * 9000);
  //   return val
  // }

  const getIgstCommon = (taxes, key) => {
    // console.log(taxes, key,'taxes, key')
    let tax = '';
    if (taxes) {
      taxes.forEach((t) => {
        if (t.tax_group === 'IGST') {
          tax = t[key];
        }
      });
    }
    return tax;
  };

  const getPrice = (key) => {
    let total = 0;
    list.forEach((d) => {
      total = +d[key];
    });
    return total;
  };

  const handlePageChange = async (page) => {
    setPageCount(page);
  }

  const handlePageSizeChange = async (size) => {
    setPageSize(size);
  };

  const checkDetails = async () => {
    if (Object.keys(one).length && list.length && checkPayment()) {
      setEnable(true);
      await networkCheck();
      return;
    }

    // setopenDialog(true);
  };

  const ledgerApi = (sales_payments) => {
    const data = {
      // "code": "234",
      // "entity": "324",
      location_id: activePosLocationId,
      specialNumber: '324',
      note: 'POS',
      referenceNumber: sales_payments,
      voucherTypeId: 1,
    };
    const ledgerTaxSplit = splitTax(taxForCommonDiscount(list, discount, taxtype));
    const temp = {
      Sales: {desc: 'Total unit price', amt: totalCost(list, null, null, taxtype).toFixed(2)},
      'SGST Payable': {
        desc: 'SGST% x Total unit price',
        amt: ledgerTaxSplit.sgst.toFixed(2),
      },
      'CGST Payable': {
        desc: 'CGST% x Total unit price',
        amt: ledgerTaxSplit.cgst.toFixed(2),
      },
      'IGST Payable': {desc: 'IGST% x Total unit price', amt: 0},
      // 'Cash - MPK': {
      //   desc: 'Total sales amount',
      //   amt: (totalCost(list) + taxes(list)).toFixed(2),
      // },
    }; 
    const accountTransaction = [];
    chartOfAccounts.forEach((d) => {
      const {id, creditSign, debitSign} = d;
      const dd = {accountId: id, description: temp[d.name]?.desc || ''};

      if (
        [
          'Sales',
          'SGST Payable',
          'CGST Payable',
          'IGST Payable',
        ].includes(d.name)
      ) {
        dd.amount = creditSign * temp[d.name]?.amt || 0
          // Number(creditSign) === 1
          //   ? temp[d.name]?.amt
          //   : `-${temp[d.name]?.amt}`;
        accountTransaction.push(dd);
      } else if(sales_payments.filter( f => f.paymentLedgerId === d.id || f.cashboxLedgerId === d.id).length){
         let Recevable = sales_payments.filter( f => f.paymentLedgerId === d.id || f.cashboxLedgerId === d.id)?.[0] || {}
          
            dd.amount = debitSign * Recevable?.payment_amount || 0
            accountTransaction.push(dd);
     }else if(sales_payments.filter( f => f.payment_type === 'Cash (INR)').length && d.name === 'Cash - MPK'){
      let Recevable = sales_payments.filter( f => f.payment_type === 'Cash (INR)')?.[0] || {}
          
      dd.amount = debitSign * Recevable?.payment_amount || 0
      accountTransaction.push(dd);
     }
    });
    data.accountTransaction = accountTransaction;
    
    apiCalls(
      setModalTypeHandler, 
      setLoaderStatusHandler,
      dispatch(createTransactionAction(data,true,setLoaderStatusHandler))
    );
  };

  // const networkCheck = async () => {

  //   const { customer_id, first_name, last_name } = one
  const CancelPreOrder = async () => {
    const Tdata1 =
    pre_order_status === false
      ? product_lists[tab_count].preOrderConvertData.payments
      : pre_order_list['pre_order'].paymentData || [];

    let Data = {
      ...PreOrderConvertData,
      pre_order_payment: Tdata1,
      pos_session_id: activePosSessionId,
    };
    const received_amount = await Tdata1.reduce(function (acc, obj) {
      return acc + +obj.payment_amount;
    }, 0);
    const change_amount = await Tdata1.reduce(function (acc, obj) {
      return acc + +obj.cash_adjustment;
    }, 0);
    
    apiCalls(
      setModalTypeHandler, 
      setLoaderStatusHandler,
      dispatch(
        CancelPreOrderAction(Data, true, setLoaderStatusHandler, (data) => {
          setConvertData({});
          dispatch(PreOrderConvertDataAction({}, posId));
          dispatch(SetCustomer({}, posId));
          if (!data){
            history('/pointofsale/payment/posInvoice', {state:{
              id: one.customer_id,
              posId,
              received_amount,
              change_amount,
              s_id,
              Tdata1,
              pre_order_status,
              preOrder,
              note,
              location_id,
              taxtype
            }});
          }
        }),
      )
    );
  };
  const floatnum = (num) => {
    const str = num.toFixed(2);
    const numarray = str.split('.');
    let convert = numarray[0];
    if (numarray[1]) {
      convert += '.' + numarray[1];
    } else {
      convert += '.00';
    }
    return parseFloat(convert);
  };

  const calculateItemUnitPrice = (d, totalDiscount) => {
    if(d.isTaxIncluded){
      if(d.selling_price){
        return ((d.selling_price - totalDiscount) / (1 + (getIgst(d) / 100))) + totalDiscount
      }

      if(d.stock_type === 0){
        return ((d.unit_price - totalDiscount) / (1 + (getIgst(d) / 100))) + totalDiscount;
      }

      return ((d.unit_price - totalDiscount) / (1 + (getIgst(d) / 100))) + totalDiscount;
    }

    if(d.selling_price){
      return (d.selling_price / (getIgst(d) + 100)) * 100;
    }

    if(d.stock_type === 0){
      return d.unit_price;
    }

    if(d.discount){
      const disForOneQty = +(d.discount / d.quantity).toFixed(2)
      if(d.discount_type === 0){
        const temp_dis = ( disForOneQty / 100 ) * d.unit_price
        return d.unit_price - temp_dis;
      }else{
        const temp_dis = d.unit_price - (disTax(disForOneQty, getIgst(d)) || 0);
        return +(temp_dis.toFixed(2));
      }
    }

    return d.unit_price
  }

  const calculateDiscountForEachProduct = (list, discount) => {
    let amount = 0
      list.forEach((item) => {
        if(item.isTaxIncluded){
          const unitPrice = item.selling_price ? item.selling_price : item.unit_price
          amount = (unitPrice / totalCost(list, 'noDiscount', null, taxtype)) * (discount?.amount || 0)
        }
        else{
          const unitPrice = item.unit_price + ((item.unit_price * getIgst(item)) / 100)
          amount = (unitPrice / totalCost(list, 'noDiscount', null, taxtype)) * (discount?.amount || 0)
        }
      })
    return amount
  }

  const calculateSubTotal = (discount, list, taxes) => {
    let subTotal = 0
    if(discount > 0){
      if(list.isTaxIncluded){
        const productPrice = (list.selling_price ? list.selling_price : list.unit_price) - discount
        subTotal = productPrice
      }
      else{
        const productPrice = (list.selling_price ? list.selling_price : list.unit_price) - discount
        const productTax = (productPrice * getIgstCommon(taxes, 'tax_rate')) / 100
        subTotal = productPrice + productTax
      }
    }
    else{
      if(list.isTaxIncluded){
        const productPrice = (list.selling_price ? list.selling_price : list.unit_price)
        subTotal = productPrice
      }
      else{
        const productPrice = (list.selling_price ? list.selling_price : list.unit_price)
        const productTax = (productPrice * getIgstCommon(taxes, 'tax_rate')) / 100
        subTotal = productPrice + productTax
      }
    }
    return (subTotal * (list?.quantity || 1))
  }

  const calculateItemTaxAmount = (product, taxes, discount) => {
    let productTax = 0
    if (product.isTaxIncluded) {
      const productPrice = product.selling_price ? product.selling_price : product.unit_price
      const productDiscount = (productPrice / totalCost(list, 'noDiscount', null, taxtype)) * discount
      const discountedPrice = Number(productPrice - productDiscount).toFixed(2)
      const priceWithoutTax = Number(discountedPrice / (1 + (getIgstCommon(taxes, 'tax_rate') / 100)).toFixed(2))
      const tax = Number((discountedPrice - priceWithoutTax) * (product?.quantity || 1)).toFixed(2)
      productTax = Number(tax)
    }
    else {
      productTax = floatnum((((product?.quantity || 1) * ((product.selling_price ? product.selling_price : product.unit_price) - discount)) / 100) * getIgstCommon(taxes, 'tax_rate'))
    }
    return Number(productTax.toFixed(2))
  }
console.log(Tdata, 'paymentData')
  const networkCheck = async () => {
    const { customer_id, first_name, last_name, email, company_name } = one;
    const totalDiscount = calculateDiscountForEachProduct(list, discount)
    const sales_items = list.map((d, i) => {
      const {
        item_id,
        description,
        stock_type,
        sku,
        quantity,
        cost_price,
        max_price,
        unit_price,
        taxes,
        name,
        // discount,
        lot_number,
        lot_id,
        selling_price,
        discount_type,
        lots,
        hsn_code,
      } = {...d};

      const filter = {
        name,
        item_id,
        description,
        sku,
        lot_number,
        lot_id,
        non_s_lot: lots.filter(d => d.lot_number === lot_number),
        selling_price,
        taxes,
        hsn_code,
        line: i + 1,
        quantity: quantity || 1,
        stock_type,
        item_cost_price:
          stock_type === 0
          ? 0.00
            // ? selling_price
            //   ? selling_price
            //   : (max_price / (getIgst(d) + 100)) * 100
            : lot_number !== null && typeof lot_number !=='undefined' ?
              lots.filter(l=> l.lot_number == lot_number).slice(0, quantity || 1)[0]?.trans_items_cost_price
            : lots.slice(0, quantity || 1)[0]?.trans_items_cost_price ? lots.slice(0, quantity || 1)[0]?.trans_items_cost_price
            : cost_price,
        item_unit_price: Number(calculateItemUnitPrice(d, totalDiscount).toFixed(2)),
        discount: discount.amount > 0 ? totalDiscount : 0,
        // +(discount / quantity).toFixed(2) || 0,
        discount_type: 1,
        print_option: 1,
        delivered_qty: quantity,
        sub_total: calculateSubTotal(totalDiscount, d, taxes),
        sales_item_taxes: {
          line: i + 1,
          name: getIgstCommon(taxes, 'tax_category'),
          percent: getIgstCommon(taxes, 'tax_rate'),
          tax_type: getIgstCommon(taxes, 'tax_group'),
          rounding_code: 0,
          cascade_sequence: 0,
          item_tax_amount: calculateItemTaxAmount(d, taxes, totalDiscount),
          sales_tax_code_id: 0,
          jurisdiction_id: 0,
          tax_category_id: getIgstCommon(taxes, 'tax_category_id'),
        },
      };
      return filter;
    });

const groupedSalesItems = list.reduce((acc, d, i) => {
  // 1. Extract keys for grouping
  const item_id = d.item_id;
  const item_unit_price = Number(calculateItemUnitPrice(d, totalDiscount).toFixed(2));
  
  // Safety check: Skip invalid entries
  if (!item_id) return acc;

  const key = `${item_id}_${item_unit_price}`;

  // 2. Prepare current row data
  const quantity = Number(d.quantity || 1);
  const subTotal = Number(d.sub_total || 0);
  const discountAmount = Number(d.discount || 0);
  const itemTaxAmount = Number(d.sales_item_taxes?.item_tax_amount || 0);
  const itemCostPrice = Number(d.item_cost_price || 0);

  // 3. LOT FILTERING LOGIC
  // Filter the lots array to ONLY include the specific lot(s) for this line item
  const matchingLots = Array.isArray(d.lots) 
    ? d.lots.filter(l => l.lot_number === d.lot_number) 
    : [];

  if (!acc[key]) {
    // Initializing the group
    acc[key] = {
      ...d,
      item_id,
      item_unit_price,
      quantity,
      delivered_qty: quantity,
      sub_total: subTotal,
      discount: discountAmount,
      // Initialize with only the specific lots for this line
      lots: [...matchingLots],
      non_s_lot: [...matchingLots],
      // Track total cost for weighted average later
      total_accumulated_cost: itemCostPrice * quantity,
      sales_item_taxes: d.sales_item_taxes ? { ...d.sales_item_taxes } : {
        line: i + 1,
        name: getIgstCommon(d.taxes, 'tax_category'),
        percent: getIgstCommon(d.taxes, 'tax_rate'),
        tax_type: getIgstCommon(d.taxes, 'tax_group'),
        rounding_code: 0,
        cascade_sequence: 0,
        item_tax_amount: calculateItemTaxAmount(d, d.taxes, totalDiscount),
        sales_tax_code_id: 0,
        jurisdiction_id: 0,
        tax_category_id: getIgstCommon(d.taxes, 'tax_category_id'),
      }
    };
  } else {
    // Adding to existing group
    acc[key].quantity += quantity;
    acc[key].delivered_qty += quantity;
    acc[key].sub_total += subTotal;
    acc[key].discount += discountAmount;
    acc[key].total_accumulated_cost += (itemCostPrice * quantity);
    acc[key].sales_item_taxes.item_tax_amount += calculateItemTaxAmount(d, d.taxes, totalDiscount)
    
    // Aggregate Tax
    if (acc[key].sales_item_taxes) {
      acc[key].sales_item_taxes.item_tax_amount = 
        Number((acc[key].sales_item_taxes.item_tax_amount + itemTaxAmount).toFixed(2));
    }

    // Append ONLY the corresponding lots for this record
    acc[key].lots = [...acc[key].lots, ...matchingLots];
    acc[key].non_s_lot = [...acc[key].non_s_lot, ...matchingLots];
  }

  return acc;
}, {});

// Final map to clean up line numbers and weighted cost
const finalSalesItems = Object.values(groupedSalesItems).map((item, index) => {
  const lineNo = index + 1;
  
  const formatted = {
    ...item,
    line: lineNo,
    // Calculate the weighted average cost price for the group
    item_cost_price: item.quantity > 0 
      ? Number((item.total_accumulated_cost / item.quantity).toFixed(2)) 
      : 0,
    discount_type: 1,
    print_option: 1
  };

  if (formatted.sales_item_taxes) {
    formatted.sales_item_taxes.line = lineNo;
  }

  // Remove helper property
  delete formatted.total_accumulated_cost;

  return formatted;
});

console.log(finalSalesItems);

    // const received_amount = Tdata.reduce(function (acc, obj) {
    //   return obj.payment_amount >= obj.due
    //     ? acc + +obj.due
    //     : acc + +obj.payment_amount;
    // }, 0);
    let received_amount =
      Tdata.reduce(function (acc, obj) {
        return acc + +obj.payment_amount;
      }, 0);
    // }, this.state.getCustomer.creditNote_balance) + this.state.received_amount;
    received_amount = manualNoteSchemes.filter(i => i.selected).reduce((a, c) => a + +c.new_adjusted_amount, received_amount)
    const change_amount = Tdata.reduce(function (acc, obj) {
      return acc + +obj.cash_adjustment;
    }, 0);
    let custarray = pickCustomer?.length > 0 ? pickCustomer : pickCustomer?.data
    const custData = custarray?.find((d) => d.customer_id === customer_id);
    const posFilter = pos_creation.filter((f) => f.posId === posId);
    const invoicePattern =
      posFilter.length > 0 ? posFilter[0].invoice_pattern : '';

    const sales_payment = Tdata.map((d) => d.payment_type.split(' ')[0]).join(
      '/',
    );

    const data = {
      customer_id,
      pos_session_id: activePosSessionId,
      custData,
      posSale: true,
      no_mail: disable === 1 ? false : true,
      no_sms: smsDisable === 1 ? false : true,
      email,
      note,
      sequence_id: posFilter[0]?.sequence_id,
      total: discount.amount > 0
        ? appConfigData.roundedOffEnabled === 'true' ? Math.round(totalCost(list, 'noDiscount', discount, taxtype) + taxForCommonDiscount(list, discount, taxtype)) : Number((totalCost(list, 'noDiscount', discount, taxtype) + taxForCommonDiscount(list, discount, taxtype)).toFixed(2))
        : appConfigData.roundedOffEnabled === 'true' ? Math.round(totalCost(list, 'noDiscount', null, taxtype)) : Number((totalCost(list, 'noDiscount', null, taxtype)).toFixed(2)),
      isRoundedOffNegative: calculateRoundOffforPOS(appConfigData.roundedOffEnabled, Number((totalCost(list, 'noDiscount', discount, taxtype)).toFixed(2)), Number(splitTax(taxForCommonDiscount(list, discount, taxtype)).cgst.toFixed(2))) >= 0 ? 0 : 1,
      rounded_off: calculateRoundOffforPOS(appConfigData.roundedOffEnabled, Number((totalCost(list, 'noDiscount', discount, taxtype)).toFixed(2)), Number(splitTax(taxForCommonDiscount(list, discount, taxtype)).cgst.toFixed(2))),
      received_amount:
        Object.keys(PreOrderConvertData).length > 0
          ? received_amount + PreOrderConvertData.received_amount
          : appConfigData.roundedOffEnabled === 'true' ? Math.round(received_amount) : received_amount,
      email_content: 'payment invoice generated',
      employee_id,
      comment,
      invoice_number: invoicePattern,
      quote_number: null,
      sale_status: 2,
      counter_id: null,
      work_order_number: '',
      sale_type: 0,
      location_id: posFilter[0]?.stockLocation,
      so_number: '',
      reference: '',
      sales_taxes: [{
        jurisdiction_id: 0,
        tax_category_id: 1,
        tax_type: 0,
        tax_group: '',
        sale_tax_basis: '',
        sale_tax_amount: taxes(list),
        print_sequence: '1',
        name: '',
        tax_rate: '',
        sales_tax_code_id: 0,
        rounding_code: 0,
      }],
      sales_items: finalSalesItems,
      sales_payment: Tdata,
      updateCreditNote: {
        manualNoteSchemes: manualNoteSchemes.filter(i => i.selected && i.advance_id === undefined),
        advanceledger: manualNoteSchemes.filter(i => i.selected && i.advance_id !== undefined),
        customer_id: one.customer_id,
        customer_ledger_id: one.ledger_id,
        company_name: one.company_name || `${one.first_name} ${one.last_name}`
      },
      appConfigData,
      pre_order: PreOrderConvertData,
      creditNote_balance: one.creditNote_balance,
      customerTransactionDetails,
      transactionEntryData: {
        total_cost_price: totalCostPrice(list),
        total_unit_price: Number((totalCost(list, 'noDiscount', discount, taxtype)).toFixed(2)),
        total_with_gst: Number(discount.amount > 0
          ?(totalCost(list, 'noDiscount', discount, taxtype) + taxForCommonDiscount(list, discount, taxtype)).toFixed(2)
          : (totalCost(list, 'noDiscount', null, taxtype)).toFixed(2)),
        gst_inter: splitTax(taxForCommonDiscount(list, discount, taxtype)).cgst,
        tcs_inter: 0,
        tds_inter: 0,
        rounded_off: calculateRoundOffforPOS(appConfigData.roundedOffEnabled, Number((totalCost(list, 'noDiscount', discount, taxtype)).toFixed(2)), Number(splitTax(taxForCommonDiscount(list, discount, taxtype)).cgst.toFixed(2))),
        isRoundedOffNegative: calculateRoundOffforPOS(appConfigData.roundedOffEnabled, Number((totalCost(list, 'noDiscount', discount, taxtype)).toFixed(2)), Number(splitTax(taxForCommonDiscount(list, discount, taxtype)).cgst.toFixed(2))) >= 0 ? 0 : 1,
      }
    };
    const preOrderData = {
      customer_id,
      location_id: data.location_id,
      employee_id,
      total: data.total,
      order_status: 'Active',
      received_amount: data.received_amount,
      order_items: sales_items,
      pre_order_payment: Tdata,
      pos_session_id: activePosSessionId,
    };
    console.log(data, 'payload')

    if (window.navigator.onLine) {
      if (pre_order_status === false) {

        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(
            createSalesAction(
              data,
              commoncookie,
              headerLocationId,
              true,
              setLoaderStatusHandler,
              (response) => {
                if (!response) {
                  history('/pointofsale/payment/posInvoice', {
                    state: {
                      id: one.customer_id,
                      posId,
                      received_amount,
                      change_amount,
                      s_id,
                      Tdata,
                      pre_order_status,
                      preOrder,
                      note,
                      location_id,
                      taxtype
                    }
                  });
                  // "lklk pos here";
                  // ledgerApi(data.sales_payment);
                  // const cookies = new Cookies();
                  let storage = getsessionStorage()
                  let emp_id = storage?.employee_id || '';

                  apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    dispatch(
                      getLoginRoleAction(emp_id, (role_name, token, content) => {
                        if (!roleType.includes(role_name)) {
                          let notify_type = notificationType('Point of sales');
                          let notify_content = content?.filter(
                            (m) => m.notification_type === notify_type,
                          );
                          if (notify_content.length) {
                            let amount_value = data.total || '';
                            let invNum = data.invoice_number || '';
                            let locationName =
                              stocklocation.find(
                                (m) => m.location_id === data.location_id,
                              ) || {};
                            let productData = list[0].category || '';
                            let content_body = ` \n${amount_value} \n${locationName.location_name} \n${productData} ${invNum}`;
                            sendNtfy(token, notify_content[0]?.title, content_body);
                            dispatch(CreateNotificationAction({ content_body: content_body, title: notify_content[0]?.title, time: getDateTimeFormat(new Date()), "active": "1" }))
                          }

                        }
                      }),
                    )
                  );
                }
              },
              setEnable,
              activePosLocationId,
            ),
          )
        );
        await db.offlineApi(
          {
            sync: true,
            customer_name: first_name + ' ' + last_name,
            amount: (totalCost(list, null, null, taxtype) + taxes(list)).toFixed(2),
            ...data,
          },
          posId,
        );
      } else if (pre_order_status) {

        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(
            createPreOrderAction(
              preOrderData,
              true,
              setLoaderStatusHandler,
              (data) => {
                if (!data)
                  history('/pointofsale/payment/posInvoice', {
                    state: {
                      id: one.customer_id,
                      posId,
                      received_amount,
                      change_amount,
                      s_id,
                      Tdata,
                      pre_order_status,
                      preOrder,
                      note,
                      location_id,
                      taxtype
                    }
                  });
                // ledgerApi(preOrderData.pre_order_payment);
              },
            ),
          )
        );
      }
    } else {
      await db.offlineApi(
        {
          customer_name: company_name || first_name + ' ' + last_name,
          amount: (totalCost(list, null, null, taxtype) + taxes(list)).toFixed(2),
          ...data,
        },
        posId,
      );
      history('/pointofsale/payment/posInvoice', {
        state: {
          id: one.customer_id,
          posId,
          received_amount,
          change_amount,
          s_id,
          Tdata,
          pre_order_status,
          preOrder,
          note,
          location_id,
          taxtype
        }
      });
    }
  };

  const advanceAmount = useMemo(() => {
    return manualNoteSchemes.reduce((acc, curr) => {
      if (curr.selected) {
        return acc + curr.balance_amount
      } else {
        return acc;
      }
    }, 0)
  }, [manualNoteSchemes])

  const checkPayment = () => {
    const getAmount = Tdata.reduce(function (acc, obj) {
      return acc + +obj.payment_amount;
    }, 0);
    let totalamount = 0
    if(discount.amount > 0){
      totalamount = (+((totalCost(list, 'noDiscount', discount, taxtype)) + taxForCommonDiscount(list, discount, taxtype)).toFixed(2));
    }
    else{
      totalamount = (+(totalCost(list, 'noDiscount', null, taxtype)).toFixed(2));
    }

    const roundedGetAmount = appConfigData.roundedOffEnabled === 'true' ? Math.round(getAmount): Number(getAmount.toFixed(2))
    const roundedTotalAmount = appConfigData.roundedOffEnabled === 'true' ?  Math.round(totalamount) : Number(totalamount.toFixed(2))
    const roundedPreOrderRemainingAmount = appConfigData.roundedOffEnabled === 'true' ? Math.round(totalamount - PreOrderConvertData.received_amount) : Number((totalamount - PreOrderConvertData.received_amount).toFixed(2))
    const creditBal = advanceAmount
    if (roundedGetAmount > 0 && +totalamount && roundedGetAmount >= +roundedTotalAmount) {
      //getAmount >= totalamount && +totalamount
      return true;
    } else if (getAmount > 0 && pre_order_status) {
      return true;
    } else if (Object.keys(PreOrderConvertData).length > 0 && roundedPreOrderRemainingAmount === roundedGetAmount) {
      return true;
    } else if (roundedTotalAmount < creditBal ) {
      // calculateAdjustedAmount(totalamount)
      return true;
    } else if((creditBal + getAmount) >= roundedTotalAmount) {
      return true
    } else {
      return false;
    }
  };

  useEffect(() => {
    let tot = (totalCost(list, null, null, taxtype) + taxes(list)).toFixed(2);
    calculateAdjustedAmount(tot)
  
  }, [ manualNoteSchemes.filter(i => i.selected).length]);

  function calculateAdjustedAmount(total) {
    let tempTotal = total;
    let arr = manualNoteSchemes.map(i => ({ ...i, adjusted_amount : i.amount - i.balance_amount}));
    let res = arr.map((e, i) => {
      if (!e.selected) return e;
      if (tempTotal >= e.balance_amount) {
        tempTotal -= e.balance_amount;
        return { ...e, new_adjusted_amount : e.balance_amount };
      } else if (tempTotal > 0) {     
        let data = { ...e, new_adjusted_amount: tempTotal };
        tempTotal = 0;
        return data;
      } else {
        return { ...e, new_adjusted_amount: tempTotal };
      }
    });

    // const temp = generateUsedFor(res)

    setManualNoteSchemes(res)
  }

  function generateUsedFor(temp){
    // if(!selectionModel.length) return temp
    // const temp_model = selectionModel.map(i => ({total:i.total, temp_id : i.id}))
    // console.log('tempppp', temp)
    const temp_model = discount === undefined || discount?.amount === 0 || totalCost(list, null, null, taxtype) === 0 ? (totalCost(list, 'noDiscount', null, taxtype)).toFixed(2) : ((totalCost(list, 'noDiscount', discount, taxtype)) + taxForCommonDiscount(list, discount, taxtype)).toFixed(2)
    const credit = temp.map(i => ({...i, temp_used_for:{}, temp_amount : i.amount}))
    let s = 0;
    let c = 0;



    // let max = Math.max(1, credit.length);
    // while (s < max && c < max) {
    //   if (temp_model[s]?.total < credit[c]?.temp_amount && credit[c]?.temp_amount > 0 && credit[c]?.selected) {
    //     credit[c].temp_used_for[temp_model[s]?.temp_id] = +(temp_model[s]?.total.toFixed(2));
    //     credit[c].temp_amount -= temp_model[s]?.total;
    //     temp_model[s].total = 0;
    //     s++;
    //   } else if (temp_model[s]?.total > credit[c]?.temp_amount && credit[c]?.temp_amount > 0 && credit[c]?.selected) {
    //     credit[c].temp_used_for[temp_model[s]?.temp_id] = +(credit[c]?.temp_amount.toFixed(2));
    //     temp_model[s].total -= credit[c]?.temp_amount;
    //     credit[c].temp_amount = 0;
    //     c++;
    //   } else {
    //     if(credit[c]?.selected){
    //       credit[c].temp_used_for[temp_model[s]?.temp_id] = +(credit[c]?.temp_amount.toFixed(2));
    //       credit[c].temp_amount = 0;
    //       if(temp_model[s]){
    //         temp_model[s].total = 0;
    //       }
    //       s++;
    //       c++;
    //     }else{
    //       c++;
    //     }
        
    //   }

    // }
    return credit
    

  }
  const openFun =(value) =>{
    setopen (value)
  }
console.log(PreOrderConvertData, 'PreOrderConvertData')
  return (
    <div style={{height: '100%', display: 'flex', width: '100%'}}>
      <Card style={{width: '90%', margin: 'auto', padding: '10px 0', maxWidth: '1300px' }}>
        <Customer
          open={open}
          customer={pickCustomer}
          handleClose={customerClick}
          one={one}
          setone={setone}
          setopen = {openFun}
          handlePageChange={handlePageChange}
          handlePageSizeChange={handlePageSizeChange}
          pageSize={pageSize}
          pageCount={pageCount}
          location_id={location_id}
        />
        <Grid container>
          <Grid size={12}>
            <h2
              style={{
                margin: '10px 0 25px 0',
                color: 'rgba(0,0,0,0.6)',
                textAlign: 'center',
                fontSize:headerStyle.fontSize,
                fontWeight:headerStyle.fontWeight
              }}
            >
              {pre_order_status === false ? PreOrderConvertData.order_status === 'Canceled' ? 'PAYMENT REFUND'
                : 'PAYMENT PAGE'
                : 'PREORDER PAYMENT PAGE'}
            </h2>
          </Grid>
          <Grid
            style={{textAlign: 'start', padding: '0 50px'}}
            size={{
              sm: 12,
              md: 12,
              lg: 6
            }}>
            <div>
              <div
                style={{
                  display: 'flex',
                  marginTop: 0,
                  color: 'rgba(0, 0, 0, 0.23)',
                }}
              >
                <h3 style={{margin: 'auto 5px 5px', color: 'rgba(0,0,0,0.6)' ,fontSize:headerStyle.fontSize,fontWeight:headerStyle.fontWeight}}>
                  CUSTOMER DETAILS
                </h3>
                <div style={{marginTop: 'auto', marginBottom: 1}}>
                  {Object.keys(one)?.length ? (
                    <CheckIcon style={{color: 'green', fontSize: '25px'}} />
                  ) : (
                    <CloseIcon style={{color: 'red', fontSize: '25px'}} />
                  )}
                </div>
                {Object.keys(PreOrderConvertData).length === 0 && (
                  <Button
                    color='inherit'
                    style={{marginLeft: 'auto', marginTop: 'auto'}}
                    variant='outlined'
                    onClick={(e) => {
                      customerClick();
                      setone({});
                    }}
                  >
                    <span style={{color: 'black', display: 'flex'}}>
                      Pick customer
                    </span>
                  </Button>
                )}
              </div>
              <Divider style={{height: '2px'}} />
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                height: '100%',
              }}
            >
              {Object.keys(one).length ? (
                <div style={{display: 'flex', marginLeft: '10px'}}>
                  {editCust ? (
                    <EditCustomer
                      one={one}
                      setone={setone}
                      setEditCust={setEditCust}
                    />
                  ) : (
                    <div style={{width: '50%'}}>
                      <div style={{display: 'flex', alignItems: 'center'}}>
                        <Typography
                          variant='h6'
                        >
                          {`${one.company_name || one.first_name}`}
                        </Typography>
                        <div>
                          <IconButton
                            onClick={() => setEditCust(true)}
                            aria-label='delete'
                          >
                            <EditIcon fontSize='small' />
                          </IconButton>
                        </div>
                      </div>

                      <Typography style={{margin: 0, lineHeight: 1.6, fontSize: '12px'}}>{`${
                        one.address ? one.address + ',' : ''
                      } ${one.city ? one.city + ',' : ''} ${
                        one.state ? one.state + ',' : ''
                      } ${one.country || ''} - ${one.zip || ''}`}</Typography>
                      <Typography
                        style={{margin: '0 0 10px 0', fontSize: '12px'}}
                      >{`Mobile No : ${one.phone_number || ''}`}</Typography>
                    </div>
                  )}

                  <div style={{marginLeft: 'auto'}}>
                    {editEmail ? (
                      <EditEmail
                        one={one}
                        setone={setone}
                        setEditEmail={setEditEmail}
                      />
                    ) : (
                      <div style={{display: 'flex', alignItems: 'center'}}>
                        <Typography>{one.email}</Typography>

                        <div>
                          <IconButton
                            onClick={() => setEditEmail(true)}
                            aria-label='delete'
                          >
                            <EditIcon fontSize='small' />
                          </IconButton>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <h4
                  style={{
                    margin: '10px 5px 5px',
                    color: 'rgba(0,0,0,0.5)',
                    height: '130px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  Pick Customer for more Details!
                </h4>
              )}
              {PreOrderConvertData.order_status !== 'Canceled' && Object.keys(one).length ? (
                <Grid container spacing={5}>
                  <Grid
                    size={{
                      lg: 4,
                      md: 4,
                      sm: 4,
                      xs: 4
                    }}>
                    <TextField
                      name='productInfo'
                      variant='outlined'
                      value={customerTransactionDetails.productInfo}
                      label={'Product Info'}
                      onChange={(e) => updateCustomerTransactionDetailes(e)}
                    />
                  </Grid>
                  <Grid
                    size={{
                      lg: 4,
                      md: 4,
                      sm: 4,
                      xs: 4
                    }}>
                    <TextField
                      name='reference'
                      variant='outlined'
                      value={customerTransactionDetails.reference}
                      label={'Reference'}
                      onChange={(e) => updateCustomerTransactionDetailes(e)}
                    />
                  </Grid>
                  <Grid
                    size={{
                      lg: 4,
                      md: 4,
                      sm: 4,
                      xs: 4
                    }}>
                    <TextField
                      name='type'
                      variant='outlined'
                      value={customerTransactionDetails.type}
                      label={'Type'}
                      onChange={(e) => updateCustomerTransactionDetailes(e)}
                    />
                  </Grid>
                </Grid>
              ) : (
                ''
              )}
              {PreOrderConvertData.order_status !== 'Canceled' && <div>
                <Grid>
                  <div
                    style={{display: 'flex', marginTop: 10}}
                    className='payment_top_media'
                  >
                    <Grid container display='flex'>
                      <h3
                        style={{
                          margin: 'auto 5px 5px',
                          color: 'rgba(0,0,0,0.6)',
                          fontSize:headerStyle.fontSize,
                          fontWeight:headerStyle.fontWeight
                        }}
                      >
                        PRODUCT DETAILS
                      </h3>
                      <div>
                        {list.length ? (
                          <CheckIcon
                            style={{color: 'green', fontSize: '25px'}}
                          />
                        ) : (
                          <CloseIcon style={{color: 'red', fontSize: '25px'}} />
                        )}
                      </div>
                    </Grid>
                    <Grid justifyContent='flex-end'>
                      <Button
                        style={{
                          backgroundColor: '#999999',
                          height: 30,
                          color: 'black',
                        }}
                        variant='contained'
                        disabled={
                          Object.keys(PreOrderConvertData).length > 0 &&
                          PreOrderConvertData.order_status === 'Canceled'
                            ? true
                            : false
                        }
                        onClick={() => setPaymentRedirectFunction()}
                      >
                        Edit
                      </Button>
                    </Grid>
                  </div>
                </Grid>
                <Divider style={{height: '2px'}} />
                {list.length ? (
                  <Grid style={{marginTop: '5px'}} container spacing={0}>
                    <Grid size={9}>
                      <Typography style={{margin: '10px 0 0 10px'}}>
                        Price
                      </Typography>
                    </Grid>
                    <Grid size={3}>
                      <Typography
                        style={{
                          margin: '10px 0 0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'end',
                        }}
                      > {Object.keys(one).length ? `${Number(totalCost(list, 'noDiscount', null, taxtype) - Number(taxForCommonDiscount(list, discount, taxtype).toFixed(2))).toFixed(2)} ₹`
                       : `${
                         discount === undefined || discount?.amount === 0 || totalCost(list, null, null, taxtype) === 0
                          ? totalCost(list, 'noDiscount', null, taxtype).toFixed(2)
                             : (totalCost(list, 'noDiscount', discount, taxtype) + taxForCommonDiscount(list, discount, taxtype)).toFixed(2)
                        } ₹`}</Typography>
                    </Grid>

                    {
                      discount.amount > 0 &&
                      <>
                        <Grid size={9}>
                          <Typography style={{margin: '10px 0 0 10px'}}>
                            Discount
                          </Typography>
                        </Grid>
                        <Grid size={3}>
                          <Typography
                            style={{
                              margin: '10px 0 0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'end',
                            }}
                          >{`${discount.amount.toFixed(2)} ₹`}</Typography>
                        </Grid>
                      </>
                    }

                    {
                      Object.keys(one).length ?
                      <>
                        {taxtype === true ? (
                          (() => {
                            const taxSplit = splitTax(taxForCommonDiscount(list, discount, taxtype));
                            return <>
                            <Grid size={9}>
                              <Typography style={{margin: '10px 0 0 10px'}}>
                                CGST
                              </Typography>
                            </Grid>
                            <Grid size={3}>
                              <Typography
                                style={{
                                  margin: '10px 0 0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'end',
                                }}
                              >
                                {`${taxSplit.cgst.toFixed(2)} ₹`}
                              </Typography>
                            </Grid>
                            <Grid size={9}>
                              <Typography style={{margin: '10px 0 0 10px'}}>
                                SGST
                              </Typography>
                            </Grid>
                            <Grid size={3}>
                              <Typography
                                style={{
                                  margin: '10px 0 0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'end',
                                }}
                              >
                                {`${taxSplit.sgst.toFixed(2)} ₹`}
                              </Typography>
                            </Grid>
                          </>
                          })()
                        ) : (
                          <>
                            <Grid size={9}>
                              <Typography style={{margin: '10px 0 0 10px'}}>
                                IGST
                              </Typography>
                            </Grid>
                            <Grid size={3}>
                              <Typography
                                style={{
                                  margin: '10px 0 0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'end',
                                }}
                              >{`${discount !== undefined && discount?.amount !== 0 ? taxForCommonDiscount(list, discount, taxtype).toFixed(2) : taxes(list).toFixed(2)} ₹`}</Typography>
                            </Grid>
                          </>
                        )}

                        {
                          appConfigData.roundedOffEnabled === 'true' &&
                          <>
                            <Grid size={9}>
                              <Typography style={{margin: '10px 0 0 10px'}}>
                                Round Off
                              </Typography>
                            </Grid>
                            <Grid size={3}>
                              <Typography
                                style={{
                                  margin: '10px 0 0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'end',
                                }}
                              >{`${calculateRoundOffforPOS(appConfigData.roundedOffEnabled, Number((totalCost(list, 'noDiscount', discount, taxtype)).toFixed(2)), Number(taxForCommonDiscount(list, discount, taxtype).toFixed(2)))} ₹`}</Typography>
                            </Grid>
                          </>
                        }
                      </>
                      : <></>
                    }

                    {/* <Grid size={12} 
        item style={{ margin: "10px 0" }}
          >
          <FormControl
            component='fieldset'
            fullWidth={true}>
            <FormControlLabel control={<Checkbox style={{}}
              name='preorder'
              size='medium'
              color='primary'
              />}
              label='Advanced Payment Deduct'
              name='preorder' />
          </FormControl>
        </Grid> */}

                    <Grid style={{margin: '15px 0'}} size={12}>
                      <Divider />
                    </Grid>
                    <Grid size={9}>
                      <Typography
                        style={{
                          margin: '0 0 0 10px',
                          fontSize:headerStyle.fontSize,
                          fontWeight:headerStyle.fontWeight
                        }}
                      >
                        Total Amount
                      </Typography>
                    </Grid>
                    <Grid size={3}>
                      <Typography
                        style={{
                          margin: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'end',
                          fontSize:headerStyle.fontSize,
                          fontWeight:headerStyle.fontWeight
                        }}
                      >{`₹${
                         discount === undefined || discount?.amount === 0 || totalCost(list, null, null, taxtype) === 0
                          ? appConfigData.roundedOffEnabled === 'true' ? Math.round(totalCost(list, 'noDiscount', null, taxtype)) : (totalCost(list, 'noDiscount', null, taxtype)).toFixed(2)
                             : appConfigData.roundedOffEnabled === 'true' ? Math.round(totalCost(list, 'noDiscount', discount, taxtype) + taxForCommonDiscount(list, discount, taxtype)) : (totalCost(list, 'noDiscount', discount, taxtype) + taxForCommonDiscount(list, discount, taxtype)).toFixed(2)
                        }`}
                      </Typography>
                    </Grid>
                    <Grid style={{margin: '15px 0'}} size={12}>
                      <Divider />
                    </Grid>
                    {Object.keys(PreOrderConvertData).length > 0 && (
                      
                      <>
                        <Grid size={9}>
                          <Typography
                            style={{
                              margin: '0 0 22px 10px',
                              fontWeight: 'bold',
                              fontSize: '1.1rem',
                            }}
                          >
                            Advance Amount
                          </Typography>
                        </Grid>
                        <Grid size={3}>
                          <Typography
                            style={{
                              margin: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'end',
                              fontWeight: 'bold',
                              fontSize: '1.1rem',
                            }}
                          >{`- ${PreOrderConvertData.received_amount.toFixed(
                            2,
                          )} ₹`}</Typography>
                        </Grid>
                      </>
                    )}
                    {manualNoteSchemes.length > 0 && (
                        (<Creditdebit
                        // creditdebit={one} 
                        manualNoteSchemes={manualNoteSchemes}
                        setManualNoteSchemes={setManualNoteSchemes}
                        creditnote = {creditnote}
                        setCreditNote = {setCreditNote}
                       />)
                      // <>
                      
                      //   <Grid size={9}>
                      //     <Typography
                      //       style={{
                      //         margin: '0 0 22px 10px',
                      //         fontWeight: 'bold',
                      //         fontSize: '1.1rem',
                      //       }}
                      //     >
                      //       Advance Amount
                      //     </Typography>
                      //   </Grid>
                      //   <Grid size={3}>
                      //     <Typography
                      //       style={{
                      //         margin: 0,
                      //         display: 'flex',
                      //         alignItems: 'center',
                      //         justifyContent: 'end',
                      //         fontWeight: 'bold',
                      //         fontSize: '1.1rem',
                      //       }}
                      //     >{`- ${one.creditNote_balance.toFixed(
                      //       2,
                      //     )} ₹`}</Typography>
                      //   </Grid>
                      // </>
                    )}
                  </Grid>
                ) : (
                  <>
                    <h4
                      style={{
                        margin: '10px 5px 5px',
                        color: 'rgba(0,0,0,0.5)',
                        height: '130px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      Product List is Empty!
                    </h4>
                    {Object.keys(PreOrderConvertData).length > 0 && (
                      <>
                        <Grid style={{marginTop: '5px'}} container spacing={0}>
                          <Grid size={9}>
                            <Typography
                              style={{
                                margin: '0 0 0 10px',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                              }}
                            >
                              {
                                PreOrderConvertData.order_status === 'Canceled' ? 
                                'Amount to be Refunded'
                                : 'Advance Amount'
                              }
                            </Typography>
                          </Grid>
                          <Grid size={3}>
                            <Typography
                              style={{
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'end',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                              }}
                            >{`${PreOrderConvertData.received_amount.toFixed(
                              2,
                            )} ₹`}</Typography>
                          </Grid>
                        </Grid>
                      </>
                    )}
                  </>
                )}
              </div>}

              {
                PreOrderConvertData.order_status === 'Canceled' && <div>
                  <Grid>
                    <div
                      style={{display: 'flex', marginTop: 10}}
                      className='payment_top_media'
                    >
                      <Grid container display='flex'>
                        <h3
                          style={{
                            margin: 'auto 5px 5px',
                            color: 'rgba(0,0,0,0.6)',
                            fontSize:headerStyle.fontSize,
                            fontWeight:headerStyle.fontWeight
                          }}
                        >
                          PRE ORDER PAYMENT DETAILS
                        </h3>
                      </Grid>
                    </div>
                  </Grid>
                  <Divider style={{height: '2px'}} />

                  <Grid style={{marginTop: '5px'}} container spacing={0}>
                    <Grid style={{margin: '15px 0'}} size={12}>
                      <Table>
                        <TableHead>
                          <TableCell>Amount</TableCell>
                          <TableCell>Mode of Payment</TableCell>
                          <TableCell>Payment Time</TableCell>
                          <TableCell>Received By</TableCell>
                        </TableHead>
                        
                        {
                          PreOrderConvertData.payments.length > 0 ? (
                            <TableBody>
                              {
                                PreOrderConvertData.payments.map((payment) => (
                                  <TableRow key={payment.id}>
                                    <TableCell>{payment.payment_amount}</TableCell>
                                    <TableCell>{payment.payment_type}</TableCell>
                                    <TableCell>{moment(payment.payment_time).format('DD/MM/YYYY hh:mm A')}</TableCell>
                                    <TableCell>{`${payment.first_name} ${payment.last_name || ''}`}</TableCell>
                                  </TableRow>
                                ))
                              }
                            </TableBody>
                          ) : (
                            <TableBody>
                              <TableRow>
                                <TableCell>{PreOrderConvertData.received_amount}</TableCell>
                                <TableCell></TableCell>
                                <TableCell>{moment(PreOrderConvertData.order_time).format('DD/MM/YYYY hh:mm A')}</TableCell>
                                <TableCell></TableCell>
                              </TableRow>
                            </TableBody>
                          )
                        }
                      </Table>
                    </Grid>

                    <Grid style={{margin: '15px 0'}} size={12}>
                      <Divider />
                    </Grid>
                  </Grid>
                </div>
              }
              {
                PreOrderConvertData.order_status === 'Canceled' && <div>
                  <Grid>
                    <div
                      style={{display: 'flex', marginTop: 10}}
                      className='payment_top_media'
                    >
                      <Grid container display='flex'>
                        <h3
                          style={{
                            margin: 'auto 5px 5px',
                            color: 'rgba(0,0,0,0.6)',
                            fontSize:headerStyle.fontSize,
                            fontWeight:headerStyle.fontWeight
                          }}
                        >
                          PRE ORDER PRODUCT DETAILS
                        </h3>
                      </Grid>
                    </div>
                  </Grid>
                  <Divider style={{height: '2px'}} />

                  <Grid style={{marginTop: '5px'}} container spacing={0}>
                    {
                      PreOrderConvertData.order_items.map((product) => (
                        <>
                          <Grid size={9}>
                            <Typography style={{margin: '10px 0 0 10px', fontSize: '12px'}}>
                              {`${product.name} (Quantity: ${product.quantity})`}
                            </Typography>
                          </Grid>
                          <Grid size={3}>
                            <Typography
                              style={{
                                margin: '10px 0 0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'end',
                                fontSize: '12px'
                              }}
                            >{`${(product.item_unit_price + (product.item_unit_price * (getIgst(product) / 100))) * product.quantity}₹`}</Typography>
                          </Grid>
                        </>
                      ))
                    }

                    <Grid style={{margin: '15px 0'}} size={12}>
                      <Divider />
                    </Grid>

                    {Object.keys(PreOrderConvertData).length > 0 && (
                      <>
                        <Grid size={9}>
                          <Typography
                            style={{
                              margin: '0 0 22px 10px',
                              fontWeight: '600',
                              fontSize: '13px',
                            }}
                          >
                            Amount to be Refunded
                          </Typography>
                        </Grid>
                        <Grid size={3}>
                          <Typography
                            style={{
                              margin: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'end',
                              fontWeight: '600',
                              fontSize: '13px',
                            }}
                          >{`${PreOrderConvertData.received_amount.toFixed(
                            2,
                          )} ₹`}</Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>


                </div>
              }
            </div>
          </Grid>
          <Grid
            className='payment_top_media'
            style={{textAlign: 'start', padding: '0 50px'}}
            size={{
              xs: 12,
              sm: 12,
              md: 12,
              lg: 6
            }}>
            <div style={{display: 'flex'}} className='payment_top_media'>
              <h3 style={{margin: 'auto 5px 5px',fontSize:headerStyle.fontSize,fontWeight:headerStyle.fontWeight, color: 'rgba(0,0,0,0.6)'}}>
                PAYMENT DETAILS
              </h3>

              <div style={{marginTop: 'auto'}}>
                {checkPayment() ? (
                  <CheckIcon style={{color: 'green', fontSize: '25px'}} />
                ) : (
                  <CloseIcon style={{color: 'red', fontSize: '25px'}} />
                )}
              </div>
              <div style={{margin: 'auto 0 0 auto'}}>
                <Keyboard
                  isEntered={isEntered}
                  setEntered={setEntered}
                  total={(totalCost(list, null, null, taxtype) + taxes(list)).toFixed(2)}
                  index={index}
                  Tdata={Tdata}
                  setTdata={setTdata}
                />
              </div>
            </div>
            <Divider style={{height: '2px'}} />
            <div style={{display: 'flex', width: '100%'}}>
              <div style={{padding: '16px 0', width: '100%'}}>
                <PaymentPage
                  invoiceselect={Object.keys(one).length > 0 ? true : false}
                  posId={posId}
                  pModes={paymentModes}
                  isEntered={isEntered}
                  setEntered={setEntered}
                  index={index}
                  setIndex={setIndex}
                  setpayment={setpayment}
                  Tdata={Tdata}
                  setTdata={setTdata}
                  total={
                    Object.keys(PreOrderConvertData).length > 0 &&
                    PreOrderConvertData.order_status === 'Canceled'
                      ? PreOrderConvertData.received_amount
                      : Object.keys(PreOrderConvertData).length > 0
                      ? (
                          (discount.amount === 0 ? 
                            (totalCost(list, 'noDiscount', null, taxtype)).toFixed(2)
                            : ((totalCost(list, 'noDiscount', discount, taxtype)) + taxForCommonDiscount(list, discount, taxtype)).toFixed(2)) -
                          (advanceAmount +
                            PreOrderConvertData.received_amount)
                        ).toFixed(2)
                      : discount.amount === 0 ? 
                        (totalCost(list, 'noDiscount', null, taxtype)).toFixed(2)
                        : ((totalCost(list, 'noDiscount', discount, taxtype)) + taxForCommonDiscount(list, discount, taxtype)).toFixed(2)
                  }
                  cashOutIn_denomination={cashOutIn_denomination}
                  responseType={responseType}
                  roundedOffEnabled={appConfigData.roundedOffEnabled}
                />
              </div>
            </div>
          </Grid>
          <Grid size={12}>
            <Grid container display='flex' justifyContent='flex-end'>
              {one.creditNote_balance > 0 ?
              <>
               <Grid
                 style={{display: 'flex', padding: '0 50px'}}
                 size={{
                   xs: 12,
                   sm: 12,
                   md: 12,
                   lg: 6
                 }}></Grid>
              <Grid
                style={{
                  display: 'flex',
                  padding: '0 50px',
                  margin: '0 0 20px 0',
                }}
                size={{
                  xs: 12,
                  sm: 12,
                  md: 12,
                  lg: 3
                }}>
                {product_lists[tab_count].productData.length > 0 &&
                  pre_order_status === false && (
                    <TextField
                      sx={{marginTop: 'auto'}}
                      fullWidth
                      id='standard-basic'
                      name='note'
                      variant='outlined'
                      size='small'
                      onChange={(e) => setNote(e.target.value)}
                      label='Invoice Note'
                      // minRows={2}
                      multiline
                    />
                  )}
              </Grid>
              <Grid
                className='payment_top_media'
                style={{
                  display: 'flex',
                  padding: '0 50px',
                  margin: '0 0 20px 0',
                }}
                size={{
                  xs: 12,
                  sm: 12,
                  md: 12,
                  lg: 3
                }}>
                <TextField
                  sx={{marginTop: 'auto'}}
                  fullWidth
                  name='comment'
                  onChange={(e) => setComment(e.target.value)}
                  id='standard-basic'
                  variant='outlined'
                  size='small'
                  label='Remarks'
                  multiline
                />
              </Grid>
              </>
              :
              <>
              <Grid
                style={{display: 'flex', padding: '0 50px'}}
                size={{
                  xs: 12,
                  sm: 12,
                  md: 12,
                  lg: 6
                }}>
                {product_lists[tab_count].productData.length > 0 &&
                  pre_order_status === false && (
                    <TextField
                      sx={{marginTop: 'auto'}}
                      fullWidth
                      id='standard-basic'
                      name='note'
                      variant='outlined'
                      size='small'
                      onChange={(e) => setNote(e.target.value)}
                      label='Invoice Note'
                      minRows={2}
                      multiline
                    />
                  )}
              </Grid>
              <Grid
                className='payment_top_media'
                style={{
                  display: 'flex',
                  padding: '0 50px',
                  margin: '0 0 20px 0',
                }}
                size={{
                  xs: 12,
                  sm: 12,
                  md: 12,
                  lg: 6
                }}>
                <TextField
                  sx={{marginTop: 'auto'}}
                  fullWidth
                  name='comment'
                  onChange={(e) => setComment(e.target.value)}
                  id='standard-basic'
                  variant='outlined'
                  size='small'
                  label='Remarks'
                  multiline
                />
              </Grid>
              </>
              }
              <Grid
                display='flex'
                justifyContent='flex-end'
                className='payment_top_media'
                style={{padding: '0 50px', marginTop: 'auto'}}
                size={{
                  xs: 12,
                  sm: 12,
                  md: 12,
                  lg: 6
                }}>
                <Button
                  style={{backgroundColor: 'primary.secondary'}}
                  variant='contained'
                  onClick={() => setPaymentRedirectFunction()}
                  color='secondary'
                >
                  Back
                </Button>
                {Object.keys(one).length &&
                list.length &&
                checkPayment() &&
                enable === false ? (
                  <Button
                    style={{marginLeft: 20}}
                    onClick={checkDetails}
                    variant='contained'
                    color='primary'
                  >
                    Validate
                  </Button>
                ) : Object.keys(PreOrderConvertData).length > 0 &&
                  PreOrderConvertData.order_status === 'Canceled' ? (
                  <Button
                    style={{marginLeft: 20}}
                    variant='contained'
                    color='primary'
                    onClick={CancelPreOrder}
                  >
                    Refund
                  </Button>
                ) : (
                  <Button
                    style={{marginLeft: 20}}
                    disabled
                    variant='contained'
                    color='primary'
                  >
                    Validate
                  </Button>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>
    </div>
  );
};

export default Cust;
