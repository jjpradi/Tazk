import React from "react";
import ReactApexChart from "react-apexcharts";
import Box from "@mui/material/Box";
import { Card, Grid, List, Typography, Divider } from "@mui/material";

const style = {
    width: '100%',
    maxWidth: 360,
    bgcolor: 'background.paper',
};

class NetVsGross extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            series: [
                {
                    name: "Net Working Capital",
                    data: [45, 52, 38, 24, 33, 26, 21, 20, 6, 8, 15, 10],
                },
                {
                    name: "Gross Working Capital",
                    data: [35, 41, 62, 42, 13, 18, 29, 37, 36, 51, 32, 35],
                },
                // {
                //   name: "Total Visits",
                //   data: [87, 57, 74, 99, 75, 38, 62, 47, 82, 56, 45, 47],
                // },
            ],
            options: {
                chart: {
                    height: 200,
                    type: "line",
                    zoom: {
                        enabled: false,
                    },
                },
                dataLabels: {
                    enabled: false,
                },
                stroke: {
                    width: [5, 7, 5],
                    curve: "straight",
                },
                legend: {
                    tooltipHoverFormatter: function (val, opts) {
                        return (
                            val +
                            " - " +
                            opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] +
                            ""
                        );
                    },
                },
                markers: {
                    size: 0,
                    hover: {
                        sizeOffset: 6,
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
                yaxis: {
                    title: {
                        text: 'Values'
                    }
                },
                tooltip: {
                    y: [
                        {
                            title: {
                                formatter: function (val) {
                                    return val + " (mins)";
                                },
                            },
                        },
                        {
                            title: {
                                formatter: function (val) {
                                    return val + " per session";
                                },
                            },
                        },
                        {
                            title: {
                                formatter: function (val) {
                                    return val;
                                },
                            },
                        },
                    ],
                },
                grid: {
                    borderColor: "#f1f1f1",
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
                                type="line"
                                height={220}
                            />
                        </div>
                    </Grid>

                </Grid>
            </Card >
        );
    }
}

export default NetVsGross;
