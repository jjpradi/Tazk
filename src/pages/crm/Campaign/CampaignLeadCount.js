import React, { useEffect } from 'react'
import { Box, Card, Grid, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { getCampaignConvertedLeadsCountAndValueAction, getCampaignLeadCountAction } from 'redux/actions/campaign_actions'
import useStyles from '../../../components/customer_erpDesign/cardStyles';

const CampaignLeadCount = (props) => {

    const dispatch = useDispatch()
    const styles = useStyles()

    const {
        CampaignReducers : { getCampaignLeadCount, convertLeadsCountValue }
    } = useSelector((state) => state)

    useEffect(() => {
        if(props.data.campaign_id) {
            dispatch(getCampaignLeadCountAction(props?.data.campaign_id))
            dispatch(getCampaignConvertedLeadsCountAndValueAction(props?.data.campaign_id))
        }
    }, [dispatch, props?.data])

  return (
      <Grid container spacing={2}>
          <Grid
              size={{
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 12
              }}>
              <Box>
                  <Card
                      className={styles.red}
                      variant = 'outlined'
                      sx = {{
                          padding : '10px',
                          width : '100%',
                          borderRadius : 2,
                          bgcolor : 'green',
                          color : 'white'
                      }}
                  >
                      <Typography variant='body1' component='div' align='center'>
                          No Of Leads
                      </Typography>

                      <Typography variant='h6' align='center'>
                          {getCampaignLeadCount.totalLeadCount}
                      </Typography>
                  </Card>
              </Box>
          </Grid>
          <Grid
              size={{
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 4
              }}>
              <Box>
                  <Card
                      className={styles.blue}
                      variant = 'outlined'
                      sx = {{
                          padding : '10px',
                          width : '100%',
                          borderRadius : 2,
                          bgcolor : 'yellow',
                          color : 'white'
                      }}
                  >
                      <Typography variant='body1' component='div' align='center'>
                          Total Approx Value
                      </Typography>

                      <Typography variant='h6' align='center'>
                          {getCampaignLeadCount.approxValueTotal}
                      </Typography>
                  </Card>
              </Box>
          </Grid>
          {/* Converted Leads Count */}
          <Grid
              size={{
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 4
              }}>
              <Box>
                  <Card
                      className={styles.green}
                      variant = 'outlined'
                      sx = {{
                          padding : '10px',
                          width : '100%',
                          borderRadius : 2,
                          bgcolor : 'yellow',
                          color : 'white'
                      }}
                  >
                      <Typography variant='body1' component='div' align='center'>
                          Total Converted Leads
                      </Typography>

                      <Typography variant='h6' align='center'>
                          {convertLeadsCountValue.totalConvertedLeadCount}
                      </Typography>
                  </Card>
              </Box>
          </Grid>
          {/* Converted Leads Total Value */}
          <Grid
              size={{
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 4
              }}>
              <Box>
                  <Card
                      className={styles.yellow}
                      variant = 'outlined'
                      sx = {{
                          padding : '10px',
                          width : '100%',
                          borderRadius : 2,
                          bgcolor : 'yellow',
                          color : 'white'
                      }}
                  >
                      <Typography variant='body1' component='div' align='center'>
                          Total Converted Leads Approx Value
                      </Typography>

                      <Typography variant='h6' align='center'>
                          {convertLeadsCountValue.totalConvertedLeadsApproxValue}
                      </Typography>
                  </Card>
              </Box>
          </Grid>
      </Grid>
  );
}

export default CampaignLeadCount