import React, { useState } from 'react';
import Box from '@mui/material/Box';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import PropTypes from 'prop-types';
import ListItem from '@mui/material/ListItem';
import {useDispatch} from 'react-redux';
import {onSelectUser} from '../../../../../../../redux/actions';
import clsx from 'clsx';
import {Checkbox, alpha} from '@mui/material';
import { FETCH_START } from '../../../../../../../redux/actionTypes';
import { clientwebsocket } from '../../../../../../../http-common';
import { getInboxId } from '../../..';
import { capitalize } from 'lodash';

const ContactItem = (props) => {
  const {item, selectedUser, action, handleChecked} = props;
  const dispatch = useDispatch();
  
  const handleSetSelectedUser = (e) => {
    if(action !== 'VIEW_CONTACT') return;
    const {first_name, last_name} = item;
    const user = {
      ...item,
      name: first_name.split('.')[1] || first_name.split('.')[0],
    };
    dispatch(onSelectUser(user));
  };



  return (
    <ListItem
      sx={{
        display: 'flex',
        pl: 5,
        pr: 5,
        // alignItems: "center",
        // padding: "50px",
        cursor: 'pointer',
        // flexWrap: 'wrap', // Allow content to wrap if it exceeds the width of the ListItem
        alignItems: 'center',
        '&.active': {
          backgroundColor: (theme) =>
            action === 'VIEW_CONTACT' &&
            alpha(theme.palette.primary.main, 0.07),
        },
        '&:nth-last-child(1)': {
          mb: 10,
        },
      }}
      button={action === 'VIEW_CONTACT'}
      className={clsx('item-hover', {
        active: selectedUser && selectedUser.employee_id === item.employee_id,
      })}
      onClick={(e) => handleSetSelectedUser(e)}
    >
      {action === 'SEND_CONTACT' ? (
        <>
          <Checkbox onChange={(e) => handleChecked(e, item)} />
        </>
      ) : null}
      <div>
        <ListItemAvatar
          sx={{
            minWidth: 0,
            position: 'relative',
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
            }}
            src={item.image}
          />
        </ListItemAvatar>
      </div>
      <Box
        sx={{
          pl: 3.5,
          width: 'calc(100% - 36px)',
          overflow: 'auto', // or 'hidden' or 'scroll' depending on your preference
          overflowWrap: 'break-word', // To allow wrapping within words
          wordWrap: 'break-word',
          fontFamily: 'poppins',
          fontSize: '11px',
          fontWeight: '400',
          color: 'rgba(0, 0, 0, 0.7)',
        }}
      >
        <Box
          // component='h5'
          sx={{
            display: 'block',
            mb: 0.5,
          }}
        >
          {capitalize(item.first_name) +
            (item.last_name ? ' ' + item.last_name : '')}
        </Box>
        <Box
          // component='p'
          sx={{
            color: !item.status
              ? 'text.secondary'
              : item.status === 'offline'
              ? 'text.secondary'
              : 'green',
            display: 'block',
            overflow: 'auto',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {!item.status ? 'offline' : item.status}
        </Box>
      </Box>
    </ListItem>
  );
};

export default ContactItem;

