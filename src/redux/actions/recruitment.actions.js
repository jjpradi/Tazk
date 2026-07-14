import {
  RC_STAGES, RC_JOB_POSITIONS, RC_JOB_DETAIL, RC_CANDIDATES, RC_CANDIDATE_DETAIL,
  RC_APPLICATIONS, RC_APPLICATIONS_BY_JOB, RC_INTERVIEWS, RC_UPCOMING_INTERVIEWS,
  RC_DASHBOARD, RC_PIPELINE, RC_SOURCES,
} from '../actionTypes';
import RecruitmentService from '../../services/recruitment.services';
import { CreateAlert, ErrorAlert, FailLoad, ListLoad, UpdateAlert, DeleteAlert } from './load';

// ─── Pipeline Stages ────────────────────────────────────────────────────────

export const getStagesAction =
  (s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await RecruitmentService.getStages();
      if (res.status === 200) dispatch({ type: RC_STAGES, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const createStageAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await RecruitmentService.createStage(data);
      if (res.status === 200) CreateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const updateStageAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await RecruitmentService.updateStage(data);
      if (res.status === 200) UpdateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const deleteStageAction =
  (id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await RecruitmentService.deleteStage(id);
      if (res.status === 200) DeleteAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

// ─── Job Positions ──────────────────────────────────────────────────────────

export const getJobPositionsAction =
  (s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await RecruitmentService.getJobPositions();
      if (res.status === 200) dispatch({ type: RC_JOB_POSITIONS, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getJobPositionByIdAction =
  (id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await RecruitmentService.getJobPositionById(id);
      if (res.status === 200) dispatch({ type: RC_JOB_DETAIL, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const createJobPositionAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await RecruitmentService.createJobPosition(data);
      if (res.status === 200) CreateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const updateJobPositionAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await RecruitmentService.updateJobPosition(data);
      if (res.status === 200) UpdateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const updateJobPositionStatusAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await RecruitmentService.updateJobPositionStatus(data);
      if (res.status === 200) UpdateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const deleteJobPositionAction =
  (id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await RecruitmentService.deleteJobPosition(id);
      if (res.status === 200) DeleteAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

// ─── Candidates ─────────────────────────────────────────────────────────────

export const getCandidatesAction =
  (s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await RecruitmentService.getCandidates();
      if (res.status === 200) dispatch({ type: RC_CANDIDATES, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getCandidateByIdAction =
  (id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await RecruitmentService.getCandidateById(id);
      if (res.status === 200) dispatch({ type: RC_CANDIDATE_DETAIL, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const createCandidateAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await RecruitmentService.createCandidate(data);
      if (res.status === 200) CreateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const updateCandidateAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await RecruitmentService.updateCandidate(data);
      if (res.status === 200) UpdateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const deleteCandidateAction =
  (id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await RecruitmentService.deleteCandidate(id);
      if (res.status === 200) DeleteAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

// ─── Applications ───────────────────────────────────────────────────────────

export const getApplicationsAction =
  (s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await RecruitmentService.getApplications();
      if (res.status === 200) dispatch({ type: RC_APPLICATIONS, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getApplicationsByJobAction =
  (job_id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await RecruitmentService.getApplicationsByJob(job_id);
      if (res.status === 200) dispatch({ type: RC_APPLICATIONS_BY_JOB, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const createApplicationAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await RecruitmentService.createApplication(data);
      if (res.status === 200) CreateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const updateApplicationStatusAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await RecruitmentService.updateApplicationStatus(data);
      if (res.status === 200) UpdateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const deleteApplicationAction =
  (id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await RecruitmentService.deleteApplication(id);
      if (res.status === 200) DeleteAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

// ─── Interviews ─────────────────────────────────────────────────────────────

export const getInterviewsByApplicationAction =
  (application_id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await RecruitmentService.getInterviewsByApplication(application_id);
      if (res.status === 200) dispatch({ type: RC_INTERVIEWS, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getUpcomingInterviewsAction =
  (s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await RecruitmentService.getUpcomingInterviews();
      if (res.status === 200) dispatch({ type: RC_UPCOMING_INTERVIEWS, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const createInterviewAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await RecruitmentService.createInterview(data);
      if (res.status === 200) CreateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const updateInterviewAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await RecruitmentService.updateInterview(data);
      if (res.status === 200) UpdateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const submitInterviewFeedbackAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await RecruitmentService.submitInterviewFeedback(data);
      if (res.status === 200) UpdateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const deleteInterviewAction =
  (id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await RecruitmentService.deleteInterview(id);
      if (res.status === 200) DeleteAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

// ─── Dashboard ──────────────────────────────────────────────────────────────

export const getDashboardStatsAction =
  (s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await RecruitmentService.getDashboardStats();
      if (res.status === 200) dispatch({ type: RC_DASHBOARD, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getPipelineSummaryAction =
  (s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await RecruitmentService.getPipelineSummary();
      if (res.status === 200) dispatch({ type: RC_PIPELINE, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getSourceEffectivenessAction =
  (s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await RecruitmentService.getSourceEffectiveness();
      if (res.status === 200) dispatch({ type: RC_SOURCES, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };
