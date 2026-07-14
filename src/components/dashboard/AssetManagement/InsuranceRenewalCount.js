import React, {Component} from "react";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import apiCalls from "utils/apiCalls";
import { insuranceRenewalCountCardAction } from "redux/actions/insurance_actions";
import { setDashboardPollingTimerIdsAction } from "redux/actions/dashboard_role_actions";
import useCommonRef from "pages/common/home/useCommonRef";
import { connect } from "react-redux";
import { Box, Card, CardContent, Grid, IconButton, Typography } from "@mui/material";
import assigned from '../../../assets/dashboardIcons/assigned.jpg';
import { font14_500 } from "utils/pageSize";
import Cards from '../../dynamicCards/index';
import DashboardTile from "components/DashboardTile";

class InsuranceRenewalCountCard extends Component {
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
    //         await this.props.insuranceRenewalCountCardAction(context.headerLocationId)
    //     }
    // }

    // async componentDidUpdate(preProps, preState) {
    //     const context = this.context
    //     let res = {}
    //     if(preProps.insuranceReNewalCard !== this.props.insuranceReNewalCard) {
    //         const { count, status } = this.props.insuranceReNewalCard
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
    //             this.props.insuranceRenewalCountCardAction(context.headerLocationId)
    //         )
    //     }

    //     if(preProps.inView !== this.props.inView && this.props.isEnabled) {
    //         apiCalls(
    //             context.setModalTypeHandler,
    //             context.setLoaderStatusHandler,
    //             this.props.insuranceRenewalCountCardAction(context.headerLocationId)
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
    //         this.props.insuranceRenewalCountCardAction(context.headerLocationId)
    //     )
    // }

    render() {
        const { count, status } = this.state.chartData

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
              title='Insurance Renewal'
              icon={assigned}
              value={this.props?.data[0]?.count || 0}
              currencyIcon={false}
            />
          </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        insuranceReNewalCard : state.InsuranceReducers.insuranceReNewalCard || []
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        insuranceRenewalCountCardAction : () => {
            return dispatch(insuranceRenewalCountCardAction())
        },
        setDashboardPollingTimerIdsAction : (id) => {
            return dispatch(setDashboardPollingTimerIdsAction(id))
        }
    }
}

export default useCommonRef(connect(mapStateToProps, mapDispatchToProps)(InsuranceRenewalCountCard))