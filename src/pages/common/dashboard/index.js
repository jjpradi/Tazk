import React, {useContext} from 'react';
// import Layout from '../../components/Layout';
// import LoginService from '../../services/login_services';
// import { Redirect } from 'react-router';
// import { useHistory } from "react-router-dom";
import {Grid} from '@mui/material';
import {Helmet} from "react-helmet-async";

import CreateNewButtonContext from '../../context/CreateNewButtonContext';

// const drawerWidth = 240;

const Dashboard = () => {
  //  const history = useHistory();
  const {open} = useContext(CreateNewButtonContext);

  return (
    <>
      <Helmet>
                 <meta charSet="utf-8" />
                 <title>My Title</title>
       </Helmet>
      <Grid container direction='row'>
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <div>
            <h1>Dashboard</h1>
            {/* <Dashboard style = {{width : "100%"}} open = {open}/> */}
          </div>
        </Grid>
      </Grid>
    </>
  );
};
export default Dashboard;
