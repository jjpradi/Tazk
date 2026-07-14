import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Card, Typography, Tab, Tabs, CircularProgress ,IconButton, Grid} from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { topAssetsByValueAction } from 'redux/actions/asset_actions';
import useCommonRef from 'pages/common/home/useCommonRef';
// import useCommonRef from 'pages/common/home/useCommonRef';

function TopAssetsByValue(props) {
  const dispatch = useDispatch();
  const [selectedOption, setSelectedOption] = useState('total_assets');
  const { AssetReducers :{topAssets} } = useSelector((state) => state); // Assuming topAssets and loading are part of AssetReducers

  // useEffect(() => {
  //   await dispatch(topAssetsByValueAction());
  // }, [selectedOption, dispatch]);

  const chartRef = useRef(null)

  const handleOptionChange = (optionValue) => {
    setSelectedOption(optionValue);
  };


  if (!props?.data ) {
    return <CircularProgress />;
  }

  const data = props?.data?.map(item => ({
    name: item.location_name,
    value: item.TotalCost
  })) || [];


  const options = {
    chart: {
      type: 'bar',
      toolbar : {
        show : false
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val) {
        if (Number.isInteger(val)) {
          return val;
        } else {
          return  parseFloat(val).toFixed(2);
        }
      },
      offsetX: -10,
    },
    xaxis: {
      categories: data.map(item => item.name),
    },
  };


  return (
    <Card sx={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    ref={(el) => {
      props.ref1(el)
      props.isVisibleRef.current = el
    }}
    >
      <Box p={1} px={2} flex="1" ref={chartRef}>
        <Grid 
          container 
          display = {'flex'} 
          justifyContent = {'space-between'} 
          style = {{ 
            padding : '10px', 
            paddingTop : '8px' 
          }}
        >
          <Grid>
            <Typography variant='h6'>
              TOP 10 ASSETS
            </Typography>
          </Grid>

          <Grid>
            {
                props.mode === 'edit' ?
                    <IconButton
                        aria-label='view code'
                        onClick={() => props.setCardClose()}
                        size='large'
                        // sx={{ position: 'absolute', top: 8, right: 8 }}
                    >
                        {props.isEnabled ? <props.VisibilityOffIcon /> : <props.VisibilityIcon />}
                    </IconButton>
                    :
                    ''
            }
          </Grid>
        </Grid>
        <Tabs
          value={selectedOption}
          onChange={(event, newValue) => handleOptionChange(newValue)}
          aria-label="options tabs"
          variant="fullWidth"
          sx={{ mb: 2 }}
          TabIndicatorProps={{ style: { height: '2px' } }}
        >
          <Tab
            label="Total Assets"
            value= "total_assets"
            sx={{ fontSize: '11px', fontWeight: 'bold', mb: 1, paddingTop: 5, paddingBottom: 0, color: '#191919' }}
          />
        </Tabs>

        <ReactApexChart
          options={options}
          series={[{ name: 'Value', data: data.map(item => item.value) }]}
          type='bar'
          height={280}
          sx={{ fontSize: '12px', fontWeight: 'bold', mb: 1, color: '#191919' }}
        />
      </Box>
    </Card>
  );
}

export default useCommonRef(TopAssetsByValue);
