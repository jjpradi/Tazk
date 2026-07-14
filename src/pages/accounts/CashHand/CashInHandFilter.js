import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment as DateAdapter } from '@mui/x-date-pickers/AdapterMoment'
import { Autocomplete, Button, Dialog, DialogContent, DialogTitle, Grid, IconButton, InputAdornment, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import moment from 'moment'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import toMomentOrNull from '../../../utils/DateFixer'

// Cash-in-hand specific filter dialog. Owns its own draft state, emits backend-shaped
// filter on Apply/Clear. Native field names — no rename gymnastics in the parent.
function CashInHandFilter(props) {

    const rangeOptions = [
        'Today', 'Yesterday',
        'This Week', 'Last Week', 'Last 7 Days',
        'This Month', 'Last Month',
        'This Quarter', 'Last Quarter',
        'Current Fiscal Year', 'Previous Fiscal Year',
        'Last 365 Days',
    ]

    // Draft state — local to the dialog. Initialized from currentFilter so reopening
    // shows the values currently applied (no UX surprise).
    const [draft, setDraft] = useState({
        selectRange: null,
        from: null,
        to: null,
        min_amount: null,
        max_amount: null,
        accountChip: 'All',
    })

    const [errors, setErrors] = useState({ from: null, to: null })

    // Sync draft from currentFilter every time dialog opens
    useEffect(() => {
        if (props.open) {
            const cf = props.currentFilter || {}
            setDraft({
                selectRange: null,
                from: cf.from || null,
                to: cf.to || null,
                min_amount: cf.min_amount ?? null,
                max_amount: cf.max_amount ?? null,
                accountChip: props.currentAccountChip || 'All',
            })
            setErrors({ from: null, to: null })
        }
    }, [props.open, props.currentFilter, props.currentAccountChip])

    const handleDateChange = (event, name) => {
        if (event === null) {
            setDraft(prev => ({ ...prev, [name]: null, selectRange: null }))
            setErrors(prev => ({ ...prev, [name]: null }))
        }
        else if (!event?._isValid) {
            setDraft(prev => ({ ...prev, [name]: null, selectRange: null }))
            setErrors(prev => ({ ...prev, [name]: 'Invalid date' }))
        }
        else {
            setDraft(prev => ({ ...prev, [name]: moment(event._d).format('YYYY-MM-DD'), selectRange: null }))
            setErrors(prev => ({ ...prev, [name]: null }))
        }
    }

    // Fiscal year starts April 1
    const getFiscalYear = (offset = 0) => {
        const now = moment()
        const fy = now.month() >= 3 ? now.year() + offset : now.year() - 1 + offset
        return { from: moment(`${fy}-04-01`), to: moment(`${fy + 1}-03-31`) }
    }

    const handleRangeChange = (value) => {
        if (value === null) {
            setDraft(prev => ({ ...prev, selectRange: null }))
            return
        }
        let from = moment().startOf('month')
        let to = moment().endOf('month')

        switch (value) {
            case 'Today': from = moment(); to = moment(); break
            case 'Yesterday': from = moment().subtract(1, 'day'); to = moment().subtract(1, 'day'); break
            case 'This Week': from = moment().startOf('week'); to = moment().endOf('week'); break
            case 'Last Week': from = moment().subtract(1, 'week').startOf('week'); to = moment().subtract(1, 'week').endOf('week'); break
            case 'Last 7 Days': from = moment().subtract(6, 'days'); to = moment(); break
            case 'This Month': from = moment().startOf('month'); to = moment().endOf('month'); break
            case 'Last Month': from = moment().subtract(1, 'month').startOf('month'); to = moment().subtract(1, 'month').endOf('month'); break
            case 'This Quarter': from = moment().startOf('quarter'); to = moment().endOf('quarter'); break
            case 'Last Quarter': from = moment().subtract(1, 'quarter').startOf('quarter'); to = moment().subtract(1, 'quarter').endOf('quarter'); break
            case 'Current Fiscal Year': { const fy = getFiscalYear(0); from = fy.from; to = fy.to; break }
            case 'Previous Fiscal Year': { const fy = getFiscalYear(-1); from = fy.from; to = fy.to; break }
            case 'Last 365 Days': from = moment().subtract(364, 'days'); to = moment(); break
            default: break
        }

        setDraft(prev => ({
            ...prev,
            selectRange: value,
            from: from.format('YYYY-MM-DD'),
            to: to.format('YYYY-MM-DD'),
        }))
        setErrors({ from: null, to: null })
    }

    const handleAmountChange = (name, raw) => {
        // Allow empty + non-negative numbers only
        if (raw === '' || raw === null || raw === undefined) {
            setDraft(prev => ({ ...prev, [name]: null }))
            return
        }
        const num = Number(raw)
        if (Number.isNaN(num) || num < 0) return
        setDraft(prev => ({ ...prev, [name]: raw }))
    }

    const buildEmitPayload = (overrides = {}) => ({
        from: draft.from,
        to: draft.to,
        min_amount: draft.min_amount === '' || draft.min_amount === null ? null : Number(draft.min_amount),
        max_amount: draft.max_amount === '' || draft.max_amount === null ? null : Number(draft.max_amount),
        accountChip: draft.accountChip || 'All',
        ...overrides,
    })

    const handleClear = () => {
        setDraft({
            selectRange: null,
            from: null,
            to: null,
            min_amount: null,
            max_amount: null,
            accountChip: 'All',
        })
        setErrors({ from: null, to: null })
        // Clearing emits today→today (matches the page's default initial filter)
        const today = moment().format('YYYY-MM-DD')
        props.onClear({
            from: today,
            to: today,
            min_amount: null,
            max_amount: null,
            accountChip: 'All',
        })
    }

    const handleApply = () => {
        // Date validity gate
        if (errors.from || errors.to) return
        if (draft.from && draft.to && moment(draft.from).isAfter(moment(draft.to))) {
            setErrors({ from: 'From date is after To date', to: 'From date is after To date' })
            return
        }
        // Amount range validity gate
        const minN = draft.min_amount === '' || draft.min_amount === null ? null : Number(draft.min_amount)
        const maxN = draft.max_amount === '' || draft.max_amount === null ? null : Number(draft.max_amount)
        if (minN !== null && maxN !== null && minN > maxN) {
            // Silently swap rather than error — friendlier for amount fields
            props.onApply(buildEmitPayload({ min_amount: maxN, max_amount: minN }))
            return
        }
        // Default to today if user cleared dates and clicked Apply
        const today = moment().format('YYYY-MM-DD')
        props.onApply(buildEmitPayload({
            from: draft.from || today,
            to: draft.to || today,
        }))
    }

    return (
        <Dialog open={props.open} onClose={props.onClose} maxWidth='xs' fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0 }}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>Filter Cash-in-Hand</span>
                <IconButton size='small' onClick={props.onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={3} sx={{ mt: 0.5 }}>
                    <Grid size={12}>
                        <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#666', mb: 0.5 }}>Account Type</Typography>
                        <ToggleButtonGroup
                            value={draft.accountChip}
                            exclusive
                            fullWidth
                            size='small'
                            onChange={(event, newValue) => {
                                // exclusive ToggleButtonGroup emits null when user re-clicks the active button —
                                // ignore that to keep at least one option selected.
                                if (newValue !== null) setDraft(prev => ({ ...prev, accountChip: newValue }))
                            }}
                        >
                            <ToggleButton value='All'>All</ToggleButton>
                            <ToggleButton value='Cash'>Cash</ToggleButton>
                            <ToggleButton value='Bank'>Bank</ToggleButton>
                        </ToggleButtonGroup>
                    </Grid>

                    <Grid size={12}>
                        <Autocomplete
                            value={draft.selectRange}
                            onChange={(event, newValue) => handleRangeChange(newValue)}
                            options={rangeOptions}
                            fullWidth
                            renderInput={(params) => (
                                <TextField {...params} label='Quick Range' variant='filled' />
                            )}
                        />
                    </Grid>

                    <Grid size={6}>
                        <LocalizationProvider dateAdapter={DateAdapter}>
                            <DatePicker
                                label='From Date'
                                value={toMomentOrNull(draft.from)}
                                format='DD/MM/YYYY'
                                onChange={(event) => handleDateChange(event, 'from')}
                                views={['year', 'month', 'day']}
                                slotProps={{ textField: { fullWidth: true, variant: 'filled', error: errors.from !== null, helperText: errors.from } }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid size={6}>
                        <LocalizationProvider dateAdapter={DateAdapter}>
                            <DatePicker
                                label='To Date'
                                format='DD/MM/YYYY'
                                value={toMomentOrNull(draft.to)}
                                onChange={(event) => handleDateChange(event, 'to')}
                                views={['year', 'month', 'day']}
                                slotProps={{ textField: { fullWidth: true, variant: 'filled', error: errors.to !== null, helperText: errors.to } }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid size={6}>
                        <TextField
                            label='Min Amount'
                            type='number'
                            value={draft.min_amount ?? ''}
                            onChange={(event) => handleAmountChange('min_amount', event.target.value)}
                            variant='filled'
                            fullWidth
                            slotProps={{ input: { startAdornment: <InputAdornment position='start'>₹</InputAdornment> } }}
                        />
                    </Grid>

                    <Grid size={6}>
                        <TextField
                            label='Max Amount'
                            type='number'
                            value={draft.max_amount ?? ''}
                            onChange={(event) => handleAmountChange('max_amount', event.target.value)}
                            variant='filled'
                            fullWidth
                            slotProps={{ input: { startAdornment: <InputAdornment position='start'>₹</InputAdornment> } }}
                        />
                    </Grid>

                    <Grid size={12}>
                        <Grid container spacing={3} display='flex' justifyContent='center'>
                            <Grid>
                                <Button variant='contained' color='error' onClick={handleClear}>
                                    Clear
                                </Button>
                            </Grid>
                            <Grid>
                                <Button variant='contained' onClick={handleApply}>
                                    Apply
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    )
}

CashInHandFilter.propTypes = {
    open: PropTypes.bool,
    currentFilter: PropTypes.object,
    currentAccountChip: PropTypes.string,
    onApply: PropTypes.func,
    onClear: PropTypes.func,
    onClose: PropTypes.func,
}

export default CashInHandFilter
