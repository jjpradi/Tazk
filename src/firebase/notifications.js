import React, {useState, useEffect} from 'react';
import {requestForToken} from './firebase.service';
import {onMessage, getMessaging} from 'firebase/messaging';
import {msgFirebase} from '../@crema/services/auth/firebase/firebase';
import { toast } from 'react-toast';
import _ from 'lodash';

function notifyCounter() {
  let counter = 1;
  return (reset) => {
    let temp = counter;
    reset === 'RESET' ? counter = 1 : counter++;
    return temp;
  }
}

let notifyFun = notifyCounter();

let notifyCounterReset = _.debounce(function () {
  notifyFun('RESET')
  }, 5000);
  


const Notifications = ({toastTrigger}) => {
  const [show, setShow] = useState(false);
  const [notification, setNotification] = useState({title: '', body: ''});
  const [isTokenFound, setTokenFound] = useState(false);

  // useEffect(() => {
  //     sendNtfy('hi', 'hiiiii');
  // }, [])

 

  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'granted') {
      requestForToken(setTokenFound, () => {});
    }
  }, []);

  useEffect(() => {
    if (!isTokenFound) return;
    const messaging = getMessaging(msgFirebase);

    const unsubscribe = onMessage(messaging, (payload) => {
      let c = notifyFun();
      setShow(true);
      const title = payload.data?.title || payload.notification?.title || '';
      const body = payload.data?.body1 ?? payload.data?.body ?? payload.notification?.body ?? '';
      setNotification({ title, body });
      if (c <= 4) {
        toastTrigger(title, body);
        notifyCounterReset();
      } else if (c == 5) {
        toastTrigger("Click to see more!", "");
      }
    });

    return () => unsubscribe();
  }, [isTokenFound]);

  // useEffect(() => {
  //     let data;

  //     async function tokenFunc() {
  //         data = await getToken(setTokenFound);
  //         if(data) {
  //         }
  //         return data;
  //     }

  //     tokenFunc();

  // }, [setTokenFound]);

  return <></>;
};

Notifications.prototype = {};

export default Notifications;
