import http from '../http-common';

class PurchaseTableService {
  getAll(id) {
    return http.get(`/purchase/invoice/data/purchaseInvoice/${id}`);
  }
}

export default new PurchaseTableService();
