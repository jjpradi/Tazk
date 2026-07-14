import MaterialTable from 'utils/SafeMaterialTable'
import { Card, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { getsessionStorage } from 'pages/common/login/cookies';
import React, { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import context from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import { getProductPurchaseHistoryAction } from 'redux/actions/purchase_actions';
import dayjs from 'dayjs';
import { getAllProductSalesHistoryAction } from 'redux/actions/sales_actions';

function PurchaseHistory(props) {
    const storage = getsessionStorage()
    const dispatch = useDispatch();
    const {
        setLoaderStatusHandler,
        setModalStatusHandler,
        setModalTypeHandler,
        commoncookie,
    } = useContext(context);

    const { salesReducer: { getAllProductSalesHistory },
        purchasesReducer: { getProductPurchaseHistory }
    } = useSelector(state => state)

    useEffect(() => {
        const data = {
            item_id: props.item_id
        }
        dispatch(getProductPurchaseHistoryAction(
            props.item_id,
            commoncookie,
            setModalTypeHandler,
            setLoaderStatusHandler
        ));

        dispatch(getAllProductSalesHistoryAction(data));
    }, [ props.item_id ]);

  return (
    <Card
      sx={{
        borderTop: '1px solid #d3d3d3',
        borderLeft: '1px solid #d3d3d3',
        borderRight: '1px solid #d3d3d3',
        padding: 2,
        maxHeight: '500vh',
        overflow: 'auto'
      }}
    >
      <Typography variant="h6" align="center" gutterBottom>
        Standard Buying and Selling Rates
      </Typography>
      <Typography variant="subtitle1" align="center" gutterBottom>
        Stock Item:{getProductPurchaseHistory[0]?.productName}
      </Typography>
      <Grid container spacing={2}>
        {/* Standard Cost Table */}
        <Grid
          size={{
            xs: 12,
            md: 6
          }}>
          <Typography variant="subtitle2" align="center" gutterBottom>
            Standard Cost
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Applicable From</TableCell>
                  <TableCell align="center">Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getProductPurchaseHistory.map((item, index) => (
                <TableRow key={item.item_id || index}>
                  <TableCell align="center">{item.invoice_date ? dayjs(item.invoice_date).format("DD/MM/YYYY") : "-"}</TableCell>
                  <TableCell align="center">{item.item_cost_price}</TableCell>
                </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Standard Selling Price Table */}
        <Grid
          size={{
            xs: 12,
            md: 6
          }}>
          <Typography variant="subtitle2" align="center" gutterBottom>
            Standard Selling Price
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Applicable From</TableCell>
                  <TableCell align="center">Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getAllProductSalesHistory.map((item, index) => (
                <TableRow key={item.item_id || index}>
                  <TableCell align="center">{item.invoice_date ? dayjs(item.invoice_date).format("DD/MM/YYYY") : "-"}</TableCell>
                  <TableCell align="center">{item.item_unit_price}</TableCell>
                </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Card>
  );
}

export default PurchaseHistory;
