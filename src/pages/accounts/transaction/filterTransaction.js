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
  IconButton,
} from '@mui/material';
import {FilterAlt} from '@mui/icons-material';
import _, {countBy} from 'lodash';
import { DatePicker, DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import CloseIcon from '@mui/icons-material/Close';
import toMomentOrNull from 'utils/DateFixer';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 330,
  bgcolor: 'background.paper',
  boxShadow: 25,
  p: 4,
  // height: 350,
  borderRadius: 5,
};

const button = {
  position: 'absolute',
  top: '89%',
  left: '37%',
};

function FilterTransaction(props) {
  useEffect(() => {
    setFormValue(props.filteredValue);
  }, []);

  useEffect(() => {
    setFormValue(props.filteredValue);
  }, [props.filteredValue]);

  const [formValue, setFormValue] = useState({});


  const handleChange = (event) => {
    const {value, name} = event.target;
    setFormValue({...formValue, [name]: value});
    // props.filterHandler(name,value)
  };

  return (
    <>
      <Badge color='secondary' badgeContent={props.count || 0}>
        <FilterAlt onClick={() => props.handleClose(true)} />
      </Badge>
      <Modal
        open={props.open}
        onClose={() => props.handleClose(false)}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
        align='right'
      >
        <Card sx={style}>
          <div style={{ marginLeft: "16pc" }}>
            <IconButton aria-label="close" onClick={() => props.handleClose(false)}>
              <CloseIcon />
            </IconButton>
          </div>
          <Grid container spacing={4} direction={'column'}>
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

            <Grid>
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
            {/* <Grid size={{ lg: 12 }}>
              <Button
                onClick={() =>
                  props.ApplyButton(formValue)
                }
                sx={button}
                variant="contained"
              >
                Apply
              </Button>
            </Grid> */}
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

export default FilterTransaction;
