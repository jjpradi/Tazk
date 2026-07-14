import React, { useEffect, useState } from 'react';
import {useDispatch, useSelector} from 'react-redux';
import AppInfoView from '@crema/core/AppInfoView';
import {Box, Grid, Slide, Tooltip, Zoom} from '@mui/material';

import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';

import {onToggleAppDrawer} from '../../../redux/actions';
import AppSidebar from './AppSidebar';
import {useLayoutContext} from '../../utility/AppContextProvider/LayoutContextProvider';
import {Fonts} from '../../../shared/constants/AppEnums';
import AppContainerWrapper from './AppContainerWrapper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { maxHeight } from 'utils/pageSize';



const AppsContainer = (props) => {
  const smallscreen = useMediaQuery((theme) => theme.breakpoints.down('1440'));
  //const largescreen = useMediaQuery((theme) => theme.breakpoints.up('1024'));

  const dispatch = useDispatch();
  const isAppDrawerOpen = useSelector(({common}) => common.isAppDrawerOpen);
  const {footer} = useLayoutContext();
  const {navStyle} = useLayoutContext();
  const {title, sidebarContent, fullView, children ,sidebarStyle} = props;

  const [toolbarHeight, setToolbarHeight] = useState(document.getElementsByClassName('MuiToolbar-root')[0]?.clientHeight || 70)
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  let resizeWindow = () => {
    
    const dynamicToolbarHeight_val = document.getElementsByClassName('MuiToolbar-root')[0]?.clientHeight || 70;

    setToolbarHeight(dynamicToolbarHeight_val);
    setWindowHeight(window.innerHeight);
  };


  useEffect(() => {
    resizeWindow();
    window.addEventListener("resize", resizeWindow);
    return () => window.removeEventListener("resize", resizeWindow);
  }, []);

  return (
    // (smallscreen ?
    //   (<Box
    //   sx={{
    //     flex: 1,
    //     display: 'flex',
    //     flexDirection: 'column',
    //     overflow: 'hidden',
    //     // margin: -4,
    //     // padding: 3,
    //     ...props.sxStyle,
    //   }}
    // >
    //   <Box
    //     sx={{
    //       marginTop: fullView ? 0 : -6,
    //       display: 'flex',
    //       alignItems: 'center',
    //       mb: {
    //         xs: fullView ? 0 : 0,
    //         lg: 4,
    //       },
    //       mt: {
    //         xs: fullView ? 0 : 0,
    //         lg: 0,
    //       },
    //     }}
    //   >
    //     {fullView ? null : (
    //       <Hidden lgUp>
    //         <IconButton
    //           // edge='start'
    //           sx={{
    //             marginRight: (theme) => theme.spacing(100),
    //           }}
    //           aria-label='open drawer'
    //           onClick={() => dispatch(onToggleAppDrawer())}
    //           >
    //           <MenuIcon
    //             color='primary'
    //           />

    //         </IconButton>

    //       </Hidden>


    //     )}
    //     {/* <Zoom in style={{transitionDelay: '300ms'}}>
    //       <Box
    //         component='h2'
    //         variant='h2'
    //         sx={{
    //           fontSize: 16,
    //           color: 'text.primary',
    //           fontWeight: Fonts.SEMI_BOLD,
    //         }}
    //       >
    //         {title}
    //       </Box>
    //     </Zoom> */}
    //   </Box>

    //   <AppContainerWrapper navStyle={navStyle} footer={footer}>
    //     {sidebarContent ? (
    //       <AppSidebar
    //         isAppDrawerOpen={isAppDrawerOpen}
    //         footer={footer}
    //         fullView={fullView}
    //         navStyle={navStyle}
    //           sidebarContent={sidebarContent}
    //           smallScreen={smallscreen}
    //         toolbarHeight = {toolbarHeight}
    //         windowHeight = {windowHeight}
    //         sideBarStyle={sidebarStyle}
    //       />
    //     ) : null}

    //     <Box
    //       sx={{
    //         display: 'flex',
    //         flexDirection: 'column',
    //         width: {
    //           xs: '100%',
    //           lg: `calc(100% - ${fullView ? 0 : 300}px)`,
    //         },
    //         height: parseInt(windowHeight) - (parseInt(toolbarHeight) + 35),
    //         pl: {
    //           lg: props.fullView ? 0 : 6,
    //           paddingRight:'10px'
    //         },
    //       }}
    //     >
    //       <Slide direction='left' in mountOnEnter unmountOnExit>
    //         <Card
    //           style={{
    //             height: '100vh',
    //             display: 'flex',
    //             flexDirection: 'column',
    //             position: 'relative',
    //             ...props.cardStyle,
    //           }}
    //         >
    //           {children}
    //         </Card>
    //       </Slide>
    //       <AppInfoView />
    //     </Box>
    //   </AppContainerWrapper>
    // </Box>
    // ) : ( // large screen
    // ))
    <>
      <Box sx={{ width: '100%', height: '100%' }}>
      {fullView ? null : (
          <Box sx={{ display: { lg: 'none' } }}>
            <IconButton
              // edge='start'
              sx={{
                marginRight: (theme) => theme.spacing(1),
              }}
              aria-label='open drawer'
              onClick={() => dispatch(onToggleAppDrawer())}
              size='large'
              >
              <MenuIcon
                color='primary'
                // sx={{
                //   width: 35,
                //   height: 0,
                // }}
              />
            </IconButton>
          </Box>
        )}
        {/* <Zoom in style={{transitionDelay: '300ms'}}>
          <Box
            component='h2'
            variant='h2'
            sx={{
              fontSize: 16,
              color: 'text.primary',
              fontWeight: Fonts.SEMI_BOLD,
            }}
          >
            {title}
          </Box>
        </Zoom> */}

      <AppContainerWrapper navStyle={navStyle} footer={footer}>
        {sidebarContent ? (
          <AppSidebar
            isAppDrawerOpen={isAppDrawerOpen}
            footer={footer}
            fullView={fullView}
            navStyle={navStyle}
            sidebarContent={sidebarContent}
            sideBarStyle={sidebarStyle}

          />
        ) : null}

        <Box
          sx={{
            width: {
              xs: '100%',
              lg: `100%`,
              },
            height: 'calc(100vh - 80px)',
            pl: {
              lg: props.fullView ? 0 : 3
            },
          }}
          
        >
          <Slide direction='left' in mountOnEnter unmountOnExit>
            <Card
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                ...props.cardStyle,
                overflowY: 'auto',
              }}
            >
              {children}
            </Card>
          </Slide>
          <AppInfoView />
        </Box>
      </AppContainerWrapper>
        </Box>
    </>
  );
};

export default AppsContainer;

AppsContainer.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  sidebarContent: PropTypes.node,
  fullView: PropTypes.bool,
  children: PropTypes.node,
  sxStyle: PropTypes.object,
  cardStyle: PropTypes.object,
};
