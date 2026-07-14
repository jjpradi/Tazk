import http from '../http-common'

class Campaign {
    getCampaignAll(data) {
        return http.post('/campaign', data)
    }

    createCampaignAll(data) {
        return http.post('/campaign/create', data)
    }

    getAllCampaign(){
        return http.get(`/campaign/getAllCampaign`)
    }

    getCampaignType() {
        return http.get('/campaign/getCampaignType')
    }

    getCampaignStatus() {
        return http.get('/campaign/getCampaignStatus')
    }

    updateCampaignStatus(data) {
        return http.put('/campaign/updateCampaignStatus', data)
    }
    
    updateCampaign(data, id){
        return http.put(`/campaign/update/${id}`, data)
    }

    getCampaignTimeline(id) {
        return http.get(`/campaign/campaignTimeline/${id}`)
    }

    getCampaignLeadCount(id) {
        return http.get(`/campaign/campaignLeadCount/${id}`)
    }
    
    getActiveCampaign() {
        return http.get(`/campaign/getActiveCampaign`)
    }

    getCampaignConvertedLeadsCountAndValue(id){
        return http.get(`/campaign/campaignConvertLeads/${id}`)
    }

    getCampaignLead(id, data) {
        return http.post(`/campaign/campaignLeads/${id}`, data)
    }
}

export default new Campaign