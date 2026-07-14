import http from '../http-common';

class Customerservice {
  getAll() {
    //http.defaults.headers.common['Authorization'] = token;
    return http.get('/customer');
  }

  getAllPickCustomer(data){
    return http.post('/customer/pickCustomer', data);
  }

  updateAdditionalContact(data){
    return http.post('/customer/updateAdditionalContact', data);
  }

  updateShippingAddress(data){
    return http.post('/customer/updateShippingAddress', data);
  }

  updateBankDetails(data){
    return http.post('/customer/updateBankDetails', data);
  }

  updateCreditDays(data){
    return http.post('/customer/creditDaysUpdate', data);
  }

  shippingdelete(id){
    return http.put(`/customer/shippingdelete/${id}`);
  }
  
  getCustomerOutstandingDetails(data){
    return http.post('/customer/getCustomerOutstandingDetailsForWeb', data);
  }

  getCustomerOutstandingDetailsDues(data){
    return http.post('/customer/getCustomerOutstandingDetails', data);
  }

  customershippingDetail(data){
    return http.post('/customer/updateShippingDetail', data);
  }

  getinvoice(id) {
    //http.defaults.headers.common['Authorization'] = token;
    return http.get(`/customer/getinvoice/${id}`);
  }


  getAllDate() {
    //http.defaults.headers.common['Authorization'] = token;
    return http.get('/customer/linechart');
  }

  bulkcustomer(data,body){
    return http.post('/customer/bulkcustomer', {...body,table_name: 'pos_customers',
    table_data: data,
  });
  }

  get(id) {
    //http.defaults.headers.common['Authorization'] = token;
    return http.get(`/customer/${id}`);
  }

  create(data) {
    return http.post('/customer', {
      table_name: 'pos_customers',
      table_data: data,
    });
  }

  update(id, data) {
    return http.put(`/customer/${id}`, {
      table_name: 'pos_customers',
      table_data: data,
    });
  }

  // delete(id) {
  //   return http.delete(`/customer/${id}`);
  // }

  delete(data){
     return http.put(`/customer/deleteid/removecustomer`, data)
  }

  employeeDelete(person_id){
    return http.put(`/customer/deleteEmployee/${person_id}`)
  }

  clientDelete(person_id){
    return http.put(`/customer/deleteClient/${person_id}`)
  }

  getAllStatement(id, data) {
    return http.post(`/customer/statementOfAccounts/${id}`,data);
  }

  getUpdateOtherDetails(id, data) {
    return http.post(`/customer/getUpdateOtherDetails/${id}`,data);
  }
  
  getFilterCustomer(type, type_details) {
    return http.get(`/customer/user/${type_details}/${type}`);
  }
  salesmanMaping(data){
    return http.post('/salesMan/customermapping/salesman', data)
  }
  salesmaninsert(data){
    return http.post('/salesMan/salesman', data)
  }
  listsalesman(data){
    return http.post('/salesMan/customermapping/listsalesman', data)
  }
  staredchange(statusid, person_id){
   return  http.put(`/customer/staredchange/${statusid}/${person_id}`)
  }
  starededitdetails(data){
    return http.post(`/customer/detailsaboutstared/edit`, data)
  }
  customerAsCompany(data){
    return http.get(`/customer/customerAsCompany`)
  }

  // deleteAll() {
  //   return http.delete(`/tutorials`);
  // }

  // findByTitle(title) {
  //   return http.get(`/tutorials?title=${title}`);
  // }

  //customer API==== paginate
  customerallPaginate(data){
    return http.post( `/customer/searchCustomer/${data.type_details}/${data.type}`,data)
  }

  customerCompanyName(data){
    return http.post( `/customer/CustomerCompanyName/${data.type_details}/${data.type}`,data)
  }

  customerSalesDetailById(customer_id, employeeId){
    return http.get( `/sales/${customer_id}/${employeeId}/salesDetailById`)
  }

  customerDetailById(customer_id) {
    // console.log("9999")
    return http.get(`/customer/details/${customer_id}`);
  }

  imageUpload(data) {
    return http.post(`/customer/contactImage/upload`, data);
  }

  followUser(data) {
    return http.put(`/customer/followUser/setdata`, data);
  }

  followList() {
    return http.get(`/customer/getFollowStatusWS`);
  }

  requestflw(data) {
    return http.post(`/customer/request/follow`, data);
  }

  listfollow(data) {
    return http.post(`/customer/listFollowreq/reqs`, data);
  }

  acceptfollow(data) {
    return http.put(`/customer/listFollowreq/reqs`, data);
  }

  additionalContacts(data) {
    return http.post(`/customer/additionalContacts`, data);
  }

  additionalShippingAddress(data) {
    return http.post(`/customer/additionalShippingAddress`, data);
  }

  editAdditionalContacts(id,data) {
    return http.post(`/customer/editAdditionalContacts/${id}`, data);
  }

  EditAdditionalShippingAddress(id,data) {
    return http.post(`/customer/EditAdditionalShippingAddress/${id}`, data);
  }

  getOutstandingBasedOnCustomer(id,headerLocationId, payload){
    return http.post(`/customer/outstanding/${id}/${headerLocationId}`, payload)
  }

  customerInvoice(data){
    return http.post(`/customer/customerInvoice`,data)
  }

  Customerpayment(data){
    return http.post(`/customer/customerPayment`,data)
  }

  customerDeliverChallan(data){
    return http.post(`/customer/customerDeliverChallan`,data)
  }

  customerQuotes(data){
    return http.post(`/customer/customerQuotes`,data)
  }

  customerCreditNote(data){
    return http.post(`/customer/customerCreditNote`,data)
  }

  shareOutstandingReport(data){
    return http.post(`/customer/shareOutstandingReport`,data)
  }

  outstandingShare(customer_id,headerLocationId,data){
    return http.post(`/customer/outstandingShare/${customer_id}/${headerLocationId}`,data)
  }

  custAddressUpdate(data){
    return http.put(`/customer/primaryAddress/Update`,data)
  }

  custGSTUpdate(data){
    return http.put(`/customer/gstUpdate`,data)
  }

  custportalUpdate(data){
    return http.put(`/customer/portalAccess/Update`,data)
  }

  getSearchByCustomersData(data) {
    return http.post(`/customer/getCustomers`, data)
  }

  getSearchBySalesmanCustomers(data) {
    return http.post(`/customer/getSearchBySalesmanCustomers`, data)
  }

  getSalesCustomersById(id) {
    return http.get(`/customer/getCustomers/${id}`)
  }

  getSearchByCustomerSupplierData(data, type) {
    return http.post(`/customer/getCustomerSupplier/${type}`, data)
  }

  getCustomerSupplierDataById(type, id) {
    return http.get(`/customer/getCustomerSupplier/${type}/${id}`)
  }

}

export default new Customerservice();
