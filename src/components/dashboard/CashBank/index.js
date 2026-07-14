import React, { useEffect, useState, useRef } from 'react';
import ReactApexChart from 'react-apexcharts';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { IconButton, Grid, Typography, Autocomplete, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import useCommonRef from "../../../pages/common/home/useCommonRef";

const sampleData = [
  { id: 1, name: 'Lead Desc A' },
  { id: 2, name: 'Lead Desc B' },
  { id: 3, name: 'Lead Desc C' },
  { id: 4, name: 'Lead Desc D' }
];

const chartOptions = {
  chart: {
    id: 'apexchart-example'
  },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May']
  },
  yaxis: {
    title: {
      text: 'Value'
    }
  },
  stroke: {
    curve: 'smooth'
  },
  title: {
    text: 'Sample Chart',
    align: 'left'
  }
};

const chartSeries = [
  {
    name: 'Series 1',
    data: [30, 40, 35, 50, 49]
  }
];

function CashBank(props) {
  const [options, setOptions] = useState(chartOptions);
  const [series, setSeries] = useState(chartSeries);
  const [value, setValue] = useState(null);
  const theme = useTheme();
 

  return (
    <Card
      variant='outlined'
      ref={(el) => {
        props.ref1(el);
        props.isVisibleRef.current = el;
      }}
      sx={{ width: '100%', height: '100%' }}
    >
      <Grid container display='flex' flexDirection='row' alignItems='center' p='10px'>
        <Grid
          size={{
            xs: 10,
            md: 11,
            lg: 11.5,
            sm: 11
          }}>
          <Autocomplete
            options={sampleData}
            getOptionLabel={(option) => option.name}
            value={value}
            onChange={(event, newValue) => setValue(newValue)}
            renderInput={(params) => <TextField {...params} label="Select Lead" />}
          />
        </Grid>
        <Grid
          size={{
            xs: 2,
            md: 1,
            sm: 1,
            lg: 0.5
          }}>
          {props.mode === 'edit' ? (
            <IconButton
              aria-label='view code'
              onClick={() => props.setCardClose()}
              size='large'
            >
              {props.isEnabled ? <CloseIcon /> : <CloseIcon />} 
            </IconButton>
          ) : (
            ''
          )}
        </Grid>
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <ReactApexChart
            options={options}
            series={series}
            type='line'
            height={400}
          />
        </Grid>
      </Grid>
    </Card>
  );
}

export default useCommonRef(CashBank);
