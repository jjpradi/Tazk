import React ,{useState, useContext, useMemo, useRef} from 'react';
import {Box, drawerClasses, Slide,Grid,MenuItem,IconButton,Dialog,  InputLabel, FormControl, Select,Button} from '@mui/material';
import {useDispatch, useSelector} from 'react-redux';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import AppsHeader from '@crema/core/AppsContainer/AppsHeader';
import AppsContainer from '@crema/core/AppsContainer/index';
import TaskSideBarMenu from './TaskSideBarMenu';
import TaskView from './TaskView';
import PendingTask from './PendingTask';
import ScheduledTask from './ScheduledTask';
import CompletedTask from './CompletedTask';
import StarredTask from './StarredTask';
import IncompletedTask from './IncompletedTask';
import { InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CommonSearch from 'utils/commonSearch';
import { useEffect } from 'react';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import { filterTaskDetailsAction } from 'redux/actions/payrollDashboard_actions';
import { setSearchTaskAction, getSearchTaskAction,getTaskStatusAction } from 'redux/actions/payrollDashboard_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'; 
import CloseIcon from '@mui/icons-material/Close';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { createTheme,ThemeProvider } from "@mui/material/styles";
import moment from 'moment';
import { get_search_company_based_employee, getEmpbasecompanyFilterAction, set_search_company_based_employee } from 'redux/actions/attendance_actions';
import CommonUserAutoComplete from 'utils/commonAutoCompleteForUser';
import { GET_EMP_BASECOMPANY_FILTER } from 'redux/actionTypes';
import { getsessionStorage } from 'pages/common/login/cookies';

let menus = [{id:1, name:"All", icon :<GroupOutlinedIcon />} ,
  {id:2, name:"Pending", icon :<PendingOutlinedIcon />} ,
  {id:3, name:"Scheduled", icon : <ScheduleOutlinedIcon />},
  {id:4, name:"Completed", icon : <CheckCircleOutlinedIcon />},
  {id:5, name:"Incomplete", icon : <RuleOutlinedIcon/>},
  {id:6, name:"Starred", icon : <StarBorderOutlinedIcon/>},
]

export const Task = (props) => {
  let dispatch= useDispatch()
  const [activeMenu, setActiveMenu] = useState(menus[0].id);

  const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(CreateNewButtonContext);
  const {
    PayrolldashboardReducers: {filterTaskDetails },
    attendanceReducer: { searchCompanyBasedEmployeeFilter,getCompanyBasedEmployeeFilter }
  } = useSelector((state) => state);

  const[searchval, setSearchval] = useState({searchString: ''})
  // Debounced copy of the search input — child tabs subscribe to this so
  // typing doesn't fire a paged API request on every keystroke.
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchval.searchString || '');
    }, 300);
    return () => clearTimeout(handle);
  }, [searchval.searchString]);

  const [filterOpen, setFilterOpen] = useState(false);
  const [projectname , SetProjectName] = useState('');
  const [duedate, setDueDate] = useState(null);

  const [filterprojectname , SetFilterProjectName] = useState('');
  const [filterduedate, setFilterDueDate] = useState(null);
  const [filterprojectid, setFilterProjectId] = useState(null);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');

  const [selectedAll, setSelectedAll] = useState(false);

  const [userSelectError, setUserSelectError] = useState('');

  const [value, setValue] = useState([]);
  const [employeeList, setEmployeeList] = useState([])
  const storage = getsessionStorage();
  const isEmployee = storage?.role_name?.toLowerCase() === 'employee';

  useEffect(() => {
    if (isEmployee && storage?.employee_id) {
      setEmployeeList([storage.employee_id]);
    }
  }, [isEmployee, storage?.employee_id]);


  useEffect(() => {
    const temp = {
      searchString : '',
        numPerPage: 5,
        pageCount: 0,
        employeeFilter: null,
        dueDateFilter: null,
        projectFilter: null,
        typeFilter: "all"
    };
    
    // dispatch(filterTaskDetailsAction(temp, (response) => {}));
  },[])

  useEffect(() => {
    let data1 = {
      searchString:""
    }
    dispatch(getEmpbasecompanyFilterAction(data1,(res)=>{
      dispatch({
        type: GET_EMP_BASECOMPANY_FILTER,
        payload: res,
      });
    }))
  }, []);
  

  const handleMenuClick = (id) => {
    setActiveMenu(id);
    setFilterProjectId(null);
    setSearchval({ searchString: '' });
    setFilterDueDate(null);
    setSearchValEmployeeFilter('');
    setValue([]);
    if (isEmployee && storage?.employee_id) {
      setEmployeeList([storage.employee_id]);
    } else {
      setEmployeeList([]);
    }
    SetProjectName('');
  };

  const cancelSearch = () => {
    // console.log('cancel')
    setSearchval({...searchval, searchString: ''})

    dispatch(setSearchTaskAction({data: [], numCount: 0}))

    let payload = {
     searchString : "",
  numPerPage: 5,
  pageCount: 0,
  employeeFilter: null,
  dueDateFilter: null,
  projectFilter: null,
  typeFilter: "all"
    }

    dispatch(getSearchTaskAction(payload, setModalTypeHandler, setLoaderStatusHandler))
}

const requestSearch = (e) => {
    const val = e.target.value
    
    setSearchval({...searchval, searchString: val})
    dispatch(setSearchTaskAction({data: [], numCount: 0}))

    let payload = {
      searchString : val,
      numPerPage: 5,
      pageCount: 0,
      employeeFilter: null,
      dueDateFilter: null,
      projectFilter: filterprojectid,
      typeFilter: "all"
    }

    dispatch(getSearchTaskAction(payload, setModalTypeHandler, setLoaderStatusHandler))
}


const applyFilter = () => {
    SetFilterProjectName(projectname)
    setFilterDueDate(duedate)
  setFilterOpen(false)
  if (projectname) {
    const project = filterTaskDetails.data.find((project) => project.project_name === projectname);
    setFilterProjectId(project ? project.project_id : null);
  } else if(value){
    const employees = value.map((d) => d.employee_id)
    setEmployeeList(employees)
  }
  else {
    setFilterProjectId(null);
  }
}
// console.log('filterprojectid', filterprojectid);
// console.log('filterTaskDetails', filterTaskDetails);



const handleClear = () => {
  SetFilterProjectName('');
  setFilterDueDate(null);
  setFilterProjectId(null);

  SetProjectName('');
  setDueDate(null);
  setValue([]);
  setSearchValEmployeeFilter('');
  dispatch(set_search_company_based_employee([]));

  if (isEmployee && storage?.employee_id) {
    setEmployeeList([storage.employee_id]);
  } else {
    setEmployeeList([]);
  }

  setFilterOpen(false);
};

const handleChange = (event) => {
  SetProjectName(event.target.value);
};

const requestSearchEmployeeFilter = (val) => {

  setSearchValEmployeeFilter(val);
  dispatch(set_search_company_based_employee([]));

  if (!val) {
    return
  }

  let data = {
    searchString: val
  }
  dispatch(
    get_search_company_based_employee(
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ),
  );

};

const handleChangeEmployeeName =(val)=>{
  setValue(val)
  if(val?.length > 0){
    setUserSelectError('');
  }
}

const allProjectsRef = useRef(new Set());

const allprojectname = useMemo(() => {
  const incoming = Array.isArray(filterTaskDetails?.data)
    ? filterTaskDetails.data
    : [];
  incoming.forEach((r) => {
    if (r?.project_name) allProjectsRef.current.add(r.project_name);
  });
  return Array.from(allProjectsRef.current);
}, [filterTaskDetails?.data]);




  return (
    <>
      <AppsContainer
        sidebarContent={
          <TaskSideBarMenu
            activeMenu={activeMenu}
            onMenuClick={handleMenuClick}
            menus={menus}
          />
        }>
        <AppsHeader>
          <Grid
            display='flex'
            justifyContent='flex-end'
            alignItems='center'
            size={{
              lg: 4,
              md: 4,
              sm: 4,
              xs: 12
            }}>
            <CommonSearch
              searchVal={searchval.searchString}
              cancelSearch={cancelSearch}
              requestSearch={requestSearch}
            />
            <IconButton onClick={() => { setFilterOpen(true) }}>
              <FilterAltIcon />
            </IconButton>
          </Grid>

          {filterOpen === true && <Dialog open={filterOpen} onClose={() => setFilterOpen(false)}>
            <div style={{ display: 'flex', justifyContent: 'end' }}>
              <IconButton
                onClick={() => setFilterOpen(false)}
              >
                <CloseIcon />
              </IconButton>
            </div>

      <Grid container gap={2} padding='20px' >
       <Grid container spacing={2} size={12}>
      <Grid size={12}>
        <FormControl variant='filled' component='fieldset' fullWidth>
          <InputLabel>project name</InputLabel>
          <Select
            // style={{ textAlign: 'left' }}
            label='project name'
            onChange={handleChange}
            fullWidth={true}
            value={projectname}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300,
                  overflowY: 'auto',
                },
              },
            }}
          >
              {allprojectname.map((project, index) => (
              <MenuItem value={project} key={index}>
                {project}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid> 
      <Grid container spacing={2} size={12}> 
              <Grid size={12}>
                <LocalizationProvider dateAdapter={DateAdapter}>
                  <DatePicker
                    name='duedate'
                    label='Due Date'
                    variant='filled'
                    format='DD/MM/YYYY'
                    value={duedate}
                    onChange={(newDate) => setDueDate(newDate)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              </Grid>
            {!isEmployee &&
              <Grid size={12}>
                          <FormControl fullWidth variant='filled'>
                          <CommonUserAutoComplete
                    searchVal={searchValEmployeeFilter}
                    requestSearch={requestSearchEmployeeFilter}
                    value={value}
                    // error={formErrors.empName}
                    setValue={handleChangeEmployeeName}
                    type={getCompanyBasedEmployeeFilter}
                    searchType={searchCompanyBasedEmployeeFilter}
                    selectedAll={selectedAll}
                    setSelectedAll={setSelectedAll}
                  
                  />
                
                </FormControl>  
                          </Grid>
              }
      
              <Grid
                container
                spacing={2}
                justifyContent="center"
                alignItems="center"
                gap={2}
                style={{ marginTop: '20px' }}
                size={12}>
              <Grid
                size={{
                  sm: 3,
                  xs: 12
                }}>
                <Button
                  fullWidth
                  onClick={handleClear}
                  variant='contained'
                  color='warning'
                >
                  Clear
                </Button>
              </Grid>
              <Grid
                size={{
                  sm: 3,
                  xs: 12
                }}>
                <Button
                  fullWidth
                  onClick={applyFilter}
                  variant='contained'
                >
                  Apply
                </Button>
              </Grid>
            </Grid>
            </Grid>
                  </Grid>
      </Dialog>} 



  </AppsHeader>

        {
          activeMenu === 1 && 
        <TaskView projectname={filterprojectid} duedate={filterduedate} search={debouncedSearch} employee={employeeList}/>
      
        }
        {
        activeMenu === 2 && 
        <PendingTask projectname={filterprojectid} duedate={filterduedate} search={debouncedSearch} employee={employeeList}/>
        }
        {
        activeMenu === 3 &&
        <ScheduledTask projectname={filterprojectid} duedate={filterduedate} search={debouncedSearch} employee={employeeList}/>
        }
        {
          activeMenu === 4 &&
          <CompletedTask projectname={filterprojectid} duedate={filterduedate} search={debouncedSearch} employee={employeeList}/>
        }
        {
           activeMenu === 5 &&
           <IncompletedTask projectname={filterprojectid} duedate={filterduedate} search={debouncedSearch} employee={employeeList}/>
        }
        {
          activeMenu === 6 &&
          <StarredTask />
        }
      
     </AppsContainer>
    </>
  );
  
}
export default Task;
