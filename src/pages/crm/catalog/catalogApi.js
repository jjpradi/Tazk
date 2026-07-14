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

class CatalogApi {
  listProducts(params = {}) {
    return http.get(`/leadsservice/api/crm/catalog/products${buildQueryString(params)}`)
  }

  getProductById(catalogProductId) {
    return http.get(`/leadsservice/api/crm/catalog/products/${catalogProductId}`)
  }

  createProduct(payload) {
    return http.post('/leadsservice/api/crm/catalog/products', payload)
  }

  updateProduct(catalogProductId, payload) {
    return http.put(`/leadsservice/api/crm/catalog/products/${catalogProductId}`, payload)
  }

  listPriceLists(params = {}) {
    return http.get(`/leadsservice/api/crm/price-lists${buildQueryString(params)}`)
  }

  createPriceList(payload) {
    return http.post('/leadsservice/api/crm/price-lists', payload)
  }

  updatePriceList(priceListId, payload) {
    return http.put(`/leadsservice/api/crm/price-lists/${priceListId}`, payload)
  }

  listPriceListItems(priceListId) {
    return http.get(`/leadsservice/api/crm/price-lists/${priceListId}/items`)
  }

  createPriceListItem(priceListId, payload) {
    return http.post(`/leadsservice/api/crm/price-lists/${priceListId}/items`, payload)
  }

  updatePriceListItem(priceListItemId, payload) {
    return http.put(`/leadsservice/api/crm/price-list-items/${priceListItemId}`, payload)
  }
}

export default new CatalogApi()
