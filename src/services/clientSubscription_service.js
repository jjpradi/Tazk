import http from '../http-common';

class clientSubscription {

  createPlan(data) {
    return http.post('/clientSubscription/createPlan',data);
  }

  updatePlan(id,data) {
    return http.put(`/clientSubscription/updatePlan/${id}`,data);
  }

  getAllPlans(data) {
    return http.post('/clientSubscription/getAllPlans',data);
  }

  getStatus() {
    return http.get('/clientSubscription/getStatus');
  }

  getPlanType() {
    return http.get('/clientSubscription/getPlanType');
  }

  schedulePlan(payload) {
    return http.post('/clientSubscription/schedulePlan',payload);
  }

  updateScheduledPlan(payload) {
    return http.post('/clientSubscription/updateScheduledPlan',payload);
  }
  
  getAllSchedulePlan(data) {
    return http.post('/clientSubscription/getAllSchedulePlan',data);
  }

  getPlanBenefits() {
    return http.get('/clientSubscription/getPlanBenefits');
  }

  getTrainingType() {
    return http.get('/clientSubscription/getTrainingType');
  }

  getClients() {
    return http.get('/clientSubscription/getClients');
  }

  updateMappedClients(data) {
    return http.post('/clientSubscription/updateMappedClients',data);
  }
}

export default new clientSubscription();