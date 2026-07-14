import http from '../http-common'

class Meetings {
    getMeetingsAll(data) {
        return http.post('/meetings', data)
    }

    createMeetingsAll(data) {
        return http.post('/meetings/create', data)
    }

    getLeadUserName() {
        return http.get('/meetings/getLeadUserName')
    }
}

export default new Meetings