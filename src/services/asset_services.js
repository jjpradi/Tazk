import http from '../http-common'

class Assets {
    getAll(data){
        return http.post(`/assets`, data)
    }

    asstConditionDash(){
        return http.get('/assets/AssetCondition')
    }
    asstAuditDash(){
        return http.get('/assets/PendingAudits')
    }

    getAssetTimeline(id) {
        return http.get(`/assets/timeline/${id}`)
    }

    getUnAssign() {
        return http.get('/assets/getUnAssign')
    }

    getTotalAssets() {
        return http.get('/assets/totalAssets')
    }

    getUnAuditedData(){
        return http.get('/assets/getUnAuditedData')
    }

    topAssetsByValue(){
        return http.get(`/assets/topAssetsByValue`)
    }

    getAllAsset() {
        return http.get('/assets')
    }
    createAssign(data) {
        return http.post(`/assets/createAssign`,data)
    }

    createScrapAsset(data) {
        return http.post(`/assets/scrapAsset`, data)
    }

    create(data) {
        return http.post(`/assets/createAsset`, data)
    }
    
    update(data){
        return http.post(`/assets/updateAsset`,data)
    }

    getImage(data){
        return http.post(`/assets/getImage`, data)
    }

    updateImage(data){
        return http.post(`/assets/updateImage`,data)
    }
    
    getAssetGroup(data){
        return http.post(`/assets/getAssetGroup`,data)
    }  
    
    getInitialAssetGroup(data){
        return http.post(`/assets/getInitialAssetGroup`,data)
    }  
    
    getAssetType(data){
        return http.post(`/assets/getAssetType`,data)
    }
    
    getInitialAssetType(data){
        return http.post(`/assets/getInitialAssetType`,data)
    }

    insertNewAssetType(data){
        return http.post(`/assets/insertNewAssetType`,data)
    }

    getAssetCode(){
        return http.get(`/assets/getAssetCode`)
    }
    
    createMove(data) {
        return http.post(`/assets/createMove`, data)
    }

    getMove(data){
        return http.post(`/assets/getMove`, data)
    }

    createDynamicProperty(data){
        return http.post(`/assets/dynamicProp`, data)
    }

    getDynamicPropertyByAssetType(data){
        return http.post(`/assets/getDynamicPropByAssetType`, data)
    }

    getDynamicProp(data){
        return http.post(`/assets/getDynamicProp`, data)
    }
    getassetDetails(data){
        return http.post(`/assets/assetDetails` , data)
    }

    getAssignData(data) {
    return http.post(`/assets/assignTo`, data)
    }
    
    editDynamicProp(data){
        return http.put(`/assets/editDynamicProp`, data)
    }

    deleteAssetsDynamicProp(id){
        return http.delete(`/assets/deleteAssetsDynamicProp/${id}`)
    }
    deleteAssetType(id){
        return http.post(`/assets/getAssetType/${id}`)
    }
    deleteInitialAssetType(id){
        return http.post(`/assets/deleteInitialAssetType/${id}`)
    }
    deleteAssetGroup(id){
        return http.post(`/assets/getAssetGroup/${id}`)
    }
    deleteInitialAssetGroup(id){
        return http.post(`/assets/deleteInitialAssetGroup/${id}`)
    }

    assetWarantyServices(data){
        return http.post(`/assets/assetWarranty`,data)
    }

    warrantyListServices(data){
        return http.post(`/assets/warrantyList`,data)
    }

    getWarrantyByAsset(id){
        return http.get(`/assets/warranty/${id}`)
    }

    addAssetType(data){
        return http.post(`/assets/addAssetType`, data)
    }

    addAssetGroup(data){
        return http.post(`/assets/addAssetGroup`, data)
    }

    getAssetFields(payload){
        return http.post(`/assets/assetFields`, payload)
    }

    assignedCardCount() {
        return http.get(`/assets/assignedCard`)
    }

    totalAssetValue(){
        return http.get(`/assets/totalAssetValue`)
    }
    assetStatusCount(){
        return http.get(`/assets/assetStatusCard`)
    }

    assetLocations(){
        return http.get(`/assets/assetLocationCard`)
    }
    
    assetTypeCardChart(data) {
        return http.post(`/assets/assetTypeCard`, data)
    }

    assetYearValue() {
        return http.get(`/assets/assetYearValueCard`)
    }

    deleteLeadsDynamicProp(id){
        return http.delete(`/assets/deleteLeadsDynamicProp/${id}`)
    }

    getWarrantyById(id){
        return http.get(`/assets/warrantyById/${id}`)
    }

    renewWarranty(data, id){
        return http.post(`/assets/warranty/renew/${id}`, data)
    }

    getScrapAssetApprovals(payload) {
        return http.post('/assets/approvals/scrapAssetRequest', payload)
    }

    getScrapAssetById(id) {
        return http.post(`/assets/getScrapAsset/${id}`)
    }

    getScrapAssetConfig() {
        return http.post('/assets/getScrapAssetConfig')
    }

    scrapAssetRejected(data, id) {
        return http.post(`/assets/rejected/${id}`, data)
    }

    scrapAssetApproved(data, id) {
        return http.post(`/assets/approved/${id}`, data)
    }

    deleteScrapSerivce(id) {
        return http.put(`/assets/deleteScrapRequest/${id}`)
    }

    updateSeenScrapAssetApproval(id) {
        return http.put(`/assets/updatescrapAssetRequestSeen/${id}`)
    }

    getScrapAssetReport(data) {
        return http.post('/assets/scrapAssetReport', data)
    }

    addEventReminder(data){
        return http.post('/assets/addReminder',data)
    }

    getEventReminder(data){
        return http.post('/assets/getReminders',data)
    }

    getRentalAndTenants(data){
        return http.post('/assets/getRentalAndTenants',data)
    }

    createRentalTenant(data){
        return http.post('/assets/createRentalTenant',data)
    }

    getRentalTenantById(id){
        return http.get(`/assets/getRentalTenantById/${id}`)
    }

    updateRentalTenant(data, id){
        return http.put(`/assets/updateRentalTenant/${id}`, data)
    }

    deleteRentalTenant(id){
        return http.delete(`/assets/deleteRentalTenant/${id}`)
    }

    createCompliance(data){
        return http.post('/assets/createCompliance',data)
    }

    getAssetWarrantyType(data){
        return http.post('/assets/getWarranty',data)
    }

    createAsstGeneral(data){
        return http.post('/assets/createAsstGeneralContact',data)
    }

    updateAssetGeneral(data, id){
        return http.put(`/assets/editGeneralContact/${id}`, data)
    }

    deleteAsstGeneralContact(id){
        return http.delete(`/assets/deleteGeneralContact/${id}`)
    }

    asstGeneralContact(data){
        return http.post('/assets/asstGeneralContact',data)
    }

    getAssetsCalendar(data){
        return http.post('/assets/getAssetsCalendar',data)
    }

    updateWarranty(data,id){
        return http.put(`/assets/update/${id}`,data)
    }

    deleteRenewals(data,type){
        return http.post(`/assets/deleteRenewals/${type}`,data)
    }
}

export default new Assets