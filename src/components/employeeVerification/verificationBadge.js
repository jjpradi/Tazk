import React from 'react';
import {Box, Typography} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

function VerificationBadge(props) {
  const {verifiedBy, verification_date, verification_time} = props;
  return (
    <Box
      display='flex'
      flexDirection='column'
      justifyContent='center'
      alignItems='flex-start'
      position='relative'
      sx={{
        border: '2px dotted black',
        padding: 1,
        width: 'fit-content',
      }}
    >
      <CheckIcon
        sx={{
          color: 'green',
          fontSize: 80,
          position: 'absolute',
          zIndex: 0,
          opacity: 0.5,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
      <Typography sx={{zIndex: 1, position: 'relative', fontSize: 12, fontWeight: 500}}>
        Verification Done
      </Typography>
      <Typography sx={{zIndex: 1, position: 'relative', fontSize: 12, fontWeight: 700}}>
        By: {verifiedBy}
      </Typography>
      <Typography sx={{zIndex: 1, position: 'relative', fontSize: 12, fontWeight: 700}}>
        Date: {verification_date}
      </Typography>
      <Typography sx={{zIndex: 1, position: 'relative', fontSize: 12, fontWeight: 700}}>
        Time: {verification_time}
      </Typography>
    </Box>
  );
}

export default VerificationBadge;
