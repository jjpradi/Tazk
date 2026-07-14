import React, { useEffect, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import {
  getPaymentReceiptMonthDataAction,
  getPaymentReceiptTotalAmountAction,

} from '../../../redux/actions/paymentReceipt_actions';
import { listExpenseAreaChart, listExpenseChart } from 'redux/actions/profitloss_actions';
import { connect } from 'react-redux';
import moment from 'moment';
import { useInView } from 'react-intersection-observer';
import {clientwebsocket } from '../../../http-common'
import Cards from '../../dynamicCards/index'
import appointmentIcon from '../../../assets/dashboardIcons/calendare.svg';


function ExpenseTest(props) {
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const [from] = useState(firstDay)
  const [to] = useState(lastDay)
  const [chartData, setChartData] = useState({
    total: 0,
    PreFinacialTotal: 0,
    monthtotal: 0,
    PreMonthTotal: 0,
    openingbalance: 0,
    currentbalance: 0,
    spending: 0,
    spendingname: '',
    style: window.matchMedia("(min-width: 1024px)").matches
  })

  const {ref, inView, entry} = useInView({
    threshold: 0,
    triggerOnce: true,
    initialInView: true,
  });



  useEffect(() => {
    if(inView){
      props.listExpenseChart(moment(from, 'year', 'month', 'day').format('yyyy-MM-DD'),moment(to, 'year', 'month', 'day').format('yyyy-MM-DD'),)
    }
    // clientwebsocket.socket.onmessage = async (message) => {
    //   let { event } = JSON.parse(message.data)
    //   if (event === 'ExpensesAnalysis') {
    //     await props.listExpenseChart(moment(from, 'year', 'month', 'day').format('yyyy-MM-DD'),
    //       moment(to, 'year', 'month', 'day').format('yyyy-MM-DD'),);
    //   }
    // }
  }, [])

  useEffect(() => {
    let res = {};
    for (let i of props.expense_chart) {
      for (const [key, value] of Object.entries(i)) {
        res = { ...res, [key]: value === null ? 0 : value }

      }
    }
    setChartData({ chartData: res })
  }, []) //props.expense_chart

  return (
    <>
      <div ref={ref}>
      <Cards style={{ width: '100%' }}>
        <Grid container style={{ padding: '10px 0px 10px 8px' }} >
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
                {chartData.monthtotal === 0 ? "" : chartData.monthtotal?.toFixed(2)}
              </Typography>
              <Typography
                color='textSecondary'
                fontSize={10}
                paddingLeft='10px'
              >
                <span style={{ color: "lightgray" }}>
                  from last month
                </span>

                <span style={{
                  color: ((chartData.PreFinacialTotal / chartData.total) * 100)?.toFixed(2) >= '100.00' ? 'green' : 'red',
                }}
                >
                  {((chartData.PreFinacialTotal / chartData.total) * 100)?.toFixed(2) >= '100.00' ?
                    <ArrowUpwardIcon
                      style={{ paddingTop: '10px' }}
                    />
                    : <ArrowDownwardIcon
                      style={{ paddingTop: '10px' }}
                    />}
                  {isNaN(((chartData.PreFinacialTotal / chartData.total) * 100)?.toFixed(2)) ? "" : ((chartData.PreFinacialTotal / chartData.total) * 100)?.toFixed(2)}
                </span>{' '}

              </Typography>
            </Typography>
          </Grid>
        </Grid>
      </Cards>
      </div>
    </>
  )
}

const mapStateToProps = (state) => {
  return {
    expense_chart: state.profitlossReducer.expense_chart || [],
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    listExpenseChart: (from, to) => {
      dispatch(listExpenseChart(from, to));
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(ExpenseTest);