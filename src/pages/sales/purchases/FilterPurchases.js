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
import { DatePicker, DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";
import context from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import { useDispatch, useSelector } from 'react-redux';
import { InventoryProductAction } from 'redux/actions/product_actions';
import { filterOptions } from 'utils/searchFunc';
import { listVendorIdAndNameAction } from 'redux/actions/vendor_actions';
import moment from 'moment';
import { getDateTimeFormat } from 'utils/getTimeFormat';
import dayjs from 'dayjs';

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
  "&::-webkit-scrollbar": {
    width: 10,
  },

  "&::-webkit-scrollbar-track": {
    // boxShadow: "inset 0 0 5px black",
    borderRadius: 2,
    marginTop: '20px',
    marginBottom: '20px',
  },

  "&::-webkit-scrollbar-thumb": {
    background: "#B2B2B2",
    borderRadius: 2,
  },

  "&::-webkit-scrollbar-thumb:hover": {
    background: "#999",
  }
};

const button = {
  position: 'absolute',
  top: '86%',
  left: '37%',
};

function FilterPurchases(props) {
  const {
    setModalStatusHandler,
    setModalTypeHandler,
    selectData,
    setselectData,
    setLoaderStatusHandler,
    locationId,
    headerLocationId,
    commoncookie,
  } = useContext(context);
 
  const dispatch = useDispatch();

  const {
    productReducer : { inventory_product }, vendorReducer : {vendorIdAndName},
    salesReducer: { getbillingcompanydetails}
  } = useSelector((state) => state);

  // useEffect(() => {
  //   setFormValue(props.filtedValue);
    
  //   if (props.open) {
  //     !inventory_product.length && dispatch(InventoryProductAction(setModalTypeHandler, setLoaderStatusHandler))
  //   }
  // }, []);

  useEffect(() => {
    setFormValue(props.filtedValue);
  }, [props.filtedValue]);

  const [formValue, setFormValue] = useState({});



  const handleChange = (event) => {
    const {value, name} = event.target;
    console.log('handlechange', value, name)
    if (name === 'name') {
      props.filtedValue.product_name = value;
    }
    console.log('filtedvalue')
    setFormValue({...formValue, [name]: value});
    // props.setFiltedValue({...props.filtedValue, [name]: value});
    // props.filterHandler(name,value)
  };

  const clearButton = () => {
    props.setFiltedValue({
      brand: '',
      category: '',
      location_id: 'null',
      payment_type: '',
      max_price: '',
      min_price: '',
    });
  };

  const [rangeOption, setRangeOption] = useState(null);

  const rangeOptions = ['Weekly','Monthly','Quarterly','Half-Yearly','Yearly'];

  console.log(rangeOption,'rangeOption')

  return (
    <>
      <Badge color='secondary' badgeContent={props.count}>
        <FilterAlt onClick={() => {
        props.handleFilterClose(true)
         if(!inventory_product.length){
                      dispatch(InventoryProductAction(
                        setModalTypeHandler,
                        setLoaderStatusHandler,
                      ))
                      }
                      if(!vendorIdAndName.length){
                        dispatch(listVendorIdAndNameAction(
                          setModalTypeHandler,
                          setLoaderStatusHandler,
                        ))
                        }
        }}
        
        />
      </Badge>
      <Modal
        open={props.open}
        onClose={() => props.handleFilterClose(false)}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
        align='left'
      >
        <Card sx={style} style={{overflow:'auto', maxHeight:"48pc"}}>

              <div style={{ marginLeft: "18pc",paddingBottom:1 }}>
              <IconButton aria-label="close" onClick={() => props.handleFilterClose(false)}>
              <CloseIcon />
         
              </IconButton>
              </div>

          <Grid container spacing={2} direction={'row'}>

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
                  inputVariant='outlined'
                  // inputFormat='DD/MM/yyyy'
                  // error={error}
                  // value={props.from === null ? props.from : props.from}
                  // onChange={(date) =>
                  //   props.handleChange({
                  //     target: {value: date, name: 'from'},
                  //   })
                  // }
                   value={props.from ? moment(props.from) : null}
                    onChange={(date) => {
                      props.handleChange({
                      target: { value: date ? date.toDate() : null, name: 'from' },
                    });
                  }}
                  views={['year', 'month', 'day']}
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
                 value={props.to ? moment(props.to) : null}
                  onChange={(date) => {
                    props.handleChange({
                      target: { value: date ? date.toDate() : null, name: 'to' },
                    });
                  }}
                  views={['year', 'month', 'day']}
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
                options={_.uniqBy(inventory_product, 'name')}
                getOptionLabel={(option) => option.name || ''}
                filterOptions={filterOptions}
                fullWidth={true}
                ListboxProps={{
                  style: {
                    maxHeight: "170px",
                  },
                }}
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
                options={_.uniqBy(inventory_product, 'brand')}
                getOptionLabel={(option) => option.brand || ''}
                fullWidth={true}
                ListboxProps={{
                  style: {
                    maxHeight: "170px",
                  },
                }}
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
                options={_.uniqBy(inventory_product, 'category')}
                getOptionLabel={(option) => option.category || ''}
                fullWidth={true}
                ListboxProps={{
                  style: {
                    maxHeight: "170px",
                  },
                }}
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
                fullWidth={true}
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
                  formValue.supplier_id !== 'null' && formValue.supplier_id ? vendorIdAndName.filter( f=> formValue.supplier_id.some(s=> s===f.supplier_id)) || [] : []
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
                options={vendorIdAndName
                  .filter((d) => d.company_name && d.supplier_id && d.supplier_id !== null && d.company_name !== null)}
                getOptionLabel={(option) => option.company_name || ''}
               fullWidth={true}
                ListboxProps={{
                  style: {
                    maxHeight: "170px",
                  },
                }}
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
                 formValue.statusfilter !== 'null' ?formValue.statusfilter || [] : []
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
                fullWidth={true}
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
                        variant="outlined"
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

export default FilterPurchases;
