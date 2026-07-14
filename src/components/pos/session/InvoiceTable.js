import React, {useState, useEffect, useRef} from 'react';
import MaterialTable from 'utils/SafeMaterialTable';
import {ExportCsv, ExportPdf} from '@material-table/exporters';

export default function Gsttable({sales_items}) {
  const [Tdata, setTdata] = useState([]);
  const tempinitsform = useRef(null);

  const singleTax = (qty, cost, tax, dis) => {
    const val = (qty || 1) * cost - (((qty || 1) * cost) / 100) * (dis || 0);
    const taxval = (val / 100) * tax;
    return (taxval + val).toFixed(2);
  };

  // useEffect(() => {
  //     const arr = sales_items.map(d => {
  //         const { name, delivered_qty, item_unit_price, discount, sales_item_taxes: { percent } } = d
  //         return {
  //             name,
  //             unit_price: singleTax(delivered_qty, item_unit_price, percent, discount),
  //         }
  //     })
  //     setTdata(arr)
  // }, [])

  const initsform = () => {
    const arr = sales_items.map((d) => {
      const {
        name,
        delivered_qty,
        item_unit_price,
        discount,
        sales_item_taxes: {percent},
      } = d;
      return {
        name,
        unit_price: singleTax(
          delivered_qty,
          item_unit_price,
          percent,
          discount,
        ),
      };
    });
    setTdata(arr);
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();
  }, []);

  return (
    <>
      <MaterialTable
        options={{
          headerStyle: {
            fontSize: 15
          },
          minBodyHeight: Tdata.length > 4 ? 200 : "auto",
          maxBodyHeight: Tdata.length > 4 ? 300 : "auto",
          showTitle: false,
          paging: Tdata.length > 6 ? true : false,
          toolbar: false,
          pageSize: 20,
          pageSizeOptions: [20, 50, 100],
          exportButton: true,
          exportMenu: [
            {
              label: 'Export PDF',
              exportFunc: (cols, datas) =>
                ExportPdf(cols, datas, 'InvoiceTable'),
            },
            {
              label: 'Export CSV',
              exportFunc: (cols, datas) =>
                ExportCsv(cols, datas, 'InvoiceTable'),
            },
          ],
        }}
        columns={[
          {
            field: 'name',
            title: 'Product name',
            width: '70%',
          },
          {
            field: 'unit_price',
            title: 'Unit price',
            width: '30%',
          },
        ]}
        data={Tdata}
      />
    </>
  );
}

