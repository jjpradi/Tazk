import { Box, Card, Divider, Grid, Typography } from "@mui/material"
import PropTypes from "prop-types"
import useStyles from "../../../../components/customer_erpDesign/cardStyles"

function RecordCard(props){

    const c = useStyles()

    return (
        <Grid container spacing={2}>
            <Grid display='flex' size={12}>
                <Card
                    className={c.lightSeaGreen}
                    variant='outlined'
                    sx={{
                        padding: '10px',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-evenly',
                        borderRadius: '5px'
                    }}
                >
                    <Grid>
                        <Box width='100%'>
                            <Typography variant='body1' component='div'>
                                Created By
                            </Typography>

                            <Typography variant='h6' align='center'>
                                {props.data?.created_by || '-'}
                            </Typography>
                        </Box>
                    </Grid>

                    <Divider orientation='vertical' flexItem />

                    <Grid>
                        <Box width='100%'>
                            <Typography variant='body1' component='div'>
                                Created On
                            </Typography>

                            <Typography variant='h6' align='center'>
                                {props.data?.created_on || '-'}
                            </Typography>
                        </Box>
                    </Grid>
                    {
                        props.type !== 'collectDefect' &&
                        <>
                            <Divider orientation='vertical' flexItem />

                            <Grid>
                                <Box width='100%'>
                                    <Typography variant='body1' component='div'>
                                        {props.type === 'sendDefect' ? 'Status' : props.data.type === 'VENDOR' ? 'Defect Sent On' : 'Defect Collected On'}
                                    </Typography>

                                    <Typography variant='h6' align='center'>
                                        {props.type === 'sendDefect' ? props.data?.status || '--' : props.data.type === 'VENDOR' ? props.data?.defect_sent_on || '-' : props.data?.defect_collected_on || '-'}
                                    </Typography>
                                </Box>
                            </Grid>
                        </>
                    }
                </Card>
            </Grid>
        </Grid>
    );
}

RecordCard.propTypes = {
    data: PropTypes.object,
    type: PropTypes.string
}

export default RecordCard