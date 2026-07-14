import { Card, Grid, Typography } from "@mui/material"
import useStyles from "../../../../components/customer_erpDesign/cardStyles"
import PropTypes from "prop-types"

function TopCards(props){
    
    const c = useStyles()

    return (
        <Grid container spacing={2}>
            <Grid
                size={{
                    xs: 12,
                    lg: 3,
                    md: 3,
                    sm: 3
                }}>
                <Card
                    className={c.lav}
                    variant='outlined'
                    sx={{ padding: '10px', width: '100%', borderRadius: '5px' }}
                >
                    <Typography variant='body1' align='center'>
                        {
                            (props.type === 'collectDefect' || props.type === 'sendDefect')?
                                'Quantity'
                            : 'Requested Quantity' 
                        }
                    </Typography>

                    <Typography variant='h6' align='center'>
                        {
                            (props.type === 'collectDefect' || props.type === 'sendDefect') ?
                                props.data?.total_quantity || '--'
                            : props.data?.requested_quantity || '--'
                        }
                    </Typography>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    lg: 3,
                    md: 3,
                    sm: 3
                }}>
                <Card
                    className={c.ash}
                    variant='outlined'
                    sx={{ padding: '10px', width: '100%', borderRadius: '5px' }}
                >
                    <Typography variant='body1' align='center'>
                        {
                            (props.type === 'collectDefect' || props.type === 'sendDefect') ?
                                'Total'
                            : 'Replaced Quantity'
                        }
                    </Typography>

                    <Typography variant='h6' align='center'>
                        {
                            (props.type === 'collectDefect' || props.type === 'sendDefect') ?
                                props.data?.total || '--'
                            : props.data?.replaced_quantity || '--'
                        }
                    </Typography>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    lg: 3,
                    md: 3,
                    sm: 3
                }}>
                <Card
                    className={c.lightPink}
                    variant='outlined'
                    sx={{ padding: '10px', width: '100%', borderRadius: '5px' }}
                >
                    <Typography variant='body1' align='center'>
                        {
                            props.type === 'collectDefect' ?
                                'Collect From'
                            : props.type === 'sendDefect' ?
                                'Sent to'
                            : 'Issued By'
                        }
                    </Typography>

                    <Typography variant='h6' align='center'>
                        {
                            (props.type === 'collectDefect' || props.type === 'sendDefect') ?
                                props.data?.company_name || '--'
                            : props.data?.issued_by || '--'
                        }
                    </Typography>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    lg: 3,
                    md: 3,
                    sm: 3
                }}>
                <Card
                    className={c.yellow}
                    variant='outlined'
                    sx={{ padding: '10px', width: '100%', borderRadius: '5px' }}
                >
                    <Typography variant='body1' align='center'>
                        {
                            props.type === 'collectDefect' ?
                                'Collection #'
                            : props.type === 'sendDefect' ?
                                'Send Defect #'
                            : 'Received By'
                        }
                    </Typography>

                    <Typography variant='h6' align='center'>
                        {
                            props.type === 'collectDefect' ?
                                props.data?.collection_number || '--'
                            : props.type === 'sendDefect' ?
                                props.data?.send_defect_number || '--'
                            : props.data?.received_by || '--'
                        }
                    </Typography>
                </Card>
            </Grid>
        </Grid>
    );
}

TopCards.proptypes = {
    data: PropTypes.object,
    type: PropTypes.string
}

export default TopCards