import { DataArrayRounded } from '@mui/icons-material';
import http from '../http-common';
class assetManagement{
create(data) {
    return http.post(`/assetManagement/createAsset`, data)
  }

  update(data){
    return http.post(`/assetManagement/updateAsset`,data)
  }

 getAssetGroup(data){
  return http.get(`/assetManagement/getAssetGroup`)
 }  

 getAssetType(data){
  return http.get(`/assetManagement/getAssetType`)
 }



//  createCode(data){
//   return http.post(`/assetManagement/createCode`,data)
//  }
 
}

export default new assetManagement();