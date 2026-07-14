import { Alert, Autocomplete, Box, Button, Card, ClickAwayListener, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Icon, IconButton, InputAdornment, Slide, Stack, Switch, Tab, Table, TableBody, TableCell, TableHead, TableRow, Tabs, TextField, Tooltip, Typography } from "@mui/material"
import { forwardRef, useContext, useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import LotNumberDialog from '../lotNumberDialog'
import { convertToCreditDebitNoteAction, createCustomerReplacementAction, createVendorReplacementAction, getDefectByCustomerVendorAction, getDefectCollectedSentProductAction, resetDefectProductAction, setReplacementItemsByReplacementIdAction } from 'redux/actions/defects_actions'
import moment from "moment"
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DataAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { customerAsCompanyAction, getSearchByCustomerSupplierAction } from "redux/actions/customer_actions"
import { listStockLocationSequenceAction } from "redux/actions/stock_Location_actions"
import PropTypes from "prop-types"
import NewManualNotesForm from "components/Sales/NewManualNotesForm"
import { OpenalertActions } from "redux/actions/alert_actions"
import LocationAlert from 'pages/assets/alert/LocationAlert';
import { listProductAction, listProductActionByType } from "redux/actions/product_actions"
import { Checklist, UploadFile } from "@mui/icons-material"
import DefectAdjustmentDialog from './DefectAdjustmentDialog'
import { editReplacementAction, getLotsDetailsForDefectsAction, getReplacementItemsByReplacementIdAction, listReplacementAction, setDefectByCustomerVendorAction } from "../../../../redux/actions/defects_actions"
import { useLocation } from "react-router-dom"
import { debounce } from "lodash"
import { singleTax ,Sales_Item_Taxes} from 'pages/sales/sales/sale_status_list'
import CommonImport from 'components/pos/payment_section/CommonImport';
import API_URLS from "../../../../utils/customFetchApiUrls"
import { read, utils } from "xlsx"
import { useCustomFetch } from "utils/useCustomFetch"
import { cellStyle } from "utils/pageSize"
import SearchIcon from '@mui/icons-material/Search';
import { getCustomerSupplierDataByIdAction, getSearchByCustomerSupplierDataAction, setSearchByCustomerSupplierDataAction } from "../../../../redux/actions/customer_actions"
import { searchErrorMessage } from "../../../../utils/content"
import apiCalls from 'utils/apiCalls'

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function AlertDialogSlide({
    setValidationToDefault,
    duplicateLotNumber,
    lotAlreadyExistInDb,
    setOpenAlert
}) {

    const [open, setOpen] = useState(true)

    const handleClose = () => {
        setOpen(false);
        setOpenAlert(false)
        setValidationToDefault()
    };

    return (
        <div>
            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-describedby='alert-dialog-slide-description'
            >
                {duplicateLotNumber.length > 0 && (
                    <>
                        <TableView data={duplicateLotNumber[1]} tableName={'duplicateLotInDb'} />
                    </>

                )}

                {lotAlreadyExistInDb.length > 0 && (
                    <>
                        <TableView data={lotAlreadyExistInDb[1]} tableName={'lotAlreadyExistInDb'} />
                    </>

                )}

                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

function TableView({ data, tableName }) {

    const tableNameList = {
        productMisMatch: 'Some products Mis Matched',
        duplicateLot: 'Duplicate Lot number',
        productOutOfStock: 'Some products Out of Stock',
        duplicateLotInDb: 'Product has duplicate Lot Number in Uploaded file',
        lotAlreadyExistInDb: 'Lot number already exist in Database'
    }



    return (
        <Grid
            style={{
                margin: '10px',
                width: '65vh'
            }}
        >
            <Typography variant='h6' pb={1}>
                {tableNameList[tableName]}
            </Typography>
            <table
                style={{
                    border: '1px solid',
                    fontSize: cellStyle.fontSize,
                    borderCollapse: 'collapse',
                    padding: '0px 5px',
                    width: '100%',
                    paddingBottom: '10px'

                }}
            >
                <tr>
                    <th style={{ border: '1px solid', width: '60%' }}>Product Name</th>
                    <th style={{ border: '1px solid', width: '40%' }}>Lot Number / Qty</th>
                </tr>
                {data.map((d, i) => (
                    <tr key={i}>
                        <td style={{ border: '1px solid', padding: '0px 5px' }}>
                            {d.name}
                        </td>

                        {d.uploadQty ? (
                            <td style={{ border: '1px solid', padding: '0px 5px' }}>
                                Uploaded Qty
                                <span style={{ fontWeight: 'bold' }}>({d.uploadQty})</span> is
                                more than actual qty
                                <span style={{ fontWeight: 'bold' }}>({d.actualQty})</span>
                            </td>
                        ) : (
                            <td style={{ border: '1px solid', padding: '0px 5px' }}>
                                {d.lot}
                            </td>
                        )}
                    </tr>
                ))}
            </table>
        </Grid>
    );
}

function ReplacementForm(props) {

    const dispatch = useDispatch()
    const location = useLocation()
    const customFetch = useCustomFetch()
    const customerInputRef = useRef(null)
    const vendorInputRef = useRef(null)
    const {
        customerReducer: { customerAsCompany },
        stockLocationReducer: { stocklocation },
        defectReducers: { defectByCustomerVendor, productByDefect, replacementItemsByReplacementId },
        productReducer: { productByType, product }
    } = useSelector(state => state)
    const { headerLocationId, commoncookie, selectData, setLoaderStatusHandler, setModalTypeHandler, setModalStatusHandler, setselectData } = useContext(CreateNewButtonContext)

    const [tabValue, setTabValue] = useState(location.pathname === '/sales/issueReplacement' || location.pathname === '/sales/collectDefects' ? 1 : 2)
    const [replacementSelection, setReplacementSelection] = useState('product')
    const [convertToCreditDebitNoteConfirmation, setConvertToCreditDebitNoteConfirmation] = useState(false)
    const [formValues, setFormValues] = useState({
        customer: null,
        vendor: null,
        location: null,
        customerVendorDefect: null,
        reference: null,
        note: null,
        replacement_date: moment().format('YYYY-MM-DD'),
        replacementItems: [],
        vendorReplacementItems: []
    })
    // console.log("9999",formValues.replacementItems)
    const [formErrors, setFormErrors] = useState({
        customer: null,
        vendor: null,
        location: null,
        customerVendorDefect: null,
        replacementItems: null,
        vendorReplacementItems: null
    })
    const [lotNumberSearch, setLotNumberSearch] = useState(null)
    const [lotNumberMessage, setLotNumberMessage] = useState({ success: false, error: false, message: '' })
    const [lotNumberData, setLotNumberData] = useState(null)
    const [lotNumberDialog, setLotNumberDialog] = useState(false)
    const [rowDataForViewSerialNumber, setRowDataForViewSerialNumber] = useState(null)
    const [viewSerialNumberDialog, setViewSerialNumberDialog] = useState(false)
    const [deleteIndex, setDeleteIndex] = useState(null)
    const [deleteDialog, setDeleteDialog] = useState(false)
    const [editDate, setEditDate] = useState(false)
    const [hoverDate, setHoverDate] = useState(false)
    const [locationAlert, setLocationAlert] = useState(false)
    const [currentQuantity, setCurrentQuantity] = useState(null)
    const [currentLots, setCurrentLots] = useState([])
    const [defectAdjustmentDialog, setDefectAdjustmentDialog] = useState(false)
    const [defectAdjustmentIndex, setDefectAdjustmentIndex] = useState(null)
    const [fileOpen, setFileOpen] = useState(false)
    const [uploadErrors, setUploadErrors] = useState({
        duplicateLotNumber: [],
        lotAlreadyExistInDb: []
    })
    const [uploadData, setUploadData] = useState({
        mp_open: false,
        dataApi: [],
        withItemId: [],
        xl_data: []
    })
    const [openAlert, setOpenAlert] = useState(false)
    const [customerVendorSearchText, setCustomerVendorSearchText] = useState('')

    const tempInsert = {
        item_id: '',
        name: '',
        quantity: '',
        line: 1,
        is_serialized: '',
        lots: [],
        item_cost_price: '',
        item_unit_price: '',
        available_quantity: '',
        description: '',
        defectLots: [],
        sale_id: '',
        receiving_id: '',
        replacing_item_id: '',
        defect_item_id: '',
        replacingQuantity: '',
        replacingQuantityError: false,
        replacingQuantityErrorMsg: '',
    }   
    const vendorReplacementItemTempInsert = {
        item_id: '',
        name: '',
        quantity: '',
        is_serialized: '',
        lots: [],
        line: formValues.vendorReplacementItems.length + 1,
        item_cost_price: '',
        item_unit_price: '',
        description: '',
        adjustedDefect: [],
        qty_per_pack: ''
    }
    const customerRequiredFields = ['customer', 'location', 'customerVendorDefect'] 
    const vendorRequiredFields = ['vendor', 'location']
    const requiredFields = tabValue === 1 ? customerRequiredFields : vendorRequiredFields

    useEffect(() => {
        // setFormValues((prev) => ({ ...prev, replacementItems: [tempInsert] }))
        dispatch(listStockLocationSequenceAction({ sequence_type: ['SO', 'DC'] }, null, commoncookie, 'null'))
        // dispatch(customerAsCompanyAction())
        dispatch(setSearchByCustomerSupplierDataAction([]))
    }, [])

    useEffect(() => {
        dispatch(listProductActionByType(props.type === 'issueReplacement' || location.pathname === '/sales/issueReplacement' ? 'sales' : 'purchase'))
    }, [props.type])

    useEffect(() => {
        dispatch(setReplacementItemsByReplacementIdAction({}))
        if(props.status === 'edit' && props.editData && Object.keys(props.editData).length > 0){
            dispatch(getReplacementItemsByReplacementIdAction(props.editData.record_kind, props.editData.replacement_id))
        }
    }, [props.status, props.editData])

    useEffect(() => {
        if(customerAsCompany.length > 0 && ((props.data && Object.keys(props.data).length > 0) || (props.status === 'edit' && props.editData && Object.keys(props.editData).length > 0))){
            if(props.type === 'issueReplacement' || (props.status === 'edit' && props.editData.record_kind === 'CUSTOMER')){
                setTabValue(1)
                const selectedCustomer = customerAsCompany.find(d => d.customer_id === (props.data?.customer_id ?? props.editData.customer_id))
                setCustomerVendorSearchText(props?.data?.company_name ?? props.editData?.company_name)
                setFormValues((prev) => ({ ...prev, customer: selectedCustomer }))
            }
            else if(props.type === 'collectReplacement' || (props.status === 'edit' && props.editData.record_kind === 'VENDOR')){
                setTabValue(2)
                const selectVendor = customerAsCompany.find(d => d.supplier_id === (props.data?.supplier_id ?? props.editData.supplier_id))
                setCustomerVendorSearchText(props?.data?.company_name ?? props.editData?.company_name)
                setFormValues((prev) => ({ ...prev, vendor: selectVendor }))
            }
        }
    }, [props.type, customerAsCompany, props.data, props.editData, props.status])

    useEffect(() => {
        if(tabValue === 1){
            setFormValues((prev) => ({ ...prev, replacementItems: [tempInsert] }))
            setFormErrors((prev) => ({ ...prev, customer: null, vendor: null, location: null, customerVendorDefect: null, replacementItems: [] }))
        }
        else if(tabValue === 2){
            setFormValues((prev) => ({ ...prev, vendorReplacementItems: [vendorReplacementItemTempInsert] }))
            setFormErrors((prev) => ({ ...prev, customer: null, vendor: null, location: null, customerVendorDefect: null, vendorReplacementItems: [] }))
        }
        dispatch(listStockLocationSequenceAction({ sequence_type: ['SO', 'DC'] }, null, commoncookie, 'null'))
        dispatch(resetDefectProductAction([]))
        setTimeout(() => {
            if (tabValue === 1) {
                if (customerInputRef.current) {
                    customerInputRef.current.focus()
                }
            } else {
                if (vendorInputRef.current) {
                    vendorInputRef.current.focus()
                }
            }
        }, 300)
    }, [tabValue])

    useEffect(() => {
        if(stocklocation.length > 0 && ((props.data && Object.keys(props.data).length > 0) || (props.editData && props.editData && Object.keys(props.editData).length > 0))){
            let location = null
            if(props.type === 'issueReplacement' || props.type === 'collectReplacement' || props.status === 'edit'){
                location = stocklocation.find((d) => d.location_id === (props.data?.location_id || props.editData.location_id))
            }
            else{
                location = stocklocation.find((d) => d.location_id === headerLocationId)
            }
            setFormValues((prev) => ({ ...prev, location: location }))
        }
    }, [headerLocationId, stocklocation, props.data, props.status, props.editData])

    useEffect(() => {
        if (formValues.customer !== null || formValues.vendor !== null) {
            const type = tabValue === 1 ? 'customer' : 'vendor'
            const id = tabValue === 1 ? formValues?.customer?.customer_id : formValues?.vendor?.supplier_id
            dispatch(getDefectByCustomerVendorAction(id, type))
        }
    }, [formValues.customer, formValues.vendor])

    useEffect(() => {
        if(Object.keys(replacementItemsByReplacementId).length > 0 && props.status === 'edit'){
            const defects = defectByCustomerVendor
            replacementItemsByReplacementId.defectData.forEach(item => {
                if(props.type === 'collectReplacement'){
                    if(defects.some(d => d.send_id === item.send_id)){
                        const selectedDefect = defects.find(d => d.send_id === item.send_id)
                        const selectedDefectIndex = defects.findIndex(d => d.send_id === item.send_id)
                        const updatedData = {
                            ...selectedDefect,
                            lot_number: item.lot_number.concat(`, ${selectedDefect.lot_number}`),
                            quantity: item.quantity + item.lot_number.split(',').length,
                            adjustingQuantityError: '',
                        }
                        defects[selectedDefectIndex] = updatedData
                    }
                    else{
                        defects.push({
                            ...item,
                            adjustingQuantityError: '',
                            isChecked: true,
                            quantity: item.quantity + item.lot_number.split(',').length,
                        })
                    }
                }
            })
            dispatch(setDefectByCustomerVendorAction(defects))
            let selectedCustomerVendorDefect = null
            if(props.editData.record_kind === 'CUSTOMER'){
                selectedCustomerVendorDefect = replacementItemsByReplacementId.defectData[0]
            }
            setFormValues((prev) => ({ ...prev, customerVendorDefect: selectedCustomerVendorDefect }))
        }
    }, [replacementItemsByReplacementId])

    useEffect(() => {
        if(defectByCustomerVendor.length > 0 && (props.data && Object.keys(props.data).length > 0) && !props.status){
            let selectedCustomerVendorDefect = null
            if(props.type === 'issueReplacement'){
                selectedCustomerVendorDefect = defectByCustomerVendor.find(d => d.collection_id === props.data.collection_id)
            }
            else if(props.type === 'collectReplacement'){
                selectedCustomerVendorDefect = defectByCustomerVendor.find(d => d.send_id === props.data.send_id)
            }
            setFormValues((prev) => ({ ...prev, customerVendorDefect: selectedCustomerVendorDefect }))
        }
    }, [defectByCustomerVendor, props.data])

    useEffect(() => {
        dispatch(resetDefectProductAction([]))
        if (formValues.customerVendorDefect !== null) {
            const type = tabValue === 1 ? 'customer' : 'vendor'
            const id = tabValue === 1 ? formValues.customerVendorDefect?.collection_id || props?.data?.collection_id || '' : formValues.customerVendorDefect?.send_id || props?.data?.send_id || ''
            const purpose = props.status || 'new'
            dispatch(getDefectCollectedSentProductAction(type, id, purpose))
        }
        if(!props.type){
            if(tabValue === 1){
                setFormValues((prev) => ({ ...prev, replacementItems: [tempInsert] }))
            }
            else if(tabValue === 2){
                setFormValues((prev) => ({ ...prev, vendorReplacementItems: [vendorReplacementItemTempInsert] }))
            }
        }
    }, [formValues.customerVendorDefect])

    useEffect(() => {
        if(productByDefect.length > 0 && (props.data && Object.keys(props.data).length > 0) && !props.status){
            let items = []
            
            if(props.type === 'issueReplacement'){
                items = props.data.collection_items
            }
            else if(props.type === 'collectReplacement'){
                items = props.data.send_defects_tems
            }
            const replacementItems = []
            items.forEach((data, index) => {
                const selectedProduct = productByDefect.find(d => d.item_id === data.item_id && d.invoice_number === data.invoice_number && d.defect_item_id === data.coll_item_id)
                const insertItems = {
                    item_id: data.item_id,
                    name: selectedProduct?.name || '',
                    quantity: data.actual_quantity - (data?.replaced_quantity ?? 0),
                    line: index + 1,
                    is_serialized: selectedProduct ? selectedProduct.is_serialized : '',
                    lots: [],
                    item_cost_price: selectedProduct?.item_cost_price || '',
                    item_unit_price: selectedProduct?.item_unit_price || '',
                    available_quantity: selectedProduct?.Lots.length || '',
                    description: selectedProduct?.description || '',
                    defectLots: selectedProduct?.Lots || '',
                    sale_id: selectedProduct?.sale_id || '',
                    receiving_id: selectedProduct?.receiving_id || '',
                    replacing_item_id: '',
                    defect_item_id: selectedProduct?.defect_item_id ?? '',
                    replacingQuantity: data.actual_quantity - data.replaced_quantity,
                    replacingQuantityError: false,
                    replacingQuantityErrorMsg: ''
                }
                replacementItems.push(insertItems)
            })
            setFormValues((prev) => ({ ...prev, replacementItems: replacementItems }))
        }
    }, [productByDefect, props.data])

    useEffect(() => {
        if(productByType.length > 0 && Object.keys(replacementItemsByReplacementId).length > 0 && props.status === 'edit'){
            const defects = defectByCustomerVendor
            replacementItemsByReplacementId.defectData.forEach(item => {
                if(props.type === 'collectReplacement'){
                    if(defects.some(d => d.send_id === item.send_id)){
                        const selectedDefect = defects.find(d => d.send_id === item.send_id)
                        const selectedDefectIndex = defects.findIndex(d => d.send_id === item.send_id)
                        const updatedData = {
                            ...selectedDefect,
                            lot_number: item.lot_number.concat(`, ${selectedDefect.lot_number}`),
                            quantity: item.quantity + item.lot_number.split(',').length,
                            adjustingQuantityError: '',
                        }
                        defects[selectedDefectIndex] = updatedData
                    }
                    else{
                        defects.push({
                            ...item,
                            adjustingQuantityError: '',
                            isChecked: true,
                            quantity: item.quantity + item.lot_number.split(',').length,
                        })
                    }
                }
            })
            dispatch(setDefectByCustomerVendorAction(defects))
            if(props.editData.record_kind === 'CUSTOMER' && productByDefect.length > 0){
                const replacementItems = []
                replacementItemsByReplacementId.replacementItems.forEach((item, index) => {
                    const selectedItem = productByType.find(d => d.item_id === item.item_id)
                    const selectedReplacementItem = productByDefect.find(d => d.item_id === item.replacing_item_id)
                    const insertItems = {
                        item_id: item.item_id,
                        name: selectedItem?.name || '',
                        quantity: replacementItemsByReplacementId.defectData[0].remaining_qty + item.quantity,
                        line: index + 1,
                        is_serialized: selectedItem ? selectedItem.is_serialized : '',
                        lots: item.lots.map((d) => ({lot_id: d.lot_id, lot_number: d.lot_number, item_id: d.item_id})),
                        item_cost_price: selectedItem?.item_cost_price || '',
                        item_unit_price: selectedItem?.item_unit_price || '',
                        available_quantity: replacementItemsByReplacementId.defectData[0].remaining_qty + item.quantity,
                        description: selectedItem?.description || '',
                        defectLots: selectedReplacementItem?.Lots || [],
                        sale_id: selectedItem?.sale_id || '',
                        receiving_id: selectedItem?.receiving_id || '',
                        replacing_item_id: item.replacing_item_id,
                        defect_item_id: selectedItem?.defect_item_id || '',
                        replacingQuantity: item.quantity,
                        replacingQuantityError: false,
                        replacingQuantityErrorMsg: ''
                    }
                    replacementItems.push(insertItems)
                })
                setFormValues((prev) => ({ ...prev, replacementItems: replacementItems }))
            }
            else if(replacementItemsByReplacementId.replacementItems.some(d => d.replacement_id === props.editData.replacement_id)){
                const vendorReplacementItems = []
                replacementItemsByReplacementId.replacementItems.forEach((item, index) => {
                    const selectedItem = productByType.find(d => d.item_id === item.item_id)
                    const insertItems = {
                        item_id: item.item_id,
                        name: selectedItem?.name || '',
                        quantity: item.quantity,
                        is_serialized: selectedItem ? selectedItem.is_serialized : '',
                        lots: item.lots.map((d) => ({lot_id: d.lot_id, lot_number: d.lot_number, item_id: d.item_id})),
                        line: index + 1,
                        item_cost_price: item?.item_cost_price || '',
                        item_unit_price: selectedItem?.item_unit_price || '',
                        description: item.description,
                        adjustedDefect: item.adjustedDefect ? item.adjustedDefect.map((d) => ({ ...d, isChecked: true })) : [],
                        qty_per_pack: selectedItem?.qty_per_pack || ''
                    }
                    vendorReplacementItems.push(insertItems)
                })
                setFormValues((prev) => ({ ...prev, vendorReplacementItems: vendorReplacementItems }))
            }
        }
    }, [replacementItemsByReplacementId, productByDefect, productByType, tabValue])

    useEffect(() => {
        if (selectData.product) {
            console.log('fadsjkfads')
            dispatch(listProductActionByType('purchase', null, null, null, async(response) => {
                const filter = [...response]
                const pop = filter.shift()
                const updatedVendorReplacementItems = formValues.vendorReplacementItems.map((d, index) => {
                    if(d.item_id === ''){
                        return {
                            ...d,
                            item_id: pop.item_id,
                            name: pop.name,
                            quantity: '',
                            is_serialized: pop.is_serialized,
                            lots: [],
                            line: index + 1,
                            item_cost_price: pop.item_cost_price || '',
                            item_unit_price: pop.item_unit_price || '',
                            description: d.description,
                            adjustedDefect: d.adjustedDefect,
                            qty_per_pack: pop.qty_per_pack
                        }
                    }
                    else{
                        return d
                    }
                })
                console.log('fadsjkfads', updatedVendorReplacementItems)
                setFormValues((prev) => ({ ...prev, vendorReplacementItems: updatedVendorReplacementItems }))
                setModalStatusHandler(false)
                setselectData('product', false)
            }))
        }
    }, [selectData.product])

      const debouncedGetLotDetails = useRef(
            debounce((searchValue, location_id, response) => {
                const payload = {
                    lot_number: searchValue,
                    location_id: location_id,
                    calledFrom: 'commonIssueReplacementLotSearch'
                }
                dispatch(getLotsDetailsForDefectsAction(payload, response))
            }, 300)
        ).current

    const handleLotNumberSearch = (value) => {

        if (!value) return;
        if (!formValues.customer) {
            setLotNumberMessage({
                success: false,
                error: true,
                message: 'Please select customer'
            })
            return
        }
        if (!formValues.location?.location_id) {
            setLotNumberMessage({
                success: false,
                error: true,
                message: 'Select any Location!'
            })
            return
        }
          if (!formValues.customerVendorDefect) {
            setLotNumberMessage({
                success: false,
                error: true,
                message: 'Please select collection'
            })
            return
        }
        // console.log("formValues.replacementItems?.name",formValues.replacementItems?.name)
        

        const lotExists = formValues.replacementItems.some(item =>
            item.lots?.some(lot => lot.lot_number === value)
        )

        if (lotExists) {
            setLotNumberMessage({
                success: false,
                error: true,
                message: 'Lot already entered'
            })
            return
        }
        debouncedGetLotDetails(
            value,
            formValues.location.location_id,
            (response) => {

                if (!response.length || !response[0].item_id) {
                    setLotNumberMessage({
                        success: false,
                        error: true,
                        message: 'Invalid Lot Number'
                    })
                    return
                }

                const lotData = response[0]
                const replacingProductId = lotData.item_id

                const replacingProduct = productByType.find(
                    p => p.item_id === replacingProductId
                )

                if (!replacingProduct) {
                    setLotNumberMessage({
                        success: false,
                        error: true,
                        message: 'Replacing product not found'
                    })
                    return
                }
                        // console.log("productByType",productByType.find(d => d.item_id === replacingProductId))

                let targetIndex = formValues.replacementItems.findIndex(
                    item => item.replacing_item_id === replacingProductId
                )
                // console.log("replacingProduct", replacingProduct, targetIndex)

                if (targetIndex === -1) {
                    targetIndex = formValues.replacementItems.findIndex(
                        item => !item.replacing_item_id
                    )
                }
                let items = [...formValues.replacementItems]
                // console.log("items",items)

                if (targetIndex === -1) {

                    const newRow = {
                        ...tempInsert,
                        replacing_item_id: replacingProductId,
                        replacingQuantity: 0,
                        lots: [],
                        line: items.length + 1
                    }

                    items.push(newRow)
                    targetIndex = items.length - 1
                }

                const targetItem = items[targetIndex]
                // console.log("targetItem", targetItem,targetIndex)

                const updatedLots = [
                    ...(targetItem.lots || []),
                    {
                        lot_number: lotData.lot_number,
                        lot_id: lotData.lot_id,
                        replacing_item_id: replacingProductId
                    }
                ]
                // console.log("updatedLots", updatedLots)


                items[targetIndex] = {

                    ...targetItem,
                    replacing_item_id: replacingProductId,
                    name: replacingProduct.name,
                    replacingQuantity: updatedLots.length,
                    lots: updatedLots,
                    is_serialized : updatedLots.length > 0 ? 1 : 0,
                    replacingQuantityError: false,
                    replacingQuantityErrorMsg: ''
                }

                setFormValues(prev => ({
                    ...prev,
                    replacementItems: items
                }))

                setLotNumberMessage({
                    success: true,
                    error: false,
                    message: 'Lot added successfully'
                })
                  setTimeout(() => {
                            setLotNumberSearch('')
                            setLotNumberMessage({ success: false, error: false, message: '' })
                        }, 500)

            }
        )
    }

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue)
        setFormValues((prev) => ({ ...prev, customer: null, vendor: null, location: null, customerVendorDefect: null, reference: null, note: null, replacement_date: moment().format('YYYY-MM-DD'), replacementItems: [tempInsert] }))
    }

    const handleChange = (name, value) => {
        setFormValues((prev) => ({ ...prev, [name]: value }))

        if (requiredFields.includes(name) && (value === null || value === '' || value === 'null')) {
            setFormErrors((prev) => ({ ...prev, [name]: 'required' }))
        }
        else {
            setFormErrors((prev) => ({ ...prev, [name]: null }))
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

    const handleLotNumberDialog = async(data) => {
        if(formValues.location){
            await setLotNumberData(data)
            setLotNumberDialog(true)
        }
        else{
            setFormErrors((prev) => ({ ...prev, location: 'required' }))
            dispatch(OpenalertActions({ msg: 'Please select location', severity: 'warning' }))
        }
    }

    const handleLotNumberDialogClose = () => {
        setLotNumberDialog(false)
        setLotNumberData(null)
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
        if (tabValue === 1 && formValues.replacementItems.length > 1) {
            const updatedReplacementItems = [...formValues.replacementItems]
            updatedReplacementItems.splice(index, 1)
            setFormValues((prev) => ({ ...prev, replacementItems: updatedReplacementItems }))
            handleDeleteDialogClose()
        }
        else if (tabValue === 2 && formValues.vendorReplacementItems.length > 1) {
            const updatedVendorReplacementItems = [...formValues.vendorReplacementItems]
            updatedVendorReplacementItems.splice(index, 1)
            setFormValues((prev) => ({ ...prev, vendorReplacementItems: updatedVendorReplacementItems }))
            handleDeleteDialogClose()
        }
    }

    const handleClickAway = () => {
        setEditDate(false)
        setHoverDate(false)
    }

    const handleReplacementSelectionChange = (event) => {
        if (event.target.checked) {
            const value = tabValue === 1 ? 'creditNote' : 'debitNote'
            setReplacementSelection(value)
            setConvertToCreditDebitNoteConfirmation(true)
        }
        else {
            setReplacementSelection('product')
            setConvertToCreditDebitNoteConfirmation(false)
        }
    }

    const handleCancelConvert = () => {
        setReplacementSelection('product')
        setConvertToCreditDebitNoteConfirmation(false)
    }

    const handleConfirmConvert = () => {
        if ((formValues.customer !== null || formValues.vendor !== null) && formValues.customerVendorDefect !== null && formValues.location !== null) {
            const payload = {
                location_id: formValues.location.location_id,
                employee_id: commoncookie,
                customer_id: tabValue === 1 ? formValues.customer.customer_id : null,
                sale_id: tabValue === 1 ? formValues.customerVendorDefect.sale_id : null,
                collection_id: tabValue === 1 ? formValues.customerVendorDefect.collection_id : null,
                vendor_id: tabValue === 2 ? formValues.vendor.supplier_id : null,
                receivings_id: tabValue === 2 ? formValues.customerVendorDefect.receivings_id : null,
                send_id: tabValue === 2 ? formValues.customerVendorDefect.send_id : null,
                type: tabValue === 1 ? 'Credit' : 'Debit',
                replacement_date: moment(formValues.replacement_date).format('YYYY-MM-DD'),
                ...(tabValue === 1 ? {
                    customerReplacementItems: productByDefect.map(d => ({ ...d, defectLots: d.Lots })),
                    total: productByDefect.reduce((sum, list) => sum + (Number(list.item_unit_price) * Number(list.quantity)), 0),
                    collection_number: formValues.customerVendorDefect.collection_number,
                } : {
                    vendorReplacementItems: productByDefect.map(d => ({ ...d, defectLots: d.Lots })),
                    total: productByDefect.reduce((sum, list) => sum + (Number(list.item_cost_price) * Number(list.quantity)), 0),
                    send_defect_number: formValues.customerVendorDefect.send_defect_number,
                })
            }
            dispatch(convertToCreditDebitNoteAction(payload, tabValue, async (response) => {
                const res = await response
                if (res.status === 200) {
                    props.handleClose(true)
                }
            }))
        }
        else {
            setReplacementSelection('product')
            dispatch(OpenalertActions({ msg: `Please make sure ${tabValue === 1 ? 'Customer' : 'Vendor'}, ${tabValue === 1 ? 'Defect Collection' : 'Defect Sent'} and Location are selected`, severity: 'warning' }))
        }
        setConvertToCreditDebitNoteConfirmation(false)
    }

    const handleSubmit = (event) => {
        event.preventDefault()

       let isValid = true;
        const formErrorObj = {};

        requiredFields.forEach((field) => {
            const value = formValues[field];
            if (!value || value === 'null' || value === '') {
            formErrorObj[field] = 'required';
            isValid = false;
            }
        });

        if (tabValue === 1 && formValues.replacementItems.some(item => item.name === '')) {
            formErrorObj.replacementItems = 'required';
            isValid = false;
        }
        if(tabValue === 2 && formValues.vendorReplacementItems.some(d => d.item_id === '')){
            formErrorObj.vendorReplacementItems = 'required'
            isValid = false
        }

        setFormErrors(formErrorObj);

        if (!isValid) return;

        if (isValid) {
            if (tabValue === 1) {
                const replacementItems = formValues.replacementItems.filter(d => d.replacing_item_id !== '' && d.replacing_item_id !== null).map((r, i) => ({
                    ...r,
                    lots: r.lots.map((lot, i) => ({
                        lot_number: lot.lot_number,
                        lot_id: lot.lot_id,
                        replacing_lot_number: r.defectLots.filter(d => d.item_id === r.item_id).sort((a, b) => a.lot_id - b.lot_id)[i]?.lot_number || '',
                        replacing_item_id: lot.replacing_item_id,
                        sale_id: r.defectLots.filter(d => d.item_id === r.item_id).sort((a, b) => a.lot_id - b.lot_id)[i]?.sale_id || '',
                        oldlot_id: r.defectLots.filter(d => d.item_id === r.item_id).sort((a, b) => a.lot_id - b.lot_id)[i]?.lot_id || ''
                    }))
                }))
                const payload = {
                    location_id: formValues.location.location_id,
                    employee_id: commoncookie,
                    collection_id: formValues.customerVendorDefect.collection_id,
                    replacement_date: moment(formValues.replacement_date).format('YYYY-MM-DD'),
                    customer_id: formValues.customer.customer_id,
                    reference: formValues.reference,
                    note: formValues.note,
                    total: formValues.replacementItems.reduce((sum, list) => sum + (Number(list.item_unit_price) * Number(list.quantity)), 0),
                    status: 1,
                    customerReplacementItems: replacementItems
                }
                if(props.status === 'edit'){
                    dispatch(editReplacementAction('CUSTOMER', props.editData.replacement_id, payload, async(response) => {
                        const res = await response
                        if(res.status === 200){
                            props.handleClose(true)
                        }
                    }))
                }
                else{
                    dispatch(createCustomerReplacementAction(payload, async (response) => {
                        const res = await response
                        if (res.status === 200) {
                            const payload = {
                                page: 0,
                                numPerPage: props?.pagination?.numPerPage ?? 20,
                                searchString: '',
                                from: null,
                                to: null,
                                min_price: '',
                                max_price: '',
                                brand: '',
                                category: '',
                                location_id: headerLocationId,
                                type: 'issueReplacement'
                            }
                            dispatch(listReplacementAction(payload, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler, async(getResponse) => {
                                const newData = await getResponse.data.find(d => d.replacement_id === response.data.masterinsert.insertId && d.record_kind === 'CUSTOMER')
                                if(props.type === 'issueReplacement'){
                                    props.handleReplacementOpen(newData)
                                }
                                else {
                                    props.handleInvoiceClick(newData)
                                }
                            }))
                            // props.handleClose(true)
                        }
                    }))
                }
            }
            else {
                // const vendorReplacementItems = formValues.replacementItems.map((r) => ({
                //     ...r,
                //     lots: r.lots.map((lot, i) => ({
                //         lot_number: lot.lot_number,
                //         oldlot_id: r.defectLots.filter(d => d.item_id === r.item_id).sort((a, b) => a.lot_id - b.lot_id)[i]?.lot_id || '',
                //         replacing_lot_number: r.defectLots.filter(d => d.item_id === r.item_id).sort((a, b) => a.lot_id - b.lot_id)[i]?.lot_number || '',
                //         replacing_item_id: lot.replacing_item_id,
                //         lot_id: lot.lot_id,
                //         receiving_id: r.defectLots.filter(d => d.item_id === r.item_id).sort((a, b) => a.lot_id - b.lot_id)[i]?.receiving_id || '',
                //     }))
                // }))
                const payload = {
                    location_id: formValues.location.location_id,
                    employee_id: commoncookie,
                    // send_id: formValues.customerVendorDefect.send_id,
                    replacement_date: moment(formValues.replacement_date).format('YYYY-MM-DD'),
                    vendor_id: formValues.vendor.supplier_id,
                    // receivings_id: formValues.customerVendorDefect.receivings_id,
                    reference: formValues.reference,
                    note: formValues.note,
                    total: formValues.vendorReplacementItems.reduce((sum, list) => sum + (Number(list.item_cost_price) * Number(list.quantity)), 0),
                    status: 1,
                    vendorReplacementItems: formValues.vendorReplacementItems.filter(d => d.item_id !== '' && d.item_id !== null)
                }
                if(props.status === 'edit'){
                    dispatch(editReplacementAction('VENDOR', props.editData.replacement_id, payload, async(response) => {
                        const res = await response
                        if(res.status === 200){
                            props.handleClose(true)
                        }
                    }))
                }
                else{
                    dispatch(createVendorReplacementAction(payload, async(response) => {
                        const res = await response
                        if (res.status === 200) {
                            const payload = {
                                page: 0,
                                numPerPage: props?.pagination?.numPerPage ?? 20,
                                searchString: '',
                                from: null,
                                to: null,
                                min_price: '',
                                max_price: '',
                                brand: '',
                                category: '',
                                location_id: headerLocationId,
                                type: 'collectReplacement'
                            }
                            dispatch(listReplacementAction(payload, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler, async(getResponse) => {
                                const newData = await getResponse.data.find(d => d.replacement_id === response.data.masterinsert.insertId && d.record_kind === 'VENDOR')
                                if(props.type === 'collectReplacement'){
                                    props.handleReplacementOpen(newData)
                                }
                                else {
                                    props.handleInvoiceClick(newData)
                                }
                            }))
                            // props.handleClose(true)
                        }
                    }))
                }
            }
        }
    }

    const handleDefectAdjustmentOpen = (data, dialogValue, index) => {
        setLotNumberData(data)
        setDefectAdjustmentDialog(dialogValue)
        setDefectAdjustmentIndex(index)
    }

    const handleAdjustmentSubmit = (data) => {
        const updatedVendorReplacementItems = formValues.vendorReplacementItems.map((d, i) => {
            if(defectAdjustmentIndex === i){
                return{
                    ...d,
                    adjustedDefect: data
                }
            }
            else{
                return d
            }
        })
        setFormValues((prev) => ({ ...prev, vendorReplacementItems: updatedVendorReplacementItems }))
        setDefectAdjustmentDialog(false)
        setLotNumberData(null)
    }

    const filteredProducts = (currentIndex) => {
        const replacedQtyMap = formValues.replacementItems.reduce((acc, item, idx) => {
            if (item.defect_item_id && item.replacing_item_id !== '' && idx !== currentIndex) {
                acc[item.defect_item_id] =
                    (acc[item.defect_item_id] || 0) + Number(item.replacingQuantity || 0)
            }
            return acc
        }, {})

        return productByDefect.filter((s) => {
            const replacedQty = replacedQtyMap[s.defect_item_id] || 0
            return replacedQty < Number(s.quantity)
        })
    }

    const encodeImageFileAsURL = (e) => {
        const reader = new FileReader();
        const rABS = !!reader.readAsBinaryString;
        const file = e.target.files[0];


        reader.onload = async (e) => {
            setFileOpen(false)
            const bstr = e.target.result;
            const wb = read(bstr, { type: rABS ? 'binary' : 'array', bookVBA: true });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const temp1 = utils.sheet_to_json(ws);

            const temp_1_xl_data = temp1.filter(i => i.ProductName && i.PurchaseQuantity && i.PurchaseCost)

            const data = temp_1_xl_data.map((i) => (removeUnnecessaryChar(i)));

            function removeUnnecessaryChar(data) {

                const conversion = {
                    LotNumber(val) {
                        return typeof val === 'string' ? val.trim() : String(val).trim();
                    },
                    PurchaseQuantity(val) {
                        return parseInt(val)
                    },
                    PurchaseCost(val) {
                        return parseFloat(val)
                    },
                }

                let tempObj = {}

                for (let key in data) {
                    let val = data[key]
                    let modifiedVal;
                    if (val !== undefined && typeof val === 'string') {
                        modifiedVal = val.replace(/(\r\n|\n|\r)/gm, "").trim()
                    }
                    if (['LotNumber', 'PurchaseQuantity', 'PurchaseCost'].includes(key)) {
                        tempObj[key] = conversion[key](modifiedVal || val)
                    } else {
                        tempObj[key] = modifiedVal || val
                    }
                }

                return tempObj
            }


            const invalidLotQuantities = data.filter(
                (row) => row.LotNumber && row.PurchaseQuantity !== 1
            );

            if (invalidLotQuantities.length > 0) {
                const errorRows = invalidLotQuantities.map(row => `Product: ${row.ProductName}, Lot: ${row.LotNumber}, Quantity: ${row.PurchaseQuantity}`)
                ErrormsgAlert(dispatch, `Serialized Product each row one purchase quantity is only allowed.\nInvalid entries:\n${errorRows.join('\n')}`)

                return
            }
            const withItemId = []
            const wOutItemId = []
            let supplier_id = ''
            let flag = false;

            if (data.length) {
                if (formValues.vendor) {
                    const res = customerAsCompany.filter(d => d.company_name && d.supplier_id && d.supplier_id !== null && d.supplier_id === formValues.vendor.supplier_id)

                    if (res.length) {
                        setFormValues((prev) => ({ ...prev, vendor: res[0] ?? null }))
                        supplier_id = res[0]?.supplier_id
                    }
                    const matchingProduct = data.filter(i => productByType.some(j => j.name === i.ProductName)).map(i => {
                        let p = productByType.find(j => j.name === i.ProductName)
                        return { ...i, ...p }
                    })

                    let lotAlreadyExistInDb = [];
                    const checkLotExits = async () => {
                        const _lots = data
                            .map(i => i.LotNumber?.toString().trim())
                            .filter(lot => lot && lot !== "");
                        if (_lots.length === 0) {
                            lotAlreadyExistInDb = [];
                            return;
                        }

                        const { data: existLots, loading, error } = await customFetch(
                            API_URLS.PURCHASE_CHECK_LOT_EXISTS,
                            'POST',
                            { lotNumbers: _lots }
                        )
                        const temp = data.filter(i => existLots.includes(i.LotNumber))
                        lotAlreadyExistInDb = temp
                    }
                    await checkLotExits()

                    if (lotAlreadyExistInDb.length > 0) {
                        let temp = lotAlreadyExistInDb.map(item => { return { ['name']: item.ProductName, ['lot']: item.LotNumber } })
                        setUploadErrors((prev) => ({ ...prev, lotAlreadyExistInDb: ['Lot Already Exits in Database', temp] }))
                        flag = false;
                    }
                    else {
                        let lotCount = {};
                        data.forEach(item => {
                            const lot = item.LotNumber?.toString().trim();
                            if (!lot) return;
                            if (!lotCount[lot]) lotCount[lot] = [];
                            lotCount[lot].push(item);
                        });

                        let tempDuplicateLot = [];

                        for (const [lot, items] of Object.entries(lotCount)) {
                            if (items.length > 1) {
                                items.forEach(item => {
                                    tempDuplicateLot.push({
                                        name: item.ProductName,
                                        lot: lot
                                    });
                                });
                            }
                        }
                        if (tempDuplicateLot.length > 0) {
                            flag = false;
                            setUploadErrors((prev) => ({ ...prev, duplicateLotNumber: ['Duplicate Lot Number', tempDuplicateLot] }))
                        } else {
                            flag = true;
                        }
                    }
                    const helper = []
                    const result = matchingProduct.reduce((a, c) => {
                        const key = c.ProductName + c.PurchaseCost;
                        if (!helper[key]) {
                            helper[key] = { ...c };
                            a.push(helper[key])
                        } else {
                            helper[key].PurchaseQuantity += c.PurchaseQuantity;
                        }
                        return a
                    }, [])
                    console.log(result, 'result')
                    result.forEach((t, index) => {
                        const {
                            cost_price: PurchaseCost,
                            unit_price: item_unit_price,
                            taxes,
                        } = t;
                        let gst;
                        let tax_category;
                        taxes.forEach((s) => {
                            if (s.tax_group === 'IGST') {
                                gst = s.tax_rate;
                                tax_category = s.tax_category;
                            }
                        })
                        let lots = data.filter(f => f.ProductName === t.name && f.PurchaseCost === t.PurchaseCost).map(m => {
                            return { lot_number: m.LotNumber }
                        })
                        let quantity = t.PurchaseQuantity
                        let cost_priceProduct = t.PurchaseCost
                        withItemId.push({
                            ...vendorReplacementItemTempInsert,
                            item_id: t.item_id,
                            name: t.name,
                            quantity: quantity,
                            is_serialized: t.is_serialized,
                            lots: lots,
                            line: withItemId.length + 1,
                            item_cost_price: cost_priceProduct && cost_priceProduct !== '' ? cost_priceProduct : t.cost_price,
                            item_unit_price: t.unit_price ? t.unit_price : 0,
                            description: t.description,
                            adjustedDefect: [],
                            qty_per_pack: t.qty_per_pack
                        });
                    })
                    let MisMatchProduct = data.filter(d => !productByType.some(f => f.name === d.ProductName))
                    MisMatchProduct.forEach((misMatch, index) => {
                        wOutItemId.push(misMatch);
                    })
                }
                else {
                    alert('Select Vendor');
                    return;
                }
            }
            if (wOutItemId.length) {
                const dataApi = wOutItemId.map((d) => {
                    const newD = {
                        name: d.ProductName,
                        cost_price: d.PurchaseCost || 0,
                        receiving_quantity: 0,
                        qty_per_pack: 1,
                        is_serialized:
                            typeof d.LotNumber !== 'undefined' &&
                                d.LotNumber !== '' &&
                                d.LotNumber !== null
                                ? 1
                                : 0,
                        hsn_code: null,
                        brand: null,
                        category: null,
                        model: null,
                        unit_price: null,
                        sku: null,
                        tax_category_id: null,
                        max_price: 0,
                    };
                    delete newD.LotNumber;

                    return {
                        ...newD,
                        stock_type: 1,
                        unit_price: +d.unit_price || d.cost_price,
                    };
                });
                if (flag) {
                    setUploadData((prev) => ({ ...prev, mp_open: true, dataApi, withItemId, xl_data: data }));
                } else {
                    setOpenAlert(true)
                }
            } else {
                let RowData = withItemId.map((row, i) => {
                    let check = formValues.vendorReplacementItems.filter(item => item.item_id === row.item_id)
                    if (check.length) {
                        return { ...row, receiving_id: check[0]?.receiving_id, receiving_item_id: check[0]?.receiving_item_id, line: i + 1 }
                    } else {
                        return row
                    }

                })
                if (flag) {
                    // this.props.setitemsData(this.props.status !== 'edit' ? withItemId : RowData);
                    setFormValues((prev) => ({ ...prev, vendorReplacementItems: props.status !== 'edit' ? withItemId : RowData }))
                } else {
                    // this.setState({ openAlert: true })
                }
            }
        }

        if (rABS) {
            reader.readAsBinaryString(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
        setFileOpen(false)
    }

    const handleAutoSearchApicall = (searchText) => {
        dispatch(setSearchByCustomerSupplierDataAction([]))
        const types = tabValue === 1 ? 'Customer' : 'Supplier'
        const payload = {
            searchString: searchText
        }
        dispatch(getSearchByCustomerSupplierAction(
            payload, 
            types,
            setModalTypeHandler,
            setLoaderStatusHandler
        ))
    }

    const handleCloseCustomerDetails = () => {
        if(tabValue === 1) {
            setFormValues((prev) => ({...prev, customer: null}))
        }
        else {
            setFormValues((prev) => ({...prev, vendor: null}))
        }
        setCustomerVendorSearchText('')
        dispatch(setSearchByCustomerSupplierDataAction([]))
    }

    useEffect(() => {
        if(props.status === 'edit' || props.type === 'issueReplacement' || props.type === 'collectReplacement') {
            const type = tabValue === 1 ? 'Customer' : 'Supplier'
            const customerSupplierId = tabValue === 1 ? (props?.data?.customer_id ?? props.editData?.customer_id) : (props?.data?.supplier_id ?? props.editData?.supplier_id)
            apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                dispatch(getCustomerSupplierDataByIdAction(type, customerSupplierId))
            )
        }
    }, [props.status, tabValue, props.type])
    
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
                        {
                            // (props.type !== 'issueReplacement' && props.type !== 'collectReplacement') &&
                            // <Grid size={12}>
                            //     <Tabs value={tabValue} onChange={handleTabChange}>
                            //         <Tab label='Issue Replacement' value={1}></Tab>
                            //         <Tab label='Collect Replacement' value={2}></Tab>
                            //     </Tabs>
                            // </Grid>
                        }

                        <Grid
                            size={{
                                lg: 9,
                                md: 9,
                                sm: 6,
                                xs: 6
                            }}>
                            <Typography variant='h6'>
                                {tabValue === 1 ? 'Issue Replacement' : 'Collect Replacement'}
                            </Typography>
                        </Grid>

                        <Grid
                            size={{
                                lg: 3,
                                md: 3,
                                sm: 6,
                                xs: 6
                            }}>
                            {
                                editDate && props.status !== 'edit' ? (
                                    <ClickAwayListener onClickAway={handleClickAway}>
                                        <Box>
                                            <LocalizationProvider dateAdapter={DataAdapter}>
                                                <DatePicker
                                                    format='DD-MM-YYYY'
                                                    disabled={props.status === 'edit'}
                                                    value={moment(formValues.replacement_date, 'YYYY-MM-DD').format('YYYY/MM/DD')}
                                                    label='Replacement Date'
                                                    onChange={(newValue) => {
                                                        handleChange('replacement_date', moment(newValue).format('YYYY-MM-DD'))
                                                        setEditDate(false)
                                                        setHoverDate(false)
                                                    }}
                                                    slotProps={{ textField: { fullWidth: true, variant: 'filled', onBlur: () => setEditDate(false), inputProps: {
                                                                ...params.inputProps,
                                                                readOnly: true
                                                            } } }}
                                                />
                                            </LocalizationProvider>
                                        </Box>
                                    </ClickAwayListener>
                                ) : (
                                    <Box
                                        onClick={() => setEditDate(true)}
                                        onMouseEnter={() => setHoverDate(true)}
                                        onMouseLeave={() => setHoverDate(false)}
                                        sx={{
                                            display : 'inline-block',
                                            cursor : 'pointer',
                                            padding : '4px 8px',
                                            borderRadius : hoverDate && props.status !== 'edit' ? '6px' : '0px',
                                            border : hoverDate && props.status !== 'edit' ? '1px solid #ccc' : 'none',
                                            backgroundColor : hoverDate && props.status !== 'edit' ? '#fff' : 'transparent',
                                            transition : 'all 0.2s ease-in-out',
                                        }}
                                    >
                                        <Typography variant='h6'>
                                            {`Replacement Date: ${moment(formValues.replacement_date, 'YYYY-MM-DD').format('DD/MM/YYYY')}`}
                                        </Typography>
                                    </Box>
                                )
                            }
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
                                    {
                                        tabValue === 1 ? (
                                            <Autocomplete
                                                fullWidth
                                                disableClearable
                                                disabled={props.status === 'edit' || props.type === 'issueReplacement'}
                                                freeSolo={customerVendorSearchText.length <= 3}
                                                inputValue={customerVendorSearchText}
                                                onInputChange={(event, newInputValue, reason) => {
                                                    if(reason === 'input') {
                                                        setCustomerVendorSearchText(newInputValue)
                                                        if(newInputValue !== '') {
                                                            handleAutoSearchApicall(newInputValue)
                                                        }
                                                        if(newInputValue === '') {
                                                            setFormValues((prev) => ({...prev, customer: null}))
                                                            dispatch(setSearchByCustomerSupplierDataAction([]))
                                                        }
                                                    }
                                                }}
                                                value={formValues.customer}
                                                options={customerAsCompany.filter(d => d.company_name !== null && d.company_name !== '' && d.customer_id && d.customer_type === '1')}
                                                getOptionLabel={(option) => option.company_name}
                                                onChange={(event, newValue) => {
                                                    handleChange('customer', newValue)
                                                    setCustomerVendorSearchText(newValue?.company_name || '')
                                                }}
                                                renderInput={(params) => {
                                                    const get = {...params}
                                                    let startAdornment = null
                                                    return (
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
                                                                input: (props.type !== 'issueReplacement' && props.status !== 'edit') && {
                                                                    ...get.InputProps,
                                                                    startAdornment: startAdornment,
                                                                    endAdornment: (
                                                                        <>
                                                                            {
                                                                                formValues.customer === null ?
                                                                                // <IconButton
                                                                                //     size="small"
                                                                                //     onClick={() => {
                                                                                //         handleCustomerSearchAPICall(customerVendorSearchText)
                                                                                //     }}
                                                                                // >
                                                                                //     <SearchIcon />
                                                                                // </IconButton> 
                                                                                '' :
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
                                                                    )
                                                                }
                                                            }}
                                                        />
                                                    )
                                                }}
                                            />
                                        ) : (
                                            <Autocomplete
                                                fullWidth
                                                disableClearable
                                                disabled={props.status === 'edit' || props.type === 'collectReplacement'}
                                                freeSolo={customerVendorSearchText.length <= 3}
                                                inputValue={customerVendorSearchText}
                                                onInputChange={(event, newInputValue, reason) => {
                                                    if(reason === 'input') {
                                                        setCustomerVendorSearchText(newInputValue)
                                                        if(newInputValue !== '') {
                                                            handleAutoSearchApicall(newInputValue)
                                                        }
                                                        if(newInputValue === '') {
                                                            setFormValues((prev) => ({...prev, vendor: null}))
                                                            dispatch(setSearchByCustomerSupplierDataAction([]))
                                                        }
                                                    }
                                                }}
                                                value={formValues.vendor}
                                                options={customerAsCompany.filter(d => d.supplier_id)}
                                                getOptionLabel={(option) => option.company_name}
                                                onChange={(event, newValue) => {
                                                    handleChange('vendor', newValue)
                                                    setCustomerVendorSearchText(newValue?.company_name || '')
                                                }}
                                                renderInput={(params) => {
                                                    const get = {...params}
                                                    let startAdornment = null
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
                                                                input: (props.type !== 'collectReplacement') && (props.status !== 'edit') && {
                                                                    ...get.InputProps,
                                                                    startAdornment: startAdornment,
                                                                    endAdornment: (
                                                                        <>
                                                                            {
                                                                                formValues.vendor === null ?
                                                                                // <IconButton
                                                                                //     size="small"
                                                                                //     onClick={() => {
                                                                                //         handleCustomerSearchAPICall(customerVendorSearchText)
                                                                                //     }}
                                                                                // >
                                                                                //     <SearchIcon />
                                                                                // </IconButton> 
                                                                                '' :
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
                                                                    )
                                                                }
                                                            }}
                                                        />
                                                    )
                                                }}
                                            /> 
                                        )
                                    }
                                </Grid>

                                <Grid
                                    size={{
                                        lg: 3,
                                        md: 4,
                                        sm: 6,
                                        xs: 12
                                    }}>
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

                                {
                                    tabValue === 1 &&
                                    <Grid
                                        size={{
                                            lg: 3,
                                            md: 4,
                                            sm: 6,
                                            xs: 12
                                        }}>
                                        <Autocomplete
                                            value={formValues.customerVendorDefect}
                                            options={defectByCustomerVendor}
                                            getOptionLabel={(option) => tabValue === 1 ? option.collection_number : option.send_defect_number}
                                            onChange={(event, newValue) => handleChange('customerVendorDefect', newValue)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    required
                                                    fullWidth
                                                    variant='filled'
                                                    label={tabValue === 1 ? 'Collection' : 'Send Defect'}
                                                    error={formErrors.customerVendorDefect}
                                                    helperText={formErrors.customerVendorDefect === 'required' ? `${tabValue === 1 ? 'Collection' : 'Send Defect'} is Required` : ''}
                                                />
                                            )}
                                        />
                                    </Grid>
                                }
                                
                                <Grid
                                    size={{
                                        lg: 3,
                                        md: 4,
                                        sm: 6,
                                        xs: 12
                                    }}>
                                    <TextField
                                        value={formValues.reference}
                                        label='Reference'
                                        fullWidth
                                        variant='filled'
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
                                        value={formValues.note}
                                        label='Note'
                                        fullWidth
                                        variant='filled'
                                        onChange={(event) => handleChange('note', event.target.value)}
                                    />
                                </Grid>

                                {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                    <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
                                        <Typography>Product</Typography>
                                        <Switch checked={replacementSelection === (tabValue === 1 ? 'creditNote' : 'debitNote')} onChange={handleReplacementSelectionChange} slotProps={{ input: { 'aria-label': 'controlled' } }} />
                                        <Typography>{ tabValue === 1 ? 'Credit Note' : 'Debit Note' }</Typography>
                                    </Stack>
                                </Grid> */}
                            </Grid>       
                        </Grid>
                        {
                            tabValue === 1 &&
                            <Grid size={12}>
                                <Grid container spacing={3} display='flex' justifyContent='space-between' alignItems='center'>
                                <Grid>
                            <Typography variant='h6'>Replacement Products</Typography>
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
                                                            <IconButton onClick={async () => {
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

                        }
                        {
                            tabValue === 2 &&
                            <Grid size={12}>
                                <Typography variant='h6'>Replacement Products</Typography>
                            </Grid>
                        }
                     
                        
                        {
                            tabValue === 1 &&
                            <Grid size={12}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ width: 200 }}>Product</TableCell>
                                            <TableCell sx={{ width: 180 }}>Description</TableCell>
                                            <TableCell sx={{ width: 100}}>Qty</TableCell>
                                            <TableCell sx={{ width: 200 }}>Defect Serial / Lot #</TableCell>
                                            <TableCell sx={{ width: 170 }}>Replacing Product</TableCell>
                                            <TableCell sx={{ width: 100}}>Replacing Qty</TableCell>
                                            <TableCell sx={{ width: 200 }}>Replacement Serial / Lot #</TableCell>
                                            <TableCell sx={{ width: 10 }}></TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {
                                            (props.type || props.status ? productByDefect.length > 0 : true) && formValues.replacementItems.map((item, index) => (
                                                <TableRow key={item.item_id}>
                                                    <TableCell>
                                                        <Autocomplete
                                                            value={productByDefect.find(d => d.item_id === item.item_id)}
                                                            options={filteredProducts(index)}
                                                            getOptionLabel={(option) => option.name}
                                                            onChange={(event, newValue) => {
                                                                let updatedReplacementItems = []
                                                                if (newValue === null) {
                                                                    updatedReplacementItems = formValues.replacementItems.map((d, i) => {
                                                                        if (index === i) {
                                                                            return { ...tempInsert, line: index + 1 }
                                                                        }
                                                                        else {
                                                                            return d
                                                                        }
                                                                    })
                                                                }
                                                                else {
                                                                    updatedReplacementItems = formValues.replacementItems.map((d, i) => {
                                                                        if (index === i) {
                                                                            return {
                                                                                ...d,
                                                                                item_id: newValue.item_id,
                                                                                name: newValue.name,
                                                                                quantity: newValue.quantity,
                                                                                is_serialized: newValue.is_serialized,
                                                                                lots: [],
                                                                                line: index + 1,
                                                                                item_cost_price: newValue.item_cost_price,
                                                                                item_unit_price: newValue.item_unit_price,
                                                                                available_quantity: newValue.Lots.length,
                                                                                description: newValue.description ?? '',
                                                                                defectLots: newValue.Lots,
                                                                                sale_id: newValue?.sale_id ?? '',
                                                                                receiving_id: newValue?.receiving_id ?? '',
                                                                                defect_item_id: newValue.defect_item_id,
                                                                                replacingQuantity: 1,
                                                                                replacingQuantityError: false,
                                                                                replacingQuantityErrorMsg: '',
                                                                            }
                                                                        }
                                                                        else {
                                                                            return d
                                                                        }
                                                                    })
                                                                }
                                                                setFormValues((prev) => ({ ...prev, replacementItems: updatedReplacementItems }))
                                                            }}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    { ...params }
                                                                    label='Product'
                                                                    variant='standard'
                                                                />
                                                            )}
                                                        />
                                                    </TableCell>

                                                    <TableCell>
                                                        {item?.description}
                                                    </TableCell>

                                                    <TableCell>
                                                        {item?.quantity}
                                                    </TableCell>

                                                    <TableCell>
                                                        {item?.defectLots.map(d => d.lot_number).join(', ')}
                                                    </TableCell>

                                                    <TableCell>
                                                        {
                                                            <Autocomplete
                                                                value={
                                                                    productByType.find(
                                                                        d => Number(d.item_id) === Number(item.replacing_item_id)
                                                                    ) || null
                                                                }
                                                                options={productByType.filter(d => d.is_serialized === item.is_serialized)}
                                                                getOptionLabel={(option) => option.name}
                                                                onChange={(event, newValue) => {

                                                                    const updatedReplacementItems = formValues.replacementItems.map((d, i) => {

                                                                        if (i !== index) return d
                                                                        if (!newValue) {
                                                                            return {
                                                                                ...d,
                                                                                replacing_item_id: '',
                                                                                replacingQuantity: '',
                                                                                lots: [],
                                                                                replacingQuantityError: false,
                                                                                replacingQuantityErrorMsg: ''
                                                                            }
                                                                        }

                                                                        return {

                                                                            ...d,

                                                                            replacing_item_id: newValue.item_id,
                                                                            lots: [],
                                                                            replacingQuantity: 0,
                                                                            is_serialized: newValue.is_serialized,
                                                                            item_unit_price: newValue.unit_price,
                                                                            item_cost_price: newValue.cost_price,
                                                                            description: newValue.description || '',
                                                                            replacingQuantityError: false,
                                                                            replacingQuantityErrorMsg: ''
                                                                        }

                                                                    })

                                                                    setFormValues(prev => ({
                                                                        ...prev,
                                                                        replacementItems: updatedReplacementItems
                                                                    }))
                                                                }}
                                                                renderInput={(params) => (
                                                                    <TextField
                                                                        { ...params }
                                                                        label='Replacing Product'
                                                                        variant='standard'
                                                                    />
                                                                )}
                                                            />
                                                        }
                                                    </TableCell>

                                                    <TableCell>
                                                        {
                                                            item.replacing_item_id !== '' ? (
                                                                <TextField
                                                                    name={`replacingQuantity${index}`}
                                                                    value={item.replacingQuantity}
                                                                    variant='standard'
                                                                    type='number'
                                                                    onChange={(event) => {
                                                                        const oldQuantity = currentQuantity
                                                                        const oldLots = currentLots
                                                                        const value = event.target.value === '' ? '' : parseInt(event.target.value)
                                                                        let replacingQuantityError = false
                                                                        let reducedQuantity = 0
                                                                        if (value === '') {
                                                                            setCurrentLots(item.lots)
                                                                            setCurrentQuantity(item.replacingQuantity)
                                                                        }
                                                                        if(item.quantity < value){
                                                                            replacingQuantityError = true
                                                                        }
                                                                        else{
                                                                            replacingQuantityError = false
                                                                        }

                                                                        if (oldQuantity > value) {
                                                                            reducedQuantity = oldQuantity - (value === '' ? 0 : value)
                                                                        }
                    
                                                                        const updatedReplacementItems = formValues.replacementItems.map((d, i) => {
                                                                            const newLotsLength = Math.max(oldLots.length - reducedQuantity, 0)
                                                                            const updatedLots = oldLots.slice(0, newLotsLength)
                                                                            if (index === i) {
                                                                                return {
                                                                                    ...d,
                                                                                    replacingQuantity: value,
                                                                                    lots: value === '' ? item.lots : oldLots.length > 0 ? updatedLots : item.lots,
                                                                                    replacingQuantityError: replacingQuantityError,
                                                                                    replacingQuantityErrorMsg: replacingQuantityError ? 'Replacing quantity is greater than the defect quantity' : ''
                                                                                }
                                                                            }
                                                                            else {
                                                                                return d
                                                                            }
                                                                        })
                                                                        setFormValues((prev) => ({ ...prev, replacementItems: updatedReplacementItems }))
                                                                    }}
                                                                    error={item.replacingQuantityError}
                                                                    helperText={item.replacingQuantityErrorMsg}
                                                                />
                                                            ) : ''
                                                        }
                                                    </TableCell>

                                                    <TableCell>
                                                        <Stack flexDirection='row' gap={5}>
                                                            {
                                                                item.replacing_item_id !== '' ?
                                                                    item.is_serialized === 1 &&
                                                                    <Tooltip title='Serial Number'>
                                                                            <Icon
                                                                                style={{
                                                                                    color: item.replacingQuantity > 0 && !item.replacingQuantityError ?
                                                                                        Number(item.replacingQuantity) === item.lots.length ?
                                                                                            'green'
                                                                                        : 'red'
                                                                                    : 'grey'
                                                                                }}
                                                                                onClick={(event) => item.replacingQuantityError ? event.preventDefault() : handleLotNumberDialog(item)}
                                                                            >
                                                                                toc
                                                                            </Icon>
                                                                    </Tooltip>
                                                                : ''
                                                            }

                                                            {
                                                                    item.is_serialized === 1 && item.lots.length > 0 &&
                                                                    <Tooltip title='view'>
                                                                        <Icon
                                                                            onClick={() => handleViewSerialNumber(item)}
                                                                        >
                                                                            visibility
                                                                        </Icon>
                                                                    </Tooltip>
                                                            }
                                                        </Stack>
                                                    </TableCell>

                                                    <TableCell>
                                                        <Stack flexDirection='row'>
                                                            {
                                                                formValues.replacementItems.length > 1 &&
                                                                <IconButton onClick={item.name.length > 0 ? () => handleDeleteDialogOpen(index) : () => deleteProductRowData(index)}>
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            }

                                                            {
                                                                index === formValues.replacementItems.length - 1 &&
                                                                <IconButton onClick={() => setFormValues((prev) => ({ ...prev, replacementItems: [...prev.replacementItems, { ...tempInsert, line: index + 2 }] }))}>
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
                        }

                        {
                            tabValue === 2 &&
                            <>
                                <Grid size={12} display='flex' justifyContent='flex-end'>
                                    <IconButton onClick={() => setFileOpen(true)}>
                                        <UploadFile />
                                    </IconButton>
                                </Grid>

                                <Grid size={12}>
                                    <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell width={150}>Product</TableCell>
                                            <TableCell width={50}>Replacing Qty</TableCell>
                                            <TableCell width={50}>Buying Cost</TableCell>
                                            <TableCell width={80}>Replacement Lot / Serial #</TableCell>
                                            <TableCell width={80}>Defect Adjustment</TableCell>
                                            <TableCell width={80}></TableCell>
                                        </TableRow>
                                    </TableHead>

                                        <TableBody>
                                            {
                                                (props.status === 'edit' ? productByType.length > 0 && formValues.vendorReplacementItems.length > 0 : true) && formValues.vendorReplacementItems.map((item, index) => (
                                                    <TableRow key={item.line}>
                                                        <TableCell>
                                                            <Autocomplete
                                                                value={productByType.find(d => d.item_id === item.item_id) || null}
                                                                options={productByType}
                                                                getOptionLabel={(option) => option.name}
                                                                onChange={(event, newValue) => {
                                                                    let updatedVendorReplacementItems = []
                                                                    if(newValue === null){
                                                                        updatedVendorReplacementItems = formValues.vendorReplacementItems.map((d, i) => {
                                                                            if(index === i) {
                                                                                return vendorReplacementItemTempInsert
                                                                            }
                                                                            else {
                                                                                return d
                                                                            }
                                                                        })
                                                                    }
                                                                    else{
                                                                        updatedVendorReplacementItems = formValues.vendorReplacementItems.map((d, i) => {
                                                                            const adjustedDefect = item.adjustedDefect
                                                                            // if(props.type === 'collectReplacement' && props.data && Object.keys(props.data).length > 0){
                                                                            //     if(item.adjustedDefect.length === 0){
                                                                            //         const selectedDefect = defectByCustomerVendor.find(d => d.send_id === props.data.send_id)
                                                                            //         adjustedDefect.push({ ...selectedDefect, isChecked: true })
                                                                            //     }
                                                                            // }
                                                                            if(index === i){
                                                                                return {
                                                                                    ...d,
                                                                                    item_id: newValue.item_id,
                                                                                    name: newValue.name,
                                                                                    quantity: '',
                                                                                    is_serialized: newValue.is_serialized,
                                                                                    lots: [],
                                                                                    line: index + 1,
                                                                                    item_cost_price: newValue.item_cost_price || '',
                                                                                    item_unit_price: newValue.item_unit_price || '',
                                                                                    description: item.description,
                                                                                    adjustedDefect: adjustedDefect,
                                                                                    qty_per_pack: newValue.qty_per_pack
                                                                                }
                                                                            }
                                                                            else{
                                                                                return d
                                                                            }
                                                                        })
                                                                    }
                                                                    setFormValues((prev) => ({ ...prev, vendorReplacementItems: updatedVendorReplacementItems }))
                                                                }}
                                                                renderInput={(params) => {
                                                                    const get = { ...params }
                                                                    get.InputProps = {
                                                                        ...params.InputProps,
                                                                        startAdornment: (
                                                                            <Tooltip title='Create New'>
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
                                                                item.item_id !== '' ? (
                                                                    <TextField
                                                                        name={`quantity${index}`}
                                                                        value={item.quantity}
                                                                        variant='standard'
                                                                        type='number'
                                                                        onChange={(event) => {
                                                                            const oldQuantity = currentQuantity
                                                                            const oldLots = currentLots
                                                                            const value = event.target.value === '' ? '' : parseInt(event.target.value)
                                                                            let replacingQuantityError = false
                                                                            let reducedQuantity = 0
                                                                            if(value == ''){
                                                                                setCurrentLots(item.lots)
                                                                                setCurrentQuantity(item.quantity)
                                                                            }

                                                                            if(oldQuantity > value){
                                                                                reducedQuantity = oldQuantity - (value === '' ? 0 : value)
                                                                            }
                                                                            
                                                                            let previousAdjustedQuantity = 0
                                                                            if(props.data){
                                                                                previousAdjustedQuantity = formValues.vendorReplacementItems.reduce((sum1, list1) => sum1 + list1.adjustedDefect.filter(d => d.send_id === props.data.send_id).reduce((sum2, list2) => sum2 + list2.adjustingQuantity, 0), 0)
                                                                            }

                                                                            const updatedVendorReplacementItems = formValues.vendorReplacementItems.map((d, i) => {
                                                                                const newLotsLength = Math.max(oldLots.length - reducedQuantity, 0)
                                                                                const updatedLots = oldLots.slice(0, newLotsLength)
                                                                                const adjustedDefect = d.adjustedDefect
                                                                                if(props.type === 'collectReplacement' && props.data && Object.keys(props.data).length > 0){
                                                                                    if(d.adjustedDefect.length === 0){
                                                                                        const selectedDefect = defectByCustomerVendor.find(e => e.send_id === props.data.send_id)
                                                                                        const adjustingQuantity = selectedDefect.quantity < value ? selectedDefect.quantity : value
                                                                                        if(previousAdjustedQuantity < selectedDefect.quantity){
                                                                                            adjustedDefect.push({ ...selectedDefect, adjustingQuantity: adjustingQuantity, isChecked: true })
                                                                                        }
                                                                                    }
                                                                                }
                                                                                
                                                                                if(index === i){
                                                                                    return{
                                                                                        ...d,
                                                                                        quantity: value,
                                                                                        lots: value === '' ? item.lots : oldLots.length > 0 ? updatedLots : [],
                                                                                        adjustedDefect: adjustedDefect
                                                                                    }
                                                                                }
                                                                                else{
                                                                                    return d
                                                                                }
                                                                            })
                                                                            setFormValues((prev) => ({ ...prev, vendorReplacementItems: updatedVendorReplacementItems }))
                                                                        }}
                                                                    />
                                                                ) : ''
                                                            }
                                                        </TableCell>

                                                        <TableCell>
                                                            {
                                                                item.item_id !== '' ?
                                                                    <TextField
                                                                        name={`item_cost_price${index}`}
                                                                        value={item.item_cost_price}
                                                                        variant='standard'
                                                                        type='number'
                                                                        onChange={(event) => {
                                                                            const updatedVendorReplacementItems = formValues.vendorReplacementItems.map((d, i) => {
                                                                                if(index === i){
                                                                                    return{
                                                                                        ...d,
                                                                                        item_cost_price: parseFloat(event.target.value) ?? 0.00
                                                                                    }
                                                                                }
                                                                                else{
                                                                                    return d
                                                                                }
                                                                            })
                                                                            setFormValues((prev) => ({ ...prev, vendorReplacementItems: updatedVendorReplacementItems }))
                                                                        }}
                                                                    />
                                                                : ''
                                                            }
                                                        </TableCell>

                                                        <TableCell>
                                                            <Stack flexDirection='row' gap={5}>
                                                                {
                                                                    item.item_id !== '' ?
                                                                        item.is_serialized === 1 &&
                                                                        <Tooltip title='Serial Number'>
                                                                            <Icon
                                                                                style={{
                                                                                    color: item.quantity > 0 ?
                                                                                        Number(item.quantity) === item.lots.length ?
                                                                                            'green'
                                                                                        : 'red'
                                                                                    : 'grey'
                                                                                }}
                                                                                onClick={(event) => item.quantity === '' || item.quantity === 0 ? event.preventDefault() : handleLotNumberDialog(item)}
                                                                            >
                                                                                toc
                                                                            </Icon>
                                                                        </Tooltip>
                                                                    : ''
                                                                }

                                                                {
                                                                    item.item_id !== '' ?
                                                                        (item.is_serialized === 1 && item.lots.length > 0) &&
                                                                        <Tooltip title='view'>
                                                                            <Icon onClick={() => handleViewSerialNumber(item)}>
                                                                                visibility
                                                                            </Icon>
                                                                        </Tooltip>
                                                                    : ''
                                                                }
                                                            </Stack>
                                                        </TableCell>

                                                        <TableCell>  
                                                            {
                                                                item.item_id !== '' ?
                                                                    <>
                                                                        <IconButton disabled={item.quantity === ''} onClick={() => handleDefectAdjustmentOpen(item, true, index)}>
                                                                            <Checklist />
                                                                        </IconButton>

                                                                        {
                                                                            item.quantity === item.adjustedDefect.reduce((sum, list) => sum + Number(list.adjustingQuantity), 0) &&
                                                                            <Typography variant='caption' color='green'>
                                                                                Fully Adjusted
                                                                            </Typography>
                                                                        }
                                                                    </>
                                                                : ''
                                                            }
                                                        </TableCell>

                                                        <TableCell>
                                                            <Stack flexDirection='row'>
                                                                {
                                                                    formValues.vendorReplacementItems.length > 1 &&
                                                                    <IconButton onClick={item.name.length > 0 ? () => handleDeleteDialogOpen(index) : () => deleteProductRowData(index)}>
                                                                        <DeleteIcon />
                                                                    </IconButton>
                                                                }

                                                                {
                                                                    index === formValues.vendorReplacementItems.length - 1 &&
                                                                    <IconButton onClick={() => setFormValues((prev) => ({ ...prev, vendorReplacementItems: [ ...prev.vendorReplacementItems, vendorReplacementItemTempInsert ] }))}>
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
                            </>
                        }
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
                                <Button variant='contained' color='error' 
                                    onClick={() => {
                                        setFormValues((prev) => ({ ...prev, customer: null, vendor: null, replacementItems: [], vendorReplacementItems: [] }))
                                        props.handleClose(false)
                                    }}
                                >Cancel</Button>
                            </Grid> 
                            
                            <Grid>
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}
                                    disabled={
                                        tabValue === 1 ? (
                                            formValues.replacementItems.filter(
                                                d => d.replacing_item_id !== '' && d.replacing_item_id !== null
                                            ).length === 0 ||
    
                                            formValues.replacementItems.filter(
                                                d => d.replacing_item_id !== '' && d.replacing_item_id !== null
                                            ).some(d =>
                                                d.name === '' ||
                                                (d.is_serialized === 1 && d.lots.length === 0) ||
                                                (d.is_serialized === 0 && (d.replacingQuantity === '' || d.replacingQuantity == 0))
                                            )
                                        )
                                        : (
                                            formValues.vendorReplacementItems.filter(
                                                d => d.item_id !== '' && d.item_id !== null
                                            ).length === 0 ||

                                            formValues.vendorReplacementItems.filter(
                                                d => d.item_id !== '' && d.item_id !== null
                                            ).some(
                                                d => d.quantity === '' || d.quantity === 0 || d.adjustedDefect.length === 0 || d.item_cost_price === '' || (d.is_serialized === 1 && d.lots.length === 0)
                                            )
                                        )

                                    }
                                >
                                    Submit
                                </Button>
                            </Grid>
                    </Grid>
                </Box>
   

                <LocationAlert open={locationAlert} onClose={() => setLocationAlert(false)} />

                {
                    lotNumberDialog &&
                    <LotNumberDialog
                        open={lotNumberDialog}
                        data={lotNumberData}
                        location_id={formValues.location.location_id}
                        handleClose={handleLotNumberDialogClose}
                        setFormValues={setFormValues}
                        calledFrom={tabValue === 1 ? 'customerReplacement' : 'vendorReplacement'}
                        replacementItems={formValues.replacementItems}
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
                                <Typography variant="h6">Delete Confirmation</Typography>
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
            </Card>
            <Dialog open={convertToCreditDebitNoteConfirmation} onClose={() => handleCancelConvert()}>
                <DialogTitle>
                    <Grid container spacing={3} display='flex' justifyContent='space-between' alignItems='center'>
                        <Grid>
                            <Typography variant='h6' textAlign='center'>Form Change Alert</Typography>
                        </Grid>

                        <Grid>
                            <IconButton onClick={() => handleCancelConvert()}>
                                <CloseIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                </DialogTitle>

                <DialogContent>
                    <Typography variant='h6'>
                        {`This action will change the current form to a Return ${tabValue === 1 ? 'Credit Note' : 'Debit Note'} for the remaining products.`}
                        <br/>
                        {'Do you want to continue ?'}
                    </Typography>
                </DialogContent>

                <DialogActions>
                    <Grid container spacing={3} display='flex' justifyContent='flex-end'>
                        <Grid>
                            <Button variant='contained' color='error' onClick={() => handleCancelConvert()}>Cancel</Button>
                        </Grid>

                        <Grid>
                            <Button variant='contained' onClick={handleConfirmConvert}>Confirm</Button>
                        </Grid>
                    </Grid>
                </DialogActions>
            </Dialog>
            {
                defectAdjustmentDialog &&
                <DefectAdjustmentDialog
                    defectAdjustmentDialog={defectAdjustmentDialog}
                    handleDefectAdjustmentOpen={handleDefectAdjustmentOpen}
                    handleAdjustmentSubmit={handleAdjustmentSubmit}
                    replacementItems={formValues.vendorReplacementItems}
                    rowData={lotNumberData}
                    formStatus={props?.status ?? 'new'}
                />
            }

            {
                fileOpen &&
                <CommonImport
                    type='purchase'
                    sampleDownloadButtonName = 'Here'
                    open={fileOpen}
                    handleClose={() => setFileOpen(false)}
                    encodeImageFileAsURL = {encodeImageFileAsURL}
                    exportSample = {() => ExportCsv('ReceivingItemsData')}
                    headers={[
                        {
                            label: 'Product', key: 'product',
                        },
                        {
                            label: 'Ordered Qty', key: 'qty',
                        },
                        {
                            label: 'Buying Cost', key: 'cost',
                        },
                        {
                            label: 'Tax %', key: 'tax',
                        },
                        {
                            label: 'Sub Total', key: 'sub',
                        }
                    ]}
                    data={[
                        {
                            name: ''
                        }
                    ]}
                />
            }

            {
                openAlert &&
                    <AlertDialogSlide
                        setOpenAlert={(data) => setOpenAlert(data)}
                        duplicateLotNumber={uploadErrors.duplicateLotNumber}
                        lotAlreadyExistInDb={uploadErrors.lotAlreadyExistInDb}
                        setValidationToDefault={() => {
                            setUploadErrors((prev) => ({
                                duplicateLotNumber: [],
                                lotAlreadyExistInDb: []
                            }))
                        }}
                    />
            }
        </>
    );

}

ReplacementForm.propTypes = {
    status: PropTypes.string,
    handleClose: PropTypes.func,
    editData: PropTypes.object,
    data: PropTypes.object,
    type: PropTypes.string,
    handleInvoiceClick: PropTypes.func,
    handleReplacementOpen: PropTypes.func,
    pagination: PropTypes.object
}

export default ReplacementForm