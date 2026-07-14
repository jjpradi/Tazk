import { LIST_TIMELINE } from 'redux/actionTypes'

const initialState = {
    timelineList: []
}

function TimelineReducers(state = initialState, action) {
    const { type, payload } = action
    switch (type) {
        case LIST_TIMELINE:
            return { ...state, timelineList: payload }

        default:
            return state
    }
}

export default TimelineReducers
