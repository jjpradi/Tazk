import {DRAWER_MENU} from '../actionTypes';

const initialState = {
  drawer_menu_status: false,
};

function DrawerMenuReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case DRAWER_MENU:
      return {...state, drawer_menu_status: payload};

    default:
      return state;
  }
}

export default DrawerMenuReducer;
