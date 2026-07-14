import { Box, Button, Card, Divider, Grid, IconButton, Stack, Tooltip, Typography, useTheme } from "@mui/material"
import { useDispatch, useSelector } from "react-redux"
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import CloseIcon from "@mui/icons-material/Close"
import RecordCard from "./RecordCard"
import TopCards from "./TopCards"
import PropTypes from "prop-types"
import Products from "./Products"
import { getDefectCollectionByIdAction, getDefectSentByIdAction, getReplacementByIdAction } from "redux/actions/defects_actions"
import { useEffect, useState } from "react"
import TimelineDesign from '../../../../components/erpDesign/timeline_design'
import OptionButton from "components/erpDesign/actionButton"

function ReplacementLandingPage(props){

    const dispatch = useDispatch()
    const theme = useTheme()
    const {
        defectReducers: { listReplacement, replacementById, listDefectCollection, defectCollectionById, getSendDefects, defectSentById },
        rbacReducer: { menuAccess }
    } = useSelector(state => state)

    const [index, setIndex] = useState(null)
    const [replacementData, setReplacementData] = useState({})
    const [collectDefectData, setCollectDefectData] = useState({})
    const [sentDefectData, setSentDefectData] = useState({})
    const [visibleCount, setVisibleCount] = useState(10)

    useEffect(() => {
        let dataIndex = null
        if(props.type === 'collectDefect'){
            dataIndex = (listDefectCollection?.data?.length ?? 0) > 0 ? listDefectCollection.data.findIndex(d => d.collection_id === props.data.collection_id) : null
        }
        else if(props.type === 'sendDefect'){
            dataIndex = (getSendDefects?.data?.length ?? 0) > 0 ? getSendDefects.data.findIndex(d => d.send_id === props.data.send_id) : null
        }
        else{
            dataIndex = (listReplacement?.data?.length ?? 0) > 0 ? listReplacement.data.findIndex(d => d.replacement_id === props.data.replacement_id && d.record_kind === props.data.record_kind) : null
        }
        setIndex(dataIndex)
    }, [props.data, listDefectCollection, getSendDefects, listReplacement])

    useEffect(() => {
        if(index !== null){
            if(props.type === 'collectDefect'){
                const data = listDefectCollection.data[index]
                dispatch(getDefectCollectionByIdAction(data.collection_id))
            }
            else if(props.type === 'sendDefect'){
                const data = getSendDefects.data[index]
                dispatch(getDefectSentByIdAction(data.send_id))
            }
            else{
                const data = listReplacement.data[index]
                dispatch(getReplacementByIdAction(data.record_kind, data.replacement_id))
            }
        }
        else{
            setReplacementData({})
            setCollectDefectData({})
            setSentDefectData({})
        }
    }, [index])

    useEffect(() => {
        if(replacementById.length > 0) setReplacementData(replacementById[0])
        else setReplacementData({})
    }, [replacementById])

    useEffect(() => {
        if(defectCollectionById.length > 0) setCollectDefectData(defectCollectionById[0])
        else setCollectDefectData({})
    }, [defectCollectionById])

    useEffect(() => {
        if(defectSentById.length > 0) setSentDefectData(defectSentById[0])
        else setSentDefectData({})
    }, [defectSentById])

    const handleShowMore = () => {
        setVisibleCount((prev) => prev + 10)
    }

    const handleActionChange = (index) => {
        if(index === 0){ props.setView('form'); props.setFormStatus('edit'); }
        else if(index === 1){ props.handleDelete(props.data); }
        else if(index === 2){ props.setView('replacementForm'); }
    }

    const getTimelineContent = (m) => {
        switch(m.title){
            case 'Sent Defect Replaced': return `Vendor Replacement ${m.invoice_number} for ${m.send_defect_number} has been created by ${m.created_by}`
            case 'Collected Defect Replaced': return `Customer Replacement ${m.invoice_number} for ${m.collection_number} has been created by ${m.created_by}`
            case 'Collected Defect Replaced Delivery Update': return `Customer Status changed to ${m.status}`
            case 'Defect Collected': return `Defect ${m.collection_number} collected by ${m.created_by} from ${m.company_name}`
            case 'Defect Sent': return `Defect ${m.send_defect_number} sent by ${m.created_by} to ${m.company_name}`
            case 'Sent Defect Updated': return `Defect ${m.send_defect_number} has been updated by ${m.created_by}`
            case 'Collect Defect Updated': return `Defect ${m.collection_number} has been updated by ${m.created_by}`
            case 'Defect Sent Delivery Update': return `Defect ${m.send_defect_number} delivery status updated to ${m.status}`
            default: return ''
        }
    }

    const visibleItems = (props.type === 'collectDefect' ? collectDefectData?.timeline ?? [] : props.type === 'sendDefect' ? sentDefectData?.timeline ?? [] : replacementData?.timeline ?? []).slice(0, visibleCount)
    const nextDisabled = props.type === 'collectDefect' ? (listDefectCollection.data?.length ?? 0) - 1 === index : props.type === 'sendDefect' ? getSendDefects.data.length - 1 === index : listReplacement.data.length - 1 === index
    const docNumber = props.type === 'collectDefect' ? collectDefectData?.collection_number : props.type === 'sendDefect' ? sentDefectData?.send_defect_number : replacementData?.replacement_number || ''

    return (
        <Card sx={{ height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
            {/* ---- Top Action Bar ---- */}
            <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: 2.5, py: 1,
                borderBottom: `2px solid ${theme.palette.primary.main}`,
                bgcolor: `${theme.palette.primary.main}08`,
                flexShrink: 0,
            }}>
                <Typography component="span" sx={{ fontWeight: 600, fontSize: 14, color: theme.palette.primary.main }}>
                    {docNumber || ''}
                </Typography>

                <Stack direction="row" alignItems="center" spacing={0.5}>
                    {(props.type === 'collectDefect' || props.type === 'sendDefect') && (
                        <OptionButton
                            checkType={props.type}
                            handleActionChange={handleActionChange}
                            issueReplacementDisable={props.type === 'collectDefect' ? collectDefectData.status === 'Fully Replaced' : props.type === 'sendDefect' ? sentDefectData.status === 'Fully Replaced' : false}
                            editDeleteDisable={props.type === 'collectDefect' ? (collectDefectData.status === 'Fully Replaced' || collectDefectData.status === 'Partially Replaced') : props.type === 'sendDefect' ? (sentDefectData.status === 'Partially Replaced' || sentDefectData.status === 'Fully Replaced') : false}
                            user_rights={menuAccess}
                        />
                    )}

                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                    <Tooltip title='Previous'>
                        <span>
                            <IconButton size="small" disabled={index === 0} onClick={() => setIndex(index - 1)}>
                                <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title='Next'>
                        <span>
                            <IconButton size="small" disabled={nextDisabled} onClick={() => setIndex(index + 1)}>
                                <ArrowForwardIosIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </span>
                    </Tooltip>

                    <Tooltip title="Close">
                        <IconButton size="small" onClick={() => props.handleClose(false, true)}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>

            {/* ---- Scrollable Content ---- */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
                <Grid container spacing={2}>
                    <Grid size={12}>
                        <TopCards data={props.type === 'collectDefect' ? collectDefectData : props.type === 'sendDefect' ? sentDefectData : replacementData} type={props.type} />
                    </Grid>

                    <Grid size={12}>
                        <RecordCard data={props.type === 'collectDefect' ? collectDefectData : props.type === 'sendDefect' ? sentDefectData : replacementData} type={props.type} />
                    </Grid>

                    <Grid size={12}>
                        <Card
                            variant='outlined'
                            sx={{
                                padding: '10px', width: '100%', display: 'flex', alignItems: 'center',
                                justifyContent: 'space-evenly', borderRadius: '6px',
                                bgcolor: `${theme.palette.info.main}10`, borderColor: `${theme.palette.info.main}40`,
                            }}
                        >
                            <Grid>
                                <Typography sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary' }} align='center'>
                                    {`${props.type === 'sendDefect' ? 'Delivery Status' : 'Status'}`}
                                </Typography>
                                <Typography sx={{ fontSize: 14, fontWeight: 700, color: theme.palette.info.main }} align='center'>
                                    {props.type === 'collectDefect' ? collectDefectData?.status || '--' : props.type === 'sendDefect' ? sentDefectData?.delivery_status || '--' : replacementData?.status || '--'}
                                </Typography>
                            </Grid>

                            {replacementData.type === 'CUSTOMER' && (
                                <>
                                    <Divider orientation='vertical' flexItem />
                                    <Grid>
                                        <Typography sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary' }} align='center'>
                                            Delivery Status
                                        </Typography>
                                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: theme.palette.info.main }} align='center'>
                                            {replacementData?.delivery_status_name || '--'}
                                        </Typography>
                                    </Grid>
                                </>
                            )}
                        </Card>
                    </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={(props.type !== 'collectDefect' && props.type !== 'sendDefect') ? 6 : 12}>
                        <Products data={props.type === 'collectDefect' ? collectDefectData : props.type === 'sendDefect' ? sentDefectData : replacementData} type={props.type === 'collectDefect' || props.type === 'sendDefect' ? props.type : 'replacingProduct'} />
                    </Grid>
                    {(props.type !== 'collectDefect' && props.type !== 'sendDefect') && (
                        <Grid size={6}>
                            <Products data={replacementData} type='replacedProduct' />
                        </Grid>
                    )}
                </Grid>

                {/* ---- Timeline ---- */}
                {visibleItems.length > 0 && (
                    <Card sx={{ p: 3, mt: 2 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 700 }}>Timeline</Typography>
                        <Box sx={{
                            '& .MuiTimeline-root': { padding: 0 },
                            '& .MuiTimelineItem-root:before': { display: 'none' },
                            '& .MuiTimelineOppositeContent-root': { flex: '0 0 160px', textAlign: 'left' },
                        }}>
                            {visibleItems.map((m) => {
                                const title = m.title === 'Collected Defect Replaced Delivery Update' ? 'Collected Defect Replacement Update' : m.title
                                const content = getTimelineContent(m)
                                return <TimelineDesign m={m} title={title} content={content} />
                            })}
                        </Box>

                        {visibleCount < (props.type === 'collectDefect' ? collectDefectData?.timeline?.length : props.type === 'sendDefect' ? sentDefectData?.timeline?.length : replacementData?.timeline?.length ?? 0) && (
                            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                <Button variant='outlined' onClick={handleShowMore}>Show More</Button>
                            </div>
                        )}
                    </Card>
                )}
            </Box>
        </Card>
    );
}

ReplacementLandingPage.propTypes = {
    data: PropTypes.object,
    handleClose: PropTypes.func,
    type: PropTypes.string
}

export default ReplacementLandingPage
