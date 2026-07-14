import React, {useEffect, useState, useContext, useRef, useLayoutEffect} from 'react';
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
// import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {useDispatch, useSelector} from 'react-redux';
// import { paymentview, createPurchasesAction, updatePurchasesAction } from '../../redux/actions/purchase_actions';
// import { listVendorAction } from '../../redux/actions/vendor_actions';
// import { payablesPaymentEntry } from '../../redux/actions/purchase_actions';
// import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
// import PaymentDialog from '../paymentSalesPurchase/Dialog'
import context from '../../../context/CreateNewButtonContext';
// import Chip from '@mui/material/Chip';
// import ArticleIcon from '@mui/icons-material/Article';
// import Popup from '../purchases/Popup';
import {listProductAction} from '../../../redux/actions/product_actions';
import {
  listInventoryAction,
  updateInventoryAction,
  liststocktransferAction,
  filterStocktransferAction,
  setSearchStockReceiveAction,
  getSearchStockReceiveAction,
  stockReceivePaginateAction,
  filterStockReceiveAction
} from '../../../redux/actions/inventory_actions';
// import AddIcon from '@mui/icons-material/Add';
// import NewStockTransfer from './newstocktransfer';
// import ActionButton from './ActionButton';
import ItemPopup from './receivelot';
// import { Button } from '@mui/material';
// import { style } from '@mui/system';
import NoRecordFound from '../../../components/Layout/NoRecordFound';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, InputAdornment, Slide, TablePagination, TextField, Tooltip, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterStockTransfer from './FilterStockTransfer';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import CommonSearch from 'utils/commonSearch';
import { commonDateFormat } from 'utils/getTimeFormat';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle } from 'utils/pageSize';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import {PostAdd, DeleteOutline} from '@mui/icons-material';
import _ from 'lodash';
import { titleURL } from 'http-common';
import moment from 'moment';
import {
    getStickyTableOptions,
    stickyTableComponents,
  } from '../../../utils/stickyTableLayout';

// const poStatus = {
//   New: 'primary',
//   Open: 'secondary',
//   'Pending Payment': 'warning',
//   'Pending Goods': 'warning',
//   Completed: 'success'
// }

function Row(props) {
  const {row, setedit_data, handlePopup,handleSubmit} = props;
  const [open, setOpen] = React.useState(false);

  // const [row_id, setRowid] = useState({
  //   id: '', data: '',
  //   open: false,
  //   status: '',
  // })
  

  return (
    <React.Fragment>
      <TableRow sx={{'& > *': {borderBottom: 'unset'}}}>
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
          {row.chalan_number}
        </TableCell>
        <TableCell>{row.initiated_date.slice(0,11)}</TableCell>
        <TableCell>{row.received_date.slice(0,11)}</TableCell>
        <TableCell>{row.source_location}</TableCell>
        <TableCell>{row.destination_location}</TableCell>
        <TableCell>
          {row.status === 'received' ? (
            <p style={{color: 'green'}}>{row.status} </p>
          ) : (
            <p style={{color: 'orange'}}>{row.status}</p>
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={6}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{margin: 1}}>
              <Table size='small' aria-label='purchases'>
                <TableHead>
                  <TableRow>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Quantity</TableCell>
                    {/* <TableCell>Lot Number</TableCell> */}
                    <TableCell>Action</TableCell>
                    {/* <TableCell >Total</TableCell>
                    <TableCell>Payment</TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.childresult?.map((historyRow, index) => (
                    <TableRow key={historyRow.item_id}>
                      <TableCell>{historyRow.name}</TableCell>
                      <TableCell>{historyRow.quantity}</TableCell>
                      {/* <TableCell >{historyRow.lots.map((d) => (d.lot_number)).join()}</TableCell> */}
                      {historyRow.is_serialized !== 0 && (
                        <>
                          <TableCell>
                            {row.status === 'received' ? (
                              <AssignmentTurnedInIcon color='success' />
                            ) : (
                              <AssignmentTurnedInIcon
                                onClick={() => {
                                  setedit_data(row);
                                  handlePopup(historyRow, index);
                                }}
                                sx={{
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                }}
                                color='primary'
                              />
                            )}
                          </TableCell>
                        </>
                      )}
                      {historyRow.is_serialized === 0 && (
                        <>
                          <TableCell>
                            {row.status === 'received' ? (
                              <AssignmentTurnedInIcon color='success' />
                            ) : (
                              <AssignmentTurnedInIcon
                                onClick={() => {
                                   handleSubmit(row);
                                }}
                                sx={{
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                }}
                                color='primary'
                              />
                            )}
                          </TableCell>
                        </>
                      )}
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

export default function StockTransfer() {
  const dispatch = useDispatch();

  // const {
  //   inventoryReducer: {stocktransfer},
  //   productReducer: {product},
  //   stockLocationReducer: {stocklocation},
  // } = useSelector((state) => state);
  const {
    inventoryReducer: { stocktransfer, inventory, inventory_id_data, searchStockReceiveValue, searchStockTransfer },
    productReducer: { product },
    stockLocationReducer: { stocklocation, allliststocklocation } }
    =
  useSelector(state => state)
  const [PayData, setPayData] = React.useState({
    stocktransfer: [],
    inventory_id_data: [],
    paymentOpen: false,
    itemsData: [],
    Tdata: [],
    getVendor: {},
    paid_amount: 0,
  });

  const tempinitsform = useRef(null);

  const [row_id, setRowid] = useState({
    id: '',
    data: '',
    open: false,
    status: '',
  });
  const [isEdit, setisEdit] = React.useState(false);
  const [edit_data, setedit_data] = React.useState({});
  const [status, setstatus] = React.useState('');
  // const [selectionModel, setSelectionModel] = React.useState([])
  const [getPay, setgetPay] = React.useState([]);
  // const [open, setopen] = useState(false)
  // const [dialog, setDialog] = useState({ open: false, msg: '', severity: '' })
  // const [categoryData, setcategoryData] = useState([])
  const [validate, setvalidate] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [open, setopen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [date, setDate] = useState({
    from: null,
    to: null,
  });
  const [filterValue, setFilterValue] = useState({
    initiatedFromDate: null,
    initiatedToDate: null,

    receivedFromDate: null,
    receivedToDate: null,

    destination_location: '',
    source_location: '',

    product_name: '',
  });

  const [searchVal, setSearchVal] = useState('')
  const [isApiFinished, setIsApiFinished] = useState(false);
  const [page , setPage] = useState(0);
  const [size , setSize] = useState(15);
  const [lotDialog, setLotDialog] = useState({
    open: false,
    title: '',
    lots: [],
  });

  const handlePopup = async (id, index) => {
    setRowid({open: true, id: index, data: id, status: 'edit'});
  };
  const openLotDialog = (title, lots) => {
    setLotDialog({
      open: true,
      title,
      lots,
    });
  };
  const closeLotDialog = () => {
    setLotDialog({
      open: false,
      title: '',
      lots: [],
    });
  };
  const getLotNumbersByType = (rowData, type) => {
    return (rowData.childresult || []).flatMap((item) => {
      const sourceLots =
        type === 'received'
          ? (item.oldlots || []).filter(
              (lot) => String(lot?.status || '').toUpperCase() === 'A',
            )
          : item.oldlots || [];

      return sourceLots.map((lot) => ({
        productName: item.name,
        costPrice: item.trans_items_cost_price,
        lotNumber: lot.lot_number,
      }));
    });
  };
  const {source_location} = PayData;

  const {
    setLoaderStatusHandler,
    setModalStatusHandler,
    setselectData,
    setModalTypeHandler,
    commoncookie,
    headerLocationId,
  } = useContext(context);

  const handleEdit = (data) => {
    setedit_data(data);
    setstatus('edit');
    setisEdit(true);
  };

  const sample = (value) => {
    setisEdit(value);
    //  setopen({open:value})
  };


  // useEffect(() => {
  //   if(stocktransfer.length <= 0)
  //   dispatch(liststocktransferAction(commoncookie,
  //     headerLocationId
  //   ))
  // },[])

  const requestSearch = (e) => {
    let val = e.target.value;
    setSearchVal(val);

    // if (val.trim() !== '') {
    if (val.length >= 3 || val.length === 0) {
      dispatch(setSearchStockReceiveAction({ data: [], numRows: 0 }))
    }
    // }
    const data = filterValue;
    const body = {
      searchString: val,
      rowsPerPage: size,
      pageNum: page,
      employeeId: commoncookie,
      locationId: headerLocationId,
      tempData :{
        initiatedFromDate:
          data.initiatedFromDate?._d === undefined
            ? ''
            : moment(data.initiatedFromDate?._d).format("DD/MM/YYYY"),
        initiatedToDate:
          data.initiatedToDate?._d === undefined ? '' : moment(data.initiatedToDate?._d,).format("DD/MM/YYYY"),
        receivedFromDate:
         moment(data.receivedFromDate?._d === undefined).format("DD/MM/YYYY")
            ? ''
            : data.receivedFromDate?._d,
        receivedToDate:
          data.receivedToDate?._d === undefined ? '' : moment(data.receivedToDate?._d).format("DD/MM/YYYY"),
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
    dispatch(getSearchStockReceiveAction(
      body,
      setModalStatusHandler,
      setLoaderStatusHandler
    ))
  };

  const  handlePageChange = async (page) => {
    setPage(page);
  }

  const handlePageSizeChange = async (size) => {
    setSize(size);
  }

  const cancelSearch = (e) => {
    setSearchVal('');
    dispatch(setSearchStockReceiveAction({ data: [], numRows: 0 }))
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
          data.initiatedToDate?._d === undefined ? '' : moment(data.initiatedToDate?._d,).format("DD/MM/YYYY"),
        receivedFromDate:
         moment(data.receivedFromDate?._d === undefined).format("DD/MM/YYYY")
            ? ''
            : data.receivedFromDate?._d,
        receivedToDate:
          data.receivedToDate?._d === undefined ? '' : moment(data.receivedToDate?._d).format("DD/MM/YYYY"),
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
        stockReceivePaginateAction(
          detail,
          commoncookie,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      )
    ).finally(() => setIsApiFinished(true));
  };

  const handleSearch = (value) => {
    setSearchText(value);
    filterData(value);
  };
  
  const filterData = (value) => {
    const lowerCaseValue = value.toLowerCase().trim();
    if (!lowerCaseValue) {
      setSearchData(stocktransfer);
    } else {
      const filteredData = stocktransfer.filter((item) => {
        return Object.keys(item).some((key) => {
          return item[key].toString().toLowerCase().includes(lowerCaseValue);
        });
      });

      // -------------
          // This filter only lot number
          const filterBasedOnLot = stocktransfer.filter((item) => {
            return Object.keys(item).some((key) => {
              let flag = false;
              if( typeof item[key] === 'object'){
                let level2 = item[key];
                let l2A = level2.filter(l2 => {
                  return Object.keys(l2).some(k2 => {
                      if(typeof l2[k2] === 'object'){
                        let level3 = l2[k2];
                        let l3A = level3.filter(l3 => {
                          flag = l3.lot_number.toString().toLowerCase().includes(lowerCaseValue);
                          return flag;
                        })
                        if(l3A.length > 0){
                          return true
                        }
                      }
                  })
                })
                if(l2A.length > 0){
                  return true;
                }
              }
            });
          });

          let temp = [...filteredData, ...filterBasedOnLot]
          const unique = [...new Map(temp.map(item => [item['id'], item])).values()];

          // -------------


      setSearchData(unique);
    }
  };

// const cancelSearch = (e) => {
//   setSearchText('');
//   setSearchData(stocktransfer);
// };


  // const handleClose = () => {
  //   if (setModalStatusHandler) {
  //     setModalStatusHandler(false)
  //     setselectData(false)
  //   }
  //   setTimeout(() => {
  //     setopen({ open: false, dialog: false, delete: false })
  //   }, 0);
  // }

  const receiverLotUpdate = async (lotData,updateHandleSubmit) =>{
      
    await setedit_data(lotData)
    updateHandleSubmit()

  }

  const nonSerialHandleSubmit = (data) =>{
    setedit_data(data);
    handleSubmit(data)
  }

  // modified handleSubmit
  const handleSubmit = async (data) => {
    const neweditdata = data
    neweditdata.trans_user = commoncookie;

    const categoryData = neweditdata?.childresult.map((d) => {
      const data = {...d};
      delete data.name;
      return data;
    });
    neweditdata.categoryData = categoryData;
    delete neweditdata.childresult;
    delete neweditdata.tableData;
    // return
    await update( neweditdata.id, neweditdata);
    setvalidate([...validate, data]);
  };

  // old
  // const handleSubmit = async (data) => {
  //   const neweditdata = Object.keys(edit_data).length ? {...edit_data} : {...data};
  //   neweditdata.trans_user = commoncookie;

  //   const categoryData = neweditdata?.childresult.map((d) => {
  //     const data = {...d};
  //      data.lots = data.oldlots.filter(i => i.item_id === d.item_id);
  //     // delete data.oldlots;
  //     delete data.name;
  //     return data;
  //   });
  //   neweditdata.categoryData = categoryData;
  //   delete neweditdata.childresult;
  //   let isvalid = true;
  //   // const newvalidate = [...validate, data]
  //   data.childresult.map((d) => {
  //     if (d.lots) {
  //       d.lots.map((f) => {
  //         if (!Object.keys(f).length) {
  //           isvalid = false;
  //         }
  //         return null;
  //       });
  //     } else {
  //       if (d.is_serialized === 1) isvalid = false;
  //     }
  //     return null;
  //   });
  //   return;
  //   if (isvalid) {
  //     // delete neweditdata.categoryData.map((d)=> d.oldlots)
  //     await update(
  //       neweditdata.id,
  //       neweditdata,
  //       // setModalStatusHandler,
  //       // setselectData,
  //       // setModalTypeHandler,
  //       // setLoaderStatusHandler,
  //       // sample,
  //     );
      
  //   }
  //   //
  //   // await list(setModalTypeHandler, setLoaderStatusHandler)
  //   // setopen(false)
  //   setvalidate([...validate, data]);
  // };



  // const handledialog=(id)=>{
  //   setDialog({delete:true,id:id})
  // }
  // const handledialog=(id)=>{
  //   setDialog({delete:true,id:id})
  // }

  // const createInventory = (data,setModalStatusHandler,setselectData,setModalTypeHandler, setLoaderStatusHandler,sample) => {
  //   dispatch(createInventoryAction(data,setModalStatusHandler,setselectData,setModalTypeHandler, setLoaderStatusHandler,sample))
  // }
  const update = (
    id,
    data,
  ) => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        updateInventoryAction(
          id,
          data,
          // setModalStatusHandler,
          // setselectData,
          // setModalTypeHandler,
          // setLoaderStatusHandler,
         (res)=>{
          if(res === 200){
            setisEdit(false)  
            // dispatch(
            //   liststocktransferAction(
            //     commoncookie,
            //     headerLocationId,
            //     setModalTypeHandler,
            //     setLoaderStatusHandler,
            //   ),
            // );
           }
          }  
        ),
      )
    );
  };
  // const listapi = (setModalTypeHandler, setLoaderStatusHandler) =>{
  //   dispatch(liststocktransferAction(setModalTypeHandler, setLoaderStatusHandler))
  // }

  const initsform = () => {
    const data = filterValue;
    const detail = {
      searchString: searchVal,
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
          data.initiatedToDate?._d === undefined ? '' : moment(data.initiatedToDate?._d,).format("DD/MM/YYYY"),
        receivedFromDate:
         moment(data.receivedFromDate?._d === undefined).format("DD/MM/YYYY")
            ? ''
            : data.receivedFromDate?._d,
        receivedToDate:
          data.receivedToDate?._d === undefined ? '' : moment(data.receivedToDate?._d).format("DD/MM/YYYY"),
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
        stockReceivePaginateAction(
          detail,
          commoncookie,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      )
    ).finally(() => setIsApiFinished(true));
  };
  tempinitsform.current = initsform;
  
  // useEffect(()=>{
   
  //   tempinitsform.current();     
  //   // tempinitsform.current();
  // },[])
  // useEffect(() => {
  //   dispatch(setSearchStockReceiveAction({ data: [] }))
    
  // }, []);

  useEffect(() => {
    tempinitsform.current();
  }, [page, size, headerLocationId]);

  const pendingPayment = (data) => {
    const {chalan_number, destination_location} = data;
    //  const getVendor = vendor.filter(d => supplier_id === d.person_id)[0]
    // const actionbutton = < AssignmentTurnedInIcon color={status === 'received' ? 'success' : 'error'} />

    // const getPay = purchase_outstanding.filter(d=>d.supplier_id === supplier_id)[0]?.childRow
    setPayData({
      ...PayData,
      chalan_number,
      source_location,
      destination_location,
    });
    setstatus('edit');
    setgetPay(getPay);
  };

  // const handlechange= () =>{
  //   setopen(true);
  // }


  const handleFilter = () => {
  };

  const applyFilter = (data) => {
    setSearchVal('')
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
          data.initiatedToDate?._d === undefined ? '' : moment(data.initiatedToDate?._d,).format("DD/MM/YYYY"),
        receivedFromDate:
         moment(data.receivedFromDate?._d === undefined).format("DD/MM/YYYY")
            ? ''
            : data.receivedFromDate?._d,
        receivedToDate:
          data.receivedToDate?._d === undefined ? '' : moment(data.receivedToDate?._d).format("DD/MM/YYYY"),
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
        stockReceivePaginateAction(
          detail,
          commoncookie,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      )
      // dispatch(
      //   filterStocktransferAction(
      //     tempData,
      //     commoncookie,
      //     headerLocationId,
      //     setModalTypeHandler,
      //     setLoaderStatusHandler,
      //   ),
      // )
    );


    setFilterOpen(false);
  };
  
  const clearData = ()=>{
    setSearchVal('')
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
        stockReceivePaginateAction(
          detail,
          commoncookie,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ))
      
  }
  // const filteredData = searchStockReceiveValue.data
  // const table_data =  stocktransfer
  // const search = searchStockReceiveValue?.datas
  
  const handleChangePage = (event, value) => {
    setPage(value);;
  };

  const handleChangeRowsPerPage = (event, value) => {
    setSize(parseInt(event.target.value, 10))
  }
  
  return (
    <>
      <Helmet>
                  <meta charSet="utf-8" />
                  <title> {titleURL} | Stock Receiver </title>
        </Helmet>
      <>
        {filterOpen && (
            <FilterStockTransfer
              fromTo={true}
              date={date}
              stocktransfer={stocktransfer}
              open={filterOpen}
              setFilterOpen={setFilterOpen}
              ApplyButton={applyFilter}
              filterValue={filterValue}
              shouldFetchData={true}
              clearData={clearData}
            // stocklocation={this.props.stocklocation}
            // product={this.props.product}
            // handleChange={this.handleChange}
            // handleFilterClose={this.handleFilterClose}
            // clearButton={this.clearButton}
            // filterHandler={this.filterHandler}
            // filtedValue={this.state.filtedValue}
            />
          )}
        <CreateNewButtonContext.Consumer>
          {({loaderStatus}) => (
            <div>
              <Grid
                container
                spacing={3}
                display='flex'
                alignItems='center'
              >
                {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                  <Card sx={{p: '10px'}}>
                    <Grid
                      container
                      spacing={3}
                      display='flex'
                      alignItems='center'
                    >
                      <Grid size={{ xs: 12, sm: 8, md: 8.5, lg: 8.5 }}>
                        <Typography variant='h6'>Stock Receive</Typography>
                      </Grid>
                      <Grid size={{ xs: 11, sm: 3, md: 3, lg: 3 }} display='flex' justifyContent='flex-end'>
                        <CommonSearch
                          searchVal={searchVal}
                          cancelSearch={cancelSearch}
                          requestSearch={requestSearch}
                          // type={"border"}
                        />
                      </Grid>
                      <Grid size={{ xs: 1, sm: 1, md: 0.5, lg: 0.5 }}
                        item
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <Tooltip title='Filter'>
                          <IconButton>
                            <FilterAltIcon
                              onClick={() => {
                                setFilterOpen(true);
                                handleFilter();
                              }}
                            />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid> */}


              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                  <Card>
                  <MaterialTable
                     totalCount ={ searchStockReceiveValue?.numRows}
                      style={{height: 'calc(100vh - 80px)' ,overflow:'hidden'}}
                      components={{
                        ...stickyTableComponents,
                        Toolbar: (props) => (
                          <>
                            <div
                              style={{
                                display: 'flex',
                                width: '100%',
                                alignItems: 'center',
                              }}
                            >
                              <div style={{width: '100%'}}>
                                <MTableToolbar {...props} />
                              </div>
                              <div>
                                <CommonSearch
                                  searchVal={searchVal}
                                  cancelSearch={cancelSearch}
                                  requestSearch={requestSearch}
                                  // type={"border"}
                                />
                              </div>
                            </div>
                          </>
                        ),
                      }}
                      actions={[
                        (rowData) => ({
                          icon: () => (
                            <DescriptionOutlinedIcon
                              fontSize='small'
                              color={
                                rowData.status === 'received'
                                  ? 'success'
                                  : 'primary'
                              }
                            />
                          ),
                          ...(rowData.status !== 'received' && {tooltip: 'Open'}),
                          disabled :rowData.status === 'received',
                          onClick: (event, rowData) => {
                            setisEdit(true)
                            setedit_data(rowData);
                          },
                        }),
                        {
                          icon: () => (
                            <div style={{display: 'flex'}}>
                                  <FilterAltIcon
                                    onClick={() => {
                                      setFilterOpen(true);
                                      // handleFilter();
                                    }}
                                  />
                            </div>
                          ),
                          tooltip: 'Filter',
                          isFreeAction: true,
                        },
                      ]}
                      onPageChange={(page) => handlePageChange(page)}
                      onRowsPerPageChange={(size) => handlePageSizeChange(size)}
                      page={page}
                      options={getStickyTableOptions({
                        headerStyle,
                        bodyOffset: 195,
                        cellStyle,
                        options:{
                            showEmptyDataSourceMessage: isApiFinished,
                        exportButton: true,
                        filtering: false,
                        tableLayout: "auto",
                        toolbar: true,
                        actionsColumnIndex: -1,
                        // maxBodyHeight: maxBodyHeight,
                        // minBodyHeight: maxBodyHeight,
                        pageSize: pageSize,
                        pageSizeOptions: [20, 50, 100],
                        search: false,
                        
                        },
                      })}
                      columns={[
                        {
                          field: 'chalan_number',
                          title: 'Challan Number',
                        },
                        {
                          field: 'initiated_date', //location_id
                          title: 'Initiated Date',
                          render: (rowData) =>
                            rowData.initiated_date.slice(0, 11),
                        },
                        {
                          field: 'received_date',
                          title: 'Receive Date',
                          render: (rowData) =>
                            rowData.received_date.slice(0, 11),
                        },
                        {
                          field: 'source_location',
                          title: 'Source Location',
                        },
                        {
                          field: 'destination_location',
                          title: 'Destination Location',
                        },
                        {
                          field: '',
                          title: 'Total Quantity',
                          render: (rowData) => {
                            const quantity = rowData.childresult.reduce((a, c) => a + c.quantity, 0);
                            return (
                              <span
                                onClick={() =>
                                  openLotDialog(
                                    `${rowData.chalan_number} - Total Quantity Lots`,
                                    getLotNumbersByType(rowData, 'total'),
                                  )
                                }
                                style={{
                                  color: '#1976d2',
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                }}
                              >
                                {quantity}
                              </span>
                            );
                          }
                        },
                        {
                          field: '',
                          title: 'Received Quantity',
                          render: (rowData) => {
                            const received_quantity = rowData.childresult.reduce((a, c) => a + c.received_quantity, 0);
                            return (
                              <span
                                onClick={() =>
                                  openLotDialog(
                                    `${rowData.chalan_number} - Received Quantity Lots`,
                                    getLotNumbersByType(rowData, 'received'),
                                  )
                                }
                                style={{
                                  color: '#1976d2',
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                }}
                              >
                                {received_quantity}
                              </span>
                            );
                          }
                        },
                        {
                          field: 'status',
                          title: 'Status',
                          render: (rowData) => {
                            const quantity = rowData.childresult.reduce((a, c) => a + c.quantity, 0)
                            const received_quantity = rowData.childresult.reduce((a, c) => a + c.received_quantity, 0)

                            if(quantity === received_quantity){
                              return <p style={{color: 'green'}}>{rowData.status}</p>
                            }else if(received_quantity === 0){
                              return <p style={{color: 'orange'}}>{rowData.status}</p>
                            }else{
                              return <p style={{color: 'orange'}}>{'partially received'}</p>
                            }
                          }
                        },
                      ]}
                      data={searchStockReceiveValue?.data}
                      title='Stock Receive'
                    />
                    {/* <TableContainer 
                  //   sx={{
                  //   "&::-webkit-scrollbar": {
                  //     width: 15
                  //   },
                  //   "&::-webkit-scrollbar-track": {
                  //     // backgroundColor: "#E0E0E0"
                  //   },
                  //   "&::-webkit-scrollbar-thumb": {
                  //     backgroundColor: "#B2B2B2",
                  //     border: "2px solid white"
                  //   }
                  // }}
                  >
                <Table aria-label='collapsible table'>
                  <TableHead>
                    <TableRow>
                      <TableCell />
                      <TableCell>Challan Number</TableCell>
                      <TableCell>Initiated Date</TableCell>
                      <TableCell>Receive Date</TableCell>
                      <TableCell>Source Location</TableCell>
                      <TableCell>Destination Location</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {searchStockReceiveValue?.data?.map((row) => (
                      <Row
                        key={row.id}
                        pendingPayment={pendingPayment}
                        handlePopup={handlePopup}
                        setedit_data={handleEdit}
                        handleSubmit ={nonSerialHandleSubmit}
                        row={row}
                      />
                    ))
                  }
                  </TableBody>
                </Table>
                    </TableContainer>
                    
              {!searchStockReceiveValue?.data?.length && loaderStatus === false && isApiFinished && (<NoRecordFound />)}

                    <Box spacing={2} display='flex' justifyContent='right' marginLeft='auto'>
                            <TablePagination
                              component="div"
                              count={searchStockReceiveValue?.numRows}
                              page={page}
                              onPageChange={handleChangePage}
                              rowsPerPage={size}
                              onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                          </Box> */}
                  </Card>
              </Grid>
              </Grid>
            </div>
          )}
        </CreateNewButtonContext.Consumer>
      </>
      <Dialog open={lotDialog.open} onClose={closeLotDialog} fullWidth maxWidth='sm'>
        {/* <DialogTitle>{lotDialog.title || 'Lot Numbers'}</DialogTitle> */}
        <DialogContent>
          {lotDialog.lots.length ? (
            <Grid container spacing={2}>
              {lotDialog.lots.map((lot, index) => (
                <Grid item xs={12} key={`${lot.productName}-${lot.lotNumber}-${index}`}>
                  <TextField
                    fullWidth
                    label={`Lot Number ${index + 1}`}
                    value={lot.lotNumber}
                    InputProps={{readOnly: true}}
                    variant='outlined'
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography>No lot numbers available.</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{borderTop: 'none', pt: 0}}>
          <Button variant='contained' color='secondary' onClick={closeLotDialog}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      {isEdit === true && (
        <>
          <AlertDialogSlide 
            row_id={row_id}
            itemsData={stocktransfer}
            edit_data={edit_data}
            handleClose={() => setisEdit(false)}
            handleSubmit={handleSubmit}
            receiverLotUpdate = {receiverLotUpdate}
          />
          {/* <ItemPopup
            open={row_id.open}
            row_id={row_id}
            itemsData={stocktransfer}
            handleClose={() => setisEdit(false)}
            handleSubmit={handleSubmit}
            edit_data={edit_data}
            setedit_data={setedit_data}
            status={status}
            stocklocation={stocklocation}
            product={product}
            sample={sample}
            receiverLotUpdate = {receiverLotUpdate}
          /> */}
        </>
      )}
      {/* {isEdit === true && (
      <AlertDialogSlide 
        row_id={row_id}
        itemsData={stocktransfer}
        edit_data={edit_data}
        handleClose={() => setisEdit(false)} 
      />)} */}
    </>
  );
}


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />;
});

function AlertDialogSlide({handleClose, itemsData, row_id, edit_data, handleSubmit, receiverLotUpdate}) {
  const [lotInputError, setLotInputError] = useState(false);
  const [lotTextField, setLotTextFiled] = useState('');
  const tableRef = useRef(null)
  const [serializedProductList, setSerializedProductList] = useState(() => {
    return edit_data.childresult.filter(i => i.is_serialized === 1).map((i) => ({
      name: i.name,
      transferred_qty: i.quantity,
      received_qty: i.received_quantity,
      item_id: i.item_id,
      trans_items_cost_price: i.trans_items_cost_price
    }));
  });
  const [nonSerializedProductList, setNonSerializedProductList] = useState(() => {
    return edit_data.childresult.filter(i => i.is_serialized === 0).map((i) => ({
      name: i.name,
      transferred_qty: i.quantity,
      received_qty: i.received_quantity,
      temp_received_qty: i.received_quantity,
      item_id: i.item_id,
      trans_items_cost_price: i.trans_items_cost_price
    }));
  });

  const matchedLot = useRef([]);
  const lotInputRef = useRef(null);
  const currentLotDetails = useRef({
    value: '',
    details: {},
  });
  const isSameItemAndCost = (a, b) => {
    const sameItem = String(a?.item_id) === String(b?.item_id);
    const aCost = a?.trans_items_cost_price;
    const bCost = b?.trans_items_cost_price;
    const sameCost =
      Number(aCost) === Number(bCost) || String(aCost) === String(bCost);
    return sameItem && sameCost;
  };

  const handleChange = (e) => {
    const {value} = e.target;
    setLotTextFiled(value);
    let temp = {value};
    const findLot = (edit_data.childresult || []).flatMap(i => i.oldlots || []).find(
      (i) => i.lot_number === value,
    );

    if (findLot?.lot_id && String(findLot?.status || '').toUpperCase() !== 'A') {
      temp.details = {...findLot};
      setLotInputError(false);
    } else {
      temp.details = {};
      setLotInputError(true);
    }
    currentLotDetails.current = temp;
  };

  const addMatchedLot = () => {
    if (
      matchedLot.current.length > 0 &&
      matchedLot.current.some(
        (i) => i.lot_number === currentLotDetails.current.value,
      )
    ) {
      setLotTextFiled('');
      currentLotDetails.current = {
        value: '',
        details: {},
      };
      return alert('Lot Number already Added');
    }

    const findLot = currentLotDetails.current.details;
    if (!findLot?.lot_id) {
      setLotInputError(true);
      return;
    }
    matchedLot.current = [...matchedLot.current, {...findLot}];
    let isLotAdded = false;
    setSerializedProductList((prev) =>
      prev.map((i) => {
        if (isSameItemAndCost(i, findLot) && !isLotAdded) {
          if((i.received_qty + 1) <= i.transferred_qty){
            isLotAdded = true;
            return {
              ...i,
              received_qty: i.received_qty + 1,
            };
          }else{
            return i;
          }
        } else {
          return i;
        }
      }),
    );

    setLotTextFiled('');
    currentLotDetails.current = {
      value: '',
      details: {},
    };
    lotInputRef.current.focus();
  };
  const handleup = (event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      if (!lotInputError) {
        addMatchedLot();
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleup);
    return () => {
      window.removeEventListener('keydown', handleup);
    };
  }, []);

  // const submit = () => {
  //   const groupedLots =  _.groupBy(matchedLot.current, (t) => `${t.item_id}_${t.trans_items_cost_price}`);

  //   const newChildResult = edit_data.childresult.map(i => {
  //     let lots = [];
  //     if(i.is_serialized === 0){
  //       let item = nonSerializedProductList.find(j => j.item_id === i.item_id  && i.trans_items_cost_price === j.trans_items_cost_price)
  //       if(item !== undefined){
  //         let qty = item.temp_received_qty - item.received_qty
  //         lots = i.oldlots.filter(j => j.item_id === i.item_id && i.trans_items_cost_price === j.trans_items_cost_price).slice(0, qty);
  //       }
  //     }else{
  //       lots = groupedLots[`${i.item_id}_${i.trans_items_cost_price}`] || []
  //     }
  //     return {
  //       ...i,
  //       lots,
  //       quantity: lots.length
  //     }
  //   })

  //   console.log("ppp", {newChildResult, groupedLots, nonSerializedProductList});
  //   // return;

  //   receiverLotUpdate({...edit_data, childresult: newChildResult},()=>{
  //     handleSubmit({...edit_data, childresult: newChildResult})
  //   });
  // }

  const submit = () => {
  let isValid = true;
  const validationErrors = [];

  const groupedLots = _.groupBy(matchedLot.current, (t) => `${t.item_id}_${t.trans_items_cost_price}`);

  const newChildResult = edit_data.childresult.map(i => {
    let lots = [];
    const itemKey = `${i.item_id}_${i.trans_items_cost_price}`;

    if (i.is_serialized === 0) {
      // Non-serialized product
      let item = nonSerializedProductList.find(j => isSameItemAndCost(i, j));
      if (item !== undefined) {
        const previousReceivedQty = Number(item.received_qty || 0);
        const requestedReceivedQty = Number(item.temp_received_qty || previousReceivedQty);
        const qtyToReceiveNow = Math.max(0, requestedReceivedQty - previousReceivedQty);

        if (qtyToReceiveNow > 0) {
          lots = (i.oldlots || [])
            .filter(
              j =>
                j.item_id === i.item_id &&
                (Number(i.trans_items_cost_price) === Number(j.trans_items_cost_price) ||
                  String(i.trans_items_cost_price) === String(j.trans_items_cost_price)) &&
                String(j.status || '').toUpperCase() !== 'A',
            )
            .slice(0, qtyToReceiveNow);

          if (lots.length !== qtyToReceiveNow) {
            isValid = false;
            validationErrors.push(`${i.name}: insufficient pending lots for requested received quantity.`);
          }
        }
      }
    } else {
      // Serialized product
      lots = groupedLots[itemKey] || [];
      const previousReceivedQty = Number(i.received_quantity || 0);
      const currentItemState = serializedProductList.find(
        p => isSameItemAndCost(i, p),
      );
      const requestedReceivedQty = Number(currentItemState?.received_qty ?? previousReceivedQty);
      const qtyToReceiveNow = Math.max(0, requestedReceivedQty - previousReceivedQty);

      // Validate lots: all should exist in oldlots
      const validLotNumbers = (i.oldlots || []).map(l => l.lot_number);
      const invalidLots = lots.filter(l => !validLotNumbers.includes(l.lot_number));
      const alreadyReceivedLots = lots.filter(
        l => String(l?.status || '').toUpperCase() === 'A',
      );

      if (requestedReceivedQty > Number(i.quantity || 0)) {
        isValid = false;
        validationErrors.push(`${i.name}: received quantity cannot exceed transferred quantity.`);
      }

      if (invalidLots.length > 0) {
        isValid = false;
        validationErrors.push(`${i.name}: invalid lot number selected.`);
      }

      if (alreadyReceivedLots.length > 0) {
        isValid = false;
        validationErrors.push(`${i.name}: already received lots cannot be submitted again.`);
      }

      if (lots.length !== qtyToReceiveNow) {
        isValid = false;
        validationErrors.push(`${i.name}: lot count does not match increased received quantity.`);
      }
    }

    return {
      ...i,
      lots,
      quantity: lots.length
    };
  });

  if (!isValid) {
    alert(
      `Invalid lot numbers found or missing lots for serialized products!\n${validationErrors.join('\n')}`,
    );
    return;
  }

  receiverLotUpdate({ ...edit_data, childresult: newChildResult }, () => {
    handleSubmit({ ...edit_data, childresult: newChildResult });
  });
};


  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    if(tableRef.current){
      setHeight(tableRef.current.clientHeight);
    }
  }, [tableRef.current]);



  return (
    <div>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby='alert-dialog-slide-description'
        sx={{
          "& .MuiDialog-container": {
            "& .MuiPaper-root": {
              width: "100%",
              maxWidth: "1200px",  // Set your width here
            },
          },
        }}
      >

        {/* location name */}
        <Grid
          display='flex'
          justifyContent='space-between'
          style={{padding: '20px 0px', margin: '10px 25px'}}
        >
          <Typography variant='h3' pb={1} style={{fontWeight:'bold'}}>
            Source Location : {edit_data.source_location}
          </Typography>
          <Typography variant='h3' pb={1} style={{fontWeight:'bold'}}>
            Destination Location : {edit_data.destination_location}
          </Typography>
        </Grid>


        <Grid style={{display:'flex', justifyContent:'space-between'}}>
          {/* serialized product list */}
          <Grid>
            {/* lot input field */}
            <Grid 
              ref={tableRef}
              display='flex'
              justifyContent='space-between'
              gap={4}
              alignItems='center'
              style={{padding: '20px 0px', margin: '10px 25px'}}
            >
              <TextField
                inputRef={lotInputRef}
                fullWidth
                id='standard-basic'
                label='Serial/Lot Number'
                variant='outlined'
                onChange={handleChange}
                error={lotInputError}
                value={lotTextField}
                helperText={lotInputError ? "Invalid Lot Number" : ""}
              />
              <IconButton>
                <PostAdd
                  color='primary'
                  onClick={() => {
                    if (!lotInputError) {
                      addMatchedLot();
                    }
                  }}
                />
              </IconButton>
            </Grid>
          
            <Table_1 data={serializedProductList} tableName={'lotAlreadyExistInDb'} />
          </Grid>

          {/* non serialized product list */}
          <Grid>
            <Grid style={{padding: '20px 0px', margin: '10px 25px', height: `${93.13}px`}} ></Grid>
            <Table_1 data={nonSerializedProductList} tableName={'lotAlreadyExistInDb'} nonSerializedList setNonSerializedProductList={setNonSerializedProductList}/>
          </Grid>
        </Grid>

        {/* footer action */}
        <DialogActions>
          <Button variant='contained' color='secondary' onClick={handleClose}>
            Close
          </Button>
          <Button variant='contained' onClick={submit}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function Table_1({data, nonSerializedList, setNonSerializedProductList}) {
  const isSameItemAndCost = (a, b) => {
    const sameItem = String(a?.item_id) === String(b?.item_id);
    const aCost = a?.trans_items_cost_price;
    const bCost = b?.trans_items_cost_price;
    const sameCost =
      Number(aCost) === Number(bCost) || String(aCost) === String(bCost);
    return sameItem && sameCost;
  };
  // const [productData, setProductData] = useState(data)
  return (
    <Grid
      style={{
        margin: '10px 25px',
        width: '500px',
        height: 'calc(min(50vh, 400px))',
      }}
    >
      <Typography variant='h6' pb={1}>
        {'Product List'}
      </Typography>
      <table
        style={{
          border: '1px solid',
          fontSize: cellStyle.fontSize,
          borderCollapse: 'collapse',
          padding: '0px 5px',
          width: '100%',
          paddingBottom: '10px',
        }}
      >
        <tr>
          <th style={{border: '1px solid', width: '50%'}}>Product Name</th>
          <th style={{border: '1px solid', width: '10%'}}>Cost Price</th>
          <th style={{border: '1px solid', width: '20%'}}>
            Transferred Quantity
          </th>
          <th style={{border: '1px solid', width: '20%'}}>Received Quantity</th>
        </tr>
        {data.map((d, i) => (
          <tr key={i}>
            <td style={{border: '1px solid', padding: '0px 5px'}}>{d.name}</td>
            <td style={{border: '1px solid', padding: '0px 5px', textAlign: 'right',}}>{d.trans_items_cost_price}</td>
            <td
              style={{
                border: '1px solid',
                padding: '0px 5px',
                textAlign: 'center',
              }}
            >
              {d.transferred_qty}
            </td>
            {nonSerializedList ? (
              <td
                style={{
                  border: '1px solid',
                  padding: '0px 5px',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                {/* <div contentEditable>Im editable</div> */}
                <input
                  value={d.temp_received_qty}
                  type="number"
                  style={{width:'100%', border:'none', textAlign:'center' }}
                  min={d.received_qty}
                  max={d.quantity}
                  onChange={e => {
                    const {value : n} = e.target

                    if(n < 0 || n > d.transferred_qty) return;
                    let isLotAdded = false;
                    // return
                    setNonSerializedProductList(prev => prev.map(i => {
                      if(isSameItemAndCost(i, d) && !isLotAdded){
                        if(n <= i.transferred_qty || i.temp_received_qty !== i.transferred_qty ){
                          isLotAdded = true;
                          return {...i, temp_received_qty: +n}
                        }else{
                          return i;
                        }
                      }else{
                        return i
                      }
                    }))
                  }} 
                />  
                {/* {d.received_qty}non */}
              </td>
            ) : (
              <td
                style={{
                  border: '1px solid',
                  padding: '0px 5px',
                  textAlign: 'center',
                }}
              >
                {d.received_qty}
              </td>
            )}
          </tr>
        ))}
      </table>
    </Grid>
  );
}

