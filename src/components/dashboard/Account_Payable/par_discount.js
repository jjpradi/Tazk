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

export default class ParDiscount extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [
        {
          data: [44, 55, 41, 64, 22],
        },
        {
          data: [53, 32, 33, 52, 13],
        },
      ],
      options: {
        chart: {
          type: 'bar',
          height: 430,
        },
        plotOptions: {
          bar: {
            horizontal: true,
            dataLabels: {
              position: 'top',
            },
          },
        },
        dataLabels: {
          enabled: true,
          offsetX: -6,
          style: {
            fontSize: '12px',
            colors: ['#fff'],
          },
        },
        stroke: {
          show: true,
          width: 1,
          colors: ['#fff'],
        },
        tooltip: {
          shared: true,
          intersect: false,
        },
        xaxis: {
          categories: [0 - 30, 31 - 60, 61 - 90, 91 - 120, '>120'],
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
              <Typography variant='body1'>
                Payable($) at Par Vs Discount
              </Typography>
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
                series={this.state.series}
                type='bar'
                height={430}
              />
            </div>
          </Grid>
        </Grid>
      </Card>
    );
  }
}
