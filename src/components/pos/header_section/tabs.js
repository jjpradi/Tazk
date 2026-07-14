import React from 'react';
import {Tabs, Tab, Box, Paper, Typography, AppBar} from '@mui/material';
import {PostAdd} from '@mui/icons-material';

const rootSx = {
  width: '100%',
};

let maxTabIndex = 1;
let currentTablIndex = 1;
export default function Pipeline(props) {

  // Handle Tab Button Click
  const [tabId, setTabId] = React.useState(0);
  const handleTabChange = (event, newTabId) => {
    if (newTabId === 'tabProperties') {
      handleAddTab();
    } else {
      currentTablIndex = newTabId;
      setTabId(newTabId);
    }
  };

  // Handle Add Tab Button
  const [tabs, setAddTab] = React.useState([]);
  const handleAddTab = () => {
    maxTabIndex = maxTabIndex + 1;
    setAddTab([...tabs, <Tab label={`${maxTabIndex}`} key={maxTabIndex} />]);
    handleTabsContent();
  };

  // Handle Add Tab Content
  const [tabsContent, setTabsContent] = React.useState([
    <TabPanel tabId={tabId}>Default Panel - {Math.random()}</TabPanel>,
  ]);
  const handleTabsContent = () => {
    setTabsContent([
      ...tabsContent,
      <TabPanel tabId={tabId}>New Tab Panel - {Math.random()}</TabPanel>,
    ]);
  };

  return (
    <Paper sx={rootSx}>
      <AppBar position='static' color='inherit' style={{background: 'grey'}}>
        <Tabs
          value={tabId}
          onChange={handleTabChange}
          variant='scrollable'
          scrollButtons='auto'
        >
          <Tab label='1' />
          {tabs.map((child) => child)}
          <Tab icon={<PostAdd />} value='tabProperties' />
        </Tabs>
      </AppBar>
      <Box padding={2}>{tabsContent.map((child) => child)}</Box>
    </Paper>
  );
}

function TabPanel(props) {
  const {children, tabId} = props;
  return (
    <Box
      value={maxTabIndex}
      index={maxTabIndex}
      hidden={tabId !== currentTablIndex}
      key={maxTabIndex}
    >
      {children}
    </Box>
  );
}
