import React, {useEffect, useState, useRef, useContext} from 'react';
import ReactApexChart from 'react-apexcharts';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import {connect} from 'react-redux';
import {getAllCustomerAction} from '../../../redux/actions/customer_actions';
import {Grid, IconButton, Typography} from '@mui/material';
import {useSelector, useDispatch} from 'react-redux';
import context from '../../../context/CreateNewButtonContext';
import {useInView} from 'react-intersection-observer';
import apiCalls from 'utils/apiCalls';
import { cellStyle, font14_500 } from 'utils/pageSize';
import useCommonRef from "../../../pages/common/home/useCommonRef";
import CloseIcon from '@mui/icons-material/Close';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

function ApexChart(props) {
  const dispatch = useDispatch();
  const {
    customerReducer: {Get_all_customer},
  } = useSelector((state) => state);
  const [pollTimer, setPollTimer] = useState(null)

  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(context);

  // const {ref, inView, entry} = useInView({
  //   threshold: 0,
  //   triggerOnce: true,
  // });

  const theme = useTheme();
const large = useMediaQuery(theme.breakpoints.up('lg'));

  // useEffect(() => {
  //   if (props.inView && props.isEnabled) {
  //     apiCalls(
  //       setModalTypeHandler,
  //       setLoaderStatusHandler,
  //       dispatch(getAllCustomerAction(setModalTypeHandler, setLoaderStatusHandler))
  //     );

  //   }
  // }, [props.inView , props.isEnabled]);

  // useEffect(() => {
  //   if (props.inViewport === true) {
  //     setTimeout(() => {
  //       const timer = setInterval(() => pollData(), props.DASHBOARD_API_POLL_TIMING);
  //       if (props.inViewport === false) {
  //         clearTimeout(timer);
  //       }
  //       dispatch(setDashboardPollingTimerIdsAction(timer));
  //       setPollTimer(timer );
  //     }, props.DASHBOARD_API_POLL_TIMING);

  //   } else {
  //     clearTimeout(pollTimer);
  //   }

  //   return () => clearTimeout(pollTimer);
    
  // }, [props.inViewport]);

  // const pollData = () => {
  //   props.pollServer(
  //     dispatch(getAllCustomerAction(setModalTypeHandler, setLoaderStatusHandler))
  //   );
  // }

  const [series, setSeries] = useState([
    {
      name: 'Customers',
      data: props.data.map((f) => f.customer_count),
    },
  ]);

  const [options, setOptions] = useState({
    chart: {
      // height: 350,
      type: 'line',
      zoom: {
        enabled: false,
      },
      fontFamily: 'Poppins, sans-serif',
      toolbar: {
        show: false,
      }
    },
    yaxis: {
      title: {
        text: 'Customers',
        style:{fontSize:cellStyle.fontSize , fontWeight : cellStyle.fontWeight}
      },
      //     min: 5,
      //     max: 40
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
    },
    // title: {
    //   text: 'Customer Growth : Last Six Months',
    //   align: 'left',
    // },
    grid: {
      row: {
        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
        opacity: 0.5,
      },
    },
    xaxis: {
      categories: props.data.map((f) => f.Date),
    },
    markers: {
      size: 7,
      colors: '#fff',
      strokeColors: '#26a0fc',
      strokeWidth: 4,
      strokeOpacity: 0.9,
      strokeDashArray: 0,
      fillOpacity: 1,
      discrete: [],
      shape: 'circle',
      radius: 2,
      offsetX: 0,
      offsetY: 0,
      onClick: undefined,
      onDblClick: undefined,
      showNullDataPoints: true,
      hover: {
        size: undefined,
        sizeOffset: 3,
      },
    },
  });

  useEffect(() => {
    setSeries([
      {
        name: 'Customers',
        data: props.data.map((f) => f.customer_count),
      },
    ]);

    setOptions({
      ...options,
      xaxis: {categories: props.data.map((f) => f.Date)},
    });
  }, [props.data]);

  const GetTotal = (date) => {
    let total = '';
    props.data.forEach((data) => {
      if (data) {
        // data.forEach(val => {
        if (data.Date < date) total = data.Date;
        // })
      }
    });
    return total;
  };

  return (
    <Card
      variant='outlined'
      ref={(el) => {
        props.ref1(el)
        props.isVisibleRef.current = el
      }}
      sx={{width: '100%',height:'100%' }}>
      <Grid container 
        display='flex' 
        flexDirection='row' 
        alignItems='center' 
        style={{ 
          padding : '18px', 
          paddingTop : props.mode === 'edit' ? '3px' : '13px' 
        }}
      >
      <Grid
        size={{
          xs: 10,
          md: 11,
          lg: 11.5,
          sm: 11
        }}>
        <Typography className='dashboard-card-title' variant='h6'>
            Customer Growth : Last Six Months
          </Typography>
        </Grid>
        <Grid
          sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}
          size={{
            xs: 2,
            md: 1,
            sm: 1,
            lg: 0.5
          }}>
          {
            props.mode === 'edit' ? 
            <IconButton
                aria-label='view code'
                onClick={() => props.setCardClose()}
                size='large'
                >
                {props.isEnabled ?  <props.VisibilityOffIcon /> : <props.VisibilityIcon />} 
            </IconButton>
            :
            ''
          }
        </Grid>
        </Grid>
      <Grid container display='flex' flexDirection='row' alignItems='center'>
      <Grid
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <ReactApexChart
          options={options}
          series={series}
          type='line'
          height={330}
        />
      </Grid>
      </Grid>
    </Card>
  );
}
export default useCommonRef(ApexChart);

// class ApexChart extends React.Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       series: [
//         {
//           name: 'Customers',
//           data: this.props.get_all_customer.map((f) => f.customer_count),
//         },
//       ],
//       options: {
//         chart: {
//           height: 350,
//           type: 'line',
//           zoom: {
//             enabled: false,
//           },
//           // toolbar: {
//           //   show: false,
//           // }
//         },
//         yaxis: {
//           title: {
//             text: 'Customers',
//           },
//           //     min: 5,
//           //     max: 40
//         },
//         dataLabels: {
//           enabled: false,
//         },
//         stroke: {
//           curve: 'straight',
//         },
//         title: {
//           text: 'Customer Growth : Last Six Months',
//           align: 'left',
//         },
//         grid: {
//           row: {
//             colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
//             opacity: 0.5,
//           },
//         },
//         xaxis: {
//           categories: this.props.get_all_customer.map((f) => f.Date),
//         },
//       },
//     };
//   }

//   async componentDidMount() {
//     const context = this.context;
//     await this.props.getAllCustomerAction(
//       context.setModalTypeHandler,
//       context.setLoaderStatusHandler,
//     );
//   }

//   componentDidUpdate(preProps, preState) {
//     if (preProps.get_all_customer !== this.props.get_all_customer) {
//       this.setState({
//         series: [
//           {
//             name: 'Customers',
//             data: this.props.get_all_customer.map((f) => f.customer_count),
//           },
//         ],
//         options: {
//           ...this.state.options,
//           xaxis: {categories: this.props.get_all_customer.map((f) => f.Date)},
//         },
//       });
//     }
//   }
//   GetTotal = (date) => {
//     let total = '';
//     this.props.get_all_customer.forEach((data) => {
//       if (data) {
//         // data.forEach(val => {
//         if (data.Date < date) total = data.Date;
//         // })
//       }
//     });
//     return total;
//   };

//   render() {

//     return (
//       <>
//       <Card sx={{ p: '20px 20px 0px 20px' }}>
//       <Grid container>
//         <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
//           <ReactApexChart
//             options={this.state.options}
//             series={this.state.series}
//             type='line'
//             height={372}
//           />
//           </Grid>
//           </Grid>
//       </Card>
//     </>
//     );
//   }
// }

// const mapStateToProps = (state) => {
//   return {
//     get_all_customer: state.customerReducer.Get_all_customer || [],
//   };
// };
// const mapDispatchToProps = (dispatch) => {
//   return {
//     getAllCustomerAction: (setModalTypeHandler, setLoaderStatusHandler) => {
//       dispatch(
//         getAllCustomerAction(setModalTypeHandler, setLoaderStatusHandler),
//       );
//     },
//   };
// };

// export default connect(mapStateToProps, mapDispatchToProps)(ApexChart);
