import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Collapse, Icon, IconButton, ListItemText} from '@mui/material';
import {useLocation} from 'react-router-dom';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import VerticalItem from '../VerticalItem';
import Box from '@mui/material/Box';
import IntlMessages from '../../../../../utility/IntlMessages';
import {checkPermission} from '../../../../../utility/helper/RouteHelper';
import {useAuthUser} from '../../../../../utility/AuthHooks';
import {useThemeContext} from '../../../../../utility/AppContextProvider/ThemeContextProvider';
import {useSidebarContext} from '../../../../../utility/AppContextProvider/SidebarContextProvider';
import VerticalCollapseItem from './VerticalCollapseItem';
import { getsessionStorage } from 'pages/common/login/cookies';

const needsToBeOpened = (pathname, item) => {
  return pathname && isUrlInChildren(item, pathname);
};

const isUrlInChildren = (parent, url) => {
  if (!parent.children) {
    return false;
  }

  for (let i = 0; i < parent.children.length; i++) {
    if (parent.children[i].children) {
      if (isUrlInChildren(parent.children[i], url)) {
        return true;
      }
    }

    if (
      parent.children[i].url === url ||
      url.includes(parent.children[i].url)
    ) {
      return true;
    }
  }

  return false;
};

const VerticalCollapse = ({item, level}) => {
  const {theme} = useThemeContext();
  const {sidebarTextColor} = useSidebarContext();
  const {pathname} = useLocation();
  const [open, setOpen] = useState(() => needsToBeOpened(pathname, item));
  let storage = getsessionStorage()


  useEffect(() => {
    if (needsToBeOpened(pathname, item)) {
      setOpen(true);
    }
  }, [pathname, item]);

  const handleClick = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const {user} = useAuthUser();
  const hasPermission = useMemo(
    () => checkPermission(item.permittedRole, user.role),
    [item.permittedRole, user.role],
  );

  if (!hasPermission) {
    return null;
  }

  const getMenuName = (messageId) =>{
    
    if(messageId === 'Payroll Reports') return 'Reports'
    
    return messageId
    
  }



  return (
    <>
      <VerticalCollapseItem
        level={level}
        sidebarTextColor={sidebarTextColor}
        component='div'
        role='button'
        aria-expanded={open}
        aria-label={item.title || item.messageId}
        className={clsx('menu-vertical-collapse', open && 'open', needsToBeOpened(pathname, item) && 'active-parent')}
        onClick={handleClick}
      >
        {item.icon && (
          <Box component='span' sx={{ mr: 4, display: 'flex', alignItems: 'center' }}>
            {typeof item.icon === 'string' ? (
              <Icon color='action' className={clsx('nav-item-icon')}>
                {item.icon}
              </Icon>
            ) : (
              item.icon
            )}
          </Box>
        )}
        <ListItemText
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: 14,
          }}
          className='nav-item-content'
          classes={{primary: clsx('nav-item-text')}}
          primary={getMenuName(item.messageId)}
        />
        <IconButton
          className='nav-item-icon-arrow-btn'
          sx={{p: 0, mr: 0.75}}
          disableRipple
          size='large'
        >
          <Icon className='nav-item-icon-arrow' color='inherit'>
            {open
              ? 'expand_more'
              : theme.direction === 'ltr'
              ? 'chevron_right'
              : 'chevron_left'}
          </Icon>
        </IconButton>
      </VerticalCollapseItem>

      {item.children && (
        <Collapse in={open} className='collapse-children'>
          {item.children
            .filter(child => !['report_category', 'report', 'sidebar-item', 'tab-item'].includes(child.type))
            .map((item, idx) => (
            <React.Fragment key={`${item.id ?? 'collapse'}-${item.messageId ?? item.url ?? 'menu'}-${idx}`}>
              {item.type === 'collapse' && (
                <VerticalCollapse item={item} level={level + 1} />
              )}

              {(item.type === 'item' || item.type === 'panel-item') && (
                <VerticalItem item={item} level={level + 1} />
              )}
            </React.Fragment>
          ))}
        </Collapse>
      )}
    </>
  );
};

VerticalCollapse.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    icon: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    permittedRole: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    children: PropTypes.array,
    messageId: PropTypes.string,
    type: PropTypes.string,
  }),
  level: PropTypes.number,
};
export default React.memo(VerticalCollapse);
