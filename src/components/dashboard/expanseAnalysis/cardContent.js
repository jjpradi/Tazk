import React, { Component } from 'react';
import { Grid, CardContent, Typography, Card, ThemeProvider, useMediaQuery, Box } from '@mui/material';
import AddchartIcon from '@mui/icons-material/Addchart';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import SpeakerNotesIcon from '@mui/icons-material/SpeakerNotes';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import {
  getPaymentReceiptMonthDataAction,
  getPaymentReceiptTotalAmountAction,

} from '../../../redux/actions/paymentReceipt_actions';
import { listExpenseChart } from 'redux/actions/profitloss_actions';
import { connect } from 'react-redux';
import moment from 'moment';
import { useInView } from 'react-intersection-observer';
import {clientwebsocket } from '../../../http-common'
import Cards from '../../dynamicCards/index'
import expensesIcon from '../../../assets/dashboardIcons/expensesic.svg';
import mostspendingIcon from '../../../assets/dashboardIcons/expense.svg';
import appointmentIcon from '../../../assets/dashboardIcons/calendare.svg';
import TotalCard from './totalCard';
import ExpenseCard from './expenseCard';
import SpendingCard from './spendingCard';

import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import { cellStyle, font14_500 } from 'utils/pageSize';
// import Icon from '../../../assets/dashboardIcons/expense.svg';
class CardDesign extends Component {
  static contextType = CreateNewButtonContext;
  // style = useMediaQuery((theme)=>(theme.breakpoints.up(1024)))
  constructor(props) {
    super(props);
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.state = {
      from: firstDay,
      to: lastDay,
      chartData: {
        total: 0,
        PreFinacialTotal: 0,
        monthtotal: 0,
        PreMonthTotal: 0,
        openingbalance: 0,
        currentbalance: 0,
        spending: 0,
        spendingname: '',
        style: window.matchMedia("(min-width: 1024px)").matches 
      },
    };
  }

  // async componentDidMount() {
  //   if (this.props.inView) {
  //     await this.props.listExpenseChart(moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD'),
  //       moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),);
  //   }
  //   clientwebsocket.socket.onmessage = async (message) => {
  //     let { event } = JSON.parse(message.data)
  //     if (event === 'ExpensesAnalysis') {
  //       await this.props.listExpenseChart(moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD'),
  //         moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),);
  //       // clientwebsocket.socket.onmessage = async (message) => {
  //       //   let { event } = JSON.parse(message.data)
  //       //   if (event === 'ExpensesAnalysis') {
  //       //     await this.props.listExpenseChart(moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD'),
  //       //       moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),);
  //     }
  //   }
  // }

  async componentDidUpdate(preProps, preState) {
    const context = this.context;

    let res = {};
    if (preProps.expense_chart !== this.props.expense_chart) {
      0
      for (let i of this.props.expense_chart) {
        for (const [key, value] of Object.entries(i)) {
          res = { ...res, [key]: value === null ? 0 : value }

        }
      }
      this.setState({ chartData: res })
    }

    // if(preProps.inView !== this.props.inView){
    //   apiCalls(
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //     await this.props.listExpenseChart(moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD'),
    //       moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),)
    //   );
    // }


  }

  render() {
    const { PreFinacialTotal, PreMonthTotal, currentbalance, monthtotal, openingbalance, spending, spendingname, total } = this.state.chartData
    return (
      <>
        <Grid container display='flex' flexDirection='row' spacing={5}>
          <Grid
            size={{
              lg: 4,
              md: 4,
              sm: 6,
              xs: 12
            }}>
            <Card>
              <Box display='flex' p='20px' alignItems='center'>
                <img src={expensesIcon} height={85} width={60} />
                <Box width='100%' pl='16px'>
                <Typography
                      style={{ fontSize: 14 }}
                      color='textSecondary'
                      gutterBottom >
                    <span style={{ paddingLeft: '10px', paddingTop: '10px' }}>Total Expenses</span>
                    </Typography>
                <Typography
                        style={{  color: 'black' }}
                      >
                        <CurrencyRupeeIcon style={{ paddingTop: '10px', paddingLeft: '5px' }} />
                        {total === 0 ? "0.00" : total.toFixed(2)}
                      </Typography>
                <Box display='flex' alignItems='center'>
                <Typography
                      color='textSecondary'
                    >
                      
                        
                      <span style={{  paddingBottom: '20px', paddingLeft: '10px',fontSize:'12px' }}>
                        from last month
                      </span>
                      <span style={{fontSize:cellStyle.fontSize,
                        color: ((PreFinacialTotal / total) * 100).toFixed(2) >= '100.00' ? 'green' : 'red',
                      }}
                      >
                      {((PreFinacialTotal / total) * 100).toFixed(2) >= '100.00' ?
                          <ArrowUpwardIcon
                            style={{ paddingTop: '10px' }}
                          />
                          : <ArrowDownwardIcon
                            style={{ paddingTop: '10px' }}
                          />}
                        {isNaN(((PreFinacialTotal / total) * 100).toFixed(2)) ? "" : ((PreFinacialTotal / total) * 100).toFixed(2)}
                      </span>{' '}
                    </Typography>
                </Box>
            </Box>
              </Box>
            </Card>
          </Grid>
          <Grid
            size={{
              lg: 4,
              md: 4,
              sm: 6,
              xs: 12
            }}>
            <Card>
              <Box display='flex' p='20px' alignItems='center'>
              <img src={appointmentIcon} height={85} width={45} />
                <Box width='100%' pl='16px'>
                <Typography
                      style={{ fontSize: font14_500.fontSize }}
                      color='textSecondary'
                      gutterBottom >
                    <span style={{ paddingLeft: '10px', paddingTop: '10px' }}>Expenses for Current Month</span>
                    </Typography>
                    <Typography
                        style={{ color: 'black' }}

                      >
                        <CurrencyRupeeIcon style={{ paddingTop: '10px', paddingLeft: '5px' }} />
                        {monthtotal === 0 ? '0.00' : monthtotal.toFixed(2)}
                      </Typography>
                <Box display='flex' alignItems='center'>
                <Typography
                      color='textSecondary'
                      paddingLeft='10px'
                    >
                      <span style={{fontSize:cellStyle.fontSize}}>
                        from last month
                      </span>
                      
                      <span style={{fontSize:cellStyle.fontSize,
                        color: ((PreFinacialTotal / total) * 100).toFixed(2) >= '100.00' ? 'green' : 'red',
                      }}
                      >
                        {((PreFinacialTotal / total) * 100).toFixed(2) >= '100.00' ?
                          <ArrowUpwardIcon
                            style={{ paddingTop: '10px' }}
                          />
                          : <ArrowDownwardIcon
                            style={{ paddingTop: '10px' }}
                          />}
                        {isNaN(((PreFinacialTotal / total) * 100).toFixed(2)) ? "" : ((PreFinacialTotal / total) * 100).toFixed(2)}
                      </span>{' '}
                      
                    </Typography>
                </Box>
            </Box>
              </Box>
            </Card>
          </Grid>
          <Grid
            size={{
              lg: 4,
              md: 4,
              sm: 6,
              xs: 12
            }}>
            <Card style={{minHeight:'125px'}}>
              <Box display='flex' p='20px' alignItems='center'>
              <img src={mostspendingIcon} height={70} width={50} />
                <Box width='100%' pl='16px'>
                <Typography
                      style={{ fontSize: 14 }}
                      color='textSecondary'
                      gutterBottom >
                    <span style={{ paddingLeft: '10px', paddingTop: '10px' }}>Most Spending</span>
                    </Typography>
                    <Typography
                        style={{  color: 'black' }}
                      >
                        <CurrencyRupeeIcon style={{ paddingTop: '10px', paddingLeft: '5px' }} />
                        {spending === 0 || null ? "0.00" : spending.toFixed(2)}
                      </Typography>
                <Box display='flex' alignItems='center'>
                <Typography
                      color='textSecondary'
                      paddingLeft="10px"
                      paddingTop="10px"
                    >
                      <span style={{ color: "#ff726f" ,fontSize:cellStyle.fontSize}}>
                        {spendingname === 0 ? " " : spendingname}
                      </span>
                    </Typography>
                </Box>
            </Box>
              </Box>
            </Card>
          </Grid>
          {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
            <Grid container direction='row' spacing={1} >
              {/* <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}> */}
              {/* <Cards>
                <Grid container style={{ padding:'10px 0px 10px 8px'}} >
                
                  <Grid>
                    <img src={expensesIcon} height={85} width={60} />
                  </Grid>
                  <Grid marginLeft={2}>
                    <Typography
                      style={{ fontSize: 14, marginTop: '10px', paddingLeft: '3px' }}
                      color='textSecondary'
                      gutterBottom >
                      <span style={{ paddingLeft: '10px', paddingTop: '10px' }}>Total Expense</span>
                      <Typography
                        style={{  color: 'black' }}
                      >
                        <CurrencyRupeeIcon style={{ paddingTop: '10px', paddingLeft: '5px' }} />
                        {total === 0 ? " " : total.toFixed(2)}
                      </Typography>
                      <Typography
                      color='textSecondary'
                    >
                      
                        
                      <span style={{  paddingBottom: '20px', paddingLeft: '10px',fontSize:'12px' }}>
                        from last month
                      </span>
                      <span style={{
                        color: ((PreFinacialTotal / total) * 100).toFixed(2) >= '100.00' ? 'green' : 'red',
                      }}
                      >
                      {((PreFinacialTotal / total) * 100).toFixed(2) >= '100.00' ?
                          <ArrowUpwardIcon
                            style={{ paddingTop: '10px' }}
                          />
                          : <ArrowDownwardIcon
                            style={{ paddingTop: '10px' }}
                          />}
                        {isNaN(((PreFinacialTotal / total) * 100).toFixed(2)) ? "" : ((PreFinacialTotal / total) * 100).toFixed(2)}
                      </span>{' '}
                    </Typography>
                    </Typography>
                  </Grid>
                  {/* <Grid style={{ paddingTop: "35px" }}> */}
                    
                  {/* </Grid> */}
                {/* </Grid>
              </Cards> */} 
              {/* </Grid> */}

              {/* <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}> */}
              {/* <Cards> */}
                {/* <Grid container style={{ padding:'10px 0px 10px 8px'}} >
                  <Grid>
                  <img src={appointmentIcon} height={85} width={45} />
                  </Grid>
                  <Grid marginLeft={5}>
                    <Typography
                      style={{ fontSize: 14, marginTop: '10px' }}
                      color='textSecondary'
                      gutterBottom >
                      <span style={{ paddingLeft: '10px', paddingTop: '10px' }}>Expense This Month</span>
                      <Typography
                        style={{ color: 'black' }}

                      >
                        <CurrencyRupeeIcon style={{ paddingTop: '10px', paddingLeft: '5px' }} />
                        {monthtotal === 0 ? "" : monthtotal.toFixed(2)}
                      </Typography>
                      <Typography
                      color='textSecondary'
                      fontSize={10}
                      paddingLeft='10px'
                    >
                      <span style={{fontSize:'12px'}}>
                        from last month
                      </span>
                      
                      <span style={{
                        color: ((PreFinacialTotal / total) * 100).toFixed(2) >= '100.00' ? 'green' : 'red',
                      }}
                      >
                        {((PreFinacialTotal / total) * 100).toFixed(2) >= '100.00' ?
                          <ArrowUpwardIcon
                            style={{ paddingTop: '10px' }}
                          />
                          : <ArrowDownwardIcon
                            style={{ paddingTop: '10px' }}
                          />}
                        {isNaN(((PreFinacialTotal / total) * 100).toFixed(2)) ? "" : ((PreFinacialTotal / total) * 100).toFixed(2)}
                      </span>{' '}
                      
                    </Typography>
                    </Typography>
                  </Grid>
                </Grid> */}
              {/* </Cards> */}
              {/* </Grid> */}
              {/* </Grid> */}
              {/* <Cards>
                <Typography
                  style={{ fontSize: 14 }}
                  gutterBottom
                >
                  {/* <AddchartIcon
                     style={{paddingTop: '5px'}}
                    color='primary'
                  />{' '} */}
              {/* <Grid container style={{marginLeft:'15px',marginTop:'8px'}}>
                    <Grid>
                      <img src={expensesIcon} height={60} width={40} />
                    </Grid>
                    <Grid >
                      <Grid container display="flex" flexDirection="column">
                        <Grid><Typography style={{ paddingTop: '8px' }} color='textSecondary'>
                          <span
                            style={{ paddingLeft: '10px', paddingTop: '5px' }}
                          >Total Expense</span>
                        </Typography>
                        </Grid>
                        <Grid container flexDirection='row' >
                          <Grid>
                            <span style={{ color: 'black' }}>
                              <CurrencyRupeeIcon
                                style={{ paddingTop: '10px' }}
                              />
                              <span
                                // paddingRight={15}
                                paddingBottom={10}
                              >
                                {total === 0 ? 456 : total.toFixed(2)}
                              </span>
                            </span>
                            <span style={{
                              fontSize: '10px',
                              color: ((PreFinacialTotal / total) * 100).toFixed(2) >= '100.00' ? 'Lightgreen' : 'Lightred',
                              // paddingBottom: '5px'
                            }}
                            >
                              {((PreFinacialTotal / total) * 100).toFixed(2) >= '100.00' ?
                                <ArrowUpwardIcon
                                  style={{ paddingTop: '5px' }}
                                />
                                : <ArrowDownwardIcon
                                  style={{ paddingTop: '5px' }}
                                />}
                              {isNaN(((PreFinacialTotal / total) * 100).toFixed(2)) ? "" : ((PreFinacialTotal / total) * 100).toFixed(2)}
                              {' '}
                            </span> </Grid>
                          <Grid>  <span style={{ fontSize: '10px',marginTop:'40px' ,marginLeft:'10px', color:'GrayText' }}> from last month </span></Grid>

                        </Grid>
                      </Grid>
                    </Grid> */}
              {/* <Grid style={{ paddingLeft: '10px', paddingTop:"35px" }}>
                      <Typography
                        // style={{marginBottom: 12}}
                        color='textSecondary'
                        fontSize={8}
                      >
                        <span style={{
                          color: ((PreFinacialTotal / total) * 100).toFixed(2) >= '100.00' ? 'Lightgreen' : 'Lightred',
                          // paddingBottom: '5px'
                        }}
                        >
                          {((PreFinacialTotal / total) * 100).toFixed(2) >= '100.00' ?
                            <ArrowUpwardIcon
                            // style={{paddingTop: '0px'}} 
                            />
                            : <ArrowDownwardIcon
                            //  style={{paddingTop: '0px'}} 
                            />}
                          {isNaN(((PreFinacialTotal / total) * 100).toFixed(2)) ? "" : ((PreFinacialTotal / total) * 100).toFixed(2)}
                        </span>{' '}
                        from last year
                      </Typography>
                    </Grid>                     */}
              {/* </Grid> */}
              {/* <span style={{
                    marginLeft: '40px', color: ((PreFinacialTotal / total) * 100).toFixed(2) >= '100.00' ? 'lightgreen' : 'lightred',
                    // paddingBottom: '5px'
                  }}
                  >
                    {((PreFinacialTotal / total) * 100).toFixed(2) >= '100.00' ?
                      <ArrowUpwardIcon
                        style={{ paddingTop: '8px' }}
                      />
                      : <ArrowDownwardIcon
                        style={{ paddingTop: '8px' }}
                      />}
                    {isNaN(((PreFinacialTotal / total) * 100).toFixed(2)) ? "" : ((PreFinacialTotal / total) * 100).toFixed(2)}
                  </span>{' '}
                  <span style={{ fontSize: 12, }}>from last year</span> */}
              {/* </Typography> */}
              {/* </Cards> */}
              {/* </CardContent>
                </Card>
            </Grid> */}
              {/* </Cards> */}
              {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}> */}
              {/* <Card>
                  <CardContent> */}
              {/* <Cards>
                {/* <Cards> */}
              {/* <Grid container style={{marginLeft:'15px',marginTop:'8px'}}>
                  <Grid size={{ lg: 2 }}>
                    <img src={appointmentIcon} height={60} width={30} />
                  </Grid>  */}
              {/* <ImportExportIcon
                    style={{paddingTop: '5px'}}
                    color='primary'
                  /> */}
              {/* <Grid >
                    <Grid container display="flex" flexDirection="column">
                      <Typography
                        style={{ fontSize: 14, paddingTop: '8px' }}
                        color='textSecondary'
                        gutterBottom
                      >
                        <span style={{ paddingLeft: '10px', paddingTop: '5px' }}>
                          Expense This Month
                        </span>
                      </Typography>
                    </Grid>
                    <Grid maxWidth='fit-content' >
                      <span style={{ color: 'black' }}>
                        <CurrencyRupeeIcon style={{ paddingTop: '10px' }} />
                        <span >
                          {monthtotal === 0 ? 456 : monthtotal.toFixed(2)}
                        </span>
                      </span>
                      <span >
                        <span color='textSecondary' style={{ fontSize: '10px', color: ((PreMonthTotal / monthtotal) * 100).toFixed(2) >= '100.00' ? 'green' : 'red', paddingBottom: '5px' }}>
                          {((PreMonthTotal / monthtotal) * 100).toFixed(2) >= '100.00' ? <ArrowUpwardIcon style={{ paddingTop: '8px' }} /> : <ArrowDownwardIcon style={{ paddingTop: '8px' }} />}
                          {isNaN(((PreMonthTotal / monthtotal) * 100).toFixed(2)) ? "" : ((PreMonthTotal / monthtotal) * 100).toFixed(2)}
                        </span>{' '}
                        <span style={{ fontSize: '10px' }}> from last month </span>
                      </span>
                    </Grid> */}
              {/* <Typography
                      style={{ fontSize: 14 ,paddingTop: '8px'}}
                      color='textSecondary'
                      gutterBottom
                    >
                      <Grid style={{paddingLeft:'5px'}}>
                        <span style={{ paddingLeft: '10px', paddingTop: '5px' }}>
                          Expense This Month
                        </span> */}
              {/* <span style={{ color: ((PreMonthTotal / monthtotal) * 100).toFixed(2) >= '100.00' ? 'lightgreen' : 'lightred', paddingBottom: '5px' }}>
                    {((PreMonthTotal / monthtotal) * 100).toFixed(2) >= '100.00' ? <ArrowUpwardIcon style={{ paddingTop: '8px' }} /> : <ArrowDownwardIcon style={{ paddingTop: '8px' }} />}
                    {isNaN(((PreMonthTotal / monthtotal) * 100).toFixed(2)) ? "" : ((PreMonthTotal / monthtotal) * 100).toFixed(2)}
                  </span>{' '}
                  <span style={{ fontSize: 10, }}>  from last month </span> */}
              {/* <br />
                       <span style={{color:'black',paddingLeft:'3px'}}>
                          <CurrencyRupeeIcon style={{ paddingTop: '10px' }} />
                          <span >
                            {monthtotal === 0 ? "" : monthtotal}
                          </span>
                          </span> */}
              {/* <Typography
                 
                      color='textSecondary'
                      fontSize={7.5
                      }
                    > */}
              {/* <span style={{  paddingLeft:'40px' }}>
                            <span color='textSecondary' style={{ fontSize: '10px', color: ((PreMonthTotal / monthtotal) * 100).toFixed(2) >= '100.00' ? 'green' : 'red', paddingBottom: '5px' }}>
                              {((PreMonthTotal / monthtotal) * 100).toFixed(2) >= '100.00' ? <ArrowUpwardIcon style={{ paddingTop: '8px' }} /> : <ArrowDownwardIcon style={{ paddingTop: '8px' }} />}
                              {isNaN(((PreMonthTotal / monthtotal) * 100).toFixed(2)) ? "" : ((PreMonthTotal / monthtotal) * 100).toFixed(2)}
                            </span>{' '}
                            <span style={{ fontSize: '10px' }}> from last month </span>
                          </span> */}
              {/* </Typography> */}

              {/* </Grid>
                      </Typography> */}
              {/* </Grid> */}
              {/* <Grid style={{ paddingBottom: '15px', paddingTop:"35px" ,paddingRight:'20px'}}>
                    <Typography
                 
                      color='textSecondary'
                      fontSize={7.5
                      }
                    >
                      <span style={{ color: ((PreMonthTotal / monthtotal) * 100).toFixed(2) >= '100.00' ? 'green' : 'red', paddingBottom: '5px' }}>
                        {((PreMonthTotal / monthtotal) * 100).toFixed(2) >= '100.00' ? <ArrowUpwardIcon style={{ paddingTop: '8px' }} /> : <ArrowDownwardIcon style={{ paddingTop: '8px' }} />}
                        {isNaN(((PreMonthTotal / monthtotal) * 100).toFixed(2)) ? "" : ((PreMonthTotal / monthtotal) * 100).toFixed(2)}
                      </span>{' '}
                      from last month
                    </Typography>
                  </Grid> */}
              {/* </Grid>
              </Cards> */}
              {/* </CardContent>
                </Card>
              </Grid> */}
              {/* </Cards> */}
              {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                <Card>
                  <CardContent> */}
                  {/* <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}> */}
              {/* <Cards>
                <Grid container style={{ padding:'15px 0px 10px 8px'}}>
                  <Grid>
                    <img src={mostspendingIcon} height={70} width={50} />
                  </Grid>
                  <Grid marginLeft={2}>
                    <Typography
                      style={{ fontSize: 14,  paddingLeft: '3px' }}
                      color='textSecondary'
                      gutterBottom
                    >
                      <span style={{ paddingLeft: '10px', paddingTop: '10px' }}>Most Spending</span>
                      <Typography
                        style={{  color: 'black' }}
                      >
                        <CurrencyRupeeIcon style={{ paddingTop: '10px', paddingLeft: '5px' }} />
                        {spending === 0 || null ? "" : spending.toFixed(2)}
                      </Typography>
                      <Typography
                      color='textSecondary'
                      fontSize={8}
                      paddingLeft="10px"
                      paddingTop="10px"
                    >
                      <span style={{ color: "#ff726f" ,fontSize:'12px'}}>
                        {spendingname === 0 ? "0" : spendingname}
                      </span>
                    </Typography>
                    </Typography>
                  </Grid>
                  
                </Grid>
              </Cards> */}
              {/* 

              </Grid>
            </Grid>  */}
          </Grid>
        {/* </Grid> */}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    // paymentReceiptMonth: state.paymentReceiptReducer.paymentReceiptMonth || [],
    // paymentReceipTotalAmount:
    //   state.paymentReceiptReducer.paymentReceipTotalAmount || [],
    expense_chart: state.profitlossReducer.expense_chart || [],
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    // getPaymentReceiptMonthDataAction: (from, to) => {
    //   dispatch(getPaymentReceiptMonthDataAction(from, to));
    // },

    // getPaymentReceiptTotalAmountAction: () => {
    //   dispatch(getPaymentReceiptTotalAmountAction());
    // },
    listExpenseChart: (from, to) => {
      return dispatch(listExpenseChart(from, to));
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(CardDesign);


// export function CardDesign_Fun () {
//   const { ref, inView, entry } = useInView({
//     threshold: 0,
//     triggerOnce: true,
//   });

//   return <Grid ref={ref}>
//     <CardDesign inView={inView}/>
//   </Grid>
// }
