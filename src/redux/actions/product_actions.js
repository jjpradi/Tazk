import {
  CREATE_PRODUCT,
  LIST_PRODUCT,
  GET_ID_PRODUCT,
  EDIT_PRODUCT,
  DELETE_PRODUCT,
  GET_ID_PRODUCT_DATE,
  GET_ID_PRODUCT_MONTH,
  GET_ID_PRODUCT_TILL,
  GET_PRODUCT_HSN_CODE_DETAILS,
  TOTAL_PRODUCT_COUNT,
  GET_ALL_PRODUCT_BRAND,
  GET_ALL_PRODUCT_CATEGORY,
  PRODUCT_BY_PAGINATION,
  GET_INVENTORY_PRODUCT,
  GET_FILTER_INVENTORY_PRODUCT,
  GET_FILTER_SALES_PRODUCT,
  GET_SALES_PRODUCT,
  GET_SEARCH_PRODUCT,
  LIST_PRODUCT_PAGINATION,
  SET_SEARCH_PRODUCT,
  PURCHASE_PRODUCT_LIST,
  CHECK_PRODUCT,
  TOTAL_PURCHASED_QTY,
  EDIT_LOT_NUMBER,
  GET_LOT_NUMBER_BY_ID,
  GET_PRODUCT_INFINITE_SCROLL,
  SET_PRODUCT_INFINITE_SCROLL,
  SEARCH_PRODUCT_FILTER,
  PRODUCT_SCROLL,
  GET_INVENTORY_SALES_PRODUCT,
  GET_INVENTORY_SALES_ALL_PRODUCT,
  SET_SEARCH_INVENTORY,
  PRODUCT_LIST,
  CATEGORY_BASED_ON_BRAND,
  LIST_LOCATION_PRODUCT,
  DELETE_GR_PRODUCT,
  SET_LIST_GR_PRODUCT,
  GET_LIST_GR_PRODUCT,
  GET_SEARCH_SYNC_PRODUCT,
  SET_SEARCH_SYNC_PRODUCT,
  GET_TAX_RATE,
  HSN_CODE_DETAIL,
  LIST_PRODUCT_BY_TYPE,
  GET_PRODUCT_BY_LOT_NUMBER,
  PRODUCT_TIMELINE
} from '../actionTypes';
import Productservice from '../../services/product_services';
import DB from '../../db';
import {
  ListLoad,
  FailLoad,
  ErrorAlert,
  UpdateAlert,
  successmsg,
  errormsg,
  DeleteAlert,
  ProductDeleteAlert,
  ProductUpdate,
  ExistAlert,
} from './load';
import {createAction, deleteAction, updateAction} from './actions';
import { OpenalertActions } from './alert_actions';
import inventory_services from 'services/inventory_services';
var db = new DB('pos_session');

export const createProductAction =
  (data, setModalTypeHandler, setLoaderStatusHandler, sample, setDisable) =>
  async (dispatch) => {
    return createAction(
      Productservice,
      CREATE_PRODUCT,
      dispatch,
      data,
      null,
      null,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
      'product',
      setDisable,
    );
   
    //   try {
    //     ListLoad(setModalTypeHandler, setLoaderStatusHandler)
    //     const res = await Productservice.create(data);
    //     if (res.data.affectedRows === 1) {
    //       dispatch({
    //         type: CREATE_PRODUCT,
    //         payload: res.data.data,
    //       });
    //       successmsg(sample)
    //       FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    //       CreateAlert(dispatch)
    //     } else {
    //      // errormsg(sample)
    //       FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    //       // alertResponce(res.data.status,'error')
    //     }
    //    // return Promise.resolve(res.data.data);
    //   } catch (err) {
    //     FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    //     ErrorAlert(dispatch, err)
    //     errormsg(sample)
    //     //return Promise.reject(err);
    //     // }
    //   }
  };

export const listProductAction =
  (setModalTypeHandler, setLoaderStatusHandler, exportCallBack, response) =>
  async (dispatch) => {
    try {
       ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Productservice.getAll();

     // console.log('listproductttttttttttt', res.status, res.data)
      if (res.status === 200 || res.status === 304) {
        dispatch({
          type: LIST_PRODUCT,
          payload: res.data,
        });
        if(response){
          response(res.data)
        }

        if (exportCallBack) {
          exportCallBack(res.data);
        }

        // });
      }
       FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (exportCallBack) {
        exportCallBack([]);
      }
      // ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const listProductActionByType =
  (type,setModalTypeHandler, setLoaderStatusHandler, exportCallBack, response) =>
  async (dispatch) => {
    try {
       ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Productservice.getAllProductsByType(type);

      if (res.status === 200) {
        dispatch({
          type: LIST_PRODUCT_BY_TYPE,
          payload: res.data,
        });
        if(response){
          response(res.data)
        }

        if (exportCallBack) {
          exportCallBack(res.data);
        }

        // });
      }
       FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (exportCallBack) {
        exportCallBack([]);
      }
      // ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getlimitdatafromproduct =
  (setModalTypeHandler, setLoaderStatusHandler, data) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Productservice.getpaginationdata(data);
      dispatch({
        type: PRODUCT_BY_PAGINATION,
        payload: res.data,
      });
      dispatch({
        type: TOTAL_PRODUCT_COUNT,
        payload: res.data.numRows,
      });

      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve(res.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const listProductByLocationAction =
  (id, setModalTypeHandler, setLoaderStatusHandler, ) => async (dispatch) => {
    try {
       ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Productservice.getLocationById(id);
      // Pouch DB
      db.createProducts(res.data);
      if (res.status === 200) {
        dispatch({
          type: LIST_LOCATION_PRODUCT,
          payload: res.data,
        });
      }
       FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
       FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      
      // const db_product = await db.getAllProducts(); //
      // if (db_product) {
      //   dispatch({
      //     type: LIST_PRODUCT,
      //     payload: db_product,
      //   });
      // }
      // }
      dispatch({
        type: LIST_PRODUCT,
        payload: [],
      });
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const listSearchProductByLocationAction =
  (id, data, oldData, response) => async (dispatch) => {
    try {
      const res = await Productservice.getsearchfilter(id, data);
      db.createProducts(res.data.data);
      if (res.status === 200) {
        if(response){
          response(res.data.data, data.searchType)
        }
        if(data.searchType === 'initial'){
          dispatch({
            type: PRODUCT_SCROLL,
            payload: data.lastId === 'MAX_NUMBER' ? [...res.data.data] : [...oldData, ...res.data.data],
          });
        }else{
          dispatch({
            type: SEARCH_PRODUCT_FILTER,
            payload: data.lastId === 'MAX_NUMBER' ? [...res.data.data] : [...oldData, ...res.data.data],
          });
        }
        
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      dispatch({
        type: LIST_PRODUCT,
        payload: [],
      });
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getbyidProductAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Productservice.get(id);
      dispatch({
        type: GET_ID_PRODUCT,
        payload: res.data,
      });
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve(res.data);
    } catch (err) {
      // if(err.response?.status === 500) {
      //   getbyidToken(Productservice, GET_ID_PRODUCT, dispatch, id)
      // }
      // else{
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const updateProductAction =
  (id, data, setModalTypeHandler, setLoaderStatusHandler, sample,response) =>
  async (dispatch) => {
    // updateAction(Productservice, EDIT_PRODUCT, dispatch, id, data, setModalTypeHandler, setLoaderStatusHandler, sample)
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Productservice.update(id, data);
      if (res.data.affectedRows === 1){
        UpdateAlert(dispatch);

        dispatch({
          type: EDIT_PRODUCT,
          payload: res.data.data,
        });
        dispatch({
          type: LIST_PRODUCT,
          payload: res.data.data,
        });
        response('updated')
      }
    

      
      // dispatch({
      //   type: TOTAL_PRODUCT_COUNT,
      //   payload: res.data.numRows,
      // });
      successmsg(sample);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve(res.data.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);

      ErrorAlert(dispatch, err);
      errormsg(sample);
      //return Promise.reject(err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


  

export const deleteProductAction =
  (id, setModalTypeHandler, setLoaderStatusHandler, sample) =>
  async (dispatch) => {
    // deleteAction(Productservice, DELETE_PRODUCT, dispatch, id, setModalTypeHandler, setLoaderStatusHandler )
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Productservice.delete(id);
      if (res.status === 200 && res.statusText === 'OK') {
        DeleteAlert(dispatch);
        dispatch({
          type: DELETE_PRODUCT,
          payload: res.data.data,
        });
        dispatch({
          type: LIST_PRODUCT,
          payload: res.data.data,
        });
        if (sample) {
          sample(false);
        }
      } else if (res.status === 203 && res.data.message) {
        ProductDeleteAlert(dispatch, res.data.message);
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve(res.data.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);

      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getProductDateAction = (id) => async (dispatch) => {
  try {
    const res = await Productservice.getDate(id);
    dispatch({
      type: GET_ID_PRODUCT_DATE,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    // if(err.response?.status === 500) {
    //   getbyidToken(Productservice, GET_ID_PRODUCT, dispatch, id)
    // }
    // else{
    ErrorAlert(dispatch, err);
    // }
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const getProductMonthAction = (id) => async (dispatch) => {
  try {
    const res = await Productservice.getMonth(id);
    dispatch({
      type: GET_ID_PRODUCT_MONTH,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    // if(err.response?.status === 500) {
    //   getbyidToken(Productservice, GET_ID_PRODUCT, dispatch, id)
    // }
    // else{
    ErrorAlert(dispatch, err);
    // }
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const getTotalPurchasedQtyAction = (id) => async (dispatch) => {
  try {
    const res = await Productservice.getTotalPurchasedQty(id);
    dispatch({
      type: TOTAL_PURCHASED_QTY,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    // if(err.response?.status === 500) {
    //   getbyidToken(Productservice, GET_ID_PRODUCT, dispatch, id)
    // }
    // else{
    ErrorAlert(dispatch, err);
    // }
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const getHsnCodeAction = (data) => async (dispatch) => {
  try {
    const res = await Productservice.getHsnCode(data);
    dispatch({
      type: HSN_CODE_DETAIL,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const getCheckProductAction = (id) => async (dispatch) => {
  try {
    const res = await Productservice.getcheckproduct(id);
    dispatch({
      type: CHECK_PRODUCT,
      payload: res.data,
    });
    if(res.data[0]?.total > 0) {
      // ProductUpdate(dispatch);
    }
    // ProductUpdate(dispatch)
    return Promise.resolve(res.data);

  } catch (err) {
    // if(err.response?.status === 500) {
    //   getbyidToken(Productservice, GET_ID_PRODUCT, dispatch, id)
    // }
    // else{
    ErrorAlert(dispatch, err);
    // }
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const getProductTillAction = (id) => async (dispatch) => {
  try {
    const res = await Productservice.getTill(id);
    dispatch({
      type: GET_ID_PRODUCT_TILL,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    // if(err.response?.status === 500) {
    //   getbyidToken(Productservice, GET_ID_PRODUCT, dispatch, id)
    // }
    // else{
    ErrorAlert(dispatch, err);
    // }
    return Promise.reject("API_FINISHED_ERROR");
  }
};

// export const GetProductPagination =(setModalTypeHandler,setLoaderStatusHandler, data) => async (dispatch) => {
//   try {
//     ListLoad(setModalTypeHandler,setLoaderStatusHandler)
//     const res = await Productservice.getlimit(data);

//     if (res.status === 200) {
//       dispatch({
//         type :LIST_PRODUCT,
//         payload: res.data.data
//       });
//       dispatch({
//         type :TOTAL_PRODUCT_COUNT,
//         payload: res.data.numRows
//       });
//     }
//     FailLoad(setModalTypeHandler,setLoaderStatusHandler)
//   } catch (err) {
//     FailLoad(setModalTypeHandler,setLoaderStatusHandler)
//     ErrorAlert(dispatch, err)
//   }
// };

export const GetProductHsnDetails =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Productservice.getHsnDetails();
      // Pouch DB

      if (res.status === 200) {
        dispatch({
          type: GET_PRODUCT_HSN_CODE_DETAILS,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const GetAllProductBrand =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Productservice.getAllProductBrand();
      // Pouch DB

      if (res.status === 200) {
        dispatch({
          type: GET_ALL_PRODUCT_BRAND,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const GetAllProductCategory =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Productservice.getAllProductCategory();
      // Pouch DB

      if (res.status === 200) {
        dispatch({
          type: GET_ALL_PRODUCT_CATEGORY,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const bulkProductAction =
  (data, setLoaderStatusHandler, result, isPro) => async (dispatch) => {
    try {
      // ListLoad(true, setLoaderStatusHandler);
      const res = await Productservice.bulk(data);
      // FailLoad(true, setLoaderStatusHandler);
      if(res.status === 200){
        result(true, res.data);
      }

      if (!isPro) {
        const getAll = await Productservice.getAll();
        // Pouch DB
        db.createProducts(getAll.data);
        dispatch({
          type: LIST_PRODUCT,
          payload: getAll.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {

      result(false);
      // FailLoad(true, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const inventorySalesAllProductAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Productservice.getInventorySalesAllProduct();
      // Pouch DB

      if (res.status === 200) {
        dispatch({
          type: GET_INVENTORY_SALES_ALL_PRODUCT,
          payload: res.data,
        });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
    }
  };

  export const InventoryProductAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Productservice.getinventoryproduct();
      if (res.status === 200) {
        dispatch({
          type: GET_INVENTORY_PRODUCT,
          payload: res.data,
        });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
    }
  };

  export const purchaseProductListAction =
  () => async (dispatch) => {
    try {
      const res = await Productservice.purchaseProductList();

      if (res.status === 200) {
        dispatch({
          type: PURCHASE_PRODUCT_LIST,
          payload: res.data,
        });
      }

    } catch (err) {
      ErrorAlert(dispatch, err);

    }
  };

  export const purchaseProductTaxesAction =
  (id) => async (dispatch) => {
    try {
      const res = await Productservice.purchaseProductTaxes(id);
      if (res.status === 200) {
        dispatch({
          type: GET_TAX_RATE,
          payload: res.data,
        });
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
    }
  };

  export const FILTERInventoryProductAction =
  (data,setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Productservice.getfilterinventoryproduct(data);
      // Pouch DB
      if (res.status === 200) {
        dispatch({
          type: GET_FILTER_INVENTORY_PRODUCT,
          payload: res.data,
        });
      }


      if(response){
        response(res.data.data)
      }

      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
    }
  };

  export const inventorySalesProductAction =
  (data,setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Productservice.inventorySalesproduct(data);
      // Pouch DB
      if (res.status === 200) {
        dispatch({
          type: GET_INVENTORY_SALES_PRODUCT,
          payload: res.data,
        });
      }


      if(response){
        response(res.data.data)
      }

      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
    }
  };

  export const FilterSalesProductAction =
  (data,setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Productservice.getsalesfilterproduct(data);
      // Pouch DB

      if (res.status === 200) {
        dispatch({
          type: GET_FILTER_SALES_PRODUCT,
          payload: res.data,
        });
      }

      if(response){
        response(res.data.data)
      }
      
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
    }
  };
  export const Salesproduct =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Productservice.getsalesproduct();
      // Pouch DB

      if (res.status === 200) {
        dispatch({
          type: GET_SALES_PRODUCT,
          payload: res.data,
        });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
    }
  };


  export const get_searchProductAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
    return {
      type:GET_SEARCH_PRODUCT,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

  export const set_searchProductAction = (data) => {
    return {
      type:SET_SEARCH_PRODUCT,
      payload:data
    }
};
export const get_searchsyncProductAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
  return {
    type:GET_SEARCH_SYNC_PRODUCT,
    body,
    setModalTypeHandler, 
    setLoaderStatusHandler
  }
};

export const set_searchsyncProductAction = (data) => {
  return {
    type:SET_SEARCH_SYNC_PRODUCT,
    payload:data
  }
};

export const productPaginationAction = (data) => async (dispatch) => {
  try {
    const res = await Productservice.pagination(data);
    if (res.status === 200) {
      dispatch({
        type: SET_SEARCH_PRODUCT,
        payload: res.data,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};


export const updateLotNumberAction =
  (data, callBack) =>
  async (dispatch) => {
    
    try {
      
      const res = await Productservice.updateLotNumber(data);
      if(res.status === 200){
        if (res.data.affectedRows === 1) UpdateAlert(dispatch);
        if(res.data == 'Lot Number Already Exists') ExistAlert(dispatch)
        if(res.data?.exisiting_lots !== undefined ) dispatch(OpenalertActions({msg: res.data?.exisiting_lots + " already exists lot_number ", severity: 'error'}));
        // const getAll = await Productservice.getAll();
        dispatch({
          type: EDIT_LOT_NUMBER,
          payload: res.data.data,
        });

        if(callBack){
          callBack(res)
        }
  
        // dispatch({
        //   type: LIST_PRODUCT,
        //   payload: getAll.data,
        // });
  
  
  
        
  
        return Promise.resolve("API_FINISHED_SUCCESS");

      }
    } catch (err) {
      ErrorAlert(dispatch, err);
     
      return Promise.reject('API_FINISHED_ERROR');
    }
  };


  export const getLotNumberByIdAction = (id, setData) => async (dispatch) => {
    try {
      const res = await Productservice.getLotNumberById(id);

      if (res.status === 200) {
        setData(res.data);

        // });
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
    }
  };


  export const get_productInfiniteScroll = (val, setModalTypeHandler, setLoaderStatusHandler) =>{
    return {
      type:GET_PRODUCT_INFINITE_SCROLL,
      data:val,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

  export const set_productInfiniteScroll = (data) => {
    return {
      type:SET_PRODUCT_INFINITE_SCROLL,
      payload:data
    }
  };


  export const updateProductDataAction = (data) => async (dispatch, getState) => {
  try {
    const res = await Productservice.updateProductData(data);
    if (res.status === 200) {
      const oldProductData = getState().productReducer.product;
      const updated = oldProductData.map(obj => res.data.find(o => o.item_id === obj.item_id) || obj)
      dispatch({
        type: LIST_PRODUCT,
        payload: updated,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const findProductAction =
  (data) => async (dispatch) => {
    try {
      const res = await Productservice.findProduct(data);
      if (res.status === 200) {
        dispatch({
          type: GET_INVENTORY_SALES_PRODUCT,
          payload: res.data,
        });
      }

    } catch (err) {
      ErrorAlert(dispatch, err);
    }
  };

  export const productListAction =
  () => async (dispatch) => {
    try {
      const res = await Productservice.grProductList();
      if (res.status === 200) {
        dispatch({
          type: PRODUCT_LIST,
          payload: res.data,
        });
      }

    } catch (err) {
      ErrorAlert(dispatch, err);
    }
  };

  export const categoryBasedOnBrandAction =
  (data) => async (dispatch) => {
    try {
      const res = await Productservice.categoryBasedOnBrand(data);
      if (res.status === 200) {
        dispatch({
          type: CATEGORY_BASED_ON_BRAND,
          payload: res.data,
        });
      }

    } catch (err) {
      ErrorAlert(dispatch, err);
    }
  };

  
export const grProductListAction = (data, response) => async (dispatch) => {
  try {
    const res = await Productservice.grProductList(data)

    if (res.status === 200) {
      dispatch({
        type: SET_LIST_GR_PRODUCT,
        payload: res.data,
      });
      if(response) {
        response()
      }
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
}; 

export const getSearchProductAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type : GET_LIST_GR_PRODUCT,
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };
 
export const setSearchProductListAction = (data) => {
    return {
      type : SET_LIST_GR_PRODUCT,
      payload : data
    }
};

export const deletegrproductAction = (
 id,
  setModalTypeHandler,
  setLoaderStatusHandler) =>
async (dispatch) => {
  try {
    ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await Productservice.deletegrproduct(id)

    if (res.status === 200 && res.data?.status == "Product Deleted") {
      dispatch({
        type: DELETE_GR_PRODUCT,
        payload: id,
      });
    }
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
}; 

export const changeProductHsnCodeDescriptionAction = (payload) => async(dispatch) => {
  try{
    const res = await Productservice.changeProductHsnCodeDescription(payload)
    if(res.status === 200){
      dispatch({
        type: LIST_PRODUCT,
        payload: res.data
      })
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const getProductByLotNumberSearchAction = (body, setModalTypeHandler, setLoaderStatusHandler, response) => {
  return {
      type : GET_PRODUCT_BY_LOT_NUMBER,
      body,
      setModalTypeHandler,
      setLoaderStatusHandler,
      response
    }
}

export const productBulkUploadAction = (data, response) => async(dispatch) => {
  try{
    const res = await Productservice.productBulkUpload(data)
    if(res.status === 200){
      if(res.data.existingProduct){
        if(response){
          response(res.data.existingProduct)
        }
      }
      else{
        dispatch({
          type: LIST_PRODUCT,
          payload: res.data
        })
      }
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const getProductTimelineAction = (id) => async (dispatch) => {
  try {
    const res = await Productservice.getProductTimeline(id);
    dispatch({
      type: PRODUCT_TIMELINE,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};