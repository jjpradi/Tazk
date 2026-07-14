import {
  ESS_MY_CHANGE_REQUESTS,
  ESS_PENDING_CHANGE_REQUESTS,
  ESS_MY_SALARY_STRUCTURE,
  ESS_MY_SALARY_DEDUCTIONS,
  ESS_TEAM_MEMBERS,
  ESS_TEAM_ATTENDANCE,
  ESS_TEAM_PENDING_REQUESTS,
  ESS_MY_REQUESTS,
} from '../actionTypes';
import EssPortalService from '../../services/essPortal.services';
import {
  CreateAlert,
  ErrorAlert,
  FailLoad,
  ListLoad,
  UpdateAlert,
  DeleteAlert,
} from './load';

// =========================================================================
// Profile Change Requests
// =========================================================================

export const getMyChangeRequestsAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EssPortalService.getMyChangeRequests();
      if (res.status === 200) {
        dispatch({ type: ESS_MY_CHANGE_REQUESTS, payload: res.data });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const getPendingChangeRequestsAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EssPortalService.getPendingChangeRequests();
      if (res.status === 200) {
        dispatch({ type: ESS_PENDING_CHANGE_REQUESTS, payload: res.data });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const createChangeRequestAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EssPortalService.createChangeRequest(data);
      if (res.status === 200) {
        CreateAlert(dispatch);
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const approveChangeRequestAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EssPortalService.approveChangeRequest(data);
      if (res.status === 200) {
        UpdateAlert(dispatch);
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const rejectChangeRequestAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EssPortalService.rejectChangeRequest(data);
      if (res.status === 200) {
        UpdateAlert(dispatch);
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const deleteChangeRequestAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EssPortalService.deleteChangeRequest(id);
      if (res.status === 200) {
        DeleteAlert(dispatch);
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

// =========================================================================
// My Salary Structure
// =========================================================================

export const getMySalaryStructureAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EssPortalService.getMySalaryStructure();
      if (res.status === 200) {
        dispatch({ type: ESS_MY_SALARY_STRUCTURE, payload: res.data });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const getMySalaryDeductionsAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EssPortalService.getMySalaryDeductions();
      if (res.status === 200) {
        dispatch({ type: ESS_MY_SALARY_DEDUCTIONS, payload: res.data });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

// =========================================================================
// Team View
// =========================================================================

export const getMyTeamMembersAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EssPortalService.getMyTeamMembers();
      if (res.status === 200) {
        dispatch({ type: ESS_TEAM_MEMBERS, payload: res.data });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const getTeamAttendanceSummaryAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EssPortalService.getTeamAttendanceSummary();
      if (res.status === 200) {
        dispatch({ type: ESS_TEAM_ATTENDANCE, payload: res.data });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const getTeamPendingRequestsAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EssPortalService.getTeamPendingRequests();
      if (res.status === 200) {
        dispatch({ type: ESS_TEAM_PENDING_REQUESTS, payload: res.data });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

// =========================================================================
// My Requests
// =========================================================================

export const getMyRequestsAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EssPortalService.getMyRequests();
      if (res.status === 200) {
        dispatch({ type: ESS_MY_REQUESTS, payload: res.data });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };
