import MaterialTable from 'utils/SafeMaterialTable'
import { Autocomplete, Box, Button, Card, Chip, FormControl, FormHelperText,Divider, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography, IconButton} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close';
import CommonToolTip from 'components/ToolTip';
import React, { useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getEmpbasecompanyAction, getLocBaseEmpAction, getLocBaseEmpFilterAction, get_search_location_based_employee, set_search_location_based_employee } from 'redux/actions/attendance_actions';
import apiCalls from 'utils/apiCalls';
import CancelIcon from '@mui/icons-material/Cancel';
import { getsessionStorage } from 'pages/common/login/cookies';
import context from '../../../context/CreateNewButtonContext';
import { getALlSalaryStructureAction, getMappedDetailsAction, mapEmployeeBasedSalary, mapEmployeeBasedSalaryAction, listSelectUserAction,getSearchSalaryAction, salaryPaginationAction,getALlSalaryStructureWithAllowanceAndDeductionAction, updateEmpSalaryMappingAction } from 'redux/actions/salary_actions';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { commonDateFormat1, getDateFormat } from 'utils/getTimeFormat';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import moment from 'moment';
import { GET_EMP_BASECOMPANY, GET_MAP_DETAIL, LOCATION_BASE_DEP_FILTER } from 'redux/actionTypes';
import { listDepartment, listDesignationAction } from 'redux/actions/shifts.actions';
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import { get_searchUserRoleAction } from 'redux/actions/role_actions';
import { useNavigate } from 'react-router-dom';
import { capitalize } from 'lodash';
import CommonUserAutoComplete from 'utils/commonAutoCompleteForUser';

import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle,font14_500 } from 'utils/pageSize';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import toMomentOrNull from 'utils/DateFixer';

function mapSalary(props) {
    const currentDate =  getDateFormat(new Date())
    const date = new Date();
    const getCurrentMonth = `0${date.getMonth() + 1}`;
    const [month, setMonth] = useState(getCurrentMonth);
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const dispatch = useDispatch();
    const storage = getsessionStorage();
    const [selectedNames, setSelectedNames] = useState([]);
    const [fromdate,setFromdate] = useState(null);
    const [selectedSalaryId, setSelectedSalaryId] = useState(null)
    const navigate = useNavigate();
    const [formErrors, setFormErrors] = useState({
        user:null,
        location: null,
        employee: null,
        salaryStructureId: null,
        fromdate: null
    });
    const [todate,setTodate] = useState(null);
      const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(context);
  console.log("999",   commoncookie,
    headerLocationId,)

    const [formValues, setFormValues] = useState({
        month_year: null,
        overwrite: 0,
        // user_type: [],
        renewal: '0',
        location: [],
        employee: [],
        month_date_wise: 'MONTH_WISE',
        startDate: null,
        endDate: null,
        shift_id: null,
        department:[]
      });

    const [designation, setDesignation] = useState([]);
    const [department, setDepartment] = useState([]);
    const [location, setLocation] = useState([]);
    const [role, setRole] = useState([]);
    const [isValid, setIsValid] = useState(false);
    const [tableData, setTableData] = useState([]);

    const [value, setValue] = React.useState([]);

    const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');

    // const [option,setOption] = useState(false)
  
    const [selectedAll, setSelectedAll] = useState(false);


    const [open,setOpen] =useState(false);

  const [isEditWithNew, setIsEditWithNew] = useState(false);
  const [salaryName, setSalaryName] = useState('');
  const [editableAllowances, setEditableAllowances] = useState([]);
  const [editableDeductions, setEditableDeductions] = useState([]);

  console.log("editableAllowances",editableAllowances,editableDeductions)


    const [allowanceList, setAllowanceList] = useState([]);
const [deductionList, setDeductionList] = useState([]);
    const handleChangeEmployeeName =(val)=>{
      setValue(val)
      if(val?.length > 0){
       setFormErrors({...formErrors,employee:null})
      }

 }

    const {
        attendanceReducer: { get_empbasecompany,getLocationBasedEmployee, searchLocationBasedEmployee }, 
        SalaryReducers: { mappedDetails,salarystructurelist ,getAllSalaryWithAmountAndDeduction,searchSalaryData},
        roleReducer: {shift_role},
        ShiftsReducer: {userwiseselect, getschedule,search_shiftlist,list_department, list_designation},
        stockLocationReducer: {stocklocation},


    } = useSelector((state) => state);
    
    const previousYears = Array.from({ length: 4}, (v, i) => currentYear - i);


    useEffect(() => {
      const body = {
        searchString: '',
        employee_id: commoncookie,
        headerLocationId: headerLocationId,
        numPerPage: 20,
        pageCount: 0,
      };
      const data ={
        searchString :''
       }
      apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          // dispatch(getEmpbasecompanyAction()),
          // dispatch(getALlSalaryStructureAction()),
          dispatch(getALlSalaryStructureWithAllowanceAndDeductionAction()),
          !list_designation.length &&  dispatch(listDesignationAction()),
          !list_department.length && dispatch(listDepartment(data)),
          !stocklocation.length && dispatch(listStockLocationAction(commoncookie, headerLocationId)),
          // !shift_role.length && dispatch(get_searchUserRoleAction( body, setModalTypeHandler, setLoaderStatusHandler)),
  
      )

      return () => {
          dispatch({
              type: GET_MAP_DETAIL,
              payload: [],
          });
        dispatch({
          type: LOCATION_BASE_DEP_FILTER,
          payload: [],
        });
      }
    }, []);

  useEffect(() => {
    console.log("selectedSalaryId",selectedSalaryId,getAllSalaryWithAmountAndDeduction)
    const selected = getAllSalaryWithAmountAndDeduction.find(
      i => i.id === selectedSalaryId
    );

    if (!selected) return;

    setSalaryName(selected.name);

    const allowances = selected.allowance.map(a => ({
      ...a,
      amount: a.allowance_amount
    }));

    const deductions = selected.deduction.map(d => ({
      ...d,
      amount: d.deduction_amount
    }));

    setAllowanceList(allowances);
    setDeductionList(deductions);

    setIsEditWithNew(false);
  }, [selectedSalaryId]);

  const generateNextSalaryName = (currentName) => {
  const names = getAllSalaryWithAmountAndDeduction.map(
    s => s.name.toLowerCase().trim()
  );
  const match = currentName.match(/(.*?)(\d+)?$/);
  let base = match[1].trim();
  let number = match[2] ? parseInt(match[2], 10) : 1;

  let newName = `${base} ${number + 1}`;

  while (names.includes(newName.toLowerCase())) {
    number += 1;
    newName = `${base} ${number + 1}`;
  }

  return newName;
};


  const handleEditWithNew = () => {
  const selected = getAllSalaryWithAmountAndDeduction.find(
    s => s.id === selectedSalaryId
  );
  if (!selected) return;

  const newName = generateNextSalaryName(selected.name);
  setSalaryName(newName);
  console.log("selected",selected)

  setEditableAllowances(
    selected.allowance.map(a => ({
      ...a,
      amount: 0
    }))
  );

  setEditableDeductions(
    selected.deduction.map(d => ({
      ...d,
      amount: 0
    }))
  );

  setIsEditWithNew(true);
};






    useEffect(() => {

      if(props.status === 'edit'){
        console.log("edit_data 00000", props.edit_data);
        
        setFromdate(props.edit_data?.fromDate.split("-").reverse().join("-"));
        setSelectedSalaryId(props.edit_data?.salary_structure_id)
        setDesignation([''])
        setLocation([''])
        setDepartment([''])
      }
      
    },[props.edit_data])

    useEffect(() => {
      
      if(props.status === 'edit'){
        const emp = getLocationBasedEmployee.filter(i => i.employee_id === props.edit_data.employee_id);
        setTableData(emp)
        setValue(emp)

      }
    },[getLocationBasedEmployee, props.edit_data])

    console.log("dftttt", value, tableData);


    useEffect (() => {
      setValue([])
      
      if(location?.length > 0) {
        dispatch(getLocBaseEmpFilterAction({designation:  designation[0] === '' ? list_designation.map((d) => d.designation)  :designation, 
           department:
            department[0] === ''
              ? list_department.map((d) => d.department)
              : department,
          location: location ,
          searchString: ''},(res)=> {
          if(res.data?.employees){
            console.log(res?.data,'correction');
            dispatch({
              type: LOCATION_BASE_DEP_FILTER,
              payload: res.data?.employees,
            });
          }
        }))
      } else {
         dispatch({
              type: LOCATION_BASE_DEP_FILTER,
              payload: [],
            });
      }
      },[location,department,designation])


  useEffect(() => {
    // console.log("sdfsff")
    setOpen(true)
    const filteredData = getAllSalaryWithAmountAndDeduction.filter(item => item.id === selectedSalaryId);

    // console.log("asdasdff", filteredData)
    if (filteredData.length > 0) {
      const allowances = filteredData[0].allowance;
      const deductions = filteredData[0].deduction;

      // Merge the two arrays and add amount property
      const temp = [...allowances, ...deductions].map(i => {
        const amount = i.allowance_amount ?? i.deduction_amount;
        return {
          ...i,
          amount
        };
      });
      setAllowanceList(temp.filter(i => i.allowance_code));
      setDeductionList(temp.filter(i => i.deduction_code));
      console.log("temp", temp)
    }
  }, [selectedSalaryId])


      const requestSearchEmployeeFilter = (val) => {

        // let allDept = list_department.map((d) => d.department);
    
        setSearchValEmployeeFilter(val);
        dispatch(set_search_location_based_employee([]));
    
        if (!val) {
          return
        }
    
        let data = {
          ...formValues,
          designation:designation,
          department:department.length > 0 ? department : list_department.map((d) => d.department),
          searchString: val
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



    // useEffect(() => {
    //     if(selectedSalaryId && month && year){
    //         const data = {
    //             ss_id: selectedSalaryId,
    //             ss_month: parseInt(month),
    //             ss_year: year
    //         }
    //     dispatch(getMappedDetailsAction(data))
    //     }
    // }, [selectedSalaryId, month, year]);


      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

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
          pastMonths.push({ id:monthNumber, name: monthNames});
        }
        return pastMonths;
      };
      
  const pastMonthNames = generatePastMonthNamesArray();

  const buildEditWithNewPayload = () => ({
    name: salaryName,
    fromDate: fromdate,
    toDate: null,
    employeeId: value.map((d) => d.employee_id),
    allowanceAmounts: editableAllowances.map(a => ({
      id: a.allowance_type_id,
      allowance_code: a.allowance_code,
      amount: String(a.amount || 0)
    })),

    deductionAmounts: editableDeductions.map(d => ({
      id: d.deduction_type_id,
      deduction_code: d.deduction_code,
      amount: String(d.amount || 0)
    })),
    type: 'editWithNewStructure'
  });



  const handleSubmit = (id) => {

    let isValid = isValidDate(fromdate, value, id);

    if (isValid && searchSalaryData && searchSalaryData.length > 0) {
      const formattedSelectedDate = moment(fromdate, "YYYY-MM-DD").format("DD-MM-YYYY");

      const alreadyAssignedEmployees = value.filter(emp => {
        return searchSalaryData.some(
          assigned => 
            assigned.employee_id === emp.employee_id && 
            assigned.fromDate === formattedSelectedDate
        );
      });

      if (alreadyAssignedEmployees.length > 0) {
        const employeeNames = alreadyAssignedEmployees.map(e => e.first_name).join(', ');
        dispatch(OpenalertActions({ 
          msg: `Salary structure already assigned on ${formattedSelectedDate}`, 
          severity: 'error' 
        }));
        return;
      }
    }

    let data = {
      employeeId: value.map((d) => d.employee_id),
      id: id,
      fromDate: fromdate,
      toDate: null
    };
    const body = {
      pageCount: 0,
      numPerPage: 20,
      searchString: '',
      employeeId: null,
      headerLocationId: headerLocationId,
      from: null,
      to: null,
    };

    if (isValid) {

      if (isEditWithNew) {

        if (isSalaryNameDuplicate(salaryName)) {
          dispatch(OpenalertActions({
            msg: 'Salary structure name already exists',
            severity: 'error'
          }));
          return;
        }
        if (!isBasicAmountValid(editableAllowances)) {
          dispatch(OpenalertActions({
            msg: 'Basic Pay must be greater than 0',
            severity: 'error'
          }));
          return;
        }

        const payload = buildEditWithNewPayload();
        console.log("payload", payload)
        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(
            mapEmployeeBasedSalaryAction(
              {
                ...payload,
                employeeId: value.map(v => v.employee_id)
              },
              () => {
                setIsEditWithNew(false);
                setEditableAllowances([]);
                setEditableDeductions([]);
                setSalaryName('');
                dispatch(salaryPaginationAction(
                  body,
                  setModalTypeHandler,
                  setLoaderStatusHandler
                ))

                props.handleClose(props.status);
              }
            )
          )
        );

        return;
      }
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(mapEmployeeBasedSalaryAction(data, () => {

          dispatch(salaryPaginationAction(
            body,
            setModalTypeHandler,
            setLoaderStatusHandler
          ))
          props.handleClose(props.status);
        })
        )
      )
    }
    else {
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
    }
  }
      
    const isValidDate = (dateString, name, id) => {
      setFormErrors({
        ...formErrors,
        fromdate: dateString ? null : 'error',
        employee: name.length ? null : 'error',
        salaryStructureId: id ? null : 'error'

    });

    if(!dateString || !name.length || !id){
        return false
    }else{
        return true
    }
        

    };

    const SelectDesignation = (e) => {
        let {value} = e.target;
        setDesignation(value.includes('') ? [''] : value);
        setFormValues({...formValues, employee: [""]})
        setFormErrors({
          ...formErrors,
          employee: null,
        })
      };

    const SelectLocation = (e) => {
        let {value} = e.target;
        setLocation(value.includes('') ? [''] : value);
        setFormValues({...formValues, location: [""]})
        setFormErrors({
          ...formErrors,
          location: null,
        })
      };

          const SelectDepartment = (e) => {
        let {value} = e.target;
        setDepartment(value.includes('') ? [''] : value);
        setFormValues({...formValues, location: [""]})
        setFormErrors({
          ...formErrors,
          department: null,
        })
      };

    const Selectrole = (e) => {
      let {value} = e.target;
      setRole(value);
      setFormErrors({
        ...formErrors,
        employee: null,
      })
    };
    
    const handleChange = (e) => {
        let {name, value} = e.target;
        setFormValues({...formValues, [name]: value});
      };

  const isSalaryNameDuplicate = (name) => {
    return getAllSalaryWithAmountAndDeduction.some(
      s =>
        s.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
  };

  const isBasicAmountValid = (allowances) => {
    const basic = allowances.find(
      a => a.allowance_code === 'BASIC'
    );

    return basic && Number(basic.amount) > 0;
  };


    const handleemployee = () => {
    
      if (selectedAll) {

        dispatch(getLocBaseEmpFilterAction({
          designation: designation[0] === '' ? list_designation.map((d) => d.designation) : designation,
          department:
            department[0] === ''
              ? list_department.map((d) => d.department)
              : department,
          location: location[0] === '' ? stocklocation.map((d) => d.location_id) : location,
          searchString: ''
        }, (res) => {
          if (res.data?.employees) {
             processFunction(res.data?.employees)
          }
        }))
      }
  
      else {
  
        processFunction(value)
      }
     
    
    };

    const processFunction = (value) =>{
      if ( value?.length === 0 ) {
        setFormErrors({
          ...formErrors,
          employee: value.length === 0  ? 'Employee is required' : null,
          // salaryStructureId:  selectedSalaryId === null ? 'Field is required': null,
          // fromdate: fromdate === null ? 'Field is required': null,
         
        });
        dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
        return;
      }

      const employedata = value.map((d) => d.employee_id);

      let body = {
        role_id: role,
        emp_id: employedata,
        designation: designation,
        department:department,
        location: formValues.location.every((value) => value === '') ? 'null' : formValues.location,
        startDate: formValues.startDate?.format('YYYY-MM-DD'),
        endDate: formValues.endDate?.format('YYYY-MM-DD'),
        shiftId: formValues.shift_id,
      };
        

      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          listSelectUserAction(
            body,
            (data) => {
              setTableData(data);
            }
          ),
        )
      )
    }

    const handleReset = () => {

      setRole([]);
      setDesignation([]);
      setLocation([]);
      setDepartment([])
      setFromdate(null);
      setSelectedSalaryId(null);
      setOpen(false)

      setFormValues({
        month_year: null,
        overwrite: 0,
        renewal: '0',
        location: [],
        employee: [],
        month_date_wise: 'MONTH_WISE',
        startDate: null,
        endDate: null,
        shift_id: null
      });
      
      setFormErrors({
        user:null,
        location: null,
        employee: null,
        salaryStructureId: null,
        fromdate: null
      });

      dispatch({
        type: GET_MAP_DETAIL,
        payload: [],
      });
      dispatch({
        type: LOCATION_BASE_DEP_FILTER,
        payload: [],
      });

      setTableData([])

    }
    console.log(salarystructurelist,'cvv', formErrors, formValues);

  const deleteEmployee = (employeeId) => {
    const updatedData = tableData.filter(employee => employee.employee_id !== employeeId);
    const updatedValue = value.filter(employee => employee.employee_id !== employeeId);
    setTableData(updatedData);
    setValue(updatedValue)
  }

  const handleUpdate = () => {
    let isValid = isValidDate(fromdate ,value, selectedSalaryId);
    let data = {
      employee_id: value.map((d)=> d.employee_id)[0],
      salary_structure_id: selectedSalaryId,
      fromDate: fromdate,
      toDate: null,
      emp_salary_id: props.edit_data.emp_salary_id,
    };

    const body = {
          pageCount: 0,
          numPerPage: 20,
          searchString: '',
          employeeId: commoncookie,
          headerLocationId: headerLocationId,
          from: null,
          to: null,
        };

    if (isValid) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(updateEmpSalaryMappingAction(data, () => {
            dispatch(salaryPaginationAction(
              body,
              setModalTypeHandler,
              setLoaderStatusHandler,
            ))
            props.handleClose(props.status);
          })
        )
    )
    }
    else{
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
    }
  }

    return (
      <Box
        sx={{
          height: 'calc(100vh - 80px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 2,
            backgroundColor: 'background.paper',
            px: 2,
            pt: 2,
          }}
        >
         <Grid container spacing={3} display='flex' alignItems={'center'}>
         <Grid
           display='flex'
           justifyContent={'flex-start'}
           size={{
             lg: 6,
             md: 6,
             sm: 6,
             xs: 6
           }}>
             <Typography className='page-title'> Assign Salary Structure to Employee</Typography>
           </Grid>
           <Grid
             display='flex'
             justifyContent={'flex-end'}
             size={{
               lg: 6,
               md: 6,
               sm: 6,
               xs: 6
             }}>
             <IconButton
               aria-label='close'
               onClick={() => props.handleClose(false)}
             >
               <CloseIcon />
             </IconButton>
           </Grid>
           <Grid
             size={{
               lg: 12,
               md: 12,
               sm: 12,
               xs: 12
             }}>
             <Divider />
           </Grid>
           </Grid>
        </Box>
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            px: 2,
            pb: 2,
          }}
        >
        <Card
          sx={{
            p: 2,
            mt: 2,
          }}
        >
           <Grid
             container
             display={'flex'}
             flexDirection={'row'}
             alignItems={'center'}
             spacing={5}
             padding={5}
           >


             {/* -------------------- month year ----------- */}



             {/* <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                   <FormControl fullWidth variant='filled'>
                     <InputLabel sx={{color: formErrors.month? 'red':''}}>Select Month <span style={{ color: 'red' }}>*</span></InputLabel>
                     <Select
                       value={month}
                       label='Select Month'
                       required
                       onChange={(e) => {
                         setMonth(e.target.value);
                         setFormErrors({
                         ...formErrors,
                         month:null,
                         })
                       }}
                       error={formErrors.month !== null}
                       helperText={formErrors.month}
                     >
                       {(year === currentYear ? pastMonthNames : monthNames).map((m) => {
                         return (
                           <MenuItem key={m.id} value={m.id}>
                             {m.name}
                           </MenuItem>
                         );
                       })}
                     </Select>
                     <FormHelperText sx={{color: 'red'}}>
                       {formErrors.month}
                     </FormHelperText>
                   </FormControl>
                 </Grid>



                 <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}
                   item
                 >
                   <FormControl variant='filled' fullWidth>
                     <InputLabel sx={{color: formErrors.year? 'red':''}}>Year <span style={{ color: 'red' }}>*</span></InputLabel>
                     <Select
                       value={year === null ? null : (year || currentYear)}
                       name='year'
                       required
                       onChange={(e) => {
                         setYear(e.target.value);
                         setMonth(null)
                         setFormErrors({
                         ...formErrors,
                         year:null,
                         })
                       }}
                       label='Year'
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
                     <FormHelperText sx={{color: 'red'}}>
                       {formErrors.year}
                     </FormHelperText>
                   </FormControl>
                 </Grid> */}
             {/* -------------------- month year -----------  */}


             {/* -------------------- old ------------------ */}

             {/* <Grid size={{ xs: 3, sm: 3, md: 3, lg: 3 }}>
                         <Box display='flex' justifyContent='flex-end'>
                             <LocalizationProvider dateAdapter={DateAdapter}>
                                 <DatePicker
                                     label='Date'
                                     name='date'
                                     value={fromdate}
                                     inputVariant='contained'
                                     inputFormat='DD-MM-YYYY'
                                     disableFuture
                        
                                     onChange={(date) => {
                                         if (date) {
                                             const formattedDate = moment(date).format("YYYY-MM-DD");
                                             setFromdate(formattedDate);
                                             setFormErrors({...formErrors , fromdate:null})
                                         }
                                     }}
                                     renderInput={(params) => <TextField {...params} variant='filled'
                                         required
                                         error={formErrors.fromdate === null ? false : true}
                                         helperText={formErrors.fromdate === null ? '' : "Date required"}
                                     />}
                                 />
                             </LocalizationProvider>
                         </Box>
                     </Grid>

                     <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }}>
                         <FormControl 
                             fullWidth 
                             variant='filled'
                             error={formErrors.user === null ? false : true}
                         >
                             <InputLabel id='demo-multiple-name-label'>
                                 Select User <span style={{ color: 'red' }}>*</span>
                             </InputLabel>
                             <Select
                                 sx={{ minHeight: '65px' }}
                                 name='empName'
                                 multiple
                                 value={selectedNames}
                                 onChange={(e) => {
                                     const { value } = e.target;
                                     console.log('asdwwewe',value)
                                     setSelectedNames(value.includes('') ? [''] : value);
                                     setFormErrors({...formErrors , user:null})
                                 }}
                                 required

                                 renderValue={(selected) => {
                                     return (
                                             selected.map((value) => {
                                                 const employee = get_empbasecompany.find(
                                                     (emp) => emp.employee_id === value,
                                                 );
                                                 return (
                                                     <Chip
                                                         key={value}
                                                         label={employee ? employee.first_name : 'All Users'}
                                                         onDelete={() => {
                                                             setSelectedNames(
                                                                 selectedNames.filter(
                                                                     (item) => item !== value,
                                                                 ),
                                                             );

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
                                                 );
                                             })
                                         
                                     );
                                 }}
                             >
                                 <MenuItem value=''>All Users</MenuItem>
                                 {get_empbasecompany.map((m) => (
                                     <MenuItem
                                         key={m.employee_id}
                                         value={m.employee_id}
                                         disabled={selectedNames.includes('')}
                                         style={{textTransform: 'capitalize'}}
                                     >
                                         {m.first_name}
                                     </MenuItem>
                                 ))}
                             </Select>
                             {formErrors.user !== null &&  <FormHelperText sx={{color:'red'}}>User is Required!</FormHelperText>}
                         </FormControl>
                     </Grid>



                     <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }}>
                         <FormControl 
                             fullWidth 
                             variant='filled'
                             required={true}
                             error={formErrors.salaryStructureId === null ? false : true}
                         >
                             <InputLabel >Salary Structure</InputLabel>
                             <Select
                                 size='small'
                                 sx={{ minHeight: '65px' }}
                                 value={selectedSalaryId}
                                 fullWidth={true}
                                 label='Choose Salary Structure'
                                 onChange={(e) => {
                                     const newSelectedSalaryId = e.target.value;
                                     setSelectedSalaryId(newSelectedSalaryId);
                                     setFormErrors({...formErrors , salaryStructureId:null})
                                 }}
                             >
                                 {salarystructurelist.map((salary) => (
                                     <MenuItem key={salary.id} value={salary.id}>
                                         {salary.name}
                                     </MenuItem>
                                 ))}
                             </Select>
                             <FormHelperText>{formErrors.salaryStructureId ? "Salary structure required" : null}</FormHelperText>
                         </FormControl>

                     </Grid> */}
           </Grid>
           {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} style={{display:'flex',justifyContent:'center',padding:5}} item>
                     <Button variant='outlined' onClick={()=>{handleSubmit(selectedSalaryId)}}>Map Employee</Button>
                 </Grid> */}
           {/* --------------------- old ------------ */}

           <Grid container display='flex' flexDirection='row' spacing={2}>
             <Grid
               size={{
                 md: 6,
                 xs: 12
               }}>
               <Grid container display='flex' flexDirection='row' spacing={3} >

                 <Grid
                   size={{
                     lg: 6,
                     md: 6,
                     sm: 6,
                     xs: 12
                   }}>
                   <Typography variant='h6'>Salary Structure</Typography>

                 </Grid>
                 <Grid
                   size={{
                     lg: 6,
                     md: 6,
                     sm: 6,
                     xs: 12
                   }}>
                   {/* <FormControl
                     fullWidth
                     variant='filled'
                     required={true}
                     error={formErrors.salaryStructureId === null ? false : true}
                   >
                     <InputLabel id="demo-simple-select-helper-label">Salary Structure</InputLabel>
                     <Select
                       labelId="demo-simple-select-helper-label"
                       label="Salary Structure"
                       size='small'
                       sx={{ height: '55px' }}
                       value={selectedSalaryId ? selectedSalaryId : ''}
                       fullWidth={true}
                       onChange={(e) => {
                         
                         const newSelectedSalaryId = e.target.value;
                         setSelectedSalaryId(newSelectedSalaryId);
                         setFormErrors({ ...formErrors, salaryStructureId: null })
                       }}
                     >
                       {Array.isArray(getAllSalaryWithAmountAndDeduction) && getAllSalaryWithAmountAndDeduction.map((salary) => (
                         <MenuItem key={salary.id} value={salary.id}>
                           {salary.name}
                         </MenuItem>
                       ))}
                     </Select>
                     <FormHelperText>{formErrors.salaryStructureId ? "Salary structure required" : null}</FormHelperText>
                   </FormControl> */}
                   {!isEditWithNew ? (
                     <Autocomplete
                       options={getAllSalaryWithAmountAndDeduction}
                       getOptionLabel={(option) => option.name || ''}
                       value={
                         getAllSalaryWithAmountAndDeduction.find(
                           opt => opt.id === selectedSalaryId
                         ) || null
                       }
                       onChange={(event, newValue) => {
                         if (newValue) {
                           setSelectedSalaryId(newValue.id);
                           setSalaryName(newValue.name);
                         } else {
                           setSelectedSalaryId(null);
                           setSalaryName('');
                         }
                         setFormErrors({ ...formErrors, salaryStructureId: null });
                       }}
                       renderInput={(params) => (
                         <TextField
                           {...params}
                           required
                           label="Salary Structure"
                           variant="filled"
                           error={formErrors.salaryStructureId !== null}
                           helperText={
                             formErrors.salaryStructureId ? 'Salary structure required' : ''
                           }
                         />
                       )}
                     />
                   ) : (
                     <TextField
                       fullWidth
                       label="Salary Structure"
                       variant="filled"
                       value={salaryName}
                       onChange={(e) => setSalaryName(e.target.value)}
                       required
                     />
                   )}


                 </Grid>

               </Grid>

               <Grid container display='flex' flexDirection='row' spacing={3} paddingTop={5}>

                 <Grid
                   size={{
                     lg: 6,
                     md: 6,
                     sm: 6,
                     xs: 12
                   }}>
                   <Typography variant='h6'>Effective From Date</Typography>

                 </Grid>
                 <Grid
                   size={{
                     lg: 6,
                     md: 6,
                     sm: 6,
                     xs: 12
                   }}>
                   <FormControl variant='filled' fullWidth>
                     <LocalizationProvider dateAdapter={DateAdapter}>
                       <DatePicker
                         fullWidth
                         label='Date'
                         name='date'
                         value={toMomentOrNull(fromdate)}
                         inputVariant='contained'
                         format='DD/MM/YYYY'
                         disableFuture
                         // onChange={(e, v) => {
                         //     setFromdate(moment(e._d).format("YYYY-MM-DD"));
                         //     setFormErrors({...formErrors , fromdate:null})
                         // }}
                         onChange={(date) => {
                           if (date) {
                             const formattedDate = moment(date).format("YYYY-MM-DD");
                             setFromdate(formattedDate);
                             setFormErrors({ ...formErrors, fromdate: null })
                           }
                         }}
                         views={['year', 'month', 'day']}
                         slotProps={{ textField: { variant: 'filled', required: true, error: formErrors.fromdate === null ? false : true, helperText: formErrors.fromdate === null ? '' : "Date required" } }}
                       />
                     </LocalizationProvider>
                   </FormControl>

                 </Grid>

               </Grid>
                 <Grid container display='flex' flexDirection='row' spacing={3} paddingTop={5}>
                   <Grid
                     size={{
                       lg: 6,
                       md: 6,
                       sm: 6,
                       xs: 12
                     }}>
                   <Typography variant='h6'>Select Location</Typography>
                 </Grid>
                <Grid
                  size={{
                    lg: 6,
                    md: 6,
                    sm: 6,
                    xs: 12
                  }}>
                 <FormControl variant='filled' fullWidth>
                   <InputLabel id='demo-multiple-name-label'>
                       Select Location
                     </InputLabel>
                      <Select
                 sx={{ minHeight: '35px' }}
                 name='location'
                 label='Select Location'
                 required={true}
                 multiple
                 value={location}
                 onChange={(e) => {
                   const { value } = e.target;
                   setLocation(value.includes('') ? [''] : value);
                   handleChange(e);
                 }}
                 //error={formErrors.location !== null}
                 //helperText={formErrors.empName}
                 //input={<OutlinedInput label="Multiple Select" />}
                 renderValue={(selected) => {
                   return (
                     <Stack gap={1} direction='row' flexWrap='wrap'>
                       {selected.includes('') ? (
                         <Chip
                           key=''
                           label='All Location'
                           onDelete={() => {
                             setLocation([]);
                             handleChange({
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
                           sx={{ fontSize: '0.8rem', height: '28px', borderRadius: '12px' }}
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
                               onDelete={() => {
                                 setLocation(
                                   location.filter(
                                     (item) => item !== value,
                                   ),
                                 );
                                 handleChange({
                                   target: {
                                     name: 'location',
                                     value: location.filter(
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
                     disabled={location.includes('')}
                   >
                     {m.location_name}
                   </MenuItem>
                 ))}
               </Select>
                 </FormControl>
               </Grid>
               </Grid>

                 <Grid container display='flex' flexDirection='row' spacing={3} paddingTop={5}>
                   <Grid
                     size={{
                       lg: 6,
                       md: 6,
                       sm: 6,
                       xs: 12
                     }}>
                   <Typography variant='h6'>Select Department</Typography>
                 </Grid>
                <Grid
                  size={{
                    lg: 6,
                    md: 6,
                    sm: 6,
                    xs: 12
                  }}>
                 <FormControl variant='filled' fullWidth>
                   <InputLabel id='demo-multiple-name-label'>
                       Select Department
                     </InputLabel>
                   <Select
                     name='department'
                     multiple
                     value={department}
                     onChange={SelectDepartment}
                     disabled={props.status === 'edit'}
                       MenuProps={{
                         PaperProps: {
                           style: {
                             maxHeight: 300,
                             overflowY: 'auto',
                           },
                         },
                       }}
                     //input={<OutlinedInput label="Multiple Select" />}
                      renderValue={(selected) => {
                         return (
                           <Stack gap={1} direction='row' flexWrap='wrap'>
                             {selected?.map((value) => {
                               const departmentItem = list_department.find(
                                 (emp) => emp.department === value,
                               );

                               return selected.includes('') ||
                                 selected.length === departmentItem.length ? (
                                 <Chip
                                   label='All Department'
                                   onDelete={() => {
                                     setDepartment([])
                                   }}
                                   deleteIcon={
                                     <CommonToolTip title='Cancel'>
                                       {' '}
                                       <CancelIcon
                                         onMouseDown={(event) => event.stopPropagation()}
                                       />{' '}
                                     </CommonToolTip>
                                   }
                                 />
                               ) : (
                                 <Chip
                                   key={value}
                                   label={
                                     departmentItem ? departmentItem.department : ''
                                   }
                                   onDelete={() =>
                                     setDepartment((prev) =>
                                       prev.filter(
                                         (item) => item !== value,
                                       ),
                                     )
                                   }
                                   deleteIcon={
                                     <CancelIcon
                                       onMouseDown={(event) => event.stopPropagation()}
                                     />
                                   }
                                   disabled={props.status === 'edit'}
                                 />
                               );
                             })}
                           </Stack>
                         );
                       }}
                   >
                     <MenuItem value=''>All Department</MenuItem>
                     {list_department.map((m) => (
                       <MenuItem
                         key={m.department}
                         value={m.department}
                         disabled={formValues?.department?.includes('')}
                       >
                         {m.department}
                       </MenuItem>
                     ))}
                   </Select>
                 </FormControl>
               </Grid>
               </Grid>




               <Grid container display='flex' flexDirection='row' spacing={3} paddingTop={5}>
                 <Grid
                   size={{
                     lg: 6,
                     md: 6,
                     sm: 6,
                     xs: 12
                   }}>
                   <Typography variant='h6'>Select Designation</Typography>
                 </Grid>
                 <Grid
                   size={{
                     lg: 6,
                     md: 6,
                     sm: 6,
                     xs: 12
                   }}>
                   <FormControl variant='filled' fullWidth>
                     <InputLabel id='demo-multiple-name-label'>
                       Select Designation
                     </InputLabel>
                     <Select
                       name='Designation'
                       multiple
                       value={designation}
                       onChange={SelectDesignation}
                       disabled={props.status === 'edit'}
                       MenuProps={{
                         PaperProps: {
                           style: {
                             maxHeight: 300,
                             overflowY: 'auto',
                           },
                         },
                       }}
                       // input={<OutlinedInput label="Multiple Select" />}
                       renderValue={(selected) => {
                         return (
                           <Stack gap={1} direction='row' flexWrap='wrap'>
                             {selected?.map((value) => {
                               const designationItem = list_designation.find(
                                 (emp) => emp.designation === value,
                               );

                               return selected.includes('') ||
                                 selected.length === list_designation.length ? (
                                 <Chip
                                   label='All Designation'
                                   onDelete={() => {
                                     setDesignation([])
                                   }}
                                   deleteIcon={
                                     <CommonToolTip title='Cancel'>
                                       {' '}
                                       <CancelIcon
                                         onMouseDown={(event) => event.stopPropagation()}
                                       />{' '}
                                     </CommonToolTip>
                                   }
                                 />
                               ) : (
                                 <Chip
                                   key={value}
                                   label={
                                     designationItem ? designationItem.designation : ''
                                   }
                                   onDelete={() =>
                                     setDesignation((prev) =>
                                       prev.filter(
                                         (item) => item !== value,
                                       ),
                                     )
                                   }
                                   deleteIcon={
                                     <CancelIcon
                                       onMouseDown={(event) => event.stopPropagation()}
                                     />
                                   }
                                   disabled={props.status === 'edit'}
                                 />
                               );
                             })}
                           </Stack>
                         );
                       }}
                     >
                       <MenuItem value=''>All Designation</MenuItem>
                       {list_designation?.map((m) => (
                         <MenuItem key={m.designation} value={m.designation}>
                           {m.designation}
                         </MenuItem>
                       ))}
                     </Select>
                   </FormControl>
                 </Grid>
                 {/* <Grid size={{ xs: 6, sm: 4.5, md: 4.5, lg: 4.5 }}>
   <FormControl
     // disabled={user_type.includes(2) ? false : true}
     variant='filled'
     fullWidth
   >
     <InputLabel id='demo-multiple-name-label'>Select Role</InputLabel>
     <Select
       name='role'
       multiple
       value={role}
       onChange={Selectrole}
       // input={<OutlinedInput label="Multiple Select" />}
       renderValue={(selected) => {
         return (
           <Stack gap={1} direction='row' flexWrap='wrap'>
             {selected?.map((value) => {
               const employee = shift_role.find(
                 (emp) => emp.role_id === value,
               );
               return (
                 <Chip
                   key={value}
                   label={employee ? employee.role_name : ''}
                   onDelete={() =>
                     setRole(role.filter((item) => item !== value))
                   }
                   deleteIcon={
                     <CancelIcon
                       onMouseDown={(event) => event.stopPropagation()}
                     />
                   }
                 />
               );
             })}
           </Stack>
         );
       }}
     >
       {shift_role?.map((m) => (
         <MenuItem key={m.employee_id} value={m.role_id}>
           {m.role_name}
         </MenuItem>
       ))}
     </Select>
   </FormControl>
 </Grid> */}
                 {/* <Grid size={{ xs: 12, sm: 3, md: 3, lg: 2.5 }}>
  
 </Grid> */}
       

               </Grid>

               <Grid container display='flex' flexDirection='row' spacing={3} paddingTop={5}>
                 <Grid
                   size={{
                     lg: 6,
                     md: 6,
                     sm: 6,
                     xs: 12
                   }}>
                   <Typography variant='h6'>Select Employee</Typography>
                 </Grid>
                 <Grid
                   size={{
                     lg: 6,
                     md: 6,
                     sm: 6,
                     xs: 12
                   }}>
                   <FormControl fullWidth variant='filled'>
                     <CommonUserAutoComplete

                       searchVal={searchValEmployeeFilter}

                       requestSearch={requestSearchEmployeeFilter}
                       value={value}
                       setValue={handleChangeEmployeeName}
                       type={getLocationBasedEmployee}
                       searchType={searchLocationBasedEmployee}
                       selectedAll={selectedAll}
                       setSelectedAll={setSelectedAll}
                       error={formErrors.employee}
                       disabled={props.status === 'edit'}
                       isMandatory={true}
                     />

                   </FormControl>


                 </Grid>
               </Grid>
               <Grid container display='flex' flexDirection='row' spacing={3} paddingTop={5}>
                 <Grid
                   size={{
                     lg: 6,
                     md: 6,
                     sm: 6,
                     xs: 12
                   }}>
                   {/* <Typography variant='h6'>Select Employee</Typography> */}
                 </Grid>
                 <Grid
                   sx={{display:'flex' ,justifyContent :'center'}}
                   size={{
                     lg: 6,
                     md: 6,
                     sm: 6,
                     xs: 6
                   }}>
                 <Button onClick={handleemployee} variant={'outlined'}  >
               <Typography>{'Add'}</Typography>
             </Button>

                 </Grid>
               </Grid>
       
             </Grid>
             <Grid
               size={{
                 md: 6,
                 xs: 12
               }}>
   {open && (
     <Grid container spacing={2}>
       <Grid
         display="flex"
         flexDirection="column"
         gap={3}
         size={{
           lg: 12,
           md: 12,
           sm: 12,
           xs: 12
         }}>
         
         <Grid container>
           <Table
             data={isEditWithNew ? editableAllowances : allowanceList}
             tableName="allowance"
             editable={isEditWithNew}
             onChange={setEditableAllowances}
           />
         </Grid>

         <Grid container>
           <Table
             data={isEditWithNew ? editableDeductions : deductionList}
             tableName="deduction"
             editable={isEditWithNew}
             onChange={setEditableDeductions}
           />
         </Grid>

       </Grid>
     </Grid>
   )}
 </Grid>

           </Grid>

        
         </Card>
        <Grid style={{ paddingTop: 10 }}>
          <MaterialTable
          
            columns={[
              // { title: 'Id', field: 'salary_structure_id' },
              {
                title: 'Employee',
                field: 'first_name',
                render: rowData => {
                  const firstName = rowData.first_name.charAt(0).toUpperCase() + rowData.first_name.slice(1);
                  const lastName = rowData.last_name ? rowData.last_name.charAt(0).toUpperCase() + rowData.last_name.slice(1) : '';
                  return firstName + (rowData.last_name ? ' ' + lastName : '');
                },
                cellStyle: { textTransform: "capitalize" },
              },
              {
                title: 'Emp Code',
                field: 'employee_code',
              }
              // {
              //     title: 'Month',
              //     field:'ss_month',
              //     render: (rowData) => {
              //         const obj = monthNames.find(
              //           (m) => m.id === parseInt(rowData.ss_month),
              //         );
              //         const monthName = obj ? obj.name.slice(0, 3) : null;
              //         return monthName;
              //       },
              // },
              // {
              //     title: 'Year',
              //     field:'ss_year',
              // },
              // {
              //     title: 'To_Date',
              //     field:'to_date',
              //     render: (rowData) => (
              //         commonDateFormat1(rowData.to_date)
              //     )
              // },
              // { title: 'Name', field: 'company_id' },
              // { title: 'Employee_id', field: 'employee_id' }
            ]}
            data={tableData}
            title={
              <Typography
              className='page-title'
                variant="h6"
                align="left"
                style={{ paddingTop: '10px', paddingBottom: '10px' }}
              >
                Employee Detail
              </Typography>
            }
            options={{
              headerStyle,
              cellStyle,
              actionsColumnIndex: -1
            }}
            actions={[
              {
                icon: 'delete',
                tooltip: 'Delete Employee',
                onClick: (event, rowData) => {
                  const employeeId = rowData.employee_id;
                  console.log("sdfsdf", rowData)
                  deleteEmployee(employeeId);
                }
              }
            ]}
          />
        </Grid>
        </Box>
        <Grid
          spacing={7}
          container={true}
          direction='row'
          display='flex'
          justifyContent='flex-end'
          pt={3}
          gap="20px"
          sx={{
            position: 'sticky',
            bottom: 0,
            zIndex: 2,
            backgroundColor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            px: 2,
            pb: 2,
          }}
        >

          <Button
            onClick={() => handleReset()}
            name='Cancel'
            variant='contained'
            color='warning'
            size='medium'
            text='button'
            fullWidth={false}
            type='cancel'
            disabled={props.status === 'edit'}
          >
            Reset
          </Button>
          <Button
            onClick={() => {
              if(props.status === 'edit'){
                handleUpdate()
              }else{
                handleSubmit(selectedSalaryId)
              }
            }}
            style={{}}
            disabled={!tableData.length}
            name='Cancel'
            variant='contained'
            color='primary'
            size='medium'
            text='button'
            fullWidth={false}
            type='cancel'
          >
            {props.status === 'edit' ? 'Update' :  'Submit'}
          </Button>
        </Grid>
      </Box>
    );
}

export default mapSalary;

function Table({ data, tableName, editable = false, onChange }) {
  const tableAccess = {
    allowance: {
      colName: 'Earnings',
      rowName: 'allowance_name',
      rowAmount: 'amount'
    },
    deduction: {
      colName: 'Deductions',
      rowName: 'deduction_name',
      rowAmount: 'amount'
    }
  };

  if (!data || data.length === 0) return null;

  return (
    <Grid container sx={{ width: '100%' }}>
      <table
        style={{
          border: '1px solid',
          borderCollapse: 'collapse',
          width: '100%',
          fontSize: cellStyle.fontSize
        }}
      >
        <thead>
          <tr>
            <th style={{ border: '1px solid', width: '60%' }}>
              {tableAccess[tableName].colName}
            </th>
            <th style={{ border: '1px solid', width: '40%' }}>
              Amount
            </th>
          </tr>
        </thead>

        <tbody>
          {data.map((d, i) => (
            <tr key={i}>
              <td style={{ border: '1px solid', padding: '6px' }}>
                {d[tableAccess[tableName].rowName]}
              </td>

              <td style={{ border: '1px solid', padding: '6px' }}>
                {editable ? (
                  <TextField
                    type="number"
                    size="small"
                    variant="outlined"
                    value={d.amount}
                    onChange={(e) => {
                      const updated = [...data];
                      updated[i].amount = Number(e.target.value);
                      onChange(updated);
                    }}
                    fullWidth
                  />
                ) : (
                  d.amount
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Grid>
  );
}

