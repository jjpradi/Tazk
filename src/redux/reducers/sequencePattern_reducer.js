import {
    GET_SEQUENCE_DATA,
    DELETE_SEQUENCE_DATA,
    UPDATE_SEQUENCE_DATA,
    CREATE_SEQUENCE_DATA,
    GET_SEQUENCE_BASED_ON_NAME,
  } from '../actionTypes';
  
  const initialState = {
   sequence_data:[],
   delete_sequence_data:[],
   update_sequence_data:[],
   create_sequence_data:[],
   get_sequence_based_on_name:[]
  };
  
  function sequencePatternReducer(state = initialState, action) {
    const {type, payload} = action;
  
    switch (type) {
      
  
      case GET_SEQUENCE_DATA:
        return {...state, sequence_data: payload};

      case GET_SEQUENCE_BASED_ON_NAME:
        return {...state, get_sequence_based_on_name: payload};

      case DELETE_SEQUENCE_DATA:
          return {...state, delete_sequence_data: payload};

      case UPDATE_SEQUENCE_DATA:
          return {...state, update_sequence_data: payload};

    case CREATE_SEQUENCE_DATA:
            return {...state, create_sequence_data: payload};
  
     
  
      default:
        return state;
    }
  }
  
  export default sequencePatternReducer;
  