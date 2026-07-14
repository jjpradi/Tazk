import {
    LIST_DOC_TEMPLATES,
    GET_DOC_TEMPLATE,
    LIST_DOC_ASSIGNMENTS,
    LIST_DOC_PLACEHOLDERS
} from '../actionTypes';

const initialState = {
    templateList: [],
    numRows: 0,
    currentTemplate: null,
    assignments: [],
    placeholders: []
};

function docTemplateReducer(state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
        case LIST_DOC_TEMPLATES:
            return { ...state, templateList: payload.data || [], numRows: payload.numRows || 0 };
        case GET_DOC_TEMPLATE:
            return { ...state, currentTemplate: payload };
        case LIST_DOC_ASSIGNMENTS:
            return { ...state, assignments: payload };
        case LIST_DOC_PLACEHOLDERS:
            return { ...state, placeholders: payload };
        default:
            return state;
    }
}

export default docTemplateReducer;
