import {
  CREATE_PURCHASES,
  LIST_PURCHASES,
  GET_ID_PURCHASES,
  EDIT_PURCHASES,
  DELETE_PURCHASES,
  RECEIVED_PURCHASES,
  GET_SEARCH_RECEIVED_PURCHASES,
  SET_SEARCH_RECEIVED_PURCHASES,
  COMPLETED_RECEIVED_PURCHASES,
  ENTRY_PURCHASES,
  LIST_STOCK_LOCATION,
  LIST_PRODUCT,
  LIST_POTCODE,
  CONSOLIDATED_PURCHASES,
  LIST_INVENTORY,
  LIST_INVENTORY_BY_ID,
  LIST_PURCHASES_FILTER,
  LIST_PURCHASE_REPORT,
  COMPARE_PURCHASE,
  PURCHASE_RECEIVABLE,
  GET_PURCHASE_REPORT,
  TOTAL_PURCHASE_REPORT_COUNT,
  LIST_AGEWISE_PAYABLES,
  FILTER_PURCHASE_REPORT,
  PRINT_LABEL,
  LIST_PURCHASES_PAGINATION,
  GET_SEARCH_PURCHASE,
  SET_SEARCH_PURCHASE,
  SET_SEARCH_PURCHASE_REPORT,
  GET_SEARCH_PURCHASE_REPORT,
  GET_SEARCH_PAYABLE_REPORT,
  SET_SEARCH_PAYABLE_REPORT,
  PURCHASE_DAILY_REPORT,
  PURCHASE_ADVANCE_ENTRY,
  SET_SEARCH_INVENTORY,
  STOCK_UPLOAD_LIST,
  GET_SEARCH_COMPLETED_PAYMENT_VIEW,
  BARCODE_QR_SEQUENCE,
  PURCHASE_ORDER_BY_VENDOR,
  TDS_TAX_RATE,
  RECEIVED_PURCHASES_PENDING,
  GET_PRODUCT_PURCHSE_HISTORY,
  GET_ALL_PAYMENTS,
  GET_PAYMENTS_BY_ID,
  BILLS_MODAL,
  PO_MODEL,
  RESET_LIST_PURCHASES_PAGINATION,
  GET_VENDOR_PURCHASES_AMOUNT,
  PAYABLES_PAYMENT_ENTRY,
  INVOICE_NUMBER_EXIST,
  PURCHASE_SUMMARY,
  GET_PURCHASE_SUMMARY,
  VENDOR_REFUND_ENTRY,
  VENDOR_REFUND_ENTRY_EDIT,
  SUPPLIER_TIMELINE_DATA
} from '../actionTypes';
import PurchasesService from '../../services/purchases_services';
import {
  ListLoad,
  FailLoad,
  ErrorAlert,
  DeleteAlert,
  UpdateAlert,
  CreateAlert,
  successmsg,
  errormsg,
  ExistAlert,
  ProductDeleteAlert,
  LotExistAlert,
  NotAvailableAlert,
  posequenceExist,
  alreadyExistAlert,
  detailUpdateAlert
} from './load';
// import { createAction, deleteAction, updateAction } from './actions';
import Salesservice from '../../services/sales_services';
import Productservice from '../../services/product_services';
import Inventoryservice from '../../services/inventory_services';
import { getSupplierDetailsByIdreceivings_itemsAction } from './vendor_actions';

export const createPurchasesAction =
  (
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
    sample,
    mailData,
    insertId,
    //resdata,
    resStatus,
    employee_id,
    headerLocationId,
    setDisable,    
    bodyData,
  ) =>
  async (dispatch) => {
    console.log('bodyData', bodyData)
    // createAction(PurchasesService, CREATE_PURCHASES, dispatch, data, null, null,  setModalTypeHandler, setLoaderStatusHandler, sample)
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PurchasesService.create(
        data,
        employee_id,
        headerLocationId,
      );
      
      // if (mailData) {
      //   await Salesservice.sendMail(mailData);
      // }
      // dispatch({
      //   type: CREATE_PURCHASES,
      //   payload: res.data.data,
      // });
console.log('resssssss', res.data)
      if(res.data.responsecode === 500 && res.data.status ==='PoSequence Already Exist'){
        posequenceExist(dispatch)
        if (resStatus) {
          resStatus(500);
        }
        FailLoad(setModalTypeHandler, setLoaderStatusHandler);
       }else{
        const ress = await PurchasesService.purchaseReceived(
          bodyData,
          employee_id,
          headerLocationId,
        );
            dispatch({
              type: RECEIVED_PURCHASES,
              payload: ress.data,
            });
            if (insertId) {
              insertId(res.data.insertId);
            }
            // if(resdata){
            //   resdata(res.data)              
            // }
            if (resStatus) {
              resStatus(res);
            }
            if(res.status === 409 ){
              LotExistAlert(dispatch)
            }
            if (setDisable) {
              setDisable(false);
            }
            CreateAlert(dispatch);
            successmsg(sample);
            FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    }
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      const msg = err?.response?.data?.msg;
      if (msg === "update address details in company info") {
    detailUpdateAlert(dispatch, msg);
  }else if(err?.response?.status === 409){
        LotExistAlert(dispatch)
      }else{
      ErrorAlert(dispatch, err);
      }
      errormsg(sample);
      if (setDisable) {
        setDisable(false);
      }
    }
  };

  export const set_searchPurchasePayablesAction = (data) => {
    return {
      type: RECEIVED_PURCHASES,
      payload: data,
    };
  };

  export const searchPurchasePayablesAction = (
    val,
    commoncookie,
    headerLocationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
  ) => {
    return {
      type: GET_SEARCH_RECEIVED_PURCHASES,
      data: {body: val, employeeId: commoncookie, headerLocationId: headerLocationId},
      setModalTypeHandler,
      setLoaderStatusHandler,
    };
  };


  export const listPurchasesPaginateAction =
  (
    data,
    employee_id,
    headerLocationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
    editReceivingId
    // resdata
  ) =>
  async (dispatch) => {
    try {
      //ListLoad(setModalTypeHandler, setLoaderStatusHandler);
       dispatch({
                type: RESET_LIST_PURCHASES_PAGINATION,
                payload: [],
              });
      const res = await PurchasesService.getPurchasesByPagination(data,employee_id, headerLocationId);
      if (res.status === 200) {
        // dispatch({
        //   type: LIST_PURCHASES_FILTER,
        //   payload: res.data.data,
        // });
        
        dispatch({
          type: LIST_PURCHASES_PAGINATION,
          payload: res.data,
        });
        //console.log(res.data,'bbbb');
        
        // dispatch(
        //   getSupplierDetailsByIdreceivings_itemsAction(
        //     res.data?.data[0]?.supplier_id,
        //     {receiving_id: editReceivingId ? editReceivingId : res.data?.data[0]?.receiving_id},
        //     (supplierDetails) => {
        //       console.log(supplierDetails, 'supplierDetails');
        //     },
        //   ),
        // );
      }
      //console.log(resdata,res.data[0],'vvvvv');
      
      // if(resdata){
      //   resdata(res.data[0])
      // }
      //FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const DailyreportpurchaseAction =
  (
    employee_id,
    headerLocationId,
    date
  ) =>
  async (dispatch) => {
    try {
      const res = await PurchasesService.getdailyreportpurchase(employee_id, headerLocationId, date);
      if (res.status === 200) {
        // dispatch({
        //   type: LIST_PURCHASES_FILTER,
        //   payload: res.data.data,
        // });
        
        dispatch({
          type: PURCHASE_DAILY_REPORT,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const GetTdsTaxes = (type, id) =>
  async (dispatch,) => {
    try {
      const res = await PurchasesService.gettdstax(type, id);
      if (res.status === 200) {  
        dispatch({
          type: TDS_TAX_RATE,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getbyidPurchasesAction =
  (id, response) => async (dispatch) => {
    try {
      const res = await PurchasesService.get(id);
      // dispatch({
      //   type: GET_ID_PURCHASES,
      //   payload: res.data,
      // });
      response(res.data)
      return Promise.resolve(res.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
    }
  };

export const updatePurchasesAction =
  (
    id,
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
    insertId,
    sample,
    mailData,
    employee_id,
    headerLocationId,
    bodyData,
  ) =>
  async (dispatch) => { 
    console.log('bodydataaa', bodyData)
   
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PurchasesService.update(
        id,
        data,
        employee_id,
        headerLocationId,
      );
      
      if (insertId) {
        
        insertId(res.data.insertId);
      }
      const ress = await PurchasesService.purchaseReceived(
        bodyData,
        employee_id,
        headerLocationId,
      );

      dispatch({
        type: EDIT_PURCHASES,
        payload: res.data.data,
      });

      dispatch({
        type: RECEIVED_PURCHASES,
        payload: ress.data,
      });
      if(sample){
        sample(false)
      }

      UpdateAlert(dispatch);
      // successmsg(sample);
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      
      console.log("vfhhytu");
      
      return Promise.resolve({ ...res.data.data, insertId: res.data.insertId });
    } catch (err) {
      console.log(err,"err")
      if (
        err?.message?.includes('Lot Number Already Exists') ||
        err?.response?.data?.message?.includes('Lot Number Already Exists')
      ) {
        alreadyExistAlert(dispatch, err);
      } else {
        FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        ErrorAlert(dispatch, err);
        errormsg(sample);
      }
    }
  };

export const deletePurchasesAction =
  (
    id,
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
    employee_id,
    headerLocationId,
    callBack,
  ) =>
  async (dispatch) => {
    // deleteAction(PurchasesService, DELETE_PURCHASES,  dispatch, id,setModalTypeHandler,setLoaderStatusHandler)
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PurchasesService.delete(
        id,
        data,
        employee_id,
        headerLocationId,
      );
      if (res.status === 200 && res.statusText === 'OK') DeleteAlert(dispatch);
      dispatch({
        type: DELETE_PURCHASES,
        payload: res.data,
      });
      if (callBack) {
        callBack(true);
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve(res.data.data);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      if (callBack) {
        callBack(false);
      }
      // }
    }
  };

export const paymentview =
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
      const res = await PurchasesService.purchaseReceived(
        data,
        employee_id,
        headerLocationId,
      );

      // console.log(res,'rewdsoisafdjosa')
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200 && res.data.export !== 'Export' ) {
        dispatch({
          type: RECEIVED_PURCHASES,
          payload: res.data,
        });
      }
       if (response) {
          response(res.data);
        }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const paymentviewPending =
  (
    data,
    employee_id,
    headerLocationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
  ) =>
  async (dispatch) => {
    try {
      const res = await PurchasesService.purchaseReceivedPending(
        data,
        employee_id,
        headerLocationId,
      );
      
      if (res.status === 200) {
        dispatch({
          type: RECEIVED_PURCHASES_PENDING,
          payload: res.data,
        });
      }
      return res.data;
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const completedpaymentview =
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
      const res = await PurchasesService.completedpurchaseReceived(
        employee_id,
        headerLocationId,
        data
      );
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: COMPLETED_RECEIVED_PURCHASES,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  }; 

  export const get_completedpaymentview = (employee_id,
    headerLocationId,
    body,
    setModalTypeHandler,
    setLoaderStatusHandler) =>{
    return {
      type:GET_SEARCH_COMPLETED_PAYMENT_VIEW,
      employee_id,
      headerLocationId,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

  export const set_completedpaymentview = (data) => {
    return {
      type:COMPLETED_RECEIVED_PURCHASES,
      payload:data
    }
  };

  export const PurchaseAdvanceEntry =
  (
    data,
    response
    // setModalTypeHandler,
    // setLoaderStatusHandler,
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PurchasesService.AdvanceEntry(
        data
      );
      if (res.status === 200) {
        dispatch({
          type: PURCHASE_ADVANCE_ENTRY,
          payload: res.data,
        });
        if(response){
          response(res.status, res)
        }
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


  export const getPayablesBySupplierIdAction =
  (
    employee_id,
    headerLocationId,
    supplierId,
    setPaybleData
  ) =>
  async (dispatch) => {
    try {

      const res = await PurchasesService.payablesBySupplierId(employee_id, headerLocationId, supplierId);
      if (res.status === 200) {
        setPaybleData(res.data)
      }
      return Promise.resolve("API_FINISHED_SUCCESS");

    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const paymentEntry =
  (data, body, employee_id, headerLocationId, setLoaderStatusHandler, response) =>
  async (dispatch) => {
    try {
      ListLoad(true, setLoaderStatusHandler);
      const res = await PurchasesService.paymentEntry(
        data,
        employee_id,
        headerLocationId,
      );
      const ress = await PurchasesService.purchaseReceived(
        body,
        employee_id,
        headerLocationId,
      );
      dispatch({
        type: ENTRY_PURCHASES,
        payload: res.data,
      });
      dispatch({
        type: RECEIVED_PURCHASES,
        payload: ress.data,
      });
      if (response) {
        response(res.status);
      }
      CreateAlert(dispatch);
      FailLoad(true, setLoaderStatusHandler);
    } catch (err) {
      FailLoad(true, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
    }
  };

export const payablesPaymentEntry =
  (data, setModalTypeHandler, setLoaderStatusHandler, response) =>
  async (dispatch) => {
    try {
      ListLoad(true, setModalTypeHandler, setLoaderStatusHandler);
      const res = await PurchasesService.payablesPaymentEntry(data);
      if (res.status === 200) {
        dispatch({
          type: PAYABLES_PAYMENT_ENTRY,
          payload: res.data,
        });
        CreateAlert(dispatch);
        if (response) {
          response(res.status, res.data);
        }
      }
      FailLoad(true, setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      FailLoad(true, setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
    }
  };

export const updatePayablePaymentEntry =
  (data, setModalTypeHandler, setLoaderStatusHandler, response) =>
  async (dispatch) => {
    try {
      ListLoad(true, setModalTypeHandler, setLoaderStatusHandler);
      const res = await PurchasesService.updatePayablePaymentEntry(data);
      if (res.status === 200) {
        dispatch({
          type: RECEIVED_PURCHASES,
          payload: res.data,
        });
        CreateAlert(dispatch);
        if (response) {
          response(res.status);
        }
      }
      FailLoad(true, setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      FailLoad(true, setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
    }
  };

export const posSequence =
  (id, data, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(true, setLoaderStatusHandler)
      const res = await PurchasesService.posSequence(id, data);
      if (res.status === 200) {
        dispatch({
          type: LIST_STOCK_LOCATION,
          payload: res.data,
        });
        // CreateAlert(dispatch)
      }
      // FailLoad(true, setLoaderStatusHandler)
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(true, setLoaderStatusHandler)
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const potCodeAction =
  (id, setLoaderStatusHandler, response) => async (dispatch) => {
    try {
      // ListLoad(true, setLoaderStatusHandler)
      const res = await PurchasesService.potCodeGet(id);
      if (res.status === 200) {
      dispatch({
        type: LIST_POTCODE,
        payload: res.data,
      });
      response(res.status)
      // CreateAlert(dispatch)
       }
      // FailLoad(true, setLoaderStatusHandler)
    } catch (err) {
      // FailLoad(true, setLoaderStatusHandler)
      ErrorAlert(dispatch, err);
    }
  };

export const potCodeUpdateAction =
  (id, data, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(true, setLoaderStatusHandler)
      await PurchasesService.potCodeUpdate(id, data);
      // if (res.status === 200) {
      // dispatch({
      //   type: LIST_POTCODE,
      //   payload: res.data,
      // });
      // CreateAlert(dispatch)
      // }
      // FailLoad(true, setLoaderStatusHandler)
    } catch (err) {
      // FailLoad(true, setLoaderStatusHandler)
      ErrorAlert(dispatch, err);
    }
  };

export const receivingsPayments =
  (id, data, response, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(true, setLoaderStatusHandler);
      const res = await PurchasesService.receivingsPayments(id, data);
      if (response) {
        response(res.status);
      }
      // CreateAlert(dispatch)
      FailLoad(true, setLoaderStatusHandler);
    } catch (err) {
      FailLoad(true, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
    }
  };

export const consolidatedPayables =
  (id,data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PurchasesService.purchaseConsolidated(id,data);
      if (res.status === 200) {
        dispatch({
          type: CONSOLIDATED_PURCHASES,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const returnActions =
  (data, setLoaderStatusHandler, employee_id, headerLocationId, callback, onError) =>
  async (dispatch) => {
    try {
      ListLoad(true, setLoaderStatusHandler);
      const res = await PurchasesService.return(
        data,
        employee_id,
        headerLocationId,
      );
      dispatch({
        type: LIST_PURCHASES,
        payload: res.data,
      });
      FailLoad(true, setLoaderStatusHandler);
      if(callback){
        callback(res.data)
      }
    } catch (err) {
      if(err.response.data.status === 'LOT_UNAVAILABLE'){
        NotAvailableAlert(dispatch, err)
      }else{
        ErrorAlert(dispatch, err);
      }
      FailLoad(true, setLoaderStatusHandler);
      if (onError) onError(err);
    }
  };

export const stockUploadAction =
  (data, setLoaderStatusHandler, status) => async (dispatch) => {
    try {
      // ListLoad(true, setLoaderStatusHandler);
      const res = await PurchasesService.stockUpload(data);
      if(res.data.affectedRows === 0 ){
        ProductDeleteAlert(dispatch,'No Lot Inserted')
      }
      // else{
      //   UpdateAlert(dispatch)
      // }
      if(status){
        status(res.status)
      }
      dispatch({
        type: STOCK_UPLOAD_LIST,
        payload: res.data,
      });

      // const inv = await Inventoryservice.postById(
      //   {
      //     product_name:'',
      //     gb:'',
      //     brand: '',
      //     category: '',
      //     max_price: '',
      //     min_price: '',
      //     location_id: data.location_id,
      //     user_id: data.employee_id,
      //     pageCount: 0,
      //     numPerPage: 20,
      //   },
      //   data.employee_id,
      //   data.location_id,
      // );
      const pro = await Productservice.getAll();
      // dispatch({
      //   type: LIST_PURCHASES,
      //   payload: res.data,
      // });
      // dispatch({
      //   type: LIST_INVENTORY_BY_ID,
      //   payload: inv.data.data,
      // });
      dispatch({
        type: LIST_PRODUCT,
        payload: pro.data,
      });


      const res1 = await Inventoryservice.getsearchdata(
        data.employee_id,
        data.location_id,
        {
          supplier_name : '',
          product_name:'',
          gb:'',
          brand: '',
          category: '',
          max_price: '',
          min_price: '',
          location_id: data.location_id,
          user_id: data.employee_id,
          pageCount: 0,
          numPerPage: 20,
          searchString: '',
          type: 'All',
          sortKey: "total", 
         sortOrder: "desc"
        }
      );
      dispatch({
        type: SET_SEARCH_INVENTORY,
        payload: res1.data,
      });
      // FailLoad(true, setLoaderStatusHandler);
      // CreateAlert(dispatch);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      // FailLoad(true, setLoaderStatusHandler);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const listPurchasesFilterAction =
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
      const res = await PurchasesService.getFilterAll(
        data,
        employee_id,
        headerLocationId,
      );
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: LIST_PURCHASES_FILTER,
          payload: res.data,
        });
        if (exportDataCallBack) {
          exportDataCallBack(res.data);
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (exportDataCallBack) {
        exportDataCallBack([]);
      }
      ErrorAlert(dispatch, err);
      //}
    }
    return Promise.reject("API_FINISHED_ERROR");
  };


  export const listReceivableCompareAction =
  () =>
  async (dispatch) => {
    try {
      const res = await PurchasesService.receivableCompare();
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: PURCHASE_RECEIVABLE,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const listPurchaseCompareAction =
  () =>
  async (dispatch) => {
    try {
      const res = await PurchasesService.purchaseCompare();
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: COMPARE_PURCHASE,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  
  // export const paginatedPurchaseReportAction = (employee_id, headerLocationId, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
  //   try {
  //     ListLoad(setModalTypeHandler, setLoaderStatusHandler)
  //     const res = await PurchasesService.getPurchaseReport(employee_id, headerLocationId);
  //     if (res.status === 200) {
  //       dispatch({
  //         type: LIST_PURCHASE_REPORT,
  //         payload: res.data.data,
  //       });
  //       dispatch({
  //         type: PAGINATED_PURCHASE_REPORT,
  //         payload: res.data.numRows,
  //       });
  //     }
  //     FailLoad(setModalTypeHandler, setLoaderStatusHandler)
  //   } catch (err) {
  //     FailLoad(setModalTypeHandler, setLoaderStatusHandler)
  //     ErrorAlert(dispatch,err)
  //   }
  // };

  export const getAgewiseAction = (employee_id, headerLocationId, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler)
      const res = await PurchasesService.getagewisepayable(employee_id, headerLocationId);
      if (res.status === 200) {
        dispatch({
          type: LIST_AGEWISE_PAYABLES,
          payload: res.data,
        });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      ErrorAlert(dispatch,err)
    }
  };

  export const getPurchaseReportAction =
  (
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PurchasesService.getPurchaseAllReport(data);
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: GET_PURCHASE_REPORT,
          payload: res.data.data,
        });
        dispatch({
          type: TOTAL_PURCHASE_REPORT_COUNT,
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

  export const exportDatareportAction =
  (
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
    exportDataCallBack
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PurchasesService.exportDatapurchasereport(data);
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
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
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const filterPurchaseReportAction = (employee_id, headerLocationId, setModalTypeHandler, setLoaderStatusHandler,exportDataCallBack) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler)
      const res = await PurchasesService.filterPurchaseReport(employee_id, headerLocationId);
      if (res.status === 200) {
        dispatch({
          type: FILTER_PURCHASE_REPORT,
          payload: res.data,
        });
        if (exportDataCallBack) {
          exportDataCallBack(res.data);
        }
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      ErrorAlert(dispatch,err)
      if (exportDataCallBack) {
        exportDataCallBack([]);
      }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const printLabelAction =
  (data,setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      ListLoad(true,setModalTypeHandler, setLoaderStatusHandler);
      const res = await PurchasesService.printLabel(
        data
      );
      dispatch({
        type: PRINT_LABEL,
        payload: res.data,
      });
      FailLoad(true, setModalTypeHandler,setLoaderStatusHandler);
    } catch (err) {
      ErrorAlert(dispatch, err);
      FailLoad(true,setModalTypeHandler, setLoaderStatusHandler);
    }
  };


  export const get_searchPurchaseAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
    return {
      type:GET_SEARCH_PURCHASE,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

  export const set_searchPurchaseAction = (data) => {
    return {
      type:SET_SEARCH_PURCHASE,
      payload:data
    }
  };

  // reports -> purchase report

  export const searchPurchaseReportState = (data) => {
    return {
      type: SET_SEARCH_PURCHASE_REPORT,
      payload: data
    }
  };
  
  export const searchPurchaseReportAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: GET_SEARCH_PURCHASE_REPORT,
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };
  export const getSearchPayableReportAction = (body) =>{
    return {
      type:GET_SEARCH_PAYABLE_REPORT,
      body
    }
  };

  export const setSearchPayableReportAction = (data) => {
    return {
      type:SET_SEARCH_PAYABLE_REPORT,
      payload:data
    }
  };

  export const PurchaseReportfinalDataAction = (data) => async (dispatch) => {
    try {
      const res = await PurchasesService.searchPurchaseReport(data);
      if (res.status === 200) {
        dispatch({
          type: SET_SEARCH_PURCHASE_REPORT,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const PayableReportFinalAction = (data) => async (dispatch) => {
    try {
      const res = await PurchasesService.payablereport(data);
      if (res.status === 200) {
        dispatch({
          type: SET_SEARCH_PAYABLE_REPORT,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const searchPaginationAction = (data) => async (dispatch) => {
    try {
      const res = await PurchasesService.searchPurchase(data);
      if (res.status === 200) {
        dispatch({
          type: SET_SEARCH_PURCHASE,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch,err)
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getBarCodeQrSeq = (payload) => async (dispatch) => {
    try{
      const res = await PurchasesService.getBarCodeQrSeq(payload)

      if(res.status === 200){
        dispatch({
          type: BARCODE_QR_SEQUENCE,
          payload: res.data
        })
      }
      return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
      ErrorAlert(dispatch, err)
      return Promise.reject("API_FINISHED_ERROR");
    }
  }

  export const listPayablesAction =
  (
    data,
    employee_id,
    headerLocationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
  ) =>
  async (dispatch) => {
    try {

      console.log()
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PurchasesService.purchaseReceived(
        data,
        employee_id,
        headerLocationId,
      );
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: RECEIVED_PURCHASES,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getPurchaseOrderByVendorAction = (data) => async(dispatch) => {
  try{
    const res = await PurchasesService.purchaseOrderByVendor(data)
    console.log(res.data, "console1")
    if(res.status === 200){
      dispatch({
        type: PURCHASE_ORDER_BY_VENDOR,
        payload: res.data
      })
    }
    return Promise.resolve({status: "API_FINISHED_SUCCESS", data: res.data})
  }
  catch(err){
    return Promise.resolve({status: "API_FINISHED_ERROR", data: []})
  }
}

export const getProductPurchaseHistoryAction = (id) => async(dispatch) => {
  try{
    const res = await PurchasesService.getProductPurchaseHistory(id)
    if(res.status === 200){
      dispatch({
        type: GET_PRODUCT_PURCHSE_HISTORY,
        payload: res.data
      })
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const getAllPaymentsAction = () => async(dispatch) => {
  try{
    const res = await PurchasesService.getAllPayments()
    if(res.status === 200){
      dispatch({
        type: GET_ALL_PAYMENTS,
        payload: res.data
      })
    }
    return Promise.resolve('API_FINISHED_SUCCESS')
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve('API_FINISHED_ERROR')
  }
}

export const getPaymentsByIdAction = (id) => async(dispatch) => {
  try{
    const res = await PurchasesService.getPaymentsById(id)
    if(res.status === 200){
      dispatch({
        type: GET_PAYMENTS_BY_ID,
        payload: res.data
      })
    }
    return Promise.resolve('API_FINISHED_SUCCESS')
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve('API_FINISHED_ERROR')
  }
}

export const setPaymentsByIdAction = (data) => {
    return {
      type : GET_PAYMENTS_BY_ID,
      payload : data
    }
}

export const triggerBillsModel = (shouldOpen) => {
  return {
    type: BILLS_MODAL,
    payload: shouldOpen,
  }
}

export const triggerPOsModal = (shouldOpen) => {
  return {
    type: PO_MODEL,
    payload: shouldOpen,
  }
};

export const vendorTotalPurchaseAmountAction =
  (
    supplierId
  ) =>
  async (dispatch) => {
    try {

      const res = await PurchasesService.vendorTotalPurchaseAmount(supplierId);
      if(res.status === 200){
        dispatch({
          type: GET_VENDOR_PURCHASES_AMOUNT,
          payload: res.data
        })
      }
      return Promise.resolve("API_FINISHED_SUCCESS");

    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const purchaseAdvanceEntryEdit = (data, response) => async (dispatch) => {
    try {
      const res = await PurchasesService.advanceEntryEdit(data)
      if (res.status === 200) {
        dispatch({
          type: PURCHASE_ADVANCE_ENTRY,
          payload: res.data,
        });
        if(response){
          response(res.status)
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS")
    } catch (err) {
      ErrorAlert(dispatch, err)
      return Promise.resolve("API_FINISHED_ERROR")
    }
  }

export const payablesPaymentEntryEdit = (data, response) => async (dispatch) => {
  try {
    const res = await PurchasesService.payablesPaymentEntryEdit(data);
    if (res.status === 200) {
      dispatch({
        type: PAYABLES_PAYMENT_ENTRY,
        payload: res.data,
      });
      UpdateAlert(dispatch);
      if (response) {
        response(res.status, res.data);
      }
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.resolve("API_FINISHED_ERROR")
  }
};

export const checkInvoiceNumberExistAction = (data, response) => async(dispatch) => {
  try{
    const res = await PurchasesService.checkInvoiceNumberExist(data)
    if(res.status === 200){
      dispatch({
        type: INVOICE_NUMBER_EXIST,
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

export const purchaseSummaryAction = (data, setModalTypeHandler, setLoaderStatusHandler) => async(dispatch) => {
  try{
    const res = await PurchasesService.purchaseSummary(data)
    if(res.status === 200){
      dispatch({
        type: PURCHASE_SUMMARY,
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


  export const get_purchaseSummaryAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
    return {
      type:GET_PURCHASE_SUMMARY,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

  export const set_purchaseSummaryAction = (data) => {
    return {
      type:PURCHASE_SUMMARY,
      payload:data
    }
  };

export const vendorRefundEntryAction = (payload, response) => async(dispatch) => {
  try{
    const res = await PurchasesService.vendorRefundEntry(payload)
    if(res.status === 200){
      CreateAlert(dispatch)
      dispatch({
        type: VENDOR_REFUND_ENTRY,
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

export const editVendorRefundEntryAction = (payload, id, response) => async(dispatch) => {
  try{
    const res = await PurchasesService.editVendorRefundEntry(payload, id)
    if(res.status === 200){
      UpdateAlert(dispatch)
      dispatch({
        type: VENDOR_REFUND_ENTRY_EDIT,
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

export const supplierTimelineDataAction = (type,id, response) => async(dispatch) => {
  try{
    const res = await PurchasesService.supplierTimelineData(type,id)
    if(res.status === 200){
      dispatch({
        type: SUPPLIER_TIMELINE_DATA,
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