import { Card, Grid, Typography } from '@mui/material';
import moment from 'moment';
import { getsessionStorage } from 'pages/common/login/cookies';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { activeDevicesList } from 'redux/actions/payrollDashboard_actions';

export default function Activity() {
  const dispatch = useDispatch()
  const storage = getsessionStorage()
  const { PayrolldashboardReducers: {activedeviceslist}, customerReducer: {customer_paginate}} = useSelector(state => state)
console.log(activedeviceslist, customer_paginate,'activedeviceslist')

let person_id = storage?.person_id
useEffect(() => {
  if (person_id) {
    dispatch(activeDevicesList(person_id))
  }
}, [person_id, dispatch])

  return (
    <Grid 
      container 
      justifyContent="center" 
      alignItems="flex-start" 
      sx={{ height: '100vh', width: '83vw', paddingTop: 5 }} 
    >
      <Card 
        sx={{ 
          width: '100%',
          overflow: "hidden",
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'flex-start', 
          padding: 5,
        }} 
      >
        <Typography variant="h6" gutterBottom>
          Last Activated Device
        </Typography>

        <Grid container spacing={1}>
          <Grid
            size={{
              lg: 3,
              md: 4,
              sm: 4,
              xs: 12
            }}>
            <Typography>Device Name: {activedeviceslist[0]?.device_name}</Typography>
          
          </Grid>
     

<Grid
  size={{
    lg: 3,
    md: 4,
    sm: 4,
    xs: 12
  }}>
  <Typography>
    Last Active Date: {activedeviceslist[0]?.last_active_date 
      ? moment(activedeviceslist[0].last_active_date).format('DD/MM/YYYY HH:mm:A') 
      : 'N/A'}
  </Typography>
</Grid>
        </Grid>
      </Card>
    </Grid>
  );
}
