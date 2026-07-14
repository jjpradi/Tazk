import {
    AppBar,
    Autocomplete,
    Box,
    Button,
    Card,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Grid,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import { emailValidation, phoneValidation } from 'components/regexFunction';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    InsertSubscription,
    UpdateCompanyTimeLineAction,
    getRegisterRequestAction,
    loadRegisteredAction,
    updateSubscriptionRecords,
    updateUserGrAction
} from 'redux/actions/userCreation_actions';
import apiCalls from 'utils/apiCalls';
import TimeLine from './timeLine';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker, LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { getsessionStorage } from 'pages/common/login/cookies';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { baseURL } from '../../../http-common';
import DisabledByDefaultRoundedIcon from '@mui/icons-material/DisabledByDefaultRounded';
import CommonToolTip from 'components/ToolTip';
import MaterialTable from 'utils/SafeMaterialTable';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { headerStyle, cellStyle } from 'utils/pageSize';
import CompanySubscription from 'pages/common/CompanySubscription';
import { useLocation } from 'react-router-dom';
import { getShopTypeAction, getSubscriptionRecords, UpdateCompanyDetailsAction } from 'redux/actions/superAdmin_action';


function StandardImageList1(props) {
    return (
        <Grid>
            <ImageList sx={{ height: 'auto' }} cols={3} gap={8}>
                {props?.images?.map((item) => (
                    <ImageListItem key={item.img_name}>
                        <img
                            src={item.img_url}
                            alt={item.img_name}
                            loading='lazy'
                            style={{ width: '100%', height: 'auto' }}
                        />
                    </ImageListItem>
                ))}
            </ImageList>
        </Grid>
    );
}
export default function RequestEditAndApprove(props) {
    const { rowData, closeDialog, value } = props;
    const dispatch = useDispatch();
    const edit = false;
    const [timeLineContent, setTimeLineContent] = useState([]);
    const [formValues, setFormValues] = useState({});
    const [init, setInit] = useState(false);
    const [regex] = useState({});
    const mode = rowData.isApproved === 'Approved' ? 'edit' : 'view';
    const [tabValue, setTabValue] = useState(0);
    const [button, setButton] = useState(0);
    const [subscription, setSubscription] = useState(false)
    const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
    const [addSubscription, setAddSubscription] = useState({ startDate: null, endDate: null });
    const [mainTimeLineContent, setMainTimeLineContent] = useState(rowData.timeLineContent);
    const location = useLocation();
    const isPendingActivations = location.pathname === "/superadmin/pendingActivations";
    const { UserCreationReducer: { RegisteredUserGR, RegisteredUserGRCount, getShopType,
        subscription_records } } = useSelector(state => state)
    let storage = getsessionStorage();
    useEffect(() => { (async () => {
        const fetchData = async () => {
            // console.log("sfsf",rowData)
            await setFormValues(rowData);
            await setInit(true);
        };

        fetchData();
    })();
}, []);
    // console.log("rowData:",rowData);


    let activeSubs = subscription_records.filter((d, i) => d.status === 'ACTIVE_SUB')
    let upComingSubs = subscription_records.filter((d, i) => d.status === 'UPCOMING_SUB')
    const approveStatus = {
        'INACTIVE_SUB': 'warning',
        'ACTIVE_SUB': 'success',
        'UPCOMING_SUB': 'success'
    };
    const sambil = {
        "ACTIVE_SUB": "Active Subscription",
        "UPCOMING_SUB": "Up Coming Subscription",
        "INACTIVE_SUB" : "InActive Subscription"
    }
    // let subscriptionTimelineContent = RegisteredUserGR?.map(user => {
    //     // Find timeline entries related to subscriptions and reverse them
    //     let subscriptionTimeline = user.timeLineContent
    //       .filter(entry => entry.content.includes('Subscription'))
    //       .map(entry => entry.content)
    //       .reverse();

    //     return { company_name: user.company_name, subscriptionTimeline };
    // });

    const [alteredNames] = useState({
        company_name: 'Company name',
        email: 'Email',
        phone_number: 'Phone number',
        first_name: 'First name',
        longitude: 'Longitude',
        latitude: 'Latitude',
        sStartDate: 'Subscription Start date',
        sEndDate: 'Subscription End date',
        address: 'Address',
    });
    const [formErrors, setFormErrors] = useState({
        company_name: null,
        // email: null,
        first_name: null,
        latitude: null,
        longitude: null,
        phone_number: null,
        sStartDate: null,
        sEndDate: null,
        address: null,
        shop_type:null
    });

    const [requiredFields, setRequiredFields] = useState([
        'company_name',
        'first_name',
        'phone_number',
        'first_name',
        'phone_number',
        'sStartDate',
        'sEndDate',
    ]);

    useEffect(()=>{

        if(formValues.company_type == 'Grow Retail'){
            // console.log("asdad")
            setRequiredFields([...requiredFields,'shop_type'])
        }
    },[formValues.company_type])

    // console.log("requiredFields",requiredFields)
    useEffect(() => {
        dispatch(getSubscriptionRecords(rowData.company_id))
        dispatch(getShopTypeAction())
    },[])
    const capitalize = (s) => {
        if (typeof s !== 'string') return '';
        return s.charAt(0).toUpperCase() + s.slice(1);
    };

    var today = new Date();
    let todayDate = moment(today).format('DD/MM/YYYY HH:mm:ss');
    // Add 90 days to the current date
    let period = value === 1 ? 180 : 14  //value = 1 is 'GrowRetail',0 = 'Tazk'
    var futureDate = new Date();
    futureDate.setDate(today.getDate() + period);

    let OGfutureDate = moment(futureDate).format('DD/MM/YYYY HH:mm:ss');


    const startDate = moment(todayDate);
    const endDate = moment(OGfutureDate);

    // const daysDifference = endDate.diff(startDate, 'days');


    const dayDiff = () => {
        // let startMoment = moment(formValues?.sStartDate, 'YYYY-MM-DD HH:mm:ss');
        const startDate = rowData.sIsExpired === 0 ? moment(rowData.sEndDate).format('YYYY-MM-DD HH:mm:ss') : moment(formValues.sStartDate).format('YYYY-MM-DD HH:mm:ss')


        let endMoment = moment(formValues?.sEndDate, 'YYYY-MM-DD HH:mm:ss');

        let differenceInDays = endMoment.diff(startDate, 'days');

        return differenceInDays
    }

    let currDate = moment(); // Current date and time

    // Convert endDate to a moment object
    let endMoment = moment(formValues?.sEndDate, 'YYYY-MM-DD HH:mm:ss');

    // Calculate the difference in days
    let differenceInDays = endMoment.diff(currDate, 'days');



    // useEffect(() => {

    //     const temp = RegisteredUserGR?.find(d => d.company_id === rowData.company_id)?.timeLineContent
    //     setMainTimeLineContent(temp)
    // },[])
    const sampleFunc = () => {
        const oldRow = rowData;
        const newRow = formValues;
        const newArray = {
            ...newRow,
            latitude: newRow.latitude !== null ? parseFloat(newRow.latitude) : null,
            longitude:
                newRow.longitude !== null ? parseFloat(newRow.longitude) : null,
        };
        let changed = {};

        Object.keys(oldRow).forEach((keys) => {
            if (oldRow[keys] !== newArray[keys]) {
                changed[keys] = newArray[keys];
            }
        });

        const dddd = Object.keys(changed).map((element, index) => {
            // let displayName = element
            //     .replace(/_/g, ' ')
            //     .replace(/(?:^|\s)\S/g, function (a) {
            //         return a.toUpperCase();
            //     });
            if (rowData[element] === null || rowData[element] === '') {
                if (element === 'sStartDate' || element === 'sEndDate') {
                    return ` ${alteredNames[element]} has been updated to ${moment(formValues[element]).format('DD/MM/YYYY')}`;
                }
                else{
                    return ` ${alteredNames[element]} has been updated to ${formValues[element]}`;
                }
            } else if (newArray[element] === null) {
                return ` ${alteredNames[element]} has been removed`;
            } else {
                if (element === 'sStartDate' || element === 'sEndDate') {
                    if (element === 'sEndDate') {
                        return `  Subscription has been changed ,Start date : ${moment(formValues.sStartDate).format('DD-MM-YYYY')} End date :  ${moment(formValues.sEndDate).format('DD-MM-YYYY')}`;
                    }
                } else {
                    return ` ${alteredNames[element]} has been changed from ${rowData[element]} to ${formValues[element]}`;
                }
            }
        });
        setTimeLineContent(dddd);
    };


    // const sampleFunc = () => {
    //     const oldRow = rowData;
    //     const newRow = formValues;
    //     const newArray = {
    //         ...newRow,
    //         latitude: newRow.latitude !== null ? parseFloat(newRow.latitude) : null,
    //         longitude: newRow.longitude !== null ? parseFloat(newRow.longitude) : null,
    //     };
    //     let changed = {};
    //     let dateBlockExecuted = false; // Flag to track if the block for sStartDate or sEndDate has been executed

    //     Object.keys(oldRow).forEach((key) => {
    //         if (oldRow[key] !== newArray[key]) {
    //             changed[key] = newArray[key];
    //         }
    //     });

    //     const dddd = Object.keys(changed).map((element, index) => {
    //         let displayName = element.replace(/_/g, ' ').replace(/(?:^|\s)\S/g, function (a) {
    //             return a.toUpperCase();
    //         });

    //         if (oldRow[element] === null || oldRow[element] === '') {
    //             return ` ${alteredNames[element]} has been updated to ${formValues[element]}`;
    //         } else if (newArray[element] === null) {
    //             return ` ${alteredNames[element]} has been removed`;
    //         } else {
    //             if (element === 'sStartDate' || element === 'sEndDate') {
    //                 if (!dateBlockExecuted) {
    //                     dateBlockExecuted = true; // Set flag to true to indicate the block has been executed
    //                     return ` Subscription has been changed ,Start date : ${moment(formValues.sStartDate).format('DD-MM-YYYY')} End date :  ${moment(formValues.sEndDate).format('DD-MM-YYYY')}`;

    //                 }
    //             } else {
    //                 return ` ${alteredNames[element]} has been changed from ${oldRow[element]} to ${formValues[element]}`;
    //             }
    //         }
    //     });
    //     setTimeLineContent(dddd);
    // };

    // console.log("asdasd",formValues)

    const handleChange = async (e) => {


        let { name, value } = e.target;

        setStateHandler(name, value);
        if(name === 'sStartDate' || name === 'sEndDate'){
            setButton(0)
        setSubscription(true)}

    };

    const handleChangeShop = async (e,newValue) => {
        // console.log("newValue",newValue)
        setFormValues({
            ...formValues,
            shop_type_id: newValue ? newValue.shop_type_id : null,
            shop_type: newValue ? newValue.shop_type : '',
        });
         validationHandler("shop_type" , newValue ? newValue.shop_type : '')


    };
    const setStateHandler = async (name, value) => {
        let formObj = {};

        formObj = {
            ...formValues,
            [name]: value === '' ? null : value,
        };

        await setFormValues(formObj);
        await validationHandler(name, value);


    };

    useEffect(() => { (async () => {
        const fetchData = async () => {
            if (rowData !== formValues && init) {
                await sampleFunc();
            }
        };

        fetchData();
    })();
}, [formValues]);


    const validationHandler = (name, value) => {
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
        } else if (name === 'phone_number') {
            if (!phoneValidation(value)) {
                //   setValidRegex({...validRegex, phone_number: false});
                setFormErrors({
                    ...formErrors,
                    [name]: 'Phone number is Invalid!',
                });
            } else {
                setFormErrors({
                    ...formErrors,
                    [name]: null,
                });
            }
        } else if (name === 'email') {
            if (!emailValidation(value)) {
                setFormErrors({
                    ...formErrors,
                    [name]: capitalize(name) + ' is Invalid!',
                });
            } else {
                setFormErrors({
                    ...formErrors,
                    [name]: null,
                });
            }
        } else if (regex[name]) {
            if (!regex[name].test(value)) {
                setFormErrors({
                    ...formErrors,
                    [name]: capitalize(name) + ' is Invalid!',
                });
            } else {
                setFormErrors({
                    ...formErrors,
                    [name]: null,
                });
            }
        } else {
            setFormErrors({
                ...formErrors,
                [name]: null,
            });
        }
    };
    const handleReject = () => {
        let data = {
            value : value,
            pageCount : 0,
            numPerPage : 20,
            searchString : ""
        }
        dispatch(
            updateUserGrAction(formValues.company_id, {
                type: 'Reject',
                number: formValues.phone_number,
            }),
        ).then(() => {
            let payload = {
                timeLineContent: [`Request for ${rowData.company_name} has been Rejected`],
                company_id: rowData.company_id,
                employee_id: storage.employee_id,
                type: 'Rejected',
                value: value,
                searchString:''

            }
            dispatch(UpdateCompanyTimeLineAction(payload, (res) => {
                setMainTimeLineContent(res)
            }))
                .then(

                    dispatch(getRegisterRequestAction(data))
                )
        }
        );
        closeDialog();
    };
    const handleOpenUpdateDialog = async () => {

        let isValid = true;
        let formErrorsObj = { ...formErrors };
        await Object.keys(formValues).forEach((key, i) => {
            if (
                requiredFields.includes(key) &&
                (formValues[key] === null ||
                    formValues[key] === '' ||
                    formValues[key].length === 0 ||
                    formErrors[key] !== null)
            ) {
                if (key === 'phone_number') {
                    isValid = false;
                    formErrorsObj[key] = formErrors[key];
                } else {
                    isValid = false;
                    formErrorsObj[key] = capitalize(key) + ' is Required!';
                }
            }
            return null;
        });

        // console.log("formErrorsObj",formErrorsObj)
        await setFormErrors(formErrorsObj);
console.log("!isValid",!isValid);

        if(!isValid) {
            setOpenUpdateDialog(false)
            return;
        }

        setOpenUpdateDialog(true)
    }

    const handleUpdate = async () => {



        // await setFormValues({
        //     ...formValues,
        //     sStartDate: addSubscription.startDate,
        //     sEndDate:addSubscription.endDate
        // })

        let { company_name, email, first_name, latitude, longitude, phone_number, sStartDate, sEndDate, person_id, company_id, address,shop_type_id } = formValues
        let updateDetails = {
            company_name: company_name,
            email: email,
            first_name: first_name,
            latitude: latitude,
            longitude: longitude,
            phone_number: phone_number,
            company_id: company_id,
            address: address,
            sStartDate: sStartDate,
            sEndDate: sEndDate,
            person_id: person_id,
            sRemainingDays: differenceInDays,
            value: value,
            shop_type_id:shop_type_id ? shop_type_id : null,
            sms: subscription === true ? 'send' : 'dont'
        };

        let s = addSubscription.startDate !== null ? addSubscription.startDate : sStartDate
        let endDate = addSubscription.endDate !== null ? addSubscription.endDate : sEndDate;
        
        // const e = moment(endDate).add(button, 'months').hour(12).minute(0).second(0);
        
        updateDetails.sStartDate =  moment(s).format('YYYY-MM-DD HH:mm:ss')
        updateDetails.sEndDate =  moment(endDate).format('YYYY-MM-DD HH:mm:ss')
        
        dispatch(UpdateCompanyDetailsAction(updateDetails,async (data) => {

            // let res = await data.find(d => d.company === rowData.company_id)
            // setCurrData(res)


        }))
            .then(() => {
            let payload = {...rowData, ...updateDetails}
                dispatch(loadRegisteredAction(payload))
                if (timeLineContent.length) {
                    let payload = {
                        timeLineContent: timeLineContent.filter(Boolean),
                        company_id: rowData.company_id,
                        employee_id: storage.employee_id,
                        type: 'Edit details',
                        value: value,
                    searchString:''
                    }
                    dispatch(UpdateCompanyTimeLineAction(payload,(res) => {
                        setMainTimeLineContent(res)
                    }))

                }



                if (rowData.sStartDate !== formValues.sStartDate || rowData.sEndDate !== formValues.sEndDate) {

                    const startDate = rowData.sIsExpired === 0 ? moment(rowData.sEndDate) : formValues.sStartDate

                    let data = {
                        subscription_start_date: startDate,
                        subscription_end_date: formValues.sEndDate,
                        subscription_period: dayDiff(),
                        company_id: rowData.company_id,
                        status: activeSubs.length == 0 ? 'ACTIVE_SUB' : 'UPCOMING_SUB'
                    }
                    dispatch(updateSubscriptionRecords(data))
                    //     .then(() => {
                    //         dispatch(getSubscriptionRecords(rowData.company_id))

                    // })
                }



            },
                // closeDialog(),
                setAddSubscription({
                    startDate: null,
                    endDate: null
                }),

                setButton(0),

                setOpenUpdateDialog(false),
                setTimeLineContent([])
            )

        // API call..

    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        let data = {
            value : value,
            pageCount : 0,
            numPerPage : 20,
            searchString: ""
        }
        let isValid = true;
        let formErrorsObj = { ...formErrors };
        await Object.keys(formValues).forEach((key, i) => {
            if (
                requiredFields.includes(key) &&
                (formValues[key] === null ||
                    formValues[key] === '' ||
                    formValues[key].length === 0 ||
                    formErrors[key] !== null)
            ) {
                if (key === 'phone_number') {
                    isValid = false;
                    formErrorsObj[key] = formErrors[key];
                } else {
                    isValid = false;
                    formErrorsObj[key] = capitalize(key) + ' is Required!';
                }
            }
            return null;
        });
        await setFormErrors(formErrorsObj);

        // alert("Is Form Valid - " + isValid);

        // API call..
        const value1 = formValues.company_type === 'Grow Retail' ? 1 : 0

        if (isValid) {
            dispatch(
                updateUserGrAction(formValues.company_id, {
                    type: 'Approve',
                    number: formValues.phone_number,
                    email: formValues.email,
                    value: value1,
                    months:button
                }),
            ).then(() => {
                let payload = {
                    timeLineContent: [`Request for ${rowData.company_name} has been approved`],
                    company_id: rowData.company_id,
                    employee_id: storage.employee_id,
                    type: 'Approval',
                    value: value,
                    searchString:''

                }
                dispatch(UpdateCompanyTimeLineAction(payload,(res) => {
                    setMainTimeLineContent(res)
                }))
                    .then(() => {
                        if (timeLineContent.length) {
                            let { company_name, email, first_name, latitude, longitude, phone_number, person_id, company_id, address , sStartDate, sEndDate} = formValues

                            // handleUpdate();
                            let updateDetails = {
                                company_name: company_name,
                                email: email,
                                first_name: first_name,
                                latitude: latitude,
                                longitude: longitude,
                                phone_number: phone_number,
                                company_id: company_id,
                                address: address,
                                person_id: person_id,
                                sStartDate: sStartDate,
                                sEndDate: sEndDate,
                                sRemainingDays: differenceInDays,
                                value: value
                            };
                            dispatch(UpdateCompanyDetailsAction(updateDetails))
                                .then(() => {
                                    let { company_name, email, first_name, latitude, longitude, phone_number, subscriptionId, sStartDate, sEndDate, person_id, company_id, address } = formValues

                                    let payload = {
                                        timeLineContent: timeLineContent.filter(Boolean),
                                        company_id: rowData.company_id,
                                        employee_id: storage.employee_id,
                                        type: 'Edit details',
                                        value: value,
                                        searchString:''

                                    }
                                    dispatch(UpdateCompanyTimeLineAction(payload,(res) => {
                                        setMainTimeLineContent(res)
                                    }))
                                        .then(

                                            dispatch(getRegisterRequestAction(data))
                                        )
                                }
                                )

                        }

                    });
                let { sStartDate, sEndDate, company_id } = formValues
                let subscriptionUpdate = {
                    sStartDate: sStartDate,
                    sEndDate: sEndDate,
                    company_id: company_id,
                    value: value,
                    sRemainingDays: differenceInDays
                }
                dispatch(InsertSubscription(subscriptionUpdate))
                    .then(() => {
                        // if (timeLineContent.length) {
                        let payload = {
                            timeLineContent: [` Subscription Start date has been updated to ${todayDate}`,
                            ` Subscription End date has been updated to ${OGfutureDate}`]
                            ,
                            company_id: rowData.company_id,
                            employee_id: storage.employee_id,
                            type: 'Edit details',
                            value: value,
                        searchString:''

                        }
                        dispatch(UpdateCompanyTimeLineAction(payload,(res) => {
                            setMainTimeLineContent(res)
                        }))
                            .then(

                                dispatch(getRegisterRequestAction(data))
                            )
                    })

            }
            );

            closeDialog();
        }
    };
    const handleReset = () => {

        setAddSubscription({
            startDate: null,
            endDate:null
        })

        setFormValues({
            ...formValues,
            sEndDate: rowData.sEndDate,
            sStartDate:rowData.sStartDate
        })
        setButton(0)
    }
    // const handleSubscriptionDuration = (months) => {
    //     const startDate = rowData.sIsExpired === 1 ? moment() :moment(rowData.sStartDate) 
    //     let sEnd = rowData.sIsExpired === 1 ? moment() : moment(rowData.sEndDate)  ;
    //     const endDate = moment(sEnd).add(months, 'months').hour(12).minute(0).second(0);
    //     if (upComingSubs.length === 0) {
    //         setFormValues({
    //             ...formValues,
    //             sStartDate: startDate.format('YYYY-MM-DD HH:mm:ss'),
    //             sEndDate: endDate.format('YYYY-MM-DD HH:mm:ss')
    //         });

    //         let starr = rowData.sIsExpired === 1 ? moment() :moment(rowData.sEndDate) 
    //         // let starr = moment(rowData.sEndDate).format('YYYY-MM-DD HH:mm:ss')
    //         let endd =   moment(starr).add(months, 'months').hour(12).minute(0).second(0);

    //         setAddSubscription({
    //             startDate: starr.format('YYYY-MM-DD HH:mm:ss'),
    //             endDate: endd.format('YYYY-MM-DD HH:mm:ss')
    //         })
    //         setButton(months)
    //         setSubscription(true)
    //     } else {
    //         dispatch(OpenalertActions({ msg: 'Cannot update as there is already an upcoming subscription', severity: 'error' }))
    //     }
    // };


    const handleSubscriptionDuration = (months) => {
        let mainSubEndDate = rowData.sIsExpired === 1 ? moment() : moment(rowData.sEndDate).clone();

        let addSubStartDate = mainSubEndDate.clone().add(1, 'day');
        let addSubEndDate = addSubStartDate.clone().add(months, 'months').subtract(1, 'day').hour(12).minute(0).second(0);

        if (upComingSubs.length === 0) {
            setAddSubscription({
                startDate: addSubStartDate.format('YYYY-MM-DD HH:mm:ss'),
                endDate: addSubEndDate.format('YYYY-MM-DD HH:mm:ss')
            });

            setButton(months);
            setSubscription(true);
        } else {
            dispatch(OpenalertActions({ msg: 'Cannot update as there is already an upcoming subscription', severity: 'error' }));
        }
    };



    return (
        <Card style={{ minHeight: '50em' }}>
            <Grid container style={{ padding: '10px 10px 10px 10px' }}>
                <Grid
                    className='title-bar'
                    p={'0px 0px 20px 0px'}
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <Grid container display={'flex'}>
                        <Grid
                            display={'flex'}
                            justifyContent={'flex-start'}
                            size={{
                                lg: 6,
                                md: 6,
                                sm: 6,
                                xs: 6
                            }}>
                            <Typography variant='h6' style={{ paddingLeft: '5px' }}>
                                {rowData.isApproved === 'Approved'
                                    ? 'Edit details.'
                                    : 'Approve request'}
                            </Typography>
                        </Grid>
                        <Grid
                            display={'flex'}
                            justifyContent={'flex-end'}
                            size={{
                                lg: 6,
                                md: 6,
                                sm: 6,
                                xs: 6
                            }}>

                            <CommonToolTip title='Close'>
                                <Button
                                    variant='contained'
                                    color='secondary'
                                    style={{ height: '30px', marginLeft: '5px' }}
                                    onClick={closeDialog}
                                >
                                    Close
                                </Button></CommonToolTip>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid
                    className='details-divider'
                    p={'0px 0px 20px 0px'}
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <Divider sx={{ borderBottomWidth: 5 }}></Divider>
                </Grid>
                <Grid
                    className='details-fields'
                    p={'0px 0px 20px 0px'}
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <Grid container spacing={3} direction='row'>
                        <Grid
                            size={{
                                lg: 3,
                                md: 4,
                                sm: 4,
                                xs: 12
                            }}>
                            <TextField
                                onChange={handleChange}
                                onBlur={handleChange}
                                required={true}
                                style={{}}
                                fullWidth={true}
                                placeholder='Company Name'
                                label='Company Name'
                                name='company_name'
                                value={
                                    formValues.company_name === null
                                        ? ''
                                        : formValues.company_name
                                }
                                slotProps={{ input: { readOnly: edit } }}
                                color='primary'
                                type='text'
                                regex=''
                                variant='outlined'
                                error={formErrors.company_name === null ? false : true}
                                helperText={
                                    formErrors.company_name === null
                                        ? ''
                                        : 'First Name is required!'
                                }
                            />
                        </Grid>

                        <Grid
                            size={{
                                lg: 3,
                                md: 4,
                                sm: 4,
                                xs: 12
                            }}>
                            <TextField
                                onChange={handleChange}
                                onBlur={handleChange}
                                style={{}}
                                fullWidth={true}
                                placeholder='Email'
                                label='Email'
                                name='email'
                                value={formValues.email === null ? '' : formValues.email}
                                slotProps={{ input: { readOnly: edit } }}
                                color='primary'
                                type='text'
                                regex=''
                                variant='outlined'
                            // error={formErrors.email === null ? false : true}
                            // helperText={formErrors.email === null ? '' : formErrors.email}
                            />
                        </Grid>
                        <Grid
                            size={{
                                lg: 3,
                                md: 4,
                                sm: 4,
                                xs: 12
                            }}>
                            <TextField
                                onChange={handleChange}
                                onBlur={handleChange}
                                style={{}}
                                fullWidth={true}
                                placeholder='First name'
                                label='First name'
                                name='first_name'
                                value={
                                    formValues.first_name === null ? '' : formValues.first_name
                                }
                                slotProps={{ input: { readOnly: edit } }}
                                color='primary'
                                type='text'
                                regex=''
                                variant='outlined'
                                error={formErrors.first_name === null ? false : true}
                                helperText={
                                    formErrors.first_name === null ? '' : formErrors.first_name
                                }
                            />
                        </Grid>
                        <Grid
                            size={{
                                lg: 3,
                                md: 4,
                                sm: 4,
                                xs: 12
                            }}>
                            <TextField
                                onChange={handleChange}
                                onBlur={handleChange}
                                style={{}}
                                fullWidth={true}
                                onWheel={ (e) => e.target.blur()}
                                placeholder='Latitude'
                                label='Latitude'
                                name='latitude'
                                value={formValues.latitude === null ? '' : formValues.latitude}
                                slotProps={{ input: { readOnly: edit } }}
                                color='primary'
                                type='number'
                                regex=''
                                variant='outlined'
                                error={formErrors.latitude === null ? false : true}
                                helperText={
                                    formErrors.latitude === null ? '' : formErrors.latitude
                                }
                            />
                        </Grid>
                        <Grid
                            size={{
                                lg: 3,
                                md: 4,
                                sm: 4,
                                xs: 12
                            }}>
                            <TextField
                                onChange={handleChange}
                                onBlur={handleChange}
                                style={{}}
                                fullWidth={true}
                                onWheel={ (e) => e.target.blur()}
                                placeholder='Longitude'
                                label='Longitude'
                                name='longitude'
                                value={
                                    formValues.longitude === null ? '' : formValues.longitude
                                }
                                slotProps={{ input: { readOnly: edit } }}
                                color='primary'
                                type='number'
                                regex=''
                                variant='outlined'
                                error={formErrors.longitude === null ? false : true}
                                helperText={
                                    formErrors.longitude === null ? '' : formErrors.longitude
                                }
                            />
                        </Grid>
                        <Grid
                            size={{
                                lg: 3,
                                md: 4,
                                sm: 4,
                                xs: 12
                            }}>
                            <TextField
                                onChange={handleChange}
                                onBlur={handleChange}
                                style={{}}
                                fullWidth={true}
                                onWheel={ (e) => e.target.blur()}
                                placeholder='Phone number'
                                label='Phone number'
                                name='phone_number'
                                value={
                                    formValues.phone_number === null
                                        ? ''
                                        : formValues.phone_number
                                }
                                slotProps={{ input: { readOnly: edit } }}
                                color='primary'
                                type='number'
                                regex=''
                                variant='outlined'
                                error={formErrors.phone_number}
                                helperText={formErrors.phone_number}
                            />
                        </Grid>
                        <Grid
                            size={{
                                lg: 3,
                                md: 4,
                                sm: 4,
                                xs: 12
                            }}>
                            <TextField
                                onChange={handleChange}
                                onBlur={handleChange}
                                style={{}}
                                fullWidth={true}
                                placeholder='Address'
                                label='Address'
                                name='address'
                                value={formValues.address === null ? '' : formValues.address}
                                slotProps={{ input: { readOnly: edit } }}
                                color='primary'
                                type='text'
                                regex=''
                                variant='outlined'
                            // error={formErrors.address}
                            // helperText={formErrors.address}
                            />

                        </Grid>

                        <Grid
                            size={{
                                lg: 3,
                                md: 4,
                                sm: 4,
                                xs: 12
                            }}>

                            {
                                formValues.company_type == 'Grow Retail' &&

                                <Autocomplete
                                    value={
                                        formValues.shop_type_id
                                            ? getShopType.find(f => f.shop_type_id === formValues.shop_type_id) || { shop_type: formValues.shop_type }
                                            : { shop_type: '' }
                                    }

                                    name="Shop Type"
                                    onChange={handleChangeShop}
                                    options={getShopType}
                                    getOptionLabel={(option) => option.shop_type || ''}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}

                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Shop Type"
                                            variant='outlined'

                                            error={formErrors.shop_type}
                                            helperText={formErrors.shop_type}
                                            required
                                            name="Shop Type"
                                        />
                                    )}
                                />
                            }


                        </Grid>
                    </Grid>
                </Grid>
                {!isPendingActivations && (
                    <>
                <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }} p={'0px 0px 20px 0px'}>
                    <Card sx={{ width: '100%' }}>
                        <MaterialTable
                            // style={{ height: '87vh', overflow: 'auto' }}
                            // totalCount={RegisteredUserGRCount}
                            options={{
                                // pageSizeOptions: [20, 50, 100],
                                // showEmptyDataSourceMessage: isApiFinished,
                                // maxBodyHeight: maxBodyHeight,
                                // pageSize: pageSize,
                                paging: true,
                                headerStyle,
                                cellStyle
                            }}
                            // onPageChange={handlePageChange}
                            // onRowsPerPageChange={handlePageSizeChange}
                            columns={[
                                // { title: 'Company Id', field: 'company_id' },
                                {
                                    title: 'Renewal Date',
                                    field: 'createdAt',
                                    render: rowData => moment(rowData.createdAt).format('DD/MM/YYYY HH:mm:ss')
                                },
                                {
                                    title: 'Subscription Starts from',
                                    field: 'subscription_start_date',
                                    render: rowData => moment(rowData.subscription_start_date).format('DD/MM/YYYY HH:mm:ss')
                                },
                                {
                                    title: 'Subscription Ends on',
                                    field: 'subscription_end_date',
                                    render: rowData => moment(rowData.subscription_end_date).format('DD/MM/YYYY HH:mm:ss')
                                },
                                { title: 'Renewed by', field: 'first_name' },
                                { title: 'Subscription Period', field: 'subscription_period' },
                                {
                                    title: 'Status', field: 'status',
                                    render: (rowData) => (
                                        <Chip
                                            // variant='outlined'
                                            size='small'
                                            label={sambil[rowData.status]}
                                            color={approveStatus[rowData.status]}
                                        />
                                    ),
                                },
                                // { title: 'Shop Type', field: 'shop_type' },

                            ]}
                            data={subscription_records}
                            title="Subscription Records"
                        />

                    </Card>
                </Grid>
                </>
                )}
                {value === 1 || value === 2 &&
                    <>
                        <Grid
                            p={'0px 0px 20px 0px'}
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                            <Typography variant='h6' style={{ paddingLeft: '5px' }}>
                                Shop Images
                            </Typography>
                        </Grid>
                        <Grid
                            p={'0px 0px 20px 0px'}
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                            <Divider sx={{ borderBottomWidth: 5 }}></Divider>
                        </Grid>
                        <Grid
                            p={'0px 0px 20px 0px'}
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                            {/* <Card elevation={0} open={true}> */}
                            <StandardImageList1 images={rowData.images} />
                            {/* </Card> */}
                        </Grid>

                    </>}
                    {!isPendingActivations && ( 
                             <>
                <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }} p={'0px 0px 20px 0px'}>
                    <Typography variant='h6' style={{ paddingLeft: '5px' }}>
                        {rowData.isApproved === 'Approved'
                            ? 'Edit Subscription.'
                            : 'Subscription details'}
                    </Typography>
                </Grid>
                <Grid
                    p={'0px 0px 20px 0px'}
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <Divider sx={{ borderBottomWidth: 5 }}></Divider>
                </Grid>
                {/* //<Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} p={'0px 0px 20px 0px'}> */}
                {([2,3,5,9,10,11].includes(rowData.company_type_id)) && 
                <Grid container justifyContent="center">
                    <Grid
                        size={{
                            xs: 12,
                            md: 12,
                            lg: 12
                        }}>

<CompanySubscription data={rowData} type={"superAdmin"}/>
                        </Grid>
                    </Grid>

                }
                {![2,3,5,9,10,11].includes(rowData.company_type_id) &&
                    <Grid container lg={12} md={12} sm={12} xs={12} spacing={2} direction='row' justifyContent={'center'} pb={'30px'}>
                        <Grid lg={4} md={4} sm={12} xs={12} item={true} justifyContent={'center'}>
                            <TextField
                                fullWidth={true}
                                placeholder='Subscription start date'
                                label='Subscription start date'
                                name='Subscription start date'
                                color='primary'
                                variant='outlined'
                                type='text'
                                regex=''
                                value={moment(formValues.sStartDate).format('DD/MM/YYYY')}
                                InputProps={{
                                    readOnly: true,
                                }}
                            />

                        </Grid>
                        <Grid lg={4} md={4} sm={12} xs={12} item={true}>

                            <TextField
                                fullWidth={true}
                                placeholder='Subscription end date'
                                label='Subscription end date'
                                name='Subscription end date'
                                color='primary'
                                variant='outlined'
                                type='text'
                                regex=''
                                value={moment(formValues.sEndDate).format('DD/MM/YYYY')}
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                        </Grid>
                    </Grid>
                }

                 {![2,3,5,9,10,11].includes(rowData.company_type_id) &&

                    <Grid container justifyContent="center">
                        <Grid item xs={12} md={8} lg={6}>
                            <Card sx={{ width: '100%', minHeight: '100%', padding: '20px' }}>
                                <Grid container spacing={2} justifyContent="center" pb={'20px'}>
                                    <Grid item xs={12} lg={12} md={12}>
                                    <Typography  variant='h6'>
                                            Add additional subscription
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Grid container spacing={2} justifyContent="center" pb={'20px'}>
                                    <Grid item xs={12} lg={6} md={6}>
                                        <TextField
                                            fullWidth
                                            placeholder="Subscription start date"
                                            label="Subscription start date"
                                            name="subscriptionStartDate"
                                            variant="outlined"
                                        value={ addSubscription.startDate !== null ?   moment(addSubscription.startDate).format('DD/MM/YYYY') : ''}
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} lg={6} md={6}>
                                        <TextField
                                            fullWidth
                                            placeholder="Subscription end date"
                                            label="Subscription end date"
                                            name="subscriptionEndDate"
                                            variant="outlined"
                                        value={ addSubscription.endDate !== null ?  moment(addSubscription.endDate).format('DD/MM/YYYY') : ''}
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid container spacing={2} justifyContent="center">


                                    {[1, 3, 6, 12].map(duration => (
                                        <Grid item key={duration} display={'flex'} flexDirection={'row'}>
                                            <Button
                                                variant={button === duration ? 'contained' : 'outlined'}
                                                onClick={() => handleSubscriptionDuration(duration)}
                                            >
                                                {duration} Month
                                            </Button>
                                        </Grid>
                                    ))}




                                </Grid>
                                <Grid display={'flex'} justifyContent={'flex-end'}>
                                    <Button onClick={()=> handleReset()}>
                                        Reset
                                    </Button>


                                </Grid>
                            </Card>
                        </Grid>
                    </Grid>
                }


                {/* <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} container spacing={2} direction='row' alignItems='center' justifyContent='center'>
                        <Grid size={{ xs: 3, sm: 3, md: 2, lg: 2 }}>
                            <Button variant={button === 1 ? 'contained' : 'outlined'} onClick={() => handleSubscriptionDuration(1)}>
                               1 Month
                            </Button>
                        </Grid>
                        <Grid size={{ xs: 3, sm: 3, md: 2, lg: 2.3 }}>
                            <Button variant={button === 3 ? 'contained' : 'outlined'} onClick={() => handleSubscriptionDuration(3)}>
                               3 Month
                            </Button>
                        </Grid>
                        <Grid size={{ xs: 3, sm: 3, md: 2, lg: 2.3 }}>
                            <Button variant={button === 6 ? 'contained' : 'outlined'} onClick={() => handleSubscriptionDuration(6)}>
                               6 Month
                            </Button>
                        </Grid>
                        <Grid size={{ xs: 3, sm: 3, md: 2, lg: 2.3 }}>
                            <Button variant={button === 12 ? 'contained' : 'outlined'} onClick={() => handleSubscriptionDuration(12)}>
                                12 Month
                            </Button>
                        </Grid>
                </Grid> */}
                {button !== 0 && <Grid
                    style={{display:'flex',justifyContent:'center'}}
                    size={{
                        lg: 12
                    }}>
                                    <h4>{`** Selected Subscription for ${button} month **`}</h4>
                                </Grid>}
                                </> 
                                 )} 
           
                <Grid
                    p={'0px 0px 20px 0px'}
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    {mode === 'view' ?
                        <Grid
                            container
                            spacing={7}
                            className='btn'
                            pt={'20px'}
                            display={'flex'}
                            flexDirection={'row'}
                            justifyContent={'flex-end'}
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12
                            }}>

                            <Grid className='btn_submit'>
                                <Button
                                    variant='contained'
                                    color='primary'
                                    onClick={handleSubmit}
                                >
                                    Approve
                                </Button>
                            </Grid>
                            <Grid className='btn_reject'>
                                <Button
                                    variant='contained'
                                    color='secondary'
                                    onClick={handleReject}
                                >
                                    Reject
                                </Button>
                            </Grid>
                        </Grid> :
                        //     <Grid className='btn_submit'>
                        //     <Button
                        //         variant='contained'
                        //         color='primary'
                        //         onClick={handleUpdate}
                        //     >
                        //         Update Details
                        //     </Button>
                        // </Grid>
                        // {rowData.company_type !== "Payroll" &&
                        rowData.company_type_id !== 5 && rowData.company_type_id !== 2 && (
                            <Grid container
                                spacing={7}
                                lg={12}
                                md={12}
                                sm={12}
                                className='btn'
                                pt={'20px'}
                                display={'flex'}
                                flexDirection={'row'}
                                justifyContent={'flex-end'}>
                                <Grid item className='btn_reject'>
                                    <Button
                                        variant='contained'
                                        color='primary'
                                        onClick={() => handleOpenUpdateDialog()}
                                    >
                                        Update Details
                                    </Button>
                                </Grid>
                            </Grid>
                        )
                    }
                </Grid>
                {
                    rowData.timeLineContent && rowData.timeLineContent?.length > 0 && <Grid
                        style={{ minHeight: 200, width: '100%', marginTop: 10 }}
                        size={{
                            lg: 10,
                            md: 12
                        }}>
                        <TimeLine timeLineContent={mainTimeLineContent} />
                    </Grid>
                }
                {
                    openUpdateDialog && (<Dialog
                        open={openUpdateDialog}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="requesteditandapprove-dialog-title">
                            {"Update alert"}
                        </DialogTitle>
                        <DialogContent style={{ width: 500 }}>
                            <DialogContentText id="requesteditandapprove-dialog-description">
                                Are you sure you want to Update ?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => handleUpdate()}>Update</Button>
                            <Button onClick={() => setOpenUpdateDialog(false)} autoFocus>
                                Cancel
                            </Button>
                        </DialogActions>
                    </Dialog>)
                }
            </Grid>
        </Card>
    );
}

