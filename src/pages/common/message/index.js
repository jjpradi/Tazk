import React, {useEffect, useState, useContext} from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import {useDispatch, useSelector} from 'react-redux';
import { listEmployeeAction, getInboxAction } from '../../../redux/actions/message_actions';
import messageReducer from './../../../redux/reducers/message_reducers';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import _ from 'lodash';
import ChatList from './chatList';
import ChatScreen from './chatScreen';
import context from '../../../context/CreateNewButtonContext';
import moment from 'moment';

const Message = () => {
  const [chatScreenOpen, setChatScreenOpen] = useState(false);
  const [chatScreenUser, setChatScreenUser] = useState();
  const [currentInboxId, setCurrentInboxId] = useState('');
  const {commoncookie: currentEmpId} = useContext(context);
  const [isNewChat, setIsNewChat] = useState(true);

  const dispatch = useDispatch();
  const {
    messageReducer: {employeeList, inboxList},
  } = useSelector((state) => state);

  // useEffect(() => {
  //   dispatch(listEmployeeAction(currentEmpId));
  //   dispatch(getInboxAction(currentEmpId));
  // }, []);

  const openNewMsgChatScreen = (newMsgUserId) => {
    setChatScreenUser(newMsgUserId);
  };

  return (
    <>
      <Grid
        container
        boxShadow={3}
        style={{
          backgroundColor: '#EEF3FC',
          minHeight: 'calc(100vh - 200px)',
          width: '100%',
          padding:'0px',
          borderRadius: '3px'
          
        }}
      >
        <Grid
          style={{
            backgroundColor: '#e3e3e3',
            borderRadius: '3px',
            borderRight:'1px solid grey'
           
          }}
          size={{
            lg: 3,
            md: 3,
            sm: 3,
            xs: 3
          }}>
          <Autocomplete
            disablePortal
            sx={{width: '100%', margin:'0 auto', textTransform:'capitalize'}}
            options={employeeList}
            getOptionLabel={(option) => option.username}
            // renderOption={(props, option) => (
            //   <Box
            //     component='li'
            //     sx={{'& > img': {mr: 2, flexShrink: 0}}}
            //     {...props}
            //   >
            //     <Avatar
            //           alt='No image'
            //           src='/static/images/avatar/1.jpg'
            //         >{option.username.charAt(0).toUpperCase()}</Avatar>
            //   </Box>
            // )}
            onChange={(e, value) => {
              openNewMsgChatScreen(value.employee_id);
              setChatScreenOpen(true);
              if(_.find(inboxList, {idsChattedWith: value.employee_id}) === undefined){
                setIsNewChat(true);
              }
              setChatScreenUser(value.employee_id);
              
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="filled"
                label='New Message'
                style={{backgroundColor: '#D3E3FD', textTransform:'capitalize'}}
                inputProps={{
                  ...params.inputProps,
                }}
              />
            )}
          />
          <ChatList
            // userMessages={userMessages}
            // userChattedWith={userChattedWith}
            setChatScreenOpen={setChatScreenOpen}
            setChatScreenUser={setChatScreenUser}
            setCurrentInboxId={setCurrentInboxId}
            inboxList={inboxList}
            
          />
        </Grid>
        <Grid
          style={{
            backgroundColor: '#e3e3e3',
          }}
          size={{
            lg: 9,
            md: 9,
            sm: 9,
            xs: 9
          }}>
          {chatScreenOpen && (
            <ChatScreen
              // userMessages={userMessages}
              // userChattedWith={userChattedWith}
              chatScreenUser={chatScreenUser}
              currentInboxId={currentInboxId}
              isNewChat={isNewChat}
            />
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default Message;
