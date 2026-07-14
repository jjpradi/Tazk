import React, {useEffect, useState} from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import {green, orange, red} from '@mui/material/colors';
import PropTypes from 'prop-types';
import {Typography} from '@mui/material';
import {Fonts} from '../../../../../shared/constants/AppEnums';
import IntlMessages from '../../../../../utility/IntlMessages';
import {clientwebsocket} from 'http-common';

const UserInfo = ({user, showStatus, storage, userStatus, typingStatus}) => {
  const getUserAvatar = () => {
    const name = user.displayName || user.name;
    if (name) {
      return name.charAt(0).toUpperCase();
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
  };

  if (!user) {
    return null;
  }

 

  const displayName = (user) => {

    if(user.displayName || user.first_name){
      return (user.displayName || user.first_name) + (user.last_name ? ' ' + user.last_name : '')
    }

    return user.username

  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
      className='user-info'
    >
      <Box
        sx={{
          position: 'relative',
        }}
      >
        {user.photoURL || user.image ? (
          <Avatar
            sx={{
              height: 44,
              width: 44,
              fontSize: 24,
              backgroundColor: orange[500],
            }}
            src={user.photoURL || user.image}
          />
        ) : (
          <Avatar
            sx={{
              height: 44,
              width: 44,
              fontSize: 24,
              backgroundColor: orange[500],
            }}
          >
            {getUserAvatar()}
          </Avatar>
        )}
        {user.isGroup
          ? null
          : showStatus && (
              <Box
                sx={{
                  position: 'absolute',
                  right: 0,
                  bottom: 0,
                  zIndex: 1,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  border: `2px solid white`,
                  backgroundColor:
                    userStatus === 'online' ? green[600] : red[600],
                }}
              />
            )}
      </Box>
      <Box
        sx={{
          width: 'calc(100% - 60px)',
          ml: 3.5,
        }}
      >
        <Typography className='chatcontent'
        >
          {displayName(user)}
          
        </Typography>
        <Typography className='chatcontent'
          sx={{
            color: (theme) => theme.palette.text.secondary,
          }}
        >
          {user.isGroup ? (
            <span className='pointer'>
              {user.members.length} <IntlMessages id='chatApp.participants' />{' '}
            </span>
          ) : (
            <span> {showStatus ? typingStatus === 'typing...' ?  typingStatus : userStatus : 'Online'}</span>
          )}
        </Typography>
      </Box>
    </Box>
  );
};

export default UserInfo;

UserInfo.propTypes = {
  user: PropTypes.object.isRequired,
  showStatus: PropTypes.bool,
};
