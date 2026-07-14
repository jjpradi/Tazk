import {
  GET_ROLE_LIST,
  GET_MODULES_LIST,
  GET_CREATE_MODULES,
  GET_BY_ID_ROLES,
  UPDATE_ROLES,
  DELETE_ROLES,
  USER_BASED_LOCATIONS,
  MENUS_USER_DISPLAY,
  GET_POS_PAGES,
  GET_SEARCH_USER_ROLE,
  SET_SEARCH_USER_ROLE,
  GET_ROLE_NAME,
  SET_USER_RIGHTS,
  UPDATE_USER_RIGHTS,
  GET_MODULES_FOR_ALL_ROLES,
  GET_FRONTDESK_RIGHTS,
  ADD_FAVOURITE_MENU,
  FAVOURITE_MENU_LIST,
  GET_ROLES_CHILD_MODULES,
  GET_SEARCH_USER_MODULE_ACTION,
  SET_SEARCH_USER_MODULE_ACTION
} from '../actionTypes';
import Roleservice from '../../services/role_services';
import DB from '../../db';
import {
  CreateAlert,
  ErrorAlert,
  FailLoad,
  ListLoad,
  UpdateAlert,
  successmsg,
  errormsg,
} from './load';
import {createAction, updateAction, deleteAction} from './actions';

var db = new DB('pos_session');

export const listroleAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Roleservice.list_role();
      if (res.status === 200) {
        dispatch({
          type: GET_ROLE_LIST,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const listModulesForAllRolesAction = (data,setModalTypeHandler, setLoaderStatusHandler) => async(dispatch) => {
  try{
    const res = await Roleservice.listModulesForAllRoles(data)
    if(res.status === 200){
      dispatch({
        type: GET_MODULES_FOR_ALL_ROLES,
        payload: res.data
      })
      return Promise.resolve("API_FINISHED_SUCCESS")
    }
  } catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

// export const get_searchUserModulesAction = (data,setModalTypeHandler, setLoaderStatusHandler) => async(dispatch) => {
//   try{
//     const res = await Roleservice.listModulesForAllRoles(data)
//     if(res.status === 200){
//       dispatch({
//         type: SET_SEARCH_USER_MODULE_ACTION,
//         payload: res.data
//       })
//       return Promise.resolve("API_FINISHED_SUCCESS")
//     }
//   } catch(err){
//     ErrorAlert(dispatch, err)
//     return Promise.resolve("API_FINISHED_ERROR")
//   }
// }

export const get_searchUserModulesAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
  return {
    type:GET_SEARCH_USER_MODULE_ACTION,
    body,
    setModalTypeHandler, 
    setLoaderStatusHandler
  }
};

export const set_searchUserModulesAction = (data) => {
  return {
    type:SET_SEARCH_USER_MODULE_ACTION,
    payload:data
  }
};

export const listmoduleAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Roleservice.list_module();
      if (res.status === 200) {
        dispatch({
          type: GET_MODULES_LIST,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const createRoleAction = (data,cb) => async (dispatch) => {
  createAction(
    Roleservice,
    GET_CREATE_MODULES,
    dispatch,
    data,
    null,
    null,
    null,
    null,
    ()=>{},
    null,
    null,
    null,
    cb
  );
};

export const getbyidRoleAction = (id) => async (dispatch) => {
  try {
    const res = await Roleservice.get(id);
    dispatch({
      type: GET_BY_ID_ROLES,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    // if(err.response?.status === 500) {
    //   getbyidToken(Salesservice, GET_ID_SALES, dispatch, id)
    // }
    // else{
    ErrorAlert(dispatch, err);
    // }
  }
};

export const deleteRoleAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    deleteAction(
      Roleservice,
      DELETE_ROLES,
      dispatch,
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    );
  };
export const updateRoleAction = (id, data, cb, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
  updateAction(Roleservice, UPDATE_ROLES, dispatch, id, data, setModalTypeHandler, setLoaderStatusHandler, cb);
};
export const getbyiduserAction = (id) => async (dispatch) => {
  try {
    const res = await Roleservice.user(id);
    dispatch({
      type: USER_BASED_LOCATIONS,
      payload: res.data,
    });
    
    return Promise.resolve(res.data);
  } catch (err) {
    // if(err.response?.status === 500) {
    //   getbyidToken(Salesservice, GET_ID_SALES, dispatch, id)
    // }
    // else{
    ErrorAlert(dispatch, err);
    // }
  }
};
export const getusermenus = (data) => async (dispatch) => {
  try {
    // const res = await Roleservice.menus(id);
    dispatch({
      type: MENUS_USER_DISPLAY,
      payload: data,
    });
    // return Promise.resolve(res.data);
  } catch (err) {
    // if(err.response?.status === 500) {
    //   getbyidToken(Salesservice, GET_ID_SALES, dispatch, id)
    // }
    // else{
    ErrorAlert(dispatch, err);
    // }
  }
};

export const getPosPages = () => async (dispatch) => {
  try {
    const res = await Roleservice.PosPages();
    dispatch({
      type: GET_POS_PAGES,
      payload: res.data,
    });
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const get_searchUserRoleAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
  return {
    type:GET_SEARCH_USER_ROLE,
    body,
    setModalTypeHandler, 
    setLoaderStatusHandler
  }
};

export const set_searchUserRoleAction = (data) => {
  return {
    type:SET_SEARCH_USER_ROLE,
    payload:data
  }
};

export const userRolePaginationAction =
  (body, cb) => async (dispatch) => {
    try {
      const res = await Roleservice.pagination(body);
      if (res.status === 200) {
        dispatch({
          type: SET_SEARCH_USER_ROLE,
          payload: res.data,
        });
        if(cb){
          cb(res?.data?.data)
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
export const getRoleNameAction = (data) => async (dispatch) => {
    try {
      const res = await Roleservice.roleName(data);
      if (res.status === 200) {
        dispatch({
          type: GET_ROLE_NAME,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getUserRightsByRoleIdAction =
  (body) => async (dispatch) => {
    try {
      const res = await Roleservice.userRights();
      if (res.status === 200) {
        dispatch({
          type: SET_USER_RIGHTS,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const updateUserRightsAction =(data) => async (dispatch) => {
    try {
      const res = await Roleservice.updateUserRights(data);
      if (res.status === 200) {
        dispatch({
          type: UPDATE_USER_RIGHTS,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const userRightsForFrontDeskAction =
  (body) => async (dispatch) => {
    try {
      const res = await Roleservice.frontDeskRights();
      if (res.status === 200) {
        dispatch({
          type: GET_FRONTDESK_RIGHTS,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

   export const favouriteMenuListAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await Roleservice.favouriteMenuList();
      if (res.status === 200) {
        dispatch({
          type: FAVOURITE_MENU_LIST,
          payload: res.data,
        });
        console.log(res.data,"LKLKLKL" )
      }
      return res.data;
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

   export const addFavouriteMenuAction = (data, onSuccess, onError) => async (dispatch) => {
  try {
    const res = await Roleservice.addfavouriteMenu(data);
    if (res.status === 200) {
      dispatch({
        type: ADD_FAVOURITE_MENU,
        payload: res.data,
      });
      if (onSuccess) onSuccess();
    }
    return res.data;
  } catch (err) {
    ErrorAlert(dispatch, err);
    if (onError) onError();
    return Promise.reject("API_FINISHED_ERROR");
  }
};

   export const getChildModulesAction = () => async (dispatch) => {
  try {
    const res = await Roleservice.getChildModules();
    if (res.status === 200) {
      dispatch({
        type: GET_ROLES_CHILD_MODULES,
        payload: res.data,
      });
    }
    return res.data;
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};