import { CREATE_FORM_12BB, LIST_FORM_12BB} from "redux/actionTypes"

const initialState = {
    form12bb : [],
}

function IncometaxReducers(state = initialState, action) {
    const {type, payload} = action;
    switch (type) {
     
        case CREATE_FORM_12BB :
            return {...state, form12bb: payload}
        case LIST_FORM_12BB:
                return {...state, form12bb: payload}
        default : 
            return state;
    }
}

export default IncometaxReducers;