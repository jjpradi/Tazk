import React, {useContext, useEffect, useMemo, useState} from 'react';
import {
  Button,
  Grid,
  Autocomplete,
  TextField,
  Typography,
  Snackbar,
  SnackbarContent,
  Alert,
  ListItemText,
  List,
  ListItem,
  ListItemButton,
  IconButton,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  DialogContentText,
  Box,TablePagination
} from '@mui/material';
import {
  getStickyTableOptions,
  stickyTableComponents,
} from 'utils/stickyTableLayout';
import {connect, useDispatch, useSelector} from 'react-redux';
// import {
//   createFuelPriceAction,
//   getTravelDetailsAction,
//   getFuelPriceListAction,
//   getSalesManListAction,
//   deleteFuelPriceListAction,
//   getAllowanceListAction,
// } from 'redux/actions/fuelAllowance_actions';
import {
  getPriceListAction,
  getProductPriceListAction,
  getProductListAction,
  createPriceListAction,
  updatePriceListAction,
  deletePriceListAction,
  priceListPaginationAction,
  searchPriceListAction,
  searchPriceListState,
} from 'redux/actions/priceList_actions';
import PriceListReducer from '../../../redux/reducers/priceList_reducers';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import moment from 'moment';
import _ from 'lodash';
import {Select, MenuItem} from '@mui/material';
import * as XLSX from 'xlsx-js-style';
import CloseIcon from '@mui/icons-material/Close';
import ProductPriceListMapping from './productPriceList/ProductPriceListMapping';
import PriceListCustomerMapping from '../PriceListCustomerMapping'
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle,font14_500 } from 'utils/pageSize';
import CommonSearch from 'utils/commonSearch';
import { titleURL } from 'http-common';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
// import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

const EXTENSIONS = ['xlsx', 'xls', 'csv'];

export default function FuelAllowance() {
  const dispatch = useDispatch();
  const sessionStorage = getsessionStorage()
  const {
    PriceListReducer: { price_list, product_price_list, product_list, searchPriceListData, searchPriceListCount },
    roleReducer : { user_rights } ,
    rbacReducer: { menuAccess } 
  } = useSelector((state) => state);
  const [state, setState] = useState({
    searchVal: '',
    count: 0,
    page: 0,
    pageSize: pageSize
  });

  const [selectedRow, setSelectedRow] = useState([]);
  const [open, setOpen] = useState(false);
  const [custMapOpen, setCustMapOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [data, setData] = useState();
  const [duplicateItems, setDuplicateItems] = useState([]);
  const [colDefs, setColDefs] = useState();
  
  const [toastDetails, setToastDetails] = useState({
    open: false,
    message: '',
    color: '',
  });
  const [priceList, setPriceList] = useState([]);
  const [productPriceList, setProductPriceList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [fuelType, setFuelType] = useState(['petrol', 'disel', 'gas']);
  const [currentPage, setCurrentPage] = useState(0);
  const [editPriceList, setEditPriceList] = useState([]);
  const {setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId} = useContext(
    CreateNewButtonContext,
  );
  const [listProductData, setListProductData] = useState([]);
  const [isApiFinished, setIsApiFinished] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

  //   const {
  //     fuelAllowanceReducer: {fuelPriceList, salesManList, travelDetails},
  //   } = useSelector((state) => state);



  useEffect(() => {
    // dispatch(getPriceListAction(setModalTypeHandler, setLoaderStatusHandler));
    // dispatch(getProductListAction('product',setModalTypeHandler, setLoaderStatusHandler));
   let data ={
    min_price: '', max_price: ''
   }
    
    const body = {
      pageCount: 0,
      numPerPage: state.pageSize,
      searchString: '',
      employeeId: commoncookie,
      headerLocationId: headerLocationId
    }
    
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      // dispatch(priceListPaginationAction(body)),
      // dispatch(getPriceListAction(setModalTypeHandler, setLoaderStatusHandler)),
      dispatch(getProductListAction('product', data, setModalTypeHandler, setLoaderStatusHandler)),
      // dispatch(getUserRightsByRoleIdAction())
    );

  }, []);


    const selectedRole = sessionStorage.role_name
    useEffect(() => {
      if (!selectedRole) return;
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler, dispatch(getMenuAccessAction(selectedRole)));
    }, [selectedRole, dispatch]);
  
    const priceListCreate = sessionStorage.company_type === 3 || sessionStorage.company_type === 2 ? UserRightsAuthorization(menuAccess[selectedRole], 'sales__customer_price_list', 'can_create') : true;
    const priceListEdit = sessionStorage.company_type === 3 || sessionStorage.company_type === 2 ? UserRightsAuthorization(menuAccess[selectedRole], 'sales__customer_price_list', 'can_edit') : true;
    const priceListDelete = sessionStorage.company_type === 3 || sessionStorage.company_type === 2 ? UserRightsAuthorization(menuAccess[selectedRole], 'sales__customer_price_list', 'can_delete') : true;


  useEffect(() => {
    let priceListData = searchPriceListData;
    setPriceList(priceListData);
  }, [searchPriceListData]);

  useEffect(() => { (async () => {

    await setListProductData(product_list)
  })();
},[product_list])

  const handleStatusFilter = (type, data) => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getProductListAction(type, data, setModalTypeHandler, setLoaderStatusHandler))
    );
  }

  useEffect(() => {
    setProductPriceList(product_price_list);
    let newArray = product_list?.filter(
      (i) => !product_price_list?.some((j) => j.product_id === i.product_id),
    );
    setProductList(newArray);
  }, [product_price_list]);

  const initialState= async ()=>{
    let data ={
      min_price: '', max_price: ''
     }
     await dispatch(getProductListAction('product', data, setModalTypeHandler, setLoaderStatusHandler))  
  }


  const handleSubmit = (MDetails, SRow,fromDate,toDate) => {
    // console.log('SRow.id', SRow);
    // console.log('fromsafsdfds',fromDate,toDate)
    //Update price list
    if (SRow.id) {
      const tempObj = {
        itemPrice: MDetails.map(({product_id, unit_price, discount_type, discount_value, discount_price}) => ({
          product_id,
          unit_price,
          discount_type,
          discount_value, 
          discount_price
        })),
        priceList: {
          price_list_name: SRow.price_list_name,
          filterId: SRow.filterId,
          id: SRow.id,
          createdAt: SRow.createdAt,
          modifiedAt: SRow.modifiedAt,
          fromDate : SRow.fromDate,
          toDate : SRow.toDate
        },
        numPerPage: state.pageSize,
        pageCount: state.page,
        searchString : state.searchVal
      };

      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          updatePriceListAction(
            tempObj,
            SRow.id
          ),
        )
      );
    } else {
      // create new price list
      const tempObj = {
        itemPrice: MDetails.map(({product_id, unit_price, discount_type,discount_value, discount_price}) => ({
          product_id,
          unit_price,
          discount_type,
          discount_value, 
          discount_price
        })),
        fromDate : fromDate,
        toDate : toDate,
        priceList: {
          price_list_name: SRow.price_list_name,
        },
        numPerPage: state.pageSize,
        pageCount: state.page,
        searchString : state.searchVal
      };

      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          createPriceListAction(
            tempObj,
            setModalTypeHandler,
            setLoaderStatusHandler,
          ),
        )
      );
    }

    setOpen(!open);
    setCustMapOpen(false);
  };

  const importExcel = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      //parse data
      const bstr = event.target.result;
      const workBook = XLSX.read(bstr, {type: 'binary'});

      //get first sheet
      const workSheetName = workBook.SheetNames[0];
      const workSheet = workBook.Sheets[workSheetName];

      const fileData = XLSX.utils.sheet_to_json(workSheet, {
        header: 1,
        raw: false,
      });

      const headers = fileData[0];
      const heads = headers.map((head) => ({title: head, field: head}));
      setColDefs(heads);

      fileData.splice(0, 1);
      let data = convertToJson(headers, fileData);

      //check duplicate item in table and excel
      let duplicateArr = data?.filter(
        (i) => !productList?.some((j) => j.product_id === i.product_id),
      );
      setDuplicateItems(duplicateArr);

      if (duplicateArr.length === 0) {
        let newArray = product_list?.filter(
          (i) => !data?.some((j) => j.product_id === i.product_id),
        );

        setProductList(newArray);
        setProductPriceList(data);
      }

      //   if (tempData === 'Invalid file') {
      //     setToastDetails({
      //       open: true,
      //       color: '#ff474e',
      //       message: 'Invalid File',
      //     });
      //     setData([]);
      //   } else if (tempData.length === 0) {
      //     setToastDetails({
      //       open: true,
      //       color: '#f5bf42',
      //       message: 'No transaction found',
      //     });
      //     setData([]);
      //   } else {
      //     setToastDetails({
      //       open: true,
      //       color: '#2ec754',
      //       message: 'Imported Successfully',
      //     });
      //     setData(tempData);
      //   }
    };

    if (file) {
      if (getExtension(file)) {
        reader.readAsBinaryString(file);
      } else {
        alert('Invalid file input , Select Excel or CSV file');
      }
    } else {
      setData([]);
      setColDefs([]);
    }
  };

  const getExtension = (file) => {
    const parts = file.name.split('.');

    const extension = parts[parts.length - 1];

    return EXTENSIONS.includes(extension);
  };

  const handleEdit = async (data) => {
    await setOpen(true);
    if(data.filterId === 3 && data.filterId !== undefined){
      const editData = {
        "Category": data.productData,
        "model": null,
        "name":data.productData[0]?.brand,
        "product_id":data.productData[0]?.product_id,
        "filterId": data.filterId,
        "price_list_name": data.price_list_name
      }
      await setEditPriceList([editData]);
      await setListProductData([editData]);
    }else{
      await setEditPriceList([data]);
      await setListProductData(product_list);
    }
    
  }

  const convertToJson = (headers, data) => {
    const rows = [];
    data.forEach((row) => {
      let rowData = {};
      row.forEach((element, index) => {
        let key = headers[index].replace(' ', '_').toLowerCase();

        if (key === 'product_id' || key === 'unit_price') {
          rowData[key] = parseInt(element);
        } else {
          rowData[key] = element;
        }
      });
      rows.push(rowData);
    });
    return rows;
  };


  const handleClose = async () => {
    setOpen(false)
    // await initialState()
  }
  const close = () =>{
    setCustMapOpen(false)
  } 

  const handleCreate= async ()=>{
    setOpen(true), 
    setCustMapOpen(false);
    setStatus('New');
    setEditPriceList([]);
    // await initialState()
  }

  useEffect(() => {
    dispatch(searchPriceListState({ data: [], numRows: 0 }))
    const body = {
      pageCount: state.page,
      numPerPage: state.pageSize,
      searchString: state.searchVal,
      employeeId: commoncookie,
      headerLocationId: headerLocationId
    }

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(priceListPaginationAction(body))
    ).finally(() => setIsApiFinished(true))

  },[state.page, state.pageSize])

  const handlePageSizeChange = async (size) => {
    setState({ ...state, pageSize: size })
  }

  const handlePageChange = async (page) => {
    setState({ ...state, page: page })
  }

  const requestSearch = (e) => {
    let val = e.target.value;
    setState({ ...state, searchVal: val, page : 0 });

    if(val.length >= 3 || val.length === 0) {
      dispatch(searchPriceListState({ data: [], numRows: 0 }))
    }

    const body = {
      pageCount: state.page,
      numPerPage: state.pageSize,
      searchString: val,
      employeeId: commoncookie,
      headerLocationId: headerLocationId
    }
    dispatch(searchPriceListAction(body, setModalTypeHandler, setLoaderStatusHandler))
  };

  const cancelSearch = (e) => {
    setState({ ...state, page: 0, searchVal: '' });
    dispatch(searchPriceListState({ data: [], numRows: 0 }))

    const body = {
      pageCount: state.page,
      numPerPage: state.pageSize,
      searchString: '',
      employeeId: commoncookie,
      headerLocationId: headerLocationId
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(priceListPaginationAction(body))
    );
  };

  const handleConfirmDelete = () => {
    if (selectedRowData?.id) {
      const data = {
        pageCount: state.page,
        numPerPage: state.pageSize,
        searchString: state.searchVal,
        employeeId: commoncookie,
        headerLocationId: headerLocationId,
        id: selectedRowData.id,
      };

      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          deletePriceListAction(
            data,
            setModalTypeHandler,
            setLoaderStatusHandler,
          )
        )
      );
    } else {
      const dataDelete = [...priceList];
      const index = selectedRowData.tableData.id;
      dataDelete.splice(index, 1);
      setPriceList([...dataDelete]);
    }

    setOpenConfirmDialog(false);
    setSelectedRowData(null);
  };

    // const CPLAdd = sessionStorage.company_type === 3 || sessionStorage.company_type === 2 ? getRoleAuthorization(user_rights, 'PriceListAdd') : false;
    // const CPLEdit = sessionStorage.company_type === 3 || sessionStorage.company_type === 2 ? getRoleAuthorization(user_rights, 'PriceListEdit') : false;
    // const CPLDelete = sessionStorage.company_type === 3 || sessionStorage.company_type === 2 ? getRoleAuthorization(user_rights, 'PriceListDelete') : false;

  return (
    <>
      <Helmet>
                 <meta charSet="utf-8" />
                 <title> {titleURL} | PriceList </title>
      </Helmet>
      <Grid container spacing={3}>
        {/* {!open ? ( */}
        <Grid
          xx={12}
          size={{
            lg: 12,
            md: 12,
            sm: 12
          }}>
          {open === false && custMapOpen === false && (
            <MaterialTable
              style={{height: 'calc(100vh - 80px)',overflow:'hidden'}}
              totalCount={searchPriceListCount || 0}

              components={{
                ...stickyTableComponents,
                 Pagination: (props) => (
                 <div
                 style={{
                   display: "flex",
                   justifyContent: "flex-end",
                   alignItems: "center",
                   padding: "8px 16px",}}>
                    <TablePagination
                    {...props}
                    count={searchPriceListCount || 0} 
                    page={state.page}
                    onPageChange={(event, page) => handlePageChange(page)}
                    onRowsPerPageChange={(event) => handlePageSizeChange(event.target.value)}/></div>
                  ),
                Toolbar: (props) => (
                  <>
                    <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                      <div style={{ width: '100%' }} >
                        <MTableToolbar {...props} />
                      </div>
                      <div>
                        <CommonSearch
                        searchVal={state.searchVal}
                        cancelSearch={cancelSearch}
                        requestSearch={requestSearch}
                        />
                      </div>
                    </div>
                  </>
                ),
              }}
              editable={{
               //   // onRowAdd: (newRow) =>
              //   //   new Promise((resolve, reject) => {
              //   //     // setPriceList([...priceList, newRow]);
              //   //     setOpen(true)
              //   //     setTimeout(() => resolve(), 500);
              //   //   }),

              //   onRowUpdate: (newRow, oldRow) =>
              //     new Promise((resolve, reject) => {
              //       setOpen(true);
              //       // if (oldRow.id) {
              //       //   const updatedData = [...priceList];
              //       //   updatedData[
              //       //     updatedData.findIndex((x) => x.id === oldRow.id)
              //       //   ] = newRow;
              //       //   setEditPriceList(updatedData);
              //       //   setPriceList(updatedData);
              //       //   setTimeout(() => resolve(), 500);
              //       // } else {
              //       //   const updatedData = [...priceList];
              //       //   updatedData[oldRow.tableData.id] = newRow;
              //       //   setEditPriceList(updatedData);
              //       //   setPriceList(updatedData);
              //       //   setTimeout(() => resolve(), 500);
              //       // }
              //     }),
                // onRowDelete: (oldData) =>
                //   new Promise((resolve, reject) => {
                //     setTimeout(() => {
                //       if (oldData.id) {
                //         const data = {
                //           pageCount: state.page,
                //           numPerPage: state.pageSize,
                //           searchString: state.searchVal,
                //           employeeId: commoncookie,
                //           headerLocationId: headerLocationId,
                //           id : oldData.id
                //         }
                //         apiCalls(
                //           setModalTypeHandler,
                //           setLoaderStatusHandler,
                //           dispatch(
                //             deletePriceListAction(
                //               data,
                //               setModalTypeHandler,
                //               setLoaderStatusHandler,
                //             ),
                //           )
                //         );
                //         resolve();
                //       } else {
                //         const dataDelete = [...priceList];
                //         const index = oldData.tableData.id;
                //         dataDelete.splice(index, 1);
                //         setPriceList([...dataDelete]);
                //         resolve();
                //       }
                //     }, 1000);
                //   }),
              }}
              actions={[
                priceListCreate ? {
                  icon: 'add',
                  tooltip: 'add',
                  isFreeAction: true,
                  onClick: (event, rowData) => {
                    handleCreate()
                  },
                } : null,
                
               // (rowData) => ({
                //   icon: () => (
                //     // <div style={{display: 'flex'}}>
                //     <IconButton sx={{borderRadius: '10px'}}>
                //       <Typography variant='h1' color='primary'>Customer Mapping</Typography>
                //     </IconButton>
                //     // </div>
                //   ),
                //   onClick: (event, rowData) => {
                //     setCustMapOpen(true);
                //     // setOpen(true);
                //     setSelectedRow(rowData);

                //     // if (rowData.id) {
                //     //   dispatch(
                //     //     getProductPriceListAction(
                //     //       rowData.id,
                //     //       setModalTypeHandler,
                //     //       setLoaderStatusHandler,
                //     //     ),
                //     //   );
                //     // } else {
                //     //   setProductList(product_list);
                //     //   setProductPriceList([]);
                //     // }
                //   },
                //   tooltip: 'Match',
                //   isFreeAction: false,
                // }),
                // {
                //   icon: 'edit',
                //   tooltip: 'edit',
                //   position: 'row',
                //   onClick: (event, rowData) => handleEdit(rowData),
                // },
                // (rowData) => ({
                //   icon: () => (
                //     <div style={{display: 'flex'}}>
                //       <Typography color='primary'>
                //         {rowData.id ? 'View' : 'Generate'}
                //       </Typography>
                //     </div>
                //   ),
                //   onClick: (event, rowData) => {
                //     setOpen(true);
                //     // setSelectedRow(rowData);

                //     // if (rowData.id) {
                //     //   dispatch(
                //     //     getProductPriceListAction(
                //     //       rowData.id,
                //     //       setModalTypeHandler,
                //     //       setLoaderStatusHandler,
                //     //     ),
                //     //   );
                //     // } else {
                //     //   setProductList(product_list);
                //     //   setProductPriceList([]);
                //     // }
                //   },
                //   tooltip: 'Match',
                //   isFreeAction: false,
                // }),
              ]}
              onPageChange={(page) => handlePageChange(page)}
              onRowsPerPageChange={(size) => handlePageSizeChange(size)}
              options={getStickyTableOptions({
                bodyOffset: 200,
                 headerStyle,
                options:{
                   rowStyle: {
                  transition: 'background-color 0.3s ease',
                },
                initialPage: currentPage,
                 cellStyle,  
                search: false,
                exportButton: true,
                filtering: false,
                 toolbar: true,
                actionsColumnIndex: -1,
                 tableLayout: "auto",
                showEmptyDataSourceMessage : isApiFinished,
                  pageSizeOptions: [20, 50, 100],
                   pageSize: pageSize,
                totalCount: searchPriceListCount || 0,
                },
              })}
              page={state.page}
              columns={[
                {
                  title: 'Price List Name',
                  field: 'price_list_name',
                  validate: (rowData) => Boolean(rowData.price_list_name),
                },
                {
                  title: 'Created Date',
                  field: 'createdAt',
                  editable: 'never',
                  //   editComponent: ({value, onChange, rowData}) => (
                  //     <Select
                  //       value={value}
                  //       label='Choose fuel'
                  //       onChange={(event) => {
                  //         onChange(event.target.value);
                  //       }}
                  //     >
                  //       {fuelType.map((item) => (
                  //         <MenuItem key={item} value={item}>
                  //           {item}
                  //         </MenuItem>
                  //       ))}
                  //     </Select>
                  //   ),
                },
                {
                  title: 'Expiry Date',
                  field: 'toDate',
                  editable: 'never',
                  render: (rowData) => {
                    if (!rowData || !rowData.toDate) return '';
                    return moment(rowData.toDate, 'YYYY-MM-DD').format('DD/MM/YYYY');
                  }
                },
                {
                  title: 'Modified Date',
                  field: 'modifiedAt',
                  editable: 'never',
                },
                {
                  title: 'Status',
                  field: 'isExpired',
                  render: (rowData) => {

                    let color

                    if(rowData.isExpired === 0){
                      color = 'green'
                    }
                    else {
                      color = 'red'
                    }
                    return (
                      <Chip
                        label = {rowData.isExpired === 0 ? 'Active' : 'Expired'}
                        style = {{backgroundColor: color}}
                      />
                    )
                  }
                },
                {
                  field: 'action',
                  title: 'Actions',
                  render: (rowData) => (
                    <Box display="flex" alignItems="center" gap={1}>
                    <Button
        onClick={(e) => {
          e.stopPropagation(); // Stops the table row from clicking itself
          setSelectedRow(rowData); 
          setCustMapOpen(true);
        }}
        sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
      >
        Customer Mapping
      </Button>

                     {priceListEdit && (
        <IconButton 
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(rowData); // This needs to be a function in your main component
          }} 
        >
          <EditIcon fontSize="small" />
        </IconButton>
      )}

                      {priceListDelete && (
                        <IconButton
                          onClick={() => {
                            setSelectedRowData(rowData);
                            setOpenConfirmDialog(true);
                          }}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      )}
                      <Dialog
                        open={openConfirmDialog}
                        onClose={() => setOpenConfirmDialog(false)}
                      >
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogContent>
                          <DialogContentText>
                            Are you sure you want to delete this Price list?
                          </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
                            Cancel
                          </Button>
                          <Button onClick={handleConfirmDelete} color="secondary">
                            OK
                          </Button>
                        </DialogActions>
                      </Dialog>
                   </Box>
                  )
                }
              ]}
              
              title={
                <Typography
                  variant='h6'
                  align='left'
                  style={{paddingTop: '10px', paddingBottom: '10px'}}
                >
                  Price List
                </Typography>
              }
              data={searchPriceListData}
              // data={priceList.filter((f) => f.price_list_name !== "Default")}
            />
          )}
          {open === true && custMapOpen === false && (
            <ProductPriceListMapping
              status={status}
              handleClose={handleClose}
              handleStatusFilter={handleStatusFilter}
              product_list={listProductData}
              handleSubmit={handleSubmit}
              editPriceList={editPriceList}
              price_list={searchPriceListData}
            />
          )}
          {custMapOpen && (
            <PriceListCustomerMapping
              selectedRow={selectedRow}
              customerMapClose={() => setCustMapOpen(false)}
            />
          )}
        </Grid>
        {/* ) : ''} */}
      </Grid>
    </>
  );
}

