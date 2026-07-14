import React ,{useState} from 'react'
import { Box } from '@mui/material';
import AppScrollbar from '@crema/core/AppScrollbar';
import AppList from '@crema/core/AppList';
import ListEmptyResult from '@crema/core/AppList/ListEmptyResult';
import SidebarPlaceholder from '@crema/core/AppSkeleton/SidebarListSkeleton';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import ListItemText from '@mui/material/ListItemText';
import {alpha, styled} from '@mui/material/styles';
import List from '@mui/material/List';
import { Fonts } from 'shared/constants/AppEnums';
import { icon } from 'leaflet';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';

 
const AppsSideBarFolderList = styled(ListItem)(({theme}) => {
    
    return {
      padding: '7px 16px',
      borderRadius: '0 30px 30px 0',
      marginBottom: 1,
      marginTop: 1,
      [theme.breakpoints.up('md')]: {
        paddingLeft: 20,
        paddingRight: 20,
      },
      [theme.breakpoints.up('lg')]: {
        paddingLeft: 24,
        paddingRight: 24,
      },
  
      '& svg': {
        fontSize: '18px',
      },
  
      '&:hover,&:focus,&.active': {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        color: theme.palette.primary.main,
  
        '& .material-icons, & svg, & .MuiTypography-root': {
          color: theme.palette.primary.main,
        },
      },
  
      '&.active': {
        color: theme.palette.primary.main,
  
        '& .material-icons, & .MuiTypography-root': {
          color: theme.palette.primary.main,
        },
        '& .list-item-text': {
          '& .MuiTypography-body1': {
            fontWeight: Fonts.SEMI_BOLD,
          },
        },
      },
    };
  });

const TaskSideBarMenu = ({ activeMenu, onMenuClick,menus }) => {
   
    // console.log(menus.length,"gghhh")
  return (
    <>
    <Box
        sx={{
          px: {xs: 4, md: 5},
          pt: {xs: 4, md: 5},
          pb: 2.5,
        }}
      >
        </Box>
        <AppScrollbar className='scroll-app-sidebar'>
        <Box
          sx={{
            pr: 4,
            pb: {xs: 4, md: 5, lg: 6.2},
            // backgroundColor:'blue',
            minHeightheight:'1200px'
          }}
        >
          <List
            sx={{
              mb: {xs: 2, xl: 5},
            }}
            component='nav'
            aria-label='main task folders'
          >
            {
                menus.map((item)=>{
                    return   <AppsSideBarFolderList
                    button
                    key={item.id}
                      onClick={() => onMenuClick(item.id)}
                    // component={AppNavLink} 
                    className={activeMenu === item.id ? 'active' : ''}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 10,
                        mr: 3.5,
                        '& .material-icons, & svg': {
                          fontSize: 22,
                          color: (theme) => theme.palette.text.secondary,
                        },
                      }}
                    >
                    {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.name}
                      sx={{
                        my: 0,
                        '& .MuiTypography-body1': {
                          fontSize: 14,
                          mb: 0.5,
                        },
                      }}
                      className='list-item-text'
                    />
                  </AppsSideBarFolderList>
                })
            }
          </List>
          </Box>
          </AppScrollbar>
        </>
  )
}

export default TaskSideBarMenu