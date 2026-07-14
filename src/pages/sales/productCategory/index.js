import React, {Component} from 'react';
//import NewCustomer from '../../../components/Customer';
import {connect} from 'react-redux';
import Layout from '../../../components/Layout/index';
import MaterialTable from 'utils/SafeMaterialTable';
import _ from 'lodash';
import NewProductCategory from '../../../components/NewProductCategory';
import {
  listProductCategoryAction,
  updateProductCategoryAction,
  getbyidProductCategoryAction,
  deleteProductCategoryAction,
  createProductCategoryAction,
} from '../../../redux/actions/product_Category_actions';
import AlertDialog from '../../common/Dialog';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import { Typography } from '@mui/material';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';

class ProductCategory extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.state = {
      product_category_data: [],
      open: false,
      edit_id_data: [],
      dialog: {open: false, msg: '', severity: ''},
      delete: false,
      id: '',
    };
  }

  async componentDidMount() {
    const context = this.context;
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listProductCategoryAction()
	  );
    await this.setState({product_category_data: this.props.productcategory});
  }

  handleEdit = async (id) => {
    if (_.isEmpty(id)) {
      let getId = await this.props.productcategory
        .map((m) => {
          return m.id === id ? m : null;
        })
        .filter((f) => f !== null);
      await this.setState({edit_id_data: getId, open: true});
    }
  };
  handleDelete = async (id) => {
    const context = this.context;
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.deleteProductCategoryAction(id)
	  );
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
    const context = this.context;
    if (data.id) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.updateProductCategoryAction(data.id, data)
      );
      
      await this.setState({open: false});
    } else {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.createProductCategoryAction(data)
      );
      await this.setState({open: false});
    }
  };

  render() {
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
                    ExportPdf(cols, datas, 'ProductCategory'),
                },
                {
                  label: 'Export CSV',
                  exportFunc: (cols, datas) =>
                    ExportCsv(cols, datas, 'ProductCategory'),
                },
              ],
            }}
            columns={
              this.props.productcategory
                ? this.props.productcategory.map((t) =>
                    Object.keys(t).map((o) => {
                      return {title: o, field: o};
                    }),
                  )[0]
                : []
            }
            data={
              this.props.productcategory
                ? this.props.productcategory
                    .slice(0, this.props.pageSize)
                    .map((r) => {
                      const {tableData, ...record} = r;
                      return record;
                    })
                : []
            }
            title={<Typography variant='h6'>ProductCategory</Typography>}
          />
        )}
        {this.state.open && (
          <NewProductCategory
            productcategory={this.props.productcategory}
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
    productcategory: state.productCategoryReducer.productcategory || [],
    productcategory_id_data:
      state.productCategoryReducer.productcategory_id_data || [],
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listProductCategoryAction: () => {
      return dispatch(listProductCategoryAction());
    },
    createProductCategoryAction: (data) => {
      return dispatch(createProductCategoryAction(data));
    },
    getbyidProductCategoryAction: (id) => {
      dispatch(getbyidProductCategoryAction(id));
    },
    updateProductCategoryAction: (id, data) => {
      return dispatch(updateProductCategoryAction(id, data));
    },
    deleteProductCategoryAction: (id) => {
      return dispatch(deleteProductCategoryAction(id));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductCategory);

