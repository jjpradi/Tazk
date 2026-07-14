import React, { useEffect, useContext, useRef, useState } from 'react';
// import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
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
  paymentview,
  createPurchasesAction,
  updatePurchasesAction,
  receivingsPayments,
  consolidatedPayables,
} from '../../../redux/actions/purchase_actions';
import { listVendorAction } from '../../../redux/actions/vendor_actions';
import { listStockLocationAction } from '../../../redux/actions/stock_Location_actions';
import context from '../../../context/CreateNewButtonContext';
import { getAppConfigDataAction } from '../../../redux/actions/app_config_actions';
import NoRecordFound from '../../../components/Layout/NoRecordFound';
import { listChartOfAccountsAction } from '../../../redux/actions/chartOfAccounts';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext'
import { TableBar } from '@mui/icons-material';
import TableHeader from '@crema/core/AppTable/TableHeader';
import { Autocomplete, Button, Card, Grid, Modal, TextField } from '@mui/material';
import { listAdvancesheetAction, UpdateAdvancesheetAction,listAdvanceafterDetails,listAdvancechildDetails } from 'redux/actions/advancesheet_actions';
import { listPaymentTypeDetails } from 'redux/actions/payment_method_actions';
import apiCalls from 'utils/apiCalls';
import _ from 'lodash';
import AddIcon from '@mui/icons-material/Add';
import NewAdvanceSheet from './newAdvanceSheet';
// const poStatus = {
//   New: 'primary',
//   Open: 'secondary',
//   'Pending Payment': 'warning',
//   'Pending Goods': 'warning',
//   Completed: 'success'
// }

function Row(props) {
  const dispatch = useDispatch();
  const {openIndex, setOpenIndex} = props
  const { row, pendingPayment, setedit_data, list_payment_type, apiCalls} = props;
  const [open, setOpen] = React.useState(false);
  const [close, setClose] = React.useState(false);

  const handleOpen = () => setClose(true);
  const handleClose = () => setClose(false);
  
  const [regex] = useState({});
  const [formValues, setFormValues] = useState({
    amount: null,
    payment_type: null
  });
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(context);


  const {
    stockLocationReducer: { stocklocation },
    AdvancesheetReducer: {childget},
  } = useSelector((state) => state);
  
  useEffect(() => {
    
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(listAdvancechildDetails(setModalTypeHandler, setLoaderStatusHandler))
    );
  }, []);




  const [formErrors, setFormErrors] = useState({
    amount: null,
    payment_type: null
  });
  const [requiredFields] = useState([
    'amount',
    'payment_type',
  ]);


  const handleChange = async (e) => {
    let { name, value } = e.target;

    setStateHandler(name, value);
  };

  const handledataRow = () => {
    let data = row.advance_id;
    
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(listAdvancechildDetails({advance_id:data}))
    );
    setOpen(!open)
  }

  const handleSubmit = (event) => {

    event.preventDefault();
    let data = {
      // id : row.id,
      amount: formValues.amount,
      payment_type: formValues.payment_type
    }
    let datainsert = {
      name : row.name,
      office_name : row.office_name,
      advance_id : row.advance_id,
      amount :formValues.amount,
      payment_type : formValues.payment_type.payment_type,
      payment_date : new Date()
    }

    
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(UpdateAdvancesheetAction(row.id,data,setModalTypeHandler,setLoaderStatusHandler)),
      dispatch(listAdvanceafterDetails(datainsert)),
      dispatch(listAdvancesheetAction()),
    );
    setClose(false)
  }

  // const cancel = () => {
  //   setDialog(false);
  // };

  // const validClose = () => {
  //   setDialog(true);
  // };

  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const setStateHandler = async (name, value) => {
    let formObj = {};

    formObj = {
      ...formValues,
      [name]: value === '' ? null : value,
    };

    await setFormValues(formObj);
    validationHandler(name, value);
  };

  const validationHandler = (name, value) => {
    if (!Object.keys(formErrors).includes(name)) return;

    if (
      requiredFields.includes(name) &&
      (value === null ||
        value === 'null' ||
        value === '' ||
        value === false ||
        (Object.keys(value) && value.value === null))
    ) {
      setFormErrors({
        ...formErrors,
        [name]: capitalize(name) + ' is Required!',
      });
    } else if (regex[name]) {
      if (!regex[name].test(value)) {
        setFormErrors({
          ...formErrors,
          [name]: capitalize(name) + ' is Invalid!',
        });
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
      }
    } else {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };


  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    // width: 530,
    bgcolor: 'background.paper',
    boxShadow: 25,
    p: 5,
    // height: 300,
    // marginTop: '10px',
    // borderRadius: 5,
  };

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
      <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() =>{
              setOpenIndex(openIndex === props.index ? -1 : props.index);
              handledataRow();
              
            }
            
              
            }
          >
            {openIndex === props.index ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component='th' scope='row'>
          {row.name} 
        </TableCell>
        <TableCell>
          {row.office_name}
        </TableCell>
        <TableCell>
          {row.party_name || 'N/A'}
        </TableCell>
        <TableCell component='th' scope='row'>
          {row.advance_id}
        </TableCell>
        <TableCell style={{ textAlign: 'right' }}>
          {row.total}
        </TableCell>
        <TableCell component='th' scope='row' style={{ textAlign: 'right' }}>
          {row.loan_amount}
        </TableCell>
        <TableCell style={{ textAlign: 'right' }}>
          {row.reason}
        </TableCell>
        <TableCell component='th' scope='row'>
          {row.request_date}
        </TableCell>
        <TableCell style={{ textAlign: 'left' }}>
          <Typography sx={{ cursor: "pointer" }} onClick={handleOpen} color='primary'>Pay</Typography>
          <Modal
            open={close}
            onClose={handleClose}
          >
            <Card sx={style}>
              <Grid container spacing={3} display='flex' flexDirection='row'>
              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                  <Typography variant='h6'>
                    {"Payment"}
                  </Typography>
              </Grid>
              <Grid
                size={{
                  lg: 6,
                  md: 6,
                  sm: 12,
                  xs: 12
                }}>
                <TextField
                    id='outlined-name'
                    label='amount'
                    value={formValues.amount}
                    name='amount'
                    type={'number'}
                    fullWidth
                    onChange={handleChange}
                  />
                </Grid>
                <Grid
                  size={{
                    lg: 6,
                    md: 6,
                    sm: 12,
                    xs: 12
                  }}>
                  <Autocomplete
                    value={
                      formValues.payment_type !== null
                        ? formValues.payment_type
                        : []
                    }
                    onChange={(event, newValue) => {
                      setFormValues({
                        ...formValues,
                        payment_type: newValue || null
                      });
                    }}
                    disablePortal
                    name='payment_type'
                    id='combo-box-demo'
                    options={_.uniqBy(list_payment_type, 'payment_type')}
                    getOptionLabel={(option) => option.payment_type || ''}
                    fullWidth
                    error={formErrors.payment_type === null ? false : true}
                    helperText={formErrors.payment_type === null ? '' : formErrors.payment_type}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label='payment mode'
                        variant='outlined'
                      />
                    )}
                  />
                </Grid>
              </Grid> 
              
               <Grid spacing={7} container={true} direction='row' display='flex' justifyContent='center' paddingTop='25px'>
              <Grid>
                  <Button
                    onClose={handleClose}
                    style={{}}
                    name='Cancel'
                    variant='contained'
                    color='secondary'
                    size='medium'
                    text='button'
                    fullWidth={false}
                    type='cancel'
                  >
                    Cancel
                  </Button>
</Grid>

<Grid>
                  <Button
                    onClick={handleSubmit}
                    style={{}}
                    name='SUBMIT'
                    variant='contained'
                    color='primary'
                    size='medium'
                    text='button'
                    fullWidth={false}
                    type='submit'
                  >
                    Submit
                  </Button>
                </Grid>
                </Grid>
            </Card>
          </Modal>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={openIndex === props.index} timeout='auto' unmountOnExit>
            <Box sx={{ margin: 1 }}>

              <Table size='small' aria-label='purchases'>
                <TableHead>
              <Typography variant="h6" gutterBottom component="div">
                History
              </Typography>
                  <TableRow>
                    <TableCell >Name</TableCell>
                    <TableCell >Office Name</TableCell>
                    <TableCell>Party</TableCell>
                    <TableCell>Advance Id</TableCell>
                    <TableCell>Paid Amount</TableCell>
                    <TableCell>Payment Type</TableCell>
                    <TableCell>Payment Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {childget.map((historyRow) => (
                    <TableRow key={historyRow.id}>
                         <TableCell>{historyRow.name}</TableCell>
                      <TableCell>{historyRow.office_name}</TableCell>
                      <TableCell>{historyRow.party_name || 'N/A'}</TableCell>
                      <TableCell>{historyRow.advance_id}</TableCell>
                      <TableCell>{historyRow.amount}</TableCell>
                      <TableCell>{historyRow.payment_type}</TableCell>
                      <TableCell>{historyRow.payment_date}</TableCell>
                    </TableRow>
                  ))}
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
  const [openIndex, setOpenIndex] = React.useState(-1);
  const [open, setOpen] = useState(false)

  const {
    stockLocationReducer: { stocklocation },
    AdvancesheetReducer: { advancesheet ,afterget},
    paymentMethodReducer: { list_payment_type }
  } = useSelector((state) => state);
  const [PayData, setPayData] = React.useState({
    paymentOpen: false,
    itemsData: [],
    Tdata: [],
    getVendor: {},
    paid_amount: 0,
  });

  const [isEdit, setisEdit] = React.useState(false);
  const [edit_data, setedit_data] = React.useState({});
  const [status, setstatus] = React.useState('');
  const tempinitsform = useRef(null);

  const refreshVendor = useRef(null);

  const { paymentOpen, itemsData, Tdata, getVendor, paid_amount, receiving_id } =
    PayData;
  const [appConfigData, setAppConfigData] = useState({});
  const [Dopen, setDopen] = React.useState(false);
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(context);
  let date = new Date();
  let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);


  const handleEdit = (data) => {
    // setedit_data(data);
    // setstatus('edit');
    // setisEdit(true);
    // const getVendor = vendor.filter(
    //   (d) => data.supplier_id === d.supplier_id,
    // )[0];
    // setPayData({ ...PayData, getVendor });
    // setDopen(true);
  };

  const sample = (value) => {
    setisEdit(value);
  };

  const UpdateAdvancesheetAction = (
    id,
    data,
    setModalTypeHandler,
    setLoaderStatusHandler
  ) => {
    
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        UpdateAdvancesheetAction(
          id,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler
        )
      )
    );
  };



  useEffect(() => {
    
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(listAdvancesheetAction(setModalTypeHandler, setLoaderStatusHandler)),
      dispatch(listPaymentTypeDetails(setModalTypeHandler, setLoaderStatusHandler))
    );
  }, []);

  const handleOpen = () => {
  setOpen(true)
  }

  const handleClose = () => {
  setOpen(false)
  }

  return (
    <>
      <CreateNewButtonContext.Consumer>
        {({ loaderStatus }) => (
          open === false ? (
            <>
              <Grid container spacing={2} display='flex' flexDirection='row' alignItems='center'>
                <Grid
                  size={{
                    lg: 11,
                    md: 11,
                    sm: 11,
                    xs: 11
                  }}>
                  <Typography variant='h6'>Advance sheet</Typography>
                </Grid>
                <Grid
                  display='flex'
                  justifyContent='flex-end'
                  size={{
                    lg: 1,
                    md: 1,
                    sm: 1,
                    xs: 1
                  }}>
                  <IconButton onClick={handleOpen}>
                    <AddIcon fontSize='small' />
                  </IconButton>
                </Grid>
                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <TableContainer component={Paper}>
                    <Table aria-label='collapsible table'>
                      <TableHead>
                        <TableRow>
                          <TableCell />
                          <TableCell >Name</TableCell>
                          <TableCell >Office Name</TableCell>
                          <TableCell>Party</TableCell>
                          <TableCell>Advance Id</TableCell>
                          <TableCell>Due Amount</TableCell>
                          <TableCell>Loan Amount</TableCell>
                          <TableCell>Reason</TableCell>
                          <TableCell>Request Date</TableCell>
                          <TableCell style={{ textAlign: 'left' }}>Pay</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {advancesheet.map((row, index) => (
                          <Row
                            setedit_data={handleEdit}
                            apiCalls={apiCalls}
                            row={row}
                            key={row.id}
                            list_payment_type={list_payment_type}
                            index={index}
                            setOpenIndex={setOpenIndex}
                            openIndex={openIndex}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {!advancesheet.length && loaderStatus === false && (
                    <NoRecordFound />
                  )}
                </Grid>
              </Grid>
            </>
          ) : (
            <NewAdvanceSheet handleClose={handleClose} />
          )
        )}
      </CreateNewButtonContext.Consumer>
    </>
  );
}
