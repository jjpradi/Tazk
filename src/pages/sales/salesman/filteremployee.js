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

function FilterEmployee(props) {
  useEffect(() => {
    setFormValue(props.filtedValue);
  }, []);

  useEffect(() => {
    setFormValue(props.filtedValue);
  }, [props.filtedValue]);

  const [formValue, setFormValue] = useState({
    // from: 'null',
    // to: 'null',
    // brand: 'null',
    // category: 'null',
    // location_id: 'null',
    // payment_type: 'null',
    customer:'null',
    employee:'null',
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
        <Card sx={style} style={{overflow:'auto', maxHeight:"38pc" , minHeight:'30pc'}}>

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
                multiple
                value={
                  formValue.customer !== 'null' && formValue.customer ? props.salesmancustomer.filter( f=> formValue.customer.some(s=> s===f.customer_id)) || [] : []
                }
                onChange={(event, newValue) => {
                  setFormValue({
                    ...formValue,
                    customer: newValue.length === 0 ? 'null' : newValue.map((d)=> d.customer_id),
                    //customer:  newValue.filter((d)=> {return  d.customer_id}),
                  });
                 
                }}
                
                disablePortal
                name='customer'
                id='combo-box-demo'
                // options={_.uniqBy(props.salesmancustomer, 'company_name')}
                options={_.uniqBy(props.salesmancustomer?.
                    filter(
                  (c) =>c.customer_id !==null&&
                     c.customer_type === '0'? c.first_name : c.company_name

                )
                )}
                getOptionLabel={(option) =>  option.customer_type === '0'? option.first_name : option.company_name ||''}
                fullWidth='true'
                renderOption={(props, option) => {
                  return (
                    <li {...props} key={option.customer_id}>
                      {option.customer_type === '0'? option.first_name : option.company_name }
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField {...params} label='Customer' variant='outlined' />
                )}
              />
              <br/>
              <Autocomplete
                multiple
                value={
                  formValue.employee !== 'null' && formValue.employee ? _.uniqBy(props.customer_mapping, 'username').filter( f=> formValue.employee.some(s=> s===f.employee_id)) || [] : []
                }
                onChange={(event, newValue) => {
                  setFormValue({
                    ...formValue,
                    employee: newValue.length === 0 ? 'null' : newValue.map((d)=> d.employee_id),
                    //customer:  newValue.filter((d)=> {return  d.customer_id}),
                  });
                 
                }}
                
                disablePortal
                name='customer'
                id='combo-box-demo'
                // options={_.uniqBy(props.salesmancustomer, 'company_name')}
                options={_.uniqBy(props.customer_mapping, 'username')}
                getOptionLabel={(option) => option.username || ''}
                fullWidth='true'
                renderOption={(props, option) => {
                  return (
                    <li {...props} key={option.employee_id}>
                      {option.username}
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField {...params} label='Employee
                  ' variant='outlined' />
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

export default FilterEmployee;
