import { Grid, Button, Box } from '@mui/material'
import SalesManDashboard from 'components/dashboard/SalesManDashboard'
import OutstandingReportDashboard from 'components/dashboard/SalesManDashboard/outstandingReport.js'
import VisitsReport from 'components/dashboard/visits'
import WidgetsDetails from 'components/widgetsDashboard/WidgetsDetails'
import React from 'react'

export default function SalesmanOrder({
    rowIndex,
    handleEdit,
    handleDelete,
    sales_items,
    handleClose,
    rowPopupClose,
    salesmanId
}) {

    console.log(salesmanId, rowIndex,"salesmanId")
    return (
        <>
            <Grid  container sx={{ height: 'calc(100vh - 90px)', minHeight: 0,padding:'10px' }}>
                <Box   
                    sx={{
                    flex: 1,
                    overflowY: 'auto',
                    height: '100%'
                    }}
                    >

                    <div style={{ display: 'flex', marginBottom: 10 }}>
                        <div
                            style={{
                                marginLeft: 'auto',
                                display: 'flex',
                                justifyContent: 'end',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Grid container spacing={2}>
                                    <Grid>
                                        <Button
                                            variant='contained'
                                            onClick={rowPopupClose}
                                            color='inherit'
                                            sx={{ mb: '10px' }}
                                        >
                                            Back
                                        </Button>
                                    </Grid>
                                </Grid>
                            </div>
                        </div>
                    </div>

                    <Grid
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                        <OutstandingReportDashboard salesmanId={salesmanId}/>
                    </Grid>

                    <Grid
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                        <SalesManDashboard rowIndex={rowIndex}/>
                    </Grid>

                    <Grid
                        sx={{ mt: 2 }}
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                        <VisitsReport type = 'salesmanVisits' rowIndex={rowIndex}/>
                    </Grid>

                </Box>
            </Grid>
        </>
    );
}
