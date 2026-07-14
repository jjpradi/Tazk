import React from 'react';
import Popper from '@mui/material/Popper';
import Button from '@mui/material/Button';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export default function PaymentInputs(props) {
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen((previousOpen) => !previousOpen);
  };

  const canBeOpen = open && Boolean(anchorEl);
  const id = canBeOpen ? 'transition-popper' : undefined;

  return (
    <>
      <Button
        aria-describedby={id}
        size='small'
        variant='contained'
        color='primary'
        style={{marginRight: 10}}
        type='Button'
        onClick={(e) =>
          props.onclick(
            props.date,
            () => handleClick(e),
            props.posId,
            props.s_id,
            props.syncTime,
          )
        }
      >
        <Typography variant='h9'>Resume</Typography>
      </Button>

      <Popper
        id={id}
        open={open}
        anchorEl={anchorEl}
        placement='bottom-start'
        transition
      >
        {({TransitionProps}) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper elevation={3}>
              <div style={{padding: '10px'}}>
                <Typography variant='subtitle1' color='red' component='div'>
                  Can't resume! You need to close your current session.
                </Typography>
              </div>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  );
}
