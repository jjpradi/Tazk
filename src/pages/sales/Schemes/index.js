import React, {Component} from 'react';
//import NewCustomer from '../../../components/Customer';
import {connect} from 'react-redux';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import _ from 'lodash';
import NewSchemes from '../../../components/NewSchemes';
import {
  listSchemesAction,
  updateSchemesAction,
  getbyidSchemesAction,
  deleteSchemesAction,
  createSchemesAction,
  listDashBoardSchemesAction,
  searchSchemesAction,
  set_searchSchemesAction,
  schemesPaginationAction,
} from '../../../redux/actions/schemes_actions';
import {listProductAction} from '../../../redux/actions/product_actions';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {getDateTime} from '../../../utils/getTimeFormat';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import { InputAdornment, TextField, Typography } from '@mui/material';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle,font14_500 } from 'utils/pageSize';
// import { Grid } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CommonSearch from 'utils/commonSearch';
import { titleURL } from 'http-common';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import {
    getStickyTableOptions,
    stickyTableComponents,
  } from '../../../utils/stickyTableLayout';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

class Schemes extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.state = {
      schemes_data: [],
      open: false,
      edit_id_data: [],
      dialog: {open: false, msg: '', severity: ''},
      delete: false,
      id: '',
      searchData: [],
      searchVal: '',
      searchPageData: [],
      pageSize: 20,
      count: 0,
      page: 0,
      isApiFinished: false
    };
  }

  storage = getsessionStorage()

  async componentDidMount() {
    this.props.set_searchSchemesAction({data:[], numRows:0})
    const context = this.context;
     const selectedRole = this.storage?.role_name;
    const body = {
      pageCount:0,
      numPerPage: this.state.pageSize,
      searchString:'',
      employeeId:context.commoncookie,
      headerLocationId:context.headerLocationId
    }

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
    this.props.schemesPaginationAction(
      body,
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
    ),
        this.props.getMenuAccessAction(selectedRole)
      // this.props.getUserRightsByRoleIdAction()
    ).finally(() => this.setState({isApiFinished: true}))

    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   this.props.listSchemesAction(
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //   ),
    //   // this.props.listProductAction()
	  // );
    // const data =[...this.props.schemes].map(s =>{
    //     return {id:s.scheme_id,SchemeName:s.scheme_name,Target:s.target,Award:s.award,Brand:s.brand,From:s.from,To:s.to}
    // })
    // await this.setState({ schemes_data: data })
  }

  async componentDidUpdate(prevProps , prevState) {
    const context = this.context;

    if (prevState.page !== this.state.page) { 

      const body = {
        pageCount:this.state.page,
        numPerPage: this.state.pageSize,
        searchString:this.state.searchVal,
        employeeId:context.commoncookie,
        location_id:context.headerLocationId
      }
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.schemesPaginationAction(body)
      )
    }

    if (prevState.pageSize !== this.state.pageSize) {
    const body = {
      pageCount:this.state.page,
      numPerPage: this.state.pageSize,
      searchString:this.state.searchVal,
      employeeId:context.commoncookie,
      location_id:context.headerLocationId
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.schemesPaginationAction(body)
    )
    }

  }

  handlePageSizeChange = async (size) => {
    this.setState({pageSize: size})
    const context = this.context;
  }

  handlePageChange = async (page) => {
    const context = this.context;
    this.setState({ page: page })
  }

  handleEdit = async (id) => {
    if (_.isEmpty(id)) {
      let getId = await this.props.searchSchemesData
        .map((m) => {
          return m.id === id ? m : null;
        })
        .filter((f) => f !== null);
      await this.setState({edit_id_data: getId, open: true});
    }
  };
  handleDelete = async (id) => {
    const context = this.context;
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.deleteSchemesAction(
        id,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      )
	  );
    this.setState({delete: false});
  };
  handledialog = (id) => {
    this.setState({delete: true, id: id});
  };
  handleClose = (id) => {
    this.setState({open: false, dialog: false, delete: false});
  };
  responseDialog = async (res, resSeverity) => {
    await this.setState({
      ...this.state.dialog,
      dialog: {msg: res, severity: resSeverity, open: true},
    });
  };
  handleSubmit = async (data) => {
    
    const context = this.context;
    if (data.id) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.updateSchemesAction(
          data.id,
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,()=>{
            this.setState({open: false});
          }
        )
      );
      this.setState({open: false, dialog: false, delete: false});
    } else {
        
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.createSchemesAction(
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,()=>{
             this.setState({open: false});
          }
        )
      );
      this.setState({open: false, dialog: false, delete: false});
    }
  };
  requestSearch = (e) => {
    const context = this.context;
    let val = e.target.value;
    this.setState({searchVal: val, page : 0});
    if(val.length >= 3 || val.length === 0) {
      this.props.set_searchSchemesAction({data:[], numRows:0})
    }

    const body = {
      pageCount:0,
      numPerPage: this.state.pageSize,
      searchString:val.toLowerCase(),
      employeeId:context.commoncookie,
      headerLocationId:context.headerLocationId
    }
  
      this.props.searchSchemesAction(
      body,
      context.setModalTypeHandler,
      context.setLoaderStatusHandler
    )    
  }
  cancelSearch=()=>{
    const context = this.context;
    this.setState({searchPageData: [], page: 0, searchVal: ''});
    const body = {
      pageCount:0,
      numPerPage: this.state.pageSize,
      searchString:'',
      employeeId:context.commoncookie,
      headerLocationId:context.headerLocationId
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.schemesPaginationAction(body)
    )
  }
  render() {
    const storage = getsessionStorage()
    const { menuAccess = {} } = this.props;
    const selectedRole = this.storage?.role_name;
    // const { user_rights } = this.props;
    const AddRights = UserRightsAuthorization(menuAccess[selectedRole], 'schemes__new_schemes', 'can_create')
    const EditRights = UserRightsAuthorization(menuAccess[selectedRole], 'schemes__new_schemes', 'can_edit')
    const DeleteRights =  UserRightsAuthorization(menuAccess[selectedRole], 'schemes__new_schemes', 'can_delete')
    const exportRights =  UserRightsAuthorization(menuAccess[selectedRole], 'schemes__new_schemes', 'can_export')
    const tableData = this.props.searchSchemesData?.map((item) => {
      const product = item.products?.[0] || {};

      return {
        ...item,
        from_target: product.from_target ?? '',
        to_target: product.to_target ?? '',
        scheme_award: product.scheme_award ?? '',
      };
    });

    return (
      <div
        // style={{
        //   width: this.context.drawerOpen
        //     ? 'calc(100vw - 325px)'
        //     : 'calc(100vw - 143px)',
        // }}
      >
         <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | Schemes </title>
         </Helmet>
        <AlertDialog
          delete={this.state.delete}
          handleClose={this.handleClose}
          handleDelete={this.handleDelete}
          id={this.state.id}
        />
        {this.state.open === false && (
          <MaterialTable
          style={{height: 'calc(100vh - 100px)',overflow:'hidden'}}
          totalCount={this.props.searchSchemesCount}
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
                    <div style={{ width: '100%' }}>
                      <MTableToolbar {...props} />
                    </div>
                    <div>
                          <CommonSearch
                            searchVal={this.state.searchVal}
                            cancelSearch={this.cancelSearch}
                            requestSearch={this.requestSearch}
                          />
                    {/* <TextField
                              autoFocus={this.state.searchVal ? true : false}
                              fullWidth
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
                </>
              )
            }}
            actions={[
              EditRights?{
                icon: 'edit',
                tooltip: 'edit',
                position: 'row',
                onClick: (event, rowData) => this.handleEdit(rowData.id),
              }:null,
              DeleteRights?{
                icon: 'delete',
                tooltip: 'Delete',
                onClick: (event, rowData) => this.handledialog(rowData.id),
              }:null,
              AddRights?{
                icon: 'add',
                tooltip: 'add',
                isFreeAction: true,
                onClick: (event, rowData) =>
                  this.setState({edit_id_data: [], open: true}),
              }:null,
            ]}
            onPageChange={(page) => this.handlePageChange(page)}
            onRowsPerPageChange={(size) => this.handlePageSizeChange(size)}
            options={getStickyTableOptions({
               headerStyle,
               bodyOffset: 200,
              cellStyle,
              options:{
                 showEmptyDataSourceMessage: this.state.isApiFinished,
             
              // fixedColumns: {
              //   left: 2,
              //   right: 0
              // },
              search: false,
              exportButton: true,
              filtering: false,
              actionsColumnIndex: -1,
              maxBodyHeight: maxBodyHeight,
              minBodyHeight: maxBodyHeight,
              pageSize: pageSize,
              tableLayout: "auto",
              toolbar: true,
              pageSizeOptions: [20, 50, 100],
              exportMenu:exportRights ? [
                {
                  label: 'Export PDF',
                  exportFunc: (cols, datas) =>
                  {
                    const context = this.context;
                    apiCalls(
                      context.setModalTypeHandler,
                      context.setLoaderStatusHandler,
                      this.props.listSchemesAction( 
                        ()=>{},
                        ()=>{},
                     (exportData) => {
                       ExportPdf(
                         cols,
                         exportData.data,
                         'SchemesData',
                       );
                     },
                   )
                      
                    );
                 }
                },
                {
                  label: 'Export CSV',
                  exportFunc: (cols, datas) =>
                  {
                    const context = this.context;
                    apiCalls(
                      context.setModalTypeHandler,
                      context.setLoaderStatusHandler,
                      this.props.listSchemesAction( 
                        ()=>{},
                        ()=>{},
                     (exportData) => {
                       ExportCsv(
                         cols,
                         exportData.data,
                         'SchemesData',
                       );
                     },
                   )
                    );
                 }
                },
              ] : [],
              }
            })}
            // columns={
            //   this.props.schemes ? this.props.schemes.map((t) => {
            //     const { tableData, products, schemeId, ...record } = t;
            //     return Object.keys(record).map((o) => {
            //       return { title: o, field: o }
            //     })
            //   })[0] : []

            // }
            page={this.state.page}
            columns={[
              {title: 'SI', field: 'id'},
              {title: 'Scheme name', field: 'scheme_name'},
              {title: 'Doc id', field: 'doc_id'},
              {title: 'Brand', field: 'brand'},
              {title: 'Target status', field: 'target_status'},
              {title: 'From', field: 'from_converted'},
              {title: 'To', field: 'to_converted'},
              // {title: 'Target', field: 'target'},
              // {title: 'Award', field: 'award'},
              { title: 'From Target', field: 'from_target' },
              { title: 'To Target', field: 'to_target' },
              { title: 'Scheme Award', field: 'scheme_award' },
              {title: 'Notes', field: 'notes'},
              {title: 'Description', field: 'description'},
              {title: 'Vendor name', field: 'vendor_name'}
            ]}
            // data={
            //    this.state.searchVal.length > 0 || this.props.searchvalue.length > 0 ? this.props.searchvalue :
            //   this.props.schemes
            //     // ? this.props.schemes.slice(0, this.props.pageSize).map((r) => {
            //     //     const {tableData, products, ...record} = r;
            //     //     return {...record};
            //     //   })
            //     // : []
            // }
            // data= {this.props.searchSchemesData}
            data={tableData}
            title={
            <Typography variant='h6' align='left'  style={{ paddingTop: '10px', paddingBottom: '10px' }}>
              Schemes
              </Typography>}
          />
        )}
        {this.state.open && (
          <NewSchemes
            schemes={this.props.schemes}
            edit_id_data={this.state.edit_id_data}
            handleClose={this.handleClose}
            handleSubmit={this.handleSubmit}
            {...this.props}
          />
        )}
        {/* <Snackbar open={this.state.dialog.open} autoHideDuration={4000} onClose={this.handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} >
          <Alert onClose={this.handleClose} severity={this.state.dialog.severity} variant="filled">
            {this.state.dialog.msg}
          </Alert>
        </Snackbar> */}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    schemes: state.schemesReducer.schemes || [],
    schemes_id_data: state.schemesReducer.schemes_id_data || [],
    // products: state.productReducer.product || [],
    // searchvalue: state.schemesReducer.searchvalue || [],
    searchSchemesData : state.schemesReducer.searchSchemesData,
    searchSchemesCount : state.schemesReducer.searchSchemesCount,
    vendor: state.vendorReducer.vendor ,
    menuAccess: state.rbacReducer.menuAccess || []
    // user_rights : state.roleReducer.user_rights
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listSchemesAction: (setModalTypeHandler, setLoaderStatusHandler,exportCallBack,) => {
      return dispatch(listSchemesAction(setModalTypeHandler, setLoaderStatusHandler, exportCallBack,));
    },
    createSchemesAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        createSchemesAction(data, setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    getbyidSchemesAction: (id) => {
      dispatch(getbyidSchemesAction(id));
    },
    updateSchemesAction: (
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        updateSchemesAction(
          id,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    deleteSchemesAction: (id, setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(
        deleteSchemesAction(id, setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    // listProductAction: () => {
    //   return dispatch(listProductAction());
    // },
    listDashBoardSchemesAction: () => {
      dispatch(listDashBoardSchemesAction());
    },
    searchSchemesAction:( val,setModalTypeHandler,setLoaderStatusHandler)=>{
      return dispatch(searchSchemesAction( val,setModalTypeHandler,setLoaderStatusHandler))
    },
    set_searchSchemesAction: (val ) => { return dispatch(set_searchSchemesAction(val));
    },
    schemesPaginationAction: (data) => { 
      return dispatch(schemesPaginationAction(data));
    },
    getUserRightsByRoleIdAction : () =>{
      return dispatch(getUserRightsByRoleIdAction());
    },
      getMenuAccessAction: (data) => {
      return dispatch(getMenuAccessAction(data))
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Schemes);

