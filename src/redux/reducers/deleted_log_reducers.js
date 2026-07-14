import { GET_DELETED_LOG_DETAILS, SET_DELETE_LIST, SET_DELETED_LOG_DETAILS } from "redux/actionTypes";



const initialState ={
    DetailList:[],
    deleteList:[],
    deleteListCount:0
}

function DeleteLogReducer(state = initialState,action){
    const{type,payload}=action;
                     
    switch(type){

        case SET_DELETED_LOG_DETAILS :
            return {...state, deleteList :payload.data ,deleteListCount :payload.numRows};

        // case GET_DELETED_LOG_DETAILS :
        //     return {...state, DetailList: payload }

        default :
            return state
    }
}

export default DeleteLogReducer