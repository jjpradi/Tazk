import React, {useState} from 'react';
import {AppCard} from '@crema';
import PropTypes from 'prop-types';
import {alpha, Avatar, Box, CardMedia, Typography} from '@mui/material';
import Button from '@mui/material/Button';
import {Fonts} from '../../../shared/constants/AppEnums';
import ZoomInBox from 'utils/zoomInBox';
import VerificationBadge from '../verificationBadge';

const ViewCard = ({ member }) => {
  
  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
  
    return `${day}/${month}/${year}`;
  }

  
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
          flexDirection: 'column'
        }}
      >
        <Box sx={{width: 'calc(100% - 50px)', display: 'block', mb: 2.5}}>
          <Typography
            sx={{
              fontWeight: Fonts.MEDIUM,
              mb: 2.5,
              width: '100%',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block',
            }}
          >
            Number - {member.d_number}
          </Typography>
        </Box>
        <Box sx={{width: 'calc(100% - 50px)', display: 'block', mb: 2.5}}>
          <Typography
            sx={{
              fontWeight: Fonts.MEDIUM,
              mb: 2.5,
              width: '100%',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block',
            }}
          >
            Expiry Date - {member.expiry_date === "0000-00-00" ? "Nill" : formatDate(member.expiry_date)}
          </Typography>
        </Box>
        <Box sx={{width: 'calc(100% - 50px)', display: 'block', mb: 2.5}}>
          <Typography
            sx={{
              fontWeight: Fonts.MEDIUM,
              mb: 2.5,
              width: '100%',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block',
            }}
          >
            Remarks - {member.remarks}
          </Typography>
        </Box>
        <Box sx={{width: 'calc(100% - 50px)'}}>
          {member.type === 'image' ? (
            <ZoomInBox>
              <CardMedia
                component='img'
                image={member?.url}
                width='100%'
                height='100%'
              />
            </ZoomInBox>
          ) : (
            <object
              data={member?.url}
              type='application/pdf'
              width='100%'
              height='100%'
              style={{borderRadius: 10}}
            >
              PDF cannot be displayed.
            </object>
          )}
        </Box>
      </Box>
      <Box sx={{width: '100%'}} display='flex' justifyContent='flex-end' pt={3}>
        <VerificationBadge
          verifiedBy={member.verifiedBy}
          verification_date={member?.verification_date}
          verification_time={member?.verification_time}
        />
      </Box>
    </AppCard>
  );
};

export default ViewCard;

ViewCard.propTypes = {
  member: PropTypes.object,
};
