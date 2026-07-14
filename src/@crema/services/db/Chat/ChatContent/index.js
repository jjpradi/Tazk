import React from 'react';
import {useSelector} from 'react-redux';
import NoUserScreen from './NoUserScreen';
import ChatViewContainer from './ChatViewContainer';

import {styled} from '@mui/material/styles';
import {Fonts} from '../../../../shared/constants/AppEnums';

const MessagesScreen = styled('div')(() => {
  return {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  };
});
const ScrollChatNoUser = styled('div')(({theme}) => {
  return {
    fontSize: 18,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign: 'center',
    height: 'calc(100vh - 169px) !important',
    fontWeight: Fonts.MEDIUM,
    [theme.breakpoints.up('lg')]: {
      fontSize: 20,
    },
    '& .MuiSvgIcon-root': {
      fontSize: '3rem',
      color: '#BDBDBD',
      [theme.breakpoints.up('lg')]: {
        fontSize: '5rem',
      },
    },
  };
});

const ChatContent = ({
  value,
  setValue,
  storage,
  userStatus,
  setUserStatus,
  query,
  setQuery,
  PAGE_LIMIT,
  typingStatus, 
  setTypingStatus
}) => {
  const {
    chatReducer: {selectedUser},
  } = useSelector((state) => state);

  return (
    <>
      {selectedUser ? (
        <MessagesScreen>
          <ChatViewContainer
            selectedUser={selectedUser}
            value={value}
            setValue={setValue}
            storage={storage}
            userStatus={userStatus}
            setUserStatus={setUserStatus}
            query={query}
            setQuery={setQuery}
            PAGE_LIMIT={PAGE_LIMIT}
            typingStatus={typingStatus}
            setTypingStatus={setTypingStatus}
          />
        </MessagesScreen>
      ) : (
        <ScrollChatNoUser>
          <NoUserScreen />
        </ScrollChatNoUser>
      )}
    </>
  );
};

export default ChatContent;
