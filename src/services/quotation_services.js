import http from '../http-common'

class Quotation{
  createQuotations(payload){
    return http.post('/quotation/createQuotation', payload)
  }

  deleteQuotation(payload) {
    return http.post('/quotation/deleteQuotation', payload)
  }

  getQuotations(payload){
      return http.post('/quotation/getQuotations', payload)
  }

  sendQuotationMail(data){
      return http.post('/quotation/sendQuotationMail', data)
  }

  getQuotationSequence(){
      return http.get('/quotation/getCurrentSequence')
  }

  createQuotationPdf(data){
      return http.post('/quotation/createQuotationPdf', data)
  }

  getQuotationConfig(){
      return http.post('/quotation/getQuotationConfig')
  }

  getConfigAmountDiscount(){
      return http.post('/quotation/getConfigAmountDiscount')
  }

  createQuotationConfig(data){
      return http.post('/quotation/createQuotationConfig', data)
  }

  deleteQuotationConfig(id){
      return http.post(`/quotation/quotationConfig/delete/${id}`)
  }

  updateQuotationConfig(data, id){
      return http.post(`/quotation/quotationConfig/update/${id}`, data)
  }

  getQuotationApprovals(payload){
    return http.post('/quotation/approvals/quotationRequest', payload)
  }

  getQuotationById(id){
    return http.post(`/quotation/getQuotation/${id}`)
  }

  updateRequestSeen(id){
    return http.put(`/quotation/updateQuotationRequestSeen/${id}`)
  }

  getQuotationAmountAndDiscount(id) {
    return http.get(`/quotation/getQuotationAmount/${id}`)
  }

  quotationRejected(data, id){
    return http.post(`/quotation/rejected/${id}`, data)
  }

  quotationApproved(data, id){
    return http.post(`/quotation/approved/${id}`, data)
  }

  quotationByCustomer(data, customer_id){
    return http.post(`/quotation/getQuotationByCustomer/${customer_id}`, data)
  }

  quotationTimelineData(data){
    return http.post(`/quotation/quotationTimelineData`,data)
  }

  getQuotationPayload(quotation_id) {
    return http.get(`/quotation/print-data/quotation/${quotation_id}`);
  }
}

export default new Quotation