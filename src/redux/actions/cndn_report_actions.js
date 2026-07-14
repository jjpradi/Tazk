import CndnReportService from '../../services/cndn_report_services';
import {
  RETURN_CN_REPORT_DATA,
  MANUAL_CN_REPORT_DATA,
  RETURN_DN_REPORT_DATA,
  MANUAL_DN_REPORT_DATA,
  CNDN_REPORT_CLEAR,
} from '../actionTypes';
import { ErrorAlert } from './load';

export const returnCnReportAction = (data) => async (dispatch) => {
  try {
    const res = await CndnReportService.getReturnCreditNotes(data);
    if (res.status === 200) {
      dispatch({ type: RETURN_CN_REPORT_DATA, payload: res.data });
    }
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject(err);
  }
};

export const manualCnReportAction = (data) => async (dispatch) => {
  try {
    const res = await CndnReportService.getManualCreditNotes(data);
    if (res.status === 200) {
      dispatch({ type: MANUAL_CN_REPORT_DATA, payload: res.data });
    }
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject(err);
  }
};

export const returnDnReportAction = (data) => async (dispatch) => {
  try {
    const res = await CndnReportService.getReturnDebitNotes(data);
    if (res.status === 200) {
      dispatch({ type: RETURN_DN_REPORT_DATA, payload: res.data });
    }
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject(err);
  }
};

export const manualDnReportAction = (data) => async (dispatch) => {
  try {
    const res = await CndnReportService.getManualDebitNotes(data);
    if (res.status === 200) {
      dispatch({ type: MANUAL_DN_REPORT_DATA, payload: res.data });
    }
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject(err);
  }
};

export const clearCndnReportAction = () => ({
  type: CNDN_REPORT_CLEAR,
});
