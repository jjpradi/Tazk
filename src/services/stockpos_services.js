import http from '../http-common';
// import StockPos from "../pages/stockPos";

class StockPosService {
  getAll(token) {
    return http.get('/stockPos');
  }

  //   get(id) {
  //     return http.get(`/stockPos/${id}`);
  //   }

  PosReceived() {
    return http.get(`/stockPos`);
  }

  create(data) {
    return http.post('/stockPos', {
      table_name: 'pos_stock_poss',
      table_data: data,
    });
  }

  update(id, data) {
    return http.put(`/stockPos/${id}`, data);
  }

  delete(id) {
    return http.delete(`/stockPos/${id}`);
  }

  // deleteAll() {
  //   return http.delete(`/tutorials`);
  // }

  // findByTitle(title) {
  //   return http.get(`/tutorials?title=${title}`);
  // }
}

export default new StockPosService();
