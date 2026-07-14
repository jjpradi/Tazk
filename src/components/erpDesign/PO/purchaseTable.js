import React, {useState, useEffect, useRef} from 'react';
import {Card, Typography} from '@mui/material';
import MaterialTable, {MTablePagination} from 'utils/SafeMaterialTable';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle,font14_500 } from 'utils/pageSize';
import { getsessionStorage } from '../../../pages/common/login/cookies'


export default function Gsttable({
  receivings_items,
  location_name,
  total,
  shipping_address,
  company_name,
  invoiceNumber
}) {
  const [Tdata, setTdata] = useState([]);
  
const session = getsessionStorage();


 function singleTax(price = 0, qty = 1, data) {
  const sgst = parseFloat(data.sgst_tax_amount) || 0;
  const cgst = parseFloat(data.cgst_tax_amount) || 0;
  const igst = parseFloat(data.igst_tax_amount) || 0;


  return qty * price + (sgst + cgst + igst);
}

const totalamt = receivings_items?.reduce((sum, item) => {
  const qty = item.received_quantity === 0 
    ? item.ordered_quantity 
    : item.received_quantity;

  return sum + singleTax(item.item_cost_price, qty, item);
}, 0);

const grandTotal = session?.applyRoundoff === true
  ? Math.round(totalamt)
  : parseFloat(totalamt?.toFixed(2));

  function getIgst (data) {
    let tax = '';

    if (data.taxes) {
      data.taxes.forEach((t) => {
        if (t.tax_group === 'IGST') {
          tax = t.tax_rate;
        }
      });
    }
    return tax;
  };

console.log("egergergergfergferfer");

  return (
    <>
      <Card 
    //   sx={{
    //   boxShadow: `0px 12px 23px #979DA9`, height: '400px', overflow: 'auto', ':hover': { boxShadow: `0px 12px 23px #ADD8E6` },
    //   "&::-webkit-scrollbar": {
    //   width: 10,
    // },

    // "&::-webkit-scrollbar-track": {
    //   // boxShadow: "inset 0 0 5px black",
    //   borderRadius: 2,
    //   marginTop: '20px',
    //   marginBottom: '20px',
    // },
 
    // "&::-webkit-scrollbar-thumb": {
    //   background: "#B2B2B2",
    //   borderRadius: 2,
    // },

    // "&::-webkit-scrollbar-thumb:hover": {
    //   background: "#999",
    // }}}
    >
        <MaterialTable
          style={{height:'100% ', overflow:'auto'}}
        options={{
          headerStyle: { ...headerStyle, backgroundColor: '#F4F7FE' },
          cellStyle,
          showTitle: false,
          toolbar: false,
          search : false,
          // paging: Tdata.length > 4 ? true : false,
          // pageSize: pageSize,
          pageSizeOptions: [20, 50, 100],
          exportButton: true,
          exportMenu: [
            {
              label: 'Export PDF',
              exportFunc: (cols, datas) => ExportPdf(cols, datas, 'PurchasePO'),
            },
            {
              label: 'Export CSV',
              exportFunc: (cols, datas) => ExportCsv(cols, datas, 'PurchasePO'),
            },
          ],
        }}
        columns={[
          ...(invoiceNumber !== '' && invoiceNumber !== null ? [
            {
              title: 'Invoice Number',
              field: 'invoice_number',
              render:(row) => <div>{invoiceNumber}</div>
            }
          ] : []),
          {
            field: 'name',
            title: 'Item',
          },
          {
            field: 'description',
            title: 'Description',
          },
          {
            field: 'model',
            title: 'Modal',
          },
          {
            field: 'ordered_quantity',
            title: 'Ordered Qty',
          },
          {
            field: 'received_quantity',
            title: 'Received Qty',
          },
          {
            field: 'return_quantity',
            title: 'Return Qty',
          },
          {
            field: 'item_cost_price',
            title: 'Cost',
            // align: 'right', 
            // cellStyle:{fontSize:cellStyle.fontSize,fontWeight:cellStyle.fontWeight,textAlign: 'right'},
            render:(row) => (
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
                {row.item_cost_price?.toFixed(2)}
              </div>
            )
          },
          {
            field: 'sub_total',
            title: 'Sub Total',
            align: 'right', 
            cellStyle:{fontSize:cellStyle.fontSize,fontWeight:cellStyle.fontWeight, textAlign: 'right', paddingRight:'10px'},
            render: (rowData) => {
               const value = singleTax(
                  rowData.item_cost_price,
                  rowData.received_quantity == 0 ? rowData.ordered_quantity : rowData.received_quantity,
                  rowData
                );
            const roundedValue = Math.round(value * 100) / 100;
              return (
                <div style={{ textAlign: 'left', direction: 'rtl', display: 'flex' }}>
                  {roundedValue.toFixed(2)}
                </div>
              );
            },
          },
        ]}
        data={receivings_items}
        components={{
          Toolbar: (props) => (
            <div
              style={{
                display: 'flex',
                width: '100%',
                padding: '20px 20px 10px 20px',
              }}
            >
              <div>
                <Typography>Vendor Name: {company_name}</Typography>
                <Typography>Billing Address: {location_name}</Typography>
              </div>
              <Typography ml='auto'>
                Shipping Address : {shipping_address}
              </Typography>
            </div>
          ),
          Pagination: (props) => (
            <div style={{display: 'flex', alignItems: 'center'}}>
              <div style={{display: 'flex'}}>
                <MTablePagination {...props} />
              </div>
              <div style={{marginLeft: 'auto', marginRight: 20}}>
                <Typography>
                  Total:{grandTotal}
                </Typography>
              </div>
            </div>
          ),
        }}
      />
      </Card>
    </>
  );
}

