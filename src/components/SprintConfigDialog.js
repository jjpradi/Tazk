import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment as DateAdapter } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';

const DURATION_OPTIONS = [
  { value: '1 week', label: '1 Week' },
  { value: '2 week', label: '2 Weeks' },
  { value: '3 week', label: '3 Weeks' },
  { value: '4 week', label: '4 Weeks' },
  { value: 'Custom', label: '+ Custom' },
];

const getWorkingDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;

  const start = moment(startDate).startOf('day');
  const end = moment(endDate).startOf('day');

  if (!start.isValid() || !end.isValid() || end.isBefore(start)) {
    return 0;
  }

  let count = 0;
  const cursor = start.clone();

  while (cursor.isSameOrBefore(end, 'day')) {
    const day = cursor.day();
    if (day !== 0 && day !== 6) {
      count += 1;
    }
    cursor.add(1, 'day');
  }

  return count;
};

const SprintConfigDialog = ({
  open,
  mode = 'start',
  issueCount = 0,
  values,
  onChange,
  onDateChange,
  onClose,
  onSubmit,
}) => {
  // const [advancedOptions, setAdvancedOptions] = useState(true);

  // useEffect(() => {
  //   if (open) {
  //     setAdvancedOptions(true);
  //   }
  // }, [open]);

  const isEditMode = mode === 'edit';
  const workingDays = getWorkingDays(values?.start_date, values?.end_date);
  const submitLabel = isEditMode ? 'Save Changes' : 'Start Sprint';
  const title = isEditMode ? 'Edit Sprint' : 'Configure New Sprint';
  const goalCount = values?.sprint_goal?.length || 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          overflow: 'hidden',
          background:
            'linear-gradient(180deg, rgba(235,242,251,0.98) 0%, rgba(216,228,241,0.98) 100%)',
          boxShadow: '0 30px 90px rgba(15, 23, 42, 0.28)',
          padding: "8px"
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 2.5, md: 5 } }}>
        <Stack spacing={3}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: 16, md: 24 },
                  fontWeight: 800,
                  lineHeight: 1.05,
                  color: '#17212B',
                }}
              >
                {title}
              </Typography>
              <Box
                sx={{
                  mt: 1.5,
                  display: 'inline-flex',
                  alignItems: 'center',
                  borderRadius: 2,
                  px: 1.75,
                  py: 1,
                  backgroundColor: 'rgba(255,255,255,0.72)',
                  color: '#586574',
                }}
              >
                <Typography variant="body2" sx={{ fontSize: 12 }}>
                  {issueCount} issues will be included in this sprint
                </Typography>
              </Box>
            </Box>

            <IconButton
              onClick={onClose}
              sx={{
                width: 44,
                height: 44,
                backgroundColor: 'rgba(255,255,255,0.6)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.85)' },
              }}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          <Stack spacing={2.5}>
            <Box>
              <Typography sx={{ mb: 1, fontWeight: 700, color: '#1F2937', fontSize: 16 }}>
                Sprint Name
              </Typography>
              <TextField
                name="sprint_name"
                value={values?.sprint_name || ''}
                onChange={onChange}
                fullWidth
                placeholder="Enter sprint name"
                InputProps={{
                  sx: {
                    borderRadius: 2.5,
                    backgroundColor: '#fff',
                    fontSize: 18,
                  },
                }}
              />
            </Box>

            <Box>
              <Typography sx={{ mb: 1, fontWeight: 700, color: '#1F2937', fontSize: 16 }}>
                Duration
              </Typography>
              <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
                {DURATION_OPTIONS.map((option) => {
                  const selected = values?.sprint_duration === option.value;

                  return (
                    <Button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        onChange({
                          target: {
                            name: 'sprint_duration',
                            value: option.value,
                          },
                        })
                      }
                      variant={selected ? 'contained' : 'text'}
                      sx={{
                        minWidth: 110,
                        borderRadius: 999,
                        px: 2,
                        py: 1,
                        textTransform: 'none',
                        fontSize: 15,
                        fontWeight: 600,
                        color: selected ? '#1672F3' : '#526171',
                        backgroundColor: selected ? 'rgba(22,114,243,0.10)' : 'rgba(255,255,255,0.64)',
                        border: selected ? '2px solid #1672F3' : '1px solid transparent',
                        boxShadow: 'none',
                        '&:hover': {
                          backgroundColor: selected ? 'rgba(22,114,243,0.14)' : 'rgba(255,255,255,0.88)',
                          boxShadow: 'none',
                        },
                      }}
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </Stack>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2.5,
              }}
            >
              <Box>
                <Typography sx={{ mb: 1, fontWeight: 700, color: '#1F2937', fontSize: 16 }}>
                  Start Date
                </Typography>
                <LocalizationProvider dateAdapter={DateAdapter}>
                  <DateTimePicker
                    format="DD/MM/YYYY hh:mm A"
                    value={values?.start_date}
                    onChange={(newValue) => onDateChange('start_date', newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        InputProps: {
                          sx: {
                            borderRadius: 2.5,
                            backgroundColor: '#fff',
                            fontSize: 16,
                          },
                        },
                      },
                      popper: {
                        placement: 'bottom-start',
                        modifiers: [
                          { name: 'flip', enabled: true, options: { fallbackPlacements: ['top-start', 'top', 'bottom'] } },
                          { name: 'preventOverflow', enabled: true, options: { altAxis: true, rootBoundary: 'window', padding: 8 } },
                        ],
                      },
                    }}
                  />
                </LocalizationProvider>
              </Box>

              <Box>
                <Typography sx={{ mb: 1, fontWeight: 700, color: '#1F2937', fontSize: 16 }}>
                  End Date
                </Typography>
                <LocalizationProvider dateAdapter={DateAdapter}>
                  <DateTimePicker
                    format="DD/MM/YYYY hh:mm A"
                    value={values?.end_date}
                    onChange={(newValue) => onDateChange('end_date', newValue)}
                    disabled={values?.sprint_duration !== 'Custom'}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        InputProps: {
                          sx: {
                            borderRadius: 2.5,
                            backgroundColor: '#fff',
                            fontSize: 16,
                          },
                        },
                      },
                      popper: {
                        placement: 'bottom-start',
                        modifiers: [
                          { name: 'flip', enabled: true, options: { fallbackPlacements: ['top-start', 'top', 'bottom'] } },
                          { name: 'preventOverflow', enabled: true, options: { altAxis: true, rootBoundary: 'window', padding: 8 } },
                        ],
                      },
                    }}
                  />
                </LocalizationProvider>
                <Typography
                  variant="body2"
                  sx={{ mt: 1, textAlign: 'right', color: '#5E6B79', fontWeight: 500 }}
                >
                  Total: {workingDays} working days
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography sx={{ mb: 1, fontWeight: 700, color: '#1F2937', fontSize: 16 }}>
                Sprint Goal
              </Typography>
              <TextField
                name="sprint_goal"
                value={values?.sprint_goal || ''}
                onChange={onChange}
                fullWidth
                placeholder="Focus on critical bug fixes..."
                multiline
                minRows={3}
                inputProps={{ maxLength: 250 }}
                InputProps={{
                  sx: {
                    borderRadius: 2.5,
                    backgroundColor: '#fff',
                    alignItems: 'flex-start',
                  },
                }}
              />
              <Typography
                variant="body2"
                sx={{ mt: 0.75, textAlign: 'right', color: '#5E6B79', fontWeight: 500 }}
              >
                {goalCount}/250
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              pt: 1,
            }}
          >
            <Button
              onClick={onClose}
              sx={{
                minWidth: 140,
                borderRadius: 999,
                py: 1.25,
                px: 3,
                backgroundColor: '#fff',
                color: '#1F2937',
                textTransform: 'none',
                fontSize: 16,
                fontWeight: 700,
                '&:hover': {
                  backgroundColor: '#fff',
                },
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={onSubmit}
              variant="contained"
              sx={{
                minWidth: 180,
                borderRadius: 999,
                py: 1.25,
                px: 1.25,
                textTransform: 'none',
                fontSize: 18,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #3E8BFF 0%, #1664E8 100%)',
                boxShadow: '0 16px 32px rgba(22, 100, 232, 0.28)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #347CEE 0%, #1459CC 100%)',
                },
              }}
            >
              {submitLabel}
            </Button>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default SprintConfigDialog;
