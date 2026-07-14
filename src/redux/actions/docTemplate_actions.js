import {
    LIST_DOC_TEMPLATES,
    GET_DOC_TEMPLATE,
    LIST_DOC_ASSIGNMENTS,
    LIST_DOC_PLACEHOLDERS
} from '../actionTypes';
import docTemplateService from 'services/docTemplate_services';
import { ErrorAlert, CreateAlert, UpdateAlert, DeleteAlert } from './load';

export const listDocTemplatesAction = (data) => async (dispatch) => {
    try {
        const res = await docTemplateService.listTemplates(data);
        dispatch({ type: LIST_DOC_TEMPLATES, payload: res.data });
        return Promise.resolve(res.data);
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject(err);
    }
};

export const getDocTemplateAction = (id) => async (dispatch) => {
    try {
        const res = await docTemplateService.getTemplate(id);
        dispatch({ type: GET_DOC_TEMPLATE, payload: res.data });
        return Promise.resolve(res.data);
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject(err);
    }
};

export const createDocTemplateAction = (data) => async (dispatch) => {
    try {
        const res = await docTemplateService.createTemplate(data);
        CreateAlert(dispatch);
        return Promise.resolve(res.data);
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject(err);
    }
};

export const updateDocTemplateMetaAction = (id, data) => async (dispatch) => {
    try {
        const res = await docTemplateService.updateTemplateMeta(id, data);
        UpdateAlert(dispatch);
        return Promise.resolve(res.data);
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject(err);
    }
};

export const saveDraftAction = (id, data) => async (dispatch) => {
    try {
        const res = await docTemplateService.saveDraft(id, data);
        return Promise.resolve(res.data);
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject(err);
    }
};

export const publishDocTemplateAction = (id, data) => async (dispatch) => {
    try {
        const res = await docTemplateService.publishTemplate(id, data);
        UpdateAlert(dispatch);
        return Promise.resolve(res.data);
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject(err);
    }
};

export const cloneDocTemplateAction = (id) => async (dispatch) => {
    try {
        const res = await docTemplateService.cloneTemplate(id);
        CreateAlert(dispatch);
        return Promise.resolve(res.data);
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject(err);
    }
};

export const deleteDocTemplateAction = (id) => async (dispatch) => {
    try {
        const res = await docTemplateService.deleteTemplate(id);
        DeleteAlert(dispatch);
        return Promise.resolve(res.data);
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject(err);
    }
};

export const getVersionHistoryAction = (id) => async () => {
    try {
        const res = await docTemplateService.getVersionHistory(id);
        return Promise.resolve(res.data);
    } catch (err) {
        return Promise.reject(err);
    }
};

export const rollbackDocTemplateAction = (id, data) => async (dispatch) => {
    try {
        const res = await docTemplateService.rollbackTemplate(id, data);
        UpdateAlert(dispatch);
        return Promise.resolve(res.data);
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject(err);
    }
};

export const listDocAssignmentsAction = (data) => async (dispatch) => {
    try {
        const res = await docTemplateService.listAssignments(data);
        dispatch({ type: LIST_DOC_ASSIGNMENTS, payload: res.data });
        return Promise.resolve(res.data);
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject(err);
    }
};

export const createDocAssignmentAction = (data) => async (dispatch) => {
    try {
        const res = await docTemplateService.createAssignment(data);
        CreateAlert(dispatch);
        return Promise.resolve(res.data);
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject(err);
    }
};

export const resolveDocTemplateAction = (data) => async () => {
    try {
        const res = await docTemplateService.resolveTemplate(data);
        return Promise.resolve(res.data);
    } catch (err) {
        return Promise.reject(err);
    }
};

export const renderPreviewAction = (data) => async () => {
    try {
        const res = await docTemplateService.renderPreview(data);
        return Promise.resolve(res.data);
    } catch (err) {
        return Promise.reject(err);
    }
};

export const logRenderAction = (data) => async () => {
    try {
        const res = await docTemplateService.logRender(data);
        return Promise.resolve(res.data);
    } catch (err) {
        return Promise.reject(err);
    }
};

export const listDocPlaceholdersAction = (docType) => async (dispatch) => {
    try {
        const res = await docTemplateService.listPlaceholders(docType);
        dispatch({ type: LIST_DOC_PLACEHOLDERS, payload: res.data });
        return Promise.resolve(res.data);
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject(err);
    }
};
