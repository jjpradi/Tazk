import {LIST_POSSESSION,POS_USER_DASHBOARD_CASHINHAND} from '../actionTypes';

const initialState = {
  pos_session: [],
  pos_userDashBoard_cashInHand : 0
};

function PosSessionReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case LIST_POSSESSION:
      return {...state, pos_session: payload};
    case POS_USER_DASHBOARD_CASHINHAND:
      return {...state, pos_userDashBoard_cashInHand: payload};

    default:
      return state;
  }
}

export default PosSessionReducer;
