import {
    GST_ITC_BLOCK_REASON_LIST,
    GST_ITC_BLOCK_REASON_DELETE,
} from '../actionTypes';

const initialState = {
    list: [],
};

const gstItcBlockReasonReducer = (state = initialState, { type, payload }) => {
    switch (type) {
        case GST_ITC_BLOCK_REASON_LIST:
            return { ...state, list: Array.isArray(payload) ? payload : [] };
        case GST_ITC_BLOCK_REASON_DELETE:
            return { ...state, list: state.list.filter((r) => r.id !== payload.id) };
        // ADD / UPDATE: the list is refetched by the action after a write, so we
        // don't need to splice the state manually here.
        default:
            return state;
    }
};

export default gstItcBlockReasonReducer;
