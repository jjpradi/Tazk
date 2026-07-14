import {Box, Typography} from '@mui/material';

function formatTime(iso) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString();
  } catch {
    return '';
  }
}

function renderSummary(event) {
  const p = event?.payload || {};
  switch (event?.type) {
    case 'note':
      return p.note || 'Note';
    case 'call':
      return p.summary || 'Call';
    case 'meeting':
      return p.summary || 'Meeting';
    case 'quote':
      return p.summary || 'Quotation';
    case 'status':
      return p.status ? `Status → ${p.status}` : 'Status changed';
    default:
      return p.summary || event?.type || 'Event';
  }
}

export default function TimelineFeed({events = []}) {
  if (!events.length) {
    return (
      <Typography color="text.secondary" sx={{px: 1}}>
        No timeline events yet.
      </Typography>
    );
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
      {events.map((e) => (
        <Box
          key={e.id}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 1.5,
          }}
        >
          <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap'}}>
            <Typography sx={{fontWeight: 600, textTransform: 'capitalize'}}>
              {String(e.type || 'event')}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {formatTime(e.occurredAt)}
            </Typography>
          </Box>
          <Typography sx={{mt: 0.5}}>{renderSummary(e)}</Typography>
        </Box>
      ))}
    </Box>
  );
}

