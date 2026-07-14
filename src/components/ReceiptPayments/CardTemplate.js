import { Box, Stack, Typography } from "@mui/material";
import PropTypes from "prop-types";
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

function CardTemplate(props) {
    const borderColor = (props.title === 'Payable' || props.title === 'Receivable')
        ? '#ed6c02'
        : props.title === 'Available Credit'
            ? '#2e7d32'
            : '#1976d2';

    return (
        <Box sx={{
            bgcolor: 'white',
            borderRadius: 2,
            p: 1.5,
            borderLeft: `4px solid ${borderColor}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
            <Typography
                variant="caption"
                sx={{
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: 'text.secondary',
                }}
            >
                {props.title}
            </Typography>
            <Stack direction='row' alignItems='center' spacing={0.5} sx={{ mt: 0.75 }}>
                <CurrencyRupeeIcon sx={{ fontSize: 20, color: 'text.primary' }} />
                <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {props.selectedCustomerSupplier !== null
                        ? Number(props.value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : '0.00'}
                </Typography>
            </Stack>
        </Box>
    );
}

CardTemplate.propTypes = {
    totalIcon: PropTypes.string,
    selectedCustomerSupplier: PropTypes.object,
    value: PropTypes.number,
    title: PropTypes.string,
    isAmount: PropTypes.bool
}

export default CardTemplate;
