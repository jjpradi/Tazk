import http from '../http-common';

class ProductCategoryService {
  getAll() {
    return http.get('/productCategory');
  }

  get(id) {
    return http.get(`/productCategory/${id}`);
  }

  create(data) {
    return http.post('/productCategory', {
      table_name: 'pos_items_taxes',
      table_data: data,
    });
  }

  update(id, data) {
    return http.put(`/productCategory/${id}`, {
      table_name: 'pos_items_taxes',
      table_data: data,
    });
  }

  delete(id) {
    return http.delete(`/productCategory/${id}`);
  }

  // deleteAll() {
  //   return http.delete(`/tutorials`);
  // }

  // findByTitle(title) {
  //   return http.get(`/tutorials?title=${title}`);
  // }
}

export default new ProductCategoryService();
