import React, {useEffect, useState} from 'react';
import UserInfo from './UserInfo';
import ChatTabs from './ChatTabs';
import Box from '@mui/material/Box';
import {useSelector} from 'react-redux';
import moment from 'moment';
import {Zoom} from '@mui/material';
import {useIntl} from 'react-intl';
import AppSearchBar from '@crema/core/AppSearchBar';
import {useAuthUser} from '@crema/utility/AuthHooks';
import {getsessionStorage} from 'pages/common/login/cookies';
import {clientwebsocket} from '../../../../../http-common';
import {getInboxId} from '..';

const ChatSideBar = ({storage, value, setValue, userStatus, setUserStatus}) => {
  const [keywords, setKeywords] = useState('');
  const {first_name, last_name, employee_id, user_img_url, username} = storage;
  const user = {
    first_name,
    last_name,
    employee_id,
    username,
    displayName: first_name.split('.')[1] || first_name.split('.')[0],
    photoURL: user_img_url,
  };

  const {
    chatReducer: {connectionList},
    messageReducer: {employeeList, chatListData},
    common: {loading},
  } = useSelector((state) => state);

  const searchListData = () => {
    const list = value === 0 ? chatListData : employeeList
    if (keywords !== '') {
      return list.filter((item) =>
        item.first_name.toUpperCase().includes(keywords.toUpperCase()),
      );
    }
    return list;
  };

  useEffect(() => {
    setValue(0);
  }, []);

  // useEffect(() => {
  //   if (value === 0) {
  //     if (clientwebsocket.socket.readyState === WebSocket.OPEN) {
  //       clientwebsocket.socket.send(
  //         JSON.stringify({event: 'get_inbox', content: {emp_id: employee_id}}),
  //       );
  //     }
  //   }
  // }, [value, clientwebsocket.socket.readyState]);

  const searchedListData = searchListData();

  const {messages} = useIntl();

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
      }}
    >
      <Zoom in style={{transitionDelay: '300ms'}}>
        <Box
          sx={{
            px: 5,
            pt: 4,
            pb: 2,
          }}
        >
          <UserInfo user={user} storage={storage} />
        </Box>
      </Zoom>
      <Box
        sx={{
          px: 5,
          pt: 2,
          width: 1,
        }}
      >
        <AppSearchBar
          sx={{
            marginRight: 0,
            width: '100%',
            '& .searchRoot': {
              width: '100%',
            },
            '& .MuiInputBase-input': {
              width: '100%',
              '&:focus': {
                width: '100%',
              },
            },
          }}
          iconPosition='right'
          overlap={false}
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder={messages['common.searchHere']}
        />
      </Box>

      <ChatTabs
        storage={storage}
        searchedListData={searchedListData}
        keywords={keywords}
        loading={loading}
        value={value}
        setValue={setValue}
        userStatus={userStatus}
        setUserStatus={setUserStatus}
      />
    </Box>
  );
};

export default ChatSideBar;
