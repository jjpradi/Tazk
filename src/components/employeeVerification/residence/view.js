import {Button, Grid, CardMedia, Typography, Box} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import ZoomInBox from 'utils/zoomInBox';
import VerificationBadge from '../verificationBadge';

function View({setEdit}) {
  const {
    UserCreationReducer: {empVerificationDetail, verificationType},
  } = useSelector((s) => s);

  const [data, setData] = useState({});

  useEffect(() => {
    if (empVerificationDetail.length) {
      setData(empVerificationDetail[0]);
    }
  }, [empVerificationDetail]);

  return (
    <>
      <Grid
        container
        display='flex'
        flexDirection='row'
        alignItems='center'
        spacing={7}
        sx={{p: '10px'}}
      >
        <Grid
          size={{
            md: 6,
            xs: 12
          }}>
          Latitude - {data?.latitude}
        </Grid>

        <Grid
          size={{
            md: 6,
            xs: 12
          }}>
          Longitude - {data?.longitude}
        </Grid>

        <Grid
          size={{
            md: 6,
            xs: 12
          }}>
          Document type - {data?.document_name}
        </Grid>

        <Grid
          size={{
            md: 6,
            xs: 12
          }}>
          Remarks - {data?.remarks}
        </Grid>

        <Grid
          size={{
            md: 12,
            xs: 12
          }}>
          {data.type === 'image' ? (
            <ZoomInBox>
              <CardMedia
                component='img'
                image={data?.url}
                width='100%'
                height='100%'
              />
            </ZoomInBox>
          ) : (
            <object
              data={data?.url}
              type='application/pdf'
              width='100%'
              height='100%'
              style={{borderRadius: 10}}
            >
              PDF cannot be displayed.
            </object>
          )}
        </Grid>

        <Grid
          display='flex'
          justifyContent='flex-end'
          alignItems='flex-end'
          size={{
            md: 12,
            xs: 12
          }}>
          <VerificationBadge
            verifiedBy={data.verifiedBy}
            verification_date={data?.verification_date}
            verification_time={data?.verification_time}
          />
        </Grid>

        <Grid
          display='flex'
          justifyContent='flex-end'
          size={{
            md: 12,
            xs: 12
          }}>
          <Button onClick={() => setEdit(true)}>Edit</Button>
        </Grid>
      </Grid>
    </>
  );
}

export default View;
