import { Avatar, Box, Button, Drawer, Fade, Grid, IconButton, Paper, Tooltip, Typography } from '@mui/material'
import { styled } from '@mui/system'
import dayjs from 'dayjs'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getCalenderHolidaysAction, getEventsAction, ListPayrollCalender } from 'redux/actions/calender_actions'
import CloseIcon from '@mui/icons-material/Close';
import personIcon from '../../../assets/dashboardIcons/total-clients.svg'

const CalenderContainer = styled(Box) ({
    display : 'grid',
    gridTemplateColumns : 'repeat(7, 1fr)',
    paddingBottom : '16px',
    gridAutoRows : 'auto',
    overflow : 'auto',
    margin : '0px'
})

const DayBox = styled(Paper) (({ theme }) => ({
    padding : theme.spacing(1),
    minHeight : '100px',
    maxHeight : '100px',
    height : '100px',
    textAlign : 'right',
    position : 'relative',
    border : '1px solid rgba(200, 200, 200, 0.5)',
    overflow : 'hidden',
    display : 'flex',
    flexDirection : 'column',
    justifyContent : 'space-between',
    margin : '0',
    borderRadius : '0 !important',
    boxShadow : 'none',
    '&.MuiPaper-root' : {
        borderRadius : '0px !important'
    }
}))

const EventLabel = styled(Box) (({ color }) => ({
    backgroundColor : color,
    color : 'black',
    padding : '4px 8px',
    borderRadius : '4px',
    marginTop : '4px',
    display : 'flex',
    alignItems : 'center',
    textAlign : 'center',
    gap : '8px',
    position : 'relative',
    overflow : 'hidden',
    textOverflow : 'ellipsis',
    whiteSpace : 'nowrap',
    maxWidth : '100%',
    opacity : '0.8',
    cursor : 'pointer'
}))

const DayWeekBox = styled(Paper) (({ theme }) => ({
    padding : theme.spacing(1),
    minHeight : '10px',
    display : 'flex',
    justifyContent : 'center',
    alignItems : 'center',
    position : 'relative',
    border : '1px solid rgba(200, 200, 200, 0.5)',
    margin : '0',
    borderRadius : '0 !important',
    boxShadow : 'none',
    '&.MuiPaper-root' : {
        borderRadius : '0px !important'
    }
}))

const PayrollCalender = () => {

    const dispatch = useDispatch()

    const [eventsOpen, setEventsOpen] = useState(false)
    const [selectedDaysEvents, setSelectedDaysEvents] = useState([]) 
    const [eventsList, setEventsList] = useState([])

    const maxEventsToShow = 1

    const today = dayjs()
    const [currentDay, setCurrentDay] = useState(today.date())
    const [currentMonth, setCurrentMonth] = useState(today.month())
    const [currentYear, setCurrentYear] = useState(today.year())
    const firstDayOfMonth = dayjs(new Date(currentYear, currentMonth)).startOf('month').day()
    const daysInMonth = dayjs(new Date(currentYear, currentMonth)).daysInMonth()

    const {
        CalenderReducers : { payrollCalenderList, calenderHolidaysList, calenderEventsList }
    } = useSelector((state) => state)

    useEffect(() => {
        const startDate = moment(new Date(currentYear, currentMonth, 1)).startOf('month')

        const endDate = moment(new Date(currentYear, currentMonth, daysInMonth)).endOf('month')

        const payload = {
            fromDate : startDate.format('YYYY-MM-DD'),
            toDate : endDate.format('YYYY-MM-DD')
        }
        dispatch(ListPayrollCalender(payload))
        dispatch(getCalenderHolidaysAction(payload))
        dispatch(getEventsAction())
    }, [])

    const requestTypeLeave = (val) => {
        switch (val) {
            case 1 :
                return 'Leave'
            
            case 2 : 
                return 'Permission'

            case 4 : 
                return 'Half Day'
            
            default :
                return ''
        }
    }

    useEffect(() => {
        const eventsObj = []
            calenderHolidaysList.forEach((field) => {
                eventsObj.push({
                    date : field.holiday_date,
                    title : `Holiday - ${field.name}`,
                    color : '#9DBDFF'
                })
            })

            payrollCalenderList.forEach((field) => {
                const startDate = dayjs(field.fromDate)
                const endDate = dayjs(field.toDate)
                let currentDate = startDate
                while(currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
                    eventsObj.push ({
                        date : currentDate,
                        title : `${field.full_name} - ${requestTypeLeave(field.request_type)}`,
                        color : '#FFC6C6',
                        full_name : field.full_name,
                        employee_code : field.employee_code,
                        request_type : field.request_type,
                        reason : field.reason
                    })
                    currentDate = currentDate.add(1, 'day')
                }
            })

            calenderEventsList.forEach((field) => {
                const eventDate = dayjs(field.value).year(currentYear)
                eventsObj.push({
                    date : eventDate.format('YYYY-MM-DD'),
                    title : `${field.event_name} - ${field.first_name}`,
                    color : '#81DAE3',
                    employee : field.employee_code
                })
            })
        
        setEventsList(eventsObj)
    }, [calenderHolidaysList, payrollCalenderList, calenderEventsList])

    const handleClickEventsOpen = (events) => {
        setSelectedDaysEvents(events)
        setEventsOpen(true)
    }

    const handleClickEventsClose = () => {
        setEventsOpen(false)
    }

    const handlePrevMonth = () => {
        let startDate
        let endDate
        
        if(currentMonth === 0) {
            setCurrentMonth(11)
            setCurrentYear(currentYear - 1)

            const daysInMonth = dayjs(new Date(currentYear - 1 , 11)).daysInMonth()
            startDate = moment(new Date(currentYear - 1, 11, 1)).startOf('month')
            endDate = moment(new Date(currentYear - 1, 11, daysInMonth)).endOf('month')
        }
        else {
            setCurrentMonth(currentMonth - 1)

            const daysInMonth = dayjs(new Date(currentYear , currentMonth - 1 )).daysInMonth()
            startDate = moment(new Date(currentYear, currentMonth - 1, 1)).startOf('month')
            endDate = moment(new Date(currentYear, currentMonth - 1, daysInMonth)).endOf('month')
        }

        const payload = {
            fromDate : startDate.format('YYYY-MM-DD'),
            toDate : endDate.format('YYYY-MM-DD')
        }
        dispatch (ListPayrollCalender(payload))
        dispatch(getCalenderHolidaysAction(payload))

        if(currentMonth === today.month() + 1 && currentYear === today.year()) {
            setCurrentDay(today.date())
        }
        else {
            setCurrentDay(1)
        }
    }

    const handleNextMonth = () => {
        let startDate
        let endDate

        if(currentMonth === 11) {
            setCurrentMonth(0)
            setCurrentYear(currentYear + 1)

            const daysInMonth = dayjs(new Date(currentYear + 1 , 0)).daysInMonth()
            startDate = moment(new Date(currentYear + 1, 0, 1)).startOf('month')
            endDate = moment(new Date(currentYear + 1, 0, daysInMonth)).endOf('month')
        }
        else {
            setCurrentMonth(currentMonth + 1)
            const daysInMonth = dayjs(new Date(currentYear , currentMonth + 1)).daysInMonth()
            startDate = moment(new Date(currentYear, currentMonth + 1, 1)).startOf('month')
            endDate = moment(new Date(currentYear, currentMonth + 1, daysInMonth)).endOf('month')
        }

        const payload = {
            fromDate : startDate.format('YYYY-MM-DD'),
            toDate : endDate.format('YYYY-MM-DD')
        }
        dispatch (ListPayrollCalender(payload))
        dispatch(getCalenderHolidaysAction(payload))

        if(currentMonth === today.month() - 1 && currentYear === today.year()) {
            setCurrentDay(today.date())
        }
        else {
            setCurrentDay(1)
        }
    }

    const handleToday = () => {
        
        setCurrentMonth(today.month())
        setCurrentYear(today.year())
        setCurrentDay(today.date())

        const daysInMonth = dayjs(new Date(today.year(), today.month())).daysInMonth()
        const startDate = moment(new Date(today.year(), today.month(), 1)).startOf('month')
        const endDate = moment(new Date(today.year(), today.month(), daysInMonth)).endOf('month')

        const payload = {
            fromDate : startDate.format('YYYY-MM-DD'),
            toDate : endDate.format('YYYY-MM-DD')
        }
        dispatch(ListPayrollCalender(payload))
        dispatch(getCalenderHolidaysAction(payload))
    }

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    const getDaysInMonth = Array.from({ length : daysInMonth }, (_, i) => i + 1)

    const totalDays = getDaysInMonth.length + firstDayOfMonth

    const numberOfEmptyDays = (7 - (totalDays % 7)) % 7

    const daysToRender = [...Array(firstDayOfMonth).fill(null), ...getDaysInMonth, ...Array(numberOfEmptyDays).fill(null)]


  return (
      <Box sx = {{ overflow : 'auto' }}>
          <Grid container spacing = {2}>
              <Grid
                  display = 'flex'
                  justifyContent = 'flex-end'
                  alignItems = 'center'
                  size={{
                      lg: 4,
                      md: 4,
                      sm: 4,
                      xs: 12
                  }}>
              </Grid>

              <Grid
                  display = 'flex'
                  justifyContent = 'center'
                  alignItems = 'center'
                  mb = {2}
                  size={{
                      lg: 4,
                      md: 4,
                      sm: 4,
                      xs: 12
                  }}>
                  <Typography sx={{ fontSize : '13px', fontWeight : 600 }}>
                      {dayjs(new Date(currentYear, currentMonth, currentDay)).format('DD/MM/YYYY')}
                  </Typography>
              </Grid>

              <Grid
                  display = 'flex'
                  justifyContent = 'center'
                  alignItems = 'center'
                  gap = {2}
                  size={{
                      lg: 4,
                      md: 4,
                      sm: 4,
                      xs: 12
                  }}>
                  <Tooltip 
                      title = 'Prev'
                      TransitionComponent = {Fade}
                      TransitionProps = {{ timeout : 600 }}
                      placement = 'top'
                  >
                      <Button sx={{ fontSize : '30px', color : 'grey' }} onClick={handlePrevMonth}>
                          &lt;
                      </Button>
                  </Tooltip>

                  <Button
                      variant = 'contained'
                      color = 'primary'
                      onClick = {handleToday}
                  >
                      Today
                  </Button>

                  <Tooltip 
                      title = 'Next'
                      TransitionComponent = {Fade}
                      TransitionProps = {{ timeout : 600 }}
                      placement = 'top'
                  >
                      <Button sx={{ fontSize : '30px', color : 'grey' }} onClick={handleNextMonth}>
                          &gt;
                      </Button>
                  </Tooltip>
              </Grid>
          </Grid>
          <CalenderContainer>
              {
                  daysOfWeek.map((day) => (
                      <DayWeekBox
                          key = {day}
                      >
                          <Typography variant='h6'>
                              {day}
                          </Typography>
                      </DayWeekBox>
                  ))
              }
              
              {
                  daysToRender.map((day, index) => {
                      if(day === null) {
                          return <DayBox key = {`empty-${index}`} />
                      }

                      const dayEvents = eventsList.filter((event) => {
                          const eventDate = dayjs(event.date)
                          return eventDate.date() === day && eventDate.month() === currentMonth && eventDate.year() === currentYear
                      }) 

                      return (
                          <DayBox
                              key = {day}
                              sx={{
                                  minHeight: '80px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center'
                              }}
                          >
                              <Typography 
                                  sx = {{
                                      color : day === currentDay ? 'primary.main' : 'inherit',
                                      display : 'inline-block',
                                      width : '30px',
                                      height : '30px',
                                      lineHeight : '30px',
                                      borderRadius : '50%',
                                      backgroundColor : day === currentDay ? '#e3f2fd' : 'transparent',
                                      textAlign : 'center',
                                      fontWeight : day === currentDay ? 600 : 'normal'
                                  }}
                              >
                                  {String(day).padStart(2, '0')}
                              </Typography>
                              {
                                  dayEvents.slice(0, maxEventsToShow).map((event, index) => (
                                      <EventLabel
                                          key = {index}
                                          color = {event.color}
                                          onClick = {() => handleClickEventsOpen([event])}
                                          sx={{ 
                                              whiteSpace: 'normal',  
                                              wordWrap: 'break-word', 
                                              overflow: 'visible', 
                                              padding: '4px',
                                              display: 'block',
                                              width: '100%',
                                              minHeight: 'auto'
                                          }}
                                      >
                                          <Typography variant='body2' sx={{ whiteSpace: 'normal' }}>
                                              {event.title}
                                          </Typography>
                                      </EventLabel>
                                  ))
                              }
                              {
                                  dayEvents.length > maxEventsToShow && (
                                      <Button
                                          variant = 'text'
                                          size = 'small'
                                          sx={{
                                              display: 'block',
                                              width: '100%',
                                              textAlign: 'center',
                                              minHeight: '30px'
                                          }}
                                          onClick = {() => handleClickEventsOpen(dayEvents)}
                                      >
                                          +{dayEvents.length - maxEventsToShow} more
                                      </Button>
                                  )
                              }
                          </DayBox>
                      )
                  })
              }

              <Drawer
                sx = {{
                  flexShrink : 0,
                  '& .MuiDrawer-paper' : {
                    width : { xs : 150, sm : 250, md : 350, lg : 450 },
                    boxSizing : 'border-box',
                    display : 'flex',
                    flexDirection : 'column',
                    alignItems : 'center'
                  }
                }}
                  anchor = 'right'
                  open = {eventsOpen}
                  onClose = {handleClickEventsClose}
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
                              sx = {{
                                  position : 'absolute',
                                  top : '10px',
                                  left : '10px'
                              }}
                          >
                              Attendance
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
                              onClick = {handleClickEventsClose}
                              sx = {{
                                  position : 'absolute',
                                  right : '0px'
                              }}
                          >
                              <CloseIcon />
                          </IconButton>
                      </Grid>
                  </Grid>

                  <Grid
                      sx={{ marginTop : '50px' }}
                      size={{
                          lg: 12,
                          md: 12,
                          sm: 12,
                          xs: 12
                      }}>
                      {
                          selectedDaysEvents.length > 0 ? (
                              selectedDaysEvents.map((event, index) => (
                                  <Box key={index} mb={2}>
                                      <Box display='flex' alignItems='center' sx={{ gap : '10px', mb : 2 }}>
                                          <Avatar>
                                              <img src = {personIcon} height = {40} width = {40} alt="person" />
                                          </Avatar>
                                          {
                                              event.full_name && event.employee_code ? (
                                                  <Typography variant='body1'>
                                                      { `${event.full_name} , ${event.employee_code}, ${requestTypeLeave(event.request_type)}`}
                                                  </Typography>
                                              ) : event.title && event.title.includes('Holiday') ? (
                                                  <Typography variant='body1'>
                                                      {event.title}
                                                  </Typography>
                                              ) : (
                                                  <Typography variant='body1'>
                                                      {`${event.title}, ${event.employee}`}
                                                  </Typography>
                                              )
                                          }
                                      </Box>
                                  </Box>
                              ))
                          ) : (
                              <Typography>
                                  No Records
                              </Typography>
                          )
                      }
                  </Grid>

              </Drawer>
          </CalenderContainer>
      </Box>
  );
}

export default PayrollCalender