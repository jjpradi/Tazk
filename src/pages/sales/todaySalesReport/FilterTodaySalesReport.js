import React, {useContext, useEffect, useState} from 'react';
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
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";
import { useDispatch, useSelector } from 'react-redux';
import { listPaymentTypeDetails } from 'redux/actions/payment_method_actions';
import { getSalesStatusListAction } from 'redux/actions/sales_actions';
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import context from '../../../context/CreateNewButtonContext';
import { listProductAction } from 'redux/actions/product_actions';
import moment from 'moment';
// import dayjs from 'dayjs';
import { getDateTimeFormat } from 'utils/getTimeFormat';
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
  top: '89%',
  left: '37%',
};



function FilterTodaySalesreport(props) {
  console.log("props",props)
  const dispatch = useDispatch();
  const {
    salesReducer: {Sale_Status, getbillingcompanydetails},
    paymentMethodReducer: {list_payment_type},
    stockLocationReducer:{stocklocation},
    productReducer:{product}
  } = useSelector((state) => state);

  const {setLoaderStatusHandler, setModalTypeHandler,commoncookie,headerLocationId} = useContext(context);

  // useEffect(() => {
  //   setFormValue(props.filtedValue);
  //   if (props.open) {
  //     !list_payment_type.length && dispatch(listPaymentTypeDetails())
  //     !stocklocation.length && dispatch(listStockLocationAction(commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
  //     if (!product.length && props.open) { dispatch(listProductAction(setModalTypeHandler, setLoaderStatusHandler)); }
  //   }
  // }, [props.open]);
  
  // useEffect(() => {
  //   setFormValue(props.filtedValue);
  // }, [props.filtedValue]);

  const [formValue, setFormValue] = useState({
    from: props.filtedValue.from || moment().format('YYYY-MM-DD'),
    to: props.filtedValue.to || moment().format('YYYY-MM-DD'),
    brand: props.filtedValue.brand === undefined || ''  ? 'null' : props.filtedValue.brand,
    category: props.filtedValue.category === undefined || '' ? 'null' : props.filtedValue.category,
    location_id: props.filtedValue.location_id === undefined || '' ? 'null' : props.filtedValue.location_id,
    payment_type: props.filtedValue.payment_type === undefined || '' ? 'null' : props.filtedValue.payment_type,
  });
  const [errormsg, seterrormsg] = useState({from: '', to: ''});



  const handleChange = (event) => {
    const {value, name} = event.target;
    setFormValue({...formValue, [name]: value});
    // props.filterHandler(name,value)
  };

  const clearButton = () => {
    setFormValue({
      from:'null',
      to: 'null',
      brand: 'null',
      category: 'null',
      location_id: 'null',
      payment_type: 'null',
      
    });
  };

    const [rangeOption, setRangeOption] = useState(null);
  
    const rangeOptions = ['Weekly','Monthly','Quarterly','Half-Yearly','Yearly'];
  
    console.log(rangeOption,'rangeOption')

  return (
    <>
      <Badge color='secondary' badgeContent={props.count}>
        <FilterAlt onClick={() => props.handleClose(true)} />
      </Badge>
      <Modal
        open={props.open}
        onClose={() => props.handleClose(false)}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
        align='right'
      >
        <Card sx={style} style={{overflow:'auto', maxHeight:"38pc"}}>

            <div style={{ marginLeft: "16pc" }}>
            <IconButton aria-label="close" onClick={() => props.handleClose(false)}>
            <CloseIcon />
         
            </IconButton>
            </div>

          <Grid container spacing={3} direction={'row'} display= 'flex' justifyContent='center' alignItems='center'>

             <Grid
               size={{
                 lg: 12,
                 md: 12,
                 sm: 12,
                 xs: 12
               }}>
                              <Autocomplete
                                options={rangeOptions}
                                value={props.dateRange === null ? props.dateRange : props.dateRange}
                                onChange={(event, newValue) => {
                                  console.log(newValue, 'newValuesds');
                                  setRangeOption(newValue);
            
                                  if (newValue === 'Weekly') {
                                    const startOfWeek = moment().startOf('week');
                                    const endOfWeek = moment().endOf('week');
                                    props.handleChange({
                                      target: {
                                        value: startOfWeek,
                                        name: 'dateRange',
                                        value1: endOfWeek,
                                        value2: newValue
                                      }
                                    });
                                  } else if (newValue === 'Monthly') {
                                    const startOfMonth = moment().startOf('month');
                                    const endOfMonth = moment().endOf('month');
                                    props.handleChange({
                                      target: {
                                        value: startOfMonth,
                                        name: 'dateRange',
                                        value1: endOfMonth,
                                        value2: newValue
                                      }
                                    });
                                  } else if (newValue === 'Quarterly') {
                                    const startOfQuarter = moment().subtract(2, 'months').startOf('month'); // 3 months including current
                                    const endOfQuarter = moment().endOf('month');
                                    props.handleChange({
                                      target: {
                                        value: startOfQuarter,
                                        name: 'dateRange',
                                        value1: endOfQuarter,
                                        value2: newValue
                                      }
                                    });
                                  } else if (newValue === 'Half-Yearly') {
                                    const startOfHalfYear = moment().subtract(5, 'months').startOf('month'); // 6 months including current
                                    const endOfHalfYear = moment().endOf('month');
                                    props.handleChange({
                                      target: {
                                        value: startOfHalfYear,
                                        name: 'dateRange',
                                        value1: endOfHalfYear,
                                        value2: newValue
                                      }
                                    });
                                  } else if (newValue === 'Yearly') {
                                    const startOfYear = moment().subtract(11, 'months').startOf('month'); // 12 months including current
                                    const endOfYear = moment().endOf('month');
                                    props.handleChange({
                                      target: {
                                        value: startOfYear,
                                        name: 'dateRange',
                                        value1: endOfYear,
                                        value2: newValue
                                      }
                                    });
                                  }
                                }}
            
                                renderInput={(params) => (
                                  <TextField {...params} label="Select Range" fullWidth variant="outlined" />
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
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  name='from'
                  label='From Date'
                  format='DD/MM/YYYY'
                  inputVariant='outlined'
                  // inputFormat='DD/MM/yyyy'
                  // error={error}
                   value={props.from ? toMomentOrNull(props.from) : null}
                                                      onChange={(dates) => {
                                                        props.handleChange({
                                                          target: { value: dates, name: 'from' },
                                                        })
                                                      }
                                                      }
                  fullWidth={true}
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
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  name='to'
                  label='To Date'
                  inputVariant='outlined'
                  format='DD/MM/YYYY'
                  //  format="DD/MM/yyyy"
                  // inputFormat='DD/MM/yyyy'
                  value={props.to ? toMomentOrNull(props.to) : null}
                                                     onChange={(dates) => {
                                                       props.handleChange({
                                                         target: { value: dates, name: 'to' },
                                                       })
                                                     }
                                                     }
                  fullWidth={true}
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
                disableClearable
                options={getbillingcompanydetails || []}
                getOptionLabel={(option) =>
                    option.tax_id ? `${option.company_name} - ${option.tax_id}` : ""
                }
                onChange={(e, value) => {
                    props.handleChange({
                        target: { name: "subcompanyId", value: value || "" }
                    })
                }}
                value={
                    getbillingcompanydetails?.find(
                        (d) => d.sub_company_id === props.subcompanyId
                    ) || null
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Sub Company"
                        variant="filled"
                    />
                )}
              />
            </Grid>

            {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
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
                options={_.uniqBy(product, 'brand')}
                getOptionLabel={(option) => option.brand || ''}
                fullWidth
                renderInput={(params) => (
                  <TextField 
                  {...params} 
                  label='Brand' 
                  variant='filled' />
                )}
              />
            </Grid> */}

            {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
              <Autocomplete
                multiple
                value={
                  formValue.category !== 'null' ? formValue.category || [] : []
                }
                // value={
                //   Array.isArray(formValue.category)
                //     ? formValue.category
                //     : []
                // }
                onChange={(event, newValue) => {
                  setFormValue({
                    ...formValue,
                    category: newValue.length === 0 ? '' : newValue,
                  });
                }}
                disablePortal
                name='category'
                id='combo-box-demo'
                options={_.uniqBy(product, 'category')}
                getOptionLabel={(option) => option.category || ''}
                fullWidth
                renderInput={(params) => (
                  <TextField 
                  {...params} 
                  label='Category' 
                  variant='filled' />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
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
                  <TextField {...params} 
                  label='Location'
                   variant='filled' 
                   />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
              <Autocomplete
                multiple
                value={
                  formValue.payment_type !== 'null'
                    ? formValue.payment_type
                    : []
                }
                onChange={(event, newValue) => {
                  setFormValue({
                    ...formValue,
                    payment_type: newValue.length === 0 ? 'null' : newValue,
                  });
                }}
                disablePortal
                name='payment_mode'
                id='combo-box-demo'
                options={_.uniqBy(props.list_payment_type, 'payment_type')}
                getOptionLabel={(option) => option.payment_type || ''}
                fullWidth='true'
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='payment mode'
                    variant='filled'
                  />
                )}
              />
            </Grid> */}
          </Grid>

          <Grid container spacing={7} display= 'flex' justifyContent='center' alignItems='center' p='20px 0px 5px 0px' >
                  <Grid>
                    <Button
                      onClick={() => props.clearButton()}
                      variant='contained'
                      color='secondary'
                    >
                      Clear
                    </Button>
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

export default FilterTodaySalesreport;
