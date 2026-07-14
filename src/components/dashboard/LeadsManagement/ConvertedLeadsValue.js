import React, {Component} from "react";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import { convertedLeadsValueAction } from "redux/actions/leadManagement_actions";
import apiCalls from "utils/apiCalls";
import LeadsConvertedValue from '../../../assets/dashboardIcons/LeadConvertedValue.svg';
import useCommonRef from "pages/common/home/useCommonRef";
import { connect } from "react-redux";
import { setDashboardPollingTimerIdsAction } from "redux/actions/dashboard_role_actions";
import DashboardTile from "components/DashboardTile";

class ConvertedLeadsValueCard extends Component {
    static contextType = CreateNewButtonContext

    constructor(props) {
        super(props)
        this.state = {
            chartDate : {
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
    //         await this.props.convertedLeadsValueAction(context.headerLocationId)
    //     }
    // }

    // async componentDidUpdate(preProps, preState) {
    //     const context = this.context
    //     let res = {}
    //     if(preProps.convertedLeadsValueCard !== this.props.convertedLeadsValueCard) {
    //         const { count, status } = this.props.convertedLeadsValueCard
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
    //             this.props.convertedLeadsValueAction(context.headerLocationId)
    //         )
    //     }

    //     if(preProps.inView !== this.props.inView && this.props.isEnabled) {
    //         apiCalls(
    //             context.setModalTypeHandler,
    //             context.setLoaderStatusHandler,
    //             this.props.convertedLeadsValueAction(context.headerLocationId)
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
    //         this.props.convertedLeadsValueAction(context.headerLocationId)
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
                    title = 'Converted Leads Value'
                    icon = {LeadsConvertedValue}
                    value = {this.props.data?.[0]?.convertedLeadsValue || 0}
                    currencyIcon = {true}
                />
            </div>
        )
    }
}


const mapStateToProps = (state) => {
    return {
        convertedLeadsValueCard : state.leadManagementReducers.convertedLeadsValueCard || []
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        convertedLeadsValueAction : () => {
            return dispatch(convertedLeadsValueAction())
        },
        setDashboardPollingTimerIdsAction : (id) => {
            return dispatch(setDashboardPollingTimerIdsAction(id))
        }
    }
}

export default useCommonRef(connect(mapStateToProps, mapDispatchToProps)(ConvertedLeadsValueCard))