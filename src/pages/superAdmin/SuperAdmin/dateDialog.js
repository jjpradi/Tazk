import React, { useContext, useEffect, useState } from 'react';
import {
    Avatar,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    TextField
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import RestoreIcon from '@mui/icons-material/Restore';
import { getSubscriptionRecords, updateSubscriptionDateAction } from 'redux/actions/superAdmin_action';
import { ErrorAlert } from 'redux/actions/load';
import { UpdateCompanyTimeLineAction,  updateSubscriptionRecords } from 'redux/actions/userCreation_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import { OpenalertActions } from 'redux/actions/alert_actions';
import Context from '../../../context/CreateNewButtonContext';

export default function DateDialog({ rowData, alertOpen, setOpenAlert }) {
    const [open, setOpen] = useState(false);
    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [selectedEndDate, setSelectedEndDate] = useState(null);
    const [button, setButton] = useState(0);
    let storage = getsessionStorage();
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId
  } = useContext(Context);
    const dispatch = useDispatch();
    const { UserCreationReducer: { subscription_records } } = useSelector(state => state)

    let activeSubs = subscription_records.filter((d, i) => d.status === 'ACTIVE_SUB')
    let upComingSubs = subscription_records.filter((d, i) => d.status === 'UPCOMING_SUB')

    const handleClose = () => {
        setOpenAlert(false)
    };
    useEffect(() => {

    })
    const handleClickOpen = () => {
        if (rowData.status === 'Approved') {
            setOpen(true);
        } else {
            ErrorAlert(dispatch, { message: 'This Is Only Applicable To Approved Companies.' });
        }
    };

    useEffect(() => {
        dispatch(getSubscriptionRecords(rowData.company_id))

    }, [])
    // let payload = {
    //     timeLineContent: [`Request for ${rowData.company_name} has been Rejected`],
    //     company_id: rowData.company_id,
    //     employee_id: storage.employee_id,
    //     type: 'Rejected',
    //     // value: value
    // }
    //     dispatch(UpdateCompanyTimeLineAction(payload))
    const dayDiff = () => {
        const startMoment = rowData.isExpired === 0 ? moment(rowData.subEnd) : moment(selectedStartDate);
        const endMoment = moment(selectedEndDate);
        return endMoment.diff(startMoment, 'days');
    }
    const handleDateChange = (date, isStartDate) => {
        // isStartDate ? setSelectedStartDate(date) : setSelectedEndDate(date);
    };

    const handleUpdate = () => {
        const startDate = moment(selectedStartDate).format('YYYY-MM-DD HH:mm:ss');
        const endDate = moment(selectedEndDate).format('YYYY-MM-DD HH:mm:ss');
        let currDate = moment(); // Current date and time

        // Convert endDate to a moment object
        let endMoment = moment(selectedEndDate, 'YYYY-MM-DD HH:mm:ss');
    
        // Calculate the difference in days
        let differenceInDays = endMoment.diff(currDate, 'days');


        let sDate = rowData.isExpired === 0 ? rowData.subStart : startDate
        
        let subscriptionDetailsExpiry = {
            email: rowData.email,
            phone_number: rowData.mobile,
            domainname: rowData.company_name,
            company_id: rowData.company_id,
            subscriptionStartDate: sDate,
            subscriptionEndDate: endDate,
            sRemainingDays: differenceInDays
        };
        
        dispatch(
            updateSubscriptionDateAction(subscriptionDetailsExpiry,setModalTypeHandler,setLoaderStatusHandler)
        )
        .then(() => {
            let payload = {
                timeLineContent: [ `Subscription has been changed ,Start date : ${moment(sDate).format('DD-MM-YYYY')} End date :  ${moment(endDate).format('DD-MM-YYYY')}`],
                company_id: rowData.company_id,
                employee_id: storage.employee_id,
                type: 'Edit details',
                value: 0
            }
                dispatch(UpdateCompanyTimeLineAction(payload , ()=>{}))
        })
            .then(() => {
                const selectedStartDateStr = moment(selectedStartDate).format('YYYY-MM-DD HH:mm:ss');
                const selectedEndDateStr = moment(selectedEndDate).format('YYYY-MM-DD HH:mm:ss');
                if (rowData.subStart !== selectedStartDateStr || rowData.subEnd !== selectedEndDateStr) {
                    const startDate = rowData.isExpired === 0
                        ? moment(rowData.subEnd).format('YYYY-MM-DD HH:mm:ss')
                        : selectedStartDateStr

                    let data = {
                        subscription_start_date: startDate,
                        subscription_end_date: endDate,
                        subscription_period: dayDiff(),
                        company_id: rowData.company_id,
                        status: activeSubs.length == 0 ? 'ACTIVE_SUB' : 'UPCOMING_SUB'
                    }
                    dispatch(updateSubscriptionRecords(data))
                    //     .then(() => {
                    //         dispatch(getSubscriptionRecords(rowData.company_id))

                    // })
                }
        })
        handleClose();
    };

    const handleSubscriptionDuration = (months) => {
        
        const startDate = rowData.isExpired === 1 ? moment() : (rowData.subEnd ? moment(rowData.subEnd) : moment());
        const endDate = moment(startDate).add(months, 'months').hour(12).minute(0).second(0);

        if (upComingSubs.length === 0) {

            setSelectedStartDate(startDate)
            setSelectedEndDate(endDate)
            setButton(months);
        } else {
            dispatch(OpenalertActions({ msg: 'Cannot update as there is already an upcoming subscription', severity: 'error' }))
        }

    };
    return (
        <>
            {/* <Chip
                label="Renew"
                color="primary"
                onClick={handleClickOpen}
                avatar={<Avatar><RestoreIcon /></Avatar>}
            /> */}
            <Dialog open={alertOpen} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                <DialogTitle id="datedialog-dialog-title">{"Manage Subscription"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="datedialog-dialog-description">
                        <LocalizationProvider dateAdapter={DateAdapter}>
                            <Grid container display={'flex'} justifyContent={'center'}>
                                <Grid item xs={12} pb="20px">
                                    <Grid container spacing={2}>
                                        {[1, 3, 6, 12].map(months => (
                                            <Grid
                                                item
                                                key={months}
                                                xs={6}
                                                sm={3}
                                                md={3}
                                                lg={3}
                                                >
                                                <Button
                                                    fullWidth
                                                    variant={button === months ? 'contained' : 'outlined'}
                                                    onClick={() => handleSubscriptionDuration(months)}
                                                >
                                                    {`${months} Month`}
                                                </Button>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Grid>


                                <Grid
                                    size={{
                                        lg: 12,
                                        md: 12
                                    }}>
                                    {rowData.isExpired === 1 &&
                                    <DatePicker
                                        label="Start Date"
                                        value={selectedStartDate}
                                        disabled
                                        onChange={(e) => handleDateChange(e, true)}
                                        slotProps={{ textField: { InputProps: {
                                                    readOnly: true
                                                }, sx: { mr: 2 } } }}
                                    />
                                }
                                    <DatePicker
                                        label="End Date"
                                        value={selectedEndDate}
                                        disabled
                                        onChange={(e) => handleDateChange(e, false)}
                                        slotProps={{ textField: { InputProps: {
                                                    readOnly: true
                                                } } }}
                                    />

                                </Grid>
                            </Grid>
                        </LocalizationProvider>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color='warning'>Close</Button>
                    <Button disabled={selectedEndDate === null || selectedStartDate === null} onClick={handleUpdate} color='primary'>Update</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
