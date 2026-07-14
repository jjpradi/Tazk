import {
  EP_SEARCH_EMPLOYEES,
  EP_GET_PROFILE,
  EP_GET_GRADES,
  EP_GET_QUALIFICATIONS,
  EP_GET_EMERGENCY_CONTACTS,
  EP_GET_WORK_HISTORY,
} from '../actionTypes';
import EmployeeProfileService from '../../services/employeeProfile.services';
import {
  CreateAlert,
  ErrorAlert,
  FailLoad,
  ListLoad,
  UpdateAlert,
  DeleteAlert,
} from './load';

// =========================================================================
// Employees
// =========================================================================

export const searchEmployeesAction =
  (data,setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EmployeeProfileService.searchEmployees(data);
      if (res.status === 200) {
        dispatch({ type: EP_SEARCH_EMPLOYEES, payload: res.data });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const getProfileAction =
  (employee_id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EmployeeProfileService.getProfile(employee_id);
      if (res.status === 200) {
        dispatch({ type: EP_GET_PROFILE, payload: res.data });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const updatePersonalInfoAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await EmployeeProfileService.updatePersonalInfo(data);
      if (res.status === 200) {
        UpdateAlert(dispatch);
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const updateEmployeeProfileAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await EmployeeProfileService.updateEmployeeProfile(data);
      if (res.status === 200) {
        UpdateAlert(dispatch);
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

// =========================================================================
// Grades
// =========================================================================

export const getGradesAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await EmployeeProfileService.getGrades();
      if (res.status === 200) {
        dispatch({ type: EP_GET_GRADES, payload: res.data });
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const createGradeAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await EmployeeProfileService.createGrade(data);
      if (res.status === 200) {
        CreateAlert(dispatch);
        dispatch(getGradesAction(setModalTypeHandler, setLoaderStatusHandler));
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const updateGradeAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await EmployeeProfileService.updateGrade(data);
      if (res.status === 200) {
        UpdateAlert(dispatch);
        dispatch(getGradesAction(setModalTypeHandler, setLoaderStatusHandler));
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const deleteGradeAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await EmployeeProfileService.deleteGrade(id);
      if (res.status === 200) {
        DeleteAlert(dispatch);
        dispatch(getGradesAction(setModalTypeHandler, setLoaderStatusHandler));
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

// =========================================================================
// Qualifications
// =========================================================================

export const getQualificationsAction =
  (employee_id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await EmployeeProfileService.getQualifications(employee_id);
      if (res.status === 200) {
        dispatch({ type: EP_GET_QUALIFICATIONS, payload: res.data });
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const createQualificationAction =
  (data, employee_id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await EmployeeProfileService.createQualification(data);
      if (res.status === 200) {
        CreateAlert(dispatch);
        dispatch(getQualificationsAction(employee_id, setModalTypeHandler, setLoaderStatusHandler));
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const updateQualificationAction =
  (data, employee_id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await EmployeeProfileService.updateQualification(data);
      if (res.status === 200) {
        UpdateAlert(dispatch);
        dispatch(getQualificationsAction(employee_id, setModalTypeHandler, setLoaderStatusHandler));
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const deleteQualificationAction =
  (id, employee_id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await EmployeeProfileService.deleteQualification(id);
      if (res.status === 200) {
        DeleteAlert(dispatch);
        dispatch(getQualificationsAction(employee_id, setModalTypeHandler, setLoaderStatusHandler));
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

// =========================================================================
// Emergency Contacts
// =========================================================================

export const getEmergencyContactsAction =
  (employee_id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await EmployeeProfileService.getEmergencyContacts(employee_id);
      if (res.status === 200) {
        dispatch({ type: EP_GET_EMERGENCY_CONTACTS, payload: res.data });
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const createEmergencyContactAction =
  (data, employee_id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await EmployeeProfileService.createEmergencyContact(data);
      if (res.status === 200) {
        CreateAlert(dispatch);
        dispatch(getEmergencyContactsAction(employee_id, setModalTypeHandler, setLoaderStatusHandler));
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const updateEmergencyContactAction =
  (data, employee_id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await EmployeeProfileService.updateEmergencyContact(data);
      if (res.status === 200) {
        UpdateAlert(dispatch);
        dispatch(getEmergencyContactsAction(employee_id, setModalTypeHandler, setLoaderStatusHandler));
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const deleteEmergencyContactAction =
  (id, employee_id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await EmployeeProfileService.deleteEmergencyContact(id);
      if (res.status === 200) {
        DeleteAlert(dispatch);
        dispatch(getEmergencyContactsAction(employee_id, setModalTypeHandler, setLoaderStatusHandler));
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

// =========================================================================
// Work History
// =========================================================================

export const getWorkHistoryAction =
  (employee_id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await EmployeeProfileService.getWorkHistory(employee_id);
      if (res.status === 200) {
        dispatch({ type: EP_GET_WORK_HISTORY, payload: res.data });
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const createWorkHistoryAction =
  (data, employee_id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await EmployeeProfileService.createWorkHistory(data);
      if (res.status === 200) {
        CreateAlert(dispatch);
        dispatch(getWorkHistoryAction(employee_id, setModalTypeHandler, setLoaderStatusHandler));
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const updateWorkHistoryAction =
  (data, employee_id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await EmployeeProfileService.updateWorkHistory(data);
      if (res.status === 200) {
        UpdateAlert(dispatch);
        dispatch(getWorkHistoryAction(employee_id, setModalTypeHandler, setLoaderStatusHandler));
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const deleteWorkHistoryAction =
  (id, employee_id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await EmployeeProfileService.deleteWorkHistory(id);
      if (res.status === 200) {
        DeleteAlert(dispatch);
        dispatch(getWorkHistoryAction(employee_id, setModalTypeHandler, setLoaderStatusHandler));
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };
