import { CREATE_AUDIT, CREATE_AUDIT_CHECKLIST, CREATE_CHECKLIST, DELETE_AUDIT, DELETE_CHECKLIST, FILTER_AUDIT_CHECKLIST_REQUEST, GET_ALL_CHECKLIST_TEMPLATE, GET_CHECKLIST, GET_CHECKLIST_BASED_ON_ASSETS, GET_CHECKLIST_BY_ID, SEND_REPORT_NOTIFICATION, SET_AUDIT, SET_AUDIT_BASED_ON_CHECKLIST, SET_AUDIT_CHECKLIST, SET_SEARCH_AUDIT_CHECKLIST, UNSEEN_DATA, UPDATE_AUDITS, UPDATE_CHECKLIST, GET_AUDITS_BY_ID } from "redux/actionTypes"

const initialState = {
    auditCheckList: [], 
    auditListCount: [],
    createAuditCheckList: [],
    checkListBasedOnAssets: [],
    createAudit: [],
    filterAuditCheckList: [],
    auditDetailsBasedOnCheckList: [],
    checkListBasedOnAuditDetails: [],
    reportNotify: [],
    auditUnseenCount: 0,
    createChecklist: [],
    getChecklist: [],
    getAllChecklistTemlate: [],
    deleteAudit : [],
    updateAudits: [],
    getAuditsById: [],
    updateChecklist: [],
    deleteChecklist: [],
    getChecklistById: {},
  };
  
  function AuditsReducers(state = initialState, action) {
    const { type, payload } = action;
  
    switch (type) {
      case SET_AUDIT_CHECKLIST:
        return { ...state, auditCheckList: payload};
  
      case CREATE_AUDIT_CHECKLIST:
        return { ...state, createAuditCheckList: payload };

      case SET_SEARCH_AUDIT_CHECKLIST:
        return { ...state, auditCheckList: payload};

      case GET_CHECKLIST_BASED_ON_ASSETS:
        return {...state, checkListBasedOnAssets: payload}
  
      case CREATE_AUDIT:
        return {...state, createAudit: payload}
  
      case FILTER_AUDIT_CHECKLIST_REQUEST:
        return {...state, filterAuditCheckList: payload.data, auditUnseenCount: payload.unseenCount}
  
      case SET_AUDIT:
        return {...state, auditDetailsBasedOnCheckList: payload}

      case SET_AUDIT_BASED_ON_CHECKLIST:
        return {...state, checkListBasedOnAuditDetails: payload}

      case SEND_REPORT_NOTIFICATION:
        return {...state, reportNotify: payload}

      case UNSEEN_DATA :
        return {...state, auditUnseenCount : payload.unseenCount}

      case CREATE_CHECKLIST :
        return {...state, createChecklist : payload}

      case GET_CHECKLIST :
        return {...state, getChecklist : payload}

      case GET_ALL_CHECKLIST_TEMPLATE :
        return {...state, getAllChecklistTemlate : payload}

        case DELETE_AUDIT :
          return { ...state , deleteAudit : payload}
  
      
      case UPDATE_AUDITS: 
         return {...state, updateAudits: payload}
      
      case GET_AUDITS_BY_ID:
         return {...state, getAuditsById: payload}

      case UPDATE_CHECKLIST:
         return {...state, updateChecklist: payload}

      case DELETE_CHECKLIST:
         return {...state, deleteChecklist: payload}

      case GET_CHECKLIST_BY_ID:
         return {...state, getChecklistById: payload}

      default:
        return state;
    }
  }
  
  export default AuditsReducers;
  