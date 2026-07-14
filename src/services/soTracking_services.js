import http from '../http-common';

class SoTrackingservice {
  getByStatus(status) {
    return http.get(`/sales/soTracking/${status}`);
  }

  getByStatusByPagination(status,data) {
    return http.post(`/sales/soTracking/${status}`, data);
  }

  getInvoiceDateFilter(from, to,cust_id,data) {
    return http.post(`/sales/soTracking/${from}/${to}/${cust_id}`,data);
  }

  setStatusInTransit(data) {
    return http.put(`/sales/soTracking/setStatusIntransit`,  data);
  }

  updateStatus(data) {
    return http.put(`/sales/sales/updatestatus`,  data);
  }
  getAllemployee() {
    return http.get(`/sales/getAllemployeeincludingAdmin`);
  }
  getAllBySalesfilter(data){
    return http.post(`/sales/soTracking/filter`, data);
  }

}

export default new SoTrackingservice();
