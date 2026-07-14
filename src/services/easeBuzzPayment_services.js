import http from '../http-common';

class easeBuzzPaymentService {
    
 
    initiatePayment(data) {
        return http.post('/easeBuzzPayment/initiate_payment', data); 
    }

}

export default new easeBuzzPaymentService();