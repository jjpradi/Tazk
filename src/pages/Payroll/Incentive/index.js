import React, { Component } from 'react';
import { connect } from 'react-redux';
import MaterialTable, { MTablePagination, MTableToolbar } from 'utils/SafeMaterialTable';
import _ from 'lodash';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { TablePagination, Typography } from '@mui/material';
import apiCalls from 'utils/apiCalls';
import { Helmet } from "react-helmet-async";
import { maxBodyHeight, pageSize, headerStyle, cellStyle } from 'utils/pageSize';
import CommonSearch from 'utils/commonSearch';
import { titleURL } from 'http-common';
import NewIncentive from './newIncentive';
import { deleteSalesmanIncentiveAction, getAllIncentivesAction, incentivePaginationAction, searchIncentiveAction, set_searchIncentiveAction, updateSalesmanIncentiveAction } from 'redux/actions/sales_actions';
import moment from 'moment';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import {
    getStickyTableOptions,
    stickyTableComponents,
  } from '../../../utils/stickyTableLayout';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { getsessionStorage } from 'pages/common/login/cookies';

 

class SalesmanIncentive extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.state = {
      schemes_data: [],
      open: false,
      edit_id_data: [],
      dialog: { open: false, msg: '', severity: '' },
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
    this.props.set_searchIncentiveAction({ data: [], numRows: 0 })
    this.props.getAllIncentivesAction()
    const context = this.context;
    const selectedRole = this.storage?.role_name;
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
      this.props.incentivePaginationAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      ),
        this.props.getMenuAccessAction(selectedRole)
      // this.props.getUserRightsByRoleIdAction()
  ).finally(() => this.setState({ isApiFinished: true }))
  }

  async componentDidUpdate(prevProps, prevState) {
    const context = this.context;

    if (prevState.page !== this.state.page) {

      const body = {
        pageCount: this.state.page,
        numPerPage: this.state.pageSize,
        searchString: this.state.searchVal,
        employeeId: context.commoncookie,
        location_id: context.headerLocationId
      }
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.incentivePaginationAction(body)
      )
    }
    if (prevState.pageSize !== this.state.pageSize) {
      const body = {
        pageCount: this.state.page,
        numPerPage: this.state.pageSize,
        searchString: this.state.searchVal,
        employeeId: context.commoncookie,
        location_id: context.headerLocationId
      }
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.incentivePaginationAction(body)
      )
    }

  }

  handlePageSizeChange = async (size) => {
    this.setState({ pageSize: size })
    const context = this.context;
  }

  handlePageChange = async (page) => {
    const context = this.context;
    this.setState({ page: page })
  }

  handleEdit = async (id) => {
      let getId = await this.props.searchIncentiveData
        .map((m) => {
          return m.id === id ? m : null;
        })
        .filter((f) => f !== null);
      await this.setState({ edit_id_data: getId, open: true });
  };

  handleDelete = async (id) => {
    const context = this.context;
    const body = {
      incentive_id: id
    };
    const body2 = {
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: '',
      employeeId: context.commoncookie,
      headerLocationId: context.headerLocationId
    }
    try {
      await this.props.deleteSalesmanIncentiveAction(body);
      this.props.incentivePaginationAction(body2)
    } catch (error) {
      console.error("Error deleting incentive:", error);
    }

    this.setState({ delete: false });
  };

  handledialog = (id) => {
    this.setState({ delete: true, id: id });
  };
  handleClose = (id) => {
    this.props.set_searchIncentiveAction({ data: [], numRows: 0 })
    const context = this.context;
    const body = {
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: '',
      employeeId: context.commoncookie,
      headerLocationId: context.headerLocationId
    }
    this.setState({ open: false, dialog: false, delete: false });
    this.props.incentivePaginationAction(body)
  };
  responseDialog = async (res, resSeverity) => {
    await this.setState({
      ...this.state.dialog,
      dialog: { msg: res, severity: resSeverity, open: true },
    });
  };
  handleSubmit = async (data) => {

    const context = this.context;
    if (data.id) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.updateSalesmanIncentiveAction(
          data.id,
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler, () => {
            this.setState({ open: false });
          }
        )
      );
      this.setState({ open: false, dialog: false, delete: false });
    } else {

      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.createSchemesAction(
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler, () => {
            this.setState({ open: false });
          }
        )
      );
      this.setState({ open: false, dialog: false, delete: false });
    }
  };
  requestSearch = (e) => {
    const context = this.context;
    let val = e.target.value;
    this.setState({ searchVal: val, page: 0 });
    if(val.length >= 3 || val.length === 0) {
      this.props.set_searchIncentiveAction({ data: [], numRows: 0 })
    }

    const body = {
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: val.toLowerCase(),
      employeeId: context.commoncookie,
      headerLocationId: context.headerLocationId
    }

    this.props.searchIncentiveAction(
      body,
      context.setModalTypeHandler,
      context.setLoaderStatusHandler
    )
  }
  cancelSearch = () => {
    const context = this.context;
    this.setState({ searchPageData: [], page: 0, searchVal: '' });
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
      this.props.incentivePaginationAction(body)
    )
  }

  render() {
      const storage = getsessionStorage()
       const { menuAccess = {} } = this.props;
       const selectedRole = this.storage?.role_name;
        // const { user_rights } = this.props;
        const IncentivesAddRights = UserRightsAuthorization(menuAccess[selectedRole], 'sales_man__incentives', 'can_create')
        const IncentivesEditRights = UserRightsAuthorization(menuAccess[selectedRole], 'sales_man__incentives', 'can_edit')
        const IncentivesDeleteRights = UserRightsAuthorization(menuAccess[selectedRole], 'sales_man__incentives', 'can_delete')

    return (
      <div
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
            style={{ height: 'calc(100vh - 90px)'}}
            totalCount={this.props.searchIncentiveCount}
            components={{
              ...stickyTableComponents,
              Pagination: (props) => (
                               <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                     padding: "8px 16px",
                     }}>
                                   <TablePagination   //change it MtablePagination
                                   {...props}
                                   count={this.props.searchIncentiveCount} 
                                   page={this.state.page}
                                   onPageChange={(event, page) => this.handlePageChange(page)}
                                   onRowsPerPageChange={(event) => this.handlePageSizeChange(Number(event.target.value))}/>
                                   </div>),
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
                    </div>
                  </div>
                </>
              ),
            //   Pagination: (props) => (
            //     <div
            //       style={{
            //         display: 'flex',
            //         justifyContent: 'flex-end',
            //         borderTop: 'none',
            //         boxShadow: 'none',
            //         padding: '8px 16px',
            //         borderBottom: 'none',
            //       }}
            //     >
            //       <TablePagination
            //         {...props}
            //         style={{
            //           borderTop: 'none',
            //           borderBottom: 'none',
            //           boxShadow: 'none',
            //           width: 'auto',
            //         }}
            //       />
            //     </div>
            //   ),
            }}
            actions={[
              IncentivesEditRights ? {
                icon: 'edit',
                tooltip: 'edit',
                position: 'row',
                onClick: (event, rowData) => this.handleEdit(rowData.id),
              } : null,
              IncentivesDeleteRights ? {
                icon: 'delete',
                tooltip: 'Delete',
                onClick: (event, rowData) => this.handledialog(rowData.id),
              } : null,
              IncentivesAddRights ? {
                icon: 'add',
                tooltip: 'add',
                isFreeAction: true,
                onClick: (event, rowData) =>
                  this.setState({ edit_id_data: [], open: true }),
              } : null,
            ]}
            onPageChange={(page) => this.handlePageChange(page)}
            onRowsPerPageChange={(size) => this.handlePageSizeChange(size)}
            options={getStickyTableOptions({
              headerStyle,
              // bodyOffset: 200,
              cellStyle,
              options:{
                showEmptyDataSourceMessage: this.state.isApiFinished,
              search: false,
              exportButton: true,
              filtering: false,
              actionsColumnIndex: -1,
              maxBodyHeight: maxBodyHeight,
              pageSize: pageSize,
              tableLayout: "auto",
                toolbar: true,
              pageSizeOptions: [20, 50, 100],
              }
            })}
            page={this.state.page}
            columns={[
              { title: 'Id', field: 'id' },
              { title: 'Incentive name', field: 'incentive_name' },
              { title: 'Target type', field: 'target_type' },
              { 
                title: 'From', 
                field: 'start_date',
                render: rowData => moment(rowData.start_date).format('DD/MM/YYYY') 
              },
              { 
                title: 'To', 
                field: 'end_date',
                render: rowData => moment(rowData.end_date).format('DD/MM/YYYY') 
              },
              {
                title: 'Target Volume',
                field: 'target_volume',
                render: rowData => rowData.target_volume === 0 ? null : rowData.target_volume
              },
              { title: 'Target Value', field: 'target_value', align: 'right', cellStyle: { textAlign: 'right', paddingRight: '10px' }},
              { title: 'Notes', field: 'notes' },
            ]}
            data={this.props.searchIncentiveData}
            title={
              <Typography variant='h6' align='left' style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                Incentives
              </Typography>}
          />
        )}
        {this.state.open && (
          <NewIncentive
            schemes={this.props.schemes}
            edit_id_data={this.state.edit_id_data}
            handleClose={this.handleClose}
            handleSubmit={this.handleSubmit}
            {...this.props}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    searchIncentiveData: state.salesManReducer.searchIncentiveData,
    getAllSalesmanIncentive: state.salesManReducer.getAllSalesmanIncentive,
    searchIncentiveCount: state.salesManReducer.searchIncentiveCount,
    // user_rights:state.roleReducer.user_rights,
    menuAccess: state.rbacReducer.menuAccess || []
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    getAllIncentivesAction: () => {
      dispatch(getAllIncentivesAction());
    },
    updateSalesmanIncentiveAction: (
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        updateSalesmanIncentiveAction(
          id,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    deleteSalesmanIncentiveAction: (id, setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(
        deleteSalesmanIncentiveAction(id, setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    searchIncentiveAction: (val, setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(searchIncentiveAction(val, setModalTypeHandler, setLoaderStatusHandler))
    },
    set_searchIncentiveAction: (val) => {
      return dispatch(set_searchIncentiveAction(val));
    },
    incentivePaginationAction: (data) => {
      return dispatch(incentivePaginationAction(data));
    },
    getUserRightsByRoleIdAction: () => {
      return dispatch(getUserRightsByRoleIdAction())
    },
     getMenuAccessAction: (data) => {
      return dispatch(getMenuAccessAction(data))
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SalesmanIncentive);

