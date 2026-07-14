import http from '../http-common'

class DeletedLog {
    getAll(data){
        return http.post('/deletedLogDetails',data)
    }
}


export default new DeletedLog ;