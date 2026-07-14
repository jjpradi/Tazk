import {
  PUSH_PRODUCT,
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
  SET_PAYMENT_MODES,
  SET_NEXT_ORDER,
  SET_PAYMENT_REDIRECT_PREORDER,
  SET_PAYMENT_PREORDER,
  SET_CUSTOMER_PREORDER,
  EDIT_PREORDER_ITEMS,
  DELETE_PREORDER_ITEMS,
  PUSH_PREORDER_ITEMS,
  ENABLE_PREORDER,
  SET_PAYMENT_PREORDER_MODES,
  SET_NEXT_PRE_ORDER,
  PRE_ORDER_BACK_SPACE,
  OUT_OF_STOCK_DATA_PRE_ORDER_ITEMS,
  PRE_ORDER_CONVERT_DATA,
  DELETE_ITEM,
  DELETE_ITEM_BASED_ON_LOT_NUMBERS,
  CHANGE_PRICE_AND_DISCOUNT_FOR_ITEMS,
  CHANGE_DISCOUNT,
  DELETE_ITEM_IN_PRE_ORDER,
  DELETE_ITEM_USING_ITEM_ID_IN_PRE_ORDER,
  CHANGE_SERIAL_NUMBER,
} from '../actionTypes';
import DB from '../../db';

var db = new DB('pos_session');

const initialState = {
  product_lists: {
    tab0: {
      customer: {},
      productData: [],
      paymentData: [],
      paymentRedirect: false,
      pre_order: false,
      preOrderConvertData: {},
      discount: {percent: 0, amount: 0}
    },
  },
  tab_count: 'tab0',
  index: '',
  tab_lists: [
    {
      key: 0,
      id: 0,
      time: new Date().getHours() + ':' + new Date().getMinutes(),
    },
  ],
  paymentModes: [],
  pre_order_status: false,
  pre_order_list: {
    pre_order: {
      customer: {},
      productData: [],
      paymentData: [],
      preOrderPaymentRedirect: false,
      discount: {percent: 0, amount: 0}
    },
  },
  out_of_stock: {orderItems: [], productItems: []},
};

function PosProductList(state = initialState, action) {
  const {type, payload, posId} = action;
  let newState;
  const previousVal = {...state.product_lists};
  const preState = {...state.pre_order_list};

  switch (type) {
    case PUSH_PRODUCT:
      const pushList = {...state.product_lists};
      if (payload.is_serialized === 1) {
        let newPayload = {...payload};
        let lot_count = 0;
        // const addedLots = pushList[state.tab_count].productData.map(i => i?.lot_number);
        const addedLots = Object.keys(pushList).flatMap(tabs => pushList[tabs].productData.map(i => i?.lot_number));
        
        if (newPayload.lot_number) {
          if(!addedLots.includes(newPayload?.lot_number)){
            pushList[state.tab_count].productData.push(newPayload);
            pushList[state.tab_count].pre_order = payload.pre_order;
          }
        } else {
          if( !Object.keys(pushList).some(tabs => pushList[tabs].productData.filter(i => i.item_id === payload.item_id).length >= 1)) {
          // if (!pushList[state.tab_count].productData.length) {
            if (newPayload.lots.length) {
              newPayload.lot_number = newPayload.lots[0].lot_number;
              newPayload.cost_price = newPayload.lots[0]?.trans_items_cost_price || newPayload.cost_price;
              
              pushList[state.tab_count].pre_order = payload.pre_order;
              pushList[state.tab_count].productData.push(newPayload);

            }
          } else {
            Object.keys(pushList).flatMap(tabs => pushList[tabs].productData).forEach((t) => {
              if (payload.item_id === t.item_id) {
                while(addedLots.includes(newPayload.lots[lot_count]?.lot_number)){
                  lot_count++;
                }
              }
              
            });
            if (payload.lots[lot_count]) {
              
              newPayload.lot_number = newPayload.lots[lot_count].lot_number;
              newPayload.lot_id = newPayload.lots[lot_count].lot_id;
              newPayload.cost_price = newPayload.lots[lot_count]?.trans_items_cost_price || newPayload.cost_price;
              pushList[state.tab_count].productData.push(newPayload);
              pushList[state.tab_count].pre_order = payload.pre_order;
            }
          }
        }
      } else {
        let newPayload = {...payload};
        let notExist = false;
        let exist = true;
        if (!pushList[state.tab_count].productData.length) {
          pushList[state.tab_count].productData.push(payload);
          pushList[state.tab_count].pre_order = payload.pre_order;
        } else {
          pushList[state.tab_count].productData.forEach((t) => {
            if (payload.item_id !== t.item_id) {
              notExist = true;
            } else {
              exist = false;
            }
          });
        }
        if (notExist && exist) {
          newPayload.quantity = 1;
          pushList[state.tab_count].productData.push(newPayload);
          pushList[state.tab_count].pre_order = payload.pre_order;
        } else {
          let valid = true;
          const newList = pushList[state.tab_count].productData.map((d) => {
            if (payload.item_id === d.item_id) {
              const newd = {...d};
              if (newd.quantity >= newd.received_quantity) {
                valid = false;
              }
              newd.quantity = newd.quantity ? newd.quantity + 1 : 1;
              return newd;
            } else {
              return d;
            }
          });
          if (valid) {
            pushList[state.tab_count].productData = newList;
            pushList[state.tab_count].pre_order = payload.pre_order;
          }
        }
      }

      let discountAmount = 0
      if(pushList[state.tab_count].discount.percent !== 0){
        let productTotal = 0
        pushList[state.tab_count].productData.map((product) => {
          productTotal = productTotal + (product.selling_price ? (product.selling_price * (product?.quantity || 1)) : (product.unit_price * (product?.quantity || 1)))
        })
        discountAmount = (productTotal * pushList[state.tab_count].discount.percent) / 100
      }
      pushList[state.tab_count].discount.amount = discountAmount
      newState = {...state, product_lists: pushList};
      db.createCheckouts(newState, posId);
      return newState;

    case EDIT_LIST:
      if (state.index !== '') {
        const {name, value, discount_type} = payload;
        const filterList = {...state.product_lists};
        filterList[state.tab_count].productData[state.index][name] = value;
        if (name === 'discount') {
          filterList[state.tab_count].productData[state.index].discount_type =
            discount_type;
        }
        newState = {...state, product_lists: filterList};
        db.createCheckouts(newState, posId);
        return newState;
      } else {
        return state;
      }

    case CHANGE_TAB:
      newState = {
        ...state,
        tab_count: payload !== 'PreOrder' ? `tab${payload}` : state.tab_count,
        index: '',
        pre_order_status: payload !== 'PreOrder' ? false : true,
      };
      db.createCheckouts(newState, posId);
      return newState;

    case CREATE_TAB:
      newState = {
        ...state,
        product_lists: {
          ...state.product_lists,
          [`tab${payload.id}`]: {
            customer: {},
            productData: [],
            paymentData: [],
            paymentRedirect: false,
            pre_order: false,
            preOrderConvertData: {},
            discount: {percent: 0, amount: 0}
          },
        },
        tab_lists: payload.tab_lists,
        tab_count: `tab${payload.id}`,
        index: '',
      };
      db.createCheckouts(newState, posId);
      return newState;

    case DELETE_TAB:
      const filter = {...state.product_lists};
      delete filter[`tab${payload.id}`];
      newState = {
        ...state,
        product_lists: filter,
        tab_lists: payload.tab_lists,
        tab_count: `tab${payload.current_tab}`,
        index: '',
      };
      db.createCheckouts(newState, posId);
      return newState;

    case SELECT_INDEX:
      return {...state, index: payload};

    case BACK_SPACE:
      if (state.index !== '') {
        const oldVal = `${
          previousVal[state.tab_count].productData[state.index][payload]
        }`;
        previousVal[state.tab_count].productData[state.index][payload] =
          oldVal.slice(0, -1);
        newState = {...state, product_lists: previousVal};
        db.createCheckouts(newState, posId);
        return newState;
      } else {
        return state;
      }

    case DELETE_INDEX:
      if (state.index !== '') {
        previousVal[state.tab_count].productData.splice(payload, 1);
        newState = {...state, product_lists: previousVal, index: ''};
        db.createCheckouts(newState, posId);
        return newState;
      } else {
        return state;
      }

    case STATE_REPLACE:
      return {
        ...payload,
        pre_order_status: false,
        pre_order_list: {
          pre_order: {
            customer: {},
            productData: [],
            paymentData: [],
            paymentRedirect: false,
            discount: {percent: 0, amount: 0}
          },
        },
      };

    case CLEAR_STATE:
      newState = {
        product_lists: {
          tab0: {
            customer: {},
            productData: [],
            paymentData: [],
            paymentRedirect: false,
            pre_order: false,
            preOrderConvertData: {},
            discount: {percent: 0, amount: 0}
          },
        },
        tab_count: 'tab0',
        index: '',
        tab_lists: [
          {
            key: 0,
            id: 0,
            time: new Date().getHours() + ':' + new Date().getMinutes(),
          },
        ],
        paymentModes: [],
        pre_order_status: false,
        pre_order_list: {
          pre_order: {
            customer: {},
            productData: [],
            paymentData: [],
            paymentRedirect: false,
            discount: {percent: 0, amount: 0}
          },
        },
        out_of_stock: {orderItems: [], productItems: []},
      };
      db.createCheckouts(newState, posId);
      return newState;

    case SET_CUSTOMER:
      previousVal[state.tab_count].customer = payload;
      newState = {...state, product_lists: previousVal};
      db.createCheckouts(newState, posId);
      return newState;

    case SET_PAYMENT:
      previousVal[state.tab_count].paymentData = payload;
      newState = {...state, product_lists: previousVal};
      db.createCheckouts(newState, posId);
      return newState;

    case SET_PAYMENT_MODES:
      previousVal[state.tab_count].paymentRedirect = payload.redirect;
      newState = {
        ...state,
        product_lists: previousVal,
        paymentModes: payload.data,
      };
      db.createCheckouts(newState, posId);
      return newState;

    case SET_PAYMENT_REDIRECT:
      previousVal[state.tab_count].paymentRedirect = payload;
      newState = {...state, product_lists: previousVal};
      db.createCheckouts(newState, posId);
      return newState;

    case SET_NEXT_ORDER:
      previousVal[state.tab_count].paymentRedirect = payload;
      previousVal[state.tab_count].customer = {};
      previousVal[state.tab_count].paymentData = [];
      previousVal[state.tab_count].productData = [];
      previousVal[state.tab_count].discount = {percent: 0, amount: 0};
      newState = {...state, product_lists: previousVal};
      db.createCheckouts(newState, posId);
      return newState;

    case PUSH_PREORDER_ITEMS:
      const PreList = {...state.pre_order_list};
      let newPayload = {...payload};
      let notExist = false;
      let exist = true;
      if (!PreList['pre_order'].productData.length) {
        PreList['pre_order'].productData.push(payload);
      } else {
        PreList['pre_order'].productData.forEach((t) => {
          if (payload.item_id !== t.item_id) {
            notExist = true;
          } else {
            exist = false;
          }
        });
      }
      if (notExist && exist) {
        newPayload.quantity = 1;
        PreList['pre_order'].productData.push(newPayload);
      } else {
        let valid = true;
        const newList = PreList['pre_order'].productData.map((d) => {
          if (payload.item_id === d.item_id) {
            const newd = {...d};
            // if (newd.quantity >= newd.received_quantity) {
            //     valid = false;
            // }
            newd.quantity = newd.quantity ? newd.quantity + 1 : 1;
            return newd;
          } else {
            return d;
          }
        });
        if (valid) {
          PreList['pre_order'].productData = newList;
        }
      }

      let preOrderDiscountAmount = 0
      if(PreList['pre_order'].discount.percent !== 0){
        let productTotal = 0
        PreList['pre_order'].productData.map((product) => {
          productTotal = productTotal + (product.selling_price ? (product.selling_price * product.quantity) : (product.unit_price * product.quantity))
        })
        preOrderDiscountAmount = (productTotal * PreList['pre_order'].discount.percent) / 100
      }
      PreList['pre_order'].discount.amount = preOrderDiscountAmount
      newState = {...state, pre_order_list: PreList};
      return newState;

    case DELETE_PREORDER_ITEMS:
      if (state.index !== '') {
        preState['pre_order'].productData.splice(payload, 1);
        newState = {...state, pre_order_list: preState};
        return newState;
      } else {
        return state;
      }

    case EDIT_PREORDER_ITEMS:
      if (state.index !== '') {
        const {name, value} = payload;
        const filterList = {...state.pre_order_list};
        filterList['pre_order'].productData[state.index][name] = value;
        newState = {...state, pre_order_list: filterList};
        return newState;
      } else {
        return state;
      }
    case SET_CUSTOMER_PREORDER:
      preState.pre_order.customer = payload;
      newState = {...state, pre_order_list: preState};
      return newState;

    case SET_PAYMENT_PREORDER_MODES:
      preState['pre_order'].preOrderPaymentRedirect = payload.redirect;
      newState = {
        ...state,
        pre_order_list: preState,
        paymentModes: payload.data,
      };
      return newState;

    case SET_PAYMENT_PREORDER:
      preState['pre_order'].paymentData = payload;
      newState = {...state, pre_order_list: preState};
      return newState;

    case SET_PAYMENT_REDIRECT_PREORDER:
      preState['pre_order'].preOrderPaymentRedirect = payload;
      newState = {...state, pre_order_list: preState};
      return newState;

    case ENABLE_PREORDER:
      newState = {...state, pre_order_status: payload};
      return newState;

    case SET_NEXT_PRE_ORDER:
      preState['pre_order'].preOrderPaymentRedirect = payload;
      preState['pre_order'].customer = {};
      preState['pre_order'].paymentData = [];
      preState['pre_order'].productData = [];
      preState['pre_order'].discount = {percent: 0, amount: 0};
      newState = {...state, pre_order_list: preState};
      return newState;

    case PRE_ORDER_BACK_SPACE:
      if (state.index !== '') {
        const old = `${
          preState['pre_order'].productData[state.index][payload]
        }`;
        preState['pre_order'].productData[state.index][payload] = old.slice(
          0,
          -1,
        );
        newState = {...state, pre_order_list: preState};
        return newState;
      } else {
        return state;
      }
    case OUT_OF_STOCK_DATA_PRE_ORDER_ITEMS:
      newState = {...state, out_of_stock: payload};
      return newState;

    case PRE_ORDER_CONVERT_DATA:
      previousVal[state.tab_count].preOrderConvertData = payload;
      newState = {...state, product_lists: previousVal};
      db.createCheckouts(newState, posId);
      return newState;

      case DELETE_ITEM: {
        const currentState = previousVal
        if(payload.isSerialized === 1){
          const newProductList = currentState[state.tab_count].productData.filter(e => e.lot_number !== payload.lot_number)
          previousVal[state.tab_count].productData = newProductList
        }
        else{
          const newProductList = currentState[state.tab_count].productData.filter(e => e.item_id !== payload.item_id)
          previousVal[state.tab_count].productData = newProductList  
        }
        
        let discountAmountAfterRemovingItems = 0
        if(previousVal[state.tab_count].discount.percent !== 0){
          let productTotal = 0
          previousVal[state.tab_count].productData.map((product) => {
            productTotal = productTotal + (product.selling_price ? (product.selling_price * (product?.quantity || 1)) : (product.unit_price * (product?.quantity || 1)))
          })
          discountAmountAfterRemovingItems = (productTotal * previousVal[state.tab_count].discount.percent) / 100
        }
        previousVal[state.tab_count].discount.amount = discountAmountAfterRemovingItems
        newState = { ...state, product_list: previousVal, index: '' }
        db.createCheckouts(newState, posId)
        return newState;
      }

      case DELETE_ITEM_USING_ITEM_ID_IN_PRE_ORDER: {
        const currentState = preState
        const newProductList = currentState['pre_order'].productData.filter(e => e.item_id !== payload)
        preState['pre_order'].productData = newProductList
        newState = { ...state, pre_order_list: preState, index: '' }

        let preOrderDiscountAmountAfterRemovingItems = 0
        if(preState['pre_order'].discount.percent !== 0){
          let productTotal = 0
          preState['pre_order'].productData.map((product) => {
            productTotal = productTotal + (product.selling_price ? (product.selling_price * (product?.quantity || 1)) : (product.unit_price * (product?.quantity || 1)))
          })
          preOrderDiscountAmountAfterRemovingItems = (productTotal * preState['pre_order'].discount.percent) / 100
        }
        preState['pre_order'].discount.amount = preOrderDiscountAmountAfterRemovingItems
        return newState;
      }

      case DELETE_ITEM_BASED_ON_LOT_NUMBERS: {
        const currentState = previousVal
        const newProductList = currentState[state.tab_count].productData
        if(payload.is_serialized === 1){
          previousVal[state.tab_count].productData = newProductList.filter(e => !payload.lotNumbers.includes(e.lot_number))
        }
        else{
          newProductList.find(e => e.item_id === payload.item_id).quantity = payload.currentQuantity
          previousVal[state.tab_count].productData = newProductList
        }

        let discountAmountAfterDeletingItems = 0
        if(previousVal[state.tab_count].discount.percent !== 0){
          let productTotal = 0
          previousVal[state.tab_count].productData.map((product) => {
            productTotal = productTotal + (product.selling_price ? (product.selling_price * (product?.quantity || 1)) : (product.unit_price * (product?.quantity || 1)))
          })
          discountAmountAfterDeletingItems = (productTotal * previousVal[state.tab_count].discount.percent) / 100
        }
        previousVal[state.tab_count].discount.amount = discountAmountAfterDeletingItems
        newState = { ...state, product_list: previousVal, index: '' }
        db.createCheckouts(newState, posId)
        return newState;
      }

      case DELETE_ITEM_IN_PRE_ORDER: {
        const currentState = {...state.pre_order_list}
        let newProductList = currentState['pre_order'].productData
        let preOrderDiscountAmountAfterDeletingItems = 0
        if(payload.lotNumbers[0] === undefined){
          newProductList.find(e => e.item_id === payload.item_id).quantity = payload.currentQuantity
          preState['pre_order'].productData = newProductList

          if(currentState['pre_order'].discount.percent !== 0){
            let productTotal = 0
            currentState['pre_order'].productData.map((product) => {
              productTotal = productTotal + (product.selling_price ? (product.selling_price * (product?.quantity || 1)) : (product.unit_price * (product?.quantity || 1)))
            })
            preOrderDiscountAmountAfterDeletingItems = (productTotal * currentState['pre_order'].discount.percent) / 100
          }
          preState['pre_order'].discount.amount = preOrderDiscountAmountAfterDeletingItems
          newState = { ...state, pre_order_list: preState, index: '' }
          return newState;
        }
        else{
          newProductList = currentState['pre_order'].productData.filter(e => !payload.lotNumbers.includes(e.lot_number))
          preState['pre_order'].productData = newProductList

          if(currentState['pre_order'].discount.percent !== 0){
            let productTotal = 0
            currentState['pre_order'].productData.map((product) => {
              productTotal = productTotal + (product.selling_price ? (product.selling_price * (product?.quantity || 1)) : (product.unit_price * (product?.quantity || 1)))
            })
            preOrderDiscountAmountAfterDeletingItems = (productTotal * currentState['pre_order'].discount.percent) / 100
          }
          preState['pre_order'].discount.amount = preOrderDiscountAmountAfterDeletingItems
          newState = { ...state, pre_order_list: newProductList, index: '' }
          return newState;
        }
      }

      case CHANGE_DISCOUNT: {
        if(payload.pre_order_status){
          preState['pre_order'].discount = payload.data
          newState = { ...state, pre_order_list: preState }
          return newState
        }
        else{
          previousVal[state.tab_count].discount = payload.data
          newState = { ...state, product_list: previousVal }
          db.createCheckouts(newState, posId)
          return newState
        }
      }

      case CHANGE_PRICE_AND_DISCOUNT_FOR_ITEMS: {
        if(payload.pre_order_status){
          const currentState = preState
          const newProductList = currentState['pre_order'].productData.map((product) => {
            if(product.item_id === payload.item_id){
              return { ...product, unit_price: payload.price, max_price: payload.price, isTaxIncluded: true }
            }
            else{
              return { ...product }
            }
          })
          preState['pre_order'].productData = newProductList
          newState = { ...state, pre_order_list: preState }
          return newState
        }
        else{
          const currentState = previousVal
          const newProductList = currentState[state.tab_count].productData.map((product) => {
            if(payload.isSerialized === 1){
              if(product.lot_number === payload.lot_number && product.item_id === payload.item_id){
                return{ ...product, unit_price: payload.price, isTaxIncluded: true }
              }
              else{
                return{ ...product }
              }
            }
            else{
              if(product.item_id === payload.item_id){
                return{ ...product, unit_price: payload.price, ...(payload.isSerialized === 0 && {max_price: payload.price}), isTaxIncluded: true }
              }
              else{
                return{ ...product }
              }
            }
          })
          previousVal[state.tab_count].productData = newProductList
          newState = { ...state, product_list: newProductList, index: '' }
          db.createCheckouts(newState, posId)
          return newState;
        }
      }

      case CHANGE_SERIAL_NUMBER: {
        const currentState = previousVal
        const newProductList = currentState[state.tab_count].productData.map((product) => {
          if(product.item_id === payload.item_id && product.lot_number === payload.oldLotNumber){
            return { ...product, lot_number: payload.newLotNumber }
          }
          else{
            return { ...product }
          }
        })
        previousVal[state.tab_count].productData = newProductList
        newState = { ...state, product_list: newProductList, index: '' }
        db.createCheckouts(newState, posId)
        return newState;
      }

    default:
      return state;
  }
}

export default PosProductList;
