import React, {Component} from "react";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import apiCalls from "utils/apiCalls";
import { Card, CardContent, Grid, IconButton, Typography ,Box} from "@mui/material";
import { font14_500 } from "utils/pageSize";
import useCommonRef from "pages/common/home/useCommonRef";
import { connect } from "react-redux";
import { setDashboardPollingTimerIdsAction } from "redux/actions/dashboard_role_actions";
import { assignedCardCountAction } from "redux/actions/asset_actions";
import unAssigned from '../../../assets/dashboardIcons/list.png';
import Cards from '../../dynamicCards/index'
import DashboardTile from "components/DashboardTile";

class AssignedCountCard extends Component {
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
    //         await this.props.assignedCardCountAction(context.headerLocationId)
    //     }
    // }

    // async componentDidUpdate(preProps, preState) {
    //     const context = this.context
    //     let res = {}
    //     if(preProps.assignedCard !== this.props.assignedCard) {
    //         const { count, status } = this.props.assignedCard
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
    //             this.props.assignedCardCountAction(context.headerLocationId)
    //         )
    //     }

    //     if(preProps.inView !== this.props.inView && this.props.isEnabled) {
    //         apiCalls(
    //             context.setModalTypeHandler,
    //             context.setLoaderStatusHandler,
    //             this.props.assignedCardCountAction(context.headerLocationId)
    //         )
    //     }

    //     if((preProps.inViewport !== this.props.inViewport)) {
    //         if(this.props.inViewport === true) {
    //             setTimeout(() => {
    //                 const timer = setInterval(() => this.pollData(), this.props.DASHBOARD_API_POLL_TIMING)
    //                 if(this.props.inViewport === true) {
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
    //         this.props.assignedCardCountAction(context.headerLocationId)
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
              title='Assigned'
              icon={unAssigned}
              value={this.props?.data[0]?.count || 0}
              currencyIcon={false}
            />
          </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        assignedCard : state.AssetReducers.assignedCard || []
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        assignedCardCountAction : () => {
            return dispatch(assignedCardCountAction())
        },
        setDashboardPollingTimerIdsAction : (id) => {
            return dispatch(setDashboardPollingTimerIdsAction(id))
        }
    }
}

export default useCommonRef(connect(mapStateToProps, mapDispatchToProps)(AssignedCountCard))