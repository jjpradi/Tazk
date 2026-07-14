import http from '../http-common';

class DealsService {
  getPipelines() {
    return http.get('/leadsservice/api/deals/pipelines');
  }

  getBoard(pipelineId) {
    const qs = pipelineId ? `?pipelineId=${encodeURIComponent(pipelineId)}` : '';
    return http.get(`/leadsservice/api/deals/board${qs}`);
  }

  createDeal(payload) {
    return http.post('/leadsservice/api/deals/deals', payload);
  }

  moveDealStage(dealId, stageId) {
    return http.put(`/leadsservice/api/deals/deals/${dealId}/move`, {stageId});
  }
}

export default new DealsService();

