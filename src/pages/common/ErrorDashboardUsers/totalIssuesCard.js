import { Box, Card, CardContent, Grid, IconButton, Typography, useMediaQuery } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import NearMeOutlined from '@mui/icons-material/NearMeOutlined';
import AvTimerIcon from '@mui/icons-material/AvTimer';
import { employeeCountAction } from 'redux/actions/payrollDashboard_actions';
import { useDispatch, useSelector } from 'react-redux';
import context from 'context/CreateNewButtonContext';
import Cards from 'components/dynamicCards';
import employeIcon from '../../../assets/dashboardIcons/employees.svg';
import lateIcon from '../../../assets/dashboardIcons/due-dates.svg';
import checkoutIcon from '../../../assets/dashboardIcons/log-out.svg';
import vacationIcon from '../../../assets/dashboardIcons/vacation.svg'
import useCommonRef from 'pages/common/home/useCommonRef';
import CloseIcon from '@mui/icons-material/Close';
import apiCalls from 'utils/apiCalls';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import issueIcon from '../../../assets/dashboardIcons/TotalIssue.png';
import { listErrorDashboardAction } from 'redux/actions/errorDashboard_actions';

function EmployeeCard(props) {
    const dispatch = useDispatch();
    const { setLoaderStatusHandler, setModalTypeHandler } = useContext(context);
    const screen = useMediaQuery((theme) => theme.breakpoints.up("2560"));
    const [pollTimer, setPollTimer] = useState(null)

    const {
        PayrolldashboardReducers: { employeeCount },ErrorDashboardReducer: {error_dashboard_list, error_dashboard_list_count}
    } = useSelector((state) => state);
      useEffect(() => {
        if (props.inView && props.isEnabled) {
          const body = {
            company_id: 'currentCompany',
          }
          // apiCalls(
          //   setModalTypeHandler,
          //   setLoaderStatusHandler,
          //   dispatch(employeeCountAction(setLoaderStatusHandler, setModalTypeHandler)),

          //   dispatch(
          //     listErrorDashboardAction(
          //       body,
          //       setModalTypeHandler,
          //       setLoaderStatusHandler
          //     ),
          //   ),
          // )
        }
      }, [props.inView , props.isEnabled]);
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
            dispatch(employeeCountAction(setLoaderStatusHandler, setModalTypeHandler))
        );
      }
    return (
        <div 
        ref={(el) => {
            props.ref1(el)
            props.isVisibleRef.current = el
          }}
        style={{width: '100%'}}>
            <Cards>
                <Grid container>
                    <Grid
                        size={{
                            xs: 10,
                            md: 11,
                            lg: 10,
                            sm: 11
                        }}>
                        <Grid container display='flex' >
                            <Grid paddingLeft={3}>
                                <img src={issueIcon} height={50} width={50} />
                            </Grid>
                            <Grid padding='15px 0px 0px 15px'>
                                <Typography style={{ fontSize: "18px", fontWeight: 500 }}>
                                    {error_dashboard_list_count}
                                </Typography>
                                <Typography color='textSecondary'>{'Total Issues'}</Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1,
                            sm: 1,
                            lg: 2
                        }}>
                        {
                            props.mode === 'edit' ? 
                            <IconButton
                                aria-label='view code'
                                onClick={() => props.setCardClose()}
                                size='large'
                            >
                                {props.isEnabled ?  <props.VisibilityOffIcon /> : <props.VisibilityIcon />} 
                            </IconButton>
                            :
                            ''
                        }
                    </Grid>
                </Grid>
            </Cards>
        </div>
    );
}

export default useCommonRef(EmployeeCard);
