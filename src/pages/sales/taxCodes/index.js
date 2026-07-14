import React, {Component} from 'react';
import {connect} from 'react-redux';
import MaterialTable from 'utils/SafeMaterialTable';
import _ from 'lodash';
import NewTaxCode from '../../../components/NewTaxCode';
import {
  listTaxCodesAction,
  updateTaxCodesAction,
  getbyidTaxCodesAction,
  deleteTaxCodesAction,
  createTaxCodesAction,
} from '../../../redux/actions/taxcodes_actions';
import AlertDialog from '../../common/Dialog';
import {Button, Grid, Typography} from '@mui/material';
// import theme from '../../theme';
// import {ThemeProvider} from '@mui/material/styles';
import {ExportCsv, ExportPdf} from '@material-table/exporters';

class TaxCodes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tax_code_data: [],
      open: false,
      edit_id_data: [],
      dialog: {open: false, msg: '', severity: ''},
      loader: false,
      delete: false,
      id: '',
      status: '',
    };
  }

  async componentDidMount() {
    await this.props.listTaxCodesAction();
    if (this.props.setModalStatusHandler) this.setState({open: true});

    //await this.setState({tax_category_data:this.props.taxcategory})
  }

  handleEdit = async (id) => {
    if (_.isEmpty(id)) {
      let getId = await this.props.taxcodes.filter((m) => {
        return m.tax_code_id === id;
      });
      // let rem = getId.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      await this.setState({edit_id_data: getId, open: true, status: 'edit'});
    }
  };

  handleDelete = async (id) => {
    await this.props.deleteTaxCodesAction(id, this.props.setModalStatusHandler);
    this.setState({delete: false});

    // await this.getData()
  };
  handledialog = (id) => {
    this.setState({delete: true, id: id});
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
  handleLoader = () => {
    this.setState({loader: true});
    setTimeout(() => this.setState({loader: false, open: false}), 3000);
  };
  responseDialog = async (res, resSeverity) => {
    await this.setState({
      ...this.state.dialog,
      dialog: {msg: res, severity: resSeverity, open: true},
    });
  };

  handleSubmit = async (data) => {
    if (data.tax_code_id) {
      await this.props.updateTaxCodesAction(
        data.tax_code_id,
        data,
        this.props.setModalStatusHandler,
        this.props.setselectData,
      );
      //  await this.setState({ open: false})
    } else {
      await this.props.createTaxCodesAction(
        data,
        this.props.setModalStatusHandler,
        this.props.setselectData,
      );
      // await this.setState({ open: false})
    }
  };

  render() {
    // const {taxcategory,taxcategory_id_data} = this.props

    // const filteredCol = taxCodes_col.length ? taxCodes_col.map((d) => ({ title: d, field: d }))
    // : this.props.taxcodes[0] ?
    // Object.keys(this.props.taxcodes[0]).map((o) => ({ title: o, field: o })) : []
    return (
      <>
        {/* <Layout> */}
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
                onClick: (event, rowData) =>
                  this.handleEdit(rowData.tax_code_id),
              },
              {
                icon: 'delete',
                tooltip: 'Delete',
                onClick: (event, rowData) =>
                  this.handledialog(rowData.tax_code_id),
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
                // onClick: (event, rowData) => this.setState({ open: true,edit_id_data:[] })
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
                    ExportPdf(cols, datas, 'TaxCodesData'),
                },
                {
                  label: 'Export CSV',
                  exportFunc: (cols, datas) =>
                    ExportCsv(cols, datas, 'TaxCodesData'),
                },
              ],
            }}
            // columns={
            //   this.props.taxcategory ? this.props.taxcategory.map((t) =>
            //     Object.keys(t).map((o) => { return { title: o, field: o }
            //   }))[0] : []
            // }
            // columns={filteredCol}
            columns={[
              {
                field: 'tax_code',
                title: 'Tax Code',
              },
              {
                field: 'tax_code_name',
                title: 'Tax Code Name',
              },
              {
                field: 'city',
                title: 'City',
              },
              {
                field: 'state',
                title: 'State',
              },
            ]}
            data={
              this.props.taxcodes
                ? this.props.taxcodes.slice(0, this.props.pageSize).map((r) => {
                    const {tableData, ...record} = r;
                    return record;
                  })
                : []
            }
            title={<Typography variant='h6'>TaxCodes</Typography>}
          />
        )}
        {this.state.open && (
          <NewTaxCode
            edit_id_data={this.state.edit_id_data}
            type='taxcodes'
            status={this.state.status}
            handleDelete={this.handleDelete}
            handleClose={this.handleClose}
            handleSubmit={this.handleSubmit}
            {...this.props}
          />
        )}
        {/* {this.state.loader && <CircularProgress variant ='indeterminate'/>} */}
        {/* <Snackbar open={this.state.dialog.open} autoHideDuration={5000} anchorOrigin = {{ vertical: 'top', horizontal: 'right' }} onClose={this.handleClose}>
        <Alert onClose={this.handleClose} severity={this.state.dialog.severity} variant="filled">
          {this.state.dialog.msg}
        </Alert> 
       </Snackbar><br/> */}
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
    taxcodes: state.taxCodeReducer.taxcodes,
    taxcodes_id_data: state.taxCodeReducer.taxcodes_id_data,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listTaxCodesAction: () => {
      dispatch(listTaxCodesAction());
    },
    createTaxCodesAction: (data, setModalStatusHandler, setselectData) => {
      dispatch(
        createTaxCodesAction(data, setModalStatusHandler, setselectData),
      );
    },
    getbyidTaxCodesAction: (id) => {
      dispatch(getbyidTaxCodesAction(id));
    },
    updateTaxCodesAction: (id, data, setModalStatusHandler, setselectData) => {
      dispatch(
        updateTaxCodesAction(id, data, setModalStatusHandler, setselectData),
      );
    },
    deleteTaxCodesAction: (id, setModalStatusHandler) => {
      dispatch(deleteTaxCodesAction(id, setModalStatusHandler));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TaxCodes);

