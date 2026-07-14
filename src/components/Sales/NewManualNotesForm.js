import React, { useContext, useEffect, useRef, useState } from 'react'
import UnSavedChangesWarning from 'pages/common/unChangeswarning'
import { Autocomplete, Box, Button, Card, ClickAwayListener, Dialog, DialogActions, DialogContent, DialogContentText, Divider, FormControl, FormControlLabel, Grid, Icon, IconButton, MenuItem, Radio, RadioGroup, Select, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material'
import { maxHeight } from 'utils/pageSize'
import { useDispatch, useSelector } from 'react-redux'
import { getSchemesLedgerAction, sequenceAction } from 'redux/actions/manualNotes_actions'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import moment from 'moment'
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { customerAsCompanyAction, getCustomerSupplierDataByIdAction, getSearchByCustomerSupplierAction, getSearchByCustomerSupplierDataAction, setSearchByCustomerSupplierDataAction } from 'redux/actions/customer_actions'
import { GetTdsTaxes, listPurchasesPaginateAction, returnActions } from 'redux/actions/purchase_actions'
import AddIcon from '@mui/icons-material/Add'
import NewLedger from 'components/Ledger'
import CancelDialog from 'components/CancelDialog'
import { createLedgerAction, updateLedgerAction } from 'redux/actions/ledger_actions'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import DeleteIcon from '@mui/icons-material/Delete'
import { OpenalertActions } from 'redux/actions/alert_actions'
import { requiredFieldsAlertMessage, searchErrorMessage } from 'utils/content'
import { getTrimmedData } from 'components/trimFunction'
import { getAppConfigDataBasedOnTypeAction } from 'redux/actions/app_config_actions'
import  Popup  from '../../pages/sales/purchases/Popup'
import PurchaseReturn from '../../pages/sales/purchases/PurchaseReturn'
import ManualDebitNote from '../../pages/sales/manualNotes/ManualDebitNote'
import _, { set } from 'lodash'
import apiCalls from 'utils/apiCalls'
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import toMomentOrNull from 'utils/DateFixer'

const NewManualNotesForm = (props) => {
    
    const dispatch = useDispatch()
    const [Prompt, setDirty, setPristine] = UnSavedChangesWarning()
    const tempinitsform = useRef(null)
    const tempinits = useRef(null)
    const [regex] = useState({})
    const tempedits = useRef(null)

    const {
        commoncookie, headerLocationId,
        setModalTypeHandler,
        setLoaderStatusHandler
    } = useContext(CreateNewButtonContext)

    const [formValues, setFormValues] = useState({
        customer_id: null,
        supplier_id: null,
        type: props.from,
        tds_amount: null,
        Reference: null,
        date: moment(new Date()).format('DD/MM/YYYY'),
        comments: null,
        manualNotes: [],
        note: null,
        rounded_off: null,
        location_id: null,
        manual_tds_amount : null
    })

    const [creditNote,setCreditNote] = useState(true)
    const [existingData,setExistingData] = useState([])
    const [customerSearchText, setCustomerSearchText] = useState('')

    const [formErrors, setFormErrors] = useState({
        location_id: null,
        customer_id: null,
        supplier_id: null,
        type: null,
        hsn_code: null,
    })

    const [editDate, setEditDate] = useState(false)
    const [hoverDate, setHoverDate] = useState(false)
    const [rowData, setRowData] = useState([])
    const [ledgerCreateOpen, setLedgerCreateOpen] = useState(false)
    const [gst, setgst] = useState(false)
    const [tds, settds] = useState(false)
    const [dialog, setDialog] = useState(false)
    const [deleteDilaog, setDeleteDialog] = useState(false)
    const [deleteIndex, setDeleteIndex] = useState(0)
    const [form, setForm] = useState(false)
    const [initialState, setInitialState] = useState({})
    const [editRoundOff, setEditRoundOff] = useState(false)
    const [hoverRoundOff, setHoverRoundOff] = useState(false)
    const [activeType, setActiveType] = useState('customer_id')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showIGST, setShowIGST] = useState(false)
    const [manualValue, setManualValue] = useState(props.openType);
    const [supplier,setsupplier] = useState(null);
    const [billnumber,setBillnumber] = useState(null);
    const [appConfigData, setAppConfigData] = useState({});
    const [status, setStatus] = useState('');
    const [open, setOpen] = useState(false);
    const [rowPopup, setRowPopup] = useState({ open: false });

    const {
        manualNoteReducer: { sequence, schemesLedger },
        customerReducer: { customerAsCompany },
        purchasesReducer: { tds_taxrate ,purchasesByPagination},
        stockLedgerReducer: { stock_ledger_list },
        stockLocationReducer: { stocklocation },
        appConfigReducer: { app_config_data_based_on_type }

    } = useSelector((state) => state)

    const sequenceName = props.from === 'C' ? 'CREDIT NOTE SEQUENCE' : 'DEBIT NOTE SEQUENCE'
    const sequenceNo = sequence?.find((d) => d.sequence_name === sequenceName)
    const sequence_value = (sequenceNo?.current_seq || 0)
    const currentDateForSequence = moment()
    const fiscalYearStart = currentDateForSequence.month() >= 3 ? currentDateForSequence.year() : currentDateForSequence.year() - 1
    const fiscalYear = `${String(fiscalYearStart).slice(-2)}-${String(fiscalYearStart + 1).slice(-2)}`
    const sequence_number = props.status === 'edit' ? props.edit_id_data[0].sequence_number : `${sequenceNo?.short_code || ''}/${fiscalYear}/${sequence_value + 1}`

    const [requiredFields, setRequiredFields] = useState([
        'customer_id',
        'supplier_id',
    ])

    const [gsttypes, setGsttypes] = useState([
        // { id: 0, name: "0%" },
        { id: 5, name: "5%" },
        { id: 12, name: "12%" },
        { id: 18, name: "18%" }
    ])

    const fieldLabels = {
        supplier_id: "Supplier",
        customer_id: "Customer",
    }

    const tempInsert = {
        schemesLedgerId: '',
        description: '',
        hsn_code: '',
        amount: '',
        gst: false,
        gst_amount: 0,
        gst_id: '',
        sub_total: ''
    }

   useEffect(() => {
    const load = async () => {
        let data1 = {
            type: props.from === 'D' ? 'Debit' : 'Credit'
        }
        await dispatch(sequenceAction())
        dispatch(getSchemesLedgerAction(data1))
        !tds_taxrate?.length && dispatch(GetTdsTaxes('list','null'))
        dispatch(getAppConfigDataBasedOnTypeAction('sales'))
        dispatch(setSearchByCustomerSupplierDataAction([]))
    };
    load();
}, [])

    
    useEffect(() => {
        if (props.status !== 'edit') {
            setFormValues((prev) => ({ ...prev, manualNotes: [tempInsert] }))
        }
    }, [props.status])

    const initsform = () => {
        setInitialState(formValues);
    };

    tempinitsform.current = initsform

    useEffect(() => {  
        tempinitsform.current()
    }, [])

    useEffect(() => {
      const type = formValues.type === 'C' ? 'Customer' : 'Supplier'
      const customerSupplierId = formValues.type === 'C' ? props.edit_id_data[0]?.customer_id : props.edit_id_data[0]?.supplier_id
      if(props.status === 'edit') {
        dispatch(getCustomerSupplierDataByIdAction(type, customerSupplierId, async (response) => {
          const res = await response
          if(res?.length > 0) {
            const customerSupplierRes = res?.[0]
            setFormValues((prev) => ({
              ...prev,
              ...customerSupplierRes
            }))
          }
        }))
      }
    }, [props.status])

  useEffect(() => {
  if (headerLocationId && props.status !== 'edit' && Array.isArray(stocklocation)) {
    const matchedLocation = stocklocation.find(
      (loc) => loc.location_id === headerLocationId
    );

    if (matchedLocation && formValues.location_id !== headerLocationId) {
      setFormValues((prev) => ({
        ...prev,
        location_id: headerLocationId,
      }));
    }
  }
}, [headerLocationId, props.status, stocklocation]);


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

    tempinits.current = inits

    useEffect(() => {
        tempinits.current()
    }, [formValues, initialState])

    const handleChange = async (e) => {
        let { name, value } = e.target
        setStateHandler(name, value)
    }

    const setStateHandler = (name, value) => {
        let formObj = {}
        formObj = {
            ...formValues,
            [name]: value === '' ? null : value
        }

        setFormValues(formObj)
        validationHandler(name, value)
    }

    const validationHandler = (name, value) => {
        if (!Object.keys(formErrors).includes(name)) return

        if (requiredFields.includes(name) && (value === null || value === 'null' || value === '' || value === false || (Object.keys(value) && value.value === null))) {
            const fieldLabel = fieldLabels[name] || capitalize(name)
            setFormErrors({
                ...formErrors,
                [name]: `${fieldLabel} is required!`
            })
        }
        else {
            setFormErrors({
                ...formErrors,
                [name]: null,
            })
        }
    }

    const capitalize = (s) => {
        if (typeof s !== 'string') return ''
        return s.charAt(0).toUpperCase() + s.slice(1)
    }

    const validateServiceHsnCode = (value, isGstApplicable = false) => {
        const normalized = `${value ?? ''}`.trim()
        if (!normalized) {
            return isGstApplicable ? 'HSN/SAC is Required for GST notes!' : null
        }
        if (!/^\d{4}(\d{2}(\d{2})?)?$/.test(normalized)) {
            return 'Enter valid HSN/SAC code (4, 6, or 8 digits)'
        }
        // Services HSNs start with 99 — the backend rejects these for Manual
        // Credit/Debit Notes with a silent 400. Catch it here so the user sees
        // a clear reason before Submit.
        if (/^99/.test(normalized)) {
            return 'HSN must be a Goods code (must not start with 99 — Services).'
        }
        return null
    }

    const cancel = () => {
        setDialog(false)
    }

    const validClose = () => {
        setDialog(true)
    }

    const handleDeleteDialogOpen = (index) => {
        setDeleteDialog(true)
        setDeleteIndex(index)
    }

    const handleDeleteDialogClose = () => {
        setDeleteDialog(false)
    }

    const deleteLedgerRowData = async (index) => {
        if (formValues.manualNotes.length > 1) {
            const updatedTransaction = [...formValues.manualNotes]
            updatedTransaction.splice(index, 1)
            await setFormValues((prev) => ({ ...prev, manualNotes: updatedTransaction }))
            setDeleteDialog(false)
        }
    }

    const calculateUntaxedAmount = () => {
        const totalAmount = formValues.manualNotes.reduce((sum, item) => {
            return sum + (Number(item?.amount) || 0)
        }, 0)
        return totalAmount
    }

    const calculateHalfGST = () => {
        const totalGST = formValues.manualNotes.reduce((sum, item) => {
            return sum + (Number(item?.gst_amount) || 0)
        }, 0)
        return totalGST / 2
    }

    const calculateIGST = () => {
        const totalGST = formValues.manualNotes.reduce((sum, item) => {
            return sum + (Number(item?.gst_amount) || 0)
        }, 0)
        return totalGST
    }

   // console.log('formValues.manualNotes', formValues.manualNotes)
    const calculateSubTotal = () => {
        return formValues.manualNotes.reduce((sum, item) => {
            return sum + (Number(item?.sub_total) || 0)
        }, 0)
    }

    const tdsRate = parseFloat(formValues.tds_amount?.tds_rate) || 0
    const tdsAmount = formValues.tds_amount?.category === 'Others' ? formValues.manual_tds_amount : Number(((calculateUntaxedAmount() * tdsRate) / 100).toFixed(2))

    const round2 = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

    const calculateRoundOff = () => {

        const totalGST = formValues.manualNotes.reduce((sum, item) => {
            return sum + (Number(item?.gst_amount) || 0)
        }, 0)
        
        let sub_value =  formValues.manualNotes.reduce((sum, item) => {
            return sum + (Number(item?.amount) || 0)
        }, 0)

        let totalgst1 = showIGST ? Number(calculateIGST().toFixed(2)) : Number(calculateHalfGST().toFixed(2)) + Number(calculateHalfGST().toFixed(2))
        let subvalue = sub_value.toFixed(2)

        const totalGST2 = round2(Number(totalgst1))
        const subValue2 = round2(Number(subvalue))
        const finalTotal = round2(totalGST2 + subValue2 - tdsAmount);
  
    // Fix floating point noise (force 2 decimal precision first)
        const roundedTotal = Math.round(finalTotal)

    //const roundedTotal = Math.round(finalFixed);

    // Now compute accurate round-off
        const roundOff = round2(roundedTotal - finalTotal)

        return roundOff;

        // const total = formValues.manualNotes.reduce((sum, item) => {
        //     return sum.plus(new Decimal(item.sub_total || 0));
        // }, new Decimal(0));

        // const finalTotal = total.minus(new Decimal(tdsAmount || 0));

        // const rounded = finalTotal.toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
        // const diff = rounded.minus(finalTotal);
        // console.log('calculatevalue', diff, rounded, finalTotal)

        // return diff.toDecimalPlaces(2).toNumber();

    }

    const handleSubmit = async (event) => {

        event.preventDefault()

        if(isSubmitting) return
        setIsSubmitting(true)

        let isValid = true
        let formErrorsObj = { ...formErrors }

        const updatedRequiredFields = formValues.type === 'C' ? ['customer_id', 'location_id'] : ['supplier_id', 'location_id']
        setRequiredFields(updatedRequiredFields)

        Object.keys(formValues).forEach((key) => {
            if (updatedRequiredFields.includes(key) && (formValues[key] === null || formValues[key] === '')) {
                isValid = false
                formErrorsObj[key] = capitalize(key) + 'is Required!'
            }
            else if (regex[key] && !regex[key].test(formValues[key])) {
                isValid = false
                formErrorsObj[key] = capitalize(key) + 'is Invalid!'
            }
        })

        if (formValues.type === 'C' && !formValues.customer_id) {
            isValid = false;
            formErrorsObj.customer_id = 'Customer is Required!'
        }
        if (formValues.type === 'D' && !formValues.supplier_id) {
            isValid = false;
            formErrorsObj.supplier_id = 'Supplier is Required!'
        }

        const isGstApplicable = Boolean(formValues?.manualNotes?.[0]?.gst_id)
        const hsnCodeError = validateServiceHsnCode(formValues?.manualNotes?.[0]?.hsn_code, isGstApplicable)
        if (hsnCodeError) {
            isValid = false
            formErrorsObj.hsn_code = hsnCodeError
        } else {
            formErrorsObj.hsn_code = null
        }
        
        setFormErrors(formErrorsObj);

        let creaditNote = []
        if (props.status !== 'edit') {
            const noteType = formValues.type === "D" ? "Debit Note" : "Credit Note";
            creaditNote.push(`${noteType} ₹${(calculateSubTotal() + parseFloat(formValues.rounded_off || 0) - tdsAmount).toFixed(2)} recorded under '${formValues.manualNotes[0].name}' – ${formValues.manualNotes[0].id !== "" ? 'Inclusive of GST' : ' GST Not Applicable'}. GST @ ${formValues.manualNotes[0].gst_id}% | Subtotal: ₹${formValues.manualNotes[0].sub_total}`)
        }

        console.log(props.status === 'edit' , Array.isArray(existingData) , existingData,'sfsdfsdf6565')

        if (props.status === 'edit' && Array.isArray(existingData) && existingData.length > 0) {
            console.log('sdfdsfdsfsdfs')
            if (existingData[0]?.manualNotes?.[0]?.schemesLedgerId !== formValues.manualNotes?.[0]?.schemesLedgerId) {
                creaditNote.push(
                    `Schemes Ledger has been updated`
                )   
            }

            if (existingData[0]?.manualNotes?.[0]?.description !== formValues.manualNotes?.[0]?.description) {
                console.log('workinggg')
                creaditNote.push(
                    `Description has been modified `
                )
            }
            if (existingData[0]?.manualNotes?.[0]?.amount !== formValues.manualNotes?.[0]?.amount) {
                creaditNote.push(`Amount has been updated`)
            }
            if (existingData.length > 0 && existingData[0]?.manualNotes?.[0]?.gst !== formValues.manualNotes?.[0]?.gst) {
                creaditNote.push(`GST has been modified `)
            }
            if (existingData.length > 0 && existingData[0]?.manualNotes?.[0]?.gst_id !== formValues.manualNotes?.[0]?.gst_id) {
                creaditNote.push(`Tax Percentage has been updated `)
            }

            if(existingData.length > 0 && existingData[0]?.manualNotes?.[0]?.sub_total !== formValues.manualNotes?.[0]?.sub_total ){
                creaditNote.push(`Total has been updated `)
            }

            if(existingData.length > 0 && existingData[0]?.note != formValues.note){
                creaditNote.push(`Notes has been modified `)
            }
           

        }


        if (isValid) {
            try {
                const data = {
                    customer_details: formValues.type === 'C' ? customerAsCompany.filter(i => i.customer_id === formValues.customer_id)[0] : null,
                    supplier_details: formValues.type === 'C' ? null : customerAsCompany.filter(i => i.supplier_id === formValues.supplier_id)[0],
                    // manualNotes : formValues.manualNotes,
                    tds_amount: formValues.tds_amount?.category === 'Others' ? formValues.manual_tds_amount : (calculateUntaxedAmount() * tdsRate) / 100 || null,
                    tds_id: parseFloat(formValues.tds_amount?.id) || null,
                    tds_percent: formValues.tds_amount?.category === 'Others' ? null : (formValues.tds_amount?.tds_rate ? `${parseFloat(formValues.tds_amount.tds_rate)}%` : null),
                    amount: (calculateSubTotal() + parseFloat(formValues.rounded_off || 0) - tdsAmount),
                    rounded_off: Number(formValues.rounded_off || 0),
                    schemesLedgerId: formValues.manualNotes[0].schemesLedgerId,
                    description: formValues?.manualNotes[0]?.description || null,
                    gst_amount: formValues?.manualNotes[0]?.gst_amount || null,
                    gst_id: formValues?.manualNotes[0]?.gst_id || null,
                    hsn_code: formValues?.manualNotes[0]?.hsn_code || null,
                    customer_id: formValues?.customer_id || null,
                    supplier_id: formValues?.supplier_id || null,
                    type: formValues.type,
                    Reference: formValues?.Reference || null,
                    date: formValues.date,
                    comments: formValues?.comments || null,
                    note: formValues?.note || null,
                    location_id: formValues?.location_id || null,
                    timelineData : creaditNote,
                    schemes_amount: formValues?.manualNotes[0]?.schemes_amount|| 0,
                    //name:formValues?.manualNotes[0]?.name
    
                }
                // Await so the submit button stays in "Submitting…" state until the
                // action resolves/rejects. Without await the parent's rejection
                // surfaced nowhere visible and users saw the button "do nothing".
                if (props.status !== 'edit') {
                    await props.handleSubmit(getTrimmedData(data))
                }
                else {
                    await props.handleSubmit(getTrimmedData({ ...data, id: props.edit_id_data[0].id, oldAmount: (props.edit_id_data[0].amount + props.edit_id_data[0].tds_amount) - ((props.edit_id_data[0]?.gst_amount || 0) + props.edit_id_data[0].rounded_off) }))
                }
            }
            catch(err) {
                // Backend validation (e.g. "HSN does not belong to Goods") bubbles
                // here as a rejected promise. The action already fires a toast via
                // commontoast/ErrorAlert, but we belt-and-suspenders with an
                // explicit one so a missed toast can never hide the failure.
                const apiMsg = err?.response?.data?.message || err?.response?.data?.iris?.message || (typeof err === 'string' ? err : null) || 'Failed to save credit/debit note'
                try { dispatch(OpenalertActions({ msg: apiMsg, severity: 'error' })) } catch(_) {}
                setIsSubmitting(false)
            }
            finally {
                setIsSubmitting(false)
            }
        }
        else {
            // console.log("Please Select Location!");
            // dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
            setIsSubmitting(false)
        }
    }

    const setCreatedDataInAutoComplete = (data) => {
        const nameEmptyIndex = formValues.manualNotes.findIndex(s => s.schemesLedgerId === '')
        if (nameEmptyIndex !== -1) {
            const updateLedger = formValues.manualNotes.map((s, i) => {
                if (i === nameEmptyIndex) {
                    return {
                        ...tempInsert,
                        schemesLedgerId: data[0].id,
                        description: data[0].description
                    }
                }
                else {
                    return s
                }
            })
            setFormValues((prev) => ({ ...prev, manualNotes: updateLedger }))
        }
    }

    const loadApi = () => {
        let data1 = { type: props.from === 'D' ? 'Debit' : 'Credit' }
        dispatch(getSchemesLedgerAction(data1, setCreatedDataInAutoComplete))
    }

    const ledgerSubmit = async (data) => {
        // Snapshot the parent form before any ledger-create side-effects. If the
        // dialog or its callbacks accidentally reset the parent form (observed
        // in testing — Customer/Location/Reference/Comments went blank after
        // picking a Parent Account), we restore from here.
        const preserved = {
            customer_id: formValues.customer_id,
            supplier_id: formValues.supplier_id,
            location_id: formValues.location_id,
            Reference: formValues.Reference,
            comments: formValues.comments,
            note: formValues.note,
            date: formValues.date,
            tds_amount: formValues.tds_amount,
            rounded_off: formValues.rounded_off,
        }
        try {
            if (data.id) {
                await dispatch(updateLedgerAction(
                    data.id,
                    data,
                    setModalTypeHandler,
                    setLoaderStatusHandler
                ))
            }
            else {
                const id = stock_ledger_list[0]?.sequence_id;
                const current_seq = stock_ledger_list[0]?.current_seq;

                await dispatch(createLedgerAction(
                    data,
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    id,
                    { current_seq }
                ))
            }
            setLedgerCreateOpen(false);
            loadApi();
        }
        catch (error) {
            console.error("Ledger submit failed:", error)
        }
        finally {
            // Re-merge the preserved parent-form fields in case anything nuked them.
            setFormValues((prev) => ({ ...prev, ...preserved }))
        }
    }

    useEffect(() => {
        const calculated = appConfigData.roundedOffEnabled ? parseFloat(calculateRoundOff().toFixed(2)) : 0
        if (calculated !== 0) {
            setFormValues(prev => ({
                ...prev,
                rounded_off: calculated
            }))
        }
        else {
            setFormValues(prev => ({ ...prev, rounded_off: null }))
        }
    }, [formValues.manualNotes, formValues.tds_amount, formValues.manual_tds_amount])

    const editValues = props.edit_id_data[0]
    const edits = () => {   
        if (props.edit_id_data[0] && props.status === 'edit') {
            const amount = (editValues.amount + editValues.tds_amount) - ((editValues?.gst_amount || 0) + editValues.rounded_off)
            const object = {
                schemesLedgerId : editValues.schemesLedgerId,
                description : editValues.description,
                hsn_code : editValues.hsn_code || '',
                amount : amount,
                gst : editValues.gst_id ? true : false,
                gst_amount : editValues.gst_amount,
                gst_id : editValues.gst_id,
                sub_total : amount + (editValues?.gst_amount || 0)
            }
            setInitialState(props.edit_id_data[0])
            if (editValues.type === 'C') {
                setActiveType('customer_id')
                setCustomerSearchText(editValues.name)
                setFormValues({
                    customer_id : editValues.customer_id,
                    supplier_id : editValues.supplier_id,
                    type : editValues.type,
                    tds_amount : tds_taxrate.find((d) => d.id === editValues.tds_id),
                    Reference : editValues.Reference,
                    date : moment(editValues.date).format('DD/MM/YYYY'),
                    comments : editValues.comments,
                    manualNotes : [object],
                    note : editValues.note,
                    rounded_off : editValues.rounded_off,
                    location_id : editValues.location_id,
                });
            } else if (editValues.type === 'D') {
                setActiveType('supplier_id')
                setCustomerSearchText(editValues.name)
                setFormValues({
                    customer_id : editValues.customer_id,
                    supplier_id : editValues.supplier_id,
                    type : editValues.type,
                    tds_amount : tds_taxrate.find((d) => d.id === editValues.tds_id),
                    Reference : editValues.Reference,
                    date : moment(editValues.date).format('DD/MM/YYYY'),
                    comments : editValues.comments,
                    manualNotes : [object],
                    note : editValues.note,
                    rounded_off : editValues.rounded_off,
                    location_id : editValues.location_id,
                })
            }

        }

    }

    tempedits.current = edits

    useEffect(() => {
        if (tds_taxrate.length > 0) {
            tempedits.current()
        }
    }, [props.edit_id_data, tds_taxrate])

    const disableLedger = formValues.manualNotes.some((item) => {
        const hsn = `${item?.hsn_code ?? ''}`.trim()
        const isGstApplicable = Boolean(item?.gst_id)
        return (
          item.schemesLedgerId === '' ||
          item.amount === '' ||
          (item.gst === true && item.gst_id === '') ||
          (isGstApplicable && !/^\d{4}(\d{2}(\d{2})?)?$/.test(hsn))
        )
    })

    console.log( formValues,'dsfdsdkdmvjdf',existingData)

    useEffect((e)=>{
        if(props.status === 'edit' && creditNote && (formValues.customer_id !== null || formValues.supplier_id !== null)){
            console.log(formValues,'formValuese5tfs')
            setExistingData([formValues])
            setCreditNote(false)
        }
    },[formValues])



// useEffect(() => {
//   const bill_number_APi = async () => {
//     const data = {
//       brand: '',
//       category: '',
//       location_id: 'null',
//       supplier_id: [formValues.supplier_id],
//       statusfilter: '',
//       max_price: '',
//       min_price: '',
//       product_name: '',
//       from: null,
//       to: null,
//       user_id: commoncookie,
//       pageCount: 0,
//       numPerPage: 20,
//       purchase_status: 'All',
//       searchString: '',
//       sub_company_id: 'All',
//     };
//     if (formValues.supplier_id) {
//         dispatch(
//           listPurchasesPaginateAction(
//             data,
//             commoncookie,
//             headerLocationId,
//             setModalTypeHandler,
//             setLoaderStatusHandler,
//           ),
//       );
//     }
//   };
//   bill_number_APi();
// }, [formValues.supplier_id]);

useEffect(() => {
  if (!app_config_data_based_on_type?.length) return;

  const getValue = (key) =>
    app_config_data_based_on_type.find(f => f.key_name === key)?.value || '';

  setAppConfigData({
    companyName: getValue('company.name'),
    companyAddress: getValue('address.fulladdress'),
    companyEmail: getValue('company.email'),
    gstin: getValue('company.gstin/uin'),
    companyMobile: getValue('company.mobile'),
    state: getValue('address.state'),
    roundedOffEnabled: getValue('company.applyRoundOff') || 'false',
  });

}, [app_config_data_based_on_type]);

const selectedSupplier =customerAsCompany.find((d) => d.supplier_id === formValues.supplier_id) || null;
const setAppconfigData = (data) => {
  setAppConfigData(prev => ({
    ...prev,
    ...data
  }));
};
const rowPopupOpen = () => {
  if (status === 'create') {
    setOpen(false);
    setRowPopup(prev => ({
      ...prev,
      open: false,
    }));
  } else {
    setOpen(false);
    setRowPopup(prev => ({
      ...prev,
      open: true,
    }));
  }
};

const handleCustomerSearchAPICall = (searchText) => {
  if(searchText.length >= 3) {
    const type = formValues.type === 'C' ? 'Customer' : 'Supplier'
    const payload = {
      searchString: searchText,
    }
    dispatch(getSearchByCustomerSupplierDataAction(payload, type))
    setCustomerSearchText('')
  }
  else {
    dispatch(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
  }
}

const handleCloseCustomerDetails = () => {
  setFormValues((prev) => ({...prev, customer_id: null}))
  setCustomerSearchText('')
  dispatch(setSearchByCustomerSupplierDataAction([]))
}

const handleAutoSearchApicall = (searchText) => {
  dispatch(setSearchByCustomerSupplierDataAction([]))
  const types = formValues.type === 'C' ? 'Customer' : 'Supplier'
  const payload = {
    searchString: searchText
  }
  dispatch(getSearchByCustomerSupplierAction(
    payload,
    types
  ))
}

const optionsList = ['Manual Debit Note', 'Purchase Return'];
const returnAction = (data,commoncookie,headerLocationId,setModalTypeHandler,setLoaderStatusHandler)=>{
  dispatch(returnActions(data,commoncookie,headerLocationId,setModalTypeHandler,setLoaderStatusHandler))
}
    return (
      <>
        {Prompt}
        {manualValue == 'manual' && props.from === 'D' && (
          <ManualDebitNote
            handleClose={props.handleClose}
            cnInvoiceFunction={props.cnInvoiceFunction}
            onRefreshList={props.onRefreshList}
            from={props.from}
            status={props.status}
            editData={props.edit_id_data}
          />
        )}
        {manualValue == 'manual' && props.from !== 'D' && (
          <Card
            sx={{
              p: 5,
              height: 'calc(100vh - 80px)',
              width: '100%',
              overflow: 'auto',
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
                    <Typography variant='h6'>
                      {props.status === 'edit'
                        ? props.from === 'D'
                          ? `Update Debit Note : ${sequence_number}`
                          : `Update Credit Note : ${sequence_number}`
                        : props.from === 'D'
                        ? `New Debit Note : ${sequence_number}`
                        : `New Credit Note : ${sequence_number}`}
                    </Typography>
                  </Grid>

                  <Grid
                    sx={{display: 'flex', justifyContent: 'flex-end'}}
                    size={{
                      lg: 3,
                      md: 3,
                      sm: 6,
                      xs: 6
                    }}>
                    {editDate ? (
                      <ClickAwayListener
                        onClickAway={() => {
                          setEditDate(false);
                          setHoverDate(false);
                        }}
                      >
                        <Box>
                          <LocalizationProvider dateAdapter={DateAdapter}>
                            <DatePicker
                              disableFuture
                              label='Date'
                              name='date'
                              format='DD/MM/YYYY'
                              value={
                              toMomentOrNull(formValues.date)}
                              inputVariant='contained'
                              onChange={(newValue) => {
                                const formattedDate =
                                  moment(newValue).format('DD/MM/YYYY');
                                setFormValues({
                                  ...formValues,
                                  date: formattedDate,
                                });
                              }}
                              slotProps={{ textField: { variant: 'filled' } }}
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
                          display: 'inline-block',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          borderRadius:
                            hoverDate && props.status !== 'edit'
                              ? '6px'
                              : '0px',
                          border:
                            hoverDate && props.status !== 'edit'
                              ? '1px solid #ccc'
                              : 'none',
                          backgroundColor:
                            hoverDate && props.status !== 'edit'
                              ? '#fff'
                              : 'transparent',
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        <Typography
                          variant='h6'
                          onClick={() => setEditDate(true)}
                        >
                          Date : {formValues.date ? formValues.date : null}
                        </Typography>
                      </Box>
                    )}
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
                      freeSolo={customerSearchText?.length <= 3}
                      disableClearable
                      inputValue={customerSearchText}
                      onInputChange={(event, newInputValue, reason) => {
                        if(reason === 'input') {
                          setCustomerSearchText(newInputValue)
                          if(newInputValue !== '') {
                            handleAutoSearchApicall(newInputValue)
                          }
                          if(newInputValue === '') {
                            setFormValues((prev) => ({...prev, customer_id: null}))
                            dispatch(setSearchByCustomerSupplierDataAction([]))
                          }
                        }
                      }}
                      id='multiple-limit-tags'
                      disabled={props.status === 'edit' ? true : false}
                      value={
                        !_.isEmpty(props.edit_id_data)
                          ? customerAsCompany.find((d) =>
                              formValues.type === 'C'
                                ? d.customer_id ===
                                  props.edit_id_data[0]?.customer_id
                                : d.supplier_id ===
                                  props.edit_id_data[0]?.supplier_id,
                            ) || null
                          // : customerSearchText
                          //   ? {company_name: customerSearchText}
                          : customerAsCompany.find((d) =>
                              formValues.type === 'C'
                                ? d.customer_id === formValues?.customer_id
                                : d.supplier_id === formValues?.supplier_id,
                            ) || null
                      }
                      options={
                        formValues.type === 'C'
                          ? customerAsCompany.filter(
                              (c) => c.company_name && c.customer_type === '1',
                            )
                          : customerAsCompany.filter((c) => c.supplier_id)
                      }
                      getOptionLabel={(option) => option.company_name}
                      onChange={(e, c) => {
                        const getState =
                          app_config_data_based_on_type?.find(
                            (d) => d.key_name === 'address.state',
                          ) || {};
                        setShowIGST(
                          !(
                            (getState?.value || '').toLowerCase() ===
                            (c?.state || '').toLowerCase()
                          ),
                        );
                        setStateHandler(
                          formValues.type === 'C'
                            ? 'customer_id'
                            : 'supplier_id',
                          c === null
                            ? null
                            : formValues.type === 'C'
                            ? c.customer_id
                            : c.supplier_id,
                        );
                        setCustomerSearchText(c?.company_name || '')
                      }}
                      renderOption={(props, option) => {
                        return (
                          <li {...props} key={option.person_id}>
                            {option.company_name}
                          </li>
                        );
                      }}
                      renderInput={(params) => {
                        const get = {...params}
                        let startAdornment = null
                        return (
                          <TextField
                            {...get}
                            fullWidth
                            required
                            variant='filled'
                            label={
                              formValues.type === 'C'
                                ? 'Select Customer'
                                : 'Select Vendor'
                            }
                            placeholder='Select Customer'
                            error={Boolean(
                              formValues.type === 'C'
                                ? formErrors.customer_id
                                : formErrors.supplier_id,
                            )}
                            helperText={
                              formValues.type === 'C'
                                ? formErrors.customer_id || ''
                                : formErrors.supplier_id || ''
                            }
                            slotProps={{
                              input: props.status !== 'edit' && {
                                ...get.InputProps,
                                startAdornment: startAdornment,
                                endAdornment: (
                                  <>
                                    {
                                      formValues.customer_id === null ?
                                      // <IconButton
                                      //   size='small'
                                      //   onClick={() => {
                                      //     handleCustomerSearchAPICall(customerSearchText)
                                      //   }}
                                      // >
                                      //   <SearchIcon />
                                      // </IconButton> 
                                      '' :
                                      <IconButton
                                        size='small'
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
                  </Grid>

                  <Grid
                    size={{
                      lg: 3,
                      md: 4,
                      sm: 6,
                      xs: 12
                    }}>
                    <Autocomplete
                      limitTags={2}
                      required={true}
                      fullWidth={true}
                      value={
                        stocklocation?.find(
                          (f) => f.location_id === formValues.location_id,
                        ) || null
                      }
                      id='multiple-limit-tags'
                      options={stocklocation?.filter((s) => {
                        const isScrap =
                          s.locationtypename?.toLowerCase() === 'scrap';

                        if (props.status !== 'edit') {
                          const headerMatch =
                            headerLocationId === 'null' ||
                            headerLocationId === s.location_id;
                          return !isScrap && headerMatch;
                        }

                        return !isScrap;
                      })}
                      getOptionLabel={(option) => option.location_name}
                      onChange={(e, v) =>
                        handleChange({
                          target: {
                            name: 'location_id',
                            value: v ? v.location_id : '',
                          },
                        })
                      }
                      renderInput={(params) => {
                        const get = {...params};
                        return (
                          <TextField
                            {...get}
                            required={true}
                            error={
                              formErrors.location_id === null ? false : true
                            }
                            helperText={
                              formErrors.location_id === null
                                ? ''
                                : 'Location is Required!'
                            }
                            label='Select Location'
                            variant='filled'
                          />
                        );
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
                      variant='filled'
                      name='Reference'
                      label='Reference'
                      placeholder='Reference'
                      color='primary'
                      value={
                        formValues.Reference === null
                          ? ''
                          : formValues.Reference
                      }
                      onChange={(e) => {
                        handleChange(e);
                      }}
                      onBlur={handleChange}
                      onWheel={(e) => e.target.blur()}
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
                      variant='filled'
                      name='comments'
                      label='Comments'
                      placeholder='Comments'
                      color='primary'
                      value={
                        formValues.comments === null ? '' : formValues.comments
                      }
                      onChange={(e) => {
                        handleChange(e);
                      }}
                      onBlur={handleChange}
                      // onWheel={(e) => e.target.blur()}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid
                sx={{'& .MuiPaper-root': {maxHeight: '500px !important'}}}
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                {/* <Grid container display='flex' justifyContent='space-between'>
                            <Grid>
                                <Typography variant='h6'>Table</Typography>
                            </Grid>
                        </Grid> */}

                <Table>
                  <TableHead style={{backgroundColor: '#e8e8e8'}}>
                    <TableRow>
                      <TableCell width='23%'>Schemes Ledger</TableCell>
                      <TableCell width='20%'>Description</TableCell>
                      <TableCell width='12%'>HSN/SAC</TableCell>
                      <TableCell style={{textAlign: 'right'}} width='10%'>
                        Amount
                      </TableCell>
                      <TableCell style={{textAlign: 'right'}} width='15%'>
                        GST
                      </TableCell>
                      <TableCell style={{textAlign: 'right'}} width='15%'>
                        Subtotal
                      </TableCell>
                      {/* <TableCell width='5%'>{''}</TableCell> */}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {formValues.manualNotes.length > 0 &&
                      formValues.manualNotes.map((rowData, index) => {
                        return (
                          <TableRow key={index}>
                            <TableCell style={{height: '60px'}}>
                              <Autocomplete
                                required
                                fullWidth
                                limitTags={2}
                                id='multiple-limit-tags'
                                name='schemesLedgerId'
                                options={schemesLedger}
                                getOptionLabel={(option) => option?.name}
                                value={
                                  !_.isEmpty(props.edit_id_data?.length)
                                    ? schemesLedger.filter(
                                        (s) =>
                                          s.id ===
                                          props.edit_id_data[0]
                                            ?.schemesLedgerId,
                                      )[0]
                                    : rowData.schemesLedgerId !== ''
                                    ? schemesLedger.filter(
                                        (f) => f.id === rowData.schemesLedgerId,
                                      )[0]
                                    : {name: ''}
                                }
                                onChange={(e, value) => {
                                  if (value !== null) {
                                    const updatedManualNotes =
                                      formValues.manualNotes.map((d, i) => {
                                        if (i === index) {
                                          return {
                                            ...d,
                                            schemesLedgerId: value
                                              ? value.id
                                              : '',
                                            description:
                                              value?.description ?? '',
                                            name: value?.name ?? '',
                                          };
                                        } else {
                                          return d;
                                        }
                                      });
                                    setFormValues((prev) => ({
                                      ...prev,
                                      manualNotes: updatedManualNotes,
                                    }));
                                  } else {
                                    setFormValues((prev) => ({
                                      ...prev,
                                      manualNotes: prev.manualNotes.map(
                                        (d, i) => {
                                          if (i === index) {
                                            return tempInsert;
                                          } else {
                                            return d;
                                          }
                                        },
                                      ),
                                    }));
                                  }
                                }}
                                renderInput={(params) => {
                                  const get = {...params};
                                  get.InputProps = {
                                    ...params.InputProps,
                                    startAdornment: (
                                      <Tooltip title='Create New'>
                                        <Icon
                                          style={{cursor: 'pointer'}}
                                          onClick={() => {
                                            setLedgerCreateOpen(true);
                                          }}
                                        >
                                          add
                                        </Icon>
                                      </Tooltip>
                                    ),
                                  };
                                  return (
                                    <TextField {...get} variant='standard' />
                                  );
                                }}
                              />
                            </TableCell>

                            <TableCell style={{height: '60px'}}>
                              <TextField
                                fullWidth
                                variant='standard'
                                value={
                                  rowData.description === null
                                    ? ''
                                    : rowData.description
                                }
                                onChange={(e) => {
                                  const updatedManualNotes =
                                    formValues.manualNotes.map((d, i) => {
                                      if (i === index) {
                                        return {
                                          ...d,
                                          description: e.target.value,
                                        };
                                      } else {
                                        return d;
                                      }
                                    });
                                  setFormValues((prev) => ({
                                    ...prev,
                                    manualNotes: updatedManualNotes,
                                  }));
                                }}
                              />
                            </TableCell>

                            <TableCell style={{height: '60px'}}>
                              <TextField
                                fullWidth
                                variant='standard'
                                value={rowData.hsn_code || ''}
                                placeholder='Goods HSN (e.g. 85171300)'
                                onChange={(e) => {
                                  const value = (e.target.value || '')
                                    .replace(/\D/g, '')
                                    .slice(0, 8)
                                  const updatedManualNotes =
                                    formValues.manualNotes.map((d, i) => {
                                      if (i === index) {
                                        return {
                                          ...d,
                                          hsn_code: value,
                                        }
                                      }
                                      return d
                                    })
                                  setFormValues((prev) => ({
                                    ...prev,
                                    manualNotes: updatedManualNotes,
                                  }))

                                  const err = validateServiceHsnCode(value, Boolean(rowData?.gst_id))
                                  setFormErrors((prev) => ({
                                    ...prev,
                                    hsn_code: err,
                                  }))
                                }}
                                error={
                                  !!(formErrors.hsn_code && index === 0)
                                }
                                helperText={
                                  index === 0
                                    ? (formErrors.hsn_code || 'Goods HSN only (not 99xx Services)')
                                    : ''
                                }
                                inputProps={{
                                  inputMode: 'numeric',
                                  maxLength: 8,
                                }}
                              />
                            </TableCell>

                            <TableCell style={{height: '60px'}}>
                              <TextField
                                variant='standard'
                                value={rowData.amount ?? ''}
                                onChange={(e) => {
                                  const value = e.target.value;

                                  // allow only numbers + single decimal
                                  if (!/^\d*\.?\d*$/.test(value)) return;

                                  const amount = value === '' ? '' : value;

                                  const updatedManualNotes =
                                    formValues.manualNotes.map((d, i) => {
                                      if (i !== index) return d;

                                      if (amount === '') {
                                        return {
                                          ...d,
                                          amount: '',
                                          gst_amount: 0,
                                          sub_total: '',
                                          schemes_amount : 0,
                                        };
                                      }

                                      const amt = parseFloat(amount);
                                      const gstRate = rowData.gst_id
                                        ? Number(rowData.gst_id)
                                        : 0;

                                      const gstAmount = showIGST
                                        ? (amt * gstRate) / 100
                                        : ((amt * (gstRate / 2)) / 100) * 2;

                                      return {
                                        ...d,
                                        amount,
                                        schemes_amount : Number(amt),
                                        gst_amount: +gstAmount.toFixed(2),
                                        sub_total: +(amt + gstAmount).toFixed(
                                          2,
                                        ),
                                      };
                                    });

                                  setFormValues((prev) => ({
                                    ...prev,
                                    manualNotes: updatedManualNotes,
                                  }));
                                }}
                                inputProps={{
                                  inputMode: 'decimal',
                                  style: {textAlign: 'right'},
                                }}
                              />

                              {/* <TextField
                                                        variant='standard'
                                                        value={rowData.amount === null ? '' : rowData.amount}
                                                        onChange={(e) => {
                                                            const amount = e.target.value || ''
                                                            const updatedManualNotes = formValues.manualNotes.map((d, i) => {
                                                                if (i === index) {
                                                                    if (amount !== '') {
                                                                        return {
                                                                            ...d,
                                                                            amount: amount,
                                                                            gst_amount: (showIGST ? (parseFloat(amount) * Number(((rowData.gst_id !== '' ? parseFloat(rowData.gst_id ?? 0) : 0) / 100).toFixed(2))) : ((parseFloat(amount) * Number(((rowData.gst_id !== '' ? parseFloat(rowData.gst_id / 2 ?? 0) : 0) / 100).toFixed(2))) + (parseFloat(amount) * Number(((rowData.gst_id !== '' ? parseFloat(rowData.gst_id / 2 ?? 0) : 0) / 100).toFixed(2))))),
                                                                            sub_total: parseFloat(amount) + (showIGST ? ((parseFloat(amount) * Number(((rowData.gst_id !== '' ? parseFloat(rowData.gst_id ?? 0) : 0) / 100).toFixed(2)))) : ((parseFloat(amount) * Number(((rowData.gst_id !== '' ? parseFloat(rowData.gst_id / 2 ?? 0) : 0) / 100).toFixed(2))) + (parseFloat(amount) * Number(((rowData.gst_id !== '' ? parseFloat(rowData.gst_id / 2 ?? 0) : 0) / 100).toFixed(2)))))
                                                                        }
                                                                    }
                                                                    else {
                                                                        return {
                                                                            ...d,
                                                                            amount: amount,
                                                                            gst_amount: 0,
                                                                            sub_total: ''
                                                                        }
                                                                    }
                                                                }
                                                                else {
                                                                    return d
                                                                }
                                                            })
                                                            setFormValues((prev) => ({ ...prev, manualNotes: updatedManualNotes }))
                                                        }}
                                                        InputProps={{
                                                            style: { textAlign: 'right' },
                                                            inputProps: { style: { textAlign: 'right' } }
                                                        }}
                                                    /> */}
                            </TableCell>

                            <TableCell style={{height: '60px'}}>
                              <Stack flexDirection='row'>
                                <FormControl fullWidth variant='standard'>
                                  <Select
                                    value={
                                      rowData.gst === null ? '' : rowData.gst
                                    }
                                    disabled={rowData.amount === ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const updatedManualNotes =
                                        formValues.manualNotes.map((d, i) => {
                                          if (i === index) {
                                            if (val === true) {
                                              return {
                                                ...d,
                                                gst: val,
                                              };
                                            } else {
                                              return {
                                                ...d,
                                                gst: val,
                                                gst_id: '',
                                                gst_amount: 0,
                                                sub_total: rowData.amount,
                                                schemes_amount : Number(rowData.amount)
                                              };
                                            }
                                          } else {
                                            return d;
                                          }
                                        });
                                      setFormValues((prev) => ({
                                        ...prev,
                                        manualNotes: updatedManualNotes,
                                      }));
                                    }}
                                  >
                                    <MenuItem value={false}>Without</MenuItem>
                                    <MenuItem value={true}>With</MenuItem>
                                  </Select>
                                </FormControl>

                                <Autocomplete
                                  fullWidth
                                  options={gsttypes}
                                  getOptionLabel={(option) => option.name}
                                  isOptionEqualToValue={(option, value) =>
                                    option.id === value
                                  }
                                  value={
                                    gsttypes?.find(
                                      (type) => type.id === rowData.gst_id,
                                    ) || null
                                  }
                                  onChange={(e, value) => {
                                    const updatedManualNotes =
                                      formValues.manualNotes.map((d, i) => {
                                        if (i === index) {
                                          return {
                                            ...d,
                                            gst_id: value ? value.id : '',
                                            gst_amount: showIGST
                                              ? Number(
                                                  (
                                                    (rowData.amount *
                                                      parseFloat(
                                                        value ? value.id : 0,
                                                      )) /
                                                    100
                                                  ).toFixed(2),
                                                )
                                              : Number(
                                                  (
                                                    (rowData.amount *
                                                      parseFloat(
                                                        value
                                                          ? value.id / 2
                                                          : 0,
                                                      )) /
                                                    100
                                                  ).toFixed(2),
                                                ) +
                                                Number(
                                                  (
                                                    (rowData.amount *
                                                      parseFloat(
                                                        value
                                                          ? value.id / 2
                                                          : 0,
                                                      )) /
                                                    100
                                                  ).toFixed(2),
                                                ),
                                            schemes_amount : Number(rowData.amount),
                                            sub_total:
                                              parseFloat(rowData.amount) +
                                              (showIGST
                                                ? Number(
                                                    (
                                                      (rowData.amount *
                                                        parseFloat(
                                                          value ? value.id : 0,
                                                        )) /
                                                      100
                                                    ).toFixed(2),
                                                  )
                                                : Number(
                                                    (
                                                      (rowData.amount *
                                                        parseFloat(
                                                          value
                                                            ? value.id / 2
                                                            : 0,
                                                        )) /
                                                      100
                                                    ).toFixed(2),
                                                  ) +
                                                  Number(
                                                    (
                                                      (rowData.amount *
                                                        parseFloat(
                                                          value
                                                            ? value.id / 2
                                                            : 0,
                                                        )) /
                                                      100
                                                    ).toFixed(2),
                                                  )),
                                          };
                                        } else {
                                          return d;
                                        }
                                      });
                                    setFormValues((prev) => ({
                                      ...prev,
                                      manualNotes: updatedManualNotes,
                                    }));
                                  }}
                                  InputProps={{
                                    style: {textAlign: 'right'},
                                    inputProps: {style: {textAlign: 'right'}},
                                  }}
                                  disabled={
                                    rowData.gst === false ? true : false
                                  }
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      fullWidth
                                      variant='standard'
                                    />
                                  )}
                                />
                              </Stack>
                            </TableCell>

                            <TableCell style={{height: '60px'}}>
                              <Typography
                                sx={{textAlign: 'right'}}
                                variant='h6'
                              >
                                {rowData.sub_total != null ? Number(rowData.sub_total).toFixed(2) : ''}
                              </Typography>
                            </TableCell>

                            {/* <TableCell style={{ height : '60px' }}>
                                                        <Stack flexDirection='row'>
                                                            {
                                                                formValues.manualNotes.length > 1 &&
                                                                <IconButton onClick={rowData.schemesLedgerId !== '' ? () => handleDeleteDialogOpen(index) : () => deleteLedgerRowData(index)}>
                                                                    <DeleteIcon sx={{ color : '#f04f47' }} />
                                                                </IconButton>
                                                            }

                                                            {
                                                                index === formValues.manualNotes.length - 1 &&
                                                                <IconButton onClick={() => setFormValues((prev) => ({...prev, manualNotes : [...prev.manualNotes, tempInsert]}))}>
                                                                    <AddIcon />
                                                                </IconButton>
                                                            }
                                                        </Stack>
                                                    </TableCell> */}
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </Grid>

              <Grid size={12}>
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
                      onChange={(e) => handleChange(e)}
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
                    style={{marginTop: '10px', backgroundColor: '#e8e8e8'}}
                    size={{
                      lg: 4,
                      md: 6,
                      sm: 12,
                      xs: 12
                    }}>
                    <Grid
                      container
                      spacing={2}
                      display='flex'
                      justifyContent='space-between'
                      sx={{p: 3}}
                    >
                      <Grid>
                        <Typography variant='h6' style={{fontWeight: 'bold'}}>
                          Untaxed Amount :
                        </Typography>

                        {!showIGST && (
                          <>
                            <Typography
                              style={{fontWeight: 'bold', margin: '5px'}}
                            >
                              CGST :
                            </Typography>

                            <Typography
                              style={{fontWeight: 'bold', margin: '5px'}}
                            >
                              SGST :
                            </Typography>
                          </>
                        )}

                        {showIGST && (
                          <Typography
                            style={{fontWeight: 'bold', margin: '5px'}}
                          >
                            IGST :
                          </Typography>
                        )}
                      </Grid>

                      <Grid>
                        <Typography style={{width: '100px', textAlign: 'end'}}>
                          <span>₹</span>
                          {calculateUntaxedAmount().toFixed(2)}
                        </Typography>

                        {!showIGST && (
                          <>
                            <Typography
                              style={{width: '100px', textAlign: 'end'}}
                            >
                              <span>₹</span>
                              {calculateHalfGST().toFixed(2)}
                            </Typography>

                            <Typography
                              style={{width: '100px', textAlign: 'end'}}
                            >
                              <span>₹</span>
                              {calculateHalfGST().toFixed(2)}
                            </Typography>
                          </>
                        )}

                        {showIGST && (
                          <Typography
                            style={{width: '100px', textAlign: 'end'}}
                          >
                            <span>₹</span>
                            {calculateIGST().toFixed(2)}
                          </Typography>
                        )}
                      </Grid>

                      <Grid size={12}>
                        <Autocomplete
                          name='tds_percent'
                          options={tds_taxrate}
                          value={formValues.tds_amount}
                          getOptionLabel={(option) =>
                            `${option.category} [${option.tds_rate}]`
                          }
                          onChange={(event, newValue) =>
                            handleChange({
                              target: {name: 'tds_amount', value: newValue},
                            })
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label='TDS'
                              variant='filled'
                              fullWidth
                            />
                          )}
                        />
                      </Grid>

                      {formValues?.tds_amount?.category === 'Others' ? (
                        <Grid size={12}>
                          <TextField
                            fullWidth
                            variant='filled'
                            label='TDS Amount'
                            name='manual_tds_amount'
                            value={formValues.manual_tds_amount}
                            onChange={(e) => handleChange(e)}
                          />
                        </Grid>
                      ) : (
                        <>
                          <Grid size={6}>
                            <Typography>TDS Amount :</Typography>
                          </Grid>

                          <Grid size={6}>
                            <Typography
                              style={{
                                textAlign: 'end',
                                fontWeight: 'bolder',
                                fontSize: '13px',
                                margin: '5px',
                              }}
                            >
                              <span>₹</span> {tdsAmount?.toFixed(2)}
                            </Typography>
                          </Grid>
                        </>
                      )}

                      <Grid size={12}>
                        <Divider />
                      </Grid>

                      {
                        appConfigData.roundedOffEnabled &&
                        <Grid size={6}>
                          <Typography>Rounded off :</Typography>
                        </Grid>
                      }

                      {
                        appConfigData.roundedOffEnabled &&
                        <Grid size={6}>
                          {editRoundOff && props.status !== 'edit' ? (
                            <ClickAwayListener
                              onClickAway={() => {
                                setEditRoundOff(false);
                                setHoverRoundOff(false);
                              }}
                            >
                              <Box>
                                <TextField
                                  fullWidth
                                  variant='filled'
                                  label='Rounded Off'
                                  name='rounded_off'
                                  value={formValues.rounded_off}
                                  onChange={(e) => handleChange(e)}
                                />
                              </Box>
                            </ClickAwayListener>
                          ) : (
                            <Box
                              onClick={() => setEditRoundOff(true)}
                              onMouseEnter={() => setHoverRoundOff(true)}
                              onMouseLeave={() => setHoverRoundOff(false)}
                              sx={{
                                display: 'flex',
                                cursor: 'pointer',
                                borderRadius:
                                  hoverRoundOff && props.status !== 'edit'
                                    ? '6px'
                                    : '0px',
                                border:
                                  hoverRoundOff && props.status !== 'edit'
                                    ? '1px solid #ccc'
                                    : 'none',
                                backgroundColor:
                                  hoverRoundOff && props.status !== 'edit'
                                    ? '#fff'
                                    : 'transparent',
                                transition: 'all 0.2s ease-in-out',
                                justifyContent: 'end',
                              }}
                            >
                              <Typography
                                onClick={() => setEditRoundOff(true)}
                                style={{
                                  textAlign: 'end',
                                  fontWeight: 'bolder',
                                  fontSize: '13px',
                                  margin: '5px',
                                }}
                              >
                                <span>₹</span> {formValues.rounded_off}
                              </Typography>
                            </Box>
                          )}
                        </Grid>
                      }

                      <Grid size={6}>
                        <Typography>Total :</Typography>
                      </Grid>

                      <Grid size={6}>
                        <Typography
                          style={{
                            textAlign: 'end',
                            fontWeight: 'bolder',
                            fontSize: '13px',
                            margin: '5px',
                          }}
                        >
                          <span>₹</span>{' '}
                          {(
                            calculateSubTotal() +
                            parseFloat(formValues?.rounded_off ?? 0) -
                            tdsAmount
                          ).toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
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
                <Grid container justifyContent='flex-end' spacing={2}>
                  <Grid>
                    {form === false ? (
                      <Button
                        variant='contained'
                        color='secondary'
                        onClick={() => props.handleClose()}
                      >
                        Cancel
                      </Button>
                    ) : (
                      <Button
                        variant='contained'
                        color='secondary'
                        onClick={() => validClose()}
                      >
                        Cancel
                      </Button>
                    )}
                  </Grid>

                  <Grid>
                    <Button
                      variant='contained'
                      color='primary'
                      onClick={handleSubmit}
                      disabled={disableLedger || isSubmitting}
                    >
                      Submit
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Card>
        )}
        {manualValue == 'return' && (
          <PurchaseReturn
            handleClose={props.handleClose}
            cnInvoiceFunction={props.cnInvoiceFunction}
          />
        )}
        <Dialog
          open={ledgerCreateOpen}
          onClose={() => setLedgerCreateOpen(false)}
          maxWidth='md'
          fullWidth
        >
          <Card sx={{m: 3, p: 2}}>
            <Grid container>
              <Grid size={12}>
                <NewLedger
                  handleClose={() => setLedgerCreateOpen(false)}
                  handleSubmit={ledgerSubmit}
                  ledgerStatus={'create'}
                  from={props.from}
                />
              </Grid>
            </Grid>
          </Card>
        </Dialog>
        <CancelDialog
          handle={cancel}
          delete={dialog}
          close={props.handleClose}
        />
        <Dialog open={deleteDilaog}>
          <DialogContent style={{width: 500}}>
            <DialogContentText>
              Are you sure want to delete this entry ?
            </DialogContentText>
          </DialogContent>

          <DialogActions>
            <Button
              variant='contained'
              color='error'
              onClick={handleDeleteDialogClose}
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              color='error'
              onClick={() => deleteLedgerRowData(deleteIndex)}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
}

export default NewManualNotesForm
