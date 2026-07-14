import { Button, Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Tooltip, Typography } from "@mui/material";
import { Grid } from "@mui/system";
import { useStyles } from "tss-react";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import moment from "moment";
import { useEffect, useState } from "react";
import RenewalRecordsTable from "./RenewalRecordsTable";
import { getRenewalRecordAction, updatePauseRenewalsAction, updateResumeRenewalsAction } from "redux/actions/renewals_actions";
import { useDispatch, useSelector } from "react-redux";
import { getComplianceByIdAction } from "../../../redux/actions/compliances_actions";
import RenewalTimelineCard from 'components/erpDesign/RenewalTimelineCard'
import OptionButton from 'components/erpDesign/actionButton'
import AlertsForm from 'pages/assets/Alerts/Form'
import { getsessionStorage } from 'pages/common/login/cookies'
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper'
import NewComplianceForm from "./NewComplianceForm"

export default function CompliancesDetails(props) {
    const styles = useStyles()
    const dispatch = useDispatch()
  	const [index, setIndex] = useState(null)
    const [row ,setRow] = useState(null)
    const [optionIndex, setOptionIndex] = useState(null)
    
    const [recordsPagination, setRecordsPagination] = useState({
        numPerPage: 5,
        pageCount: 0
    })

    const storage = getsessionStorage()
    const selectedRole = storage?.role_name
    const canEdit = UserRightsAuthorization(
        props.user_rights?.[selectedRole],
        'filings',
        'can_edit',
    )

    const { 
        RenewalsReducers: { renewalRecords },
         compliancesReducers : { compliancesList, getComplianceById, compliancesListCount }
     } = useSelector(state => state)


    useEffect(() => {
        if (props?.rowData?.id) {
            const currentIndex = compliancesList.findIndex((item)=> item.id === props?.rowData?.id) 
            console.log(currentIndex ,"fghdfgd");
                       
            if (currentIndex) {
                setIndex(currentIndex)
            }else{
                setIndex(0)
            }
        }
    }, [props?.rowData?.id ,compliancesList])

    useEffect(() => {
        if (index !== null && compliancesList) {
            const res = compliancesList[index]
            if (res?.id) {
                const payload = {
                    type: "details"
                }
                dispatch(getComplianceByIdAction(res?.id, payload))

            }
        }
    }, [index])

    useEffect(() => {
        if (getComplianceById) {
            setRow(getComplianceById?.[0])
        }
    }, [index, getComplianceById])


    useEffect(() => {
        if (row) {
            dispatch(getRenewalRecordAction({
                id: row.id,
                numPerPage: recordsPagination.numPerPage,
                pageCount: recordsPagination.pageCount ,
                type : 'Compliance'
            }))
        }
    }, [row ,recordsPagination])
    
    const handlePrev = () => {
        if (index >= 1) {
            setIndex(prevIndex => prevIndex - 1)
        }
    }
    
    const handleNext = () => {
            setIndex( prevIndex => prevIndex + 1)    
    }

    const handlePageSizeChange = (size) => {
        setRecordsPagination((prev) => ({ ...prev, numPerPage: size }))
    }

    const handlePageChange = (page) => {
        setRecordsPagination((prev) => ({ ...prev, pageCount: page }))
    }

    const handleRenewalsOptionChange = (option) => {
        setOptionIndex(option)
    }

    const handleCancel = () => {
        setOptionIndex(null)
    }

    const handlePauseConfirm = async () => {
        await dispatch(updatePauseRenewalsAction({ id: row?.id, type: 'Compliance' }))
        props.handleClose()
    }

    const handleResumeConfirm = async () => {
        await dispatch(updateResumeRenewalsAction({ id: row?.id, type: 'Compliance' }))
        props.handleClose()
    }

    const handleAlertSubmitClose = () => {
        setOptionIndex(null)
        props.handleClose()
    }

    
    return (
        <>
        {optionIndex === null && (
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

                {canEdit && (
                    <Grid zIndex={1}>
                        <OptionButton
                            user_rights={props.user_rights}
                            disablePause={row?.repeat === 1 ? true : false}
                            checkType='Renewals'
                            handleRenewalsOptionChange={handleRenewalsOptionChange}
                        />
                    </Grid>
                )}

                <Grid>
                    <Tooltip title='Previous'>
                        <IconButton color="primary" disabled = {index === 0} onClick = {handlePrev} >
                            <ArrowBackIosNewIcon />
                        </IconButton>
                    </Tooltip>
                </Grid>

                <Grid>
                    <Tooltip title='Next'>
                        <IconButton color="primary" disabled = {compliancesList.length -1 === index} onClick = {handleNext}>
                            <ArrowForwardIosIcon />
                        </IconButton>
                    </Tooltip>
                </Grid>
            </Grid>

            <Card sx={{ p: 3 }}>
                <Grid container spacing={2}>
                    <Grid
                        size={{
                            lg: 3,
                            md: 4,
                            sm: 6,
                            xs: 12
                        }}>
                        <Card variant="outlined" className={styles.red} sx={{ padding: '10px', width: '100%', borderRadius: 2, bgcolor: 'grey', color: 'white' }}>
                            <Typography variant='body1' component='div' align='center'> Amount</Typography>
                            <Typography variant='h6' align='center'>₹ {row?.amount ? row?.amount : '-'}</Typography>
                        </Card>
                    </Grid>

                    <Grid
                        size={{
                            lg: 3,
                            md: 4,
                            sm: 6,
                            xs: 12
                        }}>
                        <Card variant="outlined" className={styles.red} sx={{ padding: '10px', width: '100%', borderRadius: 2, bgcolor: 'grey', color: 'white' }}>
                            <Typography variant='body1' component='div' align='center'>Premium</Typography>
                            <Typography variant='h6' align='center'>{row?.frequency ? row?.frequency : '-'}</Typography>
                        </Card>
                    </Grid>


                    <Grid
                        size={{
                            lg: 3,
                            md: 4,
                            sm: 6,
                            xs: 12
                        }}>
                        <Card variant="outlined" className={styles.green} sx={{ padding: '10px', width: '100%', borderRadius: 2, bgcolor: 'grey', color: 'white' }}>
                            <Typography variant='body1' component='div' align='center'>Window Start</Typography>
                            <Typography variant='h6' align='center'>{moment(row?.window_start).isValid() ? moment(row?.window_start).format('DD/MM/YYYY') : '-'}</Typography>
                        </Card>
                    </Grid>

                    <Grid
                        size={{
                            lg: 3,
                            md: 4,
                            sm: 6,
                            xs: 12
                        }}>
                        <Card variant="outlined" className={styles.yellow} sx={{ padding: '10px', width: '100%', borderRadius: 2, bgcolor: 'grey', color: 'white' }}>
                            <Typography variant='body1' component='div' align='center'>Window End</Typography>
                            <Typography variant='h6' align='center'>{moment(row?.window_end).isValid() ? moment(row?.window_end).format('DD/MM/YYYY') : '-'}</Typography>
                        </Card>
                    </Grid>

                    <Grid
                        size={{
                            lg: 3,
                            md: 4,
                            sm: 6,
                            xs: 12
                        }}>
                        <Card variant="outlined" className={styles.yellow} sx={{ padding: '10px', width: '100%', borderRadius: 2, bgcolor: 'grey', color: 'white' }}>
                            <Typography variant='body1' component='div' align='center'>Regulation Type</Typography>
                            <Typography variant='h6' align='center'>{ row?.regulation_type ? row.regulation_type : '-'}</Typography>
                        </Card>
                    </Grid>

                    <Grid
                        size={{
                            lg: 3,
                            md: 4,
                            sm: 6,
                            xs: 12
                        }}>
                        <Card variant="outlined" className={styles.yellow} sx={{ padding: '10px', width: '100%', borderRadius: 2, bgcolor: 'grey', color: 'white' }}>
                            <Typography variant='body1' component='div' align='center'>Created At </Typography>
                            <Typography variant='h6' align='center'>{moment(row?.createdAt).isValid() ? moment(row?.createdAt).format('DD/MM/YYYY') : '-'}</Typography>
                        </Card>
                    </Grid>

                    <Grid
                        size={{
                            lg: 3,
                            md: 4,
                            sm: 6,
                            xs: 12
                        }}>
                        <Card variant="outlined" className={styles.yellow} sx={{ padding: '10px', width: '100%', borderRadius: 2, bgcolor: 'grey', color: 'white' }}>
                            <Typography variant='body1' component='div' align='center'>Created By</Typography>
                            <Typography variant='h6' align='center'>{row?.fullName ? row?.fullName : '-'}</Typography>
                        </Card>
                    </Grid>

                    <Grid
                        size={{
                            lg: 3,
                            md: 4,
                            sm: 6,
                            xs: 12
                        }}>
                        <Card variant="outlined" className={styles.yellow} sx={{ padding: '10px', width: '100%', borderRadius: 2, bgcolor: 'grey', color: 'white' }}>
                            <Typography variant='body1' component='div' align='center'>Due date </Typography>
                            <Typography variant='h6' align='center'>{moment(row?.due_date).isValid() ? moment(row?.due_date).format('DD/MM/YYYY') : '-'}</Typography>
                        </Card>
                    </Grid>

                </Grid>
            </Card>

            <Grid
                size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                }}>
                <RenewalRecordsTable
                    data={renewalRecords?.data}
                    count={renewalRecords?.numRows}
                    numPerPage={recordsPagination.numPerPage}
                    pageCount={recordsPagination.pageCount}
                    handlePageChange={handlePageChange}
                    handlePageSizeChange={handlePageSizeChange}
                />
            </Grid>
            {row?.id &&
    <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
        <RenewalTimelineCard type='compliance' id={row?.id} />
    </Grid>
}
        </div>
        )}

        {row?.repeat === 1 && (
            <Dialog open={optionIndex === 0}>
                <DialogTitle sx={{ width: '400px' }}>Confirmation ?</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure to pause the compliance ?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel}>Cancel</Button>
                    <Button onClick={handlePauseConfirm}>Confirm</Button>
                </DialogActions>
            </Dialog>
        )}
       
        <Dialog open={optionIndex === 2 || (row?. repeat === 1 && optionIndex === 1)} maxWidth='md' fullWidth>
            <AlertsForm
                type='renewalAlert'
                data={row}
                handleCancel={handleCancel}
                handleSubmitClose={handleAlertSubmitClose}
            />
        </Dialog>

        {row?.repeat === 0 && (
            <Dialog open={optionIndex === 1}>
                <DialogTitle sx={{ width: '400px' }}>Confirmation ?</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure to resume the compliance ?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel}>Cancel</Button>
                    <Button onClick={handleResumeConfirm}>Confirm</Button>
                </DialogActions>
            </Dialog>
        )}

            {optionIndex === 0 && row?.repeat === 0 && (
                <NewComplianceForm
                    type='Renew'
                    rowData={row}
                    handleClose={handleCancel}
                    handleSubmitClose={handleAlertSubmitClose}
                />
            )}
        </>
    )
}