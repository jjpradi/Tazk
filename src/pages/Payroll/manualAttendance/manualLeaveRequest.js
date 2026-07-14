import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { Button, TextField, Typography, Grid, FormHelperText } from '@mui/material';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { DatePicker, DesktopDatePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import moment from 'moment';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { format, toDate } from 'date-fns';
import { getDateTimeFormat } from 'utils/getTimeFormat';
import IOSSwitch from 'utils/cssSwitch';
import { ErrorAlert } from 'redux/actions/load';
import { useDispatch, useSelector } from 'react-redux';
import { getPaidleaveForManualAtt, getpermissiondataForManualAttAction, leaveTypeForManualAttAction } from 'redux/actions/leaveRequest_actions';
import toMomentOrNull from 'utils/DateFixer';

function ManualLeaveAndPermission(props) {
    // const textRef = useRef(null);
    // const primary = grey[300]

    const dispatch = useDispatch();
    const [value, setValue] = React.useState('1');
    const { reason, handleInputChange, handleTimeChange, formErrors, handleLogTime, handleEmployeeId, formValues, setFormValues } = props;
    const { appConfigReducer: { getManualAttEmp } } = useSelector((state) => state);
    const time = moment()
    const curDate = moment()
    const endTimeval = curDate.add(1, 'hours')
    const [dayChecked, setDayChecked] = useState(true);
    const [selectedEmployee, setSelectedEmployee] = useState();
    const employeesData = getManualAttEmp || [];

    const [from, setFrom] = useState(moment());
    const [to, setTo] = useState(moment());


    var now = new Date();
    const date = format(now, 'yyyy-mm-dd')

    const defaultTime8clk = () => {
        var now = new Date();
        now.setHours(8);
        now.setMinutes(0);
        now.setMilliseconds(0);
        return now
    }

    const defaultTime5clk = () => {
        var now = new Date();
        now.setHours(16);
        now.setMinutes(0);
        now.setMilliseconds(0);
        return now
    }


    const [startTime, setStartTime] = React.useState(moment(defaultTime8clk()));
    const [endTime, setEndTime] = React.useState(moment(defaultTime5clk()));


    useEffect(() => {
        if (selectedEmployee) {
            dispatch(leaveTypeForManualAttAction({ employee_id: selectedEmployee }))
            dispatch(getPaidleaveForManualAtt({ employee_id: selectedEmployee }))
        }
    }, [selectedEmployee])

    
    useEffect(() => {
        // console.log("props.request_type",props.request_type)
        if (selectedEmployee && props.request_type === '2' ) {
            dispatch(getpermissiondataForManualAttAction({ employee_id: selectedEmployee,fromDate :from }))
        }
    }, [selectedEmployee,props.request_type])




    useEffect(() => {

        if (props.dayChecked === true) {
            setFormValues({ ...formValues, startTime: null, endTime: null })
        }
        else {
            setFormValues({ ...formValues, startTime: null, endTime: null })

        }

    }, [props.dayChecked])

    const handleChange = async (e) => {
        let { name, value, checked } = e.target;
        let formObj = {};
        formObj = {
            ...formValues,
            [name]: value === '' ? null : value,
        };
        await setFormValues(formObj);
    };

    useEffect(() => {
        let errObj = props.dayChecked === true ?
            { from: null, to: null, reason: null, permissionType: null, leaveType: null } :
            { from: null, startTime: null, endTime: null, reason: null, halfDayType: null, halfDayReason: null, permissionType: null, leaveType: null, shiftId: null }
        props.handleValidation(formValues, errObj)
    }, [])

    useEffect(() => {
        props.setRequiredFieldReqHandler(
            formValues.halfDay === true
                ?
                [
                    "halfDayType",
                    // "halfDayReason"
                ]
                :
                props.request_type === '1' ?
                    [
                        // "startTime",
                        // "endTime",
                        // "reason",
                        "leaveType",
                        // "halfDayReason",                
                    ]
                    :
                    [
                        // "startTime",
                        // "endTime",
                        // "reason",
                        // "halfDayReason",
                        "permissionType"
                    ]
        )
    }, [formValues.halfDay])

    const handleAllDay = (e) => {
        setFormValues({ ...formValues, halfDay: e.target.checked });
    };

    const handleEmployeeChange = (event) => {
        setSelectedEmployee(event.target.value);
        let emp = employeesData?.data?.find(x => x?.employee_id == event.target.value);
        handleEmployeeId(event.target.value, emp)
    };

    useEffect(() => {
        if (formValues.halfDay === true) {
            setFormValues({ ...formValues, endTime: time })

            props.handleChange({
                target: { value: time, name: 'endTime' },
            });
        }
    }, [formValues.halfDay])


    return (
        <Grid container display='flex' alignItems='center' spacing={3}>
            <Grid
                size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                }}>
                {props.request_type === '1' ?
                    <Grid container spacing={3}>
                        <Grid
                            display='flex'
                            justifyContent='flex-end'
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                            <FormGroup>
                                <FormControlLabel
                                    control={
                                        <IOSSwitch
                                            sx={{ m: 2 }}
                                            checked={formValues.halfDay}
                                            name="halfDay"
                                            value={formValues.halfDay}
                                            onChange={(e) => {
                                                props.handleChange({
                                                    target: { value: e.target.checked, name: 'halfDay' },
                                                })
                                                handleAllDay(e)
                                            }}
                                        />
                                    }
                                    label={"Half Day"}
                                />
                            </FormGroup>
                        </Grid>
                        <Grid size={12}>
                            <FormControl fullWidth variant="filled" required>
                                <InputLabel>Select Employee </InputLabel>
                                <Select
                                    value={selectedEmployee}
                                    onChange={handleEmployeeChange}
                                    label="Select Employee"
                                    name="user_id"
                                    required
                                    error={formErrors.user_id ? true : false}
                                    MenuProps={{
                                        PaperProps: {
                                          style: {
                                            maxHeight: 300,
                                            overflowY: 'auto',
                                          },
                                        },
                                      }}
                                >
                                    {employeesData?.data?.map((employee) => (
                                        <MenuItem key={employee.employeeId} value={employee.employee_id}>
                                            {employee.full_name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText style={{ color: '#f44336' }}>{formErrors.user_id === null ? '' : 'Employee is Required!'}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid
                            size={{
                                lg: formValues.halfDay === true ? 12 : 6,
                                md: formValues.halfDay === true ? 12 : 6,
                                sm: formValues.halfDay === true ? 12 : 6,
                                xs: formValues.halfDay === true ? 12 : 12
                            }}>
                            <LocalizationProvider dateAdapter={DateAdapter}>
                                <DatePicker
                                    name='from'
                                    label={formValues.halfDay ? 'Date' : 'Start Date'}
                                    inputVariant='outlined'
                                    value={props.from ? toMomentOrNull(props.from) : curDate}
                                    format='DD/MM/YYYY'
                                    onChange={(date) => {
                                        props.handleChange({
                                            target: { value: date, name: 'from' },
                                        })
                                        setFrom(date);
                                    }
                                    }
                                    views={['year', 'month', 'day']}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            required: true,
                                            variant: 'filled',
                                            error: from === null ? true : false,
                                            helperText: props.formErrors["from"] !== null ? props.formErrors["from"] : "",
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        {!formValues.halfDay === true && <Grid
                            size={{
                                lg: 6,
                                md: 6,
                                sm: 6,
                                xs: 12
                            }}>
                            <LocalizationProvider dateAdapter={DateAdapter}>
                                <DatePicker
                                    name='to'
                                    label='End Date'
                                    inputVariant='outlined'
                                    disabled={from === ''}
                                    format='DD/MM/YYYY'
                                    value={props.to ? toMomentOrNull(props.to) : toMomentOrNull(curDate)}
                                    onChange={(date) => {
                                        props.handleChange({
                                            target: { value: date, name: 'to' },
                                        })
                                        setTo(date)
                                    }}
                                    views={['year', 'month', 'day']}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            required: true,
                                            variant: 'filled',
                                            error: to === null ? true : false,
                                            helperText: props.formErrors["to"] !== null ? props.formErrors["to"] : "",
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>}
                        <Grid
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                            <FormControl
                                required
                                fullWidth error={props.formErrors["leaveType"] !== null && formValues.leaveType === null ? true : false} variant='filled'>
                                <InputLabel id="leave-type-select-label">Leave Type</InputLabel>
                                <Select
                                    name="leaveType"
                                    labelId="demo-simple-select-label"
                                    id="manualleaverequest-select-300"
                                    value={formValues.leaveType || ''}
                                    onChange={(v) => {
                                        handleChange(v);
                                        props.handleChange(v)
                                    }}
                                >
                                    {props.leaveType.map(i => {
                                        return <MenuItem key={i.id} value={i.leave_type}>{i.leave_type}</MenuItem>
                                    })}

                                </Select>
                                {(props.formErrors["leaveType"] !== null) && (formValues.leaveType === null) ? <FormHelperText>Leave Type is required</FormHelperText> : formValues.leaveType === 'Privilege Leave' ? <FormHelperText> {`Available Privilege Leave ${props.paidleavecount[0]?.availableLeaveCount}`}</FormHelperText> : ''}
                            </FormControl>
                        </Grid>
                        {formValues.halfDay === true && <Grid
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                            <FormControl
                                required
                                fullWidth
                                error={props.formErrors["halfDayType"] !== null && formValues.halfDayType === null ? true : false} variant='filled'>
                                <InputLabel id="half-day-type-select-label">Half Day Type</InputLabel>
                                <Select
                                    name="halfDayType"
                                    labelId="demo-simple-select-label"
                                    id="manualleaverequest-select-330"
                                    value={formValues.halfDayType}
                                    onChange={(v) => {
                                        handleChange(v);
                                        props.handleChange(v)
                                    }}
                                    renderInput={(params) =>
                                        <TextField fullWidth {...params} />}
                                >
                                    {props.halfDayType?.map(i => {
                                        return <MenuItem key={i.id} value={i.leave_type}>{i.leave_type}</MenuItem>
                                    })}
                                </Select>
                                {props.formErrors["halfDayType"] !== null && formValues.halfDayType === null && <FormHelperText>Half Day Type is required</FormHelperText>}
                            </FormControl>
                        </Grid>}
                    </Grid>
                    :
                    <Grid container spacing={3}>
                        <Grid size={12}>
                            <FormControl fullWidth variant="filled" required>
                                <InputLabel>Select Employee </InputLabel>
                                <Select
                                    value={selectedEmployee}
                                    onChange={handleEmployeeChange}
                                    label="Select Employee"
                                    name="user_id"
                                    required
                                    error={formErrors.user_id ? true : false}
                                    MenuProps={{
                                        PaperProps: {
                                          style: {
                                            maxHeight: 300,
                                            overflowY: 'auto',
                                          },
                                        },
                                      }}
                                >
                                    {employeesData?.data?.map((employee) => (
                                        <MenuItem key={employee.employeeId} value={employee.employee_id}>
                                            {employee.full_name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText style={{ color: '#f44336' }}>{formErrors.user_id === null ? '' : 'Employee is Required!'}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                            <LocalizationProvider dateAdapter={DateAdapter}>
                                <DatePicker
                                    name='from'
                                    label='Date'
                                    inputVariant='outlined'
                                    value={props.from ? toMomentOrNull(props.from) : toMomentOrNull(curDate)}
                                    format='DD/MM/YYYY'
                                    onChange={(date) => {
                                        props.handleChange({
                                            target: { value: date, name: 'from' },
                                        })
                                        setFrom(date)
                                        props.dateValidation("from", date)
                                    }
                                    }
                                    views={['year', 'month', 'day']}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            required: true,
                                            variant: 'filled',
                                            error: props.formErrors["from"] !== null ? true : false,
                                            helperText: props.formErrors["from"] !== null ? props.formErrors["from"] : "",
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid
                            size={{
                                lg: 6,
                                md: 6,
                                sm: 6,
                                xs: 12
                            }}>
                            <LocalizationProvider dateAdapter={DateAdapter}>
                                <TimePicker
                                    name="startTime"
                                    label="Start Time"
                                    value={toMomentOrNull(formValues.startTime) ? moment(formValues.startTime) : time}
                                    onKeyDown={(e) => e.preventDefault()}
                                    onChange={(time) => {
                                        props.handleChange({
                                            target: { value: time, name: 'startTime' },
                                        });
                                        setFormValues({ ...formValues, startTime: time })
                                    }}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            required: true,
                                            variant: 'filled',
                                            error: props.formErrors["startTime"] !== null ? true : false,
                                            helperText: props.formErrors["startTime"] !== null ? "Start Time is required" : "",
                                            disabled: formValues.halfDay && true,
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid
                            size={{
                                lg: 6,
                                md: 6,
                                sm: 6,
                                xs: 12
                            }}>
                            <LocalizationProvider dateAdapter={DateAdapter}>
                                <TimePicker
                                    name="endTime"
                                    label="End Time"
                                    value={toMomentOrNull(formValues.endTime) ? moment(formValues.endTime) : endTimeval}
                                    onKeyDown={(e) => e.preventDefault()}
                                    onChange={(time) => {
                                        props.handleChange({
                                            target: { value: time, name: 'endTime' },
                                        });
                                        setFormValues({ ...formValues, endTime: time })
                                    }}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            required: true,
                                            variant: 'filled',
                                            error: props.formErrors["endTime"] !== null ? true : false,
                                            helperText: props.formErrors["endTime"] !== null ? "EndTime is required" : "",
                                            disabled: formValues.halfDay && true,
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                    </Grid>
                }
            </Grid>
            <Grid
                size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                }}>
                {props.request_type === '2' && <FormControl
                    required
                    fullWidth error={props.formErrors["permissionType"] !== null && formValues.permissionType === null ? true : false} variant='filled'>
                    <InputLabel id="permission-type-select-label">Permission Type</InputLabel>
                    <Select
                        name="permissionType"
                        labelId="demo-simple-select-label"
                        id="manualleaverequest-select-493"
                        value={formValues.permissionType}
                        onChange={(v) => {
                            handleChange(v);
                            props.handleChange(v)
                        }}
                        renderInput={(params) =>
                            <TextField fullWidth {...params}
                            />}
                    >
                        {props.leaveType.map(i => {
                            return <MenuItem key={i.id} value={i.leave_type}>{i.leave_type}</MenuItem>
                        })}

                    </Select>
                    {props.formErrors["permissionType"] !== null && formValues.permissionType === null && <FormHelperText>Permission Type is required</FormHelperText>}
                </FormControl>}
            </Grid>
            <Grid
                size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                }}>
                <TextField
                    focused
                    name="halfDayReason"
                    fullWidth
                    id="reason-textarea"
                    label="Reason"
                    value={formValues.reason}
                    variant="filled"
                    InputProps={{ readOnly: true }}
                />
            </Grid>
        </Grid>
    );
}

export default ManualLeaveAndPermission;