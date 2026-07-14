import http from '../http-common';

class NavigationService {
  getBootstrap(data) {
    return http.post('/navigation/bootstrap', data);
  }
}

export default new NavigationService();
