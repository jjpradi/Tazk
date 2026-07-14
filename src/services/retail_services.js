import http from '../http-common';

class RetailService {
    add_service(data) {
        return http.post("/retailServices", data)
    }
    update_service(data) {
        return http.put("/retailServices/" + data?.service_id, data)
    }
    add_customer_interaction(data) {
        return http.post("/retailServices/customInteractions", data)
    }
    get_service(data) {
        return http.post("/retailServices/getServices", data)
    }
    jobCardCount(data) {
        return http.get("/retailServices/jobCardCount", data)
    }
    
    getTargetDelivery(data) {
        return http.get("/retailServices/getTargetDelivery", data)
    }
    
    get_service_id() {
        return http.get("/retailServices/serviceId")
    }
    get_previousdate(id) {
        return http.get("/retailServices/previousdate/"+ id)
    }
    get_servicebycustomerid(id) {
        return http.get("/retailServices/servicebycustomerid/"+ id)
    }
    get_service_payment(data){
        return http.post("/retailServices/get_service_payment",data)
    }
}


export default new RetailService();