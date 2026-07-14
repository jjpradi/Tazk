import React, {useContext, useEffect, useRef, useState} from 'react';
import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import { Card, Grid, InputAdornment, TextField, Typography } from '@mui/material';
import {Helmet} from 'react-helmet-async';
import {listAllLeaveRequestAction, listEmployeeLeaveHistoryAction} from 'redux/actions/leaveRequest_actions';
import {getsessionStorage} from 'pages/common/login/cookies';
import context from '../../context/CreateNewButtonContext';
import {useDispatch, useSelector} from 'react-redux';
import {commonDateFormat} from 'utils/getTimeFormat';
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
import {setDashboardPollingTimerIdsAction} from 'redux/actions/dashboard_role_actions';
import { useInView } from 'react-intersection-observer';
import { titleURL } from 'http-common';

function RecentLeaves(props) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(true);
  const [pollTimer, setPollTimer] = useState(null);

  // const {ref, inView, entry} = useInView({
  //   threshold: 0,
  //   triggerOnce: true,
  // });

  const {
    leaveRequestReducer: {employeeLeaveHistory},
  } = useSelector((state) => state);
  const storage = getsessionStorage();
  let emp_id = storage?.employee_id || '';
  const {setModalTypeHandler, headerLocationId, setLoaderStatusHandler} =
    useContext(context);

  // useEffect(() => {
  //   // if (props.inView){
  //     apiCalls(
  //       setModalTypeHandler,
  //       setLoaderStatusHandler,
  //       dispatch(
  //         listEmployeeLeaveHistoryAction(
  //           props.personId,
  //           setModalTypeHandler,
  //           setLoaderStatusHandler,
  //         ),
  //       ),
  //     ).finally(() => setIsApiFinished(true));
  //   // }
  // }, []);


  return (
    
    <Card
      ref={(el) => {
      props.ref1(el)}}
      sx={{width: '100%', height: '100%', overflow: 'auto'}}
    >
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | User Role</title>
      </Helmet>
      <MaterialTable
        style={{height: '100%'}}
        options={{
          showEmptyDataSourceMessage: props.isApiFinished,
          headerStyle,
          cellStyle,
          maxBodyHeight: '430px',

          paging: false,
          exportButton: true,
          search: false,
        }}
        columns={[
          {title: 'Leave Type', field: 'leaveType'},
          {
            title: 'Start Date',
            field: 'startDate',
            // render: (rowData) => commonDateFormat(rowData.fromDate),
            render: (rowData) => new Date(rowData.startDate).toLocaleDateString('en-GB'),
          },
          {title: 'End Date', field: 'endDate', render: (rowData) => new Date(rowData.endDate).toLocaleDateString('en-GB'),},
          {title: 'Days', field: 'days'},
          {
            title: 'Approval',
            field: 'approval',
          },
        ]}
        // actions={[
        //   {
        //     icon: () => props.isEnabled ?  <props.VisibilityOffIcon /> : <props.VisibilityIcon />,
        //       // tooltip: 'Close',
        //       isFreeAction: true,
        //       hidden : open,
        //       // onClick: (event) => alert("You want to add a new row")
        //       onClick : () => props.setCardClose()
        //   }
        // ]}
        data={employeeLeaveHistory}
        title='Recent Leaves'
      />
    </Card>
  );
}

export default useCommonRef(RecentLeaves);

