import http from '../http-common';

class AllLoansservice {

  getAll() {
    return http.get('/allLoans');
  }

//   getByPagination(data) {
//     return http.post('/Leads/pagination', data);
//   }

//   get(id) {
//     return http.get(`/Leads/${id}`);
//   }

  create(data) {
    return http.post('/allLoans', data);
  }

  loanDueDetails() {
      return http.get(`/allLoans/companyLoansDueForDashboard`);
    }

    
  claimManualPayment(data){
    return http.post(`/allLoans/claimManualPayment`,data)
  }
    
  getClaimtransaction(data){
    return http.post(`/allLoans/getClaimtransaction`,data)
  }
    
  getClaimtimeline(data){
    return http.post(`/allLoans/getClaimtimeline`,data)
  }

//   update(id, data) {
//     return http.put(`/Leads/${id}`, {
//       table_name: 'pos_leads',
//       table_data: data,
//     });
//   }

//   invoiceupdate(id, data) {
//     return http.put(`/Leads/invoice/${id}`, data);
//   }

//   delete(id) {
//     return http.delete(`/Leads/${id}`);
//   }

  // deleteAll() {
  //   return http.delete(`/tutorials`);
  // }

  // findByTitle(title) {
  //   return http.get(`/tutorials?title=${title}`);
  // }
}

export default new AllLoansservice();
