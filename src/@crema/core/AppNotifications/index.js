import React, { useState, useEffect, useCallback } from 'react';
import { Badge, IconButton } from '@mui/material';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppNotificationContent from './AppNotificationContent';
import SANotificationContent from './SANotificationContent';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AppTooltip from '../AppTooltip';
import { getsessionStorage } from '../../../pages/common/login/cookies';
import superAdminService from '../../../services/superAdmin_services';

const AppNotifications = ({
  isMenu,
  sxNotificationContentStyle,
  drawerPosition = 'right',
  tooltipPosition = 'bottom',
}) => {
  const [showNotification, setShowNotification] = useState(false);
  const [saUnreadCount, setSaUnreadCount] = useState(0);

  const storage = getsessionStorage();
  const isSuperAdmin = String(storage?.company_type || '').split(',').includes('8');

  const fetchSAUnreadCount = useCallback(async () => {
    if (!isSuperAdmin) return;
    try {
      const res = await superAdminService.getSAUnreadCount();
      if (res.status === 200) setSaUnreadCount(res.data?.unreadCount || 0);
    } catch (err) { /* ignore */ }
  }, [isSuperAdmin]);

  useEffect(() => {
    fetchSAUnreadCount();
    if (!isSuperAdmin) return;
    const interval = setInterval(fetchSAUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [fetchSAUnreadCount, isSuperAdmin]);

  const handleOpen = () => setShowNotification(true);
  const handleClose = () => {
    setShowNotification(false);
    if (isSuperAdmin) fetchSAUnreadCount();
  };

  return (
    <>
      {isMenu ? (
        <Box component='span' onClick={handleOpen}>
          Notification
        </Box>
      ) : (
        <AppTooltip title='Notification' placement={tooltipPosition}>
          <IconButton
            className='icon-btn'
            sx={(theme) => ({
              borderRadius: '50%',
              width: 40,
              height: 40,
              color: theme.palette.text.secondary,
              backgroundColor: theme.palette.background.default,
              border: 1,
              borderColor: 'transparent',
              '&:hover, &:focus': {
                color: theme.palette.text.primary,
                backgroundColor: theme.alpha(theme.palette.background.default, 0.9),
                borderColor: theme.alpha(theme.palette.text.secondary, 0.25),
              },
            })}
            onClick={handleOpen}
            size='large'
          >
            <Badge badgeContent={isSuperAdmin ? saUnreadCount : 0} color="error" max={99}>
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>
        </AppTooltip>
      )}
      <Drawer
        anchor={drawerPosition}
        open={showNotification}
        onClose={handleClose}
      >
        {isSuperAdmin ? (
          <SANotificationContent
            sxStyle={sxNotificationContentStyle}
            onClose={handleClose}
          />
        ) : (
          <AppNotificationContent
            sxStyle={sxNotificationContentStyle}
            onClose={handleClose}
          />
        )}
      </Drawer>
    </>
  );
};

export default AppNotifications;

AppNotifications.propTypes = {
  drawerPosition: PropTypes.string,
  tooltipPosition: PropTypes.string,
  isMenu: PropTypes.bool,
  sxNotificationContentStyle: PropTypes.object,
};



