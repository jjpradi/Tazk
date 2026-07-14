import React, {useState, useEffect, useRef} from 'react';
import {Card, Typography} from '@mui/material';
import MaterialTable, {MTablePagination, MTableToolbar} from 'utils/SafeMaterialTable';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import { headerStyle, cellStyle, pageSize } from 'utils/pageSize';

export default function Gsttable({
  sales_items,
  sales_data,
  location_name,
  total,
  shipping_address,
  company_name,
  statusType
}) {
  // console.log("sales_items",sales_items)
  const [data, setData] = useState([]);
  const calculateSubTotal = (item) => {
    const itemTotal = item.item_unit_price * (item.actual_quantity || item.quantity);
    const totalQty = item.actual_quantity || 1;
    const cgst = item.cgst_tax_amount ?? 0 / totalQty;
    const sgst = item.sgst_tax_amount ?? 0 / totalQty;
    const igst =  item.igst_tax_amount ?? 0 / totalQty;
    const taxTotal = cgst + sgst + igst;
    const discount = Number(item?.discount ?? 0)  ?? 0
    return  Math.round(itemTotal + taxTotal - discount);
  };

  console.log("data",data)
  
  useEffect(() => {
    if(sales_items?.length > 0) {
      if(sales_items[0].is_serialized === 1 && statusType !== 1) {
        const rowsBySaleitems = () => {
          const rowData = []
    
            sales_items?.forEach((item) => {
            const soldLots = item.soldLots || []
            const returnLots = item.returnLots || []
            const orderedQty = item.actual_quantity || 0
            const returnedQty = item.return_quantity || 0
            const normalizedReturnedQty = Math.min(returnedQty, orderedQty)
            const nonSerialSoldQty = Math.max(orderedQty - normalizedReturnedQty, 0)
            const serialized = item.is_serialized

            if (serialized === 0) {
              rowData.push({
                ...item,
                actual_quantity: orderedQty,
                quantity: orderedQty,
                soldQuantity: nonSerialSoldQty,
                return_quantity: normalizedReturnedQty,
                lot_number: '',
                item_unit_price: Number(item.item_unit_price || 0).toFixed(2),
                sub_total: Math.round(calculateSubTotal(item))
              })
              return;
            }

            const max = Math.max(orderedQty, soldLots.length, returnedQty)
            // console.log("saasdad",max,orderedQty, soldLots.length, returnedQty)
            console.log('salesItemssss', item)
            for(let i = 0; i< max; i++) {
              const quantity = 1
              const itemUnitPrice = item.item_unit_price || 0
              const totalQty = item.actual_quantity || 1;
              const cgst = (item.cgst_tax_amount ?? 0) / totalQty;
              const sgst = (item.sgst_tax_amount ?? 0) / totalQty;
              const igst = (item.igst_tax_amount ?? 0) / totalQty;
              const discount = Number(item.discount ?? 0) 
               const subTotal = item.dc_id ? (item.total/item.actual_quantity)   : (itemUnitPrice * quantity) + cgst + sgst + igst - discount;
               const invoice_quantity = (item.invoice_quantity ?? 0) - i
              rowData.push({
                ...item,
                cgst_tax_amount : cgst,
                sgst_tax_amount : sgst,
                igst_tax_amount : igst,
                actual_quantity : i < orderedQty ? 1 : 0,
                quantity : 1, 
                soldQuantity : item.dc_id
                  ? (invoice_quantity > 0 ? 1 : 0)
                  : serialized === 1
                  ? (i < soldLots.length ? 1 : 0)
                  : (i < nonSerialSoldQty ? 1 : 0),
                return_quantity : soldLots.length > 0
                  ? (soldLots[i]?.is_returned ? 1 : 0)
                  : (i < normalizedReturnedQty ? 1 : 0),
                lot_number: returnLots[i]?.lot_number?.toString() ?? soldLots[i]?.lot_number?.toString() ?? '',
                item_unit_price: itemUnitPrice.toFixed(2),
                sub_total : Math.round(subTotal.toFixed(2))
              })
            }
          })
          // console.log("rowData",rowData)
          setData(rowData)
        }
        rowsBySaleitems()
      }
      else if (statusType === 1) {
        const updatedData = sales_items.map(item => ({
          ...item,
          soldQuantity: item.order_id ? (item.soldQty || 0) : 0
        }))
        setData(updatedData)
      }

      else {
          const rowsBySaleitems = () => {
          const rowData = []
    
         sales_items?.forEach((item) => {
            const soldLots = item.soldLots || []
            const returnLots = item.returnLots || []
            const orderedQty = item.actual_quantity || 0
            const returnedQty = item.return_quantity || 0
            const normalizedReturnedQty = Math.min(returnedQty, orderedQty)
            const nonSerialSoldQty = Math.max(orderedQty - normalizedReturnedQty, 0)
            const serialized = item.is_serialized

            if (serialized === 0) {
              rowData.push({
                ...item,
                actual_quantity: orderedQty,
                quantity: orderedQty,
                soldQuantity: nonSerialSoldQty,
                return_quantity: normalizedReturnedQty,
                lot_number: '',
                item_unit_price: Number(item.item_unit_price || 0).toFixed(2),
                sub_total: Math.round(calculateSubTotal(item))
              })
              return;
            }

            const max = Math.max(orderedQty, soldLots.length, returnedQty)
            // console.log("orderedQty, soldLots.length, returnedQty",orderedQty, soldLots.length, returnedQty)
            for(let i = 0; i< max; i++) {
              const quantity = 1
              
              const itemUnitPrice = item.item_unit_price || 0
              const totalQty = item.actual_quantity || 1;
              const cgst = (item.cgst_tax_amount ?? 0) / totalQty;
              const sgst = (item.sgst_tax_amount ?? 0) / totalQty;
              const igst = (item.igst_tax_amount ?? 0) / totalQty;
              const discount = Number(item.discount ?? 0) 
              const subTotal = item.dc_id ? (item.total/item.actual_quantity)  : (itemUnitPrice * quantity) + cgst + sgst + igst - discount;
              const invoice_quantity = (item.invoice_quantity ?? 0) - i
              //console.log(item.dc_id,invoice_quantity, 'dcID')
              rowData.push({
                ...item,
                cgst_tax_amount: cgst,
                sgst_tax_amount: sgst,
                igst_tax_amount: igst,
                actual_quantity : i < orderedQty ? 1 : 0,
                quantity : 1, 
                soldQuantity : item.dc_id
                  ? (invoice_quantity > 0 ? 1 : 0)
                  : serialized === 1
                  ? (i < soldLots.length ? 1 : 0)
                  : (i < nonSerialSoldQty ? 1 : 0),
                 return_quantity : soldLots.length > 0
                   ? (soldLots[i]?.is_returned ? 1 : 0)
                   : (i < normalizedReturnedQty ? 1 : 0),
                 lot_number: returnLots[i]?.lot_number?.toString() ?? soldLots[i]?.lot_number?.toString() ?? '',
                item_unit_price: itemUnitPrice.toFixed(2),
               sub_total : Math.round(subTotal.toFixed(2))
              })
            }
          })
          setData(rowData)
        }
        rowsBySaleitems()
      }
    }
  }, [sales_items, statusType])
  
  const finalTotal = sales_items?.reduce((acc, item) => {
  // if (item.dc_id) {
  //   return acc + (item.total ?? 0); 
  // } else {
    return acc + calculateSubTotal(item); 
  // }
}, 0);

const hasDcId = sales_items?.some(item => item.dc_id);

const tcs = sales_data?.tcs ?? 0;
const tds = sales_data?.tds ?? 0;

const grandTotal = hasDcId ? finalTotal :Math.round(finalTotal + tcs - tds);
// console.log("finalTotal",finalTotal)


const baseColumns = [
  { field: 'name', title: 'Item' },
  { field: 'description', title: 'Description' },
  { field: 'model', title: 'Model' },
  { field: 'actual_quantity', title: 'Ordered Qty' },
  { field: 'soldQuantity', title: 'Sold Qty' },
  {
    field: 'return_quantity',
    title: 'Return Qty',
  },
  {
    field: 'lot_number',
    title: 'Lot Number',
    render: (rowData) => <span>{rowData.lot_number}</span>
  },
  {
    field: 'item_unit_price',
    title: 'Selling Price',
    align: 'right',
    cellStyle: { textAlign: 'right', paddingRight: '10px' },
    render: (row) => <div>{row.item_unit_price}</div>
  },
  {
    field: 'sub_total',
    title: 'Sub Total',
    align: 'right',
    cellStyle: { textAlign: 'right', paddingRight: '10px' },
    render: (row) => {
      // if (row.dc_id) {
      //    return <div>{Math.round(row.sub_total)}</div>;
      // }

      const itemTotal = row.item_unit_price * row.actual_quantity;
      const totalQty = row.actual_quantity || 1;
      const cgst = row.cgst_tax_amount ?? 0 / totalQty;
      const sgst = row.sgst_tax_amount ?? 0 / totalQty;
      const igst =  row.igst_tax_amount ?? 0 / totalQty;
      const discount = Number(row.discount ?? 0) 
      const subtotal = itemTotal + cgst + sgst + igst - discount ;

      return <div>{Math.round(subtotal)}</div>;
    }
  }
];


const hasOrderId = data?.some(item => item.order_id);


const filteredColumns = hasOrderId
  ? baseColumns.filter(col => col.field !== 'return_quantity' && col.field !== 'lot_number')
  : baseColumns;



  return (
    // <Card sx={{
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

    // // "&::-webkit-scrollbar-thumb": {
    // //   background: "#B2B2B2",
    // //   borderRadius: 2,
    // // },

    // // "&::-webkit-scrollbar-thumb:hover": {
    // //   background: "#999",
    // // }
    // }}
    <Card>
      <MaterialTable
        style={{height:'100% ' , overflow: 'auto'}}
        options={{
          showTitle: false,
          toolbar: true,
          search : false,
          pageSizeOptions: [20, 50, 100],
          headerStyle: { ...headerStyle, backgroundColor: '#F4F7FE' },
          cellStyle: cellStyle,
          exportButton: true,
          exportMenu: [
            {
              label: 'Export PDF',
              exportFunc: (cols, datas) => {
                const addedColumns = [{title: 'Customer Name', field: 'customer_name'}, ...cols]
                const formattedData = data.map((item) => ({
               customer_name: company_name,
               ...item,
               sub_total: item.dc_id
               ? Math.round(item.sub_total)
              : calculateSubTotal(item) 
              }));
                ExportPdf(addedColumns, formattedData, 'Invoices')
              },
            },
            {
              label: 'Export CSV',
              exportFunc: (cols, datas) => {
                const addedColumns = [{title: 'Customer Name', field: 'customer_name'}, ...cols]
                const formattedData = data.map((data) => ({customer_name: company_name, ...data, lot_number: `="${data.lot_number}"`}))
                ExportCsv(addedColumns, formattedData, 'Invoices')
              },
            },
          ],
        }}
        columns={filteredColumns}
        data={data}
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
                <Typography>Party Name: {company_name}</Typography>
                <Typography>Billing Address: {location_name}</Typography>
              </div>
              <Typography ml='auto'>
                Shipping Address : {shipping_address}
              </Typography>
              <MTableToolbar {...props} />
            </div>
          ),
          Pagination: (props) => (
            <div style={{display: 'flex', alignItems: 'center'}}>
              <div style={{display: 'flex'}}>
                <MTablePagination {...props} />
              </div>
              <div style={{marginLeft: 'auto', marginRight: 20}}>
              <Typography>Total: {grandTotal?.toFixed(2)}</Typography>
              </div>
            </div>
          ),
        }}
      />
    </Card>
  );
}

