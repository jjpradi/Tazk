function notificationType(type) {
  switch (type) {
    case 'sales order':
      return 'sales_order_notification';
    case 'sales invoice':
      return 'sales_invoice_notification';
    case 'sales payment':
      return 'sales_order_payment_notification';
    case 'purchase order':
      return 'purchase_order_notification';
    case 'purchase payment':
      return 'purchase_order_payment_notification';
    case 'session started':
      return 'pos_session_start_notification';
    case 'session closed':
      return 'pos_session_close_notification';
    case 'login':
      return 'login_notification';
    case 'product received':
      return 'product_received_notification';
    case 'Point of sales':
      return 'Point_of_sales_notification';
    case 'Payin':
      return 'Payin_notification';
    case 'Payout':
      return 'Payout_notification';
    case 'Contra':
      return 'Contra_notification';
    case 'Stock Transfer':
      return 'Stock_Transfer_notification';
    case 'Daily Report':
      return 'Daily_Report_notification';
    case 'Leave Approval':
      return 'Leave_Approval_notification';
    case 'Leave Rejection':
      return 'Leave_Rejection_notification';
    case 'Loan Rejection':
      return 'Loan_Rejection_notification';
   case 'Loan Approval':
        return 'Loan_Approval_notification';
   case 'Leave Request':
        return 'Leave_Request_notification';
   case 'Permission Request':
        return 'Permission_Request_notification';
   case 'Permission Approval':
        return 'Permission_approval_notification';
   case 'Permission Rejection':
        return 'Permission_rejection_notification';
   case 'Loan Request':
        return 'Loan_Request_notification';
   case 'Attendance Correction Request':
      return 'Attendance_Correction_Request_notification';
   case 'Attendance Approval':
        return 'Attendance_Approval_notification';
   case 'Attendance Correction Rejection':
      return 'Attendance_Correction_Rejection_notification';
   case 'Sale Approval Accepted':
        return 'Sale_Approval_Accepted';
   case 'Sale Approval Rejected':
        return 'Sale_Approval_Rejected';
   case 'Event Notification':
        return 'Event_notification';
    default:
      return 'notification';
  }
}

export default notificationType;
