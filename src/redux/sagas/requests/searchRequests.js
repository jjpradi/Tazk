import http from '../../../http-common';
import axios from 'axios';
import {CANCEL} from 'redux-saga';
const CancelToken = axios.CancelToken;

class SearchRequests {
  product(data, token) {
    const source = CancelToken.source();
    const request = http.post('/product/searchProduct',{data:data}, {cancelToken: token});
    request[CANCEL] = () => source.cancel();
    return request;
  }
}

export default new SearchRequests();
