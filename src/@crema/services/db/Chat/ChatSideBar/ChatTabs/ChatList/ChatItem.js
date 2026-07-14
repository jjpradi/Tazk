import React, {useCallback, useEffect} from 'react';
import Box from '@mui/material/Box';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import PropTypes from 'prop-types';
import ListItem from '@mui/material/ListItem';
import {useDispatch, useSelector} from 'react-redux';
import {onSelectUser} from '../../../../../../../redux/actions';
import clsx from 'clsx';
import {green, red} from '@mui/material/colors';
import {Grid, Typography, alpha} from '@mui/material';
import {chatListDataAction, listEmployeeAction} from 'redux/actions/message_actions';
import moment from 'moment';
import ImageIcon from '@mui/icons-material/Image';
import ArticleIcon from '@mui/icons-material/Article';
import PersonIcon from '@mui/icons-material/Person';
import RoomIcon from '@mui/icons-material/Room';
import { clientwebsocket } from 'http-common';

const ChatItem = (props) => {
  const {item, selectedUser, storage} = props;
  const dispatch = useDispatch();

  const {
    messageReducer: {employeeList, chatListData},
  } = useSelector((state) => state);


  const getOtherEmpName = (first_name,last_name) => {
    const displayName = (first_name.split('.')[1] || first_name.split('.')[0]) + (last_name ? '.' + last_name : '');

   

    return displayName;
  };

  const getMessageOrStatus = (item) => {
    if (item.typingStatus) {
      return item.typingStatus;
    }
    if (item.latest_msg_type === 'TEXT') {
      return item.latest_msg;
    }
    if (item.latest_msg_type === 'PHOTO') {
      return (
        <Typography sx={{display: 'flex', alignItems: 'center'}}>
          <ImageIcon style={{fontSize: '18px', color: '#999999'}} />
          Photo
        </Typography>
      );
    }
    if (item.latest_msg_type === 'DOCUMENT') {
      return (
        <Typography sx={{display: 'flex', alignItems: 'center'}}>
          <ArticleIcon style={{fontSize: '18px', color: '#999999'}} />
          Document
        </Typography>
      );
    }
    if (item.latest_msg_type === 'CONTACT') {
      return (
        <Typography sx={{display: 'flex', alignItems: 'center'}}>
          <PersonIcon style={{fontSize: '18px', color: '#999999'}} />
          Contact
        </Typography>
      );
    }
    if (item.latest_msg_type === 'LOCATION') {
      return (
        <Typography sx={{display: 'flex', alignItems: 'center'}}>
          <RoomIcon style={{fontSize: '18px', color: '#999999'}} />
          Location
        </Typography>
      );
    }
  };

  const isNewMessageAvailable = useCallback(() => {
    let unseen_msg_count = 0;

    if (item.other_empId > props.user.id) {
      unseen_msg_count = item.p1_unseen_msg_count;
    } else {
      unseen_msg_count = item.p2_unseen_msg_count;
    }
    return unseen_msg_count;
  }, [item]);

  const handleSetSelectedUser = (item) => {
    const {first_name,full_name,last_name} = item;
    const user = {
      ...item,
      employee_id: item.other_empId,
      name: (first_name.split('.')[1] || first_name.split('.')[0]) + (last_name ? '.' + last_name : ''),
      image: employeeList.find(i => i.employee_id === item.other_empId).image
    };
    dispatch(onSelectUser(user));

    const unseenColName =
      storage.employee_id < user.employee_id
        ? 'p1_unseen_msg_count'
        : 'p2_unseen_msg_count';

 
    if (clientwebsocket.socket.readyState === WebSocket.OPEN) {
      clientwebsocket.socket.send(
        JSON.stringify({
          event: 'mark_msg_as_read',
          content: {
            roomId: item.inbox_id,
            last_seen_msg_id: item.latest_msg_id,
            colToUpdate: unseenColName,
          },
        }),
      );
    }

    const temp = chatListData.map((i) =>
      i.inbox_id === item.inbox_id ? {...i, [unseenColName]: 0} : {...i},
    );
    dispatch(chatListDataAction(temp));
  };

  return (
    <ListItem
      sx={{
        display: 'flex',
        pl: 5,
        pr: 5,
        cursor: 'pointer',
        '&.active': {
          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.07),
        },
      }}
      button
      className={clsx('item-hover', {
        active: selectedUser && selectedUser.employee_id === item.other_empId,
      })}
      onClick={() => handleSetSelectedUser(item)}
    >
      <div>
        <ListItemAvatar
          sx={{
            minWidth: 0,
            position: 'relative',
          }}
        >
          <>
            <Avatar
              sx={{
                width: 40,
                height: 40,
              }}
              src={employeeList.find(i => i.employee_id === item.other_empId)?.image || ''}
            />
            {item?.isGroup ? (
              <Box
                sx={{
                  position: 'absolute',
                  right: -2,
                  bottom: -2,
                  zIndex: 1,
                  borderRadius: '50%',
                  border: `1.5px solid white`,
                }}
              >
                <Avatar
                  sx={{height: 12, width: 12}}
                  src={item.members[0].image}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  position: 'absolute',
                  right: -2,
                  bottom: -2,
                  zIndex: 1,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  border: `1.5px solid white`,
                  backgroundColor:
                    item.status === 'online' ? green[600] : red[600],
                }}
              />
            )}
          </>
        </ListItemAvatar>
      </div>
      <Box
        sx={{
          fontSize: 14,
          pl: 3.5,
          width: 'calc(100% - 36px)',
        }}
      >
        <Grid
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Box
            // component='h5'
            sx={{
              display: 'block',
              mb: 0.5,
            }}
          >
            {item.full_name}
          </Box>
          <Box
            // component='p'
            sx={{
              color: 'text.secondary',
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {getTimeStamp(item.latest_msg_timestamp)}
          </Box>
        </Grid>
        <Box
          // component='p'
          sx={{
            color: item.typingStatus ? '#0A8FDC' : 'text.secondary',
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {getMessageOrStatus(item)}
        </Box>
      </Box>
      {getUnreadCount(selectedUser, item, isNewMessageAvailable)}
    </ListItem>
  );
};
function getTimeStamp(latest_msg_timestamp) {
  const d = moment(latest_msg_timestamp).local().toLocaleString();
  const date = new Date(d);
  const today = new Date();
  if (today.toDateString() === date.toDateString()) {
    return moment(latest_msg_timestamp).format('LT');
  }

  // yesterday
  const yesterday = today;
  yesterday.setDate(yesterday.getDate() - 1);
  if (yesterday.toDateString() === date.toDateString()) {
    return 'Yesterday';
  }

  return moment(latest_msg_timestamp).format('DD/MM/YY');
}

function getUnreadCount(selectedUser, item, isNewMessageAvailable) {
  const count = isNewMessageAvailable();
  const unreadHtml = (
    <div
      style={{
        display: 'flex',
        flexGrow: 1,
      }}
    >
      <div
        style={{
          backgroundColor: '#0A8FDC',
          color: 'white',
          width: 'max-content',
          padding: '2px 8px',
          height: 'auto',
          borderRadius: '10px',
          marginLeft: 'auto',
        }}
      >
        {count}
      </div>
    </div>
  );

  if (count === 0) {
    return null;
  }

  if (!selectedUser) {
    return unreadHtml;
  }

  if (item.other_empId === selectedUser.employee_id) {
    return null;
  }

  return unreadHtml;
}

export default ChatItem;

ChatItem.propTypes = {
  item: PropTypes.object.isRequired,
  selectedUser: PropTypes.object,
};
