import { Autocomplete, Box, Checkbox, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import PaymentMethodServices from '../../services/payment_method_services';
import { useDispatch, useSelector } from "react-redux";
import { listCashBoxLocationAction } from "redux/actions/cash_box_actions";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import PropTypes from "prop-types";
import { listPosCreationAction } from "redux/actions/pos_creations_actions";
import moment from "moment";
import { v4 as uuidv4 } from 'uuid';
import { getDenominationValidationByIdAction } from "redux/actions/cashOutIn_actions";
import { DatePicker, DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import DenominationDialog from "components/pos/payment_section/DenominationDialog";
import { checkChequeNumberExistAction } from "redux/actions/sales_actions";
import bankCreaction_services from "services/bankCreaction_services";
import toMomentOrNull from "utils/DateFixer";

function PaymentMethods(props) {

    const dispatch = useDispatch()
    const {
        cashBoxReducer: { locateCashBox },
        posCreationReducer: { pos_creation },
        CashOutInReducer: { cashOutIn_denomination },
        cashBoxReducer: { cashAndBankAccounts },
        salesReducer: { editReceiptData }
    } = useSelector((state) => state)
    const { headerLocationId, setModalTypeHandler, setLoaderStatusHandler, commoncookie } = useContext(CreateNewButtonContext)
    const amountRefs = useRef({})

    const [allPaymentModes, setAllPaymentModes] = useState([])
    const [dummyPaymentModes, setDummyPaymentModes] = useState([])
    const [selectedPayments, setSelectedPayments] = useState([])
    const [selectedCashbox, setSelectedCashbox] = useState({})
    const [activeOpen, setActiveOpen] = useState(-2)
    const [open, setOpen] = useState(-1)
    const [cashBoxInfo, setCashBoxInfo] = useState({
        cash_box_id: null,
        cashboxLedgerId: null,
    })
    const [defaultCash, setDefaultCash] = useState({})
    const [openDenominationDialog, setOpenDenominationDialog] = useState(false)
    const [openDenomination, setOpenDenomination] = useState(false)
    const [currentTarget, setCurrentTarget] = useState('Tendered')
    const [denominationTable, setDenominationTable] = useState(1)
    const [referenceNo, setReferenceNo] = useState(null)
    const [cardReferenceNo, setCardReferenceNo] = useState(null)
    const [referenceNoErr, setReferenceNoErr] = useState(false)
    const [chequeInfo, setChequeInfo] = useState({
        bankName: null,
        chequeDate: moment().format('YYYY-MM-DD HH:mm:ss'),
        chequeNumber: null,
    })
    const [chequeInfoError, setChequeInfoError] = useState({
        bankName: null,
        chequeDate: null,
        chequeNumber: null,
    })
    const [index, setIndex] = useState(0)
    const [focusedPaymentId, setFocusedPaymentId] = useState(null)

    useEffect(() => {
    if(props.page === 1){
        const chequeDesc = props.type === 'BANK_RECONCILIATION' && (props.reconciliateData.Description.toString().toUpperCase().startsWith("CHQ") || props.reconciliateData.Description.toString().toUpperCase().startsWith("CHEQUE"))
        const loadPayments = props.manualMatch === 'ManualMatch' || props.type === 'BANK_RECONCILIATION' ?
            bankCreaction_services.getPaymentMethodByBankId(props?.bankId)
                .then((res) => {
                    setAllPaymentModes(res.data.filter(d => props.type === 'BANK_RECONCILIATION' ? d.payment_type !== 'Cash' && (chequeDesc ? d.payment_type.toLowerCase() === 'cheque' : d.payment_type.toLowerCase() !== 'cheque') : true))
                    setDummyPaymentModes(res.data.filter(d => props.type === 'BANK_RECONCILIATION' ? d.payment_type !== 'Cash' && (chequeDesc ? d.payment_type.toLowerCase() === 'cheque' : d.payment_type.toLowerCase() !== 'cheque') : true))
                })
                .catch(() => {})
            : PaymentMethodServices.getAllPaymentModeForPaymentPage()
                .then((res) => {
                    setAllPaymentModes(res.data.filter(d => props.type === 'BANK_RECONCILIATION' ? d.payment_type !== 'Cash' : true))
                    setDummyPaymentModes(res.data.filter(d => props.type === 'BANK_RECONCILIATION' ? d.payment_type !== 'Cash' : true))
                })
                .catch(() => {})

        loadPayments.then(() => {
            dispatch(listCashBoxLocationAction(headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
            dispatch(listPosCreationAction(() => { }, () => { }))
        })
    }
}, [props.page])


    useEffect(() => {
        if (allPaymentModes.length > 0 && props.transactionTable.length > 0) {
            if(!selectedPayments.includes(props.transactionTable[0].paymentId)){
                const selectedPaymentMethod = allPaymentModes.find(d => d.paymentId === props.transactionTable[0].paymentId)
                setSelectedPayments((prev) => ([...prev, selectedPaymentMethod.paymentId]))
                setChequeInfo((prev) => ({ ...prev, chequeNumber: props.transactionTable[0].chequeNumber, bankName: props.transactionTable[0].bankName, chequeDate: moment(props.transactionTable[0].chequeDate).format('YYYY-MM-DD HH:mm:ss') }))
                const obj = {
                    ...props.transactionTable[0]
                }
                if (selectedPaymentMethod.payment_type === 'Cash (INR)' && locateCashBox.length === 1) {
                    const defaultCashbox = locateCashBox[0]
                    const arr = allPaymentModes.map(payments => {
                        if (payments.paymentId === selectedPaymentMethod.paymentId) {
                            return {
                                ...payments,
                                selectedCashBox: defaultCashbox,
                                tempCashBox: defaultCashbox,
                                amount: props.transactionTable[0].payment_amount,
                                balance: payments.tempBalance || payments.balance,
                                lastDigit: payments.tempLastDigit || payments.lastDigit || '',
                                referenceNo: props.transactionTable[0].referenceNumber,
                                axisType: payments.tempAxisType || payments.axisType || '',
                                transDate: moment(props.transactionTable[0].transDate).format('YYYY-MM-DD HH:mm:ss')
                            }
                        }
                        else {
                            return payments
                        }
                    })
                    obj.cash_box_id = defaultCashbox?.id
                    obj.cashboxLedgerId = defaultCashbox.cashboxLedgerId
                    setAllPaymentModes(arr)
                    Dropdown(defaultCashbox, selectedPaymentMethod.paymentId, selectedPaymentMethod.payment_type)
                    handleCashboxChange(defaultCashbox, selectedPaymentMethod.paymentId, selectedPaymentMethod.payment_type)
                    setSelectedCashbox({ [selectedPaymentMethod.paymentId]: true })
                }
                else if (selectedPaymentMethod.payment_type === 'Cash' && (locateCashBox.length > 1 || locateCashBox.length === 0)) {
                    setSelectedCashbox({ [selectedPaymentMethod.paymentId]: false })
                }
                else {
                    const arr = allPaymentModes.map(payments => {
                        if (payments.paymentId === selectedPaymentMethod.paymentId) {
                            return {
                                ...payments,
                                cash_box_id: null,
                                selectedCashBox: null,
                                tempCashBox: null,
                                amount: props.transactionTable[0].payment_amount,
                                balance: payments.tempBalance || payments.balance,
                                lastDigit: payments.tempLastDigit || payments.lastDigit || '',
                                referenceNo: props.transactionTable[0].referenceNumber,
                                axisType: payments.tempAxisType || payments.axisType || '',
                                transDate: moment(props.transactionTable[0].transDate).format('YYYY-MM-DD HH:mm:ss')
                            }
                        }
                        else {
                            return payments
                        }
                    })
                    setAllPaymentModes(arr)
                }
            }
        }
    }, [allPaymentModes, props.transactionTable])

    useEffect(() => { (async () => {
        if(props.entryType === 'edit' && Object.keys(editReceiptData).length > 0 && dummyPaymentModes.length > 0){
            const paymentMethod = editReceiptData.paymentMethod
            if(paymentMethod.length > 0){
                const selectedPaymentMethod = paymentMethod[0]?.payment_id ? dummyPaymentModes.find(d => d.paymentId === paymentMethod[0].payment_id) : null;
                if (!selectedPaymentMethod) {
                    const fallbackPaymentType = paymentMethod[0].payment_type || 'Unknown';
                    setChequeInfo((prev) => ({ ...prev, chequeNumber: paymentMethod[0].chequeNumber, bankName: paymentMethod[0].bankName, chequeDate: paymentMethod[0].chequeDate ? moment(paymentMethod[0].chequeDate).format('YYYY-MM-DD HH:mm:ss') : moment().format('YYYY-MM-DD HH:mm:ss') }))
                    const obj = {
                        id: uuidv4(),
                        due: props.total,
                        payment_amount: paymentMethod[0].amount,
                        cash_adjustment: 0,
                        payment_type: `${fallbackPaymentType} (INR)`,
                        cash_refund: 0,
                        employee_id: commoncookie,
                        reference_code: '',
                        tendered: [],
                        change: [],
                        cash_box_id: null,
                        paymentId: null,
                        cashboxLedgerId: null,
                        paymentLedgerId: null,
                        ledger_id: props.getPay?.[0]?.ledger_id ?? 0,
                        referenceNumber: paymentMethod[0].referenceNumber,
                        cardReferenceNumber: null,
                        bankName: paymentMethod[0].bankName,
                        chequeNumber: paymentMethod[0].chequeNumber,
                        chequeDate: paymentMethod[0].payment_type === 'Cheque' ? moment(paymentMethod[0].chequeDate).format('YYYY-MM-DD HH:mm:ss') : null,
                        transDate: paymentMethod[0].chequeDate ? moment(paymentMethod[0].chequeDate).format('YYYY-MM-DD HH:mm:ss') : moment(props.receiptDate || moment()).format('YYYY-MM-DD HH:mm:ss')
                    }
                    props.setTransactionTable([obj]);
                    return;
                }
                setSelectedPayments((prev) => ([...prev, selectedPaymentMethod.paymentId]))
                setChequeInfo((prev) => ({ ...prev, chequeNumber: paymentMethod[0].chequeNumber, bankName: paymentMethod[0].bankName, chequeDate: moment(paymentMethod[0].chequeDate).format('YYYY-MM-DD HH:mm:ss') }))
                const obj = {
                    id: uuidv4(),
                    due: props.total,
                    payment_amount: paymentMethod[0].amount,
                    cash_adjustment: 0,
                    payment_type: `${selectedPaymentMethod.payment_type} (INR)`,
                    cash_refund: 0,
                    employee_id: commoncookie,
                    reference_code: '',
                    tendered: [],
                    change: [],
                    cash_box_id: null,
                    paymentId: selectedPaymentMethod.paymentId,
                    cashboxLedgerId: null,
                    paymentLedgerId: getPaymentModeLedgerId(selectedPaymentMethod.paymentId),
                    ledger_id: props.getPay?.[0]?.ledger_id ?? 0,
                    referenceNumber: paymentMethod[0].referenceNumber,
                    cardReferenceNumber: null,
                    bankName: paymentMethod[0].bankName,
                    chequeNumber: paymentMethod[0].chequeNumber,
                    chequeDate: selectedPaymentMethod.payment_type === 'Cheque' ? moment(paymentMethod[0].chequeDate).format('YYYY-MM-DD HH:mm:ss') : null,
                    transDate: moment(paymentMethod[0].date).format('YYYY-MM-DD HH:mm:ss')
                }
    
                if(selectedPaymentMethod.payment_type === 'Cash' && locateCashBox.length === 1){
                    const defaultCashbox = locateCashBox[0]
                    const arr = dummyPaymentModes.map(payments => {
                        if(payments.paymentId === selectedPaymentMethod.paymentId){
                            return {
                                ...payments,
                                selectedCashBox: defaultCashbox,
                                tempCashBox: defaultCashbox,
                                amount: paymentMethod[0].amount,
                                balance: payments.tempBalance || payments.balance,
                                lastDigit: payments.tempLastDigit || payments.lastDigit || '',
                                referenceNo: paymentMethod[0].referenceNumber,
                                axisType: payments.tempAxisType || payments.axisType || '',
                                transDate: moment(paymentMethod[0].date).format('YYYY-MM-DD HH:mm:ss')
                            }
                        }
                        else{
                            return payments
                        }
                    })
                    obj.cash_box_id = defaultCashbox?.id
                    obj.cashboxLedgerId = defaultCashbox.cashboxLedgerId
                    await props.setTransactionTable([obj])
                    setAllPaymentModes(arr)
                    Dropdown(defaultCashbox, selectedPaymentMethod.paymentId, selectedPaymentMethod.payment_type)
                    handleCashboxChange(defaultCashbox, selectedPaymentMethod.paymentId, selectedPaymentMethod.payment_type)
                    setSelectedCashbox({ [selectedPaymentMethod.paymentId]: true })
                }
                else if(selectedPaymentMethod.payment_type === 'Cash' && (locateCashBox.length > 1 || locateCashBox.length === 0)){
                    setSelectedCashbox({ [selectedPaymentMethod.paymentId]: false })
                    await props.setTransactionTable([obj])
                }
                else {
                    const arr = dummyPaymentModes.map(payments => {
                        if(payments.paymentId === selectedPaymentMethod.paymentId){
                            return {
                                ...payments,
                                cash_box_id: null,
                                selectedCashBox: null,
                                tempCashBox: null,
                                amount: paymentMethod[0].amount,
                                balance: payments.tempBalance || payments.balance,
                                lastDigit: payments.tempLastDigit || payments.lastDigit || '',
                                referenceNo: paymentMethod[0].referenceNumber,
                                axisType: payments.tempAxisType || payments.axisType || '',
                                transDate: moment(paymentMethod[0].date).format('YYYY-MM-DD HH:mm:ss')
                            }
                        }
                        else{
                            return payments
                        }
                    })
                    setAllPaymentModes(arr)
                    props.setTransactionTable([obj])
                }
            }
            else{
                setSelectedPayments([])
                props.setTransactionTable([])
            }
        }
    })();
}, [editReceiptData, props.entryType, dummyPaymentModes])

    useEffect(() => { (async () => {
        if(props.type === 'CHEQUE_REPRESENT' && Object.keys(props.editData).length > 0 && dummyPaymentModes.length > 0){
            const paymentMethod = props.editData.paymentDetails
            if(paymentMethod.length > 0){
                const selectedPaymentMethod = paymentMethod[0]?.payment_id ? dummyPaymentModes.find(d => d.paymentId === paymentMethod[0].payment_id) : null;
                if (!selectedPaymentMethod) {
                    const fallbackPaymentType = paymentMethod[0].payment_type || 'Unknown';
                    setChequeInfo((prev) => ({ ...prev, chequeNumber: paymentMethod[0].chequeNumber, bankName: paymentMethod[0].bankName, chequeDate: paymentMethod[0].chequeDate ? moment(paymentMethod[0].chequeDate).format('YYYY-MM-DD HH:mm:ss') : moment(props.receiptDate).set({hour: moment().hour(), minute: moment().minute(), second: moment().second()}).format('YYYY-MM-DD') }))
                    const obj = {
                        id: uuidv4(),
                        due: props.total,
                        payment_amount: paymentMethod[0].amount,
                        cash_adjustment: 0,
                        payment_type: `${fallbackPaymentType} (INR)`,
                        cash_refund: 0,
                        employee_id: commoncookie,
                        reference_code: '',
                        tendered: [],
                        change: [],
                        cash_box_id: null,
                        paymentId: null,
                        cashboxLedgerId: null,
                        paymentLedgerId: null,
                        ledger_id: props.getPay?.[0]?.ledger_id ?? 0,
                        referenceNumber: paymentMethod[0].referenceNumber,
                        cardReferenceNumber: null,
                        bankName: paymentMethod[0].bankName,
                        chequeNumber: paymentMethod[0].chequeNumber,
                        chequeDate: paymentMethod[0].chequeDate ? moment(paymentMethod[0].chequeDate).format('YYYY-MM-DD HH:mm:ss') : moment(props.receiptDate).set({hour: moment().hour(), minute: moment().minute(), second: moment().second()}).format('YYYY-MM-DD'),
                        transDate: paymentMethod[0].chequeDate ? moment(paymentMethod[0].chequeDate).format('YYYY-MM-DD HH:mm:ss') : moment(props.receiptDate).set({hour: moment().hour(), minute: moment().minute(), second: moment().second()}).format('YYYY-MM-DD HH:mm:ss')
                    }
                    props.setTransactionTable([obj]);
                    return;
                }
                setSelectedPayments((prev) => ([...prev, selectedPaymentMethod.paymentId]))
                setChequeInfo((prev) => ({ ...prev, chequeNumber: paymentMethod[0].chequeNumber, bankName: paymentMethod[0].bankName, chequeDate: paymentMethod[0].chequeDate ? moment(paymentMethod[0].chequeDate).format('YYYY-MM-DD HH:mm:ss') : moment(props.receiptDate).set({hour: moment().hour(), minute: moment().minute(), second: moment().second()}).format('YYYY-MM-DD') }))
                const obj = {
                    id: uuidv4(),
                    due: props.total,
                    payment_amount: paymentMethod[0].amount,
                    cash_adjustment: 0,
                    payment_type: `${selectedPaymentMethod.payment_type} (INR)`,
                    cash_refund: 0,
                    employee_id: commoncookie,
                    reference_code: '',
                    tendered: [],
                    change: [],
                    cash_box_id: null,
                    paymentId: selectedPaymentMethod.paymentId,
                    cashboxLedgerId: null,
                    paymentLedgerId: getPaymentModeLedgerId(selectedPaymentMethod.paymentId),
                    ledger_id: props.getPay?.[0]?.ledger_id ?? 0,
                    referenceNumber: paymentMethod[0].referenceNumber,
                    cardReferenceNumber: null,
                    bankName: paymentMethod[0].bankName,
                    chequeNumber: paymentMethod[0].chequeNumber,
                    chequeDate: paymentMethod[0].chequeDate ? moment(paymentMethod[0].chequeDate).format('YYYY-MM-DD HH:mm:ss') : moment(props.receiptDate).set({hour: moment().hour(), minute: moment().minute(), second: moment().second()}).format('YYYY-MM-DD'),
                    transDate: paymentMethod[0].chequeDate ? moment(paymentMethod[0].chequeDate).format('YYYY-MM-DD HH:mm:ss') : moment(props.receiptDate).set({hour: moment().hour(), minute: moment().minute(), second: moment().second()}).format('YYYY-MM-DD HH:mm:ss')
                }

                if(selectedPaymentMethod.payment_type === 'Cash' && locateCashBox.length === 1){
                    const defaultCashbox = locateCashBox[0]
                    const arr = dummyPaymentModes.map(payments => {
                        if(payments.paymentId === selectedPaymentMethod.paymentId){
                            return {
                                ...payments,
                                selectedCashBox: defaultCashbox,
                                tempCashBox: defaultCashbox,
                                amount: paymentMethod[0].amount,
                                balance: payments.tempBalance || payments.balance,
                                lastDigit: payments.tempLastDigit || payments.lastDigit || '',
                                referenceNo: paymentMethod[0].referenceNumber,
                                axisType: payments.tempAxisType || payments.axisType || '',
                                transDate: moment(paymentMethod[0].date).format('YYYY-MM-DD HH:mm:ss')
                            }
                        }
                        else{
                            return payments
                        }
                    })
                    obj.cash_box_id = defaultCashbox?.id
                    obj.cashboxLedgerId = defaultCashbox.cashboxLedgerId
                    obj.transDate = moment(paymentMethod[0].date).format('YYYY-MM-DD HH:mm:ss')
                    await props.setTransactionTable([obj])
                    setAllPaymentModes(arr)
                    Dropdown(defaultCashbox, selectedPaymentMethod.paymentId, selectedPaymentMethod.payment_type)
                    handleCashboxChange(defaultCashbox, selectedPaymentMethod.paymentId, selectedPaymentMethod.payment_type)
                    setSelectedCashbox({ [selectedPaymentMethod.paymentId]: true })
                    dispatch(getDenominationValidationByIdAction(defaultCashbox?.id))
                }
                else if(selectedPaymentMethod.payment_type === 'Cash' && (locateCashBox.length > 1 || locateCashBox.length === 0)){
                    setSelectedCashbox({ [selectedPaymentMethod.paymentId]: false })
                    await props.setTransactionTable([obj])
                }
                else {
                    const arr = dummyPaymentModes.map(payments => {
                        if(payments.paymentId === selectedPaymentMethod.paymentId){
                            return {
                                ...payments,
                                cash_box_id: null,
                                selectedCashBox: null,
                                tempCashBox: null,
                                amount: paymentMethod[0].amount,
                                balance: payments.tempBalance || payments.balance,
                                lastDigit: payments.tempLastDigit || payments.lastDigit || '',
                                referenceNo: paymentMethod[0].referenceNumber,
                                axisType: payments.tempAxisType || payments.axisType || '',
                                transDate: paymentMethod[0].chequeDate ? moment(paymentMethod[0].chequeDate).format('YYYY-MM-DD HH:mm:ss') : moment(props.receiptDate).set({hour: moment().hour(), minute: moment().minute(), second: moment().second()}).format('YYYY-MM-DD HH:mm:ss')
                            }
                        }
                        else{
                            return payments
                        }
                    })
                    setAllPaymentModes(arr)
                    props.setTransactionTable([obj])
                }
            }
        }
        // else{
        //     setSelectedPayments([])
        //     props.setTransactionTable([])
        // }
    })();
}, [props.type, props.editData, dummyPaymentModes])

    useEffect(() => {
        if (props.customer && props.type !== 'CHEQUE_REPRESENT') {
            const updatedTransactions = props.transactionTable.map(item => ({
                ...item,
                id: item.id,
                due: props.total,
                payment_amount: item.payment_amount,
                cash_adjustment: item.cash_adjustment,
                payment_type: item.payment_type || '',
                cash_refund: item.cash_refund,
                employee_id: commoncookie,
                reference_code: item.reference_code,
                tendered: [],
                change: [],
                cash_box_id: item.cash_box_id || null,
                paymentId: item.paymentId,
                cashboxLedgerId: item.cashboxLedgerId || null,
                paymentLedgerId: getPaymentModeLedgerId(item.paymentId),
                ledger_id: props.getPay?.[0]?.ledger_id ?? 0,
                referenceNumber: props.reconciliateData ? props.reconciliateData.Description : item.referenceNumber,
                cardReferenceNumber: item.cardReferenceNumber,
                bankName: item.bankName,
                chequeNumber: item.chequeNumber,
                chequeDate: item.payment_type?.includes('Cheque')
                    ? props.reconciliateData
                        ? moment(props.reconciliateData.Date, 'MM/DD/YYYY').format('YYYY-MM-DD HH:mm:ss')
                        : moment().format('YYYY-MM-DD HH:mm:ss')
                    : null,
                transDate: props.reconciliateData ? moment(props.reconciliateData.Date, 'MM/DD/YYYY').set({hour: moment().hour(), minute: moment().minute(), second: moment().second()}).format('YYYY-MM-DD HH:mm:ss') : moment().format('YYYY-MM-DD HH:mm:ss')
            }));

            props.setTransactionTable(updatedTransactions);
        }
    }, [props.customer, props.getPay]);

    useEffect(() => {
        if (props.customer !== null && chequeInfo.chequeNumber !== null && chequeInfo.chequeNumber !== '' && props.entryType !== 'edit' && props.type !== 'CHEQUE_REPRESENT') {
            const dummySelectedPayment = selectedPayments
            const dummyTransactionTable = props.transactionTable
            // const handler = setTimeout(() => {
            //     const data = {
            //         chequeNumber: chequeInfo.chequeNumber
            //     }

            //     if(props.custType === 'CUSTOMER'){
            //         data.customer_id = props.customer.customer_id
            //         data.type = 'customer'
            //     }
            //     else{
            //         data.supplier_id = props.customer.supplier_id
            //         data.type = 'supplier'
            //     }
            //     dispatch(checkChequeNumberExistAction(data, async(response) => {
            //         const res = await response
            //         if(res.status === 'Exist'){
            //             setChequeInfoError((prev) => ({ ...prev, chequeNumber: 'Cheque Number Already Exist' }))
            //             setSelectedPayments(dummySelectedPayment)
            //             props.setTransactionTable(dummyTransactionTable)
            //         }
            //         else{
            //             setChequeInfoError((prev) => ({ ...prev, chequeNumber: null }))
            //             setSelectedPayments(dummySelectedPayment)
            //             props.setTransactionTable(dummyTransactionTable)
            //         }
            //     }))
            // }, 1500)
            setSelectedPayments(dummySelectedPayment)
            props.setTransactionTable(dummyTransactionTable)

            // return () => clearTimeout(handler)
        }
    }, [props.customer, chequeInfo.chequeNumber, props.custType, props.entryType])

    const paymentDenominationValidation = (value) => {
        // dispatch(getDenominationValidationByIdAction(value))
    }

    
    useEffect(()=>{
        if(openDenominationDialog === true){
             dispatch(getDenominationValidationByIdAction(cashBoxInfo?.cash_box_id))
        }

    }, [openDenominationDialog])

    const handleCashboxChange = (data, paymentId, paymentType) => {
        dispatch(getDenominationValidationByIdAction(data?.id))
        setActiveOpen(-1)
        paymentDenominationValidation(data?.id)
        setOpen(paymentId)
        setCashBoxInfo({ cash_box_id: data?.id || null, cashboxLedgerId: data?.ledger_id || null })
        setSelectedCashbox((prev) => ({ ...prev, [paymentId]: data?.id ? true : false }))
        setTimeout(() => {
            amountRefs.current[paymentId]?.focus();
        }, 100)
        if (data?.allowdenomination === 0) {
            setDefaultCash(data)
        }
        else {
            setOpenDenominationDialog(true);
            setDefaultCash({})
            const cashType = paymentType + " (INR)";
            handleClick(cashType, paymentId, data?.allowdenomination)
        }
        // const updatedTransactionTable = props.transactionTable.map((trans) => {
        //     if(trans.paymentId === paymentId){
        //         return {
        //             ...trans,
        //             cash_box_id: data?.id,
        //             cashboxLedgerId: data?.ledger_id
        //         }
        //     }
        //     else{
        //         return { ...trans }
        //     }
        // })
        // props.setTransactionTable(updatedTransactionTable)
    }

    const getCashBoxId = () => {
        let res = pos_creation.filter((f) => f.props.posId === props.posId)
        if (res.length > 0) {
            return res[0].cashBox
        }
    }

  const getCashBoxLedgerId = () => {
        let res = pos_creation.filter((f) => f.props.posId === props.posId)
        if (res.length > 0) {
            return res[0].cashboxLedgerId
        }
    }

  const getPaymentModeLedgerId = (paymentId) => {
        let res = allPaymentModes.filter((f) => f.paymentId === paymentId)
        if (res.length > 0) {
            return res[0].ledger_id
        }
    }

    const handleClick = (type, paymentId, denomination) => {
        if (denomination === 0) {
            cardPayment('Cash (INR)', paymentId)
        }
        else {
            setOpenDenominationDialog(true);
            setCurrentTarget('Tendered');
            props.pageType === 'posSalePage' && setDenominationTable(denomination)
            const getAmount = props.transactionTable.reduce(function (acc, obj) {
            return acc + +obj.payment_amount;
            }, 0);
    
            if (!props.transactionTable.length) {
                return;
            }
    
            if (
            +props.transactionTable[props.transactionTable.length - 1].payment_amount &&
            props.transactionTable[props.transactionTable.length - 1].payment_type &&
            getAmount < +props.total
            ) {
                return;
            }
    
            const copy = [...props.transactionTable];
            const pindex = copy.findIndex((i) => !i.payment_type || !+i.payment_amount);
            if (pindex !== -1) {
            copy[pindex].payment_type = type;
            copy[pindex].cash_box_id = cashBoxInfo.cash_box_id !== null && typeof props.posId === 'undefined' ? cashBoxInfo.cash_box_id : getCashBoxId(),
                copy[pindex].paymentId = paymentId,
                copy[pindex].cashboxLedgerId = cashBoxInfo.cashboxLedgerId !== null && typeof props.posId === 'undefined' ? cashBoxInfo.cashboxLedgerId : getCashBoxLedgerId(),
                copy[pindex].paymentLedgerId = getPaymentModeLedgerId(paymentId),
                copy[pindex].ledger_id = typeof props.getPay !== 'undefined' ? props.getPay[0]?.ledger_id : 0,
                copy[pindex].referenceNumber = referenceNo,
                copy[pindex].cardReferenceNumber = cardReferenceNo,
                copy[pindex].bankName = chequeInfo.bankName,
                copy[pindex].chequeNumber = chequeInfo.chequeNumber,
                copy[pindex].chequeDate = moment(chequeInfo.chequeDate).format("YYYY-MM-DD HH:mm:ss")
            }
    
            props.setTransactionTable(copy);
            setIndex(pindex);
        }
    }

    const cardPayment = (type, paymentId) => {
        if(activeOpen === paymentId){
            setActiveOpen(-1)
        }
        else{
            setActiveOpen(paymentId)
        }
        setOpenDenominationDialog(false)

        let getAmount = props.transactionTable.reduce(function (acc, obj) {
            return acc + +obj.payment_amount
        }, 0);
        
        if (!props.transactionTable.length) {
            // createData(type, true, paymentId)
            return
        }

        if (
        +props.transactionTable[props.transactionTable.length - 1].payment_amount &&
        props.transactionTable[props.transactionTable.length - 1].payment_type &&
        getAmount < +props.total
        ) {
            // createData(type, true, paymentId)
            return
        }

        const copy = [...props.transactionTable];
        const pindex = copy.findIndex((i) => !+i.payment_amount || !i.payment_type);

        if (pindex !== -1) copy[pindex].payment_type = type;

        if (getAmount < +props.total && !+copy[pindex].payment_amount) {
            copy[pindex].payment_amount = +props.total - getAmount;
            getAmount = +props.total - getAmount;
            editPay(pindex, copy, getAmount);
        }

        props.setTransactionTable(copy);
        setIndex(pindex);
    }

    const editPay = (pindex, getData, getAmount) => {
        let nindex = pindex
        for (let i = pindex + 1; i < getData.length; i++) {
        if (getAmount < +props.total) {
            let due = +getData[nindex].due - +getData[nindex].payment_amount
            if (!due) {
                getData.splice(i, getData.length - 1 - i + 1)
            }
            else {
                getData[i].due = due
                nindex += 1
            }
        } else {
            if (i === getData.length - 1) {
                getData.splice(pindex + 1, getData.length - 1 - pindex + 1)
            }
        }
        }
    }

    const Dropdown = (data, paymentId, payment_type) => {
        setActiveOpen(-1);
        paymentDenominationValidation(data?.id);
        setOpen(paymentId);
        setCashBoxInfo({ cash_box_id: data?.id || null, cashboxLedgerId: data?.ledger_id || null });

        setSelectedCashbox((prev) => ({
            ...prev,
            [paymentId]: data?.id ? true : false,
        }));
        setTimeout(() => {
            amountRefs.current[paymentId]?.focus();
        }, 100);
        if (data?.allowdenomination === 0) {
            setDefaultCash(data)
        }
        else {
            setOpenDenominationDialog(true);
            setDefaultCash({});
            const cash_type = payment_type + " (INR)";
            handleClick(cash_type, paymentId, data?.allowdenomination);
        }
    }
    
    const handlePaymentSelection = async(event, paymentMode, index) => {
        const checked = event.target.checked
        let chequeDesc = false
        let reconciliateDataChequeNumber = null
        if(props.reconciliateData){
            chequeDesc = (props.reconciliateData.Description.toString().toUpperCase().startsWith("CHQ") || props.reconciliateData.Description.toString().toUpperCase().startsWith("CHEQUE"))
    
            const match = props.reconciliateData.Description.match(/\d+/);
            reconciliateDataChequeNumber = (!match) ? null : parseInt(match[0], 10).toString().padStart(6, "0");
        }
        if(checked){
            const paymentMethod = editReceiptData?.paymentMethod ?? null
            let selectedPaymentMethod = null
            if(paymentMethod){
                selectedPaymentMethod = dummyPaymentModes.find(d => d.paymentId === paymentMethod[0].payment_id)
            }
          
            props.setSelectedPaymentMode(paymentMode)
            setSelectedPayments((prev) => ([...prev, paymentMode.paymentId]))
            const obj = {
                id: uuidv4(),
                due: props.total,
                payment_amount: props.reconciliateData ? 
                    props.reconciliateData.Credit && props.reconciliateData.Credit !== '-' && props.reconciliateData.Credit !== '' ? 
                        props.reconciliateData.Credit 
                    : props.reconciliateData.Debit && props.reconciliateData.Debit !== '-' && props.reconciliateData.Debit !== '' ? 
                        props.reconciliateData.Debit 
                    : 0
                : (props.tab === 2 || props.tab === 3) ? (props.advanceAmount || props.refundAmount) 
                    : paymentMethod ?
                        paymentMethod[0].amount : 0,
                cash_adjustment: 0,
                payment_type: `${paymentMode.payment_type} (INR)`,
                cash_refund: 0,
                employee_id: commoncookie,
                reference_code: '',
                tendered: [],
                change: [],
                cash_box_id: null,
                paymentId: paymentMode.paymentId,
                cashboxLedgerId: null,
                paymentLedgerId: getPaymentModeLedgerId(paymentMode.paymentId),
                ledger_id: props.getPay?.[0]?.ledger_id ?? 0,
                referenceNumber: props.reconciliateData && !chequeDesc ? props.reconciliateData.Description : paymentMethod ? paymentMethod[0].referenceNumber :  null,
                cardReferenceNumber: null,
                bankName: paymentMethod ? paymentMethod[0].bankName : null,
                chequeNumber: props.reconciliateData && chequeDesc ? reconciliateDataChequeNumber : paymentMethod ? paymentMethod[0].chequeNumber : null,
                chequeDate: paymentMode.payment_type === 'Cheque' ? props.reconciliateData ? moment(props.reconciliateData.Date, 'MM/DD/YYYY').format('YYYY-MM-DD HH:mm:ss') : paymentMethod ? moment(paymentMethod[0].chequeDate).format('YYYY-MM-DD HH:mm:ss') : props.receiptDate ? moment(props.receiptDate).set({hour: moment().hour(), minute: moment().minute(), second: moment().second()}).format('YYYY-MM-DD HH:mm:ss') : moment().format('YYYY-MM-DD HH:mm:ss') : null,
                transDate: props.reconciliateData ? moment(props.reconciliateData.Date, 'MM/DD/YYYY').set({hour: moment().hour(), minute: moment().minute(), second: moment().second()}).format('YYYY-MM-DD HH:mm:ss') : props.receiptDate ? moment(props.receiptDate).set({hour: moment().hour(), minute: moment().minute(), second: moment().second()}).format('YYYY-MM-DD HH:mm:ss') : moment().format('YYYY-MM-DD HH:mm:ss')
            }

            if(paymentMode.payment_type === 'Cash' && locateCashBox.length === 1){
                const defaultCashbox = locateCashBox[0]
                const arr = allPaymentModes.map(payments => {
                    if(payments.paymentId === paymentMode.paymentId){
                        return {
                            ...payments,
                            selectedCashBox: defaultCashbox,
                            tempCashBox: defaultCashbox,
                            amount: props.reconciliateData ? 
                                props.reconciliateData.Credit && props.reconciliateData.Credit !== '-' && props.reconciliateData.Credit !== '' ? 
                                    props.reconciliateData.Credit 
                                : props.reconciliateData.Debit && props.reconciliateData.Debit !== '-' && props.reconciliateData.Debit !== '' ? 
                                    props.reconciliateData.Debit
                                : paymentMethod ?
                                    paymentMethod[0].amount
                                : 0
                            : (props.tab === 2 || props.tab === 3) ? (props.advanceAmount || props.refundAmount) : 0,
                            balance: payments.tempBalance || payments.balance,
                            lastDigit: payments.tempLastDigit || payments.lastDigit || '',
                            referenceNo: props.reconciliateData ? props.reconciliateData.Description : payments.tempReferenceNo ||payments.referenceNo || '',
                            axisType: payments.tempAxisType || payments.axisType || '',
                            transDate: paymentMethod ? moment(paymentMethod[0].date).format('YYYY-MM-DD HH:mm:ss') : moment().format('YYYY-MM-DD HH:mm:ss')
                        }
                    }
                    else{
                        return payments
                    }
                })
                obj.cash_box_id = defaultCashbox?.id
                obj.cashboxLedgerId = defaultCashbox.cashboxLedgerId
                obj.transDate = paymentMethod ? moment(paymentMethod[0].date).format('YYYY-MM-DD HH:mm:ss') : moment().format('YYYY-MM-DD HH:mm:ss')
                await props.setTransactionTable((prev) => ([...prev, obj]))
                setAllPaymentModes(arr)
                Dropdown(defaultCashbox, paymentMode.paymentId, paymentMode.payment_type)
                handleCashboxChange(defaultCashbox, paymentMode.paymentId, paymentMode.payment_type)
                setSelectedCashbox((prev) => ({ ...prev, [paymentMode.paymentId]: true }))
                dispatch(getDenominationValidationByIdAction(defaultCashbox?.id, async(response) => {
                    const res = await response
                    const matchedAcct = cashAndBankAccounts.find(d => (d.type === 'Cash' && d.id === obj?.cash_box_id) || (d.type === 'Bank' && d.id === obj?.bankAccountId))
                    if(matchedAcct && (props.tab === 2 || props.tab === 3) && Number(props.advanceAmount || props.refundAmount) > matchedAcct.amount){
                        props.setNeedNegativeCashAlert(true)
                        props.setNegativeCashAmount(Number(props.advanceAmount || props.refundAmount) - matchedAcct.amount)
                    }
                }))
            }
            else if(paymentMode.payment_type === 'Cash' && (locateCashBox.length > 1 || locateCashBox.length === 0)){
                setSelectedCashbox((prev) => ({ ...prev, [paymentMode.paymentId]: false }))
                await props.setTransactionTable((prev) => ([...prev, obj]))
            }
            else {
                const arr = allPaymentModes.map(payments => {
                    if(payments.paymentId === paymentMode.paymentId){
                        return {
                            ...payments,
                            cash_box_id: null,
                            selectedCashBox: null,
                            tempCashBox: null,
                            amount: props.reconciliateData ? 
                                props.reconciliateData.Credit && props.reconciliateData.Credit !== '-' && props.reconciliateData.Credit !== '' ? 
                                    props.reconciliateData.Credit 
                                : props.reconciliateData.Debit && props.reconciliateData.Debit !== '-' && props.reconciliateData.Debit !== '' ? 
                                    props.reconciliateData.Debit 
                                : (payments.tempAmount || payments.amount)
                                : (props.tab === 2 || props.tab === 3) ? 
                                    (props.advanceAmount || props.refundAmount) 
                                : paymentMethod ? 
                                        paymentMethod[0].amount 
                                : (payments.tempAmount || payments.amount),
                            balance: payments.tempBalance || payments.balance,
                            lastDigit: payments.tempLastDigit || payments.lastDigit || '',
                            referenceNo: props.reconciliateData && !chequeDesc ? props.reconciliateData.Description : payments.tempReferenceNo ||payments.referenceNo || '',
                            axisType: payments.tempAxisType || payments.axisType || '',
                            transDate: props.reconciliateData ? moment(props.reconciliateData.Date, 'MM/DD/YYYY').set({hour: moment().hour(), minute: moment().minute(), second: moment().second()}).format('YYYY-MM-DD HH:mm:ss') : paymentMethod ? moment(paymentMethod[0].date).format('YYYY-MM-DD HH:mm:ss') : props.receiptDate ? moment(props.receiptDate).set({hour: moment().hour(), minute: moment().minute(), second: moment().second()}).format('YYYY-MM-DD HH:mm:ss') : moment().format('YYYY-MM-DD HH:mm:ss')
                        }
                    }
                    else{
                        return payments
                    }
                })
                setAllPaymentModes(arr)
                props.setTransactionTable((prev) => ([...prev, obj]))

                if(props.reconciliateData && chequeDesc){
                    setChequeInfo((prev) => ({ ...prev, chequeNumber: reconciliateDataChequeNumber, chequeDate: moment(props.reconciliateData.Date).format('YYYY-MM-DD HH:mm:ss') }))
                }
            }
        }
        else{
            // setIndex(0)
            setReferenceNo(null)
            setChequeInfo((prev) => ({ ...prev, bankName: null, chequeDate: moment().format('YYYY-MM-DD HH:mm:ss'), chequeNumber: null }))
            const updatedSelectedPayments = selectedPayments.filter(payments => payments !== paymentMode.paymentId)
            setSelectedPayments(updatedSelectedPayments)
            setSelectedCashbox((prev) => ({ ...prev, [paymentMode.paymentId]: false }))
            const arr = allPaymentModes.map(payments => {
                if(payments.paymentId === paymentMode.paymentId){
                    return {
                        ...payments,
                        amount: 0,
                        balance: 0,
                        lastDigit: '',
                        referenceNo: '',
                        axisType: '',
                        cash_box_id: null,
                        selectedCashBox: null,
                        tempAmount: payments.amount,
                        tempBalance: payments.balance,
                        tempLastDigit: payments.lastDigit,
                        tempReferenceNo: payments.referenceNo,
                        tempCardReferenceNo: payments.cardReferenceNo,
                        tempAxisType: payments.axisType,
                        tempCashBox: payments.selectedCashBox || selectedCashbox[payments.paymentId],
                    }
                }
                else{
                    return payments
                }
            })
            props.setSelectedPaymentMode(null)
            setAllPaymentModes(arr)
            setChequeInfoError((prev) => ({ ...prev, chequeNumber: null, bankName: null, chequeDate: null }))
            props.setTransactionTable(props.transactionTable.filter(data => data.paymentId !== paymentMode.paymentId))
            setCashBoxInfo({cash_box_id: null, cashboxLedgerId: null})
        }
    }

    const handleAmountChange = (e, item, key) => {
        const newValue = e.target.value
        const updatedTransactionData = props.transactionTable.map((pMode) => {
        if (pMode.paymentId === item.paymentId) {
            const value = newValue
            const amount = value
            return {
                ...pMode,
                payment_amount: amount,
            }
        }
        return pMode
        })
        props.setTransactionTable(updatedTransactionData)
        const updatedPaymentModes = allPaymentModes.map((pMode, index) => {
        if (pMode.paymentId === item.paymentId) {
            const value = newValue
            const amount = value
            const remainingBalance = (props.advanceAmount || props.refundAmount) - amount
            return {
                ...pMode,
                amount: amount,
                balance: remainingBalance < 0 ? 0 : remainingBalance,
            }
        }
        return pMode
        })
        setAllPaymentModes(updatedPaymentModes)
        keyboard(newValue, null, key, 'textinput')
        setFocusedPaymentId(item.paymentId)
        const matchedAccount = cashAndBankAccounts.find(d => (d.type === 'Cash' && d.id === item?.cash_box_id) || (d.type === 'Bank' && d.id === item?.bankAccountId))
        if(matchedAccount && Number(newValue) > matchedAccount.amount){
            props.setNegativeCashAmount(Number(newValue) - matchedAccount.amount)
            props.setNeedNegativeCashAlert(true)
        }
    }

    const keyboard = (val, tendered = null, index, type) => {
        setOpenDenominationDialog(false)
        if (type !== 'textinput') {
            let value = Number(val)
            value = isNaN(value) ? 0 : value

            let arr = [...allPaymentModes]
            arr[0].amount = value

            let remainingBalance = (props.advanceAmount || props.refundAmount) - value
            arr[0].balance = remainingBalance < 0 ? 0 : remainingBalance

            setAllPaymentModes(arr)
        }
        const { cash_box_id, cashboxLedgerId } = cashBoxInfo
        const getData = [...props.transactionTable];
        if (!getData[0]) return;

        getData[0].payment_amount = val;
        getData[0].tendered = tendered;

        if (cash_box_id !== null && cashboxLedgerId !== null) {
            getData[0].cash_box_id = cash_box_id
            getData[0].cashboxLedgerId = cashboxLedgerId
        }


        let cindex = [];

        const getAmount = getData.reduce(function (acc, obj, i) {
            if (!+obj.payment_amount) {
                cindex.push(i);
            }
            return acc + +obj.payment_amount;
        }, 0);
        if (getAmount > props.total && props.transactionTable[index]?.payment_type === "Cash (INR)") {
            return;
        }
        change(setDefault(getData, getAmount, cindex), getAmount);
    }
    const setDefault = (getData, getAmount, cindex) => {
        let venter = false;

        if (cindex.length >= 1 && cindex.length) {
            venter = true;
        }

        if (venter && index < getData.length - 1) {
            editPay2(getData, getAmount, cindex);
        }
        else if (!venter && Math.round(getAmount) < Math.round(+props.total)) {
            editPay2(getData, getAmount);
            const obj = {
                id: uuidv4(),
                due: Math.round(+props.total) - Math.round(getAmount),
                payment_amount: '',
                cash_adjustment: 0,
                payment_type: ``,
                cash_refund: 0,
                employee_id: commoncookie,
                reference_code: '',
                tendered: [],
                change: [],
            };
            getData.push(obj);
        }
        else {
            editPay2(getData, getAmount);
        }
        return getData;
    };

    const editPay2 = (getData, getAmount, cindex) => {
        let nindex = index
        for (let i = index + 1; i < getData.length; i++) {
            let due = +getData[nindex].due - +getData[nindex].payment_amount
            getData[i].due = Math.sign(due) === 1 && Math.round(due) === 1 ? due : 0
            nindex += 1

            if (i === getData.length - 1 && getAmount > +props.total) {
                if (cindex) {
                    cindex.forEach((d) => {
                        if (getData.length - 1 === d) getData.splice(d, 1)
                    });
                }
            }
        }

    }

    const change = (getData, getAmount) => {
        const newAmount = Math.round(getAmount) - Math.round(+props.total)
        getData.forEach((d, ind) => {
            if (ind === index && Math.sign(newAmount) === 1 && +getData[index].payment_amount) {
                getData[index].cash_adjustment = newAmount
            } 
            else {
                getData[ind].cash_adjustment = 0
            }
            })
        props.setTransactionTable(getData)
    }

    const handleDateChange = (paymentId, index, date, isCheque) => {
        const updatedPaymentModes = allPaymentModes.map((v, i) => {
            if (paymentId === v.paymentId) {
                return {
                    ...v,
                    transDate: moment(date).format('YYYY-MM-DD HH:mm:ss')
                }
            }
            else {
                return v
            }
        });
        setAllPaymentModes(updatedPaymentModes)

        const updatedTransactionData = props.transactionTable.map((v, i) => {
            if (paymentId === v.paymentId) {
                if (isCheque) {
                    return {
                        ...v,
                        transDate: moment(date).format('YYYY-MM-DD HH:mm:ss'),
                        chequeDate: moment(date).format('YYYY-MM-DD HH:mm:ss'),
                    }
                }
                else{
                    return {
                        ...v,
                        transDate: moment(date).format('YYYY-MM-DD HH:mm:ss'),
                    }    
                }
            }
            else{
                return v
            }
        })
        props.setTransactionTable(updatedTransactionData)

        if (isCheque) {
            setChequeInfo((prev) => ({ ...prev, chequeDate: moment(date).format('YYYY-MM-DD HH:mm:ss') }))

        }
    }

    const renderReferenceNumberColumn = (type, pay) => {
        switch(type){
            case 'UPI':
            case 'NEFT':
            case 'RTGS':
            case 'IMPS':
            case 'NEFT / RTGS / IMPS':
            case 'Net Banking':
            case 'EMI':
                return (
                    <Box display="flex" justifyContent="left" alignItems="center">
                        <TextField
                        name='referenceNo'
                        variant='outlined'
                        placeholder='Reference Number'
                        size="small"
                        value={pay.referenceNo || ''}
                        onChange={(e) => {
                                const val = e.target.value;
                                if(val.length <= 100){
                                    setReferenceNo(val);

                                    const updatedTransactionData = props.transactionTable.map((v, i) => {
                                        if (pay.paymentId === v.paymentId) {
                                            return {
                                            ...v,
                                            referenceNumber: val,
                                            }
                                        }
                                        else{
                                            return v
                                        }
                                    })
                                    props.setTransactionTable(updatedTransactionData)
                                    const updatedPaymentModes = allPaymentModes.map((v, i) => {
                                        if (pay.paymentId === v.paymentId) {
                                            return {
                                            ...v,
                                            referenceNo: val,
                                            }
                                        }
                                        else{
                                            return v
                                        }
                                    })
                                    setAllPaymentModes(updatedPaymentModes)
                                }
                        }}
                        onBlur={() => {
                            if (referenceNo?.trim().length > 0) {
                            setTimeout(() => {
                                amountRefs.current[pay.paymentId]?.focus();
                            }, 100);
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && referenceNo?.trim().length > 0) {
                            amountRefs.current[pay.paymentId]?.focus();
                            }
                        }}
                        error={referenceNoErr}
                        helperText={referenceNoErr ? "Required!" : ''}
                        sx={{ width: '80%' }}
                        required
                        />
                    </Box>
                )

            case 'Card':
                return (
                    <Box display="flex" justifyContent="left" alignItems="center">
                        <TextField
                        id='outlined-basic'
                        size='small'
                        fullWidth
                        name='cardReferenceNo'
                        placeholder='Card Number'
                        sx={{ width: '80%' }}
                        value={pay.referenceNo || ''}
                        onChange={(e) => {
                            const val = e.target.value
                            setReferenceNo(val)

                            const updatedTransactionData = props.transactionTable.map((v, i) => {
                                if (pay.paymentId === v.paymentId) {
                                    return {
                                    ...v,
                                    referenceNumber: val,
                                    }
                                }
                                else{
                                    return v
                                }
                            })
                            props.setTransactionTable(updatedTransactionData)
                            const updatedPaymentModes = allPaymentModes.map((v, i) => {
                                if (pay.paymentId === v.paymentId) {
                                    return {
                                    ...v,
                                    referenceNo: val,
                                    }
                                }
                                else{
                                    return v
                                }
                            })
                            setAllPaymentModes(updatedPaymentModes)
                        }}
                        onBlur={() => {
                            if (referenceNo?.trim().length > 0) {
                            setTimeout(() => {
                                amountRefs.current[pay.paymentId]?.focus()
                            }, 100)
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && referenceNo?.trim().length > 0) {
                            amountRefs.current[pay.paymentId]?.focus();
                            }
                        }}
                        InputLabelProps={{
                            style: {
                            paddingTop: '2px',
                            },
                        }}
                        />
                    </Box>
                )
            case 'Cheque':
                return (
                   <Box display="block" alignItems='center' justifyContent='left'>
                        <TextField
                            id='outlined-basic'
                            size='small'
                            fullWidth
                            placeholder='Cheque Number'
                            disabled={props.type === 'CHEQUE_REPRESENT'}
                            name='chequeNo'
                            required
                            sx={{ width: '80%' }}
                            value={chequeInfo.chequeNumber}
                            onChange={(e) => {
                                const val = e.target.value;

                                if (!val) {
                                    setChequeInfoError((prev) => ({ ...prev, chequeNumber: "Cheque Number is Required" }));
                                } else if (!/^\d{6}$/.test(val)) {
                                    setChequeInfoError((prev) => ({ ...prev, chequeNumber: "Invalid Cheque Number" }));
                                } else {
                                    setChequeInfoError((prev) => ({ ...prev, chequeNumber: null }));
                                }
                                setChequeInfo((prev) => ({ ...prev, chequeNumber: val }));

                                const updatedTransactionData = props.transactionTable.map((v) => {
                                    if (pay.paymentId === v.paymentId) {
                                        return {
                                            ...v,
                                            chequeNumber: val
                                        }
                                    }
                                    return v;
                                })
                                props.setTransactionTable(updatedTransactionData)
                            }}
                            error={!!chequeInfoError.chequeNumber}
                            helperText={chequeInfoError.chequeNumber}
                            InputLabelProps={{
                                style: {
                                paddingTop: '2px',
                                },
                            }}
                        />

                        <br />
                        <br />

                        <TextField
                            id='outlined-basic'
                            size='small'
                            fullWidth
                            required
                            placeholder='Bank Name'
                            disabled={props.type === 'CHEQUE_REPRESENT'}
                            name='bankName'
                            sx={{ width: '80%' }}
                            value={chequeInfo.bankName}
                            onChange={(e) => {
                                setChequeInfo((prev) => ({ ...prev, bankName: e.target.value }))

                                if(e.target.value === '' || e.target.value === null){
                                    setChequeInfoError((prev) => ({ ...prev, bankName: 'Bank is Required' }))
                                }
                                else{
                                    setChequeInfoError((prev) => ({ ...prev, bankName: null }))
                                }

                                const updatedTransactionData = props.transactionTable.map((v, i) => {
                                    if (pay.paymentId === v.paymentId) {
                                        return {
                                        ...v,
                                        bankName: e.target.value,
                                        }
                                    }
                                    else{
                                        return v
                                    }
                                })
                                props.setTransactionTable(updatedTransactionData)
                            }}
                            InputLabelProps={{
                                style: {
                                paddingTop: '2px',
                                },
                            }}
                            error={chequeInfoError.bankName}
                            helperText={chequeInfoError.bankName}
                        />
                    </Box> 
                )
            default:
                return (
                    <Box height={40} />
                )
        }
    }

    const renderPaymentMethodColumn = (pay) => {
        if(pay.payment_type !== 'Cash') {
            return pay.paymentName || pay.payment_type
        } 
        else if(!selectedPayments.includes(pay.paymentId)) {
            return pay.paymentName || pay.payment_type
        }
        else {
            return(
                <Box >
                    {renderPaymentMethodElse(pay)}
                </Box>
            )
        }
    }

    const renderPaymentMethodElse = (pay) => {
        if(locateCashBox.length === 1) {
            return (
                <TextField
                    label="CashBox"
                    variant="outlined"
                    size="small"
                    value={allPaymentModes.find((p) => p.paymentId === pay.paymentId)?.selectedCashBox?.name || ''}
                    InputProps={{
                    readOnly: true,
                    }}
                />
            ) 
        }
        else if (locateCashBox.length > 1){
            return (
                <Autocomplete
                    disablePortal
                    options={locateCashBox}
                    getOptionLabel={(option) => option?.name || ''}
                    value={allPaymentModes.find((p) => p.paymentId === pay.paymentId)
                        ?.selectedCashBox || null}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    onChange={(e, val) => {
                        handleCashboxChange(val, pay.paymentId, pay.payment_type);

                        const updatedModes = allPaymentModes.map((v) =>
                            pay.paymentId === v.paymentId
                                ? {
                                    ...v,
                                    cash_box_id: val?.id || null,
                                    cashboxLedgerId: val?.ledger_id || null,
                                    selectedCashBox: val,
                                    tempCashBox: val,
                                }
                                : v
                        );

                        const updatedTable = props.transactionTable.map((v) =>
                            pay.paymentId === v.paymentId
                                ? {
                                    ...v,
                                    cash_box_id: val?.id || null,
                                    cashboxLedgerId: val?.ledger_id || null,
                                    selectedCashBox: val,
                                    tempCashBox: val,
                                }
                                : v
                        );

                        setAllPaymentModes(updatedModes);
                        props.setTransactionTable(updatedTable);
                    }}
                    ListboxProps={{
                        style: {
                            maxHeight: 260,
                            overflowY: 'auto',
                        },
                    }}
                    PopperProps={{
                        modifiers: [
                            {
                                name: 'preventOverflow',
                                options: {
                                    boundary: 'window',
                                },
                            },
                        ],
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Select CashBox"
                            variant="outlined"
                            size="small"
                            sx={{
                                minWidth: 180,
                            }}
                        />
                    )}
                />
            ) 
        } 
        else{
            return (
                <TextField
                    label="CashBox"
                    variant="outlined"
                    size="small"
                    value="No CashBox"
                    InputProps={{
                        readOnly: true,
                    }}
                />
            )
        }
    }

    const openingDenominationStatus = () => {
        setOpenDenomination(!openDenomination)
        setOpenDenominationDialog(!openDenomination)
    }

    const  dialogTochange = (val, changeArr) => {
        props.transactionTable[index].cash_adjustment = val;
        props.transactionTable[index].change = changeArr;
        props.setTransactionTable(props.transactionTable);
    }

    return(
        <>
            <TableContainer component={Paper} elevation={0}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                            <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: 'text.secondary', py: 1.5 }}></TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: 'text.secondary', py: 1.5 }}>Payment Method</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: 'text.secondary', py: 1.5 }}>Transaction Date</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: 'text.secondary', py: 1.5 }}>Bank / Cash</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: 'text.secondary', py: 1.5 }}>Reference Number</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: 'text.secondary', py: 1.5 }}>Amount</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {
                            allPaymentModes.map((pay, index) => (
                                <TableRow key={pay.paymentId}>
                                    <TableCell>
                                        <Checkbox
                                            checked = {selectedPayments.includes(pay.paymentId)}
                                            disabled = {(!selectedPayments.includes(pay.paymentId) && selectedPayments.length > 0) || props.creditSelected || ((props.type === 'BANK_RECONCILIATION' && pay.payment_type === 'Cash') || props.type === 'CHEQUE_REPRESENT')}
                                            onChange = {(event) => handlePaymentSelection(event, pay, index)}
                                        />
                                    </TableCell>

                                    <TableCell>
                                        <Box display="flex" justifyContent="left" alignItems="center" className='table-content'>
                                            {
                                                renderPaymentMethodColumn(pay)
                                            }
                                        </Box>
                                    </TableCell>

                                    <TableCell>
                                        {
                                            selectedPayments.includes(pay.paymentId) ? 
                                            <LocalizationProvider dateAdapter={DateAdapter}>
                                                <DateTimePicker
                                                format="DD/MM/YYYY HH:mm:ss"
                                                value = {pay.payment_type === 'Cheque' ? toMomentOrNull(chequeInfo.chequeDate) : toMomentOrNull(pay?.transDate) || toMomentOrNull(moment(props.receiptDate).set({hour: moment().hour(), minute: moment().minute(), second: moment().second()}).format('YYYY-MM-DD HH:mm:ss'))}
                                                onChange={(date) => handleDateChange(pay.paymentId, index, date, pay.payment_type === 'Cheque')}
                                                disabled={pay.payment_type === 'Cash' || props.type === 'BANK_RECONCILIATION' || props.type === 'CHEQUE_REPRESENT'}
                                                slotProps={{ textField: { fullWidth: true, variant: 'outlined', onKeyDown: e => e.preventDefault() } }}
                                                />
                                            </LocalizationProvider>
                                            : ''
                                        }
                                    </TableCell>

                                    <TableCell>
                                        {pay.bankName ? pay.bankName : pay.paymentName}
                                    </TableCell>

                                    <TableCell>
                                        {selectedPayments.includes(pay.paymentId) && renderReferenceNumberColumn(pay.payment_type, pay)}
                                    </TableCell>

                                    <TableCell>
                                        {selectedPayments.includes(pay.paymentId) && (
                                            <Box display="flex" justifyContent="left" alignItems="center">
                                                <TextField
                                                    id='outlined-basic'
                                                    size='small'
                                                    fullWidth
                                                    inputRef={(el) => (amountRefs.current[pay.paymentId] = el)}
                                                    name="amount"
                                                    style={{ backgroundColor: 'white', paddingBottom: '0px' }}
                                                    placeholder="0.00"
                                                    variant='outlined'
                                                    value={pay.amount || ''}
                                                    disabled={(pay.payment_type === 'Cash' && !selectedCashbox[pay.paymentId]) || props.type === 'BANK_RECONCILIATION' || props.type === 'CHEQUE_REPRESENT'}
                                                    onChange={(e) => {
                                                        const value = e.target.value
                                                        const numericValue = parseFloat(value) || 0
                                                        if ((value === '' || (/^\d*\.?\d{0,2}$/).test(value)) && (value === '' || numericValue > 0)) {
                                                            handleAmountChange(e, pay, index)
                                                        }
                                                        // handleAmountChange(e, pay, index)
                                                    }}
                                                    onBlur={() => setFocusedPaymentId(null)}
                                                    slotProps={{ input: { disableUnderline: true } }}
                                                />
                                            </Box>
                                        )}
                                    </TableCell>

                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
        
            <DenominationDialog
                open={openDenominationDialog}
                setOpenDenomination={setOpenDenominationDialog}
                keyboard={keyboard}
                dialogTochange={dialogTochange}
                openingDenominationStatus={openingDenominationStatus}
                currentTarget={currentTarget}
                Due={props.transactionTable}
                setTdata={props.setTransactionTable}
                index={index}
                setStateCashBoxInfo={setCashBoxInfo}
                posId={props.posId}
                cashOutIn_denomination={cashOutIn_denomination}
                responseType={props.responseType}
            />
        </>
    )
}

PaymentMethods.propTypes = {
    transactionTable: PropTypes.array,
    setTransactionTable: PropTypes.func,
    page: PropTypes.number,
    total: PropTypes.number,
    getPay: PropTypes.array,
    posId: PropTypes.number,
    advanceAmount: PropTypes.number,
    refundAmount: PropTypes.number,
    responseType: PropTypes.string,
    receiptDate: PropTypes.string,
    selectedTotal: PropTypes.number,
    pageType: PropTypes.string,
    creditSelected: PropTypes.bool,
    reconciliateData: PropTypes.object,
    editData: PropTypes.object,
    entryType: PropTypes.string,
    custType: PropTypes.string,
    tab: PropTypes.number,
    setSelectedPaymentMode: PropTypes.func,
    setNeedNegativeCashAlert: PropTypes.func,
    setNegativeCashAmount: PropTypes.func
}

export default PaymentMethods