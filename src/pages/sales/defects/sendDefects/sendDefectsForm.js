import {
    Alert,
    Autocomplete,
    Box,
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
import { debounce } from 'lodash'
import LotNumberDialog from '../lotNumberDialog'
import { listCustomerAction } from 'redux/actions/customer_actions'
import { listStockLocationSequenceAction } from 'redux/actions/stock_Location_actions'
import { createDefectCollectionAction, getAlldefectsCollectionAction, getBillsByVendorAction, getInvoiceByVendorAction, getInvoicesByProductAction, getLotsDetailsForDefectsAction, getProductByVendorAction, getProductsByBillsAction, getSendDefectsByIdAction, getSendDefectSequenceAction, sendDefectsAction, setInvoiceByProductAction, updateSendDefectsAction } from 'redux/actions/defects_actions'
import { OpenalertActions } from 'redux/actions/alert_actions'
import { requiredFieldsAlertMessage } from 'utils/content'
import PropTypes from 'prop-types'
import { Padding } from '@mui/icons-material'
import { getSearchByVendorAction, getSupplierDetailsByIdreceivings_itemsAction, listVendorAction, listVendorIdAndNameAction, setInvoiceTempAction } from 'redux/actions/vendor_actions'
import LocationAlert from 'pages/assets/alert/LocationAlert';
import moment from 'moment'
import { listProductAction, listProductActionByType } from 'redux/actions/product_actions'
import FileOpenIcon from '@mui/icons-material/FileOpen';
import CommonInvoiceTemplate from 'pages/sales/CommonInvoiceTemp/CommonInvoiceTemplate'
import { getPurchaseSuppliersByIdAction, getSearchByVendorDataAction, setSearchByVendorDataAction } from '../../../../redux/actions/vendor_actions'
import SearchIcon from '@mui/icons-material/Search';
import { searchErrorMessage } from '../../../../utils/content'
import apiCalls from 'utils/apiCalls'
import { getsessionStorage } from 'pages/common/login/cookies'
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper'

function SendDefectsForm(props) {

    const { headerLocationId, commoncookie, selectData, setselectData, setLoaderStatusHandler, setModalTypeHandler, setModalStatusHandler } = useContext(CreateNewButtonContext)
    const dispatch = useDispatch()
    const storage = getsessionStorage()
    const vendorInputRef = useRef(null)
    const {
        vendorReducer: { vendorIdAndName: vendor },
        stockLocationReducer: { stocklocation },
        defectReducers: { billsByVendor, productBybills, defectCollectionSequence, getAllDefectCollection, getSendDefectsById, productByVendor, invoiceByProduct, sendDefectSequence },
        productReducer : { productByType: product },
        vendorReducer: { po_temp },
        rbacReducer: { menuAccess }
    } = useSelector(state => state)

    const [formValues, setFormValues] = useState({
        vendor: null,
        // location: null,
        courierNo: null,
        // receiving: null,
        // invoiceNo: null,
        reference: null,
        // collection_id: null,
        defectiveItems: [],
        status: 'Initiated'
    })
    const [formErrors, setFormErrors] = useState({
        vendor: null,
        // location: null,
        courierNo: null,
        // invoiceNo: null,
        reference: null,
        // collection_id: null,
        defectiveItems: null,
        status: null
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
    const [invoiceOptions, setInvoiceOptions] = useState(invoiceByProduct)
    const [invoiceOpen, setInvoiceOpen] = useState(false)
    const [filteredProduct, setFilteredProduct] = useState([])
    const [vendorSearchText, setVendorSearchText] = useState('')

    const debouncedGetLotDetails = useRef(
        debounce((searchValue, supplier_id, response) => {
            const payload = {
                lot_number: searchValue,
                supplier_id: supplier_id,
                calledFrom: 'commonSendDefectsLotSearch'
            }
            dispatch(getLotsDetailsForDefectsAction(payload, response))
        }, 300)
    ).current

    useEffect(() => {
        setFormValues((prev) => ({ ...prev, defectiveItems: [tempInsert] }))
        // dispatch(listVendorAction(setModalTypeHandler, setLoaderStatusHandler))
        // dispatch(listVendorIdAndNameAction()),
        dispatch(getSendDefectSequenceAction())
        dispatch(setInvoiceByProductAction([]))
        dispatch(listProductActionByType('sendDefect'))
        dispatch(setSearchByVendorDataAction([]))
        setTimeout(() => {
            if (vendorInputRef.current) {
                vendorInputRef.current.focus()
            }
        }, 300)
        // dispatch(listStockLocationSequenceAction({ sequence_type: ['SO', 'DC'] }, null, commoncookie, 'null'),)
    }, [])

    useEffect(() => {
        if(product.length > 0){
            if(headerLocationId === 'null'){
                setFilteredProduct(product.filter(d => (d.item_qty?.length ?? 0) > 0))
            }
            else{
                setFilteredProduct(product.filter(d => (d.item_qty?.length ?? 0) > 0 && d.item_qty.some(i => i.location_id == headerLocationId)))
            }
        }
        else{
            setFilteredProduct([])
        }
    }, [product, headerLocationId])

    useEffect(() => {
        if (formValues.vendor) {
            // dispatch(getBillsByVendorAction(
            //     formValues.vendor.supplier_id,
            //     setModalTypeHandler,
            //     setLoaderStatusHandler
            // ))
            // dispatch(getAlldefectsCollectionAction('sendDefect'))
            // dispatch(getProductByVendorAction(formValues.vendor.supplier_id, setModalTypeHandler, setLoaderStatusHandler))
        }
    }, [props.status, formValues.vendor])

    // useEffect(() => {
    //     if (props.status === 'edit' && props.editData) {
    //         dispatch(getBillsByVendorAction(
    //             props.editData.vendor_id,
    //             setModalTypeHandler,
    //             setLoaderStatusHandler
    //         ))
    //         dispatch(getAlldefectsCollectionAction())
    //     }
    // }, [props.status, props.editData])

    // useEffect(() => {
    //     if (formValues.receiving !== null) {
    //         dispatch(getProductsByBillsAction(formValues?.receiving?.receiving_id))
    //     }
    // }, [formValues.receiving])

    useEffect(() => {
        if(filteredProduct.length > 0){
            if(formValues.vendor !== null){
                const itemIds = filteredProduct.map(d => d.item_id)
                const payload = {
                    item_id: itemIds,
                    type: 'supplier',
                    id: formValues.vendor.supplier_id
                }
                dispatch(getInvoicesByProductAction(payload))
            }
        }
    }, [filteredProduct, formValues.vendor])

    useEffect(() => {
        setInvoiceOptions(invoiceByProduct)
    }, [invoiceByProduct])

    useEffect(() => {
        if (props.status === 'edit' && props.editData?.send_id) {
            dispatch(getSendDefectsByIdAction(props.editData.send_id))
        }
    }, [props.status, props.editData?.send_id,])

    // useEffect(() => {
    //     if (props.status === 'edit' && Object.keys(props.editData).length > 0 && vendor.length > 0 ) {
    //         const editCustomer = vendor.find(d => d.supplier_id === props.editData.vendor_id)
    //         setFormValues((prev) => ({ ...prev, vendor: editCustomer, status: props.editData.status }))
    //     }
    // }, [props.status, props.editData, vendor, stocklocation])

    // useEffect(() => {
    //     if (billsByVendor?.length > 0 && props.status === 'edit') {
    //         setFormValues((prev) => ({ ...prev, reference: props.editData.reference, courierNo: props.editData.courier_number, status: props.editData.status }))
    //     }
    // }, [props.status, props.editData, billsByVendor, getAllDefectCollection])

    useEffect(() => {
        if(Array.isArray(getSendDefectsById) && getSendDefectsById.length > 0 && vendor.length > 0 && props.status === 'edit'){
            const collection = getSendDefectsById.find(d => d.send_id === props.editData.send_id)
            const editVendor = vendor.find(d => d.supplier_id === collection.vendor_id)
            setVendorSearchText(props.editData.company_name)
            setFormValues((prev) => ({ ...prev, vendor: editVendor, reference: collection.reference, courierNo: collection.courier_number }))
        }
    }, [props.status, getSendDefectsById, vendor])

    useEffect(() => {

        if (
            props.status === 'edit' &&
            props.editData?.send_id &&
            Array.isArray(filteredProduct) &&
            filteredProduct.length > 0 &&
            Array.isArray(getSendDefectsById) &&
            getSendDefectsById.length > 0
        ) {
            const collection = getSendDefectsById.find(
                d => d.send_id === props.editData.send_id
            )

            if (!collection) return

            const sendItems = collection.send_defects_items.map((d, i) => {
                if(!invoiceByProduct.includes(d.bill_number)){
                    setInvoiceOptions((prev) => ([ ...prev, { item_id: d.item_id, bill_number: d.bill_number } ]))
                }
                const selectedProduct = filteredProduct.find(p => p.item_id === d.item_id)
                const lots = d.sendDefectsLots?.map(lot => ({
                    lot_id: lot.lot_id,
                    lot_number: lot.lot_number,
                    trans_items_cost_price: d.item_cost_price
                }))

                return {
                    item_id: d.item_id,
                    name: d.name,
                    quantity: d.actual_quantity,
                    line: i + 1,
                    is_serialized: selectedProduct?.is_serialized,
                    lots: lots,
                    item_cost_price: d.item_cost_price,
                    item_unit_price: d.item_unit_price,
                    available_quantity: selectedProduct?.quantity ?? 0,
                    description: d.description,
                    receiving_id: d.receiving_id,
                    bill_number: d.bill_number,
                    bill_date: d.receiving_time,
                    location_id: d.location_id,
                }
            })

            setFormValues(prev => ({
                ...prev,
                defectiveItems: sendItems
            }))
        }
    }, [props.status, props.editData?.send_id, filteredProduct, getSendDefectsById, invoiceByProduct])

    useEffect (() => {
        if (selectData.NewVendor === true) {     
            const filter = [...vendor.filter(d => d.company_name !== null && d.company_name !== '' && d.supplier_id)]
            const popc = filter[0]
            handleChange('vendor',  popc)
            setModalStatusHandler(false)
            setselectData('NewVendor', false)
        }
    },[selectData.NewVendor, vendor])

    useEffect(() => {
        if (selectData.product) {
            const filter = [...filteredProduct]
            const pop = filter.shift()
            const updatedDefectiveItems = formValues.defectiveItems.map(d => {
                if(d.item_id === ''){
                    return {
                        item_id: pop.item_id,
                        item_unit_price: pop.item_unit_price,
                        item_cost_price: pop.item_cost_price,
                        description: pop.description,
                        name: pop.name,
                        quantity: 1,
                        is_serialized: pop.is_serialized,
                        lots: [],
                        receiving_id: '',
                        bill_number: '',
                        bill_date: '',
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

    const requiredFields = ['vendor']
    const tempInsert = {
        item_id: '',
        name: '',
        description: '',
        quantity: '',
        line: formValues.defectiveItems.length + 1,
        is_serialized: '',
        lots: [],
        receiving_id: '',
        bill_number: '',
        bill_date: '',
        location_id: '',
        item_cost_price: 0,
        item_unit_price: 0,
        available_quantity: '',
        quantity_error_msg: '',
        quantity_error: false
    }

    // useEffect(() => {
    //     if (headerLocationId !== 'null') {
    //         const location = stocklocation.find(d => d.location_id === headerLocationId)
    //         setFormValues((prev) => ({ ...prev, location: location }))
    //     }
    //     else {
    //         setFormValues((prev) => ({ ...prev, location: null }))
    //     }
    // }, [headerLocationId])

    const handleChange = (name, value) => {
        setFormValues((prev) => ({ ...prev, [name]: value }))

        if (value === null || value === '' || value === 'null') {
            setFormErrors((prev) => ({ ...prev, [name]: 'required' }))
        }
        else {
            setFormErrors((prev) => ({ ...prev, [name]: null }))
        }
    }

    const handleLotNumberSearch = (value, addNewLine, index) => {
        if (value !== '') {
            if (formValues.vendor === null) {
                setLotNumberMessage({ success: false, error: true, message: 'Please select the vendor' })
                return
            }

            if (!formValues.defectiveItems.some(item => item?.lots && item?.lots.some(lot => lot.lot_number === value))) {
                debouncedGetLotDetails(value, formValues.vendor.supplier_id, (response) => {
                    if(response?.status === 'Already Lot Exist in Defect'){
                        setLotNumberMessage({ success: false, error: true, message: 'Already Lot Exist in Defect' })
                        return
                    }
                    else if(response?.status === 'Lot has not be collected in defect'){
                        setLotNumberMessage({ success: false, error: true, message: 'Lot has not be collected in defect' })
                        return
                    }
                    
                    if (response.length > 0) {
                        if(response[0].item_id === null){
                            setLotNumberMessage({ success: false, error: true, message: 'Invalid Lot Number' })
                            return
                        }

                        if (formValues.defectiveItems.some(item => item?.item_id === response[0].item_id && item?.bill_number === '')) {
                            const selectedProduct = formValues.defectiveItems.find(item => item?.item_id === response[0].item_id && item?.bill_number === '')
                            const newQuantity = selectedProduct.lots.length + 1
                            const updatedItem = {
                                ...selectedProduct,
                                quantity: newQuantity,
                                receiving_id: response[0]?.receiving_id || '',
                                bill_number: response[0]?.bill_number || '',
                                bill_date: response[0]?.receiving_time || '',
                                location_id: response[0]?.location_id || '',
                                item_cost_price: (response[0]?.item_cost_price || 0) + (response[0]?.tax_amount ?? 0),
                                item_unit_price: response[0].item_unit_price,
                                lots: [...selectedProduct.lots, {
                                    lot_number: value,
                                    lot_id: response[0].lot_id,
                                    trans_items_cost_price: response[0].trans_items_cost_price
                                }],
                                available_quantity: response[0].quantity
                            }
                            const updatedDefectiveItems = formValues.defectiveItems.map((item) => {
                                if (item?.item_id === response[0].item_id && item?.bill_number === '') {
                                    return updatedItem
                                }
                                else {
                                    return item
                                }
                            })
                            setFormValues((prev) => ({ ...prev, defectiveItems: updatedDefectiveItems }))
                        }
                        else if (formValues.defectiveItems.some(item => item?.item_id === response[0].item_id && item?.bill_number === response[0].bill_number)) {
                            const selectedProduct = formValues.defectiveItems.find(item => item?.item_id === response[0].item_id && item?.bill_number === response[0].bill_number)
                            const newQuantity = selectedProduct.lots.length + 1
                            const updatedItem = {
                                ...selectedProduct,
                                quantity: newQuantity,
                                receiving_id: response[0]?.receiving_id || '',
                                bill_number: response[0]?.bill_number || '',
                                bill_date: response[0].receiving_time,
                                location_id: response[0].location_id,
                                item_cost_price: (response[0]?.item_cost_price || 0) + (response[0]?.tax_amount ?? 0),
                                item_unit_price: response[0].item_unit_price,
                                lots: [...selectedProduct.lots, {
                                    lot_number: value,
                                    lot_id: response[0].lot_id,
                                    trans_items_cost_price: response[0].trans_items_cost_price
                                }],
                                available_quantity: response[0].quantity
                            }
                            const updatedDefectiveItems = formValues.defectiveItems.map((item) => {
                                if (item?.item_id === response[0].item_id && item?.bill_number === response[0].bill_number) {
                                    return updatedItem
                                }
                                else {
                                    return item
                                }
                            })
                            setFormValues((prev) => ({ ...prev, defectiveItems: updatedDefectiveItems }))
                        }
                        else {
                            const selectedProduct = filteredProduct.find(product => product.item_id === response[0].item_id)
                            const newItem = {
                                item_id: selectedProduct.item_id,
                                name: selectedProduct.name,
                                quantity: 1,
                                line: formValues.defectiveItems.length + 1,
                                is_serialized: selectedProduct.is_serialized,
                                receiving_id: response[0]?.receiving_id || '',
                                bill_number: response[0]?.bill_number || '',
                                bill_date: response[0].receiving_time,
                                location_id: response[0].location_id,
                                item_cost_price: (response[0]?.item_cost_price || 0) + (response[0]?.tax_amount ?? 0),
                                item_unit_price: response[0].item_unit_price,
                                lots: [{
                                    lot_number: value,
                                    lot_id: response[0].lot_id,
                                    trans_items_cost_price: response[0].trans_items_cost_price
                                }],
                                available_quantity: response[0].quantity
                            }

                            const emptyNameIndex = formValues.defectiveItems.findIndex(d => d.name === '')
                            if (emptyNameIndex !== -1) {
                                const updatedDefectiveItems = formValues.defectiveItems.map((item, i) => {
                                    if (i === emptyNameIndex) {
                                        return newItem
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
                                setFormValues((prev) => ({ ...prev, defectiveItems: [...prev.defectiveItems, newItem] }))
                            }
                        }
                        setLotNumberMessage({ success: true, error: false, message: 'Added Successfully!' })
                        setTimeout(() => {
                            setLotNumberSearch('')
                            setLotNumberMessage({ success: false, error: false, message: '' })
                        }, 500)
                    }
                    else {
                        setLotNumberMessage({ success: false, error: true, message: !formValues.defectiveItems.some(item => item?.lots.some(lot => lot.lot_number === value)) ? 'Invalid Lot Number!' : 'Lot Number Already Entered' })
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

    const handleLotNumberDialog = async (data) => {
        await setLotNumberData(data)
        setLotNumberDialog(true)
    }

    const handleLotNumberDialogClose = () => {
        setLotNumberDialog(false)
        setLotNumberData(null)
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        let isValid = true
        const formErrorObj = { ...formErrors }

        Object.keys(formValues).map(key => {
            if (requiredFields.includes(key) && (formValues[key] === null || formValues[key] === '' || formValues[key] === 'null')) {
                isValid = false
                formErrorObj[key] = 'required'
            }

            if (key === 'defectiveItems' && formValues.defectiveItems.some(item => item?.name === '')) {
                isValid = false
                formErrorObj[key] = 'required'
            }
        })

        for (const item of formValues.defectiveItems) {
            if (item.is_serialized === 1) {
                const qty = Number(item.quantity || 0);
                const lotsCount = item.lots?.length || 0;
                if (qty > 0 && qty !== lotsCount) {
                    dispatch(OpenalertActions({
                        msg: `Please add ${qty} serial number(s) for ${item.name}`,
                        severity: "warning"
                    }));
                    return;
                }
            }
        }

        if (isValid) {
            if(headerLocationId === 'null'){
                setLocationAlert(true)
                return
            }
            
            const now = new Date();
            const sendDate = now.toISOString().slice(0, 19).replace('T', ' ');
            const payload = {
                vendor_id: formValues.vendor.supplier_id,
                location_id: headerLocationId,
                reference: formValues.reference,
                defectiveItems: formValues.defectiveItems,
                courier_number: formValues.courierNo,
                send_date: sendDate,
                employee_id: commoncookie,
                status: formValues.status,
                total: formValues.defectiveItems.reduce((sum, list) => sum + (Number(list.item_cost_price) * Number(list.quantity)), 0),
                type: null,
                send_id: props.status === 'edit' ? props?.editData?.send_id : null
            }
            const payload2 = {
                type: "onlyStatusUpdate",
                status: formValues.status,
                send_id: props?.editData?.send_id || null
            }
            if (props.status === 'edit') {
                const oldData = props.editData;
                const { status: oldStatus } = oldData;
                const { status: newStatus } = payload;

                const oldRelevant = {
                    vendor_id: oldData.vendor_id,
                    receiving_id: oldData.receivings_id,
                    location_id: oldData.location_id,
                    reference: oldData.reference,
                    courier_number: oldData.courier_number,
                    invoice_number: oldData.invoice_number,
                    collection_id: oldData.collection_id
                };

                const newRelevant = {
                    vendor_id: payload.vendor_id,
                    receiving_id: payload.receiving_id,
                    location_id: payload.location_id,
                    reference: payload.reference,
                    courier_number: payload.courier_number,
                    invoice_number: payload.invoice_number,
                    collection_id: payload.collection_id
                };
                const isOnlyStatusChanged =
                    JSON.stringify(oldRelevant) === JSON.stringify(newRelevant) &&
                    oldStatus !== newStatus;

                if (isOnlyStatusChanged) {
                    await dispatch(updateSendDefectsAction(payload2, async(response) => {
                        const res = await response
                        if(res.status === 200){
                            props.fetchSendDefects()
                            props.handleClose();
                        }
                    }));
                } else {
                    await dispatch(updateSendDefectsAction(payload, async(response) => {
                        const res = await response
                        if(res.status === 200){
                            props.fetchSendDefects()
                            props.handleClose();
                        }
                    }));
                }

            } else {
                dispatch(sendDefectsAction(payload, setModalTypeHandler, setLoaderStatusHandler, (response) => {
                    if (response.status === 200) {
                        // props.handleClose(true)
                        props.fetchSendDefects()
                        props.invoiceFunction(event, { send_id: response.data.masterinsert.insertId, supplier_id: payload.vendor_id })
                    }
                }))
            }
        }

        else {
            dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
        }
    }

    const updateItem = (index, updates) => {
        const updated = formValues.defectiveItems.map((item, i) =>
            i === index ? { ...item, ...updates } : item
        );
        setFormValues(prev => ({ ...prev, defectiveItems: updated }));
    };

    const getBillOptions = (item_id, bill_number) => {
        const usedInvoice = formValues.defectiveItems.filter (d => d.item_id === item_id && d.bill_number !== '' && d.bill_number !== bill_number).map(d => d.bill_number)
        const filteredInvoice = invoiceOptions.filter(d => d.item_id === item_id && d.bill_number !== null && (!usedInvoice.includes(d.bill_number) || d.bill_number === bill_number))
        return filteredInvoice
    }

    const handleViewInvoice = async(rowData) => {
        if(rowData.receiving_id !== '' && rowData.receiving_id !== null && rowData.receiving_id !== undefined){
            const payload = {
                receiving_id: rowData.receiving_id
            }
            await dispatch(getSupplierDetailsByIdreceivings_itemsAction(formValues.vendor.supplier_id, payload))
            setInvoiceOpen(true)
        }
    }

    const handleDownload = () => {
        try {
            const base64 = po_temp.pdfBase64

            const byteCharacters = atob(base64)
            const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i))
            const byteArray = new Uint8Array(byteNumbers)
            const blob = new Blob([byteArray], { type: 'application/pdf' })
            
            const now = new Date();
            const timestamp = now.toISOString().replace(/[:.]/g, '-')

            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')

            link.href = url
            link.download = `PO-${timestamp}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } 
        catch (err) {
            console.error('Download error:', err)
        }
    }

    const handlePrint = () => {
        try {
            const base64 = po_temp.pdfBase64

            const byteChars = atob(base64)
            const byteNumbers = new Array(byteChars.length)

            for (let i = 0; i < byteChars.length; i++) {
                byteNumbers[i] = byteChars.charCodeAt(i)
            }

            const byteArray = new Uint8Array(byteNumbers)
            const blob = new Blob([byteArray], { type: 'application/pdf' })

            const blobUrl = URL.createObjectURL(blob)

            const iframe = document.createElement('iframe')
            iframe.style.display = 'none'
            iframe.src = blobUrl
            document.body.appendChild(iframe)

            iframe.onload = () => {
                iframe.contentWindow.focus()
                iframe.contentWindow.print()
            }
        } 
        catch (err) {
            console.error('Print error:', err)
        }
    }

    const handleAutoSearchApicall = (searchText) => {
        dispatch(setSearchByVendorDataAction([]))
        const payload = {
            searchString: searchText
        }
        dispatch(getSearchByVendorAction(
            payload,
            setModalTypeHandler,
            setLoaderStatusHandler
        ))

    }

    const handleCloseVendorDetails = () => {
        setformValues((prev) => ({...prev, vendor: null}))
        setVendorSearchText('')
        dispatch(setSearchByVendorDataAction([]))
    }

    useEffect(() => {
        if(props.status === 'edit') {
            apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                dispatch(getPurchaseSuppliersByIdAction(props.editData?.supplier_id))
            )
        }
    }, [props.status])

    const selectedRole = storage.role_name
    const vendorCreate = UserRightsAuthorization(menuAccess[selectedRole], 'contact__vendor', 'can_create')
    const productCreate = UserRightsAuthorization(menuAccess[selectedRole], 'inventory__product_master', 'can_create')

    return (
        <>
            <Card
                sx={{
                    p: 3,
                    height: 'calc(100vh - 80px)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Box
                    sx={{
                        flexGrow: 1,
                        overflowY: 'auto',
                        pr: 1,
                    }}
                >
                    <Grid container spacing={3}>
                    <Grid sx={{ padding: 3 }} size={12}>
                        <Typography variant='h6'>
                            {`Send Defects - ${props.status === 'edit' ? getSendDefectsById[0]?.send_defect_number ?? '' : sendDefectSequence || ''}`}
                        </Typography>
                    </Grid>

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
                            freeSolo={vendorSearchText.length <= 3}
                            inputValue={vendorSearchText}
                            onInputChange={(event, newInputValue, reason) => {
                                if(reason === 'input') {
                                    setVendorSearchText(newInputValue)
                                    if(newInputValue !== '') {
                                        handleAutoSearchApicall(newInputValue)
                                    }
                                    if(newInputValue === '') {
                                        setFormValues((prev) => ({...prev, vendor: null}))
                                        dispatch(setSearchByVendorDataAction([]))
                                    }
                                }
                            }}
                            value={formValues.vendor}
                            options={vendor.filter(d => d.company_name !== null && d.company_name !== '' && d.supplier_id)}
                            getOptionLabel={(option) => option.company_name}
                            onChange={(event, newValue) => {
                                handleChange('vendor', newValue)
                                setVendorSearchText(newValue?.company_name || '')
                            }}
                            renderInput={(params) => {
                                const get = { ...params };
                                let startAdornment = null
                                if(props.status !== 'edit') {
                                    startAdornment = (
                                        vendorCreate && <Tooltip title='Create New'>
                                            <IconButton
                                                size='small'
                                                onClick={() => {
                                                    setModalStatusHandler(true)
                                                    setModalTypeHandler('NewVendor')
                                                }}
                                            >
                                                <AddIcon fontSize='small' />
                                            </IconButton>
                                        </Tooltip>
                                    )
                                }
                                else {
                                    get.InputProps = {
                                        ...params.InputProps
                                    }
                                }
                                return (
                                    <TextField
                                        {...get}
                                        inputRef={vendorInputRef}
                                        required
                                        fullWidth
                                        variant='filled'
                                        label='Select Vendor'
                                        error={formErrors.vendor}
                                        helperText={formErrors.vendor === 'required' ? 'Vendor is Required' : ''}
                                        slotProps={{
                                            input: (props.status !== 'edit') && {
                                                ...get.InputProps,
                                                startAdornment: startAdornment,
                                                endAdornment: (
                                                    <>
                                                        {
                                                            formValues.vendor === null ? 
                                                            // <IconButton
                                                            //     size="small"
                                                            //     onClick={() => {
                                                            //         handleVendorSearchAPICall(vendorSearchText)
                                                            //     }}
                                                            // >
                                                            //     <SearchIcon />
                                                            // </IconButton> 
                                                            '' :
                                                            <IconButton
                                                                size='small'
                                                                onClick={() => {
                                                                    handleCloseVendorDetails()
                                                                }}
                                                            >
                                                                <CloseIcon />
                                                            </IconButton>
                                                        }
                                                    </>
                                                )
                                            }
                                        }}
                                    />
                                )
                            }}
                        />
                    </Grid>

                    {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Autocomplete
                            value={formValues.receiving}
                            options={formValues.vendor ? billsByVendor : []}
                            getOptionLabel={(option) => option.bill_number}
                            onChange={(event, newValue) => handleChange('receiving', newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    required
                                    fullWidth
                                    variant='filled'
                                    label='Receivings'
                                    error={formErrors.receiving}
                                    helperText={formErrors.receiving === 'required' ? 'Invoice is Required' : ''}
                                />
                            )}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Autocomplete
                            value={formValues.collection_id}
                            options={formValues.vendor ? getAllDefectCollection : []}
                            getOptionLabel={(option) => option.collection_id?.toString() || ''}
                            onChange={(event, newValue) => handleChange('collection_id', newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    required
                                    fullWidth
                                    variant='filled'
                                    label='Collections'
                                    error={formErrors.collection_id}
                                    helperText={formErrors.collection_id === 'required' ? 'collection is Required' : ''}
                                />
                            )}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
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
                        <TextField
                            value={formValues.invoiceNo || ''}
                            variant='filled'
                            label='Invoice Number'
                            fullWidth
                            required
                            onChange={(event) => handleChange('invoiceNo', event.target.value)}
                            error={formErrors.invoiceNo}
                            helperText={formErrors.invoiceNo === 'required' ? 'Invoice No is Required' : ''}
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
                            value={formValues.courierNo || ''}
                            variant='filled'
                            label='Courier Number'
                            fullWidth
                            onChange={(event) => handleChange('courierNo', event.target.value)}
                        />
                    </Grid>

                    {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Autocomplete
                            value={formValues.status || null}
                            options={['Initiated', 'Received']}
                            onChange={(event, newValue) => handleChange('status', newValue)}
                            getOptionLabel={(option) => option || ''}
                            isOptionEqualToValue={(option, value) => option === value}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    variant='filled'
                                    label='Status'
                                    error={formErrors.status}
                                    helperText={formErrors.status === 'required' ? 'Status is Required' : ''}
                                />
                            )}
                        />
                    </Grid> */}

                    <Grid size={12}>
                        <Grid container spacing={5} display='flex' justifyContent='space-between' alignItems='center'>
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
                                                    <IconButton onClick={() => {
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

                    <Grid size={12}>
                        <Table>
                            <TableHead style={{ backgroundColor: '#e8e8e8' }}>
                                <TableRow>
                                    <TableCell>Product <span style={{color:'red', fontWeight: 500}}>*</span></TableCell>
                                    <TableCell>Bill Number</TableCell>
                                    <TableCell>Proof of Purchase</TableCell>
                                    <TableCell>Quantity <span style={{color:'red', fontWeight: 500}}>*</span></TableCell>
                                    <TableCell>Purchase Price <span style={{color:'red', fontWeight: 500}}>*</span></TableCell>
                                    <TableCell>Serial Number</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {
                                    formValues?.defectiveItems?.map((item, index) => (
                                        <TableRow key={item?.line}>
                                            <TableCell>
                                                <Autocomplete
                                                    value={filteredProduct?.find(d => d.item_id === item?.item_id) ?? null}
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
                                                                        item_id: newValue.item_id,
                                                                        item_unit_price: newValue.item_unit_price,
                                                                        item_cost_price: newValue.item_cost_price,
                                                                        description: newValue.description,
                                                                        name: newValue.name,
                                                                        quantity: 1,
                                                                        line: item?.line,
                                                                        is_serialized: newValue.is_serialized,
                                                                        lots: [],
                                                                        receiving_id: '',
                                                                        bill_number: '',
                                                                        bill_date: '',
                                                                    }
                                                                }
                                                                else {
                                                                    return d
                                                                }
                                                            })
                                                        }
                                                        setFormValues((prev) => ({ ...prev, defectiveItems: updatedDefectiveItems }))
                                                    }}
                                                    renderInput={(params) => {
                                                        const get = { ...params }
                                                        get.InputProps = {
                                                            ...params.InputProps,
                                                            startAdornment: (
                                                                productCreate && <Tooltip title='Create New'>
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
                                                        return(
                                                            <TextField
                                                                {...get}
                                                                label='Product'
                                                                variant='standard'
                                                                sx={{ mt: 1 }}
                                                            />
                                                        )
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    item?.name !== '' ? 
                                                        <Autocomplete
                                                            value={invoiceOptions.find(d => d.bill_number == item?.bill_number) || null}
                                                            options={getBillOptions(item.item_id, item.bill_number)}
                                                            getOptionLabel={(option) => typeof option === "string" ? option : option?.bill_number || ''}
                                                            onChange={(event, newValue) => {
                                                                if(newValue === null){
                                                                    const updatedDefectiveItems = formValues.defectiveItems.map((d, i) => {
                                                                        if(index === i){
                                                                            return{
                                                                                ...d,
                                                                                receiving_id: '',
                                                                                bill_number: '',
                                                                                bill_date: '',
                                                                                location_id: '',
                                                                                lots: [],
                                                                                quantity: '',
                                                                                available_quantity: '',
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
                                                                                receiving_id: newValue.receiving_id,
                                                                                bill_number: newValue.bill_number,
                                                                                bill_date: newValue.bill_date,
                                                                                location_id: newValue.location_id,
                                                                                item_cost_price: newValue.item_cost_price + newValue.tax_amount,
                                                                                item_unit_price: newValue.item_unit_price,
                                                                                lots: [],
                                                                                quantity: 1,
                                                                                available_quantity: newValue.quantity,
                                                                            }
                                                                        }
                                                                        else{
                                                                            return d
                                                                        }
                                                                    })
                                                                    setFormValues((prev) => ({ ...prev, defectiveItems: updatedDefectiveItems }))
                                                                }
                                                            }}
                                                            onInputChange={(event, value) => {
                                                                if(value !== item.bill_number){
                                                                    const updated = formValues.defectiveItems.map((d, i) =>
                                                                    index === i
                                                                        ? {
                                                                            ...d,
                                                                            bill_number: value,
                                                                            receiving_id: null
                                                                        }
                                                                        : d
                                                                    )
                                                                    setFormValues((prev) => ({ ...prev, defectiveItems: updated }));
                                                                }
                                                            }}
                                                            onKeyDown={(event) => {
                                                                if(event.key === 'Enter'){
                                                                    if(item.receiving_id === null && (item.bill_number !== '' || item.bill_number !== null)){
                                                                        setInvoiceOptions((prev) => ([ ...prev, { item_id: item.item_id, bill_number: item.bill_number } ]))
                                                                    }
                                                                }
                                                            }}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    { ...params }
                                                                    label='Bill'
                                                                    variant='standard'
                                                                />
                                                            )}
                                                        />
                                                    : ''
                                                }
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    item?.name !== '' ?
                                                        <IconButton disabled={item.bill_number === '' || (item.receiving_id === '' || item.receiving_id === null)} onClick={() => handleViewInvoice(item)}>
                                                            <FileOpenIcon />
                                                        </IconButton>
                                                    : ''
                                                }
                                            </TableCell>

                                            <TableCell>
                                                {item?.name?.length > 0 && (
                                                    <TextField
                                                        name={`quantity${index}`}
                                                        value={item.quantity}
                                                        variant="standard"
                                                        type="number"
                                                        onChange={(event) => {
                                                            const raw = event.target.value;
                                                            if (raw === "") {
                                                                updateItem(index, {
                                                                    quantity: "",
                                                                    // quantity_error: false,
                                                                    // quantity_error_msg: ""
                                                                });
                                                                return;
                                                            }

                                                            const value = Number(raw);
                                                            const receivedQty = getSendDefectsById?.[0]?.send_defects_items?.[index]?.received_quantity || 0;
                                                            const quantityError = value > receivedQty;

                                                            updateItem(index, {
                                                                quantity: value,
                                                                // quantity_error: quantityError,
                                                                // quantity_error_msg: quantityError
                                                                //     ? "Quantity is greater than received quantity"
                                                                //     : ""
                                                            });
                                                        }}
                                                        // error={Boolean(item.quantity_error)}
                                                        // helperText={item.quantity_error_msg}
                                                    />
                                                )}
                                            </TableCell>


                                            <TableCell>
                                                {
                                                    item?.name !== '' ?
                                                        <TextField
                                                            name='item_cost_price'
                                                            value={item.item_cost_price}
                                                            variant='standard'
                                                            type='number'
                                                            onChange={(event) => {
                                                                const updatedDefectiveItems = formValues.defectiveItems.map((d, i) => {
                                                                    if(index === i){
                                                                        return{
                                                                            ...d,
                                                                            item_cost_price: event.target.value
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
                                                        item?.name?.length > 0 ?
                                                            item?.is_serialized === 1 &&
                                                            <Tooltip title='Serial Number'>
                                                                <Icon
                                                                    style={{
                                                                        color: item?.quantity > 0 && !item.quantity_error ?
                                                                            Number(item?.quantity) === item?.lots.length ?
                                                                                'green'
                                                                                : 'red'
                                                                            : 'grey'
                                                                    }}
                                                                    onClick={(event) => item?.quantity > 0 && !item.quantity_error ? handleLotNumberDialog(item) : event.preventDefault()}
                                                                >
                                                                    toc
                                                                </Icon>
                                                            </Tooltip>
                                                            : ''
                                                    }

                                                    {
                                                        item?.name.length > 0 ?
                                                            item?.is_serialized === 1 && item?.lots.length > 0 &&
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
                                                <Stack flexDirection='row'>
                                                    {
                                                        formValues.defectiveItems.length > 1 &&
                                                        <IconButton onClick={item?.name.length > 0 ? () => handleDeleteDialogOpen(index) : () => deleteProductRowData(index)}>
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
                    </Grid>
                    </Box>

                <Box
                    sx={{
                        position: 'sticky',
                        bottom: 0,
                        left: 0,
                        backgroundColor: '#fff',
                        pt: 2,
                        pb: 2,
                        mt: 2,
                        zIndex: 10,
                    }}
                >
                    <Grid container spacing={3} justifyContent='flex-end'>
                            <Grid>
                                <Button variant='contained' color='error' onClick={() => props.handleClose()}>Cancel</Button>
                            </Grid>

                            <Grid>
                                <Button variant='contained' onClick={handleSubmit} disabled={formValues.defectiveItems.some(d => d.name === '' || d.item_cost_price === '' || d.item_cost_price === 0 || d.item_cost_price === null || d.quantity_error || (d.is_serialized === 1 && d.lots.length === 0) || (d.is_serialized === 1 && Number(d.quantity) !== d.lots.length))}>Submit</Button>
                        </Grid>
                    </Grid>
                </Box>
            </Card>
            <LocationAlert open={locationAlert} onClose={() => setLocationAlert(false)} />
            {
                lotNumberDialog &&
                <LotNumberDialog
                    open={lotNumberDialog}
                    data={lotNumberData}
                    location_id={lotNumberData.location_id}
                    handleClose={handleLotNumberDialogClose}
                    setFormValues={setFormValues}
                    calledFrom='sendDefects'
                    defectiveItems={formValues?.defectiveItems}
                    supplier_id = {formValues.vendor?.supplier_id ?? null}
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
                                    <TableCell>{lot.lot_number}</TableCell>
                                </TableRow>
                            ))
                        }
                    </DialogContent>
                </Dialog>
            }
            {invoiceOpen === true && 
                <Dialog
                    fullWidth
                    maxWidth='md'
                    open={invoiceOpen}
                    aria-labelledby='alert-dialog-title'
                    aria-describedby='alert-dialog-description'
                    
                >
                    <DialogContent
                        style={{
                            display: "block",
                            overflow:'hidden'
                        }}
                    >
                        <CommonInvoiceTemplate/>
                    </DialogContent>

                    <DialogActions sx={{ mr: '50px', ml: '35px' }}>
                        <Button
                            variant='outlined'
                            onClick={(e) => {
                                setInvoiceOpen(false)
                                dispatch(setInvoiceTempAction([]))
                            }}
                        >
                            Close
                        </Button>

                        <Button variant='contained' onClick={handleDownload}>
                            Download
                        </Button>

                        <Button variant='contained' onClick={handlePrint}>
                            Print
                        </Button>
                    </DialogActions>
                </Dialog>
            }
            <Dialog open={deleteDialog} onClose={() => handleDeleteDialogClose()}>
                <DialogTitle>
                    <Grid container spacing={3} display='flex' justifyContent='space-between' alignItems='center' textAlign='center'>
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

SendDefectsForm.propTypes = {
    fetchSendDefects: PropTypes.func,
    handleClose: PropTypes.func,
    invoiceFunction: PropTypes.func,
    status: PropTypes.string,
    editData: PropTypes.object
}

export default SendDefectsForm