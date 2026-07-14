import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography } from "@mui/material"
import PropTypes from "prop-types"
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from "moment";
import toMomentOrNull from 'utils/DateFixer';

function FilterDialog(props) {
    return (
        <Dialog open={props.open}>
            {/* <DialogTitle>
                <Typography variant='h6'>Filter</Typography>
            </DialogTitle> */}
            <DialogContent>
                <Grid container spacing={3}>
                    <Grid size={12}>
                        <LocalizationProvider dateAdapter={DateAdapter}>
                            <DatePicker
                                label='From Date'
                                value={toMomentOrNull(props.data.fromDate)}
                                format='DD/MM/YYYY'
                                onChange={(date) => props.setFilter((prev) => ({ ...prev, fromDate: moment(date).format('YYYY-MM-DD') }))}
                                views={['year', 'month', 'day']}
                                slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid size={12}>
                        <LocalizationProvider dateAdapter={DateAdapter}>
                            <DatePicker
                                label='To Date'
                                value={toMomentOrNull(props.data.toDate)}
                                format='DD/MM/YYYY'
                                onChange={(date) => props.setFilter((prev) => ({ ...prev, toDate: moment(date).format('YYYY-MM-DD') }))}
                                views={['year', 'month', 'day']}
                                slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid size={6}>
                        <TextField
                        label='Min Price'
                            value={props.data.min_price}
                            fullWidth
                            variant='filled'
                            onChange={(event) => props.setFilter((prev) => ({ ...prev, min_price: event.target.value }))}
                        />
                    </Grid>

                    <Grid size={6}>
                        <TextField
                        label='Max Price'
                            value={props.data.max_price}
                            fullWidth
                            variant='filled'
                            onChange={(event) => props.setFilter((prev) => ({ ...prev, max_price: event.target.value }))}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Grid container spacing={3} display='flex' justifyContent='flex-end'>
                    <Grid>
                        <Button variant='contained' color='error' onClick={() => props.handleClearFilter()}>Clear</Button>
                    </Grid>

                    <Grid>
                        <Button variant='contained' onClick={() => props.handleApplyFilter()}>Apply</Button>
                    </Grid>
                </Grid>
            </DialogActions>
        </Dialog>
    );
}

FilterDialog.propTypes = {
    open: PropTypes.bool,
    handleClearFilter: PropTypes.func,
    handleApplyFilter: PropTypes.func,
    data: PropTypes.object,
    setFilter: PropTypes.func
}

export default FilterDialog