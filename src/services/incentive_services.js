import http from '../http-common';

class IncentiveService {

    createIncentive(data) {
    return http.post('/Incentive', data);
  }

  updateAmountIncentive(data){
    return http.post('/Incentive/updateAmount', data);
  }
  
  getIncentiveMonthData(){
    return http.get('/Incentive/getIncentiveDetails');
  }
}

export default new IncentiveService();
