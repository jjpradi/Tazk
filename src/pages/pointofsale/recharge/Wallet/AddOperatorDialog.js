import React, {useContext, useState, useEffect} from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Stack, InputAdornment,
} from '@mui/material';
import {useDispatch} from 'react-redux';
import CreateNewButtonContext from '../../../../context/CreateNewButtonContext';
import {createOperator, fetchOperators} from '../../../../redux/actions/recharge_actions';

export default function AddOperatorDialog({open, onClose}) {
  const dispatch = useDispatch();
  const {headerLocationId} = useContext(CreateNewButtonContext);
  const [code, setCode] = useState('');
  const [margin, setMargin] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) { setCode(''); setMargin(''); setSubmitting(false); }
  }, [open]);

  const canSubmit = code.trim().length > 0 && margin !== '' &&
    Number(margin) >= 0 && Number(margin) <= 100 && !submitting;

  const handleSubmit = () => {
    setSubmitting(true);
    dispatch(
      createOperator(
        {code: code.trim(), margin_percent: Number(margin)},
        () => {
          dispatch(fetchOperators(headerLocationId));
          onClose();
        }
      )
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
      <DialogTitle>Add Operator</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{mt: 1}}>
          <TextField
            label='Operator Code'
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder='e.g. MTNL, Reliance'
            fullWidth
            size='small'
            autoFocus
          />
          <TextField
            label='Margin %'
            value={margin}
            onChange={(e) => setMargin(e.target.value)}
            type='number'
            fullWidth
            size='small'
            InputProps={{endAdornment: <InputAdornment position='end'>%</InputAdornment>}}
            inputProps={{min: 0, max: 100, step: 0.1}}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant='contained' disabled={!canSubmit} onClick={handleSubmit}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
