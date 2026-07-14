import http from '../http-common';

class Transactionservice {
  getAll() {
    return http.get('/transaction');
  }

  getByPagination(data) {
    return http.post('/transaction/pagination', data);
  }

  get(id) {
    return http.get(`/transaction/${id}`);
  }

  create(data) {
    return http.post('/transaction', {
      table_name: 'pos_transaction',
      table_data: data,
    });
  }

  update(id, data) {
    return http.put(`/transaction/${id}`, {
      table_name: 'pos_transaction',
      table_data: data,
    });
  }

  delete(id) {
    return http.delete(`/transaction/${id}`);
  }
 
  exportData(from, to){
    return http.get(`/transaction/exportData/export/${from}/${to}`)
  }

  searchPagination(data){
    return http.post(`/transaction/SearchTransaction`, data)
  }
  // deleteAll() {
  //   return http.delete(`/tutorials`);
  // }

  // findByTitle(title) {
  //   return http.get(`/tutorials?title=${title}`);
  // }
}

export default new Transactionservice();
