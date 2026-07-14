import { 
    CREATE_NEW_LEAD_SOURCE, 
    GET_LEAD_MANAGEMENT_FIELDS, 
    GET_LEAD_MANAGEMENT_STATUS, 
    GET_LEAD_SOURCE, 
    GET_LEAD_STATUS_HISTORY, 
    GET_LEADS, 
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
    CREATE_NEW_ACCOUNT,
    GET_ACTIVE_LEADS,
    GET_ADDITIONAL_CONTACTS,
    GET_SALES_LEADS,
    APPROX_VALUE_BASED_ON_LEAD_SOURCE,
    GET_LEADS_PIPELINE,
    SET_LEAD_STATUS,
    GET_LEAD_SOURCE_INITIAL,
    GET_LEAD_INITIAL_STATUS,
    CREATED_BY_UPDATED_BY_FULL_NAME,
    GET_LEADS_CUSTOMERS,
    LEADS_DAILY_REPORT,
    WORKING_CONTACTED_LEADS,
    OPEN_NOTCONTACTED_LEADS,
    CLOSED_NOTCONVERTED_LEADS,
    WHATSAPP_LEAD_PROPOSAL,
} from "redux/actionTypes"

const initialState = {
    leadManagementFields: [],
    leadManagementStatus: [],
    getLeads: [],
    getLeadStatusHistory: [],
    updateLead: [],
    leadManagementSource: [],
    getLeadTimeline : [],
    getAllAccounts: [],
    getLeadSource : [],
    getTodaysLeads : [],
    getTotalLeads : [],
    getLeadsGrowth:[],
    getMonthLeads : [],
    convertedLeadsCard : [],
    convertedLeadsValueCard : [],
    convertedLeadsAndValuesChart : [],
    allLeads: [],
    createAccount : [],
    getActiveLeads : [],
    getAdditionalContacts : [],
    getSalesLeads : [],
    approxValueBasedOnLeadSource: [],
    getleadsPipeline : [],
    leadInitialSource: [],
    leadInitialStatus: [],
    createdByUpdatedByFullName : [],
    getLeadsCustomers : [],
    getLeadsDailyReport : [],
    getWorkingContactedLeads : [],
    getOpenNotcontactedLeads : [],
    getClosedNotconvertedLeads : [],
}

function leadManagementReducers(state = initialState, action){
    const{ type, payload } = action
    switch(type){

        case GET_LEAD_MANAGEMENT_FIELDS:
            return {...state, leadManagementFields: payload}

        case GET_LEAD_MANAGEMENT_STATUS:
            return {...state, leadManagementStatus: payload}

        case GET_LEAD_INITIAL_STATUS:
            return {...state, leadInitialStatus: payload}

        case GET_LEADS:
            return {...state, getLeads: payload}

        case SET_LEADS_SEARCH:
            return {...state, getLeads: payload}

        case GET_LEAD_STATUS_HISTORY:
            return {...state, getLeadStatusHistory: payload}

        case UPDATE_LEAD_STATUS:
            return {...state, getLeadStatusHistory: payload}

        case GET_ADDITIONAL_CONTACTS:
            return {...state, getAdditionalContacts: payload}

        case UPDATE_LEAD:
            return {...state, updateLead: payload}

        case GET_LEAD_SOURCE:
            return {...state, leadManagementSource: payload}

        case GET_LEAD_SOURCE_INITIAL:
            return {...state, leadInitialSource: payload}

        case SET_LEAD_SOURCE_LIST:
            return {...state, leadManagementSource: payload}

        case CREATE_NEW_LEAD_SOURCE:
            return {...state, leadManagementSource: payload}
            
        case GET_LEAD_TIMELINE :
            return {...state, getLeadTimeline : payload}

        case GET_ALL_ACCOUNTS:
            return {...state, getAllAccounts: payload}

        case GET_LEADS_BY_SOURCE:
            return {...state, getLeadSource: payload}

        case GET_TODAY_LEADS:
            return {...state, getTodaysLeads : payload}

        case GET_TOTAL_LEADS:
            return {...state, getTotalLeads : payload}

        case GET_LEADS_GROWTH:
                return {...state, getLeadsGrowth : payload}

        case GET_MONTH_LEADS:
                return {...state , getMonthLeads : payload}

        case CONVERTED_LEAD_CARD : 
            return {...state, convertedLeadsCard : payload}

        case CONVERTED_LEAD_VALUE_CARD : 
            return {...state, convertedLeadsValueCard : payload}

        case CONVERTED_LEADS_AND_VALUES_CHART : 
            return {...state, convertedLeadsAndValuesChart : payload}

        case GET_ALL_LEADS:
            return {...state, allLeads: payload}

        case CREATE_NEW_ACCOUNT : 
            return {...state, createAccount : payload}

        case GET_ACTIVE_LEADS :
            return {...state, getActiveLeads : payload}

        case GET_SALES_LEADS :
            return {...state, getSalesLeads : payload}
            
        case APPROX_VALUE_BASED_ON_LEAD_SOURCE:
            return {...state, approxValueBasedOnLeadSource: payload}
            
        case GET_LEADS_PIPELINE :
            return {...state, getleadsPipeline : payload}

        case SET_LEAD_STATUS:
            return {...state, leadManagementStatus: payload}

        case CREATED_BY_UPDATED_BY_FULL_NAME:
            return {...state, createdByUpdatedByFullName: payload}

        case GET_LEADS_CUSTOMERS:
            return {...state, getLeadsCustomers: payload}

        case LEADS_DAILY_REPORT : 
            return {...state, getLeadsDailyReport : payload}

        case WORKING_CONTACTED_LEADS : 
            return {...state, getWorkingContactedLeads : payload}

        case OPEN_NOTCONTACTED_LEADS :
            return {...state, getOpenNotcontactedLeads : payload}

        case CLOSED_NOTCONVERTED_LEADS :
            return {...state, getClosedNotconvertedLeads : payload}

        case WHATSAPP_LEAD_PROPOSAL :
            return {...state, get_whatsapp_proposal : payload}

        default: 
            return {...state}
    }
}

export default leadManagementReducers