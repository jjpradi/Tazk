import http from '../http-common';

class GstItcBlockReasonService {
    list() {
        return http.get('/gstItcBlockReason/');
    }

    create(data) {
        return http.post('/gstItcBlockReason/', data);
    }

    update(id, data) {
        return http.put(`/gstItcBlockReason/${id}`, data);
    }

    remove(id) {
        return http.delete(`/gstItcBlockReason/${id}`);
    }
}

export default new GstItcBlockReasonService();
