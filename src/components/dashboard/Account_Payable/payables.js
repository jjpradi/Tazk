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

export default function Payables(props) {

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
          <List sx={props.style} component='nav' aria-label='mailbox folders'>
            <Typography variant='body1'>Payables</Typography>
          </List>
          <Divider />
          <Grid
            size={{
              xs: 12,
              md: 12,
              lg: 6,
              sm: 12
            }}>
            <Card
              variant='outlined'
              style={{width: '100%', height: '30px', marginTop: '8px'}}
              align='center'
            >
              <Grid
                size={{
                  xs: 12,
                  md: 12,
                  lg: 12,
                  sm: 12
                }}>
                <Typography variant='v1'>OutStanding</Typography>
              </Grid>
            </Card>
            <Grid
              size={{
                xs: 12,
                md: 12,
                lg: 12,
                sm: 12
              }}>
              <Typography variant='body1'>
                ${props.consolidated_data.map((d) => d.total_amount)}
              </Typography>
            </Grid>
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 12,
              lg: 6,
              sm: 12
            }}>
            <Card
              variant='outlined'
              style={{width: '100%', height: '30px'}}
              align='center'
            >
              <Grid
                size={{
                  xs: 12,
                  md: 12,
                  lg: 12,
                  sm: 12
                }}>
                <Typography variant='v1'>Overdue</Typography>
              </Grid>
            </Card>
            <Grid
              style={{minHeight: '70px'}}
              size={{
                xs: 12,
                md: 12,
                lg: 12,
                sm: 12
              }}>
              <Typography variant='body1'>
                ${props.consolidated_data.map((d) => d.due_amount)}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Card>
  );
}
