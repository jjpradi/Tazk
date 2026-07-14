import React, {Component} from 'react';
//import NewCustomer from '../../components/Customer';
import {connect} from 'react-redux';
import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import NewCashOutIn from '../../components/NewCashOutIn';
import {listCustomerStatementAction} from '../../redux/actions/customer_actions';
import AlertDialog from '../../pages/common/Dialog';
import {TextField, Link, Button, Typography} from '@mui/material';
import moment from 'moment';
import CreateNewButtonContext from '../../context/CreateNewButtonContext';
import {Grid, IconButton} from '@mui/material';
import {getDateTime, getDateFormat} from '../../utils/getTimeFormat';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import CommonFilter from '../../components/pos/payment_section/CommonFilter';
import StatementReceipt from './statementReceipt';
import { maxBodyHeight, pageSize } from 'utils/pageSize';
import apiCalls from 'utils/apiCalls';

class PaymentReceipt extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    var date = new Date();
    var firstDay = date.getMonth() <= 2 ? new Date(date.getFullYear()-1, 3, 1) : new Date(date.getFullYear(), 3, 1);
    var lastDay = new Date();
    this.state = {
      paymentReceipt_data: [],
      open: false,
      edit_id_data: [],
      dialog: {open: false, msg: '', severity: ''},
      status: '',
      delete: false,
      id: '',
      from: firstDay,
      to: lastDay,
      closingBalance: '',
      data: [],
      errormsg: {
        from: '',
        to: '',
      },
      pgSize: '',
      openData: [],
      dataStore: [
        {date: '1-1-2022', details: 'Opening Balance'},
        {
          date: '4-1-2022',
          details: 'Axis Bank',
          accountType: 'Receipt',
          id: 575,
          credit: '31,197.63',
        },
        {
          date: '20-1-2022',
          details: 'Axis Bank',
          accountType: 'Receipt',
          id: 635,
          credit: '27,059.10',
        },
      ],
    };
  }

  async componentDidMount() {
    // const context = this.context;
    // await this.props.listPaymentReceiptAction(context.setModalTypeHandler,context.setLoaderStatusHandler)
    // await this.props.listPaymentReceiptAction(
    // await this.props.listPaymentReceiptdateAction(
    //   moment(this.state.from, "year", "month", "day").format("yyyy-MM-DD"),
    //   moment(this.state.to, "year", "month", "day").format("yyyy-MM-DD"),
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler
    // );
    // await this.props.listCustomerStatementAction(7397, '2022-05-01', '2022-05-11', context.setModalTypeHandler, context.setLoaderStatusHandler)

    // await this.setState({ edit_id_data: this.props.paymentReceipt });

    const context = this.context;
    const customer_id = this.props.customer_id;
    var date = new Date();
    // var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    // var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    let firstDay = date.getMonth() <= 2 ? new Date(date.getFullYear()-1, 3, 1) : new Date(date.getFullYear(), 3, 1);
    var lastDay = new Date();

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listCustomerStatementAction(
        customer_id,
        moment(firstDay, 'year', 'month', 'day').format('yyyy-MM-DD'),
        moment(lastDay, 'year', 'month', 'day').format('yyyy-MM-DD'),
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      )
	  );
    // if(this.props.Get_customer_statement.data.length > 0){
    //   this.setState({ data:this.props.Get_customer_statement.data})
    // }
    // if(this.props.Get_customer_statement.closingBalance.length >0){
    //   return this.setState({ closingBalance: this.props.Get_customer_statement.closingBalance[0].closingbalance })
    // }

  }

  componentDidUpdate (preProps, preState){
  }

  //   handleEdit = async (id) => {
  //     const context = this.context;
  //     await this.props.getbyidPaymentReceiptAction(id);
  //     // await this.props.updatePaymentReceiptStatusAction(id,context.setModalTypeHandler,context.setLoaderStatusHandler)
  //     // await this.props.listPaymentReceiptAction((moment(this.state.from ,'year','month','day')).format("yyyy-MM-DD"),(moment(this.state.to ,'year','month','day')).format("yyyy-MM-DD"),context.setModalTypeHandler,context.setLoaderStatusHandler)
  //     this.setState({ open: true, status: "edit" });
  //   };
  //   handleDelete = async (id) => {
  //     const context = this.context;
  //     await this.props.deletePaymentReceiptAction(
  //       id,
  //       context.setModalTypeHandler,
  //       context.setLoaderStatusHandler
  //     );
  //     this.setState({ delete: false });
  //     // await this.props.listPaymentReceiptAction(
  //     await this.props.listPaymentReceiptdateAction(
  //       moment(this.state.from, "year", "month", "day").format("yyyy-MM-DD"),
  //       moment(this.state.to, "year", "month", "day").format("yyyy-MM-DD"),
  //       context.setModalTypeHandler,
  //       context.setLoaderStatusHandler
  //     );
  //   };

  // closingBalance = () => {
  //   if(this.props.Get_customer_statement.closingBalance.length >0){
  //     return this.setState({ closingBalance: this.props.Get_customer_statement.closingBalance[0].closingbalance })
  //   }
  // }


  handledialog = async (id) => {
    const context = this.context;
    this.setState({delete: true, id: id});
    // await this.props.listPaymentReceiptAction((moment(this.state.from ,'year','month','day')).format("yyyy-MM-DD"),(moment(this.state.to ,'year','month','day')).format("yyyy-MM-DD"),context.setModalTypeHandler,context.setLoaderStatusHandler)
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

  sample = (value) => {
    this.setState({open: value});
  };

  handleSubmit = async (data) => {
    const context = this.context;
    if (data.id) {


      const dat = data;
      delete dat.id;
      delete dat.creationDate;
      delete dat.deleted;
      delete dat.status;
      delete dat.updatedAt;

      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.updatePaymentReceiptStatusAction(
          data.id,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.sample,
        ),
        this.props.createCashOutInAction(
          [dat],
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.sample,
        )
      );
      // await this.props.updatePaymentReceiptAction(data.id, data,context.setModalTypeHandler,context.setLoaderStatusHandler,this.sample)
      // await this.props.listPaymentReceiptAction((moment(this.state.from ,'year','month','day')).format("yyyy-MM-DD"),(moment(this.state.to ,'year','month','day')).format("yyyy-MM-DD"),context.setModalTypeHandler,context.setLoaderStatusHandler)
      // await this.setState({ open: false })
    } else {
      //    await this.props.createPaymentReceiptAction(data,context.setModalTypeHandler,context.setLoaderStatusHandler,this.sample)
      //  await this.setState({ open: false })

      // }
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.createCashOutInAction(
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.sample,
        )
      );
      // await this.props.listPaymentReceiptAction((moment(this.state.from ,'year','month','day')).format("yyyy-MM-DD"),(moment(this.state.to ,'year','month','day')).format("yyyy-MM-DD"),context.setModalTypeHandler,context.setLoaderStatusHandler)
    }
    // await this.props.listPaymentReceiptAction(
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.listPaymentReceiptdateAction(
          moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD'),
          moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        )
      );
  };

  handleClear = async () => {
    const context = this.context;
    const customer_id = this.props.customer_id;
    var date = new Date();
    let firstDay = date.getMonth() <= 2 ? new Date(date.getFullYear()-1, 3, 1) : new Date(date.getFullYear(), 3, 1);
    var lastDay = new Date();

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listCustomerStatementAction(
        customer_id,
        moment(firstDay, 'year', 'month', 'day').format('yyyy-MM-DD'),
        moment(lastDay, 'year', 'month', 'day').format('yyyy-MM-DD'),
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      )
	  );
    this.setState({filterOpen: false});
  }

  handleFilter = (data) => this.setState({filterOpen: data});

  handleChange = async (data) => {
    //  const date = new Date()
    var date_val = data.target.value._d;
    await this.setState({[data.target.name]: date_val});

    if (moment(this.state.from, 'year') <= moment(this.state.to, 'year')) {
      if (moment(this.state.from, 'month') <= moment(this.state.to, 'month')) {
        if (moment(this.state.from, 'day') <= moment(this.state.to, 'day')) {
          //this.state.from.toString().split(' ')[2] <= this.state.to.toString().split(' ')[2]

          // await this.props.listPaymentReceiptdateAction(
          //   moment(this.state.from, "year", "month", "day").format(
          //     "yyyy-MM-DD"
          //   ),
          //   moment(this.state.to, "year", "month", "day").format("yyyy-MM-DD")
          // );

          this.setState({errormsg: {from: '', to: ''}}); //profitloss_data: filterData,
        } else {
          this.setState({
            errormsg: {
              ...this.state.errormsg,
              [data.target.name]: 'Invalid Date',
            },
          });
        }
      } else {
        this.setState({
          errormsg: {
            ...this.state.errormsg,
            [data.target.name]: 'Invalid Date',
          },
        });
      }
    } else {
      this.setState({
        errormsg: {
          ...this.state.errormsg,
          [data.target.name]: 'Invalid Date',
        },
      });
    }
  };

  ApplyButton = async () => {
    const context = this.context;
    const customer_id = this.props.customer_id;

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listCustomerStatementAction(
        customer_id,
        moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD'),
        moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      )
	  );

    this.setState({filterOpen: false});
  };

  // hello = () => {
  //   // if(data){

  //   this.setState({ open: "expense" });
  //   // }
  // };

  childTable = async (id) => {
    const openData = await this.props.paymentReceipt.filter((f) => f.id === id);

    if (openData.length > 0) {
      this.setState({
        open: 'ledger',
        openData: openData[0].ledger_data.map((s) => {
          return {...s, creationDate: getDateTime(s.creationDate)};
        }),
      });
    }
  };

  payment = async (id) => {
    const openData = await this.props.paymentReceipt.filter((f) => f.id === id);

    if (openData.length > 0) {
      this.setState({open: 'cash', openData: openData[0].payment_data});
    }
    // this.setState({ open: "cash" });
  };

  submitBtn = () => {
    if (this.props.Get_customer_statement.data.length) {
      this.setState({open: true});
    }
  };

  backBtn = () => {
    this.setState({open: false});
  };

  previousBtn = () => {
    this.props.setPdfOpen(false);
  };

  render() {
    const error = this.state.errormsg.from !== '';
    const err = this.state.errormsg.to !== '';
    // const closingBalance = this.props.Get_customer_statement.closingBalance[0]?.closingBalance;
    let componentRef;

    // const filteredCol = stockLocation_col.length ? stockLocation_col.map((d) => ({ title: d, field: d }))
    //   : this.props.stocklocation[0] ?
    //     Object.keys(this.props.stocklocation[0]).map((o) => ({ title: o, field: o })) : []
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return (
      <>
        <div>
          {/* {this.state.open === true && ( */}

          <div id='component' className='invoice_wrap'>
            <div className='invoice_wrap1'>
              <StatementReceipt
                from={this.state.from}
                to={this.state.to}
                open={this.state.open}
                backBtn={this.backBtn}
                data={this.props.Get_customer_statement.data}
              />
            </div>
          </div>

          {/* // )} */}
          <AlertDialog
          // delete={this.state.delete}
          // handleClose={this.handleClose}
          // handleDelete={this.handleDelete}
          // id={this.state.id}
          />
          {this.state.open === false && (
            <MaterialTable
              components={{
                Toolbar: (props) => (
                  <div>
                    <MTableToolbar {...props} />
                    {/* <span style={{ paddingLeft: "100px" }}> */}
                    <Grid container>
                      <Grid
                        style={{paddingLeft: 20}}
                        size={{
                          lg: 12,
                          md: 12,
                          sm: 12,
                          xs: 12
                        }}>
                        {` Closing Amount: ${
                          this.props.Get_customer_statement.closingBalance.length > 0 ? this.props.Get_customer_statement.closingBalance[0].closingBalance : ''
                        }`}
                      </Grid>
                      {/* <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                        <CommonFilter
                          fromTo={true}
                          from={this.state.from}
                          to={this.state.to}
                          handleChange={this.handleChange}
                          handleClose={this.handleFilter}
                          open={this.state.filterOpen}
                          ApplyButton={this.ApplyButton}
                        />
                      </Grid> */}
                    </Grid>
                    <br />
                  </div>
                ),
              }}
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
                maxBodyHeight: maxBodyHeight,
                pageSize: pageSize,
                pageSizeOptions: [20, 50, 100],
                exportMenu: [
                  {
                    label: 'Export PDF',
                    exportFunc: (cols, datas) =>
                      ExportPdf(cols, datas, 'PaymentReceipt'),
                  },
                  {
                    label: 'Export CSV',
                    exportFunc: (cols, datas) =>
                      ExportCsv(cols, datas, 'PaymentReceipt'),
                  },
                ],
              }}
              // columns={
              //   this.props.stocklocation ? this.props.stocklocation.map((t) =>
              //     Object.keys(t).map((o) => { return { title: o, field: o }
              //   }))[0] : []
              // }
              // columns={filteredCol}
              // {this.state.open  && (

              actions={[
                {
                  icon: () => (
                    <div style={{display: 'flex'}}>
                      <CommonFilter
                        fromTo={true}
                        from={this.state.from}
                        to={this.state.to}
                        handleChange={this.handleChange}
                        handleClose={this.handleFilter}
                        open={this.state.filterOpen}
                        ApplyButton={this.ApplyButton}
                        clearButton={this.handleClear}
                        shouldFetchData={true}
                      />
                    </div>
                  ),
                  tooltip: 'Filter',
                  isFreeAction: true,
                },
              ]}
              columns={[
                {
                  field: 'date',
                  title: 'Date',
                },
                {
                  field: 'name',
                  title: 'Details',
                },
                {
                  field: 'vch_type',
                  title: 'Vch Type',
                },
                {
                  field: 'id',
                  title: 'Vch No',
                },
                {
                  field: 'debit',
                  title: 'Debit',
                },
                {
                  field: 'credit',
                  title: 'Credit',
                },
              ]}
              data={this.props.Get_customer_statement.data}
              // data={
              //  this.setState({pgSize : this.props.pageSize}),
              //    this.props.paymentReceipt && this.state.open === false ?
              //    this.props.paymentReceipt :
              //    this.state.open === "ledger" ? this.state.openData :
              //    this.state.open === "cash" ? this.state.openData : []

              // }
              title={<Typography variant='h6'>Statement of Accounts</Typography>}
              // {
              //   'Statement of Accounts'
              //   //   this.state.open === false
              //   //     ? "Payment Report"
              //   //     : this.state.open === "ledger"
              //   //     ? "Ledger"
              //   //     : "Cash"
              // }{<Typography fontSize='1.5rem'>Statement of Accounts</Typography>}
              // )
            />
          )}
          {this.state.open === false && (
            <Grid
              container
              spacing={7}
              display='flex'
              justifyContent={'flex-end'}
              style={{paddingTop: '25px'}}
            >
              <Grid>
                {/* <span style={{ paddingLeft: "100px" }}> */}
                <Button
                  variant='contained'
                  color='error'
                  onClick={() => this.previousBtn()}
                  // disabled ={this.state.open === false}
                >
                  Back
                </Button>
                {/* </span> */}
              </Grid>
              <Grid>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={() => this.submitBtn()}
                  // disabled ={this.state.open === false}
                  disabled={this.props.Get_customer_statement.data.length > 0 ? false : true }
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
          )}
          {/* <Snackbar open={this.state.dialog.open} autoHideDuration={4000} onClose={this.handleClose} anchorOrigin = {{ vertical: 'top', horizontal: 'right' }} >
        <Alert onClose={this.handleClose} severity={this.state.dialog.severity} variant="filled">
          {this.state.dialog.msg}
        </Alert>
       </Snackbar> */}
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    Get_customer_statement: state.customerReducer.Get_customer_statement || [],
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listCustomerStatementAction: (
      id,
      from,
      to,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        listCustomerStatementAction(
          id,
          from,
          to,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PaymentReceipt);

