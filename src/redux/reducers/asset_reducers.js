import { SET_SEARCH_ASSET,
        // LIST_ASSETS, 
        LIST_ASSET_TIMELINE, 
         CREATE_ASSIGN, 
         SET_SCRAP_ASSET, 
         CREATE_ASSETMANAGEMENT, 
         UPDATE_ASSET, 
         GET_IMAGE,GET_ASSET_GROUP, 
         GET_ASSET_TYPE,
         INSERT_NEW_ASSET_TYPE, 
         CREATE_MOVE, 
         GET_ASSET_CODE,
         GET_MOVE_ASSET,
         GET_DYNAMIC_PROP_BY_ASSET_TYPE,
         UPDATE_IMAGE,
         SET_ASSIGN_DATA, 
         SET_DYNAMIC_PROP,
         GET_DYNAMIC_PROP,
         ASSET_DETAILS,
         GET_SEARCH_ASSEST,
         SET_LIST_ASSIGN,
         INSERT_ASSET_WARRANTY,
         SET_SEARCH_WARRANT,
         GET_SEARCH_WARRANT,
         GET_SEARCH_DYNAMIC_PROP,
         SET_SEARCH_DYNAMIC_PROP,
         SET_ASSET_GROUP,
         SET_ASSET_TYPE,
         ASST_CONDITION_DASH,
         GET_ASSETNAME_LIST,
         SET_SEARCH_GROUP,
         SET_SEARCH_TYPE,
         GET_SEARCH_GROUP,
         GET_SEARCH_TYPE,
         ASST_AUDIT_DASH,
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
         GET_DELIVERY_DATE,
         GET_SCRAP_ASSET_APPROVALS,
         DELETE_SCRAP_APPROVALS,
         GET_SCRAP_ASSET_BY_ID,
         SCRAP_ASSET_CONFIG,
         SET_SCRAP_ASSET_REPORT,
         SCRAP_ASSET_UNSEEN_DATA,
         ADD_REMINDER,
         GET_REMINDER,
         GET_WARRANTY_TYPE,
         CREATE_ASST_GENERAL,
         UPDATE_ASST_GENERAL,
         DELETE_ASST_GENERAL,
         GET_ASST_GENERAL,
         SET_ASST_GENERAL,
         GET_ASSET_CALENDAR,
         GET_WARRANTY_BY_ID,
         UPDATE_WARRANTY,
         RENEW_WARRANTY,
         DELETE_RENEWALS,
        } 
    from "redux/actionTypes";
import { CREATE_COMPLIANCE, CREATE_RENTAL_TENANT, GET_RENTALS_AND_TENANTS, SET_RENTALS_AND_TENANTS, UPDATE_COMPLIANCE, GET_RENTAL_TENANT_BY_ID, UPDATE_RENTAL_TENANT, DELETE_RENTAL_TENANT } from "../actionTypes";

const initialState = {
    assetsList: [],
    searchAssets: [],
    assetsListCount: 0,
    timelineList:[],
    assignList:[],
    assignCreate:[],
    updateAsset:[],
    getImage:[],
    updateImage:[],
    getAssetGroup:[],
    insertNewAssetType:[],
    getAssetType:[],
    getAssetCode:[],
    moveCreate:[],
    getDynamicPropByAssetType: [],
    getMove:[],
    searchAssignData: [],
    searchAssignCount:[],
    assignListCount:[],
    assetsAssignedTo:[],
    assetsAssignedToCount:[],
    getDynamicProp: [],
    insertAssetwarranty:[],
    getwarrantData:[],
    setwarrantData:[],
    getWarrantCount:[],
    getAssetConditionDash:[],
    getAssetName : [],
    getAssetAuditDash : [],
    assetFields: [],
    scrapAsset : [],
    getTotalAssets:[],
    getUnAudited:[],
    topAssets:[],
    assignedCard : [],
    warrantyByAsset: [],
    totalAssetvalues:[],
    assetStatusCount: [],
    assetLocationDashboard: [],
    assetTypeCard : [],
    totalYearValueCard : [],
    getInitialAssetGroup: [],
    getAssetGroupInitial: [],
    getInitialAssetType: [],
    getAssetTypeInitial: [],
    deliveryDate: [],
    scrapAssetApprovals : [],
    scrapAssetApprovalsUnseenCount : 0,
    scrapAssetApprovalsTotalCount : 0,
    scrapAssetById : [],
    scrapAssetConfig : [],
    scrapAssetReport : [],
    get_event_reminder : [],
    add_event_reminder : [],
    getRentalAndTenants : [],
    create_rental_tenant : [],
    rental_tenant_by_id : null,
    update_rental_tenant : [],
    delete_rental_tenant : [],
    create_complaince : [],
    get_asset_warranty : [],
    create_asst_general : [],
    get_asst_general : [],
    get_asst_calendar : [],
    get_asst_warranty : [],
    update_warranty: [],
    renew_warranty: [],
    delete_renewals: [],
    update_compliance: []
}

function AssetReducers(state = initialState, action) {

    const{type, payload} = action
    switch(type){
        case SET_SEARCH_ASSET:
            return {...state, assetsList: payload};

        case GET_SEARCH_ASSEST:
            return {...state, searchAssets: payload}

        case LIST_ASSET_TIMELINE:
            return {...state, timelineList: payload}

        case GET_ASSETNAME_LIST : 
            return {...state, getAssetName: payload}

        case SET_LIST_ASSIGN:
            return {...state, assignList: payload.data,assignListCount:payload.numRows}

        case CREATE_ASSIGN:
            return {...state, assignCreate: payload}

        case GET_UN_ASSIGN:
            return {...state,getUnAssign:payload}

        case GET_TOTAL_ASSETS:
            return {...state,getTotalAssets:payload}

        case GET_UN_AUDITED_DATA:
            return {...state,getUnAudited:payload}

        case TOP_ASSETS_BY_VALUE:
            return {...state,topAssets:payload}

        case SET_SCRAP_ASSET:
            return{...state, scrapAsset: payload}

        case CREATE_ASSETMANAGEMENT:
            return { ...state, assetsList: payload.data, assetsListCount: payload.numRows};

        case UPDATE_ASSET:
            return{...state,updateAsset:payload};

        case GET_IMAGE:
            return{...state,getImage:payload};

        case UPDATE_IMAGE:
            return{...state,updateImage:payload};

        case GET_ASSET_GROUP:
            return{...state,getAssetGroup:payload};

        case GET_ASSET_GROUP_INITIAL:
            return{...state,getInitialAssetGroup:payload};

        case INSERT_NEW_ASSET_TYPE:
            return{...state,insertNewAssetType:payload};

        case GET_ASSET_TYPE:
            return{...state,getAssetType:payload};

        case GET_INITIAL_ASSET_TYPE:
            return{...state,getInitialAssetType:payload};

        case GET_ASSET_CODE:
            return{...state,getAssetCode:payload};
     
        case CREATE_MOVE:
            return{...state, moveCreate: payload}
            
        case GET_MOVE_ASSET:
            return{...state,getMove:payload};
        
        case SET_DYNAMIC_PROP:
            return{...state, getDynamicPropByAssetType: payload}

        case GET_DYNAMIC_PROP_BY_ASSET_TYPE:
            return{...state, getDynamicPropByComp: payload}

            case SET_ASSIGN_DATA:
            return { ...state, assetsAssignedTo: payload.data, assetsAssignedToCount: payload.numRows};

        case GET_DYNAMIC_PROP:
            return{...state, getDynamicProp: payload}

        case ASSET_DETAILS :
            return {...state , assetDetails : payload}

        case INSERT_ASSET_WARRANTY:
            return{...state,insertAssetwarranty: payload}


        case SET_SEARCH_WARRANT:
            return {...state,getwarrantData:payload?.data,getWarrantCount:payload?.numRows}
        case GET_SEARCH_DYNAMIC_PROP:
            return {...state, getDynamicProp: payload}
        case GET_SEARCH_GROUP:
            return {...state, getAssetGroup: payload}
        case GET_SEARCH_TYPE:
            return {...state, getAssetType: payload}

        case SET_SEARCH_DYNAMIC_PROP:
            return {...state, getDynamicProp: payload}

        case SET_SEARCH_GROUP :
            return {...state, getAssetGroup:payload}

        case SET_SEARCH_GROUP_INITIAL :
            return {...state, getAssetGroupInitial:payload}

        case SET_SEARCH_TYPE :
            return {...state,getAssetType:payload}

        case SET_INITIAL_SEARCH_TYPE :
            return {...state,getAssetTypeInitial:payload}

        case SET_ASSET_GROUP:
            return {...state, getAssetGroup: payload}

        case SET_ASSET_TYPE:
            return {...state, getAssetType: payload}

        case ASST_CONDITION_DASH:
            return {...state,getAssetConditionDash:payload}

        case TOTAL_ASSET_VALUE:
            return {...state,totalAssetvalues:payload}

        case ASST_AUDIT_DASH:
        return {...state,getAssetAuditDash:payload}

        case ASSET_FIELDS: 
            return {...state, assetFields: payload}

        case ASSIGNED_CARD : 
            return {...state, assignedCard : payload}
            
        case GET_WARRANTY_BY_ASSET:
            return {...state, warrantyByAsset: payload}

        case ASSET_STATUS_COUNT:
            return {...state, assetStatusCount: payload}

        case GET_DELIVERY_DATE:
            return {...state, deliveryDate: payload}

        case ASSET_LOCATION_DASHBOARD:
            return {...state, assetLocationDashboard: payload}
            
        case ASSET_TYPE_CARD_CHART : 
            return {...state, assetTypeCard : payload}

        case ASSET_FASCALYEAR_TOTAL : 
            return {...state, totalYearValueCard : payload}

        case GET_SCRAP_ASSET_APPROVALS :
            return {...state, scrapAssetApprovals : payload.data, scrapAssetApprovalsUnseenCount : payload.unseenCount, scrapAssetApprovalsTotalCount : payload.totalCount}
            
        case DELETE_SCRAP_APPROVALS : {
            const deletedId = payload
            const filtered = (state.scrapAssetApprovals || []).filter(
                a => a.scrap_id !== deletedId
            )
            return {
                ...state,
                scrapAssetApprovals : filtered,
                scrapAssetApprovalsTotalCount : Math.max(0, (state.scrapAssetApprovalsTotalCount || 0) - 1),
            }
        }
        case GET_SCRAP_ASSET_BY_ID : 
            return {...state, scrapAssetById : payload}

        case SCRAP_ASSET_CONFIG : 
            return {...state, scrapAssetConfig : payload}

        case SET_SCRAP_ASSET_REPORT : 
            return {...state, scrapAssetReport : payload}

        case ADD_REMINDER : 
            return {...state, add_event_reminder : payload}

        case GET_REMINDER : 
            return {...state, get_event_reminder : payload}

        case SCRAP_ASSET_UNSEEN_DATA : 
            return {...state, scrapAssetApprovalsUnseenCount : payload.unseenCount}

        case SET_RENTALS_AND_TENANTS : 
            return {...state, getRentalAndTenants : payload}

        case CREATE_RENTAL_TENANT :
            return {...state, create_rental_tenant : payload}

        case GET_RENTAL_TENANT_BY_ID :
            return {...state, rental_tenant_by_id : payload}

        case UPDATE_RENTAL_TENANT :
            return {...state, update_rental_tenant : payload}

        case DELETE_RENTAL_TENANT :
            return {...state, delete_rental_tenant : payload}

        case CREATE_COMPLIANCE :
            return {...state, create_complaince : payload}

        case UPDATE_COMPLIANCE :
            return {...state, update_compliance : payload}

        case GET_WARRANTY_TYPE : 
            return {...state, get_asset_warranty : payload}

        case CREATE_ASST_GENERAL : 
            return {...state, create_asst_general : payload}

        case UPDATE_ASST_GENERAL :
            return {...state, update_asst_general : payload}

        case DELETE_ASST_GENERAL :
            return {...state, delete_asst_general : payload}

        case SET_ASST_GENERAL : 
            return {...state, get_asst_general : payload}

        case GET_ASSET_CALENDAR : 
            return {...state, get_asst_calendar : payload}

        case GET_WARRANTY_BY_ID : 
            return {...state, get_asst_warranty : payload}

        case UPDATE_WARRANTY:
            return { ...state, update_warranty: payload }

        case RENEW_WARRANTY:
            return { ...state, renew_warranty: payload }

        case DELETE_RENEWALS:
            return { ...state, delete_renewals: payload }

        default:
            return state;
    }

}

export default AssetReducers
