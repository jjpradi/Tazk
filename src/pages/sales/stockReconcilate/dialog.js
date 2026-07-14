import {
  DialogActions,
  Dialog,
  DialogContent,
  Button,
  Typography,
} from '@mui/material';
import React, {useContext} from 'react';
import {MoveProducts} from 'redux/actions/stockReconcilate_actions';
import apiCalls from 'utils/apiCalls';
import context from '../../../context/CreateNewButtonContext';
import {useDispatch} from 'react-redux';

export function ScrapLocationDialog(props) {
  const dispatch = useDispatch();
  const {handleClose, open, title, data, setDialogOpen} = props;
  const {setLoaderStatusHandler, setModalTypeHandler, commoncookie} =
    useContext(context);
  // missing
  const moveScrapLocation = async (data) => {
    delete data.tableData;
    let move = {
      employee_id: commoncookie,
      type: 0, // move to scrap
      lotType: 'missing',
      table_data: data,
    };
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(MoveProducts(move, 'Moved to Scrap Location')),
    );
    await setDialogOpen({open: false});
  };

  return (
    <Dialog open={open} onClose={() => handleClose()}>
      <DialogContent>
        <Typography>{title}</Typography>
      </DialogContent>
      <DialogActions>
        <Button color='secondary' onClick={() => handleClose()}>
          <Typography>{'Cancel'}</Typography>
        </Button>
        <Button onClick={() => moveScrapLocation(data)}>
          <Typography>{'Submit'}</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function InventoryDialog(props) {
  const dispatch = useDispatch();
  const {handleClose, open, title, data, setInventoryOpen} = props;
  const {setLoaderStatusHandler, setModalTypeHandler, commoncookie} =
    useContext(context);

  //excess
  const moveToInventory = async (data) => {
    delete data.tableData;
    let moveToInventory = {
      employee_id: commoncookie,
      type: 1, // move to inventory.
      lotType: 'excess',
      table_data: data,
    };
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(MoveProducts(moveToInventory, 'Moved to Inventory')),
    );
    setInventoryOpen({open: false, data: {}, title: ''});
  };
  return (
    <Dialog open={open} onClose={() => handleClose()}>
      <DialogContent>
        <Typography>{title}</Typography>
      </DialogContent>
      <DialogActions>
        <Button color='secondary' onClick={() => handleClose()}>
          <Typography>{'Cancel'}</Typography>
        </Button>
        <Button onClick={() => moveToInventory(data)}>
          <Typography>{'Submit'}</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
}
