import {
    GET_CLIENTS_DETAILS_COUNT,
} from "redux/actionTypes";


const initialState = {
    getDetailsCount: []
}

function StactReducer(state = initialState, action) {
    const { type, payload } = action;

    switch (type) {

        case GET_CLIENTS_DETAILS_COUNT:
            return { ...state, getDetailsCount: payload };

    default:
        return state;
    }

}
export default StactReducer;