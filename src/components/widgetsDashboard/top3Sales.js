import MaterialTable from 'utils/SafeMaterialTable';
import {Grid, Typography} from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle } from 'utils/pageSize';


export default function Top3Sales() {
  const {
    salesManReducer: {salesManSaleDetails},
  } = useSelector((state) => state);
  return (
    <Grid
      sx={{pt:'0px'}}
      size={{
        lg: 12,
        md: 12,
        sm: 12,
        xs: 12
      }}>
      <MaterialTable
        style={{padding: '0px 20px 20px 20px', minHeight: '400px' , borderRadius:'15px'}}
        options={{
          headerStyle,
          cellStyle,
          search: false,
          paging: false,
          exportButton: false,
          // maxBodyHeight: '30vh',
          filtering: false,
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
          },
          {
            title: 'Days',
            field: 'days',
          },
        ]}
        data={salesManSaleDetails.topSale}
        title={
          <Typography variant='h6'>
            Top 3 Sales
          </Typography>
        }
      />
    </Grid>
  );
}

