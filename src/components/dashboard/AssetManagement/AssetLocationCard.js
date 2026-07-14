import { Card, Grid, IconButton, Typography } from "@mui/material"
import NoRecordFound from "components/Layout/NoRecordFound"
import CreateNewButtonContext from "context/CreateNewButtonContext"
import useCommonRef from "pages/common/home/useCommonRef"
import React, { Component } from "react"
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { connect } from "react-redux"
import { assetLocationDashboardAction } from "redux/actions/asset_actions"
import { setDashboardPollingTimerIdsAction } from "redux/actions/dashboard_role_actions"
import apiCalls from "utils/apiCalls"
import activeIcon from '../../../assets/icon/active1.png';
import L from 'leaflet';
import "leaflet/dist/leaflet.css"
import {MAPTILER_TILE_URL, MAPTILER_ATTRIBUTION} from 'shared/constants/MapTiles';

class AssetLocationCard extends Component{
    static contextType = CreateNewButtonContext


    constructor(props){
        super(props)
        this.mapRef = React.createRef()
        this.state = {
            pollTimer: null,
            headerLocation: "null",
            osm:{
                maptiler: {
                    url: MAPTILER_TILE_URL,
                    attribution: MAPTILER_ATTRIBUTION,
                }
            }
        }
    }

    // async componentDidMount(){
    //     const context = this.context
    //     if(this.props.inView && this.props.isEnabled){
    //         await this.props.assetLocationDashboardAction(context.headerLocation)
    //     }
    // }

    // async componentDidUpdate(preProps, preState){
    //     const context = this.context
    //     let res = {}
    //     if(preProps.assetStatusCount !== this.props.assetStatusCount){
    //         this.setState({
    //             chartData: {
    //                 data: this.props.assetStatusCount || []
    //             }
    //         })
    //     }
    //     if(preProps.isEnabled !== this.props.isEnabled && this.props.isEnabled){
    //         apiCalls(
    //             context.setModalTypeHandler,
    //             context.setLoaderStatusHandler,
    //             this.props.assetLocationDashboardAction(context.headerLoactionId)
    //         )
    //     }
    //     if(preProps.inView !== this.props.inView && this.props.isEnabled){
    //         apiCalls(
    //             context.setModalTypeHandler,
    //             context.setLoaderStatusHandler,
    //             this.props.assetLocationDashboardAction(context.headerLoactionId)
    //         )
    //     }
    //     if(preProps.inViewport !== this.props.inViewport){
    //         if(this.props.inViewport === true){
    //             setTimeout(() => {
    //                 const timer = setInterval(() => this.pollData(), this.props.DASHBOARD_API_POLL_TIMING)
    //                 if(this.props.inViewport === true){
    //                     clearTimeout(timer)
    //                 }
    //                 this.props.setDashboardPollingTimerIdsAction(timer)
    //                 this.setState({pollTimer: timer})
    //             }, this.props.DASHBOARD_API_POLL_TIMING)
    //         } else{
    //             clearTimeout(this.state.pollTimer)
    //         }
    //     }
    // }

    // componentWillUnmount(){
    //     clearTimeout(this.state.pollTimer)
    // }

    // pollData = () => {
    //     const context = this.context
    //     this.props.pollServer(
    //         this.props.assetStatusCountAction(context.headerLocationId)
    //     )
    // }

    render(){
        const ActiveIcon = new L.Icon({
            iconUrl: activeIcon,
            iconSize: [20, 23],
            iconAnchor: [17, 35],
            popupAnchor: [3, -46],
          });
        const filteredData = this.props?.data.filter((item) => item.latitude !== null && item.longitude !== null)
        return (
            <>
                <Grid 
                    container
                    ref={(el) => {
                        this.props.ref1(el)
                        this.props.isVisibleRef.current = el
                    }}
                    width='100%'
                    height='100%'
                >
                    <Grid
                        width='100%'
                        height='100%'
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                        <Card style={{width: '100%', height: '100%'}}>
                            <Grid container>
                                <Grid 
                                    container 
                                    display = 'flex' 
                                    justifyContent = 'space-between' 
                                    alignItems = 'center' 
                                    style = {{ 
                                        padding : '18px', 
                                        paddingTop : this.props.mode === 'edit' ? '2px' : '13px' 
                                    }}
                                >
                                    <Typography variant='h6'>ASSET LOCATION</Typography>
                                    
                                    <Grid>
                                        {
                                            this.props.mode === 'edit' ?
                                            <IconButton
                                                aria-label='view code'
                                                onClick={() => this.props.setCardClose()}
                                                size='large'
                                            >
                                                {this.props.isEnabled ? <this.props.VisibilityOffIcon/> : <this.props.VisibilityIcon/>}
                                            </IconButton>
                                            : <></>
                                        }
                                    </Grid>
                                </Grid>

                                <Grid
                                    size={{
                                        lg: 12,
                                        md: 12,
                                        sm: 12,
                                        xs: 12
                                    }}>
                                    <Card sx={{width: '100%', height: '70%'}}>
                                        <MapContainer center={[12.9909, 80.21845]} zoom={10} scrollWheelZoom={true} ref={this.mapRef} style={{zIndex: 0, height: '300px', width: '100%'}}>
                                            <TileLayer
                                                url={this.state.osm.maptiler.url}
                                                attribution={this.state.osm.maptiler.attribution}
                                            />
                                            {
                                                this.props?.data?.length > 0 && filteredData.map(({latitude, longitude, assetCode, assetName, count}, index) => (
                                                    <Marker icon={ActiveIcon} key={index} position={[latitude, longitude]}>
                                                        <Popup>
                                                            {assetName}<br/>{assetCode}
                                                        </Popup>
                                                    </Marker>
                                                ))
                                            }
                                        </MapContainer>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Card>
                    </Grid>
                </Grid>
            </>
        );
    }
}

const mapStateToProps =  (state) => {
    return{
        assetLocationDashboard: state.AssetReducers.assetLocationDashboard || []
    }
}

const mapDispatchToProps = (dispatch) => {
    return{
        assetLocationDashboardAction: () => {
            return dispatch(assetLocationDashboardAction())
        },
        setDashboardPollingTimerIdsAction: (id) => {
            return dispatch(setDashboardPollingTimerIdsAction(id))
        }
    }
}

export default useCommonRef(connect(mapStateToProps, mapDispatchToProps)(AssetLocationCard))
