import React, { Component } from 'react';
import { Grid, CardContent, Typography, Card, ThemeProvider, useMediaQuery, IconButton } from '@mui/material';
import AddchartIcon from '@mui/icons-material/Addchart';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import SpeakerNotesIcon from '@mui/icons-material/SpeakerNotes';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
    getPaymentReceiptMonthDataAction,
    getPaymentReceiptTotalAmountAction,

} from '../../../redux/actions/paymentReceipt_actions';
import { MostSpendExpenseAction, listExpenseChart } from 'redux/actions/profitloss_actions';
import { connect } from 'react-redux';
import moment from 'moment';
import { useInView } from 'react-intersection-observer';
import {clientwebsocket } from '../../../http-common'
import Cards from '../../dynamicCards/index'
import expensesIcon from '../../../assets/dashboardIcons/expensesic.svg';
import mostspendingIcon from '../../../assets/dashboardIcons/expense.svg';
import appointmentIcon from '../../../assets/dashboardIcons/calendare.svg';
import useCommonRef from "../../../pages/common/home/useCommonRef";
import CloseIcon from '@mui/icons-material/Close';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import { cellStyle, font14_500 } from 'utils/pageSize';
import DashboardTile from 'components/DashboardTile';

class SpendingCard extends Component {
    // static contextType = CreateNewButtonContext;
    // constructor(props) {
    //     super(props);
    //     var date = new Date();
    //     var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    //     var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    //     this.state = {
    //         from: firstDay,
    //         to: lastDay,
    //         chartData: {
    //             total: 0,
    //             PreFinacialTotal: 0,
    //             monthtotal: 0,
    //             PreMonthTotal: 0,
    //             openingbalance: 0,
    //             currentbalance: 0,
    //             spending: 0,
    //             spendingname: '',
    //             style: window.matchMedia("(min-width: 1024px)").matches
    //         },
    //         pollTimer: null,
    //         headerLocation: "null"
    //     };
    // }

    // async componentDidMount() {
    //     const context = this.context;
    //     if (this.props.inView && this.props.isEnabled ) {
    //         await this.props.MostSpendExpenseAction(context.headerLocationId);
    //     }
    //     clientwebsocket.socket.onmessage = async (message) => {
    //         let { event } = JSON.parse(message.data)
    //         if (event === 'ExpensesAnalysis') {
    //             await this.props.MostSpendExpenseAction(context.headerLocationId);
    //             // clientwebsocket.socket.onmessage = async (message) => {
    //             //   let { event } = JSON.parse(message.data)
    //             //   if (event === 'ExpensesAnalysis') {
    //             //     await this.props.listExpenseChart(moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD'),
    //             //       moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),);
    //         }
    //     }
    // }

    // async componentDidUpdate(preProps, preState) {
    //     const context = this.context;
    //     let res = {};

    //     if (this.state.headerLocation !== context.headerLocationId) {
    //         this.setState({headerLocation: context.headerLocationId})
    //         apiCalls(
    //           context.setModalTypeHandler,
    //           context.setLoaderStatusHandler,
    //           this.props.MostSpendExpenseAction(context.headerLocationId)
    //         );
    //     }

    //     if (preProps.most_spend_expense !== this.props.most_spend_expense) {
    //         for (let i of this.props.most_spend_expense) {
    //             for (const [key, value] of Object.entries(i)) {
    //                 res = { ...res, [key]: value === null ? 0 : value }

    //             }
    //         }
    //         this.setState({ chartData: res })
    //     }

    //     if (preProps.inView !== this.props.inView && this.props.isEnabled) {
    //         apiCalls(
    //             context.setModalTypeHandler,
    //             context.setLoaderStatusHandler,
    //             // this.props.listExpenseChart(moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD'),
    //             //     moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),),
    //             this.props.MostSpendExpenseAction(context.headerLocationId),
    //         )
    //     }
    //     if (preProps.isEnabled !== this.props.isEnabled && this.props.isEnabled ) {
    //         apiCalls(
    //             context.setModalTypeHandler,
    //             context.setLoaderStatusHandler,
    //             // this.props.listExpenseChart(moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD'),
    //             //     moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),),
    //             this.props.MostSpendExpenseAction(context.headerLocationId),
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

    // componentWillUnmount(){
    //     clearTimeout(this.state.pollTimer)
    // }


    // pollData = () => {
    //     const context = this.context;
    //     this.props.pollServer(
    //         this.props.MostSpendExpenseAction(context.headerLocationId)
    //     )
    // }

    render() {
        // const { PreFinacialTotal, PreMonthTotal, currentbalance, monthtotal, openingbalance, spending, spendingname, total } = this.state.chartData
        
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
                    title='Most Spending'
                    icon={mostspendingIcon}
                    value={this.props?.data[0]?.amount.toFixed(2) || '0.00'}
                    currencyIcon={true}
                    secondaryText={this.props?.data[0]?.name || ''}
                />
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        expense_chart: state.profitlossReducer.expense_chart || [],
        most_spend_expense:state.profitlossReducer.most_spend_expense || []
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        listExpenseChart: (from, to) => {
            return dispatch(listExpenseChart(from, to));
        },
        MostSpendExpenseAction: (data) => {
            return dispatch(MostSpendExpenseAction(data));
        },
        setDashboardPollingTimerIdsAction : (id) => {
            return dispatch(setDashboardPollingTimerIdsAction(id))
        }
    };
};
export default useCommonRef(connect(mapStateToProps, mapDispatchToProps)(SpendingCard));