import React from 'react';
import {
  Button,
  List,
  ListItem,
  Dialog,
  DialogActions,
  DialogContent,
  ListItemText,
  DialogTitle,
} from '@mui/material';

const formSx = {
  display: 'flex',
  flexDirection: 'column',
  margin: 'auto',
  width: 'fit-content',
};

const titleSx = {
  textAlign: 'center',
};

const selectedColorSx = {
  color: 'rgb(88, 214, 141)',
};

const formControlSx = {
  marginTop: (theme) => theme.spacing(2),
  minWidth: 120,
};

export default function DublicateLotList(props) {
  const [open, setOpen] = React.useState(true);
  const [type] = React.useState('intra state');
  // const [lotData,setLotData] = React.useState([]);

  const handleClose = () => {
    setOpen(false);
    props.handleClose([]);
  };
  return (
    <React.Fragment>
      <Dialog
        fullWidth
        open={open}
        onClose={handleClose}
        aria-labelledby='max-width-dialog-title'
      >
        <DialogTitle sx={titleSx} id='max-width-dialog-title'>
          Select one Product
        </DialogTitle>
        <DialogContent>
          <form style={formSx} noValidate>
            <List
              component='nav'
              sx={formControlSx}
              aria-label='main mailbox folders'
            >
              {props.data[0].map((d) => {
                return (
                  <ListItem
                    key={d}
                    style={{width: '500px'}}
                    sx={
                      type === 'intra state' ? selectedColorSx : undefined
                    }
                    button
                    //    selected={type === 'intra state'}
                    onClick={(event) => props.dublicateItem(d, props.data[1])}
                  >
                    <ListItemText primary={`${d.name}(${d.sku})`} />
                  </ListItem>
                );
              })}
            </List>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='primary'>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
