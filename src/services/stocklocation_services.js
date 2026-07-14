import http from '../http-common';
// import StockLocation from "../pages/common/stockLocation";

class StockLocationService {
  getAll(employee_id, headerLocationId) {
    return http.get(`/stockLocation/${employee_id}/${headerLocationId}`);
  }

  getAllSequence(employee_id, headerLocationId, data) {
    return http.post(
      `/stockLocation/sequence/${employee_id}/${headerLocationId}/sequence`,
      data,
    );
  }

  get(id) {
    return http.get(`/stockLocation/${id}`);
  }

  create(data, employee_id, headerLocationId) {
    return http.post(`/stockLocation/${employee_id}/${headerLocationId}`, {
      table_name: 'pos_stock_locations',
      table_data: data,
    });
  }

  update(id, data) {
    return http.put(`/stockLocation/${id}`, {
      table_name: 'pos_stock_locations',
      table_data: data,
    });
  }

  delete(id) {
    return http.delete(`/stockLocation/${id}`);
  }
  getAlllist() {
    return http.get(`/stockLocation`);
  }
  getlocation_type() {
    return http.get(`/stockLocation/company/locationType`)
  }

  get_source(headerLocationId) {
    return http.get(`/stockLocation/stockTransfer/sourceLocation/${headerLocationId}`)
  }

  get_destination() {
    return http.get(`/stockLocation/stockTransfer/destination`)
  }
    updateDefaultLocation(data) {
    return http.put(`/stockLocation/location/updateDefaultLocation`,data)
  }

  pagination(data) {
    return http.post(`/stockLocation/searchLocation`, data)
  }

  getGpsLocationActivation() {
    return http.get(`/stockLocation/gpsLocationActivation`)
  }
  // deleteAll() {
  //   return http.delete(`/tutorials`);
  // }

  // findByTitle(title) {
  //   return http.get(`/tutorials?title=${title}`);
  // }
}

export default new StockLocationService();
