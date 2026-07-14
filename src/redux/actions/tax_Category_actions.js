import {
  CREATE_TAX_CATEGORY,
  LIST_TAX_CATEGORY,
  GET_ID_TAX_CATEGORY,
  EDIT_TAX_CATEGORY,
  DELETE_TAX_CATEGORY,
} from '../actionTypes';
import TaxCategoryservice from '../../services/taxcategory_services';
import {
  DeleteAlert,
  ErrorAlert,
  CreateAlert,
  UpdateAlert,
  FailLoad,
  ListLoad,
} from './load';

export const createTaxCategoryAction =
  (data, setModalStatusHandler, setselectData) => async (dispatch) => {
    try {
      const res = await TaxCategoryservice.create(data);
      if (res.data.affectedRows === 1) {
        CreateAlert(dispatch);
        dispatch({
          type: CREATE_TAX_CATEGORY,
          payload: res.data.data,
        });
        if (setModalStatusHandler) {
          setModalStatusHandler(false);
          setselectData('taxcategory', true);
        }
        setTimeout(() => {
          CreateAlert(dispatch);
        }, 0);
      }
      return Promise.resolve(res.data.data);
    } catch (err) {
      // if(err.response?.status === 500) {
      //   createToken(TaxCategoryservice, CREATE_TAX_CATEGORY, dispatch, data, alertResponce)
      // }
      // else{
      ErrorAlert(dispatch, err);
      //return Promise.reject(err);
      // }
    }
  };

export const listTaxCategoryAction =
  (response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await TaxCategoryservice.getAll();
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if(res.status === 200 || res.status === 304){
      dispatch({
        type: LIST_TAX_CATEGORY,
        payload: res.data,
      });
     
      if(response){
        response(res.status)
      }
    }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // if(err.response?.status === 500) {
      //   getToken(TaxCategoryservice, LIST_TAX_CATEGORY, dispatch)
      // }else{
      ErrorAlert(dispatch, err);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getbyidTaxCategoryAction = (id) => async (dispatch) => {
  try {
    const res = await TaxCategoryservice.get(id);
    dispatch({
      type: GET_ID_TAX_CATEGORY,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    // if(err.response?.status === 500) {
    //   getbyidToken(TaxCategoryservice, GET_ID_TAX_CATEGORY, dispatch, id)
    // }
    // else{
    ErrorAlert(dispatch, err);
    // }
  }
};

export const updateTaxCategoryAction =
  (id, data, setModalStatusHandler, setselectData) => async (dispatch) => {
    try {
      // const auth = await Jwtservice.create();
      const res = await TaxCategoryservice.update(id, data);
      if (res.data.changedRows === 1) {
        dispatch({
          type: EDIT_TAX_CATEGORY,
          payload: res.data.data,
        });
        if (setModalStatusHandler) {
          setModalStatusHandler(false);
          setselectData('taxcategory', 'update');
        }
        setTimeout(() => {
          UpdateAlert(dispatch);
        }, 0);
      }
      return Promise.resolve(res.data.data);
    } catch (err) {
      // if(err.response?.status === 500) {
      //   updateToken(TaxCategoryservice, EDIT_TAX_CATEGORY, dispatch, data, id, alertResponce)
      // }
      // else{
      ErrorAlert(dispatch, err);
      //return Promise.reject(err);
      // }
    }
  };

export const deleteTaxCategoryAction =
  (id, setModalStatusHandler) => async (dispatch) => {
    try {
      const res = await TaxCategoryservice.delete(id);
      if (res.status === 200 && res.statusText === 'OK') DeleteAlert(dispatch);
      dispatch({
        type: DELETE_TAX_CATEGORY,
        payload: res.data.data,
      });
      if (setModalStatusHandler) {
        setModalStatusHandler(false);
        // setselectData('taxjurisdiction',true)
      }
      return Promise.resolve(res.data.data);
    } catch (err) {
      // if(err.response?.status === 500) {
      //   deleteToken(TaxCategoryservice, DELETE_TAX_CATEGORY, dispatch, id, alertResponce)
      // }
      // else{
      ErrorAlert(dispatch, err);
      // }
    }
  };

//   export const deleteAllTutorials = () => async (dispatch) => {

//     try {
//       const res = await TaxCategoryservice.deleteAll();

//       dispatch({
//         type: DELETE_ALL_TUTORIALS,
//         payload: res.data,
//       });

//       return Promise.resolve(res.data);
//     } catch (err) {
//       return Promise.reject(err);
//     }
//   };

//   export const findTutorialsByTitle = (title) => async (dispatch) => {

//     try {
//       const res = await TutorialDataService.findByTitle(title);

//       dispatch({
//         type: LIST_TAX_CATEGORY,
//         payload: res.data,
//       });
//     } catch (err) {
//     }
//   };
