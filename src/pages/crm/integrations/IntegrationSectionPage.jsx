import {Box, Button, Card, CardContent, Grid, List, ListItem, ListItemText, Typography} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';

const getItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
};

const getErrorMessage = (error, fallback = 'Unable to load configuration') =>
  error?.response?.data?.message || error?.response?.data?.ERROR || error?.message || fallback;

export default function IntegrationSectionPage({
  title,
  description,
  loadAction,
  comingSoon = false,
  emptyMessage = 'No records found.',
}) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { (async () => {
    let active = true;

    const run = async () => {
      if (comingSoon || typeof loadAction !== 'function') {
        setItems([]);
        setError('');
        return;
      }

      setLoading(true);
      setError('');
      try {
        const response = await loadAction();
        if (!active) return;
        setItems(getItems(response?.data || response));
      } catch (err) {
        if (!active) return;
        setItems([]);
        setError(getErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  })();
}, [comingSoon, loadAction]);

  const activeCount = useMemo(
    () => items.filter((item) => String(item?.status || '').toLowerCase() === 'active').length,
    [items],
  );

  return (
    <Box>
      <Card sx={{mb: 2, p: 2}}>
        <Grid container spacing={2} alignItems='center' justifyContent='space-between'>
          <Grid>
            <Typography variant='h5' sx={{fontWeight: 700}}>
              {title}
            </Typography>
            <Typography color='text.secondary'>{description}</Typography>
          </Grid>
          <Grid>
            <Button
              variant='outlined'
              color='inherit'
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/crm/integrations')}
            >
              Back to Hub
            </Button>
          </Grid>
        </Grid>
      </Card>
      <Card sx={{p: 2}}>
        {comingSoon ? (
          <Typography color='text.secondary'>Coming soon. Backend management UI will be added in next slices.</Typography>
        ) : (
          <>
            <Typography variant='subtitle1' sx={{fontWeight: 600, mb: 1}}>
              Active Configurations: {loading ? 'Loading...' : activeCount}
            </Typography>

            {error ? (
              <Typography color='error'>{error}</Typography>
            ) : items.length === 0 ? (
              <Typography color='text.secondary'>{loading ? 'Loading...' : emptyMessage}</Typography>
            ) : (
              <List dense>
                {items.slice(0, 20).map((item, index) => (
                  <ListItem key={item?.id || item?.webhook_id || item?.api_key_id || index} divider>
                    <ListItemText
                      primary={
                        item?.name ||
                        item?.form_name ||
                        item?.source_name ||
                        item?.webhook_name ||
                        `Config ${index + 1}`
                      }
                      secondary={`Status: ${item?.status || '-'}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}
      </Card>
    </Box>
  );
}
