import { CREATE_AUDIT, CREATE_AUDIT_CHECKLIST, CREATE_CHECKLIST, DELETE_AUDIT, DELETE_CHECKLIST, FILTER_AUDIT_CHECKLIST_REQUEST, GET_ALL_CHECKLIST_TEMPLATE, GET_AUDIT_CHECKLIST, GET_AUDITS_BY_ID, GET_CHECKLIST, GET_CHECKLIST_BASED_ON_ASSETS, GET_CHECKLIST_BY_ID, GET_SEARCH_AUDIT_CHECKLIST, SEND_REPORT_NOTIFICATION, SET_ALL_CHECKLIST_TEMPLATE, SET_AUDIT_BASED_ON_CHECKLIST, SET_AUDIT_CHECKLIST, SET_SEARCH_AUDIT_CHECKLIST, UNSEEN_DATA, UPDATE_AUDITS, UPDATE_CHECKLIST } from "redux/actionTypes"
import audit_services from "../../services/audit_services"
import { CannotDeleteAlert, ErrorAlert } from "./load"

export const createAuditCheckList = (data) => async (dispatch) => {
    try{
        const res = await audit_services.createAuditCheckList(data)
        if(res?.status === 200){
          if(res.data.message === 'A AUDIT REQUEST FOR THIS ASSET HAS ALREADY BEEN SENT') {
            CannotDeleteAlert(dispatch, res.data)
          }
          else {
            dispatch({
                type: CREATE_AUDIT_CHECKLIST ,
                payload: res.data
            })
          }
        }
        return Promise.resolve("API_FINISHED_SUCCESSFULLY")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const updateAuditsAction = (data, id) => async (dispatch) => {
  try{
    const res = await audit_services.updateAuditCheckList(data, id) 
    if(res.status == 200){
      dispatch({
        type: UPDATE_AUDITS,
        payload: res.data
      })
    }
  }catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const ListAuditData = (data, response) => async(dispatch) => {
    try{
      const res = await audit_services.getAuditData(data);
      if (res.status === 200) {
        dispatch({
          type: SET_AUDIT_CHECKLIST,
          payload: res.data,
        });
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  }catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

  export const getSerachAuditAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type : GET_AUDIT_CHECKLIST,
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };

  export const setSerachAuditAction = (data) => {
    return {
      type : SET_AUDIT_CHECKLIST,
      payload : data
    }
  };

  export const getAuditCheckList = (data) => async (dispatch) => {
    try{
      const res = await audit_services.getCheckList(data)
      if(res.status === 200){
        dispatch({
          type: SET_AUDIT_CHECKLIST,
          payload: res.data
        })
      }
      return Promise.resolve('API_FINISHED_SUCCESS')
    } catch(err) {
      ErrorAlert(dispatch, err)
      return Promise.resolve('API_FINISHED_ERROR')
    }
  }

  export const getAuditCheckListSearchAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type : GET_SEARCH_AUDIT_CHECKLIST,
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  }

  export const setAuditCheckListSearchAction = (data) => {
    return {
      type : SET_SEARCH_AUDIT_CHECKLIST,
      payload : data
    }
  };

  export const getAuditCheckListBasedOnAsset = (id, data, response) => async (dispatch) => {
    try{
      const res = await audit_services.getAuditCheckListBasedOnAsset(id, data)
      if(res.status === 200){
        dispatch({
          type: GET_CHECKLIST_BASED_ON_ASSETS,
          payload: res.data
        })
      }
      if(response){
        response(res.data)
      }
      return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
      ErrorAlert(dispatch, err)
      return Promise.resolve("API_FINISHED_ERROR")
    }
  }

  export const createAuditAction = (data) => async(dispatch) => {
    try{
      const res = await audit_services.createAssetAudit(data)
      if(res.status === 200){
        dispatch({
          type: CREATE_AUDIT,
          payload: res.data
        })
        return Promise.resolve("API_FINISHED_SUCCESS")
      }
    } catch(err){
      ErrorAlert(dispatch, err)
      return Promise.resolve("API_FINISHED_ERROR")
    }

}

export const ListAuditDataByCheckListId = (id, response) => async(dispatch) => {
  try{
    const res = await audit_services.getAuditDataByCheckListId(id);
    if (res.status === 200) {
      dispatch({
        type: SET_AUDIT_BASED_ON_CHECKLIST,
        payload: res.data,
      });
    }
    if(response){
      response(res.data)
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  }catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const getAllCheckListAction = (data, response) => async(dispatch) => {
  try{
    const res = await audit_services.getAllCheckList(data)
    if(res.status === 200){
      dispatch({
        type: FILTER_AUDIT_CHECKLIST_REQUEST,
        payload: res.data
      })
    }
    if(response){
      response(res.data)
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  } catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const sendReportNotificationAction = (data) => async(dispatch) => {
  try{
    const res = await audit_services.sendReportNotification(data)
    if(res.status === 200){
      dispatch({
        type: SEND_REPORT_NOTIFICATION,
        payload: res.data
      })
    }
  } catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const updateSeenChecklistAction = (id, payload) => async(dispatch) => {
  try{
    const res = await audit_services.updateSeenCheckList(id, payload)
    if(res.status === 200){
      dispatch({
        type: UNSEEN_DATA,
        payload: res.data
      })
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  } catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const createChecklistAction = (payload , response) => async(dispatch) => {
  try{
    const res = await audit_services.createChecklist(payload)
    if(res.status === 200){
      dispatch({
        type: CREATE_CHECKLIST,
        payload: res.data
      })
    }
    if(response ){
      response(res)
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  } catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const getChecklistAction = (payload) => async(dispatch) => {
  try{
    const res = await audit_services.getChecklist(payload)
    if(res.status === 200){
      dispatch({
        type: GET_CHECKLIST,
        payload: res.data
      })
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  } catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const getAllCheckListTemplateAction = (payload) => async(dispatch) => {
  try{
    const res = await audit_services.getAllCheckListTemplate(payload)
    if(res.status === 200){
      dispatch({
        type: GET_ALL_CHECKLIST_TEMPLATE,
        payload: res.data
      })
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  } catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const deleteAuditAction = (id) => async (dispatch) => {
  try{
    const res = await audit_services.deleteAudit(id)
    if(res === 200){
      dispatch({
        type: DELETE_AUDIT,
        payload : res.data
      })
    }
  }catch(err){
        ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")

  }
}

export const setgetAllCheckListTemplateAction = (data) => {
    return {
        type : GET_ALL_CHECKLIST_TEMPLATE,
        payload : data
    }
}

export const getgetAllCheckListTemplateAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
        type : SET_ALL_CHECKLIST_TEMPLATE,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const getAuditsByIdAction = (checkList_id) => async(dispatch) => {
  console.log(checkList_id,"id");

  try{
    const res = await audit_services.getAuditsById(checkList_id)
    if(res.status === 200){
      dispatch({
        type: GET_AUDITS_BY_ID,
        payload: res.data
      })
      return Promise.resolve("API_FINISHED_SUCCESS")
    }
  }catch (err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const getChecklistByIdAction = (id) => async (dispatch) => {
  try{
    const res = await audit_services.getChecklistById(id)
    if(res.status === 200){
      dispatch({
        type: GET_CHECKLIST_BY_ID,
        payload: res.data
      })
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  } catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const updateChecklistAction = (payload, id, response) => async (dispatch) => {
  try{
    const res = await audit_services.updateChecklist(payload, id)
    if(res.status === 200){
      dispatch({
        type: UPDATE_CHECKLIST,
        payload: res.data
      })
    }
    if(response){
      response(res)
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  } catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const deleteChecklistAction = (id, response) => async (dispatch) => {
  try{
    const res = await audit_services.deleteChecklist(id)
    if(res.status === 200){
      dispatch({
        type: DELETE_CHECKLIST,
        payload: res.data
      })
    }
    if(response){
      response(res)
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  } catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}