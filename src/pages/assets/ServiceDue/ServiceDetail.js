import OptionButton from "components/erpDesign/actionButton";
import { useEffect, useState } from "react";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import useStyles from '../../../components/customer_erpDesign/cardStyles';
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { getAllRenewalsAction, getRenewalRecordAction, getRenewalRecordsAction, updatePauseRenewalsAction, updateResumeRenewalsAction } from "redux/actions/renewals_actions";
import { getServiceDueByAssetAction} from 'redux/actions/serviceDue_actions'
import { assetDetailsAction } from "redux/actions/asset_actions";
import PropTypes from "prop-types";
import RenewalRecordsTable from "pages/assets/Renewals/RenewalRecordsTable";
import AssetDetails from "pages/assets/Renewals/AssetDetails";
import { Card, Grid, Button, Tooltip, IconButton, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { useLocation } from "react-router-dom";
import RenewalTimelineCard from 'components/erpDesign/RenewalTimelineCard'

const summaryCardSx = {
  p: 1.5,
  width: "100%",
  borderRadius: 2,
  bgcolor: "grey.600",
  color: "common.white",
};
function ServiceDetail(props){
    
    const styles = useStyles()
    const dispatch = useDispatch()
    const {
        RenewalsReducers: {renewalRecords},
         ServiceDueReducers : {serviceDueList ,serviceDueByAsset},
         AssetReducers : {assetDetails}
    } = useSelector(state => state)
//    console.log(renewalRecords?.data,"gdfdrwerwgd");
   
   
    const [optionIndex, setOptionIndex] = useState(null)
    const [index, setIndex] = useState(null)
    const [rowData, setRowData] = useState({})
    const [recordsPagination, setRecordsPagination] = useState({
        numPerPage: 5,
        pageCount: 0
    })
    console.log(rowData?.[0]?.service_provider ,"dgdf22gd");
    console.log(index,"df111sdfsd");
    
    

    useEffect(() => {
        if (serviceDueList?.length && props?.rowData?.id) {
            const currentIndex = serviceDueList.findIndex((item) => item.id === props?.rowData?.id)
            if (currentIndex) {
                setIndex(currentIndex)
            } else {
                setIndex(0)
            }
        }
    },[serviceDueList,props?.rowData?.id])

    useEffect(()=> {
        if(index !== null && serviceDueList){
            const res = serviceDueList[index]
            if(res?.id){
                const payload = {
                    type : "details"
                }
            dispatch(getServiceDueByAssetAction( res?.id ,payload))
            }
        }
    },[index])

    useEffect(() => {
        if(serviceDueByAsset){
            setRowData(serviceDueByAsset)
        }
    },[index,serviceDueByAsset])
   

    useEffect(() => {
        if (rowData?.[0]?.id) {
            dispatch(getRenewalRecordAction({
                id: rowData?.[0]?.id,
                numPerPage: recordsPagination.numPerPage,
                pageCount: recordsPagination.pageCount,
                type: 'serviceDue'
            }))
        }
    }, [rowData ,recordsPagination])

    useEffect(() => {
        if (rowData?.[0]?.asset_id) {
            dispatch(assetDetailsAction({
                asset_id: rowData[0].asset_id,
            }))
        }
    }, [rowData])
 
    const handleRenewalsOptionChange = (option) => {
        setOptionIndex(option)
    }
 
    const handlePrev = () => {
        if(index >= 1){
            setIndex(prevIndex => prevIndex - 1)
        }
    }
 
    const handleNext = () => {
        setIndex(prevIndex => prevIndex + 1)
    }
 
    const handleClose = () => {
        setOptionIndex(null)
        props.handleClose()
    }
 
    const handleCancel = () => {
        setOptionIndex(null)
    }
 const location = useLocation()
 
    const calculateExpires = (startDate, endDate) => {
        const currentDate = moment().startOf('day')
        const start = moment(startDate).startOf('day');
        const end = moment(endDate).startOf('day');
 
        if (!start.isValid() || !end.isValid()) {
            return '-'
        }
        else if(currentDate.isSameOrAfter(start)) {
            const duration = end.diff(currentDate, 'days')
            if(duration < 0){
                return `0 - Expired`
            }
            else{
                return `${duration} days`
            }
        }
        else{
            const duration = end.diff(start, 'days')
            if(duration < 0){
                return `0 - Expired`
            }
            else{
                return `${duration} days`
            }
        }
    }
 
    const handlePageSizeChange = (size) => {
        setRecordsPagination((prev) => ({ ...prev, numPerPage: size }))
    }
 
    const handlePageChange = (page) => {
        setRecordsPagination((prev) => ({ ...prev, pageCount: page }))
    }
 
    const handlePauseConfirm = async () => {
        const payload = {
            id : rowData.id,
            type : rowData.type
        }
        await dispatch(updatePauseRenewalsAction(payload))
        handleClose()
    }
 
    const handleResumeConfirm = async () => {
        const payload = {
            id : rowData.id,
            type : rowData.type
        }
        await dispatch(updateResumeRenewalsAction(payload))
        handleClose()
    }

    return (
        <>
            {
                // optionIndex === null &&
                <>
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
                        } `}
                    </style>      
                    <Grid container spacing={2} display='flex' justifyContent='flex-end'>
                        <Grid>
                            <Button onClick={() => props.handleClose()} variant="contained" color="inherit">
                                Back
                            </Button>
                        </Grid>

                        {/* <Grid zIndex={1}>
                            <OptionButton
                                disablePause = {rowData.pause === 0 ? true : false}
                                checkType = 'Renewals'
                                handleRenewalsOptionChange = {handleRenewalsOptionChange}
                            />
                        </Grid> */}

                        <Grid>
                            <Tooltip title='Previous'>
                                <IconButton color="primary" disabled={index === 0} onClick={handlePrev}>
                                    <ArrowBackIosNewIcon />
                                </IconButton>
                            </Tooltip>
                        </Grid>
            
                        <Grid>
                        <Tooltip title='Next'>
                                <IconButton color="primary" disabled = {serviceDueList?.length - 1 === index } onClick={handleNext}>
                                    <ArrowForwardIosIcon />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    </Grid>
                
                    <Card sx={{p: 3}}>
                        <Grid container spacing={2}>
                            <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <Card variant="outlined" className={styles.red} sx = {summaryCardSx}>
                                    <Typography variant='body1' component='div' align='center'>Service Provider</Typography>
                                    <Typography variant='h6' align='center'>{ rowData?.[0]?.service_provider ? rowData?.[0]?.service_provider : '-'}</Typography>
                                </Card>
                            </Grid>

                            <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <Card variant="outlined" className={styles.red} sx = {summaryCardSx}>
                                    <Typography variant='body1' component='div' align='center'>Provider Contact</Typography>
                                    <Typography variant='h6' align='center'>{rowData?.[0]?.provider_contact ? rowData?.[0]?.provider_contact : '-'}</Typography>
                                </Card>
                            </Grid>

                            <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <Card variant="outlined" className={styles.blue} sx = {summaryCardSx}>
                                    <Typography variant='body1' component='div' align='center'>Amount</Typography>
                                    <Typography variant='h6' align='center'>{rowData?.[0]?.amount ? rowData?.[0]?.amount : '-'}</Typography>
                                </Card>
                            </Grid>

                            <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <Card variant="outlined" className={styles.green} sx = {summaryCardSx}>
                                    <Typography variant='body1' component='div' align='center'>Due Date</Typography>
                                    <Typography variant='h6' align='center'>{moment(rowData?.[0]?.due_date).isValid() ? moment(rowData?.[0]?.due_date).format('DD/MM/YYYY') : '-'}</Typography>
                                </Card>
                            </Grid>

                            <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <Card variant="outlined" className={styles.yellow} sx = {summaryCardSx}>
                                    <Typography variant='body1' component='div' align='center'>Created At</Typography>
                                    <Typography variant='h6' align='center'>{ (rowData?.[0]?.createdAt) ? moment(rowData?.[0]?.createdAt).format("DD/MM/YYYY") : '-'}</Typography>
                                </Card>
                            </Grid>

                            <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <Card variant="outlined" className={styles.lav} sx = {summaryCardSx}>
                                    <Typography variant='body1' component='div' align='center'>Created By</Typography>
                                    <Typography variant='h6' align='center'>{ rowData?.[0]?.fullName ? rowData?.[0]?.fullName : '-'}</Typography>
                                </Card>
                            </Grid>

                            {/* <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <Card variant="outlined" className={styles.ash} sx = {{ padding : '10px', width : '100%', borderRadius : 2, bgcolor : 'green', color : 'white' }}>
                                    <Typography variant='body1' component='div' align='center'>Title</Typography>
                                    <Typography variant='h6' align='center'>{rowData?.[0]?.title ? rowData?.[0]?.title : '-'}</Typography>
                                </Card>
                            </Grid> */}
                            

                            <Grid
                                size={{
                                    lg: 12,
                                    md: 12,
                                    sm: 12,
                                    xs: 12
                                }}>
                                <AssetDetails
                                    data={assetDetails}
                                    numPerPage={recordsPagination.numPerPage}
                                    pageCount={recordsPagination.pageCount}
                                    handlePageChange={handlePageChange}
                                    handlePageSizeChange={handlePageSizeChange}
                                />
                            </Grid>

                            <Grid
                                size={{
                                    lg: 12,
                                    md: 12,
                                    sm: 12,
                                    xs: 12
                                }}>
                                <RenewalRecordsTable
                                    data = {renewalRecords}
                                    count = {renewalRecords?.numRows}
                                    numPerPage = {recordsPagination.numPerPage}
                                    pageCount = {recordsPagination.pageCount}
                                    handlePageChange = {handlePageChange}
                                    handlePageSizeChange = {handlePageSizeChange}
                                />
                            </Grid>
                            {rowData?.[0]?.id &&
    <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
        <RenewalTimelineCard type='serviceDue' id={rowData?.[0]?.id} />
    </Grid>
}

                        </Grid>
                    </Card>
                </div>
                    
                </>
            }
        </>
    );
}
 
ServiceDetail.propTypes = {
    data : PropTypes.object,
    handleClose : PropTypes.func
}
 
export default ServiceDetail