import http from '../http-common';

class PosSaleservice {
  getAll(employee_id, headerLocationId, data) {
    return http.post(`/posSale/${employee_id}/${headerLocationId}`, data);
  }

  getAllReport(employee_id, date, headerLocationId) {
    return http.get(`/posSale/${employee_id}/${date}/${headerLocationId}`);
  }

  get(id) {
    return http.get(`/posSale/${id}`);
  }

  create(data) {
    return http.post('/posSale', data);
  }

  update(id, data) {
    return http.put(`/posSale/${id}`, {
      table_name: 'pos_sales',
      table_data: data,
    });
  }

  cancel(id,data) {
    return http.post(`/posSale/cancelPosSale/${id}`,data);
  }

  delete(id) {
    return http.delete(`/posSale/${id}`);
  }

  PosSaleReceived() {
    return http.get(`/posSale/stockPosSale`);
  }

  getDate(data) {
    return http.post(`/posSale/filter`, data);
  }

  getcustomer_erp_individual(data) {
    return http.post(`/posSale/customer_erp/individualsales`, data)
  }

  getTotalSaleByLocation(month,year){
    return http.get(`/posSale/totalSaleByLocation/month/${month}/year/${year}`)
  }

  getTotalSaleLocationBar(month,year){
    return http.get(`/posSale/totalSaleByLocation/month/${month}/year/${year}`)
  }

  topSaleByBrand(data){
    return http.post(`/posSale/topSaleByBrand`,data)
  }

  saleComparison(data){
    return http.post(`/posSale/saleComparison`, data)
  }

  totalSaleByDate(data){
    return http.post(`/posSale/totalSaleByDate`, data)
  }

  lastTenDaysSales(data){
    return http.post(`/posSale/lastTenDaysSalesRecord`,data )
  }

  salesTillDateRecord(){
    return http.get(`/posSale/salesTillDateRecord` )
  }

  totalSaleByMonth(employee_id,data){
    return http.post(`/posSale/totalSaleByMonth/${employee_id}`, data)
  }

  pagination(data){
    return http.post(`/posSale/searchPosSales`, data)
  }

  updateColumn(data){
    return http.put(`/posSale/selection/updateColumn`, data)
  }

  getColumn(){
    return http.get(`/posSale/selection/getColumn`)
  }

  export(data, employee_id){
    return http.post(`/posSale/searchPosSales/export/${employee_id}`, data)
  }
  promotion(data){
    return http.post(`/posSale/searchPosPromotions`, data)
  }
  updatePromotion(data){
    return http.put(`/posSale/updatePosPromotions`, data)
  }

  getReceiptPayload(sale_id) {
    return http.get(`/posSale/print-data/pos-receipt/${sale_id}`);
  }

  getSalesInvoicePayload(sale_id) {
    return http.get(`/posSale/print-data/sales-invoice/${sale_id}`);
  }
}

export default new PosSaleservice();
