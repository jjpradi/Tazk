import React from 'react';
import {
  Grid,
  IconButton,
  Tooltip,
  Card,
  Button,
  Typography,
  Box,
} from '@mui/material';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ReactApexChart from 'react-apexcharts';

const style = {
  width: '100%',
  maxWidth: 360,
  bgcolor: 'background.paper',
};

export default class Receivables extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [
        {
          name: 'Payables',
          data: [44, 55, 57, 10, 15],
        },
        {
          name: 'Receivables',
          data: [76, 85, 101, 25, 30],
        },
        // {
        //   name: 'Free Cash Flow',
        //   data: [35, 41, 36, 26, 45, 48, 52, 53, 41]
        // }
      ],
      options: {
        chart: {
          type: 'bar',
          height: 350,
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded',
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent'],
        },
        xaxis: {
          categories: ['0-30', '31-60', '61-90', '91-120', '120+'],
        },
        yaxis: {
          title: {
            text: '$ (thousands)',
          },
        },
        fill: {
          opacity: 1,
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return '$ ' + val + ' thousands';
            },
          },
        },
      },
    };
  }

  render() {
    return (
      <Card variant='outlined' style={{width: '100%'}} align='center'>
        <Grid container spacing={2}>
          <Grid
            size={{
              xs: 12,
              md: 12,
              lg: 12,
              sm: 12
            }}>
            <List sx={style} component='nav' aria-label='mailbox folders'>
              <Typography variant='body1'>Receivables vs Payables</Typography>
            </List>
            <Divider />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 12,
              lg: 12,
              sm: 12
            }}>
            <div id='chart'>
              <ReactApexChart
                options={this.state.options}
                series={[
                  {
                    name: 'Payables',
                    data: [...this.props.comparepurchase],
                  },
                  {
                    name: 'Receivables',
                    data: [...this.props.purchasereceivable],
                  },
                  // {
                  //   name: 'Free Cash Flow',
                  //   data: [35, 41, 36, 26, 45, 48, 52, 53, 41]
                  // }
                ]}
                type='bar'
                height={350}
              />
            </div>
          </Grid>
        </Grid>
      </Card>
    );
  }
}
