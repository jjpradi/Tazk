import http from '../http-common';


class DashboardRoleService {
    dashboarddata(data) {
      return http.post('/dashboard/dashboarddata',data);
    }

    getdashboardlist() {
        return http.get(`/dashboard/dashboardList`);
      }

    getDashboardRoleData(id) {
        return http.get(`/dashboard/dashboardListByRole/${id}`);
      }

     widgetsDetails() {
        return http.get(`/dashboard/widgets`);
     }
      
    updateDashboardList(data){
      return http.put(`/dashboard/updateDashboardList`,data)
    }

    getDashboardListByRole(id) {
      return http.get(`/dashboard/listDashboardByRole/${id}`);
    }

    getDashboardLayout(data) {
      return http.post(`/dashboard/layouts`, data);
  }
  
    resetDashboardLayout(data) {
      return http.put(`/dashboard/resetLayouts`,data);
    }

    salaryBasedDepartment() {
      return http.get(`/dashboard/salaryBasedDepartment`);
    }

    salaryBasedCategory() {
      return http.get(`/dashboard/salaryBasedCategory`);
    }

    genderPercentage() {
      return http.get(`/dashboard/genderPercentage`);
    }

    departmentBasedEmp() {
      return http.get(`/dashboard/departmentBasedEmp`);
    }

    overallAttPercentage() {
      return http.get(`/dashboard/overallAttPercentage`);
    }

    leaveTypePercentage() {
      return http.get(`/dashboard/leaveTypePercentage`);
    }

    attBasedDepartment() {
      return http.get(`/dashboard/attBasedDepartment`);
    }

    attendanceStatistics() {
      return http.get(`/dashboard/attendanceStatistics`);
    }

    getDashboardData() {
      return http.get(`/dashboard/getDashboardData`);
    }

}

export default new DashboardRoleService();