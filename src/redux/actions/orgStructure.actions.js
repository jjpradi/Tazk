import {
  ORG_DEPARTMENT_TREE,
  ORG_CHART_DATA,
  ORG_COST_CENTERS,
  ORG_DEPARTMENT_STATS,
  ORG_CHARTDATA,
} from '../actionTypes';
import OrgStructureService from '../../services/orgStructure.services';
import {
  CreateAlert, ErrorAlert, FailLoad, ListLoad, UpdateAlert, DeleteAlert,
} from './load';

export const getDepartmentTreeAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await OrgStructureService.getDepartmentTree();
      if (res.status === 200) {
        dispatch({ type: ORG_DEPARTMENT_TREE, payload: res.data });
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const updateDepartmentHierarchyAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await OrgStructureService.updateDepartmentHierarchy(data);
      if (res.status === 200) {
        UpdateAlert(dispatch);
        dispatch(getDepartmentTreeAction(setModalTypeHandler, setLoaderStatusHandler));
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const getOrgChartAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await OrgStructureService.getOrgChart(data);
      if (res.status === 200) {
        dispatch({ type: ORG_CHART_DATA, payload: res.data });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

  export const setSearchOrgChartAction = (data) =>{
    return{
      type: ORG_CHART_DATA,
      payload: data,
    }
  };

    export const SearchOrgChartAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
      return {
        type: ORG_CHARTDATA,
        body,
        setModalTypeHandler, 
        setLoaderStatusHandler
      }
    }

export const getDepartmentStatsAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await OrgStructureService.getDepartmentStats();
      if (res.status === 200) {
        dispatch({ type: ORG_DEPARTMENT_STATS, payload: res.data });
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const getCostCentersAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await OrgStructureService.getCostCenters();
      if (res.status === 200) {
        dispatch({ type: ORG_COST_CENTERS, payload: res.data });
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const createCostCenterAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await OrgStructureService.createCostCenter(data);
      if (res.status === 200) {
        CreateAlert(dispatch);
        dispatch(getCostCentersAction(setModalTypeHandler, setLoaderStatusHandler));
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const updateCostCenterAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await OrgStructureService.updateCostCenter(data);
      if (res.status === 200) {
        UpdateAlert(dispatch);
        dispatch(getCostCentersAction(setModalTypeHandler, setLoaderStatusHandler));
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const deleteCostCenterAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await OrgStructureService.deleteCostCenter(id);
      if (res.status === 200) {
        DeleteAlert(dispatch);
        dispatch(getCostCentersAction(setModalTypeHandler, setLoaderStatusHandler));
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };
