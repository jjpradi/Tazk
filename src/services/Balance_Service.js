import http from '../http-common';

class BalanceService {
  get() {
    return http.get('/cashBalance');
  }
  
}

export default new BalanceService();
