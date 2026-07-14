import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useState, useCallback } from 'react';
import _ from 'lodash';
import { debounceFunction } from 'utils/debounceFunction'

  

export default function SendMailDialog(props) {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState(false)

  const handleClickOpen = () => {
    props.setEmailOpen(true);
  };

  const handleClose = () => {
    props.setEmailOpen(false);
    setEmail('');
    setEmailError(false)
  };

  const handleSubmit = () => {
    if(!isValidEmail(email)){
      setEmailError(true);
      return
    }

    props.handleSendEmail(email);
    setEmail('');
  };

  const debounceDropDown = useCallback(debounceFunction((val) => emailValidation(val), 1000), [])

  const emailValidation = (val) => setEmailError( !isValidEmail(val));

  function isValidEmail(email) {
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  return (
    <div>
      <Dialog open={props.emailOpen} onClose={handleClose}>
        <DialogTitle>Send Report Through Email</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter email address here. Report will be sent to this email address.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Email Address"
            type="email"
            fullWidth
            value={email}
            variant="standard"
            onChange={(e) => {
              setEmail(e.target.value);
              debounceDropDown(e.target.value)
            }}
            error={emailError}
            helperText={emailError === true && email === '' ? 'Email is required' : emailError === true && 'Enter valid email'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Share</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}