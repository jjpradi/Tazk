import React, {useState, useEffect, useRef, useContext} from 'react';
import _ from 'lodash';
import {Button, TextField, Typography, Grid, Box, Stack, Dialog, DialogContent, DialogContentText, DialogActions, IconButton, Chip} from '@mui/material';
import {getTrimmedData} from '../../../components/trimFunction/index';
import Autocomplete, {createFilterOptions} from '@mui/material/Autocomplete';
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
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ImageIcon from '@mui/icons-material/Image';
import {getMonthName, getDateFormat, getDateTimeFormat} from '../../../utils/getTimeFormat';
import Cookies from 'universal-cookie';
import employeeIcon from '../../../assets/dashboardIcons/officer.svg'
import ErrorIcon from '@mui/icons-material/Error';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import { getsessionStorage } from 'pages/common/login/cookies';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { headerStyle, pageSize } from 'utils/pageSize';
import { deleteLoanAction, getLoanListAction, loanDetailsAction, searchLoanAction, updateLoanStatusAction } from 'redux/actions/loan_actions';
import apiCalls from 'utils/apiCalls';
import { CreateNotificationAction, getNotificationTokenAction } from 'redux/actions/notification_actions';
import { sendNtfy } from 'firebase/firebase.service';
import { useDispatch, useSelector } from 'react-redux';
import context from '../../../../src/context/CreateNewButtonContext';
import { getLoginRoleAction, getTokenByEmpId } from 'redux/actions/userRole_actions';
import notificationType from 'firebase/notify_type';
import { roleType,roleTypeWithOutEmployee } from 'utils/roleType';
import CommonDialog from 'components/commonDialog';
import { DeleteOutlined } from '@mui/icons-material';
import CommonToolTip from 'components/ToolTip';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LoanPdf from './LoanPdf';
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


function LoanApprovalCard(props) {
  const customFetch = useCustomFetch()
  const menuAccess = useSelector((state) => state.rbacReducer.menuAccess)
  const textRef = useRef(null);
  const [data, setData] = useState([]);
  const [pages, setPages] = useState(0)
  const [searchVal, setSearchVal] = useState('')
  const dispatch = useDispatch()
  const [empNames, setEmpName] = useState([]);
  const [confirmOpen,setConfirmOpen] = useState(false);
  const [deleteOpen, setdeleteOpen] = useState(false)
  const [approverVerifierData, setApproverVerifierData] = useState([]);
  const { LoanReducer: { loansdetail ,searchloandata}, UserRoleReducer:{ loginRole ,userRole} } = useSelector(state => state)
  
//role name
// const cookies = new Cookies();
const {
  commoncookie,
  headerLocationId,
  setModalTypeHandler,
      setLoaderStatusHandler
} = useContext(context);
const date = new Date();

const storage = getsessionStorage()
let rolename = storage?.role_name || '';
let emp_id = storage?.employee_id || '';
let approvedPerson = storage?.first_name;

 const Request_delete = UserRightsAuthorization(menuAccess[rolename], 'approvals', 'can_delete')

const firstDay = getDateFormat(new Date(date.getFullYear(), date.getMonth(), 1));
const lastDay = getDateFormat(new Date(date.getFullYear(), date.getMonth() + 1, 0));
const [filteredValue, setFilteredValue] = useState({ tenure: "", frmdate: firstDay, todate:lastDay, emp_name: "", status: "",numPerPage: pageSize,
pageCount: pages,
  searchString: searchVal
})
const [open, setOpen] = useState(false);
const [loanDownloadData, setDownloadData] = useState({});

useEffect(() => {
  if (searchloandata.length > 0) {
    let emp_Names = searchloandata?.map((v) => {
      return { name: v?.emp_name }
    })
    setEmpName(emp_Names)
  }
}, [searchloandata?.length])


  useEffect(() => {
    if( props.searchloandata?.length > 0 && props.id !== '' ){

        let ApprovalData = props.searchloandata?.filter((f) => f.id === props.id)[0] || []
        setData({
          ...ApprovalData,
          date: null,
          employeeId: null,
          key: 'ApprovalPage',
        });
    }else{
        let ApprovalData =  props.searchloandata[0] || []
        setData({
          ...ApprovalData,
          date: null,
          employeeId: null,
          key: 'ApprovalPage',
        });

    }
  },[props.searchloandata, props.id])

  useEffect(() => {
    const fetchApproverVerifierData = async () => {
      const leaveId = props.id || data?.id;

      if (!leaveId || !data?.request_type) {
        setApproverVerifierData([]);
        return;
      }

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
    dispatch(getMenuAccessAction(rolename))
  }, [data?.id, data?.request_type, props.id])

  const primary = grey[300];

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

const handleClose = () => {
  setOpen(false);
};



  const DateWithDayMonthFormat = (date) => {
    let now = new Date(date);
    let day = now.getDate();
    let month = now.toLocaleString('default', { month: 'short' })
    // return month+' '+day
    return day+' '+month
  }

  const DateWithDayMonthYearFormat = (date) => {
    let now = new Date(date);
    let day = now.getDate();
    let month = now.toLocaleString('default', { month: 'long' })
    let year = now.getFullYear()
    return `${month}${' '}${day},${' '}${year}`
  }

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

  const CapitalizeFirstLetter = (str) => {
    const capitalized = str?.charAt(0).toUpperCase() + str?.slice(1);
    return capitalized;
    }

    const [reasonDialog, setReasonDialog] = useState(false);
  const [rowDataId , setRowDataId ] = useState({})
  const [formErrors, setFormErrors] = useState({
    reason:''
  })
  const [formValues, setFormValues] = useState({
    reason:''
  })
  const [requiredFields] = useState([
    'reason',
  ]);

  const handleReasonChange = (e) => {
    let { name, value } = e.target;
    setStateHandler(name, value);
  }
  const handleReasonClose = () => {
    setReasonDialog(false)
    setFormValues({reason:''})
    setFormErrors({reason:''})
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

  const handleOpenReasonDialog = (rowData) => {
    setReasonDialog(true)
    setRowDataId(rowData)
  };

  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };


  const handleRejectSubmit = async (event) => {
    event.preventDefault();
    const canceledBy = storage?.first_name + (storage?.last_name ? ' ' + storage.last_name : '')
    const rejectedById = storage?.employee_id


    let isValid = true;
    let formErrorsObj = { ...formErrors };
    await Object.keys(formValues).map((key, s) => {
      if (
        requiredFields.includes(key) &&
        (formValues[key] === null || formValues[key] === '' )
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' is Required!';
      }
      return null;
    });
    await setFormErrors(formErrorsObj);
    if (isValid) {
      const data1 = {
        tenure: "", frmdate: '', todate: '', emp_name: "", status: "", numPerPage: '',
        pageCount: '',
        searchString: '',
        date: null,
        employeeId: null,
        key: 'ApprovalPage',
      }
      apiCalls(
        setModalTypeHandler,
      setLoaderStatusHandler,
        dispatch(updateLoanStatusAction(rowDataId.id, { type: 'reject', Rejectedby: canceledBy,rejectedById:rejectedById, reason: formValues.reason}, setModalTypeHandler, setLoaderStatusHandler, resDataLoan, (response) => {
          if(response === 200){
        dispatch(searchLoanAction( data1, () => {}))

          }
        })
      )
      ),
      handleReasonClose()

    }
  }
  const resDataLoan = (status , ApproveType) => {
    let storage = getsessionStorage()

    let employee_id = data?.emp_id || '';
    let type = 'Loan Rejection';
    let data1 = {
      type,
      employee_id,
      keyForNotifications: 'Verifier',
      request_type_id : 5,
      loanRejectedAmount : data.Required_Amount,
      loanRejectedReason : formValues.reason,
      loanRejectedBy : storage.first_name
    };

    dispatch(
      getNotificationTokenAction(data1, (res) => {
        if (res?.status === 200) {
          dispatch(
            CreateNotificationAction({
              content_body: res?.data.body,
              title: res?.data?.title,
              time: getDateTimeFormat(new Date()),
              active: '1',
              receiver: employee_id,
              type: type,
              type_id : res?.data?.id
            }),
          );
        }
      }),
    );
  }

  const handleCancelLoan = (data) => {

    const canceledBy = storage?.first_name + (storage?.last_name ? ' ' + storage.last_name : '')
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(updateLoanStatusAction(data?.id, { type: 'Cancel', Rejectedby: canceledBy, reason: 'Cancelled by the initiator' }, setModalTypeHandler, setLoaderStatusHandler, () => {}, (response) => {
        if(response === 200){
     dispatch(searchLoanAction( data, () => {}))

        }
      })),
    )

  }

  const handleApprove = () => {
    props.handleApprove(data?.id,data)
      setConfirmOpen(false);
    }


    const handleDelete = () => {
      const loanData = {
        tenure: "",
        frmdate: '',
        todate: '',
        emp_name: "",
        status: "",
        numPerPage: null,
        pageCount: '',
        searchString: '',
        date: null,
        employeeId: null,
        key:'ApprovalPage'
      }
      dispatch(deleteLoanAction(data));
      dispatch(getLoanListAction(loanData,(response)=>{}))
      props.handleLoanDelete()
      setdeleteOpen(false)
    };

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

  return (
    <>
      {props.searchloandata?.length > 0 ? <Box>
              <Card sx={{ maxWidth: 620, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2 }}>
                  <CardContent>
                    {/* Header: Avatar + Name + Status Chip + Actions */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>

                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar sx={{ width: 48, height: 48, bgcolor: getAvatarColor(data?.full_name?.split(' ')[0]), fontSize: 18, fontWeight: 600 }}>
                        {getInitials(data?.full_name?.split(' ')[0], data?.full_name?.split(' ')[1])}
                      </Avatar>
                    
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                          {`${CapitalizeFirstLetter(data?.full_name)}`}
                        </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>

                        <Chip
                          label={getStatusLabel(data?.status)}
                          size="small"
                          sx={{
                            mt: 0.5,
                            bgcolor: getStatusColor(data?.status) + '14',
                            color: getStatusColor(data?.status),
                            fontWeight: 600,
                            fontSize: 11,
                            height: 22,
                          }}
                        />
                                          
                        {rolename === "Employee" && (data?.status === "Approved") && (
                        <CommonToolTip title='View'>
                          <IconButton
                              onClick={() => handleOpen(data)}
                              size="small"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </CommonToolTip>
                      )}
                      {Request_delete && (
                        <IconButton
                          onClick={handleDelete}
                          size="small"
                          sx={{ color: 'text.secondary' }}
                        >
                          <DeleteOutlined fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                </Stack>
                    <Divider sx={{ mb: 2 }} />

                    {/* Detail Fields */}
                    <DetailLabel>Requested Amount</DetailLabel>
                    <DetailValue>{data?.Required_Amount}</DetailValue>

                    <DetailLabel>Reason</DetailLabel>
                    <Box sx={{ bgcolor: 'grey.50', borderRadius: 1.5, p: 1.5, mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {data?.Reason !== null ? data?.Reason : ''}
                      </Typography>
                    </Box>

                    <DetailLabel>Repayment Method</DetailLabel>
                    <DetailValue>{getPaymentName(data)}</DetailValue>

                    <DetailLabel>Tenure Period</DetailLabel>
                    <DetailValue>{data?.tenure !== null ? `${data.tenure} month` : ""}</DetailValue>

                    {/* Timestamps */}
                    <Typography variant="caption" color="text.secondary">
                      Requested at {DateWithDayMonthFormatAndTime(data?.createdAt)}
                    </Typography>
                    <br/>
                    {data.status === 'Approved' && (
                      <>
                        <Typography variant="caption" color="text.secondary">
                          Verified by {data.verifier_name}
                        </Typography>
                        <br/>
                        <Typography variant="caption" color="text.secondary">
                          Approved by {data.approver_name}
                        </Typography>
                      </>
                    )}
                    {data.status === 'cancelled' && (
                      <Typography variant="caption" color="text.secondary">
                        Cancelled by {data.cancelledBy}
                      </Typography>
                    )}

                  </CardContent>




              {roleTypeWithOutEmployee.includes(rolename) && data.status !="Rejected" && data.status!='Cancelled' && (canApproveAndVerify || canApproveOnly || canVerifyOnly) && (
                <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Stack direction='row' justifyContent='center' spacing={1} sx={{ mb: 1.5 }}>
                    {
                      data.approverId && data.verifierId ?  <DoneIcon fontSize='small' style={{ color: 'green' }} /> : <QueryBuilderIcon fontSize='small' style={{}} />

                    }

                    <Typography sx={{fontSize: '13px'}}>
                      {
                        data?.approverId === null && data?.verifierId === null && data?.status !== "Approved" ? 'Waiting for the Approval' :
                        data?.approverId  && data?.verifierId === null ? ' Approved And Waiting for the verifier' : 'Approved And Verified'
                      }
                    </Typography>
                  </Stack>

                  {((canApproveAndVerify && !data?.approverId && !data?.verifierId && data?.status !== "Approved") ||
                    (canApproveOnly && !data?.approverId) ||
                    (canVerifyOnly && !data?.verifierId)) && (
                    <Stack direction='row' justifyContent='center' spacing={1.5}>
                      <Button variant="outlined"
                        color='error'
                        sx={{ borderRadius: 2, minWidth: 100, textTransform: 'none' }}
                        startIcon={<CancelIcon fontSize="small" />}
                        onClick={() => handleOpenReasonDialog(data)}>Deny</Button>

                      {canApproveAndVerify && !data?.approverId && !data?.verifierId && data?.status !== "Approved" && (
                        <Button
                          variant='contained'
                          color='success'
                          sx={{ borderRadius: 2, minWidth: 100, textTransform: 'none' }}
                          startIcon={<CheckCircleIcon fontSize="small" />}
                          onClick={() => {
                            setConfirmOpen(true,)
                            setData({ ...data, isApproverOrVerifier: 'approveAndVerify' ,key: 'ApprovalPage',})
                          }}
                        >
                          Approve & Verify
                        </Button>
                      )}

                      {canApproveOnly && !data?.approverId && (
                        <Button
                          variant='contained'
                          color='success'
                          sx={{ borderRadius: 2, minWidth: 100, textTransform: 'none' }}
                          startIcon={<CheckCircleIcon fontSize="small" />}
                          onClick={() => {
                            setConfirmOpen(true,)
                            setData({ ...data, isApproverOrVerifier: 'approve',key: 'ApprovalPage', })
                          }}
                        >
                          Approve
                        </Button>
                      )}

                      {canVerifyOnly && !data?.verifierId && (
                        <Button
                          variant='contained'
                          color='success'
                          sx={{ borderRadius: 2, minWidth: 100, textTransform: 'none' }}
                          startIcon={<CheckCircleIcon fontSize="small" />}
                          onClick={() => {
                            setConfirmOpen(true,)
                            setData({ ...data, isApproverOrVerifier: 'verify',key: 'ApprovalPage', })
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

              {(data?.status === 'Rejected') &&
                <Box sx={{ mx: 2.5, my: 1.5, p: 1.5, bgcolor: '#fef2f2', borderRadius: 1.5, border: '1px solid #fecaca' }}>
                  <Stack direction='row' alignItems='center' gap={1} sx={{ mb: 0.5 }}>
                    <CancelIcon fontSize='small' sx={{ color: '#d32f2f' }} />
                    <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#d32f2f' }}>
                      {data?.status}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                      {data?.cancelledBy} {DateWithDayMonthFormat(data?.date)}
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 600, mb: 0.3 }}>Reason for Rejection:</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {data?.reason_for_rejection}
                  </Typography>
                </Box>
              }
              {(data?.status === 'Cancelled') &&
                <Box sx={{ mx: 2.5, my: 1.5, p: 1.5, bgcolor: '#fef2f2', borderRadius: 1.5, border: '1px solid #fecaca' }}>
                  <Stack direction='row' alignItems='center' gap={1} sx={{ mb: 0.5 }}>
                    <CancelIcon fontSize='small' sx={{ color: '#d32f2f' }} />
                    <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#d32f2f' }}>
                      {data?.status}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                      {data?.cancelledBy} {DateWithDayMonthFormat(data?.date)}
                    </Typography>
                  </Stack>
                  <Typography variant='body2' color='text.secondary'>
                    {data?.reason_for_rejection}
                  </Typography>
                </Box>
              }
              </Card>
      </Box>
          : []}
      {reasonDialog === true &&
        <Dialog
          maxWidth='sm'
         open={reasonDialog}
          onClose={handleReasonClose}
          fullWidth
          maxHeight='sm'

       >
         <DialogContent>
           <DialogContentText sx={{fontWeight:headerStyle.fontWeight}} id="loanapprovalcard-dialog-description">
             Reason is required to reject a loan request!
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
           <Button variant='contained' onClick={handleRejectSubmit} autoFocus>
             Submit
           </Button>
         </DialogActions>
       </Dialog>
      }
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
                ok_fun = {handleDelete}
                open={deleteOpen}
                type={'request'}
              />
              )}
      {open && (
                <LoanPdf
                  open={open}
                  handleClose={handleClose}
                 loanDownloadData={loanDownloadData}

                />
              )}
    </>
  );
}


function getPaymentName(data){

  if(!data?.Repayment_method) return ""
  if(data?.Repayment_method === 'AUTO_DEDUCTION_FROM_SALARY') return 'Auto Deduction From Salary';
  if(data?.Repayment_method === 'MANUAL_REPAYMENT') return 'Manual Repayment';
  return data?.Repayment_method;

}

export default LoanApprovalCard;
