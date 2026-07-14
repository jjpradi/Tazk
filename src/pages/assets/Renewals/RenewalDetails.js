import OptionButton from "components/erpDesign/actionButton";
import { useEffect, useState } from "react";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import useStyles from '../../../components/customer_erpDesign/cardStyles';
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { getAllRenewalsAction, getRenewalRecordAction, updatePauseRenewalsAction, updateResumeRenewalsAction } from "redux/actions/renewals_actions";
import RenewalRecordsTable from "./RenewalRecordsTable";
import AlertsForm from "pages/assets/Alerts/Form";
import RenewalsNewForm from "./RenewalsNewForm";
import PropTypes from "prop-types";
import { Card, Grid, Button, Tooltip, IconButton, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import AssetDetails from "./AssetDetails"
import { assetDetailsAction } from "redux/actions/asset_actions";
import MaterialTable from "@material-table/core";
import { maxBodyHeight, headerStyle, cellStyle } from "utils/pageSize";
import { useLocation } from "react-router-dom";
import RenewalTimelineCard from 'components/erpDesign/RenewalTimelineCard'

function RenewalDetails(props){

	const styles = useStyles()
	const dispatch = useDispatch()
	const {
		RenewalsReducers: { renewalRecords },
        AssetReducers : {assetDetails}
	} = useSelector(state => state)

	const [optionIndex, setOptionIndex] = useState(null)
	const [index, setIndex] = useState(null)
	const [rowData, setRowData] = useState({})
    const [recordsPagination, setRecordsPagination] = useState({
        numPerPage: 5,
        pageCount: 0
    })
    useEffect(() => {
        if (!props?.tableData?.length) {
            setIndex(0);
            return;
        }

        const currentIndex = props.tableData.findIndex(
            (item) => item?.index === props?.data?.index
        );
        console.log(currentIndex, "fdgdgdfgd");

        setIndex(currentIndex >= 0 ? currentIndex : 0);
    }, [props.data, props.tableData]);

      const row = props.tableData.find((item) => item.index === index);
      const currentRow = row || props.data || {};
      console.log(row , "sfsdfs");
      

    // const pathName ={path : props.path} 
	// useEffect(() => {
	// 	dispatch(getAllRenewalsAction(pathName))
	// }, [])

	// useEffect(() => {
	// 	if(allRenewals.length > 0) {
	// 		const renewalIndex = allRenewals.findIndex((e) => e.id === props.data.id  || e.type === props.data.type)
	// 		setIndex(renewalIndex)
	// 	}
	// }, [allRenewals])

// 	useEffect(() => { (async () => {
//         if(index !== null && allRenewals.length > 0 && index !== -1) {
//             const renewalData = allRenewals[index]
//             await setRowData(renewalData)
//         }
//     })();
// }, [index, allRenewals])
const location = useLocation()
const path = location.pathname  === "/assets/insurance" ? "Insurance" : location.pathname  === "/assets/warranty" ? "Warranty" : location.pathname ===  "/assets/subscription" ? "subscription" : "seriveDue"
    useEffect(() => {
        if(row){
            dispatch(getRenewalRecordAction({
                id: row.id,
                type: path,
                numPerPage: recordsPagination.numPerPage,
                pageCount: recordsPagination.pageCount
            }))
        }
    }, [row,index])

    useEffect(() => {
        if(row){
            dispatch(assetDetailsAction({
                asset_id: row.asset_id,
            }))
        }
    }, [row])

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

    const type = location.pathname === '/assets/insurance' ? "Insurance" : location.pathname === '/assets/warranty'  ? "Warranty"  :  ""
    const handlePauseConfirm = async () => {
        const payload = {
            id: row.id,
            type: type,
        };
        await dispatch(updatePauseRenewalsAction(payload));
        handleClose();
    };



	const handleResumeConfirm = async () => {
		const payload = {
			id : row.id,
			type : type
		}
		await dispatch(updateResumeRenewalsAction(payload))
		handleClose()
	}
const title = location.pathname === '/assets/insurance' ? 'Insurance Amount' : location.pathname === '/assets/warranty' ? "Warranty Amount" : "Subscription Amount"
const field = location.pathname === '/assets/insurance' ? "insurance_coverage_percentage" : location.pathname === '/assets/warranty' ? "warranty_coverage_percentage" : "subscription_coverage_percentage"
const isInsurancePath = location.pathname;
const coverageColunms = [
    { field: "asset_cost", title: "Asset Cost" },
    { field: "amount", title: title },
    { field: field, title: "coverage %" },
  ];
  
	return (
            
                            <>
            {
                optionIndex === null && 
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

                        <Grid zIndex={1}>
                            <OptionButton
                                disablePause = {row?.pause === 0 && row?.repeat === 1 ? true : false}
                                checkType = 'Renewals'
                                handleRenewalsOptionChange = {handleRenewalsOptionChange}
                            />
                        </Grid>

                        <Grid>
                            <Tooltip title='Previous'>
                                <IconButton color="primary" disabled={index === 0} onClick={handlePrev}>
                                    <ArrowBackIosNewIcon />
                                </IconButton>
                            </Tooltip>
                        </Grid>
            
                        <Grid>
                        <Tooltip title='Next'>
                                <IconButton color="primary" disabled={props.tableData.length -1 === index} onClick={handleNext}>
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
                                <Card variant="outlined" className={styles.red} sx = {{ padding : '10px', width : '100%', borderRadius : 2, bgcolor : 'grey', color : 'white' }}>
                                    <Typography variant='body1' component='div' align='center'> Amount</Typography>
                                    <Typography variant='h6' align='center'>₹ {row?.amount ? row?.amount  : '-'}</Typography>
                                </Card>
                            </Grid>

                            <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <Card variant="outlined" className={styles.red} sx = {{ padding : '10px', width : '100%', borderRadius : 2, bgcolor : 'grey', color : 'white' }}>
                                    <Typography variant='body1' component='div' align='center'>Premium</Typography>
                                    <Typography variant='h6' align='center'>{row?.frequency_type ? row?.frequency_type : '-'}</Typography>
                                </Card>
                            </Grid>


                            <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <Card variant="outlined" className={styles.green} sx = {{ padding : '10px', width : '100%', borderRadius : 2, bgcolor : 'grey', color : 'white' }}>
                                    <Typography variant='body1' component='div' align='center'>Start Date</Typography>
                                    <Typography variant='h6' align='center'>{moment(row?.start_date).isValid() ? moment(row?.start_date).format('DD/MM/YYYY') : '-'}</Typography>
                                </Card>
                            </Grid>

                            <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <Card variant="outlined" className={styles.yellow} sx = {{ padding : '10px', width : '100%', borderRadius : 2, bgcolor : 'grey', color : 'white' }}>
                                    <Typography variant='body1' component='div' align='center'>End Date</Typography>
                                    <Typography variant='h6' align='center'>{moment(row?.end_date).isValid() ? moment(row?.end_date).format('DD/MM/YYYY') : '-'}</Typography>
                                </Card>
                            </Grid>

                            <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <Card variant="outlined" className={styles.yellow} sx = {{ padding : '10px', width : '100%', borderRadius : 2, bgcolor : 'grey', color : 'white' }}>
                                    <Typography variant='body1' component='div' align='center'>Created At </Typography>
                                    <Typography variant='h6' align='center'>{moment(row?.createdAt).isValid() ? moment.utc(row?.createdAt).format('DD/MM/YYYY') : '-'}</Typography>
                                </Card>
                            </Grid>

                            <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <Card variant="outlined" className={styles.yellow} sx = {{ padding : '10px', width : '100%', borderRadius : 2, bgcolor : 'grey', color : 'white' }}>
                                    <Typography variant='body1' component='div' align='center'>Created By</Typography>
                                    <Typography variant='h6' align='center'>{row?.last_name === null ? row?.first_name : `${row?.first_name} ${row?.last_name}`}</Typography>
                                </Card>
                            </Grid>

                            <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <Card variant="outlined" className={styles.blue} sx={{ padding: '10px', width: '100%', borderRadius: 2, bgcolor: 'grey', color: 'white' }}>
                                    <Typography variant='body1' component='div' align='center'>Type</Typography>
                                    <Typography variant='h6' align='center'>{row?.type ? row?.type : '-'}</Typography>
                                </Card>
                            </Grid>


                            <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <Card variant="outlined" className={styles.lav} sx = {{ padding : '10px', width : '100%', borderRadius : 2, bgcolor : 'grey', color : 'white' }}>
                                    <Typography variant='body1' component='div' align='center'>Expires In</Typography>
                                    <Typography variant='h6' align='center'>{row?.expires}</Typography>
                                </Card>
                            </Grid>

                            {
                                currentRow.type === 'Subscription' &&
                                <Grid
                                    size={{
                                        lg: 3,
                                        md: 4,
                                        sm: 6,
                                        xs: 12
                                    }}>
                                    <Card variant="outlined" className={styles.ash} sx = {{ padding : '10px', width : '100%', borderRadius : 2, bgcolor : 'grey', color : 'white' }}>
                                        <Typography variant='body1' component='div' align='center'>Subscription Name</Typography>
                                        <Typography variant='h6' align='center'>{currentRow.subscription_name ? currentRow.subscription_name : '-'}</Typography>
                                    </Card>
                                </Grid>
                            }

                            <Grid
                                size={{
                                    lg: isInsurancePath === '/assets/insurance' ? 6 : 12,
                                    md: isInsurancePath === '/assets/insurance' ? 6 : 12,
                                    sm: 12,
                                    xs: 12
                                }}>
                                <AssetDetails
                                    data={Array.isArray(assetDetails)
                                    ? assetDetails.map((a) => ({ ...a, asset_cost: row?.asset_cost }))
                                    : { ...assetDetails, asset_cost: row?.asset_cost }
                                    }                                    
                                    numPerPage={recordsPagination.numPerPage}
                                    pageCount={recordsPagination.pageCount}
                                    handlePageChange={handlePageChange}
                                    handlePageSizeChange={handlePageSizeChange}
                                />
                            </Grid>
                            {isInsurancePath === '/assets/insurance' && 
                            <Grid
                                size={{
                                    lg: 6,
                                    md: 6,
                                    sm: 12,
                                    xs: 12
                                }}>
                                <MaterialTable
                                    title={"coverage %"}
                                    data={row ? [row] : []}
                                    columns={coverageColunms}
                                    options={{
                                        headerStyle,
                                        cellStyle,
                                        filtering: false,
                                        actionsColumnIndex: -1,
                                        paging: false,
                                        search: false,
                                        maxBodyHeight: maxBodyHeight
                                    }}
                                />
                            </Grid>
                             } 
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
                            {row?.id &&
                            <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
        <RenewalTimelineCard
            type={
                location.pathname === '/assets/insurance' ? 'insurance'
                : location.pathname === '/assets/warranty' ? 'warranty'
                : 'subscription'
            }
            id={row?.id}
        />
    </Grid>
}
                        </Grid>
                    </Card>
                    </div>
                                                }

                    {
                       ( optionIndex === 0 && row?.repeat === 0) && (

                            <RenewalsNewForm
                                type='Renew'
                                data={row}
                                handleClose={handleCancel}
                                handleSubmitClose={handleClose}
                                formType={type}
                                isActive={true}
                            />
                        )
                    }

                    <Dialog open = { optionIndex === 2 ||  (row?.repeat === 1 && optionIndex === 1 )} maxWidth='md' fullWidth>
                        <AlertsForm 
                            type = 'renewalAlert'
                            data = {currentRow}
                            handleCancel = {handleCancel}
                            handleSubmitClose = {handleClose}
                        />
                    </Dialog>
                    
                    {
                        row?.repeat === 1 && 
                        <Dialog open = {optionIndex === 0}>
                            <DialogTitle sx={{ width : '400px' }}>
                                Confirmation ?
                            </DialogTitle>

                            <DialogContent>
                                <DialogContentText>
                                    Are you sure to pause the renewal ?
                                </DialogContentText>
                            </DialogContent>

                            <DialogActions>
                                <Button onClick={handleCancel}>
                                    Cancel
                                </Button>

                                <Button onClick={handlePauseConfirm}>
                                    Confirm
                                </Button>
                            </DialogActions>
                        </Dialog>
                    }

                    {
                        row?.repeat === 0 &&
                        <Dialog open = {optionIndex === 1}>
                            <DialogTitle sx={{ width : '400px' }}>
                                Confirmation ?
                            </DialogTitle>

                            <DialogContent>
                                <DialogContentText>
                                    Are you sure to resume the renewal ?
                                </DialogContentText>
                            </DialogContent>

                            <DialogActions>
                                <Button onClick={handleCancel}>
                                    Cancel
                                </Button>

                                <Button onClick={handleResumeConfirm}>
                                    Confirm
                                </Button>
                            </DialogActions>
                        </Dialog>
                    }
                </>
            
    );
}

RenewalDetails.propTypes = {
	data : PropTypes.object,
	handleClose : PropTypes.func
}

export default RenewalDetails
