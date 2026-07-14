import {
  CREATE_TAX_CUSTOMER_CATEGORY,
  LIST_TAX_CUSTOMER_CATEGORY,
  GET_ID_TAX_CUSTOMER_CATEGORY,
  EDIT_TAX_CUSTOMER_CATEGORY,
  DELETE_TAX_CUSTOMER_CATEGORY,
} from '../actionTypes';
import TaxCustomerCategoryservice from '../../services/taxcustomercategory_services';
import {DeleteAlert, ErrorAlert, CreateAlert, UpdateAlert} from './load';

export const createTaxCustomerCategoryAction = (data) => async (dispatch) => {
  try {
    const res = await TaxCustomerCategoryservice.create(data);
    if (res.data.affectedRows === 1) CreateAlert(dispatch);
    dispatch({
      type: CREATE_TAX_CUSTOMER_CATEGORY,
      payload: res.data.data,
    });

    return Promise.resolve(res.data.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject(err);
  }
};

export const listTaxCustomerCategoryAction = () => async (dispatch) => {
  try {
    const res = await TaxCustomerCategoryservice.getAll();
    //  let rem = await res.data.map((m) => {
    //   return delete m['tableData'] ? m :null
    // }).filter( (f) => f !==null )
    dispatch({
      type: LIST_TAX_CUSTOMER_CATEGORY,
      payload: res.data,
    });
  } catch (err) {
    ErrorAlert(dispatch, err);
  }
};

export const getbyidTaxCustomerCategoryAction = (id) => async (dispatch) => {
  try {
    const res = await TaxCustomerCategoryservice.get(id);
    dispatch({
      type: GET_ID_TAX_CUSTOMER_CATEGORY,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
  }
};

export const updateTaxCustomerCategoryAction =
  (id, data) => async (dispatch) => {
    try {
      const res = await TaxCustomerCategoryservice.update(id, data);
      if (res.data.changedRows === 1) UpdateAlert(dispatch);
      dispatch({
        type: EDIT_TAX_CUSTOMER_CATEGORY,
        payload: res.data.data,
      });
      return Promise.resolve(res.data.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject(err);
    }
  };

export const deleteTaxCustomerCategoryAction = (id) => async (dispatch) => {
  try {
    const res = await TaxCustomerCategoryservice.delete(id);
    if (res.status === 200 && res.statusText === 'OK') DeleteAlert(dispatch);
    dispatch({
      type: DELETE_TAX_CUSTOMER_CATEGORY,
      payload: res.data.data,
    });
    return Promise.resolve(res.data.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
  }
};
