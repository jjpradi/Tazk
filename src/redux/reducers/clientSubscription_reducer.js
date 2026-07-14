import {
    CREATE_PLANS,
    UPDATE_PLANS,
    GET_ALL_PLANS,
    GET_ALL_STATUS,
    GET_PLAN_TYPE,
    SCHEDULE_PLAN,
    GET_ALL_SCHEDULED_PLAN,
    UPDATE_SCHEDULED_PLAN,
    GET_ALL_TRAINING_TYPE,
    GET_ALL_PLAN_BENEFITS,
    UPDATE_BENEFITS,
    GET_CLIENTS,
    UPDATE_MAPPED_CLIENTS
} from "redux/actionTypes";


const initialState = {
    createPlan: [],
    updatePlan: [],
    getAllPlans: [],
    getPlanType:[],
    getStatus:[],
    schedulePlan:[],
    getAllSchedulePlan:[],
    updateScheduledPlan:[],
    getTrainingType:[],
    getPlanBenefits:{ Benefits: 0 },
    getClients:[],
    updateMappedClients:[]
}

function ClientSubscriptionReducer(state = initialState, action) {
    const { type, payload } = action;

    switch (type) {
        case CREATE_PLANS:
            return { ...state, createPlan: payload };

        case UPDATE_PLANS:
            return { ...state, updatePlan: payload };

        case GET_ALL_PLANS:
            return { ...state, getAllPlans: payload };

        case GET_ALL_STATUS:
            return { ...state, getStatus: payload };

        case GET_PLAN_TYPE:
            return { ...state, getPlanType: payload };

        case SCHEDULE_PLAN:
            return { ...state, SchedulePlan: payload };

        case UPDATE_SCHEDULED_PLAN:
            return { ...state, updateScheduledPlan: payload };

        case GET_ALL_SCHEDULED_PLAN:
            return { ...state, getAllSchedulePlan: payload };

        case GET_ALL_TRAINING_TYPE:
            return { ...state, getTrainingType: payload };

        case GET_ALL_PLAN_BENEFITS:
                return { ...state, getPlanBenefits: Array.isArray(payload) ? payload : [] };
            
        case UPDATE_BENEFITS:
            return {...state, getPlanBenefits: { ...state.getPlanBenefits, Benefits: payload }};

        case GET_CLIENTS:
            return { ...state, getClients: payload };

        case UPDATE_MAPPED_CLIENTS:
            return { ...state, updateMappedClients: payload };

    default:
        return state;
    }

}
export default ClientSubscriptionReducer;