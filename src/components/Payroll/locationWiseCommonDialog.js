import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import LocationWiseCommonTable from './LocationWiseCommonTable'

export default function LocationWiseCommonDialog({dialogOpen, setDialogOpen, rowData, columnType}) {

  const handleClose = () => {
    setDialogOpen(false)
  };

  return (
    <React.Fragment>
      <Dialog
        fullWidth={true}
        maxWidth={'lg'}
        open={dialogOpen}
        onClose={handleClose}
      >
        <DialogTitle>Location Wise {columnType} Details</DialogTitle>
        <DialogContent>
          <Box>
            <LocationWiseCommonTable rowData={rowData} columnType={columnType}/>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}