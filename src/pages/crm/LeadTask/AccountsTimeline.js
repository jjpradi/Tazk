import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAccountsTimelineAction } from 'redux/actions/leads_task_actions';
import { Card, Grid, Typography } from '@mui/material';
import TimelineDesign from '../../../../src/components/erpDesign/timeline_design'

const AccountsTimeline = (props) => {

    const dispatch = useDispatch();

    const {
        LeadsTaskReducer: { getAccountsTimeline }
    } = useSelector((state) => state)
  

    useEffect(() => {
        if(props.data) {
            dispatch(getAccountsTimelineAction(props.data))
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
              getAccountsTimeline.slice().map((listAccount) => (
                  <TimelineDesign 
                      key = {listAccount.timeline_id}
                      m = {{...listAccount, updated_at : listAccount.updatedAt}}
                      title = {listAccount.content}
                      content = {listAccount.message}
                  />
              ))
          }
      </Card>
  );
}

export default AccountsTimeline
