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
import IconButton from "@mui/material/IconButton";
import toMomentOrNull from '../../../utils/DateFixer';


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

function FilterReconcilate(props) {
  useEffect(() => {
    setFormValue(props.filtedValue);
  }, []);

  useEffect(() => {
    setFormValue(props.filtedValue);
  }, [props.filtedValue]);

  const [formValue, setFormValue] = useState({});



  const handleChange = (event) => {
    const {value, name} = event.target;
    if (name === 'name') {
      formValue.product_name = value;
    }
    setFormValue({...formValue, [name]: value});
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

  return (
    <>
      <Badge color='secondary' badgeContent={props.count}>
        <FilterAlt onClick={() => props.handleFilterClose(true)} />
      </Badge>
      <Modal
        open={props.open}
        onClose={() => props.handleFilterClose(false)}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
        align='left'
      >
        <Card sx={style} style={{overflow:'auto', maxHeight:"38pc"}}>

              <div style={{ marginLeft: "16pc" }}>
              <IconButton aria-label="close" onClick={() => props.handleFilterClose(false)}>
              <CloseIcon />
         
              </IconButton>
              </div>

          <Grid container spacing={1.5} direction={'row'}>
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  name='from'
                  label='From Date'
                  inputVariant='outlined'
                  // inputFormat='DD/MM/yyyy'
                  // error={error}
                  format='DD/MM/YYYY'
                  value={toMomentOrNull(props.from)}
                  onChange={(date) =>
                    props.handleChange({
                      target: {value: date, name: 'from'},
                    })
                  }
                  fullWidth={true}
                  slotProps={{ textField: { fullWidth: true } }}
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
                  name='to'
                  label='To Date'
                  inputVariant='outlined'
                  //  format="DD/MM/yyyy"
                  // inputFormat='DD/MM/yyyy'
                  value={props.to === null ? props.to : props.to}
                  onChange={(date) =>
                    props.handleChange({
                      target: {value: date, name: 'to'},
                    })
                  }
                  fullWidth={true}
                  slotProps={{ textField: { fullWidth: true } }}
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
                value={formValue.name !== 'null' ? formValue.name || [] : []}
                onChange={(event, newValue) => {
                  setFormValue({
                    ...formValue,
                    name: newValue.length === 0 ? '' : newValue,
                  });
                }}
                disablePortal
                name='name'
                id='combo-box-demo'
                options={_.uniqBy(props.product, 'name')}
                getOptionLabel={(option) => option.name || ''}
                fullWidth='true'
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Product name'
                    variant='outlined'
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
                value={formValue.brand !== 'null' ? formValue.brand || [] : []}
                onChange={(event, newValue) => {
                  setFormValue({
                    ...formValue,
                    brand: newValue.length === 0 ? '' : newValue,
                  });
                }}
                disablePortal
                name='brand'
                id='combo-box-demo'
                options={_.uniqBy(props.product, 'brand')}
                getOptionLabel={(option) => option.brand || ''}
                fullWidth='true'
                renderInput={(params) => (
                  <TextField {...params} label='Brand' variant='outlined' />
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
                  formValue.category !== 'null' ? formValue.category || [] : []
                }
                onChange={(event, newValue) => {
                  setFormValue({
                    ...formValue,
                    category: newValue.length === 0 ? '' : newValue,
                  });
                }}
                disablePortal
                name='category'
                id='combo-box-demo'
                options={_.uniqBy(props.product, 'category')}
                getOptionLabel={(option) => option.category || ''}
                fullWidth='true'
                renderInput={(params) => (
                  <TextField {...params} label='Category' variant='outlined' />
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
                  formValue.location_id !== 'null'
                    ? formValue.location_id || []
                    : []
                }
                onChange={(event, newValue) => {
                  setFormValue({
                    ...formValue,
                    location_id: newValue.length === 0 ? 'null' : newValue,
                  });
                }}
                disablePortal
                name='location_id'
                id='combo-box-demo'
                options={_.uniqBy(props.stocklocation, 'location_name')}
                getOptionLabel={(option) => option.location_name || ''}
                fullWidth='true'
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Location Name'
                    variant='outlined'
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
                // value={
                //   formValue.supplier_id !== 'null' ? formValue.supplier_id || [] : []
                // }
                value={
                  formValue.supplier_id !== 'null' && formValue.supplier_id ? props.vendor.filter( f=> formValue.supplier_id.some(s=> s===f.supplier_id)) || [] : []
                }
                onChange={(event, newValue) => {
                  setFormValue({
                    ...formValue,
                    supplier_id: newValue.length === 0 ? '' : newValue.map((f)=>f.supplier_id),
                  });
                }}
                disablePortal
                name='supplier_id'
                id='combo-box-demo'
                options={props.vendor
                  .filter((d) => d.company_name && d.supplier_id && d.supplier_id !== null && d.company_name !== null)}
                getOptionLabel={(option) => option.company_name || ''}
                fullWidth='true'
                renderInput={(params) => (
                  <TextField {...params} label='Vendor' variant='outlined' />
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
                  formValue.statusfilter !== 'null' ? formValue.statusfilter || [] : []
                }
                // value={
                //   formValue.statusfilter !== 'null' && formValue.statusfilter ? props.statusfilter.filter( f=> formValue.statusfilter.some(s=> s===f.status)) || [] : []
                // }
                onChange={(event, newValue) => {
                  setFormValue({
                    ...formValue,
                    statusfilter: newValue.length === 0 ? '' : newValue,
                  });
                }}
                disablePortal
                name='statusfilter'
                id='combo-box-demo'
                options={_.uniqBy(props.statusfilter, 'status')}
                getOptionLabel={(option) => option?.status || ''}
                fullWidth='true'
                renderInput={(params) => (
                  <TextField {...params} label='Status' variant='outlined' />
                )}
              />
         
            </Grid>
        


            <Grid>
              <Grid container spacing={2}>
                <Grid
                  size={{
                    lg: 6,
                    md: 6,
                    sm: 6,
                    xs: 3
                  }}>
                  <TextField
                    id='outlined-name'
                    label='Min Price'
                    value={formValue.min_price}
                    name='min_price'
                    type={'number'}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid
                  size={{
                    lg: 6,
                    md: 6,
                    sm: 6,
                    xs: 3
                  }}>
                  <TextField
                    id='outlined-name'
                    label='Max Price'
                    value={formValue.max_price}
                    name='max_price'
                    type={'number'}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

                <Grid container spacing={7} display= 'flex' justifyContent='center' alignItems='center' p='20px 0px 5px 0px'>
                  {/* <Box> */}
                  <Grid>
                    <Button
                      onClick={() => props.clearButton()}
                      // sx={button}
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
                      // sx={button}
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

export default FilterReconcilate;
