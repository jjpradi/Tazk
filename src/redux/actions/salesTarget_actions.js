import SalesTargetService from '../../services/salesTarget_services';
import { OpenalertActions } from './alert_actions';
import * as types from '../actionTypes/salesTarget_types';

const handleError = (dispatch, err) => {
  dispatch({ type: types.ST_ERROR, payload: err?.response?.data?.message || err.message });
  dispatch(OpenalertActions({ msg: err?.response?.data?.message || 'Something went wrong', severity: 'error' }));
};

// ==================== PERIODS ====================

export const getPeriodsAction = (params) => async (dispatch) => {
  try {
    dispatch({ type: types.ST_LOADING, payload: true });
    const res = await SalesTargetService.getPeriods(params);
    dispatch({ type: types.ST_PERIODS_LIST, payload: res.data?.data?.rows || res.data?.data || res.data || [] });
  } catch (err) { handleError(dispatch, err); }
  finally { dispatch({ type: types.ST_LOADING, payload: false }); }
};

export const getPeriodByIdAction = (id) => async (dispatch) => {
  try {
    const res = await SalesTargetService.getPeriodById(id);
    dispatch({ type: types.ST_PERIOD_DETAIL, payload: res.data?.data || res.data || null });
  } catch (err) { handleError(dispatch, err); }
};

export const createPeriodAction = (data, callback) => async (dispatch) => {
  try {
    const res = await SalesTargetService.createPeriod(data);
    if (res.data?.message === 'Period already exists') {
      dispatch(OpenalertActions({ msg: 'Period already exists for this month', severity: 'warning' }));
    } else {
      dispatch({ type: types.ST_PERIOD_CREATED, payload: res.data?.data || res.data });
      dispatch(OpenalertActions({ msg: 'Period created successfully', severity: 'success' }));
    }
    if (callback) callback(res.data);
  } catch (err) { handleError(dispatch, err); }
};

export const publishPeriodAction = (id, callback) => async (dispatch) => {
  try {
    await SalesTargetService.updatePeriodStatus(id, { status: 'published' });
    dispatch(OpenalertActions({ msg: 'Targets published', severity: 'success' }));
    if (callback) callback();
  } catch (err) { handleError(dispatch, err); }
};

export const lockPeriodAction = (id, callback) => async (dispatch) => {
  try {
    await SalesTargetService.updatePeriodStatus(id, { status: 'locked' });
    dispatch(OpenalertActions({ msg: 'Period locked', severity: 'success' }));
    if (callback) callback();
  } catch (err) { handleError(dispatch, err); }
};

// ==================== TARGETS ====================

export const getTargetsAction = (params) => async (dispatch) => {
  try {
    const res = await SalesTargetService.getTargets(params);
    dispatch({ type: types.ST_TARGETS_LIST, payload: res.data?.data?.rows || res.data?.data || res.data || [] });
  } catch (err) { handleError(dispatch, err); }
};

export const createTargetAction = (data, callback) => async (dispatch) => {
  try {
    await SalesTargetService.createTarget(data);
    dispatch(OpenalertActions({ msg: 'Target created', severity: 'success' }));
    if (callback) callback();
  } catch (err) { handleError(dispatch, err); }
};

export const createTargetsBulkAction = (data, callback) => async (dispatch) => {
  try {
    await SalesTargetService.createTargetsBulk(data);
    dispatch(OpenalertActions({ msg: 'Targets saved', severity: 'success' }));
    if (callback) callback();
  } catch (err) { handleError(dispatch, err); }
};

export const updateTargetAction = (id, data, callback) => async (dispatch) => {
  try {
    await SalesTargetService.updateTarget(id, data);
    dispatch(OpenalertActions({ msg: 'Target updated', severity: 'success' }));
    if (callback) callback();
  } catch (err) { handleError(dispatch, err); }
};

export const getTargetHierarchyAction = (periodId) => async (dispatch) => {
  try {
    const res = await SalesTargetService.getTargetHierarchy({ period_id: periodId });
    dispatch({ type: types.ST_TARGET_HIERARCHY, payload: res.data?.data || res.data || [] });
  } catch (err) { handleError(dispatch, err); }
};

export const autoSuggestAction = (data, callback) => async (dispatch) => {
  try {
    const res = await SalesTargetService.autoSuggest(data);
    dispatch({ type: types.ST_SUGGESTIONS, payload: res.data });
    if (callback) callback(res.data);
  } catch (err) { handleError(dispatch, err); }
};

// ==================== ACHIEVEMENT ====================

export const computeAchievementAction = (periodId, callback) => async (dispatch) => {
  try {
    dispatch({ type: types.ST_LOADING, payload: true });
    await SalesTargetService.computeAchievement({ period_id: periodId });
    dispatch(OpenalertActions({ msg: 'Achievement computed', severity: 'success' }));
    if (callback) callback();
  } catch (err) { handleError(dispatch, err); }
  finally { dispatch({ type: types.ST_LOADING, payload: false }); }
};

export const getAchievementSummaryAction = (periodId, params) => async (dispatch) => {
  try {
    const res = await SalesTargetService.getTargets({ ...params, period_id: periodId, target_level: 'salesman' });
    dispatch({ type: types.ST_ACHIEVEMENT_SUMMARY, payload: res.data?.data?.rows || res.data?.data || res.data || [] });
  } catch (err) { handleError(dispatch, err); }
};

export const getLeaderboardAction = (periodId, params) => async (dispatch) => {
  try {
    const res = await SalesTargetService.getLeaderboard({ ...params, period_id: periodId });
    dispatch({ type: types.ST_LEADERBOARD, payload: res.data?.data?.rows || res.data?.data || res.data || [] });
  } catch (err) { handleError(dispatch, err); }
};

export const getMyTargetAction = (periodId) => async (dispatch) => {
  try {
    const res = await SalesTargetService.getMyTargets({ period_id: periodId });
    dispatch({ type: types.ST_MY_TARGET, payload: res.data?.data || res.data || null });
  } catch (err) { handleError(dispatch, err); }
};

export const getMyTeamAction = (periodId) => async (dispatch) => {
  try {
    const res = await SalesTargetService.getTeam({ period_id: periodId });
    dispatch({ type: types.ST_MY_TEAM, payload: res.data?.data || res.data || [] });
  } catch (err) { handleError(dispatch, err); }
};

export const getHistoricalTrendAction = (params) => async (dispatch) => {
  try {
    const res = await SalesTargetService.getHistoricalTrend(params);
    dispatch({ type: types.ST_HISTORICAL_TREND, payload: res.data?.data?.rows || res.data?.data || [] });
  } catch (err) { handleError(dispatch, err); }
};

// ==================== INCENTIVE PLANS ====================

export const getPlansAction = (params) => async (dispatch) => {
  try {
    const res = await SalesTargetService.getPlans(params);
    dispatch({ type: types.ST_PLANS_LIST, payload: res.data?.data?.rows || res.data?.data || res.data || [] });
  } catch (err) { handleError(dispatch, err); }
};

export const getPlanByIdAction = (id) => async (dispatch) => {
  try {
    const res = await SalesTargetService.getPlanById(id);
    dispatch({ type: types.ST_PLAN_DETAIL, payload: res.data?.data || res.data || null });
  } catch (err) { handleError(dispatch, err); }
};

export const createPlanAction = (data, callback) => async (dispatch) => {
  try {
    await SalesTargetService.createPlan(data);
    dispatch(OpenalertActions({ msg: 'Incentive plan created', severity: 'success' }));
    if (callback) callback();
  } catch (err) { handleError(dispatch, err); }
};

export const updatePlanAction = (id, data, callback) => async (dispatch) => {
  try {
    await SalesTargetService.updatePlan(id, data);
    dispatch(OpenalertActions({ msg: 'Plan updated', severity: 'success' }));
    if (callback) callback();
  } catch (err) { handleError(dispatch, err); }
};

// ==================== INCENTIVE RESULTS ====================

export const computeIncentivesAction = (periodId, callback) => async (dispatch) => {
  try {
    dispatch({ type: types.ST_LOADING, payload: true });
    await SalesTargetService.computeIncentives({ period_id: periodId });
    dispatch(OpenalertActions({ msg: 'Incentives computed', severity: 'success' }));
    if (callback) callback();
  } catch (err) { handleError(dispatch, err); }
  finally { dispatch({ type: types.ST_LOADING, payload: false }); }
};

export const getIncentiveResultsAction = (periodId, params) => async (dispatch) => {
  try {
    const res = await SalesTargetService.getResults({ ...params, period_id: periodId });
    dispatch({ type: types.ST_INCENTIVE_RESULTS, payload: res.data?.data?.rows || res.data?.data || res.data || [] });
  } catch (err) { handleError(dispatch, err); }
};

export const approveResultAction = (id, callback) => async (dispatch) => {
  try {
    await SalesTargetService.approveResult(id);
    dispatch(OpenalertActions({ msg: 'Approved', severity: 'success' }));
    if (callback) callback();
  } catch (err) { handleError(dispatch, err); }
};

export const rejectResultAction = (id, data, callback) => async (dispatch) => {
  try {
    await SalesTargetService.rejectResult(id, data);
    dispatch(OpenalertActions({ msg: 'Rejected', severity: 'info' }));
    if (callback) callback();
  } catch (err) { handleError(dispatch, err); }
};

export const bulkApproveAction = (data, callback) => async (dispatch) => {
  try {
    await SalesTargetService.bulkApprove(data);
    dispatch(OpenalertActions({ msg: 'Bulk approved', severity: 'success' }));
    if (callback) callback();
  } catch (err) { handleError(dispatch, err); }
};
