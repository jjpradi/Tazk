import {
  LIST_BANK_CREATION,
  CREATE_BANK_CREATION,
  TOTAL_BANK_COUNT,
  EDIT_BANK_CREATION,
  DELETE_BANK_CREATION,
  LIST_BANK_CREATION_ADJUSTMENT,
  LIST_BANK_CREATION_BY_PAGINATION,
  GET_BANK_RECONCILIATION,
  GET_BANK_ACCOUNTS,
  GET_BANK_RECONCILIATION_TABLE,
  CREATE_BANK_RECONCILIATION_TABLE,
  DELETE_BANK_RECONCILIATION,
  GET_MATCHED_RECONCILIATION_TABLE,
  BANK_WITH_LEDGER,
  BANK_STATEMENT_COLUMN,
  GET_SEARCH_BANK,
  SET_SEARCH_BANK,
  GET_CONTRA_BANK,
  GET_SEARCH_BANK_RECONCILIATION,
  SET_SEARCH_BANK_RECONCILIATION,
  SET_BANK_ID,
  SELECTED_TRANSACTION,
  SET_PAY_IN_OUT_TRANSACTION_COUNT,
  EXTRAS,
  GET_RECORDS,
  OVERALL_COUNT_AND_TOTAL,
  UNRECONCILED_AND_RECONCILED,
  SET_MANUAL_MATCH_RECORDS,
  GET_MANUAL_MATCH_RECORDS,
  UPADTE_RECONCILED,
  GET_ALL_BANK_ACCS,
  GET_ALL_BANKRECONCILIATION,
  SET_ALL_BANKRECONCILIATION,
  SET_BANK_RECONCILIATION_API_CALL
} from '../actionTypes';
import BankCreation from '../../services/bankCreaction_services';
import {
  CreateAlert,
  ErrorAlert,
  FailLoad,
  ListLoad,
  UpdateAlert,
  DeleteAlert,
  alreadyExists,
  CannotDeleteAlert,
  matchedTransactionAlert,
} from './load';
import BankReconciliation from 'pages/accounts/BankReconciliation';

export const listBankCreationAction =
  (setModalTypeHandler, setLoaderStatusHandler, exportDataCallBack) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await BankCreation.getAll();
      if (res.status === 200) {
        dispatch({
          type: LIST_BANK_CREATION,
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
    }
  };

  export const BankwithledgerAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await BankCreation.getwithledger();
      if (res.status === 200) {
        dispatch({
          type: BANK_WITH_LEDGER,
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

export const listBankCreationByPaginationAction =
  (setModalTypeHandler, setLoaderStatusHandler, data) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await BankCreation.getByPagination(data);
      if (res.status === 200) {
        dispatch({
          type: SET_SEARCH_BANK,
          payload: res.data,
        });
        // dispatch({
        //   type: TOTAL_BANK_COUNT,
        //   payload: res.data.numRows,
        // });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const createBankCreationAction =
  (data, setModalTypeHandler, setLoaderStatusHandler, responseDialog) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await BankCreation.create(data);
      if (res.status === 200 && res.data.status !== 'exists') {
        CreateAlert(dispatch);
        dispatch({
          type: CREATE_BANK_CREATION,
          payload: res.data.data,
        });
        dispatch({
          type: TOTAL_BANK_COUNT,
          payload: res.data.numRows,
        });
        responseDialog(true);
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      } else if (res.data.status === 'exists') {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        // alertResponce("Already Exists", 'error')
      }
      return Promise.resolve(res.data);
      // return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

// export const listCashBoxAction = (setModalTypeHandler,setLoaderStatusHandler) => async (dispatch) => {
//     try {
//         ListLoad(setModalTypeHandler,setLoaderStatusHandler)
//         const res = await CashBox.getAllCashBox();
//         if(res.status===200){
//         dispatch({
//             type: LIST_CASH_BOX,
//             payload: res.data,
//         });
//        }
//        FailLoad(setModalTypeHandler,setLoaderStatusHandler)
//     } catch (err) {
//             FailLoad(setModalTypeHandler,setLoaderStatusHandler)
//             ErrorAlert(dispatch,err)
//     }
// };

export const updateBankCreationAction =
  (id, data, setModalTypeHandler, setLoaderStatusHandler, sample) =>
  async (dispatch) => {
    //  updateAction(PosCreationservice, EDIT_SCHEMES, dispatch, id, data,setModalTypeHandler,setLoaderStatusHandler)
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await BankCreation.updateBankCreation(id, data);
      //    if (res.status === 200 && res.data.affectedRows>0){
      UpdateAlert(dispatch);
      dispatch({
        type: EDIT_BANK_CREATION,
        payload: res.data.data,
      });
      if (sample) {
        sample(true);
      }
      dispatch({
        type: TOTAL_BANK_COUNT,
        payload: res.data.data.numRows,
      });
      //    }else{
      //    ErrorAlert(dispatch,{message:"Not exists"})
      //    }

      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      // return Promise.resolve(res.data);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //   return Promise.reject(err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const deleteBankCreationAction =
  (id, setModalTypeHandler, setLoaderStatusHandler, sample) =>
  async (dispatch) => {
    // deleteAction(BankCreation, DELETE_BANK_CREATION, dispatch, id,setModalTypeHandler,setLoaderStatusHandler)
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await BankCreation.delete(id);
     
      //   if (res.status === 200 && res.statusText === "OK")
      if (res.status == 200) {
        if(res.data.message === 'THE BANK CREATION CANNOT BE DELETED AS IT HAS BEEN IN USE') {
          CannotDeleteAlert(dispatch, res.data)
        }
        else {
          DeleteAlert(dispatch);
          dispatch({
            type: DELETE_BANK_CREATION,
            payload: res.data,
          });
      } 
        if (sample) {
          sample(true);
        }
        dispatch({
          type: TOTAL_BANK_COUNT,
          payload: res.data.numRows,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      //   return Promise.resolve(res.data.data);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const listBankCreationAdjustmentAction =
  (id, setModalTypeHandler, setLoaderStatusHandler, headerLocationId) =>
  async (dispatch) => {
    try {
      //ListLoad(setModalTypeHandler,setLoaderStatusHandler)
      const res = await BankCreation.getAllBankCreationAdjustment(
        id,
        headerLocationId,
      );
      if (res.status === 200) {
        dispatch({
          type: LIST_BANK_CREATION_ADJUSTMENT,
          payload: res.data,
        });
      } //FailLoad(setModalTypeHandler,setLoaderStatusHandler)
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      //FailLoad(setModalTypeHandler,setLoaderStatusHandler)
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

// export const listCashBoxSummary = (id) => async (dispatch) => {
//     try {
//         const res = await CashBox.getCashBoxSummary(id);
//         if(res.status===200){
//         dispatch({
//             type: LIST_CASH_BOX_SUMMARY_DATA,
//             payload: res.data,
//         });
//        }
//     } catch (err) {
//             ErrorAlert(dispatch,err)
//     }
// };

export const listBankReconciliation =
  (id , setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await BankCreation.getBankReconciliation(id);
      if (res.status === 200) {
        dispatch({
          type: GET_BANK_RECONCILIATION,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const listBankAccounts =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await BankCreation.getBankAccounts();
      if (res.status === 200) {
        dispatch({
          type: GET_BANK_ACCOUNTS,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const listBankReconciliationTableAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await BankCreation.getBankReconciliationTable(data);
      if (res.status === 200) {
        dispatch({
          type: GET_BANK_RECONCILIATION_TABLE,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


  export const addBankReconciliationTableAction =
  (data, countAndValuesPayload, listPayload, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await BankCreation.addBankReconciliationTable(data);
      if (res.status === 200) {
        matchedTransactionAlert(dispatch);
        // dispatch({
        //   type: GET_BANK_RECONCILIATION_TABLE,ddsssssssssssssssssssssssssssssssssssssssssssssss
        //   payload: res.data,
        // });
        const countAndValueRes = await BankCreation.getReconciliationCountAndTotal(countAndValuesPayload)
        if(countAndValueRes.status === 200){
          dispatch({
            type: OVERALL_COUNT_AND_TOTAL,
            payload: countAndValueRes.data
          })
        }

        const tableRes = await BankCreation.getUnreconciledAndReconciled(listPayload)
        if(tableRes.status === 200){
          dispatch({
            type: UNRECONCILED_AND_RECONCILED,
            payload: tableRes.data
          })
        }
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getRecordsAction =
  (data,response) => async (dispatch) => {
    try {
    
      const res = await BankCreation.getRecords(data);
      if (res.status === 200) {
        dispatch({
          type: GET_RECORDS,
          payload: res.data,
        });
        if(response){
          response(res.data)
      }
      }
      
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getMatchedReconciliationAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await BankCreation.getMatchedReconciliation(id);
      if (res.status === 200) {
        dispatch({
          type: GET_MATCHED_RECONCILIATION_TABLE,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const deleteBankReconciliationTableAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await BankCreation.deleteBankReconciliationTable(data);
      if (res.status === 200) {
        dispatch({
          type: DELETE_BANK_RECONCILIATION,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getBankStatementColumnNameAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await BankCreation.getBankStatementColumnName();
      if (res.status === 200) {
        dispatch({
          type: BANK_STATEMENT_COLUMN,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const get_searchBankReconciliationAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
    return {
      type:GET_SEARCH_BANK_RECONCILIATION,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

  export const set_searchBankReconciliationAction = (data) => {
    return {
      type:UNRECONCILED_AND_RECONCILED,
      payload:data
    }
  };

  export const get_searchBankAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
    return {
      type:GET_SEARCH_BANK,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

  export const set_searchBankAction = (data) => {
    return {
      type:SET_SEARCH_BANK,
      payload:data
    }
  };

  export const backCreationPaginationAction = (data) => async (dispatch) => {
    try {
      const res = await BankCreation.pagination(data);
      if (res.status === 200) {
        dispatch({
          type: SET_SEARCH_BANK,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  export const listContraBankWithLedgerId = () => async (dispatch) => {
    try {
      const res = await BankCreation.getContraBank();
      if (res.status === 200) {
        dispatch({
          type: GET_CONTRA_BANK,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const setBankId = (id) => {
    return {
      type: SET_BANK_ID,
      payload: id,
    };
  };

  export const selectedTransaction = (data) => {
    return {
      type: SELECTED_TRANSACTION,
      payload: data,
    };
};
  
  export const setTransactionCount = (data) => {
    return {
      type: SET_PAY_IN_OUT_TRANSACTION_COUNT,
      payload: data,
    };
};
  
export const addedPayInOutTransactions = (data) => async (dispatch) => {
  try {
    const res = await BankCreation.addedPayInOutTransactions(data);
    if (res.status === 200) {
      dispatch({
        type: EXTRAS,
        payload: res.data,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const getReconciliationCountAndTotalAction = (payload) => async(dispatch) => {
  try{
    const res = await BankCreation.getReconciliationCountAndTotal(payload)
    if(res.status === 200){
      dispatch({
        type: OVERALL_COUNT_AND_TOTAL,
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

export const getUnreconciledAndReconciledAction = (payload, response) => async(dispatch) => {
  try{
    const res = await BankCreation.getUnreconciledAndReconciled(payload)
    if(res.status === 200){
      dispatch({
        type: UNRECONCILED_AND_RECONCILED,
        payload: res.data
      })
      dispatch({
        type: SET_BANK_RECONCILIATION_API_CALL,
        payload: false
      })
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const setBankReconciliationApiCall = (value) => {
  return{
    type: SET_BANK_RECONCILIATION_API_CALL,
    payload: value
  }
}

export const ListManualMatchRecordsAction = (payload) => async(dispatch) => {
  try{
    const res = await BankCreation.getManualMatchRecords(payload)
    if(res.status === 200){
      dispatch({
        type: SET_MANUAL_MATCH_RECORDS,
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

export const getSearchManualMatchAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type : GET_MANUAL_MATCH_RECORDS,
    body,
    setModalTypeHandler,
    setLoaderStatusHandler
  }
};
 
export const setSearchManualMatchAction = (data) => {
  return {
    type : SET_MANUAL_MATCH_RECORDS,
    payload : data
  }
};

export const UpdateUnreconciledAction = (data) => async(dispatch) => {
  try{
    const res = await BankCreation.updateUnreconciled(data)
    if(res.status === 200){
      dispatch({
        type: UPADTE_RECONCILED,
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

export const GetAllBankAccsAction = () => async(dispatch) => {
  try{
    const res = await BankCreation.getAllBankAccs()
    if(res.status === 200){
      dispatch({
        type: GET_ALL_BANK_ACCS,
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

export const individualReconciliationAction = (payload, type, response) => async(dispatch) => {
  try{
    const res = await BankCreation.individualReconciliation(payload, type)
    if(res.status === 200){
        matchedTransactionAlert(dispatch)
    }
    if(response){
      response(res)
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const GetAllBankReconciliationAction = (data, response) => async(dispatch) => {
  try{
    const res = await BankCreation.getAllBankReconciliation(data)
    if(res.status === 200){
      dispatch({
        type: GET_ALL_BANKRECONCILIATION,
        payload: res.data
      })
    }
    
    if(response) {
      response(res.data)
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const SetAllBankReconciliationAction = (data) => {
  return {
    type : SET_ALL_BANKRECONCILIATION,
    payload : data
  }
}

export default listBankCreationAction;