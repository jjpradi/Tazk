import {
  LC_DASHBOARD_STATS,
  LC_LIFECYCLE_EVENTS,
  LC_PROBATION_EMPLOYEES,
  LC_CHECKLIST_TEMPLATES,
  LC_EMPLOYEE_CHECKLIST,
  LC_ONBOARDING_DASHBOARD,
  LC_PENDING_FNF,
  LC_FNF_DETAIL,
  LC_EVENTS_BY_TYPE,
} from '../actionTypes';
import EmployeeLifecycleService from '../../services/employeeLifecycle.services';
import {
  CreateAlert,
  ErrorAlert,
  FailLoad,
  ListLoad,
  UpdateAlert,
  DeleteAlert,
} from './load';

// =========================================================================
// Dashboard
// =========================================================================

export const getDashboardStatsAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EmployeeLifecycleService.getDashboardStats();
      if (res.status === 200) {
        dispatch({ type: LC_DASHBOARD_STATS, payload: res.data });
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
// Lifecycle Events
// =========================================================================

export const getLifecycleEventsAction =
  (employee_id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EmployeeLifecycleService.getLifecycleEvents(employee_id);
      if (res.status === 200) {
        dispatch({ type: LC_LIFECYCLE_EVENTS, payload: res.data });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const getLifecycleEventsByTypeAction =
  (event_type, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EmployeeLifecycleService.getLifecycleEventsByType(event_type);
      if (res.status === 200) {
        dispatch({ type: LC_EVENTS_BY_TYPE, payload: res.data });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const createLifecycleEventAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EmployeeLifecycleService.createLifecycleEvent(data);
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (res.status === 200) CreateAlert(dispatch);
      return Promise.resolve(res.data);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const updateLifecycleEventAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EmployeeLifecycleService.updateLifecycleEvent(data);
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (res.status === 200) UpdateAlert(dispatch);
      return Promise.resolve(res.data);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const approveLifecycleEventAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EmployeeLifecycleService.approveLifecycleEvent(data);
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (res.status === 200) UpdateAlert(dispatch);
      return Promise.resolve(res.data);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const completeLifecycleEventAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EmployeeLifecycleService.completeLifecycleEvent(data);
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (res.status === 200) UpdateAlert(dispatch);
      return Promise.resolve(res.data);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const cancelLifecycleEventAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EmployeeLifecycleService.cancelLifecycleEvent(data);
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (res.status === 200) DeleteAlert(dispatch);
      return Promise.resolve(res.data);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const deleteLifecycleEventAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EmployeeLifecycleService.deleteLifecycleEvent(id);
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (res.status === 200) DeleteAlert(dispatch);
      return Promise.resolve(res.data);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

// =========================================================================
// Probation
// =========================================================================

export const getProbationEmployeesAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EmployeeLifecycleService.getProbationEmployees();
      if (res.status === 200) {
        dispatch({ type: LC_PROBATION_EMPLOYEES, payload: res.data });
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
// Onboarding Checklist Templates
// =========================================================================

export const getChecklistTemplatesAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EmployeeLifecycleService.getChecklistTemplates();
      if (res.status === 200) {
        dispatch({ type: LC_CHECKLIST_TEMPLATES, payload: res.data });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const createChecklistTemplateAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EmployeeLifecycleService.createChecklistTemplate(data);
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (res.status === 200) CreateAlert(dispatch);
      return Promise.resolve(res.data);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const updateChecklistTemplateAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EmployeeLifecycleService.updateChecklistTemplate(data);
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (res.status === 200) UpdateAlert(dispatch);
      return Promise.resolve(res.data);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const deleteChecklistTemplateAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EmployeeLifecycleService.deleteChecklistTemplate(id);
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (res.status === 200) DeleteAlert(dispatch);
      return Promise.resolve(res.data);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

// =========================================================================
// Employee Onboarding Checklist
// =========================================================================

export const getOnboardingDashboardAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EmployeeLifecycleService.getOnboardingDashboard();
      if (res.status === 200) {
        dispatch({ type: LC_ONBOARDING_DASHBOARD, payload: res.data });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const getEmployeeChecklistAction =
  (employee_id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EmployeeLifecycleService.getEmployeeChecklist(employee_id);
      if (res.status === 200) {
        dispatch({ type: LC_EMPLOYEE_CHECKLIST, payload: res.data });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const initializeEmployeeChecklistAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EmployeeLifecycleService.initializeEmployeeChecklist(data);
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (res.status === 200) CreateAlert(dispatch);
      return Promise.resolve(res.data);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const updateChecklistItemStatusAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EmployeeLifecycleService.updateChecklistItemStatus(data);
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (res.status === 200) UpdateAlert(dispatch);
      return Promise.resolve(res.data);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

// =========================================================================
// Full & Final Settlement
// =========================================================================

export const getAllPendingFnfAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EmployeeLifecycleService.getAllPendingFnf();
      if (res.status === 200) {
        dispatch({ type: LC_PENDING_FNF, payload: res.data });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const getFnfByIdAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EmployeeLifecycleService.getFnfById(id);
      if (res.status === 200) {
        dispatch({ type: LC_FNF_DETAIL, payload: res.data });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const createFnfSettlementAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EmployeeLifecycleService.createFnfSettlement(data);
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (res.status === 200) CreateAlert(dispatch);
      return Promise.resolve(res.data);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const updateFnfSettlementAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EmployeeLifecycleService.updateFnfSettlement(data);
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (res.status === 200) UpdateAlert(dispatch);
      return Promise.resolve(res.data);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const approveFnfAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EmployeeLifecycleService.approveFnf(data);
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (res.status === 200) UpdateAlert(dispatch);
      return Promise.resolve(res.data);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const markFnfPaidAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EmployeeLifecycleService.markFnfPaid(data);
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (res.status === 200) UpdateAlert(dispatch);
      return Promise.resolve(res.data);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const deleteFnfSettlementAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await EmployeeLifecycleService.deleteFnfSettlement(id);
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (res.status === 200) DeleteAlert(dispatch);
      return Promise.resolve(res.data);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };
