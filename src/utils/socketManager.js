
import { io } from "socket.io-client";
import { baseURL } from "../http-common";
import {getAccessToken} from "../pages/common/login/cookies"

class SocketManager {
  constructor() {
    this.sockets = {}; // { '/': socket, '/chat': socket }
    this.accessToken = null;
  }

  connect() {
    try{
    let accessToken = getAccessToken();
     
    this.accessToken = accessToken;

    // --- Root namespace ---
    const rootSocket = io(`${baseURL}`, {
      path: "/socket.io/",
      transports: ["websocket"],
      auth: { Authorization: accessToken },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    // --- Chat namespace ---
    // const chatSocket = io("https://your-server-url/chat", {
    //   path: "/socket.io/",
    //   transports: ["websocket"],
    //   query: { Authorization: accessToken },
    //   reconnection: true,
    //   reconnectionAttempts: Infinity,
    //   reconnectionDelay: 1000,
    //   autoConnect: true,
    // });

    // Handle connection events
   // [rootSocket, chatSocket].forEach((socket) => {
     [rootSocket].forEach((socket) => {
      socket.on("connect", () => console.log(`[${socket.nsp}] connected`));
      socket.on("disconnect", (reason) =>
        console.log(`[${socket.nsp}] disconnected:`, reason)
      );
      socket.on("connect_error", (err) =>
        console.error(`[${socket.nsp}] connection error:`, err.message)
      );
    });

    // Store sockets
    this.sockets["/"] = rootSocket;
   // this.sockets["/chat"] = chatSocket;
  }catch(e){
    
  }
  }

  getSocket(namespace = "/") {
    return this.sockets[namespace];
  }

  // --- Cleanup all sockets ---
  disconnectAll() {
   try{
    console.log("DISCONNECT ALL", this.sockets);
     Object.values(this.sockets).forEach((socket) => {
      socket.removeAllListeners();
      socket.disconnect();
    });
    this.sockets = {};
    this.accessToken = null;
   }catch(e){

   }
  }

  // --- Reconnect after logout/login ---
  reconnect() {
   try{
      let accessToken = getAccessToken();
     
    this.accessToken = accessToken;

     if (this.accessToken) {
      this.disconnectAll();
      this.connect(this.accessToken);
    }
   }catch(e){

   }
  }
}

const socketManager = new SocketManager();
export default socketManager;
