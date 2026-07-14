import http from '../http-common';


class NotificationService {
  getntfydata(data) {
      return http.post('/notification/getntfydata',data);
    }

  updateIsread(data,mode) {
    return http.post(`/notification/updateIsread/${mode}`, data);
  }

    getAlldata(data) {
        return http.post('/notification',data);
      }

      getUnreaddata(data) {
        return http.get('/notification/unread',data);
      }
      
      
    update(id, data) {
      return http.put(`/notification/${id}`, data);
    }

    clearNotificationData(data){
      return http.put('/notification/clearNotifications', data);
    }
    
    enabledAction(data) {
      return http.post('/notification/listenabledNtfy',data);
  }
  
  updatedNtfy(data) {
      return http.post('/notification/followerNtfyMapping',data);
  }
  getNotificationToken(data){
    return http.post('/notification/getTokenForNotification',data);
  }

  getIndividualNotification(data){
    return http.get('/notification/getIndividualNotification',data);
  }

  updateIndividualNotification(data){
    return http.post('/notification/updateIndividualNotification',data);
  }

  clearNotification(data){
    return http.post('/notification/clearNotification',data);
  }


  
}

export default new NotificationService();