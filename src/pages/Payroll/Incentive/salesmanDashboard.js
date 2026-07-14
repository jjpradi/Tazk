import React, { Component } from 'react';
import OutstandingCard from 'components/dashboard/SalesManDashboard/outstandingReport.js/OutstandingCard';
import { Grid } from '@mui/material';
import TopOutstandingTable from 'components/dashboard/SalesManDashboard/outstandingReport.js/table';
import { headerStyle } from 'utils/pageSize';
import SalesDetails from 'components/dashboard/SalesManDashboard/SalesDetails';
import ChequeBounces from 'components/dashboard/SalesManDashboard/chequeBounces';
import VisitsReport from '../../../../src/components/dashboard/visits/index'
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import { getsessionStorage } from 'pages/common/login/cookies';
import { useInView } from 'react-intersection-observer';

const SalesManMainDashboard = (props) => {
    const storage = getsessionStorage();
    // const {inView } = useInView({
    //   threshold: 0,
    //   triggerOnce: true,
    // });
    console.log("fdgdfgvedrg");

    return (
        <div>
            <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | Salesman Dashboard </title>
            </Helmet>
            <Grid container spacing={3}>
                <Grid
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <h2
                        style={{
                            textAlign: 'left',
                            fontWeight: headerStyle.fontWeight,
                            fontSize: headerStyle.fontSize,
                            textTransform: 'uppercase',
                            paddingLeft: '10px',
                            color: 'black'
                        }}
                    >
                        Outstanding Report Dashboard
                    </h2>
                </Grid>
                <Grid
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <OutstandingCard />
                </Grid>
                <Grid
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <TopOutstandingTable />
                </Grid>
                <Grid
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <h2
                        style={{
                            textAlign: 'left',
                            fontWeight: headerStyle.fontWeight,
                            fontSize: headerStyle.fontSize,
                            textTransform: 'uppercase',
                            paddingLeft: '7px',
                            color: 'black'
                        }}
                    >
                        Sales Man Dashboard
                    </h2>
                </Grid>
                <Grid
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <SalesDetails inView={true} type='dashboard' />
                </Grid>

                {storage?.role_name !== "Salesman" && <Grid
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <ChequeBounces />
                </Grid>}

                <Grid
                    sx={{ mt: 2 }}
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <VisitsReport type={'salesmanVisits'} />
                </Grid>
            </Grid>
        </div>
    );

}

export default SalesManMainDashboard;
