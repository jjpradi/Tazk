import http from '../http-common';

class WhatsappServices {
  get() {
    return http.get(`/whatsapp/list`);
  }

  getCustomer() {
    return http.get(`/whatsapp/customer`);
  }

  sendMsg(data) {
    return http.post(`/whatsapp/sendMsg`, data);
  }
}

export default new WhatsappServices();
