import React, { useContext, useEffect, useRef, useState } from 'react';
import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import {Card, Grid, IconButton, InputAdornment, TextField, Typography} from '@mui/material';
import { getLeaveApprovalAction, listAllLeaveRequestAction } from 'redux/actions/leaveRequest_actions';
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



function LeaveAndPermissionCardForDepartmentHead(props) {

  const dispatch = useDispatch();
  const [isApiFinished, setIsApiFinished] = useState(false)
  const [open, setOpen] = useState(true)
  const [pollTimer, setPollTimer] = useState(null)


const { leaveRequestReducer: {  getLeaveApproval } } = useSelector((state) => state)


const {
    setModalTypeHandler,
    headerLocationId,
    setLoaderStatusHandler,
  } = useContext(context);



useEffect(() => {
  if (props.inView && props.isEnabled) {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getLeaveApprovalAction())
    )
  }
}, [props.inView , props.isEnabled]);


useEffect(() => {
  if (props.inViewport === true) {
    setTimeout(() => {
      const timer = setInterval(() => pollData(), props.DASHBOARD_API_POLL_TIMING);
      if (props.inViewport === false) {
        clearTimeout(timer);
      }
      dispatch(setDashboardPollingTimerIdsAction(timer));
      setPollTimer(timer );
    }, props.DASHBOARD_API_POLL_TIMING);

  } else {
    clearTimeout(pollTimer);
  }

  return () => clearTimeout(pollTimer);
  
}, [props.inViewport]);

  const pollData = () => {
  
  props.pollServer(
    dispatch(
        getLeaveApprovalAction()
    ),
  );
  }
  


const commonCellStyle = {
  fontFamily: "poppins",
  fontSize: "11px",
  fontWeight: "400",
  color: 'rgba(0, 0, 0, 0.7)',
};

return (
    <Card 
    ref={(el) => {
      props.ref1(el)
      props.isVisibleRef.current = el  
    }}
    sx={{width: '100%',height:'100%' , overflow:'auto'}}>
    <MaterialTable
      style={{ height: '100%' }}
      totalCount={getLeaveApproval}
      page={props.page}
      onPageChange={(page) => props.handlePageChange(page)}
      onRowsPerPageChange={(size) => props.handlePageSizeChange(size)}
      options={{
        showEmptyDataSourceMessage:  isApiFinished,
      headerStyle,
        cellStyle,
        maxBodyHeight: 'none',
        paging: props.purpose === 'employee' ? true : false,
      exportButton: true,
        search: false,
        exportMenu:  [
        {
          label: 'Export PDF',
          exportFunc: (cols, datas) =>
            ExportPdf(cols, datas, 'Leave Permission List'),
        },
        {
          label: 'Export CSV',
          exportFunc: (cols, datas) =>
            ExportCsv(cols, datas, 'Leave Permission List'),
        },
      ],
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
          field: 'approver_name',
          cellStyle: commonCellStyle,
          render: (rowData) => {
            if (rowData.status === 'Rejected') {
              return rowData.cancelledBy 
            } else {
              return rowData.approver_name;
            }
          }
        },
 
        {
          title: 'Date', 
          field: 'fromDate1',
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
                title: 'Type',
                field: 'request_type',
                cellStyle: { textTransform: "capitalize", ...commonCellStyle },
                render: (rowData) => {
                  if (rowData.request_type === 2) {
                    return 'Permission';
                  } else if (rowData.request_type === 4) {
                    return 'Half Day';
                  } else {
                    return 'Leave';
                  }
                }
              }
              
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
          data={getLeaveApproval}
          title={
            <Typography
            className='dashboard-card-title'
              variant="h6"
              align="left"
              style={{ paddingTop: '10px', paddingBottom: '10px' }}
            >
              Leave and Permission
            </Typography>
          }
        />
          {
              props.mode === 'edit' ?
                <IconButton
                  aria-label='view code'
                  onClick={() => props.setCardClose()}
                  size='large'
                >
                  {props.isEnabled ? <props.VisibilityOffIcon /> : <props.VisibilityIcon />}
                </IconButton>
                :
                ''
            }
     </Card>
);
}

export default useCommonRef(LeaveAndPermissionCardForDepartmentHead);
