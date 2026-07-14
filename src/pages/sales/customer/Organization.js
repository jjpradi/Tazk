import React, {Component, createRef} from 'react';
import {connect} from 'react-redux';
import MaterialTable from 'utils/SafeMaterialTable';
import {
  listCustomerAction,
  updateCustomerAction,
  deleteCustomerAction,
  createCustomerAction,
} from '../../../redux/actions/customer_actions';
import {
  TextField,
  FormControl,
  InputLabel,
  Box,
  NativeSelect,
  Typography,
} from '@mui/material';
import {
  emailValidation,
  phoneValidation,
} from '../../../components/regexFunction/index';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
// import { color } from '@mui/system';
import apiCalls from 'utils/apiCalls';
import CustomerDetailPopup from './organizationpopup';

const tableCellSx = { paddingBottom: '5px' };
class Customers extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.addActionRef = createRef();
    this.cancelActionRef = createRef();
    this.state = {
      open: false,
      update: true,
      dialog: {open: false, msg: '', severity: ''},
      delete: false,
      id: '',
      organizationOpen : false,
      status : 'create',
      checkerror: {
        gender: false,
        first_name: false,
        phone_number: false,
        email: false,
        designation: false,
        lastname: false,
      },
      formValues: {
        gender: null,
        first_name: null,
        phone_number: null,
        email: null,
        designation: null,
        lastname: null,
      },
      row_id: {id: '', data: ''},
      add_click: false,
      regex: {
        phone_number: /^\d{10}$/,
        email:
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      },
      edit_id_data : {}
      
    };
  }




  async componentDidMount() {
    const context = this.context;
    
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      // this.props.listCustomerAction(
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler,
      // )
    );
  }

  handleEdit = async (id) => {
    this.setState({
      open: true,
      row_id: {id: id.tableData.id, data: id},
      status: 'edit',
    });
  };

  handleEditorganization = async (data) =>{
    this.setState({
      edit_id_data : data,
      organizationOpen : true,
      status:'edit'
    })
  }
  handleCreate = async ({rowData, onRowDataChange}) => {
    this.setState({
      open: true,
      row_id: {data: rowData, onRowDataChange, id: rowData.tableData?.id},
      status: 'create',
    });
  };
  handleDelete = async (id) => {
    await this.props.deleteCustomerAction(id);
    this.setState({delete: false});
  };
  handledialog = (id) => {
    this.setState({delete: true, id: id});
  };

  responseDialog = (res, resSeverity) => {
    this.setState({
      ...this.state.dialog,
      dialog: {msg: res, severity: resSeverity, open: true},
    });
  };

  handleClose = () => {
    this.setState({open: false});
  };

  shippingFilter = (data) =>{
    this.setState({organizationOpen:data})
}

EditSubmit = (data) =>{
  
    console.log('dataaaaediyg', data, this.state.edit_id_data);
    let edit_data = this.state.edit_id_data
    let index_value = edit_data.tableData.index;
    console.log('index_value', index_value)
    // this.props.setorganizationdata([
    //   ...this.props.organizationdata,
    //   values,
    // ]);
    data.gender_name = data.gender === 1 ? 'Male' : data.gender === 2 ? 'Female' : 'Others'
    data.person_id = edit_data.person_id;
    let value = this.props.organizationdata
    console.log('valueee111111', value)
    value[index_value ] = data
console.log('valueeeeeeeeeeeeee', value)
    this.props.setorganizationdata(value)
    this.setState({organizationOpen:false})
   
}

//  handleOrganizationDelete = (id) =>{
//   console.log('iddddd', id);
//   let value =  this.props.organizationdata;
//   console.log('hjjjjjjjjj', value)
//   let val = value.filter((d,i) => { return id != i })
//   this.props.setorganizationdata(val)
 
  
// }
handleOrganizationDelete = (id) => {
  console.log('iddddd', id);
  let value = this.props.organizationdata;

  let updatedValue = value.map((d, i) => {
    if (id === i) {
      return { ...d, status: 1 };
    }
    return d;
  });

  this.props.setorganizationdata(updatedValue);
};
setStatus =(data) =>{
  this.setState({status:data})
}
 shippingApply = async(values) =>{
   
  console.log('shippingdatas', values)

  this.props.setorganizationdata([
              ...this.props.organizationdata,
              values,
            ]);
  // this.setState({formValues : {
  //   gender: null,
  //   first_name: null,
  //   phone_number: null,
  //   email: null,
  //   designation: null,
  //   lastname: null,
  // }})
   
  this.setState({organizationOpen:false})
  
}
  // sample = (value)=>{
  //   this.setState({open:value})
  // }
  handleSubmit = async (data) => {
    const context = this.context;
    // const values = data
    // for (let val in values) {
    //     if (values[val] === true) {
    //         values[val] = 'Y'
    //     }
    //     if (values[val] === false) {
    //         values[val] = 'N'
    //     }
    // }
    if (data.id) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.updateCustomerAction(data.id, data),
      )
      await this.setState({open: false});
    } else {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.createCustomerAction(data)
      );
      await this.setState({open: false});
    }
  };

  handleChange = (e) => {
    // const { name, value } = e.target
    // this.setState({ tableProduct: { ...this.state.tableProduct, [name]: value } })
  };

  render() {
    console.log("thiiiii")
    // const filteredCol = receivingsItems_col.length ? receivingsItems_col.map((d) => ({ title: d, field: d }))
    //     : this.props.product[0] ?
    //         Object.keys(this.props.product[0]).map((o) => ({ title: o, field: o })) : []
    // const filteredCol = Object.keys(receivingsItems[0]).map((o) => ({ title: o, field: o }))
    return (
      //   <Layout>
      //     <AlertDialog delete={this.state.delete} handleClose={this.handleClose} handleDelete={this.handleDelete} id={this.state.id} ></AlertDialog>
      //     <Snackbar open={this.state.dialog.open} autoHideDuration={4000} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} onClose={this.handleClose}>
      //       <Alert onClose={this.handleClose} severity={this.state.dialog.severity} variant="filled">
      //         {this.state.dialog.msg}
      //       </Alert>
      //     </Snackbar>
      //     {this.state.open === false &&
      //     }
      //     {this.state.open === true &&
      //       <ProductForm edit_id_data={this.props.product_id_data} status={this.state.status} type='product' handleClose={this.handleClose} handleSubmit={this.handleSubmit} handleDeactive={this.handleDeactive} {...this.props} />
      //     }
      //   </Layout>
      <>
        <div style={{width: '100%', margin: '20px 0'}}>
          <MaterialTable
            // editable={{
            //   onRowAdd: (newData) =>
            //     new Promise((resolve, reject) => {
            //       setTimeout(() => {
            //         /* setData([...data, newData]); */
            //         let isvalid = false;
            //         const error = this.state.checkerror;
            //         for (let d of [
            //           'gender',
            //           'first_name',
            //           'phone_number',
            //           'email',
            //           'designation',
            //         ]) {
            //           // ,'bar_val'
            //           if (!newData[d]) {
            //             error[d] = true;
            //             isvalid = true;
            //           }
            //         }
            //         if (isvalid) {
            //           this.setState({checkerror: error});
            //           return reject();
            //         }
            //         this.setState({
            //           checkerror: {
            //             gender: false,
            //           },
            //           add_click: false,
            //         });
            //         // newData.gender = newData.gender === 1 ? 'Male': newData.gender === 2 ? 'Female' : 'Others'
            //         this.props.setorganizationdata([
            //           ...this.props.organizationdata,
            //           newData,
            //         ]);
            //         resolve();
            //       }, 1000);
            //     }),
            //   onRowUpdate: (newData, oldData) =>
            //     new Promise((resolve, reject) => {
            //       setTimeout(() => {
            //         const dataUpdate = [...this.props.organizationdata];
            //         const index = oldData.tableData.id;
            //         // oldData.gender = oldData.gender === 1 ? 'Male': oldData.gender === 2 ? 'Female' : 'Others'
            //         dataUpdate[index] = newData;
            //         this.props.setorganizationdata([...dataUpdate]);
            //         resolve();
            //       }, 1000);
            //     }),
            //   onRowDelete: (oldData) =>
            //     new Promise((resolve, reject) => {
            //       setTimeout(() => {
            //         const dataDelete = [...this.props.organizationdata];
            //         const index = oldData.tableData.id;
            //         dataDelete.splice(index, 1);
            //         this.props.setorganizationdata([...dataDelete]);

            //         resolve();
            //       }, 1000);
            //     }),
            // }}

            actions={[
              {
                icon: () => (
                  <div style={{display: 'flex'}}>
                    <CustomerDetailPopup
                      open={this.state.organizationOpen}
                      ApplyButton={this.shippingApply}
                      handleClose={this.shippingFilter}
                      // onChangeVal = {onChange}
                      // formValues = {this.state.formValues}
                      // setFormValues = {this.setValues}
                      // formErrors = {this.state.checkerror}
                      // setFormErrors = {this.setFormErrors}
                      status = {this.state.status}
                      handleEdit = {this.EditSubmit}
                      setStatus = {this.setStatus}
                      edit_id_data ={this.state.edit_id_data}
                      // requiredFields = {requiredFields}
                      
                    />
                  </div>
                ),
                tooltip: 'Add',
                isFreeAction: true,
              },
              (rowData) => ({
                icon: 'edit',
                tooltip: 'edit',
                position: 'row',
                // hidden: this.props.IconHidden ? true : false,
                onClick: (event, rowData) =>{
                  this.handleEditorganization(rowData)
                }
                //   this.handleEdit(rowData.sale_id),
                // disabled:  rowData.sale_status === 7? true : rowData?.creditReturn > 0 || rowData.dc_invoice !==null ? true :
                // rowData.sale_status === 6 ? rowData.dc_number !== null ? false : true : false 
                
              }),
              (rowData) => ({
                icon: 'delete',
                tooltip: 'delete',
                position: 'row',
                // hidden: this.props.IconHidden ? true : false,
                onClick: (event, rowData) =>{
                  this.handleOrganizationDelete(rowData.tableData.index)
                }
                //   this.handleEdit(rowData.sale_id),
                // disabled:  rowData.sale_status === 7? true : rowData?.creditReturn > 0 || rowData.dc_invoice !==null ? true :
                // rowData.sale_status === 6 ? rowData.dc_number !== null ? false : true : false 
                
              }),
             
              ]}
            options={{
              headerStyle: {
                fontSize: 15
              },
              // showTitle: false,
              // paging:false,
              // toolbar:false,
              exportButton: true,
              // filtering: false,
              // maxBodyHeight: '68vh',
              // pageSize: 20,
              // pageSizeOptions: [20, 50, 100],
              actionsColumnIndex: -1,
              exportMenu: [
                {
                  label: 'Export PDF',
                  exportFunc: (cols, datas) =>
                    ExportPdf(cols, datas, 'AdditionalContacts'),
                },
                {
                  label: 'Export CSV',
                  exportFunc: (cols, datas) =>
                    ExportCsv(cols, datas, 'AdditionalContacts'),
                },
              ],
            }}

            columns={[
              {
                title: 'First Name',
                field: 'first_name',
                editComponent: (props) => (
                  <TextField
                    id='standard-basic1'
                    rows={2}
                    required={true}
                    variant='filled'
                    name='first_name'
                    label='First Name'
                    value={props.value || ''}
                    sx={tableCellSx}
                    error={
                      // !props.value ? this.state.checkerror.first_name : false
                      props.value !== undefined ? props.error : false
                    }
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e)=>{
                      props.onChange(e.target.value)
                    }}
  
  
                  />
                ),
                validate: (rowData) => (!rowData.first_name ? false : true),

              },
              {
                title: 'Last Name',
                field: 'last_name',
                editComponent: (props) => (
                  <TextField
                    id='standard-basic1'
                    rows={2}
                    variant='filled'
                    name='last_name'
                    label='Last Name'
                    value={props.value || ''}
                    sx={tableCellSx}
                    //   error={
                    //     !props.value ? this.state.checkerror.first_name : false
                    //   }
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                  />
                ),
              },

              {
                title: 'Gender',
                field: 'gender_name',
                editComponent: (props) => (
                  // <FormControl fullWidth
                  // error={
                  //   props.value !== undefined ?
                  //     props.error : false
                  // }>
                  //   <InputLabel id="gender-select-label"> Gender</InputLabel>
                  //   <Select
                  //     name="gender"
                  //     variant='standard'
                  //     labelId="demo-simple-select-label"
                  //     id="gender-select"
                  //     value={ props.rowData.gender}
                  //     label=" Gender"
                  //      onChange={(e) => props.onRowDataChange({...props.rowData,gender:e.target.value,gender_name:e.target.value ===1?'Male':e.target.value ===2?'Female':'Others'})}
                  //   >
                  //     <MenuItem value={1}>Male</MenuItem>
                  //     <MenuItem value={2}>Female</MenuItem>
                  //     <MenuItem value={3}>Others</MenuItem>
                  //   </Select>
                  // </FormControl>

                  (<Box sx={{minWidth: '100%'}}>
                    <FormControl
                      fullWidth={true}
                      required={true}
                      error={props.value !== undefined ? props.error : false}
                      variant='filled'
                    >
                      {/* <InputLabel
                        variant='filled'
                        htmlFor='uncontrolled-native'
                      >
                        
                      </InputLabel> */}
                      <NativeSelect
                        //variant='filled'
                        name='gender'
                        value={props.rowData.gender}
                        sx={{paddingTop:'11px'}} 
                        // sx={tableCellSx}
                        error={props.value !== undefined || '' ? props.error : false}
                        onChange={(e) =>
                          props.onRowDataChange({
                            ...props.rowData,
                            gender: e.target.value,
                            gender_name:
                              e.target.value === '1'
                                ? 'Male'
                                : e.target.value === '2'
                                ? 'Female'
                                : 'Others',
                          })
                        }
                        onBlur={(e)=>{
                          props.onChange(e.target.value)
                        }}

                        // inputProps={{
                        //   name: 'gender',
                        //   id: 'uncontrolled-native',
                        // }}
                      >
                        <option value={''}> Select</option>
                        <option value={1}>Male</option>
                        <option value={2}>Female</option>
                        <option value={3}>Others</option>
                      </NativeSelect>
                    </FormControl>
                  </Box>)
                ),
                validate: (rowData) => (!rowData.gender ? false : true),
              },
              {
                title: 'Designation',
                field: 'designation',
                editComponent: (props) => (
                  <TextField
                    id='standard-basic1'
                    variant='filled'
                    name='designation'
                    required={true}
                    label='Designation'
                    value={props.value || ''}
                    sx={tableCellSx}
                    error={
                      //!props.value ? this.state.checkerror.designation : false ||
                      props.value !== undefined ? props.error : false
                    }
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e)=>{
                      props.onChange(e.target.value)
                    }}
  
                  />
                ),
                validate: (rowData) => (!rowData.designation ? false : true),
              },
              {
                title: 'Email',
                field: 'email',
                editComponent: (props) => (
                  <TextField
                    id='standard-basic1'
                    variant='filled'
                    name='email'
                    required={true}
                    placeholder='Email'
                    label='Email'
                    value={props.value || ''}
                    sx={tableCellSx}
                    error={
                      //this.props.email_da === props.value ?
                      props.value !== undefined ? props.error : false
                    }
                    helperText={
                      this.props.email_da === props.value
                        ? 'Enter Different Email'
                        : ''
                    }
                    onBlur={(e)=>{
                      props.onChange(e.target.value)
                    }}
    
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                  />
                ),
                // validate: rowData => rowData.first_name !== ''?true:false
                validate: (rowData) =>
                  emailValidation(rowData.email) !== true ||
                  rowData.email === this.props.email_da
                    ? false
                    : true,
                // validate: rowData => !this.state.regex['email'].test(rowData.email) || rowData.email === this.props.email_da ? false : true
              },
              {
                title: 'Phone Number',
                field: 'phone_number',
                editComponent: (props) => (
                  <TextField
                    id='standard-basic1'
                    type='number'
                    variant='filled'
                    name='phone_num'
                    required={true}
                    onWheel={ (e) => e.target.blur()}
                    placeholder='Phone Number'
                    label='Phone Number'
                    regex='/^\d{10}$/'
                    value={props.value || ''}
                    sx={tableCellSx}
                    error={
                      //this.props.phone_num === props.value &&
                      props.value !== undefined ? props.error : false
                    }
                    helperText={
                      props.value === this.props.phone_num
                        ? 'Enter Different Number'
                        : ''
                    }
                    onBlur={(e)=>{
                      props.onChange(e.target.value)
                    }}
    
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                  />
                ),

                // validate: rowData => !this.state.regex['phone_number'].test(rowData.phone_number) || rowData.phone_number === this.props.phone_num ? false : true
                validate: (rowData) =>
                  phoneValidation(rowData.phone_number) !== true ||
                  rowData.phone_number === this.props.phone_num
                    ? false
                    : true,
              },
            ]}
            data={
              this.props.organizationdata
              //.map(o =>{
              //  return {...o, gender_name : o.gender === 1 || o.gender === '1' ? "Male" : o.gender === 2 || o.gender === '2' ? "Female" : "Others" }
              // })
            }
            title={<Typography variant='h6'>Additional Contacts</Typography>}
          />
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    product: state.customerReducer.product,
    person_id_data: state.customerReducer.person_id_data,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listCustomerAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(listCustomerAction(setModalTypeHandler, setLoaderStatusHandler));
    },
    createCustomerAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        createCustomerAction(data, setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    updateCustomerAction: (
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        updateCustomerAction(
          id,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    deleteCustomerAction: (id, setModalTypeHandler, setLoaderStatusHandler) => {
      dispatch(
        deleteCustomerAction(id, setModalTypeHandler, setLoaderStatusHandler),
      );
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Customers);

