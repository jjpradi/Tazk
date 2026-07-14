import React, {Component} from 'react';
import {connect} from 'react-redux';
import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import _ from 'lodash';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {TextField, InputAdornment, Typography} from '@mui/material';
import { getallInvoicetypeAction,DeletenvoicetypeAction,UpdateInvoicetypeAction,insertInvoicetypeAction } from 'redux/actions/pos_creations_actions';
import InvoiceCreate from '../../../pages/sales/invoiceSetup/invoiceCreate'
import apiCalls from 'utils/apiCalls';
import { maxBodyHeight } from 'utils/pageSize';

class index extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      edit_id_data: [],
      dialog: {open: false, msg: '', severity: ''},
      delete: false,
      page: 0,
      pageSize: 20,
      id: '',
      searchData: [],
      searchVal: '',
      searchPageData: [],
    };
  }

  async componentDidMount() {
    const context = this.context;
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.getallInvoicetypeAction(
        context.setModalTypeHandler,  
        context.setLoaderStatusHandler
      )
	  );
   
  }

  handleEdit = async (id) => {
    if (_.isEmpty(id)) {
      let getId = await this.props.getall_invoices
        .map((m) => {
          return m.id === id ? m : null;
        })
        .filter((f) => f !== null);
      await this.setState({edit_id_data: getId, open: true});
    }
  };


  responseDialog = async (res) => {
    const context = this.context;
    if (res === true) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.getallInvoicetypeAction(
          context.setModalTypeHandler,  
          context.setLoaderStatusHandler
        )
      );

      if (this.props.setModalStatusHandler) {
        this.props.setModalStatusHandler(false);
        this.props.setselectData('bank_creation_list', true);
      }
    }
    this.setState({open: false});
    // await this.setState({ ...this.state.dialog, dialog: { msg: res, severity: resSeverity, open: true } })
  };


  handleDelete = async (id) => {
    const context = this.context;
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.DeletenvoicetypeAction(
        id,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        async (res) => {
          if (res) {
            this.props.getallInvoicetypeAction();
          }
        },
      )
	  );
    this.setState({delete: false});
  };

  handledialog = (id) => {
    this.setState({delete: true, id: id});
  };

  handleClose = (id) => {
    if (this.props.setModalStatusHandler) {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('bank_creation_list', false);
    }
    this.setState({open: false, dialog: false, delete: false});
  };



  handleSubmit = async (data) => {
    const context = this.context;
    if (data.id) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.UpdateInvoicetypeAction(
          data.id,
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
         this.responseDialog
        )
      );
    } else {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.insertInvoicetypeAction(
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.responseDialog
        )
      );
    }
  };

  escapeRegExp = (value) => {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  };


  render() {

    return (
      <React.Fragment>
        <CreateNewButtonContext.Consumer>
          {({setModalStatusHandler, setModalTypeHandler, setLoaderStatusHandler}) => (
            <div>
              <AlertDialog
                delete={this.state.delete}
                handleClose={this.handleClose}
                handleDelete={this.handleDelete}
                id={this.state.id}
              />
              {this.state.open === false && (
                <MaterialTable
                  components={{
                    Toolbar: (props) => (
                      <>
                        <div
                          style={{
                            display: 'flex',
                            width: '100%',
                            alignItems: 'center',
                          }}
                        >
                          <div style={{width: '100%'}}>
                            <MTableToolbar {...props} />
                          </div>
                        </div>
                      </>
                    ),
                  }}
                  actions={[
                    {
                      icon: 'edit',
                      tooltip: 'edit',
                      position: 'row',
                      onClick: (event, rowData) => this.handleEdit(rowData.id),
                    },
                    {
                      icon: 'delete',
                      tooltip: 'Delete',
                      onClick: (event, rowData) =>
                        this.handledialog(rowData.id),
                    },
                    {
                      icon: 'add',
                      tooltip: 'add',
                      isFreeAction: true,
                      onClick: (event, rowData) =>
                        this.setState({edit_id_data: [], open: true}),
                    },
                  ]}

              
                  options={{
                    headerStyle: {
                      fontSize: 15
                    },
                    search: true,
                    exportButton: true,
                    filtering: true,
                    actionsColumnIndex: -1,
                    maxBodyHeight: maxBodyHeight,
                  }}
                  columns={[
                    {
                      title: 'voucher Type', field: 'Voucher_type'
                    },
                    {
                      title: 'Prefix', field: 'prefix_format'
                    },
                    // {
                    //   title: 'Period' , feild : 'Period'
                    // },
                    
                    { title: 'Date', field: 'date' },
                  ]}
                  data={
                    this.props.getall_invoices
                  }
                  title={<Typography variant='h6'> Invoice Setup</Typography>}
                />
              )}
              {this.state.open && (
                <InvoiceCreate
                  edit_id_data={this.state.edit_id_data}
                  handleClose={this.handleClose}
                  handleSubmit={this.handleSubmit}
                  {...this.props}
                  setModalStatusHandler={setModalStatusHandler}
                  setModalTypeHandler={setModalTypeHandler}
                />
              )}
            </div>
          )}
        </CreateNewButtonContext.Consumer>
      </React.Fragment>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    getall_invoices: state.posCreationReducer.getall_invoices || [],
    delete_voucher: state.posCreationReducer.delete_voucher || [],
    update_voucher: state.posCreationReducer.update_voucher || [],
    post_voucher: state.posCreationReducer.post_voucher || [],
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    getallInvoicetypeAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(getallInvoicetypeAction(setModalTypeHandler, setLoaderStatusHandler));
    },
    insertInvoicetypeAction: (data,setModalTypeHandler, setLoaderStatusHandler,responseDialog) => {
      return dispatch(insertInvoicetypeAction(data,setModalTypeHandler, setLoaderStatusHandler,responseDialog));
    },
    
    UpdateInvoicetypeAction: (id,data,setModalTypeHandler, setLoaderStatusHandler,responseDialog) => {
      return dispatch(UpdateInvoicetypeAction(id,data,setModalTypeHandler, setLoaderStatusHandler,responseDialog));
    },
    DeletenvoicetypeAction: (id,setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(DeletenvoicetypeAction(id,setModalTypeHandler, setLoaderStatusHandler));
    },
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(index);

