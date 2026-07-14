// import * as React from 'react';
import React, {useRef, useEffect, useContext} from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Table from './Table';
import PSummaryTable from './PaymentSummary/Table';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import CashBoxSummary from './cashBoxSummary';
import Badge from '@mui/material/Badge';
import SyncIcon from '@mui/icons-material/Sync';
import {
  listCashBoxSummary,
  listCashBoxDenominationAction,
  listSessionBasedCashBoxSummary,
} from '../../../redux/actions/cash_box_actions';
import {useDispatch, useSelector} from 'react-redux';
import context from '../../../context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';


function TabPanel(props) {
  const {children, value, index, ...other} = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs({
  Tdata,
  PSData,
  isnet,
  posId,
  s_id,
  checkOfflines,
  lastSyncUpdate,
  pos_session,
  active,
}) {
  const dispatch = useDispatch();
  const [value, setValue] = React.useState(0);
  const [lastSync, setlastSync] = React.useState('');
  const [cash_box_id, setCashBoxId] = React.useState('');
  const tempinitsform = useRef(null);
  const {
    cashBoxReducer: {cash_box_denomination},
    posCreationReducer: {pos_creation},
  } = useSelector((store) => store);
  const tempinitsformVal = useRef(null);

  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    allData,
    headerLocationId,
    commoncookie,
  } = useContext(context);

  // React.useEffect(()=>{
  // const get = pos_session.find(d=> d.id === s_id)
  // setlastSync(get.lastSync)
  // },[pos_session])

  const initsform = () => {
    const get = pos_session.find((d) => d.id === s_id);
    setlastSync(get?.lastSync);
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(listCashBoxDenominationAction())
    );
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();
  }, [pos_session]);

  const initsformVal = () => {
    const cashBox = pos_creation.filter((f) => f.posId === posId);
    const cashBoxId = cashBox.length > 0 ? cashBox[0].cashBox : null;
    if (cashBoxId !== null && cash_box_id === '') {
      setCashBoxId(cashBoxId);
      if (active === 'A') {
        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(listCashBoxSummary(cashBoxId))
        );
      } else {
        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(listSessionBasedCashBoxSummary(s_id))
        );
      }
    }
  };
  tempinitsformVal.current = initsformVal;
  useEffect(() => {
    tempinitsformVal.current();
  }, [cash_box_denomination]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };


  return (
    <Box sx={{width: '100%'}}>
      {/* <Box sx={{ borderBottom: 1, borderColor: 'divider' }}> */}
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label='basic tabs example'
      >
        <Tab label='Payment Summary' {...a11yProps(0)} />
        <Tab label='Order Summary' {...a11yProps(1)} />
        <Tab label='CashBox Summary' {...a11yProps(2)} />
        <div style={{margin: 'auto 0 auto auto', display: 'flex'}}>
          <Typography marginRight='10px'>
            {lastSync ? `Last Synced: ${lastSync}` : ''}
          </Typography>
          <Badge
            variant={checkOfflines(posId) ? 'dot' : 'standard'}
            color='primary'
          >
            <SyncIcon
              onClick={() => lastSyncUpdate(posId, s_id)}
              sx={{cursor: 'pointer'}}
              color='action'
            />
          </Badge>
        </div>
        <div style={{margin: 'auto 0 auto auto'}}>
          {isnet ? (
            <Chip
              icon={<CheckIcon fontSize='small' />}
              label='online'
              color='success'
              variant='outlined'
            />
          ) : (
            <Chip
              icon={<CloseIcon fontSize='small' />}
              label='offline'
              color='error'
              variant='outlined'
            />
          )}
        </div>
      </Tabs>
      {/* </Box> */}
      <TabPanel value={value} index={0}>
        <PSummaryTable PSData={PSData} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Table Tdata={Tdata} />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <CashBoxSummary posId={posId} s_id={s_id} active={active} />
      </TabPanel>
    </Box>
  );
}
