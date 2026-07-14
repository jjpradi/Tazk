import { Card, CardContent, Grid, TableContainer, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Stack, Dialog, DialogContent, TextField, DialogTitle, DialogActions, Divider } from '@mui/material';
import { PropTypes } from 'prop-types';
import { useState } from 'react';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import { getsessionStorage } from 'pages/common/login/cookies';
import DoneIcon  from '@mui/icons-material/Done';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import { roleTypeWithOutEmployee } from 'utils/roleType';
import { Box, minWidth } from '@mui/system';
import { quotationApprovedAction, quotationRejectedAction } from 'redux/actions/quotation_actions';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { salesApprovalsRejectAction } from 'redux/actions/sales_actions';

function PaymentApprovals(props){

    const storage = getsessionStorage()
    const dispatch = useDispatch()

    const [reasonDialogOpen, setReasonDialogOpen] = useState(false)
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
    const [reason, setReason] = useState(null)
    const [reasonError, setReasonError] = useState(null)
    const [approveVerifyType, setApproveVerfiyType] = useState('')
    
    let approverFlag = false
    let verifierFlag = false

    props.quotationConfig.forEach((qc) => {
        if(qc.type === 'Approver' && qc.employee_id === storage.employee_id){
            approverFlag = true
        }
        if(qc.type === 'Verifier' && qc.employee_id === storage.employee_id){
            verifierFlag = true
        }
    })

    const handleReasonChange = (event) => {
        const val = event.target.value
        setReason(val)
        if(val !== '' && val !== null){
            setReasonError(null)
        }
        else{
            setReasonError('Reason is Required')
        }
    }

    const handleReasonSubmit = async(event) => {
        event.preventDefault()
        const isValid = reason !== null && reason !== 'null' && reason !== ''
        if(isValid){
            setReasonError(null)
            const payload = {
                reason: reason, 
                quotation_id: props.salesApprovals.id,
                id :  props.approval.id,
                requestId : props.approval.request_id
            }
            await dispatch(salesApprovalsRejectAction(payload,async(response) => {
                const res = await response
                if(res.length > 0){
                    const approval = res.filter((r) => r.id === props.approval.id)
                    props.handleApprovalRequest(approval[0])
                    props.setRequestId(approval[0].id)
                }
                else{
                    props.handleApprovalRequest({})
                    props.setRequestId(null)
                }
                setReasonDialogOpen(false)
                setReason(null)
        }))
        }
        else{
            setReasonError('Reason is Required')
        }
    }

    const handleConfirm = async() => {
        const payload = {
            type: approveVerifyType,
            id: props.approval.id,
            type2 : 'salesApprovals'
        }
        await dispatch(quotationApprovedAction(payload, props.approval.request_id, async(response) => {
            const res = await response
            if(res.length > 0){
                const approval = res.filter((r) => r.id === props.approval.id)
                props.handleApprovalRequest(approval[0])
                props.setRequestId(approval[0].id)
            }
            else{
                props.handleApprovalRequest({})
                props.setRequestId(null)
            }
            setConfirmDialogOpen(false)
        }))
    }

    const Tdata = JSON.parse(props?.salesApprovals?.receivable_items)
    const chequeData = JSON.parse(props?.salesApprovals?.cheque_details)
    const payment_details = JSON.parse(props?.salesApprovals?.Payment_Tdata)
console.log("caecvecvcv");


    return (
        <>
            <Grid container spacing={3} direction='row'>
                <Grid
                    display='flex'
                    justifyContent='center'
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <Card sx={{maxWidth: 600, width: {lg: 600, md: 600, sm: 400, xs:230}}} style={{border: 'none', boxShadow: 'none', direction: 'row', backgroundColor: '#ECF6FC'}}>
                        <CardContent>
                            <Grid container>
                                <Grid
                                    size={{
                                        lg: 8,
                                        md: 8,
                                        sm: 8,
                                        xs: 8
                                    }}>
                                    <Typography gutterBottom component='div' sx={{fontSize: '13px', fontWeight: 600}}>
                                        {`PO NUMBER : ${props.salesApprovals.po_number}`}
                                    </Typography>
                                </Grid>

                                <Grid
                                    sx={{mt: 5, fontSize: '12px'}}
                                    size={{
                                        lg: 12,
                                        md: 12,
                                        sm: 12,
                                        xs: 12
                                    }}>
                                    <Typography>{`Customer : ${props?.salesApprovals?.full_name}`}</Typography>
                                    <Typography>{`Cheque Amount: ${props?.salesApprovals?.total}`}</Typography>

                                </Grid>
                                
                                <Grid
                                    sx={{ margin: '10px' }}
                                    size={{
                                        lg: 12,
                                        md: 12,
                                        sm: 12,
                                        xs: 12
                                    }}>
                                    <TableContainer component={Paper} variant='outlined' >
                                        <Table size='small'>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align='center'>Payment Type</TableCell>
                                                    <TableCell align='center'>
                                                         <Box sx={{ textAlign: 'right', width: '100%' }}>
                                                            Payment Amount
                                                             </Box>
                                                            </TableCell>
                                                    {/* <TableCell align='center'>Credit days</TableCell> */}
                                                </TableRow>
                                            </TableHead>

                                            <TableBody>
                                            {   payment_details?.map((e)=>(
                                                    <TableRow key={e.payment_type}>
                                                        <TableCell align='left'>{e.payment_type}</TableCell>
                                                        <TableCell align='center'>
                                                             <Box sx={{ textAlign: 'right', width: '100%' }}>
                                                               {e.payment_amount}
                                                                </Box>
                                                                </TableCell>
                                                        {/* <TableCell align='right'>{props.salesApprovals.due_date}</TableCell> */}
                                                    </TableRow>
                                                )) }
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                                
                                    <Grid
                                        sx={{ margin: '10px' }}
                                        size={{
                                            lg: 12,
                                            md: 12,
                                            sm: 12,
                                            xs: 12
                                        }}>
                                    <TableContainer component={Paper} variant='outlined' >
                                        <Table size='small'>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align='center'>
                                                            <Box sx={{ textAlign: 'right', width: '100%' }}>
                                                                Due Amount
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align='center'>Due Date</TableCell>
                                                        <TableCell align='center'>Invoice Number</TableCell>
                                                        <TableCell align='center'>
                                                            <Box sx={{ textAlign: 'right', width: '100%' }}>
                                                                Total
                                                            </Box>
                                                        </TableCell>
                                                    {/* <TableCell align='center'>Credit days</TableCell> */}
                                                </TableRow>
                                            </TableHead>

                                            <TableBody>
                                            {   Tdata?.map((e)=>(
                                                    <TableRow key={e.invoice_number}>
                                                        <TableCell align='left'>
                                                             <Box sx={{ textAlign: 'right', width: '100%' }}>
                                                                {e.due_amount}
                                                                 </Box>
                                                                </TableCell>
                                                        <TableCell align='center'>{e.due_date}</TableCell>
                                                        <TableCell align='right'>{e.invoice_number}</TableCell>
                                                        <TableCell align='center'>
                                                             <Box sx={{ textAlign: 'right', width: '100%' }}>
                                                                {e.total_amount}
                                                                 </Box>
                                                                </TableCell>
                                                        {/* <TableCell align='right'>{props.salesApprovals.due_date}</TableCell> */}
                                                    </TableRow>
                                                )) }
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                               

                                <Grid
                                    sx={{mt: 7}}
                                    size={{
                                        lg: 12,
                                        md: 12,
                                        sm: 12,
                                        xs: 12
                                    }}>
                                    <Divider />
                                </Grid>

                                <Grid
                                    sx={{mt: 5}}
                                    size={{
                                        lg: 12,
                                        md: 12,
                                        sm: 12,
                                        xs: 12
                                    }}>
                                    <Grid container spacing={2}>

                                        {/* WHEN STATUS IS REJECTED */}
                                        {
                                            props.approval.status === 'Rejected' && 
                                            <Grid
                                                display='flex'
                                                justifyContent='center'
                                                size={{
                                                    lg: 12,
                                                    md: 12,
                                                    sm: 12,
                                                    xs: 12
                                                }}>
                                                <Stack direction='row' alignItems='center' gap={1}>
                                                    <ThumbDownOffAltIcon fontSize='small' />
                                                    <Typography>Reason :  {'('}{props.salesApprovals.reason}{')'} </Typography>   
                                                    <Typography>Sale Approval has been Rejected</Typography>                                           
                                                </Stack>
                                            </Grid>
                                        }

                                                    {
                                                        (props.approval.status !== 'Rejected' && storage.role_name ==='Salesman') &&
                                                        <Grid
                                                            display='flex'
                                                            justifyContent='center'
                                                            style={{color: 'grey'}}
                                                            size={{
                                                                lg: 12,
                                                                md: 12,
                                                                sm: 12,
                                                                xs: 12
                                                            }}>
                                                            <Stack direction='row' alignItems='center' gap={1}>
                                                                {props.approval.approverId !== null && props.approval.verifierId !== null ? <DoneIcon fontSize='small' style={{color: 'green'}} /> : <QueryBuilderIcon fontSize='small' style={{color: 'grey'}} />}

                                                                <Typography>
                                                                    {
                                                                        
                                                                       ( props.approval.approverId === null && props.approval.verifierId === null) ? 'Waiting For the Approval'
                                                                        : (props.approval.approverId && props.approval.verifierId === null) ? 'Approved and Waiting for the Verifier' : 'Approved and Verified'
                                                                    }
                                                                </Typography>
                                                            </Stack>
                                                        </Grid>
                                                    }

                                        {/* ADMINISTRATOR PRIVILEGES */}
                                        {
                                            (props.quotationConfig.length === 0 &&( storage.role_name === 'Administrator' )) || (approverFlag === true && verifierFlag === true && (storage.role_name === 'Administrator' )) || 
                                            (approverFlag === false && verifierFlag === false && (storage.role_name === 'Administrator' ) ) || (approverFlag === true && verifierFlag === true && storage.role_name === 'Manager') ?
                                            (
                                                <Grid container spacing={2}>
                                                    {
                                                        props.approval.status !== 'Rejected' && 
                                                        <Grid
                                                            display='flex'
                                                            justifyContent='center'
                                                            style={{color: 'grey'}}
                                                            size={{
                                                                lg: 12,
                                                                md: 12,
                                                                sm: 12,
                                                                xs: 12
                                                            }}>
                                                            <Stack direction='row' alignItems='center' gap={1}>
                                                                {props.approval.approverId !== null && props.approval.verifierId !== null ? <DoneIcon fontSize='small' style={{color: 'green'}} /> : <QueryBuilderIcon fontSize='small' style={{color: 'grey'}} />}

                                                                <Typography>
                                                                    {
                                                                        
                                                                       ( props.approval.approverId === null && props.approval.verifierId === null) ? 'Waiting For the Approval'
                                                                        : (props.approval.approverId && props.approval.verifierId === null) ? 'Approved and Waiting for the Verifier' : 'Approved and Verified'
                                                                    }
                                                                </Typography>
                                                            </Stack>
                                                        </Grid>
                                                    }

                                                    {
                                                        !props.approval.approverId && !props.approval.verifierId && props.approval.status === 'Pending' &&
                                                        <Grid container spacing={3} display='flex' justifyContent='center' sx={{mt: 2}}>
                                                            <Grid>
                                                                <Button variant='contained' color='error' onClick={() => setReasonDialogOpen(true)}>
                                                                    Deny
                                                                </Button>
                                                            </Grid>

                                                            <Grid>
                                                                <Button variant='contained' color='success' onClick={() => {setApproveVerfiyType('approveVerify'); setConfirmDialogOpen(true)}}>
                                                                    Approve & Verify
                                                                </Button>
                                                            </Grid>
                                                        </Grid>
                                                    }
                                                </Grid>
                                            ) : (
                                            roleTypeWithOutEmployee.includes(storage.role_name) && props.approval.status === 'Pending' &&
                                            <Grid container spacing={2}>
                                                <Grid
                                                    display='flex'
                                                    justifyContent='center'
                                                    style={{color: 'grey'}}
                                                    size={{
                                                        lg: 12,
                                                        md: 12,
                                                        sm: 12,
                                                        xs: 12
                                                    }}>
                                                    <Stack direction='row' alignItems='center' gap={1}>
                                                        {props.approval.approverId && props.approval.verifierId ? <DoneIcon fontSize='small' style={{color: 'green'}} /> : <QueryBuilderIcon fontSize='small' style={{color: 'grey'}} />}

                                                        <Typography>
                                                            {
                                                                props.approval.approverId === null && props.approval.verifierId === null ? 'Waiting For the Approval'
                                                                : props.approval.approvalId && props.approval.verifierId === null ? 'Approved and Waiting for the Verifier' : 'Approved and Verified'
                                                            }
                                                        </Typography>
                                                    </Stack>
                                                </Grid>

                                                {
                                                    approverFlag && !props.approval.approverId && props.approval.status === 'Pending' &&
                                                    <Grid container spacing={3} display='flex' justifyContent='center' sx={{mt: 2}}>
                                                        <Grid>
                                                            <Button variant='contained' color='error' onClick={() => setReasonDialogOpen(true)}>
                                                                Deny
                                                            </Button>
                                                        </Grid>

                                                        <Grid>
                                                            <Button variant='contained' color='success' onClick={() => {setApproveVerfiyType('approve'); setConfirmDialogOpen(true)}}>
                                                                Approve
                                                            </Button>
                                                        </Grid>
                                                    </Grid>
                                                }

                                                {
                                                    verifierFlag && !props.approval.verifierId && props.approval.status === 'Pending' &&
                                                    <Grid container spacing={3} display='flex' justifyContent='center' sx={{mt: 2}}>
                                                        <Grid>
                                                            <Button variant='contained' color='error' onClick={() => setReasonDialogOpen(true)}>
                                                                Deny
                                                            </Button>
                                                        </Grid>

                                                        <Grid>
                                                            <Button variant='contained' color='success' onClick={() => {setApproveVerfiyType('verify'); setConfirmDialogOpen(true)}}>
                                                                Verify
                                                            </Button>
                                                        </Grid>
                                                    </Grid>
                                                }
                                            </Grid>
                                            )
                                        }
                                    </Grid>
                                </Grid>


                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            {/* REASON DIALOG */}
            <Dialog open={reasonDialogOpen} maxWidth='sm' fullWidth>
                <DialogTitle>Reason</DialogTitle>

                <DialogContent>
                    <TextField
                        value={reason}
                        required
                        fullWidth
                        variant='filled'
                        label='Reason'
                        onChange={handleReasonChange}
                        error={reasonError !== null}
                        helperText={reasonError !== null ? reasonError : ''}
                    />
                </DialogContent>

                <DialogActions>
                    <Button variant='contained' color='error' onClick={() => {
                        setReasonDialogOpen(false)
                        setReason(null)
                        setReasonError(null)
                    }}>
                        Close
                    </Button>

                    <Button variant='contained' onClick={handleReasonSubmit}>
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
            {/* CONFIRMATION DIALOG */}
            <Dialog open={confirmDialogOpen} maxWidth='sm' fullWidth>
                <DialogTitle>Confirmation</DialogTitle>

                <DialogContent>
                    <Typography sx={{fontSize: '13px', color: 'grey'}}>
                        Are you sure to approve?
                    </Typography>
                </DialogContent>

                <DialogActions>
                    <Button variant='contained' color='error' onClick={() => {
                        setConfirmDialogOpen(false)
                    }}>
                        Close
                    </Button>

                    <Button variant='contained' onClick={handleConfirm}>
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

PaymentApprovals.propTypes = {
    quotation: PropTypes.object,
    approval: PropTypes.object,
    quotationConfig: PropTypes.array,
    setRequestId: PropTypes.func,
    handleApprovalRequest: PropTypes.func
}

export default PaymentApprovals