import { 
    CREATE_MEETINGS,
    GET_LEAD_USERNAME,
    SET_LIST_MEETINGS 
} from "redux/actionTypes"

const initialState = {
    meetingsList : [],
    meetingsListCount : [],
    createMeetings : [],
    getLeadUserNameList : [],
}

function MeetingsReducers (state = initialState, action) {
    const { type, payload } = action

    switch (type) {
        case SET_LIST_MEETINGS : 
            return {...state, meetingsList : payload.data, meetingsListCount : payload.numRows}

        case CREATE_MEETINGS : 
            return {...state, createMeetings : payload}
        
        case GET_LEAD_USERNAME : 
            return {...state, getLeadUserNameList : payload}

        default : 
            return state
    }
}

export default MeetingsReducers