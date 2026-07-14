import { Box, Button, Card, Dialog, DialogContent, Divider, Grid, IconButton, List, ListItem, ListItemButton, ListItemText, Stack, Tooltip, Typography } from "@mui/material";
import { createRef, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getQuotationApprovalsAction, getQuotationByIdAction, getQuotationConfigAction, updateSeenApproval } from "redux/actions/quotation_actions";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import QuotationApprovalCard from "./QuotationApprovalCard";
import CloseIcon from '@mui/icons-material/Close';
import AuditCheckListFilter from "pages/assets/Audits/AuditCheckListFilter";
import moment from "moment";
import { get_search_company_based_employee, getEmpbasecompanyFilterAction, set_search_company_based_employee } from "redux/actions/attendance_actions";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import ArrowLeftRoundedIcon from '@mui/icons-material/ArrowLeftRounded';
import ArrowRightRoundedIcon from '@mui/icons-material/ArrowRightRounded';

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

function QuotationApprovals(props){

    const dispatch = useDispatch()
    const observer = createRef()
    const {
        quotationReducer: {quotationApprovals, quotationApprovalsUnseenCount, quotationById, quotationConfig, quotationApprovalsTotalCount},
        attendanceReducer: {getCompanyBasedEmployeeFilter, searchCompanyBasedEmployeeFilter}
    } = useSelector(state => state)
    const {setModalTypeHandler, setLoaderStatusHandler} = useContext(CreateNewButtonContext)

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
    const [filterDetails, setFilterDetails] = useState({
        fromDate: '',
        toDate: '',
        searchVal: '',
        selectedEmployee: []
    })

    const resizeWindow = () => {
        const dynamicToolbarHeight = document.getElementsByClassName('MuiToolbar-root')[0]?.clientHeight || 70
        setWindowHeight(window.innerHeight)
        setToolbarHeight(dynamicToolbarHeight)
    }

    useEffect(() => {
        dispatch(getQuotationConfigAction())
        const data = {
            searchString: ''
        }
        dispatch(getEmpbasecompanyFilterAction(data))

        resizeWindow()
        window.addEventListener('resize', resizeWindow)
        return () => window.removeEventListener('resize', resizeWindow)

    }, [])

    useEffect(() => { (async () => {
        if(requestId === null){
            const payload = {
                fromDate: filterDetails.fromDate,
                toDate: filterDetails.toDate,
                searchVal: filterDetails.searchVal,
                selectedEmployee: filterDetails.selectedEmployee,
                pageCount: pagination.pageCount,
                numPerPage: pagination.numPerPage
            }
            dispatch(getQuotationApprovalsAction(payload, async(response) => {
                const res = await response
                if(res.length > 0){
                    setRequestId(res[0].requestId)
                    handleApprovalRequest(res[0])
                }
            }))
        }
    })();
}, [pagination.pageCount, requestId])

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
        if(Object.entries(approval).length > 0){
            setApproval(approval)
            setRequestId(approval.request_id)
            await dispatch(getQuotationByIdAction(approval.quotation_id))
            console.log(approval,'seen9999')
            if(approval.seen === 0){
                await dispatch(updateSeenApproval(approval.request_id))
            }
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
        setFilterDetails((prev) => ({...prev, fromDate: '', toDate: '', searchVal: null, selectedEmployee: []}))
        const data = {
            fromDate: '',
            toDate: '',
            searchVal: '',
            selectedEmployee: [],
            pageCount: 0,
            numPerPage: 15
        }
        dispatch(getQuotationApprovalsAction(data, async(response) => {
            const res = await response
            if(res.length > 0){
                setRequestId(res[0].requestId)
                handleApprovalRequest(res[0])
            }
        }))
        handleFilterClose()
    }

    const handleApply = () => {
        const data = {
            fromDate: filterDetails.fromDate,
            toDate: filterDetails.toDate,
            searchVal: filterDetails.searchVal,
            selectedEmployee: Array.isArray(filterDetails.selectedEmployee) ? filterDetails.selectedEmployee : [filterDetails.selectedEmployee],
            pageCount: 0,
            numPerPage: 15
        }
        dispatch(getQuotationApprovalsAction(data, async(response) => {
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
            searchVal: filterDetails.searchVal,
            selectedEmployee: filterDetails.selectedEmployee,
            pageCount: pageCount,
            numPerPage: pagination.numPerPage
        }
        dispatch(getQuotationApprovalsAction(payload, async(response) => {
            const res = await response
            if(res.length > 0){
                setRequestId(res[0].requestId)
                handleApprovalRequest(res[0])
            }
        }))
    }

    const handleNextPage = () => {
        const pageCount = pagination.pageCount + 1
        setPagination((prev) => ({...prev, pageCount: prev.pageCount + 1}))
        const payload = {
            fromDate: filterDetails.fromDate,
            toDate: filterDetails.toDate,
            searchVal: filterDetails.searchVal,
            selectedEmployee: filterDetails.selectedEmployee,
            pageCount: pageCount,
            numPerPage: pagination.numPerPage
        }
        dispatch(getQuotationApprovalsAction(payload, async(response) => {
            const res = await response
            if(res.length > 0){
                setRequestId(res[0].requestId)
                handleApprovalRequest(res[0])
            }
        }))
    }

    return (
        <>
            <Card >
                <Grid container>
                    <Grid
                        style={{borderRight: '2px #d9dadc solid'}}
                        size={{
                            lg: 3.5,
                            md: 4,
                            sm: 5,
                            xs: 12
                        }}>
                        <Grid container spacing={3} alignItems='center' p={3}>
                            {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                <Typography>Approvals</Typography>
                            </Grid> */}

                            {/* <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }}>
                                <Stack direction="row" 
                                        justifyContent="space-between"
                                        alignItems="left" 
                                        spacing={1} 
                                        sx={{flexWrap: { xs: 'wrap', sm: "wrap", md: 'nowrap', lg: 'nowrap' }}}
                                >
                                    <Button style={{ cursor: 'pointer', transition: 'color 0.3s ease, transform 0.3s ease', }}
                                            variant='outlined'
                                            disabled={pagination.pageCount === 0}
                                            onClick={() => handlePreviousPage()}
                                    >
                                        <ArrowLeftRoundedIcon />
                                    </Button>

                                    <Button style={{ cursor: 'pointer', transition: 'color 0.3s ease, transform 0.3s ease', }}
                                            variant='outlined'
                                            disabled={quotationApprovalsTotalCount === 0 || quotationApprovalsTotalCount <= pagination.numPerPage * (pagination.pageCount + 1)}
                                            onClick={() => handleNextPage()}
                                    >
                                        <ArrowRightRoundedIcon />
                                    </Button>
                                </Stack>
                            </Grid> */}
                            <Grid
                                size={{
                                    md: 12,
                                    xs: 12,
                                    lg: 12
                                }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="left" spacing={1}
                                sx={{
                                    flexWrap: { xs: 'wrap', sm: "wrap", md: 'nowrap', lg: 'nowrap' }
                                }}>
                                <Grid container>
                                    <Grid container size={6}>
                                        <Grid>
                                            <Button style={{ cursor: 'pointer', transition: 'color 0.3s ease, transform 0.3s ease', }}
                                            variant='outlined'
                                            disabled={pagination.pageCount === 0 || (props.showUnseenRequests && quotationApprovalsUnseenCount < 15)}
                                            onClick={() => handlePreviousPage()}
                                    >
                                        <ArrowLeftRoundedIcon />
                                    </Button>
                                        </Grid>
                                        <Grid>
                                        <Button style={{ cursor: 'pointer', transition: 'color 0.3s ease, transform 0.3s ease', }}
                                            variant='outlined'
                                            disabled={quotationApprovalsTotalCount === 0 || quotationApprovalsTotalCount <= pagination.numPerPage * (pagination.pageCount + 1)  ||
                                                (props.showUnseenRequests && quotationApprovalsUnseenCount < 15)}
                                            onClick={() => handleNextPage()}
                                    >
                                        <ArrowRightRoundedIcon />
                                    </Button>
                                        </Grid>
                                    </Grid>
                                    <Grid
                                        size={{
                                            lg: 6,
                                            md: 6,
                                            sm: 6,
                                            xs: 6
                                        }}>
                                <Stack direction='row' justifyContent='flex-end'>
                                    <Tooltip title='Filter'>
                                        <IconButton onClick={() => handleFilterOpen()}>
                                            <FilterAltIcon />
                                        </IconButton>
                                    </Tooltip>

                                    <IconButton>
                                        <VisibilityIcon />
                                        <Typography sx={{ml: 2, fontWeight: 600}}>{quotationApprovalsUnseenCount}</Typography>
                                    </IconButton>
                                </Stack>
                            </Grid>
                                </Grid>
                            </Stack>
                        </Grid>

                            {
                                (quotationApprovals.length > 0 && (!props.showUnseenRequests || quotationApprovals.some(f => f.seen === 0))) ? (
                                    <Grid
                                        style={{height: parseInt(windowHeight) - (parseInt(toolbarHeight) + 100), flexGrow: '1', overflow: 'auto'}}
                                        sx={{...scrollBar}}
                                        size={{
                                            lg: 12,
                                            md: 12,
                                            sm: 12,
                                            xs: 12
                                        }}>
                                        <nav aria-label="main mailbox folders">
                                            <List sx={{width: '100%', bgcolor: 'background.paper'}}>
                                            {
                                                quotationApprovals.map((approval, i) => (
                                                <ListItem key={approval.request_id}
                                                    {...(quotationApprovals.length === i + 1) && {ref: lastElementRef}}
                                                    {...(quotationApprovals.length === i + 1) && {'data-lastitemid': approval.request_id}}
                                                >
                                                    <ListItemButton selected={requestId === approval.request_id} onClick={() => handleApprovalRequest(approval)}>
                                                        <ListItemText
                                                            disableTypography
                                                            primary={
                                                            <Typography sx={{fontSize: '0.875rem', fontWeight: approval.seen === 0 ? 600 : 400}}>
                                                                {`Quote Number ${approval.quotation_number}`}
                                                            </Typography>
                                                            }
                                                            secondary={
                                                            <Typography sx={{fontWeight: approval.seen === 0 ? 600 : 400, fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between'}}>
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
                                        sx={{height: parseInt(windowHeight) - parseInt(toolbarHeight) + 100}}
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
                    </Grid>
                    {
                        (quotationApprovals.length > 0 && quotationById.length > 0 && (!props.showUnseenRequests || quotationApprovals.some(f => f.seen === 0))) ? (
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
                                        <Typography variant='h6' align='left'>Quotation Request</Typography>
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
                                    <QuotationApprovalCard
                                        quotation={quotationById[0].quotation}
                                        approval={approval}
                                        quotationConfig={quotationConfig}
                                        setRequestId={(id) => setRequestId(id)}
                                        handleApprovalRequest={handleApprovalRequest}
                                    />
                                </Box>
                            </Grid>
                        ) 
                        : (
                            <Grid
                                display='flex'
                                alignItems='center'
                                justifyContent='center'
                                sx={{height: parseInt(windowHeight) - parseInt(toolbarHeight) + 100}}
                                size={{
                                    lg: 8,
                                    md: 8,
                                    sm: 7,
                                    xs: 12
                                }}>
                                <Typography sx={{fontSize: '13px', fontWeight: 400}}>
                                    No Record Found
                                </Typography>
                            </Grid>
                        )
                    }
                </Grid>
            </Card>
            <Dialog open = {filterOpen}>
                <DialogContent sx={{p: 5, width: '400px'}}>
                    <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                        <IconButton onClick={() => handleFilterClose()}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <AuditCheckListFilter
                        fromDate = {filterDetails.fromDate}
                        toDate = {filterDetails.toDate}
                        handleDateChange = {handleDateChange}
                        searchVal = {filterDetails.searchVal}
                        setSearchValEmployeeFilter = {setSearchValEmployeeFilter}
                        requestSearch = {requestSearch}
                        value = {filterDetails.selectedEmployee}
                        setValue = {setSearchValue}
                        getCompanyBasedEmployeeFilter = {getCompanyBasedEmployeeFilter}
                        searchCompanyBasedEmployeeFilter = {searchCompanyBasedEmployeeFilter}
                        roleName = {'EMPLOYEE_FILTER'}
                        handleCancel = {handleCancel}
                        handleApply = {handleApply}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}

export default QuotationApprovals