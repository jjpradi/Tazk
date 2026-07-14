import {LIST_POS_SALES_PAYMENTS} from '../actionTypes';
import posSalesPaymentsReducer from '../../services/posSalesPayments_services';
import {ErrorAlert} from './load';

export const listPosSalesPaymentsAction = (id) => async (dispatch) => {
  try {
    const res = await posSalesPaymentsReducer.getAll(id);
    if (res.status === 200) {
      dispatch({
        type: LIST_POS_SALES_PAYMENTS,
        payload: res.data,
      });
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
  }
};
