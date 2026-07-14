import {CREATE_SALARY, GET_SEARCH_PROCESS_SALARY, GET_SEARCH_SALARY,UPDATE_PROCESS_STATUS,GET_PARTIAL_DETAIL, 
  LIST_SALARY,GET_PROCESSED_MONTH, SEARCH_PAYSLIP_ACTION, SEARCH_PAYSLIP_REPORT, 
  SET_SEARCH_PROCESS_SALARY, 
  SET_SEARCH_SALARY,
  GET_DEDUCTION_TYPE,
  GET_ALLOWANCE_TYPE,
  CREATE_SALARY_STRUCTURE,
  GET_ALL_SALARY_STRUCTURE,
  MAP_SALARY_STRUCTURE,
  GET_MAP_DETAIL,
  GET_SEARCH_SALARY_STRUCTURE,
  SET_SEARCH_SALARY_STRUCTURE,
  GET_SALARY_REPORT_FOR_BANK,
  GET_ALL_SALARY_STRUCTURE_WITH_ALLOWANCE_AND_DEDUCTION,
  GET_SEARCH_REPORT_BANK,
  GET_SALARY_REPORT,
  SET_SALARY_REPORT,
  GET_SALARY_CONFIRMED,
  COST_SUMMARY_REPORT,
  SET_SEARCH_COST_SUMMARY_REPORT_ACTION,
  GET_SEARCH_COST_SUMMARY_REPORT_ACTION,
  GET_SALARY_STATEMENT,
  SET_SALARY_STATEMENT,
  PAY_SLIP_REPORT_TEMP,
  GET_SALARY_CONFIRMED_YEAR,
  SET_SALARY_TEMPLATE,
  GET_STRUCTURE_BASED_TEMPLATE,
  GET_TEMPLATE_BYID,
  GET_SALARY_TEMPLATE,
  SALARY_PERCENT,
  PF_ESI_PT,
  PT_SLABS,

} from '../actionTypes';
import salary_services from 'services/salary_services';
import {
  ListLoad,
  FailLoad,
  ErrorAlert,
  CreateAlert,
  successmsg,
  errormsg,
  UpdateAlert,
  processSalaryUpdateAlert,
  createSalaryUpdateAlert,
  errorSalaryUpdateAlert,
  CannotDeleteAlert,
  SalaryProcessAlert,
  DeleteAlert,
  commonAlert,
  ExistAlert,
  salaryAllowanceDeductionAlert,
  templateNameExists,
  structureNameExists,
} from './load';
import { deleteAction} from './actions';

export const ListSalaryAction =
  (setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await salary_services.getAll();
      if (res.status === 200) {
        dispatch({
          type: LIST_SALARY,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


  export const CreateSalary =
  (
   
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
    sample,
    
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await salary_services.create(data);
      if (res.status === 200 )
        CreateAlert(dispatch);
      dispatch({
        type: SET_SEARCH_SALARY,
        payload: res.data,
      });
      successmsg(sample);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve(res.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      errormsg(sample);
      return Promise.reject(err);
      // }
    }
  };

  export const setSearchSalaryState = (data) => {
    // return {
    //   type: SET_SEARCH_SALARY,
    //   payload: data
    // }
    return {
      type: GET_ALL_SALARY_STRUCTURE,
      payload: data,
    };
  };
  
  
  export const getSearchSalaryAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: GET_SEARCH_SALARY,
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };

export const setSearchSalaryAction = (data) => {
  return {
    type: SET_SEARCH_SALARY,
    payload: data,
  };
};

  
export const searchProcessSalaryState = (data) => {
  return {
    type: SET_SEARCH_PROCESS_SALARY,
    payload: data
  }
};


export const searchProcessSalaryAction = (body, commoncookie, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type: GET_SEARCH_PROCESS_SALARY,
    body,
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler
  }
};

export const processSalaryPaginationAction =
  (data, commoncookie) =>
    async (dispatch) => {
      try {
        const res = await salary_services.processSalaryPagination(data, commoncookie);
        if (res.status === 200) {
          dispatch({
            type: SET_SEARCH_PROCESS_SALARY,
            payload: res.data,
          });
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
    };
export const deleteSalaryStructureAction =
  (id,response) =>
    async (dispatch) => {
      try {
        const res = await salary_services.deleteSalaryStructureService(id);
        if(res.data.message && res.data.message === 'CANNOT DELETE'){
          CannotDeleteAlert(dispatch, res.data);
        }
        else {
          dispatch({
            type: SET_SEARCH_SALARY_STRUCTURE,
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

export const createProcessSalaryAction =
  (data, callback) =>
    async (dispatch) => {
      try {
        const res = await salary_services.createProcessSalary(data);
        if (res.status === 200) {
          const res1 = await salary_services.processSalaryPagination(data, data.employeeId[0]);
          if (res1.status === 200) {
            //const res2 = await salary_services.getProcessedBasedMonth();
            dispatch({
              type: SET_SEARCH_PROCESS_SALARY,
              payload: res1.data,
            });
          }
          // if (res.data === "PROCESSED") {
          //   processSalaryUpdateAlert(dispatch, res.data)
          // }
          if (res.data === "CREATE SALARY") {
            createSalaryUpdateAlert(dispatch, "CREATE SALARY")
          } 
          else if (res.data?.job_status === 'DONE') {
            callback(res.data);
            // processSalaryUpdateAlert(dispatch, "Processed")
          }else if(res.data?.message === 'Already Processed'){
            SalaryProcessAlert(dispatch, res.data.message)
          } else if(res.data?.message === 'Check Joining date of the employees'){
            callback(res.data);
          }else{
            errorSalaryUpdateAlert(dispatch, "Something Went Wrong!")
          }
        }
          return Promise.resolve("API_FINISHED_SUCCESS");
        } catch (err) {
          ErrorAlert(dispatch, err);
          return Promise.reject("API_FINISHED_ERROR");
        }
      };

export const updateProcessSalaryAction =
  (data, commoncookie) =>
    async (dispatch) => {
      try {
        const res = await salary_services.updateProcessSalary(data, commoncookie);
        if (res.status === 200) {
          dispatch({
            type: SEARCH_PAYSLIP_REPORT,
            payload: res.data,
          });
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
    };

export const deleteProcessSalaryAction =
  (commoncookie, month) =>
    async (dispatch) => {
      try {
        const res = await salary_services.deleteProcessSalary(commoncookie, month);
        if (res.status === 200) {
          dispatch({
            type: SET_SEARCH_PROCESS_SALARY,
            payload: res.data,
          });
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
    };

  export const salaryPaginationAction =(data) =>async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await salary_services.pagination(data);
      if (res.status === 200) {
        dispatch({
          type: SET_SEARCH_SALARY,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
};
  
export const paySlipReportPaginationAction =
  (data, commoncookie,response) =>
    async (dispatch) => {
      try {
        const res = await salary_services.paySlipReportPagination(data, commoncookie);
        if (res.status === 200) {
          dispatch({
            type: SEARCH_PAYSLIP_REPORT,
            payload: res.data,
          });
        }
        if (response) {
          response(res.data);
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
    };

export const searchPaySlipReportState = (data) => {
  return {
    type: SEARCH_PAYSLIP_REPORT,
    payload: data
  }
};


export const searchPaySlipReportAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type: SEARCH_PAYSLIP_ACTION,
    body,
    setModalTypeHandler,
    setLoaderStatusHandler
  }
};
    

export const getDetailsBasedonMonth = () =>
    async (dispatch) => {
      try {
        const res = await salary_services.getProcessedBasedMonth();
        if (res.status === 200) {
          dispatch({
            type: GET_PROCESSED_MONTH,
            payload: res.data,
          });
          console.log(res,'res');
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
    };

export const updateProcessStatusAction = (data, callback) =>
    async (dispatch) => {
      try {
        const res = await salary_services.updateProcessStatusMonth(data);
        if (res.status === 200) {
          dispatch({
            type: UPDATE_PROCESS_STATUS,
            payload: res.data,
          });
          console.log('Updated status response:', res.data);
          if(callback){
            callback()
          }
          console.log(res,'res');
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
    };
//   export const getbyidholidaysAction =
//   (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
//     try {
//       ListLoad(setModalTypeHandler, setLoaderStatusHandler);
//       const res = await holidays_services.getbyid(id);
//       dispatch({
//         type: GET_BY_ID_HOLIDAYS,
//         payload: res.data,
//       });
//       FailLoad(setModalTypeHandler, setLoaderStatusHandler);
//       return Promise.resolve(res.data);
//     } catch (err) {
//       // if(err.response?.status === 500) {
//       //   getbyidToken(holidays_services.getbyid GET_ID_STOCK_LOCATION, dispatch, id)
//       // }
//       // else{
//       FailLoad(setModalTypeHandler.setLoaderStatusHandler);
//       ErrorAlert(dispatch, err);
//       // }
//     }
//   };

// export const updateHolidays =
//   (
//     id,
//     data,
//     setModalTypeHandler,
//     setLoaderStatusHandler,
//     sample,
    
//   ) =>
//   async (dispatch) => {
//     try {
//       ListLoad(setModalTypeHandler, setLoaderStatusHandler);
//       const res = await holidays_services.update(id, data);
//       if (res.data.changedRows === 1) UpdateAlert(dispatch);
//       dispatch({
//         type: UPDATE_HOLIDAYS,
//         payload: res.data,
//       });
//       successmsg(sample);
//       FailLoad(setModalTypeHandler, setLoaderStatusHandler);
//       return Promise.resolve(res.data);
//     } catch (err) {
//       FailLoad(setModalTypeHandler, setLoaderStatusHandler);
//       ErrorAlert(dispatch, err);
//       errormsg(sample);
//       return Promise.reject(err);
//       // }
//     }
//   };

//   export const deleteHolidays =
//   (
//     id,
//     setModalTypeHandler,
//     setLoaderStatusHandler,
   
//   ) =>
//   async (dispatch) => {
//     try {
//       ListLoad(setModalTypeHandler, setLoaderStatusHandler);
//       const res = await holidays_services.delete(id);
//       if (res.data.changedRows === 1) DeleteAlert(dispatch);
//       dispatch({
//         type: DELETE_HOLIDAYS,
//         payload: res.data,
//       });
      
//       FailLoad(setModalTypeHandler, setLoaderStatusHandler);
//       return Promise.resolve(res.data);
//     } catch (err) {
//       FailLoad(setModalTypeHandler, setLoaderStatusHandler);
//       ErrorAlert(dispatch, err);
 
//       return Promise.reject(err);
//       // }
//     }
//   };

export const getpartialProcessDetail = (body,response) =>
    async (dispatch) => {
      try {
        const res = await salary_services.partialProcessDetail(body);
        if (res.status === 200) {
          dispatch({
            type: GET_PARTIAL_DETAIL,
            payload: res.data,
          });
        }
        if (response) {
          response(res);
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
    };

  export const getDeductionType = (id) =>
  async (dispatch) => {
    try {
      const res = await salary_services.deductionType(id);
      if (res.status === 200) {
        dispatch({
          type: GET_DEDUCTION_TYPE,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getAllowanceType = (id) =>
  async (dispatch) => {
    try {
      const res = await salary_services.allowanceType(id);
      if (res.status === 200) {
        dispatch({
          type: GET_ALLOWANCE_TYPE,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  }; 

export const createTemplateStructureAction = (data, response) =>
  async (dispatch) => {
    try {
      const res = await salary_services.createTemplateStructure(data);
      if (res.status === 200) {
        if(res.data.status === 'Template Name already exists!') {
          templateNameExists(dispatch)
        }
        else {
          dispatch({
            type: SET_SALARY_TEMPLATE,
            payload: res.data,
          });
          CreateAlert(dispatch)
        }
      }
      if(response) {
        response(res)
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  }; 

export const updateTemplateStructureAction = (data, id, response) =>
  async (dispatch) => {
    try {
      const res = await salary_services.updateTemplateStructure(data, id);
      if (res.status === 200) {
        if(res.data.status === 'Template Name already exists!') {
          templateNameExists(dispatch)
        }
        else {
          dispatch({
            type: SET_SALARY_TEMPLATE,
            payload: res.data,
          });
          UpdateAlert(dispatch)
        }
      }
      if(response) {
        response(res)
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  }; 

  export const createSalaryStructureAction = (data, response) =>
  async (dispatch) => {
    try {
      const res = await salary_services.createSalaryStructure(data);
      if (res.status === 200) {
        if(res.data.status === 'Structure Name already exists!') {
          structureNameExists(dispatch)
        }
        else {
          dispatch({
            type: SET_SEARCH_SALARY_STRUCTURE,
            payload: res.data,
          });
          CreateAlert(dispatch)
        }
      }
      if(response) {
        response(res)
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  }; 

  export const bulkUploadSalaryStructureAction = (data) =>
  async (dispatch) => {
    try {
      const res = await salary_services.bulkUploadSalaryStructure(data);
      if (res.status === 200) {
        dispatch({
          type: SET_SEARCH_SALARY_STRUCTURE,
          payload: res.data,
        });
      }
      CreateAlert(dispatch)
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const updateSalaryStructureAction = (id, data, response) =>
  async (dispatch) => {
    try {
      const res = await salary_services.updateSalaryStructure(id, data);
      if (res.status === 200) {
        if(res.data.status === 'Structure Name already exists!') {
          structureNameExists(dispatch)
        }
        else {
          dispatch({
            type: SET_SEARCH_SALARY_STRUCTURE,
            payload: res.data,
          });
          UpdateAlert(dispatch)
        }
      }
      if(response) {
        response(res)
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  }; 

  export const getALlSalaryStructureAction = (data) =>
  async (dispatch) => {
    try {
      const res = await salary_services.getALlSalaryStructure(data);
      console.log("res",res.data)
      if (res.status === 200) {
        dispatch({
          type: SET_SEARCH_SALARY_STRUCTURE,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  }; 

export const getAllSalaryTemplateAction = (data) =>
  async (dispatch) => {
    try {
      const res = await salary_services.getAllSalaryTemplate(data);
      if (res.status === 200) {
        dispatch({
          type: SET_SALARY_TEMPLATE,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getSearchSalaryTemplateAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type : GET_SALARY_TEMPLATE,
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };
 
export const setSearchSalaryTemplateAction = (data) => {
    return {
      type : SET_SALARY_TEMPLATE,
      payload : data
    }
};

export const getStructureBasedTemplateAction = (data) =>
  async (dispatch) => {
    try {
      const res = await salary_services.getStructureBasedTemplate(data);
      if (res.status === 200) {
        dispatch({
          type: GET_STRUCTURE_BASED_TEMPLATE,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  }; 

  export const getALlSalaryStructureWithAllowanceAndDeductionAction = (data) =>
  async (dispatch) => {
    try {
      const res = await salary_services.getALlSalaryStructureWithDeductionAndAllowance(data);
      if (res.status === 200) {
        dispatch({
          type: GET_ALL_SALARY_STRUCTURE_WITH_ALLOWANCE_AND_DEDUCTION,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  }; 


  export const mapEmployeeBasedSalaryAction = (data, callback) =>
  async (dispatch) => {
    try {
      const res = await salary_services.mapEmployeeBasedSalary(data);
      if (res.status === 200) {
        if(res.data.empSalaryNotCreated.length > 0){
          commonAlert(dispatch, 'Not created for some employee')
        }else{
          UpdateAlert(dispatch)
        }
        dispatch({
          type: MAP_SALARY_STRUCTURE,
          payload: res.data,
        });
        callback()
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  }; 

  export const getMappedDetailsAction = (data) =>
  async (dispatch) => {
    try {
      const res = await salary_services.getMappedDetails(data);
      if (res.status === 200) {
        dispatch({
          type: GET_MAP_DETAIL,
          payload: res,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  }; 

  // export const getSearchSalaryStructureAction = (data) =>
  // async (dispatch) => {
  //   try {
  //     const res = await salary_services. getSearchSalaryStructure(data);
  //     if (res.status === 200) {
  //       dispatch({
  //         type: GET_SEARCH_SALARY_STRUCTURE,
  //         payload: res,
  //       });
  //       if (response) {
  //         response(res.status, res.data);
  //       }
  //     }
  //     return Promise.resolve("API_FINISHED_SUCCESS");
  //   } catch (err) {
  //     ErrorAlert(dispatch, err);
  //     return Promise.reject("API_FINISHED_ERROR");
  //   }
  // }; 

  export const searchSalaryStructureState = (data) => {
    return {
      type: SET_SEARCH_SALARY_STRUCTURE,
      payload: data
    }
  };
  
  
  export const searchSalaryStructureAction = (body, commoncookie, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: GET_SEARCH_SALARY_STRUCTURE,
      body,
      commoncookie,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };


  export const createAllowanceDeductionTypesAction = (data, callback) =>
  async (dispatch) => {
    try {
      const res = await salary_services.createAllowanceDeductionTypes(data);
      if(res.data === "Allowance Code is already created" || res.data === "Allowance Name is already created" || res.data === "Deduction Code is already created" || res.data === "Deduction Name is already created"){
        salaryAllowanceDeductionAlert(dispatch,res.data)
      }else if (res.status === 200) {
        CreateAlert(dispatch)
        callback(res.data)
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  }; 


export const deleteAllowanceDeductionTypesAction = (data, callback) =>
async (dispatch) => {
  try {
    const res = await salary_services.deleteAllowanceDeductionTypes(data);
    if (res.status === 200) {
      callback(res.data)
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
}; 

export const checkDeleteAllowanceDeductionTypesAction = (data, callback) =>
async (dispatch) => {
  try {
    const res = await salary_services.checkDeleteAllowanceDeductionTypes(data);
    if (res.status === 200) {
      if(res.data.message && res.data.message === 'CANNOT DELETE'){
        CannotDeleteAlert(dispatch, res.data);
      }else{
        callback(res.data)
      }
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
}; 

export const getSalaryReportForBankAction = (data, response) =>
async (dispatch) => {
  try {
    const res = await salary_services.getSalaryReportForBank(data);
    if (res.status === 200) {
      dispatch({
        type: GET_SALARY_REPORT_FOR_BANK,
        payload: res.data,
      });

      if(response){
        response(res.status, res.data)
      }
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};


export const listSelectUserAction = (data, callback) =>
async (dispatch) => {
  try {
    const res = await salary_services.listSelectUserAction(data);
    if (res.status === 200) {
      callback(res.data)
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
}; 


export const deleteEmpSalaryAction =(data, callback) =>async (dispatch) => {
  try {
    const res = await salary_services.deleteEmpSalary(data);
    if(res.data.message && res.data.message === 'CANNOT DELETE'){
      CannotDeleteAlert(dispatch, res.data);
    }

    if (
      (res.status === 200 && res.data.message === 'DELETED') ||
      res.data.success === true
    ) {
      DeleteAlert(dispatch);
      callback?.(res.data);
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const updateEmpSalaryMappingAction =(data, callback) =>async (dispatch) => {
  try {
    const res = await salary_services.updateEmpSalary(data);
    if(res.data.message && res.data.message === 'CANNOT UPDATE'){
      CannotDeleteAlert(dispatch, res.data);
    }

    if (res.status === 200 && res.data.message === 'UPDATED') {
      UpdateAlert(dispatch);
      callback?.(res.data)
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const SetSalaryReportForBankAction = (data) => {
  return {
    type: GET_SALARY_REPORT_FOR_BANK,
    payload: data
  }
};

export const listSalaryReportAction = (data) =>
  async (dispatch) => {
    try {
      const res = await salary_services.searchSalaryReport(data);
      if (res.status === 200) {
        dispatch({
          type: SET_SALARY_REPORT,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  }; 

  export const setSearchSalaryReport = (data) => {
    return {
      type: SET_SALARY_REPORT,
      payload: data
    }
  };
  
  
  export const getSearchSalaryReport = (body, commoncookie, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: GET_SALARY_REPORT,
      body,
      commoncookie,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };
 
 
export const getSearchSalaryReportForBankAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type: GET_SEARCH_REPORT_BANK,
    body,
    setModalTypeHandler,
    setLoaderStatusHandler
  }
};


export const salaryConfirmedAction = (data) => async (dispatch) => {
    try {
      const res = await salary_services.salaryConfirmed(data);
      if (res.status === 200) {
        dispatch({
          type: GET_SALARY_CONFIRMED,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  }; 

export const salaryConfirmedByYearAction = (data) => async (dispatch) => {
  try {
    const res = await salary_services.salaryConfirmedByYear(data);
    if (res.status === 200) {
      dispatch({
        type: GET_SALARY_CONFIRMED_YEAR,
        payload: res.data,
      });
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
}; 

  export const costSummaryReportAction =
    (data, setModalTypeHandler, setLoaderStatusHandler, exportDataCallBack) => async (dispatch) => {
      try {
         ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      
        const res = await salary_services.costSummaryReport(data);
        if (res.status === 200) {
          if(!data?.exportData) {
            dispatch({
              type: COST_SUMMARY_REPORT,
              payload: res.data
            });
          }
          if (exportDataCallBack) {
            exportDataCallBack(res.data.data);
          }
        }
         FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        if (exportDataCallBack) {
          exportDataCallBack([]);
        }
        FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
    };

    export const salaryStatementAction = (data) => async (dispatch) =>{
      try{
        const res = await salary_services.salaryStatement(data)
        if(res.status === 200){
          dispatch({
            type : GET_SALARY_STATEMENT,
            payload : res.data
          })
        }
        return Promise.resolve('API_FINISHED_SUCCSS')
      }
      catch(err){
        return Promise.reject('API_FINISHED_SUCCESS')
      }
    }

    export const getSalaryStatement = (data)=>{
      return{
        type : GET_SALARY_STATEMENT,
        payload : data
      }
    }

    export const setSalaryStatement = (body,setModalTypeHandler,setLoaderStatusHandler)=>{
      return {
        type : SET_SALARY_STATEMENT,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
      }
    }
  
  export const setSearchcostSummaryReportAction = (data) => {
    return {
      type: COST_SUMMARY_REPORT,
      payload: data
    }
  };
  export const getSearchcostSummaryReportAction = (val, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: GET_SEARCH_COST_SUMMARY_REPORT_ACTION,
      body: val,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };

  export const paySlipReportTempAction =
    ( data, employee_id,response) => async (dispatch) => {
      try {
        const res = await salary_services.paySlipReportTemp(data,employee_id);
        if (res.status === 200) {
          dispatch({
            type: PAY_SLIP_REPORT_TEMP,
            payload: res.data,
          });
         if( response) {
          response(res.data)
         }
         
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
    };

// Backward-compatible alias used in older imports
export const mapEmployeeBasedSalary = mapEmployeeBasedSalaryAction;
  
    export const getSalaryTemplateByIdAction = (id) => async (dispatch) =>{
      try{
        const res = await salary_services.getSalaryTemplateById(id)
        if(res.status === 200){
          dispatch({
            type : GET_TEMPLATE_BYID,
            payload : res.data
          })
        }
        return Promise.resolve('API_FINISHED_SUCCSS')
      }
      catch(err){
        return Promise.reject('API_FINISHED_SUCCESS')
      }
    }

    export const setSalaryTemplateByIdAction = (data) => {
    return {
      type: GET_TEMPLATE_BYID,
      payload: data
    }
  };

  export const getSalaryTemplateAllAction = () =>
  async (dispatch) => {
    try {
      const res = await salary_services.getSalaryTemplateAll();
      if (res.status === 200) {
        dispatch({
          type: SET_SALARY_TEMPLATE,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  
  export const deleteTemplateStructureAction = (id) =>
  async (dispatch) => {
    try {
      const res = await salary_services.deleteTemplateStructure(id);
      if (res.status === 200) {
        dispatch({
          type: SET_SALARY_TEMPLATE,
          payload: res.data,
        });
      }
      DeleteAlert(dispatch)
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getAppconfigPercentAction = () =>
  async (dispatch) => {
    try {
      const res = await salary_services.getAppconfigPercent();
      if (res.status === 200) {
        dispatch({
          type: SALARY_PERCENT,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const updateSalaryStructurePercentAction = (data) => async (dispatch) => {
    try {
      const res = await salary_services.updateSalaryStructurePercent(data);
      if (res.status === 200) {
        dispatch({
          type: SALARY_PERCENT,
          payload: res.data,
        });
      }
      UpdateAlert(dispatch)
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getPfEsiPtAction = () =>
  async (dispatch) => {
    try {
      const res = await salary_services.getPfEsiPt();
      if (res.status === 200) {
        dispatch({
          type: PF_ESI_PT,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getPtSlabsAction = () =>
  async (dispatch) => {
    try {
      const res = await salary_services.getPtSlabs();
      if (res.status === 200) {
        dispatch({
          type: PT_SLABS,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  
