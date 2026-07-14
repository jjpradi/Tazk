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



function FilterSalesreport(props) {
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
    from: 'null',
    to: 'null',
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
      brand: 'null',
      category: 'null',
      location_id: 'null',
      payment_type: 'null',
      
    });
  };

  const [rangeOption, setRangeOption] = useState(null);

  const rangeOptions = ['Today','Yesterday','This Week','Last Week','Last 7 Days','This Month','Last Month','This Quater','Last Quater','Current Fiscal Year','Previous Fiscal Year','Last 365 days'];

  console.log(rangeOption,'rangeOption')
  console.log(props.stocklocation, "propsstocklocation")

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
                      console.log(newValue, 'newValue');
                      setRangeOption(newValue);

                      let startDate = null;
                      let endDate = null;

                      switch (newValue) {
                        case 'Today':
                          startDate = endDate = moment().startOf('day');
                          break;

                        case 'Yesterday':
                          startDate = endDate = moment().subtract(1, 'day').startOf('day');
                          break;

                        case 'This Week':
                          startDate = moment().startOf('week');
                          endDate = moment().endOf('week');
                          break;

                        case 'Last Week':
                          startDate = moment().subtract(1, 'week').startOf('week');
                          endDate = moment().subtract(1, 'week').endOf('week');
                          break;

                        case 'Last 7 Days':
                          startDate = moment().subtract(6, 'days').startOf('day'); // inclusive of today
                          endDate = moment().endOf('day');
                          break;

                        case 'This Month':
                          startDate = moment().startOf('month');
                          endDate = moment().endOf('month');
                          break;

                        case 'Last Month':
                          startDate = moment().subtract(1, 'month').startOf('month');
                          endDate = moment().subtract(1, 'month').endOf('month');
                          break;

                        case 'This Quater':
                          startDate = moment().startOf('quarter');
                          endDate = moment().endOf('quarter');
                          break;

                        case 'Last Quater':
                          startDate = moment().subtract(1, 'quarter').startOf('quarter');
                          endDate = moment().subtract(1, 'quarter').endOf('quarter');
                          break;

                        case 'Current Fiscal Year':
                          // Adjust fiscal year as needed (example: Apr 1 - Mar 31)
                          startDate = moment().month() >= 3
                            ? moment().month(3).startOf('month')
                            : moment().subtract(1, 'year').month(3).startOf('month');
                          endDate = startDate.clone().add(1, 'year').subtract(1, 'day');
                          break;

                        case 'Previous Fiscal Year':
                          startDate = moment().month() >= 3
                            ? moment().subtract(1, 'year').month(3).startOf('month')
                            : moment().subtract(2, 'year').month(3).startOf('month');
                          endDate = startDate.clone().add(1, 'year').subtract(1, 'day');
                          break;

                        case 'Last 365 days':
                          startDate = moment().subtract(364, 'days').startOf('day');
                          endDate = moment().endOf('day');
                          break;

                        default:
                          return;
                      }

                      props.handleChange({
                        target: {
                          name: 'dateRange',
                          value: startDate,
                          value1: endDate,
                          value2: newValue
                        }
                      });
                    }}


                    renderInput={(params) => (
                      <TextField {...params} label="Select Range" fullWidth variant="filled" />
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
                  inputVariant='outlined'
                  format='DD/MM/YYYY'
                  // inputFormat='DD/MM/yyyy'
                  // error={error}
                  // value={props.from === null ? props.from : props.from}
                  views={['year', 'month', 'day']}
                   value={props.from ? toMomentOrNull(props.from) : null}
                  onChange={(date) =>
                    props.handleChange({
                      target: { value: date, name: 'from' },
                    })
                    // onChange={(dates) => {
                    //   console.log("ihfui", dates)
                    //   handleChange({
                    //     target: { value: dates ? getDateTimeFormat(dates.$d) : null, name: 'from' },
                    //   })
                    // }
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
                  //  format="DD/MM/yyyy"
                  format='DD/MM/YYYY'
                  // inputFormat='DD/MM/yyyy'
                  value={props.to ? toMomentOrNull(props.to) : null}
                  onChange={(date) =>
                    props.handleChange({
                      target: { value: date, name: 'to' },
                    })
                    //  onChange={(dates) => {
                    //    handleChange({
                    //      target: { value: dates ? getDateTimeFormat(dates.$d) : null, name: 'to' },
                    //    })
                    //  }
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

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Autocomplete
                multiple
                value={Array.isArray(formValue.location_id) ? formValue.location_id : []}
                onChange={(event, newValue) => {
                  setFormValue({
                    ...formValue,
                    location_id: newValue.length === 0 ? [] : newValue,
                  });
                }}
                disablePortal
                name='location_id'
                id='combo-box-demo'
                options={
                  Array.isArray(props.stocklocation)
                    ? _.uniqBy(props.stocklocation, 'location_name')
                    : []
                }
                getOptionLabel={(option) => option.location_name || ''}
                // isOptionEqualToValue={(option, value) =>
                //   option.location_id === value.location_id
                // }
                fullWidth='true'
                renderInput={(params) => (
                  <TextField {...params} 
                  label='Location'
                   variant='filled' 
                   fullWidth
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
                    fullWidth
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

export default FilterSalesreport;
