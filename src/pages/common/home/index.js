import React, {useState, useEffect, useContext} from 'react';
// import Layout from '../../components/Layout';
import LoginService from '../../../services/login_services';
// import { Redirect } from 'react-router-dom';
import {Link, useNavigate} from 'react-router-dom';
import {Button, Grid} from '@mui/material';
import {Helmet} from "react-helmet-async";

import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {
  listDashboardAction,
  getDashboardRoleDataAction,
} from 'redux/actions/dashboard_role_actions';
import PayableReceivableDashboard from '../../../components/dashboard/payable_receivable';
import InventoryMD from '../../../pages/sales/inventoryMD';
import ProfitLossDashboard from '../../../components/dashboard/ProfitAndLoss';
import ExpanseAnalysis from '../../../components/dashboard/expanseAnalysis';
import LineChart from '../../../components/dashboard/linechart/linechart';
import CashFlow from '../../../components/dashboard/CashFlow/index';
import SalesDashboard from 'components/dashboard/SalesDashboard/index';
import UnreadPanel from 'components/dashboard/unreadPanel';
import {connect, useDispatch, useSelector} from 'react-redux';
import Cookies from 'universal-cookie';
import PosUserDashboard from 'components/dashboard/PosUser';
import SalesManDashboard from 'components/dashboard/SalesManDashboard';
import VisitsReport from 'components/dashboard/visits';
import PayrollDashboard from 'pages/Payroll/payrollDashboard';
import Cash_balance from 'components/dashboard/cash_balance';
import WidgetsDetails  from 'components/widgetsDashboard/index';  
import apiCalls from 'utils/apiCalls';
import { getsessionStorage } from 'pages/common/login/cookies';
import ErrorDashboard from 'pages/common/ErrorDashboad/index';
import { titleURL } from 'http-common';



const drawerWidth = 240;

const Home = () => {
  // const cookies = new Cookies();
  let storage = getsessionStorage()
  const dispatch = useDispatch();
  const {
    DashboardRoleReducer: {getalldashboarddata, dashboardRoleData},
  } = useSelector((state) => state);
  const history = useNavigate();
  const {open, setModalTypeHandler, setLoaderStatusHandler,} = useContext(CreateNewButtonContext);

  useEffect(() => {
      apiCalls(setModalTypeHandler, setLoaderStatusHandler);
      dispatch(getDashboardRoleDataAction(storage?.role_id));
      dispatch(listDashboardAction())
  }, []);

  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | Dashboard </title>
      </Helmet>
      <Grid container spacing={10} direction='row'>
        {dashboardRoleData.some(
          (d) => d.dashboard_name === 'ExpensesAnalysis',
        ) ? (
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <ExpanseAnalysis />
            {/* done */}
          </Grid>
        ) : (
          <></>
        )}

        {dashboardRoleData.some(
          (d) => d.dashboard_name === 'ProfitLossDashboard',
        ) ? (
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <ProfitLossDashboard />
            {/* done */}
          </Grid>
        ) : (
          <></>
        )}

        {/* {dashboardRoleData.some((d) => d.dashboard_name === 'UnreadPanel') ? (
        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
          <UnreadPanel />
        </Grid>
      ) : (
        <></>
      )} */}

        {dashboardRoleData.some(
          (d) => d.dashboard_name === 'PayableReceivableDashboard',
        ) ? (
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <PayableReceivableDashboard />
            {/* done */}
          </Grid>
        ) : (
          <></>
        )}

        {dashboardRoleData.some((d) => d.dashboard_name === 'InventoryMD') ? (
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <InventoryMD />
            {/* done */}
          </Grid>
        ) : (
          <></>
        )}

        {dashboardRoleData.some((d) => d.dashboard_name === 'LineChart') ? (
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <LineChart />
            {/* done */}
          </Grid>
        ) : (
          <></>
        )}

        {dashboardRoleData.some((d) => d.dashboard_name === 'CashFlow') ? (
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <CashFlow />
            {/* done */}
          </Grid>
        ) : (
          <></>
        )}

        {dashboardRoleData.some(
          (d) => d.dashboard_name === 'SalesDashboard',
        ) ? (
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <SalesDashboard />
            {/* done */}
          </Grid>
        ) : (
          <></>
        )}

        {dashboardRoleData.some(
          (d) => d.dashboard_name === 'PosUserDashboard',
        ) ? (
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <PosUserDashboard />
            {/* done */}
          </Grid>
        ) : (
          <></>
        )}

        {dashboardRoleData.some(
          (d) => d.dashboard_name === 'SalesManDashboard',
        ) ? (
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <SalesManDashboard />
            {/* done */}
          </Grid>
        ) : (
          <></>
        )}

        {dashboardRoleData.some((d) => d.dashboard_name === 'visitsReport') ? (
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <VisitsReport />
            {/* done */}
          </Grid>
        ) : (
          <></>
        )}

        {dashboardRoleData.some(
          (d) => d.dashboard_name === 'PayrollDashboard',
        ) ? (
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <PayrollDashboard />
            {/* done */}
          </Grid>
        ) : (
          <></>
        )}

        {/* {dashboardRoleData.some(
        (d) => d.dashboard_name === 'cashBalance',
      ) ? (
        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
          <Cash_balance />
        </Grid>
      ) : (
        <></>
      )} */}

        {dashboardRoleData.some(
          (d) => d.dashboard_name === 'WidgetsDetails',
        ) ? (
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <WidgetsDetails />
            {/*  */}
          </Grid>
        ) : (
          <></>
        )}
      </Grid>
      {dashboardRoleData.some((d) => d.dashboard_name === 'ErrorDashboard') ? (
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <ErrorDashboard />
          {/* done */}
        </Grid>
      ) : (
        <></>
      )}
    </>
  );
};
export default Home;
