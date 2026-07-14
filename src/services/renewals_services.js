import http from '../http-common'

class Renewals{
    getRenewals(data){
        return http.post('/renewals', data)
    }

    getAllRenewals(data){ 
        return http.post('/renewals/allRenewals' , data)
    }

    getRenewalRecords(data){
        return http.post('/renewals/renewalRecord', data)
    }

    updatePauseRenewals(data) {
        return http.put(`/renewals/updatePause`, data)
    }

    updateResumeRenewals(data) {
        return http.put(`/renewals/updateResume`, data)
    }

    getRenewalsLov(data) {
        return http.post('/renewals/renewalsLov', data)
    }

    createRenewalsLov(data) {
        return http.post('/renewals/createRenewalsLov', data)
    }

    deleteRenewalsLov(type, id) {
        return http.delete(`/renewals/deleteRenewalsLov/${type}/${id}`)
    }

    createRenewalsForm(data) {
        return http.post('/renewals/createRenewals', data)
    }

    getRenewalRecordsById(data){
        return http.post(`/renewals/renewalRecord` ,data)
    }

    getRenewalsById(id) {
        return http.get(`/renewals/get/${id}`)
    }
    updateRenewals(data, id){
        return http.put(`/renewals/updateRenewals/${id}` ,data)
    }

    renewRenewals(data, id) {
        return http.post(`/renewals/renew/${id}`, data)
    }

    getRenewalsInitialLov() {
        return http.get('/renewals/getRenewalsInitialLov')
    }

    deleteRenewalsInitialLov(id) {
        return http.delete(`/renewals/deleteRenewalsInitialLov/${id}`)
    }

    getPaymentMethod() {
        return http.get(`/renewals/paymentMethod`)
    }

    getFormTotal(type){
        return http.get(`/renewals/getFormTotal/${type}`)
    }

    createCustomRenewal(data){
        return http.post('/renewals/createCustomRenewals' ,data)
    }

    getAllCustomRenewals(data){
        return http.post('/renewals/getAllCustomRenewals' ,data)
    }

    getCustomRenewalsById(id ,payload){
        return http.post(`/renewals/getCustomRenewalsById/${id}`,payload)
    }

    updateCustomRenewals(data ,id){ 
        return http.put(`/renewals/updateCustomRenewals/${id}` ,data)
    }

    renewCustomRenewals(data, id){
        return http.post(`/renewals/customRenew/${id}`, data)
    }

    deleteCustomRenewals(id){
        return http.post(`/renewals/deleteCustomRenewals/${id}`) 
    }
}

export default new Renewals