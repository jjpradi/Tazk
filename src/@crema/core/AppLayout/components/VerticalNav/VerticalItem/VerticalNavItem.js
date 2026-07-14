import React from 'react';
import PropsTypes from 'prop-types';
import ListItemButton from '@mui/material/ListItemButton';
import {Fonts, MenuStyle} from '../../../../../../shared/constants/AppEnums';
import {useSidebarContext} from '../../../../../utility/AppContextProvider/SidebarContextProvider';
import clsx from 'clsx';

const VerticalNavItem = ({children, level, ...rest}) => {
  const {
    sidebarTextColor,
    sidebarMenuSelectedBgColor,
    sidebarMenuSelectedTextColor,
    menuStyle,
  } = useSidebarContext();

  return (
    <ListItemButton
      className={clsx(
        'menu-vertical-item',
        menuStyle === MenuStyle.ROUNDED && 'rounded-menu',
        menuStyle === MenuStyle.ROUNDED_REVERSE && 'rounded-menu-reverse',
        menuStyle === MenuStyle.STANDARD && 'standard-menu',
        menuStyle === MenuStyle.CURVED_MENU && 'curved-menu',
      )}
      sx={(theme) => ({
        height: 36,
        my: 0.25,
        cursor: 'pointer',
        textDecoration: 'none !important',
        mx: 2,
        width: 'calc(100% - 16px)',
        pl: level > 0 ? `${level === 1 ? 50 : 54}px !important` : '22px',
        pr: 3,
        borderRadius: 1,
        position: 'relative',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
        '& .nav-item-icon': {
          color: theme.alpha(sidebarTextColor, 0.7),
          fontSize: 20,
          display: 'block',
          transition: 'color 0.2s ease',
        },
        '& .nav-item-text': {
          color: theme.alpha(sidebarTextColor, 0.7),
          fontWeight: Fonts.MEDIUM,
          fontSize: 13,
          transition: 'color 0.2s ease, font-weight 0.2s ease',
        },

        '& .MuiTouchRipple-root': {
          zIndex: 1,
        },
        '&.nav-item-header': {
          textTransform: 'uppercase',
        },
        '&:hover, &:focus': {
          '& .nav-item-text, & .nav-item-icon, & .nav-item-icon-arrow': {
            color: sidebarTextColor,
          },
        },
        '&.active': {
          backgroundColor: sidebarMenuSelectedBgColor,
          pointerEvents: 'none',
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
            color: sidebarMenuSelectedTextColor + '!important',
            fontWeight: Fonts.SEMI_BOLD,
          },
          '& .nav-item-icon': {
            color: sidebarMenuSelectedTextColor + '!important',
          },
        },
        '&.rounded-menu': {
          mr: 4,
          ml: 0,
          width: 'calc(100% - 16px)',
          pl: (level > 0 ? 78 + 20 * (level - 1) : 30) + 'px',
          pr: 3,
          borderRadius: '0 30px 30px 0',
        },
        '&.rounded-menu-reverse': {
          ml: 4,
          mr: 0,
          width: 'calc(100% - 16px)',
          pl: (level > 0 ? 62 + 20 * (level - 1) : 14) + 'px',
          pr: 3,
          borderRadius: '30px 0 0 30px',
        },
        '&.standard-menu': {
          mx: 0,
          width: '100%',
          pl: (level > 0 ? 78 + 20 * (level - 1) : 30) + 'px',
          pr: 3,
          borderRadius: 0,
          position: 'relative',
          '&:after': {
            content: '""',
            position: 'absolute',
            right: 0,
            top: 0,
            height: '100%',
            width: 4,
            backgroundColor: 'transparent',
          },
          '&.active:after': {
            backgroundColor: theme.palette.primary.main,
          },
        },
        '&.curved-menu': {
          ml: 4,
          mr: 0,
          width: 'calc(100% - 16px)',
          pl: (level > 0 ? 62 + 20 * (level - 1) : 14) + 'px',
          pr: 3,
          borderRadius: '30px 0 0 30px',
          position: 'relative',
          transition: 'none',
          '&:before, &:after': {
            content: '""',
            position: 'absolute',
            right: 0,
            zIndex: 1,
            height: 36,
            width: 36,
            backgroundColor: 'transparent',
            borderRadius: '50%',
            opacity: 0,
          },
          '&:before': {
            top: -36,
            boxShadow: `30px 30px 0 10px transparent`,
          },
          '&:after': {
            bottom: -36,
            boxShadow: `30px -30px 0 10px transparent`,
          },
          '&:hover, &.active': {
            backgroundColor: sidebarMenuSelectedBgColor,
            '& .nav-item-text, & .nav-item-icon': {
              color: sidebarMenuSelectedTextColor + '!important',
            },
            '&:before': {
              boxShadow: `30px 30px 0 10px ${sidebarMenuSelectedBgColor}`,
              opacity: 1,
            },
            '&:after': {
              boxShadow: `30px -30px 0 10px ${sidebarMenuSelectedBgColor}`,
              opacity: 1,
            },
          },
          '& .MuiTouchRipple-root': {
            display: 'none',
          },
        },
      })}
      {...rest}
    >
      {children}
    </ListItemButton>
  );
};

export default VerticalNavItem;

VerticalNavItem.propTypes = {
  children: PropsTypes.node,
  level: PropsTypes.number,
};
