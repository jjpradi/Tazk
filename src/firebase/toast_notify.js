import {Button} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {ToastContainer, toast} from 'react-toast';

const ToastMessage = () => {
  return <ToastContainer position='bottom-right' delay={5000} />;
};

export default ToastMessage;
