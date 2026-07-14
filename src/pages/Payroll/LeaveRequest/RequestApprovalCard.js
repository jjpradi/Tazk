import React, { useState, useEffect, useRef, useContext } from 'react';
import _ from 'lodash';
import context from '../../../context/CreateNewButtonContext';
import { Button, TextField, Typography, Grid, Box, Stack, Paper, TableCell, TableRow, TableBody, Table, TableContainer, TableHead, Chip, Avatar } from '@mui/material';
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
import DoneIcon from '@mui/icons-material/Done';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ImageIcon from '@mui/icons-material/Image';
import { getMonthName, getDateFormat } from '../../../utils/getTimeFormat';
import Cookies from 'universal-cookie';
import employeeIcon from '../../../assets/dashboardIcons/officer.svg';
import ErrorIcon from '@mui/icons-material/Error';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import { getsessionStorage } from 'pages/common/login/cookies';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ReasonDialog from './reasonDialog';
import CorrectionDialog from './CorrectionDialog';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import { roleType, roleTypeWithOutEmployee } from 'utils/roleType';
import CommonDialog from 'components/commonDialog';
import moment from 'moment/moment';
import { DeleteOutlined } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { deleterequestAction, getEmployeeAttendanceDetailsAction, getEmployeeShiftDetailsAction, listAllLeaveRequestAction } from 'redux/actions/leaveRequest_actions';
import { useCustomFetch } from 'utils/useCustomFetch';
import { cancelled } from 'redux-saga/effects';
import { setLogLevel } from 'firebase/app';
import apiCalls from 'utils/apiCalls';
import { listDepartment } from 'redux/actions/shifts.actions';
import API_URLS from 'utils/customFetchApiUrls';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { useSelector } from 'react-redux';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';

const avatarColors = ['#1976d2', '#388e3c', '#d32f2f', '#7b1fa2', '#f57c00', '#0097a7', '#5d4037', '#455a64', '#c2185b', '#00796b'];
const getAvatarColor = (name) => { if (!name) return avatarColors[0]; return avatarColors[name.charCodeAt(0) % avatarColors.length]; };
const getInitials = (f, l) => ((f ? f.charAt(0).toUpperCase() : '') + (l ? l.charAt(0).toUpperCase() : '')) || '?';
const getStatusColor = (s) => { if (!s) return '#f57c00'; const v = s.toLowerCase(); if (v === 'approved') return '#2e7d32'; if (v === 'rejected' || v === 'cancelled') return '#d32f2f'; return '#f57c00'; };
const getStatusLabel = (s) => { if (!s) return 'Pending'; const v = s.toLowerCase(); if (v === 'approved') return 'Approved'; if (v === 'rejected') return 'Rejected'; if (v === 'cancelled') return 'Cancelled'; if (v === 'waiting for approval' || v === 'pending') return 'Pending'; return s; };
const DetailLabel = ({ children }) => <Typography sx={{ fontSize: 11, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, mb: 0.3 }}>{children}</Typography>;
const DetailValue = ({ children }) => <Typography sx={{ fontWeight: 500, fontSize: 14, mb: 1.5 }}>{children}</Typography>;

function RequestApprovalCard(props) {
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
  const [approverVerifierData, setApproverVerifierData] = useState([]);
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
  let company_type = storage?.company_type || ''

  const [log,setLog] = useState([]);
  const menuAccess = useSelector((state) => state.rbacReducer.menuAccess)
  const [attendanceDetails,setAttendanceDetails] = useState([]);
  const Request_delete = UserRightsAuthorization(menuAccess[rolename], 'approvals', 'can_delete')

  useEffect(() => { (async () => {
    
    if(company_type === 5){
      let resData = props.leave_request.find((item) => item.leaveId === props.id) || [];
      const fetchApprovalData = async () => {
        try {
          // console.log("2");
          let ApprovalData = [];
          if (props.leave_request.length > 0 && props.id !== '') {
            ApprovalData = props.leave_request.find((item) => item.leaveId === props.id) || [];
          } else {
            ApprovalData = props.leave_request[0] || [];
          }
            
          setData(resData);
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
    }
    else if(company_type === 2){
      const fetchApprovalData = async () => {
        try {
          // console.log("2");
          let ApprovalData = [];
          if (props.leave_request.length > 0 && props.id !== '') {
            ApprovalData = props.leave_request.find((item) => item.id === props.id) || [];
          } else {
            ApprovalData = props.leave_request[0] || [];
          }
          setData(resData);
          // console.log('3');
          let month = ApprovalData?.toDate?.slice(4, 6);
          if (month.startsWith('0')) {
            month = month[1];  
          }
          // const body = { 
          //   month: month,
          //   year:ApprovalData?.toDate.slice(0,4),
          //   employee_id: ApprovalData?.employee_id
          // };
          setSalaryConfirmed([])
          // console.log("customerData", customerData);
        } catch (error) {
          console.error('Fetch error:', error);
        }
      };
      fetchApprovalData();
    }
    
   

  })();
}, [props.leave_request, props.id,company_type]);

  useEffect(() => {
    const fetchApproverVerifierData = async () => {
      const leaveId = props.id || data?.leaveId || data?.id || props?.leaveId;

      if (!leaveId || !data?.request_type) {
        setApproverVerifierData([]);
        return;
      }

      const numericRequestType = Number(data.request_type);
    

      const response = await customFetch(
        API_URLS.GET_LEAVE_APPROVER_VERIFIER,
        'POST',
        {
          leaveId,
          request_type: data.request_type,
        },
      );

      if (!response?.error) {
        setApproverVerifierData(Array.isArray(response?.data) ? response.data : []);
      } else {
        setApproverVerifierData([]);
      }
    };

    fetchApproverVerifierData();
  }, [data?.leaveId, data?.id, data?.request_type, props.id, props?.leaveId]);

  



  useEffect(() => {
    if (data) {
      let data1 = {
        employee_id: data.employee_id,
        shift_id: data.shift_id,
        fromDate: moment(data.fromDate).format('YYYY-MM-DD')
      }
      let data2 = {
        employee_id: data.employee_id,

        fromDate: data.fromDate
      }

      dispatch(
        getEmployeeShiftDetailsAction(data1, (res) => {
          console.log("res1111", res)
          setLog(res.data)
        }),

      );
      dispatch(
        getEmployeeAttendanceDetailsAction(data2, (res) => {
          console.log("res1111", res)

          setAttendanceDetails(res.data)
        }),

      );
       dispatch(getMenuAccessAction(rolename))


    }

  }, [data]);

  useEffect(() => {
    // console.log("attendanceDetails.length", attendanceDetails.length);
    if (attendanceDetails.length > 0 && data) {
      // console.log("data.startTime", data.startTime, attendanceDetails?.corrected_startTime);
      
      // Only convert time if corrected_startTime is available
      if (data.startTime) {
        const correctedStart = attendanceDetails?.corrected_startTime ?? data.startTime;
        const correctedEnd = attendanceDetails?.corrected_endTime ?? data.endTime;
        
        convertTo12HourFormat1(correctedStart);
        convertTo12HourFormat2(correctedEnd);
      } else {
        setStartTime('');
        setEndTime('');
      }
    } else {
      if (data?.startTime) {
        convertTo12HourFormat1(data.startTime);
      } else {
        setStartTime('');
      }
  
      if (data?.endTime) {
        convertTo12HourFormat2(data.endTime);
      } else {
        setEndTime('');
      }
    }
  }, [attendanceDetails, data]);

  const convertTo12HourFormat1 = (twentyFourHourFormat) => {
    if (!twentyFourHourFormat) return;
    // console.log("twentyFourHourFormat",twentyFourHourFormat)
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
    if (!twentyFourHourFormat) return;
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
              <TableCell align="left"><strong>Actual Clock-IN</strong></TableCell>
              <TableCell align="left"><strong>Actual Clock-OUT</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {logs.map((log, index) => (
              <TableRow >
              
                <TableCell align="left">
                  {log?.startDate ? moment(log?.startDate).format('hh:mm A') : 'Not clocked-IN'}
                </TableCell>
                <TableCell align="left">
                  {log.endDate ? moment(log?.endDate).format('hh:mm A') : 'Not clocked out'}
                </TableCell>
              </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  console.log(data,'asdadasda')


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
    // props.handleApprove(data);
    // data?.correction_type === 1 && setCorrection(true);
    // setConfirmOpen(false);
    if (data?.correction_type === 1) {
      setCorrection(true); 
    } else {
      props.handleApprove(data); 
    }
    setConfirmOpen(false);
  };

  const handleSetRequest = () => {
    props.handleSetRequest(data);
  }

  const [departmentLists, setDepartmentList] = useState(false);
  const [departmentListsArray, setDepartmentListArray] = useState([]);
  const [isApiFinished, setIsApiFinished] = useState(false);

  useEffect(() => {
    const data = {
      searchString: ''
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(listDepartment(data, (response)=>{
        // console.log("response",response)
        if (response.length) {
        //  console.log("response.length",response.length)
          setDepartmentList(true)
          setDepartmentListArray(response)
        }
      
      })),
     
      
    ).finally(() => setIsApiFinished(true));
  }, []);

  const normalizedApproverVerifierData = Array.isArray(approverVerifierData)
    ? approverVerifierData
    : [];
  const loggedInEmployeeId = Number(storage?.employee_id);
  const isApproverType = (type = '') => String(type).toLowerCase() === 'approver';
  const isVerifierType = (type = '') => ['verifier', 'verfier'].includes(String(type).toLowerCase());

  const approverFlag = normalizedApproverVerifierData.some(
    (item) =>
      isApproverType(item?.approver_type) &&
      Number(item?.employee_id) === loggedInEmployeeId,
  );
  const verifierFlag = normalizedApproverVerifierData.some(
    (item) =>
      isVerifierType(item?.approver_type) &&
      Number(item?.employee_id) === loggedInEmployeeId,
  );
  const hasApproverEntry = normalizedApproverVerifierData.some((item) =>
    isApproverType(item?.approver_type),
  );
  const hasVerifierEntry = normalizedApproverVerifierData.some((item) =>
    isVerifierType(item?.approver_type),
  );
  const canApproveAndVerify = approverFlag && verifierFlag;
  const canApproveOnly = approverFlag && !verifierFlag;
  const canVerifyOnly = verifierFlag && !approverFlag;
  const disableVerifyButton = hasApproverEntry && hasVerifierEntry && data?.approverId === null;


 






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
      pageCount: 0,
      numPerPage: 15,
      key: 'ApprovalPage',
      
    };

    data.employeeLogBaseShift = log

    apiCalls(
      setModalTypeHandler, setLoaderStatusHandler,
      dispatch(deleterequestAction(data, (response)=>{
        // if(response.status === 200){
        //   apiCalls(
        //     setModalTypeHandler, setLoaderStatusHandler,
        //     dispatch(listAllLeaveRequestAction(leaveData, commoncookie, setModalTypeHandler, setLoaderStatusHandler))
        //   )
        // }
  
      }, setModalTypeHandler, setLoaderStatusHandler))
    )
    // dispatch(listAllLeaveRequestAction(leaveData, commoncookie, setModalTypeHandler, setLoaderStatusHandler));
    props.handleDelete();
    setdeleteOpen(false)
  };
  const currentDate = new Date();
  const shouldRenderDelete = data?.toDate && new Date(data.toDate) >= currentDate;
  // const logs = data?.employeeLogBaseShift || [];
  


  return (
    <>
      {props.leave_request.length > 0 ? (
        <Box>
          <Card sx={{ maxWidth: 620, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2 }}>
            {company_type == 5 &&
              <CardContent sx={{ p: 2.5 }}>
                {/* Header */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar sx={{ width: 48, height: 48, bgcolor: getAvatarColor(data?.first_name), fontSize: 18, fontWeight: 600 }}>
                      {getInitials(data?.first_name, data?.last_name)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                        {`${CapitalizeFirstLetter(data?.first_name + (data?.last_name ? ' ' + data.last_name : ''))}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {data.permission_type || data.leave_type || data.half_day || 'Attendance Correction'}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Chip label={getStatusLabel(data?.status)} size="small"
                      sx={{ bgcolor: `${getStatusColor(data?.status)}14`, color: getStatusColor(data?.status), fontWeight: 600, fontSize: '11px', height: 24, borderRadius: '6px' }}
                    />
                    {Request_delete && salaryConfirmed?.length === 0 &&
                      <DeleteOutlined onClick={() => setdeleteOpen(true)} sx={{ cursor: 'pointer', fontSize: 20, color: 'text.secondary', '&:hover': { color: 'error.main' } }} />
                    }
                  </Stack>
                </Stack>

                <Divider sx={{ mb: 2 }} />

                {/* Details Grid */}
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <DetailLabel>Date</DetailLabel>
                    <DetailValue>
                      {DateWithDayMonthYearFormat(data?.fromDate) +
                        (data.request_type == 1 ? ' - ' + DateWithDayMonthYearFormat(data?.toDate) : '')}
                    </DetailValue>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <DetailLabel>Time Off</DetailLabel>
                    <DetailValue>
                      {data?.request_type === 1 && data?.reason !== 'Attendance Correction' ? 'All day'
                        : data?.request_type === 3 && data?.reason === 'Attendance Correction'
                          ? data?.shift_name === null ? `${starttime} - ${endtime}` : `${data?.shift_name}: ${starttime} - ${endtime}`
                          : data?.request_type === 4 ? 'Half Day'
                            : data?.request_type === 2 ? `${starttime} - ${endtime}` : '-'}
                    </DetailValue>
                  </Grid>
                </Grid>

                {data?.request_type === 3 && data?.reason === 'Attendance Correction' && (
                  <Box sx={{ mb: 1.5 }}>
                    <DetailLabel>Attendance Log</DetailLabel>
                    {log.length > 0 ? <TimeTable logs={log} /> : <Typography variant='body2' color='text.secondary'>Not clocked-IN</Typography>}
                  </Box>
                )}

                {/* Reason / Note */}
                <Box sx={{ bgcolor: 'grey.50', borderRadius: 1.5, p: 1.5, mb: 2 }}>
                  <DetailLabel>{data?.request_type === 3 ? 'Note' : 'Reason'}</DetailLabel>
                  <Typography variant="body2" color="text.secondary">
                    {data?.request_type === 3 ? (data?.note || '-') : (data?.reason || '-')}
                  </Typography>
                </Box>

                {/* Meta info */}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Requested at {DateWithDayMonthFormatAndTime(data?.datetime)}
                </Typography>
                {data.status === 'Approved' && (
                  <>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Verified by {data.verifier_name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Approved by {data.approver_name}</Typography>
                  </>
                )}
                {data.status === 'cancelled' && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Cancelled by {data.cancelledBy}</Typography>
                )}
              </CardContent>
            }
              {company_type == 2 &&
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
                  {(rolename === "Administrator" || (rolename === "Manager" && approverFlag === true))  && salaryConfirmed?.length === 0 && 
                  <Grid
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
               
                    {data.request_type === 'discount' && 'PointofSale Discount'}
                  </span>{' '}
                  <br />
                  <Typography variant='body2' color='text.secondary'>
                    {`${data.posName} located ${data.location_name} - requested discount ${data.discount}% `}
                  </Typography>
                  <br></br>
                
                  {/* <Typography variant='bold'>{data?.request_type === 'discount' && 'Reason'}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {data?.request_type === 'discount' && data?.reason !== null ? data?.reason : ''}
                  </Typography> */}
                </Typography>
                <br />
                <Typography>
                  Requested at {DateWithDayMonthFormatAndTime(data?.createdAt)}
                </Typography>

                <Typography>
                  {data.status === 'Approved' ? `Verified by ${data.verifier_name}` : data.status==='cancelled' ? `Cancelled by ${data.cancelledBy}` : ""}
                      <br/>
                  {data.status === 'Approved' ? `Approved by ${data.approver_name}` : data.status==='cancelled' ? `Cancelled by ${data.cancelledBy}` : ""}
                </Typography>
                <br />
                
              </CardContent>
            }

              {(data?.status === 'Rejected' || data?.status === 'cancelled') && (
                <Box sx={{ mx: 2.5, my: 1.5, p: 1.5, bgcolor: '#fef2f2', borderRadius: 1.5, border: '1px solid #fecaca' }}>
                  <Stack direction='row' alignItems='center' gap={1} sx={{ mb: 0.5 }}>
                    <CancelIcon fontSize='small' sx={{ color: 'error.main' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>{data?.status}</Typography>
                    <Typography variant="caption" color="text.secondary">by {data?.cancelledBy} on {DateWithDayMonthFormat(data?.createdAt)}</Typography>
                  </Stack>
                  {data?.reason_for_rejection && (
                    <>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Reason:</Typography>
                      <Typography variant="body2" color="text.secondary">{data?.reason_for_rejection}</Typography>
                    </>
                  )}
                </Box>
              )}


              {roleTypeWithOutEmployee.includes(rolename) && data.status !="Rejected" && data.status!='cancelled' && (canApproveAndVerify || canApproveOnly || canVerifyOnly) && (
                <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Stack direction='row' alignItems='center' gap={1} justifyContent="center" sx={{ mb: 1.5 }}>
                    {data.approverId && data.verifierId ? <DoneIcon fontSize='small' sx={{ color: 'success.main' }} /> : <QueryBuilderIcon fontSize='small' color="action" />}
                    <Typography variant="caption" color="text.secondary">
                      {data?.approverId === null && data?.verifierId === null ? 'Waiting for Approval' :
                        data?.approverId && data?.verifierId === null ? 'Approved - Waiting for Verifier' : 'Approved & Verified'}
                    </Typography>
                  </Stack>

                  {((canApproveAndVerify && !data?.approverId && !data?.verifierId) ||
                    (canApproveOnly && !data?.approverId) ||
                    (canVerifyOnly && !data?.verifierId)) && (
                    <Stack direction='row' justifyContent='center' spacing={1.5}>
                      <Button variant='outlined' color='error' sx={{ borderRadius: 2, minWidth: 100, textTransform: 'none' }}
                        startIcon={<CancelIcon fontSize="small" />}
                        onClick={() => roleTypeWithOutEmployee.includes(storage?.role_name) ? setReason(true) : props.handleCancel(data)}>
                        Deny
                      </Button>

                      {canApproveAndVerify && !data?.approverId && !data?.verifierId && (
                        <Button variant='contained' color='success' sx={{ borderRadius: 2, minWidth: 140, textTransform: 'none' }}
                          startIcon={<CheckCircleIcon fontSize="small" />}
                          onClick={() => { setConfirmOpen(true); setData({ ...data, isApproverOrVerifier: 'approveAndVerify' }); }}>
                          Approve & Verify
                        </Button>
                      )}

                      {canApproveOnly && !data?.approverId && (
                        <Button variant='contained' color='success' sx={{ borderRadius: 2, minWidth: 100, textTransform: 'none' }}
                          startIcon={<CheckCircleIcon fontSize="small" />}
                          onClick={() => { setConfirmOpen(true); setData({ ...data, isApproverOrVerifier: 'approve' }); }}>
                          Approve
                        </Button>
                      )}

                      {canVerifyOnly && !data?.verifierId && (
                        <Button variant='contained' color='success' sx={{ borderRadius: 2, minWidth: 100, textTransform: 'none' }}
                          startIcon={<CheckCircleIcon fontSize="small" />}
                          onClick={() => { setConfirmOpen(true); setData({ ...data, isApproverOrVerifier: 'verify' }); }}
                          disabled={disableVerifyButton}>
                          Verify
                        </Button>
                      )}
                    </Stack>
                  )}
                </Box>
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
                  handleSetRequest={handleSetRequest}

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
        </Box>
      ) : (
        []
      )}
    </>
  );
}

export default RequestApprovalCard;
