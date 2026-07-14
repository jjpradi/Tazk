import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import PanoramaIcon from '@mui/icons-material/Panorama';
import StandardImageList from './standardImages';

export default function ImageDialog(props) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
// console.log("shopImage",props.rowData);

  return (
    <React.Fragment>
      <PanoramaIcon variant="outlined" onClick={handleClickOpen}>
        Open alert dialog
      </PanoramaIcon>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="imagedialog-dialog-title">
          {"Shop Location Images"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="imagedialog-dialog-description">
          <StandardImageList images={props.rowData?.images}/>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='warning'>Close</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}