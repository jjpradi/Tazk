import {
  DM_CATEGORIES,
  DM_EMPLOYEE_DOCUMENTS,
  DM_DOCUMENT_DETAIL,
  DM_VERIFICATION_TYPES,
  DM_DASHBOARD,
  DM_EXPIRING_DOCUMENTS,
  DM_PENDING_VERIFICATIONS,
} from '../actionTypes';

const initialState = {
  categories: [],
  employeeDocuments: [],
  documentDetail: null,
  verificationTypes: [],
  dashboard: [],
  expiringDocuments: [],
  pendingVerifications: [],
};

const DocumentManagementReducer = (state = initialState, action) => {
  switch (action.type) {
    case DM_CATEGORIES:
      return { ...state, categories: action.payload };
    case DM_EMPLOYEE_DOCUMENTS:
      return { ...state, employeeDocuments: action.payload };
    case DM_DOCUMENT_DETAIL:
      return { ...state, documentDetail: action.payload };
    case DM_VERIFICATION_TYPES:
      return { ...state, verificationTypes: action.payload };
    case DM_DASHBOARD:
      return { ...state, dashboard: action.payload };
    case DM_EXPIRING_DOCUMENTS:
      return { ...state, expiringDocuments: action.payload };
    case DM_PENDING_VERIFICATIONS:
      return { ...state, pendingVerifications: action.payload };
    default:
      return state;
  }
};

export default DocumentManagementReducer;
