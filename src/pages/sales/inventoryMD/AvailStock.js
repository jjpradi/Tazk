import React, { Component } from 'react';
import { Grid, CardContent, Typography, Card, IconButton } from '@mui/material';
import AddchartIcon from '@mui/icons-material/Addchart';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import SpeakerNotesIcon from '@mui/icons-material/SpeakerNotes';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import {
  getPaymentReceiptMonthDataAction, getPaymentReceiptTotalAmountAction
} from "../../../redux/actions/paymentReceipt_actions";
import { listInventoryAction, listInventoryByIdAction, listInvManageAction, updateInventoryAction, getbyidInventoryAction, deleteInventoryAction, createInventoryAction } from '../../../redux/actions/inventory_actions';
import { connect } from 'react-redux';
import moment from 'moment';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
//import { clientwebsocket } from '../../websocket';
import Cards from '../../../components/dynamicCards/index';
import expensesIcon from '../../../assets/dashboardIcons/expenses.svg'
import { font14_500, pageSize } from 'utils/pageSize';
import apiCalls from 'utils/apiCalls';
import useCommonRef from "../../../pages/common/home/useCommonRef";
import CloseIcon from '@mui/icons-material/Close';
import { Box, padding } from '@mui/system';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import DashboardTile from 'components/DashboardTile';
class AvailStock extends Component {
  // static contextType = CreateNewButtonContext;


  // constructor(props) {
  //   super(props);
  //   var date = new Date();
  //   var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  //   var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  //   this.state = {
  //     from: firstDay,
  //     to: lastDay,
  //     filtedValue: { product_name: '', brand: '', category: '', location_id: 'null', max_price: '', min_price: '' },
  //     id: '',
  //     page: 0,
  //     pageSize: 20,
  //     pollTimer : null

  //   }
  // }

  // //   getTotalInventory = async () => {
  // // }

  // async componentDidMount() {
  //   if (this.props.inView && this.props.isEnabled) {
  //     const context = this.context;
  //     const data = {
  //       product_name: '', brand: '', category: '', max_price: '', min_price: '', location_id: context.headerLocationId, user_id: context.commoncookie, pageCount: 0,
  //       numPerPage: pageSize, gb: '', sortKey: "total", sortOrder: "desc"
  //     }
  //     apiCalls(
  //       context.setModalTypeHandler,
  //       context.setLoaderStatusHandler,
  //       this.props.listInventoryByIdAction(data, context.commoncookie, context.headerLocationId, context.setModalStatusHandler, context.setModalTypeHandler, context.setLoaderStatusHandler)
  //     );
  //   }
  // }

  // componentDidUpdate(preProps, preState) {
  //   if (preProps.inView !== this.props.inView && this.props.isEnabled) {
  //     const context = this.context;
  //     const data = {
  //       product_name: '', brand: '', category: '', max_price: '', min_price: '', location_id: context.headerLocationId, user_id: context.commoncookie, pageCount: 0,
  //       numPerPage: pageSize, gb: '', sortKey: "total", sortOrder: "desc"
  //     }
  //     apiCalls(
  //       context.setModalTypeHandler,
  //       context.setLoaderStatusHandler,
  //       this.props.listInventoryByIdAction(data, context.commoncookie, context.headerLocationId, context.setModalStatusHandler, context.setModalTypeHandler, context.setLoaderStatusHandler)
  //     );
  //   }
  //   if (preProps.isEnabled !== this.props.isEnabled && this.props.isEnabled) {
  //     const context = this.context;
  //     const data = {
  //       product_name: '', brand: '', category: '', max_price: '', min_price: '', location_id: context.headerLocationId, user_id: context.commoncookie, pageCount: 0,
  //       numPerPage: pageSize, gb: '', sortKey: "total", sortOrder: "desc"
  //     }
  //     apiCalls(
  //       context.setModalTypeHandler,
  //       context.setLoaderStatusHandler,
  //       this.props.listInventoryByIdAction(data, context.commoncookie, context.headerLocationId, context.setModalStatusHandler, context.setModalTypeHandler, context.setLoaderStatusHandler)
  //     );
  //   }
  //   if((preProps.inViewport !== this.props.inViewport)){
  //     if(this.props.inViewport === true){
         
  //         setTimeout(() => {
  //             const timer = setInterval(() => this.pollData(), this.props.DASHBOARD_API_POLL_TIMING)
  //             if(this.props.inViewport === false){
  //                 clearTimeout(timer)
  //             }
  //             this.props.setDashboardPollingTimerIdsAction(timer)
  //             this.setState({pollTimer : timer})
  //         },this.props.DASHBOARD_API_POLL_TIMING)
          

  //     }else{
  //         clearTimeout(this.state.pollTimer)
  //     }

  // }
  // }

  // componentWillUnmount() {
  //     clearTimeout(this.state.pollTimer);
  // }

  // pollData = () => {
  //   const context = this.context;
  //   const data = {
  //     product_name: '', brand: '', category: '', max_price: '', min_price: '', location_id: context.headerLocationId, user_id: context.commoncookie, pageCount: 0,
  //     numPerPage: pageSize, gb: '', sortKey: "total", sortOrder: "desc"
  //   }
  //     this.props.pollServer(
  //       this.props.listInventoryByIdAction(data, context.commoncookie, context.headerLocationId, context.setModalStatusHandler, context.setModalTypeHandler, context.setLoaderStatusHandler)
  //       );
  // };

  // value(){
  //   this.state.grandTotal(this.props.grandTotal.toFixed(2))
  // }
  render() {
    
    return (
      <div
        ref={(el) => {
          this.props.ref1(el);
          this.props.isVisibleRef.current = el
        }}
        style={{ width: '100%' }}
      >
        <DashboardTile
          {...this.props}
          title='Total Inventory'
          icon={expensesIcon}
          value={this.props?.data[0]?.grandTotal || '0.00'}
          currencyIcon={true}
        />
      </div>
    )
  }

}

const mapStateToProps = state => {
  return {
    paymentReceiptMonth: state.paymentReceiptReducer.paymentReceiptMonth || [],
    paymentReceipTotalAmount: state.paymentReceiptReducer.paymentReceipTotalAmount || [],
    grandTotal: state.inventoryReducer.grandTotal || 0,
    inventory: state.inventoryReducer.inventory,
    inventory_all_data: state.inventoryReducer.inventory_all_data,
    inventory_id_data: state.inventoryReducer.inventory_id_data,
    inventory_count: state.inventoryReducer.inventory_count,
    gettopfive: state.inventoryReducer.gettopfive
  }
}

const mapDispatchToProps = (dispatch) => {
  return {

    getPaymentReceiptMonthDataAction: (from, to) => {
      return dispatch(getPaymentReceiptMonthDataAction(from, to))
    },

    getPaymentReceiptTotalAmountAction: () => {
      return dispatch(getPaymentReceiptTotalAmountAction())
    },
    listInventoryByIdAction: (data, employee_id, headerLocationId, setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(listInventoryByIdAction(data, employee_id, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
    },
    listInventoryAction: (employee_id, headerLocationId, setModalTypeHandler, setLoaderStatusHandler, result) => {
      dispatch(listInventoryAction(employee_id, headerLocationId, setModalTypeHandler, setLoaderStatusHandler, result))
    },
    // listInvManageAction: (employee_id,headerLocationId,setModalTypeHandler,setLoaderStatusHandler,result) => {
    //   dispatch(listInvManageAction(employee_id,headerLocationId,setModalTypeHandler,setLoaderStatusHandler,result))
    // },
    setDashboardPollingTimerIdsAction : (id) => {
      return dispatch(setDashboardPollingTimerIdsAction(id))
    }
  }
}
export default useCommonRef(connect(mapStateToProps, mapDispatchToProps)(AvailStock));
