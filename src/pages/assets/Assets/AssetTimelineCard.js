import React, { useEffect } from 'react'
import { Card, Grid, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { ListAssetTimeline } from 'redux/actions/asset_actions'
import TimelineDesign from '../../../../src/components/erpDesign/timeline_design'
import PropTypes from 'prop-types'

const AssetTimelineCard = (props) => {

    const dispatch = useDispatch()

    const {
        AssetReducers : { timelineList }
    } = useSelector((state) => state)

    useEffect(() => {
        if(props.data) {
            dispatch(ListAssetTimeline(props.data))
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
              timelineList.slice().map((list) => (
                  <TimelineDesign 
                      key = {list.timeline_id}
                      m = {{...list, updated_at : list.createdAt}}
                      title = {list.content}
                      content = {list.timeline_message}
                  />
              ))
          }
      </Card>
  );
}

AssetTimelineCard.propTypes = {
    data : PropTypes.object
}

export default AssetTimelineCard