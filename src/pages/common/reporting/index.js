import React, {useState, useContext, useRef} from 'react';
import Sales from '../../sales/sales/sales';
import {
  Select,
  FormControl,
  MenuItem,
  InputLabel,
  Grid,
  Button,
  Typography,
} from '@mui/material';
// import NewReport from './NewReport';
// import './index.css';
import {useSelector, useDispatch} from 'react-redux';
import Product from '../../sales/product';
import {viewReportsAction} from '../../../redux/actions/reports_actions';
import Customer from '../../sales/customer/index';
import Inventory from '../../sales/inventory';
import {useNavigate} from 'react-router-dom';
import {useEffect} from 'react';
import context from '../../../context/CreateNewButtonContext';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { font14_500 } from 'utils/pageSize';
import { titleURL } from 'http-common';
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

export const Reporting = (props) => {
  const storage = getsessionStorage();
  const dispatch = useDispatch();
  const history = useNavigate();
  const [type, setType] = useState('sales');
  const [pivoteVisible, setPivoteVisible] = useState(false);
  const {reports_view_data} = useSelector((state) => state.reportsReducer);
  const { menuAccess = {} } = useSelector((state) => state.rbacReducer);
  // const { product } = useSelector(state => state.productReducer)
  const {setModalTypeHandler, setLoaderStatusHandler} = useContext(context);
  const templist = useRef(null);
  

  const list = () => {
    if (reports_view_data.length === 0) {
      
      apiCalls(
        setModalTypeHandler, 
        setLoaderStatusHandler,
        dispatch(
          viewReportsAction(type, setModalTypeHandler, setLoaderStatusHandler),
        )
      );
    }
  };
  templist.current = list;
  useEffect(() => {
    templist.current();
  }, []);


  const reportingType = (type) => {
    switch (type) {
      case 'sales':
        return <Sales IconHidden={true}  reportExport={salesReportExport} />;
      case 'purchase':
        return <Product IconHidden={true} />;
      case 'payment':
        return <Sales IconHidden={true} />;
      case 'customer':
        return <Customer IconHidden={true} />;
      case 'inventory':
        return <Inventory />;

      default:
        return null;
    }
  };
  const handleSelect = async (type) => {
    await setType(type);
    //await history(`/${type}-reports`)
    
    apiCalls(
      setModalTypeHandler, 
      setLoaderStatusHandler,
      dispatch(
        viewReportsAction(type, setModalTypeHandler, setLoaderStatusHandler),
      )
    );
  };
  const selectedRole = storage?.role_name;
  const salesReportExport = UserRightsAuthorization(menuAccess[selectedRole],'reports__transactions__new_reports','can_export');
  return (
    <>
      <Helmet>
                 <meta charSet="utf-8" />
                 <title> {titleURL} | New Reports </title>
       </Helmet>
      <CreateNewButtonContext.Consumer>
        {({loaderStatus}) => (
          <div>
            
            {pivoteVisible === false ? (                
                <Grid container display= 'flex' alignItems= 'center'>
                  <Grid
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                    }}>
                  <Typography variant='h6' align='left' >
                  Generate Reporting
                </Typography>
                  </Grid>
                  <Grid
                    sx={{ pt: '20px' }}
                    size={{
                      xs: 6,
                      sm: 6,
                      md: 6,
                      lg: 6
                    }}>
                    <FormControl
                      fullWidth={true}
                      variant='filled'
                      component='fieldset'
                    >
                      <div style={{paddingBottom: '6px'}}>
                        <InputLabel> Select Report</InputLabel>
                      </div>
                      <Select
                        name='select report'
                        //variant='outlined'
                        fullWidth={true}
                        value={type}
                        onChange={(e) => handleSelect(e.target.value)}
                      >
                        <MenuItem value={'sales'}>Sales</MenuItem>
                        <MenuItem value={'purchase'}>Purchase</MenuItem>
                        <MenuItem value={'customer'}>Customer</MenuItem>
                        <MenuItem value={'inventory'}>Inventory</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {/* <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }}
                    item
                    align='end'
                  >
                    <Button
                      variant='contained'
                      style={{fontSize:font14_500.fontSize}}
                      color='primary'
                      onClick={() => {
                        setPivoteVisible(true);
                        history(`/${type}-reports`);
                      }}
                    >
                      generate
                    </Button>
                  </Grid> */}
                  <Grid
                    paddingTop='20px'
                    size={{
                      xs: 12,
                      sm: 12,
                      md: 12,
                      lg: 12
                    }}>
                  {reportingType(type)}
                </Grid>
                </Grid>
            ) : (
              ''
            )}

            {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
              {pivoteVisible && (
                <NewReport
                  reportData={reports_view_data.reports}
                  reportType={type}
                  visibleOption={setPivoteVisible}
                />
              )}
            </Grid> */}
          </div>
        )}
      </CreateNewButtonContext.Consumer>
    </>
  );
};
