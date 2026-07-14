import {
  CREATE_CUSTOMER,
  LIST_CUSTOMER,
  GET_ID_CUSTOMER,
  EDIT_CUSTOMER,
  DELETE_CUSTOMER,
  GET_ALL_CUSTOMER,
  GET_CUSTOMER_STATEMENT_BY_ID,
  GET_FILTER_LIST,
  GET_CUSTOMER_SALESMAN,
  SALESMAN_INSERT,
  LIST_SALESMAN,
  STARED_CHANGE,
  STARED_DETAILS_EDIT,
  GET_SEARCH_CONTACTS,
  PICK_CUSTOMER_GET_SEARCH_CONTACTS,
  SET_SEARCH_CONTACTS,
  PICK_CUSTOMER_SET_SEARCH_CONTACTS,
  CUSTOMER_AS_COMPANY,
  INVOICE_CUSTOMER,
  CUSTOMER_SALE_DETAILS,
  CUSTOMER_DETAILS,
  LIST_PICK_CUSTOMER,
  EMPLOYEE_DELETE,
  DP_IMAGE,
  FOLLOW_USER,
  FOLLOW_REQUEST_USER,
  LIST_FOLLOW_REQUEST,
  FOLLOW_LIST,
  ADDITIONAL_CONTACTS,
  ADDITIONAL_SHIPPING_ADDRESS,
  EDIT_ADDITIONAL_CONTACTS,
  EDIT_ADDITIONAL_SHIPPING_ADDRESS,
  CLIENT_DELETE,
  UPDATE_CREDIT_DAYS,
  GET_CUSTOMER_OUTSTANDING,
  OUTSTANDING_BY_CUSTOMER,
  GET_CUSTOMER_OUTSTANDING_DUES,
  CUSTOMER_INVOICE,
  SET_CUSTOMER_INVOICE,
  SET_CUSTOMER_PAYMENT,
  CUSTOMER_PAYMENT,
  CUSTOMER_DELIVERY_CHALLAN,
  SET_CUSTOMER_DELIVERY_CHALLAN,
  SET_CUSTOMER_QUOTES,
  CUSTOMER_QUOTES,
  SET_CUSTOMER_CREDIT_NOTE,
  CUSTOMER_CREDIT_NOTE,
  RESET_OUTSTANDING_BY_CUSTOMER,
  RESET_GET_CUSTOMER_STATEMENT_BY_ID,
  SHARE_OUTSTANDING_REPORT,
  OUTSTANDING_REPORT_TEMP,
  LIST_SELECT_CUSTOMER,
  GET_UPDATE_OTHER_DETAILS,
  EDIT_CUSTOMERS,
  CUST_ADDRESS_UPDATE,
  CUST_GST_UPDATE,
  CUST_PORTAL_UPDATE,
  GET_SEARCH_BY_CUSTOMER,
  GET_SEARCH_BY_CUSTOMER_SALESMAN,
  GET_SEARCH_BY_CUSTOMER_SUPPLIER
} from '../actionTypes';
import Customerservice from '../../services/customer_services';
import {getbyidToken} from './common_actions';
import {ListLoad, FailLoad, ErrorAlert, UpdateAlert, DeleteAlert, CreateAlert, CannotDeleteAlert, successmsg, OutStandingReportAlert} from './load';
import {createAction, deleteAction, updateAction} from './actions';

export const createCustomerAction =
  (
    data,
    setModalStatusHandler,
    setselectData,
    setModalTypeHandler,
    setLoaderStatusHandler,
    sample,
    response,
    custData
  ) =>
  async (dispatch) => {
    return createAction(
      Customerservice,
      CREATE_CUSTOMER,
      dispatch,
      data,
      setModalStatusHandler,
      setselectData,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
      'NewCustomer',
      ()=>{},
      response,
      custData
    );
  };

export const listCustomerAction =
  (setModalTypeHandler, setLoaderStatusHandler,response,response1) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler)
      const res = await Customerservice.getAll();
      if (res.status === 200) {
        dispatch({
          type: LIST_CUSTOMER,
          payload: res.data,
        });
        if(response){
          response(res.status)
        }
        if(response1){
          response1(res.data)
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
      //}
    }
  };

  export const listPickCustomerAction =
  (data, setModalTypeHandler, setLoaderStatusHandler,response) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler)
      const res = await Customerservice.getAllPickCustomer(data);
      if (res.status === 200) {
        dispatch({
          type: LIST_PICK_CUSTOMER,
          payload: res.data,
        });
        if(response){
          response(res.status)
        }
        
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
      //}
    }
  };

  export const updateAdditionalContactAction = (data) => async (dispatch) => {
    try {
      const res = await Customerservice.updateAdditionalContact(data);
      if (res.status === 200) {
        dispatch({
          type: LIST_SELECT_CUSTOMER,
          payload: res.data,
        });
        if(response){
          response(res.status)
        }
        
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const updateShippingAddressAction = (data) => async (dispatch) => {
    try {
      const res = await Customerservice.updateShippingAddress(data);
      if (res.status === 200) {
        dispatch({
          type: LIST_SELECT_CUSTOMER,
          payload: res.data,
        });
        if(response){
          response(res)
        }
        
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const updateBankDetailsAction = (data) => async (dispatch) => {
    try {
      const res = await Customerservice.updateBankDetails(data);
      if (res.status === 200) {
        dispatch({
          type: LIST_SELECT_CUSTOMER,
          payload: res.data,
        });
        if(response){
          response(res)
        }
        
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const updateCreditDaysAction =
  (data, setModalTypeHandler, setLoaderStatusHandler,response) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler)
      const res = await Customerservice.updateCreditDays(data);
      if (res.status === 200) {
        dispatch({
          type: UPDATE_CREDIT_DAYS,
          payload: res.data,
        });
        if(response){
          response(res.data)
        }
        
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
      //}
    }
  };

  export const getCustomerOutstandingDetailsAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler)
      const res = await Customerservice.getCustomerOutstandingDetails(data);
      if (res.status === 200) {
        dispatch({
          type: GET_CUSTOMER_OUTSTANDING,
          payload: res.data,
        });  
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
      //}
    }
  };

  export const getCustomerOutstandingDetailsDuesAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler)
      const res = await Customerservice.getCustomerOutstandingDetailsDues(data);
      if (res.status === 200) {
        dispatch({
          type: GET_CUSTOMER_OUTSTANDING_DUES,
          payload: res.data,
        });  
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
      //}
    }
  };

  export const listcustomerinvoice =
  (id, setModalTypeHandler, setLoaderStatusHandler,response) => async (dispatch) => {
    try {
     // ListLoad(setModalTypeHandler, setLoaderStatusHandler)
      const res = await Customerservice.getinvoice(id);
      if (res.status === 200) {
        dispatch({
          type: INVOICE_CUSTOMER,
          payload: res.data,
        });
        if(response){
          response(res.status)
        }
        
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
     // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    } catch (err) {
    //  FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
      //}
    }
  };

  export const listCustomerSalesManAction =
  (data,setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler)
      const res = await Customerservice.salesmanMaping(data);
      if (res.status === 200) {
        dispatch({
          type: GET_CUSTOMER_SALESMAN,
          payload: res.data,
        });
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        return res;
      }
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const updateShippingDetailAction =
  (data, cb) => async (dispatch) => {
    try {
      const res = await Customerservice.customershippingDetail(data);
      if (res.status === 200) {
        cb()        
      }
      return res;
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const bulkCustomercreate =
  (data,body,setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler)
      const res = await Customerservice.bulkcustomer(data,body);
      if (res.status === 200) {
        CreateAlert(dispatch);
        // dispatch({
        //   type: SALESMAN_INSERT,
        //   payload: res.data.getcustomersalesman,
        // });
        dispatch({
          type: SET_SEARCH_CONTACTS,
          payload: res.data,
        });
        if (response) {
          response(res.status, res);
        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        return res;
      }
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const SalesmaninsertAction =
  (data,setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler)
      const res = await Customerservice.salesmaninsert(data);
      if (res.status === 200) {
        UpdateAlert(dispatch);
        dispatch({
          type: SALESMAN_INSERT,
          payload: res.data.getcustomersalesman,
        });
        dispatch({
          type: LIST_SALESMAN,
          payload: res.data.customer_mapping,
        });
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const ListsalesmanAction =
  (data,setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler)
      const res = await Customerservice.listsalesman(data);
      if (res.status === 200) {
        dispatch({
          type: LIST_SALESMAN,
          payload: res.data,
        });
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
export const listCustomerStatementAction =
  (id, data,setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      dispatch({
          type: RESET_GET_CUSTOMER_STATEMENT_BY_ID,
          payload: [],
        });
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Customerservice.getAllStatement(id, data);
      if (res.status === 200) {
        dispatch({
          type: GET_CUSTOMER_STATEMENT_BY_ID,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getUpdateOtherDetailsAction =
  (data,setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await Customerservice.getUpdateOtherDetails(data);
      if (res.status === 200) {
        dispatch({
          type: GET_UPDATE_OTHER_DETAILS,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

// export const getCustomerStatementAction = (id, data,setModalTypeHandler,setLoaderStatusHandler,sample) => async (dispatch) => {

//   updateAction(Customerservice, EDIT_CUSTOMER, dispatch, id, data,setModalTypeHandler,setLoaderStatusHandler,sample)

// }

export const getAllCustomerAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Customerservice.getAllDate();
      if (res.status === 200) {
        dispatch({
          type: GET_ALL_CUSTOMER,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getbyidCustomerAction =
  (id, response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Customerservice.get(id);
      if (res.status === 200) { 

        dispatch({
          type: GET_ID_CUSTOMER,
          payload: res.data,
        });
        if (response) {
          response(res.data)
        }
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve(res.data);
    } catch (err) {
      if (err.response?.status === 500) {
        getbyidToken(Customerservice, GET_ID_CUSTOMER, dispatch, id);
      } else {
        ErrorAlert(dispatch, err);
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.reject("API_FINISHED_ERROR");

    }
  };

  export const setbyidCustomerAction = (data) => {
      return {
        type : GET_ID_CUSTOMER,
        payload : data
      }
  }

export const updateCustomerAction =
  (id, data, setModalTypeHandler, setLoaderStatusHandler, sample, response) =>
  async (dispatch) => {
    // response()
    // return updateAction(
    //   Customerservice,
    //   EDIT_CUSTOMERS,
    //   dispatch,
    //   id,
    //   data,
    //   setModalTypeHandler,
    //   setLoaderStatusHandler,
    //   sample,
    //   response
    // );
    try {
      ListLoad(setModalTypeHandler,setLoaderStatusHandler)
      const res = await Customerservice.update(id, data);
   
      if (res.status === 200){
      UpdateAlert(dispatch)
      dispatch({
        type: EDIT_CUSTOMERS,
        payload: res.data.data,
      });
      successmsg(sample)
       if (response) {
        response(res);
      }
    }
   // FailLoad(setModalTypeHandler,setLoaderStatusHandler)
      return Promise.resolve(res.data.data);
    } catch (err) {
    
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);

    if (err.response && err.response.status === 400) {
        // const message =
        //     // err.response.data?.message ||
        //     'Cannot edit amount lower than received';

        // ErrorAlert(dispatch, message);
        ErrorAlert(dispatch, {message: 'Cannot edit amount lower than received'})
        //errormsg(message);
        return;
    }

    // fallback (network / server crash)
    ErrorAlert(dispatch, 'Something went wrong');
}
  };

// export const deleteCustomerAction =
//   (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
//     deleteAction(
//       Customerservice,
//       DELETE_CUSTOMER,
//       dispatch,
//       id,
//       setModalTypeHandler,
//       setLoaderStatusHandler,
//     );
//     // try {
//     //   ListLoad(setModalTypeHandler,setLoaderStatusHandler)
//     //   const res = await Customerservice.delete(id);
//     //   if (res.status === 200 && res.statusText === "OK"){
//     //   DeleteAlert(dispatch)
//     //   dispatch({
//     //     type: DELETE_CUSTOMER,
//     //     payload: res.data.data,
//     //   });
//     //   }
//     //   FailLoad(setModalTypeHandler,setLoaderStatusHandler)
//     //   return Promise.resolve(res.data.data);
//     // } catch (err) {
//     //     FailLoad(setModalTypeHandler,setLoaderStatusHandler)
//     //     ErrorAlert(dispatch,err)
//     //   //}
//     // }
//   };
export const deleteCustomerAction =
  (data,setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await Customerservice.delete(data);
      if(res.data.message && res.data.message === 'CANNOT DELETE'){
        CannotDeleteAlert(dispatch, res.data);
      }
      if (res.status === 200 && res.data.message !== 'CANNOT DELETE') {
        dispatch({
          type: DELETE_CUSTOMER,
          payload: res.data,
        });
        DeleteAlert(dispatch)
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      if(err.response.data.message === 'CANNOT DELETE'){
        CannotDeleteAlert(dispatch, err.response.data)
      }
      else{
        ErrorAlert(dispatch, err);
      }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const employeeDeleteAction =
  (person_id,setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await Customerservice.employeeDelete(person_id);
      dispatch({
        type: EMPLOYEE_DELETE,
        payload: res.data,
      });
      DeleteAlert(dispatch)
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const clientDeleteAction =
  (person_id,setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await Customerservice.clientDelete(person_id);
      dispatch({
        type: CLIENT_DELETE,
        payload: res.data,
      });
      DeleteAlert(dispatch)
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const FilterAction =
  (type, type_details, setModalTypeHandler, setLoaderStatusHandler, exportDataCallBack) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Customerservice.getFilterCustomer(type, type_details);
      if (res.status === 200) {
        dispatch({
          type: GET_FILTER_LIST,
          payload: res.data,
        });
        if (exportDataCallBack) {
          exportDataCallBack(res.data);
        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (exportDataCallBack) {
        exportDataCallBack([]);
      }
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
      //}
    }
  };

export const StaredUpdateAction =
  (staredid,person_id,setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler)
      const res = await Customerservice.staredchange(staredid, person_id);
      if (res.status === 200) {
        dispatch({
          type: STARED_CHANGE,
          payload: res.data,
        });
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        UpdateAlert(dispatch)
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const StaredDetailsAction =
  (data,setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler)
      const res = await Customerservice.starededitdetails(data);
      if (res.status === 200) {
        dispatch({
          type: STARED_DETAILS_EDIT,
          payload: res.data,
        });
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
       // UpdateAlert(dispatch)
       return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


export const get_searchContactsAction = (val, setModalTypeHandler, setLoaderStatusHandler, response) => {
    return {
      type:GET_SEARCH_CONTACTS,
      data:val,
      setModalTypeHandler, 
      setLoaderStatusHandler,
      response
    }
  };
  
  export const get_searchPickcustomerContactsAction = (val, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type:PICK_CUSTOMER_GET_SEARCH_CONTACTS,
      data:val,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

  export const set_searchContactsAction = (data) => {
    return {
      type: SET_SEARCH_CONTACTS,
      payload:data
    }
  };

  export const set_searchPickcustomerContactsAction = (data) => {
    return {
      type: PICK_CUSTOMER_SET_SEARCH_CONTACTS,
      payload:data
    }
  };


  export const customerAsCompanyAction = () => async (dispatch) => {
    try {
      const res = await Customerservice.customerAsCompany();
      if (res.status === 200) {
        dispatch({
          type: CUSTOMER_AS_COMPANY,
          payload: res.data,
        });
       return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  
  export const get_searchContactsActionFinal = (data,setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await Customerservice.customerallPaginate(data);
      if (res.status === 200) {
        dispatch({
          type: SET_SEARCH_CONTACTS,
          payload: res.data,
        });
       return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
};
  
  export const getCusCompanyNameAction = (data,setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await Customerservice.customerCompanyName(data);
      if (res.status === 200) {
        dispatch({
          type: SET_SEARCH_CONTACTS,
          payload: res.data,
        });
       return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
};
  
  export const customerSalesDetailAction = (customer_id, employeeId) => async (dispatch) => {
    try {
      const res = await Customerservice.customerSalesDetailById(customer_id, employeeId);
      if (res.status === 200) {
        dispatch({
          type: CUSTOMER_SALE_DETAILS,
          payload: res.data,
        });
       return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
};
  
  export const customerDetailByIdAction = (customer_id, response) => async (dispatch) => {
    try {
      const res = await Customerservice.customerDetailById(customer_id);
      if (res.status === 200) {
        dispatch({
          type: CUSTOMER_DETAILS,
          payload: res.data,
        });
        if(response){
          response(res.data)
        }
       return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const imageUpload = (data, response) => async (dispatch) => {
    try {
      const res = await Customerservice.imageUpload(data);
      if (res.status === 200) {
        dispatch({
          type: DP_IMAGE,
          payload: res.data,
        });
        if(response){
          response(res.status)
        }
       return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
};
  

export const followUserAction = (data) => async (dispatch) => {
  try {
    const res = await Customerservice.followUser(data);
    if (res.status === 200) {
      dispatch({
        type: FOLLOW_USER,
        payload: res.data,
      });
     return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const getUpdatedFollowersList = () => async (dispatch) => {
  try {
    const res = await Customerservice.followList();
    if (res.status === 200) {
      dispatch({
        type: FOLLOW_LIST,
        payload: res.data,
      });
     return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};


export const sendFollowRequestAction = (data) => async (dispatch) => {
  try {
    const res = await Customerservice.requestflw(data);
    if (res.status === 200) {
      dispatch({
        type: FOLLOW_REQUEST_USER,
        payload: res.data,
      });
     return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};


export const GetfollowRequestAction = (data) => async (dispatch) => {
  try {
    const res = await Customerservice.listfollow(data);
    if (res.status === 200) {
      dispatch({
        type: LIST_FOLLOW_REQUEST,
        payload: res.data,
      });
     return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const AcceptReqDelAction = (data) => async (dispatch) => {
  try {
    const res = await Customerservice.acceptfollow(data);
    if (res.status === 200) {
      dispatch({
        type: LIST_FOLLOW_REQUEST,
        payload: res.data,
      });
     return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const additionalContactsAction = (data,response) => async (dispatch) => {
  try {
    const res = await Customerservice.additionalContacts(data);
    if (res.status === 200) {
      CreateAlert(dispatch);
      dispatch({
        type: ADDITIONAL_CONTACTS,
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

export const additionalShippingAddressAction = (data,response) => async (dispatch) => {
  try {
    const res = await Customerservice.additionalShippingAddress(data);
    if (res.status === 200) {
      CreateAlert(dispatch);
      dispatch({
        type: ADDITIONAL_SHIPPING_ADDRESS,
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

export const editAdditionalContactsAction = (id,data,response) => async (dispatch) => {
  try {
    const res = await Customerservice.editAdditionalContacts(id,data);
    if (res.status === 200) {
      UpdateAlert(dispatch);
      dispatch({
        type: EDIT_ADDITIONAL_CONTACTS,
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

export const EditAdditionalShippingAddressAction = (id,data,response) => async (dispatch) => {
  try {
    const res = await Customerservice.EditAdditionalShippingAddress(id,data);
    if (res.status === 200) {
      UpdateAlert(dispatch);
      dispatch({
        type: EDIT_ADDITIONAL_SHIPPING_ADDRESS,
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

export const getOutstandingBasedOnCustomerAction = (customer_id,headerLocationId, payload) => async(dispatch) => {
  try{
    dispatch({
        type: RESET_OUTSTANDING_BY_CUSTOMER,
        payload: []
      })
    const res = await Customerservice.getOutstandingBasedOnCustomer(customer_id,headerLocationId, payload)
    if(res.status === 200){
      dispatch({
        type: OUTSTANDING_BY_CUSTOMER,
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

export const customerInvoiceAction = (data)=> async(dispatch)=>{
  try{
      const res = await Customerservice.customerInvoice(data)
      if(res.status === 200){
        dispatch({
          type : CUSTOMER_INVOICE,
          payload : res.data
        })
      }
  }
  catch(err){
    ErrorAlert(dispatch,err)
    return Promise.resolve('API_FINISHED_ERROR')
  }
}

export const setCustomerInvoiceAction = (data) => {
    return {
        type : CUSTOMER_INVOICE,
        payload : data
    }
}

export const getCustomerInvoiceAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
        type : SET_CUSTOMER_INVOICE,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}


export const CustomerpaymentAction = (data)=> async(dispatch)=>{
  try{
      const res = await Customerservice.Customerpayment(data)
      if(res.status === 200){
        dispatch({
          type : CUSTOMER_PAYMENT,
          payload : res.data
        })
      }
  }
  catch(err){
    ErrorAlert(dispatch,err)
    return Promise.resolve('API_FINISHED_ERROR')
  }
}

export const setCustomerpaymentAction = (data) => {
    return {
        type : CUSTOMER_PAYMENT,
        payload : data
    }
}

export const getCustomerpaymentAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
        type : SET_CUSTOMER_PAYMENT,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const CustomerDeliveryChallanAction = (data)=> async(dispatch)=>{
  try{
    const res =  await Customerservice.customerDeliverChallan(data)

    if(res.status === 200){

      dispatch({
        type : CUSTOMER_DELIVERY_CHALLAN,
        payload : res.data
      })
    }
    return Promise.resolve('API_FINISHED_SUCCESS')
  }
  catch(err){
    return Promise.reject('API_FINISHED_ERROR')
  }
}

export const setCustomerDeliveryChallan = (data)=> {
  return {
    type : CUSTOMER_DELIVERY_CHALLAN,
    payload : data
  }
}

export const getCustomerDeliveryChallanAction = (body,setModalTypeHandler,setLoaderStatusHandler)=>{
  return {
    type : SET_CUSTOMER_DELIVERY_CHALLAN,
    body,
    setModalTypeHandler,
    setLoaderStatusHandler
  }
}

export const customerQuotesAction = (data)=> async(dispatch)=>{
  try{
      const res = await Customerservice.customerQuotes(data)
      if(res.status === 200){
        dispatch({
          type : CUSTOMER_QUOTES,
          payload : res.data
        })
      }
  }
  catch(err){
    ErrorAlert(dispatch,err)
    return Promise.resolve('API_FINISHED_ERROR')
  }
}

export const setCustomerQuotesAction = (data) => {
    return {
        type : CUSTOMER_QUOTES,
        payload : data
    }
}

export const getCustomerQuotesAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
        type : SET_CUSTOMER_QUOTES,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const customerCreditNoteAction = (data)=> async(dispatch)=>{
  try{
      const res = await Customerservice.customerCreditNote(data)
      if(res.status === 200){
        dispatch({
          type : CUSTOMER_CREDIT_NOTE,
          payload : res.data
        })
      }
  }
  catch(err){
    ErrorAlert(dispatch,err)
    return Promise.resolve('API_FINISHED_ERROR')
  }
}

export const setCustomerCreditNoteAction = (data) => {
    return {
        type : CUSTOMER_CREDIT_NOTE,
        payload : data
    }
}

export const getCustomerCreditNoteAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
  console.log('customer_catossss')
    return {
        type : SET_CUSTOMER_CREDIT_NOTE,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
 
}

export const shippingdelete =
(id) => async (dispatch) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler)
    const res = await Customerservice.shippingdelete(id);
    if (res.status === 200) {
      // dispatch({
      //   type: UPDATE_CREDIT_DAYS,
      //   payload: res.data,
      // });
      // if(response){
      //   response(res.data)
      // }
      
      return Promise.resolve("API_FINISHED_SUCCESS");
    }
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
  } catch (err) {
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
    //}
  }
};

export const shareOutstandingReportAction = (data) => async (dispatch) => {
  try {
    const res = await Customerservice.shareOutstandingReport(data)
    if (res.status === 200) {
      dispatch({
        type: SHARE_OUTSTANDING_REPORT,
        payload: res.data
      })
      OutStandingReportAlert(dispatch);
    }
  }
  catch (err) {
    ErrorAlert(dispatch, err)
    return Promise.resolve('API_FINISHED_ERROR')
  }
}

export const outstandingShareAction = (customer_id, headerLocationId, data) => async (dispatch) => {
  try {
    const res = await Customerservice.outstandingShare(customer_id, headerLocationId, data)
    if (res.status === 200) {
      dispatch({
        type: OUTSTANDING_REPORT_TEMP,
        payload: res.data
      })
    }
  }
  catch (err) {
    ErrorAlert(dispatch, err)
    return Promise.resolve('API_FINISHED_ERROR')
  }
}

export const customerAddressUpdateAction = (data) => async (dispatch) => {
  try {
    const res = await Customerservice.custAddressUpdate( data)
    if (res.status === 200) {
      dispatch({
        type: CUST_ADDRESS_UPDATE,
        payload: res.data
      })
    }
  }
  catch (err) {
    ErrorAlert(dispatch, err)
    return Promise.resolve('API_FINISHED_ERROR')
  }
}

export const customerGstUpdateAction = (data) => async (dispatch) => {
  try {
    const res = await Customerservice.custGSTUpdate( data)
    if (res.status === 200) {
      dispatch({
        type: CUST_GST_UPDATE,
        payload: res.data
      })
    }
  }
  catch (err) {
    ErrorAlert(dispatch, err)
    return Promise.resolve('API_FINISHED_ERROR')
  }
}

export const customerPortalUpdateAction = (data) => async (dispatch) => {
  try {
    const res = await Customerservice.custportalUpdate( data)
    if (res.status === 200) {
      dispatch({
        type: CUST_PORTAL_UPDATE,
        payload: res.data
      })
    }
  }
  catch (err) {
    ErrorAlert(dispatch, err)
    return Promise.resolve('API_FINISHED_ERROR')
  }
}

export const getSearchByCustomersDataAction = (data) => async (dispatch) => {
  try {
    const res = await Customerservice.getSearchByCustomersData(data)
    if(res.status === 200) {
      dispatch({
        type: LIST_CUSTOMER,
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

export const getSearchBySalesmanCustomersAction = (data) => async (dispatch) => {
  try {
    const res = await Customerservice.getSearchBySalesmanCustomers(data)
    if(res.status === 200) {
      dispatch({
        type: LIST_CUSTOMER,
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

export const getSearchByCustomerSalesManAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type : GET_SEARCH_BY_CUSTOMER_SALESMAN,
    body,
    setModalTypeHandler,
    setLoaderStatusHandler
  }
}

export const getSearchByCustomerAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type : GET_SEARCH_BY_CUSTOMER,
    body,
    setModalTypeHandler,
    setLoaderStatusHandler
  }
}

export const setSearchByCustomersDataAction = (data) => {
    return {
        type : LIST_CUSTOMER,
        payload : data
    }
}


export const getSalesCustomersByIdAction = (id, response) => async (dispatch) => {
  try {
    const res = await Customerservice.getSalesCustomersById(id)
    if(res.status === 200) {
      dispatch({
        type: LIST_CUSTOMER,
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

export const getSearchByCustomerSupplierDataAction = (data, type) => async (dispatch) => {
  try {
    const res = await Customerservice.getSearchByCustomerSupplierData(data, type)
    if(res.status === 200) {
      dispatch({
        type: CUSTOMER_AS_COMPANY,
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

export const getSearchByCustomerSupplierAction = (body, types, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type : GET_SEARCH_BY_CUSTOMER_SUPPLIER,
    body,
    types,
    setModalTypeHandler,
    setLoaderStatusHandler
  }
}

export const setSearchByCustomerSupplierDataAction = (data) => {
    return {
        type : CUSTOMER_AS_COMPANY,
        payload : data
    }
}

export const getCustomerSupplierDataByIdAction = (type, id, response) => async (dispatch) => {
  try {
    const res = await Customerservice.getCustomerSupplierDataById(type, id)
    if(res.status === 200) {
      dispatch({
        type: CUSTOMER_AS_COMPANY,
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