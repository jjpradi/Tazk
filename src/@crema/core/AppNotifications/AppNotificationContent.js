import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton, List, Typography, Box, Button, Grid } from '@mui/material';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import AppScrollbar from '@crema/core/AppScrollbar';
import IntlMessages from '@crema/utility/IntlMessages';
import NotificationItem from './NotificationItem';
import context from '../../../context/CreateNewButtonContext';
import { listNotificationAction, updateClearedNotificationAction } from '../../../redux/actions/notification_actions';
import { pageSize } from 'utils/pageSize';
import CommonSearch from 'utils/commonSearch';
import { getsessionStorage } from '../../../pages/common/login/cookies';

const AppNotificationContent = ({ onClose, sxStyle }) => {
  const storage = getsessionStorage()
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const scrollContainerRef = useRef(null);

  let {
    NotificationReducer: { getnotificationdata },
  } = useSelector((state) => state);
  const { commoncookie: currentEmpId } = useContext(context);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  const [notifications, setNotifications] = useState([]);
  const notificationList = notifications || [];

  // Fetch notifications
  const fetchNotifications = (pageToFetch, searchString = '') => {
    const payload = {
      pageCount: pageToFetch,
      numPerPage: 20,
      searchString,
      employeeId: storage.employee_id
    };
    dispatch(listNotificationAction(payload)).then((res) => {
      if (pageToFetch === 0) {
        setNotifications(res);
      } else {
        setNotifications(prev => [...prev, ...res]);
      }

      if (!res || res.length < 20) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

    });
  };

  // Initial fetch
  useEffect(() => {
    setPage(0);
    fetchNotifications(0, searchVal);
  }, []);

  // Scroll handler
  const handleScroll = () => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

    if (scrollTop + clientHeight >= scrollHeight - 20) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage, searchVal);
    }
  };

  const cancelSearch = () => {
    setSearchVal('');
    setPage(0);
    setHasMore(true);
    fetchNotifications(0, '');
  };

  const requestSearch = (e) => {
    const val = e?.target?.value || '';
    setSearchVal(val);
    setPage(0);
    setHasMore(true);
    fetchNotifications(0, val);
  };

  const handleClear =async(e)=>{
    const payload = {
      type : "ClearAll"
    }
   await dispatch(updateClearedNotificationAction(payload))
    fetchNotifications(0, searchVal);
    getnotificationdata = []
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: 300,
        height: 'calc(100vh - 30px)',
        ...sxStyle,
      }}
    >
      <Box
        sx={{
          padding: '5px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent : 'space-between',
          borderBottom: 1,
          borderBottomColor: (theme) => theme.palette.divider,
          minHeight: { xs: 56, sm: 70 },
        }}
      >
        <Typography component='h3' variant='body1' style={{ fontWeight: 'bold' }}>
          <IntlMessages id='common.notifications' />({getnotificationdata.length})
        </Typography>

        <Grid>
         
          <Button
          onClick={handleClear}
          >
            Clear All
          </Button>
        <IconButton
          sx={{
            height: 40,
            width: 40,
            marginLeft: 'auto',
            color: 'text.secondary',
          }}
          onClick={onClose}
          size='large'
        >
          <CancelOutlinedIcon />
        </IconButton>
        </Grid>
      </Box>

      <CommonSearch searchVal={searchVal} cancelSearch={cancelSearch} requestSearch={requestSearch} />

      <AppScrollbar
        sx={{
          height: { xs: 'calc(100% - 96px)', sm: 'calc(100% - 110px)' },
        }}
        scrollRef={scrollContainerRef}
        onScroll={handleScroll}
      >
        <List sx={{ py: 0 }}>
          {notificationList.length > 0 ? (
            notificationList.map((item) => (
              <NotificationItem key={item.id} item={item} onClose={onClose} getnotificationdata={getnotificationdata} fetchNotifications={fetchNotifications} searchVal={searchVal}/>
            ))
          ) : (
            <Box
              spacing={0}
              direction="column"
              alignItems="center"
              justifyContent="center"
              sx={{ display: 'flex', width: 'auto', margin: '0 auto', marginTop: '20px' }}
            >
              No Notifications...
            </Box>
          )}
        </List>
        {hasMore && (
          <Button
            fullWidth
            onClick={() => {
              const nextPage = page + 1;
              setPage(nextPage);
              fetchNotifications(nextPage, searchVal);
            }}
            sx={{ mt: 1 }}
          >
            Show More
          </Button>
        )}
      </AppScrollbar>
    </Box>
  );
};

export default AppNotificationContent;

AppNotificationContent.propTypes = {
  index: PropTypes.number,
  onClose: PropTypes.func,
  sxStyle: PropTypes.object,
};
