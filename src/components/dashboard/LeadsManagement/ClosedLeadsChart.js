import React, { useEffect, useState } from "react";
import useCommonRef from "pages/common/home/useCommonRef";
import { Box, Card, Grid, IconButton, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { convertedLeadsValueAction } from "redux/actions/leadManagement_actions";
import ReactSpeedometer from "react-d3-speedometer";
import { useTheme } from "@mui/material/styles";

function ClosedLeadsChart (props) {

    const dispatch = useDispatch()
    const theme = useTheme()
    const [convertedLeadsPercentage, setConvertedLeadsPercentage] = useState(0)

    const {
        leadManagementReducers : { convertedLeadsValueCard }
    } = useSelector((state) => state)

    useEffect(() => {
        // if(convertedLeadsValueCard && Object.keys(convertedLeadsValueCard).length > 0) {
        //     let percentage = parseFloat(convertedLeadsValueCard[0].totalValue) || 0
        //     percentage = Math.min(percentage, 25000)
        //     setConvertedLeadsPercentage(percentage)
        // }
        
        if(props.data.length > 0){
            let percentage = parseFloat(props.data[0]?.convertedLeadsValue) || 0
            percentage = Math.min(percentage, 25000)
            setConvertedLeadsPercentage(percentage)
        }
        else{
            setConvertedLeadsPercentage(0)
        }
    }, [convertedLeadsValueCard, props.data])

    const customSegmentStops = [0, 5000, 10000, 15000, 20000, 25000]

    return (
        <div
            ref = {(el) => {
                props.ref1(el)
                props.isVisibleRef.current = el
            }}
            style={{ height : '100%'}}
        >
            <Card 
                sx = {{
                    height : '100%', 
                    width : '100%',
                    overflow : 'hidden'
                }}
            >
                {
                    props.mode === 'edit' ?
                    <IconButton
                        aria-label = 'view code'
                        onClick = {() => props.setCardClose()}
                        size = 'large'
                        sx = {{
                            position : 'absolute',
                            top : 8,
                            right : 8
                        }}
                    >
                        {props.isEnabled ? <props.VisibilityOffIcon /> : <props.VisibilityIcon />}
                    </IconButton>
                    : ''
                }

                <Grid 
                    sx={{
                        display : 'flex',
                        flexDirection : 'column',
                        alignItems : 'center'
                    }}
                >
                    <Grid style = {{ padding : '10px' }}>
                        <Typography
                            className = 'dashboard-card-title'
                            variant = 'h6'
                            align = 'left'
                            style = {{ paddingTop : '10px', paddingBottom : '10px' }}
                        >
                            Closed Converted Leads
                        </Typography>
                    </Grid>

                    <div
                        id = 'chart'
                        sx = {{
                            display : 'flex',
                            justifyContent : 'center',
                            alignItems : 'center'
                        }}
                    >
                        <ReactSpeedometer 
                            valueTextFontSize = '11px'
                            labelFontSize = '11px'
                            valueTextFontWeight = '400'
                            value = {convertedLeadsPercentage}
                            minValue = {0}
                            width = {250}
                            height = {250}
                            maxValue = {25000}
                            segments={6}
                            maxSegmentLabels={5}
                            ringWidth={45}
                            needleHeightRatio={0.8}
                            // customSegmentStops = {customSegmentStops}
                            needleColor = {theme.palette.primary.main}
                            startColor = '#fe434c'
                            endColor = '#8aba00'
                            textColor = 'black'
                            currentValueText = {`${convertedLeadsValueCard[0]?.totalValue || 0}`}
                        />
                    </div>
                </Grid>
            </Card>
        </div>
    )
}

export default useCommonRef(ClosedLeadsChart)