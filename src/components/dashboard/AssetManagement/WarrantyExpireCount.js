import React, { Component } from 'react';
import {  Typography,  IconButton,Box, Card, CardContent, Grid } from '@mui/material';
import expired from '../../../assets/dashboardIcons/Expired.jpg';
import { connect } from 'react-redux';
import Cards from '../../dynamicCards/index'
import useCommonRef from "../../../pages/common/home/useCommonRef";
import apiCalls from 'utils/apiCalls';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import { listwarrantyAction } from 'redux/actions/asset_actions';
import DashboardTile from 'components/DashboardTile';
class WarrantyExpireCount extends Component {
    static contextType = CreateNewButtonContext;
    constructor(props) {
        super(props);
        var date = new Date();
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
    //         await  this.props.listwarrantyAction(context.headerLocationId);
    //     }
       
    // }

    // async componentDidUpdate(preProps, preState) {
    //     const context = this.context;
    //     let res = {};

    //     if (preProps.getwarrantData !== this.props.getwarrantData) {
    //         const { count, status } = this.props.getwarrantData;
    //         this.setState({
    //             chartData: {
    //                 count: count || 0,
    //                 status: status || 0,
    //                 // other properties
    //             }
    //         });
    //     }

    //     if (preProps.isEnabled !== this.props.isEnabled  && this.props.isEnabled ) {
    //         apiCalls(
    //           context.setModalTypeHandler,
    //           context.setLoaderStatusHandler,
    //           this.props.listwarrantyAction(context.headerLocationId)
    //         );
    //       }

    //     if (preProps.inView !== this.props.inView && this.props.isEnabled) {
    //         apiCalls(
    //             context.setModalTypeHandler,
    //             context.setLoaderStatusHandler,
    //             this.props.listwarrantyAction(context.headerLocationId),
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
    //         this.props.listwarrantyAction(context.headerLocationId)
    //         );
    // };

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
              title='Expired Warranty'
              icon={expired}
              value={this.props?.data[0]?.expired || 0}
              currencyIcon={false}
            />
          </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        getwarrantData: state.AssetReducers.getwarrantData || [],
        
    };
};

const mapDispatchToProps = (dispatch) => {
    let data ={
        dashboard : "dashboard"
    }
    return {
        listwarrantyAction: () => {
            return dispatch(listwarrantyAction(data));
        },
        setDashboardPollingTimerIdsAction : (id) => {
            return dispatch(setDashboardPollingTimerIdsAction(id))
        }
    };
};
export default useCommonRef(connect(mapStateToProps, mapDispatchToProps)(WarrantyExpireCount));		