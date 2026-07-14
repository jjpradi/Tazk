import React from "react";
import ReactSpeedometer from "react-d3-speedometer";
import {Box, Typography} from '@mui/material';
import Card from '@mui/material/Card';
import { CardContent } from "@mui/material";

const styles = {
  dial: {
    display: "inline-block",
    width: `300px`,
    height: `auto`,
    color: "#000",
    border: "0.5px solid #fff",
    padding: "2px"
  },
  title: {
    fontSize: "1em",
    color: "#000"
  }
};

const bull = (
  <Box
    component="span"
    sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.8)' }}
  >
    •
  </Box>
);

const DaysSalesInventory = ({ id, value, title }) => {
  return (
    <>
      <Card sx={{ minWidth: 275, height: '240px', backgroundColor: 'whitesmoke' }} align='center'>
      <CardContent>
      <Typography sx={{ fontSize: 18, fontWeight: 'bold'}} > Days Sales Inventory </Typography>
          <hr/>
        <div style={styles.dial}>
          <ReactSpeedometer
            maxValue={100}
            minValue={0}
            height={170}
            width={290}
            value={value}
            needleTransition="easeQuadIn"
            needleTransitionDuration={1000}
            needleColor="red"
            startColor="green"
            segments={10}
            endColor="blue"
          />
          <div style={styles.title}>{title}</div>
        </div>
        </CardContent>
      </Card>


    </>
  );
};

export default DaysSalesInventory;
