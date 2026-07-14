import React, { useState, useEffect, useRef, useContext } from 'react';
import _ from 'lodash';
import { Button, TextField, Typography, Grid, Box, Stack, Dialog, DialogContent, DialogContentText, DialogActions, IconButton } from '@mui/material';
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
import CancelIcon from '@mui/icons-material/Cancel';
import ImageIcon from '@mui/icons-material/Image';
import { getMonthName, getDateFormat, getDateTimeFormat } from '../../../utils/getTimeFormat';
import Cookies from 'universal-cookie';
import employeeIcon from '../../../assets/dashboardIcons/officer.svg'
import ErrorIcon from '@mui/icons-material/Error';
import personIcon from '../../../assets/dashboardIcons/total-clients.svg'
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
import { roleType } from 'utils/roleType';
import CommonDialog from 'components/commonDialog';
import { DeleteOutlined } from '@mui/icons-material';
import CommonToolTip from 'components/ToolTip';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LoanPdf from './LoanPdf';


function LoanCard(props) {
    const textRef = useRef(null);
    const [data, setData] = useState([]);
    const [pages, setPages] = useState(0)
    const [searchVal, setSearchVal] = useState('')
    const dispatch = useDispatch()
    const [empNames, setEmpName] = useState([]);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteOpen, setdeleteOpen] = useState(false)
    const { LoanReducer: { loansdetail, searchloandata }, UserRoleReducer: { loginRole, userRole } } = useSelector(state => state)

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

    const firstDay = getDateFormat(new Date(date.getFullYear(), date.getMonth(), 1));
    const lastDay = getDateFormat(new Date(date.getFullYear(), date.getMonth() + 1, 0));
    const [filteredValue, setFilteredValue] = useState({
        tenure: "", frmdate: firstDay, todate: lastDay, emp_name: "", status: "", numPerPage: pageSize,
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
        if (props.searchloandata?.length > 0 && props.id !== '') {

            let ApprovalData = props.searchloandata?.filter((f) => f.id === props.id)[0] || []
            setData({
                ...ApprovalData,
                date: null,
                employeeId: null,
            });
        } else {
            let ApprovalData = props.searchloandata[0] || []
            setData({
                ...ApprovalData,
                date: null,
                employeeId: null,
            });

        }
    }, [props.searchloandata, props.id])

    const primary = grey[300];


    const handleClose = () => {
        setOpen(false);
    };



    const DateWithDayMonthFormat = (date) => {
        let now = new Date(date);
        let day = now.getDate();
        let month = now.toLocaleString('default', { month: 'short' })
        // return month+' '+day
        return day + ' ' + month
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



    const handleCancelLoan = (data) => {
console.log('ghj',data)
        const canceledBy = storage?.first_name + (storage?.last_name ? ' ' + storage.last_name : '')
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(updateLoanStatusAction(data?.id, { type: 'Cancel', Rejectedby: canceledBy, reason: 'Cancelled by the initiator' }, setModalTypeHandler, setLoaderStatusHandler, () => { }, (response) => {
                if (response === 200) {
                    // await this.props.getLoanListAction(data, context.setLoaderStatusHandler, context.setModalStatusHandler),
                    const payload = {
                        tenure: "", frmdate: '', todate: '', emp_name: "", status: "", numPerPage: null,
                        pageCount: '',
                        searchString: '',
                        date: null,
                        employeeId: null
                      }
                    dispatch(getLoanListAction(payload, () => { }))

                }
            })),
            // dispatch(searchLoanAction(data, () => {}))
        )

    }





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
            {props.searchloandata?.length > 0 ? <Grid container display='flex' spacing={3}>
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
                    <Card sx={{ maxWidth: 600, backgroundColor: '#ECF6FC' }} style={{ border: "none", boxShadow: "none" }}>
                        <CardContent>
                            <Grid container >
                                <Grid container>
                                    <Grid
                                        size={{
                                            lg: 8,
                                            md: 8,
                                            sm: 8,
                                            xs: 8
                                        }}>
                                        <Typography gutterBottom variant="h5" component="div" style={{ fontWeight: 'bold' }}>
                                            {`${CapitalizeFirstLetter(data?.full_name)}`}
                                        </Typography>
                                    </Grid>

                                </Grid>
                                {rolename === "Employee" || rolename === "Manager" && (data?.status === "Approved") && (
                                    <Grid
                                        style={{ display: 'flex', justifyContent: 'end' }}
                                        size={{
                                            lg: 10,
                                            md: 10
                                        }}>
                                        <CommonToolTip title='View'>
                                            <IconButton
                                                onClick={() => handleOpen(data)}
                                            >
                                                <VisibilityIcon />
                                            </IconButton>

                                        </CommonToolTip>
                                    </Grid>
                                )}
                            </Grid>
                            <Typography>
                                <h3>{`Requested Amount : ${data?.Required_Amount}`}</h3>
                            </Typography>
                            <Typography style={{ backgroundColor: '#FFF', height: '90%', padding: '6px' }}>
                                <Typography >
                                    Reason
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {data?.Reason !== null ? data?.Reason : ''}
                                </Typography>
                                {/* <Typography  variant="body2" color="text.secondary">{DateWithDayMonthYearFormat(data?.fromDate) + (data.allDay === 0 ? ' - ' + DateWithDayMonthYearFormat(data?.toDate) : '')}</Typography> */}
                                {/* <Typography  variant="body2" color="text.secondary">{data?.allDay === 0 ? 'All day' : (data.startTime + ' - ' + data.endTime)}</Typography> */}
                                <Typography >
                                    Repayment Method
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {getPaymentName(data)}
                                </Typography>
                                <Typography >
                                    Tenure period
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
  {data?.tenure !== null ? `${data.tenure} month` : ""}
</Typography>
                            </Typography>
                            {/* <Typography>
                    {data.status==='Approved'?`verified and approved by ${data.approvedBy}`:data.status==='cancelled'?`cancelled by ${data.cancelledBy}`:""}
                      </Typography>                    <br /> */}
                            <Typography>
                                Requested at {DateWithDayMonthFormatAndTime(data?.createdAt)}
                                <br />
                                {data.status === 'Approved' ? `Verified by ${data.verifier_name}` : data.status === 'cancelled' ? `Cancelled by ${data.cancelledBy}` : ""}
                                <br />
                                {data.status === 'Approved' ? `Approved by ${data.approver_name}` : data.status === 'cancelled' ? `Cancelled by ${data.cancelledBy}` : ""}
                            </Typography>
                            <br />

                        </CardContent>
                        <Divider />

                        {data?.status === 'Waiting for Approval' && !roleType.includes(rolename) ?
                            <Grid container spacing={2} style={{ padding: "15px" }}>
                                {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                    <Stack direction="row" alignItems="center" gap={2}>
                                        <img src={employeeIcon} height={60} width={40} />
                                        <span style={{ fontWeight: 'bold' }}> Manager response </span>
                                    </Stack>
                                </Grid> */}
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
                                            onClick={() => handleCancelLoan(data)}
                                        >
                                            Cancel
                                        </Button>
                                    </Grid>
                                    <Grid
                                        justifyContent='flex-start'
                                        alignItems='flex-start'
                                        size={{
                                            lg: 6
                                        }}>
                                        <Button sx={{
                                            boxShadow: 'none',
                                            '&:hover': {
                                                backgroundColor: '#0A8FDC',
                                                color: 'white',
                                                cursor: 'default',
                                                boxShadow: 'none'
                                            },
                                        }} disableRipple variant='contained'>Pending</Button>
                                    </Grid>
                                </Grid>
                                {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} style={{ display: 'flex', justifyContent: 'center', color: 'gray' }} >
                                    <Stack direction="row" alignItems="center" gap={1}>
                                        <QueryBuilderIcon style={{}} /> Pending for final approval
                                    </Stack>
                                </Grid> */}

                            </Grid> : data?.status === 'Approved' && rolename !== 'Administrator'
                        }



                        {(data?.status === 'Approved') && !roleType.includes(rolename) &&
                            <ListItem>
                                <ListItemAvatar>
                                    <Avatar>
                                        <img src={employeeIcon} height={60} width={40} />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={<p style={{ fontWeight: 'bold' }}> {CapitalizeFirstLetter(data?.approvedBy)} {DateWithDayMonthFormat(data?.createdAt)}</p>}
                                    secondary={
                                        <Stack direction="row" alignItems="center" gap={1}>
                                            <DoneIcon fontSize='small' style={{ color: 'green' }} />
                                            Approved
                                        </Stack>} />
                            </ListItem>
                        }
                       
                        {(data?.status === 'Cancelled' || data?.status === 'Rejected' ) &&
                            <>
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <img src={employeeIcon} height={60} width={40} />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={<p style={{ fontWeight: 'bold' }}>  {data?.cancelledBy} {DateWithDayMonthFormat(data?.createdAt)}</p>}
                                        secondary={
                                            <Typography fontSize={18} >
                                                {/* <Stack direction="row" alignItems="center" gap={1}>
                        <CancelIcon fontSize='small' style={{ color: 'red' }} />
                        Cancelled
                    </Stack> */}
                                                <Stack direction='row' alignItems='center' gap={1}>
                                                    <CancelIcon fontSize='small' style={{ color: 'red' }} />
                                                    {data?.status}
                                                </Stack>
                                                <br />
                                                <Typography variant='body2' color='text.secondary'>
                                                    {data?.reason_for_rejection}
                                                </Typography>

                                            </Typography>

                                        } />
                                </ListItem>
                            </>
                        }
                    </Card>
                </Grid>
            </Grid>
                : []}
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


function getPaymentName(data) {

    if (!data?.Repayment_method) return ""
    if (data?.Repayment_method === 'AUTO_DEDUCTION_FROM_SALARY') return 'Auto Deduction From Salary';
    if (data?.Repayment_method === 'MANUAL_REPAYMENT') return 'Manual Repayment';
    return data?.Repayment_method;

}

export default LoanCard;
