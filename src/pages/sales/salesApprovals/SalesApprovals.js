import { Box, Button, Card, Dialog, DialogContent, Divider, Grid, IconButton, List, ListItem, ListItemButton, ListItemText, Stack, Tab, Tabs, Tooltip, Typography } from "@mui/material";
import { createRef, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getQuotationApprovalsAction, getQuotationByIdAction, getQuotationConfigAction, updateSeenApproval } from "redux/actions/quotation_actions";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
// import QuotationApprovalCard from "./QuotationApprovalCard";
import CloseIcon from '@mui/icons-material/Close';
import AuditCheckListFilter from "pages/assets/Audits/AuditCheckListFilter";
import moment from "moment";
import { get_search_company_based_employee, getEmpbasecompanyFilterAction, set_search_company_based_employee } from "redux/actions/attendance_actions";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import ArrowLeftRoundedIcon from '@mui/icons-material/ArrowLeftRounded';
import ArrowRightRoundedIcon from '@mui/icons-material/ArrowRightRounded';
import QuotationApprovalCard from "pages/crm/Quotation/oldQuotation/QuotationApprovalCard";
import { getSalesApprovalsIdAction, salesApprovalsAction, updateSeenSalesApproval } from "redux/actions/sales_actions";
import SalesApprovalCard from "./SalesApprovalCard";
import SalesApprovalFilter from "./SalesApprovalFilter";
import { getsessionStorage } from "pages/common/login/cookies";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DescriptionIcon from '@mui/icons-material/Description';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import PaymentApprovals from "./PaymentApprovals";
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
const scrollBar = {
    '&::-webkit-scrollbar': {
        width: 7,
    },
    '&::-webkit-scrollbar-track': {
    // backgroundColor: "#E0E0E0"
        '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)',
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#B2B2B2',
        borderRadius: 2,
        border: '2px solid white',
    },
}

function SalesApprovals(props){

    const dispatch = useDispatch()
    const observer = createRef()
    const {
        quotationReducer: { quotationApprovalsUnseenCount, quotationById, quotationConfig},
        attendanceReducer: {getCompanyBasedEmployeeFilter, searchCompanyBasedEmployeeFilter},
        salesReducer : {salesApprovals,salesApprovalsById,SalesApprovalsUnseenCount,quotationApprovalsTotalCount, SalesApprovalsTotalCount}
    } = useSelector(state => state)
    const {setModalTypeHandler, setLoaderStatusHandler} = useContext(CreateNewButtonContext)


    const quotationApprovals = [{
        "id": 56,
        "quotation_id": 78,
        "status": "Approved",
        "seen": 1,
        "quotation_number": "QNO/37",
        "approverId": 501,
        "verifierId": 501,
        "createdAt": "2025-03-10 13:58:06",
        "request_id": 56,
        "request_type": "quotation"
    }]

    const [pagination, setPagination] = useState({
        numPerPage: 15,
        pageCount: 0,
        lastId: 'MAX_NUMBER'
    })
    const [windowHeight, setWindowHeight] = useState(window.innerHeight)
    const [toolbarHeight, setToolbarHeight] = useState(document.getElementsByClassName('MuiToolbar-root')[0]?.clientHeight || 70)
    const [requestId, setRequestId] = useState(null)
    const [approval, setApproval] = useState([])
    const [filterOpen, setFilterOpen] = useState(false)
    const storage = getsessionStorage()
    const [filterDetails, setFilterDetails] = useState({
        fromDate: null,
        toDate: null,
        selectedCustomer: '',
        selectedSalesman : ''
    })
    const [tabIndex,setTabIndex] = useState(0)
    const resizeWindow = () => {
        const dynamicToolbarHeight = document.getElementsByClassName('MuiToolbar-root')[0]?.clientHeight || 70
        setWindowHeight(window.innerHeight)
        setToolbarHeight(dynamicToolbarHeight)
    }

    useEffect(() => {
 
        const data = {
            searchString: ''
        }
        dispatch(getEmpbasecompanyFilterAction(data))

        resizeWindow()
        window.addEventListener('resize', resizeWindow)
        return () => window.removeEventListener('resize', resizeWindow)

    }, [])



    useEffect(() => { (async () => {
            const data = {
                fromDate: filterDetails.fromDate,
                toDate: filterDetails.toDate,
                customer_id :filterDetails.selectedCustomer,
                selectedSalesman :filterDetails.selectedSalesman,
                pageCount: pagination.pageCount,
                numPerPage: pagination.numPerPage,
                tabIndex : 3

            }
            dispatch(salesApprovalsAction(data,async(response) => {
                const res = await response.data
                if(res.length > 0){
                    setRequestId(res[0].id)
                    handleApprovalRequest(res[0])
                }
            }))
        
    })();
}, [pagination.pageCount,tabIndex])



    const lastElementRef = (node) => {
        if(observer.current){
            observer.current.disconnect()
        }
        observer.current = new IntersectionObserver((entries) => {
        if(entries[0].isIntersecting){
            setPagination((prev) => ({
            ...prev,
            lastId: node.getAttribute('data-lastitemid')
            }))
        }
        })
    }

    const handleApprovalRequest = async(approval) => {
        if(approval){
            setApproval(approval)
            setRequestId(approval.id)
            const payload = {requestId : approval.request_id,tabIndex : tabIndex  }
            await dispatch(getSalesApprovalsIdAction({id : approval.id,tabIndex : tabIndex}))
            if(approval.seen === 0){
                await dispatch(updateSeenSalesApproval(payload))
            }
            // const payload1 = {
            //     fromDate: filterDetails.fromDate,
            //     toDate: filterDetails.toDate,
            //     searchVal: filterDetails.searchVal,
            //     selectedEmployee: filterDetails.selectedCustomer,
            //     selectedSalesman: filterDetails.selectedSalesman,
            //     pageCount: pagination.pageCount,
            //     numPerPage: pagination.numPerPage,
            //     tabIndex : 3

            // }
            // dispatch(salesApprovalsAction(payload1))
        }
    }

    const handleStatusIconAndColor = (status) => {
        if(status === 'Approved'){
            return <ThumbUpOffAltIcon fontSize='small' style={{color: 'green'}} />
        }
        else if(status === 'Pending'){
            return <PendingOutlinedIcon fontSize='small' style={{color: 'orange'}} />
        }
        else{
            return <ThumbDownOffAltIcon fontSize='small' style={{ color: 'red' }} />
        }
    }

    const handleFilterOpen = () => {
        setFilterOpen(true)
    }

    const handleFilterClose = () => {
        setFilterOpen(false)
    }

    const handleDateChange = (name, value) => {
        const date = value ? moment(value).format('YYYY-MM-DD') : null
        if(name === 'fromDate'){
            setFilterDetails((prev) => ({...prev, fromDate: date}))
        }
        else if(name === 'toDate'){
            setFilterDetails((prev) => ({...prev, toDate: date}))
        }
        else if(name === 'customer'){
            setFilterDetails((prev) => ({...prev, selectedCustomer: value}))
        }
        else if(name === 'salesman'){
            setFilterDetails((prev) => ({...prev, selectedSalesman: value}))
        }
    }

    const setSearchValEmployeeFilter = (val) => {
        setFilterDetails((prev) => ({...prev, searchVal: val}))
    }

    const requestSearch = (val) => {
        setFilterDetails((prev) => ({...prev, searchVal: val}))
        dispatch(set_search_company_based_employee([]))

        const data = {
            searchString: val
        }
        dispatch(get_search_company_based_employee(data, setModalTypeHandler, setLoaderStatusHandler))
    }

    const setSearchValue = (val) => {
        setFilterDetails((prev) => ({...prev, selectedEmployee: val || []}))
    }

    const handleCancel = async() => {
        setFilterDetails((prev) => ({...prev, fromDate: null, toDate: null,  selectedCustomer: '', selectedSalesman: ''}))
        const data = {
            fromDate: null,
            toDate: null,
            selectedCustomer : '',
            selectedSalesman : '',
            pageCount: 0,
            numPerPage: 15,
            tabIndex : 3

            
        }
        dispatch(salesApprovalsAction(data, async(response) => {
            const res = await response
            if(res.length > 0){
                setRequestId(res[0].requestId)
                handleApprovalRequest(res[0])
            }
        }))
        handleFilterClose()
    }

    const handleApply = () => {
        setPagination((prev) => ({...prev, pageCount: 0}))
        const data = {
            fromDate: filterDetails.fromDate,
            toDate: filterDetails.toDate,
            customer_id :filterDetails.selectedCustomer,
            selectedSalesman :filterDetails.selectedSalesman,
            pageCount: 0,
            numPerPage: 15,
            tabIndex : 3

        }
        dispatch(salesApprovalsAction(data, async(response) => {
            const res = await response
            if(res.length > 0){
                setRequestId(res[0].request_id)
                handleApprovalRequest(res[0])
            }
        }))
        handleFilterClose()
    }

    const handlePreviousPage = () => {
        const pageCount = pagination.pageCount - 1
        setPagination((prev) => ({...prev, pageCount: prev.pageCount - 1}))
        const payload = {
            fromDate: filterDetails.fromDate,
            toDate: filterDetails.toDate,
            selectedCustomer : filterDetails.selectedCustomer,
            selectedSalesman : filterDetails.selectedSalesman,
            pageCount: pageCount,
            numPerPage: pagination.numPerPage
        }
        // dispatch(getQuotationApprovalsAction(payload, async(response) => {
        //     const res = await response
        //     if(res.length > 0){
        //         setRequestId(res[0].requestId)
        //         handleApprovalRequest(res[0])
        //     }
        // }))
    }

    const handleNextPage = () => {
        const pageCount = pagination.pageCount + 1
        setPagination((prev) => ({...prev, pageCount: prev.pageCount + 1}))
        const payload = {
            fromDate: filterDetails.fromDate,
            toDate: filterDetails.toDate,
            selectedEmployee: filterDetails.selectedCustomer,
            selectedSalesman: filterDetails.selectedSalesman,
            pageCount: pageCount,
            numPerPage: pagination.numPerPage
        }
        // dispatch(getQuotationApprovalsAction(payload, async(response) => {
        //     const res = await response
        //     if(res.length > 0){
        //         setRequestId(res[0].requestId)
        //         handleApprovalRequest(res[0])
        //     }
        // }))
    }

    const handleTabChange = (event, newValue) => {
        let type;
        switch (newValue) {
            case 0:
                type = '1';
                break;
            case 1:
                type = '2';
                break;
            case 2:
                type = '5';
                break;
            default:
                type = '1';
        }
        // this.setState({ tabIndex: newValue, type });
        setTabIndex(newValue)
    };

    return (
        <>
            <Grid container spacing={3} >
                <Grid
                    size={{
                        xs: 12,
                        md: 4,
                        lg: 4
                    }}>
                    <Card>
                    <Grid container spacing={3} alignItems='center' p={3} height='calc(100vh - 70px)' style={{ overflow: 'auto' }} sx={{ ...scrollBar }}>
                    {storage.company_type !== 3 && (<Grid
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                                                                <Tabs
                                                                    value={tabIndex}
                                                                    onChange={handleTabChange}
                                                                    variant="fullWidth"
                                                                    aria-label="tabs example"
                                                                    sx={{ minWidth: '50px', fontFamily: 'Poppins, sans-serif' }}>
                                                                    <Tab icon={<ExitToAppIcon style={{ color: 'black' }} />} label="Sales " sx={{ fontSize: '12px', fontWeight: 600 }} />
                                                                    <Tab icon={<CreditScoreIcon style={{ color: 'black' }} />} label="Payment " sx={{ fontSize: '12px', fontWeight: 600 }} />
                                                                </Tabs>
                                                            </Grid>)}
                                                            
                        <Grid
                            size={{
                                md: 12,
                                xs: 12,
                                lg: 12
                            }}>
                             <Grid
                                 mb={'10px'}
                                 size={{
                                     lg: 12,
                                     md: 12,
                                     sm: 12,
                                     xs: 12
                                 }}>

                        <Tabs
                            value={tabIndex}
                            onChange={handleTabChange}
                            variant="fullWidth"
                            aria-label="tabs example"
                            sx={{ fontFamily: 'Poppins, sans-serif' }}>
                            <Tab icon={<ExitToAppIcon style={{ color: 'black' }} />} label="Approvals" sx={{ fontSize: '12px', fontWeight: 600 }} />
                        </Tabs>
                    </Grid>
                       <Stack
                       direction="row" 
                       justifyContent="space-between" 
                       alignItems="center" 
                       spacing={1}
                       sx={{ 
                        width: '100%',
                        flexWrap: { xs: 'wrap', md: 'nowrap' },
                         mb: 2
                         }}>
                            <Stack direction="row" spacing={1}>
                                <Button
                                variant='outlined'
                                disabled={pagination.pageCount === 0}
                               onClick={() => handlePreviousPage()}>
                                <ArrowLeftRoundedIcon />
                                </Button>
                                <Button
                                variant='outlined'
                                disabled={quotationApprovalsTotalCount === 0 || quotationApprovalsTotalCount <= pagination.numPerPage * (pagination.pageCount + 1)}
                                onClick={() => handleNextPage()}>
                                    <ArrowRightRoundedIcon />
                                    </Button>
                                    </Stack>

                      <Stack
                      direction='row' 
                      justifyContent='flex-end' 
                      alignItems='center' 
                      spacing={0.5}
                      sx={{ flexGrow: 1 }}
                      >
                        <Tooltip title='Filter'>
                            <IconButton onClick={() => handleFilterOpen()}>
                                <FilterAltIcon />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title='Total Count'>
                            <IconButton>
                                <FormatListNumberedIcon />
                                <Typography sx={{ ml: 1, fontWeight: 600 }}>{SalesApprovalsTotalCount}</Typography>
                            </IconButton>
                        </Tooltip>

                 {(storage.role_name !== 'Salesman' && storage.role_name !== 'Sales Manager' && storage.role_name !== 'Team Lead') && (
                    <Tooltip title='Unseen Count'>
                        <IconButton>
                            <VisibilityIcon />
                            <Typography sx={{ ml: 1, fontWeight: 600 }}>{SalesApprovalsUnseenCount}</Typography>
                            </IconButton>
                            </Tooltip>)}
                     </Stack>
                    </Stack>
                    </Grid>

                        {
                            (salesApprovals.length > 0 && (!props.showUnseenRequests)) ? (
                                <Grid
                                    minHeight={'calc(100vh - 230px)'}
                                    size={{
                                        lg: 12,
                                        md: 12,
                                        sm: 12,
                                        xs: 12
                                    }}>
                                    <nav aria-label="main mailbox folders">
                                        <List sx={{width: '100%', bgcolor: 'background.paper'}}>
                                        {
                                            salesApprovals?.map((approval, i) => (
                                            <ListItem key={approval.request_id}
                                                {...(salesApprovals.length === i + 1) && {ref: lastElementRef}}
                                                {...(salesApprovals.length === i + 1) && {'data-lastitemid': approval.request_id}}
                                            >
                                                <ListItemButton selected={requestId === approval.id } onClick={() => handleApprovalRequest(approval)}>
                                                    <ListItemText
                                                        disableTypography
                                                        primary={
                                                        <Typography sx={{fontSize: '0.875rem', fontWeight: approval.seen === 0 && (storage.role_name !== 'Salesman' || storage.role_name !== 'Sales Manager' || storage.role_name !== 'Team Lead' )   ? 600 : 400}}>
                                                            {  ` ${approval.salesman} - ${moment(approval.req_date).format('DD/MM/YYYY')}`} 
                                                        </Typography>
                                                        }
                                                        secondary={
                                                        <Typography sx={{fontWeight: approval.seen === 0 && (storage.role_name !== 'Salesman' || storage.role_name !== 'Sales Manager' || storage.role_name !== 'Team Lead' )  ? 600 : 400, fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between'}}>
                                                            {approval.status}
                                                            <span style={{display: 'flex', justifyContent: 'end'}}>{handleStatusIconAndColor(approval.status)}</span>
                                                        </Typography>
                                                        }
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                            ))
                                        }
                                        </List>
                                    </nav>
                                </Grid>
                            ) : 
                            (
                                
                                <Grid
                                    display='flex'
                                    justifyContent='center'
                                    alignItems='center'
                                    minHeight={'calc(100vh - 230px)'}
                                    size={{
                                        lg: 12,
                                        md: 12,
                                        sm: 12,
                                        xs: 12
                                    }}>
                                    <Typography sx={{fontSize: '13px', fontWeight: 400}}>
                                        No Records Found
                                    </Typography>
                                </Grid>
                            )
                        }

                    </Grid>
                    </Card>
                </Grid>
                {
                    console.log(approval, salesApprovalsById, 'salesApprovalsById')
                }
                { tabIndex === 0 && (
                    (salesApprovalsById?.length > 0 && salesApprovals .length > 0) ? (
                             <Grid
                                 size={{
                                     xs: 12,
                                     md: 8,
                                     lg: 8
                                 }}>
                        <Card sx={{ height: '100%', width: '100%' }}>
                        <Grid
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                            <Grid container spacing={3} display='flex' alignItems='center' p={3}>
                                <Grid
                                    size={{
                                        lg: 6,
                                        md: 6,
                                        sm: 6,
                                        xs: 6
                                    }}>
                                    <Typography variant='h6' align='left'>{approval.request_type === 'Receipt' ? 'Receipt Approval Request' : 'Sales Order Approval Request'}</Typography>
                                </Grid>

                                <Grid
                                    display='flex'
                                    justifyContent='flex-end'
                                    size={{
                                        lg: 6,
                                        md: 6,
                                        sm: 6,
                                        xs: 6
                                    }}>
                                    <Stack direction='row' alignItems='center' gap={1}>
                                        {handleStatusIconAndColor(approval.status)}
                                        <Typography variant='body2' align='right'>{approval.status}</Typography>
                                    </Stack>
                                </Grid>

                                <Grid
                                    size={{
                                        lg: 12,
                                        md: 12,
                                        sm: 12,
                                        xs: 12
                                    }}>
                                    <Divider />
                                </Grid>
                            </Grid>

                            <Box>
                                <SalesApprovalCard
                                    salesApprovals={salesApprovalsById[0]}
                                    approval={approval}
                                    quotationConfig={quotationConfig}
                                    setRequestId={(id) => setRequestId(id)}
                                    handleApprovalRequest={handleApprovalRequest}
                                    tabIndex = {tabIndex}
                                    type= "salesApproval"
                                    filterDetails = {filterDetails}
                                    pagination = {pagination}
                                />
                            </Box>
                        </Grid>
                        </Card>
                        </Grid>
                    ) 
                    : (
                        <Grid
                            size={{
                                xs: 12,
                                md: 8,
                                lg: 8
                            }}>
                        <Card sx={{ height: '100%', width: '100%' }}>
                        <Grid
                            display='flex'
                            alignItems='center'
                            justifyContent='center'
                            minHeight={'calc(100vh - 230px)'}
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                            
                            <Typography sx={{fontSize: '13px', fontWeight: 400}}>
                                No Record Found
                            </Typography>
                        </Grid>
                        </Card>
                         </Grid>
                    )
                )
                }

{ tabIndex === 1 &&  (
                    (salesApprovalsById?.length > 0 && salesApprovals .length > 0) ? (
                        <Grid
                            size={{
                                xs: 12,
                                md: 8,
                                lg: 8
                            }}>
                        <Card sx={{ height: '100%', width: '100%' }}>
                        <Grid
                            size={{
                                lg: 8,
                                md: 8,
                                sm: 7,
                                xs: 12
                            }}>
                            <Grid container spacing={3} display='flex' alignItems='center' p={3}>
                                <Grid
                                    size={{
                                        lg: 6,
                                        md: 6,
                                        sm: 6,
                                        xs: 6
                                    }}>
                                    <Typography variant='h6' align='left'>Payment Approval Request</Typography>
                                </Grid>

                                <Grid
                                    display='flex'
                                    justifyContent='flex-end'
                                    size={{
                                        lg: 6,
                                        md: 6,
                                        sm: 6,
                                        xs: 6
                                    }}>
                                    <Stack direction='row' alignItems='center' gap={1}>
                                        {handleStatusIconAndColor(approval.status)}
                                        <Typography variant='body2' align='right'>{approval.status}</Typography>
                                    </Stack>
                                </Grid>

                                <Grid
                                    size={{
                                        lg: 12,
                                        md: 12,
                                        sm: 12,
                                        xs: 12
                                    }}>
                                    <Divider />
                                </Grid>
                            </Grid>

                            <Box>
                                <PaymentApprovals
                                    salesApprovals={salesApprovalsById[0]}
                                    approval={approval}
                                    quotationConfig={quotationConfig}
                                    setRequestId={(id) => setRequestId(id)}
                                    handleApprovalRequest={handleApprovalRequest}
                                />
                            </Box>
                        </Grid>
                         </Card>
                        </Grid>
                    ) 
                    : (
                        <Grid
                            size={{
                                xs: 12,
                                md: 8,
                                lg: 8
                            }}>
                        <Card sx={{ height: '100%', width: '100%' }}>
                        <Grid
                            display='flex'
                            alignItems='center'
                            justifyContent='center'
                            minHeight={'calc(100vh - 230px)'}
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                            <Typography sx={{fontSize: '13px', fontWeight: 400}}>
                                No Record Found
                            </Typography>
                        </Grid>
                           </Card>
                         </Grid>
                    )
)
                }
            </Grid>
            <Dialog open = {filterOpen}>
                        <DialogContent sx={{p: 5, width: '400px'}}>
                            <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                                <IconButton onClick={() => handleFilterClose()}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                            <SalesApprovalFilter
                                fromDate = {filterDetails.fromDate}
                                toDate = {filterDetails.toDate}
                                handleDateChange = {handleDateChange}
                                selectedCustomer = {filterDetails.selectedCustomer}
                                selectedSalesman = {filterDetails.selectedSalesman}
                                handleCancel = {handleCancel}
                                handleApply = {handleApply}
                            />
                        </DialogContent>
                    </Dialog>
        </>
    );
}

export default SalesApprovals
