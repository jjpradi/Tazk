import React, {useState} from 'react';
import {
  Box,
  Button,
  Divider,
  Grid,
  ListItem,
  ListItemButton,
  ListItemText,
  Modal,
  Stack,
  Typography,
} from '@mui/material';
import LotDetails from './lotDetails';
import PropTypes from 'prop-types';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 330,
  bgcolor: 'background.paper',
  color: 'black',
  boxShadow: 25,
  p: 4,
  borderRadius: 5,
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    width: 10,
  },

  '&::-webkit-scrollbar-track': {
    // boxShadow: "inset 0 0 5px black",
    borderRadius: 2,
    marginTop: '20px',
    marginBottom: '20px',
  },

  '&::-webkit-scrollbar-thumb': {
    background: '#B2B2B2',
    borderRadius: 2,
  },

  '&::-webkit-scrollbar-thumb:hover': {
    background: '#999',
  },
};

export default function LotDialog(props) {
  const {open, handleLotClose, rowData} = props;
  const [lotOpen, setLotOpen] = useState(false);
  const [lotDetails, setLotDetails] = useState({});

  const handleLotDetailsOpen = (value) => {
    setLotOpen(true);
    setLotDetails(value);
  };

  const handleLotDetailsClose = () => {
    setLotOpen(false);
  };

  return (
    <Modal open={open} onClose={() => handleLotClose()}>
      <Box
        display='flex'
        flexDirection='column'
        justifyContent='flex-start'
        alignItems='center'
        width='100%'
        gap={1}
        sx={style}
      >
        <Grid container spacing={2} display='flex' flexDirection='row'>
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Stack
              direction='row'
              display='flex'
              alignItems='center'
              justifyContent='space-between'
            >
              <Typography variant='h6'>{'Lot Numbers'}</Typography>
              <Button variant='outlined' onClick={() => handleLotClose()}>
                {'Close'}
              </Button>
            </Stack>
          </Grid>
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Divider />
          </Grid>
          <Grid
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 6
            }}>
            <Typography>{'Missing Lots'}</Typography>
            {rowData.missing.map((l) => {
              return (
                <ListItem key={l.id} component='div' disablePadding>
                  <ListItemButton
                    dense={true}
                    title={l.name}
                    onClick={() => handleLotDetailsOpen(l)}
                  >
                    <ListItemText primary={l.lotNumber} />
                  </ListItemButton>
                </ListItem>
              );
            })}
            {rowData.missing.length === 0 && (
              <Typography
                sx={{
                  fontSize: '12px',
                  padding: '15px 5px',
                }}
              >
                No Record Found
              </Typography>
            )}
            {lotOpen && (
              <LotDetails
                lotOpen={lotOpen}
                handleLotDetailsClose={handleLotDetailsClose}
                lotDetails={lotDetails}
              />
            )}
          </Grid>
          <Grid
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 6
            }}>
            <Typography>{'Excess Lots'}</Typography>
            {rowData.excess.map((l) => {
              return (
                <ListItem key={l.id} component='div' disablePadding>
                  <ListItemButton
                    dense={true}
                    title={l.name}
                    onClick={() => handleLotDetailsOpen(l)}
                  >
                    <ListItemText primary={l.lotNumber} />
                  </ListItemButton>
                </ListItem>
              );
            })}
            {rowData.excess.length === 0 && (
              <Typography
                sx={{
                  fontSize: '12px',
                  padding: '15px 5px',
                }}
              >
                No Record Found
              </Typography>
            )}
            {lotOpen && (
              <LotDetails
                lotOpen={lotOpen}
                handleLotDetailsClose={handleLotDetailsClose}
                lotDetails={lotDetails}
              />
            )}
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
}

LotDialog.propTypes = {
  open: PropTypes.bool,
  handleLotClose: PropTypes.func,
  rowData: PropTypes.object,
};
