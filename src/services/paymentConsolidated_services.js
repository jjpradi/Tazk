import http from '../http-common';

class PaymentConsolidatedservice {
  getAll() {
    return http.get('/paymentConsolidated');
  }

  get(id) {
    return http.get(`/paymentConsolidated/${id}`);
  }


  //   create(data) {
  //     return http.post("/ledger",  data );
  //   }

  //   updateStock(id, data) {
  //     return http.put(`/ledger/${id}`,  data );
  //   }

  //   update(id, data) {
  //     return http.put(`/ledger/${id}`,  data );
  //   }

  //   delete(id) {
  //     return http.delete(`/ledger/${id}`);
  //   }

  //   LedgerReceived(){
  //     return http.get(`/ledger/stockLedger`);
  //   }

  //   getParentWithGroupId(){
  //     return http.get(`/ledger/parent/group`);
  //   }

  // payablesPaymentEntry(data){
  //   return http.put(`/ledger/stockLedgerPaymentEntry`, { "table_name": "purchase","table_data": data });
  // }

  // deleteAll() {
  //   return http.delete(`/tutorials`);
  // }

  // findByTitle(title) {
  //   return http.get(`/tutorials?title=${title}`);
  // }
}

export default new PaymentConsolidatedservice();
