import http from '../http-common'

class Timeline {
    getTimeline(menuType, id) {
        return http.get(`/timeline/${menuType}/${id}`)
    }
}

export default new Timeline
