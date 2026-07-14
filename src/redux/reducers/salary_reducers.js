import {
    LIST_SALARY,
    CREATE_SALARY,
    SET_SEARCH_SALARY,
    SET_SEARCH_PROCESS_SALARY,
    SEARCH_PAYSLIP_REPORT,
    GET_PROCESSED_MONTH,
    GET_ALLOWANCE_TYPE,
    GET_DEDUCTION_TYPE,
    GET_ALL_SALARY_STRUCTURE,
    MAP_SALARY_STRUCTURE,
    GET_MAP_DETAIL,
    SET_SEARCH_SALARY_STRUCTURE,
    GET_SALARY_REPORT_FOR_BANK,
    GET_ALL_SALARY_STRUCTURE_WITH_ALLOWANCE_AND_DEDUCTION,
    GET_SALARY_REPORT,
    SET_SALARY_REPORT,
    GET_SALARY_CONFIRMED,
    COST_SUMMARY_REPORT,
    GET_SALARY_STATEMENT,
    PAY_SLIP_REPORT_TEMP,
    GET_SALARY_CONFIRMED_YEAR,
    SET_SALARY_TEMPLATE,
    GET_STRUCTURE_BASED_TEMPLATE,
    GET_TEMPLATE_BYID,
    SALARY_PERCENT,
    PF_ESI_PT,
    PT_SLABS
  } from '../actionTypes';
  
  const initialState = {
    salarylist: [],
    searchSalaryData: [],
    processedMonthData: [],
    AllowanceType:[],
    deductionType:[],
    salarystructurelist:[],
    mapsalary:[],
    mappedDetails:[],
    salaryReportForBank:[],
    getAllSalaryWithAmountAndDeduction :[],
    processSalaryData: [],
    processSalaryCount: 0,
    salaryReport: [],
    salaryReportCount: 0,
    salaryConfirmed :'pending',
    costSummaryReport : [],
    salaryStatement: [],
    salaryStructureCount:[],
    paySlipReportTemp:[],
    salaryConfirmedByYear:[],
    salaryTemplateList: [],
    salaryTemplateCount: 0,
    structureBasedTemplate: [],
    getTemplateById: [],
    salaryPercent: [],
    pfesipt: [],
    ptslabs: []
  };
  
  function SalaryReducers(state = initialState, action) {
    const { type, payload } = action;
    // console.log("payload",payload)
    switch (type) {
      case LIST_SALARY:
        return { ...state, salarylist: payload };
      case CREATE_SALARY:
        return { ...state, salarylist: payload };
      
      case SET_SEARCH_SALARY:
     
        return {
          ...state,
          searchSalaryData: payload.data,
          searchSalaryData_count: payload.numRows,
        }
        
      case SET_SEARCH_PROCESS_SALARY:
        return {
          ...state,
          processSalaryData: payload.data,
          processSalaryCount: payload.numRows
        };
      

      case SEARCH_PAYSLIP_REPORT:
        return {
          ...state,
          paySlipReportData: payload.data,
          paySlipReportCount: payload.numRows
        };
      // case GET_BY_ID_HOLIDAYS:
      //   return { ...state, holidaygetbyid: payload };
      // case UPDATE_HOLIDAYS:
      //   return { ...state, holidaylist: payload };
      // case DELETE_HOLIDAYS:
      //   return { ...state, holidaylist: payload };
      case GET_PROCESSED_MONTH:
        return {
          ...state, processedMonthData: payload
        }
      case GET_ALLOWANCE_TYPE:
        return {
          ...state, AllowanceType: payload
        }
      case GET_DEDUCTION_TYPE:
        return {
          ...state, deductionType: payload
        }
        case GET_ALL_SALARY_STRUCTURE:
          return {
            ...state, salarystructurelist: payload.data 
          }

          case GET_ALL_SALARY_STRUCTURE_WITH_ALLOWANCE_AND_DEDUCTION:
            return {
              ...state, getAllSalaryWithAmountAndDeduction: payload.data
            }
          case MAP_SALARY_STRUCTURE:
            return {
              ...state, mapsalary: payload
            }

            case GET_MAP_DETAIL:
              return {
                ...state, mappedDetails: payload
              }

        case SET_SEARCH_SALARY_STRUCTURE:
        return {
          ...state,
          salarystructurelist: payload.data,
          salaryStructureCount : payload.numRows
       }

        case SET_SALARY_TEMPLATE:
        return {
          ...state,
          salaryTemplateList: payload.data,
          salaryTemplateCount : payload.numRows
       }

        case SALARY_PERCENT:
        return {
          ...state,
          salaryPercent: payload
       }

        case PF_ESI_PT:
        return {
          ...state,
          pfesipt: payload
       }

        case PT_SLABS:
        return {
          ...state,
          ptslabs: payload
       }

        case GET_STRUCTURE_BASED_TEMPLATE:
        return {
          ...state,
          structureBasedTemplate : payload
       }

      case GET_SALARY_REPORT_FOR_BANK:
        return {
          ...state,
          salaryReportForBank: payload.data,
          salaryReportForBankCount: payload.numRows
      }

      case SET_SALARY_REPORT:
              return {
                ...state,
                salaryReport: payload.data,
                salaryReportCount: payload.numRows
              }

      case GET_SALARY_CONFIRMED:
                return {
                  ...state,salaryConfirmed:payload
                }

      case GET_SALARY_CONFIRMED_YEAR:
        return {
          ...state, salaryConfirmedByYear: payload
        }

                case COST_SUMMARY_REPORT : 
                return {...state, costSummaryReport: payload}
      
      case GET_SALARY_STATEMENT :
        return{...state,salaryStatement : payload}

      case PAY_SLIP_REPORT_TEMP :
        return{...state,paySlipReportTemp : payload}

      case GET_TEMPLATE_BYID :
        return{...state, getTemplateById : payload}

      default:
        return state;
    }
  }
  
  export default SalaryReducers;
  