import { BIOMETRIC_REG, GET_BIOMETRIC_REG, GET_FACE_REGISTRATION_BY_ID, GET_FACE_URL, GET_WORK_LOG_REPORT, SET_SEARCH_FACE_REGISTRATION } from "redux/actionTypes";



const initialState = {
    getList: [],
    getEmployeeListById:[],
    getFaceUrl:[],
    biometric : [],
    getBiometricDetails: []
};

function FaceRegistrationConfig(state = initialState, action) {
    const { type, payload } = action;
    // console.log("payload333", payload)
    switch (type) {


        case SET_SEARCH_FACE_REGISTRATION:
            return {
                ...state,
                getList: payload.data,

            };


        case GET_FACE_REGISTRATION_BY_ID:
            return {
                ...state,
                getEmployeeListById: payload.data,

            };
            case GET_FACE_URL:
                return {
                    ...state,
                    getFaceUrl: payload.data,
    
                };
            case BIOMETRIC_REG:
                return {
                    ...state,
                    biometric: payload,
    
                };
            case GET_BIOMETRIC_REG:
                return {
                    ...state,
                    getBiometricDetails: payload,
    
                };
        default:
            return state;
    }
}

export default FaceRegistrationConfig;