import { GET_LOAN_DETAIL, UPDATE_LOAN_DETAIL,SET_SEARCH_LOAN,GET_SEARCH_LOAN_DATA, GET_PAYROLL_PAYMENT_MODE, GET_LOAN_SEQUENCE, GET_LOAN_LEDGER_DETAILS, UPDATE_SEEN_LOAN, GET_EMPLOYEE_LOAN, TENURE_TYPE, GET_LOCATION, GET_EMPLOYEE_LOAN_DUE,CREATE_CLAIM, SEARCH_CLAIM, GET_SEARCH_CLAIM_DATA, UPDATE_SEEN_CLAIM, SET_SEARCH_CLAIM, CLAIMS_CATEGORY,DELETE_LOAN, DELETE_CLAIM, APPROVED_CLAIMS,GET_APPROVED_CLAIMS,SET_APPROVED_CLAIMS,DELETE_CLAIMS,GET_SEARCH_CLAIMS_CATEGORY_LIST,SET_SEARCH_CLAIMS_CATEGORY_LIST, ADD_CLAIMS_CATEGORY} from '../actionTypes'

import { CreateAlert,ApproveAlert,RejectAlert, ErrorAlert, RequestAlert, commonAlert, CancelAlert, RequestClaimAlert, approverVerifierError, CannotDeleteAlert, departmentExists, cashboxNotExists, DeleteAlert } from './load';
import loan_services from 'services/loan_services';

export const loanDetailsAction = (employee_id, data, response) => async (dispatch) => {
    try {
        const res = await loan_services.get(employee_id, data);
        if (res.status === 200) {
            dispatch({
                type: GET_LOAN_DETAIL,
                payload: res.data,
            });
        }
        if (response) {
            response(res.status);
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};

export const employeeLoansAction = (person_id, data) => async (dispatch) => {
    try {
        const res = await loan_services.getEmployeeLoans(person_id, data);
        if (res.status === 200) {
            dispatch({
                type: GET_EMPLOYEE_LOAN,
                payload: res.data,
            });
        }
        // if (response) {
        //     response(res.status);
        // }
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};

export const getEmployeeLoansDueAction = (person_id) => async (dispatch) => {
    try {
        const res = await loan_services.getEmployeeLoansDue(person_id);
        if (res.status === 200) {
            dispatch({
                type: GET_EMPLOYEE_LOAN_DUE,
                payload: res.data,
            });
        }
        // if (response) {
        //     response(res.status);
        // }
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};


export const updateSeenLoanAction =
(id ,response) => async (dispatch) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await loan_services.updateSeenLoan(id)
    if (res.status === 200) {
      dispatch({
        type: UPDATE_SEEN_LOAN,
        payload: res.data,
      });
    }        
    if (response) {
      response(res.status);
    }
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const updateSeenClaimAndOthersAction =
(id ,type,response) => async (dispatch) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await loan_services.updateSeenClaimAndOthers(id,type)
    if (res.status === 200) {
      dispatch({
        type: UPDATE_SEEN_CLAIM,
        payload: res.data,
      });
    }        
    if (response) {
      response(res.status);
    }
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};


export const updateLoanDetailsAction = (data , response) => async (dispatch) => {
    try {
        const res = await loan_services.create(data);
        if (res.status === 200) {
            RequestAlert (dispatch);
            dispatch({
                type: UPDATE_LOAN_DETAIL,
                payload: res.data,
            });
        }
        if (res.status === 200) {
            response({status : res.status, data : res.data.data[0]})
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {

        if(err.response.status === 409 && err.response.data.status === 'CANNOT CREATE'){
            commonAlert(dispatch, err.response.data.message);
        }else{
            ErrorAlert(dispatch, err);
        }
        response(err.response.status)
        return Promise.reject("API_FINISHED_ERROR");
    }
};

export const createClaimsAction = (data, response) => async (dispatch) => {
    try {
        const res = await loan_services.createClaim(data);
        if (res.data.status === "success") {
            RequestClaimAlert(dispatch);
            dispatch({
                type: CREATE_CLAIM,
                payload: res.data,
            });
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        if (err.response && err.response.status === 409 && err.response.data.status === 'CANNOT CREATE') {
            commonAlert(dispatch, err.response.data.message);
        } else {
            ErrorAlert(dispatch, err);
        }
        if (err.response) {
            response(err.response.status);
        } else {
            response(500);
        }
        return Promise.reject("API_FINISHED_ERROR");
    }
};

export const updateLoanStatusAction = (id,data,setModalTypeHandler, setLoaderStatusHandler,resDataLoan, response) => async (dispatch) => {
    try {
        const res = await loan_services.updateStatus(id, data);

         if (res.status === 200) {
            if (data.type === "approve") {
                ApproveAlert(dispatch);
            } else if (data.type === "Cancel") {
                CancelAlert(dispatch)
            } else {
                RejectAlert(dispatch)
            }
            //dispatch(loanDetailsAction(filteredValue))
            if (resDataLoan) {
                resDataLoan(res.status,data.type)
            }
            if (response) {
                response(res.status)
            }
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};
export const updateClaimAndOtherStatusAction = (id, data, responseCallback) => async (dispatch) => {
    try {
        const res = await loan_services.updateClaimAndOtherStatus(id, data);
       if (res.status === 200) {
        if(res.data.status === "No Locations Mapped"){
            ErrorAlert(dispatch, {message: res.data.status});
        }
           else if (data.type === "Approve") {
                ApproveAlert(dispatch);
            } else if (data.type === "Cancel") {
                CancelAlert(dispatch);
            } else {
                RejectAlert(dispatch);
            }
            
            if (responseCallback) {
                responseCallback(res);
            }
        }
        
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};

export const updateLoanOutstandingAction = (id, data, callback) => async (dispatch) => {
    try {
        const res = await loan_services.updateOutstanding(id, data);

        if (res.data.status === 'Default Cashbox not exists for company') {
            cashboxNotExists(dispatch, res.data.status)

        }

        else {
            if (callback) {
                callback()
            }
        }

        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};

export const filterDataAction = (data) => async (dispatch) => {
    try {
        const res = await loan_services.filteredData(data);
        if (res.status === 200) {
            dispatch({
                type: SET_SEARCH_LOAN,
                payload: res.data,
            });
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};

export const searchLoanAction = (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
        const res = await loan_services.searchLoan(data); 
        if (res.status === 200) {
            dispatch({
                type: SET_SEARCH_LOAN,
                payload: res.data,
            });
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};
  
  export const setsearchLoanAction = (data) => {
    return {
      type: SET_SEARCH_LOAN,
      payload: data
    }
  };

  export const setsearchClaimAction = (data) => {
    return {
      type: SET_SEARCH_CLAIM,
      payload: data
    }
  };

  export const loanAccountsIdNameAction =
  (payload, setData) => async (dispatch) => {
    try {
      const res = await loan_services.getLoanAccId(payload);
      if (res.status === 200) {
        setData(res.data)
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
    }
    };
  
    export const payrollPaymentModeActions = (id) => async (dispatch) => {
        try {
            const res = await loan_services.payrollPaymentMode(id);
            if (res.status === 200) {
                dispatch({
                    type: GET_PAYROLL_PAYMENT_MODE,
                    payload: res.data,
                });
            }
            return Promise.resolve("API_FINISHED_SUCCESS");
        } catch (err) {
            ErrorAlert(dispatch, err);
            return Promise.reject("API_FINISHED_ERROR");
        }
};
    
    export const loanSequenceAction = () => async (dispatch) => {
        try {
            const res = await loan_services.loanSequence();
            if (res.status === 200) {
                dispatch({
                    type: GET_LOAN_SEQUENCE,
                    payload: res.data,
                });
            }
            return Promise.resolve("API_FINISHED_SUCCESS");
        } catch (err) {
            ErrorAlert(dispatch, err);
            return Promise.reject("API_FINISHED_ERROR");
        }
};

    export const listLoanLedgerDetails = (data) => async (dispatch) => {
        try {
            const res = await loan_services.loanLedger(data);
            if (res.status === 200) {
                dispatch({
                    type: GET_LOAN_LEDGER_DETAILS,
                    payload: res.data,
                });
            }
            return Promise.resolve("API_FINISHED_SUCCESS");
        } catch (err) {
            ErrorAlert(dispatch, err);
            return Promise.reject("API_FINISHED_ERROR");
        }
};
export const updateLoanSequenceAction = (data, response) => async (dispatch) => {
    try {
        const res = await loan_services.updateLoanSequence(data);
        if (res.status === 200) {
            CreateAlert (dispatch);
            //dispatch(loanDetailsAction(filteredValue))
        }
        if (response) {
            response(res.status);
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};

export const getTenureTypeAction = () => async (dispatch) => {
    try {
        const res = await loan_services.tenureMonths();
        if (res.status === 200) {
            dispatch({
                type: TENURE_TYPE,
                payload: res.data,
            });
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};

export const getClaimsCategoryAction = () => async (dispatch) => {
    try {
        const res = await loan_services.claimsCategory();
        if (res.status === 200) {
            dispatch({
                type: CLAIMS_CATEGORY,
                payload: res.data,
            });
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};

export const searchClaimAndOthersAction = (claimAndOtherdata, responseCallback) => async (dispatch) => {
    try {
      const res = await loan_services.searchClaimAndOthers(claimAndOtherdata);
      if (res.status === 200) {
        dispatch({
          type: SEARCH_CLAIM,
          payload: res.data,
        });
        if (responseCallback) {
          responseCallback(res);
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
  };
  


export const getLocationAction = () => async (dispatch) => {
    try {
        const res = await loan_services.getLocation();
        if (res.status === 200) {
            dispatch({
                type: GET_LOCATION,
                payload: res.data,
            });
        }
        return Promise.resolve(res.data);
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};

export const getLoanListAction = (data, response) => async (dispatch) => {
    try {
        const res = await loan_services.searchLoan(data);
        if (res.status === 200) {
            dispatch({
                type: SET_SEARCH_LOAN,
                payload: res.data,
            });
            if (response) {
                response(res)
            }
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};

export const writeOffLoanAction = (data, response) => async (dispatch) => {
    try {
        const res = await loan_services.writeOffLoan(data);
        if (res.status === 200) {
            if (response) {
                response(res)
            }
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};

export const deleteLoanAction = (data, response) => async (dispatch) => {
    try {
        const res = await loan_services.deleteLoan(data);
        if (res.status === 200) {
            DeleteAlert(dispatch)
            dispatch({
                type: DELETE_LOAN,
                payload: res.data,
            });
            if (response) {
                response(res)
            }
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};


export const deleteClaimAction = (data, response) => async (dispatch) => {
    try {
        const res = await loan_services.deleteClaim(data);
        if (res.status === 200) {
            DeleteAlert(dispatch)
            dispatch({
                type: DELETE_CLAIM,
                payload: res.data,
            });
            if (response) {
                response(res)
            }
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};

export const approvedClaimsAction = (data) => async (dispatch) => {
    try {
        const res = await loan_services.approvedClaims(data);
        if (res.status === 200) {
            dispatch({
                type: APPROVED_CLAIMS,
                payload: res.data,
            });
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};

export const getSearchApprovedClaimAction= (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return{
        type: GET_APPROVED_CLAIMS,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}
 
export const setSearchApprovedClaimAction = (data) => {
    return {
      type : SET_APPROVED_CLAIMS,
      payload : data
    }
};

export const addClaimsCategoryAction = (data,response) => async (dispatch) => {
    try {
        console.log("ooooo");
        
        const res = await loan_services.addClaimsCategory(data);
        console.log("22222");
        if (res.status === 200) {
            dispatch({
                type: ADD_CLAIMS_CATEGORY,
                payload: res.data,
            });
            if(response){
                console.log("pppppp");
                response(res)
              }
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        console.log("wwww",err);
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};

export const setSearchClaimsCategoryList = (data) => {
    return {
      type : SET_SEARCH_CLAIMS_CATEGORY_LIST,
      payload : data
    }
};


export const getSearchClaimsCategoryList= (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return{
        type: GET_SEARCH_CLAIMS_CATEGORY_LIST,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const deleteClaimsCategoryAction = (id, response) => async (dispatch) => {
    try {
        const res = await loan_services.deleteClaimsCategory(id);
        if (res.status === 200) {
            if(res.data.message === 'THE CLAIMS CANNOT BE DELETED AS IT HAS BEEN IN USE'){
                CannotDeleteAlert(dispatch,res.data)
            }
            else{
                dispatch({
                    type: CLAIMS_CATEGORY,
                    payload: res.data,
                });
            }
            // if(response){
            //     response(res.data)
            //   }
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};

export const getSearchClaimAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type: GET_SEARCH_CLAIM_DATA,
    body,
    setModalTypeHandler,
    setLoaderStatusHandler,
  };
};

// Backward-compatible alias used in older imports
export const setSearchClaimAction = setsearchClaimAction;

