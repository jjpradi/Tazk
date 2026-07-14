import React, { useEffect } from 'react'
import { Card, Grid, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { getCampaignTimelineAction } from 'redux/actions/campaign_actions'
import TimelineDesign from '../../../components/erpDesign/timeline_design'
import PropTypes from 'prop-types'

const CampaignTimelineCard = (props) => {

    const dispatch = useDispatch()

    const {
        CampaignReducers : { getCampaignTimeline }
    } = useSelector((state) => state)

    useEffect(() => {
        if(props.data.campaign_id) {
            dispatch(getCampaignTimelineAction(props.data.campaign_id))
        }
    }, [dispatch, props.data])

  return (
      <Card sx={{ p : 3, mt : 4 }}>
          <Grid
              size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
              }}>
              <Typography variant='h4' align='left'>
                  TimeLine
              </Typography>
          </Grid>
          {
              getCampaignTimeline.slice().map((listCampaign) => (
                  <TimelineDesign 
                      key = {listCampaign.timeline_id}
                      m = {{...listCampaign, updated_at : listCampaign.createdAt}}
                      title = {listCampaign.content}
                      content = {listCampaign.message}
                  />
              ))
          }
      </Card>
  );
}

CampaignTimelineCard.propTypes = {
    data : PropTypes.object
}

export default CampaignTimelineCard