import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import ChatSideBar from './ChatSideBar';
import ChatContent from './ChatContent';
import {
  getConnectionList,
  getConnectionMessages,
  onEditMessage,
  onSelectUser,
  onSendMessage,
  updateNewMessageId,
} from '../../../../redux/actions';
import {useIntl} from 'react-intl';
import AppsContainer from '@crema/core/AppsContainer';
import {getsessionStorage} from 'pages/common/login/cookies';
import {clientwebsocket} from 'http-common';
import {eventList, websocketEvents} from '../../../../http-common';
import {CHAT_LIST_DATA, FETCH_SUCCESS, LIST_EMPLOYEE} from 'redux/actionTypes';
import {Helmet} from 'react-helmet-async';
import {
  chatListDataAction,
  listEmployeeAction,
} from '../../../../redux/actions/message_actions';
import { titleURL } from 'http-common';

const PAGE_LIMIT = 30;

const Chat = () => {
  const dispatch = useDispatch();
  let storage = getsessionStorage();
  const {company_id, employee_id, first_name} = storage;
  const [value, setValue] = useState(0);
  const [userStatus, setUserStatus] = useState('offline');
  const [typingStatus, setTypingStatus] = useState(null);



  const [query, setQuery] = useState({
    searchType: 'initial',
    searchString: '',
    limit: PAGE_LIMIT,
    lastId: 'MAX_NUMBER',
  });

  const user = {
    id: employee_id,
    displayName: first_name.split('.')[1] || first_name.split('.')[0],
  };

  const {
    messageReducer: {employeeList, chatListData},
    chatReducer: {selectedUser, userMessages},
  } = useSelector((state) => state);

  const ref_chatListData = useRef(chatListData);
  const ref_selectedUser = useRef(selectedUser);
  const ref_employeeList = useRef(employeeList);

  function liveChat_receive_message({event, content}) {
    const {roomId, message, inboxData} = content;
    let temp = [];

    if (!ref_selectedUser.current) {
      let indx = ref_chatListData.current.findIndex(
        (i) => i.inbox_id === inboxData[0].inbox_id,
      );

      if(indx === -1){
        temp = [...ref_chatListData.current, ...inboxData];
      }else{
        temp = ref_chatListData.current.map((i) =>
          i.inbox_id === inboxData[0].inbox_id ? {...inboxData[0]} : {...i},
        );
      }
    } else if (
      ref_selectedUser.current &&
      roomId ===
        getInboxId(user.id, ref_selectedUser.current.employee_id, company_id)
    ) {
      dispatch(onSendMessage(message));

      temp = ref_chatListData.current.map((i) =>
        i.inbox_id === roomId ? {...inboxData[0]} : {...i},
      );
    } else {
      temp = ref_chatListData.current.map((i) =>
        i.inbox_id === inboxData[0].inbox_id &&
        ref_selectedUser.current.employee_id !== i.msg_from_uid
          ? {...inboxData[0]}
          : {...i},
      );
    }
    dispatch(chatListDataAction(temp));
  }

  function liveChat_receive_edit_message({event, content}) {
    const {roomId, message, inboxData} = content;
    let temp = [];

    if (!ref_selectedUser.current && ref_chatListData.current.length) {
      temp = ref_chatListData.current.map((i) =>
        i.inbox_id === inboxData[0].inbox_id ? {...inboxData[0]} : {...i},
      );
    } else if (
      ref_selectedUser.current &&
      roomId ===
        getInboxId(user.id, ref_selectedUser.current.employee_id, company_id)
    ) {
      dispatch(onEditMessage(message));

      temp = ref_chatListData.current.map((i) =>
        i.inbox_id === roomId ? {...inboxData[0]} : {...i},
      );
    } else {
      temp = ref_chatListData.current.map((i) =>
        i.inbox_id === inboxData[0].inbox_id &&
        ref_selectedUser.current.employee_id !== i.msg_from_uid
          ? {...inboxData[0]}
          : {...i},
      );
    }
    dispatch(chatListDataAction(temp));
  }

  function liveChat_msg_id_for_new_message({event, content}) {
    const {roomId, message, inboxData} = content;
    dispatch(updateNewMessageId(message));
  }

  function inbox_function({event, content}) {
    dispatch(chatListDataAction(content));
  }

  function liveChat_latest_50_message({event, content}) {
    if (content.length) {
      setQuery({...query, tempLastId: content[0].msg_id});
    }

    dispatch({type: FETCH_SUCCESS});
    dispatch(getConnectionMessages({messageData: content}));
  }

  function handleTypingStatus({event, content}) {
    const {message, roomId, inboxData} = content;
    const status = message === 'start' ? 'typing...' : null;
    if (ref_selectedUser.current) {
      setTypingStatus(status);
    }
    const temp = ref_chatListData.current.map((i) =>
      i.inbox_id === roomId ? {...inboxData[0], typingStatus: status} : {...i},
    );
    dispatch(chatListDataAction(temp));
  }

  function statusUpdateInChatList({event, content}) {
    const online_emp_id = parseInt(content.userEventName.split('E')[1]);

    if (online_emp_id !== user.id && ref_chatListData.current.length) {
      const updatedStatus = ref_chatListData.current.map((i) => {
        if (ref_selectedUser.current?.employee_id === online_emp_id) {
          setUserStatus(content.status);
        }
        return i.other_empId === online_emp_id
          ? {...i, status: content.status}
          : i;
      });
      dispatch(chatListDataAction(updatedStatus));
    }

    if (online_emp_id !== user.id && ref_employeeList.current.length) {
      const updatedStatus = ref_employeeList.current.map((i) => {
        if (ref_selectedUser.current?.employee_id === online_emp_id) {
          setUserStatus(content.status);
        }
        return i.employee_id === online_emp_id
          ? {...i, status: content.status}
          : i;
      });
      dispatch({
        type: LIST_EMPLOYEE,
        payload: updatedStatus
      });
    }
  }

  useEffect(() => {
    const inboxEventName = `inbox_C${company_id}_E${employee_id}`;

    websocketEvents.addListener({
      eventName: inboxEventName,
      callbackFun: inbox_function,
    });
    websocketEvents.addListener({
      eventName: 'liveChat_latest_50_message',
      callbackFun: liveChat_latest_50_message,
      replaceOldFun: true,
    });
    websocketEvents.addListener({
      eventName: 'online_status_receive',
      callbackFun: statusUpdateInChatList,
      replaceOldFun: true,
    });
    websocketEvents.addListener({
      eventName: 'typing',
      callbackFun: handleTypingStatus,
      replaceOldFun: true,
    });
    websocketEvents.addListener({
      eventName: 'liveChat_receive_message',
      callbackFun: liveChat_receive_message,
      replaceOldFun: true,
    });
    websocketEvents.addListener({
      eventName: 'liveChat_receive_edit_message',
      callbackFun: liveChat_receive_edit_message,
      replaceOldFun: true,
    });
    websocketEvents.addListener({
      eventName: 'liveChat_msg_id_for_new_message',
      callbackFun: liveChat_msg_id_for_new_message,
      replaceOldFun: true,
    });

    !(employeeList.length > 0) && dispatch(listEmployeeAction());

    return () => {
      dispatch(onSelectUser(null));
      dispatch({type: FETCH_SUCCESS});
      dispatch({type: CHAT_LIST_DATA, payload: []})
      dispatch({type: LIST_EMPLOYEE, payload: []})
    };
  }, []);

  useEffect(() => {
    ref_chatListData.current = chatListData;
  }, [chatListData]);

  useEffect(() => {
    ref_employeeList.current = employeeList;
  }, [employeeList]);

  useEffect(() => {
    ref_selectedUser.current = selectedUser;
    setQuery({
      searchType: 'initial',
      searchString: '',
      limit: PAGE_LIMIT,
      lastId: 'MAX_NUMBER',
    });
  }, [selectedUser]);

  const {messages} = useIntl();
  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | Chat </title>
      </Helmet>
      <AppsContainer
        title={messages['chatApp.chat'].toString()}
        sidebarContent={
          <ChatSideBar
            storage={storage}
            value={value}
            setValue={setValue}
            userStatus={userStatus}
            setUserStatus={setUserStatus}
          />
        }
      >
        <ChatContent
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
      </AppsContainer>
    </>
  );
};

export default Chat;

export function getInboxId(msg_from, msg_to, company_id) {
  const sorted_id = [msg_from, msg_to].sort((a, b) => a - b).join('_');
  const id = `C${company_id}_INBX_${sorted_id}`;
  return id;
}
