import React, {Component} from 'react';
import {connect} from 'react-redux';
import MaterialTable from 'utils/SafeMaterialTable';
import _ from 'lodash';
import {listAccountsLedgerAction} from '../../../redux/actions/accountsLedger';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import { Typography } from '@mui/material';
import apiCalls from 'utils/apiCalls';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { headerStyle, cellStyle, maxBodyHeight } from 'utils/pageSize';


class AccountsLedger extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      _isMounted: false,
      dialog: {open: false, msg: '', severity: ''},
      
    };
  }


  async componentDidMount() {
    const context = this.context;
    this._isMounted = true;
    
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listAccountsLedgerAction()
    );
  }

  async componentWillUnmount() {
    this._isMounted = false;
  }

  responseDialog = (res, resSeverity) => {
    this.setState({
      dialog: {msg: res, severity: resSeverity, open: true},
      open: false,
    });
  };

  handleClose = () => {
    if (this.props.setModalStatusHandler) {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('customer', false);
    }
    setTimeout(() => {
      this.setState({open: false, dialog: false, delete: false});
    }, 0);
  };

  render() {
    return (
      <>
        
        {/* <Snackbar open={this.state.dialog.open} autoHideDuration={4000} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} onClose={this.handleClose}>
          <Alert onClose={this.handleClose} severity={this.state.dialog.severity} variant="filled">
            {this.state.dialog.msg}
          </Alert>
        </Snackbar> */}
        {this.state.open === false && (
          <MaterialTable
            options={{
              headerStyle,
              cellStyle,
              exportButton: true,
              filtering: false,
              actionsColumnIndex: -1,
              maxBodyHeight,
              pageSize: 20,
              pageSizeOptions: [20, 50, 100],
              exportMenu: [
                {
                  label: 'Export PDF',
                  exportFunc: (cols, datas) =>
                    ExportPdf(cols, datas, 'AccountsLedger'),
                },
                {
                  label: 'Export CSV',
                  exportFunc: (cols, datas) =>
                    ExportCsv(cols, datas, 'AccountsLedger'),
                },
              ],
            }}
            columns={[
              {
                field: 'entry_date',
                title: 'Entry Date',
              },
              {
                field: 'source_document',
                title: 'Source Document',
              },
              {
                field: 'code',
                title: 'Code',
              },
              {
                field: 'id',
                title: 'Id',
              },
              {
                field: 'transaction_id',
                title: 'Transaction Id',
              },
              {
                field: 'account_id',
                title: 'Account Id',
              },
              {
                field: 'debit',
                title: 'Debit',
              },
              {
                field: 'credit',
                title: 'Credit',
              },
              {
                field: 'account_balance',
                title: 'Account Balance',
              },
              {
                field: 'description',
                title: 'Description',
              },
            ]}
            data={
              this.props.accountsLedger
                ? this.props.accountsLedger
                    .slice(0, this.props.pageSize)
                    .map((r) => {
                      const {tableData, ...record} = r;
                      return record;
                    })
                : []
            }
            title={<Typography variant='h6'>Accounts Ledger</Typography>}
          />
        )}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    accountsLedger: state.accountsLedgerReducer.accountsLedger,
    accountsLedger_id_data: state.accountsLedgerReducer.accountsLedger_id_data,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listAccountsLedgerAction: () => {
      return dispatch(listAccountsLedgerAction());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AccountsLedger);

