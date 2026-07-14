import Jwtservice from '../../services/renew_services';
import Cookies from 'universal-cookie';
import DB from '../../db';
import { getsessionStorage } from 'pages/common/login/cookies';

var db = new DB('pos_session');

// const cookies = new Cookies();
// let token1 = () => cookies.get('login')?.token1;
const storage = getsessionStorage()
let token1 = () => storage?.token1;

export const getToken = async (service, actionTypes, dispatch) => {
  const auth = await Jwtservice.create(token1());
  // cookies.set('login', {
  //   auth: 'success',
  //   token: auth.data.accessToken,
  //   token1: auth.data.refreshToken,
  // });
  sessionStorage.setItem('login', {
    auth: 'success',
    token: auth.data.accessToken,
    token1: auth.data.refreshToken,
  })
  const response = await service.getAll(auth.data.accessToken);

  dispatch({
    type: actionTypes,
    payload: response.data,
  });
};

export const createToken = async (
  service,
  actionTypes,
  dispatch,
  data,
  alertResponce,
  db_id,
) => {
  const auth = await Jwtservice.create(token1());
  // cookies.set('login', {
  //   auth: 'success',
  //   token: auth.data.accessToken,
  //   token1: auth.data.refreshToken,
  // });
  sessionStorage.setItem('login', {
    auth: 'success',
    token: auth.data.accessToken,
    token1: auth.data.refreshToken,
  })
  const response = await service.create(data, auth.data.accessToken);
  if (response.data.affectedRows === 1) {
    alertResponce('Created SuccessFully', 'success');
    dispatch({
      type: actionTypes,
      payload: response.data.data,
    });
    if (db_id) {
      await db.deleteOfflineApi(db_id);
    }
  }
};

export const updateToken = async (
  service,
  actionTypes,
  dispatch,
  data,
  id,
  alertResponce,
) => {
  const auth = await Jwtservice.create(token1());
  // cookies.set('login', {
  //   auth: 'success',
  //   token: auth.data.accessToken,
  //   token1: auth.data.refreshToken,
  // });
  sessionStorage.setItem('login', {
    auth: 'success',
    token: auth.data.accessToken,
    token1: auth.data.refreshToken,
  })
  const response = await service.update(id, data, auth.data.accessToken);
  alertResponce('Updated SuccessFully', 'success');
  dispatch({
    type: actionTypes,
    payload: response.data.data,
  });
};

export const deleteToken = async (
  service,
  actionTypes,
  dispatch,
  id,
  alertResponce,
) => {
  const auth = await Jwtservice.create(token1());
  // cookies.set('login', {
  //   auth: 'success',
  //   token: auth.data.accessToken,
  //   token1: auth.data.refreshToken,
  // });
  sessionStorage.setItem('login', {
    auth: 'success',
    token: auth.data.accessToken,
    token1: auth.data.refreshToken,
  })
  const response = await service.delete(id, auth.data.accessToken);
  alertResponce('Deleted SuccessFully', 'info');
  dispatch({
    type: actionTypes,
    payload: response.data.data,
  });
};

export const getbyidToken = async (service, actionTypes, dispatch, id) => {
  const auth = await Jwtservice.create(token1());
  // cookies.set('login', {
  //   auth: 'success',
  //   token: auth.data.accessToken,
  //   token1: auth.data.refreshToken,
  // });
  sessionStorage.setItem('login', {
    auth: 'success',
    token: auth.data.accessToken,
    token1: auth.data.refreshToken,
  })
  const response = await service.get(id, auth.data.accessToken);
  dispatch({
    type: actionTypes,
    payload: response.data.data,
  });
};
