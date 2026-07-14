import {
    Alert,
    Autocomplete,
    Button,
    Card,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Icon,
    IconButton,
    InputAdornment,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from '@mui/material'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import { useContext, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { debounce, includes, set } from 'lodash'
import LotNumberDialog from '../lotNumberDialog'
import { getSalesCustomersByIdAction, getSearchByCustomerAction, getSearchByCustomersDataAction, listCustomerAction, setSearchByCustomersDataAction } from 'redux/actions/customer_actions'
import { listStockLocationSequenceAction } from 'redux/actions/stock_Location_actions'
import { createDefectCollectionAction, editDefectCollectionAction, getDefectCollectionSequenceAction, getInvoiceByCustomerAction, getLotsDetailsForDefectsAction, getProductsByInvoiceAction, getCollectedDefectByIdAction, getProductByCustomerAction, getInvoicesByProductAction, setInvoiceByProductAction, setSearchCollectedDefectsAction, getSearchCollectedDefectsAction } from 'redux/actions/defects_actions'
import { OpenalertActions } from 'redux/actions/alert_actions'
import { requiredFieldsAlertMessage, searchErrorMessage } from 'utils/content'
import PropTypes from 'prop-types'
import moment from 'moment'
import LocationAlert from 'pages/assets/alert/LocationAlert';
import { Helmet } from 'react-helmet-async'
import { UploadFile } from '@mui/icons-material'
import { listProductAction, listProductActionByType } from 'redux/actions/product_actions'
import AttachmentField from 'pages/common/Timesheet/Attachment'
import SearchIcon from '@mui/icons-material/Search';
import apiCalls from 'utils/apiCalls'
import { getsessionStorage } from 'pages/common/login/cookies'
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper'

function CollectDefects(props) {

    const { headerLocationId, commoncookie, selectData, setLoaderStatusHandler, setModalTypeHandler, setModalStatusHandler, setselectData } = useContext(CreateNewButtonContext)
    const dispatch = useDispatch()
    const storage = getsessionStorage()
    const customerInputRef = useRef(null)
    const {
        customerReducer: { customer },
        stockLocationReducer: { stocklocation },
        defectReducers : { invoiceByCustomer, productByInvoice, defectCollectionSequence, collectedDefectById, productByCustomer, invoiceByProduct },
        productReducer : { productByType: product },
        rbacReducer: { menuAccess }
    } = useSelector(state => state)

    const [formValues, setFormValues] = useState({
        customer: null,
        reference: null,
        reason: null,
        defectiveItems: []
    })
    const [formErrors, setFormErrors] = useState({
        customer: null,
        reason: null,
        defectiveItems: null
    })
    const [lotNumberSearch, setLotNumberSearch] = useState(null)
    const [lotNumberMessage, setLotNumberMessage] = useState({ success: false, error: false, message: '' })
    const [currentQuantity, setCurrentQuantity] = useState(0)
    const [currentLots, setCurrentLots] = useState([])
    const [rowDataForViewSerialNumber, setRowDataForViewSerialNumber] = useState(null)
    const [viewSerialNumberDialog, setViewSerialNumberDialog] = useState(false)
    const [deleteIndex, setDeleteIndex] = useState(null)
    const [deleteDialog, setDeleteDialog] = useState(false)
    const [lotNumberData, setLotNumberData] = useState(null)
    const [lotNumberDialog, setLotNumberDialog] = useState(false)
    const [locationAlert, setLocationAlert] = useState(false)
    const [uploadProofOfPurchaseOpen, setUploadProofOfPurchaseOpen] = useState(false)
    const [invoiceOptions, setInvoiceOptions] = useState(invoiceByProduct)
    const [selectedAttachment, setSelectedAttachment] = useState([])
    const [filteredProduct, setFilteredProduct] = useState([])
    const [customerSearchText, setCustomerSearchText] = useState('')
    
    const debouncedGetLotDetails = useRef(
        debounce((searchValue, customer_id, response) => {
            const payload = {
                lot_number: searchValue,
                customer_id: customer_id,
                calledFrom: 'commonDefectsLotSearch'
            }
            dispatch(getLotsDetailsForDefectsAction(payload, response))
        }, 300)
    ).current

    const requiredFields = ['customer']
    const tempInsert = {
        item_id: '',
        name: '',
        quantity: '',
        line: formValues.defectiveItems.length + 1,
        is_serialized: '',
        lots: [],
        item_cost_price: 0,
        item_unit_price: 0,
        available_quantity: '',
        description: '',
        sale_id: '',
        invoice_number: '',
        location_id: '',
        quantity_error_msg: '',
        quantity_error: false,
        proofOfPurchase: []
    }

    useEffect(() => {
        setFormValues((prev) => ({ ...prev, defectiveItems: [{ ...tempInsert, line: 1 }] }))
        // dispatch(listCustomerAction(setModalTypeHandler, setLoaderStatusHandler))
        // dispatch(listStockLocationSequenceAction({ sequence_type: ['SO', 'DC'] }, null, commoncookie, 'null'))
        dispatch(getDefectCollectionSequenceAction())
        dispatch(setInvoiceByProductAction([]))
        dispatch(listProductActionByType('collectDefect'))
        dispatch(setSearchByCustomersDataAction([]))

        setTimeout(() => {
            if (customerInputRef.current) {
                customerInputRef.current.focus()
            }
        }, 300)
    }, [])

    useEffect(() => {
        if(product.length > 0){
            if(headerLocationId === 'null'){
                setFilteredProduct(product)
            }
            else{
                setFilteredProduct(product.filter(d => (d.item_qty?.length ?? 0) > 0 ? d?.item_qty?.some(i => i.location_id == headerLocationId) : true))
            }
        }
        else{
            setFilteredProduct([])
        }
    }, [product, headerLocationId])

    useEffect(() => {
        setInvoiceOptions(invoiceByProduct)
    }, [invoiceByProduct])

    // useEffect(() => {
    //     if (formValues.customer !== null) {
    //         const customer_id = formValues.customer.customer_id
    //         // const location_id = formValues.location.location_id
    //         // dispatch(getInvoiceByCustomerAction(customer_id, location_id, setModalTypeHandler, setLoaderStatusHandler))
    //         // dispatch(getProductByCustomerAction(customer_id, setModalTypeHandler, setLoaderStatusHandler))
    //     }
    // }, [formValues.customer])

    useEffect(() => {
        if (props.status === 'edit' && Object.keys(props.editData).length > 0) {
            dispatch(getCollectedDefectByIdAction(props.editData.collection_id))
        }
    }, [props.editData, props.status])

    useEffect(() => {
        if(filteredProduct.length > 0){
            if(formValues.customer !== null){
                const itemIds = filteredProduct.map(d => d.item_id)
                const payload = {
                    item_id: itemIds,
                    type: 'customer',
                    id: formValues.customer.customer_id
                }
                dispatch(getInvoicesByProductAction(payload))
            }
        }
    }, [filteredProduct, formValues.customer])

    useEffect(() => {
        if(collectedDefectById.length > 0 && customer.length > 0 && props.status === 'edit'){
            const collection = collectedDefectById.find(d => d.collection_id === props.editData.collection_id)
            if(collection && Object.keys(collection).length > 0){
                const editCustomer = customer.find(d => d.customer_id === collection.customer_id)
                setCustomerSearchText(props.editData.company_name)
                setFormValues((prev) => ({ ...prev, customer: editCustomer, reference: collection.reference, reason: collection.reason }))
            }
        }
    }, [props.status, collectedDefectById, customer, props.editData])

    useEffect(() => {
        if (filteredProduct.length > 0 && collectedDefectById.length > 0 && customer.length > 0 && props.status === 'edit' && invoiceByProduct.length > 0) {
            const collection = collectedDefectById.find(d => d.collection_id === props.editData.collection_id)
            if(collection && Object.keys(collection).length > 0){
                const collectedItems = collection.collect_defects_items.map((d, i) => {
                    if(!invoiceByProduct.includes(d.invoice_number)){
                        setInvoiceOptions((prev) => ([ ...prev, { item_id: d.item_id, invoice_number: d.invoice_number } ]))
                    }
                    const selectedProduct = filteredProduct.find(p => p.item_id === d.item_id)
                    const lots = d.collectDefectsLots.map(lot => ({
                        lot_id: lot.lot_id,
                        lot_number: lot.lot_number,
                        trans_items_cost_price: d.item_cost_price
                    }))
                    return {
                        item_id: d.item_id,
                        name: d.name,
                        quantity: d.actual_quantity,
                        line: i + 1,
                        is_serialized: selectedProduct?.is_serialized ?? d?.is_serialized ?? lots.length > 0 ? 1 : 0,
                        lots: lots,
                        item_cost_price: d.item_cost_price,
                        item_unit_price: d.item_unit_price,
                        available_quantity: selectedProduct?.quantity ?? d?.quantity ?? lots.length,
                        description: d.description,
                        sale_id: d.sale_id,
                        invoice_number: d.invoice_number,
                        location_id: d.location_id,
                        proofOfPurchase: d.imageUrl ?? [],
                        proofOfPurchseImageKey: d.proofOfPurchase ? JSON.parse(d.proofOfPurchase) : []
                    }
                })
                setFormValues((prev) => ({ ...prev, defectiveItems: collectedItems }))
            }
        }
    }, [productByCustomer, collectedDefectById, customer, props.editData, invoiceByProduct, filteredProduct])

    useEffect (() => {
        if (selectData.NewCustomer === true) {     
            const filter = [...customer.filter(d => d.company_name !== null && d.company_name !== '' && d.customer_id && d.customer_type === '1')]
            const popc = filter[0]
            handleChange('customer',  popc)
            setModalStatusHandler(false)
            setselectData('NewCustomer', false)
        }
    },[selectData.NewCustomer, customer])

    useEffect(() => {
        if (selectData.product) {
            const filter = [...filteredProduct]
            const pop = filter.shift()
            const updatedDefectiveItems = formValues.defectiveItems.map(d => {
                if(d.item_id === ''){
                    return {
                        ...d,
                        item_id: pop.item_id,
                        name: pop.name,
                        quantity: 1,
                        is_serialized: pop.is_serialized,
                        lots: [],
                        item_cost_price: pop.item_cost_price,
                        item_unit_price: pop.item_unit_price,
                        available_quantity: pop.quantity,
                        description: pop.description ?? '',
                        sale_id: '',
                        invoice_number: '',
                    }
                }
                else{
                    return d
                }
            })
            setFormValues((prev) => ({ ...prev, defectiveItems: updatedDefectiveItems }))
            setModalStatusHandler(false)
            setselectData('product', false)
        }
    }, [selectData.product])
    
    // useEffect(() => {
    //     if (props.status === 'new') {
    //         if (headerLocationId !== 'null') {
    //             const location = stocklocation.find(d => d.location_id === headerLocationId)
    //             setFormValues((prev) => ({ ...prev, location: location }))
    //         }
    //         else {
    //             setFormValues((prev) => ({ ...prev, location : null }))
    //         }
    //     }
    // }, [headerLocationId, props.status])

    const handleChange = (name, value) => {
        setFormValues((prev) => ({ ...prev, [name]: value }))

        if ((value === null || value === '' || value === 'null') && requiredFields.includes(name)) {
            setFormErrors((prev) => ({ ...prev, [name]: 'required' }))
        }
        else {
            setFormErrors((prev) => ({ ...prev, [name]: null }))
        }
    }

    const handleLotNumberSearch = (value, addNewLine, index) => {
        if (value !== '') {
            if(formValues.customer === null){
                setLotNumberMessage({ success: false, error: true, message: 'Please select customer' })
                return
            }

            if (!formValues.defectiveItems.some(item => item.lots && item.lots.some(lot => lot.lot_number === value))) {
                debouncedGetLotDetails(value, formValues.customer.customer_id, (response) => {
                    if(response?.status === 'Already Lot Exist in Defect'){
                        setLotNumberMessage({ success: false, error: true, message: 'Already Lot Exist in Defect' })
                        return
                    }

                    if (response.length > 0) {
                        if(response[0].item_id === null){
                            setLotNumberMessage({ success: false, error: true, message: 'Invalid Lot Number' })
                            return
                        }

                        if (formValues.defectiveItems.some(item => item.item_id === response[0].item_id && item.sale_id === '')) {
                            const product = formValues.defectiveItems.find(item => item.item_id === response[0].item_id && item.sale_id === '')
                            const newQuantity = 1
                            const updatedItem = {
                                ...product,
                                quantity: newQuantity,
                                sale_id: response[0].sale_id,
                                invoice_number: response[0].invoice_number,
                                item_unit_price: (response[0]?.item_unit_price || 0) + (response[0]?.tax_amount || 0),
                                location_id: response[0].location_id,
                                lots: [{
                                    lot_number: value,
                                    lot_id: response[0].lot_id,
                                    trans_items_cost_price: response[0].trans_items_cost_price,
                                    item_id: response[0].item_id
                                }]
                            }
                            const updatedDefectiveItems = formValues.defectiveItems.map((item) => {
                                if (item.item_id === response[0].item_id && item.sale_id === '') {
                                    return updatedItem
                                }
                                else {
                                    return item
                                }
                            })
                            setFormValues((prev) => ({ ...prev, defectiveItems: updatedDefectiveItems }))
                        }
                        else if (formValues.defectiveItems.some(item => item.item_id === response[0].item_id && item.sale_id === response[0].sale_id)) {
                            const product = formValues.defectiveItems.find(item => item.item_id === response[0].item_id && item.sale_id === response[0].sale_id)
                            const newQuantity = product.lots.length + 1
                            const updatedItem = {
                                ...product,
                                quantity: newQuantity,
                                sale_id: response[0].sale_id,
                                invoice_number: response[0].invoice_number,
                                item_unit_price: (response[0]?.item_unit_price || 0) + (response[0]?.tax_amount || 0),
                                location_id: response[0].location_id,
                                lots: [...product.lots, {
                                    lot_number: value,
                                    lot_id: response[0].lot_id,
                                    trans_items_cost_price: response[0].trans_items_cost_price,
                                    item_id: response[0].item_id
                                }],
                                available_quantity: response[0].quantity
                            }
                            const updatedDefectiveItems = formValues.defectiveItems.map((item) => {
                                if (item.item_id === response[0].item_id && item.sale_id === response[0].sale_id) {
                                    return updatedItem
                                }
                                else {
                                    return item
                                }
                            })
                            setFormValues((prev) => ({ ...prev, defectiveItems: updatedDefectiveItems }))
                        }
                        else {
                            const newItem = {
                                item_id: response[0].item_id,
                                name: response[0].name,
                                quantity: 1,
                                line: formValues.defectiveItems.length + 1,
                                is_serialized: response[0].is_serialized,
                                item_cost_price: response[0].item_cost_price,
                                item_unit_price: (response[0]?.item_unit_price || 0) + (response[0]?.tax_amount || 0),
                                available_quantity: response[0].quantity,
                                description: response[0].description ?? '',
                                sale_id: response[0].sale_id,
                                invoice_number: response[0].invoice_number,
                                location_id: response[0].location_id,
                                proofOfPurchase: [],
                                lots: [{
                                    lot_number: value,
                                    lot_id: response[0].lot_id,
                                    trans_items_cost_price: response[0].trans_items_cost_price,
                                    item_id: response[0].item_id
                                }],
                            }
                            const emptyNameIndex = formValues.defectiveItems.findIndex(d => d.name === '')
                            if (emptyNameIndex !== -1) {
                                const updatedDefectiveItems = formValues.defectiveItems.map((item, i) => {
                                    if (i === emptyNameIndex) {
                                        return { ...newItem, line: emptyNameIndex }
                                    }
                                    else {
                                        return item
                                    }
                                })
                                if (addNewLine) {
                                    setFormValues((prev) => ({ ...prev, defectiveItems: [...updatedDefectiveItems, tempInsert] }))
                                    setTimeout(() => {
                                        document.querySelector(`[name="quantity${index}"]`)?.focus()
                                    }, 100)
                                }
                                else {
                                    setFormValues((prev) => ({ ...prev, defectiveItems: updatedDefectiveItems }))
                                }
                            }
                            else {
                                setFormValues((prev) => ({ ...prev, defectiveItems: [ ...prev.defectiveItems, newItem ] }))
                            }
                        }
                        setLotNumberMessage({ success: true, error: false, message: 'Added Successfully!' })
                        setTimeout(() => {
                            setLotNumberSearch('')
                            setLotNumberMessage({ success: false, error: false, message: '' })
                        }, 500)
                    }
                    else {
                        setLotNumberMessage({ success: false, error: true, message: !formValues.defectiveItems.some(item => item.lots.some(lot => lot.lot_number === value)) ? 'Invalid Lot Number!' : 'Lot Number Already Entered' })
                    }
                })
            }
            else {
                setLotNumberMessage({ success: false, error: true, message: 'Lot Number Already Entered' })
            }
        }
    }

    const handleViewSerialNumber = (item) => {
        setRowDataForViewSerialNumber(item)
        setViewSerialNumberDialog(true)
    }

    const handleViewSerialNumberClose = () => {
        setViewSerialNumberDialog(false)
        setRowDataForViewSerialNumber(null)
    }

    const handleDeleteDialogOpen = (index) => {
        setDeleteIndex(index)
        setDeleteDialog(true)
    }

    const handleDeleteDialogClose = () => {
        setDeleteDialog(false)
        setDeleteIndex(null)
    }

    const deleteProductRowData = (index) => {
        if (formValues.defectiveItems.length > 1) {
            const updatedDefectiveItems = [...formValues.defectiveItems]
            updatedDefectiveItems.splice(index, 1)
            setFormValues((prev) => ({ ...prev, defectiveItems: updatedDefectiveItems }))
            handleDeleteDialogClose()
        }
    }

    const handleLotNumberDialog = async(data) => {
        await setLotNumberData(data)
        setLotNumberDialog(true)
    }

    const handleLotNumberDialogClose = () => {
        setLotNumberDialog(false)
        setLotNumberData(null)
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        let isValid = true
        const formErrorObj = { ...formErrors }

        Object.keys(formValues).forEach(key => {
            if (requiredFields.includes(key) && (formValues[key] === null || formValues[key] === '' || formValues[key] === 'null')){
                isValid = false
                formErrorObj[key] = 'required'
            }

            if (key === 'defectiveItems' && formValues.defectiveItems.some(item => item.name === '')) {
                isValid = false
                formErrorObj[key] = 'required'
            }
        })

        if (isValid) {
            if(headerLocationId === 'null'){
                setLocationAlert(true)
                return
            }

            const payload = {
                customer_id: formValues.customer.customer_id,
                reference: formValues.reference,
                location_id: headerLocationId,
                reason: formValues.reason,
                defectiveItems: formValues.defectiveItems,
                total: formValues.defectiveItems.reduce((sum, list) => sum + (Number(list.item_unit_price) * Number(list.quantity)), 0)
            }
            if (props.status === 'edit') {
                dispatch(editDefectCollectionAction({ ...payload, collection_id: props.editData.collection_id }, setModalTypeHandler, setLoaderStatusHandler, async (response) => {
                    const res = await response
                    if (res.status === 200) {
                        props.handleClose(true)
                    }
                }))
            }
            else {
                dispatch(createDefectCollectionAction(payload, setModalTypeHandler, setLoaderStatusHandler, async (response) => {
                    const res = await response
                    if (res.status === 200) {
                        props.handleCollectionClick(event, {collection_id: response.data.masterinsert.insertId})
                        const payload = {
                            page: 0,
                            numPerPage: props.pagination.numPerPage,
                            searchString: '',
                            from: props.filter.fromDate,
                            to: props.filter.toDate,
                            min_price: props.filter.min_price,
                            max_price: props.filter.max_price,
                            brand: props.filter.brand,
                            category: props.filter.category,
                            location_id: headerLocationId
                        }
                        dispatch(setSearchCollectedDefectsAction({ data: [], numRows: 0 }))
                        dispatch(getSearchCollectedDefectsAction(payload, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
                        // props.handleClose(true)
                    }
                }))
            }
        }
        else {
            dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
        }
    }

    const getInvoiceOptions = (item_id, invoice_number) => {
        const usedInvoice = formValues.defectiveItems.filter (d => d.item_id === item_id && d.invoice_number !== '' && d.invoice_number !== invoice_number).map(d => d.invoice_number)
        const filteredInvoice = invoiceOptions.filter(d => d.item_id === item_id && d.invoice_number !== null && (!usedInvoice.includes(d.invoice_number) || d.invoice_number === invoice_number))
        return filteredInvoice
    }

    const handleUploadDialog = (value, data) => {
        setLotNumberData(data)
        setSelectedAttachment(data?.proofOfPurchase ?? [])
        setUploadProofOfPurchaseOpen(value)
    }

    const handleAttachmentSubmit = () => {
        const updatedDefectiveItems = formValues.defectiveItems.map(d => {
            if(d.line === lotNumberData.line){
                return { ...d, proofOfPurchase: selectedAttachment }
            }
            else{
                return d
            }
        })
        setUploadProofOfPurchaseOpen(false)
        setFormValues((prev) => ({ ...prev, defectiveItems: updatedDefectiveItems }))
        setSelectedAttachment([])
    }

    const handleCustomerSearchAPICall = (searchText) => {
        if(searchText.length >= 3) {
            const payload = {
                searchString: searchText
            }
            apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                dispatch(getSearchByCustomersDataAction(payload))
            )
            setCustomerSearchText('')
        }
        else {
            dispatch(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
        }
    }

    const handleCloseCustomerDetails = () => {
        setFormValues((prev) => ({
            ...prev,
            customer: null
        }))
        setCustomerSearchText('')
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(setSearchByCustomersDataAction([]))
        )
    }

    const handleAutoSearchApicall = (searchText) => {
        dispatch(setSearchByCustomersDataAction([]))
        const payload = {
            searchString: searchText
        }
        dispatch(getSearchByCustomerAction(
            payload,
            setModalTypeHandler,
            setLoaderStatusHandler
        ))
    }

    useEffect(() => {
        if(props.status === 'edit') {
            apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                dispatch(getSalesCustomersByIdAction(props.editData?.customer_id))
            )
        }
    }, [props.status])

    const selectedRole = storage.role_name
    const customerCreateBtn = UserRightsAuthorization(menuAccess[selectedRole], 'contact__customer', 'can_create')
    const productCreateBtn = UserRightsAuthorization(menuAccess[selectedRole], 'inventory__product_master', 'can_create')

    return (
        <>
            <Card sx={{ p: '7px 7px 10px 7px', marginBottom: 10 }}>
                <Grid container spacing={3}>
                    <Grid size={12}>
                        <Typography variant='h6'>
                            {`Defect Collection - ${props.status === 'edit' ? collectedDefectById[0]?.collection_number ?? '' : defectCollectionSequence || ''}`}
                        </Typography>
                    </Grid>

                    <Grid size={10}>
                        <Grid container spacing={3}>
                            <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <Autocomplete
                                    fullWidth
                                    disableClearable
                                    disabled={props.status === 'edit'}
                                    freeSolo={customerSearchText.length <= 3}
                                    value={formValues.customer}
                                    options={customer.filter(d => d.company_name !== null && d.company_name !== '' && d.customer_id && d.customer_type === '1')}
                                    getOptionLabel={(option) => option.company_name}
                                    onChange={(event, newValue) => {
                                        handleChange('customer', newValue)
                                        setCustomerSearchText(newValue?.company_name || '') 
                                    }}
                                    inputValue={customerSearchText}
                                    onInputChange={(event, newInputValue, reason) => {
                                        if(reason === 'input') {
                                            setCustomerSearchText(newInputValue)
                                            if(newInputValue !== '') {
                                                handleAutoSearchApicall(newInputValue)
                                            }
                                            if(newInputValue == '') {
                                                setFormValues((prev) => ({...prev, customer: null}))
                                                apiCalls(
                                                    setModalTypeHandler,
                                                    setLoaderStatusHandler,
                                                    dispatch(setSearchByCustomersDataAction([]))
                                                )
                                            }
                                        }
                                    }}
                                    renderInput={(params) => {
                                        const get = {...params}
                                        let startAdornment = null
                                        if(props.status !== 'edit') {
                                            startAdornment = (
                                                customerCreateBtn && <Tooltip title='Create New'>
                                                    <IconButton 
                                                        size='small'
                                                        onClick={() => {
                                                            setModalStatusHandler(true)
                                                            setModalTypeHandler('NewCustomer')
                                                        }}
                                                    >
                                                        <AddIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            ) 
                                        }
                                        else {
                                            get.InputProps = {
                                                ...params.InputProps
                                            }
                                        }
                                        return(
                                            <TextField
                                                {...get}
                                                inputRef={customerInputRef}
                                                required
                                                fullWidth
                                                variant='filled'
                                                label='Select Customer'
                                                error={formErrors.customer}
                                                helperText={formErrors.customer === 'required' ? 'Customer is Required' : ''}
                                                slotProps={{
                                                    input: (props.status !== 'edit') && {
                                                        ...get.InputProps,
                                                        startAdornment: startAdornment,
                                                        endAdornment: (
                                                            <>
                                                                {
                                                                    formValues.customer === null ?
                                                                    // <IconButton
                                                                    //     size="small"
                                                                    //     onClick={() => {
                                                                    //         handleCustomerSearchAPICall(customerSearchText)
                                                                    //     }}
                                                                    // >
                                                                    //     <SearchIcon />
                                                                    // </IconButton> 
                                                                    '': 
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => {
                                                                            handleCloseCustomerDetails()
                                                                        }}
                                                                    >
                                                                        <CloseIcon />
                                                                    </IconButton>
                                                                }
                                                                {get.InputProps.endAdornment}
                                                            </>
                                                        ),
                                                    }
                                                }}
                                            />
                                        )
                                    }}
                                />
                            </Grid>

                            {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                <Autocomplete
                                    value={formValues.location}
                                    options={stocklocation.filter(d => {
                                        if (headerLocationId === 'null') {
                                            return d.location_type_name !== "Scrap" && d.location_type_name !== "office"
                                        }
                                        else {
                                            return headerLocationId === d.location_id
                                        }
                                    })}
                                    getOptionLabel={(option) => option.location_name}
                                    onChange={(event, newValue) => handleChange('location', newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            required
                                            fullWidth
                                            variant='filled'
                                            label='Location'
                                            error={formErrors.location}
                                            helperText={formErrors.location === 'required' ? 'Location is Required' : ''}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                <Autocomplete
                                    value={formValues.invoice}
                                    options={invoiceByCustomer}
                                    getOptionLabel={(option) => option.invoice_number}
                                    onChange={(event, newValue) => handleChange('invoice', newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            required
                                            fullWidth
                                            variant='filled'
                                            label='Invoice'
                                            error={formErrors.invoice}
                                            helperText={formErrors.invoice === 'required' ? 'Invoice is Required' : ''}
                                        />
                                    )}
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
                                    value={formValues.reference || ''}
                                    variant='filled'
                                    label='Reference'
                                    fullWidth
                                    onChange={(event) => handleChange('reference', event.target.value)}
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
                                    value={formValues.reason || ''}
                                    variant='filled'
                                    label='Reason'
                                    fullWidth
                                    onChange={(event) => handleChange('reason', event.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </Grid>


                    <Grid size={12}>
                        <Grid container spacing={3} display='flex' justifyContent='space-between' alignItems='center'>
                            <Grid>
                                <Typography variant='h6'>Products</Typography>
                            </Grid>
                            <Grid>
                                <Stack direction='row' spacing={3} justifyContent='flex-end' alignItems='center' sx={{ width: '100%' }}>
                                    {
                                        (lotNumberMessage.success || lotNumberMessage.error) && 
                                        <Alert
                                            severity={lotNumberMessage.error ? "warning" : "success"}
                                            sx={{ width: '250px' }}
                                        >
                                            {lotNumberMessage.message}
                                        </Alert>
                                    }

                                    <TextField
                                        value={lotNumberSearch || ''}
                                        label='Barcode / Lot Number'
                                        onChange={(event) => setLotNumberSearch(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                handleLotNumberSearch(lotNumberSearch, false)
                                            }
                                        }}
                                        InputProps={{
                                            endAdornment: lotNumberMessage.error ? (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={async() => {
                                                        setLotNumberSearch('')
                                                        setLotNumberMessage({ success: false, error: false, message: '' })
                                                    }}>
                                                        <CloseIcon fontSize='small' />
                                                    </IconButton>
                                                </InputAdornment>
                                            ) : (<></>)
                                        }}
                                    />
                                </Stack>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid
                        sx={{ minHeight: 'calc(100vh - 295px)', maxHeight: 'calc(100vh - 295px)' }}
                        size={12}>
                        <Table>
                            <TableHead style={{ backgroundColor: '#e8e8e8' }}>
                                <TableRow>
                                    <TableCell sx={{ width: 150 }}>Product <span style={{color:'red', fontWeight: 500}}>*</span></TableCell>
                                    <TableCell sx={{ width: 150 }}>Invoice Number</TableCell>
                                    <TableCell sx={{ width: 75 }}>Quantity <span style={{color:'red', fontWeight: 500}}>*</span></TableCell>
                                    <TableCell sx={{ width: 75 }}>Sold Price <span style={{color:'red', fontWeight: 500}}>*</span></TableCell>
                                    <TableCell sx={{ width: 50 }}>Serial Number</TableCell>
                                    <TableCell sx={{ width: 100 }}>Proof of Purchase</TableCell>
                                    <TableCell sx={{ width: 100 }}></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {
                                    formValues.defectiveItems.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Autocomplete
                                                    value={filteredProduct
                                                        .find(d => d.item_id === item.item_id) ?? null}
                                                    options={filteredProduct}
                                                    getOptionLabel={(option) => option.name}
                                                    onChange={(event, newValue) => {
                                                        let updatedDefectiveItems = []
                                                        if (newValue === null) {
                                                            updatedDefectiveItems = formValues.defectiveItems.map((d, i) => {
                                                                if (index === i) {
                                                                    return tempInsert
                                                                }
                                                                else {
                                                                    return d
                                                                }
                                                            })
                                                        }
                                                        else {
                                                            updatedDefectiveItems = formValues.defectiveItems.map((d, i) => {
                                                                if (index === i) {
                                                                    return {
                                                                        ...d,
                                                                        item_id: newValue.item_id,
                                                                        name: newValue.name,
                                                                        quantity: 1,
                                                                        line: index + 1,
                                                                        is_serialized: newValue.is_serialized,
                                                                        lots: [],
                                                                        item_cost_price: newValue.item_cost_price,
                                                                        item_unit_price: newValue?.item_unit_price || 0,
                                                                        available_quantity: newValue.quantity,
                                                                        description: newValue.description ?? '',
                                                                        sale_id: '',
                                                                        invoice_number: '',
                                                                    }
                                                                }
                                                                else {
                                                                    return d
                                                                }
                                                            })
                                                        }
                                                        setFormValues((prev) => ({ ...prev, defectiveItems: updatedDefectiveItems }))
                                                        setTimeout(() => {
                                                            document.querySelector(`[name="invoice${index}"]`)?.focus()
                                                        }, 100)
                                                    }}
                                                    renderInput={(params) => {
                                                        const get = { ...params }
                                                        get.InputProps = {
                                                            ...params.InputProps,
                                                            startAdornment: (
                                                                productCreateBtn && <Tooltip title='Create New'>
                                                                    {
                                                                        <Icon 
                                                                            onClick={() => {
                                                                                setModalStatusHandler(true)
                                                                                setModalTypeHandler('product')
                                                                            }}
                                                                            style={{ cursor : 'pointer', color : '#666666' }}
                                                                        >
                                                                            add
                                                                        </Icon>
                                                                    }
                                                                </Tooltip>
                                                            )
                                                        }
                                                        return (
                                                            <TextField
                                                                { ...get }
                                                                variant='standard'
                                                            />
                                                        )
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    item.name !== '' ?
                                                        <Autocomplete
                                                            // freeSolo
                                                            name={`invoice${index}`}
                                                            value={invoiceOptions.find(d => d.invoice_number == item.invoice_number) || null}
                                                            options={getInvoiceOptions(item.item_id, item.invoice_number)}
                                                            getOptionLabel={(option) => typeof option === "string" ? option : option?.invoice_number || ''}
                                                            onChange={(event, newValue) => {
                                                                if(newValue === null){
                                                                    const updatedDefectiveItems = formValues.defectiveItems.map((d, i) => {
                                                                        if(index === i){
                                                                            return{
                                                                                ...d,
                                                                                sale_id: '',
                                                                                invoice_number: '',
                                                                                location_id: '',
                                                                                available_quantity: '',
                                                                                lots: [],
                                                                                quantity: 1
                                                                            }
                                                                        }
                                                                        else{
                                                                            return d
                                                                        }
                                                                    })
                                                                    setFormValues((prev) => ({ ...prev, defectiveItems: updatedDefectiveItems }))
                                                                }
                                                                else{
                                                                    const updatedDefectiveItems = formValues.defectiveItems.map((d, i) => {
                                                                        if(index === i){
                                                                            return{
                                                                                ...d,
                                                                                sale_id: newValue.sale_id,
                                                                                invoice_number: newValue.invoice_number,
                                                                                item_unit_price: (newValue?.item_unit_price || 0) + (newValue?.tax_amount || 0),
                                                                                location_id: newValue.location_id,
                                                                                lots: [],
                                                                                quantity: 1,
                                                                                available_quantity: newValue.quantity
                                                                            }
                                                                        }
                                                                        else{
                                                                            return d
                                                                        }
                                                                    })
                                                                    setFormValues((prev) => ({ ...prev, defectiveItems: updatedDefectiveItems }))
                                                                    setTimeout(() => {
                                                                        document.querySelector(`[name="quantity${index}"]`)?.focus()
                                                                    }, 100)
                                                                }
                                                            }}
                                                            onInputChange={(event, value) => {
                                                                if(value !== item.invoice_number){
                                                                    const updated = formValues.defectiveItems.map((d, i) =>
                                                                    index === i
                                                                        ? {
                                                                            ...d,
                                                                            invoice_number: value,
                                                                            sale_id: null,
                                                                            item_unit_price: item.item_unit_price
                                                                        }
                                                                        : d
                                                                    )
                                                                    setFormValues((prev) => ({ ...prev, defectiveItems: updated }));
                                                                }
                                                            }}
                                                            onKeyDown={(event) => {
                                                                if(event.key === 'Enter'){
                                                                    if(item.sale_id === null && (item.invoice_number !== '' || item.invoice_number !== null)){
                                                                        setInvoiceOptions((prev) => ([ ...prev, { item_id: item.item_id, invoice_number: item.invoice_number } ]))
                                                                    }
                                                                }
                                                            }}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    { ...params }
                                                                    variant='standard'
                                                                />
                                                            )}
                                                        />
                                                    : ''
                                                }
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    item.name?.length > 0 ? (
                                                        <TextField
                                                            name={`quantity${index}`}
                                                            value={item.quantity}
                                                            variant='standard'
                                                            type='number'
                                                            onChange={(event) => {
                                                                const oldQuantity = currentQuantity
                                                                const oldLots = currentLots
                                                                const value = event.target.value === '' ? '' : parseInt(event.target.value)
                                                                let reducedQuantity = 0
                                                                // let quantityError = false
                                                                if (value === '') {
                                                                    setCurrentLots(item.lots)
                                                                    setCurrentQuantity(item.quantity)
                                                                }
            
                                                                if (oldQuantity > value) {
                                                                    reducedQuantity - oldQuantity - (value === '' ? 0 : value)
                                                                }

                                                                // if(item.available_quantity !== ''){
                                                                //     if(item.available_quantity < value){
                                                                //         quantityError = true
                                                                //     }
                                                                // }
            
                                                                const updatedDefectiveItems = formValues.defectiveItems.map((d, i) => {
                                                                    const newLotsLength = Math.max(oldLots.length - reducedQuantity, 0)
                                                                    const updatedLots = oldLots.slice(0, newLotsLength)
                                                                    if (index === i) {
                                                                        return {
                                                                            ...d,
                                                                            quantity: value,
                                                                            lots: value === '' ? [] : oldLots.length > 0 ? updatedLots : item.lots,
                                                                            // quantity_error: quantityError,
                                                                            // quantity_error_msg: quantityError ? 'Quantity is greater than sold quantity' : ''
                                                                        }
                                                                    }
                                                                    else {
                                                                        return d
                                                                    }
                                                                })
                                                                setFormValues((prev) => ({ ...prev, defectiveItems: updatedDefectiveItems }))
                                                            }}
                                                            // error={item.quantity_error}
                                                            // helperText={item.quantity_error_msg}
                                                        />
                                                    ) : ''
                                                }
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    item.name !== '' ?
                                                        <TextField
                                                            name='item_unit_price'
                                                            value={item.item_unit_price}
                                                            variant='standard'
                                                            type='number'
                                                            onChange={(event) => {
                                                                const updatedDefectiveItems = formValues.defectiveItems.map((d, i) => {
                                                                    if(index === i){
                                                                        return{
                                                                            ...d,
                                                                            item_unit_price: event.target.value
                                                                        }
                                                                    }
                                                                    else{
                                                                        return d
                                                                    }
                                                                })
                                                                setFormValues((prev) => ({ ...prev, defectiveItems: updatedDefectiveItems }))
                                                            }}
                                                        />
                                                    : ''
                                                }
                                            </TableCell>

                                            <TableCell>
                                                <Stack flexDirection='row' gap={5}>
                                                    {
                                                        item.name?.length > 0 ? 
                                                            item.is_serialized === 1 &&
                                                            <Tooltip title='Serial Number'>
                                                                    <Icon
                                                                        style={{
                                                                            color: item.quantity > 0 && !item.quantity_error ?
                                                                                Number(item.quantity) === item.lots.length ?
                                                                                    'green'
                                                                                : 'red'
                                                                            : 'grey'
                                                                        }}
                                                                        onClick={(event) => item.quantity > 0 && !item.quantity_error ? handleLotNumberDialog(item) : event.preventDefault()}
                                                                    >
                                                                        toc
                                                                    </Icon>
                                                            </Tooltip>
                                                        : ''
                                                    }

                                                    {
                                                        item.name?.length > 0 ? 
                                                            item.is_serialized === 1 && item.lots.length > 0 &&
                                                            <Tooltip title='view'>
                                                                <Icon
                                                                    onClick={() => handleViewSerialNumber(item)}
                                                                >
                                                                    visibility
                                                                </Icon>
                                                            </Tooltip>
                                                        : ''
                                                    }
                                                </Stack>
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    (item.name !== '') ?
                                                        <>
                                                            <IconButton onClick={() => handleUploadDialog(true, item)}>
                                                                <UploadFile />
                                                            </IconButton>
                                                            <br />
                                                            {
                                                                item.proofOfPurchase.length > 0 ?
                                                                    <Typography variant='caption' color='#285C1C !important'>
                                                                        Uploaded Successfully
                                                                    </Typography>
                                                                : ''
                                                            }
                                                        
                                                        </>
                                                    : ''
                                                }
                                            </TableCell>

                                            <TableCell>
                                                <Stack flexDirection='row'>
                                                    {
                                                        formValues.defectiveItems.length > 1 &&
                                                        <IconButton onClick={item.name.length > 0 ? () => handleDeleteDialogOpen(index) : () => deleteProductRowData(index)}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    }

                                                    {
                                                        index === formValues.defectiveItems.length - 1 &&
                                                        <IconButton onClick={() => setFormValues((prev) => ({ ...prev, defectiveItems: [...prev.defectiveItems, tempInsert] }))}>
                                                                <AddIcon />
                                                        </IconButton>
                                                    }
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                }
                            </TableBody>
                        </Table>
                    </Grid>

                    <Grid size={12}>
                        <Grid container spacing={3} display='flex' justifyContent='flex-end'>
                            <Grid>
                                <Button variant='contained' color='error' onClick={() => props.handleClose()}>Cancel</Button>
                            </Grid>

                            <Grid>
                                <Button variant='contained' onClick={handleSubmit} disabled={formValues.defectiveItems.some(d => d.name === '' || d.item_unit_price === '' || d.item_unit_price === 0 ||  d.quantity_error || (d.is_serialized === 1 && (d.lots.length === 0 || d.lots.length !== Number(d.quantity))))}>Submit</Button>
                            </Grid>
                        </Grid>
                    </Grid>
                        
                </Grid>
            </Card>
            <LocationAlert open={locationAlert} onClose={() => setLocationAlert(false)} />
            {
                uploadProofOfPurchaseOpen &&
                <Dialog open={uploadProofOfPurchaseOpen} onClose={() => handleUploadDialog(false, null)} maxWidth='md' fullWidth>
                    <DialogTitle sx={{ py: '5px !important', px: '10px !important' }}>
                        <Grid container display='flex' justifyContent='flex-end'>
                            <Grid>
                                <IconButton onClick={() => handleUploadDialog(false, null)}>
                                    <CloseIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </DialogTitle>
                    
                    <DialogContent>
                        <AttachmentField
                            type='collectDefect'
                            previews={selectedAttachment}
                            setPreviews={setSelectedAttachment}
                        />
                    </DialogContent>

                    <DialogActions>
                        <Button variant='contained' onClick={handleAttachmentSubmit}>Submit</Button>
                    </DialogActions>
                </Dialog>
            }
            {
                lotNumberDialog &&
                <LotNumberDialog
                    open={lotNumberDialog}
                    data={lotNumberData}
                    sale_id={lotNumberData.sale_id}
                    location_id={lotNumberData.location_id}
                    handleClose={handleLotNumberDialogClose}
                    setFormValues={setFormValues}
                    calledFrom='defectsLotSearch'
                    defectiveItems={formValues.defectiveItems}
                    customer_id={formValues.customer?.customer_id ?? null}
                />
            }
            {
                viewSerialNumberDialog &&
                <Dialog open={viewSerialNumberDialog} onClose={() => handleViewSerialNumberClose()}>
                    <DialogTitle>
                        <Grid container spacing={3} justifyContent='space-between'>
                            <Grid>
                                <Typography variant='h6'>Lot / Serial Number</Typography>
                            </Grid>

                            <Grid>
                                <IconButton onClick={() => handleViewSerialNumberClose()}>
                                    <CloseIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </DialogTitle>

                    <DialogContent>
                        {
                            rowDataForViewSerialNumber.lots.map((lot) => (
                                <TableRow key={lot.lot_number}>
                                    <TableCell>{ lot.lot_number }</TableCell>
                                </TableRow>
                            ))
                        }
                    </DialogContent>
                </Dialog>
            }
            <Dialog open={deleteDialog} onClose={() => handleDeleteDialogClose()}>
                <DialogTitle>
                    <Grid container spacing={3} justifyContent='space-between' alignItems='center' textAlign='center'>
                        <Grid>
                            <Typography variant='h6'>Delete Confirmation</Typography>
                        </Grid>

                        <Grid>
                            <IconButton onClick={() => handleDeleteDialogClose()}>
                                <CloseIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                </DialogTitle>

                <DialogContent>
                    <Typography variant='h6'>
                        Are you sure want to delete the product ?
                    </Typography>
                </DialogContent>

                <DialogActions>
                    <Grid container spacing={3} justifyContent='flex-end'>
                        <Grid>
                            <Button variant='contained' color='error' onClick={() => handleDeleteDialogClose()}>
                                Cancel
                            </Button>
                        </Grid>

                        <Grid>
                            <Button variant='contained' onClick={() => deleteProductRowData(deleteIndex)}>
                                Delete
                            </Button>
                        </Grid>
                    </Grid>
                </DialogActions>
            </Dialog>
        </>
    );
}

CollectDefects.propTypes = {
    status: PropTypes.func,
    handleClose: PropTypes.func,
    handleCollectionClick: PropTypes.func,
    editData: PropTypes.object,
    pagination: PropTypes.object,
    filter: PropTypes.object,
}

export default CollectDefects
