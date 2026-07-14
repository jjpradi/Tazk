import { DatePicker, DateTimePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import TabPanel from '@mui/lab/TabPanel';
import { Autocomplete, Button, Card, Checkbox, Divider, FormControl, FormControlLabel, Grid, Radio, RadioGroup, Tab, Tabs, TextField, Typography } from "@mui/material"
import React, { useContext, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { CreateAssetManagement, asstGeneralContactAction, getAssetCodeAction, getAssetFieldAction, getAssetGroupIdAction, getAssetTypeIdAction, getImageAction, getWarrantyByAssetAction, updateAssetAction, updateWarrantyAction } from "redux/actions/asset_actions"
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { getRenewalsLovAction } from "redux/actions/renewals_actions"
import { allListStockLocation } from "redux/actions/stock_Location_actions"
import { getEmpbasecompanyAction } from "redux/actions/attendance_actions"
import { listUserCreationAction } from "redux/actions/userCreation_actions"
import CreateNewButtonContext from "context/CreateNewButtonContext"
import { getsessionStorage } from "pages/common/login/cookies"
import moment from "moment"
import AttachmentField from "pages/common/Timesheet/Attachment"
import InsuranceForm from "pages/assets/Insurance/InsuranceForm"
import { getInsuranceByAssetAction, getInsuranceLovAction, updateInsuranceAction } from "redux/actions/insurance_actions"
import { CreateServiceDue, getServiceDueByAssetAction } from "redux/actions/serviceDue_actions"
import { createNewItem, getNewItemByAssetAction, updateNewItemAction } from "redux/actions/newItem_actions"
import AssetAttachment from "./AssetAttachment"
import { phoneValidation } from "components/regexFunction"
import { OpenalertActions } from "redux/actions/alert_actions"
import { requiredFieldsAlertMessage } from "utils/content"
import RenewalsNewForm from "pages/assets/Renewals/RenewalsNewForm"
import ServiceDueForm from "../ServiceDue/ServiceDueForm"
import NewItemForm from "../NewItem/NewItemForm"
import { CreateInsurance} from 'redux/actions/insurance_actions'
import { insertAssetwarrantyAction} from 'redux/actions/asset_actions'
import toMomentOrNull from "../../../utils/DateFixer"
import _ from 'lodash';

function AssetNewForm(props){

    const newDate = moment()
    const user = getsessionStorage();
    const dispatch = useDispatch()
    const{setModalTypeHandler, setLoaderStatusHandler} = useContext(CreateNewButtonContext)
    const {
        AssetReducers: {assetFields, getAssetGroup, getAssetType, getAssetCode, warrantyByAsset},
        stockLocationReducer: {allliststocklocation},
        UserCreationReducer: {createUser},
        attendanceReducer:{ get_empbasecompany },
        InsuranceReducers: {insuranceByAsset},
        ServiceDueReducers: {serviceDueByAsset},
        NewItemReducers: {newItemByAsset}
    } = useSelector((state) => state)
    const[assetTypeId, setAssetTypeId] = useState('All')
    const[assetGroupId, setAssetGroupId] = useState('All')
    const[formValues, setFormValues] = useState({})
    const[formBackup, setFormBackup] = useState(null)
    const[formErrors, setFormErrors] = useState({})
    const[requiredFields, setRequiredFields] = useState([])
    const[assetImages, setAssetImages] = useState([])
    const[assetImageKey, setAssetImageKey] = useState([])
    const[insuranceImageKey, setInsuranceImageKey] = useState([])
    const[warrantyImageKey, setWarrantyImageKey] = useState([])
    const[serviceDueImageKey, setServiceDueImageKey] = useState([])
    const[newItemImageKey, setNewItemImageKey] = useState([])
    const[isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => { (async () => {
        dispatch(allListStockLocation())
        dispatch(getEmpbasecompanyAction())
        dispatch(getAssetGroupIdAction())
        dispatch(getAssetTypeIdAction())
        dispatch(getAssetCodeAction(async (res) => {
            const assetCode = await res.assetCode
            // setAssetCode(assetCode)
        }));
        dispatch(listUserCreationAction())
        dispatch(getRenewalsLovAction())
        dispatch(asstGeneralContactAction())
        dispatch(getInsuranceLovAction())
        if (props.status === 'edit' && tabItems.length === 1) {
            dispatch(getImageAction({asset_id: props.assetData.asset_id}, async(res)=>{
              const response = await res[0].Image
              const imageKeys = JSON.parse(response)
              setAssetImageKey(imageKeys)
            }
          ))
          dispatch(getInsuranceByAssetAction(props.assetData.asset_id, async(res) => {
            const response = await res[0]?.imageKey
            setCheckValues((prev) => ({ ...prev, insurance: !!res?.length }))
            if(response){
                const imageKeys = JSON.parse(response)
                setInsuranceImageKey(imageKeys)
            }
          }))
          dispatch(getServiceDueByAssetAction(props.assetData.asset_id, async (res) => {
            const response = await res[0]?.imageKey
            setCheckValues((prev) => ({ ...prev, service_due: !!res?.length }))
            if(response) {
                const imageKeys = JSON.parse(response)
                setServiceDueImageKey(imageKeys)
            }
          }))
          dispatch(getWarrantyByAssetAction(props.assetData.asset_id, async(res) => {
            const response = await res[0]?.imageKey
            setCheckValues((prev) => ({ ...prev, warranty: !!res?.length }))
            if(response){
                const imageKeys = JSON.parse(response)
                setWarrantyImageKey(imageKeys)
            }
          }))
          dispatch(getNewItemByAssetAction(props.assetData.asset_id, async(res) => {
            setCheckValues((prev) => ({ ...prev, new_item: !!res?.length }))
            if(response) {
                const imageKeys = JSON.parse(response)
                setNewItemImageKey(imageKeys)
            }
          }))
        }
    })();
}, [])

    useEffect(() => { (async () => {
        await setFormBackup({...formValues})
        dispatch(getAssetFieldAction({assetType: assetTypeId}, setModalTypeHandler, setLoaderStatusHandler))
    })();
}, [assetTypeId])

    useEffect(()=>{ (async () => {
        const data = {
          groupId : formValues['Asset Group']?.asset_group_id
        }
        await setFormBackup({...formValues})
        dispatch(getAssetTypeIdAction(data))
      })();
},[assetGroupId])

      useEffect(() => {
        let errors = {...formErrors}

        if(formValues['Insurance Document']?.length > 1) {
            errors['Insurance Document'] = 'Only 1 Files are allowed!'
        }
        else {
            errors['Insurance Document'] = null
        }

        if(formValues['Warranty Document']?.length > 1) {
            errors['Warranty Document'] = 'Only 1 Files are allowed!'
        }
        else {
            errors['Warranty Document'] = null
        }

        if(formValues['ServiceDue Document']?.length > 1) {
            errors['ServiceDue Document'] = 'Only 1 Files are allowed!'
        }
        else {
            errors['ServiceDue Document'] = null
        }

        if(formValues['Image']?.length > 0) {
            errors['Image'] = null
        }

        setFormErrors(errors)
      }, [formValues])

    useEffect(() => {
        if(assetFields.length > 0){
            let assetFieldsObj = {}
            let assetFieldErrorObj = {}
            let requiredObj = []
            if(props.status === 'edit'){
                let assetType = getAssetType?.data?.find((e) => e.asset_type === props?.assetData['Asset Type'])
                let assetGroup = getAssetGroup?.data?.find((e) => e.asset_group === props?.assetData['Asset Group'])
                let assetOwner = createUser.find((e) => (e.last_name ? e.first_name + ' ' + e.last_name : e.first_name) === props?.assetData['Asset Owner'])
                let location = allliststocklocation.find((e) => e.location_name === props?.assetData['Location'])
                let assignedTo = props?.assetData?.['Assigned To']
                    ? (get_empbasecompany || []).find((e) => String(e?.full_name || '').toUpperCase() === String(props.assetData['Assigned To']).toUpperCase())
                    : null
                let image = Array.isArray(props?.assetData?.['Image'])
                    ? props.assetData['Image'].map((e) => e?.imageUrl).filter(Boolean)
                    : []
                setAssetImages(image)
                
                const assetField = assetFields.filter((field) => field.flag === 'asset')
                const insuranceField = assetFields.filter((field) => field.flag === 'insurance')
                const warrantyField = assetFields.filter((field) => field.flag === 'warranty')
                const serviceDueField = assetFields.filter((field) => field.flag === 'serviceDue')
                assetField.forEach((field) => {
                    assetFieldsObj[field.labelName] = field.labelName === 'Asset Type' ? assetType
                                                        : field.labelName === 'Asset Group' ? assetGroup
                                                        : field.labelName === 'Asset Owner' ? assetOwner
                                                        : field.labelName === 'Assigned To' ? assignedTo
                                                        : field.labelName === 'Location' ? location
                                                        : field.labelName === 'Image' ? image
                                                        : props?.assetData[field.labelName] || null

                    if(field.labelName === 'Image'){
                        assetFieldsObj.assetImages = []
                    }

                    if(field.required === 1){
                        assetFieldErrorObj[field.labelName] = null
                        requiredObj.push(field.labelName)
                    }
                })
                insuranceField.forEach((field) => {
                    if(insuranceByAsset?.length > 0){
                        let image = Array.isArray(insuranceByAsset[0]?.image)
                            ? insuranceByAsset[0].image.map((img) => img?.imageUrl).filter(Boolean)
                            : []
                        assetFieldsObj[field.labelName] = field.labelName === 'Insurance Service Provider' ? insuranceByAsset[0].insurance_agent
                                                        : field.labelName === 'Insurance Provider Contact' ? insuranceByAsset[0].provider_contact
                                                        : field.labelName === 'Insurance Start Date' ? insuranceByAsset[0].start_date
                                                        : field.labelName === 'Insurance End Date' ? insuranceByAsset[0].end_date
                                                        : field.labelName === 'Insurance Document' ? image
                                                        : null
                        
                    }
                    else{
                        if(field.labelName === 'Insurance Document') {
                            assetFieldsObj.insuranceFiles = []
                        }
                        else {
                            assetFieldsObj[field.labelName] = null
                        }
                    }

                    if(field.required === 1){
                        assetFieldErrorObj[field.labelName] = null
                        requiredObj.push(field.labelName)
                    }
                })
                warrantyField.forEach((field) => {
                    if(warrantyByAsset?.length > 0){
                        // let image = warrantyByAsset?.image.map((img) => img.imageUrl)
                        assetFieldsObj[field.labelName] = field.labelName === 'Warranty Service Provider' ? warrantyByAsset[0].seller
                                                        : field.labelName === 'Warranty Provider Contact' ? warrantyByAsset[0].provider_contact
                                                        : field.labelName === 'Warranty Start Date' ? warrantyByAsset[0].fromDate_Time
                                                        : field.labelName === 'Warranty End Date' ? warrantyByAsset[0].toDate_Time
                                                        : field.labelName === 'Warranty Document' ? warrantyByAsset[0].image
                                                        : null
                    }
                    else{
                        if(field.labelName === 'Warranty Document') {
                            assetFieldsObj.warrantyFiles = []
                        }
                        else {
                            assetFieldsObj[field.labelName] = null
                        }
                    }

                    if(field.required === 1){
                        assetFieldErrorObj[field.labelName] = null
                        requiredObj.push(field.labelName)
                    }
                })
                serviceDueField.forEach((field) => {
                    if(serviceDueByAsset?.length > 0){
                        let image = Array.isArray(serviceDueByAsset[0]?.image)
                            ? serviceDueByAsset[0].image.map((img) => img?.imageUrl).filter(Boolean)
                            : []
                        assetFieldsObj[field.labelName] = field.labelName === 'ServiceDue Service Provider' ? serviceDueByAsset[0].service_provider
                                                        : field.labelName === 'ServiceDue Provider Contact' ? serviceDueByAsset[0].provider_contact
                                                        : field.labelName === 'Service Due Start Date' ? serviceDueByAsset[0].start_date
                                                        : field.labelName === 'Service Due End Date' ? serviceDueByAsset[0].end_date
                                                        : field.labelName === 'ServiceDue Document' ? image
                                                        : null
                    }
                    else{
                        if(field.labelName === 'ServiceDue Document') {
                            assetFieldsObj.serviceDueFiles = []
                        }
                        else {
                            assetFieldsObj[field.labelName] = null
                        }
                    }

                    if(field.required === 1){
                        assetFieldErrorObj[field.labelName] = null
                        requiredObj.push(field.labelName)
                    }
                })
            } 
            else if(formBackup !== null){
                requiredObj = requiredFields
                const formBackupKeys = Object.keys(formBackup)
                assetFields.forEach((field) => {
                    if(formBackupKeys.includes(field.labelName)){
                        if(field.labelName === 'Image'){
                            assetFieldsObj[field.labelName] = formBackup[field.labelName]
                            assetFieldsObj.assetImages = formBackup.assetImages
                        }
                        else if(field.labelName === 'Insurance Document') {
                            assetFieldsObj[field.labelName] = formBackup[field.labelName]
                            assetFieldsObj.insuranceFiles = formBackup.insuranceFiles
                        }
                        else if(field.labelName === 'Warranty Document') {
                            assetFieldsObj[field.labelName] = formBackup[field.labelName]
                            assetFieldsObj.warrantyFiles = formBackup.warrantyFiles
                        }
                        else if(field.labelName === 'ServiceDue Document') {
                            assetFieldsObj[field.labelName] = formBackup[field.labelName]
                            assetFieldsObj.serviceDueFiles = formBackup.serviceDueFiles
                        }
                        else{
                            assetFieldsObj[field.labelName] = formBackup[field.labelName]
                        }
                    }
                    else{
                        if(field.inputType !== 'AutoGenerated'){
                            assetFieldsObj[field.labelName] = field.inputType === 'List' ? (field.labelName === 'Asset Owner' ? createUser.find((e) => e.employee_id === user.employee_id) : field.defaultValue)
                                                                : field.inputType === 'Date' && field.defaultValue ? newDate
                                                                : field.inputType === 'Time' && field.defaultValue ? newDate
                                                                : field.inputType === 'Date & Time' && field.defaultValue ? newDate
                                                                : field.inputType === 'Checkbox' ? false
                                                                : field.inputType === 'Attachment' ? []
                                                                : field.defaultValue

                            if(field.required === 1){
                                assetFieldErrorObj[field.labelName] = null
                                requiredObj.push(field.labelName)
                            }
                        }
                    }
                })
            } 
            else{
                assetFields.forEach((field) => {
                    if(field.inputType !== 'AutoGenerated'){
                        assetFieldsObj[field.labelName] = field.inputType === 'List' ? field.labelName === 'Asset Owner' ? createUser.find((e) => e.employee_id === user.employee_id) : field.defaultValue
                                                            : field.inputType === 'Date' && field.defaultValue ? newDate
                                                            : field.inputType === 'Time' && field.defaultValue ? newDate
                                                            : field.inputType === 'Date & Time' && field.defaultValue ? newDate
                                                            : field.inputType === 'Checkbox' ? false
                                                            : field.inputType === 'Attachment' ? []
                                                            : field.defaultValue
                        
                        if(field.labelName === 'Image'){
                            assetFieldsObj.assetImages = []
                        }

                        if(field.labelName === 'Insurance Document') {
                            assetFieldsObj.insuranceFiles = []
                        }

                        if(field.labelName === 'Warranty Document') {
                            assetFieldsObj.warrantyFiles = []
                        }

                        if(field.labelName === 'ServiceDue Document') {
                            assetFieldsObj.serviceDueFiles = []
                        }

                        if(field.required === 1){
                            assetFieldErrorObj[field.labelName] = null
                            requiredObj.push(field.labelName)
                        }
                    }
                })
            }
            const assetFlagLabels = assetFields
                .filter((f) => f.flag === 'asset')
                .map((f) => f.labelName)
            const scopedRequired = requiredObj.filter((label) => assetFlagLabels.includes(label))

            setFormValues({...assetFieldsObj})
            setFormErrors({...assetFieldErrorObj})
            setRequiredFields([...scopedRequired])
        }
    } ,[assetFields, warrantyByAsset])

    const getAutoCompleteOptions = (labelName, options) => {
        switch(labelName){
            case 'Asset Type':
                return getAssetType?.data
            case 'Asset Group':
                return getAssetGroup?.data
            case 'Location':
                return allliststocklocation
            case 'Asset Owner':
                return createUser
            case 'Assigned To':
                return get_empbasecompany
            default:
                return options
        }
    }

    const getAutoCompleteOptionLabel = (labelName, option) => {
        switch(labelName){
            case 'Asset Type':
                return option.asset_type || ''
            case 'Asset Group':
                return option.asset_group || ''
            case 'Location':
                return option.location_name || ''
            case 'Asset Owner':
                return option.last_name ? option.first_name + " " + option.last_name : option.first_name || ''
            case 'Assigned To':
                return option.full_name || ''
            default:
                return option || ''
        }
    }

    const shouldDisableDates = (labelName, date) => {
        switch(labelName) {
            case 'Insurance Start Date' :
                return formValues['Insurance End Date'] && moment(date).isAfter(moment(formValues['Insurance End Date']), 'day')

            case 'Insurance End Date' :
                return formValues['Insurance Start Date'] && moment(date).isBefore(moment(formValues['Insurance Start Date']), 'day')

            case 'Warranty Start Date' :
                return formValues['Warranty End Date'] && moment(date).isAfter(moment(formValues['Warranty End Date']), 'day')

            case 'Warranty End Date' :
                return formValues['Warranty Start Date'] && moment(date).isBefore(moment(formValues['Warranty Start Date']), 'day')

            case 'Service Due Start Date' :
                return formValues['Service Due End Date'] && moment(date).isAfter(moment(formValues['Service Due End Date']), 'day')

            case 'Service Due End Date' :
                return formValues['Service Due Start Date'] && moment(date).isBefore(moment(formValues['Service Due Start Date']), 'day')

            default :
                return false
        }
    }

    const renderSection = (fields, title) => {
        return (
            <>
                {fields.map((field, index) => (
                    <React.Fragment key={index}>
                        {
                            (field.inputType === 'TextField' || field.inputType === 'Text Field') && field.isActive === 1 ? (
                                <>
                                <Grid
                                    size={{
                                        lg: 3,
                                        md: 4,
                                        sm: 4,
                                        xs: 4
                                    }}>
                                    <TextField 
                                        label={field.labelName}
                                        value={formValues[field.labelName] || ''}
                                        required={field.required === 1}
                                        variant='filled'
                                        onChange={(event) => handleChange(field.labelName, event.target.value, field.required)}
                                        type={field.variant}
                                        fullWidth
                                        error={formErrors[field.labelName] && formErrors[field.labelName] !== null ? true : false}
                                        helperText={formErrors[field.labelName] && formErrors[field.labelName] !== null ? formErrors[field.labelName] : ''}
                                    />
                                </Grid>
                                </>
                            )
        
                            : (field.inputType === 'Text Area' || field.inputType === 'TextArea') && field.isActive === 1 ? (
                                <>
                                <Grid
                                    size={{
                                        lg: field.labelName === 'Remarks' ? 6 : 3,
                                        md: field.labelName === 'Remarks' ? 6 : 4,
                                        sm: field.labelName === 'Remarks' ? 6 : 4,
                                        xs: field.labelName === 'Remarks' ? 6 : 4
                                    }}>
                                    <TextField 
                                        label={field.labelName}
                                        value={formValues[field.labelName] || ''}
                                        required={field.required === 1}
                                        variant='filled'
                                        onChange={(event) => handleChange(field.labelName, event.target.value, field.required)}
                                        multiline
                                        rows={2}
                                        fullWidth
                                        error={formErrors[field.labelName] && formErrors[field.labelName] !== null ? true : false}
                                        helperText={formErrors[field.labelName] && formErrors[field.labelName] !== null ? formErrors[field.labelName] : ''}
                                    />
                                </Grid>
                                </>
                            )
        
                            : field.inputType === 'List' && field.isActive === 1 ? (
                                <>
                                <Grid
                                    size={{
                                        lg: 3,
                                        md: 4,
                                        sm: 4,
                                        xs: 4
                                    }}>
                                    <Autocomplete
                                        options={getAutoCompleteOptions(field.labelName, field.options) || []}
                                        getOptionLabel={(option) => getAutoCompleteOptionLabel(field.labelName, option)}
                                        value={formValues[field.labelName] || null}
                                         isOptionEqualToValue={(option, value) => {
                                                if (!option || !value) return false;
                                                if (field.labelName === 'Asset Owner' || field.labelName === 'Assigned To') {
                                                    return option.employee_id === value.employee_id;
                                                }
                                                if (field.labelName === 'Asset Type') {
                                                    return option.asset_type_id === value.asset_type_id;
                                                }
                                                if (field.labelName === 'Asset Group') {
                                                    return option.asset_group_id === value.asset_group_id;
                                                }
                                                if (field.labelName === 'Location') {
                                                    return option.location_id === value.location_id;
                                                }
                                                return option === value;
                                                }}
                                        onChange={(event, value) => handleChange(field.labelName, value, field.required)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                required={field.required === 1}
                                                fullWidth
                                                label={field.labelName}
                                                variant='filled'
                                                error={formErrors[field.labelName] && formErrors[field.labelName] !== null ? true : false}
                                                helperText={formErrors[field.labelName] && formErrors[field.labelName] !== null ? formErrors[field.labelName] : ''}
                                            />
                                        )}
                                    />
                                </Grid>
                                </>
                            )
        
                            : field.inputType === 'Date' && field.isActive === 1 ? (
                                <>
                                <Grid
                                    size={{
                                        lg: 3,
                                        md: 4,
                                        sm: 4,
                                        xs: 4
                                    }}>
                                    <LocalizationProvider dateAdapter={DateAdapter}>
                                        <DatePicker
                                            label={field.labelName}
                                            value={toMomentOrNull(formValues[field.labelName])}
                                            onChange={(e) => {
                                                if(e?._d){
                                                    handleChange(field.labelName, moment(e._d).format(field.dateTimeFormat), field.required)
                                                }
                                                else{
                                                    handleChange(field.labelName, null, field.required)
                                                }
                                            }}
                                            shouldDisableDate = {(date) => shouldDisableDates(field.labelName, date)}
                                            slotProps={{ textField: { variant: 'filled', fullWidth: true, required: field.required === 1, error: formErrors[field.labelName] && formErrors[field.labelName] !== null ? true : false, helperText: formErrors[field.labelName] && formErrors[field.labelName] !== null ? formErrors[field.labelName] : '' } }}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                </>
                            )
        
                            : field.inputType === 'Time' && field.isActive === 1 ? (
                                <>
                                <Grid
                                    size={{
                                        lg: 3,
                                        md: 4,
                                        sm: 4,
                                        xs: 4
                                    }}>
                                    <LocalizationProvider dateAdapter={DateAdapter}>
                                        <TimePicker 
                                            label={field.labelName}
                                            value={formValues[field.labelName] ? moment(formValues[field.labelName]) : null}
                                            onChange={(e) => {
                                                if(e?._d){
                                                    handleChange(field.labelName, moment(e._d).format(field.dateTimeFormat), field.required)
                                                }
                                                else{
                                                    handleChange(field.labelName, null, field.required)
                                                }
                                            }}
                                            slotProps={{ textField: { variant: 'filled', fullWidth: true, required: field.required === 1, error: formErrors[field.labelName] && formErrors[field.labelName] !== null ? true : false, helperText: formErrors[field.labelName] && formErrors[field.labelName] !== null ? formErrors[field.labelName] : '' } }}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                </>
                            )
        
                            : field.inputType === 'Date & Time' && field.isActive === 1 ? (
                                <>
                                <Grid
                                    size={{
                                        lg: 3,
                                        md: 4,
                                        sm: 4,
                                        xs: 4
                                    }}>
                                    <LocalizationProvider dateAdapter={DateAdapter}>
                                        <DateTimePicker 
                                            label={field.labelName}
                                            format='DD/MM/YYYY hh:mm a'
                                            value={formValues[field.labelName] ? moment(formValues[field.labelName]) : null}
                                            onChange={(e) => {
                                                if(e?._d){
                                                    handleChange(field.labelName, moment(e._d).format('YYYY-MM-DD HH:mm'), field.required)
                                                }
                                                else{
                                                    handleChange(field.labelName, null, field.required)
                                                }
                                            }}
                                            slotProps={{ textField: { variant: 'filled', onKeyDown: (e) => e.preventDefault(), fullWidth: true, required: field.required === 1, error: formErrors[field.labelName] && formErrors[field.labelName] !== null ? true : false, helperText: formErrors[field.labelName] && formErrors[field.labelName] !== null ? formErrors[field.labelName] : '' } }}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                </>
                            )
        
                            : field.inputType === 'Radio' && field.isActive === 1 ? (
                                <>
                                <Grid
                                    size={{
                                        lg: 3,
                                        md: 4,
                                        sm: 4,
                                        xs: 4
                                    }}>
                                    <Grid container>
                                        <Grid
                                            size={{
                                                lg: 6,
                                                md: 6,
                                                sm: 6,
                                                xs: 6
                                            }}>
                                            <Typography>{field.labelName}</Typography>
                                        </Grid>
                                        <Grid
                                            size={{
                                                lg: 6,
                                                md: 6,
                                                sm: 6,
                                                xs: 6
                                            }}>
                                            <FormControl>
                                                <RadioGroup value={formValues[field.labelName] || ''} onChange={(event) => handleChange(field.labelName, event.target.value, field.required)}>
                                                    {
                                                        field.options.map((option, index) => (
                                                            <FormControlLabel 
                                                                key={index}
                                                                control={<Radio />}
                                                                label={option}
                                                            />
                                                        ))
                                                    }
                                                </RadioGroup>
                                            </FormControl>
                                        </Grid>
                                        <Grid
                                            size={{
                                                lg: 12,
                                                md: 12,
                                                sm: 12,
                                                xs: 12
                                            }}>   
                                            <Typography variant='caption' color='error'>{formErrors[field.labelName] && formErrors[field.labelName] !== null ? formErrors[field.labelName] : ''}</Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                </>
                            )
        
                            : field.inputType === 'CheckBox' && field.isActive === 1 ? (
                                <>
                                <Grid
                                    size={{
                                        lg: 3,
                                        md: 4,
                                        sm: 4,
                                        xs: 4
                                    }}>
                                    <FormControlLabel 
                                        control={<Checkbox
                                                    required={field.required === 1}
                                                    checked={Boolean(formValues[field.labelName])}
                                                    onChange={() => setFormValues({...formValues, [field.labelName]: !formValues[field.labelName]})}
                                                    error={formErrors[field.labelName] && formErrors[field.labelName] !== null ? true : false}
                                                    helperText={formErrors[field.labelName] && formErrors[field.labelName] !== null ? formErrors[field.labelName] : ''}
                                                />}
                                        label={field.labelName}
                                    />
                                </Grid>
                                </>
                            )
        
                            : field.inputType === 'Attachment' && field.isActive === 1 ? (
                                <>
                                {
                                    field.flag === 'asset' ?
                                        <Grid
                                            size={{
                                                lg: 12,
                                                md: 12,
                                                sm: 12,
                                                xs: 12
                                            }}> 
                                            <AssetAttachment 
                                                asset={title}
                                                previews={formValues[field.labelName]}
                                                setPreviews={setFormValues}
                                                handleImageDelete={handleImageDelete}
                                                required={field.required === 1}
                                                data = {assetImageKey}
                                                type = {props.status == 'edit' ? 'Edit Asset' : 'Asset Creation'}
                                            />
                                            <Typography variant='caption' color='error'>{formErrors[field.labelName] && formErrors[field.labelName] !== null ? formErrors[field.labelName] : ''}</Typography>
                                        </Grid> : 

                                        <Grid
                                            size={{
                                                lg: 12,
                                                md: 12,
                                                sm: 12,
                                                xs: 12
                                            }}>
                                            <AttachmentField 
                                                asset={title}
                                                previews={formValues[field.labelName]}
                                                setPreviews={setFormValues}
                                                handleImageDelete={handleImageDelete}
                                                required={field.required === 1}
                                            />
                                            <Typography variant='caption' color='error'>{formErrors[field.labelName] && formErrors[field.labelName] !== null ? formErrors[field.labelName] : ''}</Typography>
                                        </Grid>
                                }
                                </>
                            )
                            
                            : null
                        }
                    </React.Fragment>
                ))}
            </>
        );
    };


    const handleChange = (name, value, required) => {
        if(name === 'Assigned To'){
            setFormValues((prev) => ({
                ...prev, 
                [name]: value !== null && value !== '' ? value : null,
                Status: value !== null && value !== '' ? 'Assigned' : 'Available'
            }))
        } 
        else if (name === 'Asset Group') {
                                    setAssetGroupId(value?.asset_group_id || 'All');
                                    setAssetTypeId('All');
                                    setFormBackup(null);
                                    setFormErrors({});

                                    const resetValues = {};

                                    assetFields.forEach((field) => {
                                        if (field.inputType === 'AutoGenerated') return;

                                        if (field.labelName === 'Asset Group') {
                                        resetValues[field.labelName] = value || null;
                                        return;
                                        }

                                        resetValues[field.labelName] =
                                        field.inputType === 'Checkbox' ? false :
                                        field.inputType === 'Attachment' ? [] :
                                        null;
                                    });

                                    resetValues.assetImages = [];
                                    resetValues.insuranceFiles = [];
                                    resetValues.warrantyFiles = [];
                                    resetValues.serviceDueFiles = [];

                                    setFormValues(resetValues);
                                    return;
                                    }

        else if(required === 1){
            if(value !== null && value !== ''){
                if(name === 'Asset Type'){
                    setAssetTypeId(value.asset_type_id)
                }
                if(name === 'Asset Group'){
                    setAssetGroupId(value.asset_group_id)
                }
                setFormValues((prev) => ({...prev, [name]: value}))
                setFormErrors({...formErrors, [name]: null})
            } else{
                if(name === 'Asset Type'){
                    setAssetTypeId('All')
                }
                setFormValues((prev) => ({...prev, [name]: null}))
                setFormErrors({...formErrors, [name]: `${name} is Required`})
            }
        }
        else if (name === 'Insurance Provider Contact' && (value === null || value === '' || !phoneValidation(value))) {
            setFormValues((prev) => ({...prev, [name] : value}))
            setFormErrors((prev) => ({...prev, [name] : 'Provider Contact is Invalid!'}))
        } 
        else if (name === 'Warranty Provider Contact' && (value === null || value === '' || !phoneValidation(value))) {
            setFormValues((prev) => ({...prev, [name] : value}))
            setFormErrors((prev) => ({...prev, [name] : 'Provider Contact is Invalid!'}))
        }
        else if (name === 'ServiceDue Provider Contact' && (value === null || value === '' || !phoneValidation(value))) {
            setFormValues((prev) => ({...prev, [name] : value}))
            setFormErrors((prev) => ({...prev, [name] : 'Provider Contact is Invalid!'}))
        }
        else{
            setFormValues((prev) => ({...prev, [name]: value}))
            setFormErrors({...formErrors, [name]: null})
        }
    }

    const handleImageDelete = (index, type) => {
        if (props.assetData) {
            if(type === 'Asset'){
                const updatedImages = [...formValues.Image];
                updatedImages.splice(index, 1);
                setFormValues((prev) => ({...prev, Image: updatedImages}));
        
                const updatedImageKeys = [...assetImageKey]
                updatedImageKeys.splice(index, 1)
                setAssetImageKey(updatedImageKeys)
            }
            else if(type === 'Insurance') {
                const updatedImages = [...formValues['Insurance Document']]
                updatedImages.splice(index, 1);
                setFormValues((prev) => ({...prev, ['Insurance Document']: updatedImages}))

                const updatedImageKeys = [...insuranceImageKey]
                updatedImageKeys.splice(index, 1)
                setInsuranceImageKey(updatedImageKeys)
            }
            else if(type === 'Warranty') {
                const updatedImages = [...formValues['Warranty Document']]
                updatedImages.splice(index, 1);
                setFormValues((prev) => ({...prev, ['Warranty Document']: updatedImages}))

                const updatedImageKeys = [...warrantyImageKey]
                updatedImageKeys.splice(index, 1)
                setWarrantyImageKey(updatedImageKeys)
            }
            else if(type === 'Service Due'){
                const updatedImages = [...formValues['ServiceDue Document']]
                updatedImages.splice(index, 1);
                setFormValues((prev) => ({...prev, ['ServiceDue Document']: updatedImages}))

                const updatedImageKeys = [...serviceDueImageKey]
                updatedImageKeys.splice(index, 1)
                setServiceDueImageKey(updatedImageKeys)
            }
            else if(type === 'New Item'){
                const updatedImages = [...formValues['NewItem Document']]
                updatedImages.splice(index, 1);
                setFormValues((prev) => ({...prev, ['NewItem Document']: updatedImages}))

                const updatedImageKeys = [...newItemImageKey]
                updatedImageKeys.splice(index,1)
                setNewItemImageKey(updatedImageKeys)
            }
        }
      };


const [formStore, setFormStore] = useState({
  asset: null,
  insurance: null,
  warranty: null,
  service_due: null,
  new_item: null
});

const [final,setFinal] = useState(false)



      
const [checkValues,setCheckValues] = useState({
    insurance : null,
    warranty : null,
    service_due : null,
    new_item : null
})


const handleCheck=(name,value)=>{
    setCheckValues({...checkValues,[name] : value})
}


const tabItems = [
    { id :  0 ,key: "asset", label: "Asset", visible: true },
    { id :  1 ,key: "insurance", label: "Insurance", visible: checkValues.insurance },
    { id :  2 ,key: "warranty", label: "Warranty", visible: checkValues.warranty },
    { id :  3 ,key: "service_due", label: "Service Due", visible: checkValues.service_due },
    { id :  4 ,key: "new_item", label: "New Item", visible: checkValues.new_item }
].filter(item => item.visible); // Only visible tabs

const [currentTabIndex, setCurrentTabIndex] = useState(tabItems[0]?.id);
let renewalsFile = []

const assetPreviewForRenewals = {
  asset_id: props?.status === 'edit' ? props?.assetData?.asset_id : null,
  Name: formValues?.['Name'] || '',
  Code: props?.status === 'edit' ? formValues?.['Code'] : getAssetCode?.assetCode || '',
  'Asset Group': formValues?.['Asset Group']?.asset_group || '',
  'Asset Type': formValues?.['Asset Type']?.asset_type || '',
  Location: formValues?.['Location']?.location_name || '',
  'Asset Owner': formValues?.['Asset Owner']
    ? `${formValues?.['Asset Owner']?.first_name || ''}${formValues?.['Asset Owner']?.last_name ? ` ${formValues?.['Asset Owner']?.last_name}` : ''}`.trim()
    : '',
  'Assigned To': formValues?.['Assigned To']?.full_name
    || (formValues?.['Assigned To']?.first_name
        ? `${formValues['Assigned To'].first_name}${formValues['Assigned To'].last_name ? ' ' + formValues['Assigned To'].last_name : ''}`.trim()
        : ''),
}

const handleNext = (values,files) => {
  const currentIndex = tabItems.findIndex(t => t.id === currentTabIndex);
  const currentItem = tabItems[currentIndex];
    renewalsFile = files
  setFormStore(prev => ({
    ...prev,
    [currentItem.key]: values
  }));


  if (currentIndex === tabItems.length - 1) {
    setFinal(true);
  } else {
    setCurrentTabIndex(tabItems[currentIndex + 1].id);
  }
};

const handlePreviousOrCancel = () => {
  const currentIndex = tabItems.findIndex(t => t.id === currentTabIndex);

  if (currentIndex === 0) {
    props.handleFormClose(null); // Cancel
    return;
  }

  const prevItem = tabItems[currentIndex - 1];
  setCurrentTabIndex(prevItem.id);
};

    const handleSubmit = async(event) => {
        event.preventDefault()

        if(isSubmitting) return

        setIsSubmitting(true)
        let isValid = true
        let formErrorObj = {...formErrors}

        const assetTabLabels = assetFields
            .filter((f) => f.flag === 'asset')
            .map((f) => f.labelName)

        Object.keys(formValues).forEach((key) => {
            if (!assetTabLabels.includes(key)) return

            if(requiredFields.includes(key) && (formValues[key] === null || formValues[key] === 'null' || formValues[key] === '')){
                isValid = false
                formErrorObj[key] = `${key} is Required`
            }
            else if(key === 'Insurance Provider Contact' && (formValues[key] !== null && formValues[key] !== 'null' && formValues[key] !== '') && !phoneValidation(formValues[key])) {
                isValid = false
                formErrorObj[key] = 'Provider Contact is Invalid!'
            }
            else if(key === 'Warranty Provider Contact' && (formValues[key] !== null && formValues[key] !== 'null' && formValues[key] !== '') && !phoneValidation(formValues[key])) {
                isValid = false
                formErrorObj[key] = 'Provider Contact is Invalid!'
            }
            else if(key === 'ServiceDue Provider Contact' && (formValues[key] !== null && formValues[key] !== 'null' && formValues[key] !== '') && !phoneValidation(formValues[key])) {
                isValid = false
                formErrorObj[key] = 'Provider Contact is Invalid!'
            }
            const len = formValues[key]?.length ?? 0
            if(key === 'Image'){
                if(len === 0){
                    isValid = false
                    formErrorObj[key] = `${key} is Required`
                } else if(len > 6){
                    isValid = false
                    formErrorObj[key] = `You can upload up to 6 Images`
                } else {
                    formErrorObj[key] = null
                }
            }
        })
        setFormErrors(formErrorObj)
        if(isValid){
            let payload = {}
            const formData = new FormData()
            assetFields.forEach((field) => {
                if(field.labelName === 'Code'){
                    const code = props?.status === 'edit' ? formValues['Code'] : getAssetCode.assetCode
                    formData.append(field.labelName, code)
                } 
                else if(field.labelName === 'Asset Group'){
                    formData.append(field.labelName, formValues[field.labelName].asset_group_id)
                } 
                else if(field.labelName === 'Asset Type'){
                    formData.append(field.labelName, formValues[field.labelName]?.asset_type_id)
                } 
                else if(field.labelName === 'Asset Owner'){
                    formData.append(field.labelName, formValues[field.labelName].employee_id)
                } 
                else if(field.labelName === 'Location'){
                    formData.append(field.labelName, formValues[field.labelName].location_id)
                } 
                else if(field.labelName === 'Assigned To' && formValues[field.labelName] !== null){
                    formData.append(field.labelName, formValues[field.labelName]?.employee_id || null)
                }
                else if(field.inputType === 'Attachment'){
                    if(field.labelName === 'Image'){
                        let images = []
                        formValues.assetImages.map((img) => {
                            formData.append('assetImages', img)
                            images.push({
                                fileName: img.name,
                                type: img.type
                            })
                        })
                        formData.append(field.labelName, JSON.stringify(images))
                    }
                    else if(field.labelName === 'Insurance Document') {
                        let insuranceFile = []
                        if(formValues?.insuranceFiles?.length > 0) {
                            formValues.insuranceFiles.map((files) => {
                                formData.append('insuranceFiles', files)
                                insuranceFile.push({
                                    fileName : files.name,
                                    type : files.type
                                })
                            })
                            formData.append(field.labelName, JSON.stringify(insuranceFile))
                        }
                        else {
                            formData.append(field.labelName, JSON.stringify(insuranceFile))
                        }
                    }
                    else if(field.labelName === 'Warranty Document') {
                        let warrantyFile = []
                        if(formValues?.warrantyFiles?.length > 0) {
                            formValues.warrantyFiles.map((files) => {
                                formData.append('warrantyFiles', files)
                                warrantyFile.push({
                                    fileName : files.name,
                                    type : files.type
                                })
                            })
                            formData.append(field.labelName, JSON.stringify(warrantyFile))
                        }
                        else {
                            formData.append(field.labelName, JSON.stringify(warrantyFile))
                        }
                    }
                    else if(field.labelName === 'ServiceDue Document') {
                        let serviceDueFile = []
                        if(formValues?.serviceDueFiles?.length > 0) {
                            formValues.serviceDueFiles.map((files) => {
                                formData.append('serviceDueFiles', files)
                                serviceDueFile.push({
                                    fileName : files.name,
                                    type : files.type
                                })
                            })
                            formData.append(field.labelName, JSON.stringify(serviceDueFile))
                        }
                        else {
                            formData.append(field.labelName, JSON.stringify(serviceDueFile))
                        }
                    }
                    else{
                        formData.append(field.labelName, formValues[field.labelName] ? JSON.stringify(formValues[field.labelName]) : [])
                    }
                }
                else{
                    formData.append(field.labelName, formValues[field?.labelName] || null)
                }
            })
            try {
                if(props.status === 'edit'){
                    if (tabItems.length > 1) {
                        handleNext(formValues);
                        return;
                    }
                    let timeline_message = []
                    assetFields.forEach((field) => {
                        if(field.flag === 'asset'){
                            if(field.labelName === 'Asset Type'){
                                let oldAssetType = props.assetData[field.labelName]
                                let newAssetType = formValues[field.labelName]?.asset_type
                                if(oldAssetType !== newAssetType){
                                    let message = `${field.labelName} changed from ${oldAssetType} to ${newAssetType}`
                                    timeline_message.push(message)
                                }
                            }
                            else if(field.labelName === 'Asset Group'){
                                let oldAssetGroup = props.assetData[field.labelName]
                                let newAssetGroup = formValues[field.labelName]?.asset_group
                                if(oldAssetGroup !== newAssetGroup){
                                    let message = `${field.labelName} changed from ${oldAssetGroup} to ${newAssetGroup}`
                                    timeline_message.push(message)
                                }
                            }
                            else if(field.labelName === 'Asset Owner'){
                                const owner = formValues[field.labelName]
                                const oldAssetOwner = (props.assetData[field.labelName] || '').trim()
                                const first = (owner?.first_name || '').trim()
                                const last = (owner?.last_name || '').trim()
                                const newAssetOwner = last ? `${first} ${last}` : first

                                const ownerChanged = owner
                                    ? oldAssetOwner.toLowerCase() !== newAssetOwner.toLowerCase()
                                    : false

                                if(ownerChanged){
                                    let message = `${field.labelName} changed from ${oldAssetOwner || 'NIL'} to ${newAssetOwner || 'NIL'}`
                                    timeline_message.push(message)
                                }
                            }
                            else if(field.labelName === 'Assigned To'){
                                let oldAssignedTo = props.assetData[field.labelName]
                                let newAssignedTo = formValues[field.labelName]?.full_name || null
                                if(oldAssignedTo !== newAssignedTo){
                                    let message = `${field.labelName} changed from ${oldAssignedTo || 'NIL'} to ${newAssignedTo || 'NIL'}`
                                    timeline_message.push(message)
                                }
                            }
                            else if(field.labelName === 'Location'){
                                let oldLocation = props.assetData[field.labelName]
                                let newLocation = formValues[field.labelName]?.location_name
                                if(oldLocation !== newLocation){
                                    let message = `${field.labelName} changed from ${oldLocation} to ${newLocation}`
                                    timeline_message.push(message)
                                }
                            }
                            else if(field.labelName === 'Image'){
                                if(formValues[field.labelName] !== assetImages){
                                    let message = `Image Updated`
                                    timeline_message.push(message)
                                }
                            }
                            else{
                                if(formValues[field.labelName] !== props?.assetData[field.labelName]){
                                    let message = `${field.labelName} changed from ${props?.assetData[field.labelName] || 'NIL'} to ${formValues[field.labelName] || 'NIL'}`
                                    timeline_message.push(message)
                                }
                            }
                        }
                    })
                    formData.append("asset_id", props?.assetData.asset_id)
                    formData.append("imageKey", JSON.stringify(assetImageKey))
                    formData.append("insuranceImageKey", JSON.stringify(insuranceImageKey))
                    formData.append("warrantyImageKey", JSON.stringify(warrantyImageKey))
                    formData.append("serviceDueImageKey", JSON.stringify(serviceDueImageKey))
                    formData.append("timelineMessage", JSON.stringify(timeline_message))
                    await dispatch(updateAssetAction(formData))
                    props.handleDetailClose()
                }
                else{
                    handleNext(formValues)
                }
            }
            catch(err) {
                setIsSubmitting(false)
            }
            finally {
                setIsSubmitting(false)
            }
        }
        else {
            setIsSubmitting(false)
            dispatch(OpenalertActions({ msg : requiredFieldsAlertMessage, severity : 'warning' }))
        }
    }
    const assetCreationFields = assetFields.filter(field => field.flag === 'asset' && field.isActive === 1)
    const insuranceFields = assetFields.filter(field => field.flag === 'insurance' && field.isActive === 1);
    const warrantyFields = assetFields.filter(field => field.flag === 'warranty' && field.isActive === 1);
    const serviceDueFields = assetFields.filter(field => field.flag === 'serviceDue' && field.isActive === 1);


useEffect(() => { (async () => {
  const submit = async() => {
    if (!final) return;

    const formData = new FormData();
    let assetCreate = {}

     assetFields.forEach((field) => {
                                    if(field.labelName === 'Code'){
                                        const code = props?.status === 'edit' ? formValues['Code'] : getAssetCode.assetCode
                                        formData.append(field.labelName, code)
                                    } 
                                    else if(field.labelName === 'Asset Group'){
                                        formData.append(field.labelName, formValues[field.labelName].asset_group_id)
                                    } 
                                    else if(field.labelName === 'Asset Type'){
                                        formData.append(field.labelName, formValues[field.labelName]?.asset_type_id)
                                    } 
                                    else if(field.labelName === 'Asset Owner'){
                                        formData.append(field.labelName, formValues[field.labelName].employee_id)
                                    } 
                                    else if(field.labelName === 'Location'){
                                        formData.append(field.labelName, formValues[field.labelName].location_id)
                                    } 
                                    else if(field.labelName === 'Assigned To' && formValues[field.labelName] !== null){
                                        formData.append(field.labelName, formValues[field.labelName]?.employee_id || null)
                                    }
                                    else if(field.inputType === 'Attachment'){
                                        if(field.labelName === 'Image'){
                                            let images = []
                                            formValues.assetImages.map((img) => {
                                                formData.append('assetImages', img)
                                                images.push({
                                                    fileName: img.name,
                                                    type: img.type
                                                })
                                            })
                                            formData.append(field.labelName, JSON.stringify(images))
                                        }
                                        else if(field.labelName === 'Insurance Document') {
                                            let insuranceFile = []
                                            if(formValues?.insuranceFiles?.length > 0) {
                                                formValues.insuranceFiles.map((files) => {
                                                    formData.append('insuranceFiles', files)
                                                    insuranceFile.push({
                                                        fileName : files.name,
                                                        type : files.type
                                                    })
                                                })
                                                formData.append(field.labelName, JSON.stringify(insuranceFile))
                                            }
                                            else {
                                                formData.append(field.labelName, JSON.stringify(insuranceFile))
                                            }
                                        }
                                        else if(field.labelName === 'Warranty Document') {
                                            let warrantyFile = []
                                            if(formValues?.warrantyFiles?.length > 0) {
                                                formValues.warrantyFiles.map((files) => {
                                                    formData.append('warrantyFiles', files)
                                                    warrantyFile.push({
                                                        fileName : files.name,
                                                        type : files.type
                                                    })
                                                })
                                                formData.append(field.labelName, JSON.stringify(warrantyFile))
                                            }
                                            else {
                                                formData.append(field.labelName, JSON.stringify(warrantyFile))
                                            }
                                        }
                                        else if(field.labelName === 'ServiceDue Document') {
                                            let serviceDueFile = []
                                            if(formValues?.serviceDueFiles?.length > 0) {
                                                formValues.serviceDueFiles.map((files) => {
                                                    formData.append('serviceDueFiles', files)
                                                    serviceDueFile.push({
                                                        fileName : files.name,
                                                        type : files.type
                                                    })
                                                })
                                                formData.append(field.labelName, JSON.stringify(serviceDueFile))
                                            }
                                            else {
                                                formData.append(field.labelName, JSON.stringify(serviceDueFile))
                                            }
                                        }
                                        else{
                                            formData.append(field.labelName, formValues[field.labelName] ? JSON.stringify(formValues[field.labelName]) : [])
                                        }
                                    }
                                    else{
                                        formData.append(field.labelName, formValues[field?.labelName] || null)
                                    }
                                })

    if(props.status === 'edit'){
                    let timeline_message = []
                    assetFields.forEach((field) => {
                        if(field.flag === 'asset'){
                            if(field.labelName === 'Asset Type'){
                                let oldAssetType = props.assetData[field.labelName]
                                let newAssetType = formValues[field.labelName]?.asset_type
                                if(oldAssetType !== newAssetType){
                                    timeline_message.push(`${field.labelName} changed from ${oldAssetType} to ${newAssetType}`)
                                }
                            }
                            else if(field.labelName === 'Asset Group'){
                                let oldAssetGroup = props.assetData[field.labelName]
                                let newAssetGroup = formValues[field.labelName]?.asset_group
                                if(oldAssetGroup !== newAssetGroup){
                                    timeline_message.push(`${field.labelName} changed from ${oldAssetGroup} to ${newAssetGroup}`)
                                }
                            }
                            else if(field.labelName === 'Asset Owner'){
                                const owner = formValues[field.labelName]
                                const oldAssetOwner = (props.assetData[field.labelName] || '').trim()
                                const first = (owner?.first_name || '').trim()
                                const last = (owner?.last_name || '').trim()
                                const newAssetOwner = last ? `${first} ${last}` : first
                                const ownerChanged = owner
                                    ? oldAssetOwner.toLowerCase() !== newAssetOwner.toLowerCase()
                                    : false
                                if(ownerChanged){
                                    timeline_message.push(`${field.labelName} changed from ${oldAssetOwner || 'NIL'} to ${newAssetOwner || 'NIL'}`)
                                }
                            }
                            else if(field.labelName === 'Assigned To'){
                                let oldAssignedTo = props.assetData[field.labelName]
                                let newAssignedTo = formValues[field.labelName]?.full_name || null
                                if(oldAssignedTo !== newAssignedTo){
                                    timeline_message.push(`${field.labelName} changed from ${oldAssignedTo || 'NIL'} to ${newAssignedTo || 'NIL'}`)
                                }
                            }
                            else if(field.labelName === 'Location'){
                                let oldLocation = props.assetData[field.labelName]
                                let newLocation = formValues[field.labelName]?.location_name
                                if(oldLocation !== newLocation){
                                    timeline_message.push(`${field.labelName} changed from ${oldLocation} to ${newLocation}`)
                                }
                            }
                            else if(field.labelName === 'Image'){
                                if(formValues[field.labelName] !== assetImages){
                                    timeline_message.push(`Image Updated`)
                                }
                            }
                            else{
                                if(formValues[field.labelName] !== props?.assetData[field.labelName]){
                                    timeline_message.push(`${field.labelName} changed from ${props?.assetData[field.labelName] || 'NIL'} to ${formValues[field.labelName] || 'NIL'}`)
                                }
                            }
                        }
                    })
                    formData.append("asset_id", props?.assetData.asset_id)
                    formData.append("imageKey", JSON.stringify(assetImageKey))
                    formData.append("insuranceImageKey", JSON.stringify(insuranceImageKey))
                    formData.append("warrantyImageKey", JSON.stringify(warrantyImageKey))
                    formData.append("serviceDueImageKey", JSON.stringify(serviceDueImageKey))
                    formData.append("timelineMessage", JSON.stringify(timeline_message))
                    await dispatch(updateAssetAction(formData))
                }
                else{
                    await dispatch(CreateAssetManagement(formData, (response) => {
                        assetCreate = response?.data || {}
                    }));
                }
    const assetValues = new FormData();


    if (formStore.insurance){

        let insuranceValues = new FormData();

            insuranceValues.append('renewal_type', formStore.insurance.renewalType.type_id)
                insuranceValues.append('asset_id', props.status === 'edit' ? null : assetCreate.asset_id)
                insuranceValues.append('asset_type_id', formValues['Asset Type']?.asset_type_id)
                insuranceValues.append('asset_group_id',formValues['Asset Group']?.asset_group_id)
                // insuranceValues.append('insurance_agent', formStore.insurance.serviceProvider)
                insuranceValues.append('policy_no', formStore.insurance.policyNo)
                insuranceValues.append('sum_insured', formStore.insurance.sumInsured)
                insuranceValues.append('annual_premium', formStore.insurance.annualPremium)
                insuranceValues.append('frequency', formStore.insurance.frequency ? formStore.insurance.frequency.id : null)
                insuranceValues.append('deductible', formStore.insurance.deductible)
                insuranceValues.append('start_date', formStore.insurance.startDate)
                insuranceValues.append('end_date', formStore.insurance.endDate)
                insuranceValues.append('insurance_agent', formStore.insurance?.agent?.id ? formStore.insurance.agent.id : (formStore.insurance?.agent || ''))
                insuranceValues.append('provider_contact', formStore.insurance.providerContact)
                insuranceValues.append('renewal_reminder', JSON.stringify(formStore.insurance.reminder) )
                insuranceValues.append('notes', formStore.insurance.notes)
                insuranceValues.append('image', formStore.insurance.image)
                insuranceValues.append('properties', JSON.stringify(formStore.insurance.insuranceDynamicPropValues))
                insuranceValues.append('dynamic_fields', JSON.stringify(formStore.insurance.insuranceDynamicProp))
                insuranceValues.append('email_notification', formStore.insurance.email_notification ? 1 : 0 )
                insuranceValues.append('sms_notification', formStore.insurance.sms_notification ? 1 : 0 )
                insuranceValues.append('whatsApp_notification', formStore.insurance.whatsApp_notification ? 1 : 0 )
                insuranceValues.append('insurance_type', formStore.insurance.insurance_type?.id)
                insuranceValues.append('repeat', formStore.insurance.repeat ? 1 : 0 )
                insuranceValues.append('agentEmail', formStore.insurance.agentEmail  )
                insuranceValues.append('insuranceProvider', formStore.insurance.insuranceProvider   )
                insuranceValues.append('renewalsFiles', formStore.insurance.file)


                if(props?.status === 'edit' && formStore.insurance.insurance_id){
                    await dispatch(updateInsuranceAction(insuranceValues,formStore.insurance.insurance_id))
                }
                else{
                     await dispatch(CreateInsurance(insuranceValues));
                }

       
    } 
    if (formStore.warranty){
        let warrantyValues = new FormData();
                warrantyValues.append('renewal_type', formStore.warranty.renewalType.type_id)
                warrantyValues.append('asset_id', props.status === 'edit' ? props?.assetData?.asset_id : assetCreate.asset_id);
                warrantyValues.append('warrantyType', formStore.warranty.asset_warranty?.id || null)
                warrantyValues.append('warrantyServiceProvider', formStore.warranty.warrantyServiceProvider?.id ?  formStore.warranty.warrantyServiceProvider?.id : formStore.warranty.warrantyServiceProvider )
                warrantyValues.append('warrantyProviderContact', formStore.warranty.warrantyProviderContact )
                warrantyValues.append('warrantyProviderEmail', formStore.warranty.warranty_provider_email || null )
                warrantyValues.append('warranty_reminder',  JSON.stringify( formStore.warranty.reminder) || null)
                warrantyValues.append('warranty_seller', formStore.warranty.serviceProvider)
                // warrantyValues.append('provider_contact', formStore.warranty.providerContact)
                warrantyValues.append('warranty_fromDate_Time', formStore.warranty.warrantyStartDate)
                warrantyValues.append('warranty_toDate_Time', formStore.warranty.warrantyEndDate)
                warrantyValues.append('image', formStore.warranty.image)
                warrantyValues.append('frequency', formStore.warranty.frequency ? formStore.warranty.frequency.id : null)
                warrantyValues.append('notes', formStore.warranty.notes)
                warrantyValues.append('repeat', formStore.warranty.repeat)
                warrantyValues.append('email_notification', formStore.warranty.email_notification ? 1 : 0 )
                warrantyValues.append('sms_notification', formStore.warranty.sms_notification ? 1 : 0 )
                warrantyValues.append('whatsApp_notification', formStore.warranty.whatsApp_notification ? 1 : 0 )
                warrantyValues.append('warrantyStartDate', formStore.warranty.warrantyStartDate)
                warrantyValues.append('warrantyEndDate', formStore.warranty.warrantyEndDate)
                warrantyValues.append('assetgroup', formValues['Asset Group']?.asset_group_id)
                warrantyValues.append('assetType',formValues['Asset Type']?.asset_type_id)
                warrantyValues.append('title',formStore.warranty.title)
                warrantyValues.append('amount',formStore.warranty.amount)
                warrantyValues.append('warrantyFiles',formStore.warranty.file)
                warrantyValues.append('annual_premium',formStore.warranty.annualPremium)
                warrantyValues.append('policy_no',formStore.warranty.policyNo)
                if(props?.status === 'edit'&& formStore.warranty.warranty_id){
                     await dispatch(updateWarrantyAction(warrantyValues,formStore.warranty.warranty_id));
                }
                else{
                    await dispatch(insertAssetwarrantyAction(warrantyValues));
                }
    }
    if (formStore.service_due) {
        if(props.status === 'edit'){
            formStore.service_due.set('asset_id', props?.assetData.asset_id)
        }
        else if(assetCreate?.asset_id){
            formStore.service_due.set('asset_id', assetCreate.asset_id)
        }
        await dispatch(CreateServiceDue(formStore.service_due));
    }
    if (formStore.new_item) {
        const existingNewItemId = newItemByAsset?.[0]?.id
        if(props.status === 'edit' && existingNewItemId){
            formStore.new_item.set('asset_id', props?.assetData.asset_id)
            await dispatch(updateNewItemAction(formStore.new_item, existingNewItemId));
        }
        else {
            if(props.status === 'edit'){
                formStore.new_item.set('asset_id', props?.assetData.asset_id)
            }
            else if(assetCreate?.asset_id){
                formStore.new_item.set('asset_id', assetCreate.asset_id)
            }
            await dispatch(createNewItem(formStore.new_item));
        }
    }

    if(props.status === 'edit'){
        props?.handleDetailClose?.()
    } else {
        props?.handleFormClose?.()
    }
  };

  try {
    await submit();
  } catch (err) {
    setIsSubmitting(false)
    setFinal(false)
  }
})();
}, [final]);

function CustomTabPanel({ children, value, index }) {
  return (
    <Grid
      container
      spacing={3}
      role="tabpanel"
      hidden={value !== index}
      sx={{ width: "100%", m: 0 }}
    >
      {value === index && children}
    </Grid>
  );
}



    return (
        <Card sx={{ p: 5 ,    maxHeight: 'calc(100vh - 80px)',    overflowY: 'auto',
            }}>
            <Grid container spacing={2}>
                <Grid
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <Grid container display="flex" justifyContent="space-between">
                        <Grid display="flex" justifyContent="space-around" alignItems="center">
                            <Typography variant="h6" align="left" pl="5px">
                                {props.status === 'edit' ? 'Edit Asset' : 'Asset Creation'}
                            </Typography>
                            <Typography variant="h6" align="left" pl="5px">
                                {` | Code: ${props.status === 'edit' ? formValues['Code'] : getAssetCode.assetCode || ''} `}
                            </Typography>
                        </Grid>
                       
                    </Grid>
                </Grid>

                <Grid>
                    {/* <Grid container spacing={3}>
                        {assetCreationFields.length > 0 && renderSection(assetCreationFields, 'Asset')}
                        {insuranceFields.length > 0 && renderSection(insuranceFields, 'Insurance')}
                        {warrantyFields.length > 0 && renderSection(warrantyFields, 'Warranty')}
                        {serviceDueFields.length > 0 && renderSection(serviceDueFields, 'Service Due')}
                    </Grid> */}

                    <Grid container flexDirection={'column'} spacing={3}>

                    <Grid>
                        <Tabs value={currentTabIndex}>
                            {tabItems.map((item) => (
                                <Tab key={item.key} value={item.id} label={item.label} disabled={item.id !== currentTabIndex}/>
                            ))}
                        </Tabs>
                    </Grid>

                    <Grid size={12}>
                        
                        {currentTabIndex === 0 && 
                        <Grid container spacing={3}>
                            {
                                assetCreationFields.length > 0 &&
                                renderSection(assetCreationFields, "Asset")
                            }

                            </Grid>
                        }

                       
                          <div style={{ display: currentTabIndex === 1 ? 'block' : 'none' }}>
                            <RenewalsNewForm
                                form="Insurance"
                                type="create"
                                page = "asset"
                                Insurance = {true}
                                assetNamePreview={assetPreviewForRenewals}
                                isActive={currentTabIndex === 1}
                                handleClose={() => {}}
                                handleNext={handleNext}
                                tabItems={tabItems}
                                currentTabIndex={currentTabIndex}
                                handlePreviousOrCancel={handlePreviousOrCancel}
                                asset_id = {props.assetData?.asset_id || null}
                                insurance_id = {insuranceByAsset?.[0]?.insurance_id || insuranceByAsset?.[0]?.id || null}
                                assetGroup = {formValues['Asset Group']?.asset_group_id}
                                assetType = {formValues['Asset Type']?.asset_type_id}
                                status = {props.status}
                            />
                            </div>

                            <div style={{ display: currentTabIndex === 2 ? 'block' : 'none' }}>
                            <RenewalsNewForm
                                form="Warranty"
                                type="create"
                                page = "asset"
                                Warranty = {true}
                                assetNamePreview={assetPreviewForRenewals}
                                isActive={currentTabIndex === 2}
                                asset_id = {props.assetData?.asset_id || null}
                                warranty_id = {warrantyByAsset?.[0]?.warranty_id || warrantyByAsset?.[0]?.id || null}
                                handleClose={() => {}}
                                handleNext={handleNext}
                                tabItems={tabItems}
                                currentTabIndex={currentTabIndex}
                                handlePreviousOrCancel={handlePreviousOrCancel}
                                assetGroup = {formValues['Asset Group']?.asset_group_id}
                                assetType = {formValues['Asset Type']?.asset_type_id}
                                status = {props.status}
                            />
                            </div>

                            {checkValues.service_due && (
                                <div style={{ display: currentTabIndex === 3 ? 'block' : 'none' }}>
                                    <ServiceDueForm
                                    isActive={currentTabIndex === 3}
                                    handleClose={() => {}}
                                    type='service'
                                    form='service'
                                    page='asset'
                                    asset_id = {props.assetData?.asset_id || null}
                                    assetNamePreview={assetPreviewForRenewals}
                                    editData={props.status === 'edit' ? serviceDueByAsset?.[0] : null}
                                    handleNext={handleNext}
                                    tabItems={tabItems}
                                    currentTabIndex={currentTabIndex}
                                    handlePreviousOrCancel={handlePreviousOrCancel}
                                    assetGroup={formValues['Asset Group']?.asset_group_id}
                                    assetType={formValues['Asset Type']?.asset_type_id}
                                    />
                                    </div>
                                )}

                            {checkValues.new_item && (
                                <div style={{ display: currentTabIndex === 4 ? 'block' : 'none' }}>
                                    <NewItemForm
                                    isActive={currentTabIndex === 4}
                                    handleClose={() => {}}
                                    type='newItem'
                                    form='newItem'
                                    page='asset'
                                    asset_id = {props.assetData?.asset_id || null}
                                    assetNamePreview={assetPreviewForRenewals}
                                    editData={props.status === 'edit' ? newItemByAsset?.[0] : null}
                                    handleNext={handleNext}
                                    tabItems={tabItems}
                                    currentTabIndex={currentTabIndex}
                                    handlePreviousOrCancel={handlePreviousOrCancel}
                                    assetGroup={formValues['Asset Group']?.asset_group_id}
                                    assetType={formValues['Asset Type']?.asset_type_id}
                                    />
                                    </div>
                                )}



                        {/* <CustomTabPanel value={currentTabIndex} index={3}>
                        {serviceDueFields.length > 0 &&
                            renderSection(serviceDueFields, "Service Due")}
                        </CustomTabPanel> */}

                    </Grid>

                    </Grid>

                    </Grid>

                    <Grid
                        mt="10px"
                        display="flex"
                        alignItems="center"
                        justifyContent={currentTabIndex !== 0 ? "flex-end" : "space-between"}
                        size={{
                            lg: 12
                        }}>

                       { currentTabIndex === 0 && <Grid width={500} display="flex" flexDirection="column">
                            <FormControlLabel
                            control={
                                <Checkbox
                                checked={checkValues.insurance}
                                onChange={(e) => handleCheck("insurance", e.target.checked)}
                                />
                            }
                            label="Insurance"
                            />
                            <FormControlLabel
                            control={
                                <Checkbox
                                checked={checkValues.warranty}
                                onChange={(e) => handleCheck("warranty", e.target.checked)}
                                />
                            }
                            label="Warranty"
                            />
                            <FormControlLabel
                            control={
                                <Checkbox
                                checked={checkValues.service_due}
                                onChange={(e) => handleCheck("service_due", e.target.checked)}
                                />
                            }
                            label="Service Due"
                            />
                            <FormControlLabel
                            control={
                                <Checkbox
                                checked={checkValues.new_item}
                                onChange={(e) => handleCheck("new_item", e.target.checked)}
                                />
                            }
                            label="New Item"
                            />
                        </Grid>}
                            {
                            currentTabIndex === 0  &&
                                <Grid display="flex"  gap={2} mt={2}>
                                <Button
                                    variant="contained"
                                    color={currentTabIndex === 0 ? "error" : "primary"}
                                    onClick={handlePreviousOrCancel}
                                >
                                    {currentTabIndex === 0 ? "Cancel" : "Previous"}
                                </Button>

                                <Button onClick={handleSubmit} variant="contained">
                                    {currentTabIndex === tabItems.length - 1 ? "Submit" : "Next"}
                                </Button>
                                </Grid>
                            }
                    </Grid>


                        
                {/* </Grid> */}
            </Grid>
        </Card>
    );
}

export default AssetNewForm
