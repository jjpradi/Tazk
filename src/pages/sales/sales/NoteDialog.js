import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function FormDialog(props) {
  const [open, setOpen] = React.useState(false);
  const [noteValue, setnoteValue] = React.useState('');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button variant='contained' onClick={handleClickOpen}>
        add note
      </Button>
      <Dialog
        open={open}
        //   onClose={handleClose}
      >
        <DialogTitle>Enter your note</DialogTitle>
        <DialogContent>
          <TextField
            sx={{width: 500}}
            value={noteValue}
            autoFocus
            margin='dense'
            id='name'
            // label="Email Address"
            type='email'
            fullWidth
            onChange={(e) => setnoteValue(e.target.value)}
            variant='outlined'
            rows={2}
            multiline
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <Button
            onClick={() => {
              props.addNote(noteValue);
              handleClose();
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
