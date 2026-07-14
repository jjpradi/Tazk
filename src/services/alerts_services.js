import http from '../http-common'

class Alerts {
    getAll(data) {
        return http.post(`/alerts`, data)
    }

    createAll(data) {
        return http.post('/alerts/create', data)
    }

    getAlertsEmployeeFilter(data) {
        return http.post('/alerts/getAlertsEmployeeFilter', data)
    }
}

export default new Alerts