import React, { useState, useEffect, useContext } from 'react';
import { Button, Typography, Grid, Box, Stack, Card, CardActions, CardContent, Avatar, Divider, ListItem, ListItemAvatar, ListItemText, Dialog, DialogContent, DialogContentText, TextField, DialogActions, IconButton, Chip } from '@mui/material';
import { grey } from '@mui/material/colors';
import { getsessionStorage } from 'pages/common/login/cookies';
import CancelIcon from '@mui/icons-material/Cancel';
import employeeIcon from '../../../assets/dashboardIcons/officer.svg';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ReasonDialog from './reasonDialog';
import CommonDialog from 'components/commonDialog';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import { useDispatch, useSelector } from 'react-redux';
import DoneIcon from '@mui/icons-material/Done';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import apiCalls from 'utils/apiCalls';
import { roleType ,roleTypeWithOutEmployee} from 'utils/roleType';
import moment from 'moment';
import { deleteClaimAction, searchClaimAndOthersAction, updateClaimAndOtherStatusAction } from 'redux/actions/loan_actions';
import AttachmentField from 'pages/common/Timesheet/Attachment';
import { headerStyle } from 'utils/pageSize';
import { CreateNotificationAction, getNotificationTokenAction } from 'redux/actions/notification_actions';
import { getDateTimeFormat } from 'utils/getTimeFormat';
import { DeleteOutlined } from '@mui/icons-material';
import { Data } from '@react-google-maps/api';
import CommonToolTip from 'components/ToolTip';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ClaimPdf from './ClaimPdf';
import context from '../../../context/CreateNewButtonContext'
import { useCustomFetch } from 'utils/useCustomFetch';
import API_URLS from 'utils/customFetchApiUrls';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';

const avatarColors = ['#1976d2', '#388e3c', '#d32f2f', '#7b1fa2', '#f57c00', '#0097a7', '#5d4037', '#455a64', '#c2185b', '#00796b'];
const getAvatarColor = (name) => { if (!name) return avatarColors[0]; return avatarColors[name.charCodeAt(0) % avatarColors.length]; };
const getInitials = (f, l) => ((f ? f.charAt(0).toUpperCase() : '') + (l ? l.charAt(0).toUpperCase() : '')) || '?';
const getStatusColor = (s) => { if (!s) return '#f57c00'; const v = s.toLowerCase(); if (v === 'approved') return '#2e7d32'; if (v === 'rejected' || v === 'cancelled') return '#d32f2f'; return '#f57c00'; };
const getStatusLabel = (s) => { if (!s) return 'Pending'; const v = s.toLowerCase(); if (v === 'approved') return 'Approved'; if (v === 'rejected') return 'Rejected'; if (v === 'cancelled') return 'Cancelled'; if (v === 'waiting for approval' || v === 'pending') return 'Pending'; return s; };
const DetailLabel = ({ children }) => <Typography sx={{ fontSize: 11, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, mb: 0.3 }}>{children}</Typography>;
const DetailValue = ({ children }) => <Typography sx={{ fontWeight: 500, fontSize: 14, mb: 1.5 }}>{children}</Typography>;

function ClaimApprovalCard(props) {
  const customFetch = useCustomFetch()
  const [claimData, setClaimData] = useState({ attachment: '[]' });

  const [reason, setReason] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [reasonDialog, setReasonDialog] = useState(false);
  const [formValues, setFormValues] = useState({ reason: '' });
  const [formErrors, setFormErrors] = useState({ reason: '' });
  const { LoanReducer: { searchClaim } } = useSelector(state => state)
  const dispatch = useDispatch();
  const storage = getsessionStorage();
  const [empNames, setEmpName] = useState([]);
  let rolename = storage?.role_name || '';
  let emp_id = storage?.employee_id || '';
  let approvedPerson = storage?.first_name;
  const isEmployee = !roleType.includes(rolename);
  const [deleteOpen, setdeleteOpen] = useState(false)
  const [open, setOpen] = useState(false);
  const [claimDownloadData, setDownloadData] = useState({});
  const [approverVerifierData, setApproverVerifierData] = useState([]);
  const { commoncookie, headerLocationId, setLoaderStatusHandler, setModalTypeHandler } = useContext(context)
  const menuAccess = useSelector((state) => state.rbacReducer.menuAccess);
  const Request_delete = UserRightsAuthorization(menuAccess[rolename], 'approvals', 'can_delete')

  useEffect(() => {
    if (searchClaim?.data?.length > 0) {
      let emp_Names = searchClaim?.data?.map((v) => {
        return { name: v?.emp_name }
      })
      setEmpName(emp_Names)
    }
  }, [searchClaim?.data?.length])

  useEffect(()=>{
    dispatch(getMenuAccessAction(rolename))
  },[])

  useEffect(() => {
    if (searchClaim?.data?.length > 0) {
      const ApprovalData = props.id
      ? searchClaim?.data?.find((item) => item.unique_key === props.id  )
      : searchClaim?.data[0];
      setClaimData(ApprovalData || {});
      let attachments = [];
      if (ApprovalData?.attachment) {
        try {
          attachments = JSON.parse(ApprovalData.attachment);
        } catch (error) {
          attachments = [ApprovalData.attachment];
        }
      }
      setPreviews(attachments);
    } else {
      setClaimData({});
      setPreviews([]);
    }
  }, [searchClaim, props.id]);

  useEffect(() => {
    const fetchApproverVerifierData = async () => {
      const leaveId = claimData.type === 'claims' ? claimData?.claim_id : claimData?.unique_id_emp_location;
      const requestType = claimData.type === 'claims' ? 6 : claimData.type ? 9 : null;

      if (!leaveId || !requestType) {
        setApproverVerifierData([]);
        return;
      }

      const response = await customFetch(
        API_URLS.GET_LEAVE_APPROVER_VERIFIER,
        'POST',
        {
          leaveId,
          request_type: requestType,
        },
      );

      if (!response?.error) {
        setApproverVerifierData(Array.isArray(response?.data) ? response.data : []);
      } else {
        setApproverVerifierData([]);
      }
    };

    fetchApproverVerifierData();
  }, [claimData?.claim_id, claimData?.type, claimData?.unique_id_emp_location, props.id]);

  const handleOpen = (rowData) => {
    const updatedData = Object.fromEntries(
      Object.entries(rowData).map(([key, value]) => [
        key,
        value,
      ]),
    );
    setOpen(true);
    setDownloadData(updatedData);
  };

  const handleClose = () => {
    setOpen(false);
  };


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
  const disableVerifyButton = hasApproverEntry && hasVerifierEntry && claimData?.approverId === null;

  const DateWithDayMonthFormat = (date) => {
    let now = new Date(date);
    let day = now.getDate();
    let month = now.toLocaleString('default', { month: 'short' });
    return month + ' ' + day;
  };

  const DateWithDayMonthYearFormat = (date) => {
    let now = new Date(date);
    let day = now.getDate();
    let month = now.toLocaleString('default', { month: 'long' });
    let year = now.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const DateWithDayMonthFormatAndTime = (date) => {
    let now = new Date(date);
    let day = now.getDate();
    let month = now.toLocaleString('default', { month: 'short' });
    let hour = now.getHours();
    let minute = now.getMinutes();
    let period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return month + ' ' + day + ', ' + hour + ':' + (minute < 10 ? '0' : '') + minute + ' ' + period;
  };

  const CapitalizeFirstLetter = (str) => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  };

  const handleDeny = () => {
    setReasonDialog(true)
  };

  const handleReasonClose = () => {
    setReasonDialog(false)
    setFormValues({reason:''})
    setFormErrors({reason:''})
  }

  const handleReasonChange = (e) => {
    let { name, value } = e.target;
    setStateHandler(name, value);
  }

  const setStateHandler = async (name, value) => {
    let formObj = {};
    formObj = {
      ...formValues,
      [name]: value === '' ? null : value,
    };
    await setFormValues(formObj);
    validationHandler(name, value);
  }

  const validationHandler = (name, value) => {
    if (!Object.keys(formErrors).includes(name)) return;

    if (name === 'reason') {
      if (value.length > 0) {
        setFormErrors({
          ...formErrors,
          ['reason']: '',
        });
      }
      if (value.length === 0 || null) {
        setFormErrors({
          ...formErrors,
          ['reason']: 'Reason is Required!',
        });
      }
    }
  };


  const handleDenySubmit = async() => {
    const claimId = claimData?.claim_id === null ? claimData?.unique_id_emp_location : claimData?.claim_id;
    const canceledBy = storage?.first_name + (storage?.last_name ? ' ' + storage.last_name : '');
    const rejectedById = storage?.employee_id

    if (formValues.reason.trim() === '') {
      setFormErrors({ reason: 'Reason is Required!' });
      return;
    }

    let type = claimData.type === 'claims' ? 'Claim Rejected' : 'Wfh Rejected';

    let employee_id =claimData.employee_id
    let data1 = {
      type,
      employee_id,
      keyForNotifications: 'Verifier',
      claimDenyCategory:claimData.category,
      claimDenyAmount : claimData.claim_amount,
      claimDenyReason : formValues.reason,
      claimRejectedBy : storage.first_name
    };
    const claim = {
      searchString: "",
      fromdate: "",
      todate: "",
      pageCount: 0,
      numPerPage: 15,
      employeeId: null,
      key: 'ApprovalPage',
      type:'claimsAndOthers',
  }
  const id =  claimData?.claim_id === null ? claimData?.unique_id_emp_location : claimData?.claim_id
    dispatch(updateClaimAndOtherStatusAction(
      id,
      { type: 'reject', Deniedby: canceledBy,rejectedById:rejectedById, reason: formValues.reason,from : claimData.type === 'claims' ? 'claims' : 'wfh' },
      (response) => {
        if (response.status === 200) {
          dispatch(searchClaimAndOthersAction(claim, () => { }));
          setConfirmOpen(false);
        }
      }
    ));
    setReasonDialog(false);
    await dispatch(
      getNotificationTokenAction(data1, (res) => {
        if (res?.status === 200) {
          dispatch(
            CreateNotificationAction({
              content_body: res?.data.body,
              title: res?.data?.title,
              time: getDateTimeFormat(new Date()),
              active: '1',

            }),
          );
        }
      }),
    );
  };

  const handleApprove = () => {
    setConfirmOpen(true);
  };

  const handleApproveClaim = async() => {
    const claimId = claimData?.claim_id === null ? claimData?.unique_id_emp_location : claimData?.claim_id  ;
    const RequestedBy = claimData?.employee_id;

    if (claimId) {
      const approvedBy = {
        approvedBy : storage?.first_name + (storage?.last_name ? ' ' + storage.last_name : ''),
        approverId:null,
        verifierId:null,
        department_id: claimData.department_id,
        request_type: claimData.type === 'claims' ? 6 : 9
      }

      if (claimData.isApproverOrVerifier === 'approveAndVerify') {
        approvedBy.approverId = storage?.employee_id
        approvedBy.verifierId = storage?.employee_id
         approvedBy.key = 'ApproverAndVerifier'
      }
      else if(claimData.isApproverOrVerifier === 'approve'){
        approvedBy.approverId = storage?.employee_id
         approvedBy.key = 'Approver'

      }
      else if(claimData.isApproverOrVerifier === 'verify'){
        approvedBy.approverId = claimData?.approverId

        approvedBy.verifierId = storage?.employee_id
         approvedBy.key = 'Verifier'

      }
      else{
        approvedBy.approverId = storage?.employee_id
        approvedBy.verifierId = storage?.employee_id
      }


      let type = claimData.type ==='claims' ? 'Claim Approval' : 'Wfh Approval';

      let employee_id =claimData.employee_id

      let data1 = {
        type,
        employee_id,
        keyForNotifications:  approvedBy.key ,
        request_type_id :claimData.type ==='claims' ? 6 : 9,
        category:claimData.category,
        claimAmount : claimData.claim_amount,
        claimApprovedBy : storage?.first_name + (storage?.last_name ? ' ' + storage.last_name : '')
    }
      const claim = {
        searchString: "",
      fromdate: "",
      todate: "",
      pageCount: 0,
      numPerPage: 15,
      employeeId: null,
      key: 'ApprovalPage',
      type:'claimsAndOthers',
    }
    const id = claimData?.claim_id === null ? claimData?.unique_id_emp_location : claimData?.claim_id;

    const payload = {
      type: claimData?.requestedFor === 'delete' ? 'ApproveAndInactivate' : 'Approve',
      requestedBy: RequestedBy,
      Approvedby: approvedBy,
      reason: 'Approved by the manager',
      from: claimData.type === 'claims' ? 'claims' : 'wfh',
      ...(claimData?.requestedFor === 'delete' && {
        latitude: claimData?.lattitude,
        longitude: claimData?.longitude,
        location_name: claimData?.employee_wfh_location_name
      })
    };
      apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      await dispatch(updateClaimAndOtherStatusAction(id,
        payload,
        (response) => {
          if (response.status === 200 && response.data.status !== "No Locations Mapped") {
            dispatch(searchClaimAndOthersAction(claim, () => {}));
            setConfirmOpen(false);
          }
        }
      )));

      await dispatch(
        getNotificationTokenAction(data1, (res) => {
          if (res?.status === 200) {
            dispatch(
              CreateNotificationAction({
                content_body: res?.data?.body,
                receiver:res?.data?.receiver_id,
                title: res?.data?.title,
                time: getDateTimeFormat(new Date()),
                active: '1',

              }),
            );
          }
        }),
      );
    } else {
      console.error("Claim ID is missing");
    }
  };


  const handleClaimsDelete = () => {
    const data = {
      searchString: '',
      fromdate: '',
      todate: '',
      employeeId: null
    }
    dispatch(deleteClaimAction(claimData));
    props.handleClaimDelete()
    setdeleteOpen(false)
  };

  return (
    <>
      {searchClaim?.data?.length > 0 ? (
        <Box>
          <Card sx={{ maxWidth: 620, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2 }}>
              {

                claimData.type === 'claims' ?


                  <CardContent>
                    {/* Header: Avatar + Name + Status Chip + Delete */}
                    <Stack direction='row' alignItems='center' spacing={1.5} sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: getAvatarColor(claimData.full_name), width: 40, height: 40, fontSize: 16, fontWeight: 600 }}>
                        {getInitials(claimData.first_name, claimData.last_name)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant='subtitle1' sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                          {`${CapitalizeFirstLetter(claimData.full_name)}`}
                        </Typography>
                      </Box>
                      <Chip
                        label={getStatusLabel(claimData.status)}
                        size='small'
                        sx={{
                          bgcolor: getStatusColor(claimData.status) + '14',
                          color: getStatusColor(claimData.status),
                          fontWeight: 600,
                          fontSize: 12,
                          borderRadius: 1.5,
                        }}
                      />
                      {Request_delete && (
                        <IconButton size='small' onClick={handleClaimsDelete} sx={{ color: 'text.secondary' }}>
                          <DeleteOutlined fontSize='small' />
                        </IconButton>
                      )}
                    </Stack>

                    <Divider sx={{ mb: 2 }} />

                    {/* Detail fields */}
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <DetailLabel>Category</DetailLabel>
                        <DetailValue>{claimData.category}</DetailValue>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <DetailLabel>Bill Date</DetailLabel>
                        <DetailValue>{DateWithDayMonthYearFormat(claimData.bill_date)}</DetailValue>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <DetailLabel>Bill Amount</DetailLabel>
                        <DetailValue>{claimData.bill_amount}</DetailValue>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <DetailLabel>Claim Amount</DetailLabel>
                        <DetailValue>{claimData.claim_amount}</DetailValue>
                      </Grid>
                    </Grid>

                    {/* Remarks */}
                    {claimData.remarks && (
                      <>
                        <DetailLabel>Remarks</DetailLabel>
                        <Box sx={{ bgcolor: 'grey.50', borderRadius: 1.5, p: 1.5, mb: 2 }}>
                          <Typography variant='body2' color='text.secondary'>
                            {claimData.remarks}
                          </Typography>
                        </Box>
                      </>
                    )}

                    {/* Attachments */}
                    {previews.length > 0 && (
                      <>
                        <DetailLabel>Attachments</DetailLabel>
                        <Box display="flex" flexDirection="column" mt={1}>
                          {previews.map((imageUrl, index) => (
                            <Box key={index} display="flex" alignItems="center" mb={2}>
                              <img
                                src={imageUrl}
                                alt={`Attachment ${index}`}
                                style={{ maxWidth: '200px', maxHeight: '200px', marginRight: '10px', borderRadius: 6 }}
                              />
                            </Box>
                          ))}
                        </Box>
                      </>
                    )}

                    {/* Meta info */}
                    <Typography variant="caption" color="text.secondary">
                      Requested at {DateWithDayMonthFormatAndTime(claimData.createdAt)}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      {claimData.status === 'Approved' ? `Verified by ${claimData.verifier_name}` : claimData.status === 'cancelled' ? `Cancelled by ${claimData.cancelledBy}` : ""}
                    </Typography>
                    {(claimData.status === 'Approved' || claimData.status === 'cancelled') && <br />}
                    <Typography variant="caption" color="text.secondary">
                      {claimData.status === 'Approved' ? `Approved by ${claimData.approver_name}` : claimData.status === 'cancelled' ? `Cancelled by ${claimData.cancelledBy}` : ""}
                    </Typography>
                  </CardContent> :

                  <CardContent>
                    {/* Header: Avatar + Name + Status Chip + Delete */}
                    <Stack direction='row' alignItems='center' spacing={1.5} sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: getAvatarColor(claimData.full_name), width: 40, height: 40, fontSize: 16, fontWeight: 600 }}>
                        {getInitials(claimData.first_name, claimData.last_name)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant='subtitle1' sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                          {`${CapitalizeFirstLetter(claimData.full_name)}`}
                        </Typography>
                      </Box>
                      <Chip
                        label={getStatusLabel(claimData.status)}
                        size='small'
                        sx={{
                          bgcolor: getStatusColor(claimData.status) + '14',
                          color: getStatusColor(claimData.status),
                          fontWeight: 600,
                          fontSize: 12,
                          borderRadius: 1.5,
                        }}
                      />
                      {rolename === "Administrator" && (claimData?.status === "Approved" || claimData?.status === "Waiting for Approval") && (
                        <IconButton size='small' onClick={() => setdeleteOpen(true)} sx={{ color: 'text.secondary' }}>
                          <DeleteOutlined fontSize='small' />
                        </IconButton>
                      )}
                    </Stack>

                    <Divider sx={{ mb: 2 }} />

                    {/* Detail fields */}
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <DetailLabel>Location Name</DetailLabel>
                        <DetailValue>{claimData.employee_wfh_location_name}</DetailValue>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <DetailLabel>Requested For</DetailLabel>
                        <DetailValue>{claimData.requestedFor === 'add' ? 'Add WFH location' : claimData.requestedFor === 'delete' ? 'Remove WFH location' : '-'}</DetailValue>
                      </Grid>
                      {
                        claimData.requestedFor === 'delete' &&
                        <Grid size={{ xs: 12 }}>
                          <DetailLabel>Reason</DetailLabel>
                          <Box sx={{ bgcolor: 'grey.50', borderRadius: 1.5, p: 1.5, mb: 2 }}>
                            <Typography variant='body2' color='text.secondary'>
                              {claimData.reason || '-'}
                            </Typography>
                          </Box>
                        </Grid>
                      }
                      <Grid size={{ xs: 6 }}>
                        <DetailLabel>Latitude</DetailLabel>
                        <DetailValue>{claimData.lattitude}</DetailValue>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <DetailLabel>Longitude</DetailLabel>
                        <DetailValue>{claimData.longitude}</DetailValue>
                      </Grid>
                    </Grid>

                    {/* Meta info */}
                    <Typography variant="caption" color="text.secondary">
                      Requested at {DateWithDayMonthFormatAndTime(claimData.createdAt)}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      {claimData.status === 'Approved' ? `Verified by ${claimData.verifier_name}` : claimData.status === 'cancelled' ? `Cancelled by ${claimData.cancelledBy}` : ""}
                    </Typography>
                    {(claimData.status === 'Approved' || claimData.status === 'cancelled') && <br />}
                    <Typography variant="caption" color="text.secondary">
                      {claimData.status === 'Approved' ? `Approved by ${claimData.approver_name}` : claimData.status === 'cancelled' ? `Cancelled by ${claimData.cancelledBy}` : ""}
                    </Typography>
                  </CardContent>

              }


              <Divider />


               {roleTypeWithOutEmployee.includes(rolename) && claimData.status !="Rejected" && claimData.status!='Cancelled' && (canApproveAndVerify || canApproveOnly || canVerifyOnly) && (
                <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Stack direction='row' justifyContent='center' alignItems='center' spacing={1} sx={{ mb: 1.5 }}>
                      {
                        claimData.approverId && claimData.verifierId ?  <DoneIcon fontSize='small' style={{ color: 'green' }} /> : <QueryBuilderIcon fontSize='small' style={{}} />

                      }
                      <Typography sx={{fontSize: '13px'}}>
                        {
                          claimData?.approverId === null && claimData?.verifierId === null ? 'Waiting for the Approval' :
                          claimData?.approverId  && claimData?.verifierId === null ? ' Approved And Waiting for the verifier' : 'Approved And Verified'
                        }
                      </Typography>
                  </Stack>

                  {((canApproveAndVerify && !claimData?.approverId && !claimData?.verifierId) ||
                    (canApproveOnly && !claimData?.approverId) ||
                    (canVerifyOnly && !claimData?.verifierId)) && (
                    <Stack direction='row' justifyContent='center' spacing={1.5}>
                        <Button variant="outlined"
                          color='error'
                          sx={{ borderRadius: 2, minWidth: 100, textTransform: 'none' }}
                          startIcon={<CancelIcon fontSize="small" />}
                          onClick={handleDeny}>Deny</Button>

                        {canApproveAndVerify && !claimData?.approverId && !claimData?.verifierId && (
                          <Button
                            variant='contained'
                            color='success'
                            sx={{ borderRadius: 2, minWidth: 100, textTransform: 'none' }}
                            startIcon={<CheckCircleIcon fontSize="small" />}
                            onClick={() => {
                              setConfirmOpen(true,)
                              setClaimData({ ...claimData, isApproverOrVerifier: 'approveAndVerify', key: 'ApprovalPage' })
                            }}
                          >
                            Approve & Verify
                          </Button>
                        )}

                        {canApproveOnly && !claimData?.approverId && (
                          <Button
                            variant='contained'
                            color='success'
                            sx={{ borderRadius: 2, minWidth: 100, textTransform: 'none' }}
                            startIcon={<CheckCircleIcon fontSize="small" />}
                            onClick={() => {
                              setConfirmOpen(true,)
                              setClaimData({ ...claimData, isApproverOrVerifier: 'approve', key: 'ApprovalPage'})
                            }}
                          >
                            Approve
                          </Button>
                        )}

                        {canVerifyOnly && !claimData?.verifierId && (
                          <Button
                            variant='contained'
                            color='success'
                            sx={{ borderRadius: 2, minWidth: 100, textTransform: 'none' }}
                            startIcon={<CheckCircleIcon fontSize="small" />}
                            onClick={() => {
                              setConfirmOpen(true,)
                              setClaimData({ ...claimData, isApproverOrVerifier: 'verify' })
                            }}
                            disabled={disableVerifyButton}
                          >
                            Verify
                          </Button>
                        )}
                    </Stack>
                  )}

                </Box>

              )}

              {
                ( claimData.status === 'Rejected') &&
                  <Box sx={{ mx: 2.5, my: 1.5, p: 1.5, bgcolor: '#fef2f2', borderRadius: 1.5, border: '1px solid #fecaca' }}>
                    <Stack direction='row' alignItems='center' spacing={1} sx={{ mb: 0.5 }}>
                      <CancelIcon fontSize='small' sx={{ color: '#d32f2f' }} />
                      <Typography sx={{ fontWeight: 600, fontSize: 13, color: '#d32f2f' }}>
                        {claimData?.status}
                      </Typography>
                      <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
                        {claimData?.cancelledBy} {DateWithDayMonthFormat(claimData?.createdAt)}
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', mb: 0.3 }}>Reason for Rejection:</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {claimData?.reason_for_rejection}
                    </Typography>
                  </Box>

              }

              {
                claimData.status === 'Cancelled' &&
                  <Box sx={{ mx: 2.5, my: 1.5, p: 1.5, bgcolor: '#fef2f2', borderRadius: 1.5, border: '1px solid #fecaca' }}>
                    <Stack direction='row' alignItems='center' spacing={1} sx={{ mb: 0.5 }}>
                      <CancelIcon fontSize='small' sx={{ color: '#d32f2f' }} />
                      <Typography sx={{ fontWeight: 600, fontSize: 13, color: '#d32f2f' }}>
                        {claimData?.status}
                      </Typography>
                      <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
                        {claimData?.cancelledBy} {DateWithDayMonthFormat(claimData?.updatedAt)}
                      </Typography>
                    </Stack>
                    <Typography variant='body2' color='text.secondary'>
                      {claimData?.reason_for_rejection}
                    </Typography>
                  </Box>

              }
              <CardActions></CardActions>
            </Card>
        </Box>
      ) : (
        <Typography sx={{ display: 'flex', justifyContent: 'center', py: 3, color: 'text.secondary' }}>No record found</Typography>
      )}
      <CommonDialog
        open={confirmOpen}
        cancel_buttonName = {'Cancel'}
        ok_buttonName = {'Ok'}
        dialogTitle = {'Confirmation'}
        cancel_fun = {() => {
          setConfirmOpen(false)
        }}
        ok_fun={handleApproveClaim}
        dialogContent ={'Are you sure you want to approve the request?'}
      />
      {reasonDialog === true &&
    <Dialog
      maxWidth='sm'
     open={reasonDialog}
      onClose={handleReasonClose}
      fullWidth
      maxHeight='sm'

   >
     <DialogContent>
       <DialogContentText sx={{fontWeight:headerStyle.fontWeight}} id="claimapprovalcard-dialog-description">
         Reason is required to reject a request!
      </DialogContentText>
        <Grid sx={{padding:'20px 0px 0px 0px'}}>
        <TextField
        onChange={handleReasonChange}
        name='reason'
        required
        fullWidth={true}
        multiline={true}
        placeholder='Reason'
        label='Reason'
        value={formValues.reason === '' ? '' : formValues.reason}
        error={formErrors.reason === '' ? false : true}
        helperText={formErrors.reason === '' ? '' : 'Reason is Required!'}
      >

      </TextField>
       </Grid>
     </DialogContent>
     <DialogActions>
       <Button color='warning' variant='contained' onClick={handleReasonClose}>Close</Button>
       <Button variant='contained' onClick={handleDenySubmit} autoFocus>
         Submit
       </Button>
     </DialogActions>
   </Dialog>
  }
      {open && (
          <ClaimPdf
            open={open}
            handleClose={handleClose}
            claimDownloadData={claimDownloadData}

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
                ok_fun = {handleClaimsDelete}
                open={deleteOpen}
                type={'request'}
              />
              )}
    </>
  );
}

export default ClaimApprovalCard;
