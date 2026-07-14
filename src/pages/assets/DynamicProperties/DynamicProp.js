import { Grid,
    Button,
    Container,
    Autocomplete,
    TextField,
    Typography,
    Checkbox,
    FormControlLabel,
    Chip,
    Box,
} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { useState, useEffect } from 'react'
import { capitalize } from 'lodash';
import { CreateDynamicProp, editDynamicProp, getAssetTypeIdAction } from 'redux/actions/asset_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import { createCustomLeadField } from 'redux/actions/leadManagement_actions';
import PropTypes from 'prop-types'
import { requiredFieldsAlertMessage } from 'utils/content';
import { OpenalertActions } from 'redux/actions/alert_actions';

function NewDynamicProperties(props){
    const dispatch = useDispatch()
    const storage = getsessionStorage()
    const{
        AssetReducers: {
            getAssetType,
        }
    } = useSelector((state) => state)

    const[formValues, setFormValues] = useState({
        assetType: '',
        name: '',
        type: '',
        options: [],
        defaultVal: '',
        dateFormatVal: 'DD/MM/YYYY',
        dateDefaultVal: false,
        timeFormatVal: 'HH:mm:ss',
        timeDefaultVal: false,
        dateTimeFormatVal: 'DD/MM/YYYY HH:mm:ss',
        dateTimeDefaultVal: false,
        textInputType: '',
        required: false,
        readOnly: false,
        allowDuplication: true,
        duplicationWithBlankValue: true,
    })
    const[formErrors, setFormErrors] = useState({
        assetType: null,
        name: null,
        type: null,
        options: null,
        textInputType: null,
        dateFormatVal: null,
        timeFormatVal: null,
        dateTimeFormatVal: null,
    })
    const[inputVal, setInputVal] = useState('')
    const[submitType, setSubmitType] = useState('new')
    const[propId, setPropId] = useState(0)

    useEffect(() => { (async () => {
        if(props.type === 'assets'){
            await dispatch(getAssetTypeIdAction({groupId: null}))
        }
        else if(props.type === 'assetInsuranceNewForm'){
            setSubmitType('assetInsuranceNewForm')
        }
        else if(props.type === 'proDynamicNewForm'){
            setSubmitType('proDynamicNewForm')
        }
    })();
}, [])

    useEffect(() => {
        if(props.type === 'assets'){
            if(props.formType === 'edit'){
                
                setFormValues({
                    assetType: getAssetType.data?.find((type) => type.asset_type === props.editData.asset_type),
                    name: props.editData.labelName || '',
                    type: props.editData.inputType || '',
                    options: props.editData.options ? props.editData.options : [],
                    defaultVal: props.editData.inputType !== 'Date' && props.editData.inputType !== 'Time' && props.editData.inputType !== 'Date & Time' && props.editData.defaultValue !== null ? props.editData.defaultValue : '',
                    dateFormatVal: props.editData.inputType === 'Date' && props.editData.dateTimeFormat !== null ? props.editData.dateTimeFormat : null ,
                    dateDefaultVal: props.editData.inputType === 'Date' && props.editData.defaultValue !== null ? props.editData.defaultValue : false,
                    timeFormatVal: props.editData.inputType === 'Time' && props.editData.dateTimeFormat !== null ? props.editData.dateTimeFormat : null,
                    timeDefaultVal: props.editData.inputType === 'Time' && props.editData.defaultValue !== null ? props.editData.defaultValue : false,
                    dateTimeFormatVal: props.editData.inputType === 'Date & Time' ? props.editData.dateTimeFormat : null,
                    dateTimeDefaultVal: props.editData.inputType === 'Date & Time' && props.editData.defaultValue !== null ? props.editData.defaultValue : false,
                    textInputType: props.editData.variant ? props.editData.variant :'',
                    required: props.editData.required === 1,
                    readOnly: props.editData.read_only === 1,
                    allowDuplication: props.editData.duplication === 1,
                    duplicationWithBlankValue: props.editData.duplicateWithBlankValues
                })
                setSubmitType('edit')
                setPropId(props.editData.component_id)
            }

            else if(props.formType === 'new'){
                setSubmitType('new')
            }
        }
    }, [props])

    const isSalaryColumnPage = props.pageType === 'salaryColumn'
    const type = isSalaryColumnPage
        ? ['Text', 'Number', 'Date']
        : ['List', 'Text Field', 'Date', 'Time', 'Date & Time', 'CheckBox', 'Radio', 'Text Area']
    const dateFormat = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY/MM/DD']
    const timeFormat = ['HH:mm:ss', 'HH:mm', 'h:mm a', 'h:mm:ss a']
    const dateTimeFormat = ['DD/MM/YYYY HH:mm:ss', 'DD/MM/YYYY h:mm a', 'MM/DD/YYYY HH:mm:ss', 'MM/DD/YYYY h:mm a', 'YYYY/MM/DD HH:mm:ss', 'YYYY/MM/DD h:mm a']

    const getSalaryTypeValue = () => {
        if (formValues.type === 'Date') return 'Date'
        if (formValues.type === 'Text Field' && formValues.textInputType === 'Number') return 'Number'
        if (formValues.type === 'Text Field') return 'Text'
        return ''
    }

    const handleSelectChange = (val, name) => {
        if (isSalaryColumnPage && name === 'type') {
            if (val !== null && val !== '') {
                if (val === 'Date') {
                    setFormValues({
                        ...formValues,
                        type: 'Date',
                        textInputType: ''
                    })
                }
                else {
                    setFormValues({
                        ...formValues,
                        type: 'Text Field',
                        textInputType: val === 'Number' ? 'Number' : 'Text'
                    })
                }
                setFormErrors({
                    ...formErrors,
                    type: null,
                    textInputType: null
                })
            } else {
                setFormValues({
                    ...formValues,
                    type: '',
                    textInputType: ''
                })
                setFormErrors({
                    ...formErrors,
                    type: 'Input Type is Required'
                })
            }
            return
        }

        if(val !==null && val !== ''){
            setFormValues({
                ...formValues,
                [name]: val,
            })
            setFormErrors({
                ...formErrors,
                [name]: null
            })
        } else{
            setFormValues({
                ...formValues,
                [name]: ''
            })
            setFormErrors({
                ...formErrors,
                [name]: name  === 'assetType' ? 'Asset Type is Required' : 'Input Type is Required'
            })
        }
        
    }

    const handleOptionsChange = (event, newValue) => {
        if(newValue.length > 0){
            setFormValues({
                ...formValues,
                options: newValue
            })
            setFormErrors({
                ...formErrors,
                options: null
            })
        }
        if(newValue.length === 0){
            setFormValues({
                ...formValues,
                options: []
            })
            setFormErrors({
                ...formErrors,
                options: 'Options is Required'
            })
        }
    }

    const handleInputChange = (event, newValInp) => {
        if(event && event.key === 'Enter' && inputVal.trim() !== '' ){
            const newOptions = [...formValues.options, inputVal.trim()]
            if(newOptions.length > 0){
                setFormValues(prev => ({
                    ...prev,
                    options: newOptions
                }))
                setFormErrors({
                    ...formErrors,
                    options: null
                })
            }        
            if(newOptions.length === 0){
                setFormErrors({
                    ...formErrors,
                    options: 'Options is Required'
                })
            }
        }
        
    }

    const handleInput = (event) => {
        setInputVal(event.target.value);
    };


    const handleTextInput = (val, name) => {
        if(val !== null && val !== ''){
            setFormValues({
                ...formValues,
                [name]: val
            })
            setFormErrors({
                ...formErrors,
                [name]: null
            })
        }
        else{
            setFormValues({
                ...formValues,
                [name]: null
            })
            setFormErrors({
                ...formErrors,
                [name]: `${capitalize(name)} is Required`
            })
        }
    }

    const handleClose = () => {
        if(props?.type !== 'checkList'){
            props.handleClose()
        }
        else{
            props.closeDialog(false)
        }
    }

    const  handleSubmit = async (event) => {
        event.preventDefault()
        let isValid = true
        let formErrorsObj = {...formErrors}
        console.log(submitType)
        
        if(formValues.type === 'List' || formValues.type === 'Radio'){
            let requiredFields 
            if(props?.type === 'assetInsuranceNewForm' || storage.company_type === 10) {
                requiredFields =['name', 'type', 'options']
            }
            else if(props?.type === 'proDynamicNewForm') {
                requiredFields =['name', 'type', 'options']
            }
            else{
                requiredFields =['assetType', 'name', 'type', 'options']
            }
            Object.keys(formValues).map((key, i) => {
                if(key === 'options'){
                    if (requiredFields.includes(key) && (formValues[key].length === 0)){
                        isValid = false
                        formErrorsObj[key] = 'Options is Required'
                    }   
                }
                if (requiredFields.includes(key) && (formValues[key] === null || formValues[key] === 'null' || formValues[key] === '')){
                    isValid = false
                    formErrorsObj[key] = capitalize(key) + ' is Required'
                }
            })
        }
        else if(formValues.type === 'Text Field'){
            let requiredFields
            if(props?.type === 'assetInsuranceNewForm' || storage.company_type === 10) {
                requiredFields = ['name', 'type', 'textInputType']
            }
            else if(props?.type === 'proDynamicNewForm') {
                requiredFields = ['name', 'type', 'textInputType']
            }
            else {
                requiredFields = ['assetType', 'name', 'type', 'textInputType']
            }
            Object.keys(formValues).map((key, i) => {
                if (requiredFields.includes(key) && (formValues[key] === null || formValues[key] === 'null' || formValues[key] === '')){
                    isValid = false
                    formErrorsObj[key] = capitalize(key) + ' is Required'
                } 
            })
        }
        else if(formValues.type === 'Date'){
            let requiredFields
            if(props?.type === 'assetInsuranceNewForm' || storage.company_type === 10) {
                requiredFields = ['name', 'type', 'dateFormatVal']
            }
            else if(props?.type === 'proDynamicNewForm') {
                requiredFields = ['name', 'type', 'dateFormatVal']
            }
            else {
                requiredFields = ['assetType', 'name', 'type', 'dateFormatVal']
            }
            Object.keys(formValues).map((key, i) => {
                if (requiredFields.includes(key) && (formValues[key] === null || formValues[key] === 'null' || formValues[key] === '')){
                    isValid = false
                    formErrorsObj[key] = capitalize(key) + ' is Required'
                } 
            })
        }
        else if(formValues.type === 'Time'){
            let requiredFields
            if(props?.type === 'assetInsuranceNewForm' || storage.company_type === 10) {
                requiredFields = ['name', 'type', 'timeFormatVal']
            }
            else  if(props?.type === 'proDynamicNewForm') {
                requiredFields = ['name', 'type', 'timeFormatVal']
            }
            else {
                requiredFields = ['assetType', 'name', 'type', 'timeFormatVal']
            }
            Object.keys(formValues).map((key, i) => {
                if (requiredFields.includes(key) && (formValues[key] === null || formValues[key] === 'null' || formValues[key] === '')){
                    isValid = false
                    formErrorsObj[key] = capitalize(key) + ' is Required'
                } 
            })
        }
        else if(formValues.type === 'Date & Time'){
            let requiredFields
            if(props?.type === 'assetInsuranceNewForm' || storage.company_type === 10) {
                requiredFields = ['name', 'type', 'dateTimeFormatVal']
            }
            else   if(props?.type === 'proDynamicNewForm') {
                requiredFields = ['name', 'type', 'dateTimeFormatVal']
            }
            else {
                requiredFields = ['assetType', 'name', 'type', 'dateTimeFormatVal']
            }
            Object.keys(formValues).map((key, i) => {
                if (requiredFields.includes(key) && (formValues[key] === null || formValues[key] === 'null' || formValues[key] === '')){
                    isValid = false
                    formErrorsObj[key] = capitalize(key) + ' is Required'
                } 
            })
        }
        else{
            let requiredFields
            if(props?.type === 'assetInsuranceNewForm' || storage.company_type === 10) {
                requiredFields = ['name', 'type']
            }
            else  if(props?.type === 'proDynamicNewForm') {
                requiredFields = ['name', 'type']
            }
            else {
                requiredFields = ['assetType', 'name', 'type']
            }
            Object.keys(formValues).map((key, i) => {
                if (requiredFields.includes(key) && (formValues[key] === null || formValues[key] === 'null' || formValues[key] === '')){
                    isValid = false
                    formErrorsObj[key] = capitalize(key) + ' is Required'
                } 
            })
        }
        setFormErrors(formErrorsObj)

        if(isValid){
            if(submitType === 'new'){
                const finalData = {
                    name: formValues.name,
                    type: formValues.type,
                    options: formValues.options,
                    input_type: formValues.textInputType,
                    default_value: formValues.defaultVal,
                    date_format: formValues.dateFormatVal,
                    date_default_value: formValues.dateDefaultVal,
                    time_format: formValues.timeFormatVal,
                    time_default_value: formValues.timeDefaultVal,
                    dateTime_format: formValues.dateTimeFormatVal,
                    dateTime_default_value: formValues.dateTimeDefaultVal,
                    required: formValues.required,
                    read_only: formValues.readOnly,
                    duplicate: formValues.allowDuplication,
                    duplicate_with_blank_value: formValues.duplicationWithBlankValue
                }
                if(storage.company_type === 9){
                    await dispatch(CreateDynamicProp({...finalData, asset_type_id: formValues.assetType.asset_type_id, flag: 'asset'}))
                    props.handleClose() 
                }
                else if(storage.company_type === 10){
                    await dispatch(createCustomLeadField({...finalData, flag: 'leads'}))
                    props.handleClose() 
                }
                
            }
            else if(submitType === 'edit'){
                const finalData = {
                    component_id: propId,
                    asset_type_id: formValues.assetType.asset_type_id,
                    name: formValues.name,
                    type: formValues.type,
                    options: formValues.options,
                    input_type: formValues.textInputType,
                    default_value: formValues.defaultVal,
                    date_format: formValues.dateFormatVal,
                    date_default_value: formValues.dateDefaultVal,
                    time_format: formValues.timeFormatVal,
                    time_default_value: formValues.timeDefaultVal,
                    dateTime_format: formValues.dateTimeFormatVal,
                    dateTime_default_value: formValues.dateTimeDefaultVal,
                    required: formValues.required,
                    read_only: formValues.readOnly,
                    duplicate: formValues.allowDuplication,
                    duplicate_with_blank_value: formValues.duplicationWithBlankValue
                }
                await dispatch(editDynamicProp(finalData))
                props.handleClose()
            }
            else if(submitType === 'assetInsuranceNewForm'){
                const finalData = {
                    name: formValues.name,
                    type: formValues.type,
                    property: {
                        options: formValues.options,
                        input_type: formValues.textInputType,
                        default_value: formValues.defaultVal,
                        date_format: formValues.dateFormatVal,
                        date_default_value: formValues.dateDefaultVal,
                        time_format: formValues.timeFormatVal,
                        time_default_value: formValues.timeDefaultVal,
                        dateTime_format: formValues.dateTimeFormatVal,
                        dateTime_default_value: formValues.dateTimeDefaultVal,
                        required: formValues.required,
                        read_only: formValues.readOnly,
                        is_unique: formValues.allowDuplication,
                        unique_with_blank_value: formValues.duplicationWithBlankValue
                    }
                }
                console.log('dynamicProp', finalData)
                await props?.dynamicProp(finalData)
                props.handleClose()
            }
            else if(submitType === 'proDynamicNewForm'){
                const finalData = {
                    name: formValues.name,
                    type: formValues.type,
                    property: {
                        options: formValues.options,
                        input_type: formValues.textInputType,
                        default_value: formValues.defaultVal,
                        date_format: formValues.dateFormatVal,
                        date_default_value: formValues.dateDefaultVal,
                        time_format: formValues.timeFormatVal,
                        time_default_value: formValues.timeDefaultVal,
                        dateTime_format: formValues.dateTimeFormatVal,
                        dateTime_default_value: formValues.dateTimeDefaultVal,
                        required: formValues.required,
                        read_only: formValues.readOnly,
                        is_unique: formValues.allowDuplication,
                        unique_with_blank_value: formValues.duplicationWithBlankValue
                    }
                }
                await props?.dynamicProp(finalData,props?.variation)
                props.handleClose()
            }
        }
        else {
            dispatch(OpenalertActions({ msg : requiredFieldsAlertMessage, severity : 'warning' }))
        }
    }


    return (
        <Container sx={{p: {xs: 3, sm: 4}, pb: 3, minHeight: isSalaryColumnPage ? 300 : 400}}>
            <Typography
                variant='h6'
                align='left'
                sx={{fontWeight: 600, color: 'text.primary', mb: 0.5}}
            >
                {submitType === 'edit' ? 'Edit Custom Fields' : 'New Custom Fields'}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{mb: 3}}>
                Configure a custom field with validation and default value.
            </Typography>
            <Grid container spacing={2.5} sx={{mt: 0}}>
                {props?.type !== 'assetInsuranceNewForm' && props?.type !== 'proDynamicNewForm' && storage.company_type !== 10 ?
                <Grid
                    size={{
                        lg: 4,
                        md: 4,
                        sm: 4,
                        xs: 12
                    }}>
                    <Autocomplete 
                        options={getAssetType?.data || ''}
                        getOptionLabel={(option) => option.asset_type || ''}
                        value={formValues.assetType || ''}   
                        renderInput={(params) => (
                            <TextField 
                                {...params}
                                required
                                variant='filled'
                                label='Asset Type'
                                error={formErrors.assetType !== null}
                                helperText={formErrors.assetType === null ? '' : 'Asset Type is required'}
                            />
                        )}  
                        onChange={(event, val) => handleSelectChange(val, 'assetType')}
                    />
                </Grid> : null
                }
        

                <Grid
                    size={{
                        lg: 4,
                        md: 4,
                        sm: 4,
                        xs: 12
                    }}>
                    <TextField
                        required
                        fullWidth
                        variant='filled'
                        label='Name'
                        value={formValues.name}
                        error={formErrors.name !== null}
                        helperText={formErrors.name === null ? '' : formErrors.name}
                        onChange={(event) => handleTextInput(event.target.value, 'name')}
                    />
                </Grid>

                <Grid
                    size={{
                        lg: 4,
                        md: 4,
                        sm: 4,
                        xs: 12
                    }}>
                    <Autocomplete 
                        options={type}
                        value={isSalaryColumnPage ? getSalaryTypeValue() : formValues.type}
                        renderInput={(params) => (
                            <TextField 
                                {...params}
                                variant='filled'
                                required
                                label='Type'
                                error={formErrors.type !== null}
                                helperText={formErrors.type === null ? '' : 'Type is required'}
                            />
                        )}
                        onChange={(event, val) => handleSelectChange(val, 'type')}
                    />
                </Grid>

                {
                    formValues.type === 'List' ? 
                    <>
                        <Grid
                            size={{
                                lg: 5,
                                md: 4,
                                sm: 4,
                                xs: 12
                            }}>
                                <Autocomplete
                                    multiple
                                    freeSolo
                                    options={[]}
                                    value={formValues.options || []}
                                    onChange={(event, newValue) => {
                                        setFormValues((prev) => ({
                                            ...prev,
                                            options: newValue
                                        }))
                                    }}
                                    sx={{
                                        '& .MuiFilledInput-root': {
                                            flexWrap: 'wrap',
                                            alignItems: 'flex-start',
                                            paddingTop: '22px !important',
                                            paddingBottom: '84px',
                                            minHeight: 54,
                                            rowGap: '6px'
                                        },
                                        '& .MuiFilledInput-root .MuiChip-root': {
                                            mt: '2px'
                                        },
                                        '& .MuiFilledInput-root input': {
                                            paddingTop: '4px',
                                            paddingBottom: '4px'
                                        }
                                    }}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => (
                                            <Chip
                                                label={option}
                                                {...getTagProps({ index })}
                                                sx={{
                                                    backgroundColor: '#e0e0e0',
                                                    color: 'rgba(0, 0, 0, 0.87)',
                                                    fontWeight: 500,
                                                    fontSize: '12px',
                                                    height: '24px',
                                                    borderRadius: '6px',
                                                    mr: 0.5,
                                                    '&:hover': { backgroundColor: '#d5d5d5' },
                                                    '& .MuiChip-deleteIcon': {
                                                        color: 'rgba(0, 0, 0, 0.54)',
                                                        fontSize: '16px',
                                                        '&:hover': { color: 'rgba(0, 0, 0, 0.87)' }
                                                    }
                                                }}
                                            />
                                        ))
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            required
                                            variant='filled'
                                            label='List Options'
                                            placeholder={(formValues.options || []).length === 0 ? 'Type and press Enter' : ''}
                                            error={formErrors.options !== null}
                                            helperText={
                                                formErrors.options === null
                                                    ? 'Press Enter after each option'
                                                    : 'List Options is required'
                                            }
                                        />
                                    )}
                                />
                        </Grid>
                        <Grid
                            size={{
                                lg: 4,
                                md: 4,
                                sm: 4,
                                xs: 12
                            }}>
                            <Autocomplete 
                                options={formValues.options}
                                value={formValues.defaultVal || ''}
                                renderInput={(params) => (
                                    <TextField
                                    {...params}
                                    variant='filled'
                                    label='Default Value'
                                    />
                                )}
                                onChange={(event, val) => handleSelectChange(val, 'defaultVal')}
                            />
                        </Grid>
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
                                        lg: 4,
                                        md: 4,
                                        sm: 4,
                                        xs: 12
                                    }}>
                                    <FormControlLabel 
                                        control={<Checkbox checked={formValues.required} onChange={() => setFormValues({...formValues, required: !formValues.required})} />}
                                        label='Required'
                                        labelPlacement='end'
                                    />
                                </Grid> 
                                <Grid
                                    size={{
                                        lg: 4,
                                        md: 4,
                                        sm: 4,
                                        xs: 12
                                    }}>
                                    <FormControlLabel 
                                        control={<Checkbox checked={formValues.readOnly} onChange={() => setFormValues({...formValues, readOnly: !formValues.readOnly})} />}
                                        label='Read Only'
                                        labelPlacement='end'
                                    />
                                </Grid> 
                            </Grid>
                        </Grid>
                        <Grid
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                            <Typography variant='subtitle2' sx={{ fontWeight: 600, color: 'text.secondary', mt: 1, mb: 0.5 }}>Unique Rule</Typography>
                            <Grid container>
                                <Grid
                                    size={{
                                        lg: 4,
                                        md: 4,
                                        sm: 4,
                                        xs: 12
                                    }}>
                                    <FormControlLabel 
                                        control={<Checkbox checked={formValues.allowDuplication} onChange={() => setFormValues({...formValues, allowDuplication: !formValues.allowDuplication})} />}
                                        label='Allow Duplication'
                                        labelPlacement='end'
                                    />
                                </Grid> 
                                <Grid
                                    size={{
                                        lg: 4,
                                        md: 4,
                                        sm: 4,
                                        xs: 12
                                    }}>
                                    <FormControlLabel 
                                        control={<Checkbox checked={formValues.duplicationWithBlankValue} onChange={() => setFormValues({...formValues, duplicationWithBlankValue: !formValues.duplicationWithBlankValue})} />}
                                        label='Duplication with Blank Value'
                                        labelPlacement='end'
                                    />
                                </Grid> 
                            </Grid>
                        </Grid>
                    </>
                    : formValues.type === 'Text Field' ? 
                    <>
                        {!isSalaryColumnPage && (
                            <Grid
                                size={{
                                    lg: 4,
                                    md: 4,
                                    sm: 4,
                                    xs: 12
                                }}>
                                <Autocomplete 
                                options={['Text', 'Number']}
                                value={formValues.textInputType || ''}
                                renderInput={(params) => (
                                    <TextField 
                                        {...params}
                                        required
                                        variant='filled'
                                        label='Input Type'
                                        error={formErrors.textInputType !== null}
                                        helperText={formErrors.textInputType === null ? '' : 'Input Type is required'}
                                    />
                                )}
                                onChange={(e, val) => handleSelectChange(val, 'textInputType')}
                                />
                            </Grid>
                        )}
                        <Grid
                            size={{
                                lg: 4,
                                md: 4,
                                sm: 4,
                                xs: 12
                            }}>
                            <TextField
                                fullWidth
                                variant='filled'
                                label='Default Value'
                                value={formValues.defaultVal || ''}
                                onChange={(event) => handleTextInput(event.target.value, 'defaultVal')}
                            />
                        </Grid>
                        {!isSalaryColumnPage && <Grid
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                            <Grid container>
                                <Grid
                                    size={{
                                        lg: 4,
                                        md: 4,
                                        sm: 4,
                                        xs: 12
                                    }}>
                                    <FormControlLabel 
                                        control={<Checkbox checked={formValues.required} onChange={() => setFormValues({...formValues, required: !formValues.required})} />}
                                        label='Required'
                                        labelPlacement='end'
                                    />
                                </Grid> 
                                <Grid
                                    size={{
                                        lg: 4,
                                        md: 4,
                                        sm: 4,
                                        xs: 12
                                    }}>
                                    <FormControlLabel 
                                        control={<Checkbox checked={formValues.readOnly} onChange={() => setFormValues({...formValues, readOnly: !formValues.readOnly})} />}
                                        label='Read Only'
                                        labelPlacement='end'
                                    />
                                </Grid> 
                            </Grid>
                        </Grid>}
                        <Grid
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                            <Typography variant='subtitle2' sx={{ fontWeight: 600, color: 'text.secondary', mt: 1, mb: 0.5 }}>Unique Rule</Typography>
                                <Grid container>
                                    <Grid
                                        size={{
                                            lg: 4,
                                            md: 4,
                                            sm: 4,
                                            xs: 12
                                        }}>
                                        <FormControlLabel 
                                            control={<Checkbox checked={formValues.allowDuplication} onChange={() => setFormValues({...formValues, allowDuplication: !formValues.allowDuplication})} />}
                                            label='Allow Duplication'
                                            labelPlacement='end'
                                        />
                                    </Grid> 
                                    <Grid
                                        size={{
                                            lg: 4,
                                            md: 4,
                                            sm: 4,
                                            xs: 12
                                        }}>
                                        <FormControlLabel 
                                            control={<Checkbox checked={formValues.duplicationWithBlankValue} onChange={() => setFormValues({...formValues, duplicationWithBlankValue: !formValues.duplicationWithBlankValue})} />}
                                            label='Duplication with Blank Value'
                                            labelPlacement='end'
                                        />
                                    </Grid>
                                </Grid>
                        </Grid>
                    </>
                    : formValues.type === 'Date' ? 
                    <>
                        <Grid
                            size={{
                                lg: 4,
                                md: 4,
                                sm: 4,
                                xs: 12
                            }}>
                            <Autocomplete 
                                options={dateFormat}
                                value={formValues.dateFormatVal}
                                renderInput={(params) => (
                                    <TextField 
                                        {...params}
                                        variant='filled'
                                        required
                                        label='Date Format'
                                        error={formErrors.dateFormatVal !== null}
                                        helperText={formErrors.dateFormatVal === null ? '' : 'Date Format is required'}
                                    />
                                )}
                                onChange={(event, val) => handleSelectChange(val, 'dateFormatVal')}
                            />
                        </Grid><Grid
                        size={{
                            lg: 4,
                            md: 4,
                            sm: 4,
                            xs: 12
                        }}>
                            <FormControlLabel
                                control={<Checkbox
                                        checked={formValues.dateDefaultVal}
                                        onChange={() => setFormValues({...formValues, dateDefaultVal: !formValues.dateDefaultVal})}
                                    />}
                                label='Default Value'
                                labelPlacement='end'
                            />
                            <Typography variant='body2' color='error'>NOTE: This will set Date field to current date</Typography>
                        </Grid>
                        {!isSalaryColumnPage && <Grid
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                            <Grid container>
                                <Grid
                                    size={{
                                        lg: 4,
                                        md: 4,
                                        sm: 4,
                                        xs: 12
                                    }}>
                                    <FormControlLabel 
                                        control={<Checkbox checked={formValues.required} onChange={() => setFormValues({...formValues, required: !formValues.required})} />}
                                        label='Required'
                                        labelPlacement='end'
                                    />
                                </Grid> 
                                <Grid
                                    size={{
                                        lg: 4,
                                        md: 4,
                                        sm: 4,
                                        xs: 12
                                    }}>
                                    <FormControlLabel 
                                        control={<Checkbox checked={formValues.readOnly} onChange={() => setFormValues({...formValues, readOnly: !formValues.readOnly})} />}
                                        label='Read Only'
                                        labelPlacement='end'
                                    />
                                </Grid> 
                            </Grid>
                        </Grid>}
                        <Grid
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                            <Typography variant='subtitle2' sx={{ fontWeight: 600, color: 'text.secondary', mt: 1, mb: 0.5 }}>Unique Rule</Typography>
                                <Grid container>
                                    <Grid
                                        size={{
                                            lg: 4,
                                            md: 4,
                                            sm: 4,
                                            xs: 12
                                        }}>
                                        <FormControlLabel 
                                            control={<Checkbox checked={formValues.allowDuplication} onChange={() => setFormValues({...formValues, allowDuplication: !formValues.allowDuplication})} />}
                                            label='Allow Duplication'
                                            labelPlacement='end'
                                        />
                                    </Grid> 
                                    <Grid
                                        size={{
                                            lg: 4,
                                            md: 4,
                                            sm: 4,
                                            xs: 12
                                        }}>
                                        <FormControlLabel 
                                            control={<Checkbox checked={formValues.duplicationWithBlankValue} onChange={() => setFormValues({...formValues, duplicationWithBlankValue: !formValues.duplicationWithBlankValue})} />}
                                            label='Duplication with Blank Value'
                                            labelPlacement='end'
                                        />
                                    </Grid>
                                </Grid>
                        </Grid>
                    </>
                    : formValues.type === 'CheckBox' ? 
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
                                        lg: 4,
                                        md: 4,
                                        sm: 4,
                                        xs: 12
                                    }}>
                                    <FormControlLabel 
                                        control={<Checkbox checked={formValues.required} onChange={() => setFormValues({...formValues, required: !formValues.required})} />}
                                        label='Required'
                                        labelPlacement='end'
                                    />
                                </Grid>
                                <Grid
                                    size={{
                                        lg: 4,
                                        md: 4,
                                        sm: 4,
                                        xs: 12
                                    }}>
                                    <FormControlLabel 
                                        control={<Checkbox checked={formValues.readOnly} onChange={() => setFormValues({...formValues, readOnly: !formValues.readOnly})} />}
                                        label='Read Only'
                                        labelPlacement='end'
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                            <Typography variant='subtitle2' sx={{ fontWeight: 600, color: 'text.secondary', mt: 1, mb: 0.5 }}>Unique Rule</Typography>
                                <Grid container>
                                    <Grid
                                        size={{
                                            lg: 4,
                                            md: 4,
                                            sm: 4,
                                            xs: 12
                                        }}>
                                        <FormControlLabel 
                                            control={<Checkbox checked={formValues.allowDuplication} onChange={() => setFormValues({...formValues, allowDuplication: !formValues.allowDuplication})} />}
                                            label='Allow Duplication'
                                            labelPlacement='end'
                                        />
                                    </Grid>
                                    <Grid
                                        size={{
                                            lg: 4,
                                            md: 4,
                                            sm: 4,
                                            xs: 12
                                        }}>
                                        <FormControlLabel 
                                            control={<Checkbox checked={formValues.duplicationWithBlankValue} onChange={() => setFormValues({...formValues, duplicationWithBlankValue: !formValues.duplicationWithBlankValue})} />}
                                            label='Duplication with Blank Value'
                                            labelPlacement='end'
                                        />
                                    </Grid>
                                </Grid>
                        </Grid>
                    </>
                    : formValues.type === 'Radio' ? 
                    <>
                        <Grid
                            size={{
                                lg: 4,
                                md: 4,
                                sm: 4,
                                xs: 12
                            }}>
                            <Autocomplete 
                                multiple
                                options={formValues.options}
                                value={formValues.options || ''} // Set the value to the colors array
                                onChange={handleOptionsChange} // Handle the change event
                                onInputChange={handleInputChange}
                                renderInput={(params) => (
                                    <TextField 
                                        {...params}
                                        required
                                        variant='filled'
                                        label='Options'
                                        onChange={handleInput}
                                        value={inputVal}
                                        onKeyPress={handleInputChange} // Listen for keypress events
                                        error={formErrors.options !== null}
                                        helperText={formErrors.options === null ? '' : formErrors.options}
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
                            <Grid container>
                                <Grid
                                    size={{
                                        lg: 4,
                                        md: 4,
                                        sm: 4,
                                        xs: 12
                                    }}>
                                    <FormControlLabel 
                                        control={<Checkbox checked={formValues.required} onChange={() => setFormValues({...formValues, required: !formValues.required})} />}
                                        label='Required'
                                        labelPlacement='end'
                                    />
                                </Grid>
                                <Grid
                                    size={{
                                        lg: 4,
                                        md: 4,
                                        sm: 4,
                                        xs: 12
                                    }}>
                                    <FormControlLabel 
                                        control={<Checkbox checked={formValues.readOnly} onChange={() => setFormValues({...formValues, readOnly: !formValues.readOnly})} />}
                                        label='Read Only'
                                        labelPlacement='end'
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                            <Typography variant='subtitle2' sx={{ fontWeight: 600, color: 'text.secondary', mt: 1, mb: 0.5 }}>Unique Rule</Typography>
                                <Grid container>
                                    <Grid
                                        size={{
                                            lg: 4,
                                            md: 4,
                                            sm: 4,
                                            xs: 12
                                        }}>
                                        <FormControlLabel 
                                            control={<Checkbox checked={formValues.allowDuplication} onChange={() => setFormValues({...formValues, allowDuplication: !formValues.allowDuplication})} />}
                                            label='Allow Duplication'
                                            labelPlacement='end'
                                        />
                                    </Grid>
                                    <Grid
                                        size={{
                                            lg: 4,
                                            md: 4,
                                            sm: 4,
                                            xs: 12
                                        }}>
                                        <FormControlLabel 
                                            control={<Checkbox checked={formValues.duplicationWithBlankValue} onChange={() => setFormValues({...formValues, duplicationWithBlankValue: !formValues.duplicationWithBlankValue})} />}
                                            label='Duplication with Blank Value'
                                            labelPlacement='end'
                                        />
                                    </Grid>
                                </Grid>
                        </Grid>
                    </>
                    : formValues.type === 'Text Area' ? 
                    <>
                        <Grid
                            size={{
                                lg: 4,
                                md: 4,
                                sm: 4,
                                xs: 12
                            }}>
                            <TextField
                                fullWidth
                                variant='filled'
                                label='Default Value'
                                value={formValues.defaultVal || ''}
                                onChange={(event) => handleTextInput(event.target.value, 'defaultVal')}
                            />
                        </Grid>
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
                                        lg: 4,
                                        md: 4,
                                        sm: 4,
                                        xs: 12
                                    }}>
                                    <FormControlLabel 
                                        control={<Checkbox checked={formValues.required} onChange={() => setFormValues({...formValues, required: !formValues.required})} />}
                                        label='Required'
                                        labelPlacement='end'
                                    />
                                </Grid>
                                <Grid
                                    size={{
                                        lg: 4,
                                        md: 4,
                                        sm: 4,
                                        xs: 12
                                    }}>
                                    <FormControlLabel 
                                        control={<Checkbox checked={formValues.readOnly} onChange={() => setFormValues({...formValues, readOnly: !formValues.readOnly})} />}
                                        label='Read Only'
                                        labelPlacement='end'
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                            <Typography variant='subtitle2' sx={{ fontWeight: 600, color: 'text.secondary', mt: 1, mb: 0.5 }}>Unique Rule</Typography>
                                <Grid container>
                                    <Grid
                                        size={{
                                            lg: 4,
                                            md: 4,
                                            sm: 4,
                                            xs: 12
                                        }}>
                                        <FormControlLabel 
                                            control={<Checkbox checked={formValues.allowDuplication} onChange={() => setFormValues({...formValues, allowDuplication: !formValues.allowDuplication})} />}
                                            label='Allow Duplication'
                                            labelPlacement='end'
                                        />
                                    </Grid>
                                    <Grid
                                        size={{
                                            lg: 4,
                                            md: 4,
                                            sm: 4,
                                            xs: 12
                                        }}>
                                        <FormControlLabel 
                                            control={<Checkbox checked={formValues.duplicationWithBlankValue} onChange={() => setFormValues({...formValues, duplicationWithBlankValue: !formValues.duplicationWithBlankValue})} />}
                                            label='Duplication with Blank Value'
                                            labelPlacement='end'
                                        />
                                    </Grid>
                                </Grid>
                        </Grid>
                    </>
                    : formValues.type === 'Time' ?
                    <>
                        <Grid
                            size={{
                                lg: 4,
                                md: 4,
                                sm: 4,
                                xs: 12
                            }}>
                            <Autocomplete 
                                options={timeFormat}
                                value={formValues.timeFormatVal}
                                renderInput={(params) => (
                                    <TextField 
                                        {...params}
                                        variant='filled'
                                        required
                                        label='Time Format'
                                        error={formErrors.timeFormatVal !== null}
                                        helperText={formErrors.timeFormatVal === null ? '' : 'Time Format is required'}
                                    />
                                )}
                                onChange={(event, val) => handleSelectChange(val, 'timeFormatVal')}
                            />
                        </Grid>
                        <Grid
                            size={{
                                lg: 4,
                                md: 4,
                                sm: 4,
                                xs: 12
                            }}>
                            <FormControlLabel
                                control={<Checkbox
                                        checked={formValues.timeDefaultVal}
                                        onChange={() => setFormValues({...formValues, timeDefaultVal: !formValues.timeDefaultVal})}
                                    />}
                                label='Default Value'
                                labelPlacement='end'
                            />
                            <Typography variant='body2' color='error'>NOTE: This will set Time field to current time</Typography>
                        </Grid>
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
                                        lg: 4,
                                        md: 4,
                                        sm: 4,
                                        xs: 12
                                    }}>
                                    <FormControlLabel 
                                        control={<Checkbox checked={formValues.required} onChange={() => setFormValues({...formValues, required: !formValues.required})} />}
                                        label='Required'
                                        labelPlacement='end'
                                    />
                                </Grid> 
                                <Grid
                                    size={{
                                        lg: 4,
                                        md: 4,
                                        sm: 4,
                                        xs: 12
                                    }}>
                                    <FormControlLabel 
                                        control={<Checkbox checked={formValues.readOnly} onChange={() => setFormValues({...formValues, readOnly: !formValues.readOnly})} />}
                                        label='Read Only'
                                        labelPlacement='end'
                                    />
                                </Grid> 
                            </Grid>
                        </Grid>
                        <Grid
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                            <Typography variant='subtitle2' sx={{ fontWeight: 600, color: 'text.secondary', mt: 1, mb: 0.5 }}>Unique Rule</Typography>
                                <Grid container>
                                    <Grid
                                        size={{
                                            lg: 4,
                                            md: 4,
                                            sm: 4,
                                            xs: 12
                                        }}>
                                        <FormControlLabel 
                                            control={<Checkbox checked={formValues.allowDuplication} onChange={() => setFormValues({...formValues, allowDuplication: !formValues.allowDuplication})} />}
                                            label='Allow Duplication'
                                            labelPlacement='end'
                                        />
                                    </Grid> 
                                    <Grid
                                        size={{
                                            lg: 4,
                                            md: 4,
                                            sm: 4,
                                            xs: 12
                                        }}>
                                        <FormControlLabel 
                                            control={<Checkbox checked={formValues.duplicationWithBlankValue} onChange={() => setFormValues({...formValues, duplicationWithBlankValue: !formValues.duplicationWithBlankValue})} />}
                                            label='Duplication with Blank Value'
                                            labelPlacement='end'
                                        />
                                    </Grid>
                                </Grid>
                        </Grid>
                    </>
                    :formValues.type === 'Date & Time' ?
                    <>
                        <Grid
                            size={{
                                lg: 4,
                                md: 4,
                                sm: 4,
                                xs: 12
                            }}>
                        <Autocomplete 
                                options={dateTimeFormat}
                                value={formValues.dateTimeFormatVal}
                                renderInput={(params) => (
                                    <TextField 
                                        {...params}
                                        variant='filled'
                                        required
                                        label='Time Format'
                                        error={formErrors.dateTimeFormatVal !== null}
                                        helperText={formErrors.dateTimeFormatVal === null ? '' : 'Date & Time Format is required'}
                                    />
                                )}
                                onChange={(event, val) => handleSelectChange(val, 'dateTimeFormatVal')}
                            />
                        </Grid>
                        <Grid
                            size={{
                                lg: 4,
                                md: 4,
                                sm: 4,
                                xs: 12
                            }}>
                            <FormControlLabel
                                control={<Checkbox
                                        checked={formValues.dateTimeDefaultVal}
                                        onChange={() => setFormValues({...formValues, dateTimeDefaultVal: !formValues.dateTimeDefaultVal})}
                                    />}
                                label='Default Value'
                                labelPlacement='end'
                            />
                            <Typography variant='body2' color='error'>NOTE: This will set Date & Time field to current date</Typography>
                        </Grid>
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
                                        lg: 4,
                                        md: 4,
                                        sm: 4,
                                        xs: 12
                                    }}>
                                    <FormControlLabel 
                                        control={<Checkbox checked={formValues.required} onChange={() => setFormValues({...formValues, required: !formValues.required})} />}
                                        label='Required'
                                        labelPlacement='end'
                                    />
                                </Grid> 
                                <Grid
                                    size={{
                                        lg: 4,
                                        md: 4,
                                        sm: 4,
                                        xs: 12
                                    }}>
                                    <FormControlLabel 
                                        control={<Checkbox checked={formValues.readOnly} onChange={() => setFormValues({...formValues, readOnly: !formValues.readOnly})} />}
                                        label='Read Only'
                                        labelPlacement='end'
                                    />
                                </Grid> 
                            </Grid>
                        </Grid>
                        <Grid
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                            <Typography variant='subtitle2' sx={{ fontWeight: 600, color: 'text.secondary', mt: 1, mb: 0.5 }}>Unique Rule</Typography>
                                <Grid container>
                                    <Grid
                                        size={{
                                            lg: 4,
                                            md: 4,
                                            sm: 4,
                                            xs: 12
                                        }}>
                                        <FormControlLabel 
                                            control={<Checkbox checked={formValues.allowDuplication} onChange={() => setFormValues({...formValues, allowDuplication: !formValues.allowDuplication})} />}
                                            label='Allow Duplication'
                                            labelPlacement='end'
                                        />
                                    </Grid> 
                                    <Grid
                                        size={{
                                            lg: 4,
                                            md: 4,
                                            sm: 4,
                                            xs: 12
                                        }}>
                                        <FormControlLabel 
                                            control={<Checkbox checked={formValues.duplicationWithBlankValue} onChange={() => setFormValues({...formValues, duplicationWithBlankValue: !formValues.duplicationWithBlankValue})} />}
                                            label='Duplication with Blank Value'
                                            labelPlacement='end'
                                        />
                                    </Grid>
                                </Grid>
                        </Grid>
                    </>
                    :   <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
                            <Box sx={{ minHeight: 120 }} />
                        </Grid>
                }
                <Grid
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 3, pt: 2 }}>
                        <Grid container gap={1.5} display='flex' justifyContent='flex-end'>
                            <Grid>
                                <Button
                                    variant='outlined'
                                    color='inherit'
                                    onClick={handleClose}
                                    sx={{ textTransform: 'none', borderRadius: 1.5, px: 3 }}
                                >
                                    Cancel
                                </Button>
                            </Grid>
                            <Grid>
                                <Button
                                    variant='contained'
                                    color='primary'
                                    onClick={handleSubmit}
                                    sx={{ textTransform: 'none', borderRadius: 1.5, px: 3, boxShadow: 'none' }}
                                >
                                    {submitType === 'edit' ? 'Save Changes' : 'Create'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );

}

NewDynamicProperties.propTypes = {
    type : PropTypes.string,
    formType : PropTypes.string,
    editData : PropTypes.object,
    handleClose : PropTypes.func,
    closeDialog : PropTypes.func,
    dynamicProp : PropTypes.object,
    variation : PropTypes.object,
    pageType : PropTypes.string
}

export default NewDynamicProperties