import http from '../http-common';
import {PostAdd} from '@mui/icons-material';

class Inventoryservice {
  getAll(employee_id, headerLocationId) {
    return http.get(`/inventory/${employee_id}/${headerLocationId}`);
  }

  postById(data, employee_id, headerLocationId) {
    return http.post(`/inventory/${employee_id}/${headerLocationId}`, data);
  }

  getInventory(id) {
    return http.get(`/inventory/${id}`);
  }

  delete(id) {
    return http.delete(`/inventory/${id}`);
  }
  //Transfer

  getStockAgeingReport(data) {
    return http.post('/stockInHand/stockAgeingReport',data)
  }

  exportDatastockaging(data) {
    return http.post('/stockInHand/exportData',data)
  }

  getStocktransfer(employee_id, headerLocationId) {
    return http.get(
      `/inventory/stacktransfer/${employee_id}/${headerLocationId}`,
    );
  }
  
  filterStocktransfer(data, employee_id, headerLocationId) {
    return http.post(
      `/inventory/filterStacktransfer/${employee_id}/${headerLocationId}`,
      data,
    );
  }

  get(id) {
    return http.get(`/inventory/stocktransfer/${id}`);
  }

  create(data, employee_id, headerLocationId) {
    return http.post(
      `/inventory/stacktransfer/${employee_id}/${headerLocationId}`,
      data,
    );
  }
  update(id, data) {
    return http.put(`/inventory/stackreceive/${id}`, data);
  }
  //Receievr
  getStockreceive() {
    return http.get('/inventory/stacktransfer');
  }
  getStockreceiveId(id) {
    return http.get(`/inventory/stacktransfer/${id}`);
  }

  getDate(date, employee_id, headerLocationId) {
    return http.get(
      `/inventory/close/filter/${date}/${employee_id}/${headerLocationId}/filterstock `,
    );
  }

  getNonmoveCategory(data) {
    return http.post(`/inventory/NonmoveCategory`,data);
  }
  
  getlocateproduct(employee_id, headerLocationId) {
    return http.get(`/inventory/productlocation/${employee_id}/${headerLocationId}`);
  }
  // deleteAll() {
  //   return http.delete(`/tutorials`);
  // }
  deleteStocktransfer(id, data, employee_id, headerLocationId){
    return http.put(`/inventory/stacktransfer/${id}/${employee_id}/${headerLocationId}`, data);
  }
  // findByTitle(title) {
  //   return http.get(`/tutorials?title=${title}`);
  // }
  getAvailableStock(headerLocationId, employee_id) {
    return http.get(`/inventory/${employee_id}/${headerLocationId}/availableStock`);
  }

  getsearchdata(employee_id,headerLocationId,data){
    return http.post(`/inventory/searchInventory/${employee_id}/${headerLocationId}`, data);
  }

  getdailyreporttransferreceiver(headerLocationId,date){
    return http.get(`/inventory/dailyreport/transferreceiver/${headerLocationId}/${date}`);
  }

  getSearchStockReceive(data) {
    return http.post(`/inventory/searchStockReceive`, data);
  }

  inventoryExport(data, employee_id, headerLocationId) {
    return http.post(`/inventory/export/${employee_id}/${headerLocationId}`, data);
  }

  pagination(data) {
    return http.post(`/stockInHand/searchStockAgeingReport`,data);
  }

  //closing report API====
  closingaction(data) {
    return http.post(`/inventory/Closefilterstock`, data);
  }
  
  paginate(data, employeeId, headerLocationId) {
    return http.post(`/inventory/stockTransfer/${employeeId}/${headerLocationId}`, data);
  }

  supplierInvoiceList(data) {
    return http.post(`/inventory/getProduct/based/suppliersAndInvoice`, data);
  }

  scrabExport(data) {
    return http.post(`/inventory/scrabExport`, data);
  }

  getStockByLocation(item_id) {
    return http.get(`/inventory/stockByLocation/${item_id}`);
  }

  getLotsForItem(item_id, locationId, page = 0, pageSize = 200) {
    const params = new URLSearchParams();
    if (locationId && locationId !== 'null') params.append('location_id', locationId);
    params.append('page', page);
    params.append('pageSize', pageSize);
    return http.get(`/inventory/getLots/${item_id}?${params.toString()}`);
  }
}

export default new Inventoryservice();
