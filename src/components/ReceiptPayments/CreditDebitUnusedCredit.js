import { Checkbox, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import moment from "moment";
import PropTypes from "prop-types";
import { useState, useEffect, useRef } from 'react';
import { useSelector } from "react-redux";

function CreditDebitUnusedCredit(props){

    const adjustedAmountRef = useRef({})
    const {
        salesReducer: { editReceiptData }
    } = useSelector(state => state)

    const [tableData, setTableData] = useState([])
    const [selected, setSelected] = useState([])
    const [renderEdit, setRenderEdit] = useState(true)

    useEffect(() => {
        const manualNotes = props.manualNoteSchemes.filter(f => Number(f.balance_amount) > 0).map((row) => {
            const selection = props.creditNotesAvailableCredit.find(cn => cn.id === (row.manual_notes_id ?? row.id ?? row.sequence_number))
            return {
                id: row.manual_notes_id ?? row.id ?? row.sequence_number,
                date: moment(row.date ?? row.receipt_date).format('DD/MM/YYYY'),
                refNumber: row.sequence_number ?? row.receipt_number,
                type: row.manual_notes_id ? props.custType === 'CUSTOMER' ? 'Credit Note' : 'Debit Note' : 'Unused Credit',
                receivable: props.custType === 'VENDOR' ? Number(row.balance_amount).toFixed(2) : 0.00,
                payable: props.custType === 'CUSTOMER' ? Number(row.balance_amount).toFixed(2) : 0.00,
                adjustedAmount: selection ? selection.adjustedAmount : Number(row.balance_amount).toFixed(2),
                originalRow: row
            }
        })
        setTableData(manualNotes)
        setSelected(props.creditNotesAvailableCredit.map(d => d.id))
    }, [props.manualNoteSchemes])

    useEffect(() => {
        if(props.entryType === 'edit' && Object.keys(editReceiptData).length > 0 && tableData.length > 0 && renderEdit){
            setRenderEdit(false)
            const creditDebitNoteData = editReceiptData.manualCredit
            const advanceUsed = editReceiptData.usedAdvance.filter(d => d.description === 'Advance Used' || d.description === 'Advance Paid Used')
            if(creditDebitNoteData.length > 0){
                const groupedNotes = creditDebitNoteData.reduce((acc, row) => {
                    const key = row.id ?? row.sequence_number
                    if (!acc[key]) {
                        acc[key] = { ...row, payment_amount: Number(row.payment_amount) || 0 }
                    } else {
                        acc[key].payment_amount = Number(acc[key].payment_amount || 0) + (Number(row.payment_amount) || 0)
                    }
                    return acc
                }, {})

                const selectedItems = []
                const selectedIds = []
                Object.values(groupedNotes).forEach((note) => {
                    const selectedData = tableData.find(d => d.id === note.id || d.refNumber === note.sequence_number)
                    if (selectedData) {
                        selectedData.adjustedAmount = Number(note.payment_amount || 0).toFixed(2)
                        selectedItems.push(selectedData)
                        selectedIds.push(selectedData.id)
                    }
                })

                setSelected((prev) => ([ ...new Set([ ...prev, ...selectedIds ]) ]))
                props.setCreditNotesAvailableCredit(selectedItems)
            }
            if(advanceUsed.length > 0){
                const groupedAdvance = advanceUsed.reduce((acc, row) => {
                    const key = row.advance_id
                    if (!acc[key]) {
                        acc[key] = { ...row, payment_amount: Number(row.payment_amount) || 0 }
                    } else {
                        acc[key].payment_amount = Number(acc[key].payment_amount || 0) + (Number(row.payment_amount) || 0)
                    }
                    return acc
                }, {})

                const selectedItems = []
                const selectedIds = []
                Object.values(groupedAdvance).forEach((adv) => {
                    const selectedData = tableData.find(d => d.id === adv.advance_id)
                    if (!selectedData) return
                    selectedData.adjustedAmount = Number(adv.payment_amount || 0).toFixed(2)
                    if(props.custType === 'CUSTOMER'){
                        selectedData.payable = Number(selectedData.payable) + Number(adv.payment_amount || 0)
                    }
                    else{
                        selectedData.receivable = Number(selectedData.receivable) + Number(adv.payment_amount || 0)
                    }
                    selectedItems.push(selectedData)
                    selectedIds.push(adv.advance_id)
                })

                setSelected((prev) => ([ ...new Set([ ...prev, ...selectedIds ]) ]))
                props.setCreditNotesAvailableCredit((prev) => ([...prev, ...selectedItems]))
            }
        }
    }, [props.entryType, editReceiptData, tableData])

    const handleCheckboxSelection = (event, row) => {
        const checked = event.target.checked

        if(checked){
            setSelected((prev) => ([...prev, row.id]))
            props.setCreditNotesAvailableCredit((prev) => ([...prev, row]))
            const updatedManualNoteSchemes = props.manualNoteSchemes.map((scheme) => {
            if((scheme.manual_notes_id ?? scheme.id) === row.id){
                    return{
                        ...scheme,
                        selected: true,
                    }
                }
                else{
                    return{ ...scheme }
                }
            })
            props.setManualNoteSchemes(updatedManualNoteSchemes);
            adjustedAmountRef.current[row.id]?.focus()
        }
        else{
            setSelected(selected.filter(id => id !== row.id))
            props.setCreditNotesAvailableCredit(props.creditNotesAvailableCredit.filter(d => d.id !== row.id))
            const updatedManualNoteSchemes = props.manualNoteSchemes.map((scheme) => {
            if((scheme.manual_notes_id ?? scheme.id) === row.id){
                    return{
                        ...scheme,
                        selected: false,
                    }
                }
                else{
                    return{ ...scheme }
                }
            })
            props.setManualNoteSchemes(updatedManualNoteSchemes);
        }
    }

    const handleAdjustedAmount = (e, rowId) => {
        const updatedRows = tableData.map((row) => {
            if(row.id === rowId){
                return{
                    ...row,
                    adjustedAmount: e.target.value
                }
            }
            else{
                return { ...row }
            }
        })
        setTableData(updatedRows)

        const updatedSelectionModel = props.creditNotesAvailableCredit.map((row) => {
            if(row.id === rowId){
                return{
                    ...row,
                    adjustedAmount: e.target.value,
                }
            }
            else{
                return { ...row }
            }
        })
        props.setCreditNotesAvailableCredit(updatedSelectionModel)

        const updatedManualNoteSchemes = props.manualNoteSchemes.map((scheme) => {
            if((scheme.manual_notes_id ?? scheme.id) === rowId){
                return{
                    ...scheme,
                    adjustedAmount: Number(e.target.value) || 0,
                    new_adjusted_amount: Number(e.target.value) || 0
                }
            }
            else{
                return{ ...scheme }
            }
        })
        props.setManualNoteSchemes(updatedManualNoteSchemes);
    }

    return(
        <TableContainer component={Paper} elevation={0}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                            <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: 'text.secondary', py: 1.5 }}></TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: 'text.secondary', py: 1.5 }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: 'text.secondary', py: 1.5 }}>#</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: 'text.secondary', py: 1.5 }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: 'text.secondary', py: 1.5 }}>{props.custType === 'CUSTOMER' ? 'Payable' : 'Receivable'}</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: 'text.secondary', py: 1.5 }}>Adjustment</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {
                            tableData.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked = {selected.includes(row.id)}
                                            disabled = {props.paymentSelected}
                                            onChange = {(event) => handleCheckboxSelection(event, row)}
                                        />
                                    </TableCell>

                                    <TableCell>{row.date}</TableCell>

                                    <TableCell>{row.refNumber}</TableCell>
                                    
                                    <TableCell>{row.type}</TableCell>

                                    <TableCell>{props.custType === 'CUSTOMER' ? row.payable : row.receivable}</TableCell>

                                    <TableCell>
                                        {
                                            selected.includes(row.id) ? 
                                            <TextField
                                                inputRef={(el) => (adjustedAmountRef.current[row.id] = el)}
                                                value={row.adjustedAmount || ''}
                                                onChange={e => {
                                                    const value = e.target.value
                                                    if (value === '' || (/^\d*\.?\d{0,2}$/).test(value)) {
                                                        handleAdjustedAmount(e, row.id)
                                                    }
                                                }}
                                                error={Number(row.adjustedAmount) > Number(props.custType === 'CUSTOMER' ? row.payable : row.receivable)}
                                                helperText={Number(row.adjustedAmount) > Number(props.custType === 'CUSTOMER' ? row.payable : row.receivable) ? 'Adjusted Amount is greater than Payable Amount' : ''}
                                            />
                                            : ''
                                        }
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
    )
}

CreditDebitUnusedCredit.propTypes = {
    manualNoteSchemes: PropTypes.array,
    setManualNoteSchemes: PropTypes.func,
    creditNotesAvailableCredit: PropTypes.array,
    setCreditNotesAvailableCredit: PropTypes.func,
    paymentSelected: PropTypes.bool,
    custType: PropTypes.string,
    entryType: PropTypes.string
}

export default CreditDebitUnusedCredit
