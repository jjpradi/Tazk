import React, {useCallback} from 'react';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import SenderMessageItem from './SenderMessageItem';
import ReceiverMessageItem from './ReceiverMessageItem';
import AppList from '@crema/core/AppList';
import ListView from '@crema/core/AppList/ListView';

const MessageList = ({
  userMessages,
  authUser,
  selectedUser,
  onClickEditMessage,
  deleteMessage,
  PAGE_LIMIT,
  lastProductElementRef,
  lastMessageRef,
  employeeList
}) => {

 

  const renderList = useCallback(() => {
   
    return userMessages.messageData.map((item, index) => (
      <>
        {item.msg_from_uid === authUser.id ? (
          <SenderMessageItem
            authUser={authUser}
            item={item}
            key={item.msg_id}
            onClickEditMessage={onClickEditMessage}
            deleteMessage={deleteMessage}
            isPreviousSender={
              index > 0 &&
              item.msg_from_uid ===
                userMessages.messageData[index - 1].msg_from_uid
            }
            isLast={
              (index + 1 < userMessages.messageData.length &&
                item.msg_from_uid !==
                  userMessages.messageData[index + 1].msg_from_uid) ||
              index + 1 === userMessages.messageData.length
            }
            // lastProductElementRef={
            //   index === 0 && userMessages.messageData.length % PAGE_LIMIT === 0
            //     ? lastProductElementRef
            //     : ''
            // }
            lastProductElementRef={lastProductElementRef}
            lastProductItemID={index === 0 ? item.msg_id : ''}
            INDEX={index}
            lastMessageRef={
              userMessages.messageData.length === index + 1 &&
              userMessages.messageData.length % PAGE_LIMIT === 0
                ? lastMessageRef
                : ''
            }
            employeeList={employeeList}
          />
        ) : (
          <ReceiverMessageItem
            selectedUser={selectedUser}
            item={item}
            key={item.msg_id}
            isPreviousSender={
              index > 0 &&
              item.msg_from_uid ===
                userMessages.messageData[index - 1].msg_from_uid
            }
            isLast={
              (index + 1 < userMessages.messageData.length &&
                item.msg_from_uid !==
                  userMessages.messageData[index + 1].msg_from_uid) ||
              index + 1 === userMessages.messageData.length
            }
            lastProductElementRef={
              index === 0 && userMessages.messageData.length % PAGE_LIMIT === 0
                ? lastProductElementRef
                : ''
            }
            lastProductItemID={index === 0 ? item.msg_id : ''}
            INDEX={index}
            lastMessageRef={
              userMessages.messageData.length === index + 1 &&
              userMessages.messageData.length % PAGE_LIMIT === 0
                ? lastMessageRef
                : ''
            }
            employeeList={employeeList}
          />
        )}
      </>
    ));
  }, [userMessages]);

  return (
    <Box
      sx={{
        px: 5,
        py: 6,
      }}
    >
      {renderList()}
    </Box>
  );
};


export default MessageList;

MessageList.propTypes = {
  userMessages: PropTypes.object.isRequired,
  authUser: PropTypes.object.isRequired,
  selectedUser: PropTypes.object.isRequired,
  onClickEditMessage: PropTypes.func,
  deleteMessage: PropTypes.func,
};
