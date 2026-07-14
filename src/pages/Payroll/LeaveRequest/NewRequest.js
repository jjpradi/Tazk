import React, { useState, useEffect, useRef, useContext } from 'react';
import _ from 'lodash';
import { Button, TextField, Typography, Grid, Alert, Card, Chip } from '@mui/material';
import { getTrimmedData } from '../../../components/trimFunction/index';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import FormGroup from '@mui/material/FormGroup';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { grey } from '@mui/material/colors';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import TimeOff from './TimeOff';
import AdvanceReq from './AdvanceReq';
import { useDispatch, useSelector } from 'react-redux';
import { getLocationAction, loanDetailsAction, loanSequenceAction, searchLoanAction, updateLoanDetailsAction, updateLoanSequenceAction, searchClaimAndOthersAction, getTenureTypeAction, getClaimsCategoryAction} from 'redux/actions/loan_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import context from '../../../../src/context/CreateNewButtonContext';
import { formatDate12Hr, pageSize } from 'utils/pageSize';
import CorrectionRequest from './CorrectionRequest';
import moment from 'moment';
import apiCalls from 'utils/apiCalls';
import { checkDateOfJoinAction, createLeaveRequestAction, listAllLeaveRequestAction, listpreCorrectionRequestAction } from 'redux/actions/leaveRequest_actions';
import dayjs from 'dayjs';
import { getShiftDetailsByEmployeeIdAction } from 'redux/actions/shifts.actions';
import notificationType from 'firebase/notify_type';
import { getAdminTokenByCompany } from 'redux/actions/userRole_actions';
import { sendNtfy } from 'firebase/firebase.service';
import { CreateNotificationAction, getNotificationTokenAction } from 'redux/actions/notification_actions';
import { getDateTimeFormat } from 'utils/getTimeFormat';
import { ErrorAlert } from 'redux/actions/load';
import ClaimForm from './Claims';
import ApprovalIcon from '@mui/icons-material/Approval';
import VerifiedIcon from '@mui/icons-material/Verified';
import { getEmpDeptApproverVerifierAction } from 'redux/actions/requestConfig';
import { useCustomFetch } from 'utils/useCustomFetch';
import API_URLS from 'utils/customFetchApiUrls';

function NewRequest(props) {
  const { buttonType } = props  //------from index.js

  // console.log("buttonType",buttonType)
  const dispatch = useDispatch();
  // const textRef = useRef(null);
  // const primary = grey[300];
  const [alertpopup, setalertpop] = useState(false)
  const [valid, setValid] = useState(true)
  const [formData, setFormData] = useState({})
  const { LoanReducer: { loansdetail, searchloandata, loanSequence, tenureMonths, getLocation }, UserRoleReducer: { loginRole }, leaveRequestReducer: { leave_request, create_data, leaveType ,dateOfJoining}, ShiftsReducer: { shiftDetailsByEmployeeId },RequestConfigReducer: { getEmpDeptApproverVerifierList } } = useSelector(state => state)
  const storage = getsessionStorage()
  let rolename = storage?.role_name || '';
  let emp_id = storage?.employee_id || '';
  let approvedPerson = storage?.first_name;
  const {
    commoncookie,
    headerLocationId,
    setModalStatusHandler,
    setLoaderStatusHandler, setModalTypeHandler } = useContext(context);
  const [formValues, setFormValues] = useState({
    emp_name: approvedPerson,
    emp_id: emp_id,
    Reason: null,
    Required_Amount: '',
    Repayment_method: 'AUTO_DEDUCTION_FROM_SALARY',
    tenure: null,
    status: null,
    date: null,
    email: null,
    Phone_number: null,
    outStanding: null,
    deduction:null
  })
  const [value, setValue] = useState(buttonType);
  const [count, setCount] = useState(0);
  const [loanID, setLoanID] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNightShift, setIsNightshift] = useState(false);
  const [formErrors, setFormErrors] = useState({
    emp_name: null,
    emp_id: null,
    Reason: null,
    Required_Amount: null,
    Repayment_method: null,
    tenure: null,
    status: null,
    date: null,
    email: null,
    Phone_number: null,
    from: '',
    to: '',
    halfDayType: null,
    halfDayReason: null,
    permissionType: null,
    leaveType: null,
    shiftId:null,
    deduction:null,
    LoggedFromDate: '',
    LoggedToDate: '',
    halfDayLoggedDate:  ''
  });
  const permissionReasons = leaveType.filter(d => d.isFullDay === 0)
  // const leaveReasons = leaveType.filter(d => d.isFullDay === 1)
  
  const leaveReasons = leaveType.filter(d => {
    if (shiftDetailsByEmployeeId && shiftDetailsByEmployeeId.length > 0 && shiftDetailsByEmployeeId[0].combo_off === 0 ) {
        return d.isFullDay === 1 && d.leave_type !== "Compensatory Off ";
    }
    return d.isFullDay === 1;
});
  const halfDayReasons = leaveType.filter(d => d.isFullDay === 2)
  const [requiredFields] = useState([
    'Reason',
    'Required_Amount',
    'tenure',
    'Repayment_method',
    'deduction'
  ]);

  const curDate = moment()

  useEffect(() => {
    setValue(buttonType)
  }, [buttonType])

  const handleValidation = (data, errObj) => {
    console.log(errObj,'errObj');
    setFormErrors(errObj)
    setFormData(data)
  }

  const verifierNames = getEmpDeptApproverVerifierList?.verifier?.map(d => d.full_name).join(', ') || 'No Verifier';
    const approverNames = getEmpDeptApproverVerifierList?.approver?.map(d => d.full_name).join(', ') || 'No Approver';
  // console.log('sadsdfsdf',leaveType)

  const dateValidation = (type, val) => {

    let formErrorsObj = { ...formErrors };
    if (type == "from") {
      // if (new Date(val).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
      //   formErrorsObj["from"] = "Invalid Date"
      // } else {
      //   formErrorsObj["from"] = null
      // }
    }
    if (type == "to") {
      // if (new Date(val).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
      //   formErrorsObj["to"] = "Invalid Date"
      // }
      if (new Date(formData['from']) > new Date(val)) {
        formErrorsObj["to"] = "Invalid Date"
      }
      else {
        formErrorsObj["to"] = null
      }
    }
    // console.log('formErrorsObj', formErrorsObj);
    setFormErrors(formErrorsObj);
  }
  // useEffect(() => {
  //   setValue(props.type === '1' ? props.type : '3')
  // }, [props.type]);

  useEffect(() => { (async () => {
    dispatch(checkDateOfJoinAction())
    dispatch(getTenureTypeAction())
    // dispatch(loanSequenceAction(setModalTypeHandler, setLoaderStatusHandler))
    dispatch(getShiftDetailsByEmployeeIdAction(commoncookie, setModalTypeHandler, setLoaderStatusHandler))
    dispatch(getLocationAction(setModalTypeHandler, setLoaderStatusHandler))
    dispatch(getTenureTypeAction())
    dispatch(getClaimsCategoryAction())
    setValue(props.tabType)
    const res = await customFetch(
      API_URLS.GET_SHIFT_DETAIL,
      'GET'
    );
    const isNightShift = res.data[0]?.night_shift === 1 ? true : false;
    setIsNightshift(isNightShift)
  
  })();
}, [])

  useEffect(()=>{
    if (storage.role_name === 'Employee' || storage.role_name==='Manager') {
      let request_type
      if (value == 1) {
        request_type = 'LEAVE'
      }
      else if (value == 2) {
        request_type = 'PERMISSION'
      }
      else if (value == 3) {
        request_type = 'ADVANCE'
      }
      else if (value == 4) {
        request_type = 'ATTENDANCE_CORRECTION'
      }
      else {
        request_type = 'CLAIMS'
      }
      let data = {
        request_type: request_type
      }
      dispatch(getEmpDeptApproverVerifierAction(storage.departments[0],data));
    }
  },[value])

  // console.log('daasewer', value)

  // useEffect(() => { 
  //   setValue(value)
  // }, [value])

  // useEffect(() => { 
  //   if(props.tabType === "1"){
  //   }
  // }, [props.tabType])



  let stHour
  let stMinute
  let etHour
  let etMinute
  let data = shiftDetailsByEmployeeId.map((d) => {
    stHour = d.sHour,
      stMinute = d.sMinute
    etHour = d.eHour,
      etMinute = d.eMinute
  }
  )

  let startTimeNew1 = moment()
  startTimeNew1.set('hour', stHour);
  startTimeNew1.set('minute', stMinute);
  startTimeNew1.set('second', 0);
  startTimeNew1.set('millisecond', 0);

  let endTimeNew1 = moment()
  endTimeNew1.set('hour', etHour);
  endTimeNew1.set('minute', etMinute);
  endTimeNew1.set('second', 0);
  endTimeNew1.set('millisecond', 0);

  let startTimeNew = moment()
  startTimeNew.add(-10, 'minutes');

  let endTimeNew = moment()

  const [requiredFieldsReq, setRequiredFieldReq] = useState([])
  const setRequiredFieldReqHandler = (value) => {
    setRequiredFieldReq(value)
  }
  //  useEffect(() => {
  //   let curFrom = formData.from !== null ? formData.from : curDate
  //   let curTo = formData.to !== null ? formData.to : curDate
  //   setFormData({ ...formData, from : curFrom, to : curTo })
  //  }, [])

  const formattedTime = () => {
    const [hours, minutes] = formData.startTime.split(":");
    const timeObj = new Date();
    timeObj.setHours(hours);
    timeObj.setMinutes(minutes);
    const ampm = timeObj.getHours() >= 12 ? "PM" : "AM";
    let hours12 = timeObj.getHours() % 12;
    hours12 = hours12 ? hours12 : 12; // convert 0 to 12
    return `${hours12}:${minutes} ${ampm}`;
  };

  function daysBetweenDates(date1, date2) {
    console.log('leavetypeeeeee',date1, date2)
    // Convert both dates to milliseconds
    // var date1_date = moment(date1).format('YYYY-MM-DD');
    // var date2_date = moment(date2).format('YYYY-MM-DD');
    // console.log('hjjjjjjjjj', date1_date, date2_date)
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();

    // Calculate the difference in milliseconds
    var difference_ms = Math.abs(date2_ms - date1_ms);

    // Convert the difference back to days and return
    return Math.ceil(difference_ms / (1000 * 60 * 60 * 24)) + 1;
}

  const handleSendData = async (value) => {

    const formattedStartTime = moment(formData.startTime).local().toLocaleString();
    const fullDate = new Date(formattedStartTime);
    const dateofJoin = new Date(dateOfJoining[0]?.dateOfJoining);
    let date_1 = moment(dateOfJoining[0]?.dateOfJoining)
    let date_2 = moment(fullDate)
    let check =  dateOfJoining[0]?.dateOfJoining === null  ? true :  date_1.format('YYYY-MM-DD') < date_2.format('YYYY-MM-DD')
    const PstartTime = moment(formData.startTime).seconds(0).milliseconds(0);
    const PendTime = moment(formData.endTime).seconds(0).milliseconds(0);
    const differenceInMilliseconds = PendTime - PstartTime;
    const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);
    console.log(differenceInHours,props.paidleavecount[0],'jkjkj');

    if (dateOfJoining[0]?.dateOfJoining === null) {
      ErrorAlert(dispatch, { message: 'Date of Joining is not available' });
      return;
    }
    if (moment(props.from).format('YYYY-MM-DD') == 'Invalid date' || moment(props.to).format('YYYY-MM-DD') == 'Invalid date') {
      ErrorAlert(dispatch, { message: 'Please check the date.' });
      return;
    }
    // if (moment(props.LoggedFromDate).format('YYYY-MM-DD') == 'Invalid date' || moment(props.LoggedToDate).format('YYYY-MM-DD') == 'Invalid date') {
    //   ErrorAlert(dispatch, { message: 'Please check the date.' });
    //   return;
    // }
    // if (moment(props.halfDayLoggedDate).format('YYYY-MM-DD') == 'Invalid date' ) {
    //   ErrorAlert(dispatch, { message: 'Please check the date.' });
    //   return;
    // }
    
    if (!check && value !== 2) {
      ErrorAlert(dispatch, { message: 'Please check the date.' });
      return;
    }
 
    const formattedEndTime = moment(formData.endTime).local().toLocaleString();
    const fullEndDate = new Date(formattedEndTime);
    const E_hours = fullEndDate.getHours();
    const E_minutes = fullEndDate.getMinutes();
    const E_seconds = fullEndDate.getSeconds();
    const endTime = `${E_hours < 9 ? "0" + E_hours : E_hours}:${E_minutes}:${E_seconds}`
    const endTime1 = `${E_hours <= 9 ? "0" + E_hours : E_hours}:${E_minutes < 9 ? "0" + E_minutes : E_minutes}:00`
    const hours = fullDate.getHours();
    const minutes = fullDate.getMinutes();
    const seconds = fullDate.getSeconds();
    const startTime = `${hours < 9 ? "0" + hours : hours}:${minutes}:${seconds}`
    const startTime1 = `${hours <= 9 ? "0" + hours : hours}:${minutes < 9 ? "0" + minutes : minutes}:00`


    var time1Parts = startTime;
    var time2Parts = endTime;

    // Create Date objects for the current date with the specified times
    var date1 = new Date();
    date1.setHours(parseInt(time1Parts[0], 10), parseInt(time1Parts[1], 10), 0, 0);

    var date2 = new Date();
    date2.setHours(parseInt(time2Parts[0], 10), parseInt(time2Parts[1], 10), 0, 0);


    var timeDifference = Math.abs(date2 - date1);
    
    let isValid = true;

    let formErrorsObj = { ...formErrors };
    Object.keys(formData).map((key, s) => {
      if (

        requiredFieldsReq.includes(key) &&
        (formData[key] === null || formData[key] === '')
      ) {
        isValid = false
        formErrorsObj[key] = capitalize(key) + ' is Required!';
      }
    


      if(value === '2' && props.permissionData[0]?.duration > 0 && differenceInHours > props.permissionData[0]?.duration){
        isValid = false
        ErrorAlert(dispatch, { message: 'Permission exceeds allowed limit' });
      }
      return null;
    })
    await setFormErrors(formErrorsObj)


    let calc1 = moment(formData.from).format('YYYY-MM-DD');
    let calc2 = moment(formData.to).format('YYYY-MM-DD')
    
    const daysDifference = daysBetweenDates(new Date(calc1), new Date(calc2));

    // console.log("dfdrrrr", daysDifference,value, props.paidleavecount, formData.from, formData.to, props.from,props.to);
   
    if(value === '1' && formData.leaveType === 'Privilege Leave' && props.paidleavecount[0]?.Pl_LeaveCount >= props.paidleavecount[0]?.max_pl_in_a_month){
      isValid = false;
      ErrorAlert(dispatch, { message: `Available Privilege Leave ${props.paidleavecount[0].availableLeaveCount}` });
      return 
    }
    if(value === '1' && formData.leaveType === 'Privilege Leave' && daysDifference > props.paidleavecount[0]?.max_pl_in_a_month ){
      isValid = false;
      ErrorAlert(dispatch, { message: `Available Privilege Leave ${props.paidleavecount[0].availableLeaveCount}` });
      return 
    }
    const res = await customFetch(
      API_URLS.GET_SHIFT_DETAIL,
      'GET'
    );
    let stime= moment(formData.startTime).format('HH:mm');
    let etime= moment(formData.endTime).format('HH:mm');
    let startMinutes = timeToMinutes(stime);
    let endMinutes = timeToMinutes(etime);
    if(res?.data[0]?.night_shift == 1){
      if (endMinutes < startMinutes) {
        endMinutes += 1440; // Add 24 hours in minutes
      }
    }    
    if (isValid && endMinutes >= startMinutes) {
      console.log('formData', formData);
      props.handleSubmit(formData, value)
    }
    // setFormData({ ...formData, from : '', to : '' })

  }
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const handleChangeReq = (e) => {
    const { name, value } = e.target;
    // console.log(name,value,"fsdkfds");
    
    setFormData({ ...formData, [name]: value });

if (name === 'restrictedHolidayDatas') {
  const holidayDate = new Date(value.date.holiday_date);
  setFormData({
    ...formData,
    restrictedHolidayDatas: value.value,
    // holidayDate: value.date.holiday_date,
    from: holidayDate,
      to: holidayDate,
            
  });
  console.log("valuevaluevalue",value);
  
  props.handleChange({
    target: { name: 'restrictedHolidayDatas', value: value.value },
  });
  // props.handleChange({
  //   target: { name: 'holidayDate', value: value.date },
  // });
  props.handleChange({
    target: { name: 'from', value: holidayDate },
  });
  props.handleChange({
    target: { name: 'to', value: holidayDate },
  });
}
    else if (name === 'from') {
      // console.log("issuehere",name,value,formData.from,formData.to,props);
      
      // Update the minDate for 'to' based on the selected 'Start Date'
      const fromDate = new Date(value);
      const toDate = new Date(value);
      // console.log(fromDate, toDate,"dsskffmf");
      
      // Check if the selected 'Start Date' is after the current 'End Date'
      if (fromDate > toDate) {
        // Update 'End Date' to be the same as 'Start Date'
        setFormData({ ...formData, [name]: value, to: value });
        props.handleChange({
          target: { name: 'from', value: value },
        });
        props.handleChange({
          target: { name: 'to', value: value },
        });
      } else {
        // Update the minDate for 'to' to prevent selecting past dates
        // console.log(name,value,formData.to._d,"nedtochedck");
        
        const updatedFormData = { ...formData, [name]: value, to: value };
        // console.log(updatedFormData,'updatedFormData');
        
        setFormData(updatedFormData);
        props.handleChange(e);
      }
    } 
    
   else if (name === 'LoggedFromDate') {
    // console.log("lllll")
      // Update the minDate for 'to' based on the selected 'Start Date'
      const LoggedFromDate = new Date(value);
      const LoggedToDate = new Date(formData.LoggedFromDate);
      // Check if the selected 'Start Date' is after the current 'End Date'
      if (LoggedFromDate > LoggedToDate) {
        // Update 'End Date' to be the same as 'Start Date'
        setFormData({ ...formData, [name]: value, LoggedToDate: value });
        props.handleChange({
          target: { name: 'LoggedFromDate', value: value },
        });
        props.handleChange({
          target: { name: 'LoggedToDate', value: value },
        });
        setFormErrors({ ...formErrors, LoggedFromDate:'',LoggedToDate:''})
      } else {
        // Update the minDate for 'to' to prevent selecting past dates
        const updatedFormData = { ...formData, [name]: value };
        setFormData(updatedFormData);
        setFormErrors({ ...formErrors, LoggedFromDate:'',LoggedToDate:''})
        props.handleChange(e);
      }
    } 

    else if (name === 'halfDayLoggedDate'){
      props.handleChange({
        target: { name: 'halfDayLoggedDate', value: value },
      });
      setFormErrors({ ...formErrors, halfDayLoggedDate:''})
    }
    else {
        // normal fields like reason, leaveType, etc
            setFormData(prev => ({
              ...prev,
              [name]: value
            }));
          props.handleChange(e);
    }
  };

  const handleChangeReqPermission = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'from') {
      // Update the minDate for 'to' based on the selected 'Start Date'
      const fromDate = new Date(value);
      const toDate = new Date(formData.to);
       
       setFormData({ ...formData, [name]: value });
          props.handleChange({
          target: { name: 'from', value: value },
        });
       
      // Check if the selected 'Start Date' is after the current 'End Date'
      // if (fromDate > toDate) {
      //   // Update 'End Date' to be the same as 'Start Date'
      //   setFormData({ ...formData, [name]: value, to: value });
      //   props.handleChange({
      //     target: { name: 'from', value: value },
      //   });
      //   props.handleChange({
      //     target: { name: 'to', value: value },
      //   });
      // } else {
      //   // Update the minDate for 'to' to prevent selecting past dates
      //   const updatedFormData = { ...formData, [name]: value };
      //   setFormData(updatedFormData);
      //   props.handleChange(e);
      // }
    } 
    else {
      setFormData({ ...formData, [name]: value });
      setFormErrors({ ...formErrors, [name] : null})
      props.handleChange(e);
    }
  };

  ///advance req-----{
  const setStateHandler = async (name, value) => {
    let formObj = {};
    formObj = {
      ...formValues,
      [name]: value === '' ? null : value,
    };
    await setFormValues(formObj);
    validationHandler(name, value);
  }
  const handleChange1 = (e) => {
    let { name, value } = e.target;
    setStateHandler(name, value);
  };
  const handleAmount = (e) => {
    setFormValues({ ...formValues, Required_Amount: e })
  };



  const resultCallback = (loanId) => {
    let storage = getsessionStorage()
    let employee_id = storage?.employee_id || '';
    let type = 'Loan Request';

    let data1 = {
      type,
      request_type_id : 5,
      employee_id,
      loanReason : formValues.Reason,
      Required_Amount : formValues.Required_Amount
    };

    dispatch(
      getNotificationTokenAction(data1, (res) => {
        console.log("res",res)
        if (res?.status === 200) {
          dispatch(
            CreateNotificationAction({
              content_body: res?.data.body,
              receiver:res?.data.receiver_id,
              title: res?.data?.title,
              time: getDateTimeFormat(new Date()),
              active: '1',
              type : type,
              type_id : loanId
            }),
          );
        }
      }),
    );
    // let storage = getsessionStorage()
    // let emp_id = storage?.employee_id || '';
    // dispatch(
    //   getAdminTokenByCompany((token, content) => {

    //     let notify_type = notificationType('Loan Request');
    //     let notify_content = content?.filter(
    //       (m) => m.notification_type === notify_type,
    //     );

    //     if (notify_content.length) {
    //       let content_body = notify_content[0].body_msg;
    //       sendNtfy(token, notify_content[0]?.title, content_body);
    //       dispatch(CreateNotificationAction({ content_body: content_body, title: notify_content[0]?.title, time: getDateTimeFormat(new Date()), "active": "1" }))
    //     }

    //   }),
    // );
  }

  const handleSubmit = async (event) => {
    console.log('incommingggg')
    event.preventDefault();
    const data = {
      tenure: "",
      frmdate: '',
      todate: '',
      emp_name: "",
      status: "",
      numPerPage: pageSize,
      pageCount: '',
      searchString: '',

    }
    let isValid = true;
    let formErrorsObj = { ...formErrors };
    Object.keys(formValues).map((key, s) => {
      const aa =  requiredFields.includes(key)
      console.log(key,aa,'rand0000000')
      if (
        requiredFields.includes(key) &&
        (formValues[key] === null || formValues[key] === '')
      ) {
        isValid = false
        formErrorsObj[key] = capitalize(key) + ' is Required!';
      }
      return null;
    })
    await setFormErrors(formErrorsObj)

    console.log(isValid,'valid77777',props?.tabType)
    //setFormValues({...formValues,outStanding:formValues.Required_Amount})
    if (isValid) {
      // const loanNumber = `EL/${getLocation[0]?.location_id}/${loanSequence[0]?.current_seq + 1}`
      let updateData = formValues;
      updateData.tenure = parseInt(updateData.tenure)
      updateData.request_type=5
      updateData.date = null
      updateData.employee_id = null
      console.log('updateData',updateData)
      //updateData.loan_number = loanNumber
      const updateData1 = loanSequence[0]?.current_seq + 1
      updateData.seen = 0

      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(updateLoanDetailsAction({ ...updateData }, (response) => {

          if (response.status === 200) {
            const loanId = response?.data?.id
            resultCallback(loanId)
          }
          props.handletype()
          props.handleClose()
          }))
      )
      setFormValues({
        ...formValues,
        Reason: null,
        Required_Amount: null,
        Repayment_method: 'AUTO_DEDUCTION_FROM_SALARY',
        tenure: null,
        deduction:null
      })
      // dispatch(searchLoanAction(data,setLoaderStatusHandler,setModalStatusHandler))
      // dispatch(loanDetailsAction(employee_id, data, () => {}))
      // setValue('3')
      props.handleClose()

    }
  }

  const closeFunction = (value) => {
    setFormValues({
      ...formValues,
      Reason: null,
      Required_Amount: null,
      Repayment_method: 'AUTO_DEDUCTION_FROM_SALARY',
      tenure: null,
      deduction:null
    })
    props.handleClose()
  }

  const validationHandler = (name, value) => {
    let formObj = { ...formErrors };
    if (!Object.keys(formErrors).includes(name)) return;
    if (
      requiredFields.includes(name) &&
      (value === null ||
        value === 'null' ||
        value === '' ||
        value === false ||
        (Object.keys(value) && value.value === null))
    ) {
      setFormErrors({
        ...formErrors,
        [name]: capitalize(name) + ' is Required!',
      });
    } else {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  }

  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };


  //For Correction page new FormState
  var currentDate = new Date();
  var time1 = dayjs(currentDate);
  var time2 = dayjs(currentDate);
  const [correctionForm, setCorrectionForm] = useState({
    user_id: commoncookie,
    fromDate: null,
    toDate: null,
    startTime: null,
    endTime: null,
    reason: 'Attendance Correction',
    note: '',
    shiftId: null
  });
  const [correctiomFormErrors, setCorrectiomFormErrors] = useState({
    user_id: null,
    fromDate: null,
    toDate: null,
    startTime: null,
    endTime: null,
    reason: null,
    shiftId:null
  });
  const [originalTime, setOriginalTime] = useState({})

  const [correctionFormrequiredFields] = useState([
    // 'user_id',
    'fromDate',
    'startTime',
    'endTime',
    'reason',
    'shiftId'
    ]);

  useEffect(() => {
    setCorrectionForm({ ...correctionForm, fromDate: null, toDate: null, startTime: null, endTime: null, note: '', reason: 'Attendance Correction' })
    if (!props.open) {
      //setValue('')
    }
  }, [props.open, value])

  // useEffect(() => {

  // }, [])

  // const handleInputChange = (e) => {
  //   setCorrectionForm({ ...correctionForm, [e.target.name]: e.target.value });
  // };

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    correctionStateHandler(name, value);
  };
  const handleLogTime = (data) => {
    setOriginalTime(data)
  }

  const correctionStateHandler = async (name, value) => {
    let formObj = {};
    formObj = {
      ...correctionForm,
      [name]: value === '' ? null : value,
    };
    setFormErrors({ ...formErrors, [name]: null })
    await setCorrectionForm(formObj);
    correctionValidationHandler(name, value);
  }

  const correctionValidationHandler = (name, value) => {
    if (!Object.keys(correctiomFormErrors).includes(name)) return;
    if (
      correctionFormrequiredFields.includes(name) &&
      (value === null ||
        value === 'null' ||
        value === '' ||
        value === false ||
        (Object.keys(value) && value.value === null))
    ) {
      setCorrectiomFormErrors({
        ...correctiomFormErrors,
        [name]: capitalize(name) + ' is Required!',
      });
    } else {
      setCorrectiomFormErrors({
        ...correctiomFormErrors,
        [name]: null,
      });
    }
  }

  const handleTimeChange = (value, name) => {
    correctionStateHandler(name, value);
    // setCorrectionForm({ ...correctionForm, [name]: value });
  };
console.log(correctionForm,'correctionForm');
  const handleCorrectionClose = () => {
    setFormErrors({
      ...formErrors,
      emp_name: null,
      emp_id: null,
      Reason: null,
      Required_Amount: null,
      Repayment_method: null,
      tenure: null,
      status: null,
      date: null,
      email: null,
      Phone_number: null,
      from: '',
      to: '',
      halfDayType: null,
      halfDayReason: null,
      permissionType: null,
      leaveType: null,
      shiftId:null,
      LoggedFromDate: '',
      LoggedToDate: '',
      halfDayLoggedDate:  ''
    })
    setCorrectionForm({
      fromDate: null,
      toDate: null,
      startTime: null,
      endTime: null,
      reason: 'Attendance Correction',
      note: '',
      shiftId:null
    });
    props.handleClose();
  }



  const correctionNtfy = (fromdate) => {

    let storage = getsessionStorage()
    let employee_id = storage?.employee_id || '';
    let type = 'Attendance Correction Request';
    let data1 = {
      type,
      request_type_id : 3,
      employee_id,
      correctionDate : fromdate
    };

    dispatch(
      getNotificationTokenAction(data1, (res) => {
        if (res?.status === 200) {
          dispatch(
            CreateNotificationAction({
              content_body: res?.data.body,
              receiver:res?.data.receiver_id,
              title: res?.data?.title,
              time: getDateTimeFormat(new Date()),
              active: '1'
            }),
          );
        }
      }),
    );
    // let storage = getsessionStorage()
    // let emp_id = storage?.employee_id || '';
    // dispatch(
    //   getAdminTokenByCompany((token, content) => {

    //     let notify_type = notificationType('Attendance Correction Request');
    //     let notify_content = content?.filter(
    //       (m) => m.notification_type === notify_type,
    //     );

    //     if (notify_content.length) {
    //       let content_body = notify_content[0].body_msg;
    //       sendNtfy(token, notify_content[0]?.title, content_body);
    //       dispatch(CreateNotificationAction({ content_body: content_body, title: notify_content[0]?.title, time: getDateTimeFormat(new Date()), "active": "1" }))
    //     }

    //   }),
    // );
  }

  const timeToMinutes = (time) => {
    console.log(time,'vvv');
    
    if (!time) return 0;
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes; // Convert HH:MM:SS to total minutes
  };

  // const shouldPreventCorrection = handleAttendanceCorrection();
  const customFetch = useCustomFetch();
  const handleCorrection = async () => {
    let storage = getsessionStorage()
   
    if (isSubmitting) {
      setIsSubmitting(false);
      return;
    }
  
    setIsSubmitting(true);
  
    let correctionValid = true;
  
    let formErrorsObj = { ...correctiomFormErrors };
    Object.keys(correctionForm).forEach((key) => {
      if (
        correctionFormrequiredFields.includes(key) &&
        (correctionForm[key] === null || correctionForm[key] === '')
      ) {
        correctionValid = false;
        formErrorsObj[key] = capitalize(key) + ' is Required!';
      } else {
        formErrorsObj[key] = null;
      }
    });
  
    await setFormErrors(formErrorsObj);
    console.log(correctionValid, 'correctionValid', formErrorsObj)
    if (!correctionValid){
      setIsSubmitting(false);
      return;
     } 
      
      
      let { fromDate, toDate, startTime, endTime, reason, note } = correctionForm;


      const formattedStartTime = moment(fromDate).local().toLocaleString();
      const fullDate = new Date(formattedStartTime);
      const dateofJoin = new Date(dateOfJoining[0]?.dateOfJoining);
      let date_1 = moment(dateOfJoining[0]?.dateOfJoining)
      let date_2 = moment(fullDate)
      let check =  dateOfJoining[0]?.dateOfJoining === null  ? true :  date_1.format('YYYY-MM-DD') <= date_2.format('YYYY-MM-DD')
      console.log('formattedStartTime', dateOfJoining[0]?.dateOfJoining, fullDate ,check,date_1.format('YYYY-MM-DD'),date_2.format('YYYY-MM-DD'));
      // console.log(dateofJoin, check, fullDate, 'lol');
    if (dateOfJoining[0]?.dateOfJoining === null) {
      setIsSubmitting(false);
        ErrorAlert(dispatch, { message: 'Date of Joining is not available' });
        return;
      }
    if (!check) {
        setIsSubmitting(false);
        ErrorAlert(dispatch, { message: 'Please check the date. Employee has not yet joined.' });
        return;
      }
  
      const data = {
        employee_id: commoncookie,
        fromDate: moment(fromDate).format('YYYY-MM-DD'),
        toDate: moment(isNightShift ? toDate : fromDate).format('YYYY-MM-DD'),   
        startTime: moment(startTime).seconds(0).milliseconds(0).format('HH:mm'),
        endTime: moment(endTime).seconds(0).milliseconds(0).format('HH:mm'),
        reason: reason,
        note: note,
        status: "Pending",
        correction_type: 1,
        seen: 0,
        originalCheckIn: Object.prototype.hasOwnProperty.call(originalTime, "checkIn") ? moment(originalTime.checkIn, ["h:mm:A"]).seconds(0).milliseconds(0).format("HH:mm") : '',
        originalCheckOut: Object.prototype.hasOwnProperty.call(originalTime, "checkOut") ? moment(originalTime.checkOut, ["HH:mm"]).seconds(0).milliseconds(0).format("HH:mm") : '',
        request_type: 3,
        shift_id:correctionForm?.shiftId
      };
  
      //const isMatching = props.leave_request?.some(obj => obj.employee_id === emp_id && obj.fromDate === data.fromDate);
    
      // if (!isMatching) {
        const leaveData = {
          "fromdate": null,
          "todate": null,
          "type": null,
          "employee_id": storage.role_name === 'Employee' ? storage.employee_id : null,
          "pageCount": 0,
          "numPerPage": 15
      }
     const res = await customFetch(
      API_URLS.GET_SHIFT_DETAIL,
      'GET'
    );
      console.log(res?.data[0]?.night_shift,'ghft');
      
        dispatch(listpreCorrectionRequestAction(data, async (response) => {
      //  console.log("99999",response)
      let startMinutes = timeToMinutes(data.startTime);
      let endMinutes = timeToMinutes(data.endTime);
      if(res?.data[0]?.night_shift == 1){
        if (endMinutes < startMinutes) {
          endMinutes += 1440; // Add 24 hours in minutes
        }
      }    
          if (response.data === 'HOLIDAY' || response.data === 'ANOTHER REQUEST EXISTS' || response.data === 'Permission Exceeds Shift Time' || response.data === 'Already Salary Process Confirmed') {
            props.handleOpenPopUp(response.data);
            props.handleClose();
          } else if(endMinutes >= startMinutes){
            try {
              await apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                commoncookie,
              );
       
              dispatch(createLeaveRequestAction(data, setModalTypeHandler, setLoaderStatusHandler, (response) => {
                console.log("responseee",response)
                if(response?.data?.response_code === 500 ){
                  props.handleError();
                }
                else{
                if (response.status === 200) {
                  props.handleClose();
                  correctionNtfy(data.fromDate);
                  dispatch(listAllLeaveRequestAction(leaveData, commoncookie, setModalTypeHandler, setLoaderStatusHandler,
                    (response) => {
                      console.log("999",response)
                      if (response === 200) {
                        props.handleAttendanceCorrection(leave_request[0]?.leaveId);
                        
                        setCorrectionForm({
                          fromDate: currentDate,
                          toDate: currentDate,
                          // date: currentDate,
                          startTime: startTimeNew,
                          endTime: endTimeNew,
                          reason: 'Attendance Correction',
                          note: '',
                        });   
                      }
                    }
                  ));
                }
              }
              }));
       
            
            } catch (error) {
              console.error("Error in apiCalls:", error);
              // Handle error as needed
            }

          }
          else{
            ErrorAlert(dispatch, { message: 'Please check the time' })
          }
          setIsSubmitting(false);
        }));
      // } else {
      //   ErrorAlert(dispatch, { message: 'Already requested on this date' });
      // }
  
    
  };

  const handleClose = () => {
    setalertpop(false)
  }
  const handleClaims=()=>{
    console.log('1');
    props.handleClaimInitialData()
  }
  const responseMessage = (m) => {
    const msg = {
      'HOLIDAY': 'Already Declared Holiday for the requested date!',
      'ANOTHER REQUEST EXISTS': 'Another Leave / Permission requests exists in the given time and date.',
      'Permission Exceeds Shift Time': 'Permission Exceeds Shift Time Change the timing!',
      'Already Salary Process Confirmed' :'Already Salary Process Confirmed This Month',
      'You have exceeded the permission hours' : 'You have exceeded the permission hours'
    }

    if (Object.hasOwn(msg, m)) {
      return msg[m]
    }


    const req_type_name = m.data[0]?.request_type_name ?? 'Leave / Permission' 

    return `Already ${req_type_name} requested on this day.`
  }

  const isDisabled = ["loan", "CLAIMS"].includes(props.page);

  // console.log(value,'value7777',props)

  return (
    <div>
      {props.alertopen ?
        <Dialog
          open={props.alertopen}
          onClose={props.handleClosepopup}
          aria-labelledby='alert-dialog-title'
          aria-describedby='alert-dialog-description'
          // fullWidth
          // maxWidth="sm"
          PaperProps={{
            style: {
              width: '90%',
              maxWidth: '500px',
              margin: 'auto',
              height: 'auto',
              padding: '16px',
              boxSizing: 'border-box',
            },
          }}
        >
          <DialogTitle id='alert-dialog-title'>{props.isHoliday ==='Permission Exceeds Shift Time' ? 'Change Time' : 'Change Date'}</DialogTitle>
          <Grid container>
            <Grid size={12}>
              <DialogContent style={{ width:'100%'  }}>
                <DialogContentText
                  id='alert-dialog-description'
                  sx={{ color: 'warning.main' }}
                >
                  {responseMessage(props.isHoliday)}
                </DialogContentText>
              </DialogContent>
            </Grid>

          </Grid>

          <DialogActions>
            <Button onClick={props.handleClosepopup} color='secondary' variant='filled'>
              close
            </Button>
          </DialogActions>
        </Dialog> :
        <Dialog
          open={props.open}
          onClose={props.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          //  fullWidth
          // maxWidth="md"
          PaperProps={{
            style: {
              // minHeight: '450px', 
              // maxHeight: '600px',  
              // minWidth: '650px',   
              // maxWidth: '670px',
              width: '90%',
              maxWidth: '700px',
              margin: 'auto',
              height: 'auto',
              padding: '16px',
              boxSizing: 'border-box',
              overflowY: 'auto',
            }
          }}
        >
          <DialogTitle id="newrequest-dialog-title">
            <Typography variant='h6' align='left' style={{ paddingTop: '10px', paddingBottom: '10px' }}>
              New Requests
            </Typography>
{(storage.role_name === 'Employee' || storage.role_name==='Manager' ) ? (
            <Grid
              container
              // paddingTop="20px"
              justifyContent="space-between"
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
  <Chip
    icon={<VerifiedIcon fontSize='small'/>}
    label={`Verifier : ${verifierNames}`}
  />

  <Chip
    icon={<ApprovalIcon fontSize='small'/>}
    label={`Approver : ${approverNames}`}
  />
</Grid>
): ''}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ width: '100%', typography: 'body1' }}>
              <TabContext value={value === '' ? props.tabType : value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider',overflowX: 'auto' }}>
                  <TabList onChange={handleChange}
                   aria-label="lab API tabs example"
                   variant="scrollable"
                   scrollButtons="auto"
                   allowScrollButtonsMobile
                   sx={{
                    '& .MuiTabs-flexContainer': {
                      display: 'flex',
                      justifyContent: 'flex-start',
                      gap: '8px',
                    },
                    '& .MuiTab-root': {
                      minWidth: 'auto', 
                      // flexShrink: 1,
                      flexGrow: 1,
                      maxWidth: '180px',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      fontSize: '0.875rem',
                      padding: '6px 12px',
                    },
                  }}
                   >
                    <Tab label={"Leave"} value="1" disabled={isDisabled}/>
                    <Tab label={"Permission"} value="2" disabled={isDisabled}/>
                    <Tab label={"Loan"} value="3" disabled={isDisabled}/>
                    <Tab label={"Attendance Correction"} value="4" disabled={isDisabled}/>
                    <Tab label={"Claims"} value="5" disabled={isDisabled}/>
                  </TabList>
                </Box>
                <TabPanel value="1">
                  <TimeOff from={props.from} startTime={props.startTime} to={props.to}  LoggedFromDate={props.LoggedFromDate} LoggedToDate={props.LoggedToDate} halfDayLoggedDate={props.halfDayLoggedDate}
                    leaveType={leaveReasons}
                    dateValidation={dateValidation}
                    handleValidation={handleValidation} handleChange={handleChangeReq} halfDayType={halfDayReasons} setRequiredFieldReqHandler={setRequiredFieldReqHandler} formErrors={formErrors} request_type={value} paidleavecount = {props.paidleavecount} />
                </TabPanel>
                <TabPanel value="2">
                  <TimeOff dateValidation={dateValidation} leaveType={permissionReasons}  from={props.from} startTime={props.startTime} to={props.to} handleValidation={handleValidation} handleChange={handleChangeReqPermission} setRequiredFieldReqHandler={setRequiredFieldReqHandler} formErrors={formErrors} request_type={value} />
                </TabPanel>
                <TabPanel value="3">
                  <AdvanceReq tenureMonths={tenureMonths} handleChange={handleChange1} handleValidation={handleValidation} formValues={formValues} valid={valid} formErrors={formErrors} handleAmount={handleAmount} setRequiredFieldReqHandler={setRequiredFieldReqHandler} setFormErrors={setFormErrors} />
                </TabPanel>
                <TabPanel value="4">
                  <CorrectionRequest value={'4'} fromDate={correctionForm.fromDate} toDate={correctionForm.toDate} startTime={correctionForm.startTime} endTime={correctionForm.endTime} reason={correctionForm.reason} note={correctionForm.note} handleTimeChange={handleTimeChange} handleInputChange={handleInputChange} shiftDetailsByEmployeeId={shiftDetailsByEmployeeId} correctiomFormErrors={correctiomFormErrors} formErrors={formErrors} handleLogTime={handleLogTime} isNightShift={isNightShift}/>
                </TabPanel>
                <TabPanel value="5">
                  {/* Render your ClaimForm component for Claims tab */}
                  <ClaimForm {...props} handleClaimInitialData={handleClaims}/>
                </TabPanel>
              </TabContext>
            </Box>
          </DialogContent>
          <DialogActions>
  {value !== '5' && (
    <>
      {value !== '4' ? (
        <Button variant="outlined" onClick={() => closeFunction(value)}>
          Cancel
        </Button>
      ) : (
        <Button variant="outlined" onClick={handleCorrectionClose}>
          Cancel
        </Button>
      )}
      
      {(value !== '3' && value !== '4' && ((props.tabType === '1') || props.tabType === '3') && value === '1') || value === '2' ? (
        <Button variant="contained" onClick={() => handleSendData(value)} autoFocus>
          Send request
        </Button>
      ) : value === '1' ? (
        <Button variant="contained" onClick={() => handleSendData(value)} autoFocus>
          Send request
        </Button>
      ) : value === '4' ? (
        <Button variant="contained" onClick={handleCorrection} autoFocus disabled={isSubmitting}>
          Request Correction
        </Button>
      ) : (
        <Button variant="contained" onClick={handleSubmit} autoFocus>
          Send request
        </Button>
      )}
    </>
  )}
</DialogActions>

        </Dialog>
      }
    </div>
  );
}

export default NewRequest;
