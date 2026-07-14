import { 
    CAMPAIGN_STATUS,
    CAMPAIGN_TYPE,
    CREATE_CAMPAIGN,
    GET_CAMPAIGN_LEAD_COUNT,
    GET_ACTIVE_CAMPAIGN,
    GET_CAMPAIGN_TIMELINE,
    SET_LIST_CAMPAIGN,
    UPDATE_CAMPAIGN_STATUS,
    CAMPAIGN_CONVERTED_LEADS_COUNT,
    SET_CAMPAIGN_LEADS,
    GET_ALL_CAMPAIGN
} from "redux/actionTypes"

const initialState = {
    campaignList : [],
    campaignListCount : [],
    createCampaign : [],
    campaignTypeList : [],
    campaignStatusList : [],
    campaignStatusHistory : [],
    getCampaignTimeline : [],
    getCampaignLeadCount : [],
    activeCampaign: [],
    convertLeadsCountValue: [],
    campaignLeadsList : [],
    campaignLeadsListCount : [],
    getAllCampaign : []
}

function CampaignReducers (state = initialState, action) {
    const { type, payload } = action

    switch (type) {
        case SET_LIST_CAMPAIGN : 
            return {...state, campaignList : payload.data, campaignListCount : payload.numRows}

        case CREATE_CAMPAIGN : 
            return {...state, createCampaign : payload}

        case CAMPAIGN_TYPE :
            return {...state, campaignTypeList : payload}
        
        case CAMPAIGN_STATUS : 
            return {...state, campaignStatusList : payload}

        case UPDATE_CAMPAIGN_STATUS :
            return {...state, campaignStatusHistory : payload}

        case GET_CAMPAIGN_TIMELINE : 
            return {...state, getCampaignTimeline : payload}

        case GET_CAMPAIGN_LEAD_COUNT : 
            return {...state, getCampaignLeadCount : payload}
            
        case GET_ACTIVE_CAMPAIGN:
            return {...state, activeCampaign: payload}

        case CAMPAIGN_CONVERTED_LEADS_COUNT:
            return {...state, convertLeadsCountValue: payload}

        case SET_CAMPAIGN_LEADS :
            return {...state, campaignLeadsList : payload.data, campaignLeadsListCount : payload.numRows}

            case GET_ALL_CAMPAIGN:
                return {...state, getAllCampaign: payload}

        default : 
            return state
    }
}

export default CampaignReducers