import React, { useState } from 'react';

import Drawer from '@mui/material/Drawer';
import { Box, drawerClasses, Grid, List, ListItemIcon, ListItemText, MenuItem, Slide, Typography } from '@mui/material';
import AppsContainer from '@crema/core/AppsContainer';
import { maxBodyHeight, maxHeight, pageSize, headerStyle, cellStyle, font14_500 } from 'utils/pageSize';
import LeadTasksTable from './LeadTasksTable';
import LeadAccountsTable from './LeadAccountsTable';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import TimelineIcon from '@mui/icons-material/Timeline';
import DescriptionIcon from '@mui/icons-material/Description';
import ListContacts from './ListContacts';
import AccountsTimeline from './AccountsTimeline';



const LeadAccounts = () => {
  const [listId, setListId] = useState(1); 

  const list = [
    { id: 1, name: 'Accounts' },
    { id: 2, name: 'Contacts' },
    { id: 3, name: 'Timeline' },
  ];

  const getMainComponent = () => {
    if (listId === 1) { 
      return <LeadAccountsTable />;
    }
    if(listId === 2){
      return <ListContacts/>
    }
    if(listId === 3){
      return <AccountsTimeline />
    }
   
    return null;
  };

  const getIconByName = (name) => {
    switch (name) {
      case 'Accounts':
        return <DescriptionIcon/>;
      case 'Contacts':
        return <AccountCircleIcon/>;
      case 'Timeline':
        return <TimelineIcon/>;
      default:
        return null;
    }
  };

  const handleClick = (id) => {
    setListId(id); 
  };

  return (
    <div>
      <AppsContainer
        sxStyle={{ height: "100%" }}
        cardStyle={{ height: 900 }}
        sidebarStyle={{ height: 900 }}
        sidebarContent={
          <Grid style={{ marginTop: '40px', maxHeight: '60vh', overflow: 'auto' }}>
            <List>
              {list.map((l) => (
                <MenuItem 
                  key={l.id} 
                  onClick={() => handleClick(l.id)} 
                  style={{ height: '40px', backgroundColor: listId === l.id ? '#E6F4FB' : '' }} 
                  value={l.name}
                >
                  <ListItemIcon color={listId === l.id ? 'red' : '#000000'}>
                    {getIconByName(l.name)}
                  </ListItemIcon>
                  <ListItemText 
                    sx={{ color: listId === l.id ? '#0A8FDC' : '' }} 
                    primary={
                      <Typography sx={{ fontWeight: listId === l.id ? '700' : '500', fontSize: font14_500.fontSize }}>
                        {l.name}
                      </Typography>
                    } 
                  />
                </MenuItem>
              ))}
            </List>
          </Grid>
        }
        children={getMainComponent()}
      />
    </div>
  );
}

export default LeadAccounts;
