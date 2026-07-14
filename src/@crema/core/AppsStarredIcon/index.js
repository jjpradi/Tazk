import React from 'react';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import {Checkbox} from '@mui/material';
import PropTypes from 'prop-types';
import { Button, Tooltip, alpha } from '@mui/material';
import CommonToolTip from 'components/ToolTip';

const AppsStarredIcon = ({item, onChange, staredCreate}) => {
  return (
   <CommonToolTip title={item.stared === 1 ? 'Starred' : 'Click to star'}>
     <Checkbox
      sx={{
        color: (theme) => theme.palette.warning.main,
        '&.Mui-checked': {
          color: (theme) => theme.palette.warning.main,
        },
        '& .MuiSvgIcon-root': {
          fontSize: 20,
        },
      }}
      icon={<StarBorderIcon />}
      checkedIcon={<StarIcon />}
      checked={item.stared === 1 ? true : item.isStarred}
      onChange={(event) => onChange(event.target.checked, item)}
      disabled={!staredCreate}
    />
   </CommonToolTip>
  );
};

export default AppsStarredIcon;

AppsStarredIcon.propTypes = {
  item: PropTypes.object.isRequired,
  onChange: PropTypes.func,
};
