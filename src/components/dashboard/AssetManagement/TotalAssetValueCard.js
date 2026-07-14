import React, { Component } from 'react';
import { Grid, CardContent, Typography, Card, ThemeProvider, useMediaQuery, IconButton ,Box} from '@mui/material';
import AddchartIcon from '@mui/icons-material/Addchart';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import SpeakerNotesIcon from '@mui/icons-material/SpeakerNotes';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import mostspendingIcon from '../../../assets/dashboardIcons/expense.svg';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import cahinhandIcon from '../../../assets/dashboardIcons/money.svg';

import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import {
    getPaymentReceiptMonthDataAction,
    getPaymentReceiptTotalAmountAction,

} from '../../../redux/actions/paymentReceipt_actions';
import { TotalExpenseAction, listExpenseChart } from 'redux/actions/profitloss_actions';
import { connect } from 'react-redux';
import moment from 'moment';
import { useInView } from 'react-intersection-observer';
import {clientwebsocket } from '../../../http-common'
import Cards from '../../dynamicCards/index'
import expensesIcon from '../../../assets/dashboardIcons/expensesic.svg';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import appointmentIcon from '../../../assets/dashboardIcons/calendare.svg';
import CloseIcon from '@mui/icons-material/Close';
import useCommonRef from "../../../pages/common/home/useCommonRef";
import apiCalls from 'utils/apiCalls';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import { cellStyle, font14_500, headerStyle } from 'utils/pageSize';
import { getAuditDash, totalAssetValueAction } from 'redux/actions/asset_actions';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import DashboardTile from 'components/DashboardTile';
class TotalAssetValueCard extends Component {
    static contextType = CreateNewButtonContext;
    constructor(props) {
        super(props);
        var date = new Date();
        var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        this.state = {
           
            chartData: {
                count: 0,
                status: 0,
               
                style: window.matchMedia("(min-width: 1024px)").matches
            },
            pollTimer: null,
            headerLocation: "null"
            
        };
    }

    
    // async componentDidMount() {
    //     const context = this.context;
    //     if (this.props.inView && this.props.isEnabled) {
    //         await  this.props.totalAssetValueAction(context.headerLocationId);
    //     }
       
    // }

    // async componentDidUpdate(preProps, preState) {
    //     const context = this.context;
    //     let res = {};

    //     if (preProps.totalAssetvalues !== this.props.totalAssetvalues) {
    //         const { count, status } = this.props.totalAssetvalues;
    //         this.setState({
    //             chartData: {
    //                 count: count || 0,
    //                 status: status || 0,
    //                 // other properties
    //             }
    //         });
    //     }

    //     // if (this.state.headerLocation !== context.headerLocationId) {
    //     //     this.setState({headerLocation: context.headerLocationId})
    //     //     apiCalls(
    //     //       context.setModalTypeHandler,
    //     //       context.setLoaderStatusHandler,
    //     //       this.props.getAuditDash(context.headerLocationId)
    //     //     );
    //     // }
        
    //     // if (preProps.total_expense_chart !== this.props.total_expense_chart) {
    //     //     for (let i of this.props.total_expense_chart) {
    //     //         for (const [key, value] of Object.entries(i)) {
    //     //             res = { ...res, [key]: value === null ? 0 : value }

    //     //         }
    //     //     }
    //     //     this.setState({ chartData: res })
    //     // }

    //     if (preProps.isEnabled !== this.props.isEnabled  && this.props.isEnabled ) {
    //         apiCalls(
    //           context.setModalTypeHandler,
    //           context.setLoaderStatusHandler,
    //           this.props.totalAssetValueAction(context.headerLocationId)
    //         );
    //       }

    //     if (preProps.inView !== this.props.inView && this.props.isEnabled) {
    //         apiCalls(
    //             context.setModalTypeHandler,
    //             context.setLoaderStatusHandler,
    //             // this.props.listExpenseChart(moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD'), moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),),
    //             this.props.totalAssetValueAction(context.headerLocationId),
    //         )
            
    //     }
    //     if((preProps.inViewport !== this.props.inViewport)){
    //         if(this.props.inViewport === true){
               
    //             setTimeout(() => {
    //                 const timer = setInterval(() => this.pollData(), this.props.DASHBOARD_API_POLL_TIMING)
    //                 if(this.props.inViewport === false){
    //                     clearTimeout(timer)
    //                 }
    //                 this.props.setDashboardPollingTimerIdsAction(timer)
    //                 this.setState({pollTimer : timer})
    //             },this.props.DASHBOARD_API_POLL_TIMING)
                

    //         }else{
    //             clearTimeout(this.state.pollTimer)
    //         }

    //     }


    // }

    // componentWillUnmount() {
    //     clearTimeout(this.state.pollTimer);
    // }
    
    // pollData = () => {
    //     const context = this.context;
    //     this.props.pollServer(
    //         this.props.totalAssetValueAction(context.headerLocationId)
    //         );
    // };

    render() {
        const { count,status } = this.state.chartData
        
        return (
          <div
            ref={(el) => {
              this.props.ref1(el);
              this.props.isVisibleRef.current = el;
            }}
            style={{width: '100%'}}
          >
            <DashboardTile
              {...this.props}
              title='Total Asset Value'
              icon={cahinhandIcon}
              value={this.props?.data[0]?.totalCost || 0}
              currencyIcon={true}
            />
          </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        totalAssetvalues: state.AssetReducers.totalAssetvalues || [],
        
    };
};

const mapDispatchToProps = (dispatch) => {

    return {
        totalAssetValueAction: () => {
            return dispatch(totalAssetValueAction());
        },
        setDashboardPollingTimerIdsAction : (id) => {
            return dispatch(setDashboardPollingTimerIdsAction(id))
        }
    };
};
export default useCommonRef(connect(mapStateToProps, mapDispatchToProps)(TotalAssetValueCard));		