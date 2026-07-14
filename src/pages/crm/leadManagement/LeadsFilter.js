import React from 'react'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { Button, Grid, TextField } from '@mui/material'
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { getsessionStorage } from 'pages/common/login/cookies'
import CommonUserAutoCompleteForSingleUser from 'utils/commonAutoCompleteForSingleUser'
import toMomentOrNull from 'utils/DateFixer';

const LeadsFilter = (props) => {

    const { fromDate, toDate, handleDateChange, handleCancel, handleApply, searchVal, setSearchValEmployeeFilter, requestSearch, value, setValue, getCompanyBasedEmployeeFilter, searchCompanyBasedEmployeeFilter } = props

    const storage = getsessionStorage()

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
                      label = 'From Date'
                      format='DD/MM/YYYY'
                      value = {toMomentOrNull(fromDate)}
                      onChange = {(newDate) => handleDateChange('fromDate', newDate)}
                      views={['year', 'month', 'day']}
                      slotProps={{ textField: { fullWidth: true, variant: 'filled', error: false } }}
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
                      label = 'To Date'
                      format='DD/MM/YYYY'
                      value = {toMomentOrNull(toDate)}
                      onChange = {(newDate) => handleDateChange('toDate', newDate)}
                      views={['year', 'month', 'day']}
                      slotProps={{ textField: { fullWidth: true, variant: 'filled', error: false } }}
                  />
              </LocalizationProvider>
          </Grid>
          {
              storage.company_type === 9 && 
              <Grid
                  size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                  }}>
                  <CommonUserAutoCompleteForSingleUser
                      searchVal = {searchVal}
                      setSearchValEmployeeFilter = {setSearchValEmployeeFilter}
                      requestSearch = {requestSearch}
                      value = {value}
                      setValue = {setValue}
                      type = {getCompanyBasedEmployeeFilter}
                      searchType = {searchCompanyBasedEmployeeFilter}
                      labelName = 'Select Employee'
                  />
              </Grid>
          }
          <Grid
              size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
              }}>
              <Grid
                  container
                  spacing = {5}
                  display = 'flex'
                  justifyContent = 'center'
              >
                  <Grid>
                      <Button
                          variant = 'contained'
                          color = 'error'
                          onClick = {() => handleCancel()}
                      >
                          Clear
                      </Button>
                  </Grid>

                  <Grid>
                      <Button
                          variant = 'contained'
                          onClick = {() => handleApply()}
                          disabled = {fromDate === '' && toDate === ''}
                      >
                          Apply
                      </Button>
                  </Grid>
              </Grid>
          </Grid>
      </Grid>
  );
}

export default LeadsFilter