import {
  HA_HEADCOUNT_SUMMARY, HA_HEADCOUNT_DEPT, HA_HEADCOUNT_GRADE, HA_HEADCOUNT_TREND,
  HA_ATTRITION_SUMMARY, HA_ATTRITION_TREND, HA_ATTRITION_DEPT, HA_ATTRITION_TENURE,
  HA_GENDER, HA_AGE, HA_TENURE, HA_EMP_TYPE,
  HA_SALARY_DEPT, HA_SALARY_TREND, HA_SALARY_GRADE,
  HA_PROBATION, HA_DOC_EXPIRY, HA_POLICY_ACK,
  HA_NEW_JOINERS, HA_BIRTHDAYS, HA_ANNIVERSARIES, HA_DASHBOARD,
} from '../actionTypes';
import HrAnalyticsService from '../../services/hrAnalytics.services';
import { ErrorAlert, FailLoad, ListLoad } from './load';

const fetchAction = (apiFn, type) =>
  (...args) => {
    const s = args[args.length - 2];
    const l = args[args.length - 1];
    const params = args.slice(0, -2);
    return async (dispatch) => {
      try { ListLoad(s, l); const res = await apiFn(...params);
        if (res.status === 200) dispatch({ type, payload: res.data });
        FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
      } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
    };
  };

// Headcount
export const getHeadcountSummaryAction = fetchAction(() => HrAnalyticsService.getHeadcountSummary(), HA_HEADCOUNT_SUMMARY);
export const getHeadcountByDeptAction = fetchAction(() => HrAnalyticsService.getHeadcountByDepartment(), HA_HEADCOUNT_DEPT);
export const getHeadcountByGradeAction = fetchAction(() => HrAnalyticsService.getHeadcountByGrade(), HA_HEADCOUNT_GRADE);
export const getHeadcountTrendAction = fetchAction(() => HrAnalyticsService.getHeadcountTrend(), HA_HEADCOUNT_TREND);

// Attrition
export const getAttritionSummaryAction =
  (from, to, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await HrAnalyticsService.getAttritionSummary(from, to);
      if (res.status === 200) dispatch({ type: HA_ATTRITION_SUMMARY, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getAttritionTrendAction = fetchAction(() => HrAnalyticsService.getAttritionTrend(), HA_ATTRITION_TREND);

export const getAttritionByDeptAction =
  (from, to, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await HrAnalyticsService.getAttritionByDepartment(from, to);
      if (res.status === 200) dispatch({ type: HA_ATTRITION_DEPT, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getAttritionByTenureAction =
  (from, to, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await HrAnalyticsService.getAttritionByTenure(from, to);
      if (res.status === 200) dispatch({ type: HA_ATTRITION_TENURE, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

// Demographics
export const getGenderDiversityAction = fetchAction(() => HrAnalyticsService.getGenderDiversity(), HA_GENDER);
export const getAgeDistributionAction = fetchAction(() => HrAnalyticsService.getAgeDistribution(), HA_AGE);
export const getTenureDistributionAction = fetchAction(() => HrAnalyticsService.getTenureDistribution(), HA_TENURE);
export const getEmploymentTypeAction = fetchAction(() => HrAnalyticsService.getEmploymentTypeBreakdown(), HA_EMP_TYPE);

// Salary Cost
export const getSalaryCostByDeptAction =
  (month, year, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await HrAnalyticsService.getSalaryCostByDepartment(month, year);
      if (res.status === 200) dispatch({ type: HA_SALARY_DEPT, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getSalaryCostTrendAction =
  (from, to, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await HrAnalyticsService.getSalaryCostTrend(from, to);
      if (res.status === 200) dispatch({ type: HA_SALARY_TREND, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getSalaryCostByGradeAction =
  (month, year, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await HrAnalyticsService.getSalaryCostByGrade(month, year);
      if (res.status === 200) dispatch({ type: HA_SALARY_GRADE, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

// Compliance
export const getProbationDueAction = fetchAction(() => HrAnalyticsService.getProbationDue(), HA_PROBATION);
export const getDocumentExpiryAction = fetchAction(() => HrAnalyticsService.getDocumentExpiry(), HA_DOC_EXPIRY);
export const getPolicyAckAction = fetchAction(() => HrAnalyticsService.getPolicyAcknowledgmentStatus(), HA_POLICY_ACK);

// New Joiners
export const getNewJoinersAction =
  (from, to, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await HrAnalyticsService.getNewJoiners(from, to);
      if (res.status === 200) dispatch({ type: HA_NEW_JOINERS, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

// Events
export const getUpcomingBirthdaysAction = fetchAction(() => HrAnalyticsService.getUpcomingBirthdays(), HA_BIRTHDAYS);
export const getWorkAnniversariesAction = fetchAction(() => HrAnalyticsService.getWorkAnniversaries(), HA_ANNIVERSARIES);

// Dashboard
export const getHrDashboardKpisAction = fetchAction(() => HrAnalyticsService.getHrDashboardKpis(), HA_DASHBOARD);
