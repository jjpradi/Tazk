import React, {useState} from 'react';
import {Box, Button, Grid, Typography} from '@mui/material';
import {Fonts} from '../../../shared/constants/AppEnums';
import {AppGridContainer} from '../../../@crema';
import ViewCard from './viewCard';
import NewForm from './new';
import PropTypes from 'prop-types';

const PassportAadhar = ({socials = [], handleDialogOpen, index, userId}) => {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{position: 'relative'}}>
      <Button onClick={() => setOpen(true)}>Add</Button>
      <AppGridContainer spacing={4}>
        {socials.map((member, index) => (
          <Grid
            key={index}
            size={{
              xs: 12,
              md: 6
            }}>
            <ViewCard member={member} />
          </Grid>
        ))}
        {open ? (
          <Grid
            size={{
              xs: 12,
              md: 12
            }}>
            <NewForm
              index={index}
              userId={userId}
              handleDialogOpen={handleDialogOpen}
              handleClose={() => setOpen(false)}
            />
          </Grid>
        ) : null}
      </AppGridContainer>
    </Box>
  );
};

export default PassportAadhar;

PassportAadhar.propTypes = {
  socials: PropTypes.array,
};
