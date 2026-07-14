import React, {Component} from 'react';
//import NewCustomer from '../../../components/Customer';
import {connect} from 'react-redux';
import NewVendor from '../../../components/NewVendor';
import MaterialTable from 'utils/SafeMaterialTable';
import _ from 'lodash';
import {
  listVendorAction,
  updateVendorAction,
  getbyidVendorAction,
  deleteVendorAction,
  createVendorAction,
} from '../../../redux/actions/vendor_actions';
import {listTaxAction} from '../../../redux/actions/tax_actions';
import {listTaxCategoryAction} from '../../../redux/actions/tax_Category_actions';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import { Typography } from '@mui/material';
import { maxBodyHeight, headerStyle, cellStyle } from 'utils/pageSize';
class Vendor extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.state = {
      vendor_data: [],
      open: false,
      edit_id_data: [],
      update: true,
      dialog: {open: false, msg: '', severity: ''},
      status: '',
      delete: false,
      id: '',
    };
  }

  async componentDidMount() {
    const context = this.context;
    await this.props.listVendorAction(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
    );
    await this.setState({vendor_data: this.props.vendor});
    if (this.props.setModalStatusHandler) this.setState({open: true});

    // await this.props.listVendorAction()
    // await this.setState({vendor_data:this.props.vendor})
  }
  // componentDidUpdate(prevProps, prevState) {
  //   if (prevState.customer_data !== this.props.customer ) {
  //     this.setState({ customer_data: this.props.customer,open:false})
  //     //this.getData()
  //   }
  // }

  handleEdit = async (id) => {
    if (_.isEmpty(id)) {
      let getId = await this.props.vendor.filter((m) => {
        return m.supplier_id === id;
      });
      // let rem = getId.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      await this.setState({edit_id_data: getId, open: true, status: 'edit'});
    }
  };
  handleDelete = async (id) => {
    const context = this.context;
    await this.props.deleteVendorAction(
      id,
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
    );
    this.setState({delete: false});
  };
  handledialog = (id) => {
    this.setState({delete: true, id: id});
  };
  responseDialog = (res, resSeverity) => {
    this.setState({
      dialog: {msg: res, severity: resSeverity, open: true},
      open: false,
    });
  };

  handleClose = () => {
    if (this.props.setModalStatusHandler) {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('vendor', false);
    }
    setTimeout(() => {
      this.setState({open: false, dialog: false, delete: false});
    }, 0);
  };
  // componentDidUpdate(){
  //  if(this.sample !==this.props.alertresponse.severity){
  //   if(this.props.alertresponse.severity !== 'error'){
  //     this.setState({open: false})
  //   }
  //   else{
  //     this.setState({open: true})
  //   }
  //  this.sample = this.props.alertresponse.severity
  //  }

  // }

  // apiAlert = () =>{
  //   if(this.props.alertresponse.severity !== 'error'){
  //     this.setState({open: false})
  //   }
  //   else{
  //     this.setState({open: true})
  //   }
  // }

  sample = (value) => {
    this.setState({open: value});
  };

  handleSubmit = async (data) => {
    const context = this.context;
    if (data.supplier_id) {
      await this.props.updateVendorAction(
        data.supplier_id,
        data,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.sample,
      );

      // setTimeout(() =>{
      //   this.apiAlert()
      // },4000)
      // await this.setState({ open: false})
      // this.apiAlert()
    } else {
      await this.props.createVendorAction(
        data,
        this.props.setModalStatusHandler,
        this.props.setselectData,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.sample,
      );
      //   await this.setState({ open: false})
    }
  };

  render() {
    //  let columns= this.props.customer.map((t) => Object.keys(t).map((o) => { return { title: o, field: o } }))[0]
    //    let mapping = this.props.customer.map((t) => {return t })
    //  //let mapping = this.props.customer.map((d) => { return { address: d.address, address2: d.address2, city: d.city, country: d.country, firstname: d.firstname, id: d.id, lastname: d.lastname, name: d.name, searchkey: d.searchkey } })

    // const filteredCol = vendor_col.length ? vendor_col.map((d) => ({ title: d, field: d }))
    //     : this.props.vendor[0] ?
    //     Object.keys(this.props.vendor[0]).map((o) => ({ title: o, field: o })) : []
    return (
      <>
        <div
          // style={{
          //   width: this.context.drawerOpen
          //     ? 'calc(100vw - 325px)'
          //     : 'calc(100vw - 143px)',
          // }}
        >
          {/* <Layout> */}
          <AlertDialog
            delete={this.state.delete}
            handleClose={this.handleClose}
            handleDelete={this.handleDelete}
            id={this.state.id}
          ></AlertDialog>
          {/* <Snackbar open={this.state.dialog.open} autoHideDuration={4000} anchorOrigin = {{ vertical: 'top', horizontal: 'right' }} onClose={this.handleClose}>
        <Alert onClose={this.handleClose} severity={this.state.dialog.severity} variant="filled">
          {this.state.dialog.msg}
        </Alert>
       </Snackbar> */}
          {this.state.open === false && (
            <MaterialTable
              actions={[
                {
                  icon: 'edit',
                  tooltip: 'edit',
                  position: 'row',
                  onClick: (event, rowData) =>
                    this.handleEdit(rowData.supplier_id),
                },
                {
                  icon: 'delete',
                  tooltip: 'Delete',
                  onClick: (event, rowData) =>
                    this.handledialog(rowData.supplier_id),
                },
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
              options={{
                headerStyle,
                cellStyle,
                // fixedColumns: {
                //   left: 2,
                //   right: 0
                // },
                exportButton: true,
                filtering: false,
                actionsColumnIndex: -1,
                maxBodyHeight: maxBodyHeight,
                pageSize: 20,
                pageSizeOptions: [20, 50, 100],
                exportMenu: [
                  {
                    label: 'Export PDF',
                    exportFunc: (cols, datas) =>
                      ExportPdf(cols, datas, 'VendorData'),
                  },
                  {
                    label: 'Export CSV',
                    exportFunc: (cols, datas) =>
                      ExportCsv(cols, datas, 'VendorData'),
                  },
                ],
              }}
              // columns={filteredCol}
              // columns={
              //   this.props.customer ? this.props.customer.map((t) =>
              //     Object.keys(t).map((o) => { return { title: o, field: o }
              //   }))[0] : []
              // }
              columns={[
                // {
                //   field:'i',
                //   title:'id',
                // },
                {
                  field: 'company_name',
                  title: 'Vendor Name',
                  // render: rowData =>
                  //  <p>{rowData.first_name + ' ' + rowData.last_name}</p>}
                },
                {
                  field: 'phone_number',
                  title: 'Contact Number',
                },
                {
                  field: 'contact_person',
                  title: 'Contact Person',
                },
                {
                  field: 'contact_person_number',
                  title: 'Contact Person Number',
                },
                {
                  field: 'contact_person_desig',
                  title: 'Contact Person Designation',
                },
                {
                  field: 'address',
                  title: 'Address',
                },
              ]}
              data={this.props.vendor
                .slice(0, this.props.pageSize)
                .map((r, i) => {
                  const {
                    company_name,
                    phone_number,
                    address,
                    contact_person,
                    supplier_id,
                  } = r;
                  return {
                    i,
                    company_name,
                    phone_number,
                    address,
                    contact_person: contact_person[0]?.first_name,
                    contact_person_number: contact_person[0]?.phone_number,
                    contact_person_desig: contact_person[0]?.designation,
                    supplier_id,
                  };
                })}
              title={<Typography variant='h6'>Vendor</Typography>}
            />
          )}
          {this.state.open === true && (
            <NewVendor
              edit_id_data={this.state.edit_id_data}
              type='vendor'
              status={this.state.status}
              handleClose={this.handleClose}
              handleSubmit={this.handleSubmit}
              {...this.props}
            />
          )}
          {/* <Dialog
        open={this.state.dialog}
        onClose={!this.state.dialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle >
          <Alert variant="filled" severity="success"> Deleted Succesfully </Alert>
        </DialogTitle>
        <DialogActions>
          <Button onClick={() =>this.handleClose()} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog> */}
          {/* </Layout> */}
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    vendor: state.vendorReducer.vendor || [], //vendorReducer
    // tax: state.taxReducer.tax || [],
    // taxcategory: state.taxCategoryReducer.taxcategory || [],
    vendor_id_data: state.vendorReducer.vendor_id_data || [], //vendorReducer
    alertresponse: state.alertboxReducer,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listVendorAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      dispatch(listVendorAction(setModalTypeHandler, setLoaderStatusHandler));
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
    getbyidVendorAction: (id) => {
      dispatch(getbyidVendorAction(id));
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
      dispatch(
        deleteVendorAction(id, setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    listTaxAction: () => {
      dispatch(listTaxAction());
    },
    listTaxCategoryAction: () => {
      dispatch(listTaxCategoryAction());
    },
    // listTaxAction: () => {
    //   dispatch(listTaxAction())
    // },
    // listTaxCategoryAction: () => {
    //   dispatch(listTaxCategoryAction())
    // },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Vendor);

