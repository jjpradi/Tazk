import { Box, Card, Grid, Typography } from '@mui/material';
import React from 'react';
import PhoneIcon from '@mui/icons-material/Phone';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { PropTypes } from 'prop-types';

const ContactPerson = (props) => {

  const {data} = props

  return (
    <div>
      <Card style={{ padding: '30px', width: '100%', margin: '20px auto' }}>
        <Grid mb={'10px'}>
          <Typography variant="h5" fontWeight={'bold'}>Contact Person</Typography>
        </Grid>

        <Grid container width={'300px'} spacing={2} style={{ display: 'flex', alignItems: 'center' }}>
          <Grid color={"textSecondary"}>
            <AccountCircleIcon style={{ fontSize: '40px', color: 'grey' }} />
          </Grid>

          <Grid>
            <Box mt={1}>
              <Typography>{}</Typography>
              <Typography >
                {
                  data.customerTitle ? `${data.customerTitle} ` : ''
                }
                { 
                  data.customerLastName ? `${data.customerFirstName} ${data.customerLastName}` : data.customerFirstName
                }
              </Typography>
            </Box>
            <Box mt={1}>
              <Typography >at {data.company_name}</Typography>
            </Box>
            <Box mt={1}>
              <Typography >
                <PhoneIcon style={{ verticalAlign: 'middle', fontSize: '20px' }} /> {data.customerPhoneNumber}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Card>
    </div>
  );
}

ContactPerson.propTypes = {
  data: PropTypes.object
}

export default ContactPerson;
