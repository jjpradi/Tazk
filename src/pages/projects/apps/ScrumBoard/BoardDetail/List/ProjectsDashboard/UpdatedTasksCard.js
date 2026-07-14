import React from 'react'
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { useSelector } from 'react-redux';
import DashboardTile from 'components/DashboardTile';
import updatedIcon from  'assets/dashboardIcons/updated.jpg';
import { useTheme } from "@mui/material/styles";
import { Card, CardContent, Grid, Typography } from '@mui/material';
const UpdatedTasksCard = () => {

    const {PayrolldashboardReducers : {getTasksCount}} = useSelector((state)=> state)
    const theme = useTheme()

  return (
      <div>
          <Card style={{ display: 'flex', alignItems: 'center' }}>
                      <CardContent style={{ display: "contents", justifyContent: "center", flexDirection: "column" }}>
                          <Grid container>
                                      <Grid
                                          size={{
                                              lg: 12,
                                              md: 12,
                                              sm: 12,
                                              xs: 12
                                          }}>
                                          <Typography className='dashboard-tile-header' sx={{backgroundColor: theme.palette.primary.main}}>{'Updated Tasks'}</Typography>
                                      </Grid>

                                      <Grid
                                          display='flex'
                                          alignItems={'center'}
                                          width={'270px'}
                                          justifyContent='space-around'
                                          padding={1}>
                                          <Grid style={{ width: '35px', height: '40px'}}>
                                              <Grid style={{ width: '35px', height: '35px'}}>
                                                  <img src={updatedIcon} style={{ width : '100%', height : '100%', objectFit: 'contain'}}/>
                                              </Grid>
                                              
                                          </Grid>
                                          <Typography className='dashboard-chart-content-new' ml={'75px'} >
                                                                      {getTasksCount[0].updated_tasks_count}
                                              </Typography>
                                      </Grid>

                                     

                                  </Grid>


                      </CardContent>
                  </Card>
      </div>
  );
}

export default UpdatedTasksCard