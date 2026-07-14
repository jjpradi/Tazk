import React, { useContext, useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer';
import { useDispatch, useSelector } from 'react-redux';
import apiCalls from 'utils/apiCalls';
import { dayAction, monthAction, weekAction, yearAction,breakdowndayAction,
    breakdownweekAction,
    breakdownmonthAction,
    breakdownyearAction, } from 'redux/actions/profitLossDashboardAction';
import {clientwebsocket } from '../../../http-common'
import CreateNewButtonContext from "../../../context/CreateNewButtonContext"
import { Button, ButtonGroup, Grid, IconButton, Tooltip } from '@mui/material';
import useCommonRef from "../../../pages/common/home/useCommonRef";
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';

function FilterButtonGroup(props) {
    const { filters, setFilters, setbreakdownFilters, setFilterButtonCardClose, activeButton, setActiveButton, ref1, inView, mode } = props;
    const dispatch = useDispatch();
  const [pollTimer, setPollTimer] = useState(null)

    // const [breakdownfilters, setbreakdownFilters] = useState(breakdownmonth)
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
            getByDate,
            breakdownday,
            breakdownweek,
            breakdownmonth,
            breakdownyear,
        },
    } = useSelector((state) => state);

    useEffect(() => {

        if (inView && props.isEnabled) { 


            apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                dispatch(dayAction(headerLocationId)),
                dispatch(weekAction(headerLocationId)),
                dispatch(monthAction(headerLocationId)),
                dispatch(yearAction(headerLocationId)),
                dispatch(breakdowndayAction(headerLocationId)),
                dispatch(breakdownweekAction(headerLocationId)),
                dispatch(breakdownmonthAction(headerLocationId)),
                dispatch(breakdownyearAction(headerLocationId))
            );
            // clientwebsocket.socket.onmessage = async (message) => {
            //     let { event } = JSON.parse(message.data)
            //     if (event === 'sales') {
            //         dispatch(dayAction(setModalTypeHandler));
            //         dispatch(weekAction(setModalTypeHandler));
            //         dispatch(monthAction(setModalTypeHandler));
            //         dispatch(yearAction(setModalTypeHandler));
            //     }
            // }
        }
    }, [inView, headerLocationId]);

    useEffect(() => {
        if (props.inViewport === true) {
          setTimeout(() => {
            const timer = setInterval(() => pollData(), props.DASHBOARD_API_POLL_TIMING);
            if (props.inViewport === false) {
              clearTimeout(timer);
            }
            dispatch(setDashboardPollingTimerIdsAction(timer));
            setPollTimer(timer );
          }, props.DASHBOARD_API_POLL_TIMING);
    
        } else {
          clearTimeout(pollTimer);
        }
    
        return () => clearTimeout(pollTimer);
        
      }, [props.inViewport]);
    
      const pollData = () => {
        props.pollServer(
            dispatch(dayAction(headerLocationId)),
            dispatch(weekAction(headerLocationId)),
            dispatch(monthAction(headerLocationId)),
            dispatch(yearAction(headerLocationId)),
            dispatch(breakdowndayAction(headerLocationId)),
            dispatch(breakdownweekAction(headerLocationId)),
            dispatch(breakdownmonthAction(headerLocationId)),
            dispatch(breakdownyearAction(headerLocationId))
        );
      }

    useEffect(() => {
        setFilters(day)
        setbreakdownFilters(breakdownday)

    }, [day])


    return (
        <>
            <div 
                ref={(el) => {
                    ref1(el)
                    props.isVisibleRef.current = el
                }}
                style={{width: '100%'}}
            >
                <Grid container>
                    <Grid
                        width='100%'
                        display="flex"
                        size={{
                            lg: 12
                        }}>
                        <ButtonGroup
                            variant='outlined'
                            fullWidth
                            aria-label='outlined primary button group'
                        >
                            <Button
                            variant={activeButton === 'day' ? 'contained' : 'outlined'}
                            onClick={() => {
                              setActiveButton('day')
                              setFilters(day);
                              setbreakdownFilters(breakdownday)
                            }}
                            >
                                Day
                            </Button>
                            <Button
                            variant={activeButton === 'week' ? 'contained' : 'outlined'}
                            onClick={() => {
                              setActiveButton('week')
                              setFilters(week);
                              setbreakdownFilters(breakdownweek)
                            }}
                            >
                                Week
                            </Button>
                            <Button
                            variant={activeButton === 'month' ? 'contained' : 'outlined'}
                            onClick={() => {
                              setActiveButton('month')
                              setFilters(month);
                              setbreakdownFilters(breakdownmonth)
                            }}
                            >
                                Month
                            </Button>
                            <Button
                            variant={activeButton === 'year' ? 'contained' : 'outlined'}
                            onClick={() => {
                              setActiveButton('year')
                              setFilters(year);
                              setbreakdownFilters(breakdownyear)
                            }}
                            >
                                Year
                            </Button>
                        </ButtonGroup>
                        {
                                mode === 'edit' ?
                                    <Tooltip title="ProfitLoss Dashboards required this component. Cannot hide if other dashboards are enabled.">
                                        <IconButton
                                            aria-label='view code'
                                            onClick={() => {
                                                // props.setCardClose()
                                            }}
                                            style={{ cursor : 'default', opacity: '0.6'}}
                                            
                                            size='large'

                                        >
                                            {props.isEnabled ? <props.VisibilityOffIcon /> : <props.VisibilityIcon />}
                                        </IconButton>
                                    </Tooltip>
                            :
                            ''
                        }
                    </Grid>
                </Grid>
            </div>
        </>
    );
}
export default useCommonRef(FilterButtonGroup);