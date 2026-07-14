import http from 'http-common'

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    searchParams.append(key, value)
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

class DealsApi {
  listPipelines(params = {}) {
    return http.get(`/leadsservice/api/crm/pipelines${buildQueryString(params)}`)
  }

  listPipelineStages(pipelineId) {
    return http.get(`/leadsservice/api/crm/pipelines/${pipelineId}/stages`)
  }

  listDeals(params = {}) {
    return http.get(`/leadsservice/api/crm/deals${buildQueryString(params)}`)
  }

  getDeal(dealId) {
    return http.get(`/leadsservice/api/crm/deals/${dealId}`)
  }

  createDeal(payload) {
    return http.post('/leadsservice/api/crm/deals', payload)
  }

  updateDeal(dealId, payload) {
    return http.put(`/leadsservice/api/crm/deals/${dealId}`, payload)
  }

  moveDealStage(dealId, payload) {
    return http.post(`/leadsservice/api/crm/deals/${dealId}/move-stage`, payload)
  }
}

export default new DealsApi()
