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
    DialogActions,
    RadioGroup,
    Radio,
    FormLabel
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { getAppConfigDataAction, getAppConfigWithCompanyInfoAction, get_checkExistsAction, updateAppConfigWithCompanyInfoAction } from '../../../redux/actions/app_config_actions';
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
} from '../../../components/regexFunction/index';
import { getTrimmedData } from '../../../../src/components/trimFunction/index';
import { updateAppConfigAction } from '../../../redux/actions/app_config_actions';
import CancelDialog from '../../../../src/components/CancelDialog';
import EditIcon from '@mui/icons-material/Edit';
import apiCalls from 'utils/apiCalls';
import { Helmet } from "react-helmet-async";
import { getCompanyLogo, getCompanyTypesAction, getSignature, updateEnableLiveAction, updateGpsAttendanceAction, updateGpsandEnableLiveAction, uploadCompanyLogo, updateWorkFromHomeAction, listCompanyGpsRadiusAction } from 'redux/actions/company_actions';
import CommonToolTip from '../../../components/ToolTip';
import { getPosPages, getRoleNameAction, get_searchUserRoleAction, getusermenus, listroleAction, updateRoleAction } from 'redux/actions/role_actions';
import { getDashboardRoleDataAction, listDashboardAction } from 'redux/actions/dashboard_role_actions';
import { getNavigationBootstrapAction } from 'redux/actions/navigation_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import { base_url, host, titleURL } from '../../../http-common';
import { useDropzone } from 'react-dropzone';
import AvatarViewWrapper from 'utils/imgUpload';
import Signature from '../CompanyInfo/signature'
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
// import { styled } from '@mui/material/styles';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';

const StyledTextField = styled(TextField)({
    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
        '-webkit-appearance': 'none',
        margin: 0,
    },
    '& input[type=number]': {
        '-moz-appearance': 'textfield',
    },
});


export default function PayRoll() {
    const dispatch = useDispatch();
    const storage1 = getsessionStorage()
    const selectedRole = storage1?.role_name;
    console.log(storage1,"storage1")
    const {
        appConfigReducer: { app_config_data }, roleReducer: { pos_pages, listrole }, DashboardRoleReducer: { getalldashboarddata }, customerReducer: { customer_filter, customer_paginate, Get_customer_statement, customer, customerSalesDetailById, customerDetailById }, CompanyReducers: { companyRadiusGps }, rbacReducer: { menuAccess }
    } = useSelector((state) => state);

    const {
        CompanyReducers: { types },
    } = useSelector((state) => state);
    const tempinitsform = useRef(null);
    const [changedForm, setForm] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [formValues, setFormValues] = useState({
        selfie_attendance: '',
        wifi_attendance: '',
        qr_attendance: '',
        gps_attendance: '',
        company_liveLocationInterval: '',
        company_enableLiveLocationInterval: '',
        gps_attendance_radius: '',
        company_liveTrackingInterval: '',
        company_enableLiveLocation: '',
        company_enableWorkFromHome: '',
        face_attendance:'',
        manual_attendance:'',
        offline_attendance:'',
        reportingmanager_contact:'',
        otp_paymentotp:'',
        verify_payment:'',
        otp_deliveryotp:'',
        // multi_factor_authentication:'',
        fraud_attendance:'',
        device_attendance:'',
        enable_tcs:'',
        enable_tds:'',
        enable_sales_approval:'',
        enable_payment_approval:'',
        fuelallowance:'',
        fuelallowance_manual: 'false',
        fuelallowance_automatic: 'false',
        enable_storevisit_selfie: '',
        showDcInReceivables: '',
        applyRoundOff: '',
        device_Interval:'',
        enable_attendance_with_address:'',
        enable_break_calculation:'',
        break_interval:''
        // company_overtimeAllowance: ''
    });

    // console.log("formValues",formValues)
    const [formErrors, setFormErrors] = useState({
        selfie_attendance: '',
        wifi_attendance: '',
        qr_attendance: '',
        gps_attendance: '',
        company_liveLocationInterval: '',
        company_enableLiveLocationInterval: '',
        gps_attendance_radius: '',
        company_liveTrackingInterval: '',
        company_enableLiveLocation: '',
        company_enableWorkFromHome: '',
        face_attendance:'',
        manual_attendance:'',
        offline_attendance:'',
        reportingmanager_contact:'',
        otp_paymentotp:'',
        verify_payment:'',
        otp_deliveryotp:'',
        // multi_factor_authentication:'',
        fraud_attendance:'',
        device_attendance:'',
        enable_sales_approval:'',
        enable_payment_approval:'',
        fuelallowance:'',
        enable_storevisit_selfie: '',
        showDcInReceivables: '',
        applyRoundOff: '',
        device_Interval:'',
        enable_attendance_with_address:'',
        enable_break_calculation:'',
        break_interval:''
    });

    // console.log("",formValues.multi_factor_authentication)
    const [errors, setErrors] = useState({ company_name: '' })
    const [flag, setFlag] = useState(false)


    const liveLocationInterval = formValues.company_enableLiveLocation ? "company_liveTrackingInterval" : ''

    let requiredFields = [
        "company_liveTrackingInterval"
    ];

    const [tempDetails, setTempDetails] = useState({ tempCompanyName: '', tempCompanyType: '' })

    console.log("formvalues", formValues)
    const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(context);

    const interval = [1, 2, 5, 10]

    const [selectedInterval, setSelectedInterval] = useState(formValues.company_liveTrackingInterval);

    const [selectedRadius, setSelectedRadius] = useState(formValues.gps_attendance_radius);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [tempValue, setTempValue] = useState(false);
    const [offlineFaceDialogOpen, setOfflineFaceDialogOpen] = useState(false);

    const alter = { company_phone: /^\d{10}$/, company_mobile: /^\d{10}$/ };
    const [open, setOpen] = useState(false);
    const [touchedFields, setTouchedFields] = useState({});
    const [isLoadingLocationData, setIsLoadingLocationData] = useState(false)

    useEffect(() => {
        dispatch(getCompanyTypesAction());
        dispatch(listCompanyGpsRadiusAction());
    }, []);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const cancelDialog = () => {
        setOpen(false);
    };

    const initsform = () => {
        let data = {
      company_type: storage1?.company_type
    }
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(getAppConfigDataAction(setModalTypeHandler, setLoaderStatusHandler,
                (response) => {
                    if (response && Array.isArray(response)) {

                      const formData = response.reduce((acc, item) => {
                        acc[item.key_name] = item.value || "";
                        return acc;
                      }, {});
                
                      const completeFormData = {
                        ...formData,
                        gst_registration: formData?.gst_registration || false,
                        first_name: formData?.first_name || '',
                        last_name: formData?.last_name || '',
                        company_type: formData?.company_type || '',
                        company_type_id: formData?.company_type_id || '',
                        };
                        console.log(formData, completeFormData, "completeFormData")
                         
                      setFormValues(completeFormData);
                      localStorage.setItem('formValues', JSON.stringify(completeFormData)); 
                    }
                }
              )
            ),
            dispatch(listroleAction(setModalTypeHandler, setLoaderStatusHandler)),
            dispatch(getPosPages()),
            dispatch(getRoleNameAction(data)),
            dispatch(listDashboardAction()),
            //dispatch(getCompanyLogo())
        );
    };


    tempinitsform.current = initsform;
    useEffect(() => {
        tempinitsform.current();
    }, []);

    
    useEffect(() => {
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
        // }
    }, [formValues?.company_name, formValues?.company_type_id]);


    useEffect(() => {
    
        if (app_config_data && app_config_data.length > 0) {
          const newValues = { ...formValues };
    
          app_config_data.forEach((d) => {
            if (d.key_name === 'web.base.url') {
              newValues[d.key_name.replace('web.base.url', 'web_base_url')] = d.value;
            }
            if (d.key_name === 'company.gstin/uin') {
              newValues[d.key_name.replace('company.gstin/uin', 'company_gstin_uin')] = d.newValues;
            }
            if (d.key_name === 'company.gps_attendance_radius') {
              newValues[d.key_name.replace('company.gps_attendance_radius', 'gps_attendance_radius')] = d.value;
            }
            // if (d.key_name === 'company.enableMultiFactorAuthentication') {
            //   newValues[d.key_name.replace('company.enableMultiFactorAuthentication', 'multi_factor_authentication')] = d.value;
            // }
            if (d.key_name === 'company.showDcInReceivables') {
                newValues[d.key_name.replace('company.showDcInReceivables', 'showDcInReceivables')] = d.value;
            }
            if (d.key_name === 'company.applyRoundOff') {
                newValues[d.key_name.replace('company.applyRoundOff', 'applyRoundOff')] = d.value;
            }
             if (d.key_name === 'enablestorevisit.selfie') {
                newValues[d.key_name.replace('enablestorevisit.selfie', 'enable_storevisit_selfie')] = d.value;
            }else {
              newValues[d.key_name.replace('.', '_')] = d.value;
            }
          });
    
          apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(
              getAppConfigWithCompanyInfoAction(
                setModalTypeHandler,
                setLoaderStatusHandler,
                (response) => {
                  if (response.length) {
                    newValues.first_name = response[0].first_name;
                    newValues.last_name = response[0].last_name;
                    newValues.company_type = response[0].company_type;
                    newValues.company_type_id = response[0].company_type_id;
                    setFormValues(newValues);
                    setTempDetails({
                      tempCompanyName: newValues.company_name,
                      tempCompanyType: response[0].company_type_id,
                    });
                  }
                }
              )
            )
          );
    
          newValues.gst_registration = newValues.company_gstin_uin ? true : false;
          setFormValues(newValues);

        }
      }, [app_config_data]);


    useEffect(() => {
       
        const value = {}
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(getAppConfigWithCompanyInfoAction(setModalTypeHandler, setLoaderStatusHandler,
                (response) => {
                    if (response.length) {
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
                            } 
                            // if (d.key_name === 'company.enableMultiFactorAuthentication') {
                            //     value[d.key_name.replace('company.enableMultiFactorAuthentication', 'multi_factor_authentication')] = d.value;
                            // }
                            if (d.key_name === 'company.showDcInReceivables') {
                                value[d.key_name.replace('company.showDcInReceivables', 'showDcInReceivables')] = d.value;
                            }
                            if (d.key_name === 'company.applyRoundOff') {
                                value[d.key_name.replace('company.applyRoundOff', 'applyRoundOff')] = d.value;
                            }
                            if (d.key_name === 'enablestorevisit.selfie') {
                                value[d.key_name.replace('enablestorevisit.selfie', 'enable_storevisit_selfie')] = d.value;
                            }
                            else {
                                value[d.key_name.replace('.', '_')] = d.value;
                            }
                        });
                        value.first_name = response[0].first_name
                        value.last_name = response[0].last_name
                        value.company_type = response[0].company_type
                        value.company_type_id = response[0].company_type_id
                        setTempDetails({ tempCompanyName: value.company_name, tempCompanyType: response[0].company_type_id })
                        setFormValues(value);
                    }
                }
            ))
        )
        value.gst_registration = value.company_gstin_uin ? true : false
        setFormValues(value);
        cancelDialog();
        setForm(false);
        setEditOpen(false);
    }, [app_config_data]);

    const canEdit = (storage1?.company_type === 5 || storage1?.company_type === 3 ) ? UserRightsAuthorization(menuAccess[selectedRole], 'config__general', 'can_edit') : true;
    console.log(menuAccess[selectedRole],"rahaha");

    const handleClose = async () => {
        const newValues = { ...formValues };
        app_config_data.forEach((d) => {
            if (d.key_name === 'web.base.url') {
                newValues[d.key_name.replace('web.base.url', 'web_base_url')] = d.value;
            }
            if (d.key_name === 'company.gstin/uin') {
                newValues[d.key_name.replace('company.gstin/uin', 'company_gstin_uin')] =
                    d.newValues;
            }
            if (d.key_name === 'company.gps_attendance_radius') {
                newValues[d.key_name.replace('company.gps_attendance_radius', 'gps_attendance_radius')] = d.value;
            } 
            // if (d.key_name === 'company.enableMultiFactorAuthentication') {
            //     newValues[d.key_name.replace('company.enableMultiFactorAuthentication', 'multi_factor_authentication')] = d.value;
            // }
            else {
                newValues[d.key_name.replace('.', '_')] = d.value;
            }
        });
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(getAppConfigWithCompanyInfoAction(setModalTypeHandler, setLoaderStatusHandler,
                (response) => {
                    if (response.length) {
                        newValues.first_name = response[0].first_name
                        newValues.last_name = response[0].last_name
                        newValues.company_type = response[0].company_type
                        newValues.company_type_id = response[0].company_type_id
                        setFormValues(newValues);
                        setTempDetails({ tempCompanyName: newValues.company_name, tempCompanyType: response[0].company_type_id })
                    }
                }
            ))
        )
        newValues.gst_registration = newValues.company_gstin_uin ? true : false
        setFormValues(newValues);
        cancelDialog();
        setForm(false);
        setEditOpen(false);
    };

    const [customerData, setcustomer] = useState('');


    const [image, setImage] = useState(null)
    const [isEnabled, setIsEnabled] = useState(false);
    const [imageStatus, setImageStatus] = useState(true);

    const { getRootProps, getInputProps } = useDropzone({
        accept: 'image/jpeg , image/png , image/jpg',
        onDrop: (acceptedFiles) => {
            // setFieldValue('pic_filename', URL.createObjectURL(acceptedFiles[0]));
            if (acceptedFiles[0] instanceof Blob) {
                var reader = new FileReader();
                reader.onloadend = function () {
                    setImage(reader.result);
                    setImageStatus(false);
                };
                reader.onload = function (event) {
                    const img = new Image();
                    img.onload = function () {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);

                        // Convert canvas to JPEG image
                        const jpegUrl = canvas.toDataURL('image/jpeg');

                        // Set the converted URL
                        setImage(jpegUrl);
                    };

                    img.src = event.target.result;
                };
                reader.readAsDataURL(acceptedFiles[0]);

            }
        },
    });

    useEffect(() => {

        if (image !== null) {
            setIsEnabled(true)

        }

    }, [image, imageStatus])


    const handleChangeInterval = (event) => {
        setForm(true);
        setSelectedInterval(event.target.value);
        setFormValues({
            ...formValues,
            company_liveTrackingInterval: event.target.value,
        });
    };
    const handleChangeDeviceInterval = (event) => {
        setForm(true);
        setFormValues({
            ...formValues,
            device_Interval: event.target.value,
        });
    };
    const handleChangeBreakInterval = (event) => {
        setForm(true);
        setFormValues({
            ...formValues,
            break_interval: event.target.value,
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


    const handleSubmit = async (event) => {
        event.preventDefault();
        let { name, checked } = event.target;
        let isValid = true;
        let formErrorsObj = { ...formErrors };
        let checkRequired =  requiredFields
        await Object.keys(formValues).map((key, i) => {
            if (
                checkRequired.includes(key) &&
                (formValues[key] === '' || formValues[key] === null || formValues[key] === "null")
            ) {
                if (key === 'company_liveTrackingInterval' && formValues.company_enableLiveLocation === 'false') {
                    formErrorsObj[key] = '';
                } else {
                    isValid = false;
                    formErrorsObj[key] = capitalize(key) + ' is Required!';
                }
            }
            else if (alter[key] && formValues[key]) {
                const value =
                    typeof formValues[key] === 'object'
                        ? formValues[key]?.number
                        : formValues[key];
 
                if (value && !alter[key].test(value)) {
                    isValid = false;
                    formErrorsObj[key] = capitalize(key) + ' is Invalid!';
                } else {
                    formErrorsObj[key] = '';
                }
            }
            return '';
        });
 
        await setFormErrors(formErrorsObj);
 
 
        if (isValid) {
 
            let neededModules = [];
            let notNeededModules = [];
 
            const updateModules = (condition, moduleName) => {
                if (condition === 'true') {
                    neededModules.push(moduleName);
                } else if (condition === 'false') {
                    notNeededModules.push(moduleName);
                }
            };
           
            updateModules(formValues.qr_attendance, "QR Generator");
            updateModules(formValues.manual_attendance, "Manual Attendance");
            updateModules(formValues.offline_attendance, "Offline Attendance");
            updateModules(formValues.otp_paymentotp, "Otp Delivery");
            updateModules(formValues.verify_payment, "Verify Payment");
            updateModules(formValues.otp_deliveryotp, "Otp Payment");
            updateModules(formValues.fraud_attendance, "Fraud Attendance");
            updateModules(formValues.device_attendance, "Device Attendance");
            updateModules(formValues.company_enableLiveLocation, "Live Location");
            updateModules(formValues.face_attendance, "Face Attendance");
            updateModules(formValues.enable_sales_approval, "Enable Sales Approval");
            updateModules(formValues.enable_payment_approval, "Enable Payment Approval");
            updateModules(formValues.enable_storevisit_selfie, "Enable StoreVisit Selfie");
            updateModules(formValues.fuelallowance_manual, "Fuel Allowance");
            updateModules(formValues.fuelallowance_automatic, "Fuel Allowance");
            updateModules(formValues.showDcInReceivables, "Enable DC in Receivables");
            updateModules(formValues.applyRoundOff, "Apply Round Off (Rounds the total amount to the nearest ₹1)");
            updateModules(formValues.enable_attendance_with_address, "Enable Attendance with Address");
            updateModules(formValues.enable_break_calculation, "Break Duration Calculation");
 
            const isAutomatic = formValues.fuelallowance_automatic === 'true';
            const isManual = !isAutomatic;
 
            let formDatas = {
                ...formValues,
                'selfie.attendance': formValues.selfie_attendance,
                'wifi.attendance': formValues.wifi_attendance,
                'qr.attendance': formValues.qr_attendance,
                'gps.attendance': formValues.gps_attendance,
                'company.gps_attendance_radius': formValues.gps_attendance_radius,
                'company.liveTrackingInterval': formValues.company_enableLiveLocation === "true" ? formValues.company_liveTrackingInterval : '',
                'company.enableLiveLocation': formValues.company_enableLiveLocation,
                'company.enableWorkFromHome': formValues.company_enableWorkFromHome,
                'face.attendance': formValues.face_attendance,
                'manual.attendance': formValues.manual_attendance,
                'offline.attendance': formValues.offline_attendance,
                'reportingmanager.contact': formValues.reportingmanager_contact,
                'otp.deliveryotp': formValues.otp_deliveryotp,
                'otp.paymentotp': formValues.otp_paymentotp,
                'verify.payment': formValues.verify_payment,
                'fraud.attendance': formValues.fraud_attendance,
                'device.attendance': formValues.device_attendance,
                // 'company.enableMultiFactorAuthentication':formValues.multi_factor_authentication,
                'enable_sales_approval':formValues.enable_sales_approval,
                'enable_payment_approval':formValues.enable_payment_approval,
                'fuelallowance': isAutomatic ? 'true' : 'false',
                'fuelallowance.automatic': isAutomatic ? 'true' : 'false',
                'fuelallowance.manual': isManual ? 'true' : 'false',
                'fuelallowance_automatic': isAutomatic ? 'true' : 'false',
                'fuelallowance_manual': isManual ? 'true' : 'false',
                'enablestorevisit.selfie': formValues.enable_storevisit_selfie,
                'company.showDcInReceivables': formValues.showDcInReceivables,
                'company.applyRoundOff': formValues.applyRoundOff,
                'enable_attendance_with_address':formValues.enable_attendance_with_address,
                'enable_break_calculation':formValues.enable_break_calculation
 
                // 'company.overtimeAllowance': formValues.company_overtimeAllowance
            };
 
            // let newData = {}
            let dashboard = getalldashboarddata.map(item => ({
                dashboard_id: item.dashboard_id,
                dashboard_name: item.dashboard_name
            }));
 
            let newData = {
                // "role_id": storage1?.role_id,
                // "role_name": storage1?.role_name,
                "modules": listrole,
                "dashboard": dashboard,
                // "notifications": pos_pages,
                "neededModules": neededModules,
                "notNeededModules": notNeededModules,
                "company_live_location": formValues.company_enableLiveLocation,
                "type": "ModulesUpdate"
            };
 
            if (formValues.company_enableLiveLocation === 'false' || formValues.qr_attendance === 'false') {
                newData.modules = newData.modules.filter(item => {
                    return (
                        (formValues.company_enableLiveLocation !== 'false' || item.module_name !== "Live Location") &&
                        (formValues.qr_attendance !== 'false' || item.module_name !== "QR Generator")
                    );
                });
                // newData["QR Attendance"] = false;
            }
 
            if (formValues.company_enableLiveLocation === 'false') {
                newData.modules = newData.modules.filter(item => {
                    return (
                        (formValues.company_enableLiveLocation !== 'false' || item.module_name !== "Live Location")
                    );
                });
                // newData["QR Attendance"] = false;
            }
 
            if (formValues.manual_attendance === 'false') {
                newData.modules = newData.modules.filter(item => {
                    return (
                        (formValues.manual_attendance !== 'false' || item.module_name !== "Manual Attendance")
                    );
                });
            }
 
            if (formValues.offline_attendance === 'false') {
                newData.modules = newData.modules.filter(item => {
                    return (
                        (formValues.offline_attendance !== 'false' || item.module_name !== "Offline Attendance")
                    );
                });
            }
 
           
            if (formValues.otp_deliveryotp === 'false') {
                newData.modules = newData.modules.filter(item => {
                    return (
                        (formValues.otp_deliveryotp !== 'false' || item.module_name !== "Otp Delivery")
                    );
                });
            }
 
           
            if (formValues.otp_paymentotp === 'false') {
                newData.modules = newData.modules.filter(item => {
                    return (
                        (formValues.otp_paymentotp !== 'false' || item.module_name !== "Otp Payment")
                    );
                });
            }
            if (formValues.verify_payment === 'false') {
                newData.modules = newData.modules.filter(item => {
                    return (
                        (formValues.verify_payment !== 'false' || item.module_name !== "Verify Payment")
                    );
                });
            }
            if (formValues.enable_sales_approval === 'false') {
                newData.modules = newData.modules.filter(item => {
                    return (
                        (formValues.enable_sales_approval !== 'false' || item.module_name !== "Enable Sales Approval")
                    );
                });
            }
            if (formValues.enable_payment_approval === 'false') {
                newData.modules = newData.modules.filter(item => {
                    return (
                        (formValues.enable_payment_approval !== 'false' || item.module_name !== "Enable Payment Approval")
                    );
                });
            }
 
            if (formValues.fraud_attendance === 'false') {
                newData.modules = newData.modules.filter(item => {
                    return (
                        (formValues.fraud_attendance !== 'false' || item.module_name !== "Fraud Attendance")
                    );
                });
            }
 
            if (formValues.device_attendance === 'false') {
                newData.modules = newData.modules.filter(item => {
                    return (
                        (formValues.device_attendance !== 'false' || item.module_name !== "Device Attendance")
                    );
                });
            }
 
            if (formValues.showDcInReceivables === 'false') {
                newData.modules = newData.modules.filter(item => {
                    return (
                        (formValues.showDcInReceivables !== 'false' || item.module_name !== "Enable DC in Receivables")
                    );
                });
            }
            if (formValues.applyRoundOff === 'false') {
                newData.modules = newData.modules.filter(item => {
                    return (
                        (formValues.applyRoundOff !== 'false' || item.module_name !== "Apply Round Off (Rounds the total amount to the nearest ₹1)")
                    );
                });
            }
            if (formValues.enable_attendance_with_address === 'false') {
                newData.modules = newData.modules.filter(item => {
                    return (
                        (formValues.enable_attendance_with_address !== 'false' || item.module_name !== "Enable Attendance with Addresss")
                    );
                });
            }
            if (formValues.enable_break_calculation === 'false') {
                newData.modules = newData.modules.filter(item => {
                    return (
                        (formValues.enable_break_calculation !== 'false' || item.module_name !== "Break Duration Calculation")
                    );
                });
            }
 
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
 
            // Update the 'modules' property
            cookieData.modules = updatedModules;
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
                dispatch(
                    updateAppConfigWithCompanyInfoAction(
                        getTrimmedData(formDatas),
                        (response) => {
                            if (response.status === 200) {
                                dispatch(updateRoleAction(storage1?.role_id, newData))
                                if (formValues.gps_attendance === 'false') {
                                    let data = {
                                        gpsAttendance: formValues.gps_attendance,
                                    }
                                    dispatch(updateGpsAttendanceAction(data));
                                }
 
                                // if (formValues.company_enableLiveLocation === 'false') {
                                //     let data1 = {
                                //         enableLiveLocation: formValues.company_enableLiveLocation
                                //     }
                                //     dispatch(updateEnableLiveAction(data1));
                                // }
 
                                // if (formValues.company_enableWorkFromHome === 'false') {
                                //     let data1 = {
                                //         enableWorkFromHome: formValues.company_enableWorkFromHome
                                //     }
                                //     dispatch(updateWorkFromHomeAction(data1));
                                // }
                                // Refresh navigation menus to reflect enabled/disabled features
                                dispatch(getNavigationBootstrapAction({
                                    companyType: storage1.company_type,
                                    subscriptionType: storage1.subscription_type,
                                    type: 'web'
                                }));
                                // Refresh app config so sidebar filters update without reload
                                dispatch(getAppConfigDataAction(null, null));
                            }
                        }
                    ),
                    dispatch(getusermenus(cookieData))
                )
            );
            setEditOpen(false)
            setForm(true);
            setFormValues({ ...formValues, [name]: checked === true ? 'true' : 'false' });
        }
        else{
            dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
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
        const { name, type, checked, value } = e.target;
        setForm(true);
        let temp = formValues.gps_attendance_radius

        if (name === "gps_attendance" && checked === true) {
            setFormValues({ ...formValues, gps_attendance_radius: 100, gps_attendance: 'true' })
            return
        } else if (name === "gps_attendance" && checked === false) {
            setFormValues({ ...formValues, gps_attendance_radius: 0, gps_attendance: 'false' })
            return
        }
   

       
    if (name === 'multi_factor_authentication' && checked) {
   
      setTempValue(checked);
      setDialogOpen(true);
    } else {

      setFormValues({ ...formValues, [name]: checked ? 'true' : 'false' });
    }

    if (name === "face_attendance" && checked) {
        setTempValue({ face_attendance: "true", offline_attendance: "false" });
        setOfflineFaceDialogOpen(true);
        return;
    }

    if (name === "offline_attendance" && checked) {
        setTempValue({ face_attendance: "false", offline_attendance: "true" });
        setOfflineFaceDialogOpen(true);
        return;
    }

    setFormValues((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? (checked ? 'true' : 'false') : value,
    }));


    }

       const handleDialogConfirm = () => {
        setFormValues({ ...formValues, multi_factor_authentication: tempValue ? 'true' : 'false' });
        setDialogOpen(false);
      };
    
      const handleDialogCancel = () => {
        setDialogOpen(false);
        setFormValues({ ...formValues, multi_factor_authentication : false })
      };

      const handleConfirmDisableOffline = () => {
        setFormValues((prev) => ({
            ...prev,
            ...tempValue,
        }));
        setOfflineFaceDialogOpen(false);
    };
    
    const handleOfflineFaceDialogCancel = () => {
        setOfflineFaceDialogOpen(false);
    };

    return (
        <>
            <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | Company Info  </title>
            </Helmet>
            {editOpen === false ? (
                <Grid sx={{ padding: '20px' }}>
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
                        >
                            General Config
                        </Typography>
                        <CommonToolTip title='Edit'>
                            {canEdit && (
                            <IconButton
                                sx={{ height: '100%', weight: '100%' }}
                                onClick={() => {
                                    setEditOpen(true);
                                }}
                            >
                                <EditIcon />
                            </IconButton>
                            )}
                        </CommonToolTip>
                    </Grid>

                    <Grid
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                        <Grid
                            container
                            style={{ paddingTop: '10px' }}
                            spacing={7}
                            direction='row'
                        >



{storage1.company_type !== 3 && (  <Grid
    size={{
        lg: 3,
        md: 4,
        sm: 6,
        xs: 12
    }}>
                                <RedditTextField
                                    label="Enable GPS Attendance"
                                    defaultValue={formValues.gps_attendance === 'true' ? 'Enabled' : 'Disabled'}
                                    id="enable-gps-attendance-input"
                                    variant="filled"
                                    fullWidth
                                />
                            </Grid>)}

                            {storage1.company_type !== 3 && (  <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <RedditTextField
                                    label="GPS Attendance Radius"
                                    defaultValue={formValues['gps_attendance'] === 'true' ? formValues['gps_attendance_radius'] : ''}
                                    id="gps-attendance-radius-input"
                                    variant="filled"
                                    // style={{ marginTop: 11 }}
                                    fullWidth
                                />
                            </Grid>)}


                            <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <RedditTextField
                                    label="Enable Live Location"
                                    defaultValue={formValues.company_enableLiveLocation === 'true' ? 'Enabled' : 'Disabled'}
                                    id="enable-live-location-input"
                                    variant="filled"
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
                                    label="Reporting Manager"
                                    defaultValue={formValues.reportingmanager_contact === 'true' ? 'Enabled' : 'Disabled'}
                                    id="reporting-manager-contact-list"
                                    variant="filled"
                                    // style={{ marginTop: 11 }}
                                    fullWidth
                                />
                            </Grid>




                            {storage1.company_type !== 3 && (      <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <RedditTextField
                                    label="Live Tracking Interval"
                                    defaultValue={formValues.company_enableLiveLocation === 'true' ?
                                        formValues['company_liveTrackingInterval'] === '5s' ? '5 sec' :
                                        formValues['company_liveTrackingInterval'] === '10s' ? '10 sec' :
                                        formValues['company_liveTrackingInterval'] === '15s' ? '15 sec' :
                                        formValues['company_liveTrackingInterval'] === '20s' ? '20 sec' :
                                            formValues['company_liveTrackingInterval'] === '30s' ? '30 sec' :
                                                `${parseInt(formValues['company_liveTrackingInterval']) / 60} min` : ''
                                    }
                                    id="payroll-field-1055-input"
                                    variant="filled"
                                    fullWidth
                                />
                            </Grid>)}


                            {storage1.company_type !== 3 && (      <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <RedditTextField
                                    label="Enable Selfie Attendance"
                                    defaultValue={formValues.selfie_attendance === 'true' ? 'Enabled' : 'Disabled'}
                                    id="enable-selfie-attendance-input"
                                    variant="filled"
                                    fullWidth
                                />
                            </Grid>)}

                            {storage1.company_type !== 3 && (     <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <RedditTextField
                                    label="Enable WIFI Attendance"
                                    defaultValue={formValues.wifi_attendance === 'true' ? 'Enabled' : 'Disabled'}
                                    id="enable-wifi-attendance-input"
                                    variant="filled"
                                    fullWidth
                                />
                            </Grid>)}
                            {storage1.company_type !== 3 && ( 
                            <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <RedditTextField
                                    label="Enable QR Attendance"
                                    defaultValue={formValues.qr_attendance === 'true' ? 'Enabled' : 'Disabled'}
                                    id="enable-qr-attendance-input"
                                    variant="filled"
                                    fullWidth
                                />
                            </Grid>)}

                            {storage1.company_type !== 3 && (      <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <RedditTextField
                                    label="Work From Home"
                                    defaultValue={formValues.company_enableWorkFromHome === 'true' ? 'Enabled' : 'Disabled'}
                                    id="work-from-home-input"
                                    variant="filled"
                                    // style={{ marginTop: 11 }}
                                    fullWidth
                                />
                            </Grid>)}


                            {/* {[3, 4].includes(storage1.subscription_type) &&(
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                <RedditTextField
                                    label="Face Attendance"
                                    defaultValue={formValues.face_attendance === 'true' ? 'Enabled' : 'Disabled'}
                                    id="face-attendance-input"
                                    variant="filled"
                                    // style={{ marginTop: 11 }}
                                    fullWidth
                                />
                            </Grid>
                            )} */}

{storage1.company_type !== 3 && (        <Grid
    size={{
        lg: 3,
        md: 4,
        sm: 6,
        xs: 12
    }}>
                                <RedditTextField
                                    label="Manual Attendance"
                                    defaultValue={formValues.manual_attendance === 'true' ? 'Enabled' : 'Disabled'}
                                    id="manual-attendance-input"
                                    variant="filled"
                                    // style={{ marginTop: 11 }}
                                    fullWidth
                                />
                            </Grid>)}

                            {[2, 3, 4].includes(storage1.subscription_type) &&(
                            <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <RedditTextField
                                    label="Face Attendance"
                                    defaultValue={formValues.offline_attendance === 'true' ? 'Enabled' : 'Disabled'}
                                    id="offline-attendance-input"
                                    variant="filled"
                                    fullWidth
                                />
                            </Grid>
                            )}

{storage1.company_type === 3 && (<Grid
    size={{
        lg: 3,
        md: 4,
        sm: 6,
        xs: 12
    }}>
                                <RedditTextField
                                    label="Delivery Otp"
                                    defaultValue={formValues.otp_deliveryotp === 'true' ? 'Enabled' : 'Disabled'}
                                    id="delivery-otp-input"
                                    variant="filled"
                                    fullWidth
                                />
                            </Grid>)}

                            {storage1.company_type === 3 && (  <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <RedditTextField
                                    label="Payment Otp"
                                    defaultValue={formValues.otp_paymentotp === 'true' ? 'Enabled' : 'Disabled'}
                                    id="payment-otp-input"
                                    variant="filled"
                                    fullWidth
                                />
                            </Grid>)}
                            {storage1.company_type === 3 && (  <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <RedditTextField
                                    label="Verify Payment"
                                    defaultValue={formValues.verify_payment === 'true' ? 'Enabled' : 'Disabled'}
                                    id="verify-payment-input"
                                    variant="filled"
                                    fullWidth
                                />
                            </Grid>)}

                            {storage1.company_type === 3 && (  <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <RedditTextField
                                    label="Enable Sales Approval"
                                    defaultValue={formValues.enable_sales_approval === 'true' ? 'Enabled' : 'Disabled'}
                                    id="enable-sales-approval-input"
                                    variant="filled"
                                    fullWidth
                                />
                            </Grid>)}

                            {storage1.company_type === 3 && (  <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <RedditTextField
                                    label="Enable Payment Approval"
                                    defaultValue={formValues.enable_payment_approval === 'true' ? 'Enabled' : 'Disabled'}
                                    id="enable-payment-approval-input"
                                    variant="filled"
                                    fullWidth
                                />
                            </Grid>)}

                            {storage1.company_type === 3 && (  <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <RedditTextField
                                    label="Enable DC in Receivables"
                                    defaultValue={formValues.showDcInReceivables === 'true' ? 'Enabled' : 'Disabled'}
                                    id="enable-dc-in-receivables-input"
                                    variant="filled"
                                    fullWidth
                                />
                            </Grid>)}

                            {storage1.company_type === 3 && (
                                <Grid
                                    size={{
                                        lg: 3,
                                        md: 4,
                                        sm: 6,
                                        xs: 12
                                    }}>
                                    <RedditTextField
                                        label="Fuel Allowance"
                                        value={
                                            // formValues.fuelallowance === 'true'
                                                 formValues.fuelallowance_automatic === 'true'
                                                    ? 'Automatic - Enabled'
                                                    : 'Manual - Enabled'
                                                // : 'Disabled'
                                        }
                                        id="payroll-field-1288-input"
                                        variant="filled"
                                        fullWidth
                                    />
                                </Grid>
                            )}

                            {storage1.company_type === 3 && (  <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <RedditTextField
                                    label="Enable StoreVisit Selfie"
                                    defaultValue={formValues.enable_storevisit_selfie === 'true' ? 'Enabled' : 'Disabled'}
                                    id="enable-storevisit-selfie-input"
                                    variant="filled"
                                    fullWidth
                                />
                            </Grid>)}


                            {[2, 3, 4].includes(storage1.subscription_type) &&(
                            <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <RedditTextField
                                    label="Fraud Attendance"
                                    defaultValue={formValues.fraud_attendance === 'true' ? 'Enabled' : 'Disabled'}
                                    id="fraud-attendance-input"
                                    variant="filled"
                                    fullWidth
                                />
                            </Grid>
                            )}

                            {([ 3, 4 ].includes(storage1.subscription_type) || storage1?.company_type == 12 || storage1?.company_type == 5 )&& (
                                <Grid
                                    size={{
                                        lg: 3,
                                        md: 4,
                                        sm: 6,
                                        xs: 12
                                    }}>
                                    <RedditTextField
                                        label="Device Attendance"
                                        defaultValue={formValues.device_attendance === 'true' ? 'Enabled' : 'Disabled'}
                                        id="device-attendance-input"
                                        variant="filled"
                                        fullWidth
                                    />
                                </Grid>
                            )}

                            {/* {storage1.company_type !== 3 && (         
                                <Grid
                                    size={{
                                        lg: 3,
                                        md: 4,
                                        sm: 6,
                                        xs: 12
                                    }}>
                                <RedditTextField
                                    label="Enable Multi Factor Authentication"
                                    defaultValue={formValues.multi_factor_authentication === 'true' ? 'Enabled' : 'Disabled'}
                                    id="enable-multi-factor-authentication-input"
                                    variant="filled"
                                    // style={{ marginTop: 11 }}
                                    fullWidth
                                />
                            </Grid>)} */}

                            {storage1.company_type !== 3 && (
                                   <Grid
                                       size={{
                                           lg: 3,
                                           md: 4,
                                           sm: 6,
                                           xs: 12
                                       }}>
                                   <RedditTextField
                                    label="Enable TCS"
                                    defaultValue={formValues.enable_tcs === 'true' ? 'Enabled' : 'Disabled'}
                                    id="enable-tcs-input"
                                    variant="filled"
                                    fullWidth
                                    />
                                </Grid>
                              )}

                         {storage1.company_type !== 3 && (
                                 <Grid
                                     size={{
                                         lg: 3,
                                         md: 4,
                                         sm: 6,
                                         xs: 12
                                     }}>
                                 <RedditTextField
                                    label="Enable TDS"
                                    defaultValue={formValues.enable_tds === 'true' ? 'Enabled' : 'Disabled'}
                                    id="enable-tds-input"
                                    variant="filled"
                                    fullWidth
                                  />
                              </Grid>
                            )}

                         {storage1.company_type !== 3 && (
                                 <Grid
                                     size={{
                                         lg: 3,
                                         md: 4,
                                         sm: 6,
                                         xs: 12
                                     }}>
                                 <RedditTextField
                                    label="Attendance with Addresss"
                                    defaultValue={formValues.enable_attendance_with_address === 'true' ? 'Enabled' : 'Disabled'}
                                    id="attendance-with-addresss-input"
                                    variant="filled"
                                    fullWidth
                                  />
                              </Grid>
                            )}
                            
                            {storage1.company_type === 3 && (  <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <RedditTextField
                                    label="Apply Round Off (Rounds the total amount to the nearest ₹1)"
                                    defaultValue={formValues.applyRoundOff === 'true' ? 'Enabled' : 'Disabled'}
                                    id="apply-round-off-rounds-the-total-amount-to-the-nea-input"
                                    variant="filled"
                                    fullWidth
                                />
                            </Grid>)}

                            {storage1.company_type === 5 && (  
                                <Grid
                                    size={{
                                        lg: 3,
                                        md: 4,
                                        sm: 6,
                                        xs: 12
                                    }}>
                                <RedditTextField
                                    label="Break Duration Calculation"
                                    defaultValue={formValues.enable_break_calculation === 'true' ? 'Enabled' : 'Disabled'}
                                    id="break-duration-calculation-input"
                                    variant="filled"
                                    fullWidth
                                />
                            </Grid>)}


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
                        </Grid>

                        <Grid
                            style={{ marginBottom: '10px', marginTop: '30px' }}
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}></Grid>
                    </Grid>


                </Grid>
            ) : (
                <Grid sx={{ padding: '20px' }}>
                    <Typography
                    className='page-title'
                        variant='h4'
                        align='left'
                        style={{ paddingTop: '10px', paddingBottom: '10px' }}
                    >
                        Update General Config
                    </Typography>

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
                            style={{ paddingTop: '10px' }}
                            spacing={7}
                            direction='row'
                        >


{storage1.company_type !== 3 && (        <Grid
    size={{
        lg: 3,
        md: 4,
        sm: 6,
        xs: 12
    }}>
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
                            </Grid>)}

                            {storage1.company_type !== 3 && (         <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
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
                            </Grid>)}


                                   <Grid
                                       size={{
                                           lg: 3,
                                           md: 4,
                                           sm: 6,
                                           xs: 12
                                       }}>
                                    <Card style={{padding: '5px', height:'100px'}}>
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
                                <Typography sx={{ fontWeight: '500' , fontSize: '11px' }}>Real-time tracking begins once the user marks attendance during a store visit.</Typography>
                                </Card>
                            </Grid>

                            { formValues.company_enableLiveLocation === 'true' && <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
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
                                    <MenuItem value={'5s'}>5 sec</MenuItem>
                                    <MenuItem value={'10s'}>10 sec</MenuItem>
                                    <MenuItem value={'15s'}>15 sec</MenuItem>
                                    <MenuItem value={'20s'}>20 sec</MenuItem>
                                    <MenuItem value={'30s'}>30 sec</MenuItem>
                                    <MenuItem value={'60s'}>1 min</MenuItem>
                                    <MenuItem value={'120s'}>2 min</MenuItem>
                                </TextField>
                                {/* {formValues['company_liveTrackingInterval'] === '' && (
                                    <span style={{ color: 'red', fontSize: '0.75rem' }}>
                                        Live Location is Required!
                                    </span>
                                )} */}

                            </Grid>}
                                {/* { formValues.company_enableLiveLocation === 'false' || storage1.company_type !== 3 && ( <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} item>
                                    <TextField select label="Live Location Interval" variant="filled"
                                        onChange={handleChangeInterval}
                                        value={formValues['company_liveTrackingInterval']}
                                        onBlur={handleChangeInterval}
                                        fullWidth
                                        disabled={formValues.company_enableLiveLocation === 'true' ? false : true}
                                    >
                                    </TextField>
                                </Grid>)} */}




                                {storage1.company_type !== 3 && (     <Grid
                                    size={{
                                        lg: 3,
                                        md: 4,
                                        sm: 6,
                                        xs: 12
                                    }}>
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
                            </Grid>)}

                            {storage1.company_type !== 3 && (      <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
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
                            </Grid>)}

                            {storage1.company_type !== 3 && (    <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
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
                            </Grid>)}


                            {storage1.company_type !== 3 && (       <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
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
                                </Grid>)}


                                {/* {[3, 4].includes(storage1.subscription_type) &&(
                                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                <FormControl
                                    component='fieldset'
                                    fullWidth
                                >
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                name='face_attendance'
                                                checked={formValues.face_attendance === "true"}
                                                size='medium'
                                                color='primary'
                                                label='Enable Face Attendance'
                                                // disabled={formValues.offline_attendance === "true"}
                                                onChange={handleCheck}
                                            />
                                        }
                                        label='Enable Face Attendance'
                                        name='face_attendance'
                                    />
                                </FormControl>
                            </Grid>
                                )} */}

{storage1.company_type !== 3 && ( <Grid
    size={{
        lg: 3,
        md: 4,
        sm: 6,
        xs: 12
    }}>
                                    <FormControl
                                        component='fieldset'
                                        fullWidth
                                    >
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    name='manual_attendance'
                                                    checked={formValues.manual_attendance === 'true' ? true : false}
                                                    size='medium'
                                                    color='primary'
                                                    label='Enable Manual Attendance'
                                                    onChange={handleCheck}
                                                />
                                            }
                                            label='Enable Manual Attendance'
                                            name='manual_attendance'
                                        />
                                    </FormControl>
                                </Grid>)}



                                {[2, 3, 4].includes(storage1.subscription_type)|| storage1.company_type !== 3 && (
                                <Grid
                                    size={{
                                        lg: 3,
                                        md: 4,
                                        sm: 6,
                                        xs: 12
                                    }}>
                                    <FormControl
                                        component='fieldset'
                                        fullWidth
                                    >
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    name='fraud_attendance'
                                                    checked={formValues.fraud_attendance === 'true' ? true : false}
                                                    size='medium'
                                                    color='primary'
                                                    label='Enable Fraud Attendance'
                                                    onChange={handleCheck}
                                                />
                                            }
                                            label='Enable Fraud Attendance'
                                            name='fraud_attendance'
                                        />
                                    </FormControl>
                                </Grid>
                                )}

                                {[2, 3, 4].includes(storage1.subscription_type) &&(
                                <Grid
                                    size={{
                                        lg: 3,
                                        md: 4,
                                        sm: 6,
                                        xs: 12
                                    }}>
                                    <FormControl
                                        component='fieldset'
                                        fullWidth
                                    >
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    name='offline_attendance'
                                                    checked={formValues.offline_attendance === "true"}
                                                    size='medium'
                                                    color='primary'
                                                    label='Enable Face Attendance'
                                                    // disabled={formValues.face_attendance === "true"}
                                                    onChange={handleCheck}
                                                />
                                            }
                                            label='Enable Face Attendance'
                                            name='offline_attendance'
                                        />
                                    </FormControl>
                                </Grid>
                                )}

                                <Grid
                                    size={{
                                        lg: 3,
                                        md: 4,
                                        sm: 6,
                                        xs: 12
                                    }}>
                                    <FormControl
                                        component='fieldset'
                                        fullWidth
                                    >
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    name='reportingmanager_contact'
                                                    checked={formValues.reportingmanager_contact === 'true' ? true : false}
                                                    size='medium'
                                                    color='primary'
                                                    label='List Contacts Based on Reporting Manager'
                                                    onChange={handleCheck}
                                                />
                                            }
                                            label='List Contacts Based on Reporting Manager'
                                            name='reportingmanager_contact'
                                        />
                                    </FormControl>
                                </Grid>

{storage1.company_type === 3 && (<Grid
    size={{
        lg: 3,
        md: 4,
        sm: 6,
        xs: 12
    }}>
                                  <Card style={{padding: '5px', height:'100px'}}>
                                    <FormControl
                                        component='fieldset'
                                        fullWidth
                                    >
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    name='otp_deliveryotp'
                                                    checked={formValues.otp_deliveryotp === "true"}
                                                    size='medium'
                                                    color='primary'
                                                    label='Delivery Otp'
                                                    // disabled={formValues.face_attendance === "true"}
                                                    onChange={handleCheck}
                                                />
                                            }
                                            label='Delivery Otp'
                                            name='otp_deliveryotp'
                                        />
                                    </FormControl>
                                    <Typography sx={{ fontWeight: '500' , fontSize: '11px' }}>Require OTP from customer to confirm product delivery.</Typography>
                                    </Card>
                                </Grid>)}

                               

                                {storage1.company_type === 3 && (   <Grid
                                    size={{
                                        lg: 3,
                                        md: 4,
                                        sm: 6,
                                        xs: 12
                                    }}>
                                    <Card style={{padding: '5px', height:'100px'}}>
                                    <FormControl
                                        component='fieldset'
                                        fullWidth
                                    >
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    name='otp_paymentotp'
                                                    checked={formValues.otp_paymentotp === "true"}
                                                    size='medium'
                                                    color='primary'
                                                    label='Payment Otp'
                                                    // disabled={formValues.face_attendance === "true"}
                                                    onChange={handleCheck}
                                                />
                                            }
                                            label='Payment Otp'
                                            name='otp_paymentotp'
                                        />
                                    </FormControl>
                                    <Typography sx={{ fontWeight: '500' , fontSize: '11px' }}>Verify payment with OTP before completing transaction.</Typography>
                                    </Card>
                                </Grid>)}
                                {storage1.company_type === 3 && (   <Grid
                                    size={{
                                        lg: 3,
                                        md: 4,
                                        sm: 6,
                                        xs: 12
                                    }}>
                                    <Card style={{padding: '5px', height:'100px'}}>
                                    <FormControl
                                        component='fieldset'
                                        fullWidth
                                    >
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    name='verify_payment'
                                                    checked={formValues.verify_payment === "true"}
                                                    size='medium'
                                                    color='primary'
                                                    label='Verify Payment'
                                                    // disabled={formValues.face_attendance === "true"}
                                                    onChange={handleCheck}
                                                />
                                            }
                                            label='Verify Payment'
                                            name='verify_payment'
                                        />
                                    </FormControl>
                                    <Typography sx={{ fontWeight: '500' , fontSize: '11px' }}>Require admin or backend confirmation before marking payment as successful.</Typography>
                                    </Card>
                                </Grid>)}

                                {storage1.company_type === 3 && (   <Grid
                                    size={{
                                        lg: 3,
                                        md: 4,
                                        sm: 6,
                                        xs: 12
                                    }}>
                                    <Card style={{padding: '5px', height:'100px'}}>
                                    <FormControl
                                        component='fieldset'
                                        fullWidth
                                    >
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    name='enable_sales_approval'
                                                    checked={formValues.enable_sales_approval === "true"}
                                                    size='medium'
                                                    color='primary'
                                                    label='Enable Sales Approval'
                                                    // disabled={formValues.face_attendance === "true"}
                                                    onChange={handleCheck}
                                                />
                                            }
                                            label='Enable Sales Approval'
                                            name='enable_sales_approval'
                                        />
                                        <Typography sx={{ fontWeight: '500' , fontSize: '11px' }}>Requires manager approval if customer’s outstanding exceeds limit.</Typography>
                                    </FormControl>
                                    </Card>
                                </Grid>)}

                                {storage1.company_type === 3 && (   <Grid
                                    size={{
                                        lg: 3,
                                        md: 4,
                                        sm: 6,
                                        xs: 12
                                    }}>
                                    <Card style={{padding: '5px', height:'100px'}}>
                                    <FormControl
                                        component='fieldset'
                                        fullWidth
                                    >
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    name='enable_payment_approval'
                                                    checked={formValues.enable_payment_approval === "true"}
                                                    size='medium'
                                                    color='primary'
                                                    label='Enable Payment Approval'
                                                    // disabled={formValues.face_attendance === "true"}
                                                    onChange={handleCheck}
                                                />
                                            }
                                            label='Enable Payment Approval'
                                            name='enable_payment_approval'
                                        />
                                    </FormControl>
                                    <Typography sx={{ fontWeight: '500' , fontSize: '11px' }}>Requests approval if cheque date is past the payment date.</Typography>
                                    </Card>
                                </Grid>)}

                                {storage1.company_type === 3 && (   <Grid
                                    size={{
                                        lg: 3,
                                        md: 4,
                                        sm: 6,
                                        xs: 12
                                    }}>
                                    <Card style={{padding: '5px', height:'100px'}}>
                                    <FormControl
                                        component='fieldset'
                                        fullWidth
                                    >
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    name='showDcInReceivables'
                                                    checked={formValues.showDcInReceivables === "true"}
                                                    size='medium'
                                                    color='primary'
                                                    label='Enable DC in Receivables'
                                                    // disabled={formValues.face_attendance === "true"}
                                                    onChange={handleCheck}
                                                />
                                            }
                                            label='Enable DC in Receivables'
                                            name='showDcInReceivables'
                                        />
                                    </FormControl>
                                    <Typography sx={{ fontWeight: '500' , fontSize: '11px' }}>you can also track your dc in receivables page.</Typography>
                                    </Card>
                                </Grid>)}

                                {storage1.company_type === 3 && (
                                    <Grid
                                        size={{
                                            lg: 3,
                                            md: 4,
                                            sm: 6,
                                            xs: 12
                                        }}>
                                        <Card style={{padding: '5px', height:'100px'}}>
                                        <FormControl component='fieldset' fullWidth>
                                            <FormLabel component="legend">Fuel Allowance</FormLabel>
                                            <RadioGroup
                                                row
                                                name="fuelallowance"
                                                value={
                                                    formValues.fuelallowance_automatic === 'true'
                                                        ? 'automatic'
                                                        : formValues.fuelallowance_manual === 'true'
                                                            ? 'manual'
                                                            : ''
                                                }
                                                onChange={(e) => {
                                                    const selected = e.target.value;
                                                    setForm(true);
                                                    setFormValues((prev) => ({
                                                        ...prev,
                                                        fuelallowance_automatic: selected === 'automatic' ? 'true' : 'false',
                                                        fuelallowance_manual: selected === 'manual' ? 'true' : 'false',
                                                        fuelallowance: 'true'  // If any is selected, set overall fuelallowance to true
                                                    }));
                                                }}
                                            >
                                                <FormControlLabel
                                                    value="manual"
                                                    control={<Radio color="primary" />}
                                                    label="Manual"
                                                />
                                                <FormControlLabel
                                                    value="automatic"
                                                    control={<Radio color="primary" />}
                                                    label="Automatic"
                                                />
                                            </RadioGroup>
                                        </FormControl>
                                        <Typography sx={{ fontWeight: '500' , fontSize: '11px' }}>Enable reimbursement or limits for fuel usage on travel.</Typography>
                                        </Card>
                                    </Grid>
                                )}

                                 {storage1.company_type === 3 && (<Grid
                                     size={{
                                         lg: 3,
                                         md: 4,
                                         sm: 6,
                                         xs: 12
                                     }}>
                                    <Card style={{padding: '5px', height:'100px'}}>
                                    <FormControl
                                        component='fieldset'
                                        fullWidth
                                    >
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    name='enable_storevisit_selfie'
                                                    checked={formValues.enable_storevisit_selfie === "true"}
                                                    size='medium'
                                                    color='primary'
                                                    label='Enable StoreVisit Selfie'
                                                    onChange={handleCheck}
                                                />
                                            }
                                            label='Enable StoreVisit Selfie'
                                            name='enable_storevisit_selfie'
                                        />
                                    </FormControl>
                                    <Typography sx={{ fontWeight: '500' , fontSize: '11px' }}>Require selfie capture during store  visits for verification.</Typography>
                                    </Card>
                                </Grid>)}

                                {storage1.company_type === 3 && (   <Grid
                                    size={{
                                        lg: 3,
                                        md: 4,
                                        sm: 6,
                                        xs: 12
                                    }}>
                                    <Card style={{padding: '5px', height:'100px'}}>
                                    <FormControl
                                        component='fieldset'
                                        fullWidth
                                    >
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    name='applyRoundOff'
                                                    checked={formValues.applyRoundOff === "true"}
                                                    size='medium'
                                                    color='primary'
                                                    label='Apply Round Off (Rounds the total amount to the nearest ₹1)'
                                                    // disabled={formValues.face_attendance === "true"}
                                                    onChange={handleCheck}
                                                />
                                            }
                                            label='Apply Round Off'
                                            name='applyRoundOff'
                                        />
                                    </FormControl>
                                    <Typography sx={{ fontWeight: '500' , fontSize: '11px' }}>Rounds the total amount to the nearest ₹1</Typography>
                                    </Card>
                                </Grid>)}

                                {([ 3, 4 ].includes(storage1.subscription_type) || storage1?.company_type == 12 || storage1?.company_type == 5) && (
                                    <Grid
                                        size={{
                                            lg: 3,
                                            md: 4,
                                            sm: 6,
                                            xs: 12
                                        }}>
                                        <FormControl
                                            component='fieldset'
                                            fullWidth
                                        >
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        name='device_attendance'
                                                        checked={formValues.device_attendance === "true"}
                                                        size='medium'
                                                        color='primary'
                                                        label='Enable Device Attendance'
                                                        onChange={handleCheck}
                                                    />
                                                }
                                                label='Enable Device Attendance'
                                                name='device_attendance'
                                            />
                                        </FormControl>
                                    </Grid>
                                )}
                                {formValues.device_attendance === 'true' && <Grid
                                    size={{
                                        lg: 3,
                                        md: 4,
                                        sm: 6,
                                        xs: 12
                                    }}>
                                <TextField select label="Device Attendance Interval" variant="filled"
                                    onChange={handleChangeDeviceInterval}
                                    value={formValues['device_Interval']}
                                    onBlur={handleChangeDeviceInterval}
                                    fullWidth
                                    required={formValues.device_attendance === 'true'}
                                    regex=''
                                    error={
                                        formValues.device_attendance === 'true' &&
                                        !formValues['device_Interval']
                                    }
                                    helperText={
                                        formValues.device_attendance === 'true' &&
                                            !formValues['device_Interval']
                                            ? 'Device Attendance Interval is required'
                                            : ''
                                    }
                                    disabled={formValues.device_attendance === 'true' ? false : true}
                                >
                                    <MenuItem value={'5s'}>5 sec</MenuItem>
                                    <MenuItem value={'10s'}>10 sec</MenuItem>
                                    <MenuItem value={'15s'}>15 sec</MenuItem>
                                    <MenuItem value={'20s'}>20 sec</MenuItem>
                                    <MenuItem value={'30s'}>30 sec</MenuItem>
                                    <MenuItem value={'60s'}>1 min</MenuItem>
                                    <MenuItem value={'120s'}>2 min</MenuItem>
                                    <MenuItem value={'300s'}>5 min</MenuItem>
                                    <MenuItem value={'600s'}>10 min</MenuItem>
                                </TextField>
                            </Grid>}

                                {/* {storage1.company_type !== 3 && (      
                                    <Grid
                                        size={{
                                            lg: 3,
                                            md: 4,
                                            sm: 6,
                                            xs: 12
                                        }}>
                                    <FormControl
                                        component='fieldset'
                                        fullWidth
                                    >
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    name='multi_factor_authentication'
                                                    checked={formValues.multi_factor_authentication === 'true' ? true : false }
                                                    size='medium'
                                                    color='primary'
                                                    label='Enable Multi Factor Authentication'
                                                    onChange={handleCheck}
                                                />
                                            }
                                            label='Enable Multi Factor Authentication'
                                            name='multi_factor_authentication'
                                        />
                                    </FormControl>

                                    <Dialog open={dialogOpen} onClose={handleDialogCancel}>
                                        <DialogTitle>Confirm Multi-Factor Authentication</DialogTitle>
                                        <DialogContent>
                                            <Typography variant="body1">
                                               Multi-Factor Authentication will be enabled for this company.For all users OTP will be sent to the respective email ID.
                                            </Typography>
                                            <br/>
                                            <Typography variant="body1" color="primary">
                                                Are you sure you want to enable Multi-Factor Authentication?
                                            </Typography>
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={handleDialogCancel} variant='contained' color='error'>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleDialogConfirm} variant='contained' autoFocus>
                                                Confirm
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </Grid>)} */}

                                {storage1.company_type !== 3 && (
                                    <Grid
                                        size={{
                                            lg: 3,
                                            md: 4,
                                            sm: 6,
                                            xs: 12
                                        }}>
                                        <FormControl
                                            component='fieldset'
                                            fullWidth
                                        >
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        name='enable_tcs'
                                                        checked={formValues.enable_tcs === "true"}
                                                        size='medium'
                                                        color='primary'
                                                        label='Enable TCS'
                                                        onChange={handleCheck}
                                                    />
                                                }
                                                label='Enable TCS'
                                                name='enable_tcs'
                                            />
                                        </FormControl>
                                    </Grid>
                                )}

                                {storage1.company_type !== 3 && (
                                    <Grid
                                        size={{
                                            lg: 3,
                                            md: 4,
                                            sm: 6,
                                            xs: 12
                                        }}>
                                        <FormControl
                                            component='fieldset'
                                            fullWidth
                                        >
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        name='enable_tds'
                                                        checked={formValues.enable_tds === "true"}
                                                        size='medium'
                                                        color='primary'
                                                        label='Enable TDS'
                                                        onChange={handleCheck}
                                                    />
                                                }
                                                label='Enable TDS'
                                                name='enable_tds'
                                            />
                                        </FormControl>
                                    </Grid>
                                )}
                                
                                {storage1.company_type !== 3 && (
                                    <Grid
                                        size={{
                                            lg: 3,
                                            md: 4,
                                            sm: 6,
                                            xs: 12
                                        }}>
                                        <FormControl
                                            component='fieldset'
                                            fullWidth
                                        >
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        name='enable_attendance_with_address'
                                                        checked={formValues.enable_attendance_with_address === "true"}
                                                        size='medium'
                                                        color='primary'
                                                        label='Attendance with Addresss'
                                                        onChange={handleCheck}
                                                    />
                                                }
                                                label='Attendance with Addresss'
                                                name='enable_attendance_with_address'
                                            />
                                        </FormControl>
                                    </Grid>
                                )}

                                {storage1.company_type === 5 && (
                                    <Grid
                                        size={{
                                            lg: 3,
                                            md: 4,
                                            sm: 6,
                                            xs: 12
                                        }}>
                                        <FormControl
                                            component='fieldset'
                                            fullWidth
                                        >
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        name='enable_break_calculation'
                                                        checked={formValues.enable_break_calculation === "true"}
                                                        size='medium'
                                                        color='primary'
                                                        label='Break Duration Calculation'
                                                        onChange={handleCheck}
                                                    />
                                                }
                                                label='Break Duration Calculation'
                                                name='enable_break_calculation'
                                            />
                                        </FormControl>
                                    </Grid>
                                )}
                                {formValues.enable_break_calculation === 'true' && <Grid
                                    size={{
                                        lg: 3,
                                        md: 4,
                                        sm: 6,
                                        xs: 12
                                    }}>
                                    <TextField select label="Break Duration Calculation" variant="filled"
                                        onChange={handleChangeBreakInterval}
                                        value={formValues['break_interval']}
                                        onBlur={handleChangeBreakInterval}
                                        fullWidth
                                        required={formValues.enable_break_calculation === 'true'}
                                        regex=''
                                        error={
                                            formValues.enable_break_calculation === 'true' &&
                                            !formValues['break_interval']
                                        }
                                        helperText={
                                            formValues.enable_break_calculation === 'true' &&
                                                !formValues['break_interval']
                                                ? 'Break Duration Calculation is required'
                                                : ''
                                        }
                                        disabled={formValues.enable_break_calculation === 'true' ? false : true}
                                    >
                                        <MenuItem value={'300s'}>5 min</MenuItem>
                                        <MenuItem value={'600s'}>10 min</MenuItem>
                                        <MenuItem value={'900s'}>15 min</MenuItem>
                                        <MenuItem value={'1200s'}>20 min</MenuItem>
                                    </TextField>
                                </Grid>}

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
                            </Grid>

                        <Grid
                            style={{ marginBottom: '10px', marginTop: '30px' }}
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
                                <Grid>
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
                                </Grid>

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
                                        disabled={!changedForm ? true : false}
                                    >
                                        Submit
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
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
