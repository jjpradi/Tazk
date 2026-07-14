import { Autocomplete, Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import PropTypes from "prop-types";
import CloseIcon from '@mui/icons-material/Close';
import { useContext, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { customerAsCompanyAction, getbyidCustomerAction } from "redux/actions/customer_actions";
import totalIcon from '../../../assets/dashboardIcons/rupee.svg';
import CheckIcon from '@mui/icons-material/Check';
import CreateNewButtonContext from "context/CreateNewButtonContext";
import { useCustomFetch } from "utils/useCustomFetch";
import { consolidatedReceivings, editReceiptAction, getReceiptEditDataAction, listcompletedSalesOutstandingAction, receiptEntry, receiptTimelineAction, saleIdGET, SalesAdvanceEntry, salesAdvanceEntryEdit, setReceiptEditDataAction } from "redux/actions/sales_actions";
import { getManualNoteSchemesByIdAction } from "redux/actions/manualNotes_actions";
import CardTemplate from "components/ReceiptPayments/CardTemplate";
import CreditDebitUnusedCredit from "components/ReceiptPayments/CreditDebitUnusedCredit";
import Invoices from "components/ReceiptPayments/Invoices";
import LocationAlert from "pages/assets/alert/LocationAlert";
import apiCalls from "utils/apiCalls";
import CommonDialog from "components/commonDialog";
import { getsessionStorage } from "pages/common/login/cookies";
import { getLoginRoleAction } from "redux/actions/userRole_actions";
import { roleType } from "utils/roleType";
import notificationType from "firebase/notify_type";
import { sendNtfy } from "firebase/firebase.service";
import { CreateNotificationAction } from "redux/actions/notification_actions";
import { getDateTimeFormat } from "utils/getTimeFormat";
import { getSupplierDetailsByIdAction } from "redux/actions/vendor_actions";
import { getbyidPurchasesAction, payablesPaymentEntry, payablesPaymentEntryEdit, PurchaseAdvanceEntry, purchaseAdvanceEntryEdit } from "redux/actions/purchase_actions";
import { chartOfAccountsIdNameAction } from "redux/actions/chartOfAccounts";
import { PaymentExpenseAction } from "redux/actions/expense_actions";
import dayjs from "dayjs";
import manualNotes from "pages/sales/manualNotes";
import FilePicker from '../../../../src/components/FilePicker/indexIn';
import { getAllemployeeincludingAdminAction } from "redux/actions/soTracking_actions";
import { getAppConfigDataAction } from "redux/actions/app_config_actions";
import PaymentMethods from "components/ReceiptPayments/PaymentMethods";
import CashOutIn from "pages/accounts/cashOutIn";
import API_URLS from "../../../utils/customFetchApiUrls";
import toMomentOrNull from "utils/DateFixer";

function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result);
        };

        reader.onerror = reject;

        reader.readAsDataURL(file);
    });
}

function ManualMatchReceipt(props) {

    const receiptEditData = Object.keys(props.editData).length > 0

    const dispatch = useDispatch()
    const customFetch = useCustomFetch()
    const storage = getsessionStorage()
    const {
        customerReducer: { customerAsCompany },
        productReducer: { product },
        ExpenseReducer: { expenses },
        salesReducer: { editReceiptData, chequeAlreadyExist },
        soTrackingReducer: { allemp },
        appConfigReducer: { app_config_data }
    } = useSelector(state => state)
    const { headerLocationId, setLoaderStatusHandler, setModalTypeHandler, commoncookie } = useContext(CreateNewButtonContext)

    const [page, setPage] = useState(1)
    const [formValues, setFormValues] = useState({
        selectedCustomerVendor: null,
        date: moment().format('YYYY-MM-DD'),
        advanceAmount: null,
        note: null,
        uploadedImage: []
    })
    const [editFormValues, setEditFormValues] = useState()
    const [editTransactionTable, setEditTransactionTable] = useState([])
    const [editCreditNotesAvailableCredit, setEditCreditNotesAvailableCredit] = useState([])
    const [editInvoice, setEditInvoice] = useState([])
    const [editAdvance, seteditAdvance] = useState()
    const [timeline,setTimeline] = useState(true)
    const [invoiceStatus,setInvoiceStatus] = useState(true)
    const [selectedData, setSelectedData] = useState({})
    const [manualNoteSchemes, setManualNoteSchemes] = useState([])
    const [dummyManualNoteSchemes, setDummyManualNoteSchemes] = useState([])
    const [getPay, setGetPay] = useState([])
    const [dummyGetPay, setDummyGetPay] = useState([])
    const [transactionTable, setTransactionTable] = useState([])
    const [creditNotesAvailableCredit, setCreditNotesAvailableCredit] = useState([])
    const [invoice, setInvoice] = useState([])
    const [totalAmount, setTotalAmount] = useState(0)
    const [openAlert, setOpenAlert] = useState(false)
    const [submitDisable, setSubmitDisable] = useState(false)
    const [advanceConfirmDialogOpen, setAdvanceConfirmDialogOpen] = useState(false)
    const [controlImageEdit, setControlImageEdit] = useState(true)
    const [tabValue, setTabValue] = useState(1)    
    const [isApiFinished, setIsApiFinished] = useState(false)
    const [selectedPaymentMode, setSelectedPaymentMode] = useState(null)
    const [tabTitleValue, setTabTitleValue] = useState(1)
    const [adjustmentOpen, setAdjustmentOpen] = useState('')

    const totalPaymentAmount = transactionTable.reduce((sum, list) => sum + Number(list.payment_amount ?? 0), 0)
    const totalCreditAmount = creditNotesAvailableCredit.reduce((sum, list) => sum + Number(list.adjustedAmount ?? 0), 0)
    const totalReceived = totalPaymentAmount + totalCreditAmount

    const totalReceipt = invoice.reduce((sum, list) => sum + Number(list?.paymentAmount ?? 0), 0)

    const totalAdvance = tabValue === 2 ? Number(formValues?.advanceAmount ?? 0) : totalPaymentAmount - totalReceipt

    useEffect(() => {
        dispatch(customerAsCompanyAction())
        dispatch(getAllemployeeincludingAdminAction())
        // dispatch(getAppConfigDataAction())
    }, [])

    useEffect(() => { (async () => {
        // setTransactionTable([])
        setCreditNotesAvailableCredit([])
        setManualNoteSchemes([])
        setSelectedData({})
        if(formValues.selectedCustomerVendor !== null && props.custType === 'CUSTOMER'){
            const { data: customerData } = await customFetch(
                API_URLS.GET_CUSTOMER_PENDING_PAYMENT(formValues.selectedCustomerVendor.customer_id, headerLocationId),
                'GET',
                {}
            );
            if((customerData ?? []).length > 0){
                pendingSales(customerData[0], customerData[0]?.childRow)
            }
        }
        else if(formValues.selectedCustomerVendor !== null && props.custType === 'VENDOR'){
            let body = {};
            let method = 'GET'
             const { data: customerData, loading, error } = await customFetch(
                API_URLS.GET_SUPPLIER_PENDING_PAYMENTS(formValues.selectedCustomerVendor.supplier_id, headerLocationId),
                'GET',
                {}
            );

            let value = customerData || [];
            if (value.length > 0) {
                let data = {
                supplier_id: value[0]?.supplier_id,
                receivings_items: value[0]?.childRow !== undefined ? value[0]?.childRow[0]?.receivings_items : [],
                paid_amount: value[0]?.paid_amount,
                receiving_id: value[0]?.receiving_id,
                receive_goods: value[0]?.receive_goods,
                total: value[0]?.total,
                status: value[0]?.status
                }
                pendingPayment(data, customerData)
            }
        }
    })();
}, [formValues.selectedCustomerVendor])

    useEffect(() => {
        if(Object.keys(props.selectedCustomer).length > 0){
            setFormValues((prev) => ({ ...prev, selectedCustomerVendor: props.selectedCustomer }))
        }
    }, [props.selectedCustomer])

    useEffect(() => {
        if(props.type === 'CHEQUE_REPRESENT'){
            if(Object.keys(props.editData).length > 0 && customerAsCompany.length > 0){
                const customerVendorData = customerAsCompany.filter(d => d.company_name !== null && d.customer_type === '1').find(d => d.customer_id === props.editData.receipt[0].customer_id)
                setFormValues((prev) => ({
                    ...prev,
                    selectedCustomerVendor: customerVendorData,
                    date: props.editData.representDate ? moment(props.editData.representDate).format('YYYY-MM-DD') :  moment().format('YYYY-MM-DD')
                }))
            }
        }
        else{
            if(Object.keys(props.editData).length > 0 && customerAsCompany.length > 0 && props.editData?.receipt_id != undefined && props.editData?.receipt_id != null && props.editData?.receipt_id !== '' ){
                const customerVendorData = customerAsCompany.filter(d => props.custType === 'CUSTOMER' ? d.company_name !== null && d.customer_type === '1' : d.supplier_id).find(d => props.custType === 'CUSTOMER' ? d.customer_id === props.editData.customer_id : d.supplier_id === props.editData.vendor_id)
                dispatch(getReceiptEditDataAction({receipt_id: props.editData.receipt_id, type: props.custType === 'CUSTOMER' ? 'Receipts' : 'Payments'}))
                setFormValues((prev) => ({
                    ...prev,
                    selectedCustomerVendor: customerVendorData,
                    date: moment(props.editData.receipt_date, "DD/MM/YYYY"),
                    note: props.editData.note,
                    uploadedImage: props.editData.imageUrl ? [{preview: props.editData.imageUrl[0], path: props.editData.attachment[0]}] : []
                }))
                setControlImageEdit(false)
            }
        }
    }, [props.editData, customerAsCompany])

    useEffect(() => {
        if(Object.keys(editReceiptData).length > 0 && props.entryType === 'edit'){
            const creditDebitNote = editReceiptData.manualCredit
            const advanceUsed = editReceiptData.usedAdvance.filter(d => d.description === 'Advance Used')
            const advanceCreate = props.custType === 'CUSTOMER' ? editReceiptData.usedAdvance.filter(d => d.description === 'Advance - Receipts Create') : editReceiptData.usedAdvance.filter(d => d.description === 'Advance Paid- Receipts Create')
            const editInvoice = editReceiptData.Invoice
            // Credit Note
            if(creditDebitNote.length > 0){
                const selectedManualNoteSchemes = dummyManualNoteSchemes.find(d => d.manual_notes_id === creditDebitNote[0].id)
                if(!selectedManualNoteSchemes){
                    const newCreditNote = {
                        id: creditDebitNote[0].id,
                        manual_notes_id: creditDebitNote[0].id,
                        sequence_number: creditDebitNote[0].sequence_number,
                        amount: creditDebitNote.reduce((sum, list) => sum + list.payment_amount, 0),
                        balance_amount: creditDebitNote.reduce((sum, list) => sum + list.payment_amount, 0),
                        new_adjusted_amount: creditDebitNote.reduce((sum, list) => sum + list.payment_amount, 0),
                        adjustedAmount: creditDebitNote.reduce((sum, list) => sum + list.payment_amount, 0),
                        sale_id: creditDebitNote[0].manualCreditSale,
                        receiving_id: creditDebitNote[0].manualCreditReceiving,
                        description: creditDebitNote[0].description,
                        adjusted_amount: creditDebitNote.reduce((sum, list) => sum + list.payment_amount, 0)
                    }
                    setManualNoteSchemes([ ...dummyManualNoteSchemes, newCreditNote ])
                }
                else{
                    const updatedCreditDebitNote = dummyManualNoteSchemes.map((d) => {
                        if(d.manual_notes_id === creditDebitNote[0].id){
                            return { ...d, adjustedAmount: creditDebitNote.reduce((sum, list) => sum + list.payment_amount, 0), balance_amount: d.balance_amount + creditDebitNote[0].payment_amount }
                        }
                        else{
                            return d
                        }
                    })
                    setManualNoteSchemes(updatedCreditDebitNote)
                }
                setTabValue(1)
            }

            // Advance used for Receipt
            if(advanceUsed.length > 0){
                const selectedAdvance = dummyManualNoteSchemes.find(d => d.advance_id === advanceUsed[0].advance_id)
                if(!selectedAdvance){
                    const newCreditNote = {
                        id: advanceUsed[0].advance_id,
                        advance_id: advanceUsed[0].advance_id,
                        amount: advanceUsed[0].payment_amount,
                        balance_amount: advanceUsed[0].payment_amount, 
                        new_adjusted_amount: advanceUsed[0].payment_amount,
                        adjustedAmount: advanceUsed[0].payment_amount,
                        adjusted_amount: Math.abs(advanceUsed[0].adjusted_amount - advanceUsed[0].payment_amount)
                    }
                    setManualNoteSchemes([ ...dummyManualNoteSchemes, newCreditNote ])
                }
                else{
                    const updatedCreditDebitNote = dummyManualNoteSchemes.map((d) => {
                        if(d.advance_id === advanceUsed[0].advance_id){
                            return { ...d, adjustedAmount: advanceUsed[0].payment_amount, balance_amount: d.balance_amount + advanceUsed[0].payment_amount }
                        }
                        else{
                            return d
                        }
                    })
                    setManualNoteSchemes(updatedCreditDebitNote)
                }
                setTabValue(1)
            }


            // Advance created from Receipt
            if(advanceCreate.length > 0){
                setFormValues((prev) => ({ ...prev, advanceAmount: advanceCreate[0].payment_amount }))
                setTabValue(2)
            }
            // Invoice                  Need to change the condition for vendor
            if(editInvoice.length > 0){
                const updatedGetPay = dummyGetPay.map((d) => {
                    const selectedInvoice = props.custType === 'CUSTOMER'
                        ? editInvoice.find(inv => inv.sale_id === d.sale_id)
                        : editInvoice.find(inv => inv.receiving_id === d.receiving_id);

                    if (!selectedInvoice) {
                        return d;
                    }

                    if(props.custType === 'CUSTOMER'){
                        const newInvoice = {
                            due_amount: selectedInvoice.due_amount,
                            invoice_date: selectedInvoice.invoice_date,
                            invoice_number: selectedInvoice.invoice_number,
                            pending_amount: selectedInvoice.due_amount,
                            received_amount: selectedInvoice.total - (selectedInvoice.received_amount + selectedInvoice.payment_amount),
                            sale_id: selectedInvoice.sale_id,
                            id: selectedInvoice.sale_id,
                            total: selectedInvoice.total,
                            paymentAmount: selectedInvoice.payment_amount,
                            markAsDelivered: selectedInvoice.delivery_status === 6,
                            deliveryPerson: allemp.find(e => e.employee_id === selectedInvoice.picked_by),
                        };
    
                        return newInvoice;
                    }
                    else{
                        const newBill = {
                            due_amount: selectedInvoice.due_amount,
                            invoice_date: selectedInvoice.invoice_date,
                            po_number: selectedInvoice.po_number,
                            pending_amount: selectedInvoice.due_amount,
                            paid_amount: selectedInvoice.total - (selectedInvoice.paid_amount + selectedInvoice.due_amount),
                            receiving_id: selectedInvoice.receiving_id,
                            total: selectedInvoice.total,
                            paymentAmount: selectedInvoice.payment_amount
                        }
                        return newBill
                    }
                }).filter(Boolean);

                const missingInvoices = editInvoice.filter(inv => {
                    return props.custType === 'CUSTOMER'
                        ? !dummyGetPay.some(d => d.sale_id === inv.sale_id)
                        : !dummyGetPay.some(d => d.receiving_id === inv.receiving_id);
                });

                const formattedMissing = missingInvoices.map((inv) => {
                    if(props.custType === 'CUSTOMER'){
                        return {
                            due_amount: inv.due_amount,
                            invoice_date: inv.invoice_date,
                            invoice_number: inv.invoice_number,
                            pending_amount: inv.due_amount,
                            received_amount: inv.received_amount,
                            paid_amount: inv.total - inv.payment_amount,
                            sale_id: inv.sale_id,
                            id: inv.sale_id,
                            total: inv.total,
                            paymentAmount: inv.payment_amount,
                            markAsDelivered: inv.delivery_status === 6,
                            deliveryPerson: allemp.find(e => e.employee_id === inv.picked_by),
                        };
                    }
                    else{
                        return{
                            due_amount: inv.due_amount,
                            invoice_date: inv.invoice_date,
                            invoice_number: inv.po_number,
                            pending_amount: inv.due_amount,
                            received_amount: inv.total - (inv.paid_amount + inv.due_amount),
                            sale_id: inv.receiving,
                            total: inv.total,
                            paymentAmount: inv.payment_amount
                        }
                        
                    }
                });
                setGetPay([...updatedGetPay, ...formattedMissing])
            }
        }
    }, [editReceiptData, dummyManualNoteSchemes, dummyGetPay])

    useEffect(() => {
        if(props.type === 'CHEQUE_REPRESENT' && Object.keys(props.editData).length > 0 && dummyGetPay.length > 0){
            if(props.editData.receiptDetails[0].advance === 'Advance - Receipts Create'){
                setTabValue(2)
                setFormValues((prev) => ({ ...prev, advanceAmount: props.editData.receiptDetails[0].payment_amount}))
            }
            else{
                const updatedGetPay = dummyGetPay.map((d) => {
                    const selectedInvoice = props.editData.saleDetails.find(inv => inv.sale_id === d.sale_id)
    
                    if (!selectedInvoice) {
                        return d; // skip this if invoice isn't in editInvoice
                    }
    
                    const newInvoice = {
                        due_amount: selectedInvoice.due_amount,
                        invoice_date: selectedInvoice.invoice_date,
                        invoice_number: selectedInvoice.invoice_number,
                        pending_amount: selectedInvoice.due_amount,
                        received_amount: selectedInvoice.total - (selectedInvoice.received_amount + selectedInvoice.payment_amount),
                        sale_id: selectedInvoice.sale_id,
                        id: selectedInvoice.sale_id,
                        total: selectedInvoice.total,
                        paymentAmount: selectedInvoice.payment_amount,
                        markAsDelivered: selectedInvoice.delivery_status === 6,
                        deliveryPerson: allemp.find(e => e.employee_id === selectedInvoice.picked_by),
                    };
    
                    return newInvoice;
                }).filter(Boolean);
    
                const missingInvoices = props.editData.saleDetails.filter(inv => {
                    return props.custType === 'CUSTOMER'
                        ? !dummyGetPay.some(d => d.sale_id === inv.sale_id)
                        : !dummyGetPay.some(d => d.receiving_id === inv.receiving_id);
                });
    
                const formattedMissing = missingInvoices.map((inv) => {
                    return {
                        due_amount: inv.due_amount,
                        invoice_date: inv.invoice_date,
                        invoice_number: inv.invoice_number,
                        pending_amount: inv.due_amount,
                        received_amount: inv.received_amount,
                        paid_amount: inv.total - inv.payment_amount,
                        sale_id: inv.sale_id,
                        id: inv.sale_id,
                        total: inv.total,
                        paymentAmount: inv.payment_amount,
                        markAsDelivered: inv.delivery_status === 6,
                        deliveryPerson: allemp.find(e => e.employee_id === inv.picked_by),
                    };
                });
                setGetPay([...updatedGetPay, ...formattedMissing])
            }
        }
    }, [dummyGetPay, props.editData])
    
    useEffect(() => {
        if (tabValue === 2) {
            const total = transactionTable.reduce((sum, list) => sum + Number(list.payment_amount ?? 0), 0)
            const timer = setTimeout(() => {
                setFormValues((prev) => ({ ...prev, advanceAmount: total }))
            }, 300)

            return () => clearTimeout(timer)
        }
    }, [transactionTable, tabValue])

    const receivableAmount = useMemo(() => {
        if(getPay?.length > 0){
            const total = getPay.reduce((sum, list) => {
            const totalVal = list?.total ?? list?.total_amount ?? 0;
            const receivedVal = list?.received_amount ?? list?.paid_amount ?? 0;
            return sum + (totalVal - receivedVal);
                
            }
            , 0)
            return parseFloat(total.toFixed(2))
        }
        else{
             return 0
        }
    }, [getPay])

    const unusedCredit = useMemo(() => {
        if(manualNoteSchemes.length > 0){
            const total = manualNoteSchemes.reduce((sum, list) => sum + (list?.balance_amount || 0), 0)
            return parseFloat(total.toFixed(2))
        }
        else{
             return 0
        }
    }, [manualNoteSchemes])

    const totalCost = () => {
        let total = 0
        props.sales_items.forEach((d) => {
            total += d.selling_price
                ? (d.selling_price / (getIgst(d) + 100)) * 100
                : (d.quantity || 1) * d.item_unit_price -
                (((d.quantity || 1) * d.item_unit_price) / 100) * (d.discount || 0);
        })

        return total
    };

    const taxes = () => {
        let total = 0
        for (let data of props.sales_items) {
            let arr = []
            if (data.item_unit_price) {
                arr.push(data.item_unit_price)
            }
            if (data.quantity) {
                arr.push(data.quantity)
            } else {
                arr.push(1)
            }
            if (data.taxes) {
                data.taxes.forEach((t) => {
                    if (t.tax_group === 'IGST') {
                        arr.push(t.tax_rate)
                    }
                });
            }
            const val =
                arr[0] * arr[1] - ((arr[0] * arr[1]) / 100) * (data.discount || 0);
            total += data.selling_price
                ? (((data.selling_price / (arr[2] + 100)) * 100) / 100) * arr[2]
                : (val / 100) * arr[2]
        }

        return total ? total : 0
    }

    const getIgst = (data) => {
        let tax = '';
        if (data.taxes) {
            data.taxes.forEach((t) => {
                if (t.tax_group === 'IGST') {
                    tax = t.tax_rate;
                }
            });
        }
        return tax;
    }

    const pendingSales = (data, childRow) => {

        const { customer_id, sales_items: old_sales, received_amount } = data

        if (childRow !== undefined) {
            const updatedChildRow = childRow?.map(row => ({
                ...row,
                id: row.sale_id,
                po_number: row.invoice_number,
                paid_amount: row.received_amount
            }))
            childRow = updatedChildRow
        }

        dispatch(getbyidCustomerAction(customer_id, (response) => {
            setSelectedData(response);
            dispatch(getManualNoteSchemesByIdAction('customer', customer_id, (response) => {
                const creditDebitNote = response.map(i => ({ ...i, selected: false, new_adjusted_amount: i.balance_amount }))
                if(props.entryType === 'edit'){
                    setDummyManualNoteSchemes(creditDebitNote)
                }
                else{
                    setManualNoteSchemes(creditDebitNote)
                }
                setGetPay(childRow ?? [])
                setDummyGetPay(childRow ?? [])
                setIsApiFinished(true)
              }))
        
            }))
    }

    const pendingPayment = (data, value) => {
        const {
            supplier_id,
            receivings_items: itemsData = [],
            paid_amount,
            receiving_id,
            status: oldStatus,
            receive_goods,
            total,
        } = data;
    
        dispatch(getSupplierDetailsByIdAction(data.supplier_id, (supplierDetails) => {
            const getVendor = supplierDetails || {};
            setSelectedData(getVendor)
            if(props.pageType === 'EXPENSE'){
               setGetPay(expenses.filter(d => d.vendor_id === data.supplier_id && d.id === props.selectedInvoice))
                dispatch(getManualNoteSchemesByIdAction('supplier', data.supplier_id, (response) => {
                    const creditDebitNote = response.map(i => ({ ...i, selected: false, new_adjusted_amount: i.balance_amount }))
                    if(props.entryType === 'edit'){
                        setDummyManualNoteSchemes(creditDebitNote)
                    }
                    else{
                        setManualNoteSchemes(creditDebitNote)
                    }
                    setIsApiFinished(true)
                }));
            }
            else{
                const getPays = value?.filter(
                (d) => d.supplier_id === supplier_id,
                )[0]?.childRow;
                setGetPay(getPays || [])
                setDummyGetPay(getPays ?? [])
                dispatch(getManualNoteSchemesByIdAction('supplier', data.supplier_id, (response) => {
                    const creditDebitNote = response.map(i => ({ ...i, selected: false, new_adjusted_amount: i.balance_amount }))
                    if(props.entryType === 'edit'){
                        setDummyManualNoteSchemes(creditDebitNote)
                    }
                    else{
                        setManualNoteSchemes(creditDebitNote)
                    }
                    setIsApiFinished(true)
                }));
            }
    
        }))
    
      }

      const handleNext = () => {
        setPage(2)
        setInvoice([])
        if(props.entryType !== 'edit'){
            setFormValues((prev) => ({ ...prev, advanceAmount: null }))
        }
    }


    const hasInvalidCheque = transactionTable.some(payment => {
    if (payment.payment_type?.toLowerCase().includes('cheque') && props.type !== 'CHEQUE_REPRESENT') {
        return (
            !payment.chequeNumber || !/^\d{6}$/.test(payment.chequeNumber) || chequeAlreadyExist.status === 'Exist' ||
            !payment.bankName || payment.bankName.trim() === ''
        );
    }
    return false;
});


    const handlePrevious = () => {
        setPage(1)
        setTransactionTable([])
        setCreditNotesAvailableCredit([])
    }

    const handleChange = (name, value) => {
        setFormValues((prev) => ({ ...prev, [name]: value }))
    }

    const getTotalSelectedAmount = (selectionModel, custType, formValues) => {
        if (!Array.isArray(selectionModel)) return 0
        let totalReceivable = 0
        let totalPayable = 0
        const parsedFormAmount = parseFloat(formValues?.amount) || 0

        selectionModel.forEach((item) => {
            const isInvoice = item.type === 'Invoice' || props.pageType === 'EXPENSE';
            const isCreditNote = ['Credit Note', 'Unused Credit', 'Debit Note'].includes(item.type);

            const receivable = parseFloat(item.receivable) || 0;
            const paymentAmount = parseFloat(item.paymentAmount) || 0;
            const payable = parseFloat(item.payable) || 0;

            if (isInvoice) {
                if (props.custType === 'CUSTOMER') {

                    totalReceivable += paymentAmount;
                } else if (props.custType === 'VENDOR') {
                    totalPayable += payable;
                }
            }

            if (isCreditNote) {
                if (props.custType === 'CUSTOMER') {
                    totalPayable += payable;
                } else if (props.custType === 'VENDOR') {
                    totalReceivable += receivable;
                }
            }
        });

        if (props.custType === 'CUSTOMER') {
            return (totalPayable - totalReceivable) + parsedFormAmount;
        } else {
            return (totalReceivable - totalPayable) + parsedFormAmount;
        }
    }

    const getTransactionDetailsAndAmount = () => {
        if(transactionTable.length > 0){
            return `${transactionTable[0]?.payment_type}: ${transactionTable[0].payment_amount}/-`
        }
        else if(creditNotesAvailableCredit.length > 0){
            if(creditNotesAvailableCredit[0].type === 'Credit Note'){
                return `Credit Note(${creditNotesAvailableCredit[0].refNumber}): ${creditNotesAvailableCredit[0].adjustedAmount}/-`
            }
            else{
                return `Unused Credit: ${creditNotesAvailableCredit[0].adjustedAmount}/-`
            }
        }
    }

    useEffect(() => {
        if(props.entryType !== 'edit') {
            if(props.custType === 'CUSTOMER') {
                if(formValues.advanceAmount !== null && formValues.advanceAmount !== '') {
                    setFormValues((prev) => ({...prev, note : 'Advance payment received'}))
                }
                else if(creditNotesAvailableCredit.length > 0 && creditNotesAvailableCredit[0]?.type === 'Unused Credit') {
                    setFormValues((prev) => ({...prev, note : 'Unused credit adjusted'}))
                }
                else if(creditNotesAvailableCredit.length > 0 && creditNotesAvailableCredit[0]?.originalRow.invoice_number === null) {
                    setFormValues((prev) => ({...prev, note : 'Manual credit note adjusted'}))
                }
                else if(creditNotesAvailableCredit.length > 0 && creditNotesAvailableCredit[0]?.originalRow.invoice_number !== null) {
                    setFormValues((prev) => ({...prev, note : 'Sales return credit note has been adjusted'}))
                }
                else if(transactionTable.length > 0 && transactionTable[0]?.payment_type === 'Cheque (INR)') {
                    const dateFormat = moment(transactionTable[0]?.chequeDate).format('DD/MM/YYYY')
                    setFormValues((prev) => ({...prev, note : `Cheques received - ${dateFormat}`}))
                }
                else if(transactionTable.length > 0 && transactionTable[0]?.payment_type === 'UPI (INR)') {
                    setFormValues((prev) => ({...prev, note : 'UPI payment received'}))
                }
                else if(transactionTable.length > 0 && transactionTable[0]?.payment_type === 'NEFT / RTGS / IMPS (INR)') {
                    setFormValues((prev) => ({...prev, note : 'Online payment received'}))
                }
                else {
                    setFormValues((prev) => ({...prev, note : null}))
                }
            }
            else {
                if(formValues.advanceAmount !== null && formValues.advanceAmount !== '') {
                    setFormValues((prev) => ({...prev, note : 'Advance amount paid'}))
                }
                else if(creditNotesAvailableCredit.length > 0 && creditNotesAvailableCredit[0]?.type === 'Unused Credit') {
                    setFormValues((prev) => ({...prev, note : 'Unused credit adjusted'}))
                }
                else if(creditNotesAvailableCredit.length > 0 && creditNotesAvailableCredit[0]?.originalRow.bill_number === null) {
                    setFormValues((prev) => ({...prev, note : 'Manual debit note adjusted'}))
                }
                else if(creditNotesAvailableCredit.length > 0 && creditNotesAvailableCredit[0]?.originalRow.bill_number !== null) {
                    setFormValues((prev) => ({...prev, note : 'Purchase return debit note has been adjusted'}))
                }
                else if(transactionTable.length > 0 && transactionTable[0]?.payment_type === 'Cheque (INR)') {
                    const dateFormat = moment(transactionTable[0]?.chequeDate).format('DD/MM/YYYY')
                    setFormValues((prev) => ({...prev, note : `Cheques issued - ${dateFormat}`}))
                }
                else if(transactionTable.length > 0 && transactionTable[0]?.payment_type === 'UPI (INR)') {
                    setFormValues((prev) => ({...prev, note : 'Payment made via UPI'}))
                }
                else if(transactionTable.length > 0 && transactionTable[0]?.payment_type === 'NEFT / RTGS / IMPS (INR)') {
                    setFormValues((prev) => ({...prev, note : 'Payment made through online transfer'}))
                }
                else {
                    setFormValues((prev) => ({...prev, note : null}))
                }
            }
        }
    }, [props.entryType, props.custType, formValues.advanceAmount, creditNotesAvailableCredit, transactionTable])

    const handleSubmit = () => {
        if(formValues.advanceAmount !== null && formValues.advanceAmount !== ''){
            handleAdvanceSubmit(props.entryType)
            return
        }

        if((formValues.advanceAmount === null || formValues.advanceAmount === '') && totalAdvance > 0){
            setAdvanceConfirmDialogOpen(true)
            return
        }

        if(props.custType === 'CUSTOMER'){
            handleReceiptSubmit(props.entryType)
        }
        else if(props.pageType === 'EXPENSE'){
            handleExpenseSubmit()
        }
        else{
            handlePaymentSubmit(props.entryType)
        }
    }
console.log(selectedPaymentMode, 'selectedPaymentMode')
    const handleAdvanceSubmit = async(type) => {
        if(headerLocationId === 'null'){
            setOpenAlert(true)
            return
        }
        const receiptData = transactionTable.filter(i => 'paymentLedgerId' in i && 'ledger_id' in i)
        const totalAmount = receiptData.reduce((sum, list) => sum + Number(list.payment_amount ?? 0), 0)
        
        if(Number(formValues.advanceAmount) !== totalAmount){
            return alert('Advance Amount does not match with the Received Amount')
        }

        const now = new Date();
            let hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;

            const formattedTime = `${hours}:${minutes} ${ampm}`;

            //  const storage = getsessionStorage()
             let invoiceData = []
             let ReceiptType ;
        if(props.custType === 'CUSTOMER'){
              const normalize = (str) =>
                    str?.toLowerCase().replace(/\s+/g, ' ').trim();

            if(type === 'edit'){
                ReceiptType = 'Advance Edit'
                if((transactionTable.length > 0 && normalize(transactionTable[0].payment_type) !== normalize(editTransactionTable[0]?.payment_type)) || (transactionTable.length > 0 && normalize(transactionTable[0].payment_type) === normalize(editTransactionTable[0]?.payment_type) )){
                        invoiceData.push(`Advance amount of ${transactionTable[0].payment_amount} Received from ${selectedData.company_name} Via ${transactionTable[0].payment_type}`)
                    }
                    // if( transactionTable.length > 0 && normalize(transactionTable[0].payment_type) === normalize(editTransactionTable[0]?.payment_type)){
                    //     if(transactionTable[0].payment_amount != editTransactionTable[0]?.payment_amount){
                    //         invoiceData.push(`Advance Modified from ${editTransactionTable[0]?.payment_amount} to ${transactionTable[0].payment_amount}  Via ${transactionTable[0].payment_type} `)
                    //     }
                    // }
            }
            else{
                ReceiptType = 'Receipt Advance'
                
                invoiceData.push(transactionTable.length > 0 &&  `Advance amount of ${(transactionTable[0].payment_amount).toFixed(2)} Received from ${selectedData.company_name} Via ${transactionTable[0].payment_type}`)
            }
            const data = {
                receiptData: [{...receiptData[0], receiptDate: moment(formValues.date).format('YYYY-MM-DD'), note: formValues.note, image: formValues.uploadedImage.length > 0 ? [await readFileAsync(formValues.uploadedImage[0])] : []}],
                customerId: formValues.selectedCustomerVendor.customer_id,
                amount: Number(formValues.advanceAmount),
                name: formValues.selectedCustomerVendor.company_name,
                location_id: headerLocationId,
                timeLineData : invoiceData,
                ReceiptType : ReceiptType,
                whatsappReceiptData : {
                    customer : formValues.selectedCustomerVendor.company_name,
                    advanceAmount : Number(formValues.advanceAmount),
                    receipt_date : formValues?.date,
                    time : formattedTime,
                    received_by : storage.first_name,
                    company_name : storage.company_name,
                    phone : selectedData.phone_number,
                }
            }
            if(type === 'edit' && props.type !== 'CHEQUE_REPRESENT'){
                const advanceReceiptCreate = editReceiptData.usedAdvance.filter(d => d.description === 'Advance - Receipts Create')
                apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    dispatch(salesAdvanceEntryEdit({ ...data, receipt_id: props.editData.receipt_id, advance_id: advanceReceiptCreate[0].advance_id, old_amount: advanceReceiptCreate[0].payment_amount }, (response) => {
                        if(response === 200){
                            props.handleClose(false)
                            resetPage()
                        }
                    }))
                )
            }
            else{
                if(props.type === 'CHEQUE_REPRESENT'){
                    data.chequeData = {
                    cheque_id: props.editData.chequeData.id,
                    presentedDate: props.editData.representDate ? props.editData.representDate : formValues.receiptDate,
                    presentedEmployee: props.editData.selectedEmployee,
                    remarks: props.editData.remarks,
                    chequeStatus: 5
                }
                }
                apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    dispatch(SalesAdvanceEntry(data, (response, resData) => {
                        if(response === 200){
                            props.handleClose(props.manualMatch === 'ManualMatch' ? resData?.data?.payment_transaction.insertId : false)
                            setTabValue(1)
                            resetPage()
                        }
                    }))
                )
            }
        }
        else{
            if (totalAdvance > 0) {
                if (
                    formValues.selectedCustomerVendor.company_name &&
                    formValues.advanceAmount
                ) {
                    invoiceData.push(`₹${totalAdvance.toFixed(2)} advance received from ${formValues.selectedCustomerVendor.company_name}`);
                } else {
                    invoiceData.push(`₹${totalAdvance.toFixed(2)} advance amount added`);
                }
            }

            const data = {
                receiptData: [{...receiptData[0], receiptDate: moment(formValues.date).format('YYYY-MM-DD'), note: formValues.note, image: formValues.uploadedImage.length > 0 ? [await readFileAsync(formValues.uploadedImage[0])] : []}],
                supplierId: formValues.selectedCustomerVendor.supplier_id,
                amount: Number(formValues.advanceAmount),
                name: formValues.selectedCustomerVendor.company_name,
                location_id: headerLocationId,
                timeLineData : invoiceData,

            }
            if(type === 'edit'){
                data.receiptData.imageKey = props.editData.imageKey
                const advancePaymentCreate = editReceiptData.usedAdvance.filter(d => d.description === 'Advance Paid- Receipts Create')
                apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    dispatch(purchaseAdvanceEntryEdit({ ...data, receipt_id: props.editData.receipt_id, advance_id: advancePaymentCreate[0].advance_id, old_amount: advancePaymentCreate[0].payment_amount }, (response) => {
                        if(response === 200){
                            props.handleClose(false)
                            resetPage()
                        }
                    }))
                )
            }
            else{
                apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    dispatch(PurchaseAdvanceEntry(data, (response, resData) => {
                        if(response === 200){
                            props.handleClose(props.manualMatch === 'ManualMatch' ? response.data.payment_transaction.insertId : false)
                            setTabValue(1)
                            resetPage()
                        }
                    }))
                )
            }
        }
    }

    const handleReceiptSubmit = async(type) => {
        setSubmitDisable(true)
        if(headerLocationId === 'null'){
            setOpenAlert(true)
            setSubmitDisable(false)
            return
        }

        let receivedAmount = totalReceived
        let receivables = []
        if(invoice.length > 0){
            receivables = invoice.map((inv) => {
                 const newObj = {}
                 const sub = totalReceived - (+Number(inv.originalRow.total) - +Number(inv.originalRow.paid_amount))
    
                 if(Math.sign(sub) === 1 || Math.sign(sub) === 0){
                    newObj.received_amount = +inv.originalRow.paid_amount + totalReceived
                    receivedAmount = sub
                }
                else {
                    newObj.received_amount = totalReceived + +inv.originalRow.paid_amount
                    receivedAmount = 0
                }
                newObj.saleType = inv.originalRow.saleType
                newObj.receivable_amount = inv.originalRow.due_amount
                newObj.paymentAmount = inv.paymentAmount
                newObj.sales_payment = [{
                    ...transactionTable[0],
                    due: Number(inv.paymentAmount ?? 0),
                    payment_amount: Number(inv.paymentAmount ?? 0),
                    ...(creditNotesAvailableCredit.length > 0 && {
                        employee_id: commoncookie,
                        payment_type: creditNotesAvailableCredit[0].type,
                        reference_code: '',
                        cash_refund: 0
                    }),
                    ...(totalAdvance > 0 && {
                        change: [],
                        cash_adjustment: 0
                    })
                }]
                newObj.sale_id = inv.id
                newObj.location_id = headerLocationId !== 'null' ? headerLocationId : inv.originalRow.location_id
                newObj.markAsDelivered = inv.markAsDelivered
                newObj.deliveryPerson = inv.markAsDelivered && inv.deliveryPerson ? inv.deliveryPerson.employee_id : null
    
                return newObj
            })
        }


        let remainingPaidAmount = totalReceived
        let saleUpdate = []
        if(receivables.length > 0){
            saleUpdate = receivables.map((inv) => {
                const paymentAmount = Number(inv.paymentAmount ?? 0)
                let receivedAmount = 0
    
                if(totalReceived <= paymentAmount){
                    receivedAmount = paymentAmount
                }
                else{
                    if(remainingPaidAmount > 0 && remainingPaidAmount >= paymentAmount){
                        receivedAmount = paymentAmount
                        remainingPaidAmount -= paymentAmount
                    }
                    else{
                        receivedAmount = remainingPaidAmount
                        remainingPaidAmount = 0
                    }
                }
    
                return{
                    ...inv,
                    received_amount: receivedAmount
                }
            })
        }

        let invoiceData = []
        let ReceiptType ;

            if(type !== 'edit'){
                ReceiptType = 'Receipt Entry'
                invoiceData.push(transactionTable.length > 0 ?  `${transactionTable[0].payment_amount} Received from ${selectedData.company_name} Via ${transactionTable[0].payment_type}` : `${creditNotesAvailableCredit[0].payable} Adjusted from ${selectedData.company_name} via Credit Note/Advance`)
                
            invoice.map((e)=>{
                const date = new Date(e.invoice_date);
                const formattedDate = date.toLocaleDateString('en-GB');
                invoiceData.push(` Receipt of ${e.paymentAmount} recorded for Invoice dated on ${formattedDate} - Reference No: ${e.refNumber} `)
            })
            if(totalAdvance > 0 ) invoiceData.push(` ${ totalAdvance?.toFixed(2)} rs. Advance Amount Added`)
            
            }

                if(type === 'edit'){
                    ReceiptType = 'Receipt Edit'
                    const normalize = (str) =>
                    str?.toLowerCase().replace(/\s+/g, ' ').trim();

                    if( (transactionTable.length > 0 && normalize(transactionTable[0].payment_type) === normalize(editTransactionTable[0]?.payment_type)) || (transactionTable.length > 0 && normalize(transactionTable[0].payment_type) !== normalize(editTransactionTable[0]?.payment_type))){
                        if(transactionTable[0].payment_amount != editTransactionTable[0]?.payment_amount){
                            invoiceData.push(`Received the payment amount of ${transactionTable[0].payment_amount} via ${transactionTable[0].payment_type} `)
                        }
                    }
                    if(editTransactionTable.length > 0 &&  editCreditNotesAvailableCredit.length === 0 && creditNotesAvailableCredit.length > 0){
                        invoiceData.push(`Received the payment amount of ${transactionTable[0].payment_amount} via Credit Note`)
                    }
                    if(creditNotesAvailableCredit.length > 0 && editCreditNotesAvailableCredit.length > 0 && editCreditNotesAvailableCredit[0]?.refNumber !== creditNotesAvailableCredit[0]?.refNumber){
                        invoiceData.push(`${creditNotesAvailableCredit[0].payable} Adjusted from ${selectedData.company_name} via Credit Note/Advance`)
                        
                    }
                    // if(editCreditNotesAvailableCredit.length > 0  &&  editCreditNotesAvailableCredit.length > 0 &&  editCreditNotesAvailableCredit[0]?.refNumber === creditNotesAvailableCredit[0]?.refNumber){
                    //     invoiceData.push(` Adjusted amount modified from   ${editCreditNotesAvailableCredit[0]?.adjustedAmount} to  ${creditNotesAvailableCredit[0]?.adjustedAmount} in the ref no : ${editCreditNotesAvailableCredit[0]?.refNumber}`)
                    // }
                    // if(moment(formValues?.date).format('DD/MM/YYYY') !== moment(editFormValues?.date).format('DD/MM/YYYY')){
                    //     invoiceData.push(`Receipt date has been modified from ${moment(editFormValues?.date).format('DD/MM/YYYY')} to ${moment(formValues?.date).format('DD/MM/YYYY')}`)
                    // }


                    // second page
                    if(invoice.length >  0 ){
                     invoice.map((e)=>{
                         const date = new Date(e.invoice_date);
                         const formattedDate = date.toLocaleDateString('en-GB');
                        editInvoice.map((edit)=>{
                            if(edit.refNumber !== e.refNumber || e.paymentAmount !== edit.paymentAmount){
                                invoiceData.push(` Receipt of ${e.paymentAmount} recorded for Invoice dated on ${formattedDate} - Reference No: ${e.refNumber} `)
                            }
                        })
                     
                    })
                }
                // if(invoice.length === 0){

                // }

                    // if(editFormValues.note !== null && formValues.note !== null && formValues.note === editFormValues.note){
                    //     invoiceData.push(`Note has been modified from ${editFormValues.note} to ${formValues.note}`)
                    // }

                    // if(editFormValues.note == null && formValues.note !== null ){
                    //     invoiceData.push(`Note has been Added as  ${formValues.note}`)
                    // }
                    if((editAdvance != totalAdvance ) && totalAdvance !== 0) invoiceData.push(` ₹${totalAdvance?.toFixed(2)} -  Advance amount Added`)

                }

            const reeiptInvoice = invoice.length > 0 ? invoice?.map(item => item.refNumber).join(', ') + (totalAdvance > 0 ? ' And Advance' : '') : 'Advance';

            const now = new Date();
            let hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;

            const formattedTime = `${hours}:${minutes} ${ampm}`;

            //  const storage = getsessionStorage()
          

        const data = {
            saleUpdate,
            updateCreditNote: {
                manualNoteSchemes: manualNoteSchemes.filter(i => creditNotesAvailableCredit.some(c => c.id === i.manual_notes_id) && i.advance_id === undefined),
                advanceledger: manualNoteSchemes.filter(i => creditNotesAvailableCredit.some(c => c.id === i.id) && i.advance_id !== undefined),
                customer_id: formValues.selectedCustomerVendor.customer_id,
                customer_ledger_id: formValues.selectedCustomerVendor.ledger_id,
                company_name: formValues.selectedCustomerVendor.company_name || `${formValues.selectedCustomerVendor.first_name} ${formValues.selectedCustomerVendor.last_name || ''}`
            },
            userConfig: {
                user_id: commoncookie,
                location_id: headerLocationId,
                paymentApproval: storage.role_name === 'Salesman' && app_config_data.find(d => d.key_name === 'enable_payment_approval').value === 'true' ? true : false,
            },
            receiptDataEntry: {
                sale_id: invoice?.[0]?.originalRow?.sale_id || '',
                customer_id: formValues.selectedCustomerVendor.customer_id,
                payment_amount: totalReceived,
                note: formValues.note,
                receiptDate: moment(formValues.date).format('YYYY-MM-DD'),
                image: formValues.uploadedImage.length > 0 ? [await readFileAsync(formValues.uploadedImage[0])] : []
            },
            location_id: headerLocationId,
            specialNumber: invoice.length > 0 ? invoice.map((inv) => inv.originalRow.sale_id).join(',') : '',
            note: 'Sales Payment',
            referenceNumber: totalAdvance > 0 ?
                transactionTable.filter((i) => 'paymentLedgerId' in i && 'ledger_id' in i).map(i => ({
                    ...i,
                    change: [],
                    cash_adjustment: 0,
                    die: i.due,
                    payment_amount: i.payment_amount
                }))
                : transactionTable.filter((i) => 'paymentLedgerId' in i && 'ledger_id' in i).map(i => ({
                    ...i,
                    due: i.due,
                    payment_amount: i.payment_amount
                })),
            voucherTypeId: 1,
            addAdvanceAmount: totalAdvance > 0 ? {
                amount: totalAdvance,
                customer_id: formValues.selectedCustomerVendor.customer_id,
                name: formValues.selectedCustomerVendor.company_name
            } : null,
            advanceAmount: +totalAdvance,
            timeLineData : invoiceData,
            ReceiptType : ReceiptType,
            customer_id : formValues.selectedCustomerVendor.customer_id,
            receiptData : {
                customer : formValues.selectedCustomerVendor.company_name,
                totalReceived : totalReceived,
                reeiptInvoice : reeiptInvoice,
                receipt_date : formValues?.date,
                time : formattedTime,
                received_by : storage.first_name,
                company_name : storage.company_name,
                phone : selectedData.phone_number
                
            }
        }

        if(type === 'edit' && props.type !== 'CHEQUE_REPRESENT'){
            data.receiptDataEntry.imageKey = props.editData.imageKey
            apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                dispatch(editReceiptAction({ ...data, receipt_id: props.editData.receipt_id }, (response) => {
                    if(response.status === 200){
                        props.handleClose(false)
                        resetPage()
                    }
                }))
            )
        }
        else{
            if(props.type === 'CHEQUE_REPRESENT'){
                data.chequeData = {
                    cheque_id: props.editData.chequeData.id,
                    presentedData: props.editData.representDate ? props.editData.representDate : formValues.receiptDate,
                    presentedEmployee: props.editData.selectedEmployee,
                    remarks: props.editData.remarks,
                    chequeStatus: 5
                }
            }
            apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                dispatch(receiptEntry(data, () => {}, setModalTypeHandler, setLoaderStatusHandler, (response, resdata) => {
                    if(response === 200){
                        if(props.reconciliateData){
                            props.handleReconciliate(resdata.data, transactionTable, selectedPaymentMode)
                        }
                        props.handleClose(props.manualMatch === 'ManualMatch' ? resdata?.data?.ReceiptData?.paymenTransaction?.insertId : false),
                        resetPage()
                        //notifyFunction(resdata.data, receivables)
                    }
                }))
            )
        }
        
    }

    const handleExpenseSubmit = async() => {
        const ledgerUpdateData = {
            ...props.editData,
            total_amount: totalReceived,
            payments: transactionTable.filter(i => 'paymentLedgerId' in i && 'ledger_id' in i),
            pageCount: 0,
            numPerPage : 20,
        }
        if(totalReceived === props.editData.total_amount){
            ledgerUpdateData.status = 'Completed'
        }

        const ledgerEntryId = transactionTable.map((t,i) => typeof t.cashboxLedgerId === 'undefined' ?  t.paymentLedgerId : t.cashboxLedgerId)
        const body = { 
            id:[...ledgerEntryId, props.editData.supplierLedgerId],
            name: null
        }
        const ledgerData = {
            location_id: headerLocationId,
            specialNumber: props.selectedInvoice,
            note: 'Expenses Entry',
            voucherTypeId: 1,
        }
        const accountTransaction = []

        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(chartOfAccountsIdNameAction(body, (list) => {
                list.forEach(d => {
                    const  { id, creditSign, debitSign } = d
                    const accountData = {
                        accountId: id,
                        description: 'Expenses Entry'
                    }

                    if(props.editData.supplierLedgerId === id){
                        accountData.amount = debitSign * totalReceived || 0
                        accountTransaction.push(accountData)
                    }
                    else if(ledgerEntryId.includes(id)){
                        const { payment_amount } = transactionTable.find(l => (l.cashboxLedgerId === id || l.paymentLedgerId === id))
                        accountData.amount = creditSign * +payment_amount || 0
                        accountTransaction.push(accountData)
                    }
                })
                ledgerData.accountTransaction = accountTransaction
                ledgerUpdateData.transactionPayload = ledgerData
                ledgerUpdateData.total_amount = props.editData.total_amount
                ledgerUpdateData.received_amount = props.editData.received_amount + totalReceived
                dispatch(PaymentExpenseAction(props.editData.id, ledgerUpdateData))
            }))
        )
        props.handleClose(false)
        resetPage()
    }

    const handlePaymentSubmit = async(type) => {
        if(headerLocationId === 'null'){
            setOpenAlert(true)
            return
        }

        const payables = invoice.map((inv) => {
            const newObj = { ...inv }
            const sub = totalReceived - (+inv.originalRow.total - +inv.originalRow.paid_amount)
            let individualTotal = totalReceived

            if(Math.sign(sub) === 1 || Math.sign(sub) === 0){
                newObj.paid_amount = totalReceived
                newObj.payment_type = transactionTable.map(d => d.payment_type.split(' ')[0]).join(', ')

                let inventory = false
                let status = inv.originalRow.status ? inv.originalRow.status : 'New'

                if(inv.originalRow.received_goods === "received"){
                    status = 'Completed'
                }

                newObj.inventory = inventory
                newObj.status = status
                individualTotal = sub
            }
            else {
                newObj.paid_amount = individualTotal
                newObj.payment_type = transactionTable.map(d => d.payment_type.split(' ')[0]).join(', ')
                individualTotal = 0
            }
            newObj.receiving_id = inv.originalRow.receiving_id
            newObj.receivings_items = inv.originalRow.receivings_items
            return newObj
        })

        const ledger = {
            location_id: headerLocationId,
            note: 'Purchase Payment',
            referenceNumber: transactionTable.filter(i => 'paymentLedgerId' in i && 'ledger_id' in i).map(d => ({...d, tendered: d.tendered ? d.tendered : []})),
            receiving_id: invoice.map(inv => inv.originalRow.receiving_id).join(',')
        }

        let remainingPaidAmount = totalReceived
        const payableUpdate = payables.map((inv) => {
            const paymentAmount = Number(inv.paymentAmount ?? 0)
            let receivedAmount = 0

            if(totalReceived <= paymentAmount){
                receivedAmount = paymentAmount
            }
            else{
                if(remainingPaidAmount > 0 && remainingPaidAmount >= paymentAmount){
                    receivedAmount = paymentAmount
                    remainingPaidAmount -= paymentAmount
                }

                else{
                    receivedAmount = remainingPaidAmount
                    remainingPaidAmount = 0
                }
            }

            return{
                ...inv,
                paid_amount: receivedAmount
            }
        })
let invoiceData = []
let ReceiptType ;
            if(type !== 'edit'){
                ReceiptType = 'Payment Entry'
                invoiceData.push(transactionTable.length > 0 ?  `${transactionTable[0].payment_amount} Received from ${selectedData.company_name} Via ${transactionTable[0].payment_type}` : `${creditNotesAvailableCredit[0].payable} Adjusted from ${selectedData.company_name} via Debit Note/Advance`)
                
            invoice.map((e)=>{
                const date = new Date(e.invoice_date);
                const formattedDate = date.toLocaleDateString('en-GB');
                invoiceData.push(` Receipt of ${e.paymentAmount} recorded for Invoice dated on ${formattedDate} - Reference No: ${e.refNumber} `)
            })
            if(totalAdvance > 0 ) invoiceData.push(` ${ totalAdvance?.toFixed(2)} rs. Advance Amount Added`)
            
            }

                if(type === 'edit'){
                    ReceiptType = 'Payment Edit'
                    const normalize = (str) =>
                    str?.toLowerCase().replace(/\s+/g, ' ').trim();

                    if(transactionTable.length > 0 && editTransactionTable.length > 0 && normalize(transactionTable[0].payment_type) !== normalize(editTransactionTable[0]?.payment_type)){
                        invoiceData.push(`${transactionTable[0].payment_amount} Received from ${selectedData.company_name} Via ${transactionTable[0].payment_type}`)
                    }
                    // if( transactionTable.length > 0 && normalize(transactionTable[0].payment_type) === normalize(editTransactionTable[0]?.payment_type)){
                    //     if(transactionTable[0].payment_amount != editTransactionTable[0]?.payment_amount){
                    //         invoiceData.push(`Modified from ${editTransactionTable[0]?.payment_amount} to ${transactionTable[0].payment_amount}  Received from ${selectedData.company_name} Via ${transactionTable[0].payment_type} `)
                    //     }
                    // }
                    if(editTransactionTable.length > 0 &&  editCreditNotesAvailableCredit.length === 0 && creditNotesAvailableCredit.length > 0){
                        invoiceData.push(`${creditNotesAvailableCredit[0].payable} Adjusted from ${selectedData.company_name} via Debit Note/Advance`)
                    }
                    //  if(editTransactionTable.length === 0 &&  editCreditNotesAvailableCredit.length > 0 && transactionTable.length > 0){
                    //     invoiceData.push(`Modified from  Debit note to payment method - ${transactionTable[0].payment_amount} Received from ${selectedData.company_name} Via ${transactionTable[0].payment_type}- ref no : ${creditNotesAvailableCredit[0]?.refNumber}`)
                    // }
                    // if(creditNotesAvailableCredit.length > 0 && editCreditNotesAvailableCredit.length > 0 && editCreditNotesAvailableCredit[0]?.refNumber !== creditNotesAvailableCredit[0]?.refNumber){
                    //     invoiceData.push(`Debit Note has modified from  ${editCreditNotesAvailableCredit[0]?.refNumber} to ${creditNotesAvailableCredit[0]?.refNumber} And adjusted amount of  ${editCreditNotesAvailableCredit[0]?.adjustedAmount}`)
                    // }
                    // if(editCreditNotesAvailableCredit.length > 0  &&  editCreditNotesAvailableCredit.length > 0 &&  editCreditNotesAvailableCredit[0]?.refNumber === creditNotesAvailableCredit[0]?.refNumber){
                    //     invoiceData.push(` Adjusted amount modified from   ${editCreditNotesAvailableCredit[0]?.adjustedAmount} to  ${creditNotesAvailableCredit[0]?.adjustedAmount} in the ref no : ${editCreditNotesAvailableCredit[0]?.refNumber}`)
                    // }
                    // if(moment(formValues?.date).format('DD/MM/YYYY') !== moment(editFormValues?.date).format('DD/MM/YYYY')){
                    //     invoiceData.push(`Receipt date has been modified from ${moment(editFormValues?.date).format('DD/MM/YYYY')} to ${moment(formValues?.date).format('DD/MM/YYYY')}`)
                    // }


                    // second page
                    if(invoice.length >  0 ){
                     invoice.map((e)=>{
                         const date = new Date(e.invoice_date);
                         const formattedDate = date.toLocaleDateString('en-GB');
                        editInvoice.map((edit)=>{
                            if(edit.po_number !== e.po_number){
                                invoiceData.push(` Receipt of ${e.paymentAmount} recorded for Invoice dated on ${formattedDate} - Reference No: ${e.po_number} `)
                            }
                            // else if(edit.paymentAmount != e.paymentAmount ){
                            //     invoiceData.push(` Receipt of ${edit.po_number} modified from  ${edit.paymentAmount} to ${e.paymentAmount} `)
                            // }
                        })
                     
                    })
                }
                // if(invoice.length === 0){

                // }

                    // if(editFormValues.note !== null & formValues.note !== null ){
                    //     invoiceData.push(`Note has been modified from ${editFormValues.note} to ${formValues.note}`)
                    // }

                    // if(editFormValues.note == null & formValues.note !== null ){
                    //     invoiceData.push(`Note has been Added as  ${formValues.note}`)
                    // }
                    if(totalAdvance > 0 ) invoiceData.push(`  ₹${totalAdvance?.toFixed(2)} -  Advance amount Added`)

                }

         

        const data = {
            payables: payableUpdate,
            location_id: headerLocationId,
            updateDebitNote: {
                manualNoteSchemes: manualNoteSchemes.filter(i => creditNotesAvailableCredit.some(c => c.id === i.manual_notes_id) && i.advance_id === undefined),
                advanceledger: manualNoteSchemes.filter(i => creditNotesAvailableCredit.some(c => c.id === i.id) && i.advance_id !== undefined),
                supplier_id: formValues.selectedCustomerVendor.supplier_id,
                supplier_ledger_id: formValues.selectedCustomerVendor.ledger_id,
                company_name: formValues.selectedCustomerVendor
            },
            receiptDataEntry: {
                purchase_id: ledger.receiving_id,
                vendor_id: formValues.selectedCustomerVendor.supplier_id,
                payment_amount: totalReceived,
                note: formValues.note,
                receiptDate: moment(formValues.date).format('YYYY-MM-DD'),
                image: formValues.uploadedImage.length > 0 ? [await readFileAsync(formValues.uploadedImage[0])] : []
            },
            ledger,
            addAdvanceAmount: totalAdvance > 0 ? {
                amount: totalAdvance,
                supplierId: formValues.selectedCustomerVendor.supplier_id,
                name: formValues.selectedCustomerVendor.company_name
            } : null,
            timeLineData : invoiceData,
            ReceiptType : ReceiptType
        }

        if(type === 'edit'){
            data.receiptDataEntry.imageKey = props.editData.imageKey
            apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                dispatch(payablesPaymentEntryEdit({ ...data, receipt_id: props.editData.receipt_id }, (response, responseData) => {
                    if(response){
                        props.handleClose(false)
                        resetPage()
                    }
                }))
            )
        }
        else{
            apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                dispatch(payablesPaymentEntry(data, null, null, (response, responseData) => {
                    if(response){
                        if(props.reconciliateData){
                            props.handleReconciliate(responseData, transactionTable)
                        }
                        props.handleClose(props.manualMatch === 'ManualMatch' ? responseData?.transaction?.payment_transaction.insertId : false),
                        resetPage()
                        //notifyFunction(response, payables)
                    }
                }))
            )
        }

    }

    const dialogSubmit = () => {
        if(props.custType === 'CUSTOMER'){
            handleReceiptSubmit(props.entryType)
        }
        else{
            handlePaymentSubmit(props.entryType)
        }
    }

    const notifyFunction = async (resData, receivablesPayables) => {
    try {
        // const storage = getsessionStorage();
        const emp_id = storage.employee_id;

        dispatch(getLoginRoleAction(emp_id, async (role_name, token, content) => {
            if (roleType.includes(role_name)) {
                const notify_type = notificationType(props.custType === 'CUSTOMER' ? 'sales payment' : 'purchase payment');
                const notify_content = content.filter(m => m.notification_type === notify_type);
                const paymentData = {}
                if (notify_content.length) {
                    if (props.custType === 'CUSTOMER') {
                        const paymentRefId = formValues?.selectedCustomerVendor?.customer_id;
                        const customerName = formValues?.selectedCustomerVendor?.company_name;
                        const amountValue = totalReceived;
                        const locationName = paymentData.location_name ?? resData.location_name;
                        const contentBody = `${customerName} \n₹${amountValue} \n${locationName} \n${paymentRefId}`;
                        
                        sendNtfy(token, notify_content[0].title, contentBody);
                        // dispatch(CreateNotificationAction({
                        //     content_body: contentBody,
                        //     title: notify_content[0].title,
                        //     time: getDateTimeFormat(new Date()),
                        //     active: '1',
                        //     type: 'receipt',
                        //     type_id: resData?.receipt_id
                        // }));
                    } else {
                        const purchaseId = receivablesPayables[0]?.originalRow?.receiving_id;
                        const res = await dispatch(getbyidPurchasesAction(purchaseId));
                        const paymentData = res?.payload || {};

                        const paymentRefId = formValues?.selectedCustomerVendor?.supplier_id || '';
                        const vendorName = formValues?.selectedCustomerVendor?.company_name || '';
                        const amountValue = totalReceived;
                        const locationName = paymentData.location_name || '';

                        const contentBody = `${paymentRefId} \n₹${vendorName} \n${amountValue} \n${locationName}`;
                        
                        sendNtfy(token, notify_content[0].title, contentBody);
                        // dispatch(CreateNotificationAction({
                        //     content_body: contentBody,
                        //     title: notify_content[0].title,
                        //     time: getDateTimeFormat(new Date()),
                        //     active: '1'
                        // }));
                    }
                }
            }
        }));
    } catch (err) {
        console.error("Notification error:", err);
    }
};
 
    const handleClose = () => {
        setPage(1)
        resetPage()
        setTabTitleValue(1)
        setTabValue(1)
        props.handleClose(false)
    }

    const resetPage = () => {
        setInvoice([])
        setCreditNotesAvailableCredit([])
        setTransactionTable([])
        setGetPay([])
        setManualNoteSchemes([])
        setFormValues((prev) => ({
            ...prev,
            date: moment().format('YYYY-MM-DD'),
            selectedCustomerVendor: null,
            advanceAmount: null,
            uploadedImage: []
        }))
        setPage(1)
        setSubmitDisable(false)
        setAdvanceConfirmDialogOpen(false)
        dispatch(setReceiptEditDataAction({data: {}}))
    }

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        setInvoice([])
        if(transactionTable.length > 0){
            setFormValues((prev) => ({ ...prev, advanceAmount: totalPaymentAmount }))
        }
        else{
            setFormValues((prev) => ({ ...prev, advanceAmount: null }))
        }
    }

    const handleTitleTabChange = (event, newValue) => {
        setTabTitleValue(newValue)
        if(props?.custType === 'CUSTOMER' && newValue === 2) {
            setAdjustmentOpen(1)
        }
       
        if(props?.custType === 'VENDOR' && newValue === 2) {
            setAdjustmentOpen(0)
        }
    }

    const tot = props.status === 'edit' ? totalAmount : Number(((Number(totalCost()) || 0) + (Number(taxes()) || 0)).toFixed(2))

    const hasCreditMismatch = (creditNotesAvailableCredit.length > 0 || props.pageType === 'EXPENSE') && totalReceived !== totalReceipt
    const invoiceNotSelected = invoice.length === 0 && (formValues.advanceAmount === null || formValues.advanceAmount === '')
    const isUnderPaid = totalReceipt > totalReceived
    const isAdvanceInvalidAndMismatch = (formValues.advanceAmount !== null && formValues.advanceAmount !== '' && Number(formValues.advanceAmount) !== totalReceived)
    const hasExcessReceiptAmount = totalReceived < totalReceipt
    const invoicePaymentAmountMismatch = invoice.some(row => Number(row.paymentAmount) > Number(props.custType === 'CUSTOMER' ? row.receivable : row.payable))

    const summaryBackgroundColor = hasCreditMismatch || isUnderPaid || invoiceNotSelected || isAdvanceInvalidAndMismatch || submitDisable || hasExcessReceiptAmount ? 'rgba(255, 153, 51, 0.5)' : 'rgba(205, 254, 194, 1)'


    useEffect(()=>{ 
        if( props.entryType === 'edit' && timeline && (transactionTable.length > 0 || creditNotesAvailableCredit.length > 0) && Object.keys(formValues).length > 0){
            setEditCreditNotesAvailableCredit(creditNotesAvailableCredit)
            setEditTransactionTable(transactionTable)
            setEditFormValues(formValues)
            setTimeline(false)
        }
        if( props.entryType === 'edit' && invoice.length > 0 && invoiceStatus){
            setEditInvoice(invoice)
            setInvoiceStatus(false)
        }
        if( props.entryType === 'edit' && totalAdvance){
            seteditAdvance(totalAdvance)
        }
    },[transactionTable,creditNotesAvailableCredit,invoice,totalAdvance])


    return (
        <>
            <Dialog open={props.paymentOpen} maxWidth='lg' fullWidth sx={{ '& .MuiPaper-root': { minHeight: '650px', maxHeight: '650px' } }}>
                <DialogTitle sx={{ px: 5, py: 0, backgroundColor: '#e8e8e8' }}>
                    <Grid container>
                        <Grid size={11}>
                            <Tabs value={tabTitleValue} onChange={handleTitleTabChange}>
                                <Tab label={props.custType === 'CUSTOMER' ? 'Receipt Entry' : 'Payment Entry'} value={1} />
                                <Tab label={props.custType === 'CUSTOMER' ? 'Pay IN' : 'Pay Out'} value={2} />
                            </Tabs>
                        </Grid>
                        {/* <Grid size={11}  display='flex' alignItems='center'>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                                {
                                    props.custType === 'CUSTOMER' ? 'Receipt Entry' : 'Payment Entry'
                                }
                            </Typography>
                        </Grid> */}

                        <Grid display='flex' justifyContent='flex-end' size={1}>
                            <IconButton onClick={() => handleClose()}>
                                <CloseIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                </DialogTitle>

                {
                    tabTitleValue === 1 &&
                    <DialogContent>
                        <Grid container spacing={3}>    
                            <Grid size={12}>
                                {
                                    page === 1 &&
                                    <Tabs value={tabValue} onChange={handleTabChange}>
                                        <Tab label={props.custType === 'CUSTOMER' ? 'Customer Receipt' : 'Vendor Payment'} value={1} />
                                        <Tab label={props.custType === 'CUSTOMER' ? 'Customer Advance' : 'Vendor Advance'} value={2} />
                                    </Tabs>
                                }
                            </Grid>

                            <Grid size={12}>
                                {/* Page 1 Contents */}
                                {
                                    page === 1 && 
                                    <Grid container spacing={3}>
                                        <Grid size={tabValue === 2 ? 4 : 6}>
                                            <Autocomplete
                                                value = {formValues.selectedCustomerVendor}
                                                options ={customerAsCompany.filter(d => props.custType === 'CUSTOMER' ? d.company_name !== null && d.customer_type === '1' : d.supplier_id)}
                                                getOptionLabel = {(option) => option.company_name}
                                                onChange={(event, newValue) => handleChange('selectedCustomerVendor', newValue)}
                                                disabled={Object.keys(props.selectedCustomer).length > 0 || props.entryType === 'edit' || props.type === 'CHEQUE_REPRESENT'}
                                                renderInput = {(params) => (
                                                    <TextField 
                                                        { ...params }
                                                        label = { props.custType === 'CUSTOMER' ? 'Customer' : 'Vendor' }
                                                        fullWidth
                                                        required
                                                        variant='filled'
                                                    />
                                                )}
                                            />
                                        </Grid>

                                        <Grid size={tabValue === 2 ? 4 : 6}>
                                            <LocalizationProvider dateAdapter={DateAdapter}>
                                                <DatePicker
                                                    disableFuture
                                                    label = 'Receipt Date'
                                                    value = {toMomentOrNull(formValues.date)}
                                                    format="DD/MM/YYYY"
                                                    onChange={(date) => handleChange('date', date)}
                                                    // disabled = {props.entryType === 'edit'}
                                                    slotProps={{ textField: { fullWidth: true, variant: 'filled', onKeyDown: e => e.preventDefault() } }}
                                                />
                                            </LocalizationProvider>
                                        </Grid>

                                        {
                                            tabValue === 2 &&
                                            <Grid size={4}>
                                                <TextField
                                                    value = {formValues.advanceAmount || ''}
                                                    onChange = {(event) => setFormValues((prev) => ({ ...prev, advanceAmount: event.target.value }))}
                                                    fullWidth
                                                    variant = 'filled'
                                                    disabled={props.type === 'CHEQUE_REPRESENT'}
                                                    label = 'Advance Amount'
                                                />
                                            </Grid>
                                        }

                                        <Grid size={8}>
                                            <Card sx={{ borderRadius: 1, p: 2, maxHeight: '116px !important', minHeight: '116px !important' }}>
                                                <Grid container spacing={3}>
                                                    <Grid size={12}>
                                                        <Stack direction='row' alignItems='center' spacing={1}>
                                                            <Typography>
                                                                {`${props.custType} DETAILS`}
                                                            </Typography>
                                                            {Object.keys(selectedData).length > 0 && formValues.selectedCustomerVendor !== null ? (
                                                                <CheckIcon style={{ color: 'green', fontSize: '20px' }} />
                                                            ) : (
                                                                <CloseIcon style={{ color: 'red', fontSize: '20px' }} />
                                                            )}
                                                        </Stack>
                                                    </Grid>

                                                    <Grid size={12}>
                                                        <Divider />
                                                    </Grid>

                                                    {Object.keys(selectedData).length > 0 && formValues.selectedCustomerVendor !== null ?
                                                        <Grid size={12}>
                                                            <Typography className='chatcontent'>
                                                                {`${selectedData.company_name || selectedData.amount}`}
                                                            </Typography>

                                                            <Typography className='dashboard-chart-content'>
                                                                {
                                                                    `${selectedData.address ? selectedData.address + ',' : ''} 
                                                                    ${selectedData.city ? selectedData.city + ',' : ''} ${selectedData.state ? selectedData.state + ',' : ''} 
                                                                    ${selectedData.country || ''} - ${selectedData.zip || ''}`
                                                                }
                                                            </Typography>

                                                            <Typography style={{ margin: '0 0 10px 0' }} className='dashboard-chart-content'>
                                                                {`Mobile No : ${selectedData.phone_number || ''}`}
                                                            </Typography>
                                
                                                            <Typography style={{ marginLeft: 'auto' }} className='dashboard-chart-content'>
                                                                {selectedData.email || ''}
                                                            </Typography>
                                                        </Grid>
                                                        : <Grid size={12}>
                                                            <Typography
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                }}
                                                                className='receiptContent'
                                                            >
                                                                Pick Customer for more Details!
                                                            </Typography>
                                                        </Grid>
                                                    }
                                                </Grid>
                                            </Card>
                                        </Grid>

                                        <Grid size={4}>
                                            <Grid container spacing={3}>
                                                <Grid size={12}>
                                                    <CardTemplate
                                                        totalIcon = {totalIcon}
                                                        selectedCustomerSupplier = {formValues.selectedCustomerSupplier}
                                                        value = {receivableAmount}
                                                        title = {props.custType === 'CUSTOMER' ? 'Receivable' : 'Payable'}
                                                        isAmount = {true}
                                                    />
                                                </Grid>

                                                <Grid size={12}>
                                                    <CardTemplate
                                                        totalIcon = {totalIcon}
                                                        selectedCustomerSupplier = {formValues.selectedCustomerSupplier}
                                                        value = {unusedCredit}
                                                        title = {'Available Credit'}
                                                        isAmount = {true}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                        <Grid
                                            sx={{ '& .MuiPaper-root': {minHeight: '280px !important', maxHeight: '280px !important'} }}
                                            size={12}>
                                            <PaymentMethods
                                                transactionTable = {transactionTable}
                                                setTransactionTable = {setTransactionTable}
                                                page = {page}
                                                total = {tot}
                                                getPay = {getPay}
                                                tab = {tabValue}
                                                advanceAmount = {formValues.advanceAmount}
                                                selectedTotal = {formValues.advanceAmount ? parseInt(formValues.advanceAmount) : getTotalSelectedAmount(invoice)}
                                                receiptDate = {formValues.date}
                                                responseType = {props.responseType}
                                                creditSelected = {creditNotesAvailableCredit.length > 0}
                                                type = {props.type}
                                                pageType = {props.pageType}
                                                reconciliateData = {props.reconciliateData}
                                                entryType = {props.entryType}
                                                customer = {formValues.selectedCustomerVendor}
                                                editData = {props.editData}
                                                setSelectedPaymentMode = {setSelectedPaymentMode}
                                                custType = {props.custType}
                                                bankId={props.bankId}
                                                manualMatch='ManualMatch'
                                            />
                                        </Grid>

                                        {
                                            tabValue === 2 &&
                                                <Grid size={8}>
                                                    <TextField
                                                        value={formValues.note || ''}
                                                        fullWidth
                                                        multiline
                                                        rows={3.4}
                                                        label='Note'
                                                        onChange={(event) => setFormValues((prev) => ({ ...prev, note: event.target.value }))}
                                                    />
                                                </Grid>
                                        }

                                        {
                                            (manualNoteSchemes.length > 0 || dummyManualNoteSchemes.length > 0) && props.pageType !== 'EXPENSE' && formValues.selectedCustomerVendor && props.type !== 'BANK_RECONCILIATION' && tabValue !== 2 && 
                                            <Grid
                                                sx={{ '& .MuiPaper-root': {minHeight: '300px !important', maxHeight: '300px !important'} }}
                                                size={12}>
                                                <CreditDebitUnusedCredit
                                                    manualNoteSchemes = {manualNoteSchemes}
                                                    setManualNoteSchemes = {setManualNoteSchemes}
                                                    creditNotesAvailableCredit = {creditNotesAvailableCredit}
                                                    setCreditNotesAvailableCredit = {setCreditNotesAvailableCredit}
                                                    paymentSelected = {transactionTable.length > 0}
                                                    custType = {props.custType}
                                                    entryType = {props.entryType}
                                                />
                                            </Grid>
                                        }
                                    </Grid>
                                }

                                {/* Page 2 Contents */}
                                {
                                    page === 2 &&
                                    <Grid container spacing={2}>
                                        <Grid size={8}>
                                            <Card sx={{ borderRadius: 1, p: 2, maxHeight: '116px !important', minHeight: '116px !important' }}>
                                                <Grid container spacing={3}>
                                                    <Grid display='flex' justifyContent='space-between' size={12}>
                                                        <Stack direction='row' alignItems='center' spacing={1}>
                                                            <Typography>
                                                                {`${props.custType} DETAILS`}
                                                            </Typography>
                                                            {Object.keys(selectedData).length > 0 && formValues.selectedCustomerVendor !== null ? (
                                                                <CheckIcon style={{ color: 'green', fontSize: '20px' }} />
                                                            ) : (
                                                                <CloseIcon style={{ color: 'red', fontSize: '20px' }} />
                                                            )}
                                                        </Stack>

                                                        <Typography>{`Receipt Date: ${moment(formValues.date).format('DD/MM/YYYY')}`}</Typography>
                                                    </Grid>

                                                    <Grid size={12}>
                                                        <Divider />
                                                    </Grid>

                                                    {Object.keys(selectedData).length > 0 && formValues.selectedCustomerVendor !== null ?
                                                        <Grid size={12}>
                                                            <Typography className='chatcontent'>
                                                                {`${selectedData.company_name || selectedData.amount}`}
                                                            </Typography>

                                                            <Typography className='dashboard-chart-content'>
                                                                {
                                                                    `${selectedData.address ? selectedData.address + ',' : ''} 
                                                                    ${selectedData.city ? selectedData.city + ',' : ''} ${selectedData.state ? selectedData.state + ',' : ''} 
                                                                    ${selectedData.country || ''} - ${selectedData.zip || ''}`
                                                                }
                                                            </Typography>

                                                            <Typography style={{ margin: '0 0 10px 0' }} className='dashboard-chart-content'>
                                                                {`Mobile No : ${selectedData.phone_number || ''}`}
                                                            </Typography>
                                
                                                            <Typography style={{ marginLeft: 'auto' }} className='dashboard-chart-content'>
                                                                {selectedData.email || ''}
                                                            </Typography>
                                                        </Grid>
                                                        : <Grid size={12}>
                                                            <Typography
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                }}
                                                                className='receiptContent'
                                                            >
                                                                Pick Customer for more Details!
                                                            </Typography>
                                                        </Grid>
                                                    }
                                                </Grid>
                                            </Card>
                                        </Grid>

                                        <Grid size={4}>
                                            {/* Payment Method and Amount */}
                                            <Card sx={{ minHeight: '40px !important', maxHeight: '40px !important', p: 3 }}>
                                                <Typography>
                                                    {getTransactionDetailsAndAmount()}
                                                </Typography>
                                            </Card>
                                        </Grid>

                                        <Grid
                                            sx={{ '& .MuiPaper-root': {minHeight: '240px !important', maxHeight: '240px !important'} }}
                                            size={12}>
                                            {/* Invoice Table */}

                                            <Invoices
                                                invoice = {invoice}
                                                setInvoice = {setInvoice}
                                                getPay = {getPay}
                                                custType = {props.custType}
                                                advanceAdded = {formValues.advanceAmount !== null && formValues.advanceAmount !== ''}
                                                selectedInvoice = {props.selectedInvoice}
                                                totalReceived = {totalReceived}
                                                totalReceipt = {totalReceipt}
                                                pageType = {props.pageType}
                                                entryType = {props.entryType}
                                            />
                                        </Grid>

                                        <Grid size={12}>
                                            <Grid container spacing={3}>
                                                <Grid size={8}>
                                                    <TextField
                                                        value={formValues.note}
                                                        fullWidth
                                                        multiline
                                                        rows={3.4}
                                                        label='Note'
                                                        onChange={(event) => setFormValues((prev) => ({ ...prev, note: event.target.value }))}
                                                    />
                                                </Grid>

                                                <Grid size={4}>
                                                    <Box sx={{ p: 3, backgroundColor: summaryBackgroundColor, borderRadius: 2 }}>
                                                        <Typography variant='h6' textAlign='end'>{`Total Received: ${totalReceived?.toFixed(2)}`}</Typography>
                            
                                                        <Typography variant='h6' textAlign='end'>{`Total Receipt Amount: ${totalReceipt?.toFixed(2)}`}</Typography>
                            
                                                        <Typography variant='h6' textAlign='end'>{`${props.custType === 'CUSTOMER' ? 'Advance Received' : 'Excess Amount'}: ${totalAdvance > 0 ? totalAdvance?.toFixed(2) : 0}`}</Typography>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                        <Grid size={12}>
                                            <Grid container spacing={3} display='flex' justifyContent='flex-end'>
                                                {
                                                    props.pageType !== 'EXPENSE' &&
                                                    <Grid size={12}>
                                                        <FilePicker uploadedFiles={formValues.uploadedImage} setUploadedFiles={(data) => {
                                                            if(controlImageEdit){
                                                                setFormValues((prev) => ({...prev, uploadedImage: data}))
                                                            }
                                                            else{
                                                                setControlImageEdit(true)
                                                            }
                                                        }}  />
                                                    </Grid>
                                                }

                                                
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                }
                            </Grid>
                        </Grid>
                    </DialogContent>
                }

                {
                    tabTitleValue === 2 &&
                    <CashOutIn 
                        type='MANUALMATCH'
                        requestMode={adjustmentOpen === 0 ? '0' : adjustmentOpen === 1 ? '1' : '2'}
                        reconciliateData={''}
                        handleClose={props.handleClose}
                        bankId={props.bankId}
                    />
                }

                {
                    tabValue === 1 && tabTitleValue === 1 &&
                    <DialogActions>
                        {
                            page === 1 ? 
                                <Grid container display='flex' justifyContent='flex-end'>
                                    <Grid>
                                        <Button
                                            variant='contained'
                                            onClick={handleNext}
                                            disabled={formValues.selectedCustomerVendor === null || (totalPaymentAmount === 0 && totalCreditAmount === 0) || hasInvalidCheque}
                                        >
                                            Next
                                        </Button>
                                    </Grid>
                                </Grid>
                            :
                                <Grid container spacing={3} display='flex' justifyContent='flex-end'>
                                    <Grid>
                                        <Button
                                            variant='contained'
                                            onClick={handlePrevious}
                                        >
                                            Previous
                                        </Button>
                                    </Grid>
                                    <Grid>
                                        <Button
                                            variant='contained'
                                            disabled={hasCreditMismatch || isUnderPaid  || isAdvanceInvalidAndMismatch || submitDisable || hasExcessReceiptAmount || invoicePaymentAmountMismatch }
                                            onClick={handleSubmit}
                                        >
                                            Submit
                                        </Button>
                                    </Grid>
                                </Grid>
                        }
                    </DialogActions>
                }

                {
                    tabValue === 2 && tabTitleValue === 1 &&
                    <DialogActions>
                        <Grid container display='flex' justifyContent='flex-end'>
                            <Grid>
                                <Button
                                    variant='contained'
                                    onClick={() => handleAdvanceSubmit(props.entryType)}
                                    disabled={formValues.selectedCustomerVendor === null || totalPaymentAmount === 0 || totalPaymentAmount !== totalAdvance || hasInvalidCheque }
                                >
                                    Submit
                                </Button>
                            </Grid>
                        </Grid>
                    </DialogActions>
                }

            </Dialog>
            <LocationAlert
                open = {openAlert}
                onClose = {() => setOpenAlert(false)}
            />
            <CommonDialog
                cancel_buttonName={'No'}
                ok_buttonName={'Yes'}
                dialogTitle={'Add Extra amount to Advance'}
                dialogContent={`Do you want add the extra cash Rs : ${totalAdvance} as Advance amount?`}
                cancel_fun={() => setAdvanceConfirmDialogOpen(false)}
                ok_fun={dialogSubmit}
                open={advanceConfirmDialogOpen}
                handleClose={() => setAdvanceConfirmDialogOpen(false)}
            />
        </>
    );

}

ManualMatchReceipt.propTypes = {
    paymentOpen: PropTypes.bool,
    custType: PropTypes.string,
    handleClose: PropTypes.func,
    pageType: PropTypes.string,
    responseType: PropTypes.string,
    status: PropTypes.string,
    editData: PropTypes.object,
    sales_items: PropTypes.array,
    selectedCustomer: PropTypes.object,
    selectedInvoice: PropTypes.number,
    entryType: PropTypes.string,
    type: PropTypes.string,
    reconciliateData: PropTypes.object,
    handleReconciliate: PropTypes.func,
}

export default ManualMatchReceipt;