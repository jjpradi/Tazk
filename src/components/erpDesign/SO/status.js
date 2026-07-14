import React, { useEffect } from 'react';
import {Grid, useTheme} from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { useDispatch, useSelector } from 'react-redux';
import { getSalesStatusListAction } from '../../../redux/actions/sales_actions';


function Status({saleStatus, soStatus}) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const {
    salesReducer: {Sale_Status},
  } = useSelector((state) => state);

  useEffect(() => {
    !Sale_Status.length && dispatch(getSalesStatusListAction())
  }, [])

  const saleStatusUpdateOnTable = (value) => {
    let getOption = Sale_Status.filter((f) => f.status_id === value);
    return getOption.length > 0 ? getOption[0].status : value;
  };

  const displayStatus = soStatus === 'Rejected' || soStatus === 'Waiting Approval' ? soStatus : saleStatus;

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
          <Box>
            <Card
              variant='outlined'
              sx={{
                padding: '10px',
                width: '100%',
                borderRadius: '6px',
                bgcolor: `${theme.palette.info.main}10`,
                borderColor: `${theme.palette.info.main}40`,
              }}
            >
              <Typography sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary' }} align='center'>
                Status
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: theme.palette.info.main }} align='center'>
                {displayStatus}
              </Typography>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

export default Status;
