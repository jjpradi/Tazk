import http from '../http-common';

class ExpenseService {
  getExpenses() {
    return http.get(`/expense`);
  }

  createExpense(data) {
    return http.post(`/expense`, data);
  }
  getExpenseLedgers() {
    return http.get(`/expense/ledgers`);
  }
  deleteExpense(data) {
    return http.post(`/expense/delete/${data.id}`, data);
  }
  PaymentExpense(id,data) {
    return http.put(`/expense/${id}`,data);
  }
  getExpenseItems(id){
    return http.get(`/expense/${id}`);
  }
  UpdateExpense(id,data) {
    return http.put(`/expense/update/${id}`,data);
  }
  transactionIdUpdate(data){
    return http.post(`/expense/update/transactionId`, data);
  }
  expenseSearch(data) {
    return http.post(`/expense/expenseSearch`, data);
  }

  expenseByVendor(data, vendor_id){
    return http.post(`/expense/expensesByCustomer/${vendor_id}`, data)
  }

  expensesById(id) {
    return http.get(`/expense/expensesById/${id}`)
  }
}
export default new ExpenseService();
