import React from 'react';
import HorizontalGroup from './HorizontalGroup';
import HorizontalCollapse from './HorizontalCollapse';
import HorizontalCollapseChildren from './HorizontalCollapseChildren';
import HorizontalItem from './HorizontalItem';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';

import { useSelector } from 'react-redux';

const HorizontalNav = () => {
  const {
    NavigationReducer: {
      menus: navigationMenus,
      loaded: navigationLoaded,
    },
  } = useSelector(state => state);

  // Use DB-driven menus only — no frontend filtering
  if (!navigationLoaded || !navigationMenus.length) {
    return <List className='navbarNav'></List>;
  }

  return (
    <List className='navbarNav'>
      {navigationMenus.map((item, idx) => (
        <React.Fragment key={`${item.id ?? 'root'}-${item.messageId ?? item.url ?? 'menu'}-${idx}`}>
          {item.type === 'group' && (
            <HorizontalGroup item={item} nestedLevel={0} />
          )}

          {item.type === 'collapse' && (
            <HorizontalCollapse item={item} nestedLevel={0} />
          )}

          {(item.type === 'item' || item.type === 'panel-item') && (
            <HorizontalItem item={item} nestedLevel={0} />
          )}

          {item.type === 'divider' && <Divider sx={{my: 5}} />}
          
          {item.type === 'children_level_1' && (
            <HorizontalCollapseChildren item={item} nestedLevel={0} />
          )}
        </React.Fragment>
      ))}
    </List>
  );
};

export default HorizontalNav;
