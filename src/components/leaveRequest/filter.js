import {
  Autocomplete,
  Button,
  Dialog,
  DialogContent,
  Grid,
  TextField,
  Box,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import CloseIcon from '@mui/icons-material/Close';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import React, { useState } from 'react';
import { capitalize } from 'lodash';
import CommonUserAutoCompleteForSingleUser from 'utils/commonAutoCompleteForSingleUser';
import { getsessionStorage } from 'pages/common/login/cookies';
import toMomentOrNull from 'utils/DateFixer';

function FilterDialog(props) {
  // console.log("sdfsdf",'key' in props)
  const {open, applyFunc, handleClose, handleClear, get_empbasecompany, handleAssignChange, filterLeaveType,filterType, role_name, createdAt, employee, employee_id, handleDateChange, type,searchCompanyBasedEmployeeFilter,
    getCompanyBasedEmployeeFilter,searchVal,requestSearch,value,setValue,setSearchValEmployeeFilter,todate,fromdate,tpHandle} = props;

    console.log("type",type)
    const storage = getsessionStorage();

    let company_type = storage?.company_type || ''

  const leaveOptions = [
    {value: 'LEAVE', label: 'Leave'},
    {value: 'PERMISSION', label: 'Permission'},
    {value: 'ATTENDANCE_CORRECTION', label: 'Attendance Correction'},
    {value: 'HALFDAY', label: 'Half Day'}
  ];

  const options = [
    {value: 'claims', label: 'Claims'},
    {value: 'wfh', label: 'WFH'}
  ];
 
  const [leave, setLeave] = useState(null);

  const [typeOfFilter,setTypeOfFilter] = useState(null)

  // const handleFromDateChange = (newDate) => {
  //   setFromDate(newDate);
  // };

  // const handleToDateChange = (newDate) => {
  //   setToDate(newDate);
  // };


  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogContent>
        {/* Close Button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mb: 2,
          }}
        >
          <Box
            component="button"
            onClick={() => handleClose()}
            sx={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <CloseIcon />
          </Box>
        </Box>

        {/* Filter Fields Grid */}
        <LocalizationProvider dateAdapter={DateAdapter}>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* From Date */}
            <Box>
              <DatePicker
                label="From Date"
                format="DD/MM/YYYY"
                value={toMomentOrNull(fromdate)}
                onChange={(newDate) => handleDateChange(newDate)}
                views={['year', 'month', 'day']}
                slotProps={{
                  textField: {
                    variant: 'filled',
                    error: false,
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
            </Box>

            {/* To Date */}
            <Box>
              <DatePicker
                label="To Date"
                format="DD/MM/YYYY"
                value={toMomentOrNull(todate)}
                onChange={(newDate) => tpHandle(newDate)}
                views={['year', 'month', 'day']}
                slotProps={{
                  textField: {
                    variant: 'filled',
                    error: false,
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
            </Box>

            {/* Employee Selection */}
            <Box>
              <CommonUserAutoCompleteForSingleUser
                searchVal={searchVal}
                setSearchValEmployeeFilter={setSearchValEmployeeFilter}
                requestSearch={requestSearch}
                value={value}
                setValue={setValue}
                type={getCompanyBasedEmployeeFilter}
                searchType={searchCompanyBasedEmployeeFilter}
                labelName="Select Employee"
                filter={'key' in props}
                disabled={role_name?.toLowerCase() === 'employee'}
              />
            </Box>

            {/* Request Type - Leave Request */}
            {type === '1' && company_type == 5 && (
              <Box>
                <Autocomplete
                  id="request-type-autocomplete"
                  options={leaveOptions}
                  getOptionLabel={(option) => option.label}
                  name="offType"
                  value={
                    leaveOptions.find((option) => option.value === filterLeaveType) ||
                    null
                  }
                  onChange={(event, newValue) => {
                    const selectedValue = newValue ? newValue.value : null;
                    setLeave(selectedValue);
                    handleAssignChange({
                      target: { name: 'filterLeaveType', value: selectedValue },
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Request Type"
                      fullWidth
                      variant="filled"
                      size="small"
                    />
                  )}
                  ListboxProps={{ style: { maxHeight: '300px', overflowY: 'auto' } }}
                />
              </Box>
            )}

            {/* Type Filter - Claims/WFH */}
            {type === '5' && company_type == 5 && (
              <Box>
                <Autocomplete
                  id="type-autocomplete"
                  options={options}
                  getOptionLabel={(option) => option.label}
                  name="type"
                  value={options.find((option) => option.value === filterType) || null}
                  onChange={(event, newValue) => {
                    const selectedValue = newValue ? newValue.value : null;
                    setTypeOfFilter(selectedValue);
                    handleAssignChange({
                      target: { name: 'filterType', value: selectedValue },
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Type"
                      fullWidth
                      variant="filled"
                      size="small"
                    />
                  )}
                  ListboxProps={{ style: { maxHeight: '300px', overflowY: 'auto' } }}
                />
              </Box>
            )}

            {/* Action Buttons */}
            <Grid
              container
              spacing={1.5}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mt: 1,
              }}
            >
              <Grid item xs={6}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => handleClear()}
                  fullWidth
                  size="small"
                >
                  Clear
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  onClick={() => applyFunc()}
                  variant="contained"
                  fullWidth
                  size="small"
                  disabled={
                    !(
                      fromdate !== null ||
                      todate !== null ||
                      value?.length !== 0 ||
                      leave !== null
                    )
                  }
                >
                  Apply
                </Button>
              </Grid>
            </Grid>
          </Box>
        </LocalizationProvider>
      </DialogContent>
    </Dialog>
  );
}

export default FilterDialog;
