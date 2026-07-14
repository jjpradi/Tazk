import {
  PUSH_PRODUCT,
  // GET_LIST,
  CHANGE_TAB,
  CREATE_TAB,
  DELETE_TAB,
  EDIT_LIST,
  SELECT_INDEX,
  BACK_SPACE,
  DELETE_INDEX,
  STATE_REPLACE,
  CLEAR_STATE,
  SET_CUSTOMER,
  SET_PAYMENT,
  SET_PAYMENT_REDIRECT,
  SET_NEXT_ORDER,
  SET_PAYMENT_PREORDER,
  SET_CUSTOMER_PREORDER,
  EDIT_PREORDER_ITEMS,
  DELETE_PREORDER_ITEMS,
  PUSH_PREORDER_ITEMS,
  ENABLE_PREORDER,
  SET_PAYMENT_REDIRECT_PREORDER,
  SET_NEXT_PRE_ORDER,
  PRE_ORDER_BACK_SPACE,
  OUT_OF_STOCK_DATA_PRE_ORDER_ITEMS,
  PRE_ORDER_CONVERT_DATA,
  SELECT_ONDATA,
  DELETE_ITEM,
  DELETE_ITEM_BASED_ON_LOT_NUMBERS,
  CHANGE_PRICE_AND_DISCOUNT_FOR_ITEMS,
  CHANGE_DISCOUNT,
  DELETE_ITEM_IN_PRE_ORDER,
  DELETE_ITEM_USING_ITEM_ID_IN_PRE_ORDER,
  CHANGE_SERIAL_NUMBER
} from '../actionTypes';

export const PushProductList = (data, posId) => async (dispatch) => {
  dispatch({
    type: PUSH_PRODUCT,
    payload: data,
    posId,
  });
};
export const EditProductList = (data, posId) => async (dispatch) => {
  console.log('dataedittttttttt', data,posId )
  dispatch({
    type: EDIT_LIST,
    payload: data,
    posId,
  });
};

export const ChangeTab = (data, posId) => async (dispatch) => {
  dispatch({
    type: CHANGE_TAB,
    payload: data,
    posId,
  });
};
export const CreateTab = (data, posId) => async (dispatch) => {
  dispatch({
    type: CREATE_TAB,
    payload: data,
    posId,
  });
};
export const DeleteTab = (data, posId) => async (dispatch) => {
  dispatch({
    type: DELETE_TAB,
    payload: data,
    posId,
  });
};
export const SelectIndex = (data, posId) => async (dispatch) => {
  dispatch({
    type: SELECT_INDEX,
    payload: data,
    posId,
  });
};


export const BackSpace = (name, posId) => async (dispatch) => {
  dispatch({
    type: BACK_SPACE,
    payload: name,
    posId,
  });
};

export const DeleteIndex = (index, posId) => async (dispatch) => {
  dispatch({
    type: DELETE_INDEX,
    payload: index,
    posId,
  });
};

export const deleteItem = (itemId, posId) => async (dispatch) => {
  dispatch({
    type: DELETE_ITEM,
    payload: itemId,
    posId,
  });
};

export const deleteItemInPreOrder = (itemId, posId) => async (dispatch) => {
  dispatch({
    type: DELETE_ITEM_USING_ITEM_ID_IN_PRE_ORDER,
    payload: itemId,
    posId,
  });
};

export const removeItemsBasedLotNumbers = (removingData, posId) => async (dispatch) => {
  dispatch({
    type: DELETE_ITEM_BASED_ON_LOT_NUMBERS,
    payload: removingData,
    posId,
  });
};

export const removeItemsInPreOrder = (removingData, posId) => async (dispatch) => {
  dispatch({
    type: DELETE_ITEM_IN_PRE_ORDER,
    payload: removingData,
    posId,
  });
};

export const changePriceAndDiscount = (priceAndDiscount, posId) => async (dispatch) => {
  dispatch({
    type: CHANGE_PRICE_AND_DISCOUNT_FOR_ITEMS,
    payload: priceAndDiscount,
    posId,
  });
};

export const changeDiscountAction = (discount, posId) => async (dispatch) => {
  dispatch({
    type: CHANGE_DISCOUNT,
    payload: discount,
    posId,
  });
};

export const StateReplace = (data, posId) => async (dispatch) => {
  dispatch({
    type: STATE_REPLACE,
    payload: data,
    posId,
  });
};

export const ClearState = (posId) => async (dispatch) => {
  dispatch({
    type: CLEAR_STATE,
    posId,
  });
};

export const SetCustomer = (data, posId) => async (dispatch) => {
  dispatch({
    type: SET_CUSTOMER,
    payload: data,
    posId,
  });
};

export const SetPaymentData = (data, posId) => async (dispatch) => {
  dispatch({
    type: SET_PAYMENT,
    payload: data,
    posId,
  });
};

export const SetPaymentRedirect = (data, posId) => async (dispatch) => {
  dispatch({
    type: SET_PAYMENT_REDIRECT,
    payload: data,
    posId,
  });
};

export const SetNextOrder = (data, posId) => async (dispatch) => {
  dispatch({
    type: SET_NEXT_ORDER,
    payload: data,
    posId,
  });
};

export const PushPreOrderItems = (data, posId) => async (dispatch) => {
  dispatch({
    type: PUSH_PREORDER_ITEMS,
    payload: data,
    posId,
  });
};

export const EditPreOrderItems = (data, posId) => async (dispatch) => {
  dispatch({
    type: EDIT_PREORDER_ITEMS,
    payload: data,
    posId,
  });
};

export const DeletePreOrderItems = (data, posId) => async (dispatch) => {
  dispatch({
    type: DELETE_PREORDER_ITEMS,
    payload: data,
    posId,
  });
};

export const SetCustomerPreOrder = (data, posId) => async (dispatch) => {
  dispatch({
    type: SET_CUSTOMER_PREORDER,
    payload: data,
    posId,
  });
};

export const SetPaymentDataPreOrder = (data, posId) => async (dispatch) => {
  dispatch({
    type: SET_PAYMENT_PREORDER,
    payload: data,
    posId,
  });
};
export const SetPaymentRedirectPreOrder = (data, posId) => async (dispatch) => {
  dispatch({
    type: SET_PAYMENT_REDIRECT_PREORDER,
    payload: data,
    posId,
  });
};

export const enablePreOrder = (status, posId) => async (dispatch) => {
  dispatch({
    type: ENABLE_PREORDER,
    payload: status,
    posId,
  });
};

export const SetNextPreOrder = (data, posId) => async (dispatch) => {
  dispatch({
    type: SET_NEXT_PRE_ORDER,
    payload: data,
    posId,
  });
};

export const PreOrderBackSpace = (name, posId) => async (dispatch) => {
  dispatch({
    type: PRE_ORDER_BACK_SPACE,
    payload: name,
    posId,
  });
};

export const PreOrderOutOFStock = (data) => async (dispatch) => {
  dispatch({
    type: OUT_OF_STOCK_DATA_PRE_ORDER_ITEMS,
    payload: data,
  });
};

export const PreOrderConvertDataAction = (data, posId) => async (dispatch) => {
  dispatch({
    type: PRE_ORDER_CONVERT_DATA,
    payload: data,
    posId,
  });
};

export const changeSerialNumberForProduct = (data, posId) => async(dispatch) => {
  dispatch({
    type: CHANGE_SERIAL_NUMBER,
    payload: data,
    posId
  })
}