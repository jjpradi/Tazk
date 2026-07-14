import React, {useContext, useState} from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import {useDispatch} from 'react-redux';
import {
  listStockReconcilateAction,
  listCheckReconcilateProductsAction,
} from '../../../redux/actions/stockReconcilate_actions';
import context from '../../../context/CreateNewButtonContext';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LotsPopover from './lotsPopup';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {TableHead} from '@mui/material';
import {padding} from '@mui/system';
import NoRecordFound from 'components/Layout/NoRecordFound';

export default function Row(props) {
  const {row, stockReconcilate, stockLotItems,} = props;
  const [open, setOpen] = React.useState(false);
  const [lotTable, setLotTable] = React.useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [stockLots, setStockLots] = useState([]);

  const dispatch = useDispatch();
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(context);

  // const handleSubmit = async (data) => {
  //   await dispatch(
  //     listCheckReconcilateProductsAction(
  //       data,
  //       setModalTypeHandler,
  //       setLoaderStatusHandler,
  //     ),
  //   );
  //   dispatch(
  //     listStockReconcilateAction(
  //       commoncookie,
  //       headerLocationId,
  //       setModalTypeHandler,
  //       setLoaderStatusHandler,
  //     ),
  //   );
  // };



  return (
    <React.Fragment>
      <TableRow sx={{'& > *': {borderBottom: 'unset'}}}>
        {/* <TableCell>
          <IconButton
            aria-label='expand row'
            size='small'
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell> */}
        <TableCell>{row.createDate}</TableCell>
        <TableCell component='th' scope='row'>
          {row.username}
        </TableCell>
        <TableCell>{row.location_name}</TableCell>
        <TableCell>
          {/* <Link href="#" aria-describedby={id} onClick={handleClick}> */}
          <IconButton
            aria-label='expand row'
            size='small'
            onClick={(e) => {
              setStockLots(row.lots);
              setAnchorEl(e.currentTarget);
              setLotTable(!open);
            }}
          >
            <AssignmentIcon />
          </IconButton>
          {/* </Link> */}
        </TableCell>
        {/* <TableCell>
          <Button
            onClick={() => handleSubmit(row)}
            style={{}}
            name='reconcilate'
            variant='contained'
            color='primary'
            size='medium'
            text='button'
            fullWidth={false}
            disabled={row.reconcilateStatus === 1 ? true : false}
          >
            RECONCILATE
          </Button>
        </TableCell> */}
      </TableRow>

      {lotTable && (
        <LotsPopover
          stockLotItems={stockLotItems}
          open={lotTable}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          setLotTable={setLotTable}
          stockReconcilate={stockReconcilate}
          stockLots={stockLots}
        />
      )}
    </React.Fragment>
  );
}

export function ReconcilateProducts(props) {
  const {row} = props;

  const dispatch = useDispatch();
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(context);

  // const handleSubmit = async (data) => {
  //   await dispatch(
  //     listCheckReconcilateProductsAction(
  //       data,
  //       setModalTypeHandler,
  //       setLoaderStatusHandler,
  //     ),
  //   );
  //   dispatch(
  //     listStockReconcilateAction(
  //       commoncookie,
  //       headerLocationId,
  //       setModalTypeHandler,
  //       setLoaderStatusHandler,
  //     ),
  //   );
  // };

  return (
    <React.Fragment>
      {row.childData?.map((historyRow) => (
        <TableRow key={historyRow.id}>
          <TableCell>{historyRow.lot_number}</TableCell>
          <TableCell sx={{justifyContent: 'center'}}>
            {historyRow.name === null ? '-' : historyRow.name}
          </TableCell>
          <TableCell>{historyRow.location_name}</TableCell>
          <TableCell>{historyRow.createDate}</TableCell>
          <TableCell>{historyRow.remarks}</TableCell>
        </TableRow>
      ))}
    </React.Fragment>
  );
}
