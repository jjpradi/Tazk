import { ADD_RETAIL_SERVICE, CLEAR_EDIT_DATA, EDIT_RETAIL_SERVICE, GET_SERVICE_PAYMENT, SET_LIST_RETAIL_SERVICE, STATUS_COUNT, UPDATE_RETAIL_CUSTOMER_INTERACTIONS, UPDATE_RETAIL_SERVICE } from "redux/actionTypes";
const initialState = {
  listRetailService: [],
  numRows: 0,
  editdata: {},
  statusCount: [],
  get_service_payment : []
}
function retailServiceReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case SET_LIST_RETAIL_SERVICE: {
      return { ...state, listRetailService: payload.data, numRows: payload.numRows }
    }

    case ADD_RETAIL_SERVICE: {
      let data = state.listRetailService
      data.unshift(payload)

      return { ...state, listRetailService: data }
    }
    case EDIT_RETAIL_SERVICE: {
      console.log("payload", payload)
      return { ...state, editdata: payload }
    }
    case UPDATE_RETAIL_CUSTOMER_INTERACTIONS: {
      let data = state.listRetailService
      let edit = state.editdata
      if (payload?.data?.length > 0) {
        edit.interactions = payload?.data
      }
      let index = data.findIndex(x => x?.service_id == payload?.service_id)
      if (index !== -1) {
        data[index].interactions = payload?.data
      }
      console.log(payload,data,edit,listRetailService,editdata,interactions,edit.interactions = payload?.data,'intractions')
      return { ...state, editdata: edit, listRetailService: data }
    }
    case UPDATE_RETAIL_SERVICE: {
      let data = state.listRetailService
      let index = data.findIndex(x => x?.service_id == payload?.service_id)
      if (index !== -1) {
        data[index] = payload
      }
      return { ...state, listRetailService: data }
    }
    case CLEAR_EDIT_DATA:
      return {
        ...state,
        editdata: {},
      };

      case GET_SERVICE_PAYMENT:
        return{
          ...state, get_service_payment : payload
        }

    default: {
      return state;
    }

    case STATUS_COUNT: {
      return { ...state, statusCount: payload.data}
    }
  }
}
export default retailServiceReducer