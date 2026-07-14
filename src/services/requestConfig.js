import http from '../http-common';

class RequestConfig {

    getCompanyBasedAdminManager(data) {
        return http.post(`/requestConfig/getCompanyBasedAdminManager`, data)
    }
    getManagerBasedRoutes() {
        return http.get(`/requestConfig/getManagerBasedRoutes`)
    }
    createConfig(data) {
        return http.post(`/requestConfig/createRequestConfig`, data)
    }


    getConfig(data) {
        return http.post(`/requestConfig`, data)
    }

    getConfigById(id) {
        return http.get(`/requestConfig/getByid/${id}`)
    }

    updateConfig(id, data) {
        return http.put(`/requestConfig/${id}`, data)
    }

    deleteConfig(id) {
        return http.delete(`/requestConfig/${id}`)
    }

    getRequestType() {
        return http.get(`/requestConfig/getRequestType`)
    }
    getRequestApproverVerifierType(id) {
        return http.get(`/requestConfig/approververifierType/${id}` )
    }

    getEmpDeptApproverVerifier(id,data) {
        return http.post(`/requestConfig/empDeptApproverVerifier/${id}`,data )
    }

    sendMailForgot(data) {
        return http.post(`/requestConfig/sendMailForgetPassword`, data);
    }

    verifyOtp(data) {
        return http.post(`/requestConfig/verifyOtp`, data);
    }
    
    sendOTPforAuthentication(data) {
        return http.post(`/requestConfig/enableOtpForAuthentication`, data);
    }

    verifyOtpForAuthentication(data) {
        return http.post(`/requestConfig/verifyOtp/multifactorAuthentication`, data);
    }

    updatePassword(data) {
        return http.put(`/requestConfig/updateUserPassword`, data);
    }

    createFrontDesk(data) {
        return http.post(`/requestConfig/createFrontDeskUser`, data);
    }

    getAllFrontDesk(data) {
        return http.post(`/requestConfig/getAllFrontDeskUsers`, data);
    }

    updateFrontDeskUser(data) {
        return http.post(`/requestConfig/updateFrontDeskUser`, data);
    }

    createPOSDiscount(data){
        return http.post(`/requestConfig/posDiscountConfig`, data);
    }

    updatePOSDiscount(data, discountConfigId){
        return http.put(`/requestConfig/posDiscountConfig/update/${discountConfigId}`, data);
    }

    getPOSDiscountById(id){
        return http.get(`/requestConfig/getPOSDiscountById/${id}`)
    }

    getDiscountConfigByPosId(posId){
        return http.get(`/requestConfig/discountConfig/${posId}`)
    }
}

export default new RequestConfig();
