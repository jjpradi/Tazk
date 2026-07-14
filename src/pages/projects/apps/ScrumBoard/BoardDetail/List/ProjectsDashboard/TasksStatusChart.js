import { Card, Grid, Typography } from '@mui/material'
import NoRecordFound from 'components/Layout/NoRecordFound'
import React from 'react'
import ReactApexChart from 'react-apexcharts'
import { useSelector } from 'react-redux'

const TasksStatusChart = () => {
        const {
          PayrolldashboardReducers: { getTaskDataStatus},
         
        } = useSelector((state) => state);
      const taskStatusData = Array.isArray(getTaskDataStatus) ? getTaskDataStatus : []

  return (
      <div>
          <Grid 
                      container
                      width='100%'
                      height='100%'
                  >
                      <Grid
                          width='100%'
                          height='100%'
                          size={{
                              lg: 12,
                              md: 12,
                              sm: 12,
                              xs: 12
                          }}>
                          <Card style={{width: '100%', height: '100%',paddingBottom:'30px'}}>
                              <Grid container>

                              <Grid container  sx={{p: '20px', pt: '30px'}}>
                                      <Typography variant='h6'>TASK STATUS OVERVIEW</Typography>

                                  </Grid>

                                  <Grid
                                      size={{
                                          lg: 12,
                                          md: 12,
                                          sm: 12,
                                          xs: 12
                                      }}>
                                      {
                                          taskStatusData.length > 0 ? (
                                              <>
                                                  <ReactApexChart
                                                      options={{
                                                          chart: {
                                                              type: 'donut',
                                                          },
                                                          legend: {
                                                              formatter: (val, opts) => {
                                                                  return `${val}: ${taskStatusData[opts.seriesIndex]?.value}`
                                                              },
                                                          },
                                                          labels: taskStatusData.map((item) => item.name),
                                                          responsive: [
                                                              {
                                                                breakpoint: 1400,
                                                                options: {
                                                                  chart: {
                                                                    width: '100%',
                                                                    height: 315
                                                                  },
                                                                  legend: {
                                                                    position: 'right',
                                                                    // align: 'left'
                                                                  }
                                                                }
                                                              },
                                                              {
                                                                breakpoint: 2100,
                                                                options: {
                                                                  chart: {
                                                                    width: '100%',
                                                                    height: 290
                                                                  },
                                                                  legend: {
                                                                    position: 'right',
                                                                    // align: 'left'
                                                                  }
                                                                }
                                                              },
                                                              {
                                                                breakpoint: 7000,
                                                                options: {
                                                                  chart: {
                                                                    width: '100%',
                                                                    height: 290
                                                                  },
                                                                  legend: {
                                                                    position: 'right',
                                                                    // align: 'left'
                                                                  }
                                                                }
                                                              },
                                                              {
                                                                breakpoint: 10000,
                                                                options: {
                                                                  chart: {
                                                                    width: '100%',
                                                                    height: 290
                                                                  },
                                                                  legend: {
                                                                    position: 'right',
                                                                    // align: 'left'
                                                                  }
                                                                }
                                                              },
                                                          ],
                                                      }}
                                                      series={taskStatusData.map((item) => item.value)}
                                                      type='donut'
                                                  />
                                              </>
                                          )
                                          : (
                                              <>
                                                  <Grid container display='flex' justifyContent='center' alignItems='center' height={290}>
                                                      <Grid paddingTop='93px'>
                                                          <NoRecordFound />
                                                      </Grid>
                                                  </Grid>   
                                              </>
                                          )
                                      }
                                  </Grid>
                              </Grid>
                          </Card>
                      </Grid>
                  </Grid>
      </div>
  );
}

export default TasksStatusChart
