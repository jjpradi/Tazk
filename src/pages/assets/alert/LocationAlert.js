import React from 'react';
import Alert from '@mui/material/Alert';
import {Grid, IconButton, Slide, Snackbar, Typography} from '@mui/material';
import {Fonts} from 'shared/constants/AppEnums';
import CloseIcon from '@mui/icons-material/Close';

const LocationAlert = (props) => {
  function SlideTransition(props) {
    return <Slide {...props} direction='down' />;
  }

  const {open, onClose, missingField } = props;
  const vertical = 'top';
  const horizontal = 'right';
  return (
    // <Snackbar
    //   anchorOrigin={{vertical, horizontal}}
    //   open={open}
    //   onClose={onClose}
    //   TransitionComponent={SlideTransition}
    //   // autoHideDuration={6000}
    //   key={vertical + horizontal}
    //   ClickAwayListenerProps={{ onClickAway: () => null, }}
    // >
    //   <Alert severity='warning' sx={{width: '100%', bgcolor: '#e9d502'}}>
    //     {'Please Choose One Location!'}
    //   </Alert>
    // </Snackbar>

    <Snackbar
      open={open}
      autoHideDuration={4000}
      anchorOrigin={{vertical: 'top', horizontal: 'right'}}
      onClose={onClose}
    >
      <Alert onClose={onClose} severity={'warning'} sx={{width: '100%', bgcolor: '#e9d502 !important'}}>
      {missingField ? `Missing Field: ${missingField}` : "Please Choose One Location!"}
      </Alert>
    </Snackbar>
  );
};

export default LocationAlert;
