import {
  LIST_MANUAL_NOTES,
  CREATE_MANUAL_NOTES,
  DELETE_MANUAL_NOTE,
  DELETE_ALL_MANUAL_NOTES,
  UPDATE_MANUAL_NOTE,
  SEQUENCE_CREDIT_DEBIT,
  RECENT_CREDIT_DEBIT_NOTES,
  SCHEMES_LEDGER,
  MANUAL_SALES_PURCHASE,
  MANUAL_NOTES,
  GET_ALL_CREDIT_NOTES,
  GET_CREDIT_NOTES_RECEIPTS_BY_ID,
  SCHEMES_LEDGER_PARENT,
  MANUAL_SALES_RETURN,
  MANUAL_TIMELINE,
  GET_ALL_DEBIT_NOTES
} from '../actionTypes';

const initialState = {
  manualNotes: [],
  individualNotes: [],
  sequence: [],
  manualNoteCount: 0,
  recentCreditDebitNotes: [],
  schemesLedger : [],
  manualsalespurchase : [],
  manualNotesSchemes: [],
  getAllCreditNotes : [],
  schemesLedgerParent:[],
  manualSalesReturn : [],
  manualTimeline: [],
  getAllDebitNotes : []
};

function manualNoteReducer(state = initialState, action) {
  const {type, payload} = action;
  switch (type) {
    case LIST_MANUAL_NOTES:
      return {
        ...state,
        manualNotes: payload.data,
        manualNoteCount : payload.numRows
        // individualNotes: payload.individualNotes,
      };
      case SEQUENCE_CREDIT_DEBIT:
      return {
        ...state,
        sequence: payload,
      };

    case CREATE_MANUAL_NOTES:
      return {
        ...state,
        manualNotes: payload,
      };

    case DELETE_MANUAL_NOTE:
      return {
        ...state,
        deleteManualNotes: payload,
      };

    case DELETE_ALL_MANUAL_NOTES:
      return {
        ...state,
        manualNotes: payload,
      };

    case UPDATE_MANUAL_NOTE:
      return {
        ...state,
        manualNotes: payload,
      };
    
    case RECENT_CREDIT_DEBIT_NOTES:
      return {
        ...state,
        recentCreditDebitNotes: payload,
      };
    
    case SCHEMES_LEDGER:
      return {
        ...state,
        schemesLedger: payload,
      };
     
    case SCHEMES_LEDGER_PARENT:
      return {
        ...state,
        schemesLedgerParent: payload,
      };

    case MANUAL_SALES_PURCHASE:
      return {
        ...state,
        manualsalespurchase: payload
      }

  case MANUAL_NOTES:
      return {
        ...state,
        manualNotesSchemes: payload
      }
  
  case GET_ALL_CREDIT_NOTES :
      return {
        ...state,
        getAllCreditNotes : payload
      }
      
  case GET_CREDIT_NOTES_RECEIPTS_BY_ID :
      return {
        ...state,
        getCreditNotesReceiptsById : payload
      }

  case MANUAL_SALES_RETURN :
      return {
        ...state,
        manualSalesReturn : payload
      }

  case MANUAL_TIMELINE :
      return {
        ...state,
        manualTimeline : payload
      }
    
  case   GET_ALL_DEBIT_NOTES:
      return {
        ...state,
        getAllDebitNotes : payload
      }

    default:
      return state;
  }
}

export default manualNoteReducer;
