import React, {useEffect} from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Radio,
  Typography,
} from '@mui/material';
import {
  ExpandMoreIcon,
  PaymentIcon,
  MoneyIcon,
  SyncAltIcon,
  DoubleArrowIcon,
  DateRangeIcon,
} from '@mui/icons-material/Check';
import Cardform from './Types/Card';
import {Neft} from './Types/Neft';
import {Upi} from './Types/Upi';
import {Emi} from './Types/Emi';

const rootSx = {
  width: '100%',
};

export default function ControlledAccordions({setpayment}) {
  const [expanded, setExpanded] = React.useState('card');

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(panel);
    setpayment(panel);
  };

  return (
    <Box sx={rootSx}>
      <Accordion expanded={expanded === 'card'} onChange={handleChange('card')}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls='panel1bh-content'
          id='panel1bh-header'
        >
          <div style={{display: 'flex', alignItems: 'center'}}>
            <PaymentIcon style={{marginRight: '20px'}} />
            Cards (Credit/Debit)
          </div>
        </AccordionSummary>
        <AccordionDetails style={{justifyContent: 'center'}}>
          <Cardform />
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={expanded === 'cash'} onChange={handleChange('cash')}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls='panel2bh-content'
          id='panel2bh-header'
        >
          <div style={{display: 'flex', alignItems: 'center'}}>
            <MoneyIcon style={{marginRight: '20px'}} />
            Cash
          </div>
        </AccordionSummary>
        <AccordionDetails style={{alignItems: 'center'}}>
          <div>
            <Radio
              checked={true}
              name='radio-button-demo'
              color='primary'
              inputProps={{'aria-label': 'A'}}
            />
          </div>

          <Typography style={{margin: '0'}}>
            Cash Payment Method is Selected
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={expanded === 'neft'} onChange={handleChange('neft')}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls='panel3bh-content'
          id='panel3bh-header'
        >
          <div style={{display: 'flex', alignItems: 'center'}}>
            <SyncAltIcon style={{marginRight: '20px'}} />
            NEFT
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <Neft />
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={expanded === 'upi'} onChange={handleChange('upi')}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls='panel4bh-content'
          id='panel4bh-header'
        >
          <div style={{display: 'flex', alignItems: 'center'}}>
            <DoubleArrowIcon style={{marginRight: '20px'}} />
            UPI
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <Upi />
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={expanded === 'emi'} onChange={handleChange('emi')}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls='panel5bh-content'
          id='panel5bh-header'
        >
          <div style={{display: 'flex', alignItems: 'center'}}>
            <DateRangeIcon style={{marginRight: '20px'}} />
            EMI
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <Emi />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
