import {GET_ID_PURCHASE_TABLE} from '../actionTypes';
import PurchaseTableService from '../../services/purchaseTable_services';
import {ErrorAlert} from './load';

export const getbyidPurchaseTableAction = (id) => async (dispatch) => {
  try {
    const res = await PurchaseTableService.getAll(id);
    dispatch({
      type: GET_ID_PURCHASE_TABLE,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};
