import http from '../http-common'

class Calls {
    getCallsAll(data) {
        return http.post('/calls', data)
    }
    
    createCallsAll(data) {
        return http.post('/calls/create', data)
    }

    getCallPurpose() {
        return http.get('/calls/getCallPurpose')
    }

    getCallResult() {
        return http.get('/calls/getCallResult')
    }

    getLeadCompanyName() {
        return http.get('/calls/getLeadCompanyUserName')
    }
}

export default new Calls