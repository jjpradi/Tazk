import http from '../http-common';

class Loanservice {
  get(employee_id, data) {
    return http.post(`/loan/${employee_id}`,data);
  }

  getEmployeeLoans(person_id, data){
    return http.post(`/loan/employeeLoan/${person_id}`, data);
  }

  getEmployeeLoansDue(person_id){
    return http.get(`/loan/employeeLoanDue/${person_id}`);
  }

  updateSeenLoan(id) {
    return http.put(`/loan/updateSeenLoan/${id}`);
  }
  
  updateSeenClaimAndOthers(id,type) {
    return http.put(`/loan/updateSeenClaimAndOthers/${id}/${type}`);
  }
  
  payrollPaymentMode(id) {
    return http.get(`/loan/${id}/payrollPaymentMode`);
  }

  loanSequence() {
    return http.get(`/loan/loanSequence`);
  }

  loanLedger(data) {
    return http.post(`/loan/ledger/details/view`, data);
  }

  updateLoanSequence(sequenceId) {
    return http.put(`/loan/updateLoanSequence/${sequenceId}`,);
  }

  create(data) {
    return http.post('/loan/createLoan/request',data);
  }
  createClaim(data) {
    return http.post('/loan/createClaims',data);
  }
  updateStatus(id,data){
    return http.post(`/loan/request/${id}`,data)
  }

  updateClaimAndOtherStatus(id,data){
    return http.post(`/loan/claimAndOtherRequest/${id}`,data)
  }

  filteredData(data){
    return http.post(`/loan/filter`,data)
  }
  getLoanAccId(payload){
    return http.post(`/loan/getAccid/paymentLedger`, payload)
  }

  updateOutstanding(id, data){
    return http.post(`/loan/outstanding/${id}`, data)
  }

  tenureMonths(){
    return http.get(`/loan/tenureMonths`);
  }

  claimsCategory(){
    return http.post(`/loan/claimsCategory`);
  }

  searchClaimAndOthers(claimdata){
    return http.post(`/loan/searchClaimAndOthers`, claimdata);
  }

  getLocation(){
    return http.get(`/userCreation/getLocation/emp`);
  }

  searchLoan(data){
    return http.post(`/loan/searchLoan`, data);
  }

  writeOffLoan(data){
    return http.post(`/loan/writeOff`, data);
  }

  deleteLoan(data){
    return http.put(`/loan/deleteLoan`, data);
  }

  deleteClaim(data){
    return http.put(`/loan/deleteClaim`, data);
  }

  approvedClaims(data){
    return http.post(`/loan/approvedClaims`, data);
  }

  addClaimsCategory(data){
    return http.post(`/loan/addClaimsCategory`, data);
  }

  deleteClaimsCategory(id){
    return http.delete(`/loan/deleteClaimsCategory/${id}`);
  }



}

export default new Loanservice();