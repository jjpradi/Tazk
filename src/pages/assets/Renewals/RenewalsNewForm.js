import React, { useEffect, useRef,useState } from 'react'
import { Autocomplete, Box, Button, Card, Checkbox, FormControlLabel, Grid, Switch, TextField, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { createRenewalsFormAction, GetPaymentMethodAction, getRenewalsByIdAction, getRenewalsLovAction, renewRenewalsAction ,updateSubscriptionAction } from 'redux/actions/renewals_actions'
import { getWarrantyByAssetAction } from 'redux/actions/asset_actions'
import { getAllAssetAction, getAssetGroupIdAction, getAssetTypeIdAction, getAssetWarrantyAction, getWarrantyByIdAction, insertAssetwarrantyAction, renewWarrantyAction, updateWarrantyAction } from 'redux/actions/asset_actions'
import { capitalize } from 'lodash'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment'
import AttachmentField from 'pages/common/Timesheet/Attachment'
import { CreateInsurance, GetFrequencyTypeAction, getInsuranceByIdAction, getInsuranceDetailsAction, getInsuranceLovAction, renewInsuranceAction, updateInsuranceAction } from 'redux/actions/insurance_actions'
import PropTypes, { array } from 'prop-types'
import { emailValidation, phoneValidation } from 'components/regexFunction'
import { OpenalertActions } from 'redux/actions/alert_actions'
import { requiredFieldsAlertMessage } from 'utils/content'
import { GetPriorityAction } from 'redux/actions/serviceDue_actions'
import { asstGeneralContactAction } from '../../../redux/actions/asset_actions'
import _ from 'lodash';
import toMomentOrNull from '../../../utils/DateFixer'

const RenewalsNewForm = (props) => {

    const dispatch = useDispatch()

    const {
        RenewalsReducers: { getRenewalsLov, getPaymentMethod ,renewalsById },
        AssetReducers: { getAssetName, getAssetType,get_asst_warranty,get_asset_warranty,get_asst_general },
        InsuranceReducers: { getFrequencyType, getInsuranceLov , getInsuranceDetails},
        ServiceDueReducers: { getServiceDuePriority },
    } = useSelector((state) => state)

    const [formData, setFormData] = useState({
        renewalType : null,
        assetName : null,
        startDate : null,
        endDate : null,
        serviceProvider : null,
        subscriptionName : null,
        providerContact : null,
        insuranceDynamicProp : [],
        insuranceDynamicPropValues : [],
        policyNo: null,
        assetType: null,
        sumInsured: null,
        annualPremium: null,
        frequency: {
            id: 1,
            frequency_type: "MONTHLY"
            },
        agent: null,
        reminder: [],
        notes: null,
        priority: null,
        dueDate: null,
        amount: null,
        description: null,
        vendorName: null,
        vendorEmail: null,
        vendorUrl: null,
        contractNo: null,
        contractStart: null,
        contractEnd: null,
        noticeDays: null,
        renew: false,
        billingCycle: {
            id: 1,
            frequency_type: "MONTHLY"
            },
        paymentMethod: null,
        licenseUnits: null,
        sms_notification :  null,
        email_notification : null,
        whatsApp_notification : null,
        repeat : null,
        asset_group : null,
        agentEmail : null,
        vendorContact : null,
        asset_warranty : null,
        warrantyServiceProvider : null,
        warrantyProviderContact : null,
        warrantyStartDate : null,
        warrantyEndDate : null,
        insuranceProvider : null,
        warranty_provider_email : null,
        insurance_type : null,
        title: null,
    })

    const [formErrors, setFormErrors] = useState({
        renewalType : null,
        insurance_type :null,
        assetName : null,
        startDate : null,
        subscriptionName : null,
        endDate : null,
        serviceProvider : null,
        providerContact : null,
        files : null,
        policyNo: null,
        assetType: null,
        dueDate: null,
        vendorName: null,
        billingCycle: null,
        contractStart: null,
        contractEnd: null,
        asset_group: null,
        sumInsured: null,
        annualPremium: null,
        vendorContact: null,
        asset_warranty: null,
        warrantyServiceProvider : null,
        warrantyProviderContact : null,
        warrantyStartDate : null,
        warrantyEndDate : null,
        amount : null,
        insuranceProvider : null,
        title: null,
    })

    const [renewalsFiles, setRenewalsFiles] = useState({
        renewalsFiles : [],
        renewalsFilePreviews : [],
        existingImageKey : []
    })
    const [warrantyFiles, setWarrantyFiles] = useState({
        warrantyFiles : [],
        warrantyFilePreviews : [],
        existingImageKey : []
    })
    const [assetId, setAssetId] = useState(null)
    const hasHydratedEditData = useRef(false)
    const baseRequiredFieldsInsuranceAndWarranty = [
        'renewalType',
        'assetName',
        'startDate',
        'endDate',
        'policyNo',
        'sumInsured',
        'annualPremium',
        'insuranceProvider',
        'insurance_type'
    ]

    const requiredFieldsInsuranceAndWarranty = [
  ...baseRequiredFieldsInsuranceAndWarranty,
  ...(formData.agent ? ['providerContact'] : []),
  
];

    const baseRequiredFieldsWarranty = [
        'renewalType',
        'asset_warranty',
          'assetName',
          'warrantyStartDate',
          'warrantyEndDate',
           'title',
           'amount',

    ]

    const requiredFieldsWarranty = [
        ...baseRequiredFieldsWarranty,
        ...(formData.warrantyServiceProvider ? ['warrantyProviderContact'] : []),
    ];

    const baseRequiredFieldsSubs = [
        'renewalType',
        'subscriptionName',
        'dueDate',
        'billingCycle',
        'contractStart',
        'contractEnd',
        'amount'
    ]

        const requiredFieldsSubscription = [
  ...baseRequiredFieldsSubs,
  ...(formData.vendorName ? ['vendorContact'] : []),
];

    const requiredFieldsOthers = [
        'renewalType',
        'startDate',
        'endDate',
        'providerContact'
    ]

    const daysToRepeat = [
        {repeat: 'Monthly'},
        {repeat: 'Yearly'},
  ];

  const reminderDaysBefore = [
    {reminder : '2'},
    {reminder : '5'},
    {reminder : '7'},
  ]

  const normalizeText = (value) => {
  if (value === undefined || value === null) return null;
  const parsedValue = String(value).trim();
  return parsedValue && parsedValue !== 'undefined' && parsedValue !== 'null'
    ? parsedValue
    : null;
};

    useEffect(() => {
    if (!formData.startDate || !formData.frequency) return;
    if (props?.status === 'edit' && formData.endDate) return;

    let newEndDate = moment(formData.startDate);

    switch (formData.frequency.frequency_type) {
        case "MONTHLY":
            newEndDate = newEndDate.add(1, "month");
            break;
        case "QUARTERLY":
            newEndDate = newEndDate.add(3, "month");
            break;
        case "HALF YEARLY":
            newEndDate = newEndDate.add(6, "month");
            break;
        case "YEARLY":
            newEndDate = newEndDate.add(1, "year");
            break;
        default:
            return;
    }

    setFormData(prev => ({
        ...prev,
        endDate: newEndDate.format("YYYY-MM-DD")
    }));

}, [formData.startDate, formData.frequency, props?.status]);

//   const normalizeReminderOption = (rawReminder) => {
//     if (rawReminder === undefined || rawReminder === null || rawReminder === '') return null;
//     if (typeof rawReminder === 'object' && rawReminder?.reminder !== undefined) {
//       return { reminder: String(rawReminder.reminder) };
//     }
//     return { reminder: String(rawReminder) };
//   };

//   const getReminderOption = (value) => {
//     if (Array.isArray(value)) {
//       if (value.length === 0) return null;
//       return normalizeReminderOption(value[0]);
//     }
//     return normalizeReminderOption(value);
//   };

//   const isTruthyNotification = (...values) => values.some((val) => (
//     val === 1 || val === '1' || val === true || val === 'true'
//   ));

const normalizeReminder = (rawReminder) => {
  if (rawReminder === null || rawReminder === undefined || rawReminder === '') return [];
 
  let parsedReminder = rawReminder;
  if (typeof rawReminder === 'string') {
    try {
      parsedReminder = JSON.parse(rawReminder);
    } catch (error) {
      parsedReminder = rawReminder;
    }
  }
 
  const toReminderOption = (item) => {
    if (item === null || item === undefined) return null;
    if (typeof item === 'object') {
      if (item.reminder === null || item.reminder === undefined) return null;
      return { reminder: String(item.reminder) };
    }
    return { reminder: String(item) };
  };
 
  if (Array.isArray(parsedReminder)) {
    return parsedReminder.map(toReminderOption).filter(Boolean);
  }
 
  const normalizedSingle = toReminderOption(parsedReminder);
  return normalizedSingle ? [normalizedSingle] : [];
};

    useEffect(() => {
        if (props.page !== 'asset') {
            if (!getRenewalsLov?.length) dispatch(getRenewalsLovAction())
            if (!get_asst_general?.length) dispatch(asstGeneralContactAction())
            if (!getInsuranceLov?.length) dispatch(getInsuranceLovAction())
        }
    }, [])
    useEffect(() => {
        if (
            props.page === 'asset' &&
            props.assetNamePreview &&
            (props.form === 'Insurance' || props.form === 'Warranty')
        ) {
            setFormData((prev) => ({
                ...prev,
                assetName: {
                    asset_id: props.assetNamePreview.asset_id || null,
                    Name: props.assetNamePreview.Name || '',
                    Code: props.assetNamePreview.Code || '',
                    'Asset Group': props.assetNamePreview['Asset Group'] || '',
                    'Asset Type': props.assetNamePreview['Asset Type'] || '',
                    Location: props.assetNamePreview.Location || '',
                    'Asset Owner': props.assetNamePreview['Asset Owner'] || '',
                },
            }))
        }
    }, [props.page, props.assetNamePreview, props.form])

    useEffect(() => {
        if(formData.renewalType?.renewal_types === 'Insurance') {
            if(props.page !== 'asset') {
                dispatch(getAllAssetAction())
            }
            if (!getFrequencyType?.length) dispatch(GetFrequencyTypeAction())
        }
        else if(formData.renewalType?.renewal_types === 'Warranty') {
            if(props.page !== 'asset') {
                dispatch(getAllAssetAction())
            }
            dispatch(getAssetWarrantyAction())
            if (!getFrequencyType?.length) dispatch(GetFrequencyTypeAction())
        }
        else if(formData.renewalType?.renewal_types === 'Subscription') {
            if(props.page !== 'asset') {
                dispatch(getAllAssetAction())
            }
            dispatch(GetPriorityAction())
            if (!getFrequencyType?.length) dispatch(GetFrequencyTypeAction())
            dispatch(GetPaymentMethodAction())
        }
    }, [formData.renewalType])

//     useEffect(()=>{ (async () => {
//         if(formData.asset_group !== null){
//             const data = {
//               groupId : formData.asset_group.asset_group_id
//             }
//             console.log(data , "sasjsd")
//             await  dispatch(getAssetTypeIdAction(data))
//         }
//     })();
// },[formData.asset_group])
    
    // console.log('scgsdhfdsjf',props?.data)
    useEffect(() => {

        if(props?.type === 'Renew' && getRenewalsLov?.length > 0 && getAssetName?.length > 0 && getFrequencyType?.length > 0) {

            const type = getRenewalsLov.find((e) => e.type_id === props?.data.type_id)
            const asset = getAssetName.find((e) => String(e.asset_id) === String(props?.data?.asset_id));             
            // const assetType = getAssetType.data.find((e) => e.id === Number(props?.data.asset_type_id))
            const frequencyType = getFrequencyType.find((e) => e.id === Number(props?.data.frequency))
            const priorityType = getServiceDuePriority.find((e) => e.id === Number(props?.data.priority))
            const billingCycleType = getFrequencyType.find((e) => e.id === Number(props?.data.billing_cycle))
        
            if(props?.formType === 'Insurance') {
                assetId !== props?.data.asset_id && dispatch(getInsuranceByIdAction(props?.data.id, async(response) => {
                    const res = response[0]
                    const insurance_type = getInsuranceLov.find((item) => item.id == res?.type)
                    const generalConatct = get_asst_general?.data?.find((item) => Number(item.id === Number(res?.broker_agent)))
                    setFormData((prev) => ({
                        ...prev,
                        renewalType : type,
                        assetName: asset || null ,
                        serviceProvider : res.insurance_agent,
                        providerContact : generalConatct?.contact,
                        insuranceDynamicPropValues : res.insuranceDynamicPropValues ? JSON.parse(res.insuranceDynamicPropValues) : null,
                        insuranceDynamicProp : res.insuranceDynamicProp ? JSON.parse(res.insuranceDynamicProp) : null,
                        insurance_type: insurance_type,
                        frequency: frequencyType ? frequencyType : null,
                        agent: generalConatct?.name,
                        notes: res.notes,
                        insuranceProvider: res.insurance_provider,
                        agentEmail : generalConatct?.email,
                        repeat : res.repeat,
                        sms_notification :res.sms_notification,
                        whatsApp_notification : res.whatsApp_notification,
                        email_notification : res.email_notification ,
                        reminder :  normalizeReminder(res.renewal_reminder) ,


                    }))
                    // setRenewalsFiles((prev) => ({
                    //     renewalsFilePreviews : res.image ? res.image.map((e => e.imageUrl)) : null
                    // }))
                }))
                setAssetId(props?.data.asset_id)
            }
            else if (props?.formType === 'Warranty') {
                  
                if (assetId !== props?.data?.asset_id) {
                  dispatch(getWarrantyByIdAction(props?.data?.id, async (response) => {
                        if (!response || !response.length) return
                        const res = response[0]
                        const warrantyType = get_asset_warranty?.find((item) => item?.id === Number(res?.warranty_type))
                        const generalConatct = get_asst_general?.data?.find((item) => Number(item.id === Number(res?.provider_name)))
                        setFormData((prev) => ({
                            ...prev,
                            renewalType: type,
                            serviceProvider: res?.seller,
                            assetName: asset || null,
                            asset_warranty : warrantyType?.warranty_type,
                            warrantyProviderContact: generalConatct?.contact,
                            warranty_provider_email : generalConatct?.email,
                            warrantyServiceProvider : generalConatct?.name,
                            title: res.title,
                            email_notification: res.email_notification,
                            sms_notification: res.sms_notification,
                            whatsApp_notification: res.whatsApp_notification,
                            warrantyStartDate: res.fromDate_Time || null,
                            repeat: res.repeat,
                            reminder: normalizeReminder(res.reminder) || null,
                            notes: res.notes,
                        }));
                    }));
                    setAssetId(props?.data?.asset_id)
                }
            }
            else {
                assetId !== props?.data.asset_id && dispatch(getRenewalsByIdAction(props?.data?.id, async(response) => {

                    const res = response[0]
                    const generalConatct = get_asst_general?.data?.find((item) => Number(item.id) === Number(res?.vendor_name))
                    setFormData((prev) => ({
                        ...prev,
                        renewalType : type,
                        // subscriptionName : res.subscription_name || "",
                        serviceProvider : res.service_provider,
                        assetName : asset || null,
                        vendorContact : generalConatct?.contact,
                        priority: priorityType ? priorityType: null,
                        description: res.description ? res.description : null,
                        vendorName: generalConatct?.name,
                        vendorEmail: generalConatct?.email,
                        vendorUrl: res.vendor_url ? res.vendor_url : null,
                        renew: res.renew === 0 ? false : true,
                        billingCycle: billingCycleType,
                        reminder: normalizeReminder(res.renewal_reminder) || null,
                        sms_notification: res?.sms_notification,
                        email_notification: res?.email_notification,
                        whatsApp_notification: res?.whatsApp_notification,
                        repeat: res?.repeat || null,
                        paymentMethod: res?.payment_method  || null,
                    }))
                    // setImage(res.image ? res.image.map((e => e.imageUrl)) : null)
                }))
                setAssetId(props?.data?.asset_id)
            }}
        }, [props, getRenewalsLov, getAssetName, getAssetType.data, getFrequencyType])

    const ALLOWED_TYPES = [
        'image/png',
        'image/jpeg',
        'image/jpg',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    const MAX_FILE_SIZE_MB = 10
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

    useEffect(() => {
        if (renewalsFiles.renewalsFilePreviews?.length > 2) {
            dispatch(OpenalertActions({ msg: 'Only 2 Files are allowed!', severity: 'warning' }))
            setFormErrors(prev => ({ ...prev, files: 'Only 2 Files are  allowed!' }))
        } else if (renewalsFiles.renewalsFiles?.length > 0) {
            const file = renewalsFiles.renewalsFiles[0]
            if (!ALLOWED_TYPES.includes(file.type)) {
                dispatch(OpenalertActions({ msg: 'Only PNG, JPG, PDF, or Word files are allowed!', severity: 'warning' }))
                setFormErrors(prev => ({ ...prev, files: 'Only PNG, JPG, PDF, or Word files are allowed!' }))
            } else if (file.size > MAX_FILE_SIZE_BYTES) {
                dispatch(OpenalertActions({ msg: 'File size must not exceed 10MB!', severity: 'warning' }))
                setFormErrors(prev => ({ ...prev, files: 'File size must not exceed 10MB!' }))
            } else {
                setFormErrors(prev => ({ ...prev, files: null }));
            }
        } else {
            setFormErrors(prev => ({ ...prev, files: null }));
        }
    }, [renewalsFiles.renewalsFilePreviews, renewalsFiles.renewalsFiles])

    useEffect(() => {
        if (warrantyFiles?.warrantyFilePreviews?.length > 2) {
            dispatch(OpenalertActions({ msg: 'Only 2 Files are allowed!', severity: 'warning' }))
            setFormErrors(prev => ({ ...prev, files: 'Only 2 Files are allowed!' }))
        } else if (warrantyFiles?.warrantyFiles?.length > 0) {
            const file = warrantyFiles.warrantyFiles[0]
            if (!ALLOWED_TYPES.includes(file.type)) {
                dispatch(OpenalertActions({ msg: 'Only PNG, JPG, PDF, or Word files are allowed!', severity: 'warning' }))
                setFormErrors(prev => ({ ...prev, files: 'Only PNG, JPG, PDF, or Word files are allowed!' }))
            } else if (file.size > MAX_FILE_SIZE_BYTES) {
                dispatch(OpenalertActions({ msg: 'File size must not exceed 10MB!', severity: 'warning' }))
                setFormErrors(prev => ({ ...prev, files: 'File size must not exceed 10MB!' }))
            } else {
                setFormErrors(prev => ({ ...prev, files: null }));
            }
        } else {
            setFormErrors(prev => ({ ...prev, files: null }));
        }
    }, [warrantyFiles?.warrantyFilePreviews, warrantyFiles?.warrantyFiles])

    useEffect(() => {

        if(getRenewalsLov?.length && !formData.renewalType && props.form === 'Insurance') {
            const renewalTypes = getRenewalsLov.find(p => p.renewal_types === 'Insurance')
            setFormData(prev => ({...prev, renewalType: renewalTypes}))
        }

        if(getRenewalsLov?.length && !formData.renewalType && props.form === 'Warranty') {
            const renewalTypes = getRenewalsLov.find(p => p.renewal_types === 'Warranty')
            setFormData(prev => ({...prev, renewalType: renewalTypes}))
        }

        if(getRenewalsLov?.length && !formData.renewalType && props.form === 'Subscription') {
            const renewalTypes = getRenewalsLov.find(p => p.renewal_types === 'Subscription')
            setFormData(prev => ({...prev, renewalType: renewalTypes}))
        }

        if(getRenewalsLov?.length && !formData.renewalType && !props.form) {
            const renewalTypes = getRenewalsLov.find(p => p.renewal_types === 'Insurance')
            setFormData(prev => ({...prev, renewalType: renewalTypes}))
        }

        if(getServiceDuePriority?.length && !formData.priority) {
            const priorityTypes = getServiceDuePriority.find(p => p.priority_name === 'MEDIUM')
            setFormData(prev => ({...prev, priority: priorityTypes}))
        }
    }, [getRenewalsLov, getServiceDuePriority])

    useEffect(() => {
        if (formData.renewalType?.renewal_types === 'Insurance') {
            const today = moment().format('YYYY-MM-DD')
            setFormData((prev) => ({
                ...prev,
                startDate: prev.startDate || today,
                endDate: prev.endDate || ''
            }))
            setFormErrors((prev) => ({
                ...prev,
                startDate: null,
                endDate: null
            }))
        }
    }, [formData.renewalType?.renewal_types])

    useEffect(() => {
        if (formData.renewalType?.renewal_types === 'Warranty' && !formData.warrantyStartDate) {
            setFormData((prev) => ({
                ...prev,
                warrantyStartDate: moment().format('YYYY-MM-DD'),
                warrantyEndDate: prev.warrantyEndDate || ''
            }))
            setFormErrors((prev) => ({
                ...prev,
                warrantyStartDate: null,
                warrantyEndDate: null
            }))
        }
    }, [formData.renewalType?.renewal_types])
    const handleChange = (name, value) => {
        let updatedFormData = {...formData, [name] : value}

        if(name === 'renewalType') {
            if(value?.renewal_types === 'Insurance' || value?.renewal_types === 'Warranty' || value?.renewal_types === 'Subscription') {
                updatedFormData = {
                    ...updatedFormData,
                    assetName : null,
                    serviceProvider : null,
                    startDate : null,
                    endDate : null,
                    subscriptionName : null,
                    providerContact : null
                }
            }
            else {
                updatedFormData = {
                    ...updatedFormData,
                    assetName : null,
                    serviceProvider : null,
                    startDate : null,
                    endDate : null,
                    subscriptionName : null,
                    providerContact : null
                }
            }
        }
        
        if (name === 'providerContact' && !phoneValidation(value)) {
            setFormErrors({...formErrors, [name] : 'Invalid Provider Contact!'})
        }
        setFormData(updatedFormData)
        validateForm(name, value)
    }

    const validateForm = (name, value) => {
        if(!Object.keys(formErrors).includes(name)) return

        const warrantyType = (warranty) => (
            !warranty ||
            !warranty.warranty_type ||
            warranty.warranty_type === 'null' ||
            warranty.warranty_type === ''
        )

        if (name === 'providerContact') {
            if (!phoneValidation(value)) {
                setFormErrors({...formErrors, [name] : 'Invalid Contact No!'})
            } 
            else {
                setFormErrors({...formErrors, [name] : null})
            }
            return
        }

        if (name === 'vendorEmail') {
            if (!emailValidation(value)) {
                setFormErrors({...formErrors, [name] : 'Invalid Email!'})
            }
            else {
                setFormErrors({...formErrors, [name] : null})
            }
            return
        }

        if (name === 'annualPremium') {
            if (value === '0' || !(value > 0)) {
                setFormErrors({...formErrors, [name] : 'Annual Premium cannot be 0!'})
                return
            }
        }

        if (name === 'amount') {
            if (value === '0' || value === 0) {
                setFormErrors({...formErrors, [name] : 'Amount cannot be 0!'})
                return
            }
        }

        if (name === 'asset_warranty' && (formData.renewalType?.renewal_types === 'Warranty' || formData.renewalType === null)) {
            if (warrantyType(value)) {
                setFormErrors({
                    ...formErrors,
                    asset_warranty: 'Asset Warranty is Required!'
                })
            } else {
                setFormErrors({...formErrors, asset_warranty: null})
            }
            return
        }

        if(formData.renewalType?.renewal_types === 'Insurance' ||  formData.renewalType === null) {
            if(requiredFieldsInsuranceAndWarranty.includes(name) && (value === null || value === '')) {
                setFormErrors({
                    ...formErrors,
                    [name] : capitalize(name.replace(/_/g, '')) + ' is Required!'
                })
            }
            else {
                setFormErrors({...formErrors, [name] : null})
            }
        }
        if(formData.renewalType?.renewal_types === 'Warranty' || formData.renewalType === null) {
            if(requiredFieldsWarranty.includes(name) && (value === null || value === '')) {
                setFormErrors({
                    ...formErrors,
                    [name] : capitalize(name.replace(/_/g, '')) + ' is Required!'
                })
            }
            else {
                setFormErrors({...formErrors, [name] : null})
            }
        }
        else if(formData.renewalType?.renewal_types === 'Subscription' || formData.renewalType === null) {
            if(requiredFieldsSubscription.includes(name) && (value === null || value === '')) {
                setFormErrors({
                    ...formErrors,
                    [name] : capitalize(name.replace(/_/g, '')) + ' is Required!'
                })
            }
            else {
                setFormErrors({...formErrors, [name] : null})
            }
        }
        else {
            if(requiredFieldsOthers.includes(name) && (value === null || value === '')) {
                setFormErrors({
                    ...formErrors,
                    [name] : capitalize(name.replace(/_/g, '')) + ' is Required!'
                })
            }
            else {
                setFormErrors({...formErrors, [name] : null})
            }
        }
        
    }

    const handleDateChange = (date, field) => {
        if(!date) {
            setFormErrors((prev) => ({
                ...prev,
                [field] : `${field === 'contractStart' ? 'Contract Start Date' : field === 'contractEnd' ? 'Contract End Date' : field === 'startDate' ? 'Start Date' : field === 'warrantyStartDate' ? 'Warranty Start Date' : field === 'warrantyEndDate' ? 'Warranty End Date' : 'End Date'} is Required!`
            }))
            setFormData((prev) => ({
                ...prev,
                [field] : null
            }))
        }
        else {
            const formattedDate = moment(date).format('YYYY-MM-DD')
            setFormErrors((prev) => ({
                ...prev,
                [field] : null
            }))
            setFormData((prev) => ({
                ...prev,
                [field] : formattedDate
            }))
        }
    }

    const renewalsStartDateAndEndDate = (key) => {
        switch(key) {
            case 'startDate' :
                return 'Start Date is Required!'

            case 'endDate' :
                return 'End Date is Required!'

            case 'warrantyStartDate' :
                return 'Warranty Start Date is Required!'

            case 'warrantyEndDate' :
                return 'Warranty End Date is Required!'

            case 'contractStart' :
                return 'Contract Start Date is Required!'

            case 'contractEnd' :
                return 'Contract End Date is Required!'

            default :
                return capitalize(key) + ' is Required!'
        }
    }


    const handleSubmit = async(event) => {
        event.preventDefault()

        let isValid = true
        let formErrorObj = {...formErrors}
        let fileError = null

        if (renewalsFiles.renewalsFilePreviews?.length > 2) {
            fileError = 'Only 2 Files are allowed!'
        } else if (renewalsFiles.renewalsFiles?.length > 0) {
            const file = renewalsFiles.renewalsFiles[0]
            if (!ALLOWED_TYPES.includes(file.type)) {
                fileError = 'Only PNG, JPG, PDF, or Word files are allowed!'
            } else if (file.size > MAX_FILE_SIZE_BYTES) {
                fileError = 'File size must not exceed 10MB!'
            }
        }

        if (warrantyFiles?.warrantyFilePreviews?.length > 2) {
            fileError = 'Only 2 Files are allowed!'
        } else if (warrantyFiles?.warrantyFiles?.length > 0) {
            const file = warrantyFiles.warrantyFiles[0]
            if (!ALLOWED_TYPES.includes(file.type)) {
                fileError = 'Only PNG, JPG, PDF, or Word files are allowed!'
            } else if (file.size > MAX_FILE_SIZE_BYTES) {
                fileError = 'File size must not exceed 10MB!'
            }
        }

        if (fileError) {
            dispatch(OpenalertActions({ msg: fileError, severity: 'warning' }))
            return
        }
        const warrantyType = (warranty) => (
            !warranty ||
            !warranty.warranty_type ||
            warranty.warranty_type === 'null' ||
            warranty.warranty_type === ''
        )

        Object.keys(formData).forEach((key, i) => {
            if (key === 'providerContact') {
                if (formData[key] && !phoneValidation(formData[key])) {
                    isValid = false
                    formErrorObj[key] = 'Invalid Contact No!'
                }
            }
            if (key === 'vendorEmail') {
                if (formData[key] && !emailValidation(formData[key])) {
                    isValid = false
                    formErrorObj[key] = 'Invalid Email!'
                }
            }
            if (key === 'annualPremium' && (formData[key] === '0' || formData[key] === 0)) {
                isValid = false
                formErrorObj[key] = 'Annual Premium cannot be 0!'
            }

            if (key === 'amount' && (formData[key] === '0' || formData[key] === 0)) {
                isValid = false
                formErrorObj[key] = 'Amount cannot be 0!'
            }

            if(formData.renewalType?.renewal_types === 'Insurance' || formData.renewalType === null  ) {
                if(requiredFieldsInsuranceAndWarranty.includes(key) && (formData[key] === null || formData[key] === 'null' || formData[key] === '')) {
                    isValid = false
                    formErrorObj[key] = renewalsStartDateAndEndDate(key)
                }
                return null
            }
             else if(formData.renewalType?.renewal_types === 'Warranty' || formData.renewalType === null  ) {
                if(key === 'asset_warranty' && warrantyType(formData.asset_warranty)) {
                    isValid = false
                    formErrorObj[key] = 'Asset Warranty is Required!'
                }
                else if(requiredFieldsWarranty.includes(key) && (formData[key] === null || formData[key] === 'null' || formData[key] === '')) {
                    isValid = false
                    formErrorObj[key] = renewalsStartDateAndEndDate(key)
                }
                return null
            }
            else if(formData.renewalType?.renewal_types === 'Subscription' || formData.renewalType === null) {
                if(requiredFieldsSubscription.includes(key) && (formData[key] === null || formData[key] === 'null' || formData[key] === '')) {
                    isValid = false
                    formErrorObj[key] = renewalsStartDateAndEndDate(key)
                }
                return null
            }
            else if(((formData.renewalType?.renewal_types === 'Insurance' || formData.renewalType === null) || (formData.renewalType?.renewal_types !== 'Warranty' && formData.renewalType?.renewal_types !== 'Subscription'))) {
                if(requiredFieldsOthers.includes(key) && (formData[key] === null || formData[key] === 'null' || formData[key] === '')) {
                    isValid = false
                    formErrorObj[key] = renewalsStartDateAndEndDate(key)
                }
                return null
            }
            else {
                if(requiredFieldsOthers.includes(key) && (formData[key] === null || formData[key] === 'null' || formData[key] === '') && formData.renewalType?.renewal_types !== 'Warranty' && formData.renewalType?.renewal_types !== 'Insurance' ) {
                    isValid = false
                    formErrorObj[key] = renewalsStartDateAndEndDate(key)
                }
                return null
            }
        })
        if (
         formData.agentEmail &&
        !emailValidation(formData.agentEmail)
        ) {
        isValid = false;
        formErrorObj.agentEmail = "Invalid Email Address!";
        }
        if (
        formData.warranty_provider_email &&
        !emailValidation(formData.warranty_provider_email)
      ) {
        isValid = false;
        formErrorObj.warranty_provider_email = "Invalid Email Address!";
      }
        setFormErrors(formErrorObj)

        if(isValid) {
            let renewfiles ;
            const formValues = new FormData()

            let renewalsFile = []

            if (renewalsFiles.renewalsFiles?.length > 0) {
                // ✅ New file selected — upload it
                renewalsFiles.renewalsFiles.map((file) => {
                    formValues.append('renewalsFiles', file)
                    renewfiles = file
                    renewalsFile.push({
                        fileName: file.name,
                        type: file.type
                    })
                })
            } else if (renewalsFiles.existingImageKey?.length > 0) {
                renewalsFile = renewalsFiles.existingImageKey.map((url) => ({
                    fileName: url,   
                    type: 'existing'
                }))
            }
            let warrantyFile = []
            let warFiles   

            if (warrantyFiles.warrantyFiles?.length > 0) {
                warrantyFiles.warrantyFiles.map((file) => {
                    formValues.append('warrantyFiles', file)
                    warFiles = file
                    warrantyFile.push({
                        fileName: file.name,
                        type: file.type
                    })
                })
            } else if (warrantyFiles.existingImageKey?.length > 0) {
                warrantyFile = warrantyFiles.existingImageKey.map((url) => ({
                    fileName: url,
                    type: 'existing'
                }))
            }
            const defaultFrequency = getFrequencyType?.find(
                f => f.frequency_type === "MONTHLY"
            );

            setFormData(prev => ({
                ...prev,
                frequency: defaultFrequency || null
            }));
            
            const normalizedNotes = normalizeText(formData.notes) ?? '';

            if(formData.renewalType?.renewal_types === 'Insurance') {
                formValues.append('renewal_type', formData.renewalType.type_id)
                formValues.append('asset_id', formData.assetName?.asset_id || null)
                props.page === 'asset' ? formValues.append('asset_type_id', props.assetType) :formValues.append('asset_type_id', (formData.assetName?.asset_type_id) )
                props.page === 'asset' ? formValues.append('asset_group_id', props.assetGroup) :formValues.append('asset_group_id', formData.assetName?.asset_group_id)
                formValues.append('insurance_agent', formData.agent?.id ? formData.agent.id : formData.agent?.name ? formData.agent.name : formData.agent ? formData.agent : "")
                formValues.append('policy_no', formData.policyNo)
                formValues.append('sum_insured', formData.sumInsured)
                formValues.append('annual_premium', formData.annualPremium)
                formValues.append('frequency', formData.frequency ? formData.frequency.id : 1)
                formValues.append('start_date', formData.startDate)
                formValues.append('end_date', formData.endDate)
                formValues.append('provider_contact', formData.providerContact || "")
                formValues.append('renewal_reminder',  JSON.stringify(normalizeReminder(formData.reminder)) || null)
                formValues.append('notes', normalizedNotes)
                formValues.append('image', JSON.stringify(renewalsFile))
                formValues.append('properties', JSON.stringify(formData.insuranceDynamicPropValues))
                formValues.append('dynamic_fields', JSON.stringify(formData.insuranceDynamicProp))
                formValues.append('email_notification', formData.email_notification ? 1 : 0 )
                formValues.append('sms_notification', formData.sms_notification ? 1 : 0 )
                formValues.append('whatsApp_notification', formData.whatsApp_notification ? 1 : 0 )
                formValues.append('repeat', formData.repeat ? 1 : 0 )
                formValues.append('agentEmail', formData.agentEmail || '' )
                formValues.append('insuranceProvider', formData.insuranceProvider )
                formValues.append( 'insurance_type', formData.insurance_type?.id || null)

                if(props?.type === 'Renew') {
                    await dispatch(renewInsuranceAction(formValues, props?.data.id))
                    props.handleSubmitClose()
                }
                else {
                    if(props.form === 'Insurance' && !props.renewal ){
                        props.handleNext({
                            ...formData,
                            image: JSON.stringify(renewalsFile),
                            file : renewfiles
                            });
                    }
                    else{
                        if(props.status === 'edit'  && props?.insurance_id) {
                            await dispatch(updateInsuranceAction(formValues,props?.insurance_id))
                            props.handleClose()
                        }
                        else{
                            await dispatch(CreateInsurance(formValues))
                            props.handleClose()
                        }
                    }
                }
            }
            else if(formData.renewalType?.renewal_types === 'Warranty') {
                formValues.append('renewal_type', formData.renewalType?.type_id)
                formValues.append('asset_id', formData.assetName?.asset_id)
                formValues.append('warranty_seller', formData.serviceProvider)
                // formValues.append('provider_contact', formData.providerContact)
                formValues.append('warranty_fromDate_Time', formData.warrantyStartDate)
                formValues.append('warranty_toDate_Time', formData.warrantyEndDate)
                 formValues.append('email_notification', formData.email_notification ? 1 : 0 )
                formValues.append('sms_notification', formData.sms_notification ? 1 : 0 )
                formValues.append('whatsApp_notification', formData.whatsApp_notification ? 1 : 0 )
                formValues.append('warrantyServiceProvider', formData.warrantyServiceProvider?.id ? formData.warrantyServiceProvider?.id  : formData.warrantyServiceProvider   )
                formValues.append('warrantyProviderContact', formData.warrantyProviderContact )
                formValues.append('warrantyProviderEmail', formData.warranty_provider_email || null )
                formValues.append('warrantyStartDate', formData.warrantyStartDate)
                formValues.append('warrantyEndDate', formData.warrantyEndDate)
                formValues.append('warrantyType', formData.asset_warranty?.id || null)
                // formValues.append('assetgroup', formData.asset_group.asset_group_id)
                // formValues.append('assetType', formData.assetType.id)
                props.page === 'asset' ? formValues.append('asset_type_id', props.assetType) :formValues.append('asset_type_id', formData.assetName?.asset_type_id)
                props.page === 'asset' ? formValues.append('asset_group_id', props.assetGroup) :formValues.append('asset_group_id', formData.assetName?.asset_group_id)
                formValues.append('repeat', formData.repeat ? 1 : 0)
                formValues.append('warranty_reminder',  JSON.stringify(normalizeReminder(formData.reminder)) || null)
                formValues.append('frequency', formData.frequency ? formData.frequency?.id : null)
                formValues.append('notes', normalizedNotes)
                formValues.append('title', formData.title)
                formValues.append('amount',formData.amount)
                formValues.append('annual_premium', formData.annualPremium)
                formValues.append('policy_no', formData.policyNo)
                formValues.append('image', JSON.stringify(warrantyFile))

                if(props?.type === 'Renew' && props.path !== 'warranty') {
                    await dispatch(renewWarrantyAction(formValues, props?.data.id))
                    props.handleSubmitClose()
                }
                else {
                    if(props.form === 'Warranty' && props.path !== 'warranty'){
                        props.handleNext({
                            ...formData,
                            image: JSON.stringify(warrantyFile),
                            file : warFiles
                            })
                    }
                    else{
                        if (props.status === 'edit' && props?.warranty_id) {  
                            // console.log("warrr")                   
                            await dispatch(updateWarrantyAction(formValues, props?.warranty_id))
                            props.handleClose()
                            return
                        }
                        await dispatch(insertAssetwarrantyAction(formValues))
                        props.handleClose()
                    }
                }
            }
            else {
                formValues.append('renewal_type', formData.renewalType.type_id)
                formValues.append('asset_id', formData.assetName ? formData.assetName.asset_id : null)
                formValues.append('subscription_name', formData.subscriptionName ? formData.subscriptionName : null)
                formValues.append('renewal_name', formData.serviceProvider)
                formValues.append('provider_contact', formData.providerContact)
                formValues.append('renewal_type_name', formData.renewalType.renewal_types)
                // formValues.append('start_date', formData.startDate)
                // formValues.append('end_date', formData.endDate)
                formValues.append('image', JSON.stringify(renewalsFile))
                formValues.append('priority', formData.priority ? formData.priority?.id : null)
                formValues.append('due_date', formData.dueDate)
                formValues.append('amount', formData.amount)
                formValues.append('description', formData.description)
                formValues.append('vendorName', formData.vendorName?.id ?  formData.vendorName?.id  : formData.vendorName )
                formValues.append('vendorContact', formData.vendorContact)
                formValues.append('vendorEmail', formData.vendorEmail)
                formValues.append('vendorUrl', formData.vendorUrl)
                formValues.append('contractNo', formData.contractNo)
                formValues.append('contractStart', formData.contractStart)
                formValues.append('contractEnd', formData.contractEnd)
                formValues.append('noticeDays', formData.noticeDays)
                formValues.append('renew', formData.renew === true ? 1 : 0)
                formValues.append('billingCycle', formData.billingCycle ? formData.billingCycle.id : null)
                formValues.append('paymentMethod', formData.paymentMethod ? formData.paymentMethod.id : null)
                formValues.append('licenseUnits', formData.licenseUnits)
                formValues.append('email_notification', formData.email_notification ? 1 : 0 )
                formValues.append('sms_notification', formData.sms_notification ? 1 : 0 )
                formValues.append('whatsApp_notification', formData.whatsApp_notification ? 1 : 0 )
                formValues.append('renewal_reminder',  JSON.stringify(normalizeReminder(formData.reminder)) || null)
                formValues.append('repeat', formData.repeat ? 1 : 0)
                // formValues.append('insurance_type',  formData.insurance_type?.insurance_type || null)
                
                if(props.type === 'Renew') {
                    await dispatch(renewRenewalsAction(formValues, props?.data.id))
                    props.handleSubmitClose()
                }
                else {
                    if(props.status === 'edit'){
                        await dispatch(updateSubscriptionAction(formValues,props?.subscription_id))
                        props.handleClose()
                        return
                    }
                    await dispatch(createRenewalsFormAction(formValues))
                    props.handleClose()
                }
            }
        }
        else {
            if (renewalsFiles.renewalsFilePreviews?.length > 1 || warrantyFiles?.warrantyFilePreviews?.length > 1) {
                isValid = false
                dispatch(OpenalertActions({ msg: 'Only 1 File is allowed!', severity: 'warning' }))
                formErrorObj.files = 'Only 1 File is allowed!'
            } else if (renewalsFiles.renewalsFiles?.length > 0 || warrantyFiles?.warrantyFilePreviews?.length > 1) {
                const file = renewalsFiles.renewalsFiles[0]
                if (!ALLOWED_TYPES.includes(file.type)) {
                    isValid = false
                    dispatch(OpenalertActions({ msg: 'Only PNG, JPG, PDF, or Word files are allowed!', severity: 'warning' }))
                    formErrorObj.files = 'Only PNG, JPG, PDF, or Word files are allowed!'
                } else if (file.size > MAX_FILE_SIZE_BYTES) {
                    isValid = false
                    dispatch(OpenalertActions({ msg: 'File size must not exceed 10MB!', severity: 'warning' }))
                    formErrorObj.files = 'File size must not exceed 10MB!'
                }
            } else {
                dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
            }
        }
    }

    const handleEmailSmsChange = (name, value) => {
        setFormData((prev) => ({...prev, [name] : value}))
    }

    useEffect(()=>{
        if(formData.agent !== null && formData.agent !== ''){
            setFormData((prev)=> ({...prev, providerContact : formData.agent?.contact, agentEmail : formData.agent?.email}))
        }
    },[formData.agent?.id])
    
    useEffect(()=>{
        if(formData.warrantyServiceProvider !== null && formData.warrantyServiceProvider !== ''){
            setFormData((prev)=> ({...prev, warrantyProviderContact : formData.warrantyServiceProvider?.contact, warranty_provider_email : formData.warrantyServiceProvider?.email}))
        }
    },[formData.warrantyServiceProvider?.id])

    useEffect(() => {
        if (
            formData.vendorName !== null && formData.vendorName !== '') {
                setFormData((prev) => ({
                    ...prev,
                    vendorContact: formData.vendorName?.contact || null,
                    vendorEmail: formData.vendorName?.email || null,
                }))
        }
    }, [formData.vendorName?.id])


  useEffect(() => {
  if (!props.isActive || hasHydratedEditData.current) return;

  if (props.asset_id && props?.form === 'Insurance') {
    dispatch(getInsuranceDetailsAction(props.asset_id));
    hasHydratedEditData.current = true;
  }
//   else if(props.asset_id && props?.form === 'Warranty'){
//     dispatch(getWarrantyByAssetAction(props.asset_id))
//     hasHydratedEditData.current = true;
//   }
  else if(props.asset_id && props?.form === 'Subscription'){
    dispatch(getRenewalsByIdAction(props.asset_id))
    hasHydratedEditData.current = true;
  }
  else if(props.insurance_id && props?.form === 'Insurance' && props.status === 'edit'){
    const data = {
        insurance_id : props.insurance_id
    }
    dispatch(getInsuranceDetailsAction(props?.insurance_id,data))
    hasHydratedEditData.current = true;
  }
  else if(props?.warranty_id && props?.form === 'Warranty' && props.status === 'edit'){
    dispatch(getWarrantyByIdAction(props?.warranty_id))
    hasHydratedEditData.current = true;
  }
  else if(props?.subscription_id && props?.form === 'Subscription' && props.status === 'edit'){
    // console.log("dgdgdf");
    
    dispatch(getRenewalsByIdAction(props?.subscription_id))
    hasHydratedEditData.current = true;
  }
}, [props.isActive, props.asset_id, props.insurance_id, props?.warranty_id, props?.form, props.status, props?.subscription_id]);

useEffect(() => {
  if (props.status !== "edit") return;

  const insurance = Object.values(getInsuranceDetails || {})[0];
  if (!insurance) return;

  const selectedAsset =
    getAssetName?.find(
      (asset) => String(asset?.asset_id) === String(insurance?.asset_id)
    ) || null;

    const generalConatct = get_asst_general?.data?.find((item) => Number(item.id === Number(insurance?.broker_agent)))
    
    const insurance_type = getInsuranceLov.find(
     (item) => Number(item.id) === Number(insurance?.type)
    )

  setFormData((prev) => ({
    ...prev,

    startDate: insurance.start_date?.split(" ")[0] || null,
    endDate: insurance.end_date?.split(" ")[0] || null,

    policyNo: insurance.policy_no || null,
    sumInsured: insurance.sum_insured || null,
    annualPremium: insurance.annual_premium || null,

    frequency: insurance.frequency
      ? getFrequencyType.find((e) => e.id === insurance.frequency)
      : prev.frequency,

    insurance_type: insurance_type || null,

    agentEmail:generalConatct?.email || null,
    providerContact: generalConatct?.contact || null,
    insuranceProvider: insurance.insurance_provider || null,

    reminder: normalizeReminder(insurance.renewal_reminder) || null,

    agent: generalConatct?.name ,
    notes: normalizeText(insurance.notes),

    sms_notification: Boolean(insurance.sms_notification),
    email_notification: Boolean(insurance.email_notification),
    whatsApp_notification: Boolean(insurance.whatsApp_notification),
    repeat: Boolean(insurance.repeat),

    insurance_id: insurance.insurance_id || null,
    assetName: selectedAsset || prev.assetName || null,
  }));

  setRenewalsFiles({
    renewalsFiles: [],
    renewalsFilePreviews: insurance.image || [],
    existingImageKey: insurance.imageKey ? JSON.parse(insurance.imageKey) : [],
  });
}, [getInsuranceDetails, getAssetName, getInsuranceLov, getFrequencyType]);


useEffect(() => {
  if (!get_asst_warranty || props.status !== 'edit') return;

  const w = Array.isArray(get_asst_warranty) ? get_asst_warranty[0] : get_asst_warranty;
  if (!w) return;
  const annualPremium = w.annual_premium === 0 ? "" : w.annual_premium
  const selectedWarrantyType =
    get_asset_warranty?.find(
      (option) =>
        String(option?.id) === String(w?.warranty_type_id ?? w?.warrantyType ?? w?.warranty_type)
    ) ||
    get_asset_warranty?.find(
      (option) => String(option?.warranty_type) === String(w?.warranty_type)
    ) ||
    null;
    const selectedAsset = getAssetName?.find(
    (asset) => String(asset?.asset_id) === String(w?.asset_id)
  ) || null;

    const generalConatct = get_asst_general?.data?.find((item) => Number(item.id === Number(w?.provider_name)))

  setFormData((prev) => ({
    ...prev,

    serviceProvider: normalizeText(w.seller),

    warrantyStartDate: w.fromDate_Time || null,
    warrantyEndDate: w.toDate_Time || null,

    email_notification: Boolean(w.email_notification),
    sms_notification: Boolean(w.sms_notification),
    whatsApp_notification: Boolean(w.whatsApp_notification),

    warrantyServiceProvider: generalConatct?.name,
    warrantyProviderContact: generalConatct?.contact,
    warranty_provider_email: generalConatct?.email,

    asset_warranty: selectedWarrantyType,

    repeat: Boolean(Number(w.repeat)),

    reminder: normalizeReminder(w.reminder) || null,

    frequency: w.frequency
      ? (getFrequencyType?.find((f) => Number(f.id) === Number(w.frequency)) || null)
      : null,

    notes: normalizeText(w.notes),
    warranty_id: w.warranty_id || w.id || prev.warranty_id || null,

    assetType: { id: Number(w.asset_type_id) },
    asset_group: { asset_group_id: Number(w.asset_group_id) },
    assetName: selectedAsset || prev.assetName || null,
    title: w.title,
    amount: w.amount,
    annualPremium: annualPremium,
    policyNo: w.policy_no,

  }));
  setWarrantyFiles({
    warrantyFiles: [],
    warrantyFilePreviews: w.image || [],
    existingImageKey : w.imageKey ? JSON.parse(w.imageKey ) : []
  });
}, [get_asst_warranty, props.status, get_asset_warranty, getAssetName]);


useEffect(() => {
  if (props.status !== 'edit' || props.form !== 'Subscription') return;

  const subscription = Array.isArray(renewalsById) ? renewalsById[0] : renewalsById;
  if (!subscription || Object.keys(subscription).length === 0) return;

  const selectedAsset =
    getAssetName?.find(
      (asset) => String(asset?.asset_id) === String(subscription?.asset_id)
    ) || null;

  const renewalTypeValue =
    getRenewalsLov?.find(
      (type) =>
        type?.renewal_types === 'Subscription' ||
        String(type?.type_id) === String(subscription?.renewal_type) ||
        String(type?.type_id) === String(subscription?.type_id)
    ) || null;

  const priorityType =
    getServiceDuePriority?.find(
      (p) => String(p?.id) === String(subscription?.priority)
    ) || null;

  const billingCycleType =
    getFrequencyType?.find(
      (f) => String(f?.id) === String(subscription?.billing_cycle)
    ) || null;

  const paymentMethodType =
    getPaymentMethod?.find(
      (p) => String(p?.id) === String(subscription?.payment_method)
    ) || null;

  let parsedReminder = null;
  try {
    const rawReminder = subscription?.renewal_reminder || subscription?.reminder;
    if (rawReminder) {
      parsedReminder = typeof rawReminder === 'string'
        ? JSON.parse(rawReminder)
        : rawReminder;
    }
  } catch (err) {
    parsedReminder = null;
  }

  const generalConatct = get_asst_general?.data?.find((item) => Number(item.id) === Number(subscription?.vendor_name))

  setFormData((prev) => ({
    ...prev,
    renewalType: renewalTypeValue || prev.renewalType || { renewal_types: 'Subscription' },
    assetName: selectedAsset || prev.assetName || null,
    subscriptionName: subscription?.subscription_name || null,
    serviceProvider: subscription?.service_provider || subscription?.renewal_name || null,
    providerContact: subscription?.provider_contact || null,
    priority: priorityType || prev.priority || null,
    dueDate: subscription?.due_date || null,
    amount: subscription?.amount ?? null,
    description: subscription?.description || null,
    vendorName: generalConatct?.name || null,
    vendorContact : generalConatct?.contact || null,
    vendorEmail: generalConatct?.email || null,
    vendorUrl: subscription?.vendor_url || null,
    contractNo: subscription?.contract_no || null,
    contractStart: subscription?.start_date  || null,
    contractEnd: subscription?.end_date || null,
    noticeDays: subscription?.notice_days || null,
    renew: subscription?.renew === 0 ? false : Boolean(subscription?.renew),
    billingCycle: billingCycleType || prev.billingCycle || null,
    paymentMethod: paymentMethodType || prev.paymentMethod || null,
    licenseUnits: subscription?.license_units || null,
    reminder: normalizeReminder(subscription.renewal_reminder) || null,
    sms_notification: Boolean(subscription?.sms_notification),
    email_notification: Boolean(subscription?.email_notification),
    whatsApp_notification: Boolean(subscription?.whatsApp_notification),
    repeat : subscription?.repeat || null

  }));

    setRenewalsFiles({
        renewalsFiles: [],
        renewalsFilePreviews: subscription.image?.map(img => img.imageUrl) || [],
        existingImageKey: subscription.imageKey ? JSON.parse(subscription.imageKey) : [],

    })
}, [
  renewalsById,
  props.status,
  props.form,
  getRenewalsLov,
  getAssetName,
  getFrequencyType,
  getServiceDuePriority,
  getPaymentMethod
]);
  return (
      // <Card sx = {{ p : 5 }} style={{width:'100%'}}>
      // </Card>
      <Box
        sx={{
            width: '100%',
            maxHeight: props.page === 'asset' ? 'none' : 'calc(100vh - 80px)',
            overflowY: props.page === 'asset' ? 'visible' : 'auto',
            overflowX: 'hidden',
            pr: 1,
        }}
        >
      <Grid container width={'100%'} spacing={2}>
          <Grid
              size={{
                  lg: 10,
                  md: 10,
                  sm: 10,
                  xs: 10
              }}>
              <Grid container display='flex' justifyContent='space-between'>
                  <Grid>
                      {/* <Typography variant='h6' align='left' style={{ paddingBottom : '20px' }}>
                          `&{ props?.form}`
                      </Typography> */}
                  </Grid>
              </Grid>
          </Grid>
          <Grid
              size={{
                  lg: props?.type === 'Renew' ? 12 : 12,
                  md: props?.type === 'Renew' ? 12 : 12,
                  sm: props?.type === 'Renew' ? 12 : 12,
                  xs: props?.type === 'Renew' ? 12 : 12
              }}>
              <Grid container spacing={3}>
                  <Grid
                      size={{
                          lg: 3,
                          md: 4,
                          sm: 4,
                          xs: 12
                      }}>
                      <Autocomplete 
                          options = {getRenewalsLov}
                          getOptionLabel = {(option) => option.renewal_types || ''}
                          value = {formData.renewalType}
                          onChange = {(name, value) => handleChange('renewalType', value)}
                          disabled = {props.type === 'Renew' ? true : (props?.form === 'Insurance' || props?.form === 'Warranty' || props?.form === 'Subscription') ? true :  false}
                          renderInput = {(params) => (
                              <TextField 
                                  {...params}
                                  required
                                  label = 'Renewal Type'
                                  variant = 'filled'
                                  error = {formErrors.renewalType !== null}
                                  helperText = {formErrors.renewalType === null ? '' : 'Renewal Type is Required!'}
                              />
                          )}
                      />
                  </Grid>
              
                  {
                      (formData.renewalType?.renewal_types === 'Insurance' || formData.renewalType?.renewal_types === 'Warranty' || formData.renewalType?.renewal_types === 'Subscription') && (
                          <>
                              <Grid
                                  size={{
                                      lg: 3,
                                      md: 4,
                                      sm: 4,
                                      xs: 12
                                  }}>
                                  <Autocomplete 
                                      options = {getAssetName}
                                      getOptionLabel={(option) => {
                                          if (!option) return ''
                                          return typeof option === 'string' ? option : `${option.Name} - ${option.Code}`
                                      }}
                                      renderOption={(props, option) => (
                                          <li {...props}>
                                              {`${option.Name} - ${option.Code} - ${option['Asset Owner']} - ${option.Location}`}
                                          </li>
                                      )}
                                      value = {formData?.assetName ?? null}
                                      onChange = {(name, value) => handleChange('assetName', value)}
                                      isOptionEqualToValue={(option, value) => option?.asset_id === value?.asset_id}
                                      disabled = {props.type === 'Renew' ? true : false}
                                      renderInput = {(params) => (
                                          <TextField 
                                              {...params}
                                              required
                                              label = 'Asset Name'
                                              variant = 'filled'
                                              error = {formErrors.assetName !== null}
                                              helperText = {formErrors.assetName === null ? '' : 'Asset Name is Required!'}
                                          />
                                      )}
                                  />
                              </Grid>

                              {formData.assetName?.asset_id !== null && formData.assetName?.asset_id !== undefined && (
                                  <>
                                      <Grid
                                          size={{
                                              lg: 6,
                                              md: 6,
                                              sm: 6,
                                              xs: 12
                                          }}>
                                      <Box
                                          display='flex'
                                          flexDirection='row'
                                          alignItems='flex-start'
                                          p={2}
                                          mt={2}
                                          border='1px solid #ccc'
                                          borderRadius={2}
                                          bgcolor='#f9f9f9'
                                      >
                                          <Box display='flex' flexDirection='row' gap={4} ml={2}>
                                          <Typography variant='h6'>
                                              Asset Code : {formData.assetName?.Code}
                                          </Typography>

                                          <Typography variant='h6'>
                                              Asset Group : {formData?.assetName?.['Asset Group']}
                                          </Typography>

                                          <Typography variant='h6'>
                                              Asset Type : {formData?.assetName?.['Asset Type']}
                                          </Typography>

                                          <Typography variant='h6'>
                                              Location : {formData.assetName?.Location}
                                          </Typography>
                                          <Typography variant='h6'>
                                              Assigned To : {formData.assetName?.['Assigned To']}
                                          </Typography>
                                          </Box>
                                      </Box>
                                      </Grid>
                                  </>
                                  )}
                              {/* {props.page !== "asset" &&
                              <Grid size={{ xs: 12, sm: 4, md: 4, lg: 3 }}>
                             <Autocomplete 
                                      options={getAssetGroup.data || []}
                                      getOptionLabel={(option) => option.asset_group || ''}
                                      value={formData.asset_group || null}
                                      onChange={(name, value) => handleChange('asset_group', value)}
                                      disabled = {props.type === 'Renew' ? true : false}
                                      renderInput={(params) => (
                                          <TextField 
                                              {...params}
                                              required
                                              label='Asset Group'
                                              variant='filled'
                                              error={formErrors.asset_group !== null}
                                              helperText={formErrors.asset_group === null ? '' : 'Asset Group is Required!'}
                                          />
                                      )}
                                  />
                                  </Grid>
                              }

                                  {props.page !== "asset" &&

                              <Grid size={{ xs: 12, sm: 4, md: 4, lg: 3 }}>
                                  <Autocomplete 
                                      options={getAssetType.data}
                                      getOptionLabel={(option) => option.asset_type || ''}
                                      value={formData.assetType}
                                      onChange={(name, value) => handleChange('assetType', value)}
                                      disabled = {props.type === 'Renew' ? true : false}
                                      renderInput={(params) => (
                                          <TextField 
                                              {...params}
                                              required
                                              label='Asset Type'
                                              variant='filled'
                                              error={formErrors.assetType !== null}
                                              helperText={formErrors.assetType === null ? '' : 'Asset Type is Required!'}
                                          />
                                      )}
                                  />
                              </Grid>

                              } */}
                          </>
                      )
                  }

                  {
                      formData.renewalType?.renewal_types === 'Warranty' &&

                      <>

                      <Grid
                          size={{
                              lg: 3,
                              md: 4,
                              sm: 4,
                              xs: 12
                          }}>
                             <Autocomplete 
                                      options={get_asset_warranty}
                                      getOptionLabel={(option) => option.warranty_type || ''}
                                      value={formData.asset_warranty || null}
                                      onChange={(name, value) => handleChange('asset_warranty', value)}
                                      disabled = { false}
                                      renderInput={(params) => (
                                          <TextField 
                                              {...params}
                                              required
                                              label='Warranty Type'
                                              variant='filled'
                                              error={formErrors.asset_warranty !== null}
                                              helperText={formErrors.asset_warranty === null ? '' : 'Asset Warranty is Required!'}
                                          />
                                      )}
                                  />
                                  </Grid>
                      <Grid
                          size={{
                              lg: 3,
                              md: 4,
                              sm: 4,
                              xs: 12
                          }}>
                                            <Autocomplete
                                              fullWidth
                                              freeSolo
                                              options={get_asst_general?.data || []}
                                              getOptionLabel={(option) =>
                                                  typeof option === 'string' ? option : option?.name || ''
                                              }
                                              value={formData.warrantyServiceProvider || null}
                                              onInputChange={(event, newInputValue, reason) => {
                                                                      if (reason === 'input') {
                                                                      handleChange('warrantyServiceProvider', newInputValue);
                                                                      }
                                                                  }}
                              
                                              onChange={(event, newValue) => {
                                                  handleChange('warrantyServiceProvider', newValue);
                                              }}
                              
                                              renderInput={(params) => (
                                                  <TextField
                                                  {...params}
                                                  label="Warranty provider"
                                                  variant="filled"
                                                  />
                                              )}
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
                                                  fullWidth
                                                  label='Warranty Provider Email'
                                                  variant='filled'
                                                  value={formData.warranty_provider_email || ''}
                                                  onChange={(event) =>
                                                    handleChange('warranty_provider_email', event.target.value)
                                                  }
                                                  error={formData.warranty_provider_email && !emailValidation(formData.warranty_provider_email)
                                                                  }
                                                  helperText={
                                                    formData.warranty_provider_email && !emailValidation(formData.warranty_provider_email)
                                                    ? 'Invalid Email Address!'
                                                    : ''
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
                                          fullWidth
                                              label='Warranty Provider Contact'
                                              variant='filled'
                                              type='number'
                                              value={formData.warrantyProviderContact || ''}
                                               onChange = {(event) => handleChange('warrantyProviderContact', event.target.value)}

                                              required = { (formData.warrantyServiceProvider && !formData.warrantyProviderContact) || 
                                                                                  (formData.warrantyProviderContact && !phoneValidation(formData.warrantyProviderContact))}

                                                error={
                                                  (formData.warrantyServiceProvider && !formData.warrantyProviderContact) || 
                                                  (formData.warrantyProviderContact && !phoneValidation(formData.warrantyProviderContact))
                                                  }
                                                  helperText={
                                                      formData.warrantyServiceProvider && !formData.warrantyProviderContact
                                                      ? 'Provider contact is required'
                                                      : formData.warrantyProviderContact && !phoneValidation(formData.warrantyProviderContact)
                                                      ? 'Invalid Contact No!'
                                                      : ''
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
                              <Autocomplete
                                  options={getFrequencyType || []}
                                  getOptionLabel={(option) => option?.frequency_type || ''}
                                  value={formData.frequency || getFrequencyType?.find(f => f.frequency_type === "MONTHLY") || null}
                                  onChange={(e, value) => handleChange('frequency', value)}
                                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                                  renderInput={(params) => (
                                      <TextField
                                          {...params}
                                          label="Premium Frequency"
                                          variant="filled"
                                      />
                                  )}
                              />

                          </Grid>

                      <Grid
                          size={{
                              lg: 3,
                              md: 4,
                              sm: 4,
                              xs: 12
                          }}>
                             <LocalizationProvider dateAdapter={DateAdapter}>
                                  <DatePicker 
                                      label = 'Start Date'
                                      value = {toMomentOrNull(formData.warrantyStartDate)}
                                      onChange = {(date) => handleDateChange(date, 'warrantyStartDate')}
                                      views={['year', 'month', 'day']}
                                      format="DD/MM/YYYY"
                                      shouldDisableDate = {(date) => formData.warrantyEndDate && moment(date).isAfter(moment(formData.warrantyEndDate), 'day')}
                                      slotProps={{ textField: { fullWidth: true, required: true, variant: 'filled' } }}
                                  />
                              </LocalizationProvider>
                                  </Grid>
                      <Grid
                          size={{
                              lg: 3,
                              md: 4,
                              sm: 4,
                              xs: 12
                          }}>
                             <LocalizationProvider dateAdapter={DateAdapter}>
                                  <DatePicker 
                                      label = 'End Date'
                                      value = {toMomentOrNull(formData.warrantyEndDate)}
                                      onChange = {(date) => handleDateChange(date, 'warrantyEndDate')}
                                      views={['year', 'month', 'day']}
                                      format="DD/MM/YYYY"
                                      shouldDisableDate = {(date) => formData.warrantyStartDate && moment(date).isBefore(moment(formData.warrantyStartDate), 'day')}
                                      slotProps={{ textField: { fullWidth: true, required: true, variant: 'filled' } }}
                                  />
                               </LocalizationProvider>
                               </Grid>
                              <Grid
                                  size={{
                                      lg: 3,
                                      md: 4,
                                      sm: 4,
                                      xs: 12
                                  }}>
                                  <TextField
                                      fullWidth
                                      required
                                      label='Title'
                                      variant='filled'
                                      value={formData.title || ''}
                                      onChange={(event) =>
                                          handleChange('title', event.target.value)
                                      }
                                      error={formErrors.title !== null}
                                      helperText={formErrors.title === null ? '' : 'Title is Required!'}
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
                                      fullWidth
                                      required
                                      label='Amount'
                                      variant='filled'
                                      value={formData.amount || ''}
                                       onChange={(event) => {
                                        const value = event.target.value;
                                        if (/^\d*$/.test(value)) {
                                            handleChange('amount', value);
                                        }}}
                                      error={formErrors.amount !== null}
                                      helperText={formErrors.amount || ''}
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
                                      fullWidth
                                      label='Annual Premium'
                                      variant='filled'
                                      value={formData.annualPremium || ''}
                                      onChange={(event) => {
                                      const value = event.target.value;
                                      if (/^\d*$/.test(value)) {
                                      handleChange('annualPremium', value);
                                    }}}
                                      error={formErrors.annualPremium !== null}
                                      helperText={formErrors.annualPremium || ''}
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
                                      fullWidth
                                      required
                                      label='Policy No'
                                      variant='filled'
                                      value={formData.policyNo || ''}
                                      onChange={(event) => {
                                        const value = event.target.value;
                                        if (/^\d*$/.test(value)) {
                                            handleChange('policyNo', value);}}}
                                      error={formErrors.policyNo !== null}
                                      helperText={formErrors.policyNo === null ? '' : 'Policy No is Required!'}
                                  />
                              </Grid>                              
                              <Grid
                              size={{
                                lg: 3,
                                md: 4,
                                sm: 4,
                                xs: 12
                                }}>
                                    <Autocomplete
                                    multiple
                                    disableCloseOnSelect
                                    fullWidth
                                    options={_.uniqBy(reminderDaysBefore, "reminder")}
                                    getOptionLabel={(option) => option?.reminder?.toString() || ""}
                                    value={Array.isArray(formData.reminder) ? formData.reminder : []}
                                    onChange={(event, newValue) => handleChange("reminder", newValue || [])}
                                    isOptionEqualToValue={(option, value) => option?.reminder === value?.reminder}
                                    renderInput={(params) => (
                                    <TextField
                                    {...params}
                                    label="Send Reminder Before"
                                    variant="filled"
                                    />)}/>
                                    </Grid>

                              <Grid
                                  size={{
                                      lg: 6,
                                      md: 8,
                                      sm: 8,
                                      xs: 12
                                  }}>
                              <TextField
                                  fullWidth
                                  multiline
                                  label='Notes'
                                  name='notes'
                                  variant='filled'
                                  rows={4}
                                  value={formData.notes || ''}
                                  onChange={(event) => handleChange('notes', event.target.value)}
                              /> 
                          </Grid>

                               <Grid
                                   size={{
                                       lg: 3,
                                       md: 4,
                                       sm: 4,
                                       xs: 12
                                   }}>
                              <FormControlLabel
                                  label = 'Repeat'
                                  control = {
                                      <Switch
                                          checked = {formData.repeat}
                                          onChange = {() => setFormData({...formData, repeat: !formData.repeat})}
                                      />
                                  }
                              />
                              </Grid>

                               <Reminder formData = {formData} handleEmailSmsChange = {handleEmailSmsChange}/>

                                  </>
                  }



                  {/* {
                      ((formData.renewalType?.renewal_types !== 'Insurance') || (formData.renewalType?.renewal_types !== 'Warranty' && formData.renewalType?.renewal_types !== 'Subscription') && (formData.renewalType !== null)) &&
                      <>
                          <Grid size={{ xs: 12, sm: 4, md: 4, lg: 3 }}>
                              <TextField
                                  fullWidth
                                  required
                                  label = 'Service Provider'
                                  variant = 'filled'
                                  value = {formData.serviceProvider || ''}
                                  onChange = {(event) => handleChange('serviceProvider', event.target.value)}
                                  error = {formErrors.serviceProvider !== null}
                                  helperText = {formErrors.serviceProvider === null ? '' : 'Service Provider is Required!'}
                              /> 
                          </Grid>
                      </>
                  } */}

                  {
                      formData.renewalType?.renewal_types === 'Insurance' &&
                      <>
                          <Grid
                              size={{
                                  lg: 3,
                                  md: 4,
                                  sm: 4,
                                  xs: 12
                              }}>
                              <TextField
                                  fullWidth
                                  required
                                  label='Policy Number'
                                  variant='filled'
                                  value={formData.policyNo || ''}
                                 onChange={(event) => {
                                    const value = event.target.value;
                                    if (/^\d*$/.test(value)) {
                                        handleChange('policyNo', value);}}}
                                  error={formErrors.policyNo !== null}
                                  helperText={formErrors.policyNo === null ? '' : 'Policy Number is Required!'}
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
                                  fullWidth
                                  label='Sum Insured (₹)'
                                  variant='filled'
                                  value={formData.sumInsured || ''}
                                  type='number'
                                  required
                                  onChange={(event) => handleChange('sumInsured', event.target.value)}
                                  error={formErrors.sumInsured !== null}
                                  helperText={formErrors.sumInsured === null ? '' : 'Sum Insured is Required!'}
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
                                  fullWidth
                                  label='Annual Premium (₹)'
                                  variant='filled'
                                  value={formData.annualPremium || ''}
                                  type='number'
                                  required
                                  onChange={(event) => handleChange('annualPremium', event.target.value)}
                                  error={formErrors.annualPremium !== null}
                                  helperText={formErrors.annualPremium || ''}
                              />
                          </Grid>

                          <Grid
                              size={{
                                  lg: 3,
                                  md: 4,
                                  sm: 4,
                                  xs: 12
                              }}>
                              <Autocomplete
                                  options={getFrequencyType || []}
                                  getOptionLabel={(option) => option?.frequency_type || ''}
                                  value={formData.frequency || getFrequencyType?.find(f => f.frequency_type === "MONTHLY") || null}
                                  onChange={(e, value) => handleChange('frequency', value)}
                                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                                  renderInput={(params) => (
                                      <TextField
                                          {...params}
                                          label="Premium Frequency"
                                          variant="filled"
                                      />
                                  )}
                              />

                          </Grid>
                      </>
                  }

                  {
                      (formData.renewalType?.renewal_types !== 'Insurance' && formData.renewalType?.renewal_types !== 'Warranty' && formData.renewalType?.renewal_types !== 'Subscription' && (formData.renewalType !== null)) &&
                      <>
                          <Grid
                              size={{
                                  lg: 3,
                                  md: 4,
                                  sm: 4,
                                  xs: 12
                              }}>
                              <TextField
                                  fullWidth
                                  required
                                  label = 'Provider Contact'
                                  variant = 'filled'
                                  type = 'number'
                                  value = {formData.providerContact || ''}
                                  onChange = {(event) => handleChange('providerContact', event.target.value)}
                                  error = {formErrors.providerContact !== null}
                                  helperText = {formErrors.providerContact === null ? '' : formErrors.providerContact}
                              /> 
                          </Grid> 
                      </>
                  }

                  {
                      ((formData.renewalType?.renewal_types === 'Insurance') || (formData.renewalType?.renewal_types !== 'Warranty' && formData.renewalType?.renewal_types !== 'Subscription') && (formData.renewalType !== null)) &&
                      <>
                          <Grid
                              size={{
                                  lg: 3,
                                  md: 4,
                                  sm: 4,
                                  xs: 12
                              }}>
                              <LocalizationProvider dateAdapter={DateAdapter}>
                                  <DatePicker 
                                      label = 'Start Date'
                                      value = {toMomentOrNull(formData.startDate)}
                                      onChange = {(date) => handleDateChange(date, 'startDate')}
                                      views={['year', 'month', 'day']}
                                      format="DD/MM/YYYY"
                                      shouldDisableDate = {(date) => formData.endDate && moment(date).isAfter(moment(formData.endDate), 'day')}
                                      slotProps={{ textField: { fullWidth: true, required: true, variant: 'filled', error: formErrors.startDate !== null, helperText: formErrors.startDate === null ? '' : formErrors.startDate } }}
                                  />
                              </LocalizationProvider>
                          </Grid>

                          <Grid
                              size={{
                                  lg: 3,
                                  md: 4,
                                  sm: 4,
                                  xs: 12
                              }}>
                              <LocalizationProvider dateAdapter={DateAdapter}>
                                  <DatePicker 
                                      label = 'End Date'
                                      value = {toMomentOrNull(formData.endDate)}
                                      onChange = {(date) => handleDateChange(date, 'endDate')}
                                      views={['year', 'month', 'day']}
                                      format="DD/MM/YYYY"
                                      shouldDisableDate = {(date) => formData.startDate && moment(date).isBefore(moment(formData.startDate), 'day')}
                                      slotProps={{ textField: { fullWidth: true, required: true, variant: 'filled', error: formErrors.endDate !== null, helperText: formErrors.endDate === null ? '' : formErrors.endDate } }}
                                  />
                              </LocalizationProvider>
                          </Grid>
                          {
                              formData.renewalType?.renewal_types !== 'Insurance' &&
                                  <Reminder formData = {formData} handleEmailSmsChange = {handleEmailSmsChange}/>
                          }
                      </>
                  }

                  {
                      formData.renewalType?.renewal_types === 'Insurance' &&
                      <>
                          <Grid
                              size={{
                                  lg: 3,
                                  md: 4,
                                  sm: 4,
                                  xs: 12
                              }}>
                          <Autocomplete
                              fullWidth
                              options={_.uniqBy(getInsuranceLov, "insurance_type")}
                               getOptionLabel={(option) => typeof option === "string" ? option : option?.insurance_type?.toString() || ""}
                              value={formData.insurance_type || null}
                              onChange={(event, newValue) => handleChange('insurance_type', newValue)}
                              renderInput={(params) => (
                                  <TextField
                                      required
                                      {...params}
                                      label="Insurance Type"
                                      variant="filled"
                                      error={formErrors.insurance_type !== null}
                                      helperText={formErrors.insurance_type === null ? '' : "Insurance Type is Required"}
                                  />
                              )}
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
                                  fullWidth
                                  label='Insurance Provider'
                                  variant='filled'
                                  required
                                  value={formData.insuranceProvider || ''}
                                  onChange={(event) => handleChange('insuranceProvider', event.target.value)}
                                  error = {formErrors.insuranceProvider !== null}
                                  helperText = {formErrors.insuranceProvider === null ? '' : ' Insurance Provider is required'}
                              /> 
                          </Grid>

                          <Grid
                              size={{
                                  lg: 3,
                                  md: 4,
                                  sm: 4,
                                  xs: 12
                              }}>
                              {/* <TextField
                                  fullWidth
                                  label='Agent Name'
                                  variant='filled'
                                  value={formData.agent || ''}
                                  onChange={(event) => handleChange('agent', event.target.value)}
                              />  */}
                              <Autocomplete
                                  fullWidth
                                  freeSolo
                                  options={get_asst_general?.data || []}
                                  getOptionLabel={(option) =>
                                      typeof option === 'string' ? option : option?.name || ''
                                  }

                                  value={formData.agent || null}
                                  onInputChange={(event, newInputValue, reason) => {
                                      if (reason === 'input') {
                                      handleChange('agent',{name : newInputValue});
                                      }
                                  }}
                                    onChange={(event, newValue) => {
                                        if (typeof newValue === 'string') {
                                            handleChange('agent', { name: newValue });
                                        } else {
                                            handleChange('agent', newValue);
                                        }
                                    }}

                                  renderInput={(params) => (
                                      <TextField
                                      {...params}
                                      label="Agent Name"
                                      variant="filled"
                                      />
                                  )}
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
                              fullWidth
                              label="Agent Contact"
                              variant="filled"
                              type="number"
                              required={!!formData.agent}
                              value={formData.providerContact || ''}
                              onChange={(e) => handleChange('providerContact', e.target.value)}
                              error={
                                  (formData.agent && !formData.providerContact) || 
                                  (formData.providerContact && !phoneValidation(formData.providerContact))
                              }
                              helperText={
                                  formData.agent && !formData.providerContact
                                  ? 'Agent contact is required'
                                  : formData.providerContact && !phoneValidation(formData.providerContact)
                                  ? 'Invalid Contact No!'
                                  : ''
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
                                  fullWidth
                                  label=' Agent Email'
                                  variant='filled'
                                  value={formData.agentEmail || ''}
                                  onChange={(event) => handleChange('agentEmail', event.target.value)}
                                  error={
                                        formData.agentEmail &&
                                        !emailValidation(formData.agentEmail)
                                        }
                                  helperText={
                                        formData.agentEmail &&
                                        !emailValidation(formData.agentEmail)
                                            ? "Invalid Email Address!"
                                            : ""
                                        }
                              /> 
                          </Grid>


                          <Grid
                              size={{
                                  lg: 6,
                                  md: 8,
                                  sm: 8,
                                  xs: 12
                              }}>
                              <TextField
                                  fullWidth
                                  multiline
                                  label='Notes'
                                  name='notes'
                                  variant='filled'
                                  rows={4}
                                  value={formData.notes || ''}
                                  onChange={(event) => handleChange('notes', event.target.value)}
                              /> 
                          </Grid>
                          <Grid
                              size={{
                                  lg: 12,
                                  md: 12,
                                  sm: 12,
                                  xs: 12
                              }}>
                      <Grid container spacing={2}>

                          <Grid
                          size={{
                            lg: 3,
                            md: 4,
                            sm: 4,
                            xs: 12
                            }}>
                                <Autocomplete
                                multiple
                                disableCloseOnSelect
                                fullWidth
                                options={_.uniqBy(reminderDaysBefore, "reminder")}
                                getOptionLabel={(option) => option?.reminder?.toString() || ""}
                                value={Array.isArray(formData.reminder) ? formData.reminder : []}
                                onChange={(event, newValue) => handleChange("reminder", newValue || [])}
                                isOptionEqualToValue={(option, value) => option?.reminder === value?.reminder}
                                renderInput={(params) => (
                                <TextField
                                {...params}
                                label="Send Reminder Before"
                                variant="filled"
                                />)}/>
                                </Grid>

                        
                              <Grid
                                  size={{
                                      lg: 3,
                                      md: 4,
                                      sm: 4,
                                      xs: 12
                                  }}>
                              <FormControlLabel
                                  label = 'Repeat'
                                  control = {
                                      <Switch
                                          checked = {formData.repeat}
                                          onChange = {() => setFormData({...formData, repeat: !formData.repeat})}
                                      />
                                  }
                              />
                              </Grid>

                              </Grid>

                              </Grid>
                                  

                          <Reminder formData = {formData} handleEmailSmsChange = {handleEmailSmsChange}/>
                      </>
                  }

                  {
                      (formData.renewalType?.renewal_types === 'Subscription' || props.form === 'Subscription') &&

                      <>
                          <Grid
                              size={{
                                  lg: 3,
                                  md: 4,
                                  sm: 4,
                                  xs: 12
                              }}>
                                <TextField 
                                  fullWidth
                                  required
                                  label = 'Title'
                                  variant = 'filled'
                                  value = {formData.subscriptionName}
                                  onChange = {(event) => handleChange('subscriptionName', event.target.value)}
                                  error = {formErrors.subscriptionName !== null}
                                  helperText = {formErrors.subscriptionName === null ? '' : ' Title is required'}
                                  InputLabelProps={{ shrink: true }}
                                />
                          </Grid>

                          <Grid
                              size={{
                                  lg: 3,
                                  md: 4,
                                  sm: 4,
                                  xs: 12
                              }}>
                              <Autocomplete 
                                  options={getServiceDuePriority}
                                  getOptionLabel={(option) => option.priority_name || ''}
                                  value={formData.priority}
                                  onChange={(name, value) => handleChange('priority', value)}
                                  renderInput={(params) => (
                                      <TextField 
                                          {...params}
                                          label='Priority'
                                          variant='filled'
                                      />
                                  )}
                              />
                          </Grid>

                          <Grid
                              size={{
                                  lg: 3,
                                  md: 4,
                                  sm: 4,
                                  xs: 12
                              }}>
                              <LocalizationProvider dateAdapter={DateAdapter}>
                                  <DatePicker
                                      label = "Due Date"
                                      value = {toMomentOrNull(formData.dueDate)}
                                      minDate={moment()}
                                      format="DD/MM/YYYY"
                                      onChange = {(date) => handleDateChange(date, 'dueDate')}
                                      slotProps={{ textField: { fullWidth: true, variant: 'filled', required: true, onKeyDown: (e) => e.preventDefault(), error: formErrors.dueDate !== null, helperText: formErrors.dueDate === null ? '' : formErrors.dueDate } }}
                                  />
                              </LocalizationProvider>
                          </Grid>

                          <Grid
                              size={{
                                  lg: 3,
                                  md: 4,
                                  sm: 4,
                                  xs: 12
                              }}>
                              <TextField 
                                  fullWidth
                                  label='Amount'
                                  variant='filled'
                                  value={formData.amount ?? ""}
                                  type='number'
                                  required
                                  onChange={(event) => handleChange('amount', event.target.value)}
                                  error = {formErrors.amount !== null}
                                  helperText = {formErrors.amount || ''}
                              />
                          </Grid>

                          <Grid
                              size={{
                                  lg: 8,
                                  md: 8,
                                  sm: 8,
                                  xs: 12
                              }}>
                              <TextField
                                  fullWidth
                                  multiline
                                  label='Description'
                                  name='description'
                                  variant='filled'
                                  rows={4}
                                  value={formData.description || ''}
                                  onChange={(event) => handleChange('description', event.target.value)}
                              />
                          </Grid>

                          <Grid size={12}>
                              <Typography variant='h6' align='left'>Vendor</Typography>
                          </Grid>
                          
                          <Grid
                              size={{
                                  lg: 3,
                                  md: 4,
                                  sm: 4,
                                  xs: 12
                              }}>
                              {/* <TextField 
                                  fullWidth
                                  required
                                  label='Vendor Name'
                                  variant='filled'
                                  value={formData.vendorName}
                                  onChange={(event) => handleChange('vendorName', event.target.value)}
                                  error={formErrors.vendorName !== null}
                                  helperText={formErrors.vendorName === null ? '' : 'Vendor Name is required'}
                              /> */}

                                <Autocomplete
                                  fullWidth
                                  freeSolo
                                  options={get_asst_general?.data || []}
                                  getOptionLabel={(option) =>
                                      typeof option === 'string' ? option : option?.name || ''
                                  }
                                  value={formData.vendorName || null}
                                      onChange={(event, newValue) => {
                                          handleChange('vendorName', newValue) 
                                      }}

                                      onInputChange={(event, newInputValue, reason) => {
                                          if (reason === 'input') {
                                              handleChange('vendorName', newInputValue)
                                          }
                                      }}
                                  renderInput={(params) => (
                                      <TextField
                                      {...params}
                                      label='Vendor Name'
                                      variant="filled"
                                      />
                                  )}
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
                                  fullWidth
                                  label='Vendor Email'
                                  variant='filled'
                                  value={formData?.vendorEmail ?? ""}
                                  onChange={(event) => handleChange('vendorEmail', event.target.value)}
                                  error={formData.vendorEmail && !emailValidation(formData.vendorEmail)}
                                  helperText={formData.vendorEmail && !emailValidation(formData.vendorEmail) ? 'Invalid Email!' : ''}
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
                                  fullWidth
                                  label='Vendor Contact'
                                  variant='filled'
                                  required = { (formData.vendorName && !formData.vendorContact) || 
                                  (formData.vendorContact && !phoneValidation(formData.vendorContact))}
                                  type='number'
                                  value={formData.vendorContact ?? ""}
                                  onChange={(event) => handleChange('vendorContact', event.target.value)}
                                    error={
                                  (formData.vendorName && !formData.vendorContact) || 
                                  (formData.vendorContact && !phoneValidation(formData.vendorContact))
                                  }
                                  helperText={
                                      formData.vendorName && !formData.vendorContact
                                      ? 'Vendor contact is required'
                                      : formData.vendorContact && !phoneValidation(formData.vendorContact)
                                      ? 'Invalid Contact No!'
                                      : ''
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
                                  fullWidth
                                  label='Vendor Portal URL'
                                  variant='filled'
                                  value={formData.vendorUrl ?? ""}
                                  onChange={(event) => handleChange('vendorUrl', event.target.value)}
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
                                  fullWidth
                                  label='Contract Number'
                                  variant='filled'
                                  type='number'
                                  value={formData.contractNo ?? ""}
                                  onChange={(event) => handleChange('contractNo', event.target.value)}
                              />
                          </Grid>

                          <Grid
                              size={{
                                  lg: 3,
                                  md: 4,
                                  sm: 4,
                                  xs: 12
                              }}>
                              <LocalizationProvider dateAdapter={DateAdapter}>
                                  <DatePicker 
                                      label='Contract Start'
                                      value={toMomentOrNull(formData.contractStart ?? "")}
                                      format="DD/MM/YYYY"
                                      onChange={(date) => handleDateChange(date, 'contractStart')}
                                      shouldDisableDate={(date) => formData.contractEnd && moment(date).isAfter(moment(formData.contractEnd), 'day')}
                                      slotProps={{ textField: { fullWidth: true, required: true, variant: 'filled', onKeyDown: (e) => e.preventDefault(), error: formErrors.contractStart !== null, helperText: formErrors.contractStart === null ? '' : formErrors.contractStart } }}
                                  />
                              </LocalizationProvider>
                          </Grid>

                          <Grid
                              size={{
                                  lg: 3,
                                  md: 4,
                                  sm: 4,
                                  xs: 12
                              }}>
                              <LocalizationProvider dateAdapter={DateAdapter}>
                                  <DatePicker 
                                      label='Contract End'
                                      value={toMomentOrNull(formData.contractEnd)}
                                      format="DD/MM/YYYY"
                                      onChange={(date) => handleDateChange(date, 'contractEnd')}
                                      shouldDisableDate={(date) => formData.contractStart && moment(date).isBefore(moment(formData.contractStart), 'day')}
                                      slotProps={{ textField: { fullWidth: true, required: true, variant: 'filled', onKeyDown: (e) => e.preventDefault(), error: formErrors.contractEnd !== null, helperText: formErrors.contractEnd === null ? '' : formErrors.contractEnd } }}
                                  />
                              </LocalizationProvider>
                          </Grid>

                          <Grid
                              size={{
                                  lg: 3,
                                  md: 4,
                                  sm: 4,
                                  xs: 12
                              }}>
                              <TextField 
                                  fullWidth
                                  label='Cancellation Notice Days'
                                  variant='filled'
                                  value={formData.noticeDays ?? ""}
                                  type='number'
                                  onChange={(event) => handleChange('noticeDays', event.target.value)}
                              />
                          </Grid>

                          {/* <Grid
                              size={{
                                  lg: 3,
                                  md: 4,
                                  sm: 4,
                                  xs: 12
                              }}>
                              <FormControlLabel 
                                  label='Auto Renew'
                                  control={
                                      <Switch 
                                          checked={formData.renew}
                                          onChange={() => setFormData({...formData, renew: !formData.renew})}
                                      />
                                  }
                              />
                          </Grid> */}

                          <Grid size={12}>
                              <Typography variant='h6' align='left'>Billing</Typography>
                          </Grid>

                          <Grid
                              size={{
                                  lg: 3,
                                  md: 4,
                                  sm: 4,
                                  xs: 12
                              }}>
                              <Autocomplete 
                                  options={getFrequencyType}
                                  getOptionLabel={(option) => option.frequency_type || ''}
                                  value={formData.billingCycle || getFrequencyType?.find(f => f.frequency_type === "MONTHLY") || null}
                                  onChange={(name, value) => handleChange('billingCycle', value)}
                                  renderInput={(params) => (
                                      <TextField 
                                          {...params}
                                          required
                                          label='Billing Cycle'
                                          variant='filled'
                                          error={formErrors.billingCycle !== null}
                                          helperText={formErrors.billingCycle === null ? '' : 'Billing Cycle is Required!'}
                                      />
                                  )}
                              />
                          </Grid>

                          <Grid
                              size={{
                                  lg: 3,
                                  md: 4,
                                  sm: 4,
                                  xs: 12
                              }}>
                              <Autocomplete 
                                  options={getPaymentMethod}
                                  getOptionLabel={(option) => option.payment_mode || ''}
                                  value={formData.paymentMethod}
                                  onChange={(name, value) => handleChange('paymentMethod', value)}
                                  renderInput={(params) => (
                                      <TextField 
                                          {...params}
                                          label='Payment Method'
                                          variant='filled'
                                      />
                                  )}
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
                                  fullWidth
                                  label='License or Units'
                                  variant='filled' 
                                  value={formData.licenseUnits ?? ""}
                                  onChange={(event) => handleChange('licenseUnits', event.target.value)}
                              />
                          </Grid>

                          <Grid
                          size={{
                            lg: 3,
                            md: 4,
                            sm: 4,
                            xs: 12
                            }}>
                                <Autocomplete
                                multiple
                                disableCloseOnSelect
                                fullWidth
                                options={_.uniqBy(reminderDaysBefore, "reminder")}
                                getOptionLabel={(option) => option?.reminder?.toString() || ""}
                                value={Array.isArray(formData.reminder) ? formData.reminder : []}
                                onChange={(event, newValue) => handleChange("reminder", newValue || [])}
                                isOptionEqualToValue={(option, value) => option?.reminder === value?.reminder}
                                renderInput={(params) => (
                                <TextField
                                {...params}
                                label="Send Reminder Before"
                                 variant="filled"
                                 />)}
                                 />
                                 </Grid>

                              <Grid
                                  size={{
                                      lg: 3,
                                      md: 4,
                                      sm: 4,
                                      xs: 12
                                  }}>
                                  <FormControlLabel
                                      label='Repeat'
                                      control={
                                          <Switch
                                              checked={formData.repeat}
                                              onChange={() => setFormData({ ...formData, repeat: !formData.repeat })}
                                          />
                                      }
                                  />
                              </Grid>
 
                          <Reminder formData = {formData} handleEmailSmsChange = {handleEmailSmsChange}/>
                      </>
                  }

                  {props.isActive && (formData.renewalType?.renewal_types === 'Insurance' || formData.renewalType?.renewal_types === 'Subscription') && (
                      <Grid
                          size={{
                              lg: 12,
                              md: 12,
                              sm: 12,
                              xs: 12
                          }}>
                          <AttachmentField 
                          asset='Renewals'
                          previews={renewalsFiles.renewalsFilePreviews}
                          setPreviews={setRenewalsFiles}
                          />
                          <Typography color='error'>
                          {formErrors.files === null ? '' : formErrors.files}
                          </Typography>
                      </Grid>
                      )}

                      {props.isActive && formData.renewalType?.renewal_types === 'Warranty' && (
                      <Grid
                          size={{
                              lg: 12,
                              md: 12,
                              sm: 12,
                              xs: 12
                          }}>
                          <AttachmentField 
                          asset='assetWarranty'
                          previews={warrantyFiles.warrantyFilePreviews}
                          setPreviews={setWarrantyFiles}
                          />
                          <Typography color='error'>
                          {formErrors.files === null ? '' : formErrors.files}
                          </Typography>
                      </Grid>
                      )}

              </Grid>
          </Grid>
          <Grid
              size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
              }}>
              <Grid container justifyContent='flex-end' spacing={2}>
                 { props.renewal && <> <Grid>
                      <Button
                          variant = 'contained'
                          color = 'error'
                          onClick = {() => props.handleClose()}
                      >
                          Cancel
                      </Button>
                  </Grid>

                  <Grid>
                      <Button
                          variant = 'contained'
                          color = 'primary'
                          onClick = {handleSubmit}
                      >
                          Submit
                      </Button>
                  </Grid>
                  </>}

                   {props.renewal === undefined && <Grid display="flex"  gap={2} mt={2}>
                      <Button
                          variant="contained"
                          color={!props?.form  ? "error" : "primary"}
                           onClick={props.handlePreviousOrCancel || props.handleClose}
                      >
                          {!props?.form ? "Cancel" : "Previous"}
                      </Button>

                      <Button onClick={handleSubmit} variant='contained'>
                        {(props?.tabItems?.findIndex((t) => t.id === props?.currentTabIndex) === (props?.tabItems?.length - 1))? 'Submit' : 'Next'}
                        </Button>

                  </Grid>}
              </Grid>
          </Grid>
      </Grid>
      </Box>
  );
}

const Reminder = (props)=>{
    
    return (
        <>
            <Grid
                size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                }}>
                                              <Grid container>
                                                <Grid
                                                    size={{
                                                        lg: 12,
                                                        md: 12,
                                                        sm: 12,
                                                        xs: 12
                                                    }}>
                                                                        <Typography>Send Reminders Through : </Typography>
                                                                        </Grid>
                                                
                                                  <Grid
                                                      size={{
                                                          lg: 3,
                                                          md: 4,
                                                          sm: 4,
                                                          xs: 12
                                                      }}>
                                                      <FormControlLabel 
                                                          control = {
                                                              <Checkbox 
                                                                  checked={Boolean(props.formData.email_notification)}
                                                                  onChange = {(e) => props.handleEmailSmsChange('email_notification', e.target.checked)}
                                                              />
                                                          }
                                                          label = 'EMAIL'
                                                          labelPlacement = 'end'
                                                      />
                                                      {/* {
                                                          formErrors.formData !== null &&  (
                                                              <FormHelperText sx={{ color : '#d32f2f' }}>
                                                                  EMAIL is Required!
                                                              </FormHelperText>
                                                          )
                                                      } */}
                                                  </Grid>
                      
                                                  <Grid
                                                      size={{
                                                          lg: 3,
                                                          md: 4,
                                                          sm: 4,
                                                          xs: 12
                                                      }}>
                                                      <FormControlLabel 
                                                          control = {
                                                              <Checkbox 
                                                                  checked={Boolean(props.formData.sms_notification)}
                                                                  onChange = {(e) => props.handleEmailSmsChange('sms_notification', e.target.checked)}
                                                              />
                                                          }
                                                          label = 'SMS'
                                                          labelPlacement = 'end'
                                                      />
                                                      {/* {
                                                          formErrors.sms_notification !== null && (
                                                              <FormHelperText sx={{ color : '#d32f2f' }}>
                                                                  SMS is Required!
                                                              </FormHelperText>
                                                          )
                                                      } */}
                                                  </Grid>
            
                                                  <Grid
                                                      size={{
                                                          lg: 3,
                                                          md: 4,
                                                          sm: 4,
                                                          xs: 12
                                                      }}>
                                                      <FormControlLabel 
                                                          control = {
                                                              <Checkbox 
                                                                  checked={Boolean(props.formData.whatsApp_notification)}
                                                                  onChange = {(e) => props.handleEmailSmsChange('whatsApp_notification', e.target.checked)}
                                                              />
                                                          }
                                                          label = 'Whatsapp'
                                                          labelPlacement = 'end'
                                                      />
                                                      {/* {
                                                          formErrors.whatsApp_notification !== null && (
                                                              <FormHelperText sx={{ color : '#d32f2f' }}>
                                                                  Whatsapp is Required!
                                                              </FormHelperText>
                                                          )
                                                      } */}
                                                  </Grid>
                                              </Grid>
                                          </Grid>
        </>
    );
}



RenewalsNewForm.propTypes = {
    type : PropTypes.string,
    data : PropTypes.object,
    assetNamePreview : PropTypes.object,
    handleSubmitClose : PropTypes.func,
    handleClose : PropTypes.func
}

export default RenewalsNewForm
