import { Grid,
    Button,
    Card,
    Autocomplete,
    TextField,
    Typography,
    Checkbox,
    FormControlLabel,
    IconButton,
    Tooltip,
    Fade
} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { useState, useEffect } from 'react'
import { capitalize } from 'lodash';
import { CreateDynamicProp, ListAssetTimeline, deleteDynamicProp, editDynamicProp, getAllDynamicProp, getAssetTypeIdAction } from 'redux/actions/asset_actions';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import MaterialTable from 'utils/SafeMaterialTable';
import { headerStyle, cellStyle } from 'utils/pageSize';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { createAuditCheckList } from 'redux/actions/audit_actions';

function DynamicProperties(props){
    const assetType = ['IT ASSETS', 'HARDWARE']
    const dispatch = useDispatch()
    const{
        AssetReducers: {
            getAssetType,
            getDynamicProp
        }
    } = useSelector((state) => state)

    const[tableData, setTableData] = useState([])
    const[formValues, setFormValues] = useState({
        assetType: '',
        name: '',
        type: '',
        options: [],
        defaultVal: '',
        dateDefaultVal: null,
        textInputType: '',
        required: false,
        readOnly: false,
        includeReplication: false,
        unique: false,
        uniqueWithBlankValue: false,
        askForUniqueness: false
    })

    const[formErrors, setFormErrors] = useState({
        assetType: null,
        name: null,
        type: null,
        options: null,
        textInputType: null
    })
    const[inputVal, setInputValue] = useState('')
    const[submitType, setSubmitType] = useState('new')
    const[propId, setPropId] = useState(0)
    const[assetTypeId, setAssetTypeId] = useState(0)
    const[pagination, setPagination] = useState({
        numPerPage: 5,
        pageCount: 0
    })

    useEffect(() => {
        dispatch(getAssetTypeIdAction())
    }, [])

    useEffect(()=>{
        const payload = {...pagination}
        dispatch(getAllDynamicProp(payload))
    }, [pagination])

    useEffect(() => { (async () => {
        if(props?.type!=='checkList'){
            setTableData([])
            const tableData = await getDynamicProp.data
            if(tableData?.length > 0){
                const finalTableData = await tableData.map((prop) => ({
                    ...prop,
                    properties: JSON.parse(prop.properties)
                }))
                setTableData((prev) => [...prev, ...finalTableData])
            }
        }
    })();
}, [getDynamicProp])

    const type=['List', 'Text Field', 'Date', 'CheckBox', 'Radio', 'Text Area']

    const handleDelete = (id) => {
        dispatch(deleteDynamicProp(id))
    }

    const handleEdit = (row) => {
        setFormValues((prev) => ({
            ...prev,
            assetType: getAssetType.filter((type) => type.asset_type === row.asset_type)[0],
            name: row.name || '',
            type: row.type || '',
            options: row.properties ? row.properties.options : [],
            defaultVal: row.properties ? row.properties.default_value ? row.properties.default_value : '' : '',
            dateDefaultVal: row.properties ? row.properties.date_default_value ? row.properties.date_default_value: null : null,
            textInputType: row.properties ? row.properties.input_type :'',
            required: row.properties ? row.properties.required : false,
            readOnly: row.properties ? row.properties.read_only : false,
            includeReplication: row.properties ? row.properties.include_replication : false,
            unique: row.properties ? row.properties.is_unique : false,
            uniqueWithBlankValue: row.properties ? row.properties.unique_with_blank_value : false,
            askForUniqueness: row.properties ? row.properties.ask_for_uniqueness : false
        }))
        setAssetTypeId(row.asset_type_id)
        setSubmitType('edit')
        setPropId(row.prop_id)
    }

    const handlePageChange = (page) => {
        setPagination({
            ...pagination,
            pageCount: page
        })
    }

    const handlePageSizeChange = (size) => {
        setPagination({
            ...pagination,
            numPerPage: size
        })
    }

    const handleSelectChange = (val, name) => {
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
                [name]: name === 'Asset Type' ? 'Asset Type is Required' : 'Input Type is Required'
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
        setInputValue(event.target.value);
    };

    const handleDateChange = (date) => {
        setFormValues({
            ...formValues,
            dateDefaultVal: date
        })
    }

    const handleTextInput = (val, name) => {
        if(val !== null && val !== ''){
            setFormValues({
                ...formValues,
                name: val
            })
            setFormErrors({
                ...formErrors,
                name: null
            })
        }
        else{
            setFormValues({
                ...formValues,
                name: null
            })
            setFormErrors({
                ...formErrors,
                name: `${capitalize(name)} is Required`
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

    const handleSubmit = async (event) => {
        event.preventDefault()
        let isValid = true
        let formErrorsObj = {...formErrors}
        
        
        if(formValues.type === 'List' || formValues.type === 'Radio'){
            let requiredFields = ['assetType', 'name', 'type', 'options']
            await Object.keys(formValues).map((key, i) => {
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
            let requiredFields = ['assetType', 'name', 'type', 'textInputType']
            await Object.keys(formValues).map((key, i) => {
                if (requiredFields.includes(key) && (formValues[key] === null || formValues[key] === 'null' || formValues[key] === '')){
                    isValid = false
                    formErrorsObj[key] = capitalize(key) + ' is Required'
                } 
            })
        }
        else{
            let requiredFields = ['assetType', 'name', 'type']
            await Object.keys(formValues).map((key, i) => {
                if (requiredFields.includes(key) && (formValues[key] === null || formValues[key] === 'null' || formValues[key] === '')){
                    isValid = false
                    formErrorsObj[key] = capitalize(key) + ' is Required'
                } 
            })
        }
        
        await setFormErrors(formErrorsObj)

        if(isValid){
            if(submitType === 'new'){
                const finalData = {
                    asset_type_id: formValues.assetType.asset_type_id,
                    name: formValues.name,
                    type: formValues.type,
                    property: {
                        options: formValues.options,
                        input_type: formValues.textInputType,
                        default_value: formValues.defaultVal,
                        date_default_value: formValues.dateDefaultVal,
                        required: formValues.required,
                        read_only: formValues.readOnly,
                        include_replication: formValues.includeReplication,
                        is_unique: formValues.unique,
                        unique_with_blank_value: formValues.uniqueWithBlankValue,
                        ask_for_uniqueness: formValues.askForUniqueness,
                    }
                }
                if(props?.type !== 'checkList'){
                    dispatch(CreateDynamicProp(finalData))
                    props.handleClose()
                }
                else{
                    // console.log('submitData', {...finalData, asset_id: props?.assetId, timeline_message:`Checklist created for ${formValues.assetType.asset_type }`})
                    dispatch(createAuditCheckList({...finalData, asset_id: props?.assetId, timeline_message:`Checklist created for ${formValues.assetType.asset_type }`}))
                    dispatch(ListAssetTimeline())
                    props.closeDialog(false)
                }
                
            }
            else if(submitType === 'edit'){
                const finalData = {
                    prop_id: propId,
                    asset_type_id: formValues.assetType.asset_type_id,
                    name: formValues.name,
                    type: formValues.type,
                    property: {
                        options: formValues.options,
                        input_type: formValues.textInputType,
                        default_value: formValues.defaultVal,
                        date_default_value: formValues.dateDefaultVal,
                        required: formValues.required,
                        read_only: formValues.readOnly,
                        include_replication: formValues.includeReplication,
                        is_unique: formValues.unique,
                        unique_with_blank_value: formValues.uniqueWithBlankValue,
                        ask_for_uniqueness: formValues.askForUniqueness,
                    }
                }
                dispatch(editDynamicProp(finalData))
                props.handleClose()
            }
        }

    }

    // Table Columns
    const columns = [
        {
            field: 'asset_type',
            title: 'Asset Type'
        },
        {
            field: 'name',
            title: 'Name'
        },
        {
            field: 'type',
            title: 'Type'
        },
        {
            field: 'created_at',
            title: 'Created On',
            render: (rowData) => {
                const date = rowData.created_at.split(' ');
                return date[0]
            }

        },
        {
            title: 'Actions',
            render: (rowData) => (
                <>
                <Grid container>
                    <Grid>
                        <Tooltip title='Edit'
                                TransitionComponent={Fade}
                                TransitionProps={{timeout: 600}}
                                placement='top'
                        >
                            <IconButton onClick={() => handleEdit(rowData)}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                    <Grid>
                        <Tooltip title='Delete'
                                TransitionComponent={Fade}
                                TransitionProps={{timeout: 600}}
                                placement='top'
                        >
                            <IconButton onClick={() => handleDelete(rowData.prop_id)}>
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Grid>
                </>
            )
        }
    ]

    return (
        <>
            <Card sx={{p: 5}}>
                <Typography>{props?.type === 'checkList' ? 'Audit CheckList' : submitType === 'edit' ? 'Edit Dynamic Property' : 'New Dynamic Property'}</Typography>
                <Grid container spacing={2} sx={{mt: 2}}>

                    <Grid
                        size={{
                            lg: 4,
                            md: 4,
                            sm: 4,
                            xs: 12
                        }}>
                        <Autocomplete 
                            options={getAssetType}
                            getOptionLabel={(option) => option.asset_type || ''}
                            value={formValues.assetType || ''}   
                            renderInput={(params) => (
                                <TextField 
                                    {...params}
                                    required
                                    variant='filled'
                                    label='Asset Type'
                                    error={formErrors.assetType === null ? false : true}
                                    helperText={formErrors.assetType === null ? '' : 'Asset Type is required'}
                                />
                            )}  
                            onChange={(event, val) => handleSelectChange(val, 'assetType')}
                        />
                    </Grid>

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
                            error={formErrors.name === null ? false : true}
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
                            value={formValues.type}
                            renderInput={(params) => (
                                <TextField 
                                    {...params}
                                    variant='filled'
                                    required
                                    label='Type'
                                    error={formErrors.type === null ? false : true}
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
                                        label='List Options'
                                        onChange={handleInput}
                                        value={inputVal}
                                        onKeyPress={handleInputChange} // Listen for keypress events
                                        error={formErrors.options === null ? false : true}
                                        helperText={formErrors.options === null ? '' : 'List Options is required'}
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
                                            labelPlacement='start'
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
                                            labelPlacement='start'
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
                                            control={<Checkbox checked={formValues.includeReplication} onChange={() => setFormValues({...formValues, includeReplication: !formValues.includeReplication})} />}
                                            label='Include in Replication'
                                            labelPlacement='start'
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
                                <Typography variant='h6'>Unique Rule</Typography>
                                <Grid container>
                                    <Grid
                                        size={{
                                            lg: 4,
                                            md: 4,
                                            sm: 4,
                                            xs: 12
                                        }}>
                                        <FormControlLabel 
                                            control={<Checkbox checked={formValues.unique} onChange={() => setFormValues({...formValues, unique: !formValues.unique})} />}
                                            label='Is Unique'
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
                                            control={<Checkbox checked={formValues.uniqueWithBlankValue} onChange={() => setFormValues({...formValues, uniqueWithBlankValue: !formValues.uniqueWithBlankValue})} />}
                                            label='Unique with Blank Value'
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
                                            control={<Checkbox checked={formValues.askForUniqueness} onChange={() => setFormValues({...formValues, askForUniqueness: !formValues.askForUniqueness})} />}
                                            label='Ask for Uniqueness'
                                            labelPlacement='end'
                                        />
                                    </Grid> 
                                </Grid>
                            </Grid>
                        </>
                        : formValues.type === 'Text Field' ? 
                        <>
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
                                        error={formErrors.textInputType === null ? false : true}
                                        helperText={formErrors.textInputType === null ? '' : 'Input Type is required'}
                                    />
                                )}
                                onChange={(e, val) => handleSelectChange(val, 'textInputType')}
                                />
                            </Grid>
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
                                            labelPlacement='start'
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
                                            labelPlacement='start'
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
                                <Typography variant='h6'>Unique Rule</Typography>
                                    <Grid container>
                                        <Grid
                                            size={{
                                                lg: 4,
                                                md: 4,
                                                sm: 4,
                                                xs: 12
                                            }}>
                                            <FormControlLabel 
                                                control={<Checkbox checked={formValues.unique} onChange={() => setFormValues({...formValues, unique: !formValues.unique})} />}
                                                label='Is Unique'
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
                                                control={<Checkbox checked={formValues.uniqueWithBlankValue} onChange={() => setFormValues({...formValues, uniqueWithBlankValue: !formValues.uniqueWithBlankValue})} />}
                                                label='Unique with Blank Value'
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
                                                control={<Checkbox checked={formValues.askForUniqueness} onChange={() => setFormValues({...formValues, askForUniqueness: !formValues.askForUniqueness})} />}
                                                label='Ask for Uniqueness'
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
                                <LocalizationProvider dateAdapter={DateAdapter}>
                                    <DatePicker 
                                        label='Default Date'
                                        value={formValues.dateDefaultVal}
                                        onChange={(e) => {
                                            if(e?._d){
                                                handleDateChange(moment(e._d).format('YYYY-MM-DD'))
                                            }
                                            else{
                                                setFormValues({...formValues, dateDefaultVal: null})
                                            }
                                        }}
                                        slotProps={{ textField: { fullWidth: true, variant: 'filled', onKeyDown: (e) => e.preventDefault() } }}
                                    />
                                </LocalizationProvider>
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
                                            labelPlacement='start'
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
                                            labelPlacement='start'
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
                                }}></Grid>
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
                                            error={formErrors.options === null ? false : true}
                                            helperText={formErrors.options === null ? '' : formErrors.options}
                                        />
                                    )}
                                />
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
                                            labelPlacement='start'
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
                                            labelPlacement='start'
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
                                <Typography variant='h6'>Unique Rule</Typography>
                                    <Grid container>
                                        <Grid
                                            size={{
                                                lg: 4,
                                                md: 4,
                                                sm: 4,
                                                xs: 12
                                            }}>
                                            <FormControlLabel 
                                                control={<Checkbox checked={formValues.unique} onChange={() => setFormValues({...formValues, unique: !formValues.unique})} />}
                                                label='Is Unique'
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
                                                control={<Checkbox checked={formValues.uniqueWithBlankValue} onChange={() => setFormValues({...formValues, uniqueWithBlankValue: !formValues.uniqueWithBlankValue})} />}
                                                label='Unique with Blank Value'
                                                labelPlacement='end'
                                            />
                                        </Grid>
                                        <Grid
                                            size={{
                                                lg: 4,
                                                md: 4,
                                                sm: 4,
                                                xs: 4
                                            }}>
                                            <FormControlLabel 
                                                control={<Checkbox checked={formValues.askForUniqueness} onChange={() => setFormValues({...formValues, askForUniqueness: !formValues.askForUniqueness})} />}
                                                label = 'Ask for Uniqueness'
                                                labelPlacement='end'
                                            />
                                        </Grid>
                                    </Grid>
                            </Grid>
                        </>
                        : null

                    }

                    <Grid
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                        <Grid container gap={2} display='flex' justifyContent='end'>
                            <Grid>
                                <Button variant='contained' color='error' onClick={handleClose}>Cancel</Button>
                            </Grid>
                            <Grid>
                                <Button variant='contained' onClick={handleSubmit}>Submit</Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Card>
            { props?.type !== 'checkList' && 
                <Card sx={{mt: 2}}>
                <MaterialTable
                    title='Dynamic Properties'
                    columns={columns} 
                    data={tableData}
                    options={{
                        headerStyle,
                        cellStyle,
                        pageSizeOptions: [5, 10, 20],
                        filtering: false,
                        pageSize: pagination.numPerPage,
                        actionsColumnIndex: -1,
                        paging: true,
                        search: false
                    }}
                    totalCount={getDynamicProp.numCount}
                    page={pagination.pageCount}
                    onPageChange={(page) => handlePageChange(page)}
                    onRowsPerPageChange={(size) => handlePageSizeChange(size)}
                >
                </MaterialTable>    
            </Card>}
        </>
    );

}

export default DynamicProperties
