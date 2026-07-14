import {GET_VISITS_REPORT} from 'redux/actionTypes';

const initialState = {
    visitsReports: [],
};

function VisitsReport(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case GET_VISITS_REPORT:
      return {...state, visitsReports: payload};
   

    default:
      return state;
  }
}
export default VisitsReport;
