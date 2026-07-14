import {
  LIST_HOLIDAYS,
  CREATE_HOLIDAYS,
  GET_BY_ID_HOLIDAYS,
  UPDATE_HOLIDAYS,
  DELETE_HOLIDAYS,
  SET_SEARCH_HOLIDAY,
  CATEGORY_BASED_HOLIDAYS,
  HOLIDAY_CREATED_YEARS
} from '../actionTypes';

const initialState = {
  holidaylist: [],
  holidaygetbyid: [],
  searchHolidayData: [],
  getByCompanyCategoryHolidays: [],
  getHolidayCreatedYears:[]
};

function HolidaysReducers(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case LIST_HOLIDAYS:
      return { ...state, holidaylist: payload };
    case CREATE_HOLIDAYS:
      return { ...state, holidaylist: payload };
    case GET_BY_ID_HOLIDAYS:
      return { ...state, holidaygetbyid: payload };
    case UPDATE_HOLIDAYS:
      return { ...state, holidaylist: payload };
    case DELETE_HOLIDAYS:
      return { ...state, holidaylist: payload };

    case SET_SEARCH_HOLIDAY:
      return { ...state, searchHolidayData: payload };
      case CATEGORY_BASED_HOLIDAYS:
        return { ...state, getByCompanyCategoryHolidays: payload };
      case HOLIDAY_CREATED_YEARS:
        return { ...state, getHolidayCreatedYears: payload };

    default:
      return state;
  }
}

export default HolidaysReducers;
