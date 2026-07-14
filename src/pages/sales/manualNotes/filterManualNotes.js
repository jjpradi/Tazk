import React, { useEffect, useState } from 'react';
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
import { FilterAlt } from '@mui/icons-material';
import _, { countBy, debounce } from 'lodash';
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
  p: 6,
  // height: 550,
  borderRadius: 5,
};

const button = {
  position: 'absolute',
  top: '89%',
  left: '37%',
};

function FilterManualNotes(props) {
  useEffect(() => {
    setFormValue(props.filteredValue);
  }, []);

  useEffect(() => {
    setFormValue(props.filteredValue);
  }, [props.filteredValue]);

  const [formValue, setFormValue] = useState({});
  const [error, setError] = useState({ minValue: false, maxValue: false });

  const handleChange = (event) => {
    const { value, name } = event.target;
    setFormValue({ ...formValue, [name]: value });
    // props.filterHandler(name,value)
  };

  const debouncedHandleChange = React.useMemo(
    () => debounce(props.handleChange, 500),
    [props.handleChange]
  );

  const [rangeOption, setRangeOption] = useState(null);

  const rangeOptions = ['Today', 'Yesterday', 'This Week', 'Last Week', 'Last 7 Days', 'This Month', 'Last Month', 'This Quater', 'Last Quater', 'Current Fiscal Year', 'Previous Fiscal Year', 'Last 365 days']


  console.log(props.range,'sadajhsda')

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
          <Grid container spacing={6} direction={'column'}>
            {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  name='from'
                  label='From Date'
                  inputVariant='outlined'
                  // inputFormat='DD/MM/yyyy'
                  // error={error}
                  value={props.from === null ? props.from : props.from}
                  onChange={(date) =>
                    props.handleChange({
                      target: {value: date, name: 'from'},
                    })
                  }
                  fullWidth={true}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth={true} variant='filled'/>
                  )}
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
                  value={props.to === null ? props.to : props.to}
                  onChange={(date) =>
                    props.handleChange({
                      target: {value: date, name: 'to'},
                    })
                  }
                  fullWidth={true}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth={true} variant='filled'/>
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
                                            options={rangeOptions}
                                            value={props.range || ''}
                                            onChange={(event, newValue) => {
                                                    props.handleChange({
                                                      target: { name: 'range', value: newValue}
                                                  });
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
                                                // setFromDate(startDate)
                                                // setToDate(endDate)

                                                  props.handleChange({
                                                      target: { name: 'from', value: startDate}
                                                  });
                                                   props.handleChange({
                                                      target: { name: 'to', value: endDate}
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
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <DatePicker
                      label='From'
                      value={toMomentOrNull(props.from)}
                      onChange={(date) =>
                        props.handleChange({
                          target: {name: 'from', value: date},
                        })
                      }
                      format='DD/MM/YYYY'
                      slotProps={{
                          textField: {
                            variant: 'filled',
                            fullWidth: true,
                            sx: {
                              '& .MuiInputBase-input': {
                                fontSize: '0.85rem',
                                paddingRight: '0px', 
                              },
                              '& .MuiInputAdornment-root': {
                                marginLeft: '4px',
                              }
                            }
                          },
                        }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <DatePicker
                      label='To'
                      value={toMomentOrNull(props.to)}
                      onChange={(date) =>
                        props.handleChange({
                          target: {name: 'to', value: date},
                        })
                      }
                      format='DD/MM/YYYY'
                      slotProps={{
                          textField: {
                            variant: 'filled',
                            fullWidth: true,
                            sx: {
                              '& .MuiInputBase-input': {
                                fontSize: '0.85rem',
                                paddingRight: '0px', 
                              },
                              '& .MuiInputAdornment-root': {
                                marginLeft: '4px',
                              }
                            }
                          },
                        }}
                    />
                  </Grid>
                </Grid>
              </LocalizationProvider>
            </Grid>


            <Grid>
              <Autocomplete
                disablePortal
                options={
                  props.for === "credit_note" ?
                    [
                      { label: 'Sales Return', value: 'S_R' },
                      { label: 'Manual Credit Note', value: 'C_N' }
                    ] :
                    [
                      { label: 'Purchase Return', value: 'P_R' },
                      { label: 'Manual Debit Note', value: 'D_N' }
                    ]
                }
                getOptionLabel={(option) => option.label}
                value={
                  props.for === "credit_note" ?
                    [
                      { label: 'Sales Return', value: 'S_R' },
                      { label: 'Manual Credit Note', value: 'C_N' }
                    ].find((opt) => opt.value === props.type) || null
                    :
                    [
                      { label: 'Purchase Return', value: 'P_R' },
                      { label: 'Manual Debit Note', value: 'D_N' }
                    ].find((opt) => opt.value === props.type) || null
                }
                onChange={(event, newValue) => {
                  props.handleChange({
                    target: { name: 'type', value: newValue ? newValue.value : null }
                  });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Type" variant="filled" fullWidth />
                )}
              />
            </Grid>


            <Grid>
              <Autocomplete
                multiple
                value={props.location_id || []}
                onChange={(event, newValue) => {
                  props.handleChange({
                    target: { name: 'location_id', value: newValue }
                  })
                }}
                options={_.uniqBy(props.stocklocation, 'location_name')}
                getOptionLabel={(option) => option.location_name || ''}
                renderInput={(params) => (
                  <TextField {...params} label='Location' variant='filled' />
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
                    label='Min Value'
                    value={formValue.minValue || ''}
                    name='minValue'
                    type={'number'}
                    onChange={(e) => {
                      const value = e.target.value;
                      const updatedForm = { ...formValue, minValue: value };
                      setFormValue(updatedForm);

                      debouncedHandleChange({ target: { name: 'minValue', value } });
                    }}

                    variant='filled'
                    error={error.minValue}
                    helperText={error.minValue ? 'Min value cannot be greater than Max value' : ''}

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
                    value={formValue.maxValue || ''}
                    name='maxValue'
                    type={'number'}
                    onChange={(e) => {
                      const value = e.target.value;
                      const updatedForm = { ...formValue, maxValue: value };
                      setFormValue(updatedForm);

                      debouncedHandleChange({ target: { name: 'maxValue', value } });
                    }}

                    variant='filled'
                    error={error.maxValue}
                    helperText={error.maxValue ? 'Max value cannot be less than Min value' : ''}

                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Grid
            container
            spacing={7} display='flex' justifyContent='center' alignItems='center' p='20px 0px 5px 0px'
          >
            <Grid>
              <Button
                onClick={() => props.clearButton()}
                // sx={button}
                variant='contained'
                color='secondary'
              >
                Clear
              </Button>
            </Grid>

            <Grid>
              <Button
                onClick={() =>

                  props.ApplyButton(formValue)}
                variant='contained'
                disabled={error.minValue || error.maxValue}
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

export default FilterManualNotes;
