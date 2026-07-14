import http from '../http-common';

class FaceRegistration {

    get(data){
        return http.post(`/faceRegistration`, data)
    }

    
    getFaceAttendanceUrl(){
        return http.get(`/userCreation/getFaceAttendanceUrl/data`)
    }

    delete(id) {
        return http.put(`/faceRegistration/${id}`)
    }

    getById(id) {
        return http.get(`/faceRegistration/byid/${id}`)
    }

    biometricRegistration(data){
        return http.post('/faceRegistration/biometricRegistration',data)
    }

    biometric(data){
        return http.post('/faceRegistration/getBiometricDetails',data)
    }
}


export default new FaceRegistration();
