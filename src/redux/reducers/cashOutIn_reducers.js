import {
  LIST_CASH_OUT_IN,
  CREATE_CASH_OUT_IN,
  GET_ID_CASH_OUT_IN,
  EDIT_CASH_OUT_IN,
  LIST_PAYINOUT_TOTAL,
  DELETE_CASH_OUT_IN,
  CREATE_CONTRA,
  GET_ALL_CASH_OUT_IN_REPORT,
  GET_ALL_PAYMENT_TYPE_REPORT,
  GET_ALL_CASH_OUT_IN_REPORT_CONTRA,
  GET_PAYIN_AMOUNT,
  GET_CASH_OUT_IN_DENOMINATION_VALIDATION,
  GET_PAY_IN_OUT_CONTRA_SEQUENCE,
} from '../actionTypes';

const initialState = {
  cashOutIn: [],
  cashPayinOut: [],
  cashOutIn_id_data: [],
  createContra: [],
  cashOutIn_daily_report: {IN: [], OUT: []},
  cashOutIn_payment_type: {IN: [], OUT: []},
  cashoutincontra_all: [],
  payInAmount: [],
  cashOutIn_denomination: [],
  cashOutInData: [],
  payInOutContraSequence: ''
};

function CashOutInReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case LIST_CASH_OUT_IN:
      return {...state, cashOutIn: payload};

    case CREATE_CASH_OUT_IN:
      return {...state, cashOutInData: payload};

    case CREATE_CONTRA:
      return {...state, createContra: payload};

    case GET_ID_CASH_OUT_IN:
      return {...state, cashOutIn_id_data: payload};

    case EDIT_CASH_OUT_IN:
      return {...state, cashOutIn: payload};

    case LIST_PAYINOUT_TOTAL:
      return {...state, cashPayinOut: payload};

    case DELETE_CASH_OUT_IN:
      return {...state, cashOutIn: payload};

    case GET_ALL_CASH_OUT_IN_REPORT:
      return {...state, cashOutIn_daily_report: payload};

    case GET_ALL_PAYMENT_TYPE_REPORT:
      return {...state, cashOutIn_payment_type: payload};

    case GET_ALL_CASH_OUT_IN_REPORT_CONTRA:
      return {...state, cashoutincontra_all: payload};

    case GET_PAYIN_AMOUNT:
      return {...state, payInAmount: payload};

    case GET_CASH_OUT_IN_DENOMINATION_VALIDATION:
      return {...state, cashOutIn_denomination: payload};

    case GET_PAY_IN_OUT_CONTRA_SEQUENCE:
      return { ...state, payInOutContraSequence: payload }

    default:
      return state;
  }
}

export default CashOutInReducer;
