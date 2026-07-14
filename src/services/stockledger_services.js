import http from '../http-common';
// import StockLedger from "../pages/stockLedger";

class StockLedgerService {
  getAll(token) {
    return http.get('/stockLedger');
  }

  //   get(id) {
  //     return http.get(`/stockLedger/${id}`);
  //   }

  LedgerReceived() {
    return http.get(`/stockLedger`);
  }

  create(data) {
    return http.post('/stockLedger', {
      table_name: 'pos_stock_ledgers',
      table_data: data,
    });
  }

  update(id, data) {
    return http.put(`stockLedger/${id}`, data);
  }

  delete(id) {
    return http.delete(`/stockLedger/${id}`);
  }

  // deleteAll() {
  //   return http.delete(`/tutorials`);
  // }

  // findByTitle(title) {
  //   return http.get(`/tutorials?title=${title}`);
  // }
}

export default new StockLedgerService();
