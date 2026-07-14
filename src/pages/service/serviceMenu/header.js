import React, { useContext, useEffect, useState } from 'react';
import { Grid, TextField, IconButton, Autocomplete, Tooltip, Typography, Button, Dialog, Divider, DialogContent, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Add } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import context from '../../../context/CreateNewButtonContext';
import { Radio, RadioGroup, FormControl, FormControlLabel, FormLabel } from '@mui/material';
import { listCustomerAction } from 'redux/actions/customer_actions';
import { Card } from '@mui/material';
import { getpreviousdateaction } from 'redux/actions/retail_service_action';
import moment from 'moment';
import { EDIT_RETAIL_SERVICE } from 'redux/actionTypes';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Header({ jSetFormValues, JformValues, type, serviceid, handleChange, setCusOpen, taskStatus, Selectedcustomer, editdata, handleCustomer, selectedStatus, cusOpen, initialFormValues, handleSubmit, handleClickOpen, handlePrint,handleClickClose, customerData, setCustomerData }) {
  let dispatch = useDispatch()
  const navigate = useNavigate()
  const selectedColor = taskStatus.find(status => status.id === JformValues.status);
  const [searchParams, setSearchParams] = useSearchParams();
  type = searchParams.get("type");
  console.log(selectedColor, customerData, 'editconsole');
  const [formValues, setformValues] = useState({
    customer_id: JformValues?.customer_id,
    customer: '',
    radioOption: 'option1'
  });
  console.log(JformValues, 'formcus')
  const [formErrors, setFormErrors] = useState({
    customer: null
  });
  const [previousdate, setpreviousdate] = useState("")
  const [list, setList] = useState(false)
  const [filteredata, setFilteredData] = useState()
  
  // const [printopen, setprintopen] = useState(false)

  const { retailServiceReducer: { listRetailService }, customerReducer: { customer } } = useSelector((state) => state);
  console.log(customerData, 'customerData');
  const {
    setModalStatusHandler,
    setModalTypeHandler,
    setLoaderStatusHandler
  } = useContext(context);

  console.log(listRetailService, formValues.customer, 'listRetailService');
  useEffect(() => {
    dispatch(listCustomerAction())
  }, [])

  useEffect(() => {
    setpreviousdate("")
  }, [Selectedcustomer?.customer_id])

  const dataWithId = listRetailService?.length ? listRetailService?.map((row, index) => ({ ...row, id: index })) : []
  useEffect(() => {
    if (type === 'edit' && editdata) {
      setCustomerData(editdata); 
    }
  }, [type, editdata]);
  useEffect(() => {
    if (editdata?.service_type_id) {
      setformValues((prevState) => ({
        ...prevState,
        radioOption: editdata.service_type_id.toString(),
      }));
    } else {
      setformValues((prevState) => ({
        ...prevState,
        radioOption: '',
      }));
    }
  }, [editdata]);

  const setStateHandler = async (name, value) => {
    let formObj = {};

    formObj = {
      ...formValues,
      [name]: value === '' ? null : value,
    };

    await setformValues(formObj);
    validationHandler(name, value);
  };

  const validationHandler = (name, value) => {
    if (!Object.keys(formErrors).includes(name)) return;

    if (regex[name]) {
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

  const handlechangecustomer = (e, val) => {
    if (val) {
      setCustomerData(val);
    } else {
      setCustomerData(null);
    }
    // console.log(val, 'handlechangecustomer',dataWithId)
    const filteredData = dataWithId?.filter(v => v.customer_id === val?.customer_id);
    // console.log("filteredData",filteredData)
    let event = {
      target: {
        name: 'customer_id',
        value: val?.customer_id
      }
    }
    handleChange(event)
    if (filteredData?.length) {
      setFilteredData(filteredData)
      setList(true)
      jSetFormValues({ ...JformValues, customer_id: val?.customer_id });
    }
  }
  console.log(filteredata, dataWithId, 'firstname')
  // dispatch({ type: EDIT_RETAIL_SERVICE, payload: filteredData[0] })
  // navigate('/jobCard?type=edit')
  const listClose = () => {
    jSetFormValues(initialFormValues)
    setList(false)
    setSearchParams({ type: 'new' });
  }

  const handleRadioChange = (e) => {
    const { value } = e.target;
    setformValues({ ...formValues, radioOption: value });
    let event = {
      target: {
        name: 'service_type_id',
        value: value
      }
    }
    handleChange(event)
  };

  const handleServiceClick = (id) => {
    const filteredData = dataWithId?.filter(v => v.service_id === id);
    dispatch({ type: EDIT_RETAIL_SERVICE, payload: filteredData[0] })
    navigate('/jobCard?type=edit')
    setList(false)
  }
  return (
    <div
      style={{
        padding: '0 10px',
      }}
    >
      <Dialog open={list} onClose={listClose}>
       <Card style={{ padding: '10px' }}>
         <h5>Service Details</h5>
         <TableContainer component={Paper}>
           <Table>
             <TableHead>
               <TableRow>
                 <TableCell>Service ID</TableCell>
                 <TableCell>Date Created</TableCell>
                 <TableCell>Brand</TableCell>
                 <TableCell>Model</TableCell>
                 <TableCell>Action</TableCell>
               </TableRow>
             </TableHead>
             <TableBody>
               {filteredata?.map((v, i) => (
                 <TableRow key={i}>
                   <TableCell>{v?.service_id}</TableCell>
                   <TableCell>{moment(v?.createdAt).format('DD-MM-YYYY')}</TableCell>
                   <TableCell>{v?.brand}</TableCell>
                   <TableCell>{v?.model}</TableCell>
                   <TableCell>
                     <Button 
                       variant="outlined" 
                       onClick={() => handleServiceClick(v?.service_id)}
                     >
                       Open
                     </Button>
                   </TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </TableContainer>
         <Grid style={{ padding: '10px', display: 'flex', justifyContent: 'center' }}>
           <Button variant='outlined' onClick={listClose}>Add New</Button>
         </Grid>
       </Card>
     </Dialog>
      <Card>
        <Grid container>
          <Grid
            size={{
              lg: 4,
              md: 4,
              sm: 6,
              xs: 12
            }}>
            <Typography style={{ fontSize: '12px', fontWeight: '700', color: 'black', margin: '5px 10px 5px 5px' }}>
              Customer Detail
            </Typography>
            <Grid container padding="10px" justifyContent={'space-between'}>
              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Autocomplete
                  id='combo-box-demo'
                  name='customer_id'
                  required={true}
                  value={customerData || null} 
                  onChange={handlechangecustomer}
                  options={customer?.filter(
                    (c) =>
                      c.customer_id &&
                      (c.customer_type === '1' || c.customer_type === '0')

                  )}
                  getOptionLabel={(option) => option.first_name}
                  renderInput={(params) => {
                    const get = { ...params };

                    get.InputProps = {
                      ...params.InputProps,
                      startAdornment: (
                        <Tooltip title='Create New'>
                          <IconButton
                            size='small'
                            onClick={() => {
                              setModalStatusHandler(true);
                              setModalTypeHandler('NewserviceCustomer');
                            }}
                          >
                            <Add fontSize='small' />
                          </IconButton>
                        </Tooltip>
                      ),
                    };

                    return (
                      <TextField
                        {...get}
                        label='Customer'
                        placeholder='Select Customer'
                        fullWidth={true}
                        required={true}
                        variant='filled'
                      />
                    );
                  }}
                />
              </Grid>
              <Grid
                paddingTop='5px'
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <FormControl component="fieldset">
                  <Grid container alignItems="center">
                    <Grid>
                      <FormLabel component="legend" style={{ color: 'grey', marginRight: '10px', fontSize: '12px', fontWeight: '700'  }}>Service Type :</FormLabel>
                    </Grid>
                    <Grid>
                      <RadioGroup
                        row
                        aria-label="options"
                        name="radioOption"
                        value={formValues.radioOption}
                        onChange={handleRadioChange}
                      >
<FormControlLabel 
  value="1" 
  control={<Radio />} 
  label={
    <Typography 
      style={{
        fontSize: '12px', 
        fontFamily: 'Poppins'
      }}
    >
      Walkin
    </Typography>
  } 
/>                        <FormControlLabel value="2" control={<Radio />} label={
    <Typography 
      style={{
        fontSize: '12px', 
        fontFamily: 'Poppins'
      }}
    >
    Pick & Drop
    </Typography> }/>
                        <FormControlLabel
                          value="3"
                          control={<Radio />}
                          label={
                            <Typography 
                              style={{
                                fontSize: '12px', 
                                fontFamily: 'Poppins'
                              }}
                            >
                           Re-entry
                            </Typography> }
                          onClick={() => {
                            if (Selectedcustomer?.customer_id) {
                              dispatch(getpreviousdateaction(Selectedcustomer?.customer_id, setModalTypeHandler, setLoaderStatusHandler, (data) => {
                                if (data?.length > 0) {
                                  setpreviousdate(moment(data[0]?.date).format('DD-MM-YYYY'));
                                } else {
                                  setpreviousdate("");
                                }
                              }));
                            }
                          }}
                        />
                      </RadioGroup>
                    </Grid>
                  </Grid>
                </FormControl>
              </Grid>
              <div>
                {
                  previousdate
                }
              </div>
            </Grid>
          </Grid>
          <Grid
            size={{
              lg: 8,
              md: 8,
              sm: 6,
              xs: 12
            }}>
          <Grid container style={{ width: '100%' }} justifyContent="flex-end">
            <Grid
              gap={2}
              style={{ display: 'flex', flexDirection: 'column', padding: '20px 0 0 20px' }}
              size={{
                lg: 4,
                md: 4,
                sm: 8,
                xs: 8
              }}>
            <Typography 
    marginRight="20px" 
    sx={{ fontSize: '12px', fontFamily: 'Poppins' }}
  >
    Name : {type === 'edit' ? editdata?.first_name : customerData?.first_name || '-'}
  </Typography> 
  <Typography 
    sx={{ fontSize: '12px', fontFamily: 'Poppins' }}
  >
     Mobile : {type === 'edit' ? editdata?.phone_number : customerData?.phone_number || '-'}
  </Typography>
  <Typography 
    sx={{ fontSize: '12px', fontFamily: 'Poppins' }}
  >
   Email : {type === 'edit' ? editdata?.email : customerData?.email || '-'}
  </Typography>
            </Grid>
          
      <Grid
        container
        justifyContent="end"
        margin='20px'
        size={{
          lg: 5.5,
          md: 5.5,
          sm: 3,
          xs: 3
        }}>
        <Button variant='outlined' onClick={handleCustomer} style={{ width: '150px', height: '130px', backgroundColor: selectedColor?.color, color: 'Black', fontSize: '13px'}}>
          {selectedStatus}
        </Button>
      </Grid>
      <Grid
        display='flex'
        justifyContent='flex-end'
        flexDirection='column'
        padding='16px 0px 16px 5px'
        size={{
          lg: 1.5,
          md: 1.5,
          sm: 3,
          xs: 3
        }}>
        <Button variant='contained' color='primary' onClick={handleSubmit} style={{width: '50px', margin:'5px'}}> Save </Button>
        <Button variant='contained' color="error" onClick={handlePrint} style={{width: '50px' , margin:'5px'}}> Print </Button>
        <Button variant='contained' color='secondary' onClick={() => {handleClickOpen()}} style={{width: '50px' , margin:'5px'}}> Back </Button>
      </Grid>
      </Grid>
    
              <Dialog open={cusOpen} onClose={() => setCusOpen(false)}>
                <Grid style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px' }}>
                  <FormControl component='fieldset' style={{ marginLeft: '5px' }}>
                    <Typography style={{ fontSize: '12px', fontWeight: '500', color:'black' }}>Status</Typography>
                    <RadioGroup
  row
  aria-label="Status"
  value={JformValues.status}
  name="status"
  style={{ display: 'flex', flexDirection: 'column' }}
  onChange={handleChange}
>
  {taskStatus?.map((e) => (
    <FormControlLabel
      key={e.id}
      value={e.id}
      control={<Radio style={{ color: e.color }} />}
      label={
        <span style={{ fontSize: '12px', fontFamily: 'Poppins, sans-serif' }}>
          {e.status_name}
        </span>
      }
    />
  ))}
</RadioGroup>

                  </FormControl>
                </Grid>
              </Dialog>
            </Grid>
          </Grid>
        
      </Card>
    </div>
  );
}
