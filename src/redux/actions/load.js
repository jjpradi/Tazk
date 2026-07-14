import {OpenalertActions} from '../actions/alert_actions';
// import axios from 'axios';
import {
  Create_label,
  Approve_lable,
  Reject_lable,
  Update_label,
  Delete_label,
  Exist_label,
  LotExistAlert_label,
  mail_send,
  cannot_delete_label,
  Cancel_label,
  Test_label,
  mail_not_sent,
  Not_available,
  Po_EXIST,
  Loan_Label,
  Claim_Label,
  Config_mail_send,
  Manual_CheckIn,
  Manual_CheckOut,
  Manual_breakStart,
  Manual_breakEnd,
  Manual_correction,
  Leave_permission,
  No_Leave_Type,
  Otp_sent,
  Verify_otp,
  password_update,
  frontDesk_create,
  Invalid_otp,
  email_exceed,
  completeSprintAlert,
  createSprintAlert,
  deleteSprintAlert,
  updateSprintAlert,
  userName_exists,
  frontDesk_update,
  invalidFileFormat,
  incentiveCreate,
  incentiveDelete,
  incentiveUpdate,
  lotNumber_exists,
  invalid_prefix,
  invalid_employeeId,
  employeeId_exists,
  requiredFieldsAlertMessage,
  matchedTransactions,
  reconciliatedLabel,
  sales_product_create,
  linkEstablishedMessage,
  unlinkMessage,
  receiptSentForApproval,
  Exist_paymentName_label,
  ReplacementMessage,
  notificationCleared,
  category_exists,
  designation_exists,
  location_exists,
  departmentName_exists,
  userRoleName_exists,
  tax_category_check,
  set_up_mail,
  ledger_used,
  outstandingReport
} from '../../utils/content';
import { OPEN_ALERT } from 'redux/actionTypes';
import { da } from 'date-fns/locale';

export const ListLoad =  (setModalTypeHandler, setLoaderStatusHandler) => {
  if (setModalTypeHandler && setLoaderStatusHandler) {
     setLoaderStatusHandler(true);
  }
};

export const FailLoad = async (
  setModalTypeHandler,
  setLoaderStatusHandler,
  setModalStatusHandler,
) => {
  if (setModalTypeHandler && setLoaderStatusHandler) {
    setLoaderStatusHandler(false);
  }
  if (setModalStatusHandler) {
    setModalStatusHandler(false);
  }
};

export const UpdateAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: Update_label, severity: 'success'}));
  }
};

export const NotificationClearAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: notificationCleared, severity: 'success'}));
  }
};

export const CheckInAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: Manual_CheckIn, severity: 'success'}));
  }
};

export const CheckOutAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: Manual_CheckOut, severity: 'success'}));
  }
};

export const ManualCorrectionAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: Manual_correction, severity: 'success'}));
  }
};

export const CreateAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: Create_label, severity: 'success'}));
  }
};

export const ReconciliatedAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: reconciliatedLabel, severity: 'success'}));
  }
};

export const matchedTransactionAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: matchedTransactions, severity: 'success'}));
  }
};

export const productCreateSalesAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: sales_product_create, severity: 'success'}));
  }
};

export const BreakStartAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: Manual_breakStart, severity: 'success'}));
  }
};
export const BreakEndAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: Manual_breakEnd, severity: 'success'}));
  }
};
export const RequestAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: Loan_Label, severity: 'success'}));
  }
};

export const RequestClaimAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: Claim_Label, severity: 'success'}));
  }
};

export const ApproveAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: Approve_lable, severity: 'success'}));
  }
};

export const RejectAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: Reject_lable, severity: 'success'}));
  }
};

export const ExistAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: Exist_label, severity: 'error'}));
  }
};

export const ExistPaymentNameAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: Exist_paymentName_label, severity: 'error'}));
  }
};

export const NotAvailableAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: Not_available, severity: 'error'}));
  }
};

export const taxCategoryCheck = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: tax_category_check, severity: 'error'}));
  }
};

export const ErrormsgAlert = async (dispatch,msg) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: msg, severity: 'error'}));
  }
};


export const IrisAlert = async (dispatch, message) => {
  console.log('messagee', message)
  if (dispatch) {
    dispatch(OpenalertActions({msg: message, severity: 'error'}));
  }
};

export const commontoast = async(dispatch, message) => {
  console.log('messagee', message)
  if (dispatch) {
    dispatch(OpenalertActions({msg: message, severity: 'warning'}));
  }
};

export const posequenceExist= async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: Po_EXIST, severity: 'error'}));
  }
};

export const LotExistAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: LotExistAlert_label, severity: 'error'}));
  }
};

export const DeleteAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: Delete_label, severity: 'success'}));
  }
};

export const LeaveAndPermissionAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({ msg: Leave_permission, severity: 'success' }));
  }
};

export const LeaveTypeAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({ msg: No_Leave_Type, severity: 'error' }));
  }
};

export const ErrorAlert = async (dispatch, err) => {
  if(err.response === undefined){
    if (dispatch) {
      dispatch(OpenalertActions({msg: err.message, severity: 'error'}));
    }
  }
  if(err.response && err.response.data.message !== 'token_expired'){
    if (dispatch) {
      dispatch(OpenalertActions({msg: err.response.data.message || err.message, severity: 'error'}));
    }
  }
};

export const leaveRequestAlert = async(dispatch, err) =>{
  if (dispatch) {
    dispatch(OpenalertActions({msg: err, severity: 'error'}));
  }
}

export const detailUpdateAlert = async(dispatch, err) =>{
  if (dispatch) {
    dispatch(OpenalertActions({msg: err, severity: 'error'}));
  }
}

export const Password = async (dispatch) => {
if(dispatch){
  dispatch(OpenalertActions({msg: 'Enter Valid Current Password', severity: 'error'}));
}
}
export const Passwordsuccess = async (dispatch) => {
  if(dispatch){
    dispatch(OpenalertActions({msg: 'Password Change Successfully', severity: 'success'}));
  }
  }

  export const Canceldiscount = async (dispatch) => {
    if(dispatch){
      dispatch(OpenalertActions({msg: 'Cancel Discount Request', severity: 'warning'}));
    }
    }

    export const CannotEdit = async (dispatch) => {
      if(dispatch){
        dispatch(OpenalertActions({msg: `Today date Can't Edit`, severity: 'warning'}));
      }
      }
  

    export const DiscountRes = async (dispatch) => {
      if(dispatch){
        dispatch(OpenalertActions({msg: 'Discount Request Send Successfully', severity: 'success'}));
      }
      }

  export const deRegister = async (dispatch) => {
    if(dispatch){
      dispatch(OpenalertActions({msg: 'Deregistered Successfully', severity: 'success'}));
    }
    }

export const ProductUpdate = async (dispatch) => {
    if(dispatch){
      dispatch(OpenalertActions({msg: 'Already this product used cannot be update some field or delete', severity: 'warning'}));
    }
    }

export const SalaryProcessAlert = async(dispatch, data)=>{
  if(dispatch){
    dispatch(OpenalertActions({msg: data, severity: 'warning'}));
  }
}

export const successmsg = async (sample) => {
  if (sample) {
    sample(false);
  }
};

export const locationexists = async(dispatch,msg) =>{
  if(dispatch){
    dispatch(OpenalertActions({msg: msg, severity: 'warning'}));
  }
}

export const departmentExists = async(dispatch,msg) =>{
  if(dispatch){
    dispatch(OpenalertActions({msg: msg, severity: 'warning'}));
  }
}

export const stockTransferWarning = async(dispatch,msg) =>{
  if(dispatch){
    dispatch(OpenalertActions({msg: msg, severity: 'warning'}));
  }
}

export const cashboxNotExists = async(dispatch,msg) =>{
  if(dispatch){
    dispatch(OpenalertActions({msg: msg, severity: 'warning'}));
  }
}
export const approverVerifierError = async(dispatch,msg) =>{
  if(dispatch){
    dispatch(OpenalertActions({msg: msg, severity: 'warning'}));
  }
}

export const errormsg = async (sample) => {
  if (sample) {
    sample(true);
  }
};

export const ProductDeleteAlert = async (dispatch, msg) => {
  if (dispatch) {
    await dispatch(OpenalertActions({msg, severity: 'warning'}));
  }
};

export const MailAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: mail_send, severity: 'success'}));
  }
};

export const OutStandingReportAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: outstandingReport, severity: 'success'}));
  }
};

export const FailedMailAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: Config_mail_send, severity: 'warning'}));
  }
};

export const mailNotSentAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: mail_not_sent, severity: 'error'}));
  }
};
export const setupMailConfigAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: set_up_mail, severity: 'error'}));
  }
};

export const CancelAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: Cancel_label, severity: 'success'}));
  }
}
export const CannotDeleteAlert = async (dispatch, res) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: res.message, severity: 'warning'}));
  }
};

export const StockReconcilateMatchedAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(
      OpenalertActions({msg: 'Matched', severity: 'success'}),
    );
  }
};

export const StockReconcilateMismatchedAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(
      OpenalertActions({msg: 'Mismatched', severity: 'warning'}),
    );
  }
};
export const inValidFileAlert = async (dispatch, res) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: res.message, severity: 'warning'}));
  }
};

export const commonAlert = async (dispatch, message) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: message, severity: 'warning'}));
  }
};

export const testAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: Test_label, severity: 'success'}));
  }
};

export const stockReconciliateUpdateAlert = async (dispatch, msg) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: msg, severity: 'success'}));
  }
};

export const stockReconciliateErrAlert = async (dispatch, msg) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: msg, severity: 'error'}));
  }
};

export const errorAlertAction = (data) => {
  return {
    type:OPEN_ALERT,
    payload:data
  }
};

export const processSalaryUpdateAlert = async (dispatch, msg) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: msg, severity: 'success'}));
  }
};

export const createSalaryUpdateAlert = async (dispatch, msg) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: msg, severity: 'warning'}));
  }
};

export const errorSalaryUpdateAlert = async (dispatch, msg) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: msg, severity: 'error'}));
  }
};

export const AssignedAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: Update_label, severity: 'success'}));
  }
};

export const alreadyExists = async(dispatch,msg) =>{
  if(dispatch){
    dispatch(OpenalertActions({msg: msg, severity: 'info'}));
  }
}

export const maxNumberAlert = async(dispatch,msg) =>{
  if(dispatch){
    dispatch(OpenalertActions({msg: msg, severity: 'error'}));
  }
}

export const enableEmpAlert = async(dispatch,msg) =>{
  if(dispatch){
    dispatch(OpenalertActions({msg: msg, severity: 'success'}));
  }
}

export const otpSentAlert = async (dispatch, msg) => {
  if (dispatch) {
    dispatch(OpenalertActions({ msg: Otp_sent, severity: 'success' }));
  }
}

export const emailExceedAlert = async (dispatch, msg) => {
  if (dispatch) {
    dispatch(OpenalertActions({ msg: email_exceed, severity: 'error' }));
  }
}

export const verifyOtpAlert = async (dispatch, msg) => {
  if (dispatch) {
    dispatch(OpenalertActions({ msg: Verify_otp, severity: 'success' }));
  }
}

export const invalidOtpAlert = async (dispatch, msg) => {
  if (dispatch) {
    dispatch(OpenalertActions({ msg: Invalid_otp, severity: 'error' }));
  }
}

export const passwordUpdateAlert = async (dispatch, msg) => {
  if (dispatch) {
    dispatch(OpenalertActions({ msg: password_update, severity: 'success' }));
  }
}

export const frontDeskCreateAlert = async (dispatch, msg) => {
  if (dispatch) {
    dispatch(OpenalertActions({ msg: frontDesk_create, severity: 'success' }));
  }
}

export const frontDeskUpdateAlert = async (dispatch, msg) => {
  if (dispatch) {
    dispatch(OpenalertActions({ msg: frontDesk_update, severity: 'success' }));
  }
}

export const userNameExistAlert = async (dispatch, msg) => {
  if (dispatch) {
    dispatch(OpenalertActions({ msg: userName_exists, severity: 'warning' }));
  }
}

export const salaryAllowanceDeductionAlert = async (dispatch, msg) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: msg, severity: 'warning'}));
  }
};

export const createSprint = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({ msg: createSprintAlert, severity: 'success' }));
  }
};

export const updateSprint = async (dispatch, data) => {
  let msg = data?.message || updateSprintAlert;
  let color = data?.severity || 'success';
  if (dispatch) {
    dispatch(OpenalertActions({ msg: msg, severity: color }));
  }
};

export const completeSprint = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({ msg: completeSprintAlert, severity: 'success' }));
  }
};

export const deleteSprint = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({ msg: deleteSprintAlert, severity: 'success' }));
  }
};

export const InvalidFileUploadError = async(dispatch) => {
  if(dispatch) {
    dispatch(OpenalertActions({ msg : invalidFileFormat, severity : 'warning' }))
  }
}

export const incentiveCreateAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({ msg: incentiveCreate, severity: 'success' }))
  }
}

export const incentiveDeleteAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({ msg: incentiveDelete, severity: 'success' }))
  }
}

export const incentiveUpdateAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({ msg: incentiveUpdate, severity: 'success' }))
  }
}

export const alreadyExistAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: lotNumber_exists, severity: 'error'}));
  }
};

export const invalidPrefixAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({ msg: invalid_prefix, severity: 'error' }));
  }
};

export const employeeCodeAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({ msg: invalid_employeeId, severity: 'error' }));
  }
};

export const employeeCodeExists = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({ msg: employeeId_exists, severity: 'error' }));
  }
};

export const categoryExists = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({ msg: category_exists, severity: 'error' }));
  }
};

export const designationExists = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({ msg: designation_exists, severity: 'error' }));
  }
};

export const locationExists = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({ msg: location_exists, severity: 'error' }));
  }
};

export const departmentNameExists = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({ msg: departmentName_exists, severity: 'error' }));
  }
};

export const userRoleNameExists = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({ msg: userRoleName_exists, severity: 'error' }));
  }
};

export const requiredFieldsAlert = async(dispatch) => {
  if(dispatch){
    dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
  }
}

export const advanceAlert = async(dispatch, msgs) => {
  if(dispatch){
    dispatch(OpenalertActions({ msg: msgs, severity: 'warning' }))
  }
}

export const linkEstablished = async(dispatch) => {
  if(dispatch){
    dispatch(OpenalertActions({ msg: linkEstablishedMessage, severity: 'success' }))
  }
}

export const unlinkedSuccess = async(dispatch) => {
  if(dispatch){
    dispatch(OpenalertActions({ msg: unlinkMessage, severity: 'success' }))
  }
}

export const ReceiptApprovalRequestAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: receiptSentForApproval, severity: 'success'}));
  }
};

export const ReleiveAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: 'Salary not processed for this employee after process the employee will delete.', severity: 'success'}));
  }
}

export const ReplacementAlert = async (dispatch) => {
  if (dispatch) {
    dispatch(OpenalertActions({msg: ReplacementMessage, severity: 'success'}));
  }
}

export const CreditDebitNoteConvertAlert = async (dispatch, tabValue) => {
  if (dispatch) {
    dispatch(OpenalertActions({ msg: `${tabValue === 1 ? 'Credit Note' : 'Debit Note'} created successfully`, severity: 'success' }))
  }
}

export const CompanyStateAlert = async(dispatch) => {
  if(dispatch){
    dispatch(OpenalertActions({msg: 'Company state not found!', severity: 'error'}))
  }
}

export const CompanyPincodeAlert = async(dispatch) => {
  if(dispatch){
    dispatch(OpenalertActions({msg: 'Company pincode not found!', severity: 'error'}))
  }
}

export const CustomerAddressAlert = async(dispatch) => {
  if(dispatch){
    dispatch(OpenalertActions({msg: 'Customer address not found!', severity: 'error'}))
  }
}

export const CustomerStateAlert = async(dispatch) => {
  if(dispatch){
    dispatch(OpenalertActions({msg: 'Customer state not found!', severity: 'error'}))
  }
}

export const LedgerUsedAlert = async(dispatch) => {
  if(dispatch){
    dispatch(OpenalertActions({msg: ledger_used, severity: 'error'}))
  }
}

export const companyOtpAlert = async(dispatch) => {
  if(dispatch){
    dispatch(OpenalertActions({msg: 'OTP sent to company mail', severity: 'success'}))
  }
}

export const templateNameExists = async(dispatch) => {
  if(dispatch){
    dispatch(OpenalertActions({msg: 'Template Name already exists!', severity: 'error'}))
  }
}

export const structureNameExists = async(dispatch) => {
  if(dispatch){
    dispatch(OpenalertActions({msg: 'Structure Name already exists!', severity: 'error'}))
  }
}