import React, {Component} from 'react';
//import NewCustomer from '../../components/Customer';
import {connect} from 'react-redux';
import Layout from '../../../components/Layout/index';
import MaterialTable from 'utils/SafeMaterialTable';
import _ from 'lodash';
import NewTaxCustomerCategory from '../../../components/NewTaxCustomerCategory';
import {
  listTaxCustomerCategoryAction,
  updateTaxCustomerCategoryAction,
  getbyidTaxCustomerCategoryAction,
  deleteTaxCustomerCategoryAction,
  createTaxCustomerCategoryAction,
} from '../../../redux/actions/tax_Customer_Category';
import AlertDialog from '../../common/Dialog';
import {taxCustomerCategory_col} from '../../../utils/columns';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import { Typography } from '@mui/material';
class TaxCustomerCategory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tax_cust_category_data: [],
      open: false,
      edit_id_data: [],
      dialog: {open: false, msg: '', severity: ''},
      delete: false,
      id: '',
    };
  }

  async componentDidMount() {
    await this.props.listTaxCustomerCategoryAction();
    await this.setState({
      tax_cust_category_data: this.props.taxcustomercategory,
    });
  }

  handleEdit = async (id) => {
    if (_.isEmpty(id)) {
      let getId = await this.props.taxcustomercategory
        .map((m) => {
          return m.id === id ? m : null;
        })
        .filter((f) => f !== null);
      await this.setState({edit_id_data: getId, open: true});
    }
  };
  handleDelete = async (id) => {
    await this.props.deleteTaxCustomerCategoryAction(id);
    this.setState({delete: false});
  };
  handledialog = (id) => {
    this.setState({delete: true, id: id});
  };
  handleClose = (id) => {
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
      await this.props.updateTaxCustomerCategoryAction(data.id, data);
      await this.setState({open: false});
    } else {
      await this.props.createTaxCustomerCategoryAction(data);
      await this.setState({open: false});
    }
  };

  render() {
    const filteredCol = taxCustomerCategory_col.length
      ? taxCustomerCategory_col.map((d) => ({title: d, field: d}))
      : this.props.taxcustomercategory[0]
      ? Object.keys(this.props.taxcustomercategory[0]).map((o) => ({
          title: o,
          field: o,
        }))
      : [];

    return (
      <Layout>
        <AlertDialog
          delete={this.state.delete}
          handleClose={this.handleClose}
          handleDelete={this.handleDelete}
          id={this.state.id}
        />
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
                  this.setState({edit_id_data: [], open: true}),
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
                    ExportPdf(cols, datas, 'TaxCustomerCategoryData'),
                },
                {
                  label: 'Export CSV',
                  exportFunc: (cols, datas) =>
                    ExportCsv(cols, datas, 'TaxCustomerCategoryData'),
                },
              ],
            }}
            // columns={
            //   this.props.taxcustomercategory ? this.props.taxcustomercategory.map((t) =>
            //     Object.keys(t).map((o) => { return { title: o, field: o }
            //   }))[0] : []
            // }
            columns={filteredCol}
            data={
              this.props.taxcustomercategory
                ? this.props.taxcustomercategory
                    .slice(0, this.props.pageSize)
                    .map((r) => {
                      const {tableData, ...record} = r;
                      return record;
                    })
                : []
            }
            title={<Typography variant='h6'>TaxCustomerCategory</Typography>}
          />
        )}
        {this.state.open && (
          <NewTaxCustomerCategory
            edit_id_data={this.state.edit_id_data}
            handleClose={this.handleClose}
            handleSubmit={this.handleSubmit}
          />
        )}
        {/* <Snackbar open={this.state.dialog.open} autoHideDuration={4000} onClose={this.handleClose} anchorOrigin = {{ vertical: 'top', horizontal: 'right' }} >
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
    taxcustomercategory:
      state.taxCustomerCategoryReducer.taxcustomercategory || [],
    taxcustomercategory_id_data:
      state.taxCustomerCategoryReducer.taxcustomercategory_id_data || [],
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listTaxCustomerCategoryAction: () => {
      dispatch(listTaxCustomerCategoryAction());
    },
    createTaxCustomerCategoryAction: (data) => {
      dispatch(createTaxCustomerCategoryAction(data));
    },
    getbyidTaxCustomerCategoryAction: (id) => {
      dispatch(getbyidTaxCustomerCategoryAction(id));
    },
    updateTaxCustomerCategoryAction: (id, data) => {
      dispatch(updateTaxCustomerCategoryAction(id, data));
    },
    deleteTaxCustomerCategoryAction: (id) => {
      dispatch(deleteTaxCustomerCategoryAction(id));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TaxCustomerCategory);

