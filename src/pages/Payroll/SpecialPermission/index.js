import React, {Component} from 'react';
import {connect} from 'react-redux';
import MaterialTable from 'utils/SafeMaterialTable';
import NewSpecialPermission from './NewSpecialPermission';

import {
    ListSpecialPermissions,CreateSpecialPermissions, getbyidSpecialPermissionAction, UpdateSpecialPermission, DeleteSpecialPermission,
    getSpecialPermissionCreatedYearsAction
} from '../../../redux/actions/specialPermission_actions';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext'; 
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import Cookies from 'universal-cookie';
import { Autocomplete, Button, Dialog, DialogActions, DialogContent, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle } from 'utils/pageSize';
import { MTableToolbar } from 'utils/SafeMaterialTable';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { getSearchSpecialPermissionAction, setSearchSpecialPermission} from '../../../redux/actions/specialPermission_actions'
import CommonSearch from 'utils/commonSearch';
import { commonDateFormat, commonDateFormat1 } from 'utils/getTimeFormat'; 
import { titleURL } from 'http-common';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { salaryConfirmedByYearAction } from 'redux/actions/salary_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

const commonCellStyle = {
  fontFamily: "poppins",
  fontSize: "11px",
  fontWeight: "400",
  color: 'rgba(0, 0, 0, 0.7)',
};
class SpecialPermissions extends Component {
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
      id: '',
      searchVal: '',
      a: [],
      page: 0,
      pageSize: [],
      searchPageData: [],
      searchData: [],
      isApiFinished: false,
      rowData: [],
      date: '',
      openFilterDialog:false,
      created_year: [],
      filterYear: null
    };
    this.cookies = new Cookies();
  }

  storage = getsessionStorage()

  async componentDidMount() {
    this.props.setSearchSpecialPermission([]);
    const context = this.context;
    const currentYear = new Date().getFullYear();
    const body = {
      numPerPage: pageSize,
      pageCount: 0,
      searchString: this.state.searchVal,
      year:currentYear
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.getSearchSpecialPermissionAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      ),
      this.props.getUserRightsByRoleIdAction(),
      this.props.salaryConfirmedByYearAction()
    ).finally(() => this.setState({isApiFinished: true}));
    if (this.props.setModalStatusHandler) this.setState({ open: true });
  }

  handleEdit = async (rowData) => {
    this.setState({rowData: rowData});
    this.setState({open: true, status: 'edit'});
  };
  handleDelete = async (id,ledger_id,date) => {
    const context = this.context;
    const data = {
      date: date
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.DeleteSpecialPermission(
        data,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      )
	  );
   
    this.setState({delete: false});
  };
  handledialog = (permission_date) => {
    this.setState({delete: true, date: permission_date});
  };
  
  checkTimePast = (time) => {
    if (time) {
      const [hours, minutes, seconds] = time.split(':');
      const date = new Date();
      const now = new Date();
      date.setHours(hours, minutes, seconds);
      return date < now;
    }
    return false;
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
   
    if (this.props.setModalStatusHandler) {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('stocklocation', true);
    }
  };

  handleSubmit = async (data,initialState) => {
    
    const context = this.context;
    const body = {
      data: data,
      oldData: initialState
    }  
    if (data.id) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.UpdateSpecialPermission(
          body,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.sample,
        )
       );
    } else {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.CreateSpecialPermissions(
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.sample,
        )
       );
    }
  };

  cancelSearch = (e) => {
    const context = this.context;
    this.setState({ searchData: [], searchPageData: [], page: 0, searchVal: '' });
    this.props.setSearchSpecialPermission([])
    const body = {
      numPerPage: pageSize,
      pageCount: 0,
      searchString: ''
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.getSearchSpecialPermissionAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      )
    ).finally(() => this.setState({isApiFinished: true}));
  };
////search func()--------------->///////////
  requestSearch = (e) => {
    this.setState({ searchData: [], searchPageData: [], page: 0, isApiFinished: false });
    const context = this.context;
    let val = e.target.value;
    this.setState({ searchVal: val });
    this.props.setSearchSpecialPermission({ data: [], numRows: 0 })
    const body = {
      numPerPage: !this.state.pageSize.length ? pageSize : this.state.pageSize,
      pageCount: 0,
      searchString: val
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.getSearchSpecialPermissionAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      )
    ).finally(() => this.setState({isApiFinished: true}));
  };
///nxt page func()////////-->
  handlePageChange = async (page) => {
    this.setState({ page: page, isApiFinished: false });
    const context = this.context;
    const body = {
      numPerPage: pageSize,
      pageCount: page || 0,
      searchString : this.state.searchVal
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.getSearchSpecialPermissionAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      )
    ).finally(() => this.setState({isApiFinished: true}));
  };
  /////page total row func()////
  handlePageSizeChange = async (size) => {
    this.setState({ pageSize: size, isApiFinished: false }, async () => {
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
        this.props.getSearchSpecialPermissionAction(
          body,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler
        )
      ).finally(() => this.setState({isApiFinished: true}));
    })
  }
    
  checkPast = (spDate) => {
    let currentDate = new Date();
    let today = currentDate.toISOString().slice(0, 10); 
    const holidayDateStr = new Date(spDate).toISOString().slice(0, 10);

    return holidayDateStr >= today;
};

  handleOpenFilterDialog = async () => {
    try {
      const res = await this.props.getSpecialPermissionCreatedYearsAction();
      const apiData = res.data || res;
  
      const yearsArray = Array.isArray(apiData)
        ? apiData.map(item => item.created_year)
        : [];
  
      this.setState({
        created_year: yearsArray,
        openFilterDialog: true,
      });
    } catch (error) {
      this.setState({ openFilterDialog: true });
    }
  };
  

  handleApplyYearFilter = async () => {
    const context = this.context;
    const { pageSize, searchVal, filterYear } = this.state;
    const perPage = pageSize && typeof pageSize === 'number' ? pageSize : 10;
    const selectedYear = filterYear ? Number(filterYear) : new Date().getFullYear();
  
    const body = {
      numPerPage: perPage,
      pageCount: 0,
      searchString: searchVal || '',
      year: selectedYear 
    };
  
    try {
      await this.props.getSearchSpecialPermissionAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      );
      this.setState({ openFilterDialog: false });
    } catch (error) {
      console.error('Error', error);
    }
  };

  isSalaryConfirmed = (permission_date) => {
    const date = new Date(permission_date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return this.props.salaryConfirmedByYear?.some(
      (item) => item.month === month && item.year === year
    );
  };

  render() {
    const createholiday = getRoleAuthorization(this.props.user_rights,'Create Holidays & SpecialPermissions');
    const editPermission = getRoleAuthorization(this.props.user_rights,'Edit Holidays & Special Permissions')
    const showAddIcon = this.storage.role_name !== 'Employee' && createholiday;
    const categoryIdFromStorage = this.storage.category_id 
    const filteredData = this.storage.role_name === "Employee" && this.props.searchSpecialPermissionData?.data 
    ? this.props.searchSpecialPermissionData?.data.filter(item =>
      Array.isArray(item.category_id) && item.category_id.includes(categoryIdFromStorage)
    )
  : this.props.searchSpecialPermissionData?.data  || []; 
  const selectedRole = this.storage.role_name
  const permissionCreate = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'holidays__special_permissions', 'can_create');
  const permissionEdit = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'holidays__special_permissions', 'can_edit');
  const permissionDelete = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'holidays__special_permissions', 'can_delete');

    return (
      <div>
       <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | Holidays & Special Permissions </title>
      </Helmet>
        <CreateNewButtonContext.Consumer>
          {({setModalStatusHandler, setModalTypeHandler, drawerOpen, commoncookie,
      headerLocationId,
      setLoaderStatusHandler,}) => (
            <div
            >
              <AlertDialog
                delete={this.state.delete}
                handleClose={this.handleClose}
                handleDelete={this.handleDelete}
                date={this.state.date}
              />
              {this.state.open === false && (
                <MaterialTable
                totalCount={this.props.searchSpecialPermissionData?.numRows}
                components={{
                  Toolbar: (props) => (
                    <div>
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
                        <IconButton onClick={this.handleOpenFilterDialog}>
                          <FilterAltIcon />
                        </IconButton>
                        <div>
                          <CommonSearch
                            searchVal={this.state.searchVal}
                            cancelSearch={this.cancelSearch}
                            requestSearch={this.requestSearch}
                          />
                        </div>
                      </div>
                      {/* Dialog box */}
                      <Dialog
                        open={this.state.openFilterDialog}
                        onClose={() => this.setState({ openFilterDialog: false })}
                        maxWidth="xs"
                        fullWidth
                      >
                        <DialogContent>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <Autocomplete
                              options={this.state.created_year}
                              value={this.state.filterYear}
                              onChange={(event, newValue) => {
                                this.setState({ filterYear: newValue });
                              }}
                              renderInput={(params) => (
                                <TextField {...params} label="Select Year" margin="dense" fullWidth variant="outlined" />
                              )}
                            />
                          </LocalizationProvider>
                        </DialogContent>
                        <DialogActions>
                          <Button
                            onClick={() => this.setState({ openFilterDialog: false })}
                            variant='contained'
                            color="secondary"
                          >
                            Clear
                          </Button>
                          <Button
                            onClick={this.handleApplyYearFilter}
                            variant='contained'
                            color="primary"
                          >
                            Apply
                          </Button>
                        </DialogActions>
                      </Dialog>
                    </div>
                  ),
                }}
                  actions={[
                    (this.storage.role_name !== "Employee" && permissionEdit) &&
                    ((rowData) => {
                      const isConfirmed = this.isSalaryConfirmed(rowData.permission_date);
                      return {
                        icon: "edit",
                        position: "row",
                        tooltip: !isConfirmed ? "Edit" : "",
                        iconProps: {
                          style: {
                            cursor: !isConfirmed ? "pointer" : "default",
                            color: !isConfirmed ? "#000000" : "#ebe1e1",
                          },
                        },
                        onClick: (event, rowData) => {
                          if (!isConfirmed) {
                            this.handleEdit(rowData);
                          }
                        },
                        // hidden: !editPermission,
                      };
                    }),
                    (this.storage.role_name !== "Employee" && permissionDelete) &&
                    ((rowData) => {
                     const isConfirmed = this.isSalaryConfirmed(rowData.permission_date);
                      return {
                        icon: "delete",
                        tooltip: !isConfirmed ? "Delete" : "",
                        iconProps: {
                          style: {
                            cursor: !isConfirmed ? "pointer" : "default",
                            color: !isConfirmed ? "#000000" : "#ebe1e1",
                          },
                        },
                        onClick: (event, rowData) => {
                          if (!isConfirmed) {
                            this.handledialog(rowData.permission_date);
                          }
                        },
                        // hidden: !editPermission,
                      };
                    }),
                    permissionCreate && {
                      icon: 'add',
                      tooltip: 'Add',
                      isFreeAction: true,
                      onClick: () =>
                        this.setState({
                          edit_id_data: [],
                          open: true,
                          status: 'create',
                        }),
                    }
                  ]}
                  
                  
                  onPageChange={(page) => this.handlePageChange(page)}
                  onRowsPerPageChange={(size) =>
                    this.handlePageSizeChange(size)
                  }
                  options={{
                    showEmptyDataSourceMessage: this.props.searchSpecialPermissionData?.data?.length === 0 && this.state.isApiFinished ? true : false,
                    headerStyle,
                    cellStyle,
                    exportButton: true,
                    filtering: false,
                    actionsColumnIndex: -1,
                    maxBodyHeight: maxBodyHeight,
                    paging: true,
                    pageSize: pageSize,
                    pageSizeOptions: [20, 50, 100],
                    search: false,
                  }}
                  style={{
                    boxShadow: 'none',
                    border: 'none',
                  }}
                  page={this.state.page}
                  columns={[
                    {
                      field: 'name',
                      title: 'Name',
                      cellStyle: {textTransform:"capitalize",commonCellStyle}
                    },
                    {
                      field: 'permission_date',
                      title: 'Date',
                      cellStyle: commonCellStyle,
                      render: (rowData) => (
                        commonDateFormat(rowData.permission_date)
                      )
                    },
                    {
                        field: 'start_time',
                        title: 'Start Time',
                        cellStyle: commonCellStyle,
                        render: (rowData) => {
                            const startTime = rowData?.start_time;
                            if (startTime) {
                              const [hours, minutes, seconds] = startTime.split(':');
                              const date = new Date();
                              date.setHours(hours, minutes, seconds);
                              return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
                            }
                            return ''; 
                          }
                      },
                      {
                        field: 'end_time',
                        title: 'End Time',
                        cellStyle: commonCellStyle,
                        render: (rowData) => {
                            const endTime = rowData?.end_time;
                            if (endTime) {
                              const [hours, minutes, seconds] = endTime.split(':');
                              const date = new Date();
                              date.setHours(hours, minutes, seconds);
                              return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
                            }
                            return ''; 
                          }
                      },
                      {
                        field: 'hours',
                        title: 'Hours'
                      },
                      {
                        field: 'category_name',
                        title: 'Category Name',
                        cellStyle: commonCellStyle,
                        render: (rowData) => (
                            rowData.category_name && rowData.category_name.length > 0
                              ? rowData.category_name.join(', ')
                              : ''
                          )
                      },
                    
                  
                  ]}

                  data={
                    filteredData
                  }
                  title={
                    <Typography  className='page-title'>
                    Special Permissions</Typography>}
                />
              )}
              {this.state.open && (
                <NewSpecialPermission
                  status={this.state.status}
                  edit_id_data={this.state.rowData}
                  handleClose={this.handleClose}
                  handleSubmit={this.handleSubmit}
                  {...this.props}
                  type='stockLocation'
                  setModalStatusHandler={setModalStatusHandler}
                  setModalTypeHandler={setModalTypeHandler}
                  declaredHolidays = {this.props.searchSpecialPermissionData?.alldates}
                />
              )}
            </div>
          )}
        </CreateNewButtonContext.Consumer>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
  
      specialPermissiongetbyid:state.SpecialPermissionReducers?.specialPermissiongetbyid || [],
      specialPermissionlist:state.SpecialPermissionReducers?.specialPermissionlist || [],
      searchSpecialPermissionData:state.SpecialPermissionReducers?.searchSpecialPermissionData || [],
      user_rights: state.roleReducer?.user_rights || [],
      salaryConfirmedByYear: state.SalaryReducers.salaryConfirmedByYear || [],
      menuAccess : state.rbacReducer.menuAccess || []
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
 
    ListSpecialPermissions: (
        setModalTypeHandler,
        setLoaderStatusHandler,
        
      ) => {
        return dispatch(
          ListSpecialPermissions(
            setModalTypeHandler,
            setLoaderStatusHandler,
           
          ),
        );
      },
      CreateSpecialPermissions: (
        data,setModalTypeHandler,
        setLoaderStatusHandler,
        sample
        
      ) => {
        return dispatch(
          CreateSpecialPermissions(
           data, setModalTypeHandler,
            setLoaderStatusHandler,
            sample
           
          ),
        );
      },
   
    getbyidSpecialPermissionAction: (
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        getbyidSpecialPermissionAction(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    UpdateSpecialPermission: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    ) => {
      return dispatch(
        UpdateSpecialPermission(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
        ),
      );
    },
    DeleteSpecialPermission: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        DeleteSpecialPermission(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    setSearchSpecialPermission: (val ) => { return dispatch(setSearchSpecialPermission(val))
    },
    getSearchSpecialPermissionAction: (
      val, 
      setModalTypeHandler,
      setLoaderStatusHandler,
      ) => { 
      return dispatch(
        getSearchSpecialPermissionAction(
          val, 
          setModalTypeHandler,
          setLoaderStatusHandler,
          )
        );
    },
    getUserRightsByRoleIdAction:()=>{
      return dispatch(getUserRightsByRoleIdAction())
    },
    salaryConfirmedByYearAction: () => {
      return dispatch(salaryConfirmedByYearAction())
    },
    getSpecialPermissionCreatedYearsAction:()=>{
      return dispatch(getSpecialPermissionCreatedYearsAction())
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SpecialPermissions);

