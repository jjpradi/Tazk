import {AppBar, Toolbar, Typography, Grid, Box} from '@mui/material';
import DynamicTabs from './DynamicTabs';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

const headerSx = {
  backgroundColor: 'grey',
  height: '50px',
  width: '411px',
};

const logoSx = {
  fontFamily: 'Work Sans, sans-serif',
  fontWeight: 600,
  color: '#FFFEFE',
  textAlign: 'left',
};

// const mystyle={

// textAlign:"center",
// position:"relative",
// top:"200px",
//   backgroundColor:"green",
// }

// div#header {
//   background-color: #DDF;
//   height: 100px;
//   }

export default function Header() {

  const displayDesktop = () => {
    return <Toolbar>{femmecubatorLogo}</Toolbar>;
  };

  const dispatch = useDispatch();
  const {list, product_lists} = useSelector(
    (state) => state.productListReducer,
  );

  const femmecubatorLogo = (
    <Typography variant='h6' component='h1' sx={logoSx}></Typography>
  );

  return (
    <>
      <Grid
        spacing={0}
        // lg={12}
        // md={12}
        // sm={12}
        // xs={12}
        container
        direction='row'
        //
        form={false}
        style={{background: 'grey'}}
      >
        <Grid
          form={false}
          size={{
            lg: 4,
            md: 3,
            sm: 5,
            xs: 6
          }}>
          <header>
            <Box sx={headerSx}>{displayDesktop()}</Box>
          </header>
        </Grid>

        <Grid
          form={false}
          size={{
            lg: 8,
            md: 9,
            sm: 7,
            xs: 6
          }}>
          <DynamicTabs dispatch={dispatch} />
        </Grid>
      </Grid>
      {/* <header>
      <AppBar className={header}>{displayDesktop()}</AppBar>
    </header> */}
    </>
  );
}
