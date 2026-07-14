import { Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material"
import moment from "moment"
import PropTypes from "prop-types"
import { useEffect, useState } from "react"

function Advances(props){

    const [selectedAdvance, setSelectedAdvance] = useState([])
    const [customerVendorAdvance, setCustomerVendorAdvance] = useState([])

    useEffect(() => {
        if(props.advance.length > 0){
            setCustomerVendorAdvance(props.advance.map((d => ({ ...d, paymentAmount: d?.paymentAmount ?? '' }))))
        }

        const tempSelected = []
        const tempSelectedId = []
        if(props.entryType === 'edit' || props.type === 'CHEQUE_REPRESENT'){
            props.advance.forEach(d => {
                if(d.paymentAmount){
                    tempSelectedId.push(d.id)
                    tempSelected.push({ ...d })
                }
            })
            setSelectedAdvance(tempSelectedId)
            props.setSelectedAdvance(tempSelected)
        }
    }, [props.advance, props.entryType])

    const handleCheckboxSelection = (event, row) => {
        const checked = event.target.checked
        if(checked){
            const balanceAmount = row.balance_amount
            const paymentAmount = Math.min(balanceAmount, Number(props.totalRefund) - props.selectedAdvance.reduce((sum, list) => sum + Number(list?.paymentAmount ?? 0), 0))
            const updatedCustomerVendorAdvance = customerVendorAdvance.map((d) => {
                if(d.id === row.id){
                    return{
                        ...d,
                        paymentAmount: paymentAmount
                    }
                }
                else{
                    return d
                }
            })
            setCustomerVendorAdvance(updatedCustomerVendorAdvance)
            setSelectedAdvance((prev) => ([ ...prev, row.id ]))
            props.setSelectedAdvance((prev) => ([ ...prev, { ...row, paymentAmount: paymentAmount } ]))
        }
        else{
            const updatedCustomerVendorAdvance = customerVendorAdvance.map((d) => {
                if(d.id === row.id){
                    return{
                        ...d,
                        paymentAmount: 0
                    }
                }
                else{
                    return d
                }
            })
            setCustomerVendorAdvance(updatedCustomerVendorAdvance)
            setSelectedAdvance(prev => prev.filter(id => id !== row.id))
            props.setSelectedAdvance(prev => prev.filter(d => d.id !== row.id))
        }
    }

    const handlePaymentAmountChange = (value, id) => {
        const updatedCustomerVendorAdvance = customerVendorAdvance.map((row) => {
            if(row.id === id){
                return{
                    ...row,
                    paymentAmount: value
                }
            }
            else{
                return row
            }
        })
        setCustomerVendorAdvance(updatedCustomerVendorAdvance)
        
        if(props.selectedAdvance.some(row => row.id === id)){
            const updatedSelected = props.selectedAdvance.map((row) => {
                if(row.id === id){
                    return { ...row, paymentAmount: value }
                }
                else{
                    return row
                }
            })
            props.setSelectedAdvance(updatedSelected)
        }
        else{
            const currentRowData = customerVendorAdvance.find(row => row.id === id)
            props.setSelectedAdvance((prev) => ([ ...prev, { ...currentRowData, paymentAmount: value } ]))
        }
    }

    return(
        <TableContainer>
            <Typography variant='subtitle2' sx={{ p: 2, fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'text.secondary' }}>Advances</Typography>
            <Table>
                <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                        <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: 'text.secondary', py: 1.5 }}></TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: 'text.secondary', py: 1.5 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: 'text.secondary', py: 1.5 }}>Reference #</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: 'text.secondary', py: 1.5 }}>Total</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: 'text.secondary', py: 1.5 }}>Balance Amount</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: 'text.secondary', py: 1.5 }}>Payment Amount</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {
                        customerVendorAdvance.length > 0 ? 
                            customerVendorAdvance.map(row =>
                                <TableRow key={row.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked = {selectedAdvance.includes(row.id)}
                                            onChange = {(event) => handleCheckboxSelection(event, row)}
                                            disabled = {Number(props.totalRefund) <= props.selectedAdvance.reduce((sum, list) => sum + Number(list?.paymentAmount ?? 0), 0) && !selectedAdvance.includes(row.id)}
                                        />
                                    </TableCell>

                                    <TableCell>{moment(row.receipt_date).format('DD/MM/YYYY')}</TableCell>

                                    <TableCell>{row.receipt_number}</TableCell>

                                    <TableCell>{row.amount}</TableCell>

                                    <TableCell>{row.balance_amount}</TableCell>

                                    <TableCell>
                                        {
                                            selectedAdvance.includes(row.id) ?
                                                <TextField
                                                    variant = 'outlined'
                                                    value = {row.paymentAmount}
                                                    onChange = {e => {
                                                        const value = e.target.value
                                                        if (value === '' || (/^\d*\.?\d{0,2}$/).test(value)) {
                                                            handlePaymentAmountChange(value, row.id)
                                                        }
                                                    }}
                                                    error={Number(row.paymentAmount) > Number(row.balance_amount)}
                                                    helperText={Number(row.paymentAmount) > Number(row.balance_amount) ? 'Payment Amount is greater than Balance Amount' : ''}
                                                />
                                            : ''
                                        }
                                    </TableCell>
                                </TableRow>
                            )
                        : <TableRow>
                            <TableCell colSpan={6}>No Advances Available</TableCell>
                        </TableRow>
                    }
                </TableBody>
            </Table>
        </TableContainer>
    )
}

Advances.propTypes = {
    advance: PropTypes.array,
    selectedAdvance: PropTypes.array,
    setSelectedAdvance: PropTypes.func,
    totalRefund: PropTypes.string
}

export default Advances