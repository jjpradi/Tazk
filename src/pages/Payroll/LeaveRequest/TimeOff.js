import React, {useState, useEffect, useRef, useContext} from 'react';
import _ from 'lodash';
import {Button, TextField, Typography, Grid, FormHelperText} from '@mui/material';
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
import { getPaidLeavecount, getRestrictedHolidaysDataAction } from 'redux/actions/leaveRequest_actions';
import apiCalls from 'utils/apiCalls';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { getByCompanyCategoryHolidaysAction } from '../../../redux/actions/holidays_actions'
import toMomentOrNull from 'utils/DateFixer';


function TimeOff(props) {

    // console.log("props",props.formErrors)
  // const textRef = useRef(null);
    // const primary = grey[300]



  const dispatch = useDispatch();

  const { leaveRequestReducer: { getRestrictedHolidaysData} } = useSelector(state => state)

  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(CreateNewButtonContext);
  const [value, setValue] = React.useState('1');
  const time = moment()
  const curDate = moment()
  const endTimeval = curDate.add(1,'hours') 
  const [dayChecked, setDayChecked] = useState(true);
    
  const [formValues, setFormValues] = useState({
    date: moment(),
    from: moment(),
    to: moment(),
    startTime: time,
    endTime: endTimeval,
    reason: null,
    note: null,
    halfDay: false,    
    restrictedHoliday: false,
    restrictedHolidayDatas: null,    
    // holidayDate: '',    
    halfDayType: null,
    permissionType: null,
    halfDayReason: null,
    leaveType: null,
    shiftId:null,
    LoggedFromDate:  moment(),
    LoggedToDate:  moment(),
    halfDayLoggedDate:  moment()
  });

  const [from, setFrom] = useState(moment());
  const [to, setTo] = useState(moment());
  const [RestrictedHoliday, setRestrictedHoliday] = useState([]);
  const [LoggedFromDate, setLoggedFromDate] = useState(moment());
  const [LoggedToDate, setLoggedToDate] = useState(moment());
  const [halfDayLoggedDate, setHalfDayLoggedDate] = useState(moment());
  const [filteredLeaveType, setFilteredLeaveType] = useState(props.leaveType);
// console.log("formValues",formValues)
  var now  = new Date();
  const date = format(now, 'yyyy-mm-dd')
// now.setDate(now.getDate() + 1)
// now.setHours(8);
// now.setMinutes(0);
// now.setMilliseconds(0);
console.log(getByCompanyCategoryHolidaysAction, "getByCompanyCategoryHolidaysAction")


 const defaultTime8clk = () => {
    var now  = new Date();
    now.setHours(8);
    now.setMinutes(0);
    now.setMilliseconds(0);
    return now
 }

 const defaultTime5clk = () => {
    var now  = new Date();
    now.setHours(16);
    now.setMinutes(0);
    now.setMilliseconds(0);
    return now
 }

//  const parseDaytime = (time) => {
//     let [hours, minutes] = time.substr(0, time.length  -2).split(":").map(Number);
//     if (time.includes("pm") && hours !== 12) hours += 12;
//     return 1000/*ms*/ * 60/*s*/ * (hours * 60 + minutes);
//   }
  
  const [startTime, setStartTime] = React.useState(moment(defaultTime8clk()));
  const [endTime, setEndTime] = React.useState(moment(defaultTime5clk()));

//   const handleChange1 = async (e) => {
//     let {name, value} = e.target;
//     if(name === "startTime"){
//         await setStartTime(value.$d);
//         let formObj = {};
//             formObj = {
//                 ...formValues,
//                 [name]: value === '' ? null : moment(startTime,'hh:mm').format('LT'),
//               };
//         await setFormValues(formObj);
//     } else{
//         await setEndTime(value._d);
//         let formObj = {};
//             formObj = {
//                 ...formValues,
//                 [name]: value === '' ? null : moment(endTime,'hh:mm').format('LT'),
//               };
//         await setFormValues(formObj);
//     }
   
//   };

  useEffect(() => {
  
    if(props.dayChecked === true ){
        setFormValues({ ...formValues, startTime: null, endTime: null })
    }
    else{
        setFormValues({ ...formValues, startTime: null, endTime: null })

    }

  },[props.dayChecked])

  useEffect(()=>{
    apiCalls(
        setModalTypeHandler, 
        setLoaderStatusHandler,
        dispatch(getRestrictedHolidaysDataAction())
    )
  }, [formValues.leaveType === "Restricted Holiday"])

  useEffect(() => {
  if (formValues.leaveType) {
    const data = { leaveType: formValues.leaveType };

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getPaidLeavecount(from.month() + 1, from.year(), data))
    );
  }
}, [formValues.leaveType]);

    
  useEffect(() => { (async () => {
    const fetchHolidays = async () => {
      try {
        const response = await dispatch(
          getByCompanyCategoryHolidaysAction(setModalTypeHandler, setLoaderStatusHandler)
        );
        setRestrictedHoliday(response);
      } catch (error) {
        console.error('Error fetching holidays:', error);
      }
    };

    fetchHolidays();
  })();
}, []); 
    
//     useEffect(() => {
//       console.log(props.from, "fromAAA")
//         if (Array.isArray(props.holidays) && props.from) {
//         console.log("HIii")
//       const isHoliday = props.holidays.some(
//         (holiday) => moment(holiday.holiday_date).isSame(moment(from), "day")
//       );
  
//       if (isHoliday) {
//         setFilteredLeaveType(props.leaveType.filter((item) => item.leave_type !== "Restricted Holiday"));
//       } else {
//         setFilteredLeaveType(props.leaveType);
//       }
//         } else {
//             console.log("Ghhh")
//       setFilteredLeaveType(props.leaveType);
//     }
//   }, [props.from, props.holidays, props.leaveType]);
    

  const handleChange = (e) => {
    let {name, value, checked} = e.target;
    let formObj = {};
        formObj = {
            ...formValues,
            [name]: value === '' ? null : value,
          };
          if(formValues.leaveType === "Restricted Holiday"){
            const holiday_date = moment(e.target.value.date).format('DD-MM-YYYY')
            formObj = {
                ...formObj,
                restrictedHolidayDatas: e.target.value.value,
                // holidayDate: holiday_date,
              };
        }
        setFormValues((prev) => ({
                ...prev,
                [name]: value
            }));
    //   setFormValues(formObj);
    //if(name === 'allDay'){
       //await setDayChecked(checked)
        // let formObj1 = {};
        // formObj1 = {
        //     ...formValues,
        //     [name]: checked === '' ? null : checked,
        //   };
          //await setFormValues(formObj1);

    
    // setDayChecked({...dayChecked, dayChecked})

    // setStateHandler(name, value);
  };

  useEffect(() => {
    let errObj = props.dayChecked === true ? 
    {from:null ,to:null,reason:null,permissionType:null,leaveType:null} : 
    {from:null,startTime:null ,endTime:null,reason:null,halfDayType:null,halfDayReason:null,permissionType:null,leaveType:null,shiftId:null}
    // let curFrom = formValues.from !== null ? formValues.from : curDate
    // let curTo = formValues.to !== null ? formValues.to : curDate
    // setFormValues({ ...formValues, from : curFrom, to : curTo })
     props.handleValidation(formValues,errObj)
  },[])
  //////
    // useEffect(() => {
    //     props.setRequiredFieldReqHandler(
    //         props.dayChecked === true
    //             ?
    //             [
    //                 "from",
    //                 "to",
    //                 "halfDayType",
    //                 "halfDayReason"
    //             ] : [
                    
    //                 "startTime",
    //                 "endTime",
    //                 "reason"                    
    //             ]
    //     )
    // }, [])

    useEffect(() => {
        props.setRequiredFieldReqHandler(
            formValues.leaveType === "Restricted Holiday" ?
            [
                "restrictedHolidayDatas",
                // "holidayDate"
            ] :
            formValues.halfDay === true
                ? 
                formValues.leaveType === 'Compensatory Off '
                ? [
                    "halfDayType",
                    "halfDayReason",
                    "halfDayLoggedDate"
                ]
                : [
                    "halfDayType",
                    "halfDayReason"
                ]
                : 
                    props.request_type === '1' ?
                    formValues.leaveType === 'Compensatory Off '
                    ?  [                    
                        "startTime",
                        "endTime",
                        // "reason",
                        "leaveType",
                        "halfDayReason",    
                        "LoggedFromDate",
                        "LoggedToDate",            
                    ] :

                        [                    
                            "startTime",
                            "endTime",
                            // "reason",
                            "leaveType",
                            "halfDayReason",                
                        ]
                    :
                        [                    
                            "startTime",
                            "endTime",
                            // "reason",
                            "halfDayReason",
                            "permissionType"                    
                        ]
        )
    }, [formValues.halfDay, formValues.leaveType])

    const handleAllDay = (e) => {
        setFormValues({ ...formValues, halfDay: e.target.checked, restrictedHoliday: false });
    };



    useEffect(() => {
        if (formValues.halfDay === true) {
            setFormValues({ ...formValues, endTime: time })

            props.handleChange({
                target: {value: time, name: 'endTime'},
                });
        }
    }, [formValues.halfDay])


const hideAvailableCount =
  !formValues.leaveType ||
  formValues.leaveType === "Compensatory Off " ||
  formValues.leaveType === "Restricted Holiday";

 

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
                        <Grid
                            size={{
                                lg: formValues.halfDay === true ? 12 : 6,
                                md: formValues.halfDay === true ? 12 : 6,
                                sm: formValues.halfDay === true ? 12 : 6,
                                xs: formValues.halfDay === true ? 12 : 12
                            }}>
                            <LocalizationProvider dateAdapter={DateAdapter}>
                                <DatePicker
                                    disabled={formValues.leaveType === "Restricted Holiday"}
                                    name='from'
                                    label={formValues.halfDay ? 'Date' : 'Start Date'}
                                    inputVariant='outlined'
                                    value={toMomentOrNull(props.from)}
                                    format='DD/MM/YYYY'
                                    onChange={(date) => {
                                        props.handleChange({
                                            target: { value: date, name: 'from' },
                                        })
                                        setFrom(date);
                                    }
                                    }
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
                                    disabled={from === '' || formValues.leaveType === "Restricted Holiday"}
                                    value={toMomentOrNull(props.to)}
                                    format='DD/MM/YYYY'
                                    onChange={(date) => {
                                        props.handleChange({
                                            target: { value: date, name: 'to' },
                                        })
                                        setTo(date)
                                    }}
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
                                    id="timeoff-select-454"
                                    value={formValues.leaveType}
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
                                {(props.formErrors["leaveType"] !== null) && (formValues.leaveType === null) ? (
  <FormHelperText error>
    Leave Type is required
  </FormHelperText>
) : hideAvailableCount ? null : (
  <FormHelperText>
    {`Available Count: ${
      props.paidleavecount?.[0]?.monthly_limit_applicable === 0
        ? "Not Configured"
        : props.paidleavecount?.[0]?.availableLeaveCount ?? 0
    }`}
  </FormHelperText>
)}
                            </FormControl>
                        </Grid>

                        
                        {formValues.leaveType === 'Compensatory Off '  && !formValues.halfDay === true && <Grid
                            size={{
                                lg: 6,
                                md: 6,
                                sm: 6,
                                xs: 12
                            }}>
                            <LocalizationProvider dateAdapter={DateAdapter}>
                                <DatePicker
                                    name='LoggedFromDate'
                                    label='Logged StartDate'
                                    inputVariant='outlined'
                                    disabled={LoggedFromDate === ''}
                                    format='DD/MM/YYYY'
                                    value={props.LoggedFromDate ? toMomentOrNull(props.LoggedFromDate) : curDate}
                                    onChange={(date) => {
                                        props.handleChange({
                                            target: { value: date, name: 'LoggedFromDate' },
                                        })
                                        setLoggedFromDate(date)
                                    }}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            required: true,
                                            variant: 'filled',
                                            error: LoggedFromDate === null ? true : false,
                                            helperText: props.formErrors["LoggedFromDate"] !== null ? props.formErrors["LoggedFromDate"] : "",
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        
                        }
                        
                        {formValues.leaveType === 'Compensatory Off '  && !formValues.halfDay === true && <Grid
                            size={{
                                lg: 6,
                                md: 6,
                                sm: 6,
                                xs: 12
                            }}>
                            <LocalizationProvider dateAdapter={DateAdapter}>
                                <DatePicker
                                    name='LoggedToDate'
                                    label='Logged EndDate'
                                    inputVariant='outlined'
                                    disabled={LoggedFromDate === ''}
                                    format='DD/MM/YYYY'
                                    value={props.LoggedToDate ? toMomentOrNull(props.LoggedToDate) : curDate}
                                    onChange={(date) => {
                                        props.handleChange({
                                            target: { value: date, name: 'LoggedToDate' },
                                        })
                                        setLoggedToDate(date)
                                    }}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            required: true,
                                            variant: 'filled',
                                            error: LoggedToDate === null ? true : false,
                                            helperText: props.formErrors["LoggedToDate"] !== null ? props.formErrors["LoggedToDate"] : "",
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        
                        }
                           {formValues.halfDay === true && formValues.leaveType === 'Compensatory Off ' && <Grid
                               size={{
                                   lg: 12,
                                   md: 12,
                                   sm: 12,
                                   xs: 12
                               }}>
                            <LocalizationProvider dateAdapter={DateAdapter}>
                                <DatePicker
                                    name='halfDayLoggedDate'
                                    label='Logged Date'
                                    inputVariant='outlined'
                                    // disabled={halfDayLoggedDate === ''}
                                    format='DD/MM/YYYY'
                                    value={props.halfDayLoggedDate ? toMomentOrNull(props.halfDayLoggedDate) : curDate}
                                    onChange={(date) => {
                                        props.handleChange({
                                            target: { value: date, name: 'halfDayLoggedDate' },
                                        })
                                        setHalfDayLoggedDate(date)
                                    }}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            required: true,
                                            variant: 'filled',
                                            error: halfDayLoggedDate === null ? true : false,
                                            helperText: props.formErrors["halfDayLoggedDate"] !== null ? props.formErrors["halfDayLoggedDate"] : "",
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>}
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
                                    id="timeoff-select-597"
                                    value={formValues.halfDayType}
                                    onChange={(v) => {
                                        handleChange(v);
                                        props.handleChange(v)
                                    }}
                                    renderInput={(params) =>
                                        <TextField fullWidth {...params} />}
                                >
                                    {props.halfDayType?.map(i => {
                                        return <MenuItem key={i.id} value={i.leave_type} date={i.holiday_date}>{i.leave_type} </MenuItem>
                                    })}
                                </Select>
                                {props.formErrors["halfDayType"] !== null && formValues.halfDayType === null && <FormHelperText>Half Day Type is required</FormHelperText>}
                            </FormControl>
                        </Grid>}

                        {formValues.leaveType === "Restricted Holiday" && <Grid
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                            <FormControl
                                required
                                fullWidth
                                error={props.formErrors["restrictedHolidayDatas"] !== null && formValues.restrictedHolidayDatas === null ? true : false} variant='filled'>
                                <InputLabel id="holidays-select-label">Holidays</InputLabel>
                                <Select
                                    name="restrictedHolidayDatas"
                                    labelId="demo-simple-select-label"
                                    id="timeoff-select-629"
                                    value={formValues.restrictedHolidayDatas}
                                    onChange={(v) => {
                                        const selectedHoliday = getRestrictedHolidaysData.find(
                                            (holiday) => holiday.name === v.target.value
                                          );
                                          const dateObj = new Date(selectedHoliday.holiday_date);
                                          const formattedDate = dateObj.toString();
                                          
                                        handleChange({
                                            target:{
                                            name: "restrictedHolidayDatas",
                                            value: {
                                                date: formattedDate, 
                                                value: v.target.value, 
                                            },
                                        }
                                        });
                                        props.handleChange({
                                            target:{
                                                name: "restrictedHolidayDatas",
                                                value: {
                                                    date: selectedHoliday, 
                                                    value: v.target.value, 
                                                },
                                            }
                                        });
                                    }}
                                    renderInput={(params) =>
                                        <TextField fullWidth {...params} />}
                                >
                                    {getRestrictedHolidaysData?.map(i => {
                                        return <MenuItem key={i.id} value={i.name}>{i.name}</MenuItem>
                                    })}
                                </Select>
                                {props.formErrors["restrictedHolidayDatas"] !== null && formValues.restrictedHolidayDatas === null && <FormHelperText>Holiday is required</FormHelperText>}
                            </FormControl>
                        </Grid>}
                    </Grid>
                    :
                    <Grid container spacing={3}>
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
                                    value={props.from ? toMomentOrNull(props.from) : curDate}
                                    format='DD/MM/YYYY'
                                    onChange={(date) => {
                                        props.handleChange({
                                            target: { value: date, name: 'from' },
                                        })
                                        setFrom(date)
                                        props.dateValidation("from", date)
                                    }
                                    }
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
                                    name='startTime'
                                    label="Start Time"
                                    value={toMomentOrNull(formValues.startTime) ? moment(formValues.startTime) : time}
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
                                            helperText: props.formErrors["startTime"] !== null ? "startTime is required" : "",
                                            disabled: formValues.halfDay && true,
                                        },
                                    }}
                                    // slotProps={{
                                    //     textField: {
                                    //         fullWidth: true,
                                    //         required: true,
                                    //         variant: 'filled',
                                    //         type: 'time',
                                    //         error: props.formErrors["startTime"] !== null ? true : false,
                                    //         helperText: props.formErrors["startTime"] !== null ? "startTime is required" : "",
                                    //     },
                                    // }}
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
                        id="timeoff-select-783"
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
                    required
                    name="halfDayReason"
                    fullWidth
                    id="reason-textarea"
                    label="Reason"
                    rows={4}
                    value={formValues.halfDayReason || ""}
                  onChange={(e) => {
                      console.log("typing:", e.target.value);

                            handleChange(e);
                            props.handleChange(e);
                            }}
                    placeholder="Enter The Reason"
                    variant="filled"
                    error={props.formErrors["halfDayReason"]}
                    helperText={props.formErrors["halfDayReason"] ?? ""}
                />
            </Grid>
        </Grid>
    );
}

export default TimeOff;