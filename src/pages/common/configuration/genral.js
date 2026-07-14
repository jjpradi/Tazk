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
    FormLabel,
    RadioGroup,
    Radio
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
import { getsessionStorage } from 'pages/common/login/cookies';
import { base_url, host, titleURL } from '../../../http-common';
import { useDropzone } from 'react-dropzone';
import AvatarViewWrapper from 'utils/imgUpload';
import { salaryConfirmedAction } from 'redux/actions/salary_actions';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
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


export default function GeneralInfo() {
    const dispatch = useDispatch();
    const storage1 = getsessionStorage()
    const selectedRole = storage1?.role_name;
    const {
        appConfigReducer: { app_config_data, appConfigWithCompanyInfo }, roleReducer: { pos_pages, module, role_name, listrole }, DashboardRoleReducer: { getalldashboarddata, dashboardRoleData }, customerReducer: { customer_filter, customer_paginate, Get_customer_statement, customer, customerSalesDetailById, customerDetailById }, CompanyReducers: { company_logo, signature, companyRadiusGps }, rbacReducer: { menuAccess },
        SalaryReducers : {salaryConfirmed}
    } = useSelector((state) => state);

    const {
        CompanyReducers: { types },
    } = useSelector((state) => state);
    const tempinitsform = useRef(null);
    const [changedForm, setForm] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    // const [count, setCount] = useState(0);
    const [formValues, setFormValues] = useState({
        // company_privilegeLeave: '',
        // company_privilegeLeaveMaxLimit: '',
        // company_privilegeLeaveCarryForward: '',
        extra_pay_for_week_off: '',
        double_pay_for_extra_shift: '',
        extra_pay_for_holiday: '',
        // max_pl_in_a_month: '',
        // enable_privilege_leave: '',
        holiday_extra_pay_no_of_times_salary: '',
        holiday_extra_pay_flat_amount: '',
        // pl_leave_type: '',
        // initial_leave_credit:'',
        week_off_extra_pay_flat_amount: '',
        week_off_extra_pay_no_of_times_salary: '',
        // company_overtimeAllowance:""
        esi: '',
        pf: '',
        bridging_rule: '',
        calendar_days: '',
     
    });
    const [formErrors, setFormErrors] = useState({
        // company_privilegeLeave: '',
        // company_privilegeLeaveMaxLimit: '',
        // company_privilegeLeaveCarryForward: '',
        extra_pay_for_week_off: '',
        double_pay_for_extra_shift: '',
        extra_pay_for_holiday: '',
        max_pl_in_a_month: '',
        calendar_days: '',
        // enable_privilege_leave: '',
        holiday_extra_pay_no_of_times_salary: '',
        holiday_extra_pay_flat_amount: '',
        // pl_leave_type: '',
        // initial_leave_credit: '',
        week_off_extra_pay_flat_amount:'',
        week_off_extra_pay_no_of_times_salary:'',
        // company_overtimeAllowance:''
       
    });
    const [errors, setErrors] = useState({ company_name: '' })
    const [flag, setFlag] = useState(false)

console.log(formErrors, formValues,'valerr');


    // gst enabled
    let requiredFields = ["company_privilegeLeave", "company_privilegeLeaveMaxLimit","Extra pay For Week Off", "week_off_extra_pay_flat_amount", "week_off_extra_pay_no_of_times_salary", "holiday_extra_pay_flat_amount", "holiday_extra_pay_no_of_times_salary"]



    const [tempDetails, setTempDetails] = useState({ tempCompanyName: '', tempCompanyType: '' })

    console.log("formvalues", formValues)
    const textRef = useRef(null);
    const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(context);
    const [validRegex, setValidRegex] = useState({
        company_email: true,
        company_mobile: true,
        // company_phone: true,
        company_privilegeLeaveMaxLimit: true
    });
    const [requiredRegex] = useState([
        'company_email',
        'company_mobile',
        // 'company_phone',
    ])
    const interval = [1, 2, 5, 10]

    const [selectedInterval, setSelectedInterval] = useState(formValues.company_liveTrackingInterval);

    const [selectedRadius, setSelectedRadius] = useState(formValues.gps_attendance_radius);


    const alter = { company_phone: /^\d{10}$/, company_mobile: /^\d{10}$/ };
    const [open, setOpen] = useState(false);
    const [touchedFields, setTouchedFields] = useState({});
    const [isLoadingLocationData, setIsLoadingLocationData] = useState(false)





    const handleSwitchChange = async (e) => {
        setForm(true);
        let { name, checked } = e.target;
        setFormValues({ ...formValues, [name]: checked });
    };

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
            // dispatch(getAppConfigDataAction(setModalTypeHandler, setLoaderStatusHandler,
            //     (response) => {

            //     }
            // )),
            dispatch(listroleAction(setModalTypeHandler, setLoaderStatusHandler)),
            dispatch(getPosPages()),
            dispatch(getRoleNameAction(data)),
            dispatch(listDashboardAction()),
            dispatch(salaryConfirmedAction())
            //dispatch(getCompanyLogo()),
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
        if(app_config_data.length > 0){
            handleClose();
        }
    }, [app_config_data]);


    const setStateHandler = async (name, value) => {
        let formObj = {};

        formObj = {
            ...formValues,
            [name]: value === '' ? '' : value,
        };

        setFormValues(formObj);
        validationHandler(name, value);
    };

    const handleClose = async () => {
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
            } else {
                value[d.key_name.replace('.', '_')] = d.value;
            }
        });
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(getAppConfigWithCompanyInfoAction(setModalTypeHandler, setLoaderStatusHandler,
                (response) => {
                    if (response.length) {
                        value.first_name = response[0].first_name
                        value.last_name = response[0].last_name
                        value.company_type = response[0].company_type
                        value.company_type_id = response[0].company_type_id
                        setTempDetails({ tempCompanyName: value.company_name, tempCompanyType: response[0].company_type_id })
                    }
                }
            ))
        )
        value.gst_registration = value.company_gstin_uin ? true : false
        setFormValues(value);
        cancelDialog();
        setForm(false);
        setEditOpen(false);
    };
    console.log('val',formValues);

    const [customerData, setcustomer] = useState('');


    const [image, setImage] = useState(null)
    const [isEnabled, setIsEnabled] = useState(false);
    const [imageStatus, setImageStatus] = useState(true);

    const { getRootProps, getInputProps } = useDropzone({
        accept: 'image/jpeg , image/png , image/jpg',
        onDrop: (acceptedFiles) => {
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

    const handesetSaveTrue = () => {
        setIsEnabled(true)
    }
    const handleImage = () => {
        let data = {
            companyId: storage1?.company_id,
            image: image,
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
        if (name === 'calendar_days') {
            if (value !== '') {
                const numericValue = Number(value);
                if (numericValue < 1) value = 1;
                if (numericValue > 31) value = 31;
            }
        } else if (value < 0) {
            value = 0;
        }
        setStateHandler(name, value);
        setForm(true);
    };




    const capitalize = (s) => {
        if (typeof s !== 'string') return '';
        return s.charAt(0).toUpperCase() + s.slice(1);
    };

    const validationHandler = (name, value) => {
        if (!Object.keys(formErrors).includes(name)) return;
        let checkRequired = requiredFields 
        const maxLimit = parseFloat(value);  // Assuming the value is a number
        const privilegeLeave = parseFloat(formValues.company_privilegeLeave);
        if (
            checkRequired.includes(name) &&
            (value === '' ||
                value === '' ||
                value === '' ||
                value === false ||
                (Object.keys(value) && value.value === ''))
        ) {
            if (name === 'address_pincode') {
                setFormErrors({
                    ...formErrors,
                    [name]: 'Company Pincode is Required!',
                });
            }
            else if (name === "Extra pay For Week Off"  ){
                setFormErrors({
                    ...formErrors,
                    ["week_off_extra_pay_flat_amount"]: 'This field is Required!',
                    ["week_off_extra_pay_no_of_times_salary"]: 'This field is Required!',
                });
            }
            else if(name === "Extra pay For Holiday") {
                setFormErrors({
                    ...formErrors,
                    ["holiday_extra_pay_flat_amount"] : 'This field is Required!',
                    ["holiday_extra_pay_no_of_times_salary"] : 'This field is Required!'
                })
            }
            else {
                console.log("comes else");
                
                setFormErrors({
                    ...formErrors,
                    [name]: capitalize(name.replace(/_/g, ' ')) + ' is Required!',
                });
            }
        }
        else if (name === 'company_privilegeLeaveMaxLimit') {
            if (touchedFields[name] && isNaN(maxLimit) || maxLimit < privilegeLeave) {
                setValidRegex({ ...validRegex, company_privilegeLeaveMaxLimit: false });
                setFormErrors({
                    ...formErrors,
                    [name]: 'Should be greater or equal to Privilege Leaves',
                });
            } else {
                setFormErrors({
                    ...formErrors,
                    [name]: '',
                });
                setValidRegex({ ...validRegex, company_privilegeLeaveMaxLimit: true });
            }
        }else if(name === 'initial_leave_credit'){
            console.log("ididididi");
            if (isNaN(maxLimit)) {
                setValidRegex({ ...validRegex, initial_leave_credit: false });
                setFormErrors({
                    ...formErrors,
                    [name]: capitalize(name) + ' is Required!',
                });
            } else {
                setFormErrors({
                    ...formErrors,
                    [name]: '',
                });
                setValidRegex({ ...validRegex, company_privilegeLeaveMaxLimit: true });
            }
        }else if(name === 'company_privilegeLeave'){
            console.log("ididididi");
            if (isNaN(maxLimit)) {
                setValidRegex({ ...validRegex, company_privilegeLeave: false });
                setFormErrors({
                    ...formErrors,
                    [name]: capitalize(name) + ' is Required!',
                });
            } else {
                setFormErrors({
                    ...formErrors,
                    [name]: '',
                });
                setValidRegex({ ...validRegex, company_privilegeLeaveMaxLimit: true });
            }
        }
        
        else {
            setFormErrors({
                ...formErrors,
                [name]: '',
                ["week_off_extra_pay_no_of_times_salary"]:'',
                ["week_off_extra_pay_flat_amount"]:'',
                ["holiday_extra_pay_no_of_times_salary"] : '',
                ["holiday_extra_pay_flat_amount"] : ''
            });
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        let { name, checked } = event.target;
        let isValid = true;
        let formErrorsObj = { ...formErrors };
        const checkRequired = requiredFields;
    
        // Validate form values
        Object.keys(formValues).forEach((key) => {
            if (checkRequired.includes(key) && !formValues[key] && formValues[key] === null) {
                isValid = false;
                formErrorsObj[key] = `${capitalize(key)} is Required!`;
            } else if (key === 'extra_pay_for_week_off' && formValues[key] === 'true') {
                if (!formValues.week_off_extra_pay_flat_amount && !formValues.week_off_extra_pay_no_of_times_salary) {
                    isValid = false;
                    formErrorsObj["week_off_extra_pay_no_of_times_salary"] = 'No Of Times Salary is Required!';
                    formErrorsObj["week_off_extra_pay_flat_amount"] = 'Flat Amount is Required!';
                }
            } else if (key === 'extra_pay_for_holiday' && formValues[key] === 'true') {
                if (!formValues.holiday_extra_pay_flat_amount && !formValues.holiday_extra_pay_no_of_times_salary) {
                    isValid = false;
                    formErrorsObj["holiday_extra_pay_no_of_times_salary"] = 'No Of Times Salary is Required!';
                    formErrorsObj["holiday_extra_pay_flat_amount"] = 'Flat Amount is Required!';
                }
            } else if (alter[key] && formValues[key] && !alter[key].test(formValues[key])) {
                isValid = false;
                formErrorsObj[key] = `${capitalize(key)} is Invalid!`;
            } else if (key === 'initial_leave_credit' && formValues.pl_leave_type === 'initial_credit' && isNaN(parseInt(formValues[key]))) {
                isValid = false;
                formErrorsObj["initial_leave_credit"] = 'Initial Credit is Required!';
            } else if (key === 'company_privilegeLeave' && formValues.pl_leave_type === 'earned' && isNaN(parseInt(formValues[key]))) {
                isValid = false;
                formErrorsObj["company_privilegeLeave"] = 'Privilege Leave is Required!';
            }
        });
    
        // Update form errors state
        await setFormErrors(formErrorsObj);
    
        if (isValid) {
            // Prepare form data
            let formDatas = {
                ...formValues,
                'company.privilegeLeave': formValues.company_privilegeLeave,
                'company.privilegeLeaveMaxLimit': formValues.company_privilegeLeaveMaxLimit,
                'company.privilegeLeaveCarryForward': formValues.company_privilegeLeaveCarryForward,
                'extra_pay_for_week_off': formValues.extra_pay_for_week_off,
                'double_pay_for_extra_shift': formValues.double_pay_for_extra_shift,
                'extra_pay_for_holiday': formValues.extra_pay_for_holiday,
                'bridging_rule': formValues.bridging_rule,
                'max_pl_in_a_month': formValues.max_pl_in_a_month,
                'calendar_days': formValues.calendar_days,
                'enable_privilege_leave': formValues.enable_privilege_leave,
                'holiday_extra_pay_no_of_times_salary': formValues.extra_pay_for_holiday ? formValues.holiday_extra_pay_no_of_times_salary : '',
                'holiday_extra_pay_flat_amount': formValues.extra_pay_for_holiday ? formValues.holiday_extra_pay_flat_amount : '',
                'pl_leave_type': formValues.enable_privilege_leave === 'true' ? formValues.pl_leave_type : '',
                'initial_leave_credit': formValues.initial_leave_credit,
                "week_off_extra_pay_flat_amount": formValues.extra_pay_for_week_off === 'true' ? formValues.week_off_extra_pay_flat_amount : '',
                "week_off_extra_pay_no_of_times_salary": formValues.extra_pay_for_week_off === 'true' ? formValues.week_off_extra_pay_no_of_times_salary : '',
               
            };
    
            // Map dashboard data
            let dashboard = getalldashboarddata.map(item => ({
                dashboard_id: item.dashboard_id,
                dashboard_name: item.dashboard_name
            }));
    
            // Create newData object
            let newData = {
                "role_id": storage1?.role_id,
                "role_name": storage1?.role_name,
                "modules": listrole,
                "dashboard": dashboard,
                "notifications": pos_pages,
                "company_live_location": formValues.company_enableLiveLocation
            };
    
            // Filter modules based on conditions
            newData.modules = newData.modules.filter(item => (
                (formValues.company_enableLiveLocation !== 'false' || item.module_name !== "Live Location") &&
                (formValues.qr_attendance !== 'false' || item.module_name !== "QR Generator") &&
                (formValues.company_enableWorkFromHome !== 'false' || item.module_name !== "")
            ));
    
            // Update session storage
            const storage = sessionStorage.getItem('login');
            const cookieData = JSON.parse(storage);
            cookieData.modules = newData.modules;
            cookieData.company_live_location = newData.company_live_location === "false" ? 0 : 1;
            sessionStorage.setItem('login', JSON.stringify(cookieData));
    
            // API calls and dispatch actions
            await apiCalls(
                setLoaderStatusHandler,
                setModalTypeHandler,
                dispatch(
                    updateAppConfigWithCompanyInfoAction(
                        getTrimmedData(formDatas),
                        (response) => {
                            if (response.status === 200) {
                                // dispatch(updateRoleAction(storage1?.role_id, newData));
                                if (formValues.gps_attendance === 'false') {
                                    dispatch(updateGpsAttendanceAction({ gpsAttendance: formValues.gps_attendance }));
                                }
                                if (formValues.company_enableLiveLocation === 'false') {
                                    dispatch(updateEnableLiveAction({ enableLiveLocation: formValues.company_enableLiveLocation }));
                                }
                                if (formValues.company_enableWorkFromHome === 'false') {
                                    dispatch(updateWorkFromHomeAction({ enableWorkFromHome: formValues.company_enableWorkFromHome }));
                                }
                            }
                        }
                    ),
                    dispatch(getusermenus(cookieData))
                )
            );
    
            // Update state and close modal
            setEditOpen(false);
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
        let { name, checked } = e.target;
        const newValue = checked ? 'true' : 'false';
        setForm(true);
        let temp = formValues.gps_attendance_radius

        if (name === "gps_attendance") {
            setFormValues(prevValues => ({
                ...prevValues,
                gps_attendance_radius: checked ? 100 : 0,
                gps_attendance: newValue,
            }));
        } else if (name === "extra_pay_for_week_off") {
            setFormValues(prevValues => ({
                ...prevValues,
                extra_pay_for_week_off: newValue,
                ...(newValue === 'false' && { week_off_extra_pay_flat_amount: '' , week_off_extra_pay_no_of_times_salary : '' }),
            }));
        } else if (name === "extra_pay_for_holiday") {
            setFormValues(prevValues => ({
                ...prevValues,
                extra_pay_for_holiday: newValue,
                ...(newValue === 'false' && { holiday_extra_pay_flat_amount: '' , holiday_extra_pay_no_of_times_salary : '' }),
            }));
        } else {
            setFormValues(prevValues => ({
                ...prevValues,
                [name]: newValue,
            }));
        }

        setForm(true);

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



    console.log('SignatureAvatarViewWrapper',formValues?.flat, getRootProps({ className: 'dropzone', name: 'signatureImg' }));

    const canEdit = storage1?.company_type === 5 ? UserRightsAuthorization(menuAccess[selectedRole], 'config__payroll', 'can_edit') : true ;

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
                            Payroll Info
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
                            
                            <Grid
                                size={{
                                    lg: 12,
                                    md: 12,
                                    sm: 12,
                                    xs: 12
                                }}>
                                <Typography
                                    align='left'
                                    variant='h5'
                                >
                                    Week Off & Holiday
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
                                    label="Extra Pay For Week Off"
                                    defaultValue={formValues.extra_pay_for_week_off === 'true' ? 'Enabled' : 'Disabled'}
                                    id="extra-pay-for-week-off-input"
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
                                    label="Flat amount"
                                    defaultValue={formValues['week_off_extra_pay_flat_amount']}
                                    id="flat-amount-input"
                                    variant="filled"
                                    disabled={formValues.extra_pay_for_week_off === 'false' || formValues['week_off_extra_pay_flat_amount'] === "" }
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
                                    label="Salary * no of times"
                                    defaultValue={formValues['week_off_extra_pay_no_of_times_salary']}
                                    id="salary-no-of-times-input"
                                    variant="filled"
                                    disabled={formValues.extra_pay_for_week_off === 'false' || formValues['week_off_extra_pay_no_of_times_salary'] === ""}
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
                                    label="Extra Pay For Holiday"
                                    defaultValue={formValues.extra_pay_for_holiday === 'true' ? 'Enabled' : 'Disabled'}
                                    id="extra-pay-for-holiday-input"
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
                                    label="Flat amount"
                                    defaultValue={formValues['holiday_extra_pay_flat_amount']}
                                    id="flat-amount-input-2"
                                    variant="filled"
                                    disabled={formValues.extra_pay_for_holiday === 'false' || formValues['holiday_extra_pay_flat_amount'] === "" }
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
                                    label="Salary * no of times"
                                    defaultValue={formValues['holiday_extra_pay_no_of_times_salary']}
                                    id="salary-no-of-times-input-2"
                                    variant="filled"
                                    disabled={formValues.extra_pay_for_holiday === 'false' || formValues['holiday_extra_pay_no_of_times_salary'] === ""}
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
                                    label="Double Pay for extra shift"
                                    defaultValue={formValues.double_pay_for_extra_shift === 'true' ? 'Enabled' : 'Disabled'}
                                    id="double-pay-for-extra-shift-input"
                                    variant="filled"
                                    // style={{ marginTop: 11 }}
                                    fullWidth
                                />
                            </Grid>
                            {/* <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <RedditTextField
                                    label="ESI"
                                    defaultValue={formValues.esi === 'true' ? 'Enabled' : 'Disabled'}
                                    id="esi-input"
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
                                    label="PF"
                                    defaultValue={formValues.pf === 'true' ? 'Enabled' : 'Disabled'}
                                    id="pf-input"
                                    variant="filled"
                                    // style={{ marginTop: 11 }}
                                    fullWidth
                                />
                            </Grid> */}
                            <Grid lg={3} md={4} sm={6} xs={12} item={true}>
                                <RedditTextField
                                    label="Bridging Rule"
                                    defaultValue={formValues.bridging_rule === 'true' ? 'Enabled' : 'Disabled'}
                                    id="bridging-rule-input"
                                    variant="filled"
                                    fullWidth
                                />
                            </Grid>
                            <Grid lg={3} md={4} sm={6} xs={12} item={true}>
                                <RedditTextField
                                    label="Calendar Days"
                                    defaultValue={formValues.calendar_days}
                                    id="calendar-days-input"
                                    variant="filled"
                                    fullWidth
                                />
                            </Grid>
                         

                            {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                                    item
                                    sx={{
                                        display: { xs: "none", lg: "block" }
                                    }}
                                >
                                    <span></span>
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
                <Grid sx={{ padding: '20px', maxHeight: 'calc(100vh - 100px)', overflow: 'auto' }} >
                    <Typography
                    className='page-title'
                        variant='h6'
                        align='left'
                        style={{ paddingTop: '10px', paddingBottom: '10px' }}
                    >
                        Update Payroll Info
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

                            <Grid
                                size={{
                                    lg: 12,
                                    md: 12,
                                    sm: 12,
                                    xs: 12
                                }}>
                                <Typography
                                    align='left'
                                    variant='h5'
                                >
                                    Week Off & Holiday
                                </Typography>
                            </Grid>

                            <Grid
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
                                                name='extra_pay_for_week_off'
                                                size='medium'
                                                color='primary'
                                                label='Extra pay For Week Off'
                                                onChange={handleCheck}
                                                checked={formValues.extra_pay_for_week_off === 'true'}
                                            />
                                        }
                                        label='Extra pay For Week Off'
                                        name='extra_pay_for_week_off'
                                    />
                                </FormControl>
                            </Grid>

                            {/* <Grid container spacing={4} alignItems="center" padding={6}> */}
                            
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
                                            fullWidth={true}
                                            label='Flat amount'
                                            name='week_off_extra_pay_flat_amount'
                                            value={formValues.extra_pay_for_week_off === 'true' ? formValues['week_off_extra_pay_flat_amount'] : ''}
                                            color='primary'
                                            type='number'
                                            variant='filled'
                                            disabled={formValues.extra_pay_for_week_off !== 'true' || formValues['week_off_extra_pay_no_of_times_salary'] !== ''}
                                            error={formValues.extra_pay_for_week_off === 'true' && formErrors.week_off_extra_pay_flat_amount !== ''}
                                            helperText={formValues.extra_pay_for_week_off === 'true' && formErrors.week_off_extra_pay_flat_amount}
                                        />
                                    </Grid>
                                    <Grid
                                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        OR
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
                                            label='Salary * no of times'
                                            name='week_off_extra_pay_no_of_times_salary'
                                            value={formValues.extra_pay_for_week_off === 'true' ? formValues['week_off_extra_pay_no_of_times_salary'] : ''}
                                            color='primary'
                                            type='number'
                                            variant='filled'
                                            disabled={formValues.extra_pay_for_week_off !== 'true' || formValues['week_off_extra_pay_flat_amount'] !== ''}
                                            error={formValues.extra_pay_for_week_off === 'true' && formErrors.week_off_extra_pay_no_of_times_salary !== ''}
                                            helperText={formValues.extra_pay_for_week_off === 'true' && formErrors.week_off_extra_pay_no_of_times_salary}
                                        />
                                    </Grid>

                                </>
                            
                            <Grid
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
                                                name='extra_pay_for_holiday'
                                                size='medium'
                                                color='primary'
                                                label='Extra pay For Holiday'
                                                onChange={handleCheck}
                                                checked={formValues.extra_pay_for_holiday === 'true' }
                                            />
                                        }
                                        label='Extra pay For Holiday'
                                        name='extra_pay_for_holiday'
                                    />
                                </FormControl>
                            </Grid>

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
                                            fullWidth={true}
                                            label="Flat amount"
                                            name="holiday_extra_pay_flat_amount"
                                            value={formValues.extra_pay_for_holiday === 'true' ? formValues['holiday_extra_pay_flat_amount'] : ''}
                                            color="primary"
                                            type="number"
                                            variant="filled"
                                            disabled={formValues.extra_pay_for_holiday !== 'true' || formValues['holiday_extra_pay_no_of_times_salary'] !== ''}
                                            error={formValues.extra_pay_for_holiday === 'true' && formErrors.holiday_extra_pay_flat_amount !== ''}
                                            helperText={formValues.extra_pay_for_holiday === 'true' && formErrors.holiday_extra_pay_flat_amount}
                                        />
                                    </Grid>

                                    <Grid
                                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        OR
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
                                            label="Salary * no of times"
                                            name="holiday_extra_pay_no_of_times_salary"
                                            value={formValues.extra_pay_for_holiday === 'true' ? formValues['holiday_extra_pay_no_of_times_salary'] : ''}
                                            color="primary"
                                            type="number"
                                            variant="filled"
                                            disabled={formValues.extra_pay_for_holiday !== 'true' || formValues['holiday_extra_pay_flat_amount'] !== ''}
                                            error={formValues.extra_pay_for_holiday === 'true' && formErrors.holiday_extra_pay_no_of_times_salary !== ''}
                                            helperText={formValues.extra_pay_for_holiday === 'true' && formErrors.holiday_extra_pay_no_of_times_salary}
                                        />
                                    </Grid>


                                </>
                            <Grid
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
                                                name='double_pay_for_extra_shift'
                                                size='medium'
                                                color='primary'
                                                label='Double Pay for extra shift'
                                                onChange={handleCheck}
                                                checked={formValues.double_pay_for_extra_shift === 'true' ? true : false}
                                            />
                                        }
                                        label='Double Pay for extra shift'
                                        name='double_pay_for_extra_shift'
                                    />
                                </FormControl>
                            </Grid>
                            {/* <Grid
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
                                                name='esi'
                                                size='medium'
                                                color='primary'
                                                label='ESI'
                                                onChange={handleCheck}
                                                checked={formValues.esi === 'true' ? true : false}
                                            />
                                        }
                                        label='ESI'
                                        name='esi'
                                    />
                                </FormControl>
                            </Grid>
                            <Grid
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
                                                name='pf'
                                                size='medium'
                                                color='primary'
                                                label='PF'
                                                onChange={handleCheck}
                                                checked={formValues.pf === 'true' ? true : false}
                                                disabled = {salaryConfirmed?.length > 0 ? salaryConfirmed.some(s => s.Status === 'Confirmed') : false}
                                            />
                                        }
                                        label='PF'
                                        name='pf'
                                    />
                                </FormControl>
                            </Grid> */}
                            <Grid item={true} lg={3} md={4} sm={6} xs={12}>
                                <FormControl
                                    component='fieldset'
                                    fullWidth={true}
                                >
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                name='bridging_rule'
                                                size='medium'
                                                color='primary'
                                                label='Bridging Rule'
                                                onChange={handleCheck}
                                                checked={formValues.bridging_rule === 'true' ? true : false}
                                            />
                                        }
                                        label='Bridging Rule'
                                        name='bridging_rule'
                                    />
                                </FormControl>
                            </Grid>
                            <Grid lg={3} md={4} sm={6} xs={12} item={true}>
                                <TextField
                                    onChange={handleChange}
                                    onBlur={handleChange}
                                    fullWidth={true}
                                    label='Calendar Days'
                                    name='calendar_days'
                                    value={formValues.calendar_days || ''}
                                    color='primary'
                                    type='number'
                                    variant='filled'
                                    inputProps={{ min: 1, max: 31 }}
                                    helperText='Allowed range: 1 to 31'
                                />
                            </Grid>
                         

                            {/* </Grid> */} 

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
