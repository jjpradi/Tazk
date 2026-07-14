// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing the generated config
// var firebaseConfig = {
//   apiKey: "AIzaSyAnW5K0T14mokkK-WwwJWUCJXojPMB5d-k",
//   authDomain: "pos-cloud-messaging.firebaseapp.com",
//   projectId: "pos-cloud-messaging",
//   storageBucket: "pos-cloud-messaging.appspot.com",
//   messagingSenderId: "844214640919",
//   appId: "1:844214640919:web:461d110c6f0ef6028fd752"
// };

const firebaseConfig = {
  apiKey: "AIzaSyB407Q9MZY9JucTR57eRskuB-BShn4eolc",
  authDomain: "prostor-3e6e8.firebaseapp.com",
  projectId: "prostor-3e6e8",
  storageBucket: "prostor-3e6e8.appspot.com",
  messagingSenderId: "349761071051",
  appId: "1:349761071051:web:610cfb1e97fd203fadb84e",
  measurementId: "G-W6PTM4XBC4"
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {


  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  // self.registration.showNotification(notificationTitle,
  //   notificationOptions);
});










// importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
// importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

// firebase.initializeApp({
//   messagingSenderId: '%REACT_APP_MESSAGING_SENDER_ID%'
// });

// const messaging = firebase.messaging();

// messaging.setBackgroundMessageHandler(payload => {
//     const title = payload.title;
//     const options = {
//         body: payload.body,
//         icon: payload.icon
//     };

//     self.registration.showNotification(title, options);
// });

// // if ('serviceWorker' in navigator) {
// //   navigator.serviceWorker.register('../firebase-messaging-sw.js')
// //     .then(function(registration) {
// //       messaging.useServiceWorker(registration);
// //     }).catch(function(err) {
// //     });
// // }

