import React, {useEffect, useContext, useState} from 'react';
import RevenueAndCost from './revenue_and_cost';
import BreakDownCost from './break_down_cost';
import Profit from './profit';

import {Grid, Button, Typography, ButtonGroup} from '@mui/material';
import Filters from './filters';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {useDispatch, useSelector} from 'react-redux';
import {
  dayAction,
  weekAction,
  monthAction,
  yearAction,
  getByDateAction,
  breakdowndayAction,
  breakdownweekAction,
  breakdownmonthAction,
  breakdownyearAction,
} from 'redux/actions/profitLossDashboardAction';
import { useInView } from 'react-intersection-observer';
import apiCalls from 'utils/apiCalls';
import {clientwebsocket } from '../../../http-common'


function ProfitLoss(props) {
  const dispatch = useDispatch();
  const {fromDate, toDate} = props;

  

  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(CreateNewButtonContext);
  const {
    ProfitLossDashboardReducer: {
      day,
      week,
      month,
      year,
      breakdownday,
      breakdownweek,
      breakdownmonth,
      breakdownyear,
      getByDate,

    },
  } = useSelector((state) => state);
  const [filters, setFilters] = useState(month);
  const [breakdownfilters, setbreakdownFilters] = useState(breakdownmonth)
  const [activeButton,setActiveButton] = useState('day')

  


  // Api call is made only when component is visible in viewport
  const { ref, inView, entry } = useInView({
    threshold: 0,
    triggerOnce: true,
    rootMargin: '1000px',
    delay: 100000
  });

  const handleStartApi = () => {
    
  }

  useEffect(() => {
    setTimeout(() => {
    if(inView){ // Api call is made only when component is visible
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(dayAction(setModalTypeHandler, setLoaderStatusHandler)),
        dispatch(weekAction(setModalTypeHandler, setLoaderStatusHandler)),
        dispatch(monthAction(setModalTypeHandler, setLoaderStatusHandler)),
        dispatch(yearAction(setModalTypeHandler, setLoaderStatusHandler)),
        dispatch(breakdowndayAction(setModalTypeHandler, setLoaderStatusHandler)),
        dispatch(breakdownweekAction()),
        dispatch(breakdownmonthAction()),
        dispatch(breakdownyearAction())
      );
      // clientwebsocket.socket.onmessage = async (message) => {
      //   let { event } = JSON.parse(message.data)
      //   if (event === 'sales') {
      //     dispatch(dayAction(setModalTypeHandler ));
      //     dispatch(weekAction(setModalTypeHandler ));
      //     dispatch(monthAction(setModalTypeHandler ));
      //     dispatch(yearAction(setModalTypeHandler));
      //   }
      // }
    }},10000)
  }, [inView]);

  useEffect(()=>{
    setFilters(day)
    setbreakdownFilters(breakdownday)
  },[day])

  const handleDate = (fromDate,toDate) => {
    

    setFilters(getByDate);
    
  };

  

  return (
    <>
      <Grid container display='flex' flexDirection='row' spacing={3} ref={ref}>
        <Grid
          size={{
            lg: 6,
            md: 6,
            sm: 12,
            xs: 12
          }}>
          <Typography
            variant='h6'
            style={{
              textAlign: 'left',
              textTransform: 'uppercase',
              paddingLeft: '10px',
              color: 'black',
            }}
          >
            Profit & Loss Dashboard
          </Typography>
        </Grid>
        <Grid
          align='right'
          pb='20px'
          size={{
            lg: 6,
            md: 6,
            sm: 12,
            xs: 12
          }}>
          <ButtonGroup
            variant='outlined'
            fullWidth
            aria-label='outlined primary button group'
          >
            <Button
              variant={activeButton === 'day' ? 'contained' : 'outlined'}
              onClick={() => {
                setActiveButton('day');
                setFilters(day);
                setbreakdownFilters(breakdownday)
              }}
            >
              Day
            </Button>
            <Button
              variant={activeButton === 'week' ? 'contained' : 'outlined'}
              onClick={() => {
                setActiveButton('week');
                setFilters(week);
                setbreakdownFilters(breakdownweek)
              }}
            >
              Week
            </Button>
            <Button
              variant={activeButton === 'month' ? 'contained' : 'outlined'}
              onClick={() => {
                setActiveButton('month');
                setFilters(month);
                setbreakdownFilters(breakdownmonth)
              }}
            >
              Month
            </Button>
            <Button
              variant={activeButton === 'year' ? 'contained' : 'outlined'}
              onClick={() => {
                setActiveButton('year');
                setFilters(year);
                setbreakdownFilters(breakdownyear)
              }}
            >
              Year
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
      <Grid container>
        <Grid
          paddingRight='7px'
          size={{
            lg: 4,
            md: 4,
            sm: 4,
            xs: 12
          }}>
          <Filters handleDate={() => handleDate()} />
        </Grid>
        <Grid
          display='flex'
          flexDirection='column'
          size={{
            lg: 8,
            md: 8,
            sm: 8,
            xs: 12
          }}>
          <Grid paddingBottom='5px'>
            <RevenueAndCost RevenueAndCost={filters} />
          </Grid>
          <Grid sx={{paddingBottom: '5px'}}>
            <Profit profit={filters} isEnabledForApi={handleStartApi()} />
          </Grid>
          <Grid>
            <BreakDownCost breakDown={breakdownfilters} />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default ProfitLoss;
