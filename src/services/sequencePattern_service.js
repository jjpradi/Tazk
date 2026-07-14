import http from '../http-common';

class SequencePattern {
  getSequenceData(headerLocationId) {
    return http.get(`/sequencePattern/${headerLocationId}`);
  }

  delete(id) {
    return http.delete(`/sequencePattern/update/${id}`);
  }

  update(id, data) {
    return http.put(`/sequencePattern/update/${id}`, data)
  }

  create(id,data) {
    return http.post(`/sequencePattern/${id}`,data)
  }

  getAllSequences() {
    return http.get('/sequencePattern/all');
  }

  getSequenceBasedOnName(data){
     return http.post(`/sequencePattern/getSequence/basedOnName`,data)
  }

 
}


export default new SequencePattern();
