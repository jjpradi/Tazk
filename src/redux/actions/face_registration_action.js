import { BIOMETRIC_REG, GET_BIOMETRIC_REG, GET_FACE_REGISTRATION_BY_ID, GET_FACE_URL, GET_SEARCH_FACE_REGISTRATION, SET_BIOMETRIC_REG, SET_SEARCH_FACE_REGISTRATION } from 'redux/actionTypes';
import faceRegistration from 'services/face_registration';
import { DeleteAlert, deRegister, ErrorAlert } from './load';


export const getRecordsofFaceRegisteredUsers =
(data,response) =>
  async (dispatch) => {
    try {

      const res = await faceRegistration.get(data);
      if (res.status === 200) {
        dispatch({
          type: SET_SEARCH_FACE_REGISTRATION,
          payload: res.data,
        });
        if(response){
          response(res.data)
        }
      }

      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {

      ErrorAlert(dispatch, err);

      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getRecordsById =
(id,response) =>
  async (dispatch) => {
    try {

      const res = await faceRegistration.getById(id);
      console.log("sadas",res)
      if (res.status === 200) {
        dispatch({
          type: GET_FACE_REGISTRATION_BY_ID,
          payload: res.data,
        });
        if(response){
          response(res.data)
        }
      }

      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {

      ErrorAlert(dispatch, err);

      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  
  export const getFaceAttendanceUrlAction =
(response) =>
  async (dispatch) => {
    try {

      const res = await faceRegistration.getFaceAttendanceUrl();
      // console.log("sadas",res)
      if (res.status === 200) {
        dispatch({
          type: GET_FACE_URL,
          payload: res.data,
        });
        if(response){
          response(res.data?.length ? res.data[0]?.face_attendance_url : '')
        }
      }

      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {

      ErrorAlert(dispatch, err);

      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const deleteRegisteredUser =
(id,response) =>
  async (dispatch) => {
    try {

      const res = await faceRegistration.delete(id);
  
      if(res.status === 200){
        deRegister(dispatch);
        if(response){
          response(res.data)
        }
        // dispatch({
        //   type: SET_SEARCH_FACE_REGISTRATION,
        //   payload: res.data,
        // });
       
      }
     
     

      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {

      ErrorAlert(dispatch, err);

      return Promise.reject("API_FINISHED_ERROR");
    }
  };



  export const setSearchFaceRegistrationState = (data) => {
    return {
      type: SET_SEARCH_FACE_REGISTRATION,
      payload: data
    }
  };
  
  export const getSearchFaceRegistrationState = (body, setModalTypeHandler, setLoaderStatusHandler) => {
   console.log("body",body)
    return {
      type: GET_SEARCH_FACE_REGISTRATION,
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };

  export const biometricRegistrationAction =
  (data) =>
    async (dispatch) => {
      try {
  
        const res = await faceRegistration.biometricRegistration(data);
    
        if(res.status === 200){
         
          dispatch({
            type: BIOMETRIC_REG,
            payload: res.data,
          });
         
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
  
        ErrorAlert(dispatch, err);
  
        return Promise.reject("API_FINISHED_ERROR");
      }
    };

      export const BiometricAction=(data)=> async(dispatch)=>{
        try{
          const res = await faceRegistration.biometric(data)
          console.log(res,'sdsssssssss')
          if(res.status === 200){
            dispatch({
              type :GET_BIOMETRIC_REG,
              payload : res.data
            })
          }
          return Promise.resolve('API_FINISHED_SUCCESS')
        }
        catch(err){
          return Promise.reject('API_FINISHED_ERROR')
        }
      }

        export const getBioMetricAction = (data)=>{
          return {
            type : GET_BIOMETRIC_REG,
            payload : data
          }
        }
      
        export const setBioMetricAction = (body,setModalTypeHandler,setLoaderStatusHandler)=>{
          return{
            type : SET_BIOMETRIC_REG,
            body,
            setModalTypeHandler,
            setLoaderStatusHandler
          }
        }