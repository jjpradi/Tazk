import React, {useState, useEffect, useRef, useContext} from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Autocomplete, Button, Grid, TextField } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { customerAsCompanyAction } from 'redux/actions/customer_actions';
import { paymentview } from 'redux/actions/purchase_actions';
import context from '../../../context/CreateNewButtonContext';
import { listSalesOutstandingAction, saleIdGET } from 'redux/actions/sales_actions';
import apiCalls from 'utils/apiCalls';
import PaymentPage from '../paymentSalesPurchase/index';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function NewPayments(props) {
  const [value, setValue] = React.useState(0);
  const [formValues, setFormValues] = useState({
    customer_id: null,
    supplier_id: null,  
  });

  const dispatch = useDispatch();
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(context);

  const {
    purchasesReducer: {purchase_outstanding},
  } = useSelector((state) => state);

  const setStateHandler = (name, value) => {
    let formObj = {};
    formObj = {
      ...formValues,
      [name]: value === '' ? null : value,
    };

    setFormValues(formObj);
   // validationHandler(name, value);
  };
  const validationHandler = (name, value) => {
    if (!Object.keys(formErrors).includes(name)) return;

    if (
      requiredFields.includes(name) &&
      (value === null ||
        value === 'null' ||
        value === '' ||
        value === false ||
        (Object.keys(value) && value.value === null))
    ) {
      setFormErrors({
        ...formErrors,
        [name]: capitalize(name) + ' is Required!',
      });
    } else if (regex[name]) {
      if (!regex[name].test(value)) {
        setFormErrors({
          ...formErrors,
          [name]: capitalize(name) + ' is Invalid!',
        });
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
      }
    } else {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };
  const {
    customerReducer: { customerAsCompany },
    salesReducer: { sale_outstanding, sale_id_get }
  } = useSelector((state) => state);

  const handleSubmit = () =>{
  //  if(props.type === 1){
  //   let value = purchase_outstanding?.filter((d)=> d.supplier_id === formValues.supplier_id) || [];
  //   if(value.length >0) {
  //   let data = {
  //     supplier_id:  value[0]?.supplier_id,
  //     receivings_items:value[0]?.childRow[0]?.receivings_items,
  //     paid_amount : value[0]?.paid_amount,
  //     receiving_id : value[0]?.receiving_id,
  //     receive_goods : value[0]?.receive_goods,
  //     total : value[0]?.total,
  //   }
  //    props.pendingPayment(data) 
  //    }else{
  //     alert('No invoice for Payment')
  //    }
    
  //  }else{
  //   let datas = sale_outstanding?.filter((d)=> d.customer_id === formValues.customer_id) || [];
  //   if(datas.length > 0){
  //   apiCalls(
  //     setModalTypeHandler,
  //     setLoaderStatusHandler,
  //     dispatch(
  //       saleIdGET(
  //         formValues.customer_id,
  //         setModalTypeHandler,
  //         setLoaderStatusHandler,
  //         (response)=>{
  //           if (response === 200) {
  //            props.pendingPayment(sale_id_get[0],datas[0].childRow )
  //           }}
  //       ),
  //     ),
  //   );}
  //   else{
  //     alert('No invoice for Payment')
  //   }
  //   // let value = sale_outstanding?.filter((d)=> d.customer_id === formValues.customer_id) || [];
  //   // let data = {
  //   //   customer_id:  value[0].customer_id,
  //   // }
  //   // value.length ? props.pendingPayment(data) : alert('No invoice for Payment')
  //  }
    }

  const body = {
    pageCount : 0,
    numPerPage : 10
  }

  useEffect(() => {
    !customerAsCompany.length && dispatch(customerAsCompanyAction())
   
  },[])
    useEffect(() => {
        if(formValues.supplier_id !== null){
            dispatch(paymentview(body,commoncookie,headerLocationId,setModalTypeHandler,setLoaderStatusHandler))
        }
    }, [formValues.supplier_id])
    useEffect(()=>{
      if(formValues.customer_id !== null){
        dispatch(
          listSalesOutstandingAction(
            body,
            commoncookie,
            headerLocationId,
            setModalTypeHandler,
            setLoaderStatusHandler,
          )
        )
      }
    },[formValues.customer_id])

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label={props.type === 0 ? 'Receipt': 'Payment'} {...a11yProps(0)} />
            <Tab label= {props.type === 0 ? 'CustomerAdvance': 'VendorAdvance'}{...a11yProps(1)} />
            {/* <Tab label="Item Three" {...a11yProps(2)} /> */}
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
        <Grid spacing={3} container direction='row' sx={{paddingTop: 5}}>
          <Grid
            size={{
              lg: 4,
              md: 4,
              sm: 4,
              xs: 12
            }}>
            <Autocomplete
              id='multiple-limit-tags'
             // disabled={props.status === 'edit' ? true : false}
              defaultValue={
              //   !_.isEmpty(props.edit_id_data)
              //     ? 
              //     // props.edit_id_data[0]
              //     customerAsCompany.filter(
              //         (d) => d.customer_id === props.edit_id_data[0]?.customer_id || d.supplier_id === props.edit_id_data[0]?.supplier_id,
              //         // (d) => props.type === 'C'?
              //         // d.customer_id ===
              //         // props.edit_id_data[0].customer_id : props.edit_id_data[0].supplier_id ,
              //       )[0] || undefined
              //     : 
                  customerAsCompany.filter(
                      (d) => d.customer_id === formValues?.customer_id || d.supplier_id === formValues?.supplier_id,
                    )[0]
              }
             
              options=
              {customerAsCompany.filter((c) =>
                props.type === 0

                  ? c.company_name !== null && c.customer_type === '1'
                  : c.supplier_id,
              )}
              fullWidth
              getOptionLabel={(option) => option.company_name}
              onChange={(e, c) => {
                setStateHandler(
                  props.type === 0 ? 'customer_id' : 'supplier_id',
                  c === null ? '' : props.type === 0 ? c.customer_id : c.supplier_id,
                )
              }}
              renderOption={(props, option) => {
                return (
                  <li {...props} key={option.person_id}>
                    {option.company_name}
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth={true}
                  required={true}
                  variant='outlined'
                  label={props.type === 0 ? 'Select Customer': 'Select Vendor'}
                  placeholder='Select Customer'
                  // error={formErrors[activeType] === null ? false : true}
                  // helperText={
                  //   formErrors[activeType] === null ? '' : formErrors[activeType]
                  // }
                />
              )}
            />
          </Grid>
          </Grid>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          Advance
        </CustomTabPanel>
        {/* <CustomTabPanel value={value} index={2}>
          Item Three
        </CustomTabPanel> */}
      </Box>
      <PaymentPage
            selectionModel={props.selectionModel}
            setSelectionModel={props.setSelectionModel}
            getPay={props.getPay}
            entryvalue = {props.entryvalue}
            handleEntry = {props.handleEntry}
            status={props.status}
            received_amount={props.received_amount}
            handleSubmit={handleSubmit()}
            custType={props.custType}
            handleClose={props.handleClose()}
            setTdata={props.setTdata}
            Tdata={props.Tdata}
            custData={props.custData}
            sales_items={props.sales_items}
            activeINV={props.activeINV}
            mail_configuration={props.mail_configuration}
            responseType={props.responseType}
            manualNoteSchemes={props.manualNoteSchemes}
            setManualNoteSchemes={props.setManualNoteSchemes}
          />
      <Grid
        style={{paddingTop: '25px'}}
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
            <Grid spacing={7} container direction='row' display= 'flex' justifyContent= 'flex-end'>
              <Grid>    
                  <Button
                    onClick={()=> props.handleClose()}
                    style={{}}
                    name='Cancel'
                    variant='contained'
                    color='secondary'
                    size='medium'
                    text='button'
                    fullWidth={false}
                    type='cancel'
                  >
                    cancel
                  </Button>
            
              </Grid>

              <Grid>
                <Button
                  onClick={()=> handleSubmit()}
                  disabled = {props.type === 0 ? formValues.customer_id === null ? true : false : formValues.supplier_id === null ? true : false}
                  style={{}}
                  name='SUBMIT'
                  variant='contained'
                  color='primary'
                  size='medium'
                  text='button'
                  fullWidth={false}
                  type='submit'
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
          </Grid>
    </>
  );
}