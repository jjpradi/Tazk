import http from '../http-common';

class subscriptionService {
    
    getSubscriptionDetails(data) {
        return http.post('/Subscription',data); 
    }

    orderPlacedDetails(data) {
        return http.post('/Subscription/orderPlaced', data); 
    }

    cancelSubscriptionForTrial() {
        return http.get('/Subscription/cancelSubscriptionForTrial'); 
    }

    getPlanDetails(data) {
        return http.post('/Subscription/getPlanDetails/basedOnCompany', data); 
    }

    getPlanRenewalDetails(data) {
        return http.post('/Subscription/getPlanDetails/forRenewal', data); 
    }

    restrictCreationBasesPlans() {
        return http.get('/Subscription/restrict/basedOnPlan'); 
    }

    PaymentTransactionDetails(data) {
        return http.post('/Subscription/easeBuzz/paymentHistory', data); 
    }

    

    settingsModulesBasedOnRole(data) {
        return http.post('/Subscription/restrict/settingsModulesBasedOnRole', data); 
    }

}

export default new subscriptionService();