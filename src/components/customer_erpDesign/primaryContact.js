import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import {Grid, Typography} from '@mui/material';
import { cellStyle } from 'utils/pageSize';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
const checkIsValid = (val) => {
  if (typeof val === 'undefined') return '';
  if (val === null || val === 'null') return '';
  return val;
};

const PrimaryContact = (data) => {
  return (
    <Box sx={{ minWidth: 175 }}>
      <Grid container>
        <Grid
          size={{
            xs: 6,
            lg: 12
          }}>

          {/* <Typography variant='h9'>
            Contact Number :{' '}
            <span style={{ fontSize: cellStyle.fontSize, fontWeight: cellStyle.fontWeight }}>
              {checkIsValid(data?.phone_number)}
            </span>
          </Typography>
          <br />

          <Typography variant='h9'>
            Email :{' '}
            <span style={{ fontWeight: cellStyle.fontWeight }}>
              {checkIsValid(data?.email)}
            </span>
          </Typography>
          <br />
          <Typography variant='h9'>
            Designation :{' '}
            <span >
              {checkIsValid(data?.designation)}
            </span>
          </Typography> */}

          <Accordion defaultExpanded={true} >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
            id="panel1a-content"
            style={{backgroundColor:'#dedede'}}
            >
              <Typography>Contact Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
              

            <Grid style={{ padding: '10px 0px 10px 0px' }}>
              <Typography variant='h9'>
                Contact Number :{' '}
                <span style={{ fontSize: cellStyle.fontSize, fontWeight: cellStyle.fontWeight }}>
                  {checkIsValid(data?.phone_number)}
                </span>
              </Typography>
              <br />

              <Typography variant='h9'>
                Email :{' '}
                <span style={{ fontWeight: cellStyle.fontWeight }}>
                  {checkIsValid(data?.email)}
                </span>
              </Typography>
              <br />
              {/* <Typography variant='h9'>
                Designation :{' '}
                <span >
                  {checkIsValid(data?.designation)}
                </span>
              </Typography> */}
            </Grid>



            </AccordionDetails>
          </Accordion>
          {/* <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2a-content"
              id="panel2a-content"
            >
              <Typography>Accordion 2</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                malesuada lacus ex, sit amet blandit leo lobortis eget.
              </Typography>
            </AccordionDetails>
          </Accordion> */}

        </Grid>
      </Grid>
    </Box>
  );
};

export default PrimaryContact;
