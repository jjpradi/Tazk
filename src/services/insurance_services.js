import http from '../http-common'

class Insurance {
    getInsuranceAll(data) {
        return http.post('/insurance', data)
    }

    createInsuranceAll(data) {
        return http.post('/insurance/create', data)
    }

    updateInsurance(data,id) {
        return http.put(`/insurance/update/${id}`, data)
    }

    getDynamicPropByInsurnace(data){
        return http.post('/insurance/getDynamicPropByInsurance',data)
    }

    insuranceRenewalCardCount() {
        return http.get(`/insurance/insuranceRenewalCard`)
    }
    
    getInsuranceByAsset(id) {
        return http.get(`/insurance/${id}`)
    }

    getInsuranceById(id){
        return http.get(`/insurance/get/${id}`)
    }

    renewInsurance(data, id){
        return http.post(`/insurance/renew/${id}`, data)
    }

    getFrequencyType() {
        return http.get(`/insurance/frequencyType`)
    }

    getInsuranceLov(data) {
        return http.post(`/insurance/getInsuranceLov`,data)
    }

    getInsuranceDetails(id,data) {
        return http.put(`/insurance/getInsuranceDetails/${id}`,data)
    }
    createInsurenceLov(data){
        return http.post(`/insurance/createInsurenceLov` , data)
    }
    deleteInsuranceLov(type , id){
        return http.delete(`/insurance/deleteInsuranceLov/${type}/${id}`)
        
    }
}

export default new Insurance