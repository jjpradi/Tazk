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

export default class Averagepay extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [
        {
          data: [400, 430],
        },
      ],
      options: {
        chart: {
          type: 'bar',
          height: 350,
        },
        plotOptions: {
          bar: {
            borderRadius: 4,
            horizontal: true,
          },
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          categories: ['Previous', 'Current'],
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
              <Typography variant='body1'>Average Time to Pay</Typography>
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
                height={350}
              />
            </div>
          </Grid>
        </Grid>
      </Card>
    );
  }
}
