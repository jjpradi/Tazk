import {
  CREATE_SALES,
  LIST_SALES,
  GET_ID_SALES,
  EDIT_SALES,
  DELETE_SALES,
  SALES_TABLE_DATA,
  RECEIVED_SALES,
  RECEIVED_SALES_PENDING,
  RECEIVED_EDIT_SALES,
  LIST_PRODUCT,
  LIST_OUTSTANDING_SALES,
  LIST_SALES_DATE_FILTER,
  LIST_AVERAGE_DEBITOR,
  DAY_SALES,
  CONSOLIDATED_SALES,
  ERP_SALE_DETAILS,
  CREDIT_DEBIT_SEQ,
  SALES_DAILY_REPORT,
  LIST_DAILY_REPORT_DATA,
  LIST_ALL_FILTER_DATA,
  SALESREPORT_BY_PAGINATION,
  TOTAL_SALESREPORT_COUNT,
  SALES_RECEIVABLE_REPORT,
  TOTAL_RECEIVABLE_REPORT_COUNT,
  SALESREPORT_BY_GETALL,
  STOCKGROUP_BY_GETALL,
  GET_SALES_STATUS_LIST,
  SET_SEARCH_SALES,
  GET_SEARCH_SALES,
  LIST_SALES_PAGINATION,
  SET_SEARCH_OUTSTAND,
  GET_SEARCH_OUTSTAND,
  SET_SEARCH_CONSOLIDATED,
  GET_SEARCH_CONSOLIDATED,
  GET_SEARCH_SALES_REPORT,
  SET_SEARCH_SALES_REPORT,
  GET_SEARCH_RECEIVABLE_REPORT,
  SET_SEARCH_RECEIVABLE_REPORT,
  GET_SEARCH_RECEIVABLE_SEARCH,
  GET_ADMIN_ID,
  SET_COMPLETED_RECEIVED_SALES,
  SALES_ID_GET,
  SALES_ADVANCE_ENTRY,
  SET_SEARCH_SALES_REPORT_NORMAL,
  COLLECTIONS_UPDATE,
  COLLECTIONS_REPORTS,
  COLLECTIONS_REPORTS_NON,
  COLLECTIONREPORTBASEDEMP,
  PAYMENT_COLLECTION_REPORT,
  SET_PAYMENT_COLLECTION_REPORT,
  GET_PAYMENT_COLLECTION_REPORT,
  GET_ALL_SALESMAN_LIST,
  PAYMENT_COLLECTION_FILTER,
  GET_COMPLETED_RECEIVED_SALES,
  CREATE_INCENTIVE_FOR_SALESMAN,
  GET_ALL_SALESMAN_INCENTIVE,
  DELETE_SALESMAN_INCENTIVE,
  UPADTE_SALESMAN_INCENTIVE,
  SET_SEARCH_SALESMAN_INCENTIVE,
  GET_SEARCH_SALESMAN_INCENTIVE,
  SET_PROFIT_WISE_REPORT,
  GET_DAY_BOOK,
  SET_DAY_BOOK,
  SET_STOCK_GROUP_SUMMARY,
  GET_STOCK_GROUP_SUMMARY,
  TRIAL_BALANCE_REPORT,
  GET_PROFIT_WISE_REPORT,
  PAYMENT_REPORT_BASED_EMP_VERIFY,
  GET_EXPIRY_DATE_REPORT,
  SET_EXPIRY_DATE_REPORT,
  INCOME_BASED_ON_CUSTOMER,
  SALE_ORDER_DELIVERY_CHALLAN_BY_CUSTOMER,
  SALES_APPROVALS,
  SALES_APPROVALS_BY_ID,
  REJECT_SALES_APPROVALS,
  SALESMAN_LIST,
  APPROVAL_USER_RIGHTS,
  PAYMENT_COLLECTION_APPROVE,
  SALES_GET_ID,
  SCHEDULE_REPORT,
  GET_ALL_RECEIPTS,
  GET_RECEIPTS_BY_ID,
  LIST_SALES_DATA,
  LOT_DETAILS,
  GET_ALL_PRODUCT_SALES_HISTORY,
  SHARE_REPORT,
  LIST_SALE_ORDER_PAGINATION,
  SET_SEARCH_SALE_ORDER,
  GET_SEARCH_SALE_ORDER,
  CUSTOMER_SALESMAN,
  TRIGGER_SALES_MODAL,
  TRIGGER_DC_MODAL,
  RESET_INCOME_BASED_ON_CUSTOMER,
  RESET_SALE_ORDER_DELIVERY_CHALLAN_BY_CUSTOMER,
  RESET_LIST_SALES_PAGINATION,
  RESET_LIST_SALE_ORDER_PAGINATION,
  EDIT_SALES_ORDER,
  RECEIPT_EDIT_DATA,
  RECEIPT_TIMELINE,
  RESET_LIST_DC_PAGINATION,
  LIST_DC_PAGINATION,
  SET_SEARCH_DC,
  GET_SEARCH_DC,
  THERMAL_PRINTER,
  GET_DAY_BOOK_CONSOLIDATE,
  RECEIPT_BY_CHEQUE,
  CHEQUE_ALREADY_EXIST,
  SALES_SUMMARY,
  GET_PURCHASE_SUMMARY,
  GET_SALES_SUMMARY,
  GET_BILLING_COMPANY,
  INDIVIDUAL_PAYMENT_DETAILS,
  SALES_REFUND_ENTRY,
  SALES_REFUND_ENTRY_EDIT

} from '../actionTypes';
import Salesservice from '../../services/sales_services';
import DB from '../../db';
import {
  CreateAlert,
  ErrorAlert,
  FailLoad,
  ListLoad,
  UpdateAlert,
  successmsg,
  errormsg,
  DeleteAlert,
  MailAlert,
  NotAvailableAlert,
  ProductDeleteAlert,
  Canceldiscount,
  DiscountRes,
  IrisAlert,
  incentiveCreateAlert,
  incentiveDeleteAlert,
  incentiveUpdateAlert,
  ApproveAlert,
  ReconciliatedAlert,
  advanceAlert,
  ReceiptApprovalRequestAlert,
  taxCategoryCheck,
  CompanyStateAlert,
  CompanyPincodeAlert,
  CustomerAddressAlert,
  CustomerStateAlert,
} from './load';
import {deleteAction} from './actions';
import Productservice from '../../services/product_services';
import { updateProductDataAction } from './product_actions';
// import { rearg } from 'lodash';
// import BarcodeDialog from '../../pages/sales/barcodeDialog'

var db = new DB('pos_session');

export const createSalesAction =
  (
    data,
    employee_id,
    headerLocationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
    sample,
    setDisable,
    activePosLocationId,
    response
  ) =>
  async (dispatch) => {
    // createAction(Salesservice, CREATE_SALES, dispatch, data,  null, null, setModalTypeHandler, setLoaderStatusHandler, sample)
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Salesservice.create(
        data,
        employee_id,
        headerLocationId,
      );
      console.log(res,'resddddgd');
      
      // const pro_res =
      //   activePosLocationId && activePosLocationId !== null
      //     ? await Productservice.getLocationById(activePosLocationId)
      //     : await Productservice.getAll();
      if (setDisable) {
        setDisable(false);
      }
      //bracode Error throwing
      if (res.status === 201) {
        setLoaderStatusHandler(false);
        sample('barCodeError', res.data.BarcodeRes);
      } else {
        // Pouch DB
        // await db.createProducts(pro_res.data);
        // dispatch({
        //   type: LIST_PRODUCT,
        //   payload: pro_res.data,
        // });
        // if (res.data.affectedRows === 1) {
        
        CreateAlert(dispatch);
        dispatch({
          type: CREATE_SALES,
          payload: res.data.data,
        });
        // const item_id = data.sales_items.map(i => i.item_id)
        // dispatch(updateProductDataAction({item_id}))
        successmsg(sample);
        if(response){
          response(res)
        }
        
        // }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      // return Promise.resolve(res.data.data);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      setLoaderStatusHandler(false)
      
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if(err.response.data.status === 'LOT_UNAVAILABLE'){
        NotAvailableAlert(dispatch, err)
      }else if(err.response.data.status ==='IRIS'){
        IrisAlert(dispatch,err.response.data.message )
      }else if(err.response.data.status ==='INVOICE_EXIST'){
        if(response){
          response(err)
        }
        IrisAlert(dispatch,err.response.data.message )
      }
      else if(err.response.data.status === 'Tax_UNAVAILABLE') {
        taxCategoryCheck(dispatch, err)
      }
      else if (
        err?.response?.data.message.includes('Company state not found') ||
        err?.response?.data.stack.includes('Company state not found')
      ) {
        CompanyStateAlert(dispatch); // <-- your custom alert
      }
      else if (
        err?.response?.data.message.includes('Company pincode not found') ||
        err?.response?.data.stack.includes('Company pincode not found')
      ) {
        CompanyPincodeAlert(dispatch); // <-- your custom alert
      }
      else if (
        err?.response?.data.message.includes('Customer address not found') ||
        err?.response?.data.stack.includes('Customer address not found')
      ) {
        CustomerAddressAlert(dispatch); // <-- your custom alert
      }
      else if (
        err?.response?.data.message.includes('Customer state not found') ||
        err?.response?.data.stack.includes('Customer state not found')
      ) {
        CustomerStateAlert(dispatch); // <-- your custom alert
      }
      else{
        ErrorAlert(dispatch, err);
      }
      errormsg(sample);
      if (setDisable) {
        setDisable(false);
      }
      //return Promise.reject(err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
    };
  
    export const set_searchReceivableAction = (data) => {
      return {
        type: RECEIVED_SALES,
        payload: data,
      };
    };
  
    export const searchReceivableAction = (
      val,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return {
        type: GET_SEARCH_RECEIVABLE_SEARCH,
        data: val,
        setModalTypeHandler,
        setLoaderStatusHandler,
      };
};
    
export const createSalesPaymentAction =
  (
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
    posId,
    dbSyncData,
    result,
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      await Salesservice.createPayment(data);
      // Pouch DB
      // CreateAlert(dispatch)
      // await db.deleteOfflineApi(posId, dbSyncData)
      if (result) {
        result(true);
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const salesGetById =
  (
    id,response
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Salesservice.salesgetbyid(id);
      // Pouch DB
      // CreateAlert(dispatch)
      // await db.deleteOfflineApi(posId, dbSyncData)
      console.log('resssss', res)
      if (res.status == 200) {
        if(response){
        response(res.data);
        }
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getLotDetailsAction =
  (
    data,response
  ) =>
  async (dispatch) => {
    try {
      const res = await Salesservice.getLotDetails(data);
      
      if (res.status == 200) {
          dispatch({
                type: LOT_DETAILS,
                payload: res.data,
              });
        if(response){
        response(res.data);
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const deleteReceipts =
  (
    data,type,response
  ) =>
  async (dispatch) => {
    try {
      const res = await Salesservice.deletereceipts(data, type);
      console.log('resssss', res)
      // if(res.status == 500){
      //    if(response){
      //   response(res.status);
      //   }
      //   advanceAlert(dispatch, 'Cant delete Advance Already Used')
      // }
      if (res.status == 200) {
        if(response){
        response(res.status);
        }
      }
      DeleteAlert(dispatch);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      const status = err?.response?.status;
      const apiResponse = err?.response.data.status
    if (status === 500 && apiResponse === "Advance") {
      if (response) response(status);
      advanceAlert(dispatch, err?.response.data.message);
    } else {
      ErrorAlert(dispatch, err);
    }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const listSalesAction =
  (
    employee_id,
    headerLocationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
    exportDataCallBack
  ) =>
  async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Salesservice.getAll(employee_id, headerLocationId);
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: LIST_SALES,
          payload: res.data,
        });
        if (exportDataCallBack) {
          exportDataCallBack(res.data);
        }
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (exportDataCallBack) {
        exportDataCallBack([]);
      }
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
      // }
    }
  };

export const getbyidSalesAction = (id) => async (dispatch) => {
  try {
    const res = await Salesservice.get(id);
    if (res.status === 200) {
      dispatch({
        type: GET_ID_SALES,
        payload: res.data,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const getSalesStatusListAction = () => async (dispatch) => {
  try {
    const res = await Salesservice.getSalesStatusList();
    dispatch({
      type: GET_SALES_STATUS_LIST,
      payload: res.data,
    });
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
  }
};

export const updateSalesOrderAction = (id, data, setModalTypeHandler, setLoaderStatusHandler, sample, employee_id, headerLocationId, response) => async (dispatch) => {
  try{
    const res = await Salesservice.updateSO(id, data, employee_id, headerLocationId)
    if(res.status === 200){
      UpdateAlert(dispatch)
      dispatch({
        type: EDIT_SALES_ORDER,
        payload: res.data
      })
      if(response) {
        response(res)
      }
      successmsg(sample)
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    errormsg(sample)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const updateSalesAction =
  (
    id,
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
    sample,
    employee_id,
    headerLocationId,
    response
  ) =>
  async (dispatch) => {
    try {
      const res = await Salesservice.update(
        id,
        data,
        employee_id,
        headerLocationId,
      );
      if (res.status === 201) {
        setLoaderStatusHandler(false);
        sample('barCodeError', res.data.BarcodeRes);
      } else {
        UpdateAlert(dispatch);
        dispatch({
          type: EDIT_SALES,
          payload: res.data.data,
        });
        if(response){
          response(res.status)
        }
        successmsg(sample);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      
      if(err.response.data.status === 'LOT_UNAVAILABLE'){
        NotAvailableAlert(dispatch, err)
      }else if(err.response.data.status ==='IRIS'){
        IrisAlert(dispatch,err.response.data.message )
      }else if(err.response.data.status ==='INVOICE_EXIST'){
        IrisAlert(dispatch,err.response.data.message )
      }else{
        ErrorAlert(dispatch, err);
      }
      errormsg(sample);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const CancelinvoiceSalesAction =
  (
    id,
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
    sample,
    response
  ) =>
  async (dispatch) => {
    // updateAction(Salesservice, EDIT_SALES, dispatch, id, data,setModalTypeHandler,setLoaderStatusHandler,sample)
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Salesservice.cancelinvoice(
        id,
        data
      );
      // const pro_res = await Productservice.getAll();

      //bracode Error throwing

      //console.log('actionres', res)
      if(res.status === 500){
        IrisAlert(dispatch, err.response.data.message )
      }
      if (res.status === 201) {
        setLoaderStatusHandler(false);
        sample('barCodeError', res.data.BarcodeRes);
      } else {
        // Pouch DB
        // await db.createProducts(pro_res.data);
        // const item_id = data.sales_items.map(i => i.item_id)
        // dispatch(updateProductDataAction({item_id}))
        // dispatch({
          //   type: LIST_PRODUCT,
          //   payload: pro_res.data,
          // });
          // if (res.data.changedRows === 1)
        UpdateAlert(dispatch);
        dispatch({
          type: EDIT_SALES,
          payload: res?.data,
        });
       
        if(response){
          // dispatch({
          //   type: LIST_SALES_PAGINATION,
          //   payload: res.data,
          // });
          response(res.status)
        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        successmsg(sample);
      }
      // return Promise.resolve(res.data.data);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if(err.response.data.status ==='IRIS'){
        IrisAlert(dispatch,err.response.data.message )
      }else{
        ErrorAlert(dispatch, err);
        errormsg(sample);
      }
      //return Promise.reject(err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const deleteSalesAction =
  (
    id,
    setModalTypeHandler,
    setLoaderStatusHandler,
    employee_id,
    headerLocationId,
    response
  ) =>
  async (dispatch) => {
    //  deleteAction(Salesservice, DELETE_SALES, dispatch, id,setModalTypeHandler,setLoaderStatusHandler,employee_id, headerLocationId)
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Salesservice.delete(id, employee_id, headerLocationId);
      // if (res.status === 200 && res.statusText === "OK"){
      DeleteAlert(dispatch);
      dispatch({
        type: DELETE_SALES,
        payload: res.data,
      });
      if(response){
        response(res.status)
      }
      // }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve(res.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  
  export const SalesAdvanceEntry =
  (
    data,
    response,
  ) =>
  async (dispatch) => {
    try {
      const res = await Salesservice.AdvanceEntry(
        data
      );
      if (res.status === 200) {
        dispatch({
          type: SALES_ADVANCE_ENTRY,
          payload: res.data,
        });
        if(response){
          response(res.status, res)
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
export const set_sales_table_data = (data) => (dispatch) => {
  dispatch({
    type: SALES_TABLE_DATA,
    payload: data,
  });
};

export const getErpSaleDetails = (id) => async (dispatch) => {
  const res = await Salesservice.getErpData(id);
  dispatch({
    type: ERP_SALE_DETAILS,
    payload: res.data,
  });
};

export const listSalesOutstandingAction =
  (
    data,
    employee_id,
    headerLocationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
    response
  ) =>
  async (dispatch) => {
    try {
      const res = await Salesservice.saleReceived(
        data,
        employee_id,
        headerLocationId,
      );
      if (res.status === 200) {
        dispatch({
          type: RECEIVED_SALES,
          payload: res.data,
        });

        if (response) {
          response(res.data);
        }
      }
      return res.data;
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const listcompletedSalesOutstandingAction =
  (
    employee_id,
    headerLocationId,
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Salesservice.completedsaleReceived(
        employee_id,
        headerLocationId,
        data
      );
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: SET_COMPLETED_RECEIVED_SALES,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
      // }
    }
  };

  export const get_searchcompletedSalesOutstandingAction = (employee_id,
    headerLocationId,
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,) =>{
    return {
      type:GET_COMPLETED_RECEIVED_SALES,
      data,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

  export const set_searchcompletedSalesOutstandingAction = (data) => {
    return {
      type:SET_COMPLETED_RECEIVED_SALES,
      payload:data
    }
  };

  export const saleIdGET =
  (
    customer_id,
    setModalTypeHandler,
    setLoaderStatusHandler,
    response
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Salesservice.salesidget(
        customer_id
      );
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: SALES_ID_GET,
          payload: res.data,
        }); 
        if(response){
          response(res.data)
        }
      }
     
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
      // }
    }
  };

export const consolidatedReceivings = (data) => async (dispatch) => {
  try {
    const res = await Salesservice.saleConsolidated(data);
    if (res.status === 200) {
      dispatch({
        type: CONSOLIDATED_SALES,
        payload: res.data,
      });
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const paymentReportBasedEmpAction = (id) => async (dispatch) => {
  try {
    const res = await Salesservice.paymentReportBasedEmp(id);
    if (res.status === 200) {
      dispatch({
        type: COLLECTIONREPORTBASEDEMP,
        payload: res.data,
      });
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const sendMail =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(true, setModalTypeHandler, setLoaderStatusHandler);
      const res = await Salesservice.sendMail(data);
      if (res.status === 200) {

        if (res.data.msg === "Setup Mail Configuration") {
          FailLoad(true, setModalTypeHandler, setLoaderStatusHandler);
          return ProductDeleteAlert(dispatch, res.data.msg)
        }
        MailAlert(dispatch);
      }
      FailLoad(true, setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      FailLoad(true, setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
    }
  };

export const receiptEntry =
  (data, setLoaderStatusHandler, c1, c2, response, type) => async (dispatch) => {
    const userConfig = {...data.userConfig};
    try {
      // ListLoad(true, setLoaderStatusHandler);
      const res = await Salesservice.receiptEntry(data);
      if (res.status === 200) {
        dispatch({
          type: RECEIVED_EDIT_SALES,
          payload: res.data,
        });
        if(res.data.message === 'Approval Sent'){
          ReceiptApprovalRequestAlert(dispatch)
        }
        else{
          if(type === 'collection'){
            ReconciliatedAlert(dispatch)
          }
          else{
            // await Salesservice.getAll(userConfig.user_id, userConfig.location_id);
            CreateAlert(dispatch);
          }
        }
        if (response) {
          response(res.status, res);
        }
      }
      // FailLoad(true, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(true, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const updateReceiptEntry =
  (data,response) => async (dispatch) => {
    const userConfig = {...data.userConfig};
    try {
      const res = await Salesservice.updateReceiptEntry(data);
      if (res.status === 200) {
        dispatch({
          type: RECEIVED_EDIT_SALES,
          payload: res.data,
        });
        await Salesservice.getAll(userConfig.user_id, userConfig.location_id);
        CreateAlert(dispatch);
        if (response) {
          response(res.status, res);
        }
      }
      // FailLoad(true, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(true, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

//OUTstanding mailer

export const listoutstanding =
  (
    setModalTypeHandler,
    setLoaderStatusHandler,
    employee_id,
    headerLocationId,
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Salesservice.outstandingmailer(
        employee_id,
        headerLocationId,
      );
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: LIST_OUTSTANDING_SALES,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
//debitor

export const listdebitor =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Salesservice.averagedebitor();
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: LIST_AVERAGE_DEBITOR,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

//day sales

export const daysales =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Salesservice.oneDaySales();
      if (res.status === 200) {
        dispatch({
          type: DAY_SALES,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const listSalesDateAction =
  (date, employee_id, headerLocationId, resdata,name) => async (dispatch) => {
    try {
      const res = await Salesservice.getDate(
        date,
        employee_id,
        headerLocationId,name
      );
      if (res.status === 200) {
        dispatch({
          type: LIST_SALES_DATE_FILTER,
          payload: res.data,
        });
      }
      resdata(res);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const listdailyreportAction =
  (date, employee_id, headerLocationId, resdata) => async (dispatch) => {
    try {
      const res = await Salesservice.getreportdata(
        date,
        employee_id,
        headerLocationId,
      );
      if (res.status === 200) {
        dispatch({
          type: LIST_DAILY_REPORT_DATA,
          payload: res.data,
        });
      }
      resdata(res);
    } catch (err) {
      ErrorAlert(dispatch, err);
    }
  };

export const creditDebitNoteSeq = (type) => async (dispatch) => {
  try {
    const res = await Salesservice.creditDebitNoteSeq(type);
    dispatch({
      type: CREDIT_DEBIT_SEQ,
      payload: res.data,
    });
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const creditDebitNoteSeqUpdate = (type, data) => async (dispatch) => {
  try {
    // console.log("creditDebitNoteSeqUpdate",type,data)
    const res = await Salesservice.creditDebitNoteSeqUpdate(type, data);
    dispatch({
      type: CREDIT_DEBIT_SEQ,
      payload: res.data,
    });
  } catch (err) {
    ErrorAlert(dispatch, err);
  }
};

export const returnActions =
  (data, setLoaderStatusHandler, employee_id, headerLocationId,response) =>
  async (dispatch) => {
    try {
      ListLoad(true, setLoaderStatusHandler);
      const res = await Salesservice.return(
        data,
        employee_id,
        headerLocationId,
      );
      dispatch({
        type: LIST_SALES,
        payload: res.data,
      });
       if(response){
          response(res)
       }
      // const item_id = data.sales_items.map(i => i.item_id)
      // dispatch(updateProductDataAction({item_id}))
      FailLoad(true, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      if(err?.response?.data?.status === 'LOT_UNAVAILABLE'){
        NotAvailableAlert(dispatch, err)
      }
       else{
        ErrorAlert(dispatch, err);
      }
      FailLoad(true, setLoaderStatusHandler);
      if (response) response({ status: 'error', error: err });
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const dcreturnActions =
  (data, setLoaderStatusHandler, employee_id, headerLocationId,response) =>
  async (dispatch) => {
    
    try {
      ListLoad(true, setLoaderStatusHandler);
      const res = await Salesservice.dcreturn(
        data,
        employee_id,
        headerLocationId,
      );
      dispatch({
        type: LIST_DC_PAGINATION,
        payload: res.data,
      });
      // console.log("2222222",res)
      if(response){
         await  response(res)
       }
      FailLoad(true, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      if(err.response.data.status === 'LOT_UNAVAILABLE'){
        NotAvailableAlert(dispatch, err)
      }
      else{
        ErrorAlert(dispatch, err);
      }
      FailLoad(true, setLoaderStatusHandler);
    }
  };

export const salesDailyReport =
  (employee_id, headerLocationId, date) => async (dispatch) => {
    try {
      const res = await Salesservice.dailyReport(
        employee_id,
        headerLocationId,
        date,
      );
      dispatch({
        type: SALES_DAILY_REPORT,
        payload: res.data,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  
  export const salesReportDataInPagination = (setModalTypeHandler,setLoaderStatusHandler,data) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler)
      const res = await Salesservice.salesDataReport(data)
      dispatch({
        type: SALESREPORT_BY_PAGINATION,
        payload: res.data.data,
      });
      dispatch({
        type: TOTAL_SALESREPORT_COUNT,
        payload: res.data.numRows,
      });
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      ErrorAlert(dispatch,err)
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  

export const listAllFilterSalesAction =
  (
    data,
    employee_id,
    headerLocationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
    exportDataCallBack
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Salesservice.getAllFilterData(
        data,
        employee_id,
        headerLocationId,
      );
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: LIST_ALL_FILTER_DATA,
          payload: res.data,
        });
        if (exportDataCallBack) {
          exportDataCallBack(res.data);
        }
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (exportDataCallBack) {
        exportDataCallBack([]);
      }
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
      // }
    }
  };

  export const getSalesReceivableReportAction =
  (
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Salesservice.getReceivableReport(data);
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: SALES_RECEIVABLE_REPORT,
          payload: res.data.data,
        });
        dispatch({
          type: TOTAL_RECEIVABLE_REPORT_COUNT,
          payload: res.data.numRows2,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


  export const salesReportDataGet = (datasvalue,setModalTypeHandler,setLoaderStatusHandler,exportCallBack,data) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler)
      const res = await Salesservice.salesgetDataReport(datasvalue)
      dispatch({
        type: SALESREPORT_BY_GETALL,
        payload: res.data,
      });
      if (exportCallBack) {
        exportCallBack(res.data);
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      if (exportCallBack([])) {;
      }
      ErrorAlert(dispatch,err)
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  export const exportDatareceivableAction =
  (
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
    exportDataCallBack
    
  ) =>
  async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Salesservice.exportDatareceivable(data);
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        // dispatch({
        //   payload: res.data,
        // });
        if (exportDataCallBack) {
          exportDataCallBack(res.data);
        }
      
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (exportDataCallBack) {
        exportDataCallBack([]);
      }
      ErrorAlert(dispatch, err);
      // }
    }
  };
  

  // STOCKGROUP_BY_GETALL

  export const listStockgroupDataAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Salesservice.getstockgroup(data);
      if (res.status === 200) {
        dispatch({
          type: STOCKGROUP_BY_GETALL,
          payload: res.data,
        });
       
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const listSalesPaginateAction =
  (
    data,
    employee_id,
    headerLocationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
    exportDataCallBack
  ) =>
  async (dispatch) => {
    try {
      dispatch({
          type: RESET_LIST_SALES_PAGINATION,
          payload: [],
        });
      const res = await Salesservice.getSalesByPagination(data, employee_id, headerLocationId);
       if (res.status === 200) {
        // dispatch({
        //   type: LIST_PURCHASES_FILTER,
        //   payload: res.data.data,
        // });
        
        dispatch({
          type: LIST_SALES_PAGINATION,
          payload: res.data,
        });
        if (exportDataCallBack) {
          console.log('res.data', res.data.data)
          exportDataCallBack(res.data.data);
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      if (exportDataCallBack) {
        exportDataCallBack([]);
      }
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


  export const listSaleOrderPaginateAction =
  (
    data,
    employee_id,
    headerLocationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
    exportDataCallBack
  ) =>
  async (dispatch) => {
    try {
       dispatch({
          type: RESET_LIST_SALE_ORDER_PAGINATION,
          payload: [],
        });
      const res = await Salesservice.getSaleOrderByPagination(data, employee_id, headerLocationId);
      if (res.status === 200) {
        // dispatch({
        //   type: LIST_PURCHASES_FILTER,
        //   payload: res.data.data,
        // });
        
        dispatch({
          type: LIST_SALE_ORDER_PAGINATION,
          payload: res.data,
        });
        if (exportDataCallBack) {
          console.log('res.data', res.data.data)
          exportDataCallBack(res.data.data);
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      if (exportDataCallBack) {
        exportDataCallBack([]);
      }
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


    export const listDCPaginateAction =
  (
    data,
    employee_id,
    headerLocationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
    exportDataCallBack
  ) =>
  async (dispatch) => {
    try {
       dispatch({
          type: RESET_LIST_DC_PAGINATION,
          payload: [],
        });
      const res = await Salesservice.getDCByPagination(data, employee_id, headerLocationId);
      if (res.status === 200) {
        // dispatch({
        //   type: LIST_PURCHASES_FILTER,
        //   payload: res.data.data,
        // });
        
        dispatch({
          type: LIST_DC_PAGINATION,
          payload: res.data,
        });
        if (exportDataCallBack) {
          console.log('res.data', res.data.data)
          exportDataCallBack(res.data.data);
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      if (exportDataCallBack) {
        exportDataCallBack([]);
      }
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const listSalesDataAction =
  (
    data,
    employee_id,
    headerLocationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
    exportDataCallBack
  ) =>
  async (dispatch) => {
    try {
      const res = await Salesservice.getSalesData(data, employee_id, headerLocationId);
      if (res.status === 200) {
        
        dispatch({
          type: LIST_SALES_DATA,
          payload: res.data,
        });
        if (exportDataCallBack) {
          console.log('res.data', res.data.data)
          exportDataCallBack(res.data.data);
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      if (exportDataCallBack) {
        exportDataCallBack([]);
      }
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const get_searchSalesAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
    return {
      type:GET_SEARCH_SALES,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };



  export const set_searchSalesAction = (data) => {
    return {
      type:SET_SEARCH_SALES,
      payload:data
    }
  };

  export const get_searchSaleOrderAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
    return {
      type:GET_SEARCH_SALE_ORDER,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

    export const set_searchSaleOrderAction = (data) => {
    return {
      type:SET_SEARCH_SALE_ORDER,
      payload:data
    }
  };

   export const get_searchDcAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
    // console.log("asdasdad")
    return {
      type:GET_SEARCH_DC,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

    export const set_searchDcAction = (data) => {
    return {
      type:SET_SEARCH_DC,
      payload:data
    }
  };

 

  export const getSearchOutstandReportAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
    return {
      type:GET_SEARCH_OUTSTAND,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

  export const setSearchOutstandReportAction = (data) => {
    return {
      type:SET_SEARCH_OUTSTAND,
      payload:data
    }
  };

  export const getSearchConsolidatedAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
    return {
      type:GET_SEARCH_CONSOLIDATED,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

  export const setSearchConsolidatedAction = (data) => {
    return {
      type:SET_SEARCH_CONSOLIDATED,
      payload:data
    }
  };

  export const searchSalesReportAction = (body) =>{
    return {
      type:GET_SEARCH_SALES_REPORT,
      body
    }
  };

  export const searchSalesReportState = (data) => {
    return {
      type:SET_SEARCH_SALES_REPORT,
      payload:data
    }
  };
  export const getSearchReceivableReportAction = (body) =>{
    return {
      type:GET_SEARCH_RECEIVABLE_REPORT,
      body
    }
  };

  export const setSearchReceivableReportAction = (data) => {
    return {
      type:SET_SEARCH_RECEIVABLE_REPORT,
      payload:data
    }
  };

  export const SalesReportfinalDataAction = (data) => async (dispatch) => {
    try {
      const res = await Salesservice.pagination(data);
      if (res.status === 200) {
        dispatch({
          // type: SET_SEARCH_SALES_REPORT,
          type: SET_SEARCH_SALES_REPORT_NORMAL,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


  export const ReceivableReportFinalAction = (data) => async (dispatch) => {
    try {
      const res = await Salesservice.Receivablepagination(data);
      if (res.status === 200) {
        dispatch({
          type: SET_SEARCH_RECEIVABLE_REPORT,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
};
  

export const sendDailyReportMail =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(true, setModalTypeHandler, setLoaderStatusHandler);
      const res = await Salesservice.sendDailyReportMail(data);
      if (res.status === 200) {
        MailAlert(dispatch);
      }
      FailLoad(true, setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      FailLoad(true, setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
    }
  };

export const getCompanyAdminId =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(true, setModalTypeHandler, setLoaderStatusHandler);
      const res = await Salesservice.getCompanyAdminId();
      if (res.status === 200) {
        dispatch({
          type: GET_ADMIN_ID,
          payload: res.data,
        });
      }
      FailLoad(true, setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      FailLoad(true, setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
    }
  };
  

  export const searchSalesPaginationAction = (data) => async (dispatch) => {
    try {
      const res = await Salesservice.searchSalesPagination(data);
      if (res.status === 200) {
        dispatch({
          type: SET_SEARCH_SALES,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  
  export const searchSaleOrderPaginationAction = (data) => async (dispatch) => {
    try {
      const res = await Salesservice.searchSaleOrderPagination(data);
      if (res.status === 200) {
        dispatch({
          type: SET_SEARCH_SALE_ORDER,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const searchDcPaginationAction = (data) => async (dispatch) => {
    try {
      const res = await Salesservice.searchDcPagination(data);
      if (res.status === 200) {
        dispatch({
          type: SET_SEARCH_DC,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


  export const CollectionsReconAction =
  (data) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Salesservice.collections(data);
      if (res.status === 200) {
        dispatch({
          type: COLLECTIONS_UPDATE,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


  
  export const CollectionsReportsAction =
  (date, employee_id, headerLocationId, resdata,name) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Salesservice.Reportsget(date, employee_id, headerLocationId,name);
      if (res.status === 200) {
        dispatch({
          type: COLLECTIONS_REPORTS,
          payload: res.data,
        });
      }
      resdata(res);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  export const CreaterequestAction =
  (data, response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Salesservice.createreq(data);
      if(res.status == 200){
        if(response){
          response(res.data)
        }
        DiscountRes(dispatch);
        
      }
      // if (res.status === 200) {
        // dispatch({
        //   type: COLLECTIONS_REPORTS,
        //   payload: res.data,
        // });
      // }
      // resdata(res);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const CancelDiscount =
  (response) => async (dispatch) => {
    try {
      Canceldiscount(dispatch)
      if(res.status == 200){
        if(response){
          response(res.status)
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const paymentCollectionAction = (data) => async (dispatch) => {
    try {
      const res = await Salesservice.paymentCollection(data);
      if (res.status === 200) {
        dispatch({
          type: SET_PAYMENT_COLLECTION_REPORT,
          payload: res.data,
        });
      }
      // resdata(res);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const paymentCollectionApproveAction = (data,response) => async (dispatch) => {
    try {
      const res = await Salesservice.paymentCollectionApprove(data);
      console.log("asda",res)
      if (res.status === 200) {
        ApproveAlert(dispatch);
        dispatch({
          type: PAYMENT_COLLECTION_APPROVE,
          payload: res.data,
        });
        if(response){
          response(res.status)
        }
      }
      // resdata(res);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const get_paymentCollectionAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
    return {
      type:GET_PAYMENT_COLLECTION_REPORT,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

  export const set_paymentCollectionAction = (data) => {
    return {
      type:SET_PAYMENT_COLLECTION_REPORT,
      payload:data
    }
  };

  export const searchIncentiveAction = (val,setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: GET_SEARCH_SALESMAN_INCENTIVE,
      data: val,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };

    export const set_searchIncentiveAction = (data) => {
      return {
        type: SET_SEARCH_SALESMAN_INCENTIVE,
        payload: data
      }
  };

  export const paymentCollectionFilterAction = (data) => async (dispatch) => {
    try {
      const res = await Salesservice.paymentCollectionFilter(data);
      if (res.status === 200) {
        dispatch({
          type: PAYMENT_COLLECTION_FILTER,
          payload: res.data,  
        });
      }
      return res; 
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getAllSalesManListAction = () => async (dispatch) => {
    try {
      const res = await Salesservice.getAllSalesManList();
      if (res.status === 200) {
        dispatch({
          type: GET_ALL_SALESMAN_LIST,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const createIncentiveForSalesmanAction = (data) => async (dispatch) => {
  try {
    const res = await Salesservice.createIncentiveForSalesman(data);
    if (res.status === 200) {
      dispatch({
        type: CREATE_INCENTIVE_FOR_SALESMAN,
        payload: res,
      });
      incentiveCreateAlert(dispatch)
    }
    return res;
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const getAllIncentivesAction = () => async (dispatch) => {
  try {
    const res = await Salesservice.getAllIncentives();
    if (res.status === 200) {
      dispatch({
        type: GET_ALL_SALESMAN_INCENTIVE,
        payload: res.data,
      });
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const incentivePaginationAction = (data) => async (dispatch) => {
  try {
    const res = await Salesservice.searchIncentive(data);
    if (res.status === 200) {
      dispatch({
        type: SET_SEARCH_SALESMAN_INCENTIVE,
        payload: res,
      });
      return res;
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const deleteSalesmanIncentiveAction = (data) => async (dispatch) => {
  try {
    const res = await Salesservice.deleteSalesmanIncentive(data);
    if (res.status === 200) {
      dispatch({
        type: DELETE_SALESMAN_INCENTIVE,
        payload: res.data,
      });
      incentiveDeleteAlert(dispatch)
    }
    return res;
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const updateSalesmanIncentiveAction = (data) => async (dispatch) => {
  try {
    const res = await Salesservice.updateSalesmanIncentive(data);
    if (res.status === 200) {
      dispatch({
        type: UPADTE_SALESMAN_INCENTIVE,
        payload: res.data,
      });
      incentiveUpdateAlert(dispatch)
    }
    return res;
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};
  export const getProfitWiseReportAction = (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Salesservice.getProfitWiseReport(data);
      if (res.status === 200) {
        dispatch({
          type: SET_PROFIT_WISE_REPORT,
          payload: res.data,
        });
      }
     FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const get_searchProfitWiseReportAction = (
    data,
    setModalTypeHandler,
    setLoaderStatusHandler) => {
    return {
      type:GET_PROFIT_WISE_REPORT,
      data,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

  export const set_searchProfitWiseReportAction = (data) => {
    return {
      type:SET_PROFIT_WISE_REPORT,
      payload:data
    }
  };
  export const dayBookReportAction=(data)=>async (dispatch)=>{
    try{
      const res = await Salesservice.dayBookReport(data);
      if(res.status === 200){
        dispatch({
          type :GET_DAY_BOOK,
          payload : res.data
        })
      }
      return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
      return Promise.reject('API_FINISHED_ERROR')
    }
  }

  export const dayBookConsolidateAction = (data) => async(dispatch) => {
    try{
      const res = await Salesservice.dayBookConsolidate(data)
      if(res.status === 200){
        dispatch({
          type: GET_DAY_BOOK_CONSOLIDATE,
          payload: res.data
        })
      }
      return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
      return Promise.resolve("API_FINISHED_ERROR")
    }
  }

  export const getDayBookAction=(data)=>{
    return{
      type : GET_DAY_BOOK,
      payload : data
    }
  }

  export const setdayBookAction=(body,setModalTypeHandler,setLoaderStatusHandler)=>{
    return{
      type : SET_DAY_BOOK,
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  }

  export const StockGroupSummaryAction=(data)=> async(dispatch)=>{
    try{
      const res = await Salesservice.StockGroupSummary(data)

      if(res.status === 200){
        dispatch({
          type : GET_STOCK_GROUP_SUMMARY,
          payload : res.data
        })
      }
      return Promise.resolve('API_FINISHED SUCCESS')
    }
    catch(err){
      return Promise.reject('API_FINISHED_ERROR')
    }
  }
  
  export const getStockSummary=(data)=>{
    return{
      type : GET_STOCK_GROUP_SUMMARY,
      payload : data
    }
  }

  export const setStockSummary=(body,setModalTypeHandler,setLoaderStatusHandler)=>{
    return{
      type : SET_STOCK_GROUP_SUMMARY,
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  }

  export const expiryDateReportAction =(data)=>async(dispatch)=>{
    try{
      const res = await Salesservice.ExpiryDatereport(data)

      if(res.status === 200){
        dispatch({
          type : GET_EXPIRY_DATE_REPORT,
          payload : res.data
        })
      }
      return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
      return Promise.reject('API_FINISHED_ERROR')
    }
  }

  export const getExpirtDateReport =(data)=>{
    return{
      type : GET_EXPIRY_DATE_REPORT,
      payload : data
    }
  }

  export const setExpiryDateReport=(body,setModalTypeHandler,setLoaderStatusHandler)=>{
    return {
      type: SET_EXPIRY_DATE_REPORT,
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  }

 export const trialBalanceReportAction = (data) => async (dispatch) => {
    try {
      const res = await Salesservice.trialBalanceReport(data);
      if (res.status === 200) {
        dispatch({
          type: TRIAL_BALANCE_REPORT,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const paymentReportBasedEmpVerifyAction = (data) => async (dispatch) => {
    try {
      const res = await Salesservice.paymentReportBasedEmpVerify(data);
      if (res.status === 200) {
        dispatch({
          type: PAYMENT_REPORT_BASED_EMP_VERIFY,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const incomeBasedOnCustomerAction = (data) => async (dispatch) => {
    try {
      dispatch({
          type: RESET_INCOME_BASED_ON_CUSTOMER,
          payload: [],
        });
      const res = await Salesservice.incomeBasedOnCustomer(data);
      if (res.status === 200) {
        dispatch({
          type: INCOME_BASED_ON_CUSTOMER,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


export const getSaleOrderDeliveryChallanByCustomerAction = (data) => async(dispatch) => {
  try{
    dispatch({
          type: RESET_SALE_ORDER_DELIVERY_CHALLAN_BY_CUSTOMER,
          payload: [],
        });
    const res = await Salesservice.saleOrderDeliveryChallanByCustomer(data)
    if(res.status === 200){
      dispatch({
        type: SALE_ORDER_DELIVERY_CHALLAN_BY_CUSTOMER,
        payload: res.data
      })
    }
    return Promise.resolve({status : "API_FINISHED_SUCCESS", data: res.data})
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve({ status: "API_FINISHED_ERROR", data: [] })
  }
}

export const salesApprovalsAction=(data,response)=> async(dispatch)=>{
  try{

    const res = await Salesservice.salesApprovals(data,response)

    if(res.status === 200){
      dispatch({
        type :SALES_APPROVALS,
        payload : res.data
      })
    }

    if(response){
      response(res.data)
  }

    return Promise.resolve('API_FINISHED_SUCCESS')


  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.reject('API_FINISHED_ERROR')
  }
}

export const listSalesManAction=(data)=> async(dispatch)=>{
  try{

    const res = await Salesservice.listSalesMan(data)

    if(res.status === 200){
      dispatch({
        type :SALESMAN_LIST,
        payload : res.data
      })
    }
    return Promise.resolve('API_FINISHED_SUCCESS')


  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.reject('API_FINISHED_ERROR')
  }
}

export const getSalesApprovalsIdAction=(data)=> async(dispatch)=>{
  try{

    const res = await Salesservice.getSalesApprovalsId(data)
    console.log(res.data,'responseDaata')

    if(res.status === 200){
      dispatch({
        type :SALES_APPROVALS_BY_ID,
        payload : res.data
      })
    }

    return Promise.resolve('API_FINISHED_SUCCESS')


  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.reject('API_FINISHED_ERROR')
  }
}

export const updateSeenSalesApproval=(data)=> async(dispatch)=>{
  try{

    const res = await Salesservice.updateSeenSalesApproval(data)
    console.log(res.data,'responseDaata')

    if(res.status === 200){
      dispatch({
        type :SALES_APPROVALS,
        payload : res.data
      })
    }

    return Promise.resolve('API_FINISHED_SUCCESS')


  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.reject('API_FINISHED_ERROR')
  }
}

export const salesApprovalsRejectAction=(data,response)=> async(dispatch)=>{
  try{

    const res = await Salesservice.rejectSalesApproval(data)
    console.log(res.data,'responseDaata')

    if(res.status === 200){
      dispatch({
        type :REJECT_SALES_APPROVALS,
        payload : res.data
      })
    }
    if(response){
            response(res.data)
        }
    return Promise.resolve('API_FINISHED_SUCCESS')


  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.reject('API_FINISHED_ERROR')
  }
}

export const createSalesApproval=(data,response)=> async(dispatch)=>{
  try{

    const res = await Salesservice.createSalesApproval(data)
    console.log(res.data,'responseDaata')

    if(res.status === 200){
      dispatch({
        type :REJECT_SALES_APPROVALS,
        payload : res.data
      })
    }
    if(response){
            response(res.data)
        }
    return Promise.resolve('API_FINISHED_SUCCESS')


  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.reject('API_FINISHED_ERROR')
  }
}

export const approvalUserRightsAction = (data)=> async(dispatch)=>{
  try{
    const res = await Salesservice.approvalUserRights(data)

    if(res.status === 200){
      dispatch({
        type : APPROVAL_USER_RIGHTS,
        payload : res.data
      })
    }
    return Promise.resolve('API_FINISHED_SUCCESS')
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.reject('API_FINISHED_ERROR')
  }
}

export const listSalesPendingAction =
  (
    data,
    employee_id,
    headerLocationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
    response
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Salesservice.saleReceivedPending(
        data,
        employee_id,
        headerLocationId,
      );
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: RECEIVED_SALES_PENDING,
          payload: res.data,
        });

        if (response) {
          response(res);
        }
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return res.data;
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
      // }
    }
  };

  export const getLatestTransporterDetailsAction = (customer_id, response) => async(dispatch) => {
    try{
      const res = await Salesservice.getLatestTransporterDetails(customer_id)
      if(res.status === 200){
        if(response){
          response(res.data)
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
      ErrorAlert(dispatch, err)
      return Promise.resolve("APO_FINISHED_ERROR")
    }
  }

  export const scheduleReportPdfAction = (data) => async(dispatch) => {
    try{ 
      const res = await Salesservice.scheduleReportPdf(data)
      if(res.status === 200 && res.data.message === 'Delete Existing Schedule'){
        return ErrorAlert(dispatch, res.data ) 
      }
      if(res.status === 200){
        dispatch({
          type: SCHEDULE_REPORT,
          payload: res.data,
        });
      }  
      return Promise.resolve("API_FINISHED_SUCCESS") 
    }
    catch(err){ 
      ErrorAlert(dispatch, err)  
      return Promise.resolve("APO_FINISHED_ERROR") 
    }
  }

  export const shareReportAction = (data) => async(dispatch) => {
    try{ 
      const res = await Salesservice.shareReport(data)
      if(res.status === 200){
        dispatch({
          type: SHARE_REPORT,
          payload: res.data,
        });
      }  
      return Promise.resolve("API_FINISHED_SUCCESS") 
    }
    catch(err){ 
      ErrorAlert(dispatch, err)  
      return Promise.resolve("APO_FINISHED_ERROR") 
    }
  }

  export const getAllReceiptsAction = () => async (dispatch) => {
    try { 
      const res = await Salesservice.getAllReceipts()
      if(res.status === 200) {
        dispatch({
          type : GET_ALL_RECEIPTS,
          payload : res.data
        })
      }  
      return Promise.resolve("API_FINISHED_SUCCESS") 
    }
    catch(err) { 
      ErrorAlert(dispatch, err)  
      return Promise.resolve("APO_FINISHED_ERROR") 
    }
  }

  export const getReceiptsByIdAction = (id, type) => async (dispatch) => {
    try { 
      const res = await Salesservice.getReceiptsById(id, type)
      if(res.status === 200) {
        dispatch({
          type : GET_RECEIPTS_BY_ID,
          payload : res.data
        })
      }  
      return Promise.resolve("API_FINISHED_SUCCESS") 
    }
    catch(err) { 
      ErrorAlert(dispatch, err)  
      return Promise.resolve("APO_FINISHED_ERROR") 
    }
  }

  export const setReceiptsByIdAction = (data) => {
    return {
      type : GET_RECEIPTS_BY_ID,
      payload : data
    }
  }

  export const getAllProductSalesHistoryAction = (data) => async (dispatch) => {
    try { 
      const res = await Salesservice.getAllProductSalesHistory(data)
      if(res.status === 200) {
        dispatch({
          type : GET_ALL_PRODUCT_SALES_HISTORY,
          payload : res.data
        })
      }  
      return Promise.resolve("API_FINISHED_SUCCESS") 
    }
    catch(err) { 
      ErrorAlert(dispatch, err)  
      return Promise.resolve("APO_FINISHED_ERROR") 
    }
  }

  export const customesSalesmanAction = (data) => async(dispatch) => {
    try{ 
      const res = await Salesservice.customesSalesman(data)
      if(res.status === 200){
        dispatch({
          type: CUSTOMER_SALESMAN,
          payload: res.data,
        });
      }  
      return Promise.resolve("API_FINISHED_SUCCESS") 
    }
    catch(err){ 
      ErrorAlert(dispatch, err)  
      return Promise.resolve("APO_FINISHED_ERROR") 
    }
  }

  
export const triggerSalesModal = (payload) => ({
  type: TRIGGER_SALES_MODAL,
  payload, 
});

export const triggerDcsModal = (payload) => ({
  type: TRIGGER_DC_MODAL,
  payload, 
});

export const listSalesOutstandingActionExport =
  (
    data,
    employee_id,
    headerLocationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
    response
  ) =>
  async (dispatch) => {
    try {
      const res = await Salesservice.saleReceivedExport(
        data,
        employee_id,
        headerLocationId,
      );
      if (res.status === 200) {
        dispatch({
          type: RECEIVED_SALES,
          payload: res.data,
        });

        if (response) {
          response(res.data);
        }
      }
      return res.data;
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getReceiptEditDataAction = (payload) => async(dispatch) => {
  try{
    const res = await Salesservice.getReceiptEditData(payload)
    if(res.status === 200){
      dispatch({
        type: RECEIPT_EDIT_DATA,
        payload: res.data.data
      })
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const setReceiptEditDataAction = (data) => {
  return{
    type : RECEIPT_EDIT_DATA,
    payload : data.data
  }
}

export const editReceiptAction = (data, response) => async(dispatch) => {
  try{
    const res = await Salesservice.editReceipt(data)
    if(res.status === 200){
      dispatch({
        type: RECEIVED_EDIT_SALES,
        payload: res.data
      })
    }
    if(response){
      response(res)
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    console.log(err.response.data.message, 'err')
    if(err.response.data.status === 'Advance'){
      advanceAlert(dispatch, `Already Used Advance Amount So Can't Edit`)
    }
    else{
      ErrorAlert(dispatch, err)
    }
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const salesAdvanceEntryEdit = (data, response) => async(dispatch) => {
  try{
    const res = await Salesservice.editAdvance(data)
    if(response){
      response(res.status)
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const receiptTimelineAction = (data,response)=> async(dispatch) =>{
  try{
    const res = await Salesservice.receiptTimeline(data)
    if(res.status === 200){
          dispatch({
            type: RECEIPT_TIMELINE,
            payload: res.data
          })
        }
    if(response){
      response(res.data)
    }
    return Promise.resolve('API_FINISHED_SUCCESS')
  }
  catch(err){
    return Promise.reject('API_FINISHED_ERROR')
  }
}

export const thermalPrinterAction = (data) => async(dispatch) => {
  try{ 
    const res = await Salesservice.thermalPrinter(data);
    if(res.status === 200){
      dispatch({
        type: THERMAL_PRINTER,
        payload: res.data,
      });
      return res; // Return the actual response, not a string
    }  
    return Promise.reject("API call failed"); 
  }
  catch(err){ 
    ErrorAlert(dispatch, err);
    return Promise.reject(err); 
    }
}

export const getReceiptDetailsBasedOnChequeAction = (data) => async(dispatch) => {
  try{
    const res = await Salesservice.getReceiptDetailsBasedOnCheque(data)
    if(res.status === 200){
      dispatch({
        type: RECEIPT_BY_CHEQUE,
        payload: res.data
      })
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const checkChequeNumberExistAction = (data, response) => async(dispatch) => {
  try{
    const res = await Salesservice.checkChequeNumberExist(data)
    if(res.status === 200){
      dispatch({
        type: CHEQUE_ALREADY_EXIST,
        payload: res.data
      })
      response(res.data)
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const salesSummaryAction = (data, setModalTypeHandler, setLoaderStatusHandler) => async(dispatch) => {
  try{
    const res = await Salesservice.salesSummary(data)
    if(res.status === 200){
      dispatch({
        type: SALES_SUMMARY,
        payload: res.data,
        setModalTypeHandler,
        setLoaderStatusHandler
      })
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

  export const get_salesSummaryAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
    return {
      type:GET_SALES_SUMMARY,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

  export const set_salesSummaryAction = (data) => {
    return {
      type:SALES_SUMMARY,
      payload:data
    }
  };

  export const getBillingcompany = () => async(dispatch) => {
  try{
    const res = await Salesservice.billingcompany()
  
    if(res.status === 200){
      dispatch({
        type: GET_BILLING_COMPANY,
        payload: res.data
      })
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

  export const individualPaymentDetailsAction = (data) => async(dispatch) => {
  try{
    const res = await Salesservice.individualPaymentDetails(data)
  
    if(res.status === 200){
      dispatch({
        type: INDIVIDUAL_PAYMENT_DETAILS,
        payload: res.data
      })
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const salesRefundEntryAction = (payload, response) => async(dispatch) => {
  try{
    const res = await Salesservice.salesRefundEntry(payload)
    if(res.status === 200){
      CreateAlert(dispatch)
      dispatch({
        type: SALES_REFUND_ENTRY,
        payload: res.data
      })
    }
    if(response){
      response(res.status, res)
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const editSalesRefundEntryAction = (payload, id, response) => async(dispatch) => {
  try{
    const res = await Salesservice.editSalesRefundEntry(payload, id)
    if(res.status === 200){
      UpdateAlert(dispatch)
      dispatch({
        type: SALES_REFUND_ENTRY_EDIT,
        payload: res.data
      })
    }
    if(response){
      response(res.status, res)
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

// Backward-compatible aliases used in older imports
export const getbyidReceivableAction = searchReceivableAction;
export const individualPaymentDetails = individualPaymentDetailsAction;
