import React, {Component} from 'react';
import {connect} from 'react-redux';
import NewCustomer from '../../../components/NewCustomer';
import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import _ from 'lodash';
import {
  listCustomerAction,
  FilterAction,
  updateCustomerAction,
  deleteCustomerAction,
  createCustomerAction,
  listCustomerStatementAction,
} from '../../../redux/actions/customer_actions';
import {listTaxAction} from '../../../redux/actions/tax_actions';
import {listTaxCategoryAction} from '../../../redux/actions/tax_Category_actions';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { filterColumns } from '../../../components/FieldGuard/filterColumns';
import {listTaxCodesAction} from '../../../redux/actions/taxcodes_actions';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Button,
  Divider,
  Typography,
  IconButton,
  Box
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import {
  updateVendorAction,
  createVendorAction,
  deleteVendorAction,
  listVendorIdAndNameAction,
} from '../../../redux/actions/vendor_actions';
import {
  createDiscountTypeAction,
  listDiscountTypeAction,
} from '../../../redux/actions/discountType_actions';
import App from '../../../components/customer_erpDesign/index';
import {ExportCsv, ExportPdf} from '@material-table/exporters';

import {TransferWithinAStationSharp} from '@mui/icons-material';
import {listUserCreationAction} from '../../../redux/actions/userCreation_actions';
import PointofsaleCustomer from 'components/Pointofsalecustomer';
import {getByIdMailConfigurationAction} from '../../../redux/actions/configuration_actions';
// import App from '../../components/erpDesign/topOrder';
import apiCalls from 'utils/apiCalls';
import { maxBodyHeight } from 'utils/pageSize';

class Customer extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
   
    super(props);
    this.state = {
      customer_data: [],
      open: false,
      edit_id_data: [],
      update: true,
      dialog: {open: false, msg: '', severity: ''},
      status: '',
      delete: false,
      id: '',
      rowPopup: {open: false, rowIndex: ''},
      employee: 0,
      type: 0,
      type_details: 'customer',
      filterupdate: 0,
      filterstate: 'customer',
      employeeupdate: 0,
      newcustomer_type:'',
      currentPage:0,
      editfinds: false
    };
  }


  async componentDidMount() {
    const context = this.context;
    // await this.props.listCustomerAction(context.setModalTypeHandler, context.setLoaderStatusHandler)
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listUserCreationAction(context.setModalTypeHandler, context.setLoaderStatusHandler),
    );
    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   this.props.FilterAction(
    //     this.state.type,
    //     this.state.type_details,
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //     ()=>{}
    //   ));
    let usertype = context.usertype;
    if (usertype === 'Administrator') {
      // await this.setState({type: 4, type_details: 'employee',newcustomer_type:'type:4'});
    } else {
      apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.FilterAction(
        this.state.type,
        this.state.type_details,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        ()=>{}
      ));
    }
    
    
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listDiscountTypeAction(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
    ),
      this.setState({
      customer: this.props.customer,
      customer_type: this.props.customer_type,
      userCreation: this.props.userCreation,
      createUser: this.props.createUser,
    }));
    if (this.props.modalStatus) this.setState({open: true});
  }

  async componentDidUpdate(prevProps, prevState) {
    const context = this.context;

    let filterstate = 'customer';
    if (
      this.state.type !== prevState.type ||
      this.state.type_details !== prevState.type_details
    ) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.FilterAction(
          this.state.type,
          this.state.type_details,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          ()=>{},
        )
      );
    }
    // if(this.state.employeeupdate !== this.state.employee){
    //   this.setState({ employeeupdate : this.state.employee})
    //    this.props.listUserCreationAction(context.setModalTypeHandler, context.setLoaderStatusHandler)
    // }
  }

  handleMailConfiguration = async () => {
    const context = this.context;
    const roleIdData = this.props.createUser.filter(f => f.employee_id === context.commoncookie)
    if(roleIdData.length > 0){
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.getByIdMailConfigurationAction('Sale Order', roleIdData[0]?.role_id)
        );
    }
  }

  handleEdit = async (data, editIndex) => {
    // if (_.isEmpty(id)) {
    //   let getId = await this.props.customer.filter((m) => {
    //     return m.customer_id === id
    //   })
    //   // let rem = getId.map((m) => {
    //   //   return delete m['tableData'] ? m :null
    //   // }).filter( (f) => f !==null )
    // }
    this.setState({
      edit_id_data: data,
      open: true,
      status: 'edit',
      rowPopup: {open: false, rowIndex: editIndex},
    });
  };
  handleDelete = async (id) => {
    const context = this.context;

    if (this.state.is_supplier) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.deleteVendorAction(
          id,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),
        this.props.FilterAction(
          this.state.type,
          this.state.type_details,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          ()=>{}
        )
       );

    } else {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.deleteCustomerAction(
          id,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),
        this.props.FilterAction(
          this.state.type,
          this.state.type_details,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          ()=>{},
        ),
      );
    }

    this.setState({delete: false, rowPopup: {open: false, rowIndex: ''}});
  };
  handledialog = (c_id, s_id) => {
    let is_supplier = false;
    let id = c_id;
    if (s_id) {
      is_supplier = true;
      id = s_id;
    }
    this.setState({delete: true, id, is_supplier});
  };

  responseDialog = (res, resSeverity) => {
    this.setState({
      dialog: {msg: res, severity: resSeverity, open: true},
      open: false,
    });
  };

  handleClose = () => {
    ''
    if (this.props.setModalStatusHandler) {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('customer', false);
      return
    }

    if (this.state.status === 'create') {
      setTimeout(() => {
        this.setState({
          open: false,
          dialog: false,
          delete: false,
          rowPopup: {...this.state.rowPopup, open: false},
        });
      }, 0);
    } else {
      setTimeout(() => {
        this.setState({
          open: false,
          dialog: false,
          delete: false,
          rowPopup: {...this.state.rowPopup, open: true},
        });
      }, 0);
    }
  };

  handleDeleteDialogClose = () => {
    console.log("clickedrfrrf");
    this.setState({
      open: false,
      dialog: false,
      delete: false,
      rowPopup: {...this.state.rowPopup, open: true},
    });
  };
  // handleSubmit = async (data) =>{
  //   data.is_customer='Y'
  //     data.is_vendor='N'
  //   if (data.id){

  //      await this.props.updateCustomerAction(data.id,data,this.responseDialog)
  //      await this.setState({ open: false})
  //   } else{
  //       await this.props.createCustomerAction(data,this.responseDialog)
  //       await this.setState({ open: false})

  //     }

  // }

  sample = (value) => {
    this.setState({open: value});
  };

  handleSubmit = async (data, asVendor, isIndividual, indi_customer_type, contactType) => {
    console.log('hhhh')
    const context = this.context;
    const {...values} = data;
    for (let val in values) {
      if (values[val] === true) {
        values[val] = 1;
      }
      if (values[val] === false) {
        values[val] = 0;
      }
    }
    //--------------------------------------
    if (asVendor) {
      const {customer_id, customer_type, ...record} = data;

      if (data.supplier_id) {
        await this.props.updateVendorAction(
          data.supplier_id,
          record,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.sample,
        );
      } else {
        await this.props.createVendorAction(
          record,
          this.props.setModalStatusHandler,
          this.props.setselectData,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.sample,
        );
      }
      this.setState({type: 3, type_details: 'vendor', newcustomer_type:'type:3'});
      setTimeout(() => {
        apiCalls(
         context.setModalTypeHandler,
         context.setLoaderStatusHandler,
         this.props.FilterAction(
           this.state.type,
           this.state.type_details,
           context.setModalTypeHandler,
           context.setLoaderStatusHandler,
           ()=>{},
         )
        );
         apiCalls(
         context.setModalTypeHandler,
         context.setLoaderStatusHandler,
         this.props.listVendorIdAndNameAction(
           context.setModalTypeHandler,
           context.setLoaderStatusHandler,
           ()=>{},
         )
        );
     }, 1500);
     
    } else {
      if (data.customer_id) {
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.updateCustomerAction(
            data.customer_id,
            values,
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            this.sample,
          )
        );
      } else {
        console.log('happy')
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.createCustomerAction(
            values,
            this.props.setModalStatusHandler,
            this.props.setselectData,
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            this.sample,
            (res)=>{
              if (this.props.pointofsale && this.props.setselectData && res?.data?.data?.[0]) {
                this.props.setselectData('NewCustomerData', res.data.data[0]);
              }
              console.log('river')
              this.setState({type: isIndividual, type_details: 'customer', newcustomer_type: contactType});
            },
            
          )
        );
      }
    }
    if (this.props.type === "leads") {
      this.props.handleLeadsClose()
    }
    if(
      this.props.modaltype == "NewserviceCustomer" || this.props.editType === 'Sales'
    ){
      this.handleClose()
    }
  };
  
  handleDeactive = async (data, status) => {

    const active = {is_active: status};
    if (data.id) {
      const context = this.context;
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.updateCustomerAction(data.id, active),
      );
      await this.setState({open: false});
    }
  };

  rowPopupClose = () => {
    this.setState({rowPopup: {open: false, rowIndex: ''}});
  };

  employeeSetState = async () => {
    const context = this.context;
    this.setState({type: 4, type_details: 'employee', newcustomer_type:'type:4'})
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      await this.props.FilterAction(
        this.state.type,
        this.state.type_details,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        ()=>{}
      )
	   );
  }

  handleEditfind = ()=>{
    this.setState({
      editfinds: false
    });
  }

  render() {
console.log(this.props,'dog')
    //  let columns= this.props.customer.map((t) => Object.keys(t).map((o) => { return { title: o, field: o } }))[0]
    //    let mapping = this.props.customer.map((t) => {return t })
    //  //let mapping = this.props.customer.map((d) => { return { address: d.address, address2: d.address2, city: d.city, country: d.country, firstname: d.firstname, id: d.id, lastname: d.lastname, name: d.name, searchkey: d.searchkey } })

    // const filteredCol = customer_col.length ? customer_col.map((d) => ({ title: d, field: d }))
    //   : this.props.customer[0] ?
    //   Object.keys(this.props.customer[0]).map((o) => (o!=='additional_contacts'?{ title: o, field: o }:{})) : []
    return (
      // <Layout>
      // </Layout>
      <CreateNewButtonContext.Consumer>
        {({
          setModalStatusHandler,
          setModalTypeHandler,
          setcreatNewDataHandler,
          creatNewData,
          drawerOpen,
          selectData,
          setselectData,
          commoncookie,
          headerLocationId,
          setLoaderStatusHandler
        }) => (
          <div
          // style={
          //   this.props.iswidth ||
          //   this.state.status === 'create' ||
          //   this.state.status === 'edit'
          //     ? {}
          //     : {
          //         width: drawerOpen
          //           ? 'calc(100vw - 330px)'
          //           : 'calc(100vw - 143px)',
          //       }
          // }
          >
            {console.log()}
            <AlertDialog
              delete={this.state.delete}
              handleClose={this.handleDeleteDialogClose}
              handleDelete={this.handleDelete}
              id={this.state.id}
            ></AlertDialog>
            {console.log(this.handleDeleteDialogClose,"clickedd")}
            {/* <Snackbar open={this.state.dialog.open} autoHideDuration={2000} anchorOrigin = {{ vertical: 'top', horizontal: 'right' }} onClose={this.handleClose}>
        <Alert onClose={this.handleClose} severity={this.state.dialog.severity} variant="filled">
          {this.state.dialog.msg}
        </Alert>
       </Snackbar> */}

            {this.state.open === false && this.state.rowPopup.open === false && (
              <MaterialTable
                components={{
                  Toolbar: (props) => (
                    <Grid
                      rowSpacing={3}
                      style={{
                        //display: "flex",
                        justifyContent: 'left',
                        alignItems: 'flex-end',
                        flexDirection: 'row',
                        borderSpacing: '10px',
                      }}
                    >
                      <MTableToolbar {...props} />
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-around',
                          padding: '15px',
                          backgroundColor: 'whitesmoke',
                        }}
                      >
                        <IconButton color={this.state.type === 4 ? 'success' : 'primary'}
                          onClick={() => {
                            this.setState({
                              type: 4,
                              type_details: 'employee',
                              newcustomer_type:'type:4'
                            });
                          }}
                          >
                          <Typography variant='h4'>Employee</Typography>
                        </IconButton>
                        {/* <Button
                          color={this.state.type === 4 ? 'success' : 'primary'}
                          variant='contained'
                          onClick={() => {
                            this.setState({
                              type: 4,
                              type_details: 'employee',
                            });
                          }}
                        >
                          Employee
                        </Button> */}
                          <Divider orientation="vertical" flexItem />
                          <IconButton 
                            color={this.state.type === 3 ? 'success' : 'primary'}
                            onClick={() => {
                              this.setState({type: 3, type_details: 'vendor',newcustomer_type:'type:3'});
                            }}
                            >
                              <Typography variant='h4'>Vendor</Typography>
                          </IconButton>
                        {/* <Button
                          color={this.state.type === 3 ? 'success' : 'primary'}
                          variant='contained'
                          onClick={() => {
                            this.setState({type: 3, type_details: 'vendor'});
                          }}
                        >
                          vendor
                        </Button> */}
                          <Divider orientation="vertical" flexItem />
                          <IconButton
                          color={this.state.type === 0 ? 'success' : 'primary'}
                          onClick={() => {
                            this.setState({
                              type: 0,
                              type_details: 'customer',
                              newcustomer_type:'type:1'
                            });
                          }}
                          >
                            <Typography variant='h4'>Individual</Typography>
                            </IconButton>
                        {/* <Button
                          color={this.state.type === 0 ? 'success' : 'primary'}
                          variant='contained'
                          onClick={() => {
                            this.setState({
                              type: 0,
                              type_details: 'customer',
                            });
                          }}
                        >
                          individual
                        </Button> */}
                          <Divider orientation="vertical" flexItem />
                          <IconButton
                          color={this.state.type === 1 ? 'success' : 'primary'}
                          onClick={() => {
                            this.setState({
                              type: 1,
                              type_details: 'customer',
                              newcustomer_type:'type:2'
                            });
                            this.handleMailConfiguration();
                          }}
                          >
                            <Typography variant='h4'>Customer</Typography>
                          </IconButton>
                        {/* <Button
                          color={this.state.type === 1 ? 'success' : 'primary'}
                          variant='contained'
                          onClick={() => {
                            this.setState({
                              type: 1,
                              type_details: 'customer',
                            });
                          }}
                        >
                          customer
                        </Button> */}
                      </div>
                      {/* <CommonFilter  fromTo={true} catabrand={true} from={this.state.from}  to={this.state.to} product={this.props.product} category={this.state.category} brand={this.state.brand} filter={this.state.filter} setFilter={this.setFilter} brandSearch={this.brandSearch} handleChange={this.handleChange}  handleClose={this.handleFilter} open={this.state.filterOpen} ApplyButton={this.ApplyButton} />  */}
                    </Grid>
                  ),
                }}
                actions={[
                  // {
                  //   icon: 'edit',
                  //   tooltip: 'edit',
                  //   position: 'row',
                  //   onClick: (event, rowData) => this.handleEdit(rowData)
                  // },
                  // {
                  //   icon: 'delete',
                  //   tooltip: 'Delete',
                  //   onClick: (event, rowData) => this.handledialog(rowData.customer_id,rowData.supplier_id)
                  // },
                  {
                    icon: 'add',
                    tooltip: 'add',
                    isFreeAction: true,
                    onClick: (event, rowData) =>
                      this.setState({
                        edit_id_data: [],
                        open: true,
                        status: 'create',
                      }),
                  },
                ]}
                // onRowClick={
                //   this.state.type === 4
                //     ? ''
                //     : (evt, rowData) => {
                //         this.setState({
                //           rowPopup: {
                //             rowIndex: this.props.customer.findIndex((i) =>
                //               rowData.customer_id
                //                 ? i.customer_id === rowData.customer_id
                //                 : i.supplier_id === rowData.supplier_id,
                //             ),
                //             open: true,
                //           },
                //         })
                        
                        
                //       }
                // }
                options={{
                  headerStyle: {
                    fontSize: 15
                  },
                  exportButton: true,
                  filtering: false,
                  maxBodyHeight: maxBodyHeight,
                  pageSize: 20,
                  pageSizeOptions: [20, 50, 100],
                  initialPage:this.state.currentPage,
                  actionsColumnIndex: -1,
                  exportMenu: [
                    {
                      label: 'Export PDF',
                      exportFunc: (cols, datas) =>
                       {
                        apiCalls(
                          setModalTypeHandler,
                          setLoaderStatusHandler,
                          this.props.FilterAction(
                            this.state.type,
                            this.state.type_details,
                            setModalTypeHandler,
                            setLoaderStatusHandler,
                          
                          (exportData) => {
                            ExportPdf(
                              cols,
                              exportData.map((m) => {
                                return {
                                  ...m,
                                  company:
                                    m.first_name !== null &&
                                    m.last_name !== ''
                                      ? m.first_name
                                      : m.last_name,
                                };
                              }),
                              'ContactsData',
                            );
                          },
                        )
                          
                        );
                       }
                    },
                    {
                      label: 'Export CSV',
                      exportFunc: (cols, datas) =>{
                        apiCalls(
                          setModalTypeHandler,
                          setLoaderStatusHandler,
                          this.props.FilterAction(
                           this.state.type,
                           this.state.type_details,
                           setModalTypeHandler,
                           setLoaderStatusHandler,
                         
                         (exportData) => {
                           ExportCsv(
                             cols,
                             exportData.map((m) => {
                               return {
                                 ...m,
                                 company:
                                   m.first_name !== null &&
                                   m.last_name !== ''
                                     ? m.first_name
                                     : m.last_name,
                               };
                             }),
                             'ContactsData',
                           );
                         },
                       )
                          
                        );
                      }
                    },
                  ],
                  // tableLayout:'auto'
                }}
                onPageChange={(page) => {
                  this.setState({currentPage:page})
                }}
                columns={filterColumns([
                  {
                    field: 'company',
                    title: 'Name',
                    render: (rowData) => (
                      <List component='nav' aria-label='main mailbox folders'>
                        <ListItem>
                          <ListItemIcon>
                            {rowData.customer_type === '0' ||
                            this.state.type === 4 ? (
                              <PersonIcon />
                            ) : (
                              <BusinessIcon />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            style={{
                              cursor: this.state.type === 4 ? '' : 'pointer',
                              textDecoration:
                                this.state.type === 4 ? '' : 'underline',
                            }}
                            primary={rowData.company}
                          />
                        </ListItem>
                      </List>
                    ),
                  },
                  // {
                  //   field: 'last_name',
                  //   title: 'Last Name'
                  // },
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
                ], this.props.fieldVisibility, 'customers')}
                data={
                  this.props.customer
                    ? this.props.customer
                        .slice(0, this.props.pageSize)
                        .map((r, id) => {
                          const {tableData, ...record} = r;
                          record.company =
                            record.customer_type === '0' ||
                            this.state.type === 4
                              ? record.first_name
                              : record.company_name;
                          record.is_active === 'Y'
                            ? (record.is_active = `âœ”ï¸ Active`)
                            : (record.is_active = `âŒ Deactive`);
                          return {id, ...record};
                        })
                    : []
                }
                title={
                  <Typography variant='h6' align='left'  style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                  Contacts</Typography>}
              />
              )}
            {/* {this.props.type === "leads" && (
              <Box display='flex' justifyContent='flex-end'>
                <Button onClick={() => this.props.handleLeadsClose(false)}>
                  {"Back"}
                </Button>
              </Box>
              )} */}

            {this.state.open === true && this.props.pointofsale !==true && (
              <NewCustomer
                newcustomer_type={this.state.newcustomer_type}
                edit_id_data={this.state.edit_id_data}
                status={this.state.status}
                type='customer'
                handleClose={this.handleClose}
                handleSubmit={this.handleSubmit}
                handleDeactive={this.handleDeactive}
                {...this.props}
                setModalStatusHandler={setModalStatusHandler}
                setModalTypeHandler={setModalTypeHandler}
                open={this.state.open}
                sample={this.sample}
                leadsgender={this.props.leadsgender}
                employeeSetState={this.employeeSetState}
                setselectData = {setselectData}
                selectData={selectData}
                salesCustomer={this.props.salesCustomer}
              />
            )}
            {this.state.open === true && this.props.pointofsale === true && (
              <PointofsaleCustomer
                newcustomer_type={this.state.newcustomer_type}
                edit_id_data={this.state.edit_id_data}
                status={this.state.status}
                type='customer'
                handleClose={this.handleClose}
                handleSubmit={this.handleSubmit}
                handleDeactive={this.handleDeactive}
                {...this.props}
                setModalStatusHandler={setModalStatusHandler}
                setModalTypeHandler={setModalTypeHandler}
                open={this.state.open}
                sample={this.sample}
                leadsgender={this.props.leadsgender}
                employeeSetState={this.employeeSetState}
                
              />
            )}
            {
              //ERP Design Module
              this.state.rowPopup.open && (
                <App
                  // statementOfAccount={this.props.Get_customer_statement}
                  rowIndex={this.state.rowPopup.rowIndex}
                  handleEdit={this.handleEdit}
                  rowPopupClose={this.rowPopupClose}
                  handleDelete={this.handledialog}
                  type={'customer'}
                  mail_configuration={this.props.mail_configuration}
                  setEditfind = {this.handleEditfind}
                />
              )
            }
          </div>
        )}
      </CreateNewButtonContext.Consumer>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    customer: state.customerReducer.customer_filter || [],
    tax: state.taxReducer.tax || [],
    taxcategory: state.taxCategoryReducer.taxcategory || [],
    customer_id_data: state.customerReducer.customer_id_data || [],
    taxcodes: state.taxCodeReducer.taxcodes || [],
    discount_type_list: state.discountTypeReducer.discount_type_list || [],
    customer_type: state.customerReducer.customer_type || [],
    createUser: state.UserCreationReducer.createUser || [],
    mail_configuration: state.ConfigurationReducer.mail_configuration || [],
    vendor: state.vendorReducer.vendorIdAndName,
    fieldVisibility: state.NavigationReducer.fieldVisibility,
    // Get_customer_statement: state.customerReducer.Get_customer_statement || []
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listCustomerAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      dispatch(listCustomerAction(setModalTypeHandler, setLoaderStatusHandler));
    },
    listDiscountTypeAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(
        listDiscountTypeAction(setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    listVendorIdAndNameAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(listVendorIdAndNameAction(setModalTypeHandler, setLoaderStatusHandler));
    },
    createCustomerAction: (
      data,
      setModalStatusHandler,
      setselectData,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
      response,
      custData
    ) => {
      return dispatch(
        createCustomerAction(
          data,
          setModalStatusHandler,
          setselectData,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
          response,
          custData
        ),
      );
    },
    createDiscountTypeAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    ) => {
      dispatch(
        createDiscountTypeAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
        ),
      );
    },
    // listCustomerStatementAction: (id,setModalTypeHandler, setLoaderStatusHandler) => {
    //   dispatch(listCustomerStatementAction(id,setModalTypeHandler, setLoaderStatusHandler))
    // },
    updateCustomerAction: (
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    ) => {
      return dispatch(
        updateCustomerAction(
          id,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
        ),
      );
    },
    deleteCustomerAction: (id, setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(
        deleteCustomerAction(id, setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    listTaxAction: () => {
      dispatch(listTaxAction());
    },
    listTaxCategoryAction: () => {
      dispatch(listTaxCategoryAction());
    },
    listTaxCodesAction: () => {
      dispatch(listTaxCodesAction());
    },
    createVendorAction: (
      data,
      setModalStatusHandler,
      setselectData,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    ) => {
      dispatch(
        createVendorAction(
          data,
          setModalStatusHandler,
          setselectData,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
        ),
      );
    },
    updateVendorAction: (
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    ) => {
      dispatch(
        updateVendorAction(
          id,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
        ),
      );
    },
    deleteVendorAction: (id, setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(
        deleteVendorAction(id, setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    FilterAction: (
      type,
      type_details,
      setModalTypeHandler,
      setLoaderStatusHandler,
      exportCallBack,
      
    ) => {
      return dispatch(
        FilterAction(
          type,
          type_details,
          setModalTypeHandler,
          setLoaderStatusHandler,
          exportCallBack,
        ),
      );
    },
    listUserCreationAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(
        listUserCreationAction(setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    getByIdMailConfigurationAction:(mail_name,role_id) => {
      return dispatch(getByIdMailConfigurationAction(mail_name,role_id))
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Customer);

