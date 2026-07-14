import jwtAxios from '../auth/jwt-auth';
import MockAdapter from 'axios-mock-adapter';

export default new MockAdapter(jwtAxios, {delayResponse: 100});
