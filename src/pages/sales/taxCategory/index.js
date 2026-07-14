import React, {Component} from 'react';
import {connect} from 'react-redux';
// import MaterialTable from 'utils/SafeMaterialTable';
import NewTaxCategory from '../../../components/NewTaxCategory';
import {
  listTaxCategoryAction,
  updateTaxCategoryAction,
  getbyidTaxCategoryAction,
  deleteTaxCategoryAction,
  createTaxCategoryAction,
} from '../../../redux/actions/tax_Category_actions';
// import AlertDialog from '../common/Dialog'
import {Button, Grid} from '@mui/material';
// import theme from '../../theme';
import {ThemeProvider} from '@mui/material/styles';

class TaxCategory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tax_category_data: [],
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
    await this.props.listTaxCategoryAction();
    if (this.props.setModalStatusHandler)
      //table view in form
      this.setState({open: true});

    //await this.setState({tax_category_data:this.props.taxcategory})
  }

  handleEdit = async (id) => {
    await this.props.getbyidTaxCategoryAction(id);
    this.setState({open: true, status: 'edit'});
    // if (_.isEmpty(id)) {
    //   let getId = await this.props.taxcategory.filter((m) => {
    //     return m.tax_category_id === id
    //   })
    //   await this.setState({edit_id_data:getId,open:true,status:'edit'})
    // }
  };

  handleDelete = async (id) => {
    await this.props.deleteTaxCategoryAction(
      id,
      this.props.setModalStatusHandler,
    );
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
    if (data.tax_category_id) {
      await this.props.updateTaxCategoryAction(
        data.tax_category_id,
        data,
        this.props.setModalStatusHandler,
        this.props.setselectData,
      );
      //  await this.setState({ open: false})
    } else {
      await this.props.createTaxCategoryAction(
        data,
        this.props.setModalStatusHandler,
        this.props.setselectData,
      );
      // await this.setState({ open: false})
    }
    // if(this.props.setModalStatusHandler) //table view in form
    // this.setState({open:true})
  };

  render() {
    // const {taxcategory,taxcategory_id_data} = this.props

    // const filteredCol = taxCategory_col.length ? taxCategory_col.map((d) => ({ title: d, field: d }))
    // : this.props.taxcategory[0] ?
    // Object.keys(this.props.taxcategory[0]).map((o) => ({ title: o, field: o })) : []
    return (
      <>
        {/* <Layout> */}
        {/* <AlertDialog delete={this.state.delete} handleClose={this.handleClose} handleDelete={this.handleDelete} id={this.state.id} ></AlertDialog>
      { this.state.open === false&&<MaterialTable
          actions={[
            {
              icon: 'edit',
              tooltip: 'edit',
              position: 'row',
              onClick: (event, rowData) => this.handleEdit(rowData.tax_category_id)
            },
            {
              icon: 'delete',
              tooltip: 'Delete',
              onClick: (event, rowData) => this.handledialog(rowData.tax_category_id)
            },
            {
              icon: 'add',
              tooltip: 'add',
              isFreeAction: true,
              onClick: (event, rowData) => this.setState({edit_id_data:[], open: true, status: 'create' })
              // onClick: (event, rowData) => this.setState({ open: true,edit_id_data:[] })
            }
          ]}

          options={{
            // fixedColumns: {
            //   left: 2,
            //   right: 0
            // },
            exportButton: true,
            filtering: false,
            actionsColumnIndex: -1,
            maxBodyHeight: '68vh',
            pageSize:20,
            pageSizeOptions:[20, 50, 100],
          }}
          // columns={
          //   this.props.taxcategory ? this.props.taxcategory.map((t) => 
          //     Object.keys(t).map((o) => { return { title: o, field: o } 
          //   }))[0] : []
          // }
          // columns={filteredCol}
          columns = {[
            {
              field:'tax_category',
              title:'Tax Category',
            },
            {
              field:'tax_group_sequence',
              title:'Tax Group Sequence',
            },
          ]}
          data={
            this.props.taxcategory ? this.props.taxcategory.slice( 0 , this.props.pageSize).map(r => {
              const {tableData, ...record} = r;
              return record;
            }) : []
          }
          title="TaxCategory"
        />} */}
        {/* {this.state.open 
        &&<NewTaxCategory edit_id_data={this.props.taxcategory_id_data} type='taxcategory' status={this.state.status} handleClose ={this.handleClose} handleSubmit = {this.handleSubmit} handleDelete = {this.handleDelete} handledialog = {this.handledialog} {...this.props} />} */}
        <NewTaxCategory
          open={this.props.taxCategoryOpen}
          handleClose={this.handleClose}
          handleSubmit={this.handleSubmit}
          handleDelete={this.handleDelete}
          handledialog={this.handledialog}
          {...this.props}
        />
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
    taxcategory: state.taxCategoryReducer.taxcategory,
    taxcategory_id_data: state.taxCategoryReducer.taxcategory_id_data,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listTaxCategoryAction: () => {
      dispatch(listTaxCategoryAction());
    },
    createTaxCategoryAction: (data, setModalStatusHandler, setselectData) => {
      dispatch(
        createTaxCategoryAction(data, setModalStatusHandler, setselectData),
      );
    },
    getbyidTaxCategoryAction: (id) => {
      dispatch(getbyidTaxCategoryAction(id));
    },
    updateTaxCategoryAction: (
      id,
      data,
      setModalStatusHandler,
      setselectData,
    ) => {
      dispatch(
        updateTaxCategoryAction(id, data, setModalStatusHandler, setselectData),
      );
    },
    deleteTaxCategoryAction: (id, setModalStatusHandler) => {
      dispatch(deleteTaxCategoryAction(id, setModalStatusHandler));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TaxCategory);

