import http from '../http-common'

class DefectsService{
    getInvoiceByCustomer(customer_id, location_id) {
        return http.get(`/defects/invoiceByCustomer/${customer_id}/${location_id}`)
    }

    getProductsByInvoice(sale_id) {
        return http.get(`/defects/salesproduct/${sale_id}`)
    }

    getLotsDetails(payload) {
        return http.post(`/defects/getLotsDetails`, payload)
    }

    getDefectCollectionSequence() {
        return http.get(`/defects/defectSequence`)
    }

    createDefectCollection(payload) {
        return http.post(`/defects/createcollection`, payload)
    }

    listDefectCollection(payload, employee_id, location_id) {
        return http.post(`/defects/getCollection/${employee_id}/${location_id}`, payload)
    }

    deleteDefectCollection(collection_id) {
        return http.put(`/defects/deletecollection/${collection_id}`)
    }

    editCollectedDefects(payload) {
        return http.put(`/defects/updatecollection`, payload)
    }

    getDefectByCustomerVendor(id, type) {
        return http.get(`/defects/getDefectByCustomerVendor/${type}/${id}`)
    }

    getCollectedDefectsById(id) {
        return http.get(`/defects/collectDefectsById/${id}`)
    }

    createCustomerReplacement(payload) {
        return http.post(`/defects/createCustomerReplacement`, payload)
    }

    listReplacement(payload, employee_id, location_id) {
        return http.post(`/defects/getReplacement/${employee_id}/${location_id}`, payload)
    }

    getDefectCollectedSentProduct(type, id, purpose) {
        return http.get(`/defects/productBasedOnType/${type}/${id}/${purpose}`)
    }

    createVendorReplacement(payload) {
        return http.post(`/defects/createVendorReplacement`, payload)
    }
    
    getBillsByVendor(supplier_id) {
        return http.get(`/defects/billsByVendor/${supplier_id}`)
    }

    getProductsByBills(receiving_id) {
        return http.get(`/defects/receivingbasedproduct/${receiving_id}`)
    }

    getAlldefectsCollection(type, id) {
        return http.get(`/defects/getDefectByCustomerVendor/${type}/${id}`)
    }

    sendDefects(payload) {
        return http.post(`/defects/sendDefects`, payload)
    }

    getSendDefects(payload, employee_id, location_id) {
        return http.post(`/defects/getSendDefects/${employee_id}/${location_id}`, payload)
    }

    deleteSendDefects(id) {
        return http.delete(`/defects/deleteSendDefects/${id}`)
    }

    getSendDefectsById(id) {
        return http.get(`/defects/sendDefectsById/${id}`)
    }

    updateSendDefects(payload) {
        return http.put(`/defects/updateSendDefects`, payload)
    }

    convertToCreditDebitNote(payload) {
        return http.post(`/defects/createcreditdebitpayment`, payload)
    }

    getProductByCustomer(customer_id){
        return http.get(`/defects/productByCustomer/${customer_id}`)
    }
    
    getInvoicesByProduct(payload){
        return http.post(`/defects/invoicesByProduct`, payload)
    }

    getProductByVendor(supplier_id){
        return http.get(`/defects/productByVendor/${supplier_id}`)
    }

    getSendDefectSequence(){
        return http.get(`/defects/sendDefectSequence`)
    }

    getReplacementById(type, id){
        return http.get(`/defects/getReplacementByIdType/${type}/${id}`)
    }

    getDefectCollectionById(id){
        return http.get(`/defects/defectCollectionById/${id}`)
    }

    getDefectSentById(id){
        return http.get(`/defects/defectSentById/${id}`)
    }

    deleteReplacement(type, id){
        return http.delete(`/defects/deleteReplacement/${type}/${id}`)
    }

    editReplacement(type, id, payload){
        return http.put(`/defects/editReplacement/${type}/${id}`, payload)
    }

    getReplacementItemsByReplacementId(type, id){
        return http.get(`/defects/getReplacementItemsByReplacementId/${type}/${id}`)
    }
}

export default new DefectsService