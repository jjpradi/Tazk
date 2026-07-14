import React, {useState} from 'react';
import {AppCard} from '@crema';
import PropTypes from 'prop-types';
import {alpha, Avatar, Box, Typography} from '@mui/material';
import Button from '@mui/material/Button';
import {Fonts} from '../../../shared/constants/AppEnums';

const SocialCard = ({member}) => {
  return (
    <AppCard
      title={member.document_name}
      sxStyle={{
        boxShadow: 'none',
        borderRadius: 1,
        border: (theme) => `solid 1px ${theme.palette.divider}`,
        height: '100%',
      }}
      titleStyle={{
        fontSize: 12,
        fontWeight: Fonts.SEMI_BOLD,
        color: (theme) => theme.palette.text.secondary,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box sx={{width: 'calc(100% - 50px)'}}>
          <Typography
            sx={{
              fontWeight: Fonts.MEDIUM,
              mb: 2.5,
              width: '100%',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {member.remarks ? `@${member.remarks}` : null}
          </Typography>
        </Box>
      </Box>
    </AppCard>
  );
};

export default SocialCard;

SocialCard.propTypes = {
  member: PropTypes.object,
};
