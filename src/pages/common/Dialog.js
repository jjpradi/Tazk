import React, { useEffect, useContext } from 'react';
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
} from '@mui/material';
// import {useSelector, useDispatch} from 'react-redux';
// import apiCalls from 'utils/apiCalls';
//import {getCheckProductAction} from '../redux/actions/product_actions';
// import CreateNewButtonContext from '../context/CreateNewButtonContext';

export default function AlertDialog(props) {
  // const [setOpen] = React.useState(false);

  // const handleDelete=()=>{
  //     props.handleDelete(props.id);
  // }

  // const handleClickOpen = () => {
  //   setOpen(true);
  // };

  // const handleClose = () => {
  //   setOpen(false);
  // };
  // const {setModalTypeHandler, setLoaderStatusHandler} = useContext(
  //   CreateNewButtonContext,
  // );
  // const dispatch = useDispatch();
  // useEffect(() => {
  //   apiCalls(
  //     setModalTypeHandler,
  //     setLoaderStatusHandler,
  //     dispatch(
  //       getCheckProductAction(props.id)
  //     )
  //   );
   
  // },[props.checkproduct])

  return (
    <div>
      {/* <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Open alert dialog
      </Button> */}
      <Dialog
        open={props.delete}
        onClose={props.handleClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>{'Delete ?'}</DialogTitle>
        <Grid container>
          <Grid
            size={{
              lg: 6,
              md: 6
            }}>
            <DialogContent style={{width: 500}}>
              <DialogContentText
                id='alert-dialog-description'
                sx={{color: 'warning.main'}}
              >
                Are you sure you want to delete ?
              </DialogContentText>
            </DialogContent>
          </Grid>
          <Grid
            size={{
              lg: 6,
              md: 6
            }}>
            {props.type === 'Purchase' && (
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={props.checkBox}
                      onChange={({target}) => {
                        props.setCheckBox(target.checked);
                      }}
                    />
                  }
                  label='Send mail'
                />
              </FormGroup>
            )}
          </Grid>
        </Grid>

        <DialogActions>
          <Button onClick={() => props.handleClose()} color='secondary'>
            Cancel
          </Button>
          <Button
            onClick={() =>
              props.deleteFuc ? props.deleteFuc() : props.handleDelete(props.id, props.ledger_id, props.date)
            }
            color='primary'
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
