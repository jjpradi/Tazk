import {
  RETURN_CN_REPORT_DATA,
  MANUAL_CN_REPORT_DATA,
  RETURN_DN_REPORT_DATA,
  MANUAL_DN_REPORT_DATA,
  CNDN_REPORT_CLEAR,
} from '../actionTypes';

const initialState = {
  returnCnData: [],
  returnCnCount: 0,
  returnCnGrandTotal: 0,
  returnCnMonthlySummary: [],
  manualCnData: [],
  manualCnCount: 0,
  manualCnGrandTotal: 0,
  manualCnMonthlySummary: [],
  returnDnData: [],
  returnDnCount: 0,
  returnDnGrandTotal: 0,
  returnDnMonthlySummary: [],
  manualDnData: [],
  manualDnCount: 0,
  manualDnGrandTotal: 0,
  manualDnMonthlySummary: [],
};

function cndnReportReducer(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case RETURN_CN_REPORT_DATA:
      return {
        ...state,
        returnCnData: payload.data || [],
        returnCnCount: payload.numRows || 0,
        returnCnGrandTotal: payload.grandTotal || 0,
        returnCnMonthlySummary: payload.monthlySummary || [],
      };
    case MANUAL_CN_REPORT_DATA:
      return {
        ...state,
        manualCnData: payload.data || [],
        manualCnCount: payload.numRows || 0,
        manualCnGrandTotal: payload.grandTotal || 0,
        manualCnMonthlySummary: payload.monthlySummary || [],
      };
    case RETURN_DN_REPORT_DATA:
      return {
        ...state,
        returnDnData: payload.data || [],
        returnDnCount: payload.numRows || 0,
        returnDnGrandTotal: payload.grandTotal || 0,
        returnDnMonthlySummary: payload.monthlySummary || [],
      };
    case MANUAL_DN_REPORT_DATA:
      return {
        ...state,
        manualDnData: payload.data || [],
        manualDnCount: payload.numRows || 0,
        manualDnGrandTotal: payload.grandTotal || 0,
        manualDnMonthlySummary: payload.monthlySummary || [],
      };
    case CNDN_REPORT_CLEAR:
      return initialState;
    default:
      return state;
  }
}

export default cndnReportReducer;
