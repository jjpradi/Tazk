import { Card, CardContent, Grid, TableContainer, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Stack, Dialog, DialogContent, TextField, DialogTitle, DialogActions, Divider } from '@mui/material';
import { PropTypes } from 'prop-types';
import { useContext, useState } from 'react';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import { getsessionStorage } from 'pages/common/login/cookies';
import DoneIcon  from '@mui/icons-material/Done';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import { roleTypeWithOutEmployee } from 'utils/roleType';
import { Box, minWidth } from '@mui/system';
import { quotationApprovedAction, quotationRejectedAction } from 'redux/actions/quotation_actions';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { receiptEntry, salesApprovalsAction, salesApprovalsRejectAction } from 'redux/actions/sales_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';

function SalesApprovalCard(props){

    const storage = getsessionStorage()
    const dispatch = useDispatch()
    const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext)

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
                requestId : props.approval.request_id,
                tabIndex : props.tabIndex,
                order_id:props.salesApprovals.order_id || null
            }
            await dispatch(salesApprovalsRejectAction(payload,async(response) => {
                console.log('closingggg',response)
                
                const res = await response.data
                console.log(res,props.approval,'datasincomming2222',res.length)
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
        if(props.type == "salesApproval"){
                const data = {
                fromDate: props.filterDetails.fromDate,
                toDate: props.filterDetails.toDate,
                customer_id :props.filterDetails.selectedCustomer,
                selectedSalesman :props.filterDetails.selectedSalesman,
                pageCount: props.pagination.pageCount,
                numPerPage: props.pagination.numPerPage,
                tabIndex : 3

            }
            dispatch(salesApprovalsAction(data))
            }
        }
        else{
            setReasonError('Reason is Required')
        }
    }

    const handleConfirm = async() => {
        // console.log("props.salesApprovals",props.salesApprovals)
        const payload = {
            type: approveVerifyType,
            id: props.approval.id,
            type2 : 'salesApprovals',
            tabIndex : props.tabIndex,
            sale_id : props.salesApprovals?.sale_id || null,
            order_id:props.salesApprovals?.order_id || null
        }
        await dispatch(quotationApprovedAction(payload, props.approval.request_id, async(response) => {
            const res = await response
            console.log(res,props.approval,'datasincomming')
            if(res.length > 0){
                const approval = res.filter((r) => r.id === props.approval.id)
                props.handleApprovalRequest(approval[0])
                props.setRequestId(approval[0].id)
            }
            else{
                props.handleApprovalRequest({})
                props.setRequestId(null)
            }
            if(props.type == "salesApproval"){
                const data = {
                fromDate: props.filterDetails.fromDate,
                toDate: props.filterDetails.toDate,
                customer_id :props.filterDetails.selectedCustomer,
                selectedSalesman :props.filterDetails.selectedSalesman,
                pageCount: props.pagination.pageCount,
                numPerPage: props.pagination.numPerPage,
                tabIndex : 3

            }
            dispatch(salesApprovalsAction(data))
            }
            setConfirmDialogOpen(false)
        }))
    }

    console.log(props.approval.id,props.quotationConfig,'quotationConfig',props.salesApprovals,props.approval)
    console.log(props.approval,'approverFlag',props.salesApprovals)

    const Tdata = JSON.parse(props.salesApprovals.sales_items)
    const total = JSON.parse(props.salesApprovals.total)
    console.log(Tdata,'TdataTdata')

    const receiptData = props.approval.receipt_details ? JSON.parse(props.approval.receipt_details) : null
    console.log(receiptData, 'receiptData')

    const handleProceedWithReceipt = () => {
        dispatch(receiptEntry({...receiptData, paymentApproved: true, request_id: props.approval.id}, () => {}, setModalTypeHandler, setLoaderStatusHandler, async(status, response) => {
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
        }))
    }

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
                                {/* <Grid size={{ xs: 8, sm: 8, md: 8, lg: 8 }}>
                                    <Typography gutterBottom component='div' sx={{fontSize: '13px', fontWeight: 600}}>
                                        {`Customer : ${props.salesApprovals.full_name}`}
                                    </Typography>
                                </Grid> */}

                                {
                                    props.approval.request_type === 'Receipt' ? (
                                    <Grid
                                        sx={{ mt: 5, fontSize: '12px' }}
                                        size={{
                                            lg: 12,
                                            md: 12,
                                            sm: 12,
                                            xs: 12
                                        }}>
                                        <Typography>{`Customer : ${props.salesApprovals.customer_name}`}</Typography>
                                        <Typography>{`Request Date : ${moment(props.approval.req_date).format('DD/MM/YYYY hh:mm A')}`}</Typography>
                                        <Typography>{`Total Received : ₹ ${receiptData.receiptData.totalReceived.toFixed(2)}`}</Typography>
                                        <Typography>{`Payment Mode : ${receiptData.referenceNumber[0].payment_type}`}</Typography>
                                        <Typography>{`Cheque No. / Bank : ${receiptData.referenceNumber[0].chequeNumber}/${receiptData.referenceNumber[0].bankName}`}</Typography>
                                    </Grid>

                                    )
                                    : (
                                    <Grid
                                        sx={{ mt: 5, fontSize: '12px' }}
                                        size={{
                                            lg: 12,
                                            md: 12,
                                            sm: 12,
                                            xs: 12
                                        }}>
                                        <Typography>{`Customer : ${props.salesApprovals.customer_name}`}</Typography>
                                        <Typography>{`So Number : ${props.salesApprovals.so_number}`}</Typography>
                                        <Typography>{`Request Date : ${moment(props.salesApprovals.req_date).format('DD/MM/YYYY hh:mm A')}`}</Typography>
                                        <Typography >
                                            {`Grand Total : ₹ ${Tdata?.reduce((acc, curr) => acc + parseFloat(curr.sub_total || 0), 0).toFixed(2)}`}
                                        </Typography>
                                    </Grid>

                                    )
                                }

                                {
                                    props.approval.request_type === 'Receipt' ? <></>
                                    : (
                                        <Grid
                                            sx={{ mt: 5 }}
                                            size={{
                                                lg: 12,
                                                md: 12,
                                                sm: 12,
                                                xs: 12
                                            }}>
                                            <TableContainer component={Paper} variant="outlined">
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell align="center">Product</TableCell>
                                                            <TableCell align="center">
                                                                <Box sx={{ textAlign: 'right', width: '100%' }}>
                                                                    Item Unit Price
                                                                </Box>
                                                            </TableCell>
                                                            {/* <TableCell align="center">
                                                                <Box sx={{ textAlign: 'right', width: '100%' }}>
                                                                    Item Cost Price
                                                                </Box>
                                                            </TableCell> */}
                                                            <TableCell align="center">Quantity</TableCell>
                                                            <TableCell align="center">GST Amount</TableCell>
                                                            <TableCell align="center">
                                                                <Box sx={{ textAlign: 'right', width: '100%' }}>
                                                                    Sub-Total
                                                                </Box>
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {Tdata?.map((e, index) => {
                                                            const price = parseFloat(e?.item_unit_price || e?.unit_price || 0);

                                                            const taxGrp = e?.taxes?.filter((x) => x?.tax_group === "IGST");
                                                            const taxRate = taxGrp?.[0]?.tax_rate || 0;
                                                            const igstAmount = price * (taxRate / 100);
                                                            const totalWithIGST = (price + igstAmount) * e?.quantity;
        
                                                            let basePrice = price * e?.quantity;
                                                            let gstAmount = igstAmount;
                                                            let subtotal = totalWithIGST;

                                                            return (
                                                            <TableRow key={index}>
                                                                <TableCell align="left">{e.name}</TableCell>
                                                                <TableCell align="right">
                                                                    <Box sx={{ textAlign: 'right', width: '100%' }}>
                                                                        {e?.item_unit_price || e?.unit_price}
                                                                    </Box>
                                                                </TableCell>
                                                                {/* <TableCell align="center">
                                                                    <Box sx={{ textAlign: 'right', width: '100%' }}>
                                                                        {e?.item_cost_price === 0 ? 0 : e?.item_cost_price || e?.cost_price}
                                                                    </Box>
                                                                </TableCell> */}
                                                                <TableCell align="right">{e.quantity}</TableCell>
                                                                <TableCell align="right">
                                                                    <Box sx={{ textAlign: 'right', width: '100%' }}>{gstAmount.toFixed(2)}</Box></TableCell>
                                                                <TableCell align="right">
                                                                    <Box sx={{ textAlign: 'right', width: '100%' }}>
                                                                            {e?.sub_total !== undefined && e?.sub_total !== null
                                                                                ? Number(e.sub_total).toFixed(2)
                                                                                : ''}
                                                                    </Box>
                                                                </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Grid>
                                    )
                                }
                                    <Grid
                                        sx={{ mt: 7 }}
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
                                                    <Typography>- {props.approval.request_type === 'Receipt' ? 'Receipt Approval has been rejected' : 'Sale Approval has been Rejected'}</Typography>                                           
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

                                                    {
                                                        (props.approval.status !== 'Rejected' && storage.role_name ==='Salesman' && props.approval.request_type === 'Receipt' && props.approval.approverId && props.approval.verifierId && props.approval.new_receipt_id === null) && 
                                                        <Grid
                                                            display='flex'
                                                            justifyContent='center'
                                                            size={{
                                                                lg: 12,
                                                                md: 12,
                                                                sm: 12,
                                                                xs: 12
                                                            }}>
                                                            <Button variant='contained' color='success' onClick={handleProceedWithReceipt}>
                                                                Proceed with Receipt
                                                            </Button> 
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

SalesApprovalCard.propTypes = {
    quotation: PropTypes.object,
    approval: PropTypes.object,
    quotationConfig: PropTypes.array,
    setRequestId: PropTypes.func,
    handleApprovalRequest: PropTypes.func
}

export default SalesApprovalCard