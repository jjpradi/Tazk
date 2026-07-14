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

class QuotationsApi {
  listQuotations(params = {}) {
    return http.get(`/leadsservice/api/crm/quotations${buildQueryString(params)}`)
  }

  getQuotation(quotationId) {
    return http.get(`/leadsservice/api/crm/quotations/${quotationId}`)
  }

  createQuotation(payload) {
    return http.post('/leadsservice/api/crm/quotations', payload)
  }

  updateQuotation(quotationId, payload) {
    return http.put(`/leadsservice/api/crm/quotations/${quotationId}`, payload)
  }

  markQuotationSent(quotationId) {
    return http.post(`/leadsservice/api/crm/quotations/${quotationId}/mark-sent`)
  }

  markQuotationAccepted(quotationId) {
    return http.post(`/leadsservice/api/crm/quotations/${quotationId}/mark-accepted`)
  }

  listDeals(params = {}) {
    return http.get(`/leadsservice/api/crm/deals${buildQueryString(params)}`)
  }

  listCatalogProducts(params = {}) {
    return http.get(`/leadsservice/api/crm/catalog/products${buildQueryString(params)}`)
  }

  listSalesProducts() {
    return http.get('/productservice/api/product')
  }

  listPriceLists(params = {}) {
    return http.get(`/leadsservice/api/crm/price-lists${buildQueryString(params)}`)
  }

  listPriceListItems(priceListId) {
    return http.get(`/leadsservice/api/crm/price-lists/${priceListId}/items`)
  }

  listCustomers() {
    return http.get('/leadsservice/api/leadsManagement/getAllLeadAccounts')
  }
}

export default new QuotationsApi()
