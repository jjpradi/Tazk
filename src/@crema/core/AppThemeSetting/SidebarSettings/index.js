import React from 'react';
import Box from '@mui/material/Box';
import {CustomizerItemWrapper} from '../index.style';
import {sidebarColors} from '../../../services/db/navigationStyle';
import MenuColorCell from './MenuColorCell';
import AppGrid from '../../AppGrid';

// Corporate-standard sidebar color options
const CORPORATE_SIDEBAR_IDS = [0, 1, 3, 4, 5, 11];

const SidebarSettings = ({onChange}) => {
  const corporateSidebarColors = sidebarColors.filter((c) =>
    CORPORATE_SIDEBAR_IDS.includes(c.id),
  );

  const onSelectSidebarColor = (colorId) => {
    if (onChange) {
      onChange('sidebar_color', colorId);
    }
  };

  return (
    <CustomizerItemWrapper>
      <Box component='h3' sx={{mb: 3}}>
        Sidebar Colors
      </Box>
      <AppGrid
        data={corporateSidebarColors}
        column={2}
        itemPadding={5}
        renderRow={(colorSet, index) => (
          <MenuColorCell
            key={colorSet.id}
            sidebarColors={colorSet}
            onClick={() => onSelectSidebarColor(colorSet.id + 1)}
          />
        )}
      />
    </CustomizerItemWrapper>
  );
};

export default SidebarSettings;
