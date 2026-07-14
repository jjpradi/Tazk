import React, {useEffect} from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

const formSx = {
  display: 'flex',
  flexDirection: 'column',
  margin: 'auto',
  width: 'fit-content',
};
const titleSx = { textAlign: 'center' };
const selectedColorSx = { color: 'rgb(88, 214, 141)' };
const formControlSx = { mt: 2, minWidth: 120 };

export default function Taxtype(props) {
  const [open, setOpen] = React.useState(true);
  const [type, setType] = React.useState('intra state');
  //   const [maxWidth, setMaxWidth] = React.useState('sm');

  useEffect(() => {}, []);

  const handleClose = () => {
    setOpen(false);
    props.handleClose();
    props.EditProductList({name: 'taxtype', value: type});
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
          Select Tax Type
        </DialogTitle>
        <DialogContent>
          <form style={formSx} noValidate>
            <List
              component='nav'
              sx={formControlSx}
              aria-label='main mailbox folders'
            >
              <ListItem
                sx={{ width: '500px', ...(type === 'intra state' ? selectedColorSx : {}) }}
                button
                selected={type === 'intra state'}
                onClick={(event) => setType('intra state')}
              >
                <ListItemText primary='Intra State' />
              </ListItem>
              <ListItem
                sx={{ width: '500px', ...(type === 'inter state' ? selectedColorSx : {}) }}
                button
                selected={type === 'inter state'}
                onClick={(event) => setType('inter state')}
              >
                <ListItemText primary='Inter State' />
              </ListItem>
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
