import { CREATE_DEPARTMENT, CREATE_DEPARTMENTS_HEAD, DELETE_DEPARTMENT, DELETE_DEPARTMENTS_HEAD, GET_BY_ID_DEPARTMENTS_HEAD, GET_DEPARTMENT, GET_DEPARTMENT_BASED_EMPLOYEE_FOR_DEPARTMENT_HEAD, GET_DEPARTMENT_BY_ID, GET_DEPT_BASE_EMP_FILTER, GET_ROLENAME, GET__SEARCH_DEPARTMENT_BASED_EMPLOYEE_FOR_DEPARTMENT_HEAD, LIST_DEPARTMENTS_HEAD, SET_SEARCH_DEPARTMENT, SET_SEARCH_DEPARTMENTS_HEAD, SET_SEARCH_DEPARTMENT_BASED_EMPLOYEE_FOR_DEPARTMENT_HEAD, UPDATE_DEPARTMENT, UPDATE_DEPARTMENTS_HEAD } from "redux/actionTypes";


const initialState = {
    departmentHeadList: [],
    departmentHeadgetbyid: [],
    departmentHeadCreate: [],
    departmentHeadUpdate: [],
    departmentHeadDelete: [],
    getRoleName: [],
    getDepartmentBasedEmployeeFilter: [],
    getDepartmentHeadSearch: [],
    getDepartmentHeadCount: 0,
    searchDepartmentBasedEmployee: [],
    getDepartmentBasedEmployeeFilterDepartmentHead: [],
    departmentList: [],
    departmentCreate: [],
    departmentUpdate: [],
    departmentDelete: [],
    getDepartmentCount: 0,
    getDepartmentSearch: [],
    departmentgetbyid: []
};

function DepartmentHeadReducer(state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
        case LIST_DEPARTMENTS_HEAD:
            return { ...state, departmentHeadList: payload };
        case CREATE_DEPARTMENTS_HEAD:
            return { ...state, departmentHeadCreate: payload };
        case GET_BY_ID_DEPARTMENTS_HEAD:
            return { ...state, departmentHeadgetbyid: payload };
        case UPDATE_DEPARTMENTS_HEAD:
            return { ...state, departmentHeadUpdate: payload };
        case DELETE_DEPARTMENTS_HEAD:
            return { ...state, departmentHeadDelete: payload };

        case GET_ROLENAME:
            return { ...state, getRoleName: payload };
        case GET_DEPARTMENT_BY_ID:
            return { ...state, departmentgetbyid: payload };
        case GET_DEPARTMENT:
            return { ...state, departmentList: payload };
        case CREATE_DEPARTMENT:
            return { ...state, departmentCreate: payload };
        case UPDATE_DEPARTMENT:
            return { ...state, departmentUpdate: payload };
        case DELETE_DEPARTMENT:
            return { ...state, departmentDelete: payload };

        case SET_SEARCH_DEPARTMENT:
            return { ...state, getDepartmentSearch: payload.data, getDepartmentCount: payload.numRows }


        case GET_DEPARTMENT_BASED_EMPLOYEE_FOR_DEPARTMENT_HEAD:
            return { ...state, getDepartmentBasedEmployeeFilterDepartmentHead: payload }

        case SET_SEARCH_DEPARTMENTS_HEAD:
            return { ...state, getDepartmentHeadSearch: payload.data, getDepartmentHeadCount: payload.numRows }



        case SET_SEARCH_DEPARTMENT_BASED_EMPLOYEE_FOR_DEPARTMENT_HEAD:
            return { ...state, searchDepartmentBasedEmployee: payload }

        default:
            return state;
    }
}

export default DepartmentHeadReducer;
