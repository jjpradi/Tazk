import React, { useContext, useEffect, useState } from 'react';
import { Typography, Table, TableBody, TableCell, TableHead, TableRow, Grid, Button, Link, Breadcrumbs, Card, Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import context from '../../context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import { filterTaskLogAction, get_searchTaskLogAction, set_searchTaskLogAction, summaryTasklogAction } from 'redux/actions/payrollDashboard_actions';
import { Helmet } from 'react-helmet-async';
import DataGridTemp from '../../components/dataGridTemp';
import CreateNewButtonContext from '../../context/CreateNewButtonContext'
import FilterTask from './Filtertask';
import { titleURL } from 'http-common';
import moment from 'moment';
import { get_search_company_based_employee, set_search_company_based_employee } from 'redux/actions/attendance_actions';
import { is } from 'date-fns/locale';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { maxBodyHeight, headerStyle, cellStyle } from 'utils/pageSize';
import {formatName} from 'utils/nameFormatter';
import CommonSearch from 'utils/commonSearch';
const TaskLogsPage = () => {
  const dispatch = useDispatch();
  const {
    PayrolldashboardReducers: { tasklogs_report, tasklogsReportCount },
  } = useSelector((state) => state);
  const { setLoaderStatusHandler, setModalTypeHandler } = useContext(context);
  const [filteropen,setFilteropen] = useState(false)
  const [searchVal,setSearchVal] = useState('');
  const [data,setData] = useState();
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [formValue, setFormValue] = useState({
    task_id: 'null',
    emp_id: 'null'
  });

  const [userSelectError, setUserSelectError] = useState('');
  const [value, setValue] = React.useState([]);
  
  const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');
  // const [selectedAll, setSelectedAll] = useState(false);
  // const [formValue, setFormValue] = useState({
  //   task_id: 'null',
  //   emp_id: 'null'
  // });
  const handleChangeEmployeeName =(val)=>{
    // console.log("val",val.length)
    setValue(val)
    if(val){
      setUserSelectError('');
     
    }

}

const requestSearchEmployeeFilter = (val) => {

  // let allDept = list_department.map((d) => d.department);

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


  // useEffect(() => {    
  //   let data={
  //     searchString:'',
  //     pageCount: 0,
  //     numPerPage: pageSize,
  //   }
  //   apiCalls(
  //     setModalTypeHandler,
  //     setLoaderStatusHandler,
  //     dispatch(summaryTasklogAction(data)),
  //   );
  // }, []);

  useEffect(() => {
    if(formValue.task_id !== 'null' || formValue.emp_id !== 'null'){
      let data = {
        ...formValue,
        pageCount: page,
        numPerPage: pageSize,
      }
      dispatch(filterTaskLogAction(data));
    }
    else{
      let data={
        searchString: searchVal,
        pageCount: page,
        numPerPage: pageSize,
      }
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(summaryTasklogAction(data)),
      );
    }
  }, [page, pageSize]);
  const handleStatusClick = (row) => {}
  const columnData = [
    { headerName: 'Task Name', field: 'task_name', width: 100 },
    { headerName: 'Assigned Person', field: 'full_name', width: 200, renderCell: (params) => params.row.full_name?formatName(params.row.full_name):"UnAssigned" },
    { headerName: 'Project Name', field: 'project_name', width: 150 },
    { 
      headerName: 'Start Time', 
      field: 'start_time', 
      width: 200,  
      // valueFormatter: (params) => new Date(params.value).toLocaleDateString('en-GB') 
    },
    { 
      headerName: 'End Time', 
      field: 'end_time', 
      width: 200, 
      // valueFormatter: (params) => new Date(params.value).toLocaleDateString('en-GB') 
    },
    {
  headerName: 'Complition %',
  field: 'work_hours',
  width: 220,
  renderCell: ({ row }) => {
    const e_min = convertToMinutes(row?.orginalEstimation ?? '');
    const l_min = timeToMinutes(row?.work_hours ?? '0');

    let percentage = e_min > 0 ? Math.round((l_min / e_min) * 100) : 0;
    if (!Number.isFinite(percentage) || percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;

    let color = 'deepskyblue';
    if (percentage > 25 && percentage <= 75) {
      color = 'tomato';
    } else if (percentage > 75) {
      color = 'mediumseagreen';
    }

    return (
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          pr: 1,
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: 22,
            border: `1px solid ${color}`,
            borderRadius: '999px',
            backgroundColor: '#f4f6f8',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              width: `${percentage}%`,
              height: '100%',
              backgroundColor: color,
              transition: 'width 0.3s ease',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 600,
              color: '#111827',
            }}
          >
            {percentage}%
          </Box>
        </Box>
      </Box>
    );
  },
}
,
    { headerName: 'Remarks', field: 'remarks', width: 400 },
    // { headerName: 'Assigned By', field: 'assignedBy', width: 200 },
    {
      headerName: 'Status',
      field: 'status_name',
     
      width: 200,
      renderCell: (params) => (
        <div
        //  variant="outlined"
         size="small"
         style={{
          backgroundColor: 'transparent',
          color: params.value === "INCOMPLETE" ? 'red' : params.value === "COMPLETED" ? 'green' : params.value === "TO DO" ? 'grey' : params.value === "IN PROGRESS" ? 'blue' : params.value === "TESTING" ?'purple' : 'black', // Set text color
          border: `2px solid ${params.value === "INCOMPLETE" ? 'red' : params.value === "COMPLETED" ? 'green' : params.value === "TO DO" ? 'grey' : params.value === "IN PROGRESS" ? 'blue' : params.value === "TESTING" ?'purple': 'transparent'}`, // Set border color with smaller width
          padding: '2px 4px', 
          borderRadius: '5px', 
          fontSize: '11px', 
          fontWeight: '600px',
          lineHeight: '1rem' 
        }}>
             {params.value}
        </div>
       
      ),
    },
    {headerName: 'Priority', field: 'priority_name',width:200},
    {headerName: 'Repeat Task', field: 'repeat_name',width:200},
    {headerName: 'Reporter', field: 'reporter' , width:200},
    {headerName: 'Original Estimation', field: 'orginalEstimation', width:200},
    {headerName:'Description',field: 'description', width:200},
    {headerName: 'Attachment', field:'attachment', width:200, renderCell: ({row})=>{
      return <div style={{display:'flex',flexDirection:'row'}}>
        {
          row?.attachment_url?.map((v,i)=>{
            return <img src={v?.image_url}style={{ height:'30px',width:'30px'}}/>
          })
        }
      </div>
    }},
    {headerName: 'Time Tracking', field: 'timeSpent',width:500}
  ];
  
  
 const requestSearch = (e) => {
  const val = e.target.value;
  setSearchVal(val)
  dispatch(set_searchTaskLogAction({ data: [], numRows: 0 }))
  const body = {
    searchString: val,
    // pageCount: 0,
    // numPerPage: pageSize,
  }
  dispatch(get_searchTaskLogAction(
    body,
    setModalTypeHandler,
    setLoaderStatusHandler
  ));
};

useEffect(()=>{
   let tasklogsWithIds = tasklogs_report?.length ? tasklogs_report?.map((log, index) => ({ ...log, id: index + 1 })) : []

  tasklogsWithIds.forEach(item => {
    if (item.start_time) {
        item.start_time = moment(item.start_time, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY hh:mm A');
    } 
    // else {
    //     item.start_time = ''; // Set empty string when start_time is invalid or null
    // }
    if (item.end_time) {
        item.end_time = moment(item.end_time, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY hh:mm A');
    } 
    // else {
    //     item.end_time = ''; // Set empty string when end_time is invalid or null
    // }
  });


  setData(tasklogsWithIds)
},[tasklogs_report])

const handleFilter =(val)=>{setFilteropen(val)}

const handlePageChange = async (page) => {
  setPage(page)
}

const handlePageSizeChange = async (size) => {
  setPage(0)
  setPageSize(size)
}



const handleSubmit = () => {
//   if (value?.length === 0  ) {
//     setUserSelectError('Employee is required');

//     return;

// }

  let data = {
    ...formValue,
    emp_id:value?.employee_id || null,
    pageCount: 0,
    numPerPage: pageSize,
  }
  setFormValue({...formValue,emp_id:data.emp_id || "null"})
  setPage(0)
  dispatch(filterTaskLogAction(data));
  handleFilter(false)
}

const clearButton = () => {
 
  setValue([])
  setFormValue({
    task_id: 'null',
    emp_id: 'null'
  });

  let data={
    searchString: '',
    pageCount: 0,
    numPerPage: pageSize,
  }
  setPage(0)
  apiCalls(
    setModalTypeHandler,
    setLoaderStatusHandler,
    dispatch(summaryTasklogAction(data)),
  );
  handleFilter(false)
}

  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | Summary Report </title>
      </Helmet>
          <CreateNewButtonContext.Consumer>
            {({ drawerOpen, setModalTypeHandler, setLoaderStatusHandler }) => (
              <React.Fragment>

                <DataGridTemp
                 title={
                  <Breadcrumbs
  separator={<NavigateNextIcon fontSize='small' />}
  aria-label='breadcrumb'
>
  <Link
    href='/projects/report'
    underline='hover'
    sx={{display: 'flex', alignItems: 'center'}}
  >
    <HomeIcon sx={{mr: 0.5}} fontSize='inherit' />
    Home
  </Link>
  <Typography className='page-title'>Summary Report</Typography>
</Breadcrumbs>
                
                } 
                  pageType='task'
                  pageSize={pageSize}
                  page={page}
                  data={data}
                  columns={columnData}
                  options={{ maxBodyHeight : maxBodyHeight,
                            minBodyHeight: maxBodyHeight,
                            overflowY: "visible",
                            headerStyle: headerStyle,
                            cellStyle: cellStyle,
                           }
                  }
                  // rowCount={data?.length}
                  // requestSearch={(e) => requestSearch(e.target.value)}
                   search={
                   <CommonSearch
                   searchVal={searchVal}
                   requestSearch={requestSearch}
                  //  cancelSearch={cancelSearch}
                  />
                }
                  filter={
                    // <TaskFilter
                    // open={filteropen}
                    // />
                    
                    <FilterTask
                    searchVal={searchValEmployeeFilter}
                    setSearchValEmployeeFilter={setSearchValEmployeeFilter}
                    requestSearch={requestSearchEmployeeFilter}
                    value={value}
                    setValue={handleChangeEmployeeName}
                    handleClose={handleFilter}
                    handleSubmit={handleSubmit}
                    clearButton={clearButton}
                    open={filteropen}
                    close={setFilteropen}
                    page={page}
                    pageSize={pageSize}
                    formValue={formValue}
                    setFormValue={setFormValue}
                    userSelectError={userSelectError}
                    setUserSelectError={setUserSelectError}
                     iconPosition="relative"
                    />
                    
                  }
                  //searchVal={}
                  type='filter'
                  //isApiFinished={this.state.isApiFinished}
                  onPageChange={(page) => handlePageChange(page)}
                  onPageSizeChange={(size) => handlePageSizeChange(size)}
                  rowCount={tasklogsReportCount}
                />
              </React.Fragment>
            )}
          </CreateNewButtonContext.Consumer>
    </>
  );
  };
  function timeToMinutes(timeString) {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 60 + minutes + seconds / 60;
}
  function IsInvalidTimeFormat(timespanStr, maltiSpacesSeparation = false) {
    if(!timespanStr) return false;
   if (maltiSpacesSeparation) {
     timespanStr = timespanStr.toLowerCase().split(" ");
   }
   else {
     timespanStr = timespanStr.toLowerCase().split(/ +/);
   }
   let status  = []
   timespanStr.forEach((item) => {
     if (!/^\d{1,2}[dhwm]$/.test(item)) {
       status.push(false);
     }
     else{
       status.push(true);
     }
   });
   
   return status?.filter(x => !x)?.length > 0
  }
  function convertToMinutes(val) {

  
    let totalMinutes = 0;
    if(!IsInvalidTimeFormat(val)){
      const parts = val.split(/\s+/);
  
      for (const part of parts) {
        const value = parseInt(part, 10);
        const unit = part.slice(-1).toLowerCase();
    
        switch (unit) {
          case 'w':
            totalMinutes += value * 7 * 24 * 60;
            break;
          case 'd':
            totalMinutes += value * 24 * 60;
            break;
          case 'h':
            totalMinutes += value * 60;
            break;
          case 'm':
            totalMinutes += value;
            break;
          default:
            // Handle invalid units (optional)
            
        }
      }
    }
  
    return parseInt(totalMinutes);
  }

export default TaskLogsPage;
