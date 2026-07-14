import React, {Component} from 'react';
import {connect} from 'react-redux';
import Layout from '../../../components/Layout/index';
import MaterialTable from 'utils/SafeMaterialTable';
import _ from 'lodash';
import NewTax from '../../../components/NewTaxCode.js';
import {
  listTaxAction,
  updateTaxAction,
  getbyidTaxAction,
  deleteTaxAction,
  createTaxAction,
} from '../../../redux/actions/tax_actions';
import {listTaxCategoryAction} from '../../../redux/actions/tax_Category_actions';
import {listTaxCustomerCategoryAction} from '../../../redux/actions/tax_Customer_Category';
import AlertDialog from '../../common/Dialog';
import {tax_col} from '../../../utils/columns';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import { Typography } from '@mui/material';

class Tax extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tax_data: [],
      open: false,
      edit_id_data: [],
      dialog: {open: false, msg: '', severity: ''},
      delete: false,
      id: '',
    };
  }

  async componentDidMount() {
    await this.props.listTaxAction();
    await this.setState({tax_data: this.props.tax});
  }

  handleEdit = async (id) => {
    if (_.isEmpty(id)) {
      //  await this.props.getbyidTaxAction(id)
      let getId = await this.props.tax
        .map((m) => {
          return m.id === id && delete m['tableData'] ? m : null;
        })
        .filter((f) => f !== null);
      // let rem = getId.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      await this.setState({edit_id_data: getId, open: true});
    }
  };
  handleDelete = async (id) => {
    await this.props.deleteTaxAction(id);
    this.setState({delete: false});
    // await this.getData()
  };
  handledialog = (id) => {
    this.setState({delete: true, id: id});
  };
  handleClose = () => {
    this.setState({open: false, dialog: false, delete: false});
  };
  responseDialog = async (res, resSeverity) => {
    await this.setState({
      ...this.state.dialog,
      dialog: {msg: res, severity: resSeverity, open: true},
    });
  };

  handleSubmit = async (data) => {
    if (data.id) {
      await this.props.updateTaxAction(data.id, data);
      await this.setState({open: false});
    } else {
      await this.props.createTaxAction(data);
      await this.setState({open: false});
    }
  };

  render() {
    // const {tax,tax_id_data} = this.props

    const filteredCol = tax_col.length
      ? tax_col.map((d) => ({title: d, field: d}))
      : this.props.tax[0]
      ? Object.keys(this.props.tax[0]).map((o) => ({title: o, field: o}))
      : [];

    return (
      <Layout>
        <AlertDialog
          delete={this.state.delete}
          handleClose={this.handleClose}
          handleDelete={this.handleDelete}
          id={this.state.id}
        ></AlertDialog>
        {this.state.open === false && (
          <MaterialTable
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
                onClick: (event, rowData) => this.handledialog(rowData.id),
              },
              {
                icon: 'add',
                tooltip: 'add',
                isFreeAction: true,
                onClick: (event, rowData) =>
                  this.setState({open: true, edit_id_data: []}),
              },
            ]}
            options={{
              headerStyle: {
                fontSize: 15
              },
              // fixedColumns: {
              //   left: 2,
              //   right: 0
              // },
              exportButton: true,
              filtering: false,
              actionsColumnIndex: -1,
              maxBodyHeight: '68vh',
              pageSize: 20,
              pageSizeOptions: [20, 50, 100],
              exportMenu: [
                {
                  label: 'Export PDF',
                  exportFunc: (cols, datas) =>
                    ExportPdf(cols, datas, 'TaxData'),
                },
                {
                  label: 'Export CSV',
                  exportFunc: (cols, datas) =>
                    ExportCsv(cols, datas, 'TaxData'),
                },
              ],
            }}
            // columns={
            //   this.props.tax ? this.props.tax.map((t) =>
            //     Object.keys(t).map((o) => { return { title: o, field: o }
            //   }))[0] : []
            // }
            columns={filteredCol}
            data={
              this.props.tax
                ? this.props.tax.slice(0, this.props.pageSize).map((r) => {
                    const {tableData, ...record} = r;
                    return record;
                  })
                : []
            }
            title={<Typography variant='h6'>Tax</Typography>}
          />
        )}
        {this.state.open && (
          <NewTax
            edit_id_data={this.state.edit_id_data}
            handleClose={this.handleClose}
            handleSubmit={this.handleSubmit}
            {...this.props}
          />
        )}
        {/* <Snackbar open={this.state.dialog.open} autoHideDuration={5000} anchorOrigin = {{ vertical: 'top', horizontal: 'right' }} onClose={this.handleClose}>
        <Alert onClose={this.handleClose} severity={this.state.dialog.severity} variant="filled">
          {this.state.dialog.msg}
        </Alert>
       </Snackbar> */}
      </Layout>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    tax: state.taxReducer.tax || [],
    taxcategory: state.taxCategoryReducer.taxcategory || [],
    taxcustomercategory:
      state.taxCustomerCategoryReducer.taxcustomercategory || [],
    tax_id_data: state.taxReducer.tax_id_data || [],
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listTaxAction: () => {
      dispatch(listTaxAction());
    },
    createTaxAction: (data) => {
      dispatch(createTaxAction(data));
    },
    getbyidTaxAction: (id) => {
      dispatch(getbyidTaxAction(id));
    },
    updateTaxAction: (id, data) => {
      dispatch(updateTaxAction(id, data));
    },
    deleteTaxAction: (id) => {
      dispatch(deleteTaxAction(id));
    },
    listTaxCategoryAction: () => {
      dispatch(listTaxCategoryAction());
    },
    listTaxCustomerCategoryAction: () => {
      dispatch(listTaxCustomerCategoryAction());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Tax);

