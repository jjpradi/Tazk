import { AppBar, Autocomplete, Box, Button, Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Grid, IconButton, Stack, Step, StepLabel, Stepper, Tab, Tabs, TextField, Toolbar, Typography } from "@mui/material";
import PropTypes from "prop-types";
import CloseIcon from '@mui/icons-material/Close';
import { useContext, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { customerAsCompanyAction, getbyidCustomerAction, getSearchByCustomerSupplierAction } from "redux/actions/customer_actions";
import totalIcon from '../../assets/dashboardIcons/rupee.svg';
import CheckIcon from '@mui/icons-material/Check';
import CreateNewButtonContext from "context/CreateNewButtonContext";
import { useCustomFetch } from "utils/useCustomFetch";
import { consolidatedReceivings, editReceiptAction, getReceiptEditDataAction, listcompletedSalesOutstandingAction, receiptEntry, receiptTimelineAction, saleIdGET, SalesAdvanceEntry, salesAdvanceEntryEdit, salesRefundEntryAction, setReceiptEditDataAction } from "redux/actions/sales_actions";
import { getManualNoteSchemesByIdAction } from "redux/actions/manualNotes_actions";
import CardTemplate from "./CardTemplate";
import PaymentMethods from "./PaymentMethods";
import CreditDebitUnusedCredit from "./CreditDebitUnusedCredit";
import Invoices from "./Invoices";
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
import { getSupplierDetailsByIdAction, getVendorExpensesAction } from "redux/actions/vendor_actions";
import { getbyidPurchasesAction, payablesPaymentEntry, payablesPaymentEntryEdit, PurchaseAdvanceEntry, purchaseAdvanceEntryEdit, vendorRefundEntryAction } from "redux/actions/purchase_actions";
import { chartOfAccountsIdNameAction } from "redux/actions/chartOfAccounts";
import { PaymentExpenseAction } from "redux/actions/expense_actions";
import dayjs from "dayjs";
import manualNotes from "pages/sales/manualNotes";
import FilePicker from '../../../src/components/FilePicker/indexIn';
import { getAllemployeeincludingAdminAction } from "redux/actions/soTracking_actions";
import { getAppConfigDataAction } from "redux/actions/app_config_actions";
import API_URLS from "../../utils/customFetchApiUrls";
import NegativeCashWarning from "components/NegativeCashWarning";
import { getBankAndCashAccountsAction } from "redux/actions/cash_box_actions";
import Advances from './Advances'
import { editSalesRefundEntryAction } from "../../redux/actions/sales_actions";
import { editVendorRefundEntryAction } from "../../redux/actions/purchase_actions";
import toMomentOrNull from "utils/DateFixer";
import { getCustomerSupplierDataByIdAction, getSearchByCustomerSupplierDataAction, setSearchByCustomerSupplierDataAction } from "../../redux/actions/customer_actions";
import SearchIcon from '@mui/icons-material/Search';
import { OpenalertActions } from "../../redux/actions/alert_actions";
import { searchErrorMessage } from "../../utils/content";

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

function ReceiptPayments(props) {

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
        appConfigReducer: { app_config_data },
        cashBoxReducer: { cashAndBankAccounts },
        CashOutInReducer: { cashOutIn_denomination }
    } = useSelector(state => state)
    const { headerLocationId, setLoaderStatusHandler, setModalTypeHandler, commoncookie } = useContext(CreateNewButtonContext)

    const [page, setPage] = useState(1)
    const [formValues, setFormValues] = useState({
        selectedCustomerVendor: null,
        date: moment(),
        advanceAmount: null,
        refundAmount: null,
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
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [controlImageEdit, setControlImageEdit] = useState(true)
    const [tabValue, setTabValue] = useState(1)    
    const [isApiFinished, setIsApiFinished] = useState(false)
    const [selectedPaymentMode, setSelectedPaymentMode] = useState(null)
    const [paymentSectionTab, setPaymentSectionTab] = useState('payment')
    const [needNegativeCashAlert, setNeedNegativeCashAlert] = useState(false)
    const [negativeCashAlertOpen, setNegativeCashAlertOpen] = useState(false)
    const [negativeCashAmount, setNegativeCashAmount] = useState(0)
    const [customerVendorAdvances, setCustomerVendorAdvances] = useState([])
    const [selectedAdvance, setSelectedAdvance] = useState([])
    const [totalAdvanceRemaining, setTotalAdvanceRemaining] = useState(0)
    const [vendorExpenses, setVendorExpenses] = useState([])
    const [dummyCustomerVendorAdvances, setDummyCustomerVendorAdvances] = useState([])
    const [searchText, setSearchText] = useState('')

    const totalPaymentAmount = transactionTable.reduce((sum, list) => sum + Number(list.payment_amount ?? 0), 0)
    const totalCreditAmount = creditNotesAvailableCredit.reduce((sum, list) => sum + Number(list.adjustedAmount ?? 0), 0)
    const totalReceived = totalPaymentAmount + totalCreditAmount

    const  totalReceipt = invoice.reduce((sum, list) => sum + Number(list?.paymentAmount ?? 0), 0)

    const totalAdvance = tabValue === 2 ? Number(formValues?.advanceAmount ?? 0) : totalPaymentAmount - totalReceipt

    const totalRefund = Number(formValues.refundAmount)
    const totalAdjusted = selectedAdvance.reduce((sum, list) => sum + Number(list.paymentAmount), 0)

    useEffect(() => {
        // dispatch(customerAsCompanyAction())
        dispatch(getAllemployeeincludingAdminAction())
        // dispatch(getAppConfigDataAction())
        const payload = {
            chip: 'All',
            searchString: ''
        }
        dispatch(getBankAndCashAccountsAction(payload))
        dispatch(setSearchByCustomerSupplierDataAction([]))
    }, [])

    useEffect(() => {
        if(Object.keys(props.editData).length > 0 && (props.entryType === 'edit')){
            const type = props.custType === 'CUSTOMER' ? 'Customer' : 'Supplier'
            const customerSupplierId = props.custType === 'CUSTOMER' ? props.editData.customer_id ?? props.editData.receipt[0].customer_id : props.editData.vendor_id
            dispatch(getCustomerSupplierDataByIdAction(type, customerSupplierId, async(response) => {
                const res = await response
                if(res?.length > 0){
                    const customerSupplierRes = res?.[0]
                    setFormValues((prev) => ({
                        ...prev,
                        selectedCustomerVendor: customerSupplierRes
                    }))
                }
            }))
        }
    }, [props.entryType, props.editData])

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
            if(tabValue === 3){
                const {data} = await customFetch(API_URLS.GET_CUSTOMER_VENDOR_ADVANCES(headerLocationId, 'customer', formValues.selectedCustomerVendor.customer_id), 'GET', {})
                if(props.entryType === 'edit'){
                    setDummyCustomerVendorAdvances(data)
                }
                else{
                    setCustomerVendorAdvances(data)
                    setTotalAdvanceRemaining(data.reduce((sum, list) => sum + Number(list.balance_amount), 0))
                }
            }
        }
        else if(formValues.selectedCustomerVendor !== null && props.custType === 'VENDOR'){
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
            if(tabValue === 3){
                const {data} = await customFetch(API_URLS.GET_CUSTOMER_VENDOR_ADVANCES(headerLocationId, 'supplier', formValues.selectedCustomerVendor.supplier_id), 'GET', {})
                if(props.entryType === 'edit'){
                    setDummyCustomerVendorAdvances(data)
                }
                else{
                    setCustomerVendorAdvances(data)
                    setTotalAdvanceRemaining(data.reduce((sum, list) => sum + Number(list.balance_amount), 0))
                }
            }
        }
    })();
}, [formValues.selectedCustomerVendor, tabValue])

    useEffect(() => {
        if(Object.keys(props.selectedCustomer).length > 0){
            setSearchText(props.selectedCustomer.company_name)
            setFormValues((prev) => ({ ...prev, selectedCustomerVendor: props.selectedCustomer }))
        }
    }, [props.selectedCustomer])

    useEffect(() => {
        if(props.type === 'CHEQUE_REPRESENT'){
            if(Object.keys(props.editData).length > 0 && !formValues.selectedCustomerVendor){
                const type = props.custType === 'CUSTOMER' ? 'Customer' : 'Supplier'
                const customerSupplierId = props.custType === 'CUSTOMER' ? props.editData.customer_id ?? props.editData.receipt[0].customer_id : props.editData.vendor_id
                dispatch(getCustomerSupplierDataByIdAction(type, customerSupplierId, async(response) => {
                    const res = await response
                    if(res?.length > 0){
                        const customerSupplierRes = res?.[0]
                        setSearchText(customerSupplierRes.company_name)
                        setFormValues((prev) => ({
                            ...prev,
                            selectedCustomerVendor: customerSupplierRes,
                            date: props.editData.representDate ? moment(props.editData.representDate).format('YYYY-MM-DD') :  moment().format('YYYY-MM-DD')
                        }))
                    }
                }))
                // const customerVendorData = customerAsCompany.filter(d => d.company_name !== null && d.customer_type === '1').find(d => d.customer_id === props.editData.receipt[0].customer_id)
                // setFormValues((prev) => ({
                //     ...prev,
                //     selectedCustomerVendor: customerVendorData,
                // }))
            }
        }
        else{
            if(Object.keys(props.editData).length > 0 && customerAsCompany.length > 0 && ((props.editData?.receipt_id != undefined && props.editData?.receipt_id != null && props.editData?.receipt_id !== '') || (props.editData?.id != undefined && props.editData?.id != null && props.editData?.id !== '')) ){
                const customerVendorData = customerAsCompany.filter(d => props.custType === 'CUSTOMER' ? d.company_name !== null && d.customer_type === '1' : d.supplier_id).find(d => props.custType === 'CUSTOMER' ? d.customer_id === props.editData.customer_id : d.supplier_id === props.editData.vendor_id)
                dispatch(getReceiptEditDataAction({receipt_id: props.editData?.receipt_id ?? props.editData.id, type: props.custType === 'CUSTOMER' ? 'Receipts' : 'Payments'}))
                setSearchText(props.editData.company_name)
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
            const advanceUsed = editReceiptData.usedAdvance.filter(d => d.description === 'Advance Used' || d.description === 'Advance Paid Used')
            const advanceRefund = editReceiptData.advanceRefund
            const advanceCreate = props.custType === 'CUSTOMER' ? editReceiptData.usedAdvance.filter(d => d.description === 'Advance - Receipts Create') : editReceiptData.usedAdvance.filter(d => d.description === 'Advance Paid- Receipts Create')
            const editInvoice = editReceiptData.Invoice

            let updatedSchemes = [...dummyManualNoteSchemes];

            // ===============
            // Credit / Debit Note
            // ==============
            if (creditDebitNote.length > 0) {
                const groupedNotes = creditDebitNote.reduce((acc, row) => {
                    const key = row.id ?? row.sequence_number;
                    if (!acc[key]) {
                        acc[key] = {
                            ...row,
                            payment_amount: Number(row.payment_amount) || 0,
                        };
                    } else {
                        acc[key].payment_amount =
                            Number(acc[key].payment_amount || 0) + (Number(row.payment_amount) || 0);
                    }
                    return acc;
                }, {});

                Object.values(groupedNotes).forEach((note) => {
                    const noteAmount = Number(note.payment_amount) || 0;
                    const existingIndex = updatedSchemes.findIndex(
                        (d) => (d.manual_notes_id ?? d.id) === note.id || d.sequence_number === note.sequence_number
                    );

                    // Do not create synthetic/manual rows during edit mode.
                    // If a note is not present in current vendor schemes, skip it.
                    if (existingIndex !== -1) {
                        updatedSchemes[existingIndex] = {
                            ...updatedSchemes[existingIndex],
                            id: note.scheme_id ?? updatedSchemes[existingIndex].id,
                            adjusted_amount: updatedSchemes[existingIndex].adjusted_amount - noteAmount,
                            adjustedAmount: noteAmount,
                            new_adjusted_amount: noteAmount,
                            balance_amount: Number(updatedSchemes[existingIndex].balance_amount) + noteAmount
                        };
                    }
                    else{
                        updatedSchemes.push({
                            manual_notes_id: note.id,
                            id: note.scheme_id ?? note.id,
                            sequence_number: note.sequence_number,
                            date: note.date,
                            balance_amount: noteAmount,
                            adjusted_amount: 0,
                            adjustedAmount: noteAmount,
                            new_adjusted_amount: noteAmount,
                            selected: false
                        });
                    }
                });
            }

            // ========================
            // Advance used for Receipt
            // ========================
            if (advanceUsed.length > 0) {
                const groupedAdvance = advanceUsed.reduce((acc, row) => {
                    const key = row.advance_id;
                    if (!acc[key]) {
                        acc[key] = { ...row, payment_amount: Number(row.payment_amount) || 0 };
                    } else {
                        acc[key].payment_amount =
                            Number(acc[key].payment_amount || 0) + (Number(row.payment_amount) || 0);
                    }
                    return acc;
                }, {});

                Object.values(groupedAdvance).forEach((adv) => {
                    const existingIndex = updatedSchemes.findIndex(d => d.advance_id === adv.advance_id);
                    const paymentAmt = Number(adv.payment_amount) || 0;

                    if (existingIndex === -1) {
                        updatedSchemes.push({
                            id: adv.advance_id,
                            advance_id: adv.advance_id,
                            amount: Number(adv.amount) || paymentAmt,
                            balance_amount: paymentAmt,
                            new_adjusted_amount: paymentAmt,
                            adjustedAmount: paymentAmt,
                            adjusted_amount: Math.abs(Number(adv.adjusted_amount || 0) - paymentAmt),
                            receipt_number: adv.receipt_number,
                            receipt_date: adv.receipt_date,
                            date: adv.receipt_date
                        });
                    } else {
                        updatedSchemes[existingIndex] = {
                            ...updatedSchemes[existingIndex],
                            adjusted_amount: updatedSchemes[existingIndex].adjusted_amount - paymentAmt,
                            adjustedAmount: paymentAmt,
                            new_adjusted_amount: paymentAmt,
                            balance_amount: Number(updatedSchemes[existingIndex].balance_amount) + paymentAmt
                        };
                    }
                });
            }

            // Apply the combined updates once
            if (updatedSchemes.length > 0) {
                setManualNoteSchemes(updatedSchemes);
            }
            if (creditDebitNote.length > 0 || advanceUsed.length > 0) {
                setTabValue(1);
                setPaymentSectionTab('credit')
            }

            // ============================
            // Advance created from Receipt
            // ============================
            if(advanceCreate.length > 0){
                setFormValues((prev) => ({ ...prev, advanceAmount: advanceCreate[0].payment_amount }))
                setTabValue(2)
            }

            // =======================================
            // Advance Refund for Customer and Vendor
            // =======================================
            if(advanceRefund.length > 0){
                const updatedCustomerVendorAdvances = dummyCustomerVendorAdvances.map(adv => {
                    const selectedAdvance = advanceRefund.find(d => d.advance_id === adv.id)
                    if(!selectedAdvance){
                        return adv
                    }
                    
                    const newInvoice = {
                        id: selectedAdvance.advance_id,
                        amount: selectedAdvance.amount,
                        adjusted_amount: selectedAdvance.adjusted_amount - selectedAdvance.payment_amount,
                        balance_amount: selectedAdvance.balance_amount + selectedAdvance.payment_amount,
                        receipt_number: selectedAdvance.receipt_number,
                        receipt_date: selectedAdvance.receipt_date,
                        paymentAmount: selectedAdvance.payment_amount
                    }
                    return newInvoice
                    
                }).filter(Boolean)

                const missingAdvances = advanceRefund.filter(adv => {
                    return !dummyCustomerVendorAdvances.some(d => d.id === adv.advance_id)
                })

                const formatMissing = missingAdvances.map(adv => {
                    return {
                        id: adv.advance_id,
                        amount: adv.amount,
                        adjusted_amount: adv.adjusted_amount - adv.payment_amount,
                        balance_amount: adv.balance_amount + adv.payment_amount,
                        receipt_number: adv.receipt_number,
                        receipt_date: adv.receipt_date,
                        paymentAmount: adv.payment_amount
                    }
                })
                setFormValues((prev) => ({ ...prev, refundAmount: advanceRefund.reduce((sum, list) => sum + Number(list.payment_amount), 0) }))
                setCustomerVendorAdvances([...updatedCustomerVendorAdvances, ...formatMissing])
                setTotalAdvanceRemaining([...updatedCustomerVendorAdvances, ...formatMissing].reduce((sum, list) => sum + Number(list?.balance_amount), 0))
                setTabValue(3)
            }

            // ================================
            // Invoice for Customer and Vendor
            // ================================
            if(editInvoice.length > 0){
                const updatedGetPay = dummyGetPay.map((d) => {
                    // const selectedInvoice = props.custType === 'CUSTOMER'
                    //     ? editInvoice.find(inv => inv.sale_id === d.sale_id)
                    //     : editInvoice.find(inv => inv.receiving_id === d.receiving_id);

                    const selectedInvoice =
                                        d.due_type === 'OPENING'
                                            ? editInvoice.find(inv => inv.invoice_number === 'OPENING_BALANCE')
                                            : props.custType === 'CUSTOMER'
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
                            // paid_amount = amount paid by OTHER receipts (excluding this one) so
                            // Invoices.js receivable = total - paid_amount = current_due + this_payment
                            paid_amount: Number(selectedInvoice.received_amount ?? 0) - Number(selectedInvoice.payment_amount ?? 0),
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
                            pending_amount: selectedInvoice.due_amount,
                            // paid by OTHER receipts only; Invoices.js payable = total - paid_amount
                            paid_amount: Number(selectedInvoice.paid_amount ?? 0) - Number(selectedInvoice.payment_amount ?? 0),
                            receiving_id: selectedInvoice.receiving_id,
                            total: selectedInvoice.total,
                            paymentAmount: selectedInvoice.payment_amount < totalReceived ? totalReceived : selectedInvoice.payment_amount,
                            invoice_number: selectedInvoice.invoice_number,
                            location_name: selectedInvoice.location_name
                        }
                        return newBill
                    }
                }).filter(Boolean);

                // const missingInvoices = editInvoice.filter(inv => {
                //     return props.custType === 'CUSTOMER'
                //         ? !dummyGetPay.some(d => d.sale_id === inv.sale_id)
                //         : !dummyGetPay.some(d => d.receiving_id === inv.receiving_id);
                // });
                const missingInvoices = editInvoice.filter(inv => {
                                        if (inv.sale_id === null) {
                                            return !dummyGetPay.some(d => d.due_type === 'OPENING');
                                        }

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
                            paid_amount: Number(inv.received_amount ?? 0) - Number(inv.payment_amount ?? 0),
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
                            pending_amount: inv.due_amount,
                            paid_amount: Number(inv.paid_amount ?? 0) - Number(inv.payment_amount ?? 0),
                            sale_id: inv.receiving,
                            receiving_id: inv.receiving_id,
                            total: inv.total,
                            paymentAmount: inv.payment_amount < totalReceived ? totalReceived : inv.payment_amount,
                            invoice_number: inv.invoice_number,
                            location_name: inv.location_name
                        }

                    }
                });
                const uniqueGetPay = [
                    ...updatedGetPay.filter(d => d.due_type !== 'OPENING'),
                    ...updatedGetPay.filter(d => d.due_type === 'OPENING').slice(0, 1)
                ];



                setGetPay([...uniqueGetPay, ...formattedMissing]);
                // setGetPay([...updatedGetPay, ...formattedMissing])
            }
        }
    }, [editReceiptData, dummyManualNoteSchemes, dummyGetPay, dummyCustomerVendorAdvances])


    useEffect(() => {
        if(props.type === 'CHEQUE_REPRESENT' && Object.keys(props.editData).length > 0){
            if(props.editData.receiptDetails[0].advance === 'Advance - Receipts Create'){
                setTabValue(2)
                setFormValues((prev) => ({ ...prev, advanceAmount: props.editData.receiptDetails[0].payment_amount}))
            }
            else if(props.editData.receiptDetails[0].advance === 'Receipt Advance Refund'){
                const updatedCustomerVendorAdvances = dummyCustomerVendorAdvances.map(adv => {
                    const selectedAdvance = props.editData.receiptDetails.find(d => d.advance_id === adv.id)
                    if(!selectedAdvance){
                        return adv
                    }
                    
                    const newInvoice = {
                        id: selectedAdvance.advance_id,
                        amount: selectedAdvance.amount,
                        adjusted_amount: selectedAdvance.adjusted_amount - selectedAdvance.payment_amount,
                        balance_amount: selectedAdvance.balance_amount + selectedAdvance.payment_amount,
                        receipt_number: selectedAdvance.receipt_number,
                        receipt_date: selectedAdvance.receipt_date,
                        paymentAmount: selectedAdvance.payment_amount
                    }
                    return newInvoice
                    
                }).filter(Boolean)

                const missingAdvances = props.editData.receiptDetails.filter(adv => {
                    return !dummyCustomerVendorAdvances.some(d => d.id === adv.advance_id)
                })

                const formatMissing = missingAdvances.map(adv => {
                    return {
                        id: adv.advance_id,
                        amount: adv.payment_amount,
                        adjusted_amount: adv.payment_amount,
                        balance_amount: adv.payment_amount,
                        receipt_number: adv.receipt_number,
                        receipt_date: adv.receipt_date,
                        paymentAmount: adv.payment_amount
                    }
                })
                setFormValues((prev) => ({ ...prev, refundAmount: props.editData.receiptDetails.reduce((sum, list) => sum + Number(list.payment_amount), 0) }))
                setCustomerVendorAdvances([...updatedCustomerVendorAdvances, ...formatMissing])
                setTotalAdvanceRemaining([...updatedCustomerVendorAdvances, ...formatMissing].reduce((sum, list) => sum + Number(list?.balance_amount), 0))
                setTabValue(3)
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
    }, [dummyGetPay, dummyCustomerVendorAdvances, props.editData])
    
   useEffect(() => {
    if (tabValue === 2 || tabValue === 3) {
        const total = transactionTable.reduce((sum, list) => sum + Number(list.payment_amount ?? 0), 0)
        const timer = setTimeout(() => {
            if (tabValue === 2) {
                setFormValues((prev) => ({
                    ...prev,
                    advanceAmount: total > 0 ? total : prev.advanceAmount
                }))
            }
            if (tabValue === 3) {
                setFormValues((prev) => ({
                    ...prev,
                    refundAmount: total > 0 ? total : prev.refundAmount
                }))
            }
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
        let datas = { location_id : headerLocationId}
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
              }, datas))
        
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
                dispatch(getVendorExpensesAction(data.supplier_id, async(response) => {
                    const expenseData = await response.data
                    if(props.type !== 'BANK_RECONCILIATION'){
                        setGetPay(expenseData.filter(d => d.vendor_id === data.supplier_id && d.id === props.selectedInvoice))
                    }
                    else{
                        setGetPay(expenseData)
                    }
                }))
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
            return creditNotesAvailableCredit.map(c => {
                const label = c.type === 'Credit Note' ? 'Credit Note' : c.type === 'Debit Note' ? 'Debit Note' : 'Available Credit'
                return `${label}(${c.refNumber}): ${c.adjustedAmount}/-`
            }).join(', ')
        }
    }

    useEffect(() => {
        if(props.entryType !== 'edit') {
            if(props.custType === 'CUSTOMER') {
                if(formValues.advanceAmount !== null && formValues.advanceAmount !== '') {
                    setFormValues((prev) => ({...prev, note : 'Advance payment received'}))
                }
                else if(formValues.refundAmount !== null && formValues.refundAmount !== '') {
                    setFormValues((prev) => ({...prev, note : 'Advance Refund Returned'}))
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
                else if(formValues.refundAmount !== null && formValues.refundAmount !== '') {
                    setFormValues((prev) => ({...prev, note : 'Advance Refund Received'}))
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
    }, [props.entryType, props.custType, formValues.advanceAmount, creditNotesAvailableCredit, transactionTable, formValues.advanceAmount])

    const handleSubmit = () => {
        if(needNegativeCashAlert && props.custType === 'VENDOR' && tabValue !== 3){
            setNegativeCashAlertOpen(true)
            return
        }

        if(formValues.advanceAmount !== null && formValues.advanceAmount !== ''){
            handleAdvanceSubmit(props.entryType)
            return
        }

        if((formValues.advanceAmount === null || formValues.advanceAmount === '') && totalAdvance > 0 && tabValue !== 3){
            setAdvanceConfirmDialogOpen(true)
            return
        }

        if(formValues.refundAmount !== null){
            handleRefundSubmit(props.entryType)
            return
        }

        setConfirmOpen(true)
    }

    const handleConfirmedSubmit = () => {
        setConfirmOpen(false)
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

    const handleAdvanceSubmit = async(type) => {
        setSubmitDisable(true)
        if(headerLocationId === 'null'){
            setOpenAlert(true)
            setSubmitDisable(false)
            return
        }
        const receiptData = transactionTable.filter(i => 'paymentLedgerId' in i && 'ledger_id' in i)
        const totalAmount = receiptData.reduce((sum, list) => sum + Number(list.payment_amount ?? 0), 0)
        
        if(Number(formValues.advanceAmount) !== totalAmount){
            setSubmitDisable(false)
            return alert('Advance Amount does not match with the Received Amount')
        }

        const now = new Date();
            let hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;

            const formattedTime = `${hours}:${minutes} ${ampm}`;
            const idempotencyKey = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

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
                invoiceData.push(transactionTable.length > 0 &&  `Advance amount of ${Number(transactionTable[0].payment_amount).toFixed(2)} Received from ${selectedData.company_name} Via ${transactionTable[0].payment_type}`)
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
                },
                idempotencyKey
            }
            if(type === 'edit' && props.type !== 'CHEQUE_REPRESENT'){
                const advanceReceiptCreate = editReceiptData.usedAdvance.filter(d => d.description === 'Advance - Receipts Create')
                apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    dispatch(salesAdvanceEntryEdit({ ...data, receipt_id: props.editData?.receipt_id ?? props.editData.id, advance_id: advanceReceiptCreate[0].advance_id, old_amount: advanceReceiptCreate[0].payment_amount }, (response) => {
                        if(response === 200){
                            props.handleClose(false)
                            resetPage()
                        } else {
                            setSubmitDisable(false)
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
                    dispatch(SalesAdvanceEntry(data, (response) => {
                        if(response === 200){
                            if(props.reconciliateData){
                                props.handleReconciliate(res.data, transactionTable, selectedPaymentMode, true)
                            }
                            props.handleClose(false)
                            resetPage()
                        } else {
                            setSubmitDisable(false)
                        }
                    }))
                )
            }
        }
        else{
            if(needNegativeCashAlert){
                setNegativeCashAlertOpen(true)
                return
            }
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
                idempotencyKey
            }
            if(type === 'edit'){
                data.receiptData.imageKey = props.editData.imageKey
                const advancePaymentCreate = editReceiptData.usedAdvance.filter(d => d.description === 'Advance Paid- Receipts Create')
                apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    dispatch(purchaseAdvanceEntryEdit({ ...data, receipt_id: props.editData?.receipt_id ?? props.editData.id, advance_id: advancePaymentCreate[0].advance_id, old_amount: advancePaymentCreate[0].payment_amount }, (response) => {
                        if(response === 200){
                            props.handleClose(false)
                            resetPage()
                        } else {
                            setSubmitDisable(false)
                        }
                    }))
                )
            }
            else{
                apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    dispatch(PurchaseAdvanceEntry(data, (response, res) => {
                        if(response === 200){
                            if(props.reconciliateData){
                                props.handleReconciliate(res.data, transactionTable, selectedPaymentMode, true)
                            }
                            props.handleClose(false)
                            resetPage()
                        } else {
                            setSubmitDisable(false)
                        }
                    }))
                )
            }
        }
    }

    const handleRefundSubmit = async (type) => {
        setSubmitDisable(true)
        if (headerLocationId === 'null') {
            setOpenAlert(true)
            setSubmitDisable(false)
            return
        }
        const receiptData = transactionTable.filter(i => 'paymentLedgerId' in i && 'ledger_id' in i)
        const totalAmount = receiptData.reduce((sum, list) => sum + Number(list.payment_amount ?? 0), 0)

        if (totalRefund !== totalAmount) {
            setSubmitDisable(false)
            return alert('Refund Amount does not match with the Received Amount')
        }
        if (totalRefund > totalAdvanceRemaining) {
            setSubmitDisable(false)
            return alert('Refund Amount does not match with the Total Advance')
        }

        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;

        const formattedTime = `${hours}:${minutes} ${ampm}`;
            const idempotencyKey = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

        //  const storage = getsessionStorage()
        let invoiceData = []
        let ReceiptType;
        if (props.custType === 'CUSTOMER') {
            const normalize = (str) =>
                str?.toLowerCase().replace(/\s+/g, ' ').trim();

            if (type === 'edit') {
                ReceiptType = 'Customer Refund Edit'
                if ((transactionTable.length > 0 && normalize(transactionTable[0].payment_type) !== normalize(editTransactionTable[0]?.payment_type)) || (transactionTable.length > 0 && normalize(transactionTable[0].payment_type) === normalize(editTransactionTable[0]?.payment_type))) {
                    invoiceData.push(`Refund amount of ${transactionTable[0].payment_amount} returned to ${selectedData.company_name} Via ${transactionTable[0].payment_type}`)
                }
                // if( transactionTable.length > 0 && normalize(transactionTable[0].payment_type) === normalize(editTransactionTable[0]?.payment_type)){
                //     if(transactionTable[0].payment_amount != editTransactionTable[0]?.payment_amount){
                //         invoiceData.push(`Advance Modified from ${editTransactionTable[0]?.payment_amount} to ${transactionTable[0].payment_amount}  Via ${transactionTable[0].payment_type} `)
                //     }
                // }
            }
            else {
                ReceiptType = 'Customer Refund'

                invoiceData.push(transactionTable.length > 0 && `Advance amount of ${Number(transactionTable[0].payment_amount).toFixed(2)} returned to ${selectedData.company_name} Via ${transactionTable[0].payment_type}`)
            }
            const data = {
                receiptData: [{ ...receiptData[0], receiptDate: moment(formValues.date).format('YYYY-MM-DD'), note: formValues.note, image: formValues.uploadedImage.length > 0 ? [await readFileAsync(formValues.uploadedImage[0])] : [], isRefund: 1 }],
                advanceAdjustment: selectedAdvance,
                customerId: formValues.selectedCustomerVendor.customer_id,
                amount: totalRefund,
                name: formValues.selectedCustomerVendor.company_name,
                location_id: headerLocationId,
                timeLineData: invoiceData,
                ReceiptType: ReceiptType,
                advanceEntryType: props.type !== 'CHEQUE_REPRESENT' ? 'new' : 'chq_rep',
                whatsappReceiptData: {
                    customer: formValues.selectedCustomerVendor.company_name,
                    refundAmount: totalRefund,
                    receipt_date: formValues?.date,
                    time: formattedTime,
                    received_by: storage.first_name,
                    company_name: storage.company_name,
                    phone: selectedData.phone_number,
                },
                idempotencyKey
            }
            if (type === 'edit' && props.type !== 'CHEQUE_REPRESENT') {
                apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    dispatch(editSalesRefundEntryAction({ ...data, receipt_id: props.editData?.receipt_id ?? props.editData.id}, (props.editData?.receipt_id ?? props.editData.id), (response) => {
                        if (response === 200) {
                            props.handleClose(false)
                            resetPage()
                        } else {
                            setSubmitDisable(false)
                        }
                    }))
                )
            }
            else {
                if (props.type === 'CHEQUE_REPRESENT') {
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
                    dispatch(salesRefundEntryAction(data, (response) => {
                        if (response === 200) {
                            props.handleClose(false)
                            resetPage()
                        } else {
                            setSubmitDisable(false)
                        }
                    }))
                )
            }
        }
        else {
            if (totalRefund > 0) {
                if (
                    formValues.selectedCustomerVendor.company_name &&
                    formValues.refundAmount
                ) {
                    invoiceData.push(`₹${totalAdvance.toFixed(2)} advance return from ${formValues.selectedCustomerVendor.company_name}`);
                } else {
                    invoiceData.push(`₹${totalAdvance.toFixed(2)} advance amount returned`);
                }
            }

            const data = {
                receiptData: [{ ...receiptData[0], receiptDate: moment(formValues.date).format('YYYY-MM-DD'), note: formValues.note, image: formValues.uploadedImage.length > 0 ? [await readFileAsync(formValues.uploadedImage[0])] : [], isRefund: 1 }],
                advanceAdjustment: selectedAdvance,
                supplierId: formValues.selectedCustomerVendor.supplier_id,
                amount: totalRefund,
                name: formValues.selectedCustomerVendor.company_name,
                location_id: headerLocationId,
                timeLineData: invoiceData,
                ReceiptType: 'Vendor Refund',
                whatsappReceiptData: {
                    supplier: formValues.selectedCustomerVendor.company_name,
                    refundAmount: totalRefund,
                    receipt_date: formValues?.date,
                    time: formattedTime,
                    received_by: storage.first_name,
                    company_name: storage.company_name,
                    phone: selectedData.phone_number,
                },
                idempotencyKey

            }
            if (type === 'edit') {
                data.receiptData.imageKey = props.editData.imageKey
                data.ReceiptType = 'Vendor Refund Edit'
                apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    dispatch(editVendorRefundEntryAction({ ...data, receipt_id: props.editData?.receipt_id ?? props.editData.id}, (props.editData?.receipt_id ?? props.editData.id), (response) => {
                        if (response === 200) {
                            props.handleClose(false)
                            resetPage()
                        } else {
                            setSubmitDisable(false)
                        }
                    }))
                )
            }
            else {
                apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    dispatch(vendorRefundEntryAction(data, (response) => {
                        if (response === 200) {
                            props.handleClose(false)
                            resetPage()
                        } else {
                            setSubmitDisable(false)
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
                        payment_type: creditNotesAvailableCredit.map(c => c.type).join(', '),
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
                    received_amount: receivedAmount,
                    saleType : invoice.length > 0 ? invoice?.map(item => item.refNumber).join(', ') + (totalAdvance > 0 ? ' And Advance' : '') : 'Advance'
                }
            })
        }

        let invoiceData = []
        let ReceiptType ;
        const voucherDate = moment(formValues.date).format('DD/MM/YYYY')
        const createdByName = storage.first_name + (storage.last_name ? ' ' + storage.last_name : '')

            if(type !== 'edit'){
                ReceiptType = 'Receipt Entry'
                if(transactionTable.length > 0){
                    invoiceData.push(`Receipt Voucher created by ${createdByName} on ${voucherDate} | ₹${totalReceived} received from ${selectedData.company_name} via ${transactionTable[0].payment_type}`)
                } else if(creditNotesAvailableCredit.length > 0){
                    const noteRefs = creditNotesAvailableCredit.map(c => c.refNumber).join(', ')
                    invoiceData.push(`Receipt Voucher created by ${createdByName} on ${voucherDate} | ₹${totalCreditAmount} adjusted from ${selectedData.company_name} via ${noteRefs}`)
                }

            invoice.map((e)=>{
                 let formattedDate = 'N/A';
                 if (e.invoice_date) {
                    const date = new Date(e.invoice_date);
                 if (!isNaN(date.getTime())) {
                    formattedDate = date.toLocaleDateString('en-GB');
                }
            }
                invoiceData.push(`₹${Number(e.paymentAmount).toFixed(2)} allocated against Invoice ${e.refNumber} dated ${formattedDate}`)
            })
            if(totalAdvance > 0 ) invoiceData.push(`₹${totalAdvance?.toFixed(2)} recorded as Advance`)

            }

                if(type === 'edit'){
                    ReceiptType = 'Receipt Edit'
                    invoiceData.push(`Receipt Voucher edited by ${createdByName} on ${moment().format('DD/MM/YYYY')}`)

                    if(props.editData.receipt_date !== voucherDate){
                        invoiceData.push(`Voucher date changed from ${props.editData.receipt_date} to ${voucherDate}`)
                    }
                    if(transactionTable.length > 0 && editTransactionTable.length > 0 && transactionTable[0].payment_amount != editTransactionTable[0]?.payment_amount){
                        invoiceData.push(`Payment amount changed to ₹${transactionTable[0].payment_amount} via ${transactionTable[0].payment_type}`)
                    }
                    if(editTransactionTable.length > 0 && editCreditNotesAvailableCredit.length === 0 && creditNotesAvailableCredit.length > 0){
                        invoiceData.push(`Payment method changed to Credit Note/Advance, ₹${totalCreditAmount} adjusted`)
                    }
                    if(creditNotesAvailableCredit.length > 0 && editCreditNotesAvailableCredit.length > 0){
                        invoiceData.push(`₹${totalCreditAmount} adjusted from ${selectedData.company_name} via Credit Note/Advance`)
                    }

                    if(invoice.length > 0){
                     invoice.map((e)=>{
                          let formattedDate = 'N/A';
                          if (e.invoice_date) {
                             const date = new Date(e.invoice_date);
                          if (!isNaN(date.getTime())) {
                             formattedDate = date.toLocaleDateString('en-GB');
                        }
                    }
                        invoiceData.push(`₹${Number(e.paymentAmount).toFixed(2)} allocated against Invoice ${e.refNumber} dated ${formattedDate}`)
                    })
                }

                    if((editAdvance != totalAdvance) && totalAdvance !== 0) invoiceData.push(`₹${totalAdvance?.toFixed(2)} recorded as Advance`)

                }

            const reeiptInvoice = invoice.length > 0 ? invoice?.map(item => item.refNumber).join(', ') + (totalAdvance > 0 ? ' And Advance' : '') : 'Advance';

            const now = new Date();
            let hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;

            const formattedTime = `${hours}:${minutes} ${ampm}`;
            const idempotencyKey = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

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
            // specialNumber: invoice.length > 0 ? invoice.map((inv) => inv.originalRow.sale_id).join(',') : '',
            specialNumber : invoice.length > 0
                                ? invoice
                                    .map(inv => inv.originalRow.sale_id ?? '')
                                    .join(',')
                                : '',
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
            },
            idempotencyKey
        }

        if(type === 'edit' && props.type !== 'CHEQUE_REPRESENT'){
            data.receiptDataEntry.imageKey = props.editData.imageKey
            apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                dispatch(editReceiptAction({ ...data, receipt_id: props.editData?.receipt_id ?? props.editData.id }, (response) => {
                    if(response.status === 200){
                        props.handleClose(false)
                        resetPage()
                    } else {
                        setSubmitDisable(false)
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
                        props.handleClose(false),
                        resetPage()
                        //notifyFunction(resdata.data, receivables)
                    } else {
                        setSubmitDisable(false)
                    }
                }))
            )
        }
        
    }

    const handleExpenseSubmit = async() => {
        setSubmitDisable(true)
        const expenses = []
        if(props.ediData){
            expenses.push({
                ...props.editData,
                status: props.ediData.total === (props.ediData.paid_amount + props.ediData.received_amount) ? 'Completed' : 'Pending Payment'
            })
        }
        else{
            let remainingPaidAmount = totalReceived
            invoice.forEach((inv) => {
                let status = 'Pending Payment'
                let received_amount = inv.originalRow.paid_amount + inv.paymentAmount
                // const old_received_amount = inv.total - inv.paid_amount

                // if(remainingPaidAmount <= old_received_amount){
                //     received_amount += received_amount + old_received_amount
                //     remainingPaidAmount = 0
                // }
                // else{
                //     if(remainingPaidAmount > 0 && remainingPaidAmount >= old_received_amount){
                //         received_amount += received_amount + old_received_amount
                //         remainingPaidAmount -= old_received_amount
                //     }
                //     else{
                //         received_amount += received_amount + remainingPaidAmount
                //         remainingPaidAmount = 0
                //     }
                // }

                if(inv.originalRow.total === (inv.originalRow.due_amount + received_amount)){
                    status = 'Completed'
                }
                
                expenses.push({ ...inv.originalRow, received_amount: received_amount, status: status, amount: inv.originalRow.total_amount - inv.originalRow.gst_amount })
            })
        }

        const ledgerUpdateData = {
            expenses: expenses,
            total_amount: totalReceived,
            payments: transactionTable.filter(i => 'paymentLedgerId' in i && 'ledger_id' in i),
            pageCount: 0,
            numPerPage : 20,
            vendor_id: formValues.selectedCustomerVendor.supplier_id,
            vendorLedgerId: formValues.selectedCustomerVendor.ledger_id,
            company_name: formValues.selectedCustomerVendor.company_name
        }
        if(totalReceived === props.editData.paid_amount){
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
                dispatch(PaymentExpenseAction(props.editData.id, ledgerUpdateData, async(response) => {
                    const res = await response
                    if(res.status === 200){
                        if(props.reconciliateData){
                            props.handleReconciliate(response, transactionTable, selectedPaymentMode)
                        }
                        props.handleClose(false)
                        resetPage()
                    } else {
                        setSubmitDisable(false)
                    }
                }))
            }))
        )
    }

    const handlePaymentSubmit = async(type) => {
        setSubmitDisable(true)
        if(headerLocationId === 'null'){
            setOpenAlert(true)
            setSubmitDisable(false)
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

        // console.log('invoiceeeeeeeeeeeeeeeeeeeee', invoice)

        const ledger = {
            location_id: headerLocationId,
            note: 'Purchase Payment',
            referenceNumber: transactionTable.filter(i => 'paymentLedgerId' in i && 'ledger_id' in i).map(d => ({...d, tendered: d.tendered ? d.tendered : []})),
            // receiving_id: invoice.length > 0 ? invoice.map(inv => inv.originalRow.receiving_id ?? '').join(',') : ''
            receiving_id: invoice.length > 0
                            ? invoice
                                .map(inv => inv.originalRow?.receiving_id)
                                .filter(id => id)   // removes null, undefined, empty
                                .join(',')
                            : ''
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
        const payVoucherDate = moment(formValues.date).format('DD/MM/YYYY')
        const payCreatedByName = storage.first_name + (storage.last_name ? ' ' + storage.last_name : '')
        const idempotencyKey = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

            if(type !== 'edit'){
                ReceiptType = 'Payment Entry'
                if(transactionTable.length > 0){
                    invoiceData.push(`Payment Voucher created by ${payCreatedByName} on ${payVoucherDate} | ₹${totalReceived} paid to ${selectedData.company_name} via ${transactionTable[0].payment_type}`)
                } else if(creditNotesAvailableCredit.length > 0){
                    const noteRefs = creditNotesAvailableCredit.map(c => c.refNumber).join(', ')
                    invoiceData.push(`Payment Voucher created by ${payCreatedByName} on ${payVoucherDate} | ₹${totalCreditAmount} adjusted against ${selectedData.company_name} via ${noteRefs}`)
                }

            invoice.map((e)=>{
                const date = new Date(e.invoice_date);
                const formattedDate = date.toLocaleDateString('en-GB');
                invoiceData.push(`₹${Number(e.paymentAmount).toFixed(2)} allocated against Bill ${e.refNumber || e.originalRow?.po_number || ''} dated ${formattedDate}`)
            })
            if(totalAdvance > 0 ) invoiceData.push(`₹${totalAdvance?.toFixed(2)} recorded as Advance`)

            }

                if(type === 'edit'){
                    ReceiptType = 'Payment Edit'
                    invoiceData.push(`Payment Voucher edited by ${payCreatedByName} on ${moment().format('DD/MM/YYYY')}`)

                    if(props.editData.receipt_date !== payVoucherDate){
                        invoiceData.push(`Voucher date changed from ${props.editData.receipt_date} to ${payVoucherDate}`)
                    }
                    if(transactionTable.length > 0 && editTransactionTable.length > 0 && transactionTable[0].payment_amount != editTransactionTable[0]?.payment_amount){
                        invoiceData.push(`Payment amount changed to ₹${transactionTable[0].payment_amount} via ${transactionTable[0].payment_type}`)
                    }
                    if(editTransactionTable.length > 0 && editCreditNotesAvailableCredit.length === 0 && creditNotesAvailableCredit.length > 0){
                        invoiceData.push(`Payment method changed to Debit Note/Advance, ₹${totalCreditAmount} adjusted`)
                    }

                    if(invoice.length > 0){
                     invoice.map((e)=>{
                         const date = new Date(e.invoice_date);
                         const formattedDate = date.toLocaleDateString('en-GB');
                        invoiceData.push(`₹${Number(e.paymentAmount).toFixed(2)} allocated against Bill ${e.refNumber || e.originalRow?.po_number || ''} dated ${formattedDate}`)
                    })
                }

                    if(totalAdvance > 0) invoiceData.push(`₹${totalAdvance?.toFixed(2)} recorded as Advance`)

                }

         

        const data = {
            payables: payableUpdate,
            location_id: headerLocationId,
            updateDebitNote: {
                manualNoteSchemes: manualNoteSchemes.filter(i => creditNotesAvailableCredit.some(c => c.id === i.manual_notes_id) && i.advance_id === undefined),
                advanceledger: manualNoteSchemes.filter(i => creditNotesAvailableCredit.some(c => c.id === i.id) && i.advance_id !== undefined),
                supplier_id: formValues.selectedCustomerVendor.supplier_id,
                supplier_ledger_id: formValues.selectedCustomerVendor.ledger_id,
                company_name: formValues.selectedCustomerVendor.company_name || `${formValues.selectedCustomerVendor.first_name || ''} ${formValues.selectedCustomerVendor.last_name || ''}`.trim()
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
            ReceiptType : ReceiptType,
            idempotencyKey
        }

        if(type === 'edit'){
            data.receiptDataEntry.imageKey = props.editData.imageKey
            apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                dispatch(payablesPaymentEntryEdit({ ...data, receipt_id: props.editData?.receipt_id ?? props.editData.id }, (response, responseData) => {
                    if(response){
                        props.handleClose(false)
                        resetPage()
                    } else {
                        setSubmitDisable(false)
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
                            props.handleReconciliate(responseData, transactionTable, selectedPaymentMode)
                        }
                        props.handleClose(false),
                        resetPage()
                        //notifyFunction(response, payables)
                    } else {
                        setSubmitDisable(false)
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
            date: moment(),
            selectedCustomerVendor: null,
            advanceAmount: null,
            refundAmount: null,
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
            setFormValues((prev) => ({ ...prev, advanceAmount: null, refundAmount: null }))
        }
    }

    const handleCustomerSearchAPICall = (searchText) => {
        if(searchText.length >= 3){
            const type = props.custType === 'CUSTOMER' ? 'Customer' : 'Supplier'
            const payload = {
                searchString: searchText
            }
            dispatch(getSearchByCustomerSupplierDataAction(payload, type))
            setSearchText('')
        }
          else {
            dispatch(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
          }
    }

    const handleCloseCustomerDetails = () => {
        setFormValues((prev) => ({ ...prev, selectedCustomerVendor: null }))
        setSearchText('')
        dispatch(setSearchByCustomerSupplierDataAction([]))
    }

    const handleAutoSearchApicall = (searchText) => {
        dispatch(setSearchByCustomerSupplierDataAction([]))
        const types = props.custType === 'CUSTOMER' ? 'Customer' : 'Supplier'
        const payload = {
            searchString: searchText,
        }
        dispatch(getSearchByCustomerSupplierAction(
            payload,
            types,
            setModalTypeHandler,
            setLoaderStatusHandler
        ))
    }

    const tot = props.status === 'edit' ? totalAmount : Number(((Number(totalCost()) || 0) + (Number(taxes()) || 0)).toFixed(2))

    const hasCreditMismatch = tabValue !== 3 && (creditNotesAvailableCredit.length > 0 || props.pageType === 'EXPENSE') && totalReceived !== totalReceipt
    const invoiceNotSelected = tabValue !== 3 && invoice.length === 0 && (formValues.advanceAmount === null || formValues.advanceAmount === '')
    const isUnderPaid = tabValue !== 3 && Number(totalReceipt.toFixed(2)) > Number(totalReceived.toFixed(2))
    const isAdvanceInvalidAndMismatch = (tabValue !== 3 && formValues.advanceAmount !== null && formValues.advanceAmount !== '' && Number(formValues.advanceAmount) !== totalReceived)
    const hasExcessReceiptAmount = tabValue !== 3 && totalReceived < totalReceipt
    const invoicePaymentAmountMismatch = tabValue !== 3 && invoice.length > 0 && invoice.some(row => Number(row?.paymentAmount) > Number(props.custType === 'CUSTOMER' ? row.receivable : row.payable))
    const refundNotAdjusted = tabValue === 3 && formValues.refundAmount !== null && totalAdjusted !== totalRefund

    const summaryBackgroundColor = hasCreditMismatch || isUnderPaid || invoiceNotSelected || isAdvanceInvalidAndMismatch || submitDisable || hasExcessReceiptAmount || refundNotAdjusted ? 'rgba(255, 153, 51, 0.5)' : 'rgba(205, 254, 194, 1)'


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

    const isInline = props.inline === true

    if (isInline && !props.paymentOpen) return null

    const headerBar = (
        <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', px: { xs: 2, md: 3 }, py: 1, ...(isInline ? { position: 'sticky', top: 0, zIndex: 10 } : {}) }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', flexGrow: 1, fontSize: '16px' }}>
                {props.custType === 'CUSTOMER' ? 'Receipt Voucher' : 'Payment Voucher'}
            </Typography>
            <IconButton onClick={() => handleClose()} size="small">
                <CloseIcon />
            </IconButton>
        </Box>
    )

    const stepperBar = null

    const actionBar = (
        <>
            {(tabValue === 1 || tabValue === 3) && (
                <Box sx={{ bgcolor: 'white', borderTop: '1px solid #e0e0e0', px: 4, py: 2, display: 'flex', justifyContent: 'flex-end', gap: 2, ...(isInline ? { position: 'sticky', bottom: 0, zIndex: 10 } : {}) }}>
                    {page === 1 ? (
                        <Button
                            variant='contained'
                            size="large"
                            onClick={handleNext}
                            disabled={formValues.selectedCustomerVendor === null || (totalPaymentAmount === 0 && totalCreditAmount === 0) || hasInvalidCheque || (tabValue === 3 && ((formValues.refundAmount === null || formValues.refundAmount === '') || Number(formValues?.refundAmount ?? 0) !== totalPaymentAmount))}
                            sx={{ minWidth: 120 }}
                        >
                            Continue
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant='outlined'
                                size="large"
                                onClick={handlePrevious}
                                sx={{ minWidth: 120 }}
                            >
                                Back
                            </Button>
                            <Button
                                variant='contained'
                                size="large"
                                disabled={hasCreditMismatch || isUnderPaid || isAdvanceInvalidAndMismatch || submitDisable || hasExcessReceiptAmount || invoicePaymentAmountMismatch || refundNotAdjusted}
                                onClick={handleSubmit}
                                sx={{ minWidth: 120 }}
                            >
                                Submit
                            </Button>
                        </>
                    )}
                </Box>
            )}

            {tabValue === 2 && (
                <Box sx={{ bgcolor: 'white', borderTop: '1px solid #e0e0e0', px: 4, py: 2, display: 'flex', justifyContent: 'flex-end', ...(isInline ? { position: 'sticky', bottom: 0, zIndex: 10 } : {}) }}>
                    <Button
                        variant='contained'
                        size="large"
                        onClick={() => handleAdvanceSubmit(props.entryType)}
                        disabled={formValues.selectedCustomerVendor === null || totalPaymentAmount === 0 || totalPaymentAmount !== totalAdvance || hasInvalidCheque}
                        sx={{ minWidth: 120 }}
                    >
                        Submit
                    </Button>
                </Box>
            )}
        </>
    )

    const extraDialogs = (
        <>
            <LocationAlert
                open={openAlert}
                onClose={() => setOpenAlert(false)}
            />
            <CommonDialog
                cancel_buttonName={'No'}
                ok_buttonName={'Yes'}
                dialogTitle={'Add Extra amount to Advance'}
                dialogContent={`Do you want add the extra cash Rs : ${totalAdvance.toFixed(2)} as Advance amount?`}
                cancel_fun={() => setAdvanceConfirmDialogOpen(false)}
                ok_fun={dialogSubmit}
                open={advanceConfirmDialogOpen}
                handleClose={() => setAdvanceConfirmDialogOpen(false)}
                disabled={submitDisable}
            />
            <NegativeCashWarning
                open={negativeCashAlertOpen}
                cash={negativeCashAmount}
                onClose={() => {
                    setNegativeCashAlertOpen(false)
                    setNeedNegativeCashAlert(false)
                }}
            />
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>Confirm {props.custType === 'CUSTOMER' ? 'Receipt' : props.pageType === 'EXPENSE' ? 'Expense' : 'Payment'}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {selectedData?.company_name && `${props.custType === 'CUSTOMER' ? 'Customer' : 'Vendor'}: ${selectedData.company_name}`}
                        {selectedData?.company_name && <br />}
                        Total Amount: ₹{totalReceived.toFixed(2)}
                        {transactionTable.length > 0 && transactionTable[0]?.payment_type && (
                            <><br />Payment Mode: {transactionTable[0].payment_type}</>
                        )}
                        <br /><br />
                        Do you want to proceed?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
                <Button variant="contained" onClick={handleConfirmedSubmit} disabled={submitDisable}>Confirm</Button>
                </DialogActions>
            </Dialog>
        </>
    )

    const pageContent = (
        <Box>

                        {/* ========== PAGE 1 ========== */}
                        {page === 1 && (
                            <Stack spacing={3}>
                                {/* Tabs + Date */}
                                <Box sx={{ bgcolor: 'white', borderRadius: 2, px: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Tabs value={tabValue} onChange={handleTabChange}>
                                        <Tab label={props.custType === 'CUSTOMER' ? 'Customer Receipt' : 'Vendor Payment'} value={1} />
                                        <Tab label={props.custType === 'CUSTOMER' ? 'Customer Advance' : 'Vendor Advance'} value={2} />
                                        <Tab label={props.custType === 'CUSTOMER' ? 'Refund Paid' : 'Refund Received'} value={3} />
                                    </Tabs>
                                    <Box sx={{ pr: 1 }}>
                                        <LocalizationProvider dateAdapter={DateAdapter}>
                                            <DatePicker
                                                disableFuture
                                                label='Receipt Date'
                                                format='DD/MM/YYYY'
                                                value={toMomentOrNull(formValues.date)}
                                                onChange={(date) => handleChange('date', date)}
                                                views={['year', 'month', 'day']}
                                                slotProps={{ textField: { size: 'small', variant: 'outlined', sx: { width: 180 } } }}
                                            />
                                        </LocalizationProvider>
                                    </Box>
                                </Box>

                                {/* Vendor + Details + Summary */}
                                <Box sx={{ bgcolor: 'white', borderRadius: 2, p: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                                    <Grid container spacing={3}>
                                        {/* Left column: Vendor + Advance/Refund + Cards */}
                                        <Grid size={6}>
                                            <Stack spacing={2}>
                                                <Autocomplete
                                                    freeSolo={searchText.length <= 3}
                                                    disableClearable
                                                    inputValue={searchText}
                                                    onInputChange={(event, newInputValue, reason) => {
                                                        if(reason === 'input') {
                                                            setSearchText(newInputValue)
                                                            if(newInputValue !== '') {
                                                                handleAutoSearchApicall(newInputValue)
                                                            }
                                                            if(newInputValue === '' && !Object.keys(editReceiptData).length){
                                                                setFormValues((prev) => ({ ...prev, selectedCustomerVendor: null }))
                                                                dispatch(setSearchByCustomerSupplierDataAction([]))
                                                            }
                                                        }
                                                    }}
                                                    value={formValues.selectedCustomerVendor}
                                                    options={customerAsCompany.filter(d => props.custType === 'CUSTOMER' ? d.company_name !== null && d.customer_type === '1' : d.supplier_id)}
                                                    getOptionLabel={(option) => option.company_name}
                                                    onChange={(event, newValue) => {
                                                        handleChange('selectedCustomerVendor', newValue)
                                                        setSearchText(newValue?.company_name || '')
                                                    }}
                                                    disabled={Object.keys(props.selectedCustomer).length > 0 || props.entryType === 'edit' || props.type === 'CHEQUE_REPRESENT'}
                                                    renderInput={(params) => {
                                                        const { InputProps, ...rest } = params
                                                        let startAdornment = null
                                                        return(
                                                            <TextField
                                                                { ...rest }
                                                                label={props.custType === 'CUSTOMER' ? 'Customer' : 'Vendor'}
                                                                fullWidth
                                                                required
                                                                variant='outlined'
                                                                slotProps={{
                                                                    input: {
                                                                        ...InputProps,
                                                                        startAdornment: startAdornment,
                                                                        endAdornment: !(Object.keys(props.selectedCustomer).length > 0 || props.entryType === 'edit' || props.type === 'CHEQUE_REPRESENT') && (
                                                                            <>
                                                                                {
                                                                                    formValues.selectedCustomerVendor === null ?
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
                                                                                {InputProps.endAdornment}
                                                                            </>
                                                                        )
                                                                    }
                                                                }}
                                                            />
                                                        )
                                                    }}
                                                />
                                                <Grid container spacing={2}>
                                                    {tabValue !== 3 && (
                                                        <Grid size={6}>
                                                            <CardTemplate
                                                                totalIcon={totalIcon}
                                                                selectedCustomerSupplier={formValues.selectedCustomerVendor}
                                                                value={receivableAmount}
                                                                title={props.custType === 'CUSTOMER' ? 'Receivable' : 'Payable'}
                                                                isAmount={true}
                                                            />
                                                        </Grid>
                                                    )}
                                                    {tabValue !== 3 && (
                                                        <Grid size={6}>
                                                            <CardTemplate
                                                                totalIcon={totalIcon}
                                                                selectedCustomerSupplier={formValues.selectedCustomerVendor}
                                                                value={unusedCredit}
                                                                title={'Available Credit'}
                                                                isAmount={true}
                                                            />
                                                        </Grid>
                                                    )}
                                                    {tabValue === 3 && (
                                                        <Grid size={6}>
                                                            <CardTemplate
                                                                totalIcon={totalIcon}
                                                                selectedCustomerSupplier={formValues.selectedCustomerVendor}
                                                                value={totalAdvanceRemaining}
                                                                title={'Total Advances'}
                                                                isAmount={true}
                                                            />
                                                        </Grid>
                                                    )}
                                                </Grid>
                                            </Stack>
                                        </Grid>

                                        {/* Right column: Vendor Details - full height */}
                                        <Grid size={6}>
                                            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2.5, height: '100%', display: 'flex', alignItems: 'flex-start' }}>
                                                {Object.keys(selectedData).length > 0 && formValues.selectedCustomerVendor !== null ? (
                                                    <Box>
                                                        <Typography sx={{ fontWeight: 600, fontSize: '14px', mb: 0.5 }}>
                                                            {`${selectedData.company_name || selectedData.amount}`}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.25 }}>
                                                            {`${selectedData.address ? selectedData.address + ',' : ''} ${selectedData.city ? selectedData.city + ',' : ''} ${selectedData.state ? selectedData.state + ',' : ''} ${selectedData.country || ''} - ${selectedData.zip || ''}`}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.25 }}>
                                                            {`Mobile: ${selectedData.phone_number || ''}`}
                                                        </Typography>
                                                        {selectedData.email && (
                                                            <Typography variant="body2" color="text.secondary">
                                                                {selectedData.email}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                ) : (
                                                    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                                        <Typography color="text.disabled" sx={{ fontSize: '13px' }}>
                                                            {props.custType === 'CUSTOMER' ? 'Customer details will appear here' : 'Vendor details will appear here'}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>

                                {/* Payment Method / Credit Notes - Tabbed */}
                                <Box sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                                    {props.pageType !== 'EXPENSE' && props.type !== 'BANK_RECONCILIATION' && tabValue !== 2 && tabValue !== 3 ? (
                                        <>
                                            <Tabs
                                                value={paymentSectionTab}
                                                onChange={(e, v) => setPaymentSectionTab(v)}
                                                sx={{ px: 2, borderBottom: '1px solid #e0e0e0' }}
                                            >
                                                <Tab label="Payment Method" value="payment" />
                                                <Tab label={props.custType === 'CUSTOMER' ? 'Credit Notes & Available Credit' : 'Debit Notes & Available Credit'} value="credit" />
                                            </Tabs>
                                            {paymentSectionTab === 'payment' && (
                                                <PaymentMethods
                                                    transactionTable={transactionTable}
                                                    setTransactionTable={setTransactionTable}
                                                    page={page}
                                                    total={tot}
                                                    getPay={getPay}
                                                    tab={tabValue}
                                                    advanceAmount={formValues.advanceAmount}
                                                    refundAmount={formValues.refundAmount}
                                                    selectedTotal={formValues.refundAmount ? parseInt(formValues.refundAmount) : formValues.advanceAmount ? parseInt(formValues.advanceAmount) : getTotalSelectedAmount(invoice)}
                                                    receiptDate={formValues.date}
                                                    responseType={props.responseType}
                                                    creditSelected={creditNotesAvailableCredit.length > 0}
                                                    type={props.type}
                                                    pageType={props.pageType}
                                                    reconciliateData={props.reconciliateData}
                                                    entryType={props.entryType}
                                                    customer={formValues.selectedCustomerVendor}
                                                    editData={props.editData}
                                                    setSelectedPaymentMode={setSelectedPaymentMode}
                                                    custType={props.custType}
                                                    bankId={props.bankId}
                                                    setNeedNegativeCashAlert={setNeedNegativeCashAlert}
                                                    setNegativeCashAmount={setNegativeCashAmount}
                                                />
                                            )}
                                            {paymentSectionTab === 'credit' && (
                                                (manualNoteSchemes.length > 0 || dummyManualNoteSchemes.length > 0) && formValues.selectedCustomerVendor ? (
                                                    <CreditDebitUnusedCredit
                                                        manualNoteSchemes={manualNoteSchemes}
                                                        setManualNoteSchemes={setManualNoteSchemes}
                                                        creditNotesAvailableCredit={creditNotesAvailableCredit}
                                                        setCreditNotesAvailableCredit={setCreditNotesAvailableCredit}
                                                        paymentSelected={transactionTable.length > 0}
                                                        custType={props.custType}
                                                        entryType={props.entryType}
                                                    />
                                                ) : (
                                                    <Typography color="text.disabled" sx={{ textAlign: 'center', py: 5, fontSize: '14px' }}>
                                                        {props.custType === 'CUSTOMER' ? 'No credit notes or available credit' : 'No debit notes or available credit'}
                                                    </Typography>
                                                )
                                            )}
                                        </>
                                    ) : (
                                        /* No credit notes available - show payment methods only, no tabs */
                                        <PaymentMethods
                                            transactionTable={transactionTable}
                                            setTransactionTable={setTransactionTable}
                                            page={page}
                                            total={tot}
                                            getPay={getPay}
                                            tab={tabValue}
                                            advanceAmount={formValues.advanceAmount}
                                            refundAmount={formValues.refundAmount}
                                            selectedTotal={formValues.refundAmount ? parseInt(formValues.refundAmount) : formValues.advanceAmount ? parseInt(formValues.advanceAmount) : getTotalSelectedAmount(invoice)}
                                            receiptDate={formValues.date}
                                            responseType={props.responseType}
                                            creditSelected={creditNotesAvailableCredit.length > 0}
                                            type={props.type}
                                            pageType={props.pageType}
                                            reconciliateData={props.reconciliateData}
                                            entryType={props.entryType}
                                            customer={formValues.selectedCustomerVendor}
                                            editData={props.editData}
                                            setSelectedPaymentMode={setSelectedPaymentMode}
                                            custType={props.custType}
                                            bankId={props.bankId}
                                            setNeedNegativeCashAlert={setNeedNegativeCashAlert}
                                            setNegativeCashAmount={setNegativeCashAmount}
                                        />
                                    )}
                                </Box>

                                {/* Note - tab 2 only */}
                                {tabValue === 2 && (
                                    <Box sx={{ bgcolor: 'white', borderRadius: 2, p: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                                        <TextField
                                            value={formValues.note || ''}
                                            fullWidth
                                            multiline
                                            rows={3}
                                            label='Note'
                                            variant='outlined'
                                            onChange={(event) => setFormValues((prev) => ({ ...prev, note: event.target.value }))}
                                        />
                                    </Box>
                                )}
                            </Stack>
                        )}

                        {/* ========== PAGE 2 ========== */}
                        {page === 2 && (
                            <Stack spacing={3}>
                                {/* Vendor Bar + Payment Summary */}
                                <Grid container spacing={3}>
                                    <Grid size={8}>
                                        <Box sx={{ bgcolor: 'white', borderRadius: 2, p: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                                                <Stack direction='row' alignItems='center' spacing={1}>
                                                    <Typography sx={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'text.secondary' }}>
                                                        {`${props.custType} DETAILS`}
                                                    </Typography>
                                                    {Object.keys(selectedData).length > 0 && formValues.selectedCustomerVendor !== null ? (
                                                        <CheckIcon style={{ color: '#2e7d32', fontSize: '18px' }} />
                                                    ) : (
                                                        <CloseIcon style={{ color: '#d32f2f', fontSize: '18px' }} />
                                                    )}
                                                </Stack>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                                    {`Receipt Date: ${moment(formValues.date).format('DD/MM/YYYY')}`}
                                                </Typography>
                                            </Stack>
                                            <Divider sx={{ mb: 2 }} />
                                            {Object.keys(selectedData).length > 0 && formValues.selectedCustomerVendor !== null ? (
                                                <Box>
                                                    <Typography sx={{ fontWeight: 600, fontSize: '14px', mb: 0.5 }}>
                                                        {`${selectedData.company_name || selectedData.amount}`}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.25 }}>
                                                        {`${selectedData.address ? selectedData.address + ',' : ''} ${selectedData.city ? selectedData.city + ',' : ''} ${selectedData.state ? selectedData.state + ',' : ''} ${selectedData.country || ''} - ${selectedData.zip || ''}`}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.25 }}>
                                                        {`Mobile No : ${selectedData.phone_number || ''}`}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {selectedData.email || ''}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Typography color="text.disabled" sx={{ textAlign: 'center', py: 2 }}>
                                                    Pick Customer for more Details!
                                                </Typography>
                                            )}
                                        </Box>
                                    </Grid>

                                    <Grid size={4}>
                                        <Box sx={{ bgcolor: 'white', borderRadius: 2, p: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', height: '100%', display: 'flex', alignItems: 'center' }}>
                                            <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>
                                                {getTransactionDetailsAndAmount()}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>

                                {/* Invoice / Advance Table */}
                                <Box sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                                    {tabValue === 1 && (
                                        <Invoices
                                            invoice={invoice}
                                            setInvoice={setInvoice}
                                            getPay={getPay}
                                            custType={props.custType}
                                            advanceAdded={formValues.advanceAmount !== null && formValues.advanceAmount !== ''}
                                            selectedInvoice={props.selectedInvoice}
                                            totalReceived={totalReceived}
                                            totalReceipt={totalReceipt}
                                            pageType={props.pageType}
                                            entryType={props.entryType}
                                        />
                                    )}
                                    {tabValue === 3 && (
                                        <Advances
                                            advance={customerVendorAdvances}
                                            selectedAdvance={selectedAdvance}
                                            setSelectedAdvance={setSelectedAdvance}
                                            totalRefund={formValues.refundAmount}
                                            entryType={props.entryType}
                                            type={props.type}
                                        />
                                    )}
                                </Box>

                                {/* Note + Summary */}
                                <Grid container spacing={3}>
                                    <Grid size={8}>
                                        <Box sx={{ bgcolor: 'white', borderRadius: 2, p: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                                            <TextField
                                                value={formValues.note}
                                                fullWidth
                                                multiline
                                                rows={3}
                                                label='Note'
                                                variant='outlined'
                                                onChange={(event) => setFormValues((prev) => ({ ...prev, note: event.target.value }))}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid size={4}>
                                        <Box sx={{ p: 3, backgroundColor: summaryBackgroundColor, borderRadius: 2, height: '100%' }}>
                                            <Typography variant='subtitle2' textAlign='end' sx={{ mb: 1 }}>
                                                {tabValue === 3 ? `Total Refund: ${totalRefund.toFixed(2)}` : `Total Received: ${totalReceived?.toFixed(2)}`}
                                            </Typography>
                                            <Typography variant='subtitle2' textAlign='end' sx={{ mb: 1 }}>
                                                {tabValue === 3 ? `Total Adjusted: ${totalAdjusted.toFixed(2)}` : `Total Receipt Amount: ${totalReceipt?.toFixed(2)}`}
                                            </Typography>
                                            {tabValue !== 3 && (
                                                <Typography variant='subtitle2' textAlign='end'>
                                                    {`${props.custType === 'CUSTOMER' ? 'Advance Received' : 'Excess Amount'}: ${totalAdvance > 0 ? totalAdvance?.toFixed(2) : 0}`}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Grid>
                                </Grid>

                                {/* File Upload */}
                                {props.pageType !== 'EXPENSE' && (
                                    <Box sx={{ bgcolor: 'white', borderRadius: 2, p: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                                        <FilePicker uploadedFiles={formValues.uploadedImage} setUploadedFiles={(data) => {
                                            if(controlImageEdit){
                                                setFormValues((prev) => ({...prev, uploadedImage: data}))
                                            }
                                            else{
                                                setControlImageEdit(true)
                                            }
                                        }} />
                                    </Box>
                                )}
                            </Stack>
                        )}

                    </Box>
    )

    /* === INLINE MODE: renders inside the page, no Dialog === */
    if (isInline) {
        return (
            <>
                <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: '#f8f9fb', height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
                    {headerBar}
                    {stepperBar}
                    <Box sx={{ flex: 1, overflow: 'auto', px: { xs: 2, md: 4 }, py: 3, '&::-webkit-scrollbar': { width: '6px', height: '6px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#c1c1c1', borderRadius: '3px' } }}>
                        {pageContent}
                    </Box>
                    {actionBar}
                </Box>
                {extraDialogs}
            </>
        )
    }

    /* === DIALOG MODE: renders as a modal popup === */
    return (
        <>
            <Dialog open={props.paymentOpen} maxWidth='xl' fullWidth PaperProps={{ sx: { bgcolor: '#f8f9fb', height: 'calc(100vh - 64px)', maxHeight: 'calc(100vh - 64px)', borderRadius: 2 } }}>
                {headerBar}
                {stepperBar}
                <DialogContent sx={{ bgcolor: '#f8f9fb', px: { xs: 2, md: 4 }, py: 3 }}>
                    {pageContent}
                </DialogContent>
                {actionBar}
            </Dialog>
            {extraDialogs}
        </>
    );

}

ReceiptPayments.propTypes = {
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
    inline: PropTypes.bool,
}

export default ReceiptPayments;
