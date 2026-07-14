import { INITIATE_PAYMENT } from "redux/actionTypes";

const initialState = {
    initiatePaymentUrl: []
}

function EaseBuzzPaymentReducer(state = initialState, action) {

    const { type, payload } = action;
    switch (type) {

        case INITIATE_PAYMENT:
            return { ...state, initiatePaymentUrl: payload };

        default:
            return state;
    }

}

export default EaseBuzzPaymentReducer;