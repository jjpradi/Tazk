import { GET_COMPANY_SUBSCRIPTION, SET_COMPANY_DETAIL, UPDATE_SUBSCRIPTION_DATE } from "../actionTypes";


const initialState = {
    CompanySubscriptionList: [],
    UpdateSucscriptionDate: [],
    CompanySubscriptionCount : 0
}

function SuperAdminReducer(state = initialState, action) {

    const { type, payload } = action;
    switch (type) {
        case SET_COMPANY_DETAIL:
            return { ...state, CompanySubscriptionList: payload.data, CompanySubscriptionCount: payload.numRows };

        case UPDATE_SUBSCRIPTION_DATE:
            return { ...state, UpdateSucscriptionDate: payload };

        default:
            return state;
    }

}

export default SuperAdminReducer;