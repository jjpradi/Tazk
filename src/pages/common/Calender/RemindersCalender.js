import {
    Avatar,
    Box,
    Button,
    Dialog,
    Drawer,
    Fade,
    Grid,
    IconButton,
    Paper,
    Tooltip,
    Typography,
  } from '@mui/material';
  import {styled} from '@mui/system';
  import dayjs from 'dayjs';
  import moment from 'moment';
  import React, {useContext, useEffect, useState} from 'react';
  import {useDispatch, useSelector} from 'react-redux';
  import {
    getCalenderHolidaysAction,
    getEventsAction,
    getPayablesDueAction,
    getReceivablesDueAction,
    getRemindersAction,
    ListPayrollCalender,
  } from 'redux/actions/calender_actions';
  import CloseIcon from '@mui/icons-material/Close';
  import personIcon from '../../../assets/dashboardIcons/total-clients.svg';
  
  import context from '../../../context/CreateNewButtonContext';
import { getsessionStorage } from 'pages/common/login/cookies';
import ReminderForm from './ReminderForm';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';


  
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
  
  const RemindersCalender = () => {
    const dispatch = useDispatch();
  
    const [eventsOpen, setEventsOpen] = useState(false);
    const [selectedDaysEvents, setSelectedDaysEvents] = useState([]);
    const [eventsList, setEventsList] = useState([]);

    const storage = getsessionStorage()
  
    const maxEventsToShow = 2;
  
    const today = dayjs();
    const [currentDay, setCurrentDay] = useState(today.date());
    const [currentMonth, setCurrentMonth] = useState(today.month());
    const [currentYear, setCurrentYear] = useState(today.year());
    const [open,setOpen] = useState(false)
    const [edit,setEdit] = useState(false)
    const [data,setData] = useState([])
    const firstDayOfMonth = dayjs(new Date(currentYear, currentMonth))
      .startOf('month')
      .day();
    const daysInMonth = dayjs(new Date(currentYear, currentMonth)).daysInMonth();
  
    const {
      CalenderReducers: {getReminders},
    } = useSelector((state) => state);
  
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
      };
      dispatch(getRemindersAction());
    }, []);

    
    useEffect(() => {
      const eventsObj = [];
      const Reminders =  getReminders.filter((e) => e.type !== 'payable' && e.type !== 'receivable')
      console.log(Reminders,'getReminders444')
      Reminders.forEach((field) => {
        eventsObj.push({
            date : field.date,
            title : field.title,
            color : '#9DBDFF',
            name : field.description,
            time : field.time,
            description : field.description,
            id : field.id

        })
    })
    
  
      console.log(eventsObj, 'asdasdas3edwd');
      setEventsList(eventsObj);
    }, [getReminders]);
  
    const handleClickEventsOpen = (events) => {
      setSelectedDaysEvents(events);
      setEventsOpen(true);
    };

    console.log(selectedDaysEvents,'seletc4444')
  
    const handleClickEventsClose = () => {
      setEventsOpen(false);
    };
  
    const handlePrevMonth = () => {
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
  
      if (currentMonth === today.month() + 1 && currentYear === today.year()) {
        setCurrentDay(today.date());
      } else {
        setCurrentDay(1);
      }
    };
  
    const handleNextMonth = () => {
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
  
      if (currentMonth === today.month() - 1 && currentYear === today.year()) {
        setCurrentDay(today.date());
      } else {
        setCurrentDay(1);
      }
    };
  
    const handleToday = () => {
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

    const handleCreate = ()=>{
      setOpen(true)
    }

    const handleEdit = (event)=>{
      console.log('eee2222',event)
      setData(event)
      setEdit(true)
    }
    
  
    return (
      <Box sx={{overflow: 'auto'}}>
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
            <Typography sx={{fontSize: '12px', fontWeight: 600, marginLeft : '15px'}}>
           Date : {dayjs(new Date(currentYear, currentMonth, currentDay)).format(
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
            <Grid
              display='flex'
              justifyContent='flex-start'
              alignItems='center'
              mb={1}
              size={{
                lg: 1,
                md: 1,
                sm: 1,
                xs: 1
              }}>
            <Tooltip title='Reminder'>
              <IconButton size='small' onClick={handleCreate}>
                <AddIcon fontSize='small' />
              </IconButton>
            </Tooltip>
          </Grid>
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
                    color={event.color}
                    onClick={() => handleClickEventsOpen([event])}
                  >
                    <Typography variant='body2'>{event.title}</Typography>
                  </EventLabel>
                ))}
                {dayEvents.length > maxEventsToShow && (
                  <Button
                    variant='text'
                    size='small'
                    onClick={() => handleClickEventsOpen(dayEvents)}
                  >
                    +{dayEvents.length - maxEventsToShow} more
                  </Button>
                )}
              </DayBox>
            );
          })}

          <Drawer
            sx={{
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: {xs: 150, sm: 250, md: 350, lg: 450},
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              },
            }}
            anchor='right'
            open={eventsOpen}
            onClose={handleClickEventsClose}
          >
            <Grid container spacing={2}>
              <Grid
                size={{
                  lg: 6,
                  md: 6,
                  sm: 6,
                  xs: 6
                }}>
                <Typography
                  variant='h6'
                  sx={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                  }}
                >
                  Reminders
                </Typography>
              </Grid>

              <Grid
                size={{
                  lg: 6,
                  md: 6,
                  sm: 6,
                  xs: 6
                }}>
                <IconButton
                  onClick={handleClickEventsClose}
                  sx={{
                    position: 'absolute',
                    right: '0px',
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Grid>
            </Grid>

            <Grid
              sx={{marginTop: '50px'}}
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              {selectedDaysEvents.length > 0 ? (
                selectedDaysEvents.map((event, index) => (
                  <Box key={index} mb={2}>
                    <Box
                      display='flex'
                      alignItems='center'
                      sx={{gap: '10px', mb: 2}}
                    >
                      <Avatar>
                        <img
                          src={personIcon}
                          height={40}
                          width={40}
                          alt='person'
                        />
                      </Avatar>
                      {
                        <Grid display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                          <Typography variant='body1' >
                            {`${event.title}-${moment(event.time, 'HH:mm:ss').format('hh:mm A')}-${event.name}`}
                          </Typography>

                          <Grid >
                            <Tooltip title='Reminder'>
                              <IconButton
                                size='small'
                                onClick={()=>handleEdit(event)}
                              >
                              <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </Grid>
                        </Grid>
                      }
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography>No Records</Typography>
              )}
            </Grid>
          </Drawer>
        </CalenderContainer>
        <Dialog open={open}>
          <ReminderForm handleClose={() => setOpen(false)} />
        </Dialog>
        <Dialog open={edit}>
          <ReminderForm 
            handleClose={() => setEdit(false)}
            data = {data}
            type = {'manual'}
          />
        </Dialog>
      </Box>
    );
  };
  
  export default RemindersCalender;
  