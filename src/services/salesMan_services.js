import http from '../http-common';

class SalesManDashboardService {
  getSalesManSaleDetails(empId,headerLocation_id, data) {
    return http.post(`/salesMan/saleDetails/${empId}/${headerLocation_id}`, data);
  }

  // getChequeBounce(employee_id,headerLocationId,data) {
  //   return http.post(`/salesMan/chequeBounceList/${employee_id}/${headerLocationId}`, data);
  // } 

  getChequeBounce(employee_id,headerLocationId,data) {
    return http.post(`/salesMan/searchChequebounce/${employee_id}/${headerLocationId}`, data);
  }
    getChequeBounceById(id) {
    return http.get(`/salesMan/getChequeById/${id}`);
  }
    getAllChequeStatus() {
    return http.get(`/salesMan/getAllCheque/Status`);
  }

   updateChequeStatus(id,headerLocationId,data) {
    return http.put(`/sales/update/ChequeStatus/${id}/${headerLocationId}`,data);
  }

  createChequeBounce(employee_id, headerLocationId, data) {
    return http.post(`/salesMan/chequeBounces/${employee_id}/${headerLocationId}`, data);
  }

  getTop10OutstandingReport(employee_id) {
    return http.get(`/salesMan/${employee_id}/top10OutstandingReport`);
  }

  getOutstandingReport(employee_id,headerLocation_id) {
    return http.get(`/salesMan/${employee_id}/${headerLocation_id}/getOutstandingReport`);
  }
  getTotalOverDueReport(employee_id,headerLocation_id) {
    return http.get(`/salesMan/${employee_id}/${headerLocation_id}/getTotalOverDueReport`);
  }
  getToBeCollectedToday(employee_id,headerLocation_id) {
    return http.get(`/salesMan/${employee_id}/${headerLocation_id}/getToBeCollectedToday`);
  }
  getOverDueToBeCollected(employee_id,headerLocation_id) {
    return http.get(`/salesMan/${employee_id}/${headerLocation_id}/getOverDueToBeCollected`);
  }
  getCollectionStatus(employee_id,headerLocation_id) {
    return http.get(`/salesMan/${employee_id}/${headerLocation_id}/getCollectionStatus`);
  }

  getSalesManVisits(data){
    return http.post(`/salesMan/getSalesManVisits`,data)
  }

  getSalesmanData(data) {
    return http.get(`/salesMan/saleDetails`, data);
  }

  getSalesManByPagination(data) {
    return http.post(`/salesMan/pagination`, data);
  }

  updateSalesManlist(data){
    return http.put(`/salesMan/salesManlist`, data);
  }

  salesManApprovalReq(shop_id , employee_id){
    return http.get(`/sales/salesApproval/details/${shop_id}/${employee_id}`);
  }

  salesManApprovalApprove(data){
    return http.put(`/sales/salesApproval/update/approval/${data.employee_id}`,data);
  }

  salesManApprovalReject(data){
    return http.put(`/sales/salesApproval/update/approval/reject/${data.employee_id}`,data);
  }

  getSalesmanCollection(payload, location_id){
    return http.post(`/salesMan/collections/${location_id}`, payload)
  }

  getAllCollectionsBySalesman(payload){
    return http.post(`/salesMan/collectionsBySalesman`, payload)
  }

  salesmanCollectionReconciliate(payload){
    return http.put(`/sales/salesmanCollectionReconciliate`, payload)
  }

  deleteSalesmanCollection(id, payload){
    return http.put(`/salesMan/deleteCollection/${id}`, payload)
  }
}

export default new SalesManDashboardService();
