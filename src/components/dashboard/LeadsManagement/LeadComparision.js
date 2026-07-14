import React, { useState, useEffect, useContext } from 'react';
import {
  Grid,
  Card,
  Typography,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  IconButton,
} from '@mui/material';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { useDispatch, useSelector } from 'react-redux';
import { topSaleByBrandAction } from 'redux/actions/pos_sale_actions';
import ReactApexChart from 'react-apexcharts';
import _ from 'lodash';
import apiCalls from 'utils/apiCalls';
import { cellStyle, headerStyle } from 'utils/pageSize';
import useCommonRef from 'pages/common/home/useCommonRef';
import CloseIcon from '@mui/icons-material/Close';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import {clientwebsocket } from '../../../http-common'
import { getleadsPipelineAction, leadsComparisionAction } from 'redux/actions/leadManagement_actions';
import moment from 'moment';
import NoRecordFound from 'components/Layout/NoRecordFound';


const style = {
  width: '100%',
  maxWidth: 360,
  bgcolor: 'background.paper',
};

const leadsComparision = (props) => {
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
  } = useContext(CreateNewButtonContext);
  const dispatch = useDispatch();
  const [pollTimer, setPollTimer] = useState(null)
  const {
    leadManagementReducers: { getMonthLeads ,getleadsPipeline },
  } = useSelector((state) => state);

  const lastFourMonths = Array.from({ length : 4 }, (_, i) =>
    moment().subtract(i, 'months').format('MMM YYYY')
  ).reverse()

  let customerDataMap = lastFourMonths.reduce((acc, month) => {
    acc[month] = 0
    return acc
  }, {})

  props?.data?.forEach((entry) => {
    if (customerDataMap.hasOwnProperty(entry.date)) {
      customerDataMap[entry.date] = entry.lead_count
    }
  })

  const updatedSeriesData = lastFourMonths.map((month) => customerDataMap[month])

  return (
    <Card 
    variant='outlined' 
    ref={(el) => {
      props.ref1(el)
      props.isVisibleRef.current = el
    }}
    sx={{ width: '100%',height:'100%' }}>
      <Grid 
        container
        style = {{
          display : 'flex',
          justifyContent : 'space-between',
          alignItems : 'center',
          padding : '18px',
          paddingTop : props.mode === 'edit' ? '2px' : '13px'
        }}
      >
        <Grid>
          <Typography variant='h6'>
            Lead Comparision
          </Typography>
        </Grid>
        <Grid>
            {
              props.mode === 'edit' ?
                <IconButton
                  aria-label='view code'
                  onClick={() => props.setCardClose()}
                  size='large'
                >
                  {props.isEnabled ?  <props.VisibilityOffIcon /> : <props.VisibilityIcon />} 
                </IconButton>
                :
                ''
            }
        </Grid>
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <div id='chart'>
            {props?.data?.length > 0 ? (
              <ReactApexChart
                options={{
                  chart: {
                    toolbar: {
                      show: false,
                    },
                    type: 'bar',
                    height: 350,
                    stacked: true,
                  },
                  dataLabels: {
                    enabled: true,
                    enabledOnSeries: undefined,
                    formatter: function (val, opts) {
                      return val;
                    },
                    style: {
                      fontSize: "11px",
                      // fontWeight: "bold",
                      colors: ["#000000"],
                    }
                  },
                  plotOptions: {
                    bar: {
                      horizontal: false,
                    },
                  },
                  stroke: {
                    width: 1,
                    colors: ['#fere'],
                  },
                  xaxis: {
                    categories: lastFourMonths,
                   
                  },
                  yaxis: {
                    title: {
                      text: undefined,
                    },
                  },
                  tooltip: {
                    y: {
                      formatter: function (val) {
                        return ' ' + val;
                      },
                    },
                  },
                  fill: {
                    opacity: 1,
                  },
                  legend: {
                    position: 'top',
                    horizontalAlign: 'left',
                    offsetX: 40,
                  },
                }}
                series={[
                  {
                    name: 'Total Leads',
                    data: updatedSeriesData,
                  },
                ]}
                type='bar'
                height={350}
              />
            ) : (<NoRecordFound />)
              }
          </div>
        </Grid>
      </Grid>
    </Card>
  );
};

export default useCommonRef(leadsComparision);
