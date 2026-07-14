import React from 'react';
import {toggleNavCollapsed} from '../../../../../redux/actions';
import {useDispatch} from 'react-redux';
import SearchBar from '../../../AppSearchBar';
import AppLogo from '../../components/AppLogo';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import BitBucketHeaderWrapper from './BitBucketHeaderWrapper';

const AppHeader = () => {
  const dispatch = useDispatch();

  return (
    <Box sx={{display: {lg: 'none'}}}>
      <BitBucketHeaderWrapper className='bit-bucket-header'>
        <IconButton
          edge='start'
          className='menu-btn'
          color='inherit'
          aria-label='open drawer'
          onClick={() => dispatch(toggleNavCollapsed())}
        >
          <MenuIcon className='menu-icon' />
        </IconButton>
        <AppLogo />
        <Box
          sx={{
            ml: 'auto',
          }}
        >
          <SearchBar borderLight placeholder='Search…' />
        </Box>
      </BitBucketHeaderWrapper>
    </Box>
  );
};
export default AppHeader;
