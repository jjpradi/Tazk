import leadManagement_services from "services/leadManagement_services"
import { CannotDeleteAlert, CreateAlert, DeleteAlert, ErrorAlert, FailLoad, ListLoad, UpdateAlert } from "./load"
import { 
    CREATE_DYNAMIC_PROP, 
    CREATE_NEW_LEAD_SOURCE, 
    CREATE_NEW_LEADS, 
    GET_LEAD_MANAGEMENT_FIELDS, 
    GET_LEAD_MANAGEMENT_STATUS, 
    GET_LEAD_SOURCE, 
    GET_LEAD_STATUS_HISTORY, 
    GET_LEADS, 
    GET_LEADS_SEARCH, 
    SET_LEADS_SEARCH, 
    UPDATE_LEAD, 
    UPDATE_LEAD_STATUS,
    GET_LEAD_TIMELINE,
    GET_ALL_ACCOUNTS,
    GET_LEADS_BY_SOURCE,
    GET_TODAY_LEADS,
    GET_TOTAL_LEADS,
    GET_LEADS_GROWTH,
    GET_MONTH_LEADS,  
    CONVERTED_LEAD_CARD,
    CONVERTED_LEAD_VALUE_CARD,
    CONVERTED_LEADS_AND_VALUES_CHART,
    GET_ALL_LEADS,
    SET_LEAD_SOURCE_LIST,
    GET_LEAD_SOURCE_LIST,
    CREATE_NEW_ACCOUNT,
    GET_ACTIVE_LEADS,
    GET_ADDITIONAL_CONTACTS,
    GET_SALES_LEADS,  
    APPROX_VALUE_BASED_ON_LEAD_SOURCE,  
    GET_LEADS_PIPELINE,
    SET_LEAD_STATUS,
    GET_LEAD_STATUS,
    GET_LEAD_SOURCE_INITIAL,
    SET_LEAD_SOURCE_INITIAL,
    GET_LEAD_INITIAL_STATUS,  
    CREATED_BY_UPDATED_BY_FULL_NAME,
    GET_LEADS_CUSTOMERS,
    LEADS_DAILY_REPORT,
    WORKING_CONTACTED_LEADS,
    OPEN_NOTCONTACTED_LEADS,
    CLOSED_NOTCONVERTED_LEADS,
    WHATSAPP_LEAD_PROPOSAL,  
} from "redux/actionTypes"

export const getLeadManagementFieldsAction = (setModalTypeHandler, setLoaderStatusHandler) => async(dispatch) => {
    try{
        ListLoad(setModalTypeHandler, setLoaderStatusHandler)
        const res = await leadManagement_services.getFields()
        if(res.status === 200){
            dispatch({
                type: GET_LEAD_MANAGEMENT_FIELDS,
                payload: res.data
            })
            FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getLeadManagementStatusAction = () => async(dispatch) => {
    try{
        const res = await leadManagement_services.getStatus()
        if(res.status === 200){
            dispatch({
                type: GET_LEAD_MANAGEMENT_STATUS,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getInitialStatusAction = (response) => async(dispatch) => {
    try{
        const res = await leadManagement_services.getInitialStatus()
        if(res.status === 200){
            dispatch({
                type: GET_LEAD_INITIAL_STATUS,
                payload: res.data
            })
            if (response) {
                response(res.data)
              }
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const createLeadAction = (data) => async(dispatch) => {
    try{
        const res = await leadManagement_services.createLead(data)
        if(res.status === 200){
            dispatch({
                type: CREATE_NEW_LEADS,
                payload: res.data
            })
            CreateAlert(dispatch)
        }
        return Promise.resolve(res.data)
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve(null)
    }
}

export const getLeadsAction = (data, setModalTypeHandler, setLoaderStatusHandler) => async(dispatch) => {
    try{
        ListLoad(setModalTypeHandler, setLoaderStatusHandler)
        const res = await leadManagement_services.getLeads(data)
        if(res.status === 200){
            dispatch({
                type: GET_LEADS,
                payload: res.data
            })
        }
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}
export const getLeadsmeetingAction = (data, setModalTypeHandler, setLoaderStatusHandler) => async(dispatch) => {
    try{
        ListLoad(setModalTypeHandler, setLoaderStatusHandler)
        const res = await leadManagement_services.getLeads(data)
        console.log(res.data,'res.data');
        
        if(res.status === 200){
            dispatch({
                type: GET_ALL_LEADS,
                payload: res.data?.data
            })
        }
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const setLeadsSearchAction = (data) => {
    return{
        type: SET_LEADS_SEARCH,
        payload: data
    }
}

export const getLeadsSearchAction = (data, setModalTypeHandler, setLoaderStatusHandler) => {
    return{
        type: GET_LEADS_SEARCH,
        body: data,
        setModalTypeHandler, 
        setLoaderStatusHandler
    }
}

export const updateLeadStatusAction = (data) => async(dispatch) => {
    try{
        const res = await leadManagement_services.updateLeadStatus(data)
        if(res.status === 200){
            dispatch({
                type: UPDATE_LEAD_STATUS,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHEd_ERROR")
    }
}

export const getLeadStatusChangeHistoryAction = (data) => async(dispatch) => {
    try{
        const res = await leadManagement_services.getLeadStatusHistory(data)
        if(res.status === 200){
            dispatch({
                type: GET_LEAD_STATUS_HISTORY,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const updateLeadAction = (data, leadId) => async(dispatch) => {
    try{
        const res = await leadManagement_services.updateLead(data, leadId)
        if(res.status === 200){
            dispatch({
                type: UPDATE_LEAD,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const createCustomLeadField = (data) => async(dispatch) => {
    try{
        const res = await leadManagement_services.createCustomField(data)
        if(res.status === 200){
            dispatch({
                type: CREATE_DYNAMIC_PROP,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getLeadManagementSourceAction = (data) => async(dispatch) => {
    try{
        const res = await leadManagement_services.getLeadSource(data)
        if(res.status === 200){
            dispatch({
                type: GET_LEAD_SOURCE,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const leadInitialSourceAction = (response) => async(dispatch) => {
    console.log(response,'actionresponse')
    try{
        const res = await leadManagement_services.leadInitialSource()
        if(res.status === 200){
            dispatch({
                type: GET_LEAD_SOURCE_INITIAL,
                payload: res.data
            })
            if (response) {
                response(res.data)
              }
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const addNewSource = (data) => async(dispatch) => {
    try{
        const res = await leadManagement_services.addSource(data)
        if(res.status === 200){
            dispatch({
                type: CREATE_NEW_LEAD_SOURCE,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getTimelineMessageAction = (id) => async (dispatch) => {
    try {
        const res = await leadManagement_services.getTimelineMessage(id)

        if(res.status === 200) {
            dispatch({
                type : GET_LEAD_TIMELINE,
                payload : res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHEd_ERROR")
    }
}

export const getAllLeadAccountsAction = () => async (dispatch) => {
    try{
        const res = await leadManagement_services.getAllAccounts()
        if(res.status === 200){
            dispatch({
                type: GET_ALL_ACCOUNTS,
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

export const getLeadBySourceAction =(data)=> async (dispatch)=>{
        try{

            const res = await leadManagement_services.getLeadBySource(data)

            if(res.status === 200){
                dispatch({
                    type: GET_LEADS_BY_SOURCE ,
                    payload : res.data
                })
            }
            return Promise.resolve('API_FINISHED_SUCCESS')

        }
        catch(err){
            return Promise.resolve('API_FINISHED_ERROR')
        }
}

export const getTodaysLeadsAction = (setModalTypeHandler, setLoaderStatusHandler) => async(dispatch)=>{
    try{
        const res = await leadManagement_services.getTodaysLeads()

        console.log(res,'actonnasdasdas')

        if(res.status === 200){
            dispatch({
                type : GET_TODAY_LEADS,
                payload : res.data
            })
            FailLoad(setModalTypeHandler, setLoaderStatusHandler)

        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const totalLeadsAction=(data)=> async(dispatch)=>{
    try{
        const res = await leadManagement_services.totalLeads(data)

        console.log(res,'fsewuyy832y723d')

        if(res.status === 200){
            dispatch({
                type : GET_TOTAL_LEADS,
                payload : res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const getLeadsGrowthAction=()=> async(dispatch)=>{
    try{
        const res = await leadManagement_services.customerGrowth()

        console.log(res,'fsewuyy832y723d')

        if(res.status === 200){
            dispatch({
                type : GET_LEADS_GROWTH,
                payload : res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const leadsComparisionAction=()=> async(dispatch)=>{
    try{
        const res = await leadManagement_services.leadsComparision()

        if(res.status === 200){
            dispatch({
                type : GET_MONTH_LEADS,
                payload : res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const convertedLeadsCountAction = (data) => async (dispatch) => {
    try {
        const res = await leadManagement_services.convertedLeadsCount(data)

        if(res.status === 200) {
            dispatch({
                type : CONVERTED_LEAD_CARD,
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

export const convertedLeadsValueAction = () => async (dispatch) => {
    try {
        const res = await leadManagement_services.convertedLeadsValue()

        if(res.status === 200) {
            dispatch({
                type : CONVERTED_LEAD_VALUE_CARD,
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

export const convertedLeadsAndValuesAction = () => async (dispatch) => {
    try {
        const res = await leadManagement_services.convertedLeadsAndValues()

        if(res.status === 200) {
            dispatch({
                type : CONVERTED_LEADS_AND_VALUES_CHART,
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

export const getAllLeadsAction = () => async(dispatch) => {
    try{
        const res = await leadManagement_services.getAllLeads()
        if(res.status === 200){
            dispatch({
                type: GET_ALL_LEADS,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const setLeadSourceList = (data) => {
    return {
      type: SET_LEAD_SOURCE_LIST,
      payload: data
    }
  };


  export const getLeadSourceList = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: GET_LEAD_SOURCE_LIST,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

  export const deleteLeadSourceAction = (id, response) => async (dispatch) => {
    try {
      const res =  await leadManagement_services.deleteLeadSource(id);
      if (res.status === 200) {
        if(res.data.message === 'THE LEAD SOURCE CANNOT BE DELETED AS IT HAS BEEN IN USE'){
          CannotDeleteAlert(dispatch,res.data)
        }
        else{
          DeleteAlert(dispatch)
          dispatch({
            type: SET_LEAD_SOURCE_LIST, 
            payload: res.data, 
          }); 
        }
  
        // if(response){
        //   response(res.data)
        // }
      } 
      return Promise.resolve("API_FINISHED_SUCCESS"); 
    } catch (err) { 
      ErrorAlert(dispatch, err); 
      return Promise.reject("API_FINISHED_ERROR");
    } 
  }; 

  export const deleteInitialSourceAction = (id, response) => async (dispatch) => {
    try {
      const res =  await leadManagement_services.deleteInitialLeadSource(id);
      if (res.status === 200) {
        if(res.data.message === 'THE LEAD SOURCE CANNOT BE DELETED AS IT HAS BEEN IN USE'){
          CannotDeleteAlert(dispatch,res.data)
        }
        else{

          dispatch({
            type: SET_LEAD_SOURCE_INITIAL, 
            payload: res.data, 
          }); 
        }
      } 
      return Promise.resolve("API_FINISHED_SUCCESS"); 
    } catch (err) { 
      ErrorAlert(dispatch, err); 
      return Promise.reject("API_FINISHED_ERROR");
    } 
  }; 

export const createAccountAction = (data) => async (dispatch) => {
    try {
        const res = await leadManagement_services.createAccount(data)

        if(res.status === 200) {
            dispatch({
                type : CREATE_NEW_ACCOUNT,
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

export const ActiveTotalLeadsAction = (data) => async (dispatch) => {
    try {
        const res = await leadManagement_services.activeTotalLeads(data)

        if(res.status === 200) {
            dispatch({
                type : GET_ACTIVE_LEADS,
                payload : res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err) {
        return Promise.resolve("API_FINISHED_ERROR")
    }
}
export const getleadsPipelineAction = () => async (dispatch) => {
    try {
        const res = await leadManagement_services.getleadsPipeline()

        if(res.status === 200) {
            dispatch({
                type : GET_LEADS_PIPELINE,
                payload : res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err) {
        return Promise.resolve("API_FINISHED_ERROR")
    }
}


export const additionalContactsAction = (id) => async(dispatch) => {
    try{
        const res = await leadManagement_services.additionalContacts(id)
        if(res.status === 200){
            dispatch({
                type: GET_ADDITIONAL_CONTACTS,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHEd_ERROR")
    }
}

export const getSalesLeadsAction = () => async (dispatch) => {
    try {
        const res = await leadManagement_services.getSalesLeads()

        if(res.status === 200) {
            dispatch({
                type : GET_SALES_LEADS,
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

export const approxValueBasedOnLeadSourceAction = () => async(dispatch) => {
    try{
        const res = await leadManagement_services.approxValueBasedOnLeadSource()
        if(res.status === 200){
            dispatch({
                type: APPROX_VALUE_BASED_ON_LEAD_SOURCE,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const addNewStatus = (data) => async(dispatch) => {
    try{
        const res = await leadManagement_services.addLeadStatus(data)
        if(res.status === 200){
            dispatch({
                type: GET_LEAD_MANAGEMENT_STATUS,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const deleteLeadStatus = (id) => async(dispatch) => {
    try{
        const res = await leadManagement_services.deleteLeadStatus(id)
        if(res.status === 200){
            if(res.data.message === 'LEAD STATUS IS ALREADY IN USE'){
                CannotDeleteAlert(dispatch, res.data)
            }
            else{
                DeleteAlert(dispatch)
                dispatch({
                    type: GET_LEAD_MANAGEMENT_STATUS,
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

export const updateLeadStageNameAction = (statusId, statusName) => async(dispatch) => {
    try{
        const res = await leadManagement_services.updateLeadStageName(statusId, { statusName })
        if(res.status === 200){
            dispatch({
                type: GET_LEAD_MANAGEMENT_STATUS,
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

export const reorderLeadStatusesAction = (statusIds = []) => async(dispatch) => {
    try{
        const res = await leadManagement_services.reorderLeadStages({ status_ids: statusIds })
        if(res.status === 200){
            dispatch({
                type: GET_LEAD_MANAGEMENT_STATUS,
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

export const deleteInitialLeadStatusAction = (id) => async(dispatch) => {
    try{
        const res = await leadManagement_services.deleteInitialStatus(id)
        if(res.status === 200){
            if(res.data.message === 'LEAD STATUS IS ALREADY IN USE'){
                CannotDeleteAlert(dispatch, res.data)
            }
            else{
                DeleteAlert(dispatch)
                dispatch({
                    type: GET_LEAD_INITIAL_STATUS,
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

export const setSearchStatusAction = (data) => {
    return {
        type: SET_LEAD_STATUS,
        payload: data
      }
}

export const getSearchStatusAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
        type: GET_LEAD_STATUS,
        body,
        setModalTypeHandler, 
        setLoaderStatusHandler
      }
}

export const getCreatedByAndUpdatedByFullNameAction = (payload) => async(dispatch) => {
    try{
        const res = await leadManagement_services.getCreatedByAndUpdatedByFullName(payload)
        if(res.status === 200){
            dispatch({
                type: CREATED_BY_UPDATED_BY_FULL_NAME,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getLeadCustomersAction = (payload) => async(dispatch) => {
    try{
        const res = await leadManagement_services.getLeadCustomers(payload)
        if(res.status === 200){
            dispatch({
                type: GET_LEADS_CUSTOMERS,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const LeadsDailyReportAction = (data) => async (dispatch) => {
    try {
        const res = await leadManagement_services.leadsDailyReport(data)

        if(res.status === 200) {
            dispatch({
                type : LEADS_DAILY_REPORT,
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

export const WorkingContactedLeadsAction = () => async (dispatch) => {
    try {
        const res = await leadManagement_services.workingContactedLeads()

        if(res.status === 200) {
            dispatch({
                type : WORKING_CONTACTED_LEADS,
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

export const OpenNotcontactedLeadsAction = () => async (dispatch) => {
    try {
        const res = await leadManagement_services.openNotcontactedLeads()

        if(res.status === 200) {
            dispatch({
                type : OPEN_NOTCONTACTED_LEADS,
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
export const ClosedNotconvertedLeadsAction = () => async (dispatch) => {
    try {
        const res = await leadManagement_services.closedNotconvertedLeads()

        if(res.status === 200) {
            dispatch({
                type : CLOSED_NOTCONVERTED_LEADS,
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

export const whatsAppLeadProposalAction=(data)=> async (dispatch)=>{
    try{
         const res = await leadManagement_services.whatsAppLeadProposal(data)

        if(res.status === 200) {
            dispatch({
                type : WHATSAPP_LEAD_PROPOSAL,
                payload : res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
        return Promise.resolve('API_FINISHED_ERROR')
    }
}
