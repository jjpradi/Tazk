import {
  CREATE_TAX,
  LIST_TAX,
  GET_ID_TAX,
  EDIT_TAX,
  DELETE_TAX,
  SET_PROFIT_WISE_REPORT,
  SALES_SUMMARY_REPORT,
  SET_GST1_REPORT,
  SET_FORM27EQ_REPORT,
  GET_GSTR_EXPORT,
  SET_GST2_REPORT,
  SET_GST3B_REPORT,
  SET_GST4_REPORT,
  SET_GST9_REPORT,
  SET_GST9A_REPORT,
  SET_GST_REPORT,
  SET_GST_RATE_REPORT,
  SET_TCS_RECEIVABLE,
} from '../actionTypes';

const initialState = {
  tax: [],
  tax_id_data: [],
  profitWiseReportCount: 0,
  SalesSummaryReport:[],
  gst1Report: { data: [], numRows: 0 },
  form27EQReport: { data: [], numRows: 0 },
  gstr_export:[] ,
  gst2Report: { data: [], numRows: 0 },
  gst3bReport: {},
  gst4Report: {},
  gst9Report: {},
  gst9aReport: {},
  gstReport: { data: [], numRows: 0 },
  gstRateReport: { data: [], numRows: 0 },
  tcsReceivable: { data: [], numRows: 0 },
};

function taxReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case CREATE_TAX:
      return {...state, tax: payload};

    case LIST_TAX:
      return {...state, tax: payload};

    case GET_ID_TAX:
      return {...state, tax_id_data: payload};
    //return payload

    case EDIT_TAX:
      return {...state, tax: payload};

    case DELETE_TAX:
      //return {...state.tax.filter(({ id }) => id !== payload.id)};
      return {...state, tax: payload};

    case SALES_SUMMARY_REPORT :
      return{ ...state, SalesSummaryReport : payload}

    case SET_GST1_REPORT:
      return { ...state, gst1Report: payload }

    case SET_FORM27EQ_REPORT:
      return { ...state, form27EQReport: payload }

    case GET_GSTR_EXPORT:
      return { ...state, gstr_export: payload }

    case SET_GST2_REPORT:
      return { ...state, gst2Report: payload }

    case SET_GST3B_REPORT:
      return { ...state, gst3bReport: payload }

    case SET_GST4_REPORT:
      return { ...state, gst4Report: payload }

    case SET_GST9_REPORT:
      return { ...state, gst9Report: payload }

    case SET_GST9A_REPORT:
      return { ...state, gst9aReport: payload }

    case SET_GST_REPORT:
      return { ...state, gstReport: payload }

    case SET_GST_RATE_REPORT:
      return { ...state, gstRateReport: payload }

    case SET_TCS_RECEIVABLE:
      return { ...state, tcsReceivable: payload }

    default:
      return state;
  }
}

export default taxReducer;
