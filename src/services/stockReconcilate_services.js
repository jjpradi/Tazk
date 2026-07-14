import http from '../http-common';
// import StockLocation from "../pages/common/stockLocation";

class StockReconcilateService {
  getAll(data) {
    return http.post(`/lotItems/reconcilatefilter`, data); //stockReconcilate
  }

  getReconcilateProducts() {
    return http.get(`/lotItems`);
  }

  getStockLotItemsById() {
    return http.get(`/lotItems/stocklots`);
  }

  getCheckReconcilateProductsData(data) {
    return http.post(`/lotItems/checkProducts`, data);
  }

  saveReconcilate(data) {
    return http.post(`/lotItems/reconcilatedataentry`, data);
  }

  getSystemStockDetails(data) {
    return http.post(`/stockReconcilate/systemStock`, data)
  }
 movereconcilation(data){
  return http.post(`/lotItems/moveReconciliatedProduct`, data)
  }
  
  pagination(data) {
    return http.post(`/lotItems/searchReconcilate`, data); //stockReconcilate
  }

  reconciliateDetails(reconciliate_id) {
    return http.post(`/lotItems/reconciliate/details`, reconciliate_id); //stockReconcilate
  }

  checkLotAvailable(payload){
    return http.post(`/lotItems/checkLotAvailable`, payload)
  }

  // getAll() {
  //     return http.get(`/stockReconcilate`);
  // }
}

export default new StockReconcilateService();
