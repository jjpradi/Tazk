import React from 'react';
import MaterialTable from 'utils/SafeMaterialTable';
import PaymentPopup from './PaymentPopup';
import InvoicePopup from './InvoicePopup';
import {Card, Typography} from '@mui/material';
import CardContent from '@mui/material/CardContent';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle } from 'utils/pageSize';


export default function Gsttable({Tdata, OrderClick}) {
  return (
    <>
      {/* <div style={{minWidth:'60vw', minHeight:'28vh'}}> */}
      {OrderClick === true ? (
        <Card
          sx={{
            minWidth: '60vw',
            minHeight: OrderClick === true ? '20vh' : '44vh',
          }}
        >
          <Typography
            variant='h9'
            gutterBottom
            component='h2'
            style={{paddingLeft: '20px'}}
          >
            ORDER SUMMARY
          </Typography>

          <CardContent>
            <MaterialTable
              options={{
                headerStyle,
                cellStyle,
                showTitle: false,
                toolbar: false,
                // pageSize: Tdata.length,
                paging: false,
                exportButton: true,
                exportMenu: [
                  {
                    label: 'Export PDF',
                    exportFunc: (cols, datas) =>
                      ExportPdf(cols, datas, 'OrderSummary'),
                  },
                  {
                    label: 'Export CSV',
                    exportFunc: (cols, datas) =>
                      ExportCsv(cols, datas, 'OrderSummary'),
                  },
                ],
              }}
              columns={[
                // { title: 'Sales Order', field: 'sales_order' },
                {title: 'Customer Name', field: 'customer_name'},
                {
                  title: 'Invoice',
                  field: 'invoice_number',
                  render: (params) => <InvoicePopup params={params} />,
                },
                {
                  title: 'Payment Types',
                  field: 'payment_type',
                  render: (params) => <PaymentPopup params={params} />,
                },
                {title: 'Total Products', field: 'total_products'},
                {title: 'Amount', field: 'amount'},
              ]}
              data={Tdata}
            />
          </CardContent>
        </Card>
      ) : (
        <div style={{minWidth: '60vw', minHeight: '28vh'}}>
          <MaterialTable
            options={{
              paging : false,
              headerStyle,
              cellStyle,
              showTitle: false,
              toolbar: false,
              pageSize: 5,
              exportButton: true,
              maxBodyHeight : '37vh',
              minBodyHeight : '37vh',
              exportMenu: [
                {
                  label: 'Export PDF',
                  exportFunc: (cols, datas) =>
                    ExportPdf(cols, datas, 'OrderSummary'),
                },
                {
                  label: 'Export CSV',
                  exportFunc: (cols, datas) =>
                    ExportCsv(cols, datas, 'OrderSummary'),
                },
              ],
            }}
            columns={[
              // { title: 'Sales Order', field: 'sales_order' },
              {title: 'Customer Name', field: 'customer_name',width:300 },
              {
                title: 'Invoice',
                field: 'invoice_number',
                width:300,
                render: (params) => <InvoicePopup params={params} />,
              },
              {
                title: 'Payment Types',
                field: 'payment_type',
                cellStyle:{
                  textAlign:'left',
                  // fontSize:cellStyle.fontSize,
                  paddingLeft:60
  
                },
                
                width:300,
                render: (params) => <PaymentPopup params={params} />,
              },
              {title: 'Total Products', field: 'total_products',
              width:300,
              cellStyle:{
                textAlign:'center',
                fontSize:cellStyle.fontSize,
                // paddingLeft:70

              },
            },
              {title: 'Amount', field: 'amount',
            cellStyle:{
              textAlign:'right',
              fontSize:cellStyle.fontSize,
              paddingRight:42

            },
          },
            ]}
            data={Tdata}
          />
        </div>
      )}
      {/* </div> */}
    </>
  );
}

