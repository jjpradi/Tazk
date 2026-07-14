import {
  CREATE_REPORTS,
  GET_ALL_REPORTS,
  GET_BY_ID_REPORTS,
  EDIT_REPORTS,
  DELETE_REPORTS,
  REPORT_VIEW_DATA,
  BRAND_REPORT, 
  CHEQUE_REPORT,
  DAILY_REPORT_STATUS,
  GET_DAILY_REPORT_STATUS,
  CASH_BOX_STATUS,
  SET_SEARCH_CHEQUE_REPORT,
  SET_SEARCH_REQUEST_REPORT,
  SET_SEARCH_BRAND_REPORT,
  CASHBOX_ADJUSTMENT_REPORT,
  RELIEVED_EMPLOYEE,
  SET_SEARCH_RELIEVED_EMPLOYEE_DETAILS,
  MISSING_LOT,
  EXCESS_LOT,
  GET_DEVICE_REGISTER,
  GET_FRAUD_LOGS,
  GET_LOGIN_AUDIT_LOGS,
  SET_SEARCH_SCRAP_LOT_REPORT
  
} from '../actionTypes';

const initialState = {
  reports: [],
  reports_id_data: [],
  reports_view_data: [],
  brand_report:[],
  cheque_report:[],
  daily_report_status:[],
  get_daily_report_status:[],
  cash_box_status:[],
  get_status: [],
  searchChequeReportData: [],
  search_data:[],
  searchBrandReportData:[],
  cashbox_adjustment:[],
  relievedEmpDetails: [],
  missingLots: [],
  excessLots: [],
  deviceRegister: [],
  getFraudLogs: [],
  getLoginAuditLogs: { data: [], numRows: 0 },
  scrapLot: { data: [], numRows: 0 }
};

function reportsReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case CREATE_REPORTS:
      return {...state, reports: payload};

    case GET_ALL_REPORTS:
      return {...state, reports: payload};

    case GET_BY_ID_REPORTS:
      return {...state, reports_id_data: payload};
    //return payload

    case EDIT_REPORTS:
      return {...state, reports: payload};

    case DELETE_REPORTS:
      //return {...state.reports.filter(({ id }) => id !== payload.id)};
      return {...state, reports: payload};

    case REPORT_VIEW_DATA:
      return {...state, reports_view_data: payload};

    case BRAND_REPORT:
        return {...state, brand_report: payload};
    case CHEQUE_REPORT:
          return {...state, cheque_report: payload};
    case DAILY_REPORT_STATUS:
          return {...state, daily_report_status: payload};
    case GET_DAILY_REPORT_STATUS:
          return {...state, get_status: payload};
    case CASH_BOX_STATUS:
      return { ...state, cash_box_status: payload };
    
    case SET_SEARCH_CHEQUE_REPORT:
      return { ...state, searchChequeReportData: payload };

      case SET_SEARCH_BRAND_REPORT:
      return {
        ...state,
        searchBrandReportData:payload, 
      }
      case CASHBOX_ADJUSTMENT_REPORT :
        return {...state, cashbox_adjustment: payload}

    case RELIEVED_EMPLOYEE:
      return { ...state, relievedEmpDetails: payload };

    case MISSING_LOT:
      return { ...state, missingLots: payload };

    case EXCESS_LOT:
      return { ...state, excessLots: payload };
    
    case SET_SEARCH_RELIEVED_EMPLOYEE_DETAILS:
      return { ...state, relievedEmpDetails: payload }
    
    case GET_DEVICE_REGISTER:
      return { ...state, deviceRegister: payload }
    
    case GET_FRAUD_LOGS:
      return { ...state, getFraudLogs: payload }

    case GET_LOGIN_AUDIT_LOGS:
      return { ...state, getLoginAuditLogs: payload }

    case SET_SEARCH_SCRAP_LOT_REPORT:
      return { ...state, scrapLot: payload }
    
    default:
      return state;
  }
}

export default reportsReducer;
