import React, {Component} from "react";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import apiCalls from "utils/apiCalls";
import { Card, CardContent, Grid, IconButton, Typography ,Box} from "@mui/material";
import cahinhandIcon from '../../../assets/dashboardIcons/money.svg';
import { font14_500 } from "utils/pageSize";
import { assetYearValueAction } from "redux/actions/asset_actions";
import useCommonRef from "pages/common/home/useCommonRef";
import { connect } from "react-redux";
import { setDashboardPollingTimerIdsAction } from "redux/actions/dashboard_role_actions";
import Cards from '../../dynamicCards/index'
import { CurrencyRupeeIcon } from "pages/routesIcons";
import DashboardTile from "components/DashboardTile";

class TotalYearValueCard extends Component {
    static contextType = CreateNewButtonContext;

    constructor(props) {
        super(props)
        this.state = {
            chartData : {
                count : 0,
                status : 0,
                style : window.matchMedia("(min-width : 1024px)").matches
            },
            pollTimer : null,
            headerLocation : "null"
        }
    }

    // async componentDidMount() {
    //     const context = this.context
    //     if(this.props.inView && this.props.isEnabled) {
    //         await this.props.assetYearValueAction(context.headerLocationId)
    //     }
    // }

    // async componentDidUpdate(preProps, preState) {
    //     const context = this.context
    //     let res = {}
    //     if(preProps.totalYearValueCard !== this.props.totalYearValueCard) {
    //         const { count, status } = this.props.totalYearValueCard
    //         this.setState({
    //             chartData : {
    //                 count : count || 0,
    //                 status : status || 0
    //             }
    //         })
    //     }

    //     if(preProps.isEnabled !== this.props.isEnabled && this.props.isEnabled) {
    //         apiCalls(
    //             context.setModalTypeHandler,
    //             context.setLoaderStatusHandler,
    //             this.props.assetYearValueAction(context.headerLocationId)
    //         )
    //     }

    //     if(preProps.inView !== this.props.inView && this.props.isEnabled) {
    //         apiCalls(
    //             context.setModalTypeHandler,
    //             context.setLoaderStatusHandler,
    //             this.props.assetYearValueAction(context.headerLocationId)
    //         )
    //     }

    //     if((preProps.inViewport !== this.props.inViewport)) {
    //         if(this.props.inViewport === true) {
    //             setTimeout(() => {
    //                 const timer = setInterval(() => this.pollData(), this.props.DASHBOARD_API_POLL_TIMING)
    //                 if(this.props.inViewport === false) {
    //                     clearTimeout(timer)
    //                 }
    //                 this.props.setDashboardPollingTimerIdsAction(timer)
    //                 this.setState({pollTimer : timer})
    //             }, this.props.DASHBOARD_API_POLL_TIMING)
    //         }
    //         else {
    //             clearTimeout(this.state.pollTimer)
    //         }
    //     }
    // }

    // componentWillUnmount() {
    //     clearTimeout(this.state.pollTimer)
    // }

    // pollData = () => {
    //     const context = this.context
    //     this.props.pollServer(
    //         this.props.assetYearValueAction(context.headerLocationId)
    //     )
    // }

    render() {

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
            title='Asset Value In Fiscal Year'
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
        totalYearValueCard : state.AssetReducers.totalYearValueCard || []
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        assetYearValueAction : () => {
            return dispatch(assetYearValueAction())
        },
        setDashboardPollingTimerIdsAction : (id) => {
            return dispatch(setDashboardPollingTimerIdsAction(id))
        }
    }
}

export default useCommonRef(connect(mapStateToProps, mapDispatchToProps)(TotalYearValueCard))