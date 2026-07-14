import {Backdrop, Box, Modal} from '@mui/material';
import React from 'react';
import PropTypes from 'prop-types';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 200,
  bgcolor: '#FFFFFF',
  color: 'black',
  boxShadow: 24,
  borderRadius: 5,
  p: 4,
};

export default function LotDetails(props) {
  const { lotOpen, handleLotDetailsClose, lotDetails } = props;

  return (
    <Modal
      open={lotOpen}
      onClose={handleLotDetailsClose}
      closeAfterTransition
      slots={{backdrop: Backdrop}}
      slotprops={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Box
        display='flex'
        flexDirection='column'
        justifyContent='flex-start'
        alignItems='center'
        width='100%'
        gap={1}
        sx={style}
      >
        <Box>{lotDetails.name}</Box>
        <Box>{lotDetails.category}</Box>
        <Box>{lotDetails.brand}</Box>
        <Box>{lotDetails.lotNumber}</Box>
        <Box>{lotDetails.location_name}</Box>
      </Box>
    </Modal>
  );
}

LotDetails.propTypes = {
  lotOpen: PropTypes.bool,
  handleLotDetailsClose: PropTypes.func,
  lotDetails: PropTypes.object,
};
