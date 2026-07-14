import { Box, Card, Dialog, DialogContent, Divider, Grid, IconButton, List, ListItem, ListItemButton, ListItemText, Stack, Tooltip, Typography } from "@mui/material"
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { createRef, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AssetAuditCheckList from "./AssetAuditCheckList";
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import { getAllCheckListAction, getAuditCheckListBasedOnAsset, ListAuditDataByCheckListId, updateSeenChecklistAction } from "redux/actions/audit_actions";
import AuditCheckListFilter from "./AuditCheckListFilter";
import moment from "moment";
import { get_search_company_based_employee, getEmpbasecompanyFilterAction, set_search_company_based_employee } from "redux/actions/attendance_actions";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { getsessionStorage } from 'pages/common/login/cookies';
const storage = getsessionStorage();
const isAdmin = storage?.role_name === 'Administrator'

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

function AuditRequest(){

    const dispatch = useDispatch()
    const observer = createRef()
    const {
        Audits: {
            filterAuditCheckList,
            auditUnseenCount,
        },
        attendanceReducer: {
            getCompanyBasedEmployeeFilter,
            searchCompanyBasedEmployeeFilter
        }
    } = useSelector((state) => state)
    const {setModalTypeHandler, setLoaderStatusHandler} = useContext(CreateNewButtonContext)
    const[checkListId, setCheckListId] = useState('')
    const[checkList, setCheckList] = useState([])
    const[checkListFields, setCheckListFields] = useState([])
    const[auditDate, setAuditDate] = useState('')
    const [status, setStatus] = useState('')
    const[remarks, setRemarks] = useState('')
    const[assetId, setAssetId] = useState('')
    const[checklistName, setChecklistName] = useState('')
    const[imageCount, setImageCount] = useState('')
    const[required, setRequired] = useState('')
    const[assetGroup, setAssetGroup] = useState('')
    const[assetType,setAssetType] = useState('')
    const [auditImages, setAuditImages] = useState([])
    const [query, setQuery] = useState({
        pageCount: 0,
        numPerPage: 20,
        lastId: 'MAX_NUMBER'
    })
    const[filterDetails, setFilterDetails] = useState({
        dialogOpen: false,
        fromDate: '',
        toDate: '', 
        searchVal: '',
        selectedEmployee: []
    })
    const [windowHeight, setWindowHeight] = useState(window.innerHeight)
    const [toolbarHeight, setToolbarHeight] = useState(document.getElementsByClassName('MuiToolbar-root')[0]?.clientHeight || 70)

    const resizeWindow = () => {
        const dynamicToolbarHeight_val = document.getElementsByClassName('MuiToolbar-root')[0]?.clientHeight || 70
        setWindowHeight(window.innerHeight)
        setToolbarHeight(dynamicToolbarHeight_val)
    }
    const [showUnseenRequests, setShowUnseenRequests] = useState(false);
    const [filteredRequests, setFilteredRequests] = useState([]);
    
    useEffect(() => {
        const data = {
            searchString: ''
        }
        dispatch(getEmpbasecompanyFilterAction(data))
        resizeWindow();
        window.addEventListener("resize", resizeWindow);
        return () => window.removeEventListener("resize", resizeWindow)
    }, [])

    const buildListPayload = (overrides = {}) => {
        const sel = filterDetails.selectedEmployee
        let selectedEmployee = []
        if (Array.isArray(sel)) {
            selectedEmployee = sel.map((e) => e?.employee_id).filter(Boolean)
        } else if (sel?.employee_id) {
            selectedEmployee = [sel.employee_id]
        }
        return {
            fromDate: filterDetails.fromDate,
            toDate: filterDetails.toDate,
            searchVal: filterDetails.searchVal,
            selectedEmployee,
            unseen: showUnseenRequests,
            ...overrides
        }
    }

    useEffect(() => {
        if (checkListId !== '') return
        setCheckList([])
        dispatch(getAllCheckListAction(buildListPayload(), (response) => {
            const res = response?.data
            if (Array.isArray(res) && res.length > 0) {
                const first = res[0]
                handleAuditRequest(first.checkList_id, first.asset_id, first.status, first.checklist_name, first.asset_group_id, first.asset_type_id, first.imageCount, first.required)
            }
        }))
    }, [checkListId, showUnseenRequests])

    const lastElementRef = (node) => {
        if(observer.current){
            observer.current.disconnect()
        }
        observer.current = new IntersectionObserver((entries) => {
            if(entries[0].isIntersecting){
                setQuery({
                    ...query,
                    lastId: node.getAttribute('data-lastitemid')
                })
            }
        })
    }

    useEffect(() => {
        const filtered = showUnseenRequests
            ? filterAuditCheckList.filter((request) => request.isSeen === 0)
            : filterAuditCheckList;
        setFilteredRequests(filtered);
    }, [showUnseenRequests, filterAuditCheckList]);

    const toggleVisibility = () => {
        const unseen = !showUnseenRequests
        setShowUnseenRequests(unseen)
        setCheckListId('')
        dispatch(getAllCheckListAction(buildListPayload({ unseen }), (response) => {
            const res = response?.data
            if (Array.isArray(res) && res.length > 0) {
                const first = res[0]
                handleAuditRequest(first.checkList_id, first.asset_id, first.status, first.checklist_name, first.asset_group_id, first.asset_type_id, first.imageCount, first.required)
            }
        }))
    }

    const handleStatusIconAndColor = (status) => {
        if (status === 'Done') {
            return <ThumbUpOffAltIcon fontSize='small' style={{ color: 'green' }} />
        }
        
        if (status === 'Pending') {
            return <PendingOutlinedIcon fontSize='small' style={{ color: 'orange' }} />
        }
    }

    const handleAuditRequest = async (id, asset_id, status, checklist_name, group, type, imageCount, required) => {
        const seenPayload = buildListPayload()
        delete seenPayload.unseen
        dispatch(updateSeenChecklistAction(id, seenPayload))

        setStatus(status)
        setCheckListId(id)
        setAuditImages([])
        setAuditDate(null)
        setRemarks('')
        setAssetId(asset_id)
        setChecklistName(checklist_name)
        setImageCount(imageCount)
        setRequired(required)
        setAssetGroup(group)
        setAssetType(type)

        let checkListFieldsObj = {}
        await dispatch(getAuditCheckListBasedOnAsset(asset_id, { status, checkList_id: id }, (response) => {
            if (Array.isArray(response) && response.length > 0) {
                const fields = response[0]?.checkList_fields || []
                setCheckListFields(fields)
                fields.forEach((field) => {
                    checkListFieldsObj[field.name] = null
                })
            } else {
                setCheckListFields([])
            }
        }))
        setCheckList([checkListFieldsObj])

        if (status === 'Done') {
            dispatch(ListAuditDataByCheckListId(id, (response) => {
                if (!response) return
                setAuditImages(response.images || [])
                setCheckListId(response.checkList_id)
                let checkListData = {}
                try {
                    checkListData = response.checkList_values ? JSON.parse(response.checkList_values) : {}
                } catch (_e) {
                    checkListData = {}
                }
                setCheckList([checkListData])
                setAuditDate(response.audit_date)
                setRemarks(response?.audit_remarks)
                setChecklistName(response.checklist_name)
                setImageCount(response.imageCount)
                setRequired(response.required)
                setAssetGroup(response.asset_group_id)
                setAssetType(response.asset_type_id)
            }))
        }
    }

    const handleDateChange = (name, value) => {
        const date = value ? moment(value).format("YYYY-MM-DD") : null
        if(name === 'fromDate'){
            setFilterDetails({...filterDetails, fromDate: date})
        }
        else if(name === 'toDate'){
            setFilterDetails({...filterDetails, toDate: date})
        }
    }

    const handleDialogClose = () => {
        setFilterDetails((prev) => ({...prev, dialogOpen: false}))
    }

    const setSearchValEmployeeFilter = (val) => {
        setFilterDetails({...filterDetails, searchVal: val})
    }

    const requestSearchEmployee = (val) => {
        setFilterDetails({...filterDetails, searchVal: val})
        dispatch(set_search_company_based_employee([]))

        let data = {
            searchString: val
        }
        dispatch(get_search_company_based_employee(data, setModalTypeHandler, setLoaderStatusHandler))
    }

    const setSearchValue = (val) => {
        setFilterDetails({...filterDetails, selectedEmployee: val})
    }

    const handleCancel = () => {
        setFilterDetails((prev) => ({ ...prev, fromDate: '', toDate: '', searchVal: null, selectedEmployee: [] }))
        setShowUnseenRequests(false)
        setCheckListId('')
        dispatch(getAllCheckListAction({
            fromDate: '',
            toDate: '',
            searchVal: null,
            selectedEmployee: [],
            unseen: false
        }, (response) => {
            const res = response?.data
            if (Array.isArray(res) && res.length > 0) {
                const first = res[0]
                handleAuditRequest(first.checkList_id, first.asset_id, first.status, first.checklist_name, first.asset_group_id, first.asset_type_id, first.imageCount, first.required)
            }
        }))
        handleDialogClose()
    }

    const handleApply = () => {
        setCheckListId('')
        dispatch(getAllCheckListAction(buildListPayload(), (response) => {
            const res = response?.data
            if (Array.isArray(res) && res.length > 0) {
                const first = res[0]
                handleAuditRequest(first.checkList_id, first.asset_id, first.status, first.checklist_name, first.asset_group_id, first.asset_type_id, first.imageCount, first.required)
            }
        }))
        handleDialogClose()
    }

    return (
        <div style={{
      padding: '0 10px',
      height: '90vh',
      overflowY: 'auto',
      msOverflowStyle: 'none',
      scrollbarWidth: 'none',  
    }}
    className="hide-scrollbar"
  >
    <style>
      {`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}
    </style>
            <Card sx={{ minHeight : '500px' }}>
                <Grid container display='flex' flexDirection='row' spacing={3} p='6px 10px'>
                    <Grid
                        style={{borderRight: '2px #d9dadc solid'}}
                        size={{
                            lg: 3.5,
                            md: 4,
                            sm: 5,
                            xs: 12
                        }}>
                        <Grid container spacing={3} alignItems='center' p={3}>
                            <Grid
                                size={{
                                    lg: 6,
                                    md: 6,
                                    sm: 6,
                                    xs: 6
                                }}>
                                <Typography variant='h3'>Audit Request</Typography>
                            </Grid>

                            <Grid
                                size={{
                                    lg: 6,
                                    md: 6,
                                    sm: 6,
                                    xs: 6
                                }}>
                                <Stack direction='row' justifyContent='flex-end'>
                                    {/* <ButtonGroup>
                                        <Button variant={buttonType === '1' ? 'contained' : 'outlined'} onClick={() => setButtonType('1')}>Audits</Button>
                                    </ButtonGroup> */}

                                    <Tooltip title='Filter'>
                                        <IconButton onClick={() => setFilterDetails({...filterDetails, dialogOpen: true})}>
                                            <FilterAltIcon />
                                        </IconButton>
                                    </Tooltip>

                                    <IconButton onClick={toggleVisibility}>
                                        {showUnseenRequests ? (
                                            <VisibilityOffIcon color="action" />
                                        ) : (
                                            <VisibilityIcon color="action" />
                                        )}
                                        <Typography sx={{ml: 2, fontWeight: 600}}>{auditUnseenCount}</Typography>
                                    </IconButton>
                                </Stack>
                            </Grid>

                            {
                                filterAuditCheckList.length > 0 ? (
                                    <Grid
                                        style={{height: parseInt(windowHeight) - (parseInt(toolbarHeight) + 100), flexGrow: '1', overflow: 'auto' }}
                                        sx={{ ...scrollBar }}
                                        size={{
                                            lg: 12,
                                            md: 12,
                                            sm: 12,
                                            xs: 12
                                        }}>
                                        <nav aria-label="main mailbox folders">
                                            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                                                {
                                                    filteredRequests.map((checkList, i) => (
                                                        <ListItem key={checkList?.checkList_id}
                                                            {...(filterAuditCheckList.length === i + 1) && {ref: lastElementRef}}
                                                            {...(filterAuditCheckList.length === i + 1) && {'data-lastitemid': checkList?.checkList_id}}
                                                        >
                                                            <ListItemButton selected={checkListId === checkList?.checkList_id} onClick={() => handleAuditRequest(checkList?.checkList_id, checkList?.asset_id, checkList?.status, checkList?.checklist_name,checkList?.asset_group_id,checkList?.asset_type_id, checkList?.imageCount, checkList?.required)}>
                                                                <ListItemText
                                                                    disableTypography
                                                                    primary={
                                                                        <Typography sx={{ fontSize: '0.875rem', fontWeight: checkList?.isSeen === 0 ? 600 : 400 }}>{`Audit ${checkList?.name}`}</Typography>
                                                                    }
                                                                    secondary={
                                                                        <Typography sx={{fontWeight: checkList?.isSeen === 0 ? 600 : 400, fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between' }}>
                                                                            {`${checkList?.status}`}
                                                                            <span style={{ display: "flex", justifyContent: "end" }}>{handleStatusIconAndColor(checkList?.status)}</span>
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
                                ) : (
                                    <Grid
                                        display='flex'
                                        justifyContent='center'
                                        alignItems='center'
                                        sx={{height: parseInt(windowHeight) - (parseInt(toolbarHeight) + 100)}}
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

                        {/* Show CheckList Form */}
                    {
                        filterAuditCheckList.length > 0 && checkList.length > 0 ? (
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
                                        <Typography variant='h6' align='left'>Audit Check List</Typography>
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
                                        <Stack direction="row" alignItems="center" gap={1}>
                                            {handleStatusIconAndColor(status)}
                                            <Typography variant='body2' align='right'>{status}</Typography>
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
                                    <AssetAuditCheckList 
                                        checkListFields={checkListFields} 
                                        checkListValues={checkList} 
                                        assetId={assetId} 
                                        auditImages={auditImages} 
                                        isAdmin={isAdmin}
                                        status={status} 
                                        checkListId={checkListId} 
                                        setcheckListId={(val) => setCheckListId(val)}
                                        auditDate={auditDate}
                                        remarks={remarks}
                                        setCheckListId={async () => {
                                            await setCheckListId('')
                                        }}
                                        checklistName = {checklistName}
                                        assetGroup = {assetGroup}
                                        assetType = {assetType}
                                        imageCount = {imageCount}
                                        required = {required}
                                    />
                                </Box>
                                
                            </Grid>
                        ) : null
                    }
                </Grid>
            </Card>
            {
                filterDetails.dialogOpen === true && 
                <Dialog open={filterDetails.dialogOpen}>
                    <DialogContent sx={{p: 5, width: '400px'}}>
                        <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                            <IconButton onClick={() => handleDialogClose()}>
                                <CloseIcon/>
                            </IconButton>
                        </Box>
                        <AuditCheckListFilter 
                            fromDate={filterDetails.fromDate}
                            toDate={filterDetails.toDate}
                            handleDateChange={handleDateChange}
                            searchVal={filterDetails.searchVal}
                            setSearchValEmployeeFilter={setSearchValEmployeeFilter}
                            requestSearch={requestSearchEmployee}
                            value={filterDetails.selectedEmployee}
                            setValue={setSearchValue}
                            getCompanyBasedEmployeeFilter={getCompanyBasedEmployeeFilter}
                            searchCompanyBasedEmployeeFilter={searchCompanyBasedEmployeeFilter}
                            roleName={'EMPLOYEE_FILTER'}
                            handleCancel={handleCancel}
                            handleApply={handleApply}
                            
                        />
                    </DialogContent>
                </Dialog>
            }
        </div>
    );

}

export default AuditRequest