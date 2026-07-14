import { NAVIGATION_BOOTSTRAP } from '../actionTypes';
import NavigationService from '../../services/navigation_services';
import { ErrorAlert } from './load';

export const getNavigationBootstrapAction = (data) => async (dispatch) => {
  try {
    const res = await NavigationService.getBootstrap(data);
    dispatch({
      type: NAVIGATION_BOOTSTRAP,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject(err);
  }
};
