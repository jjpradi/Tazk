import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

export default function CancelDialog(props) {
  return (
    <div>
      <Dialog
        open={props.delete}
        onClose={props.handle}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              width: 460,
              maxWidth: 'calc(100% - 32px)',
            },
          },
        }}
      >
        <DialogTitle id='alert-dialog-title' sx={{pb: 1}}>
          <Box display='flex' alignItems='center' gap={1.25}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#fff4e5',
                color: '#b26a00',
              }}
            >
              <WarningAmberRoundedIcon />
            </Box>
            <Box>
              <Typography variant='h6' sx={{fontWeight: 700}}>
                Changes may not be saved
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Please confirm before leaving this page.
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{pt: '8px !important'}}>
          <Box
            id='alert-dialog-description'
            sx={{
              p: 2,
              borderRadius: 2.5,
              border: '1px solid #ffe0b2',
              bgcolor: '#fffaf3',
            }}
          >
            <Typography variant='body1' sx={{fontWeight: 600, mb: 0.5}}>
              Are you sure you want to exit?
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              If you continue, any unsaved changes in this screen may be lost.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{px: 3, pb: 2.5}}>
          <Button onClick={props.handle} color='secondary' variant='contained'>
            Cancel
          </Button>
          <Button onClick={props.close} color='primary' variant='contained' autoFocus>
            Exit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
