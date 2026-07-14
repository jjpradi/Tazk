import React, {useEffect, useState, useContext} from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import ListItemButton from '@mui/material/ListItemButton';
import {useDispatch, useSelector} from 'react-redux';
import context from '../../../context/CreateNewButtonContext';
import {
  getInboxAction,
  getMsgInInboxAction,
} from '../../../redux/actions/message_actions';
import moment from 'moment';
import apiCalls from 'utils/apiCalls';

export default function ChatList({
  // userMessages,
  // userChattedWith,
  setChatScreenOpen,
  setChatScreenUser,
  setCurrentInboxId,
  inboxList,
}) {
  const dispatch = useDispatch();
  
  const {
    commoncookie: currentEmpId, 
    setModalTypeHandler,
    setLoaderStatusHandler,} = useContext(context);

  // const listLatestMsg = () => {
  //   const latestTemp = {};
  //   for (let user = 0; user < userChattedWith.length; user++) {
  //     const temp = listSpecificUserMessages(userChattedWith[user]);
  //     latestTemp[userChattedWith[user].employee_id] = temp[0].msg_content;
  //   }
  //   setUsersLatestMessage(latestTemp);
  // };

  // const listSpecificUserMessages = (userId) => {
  //   const specificUserMessages = userMessages.filter((item) => {
  //     if (
  //       item.msg_from === userId.employee_id ||
  //       item.msg_to === userId.employee_id
  //     ) {
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   });
  //   return specificUserMessages;
  // };


  useEffect(() => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getInboxAction(currentEmpId))
    );
  }, []);

  return (
    <List sx={{width: '100%'}}>
      {inboxList.length > 0
        ? inboxList.map((item) => {
            return (
              <>
                <ListItemButton
                  key={item.inbox_id}
                  onClick={() => {
                    setChatScreenUser(item.idsChattedWith);
                    setCurrentInboxId(item.inbox_id);

                    setChatScreenOpen(true);
                  }}
                >
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar alt='No image' src='/static/images/avatar/1.jpg'>
                        {item.idsChattedWith_Name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <Grid
                      style={{
                        flexDirection: 'row',
                        width: '100%',
                      }}
                    >
                      <Grid
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography
                          variant='h4'
                          sx={{textTransform: 'capitalize'}}
                        >
                          {item.idsChattedWith_Name}
                        </Typography>
                        <Typography variant='h6'>
                          {moment(item.latest_message_timestamp).format(
                            'h:mm a',
                          )}
                        </Typography>
                      </Grid>
                      <Grid
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {' '}
                        <Typography variant='h5'>
                          {item.latest_message}
                        </Typography>
                      </Grid>
                    </Grid>
                  </ListItem>
                </ListItemButton>
                <Divider style={{width: '100%'}} />
              </>
            );
          })
        : ''}

      {/* <Divider variant="inset" component="li" /> */}
    </List>
  );
}
