import http from '../http-common'

class TermsConditions {
    getTermsConditions(data) {
        return http.post('/termsConditions', data)
    }

    createTermsConditions(data) {
        return http.post('/termsConditions/create', data)
    }

    getInvoiceTypes() {
        return http.get('/termsConditions/getInvoiceTypes')
    }

    deleteTermsConditions(id,type) {
        return http.delete(`/termsConditions/deleteTermsConditions/${id}/${type}`)
    }

    getUnitsLov(data) {
        return http.post('/termsConditions/unitsLov', data)
    }

    createUnitsLov(data) {
        return http.post('/termsConditions/createUnitsLov', data)
    }

    deleteUnitsLov(id) {
        return http.delete(`/termsConditions/deleteUnitsLov/${id}`)
    }

    getCreditDaysLov(data){
        return http.post(`/termsConditions/creditDaysLov`, data)
    }

    createCreditDaysLov(data){
        return http.post(`/termsConditions/createCreditDaysLov`, data)
    }

    deleteCreditDaysLov(id){
        return http.delete(`/termsConditions/deleteCreditDaysLov/${id}`)
    }

    createPaymentTerms(data){
        return http.post(`/termsConditions/createPaymentTerms`,data)
    }

    deletePaymentTerms(id){
        return http.delete(`/termsConditions/deletePaymentTerms/${id}`)
    }

    getPaymentTerms(data){
        return http.post(`/termsConditions/getPaymentTerms`,data)
    }

    createDeliveryTerms(data){
        return http.post(`/termsConditions/createDeliveryTerms`,data)
    }

    deleteDeliveryTerms(id){
        return http.delete(`/termsConditions/deleteDeliveryTerms/${id}`)
    }

    getDeliveryTerms(data){
        return http.post(`/termsConditions/getDeliveryTerms`,data)
    }

    updateTermsConditions(data){
        return http.post(`/termsConditions/updateTermsConditions`,data)
    }
}

export default new TermsConditions