import React, {useEffect, useMemo} from 'react';
import {Icon, ListItemText} from '@mui/material';
import {useLocation} from 'react-router-dom';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import AppBadge from '@crema/core/AppBadge';
import AppNavLink from '@crema/core/AppNavLink';
import Box from '@mui/material/Box';
import IntlMessages from '../../../../../utility/IntlMessages';
import {checkPermission} from '../../../../../utility/helper/RouteHelper';
import {useAuthUser} from '../../../../../utility/AuthHooks';
import VerticalNavItem from './VerticalNavItem';
import { getsessionStorage } from 'pages/common/login/cookies';
const VerticalItem = ({level, item}) => {
  const {user} = useAuthUser();
  const {pathname} = useLocation();
  const hasPermission = useMemo(
    () => checkPermission(item.permittedRole, user.role),
    [item.permittedRole, user.role],
  );

  useEffect(() => {
    if (pathname === item.url && document.getElementById(pathname)) {
      setTimeout(() => {
        document.getElementById(pathname)?.scrollIntoView({behavior: 'smooth', block: 'center'});
      }, 1);
    }
  }, [pathname, item.url]);

  if (!hasPermission) {
    return null;
  }
  let storage = getsessionStorage()

  const getMenuName = (messageId) =>{
   
    return messageId
    
  }

  return (
    <VerticalNavItem
      level={level}
      id={item.url}
      component={AppNavLink}
      to={item.url}
      activeClassName='active'
      exact={item.exact}
    >
      {level === 0 && item.icon ? (
        <Box component='span' sx={{ mr: 3, display: 'flex', alignItems: 'center' }}>
          {typeof item.icon === 'string' ? (
            <Icon
              sx={{ fontSize: 18, display: 'block' }}
              className={clsx('nav-item-icon', 'material-icons-outlined')}
              color='action'
            >
              {item.icon}
            </Icon>
          ) : (
            item.icon
          )}
        </Box>
      ) : level === 0 ? (<Box component='span' style={{marginLeft: '15px'}}>

      </Box>) : null}
      <ListItemText
        className='nav-item-content'
        primary={getMenuName(item.messageId)}
        classes={{primary: 'nav-item-text'}}
      />
      {item.count && (
        <Box sx={{mr: 3}} className='menu-badge'>
          <AppBadge count={item.count} color={item.color} />
        </Box>
      )}
    </VerticalNavItem>
  );
};

VerticalItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    icon: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    permittedRole: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    exact: PropTypes.bool,
    messageId: PropTypes.string,
    count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    url: PropTypes.string,
    color: PropTypes.string,
  }),
  level: PropTypes.number,
};

export default React.memo(VerticalItem);
