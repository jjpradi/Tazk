import {
  Avatar,
  Box,
  Button,
  Card,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  IconButton,
  Input,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'
import { alpha, styled } from '@mui/material/styles';
import platform from 'platform';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { getAppConfigDataAction, getAppConfigWithCompanyInfoAction, get_checkExistsAction, getprefixAction, updateAppConfigWithCompanyInfoAction, updateInvoiceAction, updateUsernameAction } from '../../../redux/actions/app_config_actions';
import { useDispatch, useSelector } from 'react-redux';
import Autocomplete from '@mui/material/Autocomplete';
import { Cities } from '../../../utils/cities';
import _ from 'lodash';
import { Country } from '../../../components/Country_list';
import { getLocationDataBasedOnPincode } from '../../../components/common';
import context from '../../../../src/context/CreateNewButtonContext';
import {
  emailValidation,
  phoneValidation,
  gstValidation,
  zipValidation,
  urlValidation,
  accountNoValidation,
  lanValidation
} from '../../../components/regexFunction/index';
import { getTrimmedData } from '../../../../src/components/trimFunction/index';
import { updateAppConfigAction } from '../../../redux/actions/app_config_actions';
import CancelDialog from '../../../../src/components/CancelDialog';
import EditIcon from '@mui/icons-material/Edit';
import apiCalls from 'utils/apiCalls';
import { Helmet } from "react-helmet-async";
import { getCompanyLogo, getCompanyTypesAction, getSignature, updateEnableLiveAction, updateGpsAttendanceAction, updateGpsandEnableLiveAction, uploadCompanyLogo, updateWorkFromHomeAction, listCompanyGpsRadiusAction, CreateCompany } from 'redux/actions/company_actions';
import CommonToolTip from '../../../components/ToolTip';
import { getPosPages, getRoleNameAction, get_searchUserRoleAction, getusermenus, listroleAction, updateRoleAction } from 'redux/actions/role_actions';
import { getDashboardRoleDataAction, listDashboardAction } from 'redux/actions/dashboard_role_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import { base_url, clientwebsocket, host, initWebSocket, loginUrl, titleURL } from '../../../http-common';
import { useDropzone } from 'react-dropzone';
import AvatarViewWrapper from 'utils/imgUpload';
import Signature from './signature';

import ImageCrop from 'pages/assets/Assets/CropImage';
import { changepasswordAction, LastActivedateAction, listUserlocationsAction, updateUserCreationAction, userCreationPaginationAction } from 'redux/actions/userCreation_actions';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { createFrontDeskAction, sendMailForgetPasswordAction, updatePasswordAction, verifyOtpAction } from 'redux/actions/requestConfig';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import { userNameExistAlert } from 'redux/actions/load';
import { useNavigate } from 'react-router-dom';
import LandingPage from 'pages/common/home/landingPage';
import DetailPage from 'pages/common/home/detailPage';
import DB from 'db';
import { useAuthMethod } from '@crema/utility/AuthHooks';
import login_services from 'services/login_services';
import { fetchSuccess } from 'redux/actions';
import { getLoginRoleAction } from 'redux/actions/userRole_actions';
import notificationType from 'firebase/notify_type';
import { sendNtfy } from 'firebase/firebase.service';
import { CreateNotificationAction } from 'redux/actions/notification_actions';
import Billingaddress from './billingaddress'
import toMomentOrNull from 'utils/DateFixer';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import {
  getSinglePageScrollLayoutSx,
  singlePageScrollContentSx,
} from 'utils/pageScrollLayout';
// import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)({
  '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },
  '& input[type=number]': {
    '-moz-appearance': 'textfield',
  },
});


export default function CompanyInfo({handleNext, handleBack, pageType}) {
  console.log(pageType,'pagetype')
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const storage1 = getsessionStorage()
  const selectedRole = storage1.role_name
  const {
    appConfigReducer: { getprefix_data,app_config_data, appConfigWithCompanyInfo }, 
    roleReducer: { pos_pages, module, role_name, listrole }, 
    DashboardRoleReducer: { getalldashboarddata, dashboardRoleData }, 
    customerReducer: { customer_filter, customer_paginate, Get_customer_statement, customer, customerSalesDetailById, customerDetailById }, 
    CompanyReducers: { company_logo, signature,companyRadiusGps }, 
    UserCreationReducer: {searchUserCreationData},
    rbacReducer: { menuAccess }
  } = useSelector((state) => state);
  const {logout, setFirebaseData } = useAuthMethod();

  const einvoiceValue = app_config_data.find(item => item.key_name === "company.einvoice")?.value;
  const addAcc = app_config_data.find(item => item.key_name === "additional_acc")?.value == 1 ? 1 : 0;
  // console.log("einvoiceValue",einvoiceValue)
  const {
    CompanyReducers: { types },
  } = useSelector((state) => state);
  const tempinitsform = useRef(null);
  const [changedForm, setForm] = useState(false);
  const [invoiceDetail, setInvoiceDetail] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [landingOpen, setLandingOpen] = useState(false);
  const [detailDialog, setDetailDialog] = useState(false);
  const [addInvoiceDetail, setAddInvoiceDetail] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [changeDialogOpen, setChangeDialogOpen] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [dialogUserName, setDialogUserName] = useState('');
  const [otpFieldEnabled, setOtpFieldEnabled] = useState(false);
  const [buttonLabel, setButtonLabel] = useState("Generate OTP"); 
  const [loading, setLoading] = useState(false); 
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [maskedPassword, setMaskedPassword] = useState('••••••••••••');
  const [concate, setconcate] = useState('')
  // const [count, setCount] = useState(0);
  const [formValues, setFormValues] = useState({
    first_name: '',
    last_name: '',
    company_name: '',
    company_type_id: null,
    company_type: null,
    // web_base_url: '',
    gst_registration: true,
    company_email: '',
    company_mobile: '',
    company_phone: '',
    company_gstin_uin: '',
    address_fulladdress: '',
    company_latitude: '',
    company_longitude: '',
    address_street: '',
    address_area: '',
    address_pincode: '',
    address_city: '',
    address_state: '',
    address_country: '',
    company_bank_account_name: '',
    company_bank_name: '',
    company_branch_address: '',
    company_ifsc_code: '',
    company_account_number: '',
    company_einvoice: 0,
    company_tcs_tds: 0,
    company_einvoice_user_name: '',
    company_einvoice_password: '',
    company_einvoice_gstin: '',
    company_einvoice_clientId: '',
    company_clientSecret: '',
    userName:'',
    person_id:'',
    otp:'',
    newPassword:'',
    confirmNewPassword:'',
    currentPasswordForChange:'',
    newPasswordForChange:'',
    confirmNewPasswordForChange:'',
    empIdForPasswordChange:'',
    superAdmin_userName: '',
    admin_userName: '',
    superAdmin_password: '',
    superAdmin_otp:'',
    frontDesk_userName: '',
    frontDesk_password: '',
    frontDesk_otp:'',
    frontDesk_newFirstName:'',
    frontDesk_newLastName:'',
    frontDesk_newUserName:'frontDesk',
    frontDesk_newPassword:'',
    frontDesk_newEmployeeCode:'',
    frontDesk_dateOfJoining:'',
    tan:'',
    pan:'',
    add_account: 0,
    is_addacc_enable: 0,
    // selfie_attendance: '',
    // wifi_attendance: '',
    // qr_attendance: '',
    // gps_attendance: '',
    // company_privilegeLeave: '',
    // company_privilegeLeaveMaxLimit: '',
    // company_privilegeLeaveCarryForward: '',
    // company_liveLocationInterval: '',
    // company_enableLiveLocationInterval: '',
    // gps_attendance_radius: '',
    // company_liveTrackingInterval: '',
    // company_enableLiveLocation: '',
    // extra_pay_for_week_off: '',
    // extra_pay_for_holiday: '',
    // company_enableWorkFromHome: ''
    //company_overtimeAllowance: ''
  });
  console.log("texthkjhkj", formValues, appConfigWithCompanyInfo)
  const [formErrors, setFormErrors] = useState({
    first_name: '',
    // last_name: '',
    company_name: '',
    // company_type_id: null,
    company_type: null,
    // web_base_url: '',
    company_email: '',
    company_mobile: '',
    company_phone: '',
    company_gstin_uin: '',
    address_fulladdress: '',
    company_latitude: '',
    company_longitude: '',
    // address_street: '',
    address_area: '',
    address_pincode: '',
    address_city: '',
    address_state: '',
    address_country: '',
    company_bank_account_name: '',
    company_bank_name: '',
    company_branch_address: '',
    company_ifsc_code: '',
    Invoice_Username: '',
    Password: '',
    GSTIN: '',
    ClientID: '',
    ClientSecret: '',
    company_account_number: '',
    superAdmin_userName: '',
    superAdmin_password: '',
    frontDesk_userName: '',
    frontDesk_password: '',
    tan:'',
    pan:''
    // selfie_attendance: '',
    // wifi_attendance: '',
    // qr_attendance: '',
    // gps_attendance: '',
    // company_privilegeLeave: '',
    // company_privilegeLeaveMaxLimit: '',
    // company_privilegeLeaveCarryForward: '',
    // company_liveLocationInterval: '',
    // company_enableLiveLocationInterval: '',
    // gps_attendance_radius: '',
    // company_liveTrackingInterval: '',
    // company_enableLiveLocation: '',
    // extra_pay_for_week_off: '',
    // extra_pay_for_holiday: '',
    // company_enableWorkFromHome: ''
  });

  const [dialogformErrors, setDialogformErrors] = useState({
    userName: '',
    person_id: '',
    otp: '',
    newPassword: '',
    confirmNewPassword: '',
    superAdmin_userName: '',
    superAdmin_password: '',
    superAdmin_otp: '',
    frontDesk_userName: '',
    frontDesk_password: '',
    frontDesk_otp: '',
    frontDesk_newFirstName: '',
    frontDesk_newLastName: '',
    frontDesk_newUserName: '',
    frontDesk_newPassword: '',
    frontDesk_newEmployeeCode: '',
    frontDesk_dateOfJoining: '',
    currentPasswordForChange:'',
    newPasswordForChange:'',
    confirmNewPasswordForChange:'',
  });

  const [passwordVisibility, setPasswordVisibility] = useState({
    newPassword: false,
    confirmNewPassword: false,
    frontDesk_newPassword: false,
    currentPasswordForChange: false,
    newPasswordForChange: false,
    confirmNewPasswordForChange: false
  });
  
  const [errors, setErrors] = useState({ company_name: '' })
  const [flag, setFlag] = useState(false)


  const liveLocationInterval = formValues.company_enableLiveLocation ? "company_liveTrackingInterval" : ''

  // gst enabled
  let requiredFields = [
    'first_name',
  // 'last_name',
  'company_name',
  'company_type',
  // 'web_base_url',
  'company_email',
  'company_mobile',
  // 'company_gstin_uin',
  'address_fulladdress',
  // 'company_latitude',
  // 'company_longitude',
  // 'address_street',
  'address_area',
  'address_pincode',
  'address_city',
  'address_state',
  'address_country',
 'superAdmin_userName']

  // if (formValues.company_enableLiveLocation) {
  //   requiredFields = [
  //     'first_name',
  //     // 'last_name',
  //     'company_name',
  //     'company_type',
  //     // 'web_base_url',
  //     'company_email',
  //     'company_mobile',
  //     // 'company_gstin_uin',
  //     'address_fulladdress',
  //     // 'company_latitude',
  //     // 'company_longitude',
  //     // 'address_street',
  //     'address_area',
  //     'address_pincode',
  //     'address_city',
  //     'address_state',
  //     'address_country',
  //     // "company_privilegeLeave",
  //     // "company_privilegeLeaveMaxLimit",
  //     // "company_liveTrackingInterval"
  //   ];
  // } else {
  //   requiredFields = [
  //     'first_name',
  //     // 'last_name',
  //     'company_name',
  //     'company_type',
  //     // 'web_base_url',
  //     'company_email',
  //     'company_mobile',
  //     // 'company_gstin_uin',
  //     'address_fulladdress',
  //     // 'company_latitude',
  //     // 'company_longitude',
  //     // 'address_street',
  //     'address_area',
  //     'address_pincode',
  //     'address_city',
  //     'address_state',
  //     'address_country',
  //     "company_privilegeLeave",
  //     "company_privilegeLeaveMaxLimit",
  //   ];
  // }

  // gst disabled
  const [requiredFields1] = useState([
    'first_name',
    'company_name',
    'company_type',
    'company_email',
    'company_mobile',
    'address_pincode',
    'superAdmin_userName',
    // 'company_gstin_uin',
    // 'address_fulladdress',
    // 'address_street',
    // 'address_area',
    // 'address_city',
    // 'address_state',
    // 'address_country',    
  ]);
  const [tempDetails, setTempDetails] = useState({ tempCompanyName: '', tempCompanyType: '' })
  const [cities, setCities] = useState([])
  console.log("formvalues",formValues)
  const textRef = useRef(null);
  const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId, setHeaderLocationIdHandeler } = useContext(context);
  const [validRegex, setValidRegex] = useState({
    company_email: true,
    company_mobile: true,
    company_phone: true,
    company_privilegeLeaveMaxLimit: true,
    company_einvoice_gstin : true
  });
  const [requiredRegex] = useState([
    'company_email',
    'company_mobile',
    'company_einvoice_gstin'
    // 'company_phone',
  ])
  const interval = [1, 2, 5, 10]

  const [selectedInterval, setSelectedInterval] = useState(formValues.company_liveTrackingInterval);

  const [selectedRadius, setSelectedRadius] = useState(formValues.gps_attendance_radius);


  const alter = { company_phone: /^\d{10}$/, company_mobile: /^\d{10}$/ };
  const [open, setOpen] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const [isLoadingLocationData, setIsLoadingLocationData] = useState(false)

  useEffect(() => {
    dispatch(getprefixAction())
    dispatch(getCompanyTypesAction());
    dispatch(listCompanyGpsRadiusAction());
    dispatch(getMenuAccessAction(selectedRole))
  }, []);

  // useEffect(() => {
  //   if(flag){
  //     let data = {
  //       gpsAttendance : formValues.gps_attendance,
  //     }
  //     dispatch(updateGpsAttendanceAction(data));
  //     let data1 = {
  //       enableLiveLocation : formValues.enableLiveLocation
  //     }
  //     dispatch(updateEnableLiveAction(data1));
  //   }
  // }, [flag]);

  // useEffect(() => {
  //   let data = {
  //     enableLiveLocation : formValues.enableLiveLocation
  //   }
  //   dispatch(updateEnableLiveAction(data));
  // }, [formValues.enableLiveLocation]);

  // useEffect(() => {
  //   setCount(count + 1);
  // }, [formValues.gst_registration]);

  const handleOpenCreate = () => {
    setFormValues({
      ...formValues,
      frontDesk_newUserName: "frontDesk"
    });
    setOpenDialog(true);
    console.log("jhjhgjh", formValues);
  };

  const handleOpenChangeDialog = (username) => {
    const body = {
      pageCount: 'numPerPage',
      searchString: '',
      employeeId: commoncookie,
      headerLocationId: headerLocationId
    }
    dispatch(userCreationPaginationAction(body, (response) => {
      const selectedUser = response.data.find(user => user.username === username);

      if (selectedUser) {
        setFormValues(prevValues => ({
          ...prevValues,
          empIdForPasswordChange: selectedUser.employee_id,
          userName: username,
          currentPasswordForChange: '',
          newPasswordForChange: '',
          confirmNewPasswordForChange: ''
        }));
      }
    }));
    setChangeDialogOpen(true);
  };

  const handleCloseChangeDialog = () => {
    setDialogformErrors({});
    setFormValues(prevValues => ({
      ...prevValues,
      currentPasswordForChange: '',
      newPasswordForChange: '',
      confirmNewPasswordForChange: ''
    }));
    setChangeDialogOpen(false);
  };

  const handleCloseCreate = (e) => {
    let { name, value } = e.target;
    setDialogformErrors((prevErrors) => ({
      ...prevErrors,
      [name]: value ? '' : prevErrors[name]
    }));
    setOpenDialog(false);
  };

  const handleDialogOpen = (username) => {
    const body = {
      pageCount: 'numPerPage',
      searchString: '',
      employeeId: commoncookie,
      headerLocationId: headerLocationId
    }
    setDialogUserName(appConfigWithCompanyInfo?.[0]?.username);
    dispatch(userCreationPaginationAction(body, (response) => {
      const selectedUser = response.data.find(user => user.username === username);

      if (selectedUser) {
        setFormValues(prevValues => ({
          ...prevValues,
          person_id: selectedUser.person_id,
          userName: username
        }));
      }
    }));
    setPasswordDialogOpen(true);
  };

  const handleCloseDialog = (e) => {
    setDialogformErrors({});
    setFormValues(prevValues => ({
      ...prevValues,
      otp: '',
      newPassword: '',
      confirmNewPassword: ''
    }));
    setOtpVerified(false);
    setOtpFieldEnabled(false);
    setButtonLabel("Generate OTP");
    setPasswordDialogOpen(false);
  };

  const onShowNewPassword = (field) => {
     setPasswordVisibility((prev) => ({
    ...prev,
    [field]: !prev[field]
  }));
  };

  const onDownNewPassword = (event) => {
    event.preventDefault();
  };

  const handleNewPasswordChange = (event) => {
    const { name, value } = event.target;
    setDialogformErrors((prevErrors) => ({
      ...prevErrors,
      newPassword: value ? '' : prevErrors.newPassword,
    }));
    setFormValues((prevValues) => ({
      ...prevValues,
      newPassword: value,
    }));
  };

  const handleConfirmPasswordChange = (event) => {
    const { name, value } = event.target;
    setDialogformErrors((prevErrors) => ({
      ...prevErrors,
      confirmNewPassword: value ? '' : prevErrors.confirmNewPassword,
    }));
    setFormValues((prevValues) => ({
      ...prevValues,
      confirmNewPassword: value,
    }));
  };

  const handleUsernameChange = (e) => {
    setFormValues({ ...formValues, superAdmin_userName: e.target.value, frontDesk_userName: e.target.value, userName: e.target.value });
  };

  const handleOtpChange = (e) => {
    let { name, value } = e.target;
    setDialogformErrors((prevErrors) => ({
      ...prevErrors,
      otp: value ? '' : prevErrors.otp,
    }));
    setFormValues((prevValues) => ({
      ...prevValues,
      otp: value,
    }));
  };

  const handleGenerateOtp = async () => {
    try {
      setLoading(true);
      const data = { companyMail: formValues.company_email, person_id: formValues.person_id };
      const response = await dispatch(sendMailForgetPasswordAction(data, setLoaderStatusHandler));
      if (response && response.message === "mail sent") {
        setOtpFieldEnabled(true);
        setButtonLabel("Verify OTP");
      }
      setLoading(false); 
    } catch (error) {
      console.log("error:", error);
      setLoading(false); 
    }
  };


  const handleVerifyOtp = async () => {
    const errors = {};

    if (!formValues.otp) {
      errors.otp = 'OTP is required';
    }

    setDialogformErrors(errors);
    setIsSubmitting(true);

    if (Object.keys(errors).length > 0) return;

    try {
      const data = {
        otp: formValues.otp,
        username: formValues.userName || dialogUserName,
      };

      const response = await dispatch(verifyOtpAction(data));

      if (response && response.message === "otp verified") {
        setOtpVerified(true);
        setButtonLabel("Reset Password");
      }
    } catch (error) {
      console.error("OTP verification failed. Please try again.");
    }
  };

  const handleUpdatePassword = async () => {

    const errors = {};

    if (!formValues.newPassword) {
      errors.newPassword = 'Password is required.';
    } else if (formValues.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters long.';
    } else if (/\s/.test(formValues.newPassword)) {
      errors.newPassword = 'Password must not contain spaces.';
    }

    if (!formValues.confirmNewPassword) {
      errors.confirmNewPassword = 'Password is required.';
    }

    if (formValues.newPassword && formValues.confirmNewPassword && formValues.newPassword !== formValues.confirmNewPassword) {
      errors.confirmNewPassword = 'Passwords must match.';
    }

    setDialogformErrors(errors);
    setIsSubmitting(true);

    if (Object.keys(errors).length > 0) return;

    try {
      const data = {
        otp: formValues.otp,
        username: formValues.userName,
        password: formValues.confirmNewPassword
      };

      const response = await dispatch(updatePasswordAction(data));

      if (response && response.message === "password updated") {
        setFormValues(prevValues => ({
          ...prevValues,
          newPassword: '',
          confirmNewPassword: '',

        }));

        setOtpVerified(false);
        setOtpFieldEnabled(false);
        setButtonLabel("Generate OTP");
        handleCloseDialog();
      } else {
        console.error("Password update failed");
      }
    } catch (error) {
      console.error("OTP verification failed. Please try again.");
    }
  };

  const handleCreateUserSubmit = async () => {
    const errors = {};

    if (!formValues.frontDesk_newFirstName) {
      errors.frontDesk_newFirstName = 'First Name is required';
    }
    if (!formValues.frontDesk_newUserName) {
      errors.frontDesk_newUserName = 'Username is required';
    }
    if (!formValues.frontDesk_newPassword) {
      errors.frontDesk_newPassword = 'Password is required';
    }
    if (!formValues.frontDesk_newEmployeeCode) {
      errors.frontDesk_newEmployeeCode = 'Employee Code is required';
    }
    if (!formValues.frontDesk_dateOfJoining) {
      errors.frontDesk_dateOfJoining = 'Date Of Joining is required';
    }

    setDialogformErrors(errors);
    setIsSubmitting(true);

    if (Object.keys(errors).length > 0) return;

    try {
      const data = {
        first_name: formValues.frontDesk_newFirstName,
        last_name: formValues.frontDesk_newLastName,
        designation: "Front Office Executive",
        username: getprefix_data[0]?.value + '.' + formValues.frontDesk_newUserName,
        password: formValues.frontDesk_newPassword,
        role_name: "Front Desk",
        attendance_restrictions: 0,
        employeeId: formValues.frontDesk_newEmployeeCode,
        dateOfJoining: formValues.frontDesk_dateOfJoining,
        token: "",
        category_id: 0,
        enableLiveLocation: 0,
        work_from_home: 0,
        selfie_attendance: 0,
        face_attendance: 0,
        manual_attendance: 0,
        // offline_attendance:0,
        attendance_via_app: 1,
        app_access: true,
      };

      const response = await dispatch(createFrontDeskAction(data));

      if (response && response.message === "Front Desk User Created Successfully") {
        setOpenDialog(false);
        setFormValues(prevValues => ({
          ...prevValues,
          frontDesk_newFirstName: '',
          frontDesk_newLastName: '',
          frontDesk_newUserName: '',
          frontDesk_newPassword: '',
          frontDesk_newEmployeeCode: '',
          frontDesk_dateOfJoining: '',
        }));
        const body = {
          pageCount: 'numPerPage',
          searchString: '',
          employeeId: commoncookie,
          headerLocationId: headerLocationId
        }
        dispatch(userCreationPaginationAction(body, (response) => {

          const adminUser = response.data.find(user => user.role_name === "Administrator" && user.employee_id === commoncookie);
          const frontDesk = response.data.find(user => user.role_name === "Front Desk");

          setFormValues(prevValues => ({
            ...prevValues,
            superAdmin_userName: adminUser?.username,
            superAdmin_password: adminUser?.password,
            superAdmin_personId: adminUser?.person_id,
            frontDesk_userName: frontDesk?.username,
            frontDesk_password: frontDesk?.password,
            frontDesk_personId: frontDesk?.person_id,
          }));
        }))
      } else {
        console.error("Password update failed");
      }

    } catch (error) {
      console.error("OTP verification failed. Please try again.");
    }
  };

  const handleChangePassword = async () => {
    const errors = {};

    if (!formValues.currentPasswordForChange) {
      errors.currentPasswordForChange = 'Password is required.';
    }
    if (!formValues.newPasswordForChange) {
      errors.newPasswordForChange = 'Password is required.';
    } else if (formValues.newPasswordForChange.length < 6) {
      errors.newPasswordForChange = 'Password must be at least 6 characters long.';
    } else if (/\s/.test(formValues.newPasswordForChange)) {
      errors.newPasswordForChange = 'Password must not contain spaces.';
    }
    if (!formValues.confirmNewPasswordForChange) {
      errors.confirmNewPasswordForChange = 'Password is required.';
    }

    if (formValues.newPasswordForChange && formValues.confirmNewPasswordForChange && formValues.newPasswordForChange !== formValues.confirmNewPasswordForChange) {
      errors.confirmNewPasswordForChange = 'Passwords must match.';
    }
   
    setDialogformErrors(errors);
    setIsSubmitting(true);

    if (Object.keys(errors).length > 0) return;

    try {
      const data = {
        employee_id:formValues.empIdForPasswordChange,
        oldPassword:formValues.currentPasswordForChange,
        newPassword:formValues.confirmNewPasswordForChange
      };

     const response =  await dispatch(changepasswordAction(data));
     
      if (response && response.affectedRows > 0) {
        setFormValues(prevValues => ({
          ...prevValues,
          currentPasswordForChange: '',
          newPasswordForChange: '',
          confirmNewPasswordForChange: ''
        }));
        setChangeDialogOpen(false); 
      }

    } catch (error) {
      console.error("ERROR");
    }
  };

  const handleSwitchChange = async (e) => {
    let { name, checked } = e.target;
    setForm(true);
    console.log('handleswitch2',name, checked)
  setFormValues((prev) => {
    let updatedValues = { ...prev, [name]: checked };

    if (name === 'gst_registration' && !checked) {
      updatedValues.company_gstin_uin = '';
    }

    if (name === 'company_einvoice') {
      if (prev.company_einvoice === true || prev.company_einvoice === 0) {
        setInvoiceDetail(true);
      }
    }
    if (name === 'is_addacc_enable') {
      console.log('handleswitch3', updatedValues, checked)
      updatedValues[name] = checked ? 1 : 0;

      console.log('handleswitch1', prev.is_addacc_enable);
      if (checked) {
        setConfirmOpen(true)
      } else {
      }
    }
    console.log('handleswitch', formValues.is_addacc_enable, formValues)
    return updatedValues;
  });

  if (!checked && name === 'company_einvoice') {
    setFormErrors((prev) => ({ ...prev, company_einvoice_gstin: '' }));
  }
  };

  const handleAddInvoiceDetails = () => {
    setInvoiceDetail(false)
    setAddInvoiceDetail(true)
  }

  const cancelInvoiceDetails = () => {
    setInvoiceDetail(false)
    setFormValues((prev) => ({...prev, company_einvoice : 0 }))
    setAddInvoiceDetail(false)
  }

  const handleClickOpen = () => {
    setPasswordDialogOpen(false);
    setChangeDialogOpen(false);
    setOpenDialog(false);
    setOpen(true);
  };

  const cancelDialog = () => {
    setOpen(false);
  };

  const initsform = () => {
    const body = {
      pageCount: 'numPerPage',
      searchString: '',
      employeeId: commoncookie,
      headerLocationId: headerLocationId
    }
    let data = {
      company_type: storage1?.company_type
    }
    // setTempDetails({ tempCompanyName : formValues.company_name, tempCompanyType : formValues.company_type_id})
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      // dispatch(getAppConfigDataAction(setModalTypeHandler, setLoaderStatusHandler,
      //   (response) => {
          // if(response.length){
          //   setFormValues({ ...formValues, gst_registration : app_config_data[0].company_gstin_uin ? true : false})
          // }
        // }
      // )),
      dispatch(listroleAction(setModalTypeHandler, setLoaderStatusHandler)),
      //this.props.listmoduleAction(),
      //this.props.listStockLocationAction(context.commoncookie, context.headerLocationId),
      dispatch(getPosPages()),
      dispatch(getRoleNameAction(data)),
      dispatch(listDashboardAction()),
      dispatch(getCompanyLogo()),
      dispatch(getSignature()),
      dispatch(userCreationPaginationAction(body, (response) => {    
        let adminUser = null;
        for (let i = response.data.length - 1; i >= 0; i--) {
          if (response.data[i].role_name === "Administrator" && response.data.employee_id === commoncookie) {
            adminUser = response.data[i];
            break;
          }
        }
        const frontDesk = response.data.find(user => user.role_name === "Front Desk");
        const username = adminUser?.username || "";
        const prefix = getprefix_data[0]?.value || "";

        setFormValues(prevValues => ({
          ...prevValues,
          superAdmin_userName:  prefix && username.startsWith(prefix + ".") ? username.slice(prefix.length + 1) : username,
          admin_userName: adminUser?.username,
          superAdmin_password: adminUser?.password,
          superAdmin_personId: adminUser?.person_id,
          frontDesk_userName: frontDesk?.username,
          frontDesk_password: frontDesk?.password,
          frontDesk_personId: frontDesk?.person_id,
          // first_name : appConfigWithCompanyInfo[0].first_name,
          // last_name : appConfigWithCompanyInfo[0].last_name
        }));
      })),
      dispatch(getAppConfigWithCompanyInfoAction(setModalTypeHandler, setLoaderStatusHandler,
        (response) => { 
          if(response.length){
            setFormValues({ ...formValues, first_name : response[0].first_name, last_name : response[0].last_name, company_type : response[0].company_type })
          }
        }
      ))
    );
  };


  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();
  }, []);

  useEffect(() => {
    const body = {
      pageCount: 'numPerPage',
      searchString: '',
      employeeId: commoncookie,
      headerLocationId: headerLocationId
    }
    // if(editOpen){
    if (formValues?.company_name || formValues?.company_type_id) {
      const body = {
        company_name: formValues?.company_name,
        company_type: formValues?.company_type_id,
      };
      if (tempDetails.tempCompanyName !== formValues.company_name) {
        dispatch(
          get_checkExistsAction(body, 'COMPANY_NAME', (res) => {
            setErrors({
              ...errors,
              company_name: res ? null : 'Company Already Exists',
            });
          }),
        );
      }
      else {
        setErrors({
          ...errors,
          company_name: ''
        });
      }
    }

    dispatch(userCreationPaginationAction(body, (response) => {

      const adminUser = response.data.find(user => user.role_name === "Administrator" && user.employee_id === commoncookie);
      const frontDesk = response.data.find(user => user.role_name === "Front Desk");
        const username = adminUser?.username || "";
        const prefix = getprefix_data[0]?.value || "";
      setFormValues(prevValues => ({
        ...prevValues,
        superAdmin_userName:  prefix && username.startsWith(prefix + ".") ? username.slice(prefix.length + 1) : username,
        admin_userName:adminUser?.username,
        superAdmin_password: adminUser?.password,
        frontDesk_userName: frontDesk?.username,
        frontDesk_password: frontDesk?.password,
      }));
    }))
    // }
  }, [formValues?.company_name, formValues?.company_type_id]);



  useEffect(() => { (async () => {
    if(app_config_data.length > 0){
      // handleClose();
      const value = {};

    app_config_data.forEach((d) => {
      if (d.key_name === 'web.base.url') {
        value[d.key_name.replace('web.base.url', 'web_base_url')] = d.value;
      }
      if (d.key_name === 'company.gstin/uin') {
        value[d.key_name.replace('company.gstin/uin', 'company_gstin_uin')] =
          d.value;
      }
      if (d.key_name === 'company.gps_attendance_radius') {
        value[d.key_name.replace('company.gps_attendance_radius', 'gps_attendance_radius')] = d.value;
      }else {
        value[d.key_name.replace('.', '_')] = d.value;
      }
    });
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
     await dispatch(getAppConfigWithCompanyInfoAction(setModalTypeHandler, setLoaderStatusHandler,
        (response) => {
          if (response.length) {
            console.log('responseeee',response)
            // setFormValues({ ...formValues, first_name : response[0].first_name, last_name : response[0].last_name, company_type : response[0].company_type })
            value.first_name = response[0].first_name
            value.last_name = response[0].last_name
            value.company_type = response[0].company_type
            value.company_type_id = response[0].company_type_id
            value.person_id = response[0].person_id
            value.inv_toggle = response[0].inv_toggle
            value.Invoice_Username = response[0].Invoice_Username
            value.Password = response[0].Password
            value.GSTIN = response[0].GSTIN
            value.ClientID = response[0].ClientID
            value.ClientSecret = response[0].ClientSecret
            setTempDetails({ tempCompanyName: value.company_name, tempCompanyType: response[0].company_type_id })
          }
        }
      ))
    )
    // value.first_name = formValues.first_name
    value.gst_registration = value.company_gstin_uin ? true : false
    // console.log(value,'safdsafsdfs')
    setFormValues(value);

    }
  })();
}, [app_config_data]);


  const setStateHandler = async (name, value) => {
    let formObj = {};

    formObj = {
      ...formValues,
      [name]: value === '' ? '' : value,
    };

    await setFormValues(formObj);
    validationHandler(name, value);
  };

  const handleClose = async () => {
    console.log("comesinthedhadnclose");
    
    // const value = {};
    // app_config_data.forEach((d) => {
    //   if (d.key_name === 'web.base.url') {
    //     value[d.key_name.replace('web.base.url', 'web_base_url')] = d.value;
    //   }
    //   if (d.key_name === 'company.gstin/uin') {
    //     value[d.key_name.replace('company.gstin/uin', 'company_gstin_uin')] =
    //       d.value;
    //   }
    //   if (d.key_name === 'company.gps_attendance_radius') {
    //     value[d.key_name.replace('company.gps_attendance_radius', 'gps_attendance_radius')] = d.value;
    //   }else {
    //     value[d.key_name.replace('.', '_')] = d.value;
    //   }
    // });
    // apiCalls(
    //   setModalTypeHandler,
    //   setLoaderStatusHandler,
    //   dispatch(getAppConfigWithCompanyInfoAction(setModalTypeHandler, setLoaderStatusHandler,
    //     (response) => {
    //       if (response.length) {
    //         // setFormValues({ ...formValues, first_name : response[0].first_name, last_name : response[0].last_name, company_type : response[0].company_type })
    //         value.first_name = response[0].first_name
    //         value.last_name = response[0].last_name
    //         value.company_type = response[0].company_type
    //         value.company_type_id = response[0].company_type_id
    //         value.person_id = response[0].person_id
    //         value.inv_toggle = response[0].inv_toggle
    //         value.Invoice_Username = response[0].Invoice_Username
    //         value.Password = response[0].Password
    //         value.GSTIN = response[0].GSTIN
    //         value.ClientID = response[0].ClientID
    //         value.ClientSecret = response[0].ClientSecret
    //         setTempDetails({ tempCompanyName: value.company_name, tempCompanyType: response[0].company_type_id })
    //       }
    //     }
    //   ))
    // )
    // // value.first_name = formValues.first_name
    // value.gst_registration = value.company_gstin_uin ? true : false
    // setFormValues(value);
    // setFormValues({ ...formValues, gst_registration : value.company_gstin_uin ? true : false})
    dispatch(getAppConfigDataAction())
    cancelDialog();
    setForm(false);
    setEditOpen(false);
  };

  const [customerData, setcustomer] = useState('');
  

  const [image, setImage] = useState(null)
  const [isEnabled, setIsEnabled] = useState(false);
  const [cropImageModal, setCropImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageStatus, setImageStatus] = useState(true);
  console.log(imageStatus,image,"dddd")

  const { getRootProps, getInputProps } = useDropzone({ 
    accept: 'image/png',
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const reader = new FileReader();
  
        reader.onload = function (event) {
          const img = new Image();
          img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
  
            // Fill canvas with white background to remove transparency
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
  
            // Convert canvas to PNG image
            const pngUrl = canvas.toDataURL('image/png');
  
            // Set the converted image for cropping
            setSelectedImage(pngUrl);
            setCropImageModal(true);
          };
          img.src = event.target.result; // Set img source to the result from the reader
        };
  
        reader.readAsDataURL(file); // Read the file as a Data URL
      }
    },
  });
  
  

  const handesetSaveTrue = () => {
    setIsEnabled(true)
  }
  const handledelete = () => {
    setImage(null);
    setImageStatus(false);
    setIsEnabled(true);
  }
  const handleImage = () => {
    // const type = checkType();

    // const Id = type === 'Customer' ? customer_data[index]?.customer_id : (type === 'Supplier' ? customer_data[index]?.supplier_id : customer_data[index]?.person_id)

    let data = {
      companyId: storage1?.company_id,
      image: image,
      // customer_type: type
    }

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(uploadCompanyLogo(data, () => { }))
    )
    setIsEnabled(false)
    setForm(true)
  }


  useEffect(() => {
    
    if (image !== null) {
      setIsEnabled(true)
      
    }

  }, [image, imageStatus])
  const handleChange = async (e) => {
    let { name, value } = e.target;
    setStateHandler(name, value);
    setForm(true);

    setDialogformErrors((prevErrors) => ({
      ...prevErrors,
      [name]: value ? '' : prevErrors[name]
    }));

    if (name === 'pan') {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/; // PAN format regex
      if (!panRegex.test(value)) {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          pan: 'Invalid PAN Number format',
        }));
      } else {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          pan: '',
        }));
      }
      return;
    }

    if (name === 'tan') {
      const tanRegex = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/; // TAN format regex
      if (!tanRegex.test(value)) {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          tan: 'Invalid TAN Number format',
        }));
      } else {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          tan: '',
        }));
      }
      return;
    }

    if (name === 'company_account_number') {
      console.log("gyujftyjdty");
      
    if (accountNoValidation(value)) {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          company_account_number: '',
        }));
      } else {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          company_account_number: 'Invalid Account Number',
        }));
      }
      return;
    }

    if (name === 'address_pincode') {
      if (!isLoadingLocationData) {
        setIsLoadingLocationData(true)
        if(value !== ''){
          if (value.length === 6) {
            setFormValues({...formValues,address_area: ""})
            const locationData = await getLocationDataBasedOnPincode(value);

            if (locationData !== undefined) {
              const { district, state } = locationData;
              if(locationData?.cities.length) {
               setCities(locationData.cities)
              } else {
                setCities([])
              }
              if (district && state) {
                setFormValues({
                  ...formValues,
                  address_pincode: value,
                  address_city: district,
                  address_area: locationData.cities.length === 1 ? locationData.cities[0] : "",
                  address_state: state,
                });
                setFormErrors({
                  ...formErrors,
                  address_pincode: '',
                  address_city: '',
                  address_state: ''
                });
              }
            }
            else{
              // setLoader(false)
              setFormErrors({
                ...formErrors,
                address_pincode: "Company Pincode is Not Found",
              });
            }
          }
          else{
            // setLoader(false)
            setFormErrors({
              ...formErrors,
              address_pincode: "Company Pincode maximum length is 6 digits",
            });
          }
        }
        else{
          setFormErrors({
            ...formErrors,
          address_pincode: formValues.gst_registration ? "Company Pincode is Required!" : '',
          });
        }
        setIsLoadingLocationData(false);
      }
    }
    if (name === "company_einvoice" && formValues.company_einvoice) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        company_einvoice_gstin : formValues.company_einvoice_gstin ? "" : "GST is Required!",
      }));
    }
  };


  const handleChangeInterval = (event) => {
    setForm(true);
    setSelectedInterval(event.target.value);
    setFormValues({
      ...formValues,
      company_liveTrackingInterval: event.target.value,
    });
  };

  const handleChangeRadius = (event) => {
    setForm(true)
    setSelectedRadius(event.target.value);
    setFormValues({
      ...formValues,
      gps_attendance_radius: event.target.value,
    });
  };

  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const validationHandler = (name, value) => {
    let errors = { ...formErrors };
    let validRegexUpdate = { ...validRegex };
  
    let checkRequired = formValues.gst_registration === true ? requiredFields : requiredFields1;
    const maxLimit = parseFloat(value); 
    const privilegeLeave = parseFloat(formValues.company_privilegeLeave);
  function formatFieldName(field) {
  return field
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
}

    if (checkRequired.includes(name)) {
      if (value === '' || value === false || (Object.keys(value).length && value.value === '')) {
        errors[name] = name === 'address_pincode'
          ? 'Company Pincode is Required!'
          : capitalize(name) + ' is Required!';
      } else {
        errors[name] = '';
      }
    }
  
    if (name === 'company_email') {
      if (value.length === 0) {
        errors[name] = 'Company email is required!';
      } else if (!emailValidation(value)) {
        errors[name] = 'Email is Invalid!';
      } else {
        errors[name] = '';
      }
    } else if (name === 'company_mobile') {
      if (!phoneValidation(value)) {
        validRegexUpdate.company_mobile = false;
        errors[name] = capitalize(name) + ' is Invalid!';
      } else {
        validRegexUpdate.company_mobile = true;
        errors[name] = '';
      }
    }else if (name === 'company_phone' && value !== "" ) {
      if (!lanValidation(value)) {
        validRegexUpdate.company_phone = false;
        errors[name] = formatFieldName(name) + ' is Invalid!';
      } else {
        validRegexUpdate.company_phone = true;
        errors[name] = '';
      }
    }
    else if (name === 'company_gstin_uin') {
      if (!gstValidation(value)) {
        validRegexUpdate.company_gstin_uin = false;
        errors[name] = capitalize(name) + ' is Invalid!';
      } else {
        validRegexUpdate.company_gstin_uin = true;
        errors[name] = '';
      }
    } else if (name === 'address_pincode') {
      if (value !== '') {
        if (value.length !== 6) {
          errors[name] = 'Company Pincode maximum length is 6 digits';
        } else {
          errors[name] = '';
        }
      } else {
        errors[name] = formValues.gst_registration ? 'Company Pincode is Required!' : '';
      }
    } else if (name === 'web_base_url') {
      if (!urlValidation(value)) {
        validRegexUpdate.web_base_url = false;
        errors[name] = 'URL is Invalid!';
      } else {
        validRegexUpdate.web_base_url = true;
        errors[name] = '';
      }
    } else if (name === 'company_privilegeLeaveMaxLimit') {
      if (touchedFields[name] && (isNaN(maxLimit) || maxLimit < privilegeLeave)) {
        validRegexUpdate.company_privilegeLeaveMaxLimit = false;
        errors[name] = 'Should be greater or equal to Privilege Leaves';
      } else {
        validRegexUpdate.company_privilegeLeaveMaxLimit = true;
        errors[name] = '';
      }
    } 
    else if (name === 'company_einvoice_gstin') {
      if (!gstValidation(value)) {
        validRegexUpdate.company_einvoice_gstin = false;
        errors[name] = 'Company EInvoice is Invalid!';
      } else {
        validRegexUpdate.company_einvoice_gstin = true;
        errors[name] = '';
      }
    }
    else {
      errors[name] = '';
    }
    setFormErrors(errors);
    setValidRegex(validRegexUpdate);
  };
  
  const handleInvoiceSubmit = () => {
    const fieldsToValidate = [
      'company_einvoice',
      'company_einvoice_gstin'
    ];
  
    let isValid = true;
    let formErrorsObj = { ...formErrors };
  
    fieldsToValidate.forEach((key) => {
      if (
        formValues[key] === '' ||
        formValues[key] === null ||
        formValues[key] === 'null'
      ) {
        isValid = false;
        formErrorsObj[key] = key.replace(/_/g, ' ').toUpperCase() + ' is required!';
      }
    });
  
    setFormErrors(formErrorsObj);
  
    if (!isValid) {
      // dispatch(OpenalertActions({ msg: 'Please fill all required fields.', severity: 'warning' }));
    setAddInvoiceDetail(true)
      return;
    }
    const formDatas = {
      'company.einvoice': formValues.company_einvoice,
      'company.einvoice_user_name': formValues.company_einvoice_user_name,
      'company.einvoice_password': formValues.company_einvoice_password,
      'company.einvoice_gstin': formValues.company_einvoice_gstin
    };
  
    dispatch(updateInvoiceAction(formDatas)).then((res) => {
      if (res == 200) {
        dispatch(getAppConfigDataAction());
        setAddInvoiceDetail(false);
      }
    });
  };
  

  const handleSubmit = async (event) => {
    event.preventDefault();
    let missingFields = [];
    let invalidFields = [];
    let { name, checked } = event.target;
    let isValid = true;
    let formErrorsObj = { ...formErrors };
    let checkRequired = formValues.gst_registration === true ? requiredFields : requiredFields1
    await Object.keys(formValues).map((key, i) => {
      if (  
        checkRequired.includes(key) &&
        (formValues[key] === '' || formValues[key] === null || formValues[key] === "null")
      ) {
        isValid = false;
        formErrorsObj[key] = key === 'address_pincode' ? 'Company Pincode is Required!' : capitalize(key) + ' is Required!';
        missingFields.push(key);
      } else if (alter[key]) {
        const value = formValues[key];

        if (
          formValues[key] !== '' &&
          formValues[key] !== null &&
          !alter[key].test(formValues[key])
        ) {
          isValid = false;
          formErrorsObj[key] = capitalize(key.replace(/_/g, ' ')) + ' is Invalid!';
          missingFields.push(key);
        }
      } else if (key === 'company_account_number' &&  formValues[key] != null &&  formValues[key] != '' ) {
        if (!accountNoValidation(formValues[key])) {
          isValid = false;
          formErrorsObj[key] = 'Invalid Account Number';
          invalidFields.push(key);
        }
      }
      else if(key === 'address_pincode'){
        if(formErrors.address_pincode !== ''){
          isValid = false
          missingFields.push(key);
        }
      }
      if ((formValues.company_einvoice_gstin === '' || formValues.company_einvoice_gstin === null || formValues.company_einvoice_gstin === 'null') && formValues.company_einvoice === 1) {
        formErrorsObj.company_einvoice_gstin = "Company EInvoice GST is Required!"
        isValid = false;
        missingFields.push(key);
      }
      return '';
    });
    await Object.keys(validRegex).map((key, i) => {
      if (
        requiredRegex.includes(key) &&
        ((validRegex[key] !== true && formValues[key] !== '')
          // &&
          // formValues[key] !== ''
        )
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key.replace(/_/g, ' ')) + ' is Invalid!';
        missingFields.push(key);
      }
      return '';
    });

    await setFormErrors(formErrorsObj);

    if (errors.company_name === 'Company Already Exists') {
      isValid = false
    }

    if (isValid) {
      let formDatas = {
        //pos_company
        'company_type': formValues.company_type,
        'company_type_id': formValues.company_type_id,
        'company.name': formValues.company_name,

        //pos_app_config
        // 'selfie.attendance': formValues.selfie_attendance,
        // 'wifi.attendance': formValues.wifi_attendance,
        // 'qr.attendance': formValues.qr_attendance,
        // 'gps.attendance': formValues.gps_attendance,
        // 'company.gps_attendance_radius': formValues.gps_attendance_radius,
        'company.gstin/uin': formValues.company_gstin_uin,

        'address.street': formValues.address_street,
        'address.area': formValues.address_area,
        'web.base.url': formValues.web_base_url,
        //'company.overtimeAllowance': formValues.company_overtimeAllowance,
       // 'company.privilegeLeave': formValues.company_privilegeLeave,
        //'company.privilegeLeaveMaxLimit': formValues.company_privilegeLeaveMaxLimit,
        //'company.privilegeLeaveCarryForward': formValues.company_privilegeLeaveCarryForward,
        //'company.liveTrackingInterval': formValues.company_liveTrackingInterval,
        //'company.enableLiveLocation': formValues.company_enableLiveLocation,
       // 'extra_pay_for_week_off': formValues.extra_pay_for_week_off,
       // 'extra_pay_for_holiday': formValues.extra_pay_for_holiday,
      //  'company.enableWorkFromHome': formValues.company_enableWorkFromHome,


        //pos_people
        'first_name': formValues.first_name,
        'last_name': formValues.last_name,
        'companyEmail': formValues.company_email,
        'companyMobile': formValues.company_mobile,
        'companyPhone': formValues.company_phone,
        'address.fulladdress': formValues.address_fulladdress,
        'company.latitude': formValues.company_latitude,
        'company.longitude': formValues.company_longitude,
        'address.pincode': formValues.address_pincode,
        'address.city': formValues.address_city,
        'address.state': formValues.address_state,
        'address.country': formValues.address_country,
        'company.bank_account_name': formValues.company_bank_account_name,
        'company.bank_name': formValues.company_bank_name,
        'company.branch_address': formValues.company_branch_address,
        'company.ifsc_code': formValues.company_ifsc_code,
        'company.account_number': formValues.company_account_number,
        'company.einvoice' : formValues.company_einvoice,
        'company.tcs_tds' : formValues.company_tcs_tds,
        'company.einvoice_user_name': formValues.company_einvoice_user_name,
        'company.einvoice_password': formValues.company_einvoice_password,
        'company.einvoice_gstin': formValues.company_einvoice_gstin,
        'company.einvoice_clientId': formValues.company_einvoice_clientId,
        'company.clientSecret': formValues.company_clientSecret,
        'pan':formValues.pan,
        'tan':formValues.tan
      };

      // let newData = {}
      let dashboard = getalldashboarddata.map(item => ({
        dashboard_id: item.dashboard_id,
        dashboard_name: item.dashboard_name
      }));

      let usernameData = {
        employee_id: commoncookie,
        username: getprefix_data[0]?.value + '.' + formValues.superAdmin_userName
      }

      let newData = {
        "role_id": storage1?.role_id,
        "role_name": storage1?.role_name,
        "modules": listrole?.length ? listrole : [],
        "dashboard": dashboard,
        "notifications": pos_pages,
        "company_live_location": formValues.company_enableLiveLocation
      };

      if (formValues.company_enableLiveLocation === 'false' || formValues.qr_attendance === 'false') {
        newData.modules = newData.modules?.filter(item => {
          return (
            (formValues.company_enableLiveLocation !== 'false' || item.module_name !== "Live Location") &&
            (formValues.qr_attendance !== 'false' || item.module_name !== "QR Generator")
          );
        });
        // newData["QR Attendance"] = false;
      }

      // if (formValues.company_enableWorkFromHome === 'false') {
      //   newData.modules = newData.modules.filter(item => {
      //     return (
      //       (formValues.company_enableWorkFromHome !== 'false' || item.module_name !== "") 
      //     );
      //   });
      // }

      // Additional code...

      // const cookies = new Cookies();
      const storage = sessionStorage.getItem('login');
      const cookieData = JSON.parse(storage);

                  let oldModulesMap = {};
            cookieData.modules?.forEach(mod => {
            oldModulesMap[mod.module_name] = {
                child_modules: mod.child_modules || [],
                messageId: mod.messageId || mod.module_name
            };
            });

            let updatedModules = newData.modules.map(mod => ({
            ...mod,
            child_modules: oldModulesMap[mod.module_name]?.child_modules || [],
            messageId: oldModulesMap[mod.module_name]?.messageId || mod.module_name
            }));

      const allowedModules = {
        "Contacts": [],
        "Point Of Sale": [],
        "Purchases": ["Bills", "Payables", "Payments"],
        "Inventory": ["Stocks", "Product Master"],
        "Cash & Bank": ["Cash In Hand"],
        "Settings": [],
      };

      const filteredModules = (cookieData.modules || [])
        .filter(mod => allowedModules.hasOwnProperty(mod.module_name))
        .map(mod => {
          const allowedChildren = allowedModules[mod.module_name];
          return {
            ...mod,
            child_modules: allowedChildren.length
              ? (mod.child_modules || []).filter(child =>
                allowedChildren.includes(child.child_module_name)
              )
              : mod.child_modules || [],
          };
        });

      // Update the 'modules' property
      cookieData.modules = addAcc == 1 ? filteredModules : updatedModules;
      cookieData.company_live_location = newData.company_live_location === "false" ? 0 : 1

      // Update the stored login data
      sessionStorage.setItem('login', JSON.stringify(cookieData));

      apiCalls(
        setLoaderStatusHandler,
        setModalTypeHandler,
        // dispatch(
        //   updateAppConfigAction(
        //     getTrimmedData(formDatas),
        //     setLoaderStatusHandler,
        //     setModalTypeHandler,
        //   ),
        // ),
        await dispatch(
          updateAppConfigWithCompanyInfoAction(
            getTrimmedData(formDatas),
            async(response) => {
              if (response?.data?.message === "Mobile number already exists") {
                const existingMobileData = app_config_data.find(
                  (item) => item.key_name === 'company.mobile'
                );

                if (existingMobileData) {
                  setFormValues((prev) => ({
                    ...prev,
                    company_mobile: existingMobileData.value || '',
                  }));
                }
                return;
              }
              if (response.status === 200) {
                // dispatch(updateRoleAction(storage1?.role_id, newData))
                const body = {
                  pageCount: 'numPerPage',
                  searchString: '',
                  employeeId: commoncookie,
                  headerLocationId: headerLocationId
                }
                await dispatch(userCreationPaginationAction(body))
                if(formValues.gps_attendance === 'false'){
                  let data = {
                    gpsAttendance : formValues.gps_attendance,
                  }
                  await dispatch(updateGpsAttendanceAction(data));
                }

                // if(formValues.company_enableLiveLocation  === 'false'){
                //   let data1 = {
                //     enableLiveLocation : formValues.company_enableLiveLocation
                //   }
                //   dispatch(updateEnableLiveAction(data1));
                // }

                if(formValues.company_enableWorkFromHome  === 'false'){
                  let data1 = {
                    enableWorkFromHome : formValues.company_enableWorkFromHome
                  }
                  await dispatch(updateWorkFromHomeAction(data1));
                }
              }
            }
          )),
        await dispatch(updateUsernameAction(
          usernameData,
          async (response) => {
            if (response.status === 200) {
              const body = {
                pageCount: 'numPerPage',
                searchString: '',
                employeeId: commoncookie,
                headerLocationId: headerLocationId
              }
              await dispatch(userCreationPaginationAction(body))
            }
          }
        )),
          await dispatch(getAppConfigDataAction()),
          await dispatch(getSignature()),
          await dispatch(getusermenus(cookieData))
      );
      setEditOpen(false)
      setForm(true);
      setFormValues({ ...formValues, [name]: checked === true ? 'true' : 'false' });
      if(pageType === 'detailpage') {
        handleNext()        
      }
    }
    else{
      const errorMsg = missingFields.length
        ? 'Please fill the required fields'
        : invalidFields.length
          ? 'Please correct the invalid fields'
          : 'Form has errors';
      dispatch(OpenalertActions({ msg: errorMsg, severity: 'warning' }))
    }
  };

  const RedditTextField = styled((props) => (
    <TextField slotProps={{ input: { disableUnderline: true, readOnly: true } }} {...props} />
  ))(({ theme }) => ({
    '& .MuiFilledInput-root': {
      border: '1px solid #e2e2e1',
      overflow: 'hidden',
      borderRadius: 4,
      backgroundColor: theme.palette.mode === 'light' ? '#fcfcfb' : '#2b2b2b',
      transition: theme.transitions.create([
        'border-color',
        'background-color',
        'box-shadow',
      ]),
      '&:hover': {
        backgroundColor: 'transparent',
      },
      '&.Mui-focused': {
        backgroundColor: 'transparent',
        boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 2px`,
        borderColor: theme.palette.primary.main,
      },
    },
  }));

  const handleCheck = (e) => {
    let { name, checked } = e.target;
    setForm(true);
    let temp = formValues.gps_attendance_radius

    if (name === "gps_attendance" && checked === true) {
      setFormValues({ ...formValues, gps_attendance_radius: 100, gps_attendance: 'true' })
      return
    } else if (name === "gps_attendance" && checked === false) {
      setFormValues({ ...formValues, gps_attendance_radius: 0, gps_attendance: 'false' })
      return
    }
    setFormValues({ ...formValues, [name]: checked === true ? 'true' : 'false' });


  }

  const handleCheckWorkFromHome = (e) => {
    let { name, checked } = e.target;
    setForm(true);
    let temp = formValues.company_enableWorkFromHome

    if (name === "enableWorkFromHome" && checked === true) {
      setFormValues({ ...formValues, [name]: checked === true ? 'true' : 'false' });
      return
    }
  }


  // const handleQrCheck = (e) => {
  //   let { name, checked } = e.target;

  //   new Promise((resolve, reject) => {
  //     setTimeout(() => {        
  //       let newData = {}
  //       let dashboard = getalldashboarddata.map(item => ({
  //         dashboard_id: item.dashboard_id, 
  //         dashboard_name: item.dashboard_name
  //       }));

  //       if (checked === true) {
  //         newData = {
  //           "role_id": storage1?.role_id,
  //           "role_name": storage1?.role_name,
  //           "modules": listrole,
  //           "dashboard": dashboard,
  //           "notifications": pos_pages,
  //           "QR Attendance": true
  //         }
  //       } else {
  //         newData = {
  //           "role_id": storage1?.role_id,
  //           "role_name": storage1?.role_name,
  //           "modules": listrole.filter(item => item.module_name !== "QR Attendance"),
  //           "dashboard": dashboard,
  //           "notifications": pos_pages,
  //           "QR Attendance": false
  //         }
  //       }

  //       // const cookies = new Cookies();
  //       const storage = sessionStorage.getItem('login');
  //       const cookieData = JSON.parse(storage); // Parse the stored JSON string into an object

  //         // Update the 'modules' property
  //         cookieData.modules = newData.modules;

  //         // Update the stored login data
  //         sessionStorage.setItem('login', JSON.stringify(cookieData));

  //         apiCalls(
  //           setModalTypeHandler,
  //           setLoaderStatusHandler,
  //           dispatch(updateRoleAction(storage1?.role_id, newData)),
  //           dispatch(getusermenus(cookieData))
  //         )
  //         resolve(newData);
  //     }, 1000);
  //   }),

  //   setForm(true);
  //   setFormValues({...formValues, [name]: checked === true ? 'true' : 'false'});
  // }

  useEffect(()=>{
    if(editOpen){
      setImageStatus(true)
      setImage(null)
    }
  },[editOpen])
  
  const handlecompanyCreate = async () => {
    const val = storage1?.username;
  let data = {
  first_name: formValues.first_name,
  last_name: formValues.last_name,
  email: formValues.company_email,
  address: formValues.address_fulladdress,
  city: formValues.address_city,
  company_name: formValues.company_name,
  company_type: storage1.company_type,
  confirmPassword: "admin@123",
  country: formValues.address_country,
  gstin: "",
  office_number: formValues.company_phone,
  password: "admin@123",
  phone_number: formValues.company_mobile,
  prefixname: `${val?.split('.').slice(0, -1).join('.') || ''}.a`,
  state: formValues.address_state,
  subscription_type: storage1.subscription_type, 
  trailStartDate: storage1.trailStartDate,
  trailEndDate: storage1.trailEndDate,
  subscriptionEndDate: storage1.subscriptionEndDate,
  subscriptionRemainingDays: storage1.subscriptionRemainingDays,
  isTrial: storage1.isTrial,
  token: "",
  url: "",
  username: `${val?.split('.').slice(0, -1).join('.') || ''}.a.admin`,
  zip: formValues.address_pincode,
  additional_acc: 1,
  is_addacc_enable: 1,
  company_id: storage1?.company_id
};
const res = await dispatch(CreateCompany(data))
console.log('handlecompanycretate', res)
const existKey = res?.existData?.[0] ? Object.keys(res.existData[0])[0] : null;
const existValue = res?.existData?.[0]?.[existKey];
if(res?.status === "exists") {
  setFormValues((prev) => ({...prev, is_addacc_enable: 0}))
  userNameExistAlert(dispatch, `${existKey.replace('_', ' ')} already exists`)
}
 console.log('handlecompany', data, storage1)
 setConfirmOpen(false)
 if(res?.affectedRows > 0){
  setLandingOpen(true)
 }
  }
 console.log('handlecompany22', storage1)

  const handleconfirmclose = () => {
    console.log('companyinfoappconfig1', formValues)
    setConfirmOpen(false)
    setFormValues((prev) => ({...prev, is_addacc_enable: 0}))
    console.log('companyinfoappconfig2', formValues)
  }

  const handleStart = async () => {
  try {
    const db = new DB('pos_session');
    await db.dbDestroy();

    setHeaderLocationIdHandeler("null");

    logout();

    setTimeout(() => {
      if (clientwebsocket?.socket?.readyState === WebSocket.OPEN) {
        clientwebsocket.socket.onclose("", "LOGOUT");
      }
    }, 1000);

    if ("caches" in window) {
      const cacheNames = await caches.keys();
      for (const name of cacheNames) await caches.delete(name);
    }

    const username = `${storage1?.username?.split('.').slice(0, -1).join('.') || ''}.a.admin`

    const encryptPassword = encodeURIComponent("admin@123");
    const signInUrl = `${loginUrl}/signin?username=${username}&password=${encryptPassword}`;

    let formdata = {
        username: username,
        password: "admin@123",
        otp: ""
      }
      const loginApi = await login_services.create(formdata);

      if (loginApi.status === 200 && loginApi.data.from === 'Normal Login') {
        const allowedModules = {
          "Contacts": [],
          "Point Of Sale": [],
          "Purchases": ["Bills", "Payables", "Payments"],
          "Inventory": ["Stocks", "Product Master"],
          "Cash & Bank": ["Cash In Hand"],
          "Settings": [],
        };

        const filteredModules = (loginApi.data.modules || [])
    .filter(mod => allowedModules.hasOwnProperty(mod.module_name))
    .map(mod => {
      const allowedChildren = allowedModules[mod.module_name];
      return {
        ...mod,
        child_modules: allowedChildren.length
          ? (mod.child_modules || []).filter(child =>
              allowedChildren.includes(child.child_module_name)
            )
          : mod.child_modules || [],
      };
    });
    console.log(filteredModules ,'loginiapiiin21')
        if (loginApi.status === 200) {
          const combinedData = {
            ...loginApi.data,
            modules: filteredModules,
            is_addacc_enable: formValues.is_addacc_enable,
            additional_acc: formValues.additional_acc,
          };
                sessionStorage.setItem('login', JSON.stringify(combinedData));
              }
      
              if (loginApi.status === 200) {
      
                    setFirebaseData({
                      user: loginApi.data,
                      isAuthenticated: true,
                      isLoading: false,
                    })
      
                    const subscriptionEndDate = moment(loginApi.data.subscriptionEndDate).format('YYYY-MM-DD');
                    const todayDate = moment(new Date()).format('YYYY-MM-DD');
                    console.log("yesterday", subscriptionEndDate, todayDate);
                    const { company_type, isDetailEntered, role_name } = loginApi.data;
      
                    if (subscriptionEndDate < todayDate) {
                      navigate('/common/subscriptions');
                    }
                    else {
                      navigate('/common/home');
                    }
                    dispatch(getusermenus(loginApi.data));
                    dispatch(fetchSuccess());
      
                    let emp_id = JSON.parse(sessionStorage.getItem('login'))?.employee_id || '';
                    let data = { token: token };
                    let device_name = platform.name
                    let device_version = platform.version
                    let payload = {
                      device_name: device_name,
                      device_version: device_version
                    }
                    console.log(platform, 'platform')
                    initWebSocket(emp_id, loginApi.data.accessToken)
      
                    dispatch(
                      updateUserCreationAction(emp_id, data, (response) => {
      
                        if (response) {
                          dispatch(
                            getLoginRoleAction(emp_id, (role_name, token, content) => {
                              if (!roleType.includes(role_name)) {
                                let notify_type = notificationType('login');
                                let notify_content = content?.filter(
                                  (m) => m.notification_type === notify_type,
                                );
                                if (notify_content.length) {
                                  let loginName = JSON.parse(sessionStorage.getItem('login'))?.first_name || '';
                                  let content_body = ` ${loginName} \n${notify_content[0]?.body_msg}`;
      
                                  sendNtfy(
                                    token,
                                    notify_content[0]?.title,
                                    content_body
                                  );
                                  dispatch(CreateNotificationAction({ content_body: content_body, title: notify_content[0]?.title, time: getDateTimeFormat(new Date()), "active": "1" }))
                                }
                              }
                            }),
                          );
                        }
                      }),
                    );
                    dispatch(listUserlocationsAction(emp_id));
                    dispatch(LastActivedateAction(payload, emp_id))
                    console.log('emppppppp', emp_id)
                    login_services.setLogindate(emp_id);
                  }
            }

    console.log("Redirecting", signInUrl);

    setTimeout(() => {
      // window.location.href = signInUrl;
      
    }, 2000);
    // setDetailDialog(true);

  } catch (error) {
    console.error("Error during logout/auto sign-in redirect:", error);
  }
};

  const handleDialogClose = () => {
    setLandingOpen(false)
    setDetailDialog(false)
  }

  const scrollLayoutSx = getSinglePageScrollLayoutSx(
    pageType === 'detailpage' ? 220 : 140,
  );

  const companyInfoEdit = UserRightsAuthorization(menuAccess[selectedRole], 'info__general', 'can_edit')

 // console.log('SignatureAvatarViewWrapper', formValues['company_type']);


  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | Company Info </title>
      </Helmet>
      <Dialog
        open={invoiceDetail}
        onClose={cancelInvoiceDetails}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>
          {'Are you sure?'}
        </DialogTitle>
        <DialogContent style={{width: 500}}>
          <DialogContentText
            id='alert-dialog-description'
            sx={{color: 'warning.main'}}
          >
            If you Enabled the E-invoice then you can't disable it again.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelInvoiceDetails} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleAddInvoiceDetails} color='primary' autoFocus>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>
          {'This is your username and password'}
        </DialogTitle>
        <DialogContent style={{width: 500}}>
          <DialogContentText
            id='alert-dialog-description'
            sx={{color: 'warning.main'}}
          >
            <Grid container spacing={2}>
            <Grid
              size={{
                lg: 6,
                md: 6,
                sm: 6,
                xs: 12
              }}>
                  <RedditTextField
                    label='Username'
                    defaultValue={`${storage1?.username?.split('.').slice(0, -1).join('.') || ''}.a.admin`}
                    id='reddit-input'
                    variant='filled'
                    // style={{ marginTop: 11 }}
                    fullWidth
                  />
                </Grid>
            <Grid
              size={{
                lg: 6,
                md: 6,
                sm: 6,
                xs: 12
              }}>
                  <RedditTextField
                    label='Password'
                    defaultValue={'admin@123'}
                    id='reddit-input'
                    variant='filled'
                    // style={{ marginTop: 11 }}
                    fullWidth
                  />
                </Grid>
                </Grid>
                <br/>
                Are you sure you want to create a additional account?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleconfirmclose} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handlecompanyCreate} color='primary' autoFocus>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
                fullScreen
                style={{ margin: '10px' }}
                open={landingOpen}
                onClose={(event, reason) => {
                  if (reason === 'backdropClick') {
                    return;
                  }
                  setLandingOpen(false)
                }}
              >
                <LandingPage handleStart={handleStart} />
              </Dialog>
      <Dialog
        fullScreen
        style={{ margin: '10px' }}
        open={detailDialog}
        onClose={(event, reason) => {
          if (reason === 'backdropClick') {
            return;
          }
          setDetailDialog(false)
        }}
        disableEscapeKeyDown >
        <DetailPage handleClose={handleDialogClose} />
      </Dialog>
      <Dialog
        open={addInvoiceDetail}
        onClose={() => setAddInvoiceDetail(false)}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>
          {'E-Invoice'}
        </DialogTitle>
        <DialogContent style={{ width: 500 }}>
          {/* <DialogContentText
            id='alert-dialog-description'
            sx={{ color: 'warning.main' }}
          > */}
            <Grid container spacing={2}>
            <Grid
              size={{
                lg: 6,
                md: 6,
                sm: 6,
                xs: 6
              }}>
              <TextField
                onChange={handleChange}
                onBlur={handleChange}
                fullWidth={true}
                label='E invoice User Name'
                name='company_einvoice_user_name'
                value={formValues['company_einvoice_user_name']}
                // value={{name: formValues['company_einvoice_user_name'] || ''}}
                disabled={formValues.company_einvoice == 0}
                color='primary'
                type='text'
                regex=''
                variant='filled'
              />
            </Grid>

            <Grid
              size={{
                lg: 6,
                md: 6,
                sm: 6,
                xs: 6
              }}>
              <TextField
                onChange={handleChange}
                onBlur={handleChange}
                fullWidth={true}
                label='E invoice Password'
                name='company_einvoice_password'
                value={formValues['company_einvoice_password']}
                // value={{name: formValues['company_einvoice_password'] || ''}}
                disabled={formValues.company_einvoice == 0}
                color='primary'
                type='text'
                regex=''
                variant='filled'
              />
            </Grid>

            <Grid
              size={{
                lg: 6,
                md: 6,
                sm: 6,
                xs: 6
              }}>
              <TextField
                onChange={handleChange}
                onBlur={handleChange}
                required={true}
                style={{}}
                fullWidth={true}
                placeholder='Gst Number'
                label='E invoice Gstin'
                name='company_einvoice_gstin'
                value={
                  formValues.company_einvoice_gstin === null ? '' : formValues.company_einvoice_gstin
                }
                disabled={formValues.company_einvoice == 0}
                color='primary'
                type='text'
                // regex='/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]{3}$/'
                variant='filled'
                error={!!formErrors.company_einvoice_gstin}
                helperText={formErrors.company_einvoice_gstin === '' ? '' : formErrors.company_einvoice_gstin}
              />
              </Grid>
            </Grid>
          {/* </DialogContentText> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelInvoiceDetails} variant='contained' color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleInvoiceSubmit} variant='contained' color='primary' autoFocus>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      {pageType !== 'detailpage' && editOpen === false ? (
        // <Grid
        //  container
        //   style={{
        //     maxHeight: '80vh', 
        //     padding: '16px',
        //     overflowY: 'auto'
        //   }}>
       (
      //  <div style={{ overflowY: 'auto', padding: '16px', maxHeight: '80vh',border: 'none'}}>
      //    <Paper sx={{ padding: '20px', boxShadow: 'none', border: 'none' }} elevation={0}>
      <Grid
      container
      sx={{
        ...scrollLayoutSx,
        p: 2,
      }}>
      <Grid
               display='flex'
               justifyContent='space-between'
               size={{
                 lg: 12,
                 md: 12,
                 sm: 12,
                 xs: 12
               }}>
               <Typography
                 className='page-title'
                 align='left'
                 variant='h6'
                 sx={{
                   paddingTop: '15px',
                   paddingBottom: '15px',
                 }}
               >
                 Company Info
               </Typography>
               {
                companyInfoEdit &&
                <CommonToolTip title='Edit'>
                  <IconButton
                    sx={{height: '100%', weight: '100%'}}
                    onClick={() => {
                      setPasswordDialogOpen(false);
                      setOpenDialog(false);
                      setEditOpen(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </CommonToolTip>
               }
             </Grid>

             <Box sx={singlePageScrollContentSx}>
             <Grid
               size={{
                 lg: 12,
                 md: 12,
                 sm: 12,
                 xs: 12
               }}>
               <Grid
                 container
                 style={{paddingTop: '10px'}}
                 spacing={7}
                 direction='row'
               >
                 <Grid
                   size={{
                     lg: 3,
                     md: 4,
                     sm: 6,
                     xs: 12
                   }}>
                   <RedditTextField
                     label='First Name'
                     defaultValue={formValues['first_name']}
                     id='reddit-input'
                     variant='filled'
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                 </Grid>

                 <Grid
                   size={{
                     lg: 3,
                     md: 4,
                     sm: 6,
                     xs: 12
                   }}>
                   <RedditTextField
                     label='Last Name'
                     defaultValue={formValues['last_name']}
                     id='reddit-input'
                     variant='filled'
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                 </Grid>

                 <Grid
                   size={{
                     lg: 3,
                     md: 4,
                     sm: 6,
                     xs: 12
                   }}>
                   <RedditTextField
                     label='Company Name'
                     defaultValue={formValues['company_name']}
                     id='reddit-input'
                     variant='filled'
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                   {/* <TextField
                     onChange={handleChange}
                     onBlur={handleChange}
                     style={{}}
                     fullWidth={true}
                     //placeholder='Company Name'
                     label='Company Name'
                     name='company_name'
                     value={formValues['company_name']}
                     color='primary'
                     type='text'
                     regex=''
                     variant='outlined'
                     required={true}
                     error={formErrors.company_name === '' ? false : true}
                     helperText={
                       formErrors.company_name === ''
                         ? ''
                         : formErrors.company_name
                     }
                   /> */}
                 </Grid>

                 <Grid
                   size={{
                     lg: 3,
                     md: 4,
                     sm: 6,
                     xs: 12
                   }}>
                   <RedditTextField
                     label='Company Type'
                     defaultValue={formValues['company_type']}
                     id='reddit-input'
                     variant='filled'
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                 </Grid>

                 {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                 <RedditTextField
                     label="Company URL"
                     defaultValue={formValues['web_base_url']}
                     id="company-url-input"
                     variant="filled"
                     // style={{ marginTop: 11 }}
                     fullWidth
                   /> */}
                 {/* <TextField
                     onChange={handleChange}
                     onBlur={handleChange}
                     style={{}}
                     fullWidth={true}
                     //placeholder='Company URL'
                     label='Company URL'
                     name='web_base_url'
                     value={formValues['web_base_url']}
                     color='primary'
                     type='text'
                     regex=''
                     variant='outlined'
                     required={true}
                     error={formErrors.web_base_url === '' ? false : true}
                     helperText={
                       formErrors.web_base_url === ''
                         ? ''
                         : formErrors.web_base_url
                     }
                   /> */}
                 {/* </Grid> */}

                 <Grid
                   size={{
                     lg: 3,
                     md: 4,
                     sm: 6,
                     xs: 12
                   }}>
                   <RedditTextField
                     label='GST Registration'
                     defaultValue={
                       formValues.gst_registration ? 'Enabled' : 'Disabled'
                     }
                     id='reddit-input'
                     variant='filled'
                     fullWidth
                   />
                 </Grid>

                 <Grid
                   size={{
                     lg: 3,
                     md: 4,
                     sm: 6,
                     xs: 12
                   }}>
                   <RedditTextField
                     label='Company Email'
                     defaultValue={formValues['company_email']}
                     id='reddit-input'
                     variant='filled'
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                   {/* <TextField
                     onChange={handleChange}
                     onBlur={handleChange}
                     style={{}}
                     fullWidth={true}
                     //placeholder='Company Email'
                     label='Company Email'
                     name='company_email'
                     value={formValues['company_email']}
                     color='primary'
                     type='email'
                     regex='/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/'
                     variant='outlined'
                     required={true}
                     error={formErrors.company_email === '' ? false : true}
                     helperText={
                       formErrors.company_email === ''
                         ? ''
                         : formErrors.company_email
                     }
                   /> */}
                 </Grid>

                 <Grid
                   size={{
                     lg: 3,
                     md: 4,
                     sm: 6,
                     xs: 12
                   }}>
                   <RedditTextField
                     label='Company Mobile'
                     defaultValue={formValues['company_mobile']}
                     id='reddit-input'
                     variant='filled'
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                   
                 </Grid>

                 <Grid
                   size={{
                     lg: 3,
                     md: 4,
                     sm: 6,
                     xs: 12
                   }}>
                   <RedditTextField
                     label='Company Phone'
                     defaultValue={formValues['company_phone']}
                     id='reddit-input'
                     variant='filled'
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                   
                 </Grid>

                 <Grid
                   size={{
                     lg: 3,
                     md: 4,
                     sm: 6,
                     xs: 12
                   }}>
                   <RedditTextField
                     label='Company GST'
                     defaultValue={formValues['company_gstin_uin']}
                     id='reddit-input'
                     variant='filled'
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                 </Grid>
 {/* 
                 <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                   <RedditTextField
                     label='Account Name'
                     defaultValue={formValues['account_number']}
                     id='reddit-input'
                     variant='filled'
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                 </Grid> */}

                 {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                   <RedditTextField
                     label='Description'
                     defaultValue={formValues['description']}
                     id='reddit-input'
                     variant='filled'
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                 </Grid> */}
                 {storage1.company_type === 5  ? (
                   <>
                 <Grid
                   size={{
                     lg: 3,
                     md: 4,
                     sm: 6,
                     xs: 12
                   }}>
                   <RedditTextField
                     label='Tan'
                     defaultValue={formValues['tan']}
                     id='reddit-input'
                     variant='filled'
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                 </Grid>
                 <Grid
                   size={{
                     lg: 3,
                     md: 4,
                     sm: 6,
                     xs: 12
                   }}>
                   <RedditTextField
                     label='Pan'
                     defaultValue={formValues['pan']}
                     id='reddit-input'
                     variant='filled'
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                 </Grid>
                 </>
              ) : ''}
                 <Grid
                   size={{
                     lg: 3.8,
                     md: 4.5,
                     sm: 6.1,
                     xs: 12
                   }}>
                   {/* <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }}> */}
                   <Card
                     // variant='outlined'
                     style={{
                       width: '100%',
                       height: '11rem',
                       padding: '15px 0px 10px 0px',
                       borderRadius: '50px',
                       backgroundColor: '#f5f5f5',
                     }}
                   >
                     <Grid
                       sx={{
                         display: 'flex',
                         justifyContent: 'left',
                         padding: '0px 0px 0px 10px',
                       }}
                     >
                       <Typography sx={{fontSize: '14px'}}>
                         Company Logo
                       </Typography>
                     </Grid>
                     <Grid
                       sx={{
                         minHeight: 19,
                         display: 'flex',
                         justifyContent: 'center',
                         paddingBottom: '5px',
                       }}
                     >
                       {/* <AvatarViewWrapper > */}
                       <label htmlFor='icon-button-file'>
                         <img
                           style={{
                             width: '200px',
                             height: '120px',
                             objectFit: 'contain', // This works only if you set this property on the Box
                           }}
                           src={company_logo ? company_logo[0]?.image : ''}
                           // variant="square"
                         />
                       </label>
                       {/* </AvatarViewWrapper> */}
                     </Grid>
                   </Card>
                   {/* </Grid>                 */}
                 </Grid>

                 {/* <Grid size={{ xs: 12, sm: 5.9, md: 4.5, lg: 3.8 }}>
                   {/* <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }}> */}
                   {/* <Card
                     // variant='outlined'
                     style={{
                       width: '100%',
                       height: '11rem',
                       padding: '15px 0px 10px 0px',
                       borderRadius: '50px',
                       backgroundColor: '#f5f5f5',
                     }}
                   >
                     <Grid
                       sx={{
                         display: 'flex',
                         justifyContent: 'left',
                         padding: '0px 0px 0px 10px',
                       }}
                     >
                       <Typography sx={{fontSize: '14px'}}>Signature</Typography>
                     </Grid>
                     <Grid
                       sx={{
                         minHeight: 19,
                         display: 'flex',
                         justifyContent: 'center',
                         paddingBottom: '5px',
                       }}
                     > */}
                       {/* <AvatarViewWrapper>
                         <label htmlFor='icon-button-file'> */}
                           {/* <Avatar
                             sx={{
                               width: {xs: 120, sm: 120, md: 120, lg: 120},
                               height: {xs: 120, sm: 120, md: 120, lg: 120},
                               cursor: 'pointer',
                             }}
                             src={signature ? signature[0]?.image : ''}
                             variant='square'
                           /> */}
 {/* 
 <img
                           style={{
                             width: '250px',
                             height: '120px',
                             objectFit: 'contain', // This works only if you set this property on the Box
                           }}
                           src={signature ? signature[0]?.image : ''}

                           // variant="square"
                         />
                         </label>
                       </AvatarViewWrapper>
                     </Grid>
                   </Card> */}
                   {/* </Grid>                 */}
                 {/* </Grid> */}

                 {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                 <RedditTextField
                     label="Company GST"
                     defaultValue={formValues['company_gstin_uin']}
                     id="company-gst-input"
                     variant="filled"
                     // style={{ marginTop: 11 }}
                     fullWidth
                   /> */}
                 {/* <TextField
                     onChange={handleChange}
                     onBlur={handleChange}
                     style={{}}
                     fullWidth={true}
                     //placeholder='Company GST'
                     label='Company GST'
                     name='company_gstin_uin'
                     value={formValues['company_gstin_uin']}
                     color='primary'
                     type='text'
                     regex=''
                     variant='outlined'
                     required={true}
                     error={formErrors.company_gstin_uin === '' ? false : true}
                     helperText={
                       formErrors.company_gstin_uin === ''
                         ? ''
                         : formErrors.company_gstin_uin
                     }
                   /> */}
                 {/* </Grid> */}
                  {(storage1?.company_type !== 5 && storage1?.company_type !== 9 && 
                 <Grid
                   size={{
                     lg: 12,
                     md: 12,
                     sm: 12,
                     xs: 12
                   }}>
                  <Billingaddress />
                 </Grid>
                  )}
                 

                 <Grid
                   size={{
                     lg: 12,
                     md: 12,
                     sm: 12,
                     xs: 12
                   }}>
                   <Typography align='left' variant='h6'>
                     Bank Account Details
                   </Typography>
                 </Grid>

                 <Grid
                   size={{
                     lg: 3,
                     md: 4,
                     sm: 6,
                     xs: 12
                   }}>
                   <RedditTextField
                     label='Bank Account Name'
                     defaultValue={formValues['company_bank_account_name']}
                     id='reddit-input'
                     variant='filled'
                     fullWidth
                   />
                 </Grid>
                            
                 <Grid
                   size={{
                     lg: 3,
                     md: 4,
                     sm: 6,
                     xs: 12
                   }}>
                   <RedditTextField
                     label='Bank Account No'
                     defaultValue={formValues['company_account_number']}
                     id='reddit-input'
                     variant='filled'
                     fullWidth
                   />
                 </Grid>

                 <Grid
                   size={{
                     lg: 3,
                     md: 4,
                     sm: 6,
                     xs: 12
                   }}>
                   <RedditTextField
                     label='Bank Name'
                     defaultValue={formValues['company_bank_name']}
                     id='reddit-input'
                     variant='filled'
                     fullWidth
                   />
                 </Grid>
                 <Grid
                   size={{
                     lg: 3,
                     md: 4,
                     sm: 6,
                     xs: 12
                   }}>
                   <RedditTextField
                     label='Branch Address'
                     defaultValue={formValues['company_branch_address']}
                     id='reddit-input'
                     variant='filled'
                     fullWidth
                   />
                 </Grid>
                 <Grid
                   size={{
                     lg: 3,
                     md: 4,
                     sm: 6,
                     xs: 12
                   }}>
                   <RedditTextField
                     label='IFSC Code'
                     defaultValue={formValues['company_ifsc_code']}
                     id='reddit-input'
                     variant='filled'
                     fullWidth
                   />
                   </Grid>


                 <Grid
                   size={{
                     lg: 12,
                     md: 12,
                     sm: 12,
                     xs: 12
                   }}>
                   <Typography align='left' variant='h6'>
                     Primary Address
                   </Typography>
                 </Grid>

                 <Grid
                   size={{
                     lg: 3,
                     md: 4,
                     sm: 6,
                     xs: 12
                   }}>
                   <RedditTextField
                     label='Company Full Address'
                     defaultValue={formValues['address_fulladdress']}
                     id='reddit-input'
                     variant='filled'
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                   {/* <TextField
                     onChange={handleChange}
                     onBlur={handleChange}
                     style={{}}
                     fullWidth={true}
                     //placeholder='Company Full Address'
                     label='Company Full Address'
                     name='address_fulladdress'
                     value={formValues['address_fulladdress']}
                     color='primary'
                     type='text'
                     regex=''
                     variant='outlined'
                     required={true}
                     selectOnFocus
                     clearOnBlur
                     handleHomeEndKeys
                     freeSolo
                     error={formErrors.address_fulladdress === '' ? false : true}
                     helperText={
                       formErrors.address_fulladdress === ''
                         ? ''
                         : formErrors.address_fulladdress
                     }
                   /> */}
                 </Grid>

                 {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                 <RedditTextField
                     label="Company Street"
                     defaultValue={formValues['address_street']}
                     id="company-street-input"
                     variant="filled"
                     // style={{ marginTop: 11 }}
                     fullWidth
                   /> */}
                 {/* <TextField
                     onChange={handleChange}
                     onBlur={handleChange}
                     style={{}}
                     fullWidth={true}
                     //placeholder='Company Street'
                     label='Company Street'
                     name='address_street'
                     value={formValues['address_street']}
                     color='primary'
                     type='text'
                     regex=''
                     variant='outlined'
                     required={true}
                     error={formErrors.address_street === '' ? false : true}
                     helperText={
                       formErrors.address_street === ''
                         ? ''
                         : formErrors.address_street
                     }
                   /> */}
                 {/* </Grid> */}

                 <Grid
                   size={{
                     lg: 3,
                     md: 4,
                     sm: 6,
                     xs: 12
                   }}>
                   <RedditTextField
                     label='Company Area'
                     defaultValue={formValues['address_area']}
                     id='reddit-input'
                     variant='filled'
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                 </Grid>
                 {/* <TextField
                     onChange={handleChange}
                     onBlur={handleChange}
                     style={{}}
                     fullWidth={true}
                     //placeholder='Company Area'
                     label='Company Area'
                     name='address_area'
                     value={formValues['address_area']}
                     color='primary'
                     type='text'
                     regex=''
                     variant='outlined'
                     required={true}
                     error={formErrors.address_area === '' ? false : true}
                     helperText={
                       formErrors.address_area === ''
                         ? ''
                         : formErrors.address_area
                     }
                   /> */}
                 {/* </Grid> */}

                 <Grid
                   size={{
                     lg: 3,
                     md: 4,
                     sm: 6,
                     xs: 12
                   }}>
                   <RedditTextField
                     label='Company Latitude'
                     defaultValue={formValues['company_latitude']}
                     id='reddit-input'
                     variant='filled'
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                 </Grid>

                 <Grid
                   size={{
                     lg: 3,
                     md: 4,
                     sm: 6,
                     xs: 12
                   }}>
                   <RedditTextField
                     label='Company Longitude'
                     defaultValue={formValues['company_longitude']}
                     id='reddit-input'
                     variant='filled'
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                 </Grid>

                 <Grid
                   size={{
                     lg: 3,
                     md: 4,
                     sm: 6,
                     xs: 12
                   }}>
                   <RedditTextField
                     label='Company Pincode'
                     defaultValue={
                       formValues.address_pincode === null
                         ? ''
                         : formValues.address_pincode
                     }
                     id='reddit-input'
                     variant='filled'
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                   {/* <TextField
                     onChange={handleChange}
                     onBlur={handleChange}
                     style={{}}
                     fullWidth={true}
                     //placeholder='Company Pincode'
                     label='Company Pincode'
                     name='address_pincode'
                     value={
                       formValues.address_pincode === null
                         ? ''
                         : formValues.address_pincode
                     }
                     color='primary'
                     type='text'
                     regex=''
                     variant='outlined'
                     required={true}
                     error={formErrors.address_pincode === '' ? false : true}
                     helperText={
                       formErrors.address_pincode === ''
                         ? ''
                         : formErrors.address_pincode
                     }
                   /> */}
                 </Grid>

                 <Grid
                   size={{
                     lg: 3,
                     md: 4,
                     sm: 6,
                     xs: 12
                   }}>
                   <RedditTextField
                     label='City'
                     defaultValue={formValues['address_city']}
                     id='reddit-input'
                     variant='filled'
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                   {/* <Autocomplete
                     fullWidth={true}
                     value={{name: formValues['address_city']}}
                     name='address_city'
                     onChange={(e, val) =>
                       val !== ''
                         ? setFormValues({
                             ...formValues,
                             address_city: val.name,
                             address_state: val.state,
                           })
                         : ''
                     }
                     options={[...Cities]}
                     getOptionLabel={(city) => city.name}
                     selectOnFocus
                     clearOnBlur
                     handleHomeEndKeys
                     freeSolo
                     // isOptionEqualToValue={(option, value) =>
                     //   option.name === value.name
                     // }
                     renderInput={(params) => (
                       <TextField
                         {...params}
                         label='city'
                         variant='outlined'
                         error={formErrors.address_city === '' ? false : true}
                         helperText={
                           formErrors.address_city === ''
                             ? ''
                             : formErrors.address_city
                         }
                         required={true}
                       />
                     )}
                   /> */}
                 </Grid>

                 <Grid
                   size={{
                     lg: 3,
                     md: 4,
                     sm: 6,
                     xs: 12
                   }}>
                   <RedditTextField
                     label='State'
                     defaultValue={formValues['address_state']}
                     id='reddit-input'
                     variant='filled'
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                   {/* <Autocomplete
                     fullWidth={true}
                     name='address_state'
                     value={{state: formValues['address_state']}}
                     options={_.uniqBy(Cities, 'state')}
                     getOptionLabel={(options) => options.state}
                     onChange={(e, v) =>
                       v !== ''
                         ? setFormValues({
                             ...formValues,
                             address_state: v.state,
                             address_city: '',
                           })
                         : ''
                     }
                     autoHighlight={true}
                     // isOptionEqualToValue={(option, value) => option.state === value}
                     renderInput={(params) => (
                       <TextField
                         {...params}
                         label='State'
                         variant='outlined'
                         error={formErrors.address_state === '' ? false : true}
                         helperText={
                           formErrors.address_state === ''
                             ? ''
                             : formErrors.address_state
                         }
                         required={true}
                       />
                     )}
                   /> */}
                 </Grid>

                 <Grid
                   size={{
                     lg: 3,
                     md: 4,
                     sm: 6,
                     xs: 12
                   }}>
                   <RedditTextField
                     label='Country'
                     defaultValue={formValues.address_country}
                     id='reddit-input'
                     variant='filled'
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                   {/* <Autocomplete
                     fullWidth={true}
                     name='address_country'
                     value={{name: formValues.address_country}}
                     options={Country}
                     getOptionLabel={(options) => options.name}
                     autoHighlight={true}
                     renderInput={(params) => (
                       <TextField
                         {...params}
                         label='Country'
                         variant='outlined'
                         error={formErrors.address_country === '' ? false : true}
                         helperText={
                           formErrors.address_country === ''
                             ? ''
                             : formErrors.address_country
                         }
                         required={true}
                       />
                     )}
                   /> */}
                 </Grid>

                 <Grid
                   size={{
                     lg: 12,
                     md: 12,
                     sm: 12,
                     xs: 12
                   }}>
                   <Typography align='left' variant='h6'>
                     User Info
                   </Typography>
                 </Grid>

                 <Grid
                   size={{
                     lg: 3,
                     md: 4,
                     sm: 6,
                     xs: 12
                   }}>
                   <RedditTextField
                     label='Super Admin'
                     defaultValue={formValues['admin_userName']}
                     id='reddit-input'
                     variant='filled'
                     fullWidth
                   />
                 </Grid>
                 
                 {(storage1?.company_type === 2 && addAcc == 0) && <> <Grid
                   size={{
                     lg: 12,
                     md: 12,
                     sm: 12,
                     xs: 12
                   }}>
                   <Typography align='left' variant='h6'>
                     Additional Account
                   </Typography>
                 </Grid>

                 <Grid
                   size={{
                     lg: 3,
                     md: 4,
                     sm: 6,
                     xs: 12
                   }}>
                   <RedditTextField
                     label='Additional Account'
                     defaultValue={ formValues.is_addacc_enable === "1" ? 'Enabled' : 'Disabled' }
                     id='reddit-input'
                     variant='filled'
                     fullWidth
                   />
                 </Grid> </>}

                 {(storage1?.company_type === 2 && (storage1?.subscription_type == 7 || storage1?.subscription_type == 8) || storage1?.company_type === 3 && (storage1?.subscription_type == 19 || storage1?.subscription_type == 20)) &&
                   (<>
                     <Grid
                       size={{
                         lg: 12,
                         md: 12,
                         sm: 12,
                         xs: 12
                       }}>
                       <Typography align='left' variant='h6'>
                        Company Invoice
                       </Typography>
                     </Grid>

                     <Grid
                       size={{
                         lg: 3,
                         md: 4,
                         sm: 6,
                         xs: 12
                       }}>
                       <RedditTextField
                         label='E invoice'
                         defaultValue={
                           formValues.company_einvoice == 1 ? 'Enabled' : 'Disabled'
                         }
                         id='reddit-input'
                         variant='filled'
                         fullWidth
                       />
                     </Grid>

                     <Grid
                       size={{
                         lg: 3,
                         md: 4,
                         sm: 6,
                         xs: 12
                       }}>
                       <RedditTextField
                         label='TCS & TDS'
                         defaultValue={
                           formValues.company_tcs_tds == '1' ? 'Enabled' : 'Disabled'
                         }
                         id='reddit-input'
                         variant='filled'
                         fullWidth
                       />
                     </Grid>
                     {Number(formValues.company_einvoice) !== 0 && <>
                     <Grid
                       size={{
                         lg: 3,
                         md: 4,
                         sm: 6,
                         xs: 12
                       }}>
                       <RedditTextField
                         label='E invoice User Name'
                         defaultValue={formValues['company_einvoice_user_name']}
                         id='reddit-input'
                         variant='filled'
                         fullWidth
                       />
                     </Grid>

                     <Grid
                       size={{
                         lg: 3,
                         md: 4,
                         sm: 6,
                         xs: 12
                       }}>
                       <RedditTextField
                         label='E invoice Password'
                         defaultValue={formValues['company_einvoice_password']}
                         id='reddit-input'
                         variant='filled'
                         fullWidth
                       />
                       </Grid>
                       
                     

                     <Grid
                       size={{
                         lg: 3,
                         md: 4,
                         sm: 6,
                         xs: 12
                       }}>
                       <RedditTextField
                         label='E invoice Gstin'
                         defaultValue={formValues['company_einvoice_gstin']}
                         id='reddit-input'
                         variant='filled'
                         fullWidth
                       />
                     </Grid>
                     </> }

                     {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                       <RedditTextField
                         label='Einvoice ClientId'
                         defaultValue={formValues['company_einvoice_clientId']}
                         id='reddit-input'
                         variant='filled'
                         fullWidth
                       />
                     </Grid>

                     <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                       <RedditTextField
                         label='Client Secret'
                         defaultValue={formValues['company_clientSecret']}
                         id='reddit-input'
                         variant='filled'
                         fullWidth
                       />
                     </Grid> */}
                   </>)}

 {/* 
                 <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                   <RedditTextField
                     label='Password'
                     defaultValue={formValues['superAdmin_password']}
                     value ={maskedPassword}
                     id='reddit-input'
                     variant='filled'
                     type="password"
                     fullWidth
                   />
                 </Grid> */}

 {/* 
                 {formValues['frontDesk_password'] && (
                   <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                     <RedditTextField
                       label='Password'
                       defaultValue={formValues['frontDesk_password']}
                       value ={maskedPassword}
                       id='reddit-input'
                       variant='filled'
                       type="password"
                       fullWidth
                     />
                   </Grid>
                 )} */}
                 {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                   <RedditTextField
                     label="Over Time"
                     defaultValue={formValues.company_overtimeAllowance === 'true' ? 'Enabled' : 'Disabled'}
                     id="over-time-input"
                     variant="filled"
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                 </Grid> */}
                 {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
                   item
                 >
                   <Typography
                     align='left'
                     variant='h6'
                   >
                     Payroll
                   </Typography>
                 </Grid> */}

                 {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                   <RedditTextField
                     label="Privilege Leaves"
                     defaultValue={formValues['company_privilegeLeave']}
                     id="privilege-leaves-input"
                     variant="filled"
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                 </Grid> */}

                 {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                   <RedditTextField
                     label="Enable Carry Forward PL"
                     defaultValue={formValues.company_privilegeLeaveCarryForward === 'true' ? 'Enabled' : 'Disabled'}
                     id="enable-carry-forward-pl-input"
                     variant="filled"
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                 </Grid> */}

                 {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                   <RedditTextField
                     label="Privilege Leaves Max Limit"
                     defaultValue={formValues['company_privilegeLeaveMaxLimit']}
                     id="privilege-leaves-max-limit-input"
                     variant="filled"
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                 </Grid> */}

                 {/* 
                 <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                   item
                   sx={{
                     display: { xs: "none", lg: "block" }
                   }}
                 >
                   <span></span>
                 </Grid> */}

                 {/* 
                 <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                   <RedditTextField
                     label="Enable GPS Attendance"
                     defaultValue={formValues.gps_attendance === 'true' ? 'Enabled' : 'Disabled'}
                     id="enable-gps-attendance-input"
                     variant="filled"
                     fullWidth
                   />
                 </Grid>

                 <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                   <RedditTextField
                     label="GPS Attendance Radius"
                     defaultValue={formValues['gps_attendance'] === 'true' ? formValues['gps_attendance_radius'] : ''}
                     id="gps-attendance-radius-input"
                     variant="filled"
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                 </Grid>

                 <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                   <RedditTextField
                     label="Enable Live Location"
                     defaultValue={formValues.company_enableLiveLocation === 'true' ? 'Enabled' : 'Disabled'}
                     id="enable-live-location-input"
                     variant="filled"
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                 </Grid>




                 <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                   <RedditTextField
                     label="Live Tracking Interval"
                     defaultValue={ formValues.company_enableLiveLocation === 'true' ?
                       formValues['company_liveTrackingInterval'] === '15s' ? '15 sec' :
                         formValues['company_liveTrackingInterval'] === '30s' ? '30 sec' :
                           `${parseInt(formValues['company_liveTrackingInterval']) / 60} min` : ''
                     }
                     id="companyinfo-field-3540-input"
                     variant="filled"
                     fullWidth
                   />
                 </Grid> */}

                 {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                   <RedditTextField
                     label="Domain"
                     defaultValue={host}
                     id="domain-input"
                     variant="filled"
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                 </Grid> */}
                 {/* 
                 <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                   <RedditTextField
                     label="Enable Selfie Attendance"
                     defaultValue={formValues.selfie_attendance === 'true' ? 'Enabled' : 'Disabled'}
                     id="enable-selfie-attendance-input"
                     variant="filled"
                     fullWidth
                   />
                 </Grid>

                 <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                   <RedditTextField
                     label="Enable WIFI Attendance"
                     defaultValue={formValues.wifi_attendance === 'true' ? 'Enabled' : 'Disabled'}
                     id="enable-wifi-attendance-input"
                     variant="filled"
                     fullWidth
                   />
                 </Grid>

                 <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                   <RedditTextField
                     label="Enable QR Attendance"
                     defaultValue={formValues.qr_attendance === 'true' ? 'Enabled' : 'Disabled'}
                     id="enable-qr-attendance-input"
                     variant="filled"
                     fullWidth
                   />
                 </Grid>

                 <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                   <RedditTextField
                     label="Extra Pay For Week OFf"
                     defaultValue={formValues.extra_pay_for_week_off === 'true' ? 'Enabled' : 'Disabled'}
                     id="extra-pay-for-week-off-input"
                     variant="filled"
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                 </Grid> */}

                 {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                   <RedditTextField
                     label="Extra Pay For Holiday"
                     defaultValue={formValues.extra_pay_for_holiday === 'true' ? 'Enabled' : 'Disabled'}
                     id="extra-pay-for-holiday-input"
                     variant="filled"
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                 </Grid> */}

                 {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                   <RedditTextField
                     label="Work From Home"
                     defaultValue={formValues.company_enableWorkFromHome === 'true' ? 'Enabled' : 'Disabled'}
                     id="work-from-home-input"
                     variant="filled"
                     // style={{ marginTop: 11 }}
                     fullWidth
                   />
                 </Grid> */}
               </Grid>

               <Grid
                 style={{marginBottom: '10px', marginTop: '30px'}}
                 size={{
                   lg: 12,
                   md: 12,
                   sm: 12,
                   xs: 12
                 }}></Grid>
             </Grid>
             </Box>
             </Grid>
      //      </Paper>
      //  </div>
      )
        /* // </Grid> */
      ) : (
        <Grid
         container
         sx={{
           ...scrollLayoutSx,
           p: 2,
         }}>
          <Typography
            className='page-title'
            variant='h6'
            align='left'
            style={{paddingTop: '10px', paddingBottom: '10px'}}
          >
            {pageType === 'detailpage' ? 'Company Info' : 'Update Company Info'}
          </Typography>

          <Box sx={singlePageScrollContentSx}>
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}></Grid>

          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Grid
              container
              style={{paddingTop: '10px'}}
              spacing={7}
              direction='row'
            >
              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 6,
                  xs: 12
                }}>
                <TextField
                  onChange={handleChange}
                  onBlur={handleChange}
                  style={{}}
                  fullWidth={true}
                  //placeholder='Company Name'
                  label='First Name'
                  name='first_name'
                  value={formValues['first_name']}
                  color='primary'
                  type='text'
                  regex=''
                  variant='filled'
                  required={true}
                  error={formErrors.first_name === '' ? false : true}
                  helperText={
                    formErrors.first_name === ''
                      ? ''
                      : 'First Name is Required!'
                  }
                />
              </Grid>

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 6,
                  xs: 12
                }}>
                <TextField
                  onChange={handleChange}
                  onBlur={handleChange}
                  style={{}}
                  fullWidth={true}
                  //placeholder='Company Name'
                  label='Last Name'
                  name='last_name'
                  value={formValues['last_name']}
                  color='primary'
                  type='text'
                  regex=''
                  variant='filled'
                  // required={true}
                  // error={formErrors.last_name === '' ? false : true}
                  // helperText={
                  //   formErrors.last_name === ''
                  //     ? ''
                  //     : 'Last Name is Required!'
                  // }
                />
              </Grid>

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 6,
                  xs: 12
                }}>
                <TextField
                  onChange={handleChange}
                  onBlur={handleChange}
                  style={{}}
                  fullWidth={true}
                  //placeholder='Company Name'
                  label='Company Name'
                  name='company_name'
                  value={formValues['company_name']}
                  color='primary'
                  type='text'
                  regex=''
                  variant='filled'
                  required={true}
                  error={
                    errors.company_name === 'Company Already Exists'
                      ? true
                      : formErrors.company_name === ''
                      ? false
                      : true
                  }
                  helperText={
                    errors.company_name === 'Company Already Exists'
                      ? 'Company Name Already Exists'
                      : formErrors.company_name === ''
                      ? ''
                      : 'Company Name is Required!'
                  }
                />
              </Grid>

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 6,
                  xs: 12
                }}>
                <TextField
                  label='Company Type'
                  value={formValues['company_type']}
                  id='reddit-input'
                  variant='filled'
                  InputLabelProps={{ shrink: true }}
                  InputProps={{readOnly: true}}
                  fullWidth
                />
                {/* <Autocomplete
                  id='country-select-demo'
                  fullWidth
                  options={_.uniqBy(types, 'company_type')}
                  value={{
                    company_type: formValues.company_type || '',
                  }}
                  name='company_type'
                  autoHighlight
                  selectOnFocus
                  onChange={(_, newValue) => {
                    if (newValue !== null) {
                      setFormValues({
                        ...formValues,
                        company_type: newValue.company_type,
                        company_type_id: newValue.company_type_id,
                      });
                      setFormErrors({
                        ...formErrors,
                        company_type: null,
                      });
                    } else {
                      setFormValues({
                        ...formValues,
                        company_type: null,
                      });
                      setFormErrors({
                        ...formErrors,
                        company_type: 'Please enter company_type!',
                      });
                    }
                  }}
                  getOptionLabel={(type) =>
                    (type && type.company_type) || ''
                  }
                  renderInput={(params) => (
                    <TextField
                      required
                      variant='filled'
                      {...params}
                      label='Company type'
                      error={
                        formValues.company_type !== null
                          ? ''
                          : formErrors.company_type === null
                          ? false
                          : true
                      }
                      helperText={
                        formValues.company_type !== null
                          ? ''
                          : formErrors.company_type === null
                          ? ''
                          : 'Please enter company_type!'
                      }
                    />
                  )}
                /> */}
              </Grid>

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 6,
                  xs: 12
                }}>
                <FormGroup>
                  <FormControlLabel
                    label='GST Registration'
                    control={
                      <Switch
                        name='gst_registration'
                        // defaultChecked={formValues.company_gstin_uin ? true : false }
                        checked={formValues.gst_registration}
                        onChange={handleSwitchChange}
                      />
                    }
                  />
                </FormGroup>
              </Grid>

              {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <TextField
                  onChange={handleChange}
                  onBlur={handleChange}
                  style={{}}
                  fullWidth={true}
                  //placeholder='Company URL'
                  label='Company URL'
                  name='web_base_url'
                  value={formValues['web_base_url']}
                  color='primary'
                  type='text'
                  regex=''
                  variant='filled'
                  required={true}
                  error={formErrors.web_base_url === '' ? false : true}
                  helperText={
                    formErrors.web_base_url === ''
                      ? ''
                      : 'Company URL is Required!'
                  }
                />
              </Grid> */}

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 6,
                  xs: 12
                }}>
                <TextField
                  onChange={handleChange}
                  onBlur={handleChange}
                  style={{}}
                  fullWidth={true}
                  //placeholder='Company Email'
                  label='Company Email'
                  name='company_email'
                  value={formValues['company_email']}
                  color='primary'
                  type='email'
                  regex='/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/'
                  variant='filled'
                  required={true}
                  error={formErrors.company_email === '' ? false : true}
                  helperText={
                    formErrors.company_email === null
                      ? ''
                      : formErrors.company_email
                  }
                />
              </Grid>

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 6,
                  xs: 12
                }}>
                <StyledTextField
                  onChange={handleChange}
                  // onBlur={handleChange}
                  style={{}}
                  fullWidth={true}
                  onWheel={(e) => e.target.blur()}
                  //placeholder='Company Mobile'
                  label='Company Mobile'
                  name='company_mobile'
                  value={formValues['company_mobile']}
                  color='primary'
                  type='number'
                  regex=''
                  variant='filled'
                  required={true}
                  error={formErrors.company_mobile === '' ? false : true}
                  helperText={
                    formErrors.company_mobile === ''
                      ? ''
                      : 'Company Mobile is Required!'
                  }
                />
              </Grid>

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 6,
                  xs: 12
                }}>
                <StyledTextField
                  onChange={handleChange}
                  // onBlur={handleChange}
                  onWheel={(e) => e.target.blur()}
                  style={{}}
                  fullWidth={true}
                  //placeholder='Company Phone'
                  label='Company Phone'
                  name='company_phone'
                  value={formValues['company_phone']}
                  color='primary'
                  type='number'
                  regex=''
                  variant='filled'
                  error={formErrors.company_phone}
                  helperText={
                    formErrors.company_phone 
                  }
                />
              </Grid>

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 6,
                  xs: 12
                }}>
                <TextField
                  onChange={handleChange}
                  onBlur={handleChange}
                  fullWidth
                  label='Company GST'
                  name='company_gstin_uin'
                  value={formValues['company_gstin_uin']}
                  color='primary'
                  type='text'
                  regex=''
                  variant='filled'
                  required={formValues.gst_registration}  
                  disabled={!formValues.gst_registration} 
                  error={
                    formValues.gst_registration === true &&
                    formErrors.company_gstin_uin !== ''
                      ? true
                      : false
                  }
                  helperText={
                    formValues.gst_registration === true &&
                    formErrors.company_gstin_uin !== ''
                      ? 'Company GST is Required!'
                      : ''
                  }
                />
              </Grid>
{/* 
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <TextField
                  onChange={handleChange}
                  onBlur={handleChange}
                  style={{}}
                  fullWidth={true}
                  onWheel={(e) => e.target.blur()}
                  label='Account Number'
                  name='Account Number'
                  value={formValues['account_number']}
                  color='primary'
                  type='number'
                  regex=''
                  variant='filled'
                  // required={true}
                  // error={formErrors.account_number === "" ? false : true}
                  helperText={
                    formErrors.account_number === ''
                      ? ''
                      : formErrors.account_number
                  }
                />
              </Grid> */}

              {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <TextField
                  onChange={handleChange}
                  onBlur={handleChange}
                  style={{}}
                  fullWidth={true}
                  label='Description'
                  name='Description'
                  value={formValues['description']}
                  color='primary'
                  type='text'
                  regex=''
                  variant='filled'
                  // required={true}
                  // error={formErrors.account_number === "" ? false : true}
                  helperText={
                    formErrors.description === '' ? '' : formErrors.description
                  }
                />
              </Grid> */}
              {storage1.company_type === 5 ? (
                <>
              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 6,
                  xs: 12
                }}>
                <TextField
                  onChange={handleChange}
                  onBlur={handleChange}
                  style={{}}
                  fullWidth={true}
                  label='Tan'
                  name='tan'
                  value={formValues['tan']}
                  color='primary'
                  type='text'
                  regex=''
                  variant='filled'
                  // required={true}
                  // error={formErrors.account_number === "" ? false : true}
                  helperText={
                    formErrors.tan === '' ? '' : formErrors.tan
                  }
                />
              </Grid>
              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 6,
                  xs: 12
                }}>
                <TextField
                  onChange={handleChange}
                  onBlur={handleChange}
                  style={{}}
                  fullWidth={true}
                  label='Pan'
                  name='pan'
                  value={formValues['pan']}
                  color='primary'
                  type='text'
                  regex=''
                  variant='filled'
                  // required={true}
                  // error={formErrors.account_number === "" ? false : true}
                  helperText={
                    formErrors.pan === '' ? '' : formErrors.pan
                  }
                />
              </Grid>
               </>
              ) : ''}

              <Grid
                size={{
                  lg: 3.8,
                  md: 4.5,
                  sm: 6.1,
                  xs: 12
                }}>
                {/* <Grid size={{ xs: 6, sm: 6, md: 3.5, lg: 3.5 }}> */}

                <Card
                  // variant='outlined'
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50px',
                    backgroundColor: '#f5f5f5',
                  }}
                >
                  <Grid
                    container
                    display='flex'
                    flexDirection='row'
                    alignItems='center'
                    spacing={2}
                    p={3}
                  >
                    <Grid size={12}>
                      <Typography sx={{fontSize: '14px'}}>
                        Company Logo
                      </Typography>
                    </Grid>
                    <Grid
                      onClick={() => {
                        handesetSaveTrue;
                      }}
                      sx={{
                        minHeight: 19,
                        display: 'flex',
                        justifyContent: 'center',
                        position: 'relative',
                      }}
                      size={12}>
                      <AvatarViewWrapper
                        {...getRootProps({className: 'dropzone'})}
                        // className= 'dropzone'
                      >
                        <input {...getInputProps()}  />
                        <label htmlFor='icon-button-file'>
                          {/* <Avatar
                            sx={{
                              width: {xs: 300, sm: 250, md: 250, lg: 240},
                              height: {xs: 120, sm: 120, md: 120, lg: 120},
                              cursor: 'pointer',
                              bgcolor: 'transparent',
                              padding: '20px',
                              variant: 'square',
                            }}
                            variant='square'
                            src={imageStatus ? company_logo[0]?.image : image}
                            // src={image}
                          /> */}
                          <img
                          style={{
                            width: '250px',
                            height: '120px',
                            objectFit: 'contain', // This works only if you set this property on the Box
                          }}
                          src={imageStatus ? company_logo[0]?.image : image}
                          // variant="square"
                        />
                        <Typography variant='h6' display= 'flex' justifyContent= 'center'>Supported formats .png .jpeg .jpg</Typography>
                          <Box className='edit-icon'>
                            <EditIcon />
                          </Box>

                          {(image !== null || imageStatus) && company_logo[0]?.image && (
                            <Box
                              className='delete-icon'
                              onClick={(e) => {
                                e.stopPropagation();
                                handledelete();
                              }}
                            >
                              <DeleteIcon />
                            </Box>
                          )}
                        </label>
                      </AvatarViewWrapper>

                      <Dialog open={cropImageModal}>
                        <ImageCrop
                          selectedImage={selectedImage}
                          onClose={() => setCropImageModal(false)}
                          onSubmit={(val) => {
                            setImageStatus(false);
                            setImage(val);
                            setCropImageModal(false);
                          }}
                        />
                      </Dialog>
                    </Grid>
                      {!imageStatus &&
                    <Grid sx={{display: 'flex', justifyContent: 'center'}} size={12}>
                      <Alert severity='info'>
                        <Typography sx={{fontSize: '12px'}}>
                          File size should not exceed 400KB.
                        </Typography>
                      </Alert>
                    </Grid>
                       }
                    {isEnabled ? (
                      <Grid sx={{display: 'flex', justifyContent: 'flex-end'}} size={12}>
                        <Button
                          variant='outlined'
                          sx={{
                            height: '2rem',
                            ':hover': {
                              bgcolor: '#0A8FDC',
                              color: 'white',
                            },
                          }}
                          onClick={handleImage}
                        >
                          {'Save'}
                        </Button>
                      </Grid>
                    ) : (
                      <></>
                    )}
                  </Grid>
                </Card>
                {/* </Grid> */}
              </Grid>

              {/* <Grid size={{ xs: 12, sm: 5.9, md: 4.5, lg: 3.8 }}> */}
                {/* <Grid size={{ xs: 6, sm: 6, md: 3.5, lg: 3.5 }}> */}
                {/* <Card
                    // variant='outlined'
                    style={{ width: '100%', height: '100%', borderRadius: '50px', backgroundColor: '#f5f5f5' }}
                  >
                    <Grid container display="flex" flexDirection='row' alignItems='center' spacing={2} p={3}>
                    <Grid size={12}>
                      <Typography sx={{ fontSize: '14px' }}>
                        Signature
                      </Typography>
                    </Grid>
                    <Grid size={12} onClick={() => { handesetSaveTrue }} sx={{ minHeight: 19, display: 'flex', justifyContent: 'center' }}>
                      <AvatarViewWrapper {...getRootProps({ className: 'dropzone'})}>
                        <input {...getInputProps()} />
                        <label htmlFor='icon-button-file'>
                          <Avatar
                            sx={{
                              width: { xs: 120, lg: 280 },
                              height: { xs: 120, lg: 120 },
                              cursor: 'pointer',
                            }}
                            src={imageStatus ? company_logo[0]?.signature : image}
                            variant="square"
                          />
                          <Box className='edit-icon'>
                            <EditIcon />
                          </Box>
                        </label>
                      </AvatarViewWrapper>
                    </Grid>

                      <Grid size={12} sx={{ display: 'flex', justifyContent: 'center'}}>
                      <Alert severity='info'>
                      <Typography sx={{ fontSize: '12px' }}>
                          File size should not exceed 512MB.                            
                      </Typography>
                      </Alert>
                      </Grid>
                      {isEnabled ?
                      (<Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant='outlined' sx={{
                          height: '2rem', ':hover': {
                            bgcolor: '#0A8FDC',
                            color: 'white',
                          },
                        }} onClick={handleImage}>{"Save"}</Button>
                      </Grid>)
                      : <></>}
                    </Grid>                   

                  </Card> */}
                {/* </Grid> */}
                {/* <Signature setForm={setForm} />
              </Grid> */}

              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                  <Typography align='left' variant='h6'>
                    Bank Account Details
                  </Typography>
                </Grid>

                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                <TextField
                  onChange={handleChange}
                  onBlur={handleChange}
                  fullWidth={true}
                  label='Bank Account Name'
                  name='company_bank_account_name'
                  value={formValues['company_bank_account_name']}
                  color='primary'
                  type='text'
                  regex=''
                  variant='filled'
                />
                </Grid>
                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <TextField
                    onChange={handleChange}
                    onBlur={handleChange}
                    fullWidth={true}
                    label='Bank Account No'
                    name='company_account_number'
                    value={formValues['company_account_number']}
                    color='primary'
                    // type='number'
                    // regex=''
                    variant='filled'
                    error={Boolean(formErrors.company_account_number)}
                    helperText={formErrors.company_account_number}
                  />
                </Grid>

              

                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <TextField
                    onChange={handleChange}
                    onBlur={handleChange}
                    fullWidth={true}
                    label='Branch Address'
                    name='company_branch_address'
                    value={formValues['company_branch_address']}
                    color='primary'
                    type='text'
                    regex=''
                    variant='filled'
                  />
                </Grid>

                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <TextField
                    onChange={handleChange}
                    onBlur={handleChange}
                    fullWidth={true}
                    label='IFSC Code'
                    name='company_ifsc_code'
                    value={formValues['company_ifsc_code']}
                    color='primary'
                    type='text'
                    regex=''
                    variant='filled'
                  />
                </Grid>

                  <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <TextField
                    onChange={handleChange}
                    onBlur={handleChange}
                    fullWidth={true}
                    label='Bank Name'
                    name='company_bank_name'
                    value={formValues['company_bank_name']}
                    color='primary'
                    type='text'
                    regex=''
                    variant='filled'
                  />
                </Grid>

              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Typography align='left' variant='h6'>
                  Location
                </Typography>
              </Grid>

              {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <TextField
                  onChange={handleChange}
                  onBlur={handleChange}
                  style={{}}
                  fullWidth={true}
                  //placeholder='Company GST'
                  label='Company GST'
                  name='company_gstin_uin'
                  value={formValues['company_gstin_uin']}
                  color='primary'
                  type='text'
                  regex=''
                  variant='filled'
                  required={true}
                  error={formErrors.company_gstin_uin === '' ? false : true}
                  helperText={
                    formErrors.company_gstin_uin === ''
                      ? ''
                      : 'Company GST is Required!'
                  }
                />
              </Grid> */}

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 6,
                  xs: 12
                }}>
                <TextField
                  onChange={handleChange}
                  onBlur={handleChange}
                  style={{}}
                  fullWidth={true}
                  //placeholder='Company Full Address'
                  label='Company Full Address'
                  name='address_fulladdress'
                  value={formValues['address_fulladdress']}
                  color='primary'
                  type='text'
                  regex=''
                  variant='filled'
                  required={formValues.gst_registration && true}
                  // selectOnFocus
                  // clearOnBlur
                  // handleHomeEndKeys
                  // freeSolo
                  error={
                    formValues.gst_registration === true &&
                    formErrors.address_fulladdress !== ''
                      ? true
                      : false
                  }
                  helperText={
                    formValues.gst_registration === true &&
                    formErrors.address_fulladdress !== ''
                      ? 'Company Full Address is Required!'
                      : ''
                  }
                />
              </Grid>

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 6,
                  xs: 12
                }}>
                <TextField
                  onChange={handleChange}
                  onBlur={handleChange}
                  fullWidth
                  label='Company latitude'
                  name='company_latitude'
                  value={formValues['company_latitude']}
                  color='primary'
                  type='text'
                  regex=''
                  variant='filled'
                  // required={formValues.gst_registration && true}
                  // // selectOnFocus
                  // // clearOnBlur
                  // // handleHomeEndKeys
                  // // freeSolo
                  // error={formValues.gst_registration === true && formErrors.company_latitude !== '' ? true : false }
                  // helperText={
                  //   formValues.gst_registration === true && formErrors.company_latitude !== ''
                  //     ? 'Company Latitude is Required!'
                  //     : ''
                  // }
                />
              </Grid>

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 6,
                  xs: 12
                }}>
                <TextField
                  onChange={handleChange}
                  onBlur={handleChange}
                  fullWidth
                  label='Company Longitude'
                  name='company_longitude'
                  value={formValues['company_longitude']}
                  color='primary'
                  type='text'
                  regex=''
                  variant='filled'
                  // required={formValues.gst_registration && true}
                  // selectOnFocus
                  // clearOnBlur
                  // handleHomeEndKeys
                  // freeSolo
                  // error={formValues.gst_registration === true && formErrors.company_longitude !== '' ? true : false }
                  // helperText={
                  //   formValues.gst_registration === true && formErrors.company_longitude !== ''
                  //     ? 'Company Longitude is Required!'
                  //     : ''
                  // }
                />
              </Grid>

              {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <TextField
                  onChange={handleChange}
                  onBlur={handleChange}
                  style={{}}
                  fullWidth={true}
                  //placeholder='Company Street'
                  label='Company Street'
                  name='address_street'
                  value={formValues['address_street']}
                  color='primary'
                  type='text'
                  regex=''
                  variant='filled'
                  required={true}
                  error={formErrors.address_street === '' ? false : true}
                  helperText={
                    formErrors.address_street === ''
                      ? ''
                      : 'Company Street is Required!'
                  }
                />
              </Grid> */}

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 6,
                  xs: 12
                }}>
                <TextField
                  onChange={handleChange}
                  // onBlur={handleChange}
                  style={{}}
                  fullWidth={true}
                  //placeholder='Company Pincode'
                  label='Company Pincode'
                  name='address_pincode'
                  value={
                    formValues.address_pincode === null
                      ? ''
                      : formValues.address_pincode
                  }
                  color='primary'
                  type='text'
                  regex=''
                  variant='filled'
                  required={true}
                  error={
                    // formValues.gst_registration === true &&
                    formErrors.address_pincode !== ''
                      ? true
                      : false
                  }
                  //formValues.gst_registration === true &&
                  helperText={
                    // formValues.gst_registration === true &&
                    formErrors.address_pincode !== ''
                      ? 'Company Pincode is Required!'
                      : ''
                  }
                  //formValues.gst_registration === true &&
                />
              </Grid>

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 6,
                  xs: 12
                }}>
                <Autocomplete
                  fullWidth={true}
                  value={formValues['address_area'] || ''}
                  name='address_area'
                  onChange={(e, val) =>
                    val !== ''
                      ? setFormValues({
                          ...formValues,
                          address_area: val ? val : '',
                        })
                      : ''
                  }
                  options={[...cities]}
                  getOptionLabel={(city) => city}
                  selectOnFocus
                  clearOnBlur
                  handleHomeEndKeys
                  freeSolo
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='Company area'
                      variant='filled'
                      error={
                        formValues.gst_registration === true &&
                        formErrors.address_city !== ''
                          ? true
                          : false
                      }
                      helperText={
                        formValues.gst_registration === true &&
                        formErrors.address_city !== ''
                          ? 'Company area is Required!'
                          : ''
                      }
                      required={formValues.gst_registration && true}
                    />
                  )}
                />
              </Grid>

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 6,
                  xs: 12
                }}>
                <Autocomplete
                  fullWidth={true}
                  value={{name: formValues['address_city'] || ''}}
                  name='address_city'
                  onChange={(e, val) =>
                    val !== ''
                      ? setFormValues({
                          ...formValues,
                          address_city: val ? val.name : '',
                          address_state: val ? val.state : '',
                          address_pincode:
                            val && val.address_city === ''
                              ? formValues.address_pincode
                              : '',
                        })
                      : ''
                  }
                  options={[...Cities]}
                  getOptionLabel={(city) => city.name}
                  selectOnFocus
                  clearOnBlur
                  handleHomeEndKeys
                  freeSolo
                  // isOptionEqualToValue={(option, value) =>
                  //   option.name === value.name
                  // }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='City'
                      variant='filled'
                      error={
                        formValues.gst_registration === true &&
                        formErrors.address_city !== ''
                          ? true
                          : false
                      }
                      helperText={
                        formValues.gst_registration === true &&
                        formErrors.address_city !== ''
                          ? 'City is Required!'
                          : ''
                      }
                      required={formValues.gst_registration && true}
                    />
                  )}
                />
              </Grid>

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 6,
                  xs: 12
                }}>
                <Autocomplete
                  fullWidth={true}
                  name='address_state'
                  value={{state: formValues['address_state'] || ''}}
                  options={_.uniqBy(Cities, 'state')}
                  getOptionLabel={(options) => options.state}
                  onChange={(e, v) =>
                    v !== ''
                      ? setFormValues({
                          ...formValues,
                          address_state: v ? v.state : '',
                          address_city: v ? v.address_city : '',
                          address_pincode:
                            v && v.address_city === ''
                              ? formValues.address_pincode
                              : '',
                        })
                      : ''
                  }
                  autoHighlight={true}
                  // isOptionEqualToValue={(option, value) => option.state === value}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='State'
                      variant='filled'
                      error={
                        formValues.gst_registration === true &&
                        formErrors.address_state !== ''
                          ? true
                          : false
                      }
                      helperText={
                        formValues.gst_registration === true &&
                        formErrors.address_state !== ''
                          ? 'State is Required!'
                          : ''
                      }
                      required={formValues.gst_registration && true}
                    />
                  )}
                />
              </Grid>

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 6,
                  xs: 12
                }}>
                <Autocomplete
                  fullWidth={true}
                  name='address_country'
                  value={
                    formValues.address_country
                      ? Country.find(c => c.name === formValues.address_country) // match object from options
                      : null
                  }               
                  options={Country}
                  getOptionLabel={(options) => options.name}
                  autoHighlight={true}
                  onChange={(event, newValue) => {
                    setFormValues(prev => ({
                      ...prev,
                      address_country: newValue ? newValue.name : ''
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='Country'
                      variant='filled'
                      error={
                        formValues.gst_registration === true &&
                        formErrors.address_country !== ''
                          ? true
                          : false
                      }
                      helperText={
                        formValues.gst_registration === true &&
                        formErrors.address_country !== ''
                          ? formErrors.address_country
                          : ''
                      }
                      required={formValues.gst_registration && true}
                    />
                  )}
                />
              </Grid>

                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <Typography align='left' variant='h6'>
                    User Info
                  </Typography>
                </Grid>

                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <TextField
                    onChange={handleChange}
                    onBlur={handleChange}
                    style={{}}
                    fullWidth={true}
                    //placeholder='Company Full Address'
                    label='Super Admin'
                    name='superAdmin_userName'
                    value={formValues.superAdmin_userName}
                    color='primary'
                    type='text'
                    regex=''
                    variant='filled'
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {getprefix_data[0]?.value}.
                        </InputAdornment>
                      ),
                    }}
                    required={formValues.superAdmin_userName && true}
                    error={formErrors.superAdmin_userName === '' ? false : true}
                    helperText={
                      formErrors.superAdmin_userName === ''
                        ? ''
                        : 'Username is Required!'
                    }
                    // InputProps={{
                    //   readOnly: true,
                    //   disableUnderline: false,
                    // }}
                  />
                </Grid>

                {storage1.role_name === 'Administrator' && (
                  <>
                <Grid
                  style={{ display: 'flex', alignItems: 'center' }}
                  size={{
                    lg: 2,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <Button
                    variant='outlined'
                    color="error"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => handleDialogOpen(formValues.superAdmin_userName)}
                    disabled={!formValues.superAdmin_userName || formValues.superAdmin_userName.trim() === ''}
                  >
                    Forgot Password
                  </Button>
                </Grid>

                    {/* <Grid container spacing={2}> */}
                    {(storage1?.company_type === 2 && (storage1?.subscription_type == 7 || storage1?.subscription_type == 8) || storage1?.company_type === 3 && (storage1?.subscription_type == 19 || storage1?.subscription_type == 20)) &&
                      (<>
                        <Grid
                          size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                          }}>
                          <Typography align="left" variant="h6">
                            Company Invoice
                          </Typography>
                        </Grid>

                        <Grid
                          size={{
                            lg: 3,
                            md: 4,
                            sm: 6,
                            xs: 12
                          }}>
                          <FormGroup>
                            <FormControlLabel
                              label='E-Invoice'
                              disabled={einvoiceValue == 1 || formValues.gst_registration == false}
                              control={
                                <Switch
                                  name='company_einvoice'
                                  // defaultChecked={formValues.company_gstin_uin ? true : false }
                                  // onChange={handleToggleChange}
                                  // checked={eInvoiceEnabled}
                                  checked={formValues.company_einvoice == 1}
                                  onChange={handleSwitchChange}
                                />
                              }
                            />
                          </FormGroup>
                        </Grid>

                        <Grid
                          size={{
                            lg: 3,
                            md: 4,
                            sm: 6,
                            xs: 12
                          }}>
                          <FormGroup>
                            <FormControlLabel
                              label='TCS & TDS'
                              control={
                                <Switch
                                  name='company_tcs_tds'
                                  // defaultChecked={formValues.company_gstin_uin ? true : false }
                                  // onChange={handleToggleChange}
                                  // checked={eInvoiceEnabled}
                                  checked={formValues.company_tcs_tds == 1}
                                  onChange={handleSwitchChange}
                                />
                              }
                            />
                          </FormGroup>
                        </Grid>

                        {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                          <TextField
                            onChange={handleChange}
                            onBlur={handleChange}
                            fullWidth={true}
                            label='Company Einvoice User Name'
                            name='company_einvoice_user_name'
                            value={formValues['company_einvoice_user_name']}
                            // value={{name: formValues['company_einvoice_user_name'] || ''}}
                            disabled={formValues.company_einvoice == 0}
                            color='primary'
                            type='text'
                            regex=''
                            variant='filled'
                          />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                          <TextField
                            onChange={handleChange}
                            onBlur={handleChange}
                            fullWidth={true}
                            label='Company Einvoice Password'
                            name='company_einvoice_password'
                            value={formValues['company_einvoice_password']}
                            // value={{name: formValues['company_einvoice_password'] || ''}}
                            disabled={formValues.company_einvoice == 0}
                            color='primary'
                            type='text'
                            regex=''
                            variant='filled'
                          />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                          <TextField
                            onChange={handleChange}
                            onBlur={handleChange}
                            required={true}
                            style={{}}
                            fullWidth={true}
                            placeholder='Gst Number'
                            label='Company Einvoice Gstin'
                            name='company_einvoice_gstin'
                            value={
                              formValues.company_einvoice_gstin === null ? '' : formValues.company_einvoice_gstin
                            }
                            disabled={formValues.company_einvoice == 0}
                            color='primary'
                            type='text'
                            // regex='/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]{3}$/'
                            variant='filled'
                            error = {!!formErrors.company_einvoice_gstin}
                            helperText = {formErrors.company_einvoice_gstin === '' ? '' : formErrors.company_einvoice_gstin}
                          />
                        </Grid> */}

                        {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                          <TextField
                            onChange={handleChange}
                            onBlur={handleChange}
                            fullWidth={true}
                            label='Company Einvoice ClientId'
                            name='company_einvoice_clientId'
                            value={formValues['company_einvoice_clientId']}
                            // value={{name: formValues['company_einvoice_clientId'] || ''}}
                            disabled={formValues.company_einvoice == 0}
                            color='primary'
                            // type='number'
                            type='text'
                            regex=''
                            variant='filled'
                          />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                          <TextField
                            onChange={handleChange}
                            onBlur={handleChange}
                            fullWidth={true}
                            label='company clientSecret'
                            name='company_clientSecret'
                            value={formValues['company_clientSecret']}
                            // value={{name: formValues['company_clientSecret'] || ''}}
                            disabled={formValues.company_einvoice == 0}
                            color='primary'
                            type='text'
                            regex=''
                            variant='filled'
                          />
                        </Grid> */}
                      </>)}

                {formValues['frontDesk_userName'] ? (
                  <>
                    {/* Grid for "Change Password" button when frontDesk_userName exists */}
                    <Grid
                      style={{ display: 'flex', alignItems: 'center' }}
                      size={{
                        lg: 2,
                        md: 4,
                        sm: 6,
                        xs: 12
                      }}>
                      <Button
                        variant="outlined"
                        color="info"
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => handleOpenChangeDialog(formValues.superAdmin_userName)}
                      >
                        Change Password
                      </Button>
                    </Grid>
                  </>
                ) : ('')}
                  </>
                )}

                {(storage1?.company_type == 2 && addAcc == 0 && formValues.is_addacc_enable == 0 || formValues.is_addacc_enable === false) && <><Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <Typography align="left" variant="h6">
                    Additional Account
                  </Typography>
                </Grid>

                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <FormGroup>
                    <FormControlLabel
                      label='Additional Account'
                      control={
                        <Switch
                          name='is_addacc_enable'
                          checked={formValues.is_addacc_enable == 1 || formValues.is_addacc_enable === true}
                          disabled={formValues.is_addacc_enable == 1 || formValues.is_addacc_enable === true}
                          onChange={handleSwitchChange}
                        />
                      }
                    />
                  </FormGroup>
                </Grid> </>}

                {/* Forgot password dialog */}

                <Dialog
                  open={passwordDialogOpen}
                  onClose={(event, reason) => {
                    if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
                      handleCloseDialog();
                    }
                  }}
                  maxWidth="md"
                  fullWidth
                  sx={{
                    '& .MuiDialog-paper': {
                      overflow: 'hidden',
                    },
                  }}
                >
                  <DialogTitle>Forgot Password</DialogTitle>
                  <br/>
                  <DialogContent>
                    <Grid container spacing={2} direction="row">
                      <Grid
                        style={{ marginBottom: '16px' }}
                        size={{
                          xs: 12,
                          md: 6
                        }}>
                        <TextField
                          label="Username"
                          variant="outlined"
                          value={dialogUserName}
                          fullWidth
                        />
                      </Grid>
                      <Grid
                        style={{ marginBottom: '16px' }}
                        size={{
                          xs: 12,
                          md: 6
                        }}>
                        <TextField
                          label="OTP"
                          variant="outlined"
                          value={formValues.otp}
                          onChange={handleOtpChange}
                          fullWidth
                          required
                          disabled={!otpFieldEnabled}
                          sx={{
                            '& .MuiInputBase-root': {
                              backgroundColor: otpFieldEnabled ? 'white' : 'rgba(0,0,0,0.1)',
                              opacity: otpFieldEnabled ? 1 : 0.6,
                            }
                          }}
                          error={isSubmitting && !!dialogformErrors.otp}
                          helperText={isSubmitting && dialogformErrors.otp ? dialogformErrors.otp : ''} 
                        />
                      </Grid>
                    </Grid>
                    <Grid container spacing={2} direction="row">
                      <Grid
                        size={{
                          xs: 12,
                          md: 6
                        }}>
                        <TextField
                          label="New Password"
                          name="newPassword"
                          variant="outlined"
                          type={passwordVisibility.newPassword ? 'text' : 'password'}
                          value={formValues.newPassword}
                          onChange={handleNewPasswordChange}
                          fullWidth
                          required
                          disabled={!otpVerified}
                          error={isSubmitting && !!dialogformErrors.newPassword}
                          helperText={isSubmitting && dialogformErrors.newPassword ? dialogformErrors.newPassword : ''} 
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position='end'>
                                <IconButton
                                  aria-label='toggle password visibility'
                                  onClick={() => onShowNewPassword('newPassword')}
                                  disabled={!otpVerified}
                                  edge='end'
                                >
                                  {passwordVisibility.newPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiInputBase-root': {
                              backgroundColor: otpVerified ? 'white' : 'rgba(0,0,0,0.1)',
                              opacity: otpVerified ? 1 : 0.6,
                            }
                          }}
                        />
                      </Grid>
                      <Grid
                        size={{
                          xs: 6,
                          md: 6
                        }}>
                        <TextField
                          label="Re-type New Password"
                          name="confirmNewPassword"
                          variant="outlined"
                          type={passwordVisibility.confirmNewPassword ? 'text' : 'password'}
                          value={formValues.confirmNewPassword}
                          onChange={handleConfirmPasswordChange}
                          fullWidth
                          required
                          disabled={!otpVerified}
                          error={isSubmitting && !!dialogformErrors.confirmNewPassword}
                          helperText={isSubmitting && dialogformErrors.confirmNewPassword ? dialogformErrors.confirmNewPassword : ''} 
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position='end'>
                                <IconButton
                                  aria-label='toggle password visibility'
                                  onClick={() => onShowNewPassword('confirmNewPassword')}
                                  disabled={!otpVerified}
                                  edge='end'
                                >
                                  {passwordVisibility.confirmNewPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiInputBase-root': {
                              backgroundColor: otpVerified ? 'white' : 'rgba(0,0,0,0.1)',
                              opacity: otpVerified ? 1 : 0.6,
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </DialogContent>
                  <DialogActions>
                    <Button variant='contained' onClick={handleCloseDialog} color="error">
                      Cancel
                    </Button>
                    {loading ? (
                      <CircularProgress />
                    ) : (
                      <Button variant='contained' onClick={() => {
                        if (buttonLabel === "Generate OTP") {
                          handleGenerateOtp();
                        } else if (buttonLabel === "Verify OTP") {
                          handleVerifyOtp();
                        } else if (buttonLabel === "Reset Password") {
                          handleUpdatePassword();
                        }
                      }}
                      color="primary">
                      {buttonLabel}
                    </Button>
)}
                  </DialogActions>
                </Dialog>

{/* Create Front Desk dialog */}

                <Dialog
                  open={openDialog}
                  onClose={handleCloseDialog}
                  maxWidth="md"
                  fullWidth>
                  <DialogTitle>Create Front Desk</DialogTitle>
                  <br />
                  <DialogContent>
                    <Grid container spacing={2} direction="row">
                      <Grid
                        style={{ marginBottom: '16px' }}
                        size={{
                          xs: 12,
                          md: 6
                        }}>
                        <TextField
                          onChange={handleChange}
                          onBlur={handleChange}
                          required={true}
                          style={{}}
                          fullWidth={true}
                          placeholder='First Name'
                          label='First Name'
                          name='frontDesk_newFirstName'
                          value={
                            formValues.frontDesk_newFirstName === null ? '' : formValues.frontDesk_newFirstName
                          }
                          color='primary'
                          type='text'
                          variant='filled'
                          error={isSubmitting && !!dialogformErrors.frontDesk_newFirstName}
                          helperText={isSubmitting && dialogformErrors.frontDesk_newFirstName}
                        />
                      </Grid>
                      <Grid
                        style={{ marginBottom: '16px' }}
                        size={{
                          xs: 12,
                          md: 6
                        }}>
                        <TextField
                          onChange={handleChange}
                          onBlur={handleChange}
                          style={{}}
                          fullWidth={true}
                          placeholder='Last Name'
                          label='Last Name'
                          name='frontDesk_newLastName'
                          value={formValues.frontDesk_newLastName === null ? '' : formValues.frontDesk_newLastName}
                          color='primary'
                          type='text'
                          variant='filled'
                        />
                      </Grid>
                    </Grid>
                    <Grid container spacing={2} direction="row">
                      <Grid
                        style={{ marginBottom: '16px' }}
                        size={{
                          xs: 12,
                          md: 6
                        }}>
                        <TextField
                          onChange={handleChange}
                          onBlur={handleChange}
                          fullWidth={true}
                          placeholder='Employee Code'
                          label='Employee Code'
                          required
                          name='frontDesk_newEmployeeCode'
                          value={formValues.frontDesk_newEmployeeCode === null ? '' : formValues.frontDesk_newEmployeeCode}
                          color='primary'
                          type='text'
                          variant='filled'
                          error={isSubmitting && !!dialogformErrors.frontDesk_newEmployeeCode}
                          helperText={isSubmitting && dialogformErrors.frontDesk_newEmployeeCode}
                        />
                      </Grid>
                      <Grid
                        style={{ marginBottom: '16px' }}
                        size={{
                          xs: 12,
                          md: 6
                        }}>
                        <LocalizationProvider dateAdapter={DateAdapter}>
                          <DatePicker
                            slotProps={{
                              textField: {
                                name: 'frontDesk_dateOfJoining',
                                fullWidth: true,
                                required: true,
                                variant: 'filled',
                              },
                            }}
                            value={toMomentOrNull(formValues.frontDesk_dateOfJoining)}
                            format='DD/MM/YYYY'
                            onChange={(e) => {
                              if (e?._d && moment(e._d).isValid()) {
                                setStateHandler('frontDesk_dateOfJoining', moment(e._d).format('YYYY-MM-DD'));
                                setFormErrors((prevErrors) => ({
                                  ...prevErrors,
                                  frontDesk_dateOfJoining: null,
                                }));
                              }
                            }}
                            label="Date Of Joining"
                          />
                        </LocalizationProvider>
                      </Grid>
                    </Grid>
                    <Grid container spacing={2} direction="row">
                      <Grid
                        style={{ marginBottom: '16px' }}
                        size={{
                          xs: 12,
                          md: 6
                        }}>
                        <TextField
                          inputRef={textRef}
                          fullWidth={true}
                          name='frontDesk_newUserName'
                          label='User Name'
                          autoComplete='off'
                          placeholder='User Name'
                          type='text'
                          value={formValues.frontDesk_newUserName}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                {getprefix_data[0]?.value + "."}
                              </InputAdornment>
                            ),
                            readOnly: true
                          }}
                          variant='filled'
                          required
                          onChange={handleChange}
                          onBlur={handleChange} 
                        />
                      </Grid>
                      <Grid
                        style={{ marginBottom: '16px' }}
                        size={{
                          xs: 12,
                          md: 6
                        }}>
                        <TextField
                          onChange={handleChange}
                          onBlur={handleChange}
                          style={{}}
                          fullWidth={true}
                          placeholder='Password'
                          label='Password'
                          name='frontDesk_newPassword'
                          value={formValues.frontDesk_newPassword || ""}
                          color='primary'
                          type={passwordVisibility.frontDesk_newPassword ? 'text' : 'password'}
                          required
                          regex=''
                          variant='filled'
                          error={isSubmitting && !!dialogformErrors.frontDesk_newPassword}
                          helperText={isSubmitting && dialogformErrors.frontDesk_newPassword}
                          autoComplete='off'
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={() => onShowNewPassword('frontDesk_newPassword')}
                                  edge="end"
                                >
                                  {passwordVisibility.frontDesk_newPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                  </DialogContent>
                  <DialogActions>
                    <Button variant='contained' onClick={handleCloseCreate} color="error">
                      Cancel
                    </Button>
                    <Button variant='contained' onClick={handleCreateUserSubmit} color="primary">
                      Create
                    </Button>
                  </DialogActions>
                </Dialog>

{/* change password dialog */}

                <Dialog
                  open={changeDialogOpen}
                  onClose={(event, reason) => {
                    if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
                      handleCloseDialog();
                    }
                  }}
                  maxWidth="md"
                  fullWidth
                  sx={{
                    '& .MuiDialog-paper': {
                      overflow: 'hidden',
                    },
                  }}
                >
                  <DialogTitle>Change Password</DialogTitle>
                  <br />
                  <DialogContent>
                    <Grid container spacing={2} direction="row">
                      <Grid
                        style={{ marginBottom: '16px' }}
                        size={{
                          xs: 12,
                          md: 6
                        }}>
                        <TextField
                          onChange={handleChange}
                          onBlur={handleChange}
                          required={true}
                          style={{}}
                          fullWidth={true}
                          placeholder='Current Password'
                          label='Current Password'
                          name='currentPasswordForChange'
                          type={passwordVisibility.currentPasswordForChange ? 'text' : 'password'}
                          value={
                            formValues.currentPasswordForChange === null ? '' : formValues.currentPasswordForChange
                          }
                          color='primary'
                          variant='filled'
                          error={isSubmitting && !!dialogformErrors.currentPasswordForChange}
                          helperText={isSubmitting && dialogformErrors.currentPasswordForChange}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position='end'>
                                <IconButton
                                  aria-label='toggle password visibility'
                                  onClick={() => onShowNewPassword('currentPasswordForChange')}
                                  edge='end'
                                >
                                  {passwordVisibility.currentPasswordForChange ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid
                        style={{ marginBottom: '16px' }}
                        size={{
                          xs: 12,
                          md: 6
                        }}>
                        <TextField
                          onChange={handleChange}
                          onBlur={handleChange}
                          required={true}
                          style={{}}
                          fullWidth={true}
                          placeholder='New Password'
                          label='New Password'
                          name='newPasswordForChange'
                          type={passwordVisibility.newPasswordForChange ? 'text' : 'password'}
                          value={
                            formValues.newPasswordForChange === null ? '' : formValues.newPasswordForChange
                          }
                          color='primary'
                          variant='filled'
                          error={isSubmitting && !!dialogformErrors.newPasswordForChange}
                          helperText={isSubmitting && dialogformErrors.newPasswordForChange}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position='end'>
                                <IconButton
                                  aria-label='toggle password visibility'
                                  onClick={() => onShowNewPassword('newPasswordForChange')}
                                  edge='end'
                                >
                                  {passwordVisibility.newPasswordForChange ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid
                        style={{ marginBottom: '16px' }}
                        size={{
                          xs: 12,
                          md: 6
                        }}>
                        <TextField
                          onChange={handleChange}
                          onBlur={handleChange}
                          required={true}
                          style={{}}
                          fullWidth={true}
                          placeholder='Retype New Password'
                          label='Retype New Password'
                          name='confirmNewPasswordForChange'
                          type={passwordVisibility.confirmNewPasswordForChange ? 'text' : 'password'}
                          value={
                            formValues.confirmNewPasswordForChange === null ? '' : formValues.confirmNewPasswordForChange
                          }
                          color='primary'
                          variant='filled'
                          error={isSubmitting && !!dialogformErrors.confirmNewPasswordForChange}
                          helperText={isSubmitting && dialogformErrors.confirmNewPasswordForChange}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position='end'>
                                <IconButton
                                  aria-label='toggle password visibility'
                                  onClick={() => onShowNewPassword('confirmNewPasswordForChange')}
                                  edge='end'
                                >
                                  {passwordVisibility.confirmNewPasswordForChange ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                  </DialogContent>
                  <DialogActions>
                    <Button variant='contained' onClick={handleCloseChangeDialog} color="error">
                      Cancel
                    </Button>
                    <Button variant='contained' onClick={handleChangePassword} color="primary">
                      Change
                    </Button>
                  </DialogActions>
                </Dialog>
              {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <FormControl
                component='fieldset'
                fullWidth={true}
              >
                <FormControlLabel
                  control={
                    <Switch
                    name='company_overtimeAllowance'
                     checked={formValues.company_overtimeAllowance === 'true' ? true : false}
                      size='medium'
                      color='primary'
                      label='Over Time'
                      onChange={handleCheck}
                    />
                  }
                  label='Over Time'
                  name='company_overtimeAllowance'
                />
              </FormControl>
            </Grid> */}
              {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
                item
              >
                <Typography
                  align='left'
                  variant='h6'
                >
                  Payroll
                </Typography>
              </Grid> */}

              {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <TextField
                  onChange={handleChange}
                  onBlur={handleChange}
                    fullWidth={true}
                    onWheel={ (e) => e.target.blur()}
                  label='Privilege Leaves'
                  name='company_privilegeLeave'
                  value={formValues['company_privilegeLeave']}
                  color='primary'
                  type='number'
                  regex=''
                  variant='filled'
                  required={formValues.gst_registration === true && true}
                  error={formErrors.company_privilegeLeave === '' ? false : true}
                  helperText={
                    formErrors.company_privilegeLeave === '' ? '' : 'Privilege Leaves is Required!'
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <FormControl
                  component='fieldset'
                  fullWidth={true}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        name='company_privilegeLeaveCarryForward'
                        checked={formValues.company_privilegeLeaveCarryForward === 'true' ? true : false}
                        size='medium'
                        color='primary'
                        onChange={handleCheck}
                      />
                    }
                    label='Enable Carry Forward PL'
                    name='company_privilegeLeaveCarryForward'
                  />
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <TextField
                  onChange={handleChange}
                  onBlur={handleChange}
                    fullWidth={true}
                    onWheel={ (e) => e.target.blur()}
                  label='Privilege Leaves Max Limit'
                  name='company_privilegeLeaveMaxLimit'
                  value={formValues['company_privilegeLeaveMaxLimit']}
                  color='primary'
                  type='number'
                  regex=''
                  disabled={formValues.company_privilegeLeaveCarryForward !== 'true'}
                  variant='filled'
                  required={formValues.gst_registration === true && true}
                  error={formErrors.company_privilegeLeaveMaxLimit === '' ? false : true}
                  helperText={
                    formErrors.company_privilegeLeaveMaxLimit === null ? '' : formErrors.company_privilegeLeaveMaxLimit
                  }

                // disabled={formValues.company_privilegeLeaveCarryForward === 'false'}
                />
              </Grid> */}

              {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                item
                sx={{
                  display: { xs: "none", lg: "block" }
                }}
              >
                <span></span>
              </Grid> */}
              {/* 
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <FormControl
                  component='fieldset'
                  fullWidth
                >
                  <FormControlLabel
                    control={
                      <Switch
                        name='gps_attendance'
                        checked={formValues.gps_attendance === 'true' ? true : false}
                        size='medium'
                        color='primary'
                        label='Enable GPS Attendance'
                        onChange={handleCheck}
                      />
                    }
                    label='Enable GPS Attendance'
                    name='gps_attendance'
                  />
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} item>
                <TextField select label="GPS Attendance Radius" variant="filled"
                  onChange={handleChangeRadius}
                  value={formValues['gps_attendance'] === 'true' ? formValues['gps_attendance_radius'] : ''}
                  onBlur={handleChangeRadius}
                  fullWidth
                  // required={formValues.gst_registration === true && formValues.gps_attendance === 'true'}
                  regex=''
                  error={formValues.gps_attendance === 'true' && formValues['gps_attendance'] === ''}
                  helperText={
                    formValues.gps_attendance_radius === 'true' && formErrors.gps_attendance_radius === null ? '' : formErrors.gps_attendance_radius
                  }
                  disabled={formValues.gps_attendance === 'true' ? false : true}
                >
                 {companyRadiusGps.map((d, index) => (
          <MenuItem key={index} value={d.radius}>
            {d.radius}
          </MenuItem>
        ))}
                </TextField>
              </Grid>


              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <FormControl
                  required={true}
                  error={formErrors.company_enableLiveLocation === null ? false : true}
                  component='fieldset'
                  fullWidth={true}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        name='company_enableLiveLocation'
                        checked={formValues.company_enableLiveLocation === 'true' ? true : false}
                        size='medium'
                        color='primary'
                        // required={true}
                        onChange={handleCheck}
                      />
                    }
                    label='Enable Live Location'
                    name='company_enableLiveLocation'
                  />
                  <FormHelperText>{formErrors.company_enableLiveLocation}</FormHelperText>
                </FormControl>
              </Grid> */}

              {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} item>
                <TextField select label="Live Location Interval" variant="filled"
                  onChange={handleChangeInterval}
                  value={formValues['company_liveTrackingInterval']}
                  onBlur={handleChangeInterval}
                  fullWidth
                  required={formValues.gst_registration === true && formValues.company_enableLiveLocation === 'true'}
                  regex=''
                  error={
                    formValues.company_enableLiveLocation === 'true' &&
                    !formValues['company_liveTrackingInterval']
                  }
                  helperText={
                    formValues.company_enableLiveLocation === 'true' &&
                      !formValues['company_liveTrackingInterval']
                      ? 'Live Location Interval is required'
                      : ''
                  }
                  disabled={formValues.company_enableLiveLocation === 'true' ? false : true}
                >
                  <MenuItem value={'15s'}>15 sec</MenuItem>
                  <MenuItem value={'30s'}>30 sec</MenuItem>
                  <MenuItem value={'60s'}>1 min</MenuItem>
                  <MenuItem value={'120s'}>2 min</MenuItem>
                </TextField>
                {formValues['company_liveTrackingInterval'] === '' && (
                  <span style={{ color: 'red', fontSize: '0.75rem' }}>
                    Live Location is Required!
                  </span>
                )}
                {/* <FormControl fullWidth  required={true} >
                    <InputLabel htmlFor="live-location-interval">Live Location Interval</InputLabel>
                    <Select
                      value={formValues['company_liveTrackingInterval']}
                      onChange={handleChangeInterval}
                      onBlur={handleChangeInterval}
                      variant="filled"
                    
                      error={formValues['company_liveTrackingInterval'] === ''}
                      disabled={formValues.company_enableLiveLocation === 'true' ? false : true}
                      fullWidth
                      label="Live Location Interval"
                      inputProps={{
                        name: 'live-location-interval',
                        id: 'live-location-interval',
                      }}
                    >
                      <MenuItem value={1}>1 min</MenuItem>
                      <MenuItem value={2}>2 min</MenuItem>
                      <MenuItem value={5}>5 min</MenuItem>
                      <MenuItem value={10}>10 min</MenuItem>
                    </Select>
                  </FormControl>
                  {formValues['company_liveTrackingInterval'] === '' && (
                    <span style={{ color: 'red', fontSize: '0.75rem' }}>
                      Live Location is Required!
                    </span>
                  )} */}
              {/* //</Grid>// */}
              {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <TextField
                  onChange={handleChange}
                  onBlur={handleChange}
                  fullWidth={true}
                  label='Live Location Interval'
                  name='company_liveTrackingInterval'
                  value={formValues['company_liveTrackingInterval']}
                  color='primary'
                  type='number'
                  regex=''
                  variant='filled'
                  required={true}
                  error={formErrors.company_liveTrackingInterval === '' ? false : true}
                  helperText={
                    formErrors.company_liveTrackingInterval === '' ? '' : 'Live Location is Required!'
                  }
                />
              </Grid> */}

              {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <TextField
                  label='domain'
                  name='domain'
                  defaultValue='erp.salesplay.in'
                  variant='filled'
                  sx={{
                    width: '100%',
                  }}
                  InputProps={{
                    readOnly: true,
                  }}
                />  
              </Grid> */}

              {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <FormControl
                  component='fieldset'
                  fullWidth
                >
                  <FormControlLabel
                    control={
                      <Switch
                        name='selfie_attendance'
                        checked={formValues.selfie_attendance === 'true' ? true : false}
                        size='medium'
                        color='primary'
                        label='Enable Selfie Attendance'
                        onChange={handleCheck}
                      />
                    }
                    label='Enable Selfie Attendance'
                    name='selfie_attendance'
                  />
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <FormControl
                  component='fieldset'
                  fullWidth
                >
                  <FormControlLabel
                    control={
                      <Switch
                        name='wifi_attendance'
                        checked={formValues.wifi_attendance === 'true' ? true : false}
                        size='medium'
                        color='primary'
                        label='Enable WIFI Attendance'
                        onChange={handleCheck}
                      />
                    }
                    label='Enable WIFI Attendance'
                    name='wifi_attendance'
                  />
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <FormControl
                  component='fieldset'
                  fullWidth
                >
                  <FormControlLabel
                    control={
                      <Switch
                        name='qr_attendance'
                        checked={formValues.qr_attendance === 'true' ? true : false}
                        size='medium'
                        color='primary'
                        label='Enable QR Attendance'
                        onChange={handleCheck}
                      />
                    }
                    label='Enable QR Attendance'
                    name='qr_attendance'
                  />
                </FormControl>
              </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <FormControl
                component='fieldset'
                fullWidth={true}
              >
                <FormControlLabel
                  control={
                    <Switch
                      name='extra_pay_for_week_off'
                      size='medium'
                      color='primary'
                      label='Extra pay For Week Off'
                      onChange={handleCheck}
                      checked={formValues.extra_pay_for_week_off === 'true' ? true : false}
                    />
                  }
                  label='Extra pay For Week Off'
                  name='extra_pay_for_week_off'
                />
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <FormControl
                component='fieldset'
                fullWidth={true}
              >
                <FormControlLabel
                  control={
                    <Switch
                      name='extra_pay_for_holiday'
                      size='medium'
                      color='primary'
                      label='Extra pay For Holiday'
                      onChange={handleCheck}
                      checked={formValues.extra_pay_for_holiday === 'true' ? true : false}
                    />
                  }
                  label='Extra pay For Holiday'
                  name='extra_pay_for_holiday'
                />
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <FormControl
                component='fieldset'
                fullWidth={true}
              >
                <FormControlLabel
                  control={
                    <Switch
                    name='company_enableWorkFromHome'
                     checked={formValues.company_enableWorkFromHome === 'true' ? true : false}
                      size='medium'
                      color='primary'
                      label='Work From Home'
                      onChange={handleCheck}
                    />
                  }
                  label='Work From Home'
                  name='company_enableWorkFromHome'
                />
              </FormControl>
            </Grid> */}
            </Grid>

            <Grid
              style={{marginBottom: '10px', marginTop: '30px'}}
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Grid
                spacing={7}
                container
                direction='row'
                display='flex'
                justifyContent='flex-end'
              >
                {pageType !== 'detailpage' && <Grid>
                  <Button
                    onClick={() => handleClickOpen()}
                    style={{}}
                    name='Cancel'
                    variant='contained'
                    color='secondary'
                    size='medium'
                    text='button'
                    fullWidth={false}
                    type='cancel'
                  >
                    Cancel
                  </Button>
                </Grid>}

                <Grid>
                  <Button
                    onClick={handleSubmit}
                    style={{}}
                    name='Submit'
                    variant='contained'
                    color='primary'
                    size='medium'
                    text='button'
                    fullWidth={false}
                    type='submit'
                    disabled={pageType !== 'detailpage' && !changedForm ? true : false}
                  >
                    {pageType === 'detailpage' ? 'Next' : 'Submit'}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          </Box>
          <CancelDialog
            delete={open}
            close={handleClose}
            handle={cancelDialog}
          ></CancelDialog>
        </Grid>
      )}
    </>
  );
}
