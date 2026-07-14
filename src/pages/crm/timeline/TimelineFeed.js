import React from 'react';
import {Box, Card, Divider, Stack, Typography} from '@mui/material';

function formatWhen(occurredAt) {
  if (!occurredAt) return '-';
  const d = new Date(occurredAt);
  if (Number.isNaN(d.getTime())) return String(occurredAt);
  return d.toLocaleString();
}

export default function TimelineFeed({events = []}) {
  if (!Array.isArray(events) || events.length === 0) {
    return (
      <Card variant='outlined' sx={{p: 2}}>
        <Typography color='text.secondary'>No timeline events yet.</Typography>
      </Card>
    );
  }

  return (
    <Card variant='outlined' sx={{p: 2}}>
      <Stack divider={<Divider flexItem />} spacing={1.5}>
        {events.map((e, idx) => (
          <Box key={e.id ?? `${e.entityType}:${e.entityId}:${idx}`}>
            <Stack direction='row' justifyContent='space-between' spacing={2}>
              <Typography sx={{fontWeight: 600}}>
                {e.type || 'event'}
              </Typography>
              <Typography color='text.secondary' sx={{whiteSpace: 'nowrap'}}>
                {formatWhen(e.occurredAt)}
              </Typography>
            </Stack>
            {e?.payload?.note ? (
              <Typography sx={{mt: 0.5}}>{e.payload.note}</Typography>
            ) : (
              <Typography
                sx={{mt: 0.5, fontFamily: 'monospace', fontSize: 12}}
              >
                {JSON.stringify(e.payload ?? {}, null, 2)}
              </Typography>
            )}
          </Box>
        ))}
      </Stack>
    </Card>
  );
}

