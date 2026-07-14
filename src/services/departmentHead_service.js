import http from '../http-common';
class DepartMentHead {


    getAll(data) {
        return http.post(`/departmentHead`,data);
    }


    create(data) {
        return http.post(`/departmentHead/createDepartmentHead`, data)
    }


    getDeptBaseEmpFilter(data) {
        return http.post(`/departmentHead/getDeptBase/EmpHead`, data)
    }

    update(id,data) {
        return http.put(`/departmentHead/${id}`,data)
    }

    delete(id) {
        return http.delete(`/departmentHead/${id}`)
    }

    getbyid(id) {
        return http.get(`/departmentHead/getByid/${id}`)
    }


    getRoleName(id) {
        return http.get(`/departmentHead/employee_id/role/fetch/${id}`)
    }


    createDepartment(data) {
        return http.post(`/departmentHead/create/Department`, data)
    }


    getDepartment(data) {
        return http.post(`/departmentHead/get/departmentSearch`, data)
    }

    getDepartmentById(id) {
        return http.post(`/departmentHead/getDepartment/byId/${id}`)
    }

    updateDepartment(id,data) {
        return http.put(`/departmentHead/updateOrDeleteDepartment/${id}`,data)
    }

    deleteDepartment(id) {
        return http.delete(`/departmentHead/updateOrDeleteDepartment/${id}`)
    }



}

export default new DepartMentHead();
