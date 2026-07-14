import React, {useMemo, useState} from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import EditIcon from '@mui/icons-material/Edit';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import {MessageType} from '@crema/services/db/apps/chat/connectionList';
import {getFileSize} from '@crema/utility/helper/Utils';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import MediaViewer from '@crema/core/AppMedialViewer';
import {
  alpha,
  Button,
  Divider,
  Grid,
  IconButton,
  ListItemAvatar,
  Typography,
} from '@mui/material';
import {orange} from '@mui/material/colors';
import {Fonts} from '../../../../../../shared/constants/AppEnums';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import {styled} from '@mui/material/styles';
import moment from 'moment';
import ViewContact from './viewContact';
import DownloadIcon from '@mui/icons-material/Download';
import DownloadS3FileWrapper from '../../../../../../../components/downloadFileFromS3';
import {OpenStreetMap} from './viewLocation';

const ReceiverMessageWrapper = styled('div')(() => {
  return {
    mt: 5.5,
    display: 'flex',
    justifyContent: 'flex-start',
    '&:last-of-type': {
      marginBottom: 0,
    },
    '&.hideUser-info': {
      position: 'relative',
      marginTop: 1,
      '& .message-time, & .message-chat-avatar': {
        display: 'none',
      },
      '& .message-chat-sender': {
        marginBottom: 0,
      },
      '& .message-chat-item': {
        marginLeft: 44,
      },
    },
  };
});
const VideoWrapper = styled('div')(({theme}) => {
  return {
    position: 'relative',
    width: 56,
    height: 56,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: theme.palette.common.black,
    '&:before': {
      content: "''",
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      paddingTop: '100%',
    },
    '& video, & iframe, & embed, & object': {
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      border: '0 none',
      objectFit: 'cover',
    },
  };
});
const MessageChat = styled('div')(({theme}) => {
  return {
    display: 'inline-flex',
    border: `solid 1px ${theme.palette.grey[200]}`,
    borderTopRightRadius: theme.cardRadius,
    borderBottomRightRadius: theme.cardRadius,
    padding: '10px 16px',
    position: 'relative',
    fontSize: 14,
    backgroundColor: theme.palette.background.paper,
    '& .download-icon': {
      position: 'absolute',
      right: 5,
      bottom: 5,
      zIndex: 1,
    },
    '.last-chat-message &': {
      borderBottomLeftRadius: theme.cardRadius,
    },
  };
});

const showMediaItems = 2;
const getMediaMessage = (item, message_type) => {
  if (message_type === 'PHOTO') {
    return (
      <Box
        sx={{
          position: 'relative',
          '& img': {
            objectFit: 'cover',
            borderRadius: 1,
            width: 56,
            height: 56,
            display: 'block',
          },
        }}
      >
        <img alt='' src={item.fileAccessUrl} />
      </Box>
    );
  } else if (item.mime_type.startsWith('video')) {
    return (
      <VideoWrapper>
        <video src={item.url} />
        <PlayCircleOutlineIcon
          sx={{
            fontSize: 20,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: (theme) => theme.palette.common.white,
          }}
        />
      </VideoWrapper>
    );
  } else {
    return (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'nowrap',
        }}
      >
        <DescriptionOutlinedIcon />
        <Box
          component='p'
          sx={{
            ml: 2,
          }}
        >
          <Box component='span' sx={{display: 'block'}}>
            {item.file_name}
          </Box>
          <Box component='span' sx={{display: 'block'}}>
            {getFileSize(item.file_size)}
          </Box>
        </Box>
      </Box>
    );
  }
};

const getMessage = (item, setIndex, list, setShowContact) => {
  if (item.message_type === 'TEXT') {
    const deletedMessage =
      item.msg_content === 'This message has been deleted' ? (
        <DoNotDisturbIcon sx={{fontSize: '20px', paddingLeft: '5px'}} />
      ) : (
        ''
      );
    return (
      <Typography sx={{display: 'flex', alignItems: 'center'}}>
        {item.msg_content}
        {deletedMessage}
      </Typography>
    );
  }

  if (item.message_type === 'CONTACT') {
    const name =
      list.length > 1
        ? `${list[0]?.name} & ${list.length - 1} other contacts`
        : list[0]?.name;
    const avatar = list.map((i) => {
      return (
        <ListItemAvatar
          className='contactSendAvatar'
          key={i.employee_id}
          sx={{
            minWidth: 0,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
            }}
            src={i.image}
          />
        </ListItemAvatar>
      );
    });

    return (
      <Box>
        <Grid
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            paddingBottom: '15px',
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              flexDirection: 'row-reverse',
              '& .contactSendAvatar:not(:last-child)': {
                marginLeft: '-30px',
              },
            }}
          >
            {avatar}
          </Box>
          <Box
            // component='h5'
            sx={{
              display: 'block',
              mb: 0.5,
            }}
          >
            {name}
          </Box>
        </Grid>
        <Divider />
        <Box
          sx={{
            fontSize: 14,
            pl: 3.5,
            width: 'calc(100% - 36px)',
            paddingTop: '15px',
          }}
        >
          <Button
            // component='p'
            onClick={() => {
              setShowContact(true);
            }}
            sx={{
              color: 'text.secondary',
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textAlign: 'center',
            }}
          >
            View All
          </Button>
        </Box>
      </Box>
    );
  }
  if (item.message_type === 'PHOTO') {
    return (
      <Box
        sx={{
          position: 'relative',
          display: 'inline-block',
          verticalAlign: 'top',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            margin: -1,
          }}
        >
          {item.fileUrl.slice(0, showMediaItems).map((data, index) => (
            <Box
              sx={{
                padding: 1,
                cursor: 'pointer',
              }}
              key={'media-' + data.fileName}
              onClick={() => setIndex(index)}
            >
              {getMediaMessage(data, item.message_type)}
            </Box>
          ))}
          {item.fileUrl?.length > showMediaItems ? (
            <Box
              sx={{
                padding: 1,
                cursor: 'pointer',
              }}
              onClick={() => setIndex(showMediaItems)}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 1,
                  backgroundColor: (theme) =>
                    alpha(theme.palette.primary.main, 0.35),
                  color: (theme) => theme.palette.primary.contrastText,
                  fontWeight: Fonts.MEDIUM,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                +{item.fileUrl?.length - showMediaItems}
              </Box>
            </Box>
          ) : null}
        </Box>
      </Box>
    );
  }
  if (item.message_type === 'DOCUMENT') {
    const msg_content = JSON.parse(item.msg_content)[0];
    const fileName = `${msg_content.fileName.split('__')[0]}.${
      msg_content.format
    }`;
    return (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'nowrap',
          alignItems: 'center',
        }}
      >
        <DescriptionOutlinedIcon sx={{fontSize: '25px'}} />
        <Box
          sx={{
            ml: 2,
          }}
        >
          <Box component='span' sx={{display: 'block', fontSize: '15px'}}>
            {fileName}
          </Box>
          <Box component='span' sx={{display: 'block'}}>
            {msg_content.size}
          </Box>
        </Box>
        <DownloadS3FileWrapper
          link={item.fileUrl[0]?.fileAccessUrl}
          objectName={item.fileUrl[0]?.fileName}
          style={{padding: 1}}
          fileName={fileName}
        >
          <IconButton>
            <DownloadIcon sx={{fontSize: '25px'}} />
          </IconButton>
        </DownloadS3FileWrapper>
      </Box>
    );
  }
  if (item.message_type === 'LOCATION') {
    const h = '200px';
    const w = '300px';
    const location = JSON.parse(item.msg_content);
    const openInNewTab = () => {
      const url = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;

      window.open(url, '_blank', 'noopener,noreferrer');
    };
    return (
      <Box
        style={{width: w, height: 'auto'}}
        display='flex'
        gap={2}
        flexDirection='column'
      >
        <OpenStreetMap
          zoom={14}
          style={{height: h, width: w}}
          location={location}
        />
        <Divider />
        <Button
          onClick={() => {
            openInNewTab();
          }}
          sx={{
            color: 'text.secondary',
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textAlign: 'center',
          }}
        >
          View Location
        </Button>
      </Box>
    );
  }
  return <Typography>{item.msg_content}</Typography>;

  // return (
  //   <Box
  //     sx={{
  //       position: 'relative',
  //       display: 'inline-block',
  //       verticalAlign: 'top',
  //       overflow: 'hidden',
  //     }}
  //   >
  //     <Box
  //       sx={{
  //         display: 'flex',
  //         flexWrap: 'wrap',
  //         margin: -1,
  //       }}
  //     >
  //       {item.media.slice(0, showMediaItems).map((data, index) => (
  //         <Box
  //           sx={{
  //             padding: 1,
  //             cursor: 'pointer',
  //           }}
  //           key={'media-' + data.id}
  //           onClick={() => setIndex(index)}
  //         >
  //           {getMediaMessage(data)}
  //         </Box>
  //       ))}
  //       {item.media.length > showMediaItems ? (
  //         <Box
  //           sx={{
  //             padding: 1,
  //             cursor: 'pointer',
  //           }}
  //           onClick={() => setIndex(showMediaItems)}
  //         >
  //           <Box
  //             sx={{
  //               width: 56,
  //               height: 56,
  //               borderRadius: 1,
  //               backgroundColor: (theme) =>
  //                 alpha(theme.palette.primary.main, 0.15),
  //               color: (theme) => theme.palette.primary.main,
  //               fontWeight: Fonts.MEDIUM,
  //               display: 'flex',
  //               alignItems: 'center',
  //               justifyContent: 'center',
  //             }}
  //           >
  //             +{item.media.length - showMediaItems}
  //           </Box>
  //         </Box>
  //       ) : null}
  //     </Box>
  //   </Box>
  // );
};

const ReceiverMessageItem = ({
  selectedUser,
  item,
  isPreviousSender = false,
  isLast,
  lastProductElementRef,
  lastProductItemID,
  INDEX,
  lastMessageRef,
  employeeList,
}) => {
  const [index, setIndex] = useState(-1);
  const [showContact, setShowContact] = useState(false);

  const onClose = () => {
    setIndex(-1);
  };

  const contactList = useMemo(() => {
    if (item.message_type === 'CONTACT') {
      const list = employeeList
        .filter((i) => item.msg_content.split(',').includes(i.employee_id + ''))
        .map((i) => ({
          name: i.first_name,
          phone: i.phone_number,
          email: i.email,
          employee_id: i.employee_id,
          image: i.image
        }));
      return list;
    } else {
      return [];
    }
  }, [item]);

  return (
    <ReceiverMessageWrapper
      className={clsx(
        isPreviousSender ? 'hideUser-info' : '',
        isLast ? 'last-chat-message' : '',
      )}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
        }}
        ref={(r) => {
          if (lastProductElementRef) {
            lastProductElementRef(r);
          }
          if (lastMessageRef) {
            lastMessageRef.current = r;
          }
        }}
        {...(lastProductItemID !== '' && {
          'data-lastitemid': lastProductItemID,
        })}
      >
        {selectedUser.image ? (
          <Avatar
            sx={{
              backgroundColor: orange[500],
              width: 34,
              height: 34,
              mr: 2.5,
              mb: 5.5,
            }}
            className='message-chat-avatar'
            src={selectedUser.image}
          />
        ) : (
          <Avatar
            sx={{
              backgroundColor: orange[500],
              width: 34,
              height: 34,
              mr: 2.5,
              mb: 5.5,
            }}
            className='message-chat-avatar'
          >
            {selectedUser.name.charAt(0).toUpperCase()}
          </Avatar>
        )}
        <Box
          sx={{
            position: 'relative',
          }}
          className='message-chat-item'
        >
          <Box
            component='span'
            sx={{
              fontSize: 12,
              color: (theme) => theme.palette.text.secondary,
              display: 'block',
              mb: 1.5,
            }}
            className='message-time'
          >
            {moment(item.msg_timestamp).format('llll')}
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-end',
            }}
          >
            <MessageChat>
              {getMessage(item, setIndex, contactList, setShowContact)}
            </MessageChat>
            {/* <MessageChat>{`index: ${INDEX}, msg_id : ${item.msg_id}`}</MessageChat> */}

            {item.edited ? (
              <Box
                sx={{
                  pl: 2.5,
                  color: (theme) => theme.palette.text.secondary,
                  '& .MuiSvgIcon-root': {
                    fontSize: 16,
                  },
                }}
              >
                <EditIcon />
              </Box>
            ) : null}
          </Box>
        </Box>
      </Box>
      {item.message_type === 'PHOTO' ? (
        <MediaViewer index={index} item={item} onClose={onClose} />
      ) : null}
      {showContact ? (
        <ViewContact
          contactList={contactList}
          showContact={showContact}
          setShowContact={setShowContact}
        />
      ) : null}
    </ReceiverMessageWrapper>
  );
};

export default ReceiverMessageItem;

ReceiverMessageItem.propTypes = {
  selectedUser: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired,
  isPreviousSender: PropTypes.bool,
  isLast: PropTypes.bool,
};
