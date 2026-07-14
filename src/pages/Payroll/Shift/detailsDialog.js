import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import React from 'react';
import {Duration, formatTime12Hour, headerStyle} from 'utils/pageSize';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

function DetailsDialog({open, handleClose, data}) {
  return (
    <Dialog
      sx={{
        '& .MuiDialog-container': {
          '& .MuiPaper-root': {
            width: '100%',
            maxWidth: '700',
          },
        },
      }}
      open={open}
      onClose={() => handleClose()}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
    >
      <DialogTitle id='alert-dialog-title'>{'Shift Details'}</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description'>
          <Grid container spacing={2} dislpay='flex'>
            <Grid
              display='flex'
              justifyContent='flex-start'
              size={{
                lg: 12,
                md: 12,
                sm: 12
              }}>
              <Typography>
                <span
                  style={{
                    fontSize: headerStyle.fontSize,
                    fontWeight: headerStyle.fontWeight,
                  }}
                >
                  Company Name
                </span>{' '}
                : {data.company_name}
              </Typography>
            </Grid>
            <Grid
              display='flex'
              justifyContent='flex-start'
              size={{
                lg: 12,
                md: 12,
                sm: 12
              }}>
              <Typography>
                <span
                  style={{
                    fontSize: headerStyle.fontSize,
                    fontWeight: headerStyle.fontWeight,
                  }}
                >
                  Shift Name
                </span>
                : {data.shift_name}
              </Typography>
            </Grid>
            <Grid
              display='flex'
              size={{
                lg: 12,
                md: 12,
                sm: 12
              }}>
              <Typography>
                <span
                  style={{
                    fontSize: headerStyle.fontSize,
                    fontWeight: headerStyle.fontWeight,
                  }}
                >
                  Shift Code
                </span>{' '}
                :  {data.shift_short_code}
              </Typography>
            </Grid>
            <Grid
              display='flex'
              size={{
                lg: 12,
                md: 12,
                sm: 12
              }}>
              <Typography>
                <span
                  style={{
                    fontSize: headerStyle.fontSize,
                    fontWeight: headerStyle.fontWeight,
                  }}
                >
                  Shift starts at
                </span>{' '}
                : {formatTime12Hour(data?.start_shift_time)}
              </Typography>
            </Grid>
            <Grid
              display='flex'
              size={{
                lg: 12,
                md: 12,
                sm: 12
              }}>
              <Typography>
                <span
                  style={{
                    fontSize: headerStyle.fontSize,
                    fontWeight: headerStyle.fontWeight,
                  }}
                >
                  Shift ends at
                </span>{' '}
                : {formatTime12Hour(data?.end_shift_time)}
              </Typography>
            </Grid>
            <Grid
              display='flex'
              size={{
                lg: 12,
                md: 12,
                sm: 12
              }}>
              <Typography>
                <span
                  style={{
                    fontSize: headerStyle.fontSize,
                    fontWeight: headerStyle.fontWeight,
                  }}
                >
                  Break starts at
                </span>{' '}
                :{' '}
                {data.start_break_time
                  ? formatTime12Hour(data?.start_break_time)
                  : '-'}
              </Typography>
            </Grid>
            <Grid
              display='flex'
              size={{
                lg: 12,
                md: 12,
                sm: 12
              }}>
              <Typography>
                <span
                  style={{
                    fontSize: headerStyle.fontSize,
                    fontWeight: headerStyle.fontWeight,
                  }}
                >
                  Break ends at
                </span>{' '}
                :{' '}
                {data.end_break_time
                  ? formatTime12Hour(data?.end_break_time)
                  : '-'}
              </Typography>
            </Grid>
            <Grid
              display='flex'
              justifyContent='flex-start'
              size={{
                lg: 12,
                md: 12,
                sm: 12
              }}>
              <Typography>
                <span
                  style={{
                    fontSize: headerStyle.fontSize,
                    fontWeight: headerStyle.fontWeight,
                  }}
                >
                  Allow late checkIn till
                </span>{' '}
                : {data.allow_late_checkin_till ? `${data.allow_late_checkin_till} Minutes` : '-'} 
              </Typography>
            </Grid>
            {data?.combo_off == 1 && <Grid
              display='flex'
              justifyContent='flex-start'
              size={{
                lg: 12,
                md: 12,
                sm: 12
              }}>
              <Typography>
                <span
                  style={{
                    fontSize: headerStyle.fontSize,
                    fontWeight: headerStyle.fontWeight,
                  }}
                >
                  Compensation off Enabled for this shift **
                </span>{' '}
              </Typography>
            </Grid>}
            {data?.combo_off == 0 && <Grid
              display='flex'
              size={{
                lg: 12,
                md: 12,
                sm: 12
              }}>
              <Typography>
                <span
                  style={{
                    fontSize: headerStyle.fontSize,
                    fontWeight: headerStyle.fontWeight,
                  }}
                >
                  Off DAY 1
                </span>{' '}
                : {data.off_day1 ? data.off_day1 : '-'}
              </Typography>
            </Grid>}
            {data?.combo_off == 0 && <Grid
              display='flex'
              size={{
                lg: 12,
                md: 12,
                sm: 12
              }}>
              <Typography>
                <span
                  style={{
                    fontSize: headerStyle.fontSize,
                    fontWeight: headerStyle.fontWeight,
                  }}
                >
                  Off DAY 2
                </span>{' '}
                : {data.off_day2 ? data.off_day2 : '-'}
              </Typography>
            </Grid>}
            {data?.combo_off == 0 && <Grid
              display='flex'
              size={{
                lg: 12,
                md: 12,
                sm: 12
              }}>
              <Grid
                display='flex'
                size={{
                  lg: 6,
                  md: 6,
                  sm: 6
                }}>
                <Typography>
                  <span
                    style={{
                      fontSize: headerStyle.fontSize,
                      fontWeight: headerStyle.fontWeight,
                    }}
                  >
                    Off DAY 2 On Weeks
                  </span>
                  :
                </Typography>
              </Grid>
              <Grid
                display='flex'
                size={{
                  lg: 2,
                  md: 2,
                  sm: 2
                }}>
                <Stack direction='row' alignItems='center' gap={1}>
                  <span
                    style={{
                      fontSize: headerStyle.fontSize,
                      fontWeight: headerStyle.fontWeight,
                    }}
                  >
                    W1 :
                  </span>
                  {data.w1 === 1 ? (
                    <CheckBoxIcon fontSize='small' />
                  ) : (
                    <CheckBoxOutlineBlankIcon fontSize='small' />
                  )}
                </Stack>
              </Grid>
              <Grid
                display='flex'
                size={{
                  lg: 2,
                  md: 2,
                  sm: 2
                }}>
                <Stack direction='row' alignItems='center' gap={1}>
                  <span
                    style={{
                      fontSize: headerStyle.fontSize,
                      fontWeight: headerStyle.fontWeight,
                    }}
                  >
                    W2 :
                  </span>
                  {data.w2 === 1 ? (
                    <CheckBoxIcon fontSize='small' />
                  ) : (
                    <CheckBoxOutlineBlankIcon fontSize='small' />
                  )}
                </Stack>
              </Grid>
              <Grid
                display='flex'
                size={{
                  lg: 2,
                  md: 2,
                  sm: 2
                }}>
                <Stack direction='row' alignItems='center' gap={1}>
                  <span
                    style={{
                      fontSize: headerStyle.fontSize,
                      fontWeight: headerStyle.fontWeight,
                    }}
                  >
                    W3 :
                  </span>
                  {data.w3 === 1 ? (
                    <CheckBoxIcon fontSize='small' />
                  ) : (
                    <CheckBoxOutlineBlankIcon fontSize='small' />
                  )}
                </Stack>
              </Grid>
              <Grid
                display='flex'
                size={{
                  lg: 2,
                  md: 2,
                  sm: 2
                }}>
                <Stack direction='row' alignItems='center' gap={1}>
                  <span
                    style={{
                      fontSize: headerStyle.fontSize,
                      fontWeight: headerStyle.fontWeight,
                    }}
                  >
                    W4 :
                  </span>
                  {data.w4 === 1 ? (
                    <CheckBoxIcon fontSize='small' />
                  ) : (
                    <CheckBoxOutlineBlankIcon fontSize='small' />
                  )}
                </Stack>
              </Grid>
              <Grid
                display='flex'
                size={{
                  lg: 2,
                  md: 2,
                  sm: 2
                }}>
                <Stack direction='row' alignItems='center' gap={1}>
                  <span
                    style={{
                      fontSize: headerStyle.fontSize,
                      fontWeight: headerStyle.fontWeight,
                    }}
                  >
                    W5 :
                  </span>
                  {data.w5 === 1 ? (
                    <CheckBoxIcon fontSize='small' />
                  ) : (
                    <CheckBoxOutlineBlankIcon fontSize='small' />
                  )}
                </Stack>
              </Grid>
            </Grid>}
            {/* <Grid size={{ sm: 12, md: 12, lg: 12 }} display='flex'>
              <Typography>
                <span
                  style={{
                    fontSize: headerStyle.fontSize,
                    fontWeight: headerStyle.fontWeight,
                  }}
                >
                  No of paid leave
                </span>{' '}
                : {data.paid_leaves ? data.paid_leaves : '-'}
              </Typography>
            </Grid> */}
            <Grid
              display='flex'
              size={{
                lg: 12,
                md: 12,
                sm: 12
              }}>
              <Typography>
                <span
                  style={{
                    fontSize: headerStyle.fontSize,
                    fontWeight: headerStyle.fontWeight,
                  }}
                >
                  Over time Max
                </span>{' '}
                : {Duration(data.ot_max_time) === ''
                  ? '-'
                  : Duration(data.ot_max_time)}
              </Typography>
            </Grid>
            <Grid
              display='flex'
              size={{
                lg: 12,
                md: 12,
                sm: 12
              }}>
              <Typography>
                <span
                  style={{
                    fontSize: headerStyle.fontSize,
                    fontWeight: headerStyle.fontWeight,
                  }}
                >
                  Over time Min
                </span>{' '}
                : {Duration(data.ot_min_time) === ''
                  ? '-'
                  : Duration(data.ot_min_time)}
              </Typography>
            </Grid>
            <Grid
              display='flex'
              size={{
                lg: 12,
                md: 12,
                sm: 12
              }}>
              <Typography>
                <span
                  style={{
                    fontSize: headerStyle.fontSize,
                    fontWeight: headerStyle.fontWeight,
                  }}
                >
                  Mark 1/2 day leave if late by{' '}
                </span>
                {'>'} :{' '}
                {Duration(data.mark_halfday_leave) === ''
                  ? '-'
                  : Duration(data.mark_halfday_leave)}
              </Typography>
            </Grid>
            <Grid
              display='flex'
              size={{
                lg: 12,
                md: 12,
                sm: 12
              }}>
              <Typography>
                <span
                  style={{
                    fontSize: headerStyle.fontSize,
                    fontWeight: headerStyle.fontWeight,
                  }}
                >
                  Calculate 1/2 Day if work duration is{' '}
                </span>
                {'<'} :{' '}
                {Duration(data.calculate_halfday) === ''
                  ? '-'
                  : Duration(data.calculate_halfday)}
              </Typography>
            </Grid>
            <Grid
              display='flex'
              size={{
                lg: 12,
                md: 12,
                sm: 12
              }}>
              <Typography>
                <span
                  style={{
                    fontSize: headerStyle.fontSize,
                    fontWeight: headerStyle.fontWeight,
                  }}
                >
                  Calculate leave if work duration is{' '}
                </span>
                {'<'} :{' '}
                {Duration(data.calculate_leave) === ''
                  ? '-'
                  : Duration(data.calculate_leave)}
              </Typography>
            </Grid>
            <Grid
              display='flex'
              size={{
                lg: 12,
                md: 12,
                sm: 12
              }}>
              <Typography>
                <span
                  style={{
                    fontSize: headerStyle.fontSize,
                    fontWeight: headerStyle.fontWeight,
                  }}
                >
                  Calculate 1/2 Day late by 3 Days
                </span>{' '}
                {'<'} :{' '}
                {Duration(data.calculate_latedays) === ''
                  ? '-'
                  : Duration(data.calculate_latedays)}
              </Typography>
            </Grid>
          </Grid>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose()} autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DetailsDialog;
