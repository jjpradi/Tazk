import {
  HP_POLICIES, HP_ACTIVE_POLICIES, HP_POLICY_DETAIL,
  HP_ACKNOWLEDGMENTS, HP_MY_ACKNOWLEDGED, HP_PENDING_ACKS,
  HP_COMPLIANCE, HP_UNACKNOWLEDGED,
} from '../actionTypes';

const initialState = {
  policies: [],
  activePolicies: [],
  policyDetail: null,
  acknowledgments: [],
  myAcknowledged: [],
  pendingAcks: [],
  compliance: [],
  unacknowledged: [],
};

const HrPoliciesReducer = (state = initialState, action) => {
  switch (action.type) {
    case HP_POLICIES: return { ...state, policies: action.payload };
    case HP_ACTIVE_POLICIES: return { ...state, activePolicies: action.payload };
    case HP_POLICY_DETAIL: return { ...state, policyDetail: action.payload };
    case HP_ACKNOWLEDGMENTS: return { ...state, acknowledgments: action.payload };
    case HP_MY_ACKNOWLEDGED: return { ...state, myAcknowledged: action.payload };
    case HP_PENDING_ACKS: return { ...state, pendingAcks: action.payload };
    case HP_COMPLIANCE: return { ...state, compliance: action.payload };
    case HP_UNACKNOWLEDGED: return { ...state, unacknowledged: action.payload };
    default: return state;
  }
};

export default HrPoliciesReducer;
