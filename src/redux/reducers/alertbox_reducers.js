import {OPEN_ALERT, CLOSE_ALERT} from '../actionTypes';

const initialState = {
  open: false,
  msg: '',
  severity: 'success',
};

function alertboxReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case OPEN_ALERT: {
      return {
        ...state,
        open: true,
        msg: payload.msg,
        severity: payload.severity,
      };
    }

    case CLOSE_ALERT:
      return {...state, open: false};

    default:
      return state;
  }
}

export default alertboxReducer;
