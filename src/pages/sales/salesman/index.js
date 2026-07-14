import React, { Component } from 'react';
//import NewCustomer from '../../components/Customer';
import { connect } from 'react-redux';
import MaterialTable, { MTableBodyRow, MTableToolbar } from 'utils/SafeMaterialTable';
import _, { concat, filter } from 'lodash';

// import { listStockLedgerAction, createStockLedgerAction, getbyidStockLedgerAction } from '../../redux/actions/stock_Ledger_actions';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import {
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Autocomplete,
  TextField,
  Grid,
  Typography,
  InputAdornment,
  Link,
  Button,
  IconButton,
  Card
} from '@mui/material';
import { getDateTime } from '../../../utils/getTimeFormat';
import { ExportCsv, ExportPdf } from '@material-table/exporters';
import CommonFilter from '../../../components/pos/payment_section/CommonFilter';
import NoRecordFound from '../../../components/Layout/NoRecordFound';
import FilterSalesMan from './filtersalesman'
import { ThirtyFpsSharp } from '@mui/icons-material';
import App from 'components/customer_erpDesign';
import {listCustomerSalesManAction, SalesmaninsertAction, ListsalesmanAction} from '../../../redux/actions/customer_actions';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import EmployeeSelection from './employeeselection';
import {
  listUserCreationAction
} from '../../../redux/actions/userCreation_actions';
import FilterEmployee from './filteremployee'
import { Data } from '@react-google-maps/api';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle,font14_500 } from 'utils/pageSize';
import apiCalls from 'utils/apiCalls';
import {
    getStickyTableOptions,
    stickyTableComponents,
  } from '../../../utils/stickyTableLayout';

class SalesManCustomer extends Component {
  static contextType = CreateNewButtonContext;
  Ledger;
  constructor(props) {
    super(props);
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    let headerupdate = '';
    this.state = {
      open: false,
      type: 0,
      edit_id_data: [],
      dialog: { open: false, msg: '', severity: '' },
      delete: false,
      id: '',
      filterData: [],
      brand: '',
      category: '',
      customer:'',
      Dopen: false,
      page: 0,
      pageSize: 20,
      from: firstDay,
      to: lastDay,
      filtedValue: {
       customer:'null',
       employee:'null'
      },
      employee_selected_value:{
        employee:'null'
      },
      employee:'null',
      cancelSale: false,
      indexValue: '',
      // rowPopup: {
      //   open: false,
      //   rowIndex: '',
      //   receivings_items: []
      // },
      count: 0,
      errormsg: {
        from: '',
        to: '',
      },
      appConfigData: {},
      stocklistaddress: {},
      searchData: [],
      searchVal: '',
      searchPageData: [],
      columPopup: { open: false, rowIndex: '' },
      rowPopup: { open: false, rowIndex: '' },
      Customerid: '',
      mappingemployee:'null',
      employeevalue:[],
      checkedemployee:[],
      customer_table:[],
      previous_mapping_id: [],
      checkedemployeePrevious: [],
    };
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handlePageSizeChange = this.handlePageSizeChange.bind(this);
  }

  handlePageChange(page) {
    this.setState({ page });
  }

  handlePageSizeChange(size) {
    this.setState({ pageSize: size });
  }
 

  async componentDidMount() {
    console.log("Checked Employees", this.state.checkedemployee);
    const context = this.context;
   
    const data = {
     customer:'null',
     employee: this.props.salesman_item
    }

    let employee_data = {
      employee:'null',
      customer:'null'
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listCustomerSalesManAction(data, context.setModalTypeHandler, context.setLoaderStatusHandler),
      this.props.listUserCreationAction(
       context.setModalTypeHandler,
       context.setLoaderStatusHandler, 
     ),
      
	    );
 // this.setState({customer_table:this.props.getcustomersalesman})
  //await this.props.ListsalesmanAction(employee_data, context.setModalTypeHandler, context.setLoaderStatusHandler)
  
  }

  componentDidUpdate(preProps, preState) {
    console.log("Checked Employees", this.state.checkedemployee);
    const context = this.context;
    let employee_data = {
      employee: this.props.salesman_item,
      customer:'null'
    }
    let statevalue = this.props.salesman_item
    if(preState.employee !== statevalue){
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.ListsalesmanAction(employee_data, context.setModalTypeHandler, context.setLoaderStatusHandler)
      );
      this.setState({employee:statevalue})
      this.setState({customer_table:this.props.getcustomersalesman})
      // this.setState({checkedemployee:this.props.customer_mapping})
    }

    if(preProps.getcustomersalesman!==this.props.getcustomersalesman){
      this.setState({customer_table:this.props.getcustomersalesman})
    }
    
    if(preProps.customer_mapping!==this.props.customer_mapping){
      this.setState({checkedemployee:this.props.customer_mapping})
      let value = this.props.customer_mapping.length>0? this.props.customer_mapping.map((d)=> {return d}):[]
      let newarray = value.concat(this.state.customer_table)
      this.setState({customer_table:newarray})
      let previos_map = this.props.customer_mapping.length>0? this.props.customer_mapping.map((d)=>d.customer_id):[]
      this.setState({ previous_mapping_id: previos_map })
      let initialMapped = this.props.customer_mapping || [];
      this.setState({
        checkedemployeePrevious: initialMapped, 
      });
      //this.setState({customer_table:[...this.state.customer_table],...this.props.customer_mapping})
    }
  }


  setFilter = (data) => this.setState({ filter: data });

  handleFilter = (data) => this.setState({ filterOpen: data });

  handlerowclick = (data)=>this.setState({rowopen:data})

  handleemployeeclick=(data)=>this.setState({employeeOpen:data})

  handlecheckboxclick =(data) =>this.setState({checkedemployee: data}) 

  

  s = async (id) => {
    if (_.isEmpty(id)) {
      let getId = await this.props.ledger_list
        .map((m) => {
          return m.id === id ? m : null;
        })
        .filter((f) => f !== null);
      await this.setState({ edit_id_data: getId, open: true });
    }
  };
 
  handledialog = (id) => {
    this.setState({ delete: true, id: id });
  };

  handleClose = (id) => {
    this.setState({ open: false, dialog: false, delete: false });
  };
  addNote = (msg) => {
    this.setState({ note: msg });
  };
  responseDialog = async (res, resSeverity) => {
    await this.setState({
      ...this.state.dialog,
      dialog: { msg: res, severity: resSeverity, open: true },
    });
  };
  handleSubmit = async (data) => {
    const context = this.context;
    if (data?.id) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.updateLedgerAction(
          data.id,
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        )
      );
      await this.setState({ open: false });
    } else {
      const id = this.props.stock_ledger_list[0]?.sequence_id;
      const current_seq = this.props.stock_ledger_list[0]?.current_seq;

      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.createLedgerAction(
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          id,
          { current_seq },
        )
      );

      await this.setState({ open: false });
    }
  };

  handlecheckbox =(e, rowData)=>{
     this.setState({checkedemployee:[...this.state.checkedemployee,rowData]})

  }

handleMappingRemove = (e, rowData) => {
  this.setState((prevState) => {
      let updatedCheckedEmployees = prevState.checkedemployee.filter(
          (i) => i.customer_id !== rowData.customer_id
      );
      let updatedCustomerTable = [...prevState.customer_table];
      let objIndex = updatedCustomerTable.findIndex(
          (obj) => obj.customer_id === rowData.customer_id
      );
      if (objIndex !== -1) {
          updatedCustomerTable[objIndex] = {
              ...updatedCustomerTable[objIndex],
              mapping: null,
          };
      } else {
          updatedCustomerTable.push({
              ...rowData,
              mapping: null,
          });
      }
      return {
          checkedemployee: updatedCheckedEmployees,
          customer_table: updatedCustomerTable,
      };
  });
};


  commonFilterMapping = (array, columnName) => {
    if (typeof array === 'object') {
      let Data = array.map((a) => a[columnName]);
      return Data;
    } else {
      return array;
    }
  };

  sample = (value) => {
    this.setState({ open: value, rowPopup: { open: value }, columPopup: { open: value }, cancelSale: value });
  };

  clearButton = () => {
 
    this.setState({
     
      filtedValue: {
        customer: 'null',
        employee:'null'
        
      },
    }); //from:firstDay, to:lastDay, ...this.state.filtedValue,
  };
handleclear =()=>{
  this.setState({
    employeevalue:[]
  })
}
  ApplyButton = async (formValue) => {
    await this.setState({ filtedValue: formValue });
    
    const context = this.context;
    const { customer } = this.state.filtedValue;

    const data = {
    customer,
    employee: this.props.salesman_item
      // customer: this.commonFilterMapping(customer, 'customer'),
    };
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listCustomerSalesManAction(
        data,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      )
	  );
    this.setState({ filterOpen: false });
  };
  ApplyEmployee = async (formValue) => {
    await this.setState({ filtedValue: formValue });
    
    const context = this.context;
    const { customer, employee } = this.state.filtedValue;

    const data = {
    customer,
    employee
      // customer: this.commonFilterMapping(customer, 'customer'),
    };
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.ListsalesmanAction(
        data,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      )
	  );
    this.setState({ filterOpen: false });
  };


  handleinsert = async()=>{
  // await this.setState({ employee_selected_value: formValue });
    
    const context = this.context;
  //   const { employee } = this.state.employee_selected_value;

    const data = {
    employee_id:this.props.salesman_item,
    customer_id:this.state.checkedemployee.map((d)=>d.customer_id),
    previous_id:this.state.previous_mapping_id
      // customer: this.commonFilterMapping(customer, 'customer'),

    };
    await apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.SalesmaninsertAction(
        data,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      )
	  );
    // this.setState({employee:'null'})
    // this.setState({checkedemployee:[]})
    // this.setState({customer_table:[]})
    this.props.handleClose()
  }

  isSameList = () => {
    const prevIds = this.state.checkedemployeePrevious.map(i => i.customer_id).sort();
    const currIds = this.state.checkedemployee.map(i => i.customer_id).sort();
    return JSON.stringify(prevIds) === JSON.stringify(currIds);
  };

  removeDuplicateCharacters(string) {
    if (!string) return '';

    const getFilter = string?.split(',').filter(function (item, pos, self) {
      return self.indexOf(item) == pos;
    });
    const removeInr = _.uniqBy(
      getFilter.map((d, i) => {
        const getType = d.trim().split(' ')[0];
        return getType;
      }),
    ).join(', ');

    return removeInr;
  }


  escapeRegExp = (value) => {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  };

 

  cancelSearch = (e) => {
    this.setState({ searchData: [], searchPageData: [], page: 0, searchVal: '' });
  };
  handleEdit = async (data, editIndex) => {
    this.setState({
      edit_id_data: data,
      open: true,
      status: 'edit',
      columPopup: { open: false, rowIndex: editIndex },
    });
  };

  customerid = () => {

    this.setState({ Customerid: '' })
  }

  render() {
 console.log('this.state.checkedemployee', this.state.checkedemployee,  this.state.customer_table)
    return (
      <CreateNewButtonContext.Consumer>
        {({
          commoncookie,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
          setModalStatusHandler,
        }) => (
          <React.Fragment>
            <AlertDialog
              delete={this.state.delete}
              handleClose={this.handleClose}
              handleDelete={this.handleDelete}
              id={this.state.id}
            />
            
            <Grid
              container
              display='flex'
              justifyContent='flex-end'
              alignItems='center'
              spacing={3}
            >
              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>

                <Card>
                  <Grid container display='flex' flexDirection='row' alignItems='center' spacing={2} p='20px'>
                    <Grid
                      size={{
                        lg: 10.3,
                        md: 10.3,
                        sm: 8,
                        xs: 7
                      }}>
                      <Autocomplete
                        value={
                          this.props.salesman_item !== null
                            ? this.props.userCreation.filter(f => f.employee_id === this.props.salesman_item)?.[0] || {}
                            : ''}
                        onChange={(event, newValue) => {
                          this.setState({
                            employee: newValue === null ? 'null' : newValue.employee_id

                          });
                        }}
                        disablePortal
                        name='employee'
                        id='combo-box-demo'
                        options={_.uniqBy(this.props.userCreation.filter((d) => d.role_name === 'Salesman'), 'username')}
                        getOptionLabel={(option) => option.username || ''}
                        fullWidth
                        renderOption={(props, option) => {
                          return (
                            <li {...props} key={option.employee_id}>
                              {option.username}
                            </li>
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            // onBlur={handleChange}
                            label='Employee'
                            variant='filled'
                          // error={formErrors.role_id === null ? false : true}
                          // helperText={
                          //   formErrors.role_id === null ? '' : formErrors.role_id
                          // }
                          // required={true}
                          />
                        )}
                      />
                    </Grid>
                    <Grid
                      display='flex'
                      justifyContent='end'
                      gap={4}
                      size={{
                        lg: 1.7,
                        md: 1.7,
                        sm: 4,
                        xs: 5
                      }}>
                      {/* <Grid> */}
                    <Button
                        variant='contained'
                        onClick={this.props.handleClose}
                        color='secondary'
                        sx={{}}
                    >
                        {"Cancel"}
                    </Button>
                
                    <Button
                      onClick={this.handleinsert}
                      variant='contained'
                      disabled={this.isSameList()}
                    >
                      {"Submit"} 
                    </Button>
                  {/* </Grid> */}
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
              <Card style={{ maxHeight: `calc(${maxHeight} - 80px)`, minHeight: `calc(${maxHeight} - 80px)`, display:'flex', flexDirection:'row',gap: '10px',}}>
                <Grid
                  size={{
                    lg: 6,
                    md: 6,
                    sm: 6,
                    xs: 6
                  }}>
     
              <MaterialTable
                      style={{
                        maxHeight: `calc(${maxHeight} - 80px)`,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
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
                        </div>
                      </div>
                      <div>
                        <span style={{ paddingLeft: '10px', color: 'red' }}>
                          {this.state.errormsg.from}
                        </span>
                      </div>
                    </>
                  ),
                }}
                actions={[
                  {
                    icon: () => (
                      <div style={{ display: 'flex' }}>
                        <FilterSalesMan
                          catabrand={true}
                          locat={true}
                          customer={this.state.customer}
                          salesmancustomer={this.props.getcustomersalesman}
                          filtedValue={this.state.filtedValue}
                          setFilter={this.setFilter}
                          handleChange={this.handleChange}
                          handleClose={this.handleFilter}
                          open={this.state.filterOpen}
                          ApplyButton={this.ApplyButton}
                          clearButton={this.clearButton}
                        />
                      </div>
                    ),
                    tooltip: 'Filter',
                    isFreeAction: true,
                  },
                  // {
                  //   tooltip: "Customer mapping on selected rows",
                  //   icon: "add",
                  //   onChange: (evt, data) =>{
                  //     this.setState({ employeevalue:data})

                  //   }
                  // }
                ]}
                // onRowClick={(evt, rowData) => {
                //   this.setState({
                //     rowPopup: {
                //       rowIndex: this.props.pos_sale_by_pagination.findIndex((i) =>
                //         rowData.sale_id
                //           ? i.sale_id === rowData.sale_id
                //           : i.customer_id === rowData.customer_id,
                //       ),
                //       open: true,
                //     },
                //   });
                // }}
                // onPageChange={(page) => this.handlePageChange(page)}
                // onRowsPerPageChange={(size) => this.handlePageSizeChange(size)}
                options={{
                  headerStyle: {
        ...headerStyle,
        position: 'sticky',
        top: 0,
        zIndex: 10
    },
    cellStyle: {
        ...cellStyle,
        whiteSpace: 'nowrap'
    },
                  search: true,
                  //selection:true,
                //   selectionProps: rowData => ({
                    
                //     checked: rowData.customer_id === this.props.customer_mapping.map((d)=>d.customer_id)
                // }),
                  exportButton: true,
                  filtering: false,
                  actionsColumnIndex: -1,
                  maxBodyHeight,
                   pageSize: pageSize,
                  pageSizeOptions: [20, 50, 100],
                  totalCount: this.props.possale_count,
                  exportMenu: [
                    {
                      label: 'Export PDF',
                      exportFunc: (cols, datas) => {
                        const allData = this.props.getcustomersalesman.map((r, id) => {
                          const { tableData, ...record } = r;
                          record.company =
                            record.customer_type === '0'
                              ? record.first_name
                              : record.company_name;
                          return { id, ...record };
                        });

                        ExportPdf(cols, allData);
                      },
                    },
                    {
                      label: 'Export CSV',
                      exportFunc: (cols, datas) => {
                        const allData = this.props.getcustomersalesman.map((r, id) => {
                          const { tableData, ...record } = r;
                          record.company =
                            record.customer_type === '0'
                              ? record.first_name
                              : record.company_name;
                          return { id, ...record };
                        });

                        ExportCsv(cols, allData);
                      },
                    },
                  ],
                }}
                // onSelectionChange={data => {
                //   // this.toggle.bind(this, data.id);
                //   this.setState({employeevalue : data})
                // }}
                
                page={this.state.page}
                columns={[
                  {
                    title: "Select",
                    render: (rowData) => {
                      const button = (
                        <IconButton
                          color="inherit"
                          onClick={(e) => {
                            this.handlecheckbox(e, rowData)
                          }}
                        >
                          <ArrowForwardIcon />
                        </IconButton>
                      );
                      return button;
                    }
                  },
                //   { title: "Select",
                //   field: "surname",
                //   render: rowData => (
                //         <Checkbox
                //           checked={
                //            this.state.checkedemployee.filter((d)=>d.customer_id === rowData.customer_id).length>0?true:false
                //           }
                //           // value = {this.state.checkedemployee}
                //           // onChange={this.setState({employeevalue:  Object.entries(rowData)})}
                //           onChange={(e)=> this.handlecheckbox(e, rowData)
                //           // this.setState({checkedemployee:[...this.state.checkedemployee,rowData]}).splice(rowData.id, 1)
                          
                //         }
                //           //this.setState({checkedemployee:[rowData]})
                //         // }
                         
                //         />
                //       ),
                //  },
                  {
                    field: 'company',
                    title: 'Name',
                    render: (rowData) => (
                      <List component='nav' aria-label='main mailbox folders'>
                        <ListItem>
                          <ListItemIcon>
                            {/* {rowData.customer_type === '0' ?(
                              <PersonIcon />
                            ) : ( */}
                              <BusinessIcon />
                            
                          </ListItemIcon>
                          <ListItemText
                           
                            primary={rowData.company}
                          />
                          
                        </ListItem>
                      </List>
                    ),
                  },
                  
                  {
                    field: 'phone_number',
                    title: 'Phone Number',
                  },
                  {
                    field: 'email',
                    title: 'Email',
                  },
                  {
                    field: 'area',
                    title: 'Area',
                  },
                ]}
                data={
                  this.props.getcustomersalesman?.length > 0
                    ? _.differenceBy(
                        this.props.getcustomersalesman.map((r, id) => {
                          const { tableData, ...record } = r;
                          record.company =
                            record.customer_type === '0' ? record.first_name : record.company_name;
                          return { id, ...record };
                        }),
                        this.state.checkedemployee,
                        'customer_id'
                      )
                    : []
                }
                
                // data={this.props.getcustomersalesman.filter(({ customer_id: id1 }) => !this.props.customer_mapping.some(({ customer_id: id2 }) => id2 === id1))}
              //   data={
                
              //  this.state.customer_table.length > 0 ? 
              //  _.differenceBy(
              //  this.state.customer_table.map((r, id) => {
              //     const {tableData, ...record} = r;
              //     record.company =
              //       record.customer_type === '0' 
              //         ? record.first_name
              //         : record.company_name;
                 
              //     return {id, ...record};
              //   }), this.state.checkedemployee,'customer_id'):
              //  this.props.getcustomersalesman ? 
               
              //  _.differenceBy(
              //  this.props.getcustomersalesman
              //   //  this.props.getcustomersalesman.filter(({ customer_id: id1 }) => !this.props.customer_mapping.some(({ customer_id: id2 }) => id2 === id1))
              //     .slice(0, this.props.pageSize)
              //        .map((r, id) => {
              //          const {tableData, ...record} = r;
              //          record.company =
              //            record.customer_type === '0' 
              //              ? record.first_name
              //              : record.company_name;
                      
              //          return {id, ...record};
              //        }), this.state.checkedemployee,'customer_id')
              //    : []
              //   }
                title={
                  <Typography variant='h6' align='left' style={{ paddingTop: '10px', paddingBottom: '10px' }} >
                    Customer List</Typography>}
              />
        
            </Grid>
            <Grid
              size={{
                lg: 6,
                md: 6,
                sm: 6,
                xs: 6
              }}>
            <MaterialTable
                      style={{
                        maxHeight: `calc(${maxHeight} - 80px)`,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
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
                       </div>
                     </div>
                     <div>
                       <span style={{ paddingLeft: '10px', color: 'red' }}>
                         {this.state.errormsg.from}
                       </span>
                     </div>
                   </>
                 ),
               }}
              //  actions={[
              //  ]}
              //  onPageChange={(page) => this.handlePageChange(page)}
              //  onRowsPerPageChange={(size) => this.handlePageSizeChange(size)}
               options={{
                headerStyle: {
        ...headerStyle,
        position: 'sticky',
        top: 0,
       
        zIndex: 10
    },
    cellStyle: {
        ...cellStyle,
        whiteSpace: 'nowrap' 
    },
                 search: true,
                //  selection:true,
                 exportButton: true,
                 filtering: false,
                 actionsColumnIndex: -1,
                  maxBodyHeight,
                  // paging: false,   // default rows per page
                  pageSize: pageSize,
                  pageSizeOptions: [ 20, 50, 100], // user can switch
                 totalCount: this.props.possale_count,
                 exportMenu: [
                   {
                     label: 'Export PDF',
                     exportFunc: (cols, datas) => {
                       const allData = this.state.checkedemployee.map((r, id) => {
                         const { tableData, ...record } = r;
                         record.company =
                           record.customer_type === '0'
                             ? record.first_name
                             : record.company_name;
                         return { id, ...record };
                       });
                       ExportPdf(cols, allData);
                     },
                   },
                   {
                     label: 'Export CSV',
                     exportFunc: (cols, datas) => {
                       const allData = this.state.checkedemployee.map((r, id) => {
                         const { tableData, ...record } = r;
                         record.company =
                           record.customer_type === '0'
                             ? record.first_name
                             : record.company_name;
                         return { id, ...record };
                       });
                       ExportCsv(cols, allData);
                     },
                   },
                 ],
               }}
               page={this.state.page}
               columns={[
                // {
                //   field:'username',
                //   title:'Employee Name'
                // },
                  {
                    title: "Remove",
                    render: (rowData) => {
                      const button = (
                        <IconButton
                          color="inherit"
                          onClick={(e) => {
                            this.handleMappingRemove(e, rowData)
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      );
                      return button;
                    }
                  },
                 {
                   field: 'company',
                   title: 'Name',
                   render: (rowData) => (
                     <List component='nav' aria-label='main mailbox folders'>
                       <ListItem>
                         <ListItemIcon>
                           {rowData.customer_type === '0' ?(
                             <PersonIcon />
                           ) : (
                             <BusinessIcon />
                           )}
                         </ListItemIcon>
                         <ListItemText
                           
                            primary={rowData.company}
                          />
                         
                       </ListItem>
                     </List>
                   ),
                 },
                 
                 {
                   field: 'phone_number',
                   title: 'Phone Number',
                 },
                 {
                   field: 'email',
                   title: 'Email',
                 },
                 {
                   field: 'area',
                   title: 'Area',
                 },
               ]}
               data={
               
                this.state.checkedemployee
                ? this.state.checkedemployee
                    .map((r, id) => {
                      const {tableData, ...record} = r;
                     
                      record.company =
                        record.customer_type === '0' ? record.first_name
                          : record.company_name;
                      return {id, ...record};
                    })
                : []
                // this.props.getcustomersalesman.filter ((d)=> this.props.customer_mapping.some(s=>  d.customer_id === s.customer_id))
               }
               title={
                 <Typography variant='h6' align='left' style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                   Customer Mapped List</Typography>}
             />
              </Grid>
              </Card>
              </Grid>
            </Grid>
           
          </React.Fragment>
        )}
      </CreateNewButtonContext.Consumer>
    );
  }
}
const mapStateToProps = (state) => {
  return {
  
    getcustomersalesman:state.customerReducer.getcustomersalesman|| [],
    userCreation: state.UserCreationReducer.createUser || [],
    customer_mapping:state.customerReducer.customer_mapping|| [],
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
   
    listCustomerSalesManAction:( data,setModalTypeHandler, setLoaderStatusHandler) =>{
     return dispatch(listCustomerSalesManAction(data,setModalTypeHandler, setLoaderStatusHandler))
    },
    listUserCreationAction: (setModalTypeHandler, setLoaderStatusHandler) => {
     
      return dispatch(
        listUserCreationAction(setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    
    SalesmaninsertAction: (data,setModalTypeHandler, setLoaderStatusHandler) => {
     
      return dispatch(
        SalesmaninsertAction(data,setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    ListsalesmanAction: (data,setModalTypeHandler, setLoaderStatusHandler) => {
     
      return dispatch(
        ListsalesmanAction(data,setModalTypeHandler, setLoaderStatusHandler),
      );
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(SalesManCustomer);

