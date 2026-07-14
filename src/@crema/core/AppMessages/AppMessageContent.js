import React, {useEffect, useState, useContext} from 'react';
import messages from '@crema/services/db/messages';
import {Box, IconButton} from '@mui/material';
import MessageItem from './MessageItem';
import List from '@mui/material/List';
import Button from '@mui/material/Button';
import AppScrollbar from '@crema/core/AppScrollbar';
import IntlMessages from '@crema/utility/IntlMessages';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import { getInboxAction } from '../../../redux/actions/message_actions';
import messageReducer from './../../../redux/reducers/message_reducers';
import {useDispatch, useSelector} from 'react-redux';
import context from '../../../context/CreateNewButtonContext';
import Message from './../../../pages/common/message/index';
import { useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import apiCalls from 'utils/apiCalls';


const AppMessageContent = ({onClose, sxStyle}) => {
  const dispatch = useDispatch();
  const { 
    messageReducer: {inboxList},
    messageReducer: {isApiSuccess} 
  } = useSelector((state) => state);
  const {
    commoncookie: currentEmpId, 
    setModalTypeHandler,
    setLoaderStatusHandler,} = useContext(context);
  const [inboxLoading, setInboxLoading] = useState(true);

  let navigate = useNavigate();

  useEffect(() => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getInboxAction(currentEmpId)),
    );
  }, []);

  useEffect(() => {
  }, [inboxList]);


  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: 280,
        height: '100%',
        ...sxStyle,
      }}
    >
      <Box
        sx={{
          padding: '5px 20px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: 1,
          borderBottomColor: (theme) => theme.palette.divider,
          minHeight: {xs: 56, sm: 70},
        }}
      >
        <Typography component='h3' variant='h3'>
          <IntlMessages id='dashboard.messages' />({inboxList.length})
        </Typography>
        <IconButton
          sx={{
            height: 40,
            width: 40,
            ml: 'auto',
            color: 'text.secondary',
          }}
          onClick={onClose}
          size='large'
        >
          <CancelOutlinedIcon />
        </IconButton>
      </Box>
      <AppScrollbar
        sx={{
          height: {xs: 'calc(100% - 96px)', sm: 'calc(100% - 110px)'},
        }}
      >
        {isApiSuccess ? '' : <Box 
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
        sx={{ display: 'flex', width:'auto', margin:'0 auto', marginTop:'20px' }}>
           <CircularProgress />
        </Box>}
        <List
          sx={{
            py: 0,
          }}
        >
          {inboxList.length > 0  ? inboxList.map((item) => (
            <MessageItem key={item.inbox_id} item={item} />
          )) : <Box 
          spacing={0}
          direction="column"
          alignItems="center"
          justifyContent="center"
          sx={{ display: 'flex', width:'auto', margin:'0 auto', marginTop:'20px' }}>
             {isApiSuccess ?  'No Messages...' : '' }
          </Box>}
        </List>
      </AppScrollbar>
      <Button
        sx={{
          borderRadius: 0,
          width: '100%',
          textTransform: 'capitalize',
          marginTop: 'auto',
          height: 40,
        }}
        variant='contained'
        color='primary'
        onClick={() => {
          navigate('/message', { replace: true });
          onClose();
        }}
      >
        View All
      </Button>
    </Box>
  );
};

export default AppMessageContent;

AppMessageContent.propTypes = {
  index: PropTypes.number,
  onClose: PropTypes.func,
  sxStyle: PropTypes.object,
};
