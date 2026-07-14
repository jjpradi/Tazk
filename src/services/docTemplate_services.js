import http from '../http-common';

class DocTemplateService {
    listTemplates(data) {
        return http.post(`/docTemplate/list`, data);
    }
    getTemplate(id) {
        return http.get(`/docTemplate/${id}`);
    }
    createTemplate(data) {
        return http.post(`/docTemplate/create`, data);
    }
    updateTemplateMeta(id, data) {
        return http.put(`/docTemplate/${id}/meta`, data);
    }
    saveDraft(id, data) {
        return http.put(`/docTemplate/${id}/draft`, data);
    }
    publishTemplate(id, data) {
        return http.put(`/docTemplate/${id}/publish`, data);
    }
    archiveTemplate(id) {
        return http.put(`/docTemplate/${id}/archive`);
    }
    deleteTemplate(id) {
        return http.delete(`/docTemplate/${id}`);
    }
    cloneTemplate(id) {
        return http.post(`/docTemplate/${id}/clone`);
    }
    getVersionHistory(id) {
        return http.get(`/docTemplate/${id}/versions`);
    }
    rollbackTemplate(id, data) {
        return http.put(`/docTemplate/${id}/rollback`, data);
    }
    listAssignments(data) {
        return http.post(`/docTemplate/assignment/list`, data);
    }
    createAssignment(data) {
        return http.post(`/docTemplate/assignment/create`, data);
    }
    updateAssignment(id, data) {
        return http.put(`/docTemplate/assignment/${id}`, data);
    }
    deleteAssignment(id) {
        return http.delete(`/docTemplate/assignment/${id}`);
    }
    resolveTemplate(data) {
        return http.post(`/docTemplate/resolve`, data);
    }
    renderPreview(data) {
        return http.post(`/docTemplate/render/preview`, data);
    }
    logRender(data) {
        return http.post(`/docTemplate/render/log`, data);
    }
    getRenderHistory(docType, docId) {
        return http.get(`/docTemplate/render/history/${docType}/${docId}`);
    }
    listPlaceholders(docType) {
        return http.get(`/docTemplate/placeholders/${docType}`);
    }
}

export default new DocTemplateService();
