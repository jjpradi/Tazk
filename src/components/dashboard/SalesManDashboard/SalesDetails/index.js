import React, { useState, useEffect, useContext } from 'react';
import { Grid, CardContent, Typography, Card, useMediaQuery } from '@mui/material';
import AddchartIcon from '@mui/icons-material/Addchart';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import SpeakerNotesIcon from '@mui/icons-material/SpeakerNotes';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import CreateNewButtonContext from '../../../../context/CreateNewButtonContext';
import MaterialTable from 'utils/SafeMaterialTable';
import { getSalesManSaleDetailsAction } from '../../../../redux/actions/salesMan_action';
import Cookies from 'universal-cookie';
import PeopleIcon from '@mui/icons-material/People';
import Cards from '../../../dynamicCards/index';
import currentsaleIcon from '../../../../assets/dashboardIcons/rupee.svg';
import targetsaleIcon from '../../../../assets/dashboardIcons/deadline.svg';
import customerIcon from '../../../../assets/dashboardIcons/icon_visits.png';
import custIcon from '../../../../assets/dashboardIcons/customer.svg'
import Smallcards from 'components/dynamicCards/smallcards';
import { color } from '@mui/system';
import apiCalls from 'utils/apiCalls';
import { getsessionStorage } from 'pages/common/login/cookies';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle } from 'utils/pageSize';
import DashboardTile from 'components/DashboardTile';

const SalesDetails = (props) => {
  const {type}=props
  const matches = useMediaQuery((theme) => theme.breakpoints.up('2560'))
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(CreateNewButtonContext);
  const dispatch = useDispatch();
  const [date, setDate] = useState(new Date().getDate());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthList, setMonthList] = useState([]);
  // const cookies = new Cookies();
  let storage = getsessionStorage()
  const empId = storage?.employee_id || '';
  const {
    salesManReducer: { salesManSaleDetails },
  } = useSelector((state) => state);

  useEffect(() => {
    if (props.inView) {
          const employeeId = type === 'dashboard' ? storage?.employee_id : props.rowIndex.employee_id;
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(getSalesManSaleDetailsAction(employeeId,headerLocationId,{ month, year, employee_id: employeeId }, setModalTypeHandler, setLoaderStatusHandler))
      );
    }

  }, [props.inView]);


  return (
    <>
      <Grid  container spacing={3} display='flex' flexDirection='row'>
        <Grid
          size={{
            lg: 2.4,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <DashboardTile
            icon={currentsaleIcon}
            value={salesManSaleDetails?.totalSale === null || salesManSaleDetails?.totalSale === undefined ? "0.00" : (salesManSaleDetails?.totalSale.toFixed(2)).toLocaleString()}
            title="Current Sale"
            fontSize={headerStyle.fontSize}
          />

        </Grid>
        <Grid
          size={{
            lg: 2.4,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <DashboardTile
            icon={targetsaleIcon}
            title="Target Sale"
            fontSize={headerStyle.fontSize}
          />

        </Grid>
        <Grid
          size={{
            lg: 2.4,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <DashboardTile
            icon={customerIcon}
            value={salesManSaleDetails?.billedCount?.toLocaleString()}
            title="No.of Billed Customers"
            fontSize={headerStyle.fontSize}
          />
        </Grid>
        <Grid
          size={{
            lg: 2.4,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <DashboardTile
            icon={custIcon}
            value={salesManSaleDetails?.UnbilledCount?.toLocaleString()}
            title="No.of UnBilled Customers"
            fontSize={headerStyle.fontSize}
          />
        </Grid>

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <MaterialTable
                style={{ padding: '0px 20px 20px 20px', minHeight: '40vh' }}
                options={{
                  headerStyle,
                  cellStyle,
                  search: false,
                  paging: false,
                  exportButton: false,
                  filtering: false,
                  pageSize: 5,
                  // maxBodyHeight: '60vh',
                  actionsColumnIndex: -1,
                  rowStyle: (rowData, index) => ({
                    backgroundColor: index % 2 === 0 ? '#f5feff' : '',
                  }),
                }}

                // aa
                columns={[
                  {
                    title: 'Customer Name',
                    field: 'customer_name',
                  },
                  {
                    title: 'Invoice Date',
                    field: 'invoice_date',
                    type: 'date',
                  },
                  {
                    title: 'Invoice Amount',
                    field: 'invoice_amt',
                    render: (rowData) => (
                      <div
                        style={{
                          textAlign: 'right',
                          minWidth: '60px',
                          maxWidth: '80px',
                          width: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {rowData.invoice_amt.toFixed(2)}
                      </div>
                    )
                  },
                  {
                    title: 'Days',
                    field: 'days',
                  },
                ]}
                data={salesManSaleDetails.topSale}
                title={<h3 style={{fontSize:headerStyle.fontSize,fontWeight:headerStyle.fontWeight}}>Top 5 Sales</h3>}
              />
            </Grid>
          </Grid>
    </>
  );
};

export default SalesDetails;

