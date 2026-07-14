import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

export default function CommonDialog({
  cancel_buttonName = 'Cancel',
  ok_buttonName = 'Ok',
  dialogTitle = '__Dialog Title__',
  dialogContent = '__Dialog Content__',
  cancel_fun = () => {},
  ok_fun = () => {},
  open = false,
  handleClose = () => {},
  discard_buttonName = null,
  type = null,
  disabled = false,
}) {
  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>{dialogTitle}</DialogTitle>
        <DialogContent style={{width: 500}}>
          <DialogContentText id='alert-dialog-description' sx={{}}>
            {dialogContent}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {discard_buttonName && (
            <Button onClick={handleClose} color='secondary'>
              {discard_buttonName}
            </Button>
          )}
          {type ? (
            <>
              <Button onClick={ok_fun} color='primary' autoFocus disabled={disabled}>
                {ok_buttonName}
              </Button>
              <Button onClick={cancel_fun} color='secondary'>
                {cancel_buttonName}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={cancel_fun} color='secondary'>
                {cancel_buttonName}
              </Button>
              <Button onClick={ok_fun} color='primary' autoFocus disabled={disabled}>
                {ok_buttonName}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}
