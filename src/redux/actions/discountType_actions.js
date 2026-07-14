import {
  LIST_DISCOUNT_TYPE,
  CREATE_DISCOUNT_TYPE,
  EDIT_DISCOUNT_TYPE,
  DELETE_DISCOUNT_TYPE,
} from '../actionTypes';
import DiscountType from '../../services/discountType_services';
import {
  CreateAlert,
  ErrorAlert,
  FailLoad,
  ListLoad,
  UpdateAlert,
  DeleteAlert,
} from './load';

export const listDiscountTypeAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler,setLoaderStatusHandler)
      const res = await DiscountType.getAll();
      if (res.status === 200) {
        dispatch({
          type: LIST_DISCOUNT_TYPE,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler,setLoaderStatusHandler)
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      // FailLoad(setModalTypeHandler,setLoaderStatusHandler)
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const createDiscountTypeAction =
  (data, setModalTypeHandler, setLoaderStatusHandler, responseDialog) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await DiscountType.create(data);
      if (res.status === 200 && res.data.status !== 'exists') {
        CreateAlert(dispatch);
        dispatch({
          type: CREATE_DISCOUNT_TYPE,
          payload: res.data,
        });
        responseDialog(true);
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      } else if (res.data.status === 'exists') {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        // alertResponce("Already Exists", 'error')
      }
      return Promise.resolve(res.data);
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

export const updateDiscountTypeAction =
  (id, data, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    //  updateAction(PosCreationservice, EDIT_SCHEMES, dispatch, id, data,setModalTypeHandler,setLoaderStatusHandler)
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await DiscountType.updateBankCreation(id, data);
      //    if (res.status === 200 && res.data.affectedRows>0){
      UpdateAlert(dispatch);
      dispatch({
        type: EDIT_DISCOUNT_TYPE,
        payload: res.data,
      });
      //    }else{
      //    ErrorAlert(dispatch,{message:"Not exists"})
      //    }

      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      // return Promise.resolve(res.data);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //   return Promise.reject(err);
    }
  };

export const deleteDiscountTypeAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    // deleteAction(BankCreation, DELETE_BANK_CREATION, dispatch, id,setModalTypeHandler,setLoaderStatusHandler)
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await DiscountType.delete(id);
      //   if (res.status === 200 && res.statusText === "OK")
      DeleteAlert(dispatch);
      dispatch({
        type: DELETE_DISCOUNT_TYPE,
        payload: res.data,
      });
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      //   return Promise.resolve(res.data.data);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // }
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
