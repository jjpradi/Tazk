import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { Autocomplete, Button, Dialog, DialogContent, DialogTitle, Grid, IconButton, TextField } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import CreateNewButtonContext from "context/CreateNewButtonContext";
import _ from "lodash";
import moment from "moment";
import PropTypes from "prop-types";
import { useContext, useState } from "react";
import toMomentOrNull from '../../../utils/DateFixer'

function ReceiptPaymentFilter(props) {

    const rangeOptions = ['Weekly', 'Monthly', 'Quarterly', 'Half-Yearly', 'Yearly']
    const { headerLocationId } = useContext(CreateNewButtonContext)

    const [filterValues, setFilterValues] = useState({
        selectRange: null,
        fromDate: null,
        toDate: null,
        location: headerLocationId !== 'null' ? _.uniqBy(props.stockLocation, 'location_name').filter(d => d.location_id === headerLocationId) : null,
        paymentMode: null,
        minValue: null,
        maxValue: null,
    })

    const [filterErrors, setFilterErrors] = useState({
        fromDate: null,
        toDate: null
    })

    const handleDateChange = (event, name) => {
        if(event === null){
            setFilterValues((prev) => ({...prev, [name]: null}))
            setFilterErrors((prev) => ({...prev, [name]: `Audit Date is Required`}))
        }
        else if(!event?._isValid){
            setFilterValues((prev) => ({...prev, [name]: null}))
            setFilterErrors((prev) => ({...prev, [name]: `Audit Date is Invalid`}))
        }
        else{
            setFilterValues((prev) => ({...prev, [name]: moment(event._d).format('YYYY-MM-DD')}))
            setFilterErrors((prev) => ({...prev, [name]: null}))
        }
    }

    // Fiscal year starts April 1
    const getFiscalYear = (offset = 0) => {
        const now = moment()
        const fy = now.month() >= 3 ? now.year() + offset : now.year() - 1 + offset
        return { from: moment(`${fy}-04-01`), to: moment(`${fy + 1}-03-31`) }
    }

    const handleChange = (name, value) => {
        setFilterValues((prev) => ({ ...prev, [name]: value }))
        if(name === 'selectRange'){
            let fromDate = moment().startOf('month')
            let toDate = moment().endOf('month')

            switch(value) {
                case 'Today': fromDate = moment(); toDate = moment(); break;
                case 'Yesterday': fromDate = moment().subtract(1, 'day'); toDate = moment().subtract(1, 'day'); break;
                case 'This Week': fromDate = moment().startOf('week'); toDate = moment().endOf('week'); break;
                case 'Last Week': fromDate = moment().subtract(1, 'week').startOf('week'); toDate = moment().subtract(1, 'week').endOf('week'); break;
                case 'Last 7 Days': fromDate = moment().subtract(6, 'days'); toDate = moment(); break;
                case 'Weekly': fromDate = moment().startOf('week'); toDate = moment().endOf('week'); break;
                case 'This Month': case 'Monthly': fromDate = moment().startOf('month'); toDate = moment().endOf('month'); break;
                case 'Last Month': fromDate = moment().subtract(1, 'month').startOf('month'); toDate = moment().subtract(1, 'month').endOf('month'); break;
                case 'This Quarter': case 'Quarterly': fromDate = moment().startOf('quarter'); toDate = moment().endOf('quarter'); break;
                case 'Last Quarter': fromDate = moment().subtract(1, 'quarter').startOf('quarter'); toDate = moment().subtract(1, 'quarter').endOf('quarter'); break;
                case 'Half-Yearly': fromDate = moment().subtract(5, 'months').startOf('month'); toDate = moment().endOf('month'); break;
                case 'Current Fiscal Year': { const fy = getFiscalYear(0); fromDate = fy.from; toDate = fy.to; break; }
                case 'Previous Fiscal Year': { const fy = getFiscalYear(-1); fromDate = fy.from; toDate = fy.to; break; }
                case 'Last 365 Days': case 'Yearly': fromDate = moment().subtract(364, 'days'); toDate = moment(); break;
                default: break;
            }

            setFilterValues((prev) => ({ ...prev, [name]: value, fromDate: moment(fromDate).format('YYYY-MM-DD'), toDate: moment(toDate).format('YYYY-MM-DD') }))
        }
    }

    const handleClear = () => {
        setFilterValues((prev) => ({
            ...prev,
            selectRange: null,
            fromDate: null,
            toDate: null,
            location: headerLocationId ? _.uniqBy(props.stockLocation, 'location_name').filter(d => d.location_id === headerLocationId) : null,
            paymentMode: null,
            minValue: null,
            maxValue: null
        }))
        const filter = {
            from: null,
            to: null,
            location_id: headerLocationId,
            payment_type: null,
            min_price: null,
            max_price: null
        }
        props.handleApply(filter)
    }

    const handleApply = () => {
        const filter = {
            from: filterValues.fromDate,
            to: filterValues.toDate,
            location_id: filterValues.location === null || filterValues.location.length === 0 ? null : filterValues.location.map(d => d.location_id),
            payment_type: filterValues.paymentMode === null || filterValues.paymentMode.length === 0 ? null : filterValues.paymentMode.map(d => d.payment_type),
            min_price: filterValues.minValue,
            max_price: filterValues.maxValue
        }
        props.handleApply(filter)
    }


   

    return (
        <Dialog open={props.open} onClose={() => props.handleClose()} maxWidth = 'xs' fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0 }}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>Filter</span>
                <IconButton size="small" onClick={() => props.handleClose()}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={3} sx={{ mt: 0.5 }}>
                    <Grid size={12}>
                        <Autocomplete
                            value = {filterValues.selectRange}
                            onChange = {(event, newValue) => handleChange('selectRange', newValue)}
                            options = {rangeOptions}
                            fullWidth
                            renderInput = {(params) => (
                                <TextField
                                    { ...params }
                                    label = 'Select Range'
                                    variant = 'filled'
                                />
                            )}
                        />
                    </Grid>
                    
                    <Grid size={12}>
                        <LocalizationProvider dateAdapter={DateAdapter}>
                            <DatePicker 
                                label = 'From Date'
                                value = {toMomentOrNull(filterValues.fromDate)}
                                format='DD/MM/YYYY'
                                onChange = {(event) => handleDateChange(event, 'fromDate')}
                                // onChange={(date) =>
                                //     props.handleChange({
                                //       target: {value: date, name: 'to'},
                                //     })
                                //   }
                                views={['year', 'month', 'day']}
                                slotProps={{ textField: { fullWidth: true, variant: 'filled', error: filterErrors.fromDate !== null, helperText: filterErrors.fromDate } }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    
                    <Grid size={12}>
                        <LocalizationProvider dateAdapter={DateAdapter}>
                            <DatePicker 
                                label = 'To Date'
                                format='DD/MM/YYYY'
                                value = {toMomentOrNull(filterValues.toDate)}
                                onChange = {(event) => handleDateChange(event, 'toDate')}
                                views={['year', 'month', 'day']}
                                slotProps={{ textField: { fullWidth: true, variant: 'filled', error: filterErrors.toDate !== null, helperText: filterErrors.toDate } }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    
                    <Grid size={12}>
                        <Autocomplete
                            multiple
                            value = {filterValues.location ?? []}
                            onChange = {(event, newValue) => handleChange('location', newValue)}
                            options = {_.uniqBy(props.stockLocation, 'location_name')}
                            getOptionLabel = {(option) => option?.location_name ?? ''}
                            fullWidth
                            renderInput = {(params) => (
                                <TextField
                                    { ...params }
                                    label = 'Location'
                                    variant = 'filled'
                                />
                            )}
                        />
                    </Grid>

                    <Grid size={12}>
                        <Autocomplete
                            multiple
                            value = {filterValues.paymentMode ?? []}
                            onChange = {(event, newValue) => handleChange('paymentMode', newValue)}
                            options = {_.uniqBy(props.listPaymentType, 'payment_type')}
                            getOptionLabel = {(option) => option?.payment_type ?? ''}
                            fullWidth
                            renderInput = {(params) => (
                                <TextField
                                    { ...params }
                                    label = 'Payment Mode'
                                    variant = 'filled'
                                />
                            )}
                        />
                    </Grid>
                    
                    <Grid size={6}>
                        <TextField
                            label = 'Min Value'
                            value = {filterValues.minValue || ''}
                            onChange = {(event) => handleChange('minValue', event.target.value)}
                            variant = 'filled'
                            fullWidth
                        />
                    </Grid>
                    
                    <Grid size={6}>
                        <TextField
                            label = 'Max Value'
                            value = {filterValues.maxValue || ''}
                            onChange = {(event) => handleChange('maxValue', event.target.value)}
                            variant = 'filled'
                            fullWidth
                        />
                    </Grid>
                    
                    <Grid size={12}>
                        <Grid container spacing={3} display='flex' justifyContent='center'>
                            <Grid>
                                <Button
                                    variant = 'contained'
                                    color = 'error'
                                    onClick = {() => handleClear()}
                                >
                                    Clear
                                </Button>
                            </Grid>

                            <Grid>
                                <Button
                                    variant = 'contained'
                                    onClick = {() => handleApply()}
                                >
                                    Apply
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
}

ReceiptPaymentFilter.propTypes = {
    open: PropTypes.bool,
    handleApply: PropTypes.func,
    handleClear: PropTypes.func,
    handleClose: PropTypes.func,
    stockLocation: PropTypes.array,
    listPaymentType: PropTypes.array,
}

export default ReceiptPaymentFilter