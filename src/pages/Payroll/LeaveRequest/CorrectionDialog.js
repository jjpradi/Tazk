import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, InputAdornment, TextField, Typography } from '@mui/material'
import { Form, FormikProvider } from 'formik'
import React, { useContext, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { updateAttendanceAction } from 'redux/actions/attendance_actions';
import apiCalls from 'utils/apiCalls';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { approverVerifierError } from 'redux/actions/load';
import { getsessionStorage } from 'pages/common/login/cookies';
import { listAllLeaveRequestAction } from 'redux/actions/leaveRequest_actions';
import { CreateNotificationAction, getNotificationTokenAction } from 'redux/actions/notification_actions';
import { getDateTimeFormat } from 'utils/getTimeFormat';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import toMomentOrNull from '../../../utils/DateFixer';

function CorrectionDialog(props) {
    const { open, handleClose, data, handleCorrect, handleSetRequest } = props;
    const {
        commoncookie,
        setModalTypeHandler,
        setLoaderStatusHandler,
        headerLocationId,
      } = useContext(CreateNewButtonContext);
    const dispatch = useDispatch();
    const [formValues, setFormValues] = useState({
        first_in_time: '',
        first_out_time: ''
    });
    const [loading, setLoading] = useState(false);
    const handleChange = async (e) => {
        let { name, value } = e.target;
        setStateHandler(name, value);
    };
    const setStateHandler = async (name, value) => {
        let formObj = {};

        formObj = {
            ...formValues,
            [name]: value === '' ? null : value,
        };

        await setFormValues(formObj);
    }

    useEffect(() => {
        const date = new Date(); 
        const date1 = new Date(); 
        const timeStringStartTime = data?.startTime; 
        const [hours, minutes, seconds] = timeStringStartTime.split(':')
        date.setHours(hours);
        date.setMinutes(minutes);
        date.setSeconds(seconds);
        const timeStringEndTime = data?.endTime; 
        const [hours1, minutes1, seconds1] = timeStringEndTime.split(':')
        date1.setHours(hours1);
        date1.setMinutes(minutes1);
        date1.setSeconds(seconds1);
        const formattedStartTime = date.toDateString() + ' ' + date.toLocaleTimeString('en-US', {timeZoneName: 'short'});
        const formattedEndTime = date1.toDateString() + ' ' + date1.toLocaleTimeString('en-US', {timeZoneName: 'short'});
        setFormValues({
            ...formValues,
            first_in_time: formattedStartTime || '', //data?.startTime || '', //formattedStartTime || '',
            first_out_time: formattedEndTime || '' //data?.endTime || '', //formattedEndTime || ''
        });
    }, [data]);

    const handleSubmit = async () => {
        const storage = getsessionStorage()
        let { employee_id } = storage
        let startTime = moment(formValues.first_in_time, 'HH:mm:ss').format('HH:mm:ss');
        let endTime = moment(formValues.first_out_time, 'HH:mm:ss').format('HH:mm:ss');
        let fromDate = moment(data.fromDate).format('YYYY-MM-DD');
        let endDate = moment(data.toDate).format('YYYY-MM-DD');
        const StartisPM = moment(formValues.first_in_time, 'HH:mm:ss').format('A') === 'PM';
        const EndisPM = moment(formValues.first_out_time, 'HH:mm:ss').format('A') === 'PM';
        if (StartisPM) {
            startTime = moment(formValues.first_in_time, 'hh:mm:ss A').format('HH:mm:ss');
        }
        if (EndisPM) {
            endTime = moment(formValues.first_out_time, 'hh:mm:ss A').format('HH:mm:ss');
        }

        const dateString = formValues.first_in_time;
        const date = new Date(dateString);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        // const seconds = String(date.getSeconds()).padStart(2, '0');
        const timeString = `${hours}:${minutes}`; //:${seconds}

        const dateString1 = formValues.first_out_time;
        const date1 = new Date(dateString1);
        const hours1 = String(date1.getHours()).padStart(2, '0');
        const minutes1 = String(date1.getMinutes()).padStart(2, '0');
        // const seconds = String(date.getSeconds()).padStart(2, '0');
        const timeString1 = `${hours1}:${minutes1}`; //:${seconds}

        const approvedBy = {
            approvedBy: storage?.first_name + (storage?.last_name ? storage.last_name !== null ? ' ' + storage.last_name : '' : ''),
            approverId: null,
            verifierId: null,
            request_type: 3,
            department_id: data.department_id,
            leaveId: data.leaveId,
        }
        if (data.isApproverOrVerifier === 'approveAndVerify') {
            approvedBy.approverId = storage?.employee_id
            approvedBy.verifierId = storage?.employee_id
             approvedBy.key = 'ApproverAndVerifier'
        }
        else if (data.isApproverOrVerifier === 'approve') {
            approvedBy.approverId = storage?.employee_id
            approvedBy.key = 'Approver'
        }
        else if (data.isApproverOrVerifier === 'verify') {
            approvedBy.approverId = data.approverId
            approvedBy.verifierId = storage?.employee_id
            approvedBy.key = 'Verifier'
        }
        else {
            approvedBy.approverId = storage?.employee_id
            approvedBy.verifierId = storage?.employee_id
        }


        let Finaldata = {
            id: data.id,
            break_id: data.break_id,
            user_id: data.employee_id,
            leaveId: data.leaveId,
            request_type: 3,
            // approverVerifierId:employee_id,
            Attendance_correction: {
                start_time: `${fromDate} ${timeString}`,
                end_time: `${endDate} ${timeString1}`,
            },
            Break_punches: {
                start_time: data.break_start_time,
                end_time: data.break_end_time,
            },
            old_time: {
                start_time: data.initialStartTime,
                end_time: data.initialEndTime,
            },
            shift_id: data.shift_id,
            approvedBy,
        };
        console.log("Finaldata", Finaldata);

        let leaveData = {
            fromdate: null,
            todate: null,
            type: null,
            employee_id: null,
            pageCount: 0,
            numPerPage: 15,
            key: 'ApprovalPage'
        }
   
        let type = 'Attendance Correction Approval'
        let dataforNotification = {
            type,
            employee_id:data.employee_id,
            keyForNotifications: approvedBy.key,
            request_type_id : 3,
            att_fromDate: fromDate,
            att_InTime: timeString,
            att_outTime:timeString1,
            att_approvedBy: Finaldata?.approvedBy?.approvedBy
        }

        // handleCorrect(data);
        setLoading(true);
        await  apiCalls(setModalTypeHandler, setLoaderStatusHandler,
            dispatch(updateAttendanceAction(Finaldata.id, Finaldata.break_id, Finaldata, () => { },setModalTypeHandler, setLoaderStatusHandler,
            async(response) => {

                    if (response == 200) {
                        setLoading(false);
                        handleClose(false);
                        await dispatch(
                            getNotificationTokenAction(dataforNotification, (res) => {
                              if (res?.status === 200) {
                                dispatch(
                                  CreateNotificationAction({
                                    content_body: res?.data.body,
                                    receiver:res?.data.receiver_id,
                                    title: res?.data?.title,
                                    time: getDateTimeFormat(new Date()),
                                    active: '1',
                                   
                                  }),
                                );
                              }
                            }),
                          );
                        dispatch(listAllLeaveRequestAction(leaveData, storage.employee_id))
                        handleSetRequest()
                    }
                }
            ))
        )
    };
    // console.log(Finaldata,"Finaldata")

    const convertTime12to24 = (time12h) => {
        const [time, modifier] = time12h.split(' ');

        let [hours, minutes] = time.split(':');

        if (hours === '12') {
            hours = '00';
        }

        if (modifier === 'PM') {
            hours = parseInt(hours, 10) + 12;
        }

        return `${hours}:${minutes}`;
    }
// const timeInCheck = formValues.first_in_time.split(' ')
// const timeOutCheck = formValues.first_out_time.split(' ')

    return (
        <Dialog
            open={open}
            onClose={() => handleClose(false)}
            //PaperComponent={PaperComponent}
            maxWidth='sm'
            maxHeight='sm'
            fullWidth
            aria-labelledby='Attendance Correction'
        >
            <DialogTitle style={{ cursor: 'move' }} id='Attendance Correction'>
                <Typography>{'Attendance Correction'}</Typography>
            </DialogTitle>
            <DialogContent>
                <Box width='100%' sx={{ p: '10px' }} gap={2}>
                    <Grid container spacing={2} >
                        <Grid
                          size={{
                                lg: 6,
                                md: 6,
                                sm: 6,
                                xs: 6
                            }} 
                            display={'flex'}
                            justifyContent={"center"}
                        >
                            <Typography variant='h6'>IN</Typography>
                        </Grid>
                        <Grid
                            size={{
                                lg: 6,
                                md: 6,
                                sm: 6,
                                xs: 6
                            }}
                            display={'flex'}
                            justifyContent={"center"}
                        >
                            <Typography variant='h6'>OUT</Typography>
                     
                        </Grid>
            
                        {/* <TextField
                            fullWidth={true}
                            onChange={handleChange}
                            label="Correction Start time"
                            name='first_in_time'
                            type='time'
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                            regex=''
                            value={moment(formValues.first_in_time, 'HH:mm:ss').format('HH:mm:ss')}
                            InputProps={{
                                inputProps: { step: 1 }
                                // endAdornment: (
                                //     <InputAdornment position="end">
                                //         {formValues.first_in_time && (
                                //             <span>{timeInCheck[1] === 'AM' ? 'PM' : ''}</span>
                                //         )}
                                //     </InputAdornment>
                                // ),
                            }}
                        //error={formErrors.first_in_time}
                        // helperText={formErrors.first_in_time === null ? '' : 'Start Time is Required!'}
                        ></TextField> */}
                        <Grid
                            size={{
                            lg: 6,
                            md: 6,
                            sm: 6,
                            xs: 6
                            }}
                        >
                        <LocalizationProvider dateAdapter={DateAdapter}>                            
                        <TimePicker
                        
                          name='first_in_time'
                          label="Correction Start time"
                        //   value={moment(formValues.first_in_time, 'HH:mm').format('HH:mm')}
                        value={toMomentOrNull(formValues.first_in_time)}
                          onChange={(time) =>{
                              handleChange({
                              target: {value: time, name: 'first_in_time'},
                              });
                              // setFormValues({...formValues,first_in_time:time})
                          }}
                          // onChange={handleChange}
                          slotProps={{ textField: { fullWidth: true, required: true, variant: "outlined" } }}
                        />
                              
                        </LocalizationProvider>
                        </Grid>
                        {/* <TextField
                            fullWidth={true}
                            onChange={handleChange}
                            label="Correction End time"
                            name='first_out_time'
                            type='time'
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                            regex=''
                            value={moment(formValues.first_out_time, 'HH:mm:ss').format('HH:mm:ss')}
                            InputProps={{
                                inputProps: { step: 1 }
                                // endAdornment: (
                                //     <InputAdornment position="end">
                                //         {formValues.first_out_time && (
                                //             <span>{timeOutCheck[1] === 'AM' ? 'AM' : 'PM'}</span>
                                //         )}
                                //     </InputAdornment>
                                // ),
                            }}
                        // error={formErrors.first_in_time}
                        //helperText={formErrors.first_in_time === null ? '' : 'Start Time is Required!'}
                        ></TextField> */}

                       <Grid
                            size={{
                            lg: 6,
                            md: 6,
                            sm: 6,
                            xs: 6
                            }}
                        >   
                        <LocalizationProvider dateAdapter={DateAdapter}>                            
                        <TimePicker
                        
                          name='first_out_time'
                          label="Correction End time"
                            //   value={moment(formValues.first_out_time, 'HH:mm').format('HH:mm')}
                            value={toMomentOrNull(formValues.first_out_time)}
                          onChange={(time) =>{
                              handleChange({
                              target: {value: time, name: 'first_out_time'},
                              });
                              // setFormValues({...formValues,first_out_time:time})
                          }}
                          // onChange={handleChange}
                          slotProps={{ textField: { fullWidth: true, required: true, variant: "outlined" } }}
                        />
                              
                        </LocalizationProvider>
                       </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button color='secondary' onClick={() => handleClose(false)}>
                    {'Close'}
                </Button>
                {/* <Button onClick={handleSubmit}>{'Correct'}</Button> */}
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Correct'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default CorrectionDialog