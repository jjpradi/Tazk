import React, { useEffect } from 'react'
import { Card, Grid, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import TimelineDesign from '../../../../../src/components/erpDesign/timeline_design'
import { getTimelineMessageAction } from 'redux/actions/leadManagement_actions'

const TimeLineCard = (props) => {

    const dispatch = useDispatch()

    const {
        leadManagementReducers : { getLeadTimeline }
    } = useSelector((state) => state)

    useEffect(() => {
        if(props.data.lead_id){
            dispatch(getTimelineMessageAction(props.data.lead_id))
        }
    }, [dispatch, props.data])

  return (
      <Card sx={{p: 3, mt : 4}}>
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
              getLeadTimeline.slice().map((listLead) => (
                      <TimelineDesign 
                          key = {listLead.timeline_id} 
                          m = {{...listLead, updated_at: listLead.createdAt}} 
                          title = {listLead.content} 
                          content = {listLead.message} 
                      />
                  )
              )
          }
      </Card>
  );
}

export default TimeLineCard