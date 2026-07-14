import React, {useEffect, useContext, useRef, useState} from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {useDispatch, useSelector} from 'react-redux';
import {
  paymentview,
  createPurchasesAction,
  updatePurchasesAction,
  receivingsPayments,
  consolidatedPayables,
  getbyidPurchasesAction,
  set_searchPurchasePayablesAction,
  searchPurchasePayablesAction
} from '../../../redux/actions/purchase_actions';
import {getSupplierDetailsByIdAction, listVendorAction} from '../../../redux/actions/vendor_actions';
import context from '../../../context/CreateNewButtonContext';
import {getAppConfigDataAction} from '../../../redux/actions/app_config_actions';
import {Grid,  CardContent, Card, Stack, TablePagination, Tooltip, Dialog} from '@mui/material';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {getByIdMailConfigurationAction} from '../../../redux/actions/configuration_actions';
import {listUserCreationAction} from '../../../redux/actions/userCreation_actions';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import totalIcon from '../../../assets/dashboardIcons/rupee.svg';
import deadlineIcon from '../../../assets/dashboardIcons/deadline.svg';
import duedateIcon from '../../../assets/dashboardIcons/due-date.svg';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { titleURL } from 'http-common';
import { getOpeningBalActions } from '../../../redux/actions/ledger_actions';
import { jobCardCountAction } from 'redux/actions/retail_service_action';
import StatusPriority from './statusPriority';
import DashboardTile from 'components/DashboardTile';

export default function ServiceDashboard() {
  const dispatch = useDispatch();

  const { purchasesReducer: {purchase_outstanding, purchase_outstanding_count, purchases, consolidated_data ,setPurchase},retailServiceReducer: {statusCount}} = useSelector((state) => state);
console.log(statusCount,'statusCount')

  const [PayData, setPayData] = React.useState({
    paymentOpen: false,
    itemsData: [],
    Tdata: [],
    getVendor: {},
    paid_amount: 0,
  });
  let date = new Date();
  let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  useEffect(() => {
    dispatch(jobCardCountAction())
  },[])

  return (
    <>
      <Helmet>
                  <meta charSet="utf-8" />
                  <title> Services </title>
        </Helmet>
      <Grid container display='flex' flexDirection='row' alignItems='center' spacing={3} >
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Typography variant='h6'>Service Dashboard</Typography>
        </Grid>

        <Grid
          size={{
            lg: 4,
            md: 4,
            sm: 4,
            xs: 12
          }}>
          {/* <Card isDashboardCard={false} sx={{ borderRadius: '5px' }}>
            <Box display='flex' height='100%' p='20px' alignItems='center' >
              <img src={totalIcon} height={60} width={40} />
              <Box width='100%' pl='16px'>
                <Box display='flex' >
                  <Stack display='flex' direction='row' alignItems='center' sx={{ pl: '7px' }}>
                    <Typography variant='h6' component='h2'>
                      {statusCount[0]?.total_count}
                    </Typography>
                  </Stack>
                </Box>
                <Box display='flex' mt='4px' alignItems='center'>
                  <Typography
                    variant='h9'
                    color='textSecondary'
                    gutterBottom
                  >
                    <span style={{ paddingLeft: '10px' }} >Total Jobcard</span>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card> */}
          <DashboardTile
                // {...props}
                title='Total Jobcard'
                icon={totalIcon}
                value={statusCount[0]?.total_count}
                currencyIcon={false}
                // secondaryText={spendingname === 0 ? "0" : spendingname}
            />
        </Grid>

        <Grid
          size={{
            lg: 4,
            md: 4,
            sm: 4,
            xs: 12
          }}>
          {/* <Card isDashboardCard={false} sx={{ borderRadius: '5px' }}>
            <Box display='flex' height='100%' p='20px' alignItems='center' >
              <img src={totalIcon} height={60} width={40} />
              <Box width='100%' pl='16px'>
                <Box display='flex' >
                  <Stack display='flex' direction='row' alignItems='center' sx={{ pl: '7px' }}>
                    <Typography variant='h6' component='h2'>
                      {statusCount[0]?.open_count}
                    </Typography>
                  </Stack>
                </Box>
                <Box display='flex' mt='4px' alignItems='center'>
                  <Typography
                    variant='h9'
                    color='textSecondary'
                    gutterBottom
                  >
                    <span style={{ paddingLeft: '10px' }} >Open</span>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card> */}
          <DashboardTile
                // {...props}
                title='Open'
                icon={totalIcon}
                value={statusCount[0]?.open_count}
                currencyIcon={false}
                // secondaryText={spendingname === 0 ? "0" : spendingname}
            />
        </Grid>

        <Grid
          size={{
            lg: 4,
            md: 4,
            sm: 4,
            xs: 12
          }}>
          {/* <Card isDashboardCard={false} sx={{ borderRadius: '5px' }}>
            <Box display='flex' height='100%' p='20px' alignItems='center' >
              <img src={totalIcon} height={60} width={40} />
              <Box width='100%' pl='16px'>
                <Box display='flex' >
                  <Stack display='flex' direction='row' alignItems='center' sx={{ pl: '7px' }}>
                    <Typography variant='h6' component='h2'>
                      {statusCount[0]?.assigned_count}
                    </Typography>
                  </Stack>
                </Box>
                <Box display='flex' mt='4px' alignItems='center'>
                  <Typography
                    variant='h9'
                    color='textSecondary'
                    gutterBottom
                  >
                    <span style={{ paddingLeft: '10px' }} >Assigned</span>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card> */}
          <DashboardTile
                // {...props}
                title='Assigned'
                icon={totalIcon}
                value={statusCount[0]?.assigned_count}
                currencyIcon={false}
                // secondaryText={spendingname === 0 ? "0" : spendingname}
            />
        </Grid>

        <Grid
          size={{
            lg: 4,
            md: 4,
            sm: 4,
            xs: 12
          }}>
          {/* <Card isDashboardCard={false} sx={{ borderRadius: '5px' }}>
            <Box display='flex' height='100%' p='20px' alignItems='center' >
              <img src={deadlineIcon} height={60} width={40} />
              <Box width='100%' pl='16px'>
                <Box display='flex' >
                  <Typography variant='h6' component='h2'>
                    {statusCount[0]?.work_in_progress_count}
                  </Typography>
                </Box>
                <Box display='flex' mt='4px' alignItems='center'>
                  <Typography
                    variant='h9'
                    color='textSecondary'
                    gutterBottom
                  >
                    <span >Work In Progress</span>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card> */}
          <DashboardTile
                // {...props}
                title='Work In Progress'
                icon={deadlineIcon}
                value={statusCount[0]?.work_in_progress_count}
                currencyIcon={false}
                // secondaryText={spendingname === 0 ? "0" : spendingname}
            />
        </Grid>

        <Grid
          size={{
            lg: 4,
            md: 4,
            sm: 4,
            xs: 12
          }}>
          {/* <Card isDashboardCard={false} >
            <Box display='flex' height='100%' p='20px' alignItems='center' >
              <img src={duedateIcon} height={60} width={40} />
              <Box width='100%' pl='16px'>
                <Box display='flex' >
                  <Typography variant='h6' component='h2'>
                    {statusCount[0]?.waiting_for_parts_count}
                  </Typography>
                </Box>
                <Box display='flex' mt='4px' alignItems='center'>
                  <Typography
                    variant='h9'
                    color='textSecondary'
                    gutterBottom
                  >
                    <span >Waiting For Parts</span>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card> */}
          <DashboardTile
                // {...props}
                title='Waiting For Parts'
                icon={duedateIcon}
                value={statusCount[0]?.waiting_for_parts_count}
                currencyIcon={false}
                // secondaryText={spendingname === 0 ? "0" : spendingname}
            />
        </Grid>

        <Grid
          size={{
            lg: 4,
            md: 4,
            sm: 4,
            xs: 12
          }}>
          {/* <Card isDashboardCard={false} >
            <Box display='flex' height='100%' p='20px' alignItems='center' >
              <img src={duedateIcon} height={60} width={40} />
              <Box width='100%' pl='16px'>
                <Box display='flex' >
                  <Typography variant='h6' component='h2'>
                    {statusCount[0]?.repair_done_count}
                  </Typography>
                </Box>
                <Box display='flex' mt='4px' alignItems='center'>
                  <Typography
                    variant='h9'
                    color='textSecondary'
                    gutterBottom
                  >
                    <span >Repair Done</span>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card> */}
          <DashboardTile
                // {...props}
                title='Repair Done'
                icon={duedateIcon}
                value={statusCount[0]?.repair_done_count}
                currencyIcon={false}
                // secondaryText={spendingname === 0 ? "0" : spendingname}
            />
        </Grid>

        <Grid
          size={{
            lg: 4,
            md: 4,
            sm: 4,
            xs: 12
          }}>
          {/* <Card isDashboardCard={false} >
            <Box display='flex' height='100%' p='20px' alignItems='center' >
              <img src={duedateIcon} height={60} width={40} />
              <Box width='100%' pl='16px'>
                <Box display='flex' >
                  <Typography variant='h6' component='h2'>
                    {statusCount[0]?.delivered_count}
                  </Typography>
                </Box>
                <Box display='flex' mt='4px' alignItems='center'>
                  <Typography
                    variant='h9'
                    color='textSecondary'
                    gutterBottom
                  >
                    <span >Delivered</span>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card> */}
          <DashboardTile
                // {...props}
                title='Delivered'
                icon={duedateIcon}
                value={statusCount[0]?.delivered_count}
                currencyIcon={false}
                // secondaryText={spendingname === 0 ? "0" : spendingname}
            />
        </Grid>

        <Grid
          size={{
            lg: 4,
            md: 4,
            sm: 4,
            xs: 12
          }}>
          {/* <Card isDashboardCard={false} >
            <Box display='flex' height='100%' p='20px' alignItems='center' >
              <img src={duedateIcon} height={60} width={40} />
              <Box width='100%' pl='16px'>
                <Box display='flex' >
                  <Typography variant='h6' component='h2'>
                    {statusCount[0]?.closed_count}
                  </Typography>
                </Box>
                <Box display='flex' mt='4px' alignItems='center'>
                  <Typography
                    variant='h9'
                    color='textSecondary'
                    gutterBottom
                  >
                    <span >Closed</span>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card> */}
          <DashboardTile
                // {...props}
                title='Closed'
                icon={duedateIcon}
                value={statusCount[0]?.closed_count}
                currencyIcon={false}
                // secondaryText={spendingname === 0 ? "0" : spendingname}
            />
        </Grid>
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Card isDashboardCard={false} >
            <StatusPriority/>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
