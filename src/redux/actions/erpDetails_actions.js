import {
  GET_PRODUCT_ERP_DETAILS,
  GET_CUSTOMER_ERP_DETAILS,
} from '../actionTypes';
import ProductErpDetailsService from '../../services/productErpDesign_services';
import {CreateAlert, ErrorAlert, FailLoad, ListLoad, UpdateAlert} from './load';

export const getProductErpDetails =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ProductErpDetailsService.get(id);
      if (res.status === 200) {
        dispatch({
          type: GET_PRODUCT_ERP_DETAILS,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getCustomerErpDetails =
  (id, type, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(true, setLoaderStatusHandler);
      const res = await ProductErpDetailsService.getCustomerDetails(id, type);
      if (res.status === 200) {
        dispatch({
          type: GET_CUSTOMER_ERP_DETAILS,
          payload: res.data,
        });
      }
      // FailLoad(true, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      // FailLoad(true, setLoaderStatusHandler);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
