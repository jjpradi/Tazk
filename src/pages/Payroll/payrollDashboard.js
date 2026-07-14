import {Grid} from '@mui/material';
import CheckedIn from 'components/Payroll/checkedIn';
import CompleteList from 'components/Payroll/completeList';
import LateLogin from 'components/Payroll/lateLogin';
import NotCheckedIn from 'components/Payroll/notCheckedIn';
import PayrollCards from 'components/Payroll/payrollCards';
import React from 'react';
import {useInView} from 'react-intersection-observer';
import {Helmet} from "react-helmet-async";
import LeavesStatus from 'components/Payroll/leavesStatus';
import AverageWorkHours from 'components/Payroll/averageWorkHours';
import LocationWiseAttendance from 'components/Payroll/locationWiseAttendance'
import { titleURL } from 'http-common';

export default function PayrollDashboard() {

  const {ref, inView, entry} = useInView({
    threshold: 0,
    triggerOnce: true,
  });

  return (
    <>
      <Helmet>
                 <meta charSet="utf-8" />
                 <title> {titleURL} | PayrollDashboard </title>
       </Helmet>
      <Grid container spacing={3} ref={ref}>
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <PayrollCards inView={inView}/>
        </Grid>
        <Grid
          size={{
            lg: 6,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <CheckedIn inView={inView}/>
        </Grid>
        {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 6 }}>
          <NotCheckedIn inView={inView}/>
        </Grid> */}
        <Grid
          size={{
            lg: 6,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <LateLogin inView={inView}/>
        </Grid>
        <Grid
          size={{
            lg: 4,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <LocationWiseAttendance inView={inView}/>
        </Grid>
        <Grid
          size={{
            lg: 6,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <LeavesStatus inView={inView}/>
        </Grid>
        <Grid
          size={{
            lg: 6,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <AverageWorkHours inView={inView}/>
        </Grid>
        <Grid
          size={{
            lg: 6,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <CompleteList inView={inView}/>
        </Grid>
      </Grid>
    </>
  );
}
