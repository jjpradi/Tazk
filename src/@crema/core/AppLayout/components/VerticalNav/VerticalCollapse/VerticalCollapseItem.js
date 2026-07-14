import React from 'react';
import PropsTypes from 'prop-types';
import ListItemButton from '@mui/material/ListItemButton';
import {Fonts} from '../../../../../../shared/constants/AppEnums';

const VerticalCollapseItem = ({children, level = 0, sidebarTextColor, ...rest}) => {
  return (
    <ListItemButton
      sx={(theme) => ({
        height: 36,
        my: 0.25,
        pl: (level > 0 ? 50 + 20 * (level - 1) : 22) + 'px',
        pr: 3.75,
        whiteSpace: 'nowrap',
        borderRadius: 2,
        mx: 2,
        width: 'calc(100% - 16px)',
        transition: 'all 0.2s ease',
        '& .nav-item-text': {
          fontWeight: Fonts.MEDIUM,
          color: theme.alpha(sidebarTextColor, 0.7),
          fontSize: 13,
          transition: 'color 0.2s ease',
        },

        '& .nav-item-icon': {
          color: theme.alpha(sidebarTextColor, 0.7),
          fontSize: 20,
          display: 'block',
          transition: 'color 0.2s ease',
        },

        '& .nav-item-icon-arrow': {
          color: theme.alpha(sidebarTextColor, 0.7),
          transition: 'transform 0.2s ease, color 0.2s ease',
        },

        '& .MuiIconButton-root': {
          mr: 3,
          padding: 0,
        },

        '& .MuiTouchRipple-root': {
          zIndex: 10,
        },

        '&.open, &:hover, &:focus': {
          '& .nav-item-text': {
            fontWeight: Fonts.MEDIUM,
            color: sidebarTextColor,
          },
          '& .nav-item-icon': {
            color: sidebarTextColor,
          },
          '& .nav-item-icon-arrow': {
            color: sidebarTextColor,
          },
        },
        '&:hover': {
          backgroundColor: 'transparent',
        },
        '&.active-parent': {
          backgroundColor: theme.alpha(sidebarTextColor, 0.08),
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: '20%',
            height: '60%',
            width: 3,
            borderRadius: '0 3px 3px 0',
            backgroundColor: theme.palette.primary.main,
          },
          '& .nav-item-text': {
            color: sidebarTextColor,
            fontWeight: Fonts.SEMI_BOLD,
          },
          '& .nav-item-icon': {
            color: sidebarTextColor,
          },
          '& .nav-item-icon-arrow': {
            color: sidebarTextColor,
          },
        },
      })}
      {...rest}
    >
      {children}
    </ListItemButton>
  );
};

export default VerticalCollapseItem;

VerticalCollapseItem.propTypes = {
  children: PropsTypes.node,
  level: PropsTypes.number,
  sidebarTextColor: PropsTypes.string,
};
