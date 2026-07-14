import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import {useDropzone} from 'react-dropzone';
import {Box, darken, IconButton} from '@mui/material';
import TextField from '@mui/material/TextField';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import PropTypes from 'prop-types';
import {useIntl} from 'react-intl';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import {MessageType} from '@crema/services/db/apps/chat/connectionList';
import {generateUniqueID} from 'web-vitals/dist/modules/lib/generateUniqueID';
import AddIcon from '@mui/icons-material/Add';
import {styled} from '@mui/material/styles';
import {clientwebsocket} from 'http-common';
import {getInboxId} from '../../..';
import AttachmentMenu from './attachmentMenu';
import AttachmentModal from './attachmentModal';
import {useReducer} from 'react';

function reducer(state, action) {
  const {type, payload} = action;
  if (type === 'PHOTO') {
    return {
      ...state,
      PHOTO: payload,
    };
  }
  if (type === 'DOCUMENT') {
    return {
      ...state,
      DOCUMENT: payload,
    };
  }
  if (type === 'CONTACT') {
    return {
      ...state,
      CONTACT: payload,
    };
  }
  if (type === 'LOCATION') {
    return {
      ...state,
      LOCATION: payload,
    };
  }
  if(type === 'RESET'){
    return {
      PHOTO: [],
      DOCUMENT: [],
      LOCATION: {
        lat: '',
        lng: '',
      },
      CONTACT: [],
    };
  }
  throw Error('Unknown action.');
}

const initialState = {
  PHOTO: [],
  DOCUMENT: [],
  LOCATION: {
    lat: '',
    lng: '',
  },
  CONTACT: [],
};

const SendBtn = styled(IconButton)(({theme}) => {
  return {
    height: 40,
    width: 40,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover, &:focus': {
      backgroundColor: darken(theme.palette.primary.main, 0.1),
      color: theme.palette.primary.contrastText,
    },
    '& .MuiSvgIcon-root': {
      fontSize: 20,
      marginLeft: 3,
    },
  };
});

const SendMessage = ({
  attachmentFunctions,
  onSendMessage,
  currentMessage = '',
  user,
  selectedUser,
  storage,
}) => {
  const {first_name, last_name, employee_id, company_id, accessToken} = storage;

  const [message, setMessage] = useState(currentMessage);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [uploadType, setUploadType] = React.useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [attachment, attachmentDispatch] = useReducer(reducer, initialState);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const [isTyping, setIsTyping] = useState(false);
  // const {getRootProps, getInputProps} = useDropzone({
  //   multiple: true,
  //   onDrop: (acceptedFiles) => {
  //     sendFileMessage({
  //       message: '',
  //       message_type: 'PHOTO',
  //       media: acceptedFiles.map((file) => {
  //         return {
  //           id: generateUniqueID(),
  //           url: URL.createObjectURL(file),
  //           mime_type: file.type,
  //           file_name: file.name,
  //           file_size: file.size,
  //         };
  //       }),
  //     });
  //   },
  // });

  useEffect(() => {
    setMessage(currentMessage);
  }, [currentMessage]);

  // useEffect(() => {
  //   const roomId = getInboxId(user.id, selectedUser.employee_id, company_id);
  //   if (isTyping) {
  //     if (message.length > 0) {
  //       if (clientwebsocket.socket.readyState === WebSocket.OPEN) {
  //         clientwebsocket.socket.send(
  //           JSON.stringify({
  //             event: 'typing',
  //             content: {
  //               message: 'start',
  //               roomId,
  //               other_empId: selectedUser.employee_id,
  //             },
  //           }),
  //         );
  //       }
  //     }
  //   } else {
  //     if (clientwebsocket.socket.readyState === WebSocket.OPEN) {
  //       clientwebsocket.socket.send(
  //         JSON.stringify({
  //           event: 'typing',
  //           content: {
  //             message: 'stop',
  //             roomId,
  //             other_empId: selectedUser.employee_id,
  //           },
  //         }),
  //       );
  //     }
  //   }
  // }, [isTyping]);

  const onKeyPress = (event) => {
    if (event.key === 'Enter') {
      onClickSendMessage();
    }
  };

  const onClickSendMessage = () => {
    if (message) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const {messages} = useIntl();


  return (
    <Box
      sx={{
        display: 'flex',
        alignContent: 'items',
        py: 0.25,
      }}
    >
      {message === '' ? (
        <Box
          sx={{
            mr: 2,
          }}
        >
          <IconButton
            // {...getRootProps({
            //   className: clsx('dropzone'),
            // })}
            style={{height: 40, width: 40}}
            size='large'
            onClick={(e) => {
              handleClick(e);
            }}
          >
            {/* <input {...getInputProps()} /> */}
            <AddIcon
              style={{
                color: '#0A8FDC',
                transform: anchorEl ? 'rotate(90deg)' : 'rotate(0)',
                transition: 'all 0.2s linear',
              }}
            />
          </IconButton>
        </Box>
      ) : null}
      <TextField
        onClick={() => {
          if (message.length > 0) {
            setIsTyping(true);
          }
        }}
        sx={{
          width: '100%',
          position: 'relative',
          transition: 'all 0.5s ease',
          '& .MuiOutlinedInput-root': {
            padding: '12px 14px',
          },
        }}
        multiline
        variant='outlined'
        placeholder={messages['chatApp.sendMessagePlaceholder']}
        value={message}
        onChange={(event) => {
          if (event.target.value !== '\n') setMessage(event.target.value);
          if (event.target.value.length > 0) setIsTyping(true);
        }}
        onKeyPress={onKeyPress}
        onBlur={() => setIsTyping(false)}
      />
      <Box
        sx={{
          ml: 2,
        }}
      >
        <SendBtn onClick={onClickSendMessage} size='large'>
          <SendOutlinedIcon />
        </SendBtn>
      </Box>
      <AttachmentMenu
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
        uploadType={uploadType}
        setUploadType={setUploadType}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
      />

      <AttachmentModal
        anchorEl={anchorEl}
        attachment={attachment}
        attachmentDispatch={attachmentDispatch}
        setAnchorEl={setAnchorEl}
        uploadType={uploadType}
        setUploadType={setUploadType}
        setUploadedFiles={setUploadedFiles}
        uploadedFiles={uploadedFiles}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        attachmentFunctions={attachmentFunctions}
      />
    </Box>
  );
};

export default SendMessage;

SendMessage.propTypes = {
  sendFileMessage: PropTypes.func,
  onSendMessage: PropTypes.func,
  currentMessage: PropTypes.string,
  message: PropTypes.string,
  setMessage: PropTypes.func,
  SendMessage: PropTypes.func,
};
