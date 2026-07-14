import http from '../http-common'

class Audits{

    createAuditCheckList(data){
        return http.post('/audits/auditCheckList/create', data)
    }

    updateAuditCheckList(data, id){
        return http.put(`/audits/updateAudits/${id}`, data)
    }
    
    getCheckList(data){
        return http.post(`/audits/auditCheckList`, data)
    }

    getAllCheckList(data){
        return http.post(`/audits/auditCheckList/all`, data)
    }

    getAuditData(data){
        return http.post('/audits', data)
    }

    getAuditDataByCheckListId(id){
        return http.get(`/audits/${id}`)
    }

    getAuditCheckListBasedOnAsset(id, payload){
        return http.post(`/audits/auditCheckList/${id}`, payload)
    }

    createAssetAudit(data){
        return http.post(`/audits/auditAsset`, data)
    }

    sendReportNotification(data){
        return http.post(`/audits/sendReportNotification`, data)
    }

    updateSeenCheckList(checkList_id, payload){
        return http.put(`/audits/checkList/${checkList_id}`, payload)
    }

    createChecklist(payload){
        return http.post(`/audits/createChecklist`, payload)
    }

    getChecklist(payload){
        return http.post(`/audits/getChecklist`, payload)
    }

    getAllCheckListTemplate(payload){
        return http.post(`/audits/getAllCheckList`, payload)
    }

    getChecklistById(id){
        return http.get(`/audits/getChecklistById/${id}`)
    }

    updateChecklist(payload, id){
        return http.put(`/audits/updateChecklist/${id}`, payload)
    }

    deleteChecklist(id){
        return http.delete(`/audits/deleteChecklist/${id}`)
    }

    deleteAudit(id){
        return http.put(`/audits/delete/${id}`)
    }

    getAuditsById(checkList_id){
        return http.get(`/audits/getAuditsById/${checkList_id}`)
    }
}

export default new Audits
