import { Badge, Box, ButtonBase, Card, Chip, Grid, Typography } from "@mui/material";
import PropTypes from "prop-types";
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { useTheme } from "@mui/material/styles";
import { useState } from "react";

function BankReconciliationCountValueCard(props) {

    const [hover, setHover] = useState(false)

    return (
        <div
            onClick={() => props.handleClick(props.title)}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                display: 'inline-block',
                cursor: 'pointer',
                borderRadius: '16px',
                boxShadow: hover || props.selectedCard === props.title ? '0px 4px 12px rgba(0,0,0,0.3)' : '0px 2px 4px rgba(0,0,0,0.2)',
            }}
        >
            <Card
                sx={{
                    p: 2,
                    height: '62px',
                    position: 'relative',
                    overflow: 'visible',
                    backgroundColor: props.selectedCard === props.title ? 'rgb(10,143,220)' : 'rgb(255,255,255)',
                    color: props.selectedCard === props.title ? 'white' : 'black'
                }}
            >
                <Box sx={{ position: 'absolute', top: 0, right: 18 }}>
                    <Badge
                        badgeContent={props.count}
                        color={props.title === 'Unreconciled' ? 'error' : 'success'}
                    />
                </Box>

                <Grid container spacing={2}>
                    <Grid sx={{ paddingTop: '3px !important' }} size={12}>
                        <Typography textAlign="center" sx={{ color: props.selectedCard === props.title ? 'white' : 'black', fontSize: '12px', fontWeight: 600 }}>{props.title}</Typography>
                    </Grid>

                    <Grid
                        display="flex"
                        alignItems="center"
                        justifyContent="flex-end"
                        sx={{ paddingTop: '3px !important' }}
                        size={12}>
                        <CurrencyRupeeIcon sx={{ pb: '5px', pt: '5px' }} />
                        <Typography textAlign="end" sx={{ fontSize: '12px' }}>
                            {props.value}
                        </Typography>
                    </Grid>
                </Grid>
            </Card>
        </div>
    );
}

BankReconciliationCountValueCard.propTypes = {
    title: PropTypes.string,
    count: PropTypes.number,
    value: PropTypes.string,
    handleClick: PropTypes.func,
    selectedCard: PropTypes.string
};

export default BankReconciliationCountValueCard;