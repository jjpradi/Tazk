import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, Grid, Typography } from "@mui/material";
import { listCommissions, listLeads, listPayouts } from "../api/partnerApi";
import PartnerShell from "../layouts/PartnerShell";

export default function PartnerDashboard() {
  const [leads, setLeads] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [payouts, setPayouts] = useState([]);

  useEffect(() => { (async () => {
    (async () => {
      try {
        const [l, c, p] = await Promise.all([
          listLeads({ limit: 10, offset: 0 }),
          listCommissions({ limit: 50, offset: 0 }),
          listPayouts()
        ]);
        setLeads(l?.items || l || []);
        setCommissions(c?.items || c || []);
        setPayouts(p?.items || p || []);
      } catch {
        // ignore; page is a skeleton
      }
    })();
  })();
}, []);

  const stats = useMemo(() => {
    const leadCount = Array.isArray(leads) ? leads.length : 0;
    const commissionCount = Array.isArray(commissions) ? commissions.length : 0;
    const payoutCount = Array.isArray(payouts) ? payouts.length : 0;
    return { leadCount, commissionCount, payoutCount };
  }, [leads, commissions, payouts]);

  return (
    <PartnerShell title="Dashboard">
      <Grid container spacing={2}>
        <Grid
          size={{
            xs: 12,
            md: 4
          }}>
          <Card>
            <CardContent>
              <Typography variant="overline">Leads</Typography>
              <Typography variant="h4">{stats.leadCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 4
          }}>
          <Card>
            <CardContent>
              <Typography variant="overline">Commission events</Typography>
              <Typography variant="h4">{stats.commissionCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 4
          }}>
          <Card>
            <CardContent>
              <Typography variant="overline">Payout batches</Typography>
              <Typography variant="h4">{stats.payoutCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
        This is a starter dashboard. Replace with your corporate UI later.
      </Typography>
    </PartnerShell>
  );
}
