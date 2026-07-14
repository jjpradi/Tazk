import React, {Component, useEffect, useContext, useState, useRef, useMemo} from 'react';
import {Grid, Typography, Card, Box} from '@mui/material';
import AreaChart from './areaChart';
import PieChart from './pieChart';
import CardDesign from './cardContent';
import {listExpenseAreaChart, listTopExpensesAction } from '../../../redux/actions/profitloss_actions';
import {connect} from 'react-redux';
import moment from 'moment';
import TextField from '@mui/material/TextField';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {useDispatch, useSelector} from 'react-redux';
import { useInView } from 'react-intersection-observer';
import apiCalls from 'utils/apiCalls';
import { getCurrentFinancialYear } from 'utils/getTimeFormat';
import {clientwebsocket } from '../../../http-common'
import { listExpenseChart } from '../../../redux/actions/profitloss_actions';

export default function ExpanseAnalysis() {
  const dispatch = useDispatch();
  const {
    profitlossReducer: {expense_area_chart},
  } = useSelector((state) => state);
  let date = new Date();
  const [today, setToday] = useState(new Date());
  const [from, setFrom] = useState(new Date(getCurrentFinancialYear().fromDate));
  const [to, setTo] = useState(new Date(getCurrentFinancialYear().toDate));

  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(CreateNewButtonContext);

  // Api call is made only when component is visible in viewport
  const {ref, inView, entry} = useInView({
    threshold: 0,
    triggerOnce: true,
     rootMargin: '0.5px',
     deley: 100
  });

  useEffect(() => {
    setTimeout(() => {
    if(inView){ // Api call is made only when component is visible
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          listExpenseAreaChart(
            moment(from, 'year', 'month', 'day').format('yyyy-MM-DD'),
            moment(to, 'year', 'month', 'day').format('yyyy-MM-DD'),
          )),
          dispatch(
          listExpenseChart(moment(from, 'year', 'month', 'day').format('yyyy-MM-DD'),
          moment(to, 'year', 'month', 'day').format('yyyy-MM-DD'),)),
          dispatch(
          listTopExpensesAction(),
          
          
        //     clientwebsocket.socket.onmessage = async (message) => {
        //   let { event } = JSON.parse(message.data)
        //   if (event === 'ExpensesAnalysis') {
        //     dispatch(
        //     listExpenseChart(moment(from, 'year', 'month', 'day').format('yyyy-MM-DD'),
        //       moment(to, 'year', 'month', 'day').format('yyyy-MM-DD'),))
        //   }
        // }
        ))}
      // clientwebsocket.socket.onmessage = async (message) => {
      //   let { event } = JSON.parse(message.data)
      //   if (event === 'expence') {
      //     await this.props.listExpenseAreaChart(moment(from, 'year', 'month', 'day').format('yyyy-MM-DD'),
      //       moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'));
      //   }
      // }
      // clientwebsocket.socket.onopen = () => {
      // }
      // clientwebsocket.socket.onerror = () => {
      // }
      }, 1000)
  }, [inView]);


  return (
    <Grid container display="flex" flexDirection='row' spacing={5} ref={ref}>
      <Grid
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
      <Typography variant='h6'
                style={{
                  textAlign: 'left',
                  fontWeight: '700',
                  // fontSize: 14,
                  textTransform: 'uppercase',
                  padding:'0px 0px 10px 10px'
                }}
              >
                Expenses Analysis
              </Typography>
              <CardDesign inView={inView}/>
            </Grid>
      {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
          <Grid container direction='row'>
            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
              <Typography
                variant='h5'
                align='left'
                style={{paddingTop: '10px', paddingBottom: '10px'}}
              >
                Expense Breakdown
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
              <Typography
                variant='h5'
                align='left'
                style={{paddingTop: '10px', paddingBottom: '10px'}}
              >
                Month Wise Expense
              </Typography>
            </Grid>
          </Grid>
        </Grid>*/}
      <Grid
        size={{
          lg: 6,
          md: 6,
          sm: 12,
          xs: 12
        }}>
              <PieChart inView={inView}/>
          </Grid>
      <Grid
        size={{
          lg: 6,
          md: 6,
          sm: 12,
          xs: 12
        }}>
          <AreaChart paymentReceipt={expense_area_chart} inView={inView}/>
      </Grid>
    </Grid>
  );
}


// class ExpanseAnalysis extends Component {
//   constructor(props) {
//     super(props);
//     var date = new Date();
//     var firstDay = new Date(date.getFullYear(), 3, 1);
//     var lastDay = new Date(date.getFullYear() + 1, 2, 31);
//     this.state = {
//       today:date,
//       from: firstDay,
//       to: lastDay,
//     }
//   }
//   async componentDidMount() {

//     await this.props.listExpenseAreaChart(moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD'),
//       moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'));
//     // clientwebsocket.socket.onmessage = async (message) => {
//     //   let { event } = JSON.parse(message.data)
//     //   if (event === 'expence') {
//     //     await this.props.listExpenseAreaChart(moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD'),
//     //       moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'));
//     //   }
//     // }
//     // clientwebsocket.socket.onopen = () => {
//     // }
//     // clientwebsocket.socket.onerror = () => {
//     // }
//   };

//   render() {
//     let period1 = moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD')
//     return (
//       <>
//         <Grid container>
//           <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
//             <Grid container direction='row'>
//               <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }}>
//                 <Typography
//                   style={{
//                     textAlign: "left",
//                     fontWeight: "bold",
//                     fontSize: 27,
//                     paddingBottom: 5,
//                   }}
//                 >
//                   Expenses Analysis
//                 </Typography>
//               </Grid>

//             </Grid>
//           </Grid>
//         </Grid>

// <br />
//         <Grid container>
//           <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
//             <Grid container direction='row'>
//               <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
//                 <CardDesign />
//               </Grid>
//             </Grid>
//             <br />

//             {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
//               <Grid container direction='row'>
//                 <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
//                   <Typography
//                     variant='h5'
//                     align='left'
//                     style={{paddingTop: '10px', paddingBottom: '10px'}}
//                   >
//                     Expense Breakdown
//                   </Typography>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
//                   <Typography
//                     variant='h5'
//                     align='left'
//                     style={{paddingTop: '10px', paddingBottom: '10px'}}
//                   >
//                     Month Wise Expense
//                   </Typography>
//                 </Grid>
//               </Grid>
//             </Grid>*/}
//           </Grid>
//           <br />

//           <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
//             <Grid container direction='row' spacing={3}>
//               <Grid size={{ xs: 12, sm: 12, md: 8, lg: 6 }}>
//                   <Typography
//                     style={{
//                       textAlign: "left",
//                       fontWeight: "bold",
//                       fontSize: 27,
//                       paddingBottom: 5,
//                     }}
//                   >
//                     Expense Breakdown
//                   </Typography>
//                 <Card style={{padding:"20px",height:'387px'}}>
//                   <PieChart />
//                 </Card>
//               </Grid>

//               <Grid size={{ xs: 12, sm: 12, md: 8, lg: 6 }}>
//                 <Typography
//                   style={{
//                     textAlign: "left",
//                     fontWeight: "bold",
//                     fontSize: 27,
//                     paddingBottom: 5,
//                   }}
//                 >
//                   Month Wise Expense
//                 </Typography>
//                 <Card >
//                   <AreaChart  {...this.props} />
//                 </Card>
//               </Grid>
//             </Grid>
//           </Grid>
//         </Grid>
//       </>
//     );
//   }
// }
// const mapStateToProps = (state) => {
//   return {

//     paymentReceipt: state.profitlossReducer.expense_area_chart || [],
//   };
// };

// const mapDispatchToProps = (dispatch) => {
//   return {

//     listExpenseAreaChart: (from, to) => {
//       dispatch(listExpenseAreaChart(from, to));
//     },

//   };
// };
// export default connect(mapStateToProps, mapDispatchToProps)(ExpanseAnalysis);
