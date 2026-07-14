import React, {createContext, useContext, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {
  auth,
  facebookAuthProvider,
  githubAuthProvider,
  googleAuthProvider,
  twitterAuthProvider,
} from './firebase';
import {useDispatch} from 'react-redux';
import {
  FETCH_ERROR,
  FETCH_START,
  FETCH_SUCCESS,
} from 'shared/constants/ActionTypes';
import Cookies from 'universal-cookie';
import { useNavigate } from 'react-router-dom';
import login_services from 'services/login_services';
import {getAccessToken, getsessionStorage,} from 'pages/common/login/cookies';
import { RESET_STORE } from 'redux/actionTypes';
import {getMessaging, getToken, onMessage,deleteToken } from 'firebase/messaging';
import socketManager from 'utils/socketManager';
// import { deleteFSMToken } from 'firebase/firebase.service';


const FirebaseContext = createContext();
const FirebaseActionsContext = createContext();

export const useFirebase = () => useContext(FirebaseContext);

export const useFirebaseActions = () => useContext(FirebaseActionsContext);

const FirebaseAuthProvider = ({children}) => {
  const [firebaseData, setFirebaseData] = useState({
    user: undefined,
    isLoading: true,
    isAuthenticated: false,
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();



  useEffect(() => {
    // const getAuthUser = auth.onAuthStateChanged(
    //   (user) => {
    //     setFirebaseData({
    //       user: user,
    //       isAuthenticated: Boolean(user),
    //       isLoading: false,
    //     });
    //   },
    //   () => {
    //     setFirebaseData({
    //       user: firebaseData.user,
    //       isLoading: false,
    //       isAuthenticated: false,
    //     });
    //   },
    //   (completed) => {
    //     setFirebaseData({
    //       user: firebaseData.user,
    //       isLoading: false,
    //       isAuthenticated: completed,
    //     });
    //   },
    // );

    // return () => {
    //   getAuthUser();
    // };
    // const cookies = new Cookies();
    const storage = getsessionStorage()
    const user = storage

    setFirebaseData({
      user: user,
      isLoading: false,
      isAuthenticated: Boolean(user),
    });
  }, []);

  const getProvider = (providerName) => {
    switch (providerName) {
      case 'google': {
        return googleAuthProvider;
      }
      case 'facebook': {
        return facebookAuthProvider;
      }
      case 'twitter': {
        return twitterAuthProvider;
      }
      case 'github': {
        return githubAuthProvider;
      }
      default:
        return googleAuthProvider;
    }
  };

  const signInWithPopup = async (providerName) => {
    dispatch({type: FETCH_START});
    try {
      const {user} = await auth.signInWithPopup(getProvider(providerName));
      setFirebaseData({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      dispatch({type: FETCH_SUCCESS});
    } catch (error) {
      setFirebaseData({
        ...firebaseData,
        isAuthenticated: false,
        isLoading: false,
      });
      dispatch({type: FETCH_ERROR, payload: error.message});
    }
  };

  const signInWithEmailAndPassword = async ({email, password}) => {
    dispatch({type: FETCH_START});
    try {
      const {user} = await auth.signInWithEmailAndPassword(email, password);
      setFirebaseData({user, isAuthenticated: true, isLoading: false});
      dispatch({type: FETCH_SUCCESS});
    } catch (error) {
      setFirebaseData({
        ...firebaseData,
        isAuthenticated: false,
        isLoading: false,
      });
      dispatch({type: FETCH_ERROR, payload: error.message});
    }
  };
  const createUserWithEmailAndPassword = async ({name, email, password}) => {
    dispatch({type: FETCH_START});
    try {
      const {user} = await auth.createUserWithEmailAndPassword(email, password);
      await auth.currentUser.sendEmailVerification({
        url: window.location.href,
        handleCodeInApp: true,
      });
      await auth.currentUser.updateProfile({
        displayName: name,
      });
      setFirebaseData({
        user: {...user, displayName: name},
        isAuthenticated: true,
        isLoading: false,
      });
      dispatch({type: FETCH_SUCCESS});
    } catch (error) {
      setFirebaseData({
        ...firebaseData,
        isAuthenticated: false,
        isLoading: false,
      });
      dispatch({type: FETCH_ERROR, payload: error.message});
    }
  };
  const storage = getsessionStorage();
  const company_type = storage?.company_type;
  const logout = async () => {
    setFirebaseData({...firebaseData, isLoading: true});
    const user = getsessionStorage()

    try {
      // blacklisting access_token from after logout
      let token = getAccessToken();
      let browser_id = localStorage.getItem('tazk_browser_id')
      if (browser_id) {
        browser_id = JSON.parse(browser_id);
      }
      const res = await login_services.logout({access_token: token, employee_id: user.employee_id, browserId: browser_id?.id});

      if(res.status === 200){
        // Only clear client state after server confirms logout succeeded
        dispatch({type: RESET_STORE, payload: undefined})
        setFirebaseData({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
        localStorage.removeItem('design');
        sessionStorage.clear();
        socketManager.disconnectAll();
        navigate('/signin');
      }
    } catch (error) {
      // Even on server error, clear client state so user isn't stuck
      dispatch({type: RESET_STORE, payload: undefined})
      setFirebaseData({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      localStorage.removeItem('design');
      sessionStorage.clear();
      socketManager.disconnectAll();
      navigate('/signin');
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        ...firebaseData,
      }}
    >
      <FirebaseActionsContext.Provider
        value={{
          signInWithEmailAndPassword,
          createUserWithEmailAndPassword,
          signInWithPopup,
          logout,
          setFirebaseData
        }}
      >
        {children}
      </FirebaseActionsContext.Provider>
    </FirebaseContext.Provider>
  );
};
export default FirebaseAuthProvider;

FirebaseAuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
