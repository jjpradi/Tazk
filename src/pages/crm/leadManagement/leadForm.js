import { DatePicker, DateTimePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { Autocomplete, Button, Card, Checkbox, Dialog, Divider, FormControl, FormControlLabel, Grid, IconButton, MenuItem, Radio, RadioGroup, TextField, Tooltip, Typography,Fade } from "@mui/material"
import CreateNewButtonContext from "context/CreateNewButtonContext"
import React, { useContext, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { additionalContactsAction, createLeadAction, getLeadManagementFieldsAction, getLeadManagementSourceAction, getLeadManagementStatusAction, updateLeadAction } from "redux/actions/leadManagement_actions"
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from "moment"
import AttachmentField from "pages/common/Timesheet/Attachment"
import { listUserCreationAction } from "redux/actions/userCreation_actions"
import { Cities } from "utils/cities"
import _ from "lodash"
import { Country } from "components/Country_list"
import { getLocationDataBasedOnPincode } from "components/common"
import PropTypes from "prop-types"
import { getsessionStorage } from "pages/common/login/cookies"
import NewSource from "./NewSource"
import { emailValidation, phoneValidation } from "components/regexFunction"
import SelectAccount from "./SelectAccount";
import { getActiveCampaignAction } from "redux/actions/campaign_actions";
import MaterialTable, { MTableToolbar}from "utils/SafeMaterialTable"
import CommonSearch from "utils/commonSearch"
import AddIcon from '@mui/icons-material/Add';
import AdditionalContacts from "./AdditionalContacts"
import {maxBodyHeight, headerStyle, cellStyle} from 'utils/pageSize';

import DeleteIcon from '@mui/icons-material/Delete'
import { OpenalertActions } from "redux/actions/alert_actions";
import { requiredFieldsAlertMessage } from "utils/content";
import crmConfigServices from "services/crm_config_services";
import toMomentOrNull from 'utils/DateFixer';


function LeadForm(props) {

    const { type, handleClose, data } = props

    const newDate = moment()
    const dispatch = useDispatch()
    const {setModalTypeHandler, setLoaderStatusHandler} = useContext(CreateNewButtonContext)
    const {
        leadManagementReducers: {leadManagementFields, leadManagementStatus, leadManagementSource, getAllAccounts,getAdditionalContacts},
        UserCreationReducer: {createUser},
        CampaignReducers: {activeCampaign}
    } = useSelector((state) => state)
    const storage = getsessionStorage()

    const[formValues, setFormValues] = useState({})
    const[formErrors, setFormErrors] = useState({})
    const[requiredFields, setRequiredFields] = useState([])
    const[addStatusOpen, setAddStatusOpen] = useState(false)
    const[selectAccountDialog, setSelectAccoutnDialog] = useState(false)
    const [addContact, setAddContact] = useState([])
    const [add,setAdd] = useState(false)
    const [formType, handleAddStatus] = useState('')
    const [err,setAccErr] = useState(false)
	    const[isSubmitting, setIsSubmitting] = useState(false)
	    const [customFields, setCustomFields] = useState([])
	    const [customValues, setCustomValues] = useState({})
	    const [customErrors, setCustomErrors] = useState({})
	    const [stageRules, setStageRules] = useState([])
	    const renderableFlags = new Set(['leads', 'accounts', 'primaryContact'])
	    const renderableInputTypes = new Set([
	        'TextField',
	        'Text Field',
	        'TextArea',
	        'List',
	        'Date',
	        'Time',
	        'Date & Time',
	        'Radio',
	        'Checkbox',
	        'Attachment',
	    ])

	    const isRenderableField = (field) =>
	        field?.isActive === 1 &&
	        renderableFlags.has(field?.flag) &&
	        renderableInputTypes.has(field?.inputType)
	    const isLeadStageField = (labelName) => labelName === 'Lead Status' || labelName === 'Lead Stage'
	    const getLeadStageValue = (record = {}) => record?.['Lead Stage'] || record?.['Lead Status'] || null
	    const getLabelDisplayName = (labelName) => isLeadStageField(labelName) ? 'Lead Stage' : labelName

	    useEffect(() => { (async () => {
	        await dispatch(listUserCreationAction())
	        await dispatch(getLeadManagementStatusAction())
        await dispatch(getActiveCampaignAction())
        await dispatch(getLeadManagementFieldsAction(setModalTypeHandler, setLoaderStatusHandler))
    })();
}, [])

	    useEffect(() => {
	        dispatch(getLeadManagementSourceAction())
	    }, [addStatusOpen])

	    useEffect(() => {
	        Promise.all([
	            crmConfigServices.listCustomFields('lead'),
	            crmConfigServices.listStageFieldRules('lead'),
	        ])
	            .then(([fieldsRes, rulesRes]) => {
	                setCustomFields(fieldsRes?.data?.items || [])
	                setStageRules(rulesRes?.data?.items || [])
	            })
	            .catch(() => {
	                setCustomFields([])
	                setStageRules([])
	            })
	    }, [])

	    useEffect(() => {
	        if(type !== 'edit' || !data?.lead_id) return
	        crmConfigServices.getEntityFieldValues('lead', data.lead_id)
	            .then((res) => setCustomValues(res?.data?.values || {}))
	            .catch(() => setCustomValues({}))
	    }, [type, data?.lead_id])

    useEffect(()=>{
        if(type == 'edit'){
            setAddContact(getAdditionalContacts[0])
        }
        else{
            setAddContact([])
        }
    },[getAdditionalContacts])

    const handleOpen = ()=>{
        setAdd(true)
    }

    // const addContactData =(data)=>{
    //     const newContact = { ...data, id: Date.now() };
    //     setAddContact((prevContacts) => [...prevContacts, newContact])
    // }
    const addContactData = (data) => {
        const newContact = { ...data, id: Date.now() };
        setAddContact((prevContacts) => Array.isArray(prevContacts) ? [...prevContacts, newContact] : [newContact]);
    };
    
    console.log(addContact,'addContact')
    const handleDeleteOpen = (rowData) => {
        setAddContact((prevContacts) => prevContacts.filter(contact => contact.id !== rowData.id));
    };

   console.log(getAdditionalContacts,'getAdditionalContacts')

    const columns = [
        
        {
          field: 'firstName',
          title: 'First Name'
        },
        {
          field: 'lastName',
          title: 'Last Name ',
          render :(rowData)=>{
            return rowData.lastName.length ? rowData.lastName : '-'
          }
        },
        {
          field: 'gender',
          title: 'Gender',
          render: (rowData) => {
            if(rowData.gender === 1){
                return "Male"
            }
            else if(rowData.gender === 2){
                return 'Female'
            }
            else{
                return 'Others'
            }
          }
        },
        {
          field: 'designation',
          title: 'Designation',
          render :(rowData)=>{
            return rowData.designation.length ? rowData.designation : '-'
          }
          
        },
        {
          field: 'email',
          title: 'Email'
        },
        {
          field: 'phoneNumber',
          title: 'Phone Number'
        }
        ,
        {
            title: 'Action',
          render:(rowData)=>(
            <>
                <Grid>
                    <Tooltip
                        title = 'Delete'
                        TransitionComponent={Fade}
                        TransitionProps={{timeout:600}}
                        placement='top'
                    />
                     <IconButton onClick={()=>{handleDeleteOpen(rowData)}} >
                       <DeleteIcon/>
                       </IconButton>
                </Grid>
            </>
          )
        }
      ];

    const isEmptyRequiredValue = (value) => {
        if (value === null || value === undefined) return true
        if (typeof value === 'string') return value.trim() === '' || value === 'null'
        if (Array.isArray(value)) return value.length === 0
        return false
    }

    useEffect(() => {
        const formValuesObj = {}
        const formErrorsObj = {}
        const requiredFieldsObj = []

        if(type === 'new'){
            leadManagementFields.forEach((field) => {
                switch(field.inputType){
                    case 'List':
                        if(field.labelName === 'Country'){
                            formValuesObj[field.labelName] = Country.find((e) => e.name === field.defaultValue)
                        } else if(field.labelName === 'Lead Owner'){
                            formValuesObj[field.labelName] = createUser.find((e) => {return e.employee_id === storage.employee_id})
                        } else{
                            formValuesObj[field.labelName] = field.defaultValue
                        }
                        break
                    case 'Checkbox':
                        formValuesObj[field.labelName] = false
                        break
                    case 'Attachment':
                        formValuesObj[field.labelName] = []
                        break
                    case 'Date':
                    case 'Time':
                    case 'Date & Time':
                        formValuesObj[field.labelName] = newDate
                        break
                    default:
                        formValuesObj[field.labelName] = field.defaultValue
                        break
                }
    
                if(field.required === 1 && isRenderableField(field)){
                    formErrorsObj[field.labelName] = null
                    requiredFieldsObj.push(field.labelName)
                }
            })
        }
        else if(type === 'edit'){
            const leadOwner = createUser.find((e) => {
                let fullName
                if(e.last_name === null || e.last_name === ''){
                    fullName = e.first_name
                } else{
                    fullName = e.first_name + ' ' + e.last_name
                }
                return fullName === data['Lead Owner']
            })
            const leadStatus = leadManagementStatus.find((e) => e.status_name === getLeadStageValue(data))
            const leadSource = leadManagementSource.find((e) => e.source_name === data['Lead Source'])
            const leadCampaign = data['Campaign'] !== null ? activeCampaign.find((e) => e.campaign_name === data['Campaign']) : null

            leadManagementFields.forEach((field) => {
                switch(field.labelName){
                    case 'Lead Owner':
                        formValuesObj[field.labelName] = leadOwner
                        break
                    case 'Lead Status':
                    case 'Lead Stage':
                        formValuesObj[field.labelName] = leadStatus
                        break
                    case 'Lead Source':
                        formValuesObj[field.labelName] = leadSource
                        break
                    case 'Campaign':
                        formValuesObj[field.labelName] = leadCampaign
                        break
                    case 'First Name':
                        formValuesObj[field.labelName] = data.customerFirstName
                        break
                    case 'Last Name':
                        formValuesObj[field.labelName] = data.customerLastName
                        break
                    case 'Title':
                        formValuesObj[field.labelName] = data.customerTitle
                        break
                    case 'Phone Number':
                        formValuesObj[field.labelName] = data.customerPhoneNumber
                        break
                    case 'Mobile':
                        formValuesObj[field.labelName] = data.customerMobile
                        break
                    case 'Email':
                        formValuesObj[field.labelName] = data.customerEmail
                        break
                    case 'Company Name':
                        formValuesObj[field.labelName] = data.company_name
                        break
                    case 'Website':
                        formValuesObj[field.labelName] = data.company_website
                        break
                    case 'Industry':
                        formValuesObj[field.labelName] = data.company_industry
                        break
                    case 'Company Phone Number':
                        formValuesObj[field.labelName] = data.company_phone_number
                        break
                    case 'Company Email':
                        formValuesObj[field.labelName] = data.company_email
                        break
                    case 'No of Employees':
                        formValuesObj[field.labelName] = data.no_of_employees
                        break
                    case 'Address':
                        formValuesObj[field.labelName] = data.customerAddress
                        break
                    case 'Pincode':
                        formValuesObj[field.labelName] = data.customerPincode
                        break
                    case 'City':
                        formValuesObj[field.labelName] = {name: data.customerCity}
                        break
                    case 'State':
                        formValuesObj[field.labelName] = {state: data.customerState}
                        break
                    case 'Country':
                        formValuesObj[field.labelName] = Country.find((e) => e.name === data.customerCountry)
                        break
                    case 'Select Account':
                        formValuesObj[field.labelName] = 'Existing'
                        break
                    case 'Contact Person First Name' :
                        formValuesObj[field.labelName] = data.contactPersonFirstName
                        break
                    case 'Contact Person Last Name' :
                        formValuesObj[field.labelName] = data.contactPersonLastName
                        break
                    case 'Contact Person Gender' :
                        formValuesObj[field.labelName] = data.contactPersonGender
                        break
                    case 'Contact Person Designation' :
                        formValuesObj[field.labelName] = data.contactPersonDesignation
                        break
                    case 'Contact Person Phone Number' :
                        formValuesObj[field.labelName] = data.contactPersonPhoneNumber
                        break
                    case 'Contact Person Email' :
                        formValuesObj[field.labelName] = data.contactPersonEmail
                        break
                    default:
                        formValuesObj[field.labelName] = data[field.labelName]
                        break
                }
                
                if(field.required === 1 && isRenderableField(field)){
                    formErrorsObj[field.labelName] = null
                    requiredFieldsObj.push(field.labelName)
                }
            })

        }


        setFormValues({...formValuesObj})
        setFormErrors({...formErrorsObj})
        setRequiredFields([...requiredFieldsObj])
    }, [leadManagementFields])


    const getAutoCompleteOptions = (name, options) => {
        switch(name){
            case 'Lead Owner':
                return createUser
            case 'Lead Status':
            case 'Lead Stage':
                return leadManagementStatus
            case 'State':
                return _.uniqBy(Cities, 'state')
            case 'City':
                return [...Cities]
            case 'Country':
                return Country
            case 'Lead Source':
                return leadManagementSource
            case 'Campaign':
                return activeCampaign
            default: 
                return options
        }
    }

    const getAutoCompleteOptionLabel = (name, option) => {
        switch(name){
            case 'Lead Owner':
                return option.last_name ? option.first_name + " " + option.last_name : option.first_name || ''
            case 'Lead Status':
            case 'Lead Stage':
                return option.status_name  || ''
            case 'State':
                return option.state || ''
            case 'City':
                return option.name || ''
            case 'Country':
                return option.name || ''
            case 'Lead Source':
                return option.source_name || ''
            case 'Campaign':
                return option.campaign_name || ''
            default: 
                return option || ''
        }
    }

    const validationHandler = async(name, value) => {
        if (value === null || value === '') {
            setFormErrors((prev) => ({ ...prev, [name]: `${getLabelDisplayName(name)} is Required` }))
        } 
        else {
            switch (name) {
                case 'Phone Number':
                case 'Mobile':
                case 'Contact Person Phone Number' :
                case 'Company Phone Number':
                    setFormErrors((prev) => ({...prev, [name] : phoneValidation(value) !== true ? `${name} is Invalid` : null}))
                    break
        
                case 'Email':
                case 'Company Email':
                    setFormErrors((prev) => ({...prev, [name] : emailValidation(value) !== true ? `${name} is Invalid` : null}))
                    break
        
                default:
                    setFormErrors((prev) => ({ ...prev, [name]: null}))
                    break
            }
        }
        
    }

    const handleChange = async(name, value, required) => {
        setFormValues((prev) => ({...prev, [name]: value}))

        if(name === 'Pincode'){
            if(value.length === 6){
                const locationData = await getLocationDataBasedOnPincode(value)
                if(locationData !== undefined){
                    const {district, state} = locationData
                    if(district && state){
                        // textRef.current.focus()
                        setFormValues((prev) => ({...prev, [name]: value, ['State']: {state: state}, ['City']: {name: district}}))
                        setFormErrors((prev)=>({...prev, [name]: null, ['State']: null, ['City']: null}))
                    }
                } else {
                    setFormErrors((prev)=>({...prev, [name]: 'Pincode Not Found'}))
                }
            } else{
                setFormErrors((prev)=>({...prev, [name]: 'Invalid Pincode'}))
            }
        }

        if(name === 'Select Account'){
            if(value === 'Existing'){
                setSelectAccoutnDialog(true)
            }
            else{
                setFormValues((prev) => ({
                    ...prev,
                    ['First Name']: null,
                    ['Last Name']: null,
                    ['Title']: null,
                    ['Phone Number']: null,
                    ['Mobile']: null,
                    ['Email']: null,
                    ['Company Name']: null,
                    ['Website']: null,
                    ['Industry']: null,
                    ['Company Phone Number']: null,
                    ['Company Email']: null,
                    ['No of Employees']: null,
                    ['Address']: null,
                    ['Pincode']: null,
                    ['City']: null,
                    ['State']: null,
                    ['Country']: null,
                    ['Contact Person First Name']: null,
                    ['Contact Person Last Name']: null,
                    ['Contact Person Gender']: null,
                    ['Contact Person Designation']: null,
                    ['Contact Person Phone Number']: null,
                    ['Contact Person Email']: null
                }))
            }
        }

        if(required === 1){
            validationHandler(name, value)
        }
        else if (name === 'Phone Number' && (value === null || value === '' || !phoneValidation(value))) {
                    setFormValues((prev) => ({...prev, [name] : value}))
                    setFormErrors((prev) => ({...prev, [name] : 'Primary Phone Number is Invalid!'}))
                } 
        else if (name === 'Mobile' && (value === null || value === '' || !phoneValidation(value))) {
                    setFormValues((prev) => ({...prev, [name] : value}))
                    setFormErrors((prev) => ({...prev, [name] : 'Secondary Phone Number is Invalid!'}))
                } 
                else{
                    setFormValues((prev) => ({...prev, [name]: value}))
                    setFormErrors({...formErrors, [name]: null})
                }
    }

    const getOldValues = (name) => {
        switch(name){
            case 'First Name':
                return data.customerFirstName
            case 'Last Name':
                return data.customerLastName
            case 'Title':
                return data.customerTitle
            case 'Phone Number':
                return data.customerPhoneNumber
            case 'Mobile':
                return data.customerMobile
            case 'Email':
                return data.customerEmail
            case 'Company Name':
                return data.company_name
            case 'Website':
                return data.company_website
            case 'Industry':
                return data.company_industry
            case 'Company Phone Number':
                return data.company_phone_number
            case 'Company Email':
                return data.company_email
            case 'No of Employees':
                return data.no_of_employees
            case 'Address':
                return data.customerAddress
            case 'Pincode':
                return data.customerPincode
            case 'Contact Person First Name' :
                return data.contactPersonFirstName
            case 'Contact Person Last Name' :
                return data.contactPersonLastName
            case 'Contact Person Gender' :
                return data.contactPersonGender
            case 'Contact Person Designation' :
                return data.contactPersonDesignation
            case 'Contact Person Phone Number' :
                return data.contactPersonPhoneNumber
            case 'Contact Person Email' :
                return data.contactPersonEmail
            default:
                return data[name]
        }
    }

    const getTimelineMessage = (field) => {
        let oldVal
        let newVal
        switch(field.labelName){
            case 'Lead Owner':
                oldVal = data[field.labelName]
                newVal = formValues[field.labelName]?.last_name ? `${formValues[field.labelName]?.first_name} ${formValues[field.labelName]?.last_name}` : `${formValues[field.labelName]?.first_name}`
                break

            case 'Lead Status':
            case 'Lead Stage':
                oldVal = getLeadStageValue(data)
                newVal = formValues[field.labelName]?.status_name
                break

            case 'Lead Source':
                oldVal = data[field.labelName]
                newVal = formValues[field.labelName]?.source_name
                break

            case 'City':
                oldVal = data.customerCity
                newVal = formValues[field.labelName]?.name
                break

            case 'State':
                oldVal = data.customerState
                newVal = formValues[field.labelName]?.state
                break

            case 'Country':
                oldVal = data.customerCountry
                newVal = formValues[field.labelName]?.name
                break

            case 'Select Account':
                return {leadStatusTimeline: null, accountsTimelineMessage: null, leadsTimelineMessage: null, primaryContactTimelineMessage : null}

            case 'Campaign':
                oldVal = data[field.labelName] || ''
                newVal = formValues[field.labelName]?.campaign_name || ''
                break
            
            default:
                oldVal = getOldValues(field.labelName)
                newVal = formValues[field.labelName]
                break
        }
        if(oldVal !== newVal){
            console.log(oldVal, newVal, 'oldVal newVal')
            let message = `${getLabelDisplayName(field.labelName)} changed from ${oldVal || 'NIL'} to ${newVal || 'NIL'}`
            if(field.flag === 'leads'){
                if(isLeadStageField(field.labelName)){
                    return {leadStatusTimeline: newVal, accountsTimelineMessage: null, leadsTimelineMessage: message, primaryContactTimelineMessage : null}
                }
                else{
                    return {leadStatusTimeline: null, accountsTimelineMessage: null, leadsTimelineMessage: message, primaryContactTimelineMessage : null}
                }
            }
            else if(field.flag === 'accounts'){
                return {leadStatusTimeline: null, accountsTimelineMessage: message, leadsTimelineMessage: null, primaryContactTimelineMessage : null}
            }
            else if(field.flag === 'primaryContact') {
                return {leadStatusTimeline: null, accountsTimelineMessage: null, leadsTimelineMessage: null, primaryContactTimelineMessage : message}
            }
        }
        else{
            return {leadStatusTimeline: null, accountsTimelineMessage: null, leadsTimelineMessage: null, primaryContactTimelineMessage : null}
        }
    }

	    const handleSubmit = async(event) => {
	        event.preventDefault()

	        if(isSubmitting) return

        setIsSubmitting(true)

        let isValid = true
        let formErrorObj = {}

	        ;[...new Set(requiredFields)].forEach((key) => {
            if (isEmptyRequiredValue(formValues?.[key])) {
                isValid = false
                formErrorObj[key] = `${getLabelDisplayName(key)} is Required`
            }
        })

	        setFormErrors(formErrorObj)

	        if(isValid){
	            const selectedStage = formValues?.['Lead Stage'] || formValues?.['Lead Status']
	            const stageKey = selectedStage?.status_name
	            const mandatoryFieldIds = new Set(
	                (stageRules || [])
	                    .filter((r) => r.entity_type === 'lead' && r.is_mandatory && String(r.stage_key) === String(stageKey))
	                    .map((r) => String(r.field_id)),
	            )

	            const missingCustom = []
	            const customErr = {}
	            ;(customFields || []).filter((f) => f.is_active).forEach((f) => {
	                if(!mandatoryFieldIds.has(String(f.field_id))) return
	                const v = customValues?.[String(f.field_id)]
	                if(v == null || String(v).trim() === ''){
	                    missingCustom.push(f.label)
	                    customErr[String(f.field_id)] = `${f.label} is required for this stage`
	                }
	            })
	            setCustomErrors(customErr)
	            if(missingCustom.length){
	                setIsSubmitting(false)
	                dispatch(OpenalertActions({ msg: `Missing mandatory fields: ${missingCustom.join(', ')}`, severity: 'warning' }))
	                return
	            }

	            let payload = {}
	            leadManagementFields.forEach((field) => {
	                if(field.labelName === 'City'){
                    payload[field.labelName] = formValues[field.labelName]?.name
                } 
                else if(field.labelName === 'Country'){
                    payload[field.labelName] = formValues[field.labelName]?.name
                }
                else if(field.labelName === 'Lead Owner'){
                    payload[field.labelName] = formValues[field.labelName].employee_id
                }
                else if(isLeadStageField(field.labelName)){
                    payload[field.labelName] = formValues[field.labelName].status_id
                    payload.status = formValues[field.labelName].status_name
                }
                else if(field.labelName === 'Lead Source'){
                    payload[field.labelName] = formValues[field.labelName].source_id
                }
                else if(field.labelName === 'Campaign'){
                    payload[field.labelName] = formValues[field.labelName] !== null ? formValues[field.labelName].campaign_id : null
                }
                else if(field?.labelName === 'State'){
                    payload[field.labelName] = formValues[field.labelName]?.state
                }
                else if(field.labelName === 'Select Account'){
                    if(formValues[field.labelName] === 'Existing'){
                        payload.person_id = formValues.person_id
                        payload.customer_id = formValues.customer_id
                        payload.contact_person = formValues.contact_person
                    }
                    payload[field.labelName] = formValues[field.labelName]
                }
                else if(field.inputType === 'Attachment'){
                    payload[field.labelName] = [...formValues[field.labelName]]
                }
                else if(field?.labelName === 'Contact Person First Name') {
                    payload[field.labelName] = formValues[field.labelName];
                }
                else if(field?.labelName === 'Contact Person Gender') {
                    payload[field.labelName] = formValues[field.labelName] === 'Male' ? 1 : formValues[field.labelName] === 'Female' ? 2 : 0
                }
                else{
                    payload[field.labelName] = formValues[field.labelName]
                }
                
            })
	            payload.additionalContact = addContact; 
	            const valuesPayload = {}
	            ;(customFields || []).filter((f) => f.is_active).forEach((f) => {
	                const key = String(f.field_id)
	                const v = customValues?.[key]
	                valuesPayload[key] = v == null || String(v).trim() === '' ? null : v
	            })
	            try {
	                if(type === 'new'){
	                    const created = await dispatch(createLeadAction(payload))
	                    const leadId =
	                        created?.lead_id ??
	                        created?.leadRes?.insertId ??
	                        created?.leadRes?.lead_id
	                    if (leadId && Object.keys(valuesPayload).length) {
	                        await crmConfigServices.setEntityFieldValues('lead', leadId, valuesPayload)
	                    }
	                    handleClose()
	                }
	                else if(type === 'edit'){
                    let leadsTimelineMsg = []
                    let accountsTimelineMsg = []
                    let leadStatusTimelineMsg = []
                    let primaryContactTimelineMsg = []
                    for (const field of leadManagementFields) {
                        const messages = await getTimelineMessage(field)
                        if(messages.leadStatusTimeline !== null){
                            leadStatusTimelineMsg.push(messages.leadStatusTimeline)
                        }
                        if(messages.leadsTimelineMessage !== null){
                            leadsTimelineMsg.push(`${messages.leadsTimelineMessage} - ${storage.first_name}`)
                        }
                        if(messages.accountsTimelineMessage !== null){
                            accountsTimelineMsg.push(messages.accountsTimelineMessage)
                        }
                        if(messages.primaryContactTimelineMessage !== null) {
                            primaryContactTimelineMsg.push(messages.primaryContactTimelineMessage)
                        }
                    }
    
    
	                    let updatePayload = {
	                        leadData: payload,
	                        leadTimeline: leadsTimelineMsg,
	                        accountTimeline: accountsTimelineMsg,
	                        leadStatusTimeline: leadStatusTimelineMsg,
	                        primaryContactTimeline : primaryContactTimelineMsg,
	                        additionalContact : addContact
	                    }
	                    await dispatch(updateLeadAction(updatePayload, data.lead_id))
	                    if (data?.lead_id && Object.keys(valuesPayload).length) {
	                        await crmConfigServices.setEntityFieldValues('lead', data.lead_id, valuesPayload)
	                    }
	                    props.handleClose()
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
            const missingFields = Object.keys(formErrorObj)
            if(missingFields.length){
                const missingFieldLabels = missingFields.map((name) => getLabelDisplayName(name))
                dispatch(OpenalertActions({ msg: `Please fill the required fields: ${missingFieldLabels.join(', ')}`, severity: 'warning' }))
                return
            }
            dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
        }
    }

    const handleAccountSelect = (selectedAccount) => {
        if(selectedAccount !== null){
            setSelectAccoutnDialog(false)
        console.log('selectedAccount',selectedAccount)
        setAddContact(getAdditionalContacts[0])
        setFormValues((prev) => ({
            ...prev,
            ['First Name']: selectedAccount.first_name,
            ['Last Name']: selectedAccount.last_name,
            ['Title']: selectedAccount.salutation,
            ['Phone Number']: selectedAccount.phone_number,
            ['Mobile']: selectedAccount.alternate_num,
            ['Email']: selectedAccount.email,
            ['Company Name']: selectedAccount.company_name,
            ['Website']: selectedAccount.company_website,
            ['Industry']: selectedAccount.company_industry,
            ['Company Phone Number']: selectedAccount.company_phone_number,
            ['Company Email']: selectedAccount.company_email,
            ['No of Employees']: selectedAccount.no_of_employees,
            ['Address']: selectedAccount.address,
            ['Pincode']: selectedAccount.zip,
            ['City']: {name: selectedAccount.city},
            ['State']: {state: selectedAccount.state},
            ['Country']: {name: selectedAccount.country},
            person_id: selectedAccount.person_id,
            customer_id: selectedAccount.customer_id,
            contact_person : selectedAccount.contact_person,
            ['Contact Person First Name']: selectedAccount.contactPersonFirstName,
            ['Contact Person Last Name']: selectedAccount.contactPersonLastName,
            ['Contact Person Gender']: selectedAccount.contactPersonGender,
            ['Contact Person Designation']: selectedAccount.contactPersonDesignation,
            ['Contact Person Phone Number']: selectedAccount.contactPersonPhoneNumber,
            ['Contact Person Email']: selectedAccount.contactPersonEmail
        }))
        setFormErrors((prev) => ({
            ...prev,
            ['First Name']: null,
            ['Phone Number']: null,
            ['Mobile']: null,
            ['Company Name']: null,
            ['Company Phone Number']: null,
            ['Address']: null,
            ['Pincode']: null,
            ['City']: null,
            ['State']: null,
            ['Country']: null,
            ['Contact Person First Name'] : null,
            ['Contact Person Gender'] : null,
            ['Contact Person Designation'] : null,
            ['Contact Person Phone Number'] : null
        }))}
        else{
            setAccErr(true)
        }
    }

    const renderSection = (fields, title) => {
        return (
            <>
                {
                    title !== 'Leads' &&
                    <Grid
                        sx={{mt: 4}}
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                        <Divider />
                        <Typography variant='h6' sx={{mt: 4}}>{title}</Typography>
                    </Grid>
                }
                {
                    fields.map((field, index) => (
                        <React.Fragment key={field.component_id}>
                            {
                                field.inputType === 'TextField' || field.inputType === 'Text Field' && field.isActive === 1 ? (
                                    <Grid
                                        size={{
                                            lg: 3,
                                            md: 4,
                                            sm: 4,
                                            xs: 4
                                        }}>
                                        <TextField 
                                            label={
                                                field.labelName === 'Contact Person Gender' ? 'Gender' : field.labelName === 'Contact Person First Name' ? 'First Name' : field.labelName === 'Contact Person Designation' ? 'Designation' : field.labelName === 'Contact Person Last Name' ? 'Last Name' : field.labelName === 'Contact Person Email' ? 'Email' :field.labelName === 'Contact Person Phone Number' ? 'Phone Number' :field.labelName === 'Phone Number' ? 'Primary Phone Number' : field.labelName === 'Mobile' ? 'Secondary Phone Number' : getLabelDisplayName(field.labelName)
                                            }
                                            value={formValues[field.labelName] || ''}
                                            required={field.required === 1}
                                            variant='filled'
                                            onChange={(event) => handleChange(field.labelName, event.target.value, field.required)}
                                            type={field.variant}
                                            fullWidth
                                            error={formErrors[field.labelName] !== null && formErrors[field.labelName] !== undefined}
                                            helperText={formErrors[field.labelName] && formErrors[field.labelName] !== null ? formErrors[field.labelName] : ''}
                                            inputProps={{
                                            inputMode: 'numeric',
                                            style: {
                                                MozAppearance: 'textfield', 
                                            },
                                            }}
                                            sx={{
                                            '& input[type=number]': {
                                                MozAppearance: 'textfield',
                                            },
                                            '& input[type=number]::-webkit-outer-spin-button': {
                                                WebkitAppearance: 'none',
                                                margin: 0,
                                            },
                                            '& input[type=number]::-webkit-inner-spin-button': {
                                                WebkitAppearance: 'none',
                                                margin: 0,
                                            },
                                            }}
                                        />
                                    </Grid>
                                )
            
                                : field.inputType === 'TextArea' && field.isActive === 1 ? (
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
                                            multiple
                                            rows={3}
                                            fullWidth
                                            error={formErrors[field.labelName] !== null && formErrors[field.labelName] !== undefined}
                                            helperText={formErrors[field.labelName] && formErrors[field.labelName] !== null ? formErrors[field.labelName] : ''}
                                        />
                                    </Grid>
                                )
            
                                : field.inputType === 'List' && field.isActive === 1 ? (
                                    <Grid
                                        size={{
                                            lg: 3,
                                            md: 4,
                                            sm: 4,
                                            xs: 4
                                        }}>
                                        <Autocomplete
                                            options={getAutoCompleteOptions(field.labelName, field.options)}
                                            getOptionLabel={(option) => getAutoCompleteOptionLabel(field.labelName, option)}
                                            value={formValues[field.labelName] || ''}    
                                            onChange={(event, value) => handleChange(field.labelName, value, field.required)}
                                            renderInput={(params) => {
                                                const get = {...params}
                                                get.InputProps = field.labelName === 'Lead Source' || isLeadStageField(field.labelName) ? {
                                                    ...params.InputProps,
                                                    startAdornment: (
                                                        <Tooltip title={field.labelName === 'Lead Source' ? 'Create Lead Source' : 'Create Lead Stage'}>
                                                            <IconButton
                                                                size='small'
                                                                onClick={() => {
                                                                    handleAddStatus(field.labelName)
                                                                    setAddStatusOpen(true)
                                                                }}
                                                            >
                                                                <AddIcon fontSize='small' />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )
                                                } : {...params.InputProps}
                                                return(
                                                    <TextField
                                                        {...get}
                                                        required={field.required === 1}
                                                        fullWidth
                                                        label={field.labelName == 'Contact Person Gender' ? 'Gender' : getLabelDisplayName(field.labelName)}
                                                        variant='filled'
                                                        error={formErrors[field.labelName] !== null && formErrors[field.labelName] !== undefined}
                                                        helperText={formErrors[field.labelName] && formErrors[field.labelName] !== null ? formErrors[field.labelName] : ''}
                                                    />
                                                )
                                            }}
                                        />
                                    </Grid>
                                )
            
                                : field.inputType === 'Date' && field.isActive === 1 ? (
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
                                                format='DD/MM/YYYY'
                                                value={toMomentOrNull(formValues[field.labelName])}
                                                onChange={(e) => {
                                                    if(e?._d){
                                                        handleChange(field.labelName, moment(e._d).format(field.dateTimeFormat), field.required)
                                                    }
                                                    else{
                                                        handleChange(field.labelName, null, field.required)
                                                    }
                                                }}
                                                slotProps={{ textField: { variant: 'filled', fullWidth: true, required: field.required === 1, error: formErrors[field.labelName] !== null && formErrors[field.labelName] !== undefined, helperText: formErrors[field.labelName] && formErrors[field.labelName] !== null ? formErrors[field.labelName] : '' } }}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                )
            
                                : field.inputType === 'Time' && field.isActive === 1 ? (
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
                                                value={toMomentOrNull(formValues[field.labelName])}
                                                onChange={(e) => {
                                                    if(e?._d){
                                                        handleChange(field.labelName, moment(e._d).format(field.dateTimeFormat), field.required)
                                                    }
                                                    else{
                                                        handleChange(field.labelName, null, field.required)
                                                    }
                                                }}
                                                slotProps={{ textField: { variant: 'filled', fullWidth: true, required: field.required === 1, error: formErrors[field.labelName] !== null && formErrors[field.labelName] !== undefined, helperText: formErrors[field.labelName] && formErrors[field.labelName] !== null ? formErrors[field.labelName] : '' } }}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                )
            
                                : field.inputType === 'Date & Time' && field.isActive === 1 ? (
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
                                                slotProps={{ textField: { variant: 'filled', onKeyDown: (e) => e.preventDefault(), fullWidth: true, required: field.required === 1, error: formErrors[field.labelName] !== null && formErrors[field.labelName] !== undefined, helperText: formErrors[field.labelName] && formErrors[field.labelName] !== null ? formErrors[field.labelName] : '' } }}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                )
            
                                : field.inputType === 'Radio' && field.isActive === 1 ? (
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
                                                    <RadioGroup value={formValues[field.labelName] || ''} 
                                                    onChange={(event) => handleChange(field.labelName, event.target.value, field.required)}
                                                    >
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
                                )
            
                                : field.inputType === 'Checkbox' && field.isActive === 1 ? (
                                    <Grid
                                        size={{
                                            lg: 3,
                                            md: 4,
                                            sm: 4,
                                            xs: 4
                                        }}>
                                        <FormControlLabel 
                                            control={<Checkbox 
                                                        checked={formValues[field.labelName]}
                                                        onChange={() => setFormValues((prev) => ({...prev, [field.labelName]: !formValues[field.labelName]}))}
                                                    />}
                                            label={field.labelName}
                                        />
                                    </Grid>
                                )
            
                                : field.inputType === 'Attachment' && field.isActive === 1 ? (
                                    <Grid
                                        size={{
                                            lg: 12,
                                            md: 12,
                                            sm: 12,
                                            xs: 12
                                        }}>
                                        <AttachmentField 
                                            asset={title}
                                            labelName={field.labelName}
                                            previews={formValues[field.labelName]}
                                            setPreviews={setFormValues}
                                            // handleImageDelete={handleImageDelete}
                                        />
                                        <Typography variant='caption' color='error'>{formErrors[field.labelName] && formErrors[field.labelName] !== null ? formErrors[field.labelName] : ''}</Typography>
                                    </Grid>
                                )
                                
                                : null
                            }
                        </React.Fragment>
                    ))
                }
            </>
        );
    }

    const leadsFields = leadManagementFields.filter(field => field.flag === 'leads' && field.isActive === 1)
    const accountsFields = leadManagementFields.filter(field => field.flag === 'accounts' && field.isActive === 1)
    const primaryContactFields = leadManagementFields.filter(field => field.flag === 'primaryContact' && field.isActive === 1)

    const handleExit =()=>{
        setAdd(false)
    }

    return (
        <>
            <Card sx={{p: 5, overflowY: 'visible'}}>
                <Grid container spacing={3}>
                    <Grid
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                        <Grid container display="flex" justifyContent="space-between">
                            <Grid display='flex' alignItems='center'>
                                <Typography variant='h6'>Lead Creation</Typography>
                            </Grid>
                            <Grid>
                                <Grid container justifyContent="flex-end" spacing={2}>
                                    <Grid>
                                        <Button variant='contained' color='error' onClick={() => handleClose()}>
                                            Cancel
                                        </Button>
                                    </Grid>
                                    <Grid>
                                        <Button variant='contained' onClick={handleSubmit} disabled={isSubmitting}>
                                            Submit
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>    
                        </Grid>    
                    </Grid>

	                    <Grid
                            size={{
                                lg: 10,
                                md: 10,
                                sm: 10,
                                xs: 10
                            }}>
	                        <Grid container spacing={3}>
	                            {leadsFields.length > 0 && renderSection(leadsFields, 'Leads')}
	                            {accountsFields.length > 0 && renderSection(accountsFields, 'Accounts')}
	                            {primaryContactFields.length > 0 && renderSection(primaryContactFields, 'Primary Contact')}

	                            {customFields.filter((f) => f.is_active).length > 0 && (
	                                <>
	                                    <Grid
                                            sx={{mt: 4}}
                                            size={{
                                                lg: 12,
                                                md: 12,
                                                sm: 12,
                                                xs: 12
                                            }}>
	                                        <Divider />
	                                        <Typography variant='h6' sx={{mt: 4}}>Custom Fields</Typography>
	                                    </Grid>
	                                    {customFields
	                                        .filter((f) => f.is_active)
	                                        .map((f) => {
	                                            const key = String(f.field_id)
	                                            const val = customValues?.[key] ?? ''
	                                            const err = customErrors?.[key]
	                                            if (f.field_type === 'select') {
	                                                return (
                                                        <Grid
                                                            key={key}
                                                            size={{
                                                                lg: 3,
                                                                md: 4,
                                                                sm: 4,
                                                                xs: 4
                                                            }}>
                                                            <TextField
	                                                            select
	                                                            label={f.label}
	                                                            value={val}
	                                                            variant='filled'
	                                                            onChange={(e) => setCustomValues((p) => ({...p, [key]: e.target.value}))}
	                                                            fullWidth
	                                                            error={!!err}
	                                                            helperText={err || ''}
	                                                        >
	                                                            {(Array.isArray(f.options) ? f.options : []).map((opt) => (
	                                                                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
	                                                            ))}
	                                                        </TextField>
                                                        </Grid>
                                                    );
	                                            }

	                                            return (
                                                    <Grid
                                                        key={key}
                                                        size={{
                                                            lg: 3,
                                                            md: 4,
                                                            sm: 4,
                                                            xs: 4
                                                        }}>
                                                        <TextField
	                                                        label={f.label}
	                                                        value={val}
	                                                        variant='filled'
	                                                        type={f.field_type === 'number' ? 'number' : f.field_type === 'date' ? 'date' : 'text'}
	                                                        InputLabelProps={f.field_type === 'date' ? {shrink: true} : undefined}
	                                                        onChange={(e) => setCustomValues((p) => ({...p, [key]: e.target.value}))}
	                                                        fullWidth
	                                                        error={!!err}
	                                                        helperText={err || ''}
	                                                    />
                                                    </Grid>
                                                );
	                                        })}
	                                </>
	                            )}

	                            <Grid
                                    size={{
                                        lg: 12,
                                        md: 12,
                                        sm: 12,
                                        xs: 12
                                    }}>
	                                <MaterialTable
                                    columns={columns}
                                    data={addContact}
                                    title={'Additional Contacts'}
                                    totalCount={addContact?.length}
                                    options={{
                                    actionsColumnIndex: -1,
                                    filtering: false,
                                    search: false,
                                    paging: true,
                                    pageSize: 5,
                                    pageSizeOptions: [5,10,20],
                                    maxBodyHeight: maxBodyHeight,
                                    headerStyle,
                                    cellStyle,
                                    }}
                                    // onPageChange={(page) => {
                                    //   handlePageChange(page);
                                    // }}
                                    // onRowsPerPageChange={(size) => {
                                    //   handleSizeChange(size);
                                    // }}
                                    components={{
                                    Toolbar: (props) => (
                                        <div
                                        style={{
                                            display: 'flex',
                                            width: '100%',
                                            alignItems: 'center',
                                        }}
                                        >
                                        <div style={{width: '100%'}}>
                                            <MTableToolbar {...props} />
                                        </div>
                                        <div>
                                            {/* <CommonSearch
                                            searchVal={paginateData.searchString}
                                            cancelSearch={cancelSearch}
                                            requestSearch={requestSearch}
                                            /> */}
                                        </div>
                                        </div>
                                    ),
                                    }}
                                    actions={[
                                    {
                                        icon: () => <AddIcon />,
                                        tooltip: 'Add Contact',
                                        isFreeAction: true,
                                        onClick: () => handleOpen(),
                                    },
                                    ]}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid
                        size={{
                            lg: 2,
                            md: 2,
                            sm: 2,
                            xs: 2
                        }}></Grid>
                    
                </Grid>
            </Card>
            <Dialog onClose={() => setAddStatusOpen(false)} open={addStatusOpen}>
                <NewSource type={formType} closeDialog={() => setAddStatusOpen(false)} />
            </Dialog>
            <Dialog onClose={() => setSelectAccoutnDialog(false)} open={selectAccountDialog}>
                <SelectAccount handleAccountSelect={handleAccountSelect} accErr = {err} setAccErr={()=> setAccErr(false)} closeDialog={() => {
                    setSelectAccoutnDialog(false)
                    setFormValues((prev) => ({...prev, ['Select Account']: "New"}))
                    }}/>
            </Dialog>
            <Dialog open={add}>
                    <AdditionalContacts addContactData={addContactData} handleClose = {handleExit} />
            </Dialog>
        </>
    );

}

LeadForm.propTypes = {
    type: PropTypes.string,
    handleClose: PropTypes.func,
    data: PropTypes.array
}

export default LeadForm

