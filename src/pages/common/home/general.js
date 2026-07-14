import { Button, FormControl, FormControlLabel, FormHelperText, Grid, IconButton, MenuItem, Switch, TextField, Typography } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { getAppConfigDataAction, getAppConfigWithCompanyInfoAction, get_checkExistsAction, updateAppConfigWithCompanyInfoAction } from '../../../redux/actions/app_config_actions';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import context from '../../../../src/context/CreateNewButtonContext';
import { getTrimmedData } from '../../../../src/components/trimFunction/index';
import CancelDialog from '../../../../src/components/CancelDialog';
import EditIcon from '@mui/icons-material/Edit';
import apiCalls from 'utils/apiCalls';
import { Helmet } from "react-helmet-async";
import { listCompanyGpsRadiusAction, updateEnableLiveAction, updateGpsAttendanceAction, updateWorkFromHomeAction } from 'redux/actions/company_actions';
import CommonToolTip from '../../../components/ToolTip';
import { getPosPages, getRoleNameAction, getusermenus, listroleAction, updateRoleAction } from 'redux/actions/role_actions';
import { listDashboardAction } from 'redux/actions/dashboard_role_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import { titleURL } from '../../../http-common';
import { useDropzone } from 'react-dropzone';

const StyledTextField = styled(TextField)({
    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
        WebkitAppearance: 'none',
        margin: 0,
    },
    '& input[type=number]': {
        MozAppearance: 'textfield',
    },
});


export default function General({ setCompleted, handleNext, handleBack, activeStep }) {
    const dispatch = useDispatch();
    const storage1 = getsessionStorage()
    const { appConfigReducer: { app_config_data }, roleReducer: { pos_pages, listrole }, DashboardRoleReducer: { getalldashboarddata }, CompanyReducers: { companyRadiusGps } } = useSelector((state) => state);
    console.log(companyRadiusGps, 'compnyrad')
    const tempinitsform = useRef(null);
    const [changedForm, setForm] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [formValues, setFormValues] = useState({
        extra_pay_for_week_off: '',
        double_pay_for_extra_shift: '',
        extra_pay_for_holiday: '',
        holiday_extra_pay_no_of_times_salary: '',
        holiday_extra_pay_flat_amount: '',
        week_off_extra_pay_flat_amount: '',
        week_off_extra_pay_no_of_times_salary: '',
        esi: '',
        pf: '',
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
        face_attendance: '',
        manual_attendance: '',
        offline_attendance:'',
        fraud_attendance:'',
        device_attendance:'',
        device_Interval:''
    });
    const [formErrors, setFormErrors] = useState({
        extra_pay_for_week_off: '',
        double_pay_for_extra_shift: '',
        extra_pay_for_holiday: '',
        max_pl_in_a_month: '',
        holiday_extra_pay_no_of_times_salary: '',
        holiday_extra_pay_flat_amount: '',
        week_off_extra_pay_flat_amount: '',
        week_off_extra_pay_no_of_times_salary: '',
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
        fraud_attendance:'',
        device_attendance:'',
        device_Interval:''
    });
    const [errors, setErrors] = useState({ company_name: '' })

    console.log(formErrors, formValues, 'valerr');

    let requiredFields = ["company_privilegeLeave", "company_privilegeLeaveMaxLimit", "Extra pay For Week Off", "week_off_extra_pay_flat_amount", "week_off_extra_pay_no_of_times_salary", "holiday_extra_pay_flat_amount", "holiday_extra_pay_no_of_times_salary"]

    const [tempDetails, setTempDetails] = useState({ tempCompanyName: '', tempCompanyType: '' })

    console.log("formvalues", formValues)
    const textRef = useRef(null);
    const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(context);
    const [validRegex, setValidRegex] = useState({
        company_email: true,
        company_mobile: true,
        company_privilegeLeaveMaxLimit: true
    });
    const [requiredRegex] = useState([
        'company_email',
        'company_mobile',
    ])
    const interval = [1, 2, 5, 10]

    const alter = { company_phone: /^\d{10}$/, company_mobile: /^\d{10}$/ };
    const [open, setOpen] = useState(false);
    const [touchedFields, setTouchedFields] = useState({});
    const [selectedInterval, setSelectedInterval] = useState(formValues.company_liveTrackingInterval);
    const [selectedRadius, setSelectedRadius] = useState(formValues.gps_attendance_radius);

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
            dispatch(listroleAction(setModalTypeHandler, setLoaderStatusHandler)),
            dispatch(getPosPages()),
            dispatch(getRoleNameAction(data)),
            dispatch(listDashboardAction()),
        );
    };

    useEffect(() => {
        dispatch(listCompanyGpsRadiusAction());
        dispatch(getAppConfigDataAction(setModalTypeHandler, setLoaderStatusHandler,
            (response) => {
                if (response?.length > 0) {
                    let val = { ...formValues }
                    let gps = response?.find(x => x?.key_name == "gps.attendance")?.value
                    if (gps) {
                        val.gps_attendance = gps
                    }
                    setFormValues(val)
                }
            }
        ))
    }, []);

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
    }, [formValues?.company_name, formValues?.company_type_id]);

    useEffect(() => {
        if (app_config_data.length > 0) {
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
    console.log('val', formValues);

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
                        const jpegUrl = canvas.toDataURL('image/jpeg');
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

    const handleChange = async (e) => {
        let { name, value } = e.target;
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
        const maxLimit = parseFloat(value);
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
            else if (name === "Extra pay For Week Off") {
                setFormErrors({
                    ...formErrors,
                    ["week_off_extra_pay_flat_amount"]: 'week_off_extra_pay_flat_amount is Required!',
                    ["week_off_extra_pay_no_of_times_salary"]: 'week_off_extra_pay_no_of_times_salary is Required!',
                });
            }
            else if (name === "Extra pay For Holiday") {
                setFormErrors({
                    ...formErrors,
                    ["holiday_extra_pay_flat_amount"]: 'holiday_extra_pay_flat_amount is Required!',
                    ["holiday_extra_pay_no_of_times_salary"]: 'holiday_extra_pay_no_of_times_salary is Required!'
                })
            }
            else {
                setFormErrors({
                    ...formErrors,
                    [name]: capitalize(name) + ' is Required!',
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
        } else if (name === 'initial_leave_credit') {
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
        } else if (name === 'company_privilegeLeave') {
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
                ["week_off_extra_pay_no_of_times_salary"]: '',
                ["week_off_extra_pay_flat_amount"]: '',
                ["holiday_extra_pay_no_of_times_salary"]: '',
                ["holiday_extra_pay_flat_amount"]: ''
            });
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        let { name, checked } = event.target;
        let isValid = true;
        let formErrorsObj = { ...formErrors };
        const checkRequired = requiredFields;

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

        await setFormErrors(formErrorsObj);

        if (isValid) {
            let formDatas = {
                ...formValues,
                type: 'detailpage',
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
                'fraud.attendance': formValues.fraud_attendance,
                'device.attendance': formValues.device_attendance,
                'device_Interval': formValues.device_Interval,
                'company.privilegeLeave': formValues.company_privilegeLeave,
                'company.privilegeLeaveMaxLimit': formValues.company_privilegeLeaveMaxLimit,
                'company.privilegeLeaveCarryForward': formValues.company_privilegeLeaveCarryForward,
                'extra_pay_for_week_off': formValues.extra_pay_for_week_off,
                'double_pay_for_extra_shift': formValues.double_pay_for_extra_shift,
                'extra_pay_for_holiday': formValues.extra_pay_for_holiday,
                'max_pl_in_a_month': formValues.max_pl_in_a_month,
                'enable_privilege_leave': formValues.enable_privilege_leave,
                'holiday_extra_pay_no_of_times_salary': formValues.extra_pay_for_holiday ? formValues.holiday_extra_pay_no_of_times_salary : '',
                'holiday_extra_pay_flat_amount': formValues.extra_pay_for_holiday ? formValues.holiday_extra_pay_flat_amount : '',
                'pl_leave_type': formValues.enable_privilege_leave === 'true' ? formValues.pl_leave_type : '',
                'initial_leave_credit': formValues.initial_leave_credit,
                "week_off_extra_pay_flat_amount": formValues.extra_pay_for_week_off === 'true' ? formValues.week_off_extra_pay_flat_amount : '',
                "week_off_extra_pay_no_of_times_salary": formValues.extra_pay_for_week_off === 'true' ? formValues.week_off_extra_pay_no_of_times_salary : '',
            };
            let dashboard = getalldashboarddata.map(item => ({
                dashboard_id: item.dashboard_id,
                dashboard_name: item.dashboard_name
            }));
            let newData = {
                "role_id": storage1?.role_id,
                "role_name": storage1?.role_name,
                "modules": listrole,
                "dashboard": dashboard,
                "notifications": pos_pages,
                "company_live_location": formValues.company_enableLiveLocation
            };
            newData.modules = newData.modules.filter(item => (
                (formValues.company_enableLiveLocation !== 'false' || item.module_name !== "Live Location") &&
                (formValues.qr_attendance !== 'false' || item.module_name !== "QR Generator") &&
                (formValues.company_enableWorkFromHome !== 'false' || item.module_name !== "")
            ));
            const storage = sessionStorage.getItem('login');
            const cookieData = JSON.parse(storage);
            cookieData.modules = newData.modules;
            cookieData.company_live_location = newData.company_live_location === "false" ? 0 : 1;
            sessionStorage.setItem('login', JSON.stringify(cookieData));
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
                        },
                        setLoaderStatusHandler,
                        setModalTypeHandler,
                        'detailpage'
                    ),
                    dispatch(getusermenus(cookieData))
                )
            );
            setEditOpen(false);
            setForm(true);
            setFormValues({ ...formValues, [name]: checked === true ? 'true' : 'false' });
            setCompleted(true)
            handleNext()
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

        if (name === "gps_attendance") {
            setFormValues(prevValues => ({
                ...prevValues,
                gps_attendance_radius: checked ? 100 : 0,
                gps_attendance: newValue,
            }));
            return;
        }
        if (name === "device_attendance") {
            setFormValues(prev => ({
                ...prev,
                device_attendance: newValue,
                device_Interval: newValue === 'false' ? '' : prev.device_Interval
            }));
            return;
        }
        setForm(true);
        if (name === "extra_pay_for_week_off") {
            setFormValues(prevValues => ({
                ...prevValues,
                extra_pay_for_week_off: newValue,
                ...(newValue === 'false' && {
                    week_off_extra_pay_flat_amount: '',
                    week_off_extra_pay_no_of_times_salary: ''
                }),
            }));
        }
        else if (name === "extra_pay_for_holiday") {
            setFormValues(prevValues => ({
                ...prevValues,
                extra_pay_for_holiday: newValue,
                ...(newValue === 'false' && {
                    holiday_extra_pay_flat_amount: '',
                    holiday_extra_pay_no_of_times_salary: ''
                }),
            }));
        }
        else {
            setFormValues(prevValues => ({
                ...prevValues,
                [name]: newValue,
            }));
        }
        setForm(true);
    };

    const handleChangeDeviceInterval = (event) => {
        setForm(true);
        setFormValues({
            ...formValues,
            device_Interval: event.target.value,
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

    const handleChangeInterval = (event) => {
        setForm(true);
        setSelectedInterval(event.target.value);
        setFormValues({
            ...formValues,
            company_liveTrackingInterval: event.target.value,
        });
    };

    console.log('SignatureAvatarViewWrapper', formValues?.flat, getRootProps({ className: 'dropzone', name: 'signatureImg' }));

    return (
        <div style={{ height: '100%' }}>
            <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | Company Info  </title>
            </Helmet>
            <Grid sx={{ padding: '20px' }}>
                <Typography
                    className='page-title'
                    variant='h4'
                    align='left'
                    style={{ paddingTop: '10px', paddingBottom: '40px' }}
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

                        <Grid
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


                        <Grid
                            size={{
                                lg: 3,
                                md: 4,
                                sm: 6,
                                xs: 12
                            }}>
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
                        </Grid>

                        <Grid
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

                        </Grid>
                        {/* { formValues.company_enableLiveLocation === 'false' && <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} item>
                                    <TextField select label="Live Location Interval" variant="filled"
                                        onChange={handleChangeInterval}
                                        value={formValues['company_liveTrackingInterval']}
                                        onBlur={handleChangeInterval}
                                        fullWidth
                                        disabled={formValues.company_enableLiveLocation === 'true' ? false : true}
                                    >
                                    </TextField>
                                </Grid>} */}




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
                        </Grid>

                                {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                <FormControl
                                    component='fieldset'
                                    fullWidth
                                >
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                name='face_attendance'
                                                checked={formValues.face_attendance === 'true' ? true : false}
                                                size='medium'
                                                color='primary'
                                                label='Enable Face Attendance'
                                                onChange={handleCheck}
                                            />
                                        }
                                        label='Enable Face Attendance'
                                        name='face_attendance'
                                    />
                                </FormControl>
                            </Grid> */}

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
                                    fullWidth
                                >
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                name='offline_attendance'
                                                checked={formValues.offline_attendance === 'true' ? true : false}
                                                size='medium'
                                                color='primary'
                                                label='Enable Face Attendance'
                                                onChange={handleCheck}
                                            />
                                        }
                                        label='Enable Face Attendance'
                                        name='offline_attendance'
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
                                                checked={formValues.device_attendance === 'true' ? true : false}
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
                        <Grid
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
                                    changedForm &&
                                    formValues.device_attendance === 'true' &&
                                     !formValues.device_Interval
                                }
                                helperText={
                                    changedForm &&
                                    formValues.device_attendance === 'true' &&
                                        !formValues.device_Interval
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
                        </Grid>
                            </Grid>

                </Grid>
            </Grid>
            <Grid sx={{ padding: '20px', maxHeight: 'calc(100vh - 100px)', overflow: 'auto' }} >
                {/* <Typography
                    className='page-title'
                        variant='h6'
                        align='left'
                        style={{ paddingTop: '10px', paddingBottom: '10px' }}
                    >
                        Update Payroll Info
                    </Typography> */}

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
                                            checked={formValues.extra_pay_for_holiday === 'true'}
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
                                        />
                                    }
                                    label='PF'
                                    name='pf'
                                />
                            </FormControl>
                        </Grid> */}
                    </Grid>
                    <Grid
                        style={{ marginBottom: '10px', marginTop: '50px' }}
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
                                    onClick={handleBack}
                                    style={{}}
                                    name='Cancel'
                                    variant='contained'
                                    color='secondary'
                                    size='medium'
                                    text='button'
                                    fullWidth={false}
                                    type='cancel'
                                    disabled={activeStep === 0}
                                >
                                    Back
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
                                // disabled={!changedForm ? true : false}
                                >
                                    Next
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
        </div>
    );
}
