import React, {Component} from "react";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import { convertedLeadsCountAction } from "redux/actions/leadManagement_actions";
import apiCalls from "utils/apiCalls";
import LeadsConverted from '../../../assets/dashboardIcons/LeadsConverted.svg'
import { setDashboardPollingTimerIdsAction } from "redux/actions/dashboard_role_actions";
import useCommonRef from "pages/common/home/useCommonRef";
import { connect } from "react-redux";
import DashboardTile from "components/DashboardTile";

class ConvertedLeadsCountCard extends Component {
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
    //         await this.props.convertedLeadsCountAction(context.headerLocationId)
    //     }
    // }

    // async componentDidUpdate(preProps, preState) {
    //     const context = this.context
    //     let res = {}
    //     if(preProps.convertedLeadsCard !== this.props.convertedLeadsCard) {
    //         const { count, status } = this.props.convertedLeadsCard
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
    //             this.props.convertedLeadsCountAction(context.headerLocationId)
    //         )
    //     }

    //     if(preProps.inView !== this.props.inView && this.props.isEnabled) {
    //         apiCalls(
    //             context.setModalTypeHandler,
    //             context.setLoaderStatusHandler,
    //             this.props.convertedLeadsCountAction(context.headerLocationId)
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
    //         this.props.convertedLeadsCountAction(context.headerLocationId)
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
                    title = 'Closed Converted'
                    icon = {LeadsConverted}
                    value = {this.props.data?.[0]?.convertedLeadsCount || 0}
                    currencyIcon = {false}
                />
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        convertedLeadsCard : state.leadManagementReducers.convertedLeadsCard || []
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        convertedLeadsCountAction : () => {
            return dispatch(convertedLeadsCountAction())
        },
        setDashboardPollingTimerIdsAction : (id) => {
            return dispatch(setDashboardPollingTimerIdsAction(id))
        }
    }
}

export default useCommonRef(connect(mapStateToProps, mapDispatchToProps)(ConvertedLeadsCountCard))