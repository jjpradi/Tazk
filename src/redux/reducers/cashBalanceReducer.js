import { GET_BALANCE } from "redux/actionTypes";
const initialState = {
    Cashbalance: [],
};

function cashbalance(state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
        case GET_BALANCE:
            return { ...state, Cashbalance: payload };
        default:
            return state;
    }
}
export default cashbalance;
