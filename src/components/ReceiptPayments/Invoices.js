import { Autocomplete, Checkbox, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";

import moment from "moment";
import PropTypes from "prop-types";
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { getAllemployeeincludingAdminAction } from "redux/actions/soTracking_actions";

function Invoices(props){

    const adjustedAmountRef = useRef({})
    const dispatch = useDispatch()
    const {
        salesReducer: { editReceiptData },
        soTrackingReducer: { allemp }
    } = useSelector(state => state)

    const [tableData, setTableData] = useState([])
    const [selected, setSelected] = useState([])

    // useEffect(() => {
    //     dispatch(getAllemployeeincludingAdminAction())
    // }, [])

    // useEffect(() => {
    //     props.setInvoice([])
    //     if(props.getPay.length > 0){
    //         const invoiceRows = props.getPay.filter(f => props.custType === 'CUSTOMER' ? (f.invoice_number !== null || f.dc_number !== null)  : props.pageType === 'EXPENSE' ? true : f.due_amount > 0).map(row => ({
    //             id: row.id ?? row.receiving_id,
    //             refNumber: row.invoice_number ?? row.dc_number,
    //             invoice_date: props.custType === 'CUSTOMER' ? moment(row.invoice_date).format('DD/MM/YYYY') : props.pageType === 'EXPENSE' ? moment(row.date).format('DD/MM/YYYY') : row.invoice_date,
    //             po_number: row.po_number,
    //             type: 'Invoice',
    //             total: props.pageType === 'EXPENSE' ? Number(row.total_amount) : row.total,
    //             receivable: props.custType === 'CUSTOMER' ? (Number(row.total) - Number(row.paid_amount ?? 0)).toFixed(2) : '',
    //             payable: props.custType === 'VENDOR' ? props.pageType === 'EXPENSE' ? Number(row.paid_amount) : (Number(row.total) - Number(row.paid_amount)).toFixed(2) : '',
    //             paymentAmount: row.paymentAmount ? Object.keys(editReceiptData).length > 0 ? row.paymentAmount !== props.totalReceived ? props.totalReceived > row.total ? row.total : props.totalReceived : row.paymentAmount : row.paymentAmount.toFixed(2) : 0,
    //             markAsDelivered: row.markAsDelivered ? row.markAsDelivered : false,
    //             deliveryPerson: row.deliveryPerson ? row.deliveryPerson : null,
    //             originalRow: row,
    //             invoice_number: props.custType === 'VENDOR' ? row.invoice_number : '',
    //             location_name: props.custType === 'VENDOR' ? row.location_name : ''
    //         }))
    //         const sortedInvoiceRows = invoiceRows?.sort((a, b) => new Date(a.invoice_date) - new Date(b.invoice_date))
    //         setTableData(sortedInvoiceRows)
    // console.log(sortedInvoiceRows, 'sortedInvoiceRows')
    //         if(props.selectedInvoice){
    //             const selectedInvoice = sortedInvoiceRows.find(data => data.id === props.selectedInvoice)
    //             let paymentAmount = 0
    //             const invoiceAmount = props.custType === 'CUSTOMER' ? selectedInvoice?.receivable : selectedInvoice?.payable
    //             if(invoiceAmount < props.totalReceived && (props.totalReceipt + invoiceAmount) < props.totalReceived){
    //                 paymentAmount = invoiceAmount
    //             }
    //             else{
    //                 paymentAmount = (props.totalReceived - props.totalReceipt).toFixed(2)
    //             }
    //             const updatedRows = invoiceRows.map((rows) => {
    //             if(rows.id === selectedInvoice.id){
    //                     return{
    //                         ...rows,
    //                         paymentAmount: paymentAmount
    //                     }
    //                 }
    //                 else{
    //                     return { ...rows }
    //                 }
    //             })
    //             setTableData(updatedRows)
    //             props.setInvoice((prev) => ([ ...prev, { ...selectedInvoice, paymentAmount: paymentAmount } ]))
    //             setSelected((prev) => ([...prev, props.selectedInvoice]))
    //         }
    //         else if(props.entryType !== 'edit'){
    //             let remainingPaymentAmount = props.totalReceived
    //             for(let i = 0; i < invoiceRows.length; i++){
    //                 const dueAmount = props.custType === 'CUSTOMER' ? sortedInvoiceRows[i]?.receivable : sortedInvoiceRows[i]?.payable
    //                 if(remainingPaymentAmount !== 0){
    //                     if(remainingPaymentAmount <= dueAmount){
    //                         sortedInvoiceRows[i].paymentAmount = remainingPaymentAmount.toFixed(2)
    //                         remainingPaymentAmount = 0
    //                         setSelected((prev) => ([...prev, sortedInvoiceRows[i].id]))
    //                         props.setInvoice((prev) => ([ ...prev, sortedInvoiceRows[i] ]))
    //                     }
    //                     else {
    //                         if(remainingPaymentAmount > 0 && remainingPaymentAmount >= dueAmount){
    //                             sortedInvoiceRows[i].paymentAmount = dueAmount
    //                             remainingPaymentAmount -= dueAmount
    //                             setSelected((prev) => ([...prev, sortedInvoiceRows[i].id]))
    //                             props.setInvoice((prev) => ([ ...prev, sortedInvoiceRows[i] ]))
    //                         }
    //                         else{
    //                             sortedInvoiceRows[i].paymentAmount = remainingPaymentAmount.toFixed(2)
    //                             remainingPaymentAmount = 0
    //                             setSelected((prev) => ([...prev, sortedInvoiceRows[i].id]))
    //                             props.setInvoice((prev) => ([ ...prev, sortedInvoiceRows[i] ]))
    //                         }
    //                     }
    //                 }
    //             }
    //             setTableData(sortedInvoiceRows)
    //         }
    //         else if(Object.keys(editReceiptData).length > 0){
    //             const invoice = editReceiptData.Invoice
    //             if(invoice.length > 0){
    //                 const selectedInvoice = invoice.map((d) => {
    //                     const inv = props.custType === 'CUSTOMER' ? sortedInvoiceRows.find(invRow => invRow.id === d.sale_id) : sortedInvoiceRows.find(invRow => invRow.id === d.receiving_id)
    //                     if(!inv){
    //                         if(props.custType === 'CUSTOMER'){
    //                             const newInvoice = {
    //                                 id: d.sale_id,
    //                                 refNumber: d.invoice_number,
    //                                 invoice_date:  moment(d.invoice_date).format('DD/MM/YYYY'),
    //                                 po_number: null,
    //                                 type: 'Invoice',
    //                                 total: d.total,
    //                                 receivable: Math.abs(d.total - (d.received_amount + d.payment_amount)),
    //                                 payable: '',
    //                                 paymentAmount: d.payment_amount,
    //                                 markAsDelivered: d.delivery_status === 6,
    //                                 deliveryPerson: allemp.find(e => e.employee_id === d.picked_by),
    //                                 originalRow: {
    //                                     due_amount: d.due_amount,
    //                                     invoice_date: d.invoice_date,
    //                                     invoice_number: d.invoice_number,
    //                                     pending_amount: d.due_amount,
    //                                     received_amount: d.total - (d.received_amount + d.due_amount),
    //                                     sale_id: d.sale_id,
    //                                     total: d.total,
    //                                 }
    //                             }
    //                             sortedInvoiceRows.push(newInvoice)
    //                             return newInvoice
    //                         }
    //                         else{
    //                             const newBill = {
    //                                 id: d.receiving_id,
    //                                 refNumber: d.po_number,
    //                                 invoice_date:  moment(d.invoice_date).format('DD/MM/YYYY'),
    //                                 po_number: d.po_number,
    //                                 type: 'Invoice',
    //                                 total: d.total,
    //                                 receivable: '',
    //                                 payable: Math.abs(d.total - (d.paid_amount + d.payment_amount)),
    //                                 paymentAmount: d.paymentAmount !== props.totalReceived ? props.totalReceived > d.total ? d.total : props.totalReceived : d.paymentAmount,
    //                                 invoice_number: d.invoice_number,
    //                                 location_name: d.location_name,
    //                                 originalRow: {
    //                                     due_amount: d.due_amount,
    //                                     invoice_date: d.invoice_date,
    //                                     invoice_number: d.po_number,
    //                                     pending_amount: d.due_amount,
    //                                     received_amount: d.total - (d.paid_amount + d.due_amount),
    //                                     receiving_id: d.receiving_id,
    //                                     total: d.total,
    //                                 }
    //                             }
    //                             sortedInvoiceRows.push(newBill)
    //                             return newBill
    //                         }
    //                     }
    //                     else{
    //                         return { ...inv, paymentAmount: d.payment_amount !== props.totalReceived ? props.totalReceived > d.total ? d.total : props.totalReceived : d.payment_amount, markAsDelivered: true, deliveryPerson: allemp.find(e => e.employee_id === d.picked_by)}
    //                     }
    //                 })
    //                 setTableData(sortedInvoiceRows?.sort((a, b) => new Date(a.invoice_date) - new Date(b.invoice_date)).sort((a, b) => a.id - b.id))
    //                 props.setInvoice(selectedInvoice)
    //                 setSelected(selectedInvoice.map(d => d.id))
    //             }
    //         }
    //     }
    // }, [props.getPay, props.selectedInvoice, props.entryType, editReceiptData, props.totalReceived])

const manualChangeRef = useRef(false);
const initializedRef = useRef(false);


useEffect(() => {

    if (!props.getPay?.length) return;

    /* ⛔ If user manually changed checkbox, do NOTHING */
    if (manualChangeRef.current) {
        manualChangeRef.current = false;
        return;
    }

    /* ⛔ Prevent re-initialization */
    if (initializedRef.current) return;

    const isOpeningRow = (row) =>
        row.sale_id == null &&
        row.invoice_number === 'OPENING_BALANCE';

    /* ---------------- BUILD BASE ROWS ---------------- */
    let rows = props.getPay.map(row => {
        const total = props.pageType === 'EXPENSE'
            ? Number(row.total_amount)
            : Number(row.total);

        const paid = Number(row.paid_amount ?? 0);

        return {
            id: isOpeningRow(row)
                ? 'OPENING'
                : (row.sale_id ?? row.receiving_id ?? row.id),

            refNumber: row.invoice_number ?? row.dc_number,
            invoice_date_raw: row.invoice_date ?? row.date,
            invoice_date: moment(row.invoice_date ?? row.date).format('DD/MM/YYYY'),
            total,

            receivable: props.custType === 'CUSTOMER'
                ? ((total * 100) - (paid * 100)) / 100
                : 0,

            payable: props.custType === 'VENDOR'
                ? ((total * 100) - (paid * 100)) / 100
                : 0,

            paymentAmount: 0,
            markAsDelivered: false,
            deliveryPerson: null,
            originalRow: row
        };
    });

    let selectedIds = [];
    let selectedInvoices = [];
    
    /* ================= INVOICE AUTO SELECTING FROM INVOICES, RECEIVABLES, BILLS AND PAYABLES ================= */
    if(props.selectedInvoice){
        const selectedInvoice = rows.find(data => data.id === props.selectedInvoice)
        let paymentAmount = 0
        const invoiceAmount = props.custType === 'CUSTOMER' ? selectedInvoice?.receivable : selectedInvoice?.payable
        if(invoiceAmount < props.totalReceived && (props.totalReceipt + invoiceAmount) < props.totalReceived){
            paymentAmount = (invoiceAmount).toFixed(2)
        }
        else{
            paymentAmount = (props.totalReceived - props.totalReceipt).toFixed(2)
        }
        const updatedRows = rows.map((rows) => {
        if(rows.id === selectedInvoice.id){
                return{
                    ...rows,
                    paymentAmount: Number(paymentAmount)
                }
            }
            else{
                return { ...rows }
            }
        })
        rows = updatedRows
        selectedInvoices.push({ ...selectedInvoice, paymentAmount: Number(paymentAmount) })
        selectedIds.push(props.selectedInvoice)
    }

    /* ================= CREATE MODE ================= */
    else if (props.entryType !== 'edit') {

        let remaining = props.totalReceived;

        rows = rows.map(r => {
            const due =
                props.custType === 'CUSTOMER' ? r.receivable : r.payable;

            if (remaining <= 0 || due <= 0) return r;

            const paymentAmount = Math.min(due, remaining);
            remaining -= paymentAmount;

            if (paymentAmount > 0) {
                selectedIds.push(r.id);
                selectedInvoices.push({ ...r, paymentAmount: Number(paymentAmount.toFixed(2)) });
            }

            return { ...r, paymentAmount: Number(paymentAmount.toFixed(2)) };
        });
    }

    /* ================= EDIT MODE ================= */
    else if (props.entryType === 'edit' && editReceiptData?.Invoice?.length) {

        editReceiptData.Invoice.forEach(d => {

            const isOpening =
                d.sale_id == null &&
                d.invoice_number === 'OPENING_BALANCE';

            const id = isOpening
                ? 'OPENING'
                : (d.sale_id ?? d.receiving_id);

            const row = rows.find(r => r.id === id);
            if (!row) return;

            row.paymentAmount = Number(d?.payment_amount ?? d?.paymentAmount ?? 0);
            row.markAsDelivered = d.delivery_status === 6;
            row.deliveryPerson = allemp.find(
                e => e.employee_id === d.picked_by
            );

            selectedIds.push(id);
            selectedInvoices.push({ ...row });
        });
    }

    rows.sort((a, b) => {
        if (a.id === 'OPENING') return -1;
        if (b.id === 'OPENING') return 1;
        return Number(a.id) - Number(b.id);
    });

    initializedRef.current = true;

    setTableData(rows);
    setSelected(selectedIds);
    props.setInvoice(selectedInvoices);

}, [
    props.getPay,
    props.entryType,
    editReceiptData,
    props.selectedInvoice
]);


/* ========================================================= */
/* ================= CHECKBOX HANDLER ====================== */
/* ========================================================= */

const handleCheckboxSelection = (event, row) => {

    manualChangeRef.current = true;

    const checked = event.target.checked;

    if (checked) {
        const due =
            props.custType === 'CUSTOMER' ? row.receivable : row.payable;

        const paymentAmount = Math.min(
            due,
            props.totalReceived - props.totalReceipt
        );

        setTableData(prev =>
            prev.map(r =>
                r.id === row.id ? { ...r, paymentAmount: Number(paymentAmount.toFixed(2))} : r
            )
        );

        setSelected(prev => [...new Set([...prev, row.id])]);

        props.setInvoice(prev => [
            ...prev,
            { ...row, paymentAmount: Number(paymentAmount.toFixed(2)) }
        ]);

    } else {

        setTableData(prev =>
            prev.map(r =>
                r.id === row.id
                    ? { ...r, paymentAmount: 0 }
                    : r
            )
        );

        setSelected(prev => prev.filter(id => id !== row.id));
        props.setInvoice(prev => prev.filter(d => d.id !== row.id));
    }
};



    const handlePaymentAmountChange = (e, rowId) => {
        const updatedRows = tableData.map((row) => {
            if(row.id === rowId){
                return{
                    ...row,
                    paymentAmount: e.target.value
                }
            }
            else{
                return { ...row }
            }
        })
        setTableData(updatedRows)

        const updatedSelectionModel = props.invoice.map((row) => {
            if(row.id === rowId){
                return{
                    ...row,
                    paymentAmount: e.target.value
                }
            }
            else{
                return { ...row }
            }
        })
        props.setInvoice(updatedSelectionModel)
    }

    const handleMarkAsDelivered = (e, rowId) => {
        let deliveryPerson = null
        if(allemp.length === 1){
            deliveryPerson = allemp[0]
        }
        const updatedRows = tableData.map((row) => {
            if(row.id === rowId){
                return{
                    ...row,
                    markAsDelivered: e.target.checked,
                    deliveryPerson: deliveryPerson
                }
            }
            else{
                return { ...row }
            }
        })
        setTableData(updatedRows)

        const updatedSelectionModel = props.invoice.map((row) => {
            if(row.id === rowId){
                return{
                    ...row,
                    markAsDelivered: e.target.checked,
                    deliveryPerson: deliveryPerson
                }
            }
            else{
                return { ...row }
            }
        })
        props.setInvoice(updatedSelectionModel)
    }

    const handleDeliveryPersonChange = (newValue, rowId) => {
        const updatedRows = tableData.map((row) => {
            if(row.id === rowId){
                return{
                    ...row,
                    deliveryPerson: newValue
                }
            }
            else{
                return { ...row }
            }
        })
        setTableData(updatedRows)

        const updatedSelectionModel = props.invoice.map((row) => {
            if(row.id === rowId){
                return{
                    ...row,
                    deliveryPerson: newValue
                }
            }
            else{
                return { ...row }
            }
        })
        props.setInvoice(updatedSelectionModel)
    }

    return(
        <TableContainer component={Paper} elevation={0}>
                <Typography variant='subtitle2' sx={{ p: 2, fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'text.secondary' }}>{props.custType === 'CUSTOMER' ? 'Invoice' : 'Bills'}</Typography>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                            <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: 'text.secondary', py: 1.5 }}></TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: 'text.secondary', py: 1.5 }}>{props.custType === 'CUSTOMER' ? 'Invoice Date' : 'Bill Date'}</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: 'text.secondary', py: 1.5 }}>Reference #</TableCell>
                            {
                                (props.custType === 'VENDOR' && props.pageType !== 'EXPENSE') &&
                                <>
                                    <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: 'text.secondary', py: 1.5 }}>Invoice No</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: 'text.secondary', py: 1.5 }}>Location</TableCell>
                                </>
                            }
                            <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: 'text.secondary', py: 1.5 }}>Total</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: 'text.secondary', py: 1.5 }}>Due Amount</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: 'text.secondary', py: 1.5 }}>Payment Amount</TableCell>
                            {
                                props.custType === 'CUSTOMER' &&
                                <TableCell width={70} sx={{ fontWeight: 600, fontSize: '12px', color: 'text.secondary', py: 1.5 }}>Delivered</TableCell>
                            }
                            {
                                props.custType === 'CUSTOMER' &&
                                <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: 'text.secondary', py: 1.5 }}>Delivery Person</TableCell>
                            }
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {
                            tableData.length > 0 ?
                                tableData.map(row => 
                                {
                                    return(
                                    <TableRow key={row.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked = {selected.includes(row.id)}
                                                onChange={(event) => handleCheckboxSelection(event, row)}
                                                disabled = {(props.totalReceived <= props.totalReceipt && !selected.includes(row.id)) || props.advanceAdded}
                                            />
                                        </TableCell>

                                        <TableCell>{moment(row.invoice_date_raw).isValid() ? moment(row.invoice_date_raw).format('DD/MM/YYYY') : row.invoice_date_raw}</TableCell>

                                        <TableCell>{props.custType === 'CUSTOMER' || props.pageType === 'EXPENSE' ? row.refNumber : row.originalRow.po_number}</TableCell>

                                        {
                                            (props.custType === 'VENDOR' && props.pageType !== 'EXPENSE') &&
                                            <>
                                                <TableCell>{row.originalRow.invoice_number}</TableCell>
                                                <TableCell>{row.originalRow.location_name}</TableCell>
                                            </>
                                        }

                                        <TableCell style={{ textAlign: 'right' }}>{row.total}</TableCell>

                                        <TableCell style={{ textAlign: 'right' }}>{props.custType === 'CUSTOMER' ? row.receivable.toFixed(2) : row.payable.toFixed(2)}</TableCell>

                                        <TableCell>
                                            {
                                                selected.includes(row.id) ? 
                                                    <TextField
                                                        variant = 'outlined'
                                                        value = {row.paymentAmount}
                                                        onChange = {e => {
                                                            const value = e.target.value
                                                            if (value === '' || (/^\d*\.?\d{0,2}$/).test(value)) {
                                                                handlePaymentAmountChange(e, row.id)
                                                            }
                                                        }}
                                                        error={Number(row.paymentAmount) > Number(props.custType === 'CUSTOMER' ? row.receivable : row.payable)}
                                                        helperText={Number(row.paymentAmount) > Number(props.custType === 'CUSTOMER' ? row.receivable : row.payable) ? 'Payment Amount is greater than Due Amount' : ''}
                                                    />
                                                : ''
                                            }
                                        </TableCell>

                                        {
                                            props.custType === 'CUSTOMER' &&
                                            <TableCell width={70}>
                                                <Checkbox
                                                    checked={row.markAsDelivered}
                                                    onChange={(event) => handleMarkAsDelivered(event, row.id)}
                                                    disabled={!selected.includes(row.id)}
                                                />
                                            </TableCell>
                                        }

                                        {
                                            props.custType === 'CUSTOMER' &&
                                            <TableCell>
                                                {
                                                    row.markAsDelivered ? 
                                                        <Autocomplete
                                                            options={allemp}
                                                            getOptionLabel={(option) => option.last_name ? `${option.first_name} ${option.last_name}` : option.first_name}
                                                            value={row.deliveryPerson}
                                                            onChange={(event, newValue) => handleDeliveryPersonChange(newValue, row.id)}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    { ...params }
                                                                    fullWidth
                                                                    label='Select Delivery Person'
                                                                />
                                                            )}
                                                        />
                                                    : ''
                                                }
                                            </TableCell>
                                        }
                                </TableRow>
                                    )
                                }
                                )
                            : <TableRow>
                                <TableCell colSpan={7}>No Invoices Available</TableCell>
                            </TableRow>
                        }
                    </TableBody>
                </Table>
            </TableContainer>
    )
}

Invoices.propTypes = {
    invoice: PropTypes.array,
    setInvoice: PropTypes.func,
    getPay: PropTypes.array,
    advanceAdded: PropTypes.bool,
    selectedInvoice: PropTypes.number,
    totalReceipt: PropTypes.number,
    totalReceived: PropTypes.number,
    pageType: PropTypes.string,
    custType: PropTypes.string,
    entryType: PropTypes.string,
}

export default Invoices