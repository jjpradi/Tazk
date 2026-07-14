import React from 'react';
import MaterialTable from 'utils/SafeMaterialTable';
import {Card, Typography} from '@mui/material';
import CardContent from '@mui/material/CardContent';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
// import Link from '@mui/material/Link';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle } from 'utils/pageSize';


export default function Gsttable({PSData, Click, setClick}) {
  return (
    <>
      {/* <div style={{minWidth:'60vw', minHeight:'28vh'}}> */}
      {Click === true ? (
        <d
          sx={{minWidth: '0vw', minHeight: Click === true ? '20vh' : '44vh'}}
        >
          <Typography
            variant='h6'
            gutterBottom
            component='h2'
            style={{paddingLeft: '20px', paddingTop: '14px'}}
          >
            PAYMENT SUMMARY
          </Typography>

          <CardContent>
            <MaterialTable
              options={{
                headerStyle,
                cellStyle,
                showTitle: false,
                toolbar: false,
                // pageSize: PSData.length,
                paging: false,
                exportButton: true,
                exportMenu: [
                  {
                    label: 'Export PDF',
                    exportFunc: (cols, datas) =>
                      ExportPdf(cols, datas, 'PaymentSummary'),
                  },
                  {
                    label: 'Export CSV',
                    exportFunc: (cols, datas) =>
                      ExportCsv(cols, datas, 'PaymentSummary'),
                  },
                ],
              }}
              columns={[
                {
                  field: 'payment_type',
                  title: 'Payment type',
                },
                {
                  field: 'payment_amount',
                  title: 'Collected',
                  render:(rowData)=>{
                    return parseFloat(Number(rowData.payment_amount).toFixed(2));
                  }
                },
              ]}
              data={PSData}
            />
          </CardContent>
        </d>
      ) : (
        <div style={{minWidth: '60vw', minHeight: '28vh'}}>
          <MaterialTable
            options={{
              paging : false,
              headerStyle,
              cellStyle,
              showTitle: false,
              toolbar: false,
              pageSize: 4,
              exportButton: true,
              maxBodyHeight : '37vh',
              minBodyHeight : '37vh',
              exportMenu: [
                {
                  label: 'Export PDF',
                  exportFunc: (cols, datas) =>
                    ExportPdf(cols, datas, 'PaymentSummary'),
                },
                {
                  label: 'Export CSV',
                  exportFunc: (cols, datas) =>
                    ExportCsv(cols, datas, 'PaymentSummary'),
                },
              ],
            }}
            columns={[
              {
                field: 'payment_type',
                title: 'Payment Type',
              },
              {
                field: 'payment_amount',
                title: 'Collected',
              },
            ]}
            data={PSData}
          />
        </div>
      )}
      {/* </div> */}
    </>
  );
}

