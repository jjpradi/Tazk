import React, {Component} from 'react';
//import NewCustomer from '../../components/Customer';
import {connect} from 'react-redux';
import MaterialTable from 'utils/SafeMaterialTable';
import NewSalary from './newsalary';
import MapSalary from './mapSalary';
import {
  ListSalaryAction,
  CreateSalary,
  salaryPaginationAction,
  getALlSalaryStructureAction,
  getMappedDetailsAction,
  getDeductionType,
  getAllowanceType,
  setSearchSalaryAction,
  deleteEmpSalaryAction,
  getALlSalaryStructureWithAllowanceAndDeductionAction
} from '../../../redux/actions/salary_actions'
import { getEmpbasecompanyAction, getEmpbasecompanyFilterAction, get_search_company_based_employee, set_search_company_based_employee } from 'redux/actions/attendance_actions';
import {
  Listholidays,CreateHolidays, getbyidholidaysAction, updateHolidays, deleteHolidays
} from '../../../redux/actions/holidays_actions';

import {
  listUserCreationAction
} from '../../../redux/actions/userCreation_actions';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import Cookies from 'universal-cookie';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, IconButton, InputAdornment, Pagination, TablePagination, TextField, Typography } from '@mui/material';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle,font14_500 } from 'utils/pageSize';
import { MTableToolbar } from 'utils/SafeMaterialTable';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import {getSearchSalaryAction, setSearchSalaryState} from '../../../redux/actions/salary_actions'
import CommonSearch from 'utils/commonSearch';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { commonDateFormat } from 'utils/getTimeFormat';
import ArticleIcon from '@mui/icons-material/Article';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { getsessionStorage } from 'pages/common/login/cookies';
import { useCustomFetch } from 'utils/useCustomFetch';
import { titleURL } from 'http-common';
import Filter from './filter';
import moment from 'moment';
import FilterSalary from './filter';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import { FilterAlt } from '@mui/icons-material';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

const commonCellStyle = {
  fontFamily: "poppins",
  fontSize: "11px",
  fontWeight: "400",
  color: 'rgba(0, 0, 0, 0.7)',
};
class Salary extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.state = {
      stock_location_data: [],
      open: false,
      dialog: {open: false, msg: '', severity: ''},
      status: '',
      delete: false,
      id: '',
      searchVal: '',
      searchPageData: [],
      page: 0,
      pageSize: pageSize,
      searchData: [],
      isApiFinished: false,
      edit_data: {},
      mapOpen: false,
      dialogData: {},
      dialogOpen: false,
      deductionList : [],
      allowanceList: [],
      filterOpen: false,
      from: null,
      to: null,
      deleteOpen: false,
      deleteId: null,
      searchValEmployeeFilter:'',
      value:[],
      selectedAll:false
    };
    this.cookies = new Cookies();
    this.customFetch = useCustomFetch();
  }


  storage = getsessionStorage()

  async componentDidMount() {
  this.props.setSearchSalaryState([]);
  const context = this.context;

  const body = {
    pageCount: 0,
    numPerPage: pageSize,
    searchString: '',
    employeeId: null,
    headerLocationId: context.headerLocationId,
    from: this.state.from,
    to: this.state.to,
  };

  let data1 = {
    searchString: ""
  };

  const selectedRole = this.storage?.role_name;

  let promises = [
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listUserCreationAction(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      ),
      this.props.salaryPaginationAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      ),
      !this.props.AllowanceType.length &&
        this.props.getAllowanceType(this.storage.company_id),
      !this.props.deductionType.length &&
        this.props.getDeductionType(this.storage.company_id),
      this.props.getALlSalaryStructureWithAllowanceAndDeductionAction(),
      // this.props.getUserRightsByRoleIdAction(),
      this.props.getEmpbasecompanyFilterAction(data1, (res) => {})
    ),
  ];

  if (selectedRole) {
    promises.push(this.props.getMenuAccessAction(selectedRole));
  }

  await Promise.all(promises);

  this.setState({ isApiFinished: true });

  if (this.props.setModalStatusHandler) {
    this.setState({ open: true });
  }
}



  
  handleChangeEmployeeName = (val) => {
    this.setState({value: val});
  }

  requestSearchEmployeeFilter = (val) => {
  const context = this.context;

  this.setState({ searchValEmployeeFilter: val }); 
  this.props.set_search_company_based_employee([]);

  if (!val) return;

  this.props.get_search_company_based_employee(
    { searchString: val },
    context.setModalTypeHandler,
    context.setLoaderStatusHandler
  );
};


  
setSearchValEmployeeFilter =(val) =>{
  this.setState({ searchValEmployeeFilter: val })
  }

  setSelectedAllFilter =(val) =>{
  this.setState({ selectedAll: val })
  }
  
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  handleEdit = async (rowData) => {
    const context = this.context;

    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   this.props.getbyidholidaysAction(
    //     id,
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //   )
	  //  );
    this.setState({open: true, status: 'edit', edit_data: rowData});
  };


  handleClose = (type) => {
    if (this.props.setModalStatusHandler) {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('stockLocation', false);
    }
if(type === 'edit'){
  this.setState({open: false, dialog: false, delete: false, mapOpen:false});
}else{
    this.setState({open: false, dialog: false, delete: false, mapOpen:false, page: 0});
  }
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


  // cancelSearch = (e) => {
  //   this.setState({ searchVal: ''});
  //    this.props.setSearchSalaryState([])
  // };
  handlePageSizeChange = async (size) => {
    const context = this.context;
  
    this.setState(
      {
        pageSize: size,
        page: 0
      },
      async () => {
        const body = {
          pageCount: 0,
          numPerPage: size,
          searchString: this.state.searchVal,
          employeeId: null,
          headerLocationId: context.headerLocationId,
          from: this.state.from,
          to: this.state.to,
        };
  
        await apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.salaryPaginationAction(body)
        );
      }
    );
  };

  handlePageChange = async (page) => {
    const context = this.context;
    this.setState({ page: page })
    const body = {
      pageCount:page,
      numPerPage: this.state.pageSize,
      searchString:this.state.searchVal,
      employeeId:null,
      headerLocationId: context.headerLocationId,
      from: this.state.from,
      to: this.state.to,
    }
    await apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.salaryPaginationAction(body)
    )
  }
  cancelSearch = (e) => {

    const context = this.context;
    this.setState({searchPageData: [], page: 0, searchVal: ''});
    this.props.setSearchSalaryAction({ data: [], numRows: 0 })
    const body = {
      pageCount:this.state.page,
      numPerPage: this.state.pageSize,
      searchString: '',
      employeeId:null,
      headerLocationId:context.headerLocationId,
      from: this.state.from,
      to: this.state.to,
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.salaryPaginationAction(body)
    )
  };

  // requestSearch = (e) => {
  //   const context = this.context;
  //   let val = e.target.value;
  //   this.setState({searchVal: val});

  //   // if(val.trim() !== ''){
  //     this.props.setSearchSalaryState([])
  //   // }
  //   const body = {
  //     searchString : val
  //   }
  //   this.props.getSearchSalaryAction(
  //       body,
  //       context.setModalTypeHandler,
  //       context.setLoaderStatusHandler
  //     )
  // };

  requestSearch = (e) => {
    const context = this.context;
  let val = e.target.value;
  this.setState({searchVal: val, page : 0});
  // if(val.trim() !== ''){
    this.props.setSearchSalaryAction({data:[], numRows:0})
  // }
  const body = {
    pageCount:this.state.page,
    numPerPage: this.state.pageSize,
    searchString:val,
    employeeId:null,
    headerLocationId:context.headerLocationId,
    from: this.state.from,
    to: this.state.to,

  }
  this.props.getSearchSalaryAction(
      body,
      context.setModalTypeHandler,
      context.setLoaderStatusHandler
    )
  };
  
  handleOpen = (rowData) => {
    this.setState({open: true, status: 'view', edit_data: rowData});
  }

  handleClick = (rowData) =>{
    this.setState({mapOpen : true, edit_data: rowData});
    this.props.getMappedDetailsAction(rowData.id)
  }


  handleClickOpen = async (rowData) => {
    
    const temp = [...rowData.allowance, ...rowData.deduction].map(i => {
      const amount = i.allowance_amount ?? i.deduction_amount;
      return {
        ...i,
        amount
      }
    })

    this.setState({
      allowanceList: temp.filter(i => i.allowance_code), 
      deductionList: temp.filter(i => i.deduction_code),
      dialogData : rowData,
      dialogOpen: true
    })
  };

  handleDialogClose = () => {
    this.setState({dialogOpen : false});  
  };

  applyButton = () => {
     const EmployeeRole = this.storage.role_name === "Employee"
       const EmployeeId = this.storage.employee_id
     let employees = null
      if(this.state.value.length > 0) {
          employees = this.state.value.map((d) => d.employee_id)
        }
    this.setState({filterOpen:false});

    const context = this.context;
    const body = {
      pageCount:0,
      numPerPage: pageSize,
      searchString:'',
      employeeId:EmployeeRole ? [EmployeeId] : employees, 
      headerLocationId:context.headerLocationId,
      from: this.state.from,
      to: this.state.to,
    }

    apiCalls(  
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.salaryPaginationAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      ),
    ).finally(() => this.setState({isApiFinished: true}))
    this.setState({ searchVal: ''});
  };

  handleClear = () =>{
    this.setState({filterOpen:false,from:null,to:null});
    const context = this.context;
    const body = {
      pageCount: 0,
      numPerPage: pageSize,
      searchString: '',
      employeeId: null,
      headerLocationId: context.headerLocationId,
      from: null,
      to: null,
    };
    this.setState({ searchVal: '',value:[]});
  

    apiCalls(  
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.salaryPaginationAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      ),
    ).finally(() => this.setState({isApiFinished: true}))

  }

  handleChange = (data) => {
    const { name, value } = data
      this.setState({ [name]: value })
  }

  handleFilterOpen = () => {
    this.setState({ filterOpen: true })
  }

  handleFilterClose = () => {
    this.setState({ filterOpen: false })
  }

handleEmpSalaryDelete = (rowData) => {
  const context = this.context;
  const body = {
    salary_structure_id: rowData.salary_structure_id,
    emp_salary_id: rowData.emp_salary_id,
    employee_id: rowData.employee_id,
  };

  this.setState({ deleteOpen: false, deleteId: null });

  apiCalls(
    context.setModalTypeHandler,
    context.setLoaderStatusHandler,
    this.props.deleteEmpSalaryAction(body, (res) => {
      if (res?.success === true || res?.status === true) {
        const payload = {
          pageCount: this.state.page,
          numPerPage: pageSize,
          searchString: '',
          employeeId: null,
          headerLocationId: context.headerLocationId,
          from: this.state.from,
          to: this.state.to,
        };

        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.salaryPaginationAction(
            payload,
            context.setModalTypeHandler,
            context.setLoaderStatusHandler
          )
        );
      }
    })
  );
};

  

  render() {
    const { menuAccess = {} } = this.props;
    const selectedRole = this.storage?.role_name;
   const storage = this.storage;

  const salaryCreate =
    storage.company_type === 5
      ? UserRightsAuthorization(menuAccess[selectedRole], 'salary__assign_salary', 'can_create')
      : true;

  const salaryEdit =
    storage.company_type === 5
      ? UserRightsAuthorization(menuAccess[selectedRole], 'salary__assign_salary', 'can_edit')
      : true;

  const salaryDelete =
    storage.company_type === 5
      ? UserRightsAuthorization(menuAccess[selectedRole], 'salary__assign_salary', 'can_delete')
      : true;
    console.log("allowanceList",this.state.allowanceList)
    return (
      <>
        <Helmet>
                 <meta charSet="utf-8" />
                 <title> {titleURL} | Salary </title>
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
              {this.state.dialogOpen === true ? <Grid>
                <Dialog
                  sx={{
                    "& .MuiDialog-container": {
                      "& .MuiPaper-root": {
                        width: "100%",
                        maxWidth: "700",
                      },
                    },
                  }}
                  open={open}
                  onClose={this.handleClose}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
                >
                  <DialogTitle id="index-dialog-title">
                    {"Salary Details"}
                  </DialogTitle>
                  <DialogContent>
                    <DialogContentText id="index-dialog-description">
                      <Grid container spacing={2} dislpay='flex'>
                        <Grid
                          display='flex'
                          flexDirection="column"
                          gap={5}
                          size={{
                            lg: 12,
                            md: 12,
                            sm: 12
                          }}>
                        <Grid display='flex' justifyContent='flex-start' flexDirection="column">
                            <Typography variant='h4'>Salary Structure Name : {this.state.dialogData.name} </Typography>
                          </Grid>
                          <Grid container display='flex' justifyContent='flex-start' flexDirection="column">
                            <Table data={this.state.allowanceList} tableName="allowance"/>
                          </Grid>

                          <Grid container display='flex' justifyContent='flex-start' flexDirection="column">
                            <Table data={this.state.deductionList} tableName="deduction"/>
                          </Grid>
                        </Grid >
                      </Grid>
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={this.handleDialogClose} autoFocus>
                      Close
                    </Button>
                  </DialogActions>
                </Dialog>
              </Grid> : <></>}
              {this.state.open === false && this.state.mapOpen === false && (
                <MaterialTable
                localization={{
                  // header: {
                  //   actions: 'View',
                  // }
                }}
                totalCount={this.props.searchSalaryData_count}
                // style={{height:'87vh',overflow:'hidden'}}

                components={{
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
                        <div style={{ width: '100%' }}>
                          <MTableToolbar {...props} />
                        </div>
                        <div>
                          <IconButton onClick={this.handleFilterOpen}>
                            <FilterAlt />
                          </IconButton>

                        </div>
                        <div>
                          <CommonSearch
                            searchVal={this.state.searchVal}
                            cancelSearch={this.cancelSearch}
                            requestSearch={this.requestSearch}
                          />
                        </div>
                      </div>
                    </div>
                  ),
                  Pagination: (props) => (
                    <div>
                      <TablePagination
                      {...props}
                      component="div"
                      count={this.props.searchSalaryData_count}
                      rowsPerPageOptions={[20, 50, 100]}
                      labelRowsPerPage="Rows per Page:"
                      page={this.state.page}
                      onPageChange={(event, page) =>
                        this.handlePageChange(page)
                      }
                      onRowsPerPageChange={(event) =>
                        this.handlePageSizeChange(
                          parseInt(event.target.value, 10)
                        )
                      }/>
                    </div>
                  )
                }}
           
                  actions={[
                    (rowData) => ({
                      icon: () => (
                        <FormatListBulletedIcon/>
                      ),
                      tooltip: 'Salary Details',
                      onClick: (event, rowData) => {
                        this.handleClickOpen(rowData); 
                        // <ScheduleShift rowData={rowData}/>
                      },
                    }),

                    ...(salaryCreate ? [{
                      icon: 'add',
                      tooltip: 'Assign Salary',
                      isFreeAction: true,
                      onClick: () =>
                        this.setState({
                          edit_data: {},
                          open: true,
                          status: 'create',
                        })
                      }] : []),

                    ...(salaryEdit ? [{
                      icon: () => <EditIcon />,
                      tooltip: 'Edit',
                      onClick: (event, rowData) => {
                        this.setState({
                          edit_data: rowData,
                          open: true,
                          status: 'edit',
                        });
                      },
                    }] : []),
                    ...(salaryDelete ? [{
                      icon: () => <DeleteIcon />,
                      tooltip: 'Delete',
                      onClick: (event, rowData) => {
                        this.setState({ deleteId: rowData, deleteOpen: true });
                      },
                    }] : []),
                    
                  ]}

                 
                  // onRowClick={(rowData) => {
                  //   this.setState({open: true, status: 'view', edit_data: rowData});
                  // }}

                  options={{
                    showEmptyDataSourceMessage: this.state.isApiFinished,
                    headerStyle,
                    cellStyle,
                    exportButton: true,
                    filtering: false,
                    actionsColumnIndex: -1,
                    maxBodyHeight: 'calc(100vh - 200px)',
                    minBodyHeight: 'calc(100vh - 200px)',
                    paging: true,
                    page: this.state.page,
                    pageSize: this.state.pageSize,
                    pageSizeOptions: [20, 50, 100],
                    search: false,
                  }}
               
                  columns={[
                    {
                      title:'Emp Code',
                      field: 'employee_code',
                    },
                    {
                      title: 'Employee',
                      render: rowData => {
                        const f_name = rowData.first_name ?? ''
                        const l_name = rowData.last_name ?? ''
                        return `${f_name.charAt(0).toUpperCase() + f_name.slice(1)} ${l_name.charAt(0).toUpperCase() + l_name.slice(1)}`
                      }
                    },
                    {
                      title: 'Salary Structure',
                      field: 'name',
                    },
                    {
                      title:'Effective Date',
                      // field:'fromDate',
                      type: 'date',
                      render: rowData => rowData.fromDate ? moment(rowData.fromDate, 'DD-MM-YYYY').format('DD/MM/YYYY') : ''
                    },
                    {
                      title: 'Basic',
                      render: rowData => rowData.allowance.find(i => i.allowance_code === 'BASIC')?.allowance_amount ?? 0
                    },
                    {
                      title: 'Earnings',
                      render: rowData => rowData.allowance.filter(i => i.allowance_code !== 'BASIC').reduce((a,c) => a + c.allowance_amount, 0)
                    },
                    {
                      title: 'Deductions',
                      render: rowData => rowData.deduction.reduce((a,c) => a + c.deduction_amount, 0)
                    },
                    {
                      title: 'Total',
                      render: rowData => {
                        const total_deductions = rowData.deduction.reduce((a,c) => a + c.deduction_amount, 0);
                        const total_earnings = rowData.allowance.reduce((a,c) => a + c.allowance_amount, 0)

                        return total_earnings - total_deductions;
                      }
                    },

      
                  ]}
                  data={this.props.searchSalaryData}
                  title={
                    <Typography className='page-title'>
                    Salary</Typography>}
                />
              )}
              {this.state.open && (
                <MapSalary
                  status={this.state.status}
                  handleClose={this.handleClose}
                  {...this.props}
                  type='stockLocation'
                  setModalStatusHandler={setModalStatusHandler}
                  setModalTypeHandler={setModalTypeHandler}
                  edit_data={this.state.edit_data}
                  page={this.state.page}
                />
              )}

              { this.state.mapOpen &&(
                <MapSalary rowData={this.state.edit_data}
                handleClose={this.handleEditClose}
                />
              )}
              {
                this.state.filterOpen &&  <FilterSalary
                open={this.state.filterOpen}
                handleClose={this.handleFilterClose}
                from={this.state.from}
                to={this.state.to}
                handleChange={this.handleChange}
                ApplyButton={this.applyButton}
                handleClear={this.handleClear}
                type={this.props.getCompanyBasedEmployeeFilter}
                searchType={this.props.searchCompanyBasedEmployeeFilter}
                searchVal={this.state.searchValEmployeeFilter}
                requestSearch={this.requestSearchEmployeeFilter}
                selectedAll={this.state.selectedAll}
                setSelectedAll={this.setSelectedAllFilter}
                value={this.state.value}
                setValue={this.handleChangeEmployeeName}
              />
              }
             

              <AlertDialog
                delete={this.state.deleteOpen}
                handleClose={() => this.setState({deleteOpen: false,  deleteId: null}) }
                handleDelete={this.handleEmpSalaryDelete}
                id={this.state.deleteId}
              />
            </div>
          )}
        </CreateNewButtonContext.Consumer>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
  
      holidaygetbyid:state.HolidaysReducers.holidaygetbyid || [],
      holidaylist:state.HolidaysReducers.holidaylist || [],
      userCreation: state.UserCreationReducer.createUser || [],
      salarylist:state.SalaryReducers.salarylist || [],
      searchSalaryData: state.SalaryReducers.searchSalaryData || [],
      searchSalaryData_count : state.SalaryReducers.searchSalaryData_count || 0,
      salarystructurelist: state.SalaryReducers.salarystructurelist || [],
      AllowanceType: state.SalaryReducers.AllowanceType || [],
      deductionType: state.SalaryReducers.deductionType || [],
      // user_rights: state.roleReducer.user_rights || [],
      searchCompanyBasedEmployeeFilter:state.attendanceReducer.searchCompanyBasedEmployeeFilter ||[],
      getCompanyBasedEmployeeFilter:state.attendanceReducer.getCompanyBasedEmployeeFilter ||[],
      menuAccess: state.rbacReducer.menuAccess || []
  };
};
const mapDispatchToProps = (dispatch) => {
  return {

    listUserCreationAction: (setModalTypeHandler, setLoaderStatusHandler) => {
     
        return dispatch(
          listUserCreationAction(setModalTypeHandler, setLoaderStatusHandler),
        );
      },
 
    ListSalaryAction: (
        setModalTypeHandler,
        setLoaderStatusHandler,
        
      ) => {
        return dispatch(
          ListSalaryAction(
            setModalTypeHandler,
            setLoaderStatusHandler,
           
          ),
        );
      },
      CreateSalary: (
        data,setModalTypeHandler,
        setLoaderStatusHandler,
        sample
        
      ) => {
        return dispatch(
          CreateSalary(
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
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    ) => {
      return dispatch(
        updateHolidays(
          id,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
        ),
      );
    },
    deleteHolidays: (
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        deleteHolidays(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    setSearchSalaryState: (val) => { return dispatch(setSearchSalaryState(val))
    },
    getSearchSalaryAction: (
      val, 
      setModalTypeHandler,
      setLoaderStatusHandler,
      ) => { 
      return dispatch(
        getSearchSalaryAction(
          val, 
          setModalTypeHandler,
          setLoaderStatusHandler,
          )
        );
    },
    salaryPaginationAction: (data) => { 
      return dispatch(salaryPaginationAction(data));
    },
    deleteEmpSalaryAction: (data, callback) => { 
      return dispatch(deleteEmpSalaryAction(data, callback));
    },
    getALlSalaryStructureAction:(data) => {
      return dispatch(getALlSalaryStructureAction(data));
    },
    getMappedDetailsAction:(id) => {
      return dispatch(getMappedDetailsAction(id));
    },
    getDeductionType:(company_id) => {
      return dispatch(getDeductionType(company_id));
    },
    getALlSalaryStructureWithAllowanceAndDeductionAction:() => {
      return dispatch(getALlSalaryStructureWithAllowanceAndDeductionAction());
    },
    getAllowanceType:(company_id) => {
      return dispatch(getAllowanceType(company_id));
    },
    setSearchSalaryAction:(data) => {
      return dispatch(setSearchSalaryAction(data));
    },
    // getUserRightsByRoleIdAction:()=>{
    //   return dispatch(getUserRightsByRoleIdAction())
    // },
     set_search_company_based_employee: (val) => {
                return dispatch(set_search_company_based_employee(val));
            },
            get_search_company_based_employee: (val, setModalTypeHandler, setLoaderStatusHandler) => {
                return dispatch(get_search_company_based_employee(val, setModalTypeHandler, setLoaderStatusHandler));
            },
             getEmpbasecompanyFilterAction: (data, response) => {
            dispatch(getEmpbasecompanyFilterAction(data, response))
        },
         getMenuAccessAction: (data) => {
            return dispatch(getMenuAccessAction(data))
        },
  };
};


function Table({data, tableName}) {

  const tableAccess = {
    'allowance': {
      colName: 'Earnings',
      rowName:'allowance_name',
      rowAmount:'amount'
    },
    'deduction': {
      colName: 'Deductions',
      rowName:'deduction_name',
      rowAmount:'amount'
    },
  }

  return (
    <Grid
      container
      style={{
        margin: '5px 0px',
        width: "100%",
        maxWidth: "700",
      }}
    >
      {/* <Typography variant='h6' pb={1}>
        {tableAccess[tableName].colName}
      </Typography> */}
      <table
        style={{
          border: '1px solid',
          fontSize:cellStyle.fontSize ,
          borderCollapse: 'collapse',
          padding: '0px 5px',
          width: '100%',
          paddingBottom: '10px'
          
        }}
      > 
        <tbody>
          <tr>
            <th style={{border: '1px solid', width:'60%'}}>{tableAccess[tableName].colName}</th>
            <th style={{border: '1px solid', width:'40%'}}>Amount</th>
          </tr>
          {data.map((d, i) => (
            <tr key={i}>
              <td style={{border: '1px solid', padding: '0px 5px'}}>
                {d[tableAccess[tableName].rowName]}
              </td>

              <td style={{border: '1px solid', padding: '0px 5px'}}>
                {d[tableAccess[tableName].rowAmount]}
              </td>
          
            </tr>
          ))}
        </tbody>
      </table>
    </Grid>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Salary);

