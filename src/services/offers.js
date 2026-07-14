import http from '../http-common';

class OffersService {
    getOfferDetails() {
        return http.get('/offers/getOfferDetails');
      }
      createOffer(data) {
        return http.post('/offers/createOffer', data);
      }


}

export default new OffersService();