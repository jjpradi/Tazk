import http from '../http-common';


class LiveLocation {
  getLocation(data) {
      return http.post(`/liveTracking/liveLocation`,data);
  }

  getProjectLocation(data) {
    return http.post(`/liveTracking/taskLiveLocation`,data);
  }

  getEmpBasedTravelHistory(data){
    return http.post(`/liveTracking/getEmpBasedTravelHistory`, data);
  }

  getProjectEmpBasedTravelHistory(data){
    return http.post(`/liveTracking/getProjectEmpBasedTravelHistory`, data);
  }

  getTravelTimeLineAction(data){
    return http.post(`/liveTracking/getTravelTimeLine`, data);
  }

  getProjectTravelTimeLine(data){
    return http.post(`/liveTracking/getProjectTravelTimeLine`, data);
  }

  getTaskLogs(data) {
    return http.get(`/liveTracking/getTaskLogs`,data);
  }
}
export default new LiveLocation;