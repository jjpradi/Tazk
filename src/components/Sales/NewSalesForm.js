import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Autocomplete, Box, Button, ButtonGroup, Card, Checkbox, ClickAwayListener, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, FormControlLabel, FormHelperText, Grid, Icon, IconButton, InputAdornment, InputLabel, MenuItem, Paper, Radio, RadioGroup, Select, Slide, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material'

import { Alert } from '@mui/material';

import { useTheme } from '@mui/material/styles'
import { headerStyle, maxHeight, cellStyle } from 'utils/pageSize'
import { useDispatch, useSelector } from 'react-redux'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import UnSavedChangesWarning from 'pages/common/unChangeswarning'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import { getCustomerOutstandingDetailsAction, getCustomerOutstandingDetailsDuesAction, getSalesCustomersByIdAction, getSearchByCustomerAction, getSearchByCustomerSalesManAction, getSearchByCustomersDataAction, getSearchBySalesmanCustomersAction, listCustomerAction, setSearchByCustomersDataAction, updateCreditDaysAction, updateShippingDetailAction } from 'redux/actions/customer_actions'
import apiCalls from 'utils/apiCalls'
import { getLocationDataBasedOnPincode } from 'components/common'
import { gstValidation, vehicleNumberValidation } from 'components/regexFunction'
import {AdapterMoment as DataAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import moment from 'moment'
import { getsessionStorage } from 'pages/common/login/cookies'
import { getUserRightsAction } from 'redux/actions/userRole_actions'
import ShippingDetailPopup from 'pages/sales/customer/shippingdetailpopup'
import { sequenceBasedOnNameAction } from 'redux/actions/sequencePattern_actions'
import { GetTdsTaxes } from 'redux/actions/purchase_actions'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import { creditDebitNoteSeq, creditDebitNoteSeqUpdate, customesSalesmanAction, getBillingcompany, getLatestTransporterDetailsAction, getLotDetailsAction, salesApprovalsAction, triggerSalesModal } from 'redux/actions/sales_actions'
import { getPriceListAction } from 'redux/actions/priceList_actions'
import { bulkProductAction, changeProductHsnCodeDescriptionAction, getProductByLotNumberSearchAction, listProductActionByType } from 'redux/actions/product_actions'
import ProductSelect from 'components/productAutoComplete'
import { filterOptions } from 'utils/searchFunc'
import { checkEachBarcodeWasEntered, getItemTaxes, Sales_Item_Taxes, singleTax ,checkEachBarcodeWasEnteredForSaleOrder, normalizeQuantity, validateSalesItemsQuantity} from 'pages/sales/sales/sale_status_list'
import ActionButton from 'pages/sales/sales/actionButton'
import CancelDialog from 'components/CancelDialog'
import ItemPopup from 'pages/sales/sales/lotNumber'
import CloseIcon from '@mui/icons-material/Close'
import MaterialTable from 'utils/SafeMaterialTable'
import { getTrimmedData } from 'components/trimFunction'
import { OpenalertActions } from 'redux/actions/alert_actions'
import { requiredFieldsAlertMessage, searchErrorMessage } from 'utils/content'
import CommonImport from 'components/pos/payment_section/CommonImport'
import { read, utils } from 'xlsx-js-style'
import MissingProduct from 'pages/sales/purchases/MissingProduct'
import { useCustomFetch } from 'utils/useCustomFetch'
import { productCreateSalesAlert } from 'redux/actions/load'
import DeleteIcon from '@mui/icons-material/Delete';
import DublicateLotList from 'pages/sales/sales/dublicateLotsList'
import { setInvoiceTempAction } from 'redux/actions/vendor_actions'
import _, { debounce } from 'lodash';
import { ListsalesmanAction } from '../../redux/actions/customer_actions';
import API_URLS from '../../utils/customFetchApiUrls';
import { listTaxCategoryAction } from 'redux/actions/tax_Category_actions';
import CommonAutoCategory from 'utils/commongstpreference';
import taxCategory from 'pages/sales/taxCategory';
import { listSalesPaginateAction } from '../../redux/actions/sales_actions';
import SearchIcon from '@mui/icons-material/Search';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction='up' ref={ref} {...props} />
})

function AlertDialogSlide ({
    setValidationToDefault,
    productOutOfStock,
    duplicateLotNumber,
    setOpenAlert
}) {
    const[open , setOpen] = useState(true)

    const handleClose = () => {
        setOpen(false)
        setOpenAlert(false)
        setValidationToDefault()
    }

    return (
        <Dialog
            open={open}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleClose}
            aria-describedby='alert-dialog-slide-description'
            overflow= 'hidden'
        >
            {
                duplicateLotNumber.length > 0 && (
                    <Tables data={duplicateLotNumber[1]} tableName={'duplicateLotInDb'} />
                )
            }

            {
                productOutOfStock.length > 0 && (
                    <Tables data={productOutOfStock[1]} tableName={'productOutOfStock'} />
                )
            }

            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
        )
    }

const NewSalesForm = (props) => {

    const theme = useTheme()
    const dispatch = useDispatch()
    const customFetch = useCustomFetch();
    const { setinvoicelayout, invoicelayout } = props
    const {
        commoncookie,
        setModalTypeHandler,
        setLoaderStatusHandler,
        headerLocationId,
        setHeaderLocationIdHandeler
    } = useContext(CreateNewButtonContext)

    const defaultPriceList = props.price_list.length > 0 && props.price_list?.filter(pList => pList.price_list_name === 'Default')[0]
     const debounceTimer = useRef(null);

    const [formValues, setFormValues] = useState({
        sale_status : null,
        customer_id : null,
        employee_id : commoncookie,
        location_id : null,
        reference : null,
        comment : null,
        invoice_number : null,
        note : '',
        price_list : defaultPriceList.id,
        ship_legal_name : null,
        ship_address : null,
        ship_location : null,
        ship_stcd : null,
        ship_zip : null,
        ship_gstin : null,
        ship_phone_number : null,
        ship_person_name : null,
        disp_address : null,
        disp_company_name : null,
        disp_location : null,
        disp_zip : null,
        disp_stcd : null,
        trans_name : null,
        trans_doc_no : null,
        trans_id : null,
        trans_mode : null,
        distance : null,
        veh_no : null,
        tax_types : "1",
        tcs : "",
        tcs_percent : "0%",
        tds : "",
        tds_percent : "0%",
        tds_id : null,
        sales_man : null,
        invoiceCreditDays : null,
        invoiceCreditValue : null,
        tax_id : null,
        sub_company_id : null,
        discount_type: null,
        discount_value: '',
        discount_amount: null,
        shipping_charges: null,
        other_charges: null
    })

const [customerSearchText, setCustomerSearchText] = useState('')


    const [formErrors, setFormErrors] = useState({
        sale_status : null,
        customer_id : null,
        location_id : null,
        invoice_number: null,
        price_list : null,
        ship_legal_name : null,
        ship_address : null,
        ship_location : null,
        ship_stcd : null,
        ship_zip : null,
        disp_address : null,
        disp_company_name : null,
        disp_location : null,
        disp_zip : null,
        disp_stcd : null,
        trans_name : null,
        trans_mode : null,
        distance : null,
        veh_no : null,
        trans_id : null,
        trans_doc_no : null,
        sales_man : null
    })

   // console.log('formValues.sale_status ', formValues.sale_status,props.status, props.returnState )


    const [shipformValues, setShipFormValues] = useState({
        company_name : null,
        contactperson_name : null,
        contactperson_num : null,
        Gst : null,
        city : null,
        state : null,
        zip : null,
        country : 'India',
        latitude : null,
        longitude : null,
        address : null,
        area : null
    })

    const [shipformErrors, setShipFormErrors] = useState({
        company_name : null,
        zip : null,
        state : null,
        city : null,
        address : null,
        area : null
    })

    const [requiredFields] = useState([
        'customer_id',
        'sale_status',
        'location_id'
    ])

    const [shiprequiredFields] = useState([ 
        'company_name',
        'zip',
        'state',
        'city',
        'address',
        'area'
    ])

    const [ewayrequiredFields] = useState([
        'trans_mode',
        'trans_doc_no',
        'trans_id',
        // 'distance'
    ])

    //  const [productCategory, setProductCategory] = useState(null);
     const [filteredCategories, setFilteredCategories] = useState([]);
      const [allTaxCategories, setAllTaxCategories] = useState([]);

    const storage = getsessionStorage()
    const isAdmin = storage?.role_name === 'Administrator'
    const subcompany = storage?.subcompany
    const tempLocation = useRef(null)
    const tempinitform = useRef(null)
    const bulkEditRef = useRef(null)
    const addActionRef = useRef(null)
    const tempinit = useRef(null)
    const temptaxedits = useRef(null)
    const tempitem = useRef(null)
    const tempcust = useRef(null)
    const tempedits = useRef(null)
    const [regex] = useState({})
    const receivingTimeRef = useRef(null)
    const debouncedGetLotDetails = useRef(
        debounce((searchValue, location_id, response) => {
            const payload = {
                lot_number: searchValue, 
                location_id: location_id,
                calledFrom: 'salesLotSearch' 
            }
            dispatch(getLotDetailsAction(payload, response))
        }, 300)
    ).current
    const [Prompt, setDirty, setPristine] = UnSavedChangesWarning()

    const {
        customerReducer : { customer, getCustomerOutstanding, getCustomerOutstandingDues, customer_mapping },
        UserRoleReducer : { userRights },
        salesReducer : { salesApprovals, getApprovalRights, credit_debit_seq, customer_salesman, getbillingcompanydetails,salesByPagination },
        sequencePatternReducer : { get_sequence_based_on_name },
        purchasesReducer : { tds_taxrate },
        productReducer : { productByType, product },
        taxCategoryReducer: { taxcategory },
        rbacReducer: { menuAccess }
    } = useSelector((state) => state)
    
    //console.log('productByType', productByType)
    const cusArray = 
    // storage?.role_name === 'Salesman'
        // ? (customer_mapping?.length > 0 ? customer_mapping : [])
        // : 
        (customer?.length > 0 ? customer : []);
       // console.log("jhrfu", cusArray, customer_mapping, customer)
    // const cusArray = customer?.length > 0 ? customer : []
    // const customFetch = useCustomFetch();
    const customerData = cusArray?.find(customer => customer.customer_id === formValues.customer_id)

    const [initialTotalCust, setInitialTotalCust] = useState(cusArray.length)
    const [updatedTotalCust, setUpdatedTotalCust] = useState(initialTotalCust)
    const [customerEdit, setCustomerEdit] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [loader, setLoader] = useState(false)
    const [productResetDialog, setProductResetDialog] = useState(false)
    const [oldSaleStatus, setOldSaleStatus] = useState(null)
    const [dueDaysInput, setDueDaysInput] = useState('')
    const [editOpen, setEditOpen] = useState(false)
    const [dueDaysValueInput, setDueDaysValueInput] = useState('')
    const [editCreditDaysValueOpen, setCreditDaysValueOpen] = useState(false)
    const [addressManuallySelected, setAddressManuallySelected] = useState(false)
    const [openDialog, setOpenDialog] = useState(false)
    const [selectedAddress, setSelectedAddress] = useState(null)
    const [confirmedSelectedAddress, setConfirmedSelectedAddress] = useState(null)
    const [customerSelectionDialogOpen, setCustomerSelectionDialogOpen] = useState(false)
    const [shippingOpen, setShippingOpen] = useState(false)
    const [editShippingMode, setEditShippingMode] = useState(false)
    const [status, setStatus ] = useState('create')
    const [initialState, setInitialState] = useState({})
    const [dialog, setDialog] = useState(false)
    const [returnConfirmOpen, setReturnConfirmOpen] = useState(false)
    const [returnSubmitting, setReturnSubmitting] = useState(false)
    const submittingRef = useRef(false)
    const [form, setForm] = useState(false)
    const [sales_items, setSalesItems] = useState([])
    const [tcstaxvisible, setTcsVisible] = useState(false)
    const [sales_taxes, setSalesTaxes] = useState([])
    const [taxVisible, setTaxVisible] = useState(true)
    const [request, setRequest]= useState(false)
    const [productData, setProductData] = useState([])
    const [locationWiseProduct, setLocationWiseProduct] = useState([])
    const [productDetails, setProductDetails] = useState([])
    const [rowdata, setRowData] = useState([])
    const [ dcchallan, setDchallan ] = useState(false)
    const [viewSerialNumberOpen, setViewSerialNumberOpen] = useState(false)
    const [viewSerialNumber, setViewSerialNumber] = useState([])
    const [add_click, setAdd_click] = useState(false)
    const [Rdata, setRData] = useState()
    const [excelItemsNotAdded, setExcelItemsNotAdded] = useState([])
    const [openAlert, setOpenAlert] = useState(false)
    const [Tdata, setTdata] = useState([])
    const [dueAmountPopupOk, setDueAmountPopupOk] = useState('')
    const [posSeq, setposSeq] = useState(false)
    const [hsnError, setHsnError] = useState('')
    const [editHSNDesc, setEditHSNDesc] = useState(null)
    const [filterOpen, setFilterOpen ] = useState(false)
    const [duplicateLot, setDuplicateLot] = useState([])
    const [productOutOfStock, setProductOutOfStock] = useState([])
    const [mOpen, setmOpen] = useState(false)
    const [withItemId, setWithItemId] = useState([])
    const [dataApi, setDataApi] = useState([])
    const [xlData, setXlData] = useState([])
    const [deleteDilaog, setDeleteDialog] = useState(false)
    const [editDate, setEditDate] = useState(false)
    const [hoverDate, setHoverDate] = useState(false)
    const [editSalesManOpen, setEditSalesManOpen] = useState(false)
    const [salesMan, setSalesMan] = useState({ id : null, value : null })
    const [deleteIndex, setDeleteIndex] = useState(0)
    const [dublicateLotVisible, setDublicateLot] = useState([])
    const [button, setButton] = useState(false)
    const [addressDialog, setAddressDialog] = useState(false)
    const [lotNumberSearch, setLotNumberSearch] = useState('')
    const [lotNumberMessage, setLotNumberMessage] = useState({ success: false, error : false, message : '' })
    const [saleItemsResetConfirmationDialog, setSaleItemsResetConfirmationDialog] = useState(false)
    const [oldLocationId, setOldLocationId] = useState(headerLocationId)
    const [invoiceButtonDisable, setInvoiceButtonDisable] = useState(false)
    const [currentLots, setCurrentLots] = useState([])
    const [currentQuantity, setCurrentQuantity] = useState(0)
    const [invoicenumber, setInvoicenumber] = useState(null);
    const [returnDiscount, setReturnDiscount] = useState('No Discount')
    const [returnShippingCharges, setReturnShippingCharges] = useState(false)
    const [returnOtherCharges, setReturnOtherCharges] = useState(false)
  //console.log("jsgheu", request)
   

    const tempInsert = {
        available_quantity : 0,
        description : '',
        discount : 0,
        discount_type : null,
        hsn_code : '',
        isEntered : 0,
        is_serialized : 1,
        item_cost_price : 0,
        item_id : 0,
        item_unit_price : '',
        line : sales_items.length + 1,
        lots : [],
        name : '',
        print_option : 0,
        qty_per_pack : 0,
        quantity : '',
        sales_item_taxes : [],
        stock_type : 0,
        sub_total : '',
        taxes : [],
        taxes_name : '',
        discount_value: '',
    }

    const [hsnDesc, setHsnDesc] = useState({
        hsnCode : null,
        description : null,
        item_id : null
    })

    const [row_id, setRowid] = useState({
        id : '1',
        data : '',
        open : false,
        status : ''
    })

    const hasCreditDaysEdit = userRights?.some(
        (perm) => perm.right_name === "creditDaysEdit" && perm.value === true
    )

    const hasCreditDaysValueEdit = userRights?.some(
        (d) => d.right_name === 'creditDaysValueEdit' && d.value === true
    )


    const setStateHandler = async (name, value) => {
        let formObj = {}
        formObj = {
            ...formValues,
            [name] : value === '' ? null : value
        }
        setFormValues((prev) => ({...prev, [name] : value === '' ? null : name === 'trans_id' || name === 'veh_no' ? value.toUpperCase() : value}))
        if(name !== 'customer_id') validationHandler(name, value)
    }

    const validationHandler = (name, value) => {
        if(!Object.keys(formErrors).includes(name)) return

        if(requiredFields.includes(name) && (value === null || value === 'null' || value === '' || value === false || (Object.keys(value) && value.value === null))) {
            setFormErrors({
                ...formErrors,
                [name] : capitalize(name) + ' is Required!'
            })
        }
        else if(regex[name]) {
            if(!regex[name].test(value)) {
                setFormErrors({
                    ...formErrors,
                    [name] : capitalize(name) + ' is Invalid'
                })
            }
            else {
                setFormErrors({
                    ...formErrors,
                    [name] : null
                })
            }
        }
        else {
            setFormErrors({
                ...formErrors,
                [name] : null
            })
        }
    }

    const capitalize = (s) => {
        if (typeof s !== 'string') return ''
        return s.charAt(0).toUpperCase() + s.slice(1)
    }
    useEffect(() => {
        const load = async () => {
            await apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(listTaxCategoryAction('', setLoaderStatusHandler)),
            dispatch(setSearchByCustomersDataAction([]))
        )
    };
    load();
}, [])

    // console.log("props.status",props.edit_id_data)
    // console.log('props.pageType',  props.pageType, taxVisible)

    useEffect(() => {
        if (subcompany > 0) {
            const load = async () => 
                {
                await dispatch(getBillingcompany());
            };
            load();
        }
    }, [subcompany]);

    useEffect(() => {
        if((props.status === 'edit' || props.status === 'editSO' || props.status === 'convertSO' || props.returnState) && props.creditNoteReturn !== 'creditNoteReturn') {
            apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                dispatch(getSalesCustomersByIdAction(props.edit_id_data[0]?.customer_id, async (response) => {
                    const res = await response
                    if(res?.length > 0) {
                        const customerRes = res?.[0]
                        await setFormValues((prev) => ({
                            ...prev,
                            //...customerRes,
                            discount_type: props.edit_id_data[0]?.discount_type,
                            discount_value: props.edit_id_data[0]?.sales_items[0]?.discount
                        }))
                    }
                }))
            )
        }
    }, [props.status, props.creditNoteReturn])

     useEffect(() => {
    if (taxcategory?.length > 0) {
        setAllTaxCategories(taxcategory); 
      setFilteredCategories(taxcategory);
    }
  }, [taxcategory]);

  const handleCategorySearch = (query) => {
    //console.log('handlectegory', query)
    if (!query) {
      setFilteredCategories(taxcategory);
    } else {
      const filtered = taxcategory.filter((cat) =>
        cat.tax_category.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  };

    useEffect(() => {
        if (props.pageType === '/sales/invoices') {
          setFormValues((prev) => ({
            ...prev,
            sale_status: 2
          }))
        }
        else if (props.pageType === '/sales/salesOrders') {
          setFormValues((prev) => ({
            ...prev,
            sale_status: 1
          }))
        } 
        else if(props.pageType === '/sales/deliveryChallan' && props.status !== 'edit' ){
          setFormValues((prev) => ({
            ...prev,
            sale_status: 8
          }))
        }
    }, [props.pageType])

    useEffect(() => {
        setFormValues({
            customer_id : null,
            employee_id : commoncookie,
            comment : null,
            reference : null,
            invoice_number : null,
            sale_status : props.pageType === '/sales/invoices' ? 2 : props.pageType === '/sales/salesOrders' ? 1 : props.pageType === '/sales/deliveryChallan' && props.status === 'edit' ? 2 : props.status === 'edit' ? 2 : 8,
            location_id : null,
            note : '',
            price_list : null,
            ship_legal_name : null,
            ship_address : null,
            ship_location : null,
            ship_stcd : null,
            ship_zip : null,
            ship_gstin : null,
            ship_phone_number : null,
            ship_person_name : null,
            disp_address : null,
            disp_company_name : null,
            disp_location : null,
            disp_zip : null,
            disp_stcd : null,
            trans_name : null,
            trans_doc_no : null,
            trans_id : null,
            trans_mode : null,
            distance : null,
            veh_no : null,
            tax_types : "1",
            tcs : "",
            tcs_percent : "0%",
            tds : "",
            tds_percent : "0%",
            tds_id : null,
            sub_company_id : null
        })
    
        setShipFormValues({
            company_name : null,
            contactperson_name : null,
            contactperson_num : null,
            Gst : null,
            city : null,
            state : null,
            zip : null,
            country : 'India',
            latitude : null,
            longitude : null,
            address : null,
            area : null
        })
    }, [props.pageType])

    useEffect(() => {
        const timeout = setTimeout(() => {
       if (formValues.sale_status === 1 || formValues.sale_status === 2 || formValues.sale_status === 8 || props.returnState ) {
            const isDcReturn = props.returnState === true && Boolean(formValues.dc_id)
            const isSalesReturn = props.returnState === true && !formValues.dc_id && Boolean(formValues.sale_id)
            const data = {
                sequence_name: isDcReturn ? 'DCRETURN SEQUENCE' :
                isSalesReturn ? 'SALESRETURN SEQUENCE' : 
                formValues.sale_status === 2
                ? 'SALESINV SEQUENCE' :
                formValues.sale_status === 1
                ? 'SO SEQUENCE'
                : formValues.sale_status === 8 ?  'DC SEQUENCE' : '',
            }
            //   const data = {
            //     sequence_name:
            //     formValues.sale_status === 1
            //     ? 'SO SEQUENCE'
            //     : formValues.sale_status === 2
            //     ? 'SALESINV SEQUENCE'
            //     : formValues.sale_status === 8 ?  'DC SEQUENCE' : '',
            // }
            apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                 dispatch(sequenceBasedOnNameAction(data))
            )
      }
      }, 300);
      return () => clearTimeout(timeout);
    }, [formValues.sale_status, props.returnState, formValues.sale_id, formValues.dc_id])

    useEffect(() => { (async () => {
        let type = 'credit'
        let productType = 'sales'
        await apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(getPriceListAction()),
          dispatch(listProductActionByType(productType)),
          dispatch(creditDebitNoteSeq(type))
        )
    })();
}, [])

    useEffect(() => { (async () => {
        if(formValues.customer_id !== null) {        
            let customerId = cusArray.filter(f => f.customer_id === formValues.customer_id)[0]
            let temp =  props.price_list?.filter((f) => f.id === customerId?.price_list)       
            if(temp.length) {
                setFormValues((prev) => ({ ...prev, price_list: customerId?.price_list }))
            }
            else {
                setFormValues((prev) => ({ ...prev, price_list: defaultPriceList?.id}))
            } 

        }
        else if(formValues.price_list !== null && props.price_list.length > 0) {    
            await setFormValues((prev) => ({ ...prev, price_list: defaultPriceList?.id }))
        }
    })();
},[formValues.customer_id])

    useEffect(() => {
  const { location_id, sale_status } = formValues;

  if (location_id && (sale_status === 2 || sale_status === 8)) {
    const LocationWiseProduct = productByType.filter((p) => {
      if (p.stock_type === 0) {
        // Non-stock item â€” always include
        return true;
      }

      // Stock item â€” must have item_qty matching the selected location
      return (
        Array.isArray(p.item_qty) &&
        p.item_qty.some((s) => s.location_id === location_id)
      );
    });

    setProductData(productByType);
    setLocationWiseProduct(LocationWiseProduct);
  } else {
    // When location or sale status doesnâ€™t match, show all products
    setProductData(productByType);
    setLocationWiseProduct(productByType);
  }
}, [
  formValues.location_id,
  formValues.sale_status,
  formValues.price_list,
  props.price_list,
  productByType
]);


    // useEffect(() => {
    //     if (formValues.location_id !== '' && formValues.location_id !== null && (formValues.sale_status === 2 || formValues.sale_status === 8)) {
    //         console.log('productByType', productByType)
    //         let LocationWiseProduct = productByType.filter((p) => {
    //             if (formValues.sale_status === 2 || formValues.sale_status === 8) {
    //                 if (Array.isArray(p.item_qty) && p.item_qty.length > 0) {
    //                     return p.item_qty.some((s) => s.location_id === formValues.location_id);
    //                 }
    //                 // return true
    //             }
    //             // return true
    //         })
    //         setProductData(productByType)
    //         setLocationWiseProduct(LocationWiseProduct)
    //     } 
    //     else {
    //         setProductData(productByType)
    //         setLocationWiseProduct(productByType);
    //     }
    //   }, [formValues.location_id, formValues.sale_status, formValues.price_list, props.price_list, productByType])


   useEffect(() => { 
  if (!props.price_list?.length || !formValues.price_list || !formValues.customer_id) return;

    const selectedPriceList = props.price_list.find((pl) => {
        const isMatchingId = pl.id === formValues.price_list;

        const isCustomerAllowed =
            pl.customerMappedIds?.length === 0 || 
            pl.customerMappedIds?.some((c) => c.customer_id === formValues.customer_id); 

        return isMatchingId && isCustomerAllowed;
    });

    const productData = selectedPriceList?.productData || [];
    if(sales_items[0]?.name !== '' && props.status !== 'edit' && props.status !== 'editSO'){
        const updatedItems = sales_items.map((item) => {
            const matched = productData.find(
                (prod) => prod.product_id === item.item_id
            );
    
            const defaultProduct = productByType.find(
                (prod) => prod.item_id === item.item_id
            );
    
            const fallbackUnitPrice = parseFloat(defaultProduct?.unit_price || 0);
    
            const new_unit_price = matched?.discount_price !== undefined
                ? parseFloat(matched.discount_price)
                : fallbackUnitPrice;

                return {
                    ...item,
                    item_unit_price: new_unit_price.toFixed(2),
                    sub_total: singleTax(
                        new_unit_price,
                        parseFloat(item.quantity),
                        item.taxes
                    ).toFixed(2),
                };
            
        });
    
        setSalesItems(updatedItems);
    }    
    
}, [formValues.price_list, formValues.customer_id]);

    useEffect(() => {
        if(getSubtotalForThreshold() < 50000){
            setFormErrors((prev) => ({
                ...prev,
                trans_name: null,
                trans_id: null,
                trans_doc_no: null,
                trans_mode: null,
                veh_no: null
            }))
        }
    }, [sales_items])

    const locationFunction = () => {
        if (headerLocationId && props.status !== 'edit' && storage?.company_type !== 10) {
            const isLocation = props.stocklocation.find((d) => d.location_id === headerLocationId)
            
            let location_id_1 = isLocation ? headerLocationId : formValues.location_id
            // setTimeout(() => {
                const { comment, reference, sale_status, location_id } = props?.newSalesAfterCreating_Data
                setFormValues((prev) => ({ ...prev, location_id : location_id_1, ...(props.isNewSales && { comment, sale_status, reference, location_id}) }))
                setFormErrors((prev) => ({ ...prev, location_id: null }))
            // }, 3000)
        }
    }

    tempLocation.current = locationFunction

    useEffect(() => {
        tempLocation.current()
    }, [headerLocationId])

    useEffect(() => {
        if(props.status != 'edit') {
            dispatch(getUserRightsAction())
        } 
    }, [])

    const initform = () => {
        setInitialState(formValues)
    }

    tempinitform.current = initform

    useEffect(() => {
        tempinitform.current()
        if(props.returnState) {
            bulkEditRef?.current?.click()
        }
    }, [])

    useEffect(() => {
    const load = async () => {
        !props.returnState && await dispatch(GetTdsTaxes(props.status,'null' ))
        !props.returnState && props.status !== 'edit' && addActionRef.current?.click()
    };
    load();
},[])


    useEffect(() => {
        props.returnState && dispatch(GetTdsTaxes(props.status, formValues.tds_id))
        
    }, [formValues.tds_id])



    const inits = () => {
        if (JSON.stringify(initialState) !== JSON.stringify(formValues)) {
            setDirty()
            setForm(true)
        } 
        else {
            setPristine()
            setForm(false)
        }
    }

    tempinit.current = inits

    useEffect(() => {
        tempinit.current()
    }, [formValues, initialState, props.open])

    useEffect(() => {
        if (formValues.customer_id) {
            const { ledger_id } = cusArray?.filter((d) => formValues.customer_id === d.customer_id)[0] || {}
            props.getCustLedger && props.getCustLedger(ledger_id)
        }
    }, [formValues.customer_id])

    useEffect(() => {
        // if(props.status === 'edit' && props.edit_id_data[0].dc_number !== null && !props.returnState && formValues.sale_status === 2 ) {
        //     let lot_value = await [...sales_items]?.map((d) => {
        //         return {
        //             ...d,    
        //             lots:  d.soldLots 
        //         }
        //     })
        //    await setSalesItems([...lot_value ])
        // }
    
        if(props.status === 'convertSO'){
            setCustomerSearchText(props.edit_id_data[0].company_name)
            setSalesItems([...props.edit_id_data[0].sales_items])
            setFormValues({...formValues, location_id : headerLocationId})
        }
    }, [formValues.sale_status])

    

    useEffect(() => { (async () => {
        setFormValues((prev) => ({ ...prev, disp_company_name : props.appConfigData.companyName, disp_address : props.appConfigData.companyAddress, disp_zip : props.appConfigData.pinCode }))
        if(props.appConfigData.pinCode?.length === 6) {
            const locationData = await getLocationDataBasedOnPincode(props.appConfigData.pinCode)
            if(locationData !== undefined) {
                const { district, city, statecode } = locationData
                if(city && statecode){
                    setFormValues((prev) => ({ ...prev, disp_company_name: props.appConfigData.companyName, disp_address: props.appConfigData.companyAddress, disp_zip: props.appConfigData.pinCode, disp_location: district, disp_stcd: statecode }))
                }
            }
        }
    })();
}, [props.appConfigData])

    const leadcompyupdate = formValues?.location_id === null  && props.status === 'convertSO'

    useEffect(() => {
        if (storage?.company_type === 10) {
            const isLocation = props.stocklocation.find((d) => d.location_id === headerLocationId)
        
            const {comment, reference, sale_status, location_id} = props?.newSalesAfterCreating_Data
            let loc_id = isLocation?.length > 0 ? isLocation?.location_id : headerLocationId
        
            setFormValues((prev) => ({
                ...prev,
                location_id : loc_id,
                ...(props.isNewSales && {comment, sale_status, reference, location_id}),
            }))
            setFormErrors((prev) => ({...prev, location_id : null}))
        }
    }, [leadcompyupdate])

    useEffect(() => { (async () => {
        const fetchAndSetLocation = async () => {
            if (addressManuallySelected) return
            if (formValues.customer_id && cusArray.length > 0 && !openDialog) {
                setCustomerEdit(true)
                const fallbackCustomer = cusArray.find((e) => e.customer_id === formValues.customer_id)
                const customerInfo =
                    selectedCustomer?.customer_id === formValues.customer_id
                        ? selectedCustomer
                        : fallbackCustomer
               // console.log(customerInfo, 'customerInfo')
                if (customerInfo && selectedCustomer?.customer_id !== customerInfo.customer_id) {
                    setSelectedCustomer(customerInfo)
                }

                if (customerInfo) {
                    const shippingList = Array.isArray(customerInfo.shipping_address) ? customerInfo.shipping_address : []
                    const defaultShipping = shippingList[0] || null
                    const shipZip = customerInfo.zip || defaultShipping?.pin_code || defaultShipping?.zip || null
                    const shipAddress = customerInfo.address || defaultShipping?.address || null
                    const locationData = shipZip ? await getLocationDataBasedOnPincode(shipZip) : null
                    const customerContactName = `${customerInfo.first_name || ''}${customerInfo.last_name ? ` ${customerInfo.last_name}` : ''}`.trim()

                    setSelectedAddress(defaultShipping)
                    setConfirmedSelectedAddress(defaultShipping)
            
                    setFormValues((prev) => ({
                    ...prev,
                    ship_legal_name : customerInfo.company_name || defaultShipping?.company_name || null,
                    ship_address : shipAddress,
                    ship_zip : shipZip,
                    ship_location : defaultShipping?.city || locationData?.district || null,
                    ship_stcd : locationData?.statecode || null,
                    ship_gstin : customerInfo.tax_id || defaultShipping?.tax_id || defaultShipping?.Gst || null,
                    ship_phone_number : customerInfo.phone_number || defaultShipping?.phone_number || defaultShipping?.contactperson_num || null,
                    ship_person_name : customerContactName || defaultShipping?.contactperson_name || defaultShipping?.contact_person_name || null
                    }))
                }
            } 
            else if (!openDialog && !formValues.customer_id) {
                setFormValues((prev) => ({
                    ...prev,
                    ship_legal_name : null,
                    ship_address : null,
                    ship_zip : null,
                    ship_location : null,
                    ship_stcd : null,
                    ship_gstin : null,
                    ship_phone_number : null,
                    ship_person_name : null
                }))
                setSelectedAddress(null)
                setConfirmedSelectedAddress(null)
                setCustomerEdit(false)
            }
        }
        fetchAndSetLocation()

        setFormValues((prev) => ({
            ...prev,
            sales_man : customer_salesman?.customer_sales_man?.length > 0 && formValues.customer_id !== null && props.status !== 'editSO'
            ? {
                id: customer_salesman.customer_sales_man[0].employee_id,
                value: customer_salesman.customer_sales_man[0].username,
            } : { id: null, value: null },
        }))

        if (selectedCustomer?.salesman_id !== null && customer_salesman?.sales_man_list?.length > 0) {
            const cust_salesman = customer_salesman.sales_man_list.find(
                (e) => e.employee_id === selectedCustomer?.salesman_id
            )

            if (cust_salesman) {
                setFormValues((prev) => ({
                    ...prev,
                    sales_man: {
                        id : cust_salesman.employee_id,
                        value : cust_salesman.username
                    }
                }))
            }
        }
    })();
}, [formValues.customer_id, openDialog, addressManuallySelected, customer, customer_salesman, selectedCustomer])

    useEffect(() => { (async () => {
        setAddressManuallySelected(false)
        setSelectedAddress(null)
        if(formValues.customer_id !== null) {
            const data = {
                customer_id :  formValues.customer_id
            }
            await dispatch(customesSalesmanAction(data))
        }
    })();
}, [formValues.customer_id])

    useEffect(() => {
        if(formValues.customer_id) {
            setCustomerSelectionDialogOpen(false)
            if(getApprovalRights) {
                if(getApprovalRights?.rights !== true) {
                    return
                }
                else{
                    if(getCustomerOutstandingDues.length > 0 && props.pageType !== '/sales/salesOrders') {
                    const hasDueExceeds = getCustomerOutstandingDues.some(item => item.due_status === 'due_exceeds')
                        if (hasDueExceeds && props.status !== 'edit') {
                            setCustomerSelectionDialogOpen(true)
                        }
                    }
                }
            }
        }
    },[formValues.customer_id ,getApprovalRights, getCustomerOutstandingDues])

    useEffect(() => { (async () => {
        if(formValues.customer_id && storage?.company_type === 3) {
            const data = {
                customer_id : formValues.customer_id
            }
            setCustomerSelectionDialogOpen(false)
            apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                await dispatch(getCustomerOutstandingDetailsAction(data, true, setLoaderStatusHandler)),
                await dispatch(getCustomerOutstandingDetailsDuesAction(data, true, setLoaderStatusHandler))
            )
        }
    })();
}, [formValues.customer_id])


    useEffect(() => {
        if(props.status === 'edit' && formValues.sale_status === 1) {
            setFormValues((prev) => ({ ...prev, sale_status : 2}))
        }
         if(props.status === 'edit' && formValues.sale_status === 8) {
            setFormValues((prev) => ({ ...prev, sale_status : 2}))
        }
         if(props.status === 'edit' && formValues.sale_status === 8 && props.returnState) {
            setFormValues((prev) => ({ ...prev, sale_status : 8}))
        }

        let pattren = get_sequence_based_on_name.pattern

        if (props.status !== 'edit' && props.status !== 'editSO' && !props.returnState && (formValues.sale_status !== 1 && formValues.sale_status !== 3 && formValues.sale_status !==8 )) {
            setFormValues((prev) => ({
                ...prev,
                invoice_number: pattren,
                so_number : null, dc_number : null ,
            }))
        } 
        else if ((props.status !== 'edit' && props.status !== 'editSO' && formValues.sale_status === 1 && formValues.sale_status !==8)) {
            const so_number = pattren
            setFormValues((prev) => ({
                ...prev, 
                so_number, 
                invoice_number: null, 
                dc_number : null
            }))
        } 
        else if ((props.returnState === true)) {
            const so_number = pattren
            setFormValues((prev) => ({
                ...prev, 
                so_number
            }))
        }
       
        if (props.status === 'edit' && formValues.sale_status === 2) {
            // console.log(formValues.Einvoice, 'formValues.Einvoice')
           // console.log('editiddataaaaa', formValues)
           
            setFormValues((prev) => ({
                ...prev, 
                ship_legal_name : formValues.Einvoice !== undefined && formValues.Einvoice.length&&formValues.Einvoice[0]?.shipping !==undefined ?  formValues.Einvoice[0]?.shipping?.legal_name : null,
                // ship_address : formValues.Einvoice !== undefined && formValues.Einvoice.length&&formValues.Einvoice[0]?.shipping !==undefined ?  formValues.Einvoice[0]?.shipping?.address : null,
                ship_address: (formValues.Einvoice?.length && formValues.Einvoice[0]?.shipping) ? formValues.Einvoice[0].shipping.address : prev.ship_address,
                // ship_location : formValues.Einvoice !== undefined &&  formValues.Einvoice.length&&formValues.Einvoice[0]?.shipping !==undefined ?  formValues.Einvoice[0]?.shipping?.location : null,
                ship_location: (formValues.Einvoice?.length && formValues.Einvoice[0]?.shipping) ? formValues.Einvoice[0].shipping.location : prev.ship_location,
                ship_stcd : formValues.Einvoice !== undefined && formValues.Einvoice.length&&formValues.Einvoice[0]?.shipping !==undefined ?  formValues.Einvoice[0]?.shipping?.stcd : null,
                // ship_zip : formValues.Einvoice !== undefined && formValues.Einvoice.length&&formValues.Einvoice[0]?.shipping !==undefined ?  formValues.Einvoice[0]?.shipping?.zip : null,
                ship_zip: (formValues.Einvoice?.length && formValues.Einvoice[0]?.shipping) ? formValues.Einvoice[0].shipping.zip : prev.ship_zip,
                disp_address : formValues.Einvoice !== undefined && formValues.Einvoice.length&&formValues.Einvoice[0]?.dispatch !==undefined ?  formValues.Einvoice[0]?.dispatch?.address : null,
                disp_company_name :formValues.Einvoice !== undefined && formValues.Einvoice.length&&formValues.Einvoice[0]?.dispatch !==undefined ?formValues.Einvoice[0]?.dispatch?.legal_name : null,
                disp_location : formValues.Einvoice !== undefined && formValues.Einvoice.length&&formValues.Einvoice[0]?.dispatch !==undefined ?formValues.Einvoice[0]?.dispatch?.location : null,
                disp_zip : formValues.Einvoice !== undefined && formValues.Einvoice.length&&formValues.Einvoice[0]?.dispatch !==undefined ? formValues.Einvoice[0]?.dispatch?.zip : null,
                disp_stcd : formValues.Einvoice !== undefined && formValues.Einvoice.length&&formValues.Einvoice[0]?.dispatch !==undefined ?formValues.Einvoice[0]?.dispatch?.stcd : null,
                trans_name : formValues.Einvoice !== undefined &&formValues.Einvoice.length&&formValues.Einvoice[0]?.transport !==undefined ? formValues.Einvoice[0]?.transport?.trans_name : null,
                trans_mode : formValues.Einvoice !== undefined &&formValues.Einvoice.length&&formValues.Einvoice[0]?.transport !==undefined ? formValues.Einvoice[0]?.transport?.trans_mode : null,
                trans_doc_no : formValues.Einvoice !== undefined &&formValues.Einvoice.length&&formValues.Einvoice[0]?.transport !==undefined ? formValues.Einvoice[0]?.transport?.trans_doc_no : null,
                trans_id : formValues.Einvoice !== undefined &&formValues.Einvoice.length&&formValues.Einvoice[0]?.transport !==undefined ? formValues.Einvoice[0]?.transport?.trans_id : null,
                distance : formValues.Einvoice !== undefined &&formValues.Einvoice.length&&formValues.Einvoice[0]?.transport !==undefined ?  formValues.Einvoice[0]?.transport?.distance : null,
                veh_no : formValues.Einvoice !== undefined &&formValues.Einvoice.length&&formValues.Einvoice[0]?.transport !==undefined ? formValues.Einvoice[0]?.transport?.veh_no : null,
                invoice_number : props.returnState ? (invoicenumber ?? '') : (formValues.invoice_number ?? pattren) 
            }))
        }
        if(formValues.sale_status === 8) {
            setFormValues((prev) => ({
                ...prev, 
                so_number : null, 
                invoice_number : null, 
                dc_number : pattren
            }))
        }
         if(formValues.sale_status === 8 && props.status == 'edit') {
            setFormValues((prev) => ({
                ...prev, 
                so_number : null, 
                invoice_number : null, 
                dc_number : props.edit_id_data[0]?.dc_number
            }))
        }
        if(props.status !== 'edit' && props.status !== 'editSO' && props.status !== 'convertSO' && !props.returnState && oldLocationId !== formValues.location_id) {
            if(sales_items.length > 0 && sales_items[0].name !== ''){
                setSaleItemsResetConfirmationDialog(true)
            }
            else{
                setSalesItems([tempInsert])
            }
        }
         if ((props.returnState === true && formValues.dc_id)) {
            const dc_number = pattren
            setFormValues((prev) => ({
                ...prev, 
                dc_number
            }))
        }
      }, [formValues.sale_status, props.status, formValues.location_id, get_sequence_based_on_name?.pattern])


    useEffect(() => {
        if (receivingTimeRef.current) {
            setTimeout(() => {
                receivingTimeRef?.current?.focus()
            }, 100)
        }
    }, [])

    useEffect(() => {
        const buttonDisable = sales_items.some(item => {
            const qty = normalizeQuantity(item.quantity)
            const lotRes = CheckQuantity(item, qty)
            return qty > lotRes
        })
        setInvoiceButtonDisable(buttonDisable)
    }, [sales_items])

    const validationZipHandler = (name, value) => {
        if (!Object.keys(formErrors).includes(name)) return

        if (name === 'ship_zip'|| name =='disp_zip') {
            if (value.length === 0) {
                setFormErrors({
                ...formErrors,
                [name]: "Zip is required"
                })
            }
        }
    }

    const handleChange = async (e) => {
        let { name, value } = e.target

       // console.log('nameeeeeee', name, value)
        if(name === 'location_id'){
            setOldLocationId(formValues.location_id)
        }
        const oldSaleStatus = formValues.sale_status
        setStateHandler(name, value)
        validationZipHandler()
        if (name === 'tcs') {
            const taxableAmount = Number(untaxed(null, formValues.discount_value)) || 0;
           // console.log('untaxedddddd', untaxed(), taxableAmount)

            let percent = 0;

            if (Number(value) > 0 && taxableAmount > 0) {
                percent = ((Number(value) / taxableAmount) * 100);
            }

            setFormValues(prev => ({
                ...prev,
                tcs: value,
                tcs_percent: percent.toFixed(2)
            }));
        }
        // if(name === 'tcs'){
        //      setFormValues((prev) => ({...prev, tcs_percent: calculateTcsTaxRate()}))
        //       console.log('tcs_percent', formValues.tcs_percent)
        // }
        
        if (name === 'ship_zip' || name =='disp_zip') {
          if (value.length === 6) {
                setLoader(true)
                const locationData = await getLocationDataBasedOnPincode(value)
                if (locationData !== undefined) {
                    const { district, state, city, statecode } = locationData
                    if (city && statecode) {
                            if(name == 'ship_zip'){
                                setFormValues((prev) => ({ ...prev, ship_zip: value, ship_location: district, ship_stcd: statecode }))
                                setFormErrors({
                                    ...formErrors,
                                    ship_stcd: null,
                                    ship_location: null
                                })
                            }
                            else{
                                setFormValues((prev) => ({ ...prev, disp_zip: value, disp_location: district, disp_stcd: statecode }))
                                setFormErrors({
                                    ...formErrors,
                                    disp_stcd : null,
                                    disp_location : null
                                })
                            }
                            setLoader(false)
                        }
                }
                else {
                    setLoader(false)
                    setFormErrors({
                        ...formErrors,
                        zip: "Pincode Not Found",
                    })
                }
            }
        }
        if (name === 'ship_location' || name == 'disp_location') {
            if (value.length < 3 || value.length > 50) {
                setFormErrors((prevErrors) => ({
                    ...prevErrors,
                    [name]: 'Location must be between 3 and 50 characters.',
                }))
            } 
            else {
                setFormErrors((prevErrors) => ({
                    ...prevErrors,
                    [name]: null
                }))
            }
        }
        if (name === 'ship_address' || name == 'disp_address') {
            if (value.length < 1 || value.length > 100) {
                setFormErrors((prevErrors) => ({
                    ...prevErrors,
                    [name]: 'Address must be between 1 and 100 characters.',
                }))
            } 
            else {
                setFormErrors((prevErrors) => ({
                    ...prevErrors,
                    [name]: null,
                }))
            }
        }
        if (name === 'TransId') {
            if (value.length === 15) {
                setFormErrors((prevErrors) => ({
                    ...prevErrors,
                    [name]: 'Transaction Trans Id should be 15.',
                }))
            } 
            else {
                setFormErrors((prevErrors) => ({
                    ...prevErrors,
                    [name]: null,
                }))
            }
        }
        if (name === 'ship_stcd' || name == 'disp_stcd') {
            if (value.length !== 2) {
                setFormErrors((prevErrors) => ({
                    ...prevErrors,
                    [name]: 'stcd must 2 character',
                }))
            } 
            else {
                setFormErrors((prevErrors) => ({
                    ...prevErrors,
                    [name]: null,
                }))
            }
        }
        // if (name === 'trans_mode') {
        //     if (value.length !== 1) {
        //         setFormErrors((prevErrors) => ({
        //             ...prevErrors,
        //             [name]: 'Mode of transport (Road-1, Rail-2, Air-3, Ship-4)',
        //         }))
        //     } 
        //     else {
        //         setFormErrors((prevErrors) => ({
        //             ...prevErrors,
        //             [name]: null,
        //         }))
        //     }
        // }
        if (name === 'distance') {
          const isNumber = /^\d+$/.test(value); // only digits
          const numValue = parseInt(value, 10);

          if (!isNumber || numValue < 0 || numValue > 4000) {
            setFormErrors((prevErrors) => ({
              ...prevErrors,
              [name]: 'Distance must be a number between 0 and 4000',
            }));
          } else {
            setFormErrors((prevErrors) => ({
              ...prevErrors,
              [name]: null,
            }));
          }
        }

        if (name === 'trans_mode') {
          const isSingleDigit = value.length === 1;
          const isNumber = /^\d$/.test(value); // ensures it's a single digit number
          const numValue = parseInt(value, 10);

          if (!isSingleDigit || !isNumber || numValue < 1 || numValue > 4) {
            setFormErrors((prevErrors) => ({
              ...prevErrors,
              [name]:
                'Mode of transport (Road-1, Rail-2, Air-3, Ship-4)',
            }));
          } else {
            setFormErrors((prevErrors) => ({
              ...prevErrors,
              [name]: null,
            }));
          }
        }
        if(name === 'tds_percent') {
           // console.log('valueeeeeeeeeeeeeeee', value)
            setFormValues((prev) => ({...prev, tds_percent: (value?.tds_rate || 0), tds_id: value?.id || null}))
        }
    
        if(name === 'sale_status' && sales_items.length > 0 && oldSaleStatus === 2 && (value === 1)) {
            setProductResetDialog(true)
            setOldSaleStatus(oldSaleStatus)
        }
    
        if(name === 'veh_no') {
            if(vehicleNumberValidation(value) !== true){
                setFormErrors((prev) => ({...prev, veh_no: 'Vehicle Number is Invalid'}))
            }
            else {
                setFormErrors((prev) => ({...prev, veh_no: null}))
            }
        }
        
        if(name === 'trans_id'){
            if(gstValidation(value) !== true) {
                setFormErrors((prev) => ({...prev, trans_id: 'GST Number is Invalid'}))
            }
            else {
                setFormErrors((prev) => ({...prev, trans_id: null}))
            }
        }
        if(name === 'trans_name' && value?.length <= 2){
            setFormErrors((prev) => ({...prev, trans_name: 'Name must be minium 3 characters length'}))
        }
        if (name === 'sub_company_id') {
            setFormValues((prev) => ({ ...prev, tax_id: value.tax_id, sub_company_id: value.sub_company_id }))
        }
        
    }

    const handleOpenDialog = () => {
        setOpenDialog(true)
    }
    
    const handleCloseDialog = () => {
        const selectedAdd = selectedAddress?.shipping_id || "NoID"
        const confirmedAdd = confirmedSelectedAddress?.shipping_id || "NoID"
        // console.log(selectedAdd,confirmedAdd,selectedAdd === confirmedAdd,"cvg65h");

        if(selectedAdd === confirmedAdd){
            setOpenDialog(false)
        }else if(selectedAdd === "NOID"){
            setOpenDialog(false)
        }
        else{
            setSelectedAddress(null)
            setOpenDialog(false)
        }
        
    }

    const handleOpenEdit = () => {
        if(dueDaysInput === '') {
            setDueDaysInput(selectedCustomer?.credit_days ?? '')
        }
        setEditOpen(true)
    }

    const handleCloseEdit = () => {
        setEditOpen(false)
    }

    const handleOpenCreditDaysValueEdit = () => {
        if(dueDaysValueInput === '') {
            setDueDaysValueInput(selectedCustomer?.credit_value ?? '')
        }
        setCreditDaysValueOpen(true)
    }

    const handleCloseCreditDaysValueEdit = () => {
        setCreditDaysValueOpen(false)
    }

    const handleSalesmanEdit = () => {
        setEditSalesManOpen(true)
    }

    const handleSalesmanChange = (id) => {
        if(customer_salesman?.sales_man_list?.length > 0) {
            const selected = customer_salesman.sales_man_list.find(s => s.employee_id === id)
            setSalesMan({ id : selected.employee_id, value : selected.username })
        }
    }

    const handleSave = async (e, type) => {
        e.preventDefault()
        if(type === 'CreditDays') {
            const data = {
                customer_id : selectedCustomer?.customer_id,
                credit_days : dueDaysInput || null,
                type : type
            }
            setFormValues((prev) => ({...prev, invoiceCreditDays : dueDaysInput}))
            setDueDaysInput(dueDaysInput)

            if(selectedCustomer.credit_days === 0 || selectedCustomer.credit_days === null) {
                apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    dispatch(updateCreditDaysAction(data, true, setLoaderStatusHandler, async(res) => {
                        if (res) {
                            setSelectedCustomer(res[0])
                        }
                    }))
                )

            }
            handleCloseEdit()
        }
        else if(type === 'salesman') {
            const data = {
                customer_id : selectedCustomer?.customer_id,
                salesMan_id : salesMan || null,
                type : type
            }
            setFormValues((prev) => ({...prev, sales_man : salesMan}))

            // if(customer_salesman?.customer_sales_man?.length === 0) {
                apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    dispatch(updateCreditDaysAction(data, true, setLoaderStatusHandler))
                )
            // }
            setEditSalesManOpen(false)
        }
        else {
            const data = {
                customer_id : selectedCustomer?.customer_id,
                credit_value : dueDaysValueInput || null,
                type : type
            }
            setFormValues((prev) => ({...prev, invoiceCreditValue : dueDaysValueInput}))
            setDueDaysValueInput(dueDaysValueInput)

            if(selectedCustomer.credit_value === null) {
                apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    dispatch(updateCreditDaysAction(data, true, setLoaderStatusHandler, async(res) => {
                        if (res) {
                            setSelectedCustomer(res[0])
                        }
                    }))
                )
            }
             handleCloseCreditDaysValueEdit()
        }
    }

    const shippingApply = async (values) => {
        const indexToUpdate = values?.tableData?.index
    
        let payload = {}
      
        if (editShippingMode === "EditShipping") {
            const updatedShipping = {
                ...values,
                customer_id : formValues?.customer_id,
                mode : editShippingMode,
                isPrimary : values.shipping_id ? false : true
            }      
            payload = updatedShipping
        } 
        else {
            payload = {
                ...values,
                customer_id : formValues?.customer_id,
                mode : "create"
            }
        }

        setFormValues((prev) => ({ 
            ...prev, 
            company_name: null,
            contactperson_name: null,
            contactperson_num: null,
            Gst: null,
            city: null,
            state: null,
            pin_code: null,
            country: 'India',
            latitude : null,
            longitude: null
        }))
        const payloadd = { ...values,  customer_id : formValues?.customer_id }
        
        setShippingOpen(false)
        apiCalls (
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(updateShippingDetailAction(payload,() => {
                dispatch(listCustomerAction(setModalTypeHandler, setLoaderStatusHandler))
            })
        ))
    }

    const shippingFilter = (data) => {
        setShippingOpen(data)
    }

    const handleshippingEditSubmit = (data) => {
        data.pin_code = data.zip
        let index_value = data.tableData.index
        let updated = [...props.shippingData]
        if (index_value !== undefined && updated[index_value]) {
            updated[index_value] = data
        }
        props.setShippingData(updated)
        setShippingOpen(false)
    }

    const handleSelectAddress = async (address) => {
        
        setSelectedAddress(address)
        // setConfirmedSelectedAddress(address)
        setAddressManuallySelected(true)
        // const locationData = await getLocationDataBasedOnPincode(address.pin_code || address.zip)
        // let location = { ship_location: null, ship_stcd: null }
        
        // if (locationData?.city && locationData?.statecode) {
        //     location = {
        //         ship_location: locationData.district,
        //         ship_stcd: locationData.statecode,
        //     }
        // }
        // setFormValues((prev) => ({
        //     ...prev,
        //     ship_legal_name : address.company_name,
        //     ship_address : address.address,
        //     ship_zip : address.pin_code || address.zip,
        //     ship_gstin : address.Gst || address.tax_id,
        //     ship_phone_number : address.phone_number || address.contactperson_num,
        //     ship_person_name : address.contactperson_name,
        //     ...location
        // }))
        // handleCloseDialog()
    }

    const handleSubmitSelectAddress = async () => {
               setConfirmedSelectedAddress(selectedAddress)
        setAddressManuallySelected(true)
        const locationData = await getLocationDataBasedOnPincode(selectedAddress?.pin_code || selectedAddress?.zip)
        let location = { ship_location: null, ship_stcd: null }
        
        if (locationData?.city && locationData?.statecode) {
            location = {
                ship_location: locationData?.district,
                ship_stcd: locationData?.statecode,
            }
        }
        setFormValues((prev) => ({
            ...prev,
            ship_legal_name : selectedAddress?.company_name,
            ship_address : selectedAddress?.address,
            ship_zip : selectedAddress?.pin_code || selectedAddress?.zip,
            ship_gstin : selectedAddress?.Gst || selectedAddress?.tax_id,
            ship_phone_number : selectedAddress?.phone_number || selectedAddress?.contactperson_num,
            ship_person_name : selectedAddress?.contactperson_name,
            ...location
        }))
        setOpenDialog(false)
    }

    const handleEditShipping = (address, index, shippingList) => {
        setShipFormValues({
            ...address,
            isPrimary : !address.shipping_id ? false : false,
            Gst : address.tax_id || address.Gst,
            contactperson_num : address.contactperson_num || address.phone_number,
            contact_person_name : address.contact_person_name || address.first_name,
            tableData : { index: index },
            fullList : shippingList
        })
        setEditShippingMode('EditShipping')
        setShippingOpen(true)
    }

    const cancel = () => {
        setDialog(false)
    }

    const validClose = () => {
        setDialog(true)
    }

   const productAdding = (v, newProductAdd, index) => {
    setProductDetails(v);

    // Get discounted price if applicable
    let discount_price;
    if (props?.price_list?.length > 0) {
        const priceObj = props.price_list.find((e) => {
            const isMatchingPriceList = e.id === formValues.price_list;
            const isCustomerAllowed = e.customerMappedIds.some(
                (c) => c.customer_id === formValues.customer_id
            );
            return isMatchingPriceList && isCustomerAllowed;
        });
        discount_price = priceObj;
    }

    let productDiscount;
    if (discount_price?.productData.length > 0) {
        productDiscount = discount_price.productData.find((e) => e.product_id == v.item_id);
    }

    // Determine available quantity
    const itemQty = v?.item_qty || [];
    const available_quantity = (() => {
        const qtyObj = itemQty.find((q) => q.location_id === formValues.location_id);
        return qtyObj ? qtyObj.totalQuantity : 0;
    })();

    // Build new row data
    const rowData = {
        item_id: v.item_id,
        name: v.name,
        item_cost_price: v.cost_price,
        item_unit_price: parseFloat(
            productDiscount?.discount_price !== undefined
                ? productDiscount.discount_price
                : newProductAdd
                ? v.unit_price
                : 0
        ).toFixed(2),
        taxes_name: v.taxes
            .map((t) => (t.tax_group === 'IGST' ? t.tax_category : null))
            .filter((f) => f !== null)[0],
        quantity: 1,
        line: index + 1,
        sub_total: singleTax(
            productDiscount?.discount_price !== undefined
                ? productDiscount.discount_price
                : newProductAdd
                ? v.unit_price
                : 0,
            1,
            v.taxes
        ).toFixed(2),
        discount: 0,
        discount_type: null,
        print_option: 1,
        available_quantity,
        sales_item_taxes: Sales_Item_Taxes(productByType, [v], sales_items, v.unit_price, v.taxes),
        hsn_code: v.hsn_code,
        taxes: v.taxes,
        is_serialized: v.is_serialized,
        qty_per_pack: v.qty_per_pack,
        lots: [],
        description: v.description,
        stock_type: v.stock_type,
        tax_category: v.tax_category,
        tax_category_id: v.tax_category_id,
    };

    // Update sales_items array
    const updatedSaleItems = sales_items.map((d, idx) => (idx === index ? rowData : d));
    setSalesItems(updatedSaleItems);
};


    const taxedits = () => {
        if (props.selectData.product) {
            const filter = [...product]
            const pop = filter.shift()
            productAdding(pop, true, sales_items.length - 1)
            addActionRef.current?.click()
            props.setselectData('product', false)
        }
    }

    temptaxedits.current = taxedits

    useEffect(() => {
        temptaxedits.current()
    }, [props.selectData.product])

    const item = () => {
        if(sales_items.length === 0) return
        let res = [];
        const sale_tax_amount = sales_items.map((s) => {
            res.push(floatnum(s.sales_item_taxes?.item_tax_amount * s.quantity))
            return getArraySum(res)
        })
        
        let basis = []

        const sale_tax_basis = sales_items.map((s) => {
            basis.push(s.sub_total)
            return getArraySum(basis)
        })
        const productSearch = (id) => {
            const Match = productByType.filter((f) => f.item_id === id)
            return Match[0]
        }
        let sales_tax1 = sales_items.map((s) => {
            const p = productSearch(s.item_id)
            if (!p) {
                return null
            }

            if (s.item_id === p?.item_id && p.taxes.length > 0) {
                return p.taxes.map((t) => {
                    if (t.tax_group === 'IGST') {
                        return {
                        jurisdiction_id: 0,
                        tax_category_id: p.tax_category_id,
                        tax_type: 0,
                        tax_group: t.tax_group,
                        sale_tax_basis: sale_tax_basis[sale_tax_basis.length - 1],
                        sale_tax_amount:
                            sale_tax_amount[sale_tax_amount.length - 1],
                        print_sequence: '1',
                        name: t.tax_category,
                        tax_rate: t.tax_rate,
                        sales_tax_code_id: 0,
                        rounding_code: 0,
                        }
                    }
                    else return null
                }).filter((f) => f !== null)[0]
            } 
            else return null
      }).filter((f) => f !== null)[0]
        let sales_tax2
        if(tcstaxvisible === true) {
            sales_tax2 =  sales_items?.map((s) => {
                const p = productSearch(s.item_id);
                if (s.item_id === p?.item_id && p.taxes.length > 0) {
                    return p.taxes?.map((t) => {
                        if (t.tax_group === 'TCS') {
                            return {
                                jurisdiction_id : 0,
                                tax_category_id : p.tax_category_id,
                                tax_type : 0,
                                tax_group : t.tax_group,
                                sale_tax_basis : sale_tax_basis[sale_tax_basis.length - 1],
                                sale_tax_amount : tcsuntaxed('taxes'),
                                print_sequence : '1',
                                name : t.tax_category,
                                tax_rate : t.tax_rate,
                                sales_tax_code_id : 0,
                                rounding_code : 0,
                            }
                        }
                        else return null
                    }).filter((f) => f !== null)[0]
                } 
                else return null
            }).filter((f) => f !== null)[0]
        }
        
        setSalesTaxes([sales_tax1, ...(tcstaxvisible && sales_tax2 ? sales_tax2 : [])])
    }

    tempitem.current = item

    useEffect(() => {
        tempitem.current()
    }, [sales_items])

    const cust = () => {
        cusArray.map((c)=> {
          
             if (formValues.customer_id === c.customer_id) {
                if(c?.tax_type === 'INTRA'){
                    setTaxVisible(true)
                }else{
                    setTaxVisible(false)
                }

             }
        })
    }

    tempcust.current = cust

   // console.log('taxvisibleee', taxVisible)

   // console.log('cusarray', cusArray)
   // console.log(' props.app_config_data_based_on_type',  props.app_config_data_based_on_type)

    useEffect(() => {
        tempcust.current()
    }, [formValues.customer_id])

    const tcscust = () => {
        cusArray?.map((c) => {
            if (formValues.customer_id === c.customer_id) {
                if (c.tcs === 1) {
                    setTcsVisible(true)
                } 
                else {
                    setTcsVisible(false)
                }
            }
            return null
        })
    }

    tcscust.current = tcscust

    useEffect(() => {
        tcscust.current()
    }, [formValues.customer_id])

    const floatnum = (num) => {
        const parsedNum = Number(num)
        if (!Number.isFinite(parsedNum)) return 0
        const str = parsedNum.toFixed(2)
        const numarray = str.split('.')
        let convert = numarray[0]
        if (numarray[1]) {
            convert += '.' + numarray[1]
        } 
        else {
            convert += '.00'
        }
        return parseFloat(convert)
    }

    const getSafeSalesTotal = () => {
        const untaxedAmount = Number(untaxed(null, formValues.discount_value)) || 0
        const taxAmount = Number(untaxed('taxes', formValues.discount_value)) || 0
        const tcsAmount = Number(tcsuntaxed('taxes')) || 0
        const tdsAmount = Number(calculatetdsTaxAmount()) || 0
        const shippingCharges = Number(formValues.shipping_charges ?? 0) || 0
        const otherCharges = Number(formValues.other_charges ?? 0) || 0

        return round2(untaxedAmount + taxAmount + tcsAmount - tdsAmount + shippingCharges + otherCharges)
    }

    /**
     * Returns the grand total, applying rounding if enabled in config.
     * Replaces all inline total ternary expressions.
     * Always includes shipping/other charges even when subtotal is 0.
     */
    const getGrandTotal = () => {
        const total = getSafeSalesTotal()
        if (props.appConfigData.roundedOffEnabled === 'true') {
            return Math.round(total)
        }
        return total
    }

    /**
     * Returns the raw (non-rounded) grand total for threshold checks (e.g. eWay bill ≥ 50000).
     * Excludes shipping/other charges to match the existing threshold logic.
     */
    const getSubtotalForThreshold = () => {
        const untaxedAmount = Number(untaxed(null, formValues.discount_value)) || 0
        const taxAmount = Number(untaxed('taxes', formValues.discount_value)) || 0
        const tcsAmount = Number(tcsuntaxed('taxes')) || 0
        const tdsAmount = Number(calculatetdsTaxAmount()) || 0
        return round2(untaxedAmount + taxAmount + tcsAmount - tdsAmount)
    }

    const taxes = (tax_rate) => {
        let total = 0
        var newArray = sales_items.filter(function (el) {
            return el.taxes_name === tax_rate
        })
        newArray.map((n) => {
            total +=
                ((n.item_unit_price * n.quantity) / 100) * tax_rate.match(/\d+/)[0]
            return null
        })
        return total.toFixed(2)
    }

    const custData = () => {
        const filterCol = [
            {tax_des: 'CGST'},
            {tax_des: 'SGST'},
            {tax_des: 'Amount'},
        ]

        for (let [count, data] of sales_items.entries()) {
            productByType.map((p) => {
                if (data.item_id === p.item_id) {
                    p.taxes.map((t) => {
                        if (t.tax_group === 'CGST')
                        filterCol[0][`tax${count}`] = floatnum(t.tax_rate)

                        if (t.tax_group === 'SGST')
                        filterCol[1][`tax${count}`] = floatnum(t.tax_rate)

                        if (t.tax_group === 'IGST')
                        filterCol[2][`tax${count}`] = taxes(t.tax_category)
                        return null
                    })
                }
                return null
            })
        }
        return filterCol
    }

    const custColumn = () => {
        let taxes = [{title: '', field: 'tax_des'}]
        let taxValue = []
        sales_items.map((d, i) =>
            productByType.map((p) => {
                if (d.item_id === p.item_id)
                    return p.taxes.map((t) => {
                        if (t.tax_group === 'IGST') {
                            if (_.includes(taxValue, t.tax_rate / 2) === false)
                            taxes.push({title: `${t.tax_rate / 2}%`, field: `tax${i}`})
                            taxValue.push(t.tax_rate / 2)
                        }
                        return null
                    })
            return null
          }),
        )
        return taxes
    }

    const round2 = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

    const untaxed = (taxes, discount) => {
        let mappingColumn = ['quantity', 'item_unit_price', 'item_id', 'discount']
        let total = 0
        // if (formValues.sale_status === 2 && formValues.so_number) {
        //     sales_items?.filter((s) => (s.is_serialized === 1 ? s.lots?.length > 0 : true)).map((s) => {
        //         let arr = []
        //         mappingColumn.map((c) => {
        //             if (_.includes(Object.keys(s), c)) {
        //                 arr.push(s[c])
        //             }
        //             return null
        //         })
        //         if (taxes) {
        //             productByType.map((p) => {
        //                 if (p.item_id === arr[2]) {
        //                     p.taxes.map((t) => {
        //                         if (t.tax_group === 'IGST') {
        //                             total += ((arr[0] * arr[1]) / 100) * t.tax_rate
        //                         }
        //                         return null
        //                     })
        //                 }
        //                 return null
        //             })
        //             return null
        //         }
        //         else {
        //             total += arr[0] * arr[1]
        //         }
        //         return total
        //     })
        //     return total

        // }
        // else {
        
        let finalSalesItems = []
        if(discount){
            // if(formValues.discount_type === 1){
                finalSalesItems = sales_items.map(item => {
                    const productDiscount = untaxed() > 0 ? Number((item.item_unit_price / untaxed()) * Number(formValues?.discount_amount ?? 0)).toFixed(2) : 0
                    // setFormValues((prev) => ({ ...prev, discount_amount: prev.discount_amount + productDiscount }))
                    return{
                        ...item,
                        discount: productDiscount
                    }
                })
            // }
            // else{
                // finalSalesItems = sales_items.map(item => {
                //     const productDiscountPercent = Number((item.item_unit_price / untaxed()) * Number(formValues.discount_amount ?? 0)).toFixed(2)
                //     const productDiscount = Number((item.item_unit_price * productDiscountPercent) / 100).toFixed(2)
                //     // setFormValues((prev) => ({ ...prev, discount_amount: prev.discount_amount + productDiscount }))
                //     return{
                //         ...item,
                //         discount: productDiscount
                //     }
                // })
            // }
        }
        else{
            finalSalesItems = sales_items
        }
        const filteredSalesItems = (formValues.sale_status === 2 || formValues.sale_status === 8) ? 
            finalSalesItems.filter((d) => {
                if(d.is_serialized === 1){
                    return d.lots.length > 0
                }
                else{
                    return true
                }
            })
        : finalSalesItems
            filteredSalesItems?.map((s) => {
                let arr = []
                mappingColumn.map((c) => {
                    if (_.includes(Object.keys(s), c)) {
                        arr.push(s[c])
                    }
                    return null
                })
                const quantity = Number(arr[0]) || 0
                const unitPrice = Number(arr[1]) || 0
                const itemId = arr[2]
                const discountValue = Number(arr[3]) || 0
                if (taxes) {
                    productByType.map((p) => {
                        if (p.item_id === itemId) {
                            s?.taxes?.map((t) => {
                                const taxRate = Number(t.tax_rate) || 0
                                if (t.tax_group === 'IGST') {
                                    total += ((quantity * (unitPrice - discountValue)) / 100) * taxRate
                                }
                                return null
                            })
                        }
                        return null
                    })
                    return null
                }
                else {
                    total += quantity * (unitPrice - discountValue)
                }
                return total
            })
            return round2(total)
        // }

       
    }

    // function calculateTcsTaxRate() {
    //     if (formValues.tcs && !isNaN(formValues.tcs)) {
    //         let taxableAmount = untaxed() - parseFloat(formValues.tcs) || 0
    //         let taxRate = (parseFloat(formValues.tcs) / taxableAmount) * 100
    //         console.log('taxrateeeeeeeeeeeeeeeee', taxRate)
    //        // return taxRate.toFixed(2)
    //        return '5%'
    //     } 
    //     else {
    //         return "0%"
    //     }
    // }

    const tcsuntaxed = () => {
        
        let total = 0
        if(!props.returnState){
        if (formValues.tcs && !isNaN(formValues.tcs)) { 
            total = parseFloat(formValues.tcs) || 0
            return round2(total)
        }
        return total
        }else{
             const taxableAmount = Number(untaxed(null, formValues.discount_value)) || 0;
        const percent = Number(formValues.tcs_percent) || 0;

        if (taxableAmount > 0 && percent > 0) {
             let val = ((taxableAmount * percent) / 100)
            // setFormValues(prev => ({
            //     ...prev,
            //     tcs: val
            // }));
        //    console.log('vallllllllllllllllll', val)
            return round2(val)
        }

        //   setFormValues(prev => ({
        //         ...prev,
        //         tcs: 0
        //     }));

        return 0
        }
    }

    const tcsInitRef = useRef(false);

    function calculateTcsFromPercent() {
        const taxableAmount = Number(untaxed(null, formValues.discount_value)) || 0;
        const percent = Number(formValues.tcs_percent) || 0;

        if (taxableAmount > 0 && percent > 0) {
            // let val = ((taxableAmount * percent) / 100).toFixed(2);
            // setFormValues(prev => ({
            //     ...prev,
            //     tcs: val
            // }));
            return ((taxableAmount * percent) / 100).toFixed(2);
        }

        //   setFormValues(prev => ({
        //         ...prev,
        //         tcs: 0
        //     }));

        return "0.00";
    }

    useEffect(() => {
        if (!props?.returnstate) return;

        const tcsAmount = calculateTcsFromPercent();

        // prevent infinite loop
        if (tcsInitRef.current && String(formValues.tcs) === String(tcsAmount)) {
            return;
        }

        tcsInitRef.current = true;

        setFormValues(prev => ({
            ...prev,
            tcs: tcsAmount
        }));

    }, [props?.returnstate, sales_items, formValues.tcs_percent]);


   // console.log('sales_itemssales_items', sales_items)

    function calculateTcsTaxRate() {
     //   console.log('calculateTcsTaxRate', formValues.tcs)
        if (formValues.tcs && !isNaN(formValues.tcs)) {
            let taxableAmount = untaxed(null, formValues.discount_value)
            let taxRate = (parseFloat(formValues.tcs) / taxableAmount) * 100
            let tax_value = taxRate.toFixed(2)

          //  console.log('tax_valuetax_value', tax_value)
            return tax_value
        } 
        else {
            return "0%"
        }
    }

    function calculatetdsTaxAmount() {
        let total = 0
        if (formValues.tds_percent && !isNaN(formValues.tds_percent)) {
            total = ((untaxed(null, formValues.discount_value) * formValues.tds_percent) / 100)
            return round2(total);
        }
        else{
            return total
        }
    }



    function getArraySum(a) {
        var tot = 0
        for (var i in a) {
            tot += parseFloat(a[i])
        }
        return tot
    }

    useEffect(() => { 
        const po =  props.stocklocation.find((d) => d.location_id === formValues.location_id) || {}
    
        let email = props.appConfigData ? props.appConfigData?.companyEmail : ''
        
        if(Object.keys(po).length) {
            let locationData = {
                ...props.appConfigData,
                companyAddress : po.address ,
                companyEmail : po.email?? email,
                companyMobile : po.phone_number,
                state : po.state,
                zip : po.zip,
                city : po.city
            }
            props.setAppConfigData(locationData)
        }
    }, [formValues.location_id])

    const totalAmount = floatnum(untaxed(null, formValues.discount_value) + untaxed('taxes', formValues.discount_value) + tcsuntaxed('taxes') + getCustomerOutstanding[0]?.total_amount)

    useEffect(() => {
        if(getApprovalRights && props.status !== 'edit') {
            if(getApprovalRights?.rights !== true) {
                return setRequest(false)
            }
        }
        if (totalAmount > 0 && getApprovalRights?.rights === true && props.status !== 'edit' && getCustomerOutstanding[0]?.total_amount !== null) {
            const matchedCustomer = customer.find((e) => e.customer_id === formValues.customer_id && totalAmount >= (e?.credit_value === null ? 0 : e?.credit_value))
    
            if (matchedCustomer ) {
                setDueAmountPopupOk('WaitingSo')
                return setRequest(true)
            }
            else {
                setDueAmountPopupOk('')
                setRequest(false)
            }
        }
    }, [formValues.customer_id, totalAmount, getApprovalRights?.length])

    useEffect(() => { (async () => {
        if(formValues.customer_id != null && getApprovalRights.rights === true && storage?.company_type === 3 && props.status === 'edit') {
            const payload = {
                type : 'Customer_sale_item',
                sale_id : props.edit_id_data[0].sale_id,
                pageCount : 0,
                numPerPage : 15
            }
            await dispatch(salesApprovalsAction(payload))
        }
        else if(formValues.customer_id != null && getApprovalRights.rights === true && storage?.company_type === 3 && props.status !== 'edit' && props.status !== 'editSO') {
            const payload = {
                type : 'Customer_sale_item_create',
                customer_id : formValues.customer_id,
                pageCount : 0,
                numPerPage : 15
            }
            await dispatch(salesApprovalsAction(payload))
        }
    })();
},[formValues.customer_id])

    useEffect(() => {
        const updateSalesApproval = async () => {
            if( storage?.company_type === 3) {
                if ((getApprovalRights?.rights !== true) || salesApprovals.length === 0) return
                const salesApproval = salesApprovals[0]
            
                if (salesApproval.status === 'Approved') {
                    setRequest(false)
                    return
                }
        
                const creditValue = salesApproval.credit_value ?? 0
                if ((salesApproval.credit_days === 0 && creditValue === 0) || (salesApproval.outstanding >= creditValue) || salesApproval.is_overdue === 1 || totalAmount > creditValue) {
                    setRequest(true)
                } 
                else {
                    setRequest(false)
                }
            }
        
        }
        updateSalesApproval()
    }, [salesApprovals?.length])

    const LotRes = (rowData, qty) => {
        let res = []
        if (rowData.is_serialized === 0) {
            const matchedProductType = productByType.find((p) => parseInt(p.item_id) === parseInt(rowData.item_id))
    
            const itemQty = matchedProductType?.item_qty || []
    
            const locationId = !_.isEmpty(props.edit_id_data) ? props.edit_id_data[0].location_id: formValues.location_id
    
            const qtyObj = itemQty.find(q => parseInt(q.location_id) === parseInt(locationId))
            return qtyObj ? qtyObj.totalQuantity : 0
        } 
        else {
          res = rowData.lots
          return res
        }
    }

     const CheckQuantity = (rowData, qty) => {
        if(!_.isEmpty(props.edit_id_data)){
            const matchedProductType = productByType.find((p) => parseInt(p.item_id) === parseInt(rowData.item_id))
     
             const itemQty = matchedProductType?.item_qty || []
             const locationId = !_.isEmpty(props.edit_id_data) ? props.edit_id_data[0].location_id: formValues.location_id
             const qtyObj = itemQty.find(q => parseInt(q.location_id) === parseInt(locationId))
             return qtyObj ? qtyObj.totalQuantity : qty
        }
       
    }

    const handleItemPopup = async (data, onRowDataChange, type) => {
        const id = data.tableData?.id
        setRowid({
            onRowDataChange,
            open : true,
            id : id,
            data : data,
            status : 'edit'
        })
    }

    const handleItemPopUpClose = () => {
        setRowid({...row_id, open: false})
    }

    const handleViewSerialNumber = (rowData) => {
        const serialNumbers = []
        if(rowData.is_serialized === 1) {
            rowData.lots.map((lot, index) => serialNumbers.push({sNo: index + 1, lotNumber: lot.lot_number}))
            setViewSerialNumber([...serialNumbers])
        }
        setViewSerialNumberOpen(true)
    }

    const deleteProductRowData = async (index) => {
        if(sales_items.length > 1) {
            const updatedTransaction = [...sales_items]
            updatedTransaction.splice(index, 1)
            await setSalesItems(updatedTransaction)
            setDeleteDialog(false)
            setHsnError('')
        }
    }

    const addNote = (data) => {
        setFormValues((prev) => ({...prev, note: data}))
    }

    const getCustomer = () => cusArray?.filter((d) => formValues.customer_id === d.customer_id)[0]

    const createMail = () => {
        const custData = getCustomer()
        props.createMail(
            custData,
            formValues.sale_status === 1 ? formValues.so_number : formValues.invoice_number,
            sales_items,
            custData.email,
            formValues.sale_status === 1 ? formValues.sale_time : formValues.invoice_date
        )
    }

   // console.log('formValues.tax_types', formValues.tds_id, formValues.tcs_percent, formValues.tds_percent, formValues.tcs, formValues.tds)

    const getCostPrice = () => {
        let total = 0
  
        sales_items.filter((d)=> d.stock_type !== 0).forEach((d) => {
            total += d.quantity * +d.item_cost_price
        })
        return total;   
    }

    const handleSubmit = async (setDisable, isAddressChecked) => {
        if(excelItemsNotAdded.length > 0) {
            setOpenAlert(true)
            return
        }

        if(formValues.sale_status === 2 && formValues.ship_address === null && selectedCustomer.gst === '1' && !isAddressChecked && !props.returnState){
            setAddressDialog(true)
            return
        }
        setOldLocationId(formValues.location_id)
        setAddressDialog(false)

        let isValid = true
        let formErrorsObj = {...formErrors}
        for (const key of Object.keys(formValues)) {
            if(requiredFields.includes(key) && (formValues[key] === null || formValues[key] === '')) {
                isValid = false
                formErrorsObj[key] = capitalize(key) + ' is Required!'
            }

            if(formValues.sale_status === 2 && (untaxed(null, formValues.discount_value) + untaxed('taxes', formValues.discount_value) >= 50000 ) && selectedCustomer.gst === '1'  && 
                (props.appConfigData.eInvoice === '1' || props.appConfigData.ewayBill === '1')) {
                if (ewayrequiredFields.includes(key) && (formValues[key] === null || formValues[key] === '')) {
                    isValid = false
                    formErrorsObj[key] = capitalize(key.replace(/_/g, ' ')) + ' is Required!'
                }
            }
            else if ((formValues.invoice_number === null && formValues.sale_status === 2) ||
                (typeof formValues.invoice_number === 'undefined' && formValues.sale_status === 2)) {
                isValid = false
            }
            else if ((formValues.so_number === null || typeof formValues.so_number === 'undefined') && formValues.sale_status === 1) {
                isValid = false
                alert('SO Number Cannot null')
            }
            else if (regex[key]) {
                if (!regex[key].test(formValues[key])) {
                    isValid = false
                    formErrorsObj[key] = capitalize(key) + ' is Invalid!'
                }
            }
            else if (props.pageType === '/sales/invoices' && formValues.ship_address && formValues.ship_address.length > 100) {
                dispatch(OpenalertActions({ msg: 'Ship Address exceeded the limit of 100 characters', severity: 'warning' }))
                return
            }
        }
        await setFormErrors(formErrorsObj)
        await setFormValues((prev) => ({
            ...prev,
            sales_taxes : 
                sales_taxes || 
                [].map((m) => {
                    const { tableData, ...rest } = m
                    return rest
                }),
            sales_items : sales_items
        }))
        // let SalesItems = []

        // if (formValues.sale_status === 2 && formValues.so_number) {
        //     SalesItems = sales_items
        //         .filter((s) => (s.is_serialized === 1 ? s.lots?.length > 0 : true))
        //         .map((s) => ({
        //             ...s,
        //             item_cost_price:
        //                 s.lots[0]?.trans_items_cost_price !== null && s.stock_type === 1
        //                     ? s.lots[0].trans_items_cost_price
        //                     : 0.0,
        //             item_unit_price: s.stock_type === 1 ? s.item_unit_price : s.item_unit_price || 0,
        //         }))
        // } else if (formValues.sale_status === 2 || formValues.sale_status === 8) {
        //     SalesItems = sales_items.map((s) => ({
        //         ...s,
        //         item_cost_price:
        //             s?.lots?.length > 0 && s.lots !== undefined && s.lots[0]?.trans_items_cost_price !== null && s.stock_type === 1
        //                 ? s.lots[0].trans_items_cost_price
        //                 : 0.0 || 0,
        //         item_unit_price: s.stock_type === 1 ? s.item_unit_price : s.item_unit_price || 0,
        //     }))
        // } else {
        //     SalesItems = sales_items
        // }


        const filteredSalesItems = (formValues.sale_status === 2 || formValues.sale_status === 8) ? 
            sales_items.filter((d) => {
                if(d.is_serialized === 1){
                    return d.lots.length > 0
                }
                else{
                    return true
                }
            })
        : sales_items
        if(filteredSalesItems.length === 0){
            alert('Please Enter Barcode All Items');
            return
        }
          let SalesItems = (formValues.sale_status === 2 || formValues.sale_status === 8) ? 
            filteredSalesItems.map((s) => {
                return {
                    ...s,
                    item_cost_price : s?.lots?.length > 0 && s.lots !== undefined && s.lots[0]?.trans_items_cost_price !== null && s.stock_type === 1
                        ? s.lots[0]?.trans_items_cost_price : 0.00 || 0,
                    item_unit_price : s.stock_type === 1 ? s.item_unit_price : s.item_unit_price || 0
                }
            })
            : filteredSalesItems

        const custData = getCustomer()

        // Validate quantity on all sales items before submission
        const quantityValidation = validateSalesItemsQuantity(SalesItems);
        if (!quantityValidation.valid) {
            alert(quantityValidation.errors[0]);
            return;
        }

      //  console.log('handlesubmitisvalid', formErrors)
        const hasErrors = Object.values(formErrors).some((error) => error && error.length > 0);
        if (hasErrors) {
          isValid = false
        }
        if(isValid) {
            setDisable(true)
            const received_amount = Tdata.reduce(function (acc, obj) {
                return acc +  +obj.payment_amount
            }, 0)

            const dcchallan = props.status === 'editSO' ? 'editSO' : props.edit_id_data[0]?.dc_number !== null && formValues.sale_status === 2 ? 'create' : 'edit'
         //   console.log("nfviu",selectedCustomer,formValues)
            let shippingData = {
                legal_name :  formValues.ship_legal_name,
                address :   formValues.ship_address || selectedCustomer?.shipping_address[0]?.address,
                zip :   formValues.ship_zip,
                location :  formValues.ship_location,
                stcd :   formValues.ship_stcd,
                contact_person_name :   formValues.ship_person_name || selectedCustomer.first_name ,
                phone_number : formValues.ship_phone_number || selectedCustomer.phone_number,
                gstin : formValues.ship_gstin || selectedCustomer.tax_id || selectedCustomer.Gst
            }

            let dispatchData = {
                legal_name : formValues.disp_company_name || null,
                address : formValues.disp_address|| null,
                zip : formValues.disp_zip|| null,
                location : formValues.disp_location|| null,
                stcd : formValues.disp_stcd|| null
            }

            let EwaytransData = {
                trans_name : formValues.trans_name || null,
                trans_mode : formValues.trans_mode || null,
                veh_no : formValues.veh_no || null,
                distance : formValues.distance || null,
                trans_doc_no : formValues.trans_doc_no || null,
                trans_id : formValues.trans_id|| null
            }

            const newRowData = {...formValues, tds : calculatetdsTaxAmount(), tcs_percent : calculateTcsTaxRate()}
            setRData(newRowData)

            const newform = {...formValues}

            delete newform.disp_company_name;
            delete newform.disp_address;
            delete newform.disp_zip;
            delete newform.disp_location;
            delete newform.disp_stcd;
            delete newform.ship_legal_name;
            delete newform.ship_address;
            delete newform.ship_zip;
            delete newform.ship_location;
            delete newform.ship_stcd;
            delete newform.ship_phone_number;
            delete newform.ship_gstin;
            delete newform.ship_person_name;
            delete newform.trans_name;
            delete newform.trans_mode;
            delete newform.veh_no;
            delete newform.distance;
            delete newform.trans_id;
            delete newform.trans_doc_no;
            //delete newform.tax_types;
            //delete newform.tcs_percent;
            delete newform.tds;
            //delete newform.tds_id;
            delete newform.company_name;
            delete newform.contactperson_name;
            delete newform.contactperson_num;
            delete newform.Gst;
            delete newform.city;
            delete newform.state;
            delete newform.pin_code;
            delete newform.country;
            delete newform.latitude;
            delete newform.longitude;
            delete newform.sales_man;
            delete newform.invoiceCreditDays;
            delete newform.invoiceCreditValue;

            props.handleSubmit(
                getTrimmedData({
                    ...newform,
                    shippingData,
                    dispatchData,
                    EwaytransData,
                    no_mail : true,
                    salesman_id : formValues.sales_man.id,
                    invoice_credit_days : formValues.invoiceCreditDays,
                    invoice_credit_value : formValues.invoiceCreditValue,
                    tcs : props.returnState ? calculateTcsFromPercent : formValues.tcs,
                    tcs_percent : calculateTcsTaxRate(),
                    tds : calculatetdsTaxAmount(),
                    isRoundedOffNegative : calculateRoundOff() >= 0 ? 0 : 1,
                    rounded_off : calculateRoundOff(),
                    total : getGrandTotal(),
                    received_amount : props.edit_id_data[0]?.received_amount ?? received_amount,
                    sales_items : SalesItems,
                    sales_taxes,
                    sales_payment : Tdata,
                    email : custData.email,
                    custData,
                    appConfigData : props.appConfigData,
                    full_sale_time : props.edit_id_data[0]?.full_sale_time,
                    status : dueAmountPopupOk === '' ? null : 'Waiting Approval',
                    quotoationId : props.quotoationId,
                    shipping_charges: Number(formValues.shipping_charges),
                    other_charges: Number(formValues.other_charges)
                }),
                posSeq,
                getCostPrice(),
                untaxed(null, formValues.discount_value),
                (untaxed('taxes', formValues.discount_value) / 2).toFixed(2),
                (tcsuntaxed('taxes')).toFixed(2),
                setDisable,
                dcchallan
            )
            // props.handle_newCreate()
            // props.handle_newSalesAfterCreating_Data({
            //     sale_status : formValues.sale_status,
            //     location_id : formValues.location_id,
            //     comment : formValues.comment,
            //     reference : formValues.reference
            // })
            // props.handleClose()
        }
        else {
            dispatch(OpenalertActions({ msg : requiredFieldsAlertMessage, severity : 'warning' }))
        }
    }

    async function edits() {
        setRequest(false)
        if(_.isEmpty(productByType)) {
            let productType = 'sales'
            await listProductActionByType(
                productType,
                setModalTypeHandler,
                setLoaderStatusHandler,
            )
        }

        if (_.isEmpty(cusArray)) {
            listCustomerAction(props.responseDialog)
        }

        if(!_.isEmpty(props.edit_id_data)) {
            let ID_data = [...props.edit_id_data]
          //  console.log(props.edit_id_data, 'props.edit_id_data')
            let obj = ID_data
            const { sales_items : saleItem, so_date, invoice_date_converted, trans_discount_amount, ...record } = obj?.[0]
            setCustomerSearchText(record.company_name)
            setFormValues((prev) => ({
                ...prev,
                ...record,
                discount_amount: trans_discount_amount,
                discount_type: record.discount_type
            }))
                        if(trans_discount_amount) {
                setReturnDiscount('TransactionLevel')
            }
            else if(saleItem.some((d) => d.discount_value)) {
                setReturnDiscount('ItemLevel')
            }

            if(record.shipping_charges) {
                setReturnShippingCharges(true)
            }
            if(record.other_charges) {
                setReturnOtherCharges(true)
            }
            props.getCustLedger && props.getCustLedger(record.ledger_id)
            // await setInitialState(record)

            let salesData = saleItem.filter(d => d.order_id ? !d.soldQty || (d?.soldQty ?? 0) < d.actual_quantity : d.dc_id ? ((d.invoice_quantity + d.return_quantity) < d.actual_quantity) : true).map((s, i) => {
                const product = productByType.find(d => d.item_id === s.item_id)
                const taxes = productByType.filter((f) => f.item_id === s.item_id)
                const itemQty = taxes[0]?.item_qty || []
                const soldQtyValue = Number(s.quantity ?? s.actual_quantity ?? 0)
                const returnedQtyValue = Number(s.return_quantity ?? 0)
                const available_quantity = (() => {
                const qtyObj = itemQty.find(q => q.location_id === props.edit_id_data[0].location_id)
                    return qtyObj ? qtyObj.totalQuantity : 0
                })()
                const saleTaxes = taxcategory.find(t => t.tax_category_id === s.tax_category_id)
                
                return {
                    name : s.name,
                    item_id : s.item_id,
                    description : product.description,
                    sku : s.sku,
                    quantity : !props.returnState ? s.dc_id ? (s.actual_quantity - s.return_quantity - s.invoice_quantity) : s.order_id ? s.actual_quantity : s.quantity : 0,
                    soldQuantity : soldQtyValue,
                    returnQuantity : Math.max(soldQtyValue - returnedQtyValue, 0),
                    item_unit_price : s.item_unit_price,
                    item_cost_price : s.item_cost_price,
                    return_quantity : s.return_quantity,
                    sub_total : singleTax(
                        s.item_unit_price - (s.discount ?? 0),
                        s.quantity,
                        saleTaxes?.taxes || [],
                    ).toFixed(2),
                    taxes_name : Mapping(s.item_id, 'tax'),
                    hsn_code : product.hsn_code,
                    sales_item_taxes : Sales_Item_Taxes(productByType, [s], sales_items, s.item_unit_price - (s.discount ?? 0), saleTaxes?.taxes || []),
                    taxes : saleTaxes?.taxes,
                    discount : Number(s.discount ?? 0),
                    discount_type : Number(s.discount_type ?? 0),
                    print_option : s.print_option,
                    lots : ( product.is_serialized === 0) ? LotRes({...s, NSlots: taxes[0]?.lots}, s.quantity) : [],
                    NSlots : taxes[0]?.lots || [],
                    is_serialized : product.is_serialized,
                    line : i + 1,
                    soldLots : s.soldLots || [],
                    price_list : taxes[0]?.price_list,
                    stock_type : taxes[0]?.stock_type,
                    available_quantity : s.dc_id ? s.actual_quantity : available_quantity,
                    tax_category_id: s.tax_category_id,
                    tax_category: saleTaxes?.tax_category,
                    discount_value: s.discount_value,
                }
            })
            await setSalesItems(salesData)
            return ID_data
        }
    }

    tempedits.current = edits

    useEffect(() => {
        if(productByType.length > 0 && props.creditNoteReturn !== 'creditNoteReturn') {
            tempedits.current()
        }
    }, [productByType.length > 0, props.creditNoteReturn])

    let Mapping = (id, type) => {
        let res = ''
        productByType.map((p) => {
            if (id === p.item_id && type === 'tax') {
                res = p.taxes[0]?.tax_category
            }
            if (id === p.item_id && type === 'name') {
                res = p.name;
            }
            return null
        })
        return res
    }

    const creditSequenceUpdate = () => {
        let type = 'credit'
        const { sequence_id, current_seq } = credit_debit_seq
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(creditDebitNoteSeqUpdate(type, { sequence_id, current_seq }))
        )
    }

    const returnFunc = () => {
        if (submittingRef.current) return
        const filteredSalesItems = sales_items.filter(s => s.quantity > 0).map(item => {
            if(item.is_serialized === 0) {
                return {
                    ...item,
                    lots : [],
                    NSlots : [],
                    soldLots : []
                }
            }
            return item
        })
        const droppedCount = sales_items.length - filteredSalesItems.length
        if (filteredSalesItems.length === 0) {
            dispatch(OpenalertActions({ msg: 'Please add at least one item with quantity greater than 0', severity: 'warning' }))
            return
        }
        if (droppedCount > 0) {
            dispatch(OpenalertActions({ msg: `${droppedCount} row(s) with 0 quantity were skipped`, severity: 'warning' }))
        }
        submittingRef.current = true
        setReturnSubmitting(true)

        const data = {...formValues, total : getGrandTotal(), cnInvoiceNumber : credit_debit_seq.credit_note, sales_items : filteredSalesItems, tcs : calculateTcsFromPercent(), tds : calculatetdsTaxAmount()}

        if(checkEachBarcodeWasEntered(sales_items.filter(s => s.quantity > 0)) === 'allEntered') {
            props.returnActions(
                {
                    ...data, 
                    transactionEntryData : {
                        total_cost_price : sales_items.filter(s => s.quantity > 0).reduce((acc, cur) => acc + cur.item_cost_price * cur.quantity, 0),
                        total_unit_price : untaxed(null, formValues.discount_value),
                        total_with_gst : parseFloat((untaxed(null, formValues.discount_value) + (untaxed('taxes', formValues.discount_value) / 2).toFixed(2) * 2 ) + parseFloat((tcsuntaxed('taxes')).toFixed(2))) - calculatetdsTaxAmount(),
                        gst_inter : (untaxed('taxes', formValues.discount_value) / 2).toFixed(2),
                        tcs_inter : (tcsuntaxed('taxes')).toFixed(2),
                        tds_inter : calculatetdsTaxAmount(),
                        rounded_off : calculateRoundOff()
                    }
                },
                setLoaderStatusHandler,
                commoncookie,
                headerLocationId, 
                 async(res) => {
                    submittingRef.current = false
                    setReturnSubmitting(false)
                    if(res.status === 200) {
                        //console.log('datasss',data);
                        const data = {
                            id : res.data.createreturn.insertId,
                            mn_id : res.data.manualCredit.creditNoteItemsInsert.entryId,
                            type : 'C',
                            status : 4
                        }
                        const response = await customFetch(
                            API_URLS.MANUAL_CREDIT_SALES_PURCHASE,
                            'POST',
                            { ...data }
                        );
                              const getData = response.data || [];
                              dispatch(setInvoiceTempAction(getData));
                        props.cnInvoiceFunction({
                            ...formValues,
                            total : getSafeSalesTotal().toFixed(2),
                            sales_items : sales_items.filter(s => s.quantity > 0)
                        }, customer, credit_debit_seq)
                        creditSequenceUpdate()
                        const paginationData = {
                            brand : '',
                            category : '',
                            location_id : headerLocationId,
                            max_price : '',
                            min_price : '',
                            payment_type : '',
                            from : null,
                            to : null,
                            user_id : commoncookie,
                            pageCount : 0,
                            numPerPage : 20,
                            sale_status : 'All',
                            searchString : '',
                            subcompanyId: props.subcompanyId
                        }
                        if(props.listSalesPaginateAction){
                            props.listSalesPaginateAction(
                                paginationData,
                                commoncookie,
                                headerLocationId,
                                setModalTypeHandler,
                                setLoaderStatusHandler
                            )
                        }
                    }
                }
            )
        }
        else {
            submittingRef.current = false
            setReturnSubmitting(false)
            alert('Please Enter Barcode All Items')
        }
    }

    const dcreturnFunc = async () => {
        if (submittingRef.current) return
         const filteredSalesItems = sales_items.filter(s => s.quantity > 0).map(item => {
            if(item.is_serialized === 0) {
                return {
                    ...item,
                    lots : [],
                    NSlots : [],
                    soldLots : []
                }
            }
            return item
        })
        const droppedCount = sales_items.length - filteredSalesItems.length
        if (filteredSalesItems.length === 0) {
            dispatch(OpenalertActions({ msg: 'Please add at least one item with quantity greater than 0', severity: 'warning' }))
            return
        }
        if (droppedCount > 0) {
            dispatch(OpenalertActions({ msg: `${droppedCount} row(s) with 0 quantity were skipped`, severity: 'warning' }))
        }
        submittingRef.current = true
        setReturnSubmitting(true)

        const calculatedTotal = getSafeSalesTotal()
        const data = {
            ...formValues,
            total: props.appConfigData.roundedOffEnabled === 'true'
                ? Math.round(calculatedTotal)
                : calculatedTotal.toFixed(2),
            sales_items: filteredSalesItems
        }
        
        if(checkEachBarcodeWasEntered(sales_items.filter(s => s.quantity > 0)) === 'allEntered') {
            // console.log("data",data)
            await props.dcreturnActions(
                data,
                setLoaderStatusHandler,
                commoncookie,
                headerLocationId,async(response)=>{
                    submittingRef.current = false
                    setReturnSubmitting(false)
                    //  console.log("1231313",response)
                   if(response.status === 200) {
                //    console.log("11111",response)
                        const paginationData = {
                            brand : '',
                            category : '',
                            location_id : headerLocationId,
                            max_price : '',
                            min_price : '',
                            payment_type : '',
                            from : null,
                            to : null,
                            user_id : commoncookie,
                            pageCount : 0,
                            numPerPage : 20,
                            searchString : ''
                        }
                        props.listDCPaginateAction(
                            paginationData,
                            commoncookie,
                            headerLocationId,
                            setModalTypeHandler,
                            setLoaderStatusHandler
                        )
                           props.closeDc(response.data.dc_id,response.data.return_id)
                   }
                }
            )
        }
        else {
          submittingRef.current = false
          setReturnSubmitting(false)
          alert('Please Enter Barcode All Items')
        }
    }

    // const handleHsnDescChange = async (e, rowData, hsn) => {
    //     const value = e.target.value
    //     const validPattern = /^(?!0+$)([0-9]{4}|[0-9]{6}|[0-9]{8})$/
    //     if (value && !validPattern.test(value)) {
    //         setHsnError('Enter a valid 4, 6, or 8 digit HSN Code (not all zeroes)')
    //     } 
    //     else {
    //         setHsnError('')
    //         await dispatch(changeProductHsnCodeDescriptionAction({ hsnCode : hsn, item_id: rowData.item_id }))
    //         setEditHSNDesc(null)
    //     }
    // }

    const handleHsnDescChange = async (e, rowData, hsn) => {
        const value = e.target.value;
        const validPattern = /^(?!0+$)([0-9]{4}|[0-9]{6}|[0-9]{8})$/;

        if (value && !validPattern.test(value)) {
            setHsnError('Enter a valid 4, 6, or 8 digit HSN Code (not all zeroes)');
        } else {
            setHsnError('');
            await dispatch(
                changeProductHsnCodeDescriptionAction({
                    hsnCode: hsn,
                    item_id: rowData.item_id,
                })
            );
        }
    };

    const debouncedHsnChange = useCallback((e, rowData, value) => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(() => {
            if (rowData.hsn_code !== value) {
                handleHsnDescChange(e, rowData, value);
            }
        }, 800); // â± adjust delay (ms) as needed
    }, []);

    const handleUploadOpen = (data) => {
        if(formValues.location_id === null) {
            alert("Select any location")
        }
        else {
            setFilterOpen(data)
        }
    }

    const encodeImageFileAsURL = (e) => {
        const reader = new FileReader()
        const rABS = !!reader.readAsBinaryString
        const file = e.target.files[0]

        reader.onload = async (e) => {
            setFilterOpen(false)
            const bstr = e.target.result
            const wb = read(bstr, { type : rABS ? 'binary' : 'array', bookVBA : true })
            const wsname = wb.SheetNames[0]
            const ws = wb.Sheets[wsname]
            const temp_xl_data = utils.sheet_to_json(ws)
            const temp_1_xl_data = temp_xl_data.filter(i => i.ProductName && i.Qty && i.SellingCost)
            const data = temp_1_xl_data.map((i) => (removeUnnecessaryChar(i)))

            function removeUnnecessaryChar(data) {

                const conversion = {
                    LotNumber(val) {
                        return typeof val === 'string' ? val.trim() : String(val).trim();
                    },
                    Qty(val) {
                        return parseInt(val)
                    },
                    SellingCost(val) {
                        return parseFloat(val)
                    },
                }

                let tempObj = {}

                for (let key in data) {
                    let val = data[key]
                    let modifiedVal
                    if (val !== undefined && typeof val === 'string') {
                        modifiedVal = val.replace(/(\r\n|\n|\r)/gm, "").trim()
                    }
                    if (['LotNumber', 'Qty', 'SellingCost'].includes(key)) {
                        tempObj[key] = conversion[key](modifiedVal || val)
                    } 
                    else {
                        tempObj[key] = modifiedVal || val
                    }
                }

                return tempObj
            }
            const withItemId = []
            const wOutItemId = []
            let customer_id = ''
            let flag = false

            if(formValues.sale_status === 2 && data.length) {
                if(formValues.customer_id) {
                    let lotCount = {}
                    data.forEach(item => {
                        const lot = item.LotNumber?.toString().trim()
                        if (!lot) return
                        if (!lotCount[lot]) lotCount[lot] = []
                        lotCount[lot].push(item)
                    })

                    let tempDuplicateLot = []

                    for (const [lot, items] of Object.entries(lotCount)) {
                        if (items.length > 1) {
                            items.forEach(item => {
                                tempDuplicateLot.push({
                                    name : item.ProductName,
                                    lot : lot
                                })
                            })
                        }
                    }

                    if(tempDuplicateLot.length > 0) {
                        setDuplicateLot(['Duplicate Lot Number', tempDuplicateLot])
                        flag = false
                    }
                    else {
                        flag = true
                    }

                    const uniqByName = (array, property) => {
                        return array.filter((f, i) => {
                            return (
                                array.findIndex(
                                (fi) => fi[property]?.trim().toLowerCase() === f[property]?.trim().toLowerCase()
                                ) === i
                            )
                        })
                    }

                    let MisMatchProduct = data.filter(d => !productByType.some(f => f.name === d.ProductName))
                    MisMatchProduct.forEach((misMatch, index) => {
                        wOutItemId.push(misMatch)
                    })

                    const validateLotsAndUpload = async () => {
                        let flag = true
                        let unMatchedData = []
                        const matchedLots = []
                        const matchedProducts = []

                        const processLot = async (dataItem) => {
                            const lot = dataItem.LotNumber?.toString().trim()

                            const prod = productByType.find(
                                (p) => p.name.trim().toLowerCase() === dataItem.ProductName.trim().toLowerCase()
                            )

                            if(!prod) return

                            const data = {
                                item_id : prod.item_id,
                                location_id : formValues.location_id,
                                lot_number : lot
                            }

                            const { is_serialized } = prod

                            if (is_serialized === 1) {
                                const response2 = await customFetch(
                                    API_URLS.GET_LOTS_DETAILS,
                                    'POST',
                                    data
                                );
                                const result = Array.isArray(response2.data) ? response2.data : []
                                const exists = result.some((pLot) =>
                                    parseInt(pLot.location_id) === parseInt(formValues.location_id) &&
                                    parseInt(pLot.lot_number) === parseInt(lot)
                                )

                                if (!exists) {
                                    unMatchedData.push({
                                        name : dataItem.ProductName,
                                        lot
                                    })
                                } 
                                else {
                                    const matchedLotsForThis = result
                                        .filter((pLot) => parseInt(pLot.location_id) === parseInt(formValues.location_id))
                                        .map((lotObj) => ({ ...lotObj, name : dataItem.ProductName }))

                                    matchedLots.push(...matchedLotsForThis)

                                    if (!matchedProducts.some((p) => p.item_id === prod.item_id)) {
                                        matchedProducts.push(prod)
                                    }
                                }
                            }
                            else {
                                const itemQty = prod?.item_qty || []
                                const available_quantity = (() => {
                                    const qtyObj = itemQty.find(q => q.location_id === formValues.location_id)
                                    return qtyObj ? qtyObj.totalQuantity : 0
                                })()

                                if (parseInt(dataItem.Qty) > available_quantity) {
                                    unMatchedData.push({
                                        name : dataItem.ProductName,
                                        lot : dataItem.LotNumber,
                                        uploadQty : dataItem.Qty,
                                        actualQty : available_quantity
                                    })
                                } 
                                else {
                                    if (!matchedProducts.some((p) => p.item_id === prod.item_id)) {
                                        matchedProducts.push(prod);
                                    }
                                }
                            }
                        }

                        await Promise.all(data.map(processLot))

                        if (unMatchedData.length > 0) {
                            setProductOutOfStock(['Some products Out of Stock', unMatchedData])
                            setOpenAlert(true)
                            flag = false
                            return
                        }

                        const uploadItems = matchedProducts.filter((f) => {
                            const matchedProductLots = matchedLots.filter(
                                (l) => l.name.trim().toLowerCase() === f.name.trim().toLowerCase()
                            )

                            if(f.is_serialized === 1) {
                                const getAllByName = data.filter(
                                    (x) => x.ProductName.trim().toLowerCase() === f.name.trim().toLowerCase()
                                )

                                return getAllByName.every((s) =>
                                    matchedProductLots.some(
                                        (l) =>
                                        parseInt(formValues.location_id) === parseInt(formValues.location_id) && 
                                        parseInt(l.lot_number) === parseInt(s.LotNumber)
                                    )
                                )
                            } 
                            else {
                                return data.some((s) => s.ProductName.trim().toLowerCase() === f.name.trim().toLowerCase())
                            }
                        })

                        const tempSalesItems = uploadItems.map((v, i) => {
                            let getAllItem = data.filter((f) => f.ProductName === v.name)
                            let quantity = getAllItem.reduce((count, obj) => count + +obj.Qty, 0)
                            const matchedProductLots = matchedLots.filter(
                                (l) => l.name.trim().toLowerCase() === v.name.trim().toLowerCase()
                            )
                        
                            return {
                                item_id : v.item_id,
                                name : v.name,
                                item_cost_price : v.cost_price,
                                item_unit_price : data.find((f) => f.ProductName === v.name)?.SellingCost || v.unit_price,
                                taxes_name : v.taxes
                                    .map((t) => (t.tax_group === 'IGST' ? t.tax_category : null))
                                    .filter((f) => f !== null)[0],
                                quantity,
                                line : sales_items.length + 1,
                                sub_total : singleTax(
                                    data.find((f) => f.ProductName === v.name)?.SellingCost || v.unit_price,
                                    parseInt(quantity),
                                    v.taxes
                                ).toFixed(2),
                                discount : 0,
                                discount_type : null,
                                print_option : 1,
                                sales_item_taxes : Sales_Item_Taxes(productByType, [v], sales_items, v.item_unit_price, v.taxes),
                                hsn_code : v.hsn_code,
                                taxes : v.taxes,
                                is_serialized : v.is_serialized,
                                qty_per_pack : v.qty_per_pack,
                                NSlots : [],
                                lots :  v.is_serialized === 1
                                    ? matchedProductLots.filter(l =>
                                        getAllItem.some(s => parseInt(s.LotNumber) === parseInt(l.lot_number))
                                    )
                                    : [],
                                description : v.description,
                                stock_type : v.stock_type
                            }
                        })
                        withItemId.push(...tempSalesItems)
                    }

                    await validateLotsAndUpload()

                    if (wOutItemId.length) {
                        const dataApi = wOutItemId.map((d) => {
                            const lotArray = d.LotNumber ? d.LotNumber.split(',').map((num) => ({ lot_number: num.trim() })) : []
                            const newD = {
                                name : d.ProductName,
                                unit_price : d.SellingCost || 0,
                                receiving_quantity : 0,
                                qty_per_pack : 1,
                                is_serialized : typeof d.LotNumber !== 'undefined' && d.LotNumber !== '' && d.LotNumber !== null ? 1 : 0,
                                hsn_code : null,
                                brand : null,
                                category : null,
                                model : null,
                                cost_price : 0,
                                sku : null,
                                tax_category_id : null,
                                max_price : 0
                            }
                        
                            return {
                                ...newD,
                                stock_type : 1
                            }
                        })
          
                        if (flag) {
                            setmOpen(true)
                            setWithItemId(withItemId)
                            setDataApi(dataApi)
                            setXlData(data)
                        } 
                        else {
                            setOpenAlert(true)
                        }
                    }
                    else {
                        let RowData = withItemId.map((row, i) => {
                            let check = sales_items.filter(item => item.item_id === row.item_id)
                            if (check.length) {
                                return { ...row, line: i + 1 }
                            } 
                            else {
                                return row
                            }

                        })
                        if(flag) {
                            setSalesItems(props.status !== 'edit' ? withItemId : RowData)
                        }
                        else {
                            setOpenAlert(true)
                        }
                    }
                }
                else {
                    alert('Select Customer')
                    return
                }
            }
        }
        if(rABS) {
            reader.readAsBinaryString(file)
        }
        else {
            reader.readAsArrayBuffer(file)
        }
        setFilterOpen(false)
    }

    const productClose = () => {
        setmOpen(false)
    }

    const setDataApiFromMissingProduct = (data) => {
        setDataApi(data)
    }

    const bulkApiCreate = (productData) => {
        const dataApi = productData.map(({ tableData, tax_percentage, lotNumber, ...record }) => record)
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(
                bulkProductAction(
                    dataApi,
                    setLoaderStatusHandler,
                    (isRes, data) => {
                        if (isRes) {
                            productCreateSalesAlert(dispatch)
                            setSalesItems(withItemId);
                            setmOpen(false)
                            setDataApi([])
                            setWithItemId([])
                        }
                    }
                )
            ) 
        )
    }

    const handleDeleteDialogOpen = (index) => {
        setDeleteDialog(true)
        setDeleteIndex(index)
    }

    const handleDeleteDialogClose = () => {
        setDeleteDialog(false)
    }

    const handleLotNumberSearch = (value, addNewLine, index) => {
        if (value !== '') {
            if(formValues.location_id !== null) {
                if (!sales_items.some(item => item.lots && item.lots.some(lot => lot.lot_number === value))) {
                    debouncedGetLotDetails(value, formValues.location_id, (response) => {
                        const lotDetails = Array.isArray(response) ? response : []
                        const lotData = lotDetails?.[0]
                        //console.log('lotDataaaaaaaaaaaaaa', lotData)
                        if (lotData?.item_id) {
                            if (sales_items.some(item => item.item_id === lotData.item_id)) {
                                const product = sales_items.find(item => item.item_id === lotData.item_id)
                                const newQuantity = product.quantity + 1;
                                const updatedProduct = {
                                    ...product,
                                    quantity: newQuantity,
                                    lots: [...product.lots, {
                                        lot_number: value,
                                        lot_id: lotData.lot_id,
                                        trans_items_cost_price: lotData.trans_items_cost_price
                                    }],
                                    sub_total: singleTax(
                                        product.item_unit_price,
                                        newQuantity,
                                        product.taxes
                                    ).toFixed(2),
                                }
                                const updatedSalesItems = sales_items.map((item) => {
                                    if (item.item_id === lotData.item_id) {
                                        return updatedProduct
                                    }
                                    else {
                                        return item
                                    }
                                })
                                setSalesItems(updatedSalesItems)
                            }
                            else {
                                const product = productByType.find(product => product.item_id === lotData.item_id)
                                if (!product) {
                                    setLotNumberMessage({ success: false, error: true, message: 'Product not found for this lot number' })
                                    return
                                }
                                let discount_price
                                if (props?.price_list?.length > 0) {
                                    const aa = props.price_list.find((e) => e.id === formValues.price_list)
                                    discount_price = aa
                                }
    
                                let discount_added
                                if (discount_price?.productData.length > 0) {
                                    const dd = discount_price.productData.find((e) => e.product_id == product.item_id)
                                    discount_added = dd
                                }
                                const itemQty = product?.item_qty || []
                                const available_quantity = (() => {
                                    const qtyObj = itemQty.find(q => q.location_id === formValues.location_id)
                                    return qtyObj ? qtyObj.totalQuantity : 0
                                })()
                                const newSaleItem = {
                                    item_id: product.item_id,
                                    name: product.name,
                                    item_cost_price: product.cost_price,
                                    item_unit_price: parseFloat(discount_added?.discount_price !== undefined
                                        ? discount_added.discount_price
                                        : product
                                            ? product.unit_price
                                            : 0).toFixed(2),
                                    taxes_name: product.taxes
                                        .map((t) => {
                                            return t.tax_group === 'IGST' ? t.tax_category : null;
                                        })
                                        .filter((f) => f !== null)[0],
                                    quantity: 1,
                                    line: sales_items.length + 1,
                                    sub_total: singleTax(
                                        discount_added?.discount_price !== undefined
                                            ? discount_added.discount_price
                                            : product ? product.unit_price : 0,
                                        parseInt(1),
                                        product.taxes,
                                    ).toFixed(2),
                                    discount: 0,
                                    discount_type: null,
                                    print_option: 1,
                                    available_quantity: available_quantity,
                                    sales_item_taxes: Sales_Item_Taxes(productByType, [product], sales_items, product.unit_price, product.taxes),
                                    tax_category_id: product.tax_category_id,
                                    tax_category: product.tax_category,
                                    hsn_code: product.hsn_code,
                                    taxes: product.taxes,
                                    is_serialized: product.is_serialized,
                                    qty_per_pack: product.qty_per_pack,
                                    lots: [{
                                        lot_number: value,
                                        lot_id: lotData.lot_id,
                                        trans_items_cost_price: lotData.trans_items_cost_price
                                    }],
                                    description: product.description,
                                    stock_type: product.stock_type,
                                }
    
                                const nameEmptyIndex = sales_items.findIndex(s => s.name === '')
                                if (nameEmptyIndex !== -1) {
                                    const updatedSalesItems = sales_items.map((s, i) => {
                                        if (i === nameEmptyIndex) {
                                            return newSaleItem
                                        }
                                        else {
                                            return s
                                        }
                                    });
                                    if(addNewLine){
                                        setSalesItems([...updatedSalesItems, tempInsert])
                                        setTimeout(() => {
                                            document.querySelector(`[name="quantity${index}"]`)?.focus()
                                        }, 100)
                                    }
                                    else{
                                        setSalesItems(updatedSalesItems)
                                    }
                                }
                                else {
                                    setSalesItems((prev) => ([...prev, newSaleItem]))
                                }
                                setHsnDesc({
                                    hsnCode: product.hsn_code,
                                    description: product.description,
                                    item_id: product.item_id
                                })
                            }
                            setLotNumberMessage({ success: true, error: false, message: 'Added Successfully!' })
                            setTimeout(() => {
                                setLotNumberSearch(null)
                                setLotNumberMessage({ success: false, error: false, message: '' })
                            }, 500)
                        }
                        else {
                            setLotNumberMessage({ success: false, error: true, message: !sales_items.some(item => item.lots.some(lot => lot.lot_number === value)) ? 'Invalid Lot Number!' : 'Lot Number Already Entered' })
                        }
                    })
                }
                else {
                    setLotNumberMessage({ success: false, error: true, message: 'Lot Number Already Entered' })
                }
            }
            else {
                setLotNumberMessage({ success: false, error: true, message: 'Select any Location!' })
            }
        }
    }

  
    useEffect(() => {
        if(!props.modalStatus && customerEdit && props.setModalStatusHandler === false ) {
            dispatch(listCustomerAction())
        }
    }, [props.modalStatus])

    useEffect (() => {
         if (props.selectData.NewCustomer === true) {
            const filter = [...cusArray]
            const popc = filter[0]?.customer_id
            setStateHandler('customer_id',  popc)
            setCustomerSearchText(filter[0]?.company_name || '')
            props.setModalStatusHandler(false)
            props.setselectData('NewCustomer', false)
        }
    },[props.selectData.NewCustomer])

    const subtotal = (untaxed(null, formValues.discount_value) + untaxed('taxes', formValues.discount_value) + tcsuntaxed('taxes') ) - calculatetdsTaxAmount()

    useEffect(() => { (async () => {
        if(subtotal > 0 && formValues.customer_id !== null) {
            if((props.appConfigData.eInvoice === '1' || props.appConfigData.ewayBill === '1') && getSubtotalForThreshold() >= 50000 ) {
                dispatch(getLatestTransporterDetailsAction(formValues.customer_id, async(response) => {
                    const res = await response
                    setFormValues((prev) => ({ 
                        ...prev, 
                        trans_doc_no : formValues.invoice_number, 
                        trans_id : props.appConfigData.gstin ? props.appConfigData.gstin : res[0]?.trans_id || 1, 
                        trans_name : props.appConfigData.companyName,
                        veh_no : formValues.veh_no || res[0]?.veh_no || '',
                        distance : formValues.distance || res[0]?.distance || '',
                        trans_mode : formValues.trans_mode || res[0]?.trans_mode || ''
                    }))
                }))
            }
            else{
                setFormValues((prev) => ({ ...prev, trans_doc_no: null, trans_id: null, trans_name: null }))
            }
        }
    })();
}, [subtotal, formValues.invoice_number, formValues.customer_id])

    useEffect(() => {
        setUpdatedTotalCust(cusArray.length)
    }, [cusArray])

    const dublicateItemPopup = (data, key) => {
        setSalesItems([
            ...sales_items,
            {
                name : data.name,
                sku : key.toUpperCase(),
                discount : 0,
                discount_type : null,
                print_option : 1,
                item_unit_price : data.unit_price,
                sub_total : floatnum(1 * parseInt(data.unit_price)),
                item_id : data.item_id,
                line : sales_items.length + 1,
                taxes_name: data.taxes
                    .map((t) => {return t.tax_group === 'IGST' ? t.tax_category : null})
                    .filter((f) => f !== null)[0],
                quantity : parseFloat('1.000'),
                hsn_code : data.hsn_code,
                taxes : data.taxes
            }
        ])
        setDublicateLot([])
    }

    const displayDate = formValues.sale_time ? moment(formValues.sale_time, "YYYY-MM-DD HH:mm:ss").format("DD/MM/YYYY") : moment().format("DD/MM/YYYY")

    const hsnValidPattern = /^(?!0+$)([0-9]{4}|[0-9]{6}|[0-9]{8})$/

    const taxRateOptions = [
       
        {
            label: 'TDS',
            value: '1'
        },
        {
            label: 'TCS',
            value: '0'
        },
    ]

    let productLotNumberSearch = ''

    //console.log(props.appConfigData.eInvoice,'1d',props.appConfigData.ewayBill,'1f',selectedCustomer?.gst_type,'1h',formValues.sale_status,'formValuestghaoossss')

   //console.log(sales_items,'sales_items')

    const calculateRoundOff = () => {

        if(props.appConfigData.roundedOffEnabled === 'false'){
            return 0
        }
        else{
            const taxAmount = taxVisible ? Number((untaxed('taxes', (formValues?.discount_value ?? 0)) / 2).toFixed(2)) + Number((untaxed('taxes', (formValues?.discount_value ?? 0)) / 2).toFixed(2)) : Number((untaxed('taxes', (formValues?.discount_value ?? 0))).toFixed(2))
            const subTotal = untaxed(null, (formValues?.discount_value ?? 0))
            const tcs = tcsuntaxed()
            const tds = calculatetdsTaxAmount()
    
            const taxAmount2 = round2(taxAmount)
            const subTotal2 = round2(subTotal)
            const tcs2 = round2(tcs)
    
            const total = round2(subTotal2 + taxAmount2 + tcs2 - tds + Number(formValues?.shipping_charges ?? 0) + Number(formValues?.other_charges ?? 0))
    
            const nearest = Math.round(total)
    
            const roundOff = round2(nearest - total)
    
            return roundOff
        }

    }
// console.log(props.edit_id_data,sales_items,'props.edit_id_data');

const handleInvoiceSelect = async (sale_id) => {
  try {

    const response = await customFetch(
      API_URLS.GET_SALES_CHILD_PAGE_DETAILS(sale_id, 'sales'),
      'POST',
      {}
    );

    // console.log('Child API RAW response:', response);

    const saleObj = Array.isArray(response?.data)
      ? response.data[0]
      : response?.data;

    setFormValues(prev => ({
        ...prev,
        //   dc_number: saleObj?.dc_number || '',
        //   so_number: saleObj?.so_number || '',
        sale_time: saleObj?.sale_time || '',
        invoice_number: saleObj?.invoice_number || '',
        location_id: saleObj?.location_id || null,
        sale_id: saleObj.sale_id,
        discount_amount: saleObj.trans_discount_amount,
        discount_type: saleObj.discount_type,
        discount_value: saleObj.discount_value,
        shipping_charges: saleObj.shipping_charges,
        other_charges: saleObj.other_charges
    }));
    
    
    const apiItems = saleObj?.sales_items || [];
    
    if(saleObj.trans_discount_amount) {
        setReturnDiscount('TransactionLevel')
    }
    else if(apiItems.some((d) => d.discount_value)) {
        setReturnDiscount('ItemLevel')
    }

    if(saleObj.shipping_charges) {
        setReturnShippingCharges(true)
    }
    if(saleObj.other_charges) {
        setReturnOtherCharges(true)
    }

    if (!apiItems.length) {
      setSalesItems([]);
      return;
    }

    let mappedItems = apiItems.map(item => {
        const saleTaxes = taxcategory.find(t => t.tax_category_id === item.tax_category_id)
        const product = productByType.find(d => d.item_id === item.item_id)
        const taxes = productByType.filter((f) => f.item_id === item.item_id)
        const itemQty = taxes[0]?.item_qty || []
        const available_quantity = (() => {
            const qtyObj = itemQty.find(q => q.location_id === saleObj.location_id)
            return qtyObj ? qtyObj.totalQuantity : 0
        })()
        return {
          ...item,
          description : product.description,
          sku : item.sku,
          lots : [],
          item_id: item.item_id,
          soldQuantity: item.quantity || item.actual_quantity || 0,
          quantity : '',
          name: item.name,
          discount : Number(item.discount ?? 0),
          discount_type : Number(item.discount_type ?? 0),
          discount_value: item.discount_value,
          return_quantity : item.return_quantity,
          taxes_name : Mapping(item.item_id, 'tax'),
          hsn_code : product.hsn_code,
          taxes : saleTaxes?.taxes,
          sales_item_taxes: Sales_Item_Taxes(productByType, [item], apiItems, item.item_unit_price - (item.discount ?? 0), saleTaxes?.taxes || []),
          item_unit_price: Number(item.item_unit_price),
          sub_total : singleTax(
                item.item_unit_price - (item.discount ?? 0),
                item.quantity,
                saleTaxes?.taxes || [],
            ).toFixed(2),
          print_option : item.print_option,
          NSlots : taxes[0]?.lots || [],
          soldLots : item.soldLots || [],
          is_serialized : product.is_serialized,
          price_list : taxes[0]?.price_list,
          stock_type : taxes[0]?.stock_type,
          available_quantity : item.dc_id ? item.actual_quantity : available_quantity,
          tax_category_id: item.tax_category_id,
          tax_category: saleTaxes?.tax_category,
        }
    });

    if (
      props.price_list?.length &&
      formValues.price_list &&
      formValues.customer_id
    ) {
      const selectedPriceList = props.price_list.find((pl) => {
        const isMatchingId = pl.id === formValues.price_list;

        const isCustomerAllowed =
          !pl.customerMappedIds?.length ||
          pl.customerMappedIds?.some(
            (c) => c.customer_id === formValues.customer_id
          );

        return isMatchingId && isCustomerAllowed;
      });

      const productData = selectedPriceList?.productData || [];

      mappedItems = mappedItems.map((item) => {
        const matched = productData.find(
          (prod) => prod.product_id === item.item_id
        );

        if (!matched?.discount_price) return item;

        const new_unit_price = parseFloat(matched.discount_price);

        return {
          ...item,
          item_unit_price: new_unit_price.toFixed(2),
          sub_total: singleTax(
            new_unit_price,
            parseFloat(item.quantity),
            item.taxes
          ).toFixed(2),
        };
      });
    }
    await setSalesItems(mappedItems);
  } catch (err) {
    setSalesItems([]);
  }
};
    const handleCustomerSearchAPICall = (searchText) => {
        if(searchText.length >= 3) {
            if(storage?.role_name === 'Salesman') {
                const payload = {
                    "employee": storage?.employee_id,
                    "customer": "null",
                    searchString: searchText
                }
                apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    dispatch(getSearchBySalesmanCustomersAction(payload))
                )
            }
            else {
                const payload = {
                    searchString: searchText
                }
                apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    dispatch(getSearchByCustomersDataAction(payload))
                )
            }
            setCustomerSearchText('')
        }
        else {
            dispatch(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
        }
    }

    const handleCloseCustomerDetails = () => {
        setFormValues((prev) => ({
            ...prev,
            customer_id: null
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
        if(storage?.role_name === 'Salesman') {
            const payload = {
                "employee": storage?.employee_id,
                "customer": "null",
                searchString: searchText
            }
            dispatch(getSearchByCustomerSalesManAction(
                payload,
                setModalTypeHandler,
                setLoaderStatusHandler
            ))
        }
        else {
            const payload = {
                searchString: searchText
            }
            dispatch(getSearchByCustomerAction(
                payload,
                setModalTypeHandler,
                setLoaderStatusHandler
            ))
        }
    }

    const selectedRole = storage.role_name
    const customerCreateBtn = UserRightsAuthorization(menuAccess[selectedRole], 'contact__customer', 'can_create')
    const customerEditBtn = UserRightsAuthorization(menuAccess[selectedRole], 'contact__customer', 'can_edit')
    const productCreateBtn = UserRightsAuthorization(menuAccess[selectedRole], 'inventory__product_master', 'can_create')
    const productEditBtn = UserRightsAuthorization(menuAccess[selectedRole], 'inventory__product_master', 'can_edit')
    const hasShipping = selectedAddress?.shipping_id || formValues.ship_address || formValues.ship_location;

  return (
      <>
          {Prompt}
          <Card
              sx={{
                  p : 5,
                 height: '90vh',
                overflowY: 'auto',
                '&::-webkit-scrollbar': {display: 'none',},
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none',
              }}
          >
              <Grid container spacing={3}>
                  <Grid
                      size={{
                          lg: 12,
                          md: 12,
                          sm: 12,
                          xs: 12
                      }}>
                      <Grid container spacing={3}>
                          <Grid
                              size={{
                                  lg: 9,
                                  md: 9,
                                  sm: 6,
                                  xs: 6
                              }}>
                              {
                                  ((formValues.sale_status === 1 || formValues.sale_status === 8 || props.status === 'edit' || props.status === 'convertSo' || props.status === 'editSO') &&  formValues.sale_status !== 6 ) &&
                                  <Typography variant='h6' align='left' style={{ paddingBottom : props.status === 'edit' ? '20px' : '0px', margin : props.status === 'edit' ? '0px' : '0 0 5px 0' }}>
                                      {
                                          props.returnState && props.edit_id_data[0]?.sale_status !== 8
                                          ? 'Sales Return' :
                                           props.returnState && formValues.dc_id ? 'DC Return'
                                          : props.status === 'edit' && props.edit_id_data[0]?.dc_number &&  !props.returnState
                                          ? 'Edit Delivery Challan'
                                          : (props.status === 'editSO') && props.edit_id_data[0]?.sale_status !== 8
                                          ? 'Edit Sales Order'
                                          : props.returnState && props.edit_id_data[0]?.sale_status === 8
                                          ? 'DC Return'
                                          : formValues.sale_status === 8
                                          ? 'New Dc Order'
                                          : 'Sales Order'
                                      }{' '}
                                      -{' '}

                                      <span style={{ variant : 'h6' }}>
                                          {formValues.so_number !== null ? formValues.so_number : formValues.dc_number}
                                      </span>
                                  </Typography>
                              }

                              {
                                  formValues.sale_status !== 1 && formValues.sale_status !== 3 && formValues.sale_status !== 8 && !props.edit_id_data[0]?.dc_number && (
                                      <Typography variant='h6' style={{ margin : '0 0 5px 0' }}>
                                          Invoice No. -{' '}
                                          <span style={{ fontSize : headerStyle.fontSize }}>
                                              {formValues.invoice_number}
                                          </span>
                                      </Typography>
                                  )
                              }
                              {
                                  formValues.dc_id && formValues.sale_status === 2 && !props.returnState && (
                                      <Typography variant='h6' style={{ margin : '0 0 5px 0' }}>
                                          Invoice No. -{' '}
                                          <span style={{ fontSize : headerStyle.fontSize }}>
                                              {formValues.invoice_number}
                                          </span>
                                      </Typography>
                                  )
                              }
                          </Grid>

                          <Grid
                              sx={{ display: 'flex', justifyContent: 'flex-end'}}
                              size={{
                                  lg: 3,
                                  md: 3,
                                  sm: 6,
                                  xs: 6
                              }}>
                                  {
                                      editDate && props.status !== 'edit' ? (
                                          <ClickAwayListener onClickAway={() => {setEditDate(false); setHoverDate(false)}}>
                                              <Box>
                                                  <LocalizationProvider dateAdapter={DataAdapter}>
                                                      <DateTimePicker
                                                          disableFuture
                                                          format="DD-MM-YYYY hh:mm A"
                                                          disabled={props.status === 'edit' || props.status === 'editSO'}
                                                          slotProps={{ textField: { fullWidth: true, variant: "filled", onBlur: () => setEditDate(false), inputProps: {
                                                                  ...props.inputProps,
                                                                  readOnly: true,
                                                                  } } }}
                                                          value={formValues.sale_time ? moment(formValues.sale_time, "YYYY-MM-DD HH:mm:ss") : moment()}
                                                          onChange={(newValue) => {
                                                              if (newValue) {
                                                                  setStateHandler('sale_time', moment(newValue).format("YYYY-MM-DD HH:mm:ss"))
                                                                  setEditDate(false)
                                                                  setHoverDate(false)
                                                              }
                                                          }}
                                                          label={((formValues.sale_status == '2') || (props.returnState && props.edit_id_data[0]?.sale_status !== 8)) ? "Invoice Date" : formValues.sale_status === 8 ? 'DC Date' : "SO Date"}
                                                          maxDate={formValues.sale_status === 2 ? moment() : undefined}
                                                          minDate={formValues.sale_status === 2 ? moment().subtract(30, 'days') : undefined}
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
                                                  borderRadius : hoverDate && !props.returnState && props.status !== 'edit' ? '6px' : '0px',
                                                  border : hoverDate && !props.returnState && props.status !== 'edit' ? '1px solid #ccc' : 'none',
                                                  backgroundColor : hoverDate && !props.returnState && props.status !== 'edit' ? '#fff' : 'transparent',
                                                  transition : 'all 0.2s ease-in-out',
                                              }}
                                          >
                                              <Typography
                                                  variant='h6'
                                                  onClick={() => setEditDate(true)}
                                              >
                                                  {formValues.sale_status == '2' || formValues.sale_status == '6' || (props.returnState && formValues.sale_id) ? 'Invoice Date' : formValues.sale_status === 8 ? 'DC Date' : 'SO Date'} : {displayDate}
                                              </Typography>
                                          </Box>
                                      )
                                  }
                          </Grid>
                      </Grid>
                  </Grid>
                  
                  {
                      formValues.customer_id && getCustomerOutstanding.length > 0 && !props.returnState &&
                      <>
                          <Grid
                              size={{
                                  lg: 10,
                                  md: 10,
                                  sm: 10,
                                  xs: 10
                              }}>
                              <Box
                                  display="flex"
                                  flexDirection="row"
                                  alignItems="flex-start"
                                  p={2}
                                  mt={2}
                                  border="1px solid #ccc"
                                  borderRadius={2}
                                  bgcolor="#f9f9f9"
                              >
                                  {/* <Typography variant="h6" sx={{ mb: '2px' }} gutterBottom>
                                      <strong>Customer Outstandings : </strong>
                                  </Typography> */}
                              
                                  {
                                      getCustomerOutstanding.map((item, index) => (
                                          <Box key={index} display="flex" flexDirection="row" gap={4} ml={2}>
                                              {/* <Typography variant="body2">
                                                  <strong>Invoice Count : </strong> {item.invoice_count}
                                              </Typography> */}
                                              
                                              <Typography variant="body2">
                                                  <strong>Total Due Amount : </strong> ₹{item.total_amount}
                                              </Typography>

                                              <Typography variant="body2">
                                                  <strong>Due Date Exceeded : </strong> ₹{item.due_date_exceeds}
                                              </Typography>
                                          </Box>
                                      ))
                                  }
                              </Box>
                          </Grid>
                      </>
                  }

                  <Grid
                      size={{
                          lg: 10,
                          md: 10,
                          sm: 10,
                          xs: 10
                      }}>
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
                                freeSolo={customerSearchText.length <= 3}
                                disableClearable
                                id='multiple-limit-tags'
                                disabled={(props.status === 'edit' || props.status === 'editSO' || props.status === 'convertSO') && props.creditNoteReturn !== 'creditNoteReturn'}
                                inputValue={customerSearchText}
                                onInputChange={(event, newInputValue, reason) => {
                                    if(reason === 'input') {
                                        setCustomerSearchText(newInputValue)
                                        if(newInputValue !== '') {
                                            handleAutoSearchApicall(newInputValue)
                                        }
                                        if(newInputValue === '' && !props.edit_id_data.length) {
                                            setFormValues((prev) => ({...prev, customer_id: null}))
                                            apiCalls(
                                                setModalTypeHandler,
                                                setLoaderStatusHandler,
                                                dispatch(setSearchByCustomersDataAction([]))
                                            )
                                        }
                                    }
                                }}
                                  value={
                                    updatedTotalCust > initialTotalCust ? 
                                        cusArray?.find(
                                            (d) => d.customer_id === formValues.customer_id
                                        ) || {company_name : ''}
                                    : !_.isEmpty(props.edit_id_data) ? 
                                        cusArray?.find(
                                            (d) => d.customer_id === props.edit_id_data[0]?.customer_id
                                        ) || {company_name : ''}
                                    // : customerSearchText ?
                                    //     { company_name: customerSearchText } 
                                    : cusArray?.find(
                                            (d) => d.customer_id === formValues.customer_id
                                        ) || {company_name : ''}
                                  }
                                  options={cusArray?.filter(
                                      (c) => c.company_name !== null && c.company_name !== '' && c.customer_id && c.customer_type === '1'
                                  )}
                                  getOptionLabel={(option) => option?.company_name || ''}
                                  onChange={(e, c) => {
                                    setStateHandler('customer_id', c !== null ? c.customer_id : '')
                                    setCustomerSearchText(c?.company_name || '') 
                                    setStateHandler('invoiceCreditDays', null)
                                    setStateHandler('invoiceCreditValue', null)
                                    setSalesMan({ id : null, value : null })
                                    setAddressManuallySelected(false)
                                    setDueDaysValueInput(c?.credit_value)
                                    setDueDaysInput(c?.credit_days)
                                    if (c?.customer_id) {
                                        dispatch(getSalesCustomersByIdAction(c.customer_id, async (response) => {
                                            const res = await response
                                            if (res?.length > 0) {
                                                setSelectedCustomer(res[0])
                                            }
                                        }))
                                    } else {
                                        setSelectedCustomer(null)
                                    }
                                    if(props.creditNoteReturn === 'creditNoteReturn') {
                                        const paginationData = {
                                            brand : '',
                                            category : '',
                                            location_id : headerLocationId,
                                            max_price : '',
                                            min_price : '',
                                            payment_type : '',
                                            from : null,
                                            to : null,
                                            user_id : commoncookie,
                                            pageCount : 0,
                                            numPerPage : 20,
                                            sale_status : 'All',
                                            searchString : '',
                                            subcompanyId: props.subcompanyId,
                                            customer_id: c.customer_id || ''
                                        }
                                            dispatch(listSalesPaginateAction(
                                                paginationData,
                                                commoncookie,
                                                headerLocationId,
                                                setModalTypeHandler,
                                                setLoaderStatusHandler
                                                ))
                                        }}
                                    }
                                  renderOption={(props, option) => {
                                      return (
                                          <li {...props} key={option?.customer_id}>
                                              {option?.company_name}
                                          </li>
                                      )
                                  }}
                                  renderInput={(params) => {
                                      const get = {...params}
                                      let startAdornment = null
                                      if(!props.returnState && props.status !== 'edit') {
                                        startAdornment = !customerEdit ? (
                                                  customerCreateBtn && <Tooltip title='Create New'>
                                                      <IconButton 
                                                          size='small'
                                                          onClick={() => {
                                                              props.setModalStatusHandler(true)
                                                              props.setModalTypeHandler('NewCustomer')
                                                          }}
                                                      >
                                                          <AddIcon />
                                                      </IconButton>
                                                  </Tooltip>
                                              ) : (
                                                  customerEditBtn && <Tooltip title='Edit Customer'>
                                                      <IconButton
                                                          size='small'
                                                          onClick={() => {
                                                              props.setModalStatusHandler(true)
                                                              props.setModalTypeHandler('EditCustomer')
                                                              props.setEditCustomerHandler(selectedCustomer)
                                                          }}
                                                      >
                                                          <EditIcon />
                                                      </IconButton>
                                                  </Tooltip>
                                              )
                                        get.InputProps = {
                                            ...params.InputProps,
                                            startAdornment : startAdornment
                                        }
                                      }
                                      else {
                                          get.InputProps = {
                                              ...params.InputProps
                                          }
                                      }
                                      return <TextField
                                              {...get}
                                              fullWidth
                                              required
                                              variant='filled'
                                              label='Select Customer'
                                              inputRef={receivingTimeRef}
                                              error={formErrors.customer_id === null ? false : true}
                                              helperText={formErrors.customer_id === null ? '' : 'Customer is Required!'}
                                              slotProps={{
                                                input: ((props.creditNoteReturn === 'creditNoteReturn') || (props.status !== 'edit' && props.status !== 'editSO' && props.status !== 'convertSO')) && {
                                                    ...get.InputProps,
                                                    startAdornment: startAdornment,
                                                    endAdornment: (
                                                        <>
                                                            {
                                                                formValues.customer_id === null ?
                                                                // <IconButton
                                                                //     size="small"
                                                                //     onClick={() => {
                                                                //         handleCustomerSearchAPICall(customerSearchText)
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
                                                    ),
                                                }
                                              }}
                                          />
                                  }}
                              />
                          </Grid>
                           {props.returnState && props.pageType !== '/sales/invoices' && props.pageType !== '/sales/deliveryChallan' && <Grid
                               size={{
                                   lg: 3,
                                   md: 4,
                                   sm: 6,
                                   xs: 12
                               }}>
                          <Autocomplete
                           fullWidth
                options={
                  salesByPagination?.filter((p) => p.invoice_number) || []
                }
                getOptionLabel={(option) => option.invoice_number || ''}
                isOptionEqualToValue={(option, value) =>
                  option.invoice_number === value.invoice_number
                }
                value={
                  salesByPagination?.find(
                    (p) => p.invoice_number === invoicenumber,
                  ) || null
                }
                onChange={(event, newValue) => {
              const selectedInvoiceNumber = newValue?.invoice_number || null;
              setInvoicenumber(selectedInvoiceNumber);

              setFormValues((prev) => ({ ...prev, invoice_number: selectedInvoiceNumber }))

              if (newValue?.sale_id) {
              handleInvoiceSelect(newValue.sale_id);
              } else {
                 setSalesItems([]);   
                 setReturnDiscount('No Discount')
                 setReturnShippingCharges(false)
                 setReturnOtherCharges(false)
               }
              }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Select Invoice Number'
                    variant='filled'
                  />
                           )}
                         />
                       </Grid>}
                          {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}> */}
                              {/* <FormControl
                                  required
                                  fullWidth
                                  variant='filled'
                                  component='fieldset'
                                  error={formErrors.sale_status === null ? false : true}
                                  disabled ={(props.returnState || (props.status === 'edit' && [3, 4, 5, 6, 7].includes(formValues.sale_status))) ? true : false}
                              > */}
                                  {/* <InputLabel>Sale Status</InputLabel> */}
                                  {/* <Select
                                      style={{ marginBottom : '-4px' }}
                                      name='sale_status'
                                      label='Sale Status'
                                      onChange={handleChange}
                                      value={formValues.sale_status === null ? '' : formValues.sale_status}
                                      disabled={true}
                                  > */}
                                      {/* {
                                          [
                                              {name : 'Send SO', value : 1},
                                              {name : 'Delivery Challan', value : 8},
                                              {name : 'Create Invoice', value : 2}
                                          ].map(
                                              (d) => 
                                                  <MenuItem value={d.value} key={d.value}>
                                                      {d.name}
                                                  </MenuItem>
                                          )
                                      } */}
                                      {/* {
                                          (props.status === 'edit' && [3, 5, 6, 7].includes(formValues.sale_status)) && 
                                          <MenuItem
                                              disabled={
                                              props.status === 'edit'
                                                  ? props.edit_id_data[0].sale_status === 1 ||
                                                  props.edit_id_data[0].sale_status === 3
                                                  ? false
                                                  : props.edit_id_data[0].sale_status > 4
                                                  ? true
                                                  : false
                                                  : props.status !== 'edit'
                                                  ? false
                                                  : true
                                              }
                                              value={3}
                                          >
                                              On Hold
                                          </MenuItem>
                                      } */}
                                      {/* {
                                          (props.status === 'edit' && [3, 5, 6, 7].includes(formValues.sale_status)) && 
                                          <MenuItem
                                              disabled={
                                              props.status !== 'edit'
                                                  ? true
                                                  : props.edit_id_data[0].sale_status <= 4
                                                  ? false 
                                                  : true
                                              }
                                              value={4}
                                          >
                                              Ready To Ship
                                          </MenuItem>
                                      } */}
                                      {/* {
                                          (props.status === 'edit' && [3, 5, 6, 7].includes(formValues.sale_status)) && 
                                          <MenuItem
                                              disabled={
                                              props.status !== 'edit'
                                                  ? true
                                                  : props.edit_id_data[0].sale_status <= 5
                                                  ? false : true
                                              }
                                              value={5}
                                          >
                                              In Transit
                                          </MenuItem>
                                      } */}
                                      {/* {
                                          (props.status === 'edit' && [3, 5, 6, 7].includes(formValues.sale_status)) && 
                                          <MenuItem
                                              disabled={
                                              props.status !== 'edit'
                                                  ? true
                                                  : props.edit_id_data[0].sale_status <= 6 
                                                  ? false : props.edit_id_data[0].dc_number === null
                                                  ? true : false
                                              }
                                              value={6}
                                          >
                                              Delivered
                                          </MenuItem>
                                      } */}
                                      {/* {
                                          (props.status === 'edit' && [3, 5, 6, 7].includes(formValues.sale_status)) && 
                                          <MenuItem
                                              disabled={
                                              props.status === 'edit'
                                                  ? props.edit_id_data[0].sale_status === 1 ||
                                                  props.edit_id_data[0].sale_status === 3
                                                  ? false
                                                  : props.edit_id_data[0].sale_status > 4 && props.edit_id_data[0].sale_status < 8
                                                  ? props.edit_id_data[0].sale_status === 6 ? false : true
                                                  : false
                                                  : true
                                              }
                                              value={7}
                                          >
                                              Cancel
                                          </MenuItem>
                                      } */}
                                  {/* </Select> */}
                                  {/* <FormHelperText>{formErrors.sale_status}</FormHelperText> */}
                              {/* </FormControl> */}
                          {/* </Grid> */}

                          <Grid
                              size={{
                                  lg: 3,
                                  md: 4,
                                  sm: 6,
                                  xs: 12
                              }}>
                              <FormControl
                                  required
                                  disabled={props.status === 'edit' || props.status === 'editSO' ? true : false}
                                  error={formErrors.location_id === null ? false : true}
                                  component='fieldset'
                                  fullWidth
                                  variant='filled'
                              >
                              <InputLabel>Location</InputLabel>
                              <Select
                                  style={{ marginBottom : '-4px' }}
                                  name='location_id'
                                  label='Location'
                                  items={[
                                      {label: 'Select one', value: ''},
                                      {label: 'option 1', value: 'one'},
                                      {label: 'option 2', value: 'two'},
                                  ]}
                                  onChange={handleChange}
                                  value={formValues.location_id === null ? '' : formValues.location_id}
                              >
                                  {
                                      props.stocklocation.filter((d)=> {
                                          if(headerLocationId === 'null') return true
                                          else return headerLocationId === d.location_id
                                          }).map(
                                      (s) =>
                                          s.location_type_name !== "Scrap" && s.location_type_name !== "office"  && (
                                          <MenuItem value={s.location_id} key={s.location_id}>
                                              {s.location_name}
                                          </MenuItem>
                                          ),
                                      )
                                  }
                              </Select>
                              <FormHelperText>{formErrors.location_id ? 'Location is required!' : ''}</FormHelperText>
                              </FormControl>
                          </Grid>
                            {subcompany > 0 &&
                                <Grid
                                    size={{
                                        lg: 3,
                                        md: 4,
                                        sm: 6,
                                        xs: 12
                                    }}>
                                    <FormControl
                                        required
                                        disabled={props.status === "edit" || props.status === "editSO"}
                                        error={!!formErrors.tax_id}
                                        fullWidth
                                        variant="filled"
                                    >
                                        <Autocomplete
                                            disableClearable
                                            options={getbillingcompanydetails || []}   // reducer data
                                            getOptionLabel={(option) =>
                                                 option.tax_id ? `${option.company_name} - ${option.tax_id}` : ""
                                            }
                                            onChange={(e, value) => {
                                                handleChange({
                                                    target: { name: "sub_company_id", value: value || "" }
                                                })
                                              //   handleChange({
                                              //       target: { name: "tax_id", value: value?.tax_id || "" }
                                              //   });

                                              //   handleChange({
                                              //       target: { name: "sub_company_id", value: value?.sub_company_id || null }
                                              //   });
                                            }}
                                            value={
                                                getbillingcompanydetails?.find(
                                                    (d) => d.sub_company_id === formValues.sub_company_id
                                                ) || null
                                            }
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Billing GST"
                                                    variant="filled"
                                                    error={!!formErrors.tax_id}
                                                    helperText={formErrors.tax_id ? "Billing GST is required!" : ""}
                                                />
                                            )}
                                        />
                                    </FormControl>
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
                                  onChange={handleChange}
                                  disabled={props.status === 'edit' ? true : false}
                                  fullWidth
                                  placeholder='Reference'
                                  label='Reference'
                                  name='reference'
                                  value={formValues.reference === null ? '' : formValues.reference}
                                  color='primary'
                                  type='text'
                                  variant='filled'
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
                                  fullWidth
                                  name='comment'
                                  label='Comments'
                                  multiline={true}
                                  placeholder='Comment here...'
                                  rows={1}
                                  value={formValues.comment === null ? '' : formValues.comment}
                                  variant='filled'
                                  onChange={handleChange}
                              />
                          </Grid>
                          
                          {
                              formValues.customer_id !== null && !props.returnState &&
                              <>
                                  <Grid
                                      size={{
                                          lg: 3,
                                          md: 4,
                                          sm: 6,
                                          xs: 12
                                      }}>
                                      <TextField
                                          fullWidth
                                          name='credit_days'
                                          label='Credit Days'
                                          value={
                                                  (formValues.invoiceCreditDays !== undefined && formValues.invoiceCreditDays !== null )  ? formValues.invoiceCreditDays : selectedCustomer?.credit_days !== undefined && selectedCustomer?.credit_days !== null
                                                  ? selectedCustomer.credit_days 
                                                  : ''
                                          }
                                          variant='filled'
                                          disabled
                                          InputLabelProps={{ shrink : true }}
                                          InputProps={{
                                              endAdornment : hasCreditDaysEdit && props.status !== 'edit' && (
                                              <IconButton
                                                  onClick={handleOpenEdit}
                                                  edge="end"
                                                  disabled={!formValues.customer_id}
                                              >
                                                  <EditIcon
                                                      sx={{
                                                          color: formValues.customer_id ? '#000' : 'rgba(0, 0, 0, 0.26)',
                                                      }}
                                                  />
                                              </IconButton>
                                              )
                                          }}
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
                                          fullWidth
                                          name='credit_value'
                                          label='Credit Days Value'
                                          value={
                                                  ((formValues.invoiceCreditValue !== undefined && formValues.invoiceCreditValue !== null ) ? formValues.invoiceCreditValue : selectedCustomer?.credit_value !== undefined && selectedCustomer?.credit_value !== null 
                                                  ? selectedCustomer.credit_value 
                                                  : '') || ''
                                          }
                                          variant='filled'
                                          disabled
                                          InputLabelProps={{ shrink : true }}
                                          InputProps={{
                                              endAdornment : hasCreditDaysValueEdit && props.status !== 'edit' && (
                                              <IconButton
                                                  onClick={handleOpenCreditDaysValueEdit}
                                                  edge="end"
                                                  disabled={!formValues.customer_id}
                                              >
                                                  <EditIcon
                                                      sx={{
                                                          color: formValues.customer_id ? '#000' : 'rgba(0, 0, 0, 0.26)',
                                                      }}
                                                  />
                                              </IconButton>
                                              )
                                          }}
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
                                          fullWidth
                                          name='sales_man'
                                          label='SalesMan'
                                          value={formValues.sales_man?.value || ''}
                                          variant='filled'
                                          disabled
                                          InputLabelProps={{ shrink: true }}
                                          InputProps={{ 
                                              endAdornment : (selectedCustomer?.salesman_id !== null || selectedCustomer?.salesman_id !== undefined) && props.status !== 'edit' && (
                                                  <IconButton
                                                      onClick={handleSalesmanEdit}
                                                      edge="end"
                                                      disabled={!formValues.customer_id}
                                                  >
                                                      <EditIcon sx={{ color: formValues.customer_id ? '#000' : 'rgba(0, 0, 0, 0.26)' }} />
                                                  </IconButton>
                                              )
                                          }}
                                      />
                                  </Grid>
                              </>

                          }
                      </Grid>
                  </Grid>
                  <Grid
                      size={{
                          lg: 2,
                          md: 2,
                          sm: 2,
                          xs: 2
                      }}></Grid>

                  {
                      formValues.sale_status === 2 &&
                      <>
                          <Grid
                              size={{
                                  lg: 10,
                                  md: 10,
                                  sm: 10,
                                  xs: 10
                              }}>
                              <Grid container spacing={2}>
                                  {
                                      shippingOpen &&
                                      <ShippingDetailPopup 
                                          type="bankdetail"
                                          open={shippingOpen}
                                          ApplyButton={shippingApply}
                                          handleClose={shippingFilter}
                                          formValues={shipformValues}
                                          setFormValues={setShipFormValues}
                                          formErrors={shipformErrors}
                                          setFormErrors={setShipFormErrors}
                                          status={status}
                                          handleEdit={handleshippingEditSubmit}
                                          setStatus={setStatus}
                                          requiredFields={shiprequiredFields}
                                          editshippingAddress={editShippingMode}
                                          shippingData={props.shippingData}   
                                          setShippingData={props.setShippingData}
                                          customerData={customerData}
                                      />
                                  }

                                  {
                                      formValues.customer_id !== null &&
                                      <Grid
                                          style={{ marginTop : '10px' }}
                                          size={{
                                              lg: 6,
                                              md: 5,
                                              sm: 6,
                                              xs: 12
                                          }}>
                                          <>
                                              <Box sx={{ border: `1px solid ${theme.palette.primary.main}`, borderRadius : '5px', height : '100%', padding : 1 }}>
                                                  <Grid container>
                                                      <Grid
                                                          size={{
                                                              lg: 11,
                                                              md: 11,
                                                              sm: 11,
                                                              xs: 11
                                                          }}>
                                                          {
                                                              hasShipping ? (
                                                                  <>
                                                                      <Typography variant="h6">Ship To: </Typography>

                                                                      <Typography>{formValues.ship_legal_name || selectedCustomer.company_name}</Typography>

                                                                      <Typography>
                                                                          {`${formValues.ship_address},`}
                                                                          <br /> 
                                                                          {`${formValues.ship_location} - ${formValues.ship_zip}`}
                                                                      </Typography>

                                                                      <Typography>
                                                                          {`${formValues.ship_person_name||selectedCustomer.first_name || ' '} ${selectedCustomer.last_name || ' '}, ${
                                                                              formValues.ship_phone_number || selectedCustomer.phone_number || ' '}` || ' '}
                                                                      </Typography>

                                                                      <Typography>
                                                                          {`${formValues.ship_gstin||selectedCustomer.tax_id || ' '}` || ' '}
                                                                      </Typography>
                                                                  </>
                                                              ) : (
                                                                  formValues.customer_id && <Typography color="textSecondary" fontStyle="italic">No shipping address provided.</Typography>
                                                              )
                                                            
                                                          }
                                                      </Grid>
                      
                                                      <Grid
                                                          size={{
                                                              lg: 1,
                                                              md: 1,
                                                              sm: 1,
                                                              xs: 1
                                                          }}>
                                                          {/* {
                                                              isAdmin && ( */}
                                                              <Box display="flex" justifyContent="flex-end">
                                                                  <IconButton
                                                                      onClick={handleOpenDialog}
                                                                      disabled={!formValues.customer_id}
                                                                  >
                                                                  <EditIcon
                                                                      sx={{
                                                                          color: formValues.customer_id ? '#000' : 'rgba(0, 0, 0, 0.26)',
                                                                      }}
                                                                  />
                                                                  </IconButton>
                                                              </Box>
                                                              {/* )
                                                          } */}
                                                      </Grid>
                                                  </Grid>
                                                  
                                              </Box>
                                          </>
                                      </Grid>
                                  }
                              </Grid>
                          </Grid>
                      </>
                  }

                  <Grid
                      sx={{ '& .MuiPaper-root': { maxHeight: '500px !important'} }}
                      size={{
                          lg: 12,
                          md: 12,
                          sm: 12,
                          xs: 12
                      }}>
                      <Grid container display='flex' justifyContent='space-between' alignItems='center'>
                          <Grid>
                              <Typography variant='h6'>Sales Item</Typography>
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
                                  {
                                      formValues.sale_status !== 1 && !props.returnState &&
                                      <TextField
                                          value={lotNumberSearch || ''}
                                          label='Barcode / Lot Number'
                                          onChange={(event) => setLotNumberSearch(event.target.value)}
                                          onKeyDown={(event) => {
                                              if(event.key === 'Enter'){
                                                  handleLotNumberSearch(lotNumberSearch, false)
                                              }
                                          }}
                                          // error={lotNumberMessage.error}
                                          // helperText={lotNumberMessage.message}
                                          sx={{  width : '300px' }}
                                          InputProps={{
                                              endAdornment: lotNumberMessage.error ? (
                                                  <InputAdornment position="end">
                                                      <IconButton onClick={() => {
                                                          setLotNumberSearch(null)
                                                          setLotNumberMessage({ success: false, error: false, message: '' })
                                                      }}>
                                                          <CloseIcon fontSize='small' />
                                                      </IconButton>
                                                  </InputAdornment>
                                              ) : (<></>)
                                          }}
                                      />
                                  }

                                  {
                                      formValues.sale_status !== 1 && !props.returnState &&
                                      <Tooltip title='Upload' placement='top'>
                                          <IconButton onClick={() => handleUploadOpen(true)}>
                                              <UploadFileIcon />
                                          </IconButton>
                                      </Tooltip>
                                  }

                                  <FormControl sx={{ width: '250px' }} >
                                      <InputLabel id="price-list-select-label">Price List</InputLabel>
                                      <Select
                                          required
                                          hidden={formValues.sale_status === 4 ? true : false}
                                          disabled={props.returnState}
                                          sx={{width : '250px' }}
                                          size='small'
                                          labelId="demo-simple-select-label"
                                          id="price-list-select"
                                          value={
                                              formValues.price_list === null 
                                              ? defaultPriceList.id
                                              : props.price_list?.length > 0 && props.price_list?.filter(pList => pList.id === formValues.price_list)[0]?.id
                                          } 
                                          name='price_list'
                                          label="Price List"
                                          error={formErrors.price_list === null ? false : true}
                                          helpertext={formErrors.price_list}
                                            onChange={handleChange}
                                        >
                                            {defaultPriceList && (
                                                <MenuItem key={defaultPriceList.id} value={defaultPriceList.id}>
                                                    {defaultPriceList.price_list_name}
                                                </MenuItem>
                                            )}

                                            {formValues.customer_id &&
                                                props.price_list
                                                    ?.filter(
                                                        (pList) =>
                                                            pList.customerMappedIds?.some(
                                                                (mapped) => mapped.customer_id === formValues.customer_id
                                                            ) && pList.id !== defaultPriceList?.id
                                                    )
                                                    ?.map((assigned) => (
                                                        <MenuItem key={assigned.id} value={assigned.id}>
                                                            {assigned.price_list_name}
                                                        </MenuItem>
                                                    ))}
                                        </Select>
                                    </FormControl>
                                </Stack>
                          </Grid>
                      </Grid>

                      <Table style={{ marginTop : formValues.sale_status === 1 || props.returnState ? '5px' : '' }}>
                          <TableHead style={{ backgroundColor : '#e8e8e8' }}>
                              <TableRow>
                                  <TableCell width='25%'>Product</TableCell>
                                  {
                                      !props.returnState &&
                                      <>
                                          <TableCell width='15%'>Desc</TableCell>
                                          <TableCell style={{ textAlign : 'right' }} width='10%'>HSN</TableCell>
                                      </>
                                    }{
                                      !props.returnState && formValues.sale_status !==1 && props.appConfigData.eInvoice !== '1' &&
                                      <>
                                       <TableCell style={{ textAlign : 'right' }} width='10%'>Tax Category</TableCell>
                                      </>
                                  }
                                  {
                                      props.returnState &&
                                      <TableCell style={{ textAlign : 'right' }} width='10%'>Sold Qty</TableCell>
                                  }
                                  <TableCell style={{ textAlign : 'right' }} width='10%'>{props.returnState ? 'Return Qty' : 'Qty'}</TableCell>
                                  {
                                      props.returnState &&
                                      <TableCell style={{ textAlign : 'right' }} width='10%'>Returned Qty</TableCell>
                                  }
                                  <TableCell style={{ textAlign : 'right' }} width='10%'>Selling Cost</TableCell>
                                  {
                                    (props.returnState ? returnDiscount === 'ItemLevel' : props.appConfigData.discountEnabled === 'At Item Level') && props.pageType !== '/sales/deliveryChallan' &&
                                    <>
                                        <TableCell style={{ textAlign : 'right' }} width='10%'>Discount Type</TableCell>
                                        <TableCell style={{ textAlign : 'right' }} width='10%'>Discount</TableCell>
                                    </>
                                }
                                  <TableCell style={{ textAlign : 'right' }} width='5%'>Taxes</TableCell>
                                  <TableCell style={{ textAlign : 'right' }} width='8%'>Subtotal</TableCell>
                                  {
                                      (formValues.sale_status === 2 || formValues.sale_status === 8 || props.returnState) &&
                                      <TableCell width='10%'>Serial Number</TableCell>
                                  }
                                  {
                                      !props.returnState &&
                                      <TableCell width='5%'>{''}</TableCell>
                                  }
                              </TableRow>
                          </TableHead>

                          <TableBody>
                              {
                                  
                                  sales_items.length > 0 &&
                                      sales_items.map((rowData, index) => {
                                          const lotRes = CheckQuantity(rowData, rowData.quantity)
                                         // console.log(rowData.quantity,"dsfgfdsdfdsf",lotRes)
                                          const availableQty = lotRes
                                          const showError =  rowData.quantity > availableQty
                                          //console.log('RowDataaaaaa', rowData)
                                          return ( 
                                          <TableRow key={index}>
                                              <TableCell style={{ height : '60px' }}>
                                                  {
                                                      props.returnState ? (
                                                          <Typography variant='h6'>{rowData.name}</Typography>
                                                      ) : (
                                                          <ProductSelect
                                                              name='product'
                                                              value={{ name : rowData.name ? rowData.name : '' }}
                                                              product={locationWiseProduct}
                                                              getOptionLabel={(option) => option?.name || ''}
                                                              interSection={sales_items}
                                                              filterOptions={filterOptions}
                                                              disabled={!formValues.location_id || props.returnState ? true : false}
                                                              edit={rowData.name}
                                                              variantType='standard'
                                                              productReturn={props.returnState}
                                                              onInputChange={(event, newInputValue) => {
                                                                  productLotNumberSearch = newInputValue
                                                              }}
                                                              onKeyDown={(event) => {
                                                                  if(event.key === 'Enter'){
                                                                      handleLotNumberSearch(productLotNumberSearch, true, index)
                                                                  }
                                                              }}
                                                              onChange={(e, v) => { 
                                                                  if (v !== null) {
                                                                      productAdding(v, true, index)
                                                                      setTimeout(() => {
                                                                          document.querySelector(`[name="quantity${index}"]`)?.focus()
                                                                      }, 100)
                                                                  }
                                                                  else {
                                                                      setSalesItems(sales_items.map((d, i) => {
                                                                          if(i === index) {
                                                                              return tempInsert
                                                                          }
                                                                          else {
                                                                              return d
                                                                          }
                                                                      }))
                                                                  }
                                                              }}
                                                              error={props.value !== undefined ? props.error : false}
                                                              addIconClick={() => {
                                                                  props.setModalStatusHandler(true);
                                                                  props.setModalTypeHandler('product')
                                                                  if(add_click) {
                                                                      addActionRef.current?.click()
                                                                      setAdd_click(false)
                                                                  }
                                                              }}
                                                              editIconClick={() => {
                                                                  const rowProduct = locationWiseProduct.find(p => p.item_id === rowData.item_id) || productDetails;
                                                                  props.setModalStatusHandler(true);
                                                                  props.setModalTypeHandler('updateProduct');
                                                                  props.setEditProductDataHandler([rowProduct])
                                                              }}
                                                              sale_type={formValues.sale_status}
                                                              productCreateBtn={productCreateBtn}
                                                              productEditBtn={productEditBtn}
                                                          />
                                                      )
                                                  }
                                              </TableCell>
                                              
                                              {
                                                  !props.returnState &&
                                                  <>
                                                      <TableCell style={{ height : '60px' }}>
                                                          <TextField
                                                              value={rowData.description || ''}
                                                              variant='standard'
                                                              onChange={(e) => {
                                                                  const value = e.target.value
                                                                  const updatedSaleItems = sales_items.map((d, i) => {
                                                                      if(index === i) {
                                                                          return {
                                                                              ...d, 
                                                                              description : value
                                                                          }
                                                                      }
                                                                      else {
                                                                          return d
                                                                      }
                                                                  })
                                                                  setSalesItems(updatedSaleItems)
                                                              }}
                                                          />
                                                      </TableCell>

                                                      <TableCell style={{ height : '60px' }}>
                                                          <TextField
                                                              value={rowData.hsn_code || ''}
                                                              variant='standard'
                                                              onChange={(e) => {
                                                                  const value = e.target.value
                                                                  if(!/^\d*$/.test(value) || value.length > 8) return

                                                                  const updatedSaleItems = sales_items.map((d, i) => {
                                                                      if(index === i) {
                                                                          return {
                                                                              ...d, 
                                                                              hsn_code : value
                                                                          }
                                                                      }
                                                                      else {
                                                                          return d
                                                                      }
                                                                  })
                                                                  setSalesItems(updatedSaleItems)
                                                                  debouncedHsnChange(e, rowData, value);
                                                                  
                                                                  // setTimeout(() => {
                                                                  //     if(rowData.hsn_code !== hsnDesc.hsnCode) {
                                                                  //         handleHsnDescChange(e, rowData, value)
                                                                  //     }
                                                                  // }, 1000)
                                                              }}
                                                              error={rowData.hsn_code !== null && rowData.hsn_code !== '' && !hsnValidPattern.test(rowData.hsn_code)}
                                                              helperText={rowData.hsn_code !== null && rowData.hsn_code !== '' && !hsnValidPattern.test(rowData.hsn_code) ? 'Enter a valid 4, 6, or 8 digit HSN Code (not all zeroes)' : ''}
                                                              inputProps={{
                                                                  maxLength : 8,
                                                                  inputMode : 'numeric',
                                                                  style: { textAlign : 'right' },
                                                                  inputProps: { style : { textAlign: 'right' } }
                                                              }}
                                                          />
                                                      </TableCell>
                                                  </>
                                              }
                                             {
                                              !props.returnState && formValues.sale_status !== 1 && props.appConfigData.eInvoice !== '1' &&
                                                      <TableCell style={{ height: '60px' }}>
                                                          <CommonAutoCategory
                                                              labelName="Tax Category"
                                                              value={
                                                                  rowData.tax_category_id
                                                                      ? { label: rowData.tax_category, value: rowData.tax_category_id }
                                                                      : null
                                                              }
                                                              setValue={(selectedCategory) => {
                                                                  if (!selectedCategory) return;

                                                                  // Find the full tax category object
                                                                  const categoryObj = allTaxCategories.find(
                                                                      (t) =>
                                                                          t.tax_category_id === selectedCategory.value ||
                                                                          t.tax_category === selectedCategory.label
                                                                  );
                                                                  if (!categoryObj) return;

                                                                  const newTaxes = categoryObj.taxes || [];

                                                                  const updatedSalesItems = sales_items.map((item, idx) => {
                                                                      if (idx === index) {
                                                                          const salesItemTaxes = Sales_Item_Taxes(
                                                                              productByType,
                                                                              [item],
                                                                              sales_items,
                                                                              item.item_unit_price,
                                                                              newTaxes
                                                                          );

                                                                          const newSubtotal =
                                                                              (parseFloat(item.item_unit_price) + salesItemTaxes.item_tax_amount) * item.quantity;

                                                                          return {
                                                                              ...item,
                                                                              tax_category_id: categoryObj.tax_category_id,
                                                                              tax_category: categoryObj.tax_category,
                                                                              taxes: newTaxes,
                                                                              taxes_name: categoryObj.tax_category,
                                                                              sales_item_taxes: salesItemTaxes,
                                                                              sub_total: newSubtotal.toFixed(2),
                                                                          };
                                                                      }
                                                                      return item;
                                                                  });

                                                                  setSalesItems(updatedSalesItems);
                                                              }}
                                                              searchVal={filteredCategories.map((cat) => ({
                                                                  label: cat.tax_category,
                                                                  value: cat.tax_category_id,
                                                              }))}
                                                              requestSearch={handleCategorySearch}
                                                              required={true}
                                                              type='salesDC'
                                                          />


                                                      </TableCell>

                                             }


                                              {
                                                  props.returnState &&
                                                  <TableCell style={{ height : '60px' }}>
                                                      <Typography sx={{ textAlign: 'right' }} variant='h6'>{rowData.soldQuantity}</Typography>
                                                  </TableCell>
                                              }

                                              <TableCell style={{ height : '60px' }}>
                                                  <TextField
                                                      variant='standard'
                                                      name={`quantity${index}`}
                                                      value={rowData.quantity ? rowData.quantity : ''}
                                                      type='number'

                                                      onChange={(e) => {
                                                          const oldQuantity = currentQuantity
                                                          const rawValue = parseInt(e.target.value) || ''
                                                          const maxReturnQty = props.returnState
                                                            ? Number(rowData.returnQuantity ?? rowData.soldQuantity ?? 0)
                                                            : null
                                                          const value = props.returnState && rawValue !== ''
                                                            ? Math.min(rawValue, maxReturnQty)
                                                            : rawValue
                                                          const quantityForTax = value === '' ? 0 : Number(value)
                                                          const unitPrice = Number(rowData.item_unit_price || 0)
                                                          const discount = Number(rowData.discount || 0)
                                                          const taxes = Array.isArray(rowData.taxes) ? rowData.taxes : []
                                                          let reducedQuantity = 0
                                                          if(value === ''){
                                                              setCurrentLots(rowData.lots)
                                                              setCurrentQuantity(rowData.quantity)
                                                          }
                                                          const lots = currentLots
                                                          if(oldQuantity > value){
                                                              reducedQuantity = oldQuantity - (value === '' ? 0 : value)
                                                          }
                                                          const updatedSaleItems = sales_items.map((d, i) => {
                                                              const newLotsLength = Math.max(lots.length - reducedQuantity, 0);
                                                              const updatedLots = lots.slice(0, newLotsLength);
                                                              if(index === i) {
                                                                  return {
                                                                      ...d, 
                                                                      quantity : value,
                                                                      sub_total : singleTax(
                                                                          unitPrice - discount,
                                                                          quantityForTax,
                                                                          taxes
                                                                      ).toFixed(2),
                                                                      lots: value === '' ? [] : lots.length > 0 ? updatedLots : rowData.lots
                                                                  }
                                                              }
                                                              else {
                                                                  return d
                                                              }
                                                          })
                                                          setSalesItems(updatedSaleItems)
                                                      }}
                                                      InputProps={{
                                                          style: { textAlign : 'right' },
                                                          inputProps: { style : { textAlign: 'right' } },
                                                          endAdornment: (
                                                              <InputAdornment position='end' sx={{ alignSelf: 'flex-end', mb: '13px' }}>
                                                                  <span>{rowData.name.length > 0 ? productDetails.unitName : ''}</span>
                                                              </InputAdornment>
                                                          )
                                                      }}
                                                      error={showError && !props.returnState && (props.edit_id_data[0]?.dc_number === null || props.edit_id_data[0]?.dc_number === undefined)}
                                                      helperText={showError && !props.returnState && (props.edit_id_data[0]?.dc_number === null || props.edit_id_data[0]?.dc_number === undefined) ? `Available ${availableQty} Qty` : ''}
                                                  />
                                              </TableCell>

                                              {
                                                  props.returnState &&
                                                  <TableCell style={{ height : '60px' }}>
                                                      <Typography sx={{ textAlign: 'right' }} variant='h6'>{rowData.return_quantity}</Typography>
                                                  </TableCell>
                                              }

                                              <TableCell style={{ height : '60px' }}>
                                                  {
                                                      props.returnState ? (
                                                          <Typography sx={{ textAlign: 'right' }} variant='h6'>{rowData.item_unit_price}</Typography>
                                                      ) : (
                                                          <>
                                                              <TextField 
                                                                  variant='standard'
                                                                  value={rowData.item_unit_price}
                                                                  onChange={(e) => {
                                                                      let value = e.target.value;
                                                                      if (!/^\d*\.?\d{0,2}$/.test(value)) return;  // allows only number with up to 2 decimal places
                                                                      const cost = value || 0
                                                                      const updatedSaleItems = sales_items.map((d, i) => {
                                                                          if(index === i) {
                                                                              return {
                                                                                  ...d, 
                                                                                  item_unit_price : cost,
                                                                                  sub_total : singleTax(
                                                                                      cost,
                                                                                      rowData.quantity,
                                                                                      rowData.taxes
                                                                                  ).toFixed(2),
                                                                                  sales_item_taxes : Sales_Item_Taxes(productByType, [d], sales_items, cost, rowData.taxes)
                                                                              }
                                                                          }
                                                                          else {
                                                                              return d
                                                                          }
                                                                      })
                                                                      setSalesItems(updatedSaleItems)
                                                                  }}
                                                                  InputProps={{
                                                                      style: { textAlign : 'right' },
                                                                      inputProps: { style : { textAlign: 'right' } }
                                                                  }}
                                                              />
                                                          </>
                                                              
                                                      )
                                                  }
                                              </TableCell>

                                              {
                                                (props.returnState ? returnDiscount === 'ItemLevel' : props.appConfigData.discountEnabled === 'At Item Level') && props.pageType !== '/sales/deliveryChallan' &&
                                                <>
                                                    <TableCell style={{ textAlign : 'right' }} width='10%'>
                                                        <Autocomplete
                                                            value={[{id: 0, value: '%'}, {id: 1, value:'₹'}].find(d => d.id === rowData.discount_type) ?? null}
                                                            options={[{id: 0, value: '%'}, {id: 1, value:'₹'}]}
                                                            getOptionLabel={(option) => option.value}
                                                            disabled={props.returnState}
                                                            onChange={(event, newValue) => {
                                                                const updatedSaleItems = sales_items.map((d, i) => {
                                                                        if(index === i) {
                                                                            const discountAmount = newValue === null ? 0 : newValue.id === 0 ? (parseFloat(d.item_unit_price) * Number(d.discount_value ?? 0)) / 100 : Number(d.discount_value ?? 0)
                                                                            const salesItemTaxes = Sales_Item_Taxes(
                                                                                productByType,
                                                                                [d],
                                                                                sales_items,
                                                                                d.item_unit_price - discountAmount,
                                                                                d.taxes
                                                                            );

                                                                            const newSubtotal = Number(((parseFloat(d.item_unit_price) - discountAmount + salesItemTaxes.item_tax_amount) * d.quantity).toFixed(2));
                                                                            return {
                                                                                ...d, 
                                                                                discount_type: newValue === null ? null : newValue.id,
                                                                                discount_value: newValue === null ? '' : d.discount_value,
                                                                                discount: newValue === null ? 0 : d.discount,
                                                                                sub_total: newSubtotal,
                                                                                sales_item_taxes: salesItemTaxes
                                                                            }
                                                                        }
                                                                        else {
                                                                            return d
                                                                        }
                                                                    })
                                                                    setSalesItems(updatedSaleItems)
                                                            }}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    { ...params }
                                                                    variant='standard'
                                                                />
                                                            )}
                                                        />
                                                    </TableCell>

                                                    <TableCell style={{ textAlign : 'right' }} width='10%'>
                                                        <TextField
                                                            variant='standard'
                                                            value={rowData.discount_value ?? rowData.discount ?? ""}
                                                            disabled={props.returnState || rowData.discount_type == null}
                                                            onChange={(event) => {
                                                                const discountInput = Number(event.target.value);
                                                                if (isNaN(discountInput)) return;
                                                                const updatedSaleItems = sales_items.map((d, i) => {
                                                                        if(index === i) {
                                                                            const discountAmount = d.discount_type === 0 ? (parseFloat(d.item_unit_price) * Number(event.target.value)) / 100 : Number(event.target.value)
                                                                            const salesItemTaxes = Sales_Item_Taxes(
                                                                                productByType,
                                                                                [d],
                                                                                sales_items,
                                                                                d.item_unit_price - discountAmount,
                                                                                d.taxes
                                                                            );

                                                                            const newSubtotal = Number(((parseFloat(d.item_unit_price) - discountAmount + salesItemTaxes.item_tax_amount) * d.quantity).toFixed(2));
                                                                            return {
                                                                                ...d, 
                                                                                discount_value: event.target.value,
                                                                                discount: discountAmount,
                                                                                sub_total: newSubtotal,
                                                                                sales_item_taxes: salesItemTaxes
                                                                            }
                                                                        }
                                                                        else {
                                                                            return d
                                                                        }
                                                                    })
                                                                    setSalesItems(updatedSaleItems)
                                                            }}
                                                        />
                                                    </TableCell>
                                                </>
                                            }

                                              <TableCell style={{ height : '60px' }}>
                                                  {/* {
                                                     props.pageType !== '/sales/deliveryChallan' &&  <Typography sx={{ textAlign: 'right' }} variant='h6'>{rowData?.sales_item_taxes?.percent ? `${rowData?.sales_item_taxes?.percent}%` : ''}</Typography>
                                                      
                                                  } */}
                                                  <Typography sx={{ textAlign: 'right' }} variant='h6'>{rowData?.sales_item_taxes?.percent ? `${rowData?.sales_item_taxes?.percent}%` : ''}</Typography>
                                              </TableCell>

                                              <TableCell style={{ height : '60px' }}>
                                                  <Typography sx={{ textAlign: 'right' }} variant='h6'>{rowData.sub_total}</Typography>
                                              </TableCell>
                                              
                                              {
                                                  (formValues.sale_status === 2 || formValues.sale_status === 8 || props.returnState) &&
                                                  <TableCell style={{ height : '60px' }}>
                                                      <Stack flexDirection='row' gap={5}>
                                                          {
                                                              rowData.name.length > 0 ? 
                                                                  rowData.is_serialized === 1 &&
                                                                  <Tooltip title={rowData.is_serialized === 1 ? 'Serial Number' : ''}>
                                                                      <Icon
                                                                          style={{
                                                                              color : rowData.is_serialized === 1 &&
                                                                                  (rowData.quantity) > 0 ?
                                                                                      Number(rowData.quantity) / 1 === rowData.lots.length ? 'green' : 'red'
                                                                                  : 'grey',
                                                                              display : props.returnState ? rowData.is_serialized === 0 ? 'none' : 'block'
                                                                                          : ![2, 8].includes(formValues.sale_status) ? 'none' : 'block'
                                                                          }}
                                                                          onClick={() => handleItemPopup(rowData, null, 'nonEdit')}
                                                                      >
                                                                          toc
                                                                      </Icon>
                                                                  </Tooltip>
                                                              : ''
                                                          }
                                                          {
                                                              rowData.name.length > 0 ? 
                                                                  rowData.is_serialized === 1 &&
                                                                  <Tooltip title='View'>
                                                                      <Icon
                                                                          onClick={() => handleViewSerialNumber(rowData)}
                                                                      >
                                                                          visibility
                                                                      </Icon>
                                                                  </Tooltip>
                                                              : ''
                                                          }
                                                      </Stack>
                                                  </TableCell>
                                              }

                                              {
                                                  !props.returnState &&
                                                  <TableCell style={{ height : '60px' }}>
                                                      <Stack flexDirection='row'>
                                                          {
                                                              sales_items.length > 1 &&
                                                              <IconButton onClick = {rowData.name.length > 0 ? () => handleDeleteDialogOpen(index) : () => deleteProductRowData(index)}>
                                                                  <DeleteIcon sx={{ color : '#f04f47' }} />
                                                              </IconButton>
                                                          }
                                                          
                                                          {
                                                              index === sales_items.length - 1 &&
                                                              <IconButton onClick = {() => setSalesItems((prev) => ([...prev, tempInsert]))}>
                                                                  <AddIcon />
                                                              </IconButton>
                                                          }
                                                      </Stack>
                                                  </TableCell>
                                              }
                                          </TableRow>

                                      )})
                              }
                          </TableBody>
                      </Table>
                  </Grid>

                  <Grid
                      size={{
                          lg: 12,
                          md: 12,
                          sm: 12,
                          xs: 12
                      }}>
                      <Grid container style={{ display : 'flex', justifyContent : 'flex-end', alignItems : 'center' }}>
                          <Grid>
                              <Typography variant='h6'>
                                  {`Total Quantity : ${sales_items.reduce((count, item) => count + parseInt(item.quantity || 0), 0) }`}
                              </Typography>
                          </Grid>
                      </Grid>
                  </Grid>

                  {
                     ((props.appConfigData.eInvoice === '1' || props.appConfigData.ewayBill === '1') && getSubtotalForThreshold() >= 50000) && formValues.sale_status !== 1 && selectedCustomer?.gst_type === 1 &&
                      <Grid
                          size={{
                              lg: 10,
                              md: 10,
                              sm: 10,
                              xs: 10
                          }}>
                          <Grid container spacing={3}>
                              <Grid
                                  size={{
                                      lg: 12,
                                      md: 12,
                                      sm: 12,
                                      xs: 12
                                  }}>
                                  <Typography variant='h6' align='left'>
                                      Transporter Details
                                  </Typography>
                              </Grid>

                              <Grid
                                  size={{
                                      lg: 3,
                                      md: 4,
                                      sm: 6,
                                      xs: 12
                                  }}>
                                  <TextField
                                      fullWidth
                                      name='trans_name'
                                      label='Transporter name'
                                      placeholder='Name of the transporter'
                                      required
                                      value={formValues.trans_name === null ? '' : formValues.trans_name}
                                      variant='filled'
                                      onChange={handleChange}
                                      error={  formErrors.trans_name === null ? false : true}
                                      helperText={formErrors.trans_name === null ? '' :  formErrors.trans_name}
                                      InputLabelProps={{ shrink: true }}
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
                                      fullWidth
                                      name='trans_id'
                                      label='Transporter Gstin'
                                      required
                                      placeholder='Transin/GSTIN'
                                      value={formValues.trans_id === null ? '' : formValues.trans_id}
                                      variant='filled'
                                      onChange={handleChange}
                                      error={formErrors.trans_id === null ? false : true}
                                      helperText={formErrors.trans_id === null ? '' : formErrors.trans_id}
                                      InputLabelProps={{ shrink: true }}
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
                                      fullWidth
                                      name='trans_doc_no'
                                      label='Document Number'
                                      required
                                      placeholder='Tranport Document Number'
                                      value={formValues.trans_doc_no === null ? '' : formValues.trans_doc_no}
                                      variant='filled'
                                      onChange={handleChange}
                                      error={formErrors.trans_doc_no === null ? false : true}
                                      helperText={formErrors.trans_doc_no === null ? '' : formErrors.trans_doc_no}
                                      InputLabelProps={{ shrink: true }}
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
                                      fullWidth
                                      name='trans_mode'
                                      label='Mode of transport'
                                      required
                                      placeholder='EX:(Road-1, Rail-2, Air-3, Ship-4)'
                                      value={formValues.trans_mode === null ? '' : formValues.trans_mode}
                                      variant='filled'
                                      onChange={handleChange}
                                      error={formErrors.trans_mode === null ? false : true}
                                      helperText={formErrors.trans_mode === null ? '' : formErrors.trans_mode}
                                      InputLabelProps={{ shrink: true }}
                                      //type='number'
                                  />
                              </Grid>

                              {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                  <TextField
                                      fullWidth
                                      name='distance'
                                      label='Distance'
                                      required
                                      placeholder='Distance between source and destination PIN codes'
                                      value={formValues.distance ? formValues.distance : ''}
                                      variant='filled'
                                      onChange={handleChange}
                                      error={formErrors.distance === null ? false : true}
                                      helperText={formErrors.distance === null ? '' : formErrors.distance}
                                      InputLabelProps={{ shrink: true }}
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
                                      fullWidth
                                      name='veh_no'
                                      label='Vehicle Number'
                                      required
                                      placeholder='EX:(DD45ABCD1234, 22BH1234AA)'
                                      value={formValues.veh_no === null ? '' : formValues.veh_no}
                                      variant='filled'
                                      onChange={handleChange}
                                      error={formErrors.veh_no === null ? false : true}
                                      helperText={formErrors.veh_no === null ? '' : formErrors.veh_no}
                                      InputLabelProps={{ shrink: true }}
                                  />
                              </Grid>
                          </Grid>
                      </Grid>
                  }

                  <Grid
                      size={{
                          lg: 12,
                          md: 12,
                          sm: 12,
                          xs: 12
                      }}>
                      <Grid container spacing={3}>
                          <Grid
                              size={{
                                  lg: 6,
                                  md: 12,
                                  sm: 12,
                                  xs: 12
                              }}>
                              <TextField
                                  fullWidth
                                  name='note'
                                  variant='outlined'
                                  size='small'
                                  onChange={handleChange}
                                  value={formValues.note}
                                  label='Notes'
                                  minRows={2}
                                  multiline
                              />
                          </Grid>
                          <Grid
                              size={{
                                  lg: 2,
                                  md: 6,
                                  sm: 12,
                                  xs: 12
                              }}></Grid>

                          <Grid
                              style={{ marginTop: '10px', backgroundColor : '#e8e8e8' }}
                              size={{
                                  lg: 4,
                                  md: 12,
                                  sm: 12,
                                  xs: 12
                              }}>
                              <Grid container spacing={2} display='flex' justifyContent='space-between' sx={{ p: 3 }}>
                                  <Grid>
                                      <Typography variant='h6' style={{fontWeight: 'bold'}}>
                                          Untaxed Amount :
                                      </Typography>

                                      {
                                         props.pageType !== '/sales/deliveryChallan' && taxVisible && (
                                              <>
                                                  <Typography style={{fontWeight: 'bold'}}>
                                                      CGST :
                                                  </Typography>

                                                  <Typography style={{fontWeight: 'bold'}}>
                                                      SGST :
                                                  </Typography>
                                              </>
                                          )
                                      }
                                      
                                      {
                                          props.pageType !== '/sales/deliveryChallan' && taxVisible === false && (
                                              <Typography style={{fontWeight: 'bold'}}>
                                                  IGST :
                                              </Typography>
                                          )
                                      }
                                      {
                                          formValues.tds > 0 && (
                                               <Typography style={{fontWeight: 'bold'}}>
                                                  TDS :
                                              </Typography>
                                          )
                                      }
                                       {
                                           props.returnState &&  formValues.tcs > 0 && (
                                               <Typography style={{fontWeight: 'bold'}}>
                                                  TCS :
                                              </Typography>
                                          )
                                      }
                                  </Grid>

                                  <Grid>
                                      <Typography style={{ width: '200px', textAlign: 'end', fontSize: '13px', fontWeight: 600 }}>
                                        <span>₹</span> {floatnum(untaxed(null, formValues.discount_value)).toFixed(2)} 
                                      </Typography>

                                      {
                                          props.pageType !== '/sales/deliveryChallan' && taxVisible && (
                                              <>
                                                  <Typography style={{ width: '200px', textAlign: 'end', margin: '5px', fontSize: '13px', fontWeight: 600 }}>
                                                    <span>₹</span> {(floatnum(untaxed('taxes', formValues.discount_value)) / 2).toFixed(2)}
                                                      {/* <span>₹</span> {(Math.floor(untaxed('taxes') * 100) / 100) / 2} */}
                                                  </Typography>

                                                  <Typography style={{ width: '200px', textAlign: 'end', margin: '5px', fontSize: '13px', fontWeight: 600 }}>
                                                    <span>₹</span> {(floatnum(untaxed('taxes', formValues.discount_value)) / 2).toFixed(2)}
                                                  </Typography>
                                              </>
                                          )
                                      }

                                      {
                                         props.pageType !== '/sales/deliveryChallan' && taxVisible === false && (
                                              <Typography style={{ width: '196px', textAlign: 'end', margin: '5px', fontSize: '13px', fontWeight: 600 }}>
                                                <span>₹</span> {(floatnum(untaxed('taxes', formValues.discount_value))).toFixed(2)}
                                              </Typography>
                                          )
                                      }
                                       {
                                          formValues.tds > 0 && (
                                               <Typography style={{ width: '196px', textAlign: 'end', margin: '5px', fontSize: '13px', fontWeight: 600 }}>
                                                     <span>₹</span> {calculatetdsTaxAmount()}
                                              </Typography>
                                          )
                                      }
                                       
                                       {
                                         props.returnState &&  formValues.tcs > 0 && (
                                               <Typography style={{ width: '196px', textAlign: 'end', margin: '5px', fontSize: '13px', fontWeight: 600 }}>
                                                    <span>₹</span> {calculateTcsFromPercent()}
                                              </Typography>
                                          )
                                      }
                                  </Grid>

                                  {
                                    (props.returnState ? returnDiscount === 'TransactionLevel' : props.appConfigData.discountEnabled === 'At Transaction Level') && props.pageType !== '/sales/deliveryChallan' &&
                                    <>
                                        <Grid size={6}>
                                            <Autocomplete
                                                disabled={props.returnState}
                                                value={[{id: 0, value: '%'}, {id: 1, value:'₹'}].find(d => d.id === formValues.discount_type) ?? null}
                                                options={[{id: 0, value: '%'}, {id: 1, value:'₹'}]}
                                                getOptionLabel={(option) => option.value}
                                                onChange={(event, newValue) => {
                                                    setFormValues((prev) => ({ ...prev, discount_type: newValue === null ? null : newValue.id }))
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        { ...params }
                                                        variant='filled'
                                                        label='Discount Type'
                                                        fullWidth
                                                    />
                                                )}
                                            />
                                        </Grid>

                                        <Grid size={6}>
                                            
                                            <TextField
                                                variant='filled'
                                                type='number'
                                                label='Discount'
                                                fullWidth
                                                value={formValues.discount_value}
                                                disabled={props.returnState || formValues.discount_type === null}
                                                onChange={(event) => {
                                                    const discount_amount = formValues.discount_type === 0 ?
                                                        sales_items.map(item => {
                                                            const itemDiscountPercent = Number((item.item_unit_price / untaxed(null)) * Number(event.target.value ?? 0)).toFixed(2)
                                                            const itemDiscountPrice = Number((item.item_unit_price * itemDiscountPercent) / 100).toFixed(2)
                                                            return { discount: itemDiscountPrice }
                                                        }).reduce((sum, list) => sum + Number(list.discount), 0)
                                                    : Number(event.target.value)
                                                    setFormValues((prev) => ({ ...prev, discount_value: event.target.value, discount_amount }))

                                                    const updatedSalesItems = sales_items.map((item) => {
                                                        const itemDiscount = Number((item.item_unit_price / untaxed(null)) * Number(discount_amount)).toFixed(2)
                                                        const itemTaxes = Sales_Item_Taxes(productByType, [item], sales_items, item.item_unit_price - itemDiscount, item.taxes)
                                                        return{
                                                            ...item,
                                                            sales_item_taxes: itemTaxes
                                                        }
                                                    })
                                                    setSalesItems(updatedSalesItems)
                                                }}
                                            />
                                        </Grid>
                                    </>
                                }

                                  <Grid size={6}>
                                      {
                                          (formValues.sale_status == 2 || props.returnState )&&(
                                              <Autocomplete
                                                  options={taxRateOptions}
                                                  disabled = {props.returnState}
                                                  value={taxRateOptions.find(d => d.value === formValues.tax_types)}
                                                  onChange={(event, newValue) => handleChange({target: {name: 'tax_types', value: newValue.value}})}
                                                  renderInput={(params) => (
                                                      <TextField
                                                          { ...params }
                                                          label='Tax Rate'
                                                          variant='filled'
                                                          fullWidth
                                                      />
                                                  )}
                                              />
                                          )
                                      } 
                                  </Grid>

                                  <Grid size={6}>
                                      {
                                         ( formValues.sale_status == 2 || props.returnState )&& (formValues.tax_types === '1' ? (
                                            <Autocomplete
                                                  name="tds_percent"
                                                  disabled ={props.returnState}
                                                  options={tds_taxrate}
                                                  value={tds_taxrate.find(opt => opt.id === formValues.tds_id) || null}
                                                  getOptionLabel={(option) => `${option.category} [${option.tds_rate}] [${option.section}]`}
                                                  isOptionEqualToValue={(option, value) => option.id === value.id}
                                                  onChange={(event, newValue) => handleChange({target: {name: 'tds_percent', value: newValue}})}
                                                  
                                                  renderInput={(props) => (
                                                      <TextField {...props} label="Select a Tax" />
                                                  )}
                                              />
                                          ) :
                                              <TextField
                                                  id='standard-basic'
                                                  value={formValues.tcs || ''}
                                                  disabled ={props.returnState}
                                                  name='tcs'
                                                  label='TCS'
                                                  fullWidth={true}
                                                  onChange={handleChange}
                                                  variant='filled'
                                                  type='number'
                                              />
                                          )
                                      }
                                      {/* <hr style={{backgroundColor: 'rgba(0,0,0,0.3)'}} /> */}
                                  </Grid>

                                  {
                                    (props.returnState ? returnShippingCharges : props.appConfigData.shippingChargesEnabled === 'true') && props.pageType !== '/sales/deliveryChallan' &&
                                    <>
                                        <Grid item xs={6}>
                                            <Typography variant='h6'>Shipping Charges:</Typography>
                                        </Grid>

                                        <Grid item xs={6}>
                                            <TextField
                                                variant='filled'
                                                type='number'
                                                label='Shipping Charges'
                                                fullWidth
                                                disabled={props.returnState}
                                                value={formValues.shipping_charges ?? ''}
                                                onChange={(event) => {
                                                        setFormValues((prev) => ({ ...prev, shipping_charges: event.target.value }))
                                                }}
                                            />
                                        </Grid>
                                    </>
                                }

                                {
                                    (props.returnState ? returnOtherCharges : props.appConfigData.otherChargesEnabled === 'true') && props.pageType !== '/sales/deliveryChallan' &&
                                    <>
                                        <Grid xs={6}>
                                            <Typography variant='h6'>Other Charges:</Typography>
                                        </Grid>

                                        <Grid xs={6}>
                                            <TextField
                                                variant='filled'
                                                type='number'
                                                label='Other Charges'
                                                fullWidth
                                                disabled={props.returnState}
                                                value={formValues.other_charges ?? ''}
                                                onChange={(event) => {
                                                        setFormValues((prev) => ({ ...prev, other_charges: event.target.value }))
                                                }}
                                            />
                                        </Grid>
                                    </>
                                }

                                  <Grid size={12}>
                                      <Divider />
                                  </Grid>
                                  
                                  <Grid>
                                      {
                                          props.appConfigData.roundedOffEnabled !== 'false' &&
                                          <Typography>
                                              Rounded off :
                                          </Typography>
                                      }

                                      <Typography>
                                          Total :
                                      </Typography>
                                  </Grid>

                                  <Grid>
                                      {
                                          props.appConfigData.roundedOffEnabled !== 'false' &&
                                          <Typography style={{ width: '200px', textAlign: 'end', fontSize: '13px', fontWeight: 600, margin: '5px' }}>
                                              {`₹ ${calculateRoundOff()}`}
                                          </Typography>
                                      }

                                      <Typography style={{ width: '200px', textAlign: 'end', fontWeight: 'bolder', fontSize: headerStyle.fontSize, margin: '5px' }}>
                                        <span>₹</span> {getGrandTotal()}
                                      </Typography>
                                  </Grid>
                              </Grid>
                          </Grid>
                      </Grid>
                  </Grid>


                  <Grid
                      sx={{ mb: 3.5 }}
                      size={{
                          lg: 12,
                          md: 12,
                          sm: 12,
                          xs: 12
                      }}>
                      <Grid container justifyContent='flex-end' spacing={2}>
                          <Grid>
                              {
                                  form === false ? (
                                      <ButtonGroup>
                                          <Button
                                              variant='contained'
                                              color='secondary'
                                              onClick={() => {
                                                  if (typeof setinvoicelayout === 'function') {
                                                      setinvoicelayout(false)
                                                  }
                                                  setInvoicenumber(null)
                                                  props.handleClose()
                                              }}
                                          >
                                              Close
                                          </Button>

                                      </ButtonGroup>
                                  ) : (
                                      <ButtonGroup>
                                          <Button
                                              variant="contained"
                                              color="secondary"
                                              onClick={() => {
                                                  if (typeof setinvoicelayout === 'function') {
                                                      setinvoicelayout(false)
                                                      dispatch(triggerSalesModal(false))
                                                  }
                                                  validClose()
                                              }}
                                          >
                                              Close
                                          </Button>
                                      </ButtonGroup>
                                  )
                              }
                          </Grid>

                          <Grid>
                              {
                                  !props.returnState ? (
                                      <ActionButton
                                          appConfigData={props.appConfigData}
                                          shipping_details={[props.shipping_details]}
                                          note={formValues.note}
                                          addNote={addNote}
                                          createMail={createMail}
                                          custType={'CUSTOMER'}
                                          approvalRequest = {request} 
                                          custData={getCustomer()}
                                          handleSubmit={handleSubmit}
                                          status = {(salesApprovals.length > 0)  ?  salesApprovals[0].status : null}
                                          invoice={
                                              formValues.sale_status === 1
                                              ? formValues.so_number :  formValues.sale_status === 8 
                                              ? formValues.dc_number
                                              : formValues.invoice_number
                                          }
                                          soDate={moment(formValues.sale_time).format('YYYY-MM-DD HH:MM:SS')} 
                                          soNumber={formValues.so_number}
                                          sales_items={sales_items}
                                          sale_status={formValues.sale_status}
                                          customer_id={formValues.customer_id}
                                          checkEachBarcodeWasEntered={checkEachBarcodeWasEntered}
                                          checkEachBarcodeWasEnteredForSaleOrder={checkEachBarcodeWasEnteredForSaleOrder}
                                          handleClose={props.handleClose}
                                          mail_configuration={props.mail_configuration}
                                          handleNewopen={props.handleNewopen}
                                          dc_number = {formValues.dc_number}
                                          tcs={Rdata?.tcs}
                                          tds={Rdata?.tds}
                                          tcs_percent={Rdata?.tcs_percent}
                                          tds_percent={Rdata?.tds_percent}
                                          tds_value={Rdata?.tds_id}
                                          total={getSafeSalesTotal()}
                                          location_id = {formValues?.location_id}
                                          invoicelayout={invoicelayout}
                                          setinvoicelayout={setinvoicelayout}
                                          isRoundedOffNegative={calculateRoundOff() >= 0 ? 0 : 1}
                                          rounded_off={calculateRoundOff()}
                                          invoiceButtonDisable={invoiceButtonDisable}
                                          formStatus={props.status}
                                          pageType={props.pageType}
                                      />
                                  ) : (
                                      <Button
                                          variant="contained"
                                          color="primary"
                                            onClick={() => setReturnConfirmOpen(true)}
                                          disabled={sales_items.some(item =>
                                            (item.is_serialized === 1 && normalizeQuantity(item.quantity) > 0 && item.lots.length === 0) ||
                                            (item.is_serialized === 0 && normalizeQuantity(item.quantity) <= 0)
                                          )}
                                      >
                                          {returnSubmitting ? 'Processing...' : 'return'}
                                      </Button>
                                  )
                              }
                          </Grid>

                          <ItemPopup
                              cancelref={() => {}}
                              open={row_id.open}
                              returnState={props.returnState}
                              status={row_id.status}
                              setitemsData={setSalesItems}
                              handleClose={handleItemPopUpClose}
                              itemsData={sales_items}
                              row_id={row_id}
                              product={productByType}
                              sale_status = {dcchallan}
                              location_id={formValues.location_id}
                              sale_id={formValues.sale_id}
                              dc_id={formValues.dc_id}
                              calledfrom={props.returnState && formValues.dc_id ? 'dc_return' : formValues.sale_status === 2 && !props.returnState ? 'direct_invoice' : 'sales_return'}
                          />
                      </Grid>
                  </Grid>
              </Grid>
          </Card>
          {
              dublicateLotVisible.length > 0 ? (
                  <DublicateLotList
                      data={dublicateLotVisible}
                      dublicateItem={dublicateItemPopup}
                      handleClose={setDublicateLot}
                  />
              ) : (
                  ''
              )
          }
          {
              filterOpen === true && 
              <CommonImport
                  handleClose={handleUploadOpen}
                  open={filterOpen}
                  encodeImageFileAsURL ={encodeImageFileAsURL}
                  exportSample={()=>{}}
                  headers={[]}
                  data={[]} 
                  sampleDownloadButtonName={'Here'} 
                  type='sale'                    
              />
          }
          <MissingProduct
              open={mOpen}
              handleClose={productClose}
              wOutItemId={dataApi}
              setDataApi={setDataApiFromMissingProduct}
              bulkApiCreate={bulkApiCreate}
              from='salesUpload'
          />
          {
              openAlert === true && (
                  <AlertDialogSlide
                      setOpenAlert={(data) => setOpenAlert(data)}
                      duplicateLotNumber={duplicateLot}
                      productOutOfStock={productOutOfStock}
                      setValidationToDefault={() => {
                          setDuplicateLot([])
                          setProductOutOfStock([])
                      }}
                  />
              )
          }
          <Dialog 
              open={openDialog} 
              onClose={handleCloseDialog} 
              maxWidth="md" 
              fullWidth
          >
              <DialogTitle>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                      <span>Select Shipping Address</span>
                      <IconButton onClick={() => { setEditShippingMode(false); setShippingOpen(true) }} size="small">
                          <AddIcon />
                      </IconButton>
                  </Box>
              </DialogTitle>
            
              <DialogContent>
                  {
                      cusArray?.length > 0 ? (
                      cusArray
                          .filter(customer => customer.customer_id === formValues.customer_id)
                          .map((customer, index) => {
                              const shippingList = customer.shipping_address || [];
                              const primaryShippingList = [
                                  {
                                      shipping_id : null,
                                      company_id : customer.company_id,
                                      company_name : customer.company_name,
                                      contactperson_name : customer.first_name + (customer.last_name ? ` ${customer.last_name}` : ""),
                                      contactperson_num : customer.phone_number,
                                      Gst : customer.gst_type,
                                      address : customer.address,
                                      latitude : customer.latitude,
                                      longitude : customer.longitude,
                                      area : customer.area,
                                      city : customer.city,
                                      state : customer.state,
                                      pin_code : customer.zip,
                                      country : customer.country,
                                      deleted : 0,
                                      createdAt : customer.createdAt,
                                      updatedAt : customer.updatedAt,
                                      createdBy : customer.createdBy,
                                      updatedBy : customer.updatedBy,
                                      customer_id : customer.customer_id,
                                      zip : customer.zip
                                  }
                              ]
              
                              const hasPrimary = !!customer.address
                              const hasShipping = shippingList.length > 0
                              return hasPrimary || hasShipping ? (
                                  <TableContainer
                                      key={index}
                                      sx={{
                                          maxHeight: 360,
                                          border: '1px solid #ccc',
                                          borderRadius: 1,
                                          boxShadow: 1,
                                          overflowY: 'auto'
                                      }}
                                  >
                                      <Table stickyHeader size="small">
                                          <TableHead>
                                              <TableRow>
                                                  <TableCell>Select</TableCell>
                                                  <TableCell>Company Name</TableCell>
                                                  <TableCell>Address</TableCell>
                                                  <TableCell>Address Type</TableCell>
                                                  <TableCell>Actions</TableCell>
                                              </TableRow>
                                          </TableHead>
                                          <TableBody>
                                          {
                                              hasPrimary && (
                                                  <TableRow>
                                                      <TableCell>
                                                          <Checkbox
                                                              checked={selectedAddress === null || selectedAddress?.id === customer.id}
                                                              onChange={() => handleSelectAddress(customer)}
                                                          />
                                                      </TableCell>
                                                      <TableCell>{customer.company_name || '-'}</TableCell>
                                                      <TableCell>{`${customer.address} ${customer.city || ''}, ${customer.state || ''} - ${customer.pin_code || ''}`}</TableCell>
                                                      <TableCell>Primary</TableCell>
                                                      <TableCell>
                                                          <IconButton onClick={() => handleEditShipping(customer, 0, primaryShippingList)}>
                                                              <EditIcon />
                                                          </IconButton>
                                                      </TableCell>
                                                  </TableRow>
                                              )
                                          }
                          
                                          {
                                              hasShipping && shippingList.map((address, addrIndex) => (
                                                  <TableRow key={addrIndex}>
                                                      <TableCell>
                                                          <Checkbox
                                                              checked={selectedAddress?.shipping_id === address.shipping_id}
                                                              onChange={() => handleSelectAddress(address)}
                                                          />
                                                      </TableCell>
                                                      <TableCell>{address.company_name || '-'}</TableCell>
                                                      <TableCell>{`${address.address} ${address.city}, ${address.state} - ${address.pin_code}`}</TableCell>
                                                      <TableCell>Additional</TableCell>
                                                      <TableCell>
                                                          <IconButton onClick={() => handleEditShipping(address, addrIndex, shippingList)}>
                                                              <EditIcon />
                                                          </IconButton>
                                                      </TableCell>
                                                  </TableRow>
                                              ))
                                          }
                                          </TableBody>
                                      </Table>
                                  </TableContainer>
                              ) : (
                                  <Typography key={index} color="textSecondary">
                                      No shipping address available
                                  </Typography>
                              )
                          })
                      ) : (
                          <Typography color="textSecondary">
                              No customer data available
                          </Typography>
                      )
                  }
              </DialogContent>
          
              <DialogActions>
                    <Button onClick={handleSubmitSelectAddress} variant="contained" color="primary">
                        Submit
                    </Button>
                  <Button onClick={handleCloseDialog} color="primary">
                      Cancel
                  </Button>
              </DialogActions>
          </Dialog>
          <Dialog open={returnConfirmOpen} onClose={() => setReturnConfirmOpen(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Confirm Sales Return</DialogTitle>
              <DialogContent>
                  <DialogContentText>
                      {(() => {
                          const base = untaxed(null, formValues.discount_value) > 0
                              ? floatnum((untaxed(null, formValues.discount_value) + untaxed('taxes', formValues.discount_value) + tcsuntaxed('taxes')) - calculatetdsTaxAmount() + Number(formValues.shipping_charges ?? 0) + Number(formValues.other_charges ?? 0))
                              : 0
                          const roundedEnabled = props.appConfigData?.roundedOffEnabled === 'true'
                          const displayTotal = roundedEnabled ? Math.round(base) : base
                          const totalStr = roundedEnabled ? String(displayTotal) : Number(displayTotal).toFixed(2)
                          const totalQty = sales_items.reduce((sum, it) => sum + Number(it.quantity || 0), 0)
                          const serialCount = sales_items.reduce((sum, it) => sum + (it.is_serialized === 1 ? (it.lots?.length || 0) : 0), 0)
                          return (
                              <>
                                  Create credit note for &#8377;{totalStr}?
                                  <br />This will:
                                  <br />&bull; Credit customer ledger by &#8377;{totalStr}
                                  <br />&bull; Return {totalQty} item(s) to inventory
                                  {serialCount > 0 && (<><br />&bull; Reverse {serialCount} serial number(s)</>)}
                              </>
                          )
                      })()}
                  </DialogContentText>
              </DialogContent>
              <DialogActions>
                  <Button onClick={() => setReturnConfirmOpen(false)}>Cancel</Button>
                  <Button
                      variant="contained"
                      color="primary"
                      disabled={returnSubmitting}
                      onClick={() => {
                          if (submittingRef.current) return
                          setReturnConfirmOpen(false)
                          formValues.sale_status === 8 ? dcreturnFunc() : returnFunc()
                          if (typeof setinvoicelayout === 'function') {
                              setinvoicelayout(false)
                          }
                      }}
                  >
                      {returnSubmitting ? 'Processing...' : 'Confirm Return'}
                  </Button>
              </DialogActions>
          </Dialog>
          <Dialog open={editOpen} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
              <DialogTitle>Edit Credit Days</DialogTitle>
              <DialogContent>
                  <TextField
                      fullWidth
                      label="Credit Days"
                      type="number"
                      variant='filled'
                      value={dueDaysInput}
                      onChange={(e) => setDueDaysInput(e.target.value)}
                      InputLabelProps={{
                          shrink: true,
                      }}
                  />
              </DialogContent>
              <DialogActions>
                  <Button onClick={handleCloseEdit}>Cancel</Button>
                  <Button disabled={dueDaysInput === '' || dueDaysInput === null} onClick={(e) => handleSave(e, 'CreditDays')} variant="contained" color="primary">
                      update
                  </Button>
              </DialogActions>
          </Dialog>
          <Dialog open={editCreditDaysValueOpen} onClose={handleCloseCreditDaysValueEdit} maxWidth="sm" fullWidth>
              <DialogTitle>Edit Credit Days Value</DialogTitle>
              <DialogContent>
                  <TextField
                      fullWidth
                      label="Credit Days Value"
                      type="number"
                      variant='filled'
                      value={dueDaysValueInput}
                      onChange={(e) => setDueDaysValueInput(e.target.value)}
                      InputLabelProps={{
                          shrink: true,
                      }}
                  />
              </DialogContent>
              <DialogActions>
                  <Button onClick={handleCloseCreditDaysValueEdit}>Cancel</Button>
                  <Button disabled={dueDaysValueInput === '' || dueDaysValueInput === null} onClick={(e) => handleSave(e, 'CreditDaysValue')} variant="contained" color="primary">
                      update
                  </Button>
              </DialogActions>
          </Dialog>
          <CancelDialog
              handle={props.page !== 'soTracking' && cancel}
              delete={dialog}
              close={() => {setRequest(false); props.handleClose();}}
          >
          </CancelDialog>
          <Dialog open={viewSerialNumberOpen} onClose={() => setViewSerialNumberOpen(false)}>
              <DialogTitle>
                  <Grid container display='flex' justifyContent='space-between' alignItems='center'>
                      <Grid>
                          <Typography variant='h6' textAlign='center'>Serial Numbers</Typography>
                      </Grid>

                      <Grid>
                          <IconButton onClick={() => setViewSerialNumberOpen(false)}>
                              <CloseIcon />
                          </IconButton>
                      </Grid>
                  </Grid>
              </DialogTitle>
          
              <DialogContent>
                  <Table>
                      <TableHead>
                          <TableRow>
                              <TableCell>S.No</TableCell>
                              <TableCell>Serial Number</TableCell>
                          </TableRow>
                      </TableHead>
      
                      <TableBody>
                          {
                              viewSerialNumber.length > 0 ? 
                                  viewSerialNumber.map(lot => (
                                      <TableRow key={lot.sNo}>
                                          <TableCell style={{textAlign: 'center'}}>{lot.sNo}</TableCell>
                                          <TableCell style={{textAlign: 'center'}}>{lot.lotNumber}</TableCell>
                                      </TableRow>
                                  )) : 
                                  <TableRow>
                                      <TableCell colSpan={2} style={{textAlign: 'center'}}>No Records</TableCell>
                                  </TableRow>
                          }
                      </TableBody>
                  </Table>
              </DialogContent>
          </Dialog>
          <Dialog open={deleteDilaog}>
              <DialogContent style={{ width : 500 }}>
                  <DialogContentText>
                      Are you sure want to delete the product ?
                  </DialogContentText>
              </DialogContent>

              <DialogActions>
                  <Button variant='contained' color='error' onClick={handleDeleteDialogClose}>Cancel</Button>
                  <Button variant='contained' color='error' onClick={() => deleteProductRowData(deleteIndex)}>Delete</Button>
              </DialogActions>
          </Dialog>
          <Dialog open={editSalesManOpen} onClose={editSalesManOpen === false} maxWidth="sm" fullWidth>
              <DialogTitle>Edit SalesMan</DialogTitle>

              <DialogContent>
                  <FormControl
                      fullWidth
                      // required
                      error={!!formErrors.sales_man}
                      component="fieldset"
                      variant="filled"
                  >
                      <InputLabel>Sales Man</InputLabel>
                      <Select
                          style={{ marginBottom : '-4px' }}
                          name="sales_man"
                          label="Sales Man"
                          onChange={(e) => handleSalesmanChange(e.target.value)}
                          value={
                                  salesMan?.id ??
                                  formValues?.sales_man?.id ??
                                  formValues?.salesman_id ??
                                  ''
                          }
                      >
                          {
                              customer_salesman?.sales_man_list?.map((s) => (
                                  <MenuItem value={s.employee_id} key={s.id}>
                                      {s.username}
                                  </MenuItem>
                              ))
                          }
                      </Select>

                      <FormHelperText>
                          {formErrors.sales_man ? 'Sales Man is required!' : ''}
                      </FormHelperText>
                  </FormControl>
              </DialogContent>

              <DialogActions>
                  <Button onClick={()=> {
                      setEditSalesManOpen(false)
                      setSalesMan({ id : null, value : null })
                  }}>Cancel</Button>
                  <Button disabled={!salesMan?.id && !formValues?.sales_man?.id && !formValues?.salesman_id} onClick={(e) => handleSave(e, 'salesman')} variant="contained" color="primary">update</Button>
              </DialogActions>
          </Dialog>
          <Dialog open={addressDialog}>
              <DialogTitle>Action Required</DialogTitle>
          
              <DialogContent>
                  <Typography>
                      {`The customer's shipping address is missing. Would you like us to use the address from the customer's GST details instead ?`}
                  </Typography>
              </DialogContent>
          
              <DialogActions>
                  <Button 
                      onClick={async() => {handleSubmit((data) => setButton(data), true)}} 
                      color="primary" 
                      variant="contained"
                  >
                      OK
                  </Button>

                  <Button 
                      onClick={() => {setAddressDialog(false)}} 
                      color="secondary" 
                      variant="contained"
                  >
                      Cancel
                  </Button>
              </DialogActions>
          </Dialog>
          <Dialog open={customerSelectionDialogOpen} onClose={() => setCustomerSelectionDialogOpen(false)}>
              <DialogTitle>Action Required</DialogTitle>

              <DialogContent>
                  <Typography>
                      Due Days Exceeds.You are not allowed to create an Invoice.<br />
                      Only Sale Orders are allowed.<br />
                      Are you sure you want to continue?
                  </Typography>
              </DialogContent>

              <DialogActions>
                  <Button 
                      onClick={async () => {
                          setFormValues(prevValues => ({
                              ...prevValues,
                              sale_status: 1,
                          }));
                          await setCustomerSelectionDialogOpen(false)
                      }} 
                      color="primary" 
                      variant="contained"
                  >
                      OK
                  </Button>

                  <Button 
                      onClick={() => {
                          setCustomerSelectionDialogOpen(false);
                          props.handleClose()
                      }} 
                      color="secondary" 
                      variant="contained"
                  >
                      Cancel
                  </Button>
              </DialogActions>
          </Dialog>
          <Dialog open={saleItemsResetConfirmationDialog} onClose={() => setSaleItemsResetConfirmationDialog(false)}>
              <DialogTitle>Change Location?</DialogTitle>

              <DialogContent>
                  <Typography>
                      Changing the location will reset all the selected sales items.
                      <br/>
                      Do you want to proceed?
                  </Typography>
              </DialogContent>

              <DialogActions>
                  <Button 
                      onClick={async () => {
                          setSalesItems([tempInsert])
                          setSaleItemsResetConfirmationDialog(false)
                      }} 
                      color="primary" 
                      variant="contained"
                  >
                      OK
                  </Button>

                  <Button 
                      onClick={() => {
                          setSaleItemsResetConfirmationDialog(false)
                          setFormValues((prev) => ({ ...prev, location_id: oldLocationId }))
                          setHeaderLocationIdHandeler(oldLocationId)
                      }} 
                      color="secondary" 
                      variant="contained"
                  >
                      Cancel
                  </Button>
              </DialogActions>
          </Dialog>
      </>
  );
}

export default NewSalesForm

function Tables({data, tableName}) {
    const tableNameList = {
        productMisMatch : 'Some products Mis Matched',
        duplicateLot : 'Duplicate Lot number',
        productOutOfStock : 'Some products Out of Stock',
        duplicateLotInDb : 'Product has duplicate Lot Number in Uploaded file',
        lotAlreadyExistInDb : 'Lot number already exist in Database'
    }
    return (
        <Grid style={{ margin : '10px', width :'65vh' }}>
            <Typography variant='h6' pb={1}>
                {tableNameList[tableName]}
            </Typography>

            <table
                style={{
                    border : '1px solid',
                    fontSize : cellStyle.fontSize ,
                    borderCollapse : 'collapse',
                    padding : '0px 5px',
                    width : '100%',
                    paddingBottom : '10px'
                }}
            > 
                <tr>
                    <th style={{ border : '1px solid', width :'60%' }}>Product Name</th>
                    <th style={{ border : '1px solid', width :'40%' }}>Lot Number / Qty</th>
                </tr>

                {
                    data.map((d, i) => (
                        <tr key={i}>
                            <td style={{ border : '1px solid', padding : '0px 5px' }}>
                                {d.name}
                            </td>

                            {
                                d.uploadQty ? (
                                    <td style={{ border : '1px solid', padding : '0px 5px' }}>
                                        Uploaded Qty
                                        <span style={{ fontWeight : 'bold' }}>({d.uploadQty})</span> is
                                        more than actual qty
                                        <span style={{ fontWeight : 'bold' }}>({d.actualQty})</span>
                                    </td>
                                ) : (
                                    <td style={{ border : '1px solid', padding : '0px 5px' }}>
                                        {d.lot}
                                    </td>
                                )
                            }
                        </tr>
                    ))
                }
            </table>
        </Grid>
    )
}
