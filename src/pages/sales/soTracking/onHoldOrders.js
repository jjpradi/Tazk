import React, {useState, useEffect} from 'react';
// import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import {Table, Button, Grid, Divider, Tooltip, Card, TablePagination} from '@mui/material';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {useDispatch, useSelector} from 'react-redux';
// import {  listSalesOutstandingAction } from '../../redux/actions/sales_actions';
// import { Alert } from '@mui/material';
// import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
// import {listProductAction} from '../../redux/actions/product_actions';
// import PaymentDialog from '../paymentSalesPurchase/Dialog';
// import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import NewSales from '../../../components/NewSales';
import {getPriceListAction,} from 'redux/actions/priceList_actions';
import { listProductAction } from '../../../redux/actions/product_actions';
import {listCustomerAction} from '../../../redux/actions/customer_actions';
import NoRecordFound from 'components/Layout/NoRecordFound';
import moment from 'moment';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import NewSalesForm from '../../../components/Sales/NewSalesForm';
import { maxBodyHeight } from '../../../utils/pageSize';
function Row(props) {
  const {row, handleEdit,setinvoicelayout,invoicelayout} = props;
  const [open, setOpen] = React.useState(false);
   console.log(invoicelayout,"invoicee")
  return (
    <React.Fragment>
      <TableRow sx={{
        '& > *': { borderBottom: 'unset' },
        '&:hover': {
          backgroundColor: '#f5f5f5',
          cursor: 'pointer'
        }
      }}>
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
          {row.company_name}
        </TableCell>
        {/* <TableCell component='th' scope='row'>
          {row.salesman_name}
        </TableCell> */}
        <TableCell component='th' scope='row' align='right'>
          {moment(row.sale_time.slice(0, 10)).format('DD/MM/yyyy')}
        </TableCell>
        {/* <TableCell align="right">{row.payment_type}</TableCell> */}
        {/* <TableCell align="right">{row.receiving_time}</TableCell> */}
        <TableCell align='right'>{row.location_name}</TableCell>
        <TableCell align='right'>
          <Box sx={{ textAlign: 'right', width: '100%' }}>{row.total.toFixed(2)}</Box></TableCell>
        {props.invoiceCreateBtn && <TableCell align='right'>
        <Tooltip title="Create Invoice">
        <IconButton
          color="primary"
          onClick={() => {
            handleEdit(row.order_id);
            setinvoicelayout(true);
          }}
        >
          <DescriptionOutlinedIcon />
        </IconButton>
      </Tooltip>
        </TableCell>}
      </TableRow>
      {open && (
      <TableRow>
        <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={7}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{margin: 1}}>
              <Typography variant='h6' gutterBottom component='div' pl='20px'>
                {row.company_name}
              </Typography>
              <Table size='small' aria-label='purchases'>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Qty</TableCell>
                    <TableCell>Price</TableCell>
                    {/* <TableCell align='right'>Discount type</TableCell> */}
                    <TableCell align='right'>
                      <Box sx={{ textAlign: 'right', width: '100%' }}>Total</Box></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.sales_items?.map((historyRow) => (
                    <TableRow key={historyRow.item_id}>
                      <TableCell component='th' scope='row'>
                        {historyRow.name}
                      </TableCell>
                      <TableCell>{historyRow.quantity}</TableCell>
                      <TableCell>
                        <Box sx={{ textAlign: 'right', width: '100%', maxWidth: '50px' }}>
                          {historyRow.item_unit_price}
                        </Box>
                        </TableCell>
                      {/* <TableCell align='right'>
                        {historyRow.discount_type}
                      </TableCell> */}
                      <TableCell align='right'>
                        <Box sx={{ textAlign: 'right', width: '100%' }}>
                        {calculateTotalPrice(historyRow)}
                        </Box>
                      </TableCell>
                      {/* <TableCell>
                        <div style={{ display: 'flex', cursor: 'pointer' }} >
                            {historyRow.total !==historyRow.received_amount&&historyRow.total>historyRow.received_amount?
                          <Button  
                           startIcon={<AssignmentLateIcon color='warning'/>}>
                            Pending
                          </Button>:
                          <Button startIcon={<AssignmentTurnedInIcon color='success'/>}>
                            Paid
                          </Button>
                          }
                        </div>
                      </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
      )}
    </React.Fragment>
  );
}

export default function OnHoldOrders(props) {
  const dispatch = useDispatch()
  const {
    soTrackingReducer: {onHoldOrders},
    PriceListReducer: {price_list},
    productReducer: {product},
    customerReducer: {customer},
    stockLocationReducer : {stocklocation}
  } = useSelector((state) => state); //,blilledOrders ,productReducer:{product}, salesReducer:{sales}
  const [dialogOpen] = useState(false); //,setDialogOpen
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  useEffect(() => {
      // dispatch(getPriceListAction())
      // dispatch(listProductAction());
    // dispatch(listCustomerAction());
    }, []);

  //   useEffect(() => {
  //     dispatch(listSalesOutstandingAction())
  //     dispatch(listSalesAction(()=>{},()=>{}))
  //     dispatch(listProductAction(()=>{},()=>{}))
  //     dispatch(listCustomerAction(()=>{},()=>{}))
  // }, [])


  const isUserNotFound = onHoldOrders?.data?.length === 0;
  return (
    <React.Fragment>
      {props.open === false && (
        <>
    
    {!isUserNotFound && (
      <Box minHeight={maxBodyHeight}>
      <TableContainer style={{overflowY: 'auto' ,backgroundColor:'white', maxBodyHeight : maxBodyHeight,minBodyHeight : maxBodyHeight,}}>
            <Table size="small" stickyHeader aria-label="collapsible table">
              <TableHead >
                <TableRow
                  sx={{
                    '& > *': {
                      paddingTop: '4px',
                      paddingBottom: '4px',
                    },
                  }}
                >
        <TableCell style={{ backgroundColor: 'white'}} />
        <TableCell style={{ backgroundColor: 'white'}} >Customer</TableCell>
        {/* <TableCell style={{ backgroundColor: 'white'}} >Salesman</TableCell> */}
        <TableCell align="right" style={{ backgroundColor: 'white'}} >Date</TableCell>
        <TableCell align="right" style={{ backgroundColor: 'white'}} >Location</TableCell>
        <TableCell align="right" style={{ backgroundColor: 'white'}} >
         <Box sx={{ textAlign: 'right', width: '100%' }}>
          Total
          </Box>
          </TableCell>
        {props.invoiceCreateBtn && <TableCell align="right" style={{ backgroundColor: 'white'}} >Action</TableCell>}
      </TableRow>
    </TableHead>
              <TableBody>
                {onHoldOrders?.data?.length > 0 ? (
                  onHoldOrders?.data?.map((row) => (
                    <Row
                      row={row}
                      key={row.order_id}
                      handleEdit={props.handleEdit}
                      invoicelayout={props.invoicelayout}
                      setinvoicelayout={props.setinvoicelayout}
                      invoiceCreateBtn={props.invoiceCreateBtn}
                    />
                  ))
                    ) : (
                     <TableRow sx={{ '& td, & th': { borderBottom: 'none' } }}>
                        <TableCell colSpan={6} sx={{ height: 'calc(100vh - 80px', p: 0 }}>
                          <Box
                            width="100%"
                            height="100%"
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            
                          >
                            <Typography fontSize="12px" color="text.secondary">
                              No records Found
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          </Box>
          )}
            {onHoldOrders?.data?.length > 0 && (
             <Box
             display="flex"
             justifyContent="flex-end"
             alignItems="center"
             mt={2}
           >
              <TablePagination
                rowsPerPageOptions={[20, 50, 100]}
                component='div'
                count={onHoldOrders?.numPerPage}
                rowsPerPage={props.rowsPerPage}
                page={props.page}
                onPageChange={props.handleChangePage}
                onRowsPerPageChange={props.handleChangeRowsPerPage}
              />
            </Box>
            )}



          {isUserNotFound && (
            // <Box display='flex' justifyContent='center' alignItems='center' p='5px 0px'>
            //   <Typography  fontSize='11px' alignItems='center'>{"No records Today"}</Typography>
            // </Box>
            (<Box sx={{ height: '400px', backgroundColor: 'white', overflow: 'hidden' }}>
              <Card sx={{ height: '100%' }}>
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <Typography fontSize="11px">{"No records Found"}</Typography>
                </Box>
              </Card>
            </Box>)
          )}
        </>
      )}
      {props.open === true && (
        <NewSalesForm
          appConfigData={props.appConfigData}
          edit_id_data={props.edit_id_data}
          status={'edit'}
          type='customer'
          handleClose={props.handleClose}
          handleSubmit={props.handleSubmit}
          handleDeactive={props.handleDeactive}
          setModalStatusHandler={props.setModalStatusHandler}
          setModalTypeHandler={props.setModalTypeHandler}
          setcreatNewDataHandler={props.setcreatNewDataHandler}
          responseDialog={props.responseDialog}
          creatNewData={props.creatNewData}
          createMail={props.createMail}
          {...props}
          price_list={price_list}
          product={product}
          customer={customer}
          setAppConfigData={props.setAppConfigData}
          stocklocation={stocklocation}
          page={'soTracking'}
          handle_newCreate = {() => {}}
          handle_newSalesAfterCreating_Data={() => {}}
          invoicelayout={props.invoicelayout}
          setinvoicelayout={props.setinvoicelayout}
        />
      )}
    </React.Fragment>
  );
}

const calculateTotalPrice = (d) => {
  // const taxRate = d.taxes.find(i => i.tax_group === 'IGST').tax_rate ?? 1;
  const igstTax = d.taxes?.find(i => i.tax_group === 'IGST');
  const taxRate = igstTax ? igstTax.tax_rate : 1;
  const total = d.quantity * d.item_unit_price
  const taxAdded = (total * (taxRate / 100)) + total;
  return taxAdded.toFixed(2);
}
