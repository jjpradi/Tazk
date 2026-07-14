import {
  CREATE_TAX_JURISDICTION,
  LIST_TAX_JURISDICTION,
  GET_ID_TAX_JURISDICTION,
  EDIT_TAX_JURISDICTION,
  DELETE_TAX_JURISDICTION,
} from '../actionTypes';
import TaxJurisdictionservice from '../../services/taxjurisdiction_services';
import {DeleteAlert, ErrorAlert, CreateAlert, UpdateAlert} from './load';

export const createTaxJurisdictionAction =
  (data, setModalStatusHandler, setselectData) => async (dispatch) => {
    try {
      const res = await TaxJurisdictionservice.create(data);
      if (res.data.affectedRows === 1) {
        dispatch({
          type: CREATE_TAX_JURISDICTION,
          payload: res.data.data,
        });
        if (setModalStatusHandler) {
          setModalStatusHandler(false);
          setselectData('taxjurisdiction', true);
        }
        setTimeout(() => {
          CreateAlert(dispatch);
        }, 0);
      } else {
        if (setModalStatusHandler) {
          setModalStatusHandler(false);
        }
        // alertResponce(res.data.status,'error')
      }
      return Promise.resolve(res.data.data);
    } catch (err) {
      // if(err.response?.status === 500) {
      //   createToken(TaxJurisdictionservice, CREATE_TAX_JURISDICTION, dispatch, data. alertResponce)
      // }else{
      ErrorAlert(dispatch, err);
      return Promise.reject(err);
    }
  };

export const listTaxJurisdictionAction = () => async (dispatch) => {
  try {
    const res = await TaxJurisdictionservice.getAll();
    //  let rem = await res.data.map((m) => {
    //   return delete m['tableData'] ? m :null
    // }).filter( (f) => f !==null )
    dispatch({
      type: LIST_TAX_JURISDICTION,
      payload: res.data,
    });
  } catch (err) {
    ErrorAlert(dispatch, err);
    // if(err.response?.status === 500) {
    //   getToken(TaxJurisdictionservice, LIST_TAX_JURISDICTION, dispatch)
    // }else{
    // }
  }
};

export const getbyidTaxJurisdictionAction = (id) => async (dispatch) => {
  try {
    const res = await TaxJurisdictionservice.get(id);
    dispatch({
      type: GET_ID_TAX_JURISDICTION,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    // if(err.response?.status === 500) {
    //   getbyidToken(TaxJurisdictionservice, GET_ID_TAX_JURISDICTION, dispatch, id)
    // }
    // else{
    ErrorAlert(dispatch, err);
    // }
  }
};

export const updateTaxJurisdictionAction =
  (id, data, setModalStatusHandler, setselectData) => async (dispatch) => {
    try {
      const res = await TaxJurisdictionservice.update(id, data);
      if (res.data.affectedRows === 1) {
        // alertResponce("Updated SuccessFully",'success')
        dispatch({
          type: EDIT_TAX_JURISDICTION,
          payload: res.data.data,
        });
        if (setModalStatusHandler) {
          setModalStatusHandler(false);
          setselectData('taxjurisdiction', 'update');
        }
        setTimeout(() => {
          UpdateAlert(dispatch);
        }, 0);
      }
      return Promise.resolve(res.data.data);
    } catch (err) {
      // if(err.response?.status === 500) {
      //   updateToken(TaxJurisdictionservice, EDIT_TAX_JURISDICTION, dispatch, data, id, alertResponce)
      // }
      // else{
      ErrorAlert(dispatch, err);
      return Promise.reject(err);
    }
  };

export const deleteTaxJurisdictionAction =
  (id, setModalStatusHandler, setselectData) => async (dispatch) => {
    try {
      const res = await TaxJurisdictionservice.delete(id);
      if (res.status === 200 && res.statusText === 'OK') DeleteAlert(dispatch);
      dispatch({
        type: DELETE_TAX_JURISDICTION,
        payload: res.data.data,
      });
      if (setModalStatusHandler) {
        setModalStatusHandler(false);
        // setselectData('taxjurisdiction','update')
      }
      return Promise.resolve(res.data.data);
    } catch (err) {
      // if(err.response?.status === 500) {
      //   deleteToken(TaxJurisdictionservice, DELETE_TAX_JURISDICTION, dispatch, id, alertResponce)
      // }
      // else{
      ErrorAlert(dispatch, err);
      // }
    }
  };
