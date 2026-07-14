import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Box from '@mui/material/Box';
import {useDispatch, useSelector} from 'react-redux';
import {
  getConnectionMessages,
  onDeleteConversation,
  onDeleteMessage,
  onEditMessage,
  onSelectUser,
  onSendMessage,
} from '../../../../../../redux/actions';
import SendMessage from './SendMessage';
import MessagesList from './MessageList';
import moment from 'moment';
import Header from './Header';
import PropTypes from 'prop-types';
import IntlMessages from '@crema/utility/IntlMessages';
import AppsHeader from '@crema/core/AppsContainer/AppsHeader';
import AppsFooter from '@crema/core/AppsContainer/AppsFooter';
import {MessageType} from '@crema/services/db/apps/chat/connectionList';
import {useAuthUser} from '@crema/utility/AuthHooks';
import SimpleBarReact from 'simplebar-react';
import {getsessionStorage} from 'pages/common/login/cookies';
import {useCustomFetch} from 'utils/useCustomFetch';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  clientwebsocket,
  connect,
  initWebSocket,
  eventsList,
  eventList,
  websocketEvents,
  // socketio,
} from '../../../../../../http-common';

import {styled} from '@mui/material/styles';
import {CHAT_LIST_DATA, FETCH_START, FETCH_SUCCESS} from 'redux/actionTypes';
import {getInboxId} from '../..';
import {chatListDataAction} from 'redux/actions/message_actions';
import {Fab, Grid, Typography} from '@mui/material';
import {makeStyles} from 'tss-react/mui';
import useIntersection from 'utils/useIntersection';
import ScrollableFeed from 'library/react-scrollable-feed';
import {ScrollContainer} from '../../../../../../library/s';
import {debounceFunction} from 'utils/debounceFunction';
import {getDateTimeFormat, uid} from '../../../../../../utils/getTimeFormat';
import { Encrypt } from 'utils/encryption';
import { CreateNotificationAction, getNotificationTokenAction } from 'redux/actions/notification_actions';
import API_URLS from '../../../../../../utils/customFetchApiUrls';

const ScrollbarWrapper = styled(SimpleBarReact)(() => {
  return {
    display: 'flex',
    flexDirection: 'column-reverse',
    height: `calc(100% - 132px)`,
  };
});
const ScrollChatNoMainWrapper = styled('div')(() => {
  return {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign: 'center',
  };
});

const ChatViewContainer = ({
  value,
  setValue,
  storage,
  userStatus,
  setUserStatus,
  query,
  setQuery,
  PAGE_LIMIT,
  typingStatus,
  setTypingStatus,
}) => {
  const [message, setMessage] = useState('');
  const [isEdit, setIsEdit] = useState(false);

  const [paginationLastId, setPaginationLastId] = useState('MAX_NUMBER');
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const lastScrollHeight = useRef(0);
  const [allowGettingNextMessage, setAllowGettingNextMessage] = useState(false);
  
  const [selectedMessage, setSelectedMessage] = useState(null);
  const {
    chatReducer: {userMessages},
    messageReducer: {employeeList, chatListData},
    chatReducer: {selectedUser},
  } = useSelector((state) => state);
  const dispatch = useDispatch();

 
  const {first_name, last_name, employee_id, company_id, accessToken, user_img_url} = storage;

  const user = {
    id: employee_id,
    displayName: first_name.split('.')[1] || first_name.split('.')[0],
    photoURL: user_img_url
  };

 

  const customFetch = useCustomFetch();
  const observer = useRef(null);
  let bottomRef = useRef(null);

  const outerDiv = useRef(null);
  const innerDiv = useRef(null);

  const prevInnerDivHeight = useRef(null);

  const [showMessages, setShowMessages] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const lastMessageRef = useRef(null);
  const isLastMessageVisible = useIntersection(lastMessageRef, '0px');

  const ref_query = useRef(query);
  const ref_userMessages = useRef(userMessages);

  const lastProductElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          // setQuery({
          //   ...ref_query.current,
          //   lastId: node.getAttribute('data-lastitemid'),
          // });
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  );

  useEffect(() => {
  }, [query]);

  function next_message_set({event, content}) {
    setLoading(false);
    if (content.length > 0) {
      setHasMore(true);
      setQuery({...query, tempLastId: content[0].msg_id});
    }
    if (ref_userMessages.current?.messageData) {
      const temp = [...content, ...ref_userMessages.current.messageData];
      dispatch(getConnectionMessages({messageData: temp}));
    }
  }

  function liveChat_latest_50_message({event, content}) {
    
    if (content.length) {
      setQuery({...query, tempLastId: content[0].msg_id});
    }

    dispatch({type: FETCH_SUCCESS});
    dispatch(getConnectionMessages({messageData: content}));
  }

  useEffect(() => {
    websocketEvents.addListener({
      eventName: 'next_message_set',
      callbackFun: next_message_set,
      replaceOldFun: true,
    });
  }, []);

  useEffect(() => {
 
    websocketEvents.addListener({
      eventName: 'liveChat_latest_50_message',
      callbackFun: liveChat_latest_50_message,
      replaceOldFun: true,
    });
        return () => {
      dispatch(onSelectUser(null));
      dispatch({type: FETCH_SUCCESS});
    };
  }, []);

  useEffect(() => {
    ref_userMessages.current = userMessages;
  }, [userMessages]);

  useEffect(() => {
    ref_query.current = query;
  }, [query]);

  useEffect(() => {
    setLoading(true);
    setError(false);

    let timeoutId;

    const roomId = getInboxId(user.id, selectedUser.employee_id, company_id);

    if (query.lastId !== 'MAX_NUMBER') {
      // if (clientwebsocket.socket.readyState === WebSocket.OPEN) {
      //   clientwebsocket.socket.send(
      //     JSON.stringify({
      //       event: 'get_next_message_set',
      //       content: {roomId, query, user_id: user.id},
      //     }),
          
      //   );
      // }
    } else {
      setLoading(false);
      setHasMore(true);
    }
  }, [query.lastId]);

  // useEffect(() => {
  
  //   const roomId = getInboxId(user.id, selectedUser.employee_id, company_id);
  //   dispatch({type: FETCH_START});
  //   if (clientwebsocket.socket.readyState === WebSocket.OPEN) {
  //     clientwebsocket.socket.send(
  //       JSON.stringify({
  //         event: 'join_room',
  //         content: {roomId, user_id: user.id},
  //       }),
  //     );
  //   }

  //   prevInnerDivHeight.current = null;
  // }, [selectedUser, user.id]);

  const isNewMessageAvailable = useCallback(() => {
    const roomId = getInboxId(user.id, selectedUser.employee_id, company_id);

    let unseen_msg_count = 0;
    const currentInbox = chatListData.find((i) => i.inbox_id === roomId);

    if (selectedUser.employee_id > user.id) {
      unseen_msg_count = currentInbox?.p1_unseen_msg_count ?? 0;
    } else {
      unseen_msg_count = currentInbox?.p2_unseen_msg_count ?? 0;
    }
    return unseen_msg_count;
  }, [chatListData]);

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
  }

  async function sendFileMessageHelper(fileMessage, uploadType) {
    const formData = new FormData();
    formData.append('fileType', uploadType);
    // const body = {
    //   fileType: uploadType,
    //   files: [],
    // };
    for (const single_file of fileMessage) {
      // const {name, size, type} = single_file;
      // body.files.push({
      //   base64String: await toBase64(single_file),
      //   fileDetails: {name, size, mimetype: type},
      // });
      formData.append('files', single_file);
    }


    const { data: resData, loading, error } = await customFetch(
      API_URLS.POS_MESSAGE_UPLOAD_FILE,
      'POST',
      formData
    );
    if (error) {
      return;
    }

    const msg_content = [];
    const fileUrl = [];

    resData.forEach((i) => {
      const {fileName, size, mimetype, format, fileAccessUrl} = i;
      msg_content.push({
        fileName,
        size,
        mimetype,
        format,
      });

      fileUrl.push({
        fileName,
        fileAccessUrl,
      });
    });

    const data = {
      fileUrl,
      msg_content: JSON.stringify(msg_content),
      temp_msg_id: uid(),
      message_type: uploadType,
      sender: user.id,
      msg_from_uid: user.id,
      msg_to_uid: selectedUser.employee_id,
      time: moment().format(),
    };
    const roomId = getInboxId(user.id, selectedUser.employee_id, company_id);
    dispatch(onSendMessage(data));
    setMessage('');
    sendMessageHelper(data, roomId, user);
  }

  const sendFileMessage = async (fileMessage, uploadType) => {
    if (uploadType === 'PHOTO') {
      sendFileMessageHelper(fileMessage, uploadType);
    } else {
      // IF multiple document selected. Send each doc as individual message
      for (const single_file of fileMessage) {
        sendFileMessageHelper([single_file], uploadType);
      }
    }
  };

  const sendLocationMessage = async (fileMessage, uploadType) => {

    const data = {
      msg_content: JSON.stringify(fileMessage),
      temp_msg_id: uid(),
      message_type: uploadType,
      sender: user.id,
      msg_from_uid: user.id,
      msg_to_uid: selectedUser.employee_id,
      time: moment().format(),
    };

    const roomId = getInboxId(user.id, selectedUser.employee_id, company_id);
    dispatch(onSendMessage(data));
    setMessage('');
    sendMessageHelper(data, roomId, user);
  };

  const sendContactsMessage = async (contacts, uploadType) => {
    const data = {
      msg_content: contacts.map((i) => i.employee_id).join(','),
      temp_msg_id: uid(),
      message_type: uploadType,
      sender: user.id,
      msg_from_uid: user.id,
      msg_to_uid: selectedUser.employee_id,
      time: moment().format(),
    };

    const roomId = getInboxId(user.id, selectedUser.employee_id, company_id);
    dispatch(onSendMessage(data));
    setMessage('');
    sendMessageHelper(data, roomId, user);
  };

  const onSend = (message) => {
    const data = {
      ...selectedMessage,
      msg_content: message, //Encrypt(message)
      temp_msg_id: uid(),
      message_type: 'TEXT',
      sender: user.id,
      msg_from_uid: user.id,
      msg_to_uid: selectedUser.employee_id,
      time: moment().format(),
    };
    const roomId = getInboxId(user.id, selectedUser.employee_id, company_id);

    if (isEdit) {
      data.edited = true;
      dispatch(onEditMessage(data));
      setMessage('');
      setIsEdit(false);
      setSelectedMessage(null);
      if (clientwebsocket.socket.readyState === WebSocket.OPEN) {
        clientwebsocket.socket.send(
          JSON.stringify({
            event: 'liveChat_edit_message',
            content: {message: data, roomId, user_id: user.id},
          }),
        );
      }
    } else {
      dispatch(onSendMessage(data));
      setMessage('');
      sendMessageHelper(data, roomId, user);
    }
  };

  function sendMessageHelper(data, roomId, user) {
   
    if (clientwebsocket.socket.readyState === WebSocket.OPEN) {
      clientwebsocket.socket.send(
        JSON.stringify({
          event: 'liveChat_send_message',
          content: {message: data, roomId, user_id: user.id},
        }),
      );
    }

    lastScrollHeight.current = null;
    prevInnerDivHeight.current = null;
    if (value === 0) {
      if (clientwebsocket.socket.readyState === WebSocket.OPEN) {
        clientwebsocket.socket.send(
          JSON.stringify({
            event: 'get_inbox',
            content: {emp_id: employee_id},
          }),
        );
      }
    }

    if (clientwebsocket.socket.readyState === WebSocket.OPEN) {
      clientwebsocket.socket.send(
        JSON.stringify({
          event: 'typing',
          content: {
            message: 'stop',
            roomId,
            other_empId: selectedUser.employee_id,
          },
        }),
      );
    }

    sendNotifications(data)
  }

  function sendNotifications(data){
    if(data.message_type == 'TEXT' ){
      let type = 'Chat Notification';
      let data1 = {
        type,
        employee_id : data.msg_to_uid ,
        content: data.msg_content.length > 20 ? data.msg_content.slice(0, 20) + '...' : data.msg_content,
        title: 'Chat'
      };
      NotificationApi(data1)
    
    }

   else if(data.message_type == "PHOTO" ){
      let type = 'Chat Notification';
      let data1 = {
        type,
        employee_id : data.msg_to_uid ,
        content: 'Photo received',
        title: 'Chat'
      };

      NotificationApi(data1)
    }

    else if(data.message_type == "DOCUMENT" ){
      
      let type = 'Chat Notification';
      let data1 = {
        type,
        employee_id : data.msg_to_uid ,
        content: 'Document received',
        title: 'Chat'
      };

      NotificationApi(data1)
    }

    
    else if(data.message_type == "CONTACT" ){
      let type = 'Chat Notification';
      let data1 = {
        type,
        employee_id : data.msg_to_uid ,
        content: 'Contact received',
        title: 'Chat'
      };

      NotificationApi(data1)
    }

    else if(data.message_type == "LOCATION" ){
    
      let type = 'Chat Notification';
      let data1 = {
        type,
        employee_id : data.msg_to_uid ,
        content: 'Location received',
        title: 'Chat'
      };

      NotificationApi(data1)
    }

  }

  function NotificationApi(data1){
    dispatch(
      getNotificationTokenAction(data1, (res) => {
        if (res?.status === 200) {
          dispatch(
            CreateNotificationAction({
              content_body: res?.data.body,
              title: res?.data?.title,
              time: getDateTimeFormat(new Date()),
              active: '1',
            
            }),
          );
        }
      }),
    );
  }

  const onClickEditMessage = (data) => {
   
    if (data.message_type === 'TEXT') {
      setIsEdit(true);
      setMessage(data.msg_content);
      setSelectedMessage(data);
    }
  };

  const deleteMessage = async (data) => {


    const inbox_id = getInboxId(user.id, selectedUser.employee_id, company_id);
    const body = {
      msg_type: data.message_type,
      ...(['PHOTO', 'DOCUMENT'].includes(data.message_type) && {
        fileName: data.msg_content,
      }),
    };
    const { data: resData, loading, error } = await customFetch(
      API_URLS.DELETE_POS_MESSAGE(user.id, inbox_id, data.msg_id),
      'PUT',
      body
    );
    data.msg_content = 'This message has been deleted';
    data.message_type = 'TEXT';
    dispatch(onEditMessage(data));
  };

  const deleteConversation = async () => {
    const inbox_id = getInboxId(user.id, selectedUser.employee_id, company_id);
    const { data, loading, error } = await customFetch(
      API_URLS.DELETE_POS_INBOX(inbox_id, user.id),
      'DELETE',
      {}
    );
    dispatch({type: FETCH_START});
    dispatch(getConnectionMessages({messageData: []}));

    // Update inbox list
    if (value === 0) {
      if (clientwebsocket.socket.readyState === WebSocket.OPEN) {
        clientwebsocket.socket.send(
          JSON.stringify({event: 'get_inbox', content: {emp_id: employee_id}}),
        );
      }
    }

    // reset chat screen
    dispatch(onSelectUser(null));

    // dispatch(onDeleteConversation(selectedUser.channelId));
  };

  const handleOnScroll = (e) => {
    const innerDivHeight = innerDiv.current?.clientHeight;
    const outerDivHeight = outerDiv.current?.clientHeight;
    const outerDivScrollTop = outerDiv.current?.scrollTop;


    if (
      Math.abs(
        prevInnerDivHeight.current - (outerDivScrollTop + outerDivHeight),
      ) < 100
    ) {

      handleMarkMsgRead();
    }
    if (outerDivScrollTop === 0) {
      // if (allowGettingNextMessage) {
      setQuery({...query, lastId: query.tempLastId});
      // }

      lastScrollHeight.current = prevInnerDivHeight.current - 10;
      prevInnerDivHeight.current = null;
    }
  };

  function debounce(func, wait) {
    let timeout;
    return (e) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(func, wait, e);
    };
  }

  const debouncedHandleOnScroll = debounce(handleOnScroll, 2000);

  useEffect(() => {
    if (
      userMessages &&
      userMessages.messageData &&
      userMessages.messageData.length > 0
    ) {
      const outerDivHeight = outerDiv.current?.clientHeight;
      const innerDivHeight = innerDiv.current?.clientHeight;
      const outerDivScrollTop = outerDiv.current?.scrollTop;

      if (
        !prevInnerDivHeight.current ||
        Math.abs(
          prevInnerDivHeight.current - (outerDivScrollTop + outerDivHeight),
        ) < 100
      ) {
        if (lastScrollHeight.current) {
          outerDiv.current.scrollTop =
            innerDivHeight - lastScrollHeight.current;
        } else {
          outerDiv.current.scrollTo({
            top: innerDivHeight - outerDivHeight,
            left: 0,
            behavior: 'smooth',
          });
        }
        // setAllowGettingNextMessage(true);

        // handleMarkMsgRead();
        setShowMessages(true);
      } else {
        setShowScrollButton(true);
      }

      prevInnerDivHeight.current = innerDivHeight;
    }
  }, [userMessages]);

  function handleMarkMsgRead() {
    const roomId = getInboxId(user.id, selectedUser.employee_id, company_id);

    const unseenColName =
      user.id < selectedUser.employee_id
        ? 'p1_unseen_msg_count'
        : 'p2_unseen_msg_count';
    if (userMessages.messageData.slice(-1)[0].msg_id) {
      if (clientwebsocket.socket.readyState === WebSocket.OPEN) {
        clientwebsocket.socket.send(
          JSON.stringify({
            event: 'mark_msg_as_read',
            content: {
              roomId,
              last_seen_msg_id: userMessages.messageData.slice(-1)[0].msg_id,
              colToUpdate: unseenColName,
            },
          }),
        );
      }
    }

    const temp = chatListData.map((i) =>
      i.inbox_id === roomId ? {...i, [unseenColName]: 0} : {...i},
    );
    dispatch(chatListDataAction(temp));
  }

  const handleScrollButtonClick = () => {
    const outerDivHeight = outerDiv.current.clientHeight;
    const innerDivHeight = innerDiv.current.clientHeight;

    handleMarkMsgRead();

    outerDiv.current.scrollTo({
      top: innerDivHeight - outerDivHeight,
      left: 0,
      behavior: 'smooth',
    });

    setShowScrollButton(false);
  };

  return (
    <Box
      sx={{
        height: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        '& .apps-header': {
          minHeight: 72,
        },
      }}
    >
      <AppsHeader>
        <Header
          selectedUser={selectedUser}
          deleteConversation={deleteConversation}
          storage={storage}
          userStatus={userStatus}
          typingStatus={typingStatus}
        />
      </AppsHeader>

      {userMessages && user ? (
        <Grid
          ref={outerDiv}
          onScroll={debouncedHandleOnScroll}
          style={{
            overflowY: 'scroll',
            position: 'relative',
            height: 'calc(100% - 132px)',
            display: 'flex',
            flexDirection: 'column',
          }}
          sx={{
            '&::-webkit-scrollbar': {
              width: 5,
            },
            '&::-webkit-scrollbar-track': {
              // backgroundColor: "#E0E0E0"
              '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#B2B2B2',
              borderRadius: 2,
              border: '2px solid white',
            },
          }}
        >
          {loading && (
            <Typography style={{color: 'white', textAlign: 'right'}}>
              Loading ...
            </Typography>
          )}
          <Grid
            style={{
              opacity: showMessages ? 1 : 0,
              position: 'relative',
              transitionProperty: 'all',
              transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
              transitionDuration: ['300ms', '300ms'],
              flexGrow: 1,
            }}
            // className="relative transition-all duration-300"
            // style={{ opacity: showMessages ? 1 : 0 }}
            ref={innerDiv}
          >
            <MessagesList
              userMessages={userMessages}
              authUser={user}
              selectedUser={selectedUser}
              onClickEditMessage={onClickEditMessage}
              deleteMessage={deleteMessage}
              lastProductElementRef={lastProductElementRef}
              PAGE_LIMIT={PAGE_LIMIT}
              lastMessageRef={lastMessageRef}
              employeeList={employeeList}
            />
          </Grid>

          <div
            style={{
              position: 'sticky',
              bottom: 0,
              right: 0,
              margin: '10px',
              zIndex: 10,
              display: 'flex',
              alignItems: 'flex-end',
              flexDirection: 'column',
            }}
          >
            <Grid
              style={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              {isNewMessageAvailable() > 0 && showMessages ? (
                <Grid
                  style={{
                    backgroundColor: '#0A8FDC',
                    width: '30px',
                    height: '30px',
                    lineHeight: '30px',
                    borderRadius: '50%',
                    fontSize: '13px',
                    color: '#fff',
                    textAlign: 'center',
                  }}
                >
                  {isNewMessageAvailable()}
                </Grid>
              ) : null}
              <Fab size='small' color='primary' aria-label='add'>
                <ExpandMoreIcon onClick={() => handleScrollButtonClick()} />
              </Fab>
            </Grid>
          </div>
        </Grid>
      ) : (
        <ScrollChatNoMainWrapper>
          <Box
            component='span'
            sx={{
              fontSize: 18,
              color: 'grey.500',
            }}
          >
            <IntlMessages id='chatApp.sayHi' /> {selectedUser.name}
          </Box>
        </ScrollChatNoMainWrapper>
      )}

      <AppsFooter>
        <SendMessage
          currentMessage={message}
          attachmentFunctions={{
            PHOTO: sendFileMessage,
            DOCUMENT: sendFileMessage,
            LOCATION: sendLocationMessage,
            CONTACT: sendContactsMessage,
          }}
          onSendMessage={onSend}
          user={user}
          storage={storage}
          selectedUser={selectedUser}
        />
      </AppsFooter>
    </Box>
  );
};

export default ChatViewContainer;

ChatViewContainer.propTypes = {
  selectedUser: PropTypes.object.isRequired,
};
