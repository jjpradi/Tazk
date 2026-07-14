import {Box, Button, TextField, Typography} from '@mui/material';
import {useState} from 'react';

export default function TimelineComposer({onAddNote}) {
  const [note, setNote] = useState('');

  const submit = () => {
    const trimmed = note.trim();
    if (!trimmed) return;
    onAddNote?.(trimmed);
    setNote('');
  };

  return (
    <Box sx={{border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2}}>
      <Typography sx={{fontWeight: 600, mb: 1}}>Add Note</Typography>
      <TextField
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Type a note…"
        multiline
        minRows={2}
        fullWidth
        size="small"
      />
      <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 1}}>
        <Button variant="contained" onClick={submit} disabled={!note.trim()}>
          Add
        </Button>
      </Box>
    </Box>
  );
}

