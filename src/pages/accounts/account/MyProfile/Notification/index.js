import React, { useContext, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import {Button, Checkbox, Divider, List, ListItem, ListItemIcon, ListItemText, Typography} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import apiCalls from 'utils/apiCalls';
import context from '../../../../../../src/context/CreateNewButtonContext'
import { getIndividualNotificationAction, updateIndividualNotificationAction } from '../../../../../redux/actions/notification_actions';

const Notification = () => {
  const dispatch = useDispatch();
  const [ selected, setSelected ] = useState([]);
  const {
    setModalStatusHandler,
    setModalTypeHandler,
    setLoaderStatusHandler
  } = useContext(context);


  useEffect(() => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getIndividualNotificationAction())
    )
  }, []);

  const { NotificationReducer: { getIndividualNotification } } = useSelector((state) => state);

  useEffect(() => {
    if (getIndividualNotification?.length > 0) {
      const initiallyChecked = getIndividualNotification
        .filter((res) => res.is_user_checked === 0)
        .map((res) => res.notification_id);

      setSelected(initiallyChecked);
    }
  }, [ getIndividualNotification ]);

  const handleToggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [ ...prev, id ]
    );
  };

  const handleSave = () => {
    if (!getIndividualNotification) return;

    const payload = getIndividualNotification.map((data) => ({
      notificationId: data.notification_id,
      checked: selected.includes(data.notification_id) ? 0 : 1, // 0 if checked , 1 if unchecked
    }));

    dispatch(updateIndividualNotificationAction(payload));
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Typography variant='h6' align='left' style={{ paddingBottom: '20px' }}>
        Individual Notification
      </Typography>

      {getIndividualNotification.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          No notifications available.
        </Typography>
      ) : (
        <>
          <List>
            {getIndividualNotification.map((notif) => (
              <React.Fragment key={notif.notification_id}>
                <ListItem
                  button
                  onClick={() => handleToggle(notif.notification_id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={selected.includes(notif.notification_id)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={notif.display_title}
                    secondary={notif.description}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
          <div
            style={{
              marginTop: '20px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              padding: "10px"
            }}
          >
            <Button
              variant='contained'
              color='primary'
              size='medium'
              style={{ padding: '2px 6px', fontSize: '0.65rem' }}
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </>
      )}
    </Box>
  );
};

export default Notification;
