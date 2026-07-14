import {
    getUserMessageAction,
    sendMessageAction,
    updateMessageAction,
    deleteMessageAction,
  } from '../../redux/actions/message_actions';
  import messageReducer from './../../redux/reducers/message_reducers';
  import {useDispatch, useSelector} from 'react-redux';

  const dispatch = useDispatch();
  const {
    messageReducer: {userMessages},
    messageReducer: {userChattedWith},
  } = useSelector((state) => state);

  dispatch(getUserMessageAction(3));

  export {userMessages, userChattedWith};