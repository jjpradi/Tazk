import http from '../http-common'

class NewItem {

    getNewItemAll(data){
        return http.post('/newItem', data)
    }

    createNewItem(data){
        return http.post('/newItem/create', data)
    }

    updateNewItem(data, id){
        return http.put(`/newItem/updateNewItem/${id}`, data)
    }

    getNewItemByAsset(id, data){
        return http.post(`/newItem/${id}`, data || {})
    }
}
export default new NewItem
