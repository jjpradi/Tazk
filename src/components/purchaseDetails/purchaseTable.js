import React, {Component} from 'react';
import {connect} from 'react-redux';
import MaterialTable from 'utils/SafeMaterialTable';
import {getbyidPurchaseTableAction} from '../../redux/actions/purchaseTable_actions';
import AlertDialog from '../../pages/common/Dialog';
import CreateNewButtonContext from '../../context/CreateNewButtonContext';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import { Card, Dialog, DialogContent, DialogTitle, Grid, IconButton, TextField, Typography } from '@mui/material';
import set from 'date-fns/esm/set/index';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LotDialog from './lotDialog';
import apiCalls from 'utils/apiCalls';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle,font14_500 } from 'utils/pageSize';
import { commonDateFormat } from 'utils/getTimeFormat';
import CloseIcon from '@mui/icons-material/Close';


class PurchaseTable extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.state = {
      purchaseTable_data: [],
      open: false,
      edit_id_data: [],
      dialog: {open: false, msg: '', severity: ''},
      status: '',
      delete: false,
      id: '',
      lotDialog: false,
      currentLots: []
    };
  }

  async componentDidMount() {
    const context = this.context;

    // if(this.props.item_id){
    //   apiCalls(
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //     this.props.getbyidPurchaseTableAction(this.props.item_id)
    //   );
    // }
    

    // if(this.props.setModalStatusHandler)
    this.setState({open: true});
  }

  // handleEdit = async (id) => {
  //   await this.props.getbyidStockLocationAction(id)
  //   this.setState({ open: true, status: 'edit' })
  // }

  // handleDelete = async (id) => {
  //   const context = this.context;
  //   await this.props.deleteStockLocationAction(id,context.setModalTypeHandler,context.setLoaderStatusHandler)
  //   this.setState({delete:false})
  // }

  handledialog = (id) => {
    this.setState({delete: true, id: id});
  };

  handleClose = (id) => {
    if (this.props.setModalStatusHandler) {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('stockLocation', false);
    }
    this.setState({open: false, dialog: false, delete: false});
  };
  responseDialog = async (res, resSeverity) => {
    if (this.props.setModalStatusHandler && res === 'Created SuccessFully') {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('stockLocation', true);
    }
    await this.setState({
      ...this.state.dialog,
      dialog: {msg: res, severity: resSeverity, open: true},
    });
  };

  // sample = (value)=>{
  //   this.setState({open:value})
  //   if (this.props.setModalStatusHandler) {
  //     this.props.setModalStatusHandler(false)
  //     this.props.setselectData('stocklocation', true)
  //   }
  // }

  // handleSubmit = async (data) => {
  //   const context = this.context;
  //   if (data.location_id) {
  //     await this.props.updateStockLocationAction(data.location_id, data,context.setModalTypeHandler,context.setLoaderStatusHandler,this.sample)
  //   } else {
  //      await this.props.createStockLocationAction(data,context.setModalTypeHandler,context.setLoaderStatusHandler,this.sample)
  //   }
  // }

  handleLotOpen = (rowData) => {
    this.setState({lotDialog: true, currentLots: rowData.lots});
  }

  handleLotClose = () => {
    this.setState({lotDialog: false, currentLots: [] });
  }

  render() {
    return (
      <>
        <CreateNewButtonContext.Consumer>
          {({setModalStatusHandler, setModalTypeHandler, drawerOpen}) => (
            <div>
              <AlertDialog
                delete={this.state.delete}
                handleClose={this.handleClose}
                handleDelete={this.handleDelete}
                id={this.state.id}
              />
              {this.state.open === true && (
                <Card sx={{ borderTop: '1px solid #d3d3d3', borderLeft : '1px solid #d3d3d3', borderRight : '1px solid #d3d3d3'}}>
                <MaterialTable
                  // actions={[
                  //   {
                  //     icon: 'edit',
                  //     tooltip: 'edit',
                  //     position: 'row',
                  //     onClick: (event, rowData) => this.handleEdit(rowData.location_id)
                  //   },
                  // {
                  //   icon: 'delete',
                  //   tooltip: 'Delete',
                  //   onClick: (event, rowData) => this.handledialog(rowData.location_id)
                  // },
                  // {
                  //   icon: 'add',
                  //   tooltip: 'add',
                  //   isFreeAction: true,
                  //   onClick: (event, rowData) => this.setState({ edit_id_data: [], open: true,status:'create' })
                  // }
                  // ]}

                  options={{
                    headerStyle,
                    cellStyle,
                    exportButton: true,
                    filtering: false,
                    actionsColumnIndex: -1,
                    pageSize: 5,
                    search : false,
                    exportMenu: [
                      {
                        label: 'Export PDF',
                        exportFunc: (cols, datas) =>
                          ExportPdf(cols, datas, 'PurchaseTable'),
                      },
                      {
                        label: 'Export CSV',
                        exportFunc: (cols, datas) =>
                          ExportCsv(cols, datas, 'PurchaseTable'),
                      },
                    ],
                    // pageSizeOptions:[20, 50, 100],
                  }}
                  columns={[
                    {
                      field: 'po_number',
                      title: 'Invoice',
                    },
                    {
                      field: 'company_name',
                      title: 'Vendor',
                    },
                    {
                      field: 'ordered_quantity',
                      title: 'Ordered Quantity',
                    },
                    {
                      field: 'received_quantity',
                      title: 'Received Qty',
                      render: (rowData) => {
                        if(rowData.is_serialized === 1){
                          return(
                            <div
                              style={{cursor: 'pointer', textDecoration: 'underline'}}
                              onClick={() => this.handleLotOpen(rowData)}
                            >
                              {rowData.received_quantity}
                            </div>
                          )
                        }
                        else{
                          return(
                            <div>
                              {rowData.received_quantity}
                            </div>
                          )
                        }
                      }
                    },

                    // {
                    //   field: 'lot_number',
                    //   title: 'Lot Number',
                      // render: (rowData) => {
                      //   return (
                      //     <>
                      //       <IconButton
                      //         onClick={() => this.handleLotOpen(rowData)}
                      //       >
                      //         <AssignmentIcon />
                      //       </IconButton>
                      //       <LotDialog
                      //         lotDialog={this.state.lotDialog}
                      //         handleLotClose={this.handleLotClose}
                      //         tableData={this.props.purchaseTable_id_data}
                      //       />
                      //     </>
                      //   );
                      // },
                    // },
                   
                    {
                      field: 'item_cost_price',
                      title: 'Cost Price',
                      render: (rowData) => (
                        <div
                          style={{
                            textAlign: 'right',
                            minWidth: '60px',
                            maxWidth: '80px',
                            width: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {rowData.item_cost_price}
                        </div>
                      )
                    },
                    // {
                    //   field: 'receiving_time',
                    //   title: 'Start Date',
                    //   render: (r) => (
                    //     commonDateFormat(r.receiving_time)
                    //   )
                    // },
                    // {
                    //   field: 'sale_time',
                    //   title: 'End Date',
                    //   render: (r) => (
                    //     commonDateFormat(r.sale_time)
                    //   )
                    // },
                    // {
                    //   field: 'trans_inventory',
                    //   title: 'Available Qty',
                    // },
                  ]}
                  data={
                    this.props.purchaseTable_id_data
                      ? this.props.purchaseTable_id_data
                          .slice(0, this.props.pageSize)
                          .map((r, i) => {
                            const {tableData, ...record} = r;
                            return {i, ...record};
                          })
                      : []
                  }
                  title={
                    <Typography variant='h6'>Purchase Table</Typography>
                  }
                />
                </Card>
              )}
              {/* {this.state.open && <NewStockLocation status={this.state.status} edit_id_data={this.props.stocklocation_id_data} handleClose={this.handleClose} handleSubmit={this.handleSubmit} {...this.props} type='stockLocation' setModalStatusHandler={setModalStatusHandler} setModalTypeHandler={setModalTypeHandler} />} */}

              <Dialog open={this.state.lotDialog} onClose={() => this.handleLotClose()} maxWidth='md' fullWidth>
                <DialogTitle>
                  <Grid container spacing={2} display='flex' justifyContent='space-between'>
                    <Grid>
                      <Typography variant='h6'>Serial Number</Typography>
                    </Grid>

                    <Grid>
                      <IconButton onClick={() => this.handleLotClose()}>
                        <CloseIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </DialogTitle>

                <DialogContent>
                  <Grid container spacing={4}>
                    {
                      this.state.currentLots.map((lot, index) => (
                        <Grid
                          key={index}
                          size={{
                            xs: 4,
                            sm: 3,
                            md: 3,
                            lg: 3
                          }}>
                          <TextField
                            value={lot.lot_number}
                            size='small'
                            disabled
                          />
                        </Grid>
                      ))
                    }
                  </Grid>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CreateNewButtonContext.Consumer>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    purchaseTable: state.purchaseTableReducer.purchaseTable || [],
    purchaseTable_id_data:
      state.purchaseTableReducer.purchaseTable_id_data || [],
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    getbyidPurchaseTableAction: (id) => {
      return dispatch(getbyidPurchaseTableAction(id));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PurchaseTable);

