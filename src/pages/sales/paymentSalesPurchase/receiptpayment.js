import React, { useEffect, useState, useRef, useContext, useMemo } from 'react';
import { Grid, Divider, Card, Button, Typography, Autocomplete, TextField, Switch, FormControl, FormControlLabel, Box, Stack, IconButton, Tooltip } from '@mui/material';
import { Remarks } from '../../../components/pos/payment_section/Types/Remarks';
import Keyboard from "../../../components/pos/payment_section/Keyboard";
import PaymentPage from '../../../components/pos/payment_section/NewPayment';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PayablesTable from './PayablesTable';
import toMomentOrNull from '../../../utils/DateFixer';
import Creditdebit from './Creditdebit';
import PaymentMethodServices from '../../../services/payment_method_services';
// import ContactsIcon from '@mui/icons-material/Contacts';
import { useDispatch, useSelector } from 'react-redux';
import { getDenominationValidationByIdAction } from '../../../redux/actions/cashOutIn_actions';
import context from '../../../context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import { customerAsCompanyAction, getbyidCustomerAction } from 'redux/actions/customer_actions';
import { paymentview } from 'redux/actions/purchase_actions';
import { listSalesOutstandingAction, saleIdGET } from 'redux/actions/sales_actions';
import { getSupplierDetailsByIdAction } from 'redux/actions/vendor_actions';
import { getManualNoteSchemesByIdAction } from 'redux/actions/manualNotes_actions';
import { listProductAction } from 'redux/actions/product_actions';
import { useCustomFetch } from 'utils/useCustomFetch';
import CommonDialog from 'components/commonDialog';
import CombinedTableComponent from './CombinedTable';
import { Stepper, Step, StepLabel } from '@mui/material';
import { StepContent } from '@mui/material';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import totalIcon from '../../../assets/dashboardIcons/rupee.svg';
import NewPaymentTable from './NewPaymentTable';
import isEqual from 'lodash/isEqual';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import SummaryTable from './SummaryTable';
import API_URLS from '../../../utils/customFetchApiUrls';

const Cust = ({
  custType,
  setTdata,
  Tdata,
  custData: one = {},
  sales_items: list,
  handleClose,
  handleSubmit,
  // received_amount,
  status,
  getPay,
  setSelectionModel,
  entryvalue,
  handleEntry,
  selectionModel,
  activeINV,
  responseType,
  manualNoteSchemes,
  setManualNoteSchemes,
  type,
  PayData,
  setPayData,
  setgetPay,
  setstatus,
  AdvanceSubmit,
  setSalesItems,
  setReceived_amount,
  setGetCustomer,
  editData = {},
  addAdvanceAmount = { current: null },
  pageType,
  clickedInvoice,
  setAdvanceAmount,
  disableSubmit
}) => {
  // console.log("one",one)
  const dispatch = useDispatch();
  // console.log(selectionModel,"ytrytrhhh");
  
  // console.log(manualNoteSchemes,"manualNoteSchemes");
  const [setpayment] = React.useState('card');
  const [taxtype, settaxtype] = React.useState(true);
  const [index, setIndex] = useState(0);
  const [isEntered, setEntered] = useState(false);
  const [Total, setTotal] = useState(0);
  const tempinitsform = useRef(null);
  const [invoiceselect, setinvoiceselect] = useState(false);
  const [allPaymentModes, setAllPaymentModes] = useState([]);
  const [creditnote, setCreditNote] = useState(false)
  const { cashOutIn_denomination } = useSelector((state) => state.CashOutInReducer);
  const [tempManualNotes, setTempManualNotes] = useState([])
  const [isCashTransaction, setIsCashTransaction] = useState(false)
  const { locateCashBox } = useSelector((state) => state.cashBoxReducer);
  const [advanceConfirmDialogOpen, setAdvanceConfirmDialogOpen] = useState(false)
  const [resetCredit, setResetCredit] = useState(false);
  const [paymentSelected, setPaymentSelected] = useState([]);
  const [isAmountTallied, setIsAmountTallied] = useState(false);
  const [summaryData, setSummaryData] = useState([])
  /*
  {
  paymentCreditNoteId: 438
  sale_id: [2458, 2455],
  isCreditNote: false
  }
  */

  const editReceiptData = Object.keys(editData).length > 0

  const [formValues, setFormValues] = useState({
    customer_id: editReceiptData && editData.customer_id !== undefined ? editData.customer_id : null,
    supplier_id: editReceiptData && editData.supplier_id !== undefined ? editData.supplier_id : null,
    advance: false,
    amount: null,
    receiptDate: moment().format('YYYY-MM-DD')
  });

  const hasCreditNote = selectionModel?.some(item => ['Credit Note', 'Unused Credit'].includes(item.type));

  const customFetch = useCustomFetch()

  const [activeStep, setActiveStep] = useState(0);
  const steps = ['customer and receivable', 'Payment', 'Print receipt'];
  const steps2 = ['vendor and payable', 'Payment', 'Print receipt'];
  const selectedSteps = type == 0 ? steps : steps2;

  const isVendorPayment = typeof one.debitNote_balance !== 'undefined' ? true : false;

  const { commoncookie, setLoaderStatusHandler, setModalTypeHandler, headerLocationId } = useContext(context);

  const {
    customerReducer: { customerAsCompany },
    purchasesReducer: { purchase_outstanding },
    salesReducer: { sale_outstanding, sale_id_get },
    productReducer: { product },
    manualNoteReducer: { manualNotesSchemes }

  } = useSelector((state) => state);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const getIgst = (data) => {
    let tax = '';
    if (data.taxes) {
      data.taxes.forEach((t) => {
        if (t.tax_group === 'IGST') {
          tax = t.tax_rate;
        }
      });
    }
    return tax;
  };

  const totalCost = () => {
    let total = 0;
    list.forEach((d) => {
      total += d.selling_price
        ? (d.selling_price / (getIgst(d) + 100)) * 100
        : (d.quantity || 1) * d.item_unit_price -
        (((d.quantity || 1) * d.item_unit_price) / 100) * (d.discount || 0);
    });

    return total;
  };

  const taxes = () => {
    let total = 0;
    for (let data of list) {
      let arr = [];
      if (data.item_unit_price) {
        arr.push(data.item_unit_price);
      }
      if (data.quantity) {
        arr.push(data.quantity);
      } else {
        arr.push(1);
      }
      if (data.taxes) {
        data.taxes.forEach((t) => {
          if (t.tax_group === 'IGST') {
            arr.push(t.tax_rate);
          }
        });
      }
      const val =
        arr[0] * arr[1] - ((arr[0] * arr[1]) / 100) * (data.discount || 0);
      total += data.selling_price
        ? (((data.selling_price / (arr[2] + 100)) * 100) / 100) * arr[2]
        : (val / 100) * arr[2];
    }

    return total ? total : 0;
  };


  const setStateHandler = (name, value) => {
    let formObj = {};
    formObj = {
      ...formValues,
      [name]: value === '' ? null : value,
    };

    setFormValues(formObj);
    // validationHandler(name, value);
  };
  const [selectedCustomerSupplier, setSelectedCustomerSupplier] = useState(null);


useEffect(() => { (async () => {
  const loadData = async () => {
    setLoaderStatusHandler(true);
    if (!customerAsCompany.length) {
      await dispatch(customerAsCompanyAction());
    }
    setLoaderStatusHandler(false);
  };

  loadData();
// console.log("fvcwrvrv",pageType,getPay[0].customer_id);

  if (type == 0 && pageType == 'SALES') {
    dispatch(getManualNoteSchemesByIdAction('customer', getPay[0].customer_id, () => {
    }))
  }

  PaymentMethodServices.getAllPaymentModeForPaymentPage()
    .then((res) => setAllPaymentModes(res.data))
    .catch(() => {});
})();
}, []);

  const checkAmountTallied = (selectionModel) => {
    return selectionModel.some((item) => item.type === "Invoice") &&
      selectionModel.some((item) => item.type === "Credit Note") &&
      selectionModel.reduce((acc, item) => {
        if (item.type === "Invoice") {
          return acc + parseFloat(item.receivable || 0);
        } else if (item.type === "Credit Note") {
          return acc - parseFloat(item.payable || 0);
        }
        return acc;
      }, 0) === 0;
  };

  useEffect(() => {
    const isAmountTallied = checkAmountTallied(selectionModel);
    setIsAmountTallied(isAmountTallied);
  }, [selectionModel]);

useEffect(() => {
  if (!customerAsCompany.length) return;

  const filtered = customerAsCompany.filter((d) =>
    pageType === 'SALES'
      ? one.customer_id === d.customer_id
      : (pageType === 'PURCHASE' || pageType === 'EXPENSE')
      ? one.supplier_id === d.supplier_id
      : d.customer_id === formValues?.customer_id || d.supplier_id === formValues?.supplier_id
  )[0];

  setSelectedCustomerSupplier(filtered || null);
}, [customerAsCompany, pageType, one, formValues]);

  
  // console.log(customerAsCompany,"customerAsCompany");

  // useEffect(() => {
  //   if (resetCredit) {
  //     setResetCredit(false);
  //   }
  // }, [resetCredit]);


  //  useEffect(()=>{
  //   if(purchase_outstanding.length > 0 && type === 1){
  //       let value = purchase_outstanding?.filter((d)=> d.supplier_id === formValues.supplier_id) || [];
  //       if(value.length >0) {
  //       let data = {
  //       supplier_id:  value[0]?.supplier_id,
  //       receivings_items:value[0]?.childRow[0]?.receivings_items,
  //       paid_amount : value[0]?.paid_amount,
  //       receiving_id : value[0]?.receiving_id,
  //       receive_goods : value[0]?.receive_goods,
  //       total : value[0]?.total,
  //       }
  //       pendingPayment(data) 
  //       }
  //   }
  //  }, [purchase_outstanding.length])

  //  useEffect(()=>{
  //   if(sale_outstanding.length && type === 0){
  //     let datas = sale_outstanding?.filter((d)=> d.customer_id === formValues.customer_id) || [];
  //     if(datas.length > 0){
  //     apiCalls(
  //       setModalTypeHandler,
  //       setLoaderStatusHandler,
  //       dispatch(
  //         saleIdGET(
  //           formValues.customer_id,
  //           setModalTypeHandler,
  //           setLoaderStatusHandler,
  //           (response)=>{
  //             if (response.length) {
  //              pendingsalesPayment(response[0],datas[0].childRow )
  //             }}
  //         ),
  //       ),
  //     );}
  //     // else{
  //     //   alert('No invoice for Payment')
  //     // }
  //     // let value = sale_outstanding?.filter((d)=> d.customer_id === formValues.customer_id) || [];
  //     // let data = {
  //     //   customer_id:  value[0].customer_id,
  //     // }
  //     // value.length ? props.pendingPayment(data) : alert('No invoice for Payment')
  //    }
  //  },[sale_outstanding.length, sale_id_get.length])

  const pendingPayment = (data, value) => {
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
      const getPay = value?.filter(
        (d) => d.supplier_id === supplier_id,
      )[0]?.childRow;

      dispatch(getManualNoteSchemesByIdAction('supplier', data.supplier_id, (response) => {
        if(pageType !== "EXPENSE"){
        setManualNoteSchemes(response.map(i => ({ ...i, selected: false })))
      }
        // console.log(PayData,"PayData");
        
        if(pageType !== "PURCHASE"){
          const updatedChildRow = value[0]?.childRow?.map(row => ({
            ...row,
            id: row.sale_id,
            po_number: row.invoice_number,
            paid_amount: row.received_amount
          }));
          value[0].childRow = updatedChildRow;
        setPayData({
          ...PayData,
          itemsData,
          getVendor,
          paid_amount: +paid_amount,
          receiving_id,
          oldStatus,
          receive_goods,
          total: +total,

        });
      }
      if(!['SALES', 'PURCHASE'].includes(pageType)){

        setstatus('edit');
      }
        if (editReceiptData) {
          getPay[0].old_paid_amount = getPay[0].paid_amount;
          getPay[0].paid_amount = 0
        }
        if(!['SALES'].includes(pageType)){
          
          setgetPay(getPay);

        }

      }));

    }))

  };




  useEffect(() => { (async () => {
    (async () => {

      if (editReceiptData && locateCashBox.length) {

        const body = {
          id: formValues.customer_id ? editData.sale_id : editData.receiving_id,
          note: formValues.customer_id ? 'Sales Payment' : 'Purchase Payment'
        }

        const { data, loading, error } = await customFetch(
          API_URLS.TRANSACTION_BY_NOTE,
          'POST',
          body
        );
        const cashbox_ledger_id = locateCashBox.map(i => i.ledger_id)
        for (let i = 0; i < data?.length; i++) {
          if (cashbox_ledger_id.includes(data[i].accountId)) {
            setIsCashTransaction(true);
            break;
          }
        }
      }
    })()

  })();
}, [locateCashBox])

  const pendingsalesPayment = (data, childRow) => {

    // console.log("childRow",childRow)
    // if (headerLocationId === 'null') {
    //   alert("Please Select One Location")
    //   return
    // }
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
    if (childRow !== undefined) {
      // childRow.map((c) => {
      //   return payData.push({
      //     id: c.sale_id,
      //     po_number: c.invoice_number,
      //     paid_amount: c.received_amount,
      //     total: c.total,
      //     location_id: headerLocationId === 'null' ? c.location_id : headerLocationId,
      //     ledger_id: c.ledger_id
      //   });
      // });
      const updatedChildRow = childRow?.map(row => ({
        ...row,
        id: row.sale_id,
        po_number: row.invoice_number,
        paid_amount: row.received_amount
      }));
      childRow = updatedChildRow;
      // console.log("payData",payData)
    }


    dispatch(getbyidCustomerAction(customer_id, (response) => {
      // if (pageType !== 'SALES') {
        setGetCustomer(response);
      // }
      dispatch(getManualNoteSchemesByIdAction('customer', customer_id, (response) => {
        setManualNoteSchemes(response.map(i => ({ ...i, selected: false })));

        // setPaymentOpen(true);
        if (!editReceiptData) {
          // setHeaderLocationIdHandeler(payData[0].location_id)
          // setTotal(payData[0].paid_amount);
          // console.log(payData,"vcxcxcxcv");
          setgetPay(childRow);
          
          // payData[0].old_paid_amount = payData[0].paid_amount;
          // payData[0].paid_amount = 0
          // setSelectionModel(payData)
        }
        // if (pageType !== 'SALES') {

          // setgetPay(payData);
          setSalesItems(sales_items);
        // }

        // setPaymentOpen(true);

        if (editReceiptData) {
          setReceived_amount(0);
        } else {
          // if(pageType !== 'SALES'){
          setReceived_amount(received_amount);
          // }

        }

      }))

    }))


    // this.setState({ sales_items, getCustomer, paymentOpen: true, received_amount: +received_amount, sale_id })
  };
  useEffect(() => { (async () => {
    if (formValues.supplier_id !== null) {

      let url;
      let body = {};
      let method;

      if (editReceiptData) {
        url = API_URLS.GET_PURCHASE_DETAILS_BY_RECEIVING_ID;
        body = {
          receiving_id: editData.receiving_id,
          po_number: editData.po_number,
          supplier_id: editData.supplier_id
        };
        method = 'POST';
      } else {
        url = API_URLS.GET_SUPPLIER_PENDING_PAYMENTS(formValues.supplier_id, headerLocationId);
        method = 'GET';
      }

      const { data: customerData, loading, error } = await customFetch(url, method, body);

      let value = customerData || [];
      if (value.length > 0) {
        let data = {
          supplier_id: value[0]?.supplier_id,
          receivings_items: value[0]?.childRow !== undefined ? value[0]?.childRow[0]?.receivings_items : [],
          paid_amount: value[0]?.paid_amount,
          receiving_id: value[0]?.receiving_id,
          receive_goods: value[0]?.receive_goods,
          total: value[0]?.total,
          status: value[0]?.status
        }
        pendingPayment(data, customerData)
      }

      //    apiCalls(
      // context.setModalTypeHandler,
      // context.setLoaderStatusHandler,
      // apiCalls(
      //   setModalTypeHandler,
      //   setLoaderStatusHandler, 
      //   dispatch(paymentview(commoncookie,headerLocationId,setModalTypeHandler,setLoaderStatusHandler))
      // ));

    }
  })();
}, [formValues.supplier_id, headerLocationId])
  useEffect(() => { (async () => {
    if (formValues.customer_id !== null) {

      // console.log("editReceiptData",editReceiptData)
      // if (editReceiptData) {
      //   url = `/sales/getSaleDetailsByInvoiceId`
      //   body = { sale_id: editData.sale_id, invoice_number: editData.invoice_number }
      //   method = 'POST'
      // } else {
       
      // }

      const url = API_URLS.GET_CUSTOMER_PENDING_PAYMENT(formValues.customer_id, headerLocationId);
      const method = 'GET';

      const { data: customerData, loading, error } = await customFetch(url, method, {});
      // const tempChildRow = customerData[0].childRow.filter(i => i.invoice_number === editData.invoice_number)
      // customerData[0].childRow = tempChildRow
      // let datas = customerData|| [];
      let datas = customerData || [];
      // console.log("customerData",customerData)
      if (datas.length > 0) {
        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(
            saleIdGET(
              formValues.customer_id,
              setModalTypeHandler,
              setLoaderStatusHandler,
              (response) => {
                if (response.length) {
                  pendingsalesPayment(response[0], datas[0]?.childRow)
                } else {
                  dispatch(getbyidCustomerAction(formValues.customer_id, (response) => {
                    if (pageType !== 'SALES') {
                      setGetCustomer(response);
                    }
                  }))
                }
              }
            ),
          ),
        );
      }
      //     apiCalls(
      //       setModalTypeHandler,
      //       setLoaderStatusHandler, 
      //       dispatch(
      //         listSalesOutstandingAction(
      //           commoncookie,
      //           headerLocationId,
      //           setModalTypeHandler,
      //           setLoaderStatusHandler,
      //         )
      //       )
      //  )

    }
    !product.length && apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler, dispatch(
        listProductAction(
          setModalTypeHandler,
          setLoaderStatusHandler,
        ))

    );
  })();
}, [formValues.customer_id])

  useEffect(() => {
    if (Object.keys(one).length) {
      let getfilval = false;
      if (one.state === 'Tamil Nadu' && one.country === 'India') {
        getfilval = true;
      }
      settaxtype(getfilval);
    }

  }, [one]);

  useEffect(() => {
    if (headerLocationId && formValues?.customer_id) {
      const selectedCustomer = customerAsCompany.find((d) =>
        type === 0
          ? d.customer_id === formValues.customer_id
          : d.supplier_id === formValues.supplier_id
      );
      if (selectedCustomer) {

        handleCustomerSelection(selectedCustomer);
      }
    }
  }, [headerLocationId]);


  const initsform = () => {

    let total = selectionModel.reduce((a, c) => {
      if (c.receivable && +c.receivable > 0) {
        // It's a receivable — use total - paid_amount
        return a + (+c?.originalRow?.total - +c?.originalRow?.paid_amount || 0);
      } else if (c.payable && +c.payable > 0) {
        // It's a payable — use balance_amount
        return a + (+c?.originalRow?.balance_amount || 0);
      } else {
        return a; // skip if neither
      }
    }, 0);

    let advance_CN_DN_amount = 0;
    manualNoteSchemes.forEach(i => {
      if (i.scheme_name && i.scheme_name.startsWith('Advance')) {
        if (i.selected) {
          advance_CN_DN_amount += one.advance_amount ?? 0;
        }
      } else {
        if (i.selected) {
          advance_CN_DN_amount += typeof one.debitNote_balance !== 'undefined' ? one.debitNote_balance : one.creditNote_balance;
        }
      }
    })

    creditnote === true ? setTotal(total - advance_CN_DN_amount) : setTotal(total);
    creditnote === true ? handleEntry?.(true) : handleEntry?.(false);
    setTotal(total - advanceAmount);
    if(custType !== 'CUSTOMER' || activeStep === 0){
      setTdata([]);
    }
    // let tempData = generateDebitCreditTData(total)
    // if (selectionModel.length) {
    //   setTdata(tempData);
    // }
    if (manualNoteSchemes.filter(i => i.selected).length) {
      calculateAdjustedAmount(total);
    }
  };


  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();
  }, [selectionModel]);

  // useEffect(() => {
  //   const hasSelected = manualNoteSchemes?.some(item => item.selected);
  
  //   if (hasSelected) {
  //     tempinitsform.current();
  //   }
  // }, [manualNoteSchemes]);
  


  // useEffect(() => {
  //   let total = selectionModel.reduce((a ,c) => {
  //     return a + (+c.total - +c.paid_amount);
  //   }, 0);
  //   calculateAdjustedAmount(total);

  // },[selectionModel, manualNoteSchemes.filter(i => i.selected).length])

  const handleCustomerSelection = (customerObj) => {
    const id = customerObj === null ? '' : type === 0 ? customerObj.customer_id : pageType === 'SALES' ? customerObj.customer_id : customerObj.supplier_id;
    setStateHandler(type === 0 ? 'customer_id' : pageType === 'SALES' ? 'customer_id' : 'supplier_id', id);

    if (!customerObj) {
      if (pageType !== 'SALES') {
        setGetCustomer({});
        setgetPay([]);

      }

      setResetCredit(true);
    } else {
      // setGetCustomer(customerObj);
      setResetCredit(false);
    }
  };


  const checkPayment = () => {

    if (creditnote && selectionModel.length > 0) {
      let totalAmount = selectionModel.reduce((a, c) => a + (c?.balance_amount ? c?.balance_amount : (c.total - c.paid_amount)), 0);

      let creditOrDebitBal = advanceAmount

      // let creditOrDebitBal = one.creditNote_balance || one.debitNote_balance || one.advance_amount
      if (creditOrDebitBal >= totalAmount) {
        return true
      }
    }
    const getAmount = (Tdata ?? []).reduce(function (acc, obj) {
      return acc + +obj.payment_amount;
    }, 0);
    const totalamount = (totalCost() + taxes()).toFixed(2);
    if (getAmount > 0) {
      //&& +totalamount
      return true;
    } else {
      return false;
    }
  };
  const PaymentDenominationvalidation = (value) => {
    if (value) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(getDenominationValidationByIdAction(value))
      );
    }
  }
console.log(Tdata, 'cujcjejce')
  function calculateExcessAmount() {
    const changeAmountTotal = (Tdata ?? []).reduce((acc, obj) => acc + +obj.payment_amount, 0);
    
    return {
      isExcess: changeAmountTotal > 0,
      excessAmount: changeAmountTotal
    }
  }
  function calculateExcessAmountadvance() {
    
    // const totalDue = Tdata.reduce((sum, item) => sum + Number(item.due ?? 0), 0);
    if(custType === 'CUSTOMER') {
      const totalDue = selectionModel.reduce((sum, row) => {
        return sum + Number(row?.paymentAmount ?? 0);
      }, 0);
      const totalPaid = (Tdata ?? []).reduce((sum, item) => sum + Number(item.payment_amount ?? 0), 0);
      const changeAmountTotal = totalPaid - totalDue;
      const roundedChangeAmount = Number(changeAmountTotal.toFixed(2));
      
      return {
        isExcess: roundedChangeAmount > 0,
        excessAmount: roundedChangeAmount
      }
    }
    else {
      const totalInvoiceAmount = selectionModel.filter(s => s.type === 'Invoice').reduce((sum, list) => sum  + Number(list?.payable || 0), 0)
      const totalDebitNoteAmount = selectionModel.filter(s => s.type !== 'Invoice').reduce((sum, list) => sum  + Number(list?.receivable || 0), 0)
      const paymentTotal = (Tdata ?? []).reduce((sum, list) => sum + Number(list?.payment_amount || 0), 0)
      const excessAmount = paymentTotal + totalDebitNoteAmount - totalInvoiceAmount

      return {
        isExcess : excessAmount > 0,
        excessAmount : excessAmount
      }
    }

  }
  function calculateAdjustedAmount(total) {


    let tempTotal = total;

    let arr = manualNoteSchemes.map(i => ({ ...i, adjusted_amount: i.amount - i.balance_amount }));
    let res = arr.map((e, i) => {
      if (!e.selected) return e;
      const selectedRow = selectionModel.find(selection => selection.id === e.id)
      if(selectedRow){
        return { ...e, new_adjusted_amount: selectedRow?.adjustedAmount !== "" ?  Number(selectedRow?.adjustedAmount || 0) : e.balance_amount }
      }
      if (tempTotal >= e.balance_amount) {
        tempTotal -= e.balance_amount;
        return { ...e, new_adjusted_amount: e.balance_amount };
      } else if (tempTotal > 0) {
        let data = { ...e, new_adjusted_amount: tempTotal };
        tempTotal = 0;
        return data;
      } else {
        return { ...e, new_adjusted_amount: tempTotal };
      }
    });

    const temp = generateUsedFor(res)

setManualNoteSchemes(prev => (isEqual(prev, temp) ? prev : temp));
  }


  function generateUsedFor(temp) {
    if (!selectionModel.length) return temp
    const temp_model = selectionModel.map(i => ({ total: i.total, temp_id: i.id }))
    const credit = temp.map(i => ({ ...i, temp_used_for: {}, temp_amount: i.amount }))
    let s = 0;
    let c = 0;


    let max = Math.max(temp_model.length, credit.length);
    while (s < max && c < max) {
      if (temp_model[s]?.total < credit[c]?.temp_amount && credit[c]?.temp_amount > 0 && credit[c]?.selected) {
        credit[c].temp_used_for[temp_model[s]?.temp_id] = +(temp_model[s]?.total.toFixed(2));
        credit[c].temp_amount -= temp_model[s]?.total;
        temp_model[s].total = 0;
        s++;
      } else if (temp_model[s]?.total > credit[c]?.temp_amount && credit[c]?.temp_amount > 0 && credit[c]?.selected) {
        credit[c].temp_used_for[temp_model[s]?.temp_id] = +(credit[c]?.temp_amount.toFixed(2));
        temp_model[s].total -= credit[c]?.temp_amount;
        credit[c].temp_amount = 0;
        c++;
      } else {
        if (credit[c]?.selected) {
          credit[c].temp_used_for[temp_model[s]?.temp_id] = +(credit[c]?.temp_amount?.toFixed(2));
          credit[c].temp_amount = 0;
          if (temp_model[s]) {
            temp_model[s].total = 0;
          }
          s++;
          c++;
        } else {
          c++;
        }

      }

    }
    return credit


  }

  const advanceAmount = useMemo(() => {

    if (!manualNoteSchemes) {
      return 0;
    }

    return manualNoteSchemes.reduce((acc, curr) => {
      if (curr.selected) {
        return acc + curr.balance_amount
      } else {
        return acc;
      }
    }, 0)
  }, [manualNoteSchemes])

  const receivableAmount = useMemo(() => {
    if (!Array.isArray(getPay)) return 0;
    const total = getPay.reduce((acc, curr) => {
      return acc + ((curr.total - curr.paid_amount) || 0);
    }, 0);
    return parseFloat(total.toFixed(2));
  }, [getPay]);


  const UnusedCredit = useMemo(() => {

    if (resetCredit) return 0;
    const total = manualNotesSchemes?.reduce((acc, curr) => {
      return acc + (curr.balance_amount || 0);
    }, 0) || 0;
    return parseFloat(total.toFixed(2));
  }, [manualNotesSchemes, resetCredit]);

  const handleCheck = (e) => {
    let { name, checked } = e.target;

    setStateHandler(name, checked);

    // setting creditNote to false when advance switch changes
    setCreditNote(false)
  };

  useEffect(() => {

    if (formValues.amount > 0) {
      setTotal(formValues.amount)
    }
  }, [formValues.amount])

  const totalInvoiceAmount = selectionModel.filter(s => s.type === 'Invoice').reduce((sum, list) => sum  + Number(list?.payable || 0), 0)
  const totalDebitNoteAmount = selectionModel.filter(s => s.type !== 'Invoice').reduce((sum, list) => sum  + Number(list?.receivable || 0), 0)
  const paymentTotal = (Tdata ?? []).reduce((sum, list) => sum + Number(list?.payment_amount || 0), 0)
  const excessAmount = paymentTotal + totalDebitNoteAmount - totalInvoiceAmount
  const addAdvanceAmounts = {name : selectedCustomerSupplier?.company_name, supplierId : selectedCustomerSupplier?.supplier_id || '', amount : excessAmount > 0 ? excessAmount : 0}

  function handleAdvanceAmountAndSubmit() {
    const tempObj = {
      amount: calculateExcessAmountadvance().excessAmount,
      ...(custType === 'CUSTOMER'
        ? { customerId: selectedCustomerSupplier.customer_id || null }
        : { supplierId: selectedCustomerSupplier.supplier_id || null }),
      name: one.company_name,
    };
    addAdvanceAmount.current = tempObj
    setAdvanceConfirmDialogOpen(false);
    handleSubmit('advance', formValues.receiptDate, addAdvanceAmounts)
  }


  const getTotalSelectedAmount = (selectionModel, custType, formValues) => {
    if (!Array.isArray(selectionModel)) return 0;
    let totalReceivable = 0;
    let totalPayable = 0;
    const parsedFormAmount = parseFloat(formValues?.amount) || 0;

    selectionModel.forEach((item) => {
      const isInvoice = item.type === 'Invoice' || pageType === 'EXPENSE';
      const isCreditNote = ['Credit Note', 'Unused Credit', 'Debit Note'].includes(item.type);

      const receivable = parseFloat(item.receivable) || 0;
      const paymentAmount = parseFloat(item.paymentAmount) || 0;
      const payable = parseFloat(item.payable) || 0;
// console.log(receivable,"receivable");

      if (isInvoice) {
        if (type == 0) {

          totalReceivable += paymentAmount;
        } else if (type == 1) {
          totalPayable += payable;
        }
      }

      if (isCreditNote) {
        if (type == 0) {
          totalPayable += payable;
        } else if (type == 1) {
          totalReceivable += receivable;
        }
      }
    });

    if (type == 1) {
        return (totalPayable - totalReceivable) + parsedFormAmount;
    } else {
        return (totalReceivable - totalPayable) + parsedFormAmount;
    }
  };

  const total = getTotalSelectedAmount(selectionModel);

  let tot = status === 'edit'
    ? Total
    : Number(((Number(totalCost()) || 0) + (Number(taxes()) || 0)).toFixed(2))

  const handleDateChange = (date) => {
    setFormValues((prev) => ({ ...prev, receiptDate: moment(date).format('YYYY-MM-DD') }))
  }

  //   console.log(one, "rfererferf");
  // console.log(pageType === 'SALES',"pageType === 'SALES'");
// console.log(selectionModel,selectionModel.length > 0 && !formValues.amount &&
//   selectionModel.some((item) => !!item.po_number || parseFloat(item.receivable) > 0),"selectionModel5345");

  const totalReceived = (Tdata ?? []).reduce((sum, list) => sum + Number(list?.payment_amount || 0), 0) || 0 + selectionModel.filter(s => ['Credit Note', 'Unused Credit'].includes(s.type)).reduce((sum, list) => sum + Number(list?.adjustedAmount || 0), 0)
  const totalReceipt = selectionModel?.filter(s => s.type === 'Invoice').reduce((sum, list) => sum + Number(list?.paymentAmount || 0), 0)
  const advancedAmount = totalReceived - totalReceipt


  return (
    <Grid container justifyContent="center" sx={{ padding: 1, height: '650px' }}>
      {
        custType === 'CUSTOMER' ? 
        <Grid container spacing={2} width='100%'>
          <Grid sx={{ padding: 1 }} size={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography className='chatcontent' textAlign={'center'} sx={{ flexGrow: 1 }}>
                {'RECEIPT ENTRY'}
              </Typography>
              <Tooltip title="Close">
                <IconButton aria-label="close" onClick={() => { 
                  // setgetPay([]); 
                  handleClose(false); 
                  }}>
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>

          {
            activeStep === 0 && (
              <Grid size={12}>
                <Grid container spacing={2}>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 3.5
                    }}>
                    <Autocomplete
                      id='multiple-limit-tags'
                      value={selectedCustomerSupplier}

                      options=
                      {customerAsCompany.filter((c) =>
                        type === 0

                          ? c.company_name !== null && c.customer_type === '1'
                          : c.supplier_id,
                      )}
                      fullWidth
                      disabled={editReceiptData || ['SALES', 'PURCHASE', 'EXPENSE'].includes(pageType)}
                      getOptionLabel={(option) => option.company_name}
                      onChange={(e, c) => {
                        const id = c === null ? '' : type === 0 ? c.customer_id : c.supplier_id;
                        setStateHandler(type === 0 ? 'customer_id' : 'supplier_id', id);
                        setFormValues((prevValues) => ({ ...prevValues, amount: null }));
                        // Reset 'one' if selection is cleared
                        if (!c) {
                          // setGetCustomer({});
                          // setgetPay([])
                          setResetCredit(true);
                        } else {
                          // setGetCustomer(c);
                          setResetCredit(false);
                        }
                      }}
                      renderOption={(props, option) => {
                        return (
                          <li {...props} key={option.person_id}>
                            {option.company_name}
                          </li>
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth={true}
                          required={true}
                          variant='filled'
                          label={type === 0 ? 'Select Customer' : 'Select Vendor'}
                          placeholder='Select Customer'
                        />
                      )}
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 3.5
                    }}>
                    <TextField
                      onChange={(e) => {
                        setAdvanceAmount(e.target.value)
                        setStateHandler('amount', e.target.value);
                        // if (e.target.value) {
                        //   setSelectionModel([]);
                        // }
                      }}
                      style={{}}
                      fullWidth={true}
                      placeholder='Amount'
                      label='Advance Amount'
                      name='amount'
                      value={
                        formValues.amount === null
                          ? ''
                          : formValues.amount
                      }
                      color='primary'
                      type='number'
                      regex=''
                      variant='filled'
                      inputProps={{ min: 0 }}
                      disabled={(pageType ?? '').toLowerCase() === 'sales' || selectionModel.filter(item => ['Credit Note', 'Unused Credit'].includes(item.type)).length > 0}
                      // sx={{
                      //   height: 40,
                      //   '& .MuiFilledInput-root': {
                      //     height: 50,
                      //     paddingTop: 0,
                      //     paddingBottom: 0,
                      //     fontSize: 14,
                      //   },
                      //   '& .MuiInputLabel-root': {
                      //     fontSize: 13,
                      //     top: -4,
                      //   },
                      // }}
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 2.5
                    }}>
                    <LocalizationProvider dateAdapter={DateAdapter}>
                      <DatePicker
                        label = 'Receipt Date'
                        format='DD/MM/YYYY'
                        value = {toMomentOrNull(formValues.receiptDate)}
                        onChange={(date) => handleDateChange(date)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            variant: 'filled',
                            onKeyDown: (e) => e.preventDefault(),
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 12,
                      md: 7,
                      lg: 8
                    }}>
                    <div style={{ width: '100%', maxWidth: '400px' }}>
                      <div style={{ display: 'flex', marginTop: 4, alignItems: 'center' }}>
                        <Typography style={{ margin: 'auto 5px 5px' }} className='chatcontent'>
                          {`${custType} DETAILS`}
                        </Typography>
                        <div>
                          {Object.keys(one).length && selectedCustomerSupplier ? (
                            <CheckIcon style={{ color: 'green', fontSize: '20px' }} />
                          ) : (
                            <CloseIcon style={{ color: 'red', fontSize: '20px' }} />
                          )}
                        </div>
                      </div>
                      <Divider sx={{ my: 1 }} />

                      {Object.keys(one).length && selectedCustomerSupplier ? (
                        <div style={{ display: 'flex', marginLeft: '10px' }}>
                          <div style={{ width: '50%' }}>
                            <Typography className='chatcontent'>
                              {`${one.company_name || one.amount}`}
                            </Typography>
                            <Typography className='dashboard-chart-content'>{`${one.address ? one.address + ',' : ''
                              } ${one.city ? one.city + ',' : ''} ${one.state ? one.state + ',' : ''
                              } ${one.country || ''} - ${one.zip || ''}`}</Typography>
                            <Typography style={{ margin: '0 0 10px 0' }} className='dashboard-chart-content'>{`Mobile No : ${one.phone_number || ''
                              }`}</Typography>
                          </div>

                          <Typography style={{ marginLeft: 'auto' }} className='dashboard-chart-content'>
                            {one.email || ''}
                          </Typography>
                        </div>
                      ) : (
                        <Typography
                          style={{
                            margin: '10px 5px 5px',
                            height: '90px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          className='receiptContent'
                        >
                          Pick Customer for more Details!
                        </Typography>
                      )}
                    </div>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 2.5,
                      lg: 2
                    }}>
                    <Card sx={{ borderRadius: 1, p: 1 }}>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        width="100%"
                      >
                        <img src={totalIcon} height={30} width={24} />
                        <Box pl={1} textAlign="center">
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="center"
                            spacing={0.5}
                            flexWrap="wrap"
                          >
                            <CurrencyRupeeIcon sx={{ fontSize: 16 }} />
                            <Typography
                              variant="h6"
                              noWrap
                              sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}
                            >
                              {selectedCustomerSupplier ? receivableAmount : 0}
                            </Typography>
                          </Stack>
                          <Typography
                            className='chats'
                            sx={{ mt: 0.5 }}
                          >
                            {type == 0 ? 'Receivable' : 'Payable' }
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 2.5,
                      lg: 2
                    }}>
                    <Card sx={{ borderRadius: 1, p: 1, }}>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        width="100%"
                      >
                        <img src={totalIcon} height={30} width={24} />
                        <Box pl={1} textAlign="center">
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="center"
                            spacing={0.5}
                            flexWrap="wrap"
                          >
                            <CurrencyRupeeIcon sx={{ fontSize: 16 }} />
                            <Typography
                              variant="h6"
                              noWrap
                              sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}
                            >
                              {selectedCustomerSupplier ? UnusedCredit : 0}
                            </Typography>
                          </Stack>
                          <Typography
                            className='chats'
                            sx={{ mt: 0.5 }}
                          >
                            Unused Credit
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>

                  <Grid size={12}>
                    <Typography variant='h6'>Payment Method</Typography>

                    <NewPaymentTable
                      advanceAmount={formValues.amount}
                      customer={formValues.customer_id}
                      selectionModel={selectionModel}
                      pageType={'salePurchasePage'}
                      getPay={getPay}
                      pModes={allPaymentModes}
                      isEntered={isEntered}
                      setEntered={setEntered}
                      index={index}
                      setIndex={setIndex}
                      setpayment={setpayment}
                      Tdata={Tdata}
                      setTdata={setTdata}
                      invoiceselect={invoiceselect}
                      status={status}
                      total={tot}
                      cashOutIn_denomination={cashOutIn_denomination}
                      PaymentDenominationvalidation={PaymentDenominationvalidation}
                      responseType={responseType}
                      isCashTransaction={isCashTransaction}
                      selectedTotal={formValues.amount ? parseInt(formValues.amount) : getTotalSelectedAmount(selectionModel)}
                      setpModes={setAllPaymentModes}
                      activeStep={activeStep}
                      paymentSelected={paymentSelected} // Pass selectedPayments
                      setPaymentSelected={setPaymentSelected}
                      isAmountTallied={isAmountTallied}
                      setIsAmountTallied={setIsAmountTallied}
                      custType='CUSTOMER'
                      setSummaryData={setSummaryData}
                      summaryData={summaryData}
                      receiptDate={formValues.receiptDate}
                    />
                  </Grid>

                  <Grid size={12}>
                    <Typography variant='h6'>Credit Note</Typography>

                    <CombinedTableComponent
                      getPay={selectedCustomerSupplier ? getPay : []}
                      setSelectionModel={setSelectionModel}
                      selectionModel={selectionModel}
                      activeINV={activeINV}
                      invoiceselect={invoiceselect}
                      setinvoiceselect={setinvoiceselect}
                      manualNoteSchemes={manualNoteSchemes}
                      setManualNoteSchemes={setManualNoteSchemes}
                      creditnote={creditnote}
                      setCreditNote={setCreditNote}
                      advanceAmount={formValues.amount}
                      customer={formValues.customer_id}
                      vendor={formValues.supplier_id}
                      editData={editData}
                      custType={custType}
                      type={type}
                      filterType={'creditNoteOnly'}
                      clickedInvoice={clickedInvoice}
                      isPaymentSelected = {paymentSelected.length > 0 || (formValues.amount !== null && formValues.amount !== '')}
                      setSummaryData={setSummaryData}
                      summaryData={summaryData}
                    />
                  </Grid>

                  <Grid display='flex' justifyContent='flex-end' size={12}>
                    <Typography variant='h6'>{`Total Amount: ${totalReceived.toFixed(2)}`}</Typography>
                  </Grid>

                  <Grid display='flex' justifyContent='flex-end' size={12}>
                  {Object.keys(one).length && formValues.amount && paymentSelected.length > 0 ? (
                    <Button
                      sx={{ height: 35 }}
                      // onClick={() => AdvanceSubmit(formValues.supplier_id === null ? formValues.customer_id : formValues.supplier_id, one.company_name)}
                      onClick={() => {
                        AdvanceSubmit(
                          formValues.supplier_id === null
                            ? formValues.customer_id
                            : formValues.supplier_id,
                          one.company_name,
                          formValues.receiptDate
                        );
                      }}
                      variant="contained"
                      color="primary"
                    >
                      Submit
                    </Button>
                  )
                    :
                    <Button 
                      variant='contained'
                      disabled={
                        (
                          allPaymentModes.filter(payment => paymentSelected.includes(payment.paymentId)).reduce((sum, item) => sum + Number(item?.amount || 0), 0) === 0
                          && (
                            selectionModel.filter(item => ['Credit Note', 'Unused Credit'].includes(item.type)).length === 0
                            || selectionModel.filter(item => ['Credit Note', 'Unused Credit'].includes(item.type)).some(e => e.adjustedAmountError !== null && e.adjustedAmountError !== undefined)
                          )
                        ) || selectedCustomerSupplier === null}
                      onClick={() => {
                        setActiveStep(1)
                      }}
                    >Next
                    </Button>
                  }
                  </Grid>

                </Grid>
              </Grid>
            )
          }

          {
            activeStep === 1 && (
              <Grid size={12}>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <Grid container display='flex' justifyContent='space-between'>
                      <Grid>
                        <Typography variant='h6'>
                          {paymentSelected.length > 0 ? `Payment Method: ${allPaymentModes.filter(payment => paymentSelected.includes(payment.paymentId))[0]?.payment_type || ''}` : `Credit Note: ${selectionModel.filter(s => ['Credit Note', 'Unused Credit'].includes(s.type))[0]?.refNumber || ''}`}
                        </Typography> 
                      </Grid>

                      <Grid>
                        <Typography variant='h6'>
                          {`Amount: ${paymentSelected.length > 0 ? allPaymentModes.filter(payment => paymentSelected.includes(payment.paymentId))[0]?.amount || '0' : selectionModel.filter(s => ['Credit Note', 'Unused Credit'].includes(s.type))[0]?.adjustedAmount || '0'}`}
                        </Typography> 
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid size={12}>
                    <CombinedTableComponent
                      getPay={selectedCustomerSupplier ? getPay : []}
                      setSelectionModel={setSelectionModel}
                      selectionModel={selectionModel}
                      activeINV={activeINV}
                      invoiceselect={invoiceselect}
                      setinvoiceselect={setinvoiceselect}
                      manualNoteSchemes={manualNoteSchemes}
                      setManualNoteSchemes={setManualNoteSchemes}
                      creditnote={creditnote}
                      setCreditNote={setCreditNote}
                      advanceAmount={formValues.amount}
                      customer={formValues.customer_id}
                      vendor={formValues.supplier_id}
                      editData={editData}
                      custType={custType}
                      type={type}
                      filterType={'invoiceOnly'}
                      clickedInvoice={clickedInvoice}
                      setSummaryData={setSummaryData}
                      summaryData={summaryData}
                      paymentId={summaryData[0].paymentCreditNoteId}
                    />
                  </Grid>
                  
                  <Grid display='flex' justifyContent='flex-end' size={12}>
                    <Typography variant='h6'>{`Total Amount: ${selectionModel.reduce((sum, list) => sum + Number(list?.paymentAmount || 0) ,0) .toFixed(2)}`}</Typography>
                  </Grid>

                  <Grid size={12}>
                    <Grid container spacing={3} display='flex' justifyContent='flex-end'>
                      <Grid>
                        <Button variant='contained' onClick={() => {
                          setSelectionModel([])
                          setTdata([])
                          setActiveStep(0)
                          setSummaryData([])
                        }}>Prev</Button>
                      </Grid>
                      <Grid>
                        <Button 
                          variant='contained'
                          disabled={
                            selectionModel.filter(s => s.type === 'Invoice').length === 0
                            || selectionModel.filter(s => s.type === 'Invoice').some(e => e.paymentAmountError !== null && e.paymentAmountError !== undefined)
                            || selectionModel.filter(s => ['Credit Note', 'Unused Credit', 'Debit Note'].includes(s.type)).length > 0 ? totalReceipt !== totalReceived : totalReceipt > totalReceived
                          }
                          onClick={() => setActiveStep('final')}>Next</Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            )
          }

          {
            activeStep === 'final' && (
              <Grid size={12}>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <Typography variant='h6'>Summary</Typography>
                  </Grid>

                  <Grid size={12}>
                    <SummaryTable
                      summaryData={summaryData}
                      receiptDate={formValues.receiptDate}
                      selectionModel={selectionModel}
                      allPaymentModes={allPaymentModes}
                      Tdata={Tdata}
                      setSelectionModel={setSelectionModel}
                      setTdata={setTdata}
                    />
                  </Grid>

                  <Grid size={12}>
                    <Grid container display='flex' justifyContent='flex-end'>
                      <Grid size={12}>
                        <Typography variant='h6' textAlign='end'>{`Total Received: ${totalReceived?.toFixed(2)}`}</Typography>
                      </Grid>

                      <Grid size={12}>
                        <Typography variant='h6' textAlign='end'>{`Total Receipt Amount: ${totalReceipt?.toFixed(2)}`}</Typography>
                      </Grid>

                      <Grid size={12}>
                        <Typography variant='h6' textAlign='end'>{`Advance Received: ${advancedAmount > 0 ? advancedAmount?.toFixed(2) : 0}`}</Typography>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid size={12}>
                    <Grid container spacing={2} display='flex' justifyContent='flex-end'>
                      <Grid>
                        <Button variant='contained' onClick={() => {
                          const updatedSelectionModel = selectionModel.filter(s => ['Credit Note', 'Unused Credit'].includes(s.type))
                          setSelectionModel(updatedSelectionModel)
                          setSummaryData(summaryData.map((summary => ({ ...summary, sale_id: [] }))))
                          setActiveStep(1)
                        }}>Prev</Button>
                      </Grid>

                      <Grid>
                        <Button
                          onClick={() => {
                            if (custType === "CUSTOMER" && calculateExcessAmountadvance().isExcess) {
                              setAdvanceConfirmDialogOpen(true);
                            } else {
                              handleSubmit(null, formValues.receiptDate);
                            }
                          }}
                          variant="contained"
                          color="primary"
                          disabled={disableSubmit}
                        >
                            Submit
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            )
          }
        </Grid>
        : <Card sx={{ padding: '24px' }}>
            <Grid container spacing={2}>
            <Grid sx={{ padding: 1 }} size={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography className='chatcontent' textAlign={'center'} sx={{ flexGrow: 1 }}>
                  {custType === 'CUSTOMER' ? 'RECEIPT ENTRY' : 'PAYMENT ENTRY'}
                </Typography>
                <Tooltip title="Close">
                  <IconButton aria-label="close" onClick={() => { 
                    // setgetPay([]); 
                    handleClose(false); 
                    }}>
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
            <Grid size={12}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {selectedSteps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Grid>

            {activeStep === 0 && (
          <Grid container spacing={2} mt={2}>
            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3.5
              }}>
              <Autocomplete
                id='multiple-limit-tags'
                value={selectedCustomerSupplier}

                options=
                {customerAsCompany.filter((c) =>
                  type === 0

                    ? c.company_name !== null && c.customer_type === '1'
                    : c.supplier_id,
                )}
                fullWidth
                disabled={editReceiptData || ['SALES', 'PURCHASE', 'EXPENSE'].includes(pageType)}
                getOptionLabel={(option) => option.company_name}
                onChange={(e, c) => {
                  const id = c === null ? '' : type === 0 ? c.customer_id : c.supplier_id;
                  setStateHandler(type === 0 ? 'customer_id' : 'supplier_id', id);
                  setFormValues((prevValues) => ({ ...prevValues, amount: null }));
                  // Reset 'one' if selection is cleared
                  if (!c) {
                    // setGetCustomer({});
                    // setgetPay([])
                    setResetCredit(true);
                  } else {
                    // setGetCustomer(c);
                    setResetCredit(false);
                  }
                }}
                renderOption={(props, option) => {
                  return (
                    <li {...props} key={option.person_id}>
                      {option.company_name}
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth={true}
                    required={true}
                    variant='filled'
                    label={type === 0 ? 'Select Customer' : 'Select Vendor'}
                    placeholder='Select Customer'
                  // error={formErrors[activeType] === null ? false : true}
                  // helperText={
                  //   formErrors[activeType] === null ? '' : formErrors[activeType]
                  // }
                  />
                )}
              />
            </Grid>
            {/* {!['SALES', 'PURCHASE'].includes(pageType) && ( */}

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3.5
                }}>

                <TextField
                  onChange={(e) => {
                    setAdvanceAmount(e.target.value)
                    setStateHandler('amount', e.target.value);
                    // if (e.target.value) {
                    //   setSelectionModel([]);
                    // }
                  }}
                  style={{}}
                  fullWidth={true}
                  placeholder='Amount'
                  label='Advance Amount'
                  name='amount'
                  value={
                    formValues.amount === null
                      ? ''
                      : formValues.amount
                  }
                  color='primary'
                  type='number'
                  regex=''
                  variant='filled'
                  inputProps={{ min: 0 }}
                  disabled={(pageType ?? '').toLowerCase() === 'sales'}
                  sx={{
                    height: 40,
                    '& .MuiFilledInput-root': {
                      height: 50,
                      paddingTop: 0,
                      paddingBottom: 0,
                      fontSize: 14,
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: 13,
                      top: -4,
                    },
                  }}
                // error={formErrors.amount === null ? false : true}
                // helpertext={
                //   formErrors.amount === null
                //     ? ''
                //     : formErrors.amount
                // }
                />
              </Grid>
            {/* )} */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 2.5
              }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  label = 'Receipt Date'
                  value = {toMomentOrNull(formValues.receiptDate)}
                  format='DD/MM/YYYY'
                  onChange={(date) => handleDateChange(date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'filled',
                      onKeyDown: (e) => e.preventDefault(),
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 12,
                md: 7,
                lg: 8
              }}>
              <div style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ display: 'flex', marginTop: 4, alignItems: 'center' }}>
                  <Typography style={{ margin: 'auto 5px 5px' }} className='chatcontent'>
                    {`${custType} DETAILS`}
                  </Typography>
                  <div>
                    {Object.keys(one).length && selectedCustomerSupplier ? (
                      <CheckIcon style={{ color: 'green', fontSize: '20px' }} />
                    ) : (
                      <CloseIcon style={{ color: 'red', fontSize: '20px' }} />
                    )}
                  </div>
                </div>
                <Divider sx={{ my: 1 }} />

                {/* </div>
        <div
          style={{
            width: '100%',
            maxWidth: '600px', // Optional: Limit maximum width
            display: 'flex',
            flexdirection: 'column',
            justifyContent: 'space-between',
            height: 'auto', // Adjust height as needed
          }}
        > */}
                {Object.keys(one).length && selectedCustomerSupplier ? (
                  <div style={{ display: 'flex', marginLeft: '10px' }}>
                    <div style={{ width: '50%' }}>
                      <Typography className='chatcontent'>
                        {`${one.company_name || one.amount}`}
                      </Typography>
                      <Typography className='dashboard-chart-content'>{`${one.address ? one.address + ',' : ''
                        } ${one.city ? one.city + ',' : ''} ${one.state ? one.state + ',' : ''
                        } ${one.country || ''} - ${one.zip || ''}`}</Typography>
                      <Typography style={{ margin: '0 0 10px 0' }} className='dashboard-chart-content'>{`Mobile No : ${one.phone_number || ''
                        }`}</Typography>
                    </div>

                    <Typography style={{ marginLeft: 'auto' }} className='dashboard-chart-content'>
                      {one.email || ''}
                    </Typography>
                  </div>
                ) : (
                  <Typography
                    style={{
                      margin: '10px 5px 5px',
                      height: '90px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    className='receiptContent'
                  >
                    Pick Customer for more Details!
                  </Typography>
                )}
              </div>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 2.5,
                lg: 2
              }}>
              <Card sx={{ borderRadius: 1, p: 1 }}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  width="100%"
                >
                  <img src={totalIcon} height={30} width={24} />
                  <Box pl={1} textAlign="center">
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="center"
                      spacing={0.5}
                      flexWrap="wrap"
                    >
                      <CurrencyRupeeIcon sx={{ fontSize: 16 }} />
                      <Typography
                        variant="h6"
                        noWrap
                        sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}
                      >
                        {selectedCustomerSupplier ? receivableAmount : 0}
                      </Typography>
                    </Stack>
                    <Typography
                      className='chats'
                      sx={{ mt: 0.5 }}
                    >
                      {type == 0 ? 'Receivable' : 'Payable' }
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 2.5,
                lg: 2
              }}>
              <Card sx={{ borderRadius: 1, p: 1, }}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  width="100%"
                >
                  <img src={totalIcon} height={30} width={24} />
                  <Box pl={1} textAlign="center">
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="center"
                      spacing={0.5}
                      flexWrap="wrap"
                    >
                      <CurrencyRupeeIcon sx={{ fontSize: 16 }} />
                      <Typography
                        variant="h6"
                        noWrap
                        sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}
                      >
                        {selectedCustomerSupplier ? UnusedCredit : 0}
                      </Typography>
                    </Stack>
                    <Typography
                      className='chats'
                      sx={{ mt: 0.5 }}
                    >
                      Unused Credit
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid
              style={{
                display: 'flex',
                justifyContent: 'center',
                height: '35vh', // fixed height for Grid itself
                overflow: 'hidden', // ensure it doesn’t expand beyond this
              }}
              size={{
                xs: 12,
                md: 12,
                lg: 12
              }}>
              <div
                style={{
                  width: '100%',
                  minWidth: '80%',
                  height: '100%', // fill the Grid height
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >

                {status === 'edit' ? (
                  <>
                    <CombinedTableComponent
                      getPay={selectedCustomerSupplier ? getPay : []}
                      setSelectionModel={setSelectionModel}
                      selectionModel={selectionModel}
                      activeINV={activeINV}
                      invoiceselect={invoiceselect}
                      setinvoiceselect={setinvoiceselect}
                      manualNoteSchemes={manualNoteSchemes}
                      setManualNoteSchemes={setManualNoteSchemes}
                      creditnote={creditnote}
                      setCreditNote={setCreditNote}
                      advanceAmount={formValues.amount}
                      customer={formValues.customer_id}
                      vendor={formValues.supplier_id}
                      editData={editData}
                      custType={custType}
                      type={type}
                      clickedInvoice={clickedInvoice}
                    // setReceivableData={setReceivableData} // include if you need
                    />
                    {selectionModel.length > 0 && !formValues.amount &&
                      selectionModel.some((item) => !!item.po_number || parseFloat(item.receivable) > 0) && (
                        <Typography
                          style={{
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'end',
                            marginTop: 25,
                          }}
                          className='chatcontent'
                        >
                          {`Total Amount: ${getTotalSelectedAmount(selectionModel).toFixed(2)}`}
                        </Typography>
                      )}
                    {formValues.amount && selectionModel.length === 0 &&
                      <Typography
                        style={{
                          margin: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'end',
                          marginTop: 25,
                        }}
                        className='chatcontent'
                      >
                        {/* {custType === 'VENDOR' && one.advance_amount > 0 || (typeof one.debitNote_balance !== 'undefined' &&
                          one.debitNote_balance > 0)
                          ? `Advance Amountddd : ${advanceAmount}`
                          : ''} */}
                        {`Total Amount: ${formValues.amount}`}
                      </Typography>
                    }
                    {formValues.amount && selectionModel.length > 0 &&
                      <Typography
                        style={{
                          margin: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'end',
                          marginTop: 25,
                        }}
                        className='chatcontent'
                      >
                        {`Total Amount: ${getTotalSelectedAmount(selectionModel).toFixed(2)}`}
                      </Typography>
                    }
                    {/* {Object.keys(PreOrderConvertData).length>0&&<>
                <Grid size={12}>
                  <Typography style={{ margin: "0 0 0 10px", fontWeight: 'bold', fontSize: '1.1rem' }}>Advance Amount</Typography>
                </Grid>
                <Grid size={3}>
                  <Typography
                    style={{
                      margin: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "end",
                      fontWeight: 'bold', fontSize: '1.1rem'
                    }}
                  >{`- ${PreOrderConvertData.received_amount.toFixed(2)} ₹`}</Typography>
                </Grid>
                </>
                } */}
                  </>
                ) : formValues.advance === false ? (
                  <>
                    <div style={{ display: 'flex', marginTop: 10, width: '100%', maxWidth: '600px' }}>
                      <h3
                        style={{
                          margin: 'auto 5px 5px',
                          color: 'rgba(0,0,0,0.6)',
                        }}
                      >
                        PRODUCT DETAILS
                      </h3>

                      <div>
                        {list.length ? (
                          <CheckIcon
                            style={{ color: 'green', fontSize: '25px' }}
                          />
                        ) : (
                          <CloseIcon style={{ color: 'red', fontSize: '25px' }} />
                        )}
                      </div>
                    </div>
                    <Divider style={{ height: '2px', width: '100%', maxWidth: '600px' }} />
                    {list.length ? (
                      <Grid style={{ marginTop: '5px' }} container spacing={0}>
                        <Grid size={9}>
                          <Typography style={{ margin: '10px 0 0 10px' }}>
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
                          >{`${totalCost().toFixed(2)} ₹`}</Typography>
                        </Grid>

                        {taxtype ? (
                          <>
                            <Grid size={9}>
                              <Typography style={{ margin: '10px 0 0 10px' }}>
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
                              >{`${(taxes() / 2).toFixed(2)} ₹`}</Typography>
                            </Grid>
                            <Grid size={9}>
                              <Typography style={{ margin: '10px 0 0 10px' }}>
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
                              >{`${(taxes() / 2).toFixed(2)} ₹`}</Typography>
                            </Grid>
                            <Grid style={{ margin: '15px 0' }} size={12}>
                              <Divider />
                            </Grid>
                            <Grid size={9}>
                              <Typography
                                style={{
                                  margin: '0 0 0 10px',
                                  fontWeight: 'bold',
                                  fontSize: '1.1rem',
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
                                  fontWeight: 'bold',
                                  fontSize: '1.1rem',
                                }}
                              >{`${(totalCost() + taxes()).toFixed(
                                2,
                              )} ₹`}</Typography>
                            </Grid>
                            <Grid style={{ margin: '15px 0' }} size={12}>
                              <Divider />
                            </Grid>
                          </>
                        ) : (
                          <>
                            <Grid size={9}>
                              <Typography style={{ margin: '10px 0 0 10px' }}>
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
                              >{`${taxes().toFixed(2)} ₹`}</Typography>
                            </Grid>
                          </>
                        )}

                        <Grid style={{ margin: '15px 0' }} size={12}>
                          <Divider />
                        </Grid>
                        <Grid size={9}>
                          <Typography
                            style={{
                              margin: '0 0 0 10px',
                              fontWeight: 'bold',
                              fontSize: '1.1rem',
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
                              fontWeight: 'bold',
                              fontSize: '1.1rem',
                            }}
                          >{`${(totalCost() + taxes()).toFixed(
                            2,
                          )} ₹`}</Typography>
                        </Grid>
                        <Grid style={{ margin: '15px 0' }} size={12}>
                          <Divider />
                        </Grid>
                      </Grid>
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
                        Product List is Empty!
                      </h4>
                    )}
                  </>
                ) : <>
                  <div style={{ display: 'flex', marginTop: 10, width: '100%', maxWidth: '600px' }}>
                    <h3
                      style={{
                        margin: 'auto 5px 5px',
                        color: 'rgba(0,0,0,0.6)',
                      }}
                    >
                      Advance Amount
                    </h3>

                    <div>
                      {formValues.amount !== null ? (
                        <CheckIcon
                          style={{ color: 'green', fontSize: '25px' }}
                        />
                      ) : (
                        <CloseIcon style={{ color: 'red', fontSize: '25px' }} />
                      )}
                    </div>
                  </div>
                  <Divider style={{ height: '2px', width: '100%', maxWidth: '600px' }} />

                </>}
              </div>

            </Grid>
            <Grid size={12}>
              <Grid container direction="column" style={{ height: '100%', flexGrow: 1 }}>
                {/* Main content takes available vertical space */}
                <Grid style={{ flexGrow: 1 }}>
                  {/* Your form or content goes here */}
                </Grid>

                {/* Button at the bottom, right-aligned */}
                <Grid
                  size={{
                    sm: 8,
                    md: 8,
                    lg: 4
                  }}>
                  <Box display="flex" gap={1} justifyContent="flex-end">
                    {/* <Button
                      variant="contained"
                      sx={{ height: 36 }}
                      onClick={() => {
                        if (pageType === 'SALES' || pageType === 'PURCHASE') {
                          setSelectionModel([]);
                          handleClose()
                          setSelectionModel([]);
                          // setgetPay([]);
                        } else {
                          setSelectionModel([]);
                          // setGetCustomer({})
                          // setgetPay([]);
                          setResetCredit(true);
                          handleClose(false);
                        }
                      }}
                      color="secondary"
                    >
                      Close
                    </Button> */}
                    <Button
                      onClick={() => {
                        const hasReceivableOrPayable  = selectionModel.some(
                          (item) => !!item.po_number || parseFloat(item.receivable) > 0 || parseFloat(item.payable) > 0);

                        if (!hasReceivableOrPayable  && !formValues.amount) {
                          alert("Please select at least one Invoice or enter an Advance amount.");
                          return;
                        }

                        if(!moment(formValues.receiptDate).isValid()){
                          alert("Please select correct receipt date")
                          return;
                        }

                        setActiveStep((prevStep) => prevStep + 1);
                      }}
                      name="next"
                      size="medium"
                      color="primary"
                      variant="contained"
                      sx={{ marginBottom: 2 }}
                    >
                      Next
                    </Button>
                  </Box>
                </Grid>
              </Grid>


            </Grid>

          </Grid>
        )}

            {activeStep === 1 && (
              <Grid size={12}>
                <Grid container spacing={3} alignItems="flex-start" marginTop={2}>
  
                  <Grid
                    style={{ textAlign: 'start' }}
                    className='payment_top_media'
                    size={{
                      sm: 12,
                      md: 12,
                      lg: 6
                    }}>
                    <div style={{ display: 'flex', marginTop: 5 }}>
                      <Typography style={{ margin: 'auto 5px 5px' }} className='chatcontent'>
                        PAYMENT DETAILS
                      </Typography>
  
                      <div style={{ marginTop: 'auto' }}>
                        {checkPayment() ? (
                          <CheckIcon style={{ color: 'green', fontSize: '20px' }} />
                        ) : (
                          <CloseIcon style={{ color: 'red', fontSize: '20px' }} />
                        )}
                      </div>
                    </div>
  
                    {selectionModel.length > 0 && !formValues.amount &&
                      selectionModel.some((item) => !!item.po_number || parseFloat(item.receivable) > 0) && (
                        <Typography
                          style={{
                            margin: 15,
                            display: 'flex',
                            alignItems: 'left',
                            // justifyContent: 'end',
                            textAlign: 'left',
                            // marginLeft: 25,
                            // marginBottom: 20,
  
                          }}
                          className='chatcontent'
                        >
                          {`Total Amount: ${getTotalSelectedAmount(selectionModel).toFixed(2)}`}
                        </Typography>
                      )}
                    {formValues.amount && selectionModel.length === 0 &&
                      <Typography
                        style={{
                          margin: 15,
                          display: 'flex',
                          alignItems: 'left',
                          // justifyContent: 'end',
                          textAlign: 'left',
                          // marginLeft: 25,
                          // marginBottom: 20,
  
                        }}
                        className='chatcontent'
                      >
                        {/* {custType === 'VENDOR' && one.advance_amount > 0 || (typeof one.debitNote_balance !== 'undefined' &&
                              one.debitNote_balance > 0)
                              ? `Advance Amountddd : ${advanceAmount}`
                              : ''} */}
                        {`Total Amount: ${formValues.amount}`}
                      </Typography>
                    }
                    {formValues.amount && selectionModel.length > 0 &&
                      <Typography
                        style={{
                          margin: 15,
                          display: 'flex',
                          alignItems: 'left',
                          // justifyContent: 'end',
                          textAlign: 'left',
                          // marginLeft: 25,
                          // marginBottom: 20,
  
                        }}
                        className='chatcontent'
                      >
                        {`Total Amount: ${getTotalSelectedAmount(selectionModel).toFixed(2)}`}
                      </Typography>
                    }
                  </Grid>
                  {/* <div style={{ margin: "auto 0 0 auto" }}>
                        <Keyboard
                          isEntered={isEntered}
                          setEntered={setEntered}
                          total={status === 'edit' ? Total : (totalCost() + taxes()).toFixed(2)}
                          index={index}
                          Tdata={Tdata}
                          setTdata={setTdata}
                        />
                      </div> */}
                  {/* </div> */}
                  <Divider style={{ height: '2px' }} />
                  <Grid
                    style={{ display: 'flex', justifyContent: 'center' }}
                    size={{
                      xs: 12,
                      md: 12,
                      lg: 12
                    }}>
                    <div style={{ width: '100%', minWidth: '80%' }}>
                      <NewPaymentTable
                        advanceAmount={formValues.amount}
                        customer={formValues.customer_id}
                        selectionModel={selectionModel}
                        pageType={'salePurchasePage'}
                        getPay={getPay}
                        pModes={allPaymentModes}
                        isEntered={isEntered}
                        setEntered={setEntered}
                        index={index}
                        setIndex={setIndex}
                        setpayment={setpayment}
                        Tdata={Tdata}
                        setTdata={setTdata}
                        invoiceselect={invoiceselect}
                        status={status}
                        total={tot}
                        cashOutIn_denomination={cashOutIn_denomination}
                        PaymentDenominationvalidation={PaymentDenominationvalidation}
                        responseType={responseType}
                        isCashTransaction={isCashTransaction}
                        selectedTotal={formValues.amount ? parseInt(formValues.amount) : getTotalSelectedAmount(selectionModel)}
                        setpModes={setAllPaymentModes}
                        activeStep={activeStep}
                        paymentSelected={paymentSelected} // Pass selectedPayments
                        setPaymentSelected={setPaymentSelected}
                        isAmountTallied={isAmountTallied}
                        setIsAmountTallied={setIsAmountTallied}
                      />
                      {/* <PaymentPage
                        pageType={'salePurchasePage'}
                        getPay={getPay}
                        pModes={allPaymentModes}
                        isEntered={isEntered}
                        setEntered={setEntered}
                        index={index}
                        setIndex={setIndex}
                        setpayment={setpayment}
                        Tdata={Tdata}
                        setTdata={setTdata}
                        invoiceselect={invoiceselect}
                        status={status}
                        total={
                          status === 'edit'
                            ? Total
                            : (totalCost() + taxes()).toFixed(2)
                        }
                        cashOutIn_denomination={cashOutIn_denomination}
                        PaymentDenominationvalidation={PaymentDenominationvalidation}
                        responseType={responseType}
                        isCashTransaction={isCashTransaction}
                      /> */}
                    </div>
  
                  </Grid>
  
                  <Grid marginTop={5} size={12}>
                    <Grid container style={{ margin: '10px 0' }} alignItems="center" justifyContent="space-between">
                      <Grid
                        size={{
                          sm: 8,
                          md: 8,
                          lg: 4
                        }}>
                      </Grid>
  
                      <Grid
                        size={{
                          xs: 12,
                          lg: 6
                        }}>
                        <Box display="flex" alignItems="center" justifyContent="flex-end" gap={2}>
                          <Remarks />
                          <Box display="flex" gap={1}>
                            <Button
                              variant="contained"
                              onClick={() => setActiveStep(0)}
                              color="primary"
                              sx={{ height: 35, marginLeft: 5 }}
                            >
                              Prev
                            </Button>
                            {/* <Button
                              variant="contained"
                              onClick={() => handleClose(false)}
                              color="secondary"
                              sx={{ height: 35 }}
                            >
                              Close
                            </Button> */}
                          </Box>
                          {Object.keys(one).length && formValues.amount && paymentSelected.length > 0 ? (
                            <Button
                              sx={{ height: 35 }}
                              // onClick={() => AdvanceSubmit(formValues.supplier_id === null ? formValues.customer_id : formValues.supplier_id, one.company_name)}
                              onClick={() => {
                                const tempObj = {
                                  amount: calculateExcessAmountadvance().excessAmount,
                                  ...(custType === 'CUSTOMER'
                                    ? { customerId: selectedCustomerSupplier.customer_id || null }
                                    : { supplierId: selectedCustomerSupplier.supplier_id || null }),
                                  name: one.company_name,
                                };
                                addAdvanceAmount.current = tempObj;
                            
                                AdvanceSubmit(
                                  formValues.supplier_id === null
                                    ? formValues.customer_id
                                    : formValues.supplier_id,
                                  one.company_name,
                                  formValues.receiptDate
                                );
                              }}
                              variant="contained"
                              color="primary"
  
                            >
                              Submit
                            </Button>
                          ) : formValues.amount && selectionModel.length > 0 && paymentSelected.length < 0 ? (
                            <Button
                              sx={{ height: 35 }}
                              disabled  
                              variant="contained"
                              color="primary"
                            >
                              Submit
                            </Button>
                          ) : null}
                          {Object.keys(one).length &&
                            list.length && hasCreditNote || (
                            !formValues.amount &&
                            ((isAmountTallied || (checkPayment() && !isAmountTallied)) &&
                              (isAmountTallied || (paymentSelected && paymentSelected.length > 0)))) ? (
  
                            <Button
                              sx={{ height: 35 }}
                              onClick={() => {
                                if (calculateExcessAmountadvance().isExcess) {
  
                                  setAdvanceConfirmDialogOpen(true);
                                } else {    
                                  handleSubmit(null, formValues.receiptDate, addAdvanceAmounts);
                                }
                              }}
                              variant="contained"
                              color="primary"
                            >
                              Submit
                            </Button>
                          ) : !formValues.amount  ? (
                            <Button
                              sx={{ height: 35 }}
                              disabled
                              variant="contained"
                              color="primary"
                            >
                              Submit
                            </Button>
                          ) : null
                          }
                        </Box>
                      </Grid>
  
                      <CommonDialog
                        cancel_buttonName={'No'}
                        ok_buttonName={'Yes'}
                        dialogTitle={'Add Extra amount to Advance'}
                        dialogContent={`Do you want add the extra cash Rs : ${calculateExcessAmountadvance().excessAmount} as Advance amount?`}
                        cancel_fun={() => 
                          setAdvanceConfirmDialogOpen(false)
                        }
                        ok_fun={handleAdvanceAmountAndSubmit}
                        open={advanceConfirmDialogOpen}
                        handleClose={() => setAdvanceConfirmDialogOpen(false)}
                        //discard_buttonName={"Cancel"}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            )}


            </Grid>
          </Card>
      }
      <CommonDialog
        cancel_buttonName={'No'}
        ok_buttonName={'Yes'}
        dialogTitle={'Add Extra amount to Advance'}
        dialogContent={`Do you want add the extra cash Rs : ${calculateExcessAmountadvance().excessAmount} as Advance amount?`}
        cancel_fun={() => 
          setAdvanceConfirmDialogOpen(false)
        }
        ok_fun={handleAdvanceAmountAndSubmit}
        open={advanceConfirmDialogOpen}
        handleClose={() => setAdvanceConfirmDialogOpen(false)}
        //discard_buttonName={"Cancel"}
      />
    </Grid>
  );
};

export default Cust;
