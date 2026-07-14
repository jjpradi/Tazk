import http from '../http-common';

class Productservice {
  getAll() {
    return http.get('/product');
  }
   getAllProductsByType(type) {
    return http.get(`/product/type/${type}`);
  }

  getHsnCode(data) {
    return http.post(`/product/getHsnCode`, data);
  }  

  get(id) {
    return http.get(`/product/${id}`);
  }

  getLocationById(location_id) {
    return http.get(`/product/ByLocation/${location_id}`);
  }

  getsearchfilter(location_id, data){
    return http.post(`/product/SearchByLocation/${location_id}`, data)
  }

  getpaginationdata(data) {
    return http.post('/product/pagination', data);
  }

  create(data) {
    return http.post('/product', {table_name: 'pos_items', table_data: data});
  }

  bulk(data) {
    return http.post('/product/bulk', data);
  }

  update(id, data) {
    return http.put(`/product/${id}`, {
      table_name: 'pos_items',
      table_data: data,
    });
  }

  delete(id) {
    return http.delete(`/product/${id}`);
  }

  getDate(id) {
    return http.get(`/product/date/${id}`);
  }

  getMonth(id) {
    return http.get(`/product/month/${id}`);
  }

  getTotalPurchasedQty(id) {
    return http.post(`/product/totalPurchasedQty/${id}`);
  }

  getTill(id) {
    return http.get(`/product/till/${id}`);
  }

  getHsnDetails() {
    return http.get(`/product/hsnCodeDetails`);
  }

  getAllProductBrand() {
    return http.get(`/product/getAllProductBrand`);
  }
  getAllProductCategory() {
    return http.get(`/product/getAllProductCategory`);
  }
  getInventorySalesAllProduct () {
    return http.get(`/product/inventorySalesAllproductlist`)
  }
  getinventoryproduct () {
    return http.get(`/product/inventoryproductlist/productname`)
  }
  purchaseProductList () {
    return http.get(`/product/purchaseProductList`)
  }
  purchaseProductTaxes (id) {
    return http.get(`/product/purchaseProduct/taxes/${id}`)
  }
  getfilterinventoryproduct (data) {
    return http.post(`/product/findproduct`, data)
  }
  inventorySalesproduct (data) {
    return http.post(`/product/inventorySalesproduct`, data)
  }
  getsalesfilterproduct(data) {
    return http.post(`/product/salesproductfind`, data)
  }
  getsalesproduct () {
    return http.get(`/product/salesproductlist/nameproduct`)
  }

  getcheckproduct (id) {
    return http.get(`/product/checkusedproduct/${id}`)
  }

  updateLotNumber(data,item_id) {
    return http.post(`/lotItems/updateLot`,data);
  }

  getLotNumberById(id) {
    return http.get(`/lotItems/getlot/byProductId/${id}`);
  }

  pagination(data){
    return http.post(`/product/searchProduct`, data)
  }

  updateProductData(data) {
    return http.post(`/product/updateProductData`, data);
  }

  findProduct(data) {
    return http.post(`/product/findProduct`, data);
  }

  productList(data) {
    return http.post(`/product/product/list`, data);
  }

  categoryBasedOnBrand(data) {
    return http.post(`/product/category/basedOn/brand`, data);
  }

  grProductList(data) {
    return http.post(`/grProduct/getGrProduct`, data);
  }

 deletegrproduct(id) {
    return http.delete(`/grProduct/deleteProduct/`+id);
  }

  changeProductHsnCodeDescription(payload){
    return http.post('/product/updateHsnDescription', payload)
  }

  productBulkUpload(payload){
    return http.post('/product/bulkUpload', payload)
  }

  getProductTimeline(id){
    return http.get(`/product/getProductTimeline/${id}`)
  }
  
}

export default new Productservice();
