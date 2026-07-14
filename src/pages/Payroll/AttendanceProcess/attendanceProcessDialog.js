import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useSelector } from 'react-redux';
import { List, ListItem, ListItemText } from '@mui/material';

export default function AttendanceProcessDialog({ dialogOpen, setDialogOpen }) {

  const { attendanceReducer: { attendanceViewExist } } = useSelector((state) => state);

  const handleClose = () => {
    setDialogOpen(false);
  };

  return (
    <React.Fragment>
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="attendanceprocessdialog-dialog-title">
          {"Attendance Process"}
        </DialogTitle>
        <DialogContent>
            <DialogContentText id="attendanceprocessdialog-dialog-description">
                {`Already Salary Process Confirmed, Please Remove This Below Employee's Try again.\n`}
            </DialogContentText>
            
            <DialogContentText id="alert-dialog-description1">
                <ol>
                    {attendanceViewExist.length ? attendanceViewExist.map((d, index) => (
                        <li key={index}>
                            <List sx={{ width: '20%', maxWidth: 360, bgcolor: 'background.paper' }}>
                                <ListItem sx={{ p: '0px' }}>
                                <ListItemText primary={d} />
                                </ListItem>
                            </List>
                        </li>
                    )) : ''}
                </ol>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}