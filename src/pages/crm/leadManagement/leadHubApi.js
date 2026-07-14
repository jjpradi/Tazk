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

class LeadHubApi {
  convertLeadToDeal(leadId) {
    return http.post(`/leadsservice/api/crm/leads/${leadId}/convert-to-deal`)
  }

  getLeadDealSummary(leadId) {
    return http.get(`/leadsservice/api/crm/leads/${leadId}/deal`)
  }

  listQuotations(params = {}) {
    return http.get(`/leadsservice/api/crm/quotations${buildQueryString(params)}`)
  }
}

export default new LeadHubApi()
