import { GET_SEARCH_ASSEST, 
        // LIST_ASSETS, 
        SET_SEARCH_ASSET, 
        LIST_ASSET_TIMELINE, 
        CREATE_ASSIGN, 
        SET_SCRAP_ASSET,
        GET_IMAGE,
        GET_ASSET_TYPE, 
        GET_ASSET_GROUP, 
        CREATE_MOVE,
        INSERT_NEW_ASSET_TYPE,
        GET_ASSET_CODE,
        GET_DYNAMIC_PROP_BY_ASSET_TYPE,
        GET_MOVE_ASSET,
        UPDATE_IMAGE,
        SET_LIST_ASSIGN,
        GET_LIST_ASSIGN,
        GET_ASSIGN_DATA,
        SET_ASSIGN_DATA,
        GET_DYNAMIC_PROP,
        SET_DYNAMIC_PROP,
        GET_SEARCH_WARRANT,
        SET_SEARCH_WARRANT,
        INSERT_ASSET_WARRANTY,
        GET_SEARCH_DYNAMIC_PROP,
        SET_SEARCH_DYNAMIC_PROP,
        SET_ASSET_GROUP,
        ASST_CONDITION_DASH,
        GET_ASSETNAME_LIST,
        ASST_AUDIT_DASH,
        SET_ASSET_TYPE,
        GET_SEARCH_GROUP,
        GET_SEARCH_TYPE,
        SET_SEARCH_TYPE,
        SET_SEARCH_GROUP,
        ASSET_FIELDS,
        GET_UN_ASSIGN,
        GET_TOTAL_ASSETS,
        GET_UN_AUDITED_DATA,
        TOP_ASSETS_BY_VALUE,
        ASSIGNED_CARD,
        GET_WARRANTY_BY_ASSET,
        TOTAL_ASSET_VALUE,
        ASSET_STATUS_COUNT,
        ASSET_LOCATION_DASHBOARD,
        ASSET_TYPE_CARD_CHART,
        ASSET_FASCALYEAR_TOTAL,
        GET_ASSET_GROUP_INITIAL,
        SET_SEARCH_GROUP_INITIAL,
        GET_INITIAL_ASSET_TYPE,
        SET_INITIAL_SEARCH_TYPE,
        GET_WARRANTY_BY_ID,
        RENEW_WARRANTY,
        GET_SCRAP_ASSET_APPROVALS,
        GET_SCRAP_ASSET_BY_ID,
        SCRAP_ASSET_CONFIG,
        GET_SCRAP_ASSET_REPORT,
        SET_SCRAP_ASSET_REPORT,
        SCRAP_ASSET_UNSEEN_DATA,
        ADD_REMINDER,
        GET_REMINDER,
        GET_RENTALS_AND_TENANTS,
        SET_RENTALS_AND_TENANTS,
        CREATE_RENTAL_TENANT,
        GET_RENTAL_TENANT_BY_ID,
        UPDATE_RENTAL_TENANT,
        DELETE_RENTAL_TENANT,
        GET_WARRANTY_TYPE,
        CREATE_ASST_GENERAL,
        UPDATE_ASST_GENERAL,
        DELETE_ASST_GENERAL,
        GET_ASST_GENERAL,
        SET_ASST_GENERAL,
        GET_ASSET_CALENDAR,
        UPDATE_WARRANTY,
        DELETE_RENEWALS,
        ASSET_DETAILS,
    } 
from "redux/actionTypes";
import asset_services from "services/asset_services";
import { DeleteAlert, ErrorAlert, FailLoad, ListLoad, CannotDeleteAlert, CreateAlert, UpdateAlert } from "./load";
import { CREATE_COMPLIANCE, DELETE_SCRAP_APPROVALS } from "../actionTypes";

export const ListAssets = (data) => async (dispatch) => {
    try{
        const res = await asset_services.getAll(data);
        if(res.status === 200){
            dispatch({
                type: SET_SEARCH_ASSET,
                payload: res.data,
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS");    
    }catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getSearchAssetAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return{
        type: GET_SEARCH_ASSEST,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const setSearchAssetAction = (data) => {
    return{
        type: SET_SEARCH_ASSET,
        payload: data
    }
}

export const ListAssetTimeline = (id) => async (dispatch) => {
    try{
        const res = await asset_services.getAssetTimeline(id)

        if(res.status === 200){
            dispatch({
                type: LIST_ASSET_TIMELINE,
                payload: res.data,
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS");    
    }catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getSearchAssignAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type:GET_LIST_ASSIGN,
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };
 
export const setSearchAssignListAction = (data) => {
    return {
      type:SET_LIST_ASSIGN,
      payload:data
    }
};

export const getAllAssetAction = (data) => async (dispatch) => {
    try {
        const res = await asset_services.getAllAsset(data)

        if(res.status === 200) {
            dispatch({
                type : GET_ASSETNAME_LIST,
                payload : res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getUnAssignAction =()=> async(dispatch)=>{
    try{
        const res = await asset_services.getUnAssign()

        if(res.status === 200){
            dispatch({
                type:GET_UN_ASSIGN,
                payload:res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
        ErrorAlert(dispatch,err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getTtotalAssetsAction =()=> async(dispatch)=>{
    try{
        const res = await asset_services.getTotalAssets()

        if(res.status === 200){
            dispatch({
                type:GET_TOTAL_ASSETS,
                payload:res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
        ErrorAlert(dispatch,err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getUnAuditedDataAction = () => async(dispatch)=>{
    try{
        const res = await asset_services.getUnAuditedData()

        if(res.status === 200){
            dispatch({
                type:GET_UN_AUDITED_DATA,
                payload : res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }

    catch(err){
        ErrorAlert(dispatch,err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}
export const topAssetsByValueAction =() => async(dispatch)=>{
    try{

        const res = await asset_services.topAssetsByValue()

        if(res.status === 200){
            dispatch({
                type:TOP_ASSETS_BY_VALUE,
                payload:res.data

            })
            return Promise.resolve("API_FINISHED_SUCCESS")
        }

    }
    catch(err){
        ErrorAlert(dispatch,err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}


export const CreateAssignAction = (data) => async (dispatch) => {
    try {
        const res = await asset_services.createAssign(data)

        if(res.status === 200) {
            if(res.data.message === 'YOU HAVE ALREADY ASSIGNED THIS ASSET TO THIS EMPLOYEE') {
                CannotDeleteAlert(dispatch, res.data)
            }
            else {
                dispatch({
                    type: CREATE_ASSIGN,
                    payload: res.data,
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

export const getAssignToDataAction = (data) => async (dispatch) => {
    try {
        const res = await asset_services.getAssignData(data)

        if(res.status === 200) {
            dispatch({
                type: SET_ASSIGN_DATA,
                payload: res.data,
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getSearchAssignToAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type:GET_ASSIGN_DATA,
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };
 
export const setSearchAssignToAction = (data) => {
    return {
      type:SET_ASSIGN_DATA,
      payload:data
    }
};
        
export const CreateScrapAssetAction = (body) => async (dispatch) => {
    try{
        const res = await asset_services.createScrapAsset(body)

        if(res.status === 200){
            if(res.data.message === 'A SCRAP ASSET REQUEST FOR THIS ASSET HAS ALREADY BEEN SENT') {
                CannotDeleteAlert(dispatch, res.data)
            }
            else {
                dispatch({
                    type: SET_SCRAP_ASSET,
                    payload: res.data
                })
            }
        }
        return Promise.resolve("API_FINISHED_SUCCESSFULLY")
    }catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const CreateAssetManagement = (data, response ) => async (dispatch) => {
    try {
        const res = await asset_services.create(data);
        if (res.status === 200){
            CreateAlert(dispatch);
            dispatch({
                type: SET_SEARCH_ASSET,
                payload: res.data,
            });
            if(response){
                response(res)
            }
        }
        
        //   successmsg(sample);
        return Promise.resolve(res.data);
    } catch (err) {
        ErrorAlert(dispatch, err);
        //   errormsg(sample);
        return Promise.reject(err);
    }
  };

  
export const updateAssetAction = (data, response) => async (dispatch) => {
    try {
        const res = await asset_services.update(data);
        if (res.status === 200){
            dispatch({
                type:SET_SEARCH_ASSET,
                payload: res.data,
            });
            if(response){
                response(res.data)
            }
        }
        
        //   successmsg(sample);
        return Promise.resolve(res.data);
    } catch (err) {
        ErrorAlert(dispatch, err);
        //   errormsg(sample);
        return Promise.reject(err);
    
    }
};


export const getImageAction = (data, response) => async(dispatch) => {
    try{
        const res = await asset_services.getImage(data);
        if (res.status === 200) {
            dispatch({
                type: GET_IMAGE,
                payload: res.data,
            })
        }
        if(response){
            response(res.data)
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    }catch (err) {
        ErrorAlert(dispatch, err);
        
        return Promise.reject("API_FINISHED_ERROR");
    }
};

export const updateImageAction = (data, response) => async (dispatch) => {
    try {
        const res = await asset_services.updateImage(data);
        if (res.status === 200){
            dispatch({
                type:UPDATE_IMAGE,
                payload: res.data,
            });
            if(response){
                response(res.data)
            }
        }
        
        //   successmsg(sample);
        return Promise.resolve(res.data);
    } catch (err) {
        ErrorAlert(dispatch, err);
        //   errormsg(sample);
        return Promise.reject(err);
    
    }
};




export const insertNewAssetTypeAction = (data) =>
async (dispatch) => {
  try {
    const res = await asset_services.insertNewAssetType(data);
    if (res.status === 200) {
      dispatch({
        type: INSERT_NEW_ASSET_TYPE,
        payload: res.data,
      });
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
}; 

export const getAssetGroupIdAction = (payload) => async(dispatch) => {
    try{
        const res = await asset_services.getAssetGroup(payload);
        console.log(res,'res');
        if (res.status === 200) {
            dispatch({
                type: GET_ASSET_GROUP,
                payload: res.data,
            });
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    }catch (err) {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        ErrorAlert(dispatch, err);
        
        return Promise.reject("API_FINISHED_ERROR");
    }
};

export const getInitialAssetGroupAction = (payload, response) => async(dispatch) => {
    try{
        const res = await asset_services.getInitialAssetGroup(payload);
        if (res.status === 200) {
            console.log(res,payload,res.data,'actionlog')
            dispatch({
                type: GET_ASSET_GROUP_INITIAL,
                payload: res.data,
            });
            if (response) {
                response(res.data.data)
              }
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    }catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};

export const getAssetTypeIdAction = (data) => async(dispatch) => {
    try{
        const res = await asset_services.getAssetType(data);
        if (res.status === 200) {
            dispatch({
                type: GET_ASSET_TYPE,
                payload: res.data,
            });
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    }catch (err) {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};

export const getInitialAssetTypeAction = (data, response) => async(dispatch) => {
    try{
        const res = await asset_services.getInitialAssetType(data);
        if (res.status === 200) {
            dispatch({
                type: GET_INITIAL_ASSET_TYPE,
                payload: res.data,
            });
            if (response) {
                response(res.data.data)
              }
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    }catch (err) {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};





export const getAssetCodeAction= () => async(dispatch) => {
    try{
        const res = await asset_services.getAssetCode();
        if (res.status === 200) {
            dispatch({
                type:GET_ASSET_CODE,
                payload: res.data,
            });
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    }catch (err) {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};


export const CreateMoveAction = (data) => async (dispatch) => {
    try {
        const res = await asset_services.createMove(data)

        if(res.status === 200) {
            dispatch({
                type: CREATE_MOVE,
                payload: res.data,
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getMoveAsset= (data) => async(dispatch) => {
    try{
        const res = await asset_services.getMove(data);
        if (res.status === 200) {
            dispatch({
                type: GET_MOVE_ASSET,
                payload: res.data,
            });
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    }catch (err) {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};
export const CreateDynamicProp = (data, response) => async (dispatch) => {
    try {
        const res = await asset_services.createDynamicProperty(data)
        
        if (res.data.message === "Already Existing Label Name") {
            CannotDeleteAlert(dispatch, res.data)
        } else {
            CreateAlert(dispatch);
            dispatch({
                type: SET_DYNAMIC_PROP,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch (err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getDynamicPropByAssetType = (data, response) => async (dispatch) => {
    try{
       const res = await asset_services.getDynamicPropertyByAssetType(data)
        if(res.status === 200){
            dispatch({
                type: GET_DYNAMIC_PROP_BY_ASSET_TYPE,
                payload: res.data
            })
            if(response){
                response(res.data)
            }
        }

        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getAllDynamicProp = (payload) => async (dispatch) => {
    try{
        const res = await asset_services.getDynamicProp(payload)

        if(res.status === 200){
            dispatch({
                type: GET_DYNAMIC_PROP,
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

export const assetDetailsAction = (data) => async (dispatch) => {
    try{
        const res = await asset_services.getassetDetails(data)
        console.log(res , "dfgdfgdf");
        
        if (res.status === 200) {
            dispatch({
                type: ASSET_DETAILS,
                payload: res.data
            })
        }        
    }catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const deleteAssetsDynamicPropAction = (id) => async (dispatch) => {
    try{
        const res = await asset_services.deleteAssetsDynamicProp(id)
        
        if(res.status === 200) {
            if(res.data.message === 'THE DYNAMIC PROP CANNOT BE DELETED AS IT HAS BEEN IN USE') {
                CannotDeleteAlert(dispatch, res.data)
            }
            else {
                DeleteAlert(dispatch)
                dispatch({
                    type: GET_DYNAMIC_PROP,
                    payload: res.data
                })
            }
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const deleteAssetType = (id) => async (dispatch) => {
    try{
        const res = await asset_services.deleteAssetType(id)
        console.log(res,'sssssss')
        if(res.status === 200) {
            if(res.data.message  == 'THE ASSET TYPE CANNOT BE DELETED AS IT HAS BEEN IN USE'){
                ErrorAlert(dispatch,res.data)
            }
            else{
                DeleteAlert(dispatch)
                dispatch({
                    type: SET_SEARCH_TYPE,
                    payload: res.data
                })
            }
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const deleteInitialAssetTypeAction = (id) => async (dispatch) => {
    try{
        const res = await asset_services.deleteInitialAssetType(id)
        console.log(res,'sssssss')
        if(res.status === 200) {
            if(res.data.message  == 'THE ASSET TYPE CANNOT BE DELETED AS IT HAS BEEN IN USE'){
                ErrorAlert(dispatch,res.data)
            }
            else{
                DeleteAlert(dispatch)
                dispatch({
                    type: SET_INITIAL_SEARCH_TYPE,
                    payload: res.data
                })
            }
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}
export const deleteAssetGroup = (id) => async (dispatch) => {
    try{
        
        const res = await asset_services.deleteAssetGroup(id)
        if(res.status === 200) {
            if(res.data.message  === 'THE ASSET GROUP CANNOT BE DELETED AS IT HAS BEEN IN USE'){
                CannotDeleteAlert(dispatch,res.data)
            }
            else{

                DeleteAlert(dispatch)
                dispatch({
                    type: SET_SEARCH_GROUP,
                    payload: res.data
                })
            }
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}
export const deleteInitialAssetGroupAction = (id) => async (dispatch) => {
    try{
        const res = await asset_services.deleteInitialAssetGroup(id)
        if(res.status === 200) {
            if(res.data.message  === 'THE ASSET GROUP CANNOT BE DELETED AS IT HAS BEEN IN USE'){
                CannotDeleteAlert(dispatch,res.data)
            }
            else{
                DeleteAlert(dispatch)
                dispatch({
                    type: SET_SEARCH_GROUP_INITIAL,
                    payload: res.data
                })
            }
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const editDynamicProp = (data) => async (dispatch) => {
    try{
        const res = await asset_services.editDynamicProp(data)

        if(res.status === 200){
            dispatch({
                type: GET_DYNAMIC_PROP,
                payload: res.data
            })
            UpdateAlert(dispatch)
        }

        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const insertAssetwarrantyAction = (data) =>  async (dispatch)=>{
    try{
        const res = await asset_services.assetWarantyServices(data)

        if(res.status === 200){
            dispatch({
                type : INSERT_ASSET_WARRANTY,
                payload : res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
        ErrorAlert(dispatch,err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}
export const listwarrantyAction = (data) =>  async (dispatch)=>{
    try{
        const res = await asset_services.warrantyListServices(data)

        if(res.status === 200){
            dispatch({
                type : SET_SEARCH_WARRANT,
                payload : res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
        ErrorAlert(dispatch,err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getSearchWarranty = (body,setModalTypeHandler,setModalStatusHandler) =>{
    return{
        type:GET_SEARCH_WARRANT,
        body,
        setModalTypeHandler,
        setModalStatusHandler
    }
}

export const setSearchWarrant = (data)=>{
    return{
        type:SET_SEARCH_WARRANT,
        payload:data
    }
}

export const getSearchDynamicPropAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return{
        type: GET_SEARCH_DYNAMIC_PROP,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}
export const setSearchAssetGroupListAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return{
        type: GET_SEARCH_GROUP,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}
export const setSearchAssetTypeListAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return{
        type: GET_SEARCH_TYPE,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}
 
export const setSearchDynamicPropListAction = (data) => {
    return {
      type : SET_SEARCH_DYNAMIC_PROP,
      payload : data
    }
};

export const setSearchAssetGroupAction=(data)=>{
    return{
        type:SET_SEARCH_GROUP,
        payload:data
    }
}
export const setSearchAssetTypeAction=(data)=>{
    return{
        type:SET_SEARCH_TYPE,
        payload:data
    }
}

export const createAssetGroup = (data,response) => async (dispatch) => {
    try{
        const res = await asset_services.addAssetGroup(data)

        if(res.status === 200){

            response()
            // dispatch({
            //     type: SET_ASSET_GROUP,
            //     payload: res.data
            // })
        }

        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}
export const createAssetType = (data,response) => async (dispatch) => {
    try{
        const res = await asset_services.addAssetType(data)

        if(res.status === 200){

            response()
            // dispatch({
            //     type: SET_ASSET_TYPE,
            //     payload: res.data
            // })
        }

        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getConditionDash = () => async (dispatch)=>{
    try{
        const res = await asset_services.asstConditionDash()

        if(res.status === 200){
            dispatch({
                type: ASST_CONDITION_DASH,
                payload:res.data

            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")

    }
    catch(err){
        ErrorAlert(dispatch,err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const totalAssetValueAction =()=> async(dispatch)=>{
    try{
        const res = await asset_services.totalAssetValue()

        if(res.status === 200){
            dispatch({
                type:TOTAL_ASSET_VALUE,
                payload:res.data
            })
        }
    }
    catch(err){
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getAuditDash = () => async (dispatch)=>{
    try{
        const res = await asset_services.asstAuditDash()

        if(res.status == 200){
           
            dispatch({
                type: ASST_AUDIT_DASH,
                payload:res.data

            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")

    }
    catch(err){
        ErrorAlert(dispatch,err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getAssetFieldAction = (payload, setModalTypeHandler, setLoaderStatusHandler) => async(dispatch) => {
    try{
        ListLoad(setModalTypeHandler, setLoaderStatusHandler)
        const res = await asset_services.getAssetFields(payload)
        if(res.status === 200){
            dispatch({
                type: ASSET_FIELDS,
                payload: res.data
            })
        }
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch,err)
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const assignedCardCountAction = () => async (dispatch) => {
    try {
        const res = await asset_services.assignedCardCount()

        if(res.status === 200) {
            dispatch({
                type : ASSIGNED_CARD,
                payload : res.data,
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getWarrantyByAssetAction = (id, response) => async(dispatch) => {
    try{
        const res = await asset_services.getWarrantyByAsset(id)
        if(res.status === 200){
            dispatch({
                type: GET_WARRANTY_BY_ID,
                payload: res.data
            })
        }
        if(response){
            response(res.data)
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const assetStatusCountAction = () => async(dispatch) => {
    try{
        const res = await asset_services.assetStatusCount()
        if(res.status === 200){
            dispatch({
                type: ASSET_STATUS_COUNT,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const assetLocationDashboardAction = () => async(dispatch) => {
    try{
        const res = await asset_services.assetLocations()
        if(res.status === 200){
            dispatch({
                type: ASSET_LOCATION_DASHBOARD,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const assetTypeCardChartAction = (data) => async (dispatch) => {
    try {
        const res = await asset_services.assetTypeCardChart(data)

        if(res.status === 200) {
            dispatch({
                type : ASSET_TYPE_CARD_CHART,
                payload : res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const assetYearValueAction = () => async (dispatch) => {
    try {
        const res = await asset_services.assetYearValue()

        if(res.status === 200) {
            dispatch({
                type : ASSET_FASCALYEAR_TOTAL,
                payload : res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const deleteLeadsDynamicPropAction = (id) => async (dispatch) => {
    try {
        const res = await asset_services.deleteLeadsDynamicProp(id)

        if(res.status === 200) {
            if(res.data.message === 'THE DYNAMIC PROP CANNOT BE DELETED AS IT HAS BEEN IN USE') {
                CannotDeleteAlert(dispatch, res.data)
            }
            else {
                DeleteAlert(dispatch)
                dispatch({
                    type : GET_DYNAMIC_PROP,
                    payload : res.data
                })
            }
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getWarrantyByIdAction = (id, response) => async(dispatch) => {
    try{
        const res = await asset_services.getWarrantyById(id)
        if(res.status === 200){
            dispatch({
                type: GET_WARRANTY_BY_ID,
                payload: res.data
            })
        }
        if(response){
            response(res.data)
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const renewWarrantyAction = (data, id) => async(dispatch) => {
    try{
        const res = await asset_services.renewWarranty(data, id)
        if(res.status === 200){
            dispatch({
                type: RENEW_WARRANTY,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getScrapAssetApprovalsAction = (payload, response) => async (dispatch) => {
    try {
        const res = await asset_services.getScrapAssetApprovals(payload)

        if(res.status === 200) {
            dispatch({
                type : GET_SCRAP_ASSET_APPROVALS,
                payload : res.data
            })
        }
        if(response) {
            response(res.data.data)
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const getScrapAssetByIdAction = (id) => async (dispatch) => {
    try {
        const res = await asset_services.getScrapAssetById(id)

        if(res.status === 200) {
            dispatch({
                type : GET_SCRAP_ASSET_BY_ID,
                payload : res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const getScrapAssetConfigAction = () => async (dispatch) => {
    try {
        const res = await asset_services.getScrapAssetConfig()

        if(res.status === 200) {
            dispatch({
                type : SCRAP_ASSET_CONFIG,
                payload : res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const scrapAssetRejectedAction = (data, id, response) => async (dispatch) => {
    try {
        const res = await asset_services.scrapAssetRejected(data, id)

        if(res.status === 200) {
            dispatch({
                type : GET_SCRAP_ASSET_APPROVALS,
                payload : res.data
            })
        }
        if(response) {
            response(res.data.data)
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const scrapAssetApprovedAction = (data, id, response) => async (dispatch) => {
    try {
        const res = await asset_services.scrapAssetApproved(data, id)

        if(res.status === 200) {
            dispatch({
                type : GET_SCRAP_ASSET_APPROVALS,
                payload : res.data
            })
        }
        if(response) {
            response(res.data.data)
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const deleteScrapAction = (id) => async (dispatch) => {
    try {
        const res = await asset_services.deleteScrapSerivce(id)
        if (res.status === 200 || res.status === 204) {
            dispatch({
                type: DELETE_SCRAP_APPROVALS,
                payload: id
            })
            return 'API_FINISHED_SUCCESS'
        }
        return 'API_FINISHED_ERROR'
    } catch (err) {
        ErrorAlert(dispatch, err)
        return 'API_FINISHED_ERROR'
    }
}

export const updateSeenScrapAssetApprovalAction = (id) => async (dispatch) => {
    try {
        const res = await asset_services.updateSeenScrapAssetApproval(id)

        if(res.status === 200) {
            dispatch({
                type : SCRAP_ASSET_UNSEEN_DATA,
                payload : res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const getScrapAssetReportAction = (data) => async (dispatch) => {
    try {
        const res = await asset_services.getScrapAssetReport(data)

        if(res.status === 200) {
            dispatch({
                type : SET_SCRAP_ASSET_REPORT,
                payload : res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const addEventReminderAction = (data) => async (dispatch) => {
    try {
        const res = await asset_services.addEventReminder(data)

        if(res.status === 200) {
            dispatch({
                type : ADD_REMINDER,
                payload : res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const getEventReminderAction = (data) => async (dispatch) => {
    try {
        const res = await asset_services.getEventReminder(data)

        if(res.status === 200) {
            dispatch({
                type : GET_REMINDER,
                payload : res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}


export const getSearchScrapAssetReportAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
        type : GET_SCRAP_ASSET_REPORT,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const setSearchScrapAssetReportAction = (data) => {
    return {
        type : SET_SCRAP_ASSET_REPORT,
        payload : data
    }
}

export const rentalAndTenantsAction = (data) => async (dispatch) => {
    try {
        const res = await asset_services.getRentalAndTenants(data)

        if(res.status === 200) {
            dispatch({
                type : SET_RENTALS_AND_TENANTS,
                payload : res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const createRentalTenantAction = (data) => async (dispatch) => {
    try {
        const res = await asset_services.createRentalTenant(data)

        if(res.status === 200) {
            dispatch({
                type : CREATE_RENTAL_TENANT,
                payload : res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const getRentalTenantByIdAction = (id) => async (dispatch) => {
    try {
        const res = await asset_services.getRentalTenantById(id)
        if(res.status === 200) {
            dispatch({
                type : GET_RENTAL_TENANT_BY_ID,
                payload : res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const resetRentalTenantByIdAction = () => ({
    type : GET_RENTAL_TENANT_BY_ID,
    payload : null
})

export const updateRentalTenantAction = (data, id) => async (dispatch) => {
    try {
        const res = await asset_services.updateRentalTenant(data, id)
        if(res.status === 200) {
            dispatch({
                type : UPDATE_RENTAL_TENANT,
                payload : res.data
            })
            UpdateAlert(dispatch)
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const deleteRentalTenantAction = (id) => async (dispatch) => {
    try {
        const res = await asset_services.deleteRentalTenant(id)
        if(res.status === 200) {
            dispatch({
                type : DELETE_RENTAL_TENANT,
                payload : res.data
            })
            DeleteAlert(dispatch)
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const getRentalAndTenantsAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {

    return {
        type : GET_RENTALS_AND_TENANTS,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const setRentalAndTenantsAction = (data) => {
    return {
        type : SET_RENTALS_AND_TENANTS,
        payload : data
    }
}

export const createComplianceAction = (data) => async (dispatch) => {
    try {
        const res = await asset_services.createCompliance(data)

        if(res.status === 200) {
            dispatch({
                type : CREATE_COMPLIANCE,
                payload : res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const getAssetWarrantyAction = (data) => async (dispatch) => {
    try {
        const res = await asset_services.getAssetWarrantyType(data)

        if(res.status === 200) {
            dispatch({
                type : GET_WARRANTY_TYPE,
                payload : res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const createAsstGeneralAction = (data) => async (dispatch) => {
    try {
        const res = await asset_services.createAsstGeneral(data)
        if (res?.data?.message === "Phone Number Already Exists" || res?.data?.message === "Email Address Already Exists") {
            CannotDeleteAlert(dispatch, res.data)
        } else {
            dispatch({
                type : CREATE_ASST_GENERAL,
                payload : res.data
            })
            CreateAlert(dispatch)
        }
        return Promise.resolve(res)
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const updateAssetGeneralContact = (data, id) => async (dispatch) => {

    try{
        const res = await asset_services.updateAssetGeneral(data, id)
                if(res.status === 200) {
            dispatch({
                type : GET_ASST_GENERAL,
                payload : res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')

    }catch(err){
               ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
 
    }
}

export const deleteAsstGeneralContactAction = (id) => async (dispatch) => {
    try{
        const res = await asset_services.deleteAsstGeneralContact(id)
        
        if (res?.data?.message === "THE GENERAL CONTACT CANNOT BE DELETED AS IT HAS BEEN IN USE") {
            CannotDeleteAlert(dispatch, res.data)
        } else {
            dispatch({
                type: DELETE_ASST_GENERAL,
                payload: res.data
            })
            DeleteAlert(dispatch)
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const asstGeneralContactAction = (data) => async (dispatch) => {
    try {
        const res = await asset_services.asstGeneralContact(data)

        if(res.status === 200) {
            dispatch({
                type : SET_ASST_GENERAL,
                payload : res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const getAsstGeneralContactAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {

    return {
        type : GET_ASST_GENERAL,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const setAsstGeneralContactAction = (data) => {
    return {
        type : SET_ASST_GENERAL,
        payload : data
    }
}


export const assetCaledarAction = (data) => async (dispatch) => {
    try {
        const res = await asset_services.getAssetsCalendar(data)

        if(res.status === 200) {
            dispatch({
                type : GET_ASSET_CALENDAR,
                payload : res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const updateWarrantyAction = (data,id) =>  async (dispatch)=>{
    try{
        const res = await asset_services.updateWarranty(data,id)

        if(res.status === 200){
            dispatch({
                type : UPDATE_WARRANTY,
                payload : res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
        ErrorAlert(dispatch,err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}



export const deleteRenewalsAction = (data,type) =>  async (dispatch)=>{
    try{
        const res = await asset_services.deleteRenewals(data,type)

        if(res.status === 200){
            dispatch({
                type : DELETE_RENEWALS,
                payload : res.data
            })
            DeleteAlert(dispatch)
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
        ErrorAlert(dispatch,err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

// Backward-compatible alias used in older imports
export const deleteDynamicProp = deleteAssetsDynamicPropAction;
