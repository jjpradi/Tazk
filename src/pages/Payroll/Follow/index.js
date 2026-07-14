import React, { useContext, useEffect, useState } from 'react';
import FollowRequestList from './FollowRequestList';
import { useDispatch, useSelector } from 'react-redux';
import apiCalls from 'utils/apiCalls';
import context from '../../../context/CreateNewButtonContext';
import { AcceptReqDelAction, GetfollowRequestAction, followUserAction } from 'redux/actions/customer_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import { Helmet } from 'react-helmet-async';
import { clientwebsocket, titleURL } from 'http-common';

function FollowRequestsPage() {
    const dispatch = useDispatch();
    let storage = getsessionStorage()
    const {
        customerReducer: {list_request},
    } = useSelector((state) => state);
    const {setLoaderStatusHandler, setModalTypeHandler} = useContext(context);
  
    useEffect(() => {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
         dispatch(GetfollowRequestAction({person_id : storage.person_id}))
      );
    }, []);

  // useEffect(() => {
  //   clientwebsocket.socket.onmessage = async (message) => {
  //     let { event } = JSON.parse(message.data)
  //     if (event === 'RequestSend') {
  //       apiCalls(
  //         setModalTypeHandler,
  //         setLoaderStatusHandler,
  //         dispatch(GetfollowRequestAction({ person_id: storage.person_id }))
  //       );
  //     }
  //   }
  // }
  // )

  const handleApprove = (senderId,id) => {
    dispatch(AcceptReqDelAction({id : id, person_id: senderId, follow_status:storage.person_id,status : 'approval' }));
    // setFollowRequests(followRequests.filter((request) => request.id !== requestId));
  };

  const handleDeny = (senderId,id) => {
      dispatch(AcceptReqDelAction({id : id, person_id: senderId, your_requests:storage.person_id,status : 'denied' }));
    // setFollowRequests(followRequests.filter((request) => request.id !== requestId));
  };

  return (
    <div>
      <Helmet>
        <meta charSet='utf-8' />
        <title>{titleURL} | FollowList </title>
      </Helmet>
      <h4>Follow Requests</h4>
      <FollowRequestList requests={list_request} onApprove={handleApprove} onDeny={handleDeny} />
    </div>
  );
}

export default FollowRequestsPage;
