import React from 'react';
import {CustomizerItemWrapper} from '../index.style';
import Box from '@mui/material/Box';
import IntlMessages from '../../../utility/IntlMessages';
import Switch from '@mui/material/Switch';
import {LayoutDirection} from '../../../../shared/constants/AppEnums';
import {
  useThemeActionsContext,
  useThemeContext,
} from '../../../utility/AppContextProvider/ThemeContextProvider';
import CommonToolTip from 'components/ToolTip';

const ThemeDirection = ({ onChange }) => {
  const { theme } = useThemeContext();
  const { updateTheme } = useThemeActionsContext();

  const onChangeRtlSetting = (event) => {
    const isChecked = event.target.checked;

    const newDirection = isChecked ? LayoutDirection.RTL : LayoutDirection.LTR;
    const directionValue = isChecked ? 1 : 0;

    updateTheme({ ...theme, direction: newDirection });

    if (onChange) {
      onChange('theme_direction', directionValue);
    }
  };


  return (
    <CustomizerItemWrapper>
      <Box display='flex' alignItems='center'>
        <Box component='h3'>
          <IntlMessages id='customizer.rtlSupport' />
        </Box>
        <Box component='span' ml='auto'>
          <CommonToolTip title={theme.direction === LayoutDirection.RTL ? 'Turn off' : 'Turn on'}>
          <Switch
            checked={theme.direction === LayoutDirection.RTL}
            onChange={onChangeRtlSetting}
            value='checkedA'
            inputProps={{'aria-label': 'secondary checkbox'}}
         />
           </CommonToolTip>
        </Box>
      </Box>
    </CustomizerItemWrapper>
  );
};

export default ThemeDirection;
