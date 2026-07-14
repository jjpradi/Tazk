import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import {useDispatch, useSelector} from 'react-redux';
import {ClosealertActions} from '../../../redux/actions/alert_actions';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} sx={{display: 'flex', alignItems: 'center'}} />;
});


function Alertbox() {
  const dispatch = useDispatch();
  const {open, msg, severity} = useSelector((state) => state.alertboxReducer);
  const handleClose = () => {
    dispatch(ClosealertActions());
  };
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      anchorOrigin={{vertical: 'top', horizontal: 'right'}}
      onClose={handleClose}
    >
      <Alert onClose={handleClose} severity={severity} >
        {msg}
      </Alert>
    </Snackbar>
  );
}
export default Alertbox;
