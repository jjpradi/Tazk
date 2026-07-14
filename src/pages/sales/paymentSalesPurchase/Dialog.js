import * as React from 'react';
import Dialog from '@mui/material/Dialog';
// import PaymentPage from './index';
import {makeStyles} from 'tss-react/mui';
import { getsessionStorage } from 'pages/common/login/cookies';
import { approvalUserRightsAction, salesApprovalsAction } from 'redux/actions/sales_actions';
import { useDispatch, useSelector } from 'react-redux';
import PaymentPage from '../paymentSalesPurchase/receiptpayment';


export default function AlertDialog({
  custType,
  paymentOpen,
  setpaymentOpen,
  setTdata,
  Tdata,
  custData,
  sales_items,
  handleSubmit,
  received_amount,
  setReceived_amount,
  status,
  getPay,
  selectionModel,
  setSelectionModel,
  entryvalue,
  handleEntry ,
  activeINV,
  mail_configuration,
  responseType,
  receivables,
  poNum,
  manualNoteSchemes,
  setManualNoteSchemes,
  addAdvanceAmount={current:null},
  rowData,
  type,
  pageType,
  setPayData,
  setgetPay,
  AdvanceSubmit,
  editData,
  setstatus,
  setGetCustomer,
  setSalesItems,
  clickedInvoice,
  setAdvanceAmount,
  disableSubmit
}) {

    const storage = getsessionStorage()
    const dispatch =  useDispatch()
  

  const handleClose = async() => {
    setpaymentOpen(false);
    // setPayData([])
    // setgetPay([])
    setTdata([])
    // setManualNoteSchemes([])
    setSelectionModel([])
  };

     const {
        salesReducer : {getApprovalRights}
  
    } = useSelector((state) => state);
  console.log(rowData,'asd7777')
  React.useEffect(()=>{ (async () => {
    if(getApprovalRights?.rights !== true && rowData && storage?.company_type === 3){
      const payload = {
        type : 'Approved',
        customer_id : rowData?.customer_id
      }
      const payload1 = {
        type : 'PaymentApproval'
       }
      await dispatch(salesApprovalsAction(payload))
      await dispatch(approvalUserRightsAction(payload1))
    }
})();
},[dispatch,rowData])



  return (
    <div>
      <Dialog
        open={paymentOpen}
        // onClose={handleClose}
        // aria-labelledby='alert-dialog-title'
        // aria-describedby='alert-dialog-description'
        fullWidth
  maxWidth="md"
        sx={{
          "& .MuiDialog-container": {
            "& .MuiPaper-root": {
              // width: "100%",
              // maxWidth: "1500px",
            },
          },
        }}      >
        <PaymentPage
          selectionModel={selectionModel}
          setSelectionModel={setSelectionModel}
          getPay={getPay}
          setgetPay={setgetPay}
          setPayData={setPayData}
          entryvalue = {entryvalue}
          handleEntry = {handleEntry}
          status={status}
          received_amount={received_amount}
          handleSubmit={handleSubmit}
          custType={custType}
          handleClose={handleClose}
          setTdata={setTdata}
          Tdata={Tdata}
          custData={custData}
          sales_items={sales_items}
          activeINV={activeINV}
          mail_configuration={mail_configuration}
          responseType={responseType}
          manualNoteSchemes={manualNoteSchemes}
          setManualNoteSchemes={setManualNoteSchemes}
          addAdvanceAmount={addAdvanceAmount}
          poNum={poNum}
          rowData = {[rowData]}
          receivables= {receivables}
          type={type}
          pageType={pageType}
          setReceived_amount={setReceived_amount}
          AdvanceSubmit={AdvanceSubmit}
          editData={editData}
          setstatus={setstatus}
          setGetCustomer={setGetCustomer}
          setSalesItems={setSalesItems}
          clickedInvoice={clickedInvoice}
          setAdvanceAmount={setAdvanceAmount}
          disableSubmit={disableSubmit}
        />
      </Dialog>
    </div>
  );
}
