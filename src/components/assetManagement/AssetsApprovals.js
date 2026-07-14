import React, { createRef, useContext, useEffect, useState } from 'react'
import { Avatar, Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, List, ListItem, ListItemButton, ListItemText, Stack, TextField, Tooltip, Typography } from '@mui/material'
import ArrowLeftRoundedIcon from '@mui/icons-material/ArrowLeftRounded';
import ArrowRightRoundedIcon from '@mui/icons-material/ArrowRightRounded';
import { useDispatch, useSelector } from 'react-redux';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { deleteScrapAction, getScrapAssetApprovalsAction, getScrapAssetByIdAction, getScrapAssetConfigAction, scrapAssetApprovedAction, scrapAssetRejectedAction, updateSeenScrapAssetApprovalAction } from 'redux/actions/asset_actions';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoneIcon from '@mui/icons-material/Done';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import { DeleteOutlined } from '@mui/icons-material';
import LeadsFilter from 'pages/crm/leadManagement/LeadsFilter';
import CloseIcon from '@mui/icons-material/Close'
import { get_search_company_based_employee, getEmpbasecompanyFilterAction, set_search_company_based_employee } from 'redux/actions/attendance_actions';
import moment from 'moment';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { getsessionStorage } from 'pages/common/login/cookies';
import { roleTypeWithOutEmployee } from 'utils/roleType';


const scrollBar = {
    '&::-webkit-scrollbar' : {
        width : 7
    },
    '&::-webkit-scrollbar-track' : {
        '-webkit-box-shadow' : 'inset 0 0 6px rgba(0,0,0,0.00)'
    },
    '&::-webkit-scrollbar-thumb' : {
        backgroundColor : '#B2B2B2',
        borderRadius : 2,
        border : '2px solid white'
    }
}
const avatarColors = ['#1976d2', '#388e3c', '#d32f2f', '#7b1fa2', '#f57c00', '#0097a7', '#5d4037', '#455a64', '#c2185b', '#00796b'];
const getAvatarColor = (name) => { if (!name) return avatarColors[0]; return avatarColors[name.charCodeAt(0) % avatarColors.length]; };
const getInitials = (name) => { if (!name) return '?'; const parts = String(name).trim().split(' '); return ((parts[0]?.charAt(0) || '') + (parts[1]?.charAt(0) || '')).toUpperCase() || '?'; };
const getStatusColor = (s) => { if (!s) return '#f57c00'; const v = s.toLowerCase(); if (v === 'approved') return '#2e7d32'; if (v === 'rejected' || v === 'cancelled') return '#d32f2f'; return '#f57c00'; };
const getStatusLabel = (s) => { if (!s) return 'Pending'; const v = s.toLowerCase(); if (v === 'approved') return 'Approved'; if (v === 'rejected') return 'Rejected'; if (v === 'cancelled') return 'Cancelled'; if (v === 'pending') return 'Pending'; return s; };
const DetailLabel = ({ children }) => <Typography sx={{ fontSize: 11, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, mb: 0.3 }}>{children}</Typography>;
const DetailValue = ({ children }) => <Typography sx={{ fontWeight: 500, fontSize: 14, mb: 1.5 }}>{children}</Typography>;
const AssetsApprovals = (props) => {

    const dispatch = useDispatch()
    const observer = createRef()

    const {
        AssetReducers : { scrapAssetApprovals, scrapAssetApprovalsUnseenCount, scrapAssetById, scrapAssetApprovalsTotalCount, scrapAssetConfig },
        attendanceReducer : { getCompanyBasedEmployeeFilter, searchCompanyBasedEmployeeFilter }
    } = useSelector(state => state)

    const {
        setModalTypeHandler,
        setLoaderStatusHandler
    } = useContext(CreateNewButtonContext)

    const [windowHeight, setWindowHeight] = useState(window.innerHeight)
    const [toolbarHeight, setToolbarHeight] = useState(document.getElementsByClassName('MuiToolbar-root')[0]?.clientHeight || 70)
    const [requestId, setRequestId] = useState(null)
    const [approval, setApproval] = useState([])
    const [filterOpen, setFilterOpen] = useState(false)
    const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('')
    const [value, setValue] = useState(null)
    const [showUnseenRequests, setShowUnseenRequests] = useState(false)
    const [filteredScrapAsstRequests, setFilteredScrapAsstRequests] = useState([])

    const [paginateData, setPaginateData] = useState({
        numPerPage : 15,
        pageCount : 0,
        lastId : 'MAX_NUMBER'
    })

    const [filterDetails, setFilterDetails] = useState({
        fromDate : null,
        toDate : null,
        searchVal : '',
        selectedEmployee : []
    })
      const storage = getsessionStorage()
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [reasonDialogOpen, setReasonDialogOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [reason, setReason] = useState('')
    const [reasonError, setReasonError] = useState(null)
    const [approveVerifyType, setApproveVerifyType] = useState('')

    const resizeWindow = () => {
        const dynamicToolbarHeight = document.getElementsByClassName('MuiToolbar-root')[0]?.clientHeight || 70
        setWindowHeight(window.innerHeight)
        setToolbarHeight(dynamicToolbarHeight)
    }

    useEffect(() => {
        let data = {
            searchString : ''
        }
        dispatch(getEmpbasecompanyFilterAction(data))
        dispatch(getScrapAssetConfigAction())
        resizeWindow()
        window.addEventListener('resize', resizeWindow)
        return () => window.removeEventListener('resize', resizeWindow)
    }, [])

    useEffect(() => { (async () => {
        if(requestId === null) {
            const payload = {
                fromDate : filterDetails.fromDate,
                toDate : filterDetails.toDate,
                searchVal : filterDetails.searchVal,
                selectedEmployee : filterDetails.selectedEmployee,
                pageCount : paginateData.pageCount,
                numPerPage : paginateData.numPerPage,
                unseen : showUnseenRequests
            }
            dispatch(getScrapAssetApprovalsAction(payload, async(response) => {
                const res = await response
                if(res.length > 0) {
                    setRequestId(res[0].requestId)
                    handleApprovalRequest(res[0])
                }
            }))
        }
    })();
}, [paginateData.pageCount, requestId])

    const handleUnseenRequests = async () => {
        const unseen = !showUnseenRequests
        setShowUnseenRequests(unseen)
        const payload = {
            fromDate : filterDetails.fromDate,
            toDate : filterDetails.toDate,
            searchVal : filterDetails.searchVal,
            selectedEmployee : filterDetails.selectedEmployee,
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.numPerPage,
            unseen : unseen
        }
        dispatch(getScrapAssetApprovalsAction(payload, async(response) => {
            const res = await response
            if(res.length > 0) {
                setRequestId(res[0].requestId)
                handleApprovalRequest(res[0])
            }
        }))
    }

    const lastElementRef = (node) => {
        if(observer.current) {
            observer.current.disconnect()
        }
        observer.current = new IntersectionObserver((entries) => {
            if(entries[0].isIntersecting) {
                setPaginateData((prev) => ({
                    ...prev,
                    lastId : node.getAttribute('data-lastitemid')
                }))
            }
        })
    }

    const handleApprovalRequest = async (approval) => {
        if(Object.entries(approval).length > 0) {
            setApproval(approval)
            setRequestId(approval.request_id)
            await dispatch(getScrapAssetByIdAction(approval.scrap_id))
            if(approval.seen === 0) {
                await dispatch(updateSeenScrapAssetApprovalAction(approval.request_id))
            }
        }
    }

    const handleStatusIconAndColor = (status) => {
        if(status === 'Approved') {
            return <ThumbUpOffAltIcon fontSize='small' style={{ color: 'green' }} />
        }
        else if(status === 'Pending') {
            return <PendingOutlinedIcon fontSize='small' style={{ color : 'orange' }} />
        }
        else {
            return <ThumbDownOffAltIcon fontSize='small' style={{ color : 'red' }} />
        }
    }

    const handlePrevPage = () => {
        const pageCount = paginateData.pageCount - 1
        setPaginateData((prev) => ({...prev, pageCount : prev.pageCount - 1}))
        const payload = {
            fromDate : filterDetails.fromDate,
            toDate : filterDetails.toDate,
            searchVal : filterDetails.searchVal,
            selectedEmployee : filterDetails.selectedEmployee,
            pageCount : pageCount,
            numPerPage : paginateData.numPerPage,
            unseen : showUnseenRequests
        }
        dispatch(getScrapAssetApprovalsAction(payload, async (response) => {
            const res = await response
            if(res.length > 0) {
                setRequestId(res[0].requestId)
                handleApprovalRequest(res[0])
            }
        }))
    }

    const handleNextPage = () => {
        const pageCount = paginateData.pageCount + 1
        setPaginateData((prev) => ({...prev, pageCount : prev.pageCount + 1}))
        const payload = {
            fromDate : filterDetails.fromDate,
            toDate : filterDetails.toDate,
            searchVal : filterDetails.searchVal,
            selectedEmployee : filterDetails.selectedEmployee,
            pageCount : pageCount,
            numPerPage : paginateData.numPerPage,
            unseen : showUnseenRequests
        }
        dispatch(getScrapAssetApprovalsAction(payload, async (response) => {
            const res = await response
            if(res.length > 0) {
                setRequestId(res[0].requestId)
                handleApprovalRequest(res[0])
            }
        }))
    }

    const handleFilterDialogOpen = () => {
        setFilterOpen(true)
    }

    const handleFilterDialogClose = () => {
        setFilterOpen(false)
    }

    const handleDateChange = (name, value) => {
        const date = value ? moment(value).format('YYYY-MM-DD') : null
        if(name === 'fromDate') {
            setFilterDetails({...filterDetails, fromDate : date})
        }
        else if(name === 'toDate') {
            setFilterDetails({...filterDetails, toDate : date})
        }
    }

    const handleChangeEmployeeName = (val) => {
        setValue(val)
    }

    const requestSearchEmployeeFilter = (val) => {
        setSearchValEmployeeFilter(val)
        dispatch(set_search_company_based_employee([]))

        if(!val) {
            return
        }

        let data = {
            searchString : val
        }
        dispatch(get_search_company_based_employee(
            data,
            setModalTypeHandler,
            setLoaderStatusHandler
        ))
    }

    const handleClear = () => {
        setFilterDetails((prev) => ({...prev, fromDate : '', toDate : '', searchVal : '', selectedEmployee : []}))
        setValue(null)
        let data = {
            numPerPage : paginateData.numPerPage,
            pageCount : paginateData.pageCount,
            fromDate : '',
            toDate : '',
            searchVal : '',
            selectedEmployee : [],
            unseen : false
        }
        dispatch(getScrapAssetApprovalsAction(data))
        handleFilterDialogClose()
    }

    const handleApply = () => {
        let data = {
            numPerPage : paginateData.numPerPage,
            pageCount : paginateData.pageCount,
            fromDate : filterDetails.fromDate,
            toDate : filterDetails.toDate,
            searchVal : filterDetails.searchVal,
            selectedEmployee : (value?.employee_id || []),
            unseen : showUnseenRequests
        }
        dispatch(getScrapAssetApprovalsAction(data, async(response) => {
            const res = await response
            if(res.length > 0) {
                setRequestId(res[0].requestId)
                handleApprovalRequest(res[0])
            }
        }))
        handleFilterDialogClose()
    }
        const currentScrap = scrapAssetById && scrapAssetById[0] ? scrapAssetById[0] : null
    const assignedUserName =
        currentScrap?.full_name ||
        currentScrap?.assignedToName ||
        currentScrap?.assigned_to_name ||
        currentScrap?.['Assigned To'] ||
        'Not Assigned'

    const handleApproveConfirm = async () => {
        if (!currentScrap) return
        const payload = {
            type: approveVerifyType,
            scrap_id: currentScrap.scrap_id,
            asset_id: currentScrap.asset_id,
            condition: currentScrap.asset_condition
        }
        await dispatch(scrapAssetApprovedAction(payload, approval.request_id, async (response) => {
            const res = await response
            if (res.length > 0) {
                const ap = res.filter(r => r.request_id === approval.request_id)
                handleApprovalRequest(ap[0])
                setRequestId(ap[0].request_id)
            } else {
                handleApprovalRequest({})
                setRequestId(null)
            }
            setConfirmOpen(false)
        }))
    }

    const handleReasonChange = (e) => {
        const val = e.target.value
        setReason(val)
        setReasonError(val ? null : 'Reason is Required!')
    }

    const handleReasonSubmit = async (e) => {
        e.preventDefault()
        if (!reason) { setReasonError('Reason is Required!'); return }
        const payload = {
            reason,
            scrap_id: currentScrap.scrap_id,
            asset_id: currentScrap.asset_id
        }
        await dispatch(scrapAssetRejectedAction(payload, approval.request_id, async (response) => {
            const res = await response
            if (res.length > 0) {
                const ap = res.filter(r => r.request_id === approval.request_id)
                handleApprovalRequest(ap[0])
                setRequestId(ap[0].request_id)
            } else {
                handleApprovalRequest({})
                setRequestId(null)
            }
            setReasonDialogOpen(false)
            setReason('')
        }))
    }

    const handleDeleteScrap = () => {
        if (currentScrap) dispatch(deleteScrapAction(currentScrap.scrap_id))
        setDeleteOpen(false)
        handleClear()
    }

 const isAdmin = storage?.role_name === 'Administrator'
    const isManager = storage?.role_name === 'Manager'
    const canShowActions =
        (isAdmin || isManager) &&
        approval?.status === 'Pending' &&
        !approval?.approverId &&
        !approval?.verifierId

  return (
      <>
          <Card sx={{ minHeight : '500px', marginRight : '15px',
              maxHeight: 'calc(100vh - 150px)',
              overflowY: 'auto',
              p: 0,
              pr: '10px',
              ...scrollBar,                               
             }}>
              <Grid container>
                  <Grid
                      style={{ borderRight: '2px #d9dadc solid' }}
                      size={{
                          lg: 3.5,
                          md: 4,
                          sm: 5,
                          xs: 12
                      }}>
                      <Grid container spacing={3} alignItems='center' p={3}>
                          <Grid
                              size={{
                                  lg: 12,
                                  md: 12,
                                  sm: 12,
                                  xs: 12
                              }}>
                              <Stack
                                  direction = 'row'
                                  justifyContent = 'space-between'
                                  alignItems = 'left'
                                  spacing = {1}
                                  sx = {{
                                      flexWrap : { xs : 'wrap', sm : 'wrap', md : 'wrap', lg : 'wrap' }
                                  }}
                              >
                                  <Grid container>
                                      <Grid container size={6}>
                                          <Grid>
                                              <Button
                                                  style = {{ cursor : 'pointer', transition : 'color 0.3s ease, transform 0.3s ease' }}
                                                  variant = 'outlined'
                                                  disabled = {paginateData.pageCount === 0 || (props.showUnseenRequests && scrapAssetApprovalsUnseenCount < 15)}
                                                  onClick = {() => handlePrevPage()}
                                              >
                                                  <ArrowLeftRoundedIcon />
                                              </Button>
                                          </Grid>

                                          <Grid>
                                              <Button
                                                  style = {{ cursor : 'pointer', transition : 'color 0.3s ease, transform 0.3s ease' }}
                                                  variant = 'outlined'
                                                  disabled = {scrapAssetApprovalsTotalCount === 0 || scrapAssetApprovalsTotalCount <= paginateData.numPerPage * (paginateData.pageCount + 1 || (props.showUnseenRequests && scrapAssetApprovalsUnseenCount < 15))}
                                                  onClick = {() => handleNextPage()}
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
                                                  <IconButton
                                                  type="button"
                                                  onClick={(e) => {
                                                 e.preventDefault();
                                                 e.stopPropagation();
                                                 handleFilterDialogOpen();}}>
                                                 <FilterAltIcon />
                                                </IconButton>
                                              </Tooltip>

                                              <IconButton onClick = {handleUnseenRequests}>
                                                  {
                                                      showUnseenRequests ? (
                                                          <VisibilityOffIcon color='action' />
                                                      ): (
                                                          <VisibilityIcon color='action' />
                                                      )
                                                  }
                                                  <Typography sx={{ ml: 2, fontWeight: 600 }}>
                                                      {scrapAssetApprovalsUnseenCount}     
                                                  </Typography>
                                              </IconButton>
                                          </Stack>
                                      </Grid>
                                  </Grid>
                              </Stack>
                          </Grid>
                                      
                          {
                              (scrapAssetApprovals.length > 0 && (!props.showUnseenRequests || scrapAssetApprovals.some(f => f.seen === 0))) ? (
                                  <Grid
                                      style = {{ height : parseInt(windowHeight) - (parseInt(toolbarHeight) + 100), flexGrow : '1', overflow : 'auto' }}
                                      sx = {{ ...scrollBar }}
                                      size={{
                                          lg: 12,
                                          md: 12,
                                          sm: 12,
                                          xs: 12
                                      }}>
                                      <nav aria-label='main mailbox folders'>
                                          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                                              {
                                                  scrapAssetApprovals.map((approval, i) => (
                                                      <ListItem
                                                          key = {approval.request_id}
                                                          {...(scrapAssetApprovals.length === i + 1) && {ref : lastElementRef}}
                                                          {...(scrapAssetApprovals.length === i + 1) && {'data-lastitemid' : approval.request_id}}
                                                      >
                                                          <ListItemButton
                                                              selected = {requestId === approval.request_id}
                                                              onClick = {() => handleApprovalRequest(approval)}
                                                          >
                                                              <ListItemText 
                                                                  disableTypography
                                                                  primary = {
                                                                      <Typography sx={{ fontSize: '0.875rem', fontWeight: approval.seen === 0 ? 600 : 400 }}>
                                                                          {`Asset Name ${approval.asset_name}`}
                                                                      </Typography>
                                                                  }
                                                                  secondary = {
                                                                      <Typography sx={{ fontWeight: approval.seen === 0 ? 600 : 400, fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between' }}>
                                                                          {approval.status}
                                                                          <span style={{ display: 'flex', justifyContent: 'end' }}>
                                                                              {handleStatusIconAndColor(approval.status)}
                                                                          </span>
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
                                      display = 'flex'
                                      justifyContent = 'center'
                                      alignItems = 'center'
                                      sx = {{ height : parseInt(windowHeight) - parseInt(toolbarHeight) + 100 }}
                                      size={{
                                          lg: 12,
                                          md: 12,
                                          sm: 12,
                                          xs: 12
                                      }}>
                                      <Typography sx={{ fontSize: '13px', fontWeight: 400 }}>
                                          No Records Found
                                      </Typography>
                                  </Grid>
                              )
                          }
                      </Grid>
                  </Grid>

          
                  {
                      (scrapAssetApprovals.length > 0 && scrapAssetById.length > 0 && currentScrap && (!showUnseenRequests || scrapAssetApprovals.some(f => f.seen === 0))) ? (
                          <Grid
                              size={{ lg: 8, md: 8, sm: 7, xs: 12 }}>
                              <Box sx={{ p: 3 }}>
                                  <Card sx={{ maxWidth: 620, width: '100%', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2 }}>
                                      <CardContent sx={{ p: 2.5 }}>
                                          {/* Header */}
                                          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                                              <Stack direction="row" alignItems="center" spacing={1.5}>
                                                  <Avatar sx={{ width: 48, height: 48, bgcolor: getAvatarColor(assignedUserName), fontSize: 18, fontWeight: 600 }}>
                                                      {getInitials(assignedUserName)}
                                                  </Avatar>
                                                  <Box>
                                                      <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                                                          {assignedUserName}
                                                      </Typography>
                                                      <Typography variant="body2" color="text.secondary">
                                                          Scrap Asset Request
                                                      </Typography>
                                                  </Box>
                                              </Stack>
                                              <Stack direction="row" alignItems="center" spacing={1}>
                                                  <Chip
                                                      label={getStatusLabel(approval?.status)}
                                                      size="small"
                                                      sx={{ bgcolor: `${getStatusColor(approval?.status)}14`, color: getStatusColor(approval?.status), fontWeight: 600, fontSize: '11px', height: 24, borderRadius: '6px' }}
                                                  />
                                                  {approval?.status === 'Pending' && (
                                                      <DeleteOutlined
                                                          onClick={() => setDeleteOpen(true)}
                                                          sx={{ cursor: 'pointer', fontSize: 20, color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                                                      />
                                                  )}
                                              </Stack>
                                          </Stack>

                                          <Divider sx={{ mb: 2 }} />

                                          {/* Details Grid */}
                                          <Grid container spacing={2}>
                                              <Grid size={{ xs: 6 }}>
                                                  <DetailLabel>Asset Name</DetailLabel>
                                                  <DetailValue>{currentScrap.asset_name || '-'}</DetailValue>
                                              </Grid>
                                              <Grid size={{ xs: 6 }}>
                                                  <DetailLabel>Asset Code</DetailLabel>
                                                  <DetailValue>{currentScrap.asset_code || '-'}</DetailValue>
                                              </Grid>
                                              <Grid size={{ xs: 6 }}>
                                                  <DetailLabel>User</DetailLabel>
                                                  <DetailValue>{assignedUserName}</DetailValue>
                                              </Grid>
                                              <Grid size={{ xs: 6 }}>
                                                  <DetailLabel>Condition</DetailLabel>
                                                  <DetailValue>{currentScrap.asset_condition || '-'}</DetailValue>
                                              </Grid>
                                          </Grid>

                                          {/* Reason */}
                                          <Box sx={{ bgcolor: 'grey.50', borderRadius: 1.5, p: 1.5, mb: 2 }}>
                                              <DetailLabel>Reason</DetailLabel>
                                              <Typography variant="body2" color="text.secondary">
                                                  {currentScrap.reason || '-'}
                                              </Typography>
                                          </Box>

                                          {/* Images */}
                                          {currentScrap.images && currentScrap.images.length > 0 && (
                                              <Box sx={{ mb: 2 }}>
                                                  <DetailLabel>Attachments</DetailLabel>
                                                  <Stack direction="row" spacing={1.5} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                                                      {currentScrap.images.map((img, idx) => (
                                                          <Box
                                                              key={idx}
                                                              component="img"
                                                              src={img.imageUrl}
                                                              alt={`asset-${idx}`}
                                                              sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}
                                                          />
                                                      ))}
                                                  </Stack>
                                              </Box>
                                          )}

                                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', py:2, pt:2 }}>
                                              {approval?.status === 'Approved' && `Verified by ${currentScrap?.verifier_name || ''}`}
                                          </Typography>
                                          {approval?.status === 'Approved' && (
                                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                  Approved by {currentScrap?.approver_name || ''}
                                              </Typography>
                                          )}
                                      </CardContent>

                                      {approval?.status === 'Rejected' && (
                                          <Box sx={{ mx: 2.5, my: 1.5, p: 1.5, bgcolor: '#fef2f2', borderRadius: 1.5, border: '1px solid #fecaca' }}>
                                              <Stack direction='row' alignItems='center' gap={1} sx={{ mb: 0.5 }}>
                                                  <CancelIcon fontSize='small' sx={{ color: 'error.main' }} />
                                                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>Rejected</Typography>
                                              </Stack>
                                              {approval?.reason_for_rejection && (
                                                  <>
                                                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Reason:</Typography>
                                                      <Typography variant="body2" color="text.secondary">{approval?.reason_for_rejection}</Typography>
                                                  </>
                                              )}
                                          </Box>
                                      )}

                                      {/* {roleTypeWithOutEmployee.includes(storage?.role_name) && approval?.status !== 'Rejected' && approval?.status !== 'cancelled' && (
                                          <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid', borderColor: 'divider' }}> */}
                                             {(isAdmin || isManager) && approval?.status !== 'Rejected' && approval?.status !== 'cancelled' && (
    <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                                              <Stack direction='row' alignItems='center' gap={1} justifyContent="center" sx={{ mb: 1.5 }}>
                                                  {approval?.approverId && approval?.verifierId
                                                      ? <DoneIcon fontSize='small' sx={{ color: 'success.main' }} />
                                                      : <QueryBuilderIcon fontSize='small' color="action" />}
                                                  <Typography variant="caption" color="text.secondary">
                                                      {approval?.approverId === null && approval?.verifierId === null
                                                          ? 'Waiting For the Approval'
                                                          : approval?.approverId && approval?.verifierId === null
                                                              ? 'Approved and Waiting for the Verifier'
                                                              : 'Approved and Verified'}
                                                  </Typography>
                                              </Stack>

                                              {canShowActions && (
                                                  <Stack direction='row' justifyContent='center' spacing={1.5}>
                                                      <Button
                                                          variant='outlined'
                                                          color='error'
                                                          sx={{ borderRadius: 2, minWidth: 100, textTransform: 'none' }}
                                                          startIcon={<CancelIcon fontSize="small" />}
                                                          onClick={() => setReasonDialogOpen(true)}>
                                                          Deny
                                                      </Button>
                                                      <Button
                                                          variant='contained'
                                                          color='success'
                                                          sx={{ borderRadius: 2, minWidth: 140, textTransform: 'none' }}
                                                          startIcon={<CheckCircleIcon fontSize="small" />}
                                                          onClick={() => { setApproveVerifyType('approveVerify'); setConfirmOpen(true); }}>
                                                          Approve & Verify
                                                      </Button>
                                                  </Stack>
                                              )}
                                          </Box>
                                      )}
                                  </Card>
                              </Box>
                          </Grid>
                      ) : (
                          <Grid
                              display='flex'
                              alignItems='center'
                              justifyContent='center'
                              sx={{ height: parseInt(windowHeight) - parseInt(toolbarHeight) + 100 }}
                              size={{ lg: 8, md: 8, sm: 7, xs: 12 }}>
                              <Typography sx={{ fontSize: '13px', fontWeight: 400 }}>
                                  No Record Found
                              </Typography>
                          </Grid>
                      )
                  }
              </Grid>
          </Card>
         
           {confirmOpen && (
              <Dialog open={confirmOpen} maxWidth='sm' fullWidth>
                  <DialogTitle>Confirmation</DialogTitle>
                  <DialogContent>
                      <Typography sx={{ fontSize: '13px', color: 'grey' }}>Are you sure to approve?</Typography>
                  </DialogContent>
                  <DialogActions>
                      <Button variant='contained' color='error' onClick={() => setConfirmOpen(false)}>Close</Button>
                      <Button variant='contained' onClick={handleApproveConfirm}>Ok</Button>
                  </DialogActions>
              </Dialog>
          )}

          {reasonDialogOpen && (
              <Dialog open={reasonDialogOpen} maxWidth='sm' fullWidth>
                  <DialogTitle>Reason</DialogTitle>
                  <DialogContent>
                      <TextField
                          required
                          fullWidth
                          label='Reason'
                          variant='filled'
                          value={reason}
                          onChange={handleReasonChange}
                          error={reasonError !== null}
                          helperText={reasonError || ''}
                      />
                  </DialogContent>
                  <DialogActions>
                      <Button variant='contained' color='error' onClick={() => { setReasonDialogOpen(false); setReason(''); setReasonError(null); }}>Close</Button>
                      <Button variant='contained' onClick={handleReasonSubmit}>Submit</Button>
                  </DialogActions>
              </Dialog>
          )}

          {deleteOpen && (
              <Dialog open={deleteOpen} maxWidth='sm' fullWidth>
                  <DialogTitle>Confirmation</DialogTitle>
                  <DialogContent>
                      <Typography sx={{ fontSize: '13px', color: 'grey' }}>Are you sure to delete this approve?</Typography>
                  </DialogContent>
                  <DialogActions>
                      <Button variant='contained' color='error' onClick={() => setDeleteOpen(false)}>Close</Button>
                      <Button variant='contained' onClick={handleDeleteScrap}>Ok</Button>
                  </DialogActions>
              </Dialog>
          )}

        <Dialog open={filterOpen} onClose={handleFilterDialogClose} fullWidth maxWidth='sm'>
                <DialogTitle>
                    Filter
                    <IconButton
                        onClick={handleFilterDialogClose}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ pt: 3 }}>
                    <LeadsFilter
                        fromDate={filterDetails.fromDate}
                        toDate={filterDetails.toDate}
                        handleDateChange={handleDateChange}
                        handleCancel={() => {
                            setFilterDetails((prev) => ({
                                ...prev, fromDate: '', toDate: '', searchVal: '', selectedEmployee: []
                            }))
                            handleFilterDialogClose()
                        }}
                        handleApply={() => {
                            handleApply()
                            handleFilterDialogClose()
                        }}
                        searchVal={searchValEmployeeFilter}
                        setSearchValEmployeeFilter={setSearchValEmployeeFilter}
                        requestSearch={requestSearchEmployeeFilter}
                        value={value}
                        setValue={handleChangeEmployeeName}
                        getCompanyBasedEmployeeFilter={getCompanyBasedEmployeeFilter}
                        searchCompanyBasedEmployeeFilter={searchCompanyBasedEmployeeFilter}
                    />
                </DialogContent>
            </Dialog>

      </>
  );
}

export default AssetsApprovals
