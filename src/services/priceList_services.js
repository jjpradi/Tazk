import http from '../http-common';

class PriceListService {
  getPriceList() {
    return http.get(`/priceList`);
  }
  getProductPriceList(priceListId){
    return http.get(`/priceList/${priceListId}`);
  }
  getProductList(type, data){
    return http.post(`/priceList/getProductList/${type}`, data);
  }
  createPriceList(data){
    return http.post(`/priceList`,data);
  }
  createCustomerMappingPriceList(data){
    return http.post(`/priceList/pricelistmapping`,data);
  }
  updatePriceList(data, id){
    return http.put(`/priceList/${id}`,data);
  }
  deletePriceList(data){
    return http.post(`/priceList/delete/${data.id}`, data);
  }
  getPriceListAllCustomer(){
    return http.get(`/priceList/getAllCustomerPriceList`);
  }

  getPriceListCustomer(priceListId){
    return http.get(`/priceList/customermapping/listpricelist/${priceListId}`);
  }

  pagination(data) {
    return http.post(`/priceList/searchPriceList`, data)
  }
}

export default new PriceListService();
