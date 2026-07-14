import React, { useEffect, useState } from 'react'
import { Card, Step, StepButton, Stepper, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { getCampaignStatusAction } from 'redux/actions/campaign_actions'
import PropTypes from 'prop-types'

const CampaignStatusCard = (props) => {

    const dispatch = useDispatch()

    const {
        CampaignReducers : { campaignStatusList }
    } = useSelector((state) => state)

    const [campaignStatus, setCampaignStatus] = useState(null)

    useEffect(() => {
        dispatch(getCampaignStatusAction())
    }, [dispatch])

    useEffect(() => {
        if(campaignStatusList.length > 0) {
            const val = campaignStatusList.find((status) => status.campaign_status === props.data.campaign_status)
            setCampaignStatus(val)
        }
    }, [props.data, campaignStatusList])

    const handleStatusChange = (status) => {
        if(status.campaign_status !== campaignStatus.campaign_status) {
            setCampaignStatus(status)
            props.updateCampaignStatus({
                status_id : status.status_id,
                campaign_id : props.data.campaign_id,
                campaign_status : status.campaign_status
            })
        }
    }

  return (
    <Card sx = {{ p : 3, mb : 4 }}>
        <Typography
            sx = {{
                mb : 4,
                fontWeight : 600,
                fontSize : '12px'
            }}
        >
            Campaign Status
        </Typography>

        <Stepper
            activeStep = {campaignStatus ? campaignStatus.status_id - 1 : 0}
            alternativeLabel
        >
            {
                campaignStatusList.map((status) => (
                    <Step
                        key = {status.status_id}
                        completed = {campaignStatus ? campaignStatus.status_id >= status.status_id : false}
                    >
                        <StepButton
                            sx = {{
                                '& .MuiStepIcon-root.Mui-completed' : {
                                    color : status.status_id === 4 ? 'grey' : 'rgb(35, 160, 237)',
                                }
                            }}
                            onClick = {() => handleStatusChange(status)}
                            disabled = {false}
                        >
                            {status.campaign_status}
                        </StepButton>
                    </Step>
                ))
            }
        </Stepper>
    </Card>
  )
}

CampaignStatusCard.propTypes = {
    data : PropTypes.object,
    updateCampaignStatus : PropTypes.func
}

export default CampaignStatusCard