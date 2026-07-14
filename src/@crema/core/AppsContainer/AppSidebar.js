import React from 'react';

import Drawer from '@mui/material/Drawer';
import Card from '@mui/material/Card';
import {Box, drawerClasses, Slide} from '@mui/material';
import {useDispatch} from 'react-redux';
import PropTypes from 'prop-types';
import {onToggleAppDrawer} from '../../../redux/actions';

const AppSidebar = (props) => {
  const {isAppDrawerOpen, sidebarContent, smallScreen, windowHeight, toolbarHeight,sideBarStyle} = props;
  const dispatch = useDispatch();

  return (
    <Slide direction='right' in mountOnEnter unmountOnExit>
      <Box
        sx={{
          height: 'calc(100vh - 80px)',
          width: 240,
          //minWidth: 240,
          ...props.sideBarStyle
        }}
      >
        <Box sx={{ display: { lg: 'none' } }}>
          <Drawer
            open={isAppDrawerOpen}
            onClose={() => dispatch(onToggleAppDrawer())}
            sx={{
              position: 'absolute',
              [`& .${drawerClasses.paper}`]: {
                width: 240,
                '& .listItem': {
                  zIndex: 1305,
                },
              },
            }}
          >
            {sidebarContent}
          </Drawer>
        </Box>
        <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
          <Card style={{height: 'calc(100vh - 80px)' , ...props.sideBarStyle}}>{sidebarContent}</Card>
        </Box>
      </Box>
    </Slide>
  );
};

export default AppSidebar;

AppSidebar.propTypes = {
  isAppDrawerOpen: PropTypes.bool,
  footer: PropTypes.bool,
  navStyle: PropTypes.string,
  fullView: PropTypes.bool,
  sidebarContent: PropTypes.node,
};
