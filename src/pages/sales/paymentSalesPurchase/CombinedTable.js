import React, { useEffect, useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Checkbox, Paper, Typography,
    TextField
} from '@mui/material';
import { useSelector } from 'react-redux';
import moment from 'moment';

export default function CombinedTableComponent({
    getPay = [],
    manualNoteSchemes = [],
    setCreditNote,
    setManualNoteSchemes,
    setReceivableData,
    setSelectionModel,
    selectionModel,
    invoiceselect,
    creditnote,
    setinvoiceselect,
    advanceAmount,
    customer,
    vendor,
    custType,
    type,
    filterType,
    editData,
    clickedInvoice,
    setSummaryData,
    summaryData,
    paymentId,
    isPaymentSelected
}) {
    const [rows, setRows] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedCreditNotes, setSelectedCreditNotes] = useState([])

    const {
        salesReducer: { salesApprovals, getApprovalRights },
    } = useSelector((state) => state);

    useEffect(() => {
        if (!getPay || (Array.isArray(getPay) && getPay.length === 0) || (typeof getPay === 'object' && Object.keys(getPay).length === 0)) {
            // console.log('incomminggggggg')
            setRows([]);
            setSelectedIds([clickedInvoice]);
            setSelectionModel?.([]);
            setReceivableData?.([]);
            setinvoiceselect?.(false);
            setCreditNote?.(false);
            return;
        }
        let invoiceRows = [];
// console.log(getPay && typeof getPay === 'object',"gdfggvvv");

        if (Array.isArray(getPay?.itemsData)) {
            console.log("condityu111");
            
            invoiceRows = getPay.itemsData.map((row) => {
                return{
                    id: row.receiving_id,
                    refNumber: row.invoice_number,
                    invoice_date: custType === 'CUSTOMER' ? moment(row.invoice_date).format('DD/MM/YYYY') : row.invoice_date,
                    po_number: row.po_number ?? getPay.po_number,
                    type: 'Invoice',
                    total: row.total,
                    receivable: type == 0 ? (Number(row.total) - Number(row.paid_amount)).toFixed(2) : '',
                    payable: type == 1 ? (Number(row.total) - Number(row.paid_amount)).toFixed(2) : '',
                    paymentAmount: 0,
                    adjustedAmount: type == 1 ? (Number(row.total) - Number(row.paid_amount)).toFixed(2) : '',
                    originalRow: row,
                }
            });
        } else if (Array.isArray(getPay)) {
            // console.log(getPay[0].paid_amount,(Number(getPay[0].total) - Number(getPay[0].paid_amount)).toFixed(2),getPay,"condityt222");
            
            invoiceRows = getPay.map((row) => {
                const paidAmount = row.paid_amount === 0 ? (row.old_paid_amount ?? 0) : (row.paid_amount ?? 0);
                return {
                    id: row.id,
                    refNumber: row.po_number,
                    invoice_date: custType === 'CUSTOMER' ? moment(row.invoice_date).format('DD/MM/YYYY') : row.invoice_date,
                    po_number: row.po_number,
                    type: 'Invoice',
                    total: row.total,
                    receivable: type == 0 ? (Number(row.total) - Number(row.paid_amount)).toFixed(2) : '',
                    payable: type == 1 ? (Number(row.total) - Number(row.paid_amount)).toFixed(2) : '',
                    paymentAmount: 0,
                    adjustedAmount: type == 1 ? (Number(row.total) - Number(row.paid_amount)).toFixed(2) : '',
                    originalRow: row,
                };
            });
        } else if (getPay && typeof getPay === 'object') {
            // console.log("comegsfre");
            
            // Fallback for when getPay is a single object
            invoiceRows = (getPay.itemsData || []).map((row) => {
            const paidAmount = row.paid_amount === 0 ? row.old_paid_amount : row.paid_amount ?? 0;
            return{
                ...row,
                id: row.receiving_id,
                paid_amount: getPay.paid_amount,
                invoice_date: custType === 'CUSTOMER' ? moment(row.invoice_date).format('DD/MM/YYYY') : row.invoice_date,
                total: getPay.total,
                po_number: getPay.po_number,
                refNumber: row.invoice_number,
                type: 'Invoice',
                receivable: type == 0 ? (Number(row.total) - Number(paidAmount)).toFixed(2) : '',
                payable: type == 1 ? (Number(row.total) - Number(paidAmount)).toFixed(2) : '',
                paymentAmount: 0,
                adjustedAmount: type == 1 ? (Number(row.total) - Number(row.paid_amount)).toFixed(2) : '',
                originalRow: row,
            }
            });
        }

        const noteRows = Array.isArray(manualNoteSchemes)
            ? manualNoteSchemes.map((row) => {
                const selection = selectionModel.find(selection => row.id === selection.id)
                return{
                    id: row.id ?? row.sequence_number,
                    refNumber: row.sequence_number,
                    type: row.sequence_number ? type === 0 ? 'Credit Note' : 'Debit Note' : 'Unused Credit',
                    receivable: type == 1 ? Number(row.balance_amount).toFixed(2) : '',
                    payable: type == 0 ? Number(row.balance_amount).toFixed(2) : '',
                    adjustedAmount: type == 0 ? selection ? selection.adjustedAmount : Number(row.balance_amount).toFixed(2) : '',
                    paymentAmount: type == 1 ? Number(row.balance_amount).toFixed(2) : '',
                    originalRow: row,
                }
            })
            : [];

        const combinedRows = [...invoiceRows, ...noteRows];

        if (combinedRows.length === 0) {
            setRows([]);
            setSelectedIds([clickedInvoice]);
            setSelectionModel?.([]);
            setReceivableData?.([]);
            setinvoiceselect?.(false);
            setCreditNote?.(false);
            return;
        }
        setRows(combinedRows);

        if(!selectionModel.length){
            const selectedRowData = invoiceRows.filter((row) =>
                clickedInvoice === row.id
            );

            setSelectedIds([clickedInvoice]);
              
            setSelectionModel?.(selectedRowData.map((row) => {
                const updatedPaymentAmount =  0
                return{
                    ...row,
                    paymentAmount: updatedPaymentAmount,
                    adjustedAmount: row.adjustedAmount ? row.adjustedAmount : row.payable
                }
            }));

            if(setSummaryData){
                const updatedSummaryData = summaryData.map(summary => {
                    if(summary.paymentCreditNoteId === paymentId){
                        return { ...summary, sale_id: [clickedInvoice] }
                    }
                    else{
                        return { ...summary }
                    }
                })
                setSummaryData(updatedSummaryData)
            }
        }else{

        if (editData && editData?.invoice_number) {
            const matchedRow = combinedRows.find(
                (row) => row.refNumber === editData?.invoice_number
            );

            if (matchedRow) {
                setSelectedIds([matchedRow]);
                setSelectionModel?.([matchedRow]);
                setReceivableData?.([matchedRow]);
                setinvoiceselect?.(true);
                setCreditNote?.(true);
            }
        }

        // Handle default selection if approvals are present and user doesn't have rights
        if (getApprovalRights?.rights !== true && salesApprovals?.length > 0) {
            let parsedItems = [];

            try {
                parsedItems = JSON.parse(salesApprovals[0]?.receivable_items || '[]');
            } catch (e) {
                console.error('Failed to parse receivable_items:', e);
            }

            const defaultSelectedIds = combinedRows
                .filter((row) =>
                    parsedItems.some(
                        (item) => row.po_number?.trim() === item.invoice_number?.trim()
                    )
                )
                .map((row) => row.id);

            const selectedRowData = combinedRows.filter((row) =>
                defaultSelectedIds.includes(row.id)
            );

            setSelectedIds?.(...clickedInvoice,...defaultSelectedIds);
            setSelectionModel?.(defaultSelectedIds);
            setReceivableData?.(selectedRowData);
            setinvoiceselect?.(selectedRowData.length > 0);
            setCreditNote?.(defaultSelectedIds.length > 0);
            setManualNoteSchemes?.((prev) =>
                prev.map((m) => ({
                    ...m,
                    selected: defaultSelectedIds.includes(m.id),
                }))
            );
            handleSelectionModelChange?.(defaultSelectedIds); // Optional based on your second useEffect
        }
        if (selectionModel && Array.isArray(selectionModel)) {
            setSelectedIds(selectionModel.map((item) => item.id));
            if(setSummaryData){
                const updatedSummaryData = summaryData.map(summary => {
                    if(summary.paymentCreditNoteId === paymentId){
                        return { ...summary, sale_id: selectionModel.map((item) => item.id) }
                    }
                    else{
                        return { ...summary }
                    }
                })
                setSummaryData(updatedSummaryData)
            }
        }
    }
    }, [getPay?.length, manualNoteSchemes?.length, salesApprovals, getApprovalRights, customer]);


    const handleCheckboxChange = (event, row) => {
        let updatedSelected = [...selectedIds];
        if (!event.target.checked) {
            updatedSelected = updatedSelected.filter((id) => id !== row.id);
            const updatedSelectedCreditNotes = selectedCreditNotes.filter(id => id !== row.id)
            setSelectedCreditNotes(updatedSelectedCreditNotes)
            if(filterType === 'invoiceOnly'){
                if(setSummaryData){
                    const updatedSummaryData = summaryData.map(summary => {
                        if(summary.paymentCreditNoteId === paymentId){
                            return { ...summary, sale_id: summary.sale_id.filter(id => id !== row.id) }
                        }
                        else{
                            return { ...summary }
                        }
                    })
                    setSummaryData(updatedSummaryData)
                }
            }
        } else {
            const isSale = type === 0;

            if (row.type === 'Credit Note' || row.type === 'Unused Credit' || row.type === 'Debit Note') {
                if(filterType === 'creditNoteOnly'){
                    updatedSelected.push(row.id);
                    setSelectedCreditNotes((prev) => ([...prev, row.id]))
                    setSummaryData((prev) => ([ ...prev, {paymentCreditNoteId: row.id, sale_id: [], isCreditNote: true}]))
                }
                else{
                    const selectedRowData = rows.filter((r) => updatedSelected.includes(r.id));
                    const isAmountTallied = selectedRowData.some((item) => item.type === "Invoice") &&
                        selectedRowData.some((item) => item.type === "Credit Note") &&
                        selectedRowData.reduce((acc, item) => {
                            if (item.type === "Invoice") {
                                return acc + parseFloat(isSale ? item.receivable : item.payable || 0);
                            } else if (item.type === "Credit Note") {
                                return acc - parseFloat(isSale ? item.payable : item.receivable || 0);
                            }
                            return acc;
                        }, 0) === 0;
    
                    if (isAmountTallied) {
                        event.target.checked = false;
                        return;
                    }
    
                    const selectedInvoiceValue = rows
                        .filter((r) => updatedSelected.includes(r.id) && r.type === 'Invoice')
                        .reduce((sum, invoice) => sum + Number(isSale ? invoice.receivable : invoice.payable), 0);
    
                    if (isSale ? Number(row.payable) <= selectedInvoiceValue : Number(row.receivable) <= selectedInvoiceValue) {
                        updatedSelected.push(row.id);
                    } else {
                        event.target.checked = false;
                        return;
                    }
                }
            } else {
                if(setSummaryData){
                    const updatedSummaryData = summaryData.map(summary => {
                        if(summary.paymentCreditNoteId === paymentId){
                            return { ...summary, sale_id: [...summary.sale_id, row.id] }
                        }
                        else{
                            return { ...summary }
                        }
                    })
                    setSummaryData(updatedSummaryData)
                }
                updatedSelected.push(row.id);
            }
        }

        setSelectedIds(updatedSelected);

        const updatedRowData = rows.filter((r) => updatedSelected.includes(r.id));
        const updatedSelectionModel = updatedRowData.map((rows) => {
            const updatedPaymentAmount = rows.paymentAmount ? rows.paymentAmount : 0
            return { ...rows, paymentAmount: updatedPaymentAmount }
        })
        setSelectionModel?.(updatedSelectionModel);
        setReceivableData?.(updatedRowData);
        setinvoiceselect?.(updatedRowData.some(r => r.type === 'Invoice'));
        setCreditNote?.(updatedRowData.some(r => ['Credit Note', 'Unused Credit'].includes(r.type)));

        if (row.type === 'Credit Note' || row.type === 'Unused Credit' || row.type === 'Debit Note') {
            setManualNoteSchemes?.(prev =>
                Array.isArray(prev)
                    ? prev.map(m => {
                        const currentRow = updatedRowData.find(selection => m.id === selection.id)
                        return{
                            ...m,
                            selected: updatedSelected.includes(m.id),
                            new_adjusted_amount: currentRow ?  currentRow?.adjustedAmount !== "" ? Number(currentRow?.adjustedAmount) : m.balance_amount : m.balance_amount
                        }
                    })
                    : []
            );
        }
    };
    const isRowSelected = (id) => selectedIds.includes(id);

    const isCheckboxDisabled = (rowId) =>
        getApprovalRights?.rights !== true &&
        salesApprovals?.length > 0 &&
        !selectedIds.includes(rowId);

    const handlePaymentAmountChange = (e, rowId) => {
        const updatedRows = rows.map((row) => {
            if(row.id === rowId){
                if(Number(e.target.value) <= row.receivable){
                    return{
                        ...row,
                        paymentAmount: e.target.value,
                        paymentAmountError: null
                    }
                }
                else{
                    return{
                        ...row,
                        paymentAmount: e.target.value,
                        paymentAmountError: 'Payment Amount is greater than Due Amount'
                    }
                }
            }
            else{
                return { ...row }
            }
        })
        const updatedSelectionModel = selectionModel.map((row) => {
            if(row.id === rowId){
                if(Number(e.target.value) <= row.receivable){
                    return{
                        ...row,
                        paymentAmount: e.target.value,
                        paymentAmountError: null
                    }
                }
                else{
                    return{
                        ...row,
                        paymentAmount: e.target.value,
                        paymentAmountError: 'Payment Amount is greater than Due Amount'
                    }
                }
            }
            else{
                return { ...row }
            }
        })
        setRows(updatedRows)
        setSelectionModel(updatedSelectionModel)
    }

    const handleAdjustedAmount = (e, rowId) => {
        const updatedRows = rows.map((row) => {
            if(row.id === rowId){
                if(Number(e.target.value) <= row.payable){
                    return{
                        ...row,
                        adjustedAmount: e.target.value,
                        adjustedAmountError: null
                    }
                }
                else{
                    return{
                        ...row,
                        adjustedAmount: e.target.value,
                        adjustedAmountError: 'Adjusted Amount is greater than Payable Amount'
                    }
                }
            }
            else{
                return { ...row }
            }
        })
        const updatedSelectionModel = selectionModel.map((row) => {
            if(row.id === rowId){
                if(Number(e.target.value) <= row.payable){
                    return{
                        ...row,
                        adjustedAmount: e.target.value,
                        adjustedAmountError: null
                    }
                }
                else{
                    return{
                        ...row,
                        adjustedAmount: e.target.value,
                        adjustedAmountError: 'Adjusted Amount is greater than Payable Amount'
                    }
                }
            }
            else{
                return { ...row }
            }
        })
        setRows(updatedRows)
        setSelectionModel(updatedSelectionModel)
        const updatedManualNoteSchemes = manualNoteSchemes.map((scheme) => {
            if(scheme.id === rowId){
                return{
                    ...scheme,
                    new_adjusted_amount: Number(e.target.value)
                }
            }
            else{
                return{ ...scheme }
            }
        })
        setManualNoteSchemes(updatedManualNoteSchemes);
    }

    return (
        <TableContainer component={Paper} sx={{ mt: 1, minHeight: '460px', maxHeight: '460px', overflow: 'auto' }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell padding="checkbox" />
                        {
                            filterType !== 'creditNoteOnly' &&
                            <TableCell>Invoice Date</TableCell>
                        }
                        <TableCell>Ref Number</TableCell>
                        <TableCell>Type</TableCell>
                        {
                            filterType === 'invoiceOnly' &&
                            <TableCell>Total</TableCell>
                        }
                        <TableCell>{filterType === 'invoiceOnly' ? 'Due Amount' : 'Receivable'}</TableCell>
                        {
                            filterType !== 'invoiceOnly' &&
                            <TableCell>Payable</TableCell>
                        }
                        {
                            filterType === 'invoiceOnly' &&
                            <TableCell>Payment Amount</TableCell>
                        }
                        {
                            filterType === 'creditNoteOnly' &&
                            <TableCell>Adjustment</TableCell>
                        }
                    </TableRow>
                </TableHead>

                <TableBody>
                    {rows.filter(r => filterType === 'creditNoteOnly' ? ['Credit Note', 'Unused Credit'].includes(r.type) : filterType === 'invoiceOnly' ? r.type === 'Invoice' : true).map((row) => (
                        <TableRow key={row.id} hover selected={!advanceAmount && isRowSelected(row.id)}>

                            <TableCell padding="checkbox">
                                <Checkbox
                                    checked={filterType === 'creditNoteOnly' ? selectedCreditNotes.includes(row.id) : isRowSelected(row.id)}
                                    onChange={(e) => handleCheckboxChange(e, row)}
                                    disabled={isCheckboxDisabled(row.id) || (filterType === 'creditNoteOnly' && (isPaymentSelected || selectionModel.filter(s => ['Credit Note', 'Unused Credit'].includes(s.type)).length > 0) && !selectedCreditNotes.includes(row.id))}
                                />
                            </TableCell>
                            {
                                filterType !== 'creditNoteOnly' &&
                                <TableCell>{row.invoice_date}</TableCell>
                            }
                            <TableCell>{row.refNumber}</TableCell>
                            <TableCell>{row.type}</TableCell>
                            {
                                filterType === 'invoiceOnly' &&
                                <TableCell>{row.total}</TableCell>
                            }
                            <TableCell>{row.receivable}</TableCell>
                            {
                                filterType !== 'invoiceOnly' &&
                                <TableCell>{row.payable}</TableCell>
                            }
                            {
                                filterType === 'invoiceOnly' &&
                                <TableCell>
                                    {
                                        selectedIds.includes(row.id) ? 
                                            <TextField
                                                value={row.paymentAmount}
                                                onChange={e => handlePaymentAmountChange(e, row.id)}
                                                type='number'
                                                onKeyDown={(e) => {
                                                    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', '.']
                                                
                                                    if (['e', 'E', '+', '-'].includes(e.key) || (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key))) {
                                                        e.preventDefault()
                                                    }
                                                }}
                                                onWheel={e => e.target.blur()}
                                                error={row.paymentAmountError}
                                                helperText={row?.paymentAmountError || ''}
                                            />
                                        : ''
                                    }
                                </TableCell>
                            }
                            {
                                filterType === 'creditNoteOnly' &&
                                <TableCell>
                                    {
                                        selectedCreditNotes.includes(row.id) ? 
                                            <TextField
                                                value={row.adjustedAmount || ''}
                                                onChange={e => handleAdjustedAmount(e, row.id)}
                                                type='number'
                                                onKeyDown={(e) => {
                                                    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', '.']
                                                
                                                    if (['e', 'E', '+', '-'].includes(e.key) || (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key))) {
                                                        e.preventDefault()
                                                    }
                                                }}
                                                onWheel={e => e.target.blur()}
                                                error={row.adjustedAmountError}
                                                helperText={row?.adjustedAmountError || ''}
                                            />
                                        : ''
                                    }
                                </TableCell>
                            }
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {rows.length === 0 && (
                <Typography textAlign="center" sx={{ py: 2 }}>
                    No data available
                </Typography>
            )}
        </TableContainer>


    );
}
