import React, { useState, useEffect } from 'react';
import { Button, Typography, Grid, Box, Stack, Card, CardActions, CardContent, Avatar, Divider, ListItem, ListItemAvatar, ListItemText, Dialog, DialogContent, DialogContentText, TextField, DialogActions, IconButton } from '@mui/material';
import { grey } from '@mui/material/colors';
import { getsessionStorage } from 'pages/common/login/cookies';
import personIcon from '../../../assets/dashboardIcons/total-clients.svg';
import CancelIcon from '@mui/icons-material/Cancel';
import employeeIcon from '../../../assets/dashboardIcons/officer.svg';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ReasonDialog from './reasonDialog';
import CommonDialog from 'components/commonDialog';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import { useDispatch, useSelector } from 'react-redux';
import DoneIcon from '@mui/icons-material/Done';
import apiCalls from 'utils/apiCalls';
import { roleType } from 'utils/roleType';
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


function ClaimCard(props) {
    const [claimData, setClaimData] = useState({ attachment: '[]' });
    console.log("claimData", claimData)
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


    useEffect(() => {
        if (searchClaim?.data?.length > 0) {
            let emp_Names = searchClaim?.data?.map((v) => {
                return { name: v?.emp_name }
            })
            setEmpName(emp_Names)
        }
    }, [searchClaim?.data?.length])

    useEffect(() => {
        if (searchClaim?.data?.length > 0) {
            console.log("8888",searchClaim,props.id)
            const ApprovalData = props.id
                ? searchClaim?.data?.find((item) => (item.unique_key) === props.id )
                : searchClaim?.data[0];
            setClaimData(ApprovalData || {});
            let attachments = [];
            // console.log("ApprovalData",ApprovalData)
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











    const handleCancelClaim = async () => {

        const cancelledBy = storage?.first_name + (storage?.last_name ? ' ' + storage.last_name : '')


        const RejectedId = storage?.employee_id

        const claim = {
            searchString: "",
            fromdate: "",
            todate: "",
            employeeId: null,
            numPerPage :15,
            pageCount : 0,
            type:"claimsAndOthers",
           
        }

        const id =  claimData?.claim_id === null ? claimData?.unique_id_emp_location : claimData?.claim_id

        dispatch(updateClaimAndOtherStatusAction(
            id,
            { type: 'Cancel', cancelledBy: cancelledBy, reason: 'Cancelled by the initiator', from : claimData.type === 'claims' ? 'claims' : 'wfh' },
            (response) => {
                if (response.status === 200) {
                    dispatch(searchClaimAndOthersAction(claim, () => { }));
                }
            }
        ));

    };



    return (
        <>
            {searchClaim?.data?.length > 0 ? (
                <Grid container display='flex' spacing={3} direction='row'>
                    <Grid
                        size={{
                            lg: 1,
                            md: 1,
                            sm: 1.5,
                            xs: 2
                        }}>
                        <Avatar>
                            <img src={personIcon} height={60} width={40} alt="Person Icon" />
                        </Avatar>
                    </Grid>
                    <Grid
                        size={{
                            lg: 11,
                            md: 11,
                            sm: 10.5,
                            xs: 10
                        }}>
                    <Card sx={{ maxWidth: 600, backgroundColor:'#ECF6FC' }} style={{ border: "none", boxShadow: "none" }}>

                            {

                            claimData.type === 'claims' ?
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
                                            <Typography gutterBottom variant='h5' component='div' style={{ fontWeight: 'bold' }}
                                                sx={{ minWidth: '50px', fontFamily: 'Poppins, sans-serif' }}>
                                                {`${CapitalizeFirstLetter(claimData.full_name)}`}
                                            </Typography>
                                        </Grid>

                                    </Grid>
                                    {rolename === "Employee" || rolename === "Manager" && (claimData?.status === "Approved") && (
                                        <Grid
                                            style={{ display: 'flex', justifyContent: 'end' }}
                                            size={{
                                                lg: 10,
                                                md: 10
                                            }}>
                                            <CommonToolTip title='View'>
                                                <IconButton
                                                    onClick={() => handleOpen(claimData)}
                                                >
                                                    <VisibilityIcon />
                                                </IconButton>

                                            </CommonToolTip>
                                        </Grid>
                                    )}

                                </Grid>
                                <Typography style={{ backgroundColor: '#FFF', height: '90%', padding: '6px' }}
                                >
                                    <span>Category: {claimData.category}</span> <br />
                                    <br />

                                    <Typography variant='body2' color='text.secondary'>
                                        Bill Date: {DateWithDayMonthYearFormat(claimData.bill_date)}
                                    </Typography>
                                    <br />

                                    <Typography>
                                        Bill Amount: <Typography variant='body2' color='text.secondary'> {claimData.bill_amount}</Typography>  <Typography> Requested Claim Amount:</Typography>  <Typography variant='body2' color='text.secondary'> {claimData.claim_amount} </Typography>
                                    </Typography>
                                </Typography>
                                <br />
                                <Typography>Requested at {DateWithDayMonthFormatAndTime(claimData.createdAt)}
                                    <Typography style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {claimData.status === 'Approved' ? `Verified by ${claimData.verifier_name}` : claimData.status === 'cancelled' ? `Cancelled by ${claimData.cancelledBy}` : ""}
                                        <br />
                                        {claimData.status === 'Approved' ? `Approved by ${claimData.approver_name} ` : claimData.status === 'cancelled' ? `Cancelled by ${claimData.cancelledBy}` : ""}
                                    </Typography>


                                </Typography>
                                <br />
                                <Typography>
                                    Remarks
                                    <Typography variant='body2' color='text.secondary'>
                                        {claimData.remarks}
                                    </Typography>
                                </Typography>
                                <br />
                                {previews.length > 0 && (
                                    <>
                                        <Typography>Attachments</Typography>
                                        <Box display="flex" flexDirection="column" mt={2}>
                                            {previews.map((imageUrl, index) => (
                                                <Box key={index} display="flex" alignItems="center" mb={2}>
                                                    <img
                                                        src={imageUrl}
                                                        alt={`Attachment ${index}`}
                                                        style={{ maxWidth: '200px', maxHeight: '200px', marginRight: '10px' }}
                                                    />
                                                </Box>
                                            ))}
                                        </Box>
                                    </>
                                )}
                            </CardContent>

                            :
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
                                                    <Typography gutterBottom variant='h5' component='div' style={{ fontWeight: 'bold' }}
                                                        sx={{ minWidth: '50px', fontFamily: 'Poppins, sans-serif' }}>
                                                        {`${CapitalizeFirstLetter(claimData.full_name)}`}
                                                    </Typography>
                                                </Grid>

                                            </Grid>
                                        </Grid>
                                        <Typography style={{ backgroundColor: '#FFF', height: '90%', padding: '6px' }}
                                        >
                                            <span>Location Name: {claimData.employee_wfh_location_name}</span> <br />
                                            <br />

                                            <Typography variant='body2' color='text.secondary'>
                                                Requested For : {claimData.requestedFor === 'add' ? 'Add New Wfh location' : claimData.requestedFor === 'delete' ? 'Delete WFH location' : '-'}

                                            </Typography>
                                            <br />
                                            {
                                                claimData.requestedFor === 'delete' &&
                                                <Typography variant='body2' color='text.secondary'>
                                                    Reason : {claimData.requestedFor === 'delete' ? claimData.reason : '-'}

                                                </Typography>

                                            }





                                            <Typography>
                                                Latitude: <Typography variant='body2' color='text.secondary'> {claimData.lattitude}</Typography>

                                            </Typography>
                                            <br />
                                            <Typography>
                                                Longitude: <Typography variant='body2' color='text.secondary'> {claimData.longitude}</Typography>

                                            </Typography>
                                        </Typography>
                                        <br />
                                        <Typography>Requested at {DateWithDayMonthFormatAndTime(claimData.createdAt)}
                                            <Typography style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {claimData.status === 'Approved' ? `Verified by ${claimData.verifier_name}` : claimData.status === 'cancelled' ? `Cancelled by ${claimData.cancelledBy}` : ""}
                                                <br />
                                                {claimData.status === 'Approved' ? `Approved by ${claimData.approver_name} ` : claimData.status === 'cancelled' ? `Cancelled by ${claimData.cancelledBy}` : ""}
                                            </Typography>


                                        </Typography>
                                        <br />
                                        {/* <Typography>
                                Remarks
                                <Typography variant='body2' color='text.secondary'>
                                    {claimData.remarks}
                                </Typography>
                            </Typography> */}
                                        <br />

                                    </CardContent>
                            }
                          

                            <Divider />
                            {(claimData.status === 'Waiting for Approval') && isEmployee ? (
                                <Grid container spacing={2} style={{ padding: "15px" }}>
                                    {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                        <Stack direction="row" alignItems="center" gap={2}>
                                            <img src={employeeIcon} height={60} width={40} alt="Employee Icon" />
                                            <span style={{ fontWeight: 'bold' }}> Manager response </span>
                                        </Stack>
                                    </Grid> */}
                                    <Grid container spacing={2} style={{ padding: '15px 15px 15px 15px' }}>
                                        <Grid
                                            display='flex'
                                            justifyContent='flex-end'
                                            size={{
                                                lg: 6,
                                                md: 6,
                                                sm: 6,
                                                xs: 6
                                            }}>
                                            <Button variant='outlined' onClick={handleCancelClaim}>
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
                                        <br />
                                        {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} style={{ display: 'flex', justifyContent: 'center', color: 'gray', paddingLeft: '20%' }} >
                                            <Stack direction="row" alignItems="center" gap={1}>
                                                <QueryBuilderIcon style={{}} /> Pending for  approval
                                            </Stack>
                                        </Grid> */}
                                    </Grid>
                                </Grid>
                            ) : claimData.status === 'Approved' &&
                                claimData.status === 'Cancelled' &&
                                !roleType.includes(rolename) ? (
                                <ListItem></ListItem>
                            ) : (
                                []
                            )}


                            {(claimData?.status === 'Approved') && !roleType.includes(rolename) &&
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <img src={employeeIcon} height={60} width={40} />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={<p style={{ fontWeight: 'bold' }}> {CapitalizeFirstLetter(claimData?.approvedBy)} {DateWithDayMonthFormat(claimData?.updationDate)}</p>}
                                        secondary={
                                            <Stack direction="row" alignItems="center" gap={1}>
                                                <DoneIcon fontSize='small' style={{ color: 'green' }} />
                                                Approved
                                            </Stack>} />
                                </ListItem>
                            }
                            {
                                (claimData.status === 'Rejected') &&
                                <>
                                    <ListItem>
                                        <ListItemAvatar>
                                            <Avatar>
                                                <img src={employeeIcon} height={60} width={40} />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={<p style={{ fontWeight: 'bold' }}>  {claimData?.cancelledBy} {DateWithDayMonthFormat(claimData?.createdAt)}</p>}
                                            secondary={
                                                <Typography fontSize={18} >
                                                    <Stack direction='row' alignItems='center' gap={1}>
                                                        <CancelIcon fontSize='small' style={{ color: 'red' }} />
                                                        {claimData?.status}
                                                    </Stack>
                                                    <br />
                                                    <Typography> Reason for Rejection:</Typography>
                                                    <Typography variant='body2' color='text.secondary'>
                                                        {claimData?.reason_for_rejection}
                                                    </Typography>

                                                </Typography>

                                            } />
                                    </ListItem>
                                </>

                            }

                            {
                                claimData.status === 'Cancelled' &&
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <img src={employeeIcon} height={60} width={40} alt="Employee Icon" />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={<p style={{ fontWeight: 'bold' }}>  {claimData?.cancelledBy} {DateWithDayMonthFormat(claimData?.updationDate )}</p>}
                                        secondary={
                                            <Typography fontSize={18} >
                                                <Stack direction='row' alignItems='center' gap={1}>
                                                    <CancelIcon fontSize='small' style={{ color: 'red' }} />
                                                    {claimData?.status}
                                                </Stack>
                                                <br />
                                                <Typography variant='body2' color='text.secondary'>
                                                    {claimData?.reason_for_rejection}
                                                </Typography>
                                            </Typography>
                                        } />
                                </ListItem>

                            }
                            <CardActions></CardActions>
                        </Card>
                    </Grid>
                </Grid>
            ) : (
                <Typography
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        backgroundColor: '#ECF6FC',
                        height: '45px',
                        padding: '10px 0 0 0',
                    }}
                >
                    No record found
                </Typography>
            )}
            {open && (
                <ClaimPdf
                    open={open}
                    handleClose={handleClose}
                    claimDownloadData={claimDownloadData}

                />
            )}
        </>
    );
}

export default ClaimCard;
