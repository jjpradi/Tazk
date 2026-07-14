import React, {useEffect, useState, useContext} from 'react';
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
import moment from 'moment';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";
import { listPaymentTypeDetails } from 'redux/actions/payment_method_actions';
import context from '../../../context/CreateNewButtonContext'
import {useDispatch, useSelector} from 'react-redux';
import { listProductAction, listProductActionByType } from 'redux/actions/product_actions';
import toMomentOrNull from '../../../utils/DateFixer'
 

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



function FilterSalesOrder(props) {
  console.log("asdasd",props)
  const dispatch = useDispatch();
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);


  const {
    productReducer:{productByType},
    salesReducer: { getbillingcompanydetails}
} = useSelector((state) => state);
  // useEffect(()=>{
  //   if(props.open !== undefined && !props.list_payment_type.length){
  //   dispatch(listPaymentTypeDetails(
  //     setModalTypeHandler,
  //     setLoaderStatusHandler,
  //   ))
  //   }
  // },[props.open && !props.list_payment_type.length])


  const [formValue, setFormValue] = useState({});
  const [from, setFrom] = useState(new Date());
  const [to, setTo] = useState(new Date());

  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const currentDate = new Date()

  useEffect(() => {
    setFormValue(props.filtedValue);
  }, []);

  useEffect(() => {
    setFormValue(props.filtedValue);
  }, [props.filtedValue]);


  const handleChange = (event) => {
    const {value, name} = event.target;
    if (props.setFilterValues) {
      props.setFilterValues(name, value);
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


    const [rangeOption, setRangeOption] = useState(null);

   const rangeOptions = ['Today','Yesterday','This Week','Last Week','Last 7 Days','This Month','Last Month','This Quater','Last Quater','Current Fiscal Year','Previous Fiscal Year','Last 365 days']

   const deliverStatus = [
    {id : 1 , status : 'Ready To Ship'},
    {id : 2 , status : 'In Transit'},
    {id : 3 , status : 'Delivered'},
    {id : 4 , status : 'On Hold'},
    {id : 5 , status : 'Canceled'}
   ]

   const paymentStatusn = [
      {id : 1 , payment_status : 'Pending'},
    {id : 2 , payment_status : 'Completed'},
   ]



  return (
    <>
      <Badge color='secondary' badgeContent={props.count}>
        <FilterAlt onClick={() => {props.handleClose(true)
            if(!props.list_payment_type?.length && props.pageType!=='/salesOrders'){
              dispatch(listPaymentTypeDetails(
                setModalTypeHandler,
                setLoaderStatusHandler,
              ))
              }
              if(!productByType.length){
                let type = "sales"
                dispatch(listProductActionByType(
                 type
                ))
                }
        }} />
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

          <Grid container spacing={1.5} direction={'row'}>

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
                                        <Autocomplete
                                            options={rangeOptions}
                                            value={props.dateRange}
                                            disablePortal = {false}
                                            onChange={(event, newValue) => {
                                                setRangeOption(newValue);
                                                // Set fromDate and toDate based on selected option
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
                                                      value: startDate,
                                                      name: 'dateRange',
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
                  // inputFormat='DD/MM/yyyy'
                  // error={error}
                  format='DD/MM/YYYY'
                  value={toMomentOrNull(props.from)}
                  onChange={(date) =>
                    props.handleChange({
                      target: {value: date, name: 'from'},
                    })
                  }
                  views={['year', 'month', 'day']}
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
                  // inputFormat='DD/MM/yyyy'
                  value={toMomentOrNull(props.to)}
                  format='DD/MM/YYYY'
                  onChange={(date) =>
                    props.handleChange({
                      target: {value: date, name: 'to'},
                    })
                  }
                  views={['year', 'month', 'day']}
                  fullWidth={true}
                  slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
                />
              </LocalizationProvider>
            </Grid>

            {(props.pageType !== '/salesOrders' && props.pageType !== '/deliveryChallan') && <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Autocomplete
                value={formValue.status !== '' ? formValue.status || [] : []}
                onChange={(event, newValue) => {
                  setFormValue({
                    ...formValue,
                    status:  newValue || '',
                  });
                  if (props.setFilterValues) {
                    props.setFilterValues('status', newValue);
                  }
                }}
                disablePortal
                name='Status'
                id='combo-box-demo'
                options={_.uniqBy(deliverStatus, 'status')}
                getOptionLabel={(option) => option.status || ''}
                fullWidth={true}
                renderInput={(params) => (
                  <TextField 
                  {...params} 
                  label='Status' 
                  variant='filled'
                  />
                )}
                ListboxProps={{
                  style: {
                    maxHeight: "170px",
                  },
                }}
                componentsProps={{
                   paper: {
                sx: {
                  '& .MuiAutocomplete-noOptions': {
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 50,
                  },
                    },
                  },
                }}
  
              />
            </Grid>}

             {(props.pageType !== '/salesOrders' && props.pageType !== '/deliveryChallan') && <Grid
               size={{
                 lg: 12,
                 md: 12,
                 sm: 12,
                 xs: 12
               }}>
              <Autocomplete
                value={formValue.payment_status !== '' ? formValue.payment_status || [] : []}
                onChange={(event, newValue) => {
                  setFormValue({
                    ...formValue,
                    payment_status:  newValue || '',
                  });
                  if (props.setFilterValues) {
                    props.setFilterValues('payment_status', newValue);
                  }
                }}
                disablePortal
                name='payment_status'
                id='combo-box-demo'
                options={_.uniqBy(paymentStatusn, 'payment_status')}
                getOptionLabel={(option) => option.payment_status || ''}
                fullWidth={true}
                renderInput={(params) => (
                  <TextField 
                  {...params} 
                  label='Payment Status' 
                  variant='filled'
                  />
                )}
                ListboxProps={{
                  style: {
                    maxHeight: "170px",
                  },
                }}
                componentsProps={{
                   paper: {
                sx: {
                  '& .MuiAutocomplete-noOptions': {
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 50,
                  },
                    },
                  },
                }}
  
              />
            </Grid>}

            {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
              <Autocomplete
                multiple
                value={formValue.brand !== '' ? formValue.brand || [] : []}
                noOptionsText="No Brands"
                onChange={(event, newValue) => {
                  setFormValue({
                    ...formValue,
                    brand: newValue.length === 0 ? '' : newValue,
                  });
                }}
                disablePortal
                name='category'
                id='combo-box-demo'
                options={_.uniqBy(productByType, 'brand')}
                getOptionLabel={(option) => option.brand || ''}
                fullWidth='true'
                renderInput={(params) => (
                  <TextField 
                  {...params} 
                  label='Brand' 
                  variant='filled'
                  />
                )}
                ListboxProps={{
                  style: {
                    maxHeight: "170px",
                  },
                }}
                componentsProps={{
                   paper: {
      sx: {
        '& .MuiAutocomplete-noOptions': {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 50,
        },
                    },
                  },
                }}
  
              />
            </Grid> */}

            {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
              <Autocomplete
                multiple
                value={
                  formValue.category !== '' ? formValue.category || [] : []
                }
                noOptionsText="No Categories"
                onChange={(event, newValue) => {
                  setFormValue({
                    ...formValue,
                    category: newValue.length === 0 ? '' : newValue,
                  });
                }}
                disablePortal
                name='category'
                id='combo-box-demo'
                options={_.uniqBy(productByType, 'category')}
                getOptionLabel={(option) => option.category || ''}
                fullWidth='true'
                renderInput={(params) => (
                  <TextField 
                  {...params} 
                  label='Category' 
                  variant='filled' />
                )}
                ListboxProps={{
                  style: {
                    maxHeight: "170px",
                  },
                }}
                componentsProps={{
                  paper: {
                    sx: {
                      '& .MuiAutocomplete-noOptions': {
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 50,
                      },
                    },
                  },
                }}
              />
            </Grid> */}

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
                  formValue.location_id !== 'null' ? formValue.location_id : []
                }
                onChange={(event, newValue) => {
                  setFormValue({
                    ...formValue,
                    location_id: newValue.length === 0 ? 'null' : newValue,
                  });
                  if (props.setFilterValues) {
                    props.setFilterValues('location_id', newValue);
                  }
                }}
                disablePortal
                name='location_id'
                id='combo-box-demo'
                options={_.uniqBy(props.stocklocation, 'location_name')}
                getOptionLabel={(option) => option.location_name || ''}
                fullWidth={true}
                renderInput={(params) => (
                  <TextField 
                  {...params} 
                  label='Location' 
                  variant='filled' />
                )}
              />
            </Grid>
            {/* {(props.pageType !== '/salesOrders' && props.pageType !== '/deliveryChallan') && (
              <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                <Autocomplete
                  multiple
                  value={
                    formValue.payment_type !== '' ? formValue.payment_type : []
                  }
                  onChange={(event, newValue) => {
                    setFormValue({
                      ...formValue,
                      payment_type: newValue.length === 0 ? '' : newValue,
                    });
                  }}
                  disablePortal
                  name='payment_mode'
                  id='combo-box-demo'
                  options={_.uniqBy(props.list_payment_type, 'payment_type')}
                  getOptionLabel={(option) => option.payment_type || ''}
                  fullWidth='true'
                  ListboxProps={{
                    style: {
                      maxHeight: "170px",
                    },
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='payment mode'
                      variant='filled'
                    />
                  )}
                />
              </Grid>
            )} */}
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
                    label='Min Value'
                    value={formValue.min_price}
                    name='min_price'
                    type={'number'}
                    onChange={handleChange}
                    variant='filled'
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
                    label='Max Value'
                    value={formValue.max_price}
                    name='max_price'
                    type={'number'}
                    onChange={handleChange}
                    variant='filled'
                  />
                </Grid>
              </Grid>
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

export default FilterSalesOrder;
