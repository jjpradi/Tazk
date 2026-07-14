import { Card, Grid, Typography } from "@mui/material";
import { PropTypes } from 'prop-types';

const LeadCard = (props) => {

    const {data} = props

    return (
        <Card style={{ padding: '30px',width:'100%',  margin: '20px auto' }}>
            <Grid container direction="column" spacing={2} width= {'350px'}>
                <Grid container justifyContent="space-between">
                    <Typography color="textSecondary">Lead Owner</Typography>
                    <Typography>{data['Lead Owner']}</Typography>
                </Grid>
                <Grid container justifyContent="space-between">
                    <Typography color="textSecondary">Stage</Typography>
                    <Typography>{data['Lead Stage'] || data['Lead Status']}</Typography>
                </Grid>
                <Grid container justifyContent="space-between">
                    <Typography color="textSecondary">Probability (%)</Typography>
                    <Typography>{`-`}</Typography>
                </Grid>
                <Grid container justifyContent="space-between">
                    <Typography color="textSecondary">Expected Revenue</Typography>
                    <Typography>{`-`}</Typography>
                </Grid>
                <Grid container justifyContent="space-between">
                    <Typography color="textSecondary">Closing Date</Typography>
                    <Typography>{`-`}</Typography>
                </Grid>
            </Grid>
        </Card>
    );
}

LeadCard.propTypes = {
    data: PropTypes.object
}

export default LeadCard;
