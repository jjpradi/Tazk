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

export default class Payable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [44, 55, 41, 17, 15],
      options: {
        chart: {
          type: 'donut',
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200,
              },
              legend: {
                position: 'bottom',
              },
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
              <Typography variant='body1'>Payable by currency</Typography>
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
                type='donut'
              />
            </div>
          </Grid>
        </Grid>
      </Card>
    );
  }
}
