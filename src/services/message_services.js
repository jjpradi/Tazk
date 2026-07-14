import http from '../http-common';

class MessageService {
    getInbox(userId){
        return http.get(`/posMessage/getInbox/${userId}`);
    }

    getMsgInInbox(userId, inboxId){
        return http.get(`/posMessage/getMsgInInbox/${userId}/${inboxId}`);
    }

    sendMsg(userId, data){
        return http.post(`/posMessage/sendMsg/${userId}`, data);
    }

    updateMsg(userId, inboxId, msgId, data){
        return http.put(`/posMessage/updateMsg/${userId}/${inboxId}/${msgId}`, data);
    }

    deleteMsg(userId, inboxId, msgId, data){
        return http.put(`/posMessage/deleteMsg/${userId}/${inboxId}/${msgId}`, data);
    }

    deleteInbox(userId, inboxId){
        return http.delete(`/posMessage/deleteInbox/${userId}/${inboxId}`);
    }

    listEmployee(userId){
        return http.get(`/posMessage/listEmployee`);
    }

    seenReadmsg(inboxId, data){
        return http.put(`/posMessage/readMsg/${inboxId}`,data, 
        );
    }

    Readmsg(data){
        return http.get(`/posMessage/UnreadMsg`,data);
    }
}

export default new MessageService();