import {
  Autocomplete,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {Form, FormikProvider, useFormik} from 'formik';
import React, {useEffect, useState} from 'react';
import * as Yup from 'yup';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs'
import CommonToolTip from 'components/ToolTip';
import {
  attendancePolicyAction,
  listEmployeeCategoryAction,
  updateAttendancePolicyAction,
} from 'redux/actions/shifts.actions';
import {useDispatch, useSelector} from 'react-redux';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import {ErrorAlert} from 'redux/actions/load';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import toMomentOrNull from '../../../utils/DateFixer'

export default function AddAttendancePolicy(props) {
  const {close, open, editRowData, mode, handleNext, handleBack, pageType} =
    props;
  const dispatch = useDispatch();
  const {
    ShiftsReducer: {employeeCategoryList, attendancePolicyList},
  } = useSelector((state) => state);
  const [enableOverTime, setEnableOverTime] = useState(false);

  // const parseDuration = (duration) => {
  //   // console.log("duration",duration)
  //   const match = duration.match(/(?:(\d+)h)?\s*(?:(\d+)m)?/);
  //   // console.log("match",match)
  //   if (!match) return 0;
  //   const hours = parseInt(match[1] || '0', 10);
  //   const minutes = parseInt(match[2] || '0', 10);
  //   console.log('Time Duration', hours * 60 + minutes);
  //   // console.log("fff",hours * 60 + minutes)
  //   return hours * 60 + minutes;
  // };

  const calculateTimeDifference = (start, end) => {
    if (!start || !end) return 0;
    const startTime = moment(start, 'HH:mm:ss');
    const endTime = moment(end, 'HH:mm:ss');
    return Math.round(endTime.diff(startTime, 'minutes', true));
  };

  

  Yup.addMethod(Yup.string, 'maxHours', function (hours, errorMessage) {
    return this.test('maxHours', errorMessage, function (value) {
      const {path, createError} = this;
      if (!value) return true;
      const [hrs, mins] = value.split(/[h,m]/).map(Number);
      if (hrs > hours) {
        return createError({path, message: errorMessage});
      }
      return true;
    });
  });

  Yup.addMethod(Yup.string, 'maxMinutes', function (errorMessage) {
    return this.test('maxMinutes', errorMessage, function (value) {
      const {path, createError} = this;
      if (!value) return true;
      const mins = value.match(/(\d+)m/);
      if (mins && mins[1] > 59) {
        return createError({path, message: errorMessage});
      }
      return true;
    });
  });

  Yup.addMethod(Yup.string, 'validTimeFormat', function (errorMessage) {
    return this.test('validTimeFormat', errorMessage, function (value) {
      const {path, createError} = this;
      if (!value) return true;
      const validFormat = /^(\d+h\s*)?(\d+m)?$/.test(value);
      if (!validFormat) {
        return createError({path, message: errorMessage});
      }
      return true;
    });
  });



  const validationSchema = Yup.object().shape({
    lunch_break: Yup.string()
    .matches(/^(\d+h)?\s*(\d+m)?$/, 'Enter duration in the format "4h 30m"')
    .maxHours('Hours should be within 12 hours!')
    .maxMinutes('Minutes should be within 59 mins!')
    .test(
      'no-overlap',
      'Lunch break conflicts with tea breaks',
      function (value) {
        const { lunch_start_time, tea1_start_time, tea1_break, tea2_start_time, tea2_break, lunch_grace_time } = this.parent;
 
        if (!lunch_start_time || !value) return true;
        // console.log(lunch_start_time, value,'hjhjh');
         
        const lunchEndTime = addDurationToTime(lunch_start_time, value);
        const graceInMinutes = lunch_grace_time || 0;
 
        const lunchStartWithGrace = subtractMinutes(lunch_start_time, graceInMinutes);
        const lunchEndWithGrace = addMinutes(lunchEndTime, graceInMinutes);
 
        if (tea1_start_time && tea1_break) {
          const tea1EndTime = addDurationToTime(tea1_start_time, tea1_break);
          const tea1StartWithGrace = subtractMinutes(tea1_start_time, graceInMinutes);
          const tea1EndWithGrace = addMinutes(tea1EndTime, graceInMinutes);
           
          if (isTimeOverlap(lunchStartWithGrace, lunchEndWithGrace, tea1StartWithGrace, tea1EndWithGrace)) {
            return false;
          }
        }
 
        if (tea2_start_time && tea2_break) {
          const tea2EndTime = addDurationToTime(tea2_start_time, tea2_break);
          const tea2StartWithGrace = subtractMinutes(tea2_start_time, graceInMinutes);
          const tea2EndWithGrace = addMinutes(tea2EndTime, graceInMinutes);
 
          if (isTimeOverlap(lunchStartWithGrace, lunchEndWithGrace, tea2StartWithGrace, tea2EndWithGrace)) {
            return false;
          }
        }
 
        return true;
      }
    ),
    dinner_break : Yup.string()
    .matches(/^(\d+h)?\s*(\d+m)?$/, 'Enter duration in the format "4h 30m"')
    .maxHours('Hours should be within 12 hours')
    .maxMinutes('Minutes should be within 59 mins!')
    .test(
      'no-overlap',
      'Dinner break conflicts with tea breaks!',
      function (value) {
        const { dinner_start_time, tea1_start_time, tea1_break, tea2_start_time, tea2_break, dinner_grace_time } = this.parent
 
        if(!dinner_start_time || !value) return true
        const dinnerEndTime = addDurationToTime(dinner_start_time, value)
        const dinnerGraceInMinutes = dinner_grace_time || 0
 
        const dinnerStartWithGrace = subtractMinutes(dinner_start_time, dinnerGraceInMinutes)
        const dinnerEndWithGrace = addMinutes(dinnerEndTime, dinnerGraceInMinutes)
 
        if (tea1_start_time && tea1_break) {
          const tea1EndTime = addDurationToTime(tea1_start_time, tea1_break);
          const tea1StartWithGrace = subtractMinutes(tea1_start_time, dinnerGraceInMinutes);
          const tea1EndWithGrace = addMinutes(tea1EndTime, dinnerGraceInMinutes);
           
          if (isTimeOverlap(dinnerStartWithGrace, dinnerEndWithGrace, tea1StartWithGrace, tea1EndWithGrace)) {
            return false;
          }
        }
 
        if (tea2_start_time && tea2_break) {
          const tea2EndTime = addDurationToTime(tea2_start_time, tea2_break);
          const tea2StartWithGrace = subtractMinutes(tea2_start_time, dinnerGraceInMinutes);
          const tea2EndWithGrace = addMinutes(tea2EndTime, dinnerGraceInMinutes);
 
          if (isTimeOverlap(dinnerStartWithGrace, dinnerEndWithGrace, tea2StartWithGrace, tea2EndWithGrace)) {
            return false;
          }
        }
        return true
      }
    ),
  
  attendance_start_day: Yup.number()
    .typeError('Start date must be a number')
    .integer('Start date must be a whole number (1–31)')
    .min(1, 'Start date cannot be less than 1')
    .max(28, 'Start date cannot be more than 28')
    .required('Attendance start date is required'),

  attendance_end_date: Yup.string().nullable(),
 
    policy_name: Yup.string().required('Name is required!'),
    category_id: Yup.array().of(Yup.string()).min(1, "Employee Category is required").required("Employee Category is required"),
    // category_id: Yup.string().required('Category is required!'),
    total_work_hours_per_day: Yup.string()
      .matches(/^(?!0h)/, 'Duration cannot start with 0h')
      .required('Total work hour is required')
      .validTimeFormat('Please use the format Xh Xm (e.g., 5h 30m)'),
    // category_id: Yup.string().nullable().required('Category is required!'),
 
    mark_halfday_leave: Yup.string()
      .validTimeFormat('Please use the format Xh Xm (e.g., 5h 30m)')
      .maxHours('Hours should be within 5 hours!')
      .maxMinutes('Minutes should be within 59 mins!'),
    mark_halfday_leave_minutes: Yup.string()
      .validTimeFormat('Please use the format Xh Xm (e.g., 5h 30m)')
      .maxHours('Hours should be within 12 hours!')
      .maxMinutes('Minutes should be within 59 mins!'),
    calculate_halfday: Yup.string()
      .validTimeFormat('Please use the format Xh Xm (e.g., 5h 30m)')
      .maxHours('Hours should be within 12 hours!')
      .maxMinutes('Minutes should be within 59 mins!'),
    calculate_leave: Yup.string()
      .validTimeFormat('Please use the format Xh Xm (e.g., 5h 30m)')
      .maxHours('Hours should be within 12 hours!')
      .maxMinutes('Minutes should be within 59 mins!'),
    calculate_latedays: Yup.string()
      .validTimeFormat('Please use the format Xh Xm (e.g., 5h 30m)')
      .maxHours('Hours should be within 12 hours!')
      .maxMinutes('Minutes should be within 59 mins!'),
    halfday_early_out_3days: Yup.string()
      .validTimeFormat('Please use the format Xh Xm (e.g., 5h 30m)')
      .maxHours('Hours should be within 12 hours!')
      .maxMinutes('Minutes should be within 59 mins!'),
    late_in_days_count: Yup.number()
      .typeError('Enter a valid number of days')
      .integer('Days must be a whole number')
      .min(1, 'Days must be at least 1')
      .max(31, 'Days cannot exceed 31'),
    early_out_days_count: Yup.number()
      .typeError('Enter a valid number of days')
      .integer('Days must be a whole number')
      .min(1, 'Days must be at least 1')
      .max(31, 'Days cannot exceed 31'),
    halfday_early_out: Yup.string()
      .validTimeFormat('Please use the format Xh Xm (e.g., 5h 30m)')
      .maxHours('Hours should be within 12 hours!')
      .maxMinutes('Minutes should be within 59 mins!'),
    permission_duration: Yup.string()
      .validTimeFormat('Please use the format Xh Xm (e.g., 5h 30m)')
      .maxHours(5, 'Hours should be within 5 hours!')
      .maxMinutes('Minutes should be within 59 mins!'),
      break_estimation: Yup.string()
      .validTimeFormat('Please use the format Xh Xm (e.g.,1h 30m)')
      .maxMinutes('Minutes should be within 59 mins!'),
    auto_clockout: Yup.string()
      .validTimeFormat('Please use the format Xh Xm (e.g.,1h 30m)')
      .maxMinutes('Minutes should be within 59 mins!')
      .when('enable_auto_clockout', {
        is: 1, // only when auto clockout is enabled
        then: (schema) =>
          schema.required('Auto clockout duration is required when enabled!'),
        otherwise: (schema) => schema.notRequired(),
      }),
    ot_min_time: Yup.string()
      .validTimeFormat('Please use the format Xh Xm (e.g., 5h 30m)')
      .matches(
        /^(?!0m$|1m$|2m$|3m$|4m$|5m$|6m$|7m$|8m$|9m$|10m$|11m$|12m$|13m$|14m$)/,
        'minutes should be startin 15m',
      )
      .maxHours('Hours should be within 12 hours!')
      .maxMinutes('Minutes should be within 59 mins!')
      .when('enable_over_time', {
        is: 1, // only validate when overtime is enabled
        then: (schema) =>
          schema.required('OT minimum time is required when overtime is enabled!'),
        otherwise: (schema) => schema.notRequired(),
      }),
    ot_max_time: Yup.string()
      .validTimeFormat('Please use the format Xh Xm (e.g., 5h 30m)')
      .matches(
        /^(?!0m$|1m$|2m$|3m$|4m$|5m$|6m$|7m$|8m$|9m$|10m$|11m$|12m$|13m$|14m$)/,
        'minutes should be startin 15m',
      )
      .maxHours('Hours should be within 12 hours!')
      .maxMinutes('Minutes should be within 59 mins!')
      .when('enable_over_time', {
        is: 1, // only validate when overtime is enabled
        then: (schema) =>
          schema.required('OT maximum time is required when overtime is enabled!'),
        otherwise: (schema) => schema.notRequired(),
      }),
 
      tea1_break: Yup.string()
      .validTimeFormat('Please use the format Xh Xm (e.g., 1h 15m)')
      .maxHours('Hours should be within 12 hours!')
      .maxMinutes('Minutes should be within 59 mins!')
      .test(
        'no-overlap',
        'Tea Break 1 conflicts with other breaks',
        function (value) {
          const { lunch_start_time, lunch_break, tea1_start_time, tea2_start_time, tea2_break, tea1_grace_time, dinner_start_time, dinner_break } = this.parent;
 
          if (!tea1_start_time || !value) return true;
 
          const tea1EndTime = addDurationToTime(tea1_start_time, value);
          const graceInMinutes = tea1_grace_time || 0;
 
          const tea1StartWithGrace = subtractMinutes(tea1_start_time, graceInMinutes);
          const tea1EndWithGrace = addMinutes(tea1EndTime, graceInMinutes);
 
          if (lunch_start_time && lunch_break) {
            const lunchEndTime = addDurationToTime(lunch_start_time, lunch_break);
            const lunchStartWithGrace = subtractMinutes(lunch_start_time, graceInMinutes);
            const lunchEndWithGrace = addMinutes(lunchEndTime, graceInMinutes);
            //console.log(tea1EndTime, graceInMinutes,'123456');
 
            if (isTimeOverlap(lunchStartWithGrace, lunchEndWithGrace, tea1StartWithGrace, tea1EndWithGrace)) {
              return false;
            }
          }
 
          if(dinner_start_time && dinner_break) {
            const dinnerEndTime = addDurationToTime(dinner_start_time, dinner_break)
            const dinnerStartWithGrace = subtractMinutes(dinner_start_time, graceInMinutes)
            const dinnerEndWithGrace = addMinutes(dinnerEndTime, graceInMinutes)
 
            if(isTimeOverlap(dinnerStartWithGrace, dinnerEndWithGrace, tea1StartWithGrace, tea1EndWithGrace)) {
              return false
            }
          }
 
          if (tea2_start_time && tea2_break) {
            const tea2EndTime = addDurationToTime(tea2_start_time, tea2_break);
            const tea2StartWithGrace = subtractMinutes(tea2_start_time, graceInMinutes);
            const tea2EndWithGrace = addMinutes(tea2EndTime, graceInMinutes);
           
            if (isTimeOverlap(tea1StartWithGrace, tea1EndWithGrace, tea2StartWithGrace, tea2EndWithGrace)) {
              return false;
            }
          }
 
          return true;
        }
      ),
 
      tea2_break: Yup.string()
      .validTimeFormat('Please use the format Xh Xm (e.g., 1h 15m)')
      .maxHours('Hours should be within 12 hours!')
      .maxMinutes('Minutes should be within 59 mins!')
      .test(
        'no-overlap',
        'Tea Break 2 conflicts with other breaks',
        function (value) {
          const { lunch_start_time, lunch_break, tea1_start_time, tea1_break, tea2_start_time, tea2_grace_time, dinner_start_time, dinner_break } = this.parent;
 
          if (!tea2_start_time || !value) return true;
         // console.log(tea2_start_time, value,'tesrty');
         
          const tea2EndTime = addDurationToTime(tea2_start_time, value);
          const graceInMinutes = tea2_grace_time || 0
 
          const tea2StartWithGrace = subtractMinutes(tea2_start_time, graceInMinutes);
          const tea2EndWithGrace = addMinutes(tea2EndTime, graceInMinutes);
 
          if (lunch_start_time && lunch_break) {
            const lunchEndTime = addDurationToTime(lunch_start_time, lunch_break);
            const lunchStartWithGrace = subtractMinutes(lunch_start_time, graceInMinutes);
            const lunchEndWithGrace = addMinutes(lunchEndTime, graceInMinutes);
 
            if (isTimeOverlap(lunchStartWithGrace, lunchEndWithGrace, tea2StartWithGrace, tea2EndWithGrace)) {
              return false;
            }
          }
 
          if(dinner_start_time && dinner_break) {
            const dinnerEndTime = addDurationToTime(dinner_start_time, dinner_break)
            const dinnerStartWithGrace = subtractMinutes(dinner_start_time, graceInMinutes)
            const dinnerEndWithGrace = addMinutes(dinnerEndTime, graceInMinutes)
 
            if(isTimeOverlap(dinnerStartWithGrace, dinnerEndWithGrace, tea2StartWithGrace, tea2EndWithGrace)) {
              return false
            }
          }
 
          if (tea1_start_time && tea1_break) {
            const tea1EndTime = addDurationToTime(tea1_start_time, tea1_break);
            const tea1StartWithGrace = subtractMinutes(tea1_start_time, graceInMinutes);
            const tea1EndWithGrace = addMinutes(tea1EndTime, graceInMinutes);
 
            if (isTimeOverlap(tea1StartWithGrace, tea1EndWithGrace, tea2StartWithGrace, tea2EndWithGrace)) {
              return false;
            }
          }
 
          return true;
        }
      ),
      total_punch: Yup.number()
        .nullable() // Allow the field to be completely empty/null
        .transform((value, originalValue) => (String(originalValue).trim() === '' ? null : value)) // Prevent empty strings from failing number type checks
        .typeError('Punch sequence limit must be a number')
        .when('enable_punch_limit', {
          is: 1, // Only apply these strict rules when punch limit is enabled
          then: (schema) =>
            schema
              .required('Punch sequence limit is required when punch limit is enabled!')
              .integer('Punch sequence limit must be an integer')
              .min(1, 'Punch sequence limit must be at least 1'),
          otherwise: (schema) => schema.notRequired(),
        }),

    last_punch_out: Yup.number()
      .typeError('Last punch out must be 0 (No) or 1 (Yes)')
      .oneOf([0, 1], 'Last punch out must be 0 or 1') // restrict values
      .when('enable_punch_limit', {
        is: 1,
        then: (schema) =>
          schema.required('Last punch out is required when punch limit is enabled!'),
        otherwise: (schema) => schema.notRequired(),
      }),
 
    // lunch_break_in_sequence_sequence: Yup.number()
    //   .notOneOf([1, 8], 'Invalid sequence!')
    //   .oneOf([2, 4], 'Invalid sequence!'),
    // lunch_break_out_sequence_sequence: Yup.number()
    //   .notOneOf([1, 8], 'Invalid sequence!')
    //   .oneOf([3, 5], 'Invalid sequence!'),
    // tea2_break_in_sequence: Yup.number()
    //   .notOneOf([1, 8], 'Invalid sequence!')
    //   .oneOf([4, 6], 'Invalid sequence!'),
 
    // tea2_break_out_sequence: Yup.number()
    //   .notOneOf([1, 8], 'Invalid sequence!')
    //   .oneOf([5, 7], 'Invalid sequence!'),
 
    // tea1_break_in_sequence: Yup.number()
    //   .notOneOf([1, 8], 'Invalid sequence!')
    //   .oneOf([2], 'Invalid sequence!'),
 
    // tea1_break_out_sequence: Yup.number()
    //   .notOneOf([1, 8], 'Invalid sequence!')
    //   .oneOf([3], 'Invalid sequence!'),
  });
 


  function addDurationToTime(startTime, duration) {
    let stime = moment(startTime, ["h:mm A", "HH:mm"]).format('HH:mm');
    const [hours, minutes] = stime.split(':').map(Number);
    const [durationHours, durationMinutes] = parseDuration(duration);
  
    const totalMinutes = hours * 60 + minutes + durationHours * 60 + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
  
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }
  
  function parseDuration(duration) {
    const parts = duration.match(/(\d+h)?\s*(\d+m)?/);
    const hours = parts[1] ? parseInt(parts[1].replace('h', '')) : 0;
    const minutes = parts[2] ? parseInt(parts[2].replace('m', '')) : 0;
    return [hours, minutes];
  }
  
  function addMinutes(time, minutesToAdd) {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + minutesToAdd;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
  
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  }
  
  function subtractMinutes(time, minutesToSubtract) {
    let stime = moment(time, ["h:mm A", "HH:mm"]).format('HH:mm');
    const [hours, minutes] = stime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes - minutesToSubtract;
    console.log('totalMinutes',totalMinutes,hours,minutes,minutesToSubtract);
    
    const newHours = Math.floor((totalMinutes + 1440) / 60) % 24;
    const newMinutes = (totalMinutes + 1440) % 60;
  
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  }
  
  function isTimeOverlap(start1, end1, start2, end2) {
    return !(end1 <= start2 || end2 <= start1);
  }
  
  // const initializeFormValues = () => {
  //   // console.log("editRowData",editRowData);
  //   if (mode === 'edit') {
  //     const convertToHoursMinutesFormat = (timeString) => {
  //       if (!timeString || timeString === '00:00:00') return '';
  //       const [hours, minutes] = timeString?.split(':').map(Number);
  //       const parts = [];
  //       if (hours > 0) parts.push(`${hours}h`);
  //       if (minutes > 0) parts.push(`${minutes}m`);
  //       return parts.join(' ');
  //     };
  //     const early_check_in_grace_time = editRowData?.early_check_in_grace_time
  //       .split(':')
  //       .map(Number);
  //     const late_check_out_grace_time = editRowData?.late_check_out_grace_time
  //       .split(':')
  //       .map(Number);
  //     return {
  //       enable_over_time: editRowData.enable_over_time,
  //       enable_auto_clockout: editRowData.enable_auto_clockout,
  //       policy_name: editRowData.policy_name,
  //       category_id: editRowData.category_id,
  //       total_work_hours_per_day: convertToHoursMinutesFormat(
  //         editRowData.total_work_hours_per_day,
  //       ),
  //       early_check_in_grace_time: early_check_in_grace_time[0],
  //       late_check_out_grace_time: late_check_out_grace_time[0],
  //       mark_halfday_leave: convertToHoursMinutesFormat(
  //         editRowData.mark_halfday_leave,
  //       ),
  //       calculate_halfday: convertToHoursMinutesFormat(
  //         editRowData.calculate_halfday,
  //       ),
  //       calculate_leave: convertToHoursMinutesFormat(
  //         editRowData.calculate_leave,
  //       ),
  //       calculate_latedays: convertToHoursMinutesFormat(
  //         editRowData.calculate_latedays,
  //       ),
  //       halfday_early_out_3days: convertToHoursMinutesFormat(
  //         editRowData.halfday_early_out_3days,
  //       ),
  //       halfday_early_out: convertToHoursMinutesFormat(
  //         editRowData.halfday_early_out,
  //       ),
  //       ot_min_time: convertToHoursMinutesFormat(editRowData.ot_min_time),
  //       ot_max_time: convertToHoursMinutesFormat(editRowData.ot_max_time),
  //       permission_duration: convertToHoursMinutesFormat(
  //         editRowData.permission_duration,
  //       ),
  //       enable_punch_limit : editRowData.enable_punch_limit,
  //       total_punch : editRowData.total_punch,
  //       last_punch_out: editRowData.last_punch_out,
  //       attendance_start_day : editRowData.attendance_start_day,
  //       permission_count: editRowData.permission_count,
  //       break_estimation: editRowData.break_estimation
  //         ? convertToHoursMinutesFormat(editRowData.break_estimation)
  //         : '',
  //       auto_clockout: editRowData.auto_clockout
  //         ? convertToHoursMinutesFormat(editRowData.auto_clockout)
  //         : '',
  //       lunch_break: editRowData.lunch_break
  //         ? convertToHoursMinutesFormat(editRowData.lunch_break)
  //         : '',
  //       lunch_start_time:
  //         editRowData.lunch_start_time &&
  //         editRowData.lunch_start_time !== '00:00:00'
  //           ? moment(editRowData.lunch_start_time, 'HH:mm:ss').format()
  //           : '',
  //       // lunch_end_time:
  //       //   editRowData.lunch_end_time &&
  //       //   editRowData.lunch_end_time !== '00:00:00'
  //       //     ? moment(editRowData.lunch_end_time, 'HH:mm:ss').format()
  //       //     : '',
  //       dinner_break : editRowData.dinner_break
  //         ? convertToHoursMinutesFormat(editRowData.dinner_break)
  //         : '',
  //       dinner_start_time : editRowData.dinner_start_time && editRowData.dinner_start_time !== '00:00:00'
  //         ? moment(editRowData.dinner_start_time, 'HH:mm:ss').format()
  //         : '',
  //       tea1_break: convertToHoursMinutesFormat(editRowData.tea1_break),
  //       tea1_start_time:
  //         editRowData.tea1_start_time &&
  //         editRowData.tea1_start_time !== '00:00:00'
  //           ? moment(editRowData.tea1_start_time, 'HH:mm:ss').format()
  //           : '',
  //       // tea1_end_time:
  //       //   editRowData.tea1_end_time && editRowData.tea1_end_time !== '00:00:00'
  //       //     ? moment(editRowData.tea1_end_time, 'HH:mm:ss').format()
  //       //     : '',
  //       tea2_break: convertToHoursMinutesFormat(editRowData.tea2_break),
  //       tea2_start_time:
  //         editRowData.tea2_start_time &&
  //         editRowData.tea2_start_time !== '00:00:00'
  //           ? moment(editRowData.tea2_start_time, 'HH:mm:ss').format()
  //           : '',
  //       // tea2_end_time:
  //       //   editRowData.tea2_end_time && editRowData.tea2_end_time !== '00:00:00'
  //       //     ? moment(editRowData.tea2_end_time, 'HH:mm:ss').format()
  //       //     : ''
  //       include_break:editRowData.include_break
       
  //     };
  //   } else {
  //     return {
  //       policy_name: 'Default Attendance policy',
  //       category_id: null,
  //       attendance_start_day: 1,
  //       mark_halfday_leave: '',
  //       calculate_halfday: '',
  //       calculate_leave: '',
  //       calculate_latedays: '',
  //       halfday_early_out_3days: '',
  //       halfday_early_out: '',
  //       enable_over_time: 0,
  //       enable_auto_clockout: 1,
  //       ot_min_time: '',
  //       ot_max_time: '',
  //       permission_duration: '',
  //       break_estimation : '',
  //       auto_clockout : '',
  //       permission_count: null,
  //       total_work_hours_per_day: '',
  //       early_check_in_grace_time: '2',
  //       late_check_out_grace_time: '2',
  //       lunch_break: '',
  //       lunch_start_time: '',
  //       lunch_end_time: '',
  //       tea1_break: '',
  //       tea1_start_time: '',
  //       tea1_end_time: '',
  //       tea2_break: '',
  //       tea2_start_time: '',
  //       tea2_end_time: '',
  //       lunch_grace_time:'',
  //       tea1_grace_time:'',
  //       tea2_grace_time:'',
  //       dinner_start_time : '',
  //       dinner_break : '',
  //       dinner_grace_time : '',
  //       dinner_end_time : '',
  //       include_break:0
  //     };
  //   }
  // };
const initializeFormValues = () => {
  const toHMSParts = (time) => {
    // returns [hours, minutes, seconds] as numbers safely
    if (!time && time !== 0) return [0, 0, 0];

    // If it's a number, treat it as hours if small (<24) or seconds otherwise (best-effort)
    if (typeof time === 'number') {
      // if it's <= 24 assume hours (like 2), else maybe seconds -> convert to H:M:S
      if (time <= 24) return [Math.floor(time), Math.round((time - Math.floor(time)) * 60), 0];
      // treat as seconds
      const secs = Math.floor(time);
      const hrs = Math.floor(secs / 3600);
      const mins = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      return [hrs, mins, s];
    }

    // If it's an object/array, try to normalize
    if (Array.isArray(time)) {
      const [h = 0, m = 0, s = 0] = time.map((v) => Number(v) || 0);
      return [h, m, s];
    }
    if (typeof time === 'object') {
      // maybe {hours:1, minutes:30}
      const h = Number(time.hours || time.h || 0) || 0;
      const m = Number(time.minutes || time.m || 0) || 0;
      const s = Number(time.seconds || time.s || 0) || 0;
      return [h, m, s];
    }

    // Now time is a string. Try common formats:
    const str = String(time).trim();

    // HH:mm:ss or HH:mm
    if (str.includes(':')) {
      const parts = str.split(':').map((p) => Number(p) || 0);
      return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
    }

    // formats like "2h 30m" or "2h" or "30m"
    const hMatch = str.match(/(\d+)\s*h/i);
    const mMatch = str.match(/(\d+)\s*m/i);
    const sMatch = str.match(/(\d+)\s*s/i);
    if (hMatch || mMatch || sMatch) {
      return [
        hMatch ? Number(hMatch[1]) : 0,
        mMatch ? Number(mMatch[1]) : 0,
        sMatch ? Number(sMatch[1]) : 0,
      ];
    }

    // plain number string: treat as hours if <= 24, otherwise seconds
    const num = Number(str);
    if (!Number.isNaN(num)) {
      if (num <= 24) return [Math.floor(num), Math.round((num - Math.floor(num)) * 60), 0];
      const secs = Math.floor(num);
      const hrs = Math.floor(secs / 3600);
      const mins = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      return [hrs, mins, s];
    }

    // fallback
    return [0, 0, 0];
  };

  const convertToHoursMinutesFormat = (timeString) => {
    const [hours, minutes] = toHMSParts(timeString);
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    return parts.join(' ') || '';
  };

  if (mode === 'edit') {
    // safe extraction of grace times (use toHMSParts to avoid .split on bad types)
    const earlyParts = toHMSParts(editRowData?.early_check_in_grace_time);
    const lateParts = toHMSParts(editRowData?.late_check_out_grace_time);

    return {
      enable_over_time: editRowData?.enable_over_time ?? 0,
      enable_auto_clockout: editRowData?.enable_auto_clockout ?? 0,
      policy_name: editRowData?.policy_name ?? '',
      category_id: editRowData?.category_id 
      ? (Array.isArray(editRowData.category_id) 
          ? editRowData.category_id.map(String) 
          : String(editRowData.category_id).split(','))
      : (mode === 'edit' ? ['bypass-validation-id'] : []),
      total_work_hours_per_day: convertToHoursMinutesFormat(editRowData?.total_work_hours_per_day),
      early_check_in_grace_time: earlyParts[0], // hours
      late_check_out_grace_time: lateParts[0],  // hours
      mark_halfday_leave: convertToHoursMinutesFormat(editRowData?.mark_halfday_leave),
      calculate_halfday: convertToHoursMinutesFormat(editRowData?.calculate_halfday),
      calculate_leave: convertToHoursMinutesFormat(editRowData?.calculate_leave),
      calculate_latedays: convertToHoursMinutesFormat(editRowData?.calculate_latedays),
      halfday_early_out_3days: convertToHoursMinutesFormat(editRowData?.halfday_early_out_3days),
      late_in_days_count: editRowData?.late_in_days_count ?? 3,
      early_out_days_count: editRowData?.early_out_days_count ?? 3,
      halfday_early_out: convertToHoursMinutesFormat(editRowData?.halfday_early_out),
      ot_min_time: convertToHoursMinutesFormat(editRowData?.ot_min_time),
      ot_max_time: convertToHoursMinutesFormat(editRowData?.ot_max_time),
      permission_duration: convertToHoursMinutesFormat(editRowData?.permission_duration),
      enable_punch_limit: editRowData?.enable_punch_limit ?? 0,
      total_punch: editRowData?.total_punch ?? null,
      last_punch_out: editRowData?.last_punch_out ?? '',
      attendance_start_day: editRowData?.attendance_start_day ?? 1,
      permission_count: editRowData?.permission_count ?? null,
      break_estimation: editRowData?.break_estimation ? convertToHoursMinutesFormat(editRowData.break_estimation) : '',
      auto_clockout: editRowData?.auto_clockout ? convertToHoursMinutesFormat(editRowData.auto_clockout) : '',
      lunch_break: editRowData?.lunch_break ? convertToHoursMinutesFormat(editRowData.lunch_break) : '',
      lunch_start_time:
        editRowData?.lunch_start_time && editRowData.lunch_start_time !== '00:00:00'
          ? moment(editRowData.lunch_start_time, 'HH:mm:ss').format()
          : '',
      dinner_break: editRowData?.dinner_break ? convertToHoursMinutesFormat(editRowData.dinner_break) : '',
      dinner_start_time:
        editRowData?.dinner_start_time && editRowData.dinner_start_time !== '00:00:00'
          ? moment(editRowData.dinner_start_time, 'HH:mm:ss').format()
          : '',
      tea1_break: convertToHoursMinutesFormat(editRowData?.tea1_break),
      tea1_start_time:
        editRowData?.tea1_start_time && editRowData.tea1_start_time !== '00:00:00'
          ? moment(editRowData.tea1_start_time, 'HH:mm:ss').format()
          : '',
      tea2_break: convertToHoursMinutesFormat(editRowData?.tea2_break),
      tea2_start_time:
        editRowData?.tea2_start_time && editRowData.tea2_start_time !== '00:00:00'
          ? moment(editRowData.tea2_start_time, 'HH:mm:ss').format()
          : '',
      include_break: editRowData?.include_break ?? 0,
    };
  } else {
    // create/new defaults
    return {
      policy_name: 'Default Attendance policy',
      category_id: [],
      attendance_start_day: 1,
      mark_halfday_leave: '',
      calculate_halfday: '',
      calculate_leave: '',
      calculate_latedays: '',
      halfday_early_out_3days: '',
      late_in_days_count: 3,
      early_out_days_count: 3,
      halfday_early_out: '',
      enable_over_time: 0,
      enable_auto_clockout: 1,
      ot_min_time: '',
      ot_max_time: '',
      permission_duration: '',
      break_estimation: '',
      auto_clockout: '',
      permission_count: null,
      total_work_hours_per_day: '',
      early_check_in_grace_time: '2',
      late_check_out_grace_time: '2',
      lunch_break: '',
      lunch_start_time: '',
      lunch_end_time: '',
      tea1_break: '',
      tea1_start_time: '',
      tea1_end_time: '',
      tea2_break: '',
      tea2_start_time: '',
      tea2_end_time: '',
      lunch_grace_time: '',
      tea1_grace_time: '',
      tea2_grace_time: '',
      dinner_start_time: '',
      dinner_break: '',
      dinner_grace_time: '',
      dinner_end_time: '',
      include_break: 0,
    };
  }
};

  const [initialValues, setInitialValues] = useState(initializeFormValues());
  // console.log("initialValues",initialValues);
  useEffect(() => {
    if (mode === 'edit' && editRowData) {
      // console.log("sdfsd",editRowData)
      setInitialValues(initializeFormValues());
      // setEnableOverTime(editRowData.combo_off === 1);
    }
    if (pageType === 'detailpage') {
      const formatTime = (time) => {
        if (!time) return '';
        if (typeof time !== 'string') {
          try {
            const hours = time.getHours().toString().padStart(2, '0');
            const minutes = time.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
          } catch (e) {
            return '';
          }
        }

        const [hours, minutes] = time.split(':');
        if (!hours || !minutes) return '';

        let formattedTime = '';
        if (parseInt(hours) > 0) formattedTime += `${parseInt(hours)}h `;
        if (parseInt(minutes) > 0) formattedTime += `${parseInt(minutes)}m`;

        return formattedTime.trim();
      };

      const payload = {
        type: 'Get',
      };
      dispatch(attendancePolicyAction(payload));
      if (attendancePolicyList?.length > 0) {
        setInitialValues({
          ...initialValues,
          policy_name: attendancePolicyList[0]?.policy_name,
          id: attendancePolicyList[0]?.id,
          category_id: attendancePolicyList[0]?.category_id,
          total_work_hours_per_day: formatTime(
            attendancePolicyList[0]?.total_work_hours_per_day,
          ),
          early_check_in_grace_time:
           attendancePolicyList[0]?.early_check_in_grace_time?.toString()?.substring(1, 2),
        late_check_out_grace_time:
          attendancePolicyList[0]?.late_check_out_grace_time?.toString()?.substring(1, 2),
          mark_halfday_leave: formatTime(
            attendancePolicyList[0]?.mark_halfday_leave,
          ),
          calculate_latedays: formatTime(
            attendancePolicyList[0]?.calculate_latedays,
          ),
          halfday_early_out_3days: formatTime(
            attendancePolicyList[0]?.halfday_early_out_3days,
          ),
          late_in_days_count: attendancePolicyList[0]?.late_in_days_count ?? 3,
          early_out_days_count: attendancePolicyList[0]?.early_out_days_count ?? 3,
          calculate_halfday: formatTime(
            attendancePolicyList[0]?.calculate_halfday,
          ),
          calculate_leave: formatTime(attendancePolicyList[0]?.calculate_leave),
          lunch_break: formatTime(attendancePolicyList[0]?.lunch_break),
          dinner_break : formatTime(attendancePolicyList[0]?.dinner_break),
          tea1_break: formatTime(attendancePolicyList[0]?.tea1_break),
          tea2_break: formatTime(attendancePolicyList[0]?.tea2_break),
          permission_duration: formatTime(
            attendancePolicyList[0]?.permission_duration,
          ),
          break_estimation: formatTime(
            attendancePolicyList[0]?.break_estimation,
          ),
          auto_clockout: formatTime(
            attendancePolicyList[0]?.auto_clockout,
          ),
          permission_count: attendancePolicyList[0]?.permission_count,
          enable_over_time: attendancePolicyList[0]?.enable_over_time,
          enable_auto_clockout: attendancePolicyList[0]?.enable_auto_clockout,
          ot_min_time: formatTime(attendancePolicyList[0]?.ot_min_time),
          ot_max_time: formatTime(attendancePolicyList[0]?.ot_max_time),
        });
      }
    }
  }, []);

  // console.log(
  //   'this111',
  //   attendancePolicyList[0]?.early_check_in_grace_time
  //     .toString()
  //     .substring(1, 2),
  //   attendancePolicyList[0]?.late_check_out_grace_time
  //     .toString()
  //     .substring(1, 2),
  // );

  const formik = useFormik({
    initialValues: initialValues,
    enableReinitialize: true,
    validationSchema: validationSchema,

    onSubmit: () => {
      let values = {...formik.values};

      //.log('submitting');

      const early_check_in_grace_time = `${padWithZero(
        values.early_check_in_grace_time,
      )}:00:00`;
      delete values.early_check_in_grace_time;

      const late_check_out_grace_time = `${padWithZero(
        values.late_check_out_grace_time,
      )}:00:00`;
      delete values.late_check_out_grace_time;

      const convertToTimeFormat = (value) => {
        const hoursMatch = value.match(/(\d+)h/);
        const minutesMatch = value.match(/(\d+)m/);

        const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
        const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');

        return `${formattedHours}:${formattedMinutes}`;
      };

      const mark_halfday_leave = convertToTimeFormat(values.mark_halfday_leave);

      // console.log("thisneeww",mark_halfday_leave);

      const calculate_halfday = convertToTimeFormat(values.calculate_halfday);

      const calculate_leave = convertToTimeFormat(values.calculate_leave);

      const calculate_latedays = convertToTimeFormat(values.calculate_latedays);

      const halfday_early_out_3days = convertToTimeFormat(
        values.halfday_early_out_3days,
      );

      const halfday_early_out = convertToTimeFormat(values.halfday_early_out);

      const ot_min_time = convertToTimeFormat(values.ot_min_time);

      const ot_max_time = convertToTimeFormat(values.ot_max_time);

      const permission_duration = convertToTimeFormat(
        values.permission_duration,
      );

      const break_estimation = convertToTimeFormat(
        values.break_estimation,
      );

      const auto_clockout = convertToTimeFormat(
        values.auto_clockout,
      );

      const total_work_hours_per_day = convertToTimeFormat(
        values.total_work_hours_per_day,
      );

      const lunch_break = convertToTimeFormat(values.lunch_break);

      const tea1_break = convertToTimeFormat(values.tea1_break);

      const tea2_break = convertToTimeFormat(values.tea2_break);

      const lunch_start_time = moment(values.lunch_start_time).format(
        'HH:mm:ss',
      );
      //.log(values.lunch_break,lunch_start_time,'values.lunch_break');
      
      const lunch_end_time =  addDurationToTime(values.lunch_start_time,values.lunch_break);
      const tea1_start_time = moment(values.tea1_start_time).format('HH:mm:ss');
      const tea1_end_time =   addDurationToTime(values.tea1_start_time,values.tea1_break);
      const tea2_start_time = moment(values.tea2_start_time).format('HH:mm:ss');
      const tea2_end_time = addDurationToTime(values.tea2_start_time,values.tea2_break);
      const tea2_grace_time = `${padWithZero(Math.floor(values.tea2_grace_time / 60))}:${padWithZero(values.tea2_grace_time % 60)}:00`;
      const tea1_grace_time = `${padWithZero(Math.floor(values.tea1_grace_time / 60))}:${padWithZero(values.tea1_grace_time % 60)}:00`;
      const lunch_grace_time = `${padWithZero(Math.floor(values.lunch_grace_time / 60))}:${padWithZero(values.lunch_grace_time % 60)}:00`;
      const dinner_break = convertToTimeFormat(values.dinner_break)
      const dinner_start_time = moment(values.dinner_start_time).format('HH:mm:ss')
      const dinner_end_time = addDurationToTime(values.dinner_start_time, values.dinner_break)
      const dinner_grace_time = `${padWithZero(Math.floor(values.dinner_grace_time / 60))}:${padWithZero(values.dinner_grace_time % 60)}:00`
       //const lunch_break_in_sequence_sequence = parseInt(values.lunch_break_in_sequence_sequence);
      //const lunch_break_out_sequence_sequence = parseInt(
     //   values.lunch_break_out_sequence_sequence,
     // );
     // const tea1_break_in_sequence = parseInt(values.tea1_break_in_sequence);
      //const tea1_break_out_sequence = parseInt(values.tea1_break_out_sequence);
      //const tea2_break_in_sequence = parseInt(values.tea2_break_in_sequence);
      //const tea2_break_out_sequence = parseInt(values.tea2_break_out_sequence);
      // console.log(
      //   '!lunch_break && !tea1_break && !tea2_break',
      //   lunch_break,
      //   tea1_break,
      //   tea2_break,
      // );
      // if (
      //   lunch_break === '00:00' &&
      //   tea1_break === '00:00' &&
      //   tea2_break === '00:00'
      // ) {
      //   ErrorAlert(dispatch, {
      //     message:
      //       'Please provide at least one break (lunch break, tea1 break, or tea2 break).',
      //   });
      //   return;
      // }

      // if (lunch_break !== '00:00') {
      //   if (
      //     !lunch_start_time ||
      //     lunch_start_time === '00:00' ||
      //     !lunch_end_time ||
      //     !lunch_break_in_sequence_sequence ||
      //     !lunch_break_out_sequence_sequence
      //   ) {
      //     ErrorAlert(dispatch, {
      //       message:
      //         'If lunch break is provided, please provide start time, end time,sequence in and out.',
      //     });
      //     return;
      //   }
      // }

      // if (tea1_break !== '00:00') {
      //   if (
      //     !tea1_start_time ||
      //     tea1_start_time === '00:00' ||
      //     !tea1_end_time ||
      //     !tea1_break_in_sequence ||
      //     !tea1_break_out_sequence
      //   ) {
      //     ErrorAlert(dispatch, {
      //       message:
      //         'If Tea1 break is provided, please provide start time, end time,sequence in and out.',
      //     });
      //     return;
      //   }
      // }

      // if (tea2_break !== '00:00') {
      //   if (
      //     !tea2_start_time ||
      //     tea2_start_time === '00:00' ||
      //     !tea2_end_time ||
      //     !tea2_break_in_sequence ||
      //     !tea2_break_out_sequence
      //   ) {
      //     ErrorAlert(dispatch, {
      //       message:
      //         'If Tea2 break is provided, please provide start time, end time,sequence in and out.',
      //     });
      //     return;
      //   }
      // }

      // const sequenceArray = [
      //   lunch_break_in_sequence_sequence,
      //   lunch_break_out_sequence_sequence,
      //   tea1_break_in_sequence,
      //   tea1_break_out_sequence,
      //   tea2_break_in_sequence,
      //   tea2_break_out_sequence,
      // ];

      // const filteredSequenceArray = sequenceArray.filter(
      //   (item) => item != null && !isNaN(item),
      // );

      // const duplicates = filteredSequenceArray.filter(
      //   (item, index) => filteredSequenceArray.indexOf(item) !== index,
      // );
      // // console.log("duplicates", duplicates)
      // if (duplicates.length > 0) {
      //   ErrorAlert(dispatch, {
      //     message: `Duplicate sequence numbers detected. Each sequence number must be unique.`,
      //   });
      //   return;
      // }
    
      const tempData = {
        ...values,
        mark_halfday_leave,
        total_work_hours_per_day,
        late_check_out_grace_time,
        early_check_in_grace_time,
        calculate_halfday,
        calculate_leave,
        calculate_latedays,
        halfday_early_out_3days,
        halfday_early_out,
        ot_min_time,
        ot_max_time,
        permission_duration,
        break_estimation,
        auto_clockout,
        lunch_break,
        tea1_break,
        tea2_break,
        lunch_start_time,
        lunch_end_time,
        tea1_start_time,
        tea1_end_time,
        tea2_start_time,
        tea2_end_time,
        tea2_grace_time,
        tea1_grace_time,
        lunch_grace_time,
        dinner_break,
        dinner_start_time,
        dinner_end_time,
        dinner_grace_time,
        // lunch_break_in_sequence_sequence,
        // lunch_break_out_sequence_sequence,
        // tea1_break_in_sequence,
        // tea1_break_out_sequence,
        // tea2_break_in_sequence,
        // tea2_break_out_sequence,
      };

      console.log('tempData', editRowData?.id);
      console.log('modedffff', tempData);
      
      if (props.pageType === 'detailpage') {
        if (attendancePolicyList?.length) {
          dispatch(
            updateAttendancePolicyAction(tempData, tempData.id, 'detailpage'),
          );
          props.handleNext();
        } else {
          dispatch(attendancePolicyAction(tempData));
          props.handleNext();
        }
      }
      if (mode === 'add') {
        dispatch(attendancePolicyAction(tempData));
        if (pageType === 'detailpage') {
          props.handleNext();
        }
      } else {
        console.log('nerehrrr');
        dispatch(updateAttendancePolicyAction(tempData, editRowData.id));
      }

      formik.resetForm();
      close(false);
    },
    validateOnBlur: true,
    validateOnChange: true,
  });

  const {
    errors,
    touched,
    getFieldProps,
    setFieldValue,
    handleBlur,
    handleSubmit,
    validateForm,
    setErrors,
    values,
    setFieldTouched,
  } = formik;

  const padWithZero = (value) =>
    value ? value.toString().padStart(2, '0') : '00';

  const handleCheck = (e) => {
    const { name, checked } = e.target;

    setFieldValue(name, checked ? 1 : 0);

    if (!checked) {
      setFieldValue('total_punch', '');
      setFieldTouched('total_punch', false);
    }
  };
const handleCategoryChange = (event, selectedOptions) => {
  const hasSelectAll = selectedOptions.some(
    (opt) => opt.id === "selectAll"
  );

  if (hasSelectAll) {
    const allIds = employeeCategoryList.map((c) => c.id);
    const isAllSelected =
      formik.values.category_id.length === allIds.length;

    formik.setFieldValue(
      "category_id",
      isAllSelected ? [] : allIds
    );
    return;
  }

  formik.setFieldValue(
    "category_id",
    selectedOptions.map((opt) => opt.id)
  );
};


  const handleStartDateChange = (e) => {
    const startDay = parseInt(e.target.value)
    const today = dayjs()
    const currentMonth = today.month()
    const currentYear = today.year()

    // Calculate start date
    const startDate = dayjs(`${currentYear}-${currentMonth + 1}-${startDay}`)

    // Calculate end date = one day before the same date next month
    const nextMonthDate = startDate.add(1, 'month')
    //const endDate = nextMonthDate.subtract(1, 'day')

    formik.setFieldValue('attendance_start_day', startDay)
    // formik.setFieldValue('attendance_end_date', endDate.format('YYYY-MM-DD'))
  }

  useEffect(() => {
    let body = props.pageType === 'detailpage' ? 
    {
      type: 'ATTENDANCE_POLICY',
      pageType : "detailpage"
    } : {
      type: 'ATTENDANCE_POLICY'
    }
    dispatch(listEmployeeCategoryAction(body, () => {}));
  }, []);

  console.log('thisnew', values);
  console.log('erroortfvc', errors);
  const [includeBreak, setIncludeBreak] = useState('yes');

  const handleChange = (event) => {
    setIncludeBreak(event.target.value);
    let {name, value} = event.target;
    //console.log('coemdfjgf', value);
    setFieldValue(name, value == 'yes' ? 1 : 0);
  };
  return (
    <Card sx={{padding: '20px 20px 80px 20px', overflowY: 'auto'}}>
      <Grid
        container
        // display='flex'
        // justifyContent={'center'}
      >
        <Grid
          display='flex'
          justifyContent={'start'}
          ml={'20px'}
          size={{
            lg: 11,
            md: 11,
            sm: 11,
            xs: 6
          }}>
          {pageType !== 'detailpage' && (
            <Typography className='page-title' variant='h4' align='left'>
              {' '}
              {mode === 'add'
                ? 'Create New Attendance Policy'
                : 'Edit Attendance Policy'}{' '}
            </Typography>
          )}
        </Grid>
        {props.pageType !== 'detailpage' && (
          <Grid
            display='flex'
            justifyContent={'flex-end'}
            marginTop={'-15px'}
            size={{
              lg: 12,
              md: 12,
              sm: 11,
              xs: 6
            }}>
            <CommonToolTip title='Close'>
              <IconButton aria-label='close' onClick={() => close(false)}>
                <CloseIcon />
              </IconButton>
            </CommonToolTip>
          </Grid>
        )}
      </Grid>
      <FormikProvider value={formik} validationSchema={validationSchema}>
        <Form onSubmit={formik.handleSubmit}>
          <Grid
            container
            spacing={3}
            display='flex'
            flexDirection='row'
            alignItems={'center'}
            paddingTop='10px'
          >
            {/* <Grid size={{ xs: 12, sm: 12, md: 9, lg: 6 }} Item paddingTop={3} paddingLeft={3}> */}
            {/* <Grid container spacing={3}> */}
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 3
              }}>
              <Typography variant='h6'> {'Attendance Policy Name'} </Typography>
            </Grid>
            <Grid
              Item
              paddingTop={3}
              paddingLeft={3}
              size={{
                lg: 3,
                md: 3,
                sm: 12,
                xs: 12
              }}>
              <TextField
                fullWidth={true}
                onWheel={(e) => e.target.blur()}
                label='Attendance Policy Name'
                placeholder='Attendance Policy Name'
                onChange={formik.handleChange}
                name='policy_name'
                type='text'
                inputProps={{min: 1, max: 12}}
                variant='filled'
                required={true}
                value={
                  props.pageType === 'detailpage'
                    ? 'Default Attendance policy'
                    : formik.values.policy_name
                }
                error={errors.policy_name}
                helperText={
                  errors.policy_name === null ? '' : errors.policy_name
                }
              ></TextField>
            </Grid>

            <Grid
              align='center'
              size={{
                lg: 3,
                md: 3,
                sm: 3
              }}>
              <Typography variant='h6'>
                {' '}
                {'Select Employee Category'}{' '}
              </Typography>
            </Grid>
            <Grid
              Item
              paddingTop={3}
              paddingLeft={3}
              size={{
                lg: 3,
                md: 3,
                sm: 12,
                xs: 12
              }}>
              {mode === 'edit' ? (
                <TextField
                  fullWidth={true}
                  // onWheel={(e) => e.target.blur()}
                  label='Selected Category'
                  // placeholder='Enter Hrs & Mins eg: 2h 30m'
                  // onChange={formik.handleChange}
                  name='category_id'
                  variant='filled'
                  value={editRowData.category_name}
                  disabled
                />
              ) : (
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      {id: 'selectAll', category_name: 'Select All'},
                      ...employeeCategoryList,
                    ]}
                    value={Array.isArray(formik.values?.category_id)
                      ? formik.values.category_id
                        .map((id) => employeeCategoryList.find((cat) => cat.id === id))
                        .filter(Boolean)
                      : []}
                    onChange={handleCategoryChange}
                    getOptionLabel={(option) => option.category_name}
                    isOptionEqualToValue={(option, value) =>
                      option?.id === value?.id
                    }
                    renderOption={(props, option, {selected}) => (
                      <li {...props}>
                        <Checkbox
                          checked={
                            option.id === 'selectAll'
                              ? formik.values.category_id.length ===
                                employeeCategoryList.length
                              : selected
                          }
                        />
                        {option.category_name}
                      </li>
                    )}
                    renderInput={(params) => {
                      const displayValue = formik.values.category_id.length
                        ? formik.values.category_id
                            .map(
                              (id) =>
                                employeeCategoryList.find((c) => c.id === id)
                                  ?.category_name,
                            )
                            .join(', ')
                        : '';

                      return (
                        <TextField
                          {...params}
                          label='Employee Category'
                          variant='filled'
                          required
                          error={
                            formik.touched.category_id &&
                            Boolean(formik.errors.category_id)
                          }
                          helperText={
                            formik.touched.category_id &&
                            formik.errors.category_id
                          }
                          onBlur={() =>
                            formik.setFieldTouched('category_id', true)
                          }
                          InputProps={{
                            ...params.InputProps,
                            inputProps: {
                              ...params.inputProps,
                              value: displayValue,
                              readOnly: true,
                            },
                          }}
                        />
                      );
                    }}
                    sx={{
                      '& .MuiFilledInput-root': {
                        paddingTop: '20px !important',
                        display: 'flex',
                        alignItems: 'center !important',
                      },
                      '& .MuiAutocomplete-input': {
                        padding: '0 !important',
                      },
                      '& .MuiAutocomplete-endAdornment': {
                        top: '12px !important',
                      },
                      '& .MuiAutocomplete-tag': {
                        display: 'none',
                      },
                    }}
                  />
                
              )}
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <Typography variant='h6'>{'Attendance Start Date '} </Typography>
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <TextField
                select
                fullWidth
                name='attendance_start_day'
                label='Select Start Date (e.g. 1, 5, 25)'
                value={formik.values.attendance_start_day || 1}
                onChange={handleStartDateChange}
                variant='filled'
                error={!!formik.errors.attendance_start_day}
                helperText={formik.errors.attendance_start_day}
              >
                {[...Array(28)].map((_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>
                    {i + 1}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Grid
            container
            spacing={2}
            display='flex'
            alignItems={'center'}
            paddingTop='20px'
          >
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <Typography variant='h6'>
                {'Total work hours in a day'}
              </Typography>
            </Grid>
            <Grid
              Item
              // paddingTop={3}
              // paddingLeft={3}
              size={{
                lg: 6,
                md: 9,
                sm: 12,
                xs: 12
              }}>
              <Grid container spacing={3}>
                <Grid
                  // display={'flex'}
                  // justifyContent={'flex-start'}
                  size={{
                    lg: 6,
                    md: 6,
                    sm: 6,
                    xs: 6
                  }}>
                  <TextField
                    fullWidth={true}
                    onWheel={(e) => e.target.blur()}
                    label='Enter duration'
                    required
                    placeholder='Enter Hrs & Mins eg: 2h 30m'
                    onChange={formik.handleChange}
                    name='total_work_hours_per_day'
                    variant='filled'
                    value={formik.values.total_work_hours_per_day}
                    onBlur={() =>
                      formik.setFieldTouched('total_work_hours_per_day', true)
                    }
                    error={
                      formik.touched.total_work_hours_per_day &&
                      Boolean(formik.errors.total_work_hours_per_day)
                    }
                    helperText={
                      formik.touched.total_work_hours_per_day &&
                      formik.errors.total_work_hours_per_day
                    }
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Grid
            container
            spacing={3}
            display='flex'
            alignItems={'center'}
            paddingTop='20px'
          >
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs:12
              }}>
              <Typography variant='h6'>
                {'Early Check-in Grace Time'}
              </Typography>
            </Grid>
            <Grid
              Item
              // paddingTop={3}
              // paddingLeft={3}
              size={{
                lg: 6,
                md: 9,
                sm: 12,
                xs: 12
              }}>
              <Grid container spacing={3}>
                <Grid
                  // display={'flex'}
                  // justifyContent={'flex-start'}
                  size={{
                    lg: 6,
                    md: 6,
                    sm: 6,
                    xs: 6
                  }}>
                  <Autocomplete
                    // disabled={compensationOff}
                    options={[1, 2, 3]}
                    name='early_check_in_grace_time'
                    fullWidth={true}
                    onChange={(event, value) =>
                      setFieldValue('early_check_in_grace_time', value)
                    }
                    value={formik.values.early_check_in_grace_time}
                    getOptionLabel={(option) => option.toString() + ' hour'}
                    renderInput={(params) => (
                      <TextField {...params} label='Select' variant='filled' />
                    )}
                  />
                  {/* <TextField
                fullWidth={true}
                onWheel={ (e) => e.target.blur()}
                label='Enter in hours'
                onChange = {formik.handleChange}
                name='early_check_in_grace_time_hr'
                type='number'
                inputProps={{ min: 1, max: 12 }}
                variant='filled'
                required={true}
                value={formik.values.early_check_in_grace_time_hr}
                error={errors.early_check_in_grace_time_hr}
                  helperText={
                    errors.early_check_in_grace_time_hr === null ? '' : errors.early_check_in_grace_time_hr
                  }
              ></TextField> */}
                </Grid>
                {/* <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }} display={'flex'} justifyContent={'flex-end'}>
                <TextField
                  fullWidth={true}
                  onWheel={ (e) => e.target.blur()}
                  label='Enter in minutes'
                  onChange = {formik.handleChange}
                  name='early_check_in_grace_time_min'
                  type='number'
                  inputProps={{ min: 1, max: 59 }}
                  variant='filled'
                  value={formik.values.early_check_in_grace_time_min}
                  error={errors.early_check_in_grace_time_min}
                  helperText={
                    errors.early_check_in_grace_time_min === null ? '' : errors.early_check_in_grace_time_min
                  }
                  required={true}
                ></TextField>
              </Grid> */}
              </Grid>
            </Grid>
          </Grid>

          <Grid
            container
            spacing={3}
            display='flex'
            alignItems={'center'}
            paddingTop='20px'
          >
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs:12
              }}>
              <Typography variant='h6'>
                {'Late Check-out Grace Time'}
              </Typography>
            </Grid>
            <Grid
              Item
              // paddingTop={3}
              // paddingLeft={3}
              size={{
                lg: 6,
                md: 9,
                sm: 12,
                xs: 12
              }}>
              <Grid container spacing={3}>
                <Grid
                  // display={'flex'}
                  // justifyContent={'flex-start'}
                  size={{
                    lg: 6,
                    md: 6,
                    sm: 6,
                    xs: 6
                  }}>
                  <Autocomplete
                    // disabled={compensationOff}
                    options={[1, 2, 3]}
                    name='late_check_out_grace_time'
                    fullWidth={true}
                    onChange={(event, value) =>
                      setFieldValue('late_check_out_grace_time', value)
                    }
                    value={formik.values.late_check_out_grace_time}
                    getOptionLabel={(option) => option.toString() + ' hour'}
                    renderInput={(params) => (
                      <TextField {...params} label='Select' variant='filled' />
                    )}
                  />
                  {/* <TextField
                fullWidth={true}
                onWheel={ (e) => e.target.blur()}
                label='Enter in hours'
                onChange = {formik.handleChange}
                name='late_check_out_grace_time_hr'
                type='number'
                inputProps={{ min: 1, max: 12 }}
                variant='filled'
                required={true}
                value={formik.values.late_check_out_grace_time_hr}
                error={errors.late_check_out_grace_time_hr}
                  helperText={
                    errors.late_check_out_grace_time_hr === null ? '' : errors.late_check_out_grace_time_hr
                  }
              ></TextField> */}
                </Grid>
                {/* <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }} display={'flex'} justifyContent={'flex-end'}>
                <TextField
                  fullWidth={true}
                  onWheel={ (e) => e.target.blur()}
                  label='Enter in minutes'
                  onChange = {formik.handleChange}
                  name='early_check_in_grace_time_min'
                  type='number'
                  inputProps={{ min: 1, max: 59 }}
                  variant='filled'
                  value={formik.values.early_check_in_grace_time_min}
                  error={errors.late_check_out_grace_time_min}
                  helperText={
                    errors.late_check_out_grace_time_min === null ? '' : errors.late_check_out_grace_time_min
                  }
                  required={true}
                ></TextField>
              </Grid> */}
              </Grid>
            </Grid>
          </Grid>

          <Grid
            container
            spacing={2}
            display='flex'
            alignItems='center'
            paddingTop='20px'
          >
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <Typography variant='h6'>
                {'Mark 1/2 Day Leave If Late in by >'}
              </Typography>
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <TextField
                fullWidth={true}
                onWheel={(e) => e.target.blur()}
                label='Enter duration'
                placeholder='Enter Hrs & Mins eg: 2h 30m'
                onChange={formik.handleChange}
                name='mark_halfday_leave'
                variant='filled'
                value={formik.values.mark_halfday_leave}
                error={!!errors.mark_halfday_leave}
                helperText={errors.mark_halfday_leave}
              />
            </Grid>
            {/* <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
              <Typography variant='h6'>
                {'Mark 1/2 Day If work Duration is <'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
              <TextField
                fullWidth={true}
                onWheel={(e) => e.target.blur()}
                label='Enter duration'
                placeholder='Enter Hrs & Mins eg: 2h 30m'
                onChange={formik.handleChange}
                name='calculate_halfday'
                // type="number"
                variant='filled'
                value={formik.values.calculate_halfday}
                error={!!errors.calculate_halfday}
                helperText={errors.calculate_halfday}
              />
            </Grid> */}
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <Typography variant='h6'>
                {'Mark 1/2 Day Leave If Early Out by >'}
              </Typography>
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <TextField
                fullWidth={true}
                onWheel={(e) => e.target.blur()}
                label='Enter duration'
                placeholder='Enter Hrs & Mins eg: 2h 30m'
                onChange={formik.handleChange}
                name='halfday_early_out'
                // type="number"
                variant='filled'
                value={formik.values.halfday_early_out}
                error={!!errors.halfday_early_out}
                helperText={errors.halfday_early_out}
              />
            </Grid>
          </Grid>

          <Grid
            container
            spacing={2}
            display='flex'
            alignItems='center'
            paddingTop='20px'
          >
            {/* <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
              <Typography variant='h6'>
                {'Calculate Leave If Work Duration is < '}{' '}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
              <TextField
                fullWidth={true}
                onWheel={(e) => e.target.blur()}
                label='Enter duration'
                onChange={formik.handleChange}
                name='calculate_leave'
                placeholder='Enter Hrs & Mins eg: 2h 30m' */}
            {/* // type='number' */}
            {/* // inputProps={{ min: 1, max: 12 }} */}
            {/* variant='filled' */}
            {/* // required={true} */}
            {/* value={formik.values.calculate_leave}
                error={!!formik.errors.calculate_leave}
                helperText={formik.errors.calculate_leave} */}
            {/* ></TextField>
            </Grid> */}
            <Grid
              size={{
                lg: 2,
                md: 2,
                sm: 6,
                xs: 12
              }}>
              <Typography variant='h6'>
                {`Calculate 1/2 Day Late in by ${
                  formik.values.late_in_days_count || 3
                } Days > `}{' '}
              </Typography>
            </Grid>
            <Grid
              size={{
                lg: 2,
                md: 2,
                sm: 6,
                xs: 12
              }}>
              <TextField
                fullWidth={true}
                onWheel={(e) => e.target.blur()}
                label='No. of days'
                type='number'
                inputProps={{ min: 1, max: 31, step: 1 }}
                onChange={formik.handleChange}
                name='late_in_days_count'
                variant='filled'
                value={formik.values.late_in_days_count}
                error={!!formik.errors.late_in_days_count}
                helperText={formik.errors.late_in_days_count}
              />
            </Grid>
            <Grid
              size={{
                lg: 2,
                md: 2,
                sm: 6,
                xs: 12
              }}>
              <TextField
                fullWidth={true}
                onWheel={(e) => e.target.blur()}
                label='Enter duration'
                onChange={formik.handleChange}
                name='calculate_latedays'
                placeholder='Enter Hrs & Mins eg: 2h 30m'
                variant='filled'
                value={formik.values.calculate_latedays}
                error={!!formik.errors.calculate_latedays}
                helperText={formik.errors.calculate_latedays}
              ></TextField>
            </Grid>
            <Grid
              size={{
                lg: 2,
                md: 2,
                sm: 6,
                xs: 12
              }}>
              <Typography variant='h6'>
                {`Calculate 1/2 Day If Early Out by ${
                  formik.values.early_out_days_count || 3
                } Days > `}{' '}
              </Typography>
            </Grid>
            <Grid
              size={{
                lg: 2,
                md: 2,
                sm: 6,
                xs: 12
              }}>
              <TextField
                fullWidth={true}
                onWheel={(e) => e.target.blur()}
                label='No. of days'
                type='number'
                inputProps={{ min: 1, max: 31, step: 1 }}
                onChange={formik.handleChange}
                name='early_out_days_count'
                variant='filled'
                value={formik.values.early_out_days_count}
                error={!!formik.errors.early_out_days_count}
                helperText={formik.errors.early_out_days_count}
              />
            </Grid>
            <Grid
              size={{
                lg: 2,
                md: 2,
                sm: 6,
                xs: 12
              }}>
              <TextField
                fullWidth={true}
                onWheel={(e) => e.target.blur()}
                label='Enter duration'
                onChange={formik.handleChange}
                name='halfday_early_out_3days'
                placeholder='Enter Hrs & Mins eg: 2h 30m'
                variant='filled'
                value={formik.values.halfday_early_out_3days}
                error={!!formik.errors.halfday_early_out_3days}
                helperText={formik.errors.halfday_early_out_3days}
              />
            </Grid>
          </Grid>

          <Grid
            container
            spacing={2}
            display='flex'
            alignItems='center'
            paddingTop='20px'
          >
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <Typography variant='h6'>
                {'Mark 1/2 Day If work Duration is <'}
              </Typography>
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <TextField
                fullWidth={true}
                onWheel={(e) => e.target.blur()}
                label='Enter duration'
                placeholder='Enter Hrs & Mins eg: 2h 30m'
                onChange={formik.handleChange}
                name='calculate_halfday'
                // type="number"
                variant='filled'
                value={formik.values.calculate_halfday}
                error={!!errors.calculate_halfday}
                helperText={errors.calculate_halfday}
              />
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <Typography variant='h6'>
                {'Calculate Leave If Work Duration is < '}{' '}
              </Typography>
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <TextField
                fullWidth={true}
                onWheel={(e) => e.target.blur()}
                label='Enter duration'
                onChange={formik.handleChange}
                name='calculate_leave'
                placeholder='Enter Hrs & Mins eg: 2h 30m'
                // type='number'
                // inputProps={{ min: 1, max: 12 }}
                variant='filled'
                // required={true}
                value={formik.values.calculate_leave}
                error={!!formik.errors.calculate_leave}
                helperText={formik.errors.calculate_leave}
              >
                {' '}
              </TextField>
            </Grid>
          </Grid>

          <Grid
            paddingTop='20px'
            size={{
              lg: pageType === 'detailpage' ? 12 : 6,
              md: pageType === 'detailpage' ? 12 : 6,
              sm: pageType === 'detailpage' ? 12 : 6,
              xs: pageType === 'detailpage' ? 12 : 6
            }}>
            <Box bgcolor='lightGrey' p={2} borderRadius={1}>
              <Typography
                align='center'
                variant='h5'
                // paddingTop="3px"
              >
                Breaks
              </Typography>
            </Box>
          </Grid>

          <Grid
            container
            spacing={2}
            display='flex'
            alignItems='center'
            paddingTop='20px'
          >
            {/* Lunch Break */}
            <Grid
              align={'left'}
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <Typography variant='h6'>
                {'Break Hours Estimation :'}{' '}
              </Typography>
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <TextField
                fullWidth={true}
                onWheel={(e) => e.target.blur()}
                label='Enter Duration'
                onChange={formik.handleChange}
                name='break_estimation'
                placeholder='Enter Hrs & Mins eg: 2h 30m'
                // type='number'
                //  inputProps={{ min: 1, max: 12 }}
                variant='filled'
                // required={true}
                value={formik.values.break_estimation}
                error={!!formik.errors.break_estimation}
                helperText={formik.errors.break_estimation}
              ></TextField>
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}></Grid>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}></Grid>

            <Grid
              align={'left'}
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <Typography variant='h6'>{'Lunch Break :'} </Typography>
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 12,
                xs: 12
              }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <Grid container spacing={2}>
                  <Grid
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                    }}>
                    <TimePicker
                      label='Start Time'
                      name='lunch_start_time'
                      value={toMomentOrNull(values.lunch_start_time)}
                      onChange={(newValue) =>
                        formik.setFieldValue('lunch_start_time', newValue)
                      }
                      slotProps={{ textField: { variant: 'filled', fullWidth: true, error: !!formik.errors.lunch_start_time, helperText: formik.errors.lunch_start_time } }}
                    />
                  </Grid>
                </Grid>
              </LocalizationProvider>
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <TextField
                fullWidth={true}
                onWheel={(e) => e.target.blur()}
                label='Enter Duration'
                onChange={formik.handleChange}
                name='lunch_break'
                placeholder='Enter Hrs & Mins eg: 2h 30m'
                // type='number'
                //  inputProps={{ min: 1, max: 12 }}
                variant='filled'
                // required={true}
                value={
                  values.lunch_break === 0
                    ? ''
                    : formik.values.lunch_break || ''
                }
                error={!!formik.errors.lunch_break}
                helperText={formik.errors.lunch_break}
              ></TextField>
            </Grid>
            {/* Time */}

            {/* Break Sequence */}
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <FormControl
                fullWidth
                variant='filled'
                //error={!!formik.errors.lunch_break_in_sequence_sequence}
              >
                <InputLabel id='lunch-break-sequence-label'>
                  Grace Time
                </InputLabel>
                <Select
                  labelId='lunch-break-sequence-label'
                  id='lunch-break-sequence'
                  name='lunch_grace_time'
                  value={values.lunch_grace_time}
                  onChange={(e) => {
                    const value = e.target.value;
                    formik.setFieldValue('lunch_grace_time', value); // Main field
                  }}
                >
                  <MenuItem value='0'>0</MenuItem>
                  <MenuItem value='5'>5</MenuItem>
                  <MenuItem value='15'>15</MenuItem>
                  <MenuItem value='30'>30</MenuItem>
                  {/* //<MenuItem value='45'>45</MenuItem> */}
                </Select>

                {/* <FormHelperText>
                  {formik.errors.lunch_break_in_sequence_sequence}
                </FormHelperText> */}
              </FormControl>
            </Grid>

            <Grid
              align='left'
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <Typography variant='h6'>Dinner Break :</Typography>
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 12,
                xs: 12
              }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <Grid container spacing={2}>
                  <Grid
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                    }}>
                    <TimePicker
                      label='Start Time'
                      name='dinner_start_time'
                      value={toMomentOrNull(values.dinner_start_time)}
                      onChange={(newValue) =>
                        formik.setFieldValue('dinner_start_time', newValue)
                      }
                      slotProps={{ textField: { fullWidth: true, variant: 'filled', error: !!formik.errors.dinner_start_time, helperText: formik.errors.dinner_start_time } }}
                    />
                  </Grid>
                </Grid>
              </LocalizationProvider>
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <TextField
                fullWidth
                onWheel={(e) => e.target.blur()}
                label='Enter Duration'
                onChange={formik.handleChange}
                name='dinner_break'
                placeholder='Enter Hrs & Mins eg: 2h 30m'
                variant='filled'
                value={
                  values.dinner_break === 0
                    ? ''
                    : formik.values.dinner_break || ''
                }
                error={!!formik.errors.dinner_break}
                helperText={formik.errors.dinner_break}
              />
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <FormControl fullWidth variant='filled'>
                <InputLabel id='lunch-break-sequence-label'>
                  Grace Time
                </InputLabel>
                <Select
                  labelId='lunch-break-sequence-label'
                  id='lunch-break-sequence'
                  name='dinner_grace_time'
                  value={values.dinner_grace_time}
                  onChange={(e) => {
                    const value = e.target.value;
                    formik.setFieldValue('dinner_grace_time', value);
                  }}
                >
                  <MenuItem value='0'>0</MenuItem>
                  <MenuItem value='5'>5</MenuItem>
                  <MenuItem value='15'>15</MenuItem>
                  <MenuItem value='30'>30</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Tea Break 1 */}
            <Grid
              align={'left'}
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <Typography variant='h6'>{'Tea1 Break :'} </Typography>
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 12,
                xs: 12
              }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <Grid container spacing={2}>
                  <Grid
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 6,
                      xs: 6
                    }}>
                    <TimePicker
                      label='Start Time'
                      name='tea1_start_time'
                      value={toMomentOrNull(values.tea1_start_time)}
                      onChange={(newValue) =>
                        formik.setFieldValue('tea1_start_time', newValue)
                      }
                      slotProps={{ textField: { variant: 'filled', fullWidth: true, error: !!formik.errors.tea1_start_time, helperText: formik.errors.tea1_start_time } }}
                    />
                  </Grid>
                </Grid>
              </LocalizationProvider>
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <TextField
                fullWidth={true}
                onWheel={(e) => e.target.blur()}
                label='Enter Duration'
                onChange={formik.handleChange}
                name='tea1_break'
                placeholder='Enter Hrs & Mins eg: 2h 30m'
                // type='number'
                //  inputProps={{ min: 1, max: 12 }}
                variant='filled'
                // required={true}
                value={
                  values.tea1_break === 0 ? '' : formik.values.tea1_break || ''
                }
                error={!!formik.errors.tea1_break}
                helperText={formik.errors.tea1_break}
              ></TextField>
            </Grid>
            {/* Time */}

            {/* Break Sequence */}
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <Tooltip title='Sequence 2 only allowed' arrow>
                <FormControl
                  fullWidth
                  variant='filled'
                  error={!!formik.errors.tea1_break_in_sequence}
                >
                  <InputLabel id='tea1-break-sequence-label'>
                    Grace Time
                  </InputLabel>
                  <Select
                    labelId='tea1-break-sequence-label'
                    id='tea1-break-sequence'
                    name='tea1_grace_time'
                    value={values.tea1_grace_time}
                    onChange={(e) => {
                      const value = e.target.value;
                      formik.setFieldValue('tea1_grace_time', value); // Main field
                    }}
                  >
                    <MenuItem value='0'>0</MenuItem>
                    <MenuItem value='5'>5</MenuItem>
                    <MenuItem value='15'>15</MenuItem>
                    <MenuItem value='30'>30</MenuItem>
                    {/* <MenuItem value='3'>45</MenuItem> */}
                  </Select>
                  <FormHelperText>
                    {formik.errors.tea1_break_in_sequence}
                  </FormHelperText>
                </FormControl>
              </Tooltip>
            </Grid>

            {/* Tea Break 2 */}
            <Grid
              align={'left'}
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <Typography variant='h6'>{'Tea2 Break :'} </Typography>
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 12,
                xs: 12
              }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <Grid container spacing={2}>
                  <Grid
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 6,
                      xs: 6
                    }}>
                    <TimePicker
                      label='Start Time'
                      name='tea2_start_time'
                      value={toMomentOrNull(values.tea2_start_time)}
                      onChange={(newValue) =>
                        formik.setFieldValue('tea2_start_time', newValue)
                      }
                      slotProps={{ textField: { variant: 'filled', fullWidth: true, error: !!formik.errors.tea2_start_time, helperText: formik.errors.tea2_start_time } }}
                    />
                  </Grid>
                </Grid>
              </LocalizationProvider>
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <TextField
                fullWidth={true}
                onWheel={(e) => e.target.blur()}
                label='Enter Duration'
                onChange={formik.handleChange}
                name='tea2_break'
                placeholder='Enter Hrs & Mins eg: 2h 30m'
                // type='number'
                //  inputProps={{ min: 1, max: 12 }}
                variant='filled'
                // required={true}
                value={
                  values.tea2_break === 0 ? '' : formik.values.tea2_break || ''
                }
                error={!!formik.errors.tea2_break}
                helperText={formik.errors.tea2_break}
              ></TextField>
            </Grid>

            {/* Time */}

            {/* Break Sequence */}
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <Tooltip title='Sequence 4 or 6 only allowed' arrow>
                <FormControl
                  fullWidth
                  variant='filled'
                  error={!!formik.errors.tea2_break_in_sequence}
                >
                  <InputLabel id='tea2-break-sequence-label'>
                    Grace Time
                  </InputLabel>
                  <Select
                    labelId='tea2-break-sequence-label'
                    id='tea2-break-sequence'
                    name='tea2_grace_time'
                    value={values.tea2_grace_time}
                    onChange={(e) => {
                      const value = e.target.value;
                      formik.setFieldValue('tea2_grace_time', value); // Main field
                    }}
                  >
                    <MenuItem value='0'>0</MenuItem>
                    <MenuItem value='5'>5</MenuItem>
                    <MenuItem value='15'>15</MenuItem>
                    <MenuItem value='30'>30</MenuItem>
                    {/* <MenuItem value='3'>45</MenuItem> */}
                  </Select>
                  <FormHelperText>
                    {formik.errors.tea2_break_in_sequence}
                  </FormHelperText>
                </FormControl>
              </Tooltip>
            </Grid>
            {/* <Grid container spacing={2} alignItems='center'> */}
            <Grid
              align='left'
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <Typography variant='h6'>{'Include Break'}</Typography>
            </Grid>
            <Grid
              align='left'
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <FormControl component='fieldset'>
                <FormLabel component='legend'>Include Break</FormLabel>
                <RadioGroup
                  row
                  name='include_break'
                  value={Number(values.include_break) === 1 ? 'yes' : 'no'}
                  onChange={(e) => {
                    const value = e.target.value;
                    console.log(
                      typeof values.include_break,
                      values.include_break,
                      'fvdvdfv',
                    );
                    setFieldValue('include_break', value === 'yes' ? 1 : 0);
                  }}
                >
                  <FormControlLabel
                    value='yes'
                    control={<Radio />}
                    label='Yes'
                  />
                  <FormControlLabel value='no' control={<Radio />} label='No' />
                </RadioGroup>
              </FormControl>
            </Grid>
            {/* </Grid> */}

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Box
                sx={{
                  padding: 2,
                  border: '1px solid #ccc',
                  backgroundColor: '#f7f7f7',
                  borderRadius: '8px',
                }}
              >
                <Typography variant='h6' gutterBottom>
                  Note
                </Typography>
                <Typography variant='caption' color='textSecondary'>
                  Consider first and last punches for work duration
                  <br />
                  {/* Second or Fourth punches for lunch breakin.Third or Fifth punches for lunch breakout.
                  <br />

                  Second punches for tea1 breakin.Third punches for tea1 breakout.
                  <br />
                  Fourth or Sixth punches for tea2 breakin.Fifth or Seventh punches for tea2 breakout.
                  <br /> */}
                  User may use all 3 or any 2 or any 1
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Grid
            paddingTop='20px'
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Box bgcolor='lightGrey' p={2} borderRadius={1}>
              <Typography
                align='center'
                variant='h5'
                // paddingTop="3px"
              >
                Permission
              </Typography>
            </Box>
          </Grid>

          <Grid
            container
            spacing={2}
            display='flex'
            alignItems='center'
            paddingTop='20px'
          >
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <Typography variant='h6'>
                {'Permission Duration for a month'}{' '}
              </Typography>
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <TextField
                fullWidth={true}
                onWheel={(e) => e.target.blur()}
                label='Enter Duration'
                onChange={formik.handleChange}
                name='permission_duration'
                // type='number'
                placeholder='Enter Hrs & Mins eg: 2h 30m'
                // inputProps={{ min: 1, max: 12 }}
                variant='filled'
                // required={true}
                value={formik.values.permission_duration}
                error={!!formik.errors.permission_duration}
                helperText={formik.errors.permission_duration}
              ></TextField>
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <Typography variant='h6'>{'Permission Count'}</Typography>
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <Autocomplete
                // disabled={enableOverTime}
                options={[1, 2, 3, 4, 5]}
                name='permission_count'
                fullWidth={true}
                onChange={(event, value) =>
                  setFieldValue('permission_count', value)
                }
                value={formik.values.permission_count}
                getOptionLabel={(option) => option.toString()}
                renderInput={(params) => (
                  <TextField {...params} label='Select' variant='filled' />
                )}
              />
            </Grid>
          </Grid>

          {/* <Grid container> */}
          <Grid
            paddingTop='20px'
            size={{
              lg: pageType === 'detailpage' ? 12 : 6,
              md: pageType === 'detailpage' ? 12 : 6,
              sm: pageType === 'detailpage' ? 12 : 6,
              xs: pageType === 'detailpage' ? 12 : 6
            }}>
            <Box bgcolor='lightGrey' p={2} borderRadius={1}>
              <Typography
                align='center'
                variant='h5'
                // paddingTop="3px"
              >
                Auto Clockout
              </Typography>
            </Box>
          </Grid>

          <Grid
            size={{
              lg: 3,
              md: 4,
              sm: 6,
              xs: 12
            }}>
            <FormControl component='fieldset'>
              <FormControlLabel
                control={
                  <Switch
                    name='enable_auto_clockout'
                    checked={values.enable_auto_clockout === 1 ? true : false}
                    size='medium'
                    color='primary'
                    label='Enable Auto Clockout'
                    onChange={handleCheck}
                  />
                }
                label='Enable Auto Clockout'
                name='enable_auto_clockout'
              />
            </FormControl>
          </Grid>
          <Grid
            container
            spacing={2}
            display='flex'
            alignItems='center'
            paddingTop='20px'
          >
            <Grid
              align={'left'}
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <Typography variant='h6'>
                {'Auto clockout duration :'}{' '}
              </Typography>
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <TextField
                fullWidth={true}
                onWheel={(e) => e.target.blur()}
                label='Enter Duration'
                onChange={formik.handleChange}
                name='auto_clockout'
                placeholder='Enter Hrs & Mins eg: 2h 30m'
                disabled={values.enable_auto_clockout === 0}
                // type='number'
                //  inputProps={{ min: 1, max: 12 }}
                variant='filled'
                required={values.enable_auto_clockout === 1}
                value={
                  values.enable_auto_clockout === 0
                    ? ''
                    : formik.values.auto_clockout || ''
                }
                // error={!!formik.errors.auto_clockout}
                // helperText={formik.errors.auto_clockout}
                onBlur={() => formik.setFieldTouched('auto_clockout', true)}
                error={
                  formik.touched.auto_clockout &&
                  Boolean(formik.errors.auto_clockout)
                }
                helperText={
                  formik.touched.auto_clockout && formik.errors.auto_clockout
                }
              ></TextField>
            </Grid>
          </Grid>

          <Grid
            paddingTop='20px'
            size={{
              lg: pageType === 'detailpage' ? 12 : 6,
              md: pageType === 'detailpage' ? 12 : 6,
              sm: pageType === 'detailpage' ? 12 : 6,
              xs: pageType === 'detailpage' ? 12 : 6
            }}>
            <Box bgcolor='lightGrey' p={2} borderRadius={1}>
              <Typography
                align='center'
                variant='h5'
                // paddingTop="3px"
              >
                Over Time
              </Typography>
            </Box>
          </Grid>

          <Grid
            size={{
              lg: 3,
              md: 4,
              sm: 6,
              xs: 12
            }}>
            <FormControl component='fieldset'>
              <FormControlLabel
                control={
                  <Switch
                    name='enable_over_time'
                    checked={values.enable_over_time === 1 ? true : false}
                    size='medium'
                    color='primary'
                    label='Enable Over Time'
                    onChange={handleCheck}
                  />
                }
                label='Enable Over Time'
                name='enable_over_time'
              />
            </FormControl>
          </Grid>

          {/* </Grid> */}

          <Grid
            container
            spacing={2}
            display='flex'
            alignItems='center'
            paddingTop='20px'
          >
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <Typography variant='h6'>{'Over Time Minimum Time'} </Typography>
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <TextField
                fullWidth={true}
                onWheel={(e) => e.target.blur()}
                label='Enter Duration'
                onChange={formik.handleChange}
                name='ot_min_time'
                placeholder='Enter Hrs & Mins eg: 2h 30m'
                // type='number'
                disabled={values.enable_over_time === 0}
                //  inputProps={{ min: 1, max: 12 }}
                variant='filled'
                required={values.enable_over_time === 1}
                value={
                  values.enable_over_time === 0
                    ? ''
                    : formik.values.ot_min_time || ''
                }
                error={!!formik.errors.ot_min_time}
                helperText={formik.errors.ot_min_time}
              ></TextField>
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <Typography variant='h6'>{'Over Time Maximum Time '} </Typography>
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <TextField
                fullWidth={true}
                onWheel={(e) => e.target.blur()}
                label='Enter Duration'
                onChange={formik.handleChange}
                name='ot_max_time'
                placeholder='Enter Hrs & Mins eg: 2h 30m'
                // type='number'
                // inputProps={{ min: 1, max: 12 }}
                variant='filled'
                disabled={values.enable_over_time === 0}
                required={values.enable_over_time === 1}
                value={
                  values.enable_over_time === 0
                    ? ''
                    : formik.values.ot_max_time || ''
                }
                error={!!formik.errors.ot_max_time}
                helperText={formik.errors.ot_max_time}
              ></TextField>
            </Grid>
          </Grid>

          {/* -- mandatory Restrictions */}

          <Grid
            paddingTop='20px'
            size={{
              lg: pageType === 'detailpage' ? 12 : 6,
              md: pageType === 'detailpage' ? 12 : 6,
              sm: pageType === 'detailpage' ? 12 : 6,
              xs: pageType === 'detailpage' ? 12 : 6
            }}>
            <Box bgcolor='lightGrey' p={2} borderRadius={1}>
              <Typography
                align='center'
                variant='h5'
                // paddingTop="3px"
              >
                Frequent Punch Limit
              </Typography>
            </Box>
          </Grid>

          <Grid
            size={{
              lg: 3,
              md: 4,
              sm: 6,
              xs: 12
            }}>
            <FormControl component='fieldset'>
              <FormControlLabel
                control={
                  <Switch
                    name='enable_punch_limit'
                    checked={values.enable_punch_limit === 1 ? true : false}
                    size='medium'
                    color='primary'
                    label='Enable punch limit'
                    onChange={handleCheck}
                  />
                }
                label='Enable punch limit'
                name='enable_punch_limit'
              />
            </FormControl>
          </Grid>

          <Grid
            container
            spacing={2}
            display='flex'
            alignItems='center'
            paddingTop='20px'
          >
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <Typography variant='h6'>{'Total Punch sequence'} </Typography>
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <TextField
                fullWidth
                onWheel={(e) => e.target.blur()}
                label='Enter Punch'
                name='total_punch'
                type='number'
                variant='filled'
                placeholder='Enter Total Number of Punch'
                disabled={values.enable_punch_limit === 0}
                required={values.enable_punch_limit === 1}
                value={
                  values.enable_punch_limit === 0
                    ? ''
                    : formik.values.total_punch || ''
                }
                onChange={formik.handleChange}
                error={
                  values.enable_punch_limit === 1 &&
                  Boolean(formik.errors.total_punch)
                }
                helperText={
                  values.enable_punch_limit === 1
                    ? formik.errors.total_punch
                    : ''
                }
              ></TextField>
            </Grid>

            <Grid
              align='left'
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <Typography variant='h6'>{'Consider Final Punch-Out'}</Typography>
            </Grid>
            <Grid
              align='left'
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <FormControl component='fieldset'>
                {/* <FormLabel component='legend'>Consider Final Punch-Out</FormLabel> */}
                <RadioGroup
                  row
                  name='last_punch_out'
                  value={Number(values.last_punch_out) === 1 ? 'yes' : 'no'}
                  onChange={(e) => {
                    const value = e.target.value;
                    console.log(
                      typeof values.last_punch_out,
                      values.last_punch_out,
                      'last_punch_out',
                    );
                    setFieldValue('last_punch_out', value === 'yes' ? 1 : 0);
                  }}
                >
                  <FormControlLabel
                    value='yes'
                    control={<Radio />}
                    label='Yes'
                  />
                  <FormControlLabel value='no' control={<Radio />} label='No' />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>

          {/* <Divider></Divider> */}
          <Grid
            spacing={7}
            container={true}
            direction='row'
            display='flex'
            justifyContent='flex-end'
            paddingTop='25px'
          >
            <Grid>
              {props.pageType === 'detailpage' ? (
                <Button
                  onClick={props.handleBack}
                  style={{}}
                  name='Close'
                  variant='contained'
                  color='secondary'
                  size='medium'
                  text='button'
                  fullWidth={false}
                  type='cancel'
                >
                  Back
                </Button>
              ) : (
                <Button
                  onClick={() => close(false)}
                  style={{}}
                  name='Close'
                  variant='contained'
                  color='secondary'
                  size='medium'
                  text='button'
                  fullWidth={false}
                  type='cancel'
                >
                  Cancel
                </Button>
              )}
            </Grid>

            <Grid>
              <Button
                onClick={async () => {
                  const ValidationErrors = await validateForm();
                  if (Object.keys(ValidationErrors).length > 0) {
                    dispatch(
                      OpenalertActions({
                        msg: requiredFieldsAlertMessage,
                        severity: 'warning',
                      }),
                    );
                    handleSubmit();
                  } else {
                    handleSubmit();
                  }
                }}
                style={{}}
                name='Submit'
                variant='contained'
                color='primary'
                size='medium'
                text='button'
                fullWidth={false}
                // type='submit'
              >
                {props.pageType === 'detailpage' ? 'Next' : 'Submit'}
              </Button>
            </Grid>
          </Grid>
        </Form>
      </FormikProvider>
    </Card>
  );
}
