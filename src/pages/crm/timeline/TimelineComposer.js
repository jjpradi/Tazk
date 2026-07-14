import React, {useMemo, useState} from 'react';
import {Box, Button, Card, Grid, TextField, Typography} from '@mui/material';

export default function TimelineComposer({
  entityType,
  entityId,
  onCreate,
  disabled = false,
}) {
  const [note, setNote] = useState('');

  const canSubmit = useMemo(() => {
    return !disabled && note.trim().length > 0 && entityType && entityId != null;
  }, [disabled, note, entityType, entityId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    onCreate?.({
      type: 'note',
      entityType,
      entityId,
      occurredAt: new Date().toISOString(),
      payload: {note: note.trim()},
    });

    setNote('');
  };

  return (
    <Card variant='outlined' sx={{p: 2}}>
      <Typography sx={{fontWeight: 600, mb: 1}}>Add Note</Typography>
      <Box component='form' onSubmit={handleSubmit}>
        <Grid container spacing={2} alignItems='flex-start'>
          <Grid
            size={{
              xs: 12,
              md: 10
            }}>
            <TextField
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder='Write a note...'
              minRows={2}
              multiline
              fullWidth
              disabled={disabled}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 2
            }}>
            <Button
              type='submit'
              variant='contained'
              disabled={!canSubmit}
              fullWidth
            >
              Add
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
}

