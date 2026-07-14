import http from '../http-common'

class Compliances{
    getCompliancesLOV(data){
        return http.post('/compliances/LOV', data)
    }

    getCompliancesForInitialLov(){
        return http.get('/compliances/getCompliancesForInitialLov')
    }

    deleteCompliance(id){
        return http.delete(`/compliances/${id}`)
    }

    deleteCompliancesForInitialLov(id){
        return http.delete(`/compliances/deleteCompliancesForInitialLov/${id}`)
    }
    
    getComplianceById(id ,data){
        return http.post(`/compliances/getcompliancesById/${id}` ,data)
    }

    updateCompliance(data, id) {
        console.log(data, id, "fdfsfds");

        return http.put(`/compliances/updateCompliance/${id}`, data)
    }

    renewCompliance(data, id) {
        return http.post(`/compliances/renew/${id}`, data)
    }

    addCompliance(data){
        return http.post('/compliances/add', data)
    }

    createCompliances(data) {
        return http.post('/compliances/createCompliance', data)
    }

    getCompliances(data) {
        return http.post('/compliances', data)
    }
}

export default new Compliances