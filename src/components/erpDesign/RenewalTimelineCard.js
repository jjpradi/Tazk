import React, { useEffect } from 'react'
import { Card, Grid, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { ListTimeline } from 'redux/actions/timeline_actions'
import TimelineDesign from './timeline_design'
import PropTypes from 'prop-types'

const RenewalTimelineCard = ({ type, id }) => {

    const dispatch = useDispatch()

    const {
        TimelineReducers: { timelineList }
    } = useSelector((state) => state)

    useEffect(() => {
        if (id && type) {
            dispatch(ListTimeline(type, id))
        }
    }, [dispatch, id, type])

    return (
        <Card sx={{ p: 3, mt: 4 }}>
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
                        key={list.timeline_id}
                        m={{...list, updated_at: list.createdAt}}
                        title={list.content}
                        content={list.timeline_message}
                    />
                ))
            }
        </Card>
    );
}

RenewalTimelineCard.propTypes = {
    type: PropTypes.oneOf(['insurance', 'warranty', 'subscription', 'serviceDue', 'compliance', 'customRenewal']).isRequired,
    id: PropTypes.number
}

export default RenewalTimelineCard
