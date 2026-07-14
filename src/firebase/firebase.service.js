import axios from 'axios';
import {getMessaging, getToken, onMessage } from 'firebase/messaging';
// import app from './firebase.config';
import {msgFirebase} from '../@crema/services/auth/firebase/firebase'

const VITE_VAPID_KEY = import.meta.env.VITE_VAPID_KEY;
const VITE_SERVER_KEY = import.meta.env.VITE_SERVER_KEY;

const messaging = getMessaging(msgFirebase);

export const sendNtfy = (to_address, title, body) => {
  const data = {
    registration_ids: to_address,
    // registration_ids: ["esN8bZcmSPw8p_316oc7St:APA91bEv6lamn7dKi_z2izcVxARiTjpKJ_jeEKV62Hi-Af5OD_Ko8zWi9Tvi5sISJIAceXwYMkko5pqRxaFAkbcRZp-7aJEutH4WmAheMT_YKiXzES65tUwBZSWgCgTBxa0RVk-PifFS","fMqcvzCoWX8CS6wHk9jwGQ:APA91bEO9ADVcY9cQUNwydAe1j14mnhWrk2HnfAvPG1LMIQqrmSpmC1PxQ0YdLAtBZNj0aEAnHlaKsSXibwR7tceS0i959B0pIiPSBwMMwYW8DSDRXpI__NyHv4_XeTHk_QW9cjVUHvQ", "essz_0nqyNEns8QPQka1gv:APA91bGOQ6KTqsn7sAhSb5PS7HqZK09lLb723g0AmMRDwtKjn6fkN8aB_pSki-NfzngXYsvIu4g37WTwoPnltiuZt8sI-zKwh_uMec6D1odArls-5tAOXpSvWDukYAG2tvsZX8p1rmZD",
    // "fEpBcn9tW68OpMvMN2PfyW:APA91bEEPxOv6Rm5QEpE8_M_KOOtUHc0PagopOo_oIe9ia68L5_t0zaYGCluu9znVsl5EDHcK_W4aHvoLyn9WriMTNSxeu0NprCRjiCzoPLCg-wiD6pHldzwIi0gzXm8DQmP7AEkvLAP"],
    // to: "esN8bZcmSPw8p_316oc7St:APA91bEv6lamn7dKi_z2izcVxARiTjpKJ_jeEKV62Hi-Af5OD_Ko8zWi9Tvi5sISJIAceXwYMkko5pqRxaFAkbcRZp-7aJEutH4WmAheMT_YKiXzES65tUwBZSWgCgTBxa0RVk-PifFS",
    // to: 'essz_0nqyNEns8QPQka1gv:APA91bGOQ6KTqsn7sAhSb5PS7HqZK09lLb723g0AmMRDwtKjn6fkN8aB_pSki-NfzngXYsvIu4g37WTwoPnltiuZt8sI-zKwh_uMec6D1odArls-5tAOXpSvWDukYAG2tvsZX8p1rmZD',
    // content_available: true,
    data: {
      body: body,
      title: title,
    },
    // click_action: 'https://companycreation.salesplay.in/',
    // ,
    // data: {
    //   extra: "juice"
    // }
  };
  axios({
    method: 'post',
    url: 'https://fcm.googleapis.com/fcm/send',
    data: data,
    headers: {
      Authorization: `key=${VITE_SERVER_KEY}`,
      'Content-Type': 'application/json',
    },
  })
    .then(function (response) {
      //handle success
    })
    .catch(function (response) {
      //handle error
    });
};

export const requestForToken = async (setTokenFound, setToken) => {
  return getToken(messaging, {vapidKey: VITE_VAPID_KEY})
    .then((currentToken) => {
      console.log("currentToken",currentToken)
      if (currentToken) {
        setTokenFound(true);
        setToken(currentToken);
      } else {
        // Show permission request UI
        console.log(
          'No registration token available. Request permission to generate one.',
        );
        setTokenFound(false);
      }
    })
    .catch((err) => {
      console.log('An error occurred while retrieving token. ', err);
    });
};






// export const deleteFSMToken = async () => {
//   console.log("111");
//   try {
//     await deleteToken();
//     console.log("tokenDeleted");
//   } catch (err) {
//     console.log("An error occurred while deleting token. ", err);
//   }
// };

// const deleteToken = async () => {
//   try {
//     // Assuming swRegistration is properly initialized
//     const registration = await navigator.serviceWorker.ready;
//     const currentToken = await registration.pushManager.getSubscription();
    
//     console.log("registration111",currentToken)
//     if (currentToken) {
//       // Unsubscribe from push notifications
//       await currentToken.unsubscribe();
//       console.log("Token successfully deleted");
//     } else {
//       console.log("No token available to delete");
//     }
//   } catch (error) {
//     console.error("An error occurred while deleting token:", error);
//     throw error; // Rethrow the error to handle it outside
//   }
// };


export const employeebulkForToken =  () => {
  var token =  getToken(messaging, {vapidKey: VITE_VAPID_KEY})
    // .then((currentToken) => {
      // if (currentToken) {
      //   // setTokenFound(true);
      //   // setToken(currentToken);
      //   return currentToken
      // } else {
      //   // Show permission request UI
      //   // setTokenFound(false);
      // }
    // })
    // .catch((err) => {
    // });
      return token;
    
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
