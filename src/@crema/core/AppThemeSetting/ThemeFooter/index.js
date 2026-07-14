import React from 'react';
import {CustomizerItemWrapper} from '../index.style';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import {FooterType} from '../../../../shared/constants/AppEnums';
import {
  useLayoutActionsContext,
  useLayoutContext,
} from '../../../utility/AppContextProvider/LayoutContextProvider';
import Switch from '@mui/material/Switch';
import CommonToolTip from 'components/ToolTip';

const ThemeFooter = ({onChange}) => {
  const {footer} = useLayoutContext();
  const {setFooter} = useLayoutActionsContext();
  const {footerType} = useLayoutContext();
  const {setFooterType} = useLayoutActionsContext();

  const handleToggleFooter = () => {
    const newValue = !footer;
    setFooter(newValue);
    if (onChange) {
      onChange('theme_footer', newValue ? 1 : 0);
    }
  };

  const handleFooterTypeChange = (e) => {
    const selectedValue = e.target.value;
    setFooterType(selectedValue);
    if (onChange) {
      onChange('theme_footer', selectedValue === FooterType.FIXED ? 'fixed' : 'fluid');
    }
  };

  return (
    <CustomizerItemWrapper>
      <Box sx={{display: 'flex', alignItems: 'center', mb: 4}}>
        <Box component='h3'>Footer</Box>
        <Box component='span' sx={{ml: 'auto'}}>
        <CommonToolTip title={footer ? 'Turn off' : 'Turn on'}>
            <Switch
              checked={footer}
              onChange={handleToggleFooter}
              value='checkedA'
              inputProps={{ 'aria-label': 'secondary checkbox' }}
            />
        </CommonToolTip>
        </Box>
      </Box>
      <FormControl
        variant='outlined'
        sx={{
          width: '100%',
        }}
      >
        <InputLabel id='select-footer'>Footer Type</InputLabel>
        <Select
          sx={{
            '& .MuiOutlinedInput-input': {
              padding: '12px 32px 12px 14px',
            },
          }}
          labelId='select-footer'
          label='Footer Type'
          value={footerType}
          onChange={handleFooterTypeChange}
        >
          <MenuItem value={FooterType.FIXED}>Fixed</MenuItem>
          <MenuItem value={FooterType.FLUID}>Fluid</MenuItem>
        </Select>
      </FormControl>
    </CustomizerItemWrapper>
  );
};

export default ThemeFooter;
