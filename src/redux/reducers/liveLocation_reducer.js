import {EMP_TRAVEL_TIMELINE, GET_EMP_BASED_TRAVEL_HISTORY, LIVE_LOCATION, PROJECT_LIVE_LOCATION, GET_PROJECT_EMP_BASED_TRAVEL_HISTORY, EMP_PROJECT_TRAVEL_TIMELINE, GET_TASK_LOGS } from '../actionTypes';

const initialState = {
  liveLocationDetails: [],
  empBasedTravelHistory: [],
  empTravelTimeline: {},
  ProjectLiveLocationDetails: [],
  getProjectEmpBasedTravelHistory: [],
  getProjectTravelTimeLine: {},
  getTaskLogs: {}
};

function LiveLocationReducer(state = initialState, action) {
  const {type, payload} = action;
  switch (type) {
    case LIVE_LOCATION:
      return {...state, liveLocationDetails: payload};

    case GET_EMP_BASED_TRAVEL_HISTORY:
      return {...state, empBasedTravelHistory: payload}

    case EMP_TRAVEL_TIMELINE:
      return { ...state, empTravelTimeline: payload }
    
    
      case PROJECT_LIVE_LOCATION:
        return {...state, ProjectLiveLocationDetails: payload};
  
      case GET_PROJECT_EMP_BASED_TRAVEL_HISTORY:
        return {...state, getProjectEmpBasedTravelHistory: payload}
  
      case EMP_PROJECT_TRAVEL_TIMELINE:
      return { ...state, getProjectTravelTimeLine: payload }
    
      case GET_TASK_LOGS:
        return { ...state, getTaskLogs: payload }
     
    default:
      return state;
  }
}


export default LiveLocationReducer;
