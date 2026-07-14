import http from '../http-common'

class LeadManagement{
    getFields(){
        return http.get('/leadManagement/fields')
    }

    getStatus(){
        return http.post('/leadManagement/status')
    }

    getInitialStatus(){
        return http.post('/leadManagement/getInitialStatus')
    }

    createLead(data){
        return http.post('/leadManagement/createLead', data)
    }

    getLeads(data){
        return http.post('/leadManagement', data)
    }

    updateLeadStatus(data){
        return http.put('/leadManagement/updateLeadStatus', data)
    }

    getLeadStatusHistory(data){
        return http.post('/leadManagement/leadStatusHistory', data)
    }

    updateLead(data, leadId){
        return http.put(`/leadManagement/${leadId}`, data)
    }

    createCustomField(data){
        return http.post(`/leadManagement/createField`, data)
    }

    getLeadSource(data){
        return http.post(`/leadManagement/leadSource`,data)
    }

    leadInitialSource(data){
        return http.post(`/leadManagement/leadInitialSource`,data)
    }

    addSource(data){
        return http.post(`/leadManagement/newLeadSource`, data)
    }
    
    getTimelineMessage(id) {
        return http.get(`/leadManagement/getTimelineMessage/${id}`)
    }

    getAllAccounts(){
        return http.get(`/leadsManagement/getAllLeadAccounts`)
    }

    getLeadBySource(){
        return http.get('/leadManagement/leadBySource')
    }

    getTodaysLeads(){
        return http.post('/leadManagement/todaysLeads')
    }

    totalLeads(data){
        return http.post('/leadManagement/totalLeads',data)
    }
    
    customerGrowth(){
        return http.get('/leadManagement/customerGrowth')
    }
    
    leadsComparision(){
        return http.get('/leadManagement/leadsComparision')

    }

    convertedLeadsCount(data) {
        return http.post('/leadManagement/convertedLeads',data)
    }

    convertedLeadsValue() {
        return http.get('/leadManagement/convertedLeadsValue')
    }

    convertedLeadsAndValues() {
        return http.get('/leadManagement/convertedLeadsAndValues')
    }

    getAllLeads(){
        return http.get('/leadManagement/getAllLeads')
    }

    deleteLeadSource(id){
        return http.post(`/leadManagement/deleteLeadSource/${id}`)
    }

    deleteInitialLeadSource(id){
        return http.post(`/leadManagement/deleteInitialLeadSource/${id}`)
    }

    createAccount(data) {
        return http.post('/leadManagement/createAccount', data)
    }

    activeTotalLeads(data) {
        return http.post('/leadManagement/activeLeads', data)
    }

    additionalContacts(id) {
        return http.post(`/leadManagement/additonalContacts/${id}`)
    }
    
    getSalesLeads() {
        return http.get('/leadManagement/salesLeads')
    }

    approxValueBasedOnLeadSource(){
        return http.get(`/leadManagement/totalApproxValueByLeadSource`)
    }
    
    getleadsPipeline() {
        return http.get(`/leadManagement/leadsPipeline`)
    }

    addLeadStatus(data){
        return http.post(`/leadManagement/addLeadStatus`, data)
    }

    updateLeadStageName(id, data){
        return http.put(`/leadManagement/status/${id}`, data)
    }

    reorderLeadStages(data){
        return http.put(`/leadManagement/status/reorder`, data)
    }

    deleteLeadStatus(id){
        return http.delete(`/leadManagement/status/${id}`)
    }

    deleteInitialStatus(id){
        return http.delete(`/leadManagement/deleteInitialStatus/${id}`)
    }
    
    getCreatedByAndUpdatedByFullName(data){
        return http.post('/leadManagement/getCreatedByUpdatedByFullName', data)
    }
    
    getLeadCustomers(data){
        return http.post('/quotation/leadCustomers', data)
    }

    leadsDailyReport(data) {
        return http.post('/leadManagement/leadsDailyReport', data)
    }

    workingContactedLeads() {
        return http.get('/leadManagement/workingContactedLeads')
    }

    openNotcontactedLeads() {
        return http.get('/leadManagement/openNotcontactedLeads')
    }

    closedNotconvertedLeads() {
        return http.get('/leadManagement/closedNotconvertedLeads')
    }

    whatsAppLeadProposal(data) {
        return http.post('/leadManagement/whatsAppLeadProposal',data)
    }
}

export default new LeadManagement
