import React, { useState } from 'react';
import { Box, Card, Tab, Tabs, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';

import GenerateTab from './tabs/GenerateTab';
import BulkGenerateTab from './tabs/BulkGenerateTab';
import RegistryTab from './tabs/RegistryTab';
import TemplatesTab from './tabs/TemplatesTab';
import SettingsTab from './tabs/SettingsTab';

const TABS = [
  { key: 'generate',  label: 'Generate',         Component: GenerateTab },
  { key: 'bulk',      label: 'Bulk Generate',    Component: BulkGenerateTab },
  { key: 'registry',  label: 'Code Registry',    Component: RegistryTab },
  { key: 'templates', label: 'Print Templates',  Component: TemplatesTab },
  { key: 'settings',  label: 'Settings',         Component: SettingsTab },
];

export default function CodeGeneratorPage() {
  const [activeTab, setActiveTab] = useState(0);
  const ActiveComponent = TABS[activeTab].Component;

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{titleURL} | Codes</title>
      </Helmet>
      <Box sx={{ p: 1 }}>
        <Card sx={{ borderRadius: '2px', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ px: 2, pt: 1.5 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Barcode &amp; QR Code Generator</Typography>
            <Tabs
              value={activeTab}
              onChange={(_e, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: '1px solid #e0e0e0',
                minHeight: 40,
                '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontSize: '0.875rem' },
              }}
            >
              {TABS.map((t) => (
                <Tab key={t.key} label={t.label} />
              ))}
            </Tabs>
          </Box>
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <ActiveComponent />
          </Box>
        </Card>
      </Box>
    </>
  );
}
