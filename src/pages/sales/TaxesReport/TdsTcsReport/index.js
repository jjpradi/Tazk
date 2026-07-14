import { Box, Tab, Tabs, Typography } from "@mui/material";
import { useState, lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { titleURL } from 'http-common';
import { useNavigate } from "react-router-dom";

const TDSPayable = lazy(() => import('../../PayableReport'));
const TCSReceivable = lazy(() => import('../TCSReceivable'));

function TdsTcsReport() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  return (
    <>
      <Helmet><meta charSet="utf-8" /><title>{titleURL} | TDS / TCS</title></Helmet>
      <Box>
        <Box sx={{ px: 2, pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='h6'>
            <Box style={{ display: 'flex' }}>
              <Box sx={{ color: '#0A8FDC', cursor: 'pointer', fontSize: '12px', fontWeight: 400, '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate('/report')}>Home</Box>
              &nbsp;/&nbsp;TDS / TCS
            </Box>
          </Typography>
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs value={tab} onChange={(e, v) => setTab(v)}>
            <Tab label="TDS Payable" />
            <Tab label="TCS Receivable" />
          </Tabs>
        </Box>
        <Suspense fallback={<Box sx={{ p: 4, textAlign: 'center' }}>Loading...</Box>}>
          <Box sx={{ display: tab === 0 ? 'block' : 'none' }}>
            <TDSPayable />
          </Box>
          <Box sx={{ display: tab === 1 ? 'block' : 'none' }}>
            <TCSReceivable />
          </Box>
        </Suspense>
      </Box>
    </>
  );
}

export default TdsTcsReport;
