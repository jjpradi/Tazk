import { Card, Step, StepButton, Stepper, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getLeadManagementStatusAction } from "redux/actions/leadManagement_actions"
import PropTypes from "prop-types"

function LeadStatusCard(props) {
    const dispatch = useDispatch();

    const {
        leadManagementReducers: { leadManagementStatus }
    } = useSelector((state) => state)

    const [leadStatus, setLeadStatus] = useState(null)

    useEffect(() => { (async () => {
        await dispatch(getLeadManagementStatusAction())
    })();
}, [dispatch])

    useEffect(() => {
        if (leadManagementStatus.length > 0) {
            const currentStage = props.data?.['Lead Stage'] || props.data?.['Lead Status']
            const val = leadManagementStatus.find((status) => status.status_name === currentStage)
            setLeadStatus(val)
        }
    }, [props.data, leadManagementStatus])

    const handleStatusChange = (status) => {
        if(status.status_name !== leadStatus.status_name){
            setLeadStatus(status)
            props.updateLeadStatus({
                status_id: status.status_id, 
                lead_id: props.data.lead_id,
                status_name: status.status_name
            })
        }
    }

    const statusOrder = leadManagementStatus.map((e) => e.status_name)

    const sortedStatuses = leadManagementStatus
                        .filter(status => statusOrder.includes(status.status_name))
                        .sort((a, b) => statusOrder.indexOf(a.status_name) - statusOrder.indexOf(b.status_name))

    const activeStepIndex = sortedStatuses.findIndex(status => status.status_name === leadStatus?.status_name)

    return (
        <Card sx={{ p: 3, mb: 4 }}>
            <Typography sx={{mb: 4, fontWeight: 600, fontSize: '12px'}}>Lead Stage</Typography>
                <Stepper activeStep={activeStepIndex !== -1 ? activeStepIndex : 0} alternativeLabel>
                    {
                        sortedStatuses.map((status, index) => (
                            <Step key={status.status_id} completed={index == activeStepIndex}>
                                <StepButton 
                                    sx = {{
                                        '& .MuiStepIcon-root.Mui-completed' : {
                                            color : status.status_name === 'Closed-Converted' ? 'grey' : 'rgb(35, 160, 237)'
                                        }
                                    }}
                                    onClick = {() => handleStatusChange(status)} 
                                    disabled = {false}
                                >
                                    {status.status_name}
                                </StepButton>
                            </Step>
                        ))
                    }
                </Stepper>
        </Card>
    )
}

LeadStatusCard.propTypes = {
    data: PropTypes.array,
    updateLeadStatus: PropTypes.func
}

export default LeadStatusCard
