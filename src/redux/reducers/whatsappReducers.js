import {GET_TEMP_LIST, GET_CUSTOMER_LIST, SEND_MSG} from 'redux/actionTypes';

const initialState = {
  tempList: [],
  customer: [],
  sendMsg: {},
};

function WhatsappReducers(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case GET_TEMP_LIST:
      return {...state, tempList: payload};

    case GET_CUSTOMER_LIST:
      return {...state, customer: payload};

    case SEND_MSG:
      return {...state, sendMsg: payload};

    default:
      return state;
  }
}
export default WhatsappReducers;
