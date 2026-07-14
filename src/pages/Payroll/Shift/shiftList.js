import React, { Component } from 'react'
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable'
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { TextField, InputAdornment, List, ListItem, ListItemText, Chip,TablePagination, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Grid, IconButton } from '@mui/material';
import { connect } from 'react-redux';
import { getShiftListAction,setSearchShiftlistAction ,getSearchShiftlistAction, shiftListPaginationAction,deleteShiftAction, listScheduleAction} from 'redux/actions/shifts.actions';
import AddShift from './index';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle,font14_500, formatTime12Hour } from 'utils/pageSize';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CommonSearch from 'utils/commonSearch';
import ArticleIcon from '@mui/icons-material/Article';
import ScheduleList from './scheduleShift'
import DetailsIcon from '@mui/icons-material/Details';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AlertDialog from 'pages/common/Dialog';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { titleURL } from 'http-common';
import DetailsDialog from './detailsDialog';
import clsx from 'clsx';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper'
import {
  getStickyTableOptions,
  stickyTableComponents,
} from 'utils/stickyTableLayout';
import { getsessionStorage } from 'pages/common/login/cookies'
import { getMenuAccessAction } from 'redux/actions/rbac_actions'

class ShiftList extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    let headerupdate = '';
    this.state = {
      open: false,
      update: true,
      dialog: { open: false, msg: '', severity: '' },
      status: '',
      delete: false,
      id: '',
      from: firstDay,
      to: lastDay,
      edit_id_data: [],
      rowPopup: { open: false, rowIndex: '', item_id: '' },
      searchVal: '',
      searchPageData: [],
      page: 0,
      pageSize: pageSize,
      searchData: [],
      scheduleShift: false,
      scheduleShiftData: [],
      isApiFinished: false,
      dialogOpen: false,
      dialogData : [],
      deleteOpen: false,
      deleteId: null,
      mode:'add',
      editRowData:[]
    }
    this.storage = getsessionStorage()
  }

  async componentDidMount() {
    this.props.setSearchShiftlistAction({data:[], numRows:0});
    const context = this.context;
    const selectedRole = this.storage.role_name
    const body = {
      pageCount:this.state.page,
      numPerPage: this.state.pageSize,
      searchString:'',
      employeeId:context.commoncookie,
      headerLocationId:context.headerLocationId
    }
        apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.shiftListPaginationAction(body),
      // this.props.getUserRightsByRoleIdAction()
      this.props.getMenuAccessAction(selectedRole)
    ).finally(() => this.setState({isApiFinished: true}))
        
	  
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
        this.props.shiftListPaginationAction(body)
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
      this.props.shiftListPaginationAction(body)
    )
    }

  }
  handleClose = () => {
    const context = this.context;
  
   
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
      this.props.shiftListPaginationAction(body)
    )
    this.setState({open: false, dialog: false, delete: false});
  };

  handlePageSizeChange = async (size) => {
    this.setState({ pageSize: parseInt(size, 10), page: 0 })
}

  handlePageChange = async (page) => {
    const context = this.context;
    this.setState({ page: page })

  }
  cancelSearch = (e) => {

    const context = this.context;
    this.setState({searchPageData: [], page: 0, searchVal: ''});
    const body = {
      pageCount:this.state.page,
      numPerPage: this.state.pageSize,
      searchString:'',
      employeeId:context.commoncookie,
      headerLocationId:context.headerLocationId
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.shiftListPaginationAction(body)
    )
  };

  requestSearch = (e) => {
      const context = this.context;
    let val = e.target.value;
    this.setState({searchVal: val, page : 0});
    // if(val.trim() !== ''){
      this.props.setSearchShiftlistAction({data:[], numRows:0})
    // }
    const body = {
      pageCount:this.state.page,
      numPerPage: this.state.pageSize,
      searchString:val,
      employeeId:context.commoncookie,
      headerLocationId:context.headerLocationId
    }
    this.props.getSearchShiftlistAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      )
  };

  handleClick = async (data) => {
    const context = this.context;
    const temp = {
      pageCount: 0,
      numPerPage: pageSize
    };
    this.props.listScheduleAction(data.id, temp, context.setModalTypeHandler, context.setLoaderStatusHandler,
      (response)=>{if(response === 200){
      this.setState({scheduleShift : true, scheduleShiftData: data})
    }
    })
    

  };
  scheduleBack = (data)=>{
   this.setState({scheduleShift : data})
  }
  
   handleClickOpen = (rowData) => {
     this.setState({ dialogOpen: true });
     this.setState({ dialogData : rowData })

  };
  
  handleClickOpenEdit = (rowData) => {
    this.setState({ mode: 'edit', open: true, editRowData: rowData })
  };

  handleDialogClose = () => {
    this.setState({dialogOpen : false});  };

  handleShiftDelete = () => {

    const context = this.context;
  
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.deleteShiftAction(this.state.deleteId,(response)=>{
        if(response.status === 200){
          const body = {
            pageCount:this.state.page,
            numPerPage: this.state.pageSize,
            searchString:'',
            employeeId:context.commoncookie,
            headerLocationId:context.headerLocationId
          }
          apiCalls(
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            this.props.shiftListPaginationAction(body)
          )
        }
      }),
      this.setState({deleteOpen: false, deleteId: null}),
    )
  }

  render() {
    const selectedRole = this.storage.role_name
    const shiftCreate = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'shifts__create_shift', 'can_create')
    const shiftEdit = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'shifts__create_shift', 'can_edit')
    const shiftDelete = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'shifts__create_shift', 'can_delete')
    return (
      <>
        <Helmet>
                 <meta charSet="utf-8" />
                 <title> {titleURL} | Shift List </title>
       </Helmet>
        <CreateNewButtonContext.Consumer>{
          ({ setModalStatusHandler, setModalTypeHandler, setLoaderStatusHandler, setcreatNewDataHandler, creatNewData, drawerOpen }) => (
            <div
            >
              {
                this.state.open === true ? <AddShift
                  open={this.state.open}
                  handleClose={this.handleClose}
                  editRowData={this.state.editRowData}
                  mode = {this.state.mode}
                  searchString = {this.state.searchVal}
                  setSearchString={(val) => this.setState({ searchVal: val })}
                /> : 

                this.state.scheduleShift === true && this.state.open === false ?
                  <ScheduleList 
                    rowData = {this.state.scheduleShiftData} 
                    handleClose = {this.scheduleBack} 
                    pageCount = {this.state.page}
                    numPerPage= { this.state.pageSize}
                    searchString = {this.state.searchVal}
                  /> :
                    
                  <MaterialTable
                  editable={true}
                  // style={{height:'87vh',overflow:'hidden'}}
                  totalCount={this.props.search_shiftlist_count}
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
                       count={this.props.search_shiftlist_count} 
                       page={this.state.page}
                       onPageChange={(event, page) => this.handlePageChange(page)}
                       onRowsPerPageChange={(event) => this.handlePageSizeChange(event.target.value)}/>
                       </div>),
                }}
                
                      options={getStickyTableOptions({
                        bodyOffset: 200,
                        headerStyle,
                        options: {
                          showEmptyDataSourceMessage: this.state.isApiFinished,
                          cellStyle,
                          toolbar: true,
                          paging: true,
                          pageSize: this.state.pageSize,
                          pageSizeOptions: [20, 50, 100],
                          actionsColumnIndex: -1,
                        },
                      })}
                
                      actions={[
//-------------------------------------ADD SHIFT-------------------------------------------
                  
              shiftCreate ? 
                  {
                    icon: 'add',
                    tooltip: 'add',
                    isFreeAction: true,
                    onClick: (event, rowData) =>
                      this.setState({ open: true , mode : 'add' }),
                  } : null,
                
//------------------------------------SHIFT DETAILS-------------------------------------------

                  (rowData) => ({
                    icon: () => (
                      <VisibilityIcon/>
                    ),
                    tooltip: 'Shift Details',
                    onClick: (event, rowData) => {
                      this.handleClickOpen(rowData); 
                      // <ScheduleShift rowData={rowData}/>
                    },
                  }),
//----------------------------------SHIFT SCHEDULE-------------------------------------------

                  // (rowData) => ({
                  //   icon: () => (
                  //     <ArticleIcon/>
                  //   ),
                  //   tooltip: 'Schedule Shift',
                  //   onClick: (event, rowData) => {
                  //     this.handleClick(rowData); 
                  //     // <ScheduleShift rowData={rowData}/>
                  //   },
                  // }),
//-------------------------------------EDIT-------------------------------------------
                  ...(shiftEdit ? [(rowData) => ({ 
                    icon: () => (
                      <EditIcon/>
                    ),
                    tooltip:  rowData.salary_process_count > 0 ? '' : 'Edit' ,
                    //disabled : rowData.shift_name === "NoShift" || rowData.salary_process_count > 0 ? true : false,
                    onClick: (event, rowData) => {
                      this.handleClickOpenEdit(rowData); 
                      // <ScheduleShift rowData={rowData}/>
                    },
                  })] : []),
//-------------------------------------DELETE SHIFT-------------------------------------------

                        ...(shiftDelete ? [(rowData) => ({
                          icon: () => (
                            //  && (
                            (<IconButton
                            style={{padding: '0px 8px'}}
                              disabled={ rowData.shift_name === "NoShift" || rowData?.isDefaultShift === 1}
                              onClick={(event) => {
                                const deleteId = rowData.id;
                                this.setState({ deleteId, deleteOpen: true });
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>)
                            // )
                          ),
                          tooltip: 'Delete Shift',
                        })] : []),
                      ]}
                    page={this.state.page}
                    onPageChange={(page) => this.handlePageChange(page)}
                    onRowsPerPageChange={(size) => this.handlePageSizeChange(size)}
                    // pagination={false}
                      columns={[
                        { title: 'Shift', 
                          field: 'shift_name',  
                        cellStyle: {textTransform:"capitalize"} },
                        {
                          title: 'Start Time', 
                          field: 'start_shift_time', 
                          render: (rowData) =>
                            <div>
                              {rowData.start_shift_time
                                ? formatTime12Hour(rowData.start_shift_time)
                                : '-'}
                            </div>
                        },
                        {
                          title: 'End Time', 
                          field: 'end_shift_time', 
                          render: (rowData) =>
                            <div>
                              {rowData.end_shift_time
                                ? formatTime12Hour(rowData.end_shift_time)
                                : '-'}
                            </div>
                        },
                        {
                          title: 'Break Start',
                          field: 'start_break_time',
                          render: (rowData) =>
                          <div>
                            {rowData.start_break_time && rowData.start_break_time !== "00:00:00"
                              ? formatTime12Hour(rowData.start_break_time)
                              : '-'}
                          </div>


                        },
                        { title: 'Break End', 
                          field: 'end_break_time',
                        render: (rowData) =>
                        <div>
                          {rowData.end_break_time &&  rowData.end_break_time !== "00:00:00"
                            ? formatTime12Hour(rowData.end_break_time)
                            : '-'}
                        </div> }

                      ]}
                data={ this.props.search_shiftlist}

                title={
                  <Typography  className='page-title'>
                    Shift Table</Typography>}
                      />
                
              }
              
              {this.state.dialogOpen && (<DetailsDialog open={this.state.dialogOpen} handleClose={this.handleDialogClose} data={this.state.dialogData} />)}
            </div>

          )}

        </CreateNewButtonContext.Consumer>
        {/* {
          this.state.scheduleShift &&
          <ScheduleShift rowData = {this.state.scheduleShiftData} />
        } */}
        <AlertDialog
          delete={this.state.deleteOpen}
          handleClose={() => this.setState({deleteOpen: false,  deleteId: null}) }
          handleDelete={this.handleShiftDelete}
          id={this.state.deleteId}
        />
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    shiftList: state.ShiftsReducer.shiftList || [],
    search_shiftlist: state.ShiftsReducer.search_shiftlist || [],
    search_shiftlist_count: state.ShiftsReducer.search_shiftlist_count || 0 ,
    user_rights: state.roleReducer.user_rights || [],
    menuAccess: state.rbacReducer.menuAccess || []
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    getShiftListAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(getShiftListAction(setModalTypeHandler, setLoaderStatusHandler))
    },
    setSearchShiftlistAction: (val ) => { return dispatch(setSearchShiftlistAction(val))
    },
    deleteShiftAction: (val,response ) => { return dispatch(deleteShiftAction(val,response))
    },
    getSearchShiftlistAction: (
      val, 
      setModalTypeHandler,
      setLoaderStatusHandler,
      ) => { 
      return dispatch(
        getSearchShiftlistAction(
          val, 
          setModalTypeHandler,
          setLoaderStatusHandler,
          )
        );
    },
    shiftListPaginationAction: (data) => { 
      return dispatch(shiftListPaginationAction(data));
    },
    listScheduleAction: (id,data, setModalTypeHandler, setLoaderStatusHandler, response) =>{
      return dispatch(listScheduleAction(id,data , setModalTypeHandler, setLoaderStatusHandler, response));
    },
    // getUserRightsByRoleIdAction:()=>{
    //   return dispatch(getUserRightsByRoleIdAction())
    // },
    getMenuAccessAction:(selectedRole)=> {
      return dispatch(getMenuAccessAction(selectedRole))
    }

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ShiftList);





