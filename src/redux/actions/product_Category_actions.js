import {
  CREATE_PRODUCT_CATEGORY,
  LIST_PRODUCT_CATEGORY,
  GET_ID_PRODUCT_CATEGORY,
  EDIT_PRODUCT_CATEGORY,
  DELETE_PRODUCT_CATEGORY,
} from '../actionTypes';
import ProductCategoryService from '../../services/productcategory_services';
import {CreateAlert, DeleteAlert, ErrorAlert, UpdateAlert} from './load';

export const createProductCategoryAction = (data) => async (dispatch) => {
  try {
    const res = await ProductCategoryService.create(data);
    if (res.data.affectedRows === 1) CreateAlert(dispatch);
    dispatch({
      type: CREATE_PRODUCT_CATEGORY,
      payload: res.data.data,
    });

    return Promise.resolve(res.data.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject(err);
  }
};

export const listProductCategoryAction = () => async (dispatch) => {
  try {
    const res = await ProductCategoryService.getAll();
    //  let rem = await res.data.map((m) => {
    //   return delete m['tableData'] ? m :null
    // }).filter( (f) => f !==null )
    dispatch({
      type: LIST_PRODUCT_CATEGORY,
      payload: res.data,
    });
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const getbyidProductCategoryAction = (id) => async (dispatch) => {
  try {
    const res = await ProductCategoryService.get(id);
    dispatch({
      type: GET_ID_PRODUCT_CATEGORY,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
  }
};

export const updateProductCategoryAction = (id, data) => async (dispatch) => {
  try {
    const res = await ProductCategoryService.update(id, data);
    if (res.data.changedRows === 1) UpdateAlert(dispatch);
    dispatch({
      type: EDIT_PRODUCT_CATEGORY,
      payload: res.data.data,
    });
    return Promise.resolve(res.data.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject(err);
  }
};

export const deleteProductCategoryAction = (id) => async (dispatch) => {
  try {
    const res = await ProductCategoryService.delete(id);
    if (res.status === 200 && res.statusText === 'OK') DeleteAlert(dispatch);
    dispatch({
      type: DELETE_PRODUCT_CATEGORY,
      payload: res.data.data,
    });
    return Promise.resolve(res.data.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};
