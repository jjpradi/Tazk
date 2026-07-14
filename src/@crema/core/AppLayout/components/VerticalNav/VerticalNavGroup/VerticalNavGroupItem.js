import React from 'react';
import ListItem from '@mui/material/ListItem';
import PropsTypes from 'prop-types';
import {Fonts} from '../../../../../../shared/constants/AppEnums';
import {alpha} from '@mui/material';

const VerticalNavGroupItem = ({children, sidebarTextColor, level, ...rest}) => {
  return (
    <ListItem
      sx={{
        height: 36,
        mt: 2,
        mb: 0.5,
        pl: 31 + 33 * level + 'px',
        pr: 3,
        color: alpha(sidebarTextColor, 0.45),
        fontWeight: Fonts.SEMI_BOLD,
        fontSize: 11,
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        cursor: 'pointer',
        textDecoration: 'none!important',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s ease',
        '&.nav-item-header': {
          cursor: 'auto',
        },
      }}
      {...rest}
    >
      
      {children}

    </ListItem>
    
  );
};

export default VerticalNavGroupItem;

VerticalNavGroupItem.propTypes = {
  children: PropsTypes.node,
  sidebarTextColor: PropsTypes.string,
  level: PropsTypes.number,
};
