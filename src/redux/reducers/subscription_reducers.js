import { CANCEL_FOR_TRIAL, COMPANY_SUBSCRIPTIONS, MANUAL_PAYMENT_FOR_SUBSCRIPTION, ORDER_PLACED, PAYMENT_HISTORY, PLAN_DETAILS, PLAN_RENEWAL_DETAILS, RESTRICT_CREATION, SETTING_MODULES } from "redux/actionTypes";

const initialState = {
    getCompSubscriptionDetails: [],
    getPlanDetails: [],
    getPlanRenewalDetails:[],
    orderPlaced :[],
    restrictUserLocationCreation:[],
    paymentHistoryDetails: [],
    cancelSubscriptionForTrial: [],
    manualPaymentForSubscription: [],
    settingModulesBasesOnCompanyRole : [],
}

function SubscriptionReducer(state = initialState, action) {

    const { type, payload } = action;
    switch (type) {

        case COMPANY_SUBSCRIPTIONS:
            return { ...state, getCompSubscriptionDetails: payload };

            case PLAN_DETAILS:
            return { ...state, getPlanDetails: payload };

            case PLAN_RENEWAL_DETAILS:
            return { ...state, getPlanRenewalDetails: payload };

            case ORDER_PLACED:
            return { ...state, orderPlaced: payload };
            
            case RESTRICT_CREATION:
            return { ...state, restrictUserLocationCreation: payload };

            case PAYMENT_HISTORY:
            return { ...state, paymentHistoryDetails: payload };

            case CANCEL_FOR_TRIAL:
                return { ...state, cancelSubscriptionForTrial: payload };

            case MANUAL_PAYMENT_FOR_SUBSCRIPTION:
            return { ...state, manualPaymentForSubscription: payload };
        
            case SETTING_MODULES:
            return { ...state, settingModulesBasesOnCompanyRole: payload };

        default:
            return state;
    }

}

export default SubscriptionReducer;