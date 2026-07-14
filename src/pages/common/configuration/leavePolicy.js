import { Autocomplete, Box, Button, Card, Checkbox, Dialog, DialogActions, DialogContent, Divider, FormControl, FormControlLabel, FormLabel, Grid, IconButton, MenuItem, Select, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { Form, FormikProvider, useFormik } from 'formik';
import React, { useEffect, useState } from 'react'
import * as Yup from 'yup';
import CloseIcon from '@mui/icons-material/Close';
import CommonToolTip from 'components/ToolTip';
import { attendancePolicyAction, leavePolicyAction, listEmployeeCategoryAction, updateAttendancePolicyAction, updateLeavePolicyAction } from 'redux/actions/shifts.actions';
import { useDispatch, useSelector } from 'react-redux';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import axios from 'axios';
import { getNewLeaveTypeAction, createLeaveListAction} from "redux/actions/leaveRequest_actions"
import { InputAdornment } from "@mui/material";
import { Paper } from '@mui/material';


export default function LeavePolicy(props) {

  const { close, open, editRowData, mode, handleNext, handleBack, pageType } = props;
  console.log('LeavePolicy mode:', mode, 'pageType:', pageType);
  const dispatch = useDispatch();
  const {
    ShiftsReducer: { employeeCategoryList, leavePolicyList },
    leaveRequestReducer: { newLeaveTypeList: leaveTypes }} = useSelector((state) => state);
console.log(leavePolicyList,'leavepolicy')
    console.log("Dropdown", leaveTypes);
    const [compensationOff, setCompensationOff] = useState(false);
    const [enablePrivilegeLeave, setEnablePrivilegeLeave] = useState(false);
    const [privilegeLeaveCarryForward, setPrivilegeLeaveCarryForward] = useState(false);
    const [offDay, setOffDay] = useState(false);
    const [toolbarHeight, setToolbarHeight] = useState(document.getElementsByClassName('MuiToolbar-root')[0]?.clientHeight || 70)
    const [windowHeight, setWindowHeight] = useState(window.innerHeight)
    const [isopen, setOpen] = useState(false);
    const [leaveTypesList, setLeaveTypesList] = useState([]);
    const [hasInitializedDefaultLeaveTypes, setHasInitializedDefaultLeaveTypes] = useState(false);
    const [customTypeCode, setCustomTypeCode] = useState("");
    const [customLeaveTypes, setCustomLeaveTypes] = useState([]);
    const [openCustomTypeDialog, setOpenCustomTypeDialog] = useState(false);
    const [isCreatingCustomType, setIsCreatingCustomType] = useState(false);
    const [customTypeName, setCustomTypeName] = useState("");
    const defaultLeaveTypeForm = {
    leaveType: "",
    leaveCode: "",
    payTreatment: "paid",
    unit: "days",
    minimumNotice: "",
    creditType: "earned",
    earnedDays: "21",
    initialCredit: "",
    carryForward: false,
    carryLimit: "",
    maxPerMonth: 1,
    documentsRequired: false,
  };
    const [formData, setFormData] = useState(defaultLeaveTypeForm);
    const [editingLeaveTypeIndex, setEditingLeaveTypeIndex] = useState(null);
     

    const Days = [
        {id: 1, day: "Sunday"},
        {id: 2, day: "Monday"},
        {id: 3, day: "Tuesday"},
        {id: 4, day: "Wednesday"},
        {id: 5, day: "Thursday"},
        {id: 6, day: "Friday"},
        {id: 7, day: "Saturday"},
      ];

// console.log("dsfgfdg",employeeCategoryList);

      Yup.addMethod(Yup.number, 'maxHours5', function () {
        return this.test('maxHours5', 'Hours should be within 5 hours!', function (value) {
          const { path, createError } = this;
          return value === undefined || value <= 5 || createError({ path, message: 'Hours should be within 5 hours!' });
        });
      });

      Yup.addMethod(Yup.number, 'maxHours12', function () {
        return this.test('maxHours12', 'Hours should be within 12 hours!', function (value) {
          const { path, createError } = this;
          return value === undefined || value <= 12 || createError({ path, message: 'Hours should be within 12 hours!' });
        });
      });

      Yup.addMethod(Yup.number, 'maxMinutes', function () {
        return this.test('maxMinutes', 'Minutes should be within 59 mins!', function (value) {
          const { path, createError } = this;
          return value === undefined || value <= 59 || createError({ path, message: 'Minutes should be within 59 mins!' });
        });
      });

    const validationSchema = Yup.object().shape({
      leave_policy_name: Yup.string().required('Name is required!'),
      category_id: Yup.array().of(Yup.string()).min(1, "Employee Category is required").required("Employee Category is required"),
      no_of_leave_per_week: Yup.number()
        .nullable()
        .typeError('Leave per week must be a number')
        .required('Leave per week is required!'),
      // restricted_holidays: Yup.number().min(0, "No of Days must be at least 0").required("No of Days is required!"),
      // avail_restricted_holidays: Yup.number().min(0, "No of Days must be at least 0").required("No of Days is required!"),
      off_day1: Yup.object().nullable().when('no_of_leave_per_week', {
        is: (val) => val === '2' || val === 2,
        then: Yup.object().required('Off Day 1 is required when 2 leaves are selected'),
        otherwise: Yup.object().nullable(),
      }),
      off_day2: Yup.object().nullable().when('no_of_leave_per_week', {
        is: (val) => val === '2' || val === 2,
        then: Yup.object().required('Off Day 2 is required when 2 leaves are selected'),
        otherwise: Yup.object().nullable(),
      }),
      // category_id: Yup.number().required('Name is required!')
      });

      console.log("trgfgfg",editRowData);

      const initializeFormValues = () => {
        console.log("sdfsfsdd",mode);
        if (mode === 'edit') {
          console.log("hereutis",Days.find(day => day.day === editRowData?.off_day1));
          // setCompensationOff(editRowData.combo_off === 1);
          // setOffDay(editRowData.off_day1 !== null || editRowData.off_day2 !== null);
    
          const getTimeComponent = (time, component) => time ? time.split(':')[component] : '';
// console.log("bvcbg",getTimeComponent(editRowData.mark_halfday_leave, 0));
          return {
            id: editRowData?.id,
            leave_policy_name: editRowData?.leave_policy_name,
            category_id: [editRowData?.category_id] || [],
            no_of_leave_per_week: editRowData?.no_of_leave_per_week,
            combo_off: editRowData?.combo_off,
            off_day1: Days.find(day => day.day === editRowData?.off_day1),
            off_day2: Days.find(day => day.day === editRowData?.off_day2),
            w1: editRowData?.w1 === 1,
            w2: editRowData?.w2 === 1,
            w3: editRowData?.w3 === 1,
            w4: editRowData?.w4 === 1,
            w5: editRowData?.w5 === 1,
            enable_privilege_leave: editRowData?.enable_privilege_leave,
            pl_leave_type: editRowData?.pl_leave_type,
            privilegeLeave: editRowData?.privilegeLeave,
            initial_leave_credit: editRowData?.initial_leave_credit,
            privilegeLeaveCarryForward: editRowData?.privilegeLeaveCarryForward,
            privilegeLeaveMaxLimit: editRowData?.privilegeLeaveMaxLimit,
            max_pl_in_a_month: editRowData?.max_pl_in_a_month,
            enable_casual_leave: editRowData?.enable_casual_leave,
            cl_leave_type: editRowData?.cl_leave_type,
            casualLeave: editRowData?.casualLeave,
            initial_casual_leave_credit: editRowData?.initial_casual_leave_credit,
            casualLeaveCarryForward: editRowData?.casualLeaveCarryForward,
            casualLeaveMaxLimit: editRowData?.casualLeaveMaxLimit,
            max_cl_in_a_month: editRowData?.max_cl_in_a_month,
            enable_sick_leave: editRowData?.enable_sick_leave,
            sl_leave_type: editRowData?.sl_leave_type,
            sickLeave: editRowData?.sickLeave,
            initial_sick_leave_credit: editRowData?.initial_sick_leave_credit,
            sickLeaveCarryForward: editRowData?.sickLeaveCarryForward,
            sickLeaveMaxLimit: editRowData?.sickLeaveMaxLimit,
            max_sl_in_a_month: editRowData?.max_sl_in_a_month,
            restricted_holidays: editRowData?.restricted_holidays,
            avail_restricted_holidays: editRowData?.avail_restricted_holidays
        // permission_duration: getTimeComponent(editRowData.permission_duration, 0),
        // permission_duration_minutes: getTimeComponent(editRowData.permission_duration, 1),
        // permission_count: editRowData.permission_count,
          };
        } else {
          return {
            leave_policy_name: '',
            category_id: [],
            no_of_leave_per_week: null,
            combo_off: '',
            off_day1: null,
            off_day2: null,
            w1: false,
            w2: false,
            w3: false,
            w4: false,
            w5: false,
            enable_privilege_leave: 'false',
            pl_leave_type: 'earned',
            privilegeLeave: '',
            initial_leave_credit: '',
            privilegeLeaveCarryForward: 'false',
            privilegeLeaveMaxLimit: '',
            max_pl_in_a_month: '',
            enable_casual_leave: 'false',
            cl_leave_type: 'earned',
            casualLeave: '',
            initial_casual_leave_credit: '',
            casualLeaveCarryForward: 'false',
            casualLeaveMaxLimit: '',
            max_cl_in_a_month:'',
            enable_sick_leave:'false',
            sl_leave_type:'earned',
            sickLeave:'',
            initial_sick_leave_credit: '',
            sickLeaveCarryForward: 'false',
            sickLeaveMaxLimit: '',
            max_sl_in_a_month: '',
            restricted_holidays: 0,
            avail_restricted_holidays: 0
          };
        }
      };

      const [initialValues, setInitialValues] = useState(initializeFormValues());

      const resizeWindow = () => {
        const dynamicToolbarHeight_val = document.getElementsByClassName('MuiToolbar-root')[0]?.clientHeight || 70
        setToolbarHeight(dynamicToolbarHeight_val)
        setWindowHeight(window.innerHeight)
      }

  useEffect(() => {
    if (mode === 'edit' && editRowData) {
      setInitialValues(initializeFormValues());
      setCompensationOff(editRowData.combo_off === 1);
      const existingLeaveTypes = Array.isArray(editRowData?.leave_types) ? editRowData.leave_types : [];
      setLeaveTypesList(
        existingLeaveTypes.map((row) => ({
         ...row,
         leaveId: row.leaveId ?? row.leave_type_id ?? row.leave_id ?? row.id ?? "",
       }))
      );

    }
    if (pageType == 'detailpage') {
      const payload = {
        type: 'Get'
      }
      dispatch(leavePolicyAction(payload))
      if (leavePolicyList?.length > 0) {
        setInitialValues({
          ...initialValues,
          id:leavePolicyList[0]?.id,
          leave_policy_name: leavePolicyList[0]?.leave_policy_name,
          category_id: leavePolicyList[0]?.category_id || [],
          // category_id: leavePolicyList[0]?.category_name,
          no_of_leave_per_week: leavePolicyList[0]?.no_of_leave_per_week,
          combo_off: leavePolicyList[0]?.combo_off,
          off_day1: leavePolicyList[0]?.off_day1,
          off_day2: leavePolicyList[0]?.off_day2,
          w1: leavePolicyList[0]?.w1,
          w2: leavePolicyList[0]?.w2,
          w3: leavePolicyList[0]?.w3,
          w4: leavePolicyList[0]?.w4,
          w5: leavePolicyList[0]?.w5,
          enable_privilege_leave: leavePolicyList[0]?.enable_privilege_leave,
          pl_leave_type: leavePolicyList[0]?.pl_leave_type,
          privilegeLeave: leavePolicyList[0]?.privilegeLeave,
          privilegeLeaveMaxLimit: leavePolicyList[0]?.privilegeLeaveMaxLimit,
          privilegeLeaveCarryForward: leavePolicyList[0]?.privilegeLeaveCarryForward,
          max_pl_in_a_month: leavePolicyList[0]?.max_pl_in_a_month,
          enable_casual_leave : leavePolicyList[0]?.enable_casual_leave,
          cl_leave_type: leavePolicyList[0]?.cl_leave_type,
          casualLeave: leavePolicyList[0]?.casualLeave,
          casualLeaveCarryForward: leavePolicyList[0]?.casualLeaveCarryForward,
          casualLeaveMaxLimit: leavePolicyList[0]?.casualLeaveMaxLimit,
          max_cl_in_a_month: leavePolicyList[0]?.max_cl_in_a_month,
          enable_sick_leave: leavePolicyList[0]?.enable_sick_leave,
          sl_leave_type: leavePolicyList[0]?.sl_leave_type,
          sickLeave: leavePolicyList[0]?.sickLeave,
          sickLeaveMaxLimit: leavePolicyList[0]?.sickLeaveMaxLimit,
          sickLeaveCarryForward: leavePolicyList[0]?.sickLeaveCarryForward,
          max_sl_in_a_month: leavePolicyList[0]?.max_sl_in_a_month,
          restricted_holidays: leavePolicyList[0]?.restricted_holidays,
          avail_restricted_holidays: leavePolicyList[0]?.avail_restricted_holidays,
        })
      }
    }
    resizeWindow()
    window.addEventListener("resize", resizeWindow)
    return () => window.removeEventListener("resize", resizeWindow)
  }, []);
  useEffect(() => {
  // Only for "new leave policy"
  if (mode !== 'add' || hasInitializedDefaultLeaveTypes) return;
  if (!Array.isArray(leaveTypes) || leaveTypes.length === 0) return;

  const targetTypes = new Set(["casual leave", "sick leave"]);

  const defaultRows = leaveTypes
    .filter((type) => targetTypes.has((type?.leave_type || "").trim().toLowerCase()))
    .map((type) => ({
      leaveId: type.id,
      leave_code: type.leave_code || "",
      leave_type: type.leave_type || "",
      pay_treatment: "paid",
      unit: "days",
      minimum_notice_days: "",
      credit_type: "earned",
      earned_days_per_month:  25,
      initial_credit_days: 0,
      enable_carry_forward: false,
      carry_forward_limit: 0,
      maximum_leave_per_month: 0,
      documents_required: false,
    }));

  setLeaveTypesList(defaultRows);
  setHasInitializedDefaultLeaveTypes(true);
}, [mode, leaveTypes, hasInitializedDefaultLeaveTypes]);

  console.log("this111",initialValues);
  useEffect(() => {
  dispatch(getNewLeaveTypeAction({}));
}, [dispatch]);
    const formik = useFormik({  
        initialValues: initialValues,
        enableReinitialize: true,
        validationSchema: validationSchema,
    
        onSubmit: () => {
          let values = {...formik.values};
        
          console.log("submitting",values);
         
        
          const combo_off = compensationOff === false ? 0 : 1;
          const off_day1 = values.off_day1 === null ? null : (typeof values.off_day1 === 'string' ? values.off_day1 : values.off_day1?.day);
          const off_day2 = values.off_day2 === null ? null : (typeof values.off_day2 === 'string' ? values.off_day2 : values.off_day2?.day);
          const toApiBoolean = (val) => val === true || val === 'true' || val === 1;
          const toApiNumber = (val, fallback = 0) => {
            if (val === null || val === undefined || val === '') return fallback;
            const n = Number(val);
            return Number.isNaN(n) ? fallback : n;
          };
          const formatCapitalized = (val = '') => val ? `${val}`.charAt(0).toUpperCase() + `${val}`.slice(1).toLowerCase() : '';
          const sourceLeaveTypes = leaveTypesList.length > 0 ? leaveTypesList : [];
          const finalLeaveTypes = sourceLeaveTypes.map((item) => {
             const rowCreditType = `${item.credit_type || 'earned'}`.trim().toLowerCase();
             const resolvedLeaveId = item.leaveId ?? item.leave_id ?? item.id ?? '';
             return {
               leaveId: toApiNumber(resolvedLeaveId, ''),
               leave_code: item.leave_code || '',
               leave_type: item.leave_type || '',
               pay_treatment: formatCapitalized(item.pay_treatment),
               unit: formatCapitalized(item.unit),
               minimum_notice_days: toApiNumber(item.minimum_notice_days, 0),
               credit_type: rowCreditType,
               earned_days_per_month:rowCreditType === "earned" ? toApiNumber(item.earned_days_per_month, 25) : 0,
               initial_credit_days: rowCreditType === "initial_credit" ? toApiNumber(item.initial_credit_days ?? item.initial_credit_days, 0) : 0,
               enable_carry_forward: toApiBoolean(item.enable_carry_forward),
               carry_forward_limit: toApiNumber(item.carry_forward_limit, 0),
               maximum_leave_per_month: toApiNumber(item.maximum_leave_per_month, 0),
               // must_not_exceed_login_wise: toApiBoolean(item.must_not_exceed_login_wise),
               documents_required: toApiBoolean(item.documents_required),
               // include_sandwich_rule: toApiBoolean(item.include_sandwich_rule),

             }
          });
        
          const tempData = { 
            leave_policy_name: values.leave_policy_name,
            category_id: Array.isArray(values.category_id) ? values.category_id.map((id) => Number(id)) : [],
            no_of_leave_per_week: toApiNumber(values.no_of_leave_per_week, 0),
            combo_off,
            off_day1,
            off_day2,
            w1: values.w1 ? 1 : 0,
            w2: values.w2 ? 1 : 0,
            w3: values.w3 ? 1 : 0,
            w4: values.w4 ? 1 : 0,
            w5: values.w5 ? 1 : 0,
            restricted_holidays: toApiNumber(values.restricted_holidays, 0),
            avail_restricted_holidays: toApiNumber(values.avail_restricted_holidays, 0),
            leave_types: finalLeaveTypes,
          };
          console.log("Final leave policy payload:", tempData);
          console.log("Final leave policy payload JSON:", JSON.stringify(tempData, null, 2));
          if (props.pageType === 'detailpage') {
            if (leavePolicyList?.length) {
              const leavePolicyId = editRowData?.id || values.id;
              if (!leavePolicyId) return;
              dispatch(updateLeavePolicyAction(tempData, leavePolicyId, 'detailpage'));
              props.handleNext()
            } else {
              dispatch(leavePolicyAction(tempData));
              props.handleNext()
            }

          }
          if (mode === 'add' && props.pageType === undefined) {
            dispatch(leavePolicyAction(tempData));
          }
          if (mode === 'edit' && props.pageType === undefined) {
            dispatch(updateLeavePolicyAction(tempData, editRowData.id));
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
        setFieldTouched
      } = formik;

  const handleCheck = (e) => {
    let { name, checked } = e.target;
    console.log("coemdfjgf",checked);
    setFieldValue(name, checked ? 'true' : 'false');
    if (name === 'enable_privilege_leave' && !checked) {
      setFieldValue('privilegeLeaveCarryForward', 'false')
      setFieldValue('privilegeLeave', '');
      setFieldValue('initial_leave_credit', '');
    }
  }

  const blockInvalidNumberKeys = (event) => {
    if (event.target?.type !== 'number') return;
    if (['e', 'E', '+', '-'].includes(event.key)) {
      event.preventDefault();
    }
  };

  const enforceNonNegativeNumberValue = (event) => {
    const target = event?.target;
    if (!target || target.type !== 'number') return;

    const rawValue = target.value;
    if (rawValue === '' || rawValue === null || rawValue === undefined) return;

    let nextValue = Number(rawValue);
    if (Number.isNaN(nextValue)) return;
    nextValue = Math.max(0, nextValue);

    if (target.name === 'maxPerMonth' || target.name === 'earnedDays') {
      nextValue = Math.min(31, nextValue);
    }

    if (`${nextValue}` !== `${rawValue}`) {
      target.value = `${nextValue}`;
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
  useEffect(() => {
    let body = props.pageType === 'detailpage' ? 
    {
      type: 'LEAVE_POLICY',
      pageType : "detailpage"
    } : {
      type: 'LEAVE_POLICY'
    }
    setTimeout(() => {
      dispatch(listEmployeeCategoryAction(body, () => {
      }))
    },[500])
  }, [])
  const safeCategoryIds = Array.isArray(formik.values?.category_id)
  ? formik.values.category_id
  : [];
 const selectedLeaveTypeIds = new Set(
  (leaveTypesList || [])
    .map((row, idx) => {
      if (idx === editingLeaveTypeIndex) return null;
      return String(row.leaveId ?? row.leave_type_id ?? row.leave_id ?? row.id ?? "");
    })
    .filter(Boolean)
);

  

  const availableLeaveTypes = (leaveTypes || []).filter(
  (type) => !selectedLeaveTypeIds.has(String(type.id))
);
const selectedLeaveMeta = (leaveTypes || []).find(
  (item) => String(item.id) === String(formData.leaveType)
);
const currentEditingLeaveType = editingLeaveTypeIndex !== null ? leaveTypesList?.[editingLeaveTypeIndex] : null;
const leaveTypeOptions = [...availableLeaveTypes];
if (
  formData.leaveType &&
  !leaveTypeOptions.some((opt) => String(opt.id) === String(formData.leaveType)) &&
  currentEditingLeaveType
) {
  leaveTypeOptions.push({
    id: currentEditingLeaveType.leaveId ?? currentEditingLeaveType.leave_type_id ?? currentEditingLeaveType.leave_id ?? currentEditingLeaveType.id,
    leave_type: currentEditingLeaveType.leave_type,
    leave_code: currentEditingLeaveType.leave_code,
  });
}

const isCasualLeaveSelected =
  (selectedLeaveMeta?.leave_type || "").trim().toLowerCase() === "casual leave";
const isUnpaidSelected = formData.payTreatment === "unpaid";
const nonNegativeLeaveTypeFields = new Set([
  "minimumNotice",
  "earnedDays",
  "initialCredit",
  "carryLimit",
  "maxPerMonth",
]);


// console.log("thisnew",mode);
// console.log("erroortfvc",errors);
const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "number" && nonNegativeLeaveTypeFields.has(name)) {
      if (value === "") {
        setFormData((prev) => ({
           ...prev,
          [name]: value,
        }));
        return;
      }

      if (Number(value) < 0) {
        return;
      }
   }


    if (name === "leaveType") {
      const selectedLeave = (leaveTypes || []).find(
        (item) => String(item.id) === String(value)
      );

      const isCasual =
        (selectedLeave?.leave_type || "").trim().toLowerCase() === "casual leave";

      setFormData((prev) => ({
        ...prev,
        leaveType: value,
        leaveCode: selectedLeave?.leave_code || "",
        creditType: prev.creditType || "earned",
        earnedDays: prev.earnedDays || 25,
        carryForward: isCasual ? false : prev.carryForward,
        carryLimit: isCasual ? "" : prev.carryLimit,
      }));
      return;
    }

    if (name === "payTreatment" && value === "unpaid") {
      setFormData((prev) => ({
        ...prev,
        payTreatment: "unpaid",
        creditType: null,
        earnedDays: null,
        initialCredit: null,
        carryForward: false,
        carryLimit: null,
        maxPerMonth: null,
      }));
      return;
    }

    if (name === "payTreatment" && value === "paid") {
      setFormData((prev) => ({
        ...prev,
        payTreatment: "paid",
        creditType: prev.creditType || "earned",
        earnedDays: prev.earnedDays ?? 25,
      }));
      return;
    }

    if (["minimumNotice", "earnedDays", "initialCredit", "carryLimit", "maxPerMonth"].includes(name)) {
      if (value === "") {
        setFormData((prev) => ({ ...prev, [name]: "" }));
        return;
      }
      let numericValue = Number(value);
      if (Number.isNaN(numericValue)) return;
      numericValue = Math.max(0, numericValue);
      if (name === "maxPerMonth") {
        numericValue = Math.min(31, numericValue);
      }
      setFormData((prev) => ({
        ...prev,
        [name]: Number.isInteger(numericValue) ? numericValue : value
      }));
      return;
    }

    if (name === "carryForward") {
      setFormData((prev) => ({
        ...prev,
        carryForward: checked,
        carryLimit: checked ? prev.carryLimit : ""   // clear when disabled
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

const handleEditLeaveType = (item, index) => {
  setEditingLeaveTypeIndex(index);

  const normalizedCreditType = String(item.credit_type || "")
    .trim()
    .toLowerCase()
    .includes("initial_credit")
    ? "initial_credit"
    : "earned";

  setFormData({
    leaveType: item.leaveId ?? item.leave_type_id ?? item.leave_id ?? item.id ?? "",
    leaveCode: item.leave_code ?? "",
    payTreatment: item.pay_treatment ? `${item.pay_treatment}`.toLowerCase() : "unpaid",
    unit: item.unit ? `${item.unit}`.toLowerCase() : "days",
    minimumNotice: item.minimum_notice_days ?? "",
    creditType: normalizedCreditType,
    earnedDays: item.earned_days_per_month ?? "25",
    initialCredit: item.initial_credit_days ?? item.initital_credit_days ?? "",
    carryForward: item.enable_carry_forward === true || item.enable_carry_forward === 1,
    carryLimit: item.carry_forward_limit ?? "",
    maxPerMonth: item.maximum_leave_per_month ?? 0,
    documentsRequired: item.documents_required === true || item.documents_required === 1,
  });

  setOpen(true);
};

const handleDialogSubmit = () => {
  if (!formData.leaveType || !formData.leaveCode) {
    dispatch(OpenalertActions({ msg: "Leave Type and leave code is mandatory", severity: "warning" }));
    return;
  }
  if (!formData.payTreatment) {
    dispatch(OpenalertActions({ msg: "Pay Treatment is required", severity: "warning" }));
    return;
  }
  const isUnpaid = formData.payTreatment === "unpaid";
  const selectedCreditType = isUnpaid
  ? null
  : String(formData.creditType || "").trim().toLowerCase().includes("initial_credit")
  ? "initial_credit"
  : "earned";

  const toNonNegativeNumber = (val, fallback = 0) => {
    if (val === null || val === undefined || val === "") return fallback;
    const parsed = Number(val);
    if (Number.isNaN(parsed)) return fallback;
    return Math.max(0, parsed);
  };

  if (selectedCreditType === "earned" && (formData.earnedDays === null || formData.earnedDays === undefined || formData.earnedDays === "")) {
    dispatch(OpenalertActions({ msg: "Earned Days Per Month is required", severity: "warning" }));
    return;
  }
  if (selectedCreditType === "initial_credit" && (formData.initialCredit === null || formData.initialCredit === undefined || formData.initialCredit === "")) {
    dispatch(OpenalertActions({ msg: "Initial Credit Count is required", severity: "warning" }));
    return;
  }
  if (formData.carryForward === true && (formData.carryLimit === null || formData.carryLimit === undefined || formData.carryLimit === "" || formData.carryLimit <= 0)) {
    dispatch(OpenalertActions({ msg: "Carry Forward Count is required", severity: "warning" }));
    return;
  }
  if (Number(formData.maxPerMonth || 0) > 31) {
    dispatch(OpenalertActions({ msg: "Maximum Leave Per Month cannot be greater than 31", severity: "warning" }));
    return;
  }
  if (Number(formData.earnedDays || 0) > 31) {
    dispatch(OpenalertActions({ msg: "Earned Days Per Month cannot be greater than 31", severity: "warning" }));
    return;
  }
  if (leaveTypesList.some((row, idx) => String(row.leaveId ?? row.leave_type_id ?? row.leave_id ?? row.id) === String(formData.leaveType) && idx !== editingLeaveTypeIndex)) {
    dispatch(OpenalertActions({ msg: "Leave type already added", severity: "warning" }));
    return;
  }

  const newLeaveType = {
    leaveId: formData.leaveType,
    leave_code: formData.leaveCode,
    leave_type: leaveTypes.find((l) => String(l.id) === String(formData.leaveType))?.leave_type || leaveTypesList?.[editingLeaveTypeIndex]?.leave_type || "",
    pay_treatment: formData.payTreatment,
    unit: formData.unit,
    minimum_notice_days: toNonNegativeNumber(formData.minimumNotice, 0),
    credit_type: selectedCreditType,
    earned_days_per_month: isUnpaid ? null : selectedCreditType === "earned" ? toNonNegativeNumber(formData.earnedDays, 25) : 0,
    initial_credit_days: isUnpaid ? null : selectedCreditType === "initial_credit" ? toNonNegativeNumber(formData.initialCredit, 0) : 0,
    enable_carry_forward: isUnpaid ? null : formData.carryForward,
    carry_forward_limit: isUnpaid ? null : toNonNegativeNumber(formData.carryLimit, 0),
    maximum_leave_per_month: isUnpaid ? null : Math.min(31, toNonNegativeNumber(formData.maxPerMonth, 0)),

    documents_required: formData.documentsRequired,
  };

  if (editingLeaveTypeIndex !== null) {
    setLeaveTypesList((prev) => prev.map((row, idx) => (idx === editingLeaveTypeIndex ? newLeaveType : row)));
  } else {
    setLeaveTypesList((prev) => [...prev, newLeaveType]);
  }

  setOpen(false);
  setFormData(defaultLeaveTypeForm);
  setEditingLeaveTypeIndex(null);
};

const handleCreateCustomLeaveType = async () => {
  const leave_name = customTypeName.trim();
  const leave_code = customTypeCode.trim().toUpperCase();

  if (!leave_name || !leave_code) {
    dispatch(OpenalertActions({ msg: "Leave type and code are required", severity: "warning" }));
    return;
  }

  setIsCreatingCustomType(true);

  dispatch(createLeaveListAction(
    { leave_name, leave_code, isFullDay: 1 },
    (res) => {
      setIsCreatingCustomType(false);

      if (res?.data?.success === false) {
        dispatch(OpenalertActions({ msg: res?.data?.message || "Unable to create leave type", severity: "warning" }));
        return;
      }

      dispatch(OpenalertActions({ msg: res?.data?.message || "Leave type created successfully", severity: "success" }));
      setOpenCustomTypeDialog(false);
      setCustomTypeName("");
      setCustomTypeCode("");
    }
  ));
};
  return (
        <Card sx={{padding: '15px', height: props.pageType === 'detailpage' ? '720px' : '1000px', overflow: 'auto'}}>
          {/* <Grid> */}
          <Grid container
        // display='flex'
        // justifyContent={'center'}
        >
           <Grid
             display='flex'
             justifyContent={'start'}
             m={'15px'}
             size={{
               lg: 11,
               md: 11,
               sm: 11,
               xs: 6
             }}>
       {props.pageType !== 'detailpage' && <Typography variant='h4' align="left"  className='page-title'> { mode === 'edit' ? 'Edit Leave Policy' : 'New Leave Policy'} </Typography>}
        </Grid>
      {props.pageType !== 'detailpage' && <Grid
        display='flex'
        justifyContent={'flex-end'}
        marginTop={'-35px'}
        size={{
          lg: 12,
          md: 12,
          sm: 11,
          xs: 6
        }}>
        <CommonToolTip title = 'Close'>
        <IconButton
          aria-label='close'
          onClick={() => close(false)}
        >
          <CloseIcon />
        </IconButton>
        </CommonToolTip>
      </Grid>}

      
       </Grid>
            <FormikProvider value={formik} validationSchema={validationSchema}>
            <Form onSubmit={formik.handleSubmit} onKeyDown={blockInvalidNumberKeys} onInput={enforceNonNegativeNumberValue}>
         <Grid
          container
          spacing={3}
          display='flex'
          flexDirection='row'
          alignItems={'center'}
          paddingTop='10px'
        >
              
              <Grid
        size={{
          lg: 3,
          md: 3,
          sm: 3
        }}>
              <Typography variant='h6'> {'Leave Policy Name'} </Typography>
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
                label='Leave Policy Name'
                placeholder='Leave Policy Name'
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                name='leave_policy_name'
                type='text'
                inputProps={{ min: 1, max: 12 }}
                variant='filled'
                required={true}
                value={formik.values.leave_policy_name}
                error={
                  formik.touched.leave_policy_name && Boolean(formik.errors.leave_policy_name)
                }
                helperText={
                  formik.touched.leave_policy_name && formik.errors.leave_policy_name
                }
              ></TextField>
            </Grid>

            <Grid item lg={3} md={3} sm={3} align="center">
              <Typography variant='h6'> {'Select Employee Category'} </Typography>
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
                  label='Selected Category'
                  name='category_id'
                  variant='filled'
                  value={editRowData?.category_name}
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
                                   value={Array.isArray(formik.values?.category_id)? formik.values.category_id.map((id) =>employeeCategoryList.find((cat) => Number(cat.id) === Number(id))).filter(Boolean): []}
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
                                      const displayValue = safeCategoryIds.length ? safeCategoryIds.map((id) =>
                                      employeeCategoryList.find((c) => c.id === id)?.category_name,).join(', ') : '';
                
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
        align="start"
        size={{
          lg: 3,
          md: 3,
          sm: 3
        }}>
              <Typography variant='h6'> {'No of Leave Per Week'} </Typography>
            </Grid>
            <Grid
        Item
        paddingTop={3}
        paddingLeft={3}
        size={{
          lg: 3,
          md: 5,
          sm: 12,
          xs: 12
        }}>
              <Autocomplete
                disabled={false}
                options={[1, 2]}
                name='no_of_leave_per_week'
                fullWidth={true}
                required={true}
                onChange={(event, value) => {
                  formik.setFieldValue("no_of_leave_per_week", value);
                  formik.setFieldTouched("no_of_leave_per_week", true, false);

                  setTimeout(() => {
                    formik.validateField("no_of_leave_per_week");
                  }, 0);

                  if (value !== 2) {
                    formik.setFieldValue("off_day2", null);
                  }
                }}

                value={formik.values.no_of_leave_per_week}
                getOptionLabel={(option) => option.toString()}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Select'
                    required
                    variant='filled'
                    onBlur={() => formik.setFieldTouched("no_of_leave_per_week", true)}
                    error={formik.touched.no_of_leave_per_week && Boolean(formik.errors.no_of_leave_per_week)}
                    helperText={formik.touched.no_of_leave_per_week && formik.errors.no_of_leave_per_week}
                  />
                )}
              />
            </Grid>

            <Grid
        align='center'
        size={{
          lg: 4,
          md: 3,
          sm: 1.5
        }}>
            <FormControl component='fieldset'>
              <FormControlLabel
                name='combo_off'
                control={
                  <Switch checked={compensationOff} onChange={(event) => setCompensationOff(event.target.checked)} />
                }
                label= {compensationOff ? 'Compensation Off Enabled' : 'Compensation Off Disabled'}
                labelPlacement='end'
                // disabled={offDay}
              />
            </FormControl>
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
        sm: 3
      }}>
            <Typography variant='h6'> Off Day 1 </Typography>
          </Grid>
          <Grid
      size={{
        lg: 9,
        md: 9,
        sm: 9,
        xs: 12
      }}>  <Autocomplete
    // disabled={compensationOff || formik.values.no_of_leave_per_week === null}
    disabled={ formik.values.no_of_leave_per_week === null}
    options={Days.filter((x) => x.day !== formik.values.off_day2?.day)}
    name="off_day1"
    required={true}
    getOptionLabel={(option) => (option.day ? option.day : option)}
    fullWidth
    onChange={(event, value) => setFieldValue("off_day1", value)}
    value={formik.values.off_day1}
    isOptionEqualToValue={(option, value) => option.day === value.day}
    renderInput={(params) => (
      <TextField
        {...params}
        label="Select"
        variant="filled"
         required={true}
        // error={errors.off_day1}
        // helperText={
        //   errors.off_day1 === null ? '' : errors.off_day1
        // }
      />
    )}
  />
</Grid>

<Grid
// align='center'
size={{
  lg: 3,
  md: 3,
  sm: 3
}}>
            <Typography variant='h6'>
              {' '}
              Off Day 2{' '}
            </Typography>
          </Grid>
          <Grid
      size={{
        lg: 9,
        md: 9,
        sm: 9,
        xs: 12
      }}>
            <Autocomplete
              // disabled={ compensationOff ||
              //   formik.values.no_of_leave_per_week !== 2 ||
              //   formik.values.no_of_leave_per_week === null}

                disabled={ 
                  formik.values.no_of_leave_per_week !== 2 ||
                  formik.values.no_of_leave_per_week === null}
              options={Days.filter((x) => x.day !== formik.values.off_day1?.day)}
              name='off_day2'
              getOptionLabel={(option) => (option.day ? option.day : option)}
              fullWidth={true}
              onChange = {(event, value) => setFieldValue('off_day2', value)}
              value={formik.values?.off_day2}
              isOptionEqualToValue={(option, value) => option.day === value.day}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Select'
                  variant='filled'
                  required={true}
                  // error={formErrors.off_day2}
                  // helperText={formErrors.off_day2 === '' ? '' : 'Off Day2 is Required!'}
                />
              )}
            />
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
      paddingTop={3}
      size={{
        lg: 1.8,
        md: 1.2,
        sm: 3
      }}>
            <Typography variant='h6' sx={{pl: '10px'}}>
              {' '}
              Off Day 2 On Weeks{' '}
            </Typography>
          </Grid>

          <Grid item >
            <FormControl component='fieldset'>
              <FormControlLabel
                // disabled={(formik.values.no_of_leave_per_week === 1 || compensationOff || formik.values.no_of_leave_per_week === null) && true}
                disabled={(formik.values.no_of_leave_per_week === 1  || formik.values.no_of_leave_per_week === null) && true}
                name='w1'
                control={
                  <Checkbox checked={formik.values.w1} onChange = {formik.handleChange} />
                }
                label='W1'
                labelPlacement='end'
              />
            </FormControl>
          </Grid>

          <Grid item >
            <FormControl component='fieldset'>
              <FormControlLabel
                // disabled={(formik.values.no_of_leave_per_week === 1 || compensationOff || formik.values.no_of_leave_per_week === null) && true}
                disabled={(formik.values.no_of_leave_per_week === 1  || formik.values.no_of_leave_per_week === null) && true}
                name='w2'
                control={
                  <Checkbox checked={formik.values.w2} onChange = {formik.handleChange} />
                }
                label='W2'
                labelPlacement='end'
              />
            </FormControl>
          </Grid>

          <Grid item >
            <FormControl component='fieldset'>
              <FormControlLabel
                disabled={(formik.values.no_of_leave_per_week === 1  || formik.values.no_of_leave_per_week === null) && true}
                // disabled={(formik.values.no_of_leave_per_week === 1 || compensationOff || formik.values.no_of_leave_per_week === null) && true}
                name='w3'
                control={
                  <Checkbox checked={formik.values.w3} onChange = {formik.handleChange} />
                }
                label='W3'
                labelPlacement='end'
              />
            </FormControl>
          </Grid>

          <Grid item >
            <FormControl component='fieldset'>
              <FormControlLabel
                disabled={(formik.values.no_of_leave_per_week === 1  || formik.values.no_of_leave_per_week === null) && true}
                // disabled={(formik.values.no_of_leave_per_week === 1 || compensationOff || formik.values.no_of_leave_per_week === null) && true}
                name='w4'
                control={
                  <Checkbox checked={formik.values.w4} onChange = {formik.handleChange} />
                }
                label='W4'
                labelPlacement='end'
              />
            </FormControl>
          </Grid>

          <Grid item >
            <FormControl component='fieldset'>
              <FormControlLabel
                disabled={(formik.values.no_of_leave_per_week === 1  || formik.values.no_of_leave_per_week === null) && true}
                // disabled={(formik.values.no_of_leave_per_week === 1 || compensationOff || formik.values.no_of_leave_per_week === null) && true}
                name='w5'
                control={
                  <Checkbox checked={formik.values.w5} onChange = {formik.handleChange} />
                }
                label='W5'
                labelPlacement='end'
              />
            </FormControl>
          </Grid> 

        </Grid> 
 
        <Grid
                            container
                            style={{ paddingTop: '10px' }}
                            spacing={7}
                            direction='row'
                        >
                <Grid item lg={12} md={12} sm={12} xs={6} paddingTop="20px">
                    <Box
                        bgcolor="lightGrey"
                        p={2}
                        borderRadius={1}
                    >
                        <Typography
                            align="center"
                            variant="h5"
                            // paddingTop="3px"
                        >
                            Restrict Holidays
                        </Typography>
                        </Box>
                </Grid>
                
                <Grid item lg={2} md={2} sm={2}>
                    <Typography variant="h6">Total Count per Year</Typography>
                  </Grid>
                  <Grid item lg={3} md={3} sm={12} xs={12} paddingTop={3} paddingLeft={3}>
                    <TextField
                      fullWidth
                      onWheel={(e) => e.target.blur()} // Prevent scrolling to change the value
                      label="Total Count"
                      placeholder="Enter Number of Days"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) { 
                          const parsedValue = value ? parseInt(value, 10) : "";
                        formik.setFieldValue("restricted_holidays", parsedValue);;
                          if (
                            formik.values.avail_restricted_holidays &&
                            formik.values.avail_restricted_holidays > parsedValue
                          ) {
                            formik.setFieldValue("avail_restricted_holidays", parsedValue);
                          }
                        }
                      }}
                      name="restricted_holidays"
                      type="number"
                      variant="filled"
                      value={formik.values.restricted_holidays } 
                      // error={formik.touched.restricted_holidays && !formik.values.restricted_holidays}
                      // helperText={
                      //   formik.touched.restricted_holidays && !formik.values.restricted_holidays
                      //     ? "Total Count is required"
                      //     : ""
                      // }
                      onBlur={formik.handleBlur} // Mark the field as touched
                    />
                  </Grid>
                  <Grid item lg={1} md={1} sm={1}>
                    
                  </Grid>
                  
                  <Grid item lg={2} md={2} sm={2}>
                    <Typography variant="h6">Avail Count per Year</Typography>
                    <Typography variant="caption" color="textSecondary">
                    (Must not exceed the Total Count)
                    </Typography>
                  </Grid>
                  <Grid item lg={3} md={3} sm={12} xs={12} paddingTop={3} paddingLeft={5}>
                    <TextField
                      fullWidth
                      onWheel={(e) => e.target.blur()} // Prevent scrolling to change the value
                      label="Avail Count"
                      placeholder="Avail Count"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) { // Allow only numeric values
                          const parsedValue = value ? parseInt(value, 10) : "";
                          if (
                            parsedValue === "" || // Allow empty values
                            (formik.values.restricted_holidays && parsedValue <= formik.values.restricted_holidays)
                          ) {
                            formik.setFieldValue("avail_restricted_holidays", parsedValue);
                          }
                        }
                      }}
                      name="avail_restricted_holidays"
                      type="number"
                      variant="filled"
                      value={formik.values.avail_restricted_holidays } 
                    //   error={
                    //   formik.touched.avail_restricted_holidays &&
                    //   (!formik.values.avail_restricted_holidays ||
                    //     (formik.values.restricted_holidays &&
                    //       formik.values.avail_restricted_holidays > formik.values.restricted_holidays))
                    // }
                    // helperText={
                    //   formik.touched.avail_restricted_holidays &&
                    //   (
                    //     // !formik.values.avail_restricted_holidays
                    //     // ? "Avail Count is required"
                    //     // :
                    //      formik.values.avail_restricted_holidays >
                    //       formik.values.restricted_holidays
                    //     ? "Avail Count cannot exceed Total Count"
                    //     : "")
                    // }
                      onBlur={formik.handleBlur} // Mark the field as touched
                    />
                  </Grid>
                    </Grid>

<Grid item lg={12} md={12} sm={12} xs={6} paddingTop="20px">
    <Box
        bgcolor="lightGrey"
        p={2}
        borderRadius={1}
    >
        <Typography
            align="center"
            variant="h5"
            // paddingTop="3px"
        >
            Leave Types *
            <IconButton color='primary' onClick={() => { setEditingLeaveTypeIndex(null); setFormData(defaultLeaveTypeForm); setOpen(true); }}>
            <AddIcon/>
           </IconButton>
        </Typography>
        </Box>
</Grid>
{leaveTypesList.length > 0 && (
  <TableContainer component={Paper} sx={{ mt: 2 }}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Code</TableCell>
          <TableCell>Type</TableCell>
          <TableCell>Pay</TableCell>
          <TableCell>Unit</TableCell>
          <TableCell>Notice</TableCell>
          <TableCell>Credit Type</TableCell>
          <TableCell>Earned / Initial</TableCell>
          <TableCell>Carry Forward</TableCell>
          <TableCell>Carry Limit</TableCell>
          <TableCell>Max / Month</TableCell>
          {/* <TableCell>Login Wise</TableCell> */}
          <TableCell>Docs</TableCell>
          {/* <TableCell>Sandwich</TableCell> */}
          <TableCell>Action</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {leaveTypesList.map((item, index) => (
          <TableRow key={index}>
            <TableCell>{item.leave_code}</TableCell>
            <TableCell>{item.leave_type}</TableCell>
            <TableCell>{item.pay_treatment}</TableCell>
            <TableCell>{item.unit ?? 'Days'}</TableCell>
            <TableCell>{item.minimum_notice_days ? parseInt(item.minimum_notice_days) : 0}</TableCell>
            <TableCell>{item.credit_type == 'earned' ? "Earned" : "Initial Credit"}</TableCell>
            <TableCell>
              {item.credit_type === "earned"
                ? parseInt(item.earned_days_per_month)
                : parseInt(item.initial_credit_days)}
            </TableCell>
            <TableCell>{item.enable_carry_forward ? "Yes" : "No"}</TableCell>
            <TableCell>{item.carry_forward_limit ? parseInt(item.carry_forward_limit) : 0}</TableCell>
            <TableCell>{item.maximum_leave_per_month ? parseInt(item.maximum_leave_per_month) : 0}</TableCell>
            {/* <TableCell>{item.must_not_exceed_login_wise ? "Yes" : "No"}</TableCell> */}
            <TableCell>{item.documents_required ? "Yes" : "No"}</TableCell>
            {/* <TableCell>{item.include_sandwich_rule ? "Yes" : "No"}</TableCell> */}

            {/* ACTION BUTTONS */}
            <TableCell>
              <IconButton color="primary" onClick={() => handleEditLeaveType(item, index)}>
                <EditIcon />
              </IconButton>
              <IconButton
                color="error"
                onClick={() => {
                  const updated = leaveTypesList.filter((_, i) => i !== index);
                  setLeaveTypesList(updated);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)}


<Dialog open ={isopen} onClose={() => { setOpen(false); setEditingLeaveTypeIndex(null); }} maxWidth="md" fullWidth>
  <DialogContent>
    {/* <Grid container spacing={2}>
        <Grid lg={4} md={4} sm={8} xs={12} item={true}>
                                <FormControl
                                    component='fieldset'
                                    fullWidth={true}
                                >
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                name='enable_privilege_leave'
                                                checked={values.enable_privilege_leave === 'true' ? true : false}
                                                size='medium'
                                                color='primary'
                                                onChange={handleCheck}
                                            />
                                        }
                                        label='Enable Privilege Leave'
                                        name='enable_privilege_leave'
                                    />
                                </FormControl>
                            </Grid>

                            <Grid lg={4} md={4} sm={6} xs={12} item>
                                <TextField select label="Privilege Leave Type" variant="filled"
                                    onChange={formik.handleChange}
                                    value={values['pl_leave_type']}
                                    onBlur={formik.handleChange}
                                    name={'pl_leave_type'}
                                    fullWidth
                                    required={values.enable_privilege_leave === 'true'}
                                    regex=''
                                    error={
                                        values.enable_privilege_leave === 'true' &&
                                        !values['pl_leave_type']
                                    }
                                    helperText={
                                        values.enable_privilege_leave === 'true' &&
                                            !values['pl_leave_type']
                                            ? 'Privilege Leave Type is required'
                                            : ''
                                    }
                                    disabled={values.enable_privilege_leave === 'false'}
                                >
                                    <MenuItem value={'earned'}>Earned</MenuItem>
                                    <MenuItem value={'initial_credit'}>Initial Credit</MenuItem>
                                </TextField>
                                

                            </Grid>
                            {values.pl_leave_type === 'earned' && (
                                <Grid lg={4} md={4} sm={6} xs={12} item={true}>
                                    <TextField
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleChange}
                                        fullWidth={true}
                                        onWheel={(e) => e.target.blur()}
                                        label='Privilege Leaves days'
                                        name='privilegeLeave'
                                        value={values['privilegeLeave']}
                                        color='primary'
                                        type='number'
                                        regex=''
                                        variant='filled'
                                        disabled={values.enable_privilege_leave === 'false'}
                                        required={values.pl_leave_type === 'initial_credit'}
                                        // error={formErrors.privilegeLeave !== ''}
                                        // helperText={
                                        //     formErrors.privilegeLeave === '' ? '' : 'Privilege Leaves is Required!'
                                        // }
                                    />
                                </Grid>
                            )}
                            {values.pl_leave_type === 'initial_credit' && (
                                <Grid lg={4} md={4} sm={6} xs={12} item={true}>
                                    <TextField
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleChange}
                                        fullWidth={true}
                                        onWheel={(e) => e.target.blur()}
                                        label='Initial leave credit'
                                        name='initial_leave_credit'
                                        value={values['initial_leave_credit']}
                                        color='primary'
                                        type='number'
                                        regex=''
                                        variant='filled'
                                        required={values.pl_leave_type === 'earned'}
                                        disabled={values.enable_privilege_leave === 'false'}
                                        // error={formErrors.initial_leave_credit !== ''}
                                        // helperText={
                                        //     formErrors.initial_leave_credit === '' ? '' : 'Initial Leave Credit is Required!'
                                        // }
                                    />
                                </Grid>
                            )}

                            <Grid lg={4} md={4} sm={6} xs={12} item={true}>
                                <FormControl
                                    component='fieldset'
                                    fullWidth={true}
                                    disabled={values.enable_casual_leave === 'false'}
                                >
                                    <FormControlLabel

                                        control={
                                            <Switch
                                                name='privilegeLeaveCarryForward'
                                                checked={values.privilegeLeaveCarryForward === 'true' ? true : false}
                                                size='medium'
                                                color='primary'
                                                onChange={handleCheck}
                                            />
                                        }
                                        label='Enable Carry Forward PL'
                                        name='privilegeLeaveCarryForward'
                                    />
                                </FormControl>
                            </Grid>
                            <Grid lg={4} md={4} sm={6} xs={12} item={true}>
                                <TextField
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleChange}
                                    fullWidth={true}
                                    onWheel={(e) => e.target.blur()}
                                    label='PL Carry Forward Limit'
                                    name='max_pl_in_a_month'
                                    value={values['max_pl_in_a_month']}
                                    color='primary'
                                    type='number'
                                    regex=''
                                    disabled={values.privilegeLeaveCarryForward !== 'true'}
                                    variant='filled'
                                    required={values.gst_registration === true && true}
                                    // error={formErrors.privilegeLeaveMaxLimit === '' ? false : true}
                                    // helperText={
                                    //     formErrors.privilegeLeaveMaxLimit === null ? '' : formErrors.privilegeLeaveMaxLimit
                                    // }
                                />
                            </Grid>

                            <Grid lg={4} md={4} sm={6} xs={12} item={true}>
                                <TextField
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleChange}
                                    fullWidth={true}
                                    //onWheel={(e) => e.target.blur()}
                                    label='Max PL in a Month'
                                    name='privilegeLeaveMaxLimit'
                                    value={values['privilegeLeaveMaxLimit']}
                                    color='primary'
                                    type='number'
                                    regex=''
                                    disabled={values.enable_privilege_leave === 'false'}
                                    variant='filled'
                                    helperText="Leave blank for no restriction"
                                />

                            </Grid>
    </Grid> */}
    </DialogContent>
    <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={6}>
              <TextField
              select
              label="Leave Type"
              name="leaveType"
              required
              fullWidth
              value={formData.leaveType}
              onChange={handleChange}
              helperText="Display name shown to users."
               InputProps={{
                endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                   size="small"
                   color="primary"
                   sx={{ mr: 2}}
                   onClick={() => setOpenCustomTypeDialog(true)}
                  >
          <AddIcon fontSize="small" />
        </IconButton>
      </InputAdornment>
    ),
  }}
              >
                {leaveTypeOptions?.map((type) => 
                (
                  <MenuItem key={type.id} value={type.id}>
                    {type.leave_type || type.leave_type_name}
                  </MenuItem>
                 ))}
              </TextField>

            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Leave Code"
                name="leaveCode"
                fullWidth
                required
                inputProps={{ readOnly:true }}
                value={formData.leaveCode}
                onChange={handleChange}
                helperText="Short unique key used everywhere. Example: PTO, SL."
              />
            </Grid>

            <Grid item xs={6}>
        <TextField
          select
          label="Pay Treatment"
          name="payTreatment"
          required
          fullWidth
          value={formData.payTreatment}
          onChange={handleChange}
          helperText ="Payroll impact: UNPAID reduces salary via proration."
        >
          <MenuItem value="paid">Paid</MenuItem>
          <MenuItem value="unpaid">Unpaid</MenuItem>
        </TextField>
      </Grid>

      <Grid item xs={6}>
        <TextField
          label="Unit"
          name="unit"
          required
          fullWidth
          value="Days"
          inputProps={{readOnly: true}}
        >
        </TextField>
      </Grid>

      <Grid item xs={6}>
        <TextField
          label="Minimum Notice (Days)"
          name="minimumNotice"
          type="number"
          fullWidth
          inputProps={{ min: 0 }}
          value={formData.minimumNotice}
          onChange={handleChange}
        />
      </Grid>
          {!isUnpaidSelected && (
            <>

            <Grid item xs={6}>
              <Select
                name="creditType"
                value={formData.creditType}
                onChange={handleChange}
                fullWidth
                displayEmpty
              >
                {/* <MenuItem value="">Select Credit Type</MenuItem> */}
                <MenuItem value="earned">Earned</MenuItem>
                <MenuItem value="initial_credit">Initial Credit</MenuItem>
              </Select>
            </Grid>

            {formData.creditType === "earned" && (
              <Grid item xs={6}>
                <TextField
                  label="Earned Days Per Month"
                  name="earnedDays"
                  required
                  type="number"
                  inputProps={{ min: 0 }}
                  fullWidth
                  value={formData.earnedDays}
                  onChange={handleChange}
                />
              </Grid>
            )}

            {formData.creditType === "initial_credit" && (
              <Grid item xs={6}>
                <TextField
                  label="Initial Credit Count"
                  name="initialCredit"
                  inputProps={{ min: 0 }}
                  required
                  type="number"
                  fullWidth
                  value={formData.initialCredit}
                  onChange={handleChange}
                />
              </Grid>
            )}

            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="carryForward"
                    checked={formData.carryForward}
                    onChange={handleChange}
                    disabled={isCasualLeaveSelected}
                  />
                }
                label="Enable Carry Forward"
              />
            </Grid>

            {formData.carryForward && (
              <Grid item xs={6}>
                <TextField
                  label="Carry Forward Limit"
                  name="carryLimit"
                  required
                  type="number"
                  inputProps={{ min: 1 }}
                  fullWidth
                  value={formData.carryLimit}
                  onChange={handleChange}
                />
              </Grid>
            )}

            <Grid item xs={6}>
              <TextField
                label="Maximum Leave Per Month"
                name="maxPerMonth"
                type="number"
                inputProps={{ min: 0 }}
                fullWidth
                value={formData.maxPerMonth}
                onChange={handleChange}
              />
            </Grid>
            </>
          )}

            {/* <Grid item xs={6}>
        <FormControlLabel
          control={
            <Checkbox
              name="loginWiseLimit"
              checked={formData.loginWiseLimit}
              onChange={handleChange}
            />
          }
          label="Must Not Exceed Login-Wise"
        />
      </Grid> */}

      {/* Documents Required */}
      <Grid item xs={6}>
        <FormControlLabel
          control={
            <Checkbox
              name="documentsRequired"
              checked={formData.documentsRequired}
              onChange={handleChange}
            />
          }
          label="Documents Required"
        />
      </Grid>

      {/* Include Sandwich Rule */}
      {/* <Grid item xs={6}>
        <FormControlLabel
          control={
            <Checkbox
              name="sandwichRule"
              checked={formData.sandwichRule}
              onChange={handleChange}
            />
          }
          label="Include Sandwich Rule"
        />
      </Grid> */}

          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => { setOpen(false); setEditingLeaveTypeIndex(null); setFormData(defaultLeaveTypeForm); }}>Cancel</Button>
          <Button variant="contained" onClick={handleDialogSubmit}>
            Save
          </Button>
        </DialogActions>
</Dialog>
<Dialog open={openCustomTypeDialog} onClose={() => setOpenCustomTypeDialog(false)} maxWidth="xs" fullWidth>
  <DialogContent>
    <Grid container spacing={2} mt={0.5}>
      <Grid item xs={12}>
        <TextField
          label="Leave Type Name"
          fullWidth
          value={customTypeName}
          onChange={(e) => setCustomTypeName(e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Leave Code"
          fullWidth
          value={customTypeCode}
          onChange={(e) => setCustomTypeCode(e.target.value.toUpperCase())}
        />
      </Grid>
    </Grid>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenCustomTypeDialog(false)} disabled={isCreatingCustomType}>Cancel</Button>
    <Button variant="contained" onClick={handleCreateCustomLeaveType} disabled={isCreatingCustomType}>Save</Button>
  </DialogActions>
</Dialog>

                           

                            {/* <Grid lg={3} md={4} sm={6} xs={12} item={true}>
                                <FormControl>
                                    <FormLabel id='demo-radio-buttons-group-label'>
                                    Privilege Leave Type
                                    </FormLabel>

                                    <RadioGroup
                                    row
                                    value={values.pl_leave_type}
                                    name='pl_leave_type'
                                    onChange={formik.handleChange}
                                    >
                                    <FormControlLabel
                                        value='earned'
                                        label='Earned'
                                        control={<Radio />}
                                    />
                                    <FormControlLabel
                                        value='initial_credit'
                                        label='Initial Credit'
                                        control={<Radio />}
                                    />
                                    </RadioGroup>
                                </FormControl>


                            </Grid> */}
                            

            {/* --------------------------------------------------------------- CASUAL LEAVE ------------------------------------------- */}

                              {/* <Grid lg={4} md={4} sm={8} xs={12} item={true}>
                                <FormControl
                                    component='fieldset'
                                    fullWidth={true}
                                >
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                name='enable_casual_leave'
                                                checked={values.enable_casual_leave === 'true' ? true : false}
                                                size='medium'
                                                color='primary'
                                                onChange={handleCheck}
                                            />
                                        }
                                        label='Enable Casual Leave'
                                        name='enable_casual_leave'
                                    />
                                </FormControl>
                            </Grid>

                            <Grid lg={4} md={4} sm={6} xs={12} item>
                                <TextField select label="Casual Leave Type" variant="filled"
                                    onChange={formik.handleChange}
                                    value={values['cl_leave_type']}
                                    onBlur={formik.handleChange}
                                    name={'cl_leave_type'}
                                    fullWidth
                                    required={values.enable_casual_leave === 'true'}
                                    regex=''
                                    error={
                                        values.enable_casual_leave === 'true' &&
                                        !values['cl_leave_type']
                                    }
                                    helperText={
                                        values.enable_casual_leave === 'true' &&
                                            !values['cl_leave_type']
                                            ? 'Privilege Leave Type is required'
                                            : ''
                                    }
                                    disabled={values.enable_casual_leave === 'false'}
                                >
                                    <MenuItem value={'earned'}>Earned</MenuItem>
                                    <MenuItem value={'initial_credit'}>Initial Credit</MenuItem>
                                </TextField>
                                

                            </Grid>

                              {values.cl_leave_type === 'earned' && (
                                <Grid lg={4} md={4} sm={6} xs={12} item={true}>
                                    <TextField
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleChange}
                                        fullWidth={true}
                                        onWheel={(e) => e.target.blur()}
                                        label='Casual Leaves days'
                                        name='casualLeave'
                                        value={values['casualLeave']}
                                        color='primary'
                                        type='number'
                                        regex=''
                                        variant='filled'
                                        disabled={values.enable_casual_leave === 'false'}
                                        required={values.cl_leave_type === 'initial_credit'}
                                    />
                                </Grid>
                            )}
                            {values.cl_leave_type === 'initial_credit' && (
                                <Grid lg={4} md={4} sm={6} xs={12} item={true}>
                                    <TextField
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleChange}
                                        fullWidth={true}
                                        onWheel={(e) => e.target.blur()}
                                        label='Initial casual leave credit'
                                        name='initial_casual_leave_credit'
                                        value={values['initial_casual_leave_credit']}
                                        color='primary'
                                        type='number'
                                        regex=''
                                        variant='filled'
                                        required={values.cl_leave_type === 'earned'}
                                        disabled={values.enable_casual_leave === 'false'}
                                    />
                                </Grid>
                            )}

                            <Grid lg={4} md={4} sm={6} xs={12} item={true}>
                                <FormControl
                                    component='fieldset'
                                    fullWidth={true}
                                    disabled={values.enable_casual_leave === 'false'}
                                >
                                    <FormControlLabel

                                        control={
                                            <Switch
                                                name='casualLeaveCarryForward'
                                                checked={values.casualLeaveCarryForward === 'true' ? true : false}
                                                size='medium'
                                                color='primary'
                                                onChange={handleCheck}
                                            />
                                        }
                                        label='Enable Carry Forward CL'
                                        name='casualLeaveCarryForward'
                                    />
                                </FormControl>
                            </Grid>
                            <Grid lg={4} md={4} sm={6} xs={12} item={true}>
                                <TextField
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleChange}
                                    fullWidth={true}
                                    onWheel={(e) => e.target.blur()}
                                    label='CL Carry Forward Limit'
                                    name='max_cl_in_a_month'
                                    value={values['max_cl_in_a_month']}
                                    color='primary'
                                    type='number'
                                    regex=''
                                    disabled={values.casualLeaveCarryForward !== 'true'}
                                    variant='filled'
                                    required={values.gst_registration === true && true}
                                />
                            </Grid>

                            <Grid lg={4} md={4} sm={6} xs={12} item={true}>
                                <TextField
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleChange}
                                    fullWidth={true}
                                    label='Max CL in a Month'
                                    name='casualLeaveMaxLimit'
                                    value={values['casualLeaveMaxLimit']}
                                    color='primary'
                                    type='number'
                                    regex=''
                                    disabled={values.enable_casual_leave === 'false'}
                                    variant='filled'
                                    helperText="Leave blank for no restriction"
                                />

                            </Grid> */}


                            {/* ------------------------------------------ SICK LEAVE ------------------------------------------- */}

                              {/* <Grid lg={4} md={4} sm={8} xs={12} item={true}>
                                <FormControl
                                    component='fieldset'
                                    fullWidth={true}
                                >
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                name='enable_sick_leave'
                                                checked={values.enable_sick_leave === 'true' ? true : false}
                                                size='medium'
                                                color='primary'
                                                onChange={handleCheck}
                                            />
                                        }
                                        label='Enable Sick Leave'
                                        name='enable_sick_leave'
                                    />
                                </FormControl>
                            </Grid>

                            <Grid lg={4} md={4} sm={6} xs={12} item>
                                <TextField select label="Sick Leave Type" variant="filled"
                                    onChange={formik.handleChange}
                                    value={values['sl_leave_type']}
                                    onBlur={formik.handleChange}
                                    name={'sl_leave_type'}
                                    fullWidth
                                    required={values.enable_sick_leave === 'true'}
                                    regex=''
                                    error={
                                        values.enable_sick_leave === 'true' &&
                                        !values['sl_leave_type']
                                    }
                                    helperText={
                                        values.enable_sick_leave === 'true' &&
                                            !values['sl_leave_type']
                                            ? 'Privilege Leave Type is required'
                                            : ''
                                    }
                                    disabled={values.enable_sick_leave === 'false'}
                                >
                                    <MenuItem value={'earned'}>Earned</MenuItem>
                                    <MenuItem value={'initial_credit'}>Initial Credit</MenuItem>
                                </TextField>
                                

                            </Grid>

                              {values.sl_leave_type === 'earned' && (
                                <Grid lg={4} md={4} sm={6} xs={12} item={true}>
                                    <TextField
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleChange}
                                        fullWidth={true}
                                        onWheel={(e) => e.target.blur()}
                                        label='Sick Leaves days'
                                        name='sickLeave'
                                        value={values['sickLeave']}
                                        color='primary'
                                        type='number'
                                        regex=''
                                        variant='filled'
                                        disabled={values.enable_sick_leave === 'false'}
                                        required={values.sl_leave_type === 'initial_credit'}
                                    />
                                </Grid>
                            )}
                            {values.sl_leave_type === 'initial_credit' && (
                                <Grid lg={4} md={4} sm={6} xs={12} item={true}>
                                    <TextField
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleChange}
                                        fullWidth={true}
                                        onWheel={(e) => e.target.blur()}
                                        label='Initial sick leave credit'
                                        name='initial_sick_leave_credit'
                                        value={values['initial_sick_leave_credit']}
                                        color='primary'
                                        type='number'
                                        regex=''
                                        variant='filled'
                                        required={values.sl_leave_type === 'earned'}
                                        disabled={values.enable_sick_leave === 'false'}
                                    />
                                </Grid>
                            )}

                            <Grid lg={4} md={4} sm={6} xs={12} item={true}>
                                <FormControl
                                    component='fieldset'
                                    fullWidth={true}
                                    disabled={values.enable_sick_leave === 'false'}
                                >
                                    <FormControlLabel

                                        control={
                                            <Switch
                                                name='sickLeaveCarryForward'
                                                checked={values.sickLeaveCarryForward === 'true' ? true : false}
                                                size='medium'
                                                color='primary'
                                                onChange={handleCheck}
                                            />
                                        }
                                        label='Enable Carry Forward SL'
                                        name='sickLeaveCarryForward'
                                    />
                                </FormControl>
                            </Grid>
                            <Grid lg={4} md={4} sm={6} xs={12} item={true}>
                                <TextField
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleChange}
                                    fullWidth={true}
                                    onWheel={(e) => e.target.blur()}
                                    label='SL Carry Forward Limit'
                                    name='max_sl_in_a_month'
                                    value={values['max_sl_in_a_month']}
                                    color='primary'
                                    type='number'
                                    regex=''
                                    disabled={values.sickLeaveCarryForward !== 'true'}
                                    variant='filled'
                                    required={values.gst_registration === true && true}
                                />
                            </Grid> */}

                            {/* <Grid lg={4} md={4} sm={6} xs={12} item={true}>
                                <TextField
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleChange}
                                    fullWidth={true}
                                    //onWheel={(e) => e.target.blur()}
                                    label='Max SL in a Month'
                                    name='sickLeaveMaxLimit'
                                    value={values['sickLeaveMaxLimit']}
                                    color='primary'
                                    type='number'
                                    regex=''
                                    disabled={values.enable_sick_leave === 'false'}
                                    variant='filled'
                                    helperText="Leave blank for no restriction"
                                />

                            </Grid>
          </Grid>
          
           <Grid
                            container
                            style={{ paddingTop: '10px' }}
                            spacing={7}
                            direction='row'
                        > */}


        {/* <Divider></Divider> */}
        <Grid
          spacing={7}
          container={true}
          direction='row'
          display='flex'
          justifyContent='flex-end'
          paddingTop={props.pageType === 'detailpage' ? '10%' : '25px'}
        >
          <Grid item={true}>
          {props.pageType === 'detailpage' ? <Button
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
            </Button> :
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
            </Button>}
          </Grid>

          <Grid item={true}>
            <Button
              onClick={async() => {
                const ValidationErrors = await validateForm()
                if(Object.keys(ValidationErrors).length > 0){
                  console.log('hiievening');
                  dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
                  handleSubmit() 
                }
                else{
                  handleSubmit() 
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
        {/* </Grid> */}
        </Card>
      
  )
}




