import React, { useEffect, useState, useContext, useRef } from 'react';
import Box from '@mui/material/Box';
// import MaterialTable from 'utils/SafeMaterialTable';
// import Button from "@mui/material/Button";
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
import { getdestinationAction, getsourcelocationAction, listStockLocationAction } from '../../../redux/actions/stock_Location_actions';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import context from '../../../context/CreateNewButtonContext';
import { listProductAction } from '../../../redux/actions/product_actions';
import {
  listInventoryAction,
  createInventoryAction,
  liststocktransferAction,
  deleteStocktransferAction,
  filterStocktransferAction,
  set_searchstocktransferAction,
  searchstocktransferAction,
  stockTransferPaginateAction,
} from '../../../redux/actions/inventory_actions';
import AddIcon from '@mui/icons-material/Add';
import { Card, Grid, InputAdornment, TablePagination } from '@mui/material';
import NewStockTransfer from './newstocktransfer';
import ActionButton from './ActionButton';
import ItemPopup from './itemPopup';
import Tooltip from '@mui/material/Tooltip';
import Popper from '@mui/material/Popper';
import PopupState, { bindToggle, bindPopper } from 'material-ui-popup-state';
import Fade from '@mui/material/Fade';
import NoRecordFound from '../../../components/Layout/NoRecordFound';
import { TextField, Autocomplete } from '@mui/material';
import _ from 'lodash';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import notificationType from '../../../firebase/notify_type';
import { sendNtfy } from '../../../firebase/firebase.service';
import { getLoginRoleAction } from '../../../redux/actions/userRole_actions';
import Cookies from 'universal-cookie';
import { allListStockLocation } from '../../../redux/actions/stock_Location_actions';
import { Delete, DeleteOutline } from '@mui/icons-material';
import { common } from '@mui/material/colors';
import AlertDialog from '../../common/Dialog';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterStockTransfer from './FilterStockTransfer';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { CreateNotificationAction } from 'redux/actions/notification_actions';
import { commonDateFormat, getDateTimeFormat } from 'utils/getTimeFormat';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { object } from 'prop-types';
import { getsessionStorage } from 'pages/common/login/cookies';
import CommonSearch from 'utils/commonSearch';
import { maxBodyHeight, pageSize } from 'utils/pageSize';
import CommonToolTip from 'components/ToolTip';
import { titleURL } from 'http-common';
import { roleType } from 'utils/roleType';
import moment from 'moment';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

// const poStatus = {
//   New: 'primary',
//   Open: 'secondary',
//   'Pending Payment': 'warning',
//   'Pending Goods': 'warning',
//   Completed: 'success'
// }

function Row(props) {
  const { row, handleInvoice } = props;
  const [open, setOpen] = React.useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const childItems = Array.isArray(row.childresult) ? row.childresult : [];
  const totalQuantity = childItems.reduce(
    (acc, item) => acc + Number(item?.quantity || 0),
    0,
  );
  const totalReceivedQuantity = childItems.reduce(
    (acc, item) => acc + Number(item?.received_quantity || 0),
    0,
  );
  const displayStatus =
    row.status === 'received' || (totalQuantity > 0 && totalReceivedQuantity >= totalQuantity)
      ? 'received'
      : totalReceivedQuantity > 0
      ? 'partially received'
      : row.status;
  const disableDelete = displayStatus === 'received' || totalReceivedQuantity > 0;

  const Deletedhandle = () => {
     props.handleDelete(row.id, row)
     setDeleteDialogOpen(false)
  }


  return (

    <React.Fragment>
      <AlertDialog
        delete={isDeleteDialogOpen}
        handleDelete={Deletedhandle}
        handleClose={() => setDeleteDialogOpen(false)}
      ></AlertDialog>
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
        {/* <TableCell>{'ttt'}</TableCell> */}
        <TableCell component='th' scope='row'>
          {row.chalan_number}
        </TableCell>
        <TableCell>{row.initiated_date.slice(0,11)}</TableCell>
        <TableCell>{row.received_date.slice(0,11)}</TableCell>
        <TableCell>{row.source_location}</TableCell>
        <TableCell>{row.destination_location}</TableCell>
        <TableCell>{displayStatus}</TableCell>
        <TableCell>
          {displayStatus === 'received' ? (
            <AssignmentTurnedInIcon
              onClick={() => {
                {
                  handleInvoice(row);
                }
              }}
              sx={{ cursor: 'pointer', textDecoration: 'underline' }}
              color='success'
            ></AssignmentTurnedInIcon>
          ) : (
            <AssignmentTurnedInIcon
              onClick={() => {
                {
                  handleInvoice(row);
                }
              }}
              sx={{ cursor: 'pointer', textDecoration: 'underline' }}
              color='warning'
            ></AssignmentTurnedInIcon>
          )}
          {/* onClick={()=> handleinvoice(row)} sx={{ cursor: 'pointer', textDecoration: 'underline' }} /> */}

          {disableDelete ? (
            <CommonToolTip
              title={
                displayStatus === 'received'
                  ? 'Received stock transfer cannot be deleted.'
                  : 'Some items have been received, cannot delete.'
              }
            >
              <Delete
                onClick={(row) => { }}
                sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                color='disabled'
              ></Delete>

           </CommonToolTip>
          ) : (
            <CommonToolTip
              title={'Delete'} 
            >
              <Delete
                onClick={() => {
                  setDeleteDialogOpen(true);
                }}
                sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                color='action'
              ></Delete>
            </CommonToolTip>
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Table size='small' aria-label='purchases'>
                <TableHead>
                  <TableRow>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Received Quantity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Serial Number</TableCell>
                    {/* <TableCell >Total</TableCell>
                    <TableCell>Payment</TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {childItems?.map((historyRow) => {
                    const lots = Array.isArray(historyRow.oldlots) ? historyRow.oldlots : [];
                    const receivedLotsCount = lots.filter(
                      (lot) => String(lot?.status || '').toUpperCase() === 'A',
                    ).length;
                    const itemQuantity = Number(historyRow?.quantity || 0);
                    const itemReceivedQuantity = Number(
                      historyRow?.received_quantity ??
                        (historyRow?.is_serialized !== 0 ? receivedLotsCount : 0),
                    );
                    const itemStatus =
                      itemQuantity > 0 && itemReceivedQuantity >= itemQuantity
                        ? 'received'
                        : itemReceivedQuantity > 0
                        ? 'partially received'
                        : 'initiated';

                    return (
                    <TableRow key={historyRow.item_id}>
                      <TableCell>{historyRow.name}</TableCell>
                      <TableCell>{historyRow.quantity}</TableCell>
                      <TableCell>{itemReceivedQuantity}</TableCell>
                      <TableCell>{itemStatus}</TableCell>

                      <TableCell>
                        {/* <Tooltip title={historyRow.oldlots.map((d, i) => (d.lot_number)).join()}>
                          <IconButton>
                            < AssignmentTurnedInIcon />
                          </IconButton>
                        </Tooltip> */}
                        <PopupState
                          variant='popper'
                          popupId='demo-popup-popper'
                        >
                          {(popupState) => (
                            <div>
                              {(historyRow.is_serialized !== 0) && (
                                <>
                                  <AssignmentTurnedInIcon
                                  sx={{
                                    cursor: 'pointer'
                                  }}
                                    {...bindToggle(popupState)}
                                    color='primary'
                                  />
                                  {/* < AssignmentTurnedInIcon /> */}
                                  {/* </Button> */}
                                  <Popper
                                    {...bindPopper(popupState)}
                                    transition
                                  >
                                    {({ TransitionProps }) => (
                                      <Fade {...TransitionProps} timeout={350}>
                                        <Paper>
                                          <Typography sx={{ p: 2 }}>
                                            <Box>
                                              <Table>
                                                <TableHead>
                                                  <TableRow>
                                                    <TableCell>
                                                      Lot Id
                                                    </TableCell>
                                                    <TableCell>
                                                      Lot Number
                                                    </TableCell>
                                                    <TableCell>
                                                      Status
                                                    </TableCell>
                                                  </TableRow>
                                                </TableHead>

                                                <TableBody>
                                                  {lots.map(
                                                    (d, lotIndex) => (
                                                      <TableRow key={d.id || `${d.lot_id}-${d.lot_number}-${lotIndex}`}>
                                                        <TableCell>
                                                          {d.lot_id}{' '}
                                                        </TableCell>
                                                        <TableCell>
                                                          {d.lot_number}{' '}
                                                        </TableCell>{' '}
                                                        <TableCell>
                                                          {String(d.status || '').toUpperCase() === 'A'
                                                            ? 'Received'
                                                            : 'Pending'}
                                                        </TableCell>
                                                      </TableRow>
                                                    ),
                                                  )}
                                                  {/* <TableCell>{historyRow.oldlots.slice(0,historyRow.lot_id).map((d, i) => (d.lot_id)).join()}</TableCell>
                                              <TableCell>{historyRow.oldlots.slice(0,historyRow.lot_id).map((d, i) => (d.lot_number)).join()}</TableCell> */}
                                                </TableBody>
                                              </Table>
                                            </Box>
                                            {/* <>
                                        
                                          <div style={{ minWidth: '60vw' }}>
                                            <MaterialTable

                                              options={{
                                                showTitle: false,
                                                toolbar: false
                                              }}

                                              columns={[
                                                // { title: 'Sales Order', field: 'sales_order' },
                                                { title: 'Lot Number',
                                                 
                                               },
                                                
                                              ]}
                                            //  data={historyRow.oldlots.map((d, i) => (d.lot_number)).join()}
                                            />
                                          </div>
                                        </> */}
                                          </Typography>
                                        </Paper>
                                      </Fade>
                                    )}
                                  </Popper>
                                </>
                              )}
                            </div>
                          )}
                        </PopupState>
                      </TableCell>
                      {/* <TableCell > < AssignmentTurnedInIcon color={stocktransfer.map((d) => d.status === 'received' ? 'success' : 'error')} />,
                      
                      </TableCell> */}
                      {/* <TableCell >{historyRow.location_name}</TableCell>
                      <TableCell >
                        {historyRow.payment_type}
                      </TableCell>
                      <TableCell >
                        {+historyRow.total - +historyRow.paid_amount}
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', cursor: 'pointer' }} >
                          {+historyRow.paid_amount >= +historyRow.total ?
                            <AssignmentTurnedInIcon color='success' /> :
                            <AssignmentLateIcon onClick={() => pendingPayment(historyRow)} color='warning' />}
                        </div>
                      </TableCell> */}
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default function StockTransfer() {
  const dispatch = useDispatch();
  let storage = getsessionStorage()

  // const {
  //   inventoryReducer: {stocktransfer},
  //   inventoryReducer: {inventory_id_data},
  //   inventoryReducer: {inventory},
  //   productReducer: {product},
  //   stockLocationReducer: {stocklocation},
  // } = useSelector((state) => state);
  const {
    inventoryReducer: { stocktransfer, searchStockTransfer, inventory_id_data, inventory },
    productReducer: { product },
    stockLocationReducer: { stocklocation, allliststocklocation, get_source_locationdata, get_destination_location },
    roleReducer : {user_rights},
    rbacReducer: { menuAccess },
  } = useSelector((state) => state);
  const [PayData, setPayData] = React.useState({
    stocktransfer: [],
    inventory_id_data: [],
    paymentOpen: false,
    itemsData: [],
    Tdata: [],
    getVendor: {},
    paid_amount: 0,
  });


  const [isEdit, setisEdit] = React.useState(false);
  const [edit_id_data, setedit_id_data] = React.useState({});
  const [edit_data, setedit_data] = React.useState({});
  const [status, setstatus] = React.useState('');
  // const [selectionModel, setSelectionModel] = React.useState([])
  const [getPay, setgetPay] = React.useState([]);
  const [open, setopen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [date, setDate] = useState({
    from: null,
    to: null,
  });

  // const [dialog, setDialog] = useState({ open: false, msg: '', severity: '' })
  const [row_id, setRowid] = useState({
    id: '',
    data: '',
    open: false,
    status: '',
  });
  const [disabledel, setdisabledel] = useState(false);
  const [searchVal,setsearchVal] = useState('');
  const [invoice, setinvoice] = useState({ open: false });
  const [transfer, settransfer] = useState(false);
  const tempinitsform = useRef(null);
  const [searchText, setSearchText] = useState('');
  const [searchData, setSearchData] = useState([]);
  const [fildata, handleFilter] = useState(false);
  const [filterValue, setFilterValue] = useState({
    initiatedFromDate: null,
    initiatedToDate: null,

    receivedFromDate: null,
    receivedToDate: null,

    destination_location: '',
    source_location: '',

    product_name: '',
  });

  const [page , setPage] = useState(0);
  const [size , setSize] = useState(20);
  const [isApiFinished, setIsApiFinished] = useState(false);
  
  const handleChangePage = (event, value) => {
    setPage(value);
  };
  const {
    setLoaderStatusHandler,
    setModalStatusHandler,
    setselectData,
    setModalTypeHandler,
    commoncookie,
    headerLocationId,
  } = useContext(context);

  const handleChangeRowsPerPage = (event, value) => {
    setSize(parseInt(event.target.value, 10))
  }

  useEffect(() => {
    dispatch(getUserRightsByRoleIdAction())
    if(stocktransfer.length <= 0){

      dispatch(liststocktransferAction(commoncookie,
        headerLocationId
      ))
    }
  },[])

  const selectedRole = storage.role_name
    useEffect(() => {
      if (!selectedRole) return;
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler, dispatch(getMenuAccessAction(selectedRole)));
    }, [selectedRole, dispatch]);


  // useEffect(() => {
  //     dispatch (set_searchstocktransferAction({data:[], numRows:0}))
  //     // setSearchData(stocktransfer);
  // }, [stocktransfer]);

  // useEffect(() => {
  //   setAllData(stocktransfer);
  //   setlotfilter(stocktransfer);
  //   // setHeaderLocationId(stocktransfer);
  //   }, [stocktransfer])
  // // const { source_location } = PayData
  // useEffect(()=>{
  // }, [stocktransfer])

  
  // const handleSearch = (value) => {
  //   setSearchText(value);
  //   filterData(value);
  // };



  //     const filterData = (value) => {
  //       const lowerCaseValue = value.toLowerCase().trim();
  //       if (!lowerCaseValue) {
  //         setSearchData(stocktransfer);
  //       } else {
  //         const filteredData = stocktransfer.filter((item) => {
  //           return Object.keys(item).some((key) => {
  //             return item[key].toString().toLowerCase().includes(lowerCaseValue) 
  //           }) ||
  //           item?.childresult?.some((v)=> v?.name.toString().toLowerCase().includes(lowerCaseValue))
  //         });


  //         // -------------
  //         // This filter only lot number
  //         const filterBasedOnLot = stocktransfer.filter((item) => {
  //           return Object.keys(item).some((key) => {
  //             let flag = false;
  //             if( typeof item[key] === 'object'){
  //               let level2 = item[key];
  //               let l2A = level2.filter(l2 => {
  //                 return Object.keys(l2).some(k2 => {
  //                     if(typeof l2[k2] === 'object'){
  //                       let level3 = l2[k2];
  //                       let l3A = level3.filter(l3 => {
  //                         flag = l3.lot_number.toString().toLowerCase().includes(lowerCaseValue);
  //                         return flag;
  //                       })
  //                       if(l3A.length > 0){
  //                         return true
  //                       }
  //                     }
  //                 })
  //               })
  //               if(l2A.length > 0){
  //                 return true;
  //               }
  //             }
  //           });
  //         });

  //         let temp = [...filteredData, ...filterBasedOnLot]
  //         const unique = [...new Map(temp.map(item => [item['id'], item])).values()];

  //         // -------------

  //         setSearchData(unique);
  //       }
  //     };
    const cancelSearch = (e) => {
      setsearchVal('');
      // setSearchText('');
      // setSearchData(stocktransfer);
      dispatch(set_searchstocktransferAction({ data: [], numRows: 0 }))
      const data = filterValue
      const detail = {
        searchString: '',
        rowsPerPage: size,
        pageNum: page,
        employeeId: commoncookie,
        locationId: headerLocationId,
        tempData : {
          initiatedFromDate:
            data.initiatedFromDate?._d === undefined
              ? ''
              : moment(data.initiatedFromDate?._d).format("DD/MM/YYYY"),
          initiatedToDate:
            data.initiatedToDate?._d === undefined ? '' : moment(data.initiatedToDate?._d).format("DD/MM/YYYY"),
          receivedFromDate:
            data.receivedFromDate?._d === undefined
              ? ''
              : moment(data.receivedFromDate?._d).format("DD/MM/YYYY"),
          receivedToDate:
            data.receivedToDate?._d === undefined ? '' : moment(data.receivedToDate?._d,).format("DD/MM/YYYY"),
          destination_locationId:
            data.destination_location[0]?.destination_location_id === undefined
              ? ''
              : data.destination_location[0]?.destination_location_id,
          source_locationId:
            data.source_location[0]?.source_location_id === undefined
              ? ''
              : data.source_location[0]?.source_location_id,
          product_id:
            data.product_name[0]?.item_id === undefined
              ? ''
              : data.product_name[0]?.item_id,
        }
      }
        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(
            stockTransferPaginateAction(
              detail,
              commoncookie,
              headerLocationId
            ),
          ),
        ).finally(() => setIsApiFinished(true));
    };


    const handlePopup = async (id) => {
      setRowid({ open: true, id: '1', data: id, status: 'edit' });
      setdisabledel(true);
    };

    const handleInvoice = async (data) => {
      setinvoice({ open: true });
      const sales_items = data.childresult.map((d, i) => {
        const productdata = product.find((t) => t.item_id === d.item_id) || {};
        d.taxes = productdata.taxes || [];
        d.item_unit_price = productdata.unit_price;
        return d;
      });
      const newdata = { ...data };
      newdata.childresult = sales_items;
      setedit_id_data(newdata);
      settransfer(true);
      // this.setState({invoice:{open: true} })
      //  await this.props.updatestocktransferAction(id)
    };

    const handleEdit = (data) => {
      setedit_data(data);
      setstatus('edit');
      setisEdit(true);
    };

    const sample = (value) => {
      setisEdit(value);
      setopen({ open: value });
    };

    const handleClose = () => {
      if (setModalStatusHandler) {
        setModalStatusHandler(false);
        setselectData(false);
      }
      setTimeout(() => {
        setopen({ open: false, dialog: false, delete: false });
      }, 0);
    };
    const handleSubmit = async (data) => {
      // if(data){
      await createInventory(
        data,
        commoncookie,
        headerLocationId,
        setModalStatusHandler,
        setselectData,
        setModalTypeHandler,
        setLoaderStatusHandler,
        sample,
        (response) => {

          // const cookies = new Cookies();
          let storage = getsessionStorage()
          let emp_id = storage?.employee_id || '';
          if (response === 200) {
            dispatch(
              getLoginRoleAction(emp_id, (role_name, token, content) => {
                if (!roleType.includes(role_name)) {
                  let notify_type = notificationType('Stock Transfer');
                  let notify_content = content?.filter(
                    (m) => m.notification_type === notify_type,
                  );
                  if (notify_content.length) {
                    let Fromlocat =
                    get_source_locationdata.find(
                        (d) => d.location_id === data.source_location_id,
                      ) || {};
                    let Tolocate =
                    get_destination_location.find(
                        (d) => d.location_id === data.destination_location_id,
                      ) || {};
                    let amount_value =
                      data.categoryData[0].lots[0].trans_items_cost_price || '';
                    let content_body = `\nFrom: ${Fromlocat.location_name} \nTo: ${Tolocate.location_name} \nAmount: ₹ ${amount_value}`;
                    sendNtfy(token, notify_content[0]?.title, content_body);
                    dispatch(CreateNotificationAction({content_body:content_body,title:notify_content[0]?.title,time:getDateTimeFormat(new Date()),"active":"1"}))
                  }
                }
              }),
            );
            setopen(false);
          }
        },
      );
      //}
      //  await list(setModalTypeHandler, setLoaderStatusHandler)
     
    };
    const handledialog = (id) => {
      // setDialog({ delete: true, id: id })
    };

    const createInventory = (
      data,
      commoncookie,
      headerLocationId,
      setModalStatusHandler,
      setselectData,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
      response,
    ) => {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          createInventoryAction(
            data,
            commoncookie,
            headerLocationId,
            setModalStatusHandler,
            setselectData,
            setModalTypeHandler,
            setLoaderStatusHandler,
            sample,
            response,
          ),
        )
      );
    };
    // const list = (setModalTypeHandler, setLoaderStatusHandler) => {
    //   dispatch(liststocktransferAction(setModalTypeHandler, setLoaderStatusHandler))
    // }

    // useEffect(() => {
    //   dispatch(liststocktransferAction(setModalTypeHandler, setLoaderStatusHandler))
    //   dispatch(listInventoryAction(true, setLoaderStatusHandler))
    //   // if(!vendor.length)
    //   dispatch(listProductAction(true, setLoaderStatusHandler))
    //   //if(!stocklocation.length)
    //   dispatch(listStockLocationAction(true, setLoaderStatusHandler))
    // }, [])

  const initsform = () => {

    const data = filterValue;
    const detail = {
      searchString: '',
      rowsPerPage: size,
      pageNum: page,
      employeeId: commoncookie,
      locationId: headerLocationId,
      tempData : {
        initiatedFromDate:
          data.initiatedFromDate?._d === undefined
            ? ''
            : moment(data.initiatedFromDate?._d).format("DD/MM/YYYY"),
        initiatedToDate:
          data.initiatedToDate?._d === undefined ? '' : moment(data.initiatedToDate?._d).format("DD/MM/YYYY"),
        receivedFromDate:
          data.receivedFromDate?._d === undefined
            ? ''
            : moment(data.receivedFromDate?._d).format("DD/MM/YYYY"),
        receivedToDate:
          data.receivedToDate?._d === undefined ? '' : moment(data.receivedToDate?._d,).format("DD/MM/YYYY"),
        destination_locationId:
          data.destination_location[0]?.destination_location_id === undefined
            ? ''
            : data.destination_location[0]?.destination_location_id,
        source_locationId:
          data.source_location[0]?.source_location_id === undefined
            ? ''
            : data.source_location[0]?.source_location_id,
        product_id:
          data.product_name[0]?.item_id === undefined
            ? ''
            : data.product_name[0]?.item_id,
      }
    }
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          stockTransferPaginateAction(
            detail,
            commoncookie,
            headerLocationId,
            setModalTypeHandler,
            setLoaderStatusHandler,
          ),
        ),
      ).finally(() => setIsApiFinished(true));
      
    };
  tempinitsform.current = initsform;
  
    useEffect(() => {
      tempinitsform.current();
      // dispatch(listProductAction(setModalTypeHandler, setLoaderStatusHandler));
      // dispatch(allListStockLocation(commoncookie));
    }, [page, size, headerLocationId]);

    // useEffect(() => {
    //   if (headerLocationId !== 'null') {
    //     tempinitsform.current();
    //   }
    // }, [headerLocationId]);

    const pendingPayment = (data) => {
      const { chalan_number, destination_location, source_location, status } = data;
      //  const getVendor = vendor.filter(d => supplier_id === d.person_id)[0]

      // const getPay = purchase_outstanding.filter(d=>d.supplier_id === supplier_id)[0]?.childRow

      setPayData({
        ...PayData,
        chalan_number,
        source_location,
        destination_location,
        status,
      });
      setstatus('edit');
      setgetPay(getPay);
    };

    const handlechange = () => {
      setopen(true);
    };
    const handleCloseinvoice = () => {
      setinvoice({ open: false });
    };


    // const requestSearch = (e) => {
    //   let val = e.target.value
    //   setSearchText(val);
    //   const searchRegex = new RegExp(this.escapeRegExp(val), 'i');
    //   const filteredRows = stocktransfer.filter((row) => {
    //     return Object.keys(row).some((field) => {
    //       return searchRegex.test(row[field]);
    //     });
    //   });
    //   setSearchVal(filteredRows)
    // };

    // const cancelSearch = (e) => {
    //   this.setState({ searchData: [], searchPageData: [], page: 0, searchVal: '' });
    // }

    // const handleFilter = () => {
    // };

    const applyFilter = (data) => {
      setsearchVal('')
      setFilterValue(data)
      const detail = {
        searchString: '',
        rowsPerPage: size,
        pageNum: page,
        employeeId: commoncookie,
        locationId: headerLocationId,
        tempData : {
          initiatedFromDate:
            data.initiatedFromDate?._d === undefined
              ? ''
              : moment(data.initiatedFromDate?._d).format("DD/MM/YYYY"),
          initiatedToDate:
            data.initiatedToDate?._d === undefined ? '' : moment(data.initiatedToDate?._d).format("DD/MM/YYYY"),
          receivedFromDate:
            data.receivedFromDate?._d === undefined
              ? ''
              : moment(data.receivedFromDate?._d).format("DD/MM/YYYY"),
          receivedToDate:
            data.receivedToDate?._d === undefined ? '' : moment(data.receivedToDate?._d,).format("DD/MM/YYYY"),
          destination_locationId:
            data.destination_location[0]?.destination_location_id === undefined
              ? ''
              : data.destination_location[0]?.destination_location_id,
          source_locationId:
            data.source_location[0]?.source_location_id === undefined
              ? ''
              : data.source_location[0]?.source_location_id,
          product_id:
            data.product_name[0]?.item_id === undefined
              ? ''
              : data.product_name[0]?.item_id,
        }
      }
      // const tempData = {
      //   initiatedFromDate:
      //     data.initiatedFromDate?._d === undefined
      //       ? ''
      //       : moment(data.initiatedFromDate?._d).format("DD/MM/YYYY"),
      //   initiatedToDate:
      //     data.initiatedToDate?._d === undefined ? '' : moment(data.initiatedToDate?._d).format("DD/MM/YYYY"),
      //   receivedFromDate:
      //     data.receivedFromDate?._d === undefined
      //       ? ''
      //       : moment(data.receivedFromDate?._d).format("DD/MM/YYYY"),
      //   receivedToDate:
      //     data.receivedToDate?._d === undefined ? '' : moment(data.receivedToDate?._d,).format("DD/MM/YYYY"),
      //   destination_locationId:
      //     data.destination_location[0]?.destination_location_id === undefined
      //       ? ''
      //       : data.destination_location[0]?.destination_location_id,
      //   source_locationId:
      //     data.source_location[0]?.source_location_id === undefined
      //       ? ''
      //       : data.source_location[0]?.source_location_id,
      //   product_id:
      //     data.product_name[0]?.item_id === undefined
      //       ? ''
      //       : data.product_name[0]?.item_id,
      // };


      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          stockTransferPaginateAction(
            detail,
            commoncookie,
            headerLocationId
          ),
        ),
        // dispatch(
        //   filterStocktransferAction(
        //     tempData,
        //     commoncookie,
        //     headerLocationId,
        //     setModalTypeHandler,
        //     setLoaderStatusHandler,
        //   )
        // )
      );


      setFilterOpen(false);
    };

    const clearData = ()=>{
      setsearchVal('')
      setFilterOpen(false)
  
      setFilterValue({
        initiatedFromDate: null,
        initiatedToDate: null,
    
        receivedFromDate: null,
        receivedToDate: null,
    
        destination_location: '',
        source_location: '',
    
        product_name: '',
      })
      const data = filterValue;
  
      const detail = {
        searchString: '',
        rowsPerPage: size,
        pageNum: page,
        employeeId: commoncookie,
        locationId: headerLocationId,
        tempData: {
          initiatedFromDate: '',
          initiatedToDate:
            '',
          receivedFromDate:
            ''
          ,
          receivedToDate:
            '',
          destination_locationId:
            '',
          source_locationId:
            '',
          product_id:
            ''
        }
      }
  
  
  
        dispatch(
          stockTransferPaginateAction(
            detail,
            commoncookie,
            headerLocationId,
            setModalTypeHandler,
            setLoaderStatusHandler,
          ))
        
    }

    const handleDelete = async (id, data) => {
      //  alert(id)
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(deleteStocktransferAction(id,data, commoncookie, headerLocationId))
      );
      // await dispatch(
      //   liststocktransferAction(
      //     commoncookie,
      //     headerLocationId,
      //     setModalTypeHandler,
      //     setLoaderStatusHandler,
      //   ),
      // );
      

      
      // await this.props.deleteStocktransferAction
      // (id);
    };
    // const lotSearch = (event) => {

    //   setlotsearch(event ? event.lot_number : '')
    //   let value = event?.lot_number;
    //   if (value) {
    //     const result = allData.filter(data => {
    //       let lotresult = false
    //       data.childresult.forEach((b)=>{
    //         b.oldlots.forEach((m)=>{
    //          if( m.lot_number.includes(value)){
    //              lotresult =true
    //          }
    //         })
    //       })
    //       return lotresult
    //     });

    //     setlotfilter(result);

    //   }
    //   else {
    //     setlotfilter(allData);
    //   }
    // };

    // const lotsfilterdata = ()=>{
    //      let lotsarray=[]
    //      allData.forEach((d)=> {
    //       d.childresult.forEach((b)=>{
    //         b.oldlots.forEach((m)=>{
    //           lotsarray.push(m)
    //         })
    //       })
    //      })
    //      return lotsarray
    // }

    //server lvl search
  const requestSearch = (e) => {
     // const context = useContext(context);
      let val = e.target.value;
      setsearchVal(val)
      setPage(0)
    
      
      // if(val.trim() !== ''){
      if(val.length >= 3 || val.length === 0) {
      dispatch (set_searchstocktransferAction({data:[], numRows:0}))
      }
      // }
      const data = filterValue;
      const body = {
        searchString: val.toLowerCase(),
        rowsPerPage: size,
        pageNum: page,
        employeeId:commoncookie,
        headerLocationId:headerLocationId,
        tempData : {
          initiatedFromDate:
            data.initiatedFromDate?._d === undefined
              ? ''
              : moment(data.initiatedFromDate?._d).format("DD/MM/YYYY"),
          initiatedToDate:
            data.initiatedToDate?._d === undefined ? '' : moment(data.initiatedToDate?._d).format("DD/MM/YYYY"),
          receivedFromDate:
            data.receivedFromDate?._d === undefined
              ? ''
              : moment(data.receivedFromDate?._d).format("DD/MM/YYYY"),
          receivedToDate:
            data.receivedToDate?._d === undefined ? '' : moment(data.receivedToDate?._d,).format("DD/MM/YYYY"),
          destination_locationId:
            data.destination_location[0]?.destination_location_id === undefined
              ? ''
              : data.destination_location[0]?.destination_location_id,
          source_locationId:
            data.source_location[0]?.source_location_id === undefined
              ? ''
              : data.source_location[0]?.source_location_id,
          product_id:
            data.product_name[0]?.item_id === undefined
              ? ''
              : data.product_name[0]?.item_id,
        }

      }
      dispatch (searchstocktransferAction(
        body,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ))
  }

  const stockTransferCreate = UserRightsAuthorization(menuAccess[selectedRole], 'inventory__stock_transfer', 'can_create') 
  
    return (
      <>
        <Helmet>
                  <meta charSet="utf-8" />
                  <title> {titleURL} | Stock Transfer </title>
        </Helmet>
        {!isEdit ? (
          <>
            {filterOpen && (
              <FilterStockTransfer
                fromTo={true}
                date={date}
                stocktransfer={stocktransfer}
                open={filterOpen}
                setFilterOpen={setFilterOpen}
                ApplyButton={applyFilter}
                handleClose={handleFilter}
                filterValue={filterValue}
                clearData={clearData}
              // stocklocation={this.props.stocklocation}
              // product={this.props.product}
              // handleChange={this.handleChange}
              // handleFilterClose={this.handleFilterClose}
              // open={this.state.filterOpen}
              // ApplyButton={this.ApplyButton}
              // clearButton={this.clearButton}
              // filterHandler={this.filterHandler}
              // filtedValue={this.state.filtedValue}
              />
            )}
            {open === true ? (
              <NewStockTransfer
                edit_id_data={inventory_id_data}
                status={status}
                handleClose={handleClose}
                handleSubmit={handleSubmit}
                handledialog={handledialog}
                stocklocation={stocklocation}
                destination_location={get_destination_location}
                inventory={inventory}
                product={product}
                allliststocklocation={get_destination_location}
              />
            ) : (
              <>
                <CreateNewButtonContext.Consumer>
                  {({ loaderStatus }) => (
                      <Grid
                        container
                        spacing={3}
                        display='flex'
                        alignItems='center'
                      >
                        <Grid
                          size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                          }}>
                          <Card >
                            <Grid
                              container
                              spacing={3}
                              display='flex'
                              alignItems='center'
                              sx={{ p: '10px' }}
                            >
                              <Grid
                                size={{
                                  lg: 8,
                                  sm: 6.5,
                                  md: 8,
                                  xs: 12
                                }}>
                                <Typography variant='h6'>Stock Transfer</Typography>
                              </Grid>
                              <Grid
                                display='flex'
                                justifyContent='flex-end'
                                size={{
                                  lg: 3,
                                  md: 3,
                                  sm: 4,
                                  xs: 9
                                }}>
                                <CommonSearch
                                  searchVal={searchVal}
                                  cancelSearch={cancelSearch}
                                  requestSearch={requestSearch}
                                />
                              </Grid>
                              <Grid
                                style={{
                                  display: 'flex',
                                  justifyContent: 'flex-end',
                                }}
                                size={{
                                  lg: 1,
                                  sm: 1.5,
                                  md: 1,
                                  xs: 3
                                }}>
                                <Tooltip title='Filter'>
                                  <IconButton>
                                    <FilterAltIcon
                                      onClick={() => {
                                        setFilterOpen(true);

                                      }}
                                    />
                                  </IconButton>
                                </Tooltip>
                                {stockTransferCreate && (
                                  <Tooltip title='Add'>
                                    <IconButton onClick={() => handlechange()}>
                                      <AddIcon />
                                    </IconButton>
                                  </Tooltip>
                                )}

                              </Grid>
                            </Grid>
                          </Card>
                        </Grid>

                        <Grid
                          size={{
                            lg: 12,
                            sm: 12,
                            md: 12,
                            xs: 12
                          }}>
                          <Card>
                            <Box sx={{height:maxBodyHeight, overflowY: 'auto'}}>
                            <TableContainer 
                             sx={ {maxBodyHeight: maxBodyHeight-'100px',
                              minBodyHeight: maxBodyHeight-'100px'}}
                            >
                              <Table aria-label='collapsible table'>
                                <TableHead>
                                  <TableRow>
                                    <TableCell />
                                    {/* <TableCell>Test</TableCell> */}
                                    <TableCell>Challan Number</TableCell>
                                    <TableCell>Initiated Date</TableCell>
                                    <TableCell>Receive Date</TableCell>
                                    <TableCell>Source Location</TableCell>
                                    <TableCell>Destination Location</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Action</TableCell>
                                    {/* <TableCell>Action</TableCell> */}
                                  </TableRow>
                                </TableHead>
                                <TableBody sx={{overflowY: 'auto'}}>
                                  {searchStockTransfer?.data?.map((row, i) => (
                                    <Row
                                      pendingPayment={pendingPayment}
                                      handlePopup={handlePopup}
                                      setedit_data={handleEdit}
                                      handleInvoice={handleInvoice}
                                      row={row}
                                      handleDelete={handleDelete}
                                      key={row.id}
                                    />
                                  ))
                                  }
                            {/* {!searchStockTransfer?.data?.length && loaderStatus === false && isApiFinished && <NoRecordFound />} */}

                                </TableBody>
                                
                              </Table>
                            {!searchStockTransfer?.data?.length && loaderStatus === false && isApiFinished && <NoRecordFound />}

                            </TableContainer>
                            </Box>

                            
                            <Box spacing={2} display='flex' justifyContent='right' marginLeft='auto'>
                              <TablePagination
                                component="div"
                                count={searchStockTransfer?.numRows ?? 0}
                                page={page}
                                onPageChange={handleChangePage}
                                rowsPerPage={size}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                rowsPerPageOptions={[20, 50, 100]}
 
                              />
                            </Box>
                          </Card>
                        </Grid>
                      </Grid>
                  )}
                </CreateNewButtonContext.Consumer>
                <ActionButton
                  open={invoice.open}
                  handleClose={handleCloseinvoice}
                  sourcelocation={{ location_name: edit_id_data.source_location }}
                  destinationlocation={{
                    location_name: edit_id_data.destination_location,
                  }}
                  ponumber={edit_id_data.chalan_number}
                  categoryData={edit_id_data.childresult || []}
                  transfer={transfer}
                />
              </>
            )}
          </>
        ) : (
          <>
            <ItemPopup
              open={row_id.open}
              row_id={row_id}
              itemsData={stocktransfer}
              handleClose={() => setisEdit(false)}
              edit_data={edit_data}
              status={status}
              stocklocation={stocklocation}
              product={product}
              sample={sample}
              disabledel={disabledel}
            />
            {/* <ItemPopup
           // cancelref = {cancelActionRef.current?.click}
            open={row_id.open}
            status={row_id.status}
            setitemsData={setcategoryData}
            handleClose={handleClose}
            itemsData={categoryData}
            row_id={row_id}
            product={product}
          /> */}
          </>
        )}
      </>
    );
  }


