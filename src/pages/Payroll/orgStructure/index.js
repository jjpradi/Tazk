import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import {
  Box, Typography, Tabs, Tab, Paper,
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import PaidIcon from '@mui/icons-material/Paid';
import { titleURL } from 'http-common';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import {
  getOrgChartAction,
  getDepartmentTreeAction,
  getDepartmentStatsAction,
  getCostCentersAction,
} from 'redux/actions/orgStructure.actions';
import OrgChartView from './OrgChartView';
import DepartmentTreeView from './DepartmentTreeView';
import CostCenterView from './CostCenterView';

export default function OrgStructurePage() {
  const [activeTab, setActiveTab] = useState(0);

  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  useEffect(() => {
    const payload = {
      searchString: ''
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getOrgChartAction(payload, setModalTypeHandler, setLoaderStatusHandler)),
      dispatch(getDepartmentTreeAction(setModalTypeHandler, setLoaderStatusHandler)),
      dispatch(getDepartmentStatsAction(setModalTypeHandler, setLoaderStatusHandler)),
      dispatch(getCostCentersAction(setModalTypeHandler, setLoaderStatusHandler)),
    );
  }, []);

  return (
    <div style={{
      padding: '0 10px',
      height: '92vh',
      overflowY: 'auto',
      msOverflowStyle: 'none',
      scrollbarWidth: 'none',  
    }}
    className="hide-scrollbar"
  >
    <style>
      {`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}
    </style>
      <Helmet>
        <title>{titleURL} | Organization Structure</title>
      </Helmet>

      <Box sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
        <Typography variant='h6' sx={{ fontWeight: 600, fontSize: 18, mb: 2 }}>
          Organization Structure
        </Typography>

        <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            sx={{
              borderBottom: '1px solid',
              borderColor: 'divider',
              '& .MuiTab-root': { textTransform: 'none', fontSize: 13, fontWeight: 500, minHeight: 48 },
            }}
          >
            <Tab label='Org Chart' icon={<AccountTreeIcon fontSize='small' />} iconPosition='start' />
            <Tab label='Departments' icon={<CorporateFareIcon fontSize='small' />} iconPosition='start' />
            <Tab label='Cost Centers' icon={<PaidIcon fontSize='small' />} iconPosition='start' />
          </Tabs>

          <Box sx={{ p: 3, minHeight: 400 }}>
            {activeTab === 0 && <OrgChartView />}
            {activeTab === 1 && <DepartmentTreeView />}
            {activeTab === 2 && <CostCenterView />}
          </Box>
        </Paper>
      </Box>
    </div>
  );
}
