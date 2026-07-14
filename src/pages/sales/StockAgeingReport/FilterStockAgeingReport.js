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
  top: '89%',
  left: '37%',
};

function FilterStockAgeingReport(props) {
  useEffect(() => {
    setFormValue(props.filtedValue);
  }, []);

  useEffect(() => {
    setFormValue(props.filtedValue);
  }, [props.filtedValue]);

  const [formValue, setFormValue] = useState({
    purchase_date: 'null',
    brand: 'null',
    ageing: 'null',
  });
  const [errormsg, seterrormsg] = useState({from: '', to: ''});



  const handleChange = (event) => {
    const {value, name} = event.target;
    setFormValue({...formValue, [name]: value});
    // props.filterHandler(name,value)
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
        <Card sx={style} style={{overflow:'auto', maxHeight:"38pc"}}>

            <div style={{ marginLeft: "16pc" }}>
            <IconButton aria-label="close" onClick={() => props.handleClose(false)}>
            <CloseIcon />
         
            </IconButton>
            </div>

          <Grid container spacing={3} direction={'row'}>
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  name='purchase_date'
                  label='Purchase Date'
                  inputVariant='outlined'
                  // inputFormat='DD/MM/yyyy'
                  // error={error}
                  value={toMomentOrNull(props.purchase_date)}
                  format='DD/MM/YYYY'
                  onChange={(date) =>
                    props.handleChange({
                      target: {value: date, name: 'purchase_date'},
                    })
                  }
                  fullWidth={true}
                  slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
                />
              </LocalizationProvider>
            </Grid>

            {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
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
                  renderInput={(params) => (
                    <TextField {...params} fullWidth={true} />
                  )}
                />
              </LocalizationProvider>
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
                value={formValue.brand !== 'null' ? formValue.brand || [] : []}
                onChange={(event, newValue) => {
                  setFormValue({
                    ...formValue,
                    brand: newValue.length === 0 ? 'null' : newValue,
                  });
                }}
                name='brand'
                id='combo-box-demo'
                options={_.uniqBy(props.product, 'brand')}
                getOptionLabel={(option) => option.brand || ''}
                fullWidth='true'
                  ListboxProps={{
                  style: {
                    maxHeight: "170px",
                  },
                }}
                renderInput={(params) => (
                  <TextField 
                  {...params} 
                  label='Brand'
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
            <TextField
                fullWidth={true}
                id='outlined-name'
                label='Ageing'
                value={formValue.ageing}
                name='ageing'
                type={'number'}
                onChange={handleChange}
                variant='filled'
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

export default FilterStockAgeingReport;
