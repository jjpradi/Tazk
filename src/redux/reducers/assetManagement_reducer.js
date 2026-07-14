
// import {
//     CREATE_ASSETMANAGEMENT,
//     GET_ASSET_GROUP,
//     GET_ASSET_TYPE,
//     CREATE_CODE,
//     UPDATE_ASSET
 
// } from '../actionTypes';

// const initialState={
//     assetmanagementlist:[],
//     updateAsset:[],
//     getAssetGroup:[],
//     getAssetType:[],
//     // code:[]

    
// }

// function assetManagementReducers(state = initialState, action){
//     const{type,payload}=action;
//   switch(type){
//     case CREATE_ASSETMANAGEMENT:
//       return { ...state, assetmanagementlist: payload };

//       case UPDATE_ASSET:
//         return{...state,updateAsset:payload};

//       case GET_ASSET_GROUP:
//         return{...state,getAssetGroup:payload};

//         case GET_ASSET_TYPE:
//           return{...state,getAssetType:payload}
          
//           // case CREATE_CODE:
//           //   return{...state,code:payload}
            
//       default:
//         return state;
//   }
// }

// export default assetManagementReducers;
export default (state = {}, action) => state;