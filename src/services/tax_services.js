import http from '../http-common';

class Taxservice {
  getAll() {
    return http.get('/tax');
  }

  get(id) {
    return http.get(`/tax/${id}`);
  }

  create(data) {
    return http.post('/tax', {table_name: 'pos_tax_codes', table_data: data});
  }

  update(id, data) {
    return http.put(`tax/${id}`, {
      table_name: 'pos_tax_codes',
      table_data: data,
    });
  }

  delete(id) {
    return http.delete(`/tax/${id}`);
  }

  SalesSummaryReport(data){
    return http.post(`/tax/SalesSummaryReport`, data)
  }
  
  getGST1Report(payload){
    return http.post('/tax/GST1Report', payload)
  }

  getForm27EQReport(payload){
    return http.post('/tax/form27EQReport', payload)
  }

  GST1Export(payload){
    return http.post('/tax/GST1Export', payload)
  }

  getGST2Report(payload){ return http.post('/tax/GST2Report', payload) }
  GST2Export(payload){ return http.post('/tax/GST2Export', payload) }
  getGST3BReport(payload){ return http.post('/tax/GST3BReport', payload) }
  getGST4Report(payload){ return http.post('/tax/GST4Report', payload) }
  getGST9Report(payload){ return http.post('/tax/GST9Report', payload) }
  getGST9AReport(payload){ return http.post('/tax/GST9AReport', payload) }
  getGSTReport(payload){ return http.post('/tax/GSTReport', payload) }
  GSTReportExport(payload){ return http.post('/tax/GSTReportExport', payload) }
  getGSTRateReport(payload){ return http.post('/tax/GSTRateReport', payload) }
  GSTRateReportExport(payload){ return http.post('/tax/GSTRateReportExport', payload) }
  getTCSReceivable(payload){ return http.post('/tax/TCSReceivable', payload) }
  TCSReceivableExport(payload){ return http.post('/tax/TCSReceivableExport', payload) }

  // deleteAll() {
  //   return http.delete(`/tutorials`);
  // }

  // findByTitle(title) {
  //   return http.get(`/tutorials?title=${title}`);
  // }
}

export default new Taxservice();
