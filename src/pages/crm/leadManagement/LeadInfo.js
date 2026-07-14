import { Container, Card, Typography, Grid, Box } from "@mui/material"
import moment from 'moment';
import { PropTypes } from 'prop-types';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCreatedByAndUpdatedByFullNameAction } from 'redux/actions/leadManagement_actions';

const LeadInfo =(props)=>{

    const {data} = props

    const dispatch = useDispatch()
    const {
        leadManagementReducers: { createdByUpdatedByFullName }
    } = useSelector(state => state)

    useEffect(() => {
        if(Object.keys(data).length > 0){
            dispatch(getCreatedByAndUpdatedByFullNameAction({createdBy: data.createdBy, updatedBy: data.updatedBy}))
        }
    }, [data])

    return (
        <Container>
            <Card style={{padding:'30px',width:'100%',margin:'20px auto',display:'flex',justifyContent:'space-between'}}>

                <Grid
                    container
                    direction='column'
                    spacing={2}
                    width= {'350px'}
                    size={{
                        lg: 6,
                        md: 6,
                        sm: 6,
                        xs: 12
                    }}>
                    <Typography variant="h5" fontWeight={'bold'} mb={'10px'}>Lead Information</Typography>
                    <Grid container justifyContent='space-between'>
                        <Typography color={"textSecondary"}>Lead Owner</Typography>
                        <Typography>{data['Lead Owner']}</Typography>
                    </Grid>
                    <Grid container justifyContent='space-between'>
                        <Typography color={"textSecondary"}>Lead Name</Typography>
                        <Typography>{data['Lead Name']}</Typography>
                    </Grid>
                    <Grid container justifyContent='space-between'>
                        <Typography color={"textSecondary"}>Account Name</Typography>
                        <Typography>{data.company_name}</Typography>
                    </Grid>
                    <Grid container justifyContent='space-between'>
                        <Typography color={"textSecondary"}>Industry</Typography>
                        <Typography>{data.customer_industry ? data.customer_industry : '-'}</Typography>
                    </Grid>
                    {/* <Grid container justifyContent='space-between'>
                        <Typography color={"textSecondary"}>Next Step</Typography>
                        <Typography>-</Typography>
                    </Grid> */}
                    <Grid container justifyContent='space-between'>
                        <Typography color={"textSecondary"}>Lead Source</Typography>
                        <Typography>{data['Lead Source']}</Typography>
                    </Grid>
                    <Grid container justifyContent='space-between'>
                        <Typography color={"textSecondary"}>Contact Name</Typography>
                        <Typography>{data.customerLastName ? `${data.customerFirstName} ${data.customerLastName}` : data.customerFirstName}</Typography>
                    </Grid>
                    <Grid container justifyContent='space-between'>
                    <Typography color={"textSecondary"}>Modified By</Typography>
                        <Box >
                        <Typography>
                            {createdByUpdatedByFullName.updatedByFullName ? createdByUpdatedByFullName.updatedByFullName : '-'}
                        </Typography>
                        <Typography>
                            {data.updatedAt ? moment(data.updatedAt).format('DD/MM/YYYY hh:mm A') : '-'}
                        </Typography>
                        </Box>
                    </Grid>
                    
                </Grid>

                <Grid
                    container
                    direction='column'
                    spacing={2}
                    width= {'350px'}
                    size={{
                        lg: 6,
                        md: 6,
                        sm: 6,
                        xs: 12
                    }}>
                    <Typography variant="h5" fontWeight={'bold'} mb={'10px'}>Description Information</Typography>
                  
                    <Grid container justifyContent='space-between'>
                        <Typography color={"textSecondary"}>Approx Value</Typography>
                        <Typography>{data['Approx Value'] ? data['Approx Value'] : '-'}</Typography>
                    </Grid>
                    <Grid container justifyContent='space-between'>
                        <Typography color={"textSecondary"}>Closing Date</Typography>
                        <Typography>{`-`}</Typography>
                    </Grid>
                    <Grid container justifyContent='space-between'>
                        <Typography color={"textSecondary"}>Stage</Typography>
                        <Typography>{data['Lead Stage'] || data['Lead Status']}</Typography>
                    </Grid>
                    <Grid container justifyContent='space-between'>
                        <Typography color={"textSecondary"}> Probability(%)</Typography>
                        <Typography>{`-`}</Typography>
                    </Grid>
                    <Grid container justifyContent='space-between'>
                        <Typography color={"textSecondary"}>Expected Revenue</Typography>
                        <Typography>{`-`}</Typography>
                    </Grid>
                    <Grid container justifyContent='space-between'>
                        <Typography color={"textSecondary"}>Campaign</Typography>
                        <Typography>{data['Campaign'] ? data['Campaign'] : '-'}</Typography>
                    </Grid>
                    <Grid container justifyContent='space-between'>
                    <Typography color={"textSecondary"}>Created By</Typography>
                        <Box >
                        <Typography>
                            {createdByUpdatedByFullName.createdByFullName ? createdByUpdatedByFullName.createdByFullName : '-'}
                        </Typography>
                        <Typography>
                            {data.createdAt ? moment(data.createdAt).format('DD/MM/YYYY hh:mm A') : '-'}
                        </Typography>
                        </Box>
                    </Grid>
                    
                </Grid>
            </Card>
        </Container>
    );
}

LeadInfo.propTypes = {
    data: PropTypes.object
}

export default LeadInfo;
