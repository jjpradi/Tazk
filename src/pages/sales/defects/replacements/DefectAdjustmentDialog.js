import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material"
import CloseIcon from '@mui/icons-material/Close'
import PropTypes from "prop-types"
import { useSelector } from "react-redux"
import { useEffect, useState } from "react"

function DefectAdjustmentDialog(props){

    const {
        defectReducers: { defectByCustomerVendor, replacementItemsByReplacementId }
    } = useSelector(state => state)

    const [defects, setDefects] = useState([])

    useEffect(() => {
        const selectedSendDefects = [...new Set(props.rowData.adjustedDefect.map(d => d.send_id))]
        const tempDefects = defectByCustomerVendor
        if(props.formStatus === 'edit'){
            replacementItemsByReplacementId.defectData.forEach(item => {
                if(tempDefects.some(d => d.send_id === item.send_id)){
                    const selectedDefect = tempDefects.find(d => d.send_id === item.send_id)
                    const selectedDefectIndex = tempDefects.findIndex(d => d.send_id === item.send_id)
                    const updatedData = {
                        ...selectedDefect,
                        lot_number: item.lot_number.concat(`, ${selectedDefect.lot_number}`),
                        quantity: item.quantity + item.lot_number.split(',').length,
                        adjustingQuantityError: '',
                    }
                    tempDefects[selectedDefectIndex] = updatedData
                }
                else{
                    tempDefects.push({
                        ...item,
                        adjustingQuantityError: '',
                        isChecked: true,
                        quantity: item.quantity + item.lot_number.split(',').length,
                    })
                }
            })
        }

        const updatedDefects = tempDefects.map((row) => {
            if(selectedSendDefects.includes(row.send_id)){
                const selectedDefect = props.rowData.adjustedDefect.find(d => d.send_id === row.send_id)
                return {
                    ...row,
                    adjustingQuantity: selectedDefect.adjustingQuantity,
                    adjustingQuantityError: '',
                    isChecked: true
                }
            }
            else{
                return {
                    ...row,
                    adjustingQuantity: '',
                    adjustingQuantityError: '',
                    isChecked: false
                }
            }
        })
        
        setDefects(updatedDefects)
    }, [defectByCustomerVendor])

    const handleChangeTableRow = (key, value, index, send_id) => {
        const updatedDefects = defects.map((row, i) => {
            if(i === index){
                let adjustingQuantityError = ''
                if(key === 'adjustingQuantity'){
                    const previousAdjusted = props.replacementItems
                        .filter(d => d.line !== props.rowData.line)
                        .reduce((sum1, list1) => 
                            sum1 + list1.adjustedDefect
                            .filter(d => d.send_id === send_id)
                            .reduce((sum, d) => sum + (Number(d.adjustingQuantity) || 0), 0)
                        , 0)
                    const quantityValue = value === '' ? '' : Number(value)
                    if(quantityValue === ''){
                        adjustingQuantityError = 'Adjusting Quantity is Required!'
                    }
                    else if(parseInt(quantityValue) > row.quantity){
                        adjustingQuantityError = 'Adjusting Quantity cannot be greater than actual quantity!'
                    }
                    else if((previousAdjusted + parseInt(quantityValue)) > row.quantity){
                        adjustingQuantityError = 'Total Adjusting Quantity cannot be greater than actual quantity!'
                    }
                    else{
                        adjustingQuantityError = ''
                    }
                    return {
                        ...row,
                        [key]: quantityValue,
                        adjustingQuantityError: adjustingQuantityError
                    }
                }
                else if(key === 'isChecked'){
                    return {
                        ...row,
                        [key]: value,
                        adjustingQuantity: Number(props.rowData.quantity) > row.quantity ? row.quantity : Number(props.rowData.quantity)
                    }
                }
            }
            else{
                return row
            }
        })
        setDefects(updatedDefects)
    }

    const handleAdjustmentSubmit = () => {
        const selectedDefects = defects.filter(d => d.isChecked === true)
        props.handleAdjustmentSubmit(selectedDefects)
    }

    const isRowDisabled = (item) => {
        const totalReceipt = Number(props.rowData.quantity) || 0;

        // total previously adjusted for this send_id from props (excluding current row item)
        // const previousAdjusted = props.rowData.adjustedDefect
        //     .filter(d => d.send_id === item.send_id)
        //     .reduce((sum, d) => sum + (Number(d.adjustingQuantity) || 0), 0);

        const previousAdjusted = props.replacementItems
                                .reduce((sum1, list1) => 
                                    sum1 + list1.adjustedDefect
                                    .filter(d => d.send_id === item.send_id)
                                    .reduce((sum, d) => sum + (Number(d.adjustingQuantity) || 0), 0)
                                , 0)

        // include current table state (defects) if needed
        const currentAdjusted = defects
            .filter(d => d.send_id === item.send_id && d.isChecked)
            .reduce((sum, d) => sum + (Number(d.adjustingQuantity) || 0), 0);

        const totalAdjusted = previousAdjusted + currentAdjusted;

        const hasAnySelected =
            // props.rowData.adjustedDefect.some(d => d.send_id === item.send_id && d.isChecked) ||
            props.replacementItems.some(d => d.adjustedDefect.some(e => e.send_id === item.send_id && e.isChecked)) ||
            defects.some(d => d.send_id === item.send_id && d.isChecked);


        return (
            hasAnySelected &&
            totalAdjusted >= totalReceipt &&
            !item.isChecked
        );
    };

    return (
        <Dialog maxWidth='lg' fullWidth open={props.defectAdjustmentDialog} onClose={() => props.handleDefectAdjustmentOpen(null, false)}>
            <DialogTitle>
                <Grid container spacing={3} display='flex' justifyContent='space-between' alignItems='center'>
                    <Grid>
                        <Typography variant='h6'>Defect Adjustment</Typography>
                    </Grid>

                    <Grid>
                        <IconButton onClick={() => props.handleDefectAdjustmentOpen(null, false)}>
                            <CloseIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            </DialogTitle>
            <DialogContent>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell>Send Defect #</TableCell>
                            <TableCell>Qty</TableCell>
                            <TableCell>Lot Number</TableCell>
                            <TableCell>Adjusting Quantity</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {
                            defects.map((item, i) => (
                                <TableRow>
                                    <TableCell>
                                        <Checkbox
                                            checked={item.isChecked}
                                            onChange={(event) => handleChangeTableRow('isChecked', !item.isChecked, i, item.send_id)}
                                            disabled={isRowDisabled(item, i)}
                                        />
                                    </TableCell>

                                    <TableCell>{item.send_defect_number}</TableCell>

                                    <TableCell>{item.quantity}</TableCell>

                                    <TableCell>{item.lot_number}</TableCell>

                                    <TableCell>
                                        {
                                            item.isChecked ?
                                                <TextField
                                                    name={`adjustingQuantity${i}`}
                                                    variant='standard'
                                                    value={item.adjustingQuantity}
                                                    onChange={(event) => handleChangeTableRow('adjustingQuantity', event.target.value, i, item.send_id)}
                                                    error={item.adjustingQuantityError !== ''}
                                                    helperText={item.adjustingQuantityError}
                                                />
                                            : ''
                                        }
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </DialogContent>
            <DialogActions>
                <Grid container spacing={3} display='flex' justifyContent='flex-end'>
                    <Grid>
                        <Button
                            variant='contained'
                            color='error'
                            onClick={() => props.handleDefectAdjustmentOpen(null, false)}
                        >
                            Cancel
                        </Button>
                    </Grid>

                    <Grid>
                        <Button
                            variant='contained'
                            disabled={defects.filter(d => d.isChecked === true).some(d => d.adjustingQuantity === '' || d.adjustingQuantityError !== '') || defects.filter(d => d.isChecked === true).length === 0}
                            onClick={handleAdjustmentSubmit}
                        >
                            Submit
                        </Button>
                    </Grid>
                </Grid>
            </DialogActions>
        </Dialog>
    );
}

DefectAdjustmentDialog.propTypes={
    DefectAdjustmentDialog: PropTypes.bool,
    handleDefectAdjustmentOpen: PropTypes.func,
    handleAdjustmentSubmit: PropTypes.func,
    replacementItems: PropTypes.array,
    rowData: PropTypes.object
}

export default DefectAdjustmentDialog