import {DRAWER_MENU} from '../actionTypes';

export function drawer_menu(data) {
  return {
    type: DRAWER_MENU,
    payload: data,
  };
}
