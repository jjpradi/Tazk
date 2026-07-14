import {
  EM_POLICIES, EM_CLAIMS, EM_VIOLATION_CLAIMS,
  EM_SUMMARY_STATS, EM_BY_CATEGORY, EM_BY_DEPARTMENT, EM_BY_EMPLOYEE,
} from '../actionTypes';
import ExpenseManagementService from '../../services/expenseManagement.services';
import { CreateAlert, ErrorAlert, FailLoad, ListLoad, UpdateAlert, DeleteAlert } from './load';

export const getExpensePoliciesAction =
  (s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await ExpenseManagementService.getExpensePolicies();
      if (res.status === 200) dispatch({ type: EM_POLICIES, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const createExpensePolicyAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await ExpenseManagementService.createExpensePolicy(data);
      if (res.status === 200) CreateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const updateExpensePolicyAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await ExpenseManagementService.updateExpensePolicy(data);
      if (res.status === 200) UpdateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const deleteExpensePolicyAction =
  (id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await ExpenseManagementService.deleteExpensePolicy(id);
      if (res.status === 200) DeleteAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getClaimsWithPolicyInfoAction =
  (s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await ExpenseManagementService.getClaimsWithPolicyInfo();
      if (res.status === 200) dispatch({ type: EM_CLAIMS, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getViolationClaimsAction =
  (s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await ExpenseManagementService.getViolationClaims();
      if (res.status === 200) dispatch({ type: EM_VIOLATION_CLAIMS, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getExpenseSummaryStatsAction =
  (from_date, to_date, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await ExpenseManagementService.getExpenseSummaryStats(from_date, to_date);
      if (res.status === 200) dispatch({ type: EM_SUMMARY_STATS, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getExpenseByCategoryAction =
  (from_date, to_date, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await ExpenseManagementService.getExpenseByCategory(from_date, to_date);
      if (res.status === 200) dispatch({ type: EM_BY_CATEGORY, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getExpenseByDepartmentAction =
  (from_date, to_date, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await ExpenseManagementService.getExpenseByDepartment(from_date, to_date);
      if (res.status === 200) dispatch({ type: EM_BY_DEPARTMENT, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getExpenseByEmployeeAction =
  (from_date, to_date, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await ExpenseManagementService.getExpenseByEmployee(from_date, to_date);
      if (res.status === 200) dispatch({ type: EM_BY_EMPLOYEE, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };
