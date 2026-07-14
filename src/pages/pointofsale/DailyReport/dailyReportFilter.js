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
import {FilterAlt, SettingsPowerRounded } from '@mui/icons-material';
import _, {countBy} from 'lodash';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import {getDateFormat} from '../../../utils/getTimeFormat';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";
import moment from 'moment';
import toMomentOrNull from 'utils/DateFixer';



const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  // width: 330,
  bgcolor: 'background.paper',
  boxShadow: 25,
  p: 4,
  // height: 510,
  borderRadius: 5,
};

const button = {
  position: 'absolute',
  top: '86%',
  left: '37%',
};

function DailyReportFilter(props) {
  useEffect(() => {
    
    setDate(props.date);
    setFormValue({date : props.date,cash_box_id: props.cash_box_id, cashboxname:props.cash_box_name, cash_box_ledger_id:props.cash_box_ledger_id })
  
  }, [props.date, props.cash_box_id]);

  const [formValue, setFormValue] = useState({cash_box_id:null, cashboxname:null, cash_box_ledger_id: null});
  const [date, setDate] = useState('');


 

  const handleChange = (event) => {
    const {value, name} = event.target;
    if (name === 'name') {
      formValue.product_name = value;
    }
    setFormValue({...formValue, [name]: value});
    // props.filterHandler(name,value)
  };

  const clearButton = () => {
    const currentDate = moment().format('YYYY-MM-DD');
    setDate(currentDate);
  };

  const onKeyDown = (e) => {
    e.preventDefault();
  };

  return (
    <>
      {/* <Badge color="secondary" badgeContent={props.count}>
        <FilterAlt onClick={() => props.handleClose(true)} />
      </Badge> */}
      <Modal
        open={props.open}
        onClose={() => props.handleClose(false)}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
        align='center'
      >
        <Card sx={style}>
          
        <div style={{ marginLeft: "15pc" }}>
                <IconButton aria-label="close" onClick={() => props.setClose(false)}>
                  <CloseIcon />
                 
                </IconButton>
              </div>

          <Grid container spacing={3} direction={'column'}>
            <Grid>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  label='Date'
                  // inputFormat='DD/MM/yyyy'
                  name='date'
                  format='DD/MM/YYYY'
                  value={toMomentOrNull(date)}
                  inputVariant='contained'
                  disableFuture                 
                  onChange={(e, v) => {
                    setDate(getDateFormat(e));
                  }}
                  views={['year', 'month', 'day']}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            {/* <Grid>
            <Autocomplete
                  value={formValue.cash_box_id !== null? props.cash_box_adjustment_list.filter(f=>f.id === formValue.cash_box_id)[0] : {name:''}}
                  name='cash_box_id'
                  fullWidth={true}
                  onChange={(event, newValue) => {
                    // handleChange({target : {name : 'cash_box_id' , value : newValue.id}});
                      setFormValue({...formValue, cash_box_id:newValue.id,cashboxname:newValue.name, cash_box_ledger_id: newValue.ledger_id});
                  }}
                  options={_.uniqBy(props.cash_box_adjustment_list,'name')}
                  getOptionLabel={(option) => option.name}                
                  renderInput={(params) => <TextField {...params}
                   variant="outlined"
                    // error={formErrors.cash_box_id === null ? false : true} 
                    //  helperText={formErrors.cash_box_id === null ? '' : formErrors.cash_box_id}
                      label='Cash Box'
                      //  required={true} 
                       />}
              />
            </Grid> */}
          </Grid>

              <Grid container spacing={7} display= 'flex' justifyContent='center' alignItems='center' p='20px 0px 5px 0px'>
                {/* <Grid size={{ xs: 3, sm: 2, md: 2, lg: 2 }}>

            </Grid> */}

                {/* <Box> */}
                <Grid>
                {/* <Grid size={{ xs: 3, sm: 9, md: 9, lg: 9 }}> */}
                  <Button
                    onClick={() => props.handleClose()}
                    // sx={button}
                    variant='contained'
                    color='secondary'
                  >
                    Clear
                  </Button>
                  {/* </Box> */}
                </Grid>

                {/* <Grid size={{ xs: 3, sm: 3, md: 3, lg: 3 }}> */}
                <Grid>
                  <Button
                    onClick={() => props.ApplyButton(date, formValue.cash_box_id, formValue.cashboxname, formValue.cash_box_ledger_id)}
                    // sx={button}
                    variant='contained'
                  >
                    Apply
                  </Button>
                </Grid>
                </Grid>

          {/* <Button
            onClick={() =>
              props.ApplyButton(date)
            }
            sx={button}
            variant="contained"
          >
            Apply
          </Button> */}

          {/* <Button onClick={()=>props.ApplyButton()} sx={button} variant="contained">
        Apply
      </Button> */}
        </Card>
      </Modal>
      {/* </Grid> */}
      {/* </div>       */}
    </>
  );
}

export default DailyReportFilter;
