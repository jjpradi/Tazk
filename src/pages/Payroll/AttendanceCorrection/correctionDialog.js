import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import React from 'react';
import Correction from './correction';

export default function CorrectionDialog(props) {
  const {handleClose, open} = props;
  return (
    <Dialog onClose={handleClose} open={open} fullWidth={true} maxWidth={'sm'}>
      <DialogTitle id='alert-dialog-title'>{'Correction'}</DialogTitle>
      <DialogContent>
        <Correction />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color='secondary'>
          {'Cancel'}
        </Button>
        <Button color='primary'>{'Submit'}</Button>
      </DialogActions>
    </Dialog>
  );
}
