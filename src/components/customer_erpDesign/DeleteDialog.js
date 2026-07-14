import React, { useEffect, useContext, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  TextField,
  Slide,
  IconButton
} from '@mui/material';
import PropTypes from 'prop-types';
import CloseIcon from '@mui/icons-material/Close';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />;
});

export default function DeleteDialog({open, onDeny, onConfirm,empData}) {

  const [userName, setUserName] = useState('');
  const [formValues, setFormValues] = useState({ username: '' });

  const handleFormValuesChange = (event) => {
    setFormValues({
      ...formValues,
      username: event.target.value,
    });
  };

  const onClose = () => {
    setFormValues({
      ...formValues,
      username: '',
    });

    onDeny(false)
  }

  const handleSubmit = () =>{
    setFormValues({
      ...formValues,
      username: '',
    });
    onConfirm()
  }

  const isDeleteButtonEnabled = empData.username === formValues.username;

  return (
    <Dialog
        maxWidth='sm'
        TransitionComponent={Transition}
        open={open}
        onClose={onClose}
      >
      <DialogTitle id='alert-dialog-title'>
        {`Delete ${empData.username}`}
      <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
  <Grid container spacing={3}>
    <Grid size={12}>
          To confirm, type {`"${empData.username}"`} in the box
    </Grid>
        {/* <Grid size={{ xs: 6, sm: 6, md: 5.7, lg: 5.7 }} display={'flex'} >
          <TextField
            fullWidth={true}
            label='User Name'
            placeholder='Enter in hours'
            name='ogUserName'
            type='text'
            inputProps={{ min: 1, max: 12,readOnly: true }}
            variant='filled'
            value={empData.username}
          />
        </Grid> */}
        <Grid size={12}>
          <TextField
            fullWidth={true}
            onChange={handleFormValuesChange}
            name='userName'
            type='text'
            inputProps={{ min: 1, max: 59 }}
            variant='outlined'
            value={formValues.username}
          />
        </Grid>
    <Grid size={12}>
      <Button
        fullWidth
      variant='outlined'
      onClick={handleSubmit}
      color='primary'
      disabled={!isDeleteButtonEnabled}
    >
      Delete this user
      </Button>
      </Grid>
      </Grid>
      </DialogContent>
      {/* <DialogActions>
      <Button
        variant='outlined'
        onClick={() => onDeny(false)}
        color='primary'
        autoFocus
      >
          Cancel
        </Button>

      </DialogActions> */}
    </Dialog>
  );
}

DeleteDialog.propTypes = {
  dialogTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  open: PropTypes.bool.isRequired,
  onDeny: PropTypes.func.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onConfirm: PropTypes.func.isRequired,
};