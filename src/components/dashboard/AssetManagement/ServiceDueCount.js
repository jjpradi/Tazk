import React, {Component} from "react";
import { Card, CardContent, Grid, IconButton, Typography ,Box} from "@mui/material";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import { setDashboardPollingTimerIdsAction } from "redux/actions/dashboard_role_actions";
import serviceDue from '../../../assets/dashboardIcons/serviceDue.jpg';
import apiCalls from "utils/apiCalls";
import { font14_500 } from "utils/pageSize";
import useCommonRef from "pages/common/home/useCommonRef";
import { connect } from "react-redux";
import { serviceDueCardCountAction } from "redux/actions/serviceDue_actions";
import Cards from '../../dynamicCards/index'
import DashboardTile from "components/DashboardTile";

class ServiceDueCountCard extends Component {
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
    //         await this.props.serviceDueCardCountAction(context.headerLocationId)
    //     }
    // }

    // async componentDidUpdate(preProps, preState) {
    //     const context = this.context
    //     let res = {}
    //     if(preProps.serviceDueCard !== this.props.serviceDueCard) {
    //         const { count, status } = this.props.serviceDueCard
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
    //             this.props.serviceDueCardCountAction(context.headerLocationId)
    //         )
    //     }

    //     if(preProps.inView !== this.props.inView && this.props.isEnabled) {
    //         apiCalls(
    //             context.setModalTypeHandler,
    //             context.setLoaderStatusHandler,
    //             this.props.serviceDueCardCountAction(context.headerLocationId)
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
    //         this.props.serviceDueCardCountAction(context.headerLocationId)
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
              title='Service Due'
              icon={serviceDue}
              value={this.props?.data[0]?.count || 0}
              currencyIcon={false}
            />
          </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        serviceDueCard : state.ServiceDueReducers.serviceDueCard || []
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        serviceDueCardCountAction : () => {
            return dispatch(serviceDueCardCountAction())
        },
        setDashboardPollingTimerIdsAction : (id) => {
            return dispatch(setDashboardPollingTimerIdsAction(id))
        }
    }
}


export default useCommonRef(connect(mapStateToProps, mapDispatchToProps)(ServiceDueCountCard))