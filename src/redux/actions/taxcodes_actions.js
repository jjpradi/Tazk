import {
  CREATE_TAX_CODE,
  LIST_TAX_CODE,
  GET_ID_TAX_CODE,
  EDIT_TAX_CODE,
  DELETE_TAX_CODE,
} from '../actionTypes';
import TaxCodeservice from '../../services/taxcode_services';
import {
  DeleteAlert,
  ErrorAlert,
  CreateAlert,
  UpdateAlert,
  ListLoad,
  FailLoad,
} from './load';

export const createTaxCodesAction =
  (data, setModalStatusHandler, setselectData) => async (dispatch) => {
    try {
      const res = await TaxCodeservice.create(data);
      if (res.data.affectedRows === 1) {
        dispatch({
          type: CREATE_TAX_CODE,
          payload: res.data.data,
        });
        if (setModalStatusHandler) {
          setModalStatusHandler(false);
          setselectData('taxcodes', true);
        }
        setTimeout(() => {
          CreateAlert(dispatch);
        }, 0);
      }
      return Promise.resolve(res.data.data);
    } catch (err) {
      // if(err.response?.status === 500) {
      //   createToken(TaxCodeservice, CREATE_TAX_CODE, dispatch, data, alertResponce)
      // }
      // else{
      ErrorAlert(dispatch, err);
      return Promise.reject(err);
    }
  };

export const listTaxCodesAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await TaxCodeservice.getAll();
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      dispatch({
        type: LIST_TAX_CODE,
        payload: res.data,
      });
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      ErrorAlert(dispatch, err);
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      // if(err.response?.status === 500) {
      //   getToken(TaxCodeservice, LIST_TAX_CODE, dispatch)
      // }else{
      // }
    }
  };

export const getbyidTaxCodesAction = (id) => async (dispatch) => {
  try {
    const res = await TaxCodeservice.get(id);
    dispatch({
      type: GET_ID_TAX_CODE,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    // if(err.response?.status === 500) {
    //   getbyidToken(TaxCodeservice, GET_ID_TAX_CODE, dispatch, id)
    // }
    // else{
    // alertResponce(err.message,'error')
    // }
  }
};

export const updateTaxCodesAction =
  (id, data, setModalStatusHandler, setselectData) => async (dispatch) => {
    try {
      const res = await TaxCodeservice.update(id, data);
      if (res.data.changedRows === 1) {
        dispatch({
          type: EDIT_TAX_CODE,
          payload: res.data.data,
        });
        if (setModalStatusHandler) {
          setModalStatusHandler(false);
          setselectData('taxcodes', 'update');
        }
        setTimeout(() => {
          UpdateAlert(dispatch);
        }, 0);
      }
      return Promise.resolve(res.data.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
      // if(err.response?.status === 500) {
      //   updateToken(TaxCodeservice, EDIT_TAX_CODE, dispatch, data, id, alertResponce)
      // }
      // else{
      // alertResponce(err,'error')
      return Promise.reject(err);
    }
  };

export const deleteTaxCodesAction =
  (id, setModalStatusHandler) => async (dispatch) => {
    try {
      const res = await TaxCodeservice.delete(id);
      if (res.status === 200 && res.statusText === 'OK') DeleteAlert(dispatch);
      dispatch({
        type: DELETE_TAX_CODE,
        payload: res.data.data,
      });
      if (setModalStatusHandler) {
        setModalStatusHandler(false);
        // setselectData('taxcodes',true)
      }
      return Promise.resolve(res.data.data);
    } catch (err) {
      // if(err.response?.status === 500) {
      //   deleteToken(TaxCodeservice, DELETE_TAX_CODE, dispatch, id, alertResponce)
      // }
      // else{
      ErrorAlert(dispatch, err);
      // }
    }
  };
