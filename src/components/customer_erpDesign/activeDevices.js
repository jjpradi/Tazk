import React, {useContext, useEffect, useRef, useState} from 'react';
import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import { Card, Grid, InputAdornment, TextField, Typography } from '@mui/material';
import {Helmet} from 'react-helmet-async';
import {listAllLeaveRequestAction, listEmployeeLeaveHistoryAction} from 'redux/actions/leaveRequest_actions';
import {getsessionStorage} from 'pages/common/login/cookies';
import context from '../../context/CreateNewButtonContext';
import {useDispatch, useSelector} from 'react-redux';
import {commonDateFormat} from 'utils/getTimeFormat';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
// import context from '../context/CreateNewButtonContext';
import Button from '@mui/material/Button';

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
import ResetDialog from 'pages/sales/vendorPriceList/ResetDialog';

function activeDevices(props) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(true);
  const [pollTimer, setPollTimer] = useState(null);
  
  const [reset, setReset] = useState(false)
  const [reset_id, setReset_id] = useState()
  const [resetconfirm, setResetConfirm] = useState(false)
  // const {ref, inView, entry} = useInView({
  //   threshold: 0,
  //   triggerOnce: true,
  // });

  const {
    PayrolldashboardReducers: {activedeviceslist },
  } = useSelector((state) => state);
  console.log('activedeviceslist', activedeviceslist)
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

  const resetDialog = (id) => {
    // console.log(id,rowData, 'SSSSSSD')
    // this.setState({ reset: true, id: id });
    setReset(true);
    setReset_id(id)
  }
 

 const resetClose = () => {
  //  this.setState({open: false, dialog: false, reset: false});
    setReset(false)
  };
  return (
    <>
     <ResetDialog
                reset={reset}
                handleClose={resetClose}
                id={reset_id}
                setResetConfirm ={setResetConfirm}
              />
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
        // actions={[
        //     (rowData) => ({
        //         icon: () => (
        //             <Button variant='outlined'>
        //             Process Reconciliation
        //           </Button>
        //         ),
        //         tooltip: 'Reset Device Id',
        //         disabled: rowData.device_id === null,
        //         onClick: (event, rowData) =>
        //           rowData.device_id !== null &&
        //           resetDialog(rowData.employee_id, rowData)
        //       }),
        // ]}
        columns={[
          {title: 'Device Id', field: 'device_id'},
          {
            title: 'Last Active Date',
            field: 'last_active_date',
            // render: (rowData) => commonDateFormat(rowData.fromDate),
            render: (rowData) => rowData.last_active_date !== null ? new Date(rowData.last_active_date).toLocaleDateString('en-GB') : '',
          },
          {title: 'Last Login Date', field: 'last_login_date', render: (rowData) =>rowData.last_login_date !== null ? new Date(rowData.last_login_date).toLocaleDateString('en-GB') : ''},
            {
                title: 'Deregister', render: (rowData) => {
                    return <Button variant='outlined' color="error" onClick={
                        () => {
                        resetDialog(rowData.employee_id, rowData)
                    }} disabled={rowData.device_id === null && true}>
                        Deregister
                    </Button>
                }
            }
          
        ]}
       
        data={ resetconfirm === true ? [] :activedeviceslist[0]?.device_id === null ? [] :activedeviceslist }
        title='Active Devices'
      />
    </Card>
    </>
  );
}

export default useCommonRef(activeDevices);

