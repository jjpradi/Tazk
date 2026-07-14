import { CREATE_NEWITEM, GET_NEWITEM_BY_ASSET, UPDATE_NEWITEM, SET_LIST_NEWITEM } from "../actionTypes";

const initialState = {
    createNewItemAll : [],
    newItemByAsset : [],
    updateNewItem : [],
    newItemList : [],
    newItemListCount : 0,
}

function NewItemReducers(state = initialState, action) {
    const {type, payload} = action
    switch (type) {
        case SET_LIST_NEWITEM:
            return {...state, newItemList: payload.data, newItemListCount: payload.numRows}

        case CREATE_NEWITEM:
            return {...state, createNewItemAll: payload}

        case UPDATE_NEWITEM:
            return {...state, updateNewItem: payload}

        case GET_NEWITEM_BY_ASSET:
            return {...state, newItemByAsset: payload}

        default :
            return state
    }
}
export default NewItemReducers;
