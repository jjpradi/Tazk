import http from '../http-common';

class PayrollDashboardServices {
  // getCheckedIn() {
  //   return http.get(`/payrollDashboard/getCheckedIn`);
  // }

  getCheckedIn(data) {
    return http.post(`/payrollDashboard/getCheckedIn`, data);
  }

  getCheckedInAndOut(){
    return http.get(`/payrollDashboard/InOut`);
  }
  // getNotCheckedIn() {
  //   return http.get(`/payrollDashboard/getNotCheckedIn`);
  // }

  getNotCheckedIn(data) {
    return http.post(`/payrollDashboard/getNotCheckedIn`, data);
  }

  getLateLogin() {
    return http.get(`/payrollDashboard/getLateLogin`);
  }

  getLeavesStatus() {
    return http.get(`/payrollDashboard/getLeavesStatus`);
  }

  getCompleteList() {
    return http.get(`/payrollDashboard/getCompleteList`);
  }

  getEmployeeCount() {
    return http.get(`/payrollDashboard/employeeCount`);
  }

  holidaysCard() {
    return http.get(`/payrollDashboard/holidaysCard`);
  }

  lastCheckInCard() {
    return http.get(`/payrollDashboard/lastCheckInCard`);
  }

  earlyCheckoutCard() {
    return http.get(`/payrollDashboard/earlyCheckoutCard`);
  }

  getProjects(data) {
    return http.post(`/projects/getProjects`,data);
  }

  createBoards(data){
    return http.post(`/projects/createProjectBoard`,data)
  }

  createProjectService(data){
    return http.post(`/projects/createProject`,data)
  }

  checkProjectExistsService(data){
    return http.post(`/projects/checkProjectExists`, data)
  }

  ProjectSettings(data){
    return http.post(`/projects/ProjectSettings`,data)
  }

  getProjectLanes(data){
    return http.post('/projects/getProjectLanes',data)
  }

  getTasksStatus(data){
    return http.post('/projects/getTasksStatus',data)
  }

  getTasksDataStatus(data){
    return http.post('/projects/get_tasks_data',data)
  }

  getTaskPriority(data){
    return http.post('/projects/getTaskPriority',data)
  }

  teamWorkLoad(data){
    return http.post('/projects/teamWorkLoad',data)
  }

  typesOfWork(data){
    return http.post('/projects/typesOfWork',data)
  }

  epicProgress(data){
    return http.post('/projects/epicProgress',data)
  }

  workLogReport(data){
    return http.post('/projects/workLogReport',data)
  }

  deleteProjectLanes(data){
    return http.post('/projects/deleteProjectLanes',data)
  }

  getTasklist(data) {
    return http.post(`/projects/getTaskviaProject`,data);
  }

  createtasks(data) {
    return http.post(`/projects/createTasks`,data);
  }

  createEpic(data) {
    return http.post(`/projects/createEpic`, data);
  }

  taskLogs(data) {
    return http.post(`/projects/searchSummaryReport` ,data);
  }

  updateTask(id,data) {
    return http.put(`/projects/updateTasks/${id}`,data);
  }

  updateLogData(data) {
    return http.put(`/projects/updateLogData/${data.task_id}`, data);
  }
  deleteLogData(data) {
    return http.put(`/projects/DeleteLogData/${data.task_id}`, data);
  }

  updateProject(data) {
    return http.put(`/projects/getProjects`,data);
  }

  deleteProject(data) {
    return http.put(`/projects/deleteProjects`,data);
  }

  deleteTask(data) {
    return http.put(`/projects/deleteTask`,data);
  }

  lateLoginEarlycheckout(data) {
    return http.get(`/payrollDashboard/lateAndearly`);
  }

  locationWiseAttendance() {
    return http.get(`/payrollDashboard/locationWiseAttendance`);
  }

  locationWiseCheckedIn(location_id) {
    return http.get(`/payrollDashboard/locationWiseCheckedIn/${location_id}`,);
  }

  locationWiseNotCheckedIn(location_id) {
    return http.get(`/payrollDashboard/locationWiseNotCheckedIn/${location_id}`,);
  }

  locationWiseLateCheckIn(location_id) {
    return http.get(`/payrollDashboard/locationWiseLateCheckIn/${location_id}`,);
  }

  locationWiseEarlyCheckOut(location_id) {
    return http.get(`/payrollDashboard/locationWiseEarlyCheckOut/${location_id}`,);
  }

  employeeLateLoginEarlycheckout(person_id, data){
    return http.post(`/payrollDashboard/employeeLateAndearly/${person_id}`, data);
  }
  
  currentDayCardDetail(){
    return http.get(`/attendance/currentDayCardDetail`);
  }
  approvedAndUnapprovedservice(){
    return http.get(`/attendance/approvedAndUnapproved`);
  }

  // getAverageWorkHours(person_id) {
  //   return http.get(`/payrollDashboard/getAverageWorkHours/${person_id}`)
  // }
  getAverageWorkHours(person_id) {
    if (person_id === undefined) {
      return http.get(`/payrollDashboard/getAverageWorkHours/null`);
    }
    return http.get(`/payrollDashboard/getAverageWorkHours/${person_id}`);
  }
  

  experienceDetails(){
    return http.get(`/payrollDashboard/experienceDetails`)
  }

  empexperienceDetails(){
    return http.get(`/payrollDashboard/EmpexperienceDetails`)
  }

  topEmpByAttendance(type){
    return http.get(`/payrollDashboard/topEmpByAttendance/${type}`)
  }

  getCompanyAdmin(){
    return http.get(`/payrollDashboard/getCompanyAdmin`)
  }

  updateTimeSpent(data){
    return http.post(`/projects/updateTimeSpent`, data)
  }

  getlogs(data){
    return http.post(`/projects/getlogs` ,data)
  }

  getTaskComments(data){
    return http.post(`/projects/taskComments` ,data)
  }

  filterTaskLog(data){
    return http.post(`/projects/getfilterLog` ,data)
  }
  startEnd(data){
    return http.post(`/payrollDashboard/startEnd` ,data)
  }

  getTaskStatus(data){
    return http.post(`/projects/getTaskStatus`, data)
  }

  statusUpdate(data){
    return http.post(`/projects/updateTasks/statusUpdate`,data)
  }

  createAnnouncement(data){
    return http.post(`/announcement/createAnnouncement`, data)
  }

  getAnnouncements(){
    return http.get(`/announcement/getAnnouncements`)
  }
  
  updateAnnouncement(data, id) {
    return http.put(`/announcement/updateAnnouncement/${id}`, data)
  }

  updateInactive(id) {
    return http.put(`/announcement/announcementUpdateInActive/${id}`)
  }

  getTaskByStatus(projectId, body = {}){
    return http.post(`/projects/taskByStatus/${projectId}`, body)
  }

  dragUpdate(taskId, payload){
    return http.put(`/projects/dragUpdate/${taskId}`, payload)
  }

  getProjectDetails(projectId){
    return http.get(`/projects/projectDetails/${projectId}`)
  }
  CostSummary(){
    return http.get(`/salary/costSummary`)
  }

  get_emp_location(id){
    return http.get(`/payrollDashboard/getEmpLocation/${id}`)
  }
  get_emp_location_active(id){
    return http.get(`/payrollDashboard/getEmpLocationActive/${id}`)
  }

  update_location(id){
    return http.post(`/payrollDashboard/UpdateStatus/${id}`)
  }
  update_password(data){
    return http.put(`/forgetPassword/adminUpdatePassword`,data)
  }

  getprojectTypes(data) {
    return http.get(`/projects/getprojectTypes`);
  }
  timeSheetEnableDisableList(){
    return http.get(`/projects/timeSheetEnableDisableList`)
  }
  taskDetailsCount(){
    return http.get(`/projects/taskDetailsCount`)
  }
  filterTaskDetails(data){
    return http.post(`/projects/filterTaskDetails`,data)
  }
  getCreatedAndResolved(){
    return http.get(`/payrollDashboard/getCreatedAndResolved`)
  }

  getWorkLoad(){
    return http.get(`/projects/getWorkLoad`)
  }

  getTaskWorkLog(){
    return http.get(`/projects/taskWorkLog`)
  }

  getTaskLogReport(){
    return http.get(`/projects/taskLogReport`)
  }

  viewmode(data){
    return http.post(`/projects/viewmode`, data)
  }

  rankScoreCard(id){
    return http.get(`/projects/topAttendanceDataBasesEmp/${id}`)
  }

  tasksDelete(data){
    return http.post(`/projects/tasksDelete`, data)
  }

  createSprint(data) {
    return http.post(`/projects/createSprint`, data);
  }

  getSprintDetails(data) {
    return http.post(`/projects/getAllSprintDetails`, data );
  }

  deleteSprint(data) {
    return http.put(`/projects/deleteSprint`, data);
  }

  updateSprint(data) {
    return http.post(`/projects/updateSprint`, data);
  }

  completeSprint(data) {
    return http.put(`/projects/completeSprint`, data);
  }

  getEmployeeList(){
    return http.get(`/payrollDashboard/getEmployeeList`)
  }
  getActiveStatusByLane(id){
    return http.get(`/projects/getActiveStatusByLane/${id}`)
  }
  getEpicList(projectId) {
  return http.get(`/projects/getEpicList/${projectId}`);
}

  getStory(data) {
    return http.post(`/projects/getStory`, data);
  }

  getEpic(projectId, epicId) {
    return http.get(`/projects/getEpic/${projectId}/${epicId}`);
  }

  getTaskviaEpic(projectId, epicId) {
    return http.get(`/projects/getTaskviaEpic/${projectId}/${epicId}`);
  }

  getStoryRelatedTask(data) {
    return http.post(`/projects/getStoryRelatedTask`, data);
  }

  deleteEpicData(epicId, data) {
    return http.put(`/projects/deleteEpicData/${epicId}`, data);
  }
  
  updateEpicData(epicId, data) {
    return http.post(`/projects/updateEpicData/${epicId}`, data);
  }

  getTaskIdBySearch(data) {
    return http.post(`/projects/getTaskIdBySearch`, data);
  }

  getProjectsReportList(data) {
    return http.post(`/projects/getProjectsReportList`, data);
  }

  getSprintReport(data) {
    return http.post(`/projects/getSprintReport`, data);
  }

  startCsvImport() {
    return http.post(`/projects/importCsv/start`, {}, { timeout: 30000 });
  }

  uploadCsvChunk(sessionId, chunkIndex, rows) {
    return http.post(
      `/projects/importCsv/chunk`,
      { sessionId, chunkIndex, rows },
      { timeout: 30000 }
    );
  }

  commitCsvImport(sessionId, options) {
    return http.post(
      `/projects/importCsv/commit`,
      { sessionId, ...options },
      { timeout: 30000 }
    );
  }

  abortCsvImport(sessionId) {
    return http.post(
      `/projects/importCsv/abort`,
      { sessionId },
      { timeout: 15000 }
    );
  }

}



export default new PayrollDashboardServices();


