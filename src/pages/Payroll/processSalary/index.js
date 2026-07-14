import React, { useEffect, useState, useContext, useRef } from 'react';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Card,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  CircularProgress,
  makeStyles,
  linearProgressClasses,
  styled,
  Dialog,
  DialogTitle,
  DialogActions,
  LinearProgress,
  DialogContent,
  DialogContentText,
  IconButton,
  FormHelperText
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import context from '../../../context/CreateNewButtonContext';
import { Helmet } from 'react-helmet-async';
import { maxHeight, pageSize, headerStyle, cellStyle, maxBodyHeight } from 'utils/pageSize';
import CommonSearch from 'utils/commonSearch';
import {
  createProcessSalaryAction,
  deleteProcessSalaryAction,
  getDetailsBasedonMonth,
  getpartialProcessDetail,
  processSalaryPaginationAction,
  searchProcessSalaryAction,
  searchProcessSalaryState,
  updateProcessSalaryAction,
} from 'redux/actions/salary_actions';
import apiCalls from 'utils/apiCalls';
import PaySlip from 'components/processSalary/paySlip';
import CommonToolTip from 'components/ToolTip';
import { Stack } from '@mui/system';
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import {
  getEmpbasecompanyAction, getLocBaseEmpAction, getLocBaseEmpFilterAction, get_search_location_based_employee, set_search_location_based_employee,

} from 'redux/actions/attendance_actions';
import Processed from './processed';
import { updateProcessStatusAction } from '../../../redux/actions/salary_actions';
import { getsessionStorage } from '../../common/login/cookies';
import { getDateTimeFormat } from '../../../utils/getTimeFormat';
import { getLoginRoleAction } from '../../../redux/actions/userRole_actions';
import { CreateNotificationAction } from '../../../redux/actions/notification_actions';
import { sendNtfy } from '../../../firebase/firebase.service';
import moment from 'moment';
import { useCustomFetch } from 'utils/useCustomFetch';
import InfoIcon from '@mui/icons-material/Info';
import { titleURL } from 'http-common';
import { ErrorAlert, processSalaryUpdateAlert } from 'redux/actions/load';
import { read, utils, writeFile } from 'xlsx-js-style';
import { getCompanyLogo, getCompanyLogoSalary, getSignature, getSignatureSalary } from 'redux/actions/company_actions';
import { capitalize } from 'lodash';
import CommonUserAutoComplete from 'utils/commonAutoCompleteForUser';
import { GET_EMP_BASECOMPANY, LOCATION_BASE_DEP, LOCATION_BASE_DEP_FILTER } from 'redux/actionTypes';
import { listDepartment, listEmployeeCategoryAction } from 'redux/actions/shifts.actions';
import GlobalMaterialTable from 'utils/SafeMaterialTable';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import { departmentListAction } from 'redux/actions/userCreation_actions';
import API_URLS from '../../../utils/customFetchApiUrls';
import { getStickyTableOptions, stickyTableComponents } from 'utils/stickyTableLayout';

export default function ProcessSalary() {
  const dispatch = useDispatch();
  const [progress, setProgress] = useState(0);



  const date = new Date();
  // const getCurrentMonth = `${date.getMonth() + 1}`; // current month
  const getCurrentMonth = `${(date.getMonth() + 1).toString().padStart(2, '0')}`;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(null);
  const [month, setMonth] = useState(getCurrentMonth);
  const [processedmonthid, setProcessedmonthid] = useState(null)
  const [paySlipData, setPaySlipData] = useState({});
  const [isApiFinished, setIsApiFinished] = useState(false);
  const [selectedNames, setSelectedNames] = useState(['']);
  const [selectedlocate, setSelectedLocate] = useState(['']);
  const [opentab, setOpentab] = useState(false);
  const [openDialoug, setopenDialoug] = useState(false);
  const [rowdata, setRowData] = useState();
  const [linearLoading, setLinearloading] = useState(false);
  const [helpDialogText, setHelpDialogText] = useState({});
  const [processInfoOpen, setProcessInfoOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({
    month: null,
    year: null,
    location: null,
    empName: null,
    department: null,
    category: null
  });

  const storage = getsessionStorage();
  const emp_id = storage?.employee_id || '';
  const [data, setData] = useState({
    page: 0,
    pageSize: 20,
    searchVal: '',
  });
  const currentDate = new Date();
  const currentMonth = `0${currentDate.getMonth() + 1}`;

  const currentYear = new Date().getFullYear();
  const previousYears = Array.from({ length: 4 }, (v, i) => currentYear - i);

  const [selectedCategory, setselectedCategory] = useState([''])

  const [processField, setprocessField] = React.useState({
    empName: [''],
    location: [''],
    month: getCurrentMonth, // Set the default value for the month field
    year: currentYear,
    category: selectedCategory
  });



  const customFetch = useCustomFetch();
  const [backGroundJobs, setBackGroundJobs] = useState([]);
  const [incentiveData, setIncentiveData] = useState([]);
  const [deductionData, setDeductionData] = useState([]);
  const [filename, setFilename] = useState("");
  const [deductionfilename, setdeductionfilename] = useState("")
  const [value, setValue] = React.useState([]);
  const checkJobStatusInterval = useRef(null)
  const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');
  const [departmentLists, setDepartmentList] = useState(false);
  const [departmentListsArray, setDepartmentListArray] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(['']);



  const [selectedAll, setSelectedAll] = useState(false);

  console.log('departmentLists', departmentLists)

  const handleChangeEmployeeName = (val) => {
    setValue(val)
    if (val?.length > 0) {
      setFormErrors({ ...formErrors, empName: null })

    }
  }

  const {
    SalaryReducers: { processSalaryData, processSalaryCount, processedMonthData },
    ShiftsReducer: { employeeCategoryList },
    stockLocationReducer: { stocklocation },
    attendanceReducer: { get_empbasecompany, getLocationBasedEmployee, searchLocationBasedEmployee },
    CompanyReducers: { company_logo, signature },
    ShiftsReducer: { userwiseselect, getschedule, search_shiftlist, list_department, list_designation },
    UserCreationReducer: { departmentList }
  } = useSelector((state) => state);
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);

  console.log('departmentList', departmentList)


  // useEffect (() => {
  //   setValue([])
  //   if(selectedlocate.includes('')) {
  //     setSelectedNames(['']);
  //   }
  //   else{

  //     dispatch(getLocBaseEmpAction({department: selectedlocate},(res)=> {
  //       if(res.data?.department) {
  //         dispatch({
  //           type: LOCATION_BASE_DEP,
  //           payload: res.data?.department,
  //         });
  //         setSelectedNames(res?.data?.department?.map(v=> v?.department))
  //        }
  //        if(res.data?.employees){
  //         dispatch({
  //           type: GET_EMP_BASECOMPANY,
  //           payload: res.data?.employees,
  //         });
  //         setSelectedNames(res?.data?.employees?.map(v=> v?.employee_id))
  //       }
  //     }))

  //     // dispatch(getEmpbasecompanyAction({},(response) => {
  //     //   if(response.length){
  //     //     function filterEmployeesByLocation(locationIds) {
  //     //       return response.filter(employee => locationIds.some(id => employee.location_id.includes(id)));
  //     //     }

  //     //     // Example: Filter employees with location_id 156 or 157
  //     //     const filteredEmployees = filterEmployeesByLocation(selectedlocate);
  //     //     setSelectedNames(filteredEmployees)
  //     //   }
  //     // }))

  //   }
  // },[selectedlocate])

  useEffect(() => {

    const data = {
      searchString: ''
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(listDepartment(data, (response) => {
        // console.log("response",response)
        if (response.length) {
          //  console.log("response.length",response.length)
          setDepartmentList(true)
          setDepartmentListArray(response)
        }

      })),
    )
  }, []);

  //  useEffect(() => {

  //     const data = {
  //       searchString: ''
  //     }

  //     // console.log("1111")
  //     setValue([])
  //     dispatch(

  //       listDepartment(data, (response) => {
  //         console.log("response.length", response.length)
  //         if (response.length) {
  //           let allDept = response.map((d) => d.department);
  //           let data = {
  //             department: selectedDepartment.includes('') || selectedDepartment.length === 0 ? allDept : selectedDepartment,

  //             searchString: '',type:'attendance'
  //           };
  //           dispatch(getDeptBaseEmpFilterAction(data));
  //         }
  //       }),
  //     );


  //   }, [selectedDepartment]);

  useEffect(() => {
    setValue([])
    if (departmentLists) {
      if (processField?.location?.length > 0) {

        let allDept = list_department.map((d) => d.department);
        let allcategory = employeeCategoryList.map((d) => d.category_name);
        console.log('allcategory', allcategory)
        let data = {
          ...processField,
          searchString: '',
          department: selectedDepartment.includes('') || selectedDepartment.length === 0 ? allDept : selectedDepartment,
          category: selectedCategory.includes('') || selectedCategory.length === 0 ? allcategory : selectedCategory,


        }
        dispatch(getLocBaseEmpFilterAction(data, (res) => {
          if (res.data?.employees) {
            dispatch({
              type: LOCATION_BASE_DEP_FILTER,
              payload: res.data?.employees,
            });
          }
        }))
      }
    }

  }, [processField?.location, departmentLists, selectedDepartment, selectedCategory, employeeCategoryList])

  const requestSearchEmployeeFilter = (val) => {

    // let allDept = list_department.map((d) => d.department);

    console.log('searchvalll', val)
    setSearchValEmployeeFilter(val);
    dispatch(set_search_location_based_employee([]));

    if (!val) {
      return
    }
    let allDept = list_department.map((d) => d.department);
    let allcategory = employeeCategoryList.map((d) => d.category_name);
    let data = {

      ...processField,
      searchString: val,
      department: selectedDepartment.includes('') || selectedDepartment.length === 0 ? allDept : selectedDepartment,
      category: selectedCategory.includes('') || selectedCategory.length === 0 ? allcategory : selectedCategory,
    }



    dispatch(
      get_search_location_based_employee(
        data,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    );
    // }
    // }),
    // );

  };




  const handleIncentiveUpload = (e) => {
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    const file = e.target.files[0];
    setFilename(file.name)

    reader.onload = async (e) => {
      const bstr = e.target.result;
      const wb = read(bstr, { type: rABS ? 'binary' : 'array', bookVBA: true });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const temp_xl_data = utils.sheet_to_json(ws);
      const temp_1_xl_data = temp_xl_data.filter(i => i.Amount && i['Employee Code'])

      const xl_data = temp_1_xl_data
        .map((i) => {
          const _emp = get_empbasecompany.find((j) => j.employee_code == i['Employee Code']);
          i.employee_id = _emp?.employee_id
          return { ...i, ['Amount']: parseInt(i.Amount) }
        })
      setIncentiveData(xl_data)
    }

    if (rABS) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  }

  const handleDeductionUpload = (e) => {
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    const file = e.target.files[0];
    console.log('filessss', file)
    setdeductionfilename(file.name)

    reader.onload = async (e) => {
      const bstr = e.target.result;
      const wb = read(bstr, { type: rABS ? 'binary' : 'array', bookVBA: true });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const temp_xl_data = utils.sheet_to_json(ws);
      const temp_1_xl_data = temp_xl_data.filter(i => i.Amount && i['Employee Code'])

      const xl_data = temp_1_xl_data
        .map((i) => {
          const _emp = get_empbasecompany.find((j) => j.employee_code == i['Employee Code']);
          i.employee_id = _emp?.employee_id
          return { ...i, ['Amount']: parseInt(i.Amount) }
        })
      setDeductionData(xl_data)
    }

    if (rABS) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  }

  const downloadXlsxData = (type) => {

    const MYdata = get_empbasecompany.filter(filterEmpBasedOnJoiningDate).map(i => {
      return {
        "Employee Code": i.employee_code,
        "Employee Name": i.full_name,
        "Amount": 0,
        "Reason": ""
      }
    })
    console.log('MYdata', MYdata)

    const worksheet = utils.json_to_sheet(MYdata);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Sheet1");
    writeFile(workbook, type === 'incentive' ? "incentive_template.xlsx" : "deduction_template.xlsx");

  }





  useEffect(() => {
    checkJobStatusInterval.current = setInterval(() => {
      const job_ids = backGroundJobs.filter(i => i.status === 'PROCESSING').map(i => i.job_id);

      if (job_ids.length === 0) {
        clearInterval(checkJobStatusInterval.current)
      } else {

        backGroundJobPolling();

      }

    }, 1000);

    return () => clearInterval(checkJobStatusInterval.current)

  }, [backGroundJobs])


  useEffect(() => {
    console.log('monthuseeffect')
    if (processField.year !== currentYear) {
      setMonth(null)
    }
  }, [processField.year])

  useEffect(() => {
    setSelectedNames([''])
    setFormErrors({ ...formErrors, empName: null })
  }, [selectedlocate, month, processField.year])

  useEffect(() => {
    const data = {
      type: 'LIST_CATEGORY',
    };
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      commoncookie, headerLocationId,
      dispatch(getEmpbasecompanyAction()),
      dispatch(getSignatureSalary()),
      dispatch(getDetailsBasedonMonth()),
      dispatch(getCompanyLogoSalary()),
      dispatch(departmentListAction((res) => { })),
      dispatch(listEmployeeCategoryAction(data)),
      dispatch(listStockLocationAction(commoncookie, headerLocationId)),
    );
  }, []);
  // useEffect(() => {
  //   const body = {
  //     month_id: month,
  //     pageCount: 0,
  //     numPerPage: pageSize,
  //     searchString: '',
  //     employeeId: commoncookie,
  //     headerLocationId: headerLocationId,
  //   };
  //   apiCalls(
  //     setModalTypeHandler,
  //     setLoaderStatusHandler,
  //     dispatch(processSalaryPaginationAction(body, commoncookie)),
  //   );
  // }, [month]);

  // const handlePageSizeChange = async (size) => {
  //   const body = {
  //     month_id: month,
  //     pageCount: data.page,
  //     numPerPage: size,
  //     searchString: '',
  //     employeeId: commoncookie,
  //     headerLocationId: headerLocationId,
  //   };
  //   apiCalls(
  //     setModalTypeHandler,
  //     setLoaderStatusHandler,
  //     await dispatch(processSalaryPaginationAction(body, commoncookie)),
  //   );
  // };

  // const handlePageChange = (page) => {
  //   const body = {
  //     month_id: month,
  //     pageCount: page,
  //     numPerPage: data.pageSize,
  //     searchString: '',
  //     employeeId: commoncookie,
  //     headerLocationId: headerLocationId,
  //   };
  //   apiCalls(
  //     setModalTypeHandler,
  //     setLoaderStatusHandler,
  //     dispatch(processSalaryPaginationAction(body, commoncookie)),
  //   );
  // };


  const backGroundJobPolling = async () => {
    const job_ids = backGroundJobs.filter(i => i.status === 'PROCESSING').map(i => i.job_id);


    console.log('jobidssss', job_ids)
    const filJobIds = job_ids.filter(Boolean);
    // if(filJobIds.length){
    //   return
    // }
    const { data } = await customFetch(
      API_URLS.CHECK_JOB_STATUS,
      'POST',
      { job_ids }
    );

    if (data && data.some(i => i.job_status === 'DONE')) {
      dispatch(getDetailsBasedonMonth())
    }

    setBackGroundJobs(prevState => {
      const newState = prevState.map(i => {
        if (!data) return i
        const j = data.find(j => j.job_id === i.job_id);
        if (j) {
          i.status = j.job_status
          i.info = j.info,
            i.ss_process_month_id = j.common_id
        }
        return i
      })

      return newState
    })
  }

  const handleChange = (e) => {
    if (e.target.name !== 'category') {
      setMonth(e.target.value);
      setFormErrors({
        ...formErrors,
        month: null,
      })
    }
    else if (e.target.name === 'category' && e.target.value) {
      setFormErrors({
        ...formErrors,
        category: null,
      })
    }
    setIsApiFinished(false);
  };

  const requestSearch = async (e) => {
    let val = e.target.value;
    setData({ ...data, searchVal: val });
    await setIsApiFinished(false);

    dispatch(searchProcessSalaryState({ data: [], numRows: 0 }));
    const body = {
      month_id: month,
      pageCount: 0,
      numPerPage: pageSize,
      searchString: val,
      employeeId: commoncookie,
      headerLocationId: headerLocationId,
    };
    await apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        searchProcessSalaryAction(
          body,
          commoncookie,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      ),
    ).finally(() => setIsApiFinished(true));
  };

  // const cancelSearch = () => {
  //   setData({ ...data, page: 0, searchVal: '' });
  //   dispatch(searchProcessSalaryState({ data: [], numRows: 0 }));
  //   const body = {
  //     month_id: month,
  //     pageCount: 0,
  //     numPerPage: pageSize,
  //     searchString: '',
  //     employeeId: commoncookie,
  //     headerLocationId: headerLocationId,
  //   };
  //   apiCalls(
  //     setModalTypeHandler,
  //     setLoaderStatusHandler,
  //     dispatch(processSalaryPaginationAction(body, commoncookie)),
  //   );
  // };

  const handleEdit = (newData) => {
    let id = newData.id;
    newData.month_id = month;

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(updateProcessSalaryAction(newData, id)),
    );
  };

  const handleDelete = (oldData) => {
    let id = oldData.id;
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(deleteProcessSalaryAction(id, month)),
    );
  };

  const getFirstAndLastDateOfMonth = (year, month) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Month is 0-indexed

    if (year === currentYear && month === currentMonth) {
      // If the specified month is the current month, return the first date and current date
      const firstDate = new Date(year, month - 1, 1);
      const currentDate = new Date();

      return {
        firstDate: formatDate(firstDate),
        lastDate: formatDate(currentDate),
      };
    } else {
      // Otherwise, return the first and last date as before
      const firstDate = new Date(year, month - 1, 1);
      const lastDate = new Date(year, month, 0);

      return {
        firstDate: formatDate(firstDate),
        lastDate: formatDate(lastDate),
      };
    }
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const processSalaryFunc = () => {
    if (selectedAll) {

      dispatch(getLocBaseEmpAction(processField, (res) => {
        if (res.data?.employees) {
          processFunction(res.data?.employees)
        }
      }))
    }

    else {

      processFunction(value)
    }

  };

  const processFunction = (value) => {
    const { firstDate, lastDate } = getFirstAndLastDateOfMonth(processField.year, parseInt(month));
    const body = {
      id: month,
      fromDate: firstDate,
      toDate: lastDate,
      salary_month: parseInt(month),
      salary_year: processField.year,
      employeeId: value.filter(filterEmpBasedOnJoiningDate).map((d) => d.employee_id),
      headerLocationId: processField.location?.includes('') || processField.location === null ? [] : processField.location,
      month_id: month,
      numPerPage: 20,
      pageCount: 0,
      searchString: ""
    };
    const processSalaryData = {
      month_id: month,
      pageCount: 0,
      numPerPage: pageSize,
      searchString: '',
      employeeId: commoncookie,
      headerLocationId: headerLocationId,
    };

    if (value?.length === 0 || !processField.empName?.length || !processField.location?.length || !month || !processField.year || !selectedCategory || selectedCategory.length === 0) {
      setFormErrors({
        empName: value.length === 0 ? 'Employee is required' : null,
        location: processField.location?.length ? null : 'Field is required',
        month: month ? null : 'Field is required',
        year: processField.year ? null : 'Field is required',
        category: !selectedCategory || selectedCategory.length === 0 ? 'Field is required' : null,
      });
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
      return;
    }

    body.incentiveData = incentiveData.filter(i => body.employeeId.includes(i.employee_id))
    body.deductionData = deductionData.filter(i => body.employeeId.includes(i.employee_id))

    // if(!body.month_id){
    //   ErrorAlert(dispatch,{message:"please select month"})
    //   return;
    // }
    // if (!selectedlocate.includes('') && !selectedlocate ) {
    //   ErrorAlert(dispatch, { message: "Please select a location" });
    //   return;
    // }

    // if(!body.employeeId?.length){
    //   ErrorAlert(dispatch,{message:"please select user"})
    //   return;
    // }
    dispatch(getpartialProcessDetail(body, (response) => {
      if (response.data === 'check') {
        setopenDialoug(true)
      }
      else {
        setBackGroundJobs(prevState => {
          const index = prevState.findIndex(i => i.salary_month === month && i.salary_year === processField.year)
          if (index === -1) {
            return [...prevState, { job_id: null, salary_month: month, salary_year: processField.year, status: 'PROCESSING' }]
          } else {
            prevState.status = 'PROCESSING'
            return prevState
          }
        })
        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(createProcessSalaryAction(body, (data) => {
            console.log('createprocess', data)
            if (data?.message === 'Check Joining date of the employees') {
              clearInterval(checkJobStatusInterval.current)
              return alert(data?.message)
            }
            dispatch(getDetailsBasedonMonth())
            console.log('data.info', data.info)
            const info = JSON.parse(data.info)
            const isSomeDataAvailable = Object.keys(info).some(i => info[i].length > 0)
            if (isSomeDataAvailable) {
              setProcessInfoOpen(true)
            } else {
              processSalaryUpdateAlert(dispatch, "Processed")
              setDeductionData([]),
                setIncentiveData([]),
                setdeductionfilename(""),
                setFilename("")
            }
            setHelpDialogText(info)
            setBackGroundJobs(prevState => {
              const index = prevState.findIndex(i => i.salary_month === month && i.salary_year === processField.year)
              if (index !== -1) {
                prevState[index].job_id = data.job_id;
              }
              return prevState
            })
          })),
          // dispatch(processSalaryPaginationAction(processSalaryData, commoncookie)),
        );

      }
    }))
  }

  const handleChangelocation = (e) => {
    const { name, value } = e.target;
    setprocessField({ ...processField, [name]: value });

  };

  const handleOpen = (rowData) => {
    const updatedData = Object.fromEntries(
      Object.entries(rowData).map(([key, value]) => [
        key,
        value,
      ]),
    );
    setOpen(true);
    setPaySlipData(updatedData);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handletabClose = () => {
    dispatch(getDetailsBasedonMonth()),
      setOpentab(false)
  }

  const monthNames = [
    { id: 1, name: 'January' },
    { id: 2, name: 'February' },
    { id: 3, name: 'March' },
    { id: 4, name: 'April' },
    { id: 5, name: 'May' },
    { id: 6, name: 'June' },
    { id: 7, name: 'July' },
    { id: 8, name: 'August' },
    { id: 9, name: 'September' },
    { id: 10, name: 'October' },
    { id: 11, name: 'November' },
    { id: 12, name: 'December' },
  ];

  const generatePastMonthNamesArray = () => {
    const currentMonth = moment().month();
    const pastMonths = [];
    for (let i = 0; i <= currentMonth; i++) {
      const monthNames = moment().month(i).format('MMM');
      const monthNumber = moment().month(i).format('MM');
      pastMonths.push({ id: monthNumber, name: monthNames });
    }
    return pastMonths;
  };

  const pastMonthNames = generatePastMonthNamesArray();

  const filteredMonths = pastMonthNames.filter(
    (month) => month.id <= getCurrentMonth,
  );

  const handleOpentab = (rowData) => {
    setLoading(false);
    setRowData(rowData)
    setLoading(rowData.id);
    setTimeout(() => {
      setOpentab(true);
      setLoading(false);
    }, 500);
  };

  const handleDialougeClose = () => {
    setopenDialoug(false)
  }

  const finalConfirm = () => {
    const { firstDate, lastDate } = getFirstAndLastDateOfMonth(processField.year, parseInt(month));
    const body = {
      id: month,
      fromDate: firstDate,
      toDate: lastDate,
      salary_month: parseInt(month),
      salary_year: processField.year,
      employeeId: value.filter(filterEmpBasedOnJoiningDate).map((d) => d.employee_id),
      headerLocationId: processField.location?.includes('') || processField.location === null ? [] : processField.location,
      month_id: month,
      numPerPage: 20,
      pageCount: 0,
      searchString: ""
    };
    const processSalaryData = {
      salary_month: month,
      salary_year: processField.year,
      pageCount: 0,
      numPerPage: pageSize,
      searchString: '',
      employeeId: commoncookie,
      headerLocationId: headerLocationId,
      process_monthid: processedmonthid
    };


    if (!processField.empName?.length || !processField.location?.length || !month || !processField.year) {
      setFormErrors({
        empName: processField.empName?.length ? null : 'Field is required',
        location: processField.location?.length ? null : 'Field is required',
        month: month ? null : 'Field is required',
        year: processField.year ? null : 'Field is required',
      });
      return;
    }

    body.incentiveData = incentiveData.filter(i => body.employeeId.includes(i.employee_id))


    setBackGroundJobs(prevState => {
      const index = prevState.findIndex(i => i.salary_month === month && i.salary_year === processField.year)
      if (index === -1) {
        return [...prevState, { job_id: null, salary_month: month, salary_year: processField.year, status: 'PROCESSING' }]
      } else {
        prevState.status = 'PROCESSING'
        return prevState
      }
    })

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(createProcessSalaryAction(body, (data) => {
        if (data?.message === 'Check Joining date of the employees') {
          clearInterval(checkJobStatusInterval.current)
          return alert(data?.message)
        }
        dispatch(getDetailsBasedonMonth())
        const info = JSON.parse(data.info)
        const isSomeDataAvailable = Object.keys(info).some(i => info[i].length > 0)
        if (isSomeDataAvailable) {
          setProcessInfoOpen(true)
        } else {
          processSalaryUpdateAlert(dispatch, "Processed")
        }
        setHelpDialogText(info)

        setBackGroundJobs(prevState => {
          const index = prevState.findIndex(i => i.salary_month === month && i.salary_year === processField.year)
          if (index !== -1) {
            prevState[index].job_id = data.job_id;
          }
          return prevState
        })
      })),
      dispatch(processSalaryPaginationAction(processSalaryData, commoncookie)),
      dispatch(getDetailsBasedonMonth()),
    );
    setopenDialoug(false)
  }


  const handleJobDetails = (rowData) => {
    let component = < Typography variant='body1'>View</Typography>;

    let color = "#1976d2";
    if (loading === rowData.id) {
      component = <CircularProgress size={24} color='inherit' />
    }

    const jStatus = backGroundJobs.find(i => i.salary_month === rowData.month && i.salary_year === rowData.year)

    setProcessedmonthid(rowData.processedMonth_id)


    if (jStatus && jStatus.status === 'PROCESSING' && rowData.status !== 'Confirmed') {
      component = < Typography variant='body1'>Processing</Typography>
      color = "gray";
    }

    if (jStatus && jStatus.status === 'DONE') {
      component = < Typography variant='body1'>View</Typography>
      color = "#1976d2";
    }

    let isDataAvailable = false;
    if (backGroundJobs.find(i => i.ss_process_month_id === rowData.id)) {
      isDataAvailable = true
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <Button
          color='primary'
          variant='contained'
          onClick={() => handleOpentab(rowData)}
          style={{
            textTransform: 'none',
            transition: 'background-color 0.3s ease',
            backgroundColor: color,
            borderRadius: '30px'
          }}
        // disabled={loading}
        >
          {component}

        </Button>
        {/* <IconButton
        disabled={!isDataAvailable}
        onClick={() => {
          setProcessInfoOpen(true)
          setHelpDialogText(prev => {
            const temp = backGroundJobs.find(i => i.ss_process_month_id === rowData.id)?.info ?? "{}"
            return JSON.parse(temp)
          })
        }}
      >
        <InfoIcon sx={{ color: '#949494' }} />
      </IconButton> */}
      </div>
    )

  }



  function filterEmpBasedOnJoiningDate(f) {
    if (f.dateOfJoining !== null) {
      const d = new Date(f.dateOfJoining);
      const y1 = d.getFullYear() < processField.year;
      const m = d.getMonth() + 1 <= parseInt(month);
      const y = d.getFullYear() <= processField.year;
      return y1 || m && y;
    } else {
      return false;
    }
  }

  const commonCellStyle = {
    fontFamily: "poppins",
    fontSize: "11px",
    fontWeight: "400",
    color: 'rgba(0, 0, 0, 0.7)',
  };

  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | Process Detail </title>
      </Helmet>
      <Grid>
        <Dialog open={openDialoug} onClose={handleDialougeClose}>
          <DialogTitle>{'Partial Procress'}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              would you like to proceed with partial process!
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button variant='contained' color='error' onClick={handleDialougeClose}>
              Cancel
            </Button>
            <Button variant='contained' onClick={finalConfirm} autoFocus>
              Proceed
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
      {opentab === true ? (
        <Processed rowData={rowdata} handleClose={handletabClose} setRowData={setRowData} />) : (
        <Grid
          container
          display='flex'
          flexDirection='row'
          alignItems='center'
          spacing={5}
        >

          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Card sx={{ p: 3, borderRadius: 2 }}>
              <Grid container spacing={3}>
                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <FormControl fullWidth variant='filled'>
                    <InputLabel sx={{ color: formErrors.month ? 'red' : '' }}>Select Month <span style={{ color: 'red' }}>*</span></InputLabel>
                    <Select
                      value={month}
                      label='Select Month'
                      required
                      onChange={handleChange}
                      sx={{ height: '42px' }}
                      error={formErrors.month !== null}
                      helperText={formErrors.month}
                    >
                      {(processField.year === currentYear ? pastMonthNames : monthNames).map((m) => {
                        return (
                          <MenuItem key={m.id} value={m.id}>
                            {m.name}
                          </MenuItem>
                        );
                      })}
                    </Select>
                    <FormHelperText sx={{ color: 'red' }}>
                      {formErrors.month}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <FormControl variant='filled' fullWidth>
                    <InputLabel sx={{ color: formErrors.year ? 'red' : '' }}>Year <span style={{ color: 'red' }}>*</span></InputLabel>
                    <Select
                      value={processField.year === null ? null : (processField.year || currentYear)}
                      name='year'
                      required
                      onChange={(e) => {
                        handleChangelocation(e)
                        setFormErrors({
                          ...formErrors,
                          year: null,
                        })
                      }}
                      label='Year'
                      sx={{ height: '42px' }}
                      error={formErrors.year !== null}
                      helperText={formErrors.year}
                    >
                      {previousYears.slice().sort((a, b) => b - a).map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                      <MenuItem value={previousYears}>{ }</MenuItem>
                    </Select>
                    <FormHelperText sx={{ color: 'red' }}>
                      {formErrors.year}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                <Grid
                  display={'flex'}
                  size={{
                    lg: 3,
                    md: 3,
                    sm: 6,
                    xs: 12
                  }}>
                  <FormControl fullWidth variant='filled'>
                    <InputLabel id='demo-multiple-name-label'>
                      Select Category <span style={{ color: 'red' }}>*</span>
                    </InputLabel>
                    <Select
                      // sx={{ minHeight: '65px' }}
                      name='category'
                      required={true}
                      multiple
                      value={selectedCategory}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 170,
                            // overflowY: 'auto',
                          },
                        },
                      }}
                      onChange={(e) => {
                        const { value } = e.target;
                        console.log('valusssss', value)
                        setselectedCategory(value.includes('') ? [''] : value);
                        handleChange(e);
                      }}
                      error={formErrors.category !== null}
                      helperText={formErrors.category}
                      //input={<OutlinedInput label="Multiple Select" />}
                      renderValue={(selected) => {
                        return (
                          <Stack gap={1} direction='row' flexWrap='wrap'>
                            {selected.includes('') ? (
                              <Chip
                                key=''
                                label='All Category'
                                sx={{
                                  marginRight: '6px',
                                  marginBottom: '-6px',
                                  marginTop: '-8px',
                                  height: '35px',
                                }}
                                onDelete={() => {
                                  setselectedCategory([]);
                                  handleChange({
                                    target: { name: 'category', value: [] },
                                  });
                                }}
                                deleteIcon={
                                  <CommonToolTip title='Cancel'>
                                    <CancelIcon
                                      onMouseDown={(event) =>
                                        event.stopPropagation()
                                      }
                                    />
                                  </CommonToolTip>
                                }
                              />
                            ) : (
                              selected.map((value) => {
                                const locate = employeeCategoryList.find(
                                  (emp) => emp.category_name === value,
                                );
                                return (
                                  <Chip
                                    key={value}
                                    label={locate ? locate.category_name : ''}
                                    sx={{
                                      marginRight: '6px',
                                      marginBottom: '-6px',
                                      marginTop: '-8px',
                                      height: '35px',
                                    }}
                                    onDelete={() => {
                                      setselectedCategory(
                                        selectedCategory.filter(
                                          (item) => item !== value,
                                        ),
                                      );
                                      handleChange({
                                        target: {
                                          name: 'category',
                                          value: selectedCategory.filter(
                                            (item) => item !== value,
                                          ),
                                        },
                                      });
                                    }}
                                    deleteIcon={
                                      <CancelIcon
                                        onMouseDown={(event) =>
                                          event.stopPropagation()
                                        }
                                      />
                                    }
                                  />
                                );
                              })
                            )}
                          </Stack>
                        );
                      }}
                    >
                      <MenuItem value=''>All Category</MenuItem>
                      {employeeCategoryList?.map((m) => (
                        <MenuItem
                          key={m.category_name}
                          value={m.category_name}
                          disabled={selectedCategory.includes('')}
                        >
                          {m.category_name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText sx={{ color: 'red' }}>
                      {formErrors.category}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                <Grid
                  display={'flex'}
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <FormControl fullWidth variant='filled'>
                    <InputLabel id='demo-multiple-name-label' sx={{ color: formErrors.location ? 'red' : '' }}>
                      Select Location <span style={{ color: 'red' }}>*</span>
                    </InputLabel>
                    <Select
                      // sx={{ minHeight: '65px' }}
                      name='location'
                      required={true}
                      multiple
                      value={selectedlocate}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 170,
                            // overflowY: 'auto',
                          },
                        },
                      }}
                      onChange={(e) => {
                        const { value } = e.target;
                        setSelectedLocate(value.includes('') ? [''] : value);
                        setFormErrors({
                          ...formErrors,
                          location: null
                        });
                        handleChangelocation(e);
                      }}
                      error={formErrors.location !== null}
                      helperText={formErrors.location}
                      //input={<OutlinedInput label="Multiple Select" />}
                      renderValue={(selected) => {
                        return (
                          <Stack gap={1} direction='row' flexWrap='wrap'>
                            {selected.includes('') ? (
                              <Chip
                                key=''
                                label='All Location'
                                sx={{
                                  marginRight: '6px',
                                  marginBottom: '-6px',
                                  marginTop: '-8px',
                                  height: '35px',
                                }}
                                onDelete={() => {
                                  setSelectedLocate([]);
                                  handleChangelocation({
                                    target: { name: 'location', value: [] },
                                  });
                                }}
                                deleteIcon={
                                  <CommonToolTip title='Cancel'>
                                    <CancelIcon
                                      onMouseDown={(event) =>
                                        event.stopPropagation()
                                      }
                                    />
                                  </CommonToolTip>
                                }
                              />
                            ) : (
                              selected.map((value) => {
                                const locate = stocklocation.find(
                                  (emp) => emp.location_id === value,
                                );
                                return (
                                  <Chip
                                    key={value}
                                    label={locate ? locate.location_name : ''}
                                    sx={{
                                      marginRight: '6px',
                                      marginBottom: '-6px',
                                      marginTop: '-8px',
                                      height: '35px',
                                    }}
                                    onDelete={() => {
                                      setSelectedLocate(
                                        selectedlocate.filter(
                                          (item) => item !== value,
                                        ),
                                      );
                                      handleChangelocation({
                                        target: {
                                          name: 'location',
                                          value: selectedlocate.filter(
                                            (item) => item !== value,
                                          ),
                                        },
                                      });
                                    }}
                                    deleteIcon={
                                      <CancelIcon
                                        onMouseDown={(event) =>
                                          event.stopPropagation()
                                        }
                                      />
                                    }
                                  />
                                );
                              })
                            )}
                          </Stack>
                        );
                      }}
                    >
                      <MenuItem value=''>All Location</MenuItem>
                      {stocklocation.map((m) => (
                        <MenuItem
                          key={m.location_id}
                          value={m.location_id}
                          disabled={selectedlocate.includes('')}
                        >
                          {m.location_name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText sx={{ color: 'red' }}>
                      {formErrors.location}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                <Grid
                  display={'flex'}
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <FormControl fullWidth variant='filled'>
                    <CommonUserAutoComplete
                      searchVal={searchValEmployeeFilter}

                      requestSearch={requestSearchEmployeeFilter}
                      value={value}
                      error={formErrors.empName}
                      setValue={handleChangeEmployeeName}
                      type={getLocationBasedEmployee}
                      searchType={searchLocationBasedEmployee}
                      selectedAll={selectedAll}
                      setSelectedAll={setSelectedAll}
                      isMandatory={true}
                    />
                  </FormControl>
                </Grid>

                <Grid container spacing={2} alignItems="center" sx={{ mt: 2, px: 2 }}>
                  {/* Left side - Incentive Upload */}
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" flexWrap="wrap"  size={{
                      lg: 3,
                      md: 3,
                      sm: 6,
                      xs: 12
                    }}>
                      <Box display="flex" alignItems="center" mr={2}>
                        <Button
                          component="label"
                          variant="outlined"
                          startIcon={<UploadFileIcon />}
                          sx={{ mr: 0.5 }}
                        >
                          Upload Incentive excel
                          <input type="file" accept=".xlsx" hidden onChange={handleIncentiveUpload} />
                        </Button>
                        <CommonToolTip title={'Download template for incentive upload'}>
                          <IconButton
                            aria-label='view code'
                            onClick={() => downloadXlsxData('incentive')}
                            size="small"
                            sx={{ ml: 0.5 }}
                          >
                            <SaveAltIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                        </CommonToolTip>
                      </Box>

                      {filename && (
                        <Box display="flex" alignItems="center">
                          <Typography variant="body2" sx={{ mx: 0.5, maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {filename}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setIncentiveData([]);
                              setFilename("");
                            }}
                          >
                            <DeleteOutlineOutlinedIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  {/* Right side - Deduction Upload with 15px left gap */}
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" flexWrap="wrap" sx={{ ml: { md: 2 } }}>
                      <Box display="flex" alignItems="center" mr={2}  size={{
                      lg: 3,
                      md: 3,
                      sm: 6,
                      xs: 12
                    }}>
                        <Button
                          component="label"
                          variant="outlined"
                          startIcon={<UploadFileIcon />}
                          sx={{ mr: 0.5 }}
                        >
                          Upload Deduction excel
                          <input type="file" accept=".xlsx" hidden onChange={handleDeductionUpload} />
                        </Button>
                        <CommonToolTip title={'Download template for deduction upload'}>
                          <IconButton
                            aria-label='view code'
                            onClick={() => downloadXlsxData('deduction')}
                            size="small"
                            sx={{ ml: 0.5 }}
                          >
                            <SaveAltIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                        </CommonToolTip>
                      </Box>

                      {deductionfilename && (
                        <Box display="flex" alignItems="center">
                          <Typography variant="body2" sx={{ mx: 0.5, maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {deductionfilename}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setDeductionData([]);
                              setdeductionfilename("");
                            }}
                          >
                            <DeleteOutlineOutlinedIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </Grid>


                <Grid
                  flexDirection={'row'}
                  size={{
                    lg: 2,
                    md: 3,
                    sm: 6,
                    xs: 12
                  }}>
                  <Button
                    fullWidth
                    variant='contained'
                    //disabled={processSalaryCount > 0 && true}
                    sx={{ height: '42px' }}
                    onClick={() => processSalaryFunc()}
                  >
                    <Typography>{'Process Salary'}</Typography>
                  </Button>
                </Grid>
                <Grid style={{ display: "flex", justifyContent: "space-between", padding: '10px' }}>


                </Grid>

              </Grid>

            </Card>
          </Grid>
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Card>
              <MaterialTable
                totalCount={processSalaryCount || 0}
                components={{
                  ...stickyTableComponents,
                  Toolbar: (props) => (
                    <Box
                      sx={{
                        display: 'flex',
                        width: '100%',
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <MTableToolbar {...props} />
                      </Box>
                      {/* <Box>
                        <CommonSearch
                          searchVal={data.searchVal}
                          cancelSearch={cancelSearch}
                          requestSearch={requestSearch}
                        />
                      </Box> */}
                    </Box>
                  ),
                }}
                actions={[]}
                page={data.page}
                // onPageChange={(page) => handlePageChange(page)}
                // onRowsPerPageChange={(size) => handlePageSizeChange(size)}
                options={getStickyTableOptions({
                  headerStyle,
                  bodyOffset: 320,
                  options: {
                    // headerStyle,
                    cellStyle,
                    search: true,
                    toolbar: true,
                    actionsColumnIndex: -1,
                    paging: false,
                  }
                })}
                columns={[
                  // {
                  //   title: 'Id',
                  //   field: 'processedMonth_id',
                  //   editable: false,
                  // },
                  {
                    title: 'Month/year',
                    field: 'month',
                    // defaultSort: 'desc',
                    sorting: false,
                    render: (rowData) => {
                      const obj = monthNames.find(
                        (m) => m.id === parseInt(rowData.month),
                      );
                      const monthName = obj ? obj.name.slice(0, 3) : null;
                      return `${monthName}/${rowData.year}`;
                    },
                  },
                  {
                    title: 'Start Date',
                    field: 'start_date',
                    // defaultSort: 'desc',
                    sorting: false,
                    render: (rowData) => {
                      return rowData.start_date === null ? '' : moment(rowData.start_date).format('DD/MM/YYYY')
                    }

                  },
                  {
                    title: 'End Date',
                    field: 'end_date',
                    // defaultSort: 'desc',
                    sorting: false,
                    render: (rowData) => {
                      return rowData.end_date === null ? '' : moment(rowData.end_date).format('DD/MM/YYYY')
                    }

                  },
                  {
                    title: 'Category Name',
                    field: 'category_name',
                    render: (rowData) => {
                      if (!rowData?.category_name) return '-'

                      try {
                        const parsed = JSON.parse(rowData.category_name)

                        if (Array.isArray(parsed)) {

                          return parsed.join(', ')
                        } else if (typeof parsed === 'object' && parsed !== null) {
                          if (Array.isArray(parsed)) {
                            return parsed.map(p => p.name || '').join(', ')
                          }
                          return parsed.name || '-'
                        } else {
                          return String(parsed)
                        }
                      } catch (err) {
                        return rowData.category_name
                      }
                    },
                  },
                  {
                    title: 'No of employee',
                    field: 'Employee_count',
                    // defaultSort: 'desc',
                    sorting: false,
                  },
                  // {
                  //   title: 'Year',
                  //   field: 'year',
                  // },
                  {
                    title: 'Last Update',
                    field: 'updatedAt',
                    // defaultSort: 'desc',
                    sorting: false,
                    render: (rowData) => (moment(rowData.updatedAt).format("DD/MM/YYYY"))
                  },
                  {
                    title: 'Status',
                    field: 'status',
                    cellStyle: { textTransform: "capitalize" },
                    // defaultSort: 'desc',
                    sorting: false,
                    render: rowData => {
                      let color = ''; // Default color
                      switch (rowData.status) {
                        case 'pending':
                          color = 'red';
                          break;
                        case 'Confirmed':
                          color = 'green';
                          break;
                        case 'Partially Confirmed':
                          color = 'orange';
                          break;
                      }
                      return <span style={{ color }}>{rowData.status}</span>;
                    }
                  },
                  {
                    title: 'Details',
                    editable: false,
                    sorting: false,
                    render: (rowData) => handleJobDetails(rowData),
                  },
                ]}
                data={processedMonthData}
                title={
                  <Typography
                    className='page-title'
                    variant='h6'
                    align='left'
                    style={{ paddingTop: '10px', paddingBottom: '10px' }}
                  >
                    {'Processed Detail'}
                  </Typography>
                }
              />
            </Card>
          </Grid>
          {open && (
            <PaySlip
              open={open}
              handleClose={handleClose}
              paySlipData={paySlipData}
              company_logo={company_logo}
              signature={signature}
            />
          )}
          <Dialog open={processInfoOpen} onClose={() => setProcessInfoOpen(false)}>
            <DialogContent>
              <Grid style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  {helpDialogText.attendance_not_processed && <Table data={helpDialogText.attendance_not_processed} tableName="attendance" get_empbasecompany={get_empbasecompany} />}

                  {/* <Typography variant="h4">Attendance Not processed for below Employees</Typography>
                  {(helpDialogText.attendance_not_processed && 
                    helpDialogText.attendance_not_processed.length > 0) ?
                   helpDialogText.attendance_not_processed.map((e,i) => {
                    const employee = get_empbasecompany.find((emp) => emp.employee_id === e);
                     const capitalizedFirstName = employee.first_name.charAt(0).toUpperCase() + employee.first_name.slice(1);
                     return <li key={i}>{capitalizedFirstName}</li>;
                  }) : (
                    <li style={{ listStyleType: "none" }}></li>
                  )} */}

                </div>
                <div>
                  {helpDialogText.salary_structure_not_assigned && <Table data={helpDialogText.salary_structure_not_assigned} tableName="salary" get_empbasecompany={get_empbasecompany} />}
                  {/* <Typography variant="h4">Salary Not assigned for below Employees</Typography>
                  {(helpDialogText.salary_structure_not_assigned && 
                    helpDialogText.salary_structure_not_assigned.length > 0) ? 
                      helpDialogText.salary_structure_not_assigned.map((e,i) => {
                      const employee = get_empbasecompany.find((emp) => emp.employee_id === e);
                      const capitalizedFirstName = employee.first_name.charAt(0).toUpperCase() + employee.first_name.slice(1);
                     return <li key={i}>{capitalizedFirstName}</li>;
                    }) : (
                      <li style={{ listStyleType: "none" }}></li>
                    )} */}

                </div>
                <div>
                  {helpDialogText.emp_shift_not_assigned && <Table data={helpDialogText.emp_shift_not_assigned} tableName="shift" get_empbasecompany={get_empbasecompany} />}
                  {/* <Typography variant="h4">Shift Not assigned for below Employees</Typography>
                  {(helpDialogText.emp_shift_not_assigned && 
                    helpDialogText.emp_shift_not_assigned.length > 0) ? 
                      helpDialogText.emp_shift_not_assigned.map((e,i) => {
                      const employee = get_empbasecompany.find((emp) => emp.employee_id === e);
                      const capitalizedFirstName = employee.first_name.charAt(0).toUpperCase() + employee.first_name.slice(1);
                     return <li key={i}>{capitalizedFirstName}</li>;
                    }) : (
                      <li style={{ listStyleType: "none" }}></li>
                    )} */}

                </div>
                <div>

                  {helpDialogText.different_attendance_startday && <Table data={helpDialogText.different_attendance_startday} tableName="DiffrentStartDay" get_empbasecompany={get_empbasecompany} />}
                </div>
              </Grid>
            </DialogContent>
            <DialogActions onClick={() => setProcessInfoOpen(false)}>
              <Button>close</Button>
            </DialogActions>
          </Dialog>
        </Grid>)}
    </>
  );
}


function Table({ data, tableName, get_empbasecompany }) {
  const tableNameObj = {
    attendance: 'Attendance Not processed for below Employees',
    salary: 'Salary Not assigned for below Employees',
    shift: 'Shift Not assigned for below Employees',
    DiffrentStartDay: 'StartDay Differ ON below Policy'
  };

  if (data.length === 0) return null;

  return (
    <Grid
      style={{
        margin: '5px 0px',
        width: '100%',
        maxWidth: '700px',
      }}
    >
      <table
        style={{
          border: '1px solid',
          fontSize: cellStyle.fontSize,
          borderCollapse: 'collapse',
          width: '100%',
          paddingBottom: '10px',
        }}
      >
        <thead>
          <tr>
            <th style={{ border: '1px solid', width: '60%' }}>
              {tableNameObj[tableName]}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => {
            // If tableName is 'DiffrentStartDay', show the policy name directly
            const displayValue =
              tableName === 'DiffrentStartDay'
                ? d
                : (() => {
                  const employee = get_empbasecompany.find(
                    (emp) => emp.employee_id === d
                  );
                  return employee
                    ? employee.last_name
                      ? `${capitalize(employee.first_name)} ${capitalize(employee.last_name)}`
                      : capitalize(employee.first_name)
                    : '';
                })();

            return (
              <tr key={i}>
                <td style={{ border: '1px solid', padding: '0px 5px' }}>
                  {displayValue}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Grid>
  );
}


