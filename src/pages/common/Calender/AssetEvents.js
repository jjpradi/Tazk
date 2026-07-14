import {
    Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  Dialog,
  Divider,
  Drawer,
  Fade,
  Grid,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { padding, Stack, styled} from '@mui/system';
import dayjs from 'dayjs';
import moment from 'moment';
import React, {useContext, useEffect, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  calenderReportScheduleAction,
  getCalenderHolidaysAction,
  getEventsAction,
  getPayablesDueAction,
  getReceivablesDueAction,
  getRemindersAction,
  ListPayrollCalender,
} from 'redux/actions/calender_actions';
import CloseIcon from '@mui/icons-material/Close';
import personIcon from '../../../assets/dashboardIcons/total-clients.svg';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import context from '../../../context/CreateNewButtonContext';
import {getsessionStorage} from 'pages/common/login/cookies';
import ReminderForm from './ReminderForm';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { scheduleDeleteAction } from '../../../redux/actions/calender_actions';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { addEventReminderAction, getEventReminderAction } from 'redux/actions/asset_actions';
import { maxBodyHeight, maxHeight } from 'utils/pageSize';
import toMomentOrNull from 'utils/DateFixer';

const CalenderContainer = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  paddingBottom: '16px',
  gridAutoRows: 'auto',
  overflow: 'auto',
  margin: '0px',
});

const DayBox = styled(Paper)(({theme}) => ({
  padding: theme.spacing(1),
  minHeight: '100px',
  maxHeight: '100px',
  height: '100px',
  textAlign: 'right',
  position: 'relative',
  border: '1px solid rgba(200, 200, 200, 0.5)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  margin: '0',
  borderRadius: '0 !important',
  boxShadow: 'none',
  '&.MuiPaper-root': {
    borderRadius: '0px !important',
  },
}));

const EventLabel = styled(Box)(({color}) => ({
  backgroundColor: color,
  color: 'black',
  padding: '4px 8px',
  borderRadius: '4px',
  marginTop: '4px',
  display: 'flex',
  alignItems: 'center',
  textAlign: 'center',
  gap: '8px',
  position: 'relative',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '100%',
  opacity: '0.8',
  cursor: 'pointer',
}));

const DayWeekBox = styled(Paper)(({theme}) => ({
  padding: theme.spacing(1),
  minHeight: '10px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  border: '1px solid rgba(200, 200, 200, 0.5)',
  margin: '0',
  borderRadius: '0 !important',
  boxShadow: 'none',
  '&.MuiPaper-root': {
    borderRadius: '0px !important',
  },
}));

const AssetEvents = (props) => {
  const dispatch = useDispatch();

  const [eventsOpen, setEventsOpen] = useState(false);
  const [selectedDaysEvents, setSelectedDaysEvents] = useState([]);
  const [eventsList, setEventsList] = useState([]);

  const storage = getsessionStorage();

  const maxEventsToShow = 2;

  const today = dayjs();
  const [currentDay, setCurrentDay] = useState(today.date());
  const [currentMonth, setCurrentMonth] = useState(today.month());
  const [currentYear, setCurrentYear] = useState(today.year());
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  
    const [validRegex, setValidRegex] = useState({
      dateValid: false,
    });
    
    const [data, setData] = useState([]);

  const firstDayOfMonth = dayjs(new Date(currentYear, currentMonth))
    .startOf('month')
    .day();
  const daysInMonth = dayjs(new Date(currentYear, currentMonth)).daysInMonth();
  const [eventOpen,setEventOpen] = useState(false)

  const [formValues,setFormValues] =  useState({
    title : null,
    date : null,
    time : null,
    note : null,
    location : null,
    reference : null,
    event : null
  })

    const [formErrors, setFormErrors] = useState({
    title : null,
    date : null,
    time : null,
    note : null,
    event : null
    });

    const events =  [
        {id : 1 , event : 'Audit'},
        {id : 2 , event : 'Renewal'},
        {id : 3 , event : 'service'},
        {id : 4 , event : 'Rent'},
        {id : 5 , event : 'Compliance'},
        {id : 6 , event : 'Custom'},
    ]

  const {
    CalenderReducers: {getReportSchedule},AssetReducers : {get_event_reminder}
  } = useSelector((state) => state);

  
  const [type,setType] = useState('event')

  useEffect(() => {
    const startDate = moment(new Date(currentYear, currentMonth, 1)).startOf(
      'month',
    );

    const endDate = moment(
      new Date(currentYear, currentMonth, daysInMonth),
    ).endOf('month');

    const payload = {
      fromDate: startDate.format('YYYY-MM-DD'),
      toDate: endDate.format('YYYY-MM-DD'),
      type :  type
    };
    dispatch(getEventReminderAction(payload))
  }, []);

  useEffect(() => {
    const eventsObj = [];
    const Reminders = get_event_reminder;
    Reminders.forEach((field) => {
      eventsObj.push({
        date: field.date,
        title: field.title,
        color: '#9DBDFF',
        name: field.note,
        time: field.time,
        description: field.reference,
        category : field.category
      });
    });

    console.log(eventsObj, 'asdasdas3edwd');
    setEventsList(eventsObj);

 const today = moment().format('YYYY-MM-DD'); 
const data = get_event_reminder.filter(e => e.date === today);

 const eventsReminderObj = [];

  data.forEach((field) => {
      eventsReminderObj.push({
        date: field.date,
        title: field.title,
        color: '#9DBDFF',
        name: field.note,
        time: field.time,
        description: field.reference,
        category : field.category
      });
    });
setSelectedDaysEvents(eventsReminderObj);



  }, [get_event_reminder]);

  const handleClickEventsOpen = (events) => {
    setSelectedDaysEvents(events);
    setEventsOpen(true);
  };

  console.log(selectedDaysEvents, 'seletc4444');

  const handleClickEventsClose = () => {
    setEventsOpen(false);
  };

  const handlePrevMonth =async () => {
    let startDate;
    let endDate;

    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);

      const daysInMonth = dayjs(new Date(currentYear - 1, 11)).daysInMonth();
      startDate = moment(new Date(currentYear - 1, 11, 1)).startOf('month');
      endDate = moment(new Date(currentYear - 1, 11, daysInMonth)).endOf(
        'month',
      );
    } else {
      setCurrentMonth(currentMonth - 1);

      const daysInMonth = dayjs(
        new Date(currentYear, currentMonth - 1),
      ).daysInMonth();
      startDate = moment(new Date(currentYear, currentMonth - 1, 1)).startOf(
        'month',
      );
      endDate = moment(
        new Date(currentYear, currentMonth - 1, daysInMonth),
      ).endOf('month');
    }

    const payload = {
      fromDate: startDate.format('YYYY-MM-DD'),
      toDate: endDate.format('YYYY-MM-DD'),
    };

    await dispatch(getEventReminderAction(payload))

    if (currentMonth === today.month() + 1 && currentYear === today.year()) {
      setCurrentDay(today.date());
    } else {
      setCurrentDay(1);
    }
  };

  const handleNextMonth =async () => {
    let startDate;
    let endDate;

    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);

      const daysInMonth = dayjs(new Date(currentYear + 1, 0)).daysInMonth();
      startDate = moment(new Date(currentYear + 1, 0, 1)).startOf('month');
      endDate = moment(new Date(currentYear + 1, 0, daysInMonth)).endOf(
        'month',
      );
    } else {
      setCurrentMonth(currentMonth + 1);
      const daysInMonth = dayjs(
        new Date(currentYear, currentMonth + 1),
      ).daysInMonth();
      startDate = moment(new Date(currentYear, currentMonth + 1, 1)).startOf(
        'month',
      );
      endDate = moment(
        new Date(currentYear, currentMonth + 1, daysInMonth),
      ).endOf('month');
    }

    const payload = {
      fromDate: startDate.format('YYYY-MM-DD'),
      toDate: endDate.format('YYYY-MM-DD'),
    };

   await dispatch(getEventReminderAction(payload))

    if (currentMonth === today.month() - 1 && currentYear === today.year()) {
      setCurrentDay(today.date());
    } else {
      setCurrentDay(1);
    }
  };

  const handleToday = async() => {
    setCurrentMonth(today.month());
    setCurrentYear(today.year());
    setCurrentDay(today.date());

    const daysInMonth = dayjs(
      new Date(today.year(), today.month()),
    ).daysInMonth();
    const startDate = moment(new Date(today.year(), today.month(), 1)).startOf(
      'month',
    );
    const endDate = moment(
      new Date(today.year(), today.month(), daysInMonth),
    ).endOf('month');

    const payload = {
      fromDate: startDate.format('YYYY-MM-DD'),
      toDate: endDate.format('YYYY-MM-DD'),
    };

     await dispatch(getEventReminderAction(payload))
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = Array.from({length: daysInMonth}, (_, i) => i + 1);

  const totalDays = getDaysInMonth.length + firstDayOfMonth;

  const numberOfEmptyDays = (7 - (totalDays % 7)) % 7;

  const daysToRender = [
    ...Array(firstDayOfMonth).fill(null),
    ...getDaysInMonth,
    ...Array(numberOfEmptyDays).fill(null),
  ];

  const handleCreate = () => {
    setOpen(true);
  };

  const handleDelete = async() =>{
    await dispatch(scheduleDeleteAction(selectedDaysEvents[0].id))
  }

  const addEvents = ()=>{
    setEventOpen(true)
  }

   const handleChange = (name, value) => {
    setFormValues((prevData) => {
      const newFormData = { ...prevData, [name]: value || null };
      validateForm(name, value); 
      return newFormData;
    });
  };

    let requiredFields = [];

    if (type === 'reminder') {
      requiredFields = ['title', 'date', 'time', 'note'];
    } else {
      requiredFields = ['title', 'date', 'time', 'note','event'];
    }



    const validateForm = (name, value) => {
      if (requiredFields.includes(name) && (value === null || value === '')) {
        setFormErrors((prevErr) => ({
          ...prevErr,
          [name]: `${name} is Required`,
        }));
      } else {
        setFormErrors((prevErr) => ({
          ...prevErr,
          [name]: null,
        }));
      }
    
      if (name === 'date' && value !== null) {
        if (!moment(value, moment.ISO_8601).isValid()) {
          setValidRegex({ ...validRegex, dateValid: false });
          setFormErrors((prevErrors) => ({
            ...prevErrors,
            [name]: 'Date is Invalid!',
          }));
        } else {
          setValidRegex({ ...validRegex, dateValid: true });
          setFormErrors((prevErrors) => ({
            ...prevErrors,
            [name]: null,
          }));
        }
      }
    };

    const handleSubmit = async(e)=>{
        e.preventDefault()

        let isValid = true ;
        let formErrObj = {...formErrors}

        requiredFields.forEach((key)=>{
            if(formValues[key] === null || formValues[key] === 'null' || formValues[key] === '' ){
                isValid =  false;
                formErrObj[key] =  `${key} is required`
            }
            else{
                formErrObj[key] = null;
            }
        })

         setFormErrors(formErrObj);

        if(isValid){

          
          const payload = {
            data: {
              title: formValues.title,
              category: formValues?.event?.event, // safe now, since you confirmed it exists
              note: formValues.note,
              date: formValues.date,
              time: formValues.time,
              location: formValues.location,
              reference: formValues.reference,
              type : type === 'reminder' ? 'reminder' : 'event'
            }
          };
          console.log(formValues,'formsdfknsdn',payload)

            await dispatch(addEventReminderAction(payload))
             let startDate = moment(new Date(currentYear, currentMonth, 1)).startOf('month');
              let endDate = moment(new Date(currentYear, currentMonth, dayjs(new Date(currentYear, currentMonth)).daysInMonth())).endOf('month');

              const data = {
                fromDate: startDate.format('YYYY-MM-DD'),
                toDate: endDate.format('YYYY-MM-DD'),
              };
             await dispatch(getEventReminderAction(data))
            setEventOpen(false)
            setFormValues(prev => Object.fromEntries(
            Object.keys(prev).map(key => [key, null])
          ));
        }




    }

    const handleClose = async()=>{
      setEventOpen(false)
      setFormValues(prev => Object.fromEntries(
        Object.keys(prev).map(key => [key, null])
      ));
    }

     const [timeFormat, setTimeFormat] = useState('12h');

  const handleFormatChange = (event, newFormat) => {
    if (newFormat) setTimeFormat(newFormat);
  };

  // Build all time slots for the day (24 total)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let i = 0; i < 24; i++) {
      const hour12 = i % 12 === 0 ? 12 : i % 12;
      const ampm = i < 12 ? 'AM' : 'PM';
      const label = timeFormat === '24h' ? `${i.toString().padStart(2, '0')}:00` : `${hour12} ${ampm}`;
      slots.push({ hour: i, label });
    }
    return slots;
  }, [timeFormat]);

  // Find event in that hour
const getEventForHour = (hour) => {
  return selectedDaysEvents.find((ev) => {
    if (ev.time && ev.time !== '0000-00-00 00:00:00') {
      // Split time like "11:44:26"
      const [h, m, s] = ev.time.split(':').map(Number);
      return h === hour;
    }
    return false;
  });
};


  const handleTabChange = (event, newAlignment) => {
    setType(newAlignment);
  };



  return (
    <Card sx={{display:'flex',justifyContent : 'space-between', minHeight : maxHeight , maxHeight : 'calc(100vh - 80px)'}}>
      <Box sx={{overflow: 'auto',width : '50%',m:5}}>
        <Grid container spacing={2}>
          {/* <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}
              item
              display='flex'
              justifyContent='flex-end'
              alignItems='center'
            ></Grid> */}

          <Grid
            display='flex'
            justifyContent='flex-start'
            alignItems='center'
            mb={2}
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 6
            }}>
            <Typography
              sx={{fontSize: '12px', fontWeight: 600, marginLeft: '15px'}}
            >
              Date :{' '}
              {dayjs(new Date(currentYear, currentMonth, currentDay)).format(
                'DD/MM/YYYY',
              )}
            </Typography>

             
          </Grid>

         

          <Grid
            display='flex'
            justifyContent='flex-end'
            alignItems='center'
            gap={2}
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 6
            }}>
            <Grid
              display='flex'
              justifyContent='flex-end'
              alignItems='center'
              size={{
                lg: 10,
                md: 10,
                sm: 10,
                xs: 10
              }}>
           
              <Tooltip
                title='Prev'
                TransitionComponent={Fade}
                TransitionProps={{timeout: 600}}
                placement='top'
              >
                <Button
                  sx={{fontSize: '30px', color: 'grey'}}
                  onClick={handlePrevMonth}
                >
                  &lt;
                </Button>
              </Tooltip>

              <Button variant='contained' color='primary' onClick={handleToday}>
                Today
              </Button>

              <Tooltip
                title='Next'
                TransitionComponent={Fade}
                TransitionProps={{timeout: 600}}
                placement='top'
              >
                <Button
                  sx={{fontSize: '30px', color: 'grey'}}
                  onClick={handleNextMonth}
                >
                  &gt;
                </Button>
              </Tooltip>
            </Grid>
          </Grid>
        </Grid>

        <CalenderContainer>
          {daysOfWeek.map((day) => (
            <DayWeekBox key={day}>
              <Typography variant='h6'>{day}</Typography>
            </DayWeekBox>
          ))}

          {daysToRender.map((day, index) => {
            if (day === null) {
              return <DayBox key={`empty-${index}`} />;
            }

            console.log(eventsList, 'eventlist');

            const dayEvents = eventsList.filter((event) => {
              const eventDate = dayjs(event.date);
              return (
                eventDate.date() === day &&
                eventDate.month() === currentMonth &&
                eventDate.year() === currentYear
              );
            });

            console.log(dayEvents,'dayEventsdskjhsdfksd')

            return (
              <DayBox key={day}>
                <Typography
                  sx={{
                    color: day === currentDay ? 'primary.main' : 'inherit',
                    display: 'inline-block',
                    width: '30px',
                    height: '30px',
                    lineHeight: '30px',
                    borderRadius: '50%',
                    backgroundColor:
                      day === currentDay ? '#e3f2fd' : 'transparent',
                    textAlign: 'center',
                    fontWeight: day === currentDay ? 600 : 'normal',
                  }}
                >
                  {String(day).padStart(2, '0')}
                </Typography>
                {dayEvents.slice(0, maxEventsToShow).map((event, index) => (
                  <EventLabel
                    key={index}
                    onClick={() => handleClickEventsOpen([event])}
                  >
                    {/* <Typography variant='body2'>{event.title}</Typography> */}
                  </EventLabel>
                ))}
                  {dayEvents.length > 0 && (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',   // full width of the cell
        height: '100%',  // full height of the cell
      }}
    >
      <Button
        variant="contained"
        size="small"
        color="primary"
        onClick={() => handleClickEventsOpen(dayEvents)}
        sx={{
          width: 24,
          height: 24,
          minWidth: 0,
          padding: 0,
          borderRadius: '50%',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {dayEvents.length}
      </Button>
    </Box>
  )}


                                </DayBox>
                              );
                          })}




          <Dialog open={eventOpen} maxWidth="md">
              <Card sx={{pt: 3,p : 5}}>
                  <ToggleButtonGroup
                      color="primary"
                      value={type}
                      exclusive
                      onChange={handleTabChange}
                      aria-label="Platform"
                      style={{marginBottom: 10}}
                    >
                      <ToggleButton value="event">Events</ToggleButton>
                      <ToggleButton value="reminder">Reminder</ToggleButton>
                    </ToggleButtonGroup>
                  <Grid container spacing={5} sx={{pb: 3}}>
                      <Grid
                        size={{
                          lg: 6,
                          md: 6,
                          sm: 6,
                          xs: 12
                        }}>
                             <TextField
                          label = {'Title'}
                          fullWidth
                          name='title'
                          variant='filled'
                          required
                          onChange={(e) => handleChange('title', e.target.value)}
                          value={formValues.title}
                          error={formErrors.title !== null}
                          helperText={formErrors.title}
                      />
                      </Grid>
  { type !== 'reminder' &&
          <Grid
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 12
            }}>
    <Autocomplete
      // disablePortal
      options={ events || []}
      getOptionLabel={(option) => 
        option.event
      }
      value={formValues.event ||  null} 
      onChange={(e, newValue) => handleChange('event', newValue)}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          label={'Select Category'}
          required
          variant='filled'
          error={formErrors.event !== null}
          helperText={formErrors.event}
        />
      )}
    />
  </Grid>
  }

                      <Grid
                        size={{
                          lg: 6,
                          md: 6,
                          sm: 6,
                          xs: 12
                        }}>
                      <LocalizationProvider dateAdapter={DateAdapter}>
                          <DatePicker
                              label='Date'
                              value={toMomentOrNull(formValues.date)}
                              format='DD/MM/YYYY'
                              onChange={(date) =>
                              handleChange('date', moment(date).format('YYYY-MM-DD'))
                              }
                              views={['year', 'month', 'day']}
                              slotProps={{ textField: { fullWidth: true, variant: 'filled', required: true, error: formErrors.date !== null, helperText: formErrors.date } }}
                          />
                      </LocalizationProvider>

                      </Grid>
                      <Grid
                        size={{
                          lg: 6,
                          md: 6,
                          sm: 6,
                          xs: 12
                        }}>
                      <LocalizationProvider dateAdapter={DateAdapter}>
                                    <TimePicker
                                      label="Time"
                                      value={formValues.time ? moment(formValues.time, 'HH:mm:ss').toDate() : null}
                                      onChange={(time) => {
                                        if (time && moment(time).isValid()) {
                                          handleChange('time', moment(time).format('HH:mm:ss'))
                                        } else {
                                          handleChange('time', null);
                                        }
                                      }}
                                      onError={(reason) => {
                                        handleChange('time', null)
                                      }}
                                      disableMaskedInput
                                      slotProps={{ textField: { required: true, variant: "filled", fullWidth: true, error: Boolean(formErrors.time), helperText: formErrors.time } }}
                                    />
                                  </LocalizationProvider>
                      </Grid>
                      <Grid
                        size={{
                          lg: 6,
                          md: 6,
                          sm: 6,
                          xs: 12
                        }}>
                      <TextField
                          label = {'Note'}
                          fullWidth
                          name='note'
                          variant='filled'
                          onChange={(e) => handleChange('note', e.target.value)}
                          value={formValues.note}
                          error={formErrors.note !== null}
                          helperText={formErrors.note}
                      />
                      </Grid>
                      <Grid
                        size={{
                          lg: 6,
                          md: 6,
                          sm: 6,
                          xs: 12
                        }}>
                             <TextField
                          label = {'Location'}
                          fullWidth
                          name='location'
                          variant='filled'
                          onChange={(e) => handleChange('location', e.target.value)}
                          value={formValues.location}
                      />
                      </Grid>
                      <Grid
                        size={{
                          lg: 6,
                          md: 6,
                          sm: 6,
                          xs: 12
                        }}>
                             <TextField
                          label = {'Reference'}
                          fullWidth
                          name='reference'
                          variant='filled'
                          onChange={(e) => handleChange('reference', e.target.value)}
                          value={formValues.reference}
                      />
                      </Grid>

                      <Grid
                        size={{
                          lg: 12,
                          md: 12,
                          sm: 12,
                          xs: 12
                        }}>
                                  <Grid container justifyContent='flex-end' spacing={2} mb={2}>
                                    <Grid>
                                      <Button
                                        variant='contained'
                                        color='error'
                                        onClick={handleClose}
                                      >
                                        Cancel
                                      </Button>
                                    </Grid>
                      
                                    <Grid>
                                      <Button
                                        variant='contained'
                                        color='primary'
                                        onClick={handleSubmit}
                                      >
                                        Save
                                      </Button>
                                    </Grid>
                                  </Grid>
                                </Grid>
                  </Grid>
              </Card>
          </Dialog>
        </CalenderContainer>

      </Box>
      <Card sx={{width : '50%',p:4,m:5}}>

  <Grid container spacing={2} alignItems="center">
          <Grid size={6}>
            <Typography variant="h6">Day timeline : {selectedDaysEvents?.length ? moment(selectedDaysEvents[0].date,'YYYY-MM-DD').format('DD/MM/YYYY') : '' } </Typography>
          </Grid>
          <Grid textAlign="right" size={6}>
            {/* <IconButton onClick={handleClickEventsClose}>
              <CloseIcon />
            </IconButton> */}
          </Grid>
        </Grid>

            {/* 12h / 24h Toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>

          <Tooltip title="Create Events" style={{marginRight : '30px'}}>
              <IconButton onClick={()=> addEvents()}>
                  <AddIcon/>
              </IconButton>
          </Tooltip>

          <ToggleButtonGroup
            value={timeFormat}
            exclusive
            onChange={handleFormatChange}
            size="small"
            sx={{
              // backgroundColor: '#222',
              borderRadius: '8px',
            }}
          >
            <ToggleButton
              value="24h"
              // sx={{
              //   // color: '#fff',
              //   '&.Mui-selected': { backgroundColor: '#444', color: '#fff' },
              // }}
            >
              24h
            </ToggleButton>
            <ToggleButton
              value="12h"
              // sx={{
              //   color: '#fff',
              //   '&.Mui-selected': { backgroundColor: '#fbc02d', color: '#000' },
              // }}
            >
              12h
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Timeline list */}
        <Box sx={{ mt: 2, overflowY: 'auto' ,maxHeight : 'calc(100vh - 180px)'}}>
          {timeSlots.map((slot, i) => {
            const event = getEventForHour(slot.hour);
            return (
              <Box
                key={i}
                sx={{
                  borderBottom: '1px solid #e7e7e7ff',
                  py: 1.5,
                  display : 'flex'
                }}
                
              >
                <Typography variant="body2" >
                  {slot.label}
                </Typography>

                {event ? (
                  <Grid marginLeft={'100px'}>
                    <Typography
                      variant="body1"
                      sx={{  fontWeight: 600 }}
                    >
                      {event.title}
                    </Typography>
                    <Typography variant="body2" >
                      {moment(event.time, 'HH:mm:ss').format(timeFormat === '12h' ? 'hh:mm A' : 'HH:mm')}{' '}
                      · {`(${event.category || 'service'}) - ${event.description}`} 
                    </Typography>
                  </Grid>
                ) : null}
              </Box>
            );
          })}
        </Box>
      </Card>
    </Card>
  );
};

export default AssetEvents;
