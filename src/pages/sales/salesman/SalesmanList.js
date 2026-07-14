import React, { Component, useContext, useEffect, useState } from 'react'
import { connect, useDispatch, useSelector } from 'react-redux';
import { get_searchSalesManAction, getonlySalesmanDataAction, listSalesManPaginateAction, set_searchSalesManAction, updateSalesManlistAction } from '../../../redux/actions/salesMan_action';
import context from '../../../context/CreateNewButtonContext';
import MaterialTable, { MTablePagination, MTableToolbar } from 'utils/SafeMaterialTable';
import { Button, Card, IconButton, InputAdornment, TablePagination, TextField, Typography } from '@mui/material';
import EmojiPeopleTwoToneIcon from '@mui/icons-material/EmojiPeopleTwoTone';
import Salesman from './index';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import SalesmanOrder from './SalesmanOrder';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle,font14_500 } from 'utils/pageSize';
import { getTrimmedData } from 'components/trimFunction';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CommonSearch from 'utils/commonSearch';
import { titleURL } from 'http-common';
import AddIcon from '@mui/icons-material/Add';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import {
    getStickyTableOptions,
    stickyTableComponents,
  } from '../../../utils/stickyTableLayout';
//class
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';


class SalesmanList extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.state = {
      sales_data: {},
      open: false,
      edit_id_data: [],
      dialog: { dialog_open: false, msg: '', severity: '' },
      status: '',
      delete: false,
      id: '',
      salesman_item: [],
      newOpen : false,
      rowPopup: { open: false, rowIndex: '' },
      salesmanlist:[],
      page: 0,
      pageSize: 20,
      searchVal: '',
      searchPageData: [],
      salesmanId: null
    }
      this.storage = getsessionStorage();
  }

  async componentDidMount() {
    const context = this.context;
    this.props.set_searchSalesManAction({data:[], numRows:0})
    const paginationData = {
      pageCount: 0, 
      numPerPage: pageSize,
      page: "SalesManList"
    }
     const selectedRole = this.storage.role_name
     this.props.getMenuAccessAction(selectedRole)
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      // this.props.getonlySalesmanDataAction(context.setModalTypeHandler, context.setLoaderStatusHandler),
      this.props.listSalesManPaginateAction(
        paginationData,
        context.setModalTypeHandler, 
        context.setLoaderStatusHandler),
      this.props.getUserRightsByRoleIdAction()
	  );
    this.setState({salesmanlist: this.props.getSalesmanData})
  }

  handlePageSizeChange = async (size) => {
    if (this.state.searchVal) {
      this.setState({pageSize: size});
      let pageChangeData = this.state.searchPageData?.slice(
        (0 + size) * this.state.page,
        size * (this.state.page + 1),
      );
      return this.setState({searchData: pageChangeData});
    }

    this.setState({pageSize: size}, async () => {
      const context = this.context;
      const data = {pageCount: this.state.page || 0, numPerPage: size}
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.listSalesManPaginateAction(
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        )
      );
    });
  };

  handlePageChange = async (page) => {
    if (this.state.searchVal) {
      this.setState({page: page});
      let pageChangeData = this.state.searchPageData?.slice(
        (0 +  pageSize) * page,
         pageSize * (page + 1),
      );
      return this.setState({searchData: pageChangeData});
    }

    this.setState({page: page});
    const context = this.context;
    const data = {pageCount: this.state.page || 0, numPerPage: pageSize}
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listSalesManPaginateAction(
        data,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        // {pageCount: page || 0, numPerPage:  pageSize},
      )
	  );
  };

  handleSubmit = async (newData) => {
    const context = this.context;
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.updateSalesManlistAction(newData,context.setModalTypeHandler, context.setLoaderStatusHandler)
	  );
    const data = {pageCount: this.state.page || 0, numPerPage: pageSize}
    await apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listSalesManPaginateAction(data,context.setModalTypeHandler, context.setLoaderStatusHandler)
	  );
  }

  handleClose = () => {
    const context = this.context;
    this.setState({ open: false, delete: false });
    this.setState({ ...this.state.dialog, dialog: { dialog_open: false } });
    this.setState({
      rowPopup: { open: false, rowIndex: '' },
    });
    const data = {pageCount: this.state.page || 0, numPerPage: pageSize}
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listSalesManPaginateAction(
        data,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      )
	  );
  };

  rowPopupClose = () => {
    this.setState({ rowPopup: { open: false, rowIndex: '' } });
  };

  handledialog = (id) => {
    this.setState({ delete: true, id: id });
  };

  requestSearch = (e) => {
    const context = this.context;
    let val = e.target.value;
    this.setState({searchVal: val});

    // if(val.trim() !== ''){
    if(val.length >= 3 || val.length === 0) {
      this.props.set_searchSalesManAction({data:[], numRows:0})
    }
    // }
    const body = {
      searchString:val,
      employeeId:context.commoncookie,
      headerLocationId:context.headerLocationId
    }
    this.props.get_searchSalesManAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      )
  };

  cancelSearch = (e) => {
    this.setState({searchPageData: [], page: 0, searchVal: ''});
    this.props.set_searchSalesManAction({data:[], numRows:0})
  };

  render() {
        let storage = getsessionStorage()
    // console.log(this.state.salesmanId,"salesmanId")
        // const { user_rights } = this.props;
         const selectedRole = this.storage.role_name
        const CustomerMappingAddRights = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'sales_man__customer_mapping', 'can_create')
    return (
      <Card sx={{ height: 'calc(100vh - 80px)' }}>
         <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | SalesManList </title>
          </Helmet>
  

        {this.state.open === false && this.state.rowPopup.open === false && (

          <MaterialTable
             style={{ height: '100%', overflow: 'hidden' }}
            components={{
              ...stickyTableComponents,
              Toolbar: (props) => (
                <>
                  <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                    <div style={{ width: '100%' }} >
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
                                  display: "flex",
                                  justifyContent: "flex-end",
                                  alignItems: "center",
                                   padding: "8px 16px",
                                   }}>
                                    <TablePagination
                                    {...props}
                                    count={this.props.paginationCount} 
                                    page={this.state.page}
                                    onPageChange={(event, page) => this.handlePageChange(page)}
                                    onRowsPerPageChange={(event) => this.handlePageSizeChange(Number(event.target.value))}/>
                                    </div>),
            }}

            // actions={[
            //   // {
            //   //   tooltip: "Customer mapping",
            //   //   icon: "add",
            //   //   onClick: (event, rowData) => alert("You saved " + rowData.name)
            //   // },
            //   rowData => ({
            //     icon: 'add',
            //     tooltip: 'Customer mapping',
            //     onClick: (event, rowData) => {
            //       this.setState({
            //         open: true,
            //         salesman_item : rowData.employee_id
            //       })
            //   }

            //   }),
            //   // {
            //   //   tooltip: "transfer",
            //   //   icon: "edit",
            //   //   onClick: (evt, data) =>{
            //   //     this.setState({
            //   //     newOpen: true
            //   //     })
            //   //   }
            //   // }
            //   // {
            //   //   icon: 'edit',
            //   //   tooltip: 'transfer',
            //   //   position: 'row',
            //   //   onClick: (event, rowData) => {}
            //   // },
            // ]}
            onRowClick={(evt, rowData) => {
              console.log(rowData,"rowData")
              if (evt.target.closest('.addIcon')) return
              this.setState({
                rowPopup: {
                  open: true,
                  rowIndex: rowData,
                },
                salesmanId:rowData.employee_id

              });
            }}


            options={getStickyTableOptions({
               headerStyle,
                bodyOffset: 200,
              cellStyle,
              options:{
                 search: false,
              exportButton: true,
              // filtering: true,
              maxBodyHeight: maxBodyHeight,
              pageSize: pageSize,
              tableLayout: "auto",
                toolbar: true,
              pageSizeOptions: [20,50,100],
              // actionsColumnIndex: -1,
              }
            })}
            // editable={{
            //   onRowUpdate: (newData, oldData) => {
            //     return new Promise((resolve, reject) => {
            //       setTimeout(() => {
            //         const dataUpdate = [...this.props.getSalesmanData];
            //         // In dataUpdate, find target
            //         const target = dataUpdate.find((el) => el.id === oldData.id);
            //         const index = dataUpdate.indexOf(target);
            //         dataUpdate[index] = newData;
            //         this.setState({salesmanlist: [...dataUpdate]});
            //         this.handleSubmit(newData);
            //         resolve();
            //       }, 1000);
            //     });
            //   },
            // }}

            page={this.state.page}
            onPageChange={(page) => this.handlePageChange(page)}
            onRowsPerPageChange={(size) => this.handlePageSizeChange(size)}

            columns={[

              { title: 'Name', field: 'full_name' },
              { title: 'Contact No', field: 'phone_number' },
              { title: 'No Of Customer Mapped', field: 'no_of_customer_mapped', cellStyle: { textAlign: 'center' }, headerStyle: { textAlign: 'center' },},
              {
                title: 'Customer Mapping',
                field: 'customer_mapping',
                cellStyle: { textAlign: 'center' },
                headerStyle: { textAlign: 'center' },
                sorting: false,
                render: rowData => (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {CustomerMappingAddRights && (<IconButton
                      className="addIcon"
                      size="small"
                      onClick={() => this.setState({ open: true, salesman_item: rowData.employee_id })}
                    >
                      <AddIcon />
                    </IconButton>)}
                  </div>
                )
              }
            ]}
            // data={this.state.salesmanlist.length === 0 ? this.props.getSalesmanData : this.state.salesmanlist }

            data = {this.props.searchSalesManData?.length > 0 || this.state.searchVal ? this.props.searchSalesManData : this.props.salesManByPagination}

            title={
              <Typography variant='h6' align='left' style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                SalesMan List</Typography>}

          />
        )}

        {
          this.state.rowPopup.open === true && <SalesmanOrder
            rowIndex={this.state.rowPopup.rowIndex}
            handleDelete={this.handledialog}
            handleClose={this.handleClose}
            rowPopupClose={this.rowPopupClose}
            salesmanId={this.state.salesmanId}
          />

        }

        {
          this.state.open === true && (
            <React.Fragment>
              <Salesman
                open={this.state.open}
                handleClose={this.handleClose}
                salesman_item={this.state.salesman_item}
              />
            </React.Fragment>
          )
        }
      </Card>
    )



  }
}

const mapStateToProps = (state) => {
  return {
    getSalesmanData: state.salesManReducer.getSalesmanData || [],
    searchSalesManData : state.salesManReducer.searchSalesManData,
    salesManByPagination:state.salesManReducer.salesManByPagination || [],
    paginationCount: state.salesManReducer.salesManByPaginationCount,
     menuAccess: state.rbacReducer.menuAccess || []
    // user_rights: state.roleReducer.user_rights || []
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    getonlySalesmanDataAction: (data, setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(getonlySalesmanDataAction(data, setModalTypeHandler, setLoaderStatusHandler));
    },
    listSalesManPaginateAction: (data, setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(listSalesManPaginateAction(data, setModalTypeHandler, setLoaderStatusHandler));
    },
    updateSalesManlistAction: (data, setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(updateSalesManlistAction(data, setModalTypeHandler, setLoaderStatusHandler));
    },
    set_searchSalesManAction: (val ) => { 
      return dispatch(set_searchSalesManAction(val));
    },
    get_searchSalesManAction: (val,setModalTypeHandler,setLoaderStatusHandler) => { 
      return dispatch(get_searchSalesManAction(val, setModalTypeHandler,setLoaderStatusHandler));
    },
    getUserRightsByRoleIdAction:()=>{
      return dispatch(getUserRightsByRoleIdAction())
    },
        getMenuAccessAction:(selectedRole)=>{
          dispatch(getMenuAccessAction(selectedRole))
        },
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(SalesmanList);

