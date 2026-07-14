import React from 'react';
import ReactApexChart from 'react-apexcharts';
import {listPosSalesPaymentsAction} from '../../redux/actions/posSalesPayments_actions';
import {connect} from 'react-redux';
import {Grid, TextField, Autocomplete, List, Typography, Divider, Card} from '@mui/material';
import NoRecordFound from '../Layout/NoRecordFound';
import { cellStyle } from 'utils/pageSize';

const style = {
  width: '100%',
  maxWidth: 360,
  bgcolor: 'background.paper',
};

class SalesChart extends React.Component {
  constructor(props) {
    super(props);
    this.date = new Date();
    this.months = [
      {name: 'January', value: '01'},
      {name: 'February', value: '02'},
      {name: 'March', value: '03'},
      {name: 'April', value: '04'},
      {name: 'May', value: '05'},
      {name: 'June', value: '06'},
      {name: 'July', value: '07'},
      {name: 'August', value: '08'},
      {name: 'September', value: '09'},
      {name: 'October', value: '10'},
      {name: 'November', value: '11'},
      {name: 'December', value: '12'},
    ];
    this.state = {
      series: [
        {
          name: 'Network',
          data: [
            {
              x: '',
              y: 0,
            },
          ],
        },
      ],
      options: {
        chart: {
          type: 'area',
          height: 350,
          animations: {
            enabled: false,
          },
          zoom: {
            enabled: false,
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: 'straight',
        },
        fill: {
          opacity: 0.8,
          type: 'pattern',
          pattern: {
            style: ['verticalLines', 'horizontalLines'],
            width: 5,
            height: 6,
          },
        },
        markers: {
          size: 5,
          hover: {
            size: 9,
          },
        },
        // title: {
        //   text: 'Sales Graph',
        //   style:{fontFamily:'Poppins,sans-serif'}
        // },
        tooltip: {
          intersect: true,
          shared: false,
        },
        theme: {
          palette: 'palette1',
        },
        xaxis: {
          type: 'datetime',
          labels: {
            format: 'dd MMM', // Ensures proper display
            datetimeUTC: false,
          }
        },
        // yaxis: {
        //   title: {
        //     text: 'Sales Value',
        //     style:{fontFamily:'Poppins,sans-serif'}

        //   },
        // },
      },

      // months: [
      //   {name: 'January', value: '01'},
      //   {name: 'February', value: '02'},
      //   {name: 'March', value: '03'},
      //   {name: 'April', value: '04'},
      //   {name: 'May', value: '05'},
      //   {name: 'June', value: '06'},
      //   {name: 'July', value: '07'},
      //   {name: 'August', value: '08'},
      //   {name: 'September', value: '09'},
      //   {name: 'October', value: '10'},
      //   {name: 'November', value: '11'},
      //   {name: 'December', value: '12'},
      // ],
      dashBoardData: [],
      selectedMonth : this.months.find((d) => d.value == this.date.getMonth() + 1)
    };
  }

  async componentDidMount() {
    // if(this.props.item_id){
    // await this.props.listPosSalesPaymentsAction(this.props.item_id);
    // }
    // const d = new Date();
    // const  monthName = this.state.months[d.getMonth()];
    // this.DateFiletering(monthName.value)

    // await this.setState({ series: this.props.pos_sales_payments })
    // const datax = this.props.pos_sales_payments.map((d) => {
    //     d.payment_time
    // })
    // this.setState(prevState => ({
    //     data: prevState.data.map((d) => {...dx : datax}))
    // }));
  }

  DateFiletering = async (month) => {
    const data = [...this.props.pos_sales_payments];
    if (month !== '' && typeof month !== 'undefined') {
      const Filtering = data.filter(
        (f) =>
          f.payment_time.split('-')[0] == this.date.getFullYear() &&
          f.payment_time.split('-')[1] == month,
      );
      this.setState({dashBoardData: Filtering, selectedMonth : this.months.find((d) => d.value === month)});
    }
  };

  async componentDidUpdate(pprops, preState) {
    if (pprops.pos_sales_payments !== this.props.pos_sales_payments) {
      this.DateFiletering(this.months[this.date.getMonth()].value);
    }
  
    if (preState.dashBoardData !== this.state.dashBoardData) {
      const data = this.state.dashBoardData.map((d) => ({
        x: new Date(d.payment_time).getTime(),
        y: d.payment_amount,
      }));
  
      const aggregatedData = data.reduce((acc, current) => {
        const existing = acc.find(item => item.x === current.x);
        if (existing) {
          existing.y += current.y; 
        } else {
          acc.push(current);
        }
        return acc;
      }, []);
  
      
  
      this.setState({ series: [{ name: 'Sales', data: aggregatedData }] }); // Ensure correct format
    }
  }

  render() {
    const d = new Date();
    const  monthName = this.months[d.getMonth()];
    return (
      <Card sx={{ borderTop: '1px solid #d3d3d3', borderLeft : '1px solid #d3d3d3', borderRight : '1px solid #d3d3d3'}}>
        <Grid
          spacing={0}
          // style={{paddingTop: '20px', paddingBottom: '20px'}}
          justifyContent='flex-end'
          alignItems='center'
          container
          direction='row'
        >
          <Grid
            style={{ display : 'flex', justifyContent : 'space-between', padding : '10px' }}
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
          <Grid>
            <Typography variant='h6' align='left'>
              Sales Graph
            </Typography>
          </Grid>
          <Grid>
            <Autocomplete
              id='multiple-limit-tags'
              value={this.state.selectedMonth}
              options={this.months}
              getOptionLabel={(option) => option.name}
              onChange={(e, v) =>
                v !== null ? this.DateFiletering(v.value) : ''
              }
              sx={{width: 200, height : 50}}
              disablePortal
              ListboxProps={{
                style: {
                  maxHeight: "450px",
                  overflow: "auto",
                },
              }}
              PaperProps={{
                style: {
                  maxHeight: "200px",
                  overflow: "hidden",
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant='outlined'
                  label='Select Month'
                  placeholder='Select Month'
                />
              )}
            />
          </Grid>
          </Grid>
        </Grid>
        {/* {this.state.dashBoardData.length !== 0 ? ( */}
        <div id='chart' style={{ paddingBottom : '30px' }}>
          <ReactApexChart
            options={this.state.options}
            series={this.state.series}
            type='area'
            height={350}
          />
        </div>
        {/* ) : (
          <NoRecordFound />
        )} */}
      </Card>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    pos_sales_payments: state.posSalesPaymentsReducer.pos_sales_payments || [],
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    listPosSalesPaymentsAction: (id) => {
      dispatch(listPosSalesPaymentsAction(id));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SalesChart);
