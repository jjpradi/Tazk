import React, {useEffect, useState,useContext} from 'react';
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
import { useDispatch,useSelector } from 'react-redux';
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import { listProductAction } from 'redux/actions/product_actions';
import context from '../../../context/CreateNewButtonContext';
import { listPaymentTypeDetails } from 'redux/actions/payment_method_actions';
import { listBalancesheetAccountsAction } from 'redux/actions/balancesheet_actions';
import moment from 'moment';
import toMomentOrNull from 'utils/DateFixer';
import CommonToolTip from 'components/ToolTip';


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

function FilterPossale(props) {
  let date = new Date();
  let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  useEffect(() => {
    setFormValue(props.filtedValue);
  }, []);

  // useEffect(() => {
  //   setFormValue(props.filtedValue);
  // }, [props.filtedValue]);


  const { stockLocationReducer: { stocklocation},productReducer:{product} ,paymentMethodReducer:{list_payment_type} ,balancesheetReducer:{balancesheet}  } = useSelector(state => state)

  const { commoncookie, setModalTypeHandler, setLoaderStatusHandler, headerLocationId, } = useContext(context);
  
  const dispatch = useDispatch();
  // useEffect(() => {
  //   if (!stocklocation.length && props.open) { dispatch(listStockLocationAction(commoncookie,headerLocationId,setModalTypeHandler, setLoaderStatusHandler)); }
  //    if (!product.length && props.open) { dispatch(listProductAction(setModalTypeHandler, setLoaderStatusHandler)); }
  //   if (!list_payment_type.length && props.open) { dispatch(listPaymentTypeDetails(setModalTypeHandler, setLoaderStatusHandler)); }
  //   // if (!balancesheet.length && props.open) 
  //   // { dispatch( listBalancesheetAccountsAction(
  //   //   moment(firstDay, 'year', 'month', 'day').format('yyyy-MM-DD'),
  //   //   moment(lastDay, 'year', 'month', 'day').format('yyyy-MM-DD'),
  //   //   )) }

  // }, [])


  const [formValue, setFormValue] = useState({
    from: 'null',
    to: 'null',
    brand: 'null',
    category: 'null',
    location_id: 'null',
    payment_type: 'null',
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
    props.clearButton()
  };
  const onKeyDown = (e) => {
    e.preventDefault();
  };
  

  return (
    <>
      <Badge color='secondary' badgeContent={props.count}>
        <CommonToolTip title='filter'>
          <IconButton onClick={() => props.handleOpen(true)}>
            <FilterAlt sx={{color: 'rgb(107, 114, 128)', fontSize: 20}} onClick={() => props.handleClose(true)} />
          </IconButton>
        </CommonToolTip>
      </Badge>
      <Modal
        open={props.open}
        onClose={() => props.handleClose(false)}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
        // align='right'
      >
        <Card sx={style} style={{overflow:'auto', maxHeight:"38pc"}}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <Typography variant='h6'>Filter</Typography>
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
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  name='from'
                  label='From Date'
                  inputVariant='outlined'
                  // inputFormat='DD/MM/yyyy'
                  // error={error}
                  value={toMomentOrNull(props.from)}
                  format='DD/MM/YYYY'
                  onChange={(date) =>
                    props.handleChange({
                      target: {value: date, name: 'from'},
                    })
                  }
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
                  value={toMomentOrNull(props.to)}
                  format='DD/MM/YYYY'
                  views={['year', 'month', 'day']}
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
                fullWidth
                value={formValue.brand !== 'null' ? formValue.brand || [] : []}
                onChange={(event, newValue) => {
                  setFormValue({
                    ...formValue,
                    brand: newValue.length === 0 ? 'null' : newValue,
                  });
                }}

                name='category'
                id='combo-box-demo'
                options={_.uniqBy(product, 'brand')}
                getOptionLabel={(option) => option.brand || ''}
                renderInput={(params) => (
                  <TextField {...params} label='Brand' variant='filled' fullWidth />
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
                fullWidth
                value={
                  formValue.category !== 'null' ? formValue.category || [] : []
                }
                onChange={(event, newValue) => {
                  setFormValue({
                    ...formValue,
                    category: newValue.length === 0 ? 'null' : newValue,
                  });
                }}
                name='category'
                id='combo-box-demo'
                options={_.uniqBy(product, 'category')}
                getOptionLabel={(option) => option.category || ''}
                renderInput={(params) => (
                  <TextField {...params} label='Category' variant='filled' fullWidth />
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
                fullWidth
                value={
                  Array.isArray(formValue.location_id)
                    ? formValue.location_id
                    : []
                }
                onChange={(event, newValue) => {
                  setFormValue({
                    ...formValue,
                    location_id: newValue.length === 0 ? 'null' : newValue,
                  });
                }}
                name='location_id'
                id='combo-box-demo'
                options={_.uniqBy(stocklocation, 'location_name')}
                getOptionLabel={(option) => option.location_name || ''}
                renderInput={(params) => (
                  <TextField {...params} label='Location' variant='filled' fullWidth />
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
                fullWidth
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
                options={_.uniqBy(list_payment_type, 'payment_type')}
                getOptionLabel={(option) => option.payment_type || ''}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Payment Mode'
                    variant='filled'
                    fullWidth
                  />
                )}
              />
            </Grid>
          </Grid>

          <Grid container spacing={7} display= 'flex' justifyContent='center' alignItems='center' p='20px 0px 5px 0px' >
                  <Grid>
                    <Button
                      onClick={clearButton}
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

export default FilterPossale;
