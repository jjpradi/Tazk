import React, {useState} from 'react';
import {Box, Button, Grid, Typography} from '@mui/material';
import {Fonts} from '../../../shared/constants/AppEnums';
import {AppGridContainer} from '../../../@crema';
import SocialCard from './socialCard';
import NewAccount from './newAccount';
import PropTypes from 'prop-types';

const Social = ({socials = [], handleDialogOpen, index, userId}) => {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{position: 'relative'}}>
      <Typography
        component='h3'
        sx={{
          fontSize: 16,
          fontWeight: Fonts.BOLD,
          mb: {xs: 3, lg: 5},
        }}
      >
        Social
      </Typography>
      <Button onClick={() => setOpen(true)}>Add</Button>
      <AppGridContainer spacing={4}>
        {socials.map((member, index) => (
          <Grid
            key={index}
            size={{
              xs: 12,
              md: 6
            }}>
            <SocialCard member={member} />
          </Grid>
        ))}
        {open ? (
          <Grid
            size={{
              xs: 12,
              md: 12
            }}>
            <NewAccount
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

export default Social;

Social.propTypes = {
  socials: PropTypes.array,
};
