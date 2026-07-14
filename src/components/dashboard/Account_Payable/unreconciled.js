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

export default class UnReconciled extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [
        {
          name: 'Website Blog',
          type: 'column',
          data: [440, 505, 414, 671, 227, 413, 201, 352, 752, 320, 257, 160],
        },
        {
          name: 'Social Media',
          type: 'line',
          data: [23, 42, 35, 27, 43, 22, 17, 31, 22, 22, 12, 16],
        },
      ],
      options: {
        chart: {
          height: 350,
          type: 'line',
        },
        stroke: {
          width: [0, 4],
        },
        title: {
          text: 'Traffic Sources',
        },
        dataLabels: {
          enabled: true,
          enabledOnSeries: [1],
        },
        labels: [
          '01 Jan 2001',
          '02 Jan 2001',
          '03 Jan 2001',
          '04 Jan 2001',
          '05 Jan 2001',
          '06 Jan 2001',
          '07 Jan 2001',
          '08 Jan 2001',
          '09 Jan 2001',
          '10 Jan 2001',
          '11 Jan 2001',
          '12 Jan 2001',
        ],
        xaxis: {
          type: 'datetime',
        },
        yaxis: [
          {
            title: {
              text: 'Website Blog',
            },
          },
          {
            opposite: true,
            title: {
              text: 'Social Media',
            },
          },
        ],
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
              <Typography variant='body1'>Unreconciled Payments</Typography>
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
                type='line'
                height={350}
              />
            </div>
          </Grid>
        </Grid>
      </Card>
    );
  }
}
