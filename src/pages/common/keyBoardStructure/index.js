import React, {Component} from 'react';
import {connect, useDispatch} from 'react-redux';
import './keyPad.css';
import KeyPadComponent from './keyBoard';
import _ from 'lodash';
import Taxtype from './taxType';
import {
  EditProductList,
  PushProductList,
  BackSpace,
  DeleteIndex,
  SetPaymentRedirect,
  EditPreOrderItems,
  DeletePreOrderItems,
  PreOrderBackSpace,
  changeDiscountAction,
} from '../../../redux/actions/pos_product_list';
import {
  ListPaymentModesAction,
  PreOrderListPaymentModesAction,
} from '../../../redux/actions/pos_session';
import { CreaterequestAction, CancelDiscount } from 'redux/actions/sales_actions';
// import { withRouter } from 'react-router-dom';
import withRouter from '../../../utils/custWithRouter';
import {Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Grid, IconButton, TextField} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentIcon from '@mui/icons-material/Payment';
import context from '../../../context/CreateNewButtonContext';
import {
  taxes,
  totalCost,
  taxForCommonDiscount
} from '../../../components/pos/checkout_products/commonTax';
import apiCalls from 'utils/apiCalls';
import { websocketEvents } from 'http-common';
import { clientwebsocket, titleURL } from 'http-common';
import { CreateNotificationAction, getNotificationTokenAction } from 'redux/actions/notification_actions';
import { getDateTimeFormat } from 'utils/getTimeFormat';
import { getsessionStorage } from 'pages/common/login/cookies';
import Cookies from 'universal-cookie';
import { cancelPosRequestAction } from 'redux/actions/leaveRequest_actions';
import DiscountOutlinedIcon from '@mui/icons-material/DiscountOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { getDiscountConfigByPosIdAction } from 'redux/actions/requestConfig';

// const drawerheight = 100;

// const styles = theme => ({
//   grow: {
//     flexGrow: 1,
//   },
//   appBar: {
//     width: `calc(100% - ${drawerheight}px)`,

//   },
// });

class KeyPad extends Component {
  static contextType = context;
  constructor(props) {
    super(props);
    this.wrapperRef = React.createRef();
    this.state = {
      activeButton: '',
      showComponent: false,
      onClickValue: '',
      switchDis: true,
      list: [],
      listforapproval: 0,
      discount : false,
      discountDialog: false,
      discountValues: {
        percent: this.props.pre_order_status ? (this.props.pre_order_list['pre_order'].discount?.percent || 0) : (this.props.product_lists[this.props.tab_count].discount?.percent || 0),
        amount: this.props.pre_order_status ? (this.props.pre_order_list['pre_order'].discount?.amount || 0) : (this.props.product_lists[this.props.tab_count].discount?.amount || 0)
      }
    };
    this.storage = getsessionStorage()
  }

  listenerFunct = (event) => {
    let key = [
      96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 48, 49, 50, 51, 52, 53, 54,
      55, 56, 57, 110, 190
    ];
    if (_.includes(key, event.keyCode)) {
      if (event.keyCode === 190 && this.state.onClickValue.includes('.')) {
        return;
      }
      if (this.state.onClickValue.split('.')[1]?.length >= 2) {
        return;
      }
      this.setState({onClickValue: `${this.state.onClickValue}${event.key}`});

      let value = parseFloat(this.state.onClickValue);
      if (
        parseFloat(this.state.onClickValue).toString() !==
        this.state.onClickValue.toString()
      ) {
        value = `${parseFloat(this.state.onClickValue)}`;
      }

      const obj = {name: this.state.activeButton, value};
      if (this.state.activeButton === 'discount') {
        let discount_type = this.state.switchDis ? 0 : 1;
        obj.discount_type = discount_type;
        this.setState({listforapproval : {type : 'discount', percentage : value}})
      }
 console.log('objecctttt', obj, )
      if (this.props.pre_order_status === false && obj.name !== '') {
        this.props.EditProductList(obj, this.props.posId);
      } else if (obj.name !== '') {
        this.props.EditPreOrderItems(obj, this.props.posId);
      }
    }
    if (event.keyCode === 8) {
      if (this.props.pre_order_status) {
        this.props.PreOrderBackSpace(this.state.activeButton, this.props.posId);
      } else {
        this.props.BackSpace(this.state.activeButton, this.props.posId);
      }
      this.setState({onClickValue: `${this.state.onClickValue}`.slice(0, -1)});
    }
  };
  componentDidMount() {
    window.addEventListener('keydown', this.listenerFunct);
    if (this.props.pre_order_status) {
      this.setState({list: this.props.pre_order_list['pre_order'].productData});
    } else {
      this.setState({
        list: this.props.product_lists[this.props.tab_count].productData,
      });
    }
    this.props.getDiscountConfigByPosIdAction(this.props.posId)
  }
  componentWillUnmount() {
    window.removeEventListener('keydown', this.listenerFunct);
  }
  activeButtunName = (name) => {
    this.setState({activeButton: name});
  };
  componentDidUpdate(preProps, preState) {
    if (
      preProps.index !== this.props.index ||
      preState.activeButton !== this.state.activeButton
    ) {
      this.setState({onClickValue: ''});
    }
    if (
      preProps.pre_order_status !== this.props.pre_order_status ||
      preProps.product_lists !== this.props.product_lists ||
      preProps.pre_order_list !== this.props.pre_order_list ||
      this.props.tab_count !== preProps.tab_count
    ) {
      if (this.props.pre_order_status) {
        this.setState({
          list: this.props.pre_order_list['pre_order'].productData,
        });
      } else {
        this.setState({
          list: this.props.product_lists[this.props.tab_count].productData,
        });
      }
    }

    if (preProps.outSideClick !== this.props.outSideClick) {
      if (this.props.outSideClick) {
        this.setState({activeButton: ''});
      }
    }
  //   clientwebsocket.socket.onmessage = async (message) => {
  //     let { event, content } = JSON.parse(message.data);
  //     if (event == 'ApprovalDiscountResponse') {
  //       if(content.posId ==   this.props.posId) {
  //         this.Aproovedpaymentclick()
  //       }
  //     }  
  //     if(event == 'CancelDiscount'){
  //       if(content.posId ==   this.props.posId) {
  //         this.cancelResponse()
  //       }
  //     }
  // };
  const cookies = new Cookies();
    const reqid = cookies.get('disreq')
    console.log('handleopenn')
    
    // websocketEvents.addListener({
    //   eventName: 'ApprovalDiscountResponse',
    //   callbackFun: this.Aproovedpaymentclick,
    // });
    // websocketEvents.addListener({
    //   eventName: 'CancelDiscount',
    //   callbackFun: this.cancelResponse,
    // });
  }
  Aproovedpaymentclick = () => {
   
    const cookies = new Cookies();
    this.setState({discount : false});
    cookies.remove('disreq');
      if (this.props.pre_order_status === false) {
        apiCalls(
          this.context.setModalTypeHandler,
          this.context.setLoaderStatusHandler,
          this.props.ListPaymentModesAction(
            true,
            this.props.posId,
            true,
            this.context.setLoaderStatusHandler,
          )
        );
      } else {
        apiCalls(
          this.context.setModalTypeHandler,
          this.context.setLoaderStatusHandler,
          this.props.PreOrderListPaymentModesAction(
            true,
            this.props.posId,
            true,
            this.context.setLoaderStatusHandler,
          )
        );
      }
      this.props.handleSmsMailConfiguration();
    
  }
  cancelResponse = () =>{
    const cookies = new Cookies();
    apiCalls(
      this.context.setModalTypeHandler,
      this.context.setLoaderStatusHandler,
      this.props.CancelDiscount((response)=>{
        if(response === 200){
          this.setState({discount : false});
          cookies.remove('disreq')
        }
      })
    );
  }
  
  cancelRequest = () =>{
    const cookies = new Cookies();
    const reqid = cookies.get('disreq')
    console.log('totalDiscount', reqid);

    const cancelledBy = {
      cancelledBy: this.storage?.first_name,
      reason_for_rejection: 'Cancelled By initiator',
      rejectedById:this.storage?.employee_id,
      request_type : 'discount',
      posId : this.props.posId
    };
    apiCalls(
      this.context.setModalTypeHandler,
      this.context.setLoaderStatusHandler,
      this.props.cancelPosRequestAction(
          this.context.commoncookie,
          reqid,
          cancelledBy,
          (response)=>{
            if(response == 200){
              this.setState({discount : false});
              cookies.remove('disreq')
              this.setState({list:[]})
            }
          }
        ),
      )
  }
  paymentClick = (discount, posDiscountByPOSId) =>  {
    const cookies = new Cookies();
    const productCount = this.state.list || [];
    const discountSum = productCount.reduce((sum, item) => sum + parseFloat(item.discount || 0), 0);
    if(posDiscountByPOSId.length > 0 && !isNaN(parseInt(discount.percent)) && parseInt(discount.percent) > (posDiscountByPOSId[0]?.max_discount_percent || 0) && this.storage?.role_name !== 'Administrator'){
      let val = this.state.listforapproval;
      let data = {
        pos_id :  this.props.posId,
        request_type: 'discount',
        discount : discount.percent
      }
      apiCalls(
        this.context.setModalTypeHandler,
        this.context.setLoaderStatusHandler,
        this.props.CreaterequestAction(data, (response) =>{
          if (response?.length) {
            this.setState({discount : true})
            cookies.set('disreq',response[0]?.id )
            this.props.CreateNotificationAction({ content_body: `${discount.percent}% Discount Requested For ${response[0]?.posName} And Location For ${response[0]?.location_name}`, title: 'Pos Message', time: getDateTimeFormat(new Date()), "active": "1" })
        }
        })
     
      );

    }else{
    if (this.props.pre_order_status === false) {
      apiCalls(
        this.context.setModalTypeHandler,
        this.context.setLoaderStatusHandler,
        this.props.ListPaymentModesAction(
          true,
          this.props.posId,
          true,
          this.context.setLoaderStatusHandler,
        )
      );
    } else {
      apiCalls(
        this.context.setModalTypeHandler,
        this.context.setLoaderStatusHandler,
        this.props.PreOrderListPaymentModesAction(
          true,
          this.props.posId,
          true,
          this.context.setLoaderStatusHandler,
        )
      );
    }
    this.props.handleSmsMailConfiguration();
  }
  };


  onClick = async (button) => {
    let except = ['quantity', 'discount', 'selling_price', 'backSpace'];

    if (_.includes(except, button) === false && this.props.index !== '') {
      let value = `${this.state.onClickValue}${button}`.toString();

      if (value.includes('.') && value.match(/\./g).length > 1) {
        return;
      }
      
      const obj = {name: this.state.activeButton, value};
      

      

    
   
   

      

      // if(!this.state.onClickValue && button === '.'){
      //   value = await value.toLocaleString(undefined, {minimumIntegerDigits:1})
      // }
     
     

      // if(parseFloat(this.state.onClickValue).toString() !== this.state.onClickValue.toString()){
      //   value = `${parseFloat(this.state.onClickValue )}.0`
      // }

   

      if (this.state.activeButton === 'discount') {
        let discount_type = this.state.switchDis ? 0 : 1;
        obj.discount_type = discount_type;
       
        
      }
      console.log('objecttt', obj, button)
      if (this.props.pre_order_status === false) {


        if(obj.name === 'quantity'){
        
          const actualQuantity = this.props.product_lists[this.props.tab_count].productData[this.props.index]['received_quantity']
          if(value > actualQuantity){
            await this.setState({onClickValue: ''});
            alert(`Entered Quantity:${value} Is Higher Than Available Quantity`)
            obj.value=1
            await this.props.EditProductList(obj, this.props.posId);
          }else{
            await this.props.EditProductList(obj, this.props.posId);
            await this.setState({onClickValue: value});
          }
        }
        else{
          await this.setState({onClickValue: value});
          await this.props.EditProductList(obj, this.props.posId);
        }
      } else {
        await this.props.EditPreOrderItems(obj, this.props.posId);
      }
    }
    if (button === 'backSpace') {
      this.backspace();
    }
    if (button === 'c') {
      await this.setState({onClickValue: 0});
      if (this.props.pre_order_status === false) {
        await this.props.EditProductList(
          {name: this.state.activeButton, value: 0},
          this.props.posId,
        );
      } else {
        await this.props.EditPreOrderItems(
          {name: this.state.activeButton, value: 0},
          this.props.posId,
        );
      }
    }
  };

  backspace = async () => {
    if (this.props.pre_order_status) {
      this.props.PreOrderBackSpace(this.state.activeButton, this.props.posId);
    } else {
      this.props.BackSpace(this.state.activeButton, this.props.posId);
    }
    this.setState({onClickValue: `${this.state.onClickValue}`.slice(0, -1)});
  };
  handleClick = () => {
    // switch the value of the showModal state
    this.setState({
      showComponent: !this.state.showComponent,
    });
  };
  setswitchDis = () => {
    this.setState({switchDis: !this.state.switchDis});
  };

  DeleteIndex = (index) => {
    if (this.props.pre_order_status) {
      this.props.DeletePreOrderItems(index, this.props.posId);
    } else {
      this.props.DeleteIndex(index, this.props.posId);
    }
  };

  handleDiscountChange = async(event, name, list) => {
    if(name === 'percent'){
      if(event.target.value !== ''){
        let percent = Math.min(parseInt(event.target.value), 100)
        let amount = Number((totalCost(list, 'noDiscount') * percent) / 100).toFixed(2)
        this.setState({discountValues: {percent: percent, amount: amount}})
      }
      else{
        this.setState({ discountValues: { amount: '0' } })
      }
    }
    else if(name === 'amount'){
      if(event.target.value !== ''){
        this.setState({discountValues: {percent: ((parseInt(event.target.value) / totalCost(list, 'noDiscount')) * 100).toFixed(2), amount: event.target.value}})
      }
      else{
        this.setState({ discountValues: { percent: '0' } })
      }
    }
  }

  applyDiscount = async(event) => {
    event.preventDefault()
    const data = {
      percent: parseFloat(this.state.discountValues.percent), 
      amount: parseFloat(this.state.discountValues.amount)
    }
    await this.props.changeDiscountAction({data: data, pre_order_status: this.props.pre_order_status}, this.props.posId)
    this.setState({discountDialog: false})
  }
  
  render() {
    // const classes = withStyles();
    const totalDiscount = this.state.list.reduce(
      (sum, item) => sum + parseFloat(item.discount || 0),
      0
    );
    const {index,data} = this.props;
    const cookies = new Cookies();
    const reqid = cookies.get('disreq')
    const list = this.props.pre_order_status ? this.props.pre_order_list['pre_order'].productData : this.props.product_lists[this.props.tab_count].productData
    const discount = this.props.pre_order_status ? this.props.pre_order_list['pre_order'].discount : this.props.product_lists[this.props.tab_count].discount

    const roundOffAppConfig = this.props.app_config_data.filter(f => f.key_name === 'company.applyRoundOff')
  const roundedOffEnabled = roundOffAppConfig.length > 0 ? roundOffAppConfig[0].value : 'false'

    const finalTotal =
      discount === undefined ||
        discount?.amount === 0 ||
        totalCost(list, 'noDiscount') === 0
        ? roundedOffEnabled === 'true' ? Math.round(totalCost(list, 'noDiscount')) : totalCost(list, 'noDiscount').toFixed(2)
        : roundedOffEnabled === 'true' ? Math.round(
          totalCost(list, 'noDiscount', discount) +
          taxForCommonDiscount(list, discount)
        ) : (totalCost(list, 'noDiscount', discount) + taxForCommonDiscount(list, discount)).toFixed(2);

    
    return (
      <>
        <React.Fragment>
          <div
            ref={this.wrapperRef}
            style={{display: 'flex', justifyContent: 'space-around'}}
          >
            <div
              style={{display: 'flex', flexDirection: 'column', width: '90%'}}
            >
              <div style={{border: '1px solid rgba(0, 0, 0, 0.23)', padding: '7px'}}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <div
                    style={{
                      textAlign: 'center',
                      width: '100%',
                      // fontSize: '25px',
                    }}
                  >
                    <Typography
                    // variant='h9'
                      style={{
                        margin: 0,
                        color: 'black',
                        fontWeight:'bold',
                        fontSize: '13px'
                      }}
                    > {`Total: ₹${finalTotal}`}</Typography>
                  </div>

                  {/* <Button
                    style={{marginLeft: 'auto'}}
                    color='inherit'
                    onClick={() => {
                      this.DeleteIndex(index);
                      this.setState({onClickValue: ''});
                    }}
                  >
                    <DeleteIcon className='material-icons' />
                  </Button> */}
                </div>
              </div>
              <div style={{display: 'flex', width: '100%'}}>
              <Button
                  variant='outlined'
                  color='inherit'
                  disabled={this.state.list.length ? false : true}
                  style={{
                    borderRadius: 0,
                    border: '1px solid rgba(0, 0, 0, 0.23)',
                    fontWeight: 'bold',
                    width: '100%',
                  }}
                  className='custButton'
                  onClick={() => this.setState({discountDialog: true, discountValues: { percent: discount.percent, amount: discount.amount }})}
                >
                  <div style={{ display: 'flex', alignItems: 'center', columnGap: '10px' }}>
                    <DiscountOutlinedIcon 
                      className='material-icons'
                      color='error'
                      style={{fontSize: '28px'}}
                    />
                    <Typography style={{margin: 0, fontSize: '13px'}}>{`Discount`}</Typography>
                  </div>
                </Button>
                
                <Button
                  variant='outlined'
                  color='inherit'
                  disabled={finalTotal <= 0}
                  style={{
                    borderRadius: 0,
                    border: '1px solid rgba(0, 0, 0, 0.23)',
                    fontWeight: 'bold',
                    width: '100%',
                  }}
                  className='custButton'
                  onClick={() => this.paymentClick(discount, this.props.posDiscountByPOSId)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', columnGap: '10px' }}>
                    <PaymentIcon
                      className='material-icons'
                      color={finalTotal <= 0 ? 'disabled' : 'success'}
                      style={{fontSize: '31px'}}
                    />
                    <Typography style={{margin: 0, fontSize: '13px'}}>{`${
                      totalDiscount > 0 && this.storage?.role_name !== 'Administrator' ? 'Approval Req' : this.props.pre_order_status ? 'Pre Payment' : 'Payment'
                    }`}</Typography>
                  </div>
                </Button>

                {/* <KeyPadComponent
                  discountButtonDisable={this.props.pre_order_status}
                  clickValue={this.state.onClickValue}
                  setswitchDis={this.setswitchDis}
                  switchDis={this.state.switchDis}
                  onClick={this.onClick}
                  activeButton={this.activeButtunName}
                  activeButtonName={this.state.activeButton}
                /> */}
              </div>
            </div>
          </div>

          {this.state.showComponent && (
            <Taxtype handleClose={this.handleClick} {...this.props} />
          )}

       <Dialog open={this.state.discount || reqid !==undefined } onClose={()=>{}}>
        <DialogTitle>{"Discount Approval"}</DialogTitle>
        <DialogContent>
          <Typography>Discount Approval Request Send Please Wait For Approval</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.cancelRequest} color="primary">
            Cancel For Request
          </Button>
        </DialogActions>
      </Dialog>

          <Dialog open={this.state.discountDialog} maxWidth='xs' fullWidth onClose={() => this.setState({discountDialog: false})}>
            <DialogTitle>
              <Grid container sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Grid sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant='h6'>Discount</Typography>
                </Grid>

                <Grid>
                  <IconButton aria-label='close' onClick={() => this.setState({discountDialog: false})}>
                    <CloseIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </DialogTitle>

            <DialogContent>
              <Grid container spacing={2}>
                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <TextField
                    variant='filled'
                    label='Discount in Percent'
                    value={this.state.discountValues.percent}
                    fullWidth
                    onChange={(event) => this.handleDiscountChange(event, 'percent', list)}
                    InputProps={{
                      endAdornment: <span style={{ fontSize: '11px', color: 'grey' }}>{`Max: ${this.props.posDiscountByPOSId.length > 0 ? this.props.posDiscountByPOSId[0].max_discount_percent : 100}%`}</span>
                    }}
                  />
                </Grid>
                
                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <TextField
                    variant='filled'
                    label='Discount in Amount'
                    value={this.state.discountValues.amount}
                    fullWidth
                    onChange={(event) => this.handleDiscountChange(event, 'amount', list)}
                    InputProps={{
                      endAdornment: <span style={{ fontSize: '11px', color: 'grey' }}>{`Max: ₹1000`}</span>
                    }}
                  />
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions>
              <Grid container spacing={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Grid>
                  <Button variant='contained' color='error' onClick={() => this.setState({discountDialog: false})}>Cancel</Button>
                </Grid>

                <Grid>
                  <Button variant='contained' onClick={this.applyDiscount}>Apply</Button>
                </Grid>
              </Grid>
            </DialogActions>
          </Dialog>
        </React.Fragment>
      </>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    product_lists: state.productListReducer.product_lists || [],
    tab_count: state.productListReducer.tab_count,
    index: state.productListReducer.index,
    paymentModes: state.productListReducer.paymentModes,
    pre_order_status: state.productListReducer.pre_order_status,
    pre_order_list: state.productListReducer.pre_order_list,
    posDiscountByPOSId: state.RequestConfigReducer.posDiscountByPOSId,
    app_config_data: state.appConfigReducer.app_config_data
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    EditProductList: (data, posId) => {
      dispatch(EditProductList(data, posId));
    },
    PushProductList: (data) => {
      dispatch(PushProductList(data));
    },
    BackSpace: (data, posId) => {
      dispatch(BackSpace(data, posId));
    },
    DeleteIndex: (index, posId) => {
      dispatch(DeleteIndex(index, posId));
    },
    ListPaymentModesAction: (data, posId, modal, setLoaderStatusHandler) => {
      return dispatch(
        ListPaymentModesAction(data, posId, modal, setLoaderStatusHandler),
      );
    },
    SetPaymentRedirect: (data, posId) => {
      dispatch(SetPaymentRedirect(data, posId));
    },
    PreOrderListPaymentModesAction: (
      data,
      posId,
      modal,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        PreOrderListPaymentModesAction(
          data,
          posId,
          modal,
          setLoaderStatusHandler,
        ),
      );
    },
    EditPreOrderItems: (data, posId) => {
      dispatch(EditPreOrderItems(data, posId));
    },
    DeletePreOrderItems: (index, posId) => {
      dispatch(DeletePreOrderItems(index, posId));
    },
    PreOrderBackSpace: (data, posId) => {
      dispatch(PreOrderBackSpace(data, posId));
    },
    CreaterequestAction: (data, response) =>{
      dispatch(CreaterequestAction(data, response))
    },
    CancelDiscount: (response) =>{
      dispatch(CancelDiscount(response))
    },
    CreateNotificationAction: (data) => {
      dispatch(CreateNotificationAction(data))
  },
  cancelPosRequestAction : (employee_id, id, cancelledBy, response) =>{
    dispatch(cancelPosRequestAction(employee_id, id, cancelledBy, response))
  },
  changeDiscountAction: (data, posId) => {
    dispatch(changeDiscountAction(data, posId))
  },
  getDiscountConfigByPosIdAction: (posId) => {
    dispatch(getDiscountConfigByPosIdAction(posId))
  } 
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(KeyPad));
