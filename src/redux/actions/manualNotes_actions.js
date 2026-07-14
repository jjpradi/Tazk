import {
  LIST_MANUAL_NOTES,
  CREATE_MANUAL_NOTES,
  DELETE_MANUAL_NOTE,
  DELETE_ALL_MANUAL_NOTES,
  UPDATE_MANUAL_NOTE,
  SEQUENCE_CREDIT_DEBIT,
  RECENT_CREDIT_DEBIT_NOTES,
  SCHEMES_LEDGER,
  MANUAL_SALES_PURCHASE,
  MANUAL_NOTES,
  GET_ALL_CREDIT_NOTES,
  GET_CREDIT_NOTES_RECEIPTS_BY_ID,
  SCHEMES_LEDGER_PARENT,
  MANUAL_SALES_RETURN,
  MANUAL_TIMELINE,
  GET_ALL_DEBIT_NOTES
} from '../actionTypes';
import ManualNotesService from '../../services/manualNotes_services';
import {
  ErrorAlert,
  FailLoad,
  ListLoad,
  successmsg,
  errormsg,
  CreateAlert,
  DeleteAlert,
  ExistAlert,
  UpdateAlert,
  commontoast,
} from './load';

export const manualNotesCreationAction =
  (data, setModalTypeHandler, setLoaderStatusHandler, id, datas) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ManualNotesService.create(data);
      if (res.status === 200 && res.data.status !== 'exists') {
        CreateAlert(dispatch);
        dispatch({
          type: LIST_MANUAL_NOTES,
          payload: res.data,
        });
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve(res.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.iris?.message ||
        null;

      if (apiMessage) {
        commontoast(dispatch, apiMessage);
      } else {
        ErrorAlert(dispatch, err);
      }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const listManualNotesAction =
  (setModalTypeHandler, setLoaderStatusHandler, data, exportDataCallBack,isExport = false) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ManualNotesService.getAll(data);
      if (res.status === 200) {
        if (!isExport) {
          dispatch({
            type: LIST_MANUAL_NOTES,
            payload: res.data,
          });
        }
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
    }
  };

export const ManualSalesPurchase =
  ( data, response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ManualNotesService.ManualcreditSalesPurchase(data);
      if (res.status === 200) {
        dispatch({
          type: MANUAL_SALES_PURCHASE,
          payload: res.data,
        });
       if( response) {
        response(res.data)
       }
       
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      // if (exportDataCallBack) {
      //   exportDataCallBack([]);
      // }
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const sequenceAction = () => async (dispatch) => {
    try {

      const res = await ManualNotesService.getsequence();
      if (res.status === 200) {
        dispatch({
          type: SEQUENCE_CREDIT_DEBIT,
          payload: res.data,
        });
      }

      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {

      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const deleteManualNoteAction =
  (type, id, payload,setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ManualNotesService.delete(type, id,payload);
      if (res.status === 200) {
        if(res.data?.check_status !== undefined){
          commontoast(dispatch, 'Amount Already Used')
        }else{
        DeleteAlert(dispatch);
        dispatch({
          type: DELETE_MANUAL_NOTE,
          payload: res.data,
        });
      }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve(res.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const deleteAllManualNotesAction =
  (type, id, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ManualNotesService.deleteAllNotes(type, id);
      if (res.status === 200) {
        DeleteAlert(dispatch);
        dispatch({
          type: DELETE_ALL_MANUAL_NOTES,
          payload: res.data,
        });
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve(res.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const updateManualNotesAction =
  (data, id, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ManualNotesService.update(data, id);
      if (res.status === 200) {
        if(res.data?.check_status !== undefined){
          commontoast(dispatch, 'Amount Already Used')
        }else{
        
        UpdateAlert(dispatch);
        dispatch({
          type: LIST_MANUAL_NOTES,
          payload: res.data,
        });
      }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve(res.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


  export const listManualNotesPaginationAction =
  (data,setModalTypeHandler, setLoaderStatusHandler, exportDataCallBack,isExport = false) => async (dispatch) => {
    try {
      const res = await ManualNotesService.getPaginate(data);
      if (res.status === 200) {
        if (!isExport) {
           dispatch({
          type: LIST_MANUAL_NOTES,
          payload: res.data,
        });
        }
        if (exportDataCallBack) {
          exportDataCallBack(res.data?.data);
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
    };
  
export const recentCreditDebitNotesAction = (data) => async (dispatch) => {
  try {
      const res = await ManualNotesService.recentCreditDebitNotes(data);
      if (res.status === 200) {
        dispatch({
          type: RECENT_CREDIT_DEBIT_NOTES,
          payload: res.data,
        });
      }
      return Promise.resolve({status: "API_FINISHED_SUCCESS", data: res.data});
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.resolve({status: "API_FINISHED_ERROR", data: []});
    }
  };



  export const getSchemesLedgerAction = (data,setCreatedDataInAutoComplete) => async (dispatch) => {
    try {
      const res = await ManualNotesService.getSchemesLedger(data);
      if (res.status === 200) {
        dispatch({
          type: SCHEMES_LEDGER,
          payload: res.data,
        });
        if (setCreatedDataInAutoComplete) {
          // console.log("setCreatedDataInAutoComplete")
          setCreatedDataInAutoComplete(res.data)
        }
       return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getSchemesLedgerParentAction = (data) => async (dispatch) => {
    try {
      const res = await ManualNotesService.getSchemesLedgerParent(data);
      if (res.status === 200) {
        dispatch({
          type: SCHEMES_LEDGER_PARENT,
          payload: res.data,
        });
        
      }
      return Promise.resolve(res.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const createSchemesLedgerAction = (data,setCreatedDataToAutoComplete) => async (dispatch) => {
    try {
      const res = await ManualNotesService.createSchemesLedger(data);
      if (res.status === 200) {
        dispatch({
          type: SCHEMES_LEDGER,
          payload: res.data,
        });
        if (setCreatedDataToAutoComplete) {
          setCreatedDataToAutoComplete(res.data)
        }
       return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getManualNoteSchemesByIdAction = (type, id, response, data = {}) => async (dispatch) => {
    try {
      const res = await ManualNotesService.getManualNoteSchemesById(type, id, data);
      if (res.status === 200) {
    dispatch({
          type: MANUAL_NOTES,
          payload: res.data,
        });
        if (response) {
          response(res.data)
        }
       return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getAllCreditNotesAction = () => async (dispatch) => {
    try {
      const res = await ManualNotesService.getAllCreditNotes()
      if(res.status === 200) {
        dispatch({
          type : GET_ALL_CREDIT_NOTES,
          payload : res.data
        })
      }
      return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err) {
      ErrorAlert(dispatch, err)
      return Promise.resolve('API_FINISHED_ERROR')
    }
  }

  export const getCreditNotesReceiptsByIdAction = (id) => async (dispatch) => {
    try {
      const res = await ManualNotesService.getCreditNotesReceiptsById(id)
      if(res.status === 200) {
        dispatch({
          type : GET_CREDIT_NOTES_RECEIPTS_BY_ID,
          payload : res.data
        })
      }
      return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err) {
      ErrorAlert(dispatch, err)
      return Promise.resolve('API_FINISHED_ERROR')
    }
  }

  export const setCreditNotesReceiptsByIdAction = (data) => {
    return {
      type : GET_CREDIT_NOTES_RECEIPTS_BY_ID,
      payload : data
    }
  }

export const ManualcreditSalesReturnAction = ( data, response) => async (dispatch) => {
      try {
          const res = await ManualNotesService.ManualcreditSalesReturn(data)
          if (res.status === 200) {
              dispatch({
                type : MANUAL_SALES_RETURN,
                payload : res.data
              })
            if( response) {
              response(res.data)
            }
          }
        return Promise.resolve("API_FINISHED_SUCCESS")
      } 
      catch (err) {
        ErrorAlert(dispatch, err)
        return Promise.reject("API_FINISHED_ERROR")
      }
  };

  export const creditNotesTimelineAction = ( data, response) => async (dispatch) => {
      try {
          const res = await ManualNotesService.creditNotesTimeline(data)
          if (res.status === 200) {
              dispatch({
                type : MANUAL_TIMELINE,
                payload : res.data
              })
            if( response) {
              response(res.data)
            }
          }
        return Promise.resolve("API_FINISHED_SUCCESS")
      } 
      catch (err) {
        ErrorAlert(dispatch, err)
        return Promise.reject("API_FINISHED_ERROR")
      }
};

export const cancelManualIrnAction = (data) => async (dispatch) => {
  try {
    const res = await ManualNotesService.cancelManualIrn(data);
    if (res.status === 200) {
      UpdateAlert(dispatch);
    }
    return Promise.resolve(res.data);
  } catch (err) {
    const apiMessage =
      err?.response?.data?.message ||
      err?.response?.data?.iris?.message ||
      null;
    if (apiMessage) {
      commontoast(dispatch, apiMessage);
    } else {
      ErrorAlert(dispatch, err);
    }
    return Promise.reject("API_FINISHED_ERROR");
  }
};
  
 export const getAllDebittNotesAction = () => async (dispatch) => {
    try {
      const res = await ManualNotesService.getAllDebittNotes()
      if(res.status === 200) {
        dispatch({
          type : GET_ALL_DEBIT_NOTES,
          payload : res.data
        })
      }
      return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err) {
      ErrorAlert(dispatch, err)
      return Promise.resolve('API_FINISHED_ERROR')
    }
  }
