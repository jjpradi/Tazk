import React, {useEffect, useState} from 'react';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Box from '@mui/material/Box';
import ContactList from './ContactList';
import ChatList from './ChatList';
import AppScrollbar from '@crema/core/AppScrollbar';
import PropTypes from 'prop-types';
import IntlMessages from '@crema/utility/IntlMessages';
import {Fonts} from 'shared/constants/AppEnums';
import AccountBoxOutlinedIcon from '@mui/icons-material/AccountBoxOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import {useDispatch, useSelector} from 'react-redux';

import {styled} from '@mui/material/styles';
import {
  chatListDataAction,
  listEmployeeAction,
} from '../../../../../../redux/actions/message_actions';
import {clientwebsocket} from 'http-common';
import {
  getConnectionMessages,
  onSendMessage,
} from '../../../../../../redux/actions';
import {getInboxId} from '../..';
import {eventList} from '../../../../../../http-common';

const TabLabel = styled(Tab)(() => {
  return {
    minWidth: 10,
    minHeight: 50,
    fontSize: 14,
    flex: 1,
    textTransform: 'capitalize',
    fontWeight: Fonts.MEDIUM,
    '& .MuiTab-wrapper': {
      flexDirection: 'row',
    },
    '& .MuiSvgIcon-root': {
      marginBottom: '0 !important',
      display: 'block',
      marginRight: 10,
      fontSize: 20,
    },

  };
});

const tabs = [
  {id: 1, name: <IntlMessages id='dashboard.messages' />},
  {id: 2, name: <IntlMessages id='chatApp.contacts' />},
];

const UserTabs = ({
  searchedListData,
  loading,
  keywords,
  storage,
  value,
  setValue,
  userStatus,
  setUserStatus,
}) => {
  const {employee_id, company_id, first_name} = storage;

  const user = {
    id: employee_id,
    displayName: first_name.split('.')[1] || first_name.split('.')[0],
  };

  const dispatch = useDispatch();

  const {
    messageReducer: {employeeList, chatListData},
    chatReducer: {selectedUser},
  } = useSelector((state) => state);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // useEffect(() => {
  //   if (value === 1) {
  //     !(employeeList.length > 0) && dispatch(listEmployeeAction());
  //   }
  //   if (value === 0) {
  //     if (clientwebsocket.socket.readyState === WebSocket.OPEN) {
  //       clientwebsocket.socket.send(
  //         JSON.stringify({event: 'get_inbox', content: {emp_id: employee_id}}),
  //       );
  //     }
  //   }
  // }, [value, clientwebsocket.socket.readyState]);

  const a11yProps = (index) => {
    return {
      id: `scrollable-force-tab-${index}`,
      'aria-controls': `scrollable-force-tabpanel-${index}`,
    };
  };

  return (
    <>
      <Box
        sx={{
          pb: 2,
          width: 1,
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor='primary'
          textColor='primary'
          variant='scrollable'
          scrollButtons='auto'
          aria-label='scrollable auto tabs example'
          sx={{
            borderBottom: (theme) => `1px solid ${theme.palette.grey[300]}`,
            position: 'relative',
            '& .MuiTabs-flexContainer': {
              justifyContent: 'center',
            },
          }}
        >
          {tabs.map((tab, index) => {
            return (
              <TabLabel
                key={tab.id}
                icon={
                  tab.id === 1 ? (
                    <ChatOutlinedIcon />
                  ) : (
                    <AccountBoxOutlinedIcon />
                  )
                }
                label={tab.name}
                {...a11yProps(index)}
                className="table-title"
              />
            );
          })}
        </Tabs>
      </Box>

      <AppScrollbar
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100% - 175px)',
        }}
      >
        <Box
          sx={{
            pb: 2,
            flex: 1,
          }}
        >
          {value === 0 && (
            <>
              {chatListData.length > 0 ? (
                <Box
                  sx={{
                    pt: 2,
                    pb: 1,
                    px: 5,
                    fontWeight: Fonts.SEMI_BOLD,
                  }}
                  component='h4'
                >
                  Connections
                </Box>
              ) : null}
              <ChatList
                chatListData={
                  searchedListData.length > 0 || keywords ? searchedListData : chatListData
                }
                loading={loading}
                user={user}
                storage={storage}
              />
            </>
          )}
          {value === 1 && (
            <>
              {/* {employeeList.length > 0 ? (
                <Box
                  sx={{
                    pt: 2,
                    pb: 1,
                    px: 5,
                    fontWeight: Fonts.SEMI_BOLD,
                  }}
                  component='h4'
                >
                  Contacts
                </Box>
              ) : null} */}
              <ContactList
                employeeList={
                  searchedListData.length > 0 || keywords? searchedListData : employeeList
                }
                loading={loading}
              />
            </>
          )}
        </Box>
      </AppScrollbar>
    </>
  );
};

export default UserTabs;
