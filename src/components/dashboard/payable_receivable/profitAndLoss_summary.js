import React from "react";
import ReactApexChart from "react-apexcharts";
import { Card, Grid, List, Typography, Divider } from "@mui/material";

const style = {
    width: '100%',
    maxWidth: 360,
    bgcolor: 'background.paper',
};

class ProfitLoss extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            series: [
                {
                    name: "Marketing",
                    data: [44, 55, 41, 67, 22, 43, 1, 51, 1, 51, 1, 11],
                },
                {
                    name: "Others",
                    data: [13, 23, 20, 8, 13, 27, 31, 41, 1, 13, 1, 11],
                },
                {
                    name: "Payroll",
                    data: [11, 17, 15, 15, 21, 14, 1, 31, 11, 1, 41, 1],
                },
                {
                    name: "Rent",
                    data: [21, 7, 25, 13, 22, 8, 1, 10, 1, 2, 1, 12],
                },
            ],
            options: {
                chart: {
                    type: "bar",
                    height: 200,
                    stacked: true,
                    toolbar: {
                        show: true,
                    },
                    zoom: {
                        enabled: false,
                    },
                },
                responsive: [
                    {
                        breakpoint: 480,
                        options: {
                            legend: {
                                position: "bottom",
                                offsetX: -10,
                                offsetY: 0,
                            },
                        },
                    },
                ],
                plotOptions: {
                    bar: {
                        horizontal: false,
                        borderRadius: 3,
                    },
                },
                xaxis: {
                    categories: [
                        " Jan ",
                        " Feb ",
                        " Mar ",
                        " Apr ",
                        " May ",
                        " Jun ",
                        " Jul ",
                        " Aug ",
                        " Sept ",
                        " Oct ",
                        " Nov ",
                        " Dec ",
                    ],
                },
                legend: {
                    position: "right",
                    offsetY: 40,
                },
                fill: {
                    opacity: 1,
                },
            },
        };
    }

    render() {
        return (
            <Card variant="outlined" style={{ width: '100%', backgroundColor: 'whitesmoke' }} align='center' >
                <Grid container spacing={2}>
                    <Grid
                        backgroundColor='whiteSmoke'
                        size={{
                            xs: 12,
                            md: 12,
                            lg: 12,
                            sm: 12
                        }}>

                        <List sx={style} component="nav" aria-label="mailbox folders">
                            <Typography variant="body1" sx={{ fontSize: 18, fontWeight: 'bold' }}>
                                Net Working Capital vs Gross working Capital
                            </Typography>
                        </List>
                        <Divider />
                    </Grid>

                    <Grid
                        size={{
                            xs: 12,
                            md: 12,
                            lg: 12,
                            sm: 12
                        }}>
                        <div id="chart">
                            <ReactApexChart
                                options={this.state.options}
                                series={this.state.series}
                                type="bar"
                                height={220}
                            />
                        </div>
                    </Grid>
                </Grid>
            </Card >
        );
    }
}

export default ProfitLoss;
