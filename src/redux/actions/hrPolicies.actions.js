import {
  HP_POLICIES, HP_ACTIVE_POLICIES, HP_POLICY_DETAIL,
  HP_ACKNOWLEDGMENTS, HP_MY_ACKNOWLEDGED, HP_PENDING_ACKS,
  HP_COMPLIANCE, HP_UNACKNOWLEDGED,
} from '../actionTypes';
import HrPoliciesService from '../../services/hrPolicies.services';
import { CreateAlert, ErrorAlert, FailLoad, ListLoad, UpdateAlert, DeleteAlert } from './load';

export const getPoliciesAction =
  (s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await HrPoliciesService.getPolicies();
      if (res.status === 200) dispatch({ type: HP_POLICIES, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getActivePoliciesAction =
  (s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await HrPoliciesService.getActivePolicies();
      if (res.status === 200) dispatch({ type: HP_ACTIVE_POLICIES, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getPolicyByIdAction =
  (id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await HrPoliciesService.getPolicyById(id);
      if (res.status === 200) dispatch({ type: HP_POLICY_DETAIL, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const createPolicyAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await HrPoliciesService.createPolicy(data);
      if (res.status === 200) CreateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const updatePolicyAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await HrPoliciesService.updatePolicy(data);
      if (res.status === 200) UpdateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const publishPolicyAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await HrPoliciesService.publishPolicy(data);
      if (res.status === 200) UpdateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const archivePolicyAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await HrPoliciesService.archivePolicy(data);
      if (res.status === 200) UpdateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const deletePolicyAction =
  (id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await HrPoliciesService.deletePolicy(id);
      if (res.status === 200) DeleteAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const acknowledgePolicyAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await HrPoliciesService.acknowledgePolicy(data);
      if (res.status === 200) UpdateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getPolicyAcknowledgmentsAction =
  (policy_id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await HrPoliciesService.getPolicyAcknowledgments(policy_id);
      if (res.status === 200) dispatch({ type: HP_ACKNOWLEDGMENTS, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getMyAcknowledgedPoliciesAction =
  (s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await HrPoliciesService.getMyAcknowledgedPolicies();
      if (res.status === 200) dispatch({ type: HP_MY_ACKNOWLEDGED, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getPendingAcknowledgmentsAction =
  (s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await HrPoliciesService.getPendingAcknowledgments();
      if (res.status === 200) dispatch({ type: HP_PENDING_ACKS, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getComplianceDashboardAction =
  (s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await HrPoliciesService.getComplianceDashboard();
      if (res.status === 200) dispatch({ type: HP_COMPLIANCE, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getUnacknowledgedEmployeesAction =
  (policy_id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await HrPoliciesService.getUnacknowledgedEmployees(policy_id);
      if (res.status === 200) dispatch({ type: HP_UNACKNOWLEDGED, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };
