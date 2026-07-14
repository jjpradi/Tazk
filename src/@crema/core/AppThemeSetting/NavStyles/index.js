import React from 'react';
import {CustomizerItemWrapper} from '../index.style';
import Box from '@mui/material/Box';
import IntlMessages from '../../../utility/IntlMessages';
import {navStyles} from '../../../services/db/navigationStyle';
import {
  useLayoutContext,
} from '../../../utility/AppContextProvider/LayoutContextProvider';
import AppSelectedIcon from '../../AppSelectedIcon';

// Corporate-standard nav styles: Default, Standard, Mini Sidebar Toggle, Header User Mini
const CORPORATE_NAV_IDS = [1, 3, 6, 8];

const NavStyles = ({onChange}) => {
  const {navStyle} = useLayoutContext();

  const corporateNavStyles = navStyles.filter((n) => CORPORATE_NAV_IDS.includes(n.id));

  return (
    <CustomizerItemWrapper
      sx={{
        pb: 1,
      }}
    >
      <Box component='h3' sx={{mb: 3}}>
        <IntlMessages id='customizer.navigationStyles' />
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          mx: -1.25,
        }}
      >
        {corporateNavStyles.map((navLayout) => {
          return (
            <Box
              sx={{
                px: 1.25,
                mb: 1.25,
              }}
              key={navLayout.id}
            >
              <Box
                sx={{
                  position: 'relative',
                  cursor: 'pointer',
                }}
                // onClick={() => onNavStyleChange(navLayout.id)}
                onClick={() => onChange?.('nav_styles', navLayout.id)}
              >
                <img src={navLayout.image} alt='nav' style={{height: 100, width: 100}} />
                {navStyle === navLayout.alias ? <AppSelectedIcon /> : null}
              </Box>
            </Box>
          );
        })}
      </Box>
    </CustomizerItemWrapper>
  );
};

export default NavStyles;
