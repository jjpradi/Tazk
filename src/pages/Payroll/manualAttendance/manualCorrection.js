import React, { useContext, useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography, Grid, Chip, Box } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Tab from '@mui/material/Tab';
import ManualCorrectionRequest from './manualAttendanceCorrection';
import { updateManualAttendanceAction } from 'redux/actions/attendance_actions';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { ErrorAlert } from 'redux/actions/load';
import context from '../../../../src/context/CreateNewButtonContext';
import ManualLeaveAndPermission from './manualLeaveRequest';
import { createLeaveRequestForManualAttAction, permissionRequestForManualAttAttAction } from 'redux/actions/leaveRequest_actions';
import apiCalls from 'utils/apiCalls';

const ManualCorrection = (props) => {
  const { handleClose, handleDialogClose } = props;
  const dispatch = useDispatch();
  const {
    commoncookie,
    headerLocationId,
    setModalStatusHandler,
    setLoaderStatusHandler, setModalTypeHandler } = useContext(context);
  const [value, setValue] = useState('1');
  const [formData, setFormData] = useState({})
  const { LoanReducer: { loansdetail, searchloandata, loanSequence, tenureMonths, getLocation }, UserRoleReducer: { loginRole }, leaveRequestReducer: { leave_request, create_data, leaveType, paidleavecount, permissiondata }, ShiftsReducer: { shiftDetailsByEmployeeId }, RequestConfigReducer: { getEmpDeptApproverVerifierList } } = useSelector(state => state)
  const halfDayReasons = leaveType.filter(d => d.isFullDay === 2)
  const [dateOfJoining, setDateOfJoining] = useState(null)
  const [formValues, setFormValues] = useState({
    user_id: null,
    fromDate: null,
    toDate: null,
    startTime: null,
    endTime: null,
    request_type: null,
    leaveType: null,
    reason: 'Manual Attendance',
    note: null,
    status: null,
    correction_type: null,
    seen: null,
    halfday_type: null,
    halfDayReason: 'Manual Attendance',
    halfDayType: null,
    permissionType: null
  });
  const [formErrors, setFormErrors] = useState({
    user_id: null,
    fromDate: null,
    toDate: null,
    startTime: null,
    endTime: null,
    request_type: null,
    leaveType: null,
    reason: null,
    note: null,
    status: null,
    correction_type: null,
    seen: null,
    halfday_type: null,
    halfDayReason: null,
    halfDayType: null,
    permissionType: null
  });
  const [originalTime, setOriginalTime] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [correctionForm, setCorrectionForm] = useState({
    user_id: null,
    date: null,
    startTime: null,
    endTime: null,
    reason: 'Manual Attendance Correction',
    shiftId: null
  });
  const [correctiomFormErrors, setCorrectiomFormErrors] = useState({
    user_id: null,
    date: null,
    startTime: null,
    endTime: null,
    reason: null,
    shiftId: null
  });

  const [correctionFormrequiredFields] = useState([
    'user_id',
    'date',
    'startTime',
    'endTime',
    'reason',
    'shiftId'
  ]);

  const leaveReasons = leaveType.filter(d => {
    if (shiftDetailsByEmployeeId && shiftDetailsByEmployeeId.length > 0 && shiftDetailsByEmployeeId[0].combo_off === 0) {
      return d.isFullDay === 1 && d.leave_type !== "Compensatory Off ";
    }
    return d.isFullDay === 1;
  });


  const permissionReasons = leaveType.filter(d => d.isFullDay === 0)

  useEffect(() => {
    setCorrectionForm({ ...correctionForm, user_id: null, date: null, startTime: null, endTime: null, reason: 'Manual Attendance Correction' })
    if (!props.open) {
    }
  }, [props.open, value])

  useEffect(() => {
    let request_type
    if (value == 1) {
      request_type = 'LEAVE'
    }
    else if (value == 2) {
      request_type = 'PERMISSION'
    }
    else if (value == 3) {
      request_type = 'ATTENDANCE_CORRECTION'
    }
    let data = {
      request_type: request_type
    }
  }, [value])

  let startTimeNew = moment()
  startTimeNew.add(-10, 'minutes');


  let endTimeNew = moment()

  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };


  const handleEmployeeId = (id, emp) => {
    setCorrectionForm({ ...correctionForm, user_id: id })
    setFormValues({ ...formValues, user_id: id })
    setFormErrors({ ...formErrors, user_id: null })
    if (emp) {
      setDateOfJoining(emp?.dateOfJoining)
    }
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
    let errObj = { ...formErrors }
    Object.keys(errObj).map((k) => {
      errObj[k] = null
    })
    setFormErrors(errObj)
  };

  const handleLogTime = (data) => {
    setOriginalTime(data)
  }

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    correctionStateHandler(name, value);
  };

  const handleValidation = (data, errObj) => {

    setFormErrors({ ...formErrors, ...errObj })
    setFormValues(data)
  }

  const handleChangeReq = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    let formErrorsObj = { ...formErrors };

    if (

      requiredFieldsReq.includes(name) &&
      (value === null || value === '')
    ) {
      formErrorsObj[name] = capitalize(name) + ' is Required!';
    } else {
      formErrorsObj[name] = null
    }

    setFormErrors(formErrorsObj)

    if (name === 'from') {
      // Update the minDate for 'to' based on the selected 'Start Date'
      const fromDate = new Date(value);
      const toDate = new Date(formValues.to);
      // Check if the selected 'Start Date' is after the current 'End Date'
      if (fromDate > toDate) {
        // Update 'End Date' to be the same as 'Start Date'
        setFormValues({ ...formValues, [name]: value, to: value });
        props.handleChange({
          target: { name: 'from', value: value },
        });
        props.handleChange({
          target: { name: 'to', value: value },
        });
      } else {
        // Update the minDate for 'to' to prevent selecting past dates
        const updatedFormData = { ...formValues, [name]: value };
        setFormValues(updatedFormData);
        props.handleChange(e);
      }
    } else {
      setFormValues({ ...formValues, [name]: value });
      props.handleChange(e);
    }
  };

  const handleChangeReqPermission = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });

    if (name === 'from') {
      // Update the minDate for 'to' based on the selected 'Start Date'
      const fromDate = new Date(value);
      const toDate = new Date(formValues.to);

      setFormValues({ ...formValues, [name]: value });
      props.handleChange({
        target: { name: 'from', value: value },
      });

      // Check if the selected 'Start Date' is after the current 'End Date'
      // if (fromDate > toDate) {
      //   // Update 'End Date' to be the same as 'Start Date'
      //   setFormValues({ ...formValues, [name]: value, to: value });
      //   props.handleChange({
      //     target: { name: 'from', value: value },
      //   });
      //   props.handleChange({
      //     target: { name: 'to', value: value },
      //   });
      // } else {
      //   // Update the minDate for 'to' to prevent selecting past dates
      //   const updatedFormData = { ...formValues, [name]: value };
      //   setFormValues(updatedFormData);
      //   props.handleChange(e);
      // }
    }
    else {
      setFormValues({ ...formValues, [name]: value });
      setFormErrors({ ...formErrors, [name]: null })
      props.handleChange(e);
    }
  };

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


  const handleSubmit = async (formValue, value) => {
    // setIsAllDay(formValue.request_type);


    const fromDate = formValue.from ? moment(formValue.from).format('YYYY-MM-DD') : null;
    const toDate = formValue.halfDay
      ? fromDate
      : value === 1
        ? (formValue.to ? moment(formValue.to).format('YYYY-MM-DD') : fromDate)
        : fromDate;

    const startTime = formValue.halfDay || formValue.leaveType || !formValue.startTime
      ? null
      : moment(formValue.startTime).isValid()
        ? moment(formValue.startTime).format('HH:mm:ss')
        : null;

    const endTime = formValue.halfDay || !formValue.endTime
      ? null
      : moment(formValue.endTime).isValid()
        ? moment(formValue.endTime).format('HH:mm:ss')
        : null;

    const data = {
      employee_id: formValue.user_id,
      fromDate: fromDate,
      toDate: toDate,
      startTime: formValue.halfDay ? null : formValue.leaveType ? null : moment(formValue.startTime).format("HH:mm:00"),
      endTime: formValue.halfDay ? null : moment(formValue.endTime).format("HH:mm:00"),
      request_type: value == 2 ? 2 : formValue.halfDay ? 4 : 1,
      leaveType: value == 1 ? formValue.leaveType : null,
      note: formValue.note,
      status: 'Approved',
      correction_type: 0,
      seen: 1,
      halfday_type: formValue.halfDay ? 1 : null,
      halfDayType: formValue.halfDay ? formValue.halfDayType : null,
      permissionType: value == 2 ? formValue.permissionType : null,
    };


    try {
      if (value === 1) {
        await dispatch(createLeaveRequestForManualAttAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ));
      } else {
        const response = await dispatch(permissionRequestForManualAttAttAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler
        ));

        if (
          response.data === 'HOLIDAY' ||
          response.data === 'ANOTHER REQUEST EXISTS' ||
          response.data === 'Permission Exceeds Shift Time'
        ) {
          setAlertOpen(true);
          setIsHoliday(response.data);
          return;
        }

        await dispatch(createLeaveRequestForManualAttAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ));
      }
    } catch (error) {
      ErrorAlert(dispatch, { message: 'Something went wrong. Please try again.' });
    }

    setFormValues({
      user_id: null,
      fromDate: null,
      toDate: null,
      startTime: null,
      endTime: null,
      request_type: null,
      leaveType: null,
      reason: 'Manual Attendance',
      note: null,
      status: null,
      correction_type: null,
      seen: null,
      halfday_type: null,
      halfDayReason: 'Manual Attendance',
      halfDayType: null,
      permissionType: null
    });
    props.handleClose();
  };

  function daysBetweenDates(date1, date2) {
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();

    // Calculate the difference in milliseconds
    var difference_ms = Math.abs(date2_ms - date1_ms);

    // Convert the difference back to days and return
    return Math.ceil(difference_ms / (1000 * 60 * 60 * 24)) + 1;
  }


  const handleSendData = async (value) => {

    if (!formValues.user_id) {
      setFormErrors({ ...formErrors, user_id: "Employee is required!" })
      return;
    }
    const formattedStartTime = moment(formValues.startTime).local().toLocaleString();
    const fullDate = new Date(formattedStartTime);
    const dateofJoin = new Date(dateOfJoining);
    let date_1 = moment(dateOfJoining)
    let date_2 = moment(fullDate)
    let check = dateOfJoining === null ? true : date_1.format('YYYY-MM-DD') < date_2.format('YYYY-MM-DD')
    const PstartTime = new Date(formValues.startTime);
    const PendTime = new Date(formValues.endTime);
    const differenceInMilliseconds = PendTime - PstartTime;
    const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);

    if (dateOfJoining === null) {
      ErrorAlert(dispatch, { message: 'Date of Joining is not available' });
      return;
    }
    if (moment(props.from).format('YYYY-MM-DD') == 'Invalid date' || moment(props.to).format('YYYY-MM-DD') == 'Invalid date') {
      ErrorAlert(dispatch, { message: 'Please check the date1.' });
      return;
    }

    if (!check && value !== 2) {
      ErrorAlert(dispatch, { message: 'Please check the date2.' });
      return;
    }

    const formattedEndTime = moment(formValues.endTime).local().toLocaleString();
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


    Object.keys(formValues).map((key, s) => {
      if (

        requiredFieldsReq.includes(key) &&
        (formValues[key] === null || formValues[key] === '')
      ) {
        isValid = false
        formErrorsObj[key] = capitalize(key) + ' is Required!';
      }

      if (value === '2' && permissiondata[0]?.duration > 0 && differenceInHours > permissiondata[0]?.duration) {
        isValid = false
        ErrorAlert(dispatch, { message: 'Permission exceeds allowed limit' });
      }
      return null;
    })

    await setFormErrors(formErrorsObj)


    let calc1 = moment(formValues.from).format('YYYY-MM-DD');
    let calc2 = moment(formValues.to).format('YYYY-MM-DD')

    var daysDifference = daysBetweenDates(new Date(calc1), new Date(calc2));


    if (value === '1' && formValues.leaveType === 'Privilege Leave' && paidleavecount[0]?.Pl_LeaveCount >= paidleavecount[0]?.max_pl_in_a_month) {
      isValid = false;
      ErrorAlert(dispatch, { message: `Available Privilege Leave ${paidleavecount}` });
      return
    }
    if (value === '1' && formValues.leaveType === 'Privilege Leave' && daysDifference > paidleavecount[0]?.max_pl_in_a_month) {
      isValid = false;
      ErrorAlert(dispatch, { message: `Available Privilege Leave ${paidleavecount}` });
      return
    }


    if (isValid && formValues.endTime >= formValues.startTime) {
      handleSubmit(formValues, value)
    }
    // setFormValues({ ...formValues, from : '', to : '' })

  }

  const [requiredFieldsReq, setRequiredFieldReq] = useState([])
  const setRequiredFieldReqHandler = (value) => {
    setRequiredFieldReq(value)
  }



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
      if (new Date(formValues['from']) > new Date(val)) {
        formErrorsObj["to"] = "Invalid Date"
      }
      else {
        formErrorsObj["to"] = null
      }
    }
    setFormErrors(formErrorsObj);
  }

  const handleTimeChange = (value, name) => {
    correctionStateHandler(name, value);
    // setCorrectionForm({ ...correctionForm, [name]: value });
  };

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

  const handleCorrectionClose = () => {
    setFormErrors({
      ...formErrors,
      user_id: null,
      fromDate: null,
      toDate: null,
      startTime: null,
      endTime: null,
      request_type: null,
      leaveType: null,
      reason: null,
      note: null,
      status: null,
      correction_type: null,
      seen: null,
      halfday_type: null,
      halfDayReason: null,
      halfDayType: null,
      permissionType: null,
      shiftId: null,
      date: null,
    })
    setCorrectionForm({
      user_id: null,
      date: null,
      startTime: null,
      endTime: null,
      reason: 'Manual Attendance Correction',
      shiftId: null
    });
    props.handleClose();
  }

  const handleSubmitClose = () => [
    setCorrectionForm({
      user_id: user_id,
      date: currentDate,
      startTime: startTimeNew,
      endTime: endTimeNew,
      reason: 'Manual Attendance Correction',
    }),
    props.handleClose(),
    setIsSubmitting(false),
  ]

  const handleCorrection = async () => {

    if (isSubmitting) {
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

    setFormErrors(formErrorsObj);

    if (!correctionValid) {
      setIsSubmitting(false);
      return;
    }

    const { date, startTime, endTime, shiftId, user_id } = correctionForm;

    if (endTime < startTime) {
      setIsSubmitting(false);
      ErrorAlert(dispatch, { message: 'End time cannot be earlier than start time.' });
      return;
    }

    const data = {
      user_id,
      date: date ? moment(date).format('YYYY-MM-DD') : null,
      shift_id: shiftId,
      updateLog: {
        start_time: date && startTime ? `${moment(date).format('YYYY-MM-DD')} ${moment(startTime).format('HH:mm:ss')}` : null,
        end_time: date && endTime ? `${moment(date).format('YYYY-MM-DD')} ${moment(endTime).format('HH:mm:ss')}` : null,
      },
      type: "update",
    };

    try {
      const response = await  apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(updateManualAttendanceAction(data, setLoaderStatusHandler))
      )
    

      if (response) {

        setCorrectionForm({
          user_id: null,
          date: null,
          startTime: null,
          endTime: null,
          reason: 'Manual Attendance Correction',
          shiftId: null,
        });
        props.handleClose();
      } else {
        ErrorAlert(dispatch, { message: 'Failed to update attendance. Please try again.' });
      }
    } catch (error) {
      ErrorAlert(dispatch, { message: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveAndPermission = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    let correctionValid = true;
    let formErrorsObj = { ...formErrors };

    Object.keys(formVales).forEach((key) => {
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

    setFormErrors(formErrorsObj);

    if (!correctionValid) {
      setIsSubmitting(false);
      return;
    }

    const { date, startTime, endTime, shiftId, user_id } = correctionForm;

    if (endTime < startTime) {
      setIsSubmitting(false);
      ErrorAlert(dispatch, { message: 'End time cannot be earlier than start time.' });
      return;
    }

    const data = {
      user_id,
      date: date ? moment(date).format('YYYY-MM-DD') : null,
      shift_id: shiftId,
      updateLog: {
        start_time: date && startTime ? `${moment(date).format('YYYY-MM-DD')} ${moment(startTime).format('HH:mm:ss')}` : null,
        end_time: date && endTime ? `${moment(date).format('YYYY-MM-DD')} ${moment(endTime).format('HH:mm:ss')}` : null,
      },
      type: "update",
    };

    try {
      const response = await apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(updateManualAttendanceAction(data, setLoaderStatusHandler))
      )
       

      if (response) {

        setCorrectionForm({
          user_id: null,
          date: null,
          startTime: null,
          endTime: null,
          reason: 'Manual Attendance Correction',
          shiftId: null,
        });
        props.handleClose();
      } else {
        ErrorAlert(dispatch, { message: 'Failed to update attendance. Please try again.' });
      }
    } catch (error) {
      ErrorAlert(dispatch, { message: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Dialog
      open={props.open}
      onClose={props.handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{
        style: {
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
      <DialogTitle id="manualcorrection-dialog-title" sx={{ pt: 2.5, pb: 2.5, textAlign: 'left' }}>
          Manual Correction
      </DialogTitle>

      <DialogContent>
        <Box sx={{ width: '100%', typography: 'body1' }}>
          <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', overflowX: 'auto' }}>
              <TabList onChange={handleChange} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
                <Tab label="Leave" value="1" />
                <Tab label="Permission" value="2" />
                <Tab label="Attendance Correction" value="3" />
              </TabList>
            </Box>

            <TabPanel value="1">
              <ManualLeaveAndPermission
                leaveType={leaveReasons}
                from={props.from}
                startTime={props.startTime}
                to={props.to}
                dateValidation={dateValidation}
                handleValidation={handleValidation}
                handleChange={handleChangeReq}
                halfDayType={halfDayReasons}
                formErrors={formErrors}
                request_type={value}
                paidleavecount={paidleavecount}
                setRequiredFieldReqHandler={setRequiredFieldReqHandler}
                handleEmployeeId={handleEmployeeId}
                formValues={formValues}
                setFormValues={setFormValues}
                reason={formValues.reason}
              />
            </TabPanel>

            <TabPanel value="2">
              <ManualLeaveAndPermission
                leaveType={permissionReasons}
                from={props.from}
                startTime={props.startTime}
                to={props.to}
                dateValidation={dateValidation}
                handleValidation={handleValidation}
                handleChange={handleChangeReqPermission}
                request_type={value}
                formErrors={formErrors}
                setRequiredFieldReqHandler={setRequiredFieldReqHandler}
                handleEmployeeId={handleEmployeeId}
                formValues={formValues}
                setFormValues={setFormValues}
                reason={formValues.reason}
              />
            </TabPanel>

            <TabPanel value="3">
              <ManualCorrectionRequest
                date={correctionForm.date} user_id={correctionForm.user_id} startTime={correctionForm.startTime} endTime={correctionForm.endTime} reason={correctionForm.reason} shiftId={correctionForm.shiftId} handleTimeChange={handleTimeChange} handleInputChange={handleInputChange} correctiomFormErrors={formErrors} formErrors={formErrors} handleLogTime={handleLogTime} handleEmployeeId={handleEmployeeId}
              />
            </TabPanel>
          </TabContext>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={handleCorrectionClose}>Cancel</Button>
        {value === '1' || value === '2' ? (
          <Button variant="contained" onClick={() => handleSendData(value)}>Make Request</Button>
        ) : (
          <Button variant="contained" onClick={handleCorrection} autoFocus disabled={isSubmitting}>Correction</Button>
        )}

      </DialogActions>
    </Dialog>
  );
};

export default ManualCorrection;
