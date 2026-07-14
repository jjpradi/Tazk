import http from '../http-common';
class Holidays {
  getAll() {
    return http.get(`/salary`);
  }
  create(data) {
    return http.post(`/salary/create`, data)
  }

  searchSalary(data) {
    return http.post(`/salary/searchSalary`, data)
  }

  pagination(data) {
    return http.post(`/salary/searchSalary`,data);
  }
  
  processSalaryPagination(data, commoncookie) {
    return http.post(`/salary/searchProcessSalary/${commoncookie}`, data)
  }
  deleteSalaryStructureService(id) {
    return http.post(`/salary/deleteSalaryStructure/${id}`)
  }

  updateProcessSalary(data, commoncookie) {
    return http.put(`/salary/searchProcessSalary/${commoncookie}`, data)
  }

  deleteProcessSalary(commoncookie, month) {
    return http.delete(`/salary/deleteProcessSalary/${commoncookie}/${month}`)
  }

  createProcessSalary(data) {
    return http.post(`/salary/processSalary/new`, data)
  }

  paySlipReportPagination(data) {
    return http.post(`/salary/paySlipReport`, data)
  }

  getProcessedBasedMonth(){
    return http.get(`/salary/processedDetail/basedOnMonth`)
  }
  updateProcessStatusMonth(data){
    return http.post(`/salary/updateStatus`, data)
  }

  salaryConfirmed(){
    return http.get(`/salary/salaryConfirmed`)
  }

  salaryConfirmedByYear() {
    return http.get(`/salary/salaryConfirmedByYear`)
  }

  partialProcessDetail(body){
    return http.post(`/salary/partialProcess`,body)
  }
  deductionType(id){
    return http.get(`/salary/deductionType/${id}`)
  }

  allowanceType(id){
    return http.get(`/salary/allowanceType/${id}`)
  }

  createSalaryStructure(data){
    return http.post(`/salary/createSalaryStructure`,data)
  }

  createTemplateStructure(data){
    return http.post(`/salary/createTemplateStructure`,data)
  }

  updateTemplateStructure(data, id) {
    return http.post(`/salary/updateTemplateStructure/${id}`, data)
  }

  bulkUploadSalaryStructure(data){
    return http.post(`/salary/bulkUploadSalaryStructure`,data)
  }

  updateSalaryStructure(id, data){
    return http.post(`/salary/updateSalaryStructure/${id}`,data)
  }

  getALlSalaryStructure(data){
    return http.post(`/salary/getAllSalaryStructure`,data)
  }

  getAllSalaryTemplate(data){
    return http.post(`/salary/getAllSalaryTemplate`,data)
  }

  getStructureBasedTemplate(data){
    return http.post(`/salary/getStructureBasedTemplate`,data)
  }

  getALlSalaryStructureWithDeductionAndAllowance() {
    return http.get(`/salary/getAllSalaryStructure/WithAllowanceAndDeduction`)
  }

  mapEmployeeBasedSalary(data){
    return http.post(`/salary/mapSalary`,data)
  }

  getMappedDetails(data){
    return http.post(`/salary/getMappedDetails/${data.ss_id}`, data)
  }

  createAllowanceDeductionTypes(data){
    return http.post(`/salary/createTypes`, data)
  }

  deleteAllowanceDeductionTypes(data){
    return http.post(`/salary/deleteType`, data)
  }

  checkDeleteAllowanceDeductionTypes(data){
    return http.post(`/salary/checkDeleteType`, data)
  }
  getSalaryReportForBank(data){
    return http.post(`/salary/salaryReportForBank`,data)
  }

  listSelectUserAction(data){
    return http.post(`/salary/userWise`,data)
  }

  deleteEmpSalary(data){
    return http.post(`/salary/deleteEmpSalary`, data)
  }

  updateEmpSalary(data){
    return http.put(`/salary/updateEmpSalary`, data)
  }

  searchSalaryReport(data){
    return http.post(`/salary/salaryReport`, data)
  }

  costSummaryReport(data) {
    return http.post(`/salary/costSummaryReport`, data);
  }

  salaryStatement(data){
    return http.post(`/salary/salaryStatement`,data)
  }
  paySlipReportTemp(data,id){
    return http.post(`/salary/paySlipReportTemp/${id}`,data)
  }

  getSalaryTemplateById(id) {
    return http.get(`/salary/getSalaryTemplateById/${id}`)
  }

  getSalaryTemplateAll() {
    return http.get(`/salary/getSalaryTemplateAll`)
  }

  deleteTemplateStructure(id) {
    return http.delete(`/salary/deleteTemplateStructure/${id}`)
  }

  getAppconfigPercent() {
    return http.get(`/salary/appConfig/percent`)
  }

  updateSalaryStructurePercent(data) {
    return http.put(`/salary/salaryPercent`, data)
  }

  getPfEsiPt() {
    return http.get(`/salary/structure/pfesipt`)
  }

  getPtSlabs() {
    return http.get(`/salary/structure/ptslabs`)
  }

}

export default new Holidays();
