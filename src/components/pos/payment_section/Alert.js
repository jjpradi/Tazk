import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />;
});

export default function CustomizedSnackbars({
  open,
  severity,
  message,
  setAlert,
}) {
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setAlert({open: false});
  };
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{vertical: 'top', horizontal: 'right'}}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        sx={{width: '100%', zIndex: 9999}}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
