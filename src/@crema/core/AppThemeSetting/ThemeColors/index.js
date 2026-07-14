import React, {useMemo} from 'react';
import {CustomizerItemWrapper} from '../index.style';
import Box from '@mui/material/Box';
import IntlMessages from '../../../utility/IntlMessages';
import themeColorSets from '../../../../shared/constants/ColorSets';
import CustomColorCell from '../CustomColorCell';
import {
  useThemeActionsContext,
  useThemeContext,
} from '../../../utility/AppContextProvider/ThemeContextProvider';
import AppGrid from '../../AppGrid';

// Corporate-standard theme color indices (0-based from ColorSets array)
// Light: Default Blue, Material Blue, Corporate Blue, Teal
// Dark:  Default Dark, Corporate Dark Blue, Teal Dark, Indigo Dark
const CORPORATE_COLOR_INDICES = [0, 2, 4, 5, 1, 18, 19, 13];

const ThemeColors = ({onChange}) => {
  const {theme} = useThemeContext();
  const {updateTheme} = useThemeActionsContext();

  const corporateColors = useMemo(
    () =>
      CORPORATE_COLOR_INDICES.map((origIdx) => ({
        ...themeColorSets[origIdx],
        _originalIndex: origIdx,
      })),
    [],
  );

  const updateThemeColors = (colorSet) => {
    theme.palette.primary.main = colorSet.primary.main;
    theme.palette.secondary.main = colorSet.secondary.main;
    theme.palette.background = colorSet.background;
    theme.palette.mode = colorSet.mode;
    theme.palette.text = colorSet.text;
    updateTheme({...theme});
    if (onChange) {
      onChange('theme_colors', colorSet._originalIndex + 1);
    }
  };

  return (
    <CustomizerItemWrapper>
      <Box component='h4' sx={{mb: 2}}>
        <IntlMessages id='customizer.themeColors' />
      </Box>
      <Box mt={4}>
        <AppGrid
          data={corporateColors}
          itemPadding={5}
          responsive={{
            xs: 1,
            sm: 2,
          }}
          renderRow={(colorSet, index) => (
            <CustomColorCell
              key={colorSet.title || index}
              updateThemeColors={() => updateThemeColors(colorSet)}
              themeColorSet={colorSet}
            />
          )}
        />
      </Box>
    </CustomizerItemWrapper>
  );
};

export default ThemeColors;
