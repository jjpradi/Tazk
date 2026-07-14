import http from '../http-common';

class Profitlossservice {
  getAll(from, to, grossday) {
    return http.get(`/profitLoss/filter/${from}/${to}/${grossday}`);
  }

  stocks(from, to, grossday) {
    return http.get(`/profitLoss/stocks/profit/${from}/${to}/${grossday}`);
  } 

  getpaginationdata(data) {
    return http.post(`/profitLoss/pagination`, data);
  }

  getDate(from, to, grossday) {
    return http.get(`/profitLoss/filter/${from}/${to}/${grossday}`);
  }

  get(id) {
    //http.defaults.headers.common['Authorization'] = token;
    return http.get(`/profit/${id}`);
  }

  getAging() {
    return http.get("/totalAccounts/ReceivablesAging")
  }
  getexpensechart(from, to) {
    return http.get(`/profitLoss/detailsaboutexpensechart/expense/${from}/${to}`)
  }
  // getexpenseareachart() {
  //   return http.get(`/profitLoss/areachartexpense`)
  // }
  // getprofit() {
  //   return http.get(`/dashboard/monthProfit`)
  // }

  getExpenseAreaChart(month, headerLocationId) {
    return http.get(`/profitLoss/areaChartExpenses/${month}/${headerLocationId}`)
  }

  topExpenses(location_id) {
    return http.get(`/profitLoss/${location_id}/topExpenses`);
  }

  // Total expense Card only
  TotalExpense(location_id) {
    return http.get(`/profitLoss/${location_id}/totalExpense`)
  }

  // Current Month Expense Card only 
  currentMonthExpense(location_id) {
    return http.get(`/profitLoss/${location_id}/currentMonthExpense`)
  }

  //Most Spending Expense card only
  MostSpendExpense(location_id) {
    return http.get(`/profitLoss/${location_id}/mostSpendingExpense`)
  }
}

export default new Profitlossservice();
