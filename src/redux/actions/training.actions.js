import {
  TR_SKILLS, TR_PROGRAMS, TR_PROGRAM_DETAIL, TR_SESSIONS, TR_SESSIONS_BY_PROGRAM,
  TR_ENROLLMENTS, TR_ENROLLMENTS_BY_EMP, TR_FEEDBACK, TR_EMPLOYEE_SKILLS,
  TR_SKILLS_BY_EMP, TR_DASHBOARD, TR_CATEGORY_BREAKDOWN, TR_SKILL_GAP,
} from '../actionTypes';
import TrainingService from '../../services/training.services';
import { CreateAlert, ErrorAlert, FailLoad, ListLoad, UpdateAlert, DeleteAlert } from './load';

// ─── Skills ─────────────────────────────────────────────────────────────────

export const getSkillsAction =
  (s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.getSkills();
      if (res.status === 200) dispatch({ type: TR_SKILLS, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const createSkillAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.createSkill(data);
      if (res.status === 200) CreateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const updateSkillAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.updateSkill(data);
      if (res.status === 200) UpdateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const deleteSkillAction =
  (id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.deleteSkill(id);
      if (res.status === 200) DeleteAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

// ─── Programs ───────────────────────────────────────────────────────────────

export const getProgramsAction =
  (s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.getPrograms();
      if (res.status === 200) dispatch({ type: TR_PROGRAMS, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getProgramByIdAction =
  (id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.getProgramById(id);
      if (res.status === 200) dispatch({ type: TR_PROGRAM_DETAIL, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const createProgramAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.createProgram(data);
      if (res.status === 200) CreateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const updateProgramAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.updateProgram(data);
      if (res.status === 200) UpdateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const deleteProgramAction =
  (id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.deleteProgram(id);
      if (res.status === 200) DeleteAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

// ─── Sessions ───────────────────────────────────────────────────────────────

export const getSessionsAction =
  (s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.getSessions();
      if (res.status === 200) dispatch({ type: TR_SESSIONS, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getSessionsByProgramAction =
  (program_id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.getSessionsByProgram(program_id);
      if (res.status === 200) dispatch({ type: TR_SESSIONS_BY_PROGRAM, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const createSessionAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.createSession(data);
      if (res.status === 200) CreateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const updateSessionAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.updateSession(data);
      if (res.status === 200) UpdateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const updateSessionStatusAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.updateSessionStatus(data);
      if (res.status === 200) UpdateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const deleteSessionAction =
  (id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.deleteSession(id);
      if (res.status === 200) DeleteAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

// ─── Enrollments ────────────────────────────────────────────────────────────

export const getEnrollmentsBySessionAction =
  (session_id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.getEnrollmentsBySession(session_id);
      if (res.status === 200) dispatch({ type: TR_ENROLLMENTS, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getEnrollmentsByEmployeeAction =
  (employee_id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.getEnrollmentsByEmployee(employee_id);
      if (res.status === 200) dispatch({ type: TR_ENROLLMENTS_BY_EMP, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const createEnrollmentAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.createEnrollment(data);
      if (res.status === 200) CreateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const bulkCreateEnrollmentAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.bulkCreateEnrollment(data);
      if (res.status === 200) CreateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const updateEnrollmentAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.updateEnrollment(data);
      if (res.status === 200) UpdateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const deleteEnrollmentAction =
  (id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.deleteEnrollment(id);
      if (res.status === 200) DeleteAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

// ─── Feedback ───────────────────────────────────────────────────────────────

export const getFeedbackBySessionAction =
  (session_id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.getFeedbackBySession(session_id);
      if (res.status === 200) dispatch({ type: TR_FEEDBACK, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const createFeedbackAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.createFeedback(data);
      if (res.status === 200) CreateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const deleteFeedbackAction =
  (id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.deleteFeedback(id);
      if (res.status === 200) DeleteAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

// ─── Employee Skills ────────────────────────────────────────────────────────

export const getEmployeeSkillsAction =
  (s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.getEmployeeSkills();
      if (res.status === 200) dispatch({ type: TR_EMPLOYEE_SKILLS, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getSkillsByEmployeeAction =
  (employee_id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.getSkillsByEmployee(employee_id);
      if (res.status === 200) dispatch({ type: TR_SKILLS_BY_EMP, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const upsertEmployeeSkillAction =
  (data, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.upsertEmployeeSkill(data);
      if (res.status === 200) UpdateAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const deleteEmployeeSkillAction =
  (id, s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.deleteEmployeeSkill(id);
      if (res.status === 200) DeleteAlert(dispatch);
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

// ─── Dashboard ──────────────────────────────────────────────────────────────

export const getDashboardStatsAction =
  (s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.getDashboardStats();
      if (res.status === 200) dispatch({ type: TR_DASHBOARD, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getCategoryBreakdownAction =
  (s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.getCategoryBreakdown();
      if (res.status === 200) dispatch({ type: TR_CATEGORY_BREAKDOWN, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };

export const getSkillGapSummaryAction =
  (s, l) => async (dispatch) => {
    try { ListLoad(s, l); const res = await TrainingService.getSkillGapSummary();
      if (res.status === 200) dispatch({ type: TR_SKILL_GAP, payload: res.data });
      FailLoad(s, l); return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) { FailLoad(s, l); ErrorAlert(dispatch, err); return Promise.reject('API_FINISHED_ERROR'); }
  };
