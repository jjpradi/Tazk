import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
} from '@mui/material';
import React from 'react';
import {
  maxBodyHeight,
  maxHeight,
  pageSize,
  headerStyle,
  cellStyle,
  font14_500,
} from 'utils/pageSize';
import {capitalize} from 'lodash';

function InfoDialog({ open, handleClose, data, autoRenewalData, handleSubmit }) {
  return (
    <Dialog fullWidth open={open} onClose={handleClose}>
      {data?.length ? (
        <>
          <DialogContent>
            <Typography variant="body1" component="div" style={{ fontWeight: 'bold' }}>
              <u>Schedule Conflicts Detected</u>
            </Typography>
          </DialogContent>
          <DialogContent>
            <DialogContentText>
              <b>
              Employees Currently on Another Shift :
              </b>
            </DialogContentText>
          </DialogContent>
          <DialogContent>
            <Table data={data} />
            <DialogContentText>
              <br></br>
              <Alert severity='error'>
                <Typography sx={{fontSize: '12px'}}>
                  To overwrite the schedule, please confirm 'Overwrite Existing Schedule'
                </Typography>
              </Alert>
            </DialogContentText>
          </DialogContent>
        </>
      ) : null}

      {autoRenewalData?.length ? (
        <>
          <DialogContent>
            <DialogContentText>
              <b>
              Employees are in Auto Renewal Shift :
              </b>
            </DialogContentText>
          </DialogContent>
          <DialogContent>
            <AutoRenewalTable data={autoRenewalData} />
            <DialogContentText>
              <br></br>
              <Alert severity='error'>
                <Typography sx={{fontSize: '12px'}}>
                Please remove the above employees auto renewal shift to proceed.
                </Typography>
              </Alert>
            </DialogContentText>
          </DialogContent>
        </>
      ) : null}
      <DialogActions>
        {/* <Button onClick={handleClose} variant='outlined'>
                    Cancel
                </Button> */}
        <Button onClick={handleSubmit} variant='contained'>
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Table({data}) {
  const formatter = new Intl.ListFormat('en', {
    style: 'long',
    type: 'conjunction',
  });

  return (
    <Grid
      style={{
        margin: '5px 0px',
        width: '100%',
        maxWidth: '700',
      }}
    >
      <table
        style={{
          border: '1px solid',
          fontSize: cellStyle.fontSize,
          borderCollapse: 'collapse',
          padding: '0px 5px',
          width: '100%',
          paddingBottom: '10px',
        }}
      >
        <tr>
          <th style={{border: '1px solid', width: '60%'}}>{'Employee'}</th>
          <th style={{border: '1px solid', width: '40%'}}>{'Active Shift'}</th>
        </tr>
        {data.map((d, i) => (
          <tr key={i}>
            <td style={{border: '1px solid', padding: '0px 5px'}}>
              {d.last_name
                ? `${capitalize(d.first_name)} ${capitalize(d.last_name)}`
                : capitalize(d.first_name)}
            </td>

            <td style={{border: '1px solid', padding: '0px 5px'}}>
              {formatter.format(d.alreadyInShift.map((i) => i.shift_name))}
            </td>
          </tr>
        ))}
      </table>
    </Grid>
  );
}

function AutoRenewalTable({data}) {
  const formatter = new Intl.ListFormat('en', {
    style: 'long',
    type: 'conjunction',
  });

  return (
    <Grid
      style={{
        margin: '5px 0px',
        width: '100%',
        maxWidth: '700',
      }}
    >
      <table
        style={{
          border: '1px solid #D74242',
          fontSize: cellStyle.fontSize,
          borderCollapse: 'collapse',
          padding: '0px 5px',
          width: '100%',
          paddingBottom: '10px',
        }}
      >
        <tr>
          <th style={{border: '1px solid', width: '40%'}}>{'Employee'}</th>
          <th style={{border: '1px solid', width: '40%'}}>{'Auto Renewal Shift'}</th>
        </tr>
        {data.map((d, i) => (
          <tr key={i}>
            <td style={{border: '1px solid', padding: '0px 5px'}}>
              {d.last_name
                ? `${capitalize(d.first_name)} ${capitalize(d.last_name)}`
                : capitalize(d.first_name)}
            </td>

            <td style={{border: '1px solid', padding: '0px 5px'}}>
              {formatter.format(d.autoRenewal.map((i) => i.shift_name))}
            </td>
          </tr>
        ))}
      </table>
    </Grid>
  );
}

export default InfoDialog;
