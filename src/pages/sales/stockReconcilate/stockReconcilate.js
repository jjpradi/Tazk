import React, {useEffect, useContext, useRef, useState} from 'react';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import {useDispatch, useSelector} from 'react-redux';
import {
  listStockReconcilateAction,
  listCheckReconcilateProductsAction,
  listStockLotItemsAction,
  listSystemStockAction,
} from '../../../redux/actions/stockReconcilate_actions';
import context from '../../../context/CreateNewButtonContext';
import NoRecordFound from '../../../components/Layout/NoRecordFound';
import {Alert, Button, Grid, Snackbar, SnackbarContent} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MaterialTable from 'utils/SafeMaterialTable';
import LotsPopover from './lotsPopup';
import Context from '../../../context/CreateNewButtonContext';
import {ReconcilateProducts} from './Row';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import {
  StockReconcilateMatchedAlert,
  StockReconcilateMismatchedAlert,
} from 'redux/actions/load';
import apiCalls from 'utils/apiCalls';

//---------------------------------------------------------------------------------------------------------------------------------------------//

export default function StockReconcilate(props) {
  const {newPage, setNewPage, row, stockReconcilate, location_id, category} =
    props;

  const [lotTable, setLotTable] = React.useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [stockLots, setStockLots] = useState([]);
  const [state, setState] = React.useState({
    open: false,
    vertical: 'top',
    horizontal: 'center',
  });

  const {vertical, horizontal, open} = state;
  const dispatch = useDispatch();
  const {
    stockReconcilateReducer: {
      checkReconcilateProducts,
      stockLotItems,
      systemStock,
    },
  } = useSelector((state) => state);

  const [PayData, setPayData] = React.useState({
    paymentOpen: false,
    itemsData: [],
    Tdata: [],
    getVendor: {},
    paid_amount: 0,
  });
  const tempinitsform = useRef(null);

  const {paymentOpen, itemsData, Tdata, getVendor, paid_amount, receiving_id} =
    PayData;
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(Context);

  const initsform = () => {
    let data = {
      category: category,
      location_id: location_id,
    };
    dispatch(
      listSystemStockAction(data, setModalTypeHandler, setLoaderStatusHandler),
    ),
      dispatch(
        listStockReconcilateAction(
          commoncookie,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
        dispatch(listStockLotItemsAction()),
      );
    // dispatch(listStockLotItemsAction(commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
  };
  tempinitsform.current = initsform;
  // useEffect(() => {
  //   tempinitsform.current();
  // }, [])
  useEffect(() => {
    tempinitsform.current();
  }, [headerLocationId]);

  const temp = stockReconcilate.filter((item) => item.reconcilateStatus === 0);
  const temp1 = temp.map((item) => ({
    ...item,
    remarks: 'This product exist in physical stock.',
  }));

  const reconcilateAction = async (newState) => {
    if (temp.length === 0) {
      alert('No products to reconcilate.');
    } else {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          listCheckReconcilateProductsAction(
            temp1,
            setModalTypeHandler,
            setLoaderStatusHandler,
          ),
        ),
        dispatch(
          listStockReconcilateAction(
            commoncookie,
            headerLocationId,
            setModalTypeHandler,
            setLoaderStatusHandler,
          ),
        )
      );
      setState({open: true, ...newState});
    }
    //setNewPage(false);
  };

  const handleClose = () => {
    setState({...state, open: false});
  };

  return (
    <Grid container spacing={4}>
      <Grid
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <h2>Reconcilate Products</h2>
      </Grid>
      <Grid
        size={{
          lg: 6,
          md: 6,
          sm: 6,
          xs: 12
        }}>
        <MaterialTable
          options={{
            headerStyle: {
              fontSize: 15,
            },
            exportButton: true,
            filtering: false,
            actionsColumnIndex: -1,
            maxBodyHeight: '68vh',
            pageSize: 20,
            pageSizeOptions: [20, 50, 100],
            exportMenu: [
              {
                label: 'Export PDF',
                exportFunc: (cols, datas) =>
                  ExportPdf(cols, datas, 'Physical Stock'),
              },
              {
                label: 'Export CSV',
                exportFunc: (cols, datas) =>
                  ExportCsv(cols, datas, 'Physical Stock'),
              },
            ],
          }}
          columns={[
            {title: 'Create Date', field: 'createDate'},
            {title: 'User Name', field: 'username'},
            {title: 'Location Name', field: 'location_name'},
            {
              title: 'Lot Number',
              field: 'lotNumber',
            },
            {
              title: 'Category',
              field: 'category',
              render: (rowdata) =>
                rowdata.category === null ? '-' : rowdata.category,
            },
          ]}
          data={temp}
          title={<Typography variant='h6'>Physical Stock</Typography>}
        />
      </Grid>
      <Grid
        size={{
          lg: 6,
          md: 6,
          sm: 6,
          xs: 12
        }}>
        <MaterialTable
          options={{
            headerStyle: {
              fontSize: 15,
            },
            exportButton: true,
            filtering: false,
            actionsColumnIndex: -1,
            maxBodyHeight: '68vh',
            pageSize: 20,
            pageSizeOptions: [20, 50, 100],
            exportMenu: [
              {
                label: 'Export PDF',
                exportFunc: (cols, datas) =>
                  ExportPdf(cols, datas, 'System Stock'),
              },
              {
                label: 'Export CSV',
                exportFunc: (cols, datas) =>
                  ExportCsv(cols, datas, 'System Stock'),
              },
            ],
          }}
          columns={[
            {title: 'Location Name', field: 'location_name'},
            {title: 'Item name', field: 'name'},
            {title: 'Lot Number', field: 'lot_number'},
            {title: 'Category', field: 'category'},
          ]}
          data={systemStock}
          title={<Typography variant='h6'>System Stock</Typography>}
        />
      </Grid>
      <Grid
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <Grid
          container
          spacing={2}
          display='flex'
          justifyContent='flex-end'
          alignItems='center'
        >
          <Grid>
            <Button
              onClick={() => setNewPage(false)}
              style={{}}
              name='back'
              variant='contained'
              color='secondary'
              size='medium'
              text='button'
              fullWidth={true}
            >
              Back
            </Button>
          </Grid>
          <Grid>
            <Button
              onClick={() =>
                reconcilateAction({
                  vertical: 'top',
                  horizontal: 'right',
                })
              }
              style={{}}
              name='reconcilate'
              variant='contained'
              color='primary'
              size='medium'
              text='button'
              fullWidth={true}
            >
              Submit
            </Button>
            {stockReconcilate.some((item) => item.childData.length > 0) ? (
              <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={handleClose}
                anchorOrigin={{vertical, horizontal}}
                key={vertical + horizontal}
              >
                <SnackbarContent
                  message='Mismatched'
                  sx={{backgroundColor: 'red'}}
                />
              </Snackbar>
            ) : (
              <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={handleClose}
                anchorOrigin={{vertical, horizontal}}
                key={vertical + horizontal}
              >
                <SnackbarContent
                  message='Matched'
                  sx={{backgroundColor: 'green'}}
                />
              </Snackbar>
            )}
          </Grid>
        </Grid>
      </Grid>
      <Grid
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <h2>Mismatched Items</h2>
        {/* <MaterialTable
          options={{
            headerStyle: {
              fontSize: 15,
            },
            exportButton: true,
            filtering: false,
            actionsColumnIndex: -1,
            maxBodyHeight: '68vh',
            pageSize: 20,
            pageSizeOptions: [20, 50, 100],
            exportMenu: [
              {
                label: 'Export PDF',
                exportFunc: (cols, datas) =>
                  ExportPdf(cols, datas, 'Missed Items'),
              },
              {
                label: 'Export CSV',
                exportFunc: (cols, datas) =>
                  ExportCsv(cols, datas, 'Missed Items'),
              },
            ],
          }}
          columns={[
            {title: 'Lot Number', field: 'lot_number'},
            {title: 'Product Name', field: 'name'},
            {title: 'Location Name', field: 'location_name'},
            {title: 'Create Date', field: 'createDate'},
          ]}
          data={stockReconcilate.childData}
          title={<Typography variant='h6'>Missed Items</Typography>}
        /> */}
        <TableContainer component={Paper}>
          <Table aria-label='collapsible table'>
            <TableHead>
              <TableRow>
                <TableCell>Lot Number</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell>Location Name</TableCell>
                <TableCell>Create Date</TableCell>
                <TableCell>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stockReconcilate.map((row) => (
                <ReconcilateProducts
                  row={row}
                  key={row.id}
                  stockReconcilate={stockReconcilate}
                  checkReconcilateProducts={checkReconcilateProducts}
                  stockLotItems={stockLotItems}
                />
              ))}
            </TableBody>
            {stockReconcilate.map((m) => {m.childData}).length === 0 && (
              <TableBody>
                <TableRow display='flex'>
                  <TableCell align='center' colSpan={9} sx={{py: 3}}>
                    <NoRecordFound />
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
}

