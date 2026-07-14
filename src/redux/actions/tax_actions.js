import {
  CREATE_TAX,
  LIST_TAX,
  GET_ID_TAX,
  EDIT_TAX,
  DELETE_TAX,
  SALES_SUMMARY_REPORT,
  SET_GST1_REPORT,
  GET_GST1_REPORT,
  SET_FORM27EQ_REPORT,
  GET_FORM27EQ_REPORT,
  GET_GSTR_EXPORT,
  SET_GST2_REPORT,
  GET_GST2_REPORT,
  SET_GST3B_REPORT,
  SET_GST4_REPORT,
  SET_GST9_REPORT,
  SET_GST9A_REPORT,
  SET_GST_REPORT,
  GET_GST_REPORT,
  SET_GST_RATE_REPORT,
  GET_GST_RATE_REPORT,
  SET_TCS_RECEIVABLE,
  GET_TCS_RECEIVABLE,
} from '../actionTypes';
import Taxservice from '../../services/tax_services';
import {
  DeleteAlert,
  ErrorAlert,
  CreateAlert,
  UpdateAlert,
  FailLoad,
  ListLoad,
} from './load';

export const createTaxAction = (data) => async (dispatch) => {
  try {
    const res = await Taxservice.create(data);
    if (res.data.affectedRows === 1) CreateAlert(dispatch);
    dispatch({
      type: CREATE_TAX,
      payload: res.data.data,
    });

    return Promise.resolve(res.data.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject(err);
  }
};

export const listTaxAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Taxservice.getAll();
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      dispatch({
        type: LIST_TAX,
        payload: res.data,
      });
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      ErrorAlert(dispatch, err);
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    }
  };

export const getbyidTaxAction = (id, alertResponce) => async (dispatch) => {
  try {
    const res = await Taxservice.get(id);
    dispatch({
      type: GET_ID_TAX,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
  }
};

export const updateTaxAction =
  (id, data, alertResponce) => async (dispatch) => {
    try {
      const res = await Taxservice.update(id, data);
      if (res.data.changedRows === 1) UpdateAlert(dispatch);
      dispatch({
        type: EDIT_TAX,
        payload: res.data.data,
      });
      return Promise.resolve(res.data.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject(err);
    }
  };

export const deleteTaxAction = (id, alertResponce) => async (dispatch) => {
  try {
    const res = await Taxservice.delete(id);
    if (res.status === 200 && res.statusText === 'OK') DeleteAlert(dispatch);
    dispatch({
      type: DELETE_TAX,
      payload: res.data.data,
    });
    return Promise.resolve(res.data.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
  }
};

  export const SalesSummaryReportAction = (data) => async (dispatch) => {
    try {
      const res = await Taxservice.SalesSummaryReport(data);
      if (res.status === 200) {
        dispatch({
          type: SALES_SUMMARY_REPORT,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  
export const getGST1ReportAction = (payload, setModalTypeHandler, setLoaderStatusHandler) => async(dispatch) => {
  try{
    ListLoad(setModalTypeHandler, setLoaderStatusHandler);

    const res = await Taxservice.getGST1Report(payload)
    if(res.status === 200){
      dispatch({
        type: SET_GST1_REPORT,
        payload: res.data
      })
    }
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const setSearchGst1ReportAction = (data) => {
  return{
    type: SET_GST1_REPORT,
    payload: data
  }
}

export const getSearchGst1ReportAction = (data, setModalTypeHandler, setLoaderStatusHandler) => {
  return{
    type: GET_GST1_REPORT,
    body: data,
    setModalTypeHandler, 
    setLoaderStatusHandler
  }
}

export const getForm27EQReportAction = (payload, setModalTypeHandler, setLoaderStatusHandler) => async(dispatch) => {
  try{
    ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await Taxservice.getForm27EQReport(payload)
    if(res.status === 200){
      dispatch({
        type: SET_FORM27EQ_REPORT,
        payload: res.data
      })
    }
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const GSTRExportAction = (payload, setModalTypeHandler, setLoaderStatusHandler,response) => async(dispatch) => {
  try{
    ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await Taxservice.GST1Export(payload)
    if(res.status === 200){
      dispatch({
        type: GET_GSTR_EXPORT,
        payload: res.data
      })
    }
    if (response) {
          response(res.data);
        }
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const setSearchForm27EQReportAction = (data) => {
  return{
    type: SET_FORM27EQ_REPORT,
    payload: data
  }
}

export const getSearchForm27EQReportAction = (data, setModalTypeHandler, setLoaderStatusHandler) => {
  return{
    type: GET_FORM27EQ_REPORT,
    body: data,
    setModalTypeHandler,
    setLoaderStatusHandler
  }
}

// GSTR2
export const getGST2ReportAction = (payload, setModalTypeHandler, setLoaderStatusHandler) => async(dispatch) => {
  try{
    ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await Taxservice.getGST2Report(payload)
    if(res.status === 200){ dispatch({ type: SET_GST2_REPORT, payload: res.data }) }
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    return Promise.resolve("API_FINISHED_SUCCESS")
  } catch(err){
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}
export const setSearchGst2ReportAction = (data) => ({ type: SET_GST2_REPORT, payload: data })
export const getSearchGst2ReportAction = (data) => ({ type: GET_GST2_REPORT, body: data })
export const GST2ExportAction = (payload, setModalTypeHandler, setLoaderStatusHandler, response) => async(dispatch) => {
  try{
    ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await Taxservice.GST2Export(payload)
    if(res.status === 200){ dispatch({ type: GET_GSTR_EXPORT, payload: res.data }) }
    if (response) response(res.data);
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    return Promise.resolve("API_FINISHED_SUCCESS")
  } catch(err){
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

// GSTR3B
export const getGST3BReportAction = (payload, setModalTypeHandler, setLoaderStatusHandler) => async(dispatch) => {
  try{
    ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await Taxservice.getGST3BReport(payload)
    if(res.status === 200){ dispatch({ type: SET_GST3B_REPORT, payload: res.data }) }
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    return Promise.resolve("API_FINISHED_SUCCESS")
  } catch(err){
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

// GSTR4
export const getGST4ReportAction = (payload, setModalTypeHandler, setLoaderStatusHandler) => async(dispatch) => {
  try{
    ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await Taxservice.getGST4Report(payload)
    if(res.status === 200){ dispatch({ type: SET_GST4_REPORT, payload: res.data }) }
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    return Promise.resolve("API_FINISHED_SUCCESS")
  } catch(err){
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

// GSTR9
export const getGST9ReportAction = (payload, setModalTypeHandler, setLoaderStatusHandler) => async(dispatch) => {
  try{
    ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await Taxservice.getGST9Report(payload)
    if(res.status === 200){ dispatch({ type: SET_GST9_REPORT, payload: res.data }) }
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    return Promise.resolve("API_FINISHED_SUCCESS")
  } catch(err){
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

// GSTR9A
export const getGST9AReportAction = (payload, setModalTypeHandler, setLoaderStatusHandler) => async(dispatch) => {
  try{
    ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await Taxservice.getGST9AReport(payload)
    if(res.status === 200){ dispatch({ type: SET_GST9A_REPORT, payload: res.data }) }
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    return Promise.resolve("API_FINISHED_SUCCESS")
  } catch(err){
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

// GST Report
export const getGSTReportAction = (payload, setModalTypeHandler, setLoaderStatusHandler) => async(dispatch) => {
  try{
    ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await Taxservice.getGSTReport(payload)
    if(res.status === 200){ dispatch({ type: SET_GST_REPORT, payload: res.data }) }
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    return Promise.resolve("API_FINISHED_SUCCESS")
  } catch(err){
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}
export const setSearchGstReportAction = (data) => ({ type: SET_GST_REPORT, payload: data })
export const getSearchGstReportAction = (data) => ({ type: GET_GST_REPORT, body: data })
export const GSTReportExportAction = (payload, setModalTypeHandler, setLoaderStatusHandler, response) => async(dispatch) => {
  try{
    ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await Taxservice.GSTReportExport(payload)
    if(res.status === 200){ dispatch({ type: GET_GSTR_EXPORT, payload: res.data }) }
    if (response) response(res.data);
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    return Promise.resolve("API_FINISHED_SUCCESS")
  } catch(err){
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

// GST Rate Report
export const getGSTRateReportAction = (payload, setModalTypeHandler, setLoaderStatusHandler) => async(dispatch) => {
  try{
    ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await Taxservice.getGSTRateReport(payload)
    if(res.status === 200){ dispatch({ type: SET_GST_RATE_REPORT, payload: res.data }) }
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    return Promise.resolve("API_FINISHED_SUCCESS")
  } catch(err){
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}
export const setSearchGstRateReportAction = (data) => ({ type: SET_GST_RATE_REPORT, payload: data })
export const getSearchGstRateReportAction = (data) => ({ type: GET_GST_RATE_REPORT, body: data })
export const GSTRateReportExportAction = (payload, setModalTypeHandler, setLoaderStatusHandler, response) => async(dispatch) => {
  try{
    ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await Taxservice.GSTRateReportExport(payload)
    if(res.status === 200){ dispatch({ type: GET_GSTR_EXPORT, payload: res.data }) }
    if (response) response(res.data);
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    return Promise.resolve("API_FINISHED_SUCCESS")
  } catch(err){
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

// TCS Receivable
export const getTCSReceivableAction = (payload, setModalTypeHandler, setLoaderStatusHandler) => async(dispatch) => {
  try{
    ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await Taxservice.getTCSReceivable(payload)
    if(res.status === 200){ dispatch({ type: SET_TCS_RECEIVABLE, payload: res.data }) }
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    return Promise.resolve("API_FINISHED_SUCCESS")
  } catch(err){
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}
export const setSearchTcsReceivableAction = (data) => ({ type: SET_TCS_RECEIVABLE, payload: data })
export const getSearchTcsReceivableAction = (data) => ({ type: GET_TCS_RECEIVABLE, body: data })
export const TCSReceivableExportAction = (payload, setModalTypeHandler, setLoaderStatusHandler, response) => async(dispatch) => {
  try{
    ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await Taxservice.TCSReceivableExport(payload)
    if(res.status === 200){ dispatch({ type: GET_GSTR_EXPORT, payload: res.data }) }
    if (response) response(res.data);
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    return Promise.resolve("API_FINISHED_SUCCESS")
  } catch(err){
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}
