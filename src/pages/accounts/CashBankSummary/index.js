import React, { useEffect, useState, useRef, useContext } from 'react';
// import PropTypes from 'prop-types';
import { Box, Grid, CardContent, Card, TextField, DialogTitle, DialogContentText, DialogContent, Dialog, DialogActions } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import { Table, Button } from '@mui/material';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useDispatch, useSelector } from 'react-redux';
import {
  listSalesOutstandingAction,
  sendMail,
} from '../../../redux/actions/sales_actions';
// import { Alert } from '@mui/material';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import {
  listSalesAction,
  receiptEntry,
  consolidatedReceivings,
} from '../../../redux/actions/sales_actions';
import { listCustomerAction } from '../../../redux/actions/customer_actions';
import { listProductAction } from '../../../redux/actions/product_actions';
import PaymentDialog from '../../sales/paymentSalesPurchase/Dialog';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import NoRecordFound from '../../../components/Layout/NoRecordFound';
import { GetledgerSummaryAction } from '../../../redux/actions/cash_box_actions';
import InvoiceDialog from '../../sales/sales/InvoiceDialog';
import Context from '../../../context/CreateNewButtonContext';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { Helmet } from "react-helmet-async";
import { headerStyle ,cellStyle, maxHeight, maxBodyHeight} from 'utils/pageSize';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
// import { LocalizationProvider } from '@mui/lab';
// import { DatePicker } from 'formik-material-ui-pickers';
import moment from 'moment';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { DatePicker, DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import RemoveCircleOutlineOutlinedIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import apiCalls from 'utils/apiCalls';
import { getDateFormat } from 'utils/getTimeFormat';
import { titleURL } from 'http-common';
import toMomentOrNull from 'utils/DateFixer';

function Row(props) {
  const { row, invoiceFunction, sales_data, handleMailConfiguration } = props;
  const [open, setOpen] = React.useState(false);
  const [entryvalue, sethandleEntry] = useState(false)

  const GetTotal = (row) => {
    let total = 0;
    if (row.childRow) {
      row.childRow.forEach((val) => {
        total += val.total;
      });
    }
    return total;
  };

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label='expand row'
            size='small'
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component='th' scope='row'>
          {row.parentName}
        </TableCell>
        <TableCell>{row.shop_count}</TableCell>
      </TableRow>

      <TableRow>
        <TableCell
          style={{ paddingBottom: 0, paddingTop: 0, paddingLeft: 80 }}
          colSpan={6}
        >
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Table size='small' aria-label='purchases'>
                <TableHead>
                  <TableRow>
                    <TableCell>Ledger</TableCell>
                    <TableCell>Transaction Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell align="right">Credit</TableCell>
                    <TableCell align="right">Debit</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>

                  <TableRow>
                    <TableCell>
                      {row.childLedgerName}
                    </TableCell>
                    <TableCell>
                      {row.transactionDate}
                    </TableCell>
                    <TableCell>
                      {row.amount}
                    </TableCell>
                    <TableCell align="right">
                      {row.credit}
                    </TableCell>
                    <TableCell align="right">
                      {row.debit}
                    </TableCell>
                  </TableRow>

                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default function CollapsibleTable() {
  const dispatch = useDispatch();
  const datefilter =getDateFormat(new Date())
  const [open, setOpen] = useState(false)
  const [collapseOpen, setCollapseOpen] = useState(true)
  const [close, setClose] = useState(false)
  const [date, setDate] = useState(datefilter);
  const [isApiFinished, setIsApiFinished] = useState(false);
  const handleSubmitCustomDate = () => {
    // setDate(date)
    const data = {
      date: moment(date).format('YYYY-MM-DD')
    };
    dispatch(GetledgerSummaryAction(data))

    setOpen(false)
  };
  const handleClear = () => {
    setDate(datefilter)
  }

  const onKeyDown = (e) => {
    e.preventDefault();
  };

  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(Context);
  const {
    salesReducer: { sale_outstanding, consolidated_data },
    cashBoxReducer: { ledger_amount_summary }
  } = useSelector((state) => state);

  useEffect(() => {
    const data = {
      date: date,
    };
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(GetledgerSummaryAction(data))
    ).finally(() => setIsApiFinished(true))
  }, [])

  const tempinitsform = useRef(null);

  const tempinitsformVal = useRef(null);
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title> {titleURL} | CashBank Summary </title>
      </Helmet>
      <CreateNewButtonContext.Consumer>
        {({ loaderStatus }) => (
          <div>
              <Dialog
                disableEscapeKeyDown
                open={open}
                onClose={() => {
                  setClose(true);
                }}
              >
                <Box style={{ padding: '10px' }}>
                  <Grid style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton aria-label="close" onClick={() => {
                      setOpen(false);
                      setDate(date)
                    }} >
                      <CloseIcon />

                    </IconButton>
                  </Grid>
                  <DialogTitle variant='h3'>Choose Date</DialogTitle>
                  <DialogContent>
                    <Box
                      component='form'
                      sx={{
                        display: 'flex',
                        width: '300px',
                        gap: '20px',
                        marginTop: '10px',
                      }}
                    >
                      <LocalizationProvider dateAdapter={DateAdapter}>
                        <DatePicker
                          label='Select Date'
                          // inputFormat='DD/MM/yyyy'
                          value={toMomentOrNull(date)}
                          format='DD/MM/YYYY'
                          inputVariant='contained'
                          onChange={(e, v) => {
                            if (e) {
                              setDate(e._d);
                            }
                          }}
                        slotProps={{ textField: { onKeyDown: onKeyDown, fullWidth: true, variant: 'filled' } }}
                        />
                      </LocalizationProvider>
                    </Box>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={() => {
                        handleClear()
                      }}
                    >
                      Clear
                    </Button>
                    <Button onClick={handleSubmitCustomDate} variant='contained'>
                      Apply
                    </Button>
                  </DialogActions>
                </Box>
              </Dialog>
            {/* <Grid style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 10 }} > */}
              {/* <TextField type='date'></TextField> */}
              {/* <FilterAltIcon /> */}
            {/* </Grid> */}
            <MaterialTable
            //  style={{height:'86vh',overflow:'auto'}}
              components={{
                Toolbar: (props) => (
                  <>
                    <div
                      style={{
                        display: 'flex',
                        width: '100%',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ width: '100%' }}>
                        <MTableToolbar {...props} />
                      </div>
                    </div>
                  </>
                ),
              }}
              actions={[
                {
                  icon: () => (<FilterAltIcon />),
                  onClick: () => setOpen(true),
                  tooltip: 'Filter',
                  isFreeAction: true,
                },
              ]}
              options={{
                showEmptyDataSourceMessage: isApiFinished,
                maxBodyHeight: 'calc(100vh - 770px)',
                minBodyHeight: '530px',
                headerStyle,
                cellStyle,
                paging: false,
                search:false,
              }}
          columns={[
            { title: 'Parent Ledger', field: 'parentName' },
            { title: 'Child Ledger', field: 'childLedgerName' },
            { 
            title: ' Transaction Date', 
            field: 'transactionDate'
            },
            { title: 'Amount', field: 'amount', cellStyle : {textAlign: 'right',paddingRight:'185px'}},
            // { title: 'Unreconciled', field: 'amount', cellStyle : {textAlign: 'right',paddingRight:'185px'}},
            // { title: 'Credit', field: 'credit', cellStyle : {textAlign: 'right',paddingRight:'185px'}},
            // { title: 'Debit', field: 'debit', cellStyle : {textAlign: 'right',paddingRight:'185px'}}
          ]}
          data = {ledger_amount_summary}
          title = "Cash / Bank Summary"
        />

            {/* {
              !ledger_amount_summary.length && 
              loaderStatus === false && (
                 <NoRecordFound />
              )
            } */}
          </div >
        )
        }
      </CreateNewButtonContext.Consumer >
    </>
  );
}

