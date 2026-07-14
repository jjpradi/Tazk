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
  Stack,
  Chip,
} from '@mui/material';
import {FilterAlt} from '@mui/icons-material';
import _, {countBy} from 'lodash';
import { DatePicker, DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import {getDateFormat} from 'utils/getTimeFormat';
import {useDispatch, useSelector} from 'react-redux';
import CommonToolTip from 'components/ToolTip';
import CancelIcon from '@mui/icons-material/Cancel';
import moment from 'moment';
import {viewSelfieAttendanceImagesAction} from 'redux/actions/attendance_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import CommonUserAutoComplete from 'utils/commonAutoCompleteForUser';
import toMomentOrNull from 'utils/DateFixer';

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
  top: '86%',
  left: '37%',
};

const FilterSalary = (props) => {
  const {open, from, to, ApplyButton, handleClose, handleOpen, handleChange, handleClear} = props

  const currentYear = new Date().getFullYear();
  const dispatch = useDispatch();
  const {
    attendanceReducer: {selfie_images},
    attendanceReducer: {get_empbasecompany},
    stockLocationReducer: {stocklocation},
    UserCreationReducer: {departmentList},
  } = useSelector((state) => state);

  const monthNames = [
    {id: 1, name: 'January'},
    {id: 2, name: 'February'},
    {id: 3, name: 'March'},
    {id: 4, name: 'April'},
    {id: 5, name: 'May'},
    {id: 6, name: 'June'},
    {id: 7, name: 'July'},
    {id: 8, name: 'August'},
    {id: 9, name: 'September'},
    {id: 10, name: 'October'},
    {id: 11, name: 'November'},
    {id: 12, name: 'December'},
  ];

  const generatePastMonthNamesArray = () => {
    const currentMonth = moment().month();
    const pastMonths = [];
    for (let i = 0; i <= currentMonth; i++) {
      const monthNames = moment().month(i).format('MMM');
      const monthNumber = moment().month(i).format('MM');
      pastMonths.push({id: monthNumber, name: monthNames});
    }
    return pastMonths;
  };

  const pastMonthNames = generatePastMonthNamesArray();

  const previousYears = Array.from({length: 4}, (v, i) => currentYear - i);

  const clearButton = async () => {
    props.handleClear()
    // const date = new Date();
    // await props.setFormValues(`0${date.getMonth() + 1}`, date.getFullYear());

    // await props.handleClose();
  };

  const onKeyDown = (e) => {
    e.preventDefault();
  };
  const storage = getsessionStorage()
 const AdminRole = storage.role_name !== "Employee"
  return (
    <>
      <Badge color='secondary'>
        <CommonToolTip title='filter'>
          <IconButton onClick={() => handleOpen()}>
            <FilterAlt sx={{color: 'rgb(107, 114, 128)'}} />
          </IconButton>
        </CommonToolTip>
      </Badge>
      <Modal
        open={open}
        onClose={() => handleClose()}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
        align='left'
      >
        <Card sx={style}>
          <div style={{marginLeft: '17.2pc'}}>
            <IconButton aria-label='close' onClick={() => handleClose()}>
              <CloseIcon />
            </IconButton>
          </div>
            <Grid container spacing={3} display='flex' justifyContent='center' direction={'row'} >
                        <Grid container spacing={2} size={12}>
       {AdminRole &&
              <Grid size={12}>
                <FormControl fullWidth variant='filled'>
                  <CommonUserAutoComplete
                  searchVal={props.searchVal}
                  requestSearch={props.requestSearch}
                  value={props.value}
                  setValue={props.setValue}
                  type={props.type}
                  searchType={props.searchType}
                  selectedAll={props.selectedAll}
                  setSelectedAll={props.setSelectedAll}
                  />
                </FormControl>
              </Grid>
            }
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
                      value={toMomentOrNull(from)}
                      onChange={(date) =>
                        handleChange({value: date, name: 'from'})
                      }
                      views={['year', 'month', 'day']}
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
                    disableFuture
                    name='to'
                    label='To Date'
                    inputVariant='outlined'
                    format='DD/MM/YYYY'
                    value={toMomentOrNull(to)}
                    onChange={(date) =>
                      handleChange({value: date, name: 'to'})
                    }
                    views={['year', 'month', 'day']}
                    fullWidth={true}
                    slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
                  />
                </LocalizationProvider>
                </Grid>   

             <Grid container spacing={5} pt='15px' style={{ display: 'flex', justifyContent: 'center' }} >
                      <Grid>
                <Button
                  fullWidth
                  onClick={() => clearButton()}
                  variant='contained'
                  color='warning'
                >
                  Clear
                </Button>
              </Grid>
              <Grid>
                <Button
                  fullWidth
                  onClick={() => ApplyButton()}
                  variant='contained'
                >
                  Apply
                </Button>
              </Grid>
            </Grid>
            </Grid>
          </Grid>
        </Card>
      </Modal>
    </>
  );
};

export default FilterSalary;

            {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
              <FormControl fullWidth variant='filled'>
                <InputLabel>Select Month</InputLabel>
                <Select
                  value={month}
                  label='Select Month'
                  required
                  onChange={(e) => {
                    props.setFormValues(e.target.value, year);
                  }}
                >
                  {(year === currentYear ? pastMonthNames : monthNames).map(
                    (m) => {
                      return (
                        <MenuItem key={m.id} value={m.id}>
                          {m.name}
                        </MenuItem>
                      );
                    },
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
              <FormControl variant='filled' fullWidth>
                <InputLabel>Year</InputLabel>
                <Select
                  value={year === null ? null : year || currentYear}
                  name='year'
                  required
                  onChange={(e) => {
                    props.setFormValues(null, e.target.value);
                  }}
                  label='Year'
                >
                  {previousYears
                    .slice()
                    .sort((a, b) => b - a)
                    .map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  <MenuItem value={previousYears}>{}</MenuItem>
                </Select>
              </FormControl>
            </Grid> */}
