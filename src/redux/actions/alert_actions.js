import {OPEN_ALERT, CLOSE_ALERT} from '../actionTypes';

export const OpenalertActions = (payload) => async (dispatch) => {
  // try {
  //   ListLoad(setModalTypeHandler, setLoaderStatusHandler)
  //   const res = await Balancesheetservice.getAll()
  //   if (res.status == 200) {
  dispatch({
    type: OPEN_ALERT,
    payload,
  });
  //     FailLoad(setModalTypeHandler, setLoaderStatusHandler)
  //   }
  // } catch (err) {
  // if (err.response?.status === 500) {
  //   getToken(Balancesheetservice, LIST_BALANCESHEET, dispatch)
  // } else {
  // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
  // ErrorAlert(alertResponce,err)
  //}
  // }
};

export const ClosealertActions = () => async (dispatch) => {
  // try {
  //   ListLoad(setModalTypeHandler, setLoaderStatusHandler)
  //   const res = await Balancesheetservice.getAll()
  //   if (res.status == 200) {
  dispatch({
    type: CLOSE_ALERT,
  });
  //     FailLoad(setModalTypeHandler, setLoaderStatusHandler)
  //   }
  // } catch (err) {
  // if (err.response?.status === 500) {
  //   getToken(Balancesheetservice, LIST_BALANCESHEET, dispatch)
  // } else {
  // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
  // ErrorAlert(alertResponce,err)
  //}
  // }
};
