import React, { useEffect, useState } from 'react';
import {
  Box, Button, Checkbox, CircularProgress, Divider,
  List, ListItem, ListItemText, Snackbar, Alert, Typography,
} from '@mui/material';
import RbacService from '../../../../../services/rbac_services';

const CHANNELS = ['notify_in_app', 'notify_push', 'notify_email', 'notify_sms', 'notify_whatsapp'];
const CHANNEL_LABELS = { notify_in_app: 'In-App', notify_push: 'Push', notify_email: 'Email', notify_sms: 'SMS', notify_whatsapp: 'WhatsApp' };

const Preferences = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const notifRes = await RbacService.getMyNotifications();
      setNotifications(notifRes.data || []);
    } catch (err) {
      setSnack({ open: true, msg: 'Failed to load preferences', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleNotifToggle = (idx, channel) => {
    setNotifications(prev => prev.map((n, i) =>
      i === idx ? { ...n, [channel]: n[channel] ? 0 : 1 } : n
    ));
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await RbacService.setMyNotifications({ items: notifications });
      setSnack({ open: true, msg: 'Notification preferences saved', severity: 'success' });
    } catch (err) {
      setSnack({ open: true, msg: 'Failed to save notifications', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ position: 'relative', p: { xs: 2, md: 3, lg: 4 } }}>
      {/* Header with Save button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography component='h3' sx={{ fontSize: 16, fontWeight: 'bold' }}>Notification Preferences</Typography>
        {notifications.length > 0 && (
          <Button variant="contained" size="small" onClick={handleSaveNotifications} disabled={saving}>
            {saving ? 'Saving...' : 'Save Notifications'}
          </Button>
        )}
      </Box>

      {notifications.length === 0 ? (
        <Typography variant="body2" color="textSecondary">
          No notification types available for your role.
        </Typography>
      ) : (
        <>
          {/* Header row */}
          <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography sx={{ flex: 1, fontWeight: 600, fontSize: 13 }}>Notification</Typography>
            {CHANNELS.map(ch => (
              <Typography key={ch} sx={{ width: 80, textAlign: 'center', fontWeight: 600, fontSize: 12 }}>
                {CHANNEL_LABELS[ch]}
              </Typography>
            ))}
          </Box>
          <List dense>
            {notifications.map((notif, idx) => (
              <React.Fragment key={notif.notification_key || idx}>
                <ListItem sx={{ display: 'flex', alignItems: 'center' }}>
                  <ListItemText
                    primary={notif.notification_name || notif.notification_key}
                    sx={{ flex: 1 }}
                    primaryTypographyProps={{ fontSize: 13 }}
                  />
                  {CHANNELS.map(ch => (
                    <Box key={ch} sx={{ width: 80, textAlign: 'center' }}>
                      <Checkbox
                        size="small"
                        checked={!!notif[ch]}
                        onChange={() => handleNotifToggle(idx, ch)}
                      />
                    </Box>
                  ))}
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </>
      )}

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Preferences;
