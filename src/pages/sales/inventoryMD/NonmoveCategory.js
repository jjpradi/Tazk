import React from 'react';
import {
  Grid,
  IconButton,
  Tooltip,
  Card,
  Button,
  Typography,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
  TextField
} from '@mui/material';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ReactApexChart from 'react-apexcharts';
import {listInvManageAction} from '../../../redux/actions/inventory_actions';
import {connect} from 'react-redux';
import _ from 'lodash';
import context from '../../../context/CreateNewButtonContext';
import {allListStockLocation, listStockLocationSequenceAction} from '../../../redux/actions/stock_Location_actions'
import apiCalls from 'utils/apiCalls';
import { headerStyle } from 'utils/pageSize';
import CloseIcon from '@mui/icons-material/Close';
import useCommonRef from "../../../pages/common/home/useCommonRef";
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import {clientwebsocket } from '../../../http-common'


const style = {
  width: '100%',
  maxWidth: 360,
  bgcolor: 'background.paper',
};

class NonmoveCategory extends React.Component {
  static contextType = context;
  constructor(props) {
    super(props);

    this.state = {
      computedData: [],
      formValues:{
        location_id : 'null',
        dataLimit   : 10,
        dateDiff    : 15
      },
      data: [],
      pollTimer : null
    };
  }

  componentDidMount() {
    this.setState({
      data : this.props.data.length > 0 ? this.props.data[0].data : []
  })
    // if(this.props.inView && this.props.isEnabled ){
      // this.props.listInvManageAction(
      //   {...this.state.formValues,employee_id:this.context.commoncookie},
      //   this.context.setModalTypeHandler,
      //   this.context.setLoaderStatusHandler,
      // );
      this.props.allListStockLocation(
        // {sequence_type: 'SO'},
        this.context.setModalTypeHandler,
        this.context.setLoaderStatusHandler,
        // this.context.commoncookie,
        // this.context.headerLocationId,
      );
    // }

    // clientwebsocket.socket.onmessage = async(message) => {
    //   let{event}=JSON.parse(message.data)
    //  if(event ==='purchases'){
    //   this.props.listInvManageAction(
    //     {...this.state.formValues,employee_id:this.context.commoncookie},
    //     this.context.setModalTypeHandler,
    //     null,
    //   );
    //   this.props.listStockLocationSequenceAction(
    //     {sequence_type: 'SO'},
    //     null,
    //     this.context.commoncookie,
    //     this.context.headerLocationId,
    //   );
    //    }
    // }
  }

  componentDidUpdate = (preProps,preState) => { 

    if(preState.formValues !== this.state.formValues && this.props.isEnabled){
      apiCalls(
        this.context.setModalTypeHandler,
        this.context.setLoaderStatusHandler,
        this.props.listInvManageAction(
          {...this.state.formValues,employee_id:this.context.commoncookie},
          this.context.setModalTypeHandler,
          this.context.setLoaderStatusHandler, (response) => {
            if(response.status === 200){
              this.setState({
                data : response.data
            })
            }
          }
        )
      );
    }


    if(preProps.inView !== this.props.inView && this.props.isEnabled){

      apiCalls(
        // this.context.setModalTypeHandler,
        // this.context.setLoaderStatusHandler,
        // this.props.listInvManageAction(
        //   {...this.state.formValues,employee_id:this.context.commoncookie},
        //   this.context.setModalTypeHandler,
        //   this.context.setLoaderStatusHandler,
        // ),
        this.props.allListStockLocation(
          // {sequence_type: 'SO'},
          this.context.setModalTypeHandler,
          this.context.setLoaderStatusHandler,
          // this.context.commoncookie,
          // this.context.headerLocationId,
        ),
      )
    }
    if(preProps.isEnabled !== this.props.isEnabled && this.props.isEnabled){

      apiCalls(
        // this.context.setModalTypeHandler,
        // this.context.setLoaderStatusHandler,
        // this.props.listInvManageAction(
        //   {...this.state.formValues,employee_id:this.context.commoncookie},
        //   this.context.setModalTypeHandler,
        //   this.context.setLoaderStatusHandler,
        // ),
        this.props.allListStockLocation(
          // {sequence_type: 'SO'},
          this.context.setModalTypeHandler,
          this.context.setLoaderStatusHandler,
          // this.context.commoncookie,
          // this.context.headerLocationId,
        ),
      )
    }

  //   if((preProps.inViewport !== this.props.inViewport)){
  //     if(this.props.inViewport === true){
         
  //         setTimeout(() => {
  //             const timer = setInterval(() => this.pollData(), this.props.DASHBOARD_API_POLL_TIMING)
  //             if(this.props.inViewport === false){
  //                 clearTimeout(timer)
  //             }
  //             this.props.setDashboardPollingTimerIdsAction(timer)
  //             this.setState({pollTimer : timer})
  //         },this.props.DASHBOARD_API_POLL_TIMING)
          

  //     }else{
  //         clearTimeout(this.state.pollTimer)
  //     }

  // }

  }

  calculateDays(date) {
    var today = new Date();
    let checkDate = new Date(date);
    const diffTime = Math.abs(checkDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  componentWillUnmount() {
      clearTimeout(this.state.pollTimer);
  }

  // pollData = () => {
  //     this.props.pollServer(
  //       this.props.listInvManageAction(
  //         {...this.state.formValues,employee_id:this.context.commoncookie},
  //         this.context.setModalTypeHandler,
  //         this.context.setLoaderStatusHandler,
  //       ),
  //       this.props.listStockLocationSequenceAction(
  //         {sequence_type: 'SO'},
  //         this.context.setLoaderStatusHandler,
  //         this.context.commoncookie,
  //         this.context.headerLocationId,
  //       ),
  //     );
  // };


  render() {
       const {formValues} = this.state;
      //  console.log(this.state.data,"sdfnfjfn");
       
    return (
      // <div ref={this.props.ref1} style={{width: '100%'}}>
      //  </div>
      <Card
        ref={(el) => {
          this.props.ref1(el); 
          this.props.isVisibleRef.current = el
      }}
      variant='outlined' 
      sx={{ width: '100%',height:'100%'}}>
        {/* top container */}
        {/* Brand sales  */}
        {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} >
        
                <List sx={style} component="nav" aria-label="mailbox folders">
                <Typography variant="body1">
                        Age wise Payables
                    </Typography>
                </List>
                <Divider/>
                
           </Grid> */}
        {/* <Grid container spacing={5} style={{
            display: 'flex',
            // justifyContent: 'space-between',
            // alignItems: 'center',
          }}> */}
        {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}> */}
        <Grid container style={{
          display: 'flex',
          justifyContent : 'space-between',
          alignItems: 'center',
          padding : '17px',
          paddingTop : this.props.mode === 'edit' ? '0px' : '12px'
        }}>
          <Grid>
           <Typography variant='h6'>{`Non-Moving Inventory Category`}</Typography>
          </Grid>
        
        <Grid>
          <Grid container spacing={2}
            sx={{ 
              display: "flex", 
              justifyContent: "flex-end", 
              alignItems: "center",
            }}
          >
          <Grid style={{ minWidth : '150px' }}>
          <FormControl fullWidth
            sx = {{
              '& .MuiOutlinedInput-root': {
                borderRadius : '10px !important',
                backgroundColor : '#f7f7f7 !important',
                color : '#808080',
                height : '25px'
              },
              '& .MuiOutlinedInput-notchedOutline': {
                border: "none !important"
              },
              '& .MuiMenuItem-root' : {
                color : 'none !important'
              }
            }}
          >
            {/* <InputLabel  id='demo-select-small' sx={{fontSize:headerStyle.fontSize}} >
              Date Difference
            </InputLabel> */}
            <Select
               labelId='demo-select-small'
               id='demo-select-small'
              label='DateDifference'
              fullWidth={true}
              size='small'
              value={this.state.formValues.dateDiff}
              onChange={(e) => {
                this.setState({formValues:{...this.state.formValues,dateDiff:e.target.value}})
              }}
            >
              <MenuItem value={15}>More Than 15 Days</MenuItem>
              <MenuItem value={30}>More Than 30 Days</MenuItem>
              <MenuItem value={90}>More Than 90 Days</MenuItem>
            </Select>
          </FormControl>
          </Grid>

          <Grid style={{ minWidth : '150px' }}>
          <FormControl fullWidth
            sx = {{
              '& .MuiOutlinedInput-root': {
                borderRadius : '10px !important',
                backgroundColor : '#f7f7f7 !important',
                color : '#808080',
                height : '25px'
              },
              '& .MuiOutlinedInput-notchedOutline': {
                border: "none !important"
              },
              '& .MuiMenuItem-root' : {
                color : 'none !important'
              }
            }}
          >
            {/* <InputLabel id='demo-select-small' sx={{fontSize:headerStyle.fontSize}} >
               Data Limit
            </InputLabel> */}
            <Select
              labelId='demo-select-small'
              id='demo-select-small'
              label='DataLimit'
              fullWidth={true}
              size='small'
              value={this.state.formValues.dataLimit}
              onChange={(e) => {
                this.setState({formValues:{...this.state.formValues,dataLimit:e.target.value}})
              }}
            >
              <MenuItem value={10}>Data Limit 10</MenuItem>
              <MenuItem value={20}>Data Limit 20</MenuItem>
              <MenuItem value={50}>Data Limit 50</MenuItem>
            </Select>
          </FormControl>
          </Grid>

          <Grid style={{ minWidth : '150px' }}>
          <FormControl fullWidth
            sx = {{
              '& .MuiOutlinedInput-root': {
                borderRadius : '10px !important',
                backgroundColor : '#f7f7f7 !important',
                color : '#808080',
                height : '25px'
              },
              '& .MuiOutlinedInput-notchedOutline': {
                border: "none !important"
              },
              '& .MuiMenuItem-root' : {
                color : 'none !important'
              }
            }}
          >
            {/* <InputLabel>Location</InputLabel> */}
            <Select
              // multiple
              size='small'
              value={formValues.location_id}
              onChange={(e) => {
                this.setState({
                  formValues: {
                    ...this.state.formValues,
                    location_id: e.target.value
                  },
                });
              }}
              // renderValue={(selected) => 
              //   this.props.stocklocation
              //     .filter((location) => selected.includes(location.location_id))
              //     .map((location) => location.location_name)
              //     .join(', ')
              // }
            >
              <MenuItem value='null'>All Location</MenuItem>
              {
                this.props.allliststocklocation?.length > 0 ? (
                  this.props.allliststocklocation?.map((location) => (
                    <MenuItem key={location.location_id} value={location.location_id}>
                      {location.location_name}
                    </MenuItem>
                 ))
                ) : (
                  <MenuItem value='null'></MenuItem>
                )
              }
            </Select>
          </FormControl>
          </Grid>
          

            {
              this.props.mode === 'edit' &&
              <Grid
                sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                <IconButton
                    aria-label='view code'
                    onClick={() => this.props.setCardClose()}
                    size='large'
                    >
                    {this.props.isEnabled ?  <this.props.VisibilityOffIcon /> : <this.props.VisibilityIcon />} 
                </IconButton>
              </Grid>
            }
          </Grid>
          </Grid>
          </Grid>
        {/* </Grid> */}
        <Grid
          style={{ padding: '20px', paddingTop : '0px'}}
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>      
            <div 
              style = {{ 
                maxHeight : '350px', 
                overflowY : 'hidden',
                overflowX : 'hidden',
                position : 'relative'
              }}
              onMouseEnter = {(e) => {
                e.currentTarget.style.overflowY = this.state.formValues.dataLimit === 10 ? 'hidden' : 'auto'
                e.currentTarget.style.overflowX = 'hidden'
              }}
              onMouseLeave = {(e) => e.currentTarget.style.overflowY = 'hidden'}
            >
              <ReactApexChart
                options={{
                  chart: {
                    type: 'bar',
                    // height: 350,
                    stacked: true,
                    toolbar: {
                      show: true,
                      tools:{
                        download:false // <== line to add
                      }
                    }
                  },
                  dataLabels: {
                    enabled: true,
                    enabledOnSeries: undefined,
                    formatter: function (val, opts) {
                      return val;
                    },
                    style: {
                      fontSize: "11px",
                      // fontWeight: "bold",
                      colors: ["#000000"],
                    }
                  },
                  plotOptions: {
                    bar: {
                      horizontal: true,
                      barHeight : '90%'
                    },
                  },
                  stroke: {
                    width: 1,
                    colors: ['#fere'],
                  },
                  // title: {
                  //   text: 'Fiction Books Sales'
                  // },
                  xaxis: {
                    categories: _.map(this.state.data, 'product_name'),

                    // labels: {
                    //   formatter: function (val) {
                    //     return val + "K"
                    //   }
                    // }
                  },
                  yaxis: {
                    title: {
                      text: undefined,
                    },
                  },
                  tooltip: {
                    y: {
                      formatter: function (val) {
                        return val + 'Days';
                      },
                    },
                  },
                  fill: {
                    opacity: 1,
                  },
                  legend: {
                    position: 'top',
                    horizontalAlign: 'left',
                    offsetX: 40,
                  },
                }}
                series={[
                  {
                    name: 'Non-Moving Product',
                    data: _.map(this.state.data, 'transDateDiff'),
                  },
                ]}
                type='bar'
                // height={350}
                height={Math.max(320, this.state.data.length * 33)}
              />
              </div>
          </Grid>
        {/* </Grid> */}
      </Card>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    NonmoveCategory: state.inventoryReducer.NonmoveCategory,
    stocklocation : state.stockLocationReducer.stocklocation,
    allliststocklocation : state.stockLocationReducer.allliststocklocation
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    listInvManageAction: (
       data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      response
    ) => {
      return dispatch(
        listInvManageAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          response
        ),
      );
    },
    allListStockLocation : (setModalTypeHandler, setLoaderStatusHandler) =>{
      return dispatch(allListStockLocation(setModalTypeHandler, setLoaderStatusHandler))
    },
    setDashboardPollingTimerIdsAction : (id) => {
      return dispatch(setDashboardPollingTimerIdsAction(id))
  }
  };
};

export default useCommonRef(connect(mapStateToProps, mapDispatchToProps)(NonmoveCategory));
