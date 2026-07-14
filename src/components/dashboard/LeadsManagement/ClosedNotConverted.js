import React, {Component} from "react";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import apiCalls from "utils/apiCalls";
import DashboardTile from "components/DashboardTile";
import { ClosedNotconvertedLeadsAction } from "redux/actions/leadManagement_actions";
import { setDashboardPollingTimerIdsAction } from "redux/actions/dashboard_role_actions";
import useCommonRef from "pages/common/home/useCommonRef";
import { connect } from "react-redux";
import NotConverted from '../../../assets/dashboardIcons/notConverted.svg'


class ClosedNotConvertedCard extends Component {
    static contextType = CreateNewButtonContext

    constructor(props) {
        super(props)
        this.state = {
            chartData : {
                count : 0,
                status : 0,
                style : window.matchMedia("(min-width : 1024px)").matches
            },
            pollTimer : null,
            headerLocation : 'null'
        }
    }

    // async componentDidMount() {
    //     const context = this.context
    //     if(this.props.inView && this.props.isEnabled) {
    //         await this.props.ClosedNotconvertedLeadsAction(context.headerLocationId)
    //     }
    // }

    // async componentDidUpdate(preProps) {
    //     const context = this.context
    //     if(preProps.getClosedNotconvertedLeads !== this.props.getClosedNotconvertedLeads) {
    //         const { count, status } = this.props.getClosedNotconvertedLeads
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
    //             this.props.ClosedNotconvertedLeadsAction(context.headerLocationId)
    //         )
    //     }

    //     if(preProps.inView !== this.props.inView && this.props.isEnabled) {
    //         apiCalls(
    //             context.setModalTypeHandler,
    //             context.setLoaderStatusHandler,
    //             this.props.ClosedNotconvertedLeadsAction(context.headerLocationId)
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
    //                 this.setState({ pollTimer : timer })
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
    //         this.props.ClosedNotconvertedLeadsAction(context.headerLocationId)
    //     )
    // }

    render() {

        return (
            <div
                ref = {(el) => {
                    this.props.ref1(el)
                    this.props.isVisibleRef.current = el
                }}
                style = {{ width : '100%' }}
            >
                <DashboardTile 
                    {...this.props}
                    title = 'Closed Not Converted'
                    icon = {NotConverted}
                    value = {this.props.data?.[0]?.closedNotConvertedLeadsCount || 0}
                />
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        getClosedNotconvertedLeads : state.leadManagementReducers.getClosedNotconvertedLeads || []
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        ClosedNotconvertedLeadsAction : () => {
            return dispatch(ClosedNotconvertedLeadsAction())
        },
        setDashboardPollingTimerIdsAction : (id) => {
            return dispatch(setDashboardPollingTimerIdsAction(id))
        }
    }
}

export default useCommonRef(connect(mapStateToProps, mapDispatchToProps)(ClosedNotConvertedCard))