import React, {useEffect, useRef, useContext, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {CancelPreOrderAction, ConvertPreOrder, getSearchPreOrderAction, listPreOrderAction, setSearchPreOrderAction} from '../../../redux/actions/preOrder_actions';
import MaterialTable from 'utils/SafeMaterialTable';
import ContentPasteGoRoundedIcon from '@mui/icons-material/ContentPasteGoRounded';
import CancelPresentationRoundedIcon from '@mui/icons-material/CancelPresentationRounded';
import context from '../../../context/CreateNewButtonContext';
import {Button, Card, Grid, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography} from '@mui/material';
import apiCalls from 'utils/apiCalls';
import { maxBodyHeight } from 'utils/pageSize';
import moment from 'moment';
import CloseIcon from '@mui/icons-material/Close';
import CommonSearch from 'utils/commonSearch';

function PreOrderList(props) {
  const dispatch = useDispatch();
  const EffectRef1 = useRef(null);
  const {setModalTypeHandler, setLoaderStatusHandler} = useContext(context);
  const {
    preOrderReducer: {pre_orders},
  } = useSelector((state) => state);

  const [searchString, setSearchString] = useState("")

  const Effect1 = () => {
    const payload = {
      searchString: searchString
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(listPreOrderAction(payload, setModalTypeHandler, setLoaderStatusHandler))
    );
  };
  EffectRef1.current = Effect1;
  useEffect(() => {
    EffectRef1.current();
  }, []);
  
  const SetPreOrderData = (data) => {
    props.setPreOrderConvertData(data)
  };

  const requestSearch = (event) => {
    const val = event.target.value
    setSearchString(val)

    dispatch(setSearchPreOrderAction({data: []}))
    
    const payload = {
      searchString: val
    }
    dispatch(getSearchPreOrderAction(payload, setModalTypeHandler, setLoaderStatusHandler))
  }

  const cancelSearch = () => {
    setSearchString("")

    dispatch(setSearchPreOrderAction({data: []}))
    
    const payload = {
      searchString: ""
    }
    dispatch(getSearchPreOrderAction(payload, setModalTypeHandler, setLoaderStatusHandler))
  }

  const columns = [
    {title: 'Customer Name', field: 'company_name'},
    {title: 'Phone Number', field: 'phone_number'},
    {title: 'Order Time', field: 'order_time',render : (e)=>{
      return moment(e.order_time).format('DD/MM/YYYY hh:mm A')
    }},
    {title: 'Status', field: 'order_status'},
    {title: 'Total', field: 'total'},
    {title: 'Received Amount', field: 'received_amount'},
    {title: 'Actions', field: 'action', render: (rowData) => (
      <>
        <IconButton onClick={() => SetPreOrderData({...rowData, order_status: 'Converted'})}>
          <Tooltip title='Convert'>
            <ContentPasteGoRoundedIcon color='primary' />
          </Tooltip>
        </IconButton>

        <IconButton onClick={() => SetPreOrderData({...rowData, order_status: 'Canceled'})}>
          <Tooltip title='Cancel'>
            <CancelPresentationRoundedIcon color='secondary' />
          </Tooltip>
        </IconButton>
      </>
    )},
    
  ]
  return (
    <React.Fragment>
      {/* <MaterialTable
        actions={[
          {
            icon: () => {
              console.log('Convert Icon preOrders')
              return <ContentPasteGoRoundedIcon color='primary' />
            },
            tooltip: 'Convert',
            position: 'row',
            onClick: (event, rowData) => {
              console.log("preOrders Row Data:", rowData);
              SetPreOrderData({...rowData, order_status: 'Converted'});
            },
          },
          {
            icon: () => <CancelPresentationRoundedIcon color='secondary' />,
            tooltip: 'Cancel',
            onClick: (event, rowData) => {
              console.log("preOrders Row Data:", rowData);
              SetPreOrderData({...rowData, order_status: 'Cancelled'})
            },
          },
        ]}
        options={{
          headerStyle: {
            fontSize: "12px"
          },
          exportButton: true,
          filtering: false,
          actionsColumnIndex: -1,
          maxBodyHeight: maxBodyHeight,
          pageSize: 20,
          pageSizeOptions: [20, 50, 100],
        }}
        columns={[
          {title: 'Company Name', field: 'company_name'},
          {title: 'Order Time', field: 'order_time',render : (e)=>{
            return moment(e.order_time).format('DD/MM/YYYY hh:mm A')
          }},
          {title: 'Status', field: 'order_status'},
          {title: 'Total', field: 'total'},
          {title: 'Received Amount', field: 'received_amount'},
          {field: 'phone_number', hidden: true, searchable: true},
          
        ]}
        data={
          pre_orders
            ? pre_orders.map((r) => {
                const {tableData, ...record} = r;
                return record;
              })
            : []
        }
        title={<Typography variant='h6'>PreOrderList</Typography>}
      /> */}
      <Card sx={{ p: 3, width: '100%' }}>
        <Grid container spacing={2}>
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Grid container display='flex' justifyContent='space-between'>
              <Grid display='flex' alignItems='center'>
                <Typography variant='h6'>Pre Order List</Typography>
              </Grid>

              <Grid>
                <Grid container spacing={2}>
                  <Grid>
                    <CommonSearch
                      searchVal={searchString}
                      requestSearch={requestSearch}
                      cancelSearch={cancelSearch}
                    />
                  </Grid>

                  <Grid>
                    <Tooltip title='Close'>
                      <IconButton onClick={() => props.handleClose()}>
                        <CloseIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Grid
            sx={{ minHeight: 'calc(100vh - 117px)', maxHeight: 'calc(100vh - 117px)' }}
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Table>
              <TableHead>
                {
                  columns.map((col, index) => (
                    <TableCell key = {index}>{col.title}</TableCell>
                  ))
                }
              </TableHead>

              {
                pre_orders.length > 0 ? 
                  <TableBody sx={{overflow: 'auto'}}>
                    {
                      pre_orders.map((data, index) => (
                        <TableRow key = {index}>
                          {
                            columns.map((col, ind) => (
                              col.field !== 'action' ?
                                <TableCell key = {ind}>{col.render ? col.render(data) : data[col.field]}</TableCell>
                              : <TableCell key = {ind}>{col.render(data)}</TableCell>
                            ))
                          }
                        </TableRow>
                      ))
                    }
                  </TableBody>
                  : <TableBody>
                      <TableRow>
                        <TableCell colSpan={columns.length}>
                          <Typography align="center" sx = {{ fontSize: '11px' }}>No Pre-orders Available</Typography>
                        </TableCell>
                      </TableRow>
                  </TableBody>
              }
            </Table>
          </Grid>

          {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
            <Grid container display='flex' justifyContent='flex-end'>
              <Grid
                item
                style={{
                  justifyContent: 'flex-end',
                  display: 'flex',
                  paddingRight: 10,
                  paddingTop: 10,
                }}
              >
                <Button
                  onClick={() => props.handleClose()}
                  variant='contained'
                  color='primary'
                >
                  Back
                </Button>
              </Grid>
            </Grid>
          </Grid> */}
        </Grid>
      </Card>
    </React.Fragment>
  );
}
export default PreOrderList;

