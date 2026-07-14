import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Initialize Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
};
// const firebaseConfig = {
//   apiKey: 'AIzaSyAzL_2jiVBhmiIUFGs2z6-cDR-Hgoedh3k',
//   authDomain: 'crema-react.firebaseapp.com',
//   databaseURL: 'https://crema-react.firebaseio.com',
//   projectId: 'crema-react',
//   storageBucket: 'crema-react.appspot.com',
//   messagingSenderId: '369173776768',
//   appId: '1:369173776768:web:895ded916749deebd31965',
//   measurementId: 'G-976YVMRB4R',
// };

const msgFirebase = firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
const githubAuthProvider = new firebase.auth.GithubAuthProvider();
const facebookAuthProvider = new firebase.auth.FacebookAuthProvider();
const twitterAuthProvider = new firebase.auth.TwitterAuthProvider();

export {
  auth,
  googleAuthProvider,
  githubAuthProvider,
  facebookAuthProvider,
  twitterAuthProvider,
  msgFirebase
};
