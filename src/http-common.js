import React from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import {io} from 'socket.io-client';
import {w3cwebsocket as W3CWebSocket} from 'websocket';
import PouchDB from 'pouchdb';
const db = new PouchDB('network-error');
import moment from 'moment' 

import cookie, {
  getAccessToken,
  getRefreshToken,
  updateAccessToken,
  updateRefreshToken
} from 'pages/common/login/cookies';
import {useAuthMethod, useAuthUser} from './@crema/utility/AuthHooks';
import ROUTE_PREFIXES from 'utils/routesprefix';

import socketManager from 'utils/socketManager';

const servers = {
  local: {
    host: 'localhost',
    base_url: 'http://localhost:4000',
    web_socket_url: 'ws://localhost:4000',
    socket_io_url: 'http://localhost:4100',
    title: 'Tazk'
  },
  dev: {
    host: 'dev.tazk.in',
    base_url: 'https://devserver.tazk.in',
    web_socket_url: 'wss://devserver.tazk.in',
    socket_io_url: 'https://devserver.tazk.in',
    title : 'Tazk'
  },
  aws: {
    host: 'erp.tazk.in',
    base_url: 'https://server.tazk.in',
    web_socket_url: 'wss://server.tazk.in',
    socket_io_url: 'https://server.tazk.in',
    title : 'Tazk'
  },
  payroll: {
    host: 'payroll.tazk.in',
    base_url: 'https://server.payroll.tazk.in',
    web_socket_url: 'wss://server.payroll.tazk.in',
    socket_io_url: 'https://server.payroll.tazk.in',
    title : 'Tazk'
  },
  ms: {
    host: 'ms.tazk.in',
    base_url: 'https://server.payroll.tazk.in',
    web_socket_url: 'wss://server.payroll.tazk.in',
    socket_io_url: 'https://server.payroll.tazk.in',
    title : 'Tazk'
  }
};

const location = window.location;

export const loginUrl =
  location.hostname === 'signupdev.tazk.in'
    ? servers.dev.host_url
    : location.hostname === 'signup.tazk.in'
    ? servers.aws.host_url
      : location.hostname === 'companycreation.salesplay.in'
      ? servers.prod.host_url
        : servers.local.host_url;

export const baseURL =
  
    location.hostname === 'dev.tazk.in'
    ? servers.dev.base_url
    : location.hostname === 'erp.tazk.in'
    ? servers.aws.base_url
    : location.hostname === 'payroll.tazk.in'
    ? servers.payroll.base_url
    : location.hostname === 'ms.tazk.in'
    ? servers.ms.base_url
    : servers.payroll.base_url;

export const titleURL =
  
    location.hostname === 'dev.tazk.in'
    ? servers.dev.title
    : location.hostname === 'erp.tazk.in'
    ? servers.aws.title
    : location.hostname === 'payroll.tazk.in'
    ? servers.payroll.title
    : location.hostname === 'ms.tazk.in'
    ? servers.ms.title
    : servers.local.title;

export const hostURL =
  
    location.hostname === 'dev.tazk.in'
    ? servers.dev.host
    : location.hostname === 'erp.tazk.in'
    ? servers.aws.host
    : location.hostname === 'payroll.tazk.in'
    ? servers.payroll.host
    : location.hostname === 'ms.tazk.in'
    ? servers.ms.host
    : servers.local.host;

export const webSocketURL =

    location.hostname === 'dev.tazk.in'
    ? servers.dev.web_socket_url
    : location.hostname === 'erp.tazk.in'
    ? servers.aws.web_socket_url
    : location.hostname === 'payroll.tazk.in'
    ? servers.payroll.web_socket_url
    : location.hostname === 'ms.tazk.in'
    ? servers.ms.web_socket_url
    : servers.payroll.web_socket_url;

const cookies = new Cookies(); 

const instance = axios.create({
  baseURL,
  timeout: 100000,
});

instance.interceptors.request.use(
  (config) => {
    let token = getAccessToken(); 
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;   
      config.headers['Exactlocation'] = window.location.pathname  
    }

    const firstSegment = config.url.split('/')[1];    
    console.log("firstSegment",firstSegment)
    if (ROUTE_PREFIXES[firstSegment]) {
      config.url = config.url.replace(`/${firstSegment}`, ROUTE_PREFIXES[firstSegment]);
    }

if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }    return config;
  },
  (error) => Promise.reject(error)
);

let refreshTokenPromise; // this holds any in-progress token refresh requests 
let handlingPouchDb;

// instance.interceptors.response.use(
//   (response) => {
//     if(!handlingPouchDb){
//       handlingPouchDb = true;
//       db.allDocs({include_docs: true}).then(allDocs => {
//         const data = allDocs.rows.map(i => ({message: i.doc.message, timestamp: i.doc.timestamp}))
//         if(data.length > 0){
//           instance.post('/errorDashboard/insertError', data)
//         }
//         return allDocs.rows.map(row => {
//           return {_id: row.id, _rev: row.doc._rev, _deleted: true};
//         });
//       }).then(deleteDocs => {
//         handlingPouchDb = false;
//         return db.bulkDocs(deleteDocs);
//       });
//     }
    
//     return response;
//   },
//   (error) => {
  
//     if(error?.message === 'Network Error'){
//       db.put({_id: new Date().toISOString(), timestamp : moment().format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]'), message: error.message})
//     }

//     const originalRequest = error?.config;
//     //Axios interceptor restrict Infinite loop
//     if (
//       error?.response?.status === 401 &&
//         error.response.data.message === 'token_blacklisted'
//     ) {
//       sessionStorage.removeItem('login');
//       sessionStorage.removeItem('routesConfig');

//       window.location.replace(`${window.location.origin}/signin`);
//     } 
//     if (error?.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       return Promise.reject(error);
//     }
   
//     if (
//       error?.response?.status === 403 &&
//       error.response.data.message === 'permission denied'
//     ) {
      
    
//       // cookies.remove('login');
//       // alert('Subscription Required')
//       sessionStorage.removeItem('login');
//       sessionStorage.removeItem('routesConfig');
//       window.location.replace(`${window.location.origin}/signin`);
//       //  return Promise.reject(error);

//        // alert('Subscription Required')
//       //  if (window.confirm('Subscription Required')) {
//       //   // cookies.remove('login');
//       //   sessionStorage.removeItem('login');
//       //   window.location.replace(`${window.location.origin}/signin`);
//       //   return Promise.reject(error);
//       // } else {
//       //   // cookies.remove('login');
//       //   sessionStorage.removeItem('login');
//       //   window.location.replace(`${window.location.origin}/signin`);
//       //   return Promise.reject(error);
//       // }
//     } else if (
//       error?.response?.status === 403 &&
//       error?.response.data.message === 'token_expired' &&
//       originalRequest.url !== '/renewAccessToken' &&
//       originalRequest.url !== '/login'
//     ) {
//       if (!refreshTokenPromise) {
//         // check for an existing in-progress request
//         // if nothing is in-progress, start a new refresh token request
//         refreshTokenPromise = instance
//           .post('/renewAccessToken', {refreshToken: getRefreshToken()})
//           .then((token) => {
//             updateAccessToken(token.data.accessToken);
//             updateRefreshToken(token.data.refreshToken)
//             refreshTokenPromise = null; // clear state
//             return token.data.accessToken; // resolve with the new token
//           });
//       }
//       return refreshTokenPromise
//         .then((token) => {
//           instance.defaults.headers.common['Authorization'] = 'Bearer ' + token;
//           return instance(originalRequest);
//         })
//         .catch((err) => {
//           // alert('Token Expired')
//           // cookies.remove('login');
//           sessionStorage.removeItem('login');
//           sessionStorage.removeItem('routesConfig');
//           window.location.replace(`${window.location.origin}/signin`);
//           return Promise.reject(error);
//         });
//     }
//     return Promise.reject(error);
//   },
// );

const unwantedErrors = [
  'ERR_REQUEST_ABORTED',
  'ERR_BLOCKED_BY_CLIENT',
  'net::ERR_INTERNET_DISCONNECTED',
  'No \'Access-Control-Allow-Origin\' header'
];

let lastPouchDbSync = 0;
const POUCHDB_SYNC_INTERVAL = 60000; // 60 seconds

instance.interceptors.response.use(
  (response) => {
    const now = Date.now();
    if (!handlingPouchDb && now - lastPouchDbSync >= POUCHDB_SYNC_INTERVAL) {
      handlingPouchDb = true;
      lastPouchDbSync = now;
      db.allDocs({ include_docs: true })
        .then(allDocs => {
          const data = allDocs.rows.map(i => ({
            message: i.doc.message,
            timestamp: i.doc.timestamp,
            company_type: i.doc.company_type
          }));

          // Remove duplicate messages
          const payload = [...new Map(data.map(item => [item.message, item])).values()];

          if (payload.length > 0) {
            instance.post('/errorDashboard/insertError', payload);
          }

          return allDocs.rows.map(row => ({
            _id: row.id,
            _rev: row.doc._rev,
            _deleted: true
          }));
        })
        .then(deleteDocs => db.bulkDocs(deleteDocs))
        .finally(() => {
          handlingPouchDb = false;
        });
    }

    return response;
  },
  (error) => {
    const originalRequest = error?.config || {};
    const routePath = originalRequest?.url || "";
    const statusCode = error?.response?.status;
    const responseMessage = error?.response?.data?.message;
    const params = originalRequest?.params || {};
    const body = originalRequest?.data || {};
    const companyId = params?.company_id || "";
    const employeeName = params?.employee_name || "";

    const loginData = JSON.parse(sessionStorage.getItem("login") || "{}");
    const company_type = loginData?.company_type || "";

    // Define a regex pattern to identify unwanted bot/scanner routes
    const botRoutePattern = /(vendor|phpunit|debug|\.git|eval-stdin|config)/i;

    const botRoutePatterns = [
      /\.env/i,
      /\/admin/i,
      /\/boafarm/i,
      /\/_layouts/i,
      /spinstall/i,
      /vendor/i,
      /phpunit/i,
      /debug/i,
      /\.git/i,
      /eval-stdin/i,
      /config/i
    ];
    
    if (
      botRoutePatterns.some((pattern) => pattern.test(routePath)) ||
      // botRoutePattern.test(routePath) || // Matches unwanted bot routes
      (statusCode === 404 && routePath === "/") || // Ignore root ("/") 404 errors
      (statusCode === 404 && !companyId && !employeeName && !company_type && Object.keys(params).length === 0 && Object.keys(body).length === 0) // Ignore unassociated 404s
    ) {
      return Promise.reject(error);
    }
    // *** Dynamic Filtering Conditions ***
    // const shouldSkipErrorQueue =
    //   statusCode === 403 && responseMessage === 'token_expired';

    if (
      (
        error?.message === 'Network Error' ||
        !unwantedErrors.includes(error.message)
      )
    ) {

      // Store error in local DB
      db.put({
        _id: new Date().toISOString(),
        timestamp: moment().format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]'),
        message: `${routePath} | ${error.message}`,
        company_type
      });
    }

    // Handle authentication errors
    if (statusCode === 401) {
      if (responseMessage === 'token_blacklisted') {
        sessionStorage.removeItem('login');
        sessionStorage.removeItem('routesConfig');
        window.location.replace(`${window.location.origin}/signin`);
        socketManager.disconnectAll();
      } else if (!originalRequest._retry) {
        originalRequest._retry = true;
        return Promise.reject(error);
      }
    }

    // Handle token expiration and refresh logic
    if (
      statusCode === 403 &&
      responseMessage === 'token_expired' &&
      originalRequest.url !== '/renewAccessToken' &&
      originalRequest.url !== '/login'
    ) {
      if (!refreshTokenPromise) {
        refreshTokenPromise = instance
          .post('/renewAccessToken', { refreshToken: getRefreshToken() })
          .then((token) => {
            updateAccessToken(token.data.accessToken);
            updateRefreshToken(token.data.refreshToken);
            socketManager.reconnect(token.data.accessToken);
            return token.data.accessToken;
          })
          .finally(() => {
            refreshTokenPromise = null;
          });
      }

      return refreshTokenPromise
        .then((token) => {
          instance.defaults.headers.common['Authorization'] = 'Bearer ' + token;
          return instance(originalRequest);
        })
        .catch(() => {
          sessionStorage.removeItem('login');
          sessionStorage.removeItem('routesConfig');
          window.location.replace(`${window.location.origin}/signin`);
          socketManager.disconnectAll();

          return Promise.reject(error);
        });
    }

    return Promise.reject(error);
  }
);




const sockets = [];
export let clientwebsocket = {};
let employee_id;

class EventList {
  event_list = {};

  addListener({eventName, callbackFun, replaceOldFun = false}) {
    if (this.event_list[eventName] === undefined) {
      this.event_list[eventName] = new Map();
    }

    if (replaceOldFun) {
      this.event_list[eventName].delete(callbackFun.name);
      this.event_list[eventName].set(callbackFun.name, callbackFun);
      return;
    }

    if (this.event_list[eventName].get(callbackFun.name) === undefined) {
      this.event_list[eventName].set(callbackFun.name, callbackFun);
    }
  }

  removeAllListeners() {
    Object.keys(this.event_list).forEach((n) => {
      this.event_list[n].clear();
    });
    this.event_list = {};
  }
}

export const websocketEvents = new EventList();
// Backward-compatible aliases used across legacy imports
export const eventList = websocketEvents;
export const eventsList = websocketEvents;
export const connect = initWebSocket;

export function initWebSocket(emp_id, accessToken) {
  socketManager.reconnect(accessToken);
  // employee_id = emp_id;
  // const socket = new W3CWebSocket(webSocketURL, [accessToken]);

  // sockets.push(socket);
  // removeAllClientsExceptOne();

  // const reconnectInterval = 2000;

  // let isReconnectInitiated = false;
  // let reconnectTimer;

  // function reconnect(obj) {
  //   const isUserLoggedIn = cookie() !== '';

  //   let socket = obj.socket;
  //   if (!isUserLoggedIn) {
  //     clearTimeout(reconnectTimer);
  //     isReconnectInitiated = false;
  //     return;
  //   }

  //   if (obj.socket.readyState === WebSocket.OPEN && isUserLoggedIn) {
  //     clearTimeout(reconnectTimer);
  //     isReconnectInitiated = false;
  //   } else {
  //     const token = getAccessToken();
  //     obj.socket = new W3CWebSocket(socket.url, [token]);
  //     sockets.push(obj.socket);

  //     // initOnopen(obj);

  //     removeAllClientsExceptOne();
  //   }
  //   socketFunctions(obj);
  // }

  // clientwebsocket = {
  //   socket,
  //   reconnect,
  // };

  // socketFunctions(clientwebsocket);

  // function tryConnecting(msg) {
  //   if (isReconnectInitiated) return;
  //   isReconnectInitiated = true;
  //   reconnectTimer = setInterval(
  //     () => reconnect(clientwebsocket),
  //     reconnectInterval,
  //   );
  // }

  // function removeAllClientsExceptOne() {
  //   if (sockets.length > 1) {
  //     for (let s = 0; s < sockets.length - 1; s++) {
  //       sockets[s].close();
  //     }
  //     for (let s = 0; s < sockets.length - 1; s++) {
  //       sockets.pop();
  //     }
  //   }
  // }

  // function socketFunctions(socketObject) {
  //   socketObject.socket.onopen = () => {
  //     initOnopen(socketObject);
  //     removeAllClientsExceptOne();
  //   };

  //   socketObject.socket.onerror = (msg) => {
  //     tryConnecting('socket error');
  //   };
  //   socketObject.socket.onmessage = (message) => {
  //     let {event, content} = JSON.parse(message.data);

  //     const event_list = websocketEvents.event_list;

  //     if (event_list[event] !== undefined) {
  //       const funcList = event_list[event];
  //       for (let func of funcList.values()) {
  //         func({event, content});
  //       }
  //     }
  //   };

  //   socketObject.socket.onclose = (e, reason) => {
  //     if (socketObject.socket.readyState === WebSocket.OPEN) {
  //       websocketEvents.removeAllListeners();
  //       socketObject.socket.send(
  //         JSON.stringify({
  //           event: 'user_disconnected',
  //           content: {emp_id: emp_id},
  //         }),
  //       );
  //     }
  //     if (reason === 'LOGOUT') {
  //       socketObject.socket.close();
  //     } else {
  //       tryConnecting('socket close');
  //     }
  //   };
  // }

  // function initOnopen(s) {
  //   if (s.socket.readyState === 1) {
  //     s.socket.send(
  //       JSON.stringify({
  //         event: 'user_connected',
  //         content: {emp_id: emp_id},
  //       }),
  //     );
  //   }
  // }
}

function stringifyAccessToken(accessToken) {
  let token = accessToken ? accessToken : getAccessToken();
  return JSON.stringify({headers: {['Authorization']: 'Bearer ' + token}});
}

// export const socketio = io.connect(servers.local.socket_io_url, {
//   auth: {
//     Authorization: `Bearer ${getAccessToken()}`,
//   },
// });

// instance.interceptors.response.use(
//     (response) => {
//       return response;
//     },
//     function (error) {
//       const originalRequest = error.config;

//       // Axios interceptor restrict Infinite loop
//       if (error.response.status === 401 && !originalRequest._retry) {
//         originalRequest._retry = true;
//         return Promise.reject(error);
//       }

//       // refresh the auth token

//         if (error.response.status === 403) {
//           const refreshToken = getRefreshToken();
//           return instance
//             .post('/renewAccessToken', {
//               refreshToken: refreshToken,
//             })
//             .then((res) => {
//               if (res.status === 200) {
//                 updateAccessToken(res.data.accessToken);

//                 instance.defaults.headers.common['Authorization'] =
//                   'Bearer ' + getAccessToken();

//                 return instance(originalRequest);
//               }
//             })
//             .catch((err) => {
//               const cookies = new Cookies();
//               cookies.remove('login');
//               window.location.replace(`${window.location.origin}/signin`);
//             });
//           }

//           return Promise.reject(error);
//     },
//   );

//-------------------

// // function createAxiosResponseInterceptor() {
//   const interceptor = instance.interceptors.response.use(
//     (response) => {
//       // block to handle success case
//       return response;
//     },
//     function (error) {
//       // block to handle error case
//       const originalRequest = error.config;

//       if (
//         error.response.status === 403 &&
//         error.response.data.message === 'Forbidden' &&
//         originalRequest.url === `${window.location.origin}/renewAccessToken`
//       ) {
//         // Added this condition to avoid infinite loop  error.response.status === 403 && originalRequest.url === 'http://dummydomain.com/auth/token'

//         // Redirect to any unauthorised route to avoid infinite loop...
//         const cookies = new Cookies();
//         cookies.remove('login');
//         window.location.replace(`${window.location.origin}/signin`);
//         return Promise.reject(error);
//       }

//       if (error.response.status === 403 && !originalRequest._retry) {
//         // Code inside this block will refresh the auth token
//         instance.interceptors.response.eject(interceptor);
//         originalRequest._retry = true;
//         const refreshToken = getRefreshToken(); // Write the  logic  or call here the function which is having the login to refresh the token.
//         return instance
//           .post('/renewAccessToken', {
//             refreshToken: refreshToken,
//           })
//           .then((res) => {
//             if (res.status === 200) {
//               updateAccessToken(res.data.accessToken);
//               instance.defaults.headers.common['Authorization'] =
//                 'Bearer ' + getAccessToken();
//               return instance(originalRequest);
//             }
//           })
//           .catch((err) => {
//             const cookies = new Cookies();
//             cookies.remove('login');
//             window.location.replace(`${window.location.origin}/signin`);
//           });
//       }
//       return Promise.reject(error);
//     },
//   );

//--------------------------
// }

// createAxiosResponseInterceptor();

// instance.interceptors.request.use(function (config) {
//   let modules = '';
//   if (cookies.get('login')) {
//     modules = cookies.get('login')?.accessToken || '';
//   }
//   config.headers.Authorization = modules;
//   return config;
// });

// instance.interceptors.response.use(
//   (res) => {
//     return res;
//   },
//   async (err) => {
//     const originalConfig = err.config;

//     if (
//       originalConfig.url !== '/login' &&
//       originalConfig.url !== '/renewAccessToken' &&
//       err.response
//     ) {
//       // Access Token was expired
//       if (
//         err.response.status === 500 &&
//         err.response.data.message === 'Unauthorized' &&
//         !originalConfig._retry
//       ) {
//         originalConfig._retry = true;

//         try {
//           let modules = '';
//           if (cookies.get('login')) {
//             modules = cookies.get('login')?.refreshToken || '';
//           }
//           const rs = await instance.post('/renewAccessToken', {
//             refreshToken: modules,
//           });

//           cookies.set('login', JSON.stringify(rs.data));
//           return instance(originalConfig);
//         } catch (_error) {
//           return Promise.reject(_error);
//         }
//       }
//     }
//     return Promise.reject(err);
//   },
// );

export const base_url = baseURL;
export const host = hostURL;
export const web_socket_url = webSocketURL;
export const loginHost = loginUrl;
export default instance;
