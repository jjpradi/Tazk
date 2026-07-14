
import React, {Component, createRef} from 'react';
import {connect} from 'react-redux';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import Cookies from 'universal-cookie';


import CreateNewButtonContext from '../../../context/CreateNewButtonContext';


import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { getsessionStorage } from 'pages/common/login/cookies';

import CommonSearch from 'utils/commonSearch';

import CommonToolTip from 'components/ToolTip';


import AddIcon from '@mui/icons-material/Add';

import { CreateDepartment, department, ListDepartmentById, deleteDepartment, updateDepartment, setSearchDepartmentState, getSearchDepartmentAction } from 'redux/actions/departmentHead';
import EditDepartmentConfig from './editDepartment';
import { IconButton, Typography } from '@mui/material';
import { maxBodyHeight } from 'utils/pageSize';
import { position } from 'stylis';
import { getStickyTableOptions, stickyTableComponents } from 'utils/stickyTableLayout';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';


const commonCellStyle = {
  fontFamily: "poppins",
  fontSize: "11px",
  fontWeight: "400",
  color: 'rgba(0, 0, 0, 0.7)',
};



class Department extends Component{
    static contextType = CreateNewButtonContext;
    constructor(props) {
      super(props);
      this.addActionRef = createRef();
      this.cancelActionRef = createRef();
      this.state = {
        open: false,
        update: true,
        dialog: {open: false, msg: '', severity: ''},
        status: '',
        delete: false,
       
       
       
        row_id: {id: '', data: ''},
        add_click: false,
        setting: false,
        organizationdata: [],
       
        data:[],
        department_id:null,
        department_name:'',
        searchString: '',
        pageDepartment: 0,
        pageSizeDepartment: 20,
      };
      this.cookies = new Cookies();
    }
  
    storage = getsessionStorage()
  
    async componentDidMount() {

      const context = this.context;
   
     
  
  
      let dataDepartment = {pageCount: this.state.pageDepartment || 0, numPerPage:  this.state.pageSizeDepartment,searchString: '' }
  
      apiCalls(
           this.props.department(context.setModalTypeHandler,context.setLoaderStatusHandler,dataDepartment)
      );
    }
  
    async componentDidUpdate(prevProps, prevState) {
      const context = this.context;
  
       //department
  
  
      if (prevState.pageDepartment !== this.state.pageDepartment) {
  
        let dataDepartment = {pageCount: this.state.pageDepartment || 0, numPerPage:  this.state.pageSizeDepartment,searchString: this.state.searchValDepartment}
  
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.department(context.setModalTypeHandler,context.setLoaderStatusHandler,dataDepartment)
        );
      }
  
  
    }
  
    handlePageChange = async (page, name) => {
    if(name === 'department')
        {
          this.setState({pageDepartment: page});      
        }
      
    }
  
    handlePageSizeChange = async (size, name) => {
     if(name === 'department')
        {
          this.setState({pageSizeDepartment: size});      
        }
     
    };


    handleDepartmentForm = () =>{
        this.setState({editDepartment: true}); 
        
      }
      
      handleDepartmentClose = ()=>{
        this.setState({editDepartment: false}); 
       
      }

      
  cancelSearchDepartment = (e) => {
    this.setState({ searchValDepartment: '', pageDepartment : 0});
    this.props.setSearchDepartmentState([])
    const context = this.context

    let dataDepartment = {pageCount: this.state.pageDepartment || 0, numPerPage:  this.state.pageSizeDepartment,searchString: ''}

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.getSearchDepartmentAction(dataDepartment, context.setModalTypeHandler,context.setLoaderStatusHandler)
    );
  };

  requestSearchDepartment = (e) => {
    const context = this.context;
    let val = e.target.value;
    this.setState({ searchValDepartment: val, pageDepartment : 0});

    // if(val.trim() !== ''){
      this.props.setSearchDepartmentState([])
    // }
    let dataDepartment = {pageCount: this.state.pageDepartment || 0, numPerPage:  this.state.pageSizeDepartment,searchString: val}

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.getSearchDepartmentAction(dataDepartment, context.setModalTypeHandler,context.setLoaderStatusHandler)
    );
  };

  
  render() {
    const selectedRole = this.storage.role_name
    const departmentCreate = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'info__departments', 'can_create')
    const departmentEdit = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'info__departments', 'can_edit')
    const departmentDelete = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'info__departments', 'can_delete')
    return (
        <MaterialTable
          totalCount={this.props.getDepartmentCount}
          // style={{height: 'calc(100vh - 80px)',overflow:'hidden'}}
          components={{
            ...stickyTableComponents,
            Toolbar: (props) => (
              <div style={{ display: 'flex', width: '100%', alignItems: 'center', padding: '10px' }}>
                <div style={{ width: '100%' }}>
                  <MTableToolbar {...props} />
                </div>
                <div>
                  <CommonSearch
                    searchVal={this.state.searchValDepartment}
                    cancelSearch={this.cancelSearchDepartment}
                    requestSearch={this.requestSearchDepartment}
                  />
                </div>
                {
                  departmentCreate &&
                  <CommonToolTip title={'Add'}>
                    <IconButton onClick={this.handleDepartmentForm}>
                      <AddIcon />
                    </IconButton>
                  </CommonToolTip>
                }
                <EditDepartmentConfig
                  // setAppConfigEmail={(e) => this.setState({ appConfigEmail: e })}
                  open={this.state.editDepartment}
                  handleClose={this.handleDepartmentClose}
                  app_config_data={this.props.app_config_data}
                />
              </div>
            ),
          }}
          editable={{
            ...(departmentEdit && {onRowUpdate: (newData, oldData) =>
              new Promise((resolve) => {
                // console.log("asdad", oldData.tableData.id)
                setTimeout(() => {
                  const dataUpdate = [...this.state.data];
                  const index = oldData.tableData.id;
                  dataUpdate[index] = newData;
                  this.props.updateDepartment(oldData.id, newData, (response) => {
                    // console.log("asdad", response)
                    if (response.affectedRows === 1) {
                      const context = this.context;
                      let dataDepartment = { pageCount: this.state.pageDepartment || 0, numPerPage: this.state.pageSizeDepartment, searchString: '' }

                      apiCalls(
                        context.setModalTypeHandler,
                        context.setLoaderStatusHandler,
                        this.props.department(context.setModalTypeHandler, context.setLoaderStatusHandler, dataDepartment)
                      );

                    }
                  });
                  this.setState({ data: dataUpdate });
                  resolve();
                }, 1000);
              })
            }),


            ...(departmentDelete && {onRowDelete: (oldData, newData) =>
              new Promise((resolve, reject) => {

                setTimeout(() => {
                  const dataDelete = [...this.state.data];
                  const index = oldData.id;
                  dataDelete.splice(index, 1);
                  this.props.deleteDepartment(oldData.id,
                    (response) => {
                    // console.log("asdad", response)
                    // if (response.affectedRows === 1) {
                    //   const context = this.context;
                    //   let dataDepartment = { pageCount: this.state.pageDepartment || 0, numPerPage: this.state.pageSizeDepartment, searchString: '' }

                    //   apiCalls(
                    //     context.setModalTypeHandler,
                    //     context.setLoaderStatusHandler,
                    //     this.props.department(context.setModalTypeHandler, context.setLoaderStatusHandler, dataDepartment)
                    //   );

                    // }
                  });
                  this.setState({ data: dataDelete });
                  resolve();
                }, 1000);
              })
            }),
          }}
          options={getStickyTableOptions({
            bodyOffset:200,
            headerStyle: this.state.headerStyle,
            options:{
              showEmptyDataSourceMessage: this.state.isApiFinished,
      
              pageSizeOptions: [5, 10,20],
              cellStyle: this.state.cellStyle,
              search: false,
              toolbar:true,
              paging: true,
              pageSize: 20,
              actionsColumnIndex: -1,
             
              // overflowY:'visible'
            }

          })}
          page={this.state.pageDepartment}
          onPageChange={(page) => this.handlePageChange(page, 'department')}
          onRowsPerPageChange={(size) => this.handlePageSizeChange(size, 'department')}
          columns={[
            {
              title: 'Department Name',
              field: 'department',
            },

          ]}
          data={this.props.getDepartmentSearch}
          title={
            <Typography className='page-title' variant='h6' align='left' style={{ paddingTop: '10px', paddingBottom: '10px' }}>
              Departments

            </Typography>
          }
        />
      );

  }
}


const mapStateToProps = (state) => {
    return {
    
      departmentList: state.DepartmentHeadReducer.departmentList || [],
      getDepartmentCount: state.DepartmentHeadReducer.getDepartmentCount || 0,
      getDepartmentSearch:state.DepartmentHeadReducer.getDepartmentSearch || [],
      departmentgetbyid: state.DepartmentHeadReducer.departmentgetbyid|| [],
      menuAccess: state.rbacReducer.menuAccess || [],
      // stocklocation: state.stockLocationReducer.stocklocation || [],
    };
  };
  const mapDispatchToProps = (dispatch) => {
    return { 
     
      ListDepartmentById: (id,response) => {
        return dispatch(ListDepartmentById(id,response));
      },
      department: (setModalTypeHandler, setLoaderStatusHandler,data) => {
        return dispatch(department(setModalTypeHandler, setLoaderStatusHandler,data));
      },
      CreateDepartment: ( data,response) => {
        return dispatch(CreateDepartment( data,response));
      },
  
      updateDepartment: (id,data,response) => {
        return dispatch(updateDepartment(id,data,response));
      },
  
      deleteDepartment: (id,response) => {
        return dispatch(deleteDepartment(id,response));
      },
    
      setSearchDepartmentState: (val ) => { 
          return dispatch(setSearchDepartmentState(val))
      },
    
      getSearchDepartmentAction: (val, setModalTypeHandler, setLoaderStatusHandler) => {
        return dispatch(getSearchDepartmentAction(val, setModalTypeHandler, setLoaderStatusHandler))
      }
    
    };
  };
  
  export default connect( mapStateToProps, mapDispatchToProps )(Department);
  
