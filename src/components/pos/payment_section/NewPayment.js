import React, { useState, useEffect, useRef, useContext } from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Table from './Table';
import { v4 as uuidv4 } from 'uuid';
import Card from './Types/Card';
import { useDispatch, useSelector } from 'react-redux';
import { listPosCreationAction } from '../../../redux/actions/pos_creations_actions';
import context from '../../../context/CreateNewButtonContext';
import { listCashBoxLocationAction } from '../../../redux/actions/cash_box_actions'
import moment from 'moment';
import DenominationDialog from './DenominationDialog';
import { Box, Stack, Tooltip, Typography } from '@mui/material';

import { AppScrollbar } from '@crema';
import apiCalls from 'utils/apiCalls';
import Grid from "@mui/material/Grid";
import { getsessionStorage } from 'pages/common/login/cookies';
import { approvalUserRightsAction, salesApprovalsAction } from 'redux/actions/sales_actions';



const NewPayment = ({
  Tdata,
  setTdata,
  invoiceselect,
  status,
  total,
  index,
  setIndex,
  isEntered,
  setEntered,
  pModes,
  posId,
  getPay,
  pageType = 'posSalePage',
  cashOutIn_denomination,
  PaymentDenominationvalidation,
  responseType,
  rowData,
  isCashTransaction=false,
  receivableData,
  roundedOffEnabled
}) => {

  
  const dispatch = useDispatch();
  const { commoncookie, setModalTypeHandler, setLoaderStatusHandler, headerLocationId } = useContext(context);
  const [openDenominationDialog, setOpenDenominationDialog] = useState(false);
  const [currentTarget, setCurrrentTarget] = useState('Tendered');
  const { pos_creation } = useSelector((state) => state.posCreationReducer);
  const tempinitsform = useRef(null);
  const [normalCashBoxInfo, setNormalCashBoxInfo] = useState({ cash_box_id: null, cashboxLedgerId: null })
  const [referenceNo, setReferenceNo] = useState(null)
  const [chequeInfo, setChequeInfo] = useState({ bankName: null, chequeDate: new Date(), chequeNumber: null })
  const [activeOpen, setActiveOpen] = useState(-2);
  const [open, setOpen] = useState(-1);
  const [defaultcash, setDefaultcash] = useState({})
  const wrapperRef = useRef(null)
  const {cash_box_denomination, cash_box_list, locateCashBox} = useSelector((state) => state.cashBoxReducer);
  const [denominationtable, setdenominationtable] = useState(1)
  const [tempData,setTempData] = useState([])
  const [prevRequest,setPrevRequest] = useState(false)
  const storage = getsessionStorage()
  const [bulkData,setBulkData] = useState([])

  const {
            salesReducer : {salesApprovals,getApprovalRights}
        } = useSelector(state => state)

  function isOpen (){
    return open === activeOpen;
  }

  useEffect(() =>{

  },[open, activeOpen])

    useEffect(()=>{ (async () => {
      if(storage.role_name !== 'Administrator' && rowData?.length > 0 && storage?.company_type === 3){
        const payload1 = {
          type : 'PaymentApproval'
         }
        await dispatch(approvalUserRightsAction(payload1))
      }
      if(getApprovalRights?.rights !== true && rowData?.length > 0 && storage?.company_type === 3){
        const payload = {
          type : 'Approved',
          customer_id : rowData[0]?.customer_id
        }
        
        await dispatch(salesApprovalsAction(payload))
      }
  })();
},[dispatch,rowData?.length])

  const initsform = () => {
    if (pos_creation.length === 0) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          listPosCreationAction(
            () => { },
            () => { },
          ),
        )
      );
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(listCashBoxLocationAction(headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
    );
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    // if(pos_creation.length === 0){
    tempinitsform.current();
    // }
  }, []);

  const getCashBoxId = () => {
    let res = pos_creation.filter((f) => f.posId === posId);
    if (res.length > 0) {
      return res[0].cashBox;
    }
  };
  const getCashBoxLedgerId = () => {
    let res = pos_creation.filter((f) => f.posId === posId);
    if (res.length > 0) {
      return res[0].cashboxLedgerId;
    }
  };
  const getPaymentModeLedgerId = (paymentId) => {
    let res = pModes.filter((f) => f.paymentId === paymentId);
    if (res.length > 0) {
      return res[0].ledger_id;
    }
  };

  // console.log(prevRequest,'prevRequest')

  const create = (type, getAmount, amount, paymentId) => {


    const obj = {
      id: uuidv4(),
      due: roundedOffEnabled === 'true' ? +Math.round(+Number(total) - getAmount) : +(+Number(total) - getAmount),
      payment_amount: amount
        ? Tdata.length
          ? getAmount < +total
            ? roundedOffEnabled === 'true' ? +Math.round((+total - getAmount)) : +(+Number(total) - getAmount)
            : ''
          : roundedOffEnabled === 'true' ? +Math.round(Number(total)) : +(Number(total))
        : '',
      cash_adjustment: 0,
      payment_type: type,
      cash_refund: 0,
      employee_id: commoncookie,
      reference_code: '',
      tendered: [], 
      change: [],
      cash_box_id: type === 'Cash (INR)'? normalCashBoxInfo.cash_box_id !== null && typeof posId === 'undefined' ? normalCashBoxInfo.cash_box_id : getCashBoxId() : null,
      paymentId: paymentId,
      cashboxLedgerId: type === 'Cash (INR)'? normalCashBoxInfo.cashboxLedgerId !== null && typeof posId === 'undefined' ? normalCashBoxInfo.cashboxLedgerId : getCashBoxLedgerId() : null,
      paymentLedgerId: getPaymentModeLedgerId(paymentId),
      ledger_id: typeof getPay !== 'undefined' ? getPay[0]?.ledger_id : 0,
      referenceNumber: referenceNo,
      bankName: chequeInfo.bankName,
      chequeNumber: chequeInfo.chequeNumber,
      chequeDate: (moment(chequeInfo.chequeDate, 'year', 'month', 'day')).format("yyyy-MM-DD")

    };
    if(getApprovalRights.rights !== true && prevRequest === true){
      // console.log('jhgf09876')
      setTempData((prevTdata) => {
        return [...prevTdata, obj];
      });
      setBulkData([...bulkData,obj])
    }
    else{
      
      setTdata([...Tdata, obj]);
      setBulkData([...bulkData,obj])

    }
    // setTempData([...tempData, obj]);
   
    setIndex(Tdata.length);
  };

  // console.log(tempData,'insetttt')


  useEffect(() => {
    if (receivableData?.length > 0 && salesApprovals?.length > 0 && getApprovalRights?.rights !== true) {
   
        const parsedPayments = JSON.parse(salesApprovals[0].Payment_Tdata); 
  
        const filteredPayments = parsedPayments.filter(payment =>
          payment.ledger_id === receivableData[0].ledger_id)
  
  
        setTempData(filteredPayments); 
      } 
    
  }, [receivableData?.length, salesApprovals?.length]);

  const handleClick = (type, paymentId, denomination) => {
    // setOpenDenominationDialog(true);
    if(  denomination === 0){
      
      cardPayment('Cash (INR)', paymentId) 
     } else {
   
      setOpenDenominationDialog(true);
    
      setCurrrentTarget('Tendered');

      pageType === 'posSalePage' && setdenominationtable(denomination)
    
    const getAmount = Tdata.reduce(function (acc, obj) {
      return acc + +obj.payment_amount;
    }, 0);

    if (!Tdata.length) {
      create(type, getAmount, undefined, paymentId);
      return;
    }

    if (
      +Tdata[Tdata.length - 1].payment_amount &&
      Tdata[Tdata.length - 1].payment_type &&
      getAmount < +total
    ) {
      create(type, getAmount, undefined, paymentId);
      return;
    }

    const copy = [...Tdata];
    const pindex = copy.findIndex((i) => !i.payment_type || !+i.payment_amount);
    if (pindex !== -1) {
      copy[pindex].payment_type = type;
      copy[pindex].cash_box_id = normalCashBoxInfo.cash_box_id !== null && typeof posId === 'undefined' ? normalCashBoxInfo.cash_box_id : getCashBoxId(),
        copy[pindex].paymentId = paymentId,
        copy[pindex].cashboxLedgerId = normalCashBoxInfo.cashboxLedgerId !== null && typeof posId === 'undefined' ? normalCashBoxInfo.cashboxLedgerId : getCashBoxLedgerId(),
        copy[pindex].paymentLedgerId = getPaymentModeLedgerId(paymentId),
        copy[pindex].ledger_id = typeof getPay !== 'undefined' ? getPay[0]?.ledger_id : 0,
        copy[pindex].referenceNumber = referenceNo,
        copy[pindex].bankName = chequeInfo.bankName,
        copy[pindex].chequeNumber = chequeInfo.chequeNumber,
        copy[pindex].chequeDate = (moment(chequeInfo.chequeDate, 'year', 'month', 'day')).format("yyyy-MM-DD")
    }

    setTdata(copy);
    setIndex(pindex);
     }
  };

  const multiFunction = (paymentId,denominations ) => {
    setdenominationtable(denominations);
    handleClick ('Cash (INR)', paymentId,denominations );
  }
  const editPay = (pindex, getData, getAmount) => {
    let nindex = pindex;
    for (let i = pindex + 1; i < getData.length; i++) {
      if (getAmount < +total) {
        let due = +getData[nindex].due - +getData[nindex].payment_amount;
        if (!due) {
          getData.splice(i, getData.length - 1 - i + 1);
        } else {
          getData[i].due = due;
          nindex += 1;
        }
      } else {
        if (i === getData.length - 1) {
          getData.splice(pindex + 1, getData.length - 1 - pindex + 1);
        }
      }
    }
  };

 
  const cardPayment = (type, paymentId) => {

    
    if(activeOpen === paymentId){
      setActiveOpen(-1)
    }else{
      setActiveOpen(paymentId)
    }
    setOpenDenominationDialog(false);
    let getAmount = Tdata.reduce(function (acc, obj) {
      return acc + +obj.payment_amount;
    }, 0);
    if (!Tdata.length) {
      create(type, getAmount, true, paymentId);
      return;
    }

    if (
      +Tdata[Tdata.length - 1].payment_amount &&
      Tdata[Tdata.length - 1].payment_type &&
      getAmount < +total
    ) {

      // cardPayment.log('cardtatalength', type, getAmount, true, paymentId)
      create(type, getAmount, true, paymentId);
      return;
    }

    // console.log('222222')

    const copy = [...Tdata];
    const pindex = copy.findIndex((i) => !+i.payment_amount || !i.payment_type);

    if (pindex !== -1) {
      copy[pindex].payment_type = type;
       copy[pindex].cash_box_id = normalCashBoxInfo.cash_box_id !== null && typeof posId === 'undefined' ? normalCashBoxInfo.cash_box_id : getCashBoxId(),
       copy[pindex].cashboxLedgerId = normalCashBoxInfo.cashboxLedgerId !== null && typeof posId === 'undefined' ? normalCashBoxInfo.cashboxLedgerId : getCashBoxLedgerId()
       copy[pindex].paymentId = paymentId
       copy[pindex].paymentLedgerId = getPaymentModeLedgerId(paymentId)
       copy[pindex].ledger_id = typeof getPay !== 'undefined' ? getPay[0]?.ledger_id : 0
       copy[pindex].referenceNumber = referenceNo
       copy[pindex].bankName = chequeInfo.bankName
       copy[pindex].chequeNumber = chequeInfo.chequeNumber
       copy[pindex].chequeDate = (moment(chequeInfo.chequeDate, 'year', 'month', 'day')).format("yyyy-MM-DD")
    }
    if (getAmount < +total && !+copy[pindex].payment_amount) {
      copy[pindex].payment_amount = +total - getAmount;
    
      getAmount = +total - getAmount;
      editPay(pindex, copy, getAmount);
    }

    setTdata(copy);
    setIndex(pindex);
  };

  // console.log(bulkData,'bulkDatatatata',total)

  const getModes = (type, paymentName, paymentId = null, denominations) => {
   
    const createModes = {
      // Cheque: (
      //   <Button onClick={() => cardPayment('Cheque (INR)', paymentId)}>
      //     {paymentName ? paymentName : type}
      //   </Button>
      // ),
      Cheque: <Card style={{ overflow: 'hidden' }} onClick={() => cardPayment('Cheque (INR)', paymentId)} Tdata={Tdata} total={total} paymentName={paymentName ? paymentName : type} type={type} referenceNo={referenceNo} setReferenceNo={setReferenceNo} chequeInfo={chequeInfo} setChequeInfo={setChequeInfo} paymentId={paymentId} isOpen={isOpen} setOpen={setOpen} setActiveOpen={setActiveOpen} activeOpen={activeOpen} rowData={rowData} receivableData={receivableData} tempData =  {bulkData}  setPrevRequest ={setPrevRequest}/>,
      // DefaultCash: <Card style={{ overflow: 'hidden' }} onClick={() => cardPayment('DefaultCash', paymentId)} Tdata={Tdata} total={total} paymentName={paymentName ? paymentName : type} type={type} referenceNo={referenceNo} setReferenceNo={setReferenceNo} chequeInfo={chequeInfo} setChequeInfo={setChequeInfo} paymentId={paymentId} isOpen={isOpen} setOpen={setOpen} setActiveOpen={setActiveOpen} activeOpen={activeOpen} />,

      Cash: pageType === 'salePurchasePage' ? (  <Card style={{ overflow: 'hidden' }} handleCashClick={handleClick} Tdata={Tdata} PaymentDenominationvalidation={PaymentDenominationvalidation} cash_type={"Cash (INR)"} paymentId={paymentId} total={total} paymentName={paymentName ? paymentName : type} type={type} referenceNo={referenceNo} setReferenceNo={setReferenceNo} chequeInfo={chequeInfo} setChequeInfo={setChequeInfo} setOpenDenominationDialog={setOpenDenominationDialog} setNormalCashBoxInfo={setNormalCashBoxInfo} isOpen={isOpen} setOpen={setOpen} setActiveOpen={setActiveOpen} activeOpen={activeOpen} isCashTransaction={isCashTransaction} defaultcash = {defaultcash} setDefaultcash = {setDefaultcash} normalCashBoxInfo = {normalCashBoxInfo}/>) : (
       
        <Button
        variant='outlined'
        // sx={{height:'50px',borderRadius:'8px',width:'90px'}}
          onClick={() => multiFunction ( paymentId,denominations )
            // handleClick('Cash (INR)', paymentId,denominations )
          }
        >
          <Typography
          sx={{
          fontSize: 10,
          fontWeight: 600,
          // cursor: "pointer"
        }}>{paymentName ? paymentName : type}</Typography>
      </Button>),
      Card: <Card style={{ overflow: 'hidden' }} onClick={() => cardPayment('Card (INR)', paymentId)} Tdata={Tdata} total={total} paymentName={paymentName ? paymentName : type} type={type} referenceNo={referenceNo} setReferenceNo={setReferenceNo} chequeInfo={chequeInfo} setChequeInfo={setChequeInfo} paymentId={paymentId} isOpen={isOpen} setOpen={setOpen} setActiveOpen={setActiveOpen} activeOpen={activeOpen} setNormalCashBoxInfo={setNormalCashBoxInfo} />,
      // UPI: <Button onClick={() => cardPayment('UPI (INR)',paymentId)}>{paymentName ? paymentName : type}</Button>,
      UPI:<Card style={{ overflow: 'hidden' }} onClick={() => cardPayment('UPI (INR)', paymentId)} Tdata={Tdata} total={total} paymentName={paymentName ? paymentName : type} type={type} referenceNo={referenceNo} setReferenceNo={setReferenceNo} chequeInfo={chequeInfo} setChequeInfo={setChequeInfo} paymentId={paymentId} isOpen={isOpen} setOpen={setOpen} setActiveOpen={setActiveOpen} activeOpen={activeOpen} setNormalCashBoxInfo={setNormalCashBoxInfo}/>,

      // Card: (
      //   <Card
      //     onClick={() => cardPayment('Card (INR)', paymentId)}
      //     Tdata={Tdata}
      //     total={total}
      //     paymentName={paymentName ? paymentName : type}
      //   />
      // ),
      // UPI: (
      //   <Button onClick={() => cardPayment('UPI (INR)', paymentId)}>
      //     {paymentName ? paymentName : type}
      //   </Button>
      // ),
      // 'NEFT / RTGS / IMPS': (
      //   <Button onClick={() => cardPayment(`${type} (INR)`, paymentId)}>
      //     {paymentName ? paymentName : type}
      //   </Button>
      // ),
      'NEFT / RTGS / IMPS': <Card onClick={() => cardPayment('NEFT / RTGS / IMPS (INR)', paymentId)} Tdata={Tdata} total={total} paymentName={paymentName ? paymentName : type} type={type} referenceNo={referenceNo} setReferenceNo={setReferenceNo} chequeInfo={chequeInfo} setChequeInfo={setChequeInfo} paymentId={paymentId} isOpen={isOpen} setOpen={setOpen} setActiveOpen={setActiveOpen} activeOpen={activeOpen} />,
      'Net Banking':   
      ( 
          <Button
        onClick={() => cardPayment(`${type} (INR)`, paymentId)}
        variant='outlined'
        // sx={{height:'50px',borderRadius:'8px',width:'90px'}}
       >
          <Typography
          sx={{
          fontSize: 10,
          fontWeight: 600,
          
          // cursor: "pointer"
        }}>{paymentName ? paymentName : type}</Typography>
        </Button>
        
      ),
  EMI: ( 
    <Button onClick={() => cardPayment(`${type} (INR)`, paymentId)}
    variant='outlined'
    // sx={{height:'50px',borderRadius:'8px',width:'90px'}}
  >
      <Typography
          sx={{
          fontSize: 10,
          fontWeight: 600,
          // cursor: "pointer"
        }}>{paymentName ? paymentName : type}</Typography>
      
    </Button>
    
  ),
    };
return createModes[type];
  };


  const handleClose = (e) => {
    if (wrapperRef.current && wrapperRef.current.contains(e.target)) {
      setActiveOpen(-1)
    }
  }

return (
  <div ref={wrapperRef} onClick={(e) => handleClose(e)}>
    {/* <Stack direction='row' gap='1' display='flex' pb='10px'>
      {
        pModes.length > 0 ? (
          <Box
            display='flex'
            flexDirection='row'
            sx={{}} >
            {pModes.map((item, key) => (
              <Box
                key={key}
                display='flex'
                justifyContent='center'
                sx={{
                  p: '3px 0px',
                  border: '1px solid black',
                  width: '100%',
                  borderRadius: 1,
                  mr: '3px'
                }}>
                {getModes(item.payment_type, item.paymentName, item.paymentId)}
              </Box>
            ))}
          </Box>
        ) : (
          [
            'Cheque',
            'Cash',
            'Card',
            'UPI',
            'NEFT / RTGS / IMPS',
            'Net Banking',
            'EMI',
          ].map((d) => getModes(d))
        )
      }
    </Stack> */}
    <Grid container display='flex' flexDirection='row' spacing={1}    disabled={invoiceselect === false ? true : false}
    >
  
    {
    pModes.length > 0 ? (
      <>
      {pModes.map((item, key) => (
        <Grid
          // lg={2} xs={3} md={3} sm={3}
          key={key}
          // className={classes.item}
          sx={{}}
          display='flex'
          justifyContent='center'>
           { getModes(item.payment_type, item.paymentName, item.paymentId, item?.denomination)}
           
          </Grid>
        ))}
      </>
    ) :(
      [
        
        'Cash'
      ].map((d) => getModes(d))
    )
  }
  
    </Grid>
    {/* <AppScrollbar> */}
    {/* <ButtonGroup
      sx={{ mb: 2,width:'auto' }}  
      Width="auto"  
      variant='outlined'
      aria-label='outlined button group'
      disabled={invoiceselect === false ? true : false}
    >

      {pModes.length > 0 ? (

        <>
          {pModes.map((d) =>
            getModes(d.payment_type, d.paymentName, d.paymentId),
          )}
        </>
      ) : (
        [
          'Cheque',
          'Cash',
          'Card',
          'UPI',
          'NEFT / RTGS / IMPS',
          'Net Banking',
          'EMI',
        ].map((d) => getModes(d))
      )}

    </ButtonGroup>

    </AppScrollbar>  */}
    {/* {visible === true && pModes.length ? (

      <>
       {value}
      </>
    ) : (
      ""
    )} */}
    <Table
      setCurrrentTarget={setCurrrentTarget}
      currentTarget={currentTarget}
      setEntered={setEntered}
      setIndex={setIndex}
      Tdata={salesApprovals?.length > 0 && receivableData ? tempData  : Tdata}
      setTdata={setTdata}
      index={index}
      total={total}
      openDenominationDialog={openDenominationDialog}
      setOpenDenominationDialog={setOpenDenominationDialog}
      setStateCashBoxInfo={setNormalCashBoxInfo}
      posId={posId}
      normalCashBoxInfo={normalCashBoxInfo}
      referenceNo={referenceNo}
      setReferenceNo={setReferenceNo}
      chequeInfo={chequeInfo}
      setChequeInfo={setChequeInfo}
      cashOutIn_denomination={cashOutIn_denomination}
      responseType={responseType}
      getCashBoxId={getCashBoxId}
      getCashBoxLedgerId={getCashBoxLedgerId}
      defaultcash = {defaultcash}
      postype = {pageType}
      denominationtable = {denominationtable}
    />
  </div>
);
};

export default NewPayment;
