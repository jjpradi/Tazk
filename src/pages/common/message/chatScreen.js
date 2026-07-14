import React, {useEffect, useState, useContext, useRef} from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import ListItemButton from '@mui/material/ListItemButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import context from '../../../context/CreateNewButtonContext';
import RefreshIcon from '@mui/icons-material/Refresh';
import {useDispatch, useSelector} from 'react-redux';
import {
  sendMsgAction,
  getInboxAction,
  getMsgInInboxAction,
  listEmployeeAction,
} from '../../../redux/actions/message_actions';
import moment from 'moment';
import apiCalls from 'utils/apiCalls';

export default function ChatScreen({
  // userMessages,
  // userChattedWith,
  chatScreenUser,
  currentInboxId,
}) {
  // const [userAllMessage, setUserAllMessage] = useState();
  const [msgText, setMsgText] = useState('');
  const [empList, setEmpList] = useState({});
  const {
    messageReducer: {inboxAllMsg},
    messageReducer: {employeeList},
  } = useSelector((state) => state);
  const {
    commoncookie: currentEmpId,
    setModalTypeHandler,
    setLoaderStatusHandler,} = useContext(context);
  const dispatch = useDispatch();

  // const listSpecificUserMessages = (chatScreenUser) => {
  //   const specificUserMessages = userMessages.filter((item) => {
  //     if (
  //       item.msg_from === chatScreenUser.employee_id ||
  //       item.msg_to === chatScreenUser.employee_id
  //     ) {
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   });
  //   return specificUserMessages.reverse();
  // };

  useEffect(() => {
    if (currentInboxId !== '') {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(getMsgInInboxAction(currentEmpId, currentInboxId))
      );
    }
  }, [chatScreenUser]);

  useEffect(() => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(listEmployeeAction(currentEmpId))
    );
    getEmpName();
  }, []);


  const handleSendMessage = () => {
    const data = {
      msg_from_uid: currentEmpId,
      msg_to_uid: chatScreenUser,
      msg_content: msgText,
      active : 1
    };
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(sendMsgAction(currentEmpId, data))
    );

    const objDiv = document.getElementById('chatWindow');
    objDiv.scrollTop = objDiv.scrollHeight;
    setMsgText('');
  };

  const getEmpName = () => {
    let temp = {};

    for (let i = 0; i < employeeList.length; i++) {
      temp[employeeList[i].employee_id] = employeeList[i].username;
    }

    setEmpList(temp);
  };

  return (
    <Grid
      container
      direction='column'
      style={{
        display:'grid',
        gridTemplateRows:'55px 1fr 55px',
        width: '100%',
        minHeight: 'calc(100vh - 200px)',
      }}
    >
      <Grid
        style={{
          width: '100%',
          zIndex: '100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#C0CFE6',
        }}>
        <Grid
          style={{
            padding: '5px',
            paddingLeft: '20px',
            gap: '15px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Avatar alt='No image' src='/static/images/avatar/1.jpg'>
            {empList[chatScreenUser] === undefined
              ? '.'
              : empList[chatScreenUser].charAt(0).toUpperCase()}
          </Avatar>
          <Typography
            sx={{display: 'inline', textTransform: 'capitalize'}}
            component='span'
            variant='h2'
          >
            {empList[chatScreenUser] === undefined
              ? ''
              : empList[chatScreenUser]}
          </Typography>
        </Grid>
        <Grid
          style={{
            padding: '5px',
            paddingRight: '20px',
            curser: 'pointer',
          }}
        >
          <IconButton
          onClick={() => {
            if (currentInboxId !== '') {
              apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                dispatch(
                  getMsgInInboxAction(currentEmpId, inboxAllMsg[0].inbox_id),
                )
              );
            }
          }}
          >
          <RefreshIcon/>
          </IconButton>
          
        </Grid>
      </Grid>
      <Grid
        id='chatWindow'
        style={{
          width: '100%',
          overflowY: 'scroll',
          zIndex: '0',
          backgroundColor: '#e3e3e3',
        }}>
        {inboxAllMsg?.length > 0
          ? inboxAllMsg?.map((item) => {
              return (
                <Grid key={item.msg_id}>
                  {item.msg_to_uid !== currentEmpId ? (
                    <ListItem
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        width: 'fit-content',
                        marginRight: 0,
                        marginLeft: 'auto',
                      }}
                    >
                      <ListItemButton
                        style={{
                          backgroundColor: '#C0CFE6',
                          width: 'fit-content',
                          borderTopLeftRadius: '20px',
                          borderTopRightRadius: '30px',
                          borderBottomRightRadius: '0px',
                          borderBottomLeftRadius: '20px',
                          padding:'0px 10px'
                        }}
                      >
                        <ListItemText 
                          style={{textAlign: 'right', padding: '0px 10px', display:'flex', gap:'8px',alignItems:'center'}}
                          primary={item.msg_content}
                          secondary={
                            <React.Fragment>
                              <Typography
                                sx={{display: 'inline'}}
                                component='span'
                                variant='body2'
                                color='text.primary'
                              ></Typography>
                              {moment(item.msg_timestamp).format('h:mm a')}
                            </React.Fragment>
                          }
                        />
                        {/* <ListItemAvatar>
                          <Avatar
                            alt='No image'
                            src='/static/images/avatar/1.jpg'
                          >
                            {empList[currentEmpId] === undefined
                              ? '.'
                              : empList[currentEmpId].charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar> */}
                      </ListItemButton>
                    </ListItem>
                  ) : (
                    <ListItem
                      key={item.msg_id}
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        width: 'fit-content',
                        marginRight: 'auto',
                        marginLeft: 0,
                      }}
                    >
                      <ListItemButton
                        alignItems='flex-end'
                        style={{
                          backgroundColor: '#C0CFE6',
                          width: 'fit-content',
                          borderTopLeftRadius: '20px',
                          borderTopRightRadius: '30px',
                          borderBottomRightRadius: '20px',
                          borderBottomLeftRadius: '0px',
                          padding:'0px 10px'

                        }}
                      >
                        {/* <ListItemAvatar>
                          <Avatar
                            alt='No image'
                            src='/static/images/avatar/1.jpg'
                          >
                            {empList[chatScreenUser] === undefined
                              ? '.'
                              : empList[chatScreenUser].charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar> */}
                        <ListItemText style={{display:'flex', gap:'8px',alignItems:'center'}}
                          primary={item.msg_content}
                          secondary={
                            <React.Fragment >
                              <Typography
                                sx={{display: 'inline'}}
                                component='span'
                                variant='body2'
                                color='text.primary'
                              ></Typography>
                              {moment(item.latest_message_timestamp).format(
                                'h:mm a',
                              )}
                            </React.Fragment>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  )}
                </Grid>
              );
            })
          : ''}
      </Grid>
      <Grid
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          width: '100%',
        }}>
        <TextField
          sx={{width: '100%', backgroundColor: '#C0CFE6'}}
          label='Type message here...'
          variant='filled'
          value={msgText}
          onChange={(e) => {
            setMsgText(e.target.value);
          }}
          slotProps={{ input: { disableUnderline: true } }}
          InputProps={{
            endAdornment: (
              <InputAdornment>
                <IconButton>
                  <SendIcon
                    onClick={() => {
                      handleSendMessage();
                    }}
                  />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
    </Grid>
  );
}
