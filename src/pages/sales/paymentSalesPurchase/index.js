import React, {useEffect, useState, useRef, useContext, useMemo} from 'react';
import {Grid, Divider, Card, Button, Typography, TextField, Alert} from '@mui/material';
import {Remarks} from '../../../components/pos/payment_section/Types/Remarks';
// import Keyboard from "../../components/pos/payment_section/Keyboard";
import PaymentPage from '../../../components/pos/payment_section/NewPayment';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PayablesTable from './PayablesTable';
import Creditdebit from './Creditdebit';
import PaymentMethodServices from '../../../services/payment_method_services';
// import ContactsIcon from '@mui/icons-material/Contacts';
import {useDispatch, useSelector} from 'react-redux';
import {getDenominationValidationByIdAction} from '../../../redux/actions/cashOutIn_actions';
import context from '../../../context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import CommonDialog from 'components/commonDialog';
import { sendOtpAction, verifyOtpAction } from '../../../redux/actions/payment_method_actions'
import DataGridDemo from '../../../components/pos/payment_section/Table'
import { getsessionStorage } from 'pages/common/login/cookies';
import { createSalesApproval } from 'redux/actions/sales_actions';
import moment from 'moment';

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
  poNum,
  addAdvanceAmount={current:null},
  rowData,
  receivables
}) => {

  // console.log('getPay', getPay)
  // console.log(Tdata,"cc")
  const dispatch = useDispatch();
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
  const [advanceConfirmDialogOpen, setAdvanceConfirmDialogOpen] = useState(false)
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
  const [isValidateEnabled, setIsValidateEnabled] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false); 
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false); 
  const [alertSeverity, setAlertSeverity] = useState("warning"); 
  const [receivableData,setReceivableData] = useState()
  const [request,setRequest] = useState(false)
  const [finalData,setFinalData]=useState()
  const [disApproval,setDisApproval]=useState(false)
  const [totalAmount,setTotalAmount] = useState()
  
   let storage = getsessionStorage()
  
  const isVendorPayment = typeof one.debitNote_balance !== 'undefined' ? true : false;

  const {commoncookie, setLoaderStatusHandler, setModalTypeHandler} = useContext(context);
  const {
          salesReducer : {salesApprovals,getApprovalRights}
      } = useSelector(state => state)
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
    list?.forEach((d) => {
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

  useEffect(() => {
    if (Object.keys(one).length) {
      let getfilval = false;
      if (one.state === 'Tamil Nadu' && one.country === 'India') {
        getfilval = true;
      }
      settaxtype(getfilval);
    }
    PaymentMethodServices.getAllPaymentModeForPaymentPage()
      .then((res) => {

          setAllPaymentModes(res.data);
      })
      .catch((err) => {});
  }, [one]);


  const initsform = () => {
    let total = selectionModel.reduce((a ,c) => {
      return a + (+c.total - +c.paid_amount);
    }, 0);
    creditnote === true ? setTotal( typeof one.debitNote_balance !== 'undefined' ? total - one.debitNote_balance : total - one.creditNote_balance) : setTotal(total);
    creditnote === true ? handleEntry?.(true) : handleEntry?.(false);
    setTotal(total - advanceAmount);
    
    setTdata([]);
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
  }, [selectionModel, manualNoteSchemes.filter(i => i.selected).length]);


  // useEffect(() => {
  //   let total = selectionModel.reduce((a ,c) => {
  //     return a + (+c.total - +c.paid_amount);
  //   }, 0);
  //   calculateAdjustedAmount(total);

  // },[selectionModel, manualNoteSchemes.filter(i => i.selected).length])

  const checkPayment = () => {

    if (creditnote && selectionModel.length > 0) {
      let totalAmount = selectionModel.reduce((a, c) => a + (c.total - c.paid_amount), 0);

      let creditOrDebitBal = advanceAmount
      // let creditOrDebitBal = one.creditNote_balance || one.debitNote_balance || one.advance_amount
      return true
      // if (creditOrDebitBal >= totalAmount) {
      //   return true
      // }
      // if (creditOrDebitBal <= totalAmount) {
      //   return true
      // }
    }
    const getAmount = Tdata?.reduce(function (acc, obj) {
      return acc + +obj.payment_amount;
    }, 0);

    if(getApprovalRights?.rights !== true && salesApprovals?.length > 0 ){

      if(salesApprovals[0].status === 'Pending'){
        return false
      }

      const updated = JSON.parse(salesApprovals[0].Payment_Tdata)
      const getAmount = updated?.reduce(function (acc, obj) {
        return acc + +obj.payment_amount;
      }, 0);

      if (getAmount > 0) {
        //&& +totalamount
        return true;
      } else {
        return false;
      }

    }

    

    const totalamount = (totalCost() + taxes()).toFixed(2);
    if (getAmount > 0) {
      //&& +totalamount
      return true;
    } else {
      return false;
    }
  };
  const PaymentDenominationvalidation = (value) => {
    if(value){
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(getDenominationValidationByIdAction(value))
      );
    }
  }

  function calculateExcessAmount(){
    const changeAmountTotal = Tdata?.reduce(function (acc, obj) {
      if(obj.payment_type === "Cash (INR)"){
        return acc + +obj.cash_adjustment;
      }else{
        return acc
      }
    }, 0);
    return {
      isExcess : changeAmountTotal > 0,
      excessAmount : changeAmountTotal
    }
  }


  function calculateAdjustedAmount(total) {
    
    // const arr = [10,20];
    // const total = 1;
    // const ActualTotal = (total - advanceAmount) <= 0 ? 0 : total - advanceAmount

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
    }
    );
    setManualNoteSchemes(res)
  }
  const advanceAmount = useMemo(() => {
    return manualNoteSchemes.reduce((acc, curr) => {
      if (curr.selected) {
        return acc + curr.balance_amount
      } else {
        return acc;
      }
    }, 0)
  }, [manualNoteSchemes])

  function handleAdvanceAmountAndSubmit(){
    const tempObj = {
      amount: calculateExcessAmount().excessAmount,
      ...(custType === 'CUSTOMER'
        ? {customerId: one.customer_id}
        : {supplierId: one.supplier_id}),
      name: one.company_name,
    };
    addAdvanceAmount.current = tempObj
    setAdvanceConfirmDialogOpen(false);
    handleSubmit()
  }

  const handleVerifyOtp = async () => {
    if (otp.trim()) {
      const data = custType === "VENDOR" ? {
        company_id: one.company_id,
        company_name: one.company_name,
        otp: otp,
        type: 'Vendor'
      } : {
        company_id: one.company_id,
        company_name: one.company_name,
        otp: otp,
      }
  
      try {
        const response = await dispatch(verifyOtpAction(data));
        // console.log(response, "status");
  
        if (response === "success") {
          setIsValidateEnabled(true);
          setIsOtpSubmitted(true);
          setAlertMessage("OTP verified successfully!");
          setAlertSeverity("success"); 
          setShowAlert(true);
          // console.log("b2");
        } else {
          // console.log("b1");
          setAlertMessage(response?.message || "Invalid OTP. Please try again.");
          setAlertSeverity("warning");
          setShowAlert(true);
        }
      } catch (error) {
        console.error("Failed to verify OTP", error);
        setAlertMessage("An error occurred while verifying OTP. Please try again.");
        setAlertSeverity("error"); 
        setShowAlert(true);
      }
    }
  };

  
  
  const handleOtpSubmit = async () => {
    const updated = salesApprovals.length > 0 ? JSON.parse(salesApprovals[0]?.Payment_Tdata) : []
    const totalPayment = updated?.reduce((sum, item) => sum + Number(item.payment_amount), 0);

    const poNumber = Array.isArray(getPay) && getPay.length > 0 ? getPay[0].po_number : null;
      const data = custType === "VENDOR" ? {
        company_id: one.company_id,
        company_name: one.company_name,
        phone_number: one.phone_number,
        payment_amount: Tdata[0].payment_amount,
        type: 'Vendor'
      } : {
        company_id: one.company_id,
        company_name: one.company_name,
        phone_number: one.phone_number,
        payment_amount: Tdata[0]?.payment_amount  || totalPayment 
      }
      // console.log("BYE", data)
    try {
      // console.log("BYEc", data)
      const response = await dispatch(sendOtpAction(data));
      setOtpSent(true);
      setShowAlert(false);
        
      } catch (error) {
        console.error("Failed to send OTP", error);
      }
  };


  useEffect(() => {

    console.log(getApprovalRights.rights,'riasbadasbda')
    
    if(getApprovalRights){
      if(getApprovalRights?.rights === true ){
        return setRequest(false)
      }
    }
    if (getApprovalRights?.rights !== true && receivableData?.length > 0 && Tdata?.length > 0) {

      const chequeDates = Tdata.map(item => new Date(item.chequeDate));
  
      const exceededInvoices = receivableData
        .filter(item => {
          const dueDate = new Date(item.due_date);
          return chequeDates.some(chequeDate => chequeDate > dueDate);
        })
        .map(item => ({
          invoice_number: item.po_number,
          due_date: item.due_date,
          total_amount: item.total,
          due_amount: item.total - item.paid_amount
        }));
  
      // console.log("Exceeded Invoices Length:", exceededInvoices.length > 0);
      // console.log("Exceeded Invoices:", exceededInvoices);
      setFinalData(exceededInvoices)
      setRequest(exceededInvoices.length > 0);

      const totalPaymentAmount = Tdata.reduce((sum, item) => {
        return sum + Number(item.payment_amount); 
      }, 0);

      setTotalAmount(totalPaymentAmount)

    }
  }, [receivableData, Tdata,getApprovalRights?.length]);
  

  function formatDate(dateStr) {
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;  // Converts to YYYY-MM-DD
  }

 console.log(receivables,'finalaggsgsgsgsg')


  const handleRequest = ()=>{

    const payload = {
      data :{
       customer_id : rowData[0]?.customer_id,
       credit_value : rowData[0]?.creditvalue,
       total : totalAmount,
       date :formatDate(rowData?.[0]?.sale_time),
       status  :  'Pending',
       po_number : rowData[0]?.invoice_number,
       request_type : 'Payment',
       receivable_items : JSON.stringify(finalData),
       cheque_details :  'null',
        Payment_Tdata : JSON.stringify(Tdata),
        sales_payment : JSON.stringify(receivables)
  
     },
  
      data1 : {
       customer_id :rowData[0]?.customer_id,
       tot_amount : totalAmount,
       req_date : new Date(),
       status  :  'Pending',
       request_type : 'Payment'
     }
    }
    dispatch(createSalesApproval(payload))
    setDisApproval(true)
    // handleClose()
  }


  // useEffect(() => {
  
  //   if (storage.role_name === 'Salesman' && receivableData?.length > 0 && Tdata?.length > 0) {
  //     // Extract all cheque dates from getChequeData
  //     const chequeDates = Tdata.map(item => new Date(item.chequeDate));
  //     console.log('ChequeDates:', chequeDates);
  
  //     // Extract due date from receivableData
  //     const dueDate = new Date(receivableData[0].due_date);
  //     console.log('DueDate:', dueDate);
  
  //     // Check if any cheque date exceeds the due date
  //     const isAnyExceeded = chequeDates.some(chequeDate => chequeDate > dueDate);
  
  //     setRequest(isAnyExceeded);
  //   }
  // }, [receivableData, Tdata]);

  // console.log(Tdata,'finalTdata',receivableData,totalAmount)
  // console.log(request,'requuuyyyy',finalData)


  return (
    <Grid style={{display: 'flex'}}>
      <Card sx={{padding: '0px 50px 0px 50px'}}>
        <Grid container display='flex'>
          <Grid size={12}>
            <h2
              style={{
                margin: '10px 0 25px 0',
                color: 'rgba(0,0,0,0.6)',
                textAlign: 'center',
              }}
            >
              {custType === 'CUSTOMER' ? 'RECEIPT ENTRY' : 'PAYMENT ENTRY'}
            </h2>
          </Grid>
          <Grid
            style={{textAlign: 'start', padding: '0 40px'}}
            size={{
              sm: 12,
              md: 12,
              lg: 6
            }}>
            <div>
              <div style={{display: 'flex', marginTop: 4}}>
                <h3 style={{margin: 'auto 5px 5px', color: 'rgba(0,0,0,0.6)'}}>
                  {`${custType} DETAILS`}
                </h3>
                <div>
                  {Object.keys(one).length ? (
                    <CheckIcon style={{color: 'green', fontSize: '25px'}} />
                  ) : (
                    <CloseIcon style={{color: 'red', fontSize: '25px'}} />
                  )}
                </div>
              </div>
              <Divider style={{height: '2px', marginBottom: 10}} />
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                height: 'calc(100% - 50px)',
              }}
            >
              {Object.keys(one).length ? (
                <div style={{display: 'flex', marginLeft: '10px'}}>
                  <div style={{width: '50%'}}>
                    <Typography style={{fontSize: '1rem', fontWeight: 'bold'}}>
                      {`${one.company_name || one.first_name}`}
                    </Typography>
                    <Typography style={{margin: 0, lineHeight: 1.6}}>{`${
                      one.address ? one.address + ',' : ''
                    } ${one.city ? one.city + ',' : ''} ${
                      one.state ? one.state + ',' : ''
                    } ${one.country || ''} - ${one.zip || ''}`}</Typography>
                    <Typography style={{margin: '0 0 10px 0'}}>{`Mobile No : ${
                      one.phone_number || ''
                    }`}</Typography>
                  </div>

                  <Typography style={{marginLeft: 'auto'}}>
                    {one.email || ''}
                  </Typography>
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

              <div className='payment_top_media'>
                {status === 'edit' ? (
                  <>
                    <PayablesTable
                      getPay={getPay}
                      poNum={poNum}
                      setSelectionModel={setSelectionModel}
                      selectionModel={selectionModel}
                      activeINV={activeINV}
                      invoiceselect={invoiceselect}
                      setinvoiceselect={setinvoiceselect}
                      setReceivableData = {setReceivableData}
                    />
                    {one.advance_amount > 0 ||
                    (typeof one.creditNote_balance !== 'undefined' &&
                      one.creditNote_balance > 0) ||
                    (typeof one.debitNote_balance !== 'undefined' &&
                      one.debitNote_balance > 0) ? (
                      <Creditdebit
                        // creditdebit={one}
                        manualNoteSchemes={manualNoteSchemes}
                        setManualNoteSchemes={setManualNoteSchemes}
                        creditnote={creditnote}
                        setCreditNote={setCreditNote}
                      />
                    ) : (
                      ''
                    )}
                    {creditnote === true && (
                      <Typography
                        style={{
                          margin: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'end',
                          fontWeight: 'bold',
                          fontSize: '1.1rem',
                        }}
                      >
                        {(custType === 'CUSTOMER' && one.advance_amount > 0) ||
                        (typeof one.creditNote_balance !== 'undefined' &&
                          one.creditNote_balance > 0)
                          ? `Advance Amount : ${advanceAmount}`
                          : ''}
                      </Typography>
                    )}
                    {creditnote === true && (
                      <Typography
                        style={{
                          margin: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'end',
                          fontWeight: 'bold',
                          fontSize: '1.1rem',
                        }}
                      >
                        {(custType === 'VENDOR' && one.advance_amount > 0) ||
                        (typeof one.debitNote_balance !== 'undefined' &&
                          one.debitNote_balance > 0)
                          ? `Advance Amount : ${advanceAmount}`
                          : ''}
                      </Typography>
                    )}
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
                ) : (
                  <>
                    <div style={{display: 'flex', marginTop: 10}}>
                      <h3
                        style={{
                          margin: 'auto 5px 5px',
                          color: 'rgba(0,0,0,0.6)',
                        }}
                      >
                        PRODUCT DETAILS
                      </h3>

                      <div>
                        {list?.length ? (
                          <CheckIcon
                            style={{color: 'green', fontSize: '25px'}}
                          />
                        ) : (
                          <CloseIcon style={{color: 'red', fontSize: '25px'}} />
                        )}
                      </div>
                    </div>
                    <Divider style={{height: '2px'}} />
                    {list?.length ? (
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
                          >{`${totalCost().toFixed(2)} ₹`}</Typography>
                        </Grid>

                        {taxtype ? (
                          <>
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
                              >{`${(taxes() / 2).toFixed(2)} ₹`}</Typography>
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
                              >{`${(taxes() / 2).toFixed(2)} ₹`}</Typography>
                            </Grid>
                          </>
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
                              >{`${taxes().toFixed(2)} ₹`}</Typography>
                            </Grid>
                          </>
                        )}

                        <Grid style={{margin: '15px 0'}} size={12}>
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
                        <Grid style={{margin: '15px 0'}} size={12}>
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
                )}
              </div>
            </div>
          </Grid>
          <Grid
            style={{textAlign: 'start', padding: '0 40px'}}
            className='payment_top_media'
            size={{
              sm: 12,
              md: 12,
              lg: 6
            }}>
            <div style={{display: 'flex', marginTop: 5}}>
              <h3 style={{margin: 'auto 5px 5px', color: 'rgba(0,0,0,0.6)'}}>
                PAYMENT DETAILS
              </h3>

              <div style={{marginTop: 'auto'}}>
                {checkPayment() ? (
                  <CheckIcon style={{color: 'green', fontSize: '25px'}} />
                ) : (
                  <CloseIcon style={{color: 'red', fontSize: '25px'}} />
                )}
              </div>

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
            </div>
            <Divider style={{height: '2px'}} />
            {/* <div style={{display: 'flex'}}> */}
            <div style={{padding: '16px 0'}}>
              <PaymentPage
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
                  status === 'edit' ? Total : (totalCost() + taxes()).toFixed(2)
                }
                cashOutIn_denomination={cashOutIn_denomination}
                PaymentDenominationvalidation={PaymentDenominationvalidation}
                responseType={responseType}
                rowData = {rowData}
                receivableData = {receivableData}
                
              />
            </div>
            {/* </div> */}
          </Grid>

          <Grid size={12}>
            <Grid container style={{margin: '10px 0'}}>
              <Grid
                style={{padding: '0 40px', marginTop: 'auto'}}
                size={{
                  sm: 4,
                  md: 4,
                  lg: 6
                }}>
                <Button
                  variant='contained'
                  sx={{height: 40}}
                  onClick={handleClose}
                  color='secondary'
                >
                  Back
                </Button>
              </Grid>
              <Grid
                style={{display: 'flex', padding: '0 40px'}}
                className='payment_top_media'
                size={{
                  sm: 8,
                  md: 8,
                  lg: 6
                }}>
                <Grid>
                  {(Object?.keys(one)?.length && list?.length && checkPayment()) && storage?.company_type === 3 && storage.role_name === 'Salesman' && !request ||
                  (getPay[0]?.saleType !== undefined && getPay[0]?.saleType == 'Outstanding Invoice' && Object.keys(one).length  && checkPayment()) && storage?.company_type === 3 && storage.role_name === 'Salesman' && !request ? (
                    <Grid style={{marginBottom: 10}}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Button
                              variant="contained"
                              color="secondary"
                              onClick={handleOtpSubmit}
                              disabled={isOtpSubmitted }
                            >
                              Send OTP
                          </Button>
                          <span style={{ marginLeft: 150 }} />
                            {otpSent && (
                              <>
                                <TextField
                                  label="Enter OTP"
                                  variant="outlined"
                                  size="small"
                                  value={otp}
                                  onChange={(e) => setOtp(e.target.value)}
                                  style={{ marginLeft: 10, marginRight: 10 }}
                                  disabled={isValidateEnabled}
                                />
                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={handleVerifyOtp}
                                  disabled={!otp.trim() || isValidateEnabled}
                                >
                                  Submit OTP
                              </Button>
                              </>
                            )}
                          </div>
                    </Grid>
                  ) : null}
                  {otpSent && (
                    <span style={{ marginLeft: 10, fontSize: '12px', color: 'gray' }}>OTP has sent to Mobile No: {one.phone_number} </span>
                  )}

                  
                  
                <Grid style={{ marginTop: 10, width: "100%" }}>
                {showAlert && <Alert severity={alertSeverity}>{alertMessage}</Alert>}
               </Grid>

                  <Grid style={{width: '100%'}}>
                    <Remarks />
                  </Grid>
                </Grid>

                <Grid style={{display: 'flex', height: 40, marginTop: 'auto'}}>
                  {Object.keys(one).length && list.length && checkPayment() ?
                  
                  request ?
                    (
                      <Button
                      style={{marginLeft: 20}}
                      onClick={handleRequest}
                      variant='contained'
                      color='primary'
                      disabled={disApproval}
                    >
                       Request Approval
                    </Button>

                    )
                    :
                  (
                   
                    <Button
                      style={{marginLeft: 20}}
                      onClick={() => {
                        if (calculateExcessAmount().isExcess) {
                          setAdvanceConfirmDialogOpen(true);
                        } else {
                          handleSubmit();
                        }
                      }}
                      variant='contained'
                      color='primary'
                      disabled={storage?.company_type === 3 && storage.role_name === 'Salesman' ? (!isOtpSubmitted && !isValidateEnabled) : false}
                    >
                       Validate
                    </Button>

                    

                  ) : (getPay[0]?.saleType !== undefined && getPay[0]?.saleType == 'Outstanding Invoice' && Object.keys(one).length  && checkPayment()) ?(
                    <Button
                      style={{marginLeft: 20}}
                      onClick={() => {
                        if (calculateExcessAmount().isExcess) {
                          setAdvanceConfirmDialogOpen(true);
                        } else {
                          handleSubmit();
                        }
                      }}
                      variant='contained'
                      color='primary'
                      disabled={storage?.company_type === 3 && storage.role_name === 'Salesman' ? (!isOtpSubmitted && !isValidateEnabled) : false}
                    >
                      Validate
                    </Button>
                  ) : (
                    <Button
                      style={{marginLeft: 20}}
                      disabled
                      variant='contained'
                      color='primary'
                    >
                      {salesApprovals[0]?.status === 'Pending' ? 'Waiting For Approval' : 'Validate'} 
                    </Button>
                  )}
                </Grid>
              </Grid>
              <CommonDialog
                cancel_buttonName={'No'}
                ok_buttonName={'Yes'}
                dialogTitle={'Add Extra amount to Advance'}
                dialogContent={`Do you want add the extra cash Rs : ${
                  calculateExcessAmount().excessAmount
                } as Advance amount?`}
                cancel_fun={() => {
                  addAdvanceAmount.current = null;
                  handleSubmit();
                }}
                ok_fun={handleAdvanceAmountAndSubmit}
                open={advanceConfirmDialogOpen}
                handleClose={() => setAdvanceConfirmDialogOpen(false)}
              />
            </Grid>
          </Grid>
        </Grid>
      </Card>
    </Grid>
  );
};

export default Cust;
