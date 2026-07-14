
import {
  ListLoad,
  FailLoad,
  ErrorAlert,
  CreateAlert,
  successmsg,
  errormsg,
  UpdateAlert,
  DeleteAlert,
  departmentExists
} from './load';
import { deleteAction } from './actions';
import departmentHead_service from 'services/departmentHead_service';
import { GET_BY_ID_DEPARTMENTS_HEAD, GET_DEPARTMENT_BASED_EMPLOYEE_FOR_DEPARTMENT_HEAD, GET_DEPARTMENT_BY_ID, GET_ROLENAME, GET_SEARCH_DEPARTMENT, GET_SEARCH_DEPARTMENTS_HEAD, GET__SEARCH_DEPARTMENT_BASED_EMPLOYEE_FOR_DEPARTMENT_HEAD, LIST_DEPARTMENTS_HEAD, SET_SEARCH_DEPARTMENT, SET_SEARCH_DEPARTMENTS_HEAD, SET_SEARCH_DEPARTMENT_BASED_EMPLOYEE_FOR_DEPARTMENT_HEAD } from 'redux/actionTypes';

export const ListDepartmentHead =
  (setModalTypeHandler, setLoaderStatusHandler, data) =>
    async (dispatch) => {
      try {

        const res = await departmentHead_service.getAll(data);
        if (res.status === 200) {
          dispatch({
            type: SET_SEARCH_DEPARTMENTS_HEAD,
            payload: res.data,
          });
        }

        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {

        ErrorAlert(dispatch, err);

        return Promise.reject("API_FINISHED_ERROR");
      }
    };



export const getRoleNameBasedOnEmployee =
  (id, response) =>
    async (dispatch) => {
      try {



        const res = await departmentHead_service.getRoleName(id);


        if (res.status === 200) {
          dispatch({
            type: GET_ROLENAME,
            payload: res.data,
          });
        }

        if (response) {
          response(res.data)
        }

        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {

        ErrorAlert(dispatch, err);

        return Promise.reject("API_FINISHED_ERROR");
      }
    };

export const CreateDepartmentHead =
  (
    data, response
  ) =>
    async (dispatch) => {
      try {

        const res = await departmentHead_service.create(data);

        dispatch({
          type: SET_SEARCH_DEPARTMENTS_HEAD,
          payload: res.data,
        });

        if (res) {
          response(res.data)
        }
        CreateAlert(dispatch);


        return Promise.resolve(response.data);
      } catch (err) {

        ErrorAlert(dispatch, err);

        return Promise.reject(err);

      }
    };


export const ListDepartmentHeadById =
  (id, response) => async (dispatch) => {
    try {

      const res = await departmentHead_service.getbyid(id);
      dispatch({
        type: GET_BY_ID_DEPARTMENTS_HEAD,
        payload: res.data,
      });

      if (res) {
        response(res.data)
      }
      return Promise.resolve(res.data);
    } catch (err) {

      ErrorAlert(dispatch, err);

      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const updateDepartmentHead =
  (
    id,
    data,
    response

  ) =>
    async (dispatch) => {
      try {

        const res = await departmentHead_service.update(id, data);

        dispatch({
          type: SET_SEARCH_DEPARTMENTS_HEAD,
          payload: res.data,
        });

        if(res){
          response(res.data)
        }

        UpdateAlert(dispatch);
        return Promise.resolve(res.data);
      } catch (err) {

        ErrorAlert(dispatch, err);

        return Promise.reject(err);

      }
    };

export const deleteDepartmentHead =
  (
    id,
  ) =>
    async (dispatch) => {
      try {

        const res = await departmentHead_service.delete(id);
        if (res.data.changedRows === 1) DeleteAlert(dispatch);
        dispatch({
          type: SET_SEARCH_DEPARTMENTS_HEAD,
          payload: res.data,
        });


        return Promise.resolve(res.data);
      } catch (err) {

        ErrorAlert(dispatch, err);

        return Promise.reject(err);
        // }
      }
    };


export const getDeptBaseEmpFilterAction =
  (data, response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await departmentHead_service.getDeptBaseEmpFilter(data);
      if (res.status === 200) {
        dispatch({
          type: GET_DEPARTMENT_BASED_EMPLOYEE_FOR_DEPARTMENT_HEAD,
          payload: res.data,
        });

        if (response) {
          response()
        }

      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


export const department =
  (setModalTypeHandler, setLoaderStatusHandler, data) =>
    async (dispatch) => {
      try {

        const res = await departmentHead_service.getDepartment(data);
        if (res.status === 200) {
          dispatch({
            type: SET_SEARCH_DEPARTMENT,
            payload: res.data,
          });
        }

        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {

        ErrorAlert(dispatch, err);

        return Promise.reject("API_FINISHED_ERROR");
      }
    };


export const CreateDepartment =
  (
    data, response
  ) =>
    async (dispatch) => {
      try {

        const res = await departmentHead_service.createDepartment(data);


        if (res.data.status === 'Department Already Exists') {
          departmentExists(dispatch, res.data.status)

        }
        else {
          dispatch({
            type: SET_SEARCH_DEPARTMENT,
            payload: res.data,
          });

          if (res) {
            response(res.data)
          }
          CreateAlert(dispatch);
        }




        return Promise.resolve(response.data);
      } catch (err) {

        ErrorAlert(dispatch, err);

        return Promise.reject(err);

      }
    };

export const ListDepartmentById =
  (id, response) => async (dispatch) => {
    try {

      const res = await departmentHead_service.getDepartmentById(id);
      dispatch({
        type: GET_DEPARTMENT_BY_ID,
        payload: res.data,
      });

      if (res) {
        response(res.data)
      }
      return Promise.resolve(res.data);
    } catch (err) {

      ErrorAlert(dispatch, err);

      return Promise.reject("API_FINISHED_ERROR");
    }
  };


export const updateDepartment =
  (
    id,
    data,
    response

  ) =>
    async (dispatch) => {
      try {

        const res = await departmentHead_service.updateDepartment(id, data);

        dispatch({
          type: SET_SEARCH_DEPARTMENT,
          payload: res.data,
        });

        if (res) {
          response(res.data)
        }

        UpdateAlert(dispatch);
        return Promise.resolve(res.data);
      } catch (err) {

        ErrorAlert(dispatch, err);

        return Promise.reject(err);

      }
    };

export const deleteDepartment =
  (
    id,response
  ) =>
    async (dispatch) => {
      try {

        const res = await departmentHead_service.deleteDepartment(id);

        if (res.data.status === 'Cannot Delete Department Already Used') {
          departmentExists(dispatch, res.data.status)

        }
        else{
          if (res.data.changedRows === 1) DeleteAlert(dispatch);
          dispatch({
            type: SET_SEARCH_DEPARTMENT,
            payload: res.data,
          });
          if (res) {
            response(res.data)
          }
        }
    

        return Promise.resolve(res.data);
      } catch (err) {

        ErrorAlert(dispatch, err);

        return Promise.reject(err);
      }
    };

export const setSearchDepartmentState = (data) => {
  return {
    type: SET_SEARCH_DEPARTMENT,
    payload: data
  }
};

export const getSearchDepartmentAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type: GET_SEARCH_DEPARTMENT,
    body,
    setModalTypeHandler,
    setLoaderStatusHandler
  }
};

export const setSearchDepartmentHeadState = (data) => {
  return {
    type: SET_SEARCH_DEPARTMENTS_HEAD,
    payload: data
  }
};

export const getSearchDepartmentHeadAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type: GET_SEARCH_DEPARTMENTS_HEAD,
    body,
    setModalTypeHandler,
    setLoaderStatusHandler
  }
};

export const get_search_department_based_employee_for_department_head = (body, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type: GET__SEARCH_DEPARTMENT_BASED_EMPLOYEE_FOR_DEPARTMENT_HEAD,
    data: body,
    setModalTypeHandler,
    setLoaderStatusHandler
  }
};

export const set_search_department_based_employee_for_department_head = (data) => {
  return {
    type: SET_SEARCH_DEPARTMENT_BASED_EMPLOYEE_FOR_DEPARTMENT_HEAD,
    payload: data
  }
};
