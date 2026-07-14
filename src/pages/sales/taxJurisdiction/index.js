import React, {Component} from 'react';
//import NewCustomer from '../../../components/Customer';
import {connect} from 'react-redux';
import NewTaxJurisdiction from '../../../components/NewTaxJurisdiction';
import MaterialTable from 'utils/SafeMaterialTable';
import {
  listTaxJurisdictionAction,
  updateTaxJurisdictionAction,
  getbyidTaxJurisdictionAction,
  deleteTaxJurisdictionAction,
  createTaxJurisdictionAction,
} from '../../../redux/actions/tax_Jurisdiction_actions';
import AlertDialog from '../../common/Dialog';
import {Button, Grid, Typography} from '@mui/material';
// import theme from '../../theme';
// import {ThemeProvider} from '@mui/material/styles';
import {ExportCsv, ExportPdf} from '@material-table/exporters';

class TaxJurisdiction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      taxjurisdiction_data: [],
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
    await this.props.listTaxJurisdictionAction();
    // await this.setState({taxjurisdiction_data:this.props.taxjurisdiction})
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
    await this.props.getbyidTaxJurisdictionAction(id);
    this.setState({open: true, status: 'edit'});
  };

  handleDelete = async (id) => {
    await this.props.deleteTaxJurisdictionAction(
      id,
      this.props.setModalStatusHandler,
    );
    this.setState({delete: false});
  };
  handledialog = (id) => {
    this.setState({delete: true, id: id});
  };
  responseDialog = (res, resSeverity) => {
    this.setState({
      ...this.state.dialog,
      dialog: {msg: res, severity: resSeverity, open: true},
      open: false,
    });
  };

  handleClose = () => {
    if (this.props.setModalStatusHandler) {
      this.props.setModalStatusHandler(false);
      this.props.setselectData(false);
    }
    setTimeout(() => {
      this.setState({open: false, dialog: false, delete: false});
    }, 0);
  };
  handleSubmit = async (data) => {
    if (data.jurisdiction_id) {
      await this.props.updateTaxJurisdictionAction(
        data.jurisdiction_id,
        data,
        this.props.setModalStatusHandler,
        this.props.setselectData,
      );
      //  await this.setState({ open: false})
    } else {
      await this.props.createTaxJurisdictionAction(
        data,
        this.props.setModalStatusHandler,
        this.props.setselectData,
      );
      // await this.setState({ open: false})
    }
  };

  render() {
    // const filteredCol = taxjurisdiction_col.length ? taxjurisdiction_col.map((d) => ({ title: d, field: d }))
    //     : this.props.taxjurisdiction[0] ?
    //     Object.keys(this.props.taxjurisdiction[0]).map((o) => ({ title: o, field: o })) : []

    return (
      <>
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
                  this.handleEdit(rowData.jurisdiction_id),
              },
              {
                icon: 'delete',
                tooltip: 'Delete',
                onClick: (event, rowData) =>
                  this.handledialog(rowData.jurisdiction_id),
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
                    ExportPdf(cols, datas, 'TaxJurisdictionData'),
                },
                {
                  label: 'Export CSV',
                  exportFunc: (cols, datas) =>
                    ExportCsv(cols, datas, 'TaxJurisdictionData'),
                },
              ],
            }}
            // columns={
            //   this.props.customer ? this.props.customer.map((t) =>
            //     Object.keys(t).map((o) => { return { title: o, field: o }
            //   }))[0] : []
            // }
            // columns={filteredCol}
            columns={[
              {
                field: 'jurisdiction_name',
                title: 'Jurisdiction Name',
              },
              {
                field: 'tax_group',
                title: 'Tax Group',
              },
              {
                field: 'tax_type',
                title: 'Tax Type',
              },
              {
                field: 'reporting_authority',
                title: 'Reporting Authority',
              },
              {
                field: 'tax_group_sequence',
                title: 'Tax Group Sequence',
              },
            ]}
            data={
              this.props.taxjurisdiction
                ? this.props.taxjurisdiction
                    .slice(0, this.props.pageSize)
                    .map((r) => {
                      const {tableData, ...record} = r;
                      return record;
                    })
                : []
            }
            title={<Typography variant='h6'>TaxJurisdiction</Typography>}
          />
        )}
        {this.state.open === true && (
          <NewTaxJurisdiction
            edit_id_data={this.props.taxjurisdiction_id_data}
            type='taxjurisdiction'
            status={this.state.status}
            handleClose={this.handleClose}
            handleDelete={this.handleDelete}
            handleSubmit={this.handleSubmit}
            handledialog={this.handledialog}
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
        <br />
        {/* <ThemeProvider theme={theme}> */}
        {this.state.open ? (
          ''
        ) : (
          <Grid
            size={{
              lg: 3,
              md: 4,
              sm: 6,
              xs: 12
            }}>
            <Button
              onClick={() => this.handleClose()}
              style={{}}
              name='CANCEL'
              variant='contained'
              color='secondary'
              size='medium'
              text='button'
              fullWidth={false}
              type='cancel'
            >
              CANCEL
            </Button>
          </Grid>
        )}
        {/* </ThemeProvider> */}
        {/* </Layout> */}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    taxjurisdiction: state.taxjurisdictionReducer.taxjurisdiction,
    taxjurisdiction_id_data:
      state.taxjurisdictionReducer.taxjurisdiction_id_data,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listTaxJurisdictionAction: () => {
      dispatch(listTaxJurisdictionAction());
    },
    createTaxJurisdictionAction: (
      data,
      setModalStatusHandler,
      setselectData,
    ) => {
      dispatch(
        createTaxJurisdictionAction(data, setModalStatusHandler, setselectData),
      );
    },
    getbyidTaxJurisdictionAction: (id) => {
      dispatch(getbyidTaxJurisdictionAction(id));
    },
    updateTaxJurisdictionAction: (
      id,
      data,
      setModalStatusHandler,
      setselectData,
    ) => {
      dispatch(
        updateTaxJurisdictionAction(
          id,
          data,
          setModalStatusHandler,
          setselectData,
        ),
      );
    },
    deleteTaxJurisdictionAction: (id, setModalStatusHandler) => {
      dispatch(deleteTaxJurisdictionAction(id, setModalStatusHandler));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TaxJurisdiction);

