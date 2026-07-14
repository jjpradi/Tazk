import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Typography,
  useMediaQuery,
} from '@mui/material';
import React, {useContext, useEffect, useState} from 'react';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import NearMeOutlined from '@mui/icons-material/NearMeOutlined';
import AvTimerIcon from '@mui/icons-material/AvTimer';
import {
  employeeCountAction,
  getAnnouncements,
  holidaysCardAction,
} from 'redux/actions/payrollDashboard_actions';
import {useDispatch, useSelector} from 'react-redux';
import context from 'context/CreateNewButtonContext';
import Cards from 'components/dynamicCards';
import employeIcon from '../../assets/dashboardIcons/employees.svg';
import lateIcon from '../../assets/dashboardIcons/due-dates.svg';
import vacationIcon from '../../assets/dashboardIcons/announcement.svg';
import useCommonRef from 'pages/common/home/useCommonRef';
import apiCalls from 'utils/apiCalls';
import {setDashboardPollingTimerIdsAction} from 'redux/actions/dashboard_role_actions';
import {getsessionStorage} from 'pages/common/login/cookies';
import { roleType } from 'utils/roleType';

function AnnouncementCard(props) {
  const dispatch = useDispatch();
  let storage = getsessionStorage();
  let person = storage.employee_id;
  console.log('FFFFF', person);

  const {setLoaderStatusHandler, setModalTypeHandler} = useContext(context);
  const screen = useMediaQuery((theme) => theme.breakpoints.up('2560'));
  const {
    PayrolldashboardReducers: {announcements_list},
  } = useSelector((state) => state);

  const [pollTimer, setPollTimer] = useState(null);

  useEffect(() => {
    if (props.inView && props.isEnabled) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(getAnnouncements()),
      );
    }
  }, [props.inView, props.isEnabled]);
  useEffect(() => {
    if (props.inViewport === true) {
      setTimeout(() => {
        const timer = setInterval(
          () => pollData(),
          props.DASHBOARD_API_POLL_TIMING,
        );
        if (props.inViewport === false) {
          clearTimeout(timer);
        }
        dispatch(setDashboardPollingTimerIdsAction(timer));
        setPollTimer(timer);
      }, props.DASHBOARD_API_POLL_TIMING);
    } else {
      clearTimeout(pollTimer);
    }

    return () => clearTimeout(pollTimer);
  }, [props.inViewport]);

  const pollData = () => {
    props.pollServer(dispatch(getAnnouncements()));
  };
  const announcementForAdmin = announcements_list.length
    ? announcements_list.map((a) => a.announcement)
    : ['No announcement'];

  const announcementsForEmployee = announcements_list.length ? announcements_list.filter((item) => item.users.includes(person)).map((d) => d.announcement) : ['No announcement'];
  
  console.log('announcementsForEmployee', announcementsForEmployee, announcements_list, person);

  let role_name = storage?.role_name
  const result =
    storage?.role_name === 'Administrator'
      ? announcementForAdmin
      : announcementsForEmployee;

  return (
    <div
      ref={(el) => {
        props.ref1(el);
        props.isVisibleRef.current = el;
      }}
      style={{width: '100%'}}
    >
      <Card sx={{ width: '100%', maxWidth: '100vw', height: '50px', color: 'black' }}>
        <Grid container>
          <Grid
            size={{
              xs: 12,
              md: 12,
              lg: 12,
              sm: 12
            }}>
            <Grid container display='flex'>
              <Grid padding={'5px 0px 5px 10px'}>
                <img src={vacationIcon} height={33} width={50} />
              </Grid>
              <Grid
                width={'90%'}
                display={'flex'}
                justifyContent={'center'}
                alignItems={'center'}
                padding='5px 0px 5px 10px'>
              <Typography
                style={{ fontSize: '14px', fontWeight: 500, width: '100%' }}
              >
                  <marquee direction='left' style={{width: '100%'}}>
                    {/* <Chip label={result}></Chip> */}
                    {result?.map((d, i) => (
                    <span key={i} style={{ fontWeight: 500 }}>
                      {d}
                      {i !== result.length - 1 && (
                        <span style={{ margin: '0 10px' }}>|</span>
                      )}
                    </span>
                    ))}

                </marquee>
              </Typography>
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
            {props.mode === 'edit' ? (
              <IconButton
                aria-label='view code'
                onClick={() => props.setCardClose()}
                size='large'
              >
                {props.isEnabled ? (
                  <props.VisibilityOffIcon />
                ) : (
                  <props.VisibilityIcon />
                )}
              </IconButton>
            ) : (
              ''
            )}
          </Grid>
        </Grid>
      </Card>
    </div>
  );
}
export default useCommonRef(AnnouncementCard);
