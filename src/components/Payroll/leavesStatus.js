import React, { useContext, useEffect, useRef, useState } from 'react';
import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import {Card, Grid, InputAdornment, TextField, Typography} from '@mui/material';
import { listAllLeaveRequestAction } from 'redux/actions/leaveRequest_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import context  from '../../context/CreateNewButtonContext'
import { useDispatch, useSelector } from 'react-redux';
import { commonDateFormat } from 'utils/getTimeFormat';
// import context from '../context/CreateNewButtonContext';

import {
  maxBodyHeight,
  maxHeight,
  pageSize,
  headerStyle,
  cellStyle,
} from 'utils/pageSize';
import useCommonRef from 'pages/common/home/useCommonRef';
import apiCalls from 'utils/apiCalls';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import { ExportCsv, ExportPdf } from '@material-table/exporters';



function LeavesStatus(props) {

  const dispatch = useDispatch();
  const [isApiFinished, setIsApiFinished] = useState(false)
  const [open, setOpen] = useState(true)
  const [pollTimer, setPollTimer] = useState(null)
  const [filteredData, setFilteredData] = useState([]);
// const leave_request = props.data?.data?.length > 0 ? props?.data : [];
const { leaveRequestReducer: { employeeLeaveRequest, employeeLeaveRequestCount, leave_request } } = useSelector((state) => state)
const storage = getsessionStorage()
let emp_id = storage?.employee_id || '';
const {
    setModalTypeHandler,
    headerLocationId,
    setLoaderStatusHandler,
  } = useContext(context);


useEffect(() => {
  if(props.mode === 'edit'){
      setOpen(false)
  }
  else{
      setOpen(true)
  }
},[props.mode])

  useEffect(() => {
    if(props.purpose !== 'employee'){
      if (props.type !== 'DASHBOARD') {
        // if (props.inView && props.isEnabled) {
          const leaveData = {
            date: null,
            type: null,
            employee_id: null,
          }
          apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(listAllLeaveRequestAction(leaveData,emp_id,setModalTypeHandler,setLoaderStatusHandler))
          ).finally(() => setIsApiFinished(true));
        // }
      }
    }
    

  }, [props.inView , props.isEnabled]);

// useEffect(() => {
//   if (props.inViewport === true) {
//     setTimeout(() => {
//       const timer = setInterval(() => pollData(), props.DASHBOARD_API_POLL_TIMING);
//       if (props.inViewport === false) {
//         clearTimeout(timer);
//       }
//       dispatch(setDashboardPollingTimerIdsAction(timer));
//       setPollTimer(timer );
//     }, props.DASHBOARD_API_POLL_TIMING);

//   } else {
//     clearTimeout(pollTimer);
//   }

//   return () => clearTimeout(pollTimer);
  
// }, [props.inViewport]);

//   const pollData = () => {
//     const leaveData = {
//       date: "today",
//       type: null,
//       employee_id :null
//     }
//   props.pollServer(
//     dispatch(
//       listAllLeaveRequestAction(leaveData,emp_id,setModalTypeHandler,setLoaderStatusHandler)
//     ),
//   );
//   }
  
  // console.log('employeeLeaveRequest', employeeLeaveRequest, employeeLeaveRequestCount);
// console.log(leave_request,"leave_request");

useEffect(() => {
  const todayData = props.purpose === 'employee' ? employeeLeaveRequest : leave_request?.data;

  //if(!todayData.length) return setFilteredData([]);
  console.log(todayData,'here');
  if (props.purpose === 'employee') {
    return setFilteredData(todayData)
  } 

  const filteredTodayData = todayData?.filter((item) => {
    // const today = new Date('Thu Mar 07 2025 12:08:12 GMT+0530 (India Standard Time)');
    const today = new Date();
    console.log(today,props.purpose,item,"today");
    
    const fromDate = new Date(item.fromDate);

      return (
      fromDate.getFullYear() === today.getFullYear() &&
      fromDate.getMonth() === today.getMonth() &&
      fromDate.getDate() === today.getDate()
    );
  });

  console.log('filteredTodayData', leave_request);
  
  let arr = filteredTodayData?.filter(d => d.reason !== 'Attendance Correction')
  setFilteredData(arr);

}, [employeeLeaveRequest, leave_request, props.purpose]);

const commonCellStyle = {
  fontFamily: "poppins",
  fontSize: "11px",
  fontWeight: "400",
  color: 'rgba(0, 0, 0, 0.7)',
};
console.log(filteredData,'filteredData')
return (
    <Card 
    ref={(el) => {
      props.ref1(el)
      props.isVisibleRef.current = el  
    }}
    sx={{width: '100%',height:'100%' , overflow:'auto'}}>
    <MaterialTable
      style={{ height: '100%' }}
      totalCount={employeeLeaveRequestCount}
      page={props.page}
      onPageChange={(page) => props.handlePageChange(page)}
      onRowsPerPageChange={(size) => props.handlePageSizeChange(size)}
      options={{
        showEmptyDataSourceMessage: props.purpose === 'employee' ? props.leaveStatusApiFinished : isApiFinished,
      headerStyle,
        cellStyle,
        maxBodyHeight: 'none',
        paging: props.purpose === 'employee' ? true : false,
      exportButton: false,
        search: false,
      //   exportMenu: props.purpose === 'employee' ? [
      //     {
      //       label: 'Export PDF',
      //       exportFunc: (cols, datas) =>
      //         ExportPdf(cols, datas, 'Leave Permission List'),
      //     },
      //     {
      //       label: 'Export CSV',
      //       exportFunc: (cols, datas) =>
      //         ExportCsv(cols, datas, 'Leave Permission List'),
      //     },
      // ] : [
      //   {
      //     label: 'Export PDF',
      //     exportFunc: (cols, datas) =>
      //       ExportPdf(cols, datas, 'Leave Permission List'),
      //   },
      //   {
      //     label: 'Export CSV',
      //     exportFunc: (cols, datas) =>
      //       ExportCsv(cols, datas, 'Leave Permission List'),
      //   },
      // ],
      }}
          columns={[
            { 
            title: 'Name', field: 'full_name', 
            cellStyle: {textTransform:"capitalize", commonCellStyle},  
              render: rowData => 
              // rowData.first_name ? rowData.first_name + (rowData.last_name && rowData.last_name.length > 0 ? ' ' + rowData.last_name : '') : '-',
              rowData.full_name ? rowData.full_name : '-',
              hidden: props.purpose === 'employee'
            },
        {
          title: 'Approved By',
          field: 'approvedBy',
          cellStyle: commonCellStyle,
          render: (rowData) => {
            if (rowData.status === 'Rejected') {
              return rowData.cancelledBy 
            } else {
              return rowData.approvedBy;
            }
          }
        },
 
        {
          title: 'Date', 
          field: 'fromDate',
          cellStyle: commonCellStyle,
          render: (rowData) => (
            commonDateFormat(rowData.fromDate)
          )
          
        },
            {
              title: 'Reason', field: 'reason',
              cellStyle: { textTransform: "capitalize" , commonCellStyle }
            },
            {
              title: 'Status', field: 'status',
              cellStyle: { textTransform: "capitalize", commonCellStyle }
            },
            {
              title: 'Type', field: 'request_type',
              cellStyle: { textTransform: "capitalize" , commonCellStyle },
              render: (rowData) => (rowData.request_type === 2 ? 'Permission' : 'Leave')
            },
          ]}
          actions={[
            {                                            
              icon: () => props.isEnabled ?  <props.VisibilityOffIcon /> : <props.VisibilityIcon />,
                // tooltip: 'Close',
                isFreeAction: true,
                hidden : open,
                // onClick: (event) => alert("You want to add a new row")
                onClick : () => props.setCardClose()
            }
          ]}
          data={filteredData}
          title={
            <Typography
              className='dashboard-card-title'
              variant="h6"
              align="left"
              style={{ 
                padding : '5px', 
                paddingBottom : props.mode === 'edit' ? '23px' : '20px' 
              }}
            >
              Leave and Permission
            </Typography>
          }
        />
     </Card>
);
}

export default useCommonRef(LeavesStatus);
