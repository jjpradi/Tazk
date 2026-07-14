import http from '../http-common';

class ProfitLossDashboardservice {
  
  getCurrentDay(headerLocationId) {
    return http.get(`/dashboard/${headerLocationId}/currentDay`);
  }

  getCurrentWeek(headerLocationId) {
    return http.get(`/dashboard/${headerLocationId}/currentWeek`);
  }

  getCurrentMonth(headerLocationId) {
    return http.get(`/dashboard/${headerLocationId}/currentMonth`);
  }

  getCurrentYear(headerLocationId) {
    return http.get(`/dashboard/${headerLocationId}/currentYear`);
  }

  getDay(headerLocationId) {
    return http.get(`/dashboard/${headerLocationId}/day`);
  }
  getWeek(headerLocationId) {
    return http.get(`/dashboard/${headerLocationId}/week`);
  }

  getMonth(headerLocationId) {
    return http.get(`/dashboard/${headerLocationId}/month`);
  }

  getYear(headerLocationId) {
    return http.get(`/dashboard/${headerLocationId}/year`);
  }

  breakdowngetday(headerLocationId) {
    return http.get(`/dashboard/${headerLocationId}/breakdownday`);
  }

  breakdowngetweek(headerLocationId) {
    return http.get(`/dashboard/${headerLocationId}/breakdownweek`);
  }

  breakdowngetmonth(headerLocationId) {
    return http.get(`/dashboard/${headerLocationId}/breakdownmonth`);
  }

  breakdowngetyear(headerLocationId) {
    return http.get(`/dashboard/${headerLocationId}/breakdownyear`);
  }


  getByDate(from, to, headerLocationId, data) {
    return http.post(`/dashboard/${headerLocationId}/${from}/${to}`, data);
  }
}

export default new ProfitLossDashboardservice();
