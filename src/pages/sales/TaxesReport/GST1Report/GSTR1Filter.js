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
  Dialog,
} from '@mui/material';
import {FilterAlt} from '@mui/icons-material';
import _, {countBy} from 'lodash';
import { DatePicker, DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
// import dayjs from 'dayjs';
import { getDateTimeFormat } from 'utils/getTimeFormat';
import toMomentOrNull from '../../../../utils/DateFixer';

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


function GSTR1Filter(props) {
  console.log("props",props)
  const dispatch = useDispatch();
  const {
    salesReducer: { getbillingcompanydetails},
    paymentMethodReducer: {list_payment_type},
    stockLocationReducer:{stocklocation},
    productReducer:{product}
  } = useSelector((state) => state);

    const [rangeOption, setRangeOption] = useState('This Month');
  
    const rangeOptions = ['Today','Yesterday','This Week','Last Week','Last 7 Days','This Month','Last Month','This Quater','Last Quater','Current Fiscal Year','Previous Fiscal Year','Last 365 days'];

    console.log(props.open,'prposdssds')

  return (
    <>
      <IconButton component="span" onClick={() => props.handleOpen()}>
        <FilterAlt  />
      </IconButton>
      <Dialog
    open={props.open}
    onClose={() => props.handleClose()}
    fullWidth
    PaperProps={{
      sx: {
        zIndex: 2000,       // Forces it to appear on top
        position: 'relative',
        overflow: 'visible',
      },
    }}
  >
          <Card sx={{ ...style, overflow: 'hidden', maxHeight: '80vh' }}>

               <div style={{ display: 'flex', justifyContent: 'end',marginBottom : '10px' }}>
              <IconButton aria-label="close" onClick={() => props.handleClose(false)}>
              <CloseIcon />
           
              </IconButton>
              </div>

            <Grid container spacing={4} direction={'row'} display= 'flex' justifyContent='center' alignItems='center'>

               <Grid
                 size={{
                   lg: 12,
                   md: 12,
                   sm: 12,
                   xs: 12
                 }}>
                                <Autocomplete
                                  options={rangeOptions}
                                  value={rangeOption|| null}
                                  onChange={(event, newValue) => {
                                    console.log(newValue, 'newValuesds');
                                    setRangeOption(newValue);
                                    
                                    
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
                                      console.log(endDate,'startDate',startDate)
                                    props.handleChange({
                                        target: {
                                          name: 'dateRange',
                                          value: startDate.format('YYYY-MM-DD'),
                                          value1: endDate.format('YYYY-MM-DD'),
                                          value2: newValue
                                        }
                                      });
                                    
                                  }}
                  ListboxProps={{
                    style: {
                      maxHeight: "170px",
                    },
                  }}
                                  renderInput={(params) => (
                                    <TextField {...params} label="Select Range" fullWidth variant='filled' />
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
                    format='DD/MM/YYYY'
                    // inputFormat='DD/MM/yyyy'
                    // error={error}
                     value={props.from ? toMomentOrNull(props.from) : null}
                                                        onChange={(dates) => {
                                                          handleChange({
                                                            target: { value: dates ? getDateTimeFormat(dates.$d) : null, name: 'from' },
                                                          })
                                                        }
                                                        }
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
                    format='DD/MM/YYYY'
                    //  format="DD/MM/yyyy"
                    // inputFormat='DD/MM/yyyy'
                     value={props.to ? toMomentOrNull(props.to) : null}
                                                        onChange={(dates) => {
                                                          handleChange({
                                                            target: { value: dates ? getDateTimeFormat(dates.$d) : null, name: 'to' },
                                                          })
                                                        }
                                                        }
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
                                  // error={!!formErrors.tax_id}
                                  // helperText={formErrors.tax_id ? "Billing GST is required!" : ""}
                              />
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
                        onClick={() => props.ApplyButton()}
                        variant='contained'
                      >
                        Apply
                      </Button>
                    </Grid>
                  </Grid>
          </Card>
        </Dialog>
    </>
  );
}

export default GSTR1Filter;
