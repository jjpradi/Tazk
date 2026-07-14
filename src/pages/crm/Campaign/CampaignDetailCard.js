import { Card, Grid, Typography } from '@mui/material';
import moment from 'moment';
import PropTypes from 'prop-types';

const fontSize12Sx = { fontSize: '12px' };

function CampaignDetailCard(props){

  return (
      <Card sx={{p: 5}}>
          <Grid container spacing={3}>
              <Grid
                  size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                  }}>
                  <Typography variant='h6'>Campaign Details</Typography>
              </Grid>

              <Grid
                  size={{
                      lg: 6,
                      md: 6,
                      sm: 12,
                      xs: 12
                  }}>
                  <Grid container spacing={3}>
                      <Grid
                          ld={12}
                          size={{
                              md: 12,
                              sm: 12,
                              xs: 12
                          }}>
                          <Grid container spacing={3}>
                              <Grid
                                  display='flex'
                                  justifyContent='flex-end'
                                  textAlign='center'
                                  size={{
                                      lg: 4,
                                      md: 4,
                                      sm: 4,
                                      xs: 4
                                  }}>
                                  <Typography variant='h6'>Campaign Owner</Typography>
                              </Grid>
                              
                              <Grid
                                  display='flex'
                                  justifyContent='flex-start'
                                  textAlign='center'
                                  size={{
                                      lg: 6,
                                      md: 6,
                                      sm: 6,
                                      xs: 6
                                  }}>
                                  <Typography sx={fontSize12Sx}>{props.data.campaign_ownerLastName === null || props.data.campaign_ownerLastName === '' ? props.data.campaign_ownerFirstName : `${props.data.campaign_ownerFirstName} ${props.data.campaign_ownerLastName}`}</Typography>
                              </Grid>
                          </Grid>
                      </Grid>

                      <Grid
                          ld={12}
                          size={{
                              md: 12,
                              sm: 12,
                              xs: 12
                          }}>
                          <Grid container spacing={3}>
                              <Grid
                                  display='flex'
                                  justifyContent='flex-end'
                                  textAlign='center'
                                  size={{
                                      lg: 4,
                                      md: 4,
                                      sm: 4,
                                      xs: 4
                                  }}>
                                  <Typography variant='h6'>Campaign Name</Typography>
                              </Grid>
                              
                              <Grid
                                  display='flex'
                                  justifyContent='flex-start'
                                  textAlign='center'
                                  size={{
                                      lg: 6,
                                      md: 6,
                                      sm: 6,
                                      xs: 6
                                  }}>
                                  <Typography sx={fontSize12Sx}>{props.data.campaign_name}</Typography>
                              </Grid>
                          </Grid>
                      </Grid>

  <Grid
      ld={12}
      size={{
          md: 12,
          sm: 12,
          xs: 12
      }}>
      <Grid container spacing={3}>
          <Grid
              display='flex'
              justifyContent='flex-end'
              textAlign='center'
              size={{
                  lg: 4,
                  md: 4,
                  sm: 4,
                  xs: 4
              }}>
              <Typography variant='h6'>Start Date</Typography>
          </Grid>
          
          <Grid
              display='flex'
              justifyContent='flex-start'
              textAlign='center'
              size={{
                  lg: 6,
                  md: 6,
                  sm: 6,
                  xs: 6
              }}>
              <Typography sx={fontSize12Sx}>
                  {moment(props.data.start_date).format('DD/MM/YYYY')}
              </Typography>
          </Grid>
      </Grid>
  </Grid>

                      <Grid
                          ld={12}
                          size={{
                              md: 12,
                              sm: 12,
                              xs: 12
                          }}>
                          <Grid container spacing={3}>
                              <Grid
                                  display='flex'
                                  justifyContent='flex-end'
                                  textAlign='center'
                                  size={{
                                      lg: 4,
                                      md: 4,
                                      sm: 4,
                                      xs: 4
                                  }}>
                                  <Typography variant='h6'>Actual Cost</Typography>
                              </Grid>
                              
                              <Grid
                                  display='flex'
                                  justifyContent='flex-start'
                                  textAlign='center'
                                  size={{
                                      lg: 6,
                                      md: 6,
                                      sm: 6,
                                      xs: 6
                                  }}>
                                  <Typography sx={fontSize12Sx}>{props.data.actual_cost}</Typography>
                              </Grid>
                          </Grid>
                      </Grid>

                      <Grid
                          ld={12}
                          size={{
                              md: 12,
                              sm: 12,
                              xs: 12
                          }}>
                          <Grid container spacing={3}>
                              <Grid
                                  display='flex'
                                  justifyContent='flex-end'
                                  textAlign='center'
                                  size={{
                                      lg: 4,
                                      md: 4,
                                      sm: 4,
                                      xs: 4
                                  }}>
                                  <Typography variant='h6'>Created By</Typography>
                              </Grid>
                              
                              <Grid
                                  size={{
                                      lg: 6,
                                      md: 6,
                                      sm: 6,
                                      xs: 6
                                  }}>
                                  <Grid container>
                                      <Grid
                                          display='flex'
                                          justifyContent='flex-start'
                                          textAlign='center'
                                          size={{
                                              lg: 12,
                                              md: 12,
                                              sm: 12,
                                              xs: 12
                                          }}>
                                          <Typography sx={fontSize12Sx}>{props.data.createdByFullName}</Typography>
                                      </Grid>

                                      <Grid
                                          display='flex'
                                          justifyContent='flex-start'
                                          textAlign='center'
                                          size={{
                                              lg: 12,
                                              md: 12,
                                              sm: 12,
                                              xs: 12
                                          }}>
                                          <Typography sx={fontSize12Sx}>{moment(props.data.createdAt).format('ddd, DD MMM YYYY h:mm A')}</Typography>
                                      </Grid>
                                  </Grid>
                              </Grid>
                          </Grid>
                      </Grid>

                      <Grid
                          ld={12}
                          size={{
                              md: 12,
                              sm: 12,
                              xs: 12
                          }}>
                          <Grid container spacing={3}>
                              <Grid
                                  display='flex'
                                  justifyContent='flex-end'
                                  textAlign='center'
                                  size={{
                                      lg: 4,
                                      md: 4,
                                      sm: 4,
                                      xs: 4
                                  }}>
                                  <Typography variant='h6'>Description</Typography>
                              </Grid>
                              
                              <Grid
                                  display='flex'
                                  justifyContent='flex-start'
                                  textAlign='center'
                                  size={{
                                      lg: 6,
                                      md: 6,
                                      sm: 6,
                                      xs: 6
                                  }}>
                                  <Typography sx={fontSize12Sx}>{props.data.description || '-'}</Typography>
                              </Grid>
                          </Grid>
                      </Grid>
                  </Grid>
              </Grid>
          
              <Grid
                  size={{
                      lg: 6,
                      md: 6,
                      sm: 12,
                      xs: 12
                  }}>
                  <Grid container spacing={3}>
                      <Grid
                          ld={12}
                          size={{
                              md: 12,
                              sm: 12,
                              xs: 12
                          }}>
                          <Grid container spacing={3}>
                              <Grid
                                  display='flex'
                                  justifyContent='flex-end'
                                  textAlign='center'
                                  size={{
                                      lg: 4,
                                      md: 4,
                                      sm: 4,
                                      xs: 4
                                  }}>
                                  <Typography variant='h6'>Type</Typography>
                              </Grid>
                              <Grid
                                  display='flex'
                                  justifyContent='flex-start'
                                  textAlign='center'
                                  size={{
                                      lg: 6,
                                      md: 6,
                                      sm: 6,
                                      xs: 6
                                  }}>
                                  <Typography sx={fontSize12Sx}>{props.data.campaign_type}</Typography>
                              </Grid>
                          </Grid>
                      </Grid>

                      <Grid
                          ld={12}
                          size={{
                              md: 12,
                              sm: 12,
                              xs: 12
                          }}>
                      <Grid container spacing={3}>
                              <Grid
                                  display='flex'
                                  justifyContent='flex-end'
                                  textAlign='center'
                                  size={{
                                      lg: 4,
                                      md: 4,
                                      sm: 4,
                                      xs: 4
                                  }}>
                                  <Typography variant='h6'>Status</Typography>
                              </Grid>
                              
                              <Grid
                                  display='flex'
                                  justifyContent='flex-start'
                                  textAlign='center'
                                  size={{
                                      lg: 6,
                                      md: 6,
                                      sm: 6,
                                      xs: 6
                                  }}>
                                  <Typography sx={fontSize12Sx}>{props.data.campaign_status}</Typography>
                              </Grid>
                          </Grid>
                      </Grid>

                

  <Grid
      size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
      }}>
    <Grid container spacing={3}>
      <Grid
          display="flex"
          justifyContent="flex-end"
          textAlign="center"
          size={{
              lg: 4,
              md: 4,
              sm: 4,
              xs: 4
          }}>
        <Typography variant="h6">End Date</Typography>
      </Grid>
      
      <Grid
          display="flex"
          justifyContent="flex-start"
          textAlign="center"
          size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 6
          }}>
        <Typography sx={fontSize12Sx}>
          {moment(props.data.end_date).format('DD/MM/YYYY')}
        </Typography>
      </Grid>
    </Grid>
  </Grid>

                      <Grid
                          ld={12}
                          size={{
                              md: 12,
                              sm: 12,
                              xs: 12
                          }}>
                          <Grid container spacing={3}>
                              <Grid
                                  display='flex'
                                  justifyContent='flex-end'
                                  textAlign='center'
                                  size={{
                                      lg: 4,
                                      md: 4,
                                      sm: 4,
                                      xs: 4
                                  }}>
                                  <Typography variant='h6'>Expected Revenue</Typography>
                              </Grid>
                              
                              <Grid
                                  display='flex'
                                  justifyContent='flex-start'
                                  textAlign='center'
                                  size={{
                                      lg: 6,
                                      md: 6,
                                      sm: 6,
                                      xs: 6
                                  }}>
                                  <Typography sx={fontSize12Sx}>{props.data.expected_revenue || '-'}</Typography>
                              </Grid>
                          </Grid>
                      </Grid>

                      <Grid
                          ld={12}
                          size={{
                              md: 12,
                              sm: 12,
                              xs: 12
                          }}>
                      <Grid container spacing={3}>
                              <Grid
                                  display='flex'
                                  justifyContent='flex-end'
                                  textAlign='center'
                                  size={{
                                      lg: 4,
                                      md: 4,
                                      sm: 4,
                                      xs: 4
                                  }}>
                                  <Typography variant='h6'>Updated By</Typography>
                              </Grid>
                              
                              <Grid
                                  size={{
                                      lg: 6,
                                      md: 6,
                                      sm: 6,
                                      xs: 6
                                  }}>
                                  <Grid container>
                                      <Grid
                                          display='flex'
                                          justifyContent='flex-start'
                                          textAlign='center'
                                          size={{
                                              lg: 12,
                                              md: 12,
                                              sm: 12,
                                              xs: 12
                                          }}>
                                          <Typography sx={fontSize12Sx}>{props.data.updatedByFullName || '-'}</Typography>
                                      </Grid>

                                      <Grid
                                          display='flex'
                                          justifyContent='flex-start'
                                          textAlign='center'
                                          size={{
                                              lg: 12,
                                              md: 12,
                                              sm: 12,
                                              xs: 12
                                          }}>
                                          <Typography sx={fontSize12Sx}>{props.data.updatedByFullName ? moment(props.data.updatedAt).format('ddd, DD MMM YYYY h:mm A') : ''}</Typography>
                                      </Grid>
                                  </Grid>
                              </Grid>
                          </Grid>
                      </Grid>
                  </Grid>
              </Grid>
          </Grid>
      </Card>
  );

}

CampaignDetailCard.propTypes = {
  data: PropTypes.object
}

export default CampaignDetailCard