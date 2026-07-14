import http from '../http-common'

class ServiceDue {
    getServiceDueAll(data) {
        return http.post('/serviceDue', data)
    }

    updateServiceDue(data,id){
        return http.put(`/serviceDue/updateServicedue/${id}`, data)
    }

    createServiceDueAll(data) {
        return http.post('/serviceDue/create', data)
    }

    serviceDueCardCount() {
        return http.get(`serviceDue/serviceDueCard`)
    }
    
    getServiceDueByAsset(id ,data) {
        return http.post(`/serviceDue/${id}` ,data)
    }

    getPriority() {
        return http.get(`/serviceDue/getPriority`)
    }

    getServiceType(data) {
        return http.post(`/serviceDue/getServiceType`,data)
    }

    getMeterType() {
        return http.get(`/serviceDue/getMeterType`)
    }
}

export default new ServiceDue