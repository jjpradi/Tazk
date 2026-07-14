import React, {Component} from 'react';
//import NewCustomer from '../../components/Customer';
import {connect} from 'react-redux';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import NewStockLocation from '../../../components/NewStockLocation';
import {
  listStockLocationAction,
  updateStockLocationAction,
  getbyidStockLocationAction,
  deleteStockLocationAction,
  createStockLocationAction,
  location_typeAction,
  getsourcelocationAction,
  set_SearchlocationAction,
  get_SearchlocationAction,
  stockLocationPaginationAction
} from '../../../redux/actions/stock_Location_actions';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import Cookies from 'universal-cookie';
import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle,font14_500 } from 'utils/pageSize';
import {listUserlocationsAction} from '../../../redux/actions/userCreation_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CommonSearch from 'utils/commonSearch';
import DefaultLocationAlert from 'components/defaultLocationAlert';
import { titleURL } from 'http-common';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import { restrictNewCreationBasedOnPlanAction } from 'redux/actions/subscription_action';
import { getStickyTableOptions, stickyTableComponents } from 'utils/stickyTableLayout';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

const commonCellStyle = {
  fontFamily: "poppins",
  fontSize: "11px",
  fontWeight: "400",
  color: 'rgba(0, 0, 0, 0.7)',
};

class StockLocation extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.state = {
      stock_location_data: [],
      open: false,
      edit_id_data: [],
      dialog: {open: false, msg: '', severity: ''},
      status: '',
      delete: false,
      deleteDefaultLocation: false,
      id: '',
      searchVal: '',
      count: 0,
      page: 0,
      pageSize: 20,
      isApiFinished: false,
      rowData: null,
      newDefaultLocation : ''
    };
    this.cookies = new Cookies();
  }
  storage = getsessionStorage();
  //modules = this.storage?.employee_id || ''

  // async componentDidMount() {
  //   this.props.set_SearchlocationAction({data:[], numRows:0});
  //   const context = this.context;
  //   apiCalls(
  //     context.setModalTypeHandler,
  //     context.setLoaderStatusHandler,
  //     this.props.listStockLocationAction(
  //       context.commoncookie,
  //       context.headerLocationId,
  //       context.setModalTypeHandler,
  //       context.setLoaderStatusHandler,
  //     ),
  //     await this.props.getsourcelocationAction(),
  //     await this.props.location_typeAction(context.setLoaderStatusHandler)

  //   );
  //   await this.setState({stock_location_data: this.props.stocklocation});
  //   if (this.props.setModalStatusHandler) this.setState({open: true});
  // }

  async componentDidMount() {
    this.props.set_SearchlocationAction({ data: [], numRows: 0 })
    const context = this.context;

    const body = {
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: '',
      employeeId: context.commoncookie,
      headerLocationId: context.headerLocationId
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.stockLocationPaginationAction(body)
    ).finally(() => this.setState({isApiFinished: true}))

    await this.props.location_typeAction()
    await this.props.restrictNewCreationBasedOnPlanAction()

    // if (!this.props.stocklocation.length) {
    //   this.props.listStockLocationAction(context.commoncookie, context.headerLocationId)
    // }
  }

  headerUpdate = null;
  async componentDidUpdate(prevProps, prevState) {
    const context = this.context;
    
//     if (context.headerLocationId !== this.headerupdate) {
//       this.headerupdate = context.headerLocationId;
// //............................................................
//       this.props.set_SearchlocationAction({ data: [], numRows: 0 })

//       const body = {
//         pageCount: 0,
//         numPerPage: pageSize,
//         searchString: '',
//         employeeId: context.commoncookie,
//         headerLocationId: context.headerLocationId
//       }
//       apiCalls(
//         context.setModalTypeHandler,
//         context.setLoaderStatusHandler,
//         this.props.stockLocationPaginationAction(body)
//       )
//       // apiCalls(
//       //   context.setModalTypeHandler,
//       //   context.setLoaderStatusHandler,
//       //   await this.props.listStockLocationAction(
//       //     context.commoncookie,
//       //     context.headerLocationId,
//       //     context.setModalTypeHandler,
//       //     context.setLoaderStatusHandler,
//       //   ),

//       // );
//     }

    // page size
    if (prevState.pageSize !== this.state.pageSize) {

      this.props.set_SearchlocationAction({ data: [], numRows: 0 })

      const body = {
        pageCount: 0,
        numPerPage: this.state.pageSize,
        searchString: this.state.searchVal,
        employeeId: context.commoncookie,
        headerLocationId: context.headerLocationId
      }
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.stockLocationPaginationAction(body)
      )
    }

    // page 
    if (prevState.page !== this.state.page) {

      this.props.set_SearchlocationAction({ data: [], numRows: 0 })

      const body = {
        pageCount: this.state.page,
        numPerPage: this.state.pageSize,
        searchString: this.state.searchVal,
        employeeId: context.commoncookie,
        headerLocationId: context.headerLocationId
      }
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.stockLocationPaginationAction(body)
      )
    }
  }

  handlePageSizeChange = async (size) => {
    this.setState({ pageSize: size })
    // const context = this.context;

    // const body = {
    //   pageCount: this.state.page,
    //   numPerPage: size,
    //   searchString: this.state.searchVal,
    //   employeeId: context.commoncookie,
    //   headerLocationId: context.headerLocationId
    // }
    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   this.props.stockLocationPaginationAction(body)
    // )
  }
  handlePageChange = async (page) => {
    this.setState({ page: page })
    
    // const context = this.context;
    // const body = {
    //   pageCount: page,
    //   numPerPage: this.state.pageSize,
    //   searchString: this.state.searchVal,
    //   employeeId: context.commoncookie,
    //   headerLocationId: context.headerLocationId
    // }
    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   this.props.stockLocationPaginationAction(body)
    // )
  }

  handleEdit = async (id) => {
    const context = this.context;

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.getbyidStockLocationAction(
        id,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      )
	  );
    this.setState({open: true, status: 'edit'});
  };
  handleDelete = async (id) => {
    const context = this.context;
    const body = {
      pageCount: this.state.page,
      numPerPage: this.state.pageSize,
      searchString: this.state.searchVal,
      employeeId: context.commoncookie,
      headerLocationId: context.headerLocationId
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.deleteStockLocationAction(
        id,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      )
    ).then((res) => {
      context.setHeaderLocationIdHandeler('null')
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.stockLocationPaginationAction(body)
      )
      //  this.props.getsourcelocationAction()
      //  this.props.listUserlocationsAction(this.storage?.employee_id,
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler)
    })
    this.setState({delete: false});
  };


  handleConfirmDelete = (rowData) => {
    console.log('YYUYU',rowData);
    const context = this.context;

    console.log('fdfijgjtjtj', context);
    if (rowData.locationTypeName !== 'Default Location') {
      this.setState({ delete: true, id: rowData.location_id });
    } else {
      this.setState({ deleteDefaultLocation: true, rowData: rowData })
    }
  }


  handledialog = (id) => {
    this.setState({delete: true, id: id});
  };
  handleClose = (id) => {
    if (this.props.setModalStatusHandler) {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('stockLocation', false);
    }
    this.setState({open: false, dialog: false, delete: false});
  };
  responseDialog = async (res, resSeverity) => {
    if (this.props.setModalStatusHandler && res === 'Created SuccessFully') {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('stockLocation', true);
    }
    await this.setState({
      ...this.state.dialog,
      dialog: {msg: res, severity: resSeverity, open: true},
    });
  };

  sample = async (value) => {
    const context = this.context;
    await this.setState({open: value});

    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   this.props.listStockLocationAction(
    //     context.commoncookie,
    //     context.headerLocationId,
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //   ),
    //   this.props.listUserlocationsAction(context.commoncookie,context.setModalTypeHandler,
    //     context.setLoaderStatusHandler)
	  // );
    if (this.props.setModalStatusHandler) {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('stocklocation', true);
    }
  };

  handleDefaultClose = () => {
    this.setState({ deleteDefaultLocation: false })
  }

  handleSubmit = async (data) => {


    const context = this.context;
    this.setState({page : data.location_id ? this.state.page : 0 })
    const body = {
      pageCount: data.location_id ? this.state.page : 0,
      numPerPage: this.state.pageSize,
      searchString: this.state.searchVal,
      employeeId: context.commoncookie,
      headerLocationId: context.headerLocationId
    }
    if (data.location_id) {
      // const {location_name} = data
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.updateStockLocationAction(
          data.location_id,
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.sample,
        )
      ).then((res) => {
        // this.props.listUserlocationsAction(this.storage?.employee_id,
        //   context.setModalTypeHandler,
        //   context.setLoaderStatusHandler)
        //  this.props.getsourcelocationAction()
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.stockLocationPaginationAction(body),
          this.props.location_typeAction(),
          this.props.listStockLocationAction(context.commoncookie, context.headerLocationId)
        )
      }).finally(() => this.setState({isApiFinished: true}))
      //
    } else {

      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.createStockLocationAction(
          data,
          context.commoncookie,
          context.headerLocationId,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.sample,
        )
      ).then((res) => {
        // this.props.listUserlocationsAction(this.storage?.employee_id,
        //   context.setModalTypeHandler,
        //   context.setLoaderStatusHandler)
      //  this.props.getsourcelocationAction()``
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.stockLocationPaginationAction(body),
         this.props.location_typeAction(),
        this.props.listStockLocationAction(context.commoncookie, context.headerLocationId)
      )
        
      }).finally(() => this.setState({isApiFinished: true}))
    }
    // if (this.props.setModalStatusHandler) {
    //   this.props.setModalStatusHandler(false)
    //   this.props.setselectData('stockLocation', false)
    // }
  };

  cancelSearch = (e) => {
    const context = this.context;
    this.setState({ page: 0, searchVal: '' });
    this.props.set_SearchlocationAction({ data: [], numRows: 0 })

    const body = {
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: '',
      employee_id: context.commoncookie,
      headerLocationId: context.headerLocationId
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.stockLocationPaginationAction(body)
    )
  };

  requestSearch = (e) => {
    const context = this.context;
    let val = e.target.value;
    this.setState({ searchVal: val });

    this.props.set_SearchlocationAction({ data: [], numRows: 0 })

    const body = {
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: val.trim(),
      employee_id: context.commoncookie,
      headerLocationId: context.headerLocationId
    }
    this.props.get_SearchlocationAction(
      body,
      context.setModalTypeHandler,
      context.setLoaderStatusHandler
    )
  };

  setDefaultFunc = (val) => {
    console.log('RTRT',val);
  }
  render() {
    const selectedRole = this.storage.role_name
    const locationCreate = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'info__locations', 'can_create')
    const locationEdit = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'info__locations', 'can_edit')
    const locationDelete = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'info__locations', 'can_delete')
    const locationExport = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'info__locations', 'can_export')

    return (
      <>
       <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | Locations </title>
      </Helmet>
        <CreateNewButtonContext.Consumer>
          {({setModalStatusHandler, setModalTypeHandler, drawerOpen, commoncookie,
      headerLocationId,
      setLoaderStatusHandler,}) => (
            <div
              // style={{
              //   width: drawerOpen
              //     ? 'calc(100vw - 325px)'
              //     : 'calc(100vw - 143px)',
              // }}
            >
              <AlertDialog
                delete={this.state.delete}
                handleClose={this.handleClose}
                handleDelete={this.handleDelete}
                id={this.state.id}
              />
              {this.state.open === false && (
                <MaterialTable
                totalCount={this.props.search_location_count || 0}
                components={{
                  ...stickyTableComponents,
                  Toolbar: (props) => (
                    <div>
                      {/* <span style={{ paddingLeft: "100px" }}> */}
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
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                  
                          <CommonSearch
                            searchVal={this.state.searchVal}
                            cancelSearch={this.cancelSearch}
                            requestSearch={this.requestSearch}
                          />
                          <Tooltip title="Close">
                          <IconButton onClick={this.handleClose} sx={{ color: 'gray' }}>
                            {/* <CloseIcon /> */}
                          </IconButton>
                          </Tooltip>
                            {/* <TextField
                              autoFocus={this.state.searchVal ? true : false}
                              sx={{
                                borderRadius: '8px',
                                pr: '10px',
                                '& .MuiOutlinedInput-root': {
                                  height: '42px',
                                },
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position='start'>
                                    <SearchIcon />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <InputAdornment position='end'>
                                    <ClearIcon
                                      onClick={this.cancelSearch}
                                      sx={{cursor: 'pointer'}}
                                    />
                                  </InputAdornment>
                                ),
                              }}
                              placeholder='Search'
                              value={this.state.searchVal}
                              onChange={this.requestSearch}
                            /> */}
                          </div>
                        </div>
                    </div>
                  ),
                }}

                  actions={[
                    locationEdit ? {
                      icon: 'edit',
                      tooltip: 'edit',
                      position: 'row',
                      onClick: (event, rowData) =>
                        this.handleEdit(rowData.location_id),
                    } : null,
                    locationDelete ? {
                      icon: 'delete',
                      tooltip: 'Delete',
                      onClick: (event, rowData) =>
                        this.handleConfirmDelete(rowData),
                    } : null,
                    (locationCreate && this.props.restrictUserLocationCreation.create_location === "enable") //based on company subscription
                    ? {
                        icon: 'add',
                        tooltip: 'Add',
                        isFreeAction: true,
                        onClick: () =>
                          this.setState({
                            edit_id_data: [],
                            open: true,
                            status: 'create',
                            isApiFinished: false,
                          }),
                      }
                    : null,
                  ]}

                  onPageChange={(page) => this.handlePageChange(page)}
                  onRowsPerPageChange={(size) => this.handlePageSizeChange(size)}

                  options={getStickyTableOptions({
                    bodyOffset:200,
                     cellStyle,
                    headerStyle,
                    options: {
                      showEmptyDataSourceMessage: this.state.isApiFinished,
                      // headerStyle,
                      // fixedColumns: {
                      //   left: 2,
                      //   right: 0
                      // },
                      search:false,
                      exportButton: locationExport ? true : false,
                      filtering: false,
                      toolbar:true,
                      actionsColumnIndex: -1,
                      tableLayout: "auto",
                      maxBodyHeight: "450px",
                      minBodyHeight: "450px",
                      // maxBodyHeight: maxBodyHeight,
                      // minBodyHeight: '480px',
                      pageSize: pageSize,
                      pageSizeOptions: [20, 50, 100],
                      totalCount: this.props.search_location_count,
                      exportMenu: locationExport ? [
                        {
                          label: 'Export PDF',
                          exportFunc: (cols, datas) => {
                            apiCalls(
                              setModalTypeHandler,
                              setLoaderStatusHandler,
                              this.props.listStockLocationAction(
                                commoncookie,
                                headerLocationId,
                                setModalTypeHandler,
                                setLoaderStatusHandler,
                                (exportData) => {
                                  const normalizedData = exportData.map(row => {
                                    const newRow = {};
  
                                    cols.forEach(col => {
                                      let value;
                                      if (col.field === 'locationTypeName' && !row[col.field]) {
                                        value = row.locationtypename || row.locationType || '';
                                      } else {
                                        value = row[col.field];
                                      }
  
                                      newRow[col.field] =
                                        value !== null && value !== undefined && value !== '' ? value : '';
                                    });
  
                                    return newRow;
                                  });
  
                                  ExportPdf(cols, normalizedData, 'LocationsData');
                                }
                              )
                            );
                          }
                        },
                        {
                          label: 'Export CSV',
                          exportFunc: (cols, datas) => {
                            apiCalls(
                              setModalTypeHandler,
                              setLoaderStatusHandler,
                              this.props.listStockLocationAction(
                                commoncookie,
                                headerLocationId,
                                setModalTypeHandler,
                                setLoaderStatusHandler,
                                (exportData) => {
                                  const normalizedData = exportData.map(row => {
                                    const newRow = {};
                                    cols.forEach(col => {
                                      let value;
                                      
                                      if (col.field === 'locationTypeName' && !row[col.field]) {
                                        value = row.locationtypename || row.locationType || '';
                                      } else {
                                        value = row[col.field];
                                      }
  
                                      newRow[col.field] =
                                        value !== null && value !== undefined && value !== '' ? value : '';
                                    });
                                    return newRow;
                                  });
  
                                  ExportCsv(cols, normalizedData, 'StockLocationData');
                                }
                              )
                            );
                          }
                        },
                      ] : [],
                    }
                  })}
                  // columns={
                  //   this.props.stocklocation ? this.props.stocklocation.map((t) =>
                  //     Object.keys(t).map((o) => { return { title: o, field: o }
                  //   }))[0] : []
                  // }
                  // columns={filteredCol}

                  page={this.state.page}

                  columns={[
                    {
                      field: 'location_name',
                      title: 'Location Name',
                      cellStyle: {textTransform:"capitalize"}
                    },
                    {
                      field: 'locationTypeName',
                      title: 'Location Type',
                      cellStyle: {textTransform:"capitalize" }
                    },
                    {
                      field: 'location_code',
                      title: 'Location Code',
                      cellStyle: {textTransform:"capitalize"}
                      //cellStyle: {textAlign:"right"}
                    },
                    {
                      field: 'latitude',
                      title: 'Latitude',
                    },
                    {
                      field: 'longitude',
                      title: 'Longitude',
                    },
                    {
                      field: 'address',
                      title: 'Address',
                      render:(rowData)=>{
                        if(rowData.address !== null){
                          return rowData.address
                        }
                        else{
                          return '-'
                        }
                      }
                    },
                    {
                      field: 'city',
                      title: 'City',
                    },
                    {
                      field: 'state',
                      title: 'State',
                    },
                    // {
                    //   field: 'description',
                    //   title: 'Description',
                    // },
                  ]}
                  // components={{
                  //   Row: props => <MTableBodyRow id="1" {...props} />
                  //  }}
                  // data={
                  //   this.props.search_location_data.length > 0  || this.state.searchVal.length > 0 ?
                  //    this.props.search_location_data :
                  // (  this.props.get_source_locationdata
                  //   ? this.props.get_source_locationdata?.slice(0, this.props.pageSize)
                  //       .map((r, i) => {
                  //         const {tableData, ...record} = r;
                  //         return {i, ...record};
                  //       })
                  //   : [])
                  // }

                  data={this.props.search_location_data}
                  title={
                    <Typography  className='page-title'  variant='h6' align='left'  style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                     Locations</Typography>}
                />
              )}
              {this.state.open && (
                <NewStockLocation
                  status={this.state.status}
                  edit_id_data={this.props.stocklocation_id_data}
                  search_location_data={this.props.search_location_data}
                  handleClose={this.handleClose}
                  handleSubmit={this.handleSubmit}
                  {...this.props}
                  type='stockLocation'
                  setModalStatusHandler={setModalStatusHandler}
                  setModalTypeHandler={setModalTypeHandler}
                  locationData={this.props.search_location_data}
                />
              )}

              {
                
                  <DefaultLocationAlert
                    open={this.state.deleteDefaultLocation}
                    handleClose={this.handleDefaultClose}
                    location_data = {this.state.rowData}
                    locations = {this.props.search_location_data}
                    // handleDelete={() => { }}
                  />
                
              }

            </div>
          )}
        </CreateNewButtonContext.Consumer>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    stocklocation: state.stockLocationReducer.stocklocation || [],
    stocklocation_id_data:
      state.stockLocationReducer.stocklocation_id_data || [],
    location_type:
      state.stockLocationReducer.location_type || [],
      get_source_locationdata: state.stockLocationReducer.get_source_locationdata || [],
      search_location_data: state.stockLocationReducer.search_location_data || [],
      search_location_count: state.stockLocationReducer.search_location_count || [],
      restrictUserLocationCreation: state.SubscriptionReducer.restrictUserLocationCreation || [],
      menuAccess: state.rbacReducer.menuAccess || [],
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listStockLocationAction: (
      commoncookie,
      headerLocationId,
      setModalTypeHandler,
      setLoaderStatusHandler,
      exportCallBack
    ) => {
      return dispatch(
        listStockLocationAction(
          commoncookie,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
          exportCallBack
        ),
      );
    },
    location_typeAction: () => {
      return dispatch(
        location_typeAction(),
      );
    },
    createStockLocationAction: (
      data,
      employee_id,
      headerLocationId,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    ) => {
      return dispatch(
        createStockLocationAction(
          data,
          employee_id,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
        ),
      );
    },
    getbyidStockLocationAction: (
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        getbyidStockLocationAction(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    updateStockLocationAction: (
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    ) => {
      return dispatch(
        updateStockLocationAction(
          id,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
        ),
      );
    },
    deleteStockLocationAction: (
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        deleteStockLocationAction(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    listUserlocationsAction : (employee_id, setModalTypeHandler,
      setLoaderStatusHandler) =>{
     return dispatch(listUserlocationsAction(employee_id, setModalTypeHandler,
      setLoaderStatusHandler));
    },
    getsourcelocationAction : () =>{
     return dispatch(getsourcelocationAction());
    },
    set_SearchlocationAction: (val ) => { return dispatch(set_SearchlocationAction(val))
    },
    get_SearchlocationAction: (
      val, 
      setModalTypeHandler,
      setLoaderStatusHandler,
      ) => { 
      return dispatch(
        get_SearchlocationAction(
          val, 
          setModalTypeHandler,
          setLoaderStatusHandler,
          )
        );
    },
    stockLocationPaginationAction: (data) => { 
      return dispatch(stockLocationPaginationAction(data));
    },
    restrictNewCreationBasedOnPlanAction : () =>{
      return dispatch(restrictNewCreationBasedOnPlanAction());
     },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StockLocation);

