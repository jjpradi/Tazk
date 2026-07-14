import {
    CREATE_LEADS,
    LIST_LEADS,
    GET_ID_LEADS,
    TOTAL_LEADS_COUNT,
    EDIT_LEADS,
    DELETE_LEADS,
    LIST_LEADS_BY_PAGINATION,
    GET_SEARCH_LEADS,
    SET_SEARCH_LEADS,
    CREATE_ALL_LOANS,
    LIST_ALL_LOANS,
    SET_SEARCH_COMPANY_LOAN
    ,GET_SEARCH_COMPANY_LOAN,
    GET_COMPANY_LOANS_DUE,
    CLAIM_MANUAL_PAYMENT,
    GET_CLAIM_TRANSACTION,
    GET_CLAIMS_TIMELINE
} from '../actionTypes';
import AllLoansservice from '../../services/allLoans_services';
import {
    DeleteAlert,
    ErrorAlert,
    FailLoad,
    ListLoad,
    UpdateAlert,
    CreateAlert,
} from './load';
import { createAction } from './actions';

export const createAllLoanssAction =
    (data, setModalTypeHandler, setLoaderStatusHandler) =>
        async (dispatch) => {
            // createAction(Leadsservice, CREATE_LEADS, dispatch, data, null, null,  setModalTypeHandler, setLoaderStatusHandler, sample)
            try 
            {
                // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
                const res = await AllLoansservice.create(data);
                if (res.status === 200) {
                    CreateAlert(dispatch);
                    dispatch({
                        type: SET_SEARCH_COMPANY_LOAN,
                        payload: res.data,
                    });
                    // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
                    return Promise.resolve("API_FINISHED_SUCCESS");
                }
            } 
            catch (err) 
            {
                // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
                ErrorAlert(dispatch, err);
                //  return Promise.reject(err);
                // }
                return Promise.reject("API_FINISHED_ERROR");
            }
        };

export const listAllLoansAction = (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await AllLoansservice.getAll();
        if (res.status === 200) {
            dispatch({
                type: SET_SEARCH_COMPANY_LOAN,
                payload: res.data,
            });
        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        ErrorAlert(dispatch, err);
        //  }
        return Promise.reject("API_FINISHED_ERROR");
    }
};




export const setsearchCompanyLoanAction = (data) => {
    return {
      type: SET_SEARCH_COMPANY_LOAN,
      payload: data
    }
  };
  
  export const getSearchCompanyLoanAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: GET_SEARCH_COMPANY_LOAN,
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };

  export const companyLoanDueForDashbooardAction = () => async (dispatch) => {
    try {
        
        const res = await AllLoansservice.loanDueDetails();
        if (res.status === 200) {
            dispatch({
                type: GET_COMPANY_LOANS_DUE,
                payload: res.data,
            });
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};

export const claimManualPaymentAction = (data) =>async (dispatch)=>{
    try{
        console.log('maxamini')
        const res = await AllLoansservice.claimManualPayment(data);
        if (res.status === 200) {
            dispatch({
                type: CLAIM_MANUAL_PAYMENT,
                payload: res.data,
            });
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    }
    catch(err){
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
}

export const getClaimtransactionAction = (data) =>async (dispatch)=>{
    try{
        const res = await AllLoansservice.getClaimtransaction(data);
        if (res.status === 200) {
            dispatch({
                type: GET_CLAIM_TRANSACTION,
                payload: res.data,
            });
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    }
    catch(err){
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
}

export const getClaimtimelineAction = (data) =>async (dispatch)=>{
    try{
        const res = await AllLoansservice.getClaimtimeline(data);
        if (res.status === 200) {
            dispatch({
                type: GET_CLAIMS_TIMELINE,
                payload: res.data,
            });
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    }
    catch(err){
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
}