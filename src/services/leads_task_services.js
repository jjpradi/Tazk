import http from '../http-common'

class LeadsTask{
    createTask(data){
        return http.post(`/leadsManagement`,data)
    }

    getTask(data){
        return http.post('/leadsManagement/leadTask',data)
    }
    getLeadsAccounts(data){
        return http.post('/leadsManagement/getLeadsAccounts',data)
    }
    getAccountsTimeline(id) {
        return http.get(`/leadsManagement/getAccountsTimeline/${id}`)
    }
    getAccountsContacts(data){
        return http.post('/leadsManagement/AccountsContacts',data)
    }
    getTaskLeads(data){
        return http.post('/leadsManagement/getTaskLeads',data)
    }
}

export default new LeadsTask