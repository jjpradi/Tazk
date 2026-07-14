import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, IconButton, List, ListItem, ListItemAvatar, Avatar,
  Button, Chip, Divider,
} from '@mui/material';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AppScrollbar from '@crema/core/AppScrollbar';
import superAdminService from '../../../services/superAdmin_services';

const SEVERITY_COLORS = {
  critical: '#f44336',
  warning: '#ff9800',
  info: '#2196f3',
};

const TYPE_ICONS = {
  expiry_warning: <WarningAmberIcon sx={{ color: '#ff9800' }} />,
  expiry_urgent: <ErrorOutlineIcon sx={{ color: '#f44336' }} />,
  new_registration: <PersonAddOutlinedIcon sx={{ color: '#4caf50' }} />,
  health_drop: <FavoriteIcon sx={{ color: '#f44336' }} />,
  system: <InfoOutlinedIcon sx={{ color: '#2196f3' }} />,
};

function timeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString('en-GB');
}

const SANotificationContent = ({ onClose, sxStyle }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async (pageNum = 0) => {
    try {
      setLoading(true);
      const res = await superAdminService.getSANotifications(pageNum, 20);
      if (res.status === 200) {
        const data = res.data;
        if (pageNum === 0) {
          setNotifications(data.notifications || []);
        } else {
          setNotifications(prev => [...prev, ...(data.notifications || [])]);
        }
        setUnreadCount(data.unreadCount || 0);
        setHasMore((data.notifications || []).length >= 20);
      }
    } catch (err) {
      console.error('SA notifications fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(0);
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await superAdminService.markAllSANotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error('markAllRead error:', err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await superAdminService.markSANotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('markRead error:', err);
    }
  };

  const handleDismiss = async (e, id) => {
    e.stopPropagation();
    try {
      await superAdminService.dismissSANotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('dismiss error:', err);
    }
  };

  const handleClick = (item) => {
    if (!item.is_read) handleMarkRead(item.id);
    if (item.reference_type === 'company' && item.reference_id) {
      onClose();
      navigate(`/superadmin/companies/${item.reference_id}`);
    }
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || !hasMore || loading) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 30) {
      const next = page + 1;
      setPage(next);
      fetchNotifications(next);
    }
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchNotifications(next);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: 360, height: 'calc(100vh - 30px)', ...sxStyle }}>
      {/* Header */}
      <Box sx={{
        px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: 1, borderBottomColor: 'divider', minHeight: 56,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" fontWeight={700}>Notifications</Typography>
          {unreadCount > 0 && (
            <Chip label={unreadCount} size="small" color="error" sx={{ height: 20, fontSize: '0.7rem' }} />
          )}
        </Box>
        <Box>
          {unreadCount > 0 && (
            <IconButton size="small" onClick={handleMarkAllRead} title="Mark all read">
              <DoneAllIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton size="small" onClick={onClose}>
            <CancelOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* List */}
      <AppScrollbar
        sx={{ height: 'calc(100% - 56px)' }}
        scrollRef={scrollRef}
        onScroll={handleScroll}
      >
        <List sx={{ py: 0 }}>
          {notifications.length === 0 && !loading ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No notifications</Typography>
            </Box>
          ) : (
            notifications.map((item) => (
              <React.Fragment key={item.id}>
                <ListItem
                  sx={{
                    px: 2, py: 1.5, cursor: 'pointer',
                    bgcolor: item.is_read ? 'transparent' : 'action.hover',
                    '&:hover': { bgcolor: 'action.selected' },
                  }}
                  onClick={() => handleClick(item)}
                >
                  <ListItemAvatar sx={{ minWidth: 0, mr: 1.5 }}>
                    <Avatar sx={{
                      width: 36, height: 36,
                      bgcolor: `${SEVERITY_COLORS[item.severity] || '#2196f3'}15`,
                    }}>
                      {TYPE_ICONS[item.notification_type] || TYPE_ICONS.system}
                    </Avatar>
                  </ListItemAvatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="body2" fontWeight={item.is_read ? 400 : 600} sx={{
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mr: 1,
                      }}>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {timeAgo(item.created_at)}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      overflow: 'hidden', lineHeight: 1.4, mt: 0.3,
                    }}>
                      {item.message}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={(e) => handleDismiss(e, item.id)} sx={{ ml: 0.5, flexShrink: 0 }}>
                    <DeleteOutlineIcon fontSize="small" sx={{ fontSize: 16 }} />
                  </IconButton>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))
          )}
        </List>
        {hasMore && notifications.length > 0 && (
          <Button fullWidth onClick={handleLoadMore} disabled={loading} sx={{ mt: 1, mb: 2 }}>
            {loading ? 'Loading...' : 'Show More'}
          </Button>
        )}
      </AppScrollbar>
    </Box>
  );
};

export default SANotificationContent;
