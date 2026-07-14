import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { Button, Card, Grid, TextField } from "@mui/material"
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import CommonUserAutoCompleteForSingleUser from "utils/commonAutoCompleteForSingleUser"
import toMomentOrNull from "../../../utils/DateFixer"
function AuditCheckListFilter(props){

    const{ fromDate, toDate, handleDateChange, searchVal, setSearchValEmployeeFilter, requestSearch, value, setValue, getCompanyBasedEmployeeFilter, searchCompanyBasedEmployeeFilter, roleName, handleCancel, handleApply } = props

    return (
        <Grid container rowGap={3}>
            <Grid
                size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                }}>
                <LocalizationProvider dateAdapter={DateAdapter}>
                    <DatePicker 
                        label="From Date"
                        value={toMomentOrNull(fromDate)}
                        onChange={(newDate) => handleDateChange('fromDate', newDate)}
                        views={['year', 'month', 'day']}
                        slotProps={{ textField: { variant: "filled", fullWidth: true, error: false } }}
                    />
                </LocalizationProvider>
            </Grid>
            <Grid
                size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                }}>
                <LocalizationProvider dateAdapter={DateAdapter}>
                    <DatePicker 
                        label="To Date"
                        value={toMomentOrNull(toDate)}
                        onChange={(newDate) => handleDateChange('toDate', newDate)}
                        views={['year', 'month', 'day']}
                        slotProps={{ textField: { variant: "filled", fullWidth: true, error: false } }}
                    />
                </LocalizationProvider>
            </Grid>
            <Grid
                size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                }}>
                <CommonUserAutoCompleteForSingleUser 
                    searchVal={searchVal}
                    setSearchValEmployeeFilter={setSearchValEmployeeFilter}
                    requestSearch={requestSearch}
                    value={value}
                    setValue={setValue}
                    type={getCompanyBasedEmployeeFilter}
                    searchType={searchCompanyBasedEmployeeFilter}
                    labelName='Select Employee'
                    filter={'roleName' in props}
                />
            </Grid>
            <Grid
                size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                }}>
                <Grid container spacing={5} display='flex' justifyContent='center'>
                    <Grid>
                        <Button variant='contained' color="error" onClick={() => handleCancel()}>Clear</Button>
                    </Grid>

                    <Grid>
                        <Button 
                            variant='contained' 
                            onClick={() => handleApply()}
                            disabled={fromDate === '' && toDate === '' && value.length === 0}
                        >Apply</Button>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );

}

export default AuditCheckListFilter