// import assetManagement_services from "services/assetManagement_services";
// import { CREATE_ASSETMANAGEMENT, GET_ASSET_GROUP, GET_ASSET_TYPE ,CREATE_CODE, UPDATE_ASSET} from "redux/actionTypes";
// import { ErrorAlert } from "./load";

// export const CreateAssetManagement =
//   (data ) =>
//   async (dispatch) => {
//     try {
//       const res = await assetManagement_services.create(data);
//       if (res.data.changedRows === 1) CreateAlert(dispatch);
//       dispatch({
//         type:CREATE_ASSETMANAGEMENT,
//         payload: res.data,
//       });
//     //   successmsg(sample);
//       return Promise.resolve(res.data);
//     } catch (err) {
//       ErrorAlert(dispatch, err);
//     //   errormsg(sample);
//       return Promise.reject(err);
//       // }
//     }
//   };

  
// export const updateAssetAction =(data) =>
// async (dispatch) => {
//   try {
//     const res = await assetManagement_services.update(data);
//     if (res.data.changedRows === 1);
//     dispatch({
//       type:UPDATE_ASSET,
//       payload: res.data,
//     });
//   //   successmsg(sample);
//     return Promise.resolve(res.data);
//   } catch (err) {
//     ErrorAlert(dispatch, err);
//   //   errormsg(sample);
//     return Promise.reject(err);
//     // }
//   }
// };



//   export const getAssetGroupIdAction=()=>async(dispatch)=>{
//     try{
//       const res = await assetManagement_services.getAssetGroup();
//       if (res.status === 200) {
//         dispatch({
//           type: GET_ASSET_GROUP,
//           payload: res.data,
//         });
//     }
//     return Promise.resolve("API_FINISHED_SUCCESS");
//   }catch (err) {
//     // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
//     ErrorAlert(dispatch, err);
//     //}
//     return Promise.reject("API_FINISHED_ERROR");
//   }
// };

// export const getAssetTypeIdAction=()=>async(dispatch)=>{
//   try{
//     const res = await assetManagement_services.getAssetType();
//     if (res.status === 200) {
//       dispatch({
//         type: GET_ASSET_TYPE,
//         payload: res.data,
//       });
//   }
//   return Promise.resolve("API_FINISHED_SUCCESS");
// }catch (err) {
//   // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
//   ErrorAlert(dispatch, err);
//   //}
//   return Promise.reject("API_FINISHED_ERROR");
// }
// };


// // export const createCode =(data) =>
// //   async (dispatch) => {
// //     try {
// //       const res = await assetManagement_services.createCode(data);
// //       if (res.data.changedRows === 1) CreateAlert(dispatch);
// //       dispatch({
// //         type:CREATE_CODE,
// //         payload: res.data,
// //       });
// //       return Promise.resolve(res.data);
// //     } catch (err) {
// //       ErrorAlert(dispatch, err);
// //     //   errormsg(sample);
// //       return Promise.reject(err);
// //       // }
// //     }
// //   };