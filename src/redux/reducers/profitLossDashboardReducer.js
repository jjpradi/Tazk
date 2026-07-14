import {
    GET_CURRENT_DAY,
    GET_CURRENT_WEEK,
    GET_CURRENT_MONTH,
    GET_CURRENT_YEAR,
    GET_DAY,
    GET_WEEK,
    GET_MONTH,
    GET_YEAR,
    GET_BY_DATE,
    BREAKDOWN_GET_MONTH,
    BREAKDOWN_GET_WEEK,
    BREAKDOWN_GET_DAY,
    BREAKDOWN_GET_YEAR
} from '../actionTypes';

const initialState = {
    currentDay: [],
    currentWeek: [],
    currentMonth: [],
    currentYear: [],
    day: [],
    week: [],
    month: [],
    year: [],
    breakdownday: [],
    breakdownweek: [],
    breakdownmonth: [],
    breakdownyear: [],
    getByDate: []
};

function ProfitLossDashboardReducer(state = initialState, action) {
    const { type, payload } = action;

    switch (type) {
        case GET_CURRENT_DAY:
            return { ...state, currentDay: payload };

        case GET_CURRENT_WEEK:
            return { ...state, currentWeek: payload };

        case GET_CURRENT_MONTH:
            return { ...state, currentMonth: payload };

        case GET_CURRENT_YEAR:
            return { ...state, currentYear: payload };

        case GET_DAY:
            return { ...state, day: payload };

        case GET_WEEK:
            return { ...state, week: payload };

        case GET_MONTH:
            return { ...state, month: payload };

        case GET_YEAR:
            return { ...state, year: payload };

        case BREAKDOWN_GET_DAY:
                return { ...state, breakdownday: payload };
    
        case BREAKDOWN_GET_WEEK:
                return { ...state, breakdownweek: payload };
    
        case BREAKDOWN_GET_MONTH:
                return { ...state, breakdownmonth: payload };
    
        case BREAKDOWN_GET_YEAR:
                return { ...state, breakdownyear: payload };

        case GET_BY_DATE:
            return { ...state, getByDate: payload };

        default:
            return state;
    }
}

export default ProfitLossDashboardReducer;
