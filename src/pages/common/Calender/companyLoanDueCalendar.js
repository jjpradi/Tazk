import {
  Avatar,
  Box,
  Button,
  Drawer,
  Fade,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {color, styled} from '@mui/system';
import dayjs from 'dayjs';
import moment from 'moment';
import React, {useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getCompanyLoanDuesAction} from 'redux/actions/calender_actions';
import context from '../../../context/CreateNewButtonContext';
import { getsessionStorage } from 'pages/common/login/cookies';
import CloseIcon from '@mui/icons-material/Close';
import personIcon from '../../../assets/dashboardIcons/total-clients.svg'

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

const CompanyLoanDueCalendar = () => {
  const dispatch = useDispatch();

  const [eventsOpen, setEventsOpen] = useState(false);
  const [selectedDaysEvents, setSelectedDaysEvents] = useState([]);
  const [eventsList, setEventsList] = useState([]);

  const {
    CalenderReducers: { getCompanyLoanDues},

  } = useSelector((state) => state);

  const storage = getsessionStorage()

  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);



  const maxEventsToShow = 2;

  const today = dayjs();
  const [currentDay, setCurrentDay] = useState(today.date());
  const [currentMonth, setCurrentMonth] = useState(today.month());
  const [currentYear, setCurrentYear] = useState(today.year());
  const [edit,setEdit] = useState(false)
  const [data,setData] = useState([])
  const firstDayOfMonth = dayjs(new Date(currentYear, currentMonth))
    .startOf('month')
    .day();
  const daysInMonth = dayjs(new Date(currentYear, currentMonth)).daysInMonth();

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

    dispatch(getCompanyLoanDuesAction());
  
  }, []);

  useEffect(() => {
    const eventsObj = [];
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

  //   getCompanyLoanDues.forEach((field) => {
  //     console.log(getCompanyLoanDues, 'getCompanyLoanDues')
  //     const loandueDate = dayjs(field.next_emi_due_date).year(currentYear)
      
  //     eventsObj.push({
  //         date : loandueDate.format('YYYY-MM-DD'),
  //         title : `${field.bank_name} - ${field.EMI_amount}`,
  //         color : '#9DBDFF',
  //         description : field.description,
  //         name : field.emp_name,
  //         id : field.id
  //     })

  // })
    getCompanyLoanDues.forEach((element) => {
      const emiSchedule = element.EMI_schedule
      Object.keys(emiSchedule).forEach((year) => {
        emiSchedule[year].forEach((date) => {
          eventsObj.push({
            date : date.Date,
            title : element.loan_number,
            color : '#9DBDFF',
            bank_name : element.bank_name,
            acc_number : element.loan_account_number,
            emi_amount : element.EMI_amount,
            tenure_months : element.tenor_of_loan
          })
        })
      })
    })

    setEventsList(eventsObj);
  }, [getCompanyLoanDues]);
  

  const handleClickEventsOpen = (events) => {
    setSelectedDaysEvents(events);
    setEventsOpen(true);
  };

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

  const handleEdit = (events)=>{
    setEdit(true)
    setData(events)
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
            {
              selectedDaysEvents.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><b>Bank Name</b></TableCell>
                        <TableCell><b>Acc. Number</b></TableCell>
                        <TableCell><b>EMI Amount</b></TableCell>
                        <TableCell><b>Tenure</b></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedDaysEvents.map((event, index) => (
                        <TableRow key={index}>
                          <TableCell>{event.bank_name}</TableCell>
                          <TableCell>{event.acc_number}</TableCell>
                          <TableCell>{event.emi_amount}</TableCell>
                          <TableCell>{`${event.tenure_months} Months`}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography>No Records</Typography>
              )
            }
          </Grid>
        </Drawer>
      </CalenderContainer>
    </Box>
  );
};

export default CompanyLoanDueCalendar;
