import {
  PF_CYCLES, PF_TEMPLATES, PF_TEMPLATE_ITEMS, PF_APPRAISALS,
  PF_MY_APPRAISALS, PF_TEAM_APPRAISALS, PF_APPRAISAL_DETAIL,
  PF_KRA_SCORES, PF_GOALS, PF_DASHBOARD, PF_RATING_DISTRIBUTION,
} from '../actionTypes';
import PerformanceService from '../../services/performance.services';
import { CreateAlert, ErrorAlert, FailLoad, ListLoad, UpdateAlert, DeleteAlert } from './load';

// ─── Appraisal Cycles ────────────────────────────────────────────────────────

export const getCyclesAction =
  (s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.getCycles();
      if (res.status === 200) dispatch({ type: PF_CYCLES, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const createCycleAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.createCycle(data);
      if (res.status === 200) CreateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const updateCycleAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.updateCycle(data);
      if (res.status === 200) UpdateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const updateCycleStatusAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.updateCycleStatus(data);
      if (res.status === 200) UpdateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const deleteCycleAction =
  (id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.deleteCycle(id);
      if (res.status === 200) DeleteAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

// ─── KRA Templates ──────────────────────────────────────────────────────────

export const getTemplatesAction =
  (s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.getTemplates();
      if (res.status === 200) dispatch({ type: PF_TEMPLATES, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const createTemplateAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.createTemplate(data);
      if (res.status === 200) CreateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const updateTemplateAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.updateTemplate(data);
      if (res.status === 200) UpdateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const deleteTemplateAction =
  (id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.deleteTemplate(id);
      if (res.status === 200) DeleteAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getTemplateItemsAction =
  (id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.getTemplateItems(id);
      if (res.status === 200) dispatch({ type: PF_TEMPLATE_ITEMS, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const createTemplateItemAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.createTemplateItem(data);
      if (res.status === 200) CreateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const updateTemplateItemAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.updateTemplateItem(data);
      if (res.status === 200) UpdateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const deleteTemplateItemAction =
  (id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.deleteTemplateItem(id);
      if (res.status === 200) DeleteAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

// ─── Appraisals ──────────────────────────────────────────────────────────────

export const getAppraisalsByCycleAction =
  (cycle_id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.getAppraisalsByCycle(cycle_id);
      if (res.status === 200) dispatch({ type: PF_APPRAISALS, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getMyAppraisalsAction =
  (s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.getMyAppraisals();
      if (res.status === 200) dispatch({ type: PF_MY_APPRAISALS, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getTeamAppraisalsAction =
  (cycle_id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.getTeamAppraisals(cycle_id);
      if (res.status === 200) dispatch({ type: PF_TEAM_APPRAISALS, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getAppraisalByIdAction =
  (id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.getAppraisalById(id);
      if (res.status === 200) dispatch({ type: PF_APPRAISAL_DETAIL, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const createAppraisalAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.createAppraisal(data);
      if (res.status === 200) CreateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const bulkCreateAppraisalsAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.bulkCreateAppraisals(data);
      if (res.status === 200) CreateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const submitSelfReviewAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.submitSelfReview(data);
      if (res.status === 200) UpdateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const submitManagerReviewAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.submitManagerReview(data);
      if (res.status === 200) UpdateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const submitHrReviewAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.submitHrReview(data);
      if (res.status === 200) UpdateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

// ─── KRA Scores ──────────────────────────────────────────────────────────────

export const getKraScoresAction =
  (appraisal_id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.getKraScores(appraisal_id);
      if (res.status === 200) dispatch({ type: PF_KRA_SCORES, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const upsertKraScoreAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.upsertKraScore(data);
      if (res.status === 200) UpdateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

// ─── Goals ───────────────────────────────────────────────────────────────────

export const getGoalsAction =
  (s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.getGoals();
      if (res.status === 200) dispatch({ type: PF_GOALS, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const createGoalAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.createGoal(data);
      if (res.status === 200) CreateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const updateGoalAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.updateGoal(data);
      if (res.status === 200) UpdateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const deleteGoalAction =
  (id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.deleteGoal(id);
      if (res.status === 200) DeleteAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const getDashboardStatsAction =
  (s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.getDashboardStats();
      if (res.status === 200) dispatch({ type: PF_DASHBOARD, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getRatingDistributionAction =
  (cycle_id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await PerformanceService.getRatingDistribution(cycle_id);
      if (res.status === 200) dispatch({ type: PF_RATING_DISTRIBUTION, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };
