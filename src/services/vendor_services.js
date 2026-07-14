import http from '../http-common';

class Vendorservice {
  getAll() {
    return http.get('/supplier');
  }

  getVendorIdAndName() {
    return http.get('/supplier/idAndName');
  }

  getSupplierDetailsById(supplierId) {
    return http.get(`/supplier/byId/${supplierId}`);
  }

  getSupplierDetailsByIdwithreceivings_items(supplierId,data){
    return http.post(`/supplier/byId/${supplierId}`, data);
  }

  get(id) {
    return http.get(`/supplier/${id}`);
  }

  create(data) {
    return http.post('/supplier', {
      table_name: 'pos_suppliers',
      table_data: data,
    });
  }

  update(id, data) {
    return http.put(`/supplier/${id}`, {
      table_name: 'pos_suppliers',
      table_data: data,
    });
  }

  // delete(id) {
  //   return http.delete(`/supplier/${id}`);
  // }
  delete(data){
     return http.put(`/supplier/vendordelete/removevendor`, data)
  }

  // deleteAll() {
  //   return http.delete(`/tutorials`);
  // }

  // findByTitle(title) {
  //   return http.get(`/tutorials?title=${title}`);
  // }  

  bulkSupplier(data){
    return http.post('/supplier/bulkSupplier', {table_name:'pos_suppliers',table_data: data});
  }

  vendorPriceList(data){
    return http.post('/priceList/vendorPriceList', data);
  }

  createVendorPriceList(data){
    return http.post('/priceList/vendorPriceList/create', data);
  }

  updateVendorPriceList(id,data){
    return http.put(`/priceList/vendorPriceList/update/${id}`, data);
  }


  vendorPriceListDropDown(){
    return http.get('/priceList/vendor/priceList/dropDown');
  }

  getLatestProductPrice(payload){
    return http.post('/priceList/vendor/priceList/getLatestProductPrice', payload);
  }

  additionalContactsForVendor(payload){
    return http.post('/supplier/additionalContactsForVendor', payload);
  }

  shippingAddressForVendor(payload){
    return http.post('/supplier/shippingAddressForVendor', payload);
  }

  editShippingAddressForVendor(shipping_id,data){
    return http.post(`/supplier/editShippingAddressForVendor/${shipping_id}`, data);
  }

  linkVendorToCustomer(payload){
    return http.post(`/supplier/linkToCustomer`, payload)
  }

  unlinkCustomer(payload){
    return http.put(`/supplier/unlinkCustomer`, payload)
  }

  getVendorExpenses(id){
    return http.get(`/purchase/expense/bySupplier/${id}`)
  }

  getSearchByVendorData(data) {
    return http.post(`/supplier/getSuppliers`, data)
  }

  getPurchaseSuppliersById(id) {
    return http.get(`/supplier/getSuppliers/${id}`)
  }

  getVendosByIdData(id) {
    return http.get(`/supplier/getVendosById/${id}`)
  }

  getSuppliersByTaxId(taxId, excludeSupplierId) {
    const params = excludeSupplierId ? `?excludeSupplierId=${excludeSupplierId}` : '';
    return http.get(`/supplier/byTaxId/${encodeURIComponent(taxId)}${params}`);
  }
}

export default new Vendorservice();
