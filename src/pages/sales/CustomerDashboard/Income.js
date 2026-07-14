import React from 'react'
import useCommonRef from 'pages/common/home/useCommonRef'
import { Card, Grid, IconButton, Typography } from '@mui/material'
import ReactApexChart from 'react-apexcharts'
import NoRecordFound from 'components/Layout/NoRecordFound'

const Income = (props) => {

    const data = props?.data || []

    const chartOptions = {
        chart : {
            type : 'bar',
            height : 350,
            stacked : true,
            toolbar : {
                show : false
            },
            zoom : {
                enabled : false
            }
        },
        responsive : [
            {
                breakpoint : 480,
                options : {
                    legend : {
                        position : 'bottom',
                        offsetX : -10,
                        offsetY : 0
                    }
                }
            }
        ],
        plotOptions : {
            bar : {
                horizontal : false,
                borderRadius : 5,
                dataLabels : {
                    total : {
                        enabled : true,
                        style : {
                            fontSize : '12px',
                            fontWeight : 'normal'
                        }
                    }
                }
            }
        },
        xaxis: {
            categories : data.map(item => item.month)
        },
        legend : {
            position : 'right',
            offsetY : 40
        }
      }
    
      const chartSeries = [
        {
          name : 'Total Sales',
          data : data.map(item => item.total_sales)
        }
      ]
    console.log(props.data, 'ujrefureh')
  return (
      <Card
          ref = {(el) => {
              props.ref1(el)
              props.isVisibleRef.current = el
          }}
          style = {{ width : '100%', height : '100%' }}
      >
          <Grid 
              container
              display = 'flex'
             justifyContent = 'space-between'
              alignItems = 'center'
              style = {{ 
                  padding : '18px', 
                  paddingTop : props.mode === 'edit' ? '3px' : '13px' 
              }}
          >
              <Grid>
                  <Typography variant="h6">Income</Typography>
              </Grid>

              <Grid>
                  {
                      props.mode === 'edit' ?
                      <IconButton
                          aria-label = "view code"
                          onClick = {() => props.setCardClose()}
                          size = 'large'
                      >
                          {props.isEnabled ? <props.VisibilityOffIcon /> : <props.VisibilityOffIcon />}
                      </IconButton>
                      :
                      <></>
                  }
              </Grid>

              <Grid
                  size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                  }}>
                  {
                      data.length > 0 ? (
                          <ReactApexChart
                              options = {chartOptions}
                              series = {chartSeries}
                              type = 'bar'
                              height = {330}
                          />
                      ) : (
                          <NoRecordFound />
                      )
                  }
              </Grid>
          </Grid>
      </Card>
  );
}

export default useCommonRef(Income)