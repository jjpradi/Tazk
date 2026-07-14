/**
 * Left sidebar: Block type buttons grouped by category.
 * Click-to-add pattern (appends to bottom, then drag to reorder).
 */
import React from 'react';
import { Box, Typography, Button, Tooltip, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TitleIcon from '@mui/icons-material/Title';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CalculateIcon from '@mui/icons-material/Calculate';
import PaymentIcon from '@mui/icons-material/Payment';
import DrawIcon from '@mui/icons-material/Draw';
import GavelIcon from '@mui/icons-material/Gavel';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CallToActionIcon from '@mui/icons-material/CallToAction';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import SpaceBarIcon from '@mui/icons-material/SpaceBar';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AbcIcon from '@mui/icons-material/Abc';
import PolicyIcon from '@mui/icons-material/Policy';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import AddIcon from '@mui/icons-material/Add';
import { BLOCK_TYPES } from './builderConstants';

const iconMap = {
    Title: TitleIcon,
    Business: BusinessIcon,
    Person: PersonIcon,
    Description: DescriptionIcon,
    TableChart: TableChartIcon,
    Receipt: ReceiptIcon,
    Calculate: CalculateIcon,
    Payment: PaymentIcon,
    Draw: DrawIcon,
    Gavel: GavelIcon,
    AccountBalance: AccountBalanceIcon,
    CallToAction: CallToActionIcon,
    TextFields: TextFieldsIcon,
    HorizontalRule: HorizontalRuleIcon,
    SpaceBar: SpaceBarIcon,
    ViewColumn: ViewColumnIcon,
    LocalShipping: LocalShippingIcon,
    VerifiedUser: VerifiedUserIcon,
    Abc: AbcIcon,
    Policy: PolicyIcon,
    QrCode2: QrCode2Icon,
};

// Block categories for organized palette
const BLOCK_CATEGORIES = [
    {
        label: 'Layout',
        types: ['row', 'divider', 'spacer'],
        defaultExpanded: false,
    },
    {
        label: 'Header & Company',
        types: ['header', 'company_info'],
        defaultExpanded: true,
    },
    {
        label: 'Document & Customer',
        types: ['document_info', 'customer_info', 'shipping_info', 'e_invoice'],
        defaultExpanded: true,
    },
    {
        label: 'Items & Tax',
        types: ['items_table', 'tax_summary'],
        defaultExpanded: true,
    },
    {
        label: 'Totals & Payments',
        types: ['totals', 'amount_in_words', 'payments'],
        defaultExpanded: true,
    },
    {
        label: 'Footer & Misc',
        types: ['signature', 'declaration', 'terms', 'bank_details', 'qr_code', 'footer', 'custom_text'],
        defaultExpanded: false,
    },
];

function BlockButton({ type, info, onAddBlock }) {
    const Icon = iconMap[info.icon] || TextFieldsIcon;
    return (
        <Tooltip title={info.description} placement="right" arrow>
            <Button
                size="small"
                variant="outlined"
                startIcon={<Icon sx={{ fontSize: '14px !important' }} />}
                endIcon={<AddIcon sx={{ fontSize: '12px !important', ml: 'auto' }} />}
                onClick={() => onAddBlock(type)}
                sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontSize: '11px',
                    py: 0.4,
                    px: 1,
                    borderColor: '#e0e0e0',
                    color: 'text.primary',
                    '&:hover': { borderColor: '#1976d2', bgcolor: '#e3f2fd' },
                }}
            >
                {info.label}
            </Button>
        </Tooltip>
    );
}

export default function BlockPalette({ onAddBlock }) {
    return (
        <Box sx={{ p: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', px: 1, mb: 0.5, display: 'block', fontSize: '10px' }}>
                ADD BLOCKS
            </Typography>
            {BLOCK_CATEGORIES.map((cat) => (
                <Accordion
                    key={cat.label}
                    disableGutters
                    elevation={0}
                    defaultExpanded={cat.defaultExpanded}
                    sx={{
                        '&:before': { display: 'none' },
                        bgcolor: 'transparent',
                        '& .MuiAccordionSummary-root': { minHeight: 28, px: 0.5 },
                        '& .MuiAccordionSummary-content': { my: 0.25 },
                    }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 16 }} />}>
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '10px', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {cat.label}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0.5, pt: 0, display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                        {cat.types.map((type) => {
                            const info = BLOCK_TYPES[type];
                            if (!info) return null;
                            return <BlockButton key={type} type={type} info={info} onAddBlock={onAddBlock} />;
                        })}
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
}
