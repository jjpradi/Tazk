import {CREATE_EXPENSE, GET_EXPENSES, GET_EXPENSE_LEDGERS,UPDATE_EXPENSES,EXPENSE_LAST_INSERT_ID, GET_SEARCH_EXPENSE, SET_SEARCH_EXPENSE, EXPENSES_BY_VENDOR, GET_EXPENSES_BY_ID} from '../actionTypes';
import ExpenseService from '../../services/expense_services';
import {
  CreateAlert,
  DeleteAlert,
  ErrorAlert,
  FailLoad,
  ListLoad,
  UpdateAlert,
  ExistAlert,
  commonAlert,
} from './load';

export const getExpenseAction = () => async (dispatch) => {
  try {
    const res = await ExpenseService.getExpenses();
    if (res.status === 200) {
      dispatch({
        type: GET_EXPENSES,
        payload: res.data,
      });
    }
    return Promise.resolve('API_FINISHED_SUCCESS');
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject('API_FINISHED_ERROR');
  }
};

export const createExpenseAction = (data) => async (dispatch) => {
  try {
    const res = await ExpenseService.createExpense(data);
    if (res.status === 200) {
      CreateAlert(dispatch);
      dispatch({
        type: GET_EXPENSES,
        payload: res.data,
      });
      dispatch({
        type: EXPENSE_LAST_INSERT_ID,
        payload: res.data?.insertId || 0,
      });
      
    }
    return Promise.resolve('API_FINISHED_SUCCESS');
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject('API_FINISHED_ERROR');
  }
};

export const getExpenseLedgersAction = () => async (dispatch) => {
  try {
    const res = await ExpenseService.getExpenseLedgers();
    if (res.status === 200) {
      dispatch({
        type: GET_EXPENSE_LEDGERS,
        payload: res.data,
      });
    }
    return Promise.resolve('API_FINISHED_SUCCESS');
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject('API_FINISHED_ERROR');
  }
};


export const deleteExpenseAction = (data) => async (dispatch) => {
  try {
    const res = await ExpenseService.deleteExpense(data);
    if (res.status === 200) {
      DeleteAlert(dispatch)
      dispatch({
        type: GET_EXPENSES,
        payload: res.data,
      });
    }
    return Promise.resolve('API_FINISHED_SUCCESS');
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject('API_FINISHED_ERROR');
  }
};

export const PaymentExpenseAction = (id,data, response) => async (dispatch) => {
  try {
    const res = await ExpenseService.PaymentExpense(id,data);
    if (res.status === 200) {
      UpdateAlert(dispatch);
      dispatch({
        type: GET_EXPENSES,
        payload: res.data,
      });
    }
    if(response){
      response(res)
    }
    return Promise.resolve('API_FINISHED_SUCCESS');
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject('API_FINISHED_ERROR');
  }
};

export const getExpenseItemsAction = (id,callBack) => async (dispatch) => {
  try {
    const res = await ExpenseService.getExpenseItems(id);
    if (res.status === 200) {
        callBack(res.data)
    }
    return Promise.resolve('API_FINISHED_SUCCESS');
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject('API_FINISHED_ERROR');
  }
};

export const UpdateExpenseAction = (id,data) => async (dispatch) => {
  try {
    const res = await ExpenseService.UpdateExpense(id,data);
    if (res.status === 200) {
      UpdateAlert(dispatch);
      dispatch({
        type: GET_EXPENSES,
        payload: res.data,
      });
    }
    return Promise.resolve('API_FINISHED_SUCCESS');
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject('API_FINISHED_ERROR');
  }
};
export const UpdateTransactionIdAction = (data) => async (dispatch) => {
  try {
    const res = await ExpenseService.transactionIdUpdate(data);
    if (res.status === 200) {
      UpdateAlert(dispatch);
      // dispatch({
      //   type: UPDATE_EXPENSES,
      //   payload: res.data,
      // });
    }
    return Promise.resolve('API_FINISHED_SUCCESS');
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject('API_FINISHED_ERROR');
  }
};

export const expenseSearchAction = (data) => async (dispatch) => {
  try {
    const res = await ExpenseService.expenseSearch(data);
    if (res.status === 200) {
      dispatch({
        type: GET_EXPENSES,
        payload: res.data,
      });
    }
    return Promise.resolve('API_FINISHED_SUCCESS');
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject('API_FINISHED_ERROR');
  }
};

export const get_expenseSearchAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type: GET_SEARCH_EXPENSE,
    body,
    setModalTypeHandler, 
    setLoaderStatusHandler
  }
};


export const set_expenseSearchAction = (data) => {
  return {
    type:GET_EXPENSES,
    payload:data
  }
};

export const getExpensesByVendorAction = (vendor_id, page, pageSize,searchString = '', filters = {}) => async (dispatch) => {
  try {
    const data = { page, pageSize, searchString, ...filters }
    const res = await ExpenseService.expenseByVendor(data, vendor_id)
    if (res.status === 200) {
      dispatch({
        type: EXPENSES_BY_VENDOR,
        payload: res.data
      })
    }
    return Promise.resolve({status: "API_FINISHED_SUCCESS", data: res.data})
  }
  catch (err) {
    ErrorAlert(dispatch, err)
    return Promise.resolve({status: "API_FINISHED_ERROR", data: []})
  }
}

export const getExpensesByIdAction = (id) => async (dispatch) => {
  try {
    const res = await ExpenseService.expensesById(id)
    if(res.status === 200) {
      dispatch({
        type: GET_EXPENSES_BY_ID,
        payload: res.data
      })
    }
    return Promise.resolve('API_FINISHED_SUCCESS')
  }
  catch(err) {
    ErrorAlert(dispatch, err)
    return Promise.resolve('APO_FINISHED_ERROR')
  }
}

export const setExpensesByIdAction = (data) => {
  return {
    type: GET_EXPENSES_BY_ID,
    payload: data
  }
}