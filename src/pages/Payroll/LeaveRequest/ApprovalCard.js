import React, { useState, useEffect, useRef, useContext } from 'react';
import _ from 'lodash';
import context from '../../context/CreateNewButtonContext';
import { Button, TextField, Typography, Grid, Box, Stack, Paper, TableCell, TableRow, TableBody, Table, TableContainer, TableHead } from '@mui/material';
import { getTrimmedData } from '../../../components/trimFunction/index';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import FormGroup from '@mui/material/FormGroup';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { grey } from '@mui/material/colors';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import Avatar from '@mui/material/Avatar';
import DoneIcon from '@mui/icons-material/Done';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import CancelIcon from '@mui/icons-material/Cancel';
import ImageIcon from '@mui/icons-material/Image';
import { getMonthName, getDateFormat } from '../../utils/getTimeFormat';
import Cookies from 'universal-cookie';
import employeeIcon from '../../assets/dashboardIcons/officer.svg';
import ErrorIcon from '@mui/icons-material/Error';
import personIcon from '../../assets/dashboardIcons/total-clients.svg';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import { getsessionStorage } from 'pages/common/login/cookies';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ReasonDialog from './reasonDialog';
import CorrectionDialog from './CorrectionDialog';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import { roleType } from 'utils/roleType';
import CommonDialog from 'components/commonDialog';
import moment from 'moment/moment';
import { DeleteOutlined } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { deleterequestAction, listAllLeaveRequestAction } from 'redux/actions/leaveRequest_actions';
import { useCustomFetch } from 'utils/useCustomFetch';
import { cancelled } from 'redux-saga/effects';
import '../../../index.css'
import API_URLS from 'utils/customFetchApiUrls';


function ApprovalCard(props) {
  const customFetch = useCustomFetch()
  const textRef = useRef(null);
  const [data, setData] = useState([]);
  const [reason, setReason] = useState(false)
  const [correction, setCorrection] = useState(false)
  const [starttime, setStartTime] = useState('');
  const [endtime, setEndTime] = useState('');
  const [confirmOpen,setConfirmOpen] = useState(false)
  const [salaryConfirmed, setSalaryConfirmed] = useState()
  const [deleteOpen, setdeleteOpen] = useState(false)
  const {
    setLoaderStatusHandler,
    setModalStatusHandler,
    setselectData,
    selectData,
    setModalTypeHandler,
    commoncookie,
    headerLocationId, usertype
  } = useContext(context);
  const dispatch = useDispatch()
  const storage = getsessionStorage();
  let rolename = storage?.role_name || '';
  let emp_id = storage?.employee_id || '';
  let approvedPerson = storage?.first_name;

  let approverVerifier = props.requestConfigSearch

  useEffect(() => { (async () => {
    console.log('1');
    const fetchApprovalData = async () => {
      try {
        // console.log("2");
        let ApprovalData = [];
        if (props.leave_request.length > 0 && props.id !== '') {
          ApprovalData = props.leave_request.find((item) => item.leaveId === props.id) || [];
        } else {
          ApprovalData = props.leave_request[0] || [];
        }
        setData(ApprovalData);
        // console.log('3');
        let month = ApprovalData?.toDate?.slice(4, 6);
        if (month.startsWith('0')) {
          month = month[1];  
        }
        const body = { 
          month: month,
          year:ApprovalData?.toDate.slice(0,4),
          employee_id: ApprovalData?.employee_id
        };

        const response = await customFetch(
          API_URLS.SALARY_CONFIRMED_DETAILS,
          'POST',
          body
        );
        const customerData = response.data;
        setSalaryConfirmed(customerData)
        // console.log("customerData", customerData);
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };
    fetchApprovalData();
  })();
}, [props.leave_request, props.id]);
  
  

  useEffect(() => {
    if (data.startTime) {
      convertTo12HourFormat1(data?.corrected_startTime === null ? data.startTime : data?.corrected_startTime),
        convertTo12HourFormat2(data?.corrected_endTime === null ? data.endTime : data?.corrected_endTime);
    } else {
      setStartTime('');
      setEndTime('');
    }
  }, [data]);

  const convertTo12HourFormat1 = (twentyFourHourFormat) => {
    const [hours, minutes] = twentyFourHourFormat.split(':');
    let ampm = 'AM';

    let twelveHourFormat = parseInt(hours, 10);
    if (twelveHourFormat >= 12) {
      ampm = 'PM';
      twelveHourFormat -= 12;
    }
    if (twelveHourFormat === 0) {
      twelveHourFormat = 12;
    }

    twelveHourFormat = twelveHourFormat.toString().padStart(2, '0');

    const twelveHourTimeString = `${twelveHourFormat}:${minutes} ${ampm}`;
    setStartTime(twelveHourTimeString);
  };

  const convertTo12HourFormat2 = (twentyFourHourFormat) => {
    const [hours, minutes] = twentyFourHourFormat.split(':');
    let ampm = 'AM';

    let twelveHourFormat = parseInt(hours, 10);
    if (twelveHourFormat >= 12) {
      ampm = 'PM';
      twelveHourFormat -= 12;
    }
    if (twelveHourFormat === 0) {
      twelveHourFormat = 12;
    }

    twelveHourFormat = twelveHourFormat.toString().padStart(2, '0');

    const twelveHourTimeString = `${twelveHourFormat}:${minutes} ${ampm}`;
    setEndTime(twelveHourTimeString);
  };
  const primary = grey[300];

  const TimeTable = ({ logs }) => {
    return (
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="left"><strong>Clock-IN</strong></TableCell>
              <TableCell align="left"><strong>Clock-OUT</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log, index) => (
              <TableRow key={index}>
                <TableCell align="left">
                  {log.startDate ? moment(log.startDate).format('hh:mm A') : 'Not clocked-IN'}
                </TableCell>
                <TableCell align="left">
                  {log.endDate ? moment(log.endDate).format('hh:mm A') : 'Not clocked out'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };


  const DateWithDayMonthFormat = (date) => {
    let now = new Date(date);
    let day = now.getDate();
    let month = now.toLocaleString('default', { month: 'short' });
    return month + ' ' + day;
  };

  const DateWithDayMonthFormatAndTime = (date) => {
    let now = new Date(date);
    let day = now.getDate();
    let month = now.toLocaleString('default', { month: 'short' });
    let hour = now.getHours();
    let minute = now.getMinutes();
    let period = hour >= 12 ? 'PM' : 'AM'; // Determine whether it's AM or PM
    hour = hour % 12 || 12; // Convert to 12-hour format
    return month + ' ' + day + ', ' + hour + ':' + (minute < 10 ? '0' : '') + minute + ' ' + period;
  };

  const DateWithDayMonthYearFormat = (date) => {
    let now = new Date(date);
    let day = now.getDate();
    let month = now.toLocaleString('default', { month: 'long' });
    let year = now.getFullYear();
    // return `${month}${' '}${day},${' '}${year}`;
    return `${day}${' '}${month}${' '},${year}`;
  };

  const CapitalizeFirstLetter = (str) => {
    const capitalized = str?.charAt(0).toUpperCase() + str?.slice(1);
    return capitalized;
  };
  const handleApprove = () => {
    props.handleApprove(data);
    data?.correction_type === 1 && setCorrection(true);
    setConfirmOpen(false);
  }

  let approverFlag = false
  let verifierFlag = false
  let buttonAllowedVerifier = true
  let buttonAllowedApprover = true

  const requestTypeId = data.request_type;

  approverVerifier.forEach((i) => {
    const isSameDepartment = i.department_id === data.department_id;
    
    if (isSameDepartment && i.request_type_ids.some((req) => req.request_type_id === requestTypeId)) {
      if (i.approver.some((item) => item.employee_id === storage.employee_id)) {
        approverFlag = true;
      }
      if (i.verifier.some((item) => item.employee_id === storage.employee_id)) {
        verifierFlag = true;
      }
    }
     if(isSameDepartment && i.approver.some((item) => item.employee_id !== storage.employee_id ) ) {
      buttonAllowedApprover = false;
     }
     if( isSameDepartment && i.verifier.some((item) => item.employee_id !== storage.employee_id) ) {
      buttonAllowedVerifier = false;
     }
  });

  console.log("approverFlag",approverFlag)
  console.log("verifierFlag",verifierFlag)




  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = yyyy + '-' + mm + '-' + dd;

  const handleSubmit = () => {
    const leaveData = {
      fromdate: null,
      todate: null,
      type: null,
      employee_id: storage.role_name === 'Employee' ? storage.employee_id : null,
    };

    dispatch(deleterequestAction(data));
    dispatch(listAllLeaveRequestAction(leaveData, commoncookie, setModalTypeHandler, setLoaderStatusHandler));
    props.handleDelete();
    setdeleteOpen(false)
  };
  const currentDate = new Date();
  const shouldRenderDelete = data?.toDate && new Date(data.toDate) >= currentDate;
  const logs = data?.employeeLogBaseShift || [];
  console.log("leave_reqq",props.leave_request);
  
  return (
    <>
      {props.leave_request.length > 0 ? (
        <Grid container display='flex' spacing={3} direction='row'>
          <Grid
            size={{
              lg: 1,
              md: 1,
              sm: 1.5,
              xs: 2
            }}>
            <Avatar>
              <img src={personIcon} height={60} width={40} />
            </Avatar>
          </Grid>
          <Grid
            size={{
              lg: 11,
              md: 11,
              sm: 10.5,
              xs: 10
            }}>
            <Card
              sx={{
                maxWidth: 600,
                width: {
                  lg: 600,
                  md: 600,
                  sm: 400,
                  xs: 230,
                },
                // ,marginBottom:{
                //   lg: 100,
                //   md: 100,
                //   sm: 100,
                //   xs: 150
                // }
              }}
              style={{
                border: 'none',
                boxShadow: 'none',
                direction: 'row',
                backgroundColor: '#ECF6FC',
              }}
            >
              <CardContent>
                <Grid container >
                  <Grid
                    size={{
                      lg: 8,
                      md: 8,
                      sm: 8,
                      xs: 8
                    }}>
                    <Typography
                      gutterBottom
                      variant='h5'
                      component='div'
                      style={{ fontWeight: 'bold' }}
                    >
                      {`${CapitalizeFirstLetter(
                        data?.first_name +
                        (data?.last_name ? ' ' + data.last_name : ''),
                      )}`}
                    </Typography>
                  </Grid>
                  {rolename === "Administrator" && salaryConfirmed?.length === 0 && <Grid
                    style={{ display: 'flex', justifyContent: 'flex-end' }}
                    size={{
                      lg: 4,
                      md: 4,
                      sm: 4,
                      xs: 4
                    }}>
                    <DeleteOutlined
                      onClick={()=>setdeleteOpen(true)}
                      style={{ cursor: 'pointer' }}
                    />

                  </Grid>}
                </Grid>
                <Typography
                  style={{
                    backgroundColor: '#FFF',
                    // borderRight: '5px #d9dadc solid',
                    height: '90%',
                    padding: '6px',
                  }}
                >
                  <span>
                    {data.permission_type
                      ? data.permission_type
                      : data.leave_type
                        ? data.leave_type
                        : data.half_day
                          ? data.half_day
                          : 'Attendance Correction'}
                  </span>{' '}
                  <br />
                  <Typography variant='body2' color='text.secondary'>
                    {DateWithDayMonthYearFormat(data?.fromDate) +
                      (data.request_type == 1
                        ? ' - ' + DateWithDayMonthYearFormat(data?.toDate)
                        : '')}
                  </Typography>
                  <br></br>
                  <Typography variant='body2' color='text.secondary'>
                    {data?.request_type === 3 && data?.reason === 'Attendance Correction' ?
                       (
                        logs.length > 0 ? (
                          <TimeTable logs={logs} />
                        ) : (
                          <Typography variant='body2' color='text.secondary'>Not clocked-IN</Typography>
                        )
                      ) : null}
                  </Typography>

                  <Typography variant='body2' color='text.secondary'>
                    {data?.request_type === 1 &&
                      data?.reason !== 'Attendance Correction'
                      ? 'Requested Time off  :' + ' ' + 'All day'
                      : data?.request_type === 3 &&
                        data?.reason === 'Attendance Correction'
                        ? data?.shift_name === null ? `Requested Time off in :  ${starttime} - ${endtime}` : `Requested Time off in ${data?.shift_name}  :  ${starttime} - ${endtime}` 
                        : data?.request_type === 4
                          ? 'Requested Time off  :' + ' ' + 'Half Day'
                          : data?.request_type === 2
                            ? 'Requested Time off  :' + ' ' + starttime + ' - ' + endtime
                            : ''}
                  </Typography>
                  <br/>
                  <Typography variant='bold'>{data?.request_type === 3 ? 'Note' : 'Reason'}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {data?.request_type === 3 ? (data?.note !== null ? data?.note : '') : data?.reason !== null ? data?.reason : ''}
                  </Typography>
                </Typography>
                <br />
                <Typography sx={{fontSize: '13px'}}>
                  Requested at {DateWithDayMonthFormatAndTime(data?.createdAt)}
                </Typography>

                <Typography sx={{fontSize: '13px'}}>
                  {data.status === 'Approved' ? `Verified by ${data.verifier_name}` : data.status==='cancelled' ? `Cancelled by ${data.cancelledBy}` : ""}
                      <br/>
                  {data.status === 'Approved' ? `Approved by ${data.approver_name}` : data.status==='cancelled' ? `Cancelled by ${data.cancelledBy}` : ""}
                </Typography>
                <br />
                
              </CardContent>
              <Divider />
              {data?.status === 'Pending' && !roleType.includes(rolename) ? (
                <Grid
                  container
                  spacing={2}
                  style={{ padding: '15px 15px 15px 15px' }}
                >
                  <Grid
                    display='flex'
                    justifyContent='flex-end'
                    size={{
                      lg: 6,
                      md: 6,
                      sm: 6,
                      xs: 6
                    }}>
                    <Button
                      variant='outlined'
                      onClick={() => props.handleCancel(data?.leaveId)}
                    >
                      Cancel
                    </Button>
                  </Grid>
                  <Grid
                    display='flex'
                    justifyContent='flex-start'
                    size={{
                      lg: 6,
                      md: 6,
                      sm: 6,
                      xs: 6
                    }}>
                    <Button
                      sx={{
                        boxShadow: 'none',
                        '&:hover': {
                          backgroundColor: '#0A8FDC',
                          color: 'white',
                          cursor: 'default',
                          boxShadow: 'none',
                        },
                      }}
                      disableRipple
                      variant='contained'
                    >
                      Pending
                    </Button>
                  </Grid>
                </Grid>
              ) : data?.status === 'Approved'  && !roleType.includes(rolename) ? (
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <img src={employeeIcon} height={60} width={40} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <p style={{fontWeight: 'bold'}}>
                        {' '}
                        {data?.approvedBy}{' '}
                        {DateWithDayMonthFormat(data?.createdAt)}
                      </p>
                    }
                    secondary={
                      <Stack direction='row' alignItems='center' gap={1}>
                        <ThumbUpOffAltIcon
                          fontSize='medium'
                          style={{color: 'green'}}
                        />
                        Approved
                      </Stack>
                    }
                  />
                </ListItem>
              ) :   ( data?.status === 'Rejected' ||  data?.status === 'cancelled' ) &&  (
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <img src={employeeIcon} height={60} width={40} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <p style={{fontWeight: 'bold', fontSize: '13px'}}>
                        {' '}
                        {data?.cancelledBy}{' '}
                        {DateWithDayMonthFormat(data?.createdAt)}
                      </p>
                    }
                    secondary={
                      <Typography fontSize={18}>
                        <Stack direction='row' alignItems='center' gap={1}>
                          <ThumbDownOffAltIcon
                            fontSize='medium'
                            style={{color: 'red'}}
                          />
                          {data?.status}
                        </Stack>
                        <br />
                        <Typography sx={{fontSize: '13px'}}> Reason for Rejection:</Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {data?.reason_for_rejection}
                        </Typography>
                      </Typography>
                    }
                  />
                </ListItem>
              )}



              {(approverVerifier?.length === 0 && rolename === 'Administrator' )  || ( approverFlag === false && verifierFlag === false && rolename === 'Administrator' && buttonAllowedVerifier === true && buttonAllowedApprover === true) ||
              ( approverFlag === true && verifierFlag === true  && rolename === 'Administrator'  ) ||  ( approverFlag === true && verifierFlag === true  && rolename === 'Manager'  )
              ?
                (
                   data.status !="Rejected" && data.status!='cancelled' &&
                  <Grid container spacing={2} style={{ padding: '15px' }}>
                    <Grid
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        color: 'gray',
                      }}
                      size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                      }}>
                      <Stack direction='row' alignItems='center' gap={1}>
                      {
                        data.approverId && data.verifierId ?  <DoneIcon fontSize='small' style={{ color: 'green' }} /> : <QueryBuilderIcon fontSize='small' style={{}} />

                      }
                      <Typography sx={{fontSize: '13px'}}>
                        {
                          data?.approverId === null && data?.verifierId === null ? 'Waiting for the Approval' :
                          data?.approverId  && data?.verifierId === null ? ' Approved And Waiting for the verifier' : 'Approved And Verified'
                        }
                      </Typography>
                      </Stack>
                    </Grid>
                 
                    {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
                      item
                      style={{ display: 'flex', justifyContent: 'center' }}
                    >
                      {`${CapitalizeFirstLetter(
                        data?.first_name,
                      )} is scheduled general on ${DateWithDayMonthFormat(
                        data?.fromDate,
                      )}`}
                    </Grid> */}

                    {
                      !data?.approverId && !data?.verifierId &&
                      <>
                        <Grid
                          display='flex'
                          justifyContent='flex-end'
                          size={{
                            lg: 6,
                            md: 6,
                            sm: 6,
                            xs: 6
                          }}>
                          <Button
                            variant='contained'
                            color ='error'
                            style={{  minWidth: '92px' }}
                            onClick={() =>
                              roleType.includes(storage?.role_name)
                                ? setReason(true)
                                : props.handleCancel(data)
                            }
                          >
                            deny
                          </Button>
                        </Grid>
                        <Grid
                          display='flex'
                          justifyContent='flex-start'
                          size={{
                            lg: 6,
                            md: 6,
                            sm: 6,
                            xs: 6
                          }}>
                          <Button
                            variant='contained'
                            color ='success'
                            style={{  minWidth: '92px' }}
                            onClick={() => {
                              setConfirmOpen(true,)
                              setData({ ...data, isApproverOrVerifier: 'approveAndVerify' })
                            }}
                          >
                            Approve & Verify
                          </Button>
                        </Grid>
                      </>
                    }

                  </Grid>
                )
                : (

                  roleType.includes(rolename)  && data.status !="Rejected" && data.status!='cancelled' &&
                  <Grid container spacing={2} style={{ padding: '15px' }}>
                    <Grid
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        color: 'gray',
                      }}
                      size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                      }}>
                      <Stack direction='row' alignItems='center' gap={1}>
                      {
                        data.approverId && data.verifierId ?  <DoneIcon fontSize='small' style={{ color: 'green' }} /> : <QueryBuilderIcon style={{}} />

                      }

                     {
                        data?.approverId === null && data?.verifierId === null ? 'Waiting for the Approval' :
                        data?.approverId  && data?.verifierId === null ? ' Approved And Waiting for the verifier' : 'Approved And Verified'

                      }
                      </Stack>
                    </Grid>
                 
                    {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
                      item
                      style={{ display: 'flex', justifyContent: 'center' }}
                    >
                          <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <img src={employeeIcon} height={60} width={40} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <p style={{fontWeight: 'bold'}}>
                        {' '}
                        {data?.approvedBy}{' '}
                        {DateWithDayMonthFormat(data?.createdAt)}
                      </p>
                    }
                    secondary={
                      <Stack direction='row' alignItems='center' gap={1}>
                        <ThumbUpOffAltIcon
                          fontSize='medium'
                          style={{color: 'green'}}
                        />
                        Approved
                      </Stack>
                    }
                  />
                </ListItem>
                    </Grid> */}



                    {
                      approverFlag === true && !data?.approverId &&
                      <>

                        <Grid
                          display='flex'
                          justifyContent='flex-end'
                          size={{
                            lg: 6,
                            md: 6,
                            sm: 6,
                            xs: 6
                          }}>
                          <Button
                            variant='contained'
                            color='error'
                            style={{  minWidth: '92px' }}
                            onClick={() =>
                              roleType.includes(storage?.role_name)
                                ? setReason(true)
                                : props.handleCancel(data)
                            }
                          >
                            deny
                          </Button>
                        </Grid>
                        <Grid
                          display='flex'
                          justifyContent='flex-start'
                          size={{
                            lg: 6,
                            md: 6,
                            sm: 6,
                            xs: 6
                          }}>
                          <Button
                            variant='contained'
                            color ='success'
                            style={{  minWidth: '92px' }}
                            onClick={() => {
                              setConfirmOpen(true,)
                              setData({ ...data, isApproverOrVerifier: 'approve' })
                            }}
                          >
                            Approve
                          </Button>
                        </Grid>
                      </>



                    }

                    {
                      verifierFlag === true &&
                      !data?.verifierId &&
                      <>

                        <Grid
                          display='flex'
                          justifyContent='flex-end'
                          size={{
                            lg: 6,
                            md: 6,
                            sm: 6,
                            xs: 6
                          }}>
                          <Button
                            variant='contained'
                               color='error'
                            style={{  minWidth: '92px' }}
                            onClick={() =>
                              roleType.includes(storage?.role_name)
                                ? setReason(true)
                                : props.handleCancel(data)
                            }

                          >
                            deny
                          </Button>
                        </Grid>
                        <Grid
                          display='flex'
                          justifyContent='flex-start'
                          size={{
                            lg: 6,
                            md: 6,
                            sm: 6,
                            xs: 6
                          }}>
                          <Button
                            variant='contained'
                            color='success'
                            // style={{ backgroundColor: '#00ab41' }}
                            onClick={() => {
                              setConfirmOpen(true,)
                              setData({ ...data, isApproverOrVerifier: 'verify' })
                            }}
                            disabled={data.approverId === null}
                          >
                            Verify
                          </Button>
                        </Grid>
                      </>
                    }

                  </Grid>


                )}

              {reason && (
                <ReasonDialog
                  open={reason}
                  handleClose={setReason}
                  data={data}
                />
              )}
              {correction && (
                <CorrectionDialog
                  open={correction}
                  handleClose={setCorrection}
                  data={data}

                  handleCorrect={props.handleCorrect}
                />
              )}
              {confirmOpen && (
                <CommonDialog
                  cancel_buttonName={'Cancel'}
                  ok_buttonName={'Ok'}
                  dialogTitle={'Confirmation'}
                  dialogContent={`Are you sure to Approve`}
                  cancel_fun={() => {
                    setConfirmOpen(false)
                  }}
                  ok_fun={handleApprove}
                  open={confirmOpen}
                  type={'request'}
                />
              )}
              {deleteOpen && (
                <CommonDialog
                cancel_buttonName = {'Cancel'}
                ok_buttonName = {'Ok'}
                dialogTitle = {'Confirmation'}
                dialogContent = {`Are you sure to Delete`}
                cancel_fun = {() => {
                  setdeleteOpen(false)
                }}
                ok_fun = {handleSubmit}
                open={deleteOpen}
                type={'request'}
              />
              )}
            </Card>
          </Grid>
        </Grid>
      ) : (
        []
      )}
    </>
  );
}

export default ApprovalCard;
