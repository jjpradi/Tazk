import React, {Component} from 'react';
//import NewCustomer from '../../../components/Customer';
import {connect} from 'react-redux';
import MaterialTable from 'utils/SafeMaterialTable';
import {
  getStickyTableOptions,
  stickyTableComponents,
} from 'utils/stickyTableLayout';
import NewHolidays from './Newholidays';

import {
    Listholidays,CreateHolidays, getbyidholidaysAction, updateHolidays, deleteHolidays,
    getHolidayCreatedYearsAction
} from '../../../redux/actions/holidays_actions';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext'; 
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import Cookies from 'universal-cookie';
import { Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, Tab, Tabs, TextField, Typography } from '@mui/material';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle } from 'utils/pageSize';
import { MTableToolbar } from 'utils/SafeMaterialTable';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { getSearchHolidayAction, setSearchHolidayState} from '../../../redux/actions/holidays_actions'
import CommonSearch from 'utils/commonSearch';
import { commonDateFormat, commonDateFormat1 } from 'utils/getTimeFormat'; 
import { titleURL } from 'http-common';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import SpecialPermissions from 'pages/Payroll/SpecialPermission/index'
import { getMonth } from 'date-fns';
import DoneIcon from '@mui/icons-material/Done';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { salaryConfirmedByYearAction } from 'redux/actions/salary_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

const commonCellStyle = {
  fontFamily: "poppins",
  fontSize: "11px",
  fontWeight: "400",
  color: 'rgba(0, 0, 0, 0.7)',
};
class Holidays extends Component {
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
      pageCount: 0,
      searchPageData: [],
      searchData: [],
      isApiFinished: false,
      rowData: [],
      date: '',
      activeTab: 0,
      filterYear: null,
      openFilterDialog:false,
      created_year: []
    };
    this.cookies = new Cookies();
  }

  storage = getsessionStorage()

  async componentDidMount() {
    this.props.setSearchHolidayState([]);
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
      //this.props.Listholidays(context.setModalTypeHandler, context.setLoaderStatusHandler)
      this.props.getSearchHolidayAction(
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
      this.props.deleteHolidays(
        data,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      )
	  );
   
    this.setState({delete: false});
  };

  handleTabChange = (event, newValue) => {
    this.setState({ activeTab: newValue });
  };


  handledialog = (holiday_date) => {
    this.setState({delete: true, date: holiday_date});
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
      // const {location_name} = data
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.updateHolidays(
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
        this.props.CreateHolidays(
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.sample,
        )
       );
    }
    // if (this.props.setModalStatusHandler) {
    //   this.props.setModalStatusHandler(false)
    //   this.props.setselectData('stockLocation', false)
    // }
  };

  cancelSearch = (e) => {
    const context = this.context;
    this.setState({ searchData: [], searchPageData: [], page: 0, searchVal: '' });
    this.props.setSearchHolidayState([])
    const body = {
      numPerPage: pageSize,
      pageCount: 0,
      searchString: ''
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.getSearchHolidayAction(
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
    this.props.setSearchHolidayState({ data: [], numRows: 0 })
    const body = {
      numPerPage: !this.state.pageSize.length ? pageSize : this.state.pageSize,
      pageCount: 0,
      searchString: val
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.getSearchHolidayAction(
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
      this.props.getSearchHolidayAction(
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
        this.props.getSearchHolidayAction(
          body,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler
        )
      ).finally(() => this.setState({isApiFinished: true}));
    })
  }
    

  checkPast = (holidayDate) => {
  if (!holidayDate) return false;

  try {
    const holiday = new Date(holidayDate);
    const today = new Date();

    // Convert to YYYY-MM-DD without time
    today.setHours(0, 0, 0, 0);
    holiday.setHours(0, 0, 0, 0);

    if (holiday < today) return false;

    const holidayMonth = holiday.getMonth() + 1;

    return this.props.searchHolidayData.salary.some(
      ({ salary_month }) => salary_month === holidayMonth
    );
  } catch (error) {
    console.error("Error parsing holidayDate:", error);
    return false;
  }
};

  handleOpenFilterDialog = async () => {
    try {
      const res = await this.props.getHolidayCreatedYearsAction();
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
    const { pageSize, searchVal, filterYear,pageCount} = this.state;
    const perPage = pageSize && typeof pageSize === 'number' ? pageSize : 10;
    const selectedYear = filterYear ? Number(filterYear) : new Date().getFullYear();

    const body = {
      numPerPage: perPage,
      pageCount: 0,
      searchString: searchVal || '',
      year: selectedYear
    };
  
    try {
      await this.props.getSearchHolidayAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      );
      this.setState({ openFilterDialog: false });
    } catch (error) {
      console.error('Error', error);
    }
  };

  isSalaryConfirmed = (holiday_date) => {
    const date = new Date(holiday_date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return this.props.salaryConfirmedByYear?.some(
      (item) => item.month === month && item.year === year
    );
  };

  render() {
  const createholiday = getRoleAuthorization(this.props.user_rights,'Create Holidays & SpecialPermissions');
  const { activeTab } = this.state;
  const editholiday = getRoleAuthorization(this.props.user_rights,'Edit Holidays & Special Permissions')
  const deleteholiday = getRoleAuthorization(this.props.user_rights,'Delete Holidays & Special Permissions')

  const showAddIcon = this.storage.role_name !== 'Employee' && createholiday;

  const categoryIdFromStorage = this.storage.category_id 
  const filteredData = this.storage.role_name === "Employee" && this.props.searchHolidayData.data
  ? this.props.searchHolidayData.data.filter(item =>
      Array.isArray(item.category_id) && item.category_id.includes(categoryIdFromStorage)
    )
  : this.props.searchHolidayData.data || []; // Default to empty array if data is undefined
  
  const selectedRole = this.storage.role_name
  const holidayCreate = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'holidays__list', 'can_create');
  const holidayEdit = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'holidays__list', 'can_edit');
  const holidayDelete = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'holidays__list', 'can_delete');


    return (
      <div>
       <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | Holidays & Special Permissions </title>
        </Helmet>
      {/* <Box
        sx={{
          width: '100%',
          backgroundColor: 'white', 
            boxShadow: 'none',
            border: 'none', 
          padding: 2, 
        }}> */}
          {/* Tabs Header */}
          {/* <Tabs
            value={activeTab}
            onChange={this.handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: 'black', 
              },
              '& .MuiTab-root.Mui-selected': {
                color: 'black', 
                fontWeight: 'bold', 
              },
              '& .MuiTab-root': {
                color: 'gray', 
              },
            }}
          >
            <Tab label="Holidays" />
            <Tab label="Special Permissions" />
          </Tabs> */}
        {/* </Box> */}
        
        <Box sx={{ padding: 2 }}>
          {/* Tabs Content */}
          {activeTab === 0 && (
            <div>
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
                totalCount={this.props.searchHolidayData.numRows}
                // style={{height:'87vh',overflow:'hidden'}}
                components={{
                  ...stickyTableComponents,
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
                    (this.storage.role_name !== 'Employee' && holidayEdit) && (
                      (rowData) => {
                        const isConfirmed = this.isSalaryConfirmed(rowData.holiday_date);

                        return {
                          icon: 'edit',
                          position: 'row',
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
                          // hidden: holidayEdit,
                        };
                      }
                    ),
                    (this.storage.role_name !== 'Employee' && holidayDelete) && (
                      (rowData) => {
                        const isConfirmed = this.isSalaryConfirmed(rowData.holiday_date);

                        return {
                          icon: 'delete',
                          tooltip: !isConfirmed ? "Delete" : "",
                          iconProps: {
                            style: {
                              cursor: !isConfirmed ? "pointer" : "default",
                              color: !isConfirmed ? "#000000" : "#ebe1e1",
                            },
                          },
                          onClick: (event, rowData) => {
                            if (!isConfirmed) {
                              this.handledialog(rowData.holiday_date);
                            }
                          },
                          // hidden: holidayDelete,
                        };
                      }
                    ),
                    holidayCreate && {
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
                  options={getStickyTableOptions({
                    bodyOffset:200,
                    headerStyle,
                    options:{
                      showEmptyDataSourceMessage: this.props.searchHolidayData?.data?.length === 0 && this.state.isApiFinished ? true : false,
                      cellStyle,
                      exportButton: true,
                      filtering: false,
                      actionsColumnIndex: -1,
                      toolbar:true,
                      // maxBodyHeight: maxBodyHeight,
                      // minBodyHeight: '480px',
                      paging: true,
                      pageSize: pageSize,
                      pageSizeOptions: [20, 50, 100],
                      search: false,
                          }
                  })}
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
                      field: 'holiday_date',
                      title: 'Date',
                      cellStyle: commonCellStyle,
                      render: (rowData) => (
                        commonDateFormat(rowData.holiday_date)
                      )
                    },
                    {
                      field: 'restricted_holiday',
                      title: 'Holiday Type',
                      headerStyle: {
                        width: "1px"
                      },
                      cellStyle: {
                        ...commonCellStyle,
                        width: "1px"
                      },
                      render: (rowData) => (
                        rowData.restricted_holiday === 1 
                        ? "Restricted" 
                        : "Regular" 
                      )
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
                    Holidays</Typography>}
                />
              )}
              {this.state.open && (
                <NewHolidays
                  status={this.state.status}
                  // edit_id_data={this.props.holidaygetbyid}
                  edit_id_data={this.state.rowData}
                  handleClose={this.handleClose}
                  handleSubmit={this.handleSubmit}
                  {...this.props}
                  type='stockLocation'
                  setModalStatusHandler={setModalStatusHandler}
                  setModalTypeHandler={setModalTypeHandler}
                  declaredHolidays = {this.props.searchHolidayData.alldates}
                />
              )}
            </div>
          )}
              </CreateNewButtonContext.Consumer>
              </div>
          )}

     {activeTab === 1 && (
            <div>
              {/* Special Permissions Content */}
              <SpecialPermissions />
            </div>
          )}
        </Box>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
  
      holidaygetbyid:state.HolidaysReducers.holidaygetbyid || [],
      holidaylist:state.HolidaysReducers.holidaylist || [],
      searchHolidayData:state.HolidaysReducers.searchHolidayData || [],
      user_rights: state.roleReducer.user_rights || [],
      salaryConfirmedByYear: state.SalaryReducers.salaryConfirmedByYear || [],
      menuAccess : state.rbacReducer.menuAccess || []
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
 
    Listholidays: (
        setModalTypeHandler,
        setLoaderStatusHandler,
        
      ) => {
        return dispatch(
          Listholidays(
            setModalTypeHandler,
            setLoaderStatusHandler,
           
          ),
        );
      },
      CreateHolidays: (
        data,setModalTypeHandler,
        setLoaderStatusHandler,
        sample
        
      ) => {
        return dispatch(
          CreateHolidays(
           data, setModalTypeHandler,
            setLoaderStatusHandler,
            sample
           
          ),
        );
      },
   
    getbyidholidaysAction: (
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        getbyidholidaysAction(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    updateHolidays: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    ) => {
      return dispatch(
        updateHolidays(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
        ),
      );
    },
    deleteHolidays: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        deleteHolidays(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    setSearchHolidayState: (val ) => { return dispatch(setSearchHolidayState(val))
    },
    getSearchHolidayAction: (
      val, 
      setModalTypeHandler,
      setLoaderStatusHandler,
      ) => { 
      return dispatch(
        getSearchHolidayAction(
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
    getHolidayCreatedYearsAction:()=>{
      return dispatch(getHolidayCreatedYearsAction())
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Holidays);

