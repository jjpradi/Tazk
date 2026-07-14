import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Box, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { reportTheme } from '../reportUtils';

/**
 * DiagnosticsAccordion — Collapsible panel showing report filters, rounding mode, etc.
 *
 * @param {object}  props
 * @param {Array<{ label: string, value: string }>} props.items
 */
const DiagnosticsAccordion = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        mt: 2,
        border: `1px solid ${reportTheme.borderColor}`,
        borderRadius: 1,
        '&:before': { display: 'none' },
        '@media print': { display: 'none' },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />} sx={{ minHeight: 36, py: 0, px: 1.5 }}>
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, color: 'text.secondary' }}>
          Diagnostics
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 1.5, pt: 0, pb: 1.5 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, rowGap: 0.75 }}>
          {items.map((item, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 500, whiteSpace: 'nowrap' }}>
                {item.label}:
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default DiagnosticsAccordion;
