import http from '../http-common';

class StactService {
  
    getClientDetails (){
      return http.get(`/stact/dashboard`);
    }

}

export default new StactService();
