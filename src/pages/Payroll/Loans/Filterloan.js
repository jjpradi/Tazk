import React, { useEffect, useState } from 'react';
import {
  Modal,
  Card,
  Button,
  TextField,
  Autocomplete,
  MenuItem,
  InputLabel,
  Select,
  FormControl,
  Box,
  Badge,
  Grid,
  Slider,
  Typography,
} from '@mui/material';
import { FilterAlt } from '@mui/icons-material';
import _, { countBy } from 'lodash';
import { DatePicker, DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";
import { getDateFormat } from 'utils/getTimeFormat';
import { getsessionStorage } from 'pages/common/login/cookies';
import CommonUserAutoComplete from 'utils/commonAutoCompleteForUser';
import toMomentOrNull from 'utils/DateFixer';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 350,
  bgcolor: 'background.paper',
  boxShadow: 25,
  p: 4,

  borderRadius: 5,
};

const button = {
  position: 'absolute',
  top: '86%',
  left: '37%',
};

const FilterLoan = (props) => {

  useEffect(() => {
    setFormValue(props.filtedValue);
  }, []);

  useEffect(() => {
    setFormValue(props.filtedValue);
  }, [props.filtedValue]);

  const [formValue, setFormValue] = useState({});

  const status = [
    // { value: "Rejected", label: "Rejected" },
    { value: "Waiting For Approval", label: "Waiting For Approval" },
    { value: "Approved", label: "Approved" }
  ];

  const handleChange = (event) => {
    const { value, name } = event.target;
    if (name === 'name') {
      formValue.product_name = value;
    }
    setFormValue({ ...formValue, [name]: value });
    // props.filterHandler(name,value)
  };

  const clearButton = () => {
    setFormValue({
      brand: '',
      category: '',
      location_id: 'null',
      payment_type: '',
      max_price: '',
      min_price: '',
    });
  };
    const storage = getsessionStorage()
    const AdminRole = storage.role_name !== "Employee"

  return (
    <>
      {props.showIcon === false ? '' : (
        <Badge color='secondary' //</>badgeContent={props.count}
        >
          <FilterAlt
            onClick={() => props.handleOpen(true)}
          />
        </Badge>
        )}
      <Modal
        open={props.open}
        onClose={() => props.handleOpen(false)}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
        align='left'
      >
        <Card sx={style}>
          <div style={{ marginLeft: "17.2pc" }}>
            <IconButton aria-label="close"
               onClick={() => props.handleOpen(false)}
            >
              <CloseIcon />

            </IconButton>
          </div>
          <Grid container spacing={3} display='flex' justifyContent='center' direction={'row'} >
              <Grid container spacing={2} size={12}>
            {AdminRole &&
              <Grid size={12}>
                <FormControl fullWidth variant='filled'>
                  <CommonUserAutoComplete
                  searchVal={props.searchVal}
                  requestSearch={props.requestSearch}
                  value={props.value}
                  setValue={props.setValue}
                  type={props.type}
                  searchType={props.searchType}
                  selectedAll={props.selectedAll}
                  setSelectedAll={props.setSelectedAll}
                  />
                </FormControl>
              </Grid>
            }
            
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
                <LocalizationProvider dateAdapter={DateAdapter}>
                  <DatePicker
                    label='From Date'
                    // inputFormat='DD/MM/yyyy'
                    name='date'
                    value={toMomentOrNull(props.filteredValue.frmdate)}
                    format='DD/MM/YYYY'
                    inputVariant='contained'
                    disableFuture
                    onChange={(e, v) => {
                      props.setFilteredValue({ ...props.filteredValue, frmdate: getDateFormat(e) });
                    }}
                    views={['year', 'month', 'day']}
                    slotProps={{ textField: { variant: 'filled', error: false, fullWidth: true } }}
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
                    label='To Date'
                    // inputFormat='DD/MM/yyyy'
                    name='date'
                    value={toMomentOrNull(props.filteredValue.todate)}
                    format='DD/MM/YYYY'
                    inputVariant='contained'
                    disableFuture
                    onChange={(e, v) => {
                      props.setFilteredValue({ ...props.filteredValue, todate: getDateFormat(e) });
                    }}
                    views={['year', 'month', 'day']}
                    slotProps={{ textField: { variant: 'filled', error: false, fullWidth: true } }}
                  />
                </LocalizationProvider>
            </Grid>

            {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
              <Autocomplete
                fullWidth
                disablePortal
                id='combo-box-demo'
                options={[...status]}
                onChange={(e, v) => {
                  if(v !== null){
                    props.setFilteredValue({ ...props.filteredValue, status: v.value });
                  }
                  else{
                    props.setFilteredValue({ ...props.filteredValue, status: '' });
                  }
                }}
                value={props.filteredValue.status === null ? '' : props.filteredValue.status}
                renderInput={(params) => (
                  <TextField variant='filled'
                    {...params}
                    label='Status'
                    name='Status'
                    // style={{ backgroundColor: 'white', borderRadius: '5px' }}
                  />
                )}
              />
            </Grid> */}
            
            <Grid container spacing={5} pt='15px' style={{ display: 'flex', justifyContent: 'center' }} >
            <Grid>
                <Button
                  fullWidth
                onClick={() => props.handleClose()}
                // sx={button}
                variant='contained'
                color='warning'
              >
                Clear
              </Button>
            </Grid>
            <Grid>
                <Button
                  fullWidth
                onClick={() => props.ApplyButton()}
                // sx={button}
                variant='contained'
              >
                Apply
              </Button>
            </Grid>
            </Grid>
          </Grid>
          </Grid>
        </Card>
      </Modal>
    </>
  );
}

export default FilterLoan;
