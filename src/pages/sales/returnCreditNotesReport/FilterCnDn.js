import React, { useState } from 'react';
import {
  Modal, Card, Button, Box, Grid, IconButton,
} from '@mui/material';
import { FilterAlt } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment as DateAdapter } from '@mui/x-date-pickers/AdapterMoment';
import CloseIcon from '@mui/icons-material/Close';
import moment from 'moment';
import toMomentOrNull from '../../../utils/DateFixer';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 350,
  bgcolor: 'background.paper',
  boxShadow: 25,
  p: 4,
  borderRadius: 5,
};

export default function FilterCnDn({ from, to, open, handleClose, handleChange, ApplyButton, clearButton }) {
  return (
    <>
      <IconButton onClick={() => handleClose(true)}>
        <FilterAlt />
      </IconButton>
      <Modal open={open} onClose={() => handleClose(false)}>
        <Card sx={style}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box sx={{ fontWeight: 600 }}>Filter</Box>
            <IconButton size="small" onClick={() => handleClose(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <LocalizationProvider dateAdapter={DateAdapter}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <DatePicker
                  label="From"
                  value={toMomentOrNull(from)}
                  onChange={(val) => handleChange({ target: { name: 'from', value: { _d: val?._d || val } } })}
                  format="DD/MM/YYYY"
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <DatePicker
                  label="To"
                  value={toMomentOrNull(to)}
                  onChange={(val) => handleChange({ target: { name: 'to', value: { _d: val?._d || val } } })}
                  format="DD/MM/YYYY"
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Button fullWidth variant="outlined" onClick={clearButton}>Clear</Button>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Button fullWidth variant="contained" onClick={() => ApplyButton()}>Apply</Button>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Card>
      </Modal>
    </>
  );
}
