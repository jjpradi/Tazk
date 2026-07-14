import React, {Component} from 'react';
//import NewCustomer from '../../components/Customer';
import {connect} from 'react-redux';
import MaterialTable from 'utils/SafeMaterialTable';
// import _ from 'lodash';
import Ledger from '../../../components/Ledger';
import {
  listLedgerAction,
  createLedgerAction,
  updateLedgerAction,
  getbyidLedgerAction,
  deleteLedgerAction,
  listLedgerParentGroupAction,
} from '../../../redux/actions/ledger_actions';
import {listStockLedgerAction} from '../../../redux/actions/stock_Ledger_actions';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import { Typography } from '@mui/material';
import apiCalls from 'utils/apiCalls';
import { maxBodyHeight, headerStyle, cellStyle } from 'utils/pageSize';

class LedgerCreation extends Component {
  static contextType = CreateNewButtonContext;
  Ledger;
  constructor(props) {
    super(props);
    this.state = {
      ledger_data: [],
      open: false,
      edit_id_data: [],
      dialog: {open: false, msg: '', severity: ''},
      delete: false,
      id: '',
      status: '',
    };
  }

  // async testing() {
  //   const context = this.context;
  //  await this.props.listStockLedgerAction( context.setModalTypeHandler, context.setLoaderStatusHandler)
  //   await this.setState({ open: false })
  // }

  async componentDidMount() {
    const context = this.context;

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listLedgerAction(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      ),
      this.props.listLedgerParentGroupAction(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      ),
      this.props.listStockLedgerAction(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      ),
	  );
    //  await this.props.updateLedgerAction( context.setModalTypeHandler, context.setLoaderStatusHandler)
    await this.setState({ledger_data: this.props.ledger_parent_group_list});
  }

  // handleEdit = async (id) => {
  //   if (_.isEmpty(id)) {
  //     let getId = await this.props.ledger_list.map((m) => {
  //       return m.id === id ? m : null
  //     }).filter((f) => f !== null)
  //     await this.setState({ edit_id_data: getId, open: true })
  //   }

  // }

  handleEdit = async (id) => {
    const context = this.context;
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.getbyidLedgerAction(id)
	  );
    this.setState({open: true, status: 'edit'});
  };

  handleDelete = async (id) => {
    const context = this.context;
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.deleteLedgerAction(
        id,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      )
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
        this.props.updateLedgerAction(
          data.id,
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        )
      );
      await this.setState({open: false});
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
          {current_seq},
        )
      );
      await this.setState({open: false});
      // await this.setState({ ledger_data: this.props.ledger_list })
    }
  };

  render() {
    return (
      <React.Fragment>
        <AlertDialog
          // style={{
          //   width: this.context.drawerOpen
          //     ? 'calc(100vw - 325px)'
          //     : 'calc(100vw - 143px)',
          // }}
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
                    ExportPdf(cols, datas, 'LedgerListData'),
                },
                {
                  label: 'Export CSV',
                  exportFunc: (cols, datas) =>
                    ExportCsv(cols, datas, 'LedgerListData'),
                },
              ],
            }}
            columns={[{title: 'LedgerName', field: 'name'}]}
            data={
              this.props.ledger_list
                ? this.props.ledger_list
                    .slice(0, this.props.pageSize)
                    .map((r) => {
                      const {tableData, ...record} = r;
                      return record;
                    })
                : []
            }
            title={<Typography variant='h6'>LedgerList</Typography>}
          />
        )}
        {this.state.open && (
          <Ledger
            status={this.state.status}
            edit_id_data={this.props.ledger_id_data}
            handleClose={this.handleClose}
            handleSubmit={this.handleSubmit}
            {...this.props}
            type='LedgerList'
          />
        )}
        {/* <NewPaymentMethod status={this.state.status} edit_id_data={this.props.paymentMethod_id_data} handleClose={this.handleClose} handleSubmit={this.handleSubmit} type = 'paymentMethod' setModalStatusHandler={setModalStatusHandler} setModalTypeHandler={setModalTypeHandler}/> */}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    ledger_list: state.ledgerReducer.ledger_list || [],
    ledger_parent_group_list:
      state.ledgerReducer.ledger_parent_group_list || [],
    ledger_id_data: state.ledgerReducer.ledger_id_data || [],
    stock_ledger_list: state.stockLedgerReducer.stock_ledger_list || [],
    all_parent_ledger : state.ledgerReducer.all_parent_ledger || []
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listLedgerAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(listLedgerAction(setModalTypeHandler, setLoaderStatusHandler));
    },
    listLedgerParentGroupAction: (
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        listLedgerParentGroupAction(
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    listStockLedgerAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(
        listStockLedgerAction(setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    getbyidLedgerAction: (id) => {
      return dispatch(getbyidLedgerAction(id));
    },
    createLedgerAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      id,
      current_seq,
    ) => {
      return dispatch(
        createLedgerAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          id,
          current_seq,
        ),
      );
    },
    updateLedgerAction: (
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        updateLedgerAction(
          id,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    deleteLedgerAction: (id, setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(
        deleteLedgerAction(id, setModalTypeHandler, setLoaderStatusHandler),
      );
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LedgerCreation);

