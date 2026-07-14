import {
  CREATE_VENDOR,
  LIST_VENDOR,
  GET_ID_VENDOR,
  EDIT_VENDOR,
  DELETE_VENDOR,
  EDIT_CUSTOMER,
  CREATE_CUSTOMER,
  DELETE_CUSTOMER,
  LIST_VENDOR_ID_NAME,
  GET_VENDOR_PRICE_LIST,
  VENDOR_PRICE_LIST_DROP_DOWN,
  VENDOR_PRICE_LIST_PRODUCT,
  ADDITIONAL_CONTACTS_VENDOR,
  SHIPPING_ADDRESS_VENDOR,
  EDIT_SHIPPING_ADDRESS_VENDOR,
  PO_TEMP,
  GET_SEARCH_BY_VENDOR
} from '../actionTypes';
import Vendorservice from '../../services/vendor_services';
import {ListLoad, FailLoad, ErrorAlert, DeleteAlert, CreateAlert, UpdateAlert, linkEstablished, unlinkedSuccess} from './load';
import {createAction, deleteAction, updateAction} from './actions';

export const createVendorAction =
  (
    data,
    setModalStatusHandler,
    setselectData,
    setModalTypeHandler,
    setLoaderStatusHandler,
    sample,
    response
  ) =>
  async (dispatch) => {
    return createAction(
      Vendorservice,
      CREATE_VENDOR,
      dispatch,
      data,
      setModalStatusHandler,
      setselectData,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
      'NewVendor',
      ()=>{},
      response

    );
  };

export const listVendorAction =
  (setModalTypeHandler, setLoaderStatusHandler,response,response1) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Vendorservice.getAll();
      if (res.status === 200) {
        dispatch({
          type: LIST_VENDOR,
          payload: res.data,
        });
        if(response){
          response(res.status)
        }
        if(response1){
          response1(res.data)
        }
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const listVendorIdAndNameAction =
  (response) => async (dispatch) => {
    try {
      const res = await Vendorservice.getVendorIdAndName();
      if (res.status === 200) {
        dispatch({
          type: LIST_VENDOR_ID_NAME,
          payload: res.data,
        });
        if(response){
          response(res.data)
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getSupplierDetailsByIdAction =
  (supplierId, setSupplierDetails) => async (dispatch) => {
    try {
      const res = await Vendorservice.getSupplierDetailsById(supplierId);
      if (res.status === 200) {
        setSupplierDetails(res.data)
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getSupplierDetailsByIdreceivings_itemsAction =
  (supplierId,data, response) => async (dispatch) => {
    try {
      dispatch({
        type: PO_TEMP,
        payload: [],
      });
      const res = await Vendorservice.getSupplierDetailsByIdwithreceivings_items(supplierId,data);
      if (res.status === 200) {
        dispatch({
          type: PO_TEMP,
          payload: res.data,
        });
        if( response) {
        response(res.data)
       }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getbyidVendorAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Vendorservice.get(id);
      dispatch({
        type: GET_ID_VENDOR,
        payload: res.data,
      });
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve(res.data);
    } catch (err) {
      // if(err.response?.status === 500) {
      //   getbyidToken(Vendorservice, GET_ID_VENDOR, dispatch, id)
      // }
      // else{
      ErrorAlert(dispatch, err);
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      // }
    }
  };

  export const setbyidVendorAction = (data) => {
      return {
        type : GET_ID_VENDOR,
        payload : data
      }
  }

export const updateVendorAction =
  (id, data, setModalTypeHandler, setLoaderStatusHandler, sample) =>
  async (dispatch) => {
    updateAction(
      Vendorservice,
      EDIT_CUSTOMER,
      dispatch,
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    );
    // try {
    //   ListLoad(setModalTypeHandler,setLoaderStatusHandler)
    //   const res = await Vendorservice.update(id, data);
    //    if(res.data.affectedRows === 1){
    //    UpdateAlert(dispatch)
    //   dispatch({
    //     type: EDIT_VENDOR,
    //     payload:res.data.data,
    //   });
    //   successmsg(sample)
    // //  FailLoad(setModalTypeHandler,setLoaderStatusHandler)
    // }
    //     FailLoad(setModalTypeHandler,setLoaderStatusHandler)
    //   //  return true
    // } catch (err) {
    //   FailLoad(setModalTypeHandler,setLoaderStatusHandler)
    //   ErrorAlert(dispatch,err)
    //   errormsg(sample)
    // //  return false
    //   // }
    // }
  };

// export const deleteVendorAction =
//   (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
//     deleteAction(
//       Vendorservice,
//       DELETE_CUSTOMER,
//       dispatch,
//       id,
//       setModalTypeHandler,
//       setLoaderStatusHandler,
//     );
//     // try {
//     //   ListLoad(setModalTypeHandler,setLoaderStatusHandler)
//     //   const res = await Vendorservice.delete(id);
//     //   if(res.status===200 && res.statusText === "OK")
//     //   DeleteAlert(dispatch)
//     //   dispatch({
//     //     type: DELETE_VENDOR,
//     //     payload:res.data.data,
//     //   });
//     //   FailLoad(setModalTypeHandler,setLoaderStatusHandler)
//     //   return Promise.resolve(res.data.data);
//     // } catch (err) {
//     //  FailLoad(setModalTypeHandler,setLoaderStatusHandler)
//     //  ErrorAlert(dispatch,err)
//     //   // }
//     // }
//   };

  export const deleteVendorAction =
  (data,setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler)
      const res = await Vendorservice.delete(data);
      if (res.status === 200) {
        dispatch({
          type: DELETE_VENDOR,
          payload: res.data,
        });
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        DeleteAlert(dispatch)
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const bulkSupplierCreate =
  (data,setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
    try {
      const res = await Vendorservice.bulkSupplier(data);
      if (res.status === 200) {
        CreateAlert(dispatch);
        dispatch({
          type: LIST_VENDOR,
          payload: res.data,
        });
        if (response) {
          response(res.status, res);
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const vendorPriceListAction =
  (data) => async (dispatch) => {
    try {
      const res = await Vendorservice.vendorPriceList(data);
      if (res.status === 200) {
        dispatch({
          type: GET_VENDOR_PRICE_LIST,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const createVendorPriceListAction =
  (data) => async (dispatch) => {
    try {
      const res = await Vendorservice.createVendorPriceList(data);
      if (res.status === 200) {
        dispatch({
          type: GET_VENDOR_PRICE_LIST,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const updateVendorPriceListAction =
  (id,data) => async (dispatch) => {
    try {
      const res = await Vendorservice.updateVendorPriceList(id, data);
      if (res.status === 200) {
        dispatch({
          type: GET_VENDOR_PRICE_LIST,
          payload: res.data,
        });
        UpdateAlert(dispatch);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const vendorPriceListDropDownAction =
  () => async (dispatch) => {
    try {
      const res = await Vendorservice.vendorPriceListDropDown();
      if (res.status === 200) {
        dispatch({
          type: VENDOR_PRICE_LIST_DROP_DOWN,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  
export const filterPriceListProductAction =
  (payload, result) => async (dispatch) => {
    try {
      const res = await Vendorservice.getLatestProductPrice(payload);
      if (res.status === 200) {
        dispatch({
          type: VENDOR_PRICE_LIST_PRODUCT,
          payload: res.data,
        });
        if (result) {
          result(res.data);
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const additionalContactsForVendorAction =
  (payload, result) => async (dispatch) => {
    try {
      const res = await Vendorservice.additionalContactsForVendor(payload);
      if (res.status === 200) {
        dispatch({
          type: ADDITIONAL_CONTACTS_VENDOR,
          payload: res.data,
        });
        if (result) {
          result(res.data);
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const shippingAddressForVendorAction =
  (payload, result) => async (dispatch) => {
    try {
      const res = await Vendorservice.shippingAddressForVendor(payload);
      if (res.status === 200) {
        dispatch({
          type: SHIPPING_ADDRESS_VENDOR,
          payload: res.data,
        });
        if (result) {
          result(res.data);
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const editShippingAddressForVendorAction =
  (shipping_id,data,response) => async (dispatch) => {
    try {
      const res = await Vendorservice.editShippingAddressForVendor(shipping_id,data);
      if (res.status === 200) {
        dispatch({
          type: EDIT_SHIPPING_ADDRESS_VENDOR,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const setInvoiceTempAction = (data) => async (dispatch) => {
    try {
      dispatch({
        type: PO_TEMP,
        payload: [],
      });
      if (data) {
        dispatch({
          type: PO_TEMP,
          payload: data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const linkVendorToCustomerAction = (payload) => async(dispatch) => {
  try{
    const res = await Vendorservice.linkVendorToCustomer(payload)
    if(res.status === 200){
      linkEstablished(dispatch)
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const unlinkVendorToCustomerAction = (payload) => async(dispatch) => {
  try{
    const res = await Vendorservice.unlinkCustomer(payload)
    if(res.status === 200){
      unlinkedSuccess(dispatch)
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

  export const clearInvoiceTempAction = () => {
      return {
        type : PO_TEMP,
        payload : []
      }
  }

export const getVendorExpensesAction = (id, response) => async(dispatch) => {
  try{
    const res = await Vendorservice.getVendorExpenses(id)
    if(response){
      response(res)
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const getSearchByVendorDataAction = (data) => async (dispatch) => {
  try {
    const res = await Vendorservice.getSearchByVendorData(data)
    if(res.status === 200) {
      dispatch({
        type: LIST_VENDOR_ID_NAME,
        payload: res.data
      })
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  }
  catch(err) {
    ErrorAlert(dispatch, err)
    return Promise.resolve('API_FINISHED_ERROR')
  }
}

export const getSearchByVendorAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type : GET_SEARCH_BY_VENDOR,
    body,
    setModalTypeHandler,
    setLoaderStatusHandler
  }
}

export const setSearchByVendorDataAction = (data) => {
    return {
        type : LIST_VENDOR_ID_NAME,
        payload : data
    }
}

export const getPurchaseSuppliersByIdAction = (id, response) => async (dispatch) => {
  try {
    const res = await Vendorservice.getPurchaseSuppliersById(id)
    if(res.status === 200) {
      dispatch({
        type: LIST_VENDOR_ID_NAME,
        payload: res.data
      })
    }
    if(response) {
      response(res.data)
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  }
  catch(err) {
    ErrorAlert(dispatch, err)
    return Promise.resolve('API_FINISHED_ERROR')
  }
}

export const getVendosByIdDataAction = (id, response) => async (dispatch) => {
  try {
    const res = await Vendorservice.getVendosByIdData(id)
    if(res.status === 200) {
      dispatch({
        type: LIST_VENDOR,
        payload: res.data
      })
    }
    if(response) {
      response(res.data)
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  }
  catch(err) {
    ErrorAlert(dispatch, err)
    return Promise.resolve('API_FINISHED_ERROR')
  }
}
