import { LIST_PRODUCT_BY_TYPE } from 'redux/actionTypes';
import {
  ListLoad,
  FailLoad,
  ErrorAlert,
  CreateAlert,
  successmsg,
  errormsg,
  UpdateAlert,
  DeleteAlert,
  commontoast,
} from './load';

export const createAction = async (
  service,
  actionTypes,
  dispatch,
  data,
  setModalStatusHandler,
  setselectData,
  setModalTypeHandler,
  setLoaderStatusHandler,
  sample,
  type,
  setDisable,
  response,
  custData
) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await service.create(data);
   // console.log(res?.data?.status,'ersrf');
    if (res.data.status === 'exists') {
      ErrorAlert(dispatch, {message: 'Already Exists'});
      return
    }
    // data: Object { status: "exists" }
    if (setDisable) {
      setDisable(false);
    }
    if (response) {
        response(res);
    }
    if(custData){
      custData(res)
    }
    if ((type === 'NewVendor' || type === 'NewCustomer') ? (res.status === 200 && res.data.status !== 'exists' && res.data !== 'Phone Number Already Exists') : 
    res.status === 200 ) {
    
    await dispatch({
        type: actionTypes,
        payload:  res.data.data ||  res.data,
      });
      // if (type === 'product') {
        await dispatch({
          type: LIST_PRODUCT_BY_TYPE,
          payload:  res.data.data ||  res.data,
        });
     // }

      //FailLoad(setModalTypeHandler, setLoaderStatusHandler)

      if (setModalStatusHandler) {
        await setselectData(type, true);
      }

      if(res.data.status === 'exists'){
        ErrorAlert(dispatch, {message: 'Already Exists'});
        // sample(true)
      }
      
      if (res.data === 'Phone Number Already Exists' || res.data.status === 'Phone Number Already Exists') {
        ErrorAlert(dispatch, { message: 'Phone Number Already Exists' });
      } else if (res.data === 'Company Name Already Exists') {
        ErrorAlert(dispatch, { message: 'Company Name Already Exists' });
      } else if (res.data === 'Phone Number and Company Name Already Exists') {
        ErrorAlert(dispatch, { message: 'Phone Number and Company Name Already Exists' });
      }
      else {
        if (res.data && res.data.data && res.data?.data[0]?.item_id) {
          sample(false, res.data.data[0].item_id)
        }else{
          sample(false)
        }
        // else{
        //   sample(false)
        // }
        if (typeof res.data === 'object' && 'data' in res.data) {
          dispatch({
            type: actionTypes,
            payload: res.data.data,
          })
        } else {
          dispatch({
            type: actionTypes,
            payload: res.data,
          });
        }
  
        CreateAlert(dispatch);

      }
      // FailLoad(
      //   setModalTypeHandler,
      //   setLoaderStatusHandler,
      //   setModalStatusHandler,
      // );
      // setTimeout(() => {
      
      // }, 0);
      //  successmsg(sample);
    
    } else if (res.data.status === 'exists') {
      ErrorAlert(dispatch, {message: 'Already Exists'});
      errormsg(sample);
      // FailLoad(
      //   setModalTypeHandler,
      //   setLoaderStatusHandler,
      //   setModalStatusHandler,
      // );
      // alertResponce("Already Exists", 'error')
    }
    else {
      ErrorAlert(dispatch, {message: res.data})
      errormsg(sample);
    }
    //    return Promise.resolve(res.data.data);
     return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    // FailLoad(
    //   setModalTypeHandler,
    //   setLoaderStatusHandler,
    //   setModalStatusHandler,
    // );
    ErrorAlert(dispatch, err);
    errormsg(sample);
    if (setDisable) {
      setDisable(false);
    }
    //   return Promise.reject(err);

    //  }
    return Promise.reject("API_FINISHED_ERROR");
  }
};



export const updateAction = async (
  service,
  actionTypes,
  dispatch,
  id,
  data,
  setModalTypeHandler,
  setLoaderStatusHandler,
  sample,
  response
  
) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await service.update(id, data);
    if (res.status === 200) {
      UpdateAlert(dispatch);
      dispatch({
        type: actionTypes,
        payload: res.data.data,
      });
      if (response) {
        response(res);
      }
      successmsg(sample);
      //  FailLoad(setModalTypeHandler,setLoaderStatusHandler)
    }
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    //  return true
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
   
     if (err.response && err.response.status === 400) {
        // const message =
        //     // err.response.data?.message ||
        //     'Cannot edit amount lower than received';

        // ErrorAlert(dispatch, message);
        ErrorAlert(dispatch, {message: 'Cannot edit amount lower than received'})
        //errormsg(message);
        return;
    }
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    ErrorAlert(dispatch, err);
    errormsg(sample);
    //  return false
    // }
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const deleteAction = async (
  service,
  actionTypes,
  dispatch,
  id,
  setModalTypeHandler,
  setLoaderStatusHandler,
) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await service.delete(id);
    // if (res.status === 200 && res.statusText === "OK"){
    if (res.data === "RES") {
      ErrorAlert(dispatch, {message: 'This location cannot be deleted.'});
    } 
    else if(res.data === "RES1"){
      ErrorAlert(dispatch, {message: 'You cannot able to delete location.'});
    }else {
      DeleteAlert(dispatch);
    }
    dispatch({
      type: actionTypes,
      payload: res.data.data,
    });
    // }
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    return Promise.resolve(res.data.data);
  } catch (err) {
    console.log('err', err);
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    //}
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const commontoastAction = (data) => async (dispatch) => {
  console.log('dataaaa', data)
  commontoast(dispatch,data )
}
