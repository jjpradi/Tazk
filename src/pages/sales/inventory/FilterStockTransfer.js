import React, {useEffect, useState} from 'react';
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
import {FilterAlt} from '@mui/icons-material';
import _, {countBy} from 'lodash';
import { DatePicker, DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import toMomentOrNull from 'utils/DateFixer';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 25,
  padding: 6,
  borderRadius: 5,
};

const button = {
  position: 'absolute',
  top: '86%',
  left: '37%',
};

function FilterStockTransfer(props) {
  
  useEffect(() => {
    setFormValue(props.filterValue);
  }, []);

  useEffect(() => {
    setFormValue(props.filterValue);
  }, [props.filterValue]);


  const [products, setProducts] = useState([]);
  const [formValue, setFormValue] = useState({
    initiatedFromDate: null,
    initiatedToDate: null,

    receivedFromDate: null,
    receivedToDate: null,

    destination_location: '',
    source_location: '',

    product_name: '',
  });




  useEffect(() => {
    for (const {childresult} of props.stocktransfer) {
      setProducts((oldArray) => [...oldArray, ...childresult]);
    }

  }, [props.stocktransfer]);

  const handleChange = (event) => {
    const {value, name} = event.target;
    setFormValue({...formValue, [name]: value});
  };

  //   const clearButton = () => {
  //     setFormValue({
  //       brand: '',
  //       category: '',
  //       location_id: 'null',
  //       payment_type: '',
  //       max_price: '',
  //       min_price: '',
  //     });
  //   };

//   const clearDataform = () => {

// console.log("0000")
//     setFormValue({
//       initiatedFromDate:  null,
//       initiatedToDate: null,

//       receivedFromDate: null,
//       receivedToDate: null,

//       destination_location: '',
//       source_location: '',

//       product_name: '',
//     });
//   };

  return (
    <>
      {/* <Badge color='secondary' badgeContent={props.count}>
        <FilterAlt onClick={() => props.handleFilterClose(true)} />
      </Badge> */}
      <Modal
        open={props.open}
        onClose={() => props.setFilterOpen(false)}
        align='left'
      >
        <Card sx={style}>
        <div style={{ marginLeft: "19pc" }}>
                <IconButton aria-label="close"
                onClick={() => props.setFilterOpen(false)}>
                  <CloseIcon />
                 
                </IconButton>
              </div>

          <Grid container spacing={6} direction={'row'}>
            <Divider
              lg={12}
              md={12}
              sm={12}
              xs={12}
              textAlign='left'
              sx={{
                width: '100%',
              }}
            >
              Initiated Date
            </Divider>
            <Grid
              size={{
                lg: 6,
                md: 6,
                sm: 12,
                xs: 12
              }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  name='initiatedFromDate'
                  label='From Date'
                  inputVariant='outlined'
                  format='DD/MM/YYYY'
                  value={toMomentOrNull(formValue.initiatedFromDate)}
                  onChange={(date) =>
                    handleChange({
                      target: {value: date, name: 'initiatedFromDate'},
                    })
                  }
                  views={['year', 'month', 'day']}
                  fullWidth
                  slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid
              size={{
                lg: 6,
                md: 6,
                sm: 12,
                xs: 12
              }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  name='initiatedToDate'
                  label='To Date'
                  inputVariant='outlined'
                  format='DD/MM/yyyy'
                  // inputFormat='DD/MM/yyyy'
                  value={toMomentOrNull(formValue.initiatedToDate)}
                  onChange={(date) =>
                    handleChange({
                      target: {value: date, name: 'initiatedToDate'},
                    })
                  }
                  views={['year', 'month', 'day']}
                  fullWidth
                  slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
                />
              </LocalizationProvider>
            </Grid>

            <Divider
              lg={12}
              md={12}
              sm={12}
              xs={12}
              textAlign='left'
              sx={{
                width: '100%',
              }}
            >
              Received Date
            </Divider>
            <Grid
              size={{
                lg: 6,
                md: 6,
                sm: 12,
                xs: 12
              }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  name='receivedFromDate'
                  label='From Date'
                  inputVariant='outlined'
                  format='DD/MM/YYYY'
                  // inputFormat='DD/MM/yyyy'
                  value={toMomentOrNull(formValue.receivedFromDate)}
                  onChange={(date) =>
                    handleChange({
                      target: {value: date, name: 'receivedFromDate'},
                    })
                  }
                  views={['year', 'month', 'day']}
                  fullWidth
                  slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid
              size={{
                lg: 6,
                md: 6,
                sm: 12,
                xs: 12
              }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  name='receivedToDate'
                  label='To Date'
                  inputVariant='outlined'
                 format='DD/MM/YYYY'
                  // inputFormat='DD/MM/yyyy'
                  value={toMomentOrNull(formValue.receivedToDate)}
                  onChange={(date) =>
                    handleChange({
                      target: {value: date, name: 'receivedToDate'},
                    })
                  }
                  views={['year', 'month', 'day']}
                  fullWidth
                  slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
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
              <Autocomplete
                multiple
                value={
                  formValue.source_location !== ''
                    ? formValue.source_location || []
                    : []
                }
                onChange={(event, newValue) => {
                  setFormValue({
                    ...formValue,
                    source_location: newValue.length === 0 ? '' : newValue,
                  });
                }}
                disablePortal
                name='source_location'
                options={_.uniqBy(props.stocktransfer, 'source_location')}
                getOptionLabel={(option) => option.source_location || ''}
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Source location'
                    variant='filled'
                  />
                )}
              />
            </Grid>

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Autocomplete
                multiple
                value={
                  formValue.destination_location !== ''
                    ? formValue.destination_location || []
                    : []
                }
                onChange={(event, newValue) => {
                  setFormValue({
                    ...formValue,
                    destination_location: newValue.length === 0 ? '' : newValue,
                  });
                }}
                disablePortal
                name='destination_location'
                options={_.uniqBy(props.stocktransfer, 'destination_location')}
                getOptionLabel={(option) => option.destination_location || ''}
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Destination location'
                    variant='filled'
                  />
                )}
              />
            </Grid>

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Autocomplete
                multiple
                value={
                  formValue.product_name !== ''
                    ? formValue.product_name || []
                    : []
                }
                onChange={(event, newValue) => {
                  setFormValue({
                    ...formValue,
                    product_name: newValue.length === 0 ? '' : newValue,
                  });
                }}
                disablePortal
                name='product_name'
                options={_.uniqBy(products, 'name')}
                getOptionLabel={(option) => option.name || ''}
                fullWidth
                  ListboxProps={{
                  style: {
                    maxHeight: "170px",
                  },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Product name'
                    variant='filled'
                  />
                )}
              />
            </Grid>
          </Grid>

                <Grid container spacing={7} display= 'flex' justifyContent='center' alignItems='center' p='20px 0px 5px 0px'>
                  {/* <Box> */}
                  <Grid>
                    <Button
                      onClick={() => {
                        props.clearData();
                        // clearDataform();
                        }  }
                      variant='contained'
                      color='secondary'
                    >
                      Clear
                    </Button>
                    {/* </Box> */}
                  </Grid>

                  <Grid>
                    <Button
                      onClick={() => props.ApplyButton(formValue)}
                      variant='contained'
                    >
                      Apply
                    </Button>
                  </Grid>
                </Grid>

        </Card>
      </Modal>
    </>
  );
}

export default FilterStockTransfer;
