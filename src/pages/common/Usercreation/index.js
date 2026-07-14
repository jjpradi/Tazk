import React, {Component} from 'react';
import {connect} from 'react-redux';
import NewUser from '../../../components/NewUser';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import {
  createUserCreationAction,
  listUserCreationAction,
  deleteUsercreationAction,
  updateUsercreationallAction,
  set_searchUserCreationAction,
  get_searchUserCreationAction,
  userCreationPaginationAction,
} from '../../../redux/actions/userCreation_actions';
import {getUserRoleAction, getEventNameAction} from '../../../redux/actions/userRole_actions';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {allListStockLocation} from '../../../redux/actions/stock_Location_actions';
import AlertDialog from '../../common/Dialog';
import Dialog from '@mui/material/Dialog';
import resetDialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { IconButton, InputAdornment, TablePagination, TextField, Typography } from '@mui/material';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle,font14_500 } from 'utils/pageSize';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CommonSearch from 'utils/commonSearch';
import { FaBullseye } from 'react-icons/fa';
import { getShiftListAction } from 'redux/actions/shifts.actions';
import { get_searchContactsAction } from 'redux/actions/customer_actions';
import ResetDialog from 'pages/sales/vendorPriceList/ResetDialog';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import SecurityOutlined from '@mui/icons-material/SecurityOutlined';
import { titleURL } from 'http-common';
import { getsessionStorage } from 'pages/common/login/cookies';
import { restrictNewCreationBasedOnPlanAction } from 'redux/actions/subscription_action';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import { getStickyTableOptions, stickyTableComponents } from 'utils/stickyTableLayout';
import { filterColumns } from '../../../components/FieldGuard/filterColumns';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
// import Cards from '../../components/dynamicCards/index';
// import { withRouter } from 'react-router-dom';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

class Usercreation extends Component {
  static contextType = CreateNewButtonContext;
  canEditUser = () => {
  const selectedRole = this.storage?.role_name;
  const rights = this.props.menuAccess?.[selectedRole] || [];

  return UserRightsAuthorization(rights, 'settings__users', 'can_edit');
};
  constructor(props) {
    super(props);
    this.state = {
      CashOutIn_data: [],
      open: false,
      edit_id_data: [],
      dialog: {open: false, msg: '', severity: ''},
      status: '',
      delete: false,
      id: '',
      currentPage:0,
      searchVal: '',
      searchPageData: [],
      page:0,
      pageSize: pageSize,
      isApiFinished: false,
      reset: false,
      
    };
    this.isEditDisabled = this.isEditDisabled.bind(this);

  }


  

 
  storage = getsessionStorage()
  



  async componentDidMount() {
    this.props.set_searchUserCreationAction({data:[], numRows:0});
    const context = this.context;
    const body = {
      numPerPage: this.state.pageSize,
      pageCount: this.state.page,
      searchString:'',
      employeeId:context.commoncookie,
      headerLocationId:context.headerLocationId
    }
    if (this.storage?.role_name) {
      this.props.getMenuAccessAction(this.storage.role_name);
    }
    // await this.props.listChartOfAccountsdataAction()
    apiCalls(
       context.setModalTypeHandler,
       context.setLoaderStatusHandler,
      // await this.props.listUserCreationAction(
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler,
      // ),
      this.props.userCreationPaginationAction(body).finally(() => this.setState({isApiFinished: true})),
       await this.props.getUserRoleAction(),
       await this.props.getEventNameAction(),
       await this.props.restrictNewCreationBasedOnPlanAction(),
      //  await this.props.getUserRightsByRoleIdAction()
      // await this.props.allListStockLocation(),
      //this.props.getShiftListAction(),
	  ).finally(() => this.setState({isApiFinished: true}));
    // await this.setState({ CashOutIn_data: this.props.cashOutIn })
  }

  async componentDidUpdate(prevProps, prevState) { 
    const context = this.context;
    if (prevState.page !== this.state.page || prevState.pageSize !== this.state.pageSize) {
        const body = {
          numPerPage: this.state.pageSize,
          pageCount: this.state.page,
          searchString: this.state.searchVal,
          employee_id: context.commoncookie,
          headerLocationId: context.headerLocationId
        }
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.userCreationPaginationAction(body),
          this.props.restrictNewCreationBasedOnPlanAction()
        );
    }
  }

  handleEdit = async (data) => {
    console.log('sdddbdff',data)
    const context = this.context;
    // await this.props.getbyidCashOutInAction(id)
    // this.setState({ open: true, status: 'edit' })
    if (this.props.stocklocation.length === 0) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        // this.props.allListStockLocation(),
        //this.props.getShiftListAction(),
      )
      this.setState({
        edit_id_data: data,
        open: true,
        status: 'edit',
        relievingDateEnabled: true,
        rowPopup: { ...this.state.rowPopup, open: false },
      });
    }
    {
      this.setState({
        edit_id_data: data,
        open: true,
        status: 'edit',
        rowPopup: { ...this.state.rowPopup, open: false },
      });
    }
  };



  
  isEditDisabled = (rowData) => {
    console.log("RowData:", rowData);
    const isDisabled = rowData.role_name === 'Administrator' && (!rowData.employee_code || rowData.employee_code === '');
    console.log("Edit Disabled for:", rowData.username, "isDisabled:", isDisabled);
    return isDisabled;
  };

  // handleReset = async (id) => {
  // const context = this.context;
  // const body = {
  //   numPerPage: this.state.pageSize,
  //   pageCount: this.state.page,
  //   searchString: this.state.searchVal,
  //   employee_id: context.commoncookie,
  //   headerLocationId: context.headerLocationId
  // };

  handleDelete = async (id) => {
    const context = this.context;
    const body = {
      numPerPage: this.state.pageSize,
      pageCount: this.state.page,
      searchString: this.state.searchVal,
      employee_id: context.commoncookie,
      headerLocationId: context.headerLocationId
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.deleteUsercreationAction(
        id,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      )
    ).then(res => {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.userCreationPaginationAction(body)
      );
    })
    this.setState({delete: false});
  };
  handledialog = (id, rowData) => {
    console.log(rowData, "HIIIIP")
    
    this.setState({ delete: true, id: id });
  };
  resetDialog = (id) => {
    // console.log(id,rowData, 'SSSSSSD')
    this.setState({ reset: true, id: id });
  }
  handleClose = (id) => {
    this.setState({open: false, dialog: false, delete: false});
  };
  resetClose = (id) => {
    this.setState({open: false, dialog: false, reset: false});
  };
  responseDialog = async (res, resSeverity) => {
    await this.setState({
      ...this.state.dialog,
      dialog: {msg: res, severity: resSeverity, open: true},
    });
  };

  sample = (value) => {
    this.setState({open: value});
  };

  handleSubmit = async (data) => {
    const context = this.context;
    this.setState({ page: data.person_id ? this.state.page : 0 })
    const body = {
      numPerPage: this.state.pageSize,
      pageCount: this.state.page,
      searchString: this.state.searchVal,
      employee_id: context.commoncookie,
      headerLocationId: context.headerLocationId
    }
    const body1 = {
      searchString: "",
      type_details: "employee",
      type: 3,
      pageCount: 0,
      numPerPage: 15,
    }
    if (data.person_id) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.updateUsercreationallAction(
          data.person_id,
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.sample,
        )
      ).then(res => {
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.userCreationPaginationAction(body),
          this.props.restrictNewCreationBasedOnPlanAction(),
          // this.props.getUserRightsByRoleIdAction()
        );
      })

      
    } else {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.createUserCreationAction(
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.sample,
        )
      ).then(res => {
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.userCreationPaginationAction(body),
          this.props.restrictNewCreationBasedOnPlanAction()
        );
      })
    }
  };

  requestSearch = (e) => {
    const context = this.context;
    let val = e.target.value;
    this.setState({searchVal: val, page:0});

    // if(val.trim() !== ''){
      this.props.set_searchUserCreationAction({data:[], numRows:0})
    // }
    const body = {
      numPerPage: this.state.pageSize,
      pageCount: 0,
      searchString:val,
      employeeId:context.commoncookie,
      headerLocationId:context.headerLocationId
    }
    this.props.get_searchUserCreationAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      )
  };

  cancelSearch = (e) => {
    this.setState({searchPageData: [], page: 0, searchVal: ''});
    this.props.set_searchUserCreationAction({data:[], numRows:0})
    const context = this.context;
    const body = {
      numPerPage:  this.state.pageSize,
      pageCount: 0,
      searchString:"",
      employeeId:context.commoncookie,
      headerLocationId:context.headerLocationId
    }
    this.props.get_searchUserCreationAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      )
  };

  handlePageChange = async (page) => {
    this.setState({ page: page });
  };

handlePageSizeChange = async (size) => {
  this.setState({ pageSize: size })
}

  handleOpen = async () => {
    const context = this.context;
    if (this.props.stocklocation.length === 0) {
      const body = {
        newUser:'newUser'
      }
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        //this.props.getUserRoleAction(),
        this.props.allListStockLocation(),
        this.props.userCreationPaginationAction(body)
        // this.props.allListStockLocation(),
        //this.props.getShiftListAction()
      )
      this.setState({
        edit_id_data: [],
        open: true,
        status: 'create',
        isApiFinished: false
      })
    }
    {
      this.setState({
        edit_id_data: [],
        open: true,
        status: 'create',
      })
    }
  }



    createContact() {
    const selectedRole = this.storage?.role_name;
    const rights = this.props.menuAccess?.[selectedRole] || [];
    const allowCreateUser = UserRightsAuthorization(rights, 'settings__users', 'can_create') && this.props.restrictUserLocationCreation.create_user === "enable"

    return allowCreateUser
  }

  render() {

      
  console.log('User Role:',this.props.searchUserCreationData)
  // console.log(this.createContact(),'userCreation')

    return (

      <>
        <Helmet>
          <meta charSet='utf-8' />
          <title> {titleURL} | Users </title>
        </Helmet>
        <CreateNewButtonContext.Consumer>
          {({setModalStatusHandler, setModalTypeHandler, drawerOpen}) => (
            <div
            // style={{
            //   width: drawerOpen
            //     ? 'calc(100vw - 370px)'
            //     : 'calc(100vw - 143px)',
            // }}
            >
              {/* <AlertDialog
                delete={this.state.delete}
                handleClose={this.handleClose}
                handleDelete={this.handleDelete}
                id={this.state.id}
              /> */}
              <ResetDialog
                reset={this.state.reset}
                handleClose={this.resetClose}
                handleDelete={this.handleDelete}
                id={this.state.id}
              />
              {this.state.open === false && (
                <MaterialTable
                  totalCount={this.props.searchUserCreationCount}
                  // style={{height: 'calc(100vh - 80px)',}}
                  components={{
                    ...stickyTableComponents,
                    Toolbar: (props) => (
                      <>
                        <div
                          style={{
                            // height: "13vh",
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
                              searchVal={this.state.searchVal}
                              cancelSearch={this.cancelSearch}
                              requestSearch={this.requestSearch}
                            />
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
                      </>
                    ),
                    Pagination: (props) => (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          borderTop: 'none',
                          boxShadow: 'none',
                          padding: '8px 16px',
                          borderBottom: 'none',
                          marginBottom: 0,
                          paddingBottom: 0,
                        }}
                      >
                        <TablePagination
                          {...props}
                          count={this.props.searchUserCreationCount || 0}
                          page={this.state.page}
                          rowsPerPage={this.state.pageSize}
                          onPageChange={(e, page) => this.handlePageChange(page)}
                          onRowsPerPageChange={(e) => this.handlePageSizeChange(parseInt(e.target.value, 10))}
                          style={{
                            borderTop: 'none',
                            borderBottom: 'none',
                            boxShadow: 'none',
                            width: 'auto',
                            marginBottom: 0,
                            paddingBottom: 0,
                          }}
                        />
                      </div>
                    ),
                  }}
                  actions={[
                     ...(this.canEditUser()
                      ? [
                    (rowData) => ({
                   
                      icon: 'edit',
                      tooltip: 'edit',
                      position: 'row',
                      onClick: (event, rowData) => this.handleEdit(rowData),
                     disabled: this.isEditDisabled(rowData),
                   

                  }),
                  ]: []),
                    (rowData) => ({
                      icon: () => <SecurityOutlined />,
                      tooltip: 'Permissions',
                      position: 'row',
                      onClick: (event, rowData) => {
                        window.location.href = `/settings/userPermissions/${rowData.employee_id}`;
                      },
                    }),
                    // {
                    //   icon: 'delete',
                    //   tooltip: 'Delete',
                    //   onClick: (event, rowData) =>
                    //     this.handledialog(rowData.employee_id, rowData),
                    // },
                    
                    // (rowData) => ({
                    //   icon: () => (
                    //     <div>
                    //       {rowData.device_id > 0 ? (
                    //         <RotateLeftIcon />
                    //       ) : (
                    //         <RotateLeftIcon
                    //           style={{ opacity: 0.5 }}
                    //         />
                    //       )}
                    //     </div>
                    //   ),
                    //   tooltip: 'Reset Device Id',
                    //   disabled: rowData.device_id === null,
                    //   onClick: (event, rowData) =>
                    //     rowData.device_id !== null &&
                    //     this.resetDialog(rowData.employee_id, rowData)
                    // }),
                    
                    // {
                    //   icon: 'rotate_left',
                    //   tooltip: 'Reset Device Id',
                    //   onClick: (event, rowData) =>
                    //     this.resetDialog(rowData.employee_id),
                    // },
                    // {
                    //   icon: 'add',
                    //   tooltip: 'Add',
                    //   isFreeAction: true,
                    //   onClick: (event, rowData) => this.handleOpen(),
                    // },
                    this.createContact() ? //based on company subscription & userRights
                     {
                        icon: 'add',
                        tooltip: 'Add',
                        isFreeAction: true,
                        onClick: (event, rowData) => this.handleOpen(),
                      }
                    : null,
                  ]}
                  // onPageChange={(page) => {
                  //   this.setState({currentPage:page})
                  // }}
                  onPageChange={(page) => this.handlePageChange(page)}
                  onRowsPerPageChange={(size) =>
                    this.handlePageSizeChange(size)
                  }
                  options={
                    getStickyTableOptions({
                      bodyOffset:200,
                      headerStyle,
                      options:{
                        showEmptyDataSourceMessage: this.state.isApiFinished,
                        headerStyle,
                        cellStyle,
                        exportButton: true,
                        filtering: false,
                        actionsColumnIndex: -1,
                        pageSize: this.state.pageSize,
                        pageSizeOptions: [20, 50, 100],
                        initialPage: this.state.currentPage,
                        search: false,
                        toolbar:true,
                        // maxBodyHeight:maxBodyHeight,
                        // minBodyHeight:maxBodyHeight
                      }
                    })
                  }
                  // columns={
                  //   this.props.stocklocation ? this.props.stocklocation.map((t) =>
                  //     Object.keys(t).map((o) => { return { title: o, field: o }
                  //   }))[0] : []
                  // }
                  // columns={filteredCol}
                  page={0}
                  columns={filterColumns([
                    {
                      field: 'employee_code',
                      title: 'Emp Code',
                    },
                    {
                      field: 'first_name', render: rowData => rowData.first_name ? (rowData.first_name + (rowData.last_name && rowData.last_name.length > 0 ? ' ' + rowData.last_name : '')) : '-' ,
                      title: 'Employee',
                      cellStyle: {textTransform:"capitalize"}
                    },
                    {
                      field: 'username',
                      title: 'User Name',
                    },
                    {
                      field: 'role_name',
                      title: 'Role Name',
                      cellStyle: {textTransform:"capitalize"}
                    },
                    {
                      field: 'category_name',
                      render: rowData => rowData?.category_name ? rowData?.category_name  :  '-' ,
                      title: 'Category Name',
                      cellStyle: {textTransform:"capitalize"}
                    },
                    {
                      field: 'location_name',
                      title: 'Location Name',
                      cellStyle: {textTransform:"capitalize"},
                      render: (rowData) => (
                        console.log(rowData,'ytuttut'),
                        <div>
                          {rowData.Locations_name?.filter(
                            (f) => f.username === rowData.username,
                          )
                            .map((d) => d.location_name)
                            .join(', ')}
                        </div>
                      ),
                    },
                    {
                      field: 'device_id',
                      title: 'Device Id',
                    },
                    // {
                    //   field:'accountNumber',
                    //   title:'Account Number',
                    // },
                    // {
                    //   field:'accountType',
                    //   title:'Account Type',
                    // },
                  ], this.props.fieldVisibility, 'users')}
                  // components={{
                  //   Row: props => <MTableBodyRow id="1" {...props} />
                  //  }}

                  // data={
                  //   this.props.createUser
                  //     ? this.props.createUser.map((r, i) => {
                  //         const {tableData, ...record} = r;
                  //         return {i, ...record};
                  //       })
                  //     : []
                  // }

                  data=//   return { i, ...record }; //   const { tableData, ...record } = r; // {this.props.searchUserCreationData?.length > 0 || this.state.searchVal.length > 0 ? this.props.searchUserCreationData : this.props.createUser.map((r, i) => {
                  // })}
                  {this.props.searchUserCreationData?.map((r, i) => {
                    const {tableData, ...record} = r;
                    return {i, ...record};
                  })}
                  title={
                    <Typography
                    fontFamily="sans-serif" 
                    fontSize="13px" 
                    fontWeight="600" 
                    color='rgba(0, 0, 0, 0.7)'
                      variant='h6'
                      align='left'
                      style={{paddingTop: '10px', paddingBottom: '10px'}}
                    >
                      User
                    </Typography>
                  }
                />
              )}

              {this.state.open === true && (
                <NewUser
                  edit_id_data={this.state.edit_id_data}
                  data={this.props.searchUserCreationData}
                  status={this.state.status}
                  handleClose={this.handleClose}
                  handleSubmit={this.handleSubmit}
                  {...this.props}
                  userRole={this.props.userRole}
                />
              )}
            </div>
          )}
        </CreateNewButtonContext.Consumer>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userCreation: state.UserCreationReducer.userCreation || [],
    createUser: state.UserCreationReducer.createUser || [],
    StatusUserCreation: state.UserCreationReducer.StatusUserCreation,
    userRole: state.UserRoleReducer.userRole || [],
    stocklocation: state.stockLocationReducer.allliststocklocation,
    searchUserCreationData: state.UserCreationReducer.searchUserCreationData,
    searchUserCreationCount: state.UserCreationReducer.searchUserCreationCount,
    shiftList: state.ShiftsReducer.shiftList,
    restrictUserLocationCreation: state.SubscriptionReducer.restrictUserLocationCreation,
    fieldVisibility: state.NavigationReducer.fieldVisibility,
    // user_rights: state.roleReducer.user_rights || [],
    menuAccess: state.rbacReducer.menuAccess || {},
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listUserCreationAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(
        listUserCreationAction(setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    createUserCreationAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    ) => {
      return dispatch(
        createUserCreationAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
        ),
      );
    },
    getUserRoleAction: () => {
      return dispatch(getUserRoleAction());
    },
    getEventNameAction: () => {
      return dispatch(getEventNameAction());
    },
    allListStockLocation: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(
        allListStockLocation(setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    getShiftListAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(
        getShiftListAction(setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    deleteUsercreationAction: (
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        deleteUsercreationAction(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    updateUsercreationallAction: (
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    ) => {
      return dispatch(
        updateUsercreationallAction(
          id,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
        ),
      );
    },
    set_searchUserCreationAction: (val ) => { 
      return dispatch(set_searchUserCreationAction(val));
    },
    get_searchUserCreationAction: (val,setModalTypeHandler,setLoaderStatusHandler) => { 
      return dispatch(get_searchUserCreationAction(val, setModalTypeHandler,setLoaderStatusHandler));
    },
    get_searchContactsAction: (data,setModalTypeHandler,setLoaderStatusHandler) => { 
      return dispatch(get_searchContactsAction(data, setModalTypeHandler,setLoaderStatusHandler));
    },
    userCreationPaginationAction: (data) => { 
      return dispatch(userCreationPaginationAction(data));
    },
    restrictNewCreationBasedOnPlanAction : () =>{
      return dispatch(restrictNewCreationBasedOnPlanAction());
     },
     getUserRightsByRoleIdAction : () =>{
      return dispatch(getUserRightsByRoleIdAction());
     },
     getMenuAccessAction: (roleName) => {
      return dispatch(getMenuAccessAction(roleName));
     },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Usercreation);

